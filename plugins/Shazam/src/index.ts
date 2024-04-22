import { Playlist } from "neptune-types/tidal";
import { ISRCResponse } from "./types/isrcTypes";
import { ShazamData } from "./types/shazamTypes";

const { default: init, recognizeBytes } = require("shazamio-core/web");
init();

import { actions, store } from "@neptune";
import { DecodedSignature } from "shazamio-core";
import { interceptPromise } from "../../../lib/interceptPromise";
import { messageError, messageWarn, messageInfo } from "../../../lib/messageLogging";

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

const shazamTitle = "Shazam";
const getShazamPlaylist = async (): Promise<Playlist> => {
	for (const playlist of store.getState().content.playlists) {
		if (playlist[1].title === shazamTitle) return playlist[1];
	}
	actions.folders.createPlaylist({ description: "", title: shazamTitle, folderId: "root" });

	const [{ playlist }] = await interceptPromise(["content/LOAD_PLAYLIST_SUCCESS"], ["content/LOAD_PLAYLIST_FAIL"]);
	if (playlist.title !== "Shazam") throw new Error("Failed to load Shazam playlist");
	return playlist;
};

const addToPlaylist = async (playlistUUID: string, mediaItemIdsToAdd: string[]) => {
	actions.content.addMediaItemsToPlaylist({ mediaItemIdsToAdd, onDupes: "SKIP", playlistUUID });
	await interceptPromise(["etag/SET_PLAYLIST_ETAG", "content/ADD_MEDIA_ITEMS_TO_PLAYLIST_SUCCESS"], ["content/ADD_MEDIA_ITEMS_TO_PLAYLIST_FAIL"]);
	actions.content.loadListItemsPage({ listName: `playlists/${playlistUUID}`, listType: "mediaItems", reset: false });
	setTimeout(() => actions.content.loadListItemsPage({ listName: `playlists/${playlistUUID}`, listType: "mediaItems", reset: true }), 1000);
};

export const using = async <T>(signatures: DecodedSignature[], fun: (signatures: ReadonlyArray<DecodedSignature>) => T) => {
	const ret = await fun(signatures);
	for (const signature of signatures) signature.free();
	return ret;
};

// Define the function
const handleDrop = async (event: DragEvent) => {
	event.preventDefault();
	event.stopPropagation();

	// @ts-expect-error TS Api
	const { pathname, params } = store.getState().router;

	if (!pathname.startsWith("/playlist/")) {
		return messageError(`This is not a playlist!`);
	}
	const playlistUUID: string = params.id;
	for (const file of event.dataTransfer?.files ?? []) {
		const bytes = await file.arrayBuffer();
		if (bytes === undefined) continue;
		await using(recognizeBytes(new Uint8Array(bytes), 25), async (signatures) => {
			for (const sig of signatures) {
				const shazamData = await fetchShazamData({ samplems: sig.samplems, uri: sig.uri });
				if (shazamData.matches.length === 0) return messageWarn(`No matches for ${file.name}`);

				const trackName = shazamData.track?.share?.subject ?? "Unknown";
				const isrc = shazamData.track?.isrc;
				const isrcData = isrc !== undefined ? await fetchIsrc(isrc).catch(() => undefined) : undefined;
				const ids = (isrcData?.data ?? []).map((track) => track.id);
				if (ids.length > 0) {
					messageInfo(`Adding ${trackName} to playlist`);
					await addToPlaylist(playlistUUID, ids);
				} else {
					console.log("SHAZ", shazamData);
					messageWarn(`Track ${trackName} is not avalible in Tidal`);
				}
			}
		});
	}
};

// Register the event listener
document.addEventListener("drop", handleDrop);

// Later, when you need to unregister the event listener
export const onUnload = () => document.removeEventListener("drop", handleDrop);
