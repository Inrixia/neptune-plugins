import { openDB, IDBPDatabase } from "idb";
import { Semaphore } from "./Semaphore";

const dbName = "@inrixia/sharedStorage";
export class SharedObjectStore<K extends IDBValidKey, V> {
	public static db: Promise<IDBPDatabase>;
	private static openSema: Semaphore = new Semaphore(1);
	private static async openDB(storeName: string, storeSchema?: IDBObjectStoreParameters) {
		await this.openSema.obtain();
		try {
			const reOpen = (db: IDBPDatabase) => async () => {
				await db.close();
				this.openDB(storeName, storeSchema);
			};
			this.db = openDB(dbName).then(async (db) => {
				db.addEventListener("versionchange", reOpen(db));
				if (db.objectStoreNames.contains(storeName)) return db;
				await db.close();
				return openDB(dbName, db.version + 1, {
					blocking: reOpen(db),
					upgrade(db) {
						db.createObjectStore(storeName, storeSchema);
					},
				});
			});
			const _db = await this.db;
			_db.addEventListener("versionchange", reOpen(_db));
		} finally {
			this.openSema.release();
		}
	}
	public static close() {
		return this.db.then((db) => db.close());
	}

	constructor(private readonly storeName: string, storeSchema?: IDBObjectStoreParameters) {
		SharedObjectStore.openDB(storeName, storeSchema);
	}
	async add(value: V, key?: K) {
		return (await SharedObjectStore.db).add(this.storeName, value, key);
	}
	async clear() {
		return (await SharedObjectStore.db).clear(this.storeName);
	}
	async count(key?: K | null) {
		return (await SharedObjectStore.db).count(this.storeName, key);
	}
	async delete(key: K) {
		return (await SharedObjectStore.db).delete(this.storeName, key);
	}
	async get(query: K) {
		return (await SharedObjectStore.db).get(this.storeName, query);
	}
	async getAll(query?: K | null, count?: number) {
		return (await SharedObjectStore.db).getAll(this.storeName, query, count);
	}
	async getAllKeys(query?: K | null, count?: number) {
		return (await SharedObjectStore.db).getAllKeys(this.storeName, query, count);
	}
	async getKey(query: K) {
		return (await SharedObjectStore.db).getKey(this.storeName, query);
	}
	async put(value: V, key?: K) {
		return (await SharedObjectStore.db).put(this.storeName, value, key);
	}
}
