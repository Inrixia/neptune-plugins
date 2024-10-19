import { intercept } from "@neptune";
import { settings } from "./Settings";

let enterNormalFullscreen: true | undefined = undefined;
const unloadInterceptAllowed = intercept("view/FULLSCREEN_ALLOWED", () => {
	if (enterNormalFullscreen || settings.useTidalFullscreen) {
		return (enterNormalFullscreen = undefined);
	}
	return true;
});
const unloadInterceptRequest = intercept("view/REQUEST_FULLSCREEN", () => {
	enterNormalFullscreen = true;
});
const onKeyDown = (event: KeyboardEvent) => {
	if (event.key === "F11") {
		event.preventDefault();

		const bar = document.querySelector<HTMLElement>("div[class^='bar--']");
		const contentContainer = document.querySelector<HTMLElement>("div[class^='mainContainer--'] > div[class^='containerRow--']");
		const wimp = document.querySelector<HTMLElement>("#wimp > div");

		if (document.fullscreenElement || wimp?.classList.contains("is-fullscreen")) {
			// Exiting fullscreen
			document.exitFullscreen();
			if (wimp) wimp.classList.remove("is-fullscreen");
			if (bar) bar.style.display = "";
			if (contentContainer) contentContainer.style.maxHeight = "";
		} else {
			// Entering fullscreen
			if (settings.useTidalFullscreen) {
				if (wimp) wimp.classList.add("is-fullscreen");
			} else {
				document.documentElement.requestFullscreen();
				if (bar) bar.style.display = "none";
				if (contentContainer) contentContainer.style.maxHeight = `100%`;
			}
		}
	}
};
window.addEventListener("keydown", onKeyDown);
export const onUnload = () => {
	unloadInterceptAllowed();
	unloadInterceptRequest();
	window.removeEventListener("keydown", onKeyDown);
};
export { Settings } from "./Settings";
