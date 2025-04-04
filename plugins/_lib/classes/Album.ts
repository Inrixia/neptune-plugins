import { Tracer } from "../helpers/trace";
const trace = Tracer("[lib.Album]");

import { memoize } from "@inrixia/helpers";
import { actions } from "@neptune";
import type { IReleaseMatch } from "musicbrainz-api";
import { interceptPromise } from "../intercept/interceptPromise";
import { requestJsonCached } from "../native/request/requestJsonCached";
import { ContentBase } from "./ContentBase";
import MediaItem from "./MediaItem";
import { formatArtists, formatCoverUrl, formatTitle, type TImageSize } from "./MediaItem.parsers";

import type { ItemId, Album as TAlbum, MediaItem as TMediaItem } from "neptune-types/tidal";

class Album extends ContentBase {
	constructor(public readonly id: ItemId, public readonly tidalAlbum: TAlbum) {
		super();
	}
	public static async fromId(albumId?: ItemId): Promise<Album | undefined> {
		if (albumId === undefined) return;
		const album = super.fromStore(albumId, "albums", this);
		if (album !== undefined) return album;

		await interceptPromise(() => actions.content.loadAlbum({ albumId }), ["content/LOAD_ALBUM_SUCCESS"], [])
			.then((res) => <TAlbum>res?.[0].album)
			.catch(trace.warn.withContext("get", albumId));

		return super.fromStore(albumId, "albums", this);
	}

	public brainzAlbum: () => Promise<IReleaseMatch | undefined> = memoize(async () => {
		if (this.tidalAlbum.upc === undefined) return;

		const brainzAlbum = await requestJsonCached<{ releases: IReleaseMatch[] }>(`https://musicbrainz.org/ws/2/release/?query=barcode:${this.tidalAlbum.upc}&fmt=json`)
			.then(({ releases }) => releases[0])
			.catch(trace.warn.withContext("getUPCReleases"));

		// @ts-expect-error musicbrainz-api lib missing types
		const trackCount: number = brainzAlbum?.["track-count"];

		const brainzTrackCount = trackCount ?? brainzAlbum?.media?.reduce((count, album) => (count += album?.["track-count"] ?? 0), 0);

		// Try validate if the album is valid because sometimes tidal has the wrong upc id!
		if (brainzTrackCount !== undefined && this.tidalAlbum.numberOfTracks === brainzTrackCount) {
			return brainzAlbum;
		}

		trace.warn("Invalid Tidal UPC for album!", { releaseAlbum: brainzAlbum, tidalAlbum: this });
	});

	public mediaItems: () => Promise<MediaItem[]> = memoize(async () => {
		const result = await interceptPromise(
			() => actions.content.loadAllAlbumMediaItems({ albumId: this.tidalAlbum.id! }),
			["content/LOAD_ALL_ALBUM_MEDIA_ITEMS_SUCCESS"],
			["content/LOAD_ALL_ALBUM_MEDIA_ITEMS_FAIL"]
		).catch(trace.warn.withContext("getMediaItems.interceptPromise", this));
		const tMediaItems = <Immutable.List<TMediaItem>>result?.[0]?.mediaItems;
		if (tMediaItems === undefined) return [];
		return MediaItem.fromTMediaItems(Array.from(tMediaItems));
	});

	public coverUrl(res?: TImageSize) {
		if (this.tidalAlbum.cover === undefined) return;
		return formatCoverUrl(this.tidalAlbum.cover, res);
	}

	public title: () => Promise<string | undefined> = memoize(async () => {
		const brainzAlbum = await this.brainzAlbum();
		return formatTitle(this.tidalAlbum.title, this.tidalAlbum.version, brainzAlbum?.title, brainzAlbum?.["artist-credit"]);
	});

	public upc: () => Promise<string | undefined> = memoize(async () => {
		return this.tidalAlbum.upc ?? (await this.brainzAlbum())?.barcode;
	});

	public async brainzId(): Promise<string | undefined> {
		return (await this.brainzAlbum())?.id;
	}

	public get albumArtist(): string[] {
		if ((this.tidalAlbum.artists?.length ?? -1) > 0) return formatArtists(this.tidalAlbum.artists);
		if (this.tidalAlbum.artist) return formatArtists([this.tidalAlbum.artist]);
		return [];
	}

	public get genre(): string | undefined {
		return this.tidalAlbum.genre;
	}
	public get recordLabel(): string | undefined {
		return this.tidalAlbum.recordLabel;
	}
	public get totalTracks(): number | undefined {
		return this.tidalAlbum.numberOfTracks;
	}
	public get releaseDate(): string | undefined {
		return this.tidalAlbum.releaseDate ?? this.tidalAlbum.streamStartDate;
	}
	public get releaseYear(): string | undefined {
		return this.tidalAlbum.releaseYear;
	}
}

// @ts-expect-error Ensure window.Estr is prepped
window.Estr ??= {};
// @ts-expect-error Always use the shared class
Album = window.Estr.Album ??= Album;
export default Album;
