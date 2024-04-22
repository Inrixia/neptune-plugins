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

export type PlaybackContext = {
	actualAudioQuality: AudioQualityEnum;
	actualProductId: number;
};

export const QualityMeta = {
	[QualityTagEnum.MQA]: { textContent: "MQA", color: "#F9BA7A" },
	[QualityTagEnum.HiRes]: { textContent: "HiRes", color: "#ffd432" },
	[QualityTagEnum.DolbyAtmos]: { textContent: "Atmos", color: "#0052a3" },
	[QualityTagEnum.Sony630]: undefined,
	[QualityTagEnum.High]: undefined,
} as const;

export const audioQualities = Object.values(AudioQualityEnum);
// Dont show MQA as a option as if HiRes is avalible itl always be served even if MQA is requested.
export const validQualitiesSettings: AudioQualityEnum[] = [AudioQualityEnum.HiRes, AudioQualityEnum.High];

export const AudioQualityInverse = Object.fromEntries(Object.entries(AudioQualityEnum).map(([key, value]) => [value, key]));
