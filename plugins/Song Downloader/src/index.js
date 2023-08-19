import confetti from "canvas-confetti";

import { appendStyle } from "@neptune/utils";
import { getState } from "@neptune/store";
import { intercept } from "@neptune";
confetti();

// window.go = () => {
// 	downloadSong(307576013, AudioQuality.HiRes);
// };

const unloadIntercept = intercept(`contextMenu/OPEN_MEDIA_ITEM`, ([mediaItem]) =>
	setTimeout(() => {
		const mediaItemInfo = getState().content.mediaItems.get(mediaItem.id.toString());

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

const unloadStyles = appendStyle(`
.download-button {
	align-items: center;
	display: flex;
	font-weight: 500;
	padding: 14px 16px;
	width: 100%;
	flex-grow: 1;
	height: 1.72rem;
	color: #b878ff;
}
.download-button:hover {
	background-color: #9e46ff;
	color: #fff;
}
`);

export const onUnload = () => {
	unloadIntercept();
	unloadStyles();
};
