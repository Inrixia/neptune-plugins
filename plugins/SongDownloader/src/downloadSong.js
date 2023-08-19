import { getStreamInfo } from "./getStreamInfo";
import { decryptBuffer } from "./decryptBuffer";
import { fetchy } from "./fetchy";
import { saveFile } from "./saveFile";

export const downloadSong = async (songId, fileName, quality) => {
	const streamInfo = await getStreamInfo(songId, quality);

	const { key, nonce } = streamInfo.cryptKey;
	const url = streamInfo.manifest.urls[0];

	const encryptedBuffer = await fetchy(url);

	// Read the encrypted data from the Response object
	const decodedBuffer = await decryptBuffer(encryptedBuffer, key, nonce);

	// Prompt the user to save the file
	saveFile(new Blob([decodedBuffer], { type: "application/octet-stream" }), `${fileName}.flac`);
};
