import { intercept } from "@neptune";
import getPlaybackControl from "@inrixia/lib/getPlaybackControl";
import { TrackItemCache } from "@inrixia/lib/Caches/TrackItemCache";
import Vibrant from "node-vibrant";
import { getStyle, setStyle } from "@inrixia/lib/css/setStyle";
import { Palette, Vec3 } from "node-vibrant/lib/color";

// These variables are used to prevent unnecessary updates
let prevSong: string | undefined;
let prevCover: string | undefined;

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

	const colors: { [K in keyof Palette]: string } = {};
	Object.entries(palette).forEach(([colorName, color]) => {
		if (!color) return;
		const rgb = color.rgb.join(", ");
		colors[colorName] = `rgb(${rgb}, 0.5)`;
	});

	const gradients = {
		"top left": colors.LightMuted,
		"center left": colors.Vibrant,
		"bottom left": colors.DarkVibrant,
		"top right": colors.LightVibrant,
		"center right": colors.Muted,
		"bottom right": colors.DarkMuted,
	};

	const style = Object.entries(gradients)
		.map(
			([position, color]) =>
				`radial-gradient(ellipse at ${position}, ${color}, transparent 70%)`
		)
		.join(", ");

	document.body.style.backgroundImage = style;
}

const unloadIntercept = intercept("playbackControls/TIME_UPDATE", ([time]) => {
	if (time === 0) updateBackground();
});

updateBackground();
setStyle(
	`#wimp, main, .sidebarWrapper, [class^="mainContainer"] {
		background: unset !important;
	}
		
	#footerPlayer, nav, [class^="bar"] {
		background-color: color-mix(in srgb, var(--wave-color-solid-base-brighter), transparent 70%) !important;
	}
	
	#nowPlaying > [class^="innerContainer"] {
		height: calc(100vh - 126px);
		overflow: hidden;
	}`,
	"coverTheme"
);

export const onUnload = () => {
	unloadIntercept();
	document.body.style.backgroundImage = "";
	getStyle("coverTheme")?.remove();
	prevSong = undefined;
	prevCover = undefined;
};
