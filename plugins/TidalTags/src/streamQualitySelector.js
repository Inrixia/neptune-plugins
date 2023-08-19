import { tagData, Quality } from "./index.js";

const streamQualitySelector = "data-test-media-state-indicator-streaming-quality";
export const setStreamQualityIndicator = () => {
	const streamQuality = document.querySelector(`[${streamQualitySelector}]`);
	const currentQuality = streamQuality.getAttribute(streamQualitySelector);
	const qualityElement = streamQuality.children[0];
	if (qualityElement === null) return;
	switch (currentQuality) {
		// MQA
		case "HI_RES":
			if (qualityElement.textContent === "MQA") return;
			qualityElement.textContent = "MQA";

			qualityElement.style.backgroundColor = null;
			qualityElement.style.color = tagData[Quality.MQA].color;
			break;
		case "HI_RES_LOSSLESS":
			if (qualityElement.textContent === "HIRES") return;
			qualityElement.textContent = "HI-RES";

			qualityElement.style.backgroundColor = null;
			qualityElement.style.color = tagData[Quality.HiRes].color;
			break;
		default:
			qualityElement.style.backgroundColor = null;
			qualityElement.style.color = null;
	}
};
