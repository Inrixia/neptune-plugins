export interface UPCData {
	created?: Date;
	count?: number;
	offset?: number;
	releases?: Release[];
}

export interface Release {
	disambiguation?: string;
	id?: string;
	score?: number;
	"status-id"?: string;
	"packaging-id"?: string;
	count?: number;
	title?: string;
	status?: string;
	packaging?: string;
	"text-representation"?: TextRepresentation;
	"artist-credit"?: ArtistCredit[];
	"release-group"?: ReleaseGroup;
	date?: Date;
	country?: string;
	"release-events"?: any[];
	barcode?: string;
	asin?: string;
	"label-info"?: LabelInfo[];
	"track-count"?: number;
	media?: Media[];
	tags?: Tag[];
}

interface ArtistCredit {
	name?: string;
	artist?: Artist;
}

interface Artist {
	id?: string;
	name?: string;
	"sort-name"?: string;
	disambiguation?: string;
}

interface LabelInfo {
	label?: Label;
}

interface Label {
	id?: string;
	name?: string;
}

interface Media {
	format?: string;
	"disc-count"?: number;
	"track-count"?: number;
}

interface ReleaseGroup {
	id?: string;
	"type-id"?: string;
	"primary-type-id"?: string;
	title?: string;
	"primary-type"?: string;
}

interface Tag {
	count?: number;
	name?: string;
}

interface TextRepresentation {
	language?: string;
	script?: string;
}
