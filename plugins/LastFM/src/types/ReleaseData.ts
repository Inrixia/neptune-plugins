import { Recording } from "./Recording";

export interface ReleaseData {
	disambiguation?: string;
	"packaging-id"?: string;
	status?: string;
	"text-representation"?: TextRepresentation;
	media?: Media[];
	"status-id"?: string;
	quality?: string;
	barcode?: string;
	"release-events"?: ReleaseEvent[];
	id?: string;
	"cover-art-archive"?: CoverArtArchive;
	asin?: string;
	country?: string;
	date?: Date;
	packaging?: string;
	title?: string;
}

export interface CoverArtArchive {
	count?: number;
	darkened?: boolean;
	artwork?: boolean;
	front?: boolean;
	back?: boolean;
}

export interface Media {
	"format-id"?: string;
	title?: string;
	format?: string;
	tracks?: Track[];
	position?: number;
	"track-offset"?: number;
	"track-count"?: number;
}

export interface Track {
	position?: number;
	length?: number;
	number?: string;
	recording?: Recording;
	title?: string;
	id?: string;
}

export interface ReleaseEvent {
	date?: Date;
	area?: Area;
}

export interface Area {
	"sort-name"?: string;
	"iso-3166-1-codes"?: string[];
	name?: string;
	type?: null;
	id?: string;
	"type-id"?: null;
	disambiguation?: string;
}

export interface TextRepresentation {
	script?: string;
	language?: string;
}
