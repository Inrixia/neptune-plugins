export { Settings } from "./Settings";
import "./editor.native";
import { getStorage } from "@inrixia/lib/storage";
import { getStyle, setStyle } from "@inrixia/lib/css/setStyle";

const storage = getStorage({
	css: "",
});

function setCSS(event: any, css: string) {
	storage.css = css;
	setStyle(css, "Themer");
}

function onKeyDown(event: KeyboardEvent) {
	if (event.ctrlKey && event.key === "e") openEditor();
}

export function openEditor() {
	window.electron.ipcRenderer.invoke("THEMER_OPEN_EDITOR", storage.css);
}

window.electron.ipcRenderer.on("THEMER_SET_CSS", setCSS);
document.addEventListener("keydown", onKeyDown);
setStyle(storage.css, "Themer");

export const onUnload = () => {
	window.electron.ipcRenderer.invoke("THEMER_CLOSE_EDITOR");
	window.electron.ipcRenderer.off("THEMER_SET_CSS", setCSS);
	document.removeEventListener("keydown", onKeyDown);
	getStyle("Themer")?.remove();
};
