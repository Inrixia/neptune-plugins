import "@inrixia/lib/contentButton.styles";

import { TrackItem } from "neptune-types/tidal";
import { parseFileName, pathSeparator } from "./parseFileName";

import { Tracer } from "@inrixia/lib/trace";
const trace = Tracer("[SongDownloader]");

import safeUnload from "@inrixia/lib/safeUnload";

import { settings } from "./Settings";
import { ContextMenu } from "@inrixia/lib/ContextMenu";
import { PlaybackInfoCache } from "@inrixia/lib/Caches/PlaybackInfoCache";
import { openDialog, saveDialog } from "@inrixia/lib/nativeBridge";
import { startTrackDownload, getDownloadProgress } from "@inrixia/lib/nativeBridge/request";
import { makeTags } from "@inrixia/lib/makeTags";
import { ExtendedMediaItem } from "@inrixia/lib/Caches/ExtendedTrackItem";
import { MaxTrack } from "@inrixia/lib/MaxTrack";
import { AudioQuality } from "@inrixia/lib/AudioQualityTypes";
import { dialog } from "electron";
export { Settings } from "./Settings";

type DownloadButtoms = Record<string, HTMLButtonElement>;
const downloadButtons: DownloadButtoms = {};

interface ButtonMethods {
	prep(): void;
	onProgress(info: { total: number; downloaded: number; percent: number }): void;
	set(textContent: string): void;
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
	set: (textContent: string) => {
		const downloadButton = downloadButtons[id];
		downloadButton.textContent = textContent;
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
	document.getElementById("download-button")?.remove();
	if (trackItems.length === 0) return;

	const downloadButton = document.createElement("button");
	downloadButton.type = "button";
	downloadButton.role = "menuitem";
	downloadButton.textContent = trackItems.length > 1 ? `Download ${trackItems.length} tracks` : "Download track";
	downloadButton.id = "download-button";
	downloadButton.className = "context-button"; // Set class name for styling

	const context = JSON.stringify(trackItems.map((trackItem) => trackItem.id).sort());

	if (downloadButtons[context]?.disabled === true) {
		downloadButton.disabled = true;
		downloadButton.classList.add("loading");
	}
	downloadButtons[context] = downloadButton;
	const updateMethods = buttonMethods(context);
	contextMenu.appendChild(downloadButton);

	downloadButton.addEventListener("click", async () => {
		if (context === undefined) return;
		let folderPath;
		if (settings.alwaysUseDefaultPath) folderPath = settings.defaultDownloadPath;
		else if (trackItems.length > 1) {
			updateMethods.set("Prompting for download folder...");
			const dialogResult = await openDialog({ properties: ["openDirectory", "createDirectory"], defaultPath: folderPath });
			if (dialogResult.canceled) return updateMethods.clear();
			folderPath = dialogResult.filePaths[0];
		}
		updateMethods.prep();
		for (const trackItem of trackItems) {
			if (trackItem.id === undefined) continue;
			await downloadTrack(trackItem, updateMethods, folderPath).catch(trace.msg.err.withContext("Error downloading track"));
		}
		updateMethods.clear();
	});
});

const downloadTrack = async (trackItem: TrackItem, updateMethods: ButtonMethods, folderPath?: string) => {
	let trackId = trackItem.id!;
	if (settings.useRealMAX && settings.desiredDownloadQuality === AudioQuality.HiRes) {
		updateMethods.set("Checking RealMAX for better quality...");
		const maxTrack = await MaxTrack.getMaxTrack(trackId);
		if (maxTrack !== false) trackId = +maxTrack.id!;
	}

	updateMethods.set("Fetching playback info & tags...");
	const playbackInfo = PlaybackInfoCache.ensure(trackId, settings.desiredDownloadQuality);
	const metaTags = makeTags((await ExtendedMediaItem.get(trackId))!);
	const pathInfo = parseFileName(await metaTags, await playbackInfo);

	pathInfo.basePath = folderPath;
	if (folderPath === undefined) {
		updateMethods.set("Prompting for download path...");
		const fileName = pathInfo.fileName;
		const dialogResult = await saveDialog({ defaultPath: `${folderPath ?? ""}${pathSeparator}${fileName}`, filters: [{ name: "", extensions: [fileName ?? "*"] }] });
		if (dialogResult.canceled) return updateMethods.clear();
		const dialogParts = dialogResult.filePath.split(pathSeparator);
		dialogParts.pop();
		pathInfo.basePath = dialogParts.join(pathSeparator);
	}

	updateMethods.set("Downloading...");
	let downloadEnded = false;
	const downloadComplete = startTrackDownload(await playbackInfo, pathInfo, await metaTags).finally(() => (downloadEnded = true));

	const pathKey = JSON.stringify(pathInfo);
	const updateDownloadProgress = async () => {
		const downloadProgress = await getDownloadProgress(pathKey);
		if (downloadProgress !== undefined) updateMethods.onProgress(downloadProgress);
		if (!downloadEnded) setTimeout(updateDownloadProgress, 100);
	};
	updateDownloadProgress();
	return downloadComplete;
};
