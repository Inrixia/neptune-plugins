export enum AudioQualityEnum {
	HiRes = "HI_RES_LOSSLESS",
	MQA = "HI_RES",
	High = "LOSSLESS",
	Low = "HIGH",
	Lowest = "LOW",
}
export enum QualityTagEnum {
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
	actualAudioQuality: AudioQualityEnum;
	actualDuration: number;
	actualProductId: string;
	actualStreamType: null;
	actualVideoQuality: null;
	assetPosition: number;
	bitDepth: number;
	codec: string;
	playbackSessionId: string;
	sampleRate: number;
}

export const QualityMeta = {
	[QualityTagEnum.MQA]: { textContent: "MQA", color: "#F9BA7A" },
	[QualityTagEnum.HiRes]: { textContent: "HiRes", color: "#ffd432" },
	[QualityTagEnum.DolbyAtmos]: { textContent: "Atmos", color: "#0052a3" },
	[QualityTagEnum.Sony630]: undefined,
	[QualityTagEnum.High]: { textContent: "High", color: "#33FFEE" },
} as const;

export const audioQualities = Object.values(AudioQualityEnum);
// Dont show MQA as a option as if HiRes is avalible itl always be served even if MQA is requested.
export const validQualitiesSettings: AudioQualityEnum[] = [AudioQualityEnum.HiRes, AudioQualityEnum.High];

export const AudioQualityInverse = Object.fromEntries(Object.entries(AudioQualityEnum).map(([key, value]) => [value, key]));
