import { ipcMain } from "electron";
import * as nativeBridge from "./native";

type UnsafeReturnType<T> = T extends (...args: any[]) => infer R ? R : any;
type UnsafeParameters<T> = T extends (...args: infer P) => any ? P : never;
type PromisefulModule<M> = {
	[K in keyof M]: M[K] extends Function ? (UnsafeReturnType<M[K]> extends PromiseLike<unknown> ? M[K] : (...args: UnsafeParameters<M[K]>) => Promise<UnsafeReturnType<M[K]>>) : () => Promise<M[K]>;
};

export type NativeBridge = PromisefulModule<typeof nativeBridge>;
ipcMain.removeHandler("___nativeBridge___");
ipcMain.handle("___nativeBridge___", (_, method: keyof NativeBridge, ...args) => {
	if (nativeBridge[method] === undefined) throw new Error(`Method "${method}" not found! Available methods: ${Object.keys(nativeBridge).join(", ")}.`);
	// @ts-ignore Yea this is gonna cry we dont care
	return nativeBridge[method](...args);
});
