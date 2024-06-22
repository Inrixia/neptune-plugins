import type { Readable } from "stream";
import { FetchyOptions, requestStream, rejectNotOk, parseTotal } from ".";

import type stream from "stream";
const { Transform, PassThrough } = <typeof stream>require("stream");

export const requestSegmentsStream = async (segments: string[], options: FetchyOptions = {}) =>
	new Promise<Readable>(async (resolve, reject) => {
		const combinedStream = new PassThrough();

		let { onProgress, bytesWanted } = options ?? {};
		let downloaded = 0;
		let total = 0;
		if (bytesWanted === undefined) {
			const buffers = await Promise.all(
				segments.map(async (url) => {
					const res = await requestStream(url).then(rejectNotOk);
					total += parseTotal(res.headers);
					const chunks: Buffer[] = [];
					res.on("data", (chunk) => {
						chunks.push(chunk);
						downloaded += chunk.length;
						onProgress?.({ total, downloaded, percent: (downloaded / total) * 100 });
					});
					res.on("error", reject);
					return new Promise<Buffer>((resolve) => res.on("end", () => resolve(Buffer.concat(chunks))));
				})
			);
			combinedStream.write(Buffer.concat(buffers));
		} else {
			for (const url of segments) {
				const res = await requestStream(url).then(rejectNotOk);
				total += parseTotal(res.headers);
				res.on("data", (chunk) => {
					combinedStream.write(chunk);
					downloaded += chunk.length;
					onProgress?.({ total, downloaded, percent: (downloaded / total) * 100 });
				});
				res.on("error", reject);
				await new Promise((resolve) => res.on("end", resolve));
				if (downloaded >= bytesWanted) break;
			}
		}
		combinedStream.end();
		resolve(combinedStream);
	});
