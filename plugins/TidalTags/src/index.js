import confetti from "canvas-confetti";
import { getState } from "@neptune/store";
import { appendStyle } from "@neptune/utils";

import style from "./style.js";
confetti();

// Cache class name and text content pairs to reduce lookup time
const tagData = {
	MQA: { className: "quality-tag", textContent: "MQA", color: "#ffd432" },
	HIRES_LOSSLESS: { className: "quality-tag", textContent: "HiRes", color: "#45eeff" },
	DOLBY_ATMOS: { className: "quality-tag", textContent: "Atmos", color: "#0052a3" },
};

const HighQuality = "LOSSLESS";

const qualityMap = {
	HI_RES: { textContent: "MQA" },
	HI_RES_LOSSLESS: { textContent: "HIRES LOSSLESS", color: tagData.HIRES_LOSSLESS.color },
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
	if (trackElements.length === 0) return;
	const mediaItems = getState().content.mediaItems;

	for (const { elem: trackElem, attr: trackId } of trackElements) {
		let tags = mediaItems.get(trackId)?.item?.mediaMetadata?.tags;
		if (tags === undefined) continue;
		if (tags.length === 1 && tags[0] === HighQuality) continue;
		if (trackElem.querySelector(".quality-tag-container")) continue;

		const listElement = trackElem.querySelector(`[data-test="table-row-title"], [data-test="list-item-track"], [data-test="playqueue-item"]`);
		if (listElement === null) continue;

		const isPlayQueueItem = listElement.getAttribute("data-test") === "playqueue-item";

		const fragment = document.createElement("span");
		fragment.className = "quality-tag-container";
		if (isPlayQueueItem && tags.includes("HIRES_LOSSLESS")) tags = ["HIRES_LOSSLESS"];
		for (const tag of tags) {
			if (tag === HighQuality) continue;

			const data = tagData[tag];
			if (!data) continue;

			const tagElement = document.createElement("span");

			tagElement.className = data.className;
			tagElement.textContent = data.textContent;
			tagElement.style.color = data.color;

			fragment.appendChild(tagElement);
		}

		if (isPlayQueueItem) listElement.insertBefore(fragment, listElement.lastElementChild);
		else listElement.appendChild(fragment);
	}
};

const streamQualitySelector = "data-test-media-state-indicator-streaming-quality";
const processItems = () => {
	updateTrackElements([...queryAllAndAttribute("data-track-id"), ...queryAllAndAttribute("data-track--content-id")]);

	const streamQuality = document.querySelector(`[${streamQualitySelector}]`);
	const currentQuality = streamQuality.getAttribute(streamQualitySelector);
	if (qualityMap[currentQuality] !== undefined) {
		streamQuality.children[0].textContent = qualityMap[currentQuality].textContent;
		if (qualityMap[currentQuality].color !== undefined) streamQuality.children[0].style.color = qualityMap[currentQuality].color;
		else streamQuality.children[0].style.color = null;
	}
};
let timeoutId;
const debouncedProcessItems = () => {
	clearTimeout(timeoutId);
	timeoutId = setTimeout(() => {
		observer.disconnect();
		processItems();
		observer.observe(document.body, { childList: true, subtree: true });
	}, 5);
};
const observer = new MutationObserver(debouncedProcessItems);
// Start observing the document with the configured parameters
observer.observe(document.body, { childList: true, subtree: true });

const unloadStyles = appendStyle(style);

export const onUnload = () => {
	observer.disconnect();
	unloadStyles();
};
