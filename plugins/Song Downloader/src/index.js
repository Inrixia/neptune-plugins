import confetti from "canvas-confetti";
import { getStreamInfo, AudioQuality } from "./getStreamInfo";
import { decryptBuffer } from "./decryptBuffer";
import { fetchy } from "./fetchy";
import { saveFile } from "./saveFile";
confetti();

const downloadTest = async () => {
	const streamInfo = await getStreamInfo(307576013, AudioQuality.HiRes);
	console.log(streamInfo);

	const { key, nonce } = streamInfo.cryptKey;
	const url = streamInfo.manifest.urls[0];

	const encryptedBuffer = await fetchy(url);

	// Read the encrypted data from the Response object
	const decodedBuffer = await decryptBuffer(encryptedBuffer, key, nonce);

	// Prompt the user to save the file
	saveFile(new Blob([decodedBuffer], { type: "application/octet-stream" }), "test.flac");
};

window.go = async () => {
	// downloadTest();
};
