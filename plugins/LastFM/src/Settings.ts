import { $, html } from "@neptune/voby";
import { getSettings } from "../../../lib/storage";
import { SwitchSetting } from "../../../lib/components/SwitchSetting";

export const settings = getSettings({
	displaySkippedScrobbles: false,
});

export const Settings = () => html`<div>
	<${SwitchSetting} checked=${settings.displaySkippedScrobbles} onClick=${() => (settings.displaySkippedScrobbles = !settings.displaySkippedScrobbles)} title="Alert if scrobbling is skipped" />
</div>`;
