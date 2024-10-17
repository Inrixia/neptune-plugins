import { Writable } from "stream";
import { requestTrackStream } from "@inrixia/lib/native/request/requestTrack.native";
import type { ExtendedPlayackInfo } from "@inrixia/lib/Caches/PlaybackInfoTypes";

export const voidTrack = (extPlaybackInfo: ExtendedPlayackInfo): Promise<void> =>
	new Promise((res) =>
		requestTrackStream(extPlaybackInfo).then((stream) =>
			stream
				.pipe(
					new Writable({
						write: (_: any, __: any, cb: () => void) => cb(),
					})
				)
				.on("end", res)
		)
	);
