import { html } from "@neptune/voby";
// @ts-expect-error Remove this when types are available
import { storage } from "@plugin";

import { setStreamQualityIndicator } from "./streamQualitySelector";
import { updateTrackLists } from "./updateTrackElements";

storage.showTags ??= true;
storage.showAllQualities ??= true;
storage.showAtmosQuality ??= true;
storage.showFLACInfo ??= true;
storage.showFLACInfoBorder ??= true;
export const Settings = () => {
	setTimeout(() => {
		const showTags = document.getElementById("showTags");
		if (showTags instanceof HTMLInputElement && showTags.checked !== storage.showTags) showTags!.checked = storage.showTags;

		const showFLACInfo = document.getElementById("showFLACInfo");
		if (showFLACInfo instanceof HTMLInputElement && showFLACInfo.checked !== storage.showFLACInfo) showFLACInfo!.checked = storage.showFLACInfo;

		const showFLACInfoBorder = document.getElementById("showFLACInfoBorder");
		if (showFLACInfoBorder instanceof HTMLInputElement && showFLACInfoBorder.checked !== storage.showFLACInfoBorder) showFLACInfoBorder.checked = storage.showFLACInfoBorder;

		const showAllQualities = document.getElementById("showAllQualities");
		if (showAllQualities instanceof HTMLInputElement && showAllQualities.checked !== storage.showAllQualities) showAllQualities.checked = storage.showAllQualities;

		const showAtmosQuality = document.getElementById("showAtmosQuality");
		if (showAtmosQuality instanceof HTMLInputElement && showAtmosQuality.checked !== storage.showAtmosQuality) showAtmosQuality.checked = storage.showAtmosQuality;
	});

	const onChange = (key: string) => (e: { target: { checked: boolean } }) => {
		storage[key] = e.target.checked;
		setStreamQualityIndicator();
		updateTrackLists();
	};
	return html`<div class="settings-section">
		<h3 class="settings-header">Display Tags</h3>
		<p class="settings-explainer">Display Quality Tags.</p>
		<label class="switch">
			<input type="checkbox" id="showTags" onChange=${onChange("showTags")} />
			<span class="slider" />
		</label>

		<h3 class="settings-header">Display all Qualities</h3>
		<p class="settings-explainer">Display MQA if HiRes is avalible.</p>
		<label class="switch">
			<input type="checkbox" id="showAllQualities" onChange=${onChange("showAllQualities")} />
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
		<h3 class="settings-header">Show FLAC Info</h3>
		<p class="settings-explainer">Show Sample Rate/Bit Depth</p>
		<label class="switch">
			<input type="checkbox" id="showFLACInfo" onChange=${onChange("showFLACInfo")} />
			<span class="slider" />
		</label>

		<br class="settings-spacer" />
		<h3 class="settings-header">Show FLAC Info Border</h3>
		<p class="settings-explainer">Show a border around the FLAC Info</p>
		<label class="switch">
			<input type="checkbox" id="showFLACInfoBorder" onChange=${onChange("showFLACInfoBorder")} />
			<span class="slider" />
		</label>
	</div>`;
};
