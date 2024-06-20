import { fetchTrack } from "../../../../lib/trackBytes/download";

import { AudioQuality, PlaybackContext } from "../../../../lib/AudioQualityTypes";

import type { parseStream as ParseStreamType } from "music-metadata";
import { ManifestMimeType } from "../../../../lib/trackBytes/getPlaybackInfo";
const { parseStream } = <{ parseStream: typeof ParseStreamType }>require("music-metadata/lib/core");

export type TrackInfo = {
	trackId: PlaybackContext["actualProductId"];
	audioQuality: PlaybackContext["actualAudioQuality"];
	bitDepth: PlaybackContext["bitDepth"];
	sampleRate: PlaybackContext["sampleRate"];
	codec: PlaybackContext["codec"];
	duration: PlaybackContext["actualDuration"];
	bytes?: number;
	bitrate?: number;
};

// @ts-expect-error Remove this when types are available
import { storage } from "@plugin";

storage._trackInfoCache ??= {};
export class TrackInfoCache {
	private static readonly _cache: Record<string, TrackInfo> = storage._trackInfoCache;
	private static readonly _listeners: Record<string, ((trackInfo: TrackInfo) => void)[]> = {};

	private static makeKey(trackId: string, audioQuality: AudioQuality): string {
		return `${trackId}-${audioQuality}`;
	}

	public static get(trackId: string, audioQuality: AudioQuality): Promise<TrackInfo> | TrackInfo | undefined {
		return TrackInfoCache._get(TrackInfoCache.makeKey(trackId, audioQuality));
	}

	public static register(trackId: string, audioQuality: AudioQuality, onTrackInfo: (trackInfoP: Promise<TrackInfo> | TrackInfo) => void): void {
		const key = TrackInfoCache.makeKey(trackId, audioQuality);
		const listeners = TrackInfoCache._listeners[key];
		if (listeners !== undefined) listeners.push(onTrackInfo);
		else TrackInfoCache._listeners[key] = [onTrackInfo];
		const trackInfo = TrackInfoCache._cache[key];
		if (trackInfo !== undefined) onTrackInfo(TrackInfoCache._cache[key]!);
	}

	private static set(key: string, trackInfo: TrackInfo): void {
		TrackInfoCache._cache[key] = trackInfo;
		for (const listener of TrackInfoCache._listeners[key] || []) listener(trackInfo);
	}
	private static _get(key: string): Promise<TrackInfo> | TrackInfo | undefined {
		return TrackInfoCache._cache[key];
	}

	public static async ensure(playbackContext: PlaybackContext): Promise<TrackInfo> {
		let { actualProductId: trackId, actualAudioQuality: audioQuality, bitDepth, sampleRate, codec, actualDuration: duration } = playbackContext;

		const key = TrackInfoCache.makeKey(trackId, audioQuality);

		// If a promise for this key is already in the cache, await it
		const trackInfo = TrackInfoCache._get(key);
		if (trackInfo !== undefined) return trackInfo;

		// Fallback to parsing metadata if info is not in context
		if (bitDepth === null || sampleRate === null || duration === null) {
			let bytes;
			const { stream, playbackInfo, manifestMimeType, manifest } = await fetchTrack({ trackId: +trackId, desiredQuality: audioQuality }, { bytesWanted: 256, onProgress: ({ total }) => (bytes = total) });
			// note that you cannot trust bytes to be populated until the stream is finished. parseStream will read the entire stream ensuring this
			const { format } = await parseStream(stream, { mimeType: manifestMimeType === ManifestMimeType.Tidal ? manifest.mimeType : "audio/mp4" });

			bitDepth ??= format.bitsPerSample! ?? 16;
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

			const trackInfo = {
				trackId,
				audioQuality,
				bitDepth,
				sampleRate,
				codec,
				duration,
				bytes,
				bitrate,
			};
			TrackInfoCache.set(key, trackInfo);
			return trackInfo;
		} else {
			let bytes;
			const { playbackInfo } = await fetchTrack({ trackId: +trackId, desiredQuality: audioQuality }, { requestOptions: { method: "HEAD" }, onProgress: ({ total }) => (bytes = total) });
			const trackInfo = {
				trackId,
				audioQuality: <AudioQuality>playbackInfo.audioQuality ?? audioQuality,
				bitDepth,
				sampleRate,
				codec,
				duration,
				bytes,
				bitrate: !!bytes ? (bytes / duration) * 8 : undefined,
			};
			TrackInfoCache.set(key, trackInfo);
			return trackInfo;
		}
	}
}
