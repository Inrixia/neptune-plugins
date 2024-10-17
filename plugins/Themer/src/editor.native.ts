import { BrowserWindow, shell, ipcMain } from "electron";
import editor from "file://editor.html?base64&minify";
import path from "path";

let win: BrowserWindow | null = null;
export const openEditor = async (css: string) => {
	if (win && !win.isDestroyed()) return win.focus();

	win = new BrowserWindow({
		title: "TIDAL CSS Editor",
		width: 1000,
		height: 1000,
		webPreferences: {
			preload: path.join(process.resourcesPath, "app", "preload.js"),
		},
		autoHideMenuBar: true,
		backgroundColor: "#1e1e1e",
	});

	// Open links in default browser
	win.webContents.setWindowOpenHandler(({ url }) => {
		shell.openExternal(url);
		return { action: "deny" };
	});

	win.loadURL(`data:text/html;base64,${editor}`);
};

export const setCSS = async (css: string) => {
	BrowserWindow.getAllWindows().forEach((win) => {
		win.webContents.send("THEMER_SET_CSS", css);
	});
};

export const closeEditor = async () => win && !win.isDestroyed() && win.close();
