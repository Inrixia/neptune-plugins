import type { IncomingMessage } from "http";
import { RequestOptions, request } from "https";

export type ExtendedRequestOptions = RequestOptions & { body?: string; poke?: true };
export const requestStream = (url: string, options: ExtendedRequestOptions = {}) =>
	new Promise<IncomingMessage>((resolve, reject) => {
		const body = options.body;
		delete options.body;
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
