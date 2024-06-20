import { interceptActions } from "../../../lib/interceptActions";

export const onUnload = interceptActions(/.*/, console.log);
