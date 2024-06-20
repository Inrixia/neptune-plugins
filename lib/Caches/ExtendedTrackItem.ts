import { actions } from "@neptune";
import { ItemId, TrackItem, Album } from "neptune-types/tidal";
import { interceptPromise } from "../intercept/interceptPromise";
import { MusicBrainz } from "../musicbrainzApi";
import { Recording } from "../musicbrainzApi/types/Recording";
import { Release } from "../musicbrainzApi/types/UPCData";
import { TrackItemCache } from "./TrackItemCache";
import { undefinedWarn } from "../undefinedError";
import { AlbumCache } from "./AlbumCache";

export class ExtendedTrackItem {
	public readonly trackId: ItemId;
	private _trackItem?: TrackItem;
	private _album?: Album;
	private _recording?: Recording;
	private _releaseAlbum?: Release;

	private static readonly _cache: Record<ItemId, ExtendedTrackItem> = {};

	private constructor(trackId: ItemId) {
		this.trackId = trackId;
	}

	public static get(trackId: ItemId) {
		if (trackId === undefined) return undefined;
		return this._cache[trackId] ?? (this._cache[trackId] = new this(trackId));
	}
	public async isrcs(): Promise<string[] | undefined> {
		const trackItem = this.trackItem();
		if (trackItem?.isrc !== undefined) return [trackItem.isrc];

		const recording = await this.recording();
		if (recording?.isrcs !== undefined) return recording.isrcs;
	}
	public trackItem(): TrackItem | undefined {
		if (this._trackItem !== undefined) return this._trackItem;

		return (this._trackItem = TrackItemCache.get(this.trackId));
	}
	public async album(): Promise<Album | undefined> {
		if (this._album !== undefined) return this._album;
		return (this._album = await AlbumCache.get(this.trackItem()?.album?.id));
	}
	public async recording(): Promise<Recording | undefined> {
		if (this._recording !== undefined) return this._recording;

		this._recording = await MusicBrainz.getRecording(this.trackItem()?.isrc).catch(undefinedWarn("MusicBrainz.getRecording"));
		if (this._recording !== undefined) return this._recording;

		const trackItem = this.trackItem();
		if (trackItem === undefined) return undefined;

		const releaseAlbum = await this.releaseAlbum();
		const albumRelease = await MusicBrainz.getAlbumRelease(releaseAlbum?.id).catch(undefinedWarn("MusicBrainz.getAlbumRelease"));

		const volumeNumber = (trackItem.volumeNumber ?? 1) - 1;
		const trackNumber = (trackItem.trackNumber ?? 1) - 1;

		return (this._recording = albumRelease?.media?.[volumeNumber]?.tracks?.[trackNumber]?.recording);
	}
	public async releaseAlbum() {
		if (this._releaseAlbum !== undefined) return this._releaseAlbum;

		const album = await this.album();
		const upcData = await MusicBrainz.getUPCData(album?.upc).catch(undefinedWarn("MusicBrainz.getUPCData"));

		return (this._releaseAlbum = upcData?.releases?.[0]);
	}

	public async everything() {
		return {
			trackItem: this.trackItem(),
			album: await this.album(),
			releaseAlbum: await this.releaseAlbum(),
			recording: await this.recording(),
		};
	}
}
