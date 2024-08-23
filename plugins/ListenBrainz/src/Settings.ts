import { $, html } from "@neptune/voby";
import { getSettings } from "@inrixia/lib/storage";
import { TextInput } from "@inrixia/lib/components/TextInput";

export const settings = getSettings({
	userToken: "",
});

export const Settings = () => html`<div>
	<${TextInput} text=${settings.userToken} onText=${(text: string) => (settings.userToken = text)} title="User token found on https://listenbrainz.org/profile/" />
</div>`;
