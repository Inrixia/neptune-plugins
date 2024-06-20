export const setStyle = (cssString: string, styleId: string) => {
	// Check if the style tag already exists
	let styleTag = document.getElementById(styleId);
	// If the style tag doesn't exist, create it
	if (!styleTag) {
		styleTag = document.createElement("style");
		styleTag.id = styleId;
		document.head.appendChild(styleTag);
	}
	// Update the content of the style tag
	styleTag.innerHTML = cssString;
};
export const getStyle = (styleId: string) => document.getElementById(styleId);
