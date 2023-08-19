import { decryptKeyId } from "./decryptKeyId";
import { getHeaders } from "./fetchy";

export const AudioQuality = {
	HiRes: "HI_RES_LOSSLESS",
	MQA: "HI_RES",
	High: "LOSSLESS",
};

const validQualities = new Set(Object.values(AudioQuality));

export const qualityFromMeta = (metaQuality) =>
	({
		LOSSLESS: AudioQuality.High,
		HIRES_LOSSLESS: AudioQuality.HiRes,
		MQA: AudioQuality.MQA,
	}[metaQuality]);

export const getStreamInfo = async (trackId, audioQuality) => {
	if (!validQualities.has(audioQuality)) throw new Error(`Invalid audio quality: ${audioQuality}`);

	const url = `https://desktop.tidal.com/v1/tracks/${trackId}/playbackinfopostpaywall/v4?audioquality=${audioQuality}&playbackmode=STREAM&assetpresentation=FULL`;

	const playbackInfo = await fetch(url, {
		headers: getHeaders(),
	}).then((r) => r.json());

	const manifest = JSON.parse(atob(playbackInfo.manifest));
	if (manifest.encryptionType !== "OLD_AES") throw new Error(`Unexpected manifest encryption type ${manifest.encryptionType}`);

	playbackInfo.manifest = manifest;
	playbackInfo.cryptKey = await decryptKeyId(manifest.keyId);
	return playbackInfo;
};
