import { decryptKeyId } from "./decryptKeyId";
import { getHeaders } from "./fetchy";
import { validQualitiesSet } from "./AudioQualities";

export const getStreamInfo = async (trackId, audioQuality) => {
	if (!validQualitiesSet.has(audioQuality)) throw new Error(`Invalid audio quality: ${audioQuality}`);

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
