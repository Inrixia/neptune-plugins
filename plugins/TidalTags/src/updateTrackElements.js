import { getState } from "@neptune/store";
import { storage } from "@plugin";
import { Quality, tagData } from "./TagData";

const queryAllAndAttribute = (selector) => {
	const results = [];
	const elements = document.querySelectorAll(`[${selector}]`);
	for (const elem of elements) {
		results.push({ elem, attr: elem.getAttribute(selector) });
	}
	return results;
};

export const updateTrackElements = () => {
	const trackElements = [...queryAllAndAttribute("data-track-id"), ...queryAllAndAttribute("data-track--content-id")];
	if (trackElements.length === 0) return;
	const mediaItems = getState().content.mediaItems;

	for (const { elem: trackElem, attr: trackId } of trackElements) {
		let tags = mediaItems.get(trackId)?.item?.mediaMetadata?.tags;
		if (tags === undefined) continue;
		if (tags.length === 1 && tags[0] === Quality.High) continue;

		const listElement = trackElem.querySelector(`[data-test="table-row-title"], [data-test="list-item-track"], [data-test="playqueue-item"]`);
		if (listElement === null) continue;

		const isPlayQueueItem = listElement.getAttribute("data-test") === "playqueue-item";

		let span = trackElem.querySelector(".quality-tag-container") ?? document.createElement("span");
		if (span.getAttribute("track-id") === trackId) continue;
		span.innerHTML = null;
		span.className = "quality-tag-container";
		span.setAttribute("track-id", trackId);
		if (tags.includes(Quality.HiRes)) {
			if (isPlayQueueItem) tags = [Quality.HiRes];
			else if (!storage.showAllQualities) tags = tags.filter((tag) => tag !== Quality.MQA);
		}

		for (const tag of tags) {
			if (tag === Quality.High) continue;
			if (!storage.showAtmosQuality && tag === Quality.Atmos) continue;

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
