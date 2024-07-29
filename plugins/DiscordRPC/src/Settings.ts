import { html } from "@neptune/voby";
import { getSettings } from "@inrixia/lib/storage";
import { SwitchSetting } from "@inrixia/lib/components/SwitchSetting";
import { onTimeUpdate } from ".";

export const settings = getSettings({
	keepRpcOnPause: true,
	displayPlayButton: true,
	displayArtistImage: true,
});

export type Settings = typeof settings;

export const Settings = () => html`<${SwitchSetting}
		checked=${settings.keepRpcOnPause}
		onClick=${() => {
			settings.keepRpcOnPause = !settings.keepRpcOnPause;
			onTimeUpdate().catch(() => {});
		}}
		title="Keep RPC on pause"
	/>
	<${SwitchSetting}
		checked=${settings.displayPlayButton}
		onClick=${() => {
			settings.displayPlayButton = !settings.displayPlayButton;
			onTimeUpdate().catch(() => {});
		}}
		title="Display play button"
	/>
	<${SwitchSetting}
		checked=${settings.displayArtistImage}
		onClick=${() => {
			settings.displayArtistImage = !settings.displayArtistImage;
			onTimeUpdate().catch(() => {});
		}}
		title="Display artist image"
	/>`;
