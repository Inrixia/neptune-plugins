import type { IncomingMessage } from "http";
import { RequestOptions, request } from "https";
import { libTrace } from "../../trace.native";

let defaultUserAgent: string | undefined = undefined;
export const setDefaultUserAgent = (userAgent: string) => (defaultUserAgent = userAgent);

export type ExtendedRequestOptions = RequestOptions & { body?: string; poke?: true };
export const requestStream = (url: string, options: ExtendedRequestOptions = {}) =>
	new Promise<IncomingMessage>((resolve, reject) => {
		const body = options.body;
		delete options.body;
		options.headers ??= {};
		options.headers["user-agent"] = defaultUserAgent;
		const req = request(url, options, (res) => {
			const statusMsg = res.statusMessage !== "" ? ` - ${res.statusMessage}` : "";
			libTrace.debug(`[${res.statusCode}${statusMsg}] (${req.method})`, url);
			if (options.poke) req.destroy();
			resolve(res);
		});
		req.on("error", reject);
		if (body !== undefined) req.write(body);
		req.end();
	});
