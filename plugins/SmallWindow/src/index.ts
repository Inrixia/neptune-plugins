import "./size.native";

window.electron.ipcRenderer.invoke("REMOVE_SIZE_LIMIT");

export const onUnload = () => {
	window.electron.ipcRenderer.invoke("RESTORE_SIZE_LIMIT");
};
