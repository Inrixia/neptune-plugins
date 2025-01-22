import { actions } from "@neptune";
import { interceptPromise } from "./intercept/interceptPromise";

import { ExtendedMediaItem } from "./Caches/ExtendedTrackItem";
import { Album, TrackItem } from "neptune-types/tidal";
import type { MediaItem } from "./Caches/MediaItemCache";
import type { IReleaseMatch, ITrack } from "musicbrainz-api";

const includesLower = (string: string, includes: string) => string.toLowerCase().includes(includes.toLowerCase());

export const fullTitle = (tidal: MediaItem | MediaItem["album"], musicBrainz?: ITrack | IReleaseMatch) => {
	const brainzTitle = musicBrainz?.title.replaceAll("’", "'");
	const tidalTitle = tidal?.title;

	let title = brainzTitle ?? tidalTitle;
	if (title === undefined) return undefined;

	// If the title has feat and its validated by musicBrainz then use the tidal title.
	if (tidalTitle?.includes("feat. ") && !brainzTitle?.includes("feat. ")) {
		const artistCredit = musicBrainz?.["artist-credit"];
		const mbHasFeat = artistCredit && artistCredit.findIndex((credit) => credit.joinphrase === " feat. ") !== -1;
		if (mbHasFeat) title = tidalTitle;
	}

	// Dont use musicBrainz disambiguation as its not the same as the tidal version!
	const version = (<MediaItem>tidal)?.version;
	if (version && !includesLower(title, version)) title += ` (${version})`;

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
	discNumber?: string;
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
	year?: string;
};
export const availableTags: (keyof FlacTags)[] = [
	"title",
	"trackNumber",
	"discNumber",
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
	"year",
];

export type MetaTags = {
	tags: FlacTags;
	coverUrl: string | undefined;
};

const getMediaURLFromID = (id?: string, path = "/1280x1280.jpg") => (id ? "https://resources.tidal.com/images/" + id.split("-").join("/") + path : undefined);

export const makeTags = async (extTrackItem: ExtendedMediaItem): Promise<MetaTags> => {
	const [tidalAlbum, releaseTrack, releaseAlbum, lyrics] = await Promise.all([extTrackItem.tidalAlbum(), extTrackItem.releaseTrack(), extTrackItem.releaseAlbum(), extTrackItem.lyrics()]);
	const tidalTrack = extTrackItem.tidalTrack;

	const tags: FlacTags = {};
	if (tidalTrack.title !== undefined) tags.title = fullTitle(tidalTrack, releaseTrack);

	if (tidalTrack.trackNumber !== undefined) tags.trackNumber = tidalTrack.trackNumber.toString();
	if (tidalTrack.streamStartDate !== undefined) tags.date = tidalTrack.streamStartDate;
	if (tidalTrack.peak) tags.REPLAYGAIN_TRACK_PEAK = tidalTrack.peak.toString();
	if (tidalTrack.url) tags.comment = tidalTrack.url;

	if (tidalTrack.contentType === "track") {
		if (tidalTrack.copyright) tags.copyright = tidalTrack.copyright;
		if (tidalTrack.replayGain) tags.REPLAYGAIN_TRACK_GAIN = tidalTrack.replayGain.toString();
	}

	if (tidalTrack.volumeNumber !== undefined) tags.discNumber = tidalTrack.volumeNumber.toString();

	// track isrc & album upc
	const isrc = tidalTrack.isrc ?? releaseTrack?.recording.isrcs?.[0];
	if (isrc) tags.isrc = isrc;

	const upc = tidalAlbum?.upc ?? releaseAlbum?.barcode;
	if (upc) tags.upc = upc;

	// Musicbrainz
	if (releaseTrack?.recording?.id) tags.musicbrainz_trackid = releaseTrack.recording.id.toString();
	if (releaseAlbum?.id) tags.musicbrainz_albumid = releaseAlbum.id.toString();

	// Metadata resolution using Musicbrainz
	const artistName = resolveArtist(tidalTrack, tidalAlbum);
	if (artistName) tags.artist = artistName;

	tags.album = fullTitle(tidalTrack.album, releaseAlbum);

	let cover = tidalTrack.album?.cover;
	if (tidalAlbum !== undefined) {
		if ((tidalAlbum.artists?.length ?? -1) > 0) tags.albumArtist = formatArtists(tidalAlbum.artists);
		else if (tidalAlbum.artist?.name) tags.albumArtist = [tidalAlbum.artist.name];

		if (tidalAlbum.genre) tags.genres = tidalAlbum.genre;
		if (tidalAlbum.recordLabel) tags.organization = tidalAlbum.recordLabel;
		if (tidalAlbum.numberOfTracks) tags.totalTracks = tidalAlbum.numberOfTracks.toString();
		if (!tags.date && tidalAlbum.releaseDate) tags.date = tidalAlbum.releaseDate;
		if (tidalAlbum.releaseYear) tags.year = tidalAlbum.releaseYear.toString();
		cover ??= tidalAlbum.cover;
	}

	if (lyrics?.lyrics !== undefined) tags.lyrics = lyrics.lyrics;

	if (tags.date !== undefined) {
		const date = new Date(tags.date);

		tags.year = date.getFullYear().toString();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");

		tags.date = `${tags.year}-${month}-${day}`;
	}

	// Ensure core tags are set
	tags.album ??= "Unknown Album";
	tags.artist ??= ["Unknown Artist"];

	return { tags, coverUrl: getMediaURLFromID(cover) };
};
