export default `
.quality-tag-container {
	display: inline-flex;
	height: 16px;
	font-size: 8px;
	line-height: 16px;
}
.quality-tag {
	justify-content: center;
	align-items: center;
	padding: 0 6px;
	border-radius: 5px;
	box-sizing: border-box;
	transition: background-color 0.2s;
	margin-left: 5px;
	letter-spacing: 0.97px;
	font-weight: 700;
}

.quality-tag-mqa {
	background-color: rgba(249, 186, 122, 0.3);
	color: rgb(249, 186, 122);
}

.quality-tag-hr {
	background-color: rgba(255, 212, 50, 0.3);
	color: rgb(255, 212, 50);
}

.quality-tag-atmos {
    color: rgb(255, 255, 255);
    background: linear-gradient(0.125turn, rgb(220, 57, 251), rgb(36, 80, 249));
	font-size: 12px;
    padding: 0 1px;
}
`;
