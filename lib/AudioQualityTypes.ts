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
	actualAudioMode: string;
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
	[QualityTag.MQA]: { textContent: "MQA", color: "#F9BA7A" },
	[QualityTag.HiRes]: { textContent: "HiRes", color: "#ffd432" },
	[QualityTag.DolbyAtmos]: { textContent: "Atmos", color: "#0052a3" },
	[QualityTag.Sony630]: undefined,
	[QualityTag.High]: { textContent: "High", color: "#33FFEE" },
} as const;

export const audioQualities = Object.values(AudioQuality);
// Dont show MQA as a option as if HiRes is avalible itl always be served even if MQA is requested.
export const validQualitiesSettings: AudioQuality[] = [AudioQuality.HiRes, AudioQuality.High, AudioQuality.Low, AudioQuality.Lowest];

export const AudioQualityInverse = Object.fromEntries(Object.entries(AudioQuality).map(([key, value]) => [value, key]));
