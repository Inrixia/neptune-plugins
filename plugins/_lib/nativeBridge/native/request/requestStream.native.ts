import type { IncomingMessage } from "http";
import { RequestOptions, request } from "https";
import { libTrace } from "../../trace.native";
import { Semaphore } from "../../../Semaphore";

let defaultUserAgent: string | undefined = undefined;
export const setDefaultUserAgent = (userAgent: string) => (defaultUserAgent = userAgent);

// Cap to two requests per domain at a time
const activeDomains: Record<string, Semaphore> = {};
export type ExtendedRequestOptions = RequestOptions & { body?: string };
export const requestStream = async (url: string, options: ExtendedRequestOptions = {}): Promise<IncomingMessage> => {
	const domain = url.split("/")[2];
	activeDomains[domain] ??= new Semaphore(4);
	const release = await activeDomains[domain].obtain();
	return new Promise<IncomingMessage>((resolve, reject) => {
		const body = options.body;
		delete options.body;
		options.headers ??= {};
		options.headers["user-agent"] = defaultUserAgent;
		const req = request(url, options, (res) => {
			const statusMsg = res.statusMessage !== "" ? ` - ${res.statusMessage}` : "";
			if (res.statusCode === 429 || res.statusCode === 503) {
				const retryAfter = parseInt(res.headers["retry-after"] ?? (Math.floor(Math.random() * 10) + 5).toString(), 10);
				libTrace.debug(`[${res.statusCode}${statusMsg}] (${req.method}) - Retrying in ${retryAfter}s`, url);
				return setTimeout(() => {
					release();
					requestStream(url, options).then(resolve, reject);
				}, retryAfter);
			}
			libTrace.debug(`[${res.statusCode}${statusMsg}] (${req.method})`, url);
			resolve(res);
		});

		req.on("error", reject);
		if (body !== undefined) req.write(body);
		req.end();
	}).finally(release);
};
