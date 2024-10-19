export { Settings } from "./Settings";
import "./editor.native";
import { getStorage } from "@inrixia/lib/storage";
import { setStyle } from "@inrixia/lib/css/setStyle";
import { closeEditor, openEditor as openEditorNative } from "./editor.native";

const setCSS = (_: unknown, css: string) => {
	storage.css = css;
	style.css = css;
};

const storage = getStorage({ css: "" });
export const openEditor = () => openEditorNative(storage.css);
const style = setStyle(storage.css);

window.electron.ipcRenderer.on("THEMER_SET_CSS", setCSS);

const onKeyDown = (event: KeyboardEvent) => event.ctrlKey && event.key === "e" && openEditor();
document.addEventListener("keydown", onKeyDown);

export const onUnload = () => {
	closeEditor();
	window.electron.ipcRenderer.removeAllListeners("THEMER_SET_CSS");
	document.removeEventListener("keydown", onKeyDown);
	style.remove();
};
