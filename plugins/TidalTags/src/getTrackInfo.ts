import { fetchTrack } from "../../../lib/download";

import { AudioQuality, PlaybackContext } from "../../../lib/AudioQualityTypes";

import type { parseStream as ParseStreamType } from "music-metadata";
import { ManifestMimeType } from "../../../lib/getPlaybackInfo";
const { parseStream } = <{ parseStream: typeof ParseStreamType }>require("music-metadata/lib/core");

type TrackInfo = {
	trackId: PlaybackContext["actualProductId"];
	audioQuality: PlaybackContext["actualAudioQuality"];
	bitDepth: PlaybackContext["bitDepth"];
	sampleRate: PlaybackContext["sampleRate"];
	codec: PlaybackContext["codec"];
	duration: PlaybackContext["actualDuration"];
	bytes?: number;
	bitrate?: number;
};

const trackInfoCache = new Map<string, Promise<TrackInfo>>();
export const getTrackInfo = (playbackContext: PlaybackContext): Promise<TrackInfo> => {
	let { actualProductId: trackId, actualAudioQuality: audioQuality, bitDepth, sampleRate, codec, actualDuration: duration } = playbackContext;
	const key = `${trackId}-${audioQuality}`;

	// If a promise for this key is already in the cache, await it
	if (trackInfoCache.has(key)) return trackInfoCache.get(key)!;

	// Fallback to parsing metadata if info is not in context
	if (bitDepth === null || sampleRate === null || duration === null) {
		const getTrackInfo = async (): Promise<TrackInfo> => {
			let bytes;
			const { stream, playbackInfo, manifestMimeType, manifest } = await fetchTrack({ trackId: +trackId, desiredQuality: audioQuality }, { bytesWanted: 256, onProgress: ({ total }) => (bytes = total) });
			// note that you cannot trust bytes to be populated until the stream is finished. parseStream will read the entire stream ensuring this
			const { format } = await parseStream(stream, { mimeType: manifestMimeType === ManifestMimeType.Tidal ? manifest.mimeType : "audio/mp4" });

			bitDepth ??= format.bitsPerSample!;
			sampleRate ??= format.sampleRate!;
			codec ??= format.codec?.toLowerCase()!;
			duration ??= format.duration!;
			audioQuality = <AudioQuality>playbackInfo.audioQuality;

			let bitrate;
			switch (manifestMimeType) {
				case ManifestMimeType.Tidal: {
					bitrate = !!bytes ? (bytes / duration) * 8 : undefined;
					break;
				}
				case ManifestMimeType.Dash: {
					bitrate = manifest.tracks.audios[0].bitrate.bps;
					bytes = manifest.tracks.audios[0].size?.b;
					break;
				}
				default:
					throw new Error("Unknown manifest type");
			}

			return {
				trackId,
				audioQuality,
				bitDepth,
				sampleRate,
				codec,
				duration,
				bytes,
				bitrate,
			};
		};
		trackInfoCache.set(key, getTrackInfo());
	} else {
		const getTrackInfo = async (): Promise<TrackInfo> => {
			let bytes;
			const { playbackInfo } = await fetchTrack({ trackId: +trackId, desiredQuality: audioQuality }, { requestOptions: { method: "HEAD" }, onProgress: ({ total }) => (bytes = total) });
			return {
				trackId,
				audioQuality: <AudioQuality>playbackInfo.audioQuality ?? audioQuality,
				bitDepth,
				sampleRate,
				codec,
				duration,
				bytes,
				bitrate: !!bytes ? (bytes / duration) * 8 : undefined,
			};
		};
		trackInfoCache.set(key, getTrackInfo());
	}

	return trackInfoCache.get(key)!;
};
