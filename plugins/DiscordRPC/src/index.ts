import { intercept } from "@neptune";

import { Tracer } from "@inrixia/lib/trace";
const trace = Tracer("[DiscordRPC]");

import { settings } from "./Settings";
export { Settings } from "./Settings";

import getPlaybackControl from "@inrixia/lib/getPlaybackControl";
import { TrackItemCache } from "@inrixia/lib/Caches/TrackItemCache";
import { onRpcCleanup, updateRPC } from "@inrixia/lib/nativeBridge/discordRPC";

export const onTimeUpdate = async (currentTime?: number) => {
	let { playbackContext, playbackState } = getPlaybackControl();
	if (!playbackState) return;

	const track = await TrackItemCache.ensure(playbackContext?.actualProductId);
	if (track === undefined) return;

	const loading = playbackState === "IDLE" || currentTime === 0;
	const playing = loading
		? true // If the track is loading, it's about to play, so we shouldn't show the pause icon
		: playbackState === "PLAYING";

	updateRPC({
		track,
		playing,
		settings: {
			...settings, // Copy settings object so that it can be sent over IPC to native
		},
		currentTime,
	});
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
