import { SharedObjectStore } from "./SharedObjectStore";

export class SharedObjectStoreExpirable<K extends IDBValidKey, V extends Record<any, any> & { __age?: never }> extends SharedObjectStore<K, V> {
	constructor(storeName: string, private readonly maxAge?: number) {
		super(storeName);
	}
	private static setAge(value: any) {
		value.__age = Date.now();
	}
	private checkAge(value) {
		if (value?.__age === undefined) return undefined;
		if (value.__age <= Date.now() - this.maxAge) return undefined;
	}
	add(value: V, key?: K) {
		SharedObjectStoreExpirable.setAge(value);
		return super.add(value, key);
	}
	put(value: V, key?: K) {
		SharedObjectStoreExpirable.setAge(value);
		return super.put(value, key);
	}
	async get(key: K) {
		const value = await super.get(key);
		if (this.checkAge(value)) return undefined;
		return value;
	}
	async getAll(key?: K | null, count?: number) {
		const values = await super.getAll(key, count);
		return values.filter(this.checkAge.bind(this));
	}
}
