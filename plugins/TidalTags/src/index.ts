import { intercept, store } from "@neptune";

import { setFLACInfo } from "./setFLACInfo";

import "./style";
import { setQualityTags } from "./setQualityTags";

export { Settings } from "./Settings";

// @ts-expect-error Remove this when types are available
import { storage } from "@plugin";
import { isElement } from "./lib/isElement";
import { setInfoColumnHeaders, setInfoColumns } from "./setInfoColumns";
import { TrackItemCache } from "./lib/TrackItemCache";
import { PlaybackContext } from "../../../lib/AudioQualityTypes";

/**
 * Flac Info
 */
// @ts-expect-error Intercept callback does not have types filled
const unloadIntercept = intercept("playbackControls/MEDIA_PRODUCT_TRANSITION", setFLACInfo);
setFLACInfo([{ playbackContext: <PlaybackContext>store.getState().playbackControls.playbackContext }]);

/**
 *  Tags & Info Columns
 */
const observer = new MutationObserver((mutationsList) => {
	for (const mutation of mutationsList) {
		if (mutation.type === "childList") {
			for (const node of mutation.addedNodes) {
				if (isElement(node)) {
					const trackRows = node.querySelectorAll('div[data-test="tracklist-row"]');
					if (trackRows.length !== 0) updateTrackRows(trackRows);
				}
			}
		}
	}
});
const updateTrackRows = async (trackRows: NodeListOf<Element>) => {
	if (storage.displayInfoColumns) setInfoColumnHeaders();
	for (const trackRow of trackRows) {
		const trackId = trackRow.getAttribute("data-track-id");
		if (trackId == null) return;

		const trackItem = TrackItemCache.get(trackId);
		if (trackItem?.contentType !== "track") continue;

		if (storage.showTags) setQualityTags(trackRow, trackId, trackItem);
		if (storage.displayInfoColumns) setInfoColumns(trackRow, trackId, trackItem);
	}
};
export const updateObserver = () => {
	observer.disconnect();
	if (storage.showTags || storage.displayInfoColumns) {
		// Start observing the document with the configured parameters
		observer.observe(document.body, { childList: true, subtree: true });
	}
};
updateObserver();

export const onUnload = () => {
	observer.disconnect();
	unloadIntercept();
};
