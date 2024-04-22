import { store } from "@neptune";
// @ts-expect-error Remove this when types are available
import { storage } from "@plugin";
import { AudioQualityEnum, QualityMeta, QualityTagEnum } from "../../../lib/AudioQuality";
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

		const isLowQuality = mediaItem.audioQuality === AudioQualityEnum.Low || mediaItem.audioQuality === AudioQualityEnum.Lowest;

		let trackTags = mediaItem.mediaMetadata?.tags;
		if (trackTags === undefined) continue;
		if (trackTags.length === 1 && trackTags[0] === QualityTagEnum.High && !isLowQuality) continue;

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

		if (trackTags.includes(QualityTagEnum.HiRes) && !storage.showAllQualities) trackTags = trackTags.filter((tag) => tag !== QualityTagEnum.MQA);

		for (const tag of trackTags) {
			if (tag === QualityTagEnum.High) continue;
			if (!storage.showAtmosQuality && tag === QualityTagEnum.DolbyAtmos) continue;

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
