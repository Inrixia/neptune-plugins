import { actions } from "@neptune";
import type { ItemId, MediaItem, TrackItem } from "neptune-types/tidal";
import { interceptPromise } from "../intercept/interceptPromise";
import { SharedObjectStoreExpirable } from "../storage/SharedObjectStoreExpirable";

import { libTrace } from "../trace";

export class PlaylistCache {
	private static readonly _trackItemsCache: SharedObjectStoreExpirable<ItemId, { playlistUUID: ItemId; trackItems: TrackItem[] }> = new SharedObjectStoreExpirable("PlaylistCache.trackItems", {
		maxAge: 30000,
		storeSchema: { keyPath: "playlistUUID" },
	});
	public static async getTrackItems(playlistUUID?: ItemId) {
		if (playlistUUID === undefined) return undefined;

		let playlistTrackItems = await this._trackItemsCache.get(playlistUUID);
		const updatePromise = this.updateTrackItems(playlistUUID);
		if (playlistTrackItems?.trackItems !== undefined) return playlistTrackItems.trackItems;
		return updatePromise;
	}
	public static async updateTrackItems(playlistUUID: ItemId) {
		const result = await interceptPromise(
			() => actions.content.loadListItemsPage({ loadAll: true, listName: `playlists/${playlistUUID}`, listType: "mediaItems" }),
			["content/LOAD_LIST_ITEMS_PAGE_SUCCESS"],
			["content/LOAD_LIST_ITEMS_PAGE_FAIL"],
			{ timeoutMs: 2000 }
		).catch(libTrace.warn.withContext("PlaylistCache.getTrackItems.interceptPromise"));
		if (result?.[0]?.items === undefined) {
			const playlistTrackItems = await this._trackItemsCache.get(playlistUUID);
			return playlistTrackItems?.trackItems;
		}
		const trackItems = Array.from((<Immutable.List<MediaItem>>result?.[0]?.items).map((mediaItem) => mediaItem?.item).filter((item) => item?.contentType === "track"));
		await this._trackItemsCache.put({ playlistUUID, trackItems });
		return trackItems;
	}
}
