import { Client } from "discord-rpc";
const onCleanupErr = (err: Error) => console.warn("Encountered error while cleaning up DiscordRPC", err);
export class DiscordRPC {
	public rpcClient?: Client;
	constructor(private readonly clientId: string) {}

	public isConnected() {
		// @ts-expect-error Types dont include internals like transport
		return !!this.rpcClient?.transport?.socket;
	}
	async ensureRPC(): Promise<Client> {
		try {
			if (this.rpcClient && this.isConnected()) return this.rpcClient;
			await this.cleanp(true);
			this.rpcClient = new Client({ transport: "ipc" });
			const ready = new Promise<void>((res, rej) => {
				const rejTimeout = setTimeout(() => rej(new Error("Timed out waiting for RPC to be ready")), 5000);
				this.rpcClient!.once("ready", () => {
					clearTimeout(rejTimeout);
					res();
				});
			});
			this.rpcClient = await this.rpcClient.login({ clientId: this.clientId });
			await ready;
			if (!this.isConnected()) return this.ensureRPC();
			return this.rpcClient;
		} catch (err) {
			await this.cleanp(true);
			throw err;
		}
	}
	async cleanp(clearActivity: boolean = true) {
		if (clearActivity) await this.rpcClient?.clearActivity().catch(onCleanupErr);
		await this.rpcClient?.destroy().catch(onCleanupErr);
		delete this.rpcClient;
	}
}
