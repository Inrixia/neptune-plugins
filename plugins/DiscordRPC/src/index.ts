import { intercept } from "@neptune";
import { Tracer } from "@inrixia/lib/trace";
import { settings } from "./Settings";
import getPlaybackControl from "@inrixia/lib/getPlaybackControl";
import { MediaItemCache } from "@inrixia/lib/Caches/MediaItemCache";
import type { SetActivity } from "@xhayper/discord-rpc";
export { Settings } from "./Settings";
import "./discord.native";

const trace = Tracer("[DiscordRPC]");
const STR_MAX_LEN = 127;
const formatLongString = (s?: string) => {
	if (s === undefined) return undefined;
	if (s.length < 2) s += " ";
	return s.length >= STR_MAX_LEN ? s.slice(0, STR_MAX_LEN - 3) + "..." : s;
};
const getMediaURLFromID = (id?: string, path = "/1280x1280.jpg") => (id ? "https://resources.tidal.com/images/" + id.split("-").join("/") + path : undefined);

let previousActivity: string | undefined;
let previousStartTime = 0;
let previousEndTime = 0;

export const onTimeUpdate = async (currentTime?: number) => {
	const { playbackContext, playbackState } = getPlaybackControl();
	if (!playbackState) return;

	const mediaItem = await MediaItemCache.ensure(playbackContext?.actualProductId!);
	if (mediaItem === undefined) return;

	const loading = currentTime === 0 && previousActivity;
	const playing = playbackState !== "NOT_PLAYING" || loading;

	if (!playing && !settings.keepRpcOnPause) {
		if (!previousActivity) return;
		setRPC();
		return (previousActivity = undefined);
	}

	const activity: SetActivity = { type: 2 }; // Listening type

	if (settings.displayPlayButton)
		activity.buttons = [
			{
				url: `https://tidal.com/browse/${mediaItem.contentType}/${mediaItem.id}?u`,
				label: "Play Song",
			},
		];

	// Pause indicator
	if (!playing) {
		activity.smallImageKey = "paused-icon";
		activity.smallImageText = "Paused";
	} else {
		// Playback/Time
		if (mediaItem.duration !== undefined && currentTime !== undefined) {
			const newStartTime = Math.floor(Date.now() / 1000);
			const newEndTime = Math.floor((Date.now() + (mediaItem.duration - currentTime) * 1000) / 1000);

			// Use old timestamps if the difference is less than 100ms, to prevent unnecessary updates
			if (newEndTime - previousEndTime < 100) {
				activity.startTimestamp = previousStartTime;
				activity.endTimestamp = previousEndTime;
			} else {
				activity.startTimestamp = newStartTime;
				activity.endTimestamp = newEndTime;
				previousStartTime = newStartTime;
				previousEndTime = newEndTime;
			}
		}

		// Artist image
		const artist = mediaItem.artist ?? mediaItem.artists?.[0];
		if (artist && settings.displayArtistImage) {
			activity.smallImageKey = getMediaURLFromID(artist.picture, "/320x320.jpg");
			activity.smallImageText = formatLongString(artist.name);
		}
	}

	// Album
	if (mediaItem.album !== undefined) {
		activity.largeImageKey = getMediaURLFromID(mediaItem.album?.cover);
		activity.largeImageText = formatLongString(mediaItem.album?.title);
	}

	// Title/Artist
	const artist = mediaItem.artists?.map((a) => a.name).join(", ") ?? "Unknown Artist";

	activity.details = formatLongString(mediaItem.title);
	activity.state = formatLongString(artist);

	// Check if the activity actually changed
	const json = JSON.stringify(activity);
	if (previousActivity === json) return;
	previousActivity = json;

	return setRPC(activity);
};

function setRPC(activity?: SetActivity) {
	return window.electron.ipcRenderer.invoke("DISCORD_SET_ACTIVITY", activity);
}

const onUnloadTimeUpdate = intercept("playbackControls/TIME_UPDATE", ([newTime]) => {
	onTimeUpdate(newTime).catch(trace.msg.err.withContext("Failed to update"));
});

onTimeUpdate().catch(trace.msg.err.withContext("Failed to update"));
export const onUnload = () => {
	onUnloadTimeUpdate();
	window.electron.ipcRenderer.invoke("DISCORD_CLEANUP").catch(trace.msg.err.withContext("Failed to cleanup RPC"));
};
