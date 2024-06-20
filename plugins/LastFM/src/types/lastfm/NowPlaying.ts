export interface NowPlaying {
	nowplaying?: Nowplaying;
}

export interface Nowplaying {
	artist?: Album;
	track?: Album;
	ignoredMessage?: IgnoredMessage;
	albumArtist?: Album;
	album?: Album;
}

export interface Album {
	corrected?: string;
	"#text"?: string;
}

export interface IgnoredMessage {
	code?: string;
	"#text"?: string;
}
