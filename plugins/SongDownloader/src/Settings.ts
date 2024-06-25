import { html } from "@neptune/voby";
import { getSettings } from "@inrixia/lib/storage";
import { AudioQuality, validQualitiesSettings } from "@inrixia/lib/AudioQualityTypes";
import { DropdownSelect } from "@inrixia/lib/components/DropdownSelect";
import { TextInput } from "@inrixia/lib/components/TextInput";
import { SwitchSetting } from "@inrixia/lib/components/SwitchSetting";

export const settings = getSettings({
	desiredDownloadQuality: AudioQuality.HiRes,
	defaultDownloadPath: "",
	alwaysUseDefaultPath: true,
});
export const Settings = () => html`<div>
	<${DropdownSelect}
		selected=${settings.desiredDownloadQuality}
		onSelect=${(selected: AudioQuality) => (settings.desiredDownloadQuality = selected)}
		options=${validQualitiesSettings}
		title="Download quality"
	/>
	<${TextInput} text=${settings.defaultDownloadPath} onText=${(text: string) => (settings.defaultDownloadPath = text)} title="Default save path" />
	<${SwitchSetting}
		checked=${settings.defaultDownloadPath !== "" && settings.alwaysUseDefaultPath}
		onClick=${() => (settings.alwaysUseDefaultPath = !settings.alwaysUseDefaultPath)}
		title="Always use default save path"
	/>
</div>`;
