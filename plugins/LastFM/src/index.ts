import { actions, intercept, store } from "@neptune";
import { PlaybackContext } from "../../../lib/AudioQualityTypes";

import { LastFM, ScrobbleOpts } from "./LastFM";

import type { TrackItem } from "neptune-types/tidal";
import { messageError, messageInfo } from "../../../lib/messageLogging";

import { fullTitle } from "../../../lib/fullTitle";

export { Settings } from "./Settings";

// @ts-expect-error Remove this when types are available
import { storage } from "@plugin";
import { undefinedError } from "../../../lib/undefinedError";
import { ExtendedTrackItem } from "../../../lib/TrackCache/ExtendedTrackItem";

let totalPlayTime = 0;
let lastPlayStart: number | null = null;

const MIN_SCROBBLE_DURATION = 240000; // 4 minutes in milliseconds
const MIN_SCROBBLE_PERCENTAGE = 0.5; // Minimum percentage of song duration required to scrobble

let currentTrack: CurrentTrack;
const updateNowPlaying = async (playbackContext?: PlaybackContext) => {
	currentTrack = await getCurrentTrack(playbackContext);
	const nowPlayingParams = await getTrackParams(currentTrack);
	console.log("[last.fm] updatingNowPlaying", nowPlayingParams);
	return LastFM.updateNowPlaying(nowPlayingParams)
		.catch((err) => messageError(`last.fm - Failed to updateNowPlaying! ${err}`))
		.then((res) => console.log("[last.fm] updatedNowPlaying", res));
};

actions.lastFm.disconnect();

const intercepters = [
	intercept("playbackControls/SET_PLAYBACK_STATE", ([state]) => {
		switch (state) {
			case "PLAYING": {
				lastPlayStart = Date.now();
				break;
			}
			default: {
				if (lastPlayStart !== null) totalPlayTime += Date.now() - lastPlayStart;
				lastPlayStart = null;
			}
		}
	}),
	intercept("playbackControls/MEDIA_PRODUCT_TRANSITION", ([{ playbackContext }]) => {
		if (currentTrack !== undefined) {
			if (lastPlayStart !== null) totalPlayTime += Date.now() - lastPlayStart;
			const longerThan4min = totalPlayTime >= MIN_SCROBBLE_DURATION;
			const minPlayTime = +currentTrack.playbackContext.actualDuration * MIN_SCROBBLE_PERCENTAGE * 1000;
			const moreThan50Percent = totalPlayTime >= minPlayTime;
			if (longerThan4min || moreThan50Percent) {
				getTrackParams(currentTrack).then((scrobbleParams) => {
					console.log("[last.fm] scrobbling", scrobbleParams);
					LastFM.scrobble(scrobbleParams)
						.catch((err) => messageError(`last.fm - Failed to scrobble! ${err}`))
						.then((res) => console.log("[last.fm] scrobbled", res));
				});
			} else {
				const trackTitle = currentTrack.extTrackItem.trackItem()?.title;
				const noScrobbleMessage = `skipped scrobbling ${trackTitle} - Listened for ${(totalPlayTime / 1000).toFixed(0)}s, need ${(minPlayTime / 1000).toFixed(0)}s`;
				console.log(`[last.fm] ${noScrobbleMessage}`);
				if (storage.displaySkippedScrobbles) messageInfo(`last.fm - ${noScrobbleMessage}`);
			}
		}

		// reset totalPlayTime & currentTrack as we started playing a new one
		totalPlayTime = 0;
		updateNowPlaying(<PlaybackContext>playbackContext);
	}),
];

const getTrackParams = async ({ extTrackItem, playbackContext, playbackStart }: CurrentTrack) => {
	const { trackItem, releaseAlbum, recording, album } = await extTrackItem.everything();

	let artist;
	const sharedAlbumArtist = trackItem?.artists?.find((artist) => artist?.id === album?.artist?.id);
	if (sharedAlbumArtist?.name !== undefined) artist = formatArtists([sharedAlbumArtist.name]);
	else if (trackItem?.artist?.name !== undefined) artist = formatArtists([trackItem.artist.name]);
	else if ((trackItem?.artists?.length ?? -1) > 0) artist = formatArtists(trackItem?.artists?.map(({ name }) => name));

	const params: ScrobbleOpts = {
		track: recording?.title ?? fullTitle(<TrackItem>trackItem),
		artist: artist!,
		timestamp: (playbackStart / 1000).toFixed(0),
	};

	if (!!recording?.id) params.mbid = recording.id;

	if (!!album?.artist?.name) params.albumArtist = album.artist.name;
	else if ((album?.artists?.length ?? -1) > 0) params.albumArtist = formatArtists(album?.artists?.map(({ name }) => name));

	if (!!releaseAlbum?.title) {
		params.album = releaseAlbum?.title;
		if (!!releaseAlbum.disambiguation) params.album += ` (${releaseAlbum.disambiguation})`;
	} else if (!!trackItem?.album?.title) params.album = trackItem.album.title;

	if (!!trackItem?.trackNumber) params.trackNumber = trackItem.trackNumber.toString();
	if (!!playbackContext.actualDuration) params.duration = playbackContext.actualDuration.toFixed(0);

	return params;
};
const formatArtists = (artists?: (string | undefined)[]) => {
	const artist = artists?.filter((name) => name !== undefined)?.[0] ?? "";
	return artist.split(", ")[0];
};

type CurrentTrack = {
	extTrackItem: ExtendedTrackItem;
	playbackContext: PlaybackContext;
	playbackStart: number;
};
const getCurrentTrack = async (playbackContext?: PlaybackContext): Promise<CurrentTrack> => {
	const playbackStart = Date.now();
	playbackContext ??= <PlaybackContext>store.getState().playbackControls.playbackContext;
	if (!playbackContext) throw new Error("No playbackContext found");

	const extTrackItem = ExtendedTrackItem.get(playbackContext.actualProductId);
	if (extTrackItem === undefined) throw new Error("Failed to get extTrackItem");

	const currentTrack = { extTrackItem, playbackContext, playbackStart };
	console.log("[last.fm] getCurrentTrack", currentTrack);

	return currentTrack;
};

export const onUnload = () => intercepters.forEach((unload) => unload());
updateNowPlaying();
