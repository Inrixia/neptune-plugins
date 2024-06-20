export interface Scrobble {
	scrobbles?: Scrobbles;
}

export interface Scrobbles {
	scrobble?: ScrobbleClass;
	"@attr"?: Attr;
}

export interface Attr {
	ignored?: number;
	accepted?: number;
}

export interface ScrobbleClass {
	artist?: Album;
	album?: Album;
	track?: Album;
	ignoredMessage?: IgnoredMessage;
	albumArtist?: Album;
	timestamp?: string;
}

export interface Album {
	corrected?: string;
	"#text"?: string;
}

export interface IgnoredMessage {
	code?: string;
	"#text"?: string;
}
