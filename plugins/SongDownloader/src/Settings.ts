import { html } from "@neptune/voby";

// @ts-expect-error Remove this when types are available
import { storage } from "@plugin";
import { AudioQualityInverse, AudioQualityEnum, validQualitiesSettings } from "../../../lib/AudioQuality";

storage.desiredDownloadQuality ??= AudioQualityEnum.HiRes;
export const Settings = () => html`<div class="settings-section">
	<h3 class="settings-header">Download Quality</h3>
	<p class="settings-explainer">Select the desired max download quality:</p>
	<select id="qualityDropdown" onChange=${(event: { target: { value: unknown } }) => (storage.desiredDownloadQuality = event.target.value)}>
		${validQualitiesSettings.map((quality) => html`<option value=${quality} selected=${storage.desiredDownloadQuality === quality}>${AudioQualityInverse[quality]}</option>`)}
	</select>
</div>`;
