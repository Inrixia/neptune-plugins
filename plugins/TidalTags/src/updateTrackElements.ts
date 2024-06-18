import { store } from "@neptune";
// @ts-expect-error Remove this when types are available
import { storage } from "@plugin";
import { AudioQuality, lookupItemQuality, QualityMeta, QualityTag, sortQualityTags } from "../../../lib/AudioQualityTypes";
import type { MediaItem, TrackItem } from "neptune-types/tidal";
import { isElement } from ".";
import { TrackInfoCache } from "./lib/TrackInfoCache";
import { hexToRgba } from "./lib/hexToRgba";

class TrackItemCache {
	private static readonly _cache: Map<string, TrackItem> = new Map<string, TrackItem>();
	public static get(trackId: string) {
		let mediaItem = TrackItemCache._cache.get(trackId);
		if (mediaItem !== undefined) return mediaItem;
		const mediaItems: Record<number, MediaItem> = store.getState().content.mediaItems;
		for (const itemId in mediaItems) {
			const item = mediaItems[itemId]?.item;
			if (item?.contentType !== "track") continue;
			TrackItemCache._cache.set(itemId, item);
		}
		mediaItem = TrackItemCache._cache.get(trackId);
		if (mediaItem !== undefined) return mediaItem;
	}
}

const setQualityTag = (trackRow: Element, trackId: string, mediaItem: TrackItem) => {
	let trackTags = mediaItem.mediaMetadata?.tags;
	if (trackTags === undefined) return;

	const isLowQuality = mediaItem.audioQuality === AudioQuality.Low || mediaItem.audioQuality === AudioQuality.Lowest;
	if (trackTags.length === 1 && trackTags[0] === QualityTag.High && !isLowQuality) return;

	const trackTitle = trackRow.querySelector(`[data-test="table-row-title"]`);
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

	trackTitle.appendChild(span);
};

const setColumn = (trackRow: Element, name: string, sourceSelector: string, content: HTMLElement, beforeSelector?: string | Element) => {
	let column = trackRow.querySelector<HTMLElement>(`div[data-test="${name}"]`);
	if (column !== null) return;

	const sourceColumn = trackRow.querySelector<HTMLElement>(sourceSelector);
	if (sourceColumn === null) return;

	column = sourceColumn?.cloneNode(true);
	if (isElement(column)) {
		column.setAttribute("data-test", name);
		column.innerHTML = "";
		column.appendChild(content);
		return sourceColumn.parentElement!.insertBefore(column, beforeSelector instanceof Element ? beforeSelector : beforeSelector ? trackRow.querySelector(beforeSelector) : sourceColumn);
	}
};

const ensureColumnHeader = (trackList: Element, name: string, sourceSelector: string, beforeSelector?: string | Element) => {
	let columnHeader = trackList.querySelector<HTMLElement>(`span[data-test="${name}"][role="columnheader"]`);
	if (columnHeader !== null) return;

	const sourceColumn = trackList.querySelector(sourceSelector);
	if (!(sourceColumn instanceof HTMLElement)) return;

	columnHeader = sourceColumn.cloneNode(true);
	if ((columnHeader.firstChild?.childNodes?.length ?? -1) > 1) columnHeader.firstChild?.lastChild?.remove();
	columnHeader.setAttribute("data-test", name);
	columnHeader.firstChild!.firstChild!.textContent = name;

	return sourceColumn.parentElement!.insertBefore(columnHeader, beforeSelector instanceof Element ? beforeSelector : beforeSelector ? trackList.querySelector(beforeSelector) : sourceColumn);
};

export const updateTrackRow = async (trackRows: NodeListOf<Element>) => {
	for (const trackList of document.querySelectorAll(`div[aria-label="Tracklist"]`)) {
		const bitDepthColumn = ensureColumnHeader(trackList, "Depth", `span[class^="timeColumn--"][role="columnheader"]`, `span[class^="dateAddedColumn--"][role="columnheader"]`);
		bitDepthColumn?.style.setProperty("min-width", "auto");
		const sampleRateColumn = ensureColumnHeader(trackList, "Sample Rate", `span[class^="dateAddedColumn--"][role="columnheader"]`, bitDepthColumn);
		sampleRateColumn?.style.setProperty("min-width", "auto");
		const bitrateColumn = ensureColumnHeader(trackList, "Bitrate", `span[class^="dateAddedColumn--"][role="columnheader"]`, sampleRateColumn);
		bitrateColumn?.style.setProperty("min-width", "auto");
	}
	for (const trackRow of trackRows) {
		const trackId = trackRow.getAttribute("data-track-id");
		if (trackId == null) return;

		const trackItem = TrackItemCache.get(trackId);
		if (trackItem?.contentType !== "track") continue;

		setQualityTag(trackRow, trackId, trackItem);

		const qualityTag = sortQualityTags(<QualityTag[]>trackItem.mediaMetadata?.tags)[0] ?? "LOW";
		const qualityColor = QualityMeta[qualityTag]?.color ?? "";

		const audioQuality = lookupItemQuality(qualityTag, trackItem.audioQuality);
		if (audioQuality === undefined) continue;

		const bitDepthContent = document.createElement("span");
		// bitDepthContent.style.color = qualityColor;
		const bitDepthColumn = setColumn(trackRow, "Depth", `div[data-test="duration"]`, bitDepthContent, `div[data-test="track-row-date-added"]`);
		bitDepthColumn?.style.setProperty("min-width", "auto");

		const sampleRateContent = document.createElement("span");
		// sampleRateContent.style.color = qualityColor;
		const sampleRateColumn = setColumn(trackRow, "Sample Rate", `div[data-test="track-row-date-added"]`, sampleRateContent, bitDepthColumn);
		sampleRateColumn?.style.setProperty("min-width", "auto");

		const bitrateContent = document.createElement("span");
		// bitrateContent.style.color = qualityColor;
		const bitrateColumn = setColumn(trackRow, "Bitrate", `div[data-test="track-row-date-added"]`, bitrateContent, sampleRateColumn);
		bitrateColumn?.style.setProperty("min-width", "auto");

		TrackInfoCache.register(trackId, audioQuality, async (trackInfoP) => {
			const trackInfo = await trackInfoP;
			if (!!trackInfo?.sampleRate) sampleRateContent.textContent = `${trackInfo.sampleRate / 1000}kHz`;
			if (!!trackInfo?.bitDepth) bitDepthContent.textContent = `${trackInfo.bitDepth}bit`;
			if (!!trackInfo?.bitrate) bitrateContent.textContent = `${Math.floor(trackInfo.bitrate / 1000)}kbps`;
		});
	}
};
