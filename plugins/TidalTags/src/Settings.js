import { html } from "@neptune/voby";
import { storage } from "@plugin";

storage.showFLACInfo = true;
export const Settings = () => {
	setTimeout(() => {
		const flacCheck = document.getElementById("flacInfoToggle");
		if (flacCheck.checked !== storage.showFLACInfo) flacCheck.checked = storage.showFLACInfo;
	});
	return html`<div class="settings-section">
		<h3 class="settings-header">Show FLAC Info</h3>
		<p class="settings-explainer">Toggle on to show Sample Rate/Bit Depth:</p>
		<label class="switch">
			<input type="checkbox" id="flacInfoToggle" onChange=${(e) => (storage.showFLACInfo = e.target.checked)} />
			<span class="slider" />
		</label>
	</div>`;
};
