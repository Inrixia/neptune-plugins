const caches: Record<string, Record<string | number | symbol, { res?: (v: any) => void; rej?: (err: unknown) => void; promise?: Promise<any> }>> = {};

export const cacheEnsure = async <V>(key: string | number | symbol, cacheId = "_"): Promise<[true, V] | [false]> => {
	if (caches[cacheId]?.[key]?.promise !== undefined) return [true, await caches[cacheId][key].promise];

	caches[cacheId] ??= {};
	caches[cacheId][key] = {};
	caches[cacheId][key].promise = new Promise<V>((_res, _rej) => {
		caches[cacheId][key].rej = _rej;
		caches[cacheId][key].res = _res;
		setTimeout(() => _rej(new Error("Timeout! Promise did not get resolved within 1 minute.")), 60 * 1000);
	});
	return [false];
};
export const cacheRes = <V>(key: string | number | symbol, value: V, cacheId = "_"): void => {
	caches[cacheId] ??= {};
	if (caches[cacheId][key] !== undefined) caches[cacheId][key].res?.(value);
	caches[cacheId][key] = { promise: Promise.resolve(value) };
};
export const cacheRej = <V>(key: string | number | symbol, error: unknown, cacheId = "_"): void => {
	caches[cacheId]?.[key]?.rej?.(error);
	delete caches[cacheId]?.[key];
};
