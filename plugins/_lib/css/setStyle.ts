export const setStyle = (css?: string, id?: string) => {
	let styleTag: HTMLElement | null = null;
	if (id) styleTag = document.getElementById(id); // Use the existing style tag if it exists

	if (!styleTag) {
		styleTag = document.createElement("style");
		if (id) styleTag.id = id;
		document.head.appendChild(styleTag);
	}

	if (css) styleTag.innerHTML = escape(css);
	return {
		set css(css: string) {
			styleTag.innerHTML = escape(css);
		},
		get css() {
			return styleTag.innerHTML;
		},
		remove() {
			styleTag.remove();
		},
	};
};

export const getStyle = (styleId: string) => document.getElementById(styleId);

function escape(css: string) {
	return css.replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
