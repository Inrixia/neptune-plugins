import { audioQualities, QualityMeta } from "../../../lib/AudioQuality";
import { downloadTrack, TrackOptions } from "../../../lib/download";
import { AudioQualityEnum, PlaybackContext } from "../../../lib/AudioQuality";

// @ts-expect-error Remove this when types are available
import { storage } from "@plugin";
import { store } from "@neptune";

import type meta from "music-metadata/lib/core";
import { ManifestMimeType } from "../../../lib/getPlaybackInfo";
import { IFormat } from "music-metadata/lib/type";

const { parseBuffer } = <typeof meta>require("music-metadata/lib/core");

type AudioInfo = IFormat;

const qualityCache = new Map<string, Promise<AudioInfo>>();
const getTrackInfo = ({ songId, desiredQuality }: TrackOptions): Promise<AudioInfo> => {
	const key = `${songId}-${desiredQuality}`;

	// If a promise for this key is already in the cache, await it
	if (qualityCache.has(key)) return qualityCache.get(key)!;

	qualityCache.set(
		key,
		(async (): Promise<AudioInfo> => {
			let totalBytes;
			const onProgress = ({ total }: { total: number }) => (totalBytes = total);
			const { buffer, manifestMimeType, manifest } = await downloadTrack({ songId, desiredQuality }, { bytesWanted: 43, onProgress });
			const { format } = await parseBuffer(buffer);

			let duration = format.duration;
			let bitrate = format.bitrate;
			switch (manifestMimeType) {
				case ManifestMimeType.Tidal: {
					if (totalBytes !== undefined && duration !== undefined) bitrate = (totalBytes / duration) * 8;
					break;
				}
				case ManifestMimeType.Dash: {
					duration = manifest.duration;
					bitrate = manifest.tracks.audios[0].bitrate.bps;
					break;
				}
			}

			return {
				...format,
				bitrate,
				duration,
			};
		})()
	);

	return qualityCache.get(key)!;
};

const rgbToRgba = (rgb: string, alpha: number) => rgb.replace("rgb", "rgba").replace(")", `, ${alpha})`);

const getQualityElements = () => {
	const qualitySelector = document.querySelector(`[data-test-media-state-indicator-streaming-quality]`);
	const qualityElement = <HTMLElement>qualitySelector?.firstChild;
	return { qualitySelector, qualityElement };
};

const flacInfoElem = document.createElement("span");
const removeElems = (qualitySelector: Element) => {
	if (qualitySelector.parentElement === null) return;
	const allElems = qualitySelector.parentElement.querySelectorAll(".bitInfo");
	// Remove to avoid buggy duplicates
	allElems.forEach((elem) => elem.remove());
};

export const setStreamQualityIndicator = async () => {
	const playbackContext = <PlaybackContext>store.getState().playbackControls.playbackContext;
	if (!playbackContext) return;

	const { qualitySelector, qualityElement } = getQualityElements();
	if (qualitySelector == null || qualityElement == null) return;

	const { actualAudioQuality, actualProductId } = playbackContext;

	switch (actualAudioQuality) {
		case AudioQualityEnum.MQA:
			qualityElement.style.color = QualityMeta["MQA"].color;
			break;
		default:
			qualityElement.style.color = "";
			break;
	}

	const invalidState = !audioQualities.includes(actualAudioQuality) || flacInfoElem === undefined || qualitySelector.parentElement === null;
	if (!storage.showFLACInfo || invalidState) return removeElems(qualitySelector);

	flacInfoElem.textContent = "";
	flacInfoElem.style.border = "";

	removeElems(qualitySelector);
	qualitySelector.parentElement.prepend(flacInfoElem);

	flacInfoElem.className = "bitInfo";
	flacInfoElem.style.maxWidth = "100px";
	flacInfoElem.style.textAlign = "center";
	flacInfoElem.style.padding = "4px";
	flacInfoElem.style.fontSize = "13px";
	flacInfoElem.style.borderRadius = "8px";

	flacInfoElem.style.color = "#cfcfcf";
	flacInfoElem.textContent = "Loading...";

	// Fix for grid spacing issues
	qualitySelector.parentElement.style.setProperty("grid-auto-columns", "auto");

	try {
		const { bitrate, bitsPerSample, sampleRate } = await getTrackInfo({ songId: actualProductId, desiredQuality: actualAudioQuality });

		flacInfoElem.textContent = "";
		if (sampleRate !== undefined) flacInfoElem.textContent += `${sampleRate / 1000}kHz `;
		if (bitsPerSample !== undefined) flacInfoElem.textContent += `${bitsPerSample}bit `;
		if (bitrate !== undefined) flacInfoElem.textContent += `${Math.floor(bitrate / 1000)}kb/s `;

		if (flacInfoElem.textContent.length === 0) flacInfoElem.textContent = "Unknown";

		const qualityElemColor = window.getComputedStyle(qualityElement).color;
		if (storage.showFLACInfoBorder) {
			flacInfoElem.style.border = `solid 1px ${rgbToRgba(qualityElemColor, 0.3)}`;
		}

		const progressBar = document.getElementById("progressBar");
		if (progressBar !== null) progressBar.style.color = qualityElemColor;
	} catch (err) {
		flacInfoElem.style.maxWidth = "256px";
		flacInfoElem.style.border = "solid 1px red";
		flacInfoElem.textContent = `Loading Info Failed - ${(<Error>err).message.substring(0, 64)}`;
	}
};
