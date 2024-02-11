import type https from "https";
const { request } = <typeof https>require("https");

import { store } from "@neptune";

export const getHeaders = (): Record<string, string> => {
	const state = store.getState();
	return {
		Authorization: `Bearer ${state.session.oAuthAccessToken}`,
		"x-tidal-token": <string>(<any>state.session.clientId),
	};
};

export type OnProgress = (info: { total: number; downloaded: number; percent: number }) => void;

export const fetchy = (url: string, onProgress: OnProgress, byteRangeStart = 0, byteRangeEnd?: number) =>
	new Promise((resolve, reject) => {
		const headers = getHeaders();
		if (typeof byteRangeStart !== "number") throw new Error("byteRangeStart must be a number");
		if (byteRangeEnd !== undefined) {
			if (typeof byteRangeEnd !== "number") throw new Error("byteRangeEnd must be a number");
			headers["Range"] = `bytes=${byteRangeStart}-${byteRangeEnd}`;
		}
		const req = request(
			url,
			{
				headers,
			},
			(res) => {
				let total = -1;

				if (res.headers["content-range"]) {
					// Server supports byte range, parse total file size from header
					const match = /\/(\d+)$/.exec(res.headers["content-range"]);
					if (match) total = parseInt(match[1], 10);
				} else {
					if (res.headers["content-length"] !== undefined) total = parseInt(res.headers["content-length"], 10);
				}

				let downloaded = 0;
				const chunks: Buffer[] = [];

				res.on("data", (chunk: Buffer) => {
					chunks.push(chunk);
					downloaded += chunk.length;
					if (onProgress !== undefined) onProgress({ total, downloaded, percent: (downloaded / total) * 100 });
				});
				res.on("end", () => {
					// Chunks is an array of Buffer objects.
					const chunkyBuffer = Buffer.concat(chunks);
					if (onProgress !== undefined) onProgress({ total, downloaded: total, percent: 100 });
					resolve(chunkyBuffer);
				});
			}
		);
		req.on("error", reject);
		req.end();
	});
