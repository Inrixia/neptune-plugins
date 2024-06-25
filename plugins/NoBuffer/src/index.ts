import { intercept, store } from "@neptune";
import { TrackItemCache } from "@inrixia/lib/Caches/TrackItemCache";

// import { fetchTrack } from "@inrixia/lib/trackBytes/download.native";
import getPlaybackControl from "@inrixia/lib/getPlaybackControl";
import { Writable } from "./VoidStream.native";

import { Tracer } from "@inrixia/lib/trace";
const trace = Tracer("[NoBuffer]");

let unblocking = false;
export const onUnload = intercept("playbackControls/SET_PLAYBACK_STATE", ([state]) => {
	const { playbackContext, latestCurrentTime } = getPlaybackControl();
	if ((latestCurrentTime ?? 0) > 5 && state === "STALLED" && unblocking === false) {
		unblocking = true;
		(async () => {
			if (playbackContext === undefined) return;
			const trackItem = await TrackItemCache.current(playbackContext);
			if (trackItem === undefined) return;
			trace.msg.log(`Playback stalled for ${trackItem?.title} - Kicking tidal CDN`);
			// const { stream } = await fetchTrack({ trackId: trackItem.id!, desiredQuality: playbackContext.actualAudioQuality });
			const voidStream = new Writable({
				write: (_: any, __: any, cb: () => void) => cb(),
			});
			// stream.pipe(voidStream);
			await new Promise((res) => voidStream.on("end", res));
			unblocking = false;
		})();
	}
});
