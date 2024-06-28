import { SwitchSetting } from "@inrixia/lib/components/SwitchSetting";
import { interceptActions } from "@inrixia/lib/intercept/interceptActions";
import { startNativeIpcLogging, stopNativeIpcLogging } from "@inrixia/lib/nativeBridge/test";

import { Tracer } from "@inrixia/lib/trace";
const trace = Tracer("[test]");

const unloadIntercept = interceptActions(/.*/, trace.log);
startNativeIpcLogging().catch(trace.err.withContext("Failed to start native IPC logging"));
export const onUnload = () => {
	unloadIntercept?.();
	stopNativeIpcLogging().catch(trace.err.withContext("Failed to stop native IPC logging"));
};
