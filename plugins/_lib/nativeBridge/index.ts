import type * as nativeBridge from "./native";
import "./nativeBridge.native";

type UnsafeReturnType<T> = T extends (...args: any[]) => infer R ? R : any;
type UnsafeParameters<T> = T extends (...args: infer P) => any ? P : never;
type PromisefulModule<M> = {
	[K in keyof M]: M[K] extends Function
		? UnsafeReturnType<M[K]> extends PromiseLike<unknown>
			? (...args: UnsafeParameters<M[K]>) => UnsafeReturnType<M[K]>
			: (...args: UnsafeParameters<M[K]>) => Promise<UnsafeReturnType<M[K]>>
		: () => Promise<M[K]>;
};

const invoke: (method: string, ...args: any[]) => Promise<any> = (<any>window).electron.ipcRenderer.invoke;
module.exports = new Proxy(<PromisefulModule<typeof nativeBridge>>{}, {
	get:
		(_, key: string, __) =>
		(...args: any[]) =>
			invoke("___nativeBridge___", key, ...args).catch((err: Error) => {
				err.message = err.message.replaceAll("Error invoking remote method '___nativeBridge___': ", "");
				throw err;
			}),
	set: () => {
		throw new Error("You cannot set properties of nativeBridge");
	},
});
