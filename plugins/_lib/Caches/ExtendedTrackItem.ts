import type { ItemId, Album } from "neptune-types/tidal";
import type { PlaybackContext } from "../AudioQualityTypes";
import { MediaItem, MediaItemCache } from "./MediaItemCache";
import { AlbumCache } from "./AlbumCache";
import { libTrace } from "../trace";
import getPlaybackControl from "../getPlaybackControl";

import type { IRecording, IRelease, IReleaseMatch, ITrack } from "musicbrainz-api";
import { requestJsonCached } from "../native/request/requestJsonCached";

export class ExtendedMediaItem {
	private _releaseTrack?: ITrack;
	private _releaseAlbum?: IReleaseMatch;

	private constructor(public readonly trackId: ItemId, public readonly tidalTrack: MediaItem) {}

	public static current(playbackContext?: PlaybackContext) {
		playbackContext ??= getPlaybackControl()?.playbackContext;
		if (playbackContext?.actualProductId === undefined) return undefined;
		return this.get(playbackContext.actualProductId);
	}

	public static async get(itemId?: ItemId) {
		if (itemId === undefined) return undefined;
		const trackItem = await MediaItemCache.ensure(itemId);
		if (trackItem === undefined) return undefined;
		return new this(itemId, trackItem);
	}

	public async isrcs() {
		let isrcs = [];

		const releaseTrack = await this.releaseTrack();
		if (releaseTrack?.recording.isrcs) isrcs.push(...releaseTrack.recording.isrcs);

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
		const tidalAlbum = await this.tidalAlbum();
		if (tidalAlbum?.upc === undefined) return undefined;

		const releaseAlbum = await requestJsonCached<{ releases: IReleaseMatch[] }>(`https://musicbrainz.org/ws/2/release/?query=barcode:${tidalAlbum.upc}&fmt=json`)
			.then(({ releases }) => releases[0])
			.catch(libTrace.warn.withContext("MusicBrainz.getUPCReleases"));

		// Try validate if the album is valid because sometimes tidal has the wrong upc id!
		if (releaseAlbum !== undefined && tidalAlbum.numberOfTracks !== undefined && releaseAlbum.media[(this.tidalTrack.volumeNumber ?? 1) - 1]["track-count"] !== tidalAlbum.numberOfTracks) {
			libTrace.warn("Invalid Tidal UPC for album!", { releaseAlbum, tidalAlbum });
			return undefined;
		}
		return (this._releaseAlbum = releaseAlbum);
	}

	public async releaseTrack(): Promise<ITrack | undefined> {
		if (this._releaseTrack !== undefined) return this._releaseTrack;

		const releaseTrackFromRecording = async (recording: IRecording) => {
			// If a recording exists then fetch the full recording details including media for title resolution
			const release = await requestJsonCached<IRecording>(`https://musicbrainz.org/ws/2/recording/${recording.id}?inc=releases+media+artist-credits+isrcs&fmt=json`)
				.then(({ releases }) => releases?.filter((release) => release["text-representation"].language === "eng")[0] ?? releases?.[0])
				.catch(libTrace.warn.withContext("MusicBrainz.getISRCRecordings"));
			if (release === undefined) return undefined;

			const releaseTrack = release.media?.[0].tracks?.[0];
			releaseTrack.recording ??= recording;
			return releaseTrack;
		};

		if (this.tidalTrack.isrc !== undefined) {
			// Lookup the recording from MusicBrainz by ISRC
			const recording = await requestJsonCached<{ recordings: IRecording[] }>(`https://musicbrainz.org/ws/2/isrc/${this.tidalTrack.isrc}?inc=isrcs&fmt=json`)
				.then(({ recordings }) => recordings[0])
				.catch(libTrace.warn.withContext("MusicBrainz.getISRCRecordings"));

			if (recording !== undefined) return (this._releaseTrack = await releaseTrackFromRecording(recording));
		}

		const releaseAlbum = await this.releaseAlbum();
		if (releaseAlbum === undefined) return undefined;

		const albumRelease = await requestJsonCached<IRelease>(`https://musicbrainz.org/ws/2/release/${releaseAlbum.id}?inc=recordings+isrcs+artist-credits&fmt=json`).catch(
			libTrace.warn.withContext("MusicBrainz.getReleaseAlbum")
		);

		const volumeNumber = (this.tidalTrack.volumeNumber ?? 1) - 1;
		const trackNumber = (this.tidalTrack.trackNumber ?? 1) - 1;

		this._releaseTrack = albumRelease?.media?.[volumeNumber]?.tracks?.[trackNumber];
		// If this is not the english version of the release try to find the english version of the release track
		if (albumRelease?.["text-representation"].language !== "eng" && this._releaseTrack?.recording !== undefined) {
			return (this._releaseTrack = await releaseTrackFromRecording(this._releaseTrack.recording));
		}
		return this._releaseTrack;
	}
}
