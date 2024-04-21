import { store } from "@neptune";
import { intercept } from "@neptune";

// @ts-expect-error Remove this when types are available
import { storage } from "@plugin";

import "./styles";
export { Settings } from "./Settings";

import { downloadSong } from "../../../lib/download";
import { MediaItem } from "neptune-types/tidal";

type DownloadButtoms = Record<number, HTMLButtonElement>;
const downloadButtons: DownloadButtoms = {};

interface ButtonMethods {
	prep(): void;
	tick(info: { total: number; downloaded: number; percent: number }): void;
	clear(): void;
}

const buttonMethods = (id: number): ButtonMethods => ({
	prep: () => {
		const downloadButton = downloadButtons[id];
		downloadButton.disabled = true;
		downloadButton.classList.add("loading");
		downloadButton.textContent = "Fetching Meta...";
	},
	tick: ({ total, downloaded, percent }) => {
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

		const artist = mediaInfo.artist ?? mediaInfo.artists?.[0];
		const artistPostfix = artist !== undefined ? ` by ${artist.name}` : "";

		const fileName = `${mediaInfo.title}${artistPostfix}`;

		const { prep, tick, clear } = buttonMethods(mediaInfo.id);
		downloadButton.addEventListener("click", () => {
			if (mediaInfo.id === undefined) return;
			prep();
			downloadSong(mediaInfo.id, fileName, storage.desiredDownloadQuality, tick).catch(alert).finally(clear);
		});
	});
});

export const onUnload = unloadIntercept;
