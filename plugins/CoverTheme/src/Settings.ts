import { html } from "@neptune/voby";
import { getSettings } from "@inrixia/lib/storage";
import { SwitchSetting } from "@inrixia/lib/components/SwitchSetting";
import { updateCSS } from ".";

export const settings = getSettings({
	transparentTheme: true,
	backgroundGradient: true,
});

export const Settings = () => html` <${SwitchSetting}
		checked=${settings.transparentTheme}
		onClick=${() => {
			settings.transparentTheme = !settings.transparentTheme;
			updateCSS();
		}}
		title="Transparent theme"
	/>
	<${SwitchSetting}
		checked=${settings.backgroundGradient}
		onClick=${() => {
			settings.backgroundGradient = !settings.backgroundGradient;
			updateCSS();
		}}
		title="Background gradient"
	/>`;
