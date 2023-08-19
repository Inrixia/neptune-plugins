import confetti from "canvas-confetti";
import { getState } from "@neptune/store";
import { appendStyle } from "@neptune/utils";
import { intercept } from "@neptune";

import style from "./style.js";
confetti();

const Quality = {
	High: "LOSSLESS",
	MQA: "MQA",
	HiRes: "HIRES_LOSSLESS",
	Atmos: "DOLBY_ATMOS",
};

// Cache class name and text content pairs to reduce lookup time
const tagData = {
	[Quality.MQA]: { className: "quality-tag", textContent: "MQA", color: "rgb(249, 186, 122)" },
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

const updateTrackElements = (trackElements) => {
	if (trackElements.length === 0) return;
	const mediaItems = getState().content.mediaItems;

	for (const { elem: trackElem, attr: trackId } of trackElements) {
		let tags = mediaItems.get(trackId)?.item?.mediaMetadata?.tags;
		if (tags === undefined) continue;
		if (tags.length === 1 && tags[0] === Quality.High) continue;
		if (trackElem.querySelector(".quality-tag-container")) continue;

		const listElement = trackElem.querySelector(`[data-test="table-row-title"], [data-test="list-item-track"], [data-test="playqueue-item"]`);
		if (listElement === null) continue;

		const isPlayQueueItem = listElement.getAttribute("data-test") === "playqueue-item";

		const span = document.createElement("span");
		span.className = "quality-tag-container";
		if (isPlayQueueItem && tags.includes(Quality.HiRes)) tags = [Quality.HiRes];
		for (const tag of tags) {
			if (tag === Quality.High) continue;

			const data = tagData[tag];
			if (!data) continue;

			const tagElement = document.createElement("span");

			tagElement.className = data.className;
			tagElement.textContent = data.textContent;
			tagElement.style.color = data.color;

			span.appendChild(tagElement);
		}

		if (isPlayQueueItem) listElement.insertBefore(span, listElement.lastElementChild);
		else listElement.appendChild(span);
	}
};

const streamQualitySelector = "data-test-media-state-indicator-streaming-quality";

const unloadIntercept = intercept(["playbackControls/SET_PLAYBACK_STATE"], () => {
	const streamQuality = document.querySelector(`[${streamQualitySelector}]`);
	const currentQuality = streamQuality.getAttribute(streamQualitySelector);
	const qualityElement = streamQuality.children[0];
	if (qualityElement === null) return;
	switch (currentQuality) {
		// MQA
		case "HI_RES":
			if (qualityElement.textContent === "MQA") return;
			qualityElement.textContent = "MQA";

			qualityElement.style.backgroundColor = null;
			qualityElement.style.color = tagData[Quality.MQA].color;
			break;
		case "HI_RES_LOSSLESS":
			if (qualityElement.textContent === "HIRES") return;
			qualityElement.textContent = "HI-RES";

			qualityElement.style.backgroundColor = null;
			qualityElement.style.color = tagData[Quality.HiRes].color;
			break;
		default:
			qualityElement.style.backgroundColor = null;
			qualityElement.style.color = null;
	}
});

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

const unloadStyles = appendStyle(style);

export const onUnload = () => {
	observer.disconnect();
	unloadStyles();
	unloadIntercept();
};
