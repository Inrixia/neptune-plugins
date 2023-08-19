const https = require("https");
import { getState } from "@neptune/store";

export const getHeaders = () => {
	const state = getState();
	return {
		Authorization: `Bearer ${state.session.oAuthAccessToken}`,
		"x-tidal-token": state.session.apiToken,
	};
};

export const fetchy = (url) =>
	new Promise((resolve, reject) => {
		const req = https.request(
			url,
			{
				headers: getHeaders(),
			},
			(res) => {
				console.log(res);
				const chunks = [];
				res.on("data", (chunk) => chunks.push(chunk));
				res.on("end", () => {
					// Chunks is an array of Buffer objects.
					const chunkyBuffer = Buffer.concat(chunks);
					resolve(chunkyBuffer);
				});
			}
		);
		req.on("error", reject);
		req.end();
	});
