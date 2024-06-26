import { fetchIsrcIterable, Resource } from "./api/tidal";
import { ExtendedTrackItem } from "./Caches/ExtendedTrackItem";
import { TrackItemCache } from "./Caches/TrackItemCache";
import { ItemId, TrackItem } from "neptune-types/tidal";

export class MaxTrack {
	private static readonly _maxTrackMap: Record<ItemId, Promise<Resource | false>> = {};
	public static async fastCacheMaxId(itemId: ItemId): Promise<Resource | false> {
		if (itemId === undefined) return false;
		return MaxTrack._maxTrackMap[itemId];
	}
	public static async getMaxTrack(itemId: ItemId | undefined): Promise<Resource | false> {
		if (itemId === undefined) return false;

		const maxTrack = MaxTrack._maxTrackMap[itemId];
		if (maxTrack !== undefined) return maxTrack;

		const extTrackItem = await ExtendedTrackItem.get(itemId);
		const trackItem = extTrackItem?.trackItem;
		if (trackItem !== undefined && this.hasHiRes(trackItem)) return false;

		const isrcs = await extTrackItem?.isrcs();
		if (isrcs === undefined) return (this._maxTrackMap[itemId] = Promise.resolve(false));

		return (this._maxTrackMap[itemId] = (async () => {
			for (const isrc of isrcs) {
				for await (const { resource } of fetchIsrcIterable(isrc)) {
					if (resource?.id !== undefined && this.hasHiRes(<TrackItem>resource)) {
						if (resource.artifactType !== "track") continue;
						const maxTrackItem = await TrackItemCache.ensure(resource?.id);
						if (maxTrackItem !== undefined && !this.hasHiRes(maxTrackItem)) continue;
						else return resource;
					}
				}
			}
			return false;
		})());
	}
	public static hasHiRes(trackItem: TrackItem): boolean {
		const tags = trackItem.mediaMetadata?.tags;
		if (tags === undefined) return false;
		return tags.findIndex((tag) => tag === "HIRES_LOSSLESS") !== -1;
	}
}
