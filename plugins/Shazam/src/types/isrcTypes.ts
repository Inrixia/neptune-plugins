type ImageResource = {
	url: string;
	width: number;
	height: number;
};

type SimpleArtist = {
	id: string;
	name: string;
	picture: ImageResource[];
	main: boolean;
};

type SimpleAlbum = {
	id: string;
	title: string;
	imageCover: ImageResource[];
	videoCover: ImageResource[];
};

type ProviderInfo = {
	providerId?: string;
	providerName?: string;
};

type MediaMeta = {
	tags: string[];
};

type Track = {
	id: string;
	version: string;
	duration: number;
	album: SimpleAlbum;
	title: string;
	copyright: string;
	artists: SimpleArtist[];
	popularity?: number;
	isrc: string;
	trackNumber: number;
	volumeNumber: number;
	tidalUrl: string;
	providerInfo?: ProviderInfo;
	artifactType: string;
	mediaMetadata: MediaMeta;
};

type TrackProperties = {
	content: string[];
};

type MultiStatusResponseDataTrack = {
	resource: Track;
	properties: TrackProperties;
	id: string;
	status: number;
	message: string;
};

type MultiStatusResponseMetadata = {
	requested: number;
	success: number;
	failure: number;
};

export type ISRCResponse = {
	data: MultiStatusResponseDataTrack[];
	metadata: MultiStatusResponseMetadata;
};
