import { tagData, Quality } from "./index.js";
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

export const setStreamQualityIndicator = async () => {
	const playbackContext = getState().playbackControls.playbackContext;
	if (!playbackContext) return;

	const { qualitySelector, qualityElement } = getQualityElements();
	if (!qualitySelector || !qualityElement) return;

	const { actualAudioQuality, actualProductId } = playbackContext;

	switch (actualAudioQuality) {
		case AudioQuality.MQA:
			if (qualityElement.textContent === "MQA") break;
			qualityElement.textContent = "MQA";

			qualityElement.style.backgroundColor = null;
			qualityElement.style.color = tagData[Quality.MQA].color;
			qualityElement.style.width = null;
			break;
		case AudioQuality.HiRes:
			if (qualityElement.textContent === "HI-RES") break;
			qualityElement.textContent = "HI-RES";

			qualityElement.style.backgroundColor = null;
			qualityElement.style.color = tagData[Quality.HiRes].color;
			qualityElement.style.width = "33px";
			break;
		default:
			qualityElement.style.backgroundColor = null;
			qualityElement.style.color = null;
			qualityElement.style.width = null;
			break;
	}

	if (storage.showFLACInfo && validQualitiesSet.has(actualAudioQuality) && flacInfoElem !== undefined) {
		flacInfoElem.textContent = "";
		flacInfoElem.style.border = null;

		const allElems = qualitySelector.parentElement.querySelectorAll(".bitInfo");
		// Remove to avoid buggy duplicates
		allElems.forEach((elem) => elem.remove());
		qualitySelector.parentElement.prepend(flacInfoElem);

		const { bitrate, bitsPerSample, sampleRate } = await getFLACInfo(actualProductId, actualAudioQuality);

		flacInfoElem.className = "bitInfo";
		flacInfoElem.textContent = `${bitsPerSample}bit - ${sampleRate / 1000}kHz ${(bitrate / 1000).toFixed(0)}kb/s`;
		flacInfoElem.style.maxWidth = "100px";
		flacInfoElem.style.textAlign = "center";
		flacInfoElem.style.borderRadius = "8px";
		flacInfoElem.style.padding = "4px";
		flacInfoElem.style.border = `solid 1px ${rgbToRgba(window.getComputedStyle(qualityElement).color, 0.3)}`;

		// Fix for grid spacing issues
		qualitySelector.parentElement.style.setProperty("grid-auto-columns", "auto");
	}
};
