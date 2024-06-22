import { html } from "@neptune/voby";
import { getSettings } from "@inrixia/lib/storage";
import { AudioQualityInverse, AudioQuality, validQualitiesSettings } from "@inrixia/lib/AudioQualityTypes";

export const settings = getSettings({
	desiredDownloadQuality: AudioQuality.HiRes,
	defaultDownloadPath: "",
});
export const Settings = () => html`<div">
	<h3 class="settings-header">Download Quality</h3>
	<p class="settings-explainer">Select the desired max download quality:</p>
	<select id="qualityDropdown" onChange=${(event: { target: { value: unknown } }) => (settings.desiredDownloadQuality = <AudioQuality>event.target.value)}>
		${validQualitiesSettings.map((quality) => html`<option value=${quality} selected=${settings.desiredDownloadQuality === quality}>${AudioQualityInverse[quality]}</option>`)}
	</select>

	<h3 class="settings-header">Download Path</h3>
	<p class="settings-explainer">System path to save to. Doing so will disable download prompt</p>
	<input onChange=${({ target }: { target: { value: string } }) => (settings.defaultDownloadPath = target.value)} value=${settings.defaultDownloadPath} />
</div>`;
