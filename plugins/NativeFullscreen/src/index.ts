import { intercept } from "@neptune";

let enterNormalFullscreen: true | undefined = undefined;
const unloadInterceptAllowed = intercept("view/FULLSCREEN_ALLOWED", () => (enterNormalFullscreen = enterNormalFullscreen ? undefined : true));
const unloadInterceptRequest = intercept("view/REQUEST_FULLSCREEN", () => {
	enterNormalFullscreen = true;
});
const onKeyDown = (event: KeyboardEvent) => {
	if (event.key === "F11") {
		event.preventDefault();
		document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();

		const bar = document.querySelector<HTMLElement>("div[class^='bar--']");
		const contentContainer = document.querySelector<HTMLElement>("div[class^='mainContainer--'] > div[class^='containerRow--']");

		if (bar !== null && contentContainer !== null) {
			if (document.fullscreenElement) {
				// Exiting fullscreen
				contentContainer.style.maxHeight = "";
				bar.style.display = "";
			} else {
				// Entering fullscreen
				contentContainer.style.maxHeight = `100%`;
				bar.style.display = "none";
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
