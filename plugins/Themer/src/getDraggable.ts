import { getStyle, setStyle } from "../../../lib/css/setStyle";

// @ts-expect-error Remove this when types are available
import { storage } from "@plugin";

export const draggableId = "__Themer__Draggable";
export const draggableStyleId = `${draggableId}__Style`;
export const getDraggable = () => {
	let draggable = document.getElementById(draggableId);
	if (!draggable) {
		draggable = document.createElement("div");
		draggable.id = draggableId;
		draggable.style.width = "300px";
		draggable.style.height = "200px";
		draggable.style.position = "absolute";
		draggable.style.top = "100px";
		draggable.style.left = "100px";
		draggable.style.border = "1px solid #ccc";
		draggable.style.backgroundColor = "#f9f9f9";
		draggable.style.resize = "both";
		draggable.style.overflow = "auto";
		draggable.style.padding = "10px";
		draggable.style.cursor = "move";
		draggable.style.zIndex = "1000";

		// Create and style the textarea
		let textarea = document.createElement("textarea");
		textarea.style.width = "100%";
		textarea.style.height = "100%";
		textarea.style.boxSizing = "border-box";
		textarea.rows = 10;
		textarea.cols = 50;
		textarea.placeholder = "Enter css styles here...";
		textarea.value = storage.css;
		textarea.addEventListener("keyup", (e) => setStyle((storage.css = (<HTMLTextAreaElement>e.target).value), draggableStyleId));

		draggable.appendChild(textarea);
		document.body.appendChild(draggable);
	}
	return draggable;
};
