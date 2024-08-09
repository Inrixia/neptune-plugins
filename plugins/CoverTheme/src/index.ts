import { intercept } from "@neptune";
import getPlaybackControl from "@inrixia/lib/getPlaybackControl";
import { TrackItemCache } from "@inrixia/lib/Caches/TrackItemCache";
import Vibrant from "node-vibrant";
import { getStyle, setStyle } from "@inrixia/lib/css/setStyle";
import { settings } from "./Settings";
export { Settings } from "./Settings";

let prevSong: string | undefined;
let prevCover: string | undefined;
let vars: string[] = [];

const getCoverUrl = (id: string) =>
	"https://resources.tidal.com/images/" +
	id.split("-").join("/") +
	"/640x640.jpg?cors";

async function updateBackground() {
	const { playbackContext } = getPlaybackControl();

	if (prevSong === playbackContext?.actualProductId) return;
	prevSong = playbackContext?.actualProductId;

	const track = await TrackItemCache.ensure(playbackContext?.actualProductId);
	if (!track || !track.album?.cover) return;

	if (prevCover === track.album.cover) return;
	prevCover = track.album.cover;

	const cover = getCoverUrl(track.album.cover);
	const palette = await Vibrant.from(cover).getPalette();

	for (const [colorName, color] of Object.entries(palette)) {
		const variableName = `--cover-${colorName}`;
		if (!color) {
			document.documentElement.style.setProperty(variableName, null);
			continue;
		}

		if (!vars.includes(variableName)) vars.push(variableName);

		document.documentElement.style.setProperty(
			variableName,
			color.rgb.join(", ")
		);
	}
}

const unloadIntercept = intercept("playbackControls/TIME_UPDATE", ([time]) => {
	if (time === 0) updateBackground();
});

const positions = {
	"top left": "LightMuted",
	"center left": "Vibrant",
	"bottom left": "DarkVibrant",
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

const styles = `
#wimp, main, .sidebarWrapper, [class^="mainContainer"] {
	background: unset !important;
}
			
#footerPlayer, nav, [class^="bar"] {
	background-color: color-mix(in srgb, var(--wave-color-solid-base-brighter), transparent 70%) !important;
}
		
#nowPlaying > [class^="innerContainer"] {
	height: calc(100vh - 126px);
	overflow: hidden;
}
	
body {
	background-image: ${gradients};
}`;

export function updateCSS() {
	if (settings.injectCSS) {
		setStyle(styles, "coverTheme");
	} else {
		getStyle("coverTheme")?.remove();
	}
}

updateCSS();
updateBackground();

export const onUnload = () => {
	unloadIntercept();
	getStyle("coverTheme")?.remove();
	vars.forEach((variable) =>
		document.documentElement.style.removeProperty(variable)
	);
	prevSong = undefined;
	prevCover = undefined;
};
