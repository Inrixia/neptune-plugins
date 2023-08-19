import confetti from "canvas-confetti";

import { getState } from "@neptune/store";
import { intercept } from "@neptune";
import { storage } from "@plugin";

import { unloadStyles } from "./styles";
export { Settings } from "./Settings";
confetti();

// window.go = () => {
// 	downloadSong(307576013, AudioQuality.HiRes);
// };

const unloadIntercept = intercept(`contextMenu/OPEN_MEDIA_ITEM`, ([mediaItem]) =>
	setTimeout(() => {
		const mediaItemInfo = getState().content.mediaItems.get(mediaItem.id.toString());

		console.log(storage.desiredDownloadQuality);

		const contextMenu = document.querySelector(`[data-type="list-container__context-menu"]`);

		const downloadButton = document.createElement("button");
		downloadButton.type = "button";
		downloadButton.role = "menuitem";
		downloadButton.textContent = "Download";
		downloadButton.className = "download-button"; // Set class name for styling

		contextMenu.appendChild(downloadButton);

		console.log(mediaItemInfo, contextMenu);
	})
);

export const onUnload = () => {
	unloadIntercept();
	unloadStyles();
};
