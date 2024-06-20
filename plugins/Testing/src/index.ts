import { interceptActions } from "../../../lib/intercept/interceptActions";

export const onUnload = interceptActions(/.*/, console.log);
