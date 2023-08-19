import confetti from "canvas-confetti";

import { getState } from "@neptune/store";
import { intercept } from "@neptune";
import { storage } from "@plugin";

import { unloadStyles } from "./styles";
export { Settings } from "./Settings";

import { downloadSong } from "./downloadSong";

confetti();

const getMediaItem = (id) => getState().content.mediaItems.get(id.toString());

const unloadIntercept = intercept(`contextMenu/OPEN_MEDIA_ITEM`, ([mediaItem]) =>
	setTimeout(() => {
		const mediaItemInfo = getMediaItem(mediaItem.id);
		if (mediaItemInfo === undefined) return;

		const contextMenu = document.querySelector(`[data-type="list-container__context-menu"]`);

		const downloadButton = document.createElement("button");
		downloadButton.type = "button";
		downloadButton.role = "menuitem";
		downloadButton.textContent = "Download";
		downloadButton.className = "download-button"; // Set class name for styling

		contextMenu.appendChild(downloadButton);

		downloadButton.addEventListener("click", () => downloadSong(mediaItem.id, storage.desiredDownloadQuality));
	})
);

export const onUnload = () => {
	unloadIntercept();
	unloadStyles();
};
