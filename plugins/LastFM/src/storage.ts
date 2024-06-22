import { getStorage } from "../../../lib/storage";
import type { LastFmSession } from "./LastFM";

export default getStorage<{
	lastFmSession?: LastFmSession;
}>({
	lastFmSession: undefined,
});
