import { requestJson, ExtendedRequestOptions } from "../nativeBridge";
import { SharedObjectStore } from "../storage/SharedObjectStore";

import { Tracer } from "../trace";
const trace = Tracer("[requestCache]");

export const requestCache = new SharedObjectStore<string, any>("requestCache");
export const requestCached = async <T>(url: string, options?: ExtendedRequestOptions): Promise<T> => {
	let apiRes = await requestCache.get(url).catch(trace.err.withContext("get"));
	if (apiRes !== undefined) return <T>apiRes;
	apiRes = await requestJson(url, options);
	requestCache.put(apiRes, url).catch(trace.err.withContext("put"));
	return apiRes;
};
