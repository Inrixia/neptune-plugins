import { intercept } from "@neptune";
import { TrackItemCache } from "@inrixia/lib/Caches/TrackItemCache";

import { fetchTrack } from "@inrixia/lib/trackBytes/download";

import * as stream from "stream";
const { Writable } = <typeof stream>require("stream");

import { Tracer } from "@inrixia/lib/trace";
import currentPlaybackContext from "@inrixia/lib/currentPlaybackContext";
const trace = Tracer("[NoBuffer]");

let unblocking = false;
export const onUnload = intercept("playbackControls/SET_PLAYBACK_STATE", ([state]) => {
	if (state === "STALLED" && unblocking === false) {
		unblocking = true;
		(async () => {
			const playbackContext = currentPlaybackContext();
			if (playbackContext === undefined) return;
			const trackItem = await TrackItemCache.current(playbackContext);
			if (trackItem === undefined) return;
			trace.msg.log(`Playback stalled for ${trackItem?.title} - Kicking tidal CDN`);
			const { stream } = await fetchTrack({ trackId: trackItem.id!, desiredQuality: playbackContext.actualAudioQuality });
			const voidStream = new Writable({
				write: (_: any, __: any, cb: () => void) => cb(),
			});
			stream.pipe(voidStream);
			await new Promise((res) => voidStream.on("end", res));
			unblocking = false;
		})();
	}
});
