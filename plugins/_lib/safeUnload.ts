import { SharedObjectStore } from "./storage/SharedObjectStore";

export default async () => {
	await SharedObjectStore.close();
};
