import { ExtendedPlayackInfo, getPlaybackInfo, ManifestMimeType } from "./getStreamInfo";
import { decryptBuffer } from "./decryptBuffer";
import { FetchyOptions, fetchy } from "./fetchy";
import { saveFile } from "./saveFile";
import { AudioQualityEnum } from "./AudioQuality";
import { decryptKeyId } from "./decryptKeyId";
import { TrackItem } from "neptune-types/tidal";

export type TrackOptions = {
	songId: number;
	desiredQuality: AudioQualityEnum;
};

export const fileNameFromInfo = (track: TrackItem, { manifest, manifestMimeType }: ExtendedPlayackInfo): string => {
	const artistName = track.artists?.[0].name;
	const base = `${track.title} by ${artistName ?? "Unknown"}`;
	switch (manifestMimeType) {
		case ManifestMimeType.Tidal: {
			const codec = manifest.codecs !== "flac" ? `.${manifest.codecs}` : "";
			return `${base}${codec.toLowerCase()}.flac`;
		}
		case ManifestMimeType.Dash: {
			const trackManifest = manifest.tracks.audios[0];
			return `${base}.${trackManifest.codec.toLowerCase()}.mp4`;
		}
	}
};

export const saveTrack = async (track: TrackItem, trackOptions: TrackOptions, options?: DownloadTrackOptions) => {
	// Download the bytes
	const trackInfo = await downloadTrack(trackOptions, options);

	// Prompt the user to save the file
	saveFile(new Blob([trackInfo.buffer], { type: "application/octet-stream" }), fileNameFromInfo(track, trackInfo));
};

export type ExtendedPlaybackInfoWithBytes = ExtendedPlayackInfo & { buffer: Buffer };

export interface DownloadTrackOptions extends FetchyOptions {
	playbackInfo?: ExtendedPlayackInfo;
}

export const downloadTrack = async ({ songId, desiredQuality }: TrackOptions, options?: DownloadTrackOptions): Promise<ExtendedPlaybackInfoWithBytes> => {
	const { playbackInfo, manifest, manifestMimeType } = options?.playbackInfo ?? (await getPlaybackInfo(songId, desiredQuality));

	switch (manifestMimeType) {
		case ManifestMimeType.Tidal: {
			const encryptedBuffer = await fetchy(manifest.urls[0], options);
			const decryptedKey = await decryptKeyId(manifest.keyId);
			const buffer = await decryptBuffer(encryptedBuffer, decryptedKey);
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
					const segmentBuffer = await fetchy(url.replaceAll("amp;", ""), options);
					bytes += segmentBuffer.length;
					buffers.push(segmentBuffer);
					if (bytes >= bytesWanted) break;
				}
				buffer = Buffer.concat(buffers);
			} else {
				buffer = Buffer.concat(await Promise.all(trackManifest.segments.map(({ url }) => fetchy(url.replaceAll("amp;", ""), options))));
			}
			return { playbackInfo, manifest, manifestMimeType, buffer };
		}
	}
};

const parseRange = (range?: string): [number?, number?] => {
	if (range === undefined) return [];
	const [_, start, end] = range.match(/bytes=(\d+)-(\d+)?/) ?? [];
	if (start) return [parseInt(start, 10), end ? parseInt(end, 10) : undefined];
	return [];
};
