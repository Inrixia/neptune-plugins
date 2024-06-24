import { ExtendedPlayackInfo, PlaybackInfoCache, ManifestMimeType, TidalManifest } from "../Caches/PlaybackInfoCache";
import { makeDecipheriv } from "./decryptBuffer";
import { FetchyOptions } from "../fetch";
import { requestDecodedStream } from "../fetch/requestDecodedStream";
import { requestSegmentsStream } from "../fetch/requestSegmentsStream";
import { AudioQuality } from "../AudioQualityTypes";
import { decryptKeyId } from "./decryptKeyId";
import type { Readable } from "stream";

export type TrackOptions = {
	trackId: number;
	desiredQuality: AudioQuality;
};

export type ExtendedPlaybackInfoWithBytes = ExtendedPlayackInfo & { stream: Readable };

export interface DownloadTrackOptions extends FetchyOptions {
	playbackInfo?: ExtendedPlayackInfo;
}

const makeGetDeciper = (manifest: TidalManifest) => {
	switch (manifest.encryptionType) {
		case "OLD_AES": {
			return () => makeDecipheriv(decryptKeyId(manifest.keyId));
		}
		case "NONE": {
			return undefined;
		}
		default: {
			throw new Error(`Unexpected manifest encryption type ${manifest.encryptionType}`);
		}
	}
};

export const fetchTrack = async ({ trackId, desiredQuality }: TrackOptions, options?: DownloadTrackOptions): Promise<ExtendedPlaybackInfoWithBytes> => {
	const { playbackInfo, manifest, manifestMimeType } = options?.playbackInfo ?? (await PlaybackInfoCache.ensure(trackId, desiredQuality));

	switch (manifestMimeType) {
		case ManifestMimeType.Tidal: {
			const stream = await requestDecodedStream(manifest.urls[0], { ...options, getDecipher: makeGetDeciper(manifest) });
			return { playbackInfo, manifest, manifestMimeType, stream };
		}
		case ManifestMimeType.Dash: {
			const trackManifest = manifest.tracks.audios[0];
			const stream = await requestSegmentsStream(
				trackManifest.segments.map((segment) => segment.url),
				options
			);
			return { playbackInfo, manifest, manifestMimeType, stream };
		}
	}
};
