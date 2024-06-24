import type https from "https";
const { request } = <typeof https>require("https");

import { RequestOptions } from "https";
import type { Decipher } from "crypto";
import type { IncomingHttpHeaders, IncomingMessage } from "http";
import type { Readable } from "stream";

import { findModuleFunction } from "../findModuleFunction";

const getCredentials = findModuleFunction<() => Promise<{ token: string; clientId: string }>>("getCredentials", "function");
if (getCredentials === undefined) throw new Error("getCredentials method not found");

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
	poke?: true;
}

export const rejectNotOk = (res: IncomingMessage) => {
	const OK = res.statusCode !== undefined && res.statusCode >= 200 && res.statusCode < 300;
	if (res.statusCode === undefined) console.log(res);
	if (!OK) throw new Error(`Status code is ${res.statusCode}`);
	return res;
};
export const toJson = <T>(res: IncomingMessage): Promise<T> => toBuffer(res).then((buffer) => JSON.parse(buffer.toString()));
export const toBuffer = (stream: Readable) =>
	new Promise<Buffer>((resolve, reject) => {
		const chunks: Buffer[] = [];
		stream.on("data", (chunk) => chunks.push(chunk));
		stream.on("end", () => resolve(Buffer.concat(chunks)));
		stream.on("error", reject);
	});
export const toBlob = (stream: Readable) =>
	new Promise<Blob>((resolve, reject) => {
		const chunks: Buffer[] = [];
		stream.on("data", (chunk) => chunks.push(chunk));
		stream.on("end", () => resolve(new Blob(chunks)));
		stream.on("error", reject);
	});

export type ExtendedRequestOptions = RequestOptions & { body?: string; poke?: true };
export const requestStream = (url: string, options: ExtendedRequestOptions = {}) =>
	new Promise<IncomingMessage>((resolve, reject) => {
		const body = options.body;
		delete options.body;
		options.headers ??= {};
		options.headers["user-agent"] ??= navigator.userAgent;
		const req = request(url, options, (res) => {
			const statusMsg = res.statusMessage !== "" ? ` - ${res.statusMessage}` : "";
			console.debug(`[${res.statusCode}${statusMsg}] (${req.method})`, url, res);
			if (options.poke) req.destroy();
			resolve(res);
		});
		req.on("error", reject);
		if (body !== undefined) req.write(body);
		req.end();
	});

export const parseTotal = (headers: IncomingHttpHeaders) => {
	if (headers["content-range"]) {
		// Server supports byte range, parse total file size from header
		const match = /\/(\d+)$/.exec(headers["content-range"]);
		if (match) return parseInt(match[1], 10);
	} else {
		if (headers["content-length"] !== undefined) return parseInt(headers["content-length"], 10);
	}
	return -1;
};
