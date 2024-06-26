import "./nativeBridge.native";

export type * from "./native";

import { libTrace } from "../trace";
import type { NativeBridge } from "./nativeBridge.native";
import { SharedObjectStore } from "../storage/SharedObjectStore";

const _invoke: (method: string, ...args: any[]) => Promise<any> = (<any>window).electron.ipcRenderer.invoke;
const invoke = <K extends keyof NativeBridge>(method: K) => <NativeBridge[K]>((...args: any) =>
		_invoke("___nativeBridge___", method, ...args).catch((err: Error) => {
			err.message = err.message.replaceAll("Error invoking remote method '___nativeBridge___': ", "");
			throw err;
		}));

invoke("setDefaultUserAgent")(navigator.userAgent).catch(libTrace.err.withContext("Failed to set default user agent"));

export const getTrackInfo = invoke("getTrackInfo");
export const parseDasha = invoke("parseDasha");
export const requestJson = invoke("requestJson");
export const hash = invoke("hash");
export const voidTrack = invoke("voidTrack");
export const startTrackDownload = invoke("startTrackDownload");
export const saveDialog = invoke("saveDialog");
export const openDialog = invoke("openDialog");
export const getDownloadProgress = invoke("getDownloadProgress");
export const updateRPC = invoke("updateRPC");
export const onRpcCleanup = invoke("onRpcCleanup");

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
