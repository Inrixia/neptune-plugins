import { getHeaders } from "../fetch";
import { audioQualities, AudioQuality } from "../AudioQualityTypes";
import { TrackItem } from "neptune-types/tidal";
import type { Manifest as DashManifest } from "dasha";

import { Semaphore } from "../Semaphore";
import { SharedObjectStore } from "../storage/SharedObjectStore";

import type * as dasha from "dasha";
const { parse } = <typeof dasha>require("dasha");

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

export class PlaybackInfoCache {
	// private static readonly _store: SharedObjectStore<[ExtendedPlayackInfo["playbackInfo"]["trackId"], ExtendedPlayackInfo["playbackInfo"]["audioQuality"]], ExtendedPlayackInfo> = new SharedObjectStore(
	// 	"TrackInfoCache",
	// 	{
	// 		keyPath: ["playbackInfo.trackId", "playbackInfo.audioQuality"],
	// 	}
	// );
	private static readonly _sema = new Semaphore(1);
	static async ensure(trackId: number, audioQuality: AudioQuality) {
		if (!audioQualities.includes(audioQuality)) throw new Error(`Cannot get Stream Info! Invalid audio quality: ${audioQuality}, should be one of ${audioQualities.join(", ")}`);
		if (trackId === undefined) throw new Error("Cannot get Stream Info! trackId is missing");

		await this._sema.obtain();
		try {
			const url = `https://desktop.tidal.com/v1/tracks/${trackId}/playbackinfo?audioquality=${audioQuality}&playbackmode=STREAM&assetpresentation=FULL`;

			const playbackInfo: PlaybackInfo = await fetch(url, {
				headers: await getHeaders(),
			}).then((r) => {
				if (r.status === 401) {
					alert("Failed to fetch Stream Info... Invalid OAuth Access Token!");
					throw new Error("Invalid OAuth Access Token!");
				}
				return r.json();
			});

			switch (playbackInfo.manifestMimeType) {
				case ManifestMimeType.Tidal: {
					const manifest: TidalManifest = JSON.parse(atob(playbackInfo.manifest));
					return { playbackInfo, manifestMimeType: playbackInfo.manifestMimeType, manifest };
				}
				case ManifestMimeType.Dash: {
					const manifest = await parse(atob(playbackInfo.manifest), "https://sp-ad-cf.audio.tidal.com");
					return { playbackInfo, manifestMimeType: playbackInfo.manifestMimeType, manifest };
				}
				default: {
					throw new Error(`Unsupported Stream Info manifest mime type: ${playbackInfo.manifestMimeType}`);
				}
			}
		} catch (e) {
			throw new Error(`Failed to decode Stream Info! ${(<Error>e)?.message}`);
		} finally {
			await this._sema.release();
		}
	}
}
