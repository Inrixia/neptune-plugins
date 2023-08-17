// You can put anything you want in the body of your plugin code.
import confetti from "canvas-confetti";
import { getState } from "@neptune/store";
import { appendStyle } from "@neptune/utils";

import style from "./style.js";

console.log("Hello world!");
confetti();

// Cache class name and text content pairs to reduce lookup time
const tagData = {
	MQA: { className: "quality-tag tag-mqa", textContent: "MQA" },
	HIRES_LOSSLESS: { className: "quality-tag tag-hr", textContent: "HiRes" },
	DOLBY_ATMOS: { className: "quality-tag tag-atmos", textContent: "Atmos" },
};

const qualityMap = {
	HI_RES: { textContent: "MQA" },
	HI_RES_LOSSLESS: { textContent: "HIRES LOSSLESS", color: "#45eeff" },
};

const queryAllAndAttribute = (selector) => {
	const results = [];
	const elements = document.querySelectorAll(`[${selector}]`);
	for (const elem of elements) {
		results.push({ elem, attr: elem.getAttribute(selector) });
	}
	return results;
};

const updateTrackElements = (trackElements) => {
	const mediaItems = getState().content.mediaItems;

	for (const { elem: trackElem, attr: trackId } of trackElements) {
		const tags = mediaItems.get(trackId)?.item?.mediaMetadata?.tags;
		if (tags === undefined) continue;
		if (trackElem.querySelector(".quality-tag")) continue;

		const listElement = trackElem.querySelector(`[data-test="table-row-title"], [data-test="list-item-track"]`);
		if (listElement === null) continue;

		// Using documentFragment to minimize browser reflow
		const fragment = document.createElement("span");

		for (const tag of tags) {
			if (tag === "LOSSLESS") continue;

			const data = tagData[tag];
			if (!data) continue;

			const tagElement = document.createElement("span");

			tagElement.className = data.className;
			tagElement.textContent = data.textContent;

			fragment.appendChild(tagElement);
		}
		listElement.appendChild(fragment);
	}
};

const streamQualitySelector = "data-test-media-state-indicator-streaming-quality";
const processItems = () => {
	// Stop observing
	observer.disconnect();
	updateTrackElements([...queryAllAndAttribute("data-track-id"), ...queryAllAndAttribute("data-track--content-id")]);

	const streamQuality = document.querySelector(`[${streamQualitySelector}]`);
	const currentQuality = streamQuality.getAttribute(streamQualitySelector);
	if (qualityMap[currentQuality] !== undefined) {
		streamQuality.children[0].textContent = qualityMap[currentQuality].textContent;
		if (qualityMap[currentQuality].color !== undefined) streamQuality.children[0].style.color = qualityMap[currentQuality].color;
		else streamQuality.children[0].style.color = null;
	}

	// Start observing again
	observer.observe(document.body, { childList: true, subtree: true });
};
let timeoutId;
const debouncedProcessItems = () => {
	clearTimeout(timeoutId);
	timeoutId = setTimeout(processItems, 5);
};
const observer = new MutationObserver(debouncedProcessItems);
// Start observing the document with the configured parameters
observer.observe(document.body, { childList: true, subtree: true });

const unloadStyles = appendStyle(style);

export const onUnload = () => {
	observer.disconnect();
	unloadStyles();
};
