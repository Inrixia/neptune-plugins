import { html } from "@neptune/voby";
import { DivWithTooltip } from "./divWithTooltip";

type TextInputProps = { text: string; onText?: (text: string) => void; title: string; tooltip?: string };
export const TextInput = ({ text, onText, title, tooltip }: TextInputProps) => {
	const onChange = (event: Event) => onText?.((event.target as HTMLSelectElement).value);
	return html`
		<${DivWithTooltip} tooltip=${tooltip}>
			<label for="text-${title}" style="font-size: 1.2em;margin-right: 16px;">${title}</label>
			<input id="text-${title}" class="neptune-text-input" value=${text} onChange=${onChange} style="flex-grow: 1; width: auto; height: auto;" />
		<//>
	`;
};
