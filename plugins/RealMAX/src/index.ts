import { ItemId, TrackItem } from "neptune-types/tidal";
import { TrackItemCache } from "../../../lib/Caches/TrackItemCache";
import { fetchIsrcIterable } from "../../../lib/tidalDevApi/isrc";
import { actions, intercept, store } from "@neptune";
import { PlaybackContext } from "../../../lib/AudioQualityTypes";
import { ExtendedTrackItem } from "../../../lib/Caches/ExtendedTrackItem";
import { Resource } from "../../../lib/tidalDevApi/types/ISRC";
import { interceptPromise } from "../../../lib/intercept/interceptPromise";
import { debounce } from "../../../lib/debounce";

const hasHiRes = (trackItem: TrackItem) => {
	const tags = trackItem.mediaMetadata?.tags;
	if (tags === undefined) return false;
	return tags.findIndex((tag) => tag === "HIRES_LOSSLESS") !== -1;
};

class MaxTrack {
	private static readonly _idMap: Record<ItemId, Promise<Resource | undefined>> = {};
	public static async fastCacheMaxId(itemId: ItemId): Promise<Resource | undefined> {
		if (itemId === undefined) return undefined;
		return MaxTrack._idMap[itemId];
	}
	public static async getMaxId(itemId: ItemId | undefined): Promise<Resource | undefined> {
		if (itemId === undefined) return undefined;

		const idMapping = MaxTrack._idMap[itemId];
		if (idMapping !== undefined) return idMapping;

		const extTrackItem = await ExtendedTrackItem.get(itemId);
		const trackItem = extTrackItem?.trackItem();
		if (trackItem !== undefined && hasHiRes(trackItem)) return undefined;

		const isrcs = await extTrackItem?.isrcs();
		if (isrcs === undefined) return (this._idMap[itemId] = Promise.resolve(undefined));

		return (this._idMap[itemId] = (async () => {
			for (const isrc of isrcs) {
				for await (const { resource } of fetchIsrcIterable(isrc)) {
					if (resource?.id !== undefined && hasHiRes(<TrackItem>resource)) {
						if (resource.artifactType !== "track") continue;
						const maxTrackItem = TrackItemCache.get(resource?.id);
						if (maxTrackItem !== undefined && !hasHiRes(maxTrackItem)) continue;
						else return resource;
					}
				}
			}
			return undefined;
		})());
	}
}

// export const onUnload = intercept(
// 	"playbackControls/TIME_UPDATE",
// 	debounce(async () => {
// 		const { elements, currentIndex } = store.getState().playQueue;
// 		const queueId = elements[currentIndex]?.mediaItemId;

// 		const maxItem = await MaxTrack.getMaxId(queueId);
// 		if (maxItem !== undefined) {
// 			actions.playQueue.clearActiveItems();
// 			await interceptPromise(() => actions.content.fetchAndPlayMediaItem({ itemId: maxItem?.id!, itemType: "track", sourceContext: { type: "user" } }), ["playbackControls/MEDIA_PRODUCT_TRANSITION"], []);
// 			const mediaItemIds = elements.slice(currentIndex + 1).map(({ mediaItemId }) => mediaItemId);
// 			actions.playQueue.addMediaItemsToQueue({ mediaItemIds, position: "next", options: { overwritePlayQueue: true }, sourceContext: { type: "user" } });
// 		}
// 		// Preload next
// 		await MaxTrack.getMaxId(elements[currentIndex + 1]?.mediaItemId);
// 	}, 125)
// );
