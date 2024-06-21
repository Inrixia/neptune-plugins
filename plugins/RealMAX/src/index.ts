import { ItemId, TrackItem } from "neptune-types/tidal";
import { TrackItemCache } from "../../../lib/Caches/TrackItemCache";
import { fetchIsrcIterable } from "../../../lib/tidalDevApi/isrc";
import { actions, intercept, store } from "@neptune";
import { ExtendedTrackItem } from "../../../lib/Caches/ExtendedTrackItem";
import { Resource } from "../../../lib/tidalDevApi/types/ISRC";
import { debounce } from "../../../lib/debounce";

import { Tracer } from "../../../lib/trace";
const trace = Tracer("[RealMAX]");

const hasHiRes = (trackItem: TrackItem) => {
	const tags = trackItem.mediaMetadata?.tags;
	if (tags === undefined) return false;
	return tags.findIndex((tag) => tag === "HIRES_LOSSLESS") !== -1;
};

class MaxTrack {
	private static readonly _idMap: Record<ItemId, Promise<Resource | false>> = {};
	public static async fastCacheMaxId(itemId: ItemId): Promise<Resource | false> {
		if (itemId === undefined) return false;
		return MaxTrack._idMap[itemId];
	}
	public static async getMaxId(itemId: ItemId | undefined): Promise<Resource | false> {
		if (itemId === undefined) return false;

		const idMapping = MaxTrack._idMap[itemId];
		if (idMapping !== undefined) return idMapping;

		const extTrackItem = await ExtendedTrackItem.get(itemId);
		const trackItem = extTrackItem?.trackItem;
		if (trackItem !== undefined && hasHiRes(trackItem)) return false;

		const isrcs = await extTrackItem?.isrcs();
		if (isrcs === undefined) return (this._idMap[itemId] = Promise.resolve(false));

		return (this._idMap[itemId] = (async () => {
			for (const isrc of isrcs) {
				for await (const { resource } of fetchIsrcIterable(isrc)) {
					if (resource?.id !== undefined && hasHiRes(<TrackItem>resource)) {
						if (resource.artifactType !== "track") continue;
						const maxTrackItem = await TrackItemCache.ensure(resource?.id);
						if (maxTrackItem !== undefined && !hasHiRes(maxTrackItem)) continue;
						else return resource;
					}
				}
			}
			return false;
		})());
	}
}

export const onUnload = intercept(
	"playbackControls/MEDIA_PRODUCT_TRANSITION",
	debounce(async () => {
		const { elements, currentIndex } = store.getState().playQueue;
		const queueId = elements[currentIndex]?.mediaItemId;
		const nextQueueId = elements[currentIndex + 1]?.mediaItemId;

		const maxItem = await MaxTrack.getMaxId(queueId);
		if (maxItem === false) return;
		if (maxItem.id !== undefined && nextQueueId !== maxItem.id) {
			await TrackItemCache.ensure(maxItem.id);
			trace.msg.log(`Found Max quality for ${maxItem.title}! Adding to queue and skipping...`);
			actions.playQueue.addNext({ mediaItemIds: [maxItem.id], context: { type: "user" } });
			actions.playQueue.moveNext();
		}
		// Preload next two
		MaxTrack.getMaxId(elements[currentIndex + 1]?.mediaItemId);
		MaxTrack.getMaxId(elements[currentIndex + 2]?.mediaItemId);
	}, 125)
);
