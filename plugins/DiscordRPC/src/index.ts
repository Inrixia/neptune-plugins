import { intercept } from "@neptune";

import { Tracer } from "@inrixia/lib/trace";
const trace = Tracer("[DiscordRPC]");

import { settings } from "./Settings";
export { Settings } from "./Settings";

import getPlaybackControl from "@inrixia/lib/getPlaybackControl";
import { TrackItemCache } from "@inrixia/lib/Caches/TrackItemCache";
import { onRpcCleanup, updateRPC } from "@inrixia/lib/nativeBridge/discordRPC";
import type { SetActivity } from "@xhayper/discord-rpc";

const STR_MAX_LEN = 127;
const formatLongString = (s?: string) => {
	if (s === undefined) return undefined;
	if (s.length < 2) s += " ";
	return s.length >= STR_MAX_LEN ? s.slice(0, STR_MAX_LEN - 3) + "..." : s;
};
const getMediaURLFromID = (id?: string, path = "/1280x1280.jpg") =>
	id
		? "https://resources.tidal.com/images/" + id.split("-").join("/") + path
		: undefined;

let previousActivity: string | undefined;

export const onTimeUpdate = async (currentTime?: number) => {
	const { playbackContext, playbackState } = getPlaybackControl();
	if (!playbackState) return;

	const track = await TrackItemCache.ensure(playbackContext?.actualProductId);
	if (track === undefined) return;

	const idle =
		playbackState === "IDLE" || // Loading next track
		playbackState === "STALLED" || // Seeking in the track
		currentTime === 0; // Loading current track
	const loading = previousActivity && idle; // On the initial load, the state will be idle, but it is not loading

	const playing = loading
		? true // If the track is loading, it's about to play, so we shouldn't show the pause icon
		: playbackState === "PLAYING";

	if (!playing && !settings.keepRpcOnPause) return updateRPC();

	const activity: SetActivity = { type: 2 }; // Listening type

	if (settings.displayPlayButton)
		activity.buttons = [
			{
				url: `https://tidal.com/browse/track/${track.id}?u`,
				label: "Play Song",
			},
		];

	// Pause indicator
	if (!playing) {
		activity.smallImageKey = "paused-icon";
		activity.smallImageText = "Paused";
	} else {
		// Playback/Time
		if (track.duration !== undefined && currentTime !== undefined) {
			activity.startTimestamp = Math.floor(Date.now() / 1000);
			activity.endTimestamp = Math.floor(
				(Date.now() + (track.duration - currentTime) * 1000) / 1000
			);
		}

		// Artist image
		if (track.artist && settings.displayArtistImage) {
			activity.smallImageKey = getMediaURLFromID(
				track.artist.picture,
				"/320x320.jpg"
			);
			activity.smallImageText = formatLongString(track.artist.name);
		}
	}

	// Album
	if (track.album !== undefined) {
		activity.largeImageKey = getMediaURLFromID(track.album.cover);
		activity.largeImageText = formatLongString(track.album.title);
	}

	// Title/Artist
	const artist =
		track.artists?.map((a) => a.name).join(", ") ?? "Unknown Artist";

	activity.details = formatLongString(track.title);
	activity.state = formatLongString(artist);

	// Check if the activity actually changed
	const json = JSON.stringify(activity);
	if (previousActivity === json) return;
	previousActivity = json;

	updateRPC(activity);
};

const onUnloadTimeUpdate = intercept(
	"playbackControls/TIME_UPDATE",
	([newTime]) => {
		onTimeUpdate(newTime).catch(
			trace.msg.err.withContext("Failed to update")
		);
	}
);

onTimeUpdate().catch(trace.msg.err.withContext("Failed to update"));
export const onUnload = () => {
	onUnloadTimeUpdate();
	onRpcCleanup();
};
