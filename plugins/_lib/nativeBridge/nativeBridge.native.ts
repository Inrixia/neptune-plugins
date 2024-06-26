// @ts-nocheck
import * as nativeBridge from "./native";
electron.ipcMain.removeHandler("___nativeBridge___");
electron.ipcMain.handle("___nativeBridge___", (_, method: string, ...args) => {
	if (nativeBridge[method] === undefined) throw new Error(`Method "${method}" not found! Available methods: ${Object.keys(nativeBridge).join(", ")}.`);
	return nativeBridge[method](...args);
});
