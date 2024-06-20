import { html } from "@neptune/voby";
// @ts-expect-error Remove this when types are available
import { storage } from "@plugin";

import "../../../lib/css/settings";

storage.exitOnFirstMatch ??= true;
storage.startInMiddle ??= true;
export const Settings = () => {
	setTimeout(() => {
		const exitOnFirstMatch = document.getElementById("exitOnFirstMatch");
		if (exitOnFirstMatch instanceof HTMLInputElement && exitOnFirstMatch.checked !== storage.exitOnFirstMatch) exitOnFirstMatch!.checked = storage.exitOnFirstMatch;

		const startInMiddle = document.getElementById("startInMiddle");
		if (startInMiddle instanceof HTMLInputElement && startInMiddle.checked !== storage.startInMiddle) startInMiddle!.checked = storage.startInMiddle;
	});
	const onChange = (key: string) => (e: { target: { checked: boolean } }) => (storage[key] = e.target.checked);
	return html`<div class="settings-section">
		<h3 class="settings-header">Find One</h3>
		<p class="settings-explainer">Stop searching on the first match.</p>
		<label class="switch">
			<input type="checkbox" id="exitOnFirstMatch" onChange=${onChange("exitOnFirstMatch")} />
			<span class="slider" />
		</label>

		<h3 class="settings-header">Start in Middle</h3>
		<p class="settings-explainer">Start searching in the middle of the song.</p>
		<label class="switch">
			<input type="checkbox" id="startInMiddle" onChange=${onChange("startInMiddle")} />
			<span class="slider" />
		</label>
	</div>`;
};
