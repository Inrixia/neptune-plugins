import { html } from "@neptune/voby";
import { getSettings } from "@inrixia/lib/storage";
import { AudioQuality, validQualitiesSettings } from "@inrixia/lib/AudioQualityTypes";
import { DropdownSelect } from "@inrixia/lib/components/DropdownSelect";
import { TextInput } from "@inrixia/lib/components/TextInput";
import { SwitchSetting } from "@inrixia/lib/components/SwitchSetting";
import { availableTags } from "@inrixia/lib/makeTags";

const defaultFilenameFormat = "{artist} - {album} - {title}";
export const settings = getSettings({
	desiredDownloadQuality: AudioQuality.HiRes,
	defaultDownloadPath: "",
	alwaysUseDefaultPath: true,
	filenameFormat: defaultFilenameFormat,
	useRealMAX: true,
});
if (settings.filenameFormat === "") settings.filenameFormat = defaultFilenameFormat;
if (settings.filenameFormat === "artist - album - title") settings.filenameFormat = defaultFilenameFormat;
export const Settings = () => html`<div style="display: grid; grid-gap: 20px; margin-top: 20px;">
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
		title="Skip save prompt (requires default path)"
	/>
	<${SwitchSetting} checked=${settings.useRealMAX} onClick=${() => (settings.useRealMAX = !settings.useRealMAX)} title="Use RealMAX to find the highest quality" />
	<${TextInput}
		text=${settings.filenameFormat}
		onText=${(text: string) => {
			if (text === "") settings.filenameFormat = defaultFilenameFormat;
			else settings.filenameFormat = text;
		}}
		title="Filename format"
		tooltip="Availble tags: ${availableTags.join(", ")}"
	/>
</div>`;
