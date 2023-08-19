const https = require("https");
import { getState } from "@neptune/store";

export const getHeaders = () => {
	const state = getState();
	return {
		Authorization: `Bearer ${state.session.oAuthAccessToken}`,
		"x-tidal-token": state.session.apiToken,
	};
};

export const fetchy = (url, onProgress) =>
	new Promise((resolve, reject) => {
		const req = https.request(
			url,
			{
				headers: getHeaders(),
			},
			(res) => {
				const total = parseInt(res.headers["content-length"], 10);
				let downloaded = 0;
				const chunks = [];

				res.on("data", (chunk) => {
					chunks.push(chunk);
					downloaded += chunk.length;
					if (onProgress !== undefined) onProgress({ total, downloaded, percent: (downloaded / total) * 100 });
				});
				res.on("end", () => {
					// Chunks is an array of Buffer objects.
					const chunkyBuffer = Buffer.concat(chunks);
					onProgress({ total, downloaded: total, percent: 100 });
					resolve(chunkyBuffer);
				});
			}
		);
		req.on("error", reject);
		req.end();
	});
