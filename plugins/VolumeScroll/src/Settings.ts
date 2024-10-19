import { getSettings } from "@inrixia/lib/storage";
import { TextInput } from "@inrixia/lib/components/TextInput";
import { html } from "@neptune/voby";

export const settings = getSettings({
	changeBy: 10,
	changeByShift: 10,
});

export const Settings = () => html`<${TextInput}
		text=${settings.changeBy}
		onText=${(text: string) => {
			const num = parseInt(text);
			if (isNaN(num)) return;
			settings.changeBy = num;
		}}
		title="Percent to change volume by"
	/>
	<${TextInput}
		text=${settings.changeByShift}
		onText=${(text: string) => {
			const num = parseInt(text);
			if (isNaN(num)) return;
			settings.changeByShift = num;
		}}
		title="Percent to change volume by when shift is held"
	/>`;
