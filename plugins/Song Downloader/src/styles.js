import { appendStyle } from "@neptune/utils";

export const unloadStyles = appendStyle(`
.download-button {
	align-items: center;
	display: flex;
	font-weight: 500;
	padding: 14px 16px;
	width: 100%;
	flex-grow: 1;
	height: 1.72rem;
	color: #b878ff;
}
.download-button:hover {
	background-color: #9e46ff;
	color: #fff;
}

#qualityDropdown {
    padding: 10px;
    width: 200px;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    appearance: none;
    background-color: #2f2f2f;
    color: #ffffff;
    cursor: pointer;
}

#qualityDropdown:hover {
    border-color: #b0b0b0;
}

#qualityDropdown:focus {
    outline: none;
    border-color: #4f4f4f;
}

.settings-section {
    color: #ffffff;
    padding: 20px;
    background-color: rgb(24, 24, 27);
}

.settings-header {
    font-size: 1.2em;
    margin-bottom: 5px;
    font-weight: bold;
}

.settings-explainer {
    font-size: 0.9em;
    margin-bottom: 15px;
    opacity: 0.85;
}
`);
