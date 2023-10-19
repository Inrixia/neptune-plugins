import { tagData, Quality } from "./TagData";
import { downloadBytes } from "../../../lib/download";
import { AudioQuality, validQualitiesSet } from "../../../lib/AudioQuality";

import { storage } from "@plugin";
import { getState } from "@neptune/store";

const { parseBuffer } = require("music-metadata/lib/core");

const qualityCache = new Map();
const getFLACInfo = (id, quality) => {
	const key = `${id}-${quality}`;

	// If a promise for this key is already in the cache, await it
	if (qualityCache.has(key)) return qualityCache.get(key);

	qualityCache.set(
		key,
		(async () => {
			let totalBytes;
			const onProgress = ({ total }) => (totalBytes = total);
			const bytes = await downloadBytes(id, quality, 0, 43, onProgress);
			const { format } = await parseBuffer(bytes);
			format.totalBytes = totalBytes;
			format.bitrate = (totalBytes / format.duration) * 8;
			return format;
		})()
	);

	return qualityCache.get(key);
};

const rgbToRgba = (rgb, alpha) => rgb.replace("rgb", "rgba").replace(")", `, ${alpha})`);

const getQualityElements = () => {
	const qualitySelector = document.querySelector(`[data-test-media-state-indicator-streaming-quality]`);
	const qualityElement = qualitySelector?.firstChild;
	return { qualitySelector, qualityElement };
};

const flacInfoElem = document.createElement("span");
const removeElems = (qualitySelector) => {
	const allElems = qualitySelector.parentElement.querySelectorAll(".bitInfo");
	// Remove to avoid buggy duplicates
	allElems.forEach((elem) => elem.remove());
};

export const setStreamQualityIndicator = async () => {
	const playbackContext = getState().playbackControls.playbackContext;
	if (!playbackContext) return;

	const { qualitySelector, qualityElement } = getQualityElements();
	if (!qualitySelector || !qualityElement) return;

	const { actualAudioQuality, actualProductId } = playbackContext;

	switch (actualAudioQuality) {
		case AudioQuality.MQA:
			qualityElement.style.color = tagData[Quality.MQA].color;
			break;
		default:
			qualityElement.style.color = null;
			break;
	}

	if (!storage.showFLACInfo) return removeElems(qualitySelector);
	if (storage.showFLACInfo && validQualitiesSet.has(actualAudioQuality) && flacInfoElem !== undefined) {
		flacInfoElem.textContent = "";
		flacInfoElem.style.border = null;

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
