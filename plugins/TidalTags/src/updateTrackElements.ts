import { store } from "@neptune";
// @ts-expect-error Remove this when types are available
import { storage } from "@plugin";
import { QualityMeta, MediaMetadataQuality } from "../../../lib/AudioQuality";

const queryAllAndAttribute = (selector: string) => {
	const results = [];
	const elements = document.querySelectorAll(`[${selector}]`);
	for (const elem of elements) {
		results.push({ elem, attr: elem.getAttribute(selector) });
	}
	return results;
};

export const updateTrackLists = () => {
	const trackElements = [...queryAllAndAttribute("data-track-id"), ...queryAllAndAttribute("data-track--content-id")];
	if (trackElements.length === 0) return;
	const mediaItems = store.getState().content.mediaItems;

	for (const { elem: trackElem, attr: trackId } of trackElements) {
		if (trackId == null) continue;

		const mediaItem = mediaItems.get(trackId)?.item;
		if (mediaItem?.contentType !== "track") continue;

		let trackTags = mediaItem.mediaMetadata?.tags;
		if (trackTags === undefined) continue;
		if (trackTags.length === 1 && trackTags[0] === MediaMetadataQuality.High) continue;

		const trackList = trackElem.querySelector(`[data-test="table-row-title"], [data-test="list-item-track"], [data-test="playqueue-item"]`);
		if (trackList === null) continue;

		const isPlayQueueItem = trackList.getAttribute("data-test") === "playqueue-item";

		let span = trackElem.querySelector(".quality-tag-container") ?? document.createElement("span");
		if (span.getAttribute("track-id") === trackId) continue;

		span.innerHTML = "";
		span.className = "quality-tag-container";
		span.setAttribute("track-id", trackId);

		if (trackTags.includes(MediaMetadataQuality.HiRes)) {
			if (isPlayQueueItem) trackTags = [MediaMetadataQuality.HiRes];
			else if (!storage.showAllQualities) trackTags = trackTags.filter((tag) => tag !== MediaMetadataQuality.MQA);
		}

		for (const tag of trackTags) {
			if (tag === MediaMetadataQuality.High) continue;
			if (!storage.showAtmosQuality && tag === MediaMetadataQuality.Atmos) continue;

			const data = QualityMeta[tag];
			if (data === undefined) continue;

			const tagElement = document.createElement("span");

			tagElement.className = data.className;
			tagElement.textContent = data.textContent;
			tagElement.style.color = data.color;

			span.appendChild(tagElement);
		}

		if (isPlayQueueItem) trackList.insertBefore(span, trackList.lastElementChild);
		else trackList.appendChild(span);
	}
};
