import { interceptActions } from "../../_lib/intercept/interceptActions";

export const onUnload = interceptActions(/.*/, console.log);
