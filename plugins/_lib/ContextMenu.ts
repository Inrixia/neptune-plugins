import { intercept } from "@neptune";
import { ItemId, TrackItem } from "neptune-types/tidal";
import { MediaItemCache } from "./Caches/MediaItemCache";

import "./contentButton.styles";

import { libTrace } from "./trace";
import { AlbumCache } from "./Caches/AlbumCache";
import { PlaylistCache } from "./Caches/PlaylistItemCache";

type ContextSource = { type: "TRACK" } | { type: "ALBUM"; albumId: ItemId } | { type: "PLAYLIST"; playlistId: ItemId };
type ContextListener = (contextSource: ContextSource, contextMenu: Element, trackItems: TrackItem[]) => Promise<void>;
export class ContextMenu {
	private static readonly _intercepts = [
		intercept([`contextMenu/OPEN_MEDIA_ITEM`], ([mediaItem]) => {
			(async () => {
				this._onOpen({ type: "TRACK" }, await this.getTrackItems([mediaItem.id]));
			})();
		}),
		intercept([`contextMenu/OPEN_MULTI_MEDIA_ITEM`], ([mediaItems]) => {
			(async () => {
				this._onOpen({ type: "TRACK" }, await this.getTrackItems(mediaItems.ids));
			})();
		}),
		intercept("contextMenu/OPEN", ([info]) => {
			switch (info.type) {
				case "ALBUM": {
					AlbumCache.getTrackItems(info.id).then((trackItems) => {
						if (trackItems !== undefined) this._onOpen({ type: "ALBUM", albumId: info.id }, trackItems);
					});
					break;
				}
				case "PLAYLIST": {
					PlaylistCache.getTrackItems(info.id).then((trackItems) => {
						if (trackItems !== undefined) this._onOpen({ type: "PLAYLIST", playlistId: info.id }, trackItems);
					});
					break;
				}
			}
		}),
	];
	private static async getTrackItems(mediaIds: ItemId[]): Promise<TrackItem[]> {
		const tracks = await Promise.all(mediaIds.map(MediaItemCache.ensureTrack.bind(MediaItemCache)));
		return tracks.filter((item) => item !== undefined);
	}
	private static _onOpen(contextSource: ContextSource, trackItems: TrackItem[]): void {
		setTimeout(async () => {
			let tries = 0;
			let contextMenu = document.querySelector(`[data-type="list-container__context-menu"]`);
			while (contextMenu === null && tries < 50) {
				await new Promise((res) => setTimeout(res, 50));
				contextMenu = document.querySelector(`[data-type="list-container__context-menu"]`);
			}
			if (contextMenu === null) return;
			for (const listener of this._listeners) listener(contextSource, contextMenu, trackItems).catch(libTrace.err.withContext("ContextMenu.listener"));
		});
	}
	private static _listeners: ContextListener[] = [];
	public static onOpen(listener: ContextListener): void {
		ContextMenu._listeners.push(listener);
	}
	public static onUnload(): void {
		this._intercepts.forEach((unload) => unload());
	}
}
