import { ItemId, TrackItem } from "neptune-types/tidal";
import { TrackItemCache } from "../../../lib/TrackCache/TrackItemCache";
import { fetchIsrcIterable } from "../../../lib/tidalDevApi/isrc";
import { actions, intercept, store } from "@neptune";
import { PlaybackContext } from "../../../lib/AudioQualityTypes";
import { ExtendedTrackItem } from "../../../lib/TrackCache/ExtendedTrackItem";

const hasHiRes = (trackItem: TrackItem) => {
	const tags = trackItem.mediaMetadata?.tags;
	if (tags === undefined) return false;
	return tags.findIndex((tag) => tag === "HIRES_LOSSLESS") !== -1;
};

class MaxTrack {
	private static readonly _idMap: Record<ItemId, Promise<ItemId | false>> = {};
	public static async getMaxId(itemId: ItemId | undefined): Promise<ItemId | false> {
		if (itemId === undefined) return false;

		const idMapping = MaxTrack._idMap[itemId];
		if (idMapping !== undefined) return idMapping;

		const extTrackItem = await ExtendedTrackItem.get(itemId);
		const trackItem = extTrackItem?.trackItem();
		if (trackItem !== undefined && hasHiRes(trackItem)) return false;

		const isrcs = await extTrackItem?.isrcs();
		if (isrcs === undefined) return (this._idMap[itemId] = Promise.resolve(false));

		return (this._idMap[itemId] = (async () => {
			for (const isrc of isrcs) {
				for await (const { resource } of fetchIsrcIterable(isrc)) {
					if (resource?.id !== undefined && hasHiRes(resource)) return resource.id;
				}
			}
			return false;
		})());
	}
}
// @ts-ignore intercept doesnt like async functions
const unloadPlay = intercept("playbackControls/MEDIA_PRODUCT_TRANSITION", async ([{ playbackContext }]: [{ playbackContext: PlaybackContext }]) => {
	const { elements, currentIndex } = store.getState().playQueue;
	for (let index = currentIndex; index < Math.min(elements.length - 1, currentIndex + 5); index++) {
		const mediaItemId = elements[index]?.mediaItemId;
		if (mediaItemId === undefined) return;
		const maxId = await MaxTrack.getMaxId(mediaItemId);
		const maxInjected = elements[index + 1]?.mediaItemId === maxId;
		if (maxInjected) {
			actions.playQueue.removeAtIndex({ index: index + 1 });
			actions.playQueue.movePrevious();
		} else if (index === currentIndex && maxId !== false) {
			actions.playQueue.addNext(<any>{ mediaItemIds: [maxId] });
			actions.playQueue.moveNext();
		}
	}
});

export const onUnload = () => {
	unloadPlay();
};
