import { html } from "@neptune/voby";
import { getSettings } from "@inrixia/lib/storage";
import { SwitchSetting } from "@inrixia/lib/components/SwitchSetting";
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
