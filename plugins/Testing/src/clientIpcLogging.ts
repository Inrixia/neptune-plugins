import type { IpcRenderer, IpcRendererEvent } from "electron";

import { getClientMessageChannelEnum } from "@inrixia/lib/nativeBridge/test";
import { trace } from ".";

const ClientMessageChannelEnum = getClientMessageChannelEnum();

const ipcRenderer: IpcRenderer = (<any>window).electron.ipcRenderer;
const ipcListeners: Record<string, (_: IpcRendererEvent, ...args: any[]) => void> = {};
export const startClientIpcLogging = async () => {
	for (const eventName of Object.values(await ClientMessageChannelEnum)) {
		if (eventName === "client.playback.playersignal") continue; // This event is too spammy
		ipcListeners[eventName] = (_, ...args) => trace.log(eventName, ...args);
		ipcRenderer.on(eventName, ipcListeners[eventName]);
	}
};
export const stopClientIpcLogging = async () => {
	for (const eventName in ipcListeners) {
		ipcRenderer.removeListener(eventName, ipcListeners[eventName]);
		delete ipcListeners[eventName];
	}
};
