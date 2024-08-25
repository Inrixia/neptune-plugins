export const setStyle = (css?: string, id?: string) => {
	let styleTag: HTMLElement | null = null;

	function remove() {
		styleTag?.remove();
		styleTag = null;
	}

	function setCSS(css?: string) {
		if (id) styleTag = document.getElementById(id);
		if (!css || !css.trim()) {
			remove();
		} else {
			if (!styleTag) {
				styleTag = document.createElement("style");
				if (id) styleTag.id = id;
				document.head.appendChild(styleTag);
			}

			styleTag.innerHTML = css;
		}
	}

	setCSS(css);

	return {
		set css(css: string) {
			setCSS(css);
		},
		get css() {
			return styleTag?.innerHTML ?? "";
		},
		remove,
	};
};

export const getStyle = (styleId: string) => document.getElementById(styleId);
