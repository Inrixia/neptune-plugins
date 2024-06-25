import { Presence } from "discord-rpc";
import { DiscordRPC } from "./DiscordRPC.native";
import { PlaybackState, TrackItem } from "neptune-types/tidal";

const rpcClient = new DiscordRPC("1130698654987067493");

const STR_MAX_LEN = 127;
const formatLongString = (s?: string) => {
	if (s === undefined) return "";
	return s.length >= STR_MAX_LEN ? s.slice(0, STR_MAX_LEN - 3) + "..." : s;
};
const getMediaURLFromID = (id?: string, path = "/1280x1280.jpg") => (id ? "https://resources.tidal.com/images/" + id.split("-").join("/") + path : undefined);

export const updateRPC = async (currentlyPlaying: TrackItem, playbackState: PlaybackState, currentTime: number, keepRpcOnPause: boolean) => {
	const _rpcClient = await rpcClient.ensureRPC().catch((err) => console.error("Failed to connect to DiscordRPC", err));
	if (_rpcClient === undefined) return;

	const activityState: Presence = {
		buttons: [],
	};
	if (currentlyPlaying.url) activityState.buttons?.push({ url: currentlyPlaying.url, label: "Play on Tidal" });

	// Pause indicator
	if (playbackState === "NOT_PLAYING") {
		if (keepRpcOnPause === false) return _rpcClient.clearActivity();
		activityState.smallImageKey = "paused-icon";
		activityState.smallImageText = "Paused";
	} else if (currentlyPlaying.duration !== undefined && currentTime !== undefined) {
		// Playback/Time
		activityState.startTimestamp = Math.floor(Date.now() / 1000);
		activityState.endTimestamp = Math.floor((Date.now() + (currentlyPlaying.duration - currentTime) * 1000) / 1000);
	}

	// Album
	if (currentlyPlaying.album !== undefined) {
		activityState.largeImageKey = getMediaURLFromID(currentlyPlaying.album.cover);
		activityState.largeImageText = formatLongString(currentlyPlaying.album.title);
	}

	// Title/Artist
	const artist = `by ${currentlyPlaying?.artist?.name ?? currentlyPlaying.artists?.[0]?.name ?? "Unknown Artist"}`;
	const desc = `${currentlyPlaying.title} ${artist}`;
	if (desc.length >= 32) {
		activityState.details = formatLongString(currentlyPlaying.title);
		activityState.state = formatLongString(artist);
	} else {
		activityState.details = formatLongString(desc);
	}

	return _rpcClient.setActivity(activityState);
};
