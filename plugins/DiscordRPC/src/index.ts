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
export const onTimeUpdate = async (keepRpcOnPause: boolean, newTime?: number) => {
	let { playbackContext, playbackState } = getPlaybackControl();
	if (!playbackState) return;

	const currentlyPlaying = await TrackItemCache.ensure((currentPlaybackContext ?? playbackContext)?.actualProductId);
	if (currentlyPlaying === undefined) return;

	updateRPC(currentlyPlaying, playbackState, keepRpcOnPause, newTime);
};

const onUnloadTimeUpdate = intercept("playbackControls/TIME_UPDATE", ([newTime]) => {
	onTimeUpdate(settings.keepRpcOnPause, newTime).catch(trace.msg.err.withContext("Failed to update"));
});
const onUnloadNewTrack = intercept("playbackControls/MEDIA_PRODUCT_TRANSITION", ([{ playbackContext }]) => {
	currentPlaybackContext = <any>playbackContext;
	onTimeUpdate(settings.keepRpcOnPause).catch(trace.msg.err.withContext("Failed to update"));
});
onTimeUpdate(settings.keepRpcOnPause).catch(trace.msg.err.withContext("Failed to update"));
export const onUnload = () => {
	onUnloadTimeUpdate();
	onUnloadNewTrack();
	onRpcCleanup();
};
