import { store } from "@neptune";
import { TrackItem, MediaItem, ItemId } from "neptune-types/tidal";
import { undefinedError } from "../undefinedError";
export class TrackItemCache {
	private static readonly _cache: Record<ItemId, TrackItem> = {};
	public static get(trackId?: ItemId) {
		if (trackId === undefined) return undefined;

		let mediaItem = this._cache[trackId];
		if (mediaItem !== undefined) return mediaItem;

		const mediaItems: Record<number, MediaItem> = store.getState().content.mediaItems;
		for (const itemId in mediaItems) {
			const item = mediaItems[itemId]?.item;
			if (item?.contentType !== "track") continue;
			this._cache[itemId] = item;
		}

		mediaItem = this._cache[trackId];
		if (mediaItem !== undefined) return mediaItem;
	}
}
