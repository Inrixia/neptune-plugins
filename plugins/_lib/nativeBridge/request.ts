import { invoke } from ".";
import { SharedObjectStore } from "../storage/SharedObjectStore";
import { libTrace } from "../trace";
import type { NativeBridge } from "./nativeBridge.native";

export const requestJson = invoke("requestJson");
export const startTrackDownload = invoke("startTrackDownload");
export const getDownloadProgress = invoke("getDownloadProgress");
// Utilize requestCache to persist cache
const requestCache = new SharedObjectStore<string, any>("requestCache");
const _requestJsonCached = invoke("requestJsonCached");
export const requestJsonCached: NativeBridge["requestJsonCached"] = async (url, options) => {
	// Always update the shared cache from the live cache, keep cache up to date while returning stale values
	const liveCacheRes = _requestJsonCached(url, options).then((apiRes) => {
		requestCache.put(apiRes, url).catch(libTrace.err.withContext("requestCache.put"));
		return apiRes;
	});
	const cacheRes = await requestCache.get(url).catch(libTrace.err.withContext("requestCache.get"));
	if (cacheRes !== undefined) return cacheRes;
	return liveCacheRes;
};
