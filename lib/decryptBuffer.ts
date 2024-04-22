import { DecryptedKey } from "./decryptKeyId";
import type crypto from "crypto";
const { createDecipheriv } = <typeof crypto>require("crypto");

export const decryptBuffer = async (encryptedBuffer: Buffer, { key, nonce }: DecryptedKey) => {
	// Extend nonce to 16 bytes (nonce + counter)
	const iv = Buffer.concat([nonce, Buffer.alloc(8, 0)]);

	// Initialize counter and file decryptor
	const decipher = createDecipheriv("aes-128-ctr", key, iv);

	// Decrypt the data
	const decryptedData = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);

	return decryptedData;
};
