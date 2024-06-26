// @ts-nocheck
export const broadcast = (channel: string, ...args: any[]) => {
	for (const window of electron.BrowserWindow.getAllWindows()) {
		window.webContents.send(channel, ...args);
	}
};
