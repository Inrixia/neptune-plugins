import { actions, store } from "@neptune";
import type { Album, ItemId, MediaItem, TrackItem } from "neptune-types/tidal";
import { interceptPromise } from "../intercept/interceptPromise";

import { libTrace } from "../trace";
import { SharedObjectStore } from "../storage/SharedObjectStore";

const DAY = 1000 * 60 * 60 * 24;
export class AlbumCache {
	private static readonly _cache: Record<number, Album> = {};
	private static readonly _trackItemsCache: SharedObjectStore<ItemId, { albumId: ItemId; trackItems?: TrackItem[] }> = new SharedObjectStore("AlbumCache.trackItems", { keyPath: "albumId" });
	public static async get(albumId?: number) {
		if (albumId === undefined) return undefined;

		let album = this._cache[albumId];
		if (album !== undefined) return album;

		const albums: Record<number, Album> = store.getState().content.albums;
		for (const albumId in albums) this._cache[albumId] = albums[albumId];

		if (this._cache[albumId] === undefined) {
			const album = await interceptPromise(() => actions.content.loadAlbum({ albumId }), ["content/LOAD_ALBUM_SUCCESS"], [])
				.then((res) => <Album>res?.[0].album)
				.catch(libTrace.warn.withContext("AlbumCache.get"));
			if (album !== undefined) this._cache[albumId] = album;
		}

		return this._cache[albumId];
	}
	public static async getTrackItems(playlistUUID?: ItemId) {
		if (playlistUUID === undefined) return undefined;

		let albumTrackItems = await this._trackItemsCache.get(playlistUUID);
		const updatePromise = this.updateTrackItems(playlistUUID);
		if (albumTrackItems?.trackItems !== undefined) return albumTrackItems.trackItems;
		return updatePromise;
	}
	public static async updateTrackItems(albumId: ItemId) {
		const result = await interceptPromise(() => actions.content.loadAllAlbumMediaItems({ albumId }), ["content/LOAD_ALL_ALBUM_MEDIA_ITEMS_SUCCESS"], ["content/LOAD_ALL_ALBUM_MEDIA_ITEMS_FAIL"], {
			timeoutMs: 2000,
		}).catch(libTrace.warn.withContext("PlaylistCache.getTrackItems.interceptPromise"));
		if (result?.[0]?.mediaItems === undefined) {
			const albumTrackItems = await this._trackItemsCache.get(albumId);
			return albumTrackItems?.trackItems;
		}
		const trackItems = Array.from((<Immutable.List<MediaItem>>result?.[0]?.mediaItems).map((mediaItem) => mediaItem?.item).filter((item) => item?.contentType === "track"));
		await this._trackItemsCache.put({ albumId, trackItems });
		return trackItems;
	}
}
