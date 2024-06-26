import { TrackItem } from "neptune-types/tidal";
import { type ExtendedPlayackInfo, ManifestMimeType } from "@inrixia/lib/Caches/PlaybackInfoTypes";
import { fullTitle, MetaTags } from "@inrixia/lib/makeTags";

const unsafeCharacters = /[\/:*?"<>|]/g;
const sanitizeFilename = (filename: string): string => filename.replace(unsafeCharacters, "_");

export const parseExtension = (filename: string) => filename.match(/\.([0-9a-z]+)(?:[\?#]|$)/i)?.[1] ?? undefined;
const fileNameFromInfo = ({ tags }: MetaTags, { manifest, manifestMimeType }: ExtendedPlayackInfo): string => {
	const artist = tags.artist;
	const album = tags.album;
	const title = tags.title;
	const base = title !== album ? `${artist} - ${album} - ${title}` : `${artist} - ${title}`;
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
export const parseFileName = (metaTags: MetaTags, extPlaybackInfo: ExtendedPlayackInfo) => sanitizeFilename(fileNameFromInfo(metaTags, extPlaybackInfo));
