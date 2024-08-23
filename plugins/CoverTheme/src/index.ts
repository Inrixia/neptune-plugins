import { intercept } from "@neptune";
import getPlaybackControl from "@inrixia/lib/getPlaybackControl";
import { MediaItemCache } from "@inrixia/lib/Caches/MediaItemCache";
import Vibrant from "node-vibrant";
import { getStyle, setStyle } from "@inrixia/lib/css/setStyle";
import { settings } from "./Settings";
export { Settings } from "./Settings";

let prevSong: string | undefined;
let prevCover: string | undefined;
let vars: string[] = [];

const getCoverUrl = (id: string) => "https://resources.tidal.com/images/" + id.split("-").join("/") + "/640x640.jpg?cors";

async function updateBackground(productId: string) {
	if (prevSong === productId) return;
	prevSong = productId;

	const mediaItem = await MediaItemCache.ensure(productId);
	if (!mediaItem || !mediaItem.album?.cover) return;

	if (prevCover === mediaItem.album.cover) return;
	prevCover = mediaItem.album.cover;

	const cover = getCoverUrl(mediaItem.album.cover);
	const palette = await Vibrant.from(cover).getPalette();

	for (const [colorName, color] of Object.entries(palette)) {
		const variableName = `--cover-${colorName}`;
		if (!color) {
			document.documentElement.style.setProperty(variableName, null);
			continue;
		}

		if (!vars.includes(variableName)) vars.push(variableName);

		document.documentElement.style.setProperty(variableName, color.rgb.join(", "));
	}
}

function onTransition([track]: any[]) {
	const id = (track.mediaProduct as { productId?: string })?.productId;
	if (id) updateBackground(id);
}

const unloadPrefill = intercept("playbackControls/PREFILL_MEDIA_PRODUCT_TRANSITION", onTransition);

const unloadTransition = intercept("playbackControls/MEDIA_PRODUCT_TRANSITION", onTransition);

export function updateCSS() {
	if (settings.transparentTheme) {
		const styles = `
		#wimp, main, [class^="sidebarWrapper"], [class^="mainContainer"], [class^="tabListWrapper"] {
			background: unset !important;
		}
					
		#footerPlayer, nav, [class^="bar"] {
			background-color: color-mix(in srgb, var(--wave-color-solid-base-brighter), transparent 70%) !important;
		}
				
		#nowPlaying > [class^="innerContainer"] {
			height: calc(100vh - 126px);
			overflow: hidden;
		}
			
		.tidal-ui__z-stack > :not(:has(div)) {
			background-image: linear-gradient(90deg, rgb(var(--cover-DarkVibrant), 0.5), rgb(var(--cover-LightVibrant), 0.5)) !important;
		}`;

		setStyle(styles, "transparentTheme");
	} else {
		getStyle("transparentTheme")?.remove();
	}

	if (settings.backgroundGradient) {
		const positions = {
			"top left": "DarkVibrant",
			"center left": "Vibrant",
			"bottom left": "LightMuted",
			"top right": "LightVibrant",
			"center right": "Muted",
			"bottom right": "DarkMuted",
		};

		const gradients = Object.entries(positions)
			.map(([position, variable]) => `radial-gradient(ellipse at ${position}, rgb(var(--cover-${variable}), 0.5), transparent 70%)`)
			.join(", ");

		setStyle(`body{background-image:${gradients};}`, "backgroundGradient");
	} else {
		getStyle("backgroundGradient")?.remove();
	}
}

updateCSS();
const { playbackContext } = getPlaybackControl();
if (playbackContext) updateBackground(playbackContext.actualProductId);

export const onUnload = () => {
	unloadPrefill();
	unloadTransition();
	getStyle("coverTheme")?.remove();
	vars.forEach((variable) => document.documentElement.style.removeProperty(variable));
	prevSong = undefined;
	prevCover = undefined;
};
