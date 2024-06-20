import { html } from "@neptune/voby";
// @ts-expect-error Remove this when types are available
import { storage } from "@plugin";
import "../../../lib/css/settings";

storage.displaySkippedScrobbles ??= true;
export const Settings = () => {
	setTimeout(() => {
		const displaySkippedScrobbles = document.getElementById("displaySkippedScrobbles");
		if (displaySkippedScrobbles instanceof HTMLInputElement && displaySkippedScrobbles.checked !== storage.displaySkippedScrobbles) displaySkippedScrobbles!.checked = storage.displaySkippedScrobbles;
	});
	const onChange = (key: string) => (e: { target: { checked: boolean } }) => (storage[key] = e.target.checked);
	return html`<div class="settings-section">
		<h3 class="settings-header">Display Skipped Scrobbles</h3>
		<p class="settings-explainer">Show a temporary message whenever a song isnt scrobbled.</p>
		<label class="switch">
			<input type="checkbox" id="displaySkippedScrobbles" onChange=${onChange("displaySkippedScrobbles")} />
			<span class="slider" />
		</label>
	</div>`;
};
