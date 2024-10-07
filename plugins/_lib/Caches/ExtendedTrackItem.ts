import type { ItemId, Album } from "neptune-types/tidal";
import type { PlaybackContext } from "../AudioQualityTypes";
import { MediaItem, MediaItemCache } from "./MediaItemCache";
import { AlbumCache } from "./AlbumCache";
import { libTrace } from "../trace";
import getPlaybackControl from "../getPlaybackControl";

import type { IRecording, IReleaseMatch, ITrack } from "musicbrainz-api";
import { requestJsonCached } from "../nativeBridge/request";

export class ExtendedMediaItem {
	private _releaseTrack?: ITrack;
	private _releaseAlbum?: IReleaseMatch;

	private constructor(public readonly trackId: ItemId, public readonly tidalTrack: MediaItem) {}

	public static current(playbackContext?: PlaybackContext) {
		playbackContext ??= getPlaybackControl()?.playbackContext;
		if (playbackContext?.actualProductId === undefined) return undefined;
		return this.get(playbackContext.actualProductId);
	}

	public static async get(trackId?: ItemId) {
		if (trackId === undefined) return undefined;
		const trackItem = await MediaItemCache.ensure(trackId);
		if (trackItem === undefined) return undefined;
		return new this(trackId, trackItem);
	}

	public async isrcs(): Promise<Set<string> | undefined> {
		let isrcs = [];

		const recording = await this.releaseTrack();
		if (recording?.recording.isrcs) isrcs.push(...recording.recording.isrcs);

		const trackItem = this.tidalTrack;
		if (trackItem.isrc) isrcs.push(trackItem.isrc);

		return new Set(isrcs);
	}

	public tidalAlbum(): Promise<Album | undefined> {
		return AlbumCache.get(this.tidalTrack.album?.id);
	}

	public async releaseAlbum() {
		if (this._releaseAlbum !== undefined) return this._releaseAlbum;

		const albumId = this.tidalTrack.album?.id;
		if (albumId === undefined) return undefined;
		const album = await this.tidalAlbum();
		if (album?.upc === undefined) return undefined;
		return (this._releaseAlbum = await requestJsonCached<{ releases: IReleaseMatch[] }>(`https://musicbrainz.org/ws/2/release/?query=barcode:${album.upc}&fmt=json`)
			.then(({ releases }) => releases[0])
			.catch(libTrace.warn.withContext("MusicBrainz.getUPCReleases")));
	}

	public async releaseTrack(): Promise<ITrack | undefined> {
		if (this._releaseTrack !== undefined) return this._releaseTrack;

		if (this.tidalTrack.isrc !== undefined) {
			// Lookup the recording from MusicBrainz by ISRC
			const recording = await requestJsonCached<{ recordings: IRecording[] }>(`https://musicbrainz.org/ws/2/isrc/${this.tidalTrack.isrc}?fmt=json`)
				.then(({ recordings }) => recordings[0])
				.catch(libTrace.warn.withContext("MusicBrainz.getISRCRecordings"));
			if (recording === undefined) return undefined;

			// If a recording exists then fetch the full recording details including media for title resolution
			const release = await requestJsonCached<IRecording>(`https://musicbrainz.org/ws/2/recording/${recording.id}?inc=releases+media&fmt=json`)
				.then(({ releases }) => releases?.filter((release) => release.country === "XW")[0] ?? releases?.[0])
				.catch(libTrace.warn.withContext("MusicBrainz.getISRCRecordings"));
			if (release === undefined) return undefined;

			return (this._releaseTrack = release.media?.[0].tracks?.[0]);
		}

		const releaseAlbum = await this.releaseAlbum();
		if (releaseAlbum === undefined) return undefined;

		const albumRelease = await requestJsonCached<{ releases: IReleaseMatch[] }>(`https://musicbrainz.org/ws/2/release/${releaseAlbum.id}?inc=recordings+isrcs&fmt=json`)
			.then(({ releases }) => releases[0])
			.catch(libTrace.warn.withContext("MusicBrainz.getReleaseAlbum"));

		const volumeNumber = (this.tidalTrack.volumeNumber ?? 1) - 1;
		const trackNumber = (this.tidalTrack.trackNumber ?? 1) - 1;

		return (this._releaseTrack = albumRelease?.media?.[volumeNumber]?.tracks?.[trackNumber]);
	}

	public async everything() {
		return {
			tidalTrack: this.tidalTrack,
			tidalAlbum: await this.tidalAlbum(),
			releaseTrack: await this.releaseTrack(),
			releaseAlbum: await this.releaseAlbum(),
		};
	}
}
