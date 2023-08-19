import { getState } from "@neptune/store";
import { Quality, tagData } from ".";

export const updateTrackElements = (trackElements) => {
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
