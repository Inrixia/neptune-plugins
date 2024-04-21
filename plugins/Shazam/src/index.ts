import { Playlist } from "neptune-types/tidal";
import { ISRCResponse } from "./types/isrcTypes";
import { ShazamData } from "./types/shazamTypes";

const { default: init, recognizeBytes } = require("shazamio-core/web");

import { actions, store, intercept } from "@neptune";
import { ActionType, CallbackFunction, PayloadActionTypeTuple } from "neptune-types/api/intercept";

const parseResponse = async <T>(responseP: Promise<Response> | Response): Promise<T> => {
	const response = await responseP;
	if (!response.ok) throw new Error(`Status ${response.status}`);
	return response.json();
};

const fetchShazamData = async (signature: { samplems: number; uri: string }) => {
	return parseResponse<ShazamData>(
		fetch(`https://shazamwow.com/shazam`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ signature }),
		})
	);
};

const fetchIsrc = async (isrc: string) => {
	return parseResponse<ISRCResponse>(fetch(`https://shazamwow.com/isrc?isrc=${isrc}&countryCode=US&limit=100`));
};

init();

const interceptPromise = <RESAT extends ActionType, REJAT extends ActionType>(resActionType: RESAT, rejActionType: REJAT, timeoutMs = 5000): Promise<PayloadActionTypeTuple<RESAT>> => {
	let res: CallbackFunction<RESAT>;
	let rej: CallbackFunction<REJAT>;
	const p = new Promise<PayloadActionTypeTuple<RESAT>>((_res, _rej) => {
		res = _res;
		rej = _rej;
	});
	const unloadRes = intercept(resActionType, res!, true);
	const unloadRej = intercept(rejActionType, rej!, true);
	const timeout = setTimeout(rej!, timeoutMs);
	return p.finally(() => {
		clearTimeout(timeout);
		unloadRes();
		unloadRej();
	});
};

const shazamTitle = "Shazam";
const getShazamPlaylist = async (): Promise<Playlist> => {
	for (const playlist of store.getState().content.playlists) {
		if (playlist[1].title === shazamTitle) return playlist[1];
	}
	actions.folders.createPlaylist({ description: "", title: shazamTitle, folderId: "root" });

	const [{ playlist }] = await interceptPromise("content/LOAD_PLAYLIST_SUCCESS", "content/LOAD_PLAYLIST_FAIL");
	if (playlist.title !== "Shazam") throw new Error("Failed to load Shazam playlist");
	return playlist;
};

const addToShazamPlaylist = async (mediaItemIdsToAdd: string[]) => {
	const { uuid } = await getShazamPlaylist();
	actions.content.addMediaItemsToPlaylist({ mediaItemIdsToAdd, onDupes: "SKIP", playlistUUID: uuid! });
	await interceptPromise("content/ADD_MEDIA_ITEMS_TO_PLAYLIST_SUCCESS", "content/ADD_MEDIA_ITEMS_TO_PLAYLIST_FAIL");
	actions.content.loadPlaylist({ playlistUUID: uuid! });
	actions.content.loadListItemsPage({ listName: `playlists/${uuid!}`, listType: "mediaItems", reset: true });
	await interceptPromise("content/LOAD_PLAYLIST_SUCCESS", "content/LOAD_PLAYLIST_FAIL");
	await interceptPromise("content/LOAD_LIST_ITEMS_PAGE_SUCCESS", "content/LOAD_LIST_ITEMS_PAGE_FAIL");
};

// Define the function
const handleDrop = async (event: DragEvent) => {
	event.preventDefault();
	event.stopPropagation();
	const bytes = await event.dataTransfer?.files[0].arrayBuffer();
	console.log(bytes);
	if (bytes !== undefined) {
		const sigs = recognizeBytes(new Uint8Array(bytes));
		for (const sig of sigs) {
			const shazamData = await fetchShazamData({ samplems: sig.samplems, uri: sig.uri });
			console.log(shazamData, sig);
			if (shazamData.matches.length > 0) {
				const isrc = shazamData.track?.isrc;
				const isrcData = isrc !== undefined ? await fetchIsrc(isrc).catch(() => undefined) : undefined;
				const ids = (isrcData?.data ?? []).map((track) => track.id);
				console.log(ids);
				addToShazamPlaylist(ids);
				return;
			}
		}
	}
};

// Register the event listener
document.addEventListener("drop", handleDrop);

// Later, when you need to unregister the event listener
export const onUnload = () => document.removeEventListener("drop", handleDrop);
