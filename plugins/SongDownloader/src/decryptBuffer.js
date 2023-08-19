const crypto = require("crypto");

export const decryptBuffer = async (encryptedBuffer, key, nonce) => {
	// Extend nonce to 16 bytes (nonce + counter)
	const iv = Buffer.concat([nonce, Buffer.alloc(8, 0)]);

	// Initialize counter and file decryptor
	const decipher = new crypto.createDecipheriv("aes-128-ctr", key, iv);

	// Decrypt the data
	const decryptedData = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);

	return decryptedData;
};
