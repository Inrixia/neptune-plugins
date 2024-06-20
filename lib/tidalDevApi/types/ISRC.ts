import type { TrackItem } from "neptune-types/tidal";

export type TrackData = {
	resource: TrackItem;
	id: string;
	status: number;
	message: string;
};

export type ISRCResponse = {
	data: TrackData[];
	metadata: {
		requested: number;
		success: number;
		failure: number;
	};
};
