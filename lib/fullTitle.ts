import { TrackItem } from "neptune-types/tidal";

export const fullTitle = (track: TrackItem) => {
	const versionPostfix = track.version ? ` - ${track.version}` : "";
	return `${track.title}${versionPostfix}`;
};
