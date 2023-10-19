import { ValueOf } from "@inrixia/helpers/ts";

export type PlaybackContext = {
	actualAudioQuality: AudioQuality;
	actualProductId: number;
};

export type AudioQuality = ValueOf<typeof PlaybackContextAudioQuality>;

export enum PlaybackContextAudioQuality {
	HiRes = "HI_RES_LOSSLESS",
	MQA = "HI_RES",
	High = "LOSSLESS",
}

export enum MediaMetadataQuality {
	High = "LOSSLESS",
	MQA = "MQA",
	HiRes = "HIRES_LOSSLESS",
	Atmos = "DOLBY_ATMOS",
	Sony360 = "SONY_360RA",
}

export const QualityMeta = {
	[MediaMetadataQuality.MQA]: { className: "quality-tag", textContent: "MQA", color: "#F9BA7A" },
	[MediaMetadataQuality.HiRes]: { className: "quality-tag", textContent: "HiRes", color: "#ffd432" },
	[MediaMetadataQuality.Atmos]: { className: "quality-tag", textContent: "Atmos", color: "#0052a3" },
	[MediaMetadataQuality.Sony360]: undefined,
	[MediaMetadataQuality.High]: undefined,
} as const;

export const validQualities = Object.values(PlaybackContextAudioQuality);
export const validQualitiesSet = new Set(validQualities);

// Dont show MQA as a option as if HiRes is avalible itl always be served even if MQA is requested.
export const validQualitiesSettings = [PlaybackContextAudioQuality.HiRes, PlaybackContextAudioQuality.High];

export const AudioQualityInverse = Object.fromEntries(Object.entries(PlaybackContextAudioQuality).map(([key, value]) => [value, key]));
