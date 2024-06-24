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
		return this.db?.then((db) => db.close());
	}

	constructor(private readonly storeName: string, private readonly storeSchema?: IDBObjectStoreParameters) {
		SharedObjectStore.openDB(storeName, storeSchema);
	}
	add(value: V, key?: K) {
		return SharedObjectStore.db.then((db) => db.add(this.storeName, value, key));
	}
	clear() {
		return SharedObjectStore.db.then((db) => db.clear(this.storeName));
	}
	count(key?: K | null) {
		return SharedObjectStore.db.then((db) => db.count(this.storeName, key));
	}
	delete(key: K) {
		return SharedObjectStore.db.then((db) => db.delete(this.storeName, key));
	}
	get(query: K) {
		return SharedObjectStore.db.then((db) => db.get(this.storeName, query));
	}
	getAll(query?: K | null, count?: number) {
		return SharedObjectStore.db.then((db) => db.getAll(this.storeName, query, count));
	}
	getAllKeys(query?: K | null, count?: number) {
		return SharedObjectStore.db.then((db) => db.getAllKeys(this.storeName, query, count));
	}
	getKey(query: K) {
		return SharedObjectStore.db.then((db) => db.getKey(this.storeName, query));
	}
	put(value: V, key?: K) {
		return SharedObjectStore.db.then((db) => db.put(this.storeName, value, key));
	}
}
