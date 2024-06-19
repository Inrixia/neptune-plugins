import { html } from "@neptune/voby";
// @ts-expect-error Remove this when types are available
import { storage } from "@plugin";

storage.showTags ??= true;
storage.showAtmosQuality ??= true;
storage.showFLACInfoBorder ??= true;
storage.InfoColumnColors ??= false;
export const Settings = () => {
	setTimeout(() => {
		const showTags = document.getElementById("showTags");
		if (showTags instanceof HTMLInputElement && showTags.checked !== storage.showTags) showTags!.checked = storage.showTags;

		const showFLACInfoBorder = document.getElementById("showFLACInfoBorder");
		if (showFLACInfoBorder instanceof HTMLInputElement && showFLACInfoBorder.checked !== storage.showFLACInfoBorder) showFLACInfoBorder.checked = storage.showFLACInfoBorder;

		const showAtmosQuality = document.getElementById("showAtmosQuality");
		if (showAtmosQuality instanceof HTMLInputElement && showAtmosQuality.checked !== storage.showAtmosQuality) showAtmosQuality.checked = storage.showAtmosQuality;

		const infoColumnColors = document.getElementById("infoColumnColors");
		if (infoColumnColors instanceof HTMLInputElement && infoColumnColors.checked !== storage.infoColumnColors) infoColumnColors.checked = storage.infoColumnColors;
	});

	const onChange = (key: string) => (e: { target: { checked: boolean } }) => {
		storage[key] = e.target.checked;
	};
	return html`<div class="settings-section">
		<h3 class="settings-header">Display Tags</h3>
		<p class="settings-explainer">Display Quality Tags.</p>
		<label class="switch">
			<input type="checkbox" id="showTags" onChange=${onChange("showTags")} />
			<span class="slider" />
		</label>

		<br class="settings-spacer" />
		<h3 class="settings-header">Display Atmos Quality</h3>
		<p class="settings-explainer">Display the Atmos Quality tags.</p>
		<label class="switch">
			<input type="checkbox" id="showAtmosQuality" onChange=${onChange("showAtmosQuality")} />
			<span class="slider" />
		</label>

		<br class="settings-spacer" />
		<h3 class="settings-header">Show FLAC Info Border</h3>
		<p class="settings-explainer">Show a border around the FLAC Info</p>
		<label class="switch">
			<input type="checkbox" id="showFLACInfoBorder" onChange=${onChange("showFLACInfoBorder")} />
			<span class="slider" />
		</label>

		<br class="settings-spacer" />
		<h3 class="settings-header">Show FLAC Info Columns in Color</h3>
		<p class="settings-explainer">FLAC Info Columns will have the color of the tracks quality</p>
		<label class="switch">
			<input type="checkbox" id="infoColumnColors" onChange=${onChange("infoColumnColors")} />
			<span class="slider" />
		</label>
	</div>`;
};
