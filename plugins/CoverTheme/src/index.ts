import { intercept } from "@neptune";
import getPlaybackControl from "@inrixia/lib/getPlaybackControl";
import { MediaItemCache } from "@inrixia/lib/Caches/MediaItemCache";
import { setStyle } from "@inrixia/lib/css/setStyle";
import { getPalette } from "@inrixia/lib/nativeBridge";
import transparent from "file://transparent.css?minify";

import { Tracer } from "@inrixia/lib/trace";
const trace = Tracer("[CoverTheme]");

let prevSong: string | undefined;
let prevCover: string | undefined;
let vars = new Set<string>();

const getCoverUrl = (id: string) =>
	"https://resources.tidal.com/images/" +
	id.split("-").join("/") +
	"/640x640.jpg";

type ColorInfo = [colorName: string, rgb: string | null];
const paletteCache: Record<string, Promise<ColorInfo[]>> = {};
const getCachedPalette = (coverId: string) => {
	const palette = paletteCache[coverId];
	if (palette !== undefined) return palette;
	return (paletteCache[coverId] = getPalette(getCoverUrl(coverId)).then(
		(palette) => {
			const colors: ColorInfo[] = [];
			for (const colorName in palette) {
				// @ts-expect-error Native return types dont serialize class methods like .rgb(),
				// but thankfully the class pre-fills the value in a private _rgb property we can use.
				colors.push([colorName, palette[colorName]?._rgb?.join(", ")]);
			}
			return colors;
		}
	)).catch(trace.msg.err.withContext(`Failed to get cover palette!`));
};

async function updateBackground(productId: string) {
	if (prevSong === productId) return;
	prevSong = productId;

	const mediaItem = await MediaItemCache.ensure(productId);
	if (!mediaItem || !mediaItem.album?.cover) return;

	if (prevCover === mediaItem.album.cover) return;
	prevCover = mediaItem.album.cover;

	const palette = await getCachedPalette(mediaItem.album.cover);
	if (palette === undefined) return;

	for (const [colorName, rgb] of palette) {
		const variableName = `--cover-${colorName}`;
		vars.add(variableName);
		document.documentElement.style.setProperty(variableName, rgb ?? null);
	}
}

function onTransition([track]: any[]) {
	const id = (track.mediaProduct as { productId?: string })?.productId;
	if (id) updateBackground(id);
}

const unloadPrefill = intercept(
	"playbackControls/PREFILL_MEDIA_PRODUCT_TRANSITION",
	onTransition
);

const unloadTransition = intercept(
	"playbackControls/MEDIA_PRODUCT_TRANSITION",
	onTransition
);

const style = setStyle();
export function updateCSS() {
	const positions = {
		"top left": "DarkVibrant",
		"center left": "Vibrant",
		"bottom left": "LightMuted",
		"top right": "LightVibrant",
		"center right": "Muted",
		"bottom right": "DarkMuted",
	};
	const gradients = Object.entries(positions)
		.map(
			([position, variable]) =>
				`radial-gradient(ellipse at ${position}, rgb(var(--cover-${variable}), 0.5), transparent 70%)`
		)
		.join(", ");
	document.body.style.backgroundImage = gradients;
	style.css = transparent;
}

updateCSS();
const { playbackContext } = getPlaybackControl();
if (playbackContext) updateBackground(playbackContext.actualProductId);

export const onUnload = () => {
	unloadPrefill();
	unloadTransition();
	style.remove();
	vars.forEach((variable) =>
		document.documentElement.style.removeProperty(variable)
	);
	prevSong = undefined;
	prevCover = undefined;
};
