import { intercept } from "@neptune";

import { Tracer } from "@inrixia/lib/trace";
const trace = Tracer("[DiscordRPC]");

import { settings } from "./Settings";
export { Settings } from "./Settings";

import getPlaybackControl from "@inrixia/lib/getPlaybackControl";
import { TrackItemCache } from "@inrixia/lib/Caches/TrackItemCache";
import { onRpcCleanup, updateRPC } from "@inrixia/lib/nativeBridge/discordRPC";
import { type PlaybackContext } from "@inrixia/lib/AudioQualityTypes";

let currentPlaybackContext: PlaybackContext | undefined;
export const onTimeUpdate = async (newTime?: number, loading?: boolean) => {
	let { playbackContext, playbackState } = getPlaybackControl();
	if (!playbackState) return;

	const currentlyPlaying = await TrackItemCache.ensure(
		(currentPlaybackContext ?? playbackContext)?.actualProductId
	);
	if (currentlyPlaying === undefined) return;

	updateRPC(
		currentlyPlaying,
		loading ? "PLAYING" : playbackState, // If loading, it's about to play, so we'll say it's playing
		{ ...settings },
		newTime
	);
};

const onUnloadTimeUpdate = intercept(
	"playbackControls/TIME_UPDATE",
	([newTime]) => {
		onTimeUpdate(newTime, newTime === 0).catch(
			trace.msg.err.withContext("Failed to update")
		);
	}
);

onTimeUpdate().catch(trace.msg.err.withContext("Failed to update"));
export const onUnload = () => {
	onUnloadTimeUpdate();
	onRpcCleanup();
};
