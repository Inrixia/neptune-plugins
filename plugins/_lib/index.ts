// Define on global for shared caching
declare global {
	interface Window {
		Estr: {
			Album: Album;
			Playlist: Playlist;
			MediaItem: MediaItem;
			PlayState: PlayState;
		};
	}
}

import Album from "./classes/Album";
import MediaItem from "./classes/MediaItem";
import Playlist from "./classes/Playlist";
import PlayState from "./classes/PlayState";

export { Album, MediaItem, Playlist, PlayState };

export * from "./classes/Quality";
export * from "./components";
export * from "./helpers";
export * from "./intercept";
export * from "./storage";
