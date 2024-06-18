import type https from "https";
const { request } = <typeof https>require("https");

import { modules } from "@neptune";
import { RequestOptions } from "https";
import type { Decipher } from "crypto";

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
export interface FetchyOptions {
	onProgress?: OnProgress;
	bytesWanted?: number;
	getDecipher?: () => Promise<Decipher>;
	requestOptions?: RequestOptions;
}

export const requestBuffer = async (url: string, options: RequestOptions = {}) =>
	new Promise<Buffer>((resolve, reject) => {
		const req = request(url, options, (res) => {
			const OK = res.statusCode !== undefined && res.statusCode >= 200 && res.statusCode < 300;
			if (!OK) reject(new Error(`Status code is ${res.statusCode}`));

			const chunks: Buffer[] = [];
			res.on("data", (data) => chunks.push(data));
			res.on("end", () => resolve(Buffer.concat(chunks)));
		});
		req.on("error", reject);
		req.end();
	});

export const requestDecodedBuffer = async (url: string, options?: FetchyOptions): Promise<Buffer> =>
	new Promise((resolve, reject) => {
		const { onProgress, bytesWanted, getDecipher } = options ?? {};
		const reqOptions = { ...(options?.requestOptions ?? {}) };
		if (bytesWanted !== undefined) {
			reqOptions.headers ??= {};
			reqOptions.headers.Range = `bytes=0-${bytesWanted}`;
		}
		const req = request(url, reqOptions, (res) => {
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

			const decipherP = getDecipher?.();

			res.on("data", async (chunk: Buffer) => {
				chunks.push((await decipherP)?.update(chunk) ?? chunk);
				downloaded += chunk.length;
				if (onProgress) onProgress({ total, downloaded, percent: (downloaded / total) * 100 });
			});

			res.on("end", async () => {
				if (onProgress) onProgress({ total, downloaded: total, percent: 100 });
				if (decipherP) chunks.push((await decipherP).final());
				resolve(Buffer.concat(chunks));
			});

			if (total !== -1 && onProgress) onProgress({ total, downloaded, percent: (downloaded / total) * 100 });
		});
		req.on("error", reject);
		req.end();
	});
