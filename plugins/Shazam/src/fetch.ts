import { ISRCResponse } from "./types/isrcTypes";
import { ShazamData } from "./types/shazamTypes";

const parseResponse = async <T>(responseP: Promise<Response> | Response): Promise<T> => {
	const response = await responseP;
	if (!response.ok) throw new Error(`Status ${response.status}`);
	return response.json();
};
export const fetchShazamData = async (signature: { samplems: number; uri: string }) => {
	return parseResponse<ShazamData>(
		fetch(`https://shazamwow.com/shazam`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ signature }),
		})
	);
};
export const fetchIsrc = async (isrc: string) => {
	return parseResponse<ISRCResponse>(fetch(`https://shazamwow.com/isrc?isrc=${isrc}&countryCode=US&limit=100`));
};
