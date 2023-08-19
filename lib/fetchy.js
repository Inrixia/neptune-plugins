const https = require("https");
import { getState } from "@neptune/store";

export const getHeaders = () => {
	const state = getState();
	return {
		Authorization: `Bearer ${state.session.oAuthAccessToken}`,
		"x-tidal-token": state.session.apiToken,
	};
};

export const fetchy = (url, onProgress, byteRangeStart = 0, byteRangeEnd = null) =>
	new Promise((resolve, reject) => {
		const headers = getHeaders();
		if (byteRangeEnd !== null) {
			headers["Range"] = `bytes=${byteRangeStart}-${byteRangeEnd}`;
		}
		const req = https.request(
			url,
			{
				headers,
			},
			(res) => {
				let total;
				if (res.headers["content-range"]) {
					// Server supports byte range, parse total file size from header
					const match = /\/(\d+)$/.exec(res.headers["content-range"]);
					total = match ? parseInt(match[1], 10) : null;
				} else {
					total = parseInt(res.headers["content-length"], 10);
				}

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
