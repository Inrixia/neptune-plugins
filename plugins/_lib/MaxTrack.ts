import { fetchIsrcIterable, Resource } from "./api/tidal";
import { AsyncCachable } from "./Caches/AsyncCachable";
import { ExtendedMediaItem } from "./Caches/ExtendedTrackItem";
import { MediaItemCache } from "./Caches/MediaItemCache";
import { ItemId, TrackItem } from "neptune-types/tidal";

export type TrackFilter = (trackItem: Resource) => boolean;
export class MaxTrack {
	public static getMaxTrack = AsyncCachable(async (itemId: ItemId): Promise<TrackItem | false> => {
		for await (const trackItem of this.getTracksFromItemId(itemId, this.hasHiRes)) {
			if (trackItem.id !== itemId) return trackItem;
		}
		return false;
	});
	public static getLatestMaxTrack = AsyncCachable(async (itemId: ItemId): Promise<TrackItem | false> => {
		let currentTrackItem: TrackItem | false = false;
		for await (const trackItem of this.getTracksFromItemId(itemId)) {
			if (trackItem.id === itemId) continue;
			if (currentTrackItem === undefined) {
				currentTrackItem = trackItem;
				continue;
			}
			const isLowerQuality = !this.hasHiRes(trackItem) && this.hasHiRes(<TrackItem>currentTrackItem);
			const isHigherQuality = this.hasHiRes(trackItem) && !this.hasHiRes(<TrackItem>currentTrackItem);
			if (isLowerQuality) continue;
			if (isHigherQuality) {
				currentTrackItem = trackItem;
				continue;
			}
			const isNewer = new Date(trackItem.streamStartDate!) > new Date((<TrackItem>currentTrackItem).streamStartDate!);
			if (isNewer) {
				currentTrackItem = trackItem;
				continue;
			}
		}
		return currentTrackItem;
	});
	public static async *getTracksFromItemId(itemId: ItemId, filter?: TrackFilter): AsyncGenerator<TrackItem> {
		const extTrackItem = await ExtendedMediaItem.get(itemId);
		if (extTrackItem === undefined) return;

		const { tidalTrack } = extTrackItem;
		if (tidalTrack.contentType !== "track") return;

		const isrcs = await extTrackItem.isrcs();
		if (isrcs.size === 0) return;

		for (const isrc of isrcs) {
			for await (const trackItem of this.getTracksFromISRC(isrc, filter)) {
				yield trackItem;
			}
		}
	}
	public static async *getTracksFromISRC(isrc: string, filter?: TrackFilter): AsyncGenerator<TrackItem> {
		for await (const { resource } of fetchIsrcIterable(isrc)) {
			if (resource?.id === undefined) continue;
			if (resource.artifactType !== "track") continue;
			if (filter && !filter(resource)) continue;
			const trackItem = await MediaItemCache.ensureTrack(resource?.id);
			if (trackItem !== undefined) yield trackItem;
		}
	}
	public static hasHiRes(trackItem: Resource | TrackItem): boolean {
		const tags = trackItem.mediaMetadata?.tags;
		if (tags === undefined) return false;
		return tags.includes("HIRES_LOSSLESS");
	}
}
