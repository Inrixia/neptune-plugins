// You can put anything you want in the body of your plugin code.
import confetti from "canvas-confetti";
import { intercept } from "@neptune";
import { getState } from "@neptune/store";
import { appendStyle } from "@neptune/utils";

console.log("Hello world!");
confetti();

const tagMap = {
	HIRES_LOSSLESS: "HiRes",
	MQA: "MQA",
	DOLBY_ATMOS: "Atmos",
};

const colorMap = {
	HIRES_LOSSLESS: "#499690",
	MQA: "#e6c200",
	DOLBY_ATMOS: "#0052a3",
};

const unloadables = [];

function convertToUpperCaseWithUnderscores(str) {
	return str
		.replace(/([a-z0-9])([A-Z])/g, "$1_$2") // Convert camelCase to snake_case
		.toUpperCase(); // Convert to uppercase
}

// for (const item in window.neptune.actions) {
// 	for (const action in window.neptune.actions[item]) {
// 		const path = `${item}/${convertToUpperCaseWithUnderscores(action)}`;
// 		unloadables.push(intercept(path, (value) => console.log(path, value)));
// 	}
// }

const queryAllAndAtrribute = (selector) => {
	const results = [];
	const elements = document.querySelectorAll(`[${selector}]`);
	for (const elem of elements) {
		results.push({ elem, attr: elem.getAttribute(selector) });
	}
	return results;
};

// NOTE: We'll have to stop intercepting this and start using a DOM observer due to the fact that
// track lists are heavily lazily loaded.
const handler = () => {
	const state = getState();
	const trackElements = [...queryAllAndAtrribute("data-track-id"), ...queryAllAndAtrribute("data-track--content-id")];

	for (const { elem: trackElem, attr: trackId } of trackElements) {
		console.log(trackId);
		if (trackElem.querySelector(".qualitytags--tags")) continue;
		const tags = state.content.mediaItems.get(trackId)?.item?.mediaMetadata?.tags;
		if (tags === undefined) continue;

		const tagContainer = document.createElement("div");
		tagContainer.className = "qualitytags--tags";

		const listElement = trackElem.querySelector(`[data-test="table-row-title"], [data-test="list-item-track"]`);
		if (listElement === null) continue;

		listElement.appendChild(tagContainer);

		for (const tag of tags) {
			if (tag == "LOSSLESS") continue;

			tagContainer.insertAdjacentHTML("beforeend", `<div style="background-color:${colorMap[tag]}">${tagMap[tag]}</div>`);
		}
	}
};

unloadables.push(
	...[
		intercept("favorites/SET_FAVORITE_IDS", handler),
		intercept("search/SEARCH_RESULT_SUCCESS", handler),
		appendStyle(`.qualitytags--tags{display:flex;padding-left:5px;gap:5px}.qualitytags--tags div{border-radius:500px!important;height:10px;padding:5px 10px;line-height:10px;color:#000}`),
	]
);

export const onUnload = () => unloadables.forEach((u) => u());
