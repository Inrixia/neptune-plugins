import { html } from "@neptune/voby";

// @ts-expect-error Remove this when types are available
import { storage } from "@plugin";
import { AudioQualityInverse, PlaybackContextAudioQuality, validQualitiesSettings } from "../../../lib/AudioQuality";
import { setOAuthAccessToken } from "../../../lib/fetchy";

storage.desiredDownloadQuality ??= PlaybackContextAudioQuality.HiRes;
storage.oAuthAccessToken ??= null;
if (storage.oAuthAccessToken !== null) setOAuthAccessToken(storage.oAuthAccessToken);
export const Settings = () => html`<div class="settings-section">
	<br class="settings-spacer" />
	<h3 class="settings-header">OAuth Access Token</h3>
	<p class="settings-explainer">Use Ctrl+Shift+I to open inspector tools. Go to Network and enter the Bearer token from a tidal api request here</p>
	<input onChange=${({ target }: { target: { value: string } }) => (storage.oAuthAccessToken = setOAuthAccessToken(target.value === "" ? null : target.value))} value=${storage.oAuthAccessToken} />

	<h3 class="settings-header">Download Quality</h3>
	<p class="settings-explainer">Select the desired max download quality:</p>
	<select id="qualityDropdown" onChange=${(event: { target: { value: unknown } }) => (storage.desiredDownloadQuality = event.target.value)}>
		${validQualitiesSettings.map((quality) => html`<option value=${quality} selected=${storage.desiredDownloadQuality === quality}>${AudioQualityInverse[quality]}</option>`)}
	</select>
</div>`;
