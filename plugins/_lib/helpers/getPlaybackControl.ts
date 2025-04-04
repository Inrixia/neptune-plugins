import { store } from "@neptune";
import type { CoreState, TrackItem } from "neptune-types/tidal";
import type { MediaItemAudioQuality } from "../classes/Quality";

export type PlaybackContext = {
	actualAssetPresentation: string;
	actualAudioMode: TrackItem["audioModes"];
	actualAudioQuality: MediaItemAudioQuality;
	actualDuration: number;
	actualProductId: string;
	actualStreamType: unknown;
	actualVideoQuality: unknown;
	assetPosition: number;
	bitDepth: number | null;
	codec: string;
	playbackSessionId: string;
	sampleRate: number | null;
};

type PlaybackControl = CoreState["playbackControls"] & { playbackContext: PlaybackContext };
export default (): Partial<PlaybackControl> => <PlaybackControl>store.getState()?.playbackControls ?? {};
