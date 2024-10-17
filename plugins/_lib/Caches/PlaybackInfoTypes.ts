import { TrackItem } from "neptune-types/tidal";
import type { DashManifest } from "../native/dasha.native";

export enum ManifestMimeType {
	Tidal = "application/vnd.tidal.bts",
	Dash = "application/dash+xml",
}

export type PlaybackInfo = {
	trackId: number;
	assetPresentation: string;
	audioMode: NonNullable<TrackItem["audioModes"]>;
	audioQuality: NonNullable<TrackItem["audioQuality"]>;
	manifestMimeType: ManifestMimeType;
	manifestHash: string;
	manifest: string;
	albumReplayGain: number;
	albumPeakAmplitude: number;
	trackReplayGain: number;
	trackPeakAmplitude: number;
	bitDepth: number;
	sampleRate: number;
};

export type TidalManifest = {
	mimeType: string;
	codecs: string;
	encryptionType: string;
	keyId: string;
	urls: string[];
};

export type ExtendedPlayackInfo =
	| { playbackInfo: PlaybackInfo; manifestMimeType: ManifestMimeType.Dash; manifest: DashManifest }
	| { playbackInfo: PlaybackInfo; manifestMimeType: ManifestMimeType.Tidal; manifest: TidalManifest };
