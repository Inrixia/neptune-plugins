import { requestJsonCached } from "@inrixia/lib/nativeBridge/request";
import { ShazamData } from "./shazamTypes";
import { v4 } from "uuid";

export const fetchShazamData = async (signature: { samplems: number; uri: string }) =>
	requestJsonCached<ShazamData>(
		`https://amp.shazam.com/discovery/v5/en-US/US/iphone/-/tag/${v4()}/${v4()}?sync=true&webv3=true&sampling=true&connected=&shazamapiversion=v3&sharehub=true&hubv5minorversion=v5.1&hidelb=true&video=v3`,
		{
			headers: { "Content-Type": "application/json" },
			method: "POST",
			body: JSON.stringify({ signature }),
		}
	);
