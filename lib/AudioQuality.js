export const AudioQuality = {
	HiRes: "HI_RES_LOSSLESS",
	MQA: "HI_RES",
	High: "LOSSLESS",
};
export const validQualities = Object.values(AudioQuality);
export const validQualitiesSet = new Set(validQualities);

// Dont show MQA as a option as if HiRes is avalible itl always be served even if MQA is requested.
export const validQualitiesSettings = [AudioQuality.HiRes, AudioQuality.High];

export const AudioQualityInverse = Object.fromEntries(Object.entries(AudioQuality).map(([key, value]) => [value, key]));

export const qualityFromMeta = {
	LOSSLESS: AudioQuality.High,
	HIRES_LOSSLESS: AudioQuality.HiRes,
	MQA: AudioQuality.MQA,
};
