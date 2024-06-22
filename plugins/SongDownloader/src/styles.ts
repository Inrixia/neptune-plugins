import { setStyle } from "../../../lib/css/setStyle";

const styles = `
.download-button {
	align-items: center;
	display: flex;
	font-weight: 500;
	padding: 20px 16px;
	width: 100%;
	flex-grow: 1;
	color: #b878ff;
    position: relative;
}
.download-button:hover {
	background-color: #9e46ff;
	color: #fff;
}
.download-button::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: var(--progress, 0); /* Initially set to 0 */
    background: rgba(255, 255, 255, 0.25); /* Loading bar color */
    z-index: 1;
}
.download-button.loading {
    background-color: #9e46ff;
    cursor: not-allowed;
    color: #fff;
}
.download-button span {
    z-index: 2;
    position: relative;
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
`;

setStyle(styles, "neptune-downloader");
