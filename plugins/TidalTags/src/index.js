import { intercept } from "@neptune";

import { setStreamQualityIndicator } from "./streamQualitySelector";

import { unloadStyles } from "./style";
import { updateTrackElements } from "./updateTrackElements";

export { Settings } from "./Settings";

export const Quality = {
	High: "LOSSLESS",
	MQA: "MQA",
	HiRes: "HIRES_LOSSLESS",
	Atmos: "DOLBY_ATMOS",
};

// Cache class name and text content pairs to reduce lookup time
export const tagData = {
	[Quality.MQA]: { className: "quality-tag", textContent: "MQA", color: "#F9BA7A" },
	[Quality.HiRes]: { className: "quality-tag", textContent: "HiRes", color: "#ffd432" },
	[Quality.Atmos]: { className: "quality-tag", textContent: "Atmos", color: "#0052a3" },
};

const queryAllAndAttribute = (selector) => {
	const results = [];
	const elements = document.querySelectorAll(`[${selector}]`);
	for (const elem of elements) {
		results.push({ elem, attr: elem.getAttribute(selector) });
	}
	return results;
};

const unloadIntercept = intercept(["playbackControls/SET_PLAYBACK_STATE", "playbackControls/MEDIA_PRODUCT_TRANSITION"], () => setTimeout(setStreamQualityIndicator));

const processItems = () => {
	observer.disconnect();
	updateTrackElements([...queryAllAndAttribute("data-track-id"), ...queryAllAndAttribute("data-track--content-id")]);
	observer.observe(document.body, { childList: true, subtree: true });
};

let timeoutId;
const debouncedProcessItems = () => {
	if (timeoutId === undefined) processItems();
	clearTimeout(timeoutId);
	timeoutId = setTimeout(() => {
		processItems();
		timeoutId = undefined;
	}, 5);
};
const observer = new MutationObserver(debouncedProcessItems);
// Start observing the document with the configured parameters
observer.observe(document.body, { childList: true, subtree: true });

export const onUnload = () => {
	observer.disconnect();
	unloadStyles();
	unloadIntercept();
};
