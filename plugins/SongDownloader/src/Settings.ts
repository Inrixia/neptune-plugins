import { html } from "@neptune/voby";

// @ts-expect-error Remove this when types are available
import { storage } from "@plugin";
import { AudioQualityInverse, AudioQuality, validQualitiesSettings } from "../../../lib/AudioQualityTypes";

storage.desiredDownloadQuality ??= AudioQuality.HiRes;
storage.defaultDownloadPath ??= "";
export const Settings = () => html`<div class="settings-section">
	<h3 class="settings-header">Download Quality</h3>
	<p class="settings-explainer">Select the desired max download quality:</p>
	<select id="qualityDropdown" onChange=${(event: { target: { value: unknown } }) => (storage.desiredDownloadQuality = event.target.value)}>
		${validQualitiesSettings.map((quality) => html`<option value=${quality} selected=${storage.desiredDownloadQuality === quality}>${AudioQualityInverse[quality]}</option>`)}
	</select>

	<h3 class="settings-header">Download Path</h3>
	<p class="settings-explainer">System path to save to. Doing so will disable download prompt</p>
	<input onChange=${({ target }: { target: { value: string } }) => (storage.defaultDownloadPath = target.value)} value=${storage.defaultDownloadPath} />
</div>`;
