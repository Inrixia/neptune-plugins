import { interceptActions } from "@inrixia/lib/intercept/interceptActions";

export const onUnload = interceptActions(/.*/, console.log);
