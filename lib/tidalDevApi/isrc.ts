import { ISRCResponse } from "./types/ISRC";
import { requestStream, rejectNotOk, toJson } from "../fetch";
import { getToken } from "./auth";

export const fetchIsrc = async (isrc: string, limit?: number) =>
	requestStream(`https://openapi.tidal.com/tracks/byIsrc?isrc=${isrc}&countryCode=US&limit=${limit ?? 100}`, {
		headers: {
			Authorization: `Bearer ${await getToken()}`,
			"Content-Type": "application/vnd.tidal.v1+json",
		},
	})
		.then(rejectNotOk)
		.then(toJson<ISRCResponse>);
