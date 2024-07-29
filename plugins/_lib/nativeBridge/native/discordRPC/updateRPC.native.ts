import type { SetActivity } from "@xhayper/discord-rpc";
import { DiscordRPC } from "./DiscordRPC.native";

const rpc = new DiscordRPC("1130698654987067493");

export const onRpcCleanup = () => rpc.cleanup();
export const updateRPC = async (activity: SetActivity) => {
	const client = await rpc.getClient();
	return client.user.setActivity(activity);
};
