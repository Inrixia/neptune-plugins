export interface Datum {
	resource?: Resource;
	id?: string;
	status?: number;
	message?: string;
}

export interface Resource {
	artifactType?: string;
	id?: string;
	title?: string;
	artists?: Artist[];
	album?: Album;
	duration?: number;
	trackNumber?: number;
	volumeNumber?: number;
	isrc?: string;
	copyright?: string;
	mediaMetadata?: MediaMetadata;
	properties?: Record<string, unknown>;
	tidalUrl?: string;
}

interface Album {
	id?: string;
	title?: string;
	imageCover?: ImageCover[];
	videoCover?: any[];
}

interface ImageCover {
	url?: string;
	width?: number;
	height?: number;
}

interface Artist {
	id?: string;
	name?: string;
	picture?: ImageCover[];
	main?: boolean;
}

interface MediaMetadata {
	tags?: string[];
}

export interface Metadata {
	requested?: number;
	success?: number;
	failure?: number;
}

export type ISRCResponse = {
	data: Datum[];
	metadata: {
		requested: number;
		success: number;
		failure: number;
	};
};
