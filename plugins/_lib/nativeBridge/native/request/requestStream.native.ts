import type { IncomingMessage } from "http";
import { RequestOptions, request } from "https";
import { libTrace } from "../../trace.native";

let defaultUserAgent: string | undefined = undefined;
export const setDefaultUserAgent = (userAgent: string) => (defaultUserAgent = userAgent);

export type ExtendedRequestOptions = RequestOptions & { body?: string };
export const requestStream = (url: string, options: ExtendedRequestOptions = {}): Promise<IncomingMessage> =>
	new Promise<IncomingMessage>((resolve, reject) => {
		const body = options.body;
		delete options.body;
		options.headers ??= {};
		options.headers["user-agent"] = defaultUserAgent;

		const req = request(url, options, (res) => {
			const statusMsg = res.statusMessage !== "" ? ` - ${res.statusMessage}` : "";
			if (res.statusCode === 429) {
				const retryAfter = parseInt(res.headers["retry-after"] ?? "1", 10);
				libTrace.debug(`[${res.statusCode}${statusMsg}] (${req.method}) - Retrying in ${retryAfter}s`, url);
				return setTimeout(() => requestStream(url, options).then(resolve).catch(reject), retryAfter * 1000);
			}
			libTrace.debug(`[${res.statusCode}${statusMsg}] (${req.method})`, url);
			resolve(res);
		});

		req.on("error", reject);
		if (body !== undefined) req.write(body);
		req.end();
	});
