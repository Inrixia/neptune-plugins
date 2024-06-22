import { rejectNotOk, RequestOptionsWithBody, requestStream, toJson } from "../fetch";
import { SharedObjectStore } from "../sharedStorage";

import { Tracer } from "../trace";
const trace = Tracer("[requestCache]");

export const requestCache = new SharedObjectStore<string, any>("requestCache");
export const requestCached = async <T>(url: string, options?: RequestOptionsWithBody): Promise<T> => {
	let apiRes = await requestCache.getCache(url, trace.err.withContext("get"));
	if (apiRes !== undefined) return <T>apiRes;
	apiRes = await requestStream(url, options)
		.then(rejectNotOk)
		.then(toJson<T>);
	await requestCache.putCache(apiRes, url, trace.err.withContext("put"));
	return apiRes;
};
