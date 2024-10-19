// @ts-expect-error Types are wrong parseStream exists
import { parseStream } from "music-metadata";
import { AudioQuality, PlaybackContext } from "../AudioQualityTypes";
import { type ExtendedPlayackInfo, ManifestMimeType } from "../Caches/PlaybackInfoTypes";
import { requestTrackStream } from "./request/requestTrack.native";

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

export const getTrackInfo = async (playbackContext: PlaybackContext, extPlaybackInfo: ExtendedPlayackInfo): Promise<TrackInfo> => {
	let { actualProductId: trackId, actualAudioQuality: audioQuality, bitDepth, sampleRate, codec, actualDuration: duration } = playbackContext;
	const { manifestMimeType, manifest, playbackInfo } = extPlaybackInfo;

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
		const stream = await requestTrackStream(extPlaybackInfo, { bytesWanted: 8192, onProgress: ({ total }) => (trackInfo.bytes = total) });
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
		await requestTrackStream(extPlaybackInfo, { requestOptions: { method: "HEAD" }, onProgress: ({ total }) => (trackInfo.bytes = total) });
		trackInfo.audioQuality = <AudioQuality>playbackInfo.audioQuality ?? audioQuality;
	}

	trackInfo.bitrate ??= !!trackInfo.bytes ? (trackInfo.bytes / duration) * 8 : undefined;

	return trackInfo;
};
