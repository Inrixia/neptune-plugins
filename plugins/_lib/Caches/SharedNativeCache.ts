import { cacheEnsure, cacheRej, cacheRes } from "../native/sharedCache";

export class SharedNativeCache<K extends string | number | symbol, V> {
	constructor(public readonly name?: string) {}

	public async ensure(key: K, generator: () => Promise<V>): Promise<V> {
		const [exists, value] = await cacheEnsure<V>(key, this.name);
		if (exists) return value;
		try {
			const result = await generator();
			cacheRes(key, result, this.name);
			return result;
		} catch (err) {
			cacheRej(key, err, this.name);
			throw err;
		}
	}
}
