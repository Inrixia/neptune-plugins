import { actions, store } from "@neptune";
import { interceptPromise } from "@inrixia/lib/intercept/interceptPromise";

import { fetchIsrc } from "@inrixia/lib/api/tidal";

import { Tracer } from "@inrixia/lib/trace";
const trace = Tracer("[Shazam]");

import { settings } from "./Settings";
import { recognizeTrack } from "./shazam.native";
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
				const trackName = shazamData.track?.share?.subject ?? "Unknown";
				const isrc = shazamData.track?.isrc;
				const isrcData = isrc !== undefined ? await fetchIsrc(isrc).catch(() => undefined) : undefined;
				const ids = (isrcData?.data ?? []).map((track) => track.id);
				if (ids.length > 0) {
					trace.msg.log(`Adding ${trackName} to playlist`);
					await addToPlaylist(
						playlistUUID,
						ids.filter((id) => id !== undefined)
					);
				} else {
					trace.log(shazamData);
					trace.msg.log(`Track ${trackName} is not avalible in Tidal`);
				}
			}
		} catch (err) {
			trace.msg.err.withContext(`Failed to recognize ${file.name}`)(<Error>err);
		}
	}
};

// Register the event listener
document.addEventListener("drop", handleDrop);

// Later, when you need to unregister the event listener
export const onUnload = () => document.removeEventListener("drop", handleDrop);
