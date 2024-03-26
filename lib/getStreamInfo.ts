import { decryptKeyId } from "./decryptKeyId";
import { getHeaders } from "./fetchy";
import { validQualitiesSet, validQualities, PlaybackContextAudioQuality } from "./AudioQuality";

export const getStreamInfo = async (trackId: number, audioQuality: PlaybackContextAudioQuality) => {
	if (!validQualitiesSet.has(audioQuality)) throw new Error(`Invalid audio quality: ${audioQuality}, should be one of ${validQualities.join(", ")}`);
	if (trackId === undefined) throw new Error("trackId is required");

	const url = `https://desktop.tidal.com/v1/tracks/${trackId}/playbackinfo?audioquality=${audioQuality}&playbackmode=STREAM&assetpresentation=FULL`;

	const playbackInfo = await fetch(url, {
		headers: await getHeaders(),
	}).then((r) => {
		if (r.status === 401) {
			alert("Failed to fetch Stream Info... Invalid OAuth Access Token!");
			throw new Error("Invalid OAuth Access Token!");
		}
		return r.json();
	});

	const manifest = JSON.parse(atob(playbackInfo.manifest));
	if (manifest.encryptionType !== "OLD_AES") throw new Error(`Unexpected manifest encryption type ${manifest.encryptionType}`);

	playbackInfo.manifest = manifest;
	playbackInfo.cryptKey = await decryptKeyId(manifest.keyId);
	return playbackInfo;
};
