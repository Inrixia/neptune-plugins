import { intercept, store } from "@neptune";

import type { PlaybackState } from "neptune-types/tidal";
import type { PlaybackContext } from "./AudioQualityTypes";
import { ExtendedMediaItem } from "./Caches/ExtendedTrackItem";
import getPlaybackControl from "./getPlaybackControl";
import { MetaTags, makeTags } from "./makeTags";

import { Tracer } from "./trace";
import { UninterceptFunction } from "neptune-types/api/intercept";
import { debounce } from "./debounce";
const trace = Tracer("[Scrobbler]");

let totalPlayTime = 0;
let lastPlayStart: number | null = null;

const MIN_SCROBBLE_DURATION = 240000; // 4 minutes in milliseconds
const MIN_SCROBBLE_PERCENTAGE = 0.5; // Minimum percentage of song duration required to scrobble

export const isStartingPlaying = () => {
	const {
		playbackControls: { desiredPlaybackState, playbackState },
	} = store.getState();
	return isPlaying(desiredPlaybackState) && playbackState !== desiredPlaybackState;
};
export const isPlaying = (desiredPlaybackState?: PlaybackState) => {
	desiredPlaybackState ??= store.getState().playbackControls.desiredPlaybackState;
	return desiredPlaybackState === "PLAYING";
};

export type CurrentTrack = {
	extTrackItem: ExtendedMediaItem;
	playbackContext: PlaybackContext;
	playbackStart: number;
	metaTags: MetaTags;
};

export const getCurrentTrack = async (playbackContext?: PlaybackContext): Promise<CurrentTrack> => {
	const playbackStart = Date.now();

	playbackContext ??= getPlaybackControl()?.playbackContext;
	if (playbackContext === undefined) throw new Error("PlaybackContext is undefined");
	const extTrackItem = await ExtendedMediaItem.current(playbackContext);
	if (extTrackItem === undefined) throw new Error("Failed to get extTrackItem");

	const metaTags = await makeTags(extTrackItem);

	const currentTrack = { extTrackItem, playbackContext, playbackStart, metaTags };
	trace.log("currentTrack", currentTrack);

	return currentTrack;
};

const interceptors: UninterceptFunction[] = [];
export const registerOnScrobble = ({ onScrobble, onNowPlaying }: { onScrobble?: (currenTrack: CurrentTrack) => void; onNowPlaying?: (currentTrack: CurrentTrack) => void }) => {
	let currentTrack: CurrentTrack | undefined = undefined;
	const updateNowPlaying = debounce(async (playbackContext?: PlaybackContext) => {
		if (!isPlaying()) return;
		currentTrack = await getCurrentTrack(playbackContext).catch(trace.msg.err.withContext(`Failed to get current track!`));
		if (currentTrack === undefined) return;
		onNowPlaying?.(currentTrack);
	}, 250);

	if (interceptors.length === 0) {
		interceptors.push(
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
			})
		),
			interceptors.push(
				intercept("playbackControls/MEDIA_PRODUCT_TRANSITION", ([{ playbackContext }]) => {
					if (currentTrack !== undefined) {
						if (lastPlayStart !== null) totalPlayTime += Date.now() - lastPlayStart;
						const longerThan4min = totalPlayTime >= MIN_SCROBBLE_DURATION;
						const minPlayTime = +currentTrack.playbackContext.actualDuration * MIN_SCROBBLE_PERCENTAGE * 1000;
						const moreThan50Percent = totalPlayTime >= minPlayTime;
						if (longerThan4min || moreThan50Percent) onScrobble?.(currentTrack);
					}

					// reset totalPlayTime & currentTrack as we started playing a new one
					totalPlayTime = 0;
					updateNowPlaying(<PlaybackContext>playbackContext);
				})
			);
	}
	updateNowPlaying();
	return () => {
		interceptors.forEach((interceptor) => interceptor());
		interceptors.length = 0;
	};
};
