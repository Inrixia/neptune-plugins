// @ts-expect-error Remove this when types are available
import { storage } from "@plugin";

import { AudioQuality, QualityMeta, QualityTag } from "../../../lib/AudioQualityTypes";
import type { TrackItem } from "neptune-types/tidal";

export const setQualityTags = (trackRow: Element, trackId: string, mediaItem: TrackItem) => {
	let trackTags = mediaItem.mediaMetadata?.tags;
	if (trackTags === undefined) return;

	const isLowQuality = mediaItem.audioQuality === AudioQuality.Low || mediaItem.audioQuality === AudioQuality.Lowest;
	if (trackTags.length === 1 && trackTags[0] === QualityTag.High && !isLowQuality) return;

	const trackTitle = trackRow.querySelector<HTMLElement>(`[data-test="table-row-title"]`);
	if (trackTitle === null) return;

	const span = trackTitle.querySelector(".quality-tag-container") ?? document.createElement("span");
	if (span.getAttribute("track-id") === trackId) return;

	span.className = "quality-tag-container";
	span.setAttribute("track-id", trackId);

	if (isLowQuality) {
		const tagElement = document.createElement("span");
		tagElement.className = "quality-tag";
		tagElement.textContent = QualityMeta["LOW"].textContent;
		tagElement.style.color = QualityMeta["LOW"].color;
		span.appendChild(tagElement);
	}

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

	trackTitle.appendChild(span);
};
