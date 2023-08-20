import { intercept } from "@neptune";

import { setStreamQualityIndicator } from "./streamQualitySelector";

import { unloadStyles } from "./style";
import { updateTrackElements } from "./updateTrackElements";

export { Settings } from "./Settings";

const unloadIntercept = intercept(["playbackControls/SET_PLAYBACK_STATE", "playbackControls/MEDIA_PRODUCT_TRANSITION"], () => setTimeout(setStreamQualityIndicator));

const processItems = () => {
	observer.disconnect();
	updateTrackElements();
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
