import { Client } from "@xhayper/discord-rpc";
const onCleanupErr = (err: Error) =>
	console.warn("Encountered error while cleaning up DiscordRPC", err);

type ClientWithUser = Client & { user: NonNullable<Client["user"]> };

export class DiscordRPC {
	private rpcClient: Client;

	constructor(private readonly clientId: string) {
		this.rpcClient = new Client({
			transport: { type: "ipc" },
			clientId,
		});
	}

	async getClient(): Promise<ClientWithUser> {
		try {
			if (this.rpcClient.transport.isConnected && this.rpcClient.user)
				return this.rpcClient as ClientWithUser;

			await this.rpcClient.connect();

			if (!this.rpcClient.user || !this.rpcClient.transport.isConnected) {
				throw new Error("Failed to obtain RPC client or user");
			}

			return this.rpcClient as ClientWithUser;
		} catch (err) {
			await this.cleanup(true);
			throw err;
		}
	}

	async cleanup(clearActivity: boolean = true) {
		if (clearActivity) {
			await this.rpcClient.user?.clearActivity().catch(onCleanupErr);
		}

		await this.rpcClient.destroy().catch(onCleanupErr);
	}
}
