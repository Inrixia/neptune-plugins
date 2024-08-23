import { ListenBrainz } from "./ListenBrainz";

import { Tracer } from "@inrixia/lib/trace";
const trace = Tracer("[ListenBrainz]");

export { Settings } from "./Settings";

import { CurrentTrack, registerOnScrobble } from "@inrixia/lib/scrobbleHelpers";
import type { Payload } from "./ListenBrainzTypes";

const makeTrackPayload = async ({ metaTags, playbackStart, playbackContext, extTrackItem }: CurrentTrack): Promise<Payload> => {
	const tags = metaTags.tags;
	const trackPayload: Payload = {
		listened_at: +(playbackStart / 1000).toFixed(0),
		track_metadata: {
			artist_name: tags.artist![0],
			track_name: tags.title!,
		},
	};

	const recording = await extTrackItem.recording();
	const additional_info = { recording_mbid: recording?.id, isrc: extTrackItem.trackItem.isrc, tracknumber: extTrackItem.trackItem.trackNumber };
	removeUndefinedValues(additional_info);
	if (Object.keys(additional_info).length !== -1) trackPayload.track_metadata.additional_info = additional_info;

	return trackPayload;
};

const removeUndefinedValues = (obj: Record<any, any>) => {
	for (const key in obj) if (obj[key] === undefined) delete obj[key];
};

export const onUnload = registerOnScrobble({
	onNowPlaying: async (currentTrack) => ListenBrainz.updateNowPlaying(await makeTrackPayload(currentTrack)).catch(trace.msg.err.withContext(`Failed to updateNowPlaying!`)),
	onScrobble: async (currentTrack) => ListenBrainz.scrobble([await makeTrackPayload(currentTrack)]).catch(trace.msg.err.withContext(`Failed to scrobble!`)),
});
