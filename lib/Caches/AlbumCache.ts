import { actions, store } from "@neptune";
import type { Album } from "neptune-types/tidal";
import { interceptPromise } from "../intercept/interceptPromise";
import { undefinedWarn } from "../undefinedError";

export class AlbumCache {
	private static readonly _cache: Record<number, Album> = {};
	public static async get(albumId?: number) {
		if (albumId === undefined) return undefined;

		let mediaItem = this._cache[albumId];
		if (mediaItem !== undefined) return mediaItem;

		const mediaItems: Record<number, Album> = store.getState().content.albums;
		for (const itemId in mediaItems) this._cache[itemId] = mediaItems[itemId];

		if (this._cache[albumId] === undefined) {
			const album = await interceptPromise(() => actions.content.loadAlbum({ albumId }), ["content/LOAD_ALBUM_SUCCESS"], [])
				.then((res) => <Album>res?.[0].album)
				.catch(undefinedWarn("AlbumCache.get"));
			if (album !== undefined) this._cache[albumId] = album;
		}

		return this._cache[albumId];
	}
}
