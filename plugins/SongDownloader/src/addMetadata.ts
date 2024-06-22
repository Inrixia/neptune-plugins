import { utils } from "@neptune";
import { TrackItem } from "neptune-types/tidal";
import { fullTitle } from "@inrixia/lib/fullTitle";
import { ExtendedPlaybackInfoWithBytes } from "../../_lib/trackBytes/download";
import { rejectNotOk, requestStream, toBuffer } from "../../_lib/fetch";
import { ManifestMimeType } from "../../_lib/trackBytes/getPlaybackInfo";
import { actions } from "@neptune";
import { interceptPromise } from "../../_lib/intercept/interceptPromise";

import { type FlacTagMap, PictureType, createFlacTagsBuffer } from "./flac-tagger";
import { AlbumCache } from "@inrixia/lib/Caches/AlbumCache";

export async function addMetadata(trackInfo: ExtendedPlaybackInfoWithBytes, track: TrackItem) {
	if (trackInfo.manifestMimeType === ManifestMimeType.Tidal) {
		switch (trackInfo.manifest.codecs) {
			case "flac": {
				return createFlacTagsBuffer(await makeTags(track), await toBuffer(trackInfo.stream));
			}
		}
	}
}
async function makeTags(track: TrackItem) {
	const tagMap: FlacTagMap = {};
	if (track.title) tagMap.title = fullTitle(track);
	if (track.album?.title) tagMap.album = track.album.title;
	if (track.trackNumber !== undefined) tagMap.trackNumber = track.trackNumber.toString();
	if (track.releaseDate !== undefined) tagMap.date = track.releaseDate;
	if (track.copyright) tagMap.copyright = track.copyright;
	if (track.isrc) tagMap.isrc = track.isrc;
	if (track.replayGain) tagMap.REPLAYGAIN_TRACK_GAIN = track.replayGain.toString();
	if (track.peak) tagMap.REPLAYGAIN_TRACK_PEAK = track.peak.toString();
	if (track.url) tagMap.comment = track.url;
	if (track.artist?.name) tagMap.artist = track.artist.name;
	tagMap.performer = (track.artists ?? []).map(({ name }) => name).filter((name) => name !== undefined);

	if (track.id !== undefined) {
		const lyrics = await interceptPromise(() => actions.content.loadItemLyrics({ itemId: track.id!, itemType: "track" }), ["content/LOAD_ITEM_LYRICS_SUCCESS"], ["content/LOAD_ITEM_LYRICS_FAIL"])
			.catch(() => undefined)
			.then((res) => res?.[0]);
		if (lyrics?.lyrics !== undefined) tagMap.lyrics = lyrics.lyrics;
	}

	const albumId = track.album?.id;
	let cover = track.album?.cover;
	if (albumId !== undefined) {
		const album = await AlbumCache.get(albumId);
		if (album !== undefined) {
			tagMap.albumArtist = (album.artists ?? []).map(({ name }) => name).filter((name) => name !== undefined);
			if (album.genre) tagMap.genres = album.genre;
			if (album.recordLabel) tagMap.organization = album.recordLabel;
			if (album.numberOfTracks) tagMap.totalTracks = album.numberOfTracks.toString();
			if (!tagMap.date && album.releaseDate) tagMap.date = album.releaseDate;
			if (!tagMap.date && album.releaseYear) tagMap.date = album.releaseYear.toString();
			cover ??= album.cover;
		}
	}

	let picture;
	if (cover !== undefined) {
		try {
			picture = {
				pictureType: PictureType.FrontCover,
				buffer: await requestStream(utils.getMediaURLFromID(cover)).then(rejectNotOk).then(toBuffer),
			};
		} catch {}
	}
	return { tagMap, picture };
}
