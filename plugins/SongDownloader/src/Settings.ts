import { html } from "@neptune/voby";
import { getSettings } from "@inrixia/lib/storage";
import { AudioQualityInverse, AudioQuality, validQualitiesSettings } from "@inrixia/lib/AudioQualityTypes";
import { DropdownSelect } from "@inrixia/lib/components/DropdownSelect";
import { TextInput } from "@inrixia/lib/components/TextInput";

export const settings = getSettings({
	desiredDownloadQuality: AudioQuality.HiRes,
	defaultDownloadPath: "",
});
export const Settings = () => html`<div>
	<${DropdownSelect}
		selected=${settings.desiredDownloadQuality}
		onSelect=${(selected: AudioQuality) => (settings.desiredDownloadQuality = selected)}
		options=${validQualitiesSettings}
		title="Download Quality"
	/>
	<${TextInput} text=${settings.defaultDownloadPath} onText=${(text: string) => (settings.defaultDownloadPath = text)} title="Download Path" />
	Specifying download path to save to will disable download prompt and save all files to the specified path.
</div>`;
