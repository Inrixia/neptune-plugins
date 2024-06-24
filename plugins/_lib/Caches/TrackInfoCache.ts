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
	private static readonly _store: SharedObjectStoreExpirable<[TrackInfo["trackId"], TrackInfo["audioQuality"]], TrackInfo> = new SharedObjectStoreExpirable("TrackInfoCache", WEEK, {
		keyPath: ["trackId", "audioQuality"],
	});
	public static async get(trackId: TrackInfo["trackId"], audioQuality: AudioQuality): Promise<TrackInfo | undefined> {
		return this._store.get([trackId, audioQuality]);
	}

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
		const trackInfo = await this.get(trackId, audioQuality);
		// Update if not found or older than a week
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
			this.put(trackInfo);
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
			this.put(trackInfo);
			return trackInfo;
		}
	}
}
