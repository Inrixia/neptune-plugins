import { TrackItem } from "neptune-types/tidal";
import { ExtendedPlayackInfo, ManifestMimeType } from "../../../../lib/getPlaybackInfo";
import { fullTitle } from "../../../../lib/fullTitle";

export const fileNameFromInfo = (track: TrackItem, { manifest, manifestMimeType }: ExtendedPlayackInfo): string => {
	const artistName = track.artists?.[0].name ?? "Unknown Artist";
	const albumName = track.album?.title ?? "Unknown Album";
	const title = fullTitle(track);
	const base = title !== albumName ? `${artistName} - ${albumName} - ${title}` : `${artistName} - ${title}`;
	switch (manifestMimeType) {
		case ManifestMimeType.Tidal: {
			if (manifest.codecs === "mqa") {
				return `${base}.mqa.flac`;
			}
			return `${base}.${manifest.codecs}`;
		}
		case ManifestMimeType.Dash: {
			const trackManifest = manifest.tracks.audios[0];
			return `${base}.${trackManifest.codec.toLowerCase()}.m4a`;
		}
	}
};
