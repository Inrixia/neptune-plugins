export type Payload = {
	listened_at: number; // The timestamp of when the track was listened to
	track_metadata: {
		additional_info?: {
			/**
			 * A list of MusicBrainz Artist IDs. If multiple Artist IDs are included in the complete MusicBrainz artist credit, include them all here.
			 */
			artist_mbids?: string[];

			/**
			 * MusicBrainz Release Group ID of the release group this recording was played from.
			 */
			release_group_mbid?: string;

			/**
			 * MusicBrainz Release ID of the release this recording was played from.
			 */
			release_mbid?: string;

			/**
			 * MusicBrainz Recording ID of the recording that was played.
			 */
			recording_mbid?: string;

			/**
			 * MusicBrainz Track ID associated with the recording that was played.
			 */
			track_mbid?: string;

			/**
			 * A list of MusicBrainz Work IDs that may be associated with this recording.
			 */
			work_mbids?: string[];

			/**
			 * The track number of the recording. The first recording on a release is track number 1.
			 */
			tracknumber?: number;

			/**
			 * The ISRC code associated with the recording.
			 */
			isrc?: string;

			/**
			 * The Spotify track URL associated with this recording. Example: http://open.spotify.com/track/1rrgWMXGCGHru5bIRxGFV0
			 */
			spotify_id?: string;

			/**
			 * A list of user-defined tags to be associated with this recording, similar to last.fm tags. You may submit up to MAX_TAGS_PER_LISTEN tags, each up to MAX_TAG_SIZE characters large.
			 */
			tags?: string[];
		};
		artist_name: string; // The name of the artist
		track_name: string; // The name of the track
		release_name?: string; // The name of the release, if available
	};
};
