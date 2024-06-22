import safeUnload from "@inrixia/lib/safeUnload";
import { getStyle } from "../../_lib/css/setStyle";
import { draggableId, draggableStyleId, getDraggable } from "./getDraggable";

const draggable = getDraggable();
// Make the container draggable
let isDragging = false;
let offsetX: number, offsetY: number;

const onMouseDown = (e: MouseEvent) => {
	isDragging = true;
	offsetX = e.clientX - draggable.getBoundingClientRect().left;
	offsetY = e.clientY - draggable.getBoundingClientRect().top;
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
