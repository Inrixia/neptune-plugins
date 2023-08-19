import { decryptKeyId } from "./decryptKeyId";
import { getHeaders } from "./fetchy";

export const AudioQuality = {
	HiRes: "HI_RES_LOSSLESS",
};
export const getStreamInfo = async (trackId, audioQuality) => {
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
