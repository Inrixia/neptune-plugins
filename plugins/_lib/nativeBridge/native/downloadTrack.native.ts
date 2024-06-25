import { type Readable } from "stream";
import { ManifestMimeType, type ExtendedPlayackInfo } from "../../Caches/PlaybackInfoTypes";
import { rejectNotOk, toBuffer, type DownloadProgress } from "./request/helpers.native";
import { requestTrackStream } from "./request/requestTrack.native";
import { createWriteStream } from "fs";

import { FlacStreamTagger, PictureType, type FlacTagMap } from "flac-stream-tagger";
import { requestStream } from "./request/requestStream.native";

export type { DownloadProgress } from "./request/helpers.native";
export type { FlacTagMap } from "flac-stream-tagger";

export type MetaTags = { tags: FlacTagMap; coverUrl?: string };
const addTags = async (extPlaybackInfo: ExtendedPlayackInfo, stream: Readable, metaTags?: MetaTags) => {
	if (metaTags === undefined) return stream;
	const { tags, coverUrl } = metaTags;
	if (extPlaybackInfo.manifestMimeType === ManifestMimeType.Tidal) {
		switch (extPlaybackInfo.manifest.codecs) {
			case "flac": {
				let picture;
				if (coverUrl !== undefined) {
					try {
						picture = {
							pictureType: PictureType.FrontCover,
							buffer: await requestStream(coverUrl).then(rejectNotOk).then(toBuffer),
						};
					} catch {}
				}
				return stream.pipe(
					new FlacStreamTagger({
						tagMap: tags,
						picture,
					})
				);
			}
		}
	}
	return stream;
};

const downloadStatus: Record<string, DownloadProgress> = {};
export const startTrackDownload = async (extPlaybackInfo: ExtendedPlayackInfo, filePath: string, metaTags?: MetaTags): Promise<void> => {
	if (downloadStatus[filePath] !== undefined) throw new Error(`Something is already downloading to ${filePath}`);
	try {
		const stream = await requestTrackStream(extPlaybackInfo, { onProgress: (progress) => (downloadStatus[filePath] = progress) });
		const metaStream = await addTags(extPlaybackInfo, stream, metaTags);
		return new Promise((res) =>
			metaStream.pipe(createWriteStream(filePath)).on("finish", () => {
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
