import { html } from "@neptune/voby";
import { storage } from "@plugin";
import { AudioQualityInverse, AudioQuality, validQualities } from "./AudioQuality";

storage.desiredDownloadQuality = AudioQuality.HiRes;
export const Settings = () => {
	const dropdown = html`<div class="settings-section">
		<h3 class="settings-header">Download Quality</h3>
		<p class="settings-explainer">Select the desired max download quality:</p>
		<select id="qualityDropdown" onChange=${(event) => (storage.desiredDownloadQuality = event.target.value)}>
			${validQualities.map((quality) => html`<option value=${quality} selected=${storage.desiredDownloadQuality === quality}>${AudioQualityInverse[quality]}</option>`)}
		</select>
	</div>`;

	return dropdown;
};
