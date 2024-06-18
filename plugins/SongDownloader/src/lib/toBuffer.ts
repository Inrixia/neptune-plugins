import type { Readable } from "stream";

export const toBuffer = (stream: Readable) =>
	new Promise<Buffer>((resolve, reject) => {
		const chunks: Buffer[] = [];
		stream.on("data", (chunk) => chunks.push(chunk));
		stream.on("end", () => resolve(Buffer.concat(chunks)));
		stream.on("error", reject);
	});
