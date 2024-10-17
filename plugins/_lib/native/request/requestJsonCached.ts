import { SharedObjectStore } from "../../storage/SharedObjectStore";
import { libTrace } from "../../trace";

import { requestJsonCached as rjcNative } from "./requestJsonCached.native";
import { setDefaultUserAgent } from "./requestStream.native";

setDefaultUserAgent(navigator.userAgent).catch(libTrace.err.withContext("Failed to set default user agent"));

// Utilize requestCache to persist cache
const requestCache = new SharedObjectStore<string, any>("requestCache");
export const requestJsonCached: typeof rjcNative = async (url, options) => {
	// Always update the shared cache from the live cache, keep cache up to date while returning stale values
	const liveCacheRes = rjcNative(url, options).then((apiRes) => {
		requestCache.put(apiRes, url).catch(libTrace.err.withContext("requestCache.put"));
		return apiRes;
	});
	const fastRes = await Promise.race([liveCacheRes, requestCache.get(url).catch(libTrace.err.withContext("requestCache.get"))]);
	if (fastRes !== undefined) return fastRes;
	return liveCacheRes;
};
