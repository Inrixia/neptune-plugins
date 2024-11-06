export const AsyncCachable = <K extends string | number | symbol, V>(generator: (key: K) => Promise<V>) => {
	const _cache: Record<K, Promise<V>> = <any>{};
	return (key: K): Promise<V> => {
		if (key in _cache) return _cache[key];
		return (_cache[key] = generator(key));
	};
};
