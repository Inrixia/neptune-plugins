import { requestTrackStream } from "./request/requestTrack.native";
import type { ExtendedPlayackInfo } from "../../Caches/PlaybackInfoTypes";
import { createWriteStream } from "fs";

export const downloadTrackStream = async (extPlaybackInfo: ExtendedPlayackInfo, filePath: string): Promise<void> => {
	const stream = await requestTrackStream(extPlaybackInfo);
	return new Promise((res) => stream.pipe(createWriteStream(filePath)).on("finish", res));
};
