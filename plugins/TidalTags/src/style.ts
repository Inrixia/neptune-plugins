import { appendStyle } from "@neptune/utils";
import { settingsCSS } from "../../../lib/css/settings";

appendStyle(`
${settingsCSS}
.quality-tag-container {
	display: inline-flex;
	height: 24px;
	font-size: 12px;
	line-height: 24px;
}
.quality-tag {
	justify-content: center;
	align-items: center;
	padding: 0 8px;
	border-radius: 6px;
	background-color: #222222;
	box-sizing: border-box;
	transition: background-color 0.2s;
	margin-left: 5px;
}

/* Toggle Switch Styles */
.switch {
	position: relative;
	display: inline-block;
	width: 60px;
	height: 34px;
}

.switch input {
	opacity: 0;
	width: 0;
	height: 0;
}

.slider {
	position: absolute;
	cursor: pointer;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: #ccc;
	transition: 0.4s;
	border-radius: 17px; /* Rounded corners */
}

.slider:before {
	position: absolute;
	content: "";
	height: 26px;
	width: 26px;
	left: 4px;
	bottom: 4px;
	background-color: white;
	transition: 0.4s;
	border-radius: 50%;  /* Fully rounded corners */
}

input:checked + .slider {
	background-color: #2196F3;
}

input:checked + .slider:before {
	transform: translateX(26px);
}
`);
