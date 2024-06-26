import { requestJsonCached } from "../../nativeBridge";
import type { ISRCData, UPCData, ReleaseData } from "./types";

export * from "./types";

export class MusicBrainz {
	public static async getRecording(isrc?: string) {
		if (isrc === undefined) return undefined;
		const isrcData = await requestJsonCached<ISRCData>(`https://musicbrainz.org/ws/2/isrc/${isrc}?fmt=json`);
		return isrcData?.recordings?.[0];
	}
	public static async getUPCData(upc?: string) {
		if (upc === undefined) return undefined;
		return requestJsonCached<UPCData>(`https://musicbrainz.org/ws/2/release/?query=barcode:${upc}&fmt=json`);
	}
	public static async getAlbumRelease(albumId?: string) {
		if (albumId === undefined) return undefined;
		return requestJsonCached<ReleaseData>(`https://musicbrainz.org/ws/2/release/${albumId}?inc=recordings+isrcs&fmt=json`);
	}
}
