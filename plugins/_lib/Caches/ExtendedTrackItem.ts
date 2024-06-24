import type { ItemId, TrackItem, Album } from "neptune-types/tidal";
import type { PlaybackContext } from "../AudioQualityTypes";
import { MusicBrainz } from "../api/musicbrainz";
import { Recording } from "../api/musicbrainz/types/Recording";
import { Release } from "../api/musicbrainz/types/UPCData";
import { TrackItemCache } from "./TrackItemCache";
import { AlbumCache } from "./AlbumCache";
import { libTrace } from "../trace";
import { store } from "@neptune";
import getPlaybackControl from "../getPlaybackControl";

export class ExtendedTrackItem {
	private _album?: Album;
	private _recording?: Recording;
	private _releaseAlbum?: Release;

	private static readonly _cache: Record<ItemId, ExtendedTrackItem> = {};
	private constructor(public readonly trackId: ItemId, public readonly trackItem: TrackItem) {}

	public static current(playbackContext?: PlaybackContext) {
		playbackContext ??= getPlaybackControl()?.playbackContext;
		if (playbackContext?.actualProductId === undefined) return undefined;
		return this.get(playbackContext.actualProductId);
	}

	public static async get(trackId: ItemId) {
		if (trackId === undefined) return undefined;
		const trackItem = await TrackItemCache.ensure(trackId);
		if (trackItem === undefined) return undefined;
		return this._cache[trackId] ?? (this._cache[trackId] = new this(trackId, trackItem));
	}
	public async isrcs(): Promise<Set<string> | undefined> {
		let isrcs = [];

		const recording = await this.recording();
		if (recording?.isrcs) isrcs.push(...recording.isrcs);

		const trackItem = this.trackItem;
		if (trackItem.isrc) isrcs.push(trackItem.isrc);

		return new Set(isrcs);
	}
	public async album(): Promise<Album | undefined> {
		if (this._album !== undefined) return this._album;
		return (this._album = await AlbumCache.get(this.trackItem.album?.id));
	}
	public async recording(): Promise<Recording | undefined> {
		if (this._recording !== undefined) return this._recording;

		this._recording = await MusicBrainz.getRecording(this.trackItem.isrc).catch(libTrace.warn.withContext("MusicBrainz.getRecording"));
		if (this._recording !== undefined) return this._recording;

		const trackItem = this.trackItem;
		if (trackItem === undefined) return undefined;

		const releaseAlbum = await this.releaseAlbum();
		const albumRelease = await MusicBrainz.getAlbumRelease(releaseAlbum?.id).catch(libTrace.warn.withContext("MusicBrainz.getAlbumRelease"));

		const volumeNumber = (trackItem.volumeNumber ?? 1) - 1;
		const trackNumber = (trackItem.trackNumber ?? 1) - 1;

		return (this._recording = albumRelease?.media?.[volumeNumber]?.tracks?.[trackNumber]?.recording);
	}
	public async releaseAlbum() {
		if (this._releaseAlbum !== undefined) return this._releaseAlbum;

		const album = await this.album();
		const upcData = await MusicBrainz.getUPCData(album?.upc).catch(libTrace.warn.withContext("MusicBrainz.getUPCData"));

		return (this._releaseAlbum = upcData?.releases?.[0]);
	}

	public async everything() {
		return {
			trackItem: this.trackItem,
			album: await this.album(),
			releaseAlbum: await this.releaseAlbum(),
			recording: await this.recording(),
		};
	}
}
