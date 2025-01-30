import { TApiTrack, TApiTracks } from "./types";
import { getToken } from "./auth";
import { requestJsonCached } from "../../native/request/requestJsonCached";

const fetchTidal = async <T>(url: string) =>
	requestJsonCached<T>(url, {
		headers: {
			Authorization: `Bearer ${await getToken()}`,
			"Content-Type": "application/vnd.tidal.v1+json",
		},
	});

const baseURL = "https://openapi.tidal.com/v2";

export async function* fetchIsrcIterable(isrc: string): AsyncIterable<TApiTrack> {
	let resp = await fetchTidal<TApiTracks>(`${baseURL}/tracks?countryCode=US&filter[isrc]=${isrc}`);
	while (true) {
		if (resp?.data === undefined || resp.data.length === 0) break;
		yield* resp.data;
		if (resp.links.next === undefined) break;
		resp = await fetchTidal<TApiTracks>(`${baseURL}${resp.links.next}`);
	}
}
