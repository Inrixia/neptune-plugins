import { ContextMenu } from "./ContextMenu";
import { SharedObjectStore } from "./storage/SharedObjectStore";

export default async () => {
	await SharedObjectStore.close();
	await ContextMenu.onUnload();
};
