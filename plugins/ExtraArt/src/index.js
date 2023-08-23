import { getState } from "@neptune/store";

const generateBaseImageUrl = (id) => {
	// Validate that the input ID is in the expected format
	if (!id || typeof id !== "string" || !id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
		return null;
	}
	// Break the ID into its constituent parts
	const parts = id.split("-");

	return `https://resources.tidal.com/images/${parts[0]}/${parts[1]}/${parts[2]}/${parts[3]}/${parts[4]}`;
};

const newFlex = "0 0 56px";
const patchTrackList = () => {
	const trackList = document.querySelector(`[aria-label="Tracklist"]`);
	if (trackList === null) return;

	const listIndexHeader = trackList.querySelector(`[role="columnheader"]`);
	if (listIndexHeader === null) return;
	listIndexHeader.style.flex = newFlex;
};

const processItems = () => {
	const elements = document.querySelectorAll(`[data-track-id]`);
	if (elements.length === 0) return;
	observer.disconnect();

	const mediaItems = getState().content.mediaItems;

	patchTrackList();
	console.log("do update!")

	for (const elem of elements) {
		let img = elem.querySelector(`img`) ?? document.createElement("img");

		const coverId = mediaItems.get(elem.getAttribute("data-track-id"))?.item?.album?.cover;
		if (coverId === null) continue;

		const baseUrl = generateBaseImageUrl(coverId);
		if (baseUrl === null) continue;

		// Create the img element
		img.src = `${baseUrl}/80x80.jpg`;
		img.srcset = `${baseUrl}/80x80.jpg 80w, ${baseUrl}/160x160.jpg 160w, ${baseUrl}/320x320.jpg 320w, ${baseUrl}/640x640.jpg 640w, ${baseUrl}/1280x1280.jpg 1280w`;
		img.sizes = "42px";
		img.loading = "lazy";
		img.decoding = "async";
		img.draggable = false;
		img.alt = "";
		img.setAttribute("data-prevent-search-close", "true");

		const somethingIForgor = elem.firstChild.querySelector("[data-test-is-playing]");
		if (somethingIForgor !== null) somethingIForgor.remove();

		if (!elem.firstChild?.firstChild?.firstChild) continue;

		elem.firstChild.style.flex = newFlex;
		elem.firstChild.firstChild.firstChild.style.width = "56px";
		elem.firstChild.prepend(img);
	}
	observer.observe(document.body, { childList: true, subtree: true });
};

let timeoutId;
const debouncedProcessItems = () => {
	if (timeoutId === undefined) processItems();
	clearTimeout(timeoutId);
	timeoutId = setTimeout(() => {
		processItems();
		timeoutId = undefined;
	}, 5);
};
const observer = new MutationObserver(debouncedProcessItems);
// Start observing the document with the configured parameters
observer.observe(document.body, { childList: true, subtree: true });

export const onUnload = () => observer.disconnect();
