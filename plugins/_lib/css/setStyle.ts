export const setStyle = (css?: string, id?: string) => {
	let styleTag: HTMLElement | null = null;
	if (id) styleTag = document.getElementById(id); // Use the existing style tag if it exists

	if (!styleTag) {
		styleTag = document.createElement("style");
		if (id) styleTag.id = id;
		document.head.appendChild(styleTag);
	}

	if (css) styleTag.innerHTML = css;
	return {
		set css(css: string) {
			styleTag.innerHTML = css;
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
