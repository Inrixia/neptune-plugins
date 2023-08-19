import { getStreamInfo } from "./getStreamInfo";
import { decryptBuffer } from "./decryptBuffer";
import { fetchy } from "./fetchy";
import { saveFile } from "./saveFile";
import { AudioQualityInverse } from "./AudioQuality";

export const downloadSong = async (songId, fileName, quality, onProgress) => {
	const streamInfo = await getStreamInfo(songId, quality);

	const { key, nonce } = streamInfo.cryptKey;
	const url = streamInfo.manifest.urls[0];

	const encryptedBuffer = await fetchy(url, onProgress);

	// Read the encrypted data from the Response object
	const decodedBuffer = await decryptBuffer(encryptedBuffer, key, nonce);

	// Prompt the user to save the file
	saveFile(new Blob([decodedBuffer], { type: "application/octet-stream" }), `${fileName} [${AudioQualityInverse[streamInfo.audioQuality]}].flac`);
};

export const downloadBytes = async (songId, quality, byteRangeStart = 0, byteRangeEnd, onProgress) => {
	const streamInfo = await getStreamInfo(songId, quality);

	const { key, nonce } = streamInfo.cryptKey;
	const url = streamInfo.manifest.urls[0];

	const encryptedBuffer = await fetchy(url, onProgress, byteRangeStart, byteRangeEnd);

	// Read the encrypted data from the Response object
	return decryptBuffer(encryptedBuffer, key, nonce);
};
