export const AudioQuality = {
	HiRes: "HI_RES_LOSSLESS",
	MQA: "HI_RES",
	High: "LOSSLESS",
};
export const validQualitiesSet = new Set();
export const validQualities = Object.values(AudioQuality);

export const AudioQualityInverse = Object.fromEntries(Object.entries(AudioQuality).map(([key, value]) => [value, key]));
export const validAudioQualitiesInverse = Object.values(AudioQualityInverse);

export const qualityFromMeta = {
	LOSSLESS: AudioQuality.High,
	HIRES_LOSSLESS: AudioQuality.HiRes,
	MQA: AudioQuality.MQA,
};
