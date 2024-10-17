import { type ExtendedPlayackInfo, ManifestMimeType } from "@inrixia/lib/Caches/PlaybackInfoTypes";
import { availableTags, MetaTags } from "@inrixia/lib/makeTags";
import { settings } from "./Settings";
import type { PathInfo } from "@inrixia/lib/native/downloadTrack.native";

const unsafeCharacters = /[\/:*?"<>|]/g;
const sanitizeFilename = (filename: string): string => filename.replace(unsafeCharacters, "_");

export const parseExtension = (filename: string) => filename.match(/\.([0-9a-z]+)(?:[\?#]|$)/i)?.[1] ?? undefined;
const filePathFromInfo = ({ tags }: MetaTags, { manifest, manifestMimeType }: ExtendedPlayackInfo): string => {
	let base = settings.filenameFormat;
	for (const tag of availableTags) {
		let tagValue = tags[tag];
		if (Array.isArray(tagValue)) tagValue = tagValue[0];
		if (tagValue === undefined) continue;
		base = base.replaceAll(`{${tag}}`, sanitizeFilename(tagValue));
	}
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

export const pathSeparator = navigator.userAgent.includes("Win") ? "\\" : "/";

export const parseFileName = (metaTags: MetaTags, extPlaybackInfo: ExtendedPlayackInfo): PathInfo => {
	let filePath = filePathFromInfo(metaTags, extPlaybackInfo);
	filePath = pathSeparator === "\\" ? filePath.replaceAll("/", pathSeparator) : filePath;
	let pathParts = filePath.split(pathSeparator);
	const fileName = pathParts.pop();
	return {
		fileName,
		folderPath: pathParts.join(pathSeparator),
	};
};
