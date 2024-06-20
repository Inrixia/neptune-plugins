import type { MediaItem } from "neptune-types/tidal";
import { requestStream, rejectNotOk, toJson } from "../fetch";
import type { ISRCData } from "./types/ISRCData";
import type { ReleaseData } from "./types/ReleaseData";
import type { UPCData, Release } from "./types/UPCData";

const _jsonCache: Record<string, unknown> = {};
const fetchCachedJson = async <T>(url: string): Promise<T> =>
	<T>_jsonCache[url] ??
	(_jsonCache[url] = requestStream(url)
		.then(rejectNotOk)
		.then(toJson<T>));

export class MusicBrainz {
	public static async getRecording(isrc?: string) {
		if (isrc === undefined) return undefined;
		const isrcData = await fetchCachedJson<ISRCData>(`https://musicbrainz.org/ws/2/isrc/${isrc}?fmt=json`);
		return isrcData?.recordings?.[0];
	}
	public static async getUPCData(upc?: string) {
		if (upc === undefined) return undefined;
		return fetchCachedJson<UPCData>(`https://musicbrainz.org/ws/2/release/?query=barcode:${upc}&fmt=json`);
	}
	public static async getAlbumRelease(albumId?: string) {
		if (albumId === undefined) return undefined;
		return fetchCachedJson<ReleaseData>(`https://musicbrainz.org/ws/2/release/${albumId}?inc=recordings+isrcs&fmt=json`);
	}
}
