import { type ExtendedPlayackInfo, ManifestMimeType } from "@inrixia/lib/Caches/PlaybackInfoTypes";
import { MetaTags } from "@inrixia/lib/makeTags";
import { settings } from "./Settings";

const unsafeCharacters = /[\/:*?"<>|]/g;
const sanitizeFilename = (filename: string): string => filename.replace(unsafeCharacters, "_");

export const parseExtension = (filename: string) => filename.match(/\.([0-9a-z]+)(?:[\?#]|$)/i)?.[1] ?? undefined;
const fileNameFromInfo = ({ tags }: MetaTags, { manifest, manifestMimeType }: ExtendedPlayackInfo): string => {
	const base = settings.filenameFormat
		.split(" ")
		.map((part) => {
			const tagPart = (<any>tags)[part];
			console.log(tagPart, part);
			if (tagPart === undefined) return part;
			if (Array.isArray(tagPart)) return tagPart[0];
			return tagPart;
		})
		.join(" ");
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
