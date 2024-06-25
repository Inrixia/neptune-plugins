import type * as fs from "fs/promises";
const { writeFile } = <typeof fs>require("fs/promises");

import type { Readable } from "stream";

const unsafeCharacters = /[\/:*?"<>|]/g;
const sanitizeFilename = (filename: string): string => filename.replace(unsafeCharacters, "_");

export const saveFileNode = (stream: Readable, path: string, fileName: string) => {
	return writeFile(`${path}/${sanitizeFilename(fileName)}`, stream);
};

export const saveFile = async (blob: Blob, fileName: string) => {
	// Create a new Object URL for the Blob
	const objectUrl = URL.createObjectURL(blob);

	// Create a link element
	const a = document.createElement("a");

	// Set the download attribute on the link element
	a.href = objectUrl;
	a.download = sanitizeFilename(fileName);

	// Trigger the download by simulating a click on the link
	a.click();

	// Clean up: revoke the Object URL after the link is clicked
	URL.revokeObjectURL(objectUrl);
};
