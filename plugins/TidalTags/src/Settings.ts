import { html } from "@neptune/voby";
import { getSettings } from "@inrixia/lib/storage";
import { SwitchSetting } from "@inrixia/lib/components/SwitchSetting";
import { displayFlacInfo, hideFlacInfo } from "./setFLACInfo";

export const settings = getSettings({
	showTags: true,
	showAtmosQuality: true,
	displayFlacInfo: true,
	showFLACInfoBorder: true,
	infoColumnColors: true,
	displayInfoColumns: true,
});

export const Settings = () => html`<div>
	<${SwitchSetting} checked=${settings.showTags} onClick=${() => (settings.showTags = !settings.showTags)} title="Display tags" />
	<${SwitchSetting} checked=${settings.showAtmosQuality} onClick=${() => (settings.showAtmosQuality = !settings.showAtmosQuality)} title="Display atmos tags" />
	<${SwitchSetting}
		checked=${settings.displayFlacInfo}
		onClick=${() => {
			settings.displayFlacInfo = !settings.displayFlacInfo;
			if (!settings.displayFlacInfo) hideFlacInfo();
			else displayFlacInfo();
		}}
		title="Display Flac Info"
	/>
	<${SwitchSetting} checked=${settings.showFLACInfoBorder} onClick=${() => (settings.showFLACInfoBorder = !settings.showFLACInfoBorder)} title="Display a border around the FLAC Info" />
	<${SwitchSetting} checked=${settings.displayInfoColumns} onClick=${() => (settings.displayInfoColumns = !settings.displayInfoColumns)} title="Display FLAC info columns" />
	<${SwitchSetting} checked=${settings.infoColumnColors} onClick=${() => (settings.infoColumnColors = !settings.infoColumnColors)} title="Display FLAC info columns in color" />
</div>`;
