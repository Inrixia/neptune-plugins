import { removeLimits, restoreLimits } from "./size.native";

removeLimits();
export const onUnload = restoreLimits;
