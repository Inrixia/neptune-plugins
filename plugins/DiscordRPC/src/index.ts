import { intercept } from "@neptune";
import { Tracer } from "@inrixia/lib/trace";
import { settings } from "./Settings";
import getPlaybackControl from "@inrixia/lib/getPlaybackControl";
import { MediaItem, MediaItemCache } from "@inrixia/lib/Caches/MediaItemCache";
import type { SetActivity } from "@xhayper/discord-rpc";
import { cleanup, setActivity } from "./discord.native";
export { Settings } from "./Settings";

const trace = Tracer("[DiscordRPC]");
const STR_MAX_LEN = 127;
const formatString = (s?: string) => {
	if (!s) return;
	if (s.length < 2) s += " ";
	return s.length >= STR_MAX_LEN ? s.slice(0, STR_MAX_LEN - 3) + "..." : s;
};
const getMediaURL = (id?: string, path = "/1280x1280.jpg") => id && "https://resources.tidal.com/images/" + id.split("-").join("/") + path;

let track: MediaItem | undefined;
let paused = true;
let time = 0;

export function update(data?: { track?: MediaItem; time?: number; paused?: boolean }) {
	track = data?.track ?? track;
	paused = data?.paused ?? paused;
	time = data?.time ?? time;

	// Clear activity if no track or paused
	if (!track || (paused && !settings.keepRpcOnPause)) return setRPC();

	const activity: SetActivity = { type: 2 }; // Listening type

	if (settings.displayPlayButton)
		activity.buttons = [
			{
				url: `https://tidal.com/browse/${track.contentType}/${track.id}?u`,
				label: "Play Song",
			},
		];

	// Pause indicator
	if (paused) {
		activity.smallImageKey = "paused-icon";
		activity.smallImageText = "Paused";
	} else {
		// Playback/Time
		if (track.duration !== undefined) {
			activity.startTimestamp = Date.now() - time * 1000;
			activity.endTimestamp = activity.startTimestamp + track.duration * 1000;
		}

		// Artist image
		if (settings.displayArtistImage) {
			const artist = track.artist ?? track.artists?.[0];
			activity.smallImageKey = getMediaURL(artist?.picture, "/320x320.jpg");
			activity.smallImageText = formatString(artist?.name);
		}
	}

	// Album
	if (track.album) {
		activity.largeImageKey = getMediaURL(track.album.cover);
		activity.largeImageText = formatString(track.album.title);
	}

	// Title/Artist
	activity.details = formatString(track.title);
	activity.state = formatString(track.artists?.map((a) => a.name).join(", ")) ?? "Unknown Artist";

	return setRPC(activity);
}

const setRPC = (activity?: SetActivity) => setActivity(activity).catch(trace.err.withContext("Failed to set activity"));

const unloadTransition = intercept("playbackControls/MEDIA_PRODUCT_TRANSITION", ([media]) => {
	const mediaProduct = media.mediaProduct as { productId: string };
	MediaItemCache.ensureTrack(mediaProduct.productId)
		.then((track) => {
			if (track) update({ track, time: 0 });
		})
		.catch(trace.err.withContext("Failed to fetch media item"));
});

const unloadTime = intercept("playbackControls/TIME_UPDATE", ([newTime]) => {
	time = newTime;
});
const unloadSeek = intercept("playbackControls/SEEK", ([newTime]) => {
	if (typeof newTime === "number") update({ time: newTime });
});
const unloadPlay = intercept("playbackControls/SET_PLAYBACK_STATE", ([state]) => {
	if (paused && state === "PLAYING") update({ paused: false });
});
const unloadPause = intercept("playbackControls/PAUSE", () => {
	update({ paused: true });
});

const { playbackContext, playbackState, latestCurrentTime } = getPlaybackControl();

update({
	track: await MediaItemCache.ensureTrack(playbackContext?.actualProductId),
	time: latestCurrentTime,
	paused: playbackState !== "PLAYING",
});

export const onUnload = () => {
	unloadTransition();
	unloadTime();
	unloadSeek();
	unloadPlay();
	unloadPause();
	cleanup()!.catch(trace.msg.err.withContext("Failed to cleanup RPC"));
};
