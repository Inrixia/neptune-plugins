import { html } from "@neptune/voby";
import { getSettings } from "@inrixia/lib/storage";
import { SwitchSetting } from "@inrixia/lib/components/SwitchSetting";
import { updateCSS } from ".";

export const settings = getSettings({
	injectCSS: true,
});

export const Settings = () => html`<${SwitchSetting}
	checked=${settings.injectCSS}
	onClick=${() => {
		settings.injectCSS = !settings.injectCSS;
		updateCSS();
	}}
	title="Inject default CSS styles"
/>`;
