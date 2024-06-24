import { intercept, actions, store } from "@neptune";

import "./styles";

import { fetchTrack, DownloadTrackOptions, TrackOptions } from "@inrixia/lib/trackBytes/download";
import { ItemId, MediaItem, TrackItem, VideoItem } from "neptune-types/tidal";
import { saveFile, saveFileNode } from "./lib/saveFile";

import { interceptPromise } from "@inrixia/lib/intercept/interceptPromise";

import { addMetadata } from "./addMetadata";
import { fileNameFromInfo } from "./lib/fileName";
import { toBuffer } from "@inrixia/lib/fetch";
import { TrackItemCache } from "@inrixia/lib/Caches/TrackItemCache";

import { Tracer } from "@inrixia/lib/trace";
const trace = Tracer("[SongDownloader]");

import safeUnload from "@inrixia/lib/safeUnload";

import { settings } from "./Settings";
export { Settings } from "./Settings";

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
export const onUnload = () => {
	intercepts.forEach((unload) => unload());
	safeUnload();
};

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
	Promise.all(mediaIds.map(TrackItemCache.ensure.bind(TrackItemCache)))
		.then((tracks) => tracks.filter((item) => item !== undefined))
		.then(downloadItems);
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
				await downloadTrack(trackItem, { trackId: trackItem.id, desiredQuality: settings.desiredDownloadQuality }, { onProgress }).catch(trace.msg.err.withContext("Error downloading track"));
			}
			clear();
		});
	});

export const downloadTrack = async (track: TrackItem, trackOptions: TrackOptions, options?: DownloadTrackOptions) => {
	// Download the bytes
	const trackInfo = await fetchTrack(trackOptions, options);
	const streamWithTags = await addMetadata(trackInfo, track);
	const fileName = fileNameFromInfo(track, trackInfo);

	if (settings.defaultDownloadPath !== "") return saveFileNode(streamWithTags ?? trackInfo.stream, settings.defaultDownloadPath, fileName);
	return saveFile(streamWithTags ?? trackInfo.stream, fileName);
};
