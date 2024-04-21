import { store } from "@neptune";
// @ts-expect-error Remove this when types are available
import { storage } from "@plugin";
import { AudioQuality, QualityMeta, QualityTag } from "../../../lib/AudioQuality";
import type { MediaItem } from "neptune-types/tidal";

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
	const mediaItems: Record<number, MediaItem> = store.getState().content.mediaItems;

	for (const { elem: trackElem, attr: trackId } of trackElements) {
		if (trackId == null) continue;

		const mediaItem = mediaItems[+trackId]?.item;
		if (mediaItem?.contentType !== "track") continue;

		const isLowQuality = mediaItem.audioQuality === AudioQuality.Low || mediaItem.audioQuality === AudioQuality.Lowest;

		let trackTags = mediaItem.mediaMetadata?.tags;
		if (trackTags === undefined) continue;
		if (trackTags.length === 1 && trackTags[0] === QualityTag.High && !isLowQuality) continue;

		const trackList = trackElem.querySelector(`[data-test="table-row-title"], [data-test="list-item-track"]`);
		if (trackList === null) continue;

		let span = trackElem.querySelector(".quality-tag-container") ?? document.createElement("span");
		if (span.getAttribute("track-id") === trackId) continue;

		span.innerHTML = "";
		span.className = "quality-tag-container";
		span.setAttribute("track-id", trackId);

		if (isLowQuality) {
			const tagElement = document.createElement("span");

			tagElement.className = "quality-tag";
			tagElement.textContent = "Low";
			tagElement.style.color = "#b9b9b9";

			span.appendChild(tagElement);
		}

		if (trackTags.includes(QualityTag.HiRes) && !storage.showAllQualities) trackTags = trackTags.filter((tag) => tag !== QualityTag.MQA);

		for (const tag of trackTags) {
			if (tag === QualityTag.High) continue;
			if (!storage.showAtmosQuality && tag === QualityTag.DolbyAtmos) continue;

			const data = QualityMeta[tag];
			if (data === undefined) continue;

			const tagElement = document.createElement("span");

			tagElement.className = "quality-tag";
			tagElement.textContent = data.textContent;
			tagElement.style.color = data.color;

			span.appendChild(tagElement);
		}

		trackList.appendChild(span);
	}
};
