import { requestStream } from "../../../lib/fetchy";
import { findModuleFunction } from "../../../lib/findModuleFunction";
import type crypto from "crypto";
import { toBuffer } from "../../SongDownloader/src/lib/toBuffer";
const { createHash } = <typeof crypto>require("crypto");

const lastFmSecret = findModuleFunction<string>("lastFmSecret", "string");
const lastFmApiKey = findModuleFunction<string>("lastFmApiKey", "string");

if (lastFmSecret === undefined) throw new Error("Last.fm secret not found");
if (lastFmApiKey === undefined) throw new Error("Last.fm API key not found");

// @ts-expect-error Remove this when types are available
import { storage } from "@plugin";

export type NowPlayingOpts = {
	track: string;
	artist: string;
	album?: string;
	trackNumber?: string;
	context?: string;
	mbid?: string;
	duration?: string;
	albumArtist?: string;
};

export interface ScrobbleOpts extends NowPlayingOpts {
	timestamp: string;
	streamId?: string;
	chosenByUser?: string;
}

type LastFmSession = {
	name: string;
	key: string;
	subscriber: number;
};

import type https from "https";
const { request } = <typeof https>require("https");

export class LastFM {
	private static generateApiSignature = (params: Record<string, string>) => {
		const sig =
			Object.keys(params)
				.filter((key) => key !== "format" && key !== undefined)
				.sort()
				.map((key) => `${key}${params[key]}`)
				.join("") + lastFmSecret;
		return createHash("md5").update(sig, "utf8").digest("hex");
	};

	private static sendRequest = async (method: string, params?: Record<string, string>, reqMethod = "GET") => {
		params ??= {};
		params.method = method;
		params.api_key = lastFmApiKey!;
		params.format = "json";
		params.api_sig = this.generateApiSignature(params);

		const data = await new Promise<any>((resolve, reject) => {
			const req = request(`https://ws.audioscrobbler.com/2.0/`, {
				headers: {
					"Content-type": "application/x-www-form-urlencoded",
					"Accept-Charset": "utf-8",
					"User-Agent": navigator.userAgent,
				},
				method: "POST",
			});
			req.on("error", reject);
			req.on("response", (res) => toBuffer(res).then((buffer) => resolve(JSON.parse(buffer.toString()))));
			req.write(new URLSearchParams(params).toString());
			req.end();
		});

		if (data.message) throw new Error(data.message);
		else return data;
	};

	private static getSession = async (): Promise<LastFmSession> => {
		if (storage.lastFmSession !== undefined) return storage.lastFmSession;
		const { token } = await this.sendRequest("auth.getToken");
		window.open(`https://www.last.fm/api/auth/?api_key=${lastFmApiKey}&token=${token}`, "_blank");
		const result = window.confirm("Continue with last.fm authentication? Ensure you have given TIDAL permission on the opened page.");
		if (!result) throw new Error("Authentication cancelled");
		const { session } = await this.sendRequest("auth.getSession", { token });
		return (storage.lastFmSession = session);
	};

	public static async updateNowPlaying(opts: NowPlayingOpts) {
		const session = await this.getSession();
		return this.sendRequest(
			"track.updateNowPlaying",
			{
				...opts,
				sk: session.key,
			},
			"POST"
		);
	}

	public static async scrobble(opts?: ScrobbleOpts) {
		const session = await this.getSession();
		return this.sendRequest(
			"track.scrobble",
			{
				...opts,
				sk: session.key,
			},
			"POST"
		);
	}
}
