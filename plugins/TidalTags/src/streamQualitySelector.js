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

const streamQualitySelector = "data-test-media-state-indicator-streaming-quality";
export const setStreamQualityIndicator = async () => {
	const playbackContext = getState().playbackControls.playbackContext;
	if (!playbackContext) return;

	const qualitySelector = document.querySelector(`[${streamQualitySelector}]`);
	const qualityElement = qualitySelector.firstChild;
	if (qualityElement === null) return;

	const { actualAudioQuality, actualProductId } = playbackContext;

	switch (actualAudioQuality) {
		case AudioQuality.MQA:
			if (qualityElement.textContent === "MQA") return;
			qualityElement.textContent = "MQA";

			qualityElement.style.backgroundColor = null;
			qualityElement.style.color = tagData[Quality.MQA].color;
			qualityElement.style.width = null;
			break;
		case AudioQuality.HiRes:
			if (qualityElement.textContent === "HI-RES") return;
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

	if (storage.showFLACInfo && validQualitiesSet.has(actualAudioQuality)) {
		const span = qualitySelector.parentElement.querySelector(".bitInfo") ?? document.createElement("span");
		span.textContent = "";

		const { bitrate, bitsPerSample, sampleRate } = await getFLACInfo(actualProductId, actualAudioQuality);

		span.className = "bitInfo";
		span.textContent = `${bitsPerSample}bit - ${sampleRate / 1000}kHz ${(bitrate / 1000).toFixed(0)}kb/s`;
		span.style.maxWidth = "100px";
		span.style.textAlign = "center";
		span.style.borderRadius = "8px";
		span.style.padding = "4px";
		span.style.border = `solid 1px ${rgbToRgba(window.getComputedStyle(qualityElement).color, 0.3)}`;

		console.log(window.getComputedStyle(qualityElement).color);

		// Fix for grid spacing issues
		qualitySelector.parentElement.style.setProperty("grid-auto-columns", "auto");
		qualitySelector.parentElement.insertBefore(span, qualityElement.parentElement);
	}
};
