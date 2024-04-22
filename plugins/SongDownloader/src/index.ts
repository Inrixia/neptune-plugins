import { intercept, actions, store, utils } from "@neptune";

import { requestBuffer } from "../../../lib/fetchy";

// @ts-expect-error Remove this when types are available
import { storage } from "@plugin";

import "./styles";
export { Settings } from "./Settings";

import { downloadTrack, DownloadTrackOptions, TrackOptions } from "../../../lib/download";
import { MediaItem, TrackItem } from "neptune-types/tidal";
import { ExtendedPlayackInfo, ManifestMimeType } from "../../../lib/getStreamInfo";
import { saveFile } from "./saveFile";

import { interceptPromise } from "../../../lib/interceptPromise";
import { getHeaders } from "../../../lib/fetchy";

import { createFlacTagsBuffer, PictureType, type FlacTagMap } from "./flac-tagger/index.js";

type DownloadButtoms = Record<number, HTMLButtonElement>;
const downloadButtons: DownloadButtoms = {};

interface ButtonMethods {
	prep(): void;
	onProgress(info: { total: number; downloaded: number; percent: number }): void;
	clear(): void;
}

const buttonMethods = (id: number): ButtonMethods => ({
	prep: () => {
		const downloadButton = downloadButtons[id];
		downloadButton.disabled = true;
		downloadButton.classList.add("loading");
		downloadButton.textContent = "Fetching Meta...";
	},
	onProgress: ({ total, downloaded, percent }) => {
		const downloadButton = downloadButtons[id];
		downloadButton.style.setProperty("--progress", `${percent}%`);
		const downloadedMB = (downloaded / 1048576).toFixed(0);
		const totalMB = (total / 1048576).toFixed(0);
		downloadButton.textContent = `Downloading... ${downloadedMB}/${totalMB}MB ${percent.toFixed(0)}%`;
	},
	clear: () => {
		const downloadButton = downloadButtons[id];
		downloadButton.classList.remove("loading");
		downloadButton.disabled = false;
		downloadButton.style.removeProperty("--progress");
		downloadButton.textContent = `Download`;
	},
});

const unloadIntercept = intercept(`contextMenu/OPEN_MEDIA_ITEM`, ([mediaItem]) => {
	setTimeout(() => {
		const mediaItems: Record<number, MediaItem> = store.getState().content.mediaItems;
		const mediaInfo = mediaItems[+mediaItem.id]?.item;

		if (mediaInfo?.contentType !== "track" || mediaInfo.id === undefined) return;

		const contextMenu = document.querySelector(`[data-type="list-container__context-menu"]`);
		if (contextMenu === null) return;

		if (document.getElementsByClassName("download-button").length >= 1) {
			document.getElementsByClassName("download-button")[0].remove();
		}

		const downloadButton = document.createElement("button");
		downloadButton.type = "button";
		downloadButton.role = "menuitem";
		downloadButton.textContent = "Download";
		downloadButton.className = "download-button"; // Set class name for styling

		if (downloadButtons[mediaInfo.id]?.disabled === true) {
			downloadButton.disabled = true;
			downloadButton.classList.add("loading");
		}
		downloadButtons[mediaInfo.id] = downloadButton;

		contextMenu.appendChild(downloadButton);

		const { prep, onProgress, clear } = buttonMethods(mediaInfo.id);
		downloadButton.addEventListener("click", () => {
			if (mediaInfo.id === undefined) return;
			prep();
			saveTrack(mediaInfo, { songId: mediaInfo.id, desiredQuality: storage.desiredDownloadQuality }, { onProgress })
				.catch((err) => {
					alert(err);
					console.error(err);
				})
				.finally(clear);
		});
	});
});

export const fileNameFromInfo = (track: TrackItem, { manifest, manifestMimeType }: ExtendedPlayackInfo): string => {
	const artistName = track.artists?.[0].name;
	const base = `${track.title} by ${artistName ?? "Unknown"}`;
	switch (manifestMimeType) {
		case ManifestMimeType.Tidal: {
			const codec = manifest.codecs !== "flac" ? `.${manifest.codecs}` : "";
			return `${base}${codec.toLowerCase()}.flac`;
		}
		case ManifestMimeType.Dash: {
			const trackManifest = manifest.tracks.audios[0];
			return `${base}.${trackManifest.codec.toLowerCase()}.m4a`;
		}
	}
};

export const saveTrack = async (track: TrackItem, trackOptions: TrackOptions, options?: DownloadTrackOptions) => {
	let albumP;
	let lyricsP;

	const albumId = track.album?.id;
	if (albumId !== undefined) {
		actions.content.loadAlbum({ albumId });
		albumP = interceptPromise(["content/LOAD_ALBUM_SUCCESS"], [])
			.catch(() => undefined)
			.then((res) => res?.[0].album);
	}
	if (track.id) {
		actions.content.loadItemLyrics({ itemId: track.id, itemType: "track" });
		lyricsP = interceptPromise(["content/LOAD_ITEM_LYRICS_SUCCESS"], ["content/LOAD_ITEM_LYRICS_FAIL"])
			.catch(() => undefined)
			.then((res) => res?.[0]);
	}

	// Download the bytes
	const trackInfo = await downloadTrack(trackOptions, options);

	const fileName = fileNameFromInfo(track, trackInfo);

	let bufferWithTags;
	if (trackInfo.manifestMimeType === ManifestMimeType.Tidal) {
		const album = await albumP;
		const lyrics = await lyricsP;

		const tagMap: FlacTagMap = {};

		if (track.title) tagMap.title = track.title;
		if (track.album?.title) tagMap.album = track.album.title;
		if (track.trackNumber !== undefined) tagMap.trackNumber = track.trackNumber.toString();
		if (track.releaseDate !== undefined) tagMap.date = track.releaseDate;
		if (track.copyright) tagMap.copyright = track.copyright;
		if (track.isrc) tagMap.isrc = track.isrc;
		if (lyrics?.lyrics !== undefined) tagMap.lyrics = lyrics.lyrics;
		if (track.replayGain) tagMap.REPLAYGAIN_TRACK_GAIN = track.replayGain.toString();
		if (track.peak) tagMap.REPLAYGAIN_TRACK_PEAK = track.peak.toString();
		if (track.url) tagMap.comment = track.url;

		if (track.artist?.name) tagMap.artist = track.artist.name;
		tagMap.performer = (track.artists ?? []).map(({ name }) => name).filter((name) => name !== undefined);

		if (album !== undefined) {
			tagMap.albumArtist = (album.artists ?? []).map(({ name }) => name).filter((name) => name !== undefined);
			if (album.genre) tagMap.genres = album.genre;
			if (album.recordLabel) tagMap.organization = album.recordLabel;
			if (album.numberOfTracks) tagMap.totalTracks = album.numberOfTracks.toString();
			if (!tagMap.date && album.releaseDate) tagMap.date = album.releaseDate;
			if (!tagMap.date && album.releaseYear) tagMap.date = album.releaseYear.toString();
		}

		let picture;
		const cover = track.album?.cover ?? album?.cover;
		if (cover !== undefined) {
			try {
				picture = {
					pictureType: PictureType.BackCover,
					buffer: await requestBuffer(utils.getMediaURLFromID(cover)),
				};
			} catch {}
		}

		bufferWithTags = createFlacTagsBuffer(
			{
				tagMap,
				picture,
			},
			trackInfo.buffer
		);
	}

	// Prompt the user to save the file
	saveFile(new Blob([bufferWithTags ?? trackInfo.buffer], { type: "application/octet-stream" }), fileName);
};

export const onUnload = unloadIntercept;
