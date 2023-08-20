import { html } from "@neptune/voby";
import { storage } from "@plugin";

import { setStreamQualityIndicator } from "./streamQualitySelector";

storage.showFLACInfo = true;
storage.showFLACInfoBorder = false;
export const Settings = () => {
	setTimeout(() => {
		const flacCheck = document.getElementById("flacInfoToggle");
		if (flacCheck.checked !== storage.showFLACInfo) flacCheck.checked = storage.showFLACInfo;

		const flacBorderCheck = document.getElementById("flacInfoBorderToggle");
		if (flacBorderCheck.checked !== storage.showFLACInfoBorder) flacBorderCheck.checked = storage.showFLACInfoBorder;
	});
	const onChange = (key) => (e) => {
		switch (key) {
			case "showFLACInfo":
				storage.showFLACInfo = e.target.checked;
				break;
			case "showFLACInfoBorder":
				storage.showFLACInfoBorder = e.target.checked;
				break;
		}
		setStreamQualityIndicator();
	};
	return html`<div class="settings-section">
		<h3 class="settings-header">Show FLAC Info</h3>
		<p class="settings-explainer">Show Sample Rate/Bit Depth</p>
		<label class="switch">
			<input type="checkbox" id="flacInfoToggle" onChange=${onChange("showFLACInfo")} />
			<span class="slider" />
		</label>
		<br class="settings-spacer" />
		<h3 class="settings-header">Show FLAC Info Border</h3>
		<p class="settings-explainer">Show a border around the FLAC Info</p>
		<label class="switch">
			<input type="checkbox" id="flacInfoBorderToggle" onChange=${onChange("showFLACInfoBorder")} />
			<span class="slider" />
		</label>
	</div>`;
};
