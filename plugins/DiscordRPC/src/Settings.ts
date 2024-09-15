import { html } from "@neptune/voby";
import { getSettings } from "@inrixia/lib/storage";
import { SwitchSetting } from "@inrixia/lib/components/SwitchSetting";
import { update } from ".";

export const settings = getSettings({
	keepRpcOnPause: true,
	displayPlayButton: true,
	displayArtistImage: true,
});

export const Settings = () => html`<${SwitchSetting}
		checked=${settings.keepRpcOnPause}
		onClick=${() => {
			settings.keepRpcOnPause = !settings.keepRpcOnPause;
			update();
		}}
		title="Keep RPC on pause"
	/>
	<${SwitchSetting}
		checked=${settings.displayPlayButton}
		onClick=${() => {
			settings.displayPlayButton = !settings.displayPlayButton;
			update();
		}}
		title="Display play button"
	/>
	<${SwitchSetting}
		checked=${settings.displayArtistImage}
		onClick=${() => {
			settings.displayArtistImage = !settings.displayArtistImage;
			update();
		}}
		title="Display artist image"
	/>`;
