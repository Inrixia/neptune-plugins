import { TrackOptions, fetchTrack } from "../../../lib/download";

const bytesCache = new Map<string, Promise<number>>();
export const getTrackBytes = ({ songId, desiredQuality }: TrackOptions): Promise<number> => {
	const key = `${songId}-${desiredQuality}`;

	// If a promise for this key is already in the cache, await it
	if (bytesCache.has(key)) return bytesCache.get(key)!;

	const getBytes = () => new Promise<number>((res, rej) => fetchTrack({ songId, desiredQuality }, { requestOptions: { method: "HEAD" }, onProgress: ({ total }) => res(total * 8) }).catch(rej));
	bytesCache.set(key, getBytes());

	return bytesCache.get(key)!;
};
