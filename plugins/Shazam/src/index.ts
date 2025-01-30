import { actions, store } from "@neptune";
import { interceptPromise } from "@inrixia/lib/intercept/interceptPromise";

import { Tracer } from "@inrixia/lib/trace";
const trace = Tracer("[Shazam]");

import { settings } from "./Settings";
import { recognizeTrack } from "./shazam.native";
import { MaxTrack } from "@inrixia/lib/MaxTrack";
export { Settings } from "./Settings";

const addToPlaylist = async (playlistUUID: string, mediaItemIdsToAdd: string[]) => {
	await interceptPromise(
		() => actions.content.addMediaItemsToPlaylist({ mediaItemIdsToAdd, onDupes: "SKIP", playlistUUID }),
		["etag/SET_PLAYLIST_ETAG", "content/ADD_MEDIA_ITEMS_TO_PLAYLIST_SUCCESS"],
		["content/ADD_MEDIA_ITEMS_TO_PLAYLIST_FAIL"]
	);
	actions.content.loadListItemsPage({ listName: `playlists/${playlistUUID}`, listType: "mediaItems", reset: false });
	setTimeout(() => actions.content.loadListItemsPage({ listName: `playlists/${playlistUUID}`, listType: "mediaItems", reset: true }), 1000);
};

// Define the function
const handleDrop = async (event: DragEvent) => {
	event.preventDefault();
	event.stopPropagation();

	// @ts-expect-error TS Api
	const { pathname, params } = store.getState().router;

	if (!pathname.startsWith("/playlist/")) {
		return trace.msg.err(`This is not a playlist!`);
	}
	const playlistUUID: string = params.id;
	for (const file of event.dataTransfer?.files ?? []) {
		const bytes = await file.arrayBuffer();
		if (bytes === undefined) continue;
		trace.log(`Matching ${file.name}...`);
		try {
			const matches = await recognizeTrack({
				bytes,
				startInMiddle: settings.startInMiddle,
				exitOnFirstMatch: settings.exitOnFirstMatch,
			});
			if (matches.length === 0) return trace.msg.warn(`No matches for ${file.name}`);
			for (const shazamData of matches) {
				const trackName = shazamData.track?.share?.text ?? `${shazamData.track?.title ?? "unknown"} by ${shazamData.track?.artists?.[0] ?? "unknown"}"`;
				const prefix = `[File: ${file.name}, Match: ${trackName}]`;
				const isrc = shazamData.track?.isrc;
				trace.log(shazamData);
				if (isrc === undefined) {
					trace.msg.log(`${prefix} No isrc returned from Shazam cannot add to playlist.`);
					continue;
				}
				let trackToAdd;
				for await (trackToAdd of MaxTrack.getTracksFromISRC(isrc)) {
					// Break on first HiRes track. Otherwise trackToAdd will just be the final track found.
					if (MaxTrack.hasHiRes(trackToAdd)) break;
				}
				if (trackToAdd !== undefined) {
					trace.msg.log(`Adding ${prefix}...`);
					return await addToPlaylist(playlistUUID, [trackToAdd.id!.toString()]);
				}
				trace.msg.err(`${prefix} Not avalible in Tidal.`);
			}
		} catch (err) {
			trace.msg.err.withContext(`[File: ${file.name}] Failed to recognize!`)(<Error>err);
		}
	}
};

// Register the event listener
document.addEventListener("drop", handleDrop);

// Later, when you need to unregister the event listener
export const onUnload = () => document.removeEventListener("drop", handleDrop);
