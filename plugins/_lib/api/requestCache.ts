import { rejectNotOk, RequestOptionsWithBody, requestStream, toJson } from "../fetch";
import { SharedObjectStore } from "../sharedStorage";

export const requestCache = new SharedObjectStore<string, any>("requestCache");
export const requestCached = async <T>(url: string, options?: RequestOptionsWithBody): Promise<T> => {
	let apiRes = await requestCache.get(url);
	if (apiRes !== undefined) return <T>apiRes;
	apiRes = await requestStream(url, options)
		.then(rejectNotOk)
		.then(toJson<T>);
	await requestCache.put(apiRes, url);
	return apiRes;
};
