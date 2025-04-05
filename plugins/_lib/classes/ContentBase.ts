import { store } from "@neptune";
import type { IArtistCredit } from "musicbrainz-api";
import type { ContentStateFields, ItemId } from "neptune-types/tidal";

type ContentType = keyof ContentStateFields;
type ContentItem<K extends ContentType> = Exclude<ReturnType<ContentStateFields[K]["get"]>, undefined>;
type ContentClass<K extends ContentType> = {
	new (itemId: ItemId, contentItem: ContentItem<K>): any;
};

type Artist = {
	id?: number;
	name?: string;
	picture?: string;
	type?: "MAIN" | "FEATURED";
};

export type TImageSize = "1280" | "640" | "320" | "160" | "80";

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

	protected static formatArtists(artists?: Artist[]): string[] {
		if (artists === undefined) return [];
		return artists.reduce((artistTitles, artist) => {
			if (artist !== undefined) {
				if (typeof artist === "string") artistTitles.push(artist);
				else if (artist?.name !== undefined) artistTitles.push(artist.name);
			}
			return artistTitles;
		}, [] as string[]);
	}
	protected static formatTitle(tidalTitle?: string, tidalVersion?: string, brainzTitle?: string, brainzCredit?: IArtistCredit[]): string | undefined {
		brainzTitle = brainzTitle?.replaceAll("’", "'");

		let title = brainzTitle ?? tidalTitle;
		if (title === undefined) return undefined;

		// If the title has feat and its validated by musicBrainz then use the tidal title.
		if (tidalTitle?.includes("feat. ") && !brainzTitle?.includes("feat. ")) {
			const mbHasFeat = brainzCredit && brainzCredit.findIndex((credit) => credit.joinphrase === " feat. ") !== -1;
			if (mbHasFeat) title = tidalTitle;
		}

		// Dont use musicBrainz disambiguation as its not the same as the tidal version!
		if (tidalVersion && !title.toLowerCase().includes(tidalVersion.toLowerCase())) title += ` (${tidalVersion})`;

		return title;
	}

	protected static formatCoverUrl(uuid: string, res: TImageSize = "1280") {
		return `https://resources.tidal.com/images/${uuid.split("-").join("/")}/${res}x${res}.jpg`;
	}
}
