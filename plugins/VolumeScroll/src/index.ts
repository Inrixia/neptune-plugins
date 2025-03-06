import { actions, intercept, store } from "@neptune";
import { settings } from "./Settings";
export { Settings } from "./Settings";

function onScroll(event: WheelEvent) {
	if (!event.deltaY) return;
	const { playbackControls } = store.getState();
	const changeBy = event.shiftKey ? settings.changeByShift : settings.changeBy;
	const volumeChange = event.deltaY > 0 ? -changeBy : changeBy;
	const newVolume = playbackControls.volume + volumeChange;
	const clampVolume = Math.min(100, Math.max(0, newVolume));
	actions.playbackControls.setVolume({
		volume: clampVolume,
	});
}

let element: HTMLDivElement | null = null;

function initElement() {
	if (element) return;
	const elements = document.querySelectorAll('div[class^="_sliderContainer"]');
	if (elements.length === 0) return;
	element = elements[0] as HTMLDivElement;
	element.addEventListener("wheel", onScroll);
}

// Element doesn't exist until the page is loaded
const unloadIntercept = intercept("page/IS_DONE_LOADING", initElement);

// Initialize element if it already exists (e.g. plugin is installed or reloaded)
initElement();

export const onUnload = () => {
	unloadIntercept();
	element?.removeEventListener("wheel", onScroll);
};
