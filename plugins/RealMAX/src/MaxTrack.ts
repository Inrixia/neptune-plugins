import { fetchIsrcIterable } from "@inrixia/lib/api/tidal/isrc";
import { Resource } from "@inrixia/lib/api/tidal/types/ISRC";
import { ExtendedTrackItem } from "@inrixia/lib/Caches/ExtendedTrackItem";
import { TrackItemCache } from "@inrixia/lib/Caches/TrackItemCache";
import { ItemId, TrackItem } from "neptune-types/tidal";
import { hasHiRes } from ".";

export class MaxTrack {
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
