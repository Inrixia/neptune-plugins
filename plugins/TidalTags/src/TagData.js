export const Quality = {
	High: "LOSSLESS",
	MQA: "MQA",
	HiRes: "HIRES_LOSSLESS",
	Atmos: "DOLBY_ATMOS",
};
// Cache class name and text content pairs to reduce lookup time

export const tagData = {
	[Quality.MQA]: { className: "quality-tag", textContent: "MQA", color: "#F9BA7A" },
	[Quality.HiRes]: { className: "quality-tag", textContent: "HiRes", color: "#ffd432" },
	[Quality.Atmos]: { className: "quality-tag", textContent: "Atmos", color: "#0052a3" },
};
