import { store } from "@neptune";
import type { ContentStateFields, ItemId } from "neptune-types/tidal";

type ContentType = keyof ContentStateFields;
type ContentItem<K extends ContentType> = Exclude<ReturnType<ContentStateFields[K]["get"]>, undefined>;
type ContentClass<K extends ContentType> = {
	new (itemId: ItemId, contentItem: ContentItem<K>): any;
};
export class ContentBase {
	private static readonly _instances: Record<string, Record<ItemId, ContentClass<ContentType>>> = {};

	protected static fromStore<K extends ContentType, C extends ContentClass<K>, I extends InstanceType<C>>(itemId: ItemId, contentType: K, clss: C): I | undefined {
		if (this._instances[contentType]?.[itemId] !== undefined) return this._instances[contentType][itemId] as I;
		const storeContent = store.getState().content;
		const contentItem = storeContent[contentType][itemId as keyof ContentStateFields[K]] as ContentItem<K>;
		if (contentItem !== undefined) {
			this._instances[contentType] ??= {};
			return (this._instances[contentType][itemId] ??= new clss(itemId, contentItem)) as I;
		}
	}
}
