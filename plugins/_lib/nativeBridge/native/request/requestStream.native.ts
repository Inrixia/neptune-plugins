import type { IncomingMessage } from "http";
import { RequestOptions, request } from "https";

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
			console.debug(`[${res.statusCode}${statusMsg}] (${req.method})`, url, res);
			if (options.poke) req.destroy();
			resolve(res);
		});
		req.on("error", reject);
		if (body !== undefined) req.write(body);
		req.end();
	});
