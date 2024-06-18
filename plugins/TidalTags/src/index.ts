import { intercept } from "@neptune";

import { setFLACInfo } from "./setFLACInfo";

import "./style";
import { updateTrackRow as updateTrackRows } from "./updateTrackElements";

export { Settings } from "./Settings";

// @ts-expect-error intercept callback does not have types filled
const unloadIntercept = intercept("playbackControls/MEDIA_PRODUCT_TRANSITION", setFLACInfo);

export const isElement = (node: Node | undefined): node is Element => node?.nodeType === Node.ELEMENT_NODE;

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
// Start observing the document with the configured parameters
observer.observe(document.body, { childList: true, subtree: true });

export const onUnload = () => {
	observer.disconnect();
	unloadIntercept();
};
