import { actions } from "@neptune";
import { interceptPromise } from "./intercept/interceptPromise";

import { ExtendedMediaItem } from "./Caches/ExtendedTrackItem";
import { Album, TrackItem } from "neptune-types/tidal";
import type { MediaItem } from "./Caches/MediaItemCache";

export const fullTitle = (track: MediaItem) => `${track.title}${track.version ? ` - ${track.version}` : ""}`;

const formatArtists = (artists?: (string | undefined)[] | Album["artists"] | TrackItem["artists"]): string[] =>
	artists
		?.flatMap((artist) => {
			if (artist === undefined) return [];
			if (typeof artist === "string") return artist;
			return artist?.name;
		})
		.filter((artist) => artist !== undefined) ?? [];

const resolveArtist = (trackItem: MediaItem, album?: Album) => {
	const sharedAlbumArtist = trackItem.artists?.find((artist) => artist?.id === album?.artist?.id);
	if (sharedAlbumArtist?.name !== undefined) return formatArtists([sharedAlbumArtist.name]);
	else if ((trackItem.artists?.length ?? -1) > 0) return formatArtists(trackItem.artists);
	else if (trackItem.artist?.name !== undefined) return formatArtists([trackItem.artist.name]);
};

export type FlacTags = {
	title?: string;
	trackNumber?: string;
	date?: string;
	copyright?: string;
	REPLAYGAIN_TRACK_GAIN?: string;
	REPLAYGAIN_TRACK_PEAK?: string;
	comment?: string;
	isrc?: string;
	upc?: string;
	musicbrainz_trackid?: string;
	musicbrainz_albumid?: string;
	artist?: string[];
	album?: string;
	albumArtist?: string[];
	genres?: string;
	organization?: string;
	totalTracks?: string;
	lyrics?: string;
};
export const availableTags: (keyof FlacTags)[] = [
	"title",
	"trackNumber",
	"date",
	"copyright",
	"REPLAYGAIN_TRACK_GAIN",
	"REPLAYGAIN_TRACK_PEAK",
	"comment",
	"isrc",
	"upc",
	"musicbrainz_trackid",
	"musicbrainz_albumid",
	"artist",
	"album",
	"albumArtist",
	"genres",
	"organization",
	"totalTracks",
	"lyrics",
];

export type MetaTags = {
	tags: FlacTags;
	coverUrl: string | undefined;
};

const getMediaURLFromID = (id?: string, path = "/1280x1280.jpg") => (id ? "https://resources.tidal.com/images/" + id.split("-").join("/") + path : undefined);

export const makeTags = async (extTrackItem: ExtendedMediaItem): Promise<MetaTags> => {
	const lyrics = interceptPromise(
		() => actions.content.loadItemLyrics({ itemId: extTrackItem.trackItem.id!, itemType: "track" }),
		["content/LOAD_ITEM_LYRICS_SUCCESS"],
		["content/LOAD_ITEM_LYRICS_FAIL"]
	)
		.catch(() => undefined)
		.then((res) => res?.[0]);
	const { trackItem: mediaItem, releaseAlbum, recording, album } = await extTrackItem.everything();

	const tags: FlacTags = {};
	if (mediaItem.title) tags.title = recording?.title ?? fullTitle(mediaItem);

	if (mediaItem.trackNumber !== undefined) tags.trackNumber = mediaItem.trackNumber.toString();
	if (mediaItem.releaseDate !== undefined) tags.date = mediaItem.releaseDate;
	if (mediaItem.peak) tags.REPLAYGAIN_TRACK_PEAK = mediaItem.peak.toString();
	if (mediaItem.url) tags.comment = mediaItem.url;

	if (mediaItem.contentType === "track") {
		if (mediaItem.copyright) tags.copyright = mediaItem.copyright;
		if (mediaItem.replayGain) tags.REPLAYGAIN_TRACK_GAIN = mediaItem.replayGain.toString();
	}

	// track isrc & album upc
	if (mediaItem.isrc) tags.isrc = mediaItem.isrc;
	if (album?.upc) tags.upc = album?.upc;

	// Musicbrainz
	if (recording?.id) tags.musicbrainz_trackid = recording.id.toString();
	if (releaseAlbum?.id) tags.musicbrainz_albumid = releaseAlbum.id.toString();

	// Metadata resolution using Musicbrainz
	const artistName = resolveArtist(mediaItem, album);
	if (artistName) tags.artist = artistName;

	if (releaseAlbum?.title) {
		tags.album = releaseAlbum.title;
		if (releaseAlbum.disambiguation) tags.album += ` (${releaseAlbum.disambiguation})`;
	} else if (mediaItem.album?.title) tags.album = mediaItem.album.title;

	let cover = mediaItem.album?.cover;
	if (album !== undefined) {
		if ((album.artists?.length ?? -1) > 0) tags.albumArtist = formatArtists(album.artists);
		else if (album.artist?.name) tags.albumArtist = [album.artist.name];

		if (album.genre) tags.genres = album.genre;
		if (album.recordLabel) tags.organization = album.recordLabel;
		if (album.numberOfTracks) tags.totalTracks = album.numberOfTracks.toString();
		if (!tags.date && album.releaseDate) tags.date = album.releaseDate;
		if (!tags.date && album.releaseYear) tags.date = album.releaseYear.toString();
		cover ??= album.cover;
	}

	const _lyrics = (await lyrics)?.lyrics;
	if (_lyrics !== undefined) tags.lyrics = _lyrics;

	// Ensure core tags are set
	tags.album ??= "Unknown Album";
	tags.artist ??= ["Unknown Artist"];

	return { tags, coverUrl: getMediaURLFromID(cover) };
};
