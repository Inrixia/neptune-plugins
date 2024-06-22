import { SharedObjectStore } from "./sharedStorage";

export default async () => {
	await SharedObjectStore.close();
};
