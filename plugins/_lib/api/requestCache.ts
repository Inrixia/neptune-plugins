import { rejectNotOk, ExtendedRequestOptions, requestStream, toJson } from "../fetch";
import { SharedObjectStore } from "../sharedStorage";

import { Tracer } from "../trace";
const trace = Tracer("[requestCache]");

export const requestCache = new SharedObjectStore<string, any>("requestCache");
export const requestCached = async <T>(url: string, options?: ExtendedRequestOptions): Promise<T> => {
	let apiRes = await requestCache.get(url).catch(trace.err.withContext("get"));
	if (apiRes !== undefined) return <T>apiRes;
	apiRes = await requestStream(url, options)
		.then(rejectNotOk)
		.then(toJson<T>);
	requestCache.put(apiRes, url).catch(trace.err.withContext("put"));
	return apiRes;
};
