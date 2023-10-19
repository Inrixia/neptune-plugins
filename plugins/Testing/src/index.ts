import { intercept } from "@neptune";

import confetti from "canvas-confetti";
import { ActionType, UninterceptFunction } from "neptune-types/api/intercept";
import { NeptuneDispatchers } from "neptune-types/tidal";
confetti();

function convertToUpperCaseWithUnderscores(str: string) {
	return str
		.replace(/([a-z0-9])([A-Z])/g, "$1_$2") // Convert camelCase to snake_case
		.toUpperCase(); // Convert to uppercase
}
const unloadables: UninterceptFunction[] = [];
const neptuneActions = window.neptune.actions;
for (const item in neptuneActions) {
	for (const action in window.neptune.actions[<keyof typeof neptuneActions>item]) {
		const path = `${item}/${convertToUpperCaseWithUnderscores(action)}`;
		unloadables.push(intercept(<ActionType>path, (value) => console.log(path, value)));
	}
}
export const onUnload = () => unloadables.forEach((u) => u());
