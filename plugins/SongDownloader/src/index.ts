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
import { ContextMenu } from "@inrixia/lib/ContextMenu";
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

export const onUnload = safeUnload;

ContextMenu.onOpen(async (contextSource, contextMenu, trackItems) => {
	if (trackItems.length === 0) return;
	document.getElementById("download-button")?.remove();

	const downloadButton = document.createElement("button");
	downloadButton.type = "button";
	downloadButton.role = "menuitem";
	downloadButton.textContent = `Download ${trackItems.length}`;
	downloadButton.id = "download-button";
	downloadButton.className = "context-button"; // Set class name for styling

	const context = JSON.stringify(trackItems.map((trackItem) => trackItem.id).sort());

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
