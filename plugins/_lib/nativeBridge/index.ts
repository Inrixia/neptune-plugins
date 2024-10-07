import "./nativeBridge.native";

export type * from "./native";

import { libTrace } from "../trace";
import type { NativeBridge } from "./nativeBridge.native";

const _invoke = window.electron.ipcRenderer.invoke;
export const invoke = <K extends keyof NativeBridge>(method: K) => <NativeBridge[K]>((...args: any) =>
		_invoke("___nativeBridge___", method, ...args).catch((err: Error) => {
			err.message = err.message.replaceAll("Error invoking remote method '___nativeBridge___': ", "");
			throw err;
		}));

invoke("setDefaultUserAgent")(navigator.userAgent).catch(libTrace.err.withContext("Failed to set default user agent"));

export const getTrackInfo = invoke("getTrackInfo");
export const parseDasha = invoke("parseDasha");
export const hash = invoke("hash");
export const voidTrack = invoke("voidTrack");
export const saveDialog = invoke("saveDialog");
export const openDialog = invoke("openDialog");
export const cacheEnsure = invoke("cacheEnsure");
export const cacheRej = invoke("cacheRej");
export const cacheRes = invoke("cacheRes");
