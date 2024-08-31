import electron from "electron";

let initialLimits: number[] | undefined;

function removeLimits() {
	const win = electron.BrowserWindow.getAllWindows()[0];
	if (!initialLimits) initialLimits = win.getMinimumSize();
	win.setMinimumSize(0, 0);
}

function restoreLimits() {
	const win = electron.BrowserWindow.getAllWindows()[0];
	if (initialLimits) win.setMinimumSize(initialLimits[0], initialLimits[1]);
}

electron.ipcMain.removeHandler("REMOVE_SIZE_LIMIT");
electron.ipcMain.removeHandler("RESTORE_SIZE_LIMIT");
electron.ipcMain.handle("REMOVE_SIZE_LIMIT", removeLimits);
electron.ipcMain.handle("RESTORE_SIZE_LIMIT", restoreLimits);