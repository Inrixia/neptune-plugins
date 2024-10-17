import { intercept } from "@neptune";

import getPlaybackControl from "@inrixia/lib/getPlaybackControl";

import { Tracer } from "@inrixia/lib/trace";
import { PlaybackInfoCache } from "@inrixia/lib/Caches/PlaybackInfoCache";
import { voidTrack } from "./voidTrack.native";
const trace = Tracer("[NoBuffer]");

let unblocking = false;
export const onUnload = intercept("playbackControls/SET_PLAYBACK_STATE", ([state]) => {
	const { playbackContext, latestCurrentTime } = getPlaybackControl();
	if ((latestCurrentTime ?? 0) > 5 && state === "STALLED" && unblocking === false) {
		unblocking = true;
		(async () => {
			if (playbackContext === undefined) return;
			const { actualProductId, actualAudioQuality } = playbackContext;
			trace.msg.log(`Playback stalled... Kicking tidal CDN!`);
			await voidTrack(await PlaybackInfoCache.ensure(+actualProductId, actualAudioQuality));
			unblocking = false;
		})();
	}
});
