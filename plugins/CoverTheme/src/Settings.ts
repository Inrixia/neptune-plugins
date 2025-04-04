import { SwitchSetting, getSettings } from "@inrixia/lib";
import { html } from "@neptune/voby";
import { updateStyle } from ".";

export const settings = getSettings({
	transparentTheme: true,
});

export const Settings = () => html`<${SwitchSetting}
	checked=${settings.transparentTheme}
	onClick=${() => {
		settings.transparentTheme = !settings.transparentTheme;
		updateStyle();
	}}
	title="Transparent theme"
/>`;
