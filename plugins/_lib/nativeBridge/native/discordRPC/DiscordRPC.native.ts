import { Client } from "@xhayper/discord-rpc";

type ClientWithUser = Client & { user: NonNullable<Client["user"]> };

export class DiscordRPC {
	private rpcClient: Client;
	private connectingPromise: Promise<ClientWithUser> | null = null;

	constructor(private readonly clientId: string) {
		this.rpcClient = new Client({
			transport: { type: "ipc" },
			clientId,
		});
	}

	async getClient(): Promise<ClientWithUser> {
		if (this.rpcClient.transport.isConnected && this.rpcClient.user) {
			return this.rpcClient as ClientWithUser;
		}

		if (this.connectingPromise) {
			return this.connectingPromise;
		}

		this.connectingPromise = this.connect();
		try {
			const client = await this.connectingPromise;
			return client;
		} finally {
			this.connectingPromise = null;
		}
	}

	private async connect(): Promise<ClientWithUser> {
		try {
			await this.rpcClient.connect();

			if (!this.rpcClient.user || !this.rpcClient.transport.isConnected) {
				throw new Error("Failed to obtain RPC client or user");
			}

			return this.rpcClient as ClientWithUser;
		} catch (err) {
			await this.cleanup();
			throw err;
		}
	}

	async cleanup() {
		try {
			await this.rpcClient.destroy();
		} catch (error) {
			console.warn(
				"Encountered error while cleaning up DiscordRPC",
				error
			);
		}
	}
}
