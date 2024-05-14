import { ExtendedPlayackInfo, getPlaybackInfo, ManifestMimeType } from "./getPlaybackInfo";
import { makeDecipheriv } from "./decryptBuffer";
import { FetchyOptions, fetchy } from "./fetchy";
import { AudioQualityEnum } from "./AudioQuality";
import { decryptKeyId } from "./decryptKeyId";

export type TrackOptions = {
	songId: number;
	desiredQuality: AudioQualityEnum;
};

export type ExtendedPlaybackInfoWithBytes = ExtendedPlayackInfo & { buffer: Buffer };

export interface DownloadTrackOptions extends FetchyOptions {
	playbackInfo?: ExtendedPlayackInfo;
}

export const downloadTrack = async ({ songId, desiredQuality }: TrackOptions, options?: DownloadTrackOptions): Promise<ExtendedPlaybackInfoWithBytes> => {
	const { playbackInfo, manifest, manifestMimeType } = options?.playbackInfo ?? (await getPlaybackInfo(songId, desiredQuality));

	switch (manifestMimeType) {
		case ManifestMimeType.Tidal: {
			const buffer = await fetchy(manifest.urls[0], { ...options, getDecipher: () => makeDecipheriv(decryptKeyId(manifest.keyId)) });
			return { playbackInfo, manifest, manifestMimeType, buffer };
		}
		case ManifestMimeType.Dash: {
			const trackManifest = manifest.tracks.audios[0];

			let buffer: Buffer;
			const { bytesWanted } = options ?? {};
			if (bytesWanted !== undefined) {
				delete options?.bytesWanted;
				let buffers: Buffer[] = [];
				let bytes = 0;
				for (const { url } of trackManifest.segments) {
					const segmentBuffer = await fetchy(url, options);
					bytes += segmentBuffer.length;
					buffers.push(segmentBuffer);
					if (bytes >= bytesWanted) break;
				}
				buffer = Buffer.concat(buffers);
			} else {
				buffer = Buffer.concat(await Promise.all(trackManifest.segments.map(({ url }) => fetchy(url, options))));
			}
			return { playbackInfo, manifest, manifestMimeType, buffer };
		}
	}
};
