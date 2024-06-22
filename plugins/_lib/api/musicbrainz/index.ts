import { requestCached } from "../requestCache";
import type { ISRCData } from "./types/ISRCData";
import type { ReleaseData } from "./types/ReleaseData";
import type { UPCData, Release } from "./types/UPCData";

export class MusicBrainz {
	public static async getRecording(isrc?: string) {
		if (isrc === undefined) return undefined;
		const isrcData = await requestCached<ISRCData>(`https://musicbrainz.org/ws/2/isrc/${isrc}?fmt=json`);
		return isrcData?.recordings?.[0];
	}
	public static async getUPCData(upc?: string) {
		if (upc === undefined) return undefined;
		return requestCached<UPCData>(`https://musicbrainz.org/ws/2/release/?query=barcode:${upc}&fmt=json`);
	}
	public static async getAlbumRelease(albumId?: string) {
		if (albumId === undefined) return undefined;
		return requestCached<ReleaseData>(`https://musicbrainz.org/ws/2/release/${albumId}?inc=recordings+isrcs&fmt=json`);
	}
}
