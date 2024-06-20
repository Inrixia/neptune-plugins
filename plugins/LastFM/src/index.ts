import { actions, intercept, store } from "@neptune";
import { PlaybackContext } from "../../../lib/AudioQualityTypes";
import { rejectNotOk, requestStream, toJson } from "../../../lib/fetch";

import { LastFM, ScrobbleOpts } from "./LastFM";

import type { Album, MediaItem, TrackItem } from "neptune-types/tidal";
import { messageError, messageInfo } from "../../../lib/messageLogging";
import { interceptPromise } from "../../../lib/interceptPromise";

import type { Release, UPCData } from "./types/musicbrainz/UPCData";
import type { ISRCData } from "./types/musicbrainz/ISRCData";
import type { ReleaseData } from "./types/musicbrainz/ReleaseData";
import { fullTitle } from "../../../lib/fullTitle";
import { Recording } from "./types/musicbrainz/Recording";

export { Settings } from "./Settings";

// @ts-expect-error Remove this when types are available
import { storage } from "@plugin";

let totalPlayTime = 0;
let lastPlayStart: number | null = null;

const MIN_SCROBBLE_DURATION = 240000; // 4 minutes in milliseconds
const MIN_SCROBBLE_PERCENTAGE = 0.5; // Minimum percentage of song duration required to scrobble

let currentTrack: CurrentTrack;
const updateNowPlaying = (playbackContext?: PlaybackContext) =>
	getCurrentTrack(playbackContext)
		.then((_currentTrack) => {
			const nowPlayingParams = getTrackParams((currentTrack = _currentTrack));
			console.log("[last.fm] updatingNowPlaying", nowPlayingParams);
			LastFM.updateNowPlaying(nowPlayingParams)
				.catch((err) => messageError(`last.fm - Failed to updateNowPlaying! ${err}`))
				.then((res) => console.log("[last.fm] updatedNowPlaying", res));
		})
		.catch(undefinedError);
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
				const scrobbleParams = getTrackParams(currentTrack);
				console.log("[last.fm] scrobbling", scrobbleParams);
				LastFM.scrobble(scrobbleParams)
					.catch((err) => messageError(`last.fm - Failed to scrobble! ${err}`))
					.then((res) => console.log("[last.fm] scrobbled", res));
			} else {
				const noScrobbleMessage = `skipped scrobbling ${currentTrack.trackItem.title} - Listened for ${(totalPlayTime / 1000).toFixed(0)}s, need ${(minPlayTime / 1000).toFixed(0)}s`;
				console.log(`[last.fm] ${noScrobbleMessage}`);
				if (storage.displaySkippedScrobbles) messageInfo(`last.fm - ${noScrobbleMessage}`);
			}
		}

		// reset totalPlayTime & currentTrack as we started playing a new one
		totalPlayTime = 0;
		updateNowPlaying(<PlaybackContext>playbackContext);
	}),
];

const getTrackParams = ({ trackItem, playbackContext, playbackStart, album, recording, releaseAlbum }: CurrentTrack) => {
	let artist;
	const sharedAlbumArtist = trackItem.artists?.find((artist) => artist?.id === album?.artist?.id);
	if (sharedAlbumArtist?.name !== undefined) artist = formatArtists([sharedAlbumArtist?.name]);
	else if (trackItem.artist?.name !== undefined) artist = formatArtists([trackItem.artist?.name]);
	else if ((trackItem.artists?.length ?? -1) > 0) artist = formatArtists(trackItem.artists?.map(({ name }) => name));

	const params: ScrobbleOpts = {
		track: recording?.title ?? fullTitle(<TrackItem>trackItem),
		artist: artist!,
		timestamp: (playbackStart / 1000).toFixed(0),
	};

	if (!!recording?.id) params.mbid = recording.id;

	if (!!album?.artist?.name) params.albumArtist = album?.artist?.name;
	else if ((album?.artists?.length ?? -1) > 0) params.albumArtist = formatArtists(album?.artists?.map(({ name }) => name));

	if (!!releaseAlbum?.title) {
		params.album = releaseAlbum?.title;
		if (!!releaseAlbum.disambiguation) params.album += ` (${releaseAlbum.disambiguation})`;
	} else if (!!trackItem.album?.title) params.album = trackItem.album.title;

	if (!!trackItem.trackNumber) params.trackNumber = trackItem.trackNumber.toString();
	if (!!playbackContext.actualDuration) params.duration = playbackContext.actualDuration.toFixed(0);

	return params;
};
const formatArtists = (artists?: (string | undefined)[]) => {
	const artist = artists?.filter((name) => name !== undefined)?.[0] ?? "";
	return artist.split(", ")[0];
};

