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
interface PlaybackContext {
	actualAssetPresentation: string;
	actualAudioMode: string;
	actualAudioQuality: AudioQuality;
	actualDuration: number;
	actualProductId: string;
	actualStreamType: unknown;
	actualVideoQuality: unknown;
	assetPosition: number;
	bitDepth: number | null;
	codec: string;
	playbackSessionId: string;
	sampleRate: number | null;
}
export const onUnload = intercept("playbackControls/TIME_UPDATE", ([current]) => {
	onTimeUpdate();
});
const onTimeUpdate = async () => {
	const { playbackContext, playbackState, latestCurrentTime } = getPlaybackControl();
	if (playbackState === undefined || latestCurrentTime === undefined || playbackContext === undefined) return;

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
