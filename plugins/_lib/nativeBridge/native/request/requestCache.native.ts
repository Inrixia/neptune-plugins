import { requestJson, ExtendedRequestOptions } from "./";

import { libTrace } from "../../trace.native";

const requestCache: Record<string, any> = {};
export const requestJsonCached = async <T>(url: string, options?: ExtendedRequestOptions): Promise<T> => {
	let apiRes = requestCache[url];
	if (apiRes !== undefined) {
		libTrace.debug("[CACHE HIT]", url);
		return <T>apiRes;
	}
	apiRes = await requestJson(url, options);
	return (requestCache[url] = apiRes);
};
