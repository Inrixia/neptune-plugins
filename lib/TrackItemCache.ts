import { store } from "@neptune";
import { TrackItem, MediaItem } from "neptune-types/tidal";

export class TrackItemCache {
	private static readonly _cache: Map<string, TrackItem> = new Map<string, TrackItem>();
	public static get(trackId: number | string | undefined) {
		if (trackId === undefined) return undefined;
		trackId = trackId.toString();
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
