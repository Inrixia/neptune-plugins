import { MediaItemCache } from "@inrixia/lib/Caches/MediaItemCache";
import { actions, intercept, store } from "@neptune";
import { debounce } from "@inrixia/lib/debounce";

import { Tracer } from "@inrixia/lib/trace";
const trace = Tracer("[RealMAX]");

import { chunkArray } from "@inrixia/helpers/object";

import safeUnload from "@inrixia/lib/safeUnload";
import { interceptPromise } from "@inrixia/lib/intercept/interceptPromise";
import { MaxTrack } from "@inrixia/lib/MaxTrack";
import { ContextMenu } from "@inrixia/lib/ContextMenu";
import { AlbumCache } from "@inrixia/lib/Caches/AlbumCache";
import { settings } from "./Settings";
import type { PlayQueueItem } from "neptune-types/tidal";

export { Settings } from "./Settings";

const maxQueueItem = async (elements: readonly PlayQueueItem[], currentIndex: number, jumpTo?: number) => {
	jumpTo ??= currentIndex;
	const newElements = [...elements];
	const currentId = newElements[currentIndex].mediaItemId;
	const maxItem = await MaxTrack.getMaxTrack(currentId);
	MaxTrack.getMaxTrack(newElements[currentIndex + 1].mediaItemId);
	if (maxItem !== false && maxItem.id !== undefined) {
		newElements[currentIndex].mediaItemId = maxItem.id;
		actions.playQueue.reset({
			elements: newElements,
			currentIndex: jumpTo,
		});
		return true;
	}
	return false;
};

const unloadTransition = intercept("playbackControls/MEDIA_PRODUCT_TRANSITION", ([{ mediaProduct }]) => {
	actions.playbackControls.pause();
	(async () => {
		const productId: string = (<any>mediaProduct).productId;
		const maxItem = await MaxTrack.getMaxTrack(productId);
		if (maxItem !== false && maxItem.id !== undefined) {
			actions.playQueue.addNext({ mediaItemIds: [maxItem.id], context: { type: "UNKNOWN" } });
			actions.playQueue.moveNext();
		}
		actions.playbackControls.play();
	})();
});

const unloadAddNow = intercept("playQueue/ADD_NOW", ([payload]) => {
	(async () => {
		const mediaItemIds = [...payload.mediaItemIds];
		const currentIndex = payload.fromIndex ?? 0;
		const maxItem = await MaxTrack.getMaxTrack(mediaItemIds[currentIndex]);
		if (maxItem !== false && maxItem.id !== undefined) mediaItemIds[currentIndex] = maxItem.id;
		actions.playQueue.addNow({ ...payload, mediaItemIds });
	})();
	return true;
});

const unloadSkip = intercept(["playQueue/MOVE_TO", "playQueue/MOVE_NEXT", "playQueue/MOVE_PREVIOUS"], ([payload, action]) => {
	(async () => {
		const { elements, currentIndex } = store.getState().playQueue;
		switch (action) {
			case "playQueue/MOVE_NEXT":
				if (await maxQueueItem(elements, currentIndex + 1)) return false;
				actions.playQueue.moveNext();
				break;
			case "playQueue/MOVE_PREVIOUS":
				if (await maxQueueItem(elements, currentIndex - 1)) return false;
				actions.playQueue.movePrevious();
				break;
			case "playQueue/MOVE_TO":
				if (await maxQueueItem(elements, payload ?? currentIndex)) return false;
				actions.playQueue.moveTo(payload ?? currentIndex);
				break;
		}
		actions.playbackControls.play();
		return true;
	})();
});

const unloadIntercept = () => {
	unloadTransition();
	unloadAddNow();
	unloadSkip();
};

ContextMenu.onOpen(async (contextSource, contextMenu, trackItems) => {
	document.getElementById("realMax-button")?.remove();
	if (trackItems.length === 0 || !settings.displayMaxContextButton) return;

	let sourceName = trackItems[0].title;
	if (contextSource.type === "PLAYLIST") sourceName = store.getState().content.playlists.find((playlist) => playlist.uuid === contextSource.playlistId)?.title ?? sourceName;
	else if (contextSource.type === "ALBUM") sourceName = (await AlbumCache.get(+contextSource.albumId))?.title ?? sourceName;
	sourceName = `${sourceName} - RealMAX`;

	const maxButton = document.createElement("button");
	maxButton.type = "button";
	maxButton.role = "menuitem";
	maxButton.textContent = trackItems.length > 1 ? `RealMAX - Process ${trackItems.length} tracks` : "RealMAX - Process track";
	maxButton.id = "realMax-button";
	maxButton.className = "context-button"; // Set class name for styling
	contextMenu.appendChild(maxButton);
	maxButton.addEventListener("click", async () => {
		maxButton.remove();
		const trackIds: number[] = [];
		let maxIdsFound = 0;
		for (const index in trackItems) {
			const trackItem = trackItems[index];
			const trackId = trackItem.id!;
			if (trackId === undefined) continue;
			const maxItem = await MaxTrack[settings.considerNewestRelease ? "getLatestMaxTrack" : "getMaxTrack"](trackId).catch(
				trace.msg.err.withContext(`Skipping adding ${trackItem.title} to ${sourceName}`)
			);
			if (maxItem === false || maxItem === undefined) continue;
			if (maxItem?.id !== undefined) {
				if ((await MediaItemCache.ensureTrack(trackId)) !== undefined) {
					trace.msg.log(`Found Max quality for ${maxItem.title} in ${sourceName}! ${index}/${trackItems.length - 1} done.`);
					trackIds.push(+maxItem.id);
					maxIdsFound++;
					continue;
				}
				trace.msg.log(`Found Max quality for ${maxItem.title} in ${sourceName}, but track is unavailable... Skipping! ${index}/${trackItems.length - 1} done.`);
				trackIds.push(trackId);
				continue;
			}
			trace.msg.log(`${sourceName} - ${index}/${trackItems.length - 1} done. `);
			trackIds.push(trackId);
		}
		const [{ playlist }] = await interceptPromise(
			() =>
				actions.folders.createPlaylist({
					description: "Automatically generated by RealMAX",
					folderId: "root",
					fromPlaylist: undefined,
					isPublic: false,
					title: sourceName,
					// @ts-expect-error This works lol
					ids: trackIds.length > 450 ? undefined : trackIds,
				}),
			["content/LOAD_PLAYLIST_SUCCESS"],
			["content/LOAD_PLAYLIST_FAIL"]
		);
		if (trackIds.length > 500) {
			for (const trackIdsChunk of chunkArray(trackIds, 450)) {
				await interceptPromise(
					() =>
						actions.content.addMediaItemsToPlaylist({
							addToIndex: -1,
							mediaItemIdsToAdd: trackIdsChunk,
							onDupes: "ADD",
							playlistUUID: playlist.uuid!,
						}),
					["content/ADD_MEDIA_ITEMS_TO_PLAYLIST_SUCCESS"],
					["content/ADD_MEDIA_ITEMS_TO_PLAYLIST_FAIL"]
				);
			}
		}
		if (playlist?.uuid === undefined) {
			return trace.msg.err(`Failed to create playlist "${sourceName}"`);
		}
		trace.msg.err(`Successfully created RealMAX playlist "${sourceName}" - Found ${maxIdsFound} RealMAX replacements!`);
	});
});

export const onUnload = () => {
	unloadIntercept();
	safeUnload();
};
