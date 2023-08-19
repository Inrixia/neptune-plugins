import { getStreamInfo } from "../../../lib/getStreamInfo";
import { decryptBuffer } from "../../../lib/decryptBuffer";
import { fetchy } from "../../../lib/fetchy";
import { saveFile } from "../../../lib/saveFile";
import { AudioQualityInverse } from "../../../lib/AudioQuality";

// const { parseBuffer } = require("music-metadata/lib/core");

export const downloadSong = async (songId, fileName, quality, onProgress) => {
	const streamInfo = await getStreamInfo(songId, quality);

	const { key, nonce } = streamInfo.cryptKey;
	const url = streamInfo.manifest.urls[0];

	// 0, 43
	const encryptedBuffer = await fetchy(url, onProgress);

	// Read the encrypted data from the Response object
	const decodedBuffer = await decryptBuffer(encryptedBuffer, key, nonce);

	// const meta = await parseBuffer(decodedBuffer);
	// console.log(decodedBuffer.length);
	// console.log(meta);

	// Prompt the user to save the file
	saveFile(new Blob([decodedBuffer], { type: "application/octet-stream" }), `${fileName} [${AudioQualityInverse[streamInfo.audioQuality]}].flac`);
};
