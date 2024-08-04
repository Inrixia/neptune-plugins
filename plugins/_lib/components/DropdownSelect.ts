import { html } from "@neptune/voby";
import { DivWithTooltip } from "./divWithTooltip";

type DropdownSelectProps = { selected: string; onSelect?: (selected: string) => void; options: string[]; title: string; tooltip?: string };
export const DropdownSelect = ({ selected, onSelect, options, title, tooltip }: DropdownSelectProps) => {
	const onChange = (event: Event) => onSelect?.((event.target as HTMLSelectElement).value);
	return html`
		<${DivWithTooltip} tooltip=${tooltip}>
			<label for="dropdown-${title}" style="font-size: 1.2em;margin-right: 10px;">${title}</label>
			<select id="dropdown-${title}" class="neptune-text-input" value=${selected} onChange=${onChange} style="flex-grow: 1; max-width: 180px;">
				${options.map((option) => html`<option class="neptune-card" value=${option} selected=${option === selected}>${option}</option>`)}
			</select>
		<//>
	`;
};
