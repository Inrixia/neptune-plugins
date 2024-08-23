import type { TrackItem } from "neptune-types/tidal";

export enum AudioQuality {
	HiRes = "HI_RES_LOSSLESS",
	MQA = "HI_RES",
	High = "LOSSLESS",
	Low = "HIGH",
	Lowest = "LOW",
}
export enum QualityTag {
	HiRes = "HIRES_LOSSLESS",
	MQA = "MQA",
	High = "LOSSLESS",
	DolbyAtmos = "DOLBY_ATMOS",
	Sony630 = "SONY_360RA",
}
export const lookupItemQuality = (qualityTag: QualityTag, audioQuality: TrackItem["audioQuality"]) => {
	switch (qualityTag) {
		case QualityTag.HiRes:
			return AudioQuality.HiRes;
		case QualityTag.High:
			return AudioQuality.High;
		case QualityTag.MQA:
			return AudioQuality.MQA;
	}
	switch (audioQuality) {
		case "HIGH":
			return AudioQuality.Low;
		case "LOW":
			return AudioQuality.Lowest;
	}
};
export const QTLookup = {
	[AudioQuality.HiRes]: QualityTag.HiRes,
	[AudioQuality.MQA]: QualityTag.MQA,
	[AudioQuality.High]: QualityTag.High,
} as const;

export interface ISRCData {
	mediaProduct: MediaProduct;
	playbackContext: PlaybackContext;
}
export interface MediaProduct {
	productId: string;
	productType: string;
	referenceId: string;
	sourceId: string;
	sourceType: string;
}
export interface PlaybackContext {
	actualAssetPresentation: string;
	actualAudioMode: TrackItem["audioModes"];
	actualAudioQuality: AudioQuality;
	actualDuration: number;
	actualProductId: string;
	actualStreamType: unknown;
	actualVideoQuality: unknown;
	assetPosition: number;
	bitDepth: number | null;
	codec: string;
	playbackSessionId: string;
	sampleRate: number | null;
}

export const QualityMeta = {
	[QualityTag.HiRes]: { textContent: "HiRes", color: "#ffd432" },
	[QualityTag.MQA]: { textContent: "MQA", color: "#F9BA7A" },
	[QualityTag.High]: { textContent: "High", color: "#33FFEE" },
	[QualityTag.DolbyAtmos]: { textContent: "Atmos", color: "#6ab5ff" },
	[QualityTag.Sony630]: undefined,
	["LOW"]: { textContent: "Low", color: "#b9b9b9" },
} as const;

const qualityOrder = [QualityTag.HiRes, QualityTag.MQA, QualityTag.High, QualityTag.DolbyAtmos, QualityTag.Sony630, "LOW"];
export const sortQualityTags = (array?: QualityTag[]): QualityTag[] => (array ?? []).sort((a, b) => qualityOrder.indexOf(a) - qualityOrder.indexOf(b));

export const audioQualities = Object.values(AudioQuality);
// Dont show MQA as a option as if HiRes is avalible itl always be served even if MQA is requested.
export const validQualitiesSettings: AudioQuality[] = [AudioQuality.HiRes, AudioQuality.High, AudioQuality.Low, AudioQuality.Lowest];

export const AudioQualityInverse = Object.fromEntries(Object.entries(AudioQuality).map(([key, value]) => [value, key]));
