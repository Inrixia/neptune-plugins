import type { SetActivity } from "@xhayper/discord-rpc";
import { DiscordRPC } from "./DiscordRPC.native";
import { PlaybackState, TrackItem } from "neptune-types/tidal";

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
export const updateRPC = async (
	currentlyPlaying: TrackItem,
	playbackState: PlaybackState,
	settings: {
		keepRpcOnPause: boolean;
		displayPlayButton: boolean;
		displayArtistImage: boolean;
	},
	currentTime?: number
) => {
	const client = await rpc.getClient();

	const activity: SetActivity = { type: 2 }; // Listening type

	if (settings.displayPlayButton)
		activity.buttons = [
			{
				url:
					currentlyPlaying.url ??
					`https://tidal.com/browse/track/${currentlyPlaying.id}?u`,
				label: "Play on Tidal",
			},
		];

	// Pause indicator
	if (playbackState === "NOT_PLAYING") {
		if (settings.keepRpcOnPause === false)
			return client.user.clearActivity();
		activity.smallImageKey = "paused-icon";
		activity.smallImageText = "Paused";
	} else {
		// Playback/Time
		if (
			currentlyPlaying.duration !== undefined &&
			currentTime !== undefined
		) {
			activity.startTimestamp = Math.floor(Date.now() / 1000);
			activity.endTimestamp = Math.floor(
				(Date.now() +
					(currentlyPlaying.duration - currentTime) * 1000) /
					1000
			);
		}

		// Artist image
		if (currentlyPlaying.artist && settings.displayArtistImage) {
			activity.smallImageKey = getMediaURLFromID(
				currentlyPlaying.artist.picture,
				"/320x320.jpg"
			);
			activity.smallImageText = formatLongString(
				currentlyPlaying.artist.name
			);
		}
	}

	// Album
	if (currentlyPlaying.album !== undefined) {
		activity.largeImageKey = getMediaURLFromID(
			currentlyPlaying.album.cover
		);
		activity.largeImageText = formatLongString(
			currentlyPlaying.album.title
		);
	}

	// Title/Artist
	const artist =
		currentlyPlaying.artists?.map((a) => a.name).join(", ") ??
		"Unknown Artist";

	activity.details = formatLongString(currentlyPlaying.title);
	activity.state = formatLongString(artist);

	return client.user.setActivity(activity);
};
