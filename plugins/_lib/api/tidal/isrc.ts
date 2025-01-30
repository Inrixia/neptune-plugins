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
	let next: string | undefined = `${baseURL}/tracks?countryCode=US&filter[isrc]=${isrc}`;
	while (true) {
		if (next === undefined) break;
		const resp: TApiTracks = await fetchTidal<TApiTracks>(next);
		if (resp?.data === undefined || resp.data.length === 0) break;
		yield* resp.data;
		next = resp.links.next === undefined ? undefined : `${baseURL}${resp.links.next}`;
	}
}
