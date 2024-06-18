import type https from "https";
const { request } = <typeof https>require("https");
import type stream from "stream";
const { Transform, PassThrough } = <typeof stream>require("stream");

import { modules } from "@neptune";
import { RequestOptions } from "https";
import type { Decipher } from "crypto";
import type { IncomingHttpHeaders, IncomingMessage } from "http";
import { type Readable } from "stream";

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

export const requestStream = (url: string, options: RequestOptions = {}) =>
	new Promise<IncomingMessage>((resolve, reject) => {
		const req = request(url, options, (res) => {
			const OK = res.statusCode !== undefined && res.statusCode >= 200 && res.statusCode < 300;
			if (!OK) reject(new Error(`Status code is ${res.statusCode}`));
			resolve(res);
		});
		req.on("error", reject);
		req.end();
	});

export const requestSegmentsStream = async (segments: string[], options: FetchyOptions = {}) =>
	new Promise<Readable>(async (resolve, reject) => {
		const combinedStream = new PassThrough();

		let { onProgress, bytesWanted } = options ?? {};
		let downloaded = 0;
		let total = 0;
		if (bytesWanted === undefined) {
			const buffers = await Promise.all(
				segments.map(async (url) => {
					const res = await requestStream(url);
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
				const res = await requestStream(url);
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

const parseTotal = (headers: IncomingHttpHeaders) => {
	if (headers["content-range"]) {
		// Server supports byte range, parse total file size from header
		const match = /\/(\d+)$/.exec(headers["content-range"]);
		if (match) return parseInt(match[1], 10);
	} else {
		if (headers["content-length"] !== undefined) return parseInt(headers["content-length"], 10);
	}
	return -1;
};

export const requestDecodedStream = async (url: string, options?: FetchyOptions): Promise<Readable> =>
	new Promise(async (resolve, reject) => {
		const { onProgress, bytesWanted, getDecipher } = options ?? {};
		const reqOptions = { ...(options?.requestOptions ?? {}) };
		if (bytesWanted !== undefined) {
			reqOptions.headers ??= {};
			reqOptions.headers.Range = `bytes=0-${bytesWanted}`;
		}

		const res = await requestStream(url, reqOptions);
		res.on("error", reject);

		let downloaded = 0;
		const total = parseTotal(res.headers);
		if (total !== -1) onProgress?.({ total, downloaded, percent: (downloaded / total) * 100 });

		if (getDecipher !== undefined) {
			const decipher = await getDecipher();
			resolve(
				res.pipe(
					new Transform({
						async transform(chunk, encoding, callback) {
							try {
								downloaded += chunk.length;
								onProgress?.({ total, downloaded, percent: (downloaded / total) * 100 });
								callback(null, decipher.update(chunk));
							} catch (err) {
								callback(<Error>err);
							}
						},
						async flush(callback) {
							try {
								callback(null, decipher.final());
							} catch (err) {
								callback(<Error>err);
							}
						},
					})
				)
			);
		}
		resolve(res);
	});
