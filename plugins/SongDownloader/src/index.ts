import { intercept, actions, store } from "@neptune";

// @ts-expect-error Remove this when types are available
import { storage } from "@plugin";

import "./styles";
export { Settings } from "./Settings";

import { fetchTrack, DownloadTrackOptions, TrackOptions } from "../../../lib/trackBytes/download";
import { ItemId, MediaItem, TrackItem, VideoItem } from "neptune-types/tidal";
import { saveFile } from "./lib/saveFile";

import { interceptPromise } from "../../../lib/intercept/interceptPromise";

import { messageError } from "../../../lib/messageLogging";
import { addMetadata } from "./addMetadata";
import { fileNameFromInfo } from "./lib/fileName";
import { toBuffer } from "../../../lib/fetch";
import { TrackItemCache } from "../../../lib/Caches/TrackItemCache";

type DownloadButtoms = Record<string, HTMLButtonElement>;
const downloadButtons: DownloadButtoms = {};

interface ButtonMethods {
	prep(): void;
	onProgress(info: { total: number; downloaded: number; percent: number }): void;
	clear(): void;
}

const buttonMethods = (id: string): ButtonMethods => ({
	prep: () => {
		const downloadButton = downloadButtons[id];
		downloadButton.disabled = true;
		downloadButton.classList.add("loading");
		downloadButton.textContent = "Fetching Meta...";
	},
	onProgress: ({ total, downloaded, percent }) => {
		const downloadButton = downloadButtons[id];
		downloadButton.style.setProperty("--progress", `${percent}%`);
		const downloadedMB = (downloaded / 1048576).toFixed(0);
		const totalMB = (total / 1048576).toFixed(0);
		downloadButton.textContent = `Downloading... ${downloadedMB}/${totalMB}MB ${percent.toFixed(0)}%`;
	},
	clear: () => {
		const downloadButton = downloadButtons[id];
		downloadButton.classList.remove("loading");
		downloadButton.disabled = false;
		downloadButton.style.removeProperty("--progress");
		downloadButton.textContent = `Download`;
	},
});

const intercepts = [
	intercept([`contextMenu/OPEN_MEDIA_ITEM`], ([mediaItem]) => queueMediaIds([mediaItem.id])),
	intercept([`contextMenu/OPEN_MULTI_MEDIA_ITEM`], ([mediaItems]) => queueMediaIds(mediaItems.ids)),
	intercept("contextMenu/OPEN", ([info]) => {
		switch (info.type) {
			case "ALBUM": {
				onAlbum(info.id);
				break;
			}
			case "PLAYLIST": {
				onPlaylist(info.id);
				break;
			}
		}
	}),
];
export const onUnload = () => intercepts.forEach((unload) => unload());

const onAlbum = async (albumId: ItemId) => {
	const [{ mediaItems }] = await interceptPromise(
		() => actions.content.loadAllAlbumMediaItems({ albumId }),
		["content/LOAD_ALL_ALBUM_MEDIA_ITEMS_SUCCESS"],
		["content/LOAD_ALL_ALBUM_MEDIA_ITEMS_FAIL"]
	);
	downloadItems(Object.values<MediaItem>(<any>mediaItems).map((mediaItem) => mediaItem.item));
};
const onPlaylist = async (playlistUUID: ItemId) => {
	const [{ items }] = await interceptPromise(
		() => actions.content.loadListItemsPage({ loadAll: true, listName: `playlists/${playlistUUID}`, listType: "mediaItems" }),
		["content/LOAD_LIST_ITEMS_PAGE_SUCCESS"],
		["content/LOAD_LIST_ITEMS_PAGE_FAIL"]
	);
	downloadItems(Object.values(items).map((mediaItem) => mediaItem?.item));
};

const queueMediaIds = (mediaIds: ItemId[]) => {
	downloadItems(mediaIds.map((mediaId) => TrackItemCache.get(mediaId)).filter((item) => item !== undefined));
};

const downloadItems = (items: (TrackItem | VideoItem)[]) =>
	// Wrap in a timeout to ensure that the context menu is open
	setTimeout(() => {
		const trackItems = items.filter((item) => item.contentType === "track");
		if (trackItems.length === 0) return;

		const contextMenu = document.querySelector(`[data-type="list-container__context-menu"]`);
		if (contextMenu === null) return;
		if (document.getElementsByClassName("download-button").length >= 1) {
			document.getElementsByClassName("download-button")[0].remove();
		}

		const downloadButton = document.createElement("button");
		downloadButton.type = "button";
		downloadButton.role = "menuitem";
		downloadButton.textContent = `Download ${trackItems.length}`;
		downloadButton.className = "download-button"; // Set class name for styling

		const context = JSON.stringify(trackItems.map((trackItem) => trackItem.id));

		if (downloadButtons[context]?.disabled === true) {
			downloadButton.disabled = true;
			downloadButton.classList.add("loading");
		}
		downloadButtons[context] = downloadButton;
		contextMenu.appendChild(downloadButton);
		const { prep, onProgress, clear } = buttonMethods(context);
		downloadButton.addEventListener("click", async () => {
			if (context === undefined) return;
			prep();
			for (const trackItem of trackItems) {
				if (trackItem.id === undefined) continue;
				await downloadTrack(trackItem, { trackId: trackItem.id, desiredQuality: storage.desiredDownloadQuality }, { onProgress }).catch((err) => {
					messageError(err.message);
					console.error(err);
				});
			}
			clear();
		});
	});

export const downloadTrack = async (track: TrackItem, trackOptions: TrackOptions, options?: DownloadTrackOptions) => {
	// Download the bytes
	const trackInfo = await fetchTrack(trackOptions, options);
	const bufferWithTags = await addMetadata(trackInfo, track);

	return saveFile(new Blob([bufferWithTags ?? (await toBuffer(trackInfo.stream))], { type: "application/octet-stream" }), fileNameFromInfo(track, trackInfo));
};
