import { getStorage } from "@inrixia/lib/storage";
import type { LastFmSession } from "./LastFM";

export default getStorage<{
	lastFmSession?: LastFmSession;
}>({
	lastFmSession: undefined,
});
