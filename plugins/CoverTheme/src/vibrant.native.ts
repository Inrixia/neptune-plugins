import { Vibrant } from "node-vibrant/node";
import type { Palette } from ".";

const getCoverUrl = (id: string) => "https://resources.tidal.com/images/" + id.split("-").join("/") + "/640x640.jpg";
export const getPalette = async (coverId: string) => {
	const url = getCoverUrl(coverId);
	const vibrant = new Vibrant(url, { quality: 1 });
	const palette = await vibrant.getPalette();
	const colors: Palette = {};
	for (const [colorName, color] of Object.entries(palette)) {
		if (!color) continue;
		colors[colorName] = color.rgb.join(", ");
	}
	return colors;
};
