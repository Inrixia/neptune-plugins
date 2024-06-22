import { html } from "@neptune/voby";

type DropdownSelectProps = { selected: string; onSelect?: (selected: string) => void; options: string[]; title: string };
export const DropdownSelect = ({ selected, onSelect, options, title }: DropdownSelectProps) => {
	const onChange = (event: Event) => {
		const target = event.target as HTMLSelectElement;
		if (onSelect) onSelect(target.value);
	};
	return html`
		<div style="margin-bottom: 15px;display: flex;justify-content: space-between;align-items: center;">
			<label for="dropdown-${title}" style="font-size: 1.2em;margin-right: 10px;">${title}</label>
			<select id="dropdown-${title}" value=${selected} onChange=${onChange} style="flex-grow: 1;">
				${options.map((option) => html`<option value=${option} selected=${option === selected}>${option}</option>`)}
			</select>
		</div>
	`;
};
