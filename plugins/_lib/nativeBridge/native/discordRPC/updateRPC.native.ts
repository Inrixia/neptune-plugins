import type { SetActivity } from "@xhayper/discord-rpc";
import type { TrackItem } from "neptune-types/tidal";
import type { Settings } from "../../../../DiscordRPC/src";
import { DiscordRPC } from "./DiscordRPC.native";

const rpc = new DiscordRPC("1130698654987067493");

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

export const onRpcCleanup = () => rpc.cleanup();
export const updateRPC = async ({
	track,
	playing,
	settings,
	currentTime,
}: {
	track: TrackItem;
	playing: boolean;
	settings: Settings;
	currentTime?: number;
}) => {
	const client = await rpc.getClient();

	const activity: SetActivity = { type: 2 }; // Listening type

	if (!settings) {
		// Settings occasionally will fail to load
		settings = {
			displayArtistImage: true,
			displayPlayButton: true,
			keepRpcOnPause: true,
		};
	}

	if (settings.displayPlayButton)
		activity.buttons = [
			{
				url: `https://tidal.com/browse/track/${track.id}?u`,
				label: "Play song",
			},
		];

	// Pause indicator
	if (!playing) {
		if (settings.keepRpcOnPause === false)
			return client.user.clearActivity();
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

	return client.user.setActivity(activity);
};
