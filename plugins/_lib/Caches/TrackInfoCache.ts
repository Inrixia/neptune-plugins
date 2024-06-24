import { fetchTrack } from "../trackBytes/download";
import { AudioQuality, PlaybackContext } from "../AudioQualityTypes";
import { ManifestMimeType } from "./PlaybackInfoCache";
import { SharedObjectStore } from "../storage/SharedObjectStore";

import { Tracer } from "../trace";
const tracer = Tracer("TrackInfoCache");

import type { parseStream as ParseStreamType } from "music-metadata";
import { SharedObjectStoreExpirable } from "../storage/SharedObjectStoreExpirable";
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
const WEEK = 7 * 24 * 60 * 60 * 1000;
export class TrackInfoCache {
	private static readonly _listeners: Record<string, ((trackInfo: TrackInfo) => void)[]> = {};
	private static readonly _store: SharedObjectStoreExpirable<[TrackInfo["trackId"], TrackInfo["audioQuality"]], TrackInfo> = new SharedObjectStoreExpirable("TrackInfoCache", {
		storeSchema: {
			keyPath: ["trackId", "audioQuality"],
		},
		maxAge: WEEK,
	});

	public static async register(trackId: TrackInfo["trackId"], audioQuality: AudioQuality, onTrackInfo: (trackInfoP: TrackInfo) => void): Promise<void> {
		const key = `${trackId}${audioQuality}`;
		if (this._listeners[key]?.push(onTrackInfo) === undefined) this._listeners[key] = [onTrackInfo];
		const trackInfo = await this._store.get([trackId, audioQuality]);
		if (trackInfo !== undefined) onTrackInfo(trackInfo);
	}

	private static put(trackInfo: TrackInfo): void {
		this._store.put(trackInfo).catch(tracer.err.withContext("put"));
		for (const listener of TrackInfoCache._listeners[`${trackInfo.trackId}${trackInfo.audioQuality}`] ?? []) listener(trackInfo);
	}

	public static async ensure(playbackContext: PlaybackContext): Promise<TrackInfo> {
		let { actualProductId: trackId, actualAudioQuality: audioQuality, bitDepth, sampleRate, codec, actualDuration: duration } = playbackContext;

		// If a promise for this key is already in the cache, await it
		const { expired, value: trackInfo } = await this._store.getWithExpiry([trackId, audioQuality]);

		if (expired === true) this.update(playbackContext);
		if (trackInfo === undefined) return this.update(playbackContext);
		return trackInfo;
	}
	private static async update(playbackContext: PlaybackContext): Promise<TrackInfo> {
		let { actualProductId: trackId, actualAudioQuality: audioQuality, bitDepth, sampleRate, codec, actualDuration: duration } = playbackContext;

		const trackInfo: TrackInfo = {
			trackId,
			audioQuality,
			bitDepth,
			sampleRate,
			codec,
			duration,
		};

		// Fallback to parsing metadata if info is not in context
		if (bitDepth === null || sampleRate === null || duration === null) {
			const { stream, playbackInfo, manifestMimeType, manifest } = await fetchTrack(
				{ trackId: +trackId, desiredQuality: audioQuality },
				{ bytesWanted: 256, onProgress: ({ total }) => (trackInfo.bytes = total) }
			);
			// note that you cannot trust bytes to be populated until the stream is finished. parseStream will read the entire stream ensuring this
			const { format } = await parseStream(stream, { mimeType: manifestMimeType === ManifestMimeType.Tidal ? manifest.mimeType : "audio/mp4" });

			trackInfo.bitDepth ??= format.bitsPerSample! ?? 16;
			trackInfo.sampleRate ??= format.sampleRate!;
			trackInfo.codec ??= format.codec?.toLowerCase()!;
			trackInfo.duration ??= format.duration!;
			trackInfo.audioQuality = <AudioQuality>playbackInfo.audioQuality;

			if (manifestMimeType === ManifestMimeType.Dash) {
				trackInfo.bitrate = manifest.tracks.audios[0].bitrate.bps;
				trackInfo.bytes = manifest.tracks.audios[0].size?.b;
			}
		} else {
			const { playbackInfo } = await fetchTrack({ trackId: +trackId, desiredQuality: audioQuality }, { requestOptions: { method: "HEAD" }, onProgress: ({ total }) => (trackInfo.bytes = total) });
			trackInfo.audioQuality = <AudioQuality>playbackInfo.audioQuality ?? audioQuality;
		}

		trackInfo.bitrate ??= !!trackInfo.bytes ? (trackInfo.bytes / duration) * 8 : undefined;

		this.put(trackInfo);
		return trackInfo;
	}
}
