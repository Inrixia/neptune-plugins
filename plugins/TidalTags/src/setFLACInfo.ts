import { QualityMeta, QualityTagEnum } from "../../../lib/AudioQualityTypes";
import { AudioQualityEnum, PlaybackContext } from "../../../lib/AudioQualityTypes";

// @ts-expect-error Remove this when types are available
import { storage } from "@plugin";

import { getTrackBytes } from "./getTrackBytes";

const flacInfoElem = document.createElement("span");
flacInfoElem.className = "bitInfo";
flacInfoElem.style.maxWidth = "100px";
flacInfoElem.style.textAlign = "center";
flacInfoElem.style.padding = "4px";
flacInfoElem.style.fontSize = "13px";
flacInfoElem.style.borderRadius = "8px";

flacInfoElem.textContent = "";
flacInfoElem.style.border = "";

const qualitySelector = document.querySelector<HTMLElement>(`[data-test-media-state-indicator-streaming-quality]`);
if (qualitySelector == null) throw new Error("Invalid tidal media-state-indicator element!");
const tidalQualityElement = <HTMLElement | null>qualitySelector.firstChild;
const qualityElementContainer = qualitySelector.parentElement;
if (qualityElementContainer == null || tidalQualityElement == null) throw new Error("Invalid tidal media-state-indicator element children!");

// Ensure no duplicate/leftover elements
qualityElementContainer.querySelectorAll(".bitInfo").forEach((elem) => elem.remove());

qualityElementContainer.prepend(flacInfoElem);
// Fix for grid spacing issues
qualityElementContainer.style.setProperty("grid-auto-columns", "auto");

const progressBar = <HTMLElement>document.getElementById("progressBar");

function hexToRgba(hex: string, alpha: number) {
	// Remove the hash at the start if it's there
	hex = hex.replace(/^#/, "");
	// Parse the r, g, b values
	const r = parseInt(hex.substring(0, 2), 16);
	const g = parseInt(hex.substring(2, 4), 16);
	const b = parseInt(hex.substring(4, 6), 16);
	// Return the RGBA string
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const Loading_Bitrate = `Loading Bitrate...`;
const setBitrateText = (bitrateText: string) => (flacInfoElem.textContent = flacInfoElem.textContent?.replace(Loading_Bitrate, bitrateText) ?? "");

export const setFLACInfo = async ([{ playbackContext }]: [{ playbackContext: PlaybackContext }]) => {
	const { actualAudioQuality, actualProductId, bitDepth, sampleRate, actualDuration } = playbackContext;
	switch (actualAudioQuality) {
		case AudioQualityEnum.MQA: {
			const color = (tidalQualityElement.style.color = progressBar.style.color = QualityMeta[QualityTagEnum.MQA].color);
			if (storage.showFLACInfoBorder) flacInfoElem.style.border = `solid 1px ${hexToRgba(color, 0.3)}`;
			break;
		}
		case AudioQualityEnum.High: {
			const color = (tidalQualityElement.style.color = progressBar.style.color = QualityMeta[QualityTagEnum.High].color);
			if (storage.showFLACInfoBorder) flacInfoElem.style.border = `solid 1px ${hexToRgba(color, 0.3)}`;
			break;
		}
		case AudioQualityEnum.HiRes: {
			const color = (tidalQualityElement.style.color = progressBar.style.color = QualityMeta[QualityTagEnum.HiRes].color);
			if (storage.showFLACInfoBorder) flacInfoElem.style.border = `solid 1px ${hexToRgba(color, 0.3)}`;
			break;
		}
		default:
			tidalQualityElement.style.color = progressBar.style.color = "#cfcfcf";
			if (storage.showFLACInfoBorder) flacInfoElem.style.border = `solid 1px #cfcfcf`;
			break;
	}

	flacInfoElem.textContent = "";
	if (sampleRate !== undefined) flacInfoElem.textContent += `${sampleRate / 1000}kHz `;
	if (bitDepth !== undefined) flacInfoElem.textContent += `${bitDepth}bit `;
	flacInfoElem.textContent += Loading_Bitrate;

	try {
		const trackBytes = await getTrackBytes({ songId: +actualProductId, desiredQuality: actualAudioQuality });
		if (trackBytes !== undefined) setBitrateText(`${Math.floor(trackBytes / actualDuration / 1000)}kb/s`);
		else setBitrateText("Unknown Bitrate");
	} catch (err) {
		flacInfoElem.style.maxWidth = "256px";
		flacInfoElem.style.border = "solid 1px red";
		setBitrateText(`Loading Bitrate Failed - ${(<Error>err).message.substring(0, 64)}`);
	}

	if (flacInfoElem.textContent.length === 0) flacInfoElem.textContent = "Unknown";
};
