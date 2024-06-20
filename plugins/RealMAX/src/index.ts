import { ItemId, TrackItem } from "neptune-types/tidal";
import { TrackItemCache } from "../../../lib/TrackCache/TrackItemCache";
import { fetchIsrcIterable } from "../../../lib/tidalDevApi/isrc";
import { actions, intercept, store } from "@neptune";
import { PlaybackContext } from "../../../lib/AudioQualityTypes";

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

		const trackItem = TrackItemCache.get(itemId);
		if (trackItem === undefined || trackItem.isrc === undefined || hasHiRes(trackItem)) {
			return (this._idMap[itemId] = Promise.resolve(false));
		}

		return (this._idMap[itemId] = (async () => {
			for await (const { resource } of fetchIsrcIterable(trackItem.isrc!)) {
				if (resource?.id !== undefined && hasHiRes(resource)) return resource.id;
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
