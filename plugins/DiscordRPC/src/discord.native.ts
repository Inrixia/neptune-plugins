import { Client, type SetActivity } from "@xhayper/discord-rpc";
import electron from "electron";

let rpcClient: Client | null = null;
async function getClient() {
	const isAvailable =
		rpcClient && rpcClient.transport.isConnected && rpcClient.user;
	if (isAvailable) return rpcClient!;

	if (rpcClient) await rpcClient.destroy();
	rpcClient = new Client({ clientId: "1130698654987067493" });
	await rpcClient.connect();

	return rpcClient;
}

async function setActivity(event: any, activity?: SetActivity) {
	const client = await getClient();
	if (!client.user) return;
	if (!activity) return client.user.clearActivity();
	return client.user.setActivity(activity);
}

async function cleanup() {
	return rpcClient?.destroy();
}

electron.ipcMain.removeHandler("DISCORD_SET_ACTIVITY");
electron.ipcMain.removeHandler("DISCORD_CLEANUP");
electron.ipcMain.handle("DISCORD_SET_ACTIVITY", setActivity);
electron.ipcMain.handle("DISCORD_CLEANUP", cleanup);
