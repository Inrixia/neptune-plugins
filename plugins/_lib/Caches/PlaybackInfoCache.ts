import { audioQualities, AudioQuality } from "../AudioQualityTypes";
import { Semaphore } from "../Semaphore";

import { SharedObjectStoreExpirable } from "../storage/SharedObjectStoreExpirable";
import { findModuleFunction } from "../findModuleFunction";
import { ExtendedPlayackInfo, PlaybackInfo, ManifestMimeType, TidalManifest } from "./PlaybackInfoTypes";
import { parseDasha } from "../native/dasha.native";

const getCredentials = findModuleFunction<() => Promise<{ token: string; clientId: string }>>("getCredentials", "function");
if (getCredentials === undefined) throw new Error("getCredentials method not found");

export class PlaybackInfoCache {
	private static readonly _store: SharedObjectStoreExpirable<[ExtendedPlayackInfo["playbackInfo"]["trackId"], ExtendedPlayackInfo["playbackInfo"]["audioQuality"]], ExtendedPlayackInfo> =
		new SharedObjectStoreExpirable("PlaybackInfoCache", {
			storeSchema: {
				keyPath: ["playbackInfo.trackId", "playbackInfo.audioQuality"],
			},
		});
	private static readonly _sema = new Semaphore(1);
	static async ensure(trackId: number, audioQuality: AudioQuality): Promise<ExtendedPlayackInfo> {
		if (!audioQualities.includes(audioQuality)) throw new Error(`Cannot get Stream Info! Invalid audio quality: ${audioQuality}, should be one of ${audioQualities.join(", ")}`);
		if (trackId === undefined) throw new Error("Cannot get Stream Info! trackId is missing");

		const playbackInfo = await this._store.get([trackId, audioQuality]);
		if (playbackInfo !== undefined) return playbackInfo;
		return this.update(trackId, audioQuality);
	}
	static async update(trackId: number, audioQuality: AudioQuality): Promise<ExtendedPlayackInfo> {
		const release = await this._sema.obtain();
		try {
			const url = `https://desktop.tidal.com/v1/tracks/${trackId}/playbackinfo?audioquality=${audioQuality}&playbackmode=STREAM&assetpresentation=FULL`;

			const { clientId, token } = await getCredentials!();
			const playbackInfo: PlaybackInfo = await fetch(url, {
				headers: {
					Authorization: `Bearer ${token}`,
					"x-tidal-token": clientId,
				},
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
					const extPlaybackInfo: ExtendedPlayackInfo = { playbackInfo, manifestMimeType: playbackInfo.manifestMimeType, manifest };
					const expires = new URL(manifest.urls[0]).searchParams.get("Expires");
					if (expires !== null) this._store.putExpires(extPlaybackInfo, +expires * 1000);
					return extPlaybackInfo;
				}
				case ManifestMimeType.Dash: {
					const manifest = await parseDasha(atob(playbackInfo.manifest), "https://sp-ad-cf.audio.tidal.com");
					return { playbackInfo, manifestMimeType: playbackInfo.manifestMimeType, manifest };
				}
				default: {
					throw new Error(`Unsupported Stream Info manifest mime type: ${playbackInfo.manifestMimeType}`);
				}
			}
		} catch (e) {
			throw new Error(`Failed to decode Stream Info! ${(<Error>e)?.message}`);
		} finally {
			release();
		}
	}
}
