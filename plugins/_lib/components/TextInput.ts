import { html } from "@neptune/voby";

type TextInputProps = { text: string; onText?: (text: string) => void; title: string };
export const TextInput = ({ text, onText, title }: TextInputProps) => {
	const onChange = (event: Event) => onText?.((event.target as HTMLSelectElement).value);
	return html`
		<div style="margin-bottom: 15px;display: flex;justify-content: space-between;align-items: center;">
			<label for="text-${title}" style="font-size: 1.2em;margin-right: 16px;">${title}</label>
			<input id="text-${title}" value=${text} onChange=${onChange} style="flex-grow: 1;" />
		</div>
	`;
};
