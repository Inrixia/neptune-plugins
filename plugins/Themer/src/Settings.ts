import { html } from "@neptune/voby";
import { getSettings } from "@inrixia/lib/storage";
import { SwitchSetting } from "@inrixia/lib/components/SwitchSetting";
import { draggable } from ".";

export const settings = getSettings({
	showEditor: true,
});
export const Settings = () => html`<div>
	<${SwitchSetting}
		checked=${settings.showEditor}
		onClick=${() => {
			settings.showEditor = !settings.showEditor;
			if (!settings.showEditor) draggable.style.display = "none";
			else draggable.style.display = "";
		}}
		title="Show editor"
	/>
</div>`;
