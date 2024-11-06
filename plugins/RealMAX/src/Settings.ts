import { $, html } from "@neptune/voby";
import { getSettings } from "@inrixia/lib/storage";
import { SwitchSetting } from "@inrixia/lib/components/SwitchSetting";

export const settings = getSettings({
	displayMaxContextButton: true,
	displayInfoPopups: true,
	considerNewestRelease: false,
});

export const Settings = () => html`<div>
	<${SwitchSetting}
		checked=${settings.displayMaxContextButton}
		onClick=${() => (settings.displayMaxContextButton = !settings.displayMaxContextButton)}
		title="Display RealMAX Button on Context Menu's"
	/>
	<${SwitchSetting} checked=${settings.displayInfoPopups} onClick=${() => (settings.displayInfoPopups = !settings.displayInfoPopups)} title="Display RealMAX queue event popups" />
	<${SwitchSetting} checked=${settings.considerNewestRelease} onClick=${() => (settings.considerNewestRelease = !settings.considerNewestRelease)} title="Also consider newest release for playlists" />
</div>`;
