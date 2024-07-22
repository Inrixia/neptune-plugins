import { html } from "@neptune/voby";
import { getSettings } from "@inrixia/lib/storage";
import { SwitchSetting } from "@inrixia/lib/components/SwitchSetting";
import { onTimeUpdate } from ".";

export const settings = getSettings({
	keepRpcOnPause: true,
	displayPlayButton: true,
});

export const Settings = () => html`<${SwitchSetting}
		checked=${settings.keepRpcOnPause}
		onClick=${() => {
			onTimeUpdate(!settings).catch(() => {});
			settings.keepRpcOnPause = !settings.keepRpcOnPause;
		}}
		title="Keep RPC on pause"
	/>
	<${SwitchSetting}
		checked=${settings.displayPlayButton}
		onClick=${() => {
			onTimeUpdate(!settings).catch(() => {});
			settings.displayPlayButton = !settings.displayPlayButton;
		}}
		title="Display play button"
	/>`;
