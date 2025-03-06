import { lookupItemQuality, QualityMeta, QualityTag, sortQualityTags } from "@inrixia/lib/AudioQualityTypes";
import { isElement } from "./lib/isElement";

import { TrackInfoCache } from "@inrixia/lib/Caches/TrackInfoCache";
import { TrackItem } from "neptune-types/tidal";
import { settings } from "./Settings";

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

export const setInfoColumnHeaders = () => {
	for (const trackList of document.querySelectorAll(`div[aria-label="Tracklist"]`)) {
		const bitDepthColumn = ensureColumnHeader(trackList, "Depth", `span[class^="_timeColumn"][role="columnheader"]`, `span[class^="_timeColumn"][role="columnheader"]`);
		bitDepthColumn?.style.setProperty("min-width", "40px");
		const sampleRateColumn = ensureColumnHeader(trackList, "Sample Rate", `span[class^="_timeColumn"][role="columnheader"]`, bitDepthColumn);
		sampleRateColumn?.style.setProperty("min-width", "110px");
		const bitrateColumn = ensureColumnHeader(trackList, "Bitrate", `span[class^="_timeColumn"][role="columnheader"]`, sampleRateColumn);
		bitrateColumn?.style.setProperty("min-width", "100px");
	}
};

export const setInfoColumns = (trackRow: Element, trackId: string, trackItem: TrackItem) => {
	const qualityTag = sortQualityTags(<QualityTag[]>trackItem.mediaMetadata?.tags)[0] ?? "LOW";

	const audioQuality = lookupItemQuality(qualityTag, trackItem.audioQuality);
	if (audioQuality === undefined) return;

	const bitDepthContent = document.createElement("span");

	const bitDepthColumn = setColumn(trackRow, "Depth", `div[data-test="duration"]`, bitDepthContent, `div[data-test="duration"]`);
	bitDepthColumn?.style.setProperty("min-width", "40px");

	const sampleRateContent = document.createElement("span");

	const sampleRateColumn = setColumn(trackRow, "Sample Rate", `div[data-test="duration"]`, sampleRateContent, bitDepthColumn);
	sampleRateColumn?.style.setProperty("min-width", "110px");

	const bitrateContent = document.createElement("span");

	const bitrateColumn = setColumn(trackRow, "Bitrate", `div[data-test="duration"]`, bitrateContent, sampleRateColumn);
	bitrateColumn?.style.setProperty("min-width", "100px");

	if (settings.infoColumnColors) {
		const qualityColor = QualityMeta[qualityTag]?.color ?? "";
		bitDepthContent.style.color = qualityColor;
		sampleRateContent.style.color = qualityColor;
		bitrateContent.style.color = qualityColor;
	}

	TrackInfoCache.register(trackId, audioQuality, async (trackInfo) => {
		if (!!trackInfo?.sampleRate) sampleRateContent.textContent = `${trackInfo.sampleRate / 1000}kHz`;
		if (!!trackInfo?.bitDepth) bitDepthContent.textContent = `${trackInfo.bitDepth}bit`;
		if (!!trackInfo?.bitrate) bitrateContent.textContent = `${Math.floor(trackInfo.bitrate / 1000).toLocaleString()}kbps`;
	});
};
