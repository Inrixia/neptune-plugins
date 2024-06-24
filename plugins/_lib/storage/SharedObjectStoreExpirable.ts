import { SharedObjectStore } from "./SharedObjectStore";

export class SharedObjectStoreExpirable<K extends IDBValidKey, V extends Record<any, any> & { __age?: never }> extends SharedObjectStore<K, V> {
	constructor(storeName: string, private readonly maxAge: number, storeSchema?: IDBObjectStoreParameters) {
		super(storeName, storeSchema);
	}
	private static setAge(value: any): void {
		value.__age = Date.now();
	}
	private isTooOld(value?: V): boolean {
		if (value?.__age === undefined) return true;
		return Date.now() - value.__age >= this.maxAge;
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
		if (this.isTooOld(value)) return undefined;
		return value;
	}
	async getAll(key?: K | null, count?: number) {
		const values = await super.getAll(key, count);
		return values.filter(this.isTooOld.bind(this));
	}
}
