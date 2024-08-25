import { BrowserWindow, shell, ipcMain } from "electron";
import editorHtml from "./editor.txt";
import path from "path";

const base64 = Buffer.from(editorHtml).toString("base64");

ipcMain.removeHandler("THEMER_OPEN_EDITOR");
ipcMain.removeHandler("THEMER_CLOSE_EDITOR");
ipcMain.removeHandler("THEMER_SET_CSS");
ipcMain.handle("THEMER_OPEN_EDITOR", openEditor);
ipcMain.handle("THEMER_CLOSE_EDITOR", closeEditor);
ipcMain.handle("THEMER_SET_CSS", setCSS);

let win: BrowserWindow | null = null;
function openEditor(event: any, css: string) {
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

	ipcMain.removeHandler("THEMER_GET_CSS");
	ipcMain.handle("THEMER_GET_CSS", () => css);

	win.loadURL(`data:text/html;base64,${base64}`);
}

function setCSS(event: any, css: string) {
	BrowserWindow.getAllWindows().forEach((win) => {
		win.webContents.send("THEMER_SET_CSS", css);
	});
}

function closeEditor() {
	if (win && !win.isDestroyed()) win.close();
}
