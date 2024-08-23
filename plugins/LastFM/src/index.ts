import { actions, intercept, store } from "@neptune";
import { PlaybackContext } from "@inrixia/lib/AudioQualityTypes";

import { LastFM, ScrobbleOpts } from "./LastFM";

import type { PlaybackState } from "neptune-types/tidal";

import { Tracer } from "@inrixia/lib/trace";
const trace = Tracer("[last.fm]");

import { ExtendedMediaItem } from "@inrixia/lib/Caches/ExtendedTrackItem";
import { debounce } from "@inrixia/lib/debounce";
import safeUnload from "@inrixia/lib/safeUnload";
import getPlaybackControl from "@inrixia/lib/getPlaybackControl";

export { Settings } from "./Settings";
import { settings } from "./Settings";

import { makeTags, type MetaTags } from "@inrixia/lib/makeTags";

let totalPlayTime = 0;
let lastPlayStart: number | null = null;

const MIN_SCROBBLE_DURATION = 240000; // 4 minutes in milliseconds
const MIN_SCROBBLE_PERCENTAGE = 0.5; // Minimum percentage of song duration required to scrobble

const isStartingPlaying = () => {
	const {
		playbackControls: { desiredPlaybackState, playbackState },
	} = store.getState();
	return isPlaying(desiredPlaybackState) && playbackState !== desiredPlaybackState;
};
const isPlaying = (desiredPlaybackState?: PlaybackState) => {
	desiredPlaybackState ??= store.getState().playbackControls.desiredPlaybackState;
	return desiredPlaybackState === "PLAYING";
};

let currentTrack: CurrentTrack | undefined = undefined;
const updateNowPlaying = debounce(async (playbackContext?: PlaybackContext) => {
	if (!isPlaying()) return;
	currentTrack = await getCurrentTrack(playbackContext).catch(trace.msg.err.withContext(`Failed to get current track!`));
	if (currentTrack === undefined) return;
	const res = await LastFM.updateNowPlaying(currentTrack.scrobbleParams).catch(trace.msg.err.withContext(`Failed to updateNowPlaying!`));
	if (res?.nowplaying) trace.log("updatedNowPlaying", res?.nowplaying);
}, 250);

actions.lastFm.disconnect();

const intercepters = [
	intercept("playbackControls/SET_PLAYBACK_STATE", ([state]) => {
		switch (state) {
			case "PLAYING": {
				if (isStartingPlaying()) updateNowPlaying();
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
				LastFM.scrobble(currentTrack.scrobbleParams)
					.catch(trace.msg.err.withContext(`last.fm - Failed to scrobble!`))
					.then((res) => {
						if (res?.scrobbles) trace.log("scrobbled", res?.scrobbles["@attr"], res.scrobbles.scrobble);
					});
			} else {
				const trackTitle = currentTrack.extTrackItem.trackItem.title;
				const noScrobbleMessage = `skipped scrobbling ${trackTitle} - Listened for ${(totalPlayTime / 1000).toFixed(0)}s, need ${(minPlayTime / 1000).toFixed(0)}s`;
				if (settings.displaySkippedScrobbles) trace.msg.log(`${noScrobbleMessage}`);
			}
		}

		// reset totalPlayTime & currentTrack as we started playing a new one
		totalPlayTime = 0;
		updateNowPlaying(<PlaybackContext>playbackContext);
	}),
];

type CurrentTrack = {
	extTrackItem: ExtendedMediaItem;
	playbackContext: PlaybackContext;
	playbackStart: number;
	metaTags: MetaTags;
	scrobbleParams: ScrobbleOpts;
};
const getCurrentTrack = async (playbackContext?: PlaybackContext): Promise<CurrentTrack> => {
	const playbackStart = Date.now();

	playbackContext ??= getPlaybackControl()?.playbackContext;
	if (playbackContext === undefined) throw new Error("PlaybackContext is undefined");
	const extTrackItem = await ExtendedMediaItem.current(playbackContext);
	if (extTrackItem === undefined) throw new Error("Failed to get extTrackItem");

	const metaTags = await makeTags(extTrackItem);

	const tags = metaTags.tags;
	const scrobbleParams = {
		track: tags.title!,
		artist: tags.artist?.[0]!,
		album: tags.album,
		albumArtist: tags.albumArtist?.[0],
		trackNumber: tags.trackNumber,
		mbid: tags.musicbrainz_trackid,
		timestamp: (playbackStart / 1000).toFixed(0),
		duration: playbackContext.actualDuration.toFixed(0),
	};
	// @ts-expect-error TS really hates iterating keys cuz its unsafe
	for (const key in scrobbleParams) if (scrobbleParams[key] === undefined) delete scrobbleParams[key];

	const currentTrack = { extTrackItem, playbackContext, playbackStart, metaTags, scrobbleParams };
	trace.log("currentTrack", currentTrack);

	return currentTrack;
};

export const onUnload = () => {
	intercepters.forEach((unload) => unload());
	safeUnload();
};
updateNowPlaying();
