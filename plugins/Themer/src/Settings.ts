import { html } from "@neptune/voby";
import { openEditor } from ".";

export const Settings = () => html`<div>
	<button
		onClick=${() => {
			openEditor();
		}}
		style="border-radius: 5px; padding: 7px 10px; background-color: var(--wave-color-opacity-contrast-fill-ultra-thin);"
	>
		Open Editor (Ctrl+E)
	</button>
</div>`;
