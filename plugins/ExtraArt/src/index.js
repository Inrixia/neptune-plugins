import { getState } from "@neptune/store";
import confetti from "canvas-confetti";
confetti();

// window.neptune.store.getState().content.mediaItems.get("179547033")
// item.album.cover
// 34a566c0-8061-4a25-86d1-4beb48596a23
// https://resources.tidal.com/images/34a566c0/8061/4a25/86d1/4beb48596a23/80x80.jpg

const generateBaseImageUrl = (id) => {
	// Validate that the input ID is in the expected format
	if (!id || typeof id !== "string" || !id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
		return null;
	}
	// Break the ID into its constituent parts
	const parts = id.split("-");

	return `https://resources.tidal.com/images/${parts[0]}/${parts[1]}/${parts[2]}/${parts[3]}/${parts[4]}`;
};

const patchTrackList = () => {
	const trackList = document.querySelector(`[aria-label="Tracklist"]`);
	if (trackList === null) return;

	const listIndexHeader = trackList.querySelector(`[role="columnheader"]`);
	if (listIndexHeader === null) return;
	listIndexHeader.style.flex = "0 0 56px";
};

const processItems = () => {
	const elements = document.querySelectorAll(`[data-track-id]`);
	if (elements.length === 0) return;

	const mediaItems = getState().content.mediaItems;

	patchTrackList();

	for (const elem of elements) {
		const hasAlbumArt = elem.querySelector(`img`) !== null;
		if (hasAlbumArt) continue;

		const coverId = mediaItems.get(elem.getAttribute("data-track-id"))?.item?.album?.cover;
		if (coverId === null) continue;

		const baseUrl = generateBaseImageUrl(coverId);
		if (baseUrl === null) continue;

		// Create the img element
		const img = document.createElement("img");
		img.src = `${baseUrl}/80x80.jpg`;
		img.srcset = `${baseUrl}/80x80.jpg 80w, ${baseUrl}/160x160.jpg 160w, ${baseUrl}/320x320.jpg 320w, ${baseUrl}/640x640.jpg 640w, ${baseUrl}/1280x1280.jpg 1280w`;
		img.sizes = "42px";
		img.loading = "lazy";
		img.decoding = "async";
		img.draggable = false;
		img.alt = "";
		img.setAttribute("data-prevent-search-close", "true");

		elem.firstChild.querySelector("[data-test-is-playing]").remove();
		elem.firstChild.prepend(img);
	}
};

let timeoutId;
const debouncedProcessItems = () => {
	clearTimeout(timeoutId);
	timeoutId = setTimeout(() => {
		observer.disconnect();
		processItems();
		observer.observe(document.body, { childList: true, subtree: true });
	}, 5);
};
const observer = new MutationObserver(debouncedProcessItems);
// Start observing the document with the configured parameters
observer.observe(document.body, { childList: true, subtree: true });

export const onUnload = () => observer.disconnect();
