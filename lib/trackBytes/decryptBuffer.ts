import { DecryptedKey } from "./decryptKeyId";
import type crypto from "crypto";
const { createDecipheriv } = <typeof crypto>require("crypto");

// Extend nonce to 16 bytes (nonce + counter)
export const makeDecipheriv = async ({ key, nonce }: DecryptedKey) => createDecipheriv("aes-128-ctr", key, Buffer.concat([nonce, Buffer.alloc(8, 0)]));