const undefinedError = (err: Error) => {
	console.error(err);
	return undefined;
};
type CurrentTrack = {
	trackItem: MediaItem["item"];
	playbackContext: PlaybackContext;
	playbackStart: number;
	album?: Album;
	recording?: Recording;
	releaseAlbum?: Release;
};
const getCurrentTrack = async (playbackContext?: PlaybackContext): Promise<CurrentTrack> => {
	const playbackStart = Date.now();
	const state = store.getState();
	playbackContext ??= <PlaybackContext>state.playbackControls.playbackContext;
	if (!playbackContext) throw new Error("No playbackContext found");
	const mediaItems: Record<number, MediaItem> = state.content.mediaItems;
	const trackItem = mediaItems[+playbackContext.actualProductId];
	actions.content.loadAlbum({ albumId: trackItem?.item?.album?.id! });
	let [album, recording] = await Promise.all([
		await interceptPromise(["content/LOAD_ALBUM_SUCCESS"], [])
			.catch(undefinedError)
			.then((res) => res?.[0].album),
		await mbidFromIsrc(trackItem?.item?.isrc).catch(undefinedError),
	]);
	let releaseAlbum;
	if (recording?.id === undefined) {
		releaseAlbum = await releaseAlbumFromUpc(album?.upc).catch(undefinedError);
		if (releaseAlbum !== undefined) recording = await recordingFromAlbum(releaseAlbum, trackItem.item).catch(undefinedError);
	}
	const currentTrack = { trackItem: trackItem.item, playbackContext, playbackStart, recording, album, releaseAlbum };
	console.log("[last.fm] getCurrentTrack", currentTrack);
	return currentTrack;
};

const _jsonCache: Record<string, unknown> = {};
const fetchJson = async <T>(url: string): Promise<T> => {
	const jsonData = _jsonCache[url];
	if (jsonData !== undefined) return jsonData as T;
	return (_jsonCache[url] = await requestStream(url)
		.then(rejectNotOk)
		.then(toJson<T>));
};
const mbidFromIsrc = async (isrc: string | undefined) => {
	if (isrc === undefined) return undefined;
	const isrcData = await fetchJson<ISRCData>(`https://musicbrainz.org/ws/2/isrc/${isrc}?fmt=json`);
	return isrcData?.recordings?.[0];
};
const releaseAlbumFromUpc = async (upc: string | undefined) => {
	if (upc === undefined) return undefined;
	const upcData = await fetchJson<UPCData>(`https://musicbrainz.org/ws/2/release/?query=barcode:${upc}&fmt=json`);
	return upcData.releases?.[0];
};
const recordingFromAlbum = async (releaseAlbum: Release, trackItem: MediaItem["item"]) => {
	if (releaseAlbum?.id === undefined) return undefined;
	const albumReleaseData = await fetchJson<ReleaseData>(`https://musicbrainz.org/ws/2/release/${releaseAlbum.id}?inc=recordings&fmt=json`);
	const albumTracks = albumReleaseData.media?.[(trackItem.volumeNumber ?? 1) - 1].tracks;
	const albumTrackRelease = albumTracks?.[trackItem.trackNumber! - 1];
	return albumTrackRelease?.recording;
};

export const onUnload = () => intercepters.forEach((unload) => unload());
updateNowPlaying();
