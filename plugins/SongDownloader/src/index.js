import confetti from "canvas-confetti";

import { getState } from "@neptune/store";
import { intercept } from "@neptune";
import { storage } from "@plugin";

import { unloadStyles } from "./styles";
export { Settings } from "./Settings";

import { downloadSong } from "./downloadSong";

confetti();

const downloadButtons = {};

const buttonMethods = (id) => ({
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

const unloadIntercept = intercept(`contextMenu/OPEN_MEDIA_ITEM`, ([mediaItem]) =>
	setTimeout(() => {
		const mediaInfo = getState().content.mediaItems.get(mediaItem.id.toString())?.item;

		const contextMenu = document.querySelector(`[data-type="list-container__context-menu"]`);

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
			prep();
			downloadSong(mediaInfo.id, fileName, storage.desiredDownloadQuality, tick).then(clear);
		});
	})
);

export const onUnload = () => {
	unloadIntercept();
	unloadStyles();
};
