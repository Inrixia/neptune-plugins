import { $, html } from "@neptune/voby";
import { getSettings } from "@inrixia/lib/storage";
import { SwitchSetting } from "@inrixia/lib/components/SwitchSetting";

export const settings = getSettings({
	useTidalFullscreen: false,
});

export const Settings = () => html`<div>
	<${SwitchSetting} checked=${settings.useTidalFullscreen} onClick=${() => (settings.useTidalFullscreen = !settings.useTidalFullscreen)} title="Always use Tidal Fullscreen mode" />
</div>`;
