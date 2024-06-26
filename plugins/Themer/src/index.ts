import safeUnload from "@inrixia/lib/safeUnload";
import { getStyle } from "@inrixia/lib/css/setStyle";
import { draggableStyleId, getDraggable } from "./getDraggable";

export { Settings } from "./Settings";

export const draggable = getDraggable();
// Make the container draggable
let isDragging = false;
let offsetX: number, offsetY: number;

const onMouseDown = (e: MouseEvent) => {
	const top = draggable.getBoundingClientRect().top;
	const left = draggable.getBoundingClientRect().left;
	offsetX = e.clientX - left;
	offsetY = e.clientY - top;
	if (offsetX < 20 || (offsetX > top - 20 && offsetX < top - 2) || offsetY < 20 || (offsetY > top - 20 && offsetY < top - 2)) {
		isDragging = true;
	}
};
const onMouseMove = (e: MouseEvent) => {
	if (!isDragging) return;
	draggable.style.left = `${e.clientX - offsetX}px`;
	draggable.style.top = `${e.clientY - offsetY}px`;
};
const onMouseUp = () => {
	isDragging = false;
};

draggable.addEventListener("mousedown", onMouseDown);
document.addEventListener("mousemove", onMouseMove);
document.addEventListener("mouseup", onMouseUp);
export const onUnload = () => {
	draggable.removeEventListener("mousedown", onMouseDown);
	document.removeEventListener("mousemove", onMouseMove);
	document.removeEventListener("mouseup", onMouseUp);
	draggable.remove();
	getStyle(draggableStyleId)?.remove();
	safeUnload();
};
