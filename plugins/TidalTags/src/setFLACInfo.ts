import { QualityMeta, QualityTag } from "../../../lib/AudioQualityTypes";
import { AudioQuality, PlaybackContext } from "../../../lib/AudioQualityTypes";

// @ts-expect-error Remove this when types are available
import { storage } from "@plugin";

import { TrackInfoCache } from "./lib/TrackInfoCache";
import { hexToRgba } from "./lib/hexToRgba";

import { Tracer } from "../../../lib/trace";
const trace = Tracer("[TidalTags]");

const flacInfoElem = document.createElement("span");
flacInfoElem.className = "bitInfo";
flacInfoElem.style.maxWidth = "100px";
flacInfoElem.style.textAlign = "center";
flacInfoElem.style.padding = "4px";
flacInfoElem.style.fontSize = "13px";
flacInfoElem.style.borderRadius = "8px";

flacInfoElem.textContent = "";
flacInfoElem.style.border = "";

const retryPromise = <T>(getValue: () => T | Promise<T>, options: { interval?: number; maxRetries?: number } = {}) => {
	options.maxRetries ??= 200;
	options.interval ??= 250;
	let selectorInterval: NodeJS.Timeout;
	let retries = 0;
	return new Promise<T>((res, rej) => {
		selectorInterval = setInterval(async () => {
			try {
				res(await getValue());
			} catch (err) {
				if (retries >= (options.maxRetries ?? 40)) return rej(err);
				retries++;
			}
		}, options.interval ?? 250);
	}).finally(() => clearTimeout(selectorInterval));
};

const qualitySelectorP = retryPromise(() => {
	const qualitySelector = document.querySelector<HTMLElement>(`[data-test-media-state-indicator-streaming-quality]`);
	if (qualitySelector == null) throw new Error("Failed to find tidal media-state-indicator element!");
	return qualitySelector;
});
const tidalQualityElementP = retryPromise(async () => {
	const tidalQualityElement = <HTMLElement>(await qualitySelectorP).firstChild;
	if (tidalQualityElement === null) throw new Error("Failed to find tidal media-state-indicator element children!");
	return tidalQualityElement;
});
const setupQualityElementContainer = retryPromise(async () => {
	const qualityElementContainer = (await qualitySelectorP).parentElement;
	if (qualityElementContainer == null) throw new Error("Failed to find tidal media-state-indicator element parent!");

	// Ensure no duplicate/leftover elements before prepending
	qualityElementContainer.querySelectorAll(".bitInfo").forEach((elem) => elem.remove());
	qualityElementContainer.prepend(flacInfoElem);
	// Fix for grid spacing issues
	qualityElementContainer.style.setProperty("grid-auto-columns", "auto");

	return qualityElementContainer;
});
const progressBarP = retryPromise(() => {
	const progressBar = <HTMLElement>document.getElementById("progressBar");
	if (progressBar === null) throw new Error("Failed to find tidal progressBar element!");
	return progressBar;
});

const Loading_Bitrate = `Loading Bitrate...`;

export const setFLACInfo = async ([{ playbackContext }]: [{ playbackContext?: PlaybackContext }]) => {
	if (!playbackContext) return;
	flacInfoElem.textContent = `Loading...`;
	flacInfoElem.style.maxWidth = "100px";
	const [progressBar, tidalQualityElement] = await Promise.all([progressBarP, tidalQualityElementP]);
	await setupQualityElementContainer;

	let { actualAudioQuality, bitDepth, sampleRate } = playbackContext;
	switch (actualAudioQuality) {
		case AudioQuality.MQA: {
			const color = (tidalQualityElement.style.color = progressBar.style.color = QualityMeta[QualityTag.MQA].color);
			if (storage.showFLACInfoBorder) flacInfoElem.style.border = `solid 1px ${hexToRgba(color, 0.3)}`;
			break;
		}
		case AudioQuality.High: {
			const color = (tidalQualityElement.style.color = progressBar.style.color = QualityMeta[QualityTag.High].color);
			if (storage.showFLACInfoBorder) flacInfoElem.style.border = `solid 1px ${hexToRgba(color, 0.3)}`;
			break;
		}
		case AudioQuality.HiRes: {
			const color = (tidalQualityElement.style.color = progressBar.style.color = QualityMeta[QualityTag.HiRes].color);
			if (storage.showFLACInfoBorder) flacInfoElem.style.border = `solid 1px ${hexToRgba(color, 0.3)}`;
			break;
		}
		default:
			tidalQualityElement.style.color = progressBar.style.color = "#cfcfcf";
			if (storage.showFLACInfoBorder) flacInfoElem.style.border = `solid 1px #cfcfcf`;
			break;
	}

	if (sampleRate !== null && bitDepth !== null) {
		flacInfoElem.textContent = "";
		if (!!sampleRate) flacInfoElem.textContent += `${sampleRate / 1000}kHz `;
		if (!!bitDepth) flacInfoElem.textContent += `${bitDepth}bit `;
		flacInfoElem.textContent += Loading_Bitrate;
	}

	try {
		const { bitDepth, sampleRate, bitrate } = await TrackInfoCache.ensure(playbackContext);
		flacInfoElem.textContent = "";
		if (!!sampleRate) flacInfoElem.textContent += `${sampleRate / 1000}kHz `;
		if (!!bitDepth) flacInfoElem.textContent += `${bitDepth}bit `;
		if (!!bitrate) flacInfoElem.textContent += `${Math.floor(bitrate / 1000).toLocaleString()}kb/s`;
	} catch (err) {
		flacInfoElem.style.maxWidth = "256px";
		flacInfoElem.style.border = "solid 1px red";
		const errorText = (<Error>err).message.substring(0, 64);
		if (flacInfoElem.textContent.includes(Loading_Bitrate)) {
			const errHeader = `Error Loading Bitrate`;
			const errMsg = `${errHeader} - ${errorText}`;
			flacInfoElem.textContent = flacInfoElem.textContent?.replace(Loading_Bitrate, errMsg) ?? "";
			trace.msg.err.withContext(errHeader)(<Error>err);
		} else {
			const errHeader = `Error Loading TrackInfo`;
			const errMsg = `${errHeader} - ${errorText}`;
			flacInfoElem.textContent = errMsg;
			trace.msg.err.withContext(errHeader)(<Error>err);
		}
	}

	if (flacInfoElem.textContent.length === 0) flacInfoElem.textContent = "Unknown";
};
