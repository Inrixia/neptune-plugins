import { intercept } from "@neptune";
import { html } from "@neptune/voby";

// @ts-expect-error Types dont include @plugin
import { storage } from "@plugin";

import { SwitchSetting } from "@inrixia/lib/components/SwitchSetting";
import getPlaybackControl from "@inrixia/lib/getPlaybackControl";
import { TrackItemCache } from "@inrixia/lib/Caches/TrackItemCache";
import { updateRPC } from "./updateRPC.native";

enum AudioQuality {
	HiRes = "HI_RES_LOSSLESS",
	MQA = "HI_RES",
	High = "LOSSLESS",
	Low = "HIGH",
	Lowest = "LOW",
}
export const onUnload = intercept("playbackControls/TIME_UPDATE", ([current]) => {
	onTimeUpdate();
});
const onTimeUpdate = async () => {
	const { playbackContext, playbackState, latestCurrentTime } = getPlaybackControl();
	if (!playbackState || !latestCurrentTime || !playbackContext) return;

	const mediaItemId = playbackContext.actualProductId;
	if (mediaItemId === undefined) return;

	const currentlyPlaying = await TrackItemCache.ensure(mediaItemId);
	if (currentlyPlaying === undefined) return;

	updateRPC(currentlyPlaying, playbackState, latestCurrentTime, storage.keepRpcOnPause);
};
onTimeUpdate();

storage.keepRpcOnPause ??= false;
export function Settings() {
	return html` <${SwitchSetting} checked=${storage.keepRpcOnPause} onClick=${() => (storage.keepRpcOnPause = !storage.keepRpcOnPause)} title="Keep RPC on pause" /> `;
}
