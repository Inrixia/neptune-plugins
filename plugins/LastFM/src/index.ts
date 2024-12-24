import { actions } from "@neptune";
import { LastFM, ScrobbleOpts } from "./LastFM";

import { Tracer } from "@inrixia/lib/trace";
const trace = Tracer("[last.fm]");

import { CurrentTrack, registerOnScrobble } from "@inrixia/lib/scrobbleHelpers";
actions.lastFm.disconnect();

const makeScrobbleOpts = ({ metaTags, playbackStart, playbackContext }: CurrentTrack): ScrobbleOpts => {
	const tags = metaTags.tags;
	const scrobbleOpts = {
		track: tags.title!,
		artist: tags.artist?.[0]!,
		album: tags.album,
		albumArtist: tags.albumArtist?.[0],
		trackNumber: tags.trackNumber,
		mbid: tags.musicbrainz_trackid,
		timestamp: (playbackStart / 1000).toFixed(0),
		// duration: playbackContext.actualDuration.toFixed(0),
	};
	// @ts-expect-error TS really hates iterating keys cuz its unsafe
	for (const key in scrobbleOpts) if (scrobbleOpts[key] === undefined) delete scrobbleOpts[key];
	trace.debug("makeScrobbleOpts", scrobbleOpts);
	return scrobbleOpts;
};

export const onUnload = registerOnScrobble({
	onNowPlaying: (currentTrack) => LastFM.updateNowPlaying(makeScrobbleOpts(currentTrack)).catch(trace.msg.err.withContext(`Failed to updateNowPlaying!`)),
	onScrobble: (currentTrack) =>
		LastFM.scrobble(makeScrobbleOpts(currentTrack))
			.catch(trace.msg.err.withContext(`Failed to scrobble!`))
			.then((res) => {
				if (res?.scrobbles) trace.log("scrobbled", res?.scrobbles["@attr"], res.scrobbles.scrobble);
			}),
});
