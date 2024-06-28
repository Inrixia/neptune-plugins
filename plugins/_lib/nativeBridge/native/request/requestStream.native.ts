import type { IncomingMessage } from "http";
import { RequestOptions, request } from "https";
import { libTrace } from "../../trace.native";
import { Semaphore } from "../../../Semaphore";

let defaultUserAgent: string | undefined = undefined;
export const setDefaultUserAgent = (userAgent: string) => (defaultUserAgent = userAgent);

// Cap to two requests per domain at a time
const rateLimitSema = new Semaphore(1);
export type ExtendedRequestOptions = RequestOptions & { body?: string; rateLimit?: number };
export const requestStream = async (url: string, options: ExtendedRequestOptions = {}): Promise<IncomingMessage> => {
	options.headers ??= {};
	options.headers["user-agent"] = defaultUserAgent;
	options.rateLimit ??= 0;
	const release = options.rateLimit > 0 ? await rateLimitSema.obtain() : undefined;
	return new Promise<IncomingMessage>((resolve, reject) => {
		const req = request(url, options, (res) => {
			const statusMsg = res.statusMessage !== "" ? ` - ${res.statusMessage}` : "";
			if (res.statusCode === 429 || res.statusCode === 503) {
				const retryAfter = parseInt(res.headers["retry-after"] ?? "1", 10);
				options.rateLimit!++;
				libTrace.debug(`[${res.statusCode}${statusMsg}] (${req.method})`, `[Attempt ${options.rateLimit}, Retry in ${retryAfter}s]`, url);
				return setTimeout(() => {
					release?.();
					requestStream(url, options).then(resolve, reject);
				}, retryAfter);
			}
			if (options.rateLimit! > 0) libTrace.debug(`[${res.statusCode}${statusMsg}] (${req.method})`, `[After ${options.rateLimit} attempts]`, url);
			else libTrace.debug(`[${res.statusCode}${statusMsg}] (${req.method})`, url);
			resolve(res);
		});
		req.on("error", reject);
		const body = options.body;
		if (body !== undefined) req.write(body);
		req.end();
	}).finally(release);
};
