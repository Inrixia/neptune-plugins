import { store } from "@neptune";
import { intercept } from "@neptune";

// @ts-expect-error Remove this when types are available
import { storage } from "@plugin";

import "./styles";
export { Settings } from "./Settings";

import { downloadTrack, DownloadTrackOptions, TrackOptions } from "../../../lib/download";
import { MediaItem, TrackItem } from "neptune-types/tidal";
import { ExtendedPlayackInfo, ManifestMimeType } from "../../../lib/getStreamInfo";
import { saveFile } from "./saveFile";

type DownloadButtoms = Record<number, HTMLButtonElement>;
const downloadButtons: DownloadButtoms = {};

interface ButtonMethods {
	prep(): void;
	onProgress(info: { total: number; downloaded: number; percent: number }): void;
	clear(): void;
}

const buttonMethods = (id: number): ButtonMethods => ({
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

const unloadIntercept = intercept(`contextMenu/OPEN_MEDIA_ITEM`, ([mediaItem]) => {
	setTimeout(() => {
		const mediaItems: Record<number, MediaItem> = store.getState().content.mediaItems;
		const mediaInfo = mediaItems[+mediaItem.id]?.item;

		if (mediaInfo?.contentType !== "track" || mediaInfo.id === undefined) return;

		const contextMenu = document.querySelector(`[data-type="list-container__context-menu"]`);
		if (contextMenu === null) return;

		if (document.getElementsByClassName("download-button").length >= 1) {
			document.getElementsByClassName("download-button")[0].remove();
		}

		const downloadButton = document.createElement("button");
		downloadButton.type = "button";
		downloadButton.role = "menuitem";
		downloadButton.textContent = "Download";
		downloadButton.className = "download-button"; // Set class name for styling

		if (downloadButtons[mediaInfo.id]?.disabled === true) {
			downloadButton.disabled = true;
			downloadButton.classList.add("loading");
		}
		downloadButtons[mediaInfo.id] = downloadButton;

		contextMenu.appendChild(downloadButton);

		const { prep, onProgress, clear } = buttonMethods(mediaInfo.id);
		downloadButton.addEventListener("click", () => {
			if (mediaInfo.id === undefined) return;
			prep();
			saveTrack(mediaInfo, { songId: mediaInfo.id, desiredQuality: storage.desiredDownloadQuality }, { onProgress }).catch(alert).finally(clear);
		});
	});
});

export const fileNameFromInfo = (track: TrackItem, { manifest, manifestMimeType }: ExtendedPlayackInfo): string => {
	const artistName = track.artists?.[0].name;
	const base = `${track.title} by ${artistName ?? "Unknown"}`;
	switch (manifestMimeType) {
		case ManifestMimeType.Tidal: {
			const codec = manifest.codecs !== "flac" ? `.${manifest.codecs}` : "";
			return `${base}${codec.toLowerCase()}.flac`;
		}
		case ManifestMimeType.Dash: {
			const trackManifest = manifest.tracks.audios[0];
			return `${base}.${trackManifest.codec.toLowerCase()}.mp4`;
		}
	}
};

export const saveTrack = async (track: TrackItem, trackOptions: TrackOptions, options?: DownloadTrackOptions) => {
	// Download the bytes
	const trackInfo = await downloadTrack(trackOptions, options);

	// Prompt the user to save the file
	saveFile(new Blob([trackInfo.buffer], { type: "application/octet-stream" }), fileNameFromInfo(track, trackInfo));
};

export const onUnload = unloadIntercept;
