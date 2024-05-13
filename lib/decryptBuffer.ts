import { DecryptedKey } from "./decryptKeyId";
import type crypto from "crypto";
const { createDecipheriv } = <typeof crypto>require("crypto");

export const makeDecipheriv = async ({ key, nonce }: DecryptedKey) => {
	// Extend nonce to 16 bytes (nonce + counter)
	const iv = Buffer.concat([nonce, Buffer.alloc(8, 0)]);

	return createDecipheriv("aes-128-ctr", key, iv);
};
