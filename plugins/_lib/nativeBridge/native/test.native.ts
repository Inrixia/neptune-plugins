import { ipcMain, IpcMainEvent } from "electron";
import { Tracer } from "../helpers/trace.native";
const trace = Tracer("[test.native]");

export const AppEventEnum: Promise<Record<string, string>> = Function(`return import("../original.asar/app/shared/AppEventEnum.js")`)().then((module: any) => module.default.default);
const ipcListeners: Record<string, (_: IpcMainEvent, ...args: any[]) => void> = {};
export const startNativeIpcLogging = async () => {
	for (const eventName of Object.values(await AppEventEnum)) {
		// I dont want this spam when testing
		if (eventName === "playback.current.time") continue;
		ipcListeners[eventName] = (_, ...args) => trace.log(eventName, ...args);
		ipcMain.on(eventName, ipcListeners[eventName]);
	}
};
export const stopNativeIpcLogging = async () => {
	for (const eventName in ipcListeners) {
		ipcMain.removeListener(eventName, ipcListeners[eventName]);
		delete ipcListeners[eventName];
	}
};
