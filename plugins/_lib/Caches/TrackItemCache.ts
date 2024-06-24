import { store } from "@neptune";
import type { TrackItem, MediaItem, ItemId } from "neptune-types/tidal";
import { interceptPromise } from "../intercept/interceptPromise";
import type { PlaybackContext } from "../AudioQualityTypes";
import currentPlaybackContext from "../currentPlaybackContext";

export class TrackItemCache {
	private static readonly _cache: Record<ItemId, TrackItem> = {};
	public static current(playbackContext?: PlaybackContext) {
		playbackContext ??= currentPlaybackContext();
		if (playbackContext?.actualProductId === undefined) return undefined;
		return this.ensure(playbackContext.actualProductId);
	}
	public static async ensure(trackId?: ItemId) {
		if (trackId === undefined) return undefined;

		let mediaItem = this._cache[trackId];
		if (mediaItem !== undefined) return mediaItem;

		const mediaItems: Record<number, MediaItem> = store.getState().content.mediaItems;
		for (const itemId in mediaItems) {
			const item = mediaItems[itemId]?.item;
			if (item?.contentType !== "track") continue;
			this._cache[itemId] = item;
		}

		if (this._cache[trackId] === undefined) {
			const currentPage = window.location.pathname;
			await interceptPromise(() => neptune.actions.router.replace(<any>`/track/${trackId}`), ["page/IS_DONE_LOADING"], []);
			neptune.actions.router.replace(<any>currentPage);
			const mediaItems: Record<number, MediaItem> = store.getState().content.mediaItems;
			const trackItem = mediaItems[+trackId]?.item;
			if (trackItem?.contentType === "track") this._cache[trackId] = trackItem;
		}

		return this._cache[trackId];
	}
}
