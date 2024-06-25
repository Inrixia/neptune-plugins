import type { Readable } from "stream";
import type { FetchyOptions } from "./helpers.native";

import { type ExtendedPlayackInfo, ManifestMimeType } from "../../../Caches/PlaybackInfoTypes";
import { requestDecodedStream } from "./requestDecodedStream.native";
import { requestSegmentsStream } from "./requestSegmentsStream.native";

export type ExtendedPlaybackInfoWithBytes = ExtendedPlayackInfo & { stream: Readable };
export const requestTrackStream = async ({ manifestMimeType, manifest }: ExtendedPlayackInfo, fetchyOptions: FetchyOptions): Promise<Readable> => {
	switch (manifestMimeType) {
		case ManifestMimeType.Tidal: {
			const stream = await requestDecodedStream(manifest.urls[0], { ...fetchyOptions, manifest });
			return stream;
		}
		case ManifestMimeType.Dash: {
			const trackManifest = manifest.tracks.audios[0];
			const stream = await requestSegmentsStream(
				trackManifest.segments.map((segment) => segment.url),
				fetchyOptions
			);
			return stream;
		}
		default: {
			throw new Error(`Unsupported Stream Info manifest mime type: ${manifestMimeType}`);
		}
	}
};
