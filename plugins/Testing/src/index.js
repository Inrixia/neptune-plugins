import { intercept } from "@neptune";

import confetti from "canvas-confetti";
confetti();

function convertToUpperCaseWithUnderscores(str) {
	return str
		.replace(/([a-z0-9])([A-Z])/g, "$1_$2") // Convert camelCase to snake_case
		.toUpperCase(); // Convert to uppercase
}
const unloadables = [];
for (const item in window.neptune.actions) {
	for (const action in window.neptune.actions[item]) {
		const path = `${item}/${convertToUpperCaseWithUnderscores(action)}`;
		unloadables.push(intercept(path, (value) => console.log(path, value)));
	}
}
export const onUnload = () => unloadables.forEach((u) => u());
