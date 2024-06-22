import { html } from "@neptune/voby";
import { getSettings } from "@inrixia/lib/storage";
import { AudioQualityInverse, AudioQuality, validQualitiesSettings } from "@inrixia/lib/AudioQualityTypes";
import { DropdownSelect } from "@inrixia/lib/components/DropdownSelect";

export const settings = getSettings({
	desiredDownloadQuality: AudioQuality.HiRes,
	defaultDownloadPath: "",
});
export const Settings = () => html`<div>
	<${DropdownSelect}
		selected=${settings.desiredDownloadQuality}
		onSelected=${(selected: AudioQuality) => (settings.desiredDownloadQuality = selected)}
		options=${validQualitiesSettings}
		title="Download Quality"
	/>

	<h3 class="settings-header">Download Path</h3>
	<p class="settings-explainer">System path to save to. Doing so will disable download prompt</p>
	<input onChange=${({ target }: { target: { value: string } }) => (settings.defaultDownloadPath = target.value)} value=${settings.defaultDownloadPath} />
</div>`;
