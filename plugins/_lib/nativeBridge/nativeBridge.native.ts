import * as nativeBridge from "./native";
// @ts-ignore
electron.ipcMain.removeAllListeners("___nativeBridge___");
// @ts-ignore
electron.ipcMain.handle("___nativeBridge___", (_, method: string, ...args) => nativeBridge[method](...args));
