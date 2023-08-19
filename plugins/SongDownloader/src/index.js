import confetti from "canvas-confetti";

import { getState } from "@neptune/store";
import { intercept } from "@neptune";
import { storage } from "@plugin";

import { unloadStyles } from "./styles";
export { Settings } from "./Settings";

import { downloadSong } from "./downloadSong";
import { AudioQualityInverse } from "./AudioQuality";

confetti();

const unloadIntercept = intercept(`contextMenu/OPEN_MEDIA_ITEM`, ([mediaItem]) =>
	setTimeout(() => {
		const mediaInfo = getState().content.mediaItems.get(mediaItem.id.toString())?.item;
		if (mediaInfo === undefined) return;

		console.log(mediaInfo);

		const contextMenu = document.querySelector(`[data-type="list-container__context-menu"]`);

		const downloadButton = document.createElement("button");
		downloadButton.type = "button";
		downloadButton.role = "menuitem";
		downloadButton.textContent = "Download";
		downloadButton.className = "download-button"; // Set class name for styling

		contextMenu.appendChild(downloadButton);

		const fileName = `${mediaInfo.title} by ${mediaInfo.artist.name} [${AudioQualityInverse[mediaInfo.audioQuality]}]`;

		downloadButton.addEventListener("click", () => downloadSong(mediaInfo.id, fileName, storage.desiredDownloadQuality));
	})
);

export const onUnload = () => {
	unloadIntercept();
	unloadStyles();
};
