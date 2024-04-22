import type https from "https";
import type { RequestOptions } from "https";

const { request } = <typeof https>require("https");

import { modules } from "@neptune";

const findModuleFunction = (functionName: string) => {
	for (const module of modules) {
		if (typeof module?.exports !== "object") continue;
		for (const _key in module.exports) {
			const func = module.exports[_key]?.[functionName];
			if (typeof func === "function") return func;
		}
	}
};
const getCredentials: () => Promise<{ token: string; clientId: string }> = findModuleFunction("getCredentials");

export const getHeaders = async (): Promise<Record<string, string>> => {
	const { clientId, token } = await getCredentials();
	return {
		Authorization: `Bearer ${token}`,
		"x-tidal-token": clientId,
	};
};

export type OnProgress = (info: { total: number; downloaded: number; percent: number }) => void;
export interface FetchyOptions extends RequestOptions {
	onProgress?: OnProgress;
}

export const fetchy = async (url: string, options?: FetchyOptions): Promise<Buffer> =>
	new Promise((resolve, reject) => {
		const { onProgress } = options ?? {};
		const req = request(url, options ?? {}, (res) => {
			const OK = res.statusCode !== undefined && res.statusCode >= 200 && res.statusCode < 300;
			if (!OK) reject(new Error(`Status code is ${res.statusCode}`));
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
				if (onProgress !== undefined) onProgress({ total, downloaded: total, percent: 100 });
				// Chunks is an array of Buffer objects.
				resolve(Buffer.concat(chunks));
			});
		});
		req.on("error", reject);
		req.end();
	});
