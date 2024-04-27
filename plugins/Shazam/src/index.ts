import type * as shazamio from "shazamio-core/web";
const { default: init, recognizeBytes } = <typeof shazamio>require("shazamio-core/web");
init();

import { actions, store } from "@neptune";
import { DecodedSignature } from "shazamio-core";
import { interceptPromise } from "../../../lib/interceptPromise";
import { messageError, messageWarn, messageInfo } from "../../../lib/messageLogging";
import { fetchShazamData, fetchIsrc } from "./fetch";

// @ts-expect-error Remove this when types are available
import { storage } from "@plugin";

export { Settings } from "./Settings";

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

		try {
			await using(recognizeBytes(new Uint8Array(bytes), 0, Number.MAX_SAFE_INTEGER), async (signatures) => {
				let i = storage.startInMiddle ? Math.floor(signatures.length / 2) : 1;
				for (; i < signatures.length; i += 4) {
					messageInfo(`Matching ${file.name}...`);
					const sig = signatures[i];
					const shazamData = await fetchShazamData({ samplems: sig.samplems, uri: sig.uri });
					if (shazamData.matches.length === 0) continue;

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
					if (storage.exitOnFirstMatch) return;
				}
				messageWarn(`No matches for ${file.name}`);
			});
		} catch (err) {
			messageError(`Failed to recognize ${file.name}: ${(<Error>err).message}`);
		}
	}
};

// Register the event listener
document.addEventListener("drop", handleDrop);

// Later, when you need to unregister the event listener
export const onUnload = () => document.removeEventListener("drop", handleDrop);
