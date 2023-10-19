import { QualityMeta, MediaMetadataQuality } from "../../../lib/AudioQuality";
import { downloadBytes } from "../../../lib/download";
import { PlaybackContextAudioQuality, PlaybackContext, validQualitiesSet } from "../../../lib/AudioQuality";

// @ts-expect-error Remove this when types are available
import { storage } from "@plugin";
import { store } from "@neptune";

import type meta from "music-metadata/lib/core";
import type { IFormat } from "music-metadata/lib/type";

const { parseBuffer } = <typeof meta>require("music-metadata/lib/core");

interface ExtendedFormat extends IFormat {
	totalBytes?: number;
	bitrate?: number;
}

const qualityCache = new Map();
const getFLACInfo = (id: number, quality: PlaybackContextAudioQuality) => {
	const key = `${id}-${quality}`;

	// If a promise for this key is already in the cache, await it
	if (qualityCache.has(key)) return qualityCache.get(key);

	qualityCache.set(
		key,
		(async () => {
			let totalBytes = -1;
			const onProgress = ({ total }: { total: number }) => (totalBytes = total);
			const bytes = await downloadBytes(id, quality, 0, 43, onProgress);
			const { format }: { format: ExtendedFormat } = await parseBuffer(bytes);

			if (totalBytes !== -1) format.totalBytes = totalBytes;
			if (format.duration) format.bitrate = (totalBytes / format.duration) * 8;
			return format;
		})()
	);

	return qualityCache.get(key);
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
		case PlaybackContextAudioQuality.MQA:
			qualityElement.style.color = QualityMeta[MediaMetadataQuality.MQA].color;
			break;
		default:
			qualityElement.style.color = "";
			break;
	}

	if (!storage.showFLACInfo) return removeElems(qualitySelector);

	if (storage.showFLACInfo && validQualitiesSet.has(actualAudioQuality) && flacInfoElem !== undefined && qualitySelector.parentElement !== null) {
		flacInfoElem.textContent = "";
		flacInfoElem.style.border = "";

		removeElems(qualitySelector);
		qualitySelector.parentElement.prepend(flacInfoElem);

		const { bitrate, bitsPerSample, sampleRate } = await getFLACInfo(actualProductId, actualAudioQuality);

		flacInfoElem.className = "bitInfo";
		flacInfoElem.textContent = `${bitsPerSample}bit ${sampleRate / 1000}kHz ${(bitrate / 1000).toFixed(0)}kb/s`;
		flacInfoElem.style.maxWidth = "100px";
		flacInfoElem.style.textAlign = "center";
		flacInfoElem.style.padding = "4px";
		flacInfoElem.style.color = "#cfcfcf";
		flacInfoElem.style.fontSize = "13px";

		const qualityElemColor = window.getComputedStyle(qualityElement).color;
		if (storage.showFLACInfoBorder) {
			flacInfoElem.style.borderRadius = "8px";
			flacInfoElem.style.border = `solid 1px ${rgbToRgba(qualityElemColor, 0.3)}`;
		}

		const progressBar = document.getElementById("progressBar");
		if (progressBar !== null) progressBar.style.color = qualityElemColor;

		// Fix for grid spacing issues
		qualitySelector.parentElement.style.setProperty("grid-auto-columns", "auto");
	}
};
