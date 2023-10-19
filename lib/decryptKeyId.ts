import type crypto from "crypto";
const { createDecipheriv } = <typeof crypto>require("crypto");

// Do not change this
const mastKey = "UIlTTEMmmLfGowo/UC60x2H45W6MdGgTRfo/umg4754=";

export const decryptKeyId = async (keyId: string) => {
	// Decode the base64 strings to buffers
	const mastKeyBuffer = Buffer.from(mastKey, "base64");
	const keyIdBuffer = Buffer.from(keyId, "base64");

	// Get the IV from the first 16 bytes of the securityToken
	const iv = keyIdBuffer.slice(0, 16);
	const keyIdEnc = keyIdBuffer.slice(16);

	// Initialize decryptor
	const decryptor = createDecipheriv("aes-256-cbc", mastKeyBuffer, iv);

	// Decrypt the security token
	const keyIdDec = decryptor.update(keyIdEnc);

	// Get the audio stream decryption key and nonce from the decrypted security token
	const key = keyIdDec.slice(0, 16);
	const nonce = keyIdDec.slice(16, 24);

	return { key, nonce };
};
