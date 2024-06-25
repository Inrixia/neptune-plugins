import { utils, actions } from "@neptune";
import { TrackItem } from "neptune-types/tidal";
import { fullTitle } from "@inrixia/lib/fullTitle";
import { interceptPromise } from "@inrixia/lib/intercept/interceptPromise";

import { AlbumCache } from "@inrixia/lib/Caches/AlbumCache";
import { FlacTagMap } from "@inrixia/lib/nativeBridge";

export const makeTags = async (track: TrackItem) => {
	const tags: FlacTagMap = {};
	if (track.title) tags.title = fullTitle(track);
	if (track.album?.title) tags.album = track.album.title;
	if (track.trackNumber !== undefined) tags.trackNumber = track.trackNumber.toString();
	if (track.releaseDate !== undefined) tags.date = track.releaseDate;
	if (track.copyright) tags.copyright = track.copyright;
	if (track.isrc) tags.isrc = track.isrc;
	if (track.replayGain) tags.REPLAYGAIN_TRACK_GAIN = track.replayGain.toString();
	if (track.peak) tags.REPLAYGAIN_TRACK_PEAK = track.peak.toString();
	if (track.url) tags.comment = track.url;
	if (track.artist?.name) tags.artist = track.artist.name;
	tags.performer = (track.artists ?? []).map(({ name }) => name).filter((name) => name !== undefined);

	if (track.id !== undefined) {
		const lyrics = await interceptPromise(() => actions.content.loadItemLyrics({ itemId: track.id!, itemType: "track" }), ["content/LOAD_ITEM_LYRICS_SUCCESS"], ["content/LOAD_ITEM_LYRICS_FAIL"])
			.catch(() => undefined)
			.then((res) => res?.[0]);
		if (lyrics?.lyrics !== undefined) tags.lyrics = lyrics.lyrics;
	}

	const albumId = track.album?.id;
	let cover = track.album?.cover;
	if (albumId !== undefined) {
		const album = await AlbumCache.get(albumId);
		if (album !== undefined) {
			tags.albumArtist = (album.artists ?? []).map(({ name }) => name).filter((name) => name !== undefined);
			if (album.genre) tags.genres = album.genre;
			if (album.recordLabel) tags.organization = album.recordLabel;
			if (album.numberOfTracks) tags.totalTracks = album.numberOfTracks.toString();
			if (!tags.date && album.releaseDate) tags.date = album.releaseDate;
			if (!tags.date && album.releaseYear) tags.date = album.releaseYear.toString();
			cover ??= album.cover;
		}
	}
	return { tags, coverUrl: utils.getMediaURLFromID(cover) };
};
