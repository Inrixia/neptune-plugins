import type { ExtendedPlayackInfo } from "../../Caches/PlaybackInfoTypes";
import type { DownloadProgress } from "./request/helpers.native";
import { requestTrackStream } from "./request/requestTrack.native";
import { createWriteStream } from "fs";

export type { DownloadProgress } from "./request/helpers.native";

const downloadStatus: Record<string, DownloadProgress> = {};

export const startTrackDownload = async (extPlaybackInfo: ExtendedPlayackInfo, filePath: string): Promise<void> => {
	if (downloadStatus[filePath] !== undefined) throw new Error(`Something is already downloading to ${filePath}`);
	try {
		const stream = await requestTrackStream(extPlaybackInfo, { onProgress: (progress) => (downloadStatus[filePath] = progress) });
		return new Promise((res) =>
			stream.pipe(createWriteStream(filePath)).on("finish", () => {
				delete downloadStatus[filePath];
				res();
			})
		);
	} catch (err) {
		delete downloadStatus[filePath];
		throw err;
	}
};
export const getDownloadProgress = (filePath: string) => downloadStatus[filePath];
