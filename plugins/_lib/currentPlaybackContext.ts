import { store } from "@neptune";
import { PlaybackContext } from "./AudioQualityTypes";

export default (): PlaybackContext | undefined => <PlaybackContext | undefined | null>store.getState()?.playbackControls?.playbackContext ?? undefined;
