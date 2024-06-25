import * as nativeBridge from "./native";

// Augment the module with the inferred types
declare module "." {
	export = nativeBridge;
}
