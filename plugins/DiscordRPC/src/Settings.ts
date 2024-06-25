import { html } from "@neptune/voby";
import { getSettings } from "@inrixia/lib/storage";
import { SwitchSetting } from "@inrixia/lib/components/SwitchSetting";
import { onTimeUpdate } from ".";

export const settings = getSettings({
	keepRpcOnPause: false,
});

export const Settings = () => html`<${SwitchSetting}
	checked=${settings.keepRpcOnPause}
	onClick=${() => {
		onTimeUpdate(!settings.keepRpcOnPause).catch(() => {});
		settings.keepRpcOnPause = !settings.keepRpcOnPause;
	}}
	title="Keep RPC on pause"
/>`;
