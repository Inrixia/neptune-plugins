import { ListenBrainz } from "./ListenBrainz";

import { Tracer } from "@inrixia/lib/trace";
const trace = Tracer("[ListenBrainz]");

export { Settings } from "./Settings";

import { CurrentTrack, registerOnScrobble } from "@inrixia/lib/scrobbleHelpers";
import { MusicServiceDomain, type Payload } from "./ListenBrainzTypes";

const makeTrackPayload = async ({ metaTags, playbackStart, playbackContext, extTrackItem }: CurrentTrack): Promise<Payload> => {
	const tags = metaTags.tags;
	const trackPayload: Payload = {
		listened_at: +(playbackStart / 1000).toFixed(0),
		track_metadata: {
			artist_name: tags.artist![0],
			track_name: tags.title!,
			release_name: tags.album,
		},
	};

	const releaseTrack = await extTrackItem.releaseTrack();
	const additional_info = {
		recording_mbid: releaseTrack?.id,
		isrc: extTrackItem.tidalTrack.isrc ?? releaseTrack?.recording.isrcs?.[0],
		tracknumber: extTrackItem.tidalTrack.trackNumber,
		music_service: MusicServiceDomain.TIDAL,
		origin_url: extTrackItem.tidalTrack.url,
		duration: extTrackItem.tidalTrack.duration,
		media_player: "Tidal Desktop",
		submission_client: "Neptune Scrobbler",
	};
	removeUndefinedValues(additional_info);
	trackPayload.track_metadata.additional_info = additional_info;

	trace.debug("makeTrackPayload", trackPayload);
	return trackPayload;
};

const removeUndefinedValues = (obj: Record<any, any>) => {
	for (const key in obj) if (obj[key] === undefined) delete obj[key];
};

export const onUnload = registerOnScrobble({
	onNowPlaying: async (currentTrack) => ListenBrainz.updateNowPlaying(await makeTrackPayload(currentTrack)).catch(trace.msg.err.withContext(`Failed to updateNowPlaying!`)),
	onScrobble: async (currentTrack) => ListenBrainz.scrobble([await makeTrackPayload(currentTrack)]).catch(trace.msg.err.withContext(`Failed to scrobble!`)),
});
