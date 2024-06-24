import { ItemId, TrackItem } from "neptune-types/tidal";
import { TrackItemCache } from "@inrixia/lib/Caches/TrackItemCache";
import { actions, intercept, store } from "@neptune";
import { debounce } from "@inrixia/lib/debounce";

import { Tracer } from "@inrixia/lib/trace";
import safeUnload from "@inrixia/lib/safeUnload";
import { interceptPromise } from "@inrixia/lib/intercept/interceptPromise";
import { MaxTrack } from "./MaxTrack";
import { ContextMenu } from "@inrixia/lib/ContextMenu";
const trace = Tracer("[RealMAX]");

export const hasHiRes = (trackItem: TrackItem) => {
	const tags = trackItem.mediaMetadata?.tags;
	if (tags === undefined) return false;
	return tags.findIndex((tag) => tag === "HIRES_LOSSLESS") !== -1;
};

const unloadIntercept = intercept(
	"playbackControls/MEDIA_PRODUCT_TRANSITION",
	debounce(async () => {
		const { elements, currentIndex } = store.getState().playQueue;
		const queueId = elements[currentIndex]?.mediaItemId;
		const nextQueueId = elements[currentIndex + 1]?.mediaItemId;

		const maxItem = await MaxTrack.getMaxId(queueId);
		if (maxItem === false) return;
		if (maxItem.id !== undefined && nextQueueId !== maxItem.id) {
			await TrackItemCache.ensure(maxItem.id);
			trace.msg.log(`Found Max quality for ${maxItem.title}! Adding to queue and skipping...`);
			actions.playQueue.addNext({ mediaItemIds: [maxItem.id], context: { type: "user" } });
			actions.playQueue.moveNext();
		}
		// Preload next two
		MaxTrack.getMaxId(elements[currentIndex + 1]?.mediaItemId);
		MaxTrack.getMaxId(elements[currentIndex + 2]?.mediaItemId);
	}, 125)
);

ContextMenu.onOpen(async (contextSource, contextMenu, trackItems) => {
	if (trackItems.length === 0) return;
	document.getElementById("realMax-button")?.remove();

	const downloadButton = document.createElement("button");
	downloadButton.type = "button";
	downloadButton.role = "menuitem";
	downloadButton.textContent = `RealMAX - Process ${trackItems.length} tracks`;
	downloadButton.id = "realMax-button";
	downloadButton.className = "context-button"; // Set class name for styling
	contextMenu.appendChild(downloadButton);
});

export const onUnload = () => {
	unloadIntercept();
	safeUnload();
};
