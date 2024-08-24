import Vibrant from "node-vibrant";

export const getPalette = (imgPath: string) => new Vibrant(imgPath, { quality: 1 }).getPalette();
