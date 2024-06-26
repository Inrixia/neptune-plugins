import { utils, actions } from "@neptune";
import { interceptPromise } from "./intercept/interceptPromise";

import { ExtendedTrackItem } from "./Caches/ExtendedTrackItem";
import { Album, TrackItem } from "neptune-types/tidal";

export const fullTitle = (track: TrackItem) => `${track.title}${track.version ? ` - ${track.version}` : ""}`;

const formatArtists = (artists?: (string | undefined)[] | Album["artists"] | TrackItem["artists"]): string[] =>
	artists
		?.flatMap((artist) => {
			if (artist === undefined) return [];
			if (typeof artist === "string") return artist.split(", ");
			return artist?.name;
		})
		.filter((artist) => artist !== undefined) ?? [];

const resolveArtist = (trackItem: TrackItem, album?: Album) => {
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

export type MetaTags = {
	tags: FlacTags;
	coverUrl: string | undefined;
};

export const makeTags = async (extTrackItem: ExtendedTrackItem): Promise<MetaTags> => {
	const lyrics = interceptPromise(
		() => actions.content.loadItemLyrics({ itemId: extTrackItem.trackItem.id!, itemType: "track" }),
		["content/LOAD_ITEM_LYRICS_SUCCESS"],
		["content/LOAD_ITEM_LYRICS_FAIL"]
	)
		.catch(() => undefined)
		.then((res) => res?.[0]);
	const { trackItem, releaseAlbum, recording, album } = await extTrackItem.everything();

	const tags: FlacTags = {};
	if (trackItem.title) tags.title = recording?.title ?? fullTitle(trackItem);

	if (trackItem.trackNumber !== undefined) tags.trackNumber = trackItem.trackNumber.toString();
	if (trackItem.releaseDate !== undefined) tags.date = trackItem.releaseDate;
	if (trackItem.copyright) tags.copyright = trackItem.copyright;
	if (trackItem.replayGain) tags.REPLAYGAIN_TRACK_GAIN = trackItem.replayGain.toString();
	if (trackItem.peak) tags.REPLAYGAIN_TRACK_PEAK = trackItem.peak.toString();
	if (trackItem.url) tags.comment = trackItem.url;

	// track isrc & album upc
	if (trackItem.isrc) tags.isrc = trackItem.isrc;
	if (album?.upc) tags.upc = album?.upc;

	// Musicbrainz
	if (recording?.id) tags.musicbrainz_trackid = recording.id.toString();
	if (releaseAlbum?.id) tags.musicbrainz_albumid = releaseAlbum.id.toString();

	// Metadata resolution using Musicbrainz
	const artistName = resolveArtist(trackItem, album);
	if (artistName) tags.artist = artistName;

	if (releaseAlbum?.title) {
		tags.album = releaseAlbum.title;
		if (releaseAlbum.disambiguation) tags.album += ` (${releaseAlbum.disambiguation})`;
	} else if (trackItem.album?.title) tags.album = trackItem.album.title;

	let cover = trackItem.album?.cover;
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

	return { tags, coverUrl: utils.getMediaURLFromID(cover) };
};
