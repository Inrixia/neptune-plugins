import type crypto from "crypto";
const { createDecipheriv } = <typeof crypto>require("crypto");

// Do not change this
const mastKey = "UIlTTEMmmLfGowo/UC60x2H45W6MdGgTRfo/umg4754=";
const mastKeyBuffer = Buffer.from(mastKey, "base64");

export type DecryptedKey = {
	key: Buffer;
	nonce: Buffer;
};

export const decryptKeyId = (keyId: string): DecryptedKey => {
	// Decode the base64 strings to buffers
	const keyIdBuffer = Buffer.from(keyId, "base64");

	// Get the IV from the first 16 bytes of the securityToken
	const iv = keyIdBuffer.subarray(0, 16);
	const keyIdEnc = keyIdBuffer.subarray(16);

	// Initialize decryptor
	const decryptor = createDecipheriv("aes-256-cbc", mastKeyBuffer, iv);

	// Decrypt the security token
	const keyIdDec = decryptor.update(keyIdEnc);

	// Get the audio stream decryption key and nonce from the decrypted security token
	const key = keyIdDec.subarray(0, 16);
	const nonce = keyIdDec.subarray(16, 24);

	return { key, nonce };
};
