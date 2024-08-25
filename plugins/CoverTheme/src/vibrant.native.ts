import { ipcMain } from "electron";
import Vibrant from "node-vibrant";
import type { Palette } from ".";

const getCoverUrl = (id: string) =>
	"https://resources.tidal.com/images/" +
	id.split("-").join("/") +
	"/640x640.jpg";

async function getPalette(event: any, coverId: string) {
	const url = getCoverUrl(coverId);
	const vibrant = new Vibrant(url, { quality: 1 });
	const palette = await vibrant.getPalette();
	const colors: Palette = {};
	for (const [colorName, color] of Object.entries(palette)) {
		if (!color) continue;
		colors[colorName] = color.rgb.join(", ");
	}
	return colors;
}

ipcMain.removeHandler("VIBRANT_GET_PALETTE");
ipcMain.handle("VIBRANT_GET_PALETTE", getPalette);
