import { intercept } from "@neptune";

import { setStreamQualityIndicator } from "./streamQualitySelector";

import "./style";
import { updateTrackLists } from "./updateTrackElements";

export { Settings } from "./Settings";
// @ts-expect-error Remove this when types are available
import { storage } from "@plugin";

const unloadIntercept = intercept(["playbackControls/SET_PLAYBACK_STATE", "playbackControls/MEDIA_PRODUCT_TRANSITION"], () => {
	setTimeout(setStreamQualityIndicator);
});

const processItems = () => {
	observer.disconnect();
	updateTrackLists();
	observer.observe(document.body, { childList: true, subtree: true });
};

let timeoutId: NodeJS.Timeout | null;
const debouncedProcessItems = () => {
	if (storage.showTags) {
		if (timeoutId === null) processItems();
		else clearTimeout(timeoutId);
		timeoutId = setTimeout(() => {
			processItems();
			timeoutId = null;
		}, 5);
	}
};

const observer = new MutationObserver(debouncedProcessItems);
// Start observing the document with the configured parameters
observer.observe(document.body, { childList: true, subtree: true });

export const onUnload = () => {
	observer.disconnect();
	unloadIntercept();
};
