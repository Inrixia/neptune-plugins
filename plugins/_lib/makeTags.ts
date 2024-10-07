import { actions } from "@neptune";
import { interceptPromise } from "./intercept/interceptPromise";

import { ExtendedMediaItem } from "./Caches/ExtendedTrackItem";
import { Album, TrackItem } from "neptune-types/tidal";
import type { MediaItem } from "./Caches/MediaItemCache";

const englishCharRegex = /[a-zA-Z]/;
const hasEnglish = (str?: string) => !!str && englishCharRegex.test(str);

export const fullTitle = (tidal?: { title?: string; version?: string }, musicBrainz?: { title?: string; disambiguation?: string }) => {
	const brainzTitle = musicBrainz?.title;
	const tidalTitle = tidal?.title;

	let title = brainzTitle ?? tidalTitle;

	// If the musicBrainz title is missing "feat .", use the tidal title.
	const mbMissingFeat = tidalTitle?.includes("feat. ") && !brainzTitle?.includes("feat. ");

	// If the musicBrainz title is in another language and the tidal one isnt, use the tidal title.
	const mbInAnotherLanguage = !hasEnglish(brainzTitle) && hasEnglish(tidalTitle);

	if (mbMissingFeat || mbInAnotherLanguage) title = tidalTitle;
	if (title === undefined) return undefined;

	// Dont use musicBrainz disambiguation as its not the same as the tidal version!
	const version = tidal?.version;
	if (version && !title.includes(version)) title += ` (${version})`;

	return title;
};

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
	if (mediaItem.title !== undefined) tags.title = fullTitle(mediaItem, recording);

	if (mediaItem.trackNumber !== undefined) tags.trackNumber = mediaItem.trackNumber.toString();
	if (mediaItem.releaseDate !== undefined) tags.date = mediaItem.releaseDate;
	if (mediaItem.peak) tags.REPLAYGAIN_TRACK_PEAK = mediaItem.peak.toString();
	if (mediaItem.url) tags.comment = mediaItem.url;

	if (mediaItem.contentType === "track") {
		if (mediaItem.copyright) tags.copyright = mediaItem.copyright;
		if (mediaItem.replayGain) tags.REPLAYGAIN_TRACK_GAIN = mediaItem.replayGain.toString();
	}

	// track isrc & album upc
	const isrc = mediaItem.isrc ?? recording?.isrcs?.[0];
	if (isrc) tags.isrc = isrc;

	const upc = album?.upc ?? releaseAlbum?.barcode;
	if (upc) tags.upc = upc;

	// Musicbrainz
	if (recording?.id) tags.musicbrainz_trackid = recording.id.toString();
	if (releaseAlbum?.id) tags.musicbrainz_albumid = releaseAlbum.id.toString();

	// Metadata resolution using Musicbrainz
	const artistName = resolveArtist(mediaItem, album);
	if (artistName) tags.artist = artistName;

	tags.album = fullTitle(mediaItem.album, releaseAlbum);

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
