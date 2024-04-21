import { Playlist } from "neptune-types/tidal";
import { ISRCResponse } from "./types/isrcTypes";
import { ShazamData } from "./types/shazamTypes";

const { default: init, recognizeBytes } = require("shazamio-core/web");

import { actions, store, intercept } from "@neptune";
import { ActionType, CallbackFunction, PayloadActionTypeTuple } from "neptune-types/api/intercept";
import { DecodedSignature } from "shazamio-core";

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

const interceptPromise = <RESAT extends ActionType, REJAT extends ActionType>(resActionType: RESAT[], rejActionType: REJAT[], timeoutMs = 5000): Promise<PayloadActionTypeTuple<RESAT>> => {
	let res: CallbackFunction<RESAT>;
	let rej: (err: PayloadActionTypeTuple<REJAT> | string) => void;
	const p = new Promise<PayloadActionTypeTuple<RESAT>>((_res, _rej) => {
		res = _res;
		rej = _rej;
	});
	const unloadRes = intercept(resActionType, res!, true);
	const unloadRej = intercept(rejActionType, rej!, true);
	const timeout = setTimeout(() => rej(`${rejActionType}_TIMEOUT`), timeoutMs);
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

	const [{ playlist }] = await interceptPromise(["content/LOAD_PLAYLIST_SUCCESS"], ["content/LOAD_PLAYLIST_FAIL"]);
	if (playlist.title !== "Shazam") throw new Error("Failed to load Shazam playlist");
	return playlist;
};

const addToPlaylist = async (playlistUUID: string, mediaItemIdsToAdd: string[]) => {
	actions.content.addMediaItemsToPlaylist({ mediaItemIdsToAdd, onDupes: "SKIP", playlistUUID });
	await interceptPromise(["etag/SET_PLAYLIST_ETAG", "content/ADD_MEDIA_ITEMS_TO_PLAYLIST_SUCCESS"], ["content/ADD_MEDIA_ITEMS_TO_PLAYLIST_FAIL"]);
	setTimeout(() => actions.content.loadListItemsPage({ listName: `playlists/${playlistUUID}`, listType: "mediaItems", reset: true }), 1000);
};

export const using = async <T>(signatures: DecodedSignature[], fun: (signatures: ReadonlyArray<DecodedSignature>) => T) => {
	const ret = await fun(signatures);
	for (const signature of signatures) signature.free();
	return ret;
};

const messageError = (message: string) => actions.message.messageError({ message, category: "OTHER", severity: "ERROR" });
const messageWarn = (message: string) => actions.message.messageWarn({ message, category: "OTHER", severity: "WARN" });
const messageInfo = (message: string) => actions.message.messageInfo({ message, category: "OTHER", severity: "INFO" });

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
		await using(recognizeBytes(new Uint8Array(bytes)), async (signatures) => {
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
