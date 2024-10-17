import { interceptActions } from "@inrixia/lib/intercept/interceptActions";

import { startClientIpcLogging, stopClientIpcLogging } from "./clientIpcLogging";
import { startNativeIpcLogging, stopNativeIpcLogging } from "./test.native";

import { Tracer } from "@inrixia/lib/trace";
export const trace = Tracer("[test]");

const unloadIntercept = interceptActions(/.*/, trace.log);
startNativeIpcLogging().catch(trace.err.withContext("Failed to start native IPC logging"));
startClientIpcLogging().catch(trace.err.withContext("Failed to start client IPC logging"));
export const onUnload = () => {
	unloadIntercept?.();
	stopNativeIpcLogging().catch(trace.err.withContext("Failed to stop native IPC logging"));
	stopClientIpcLogging().catch(trace.err.withContext("Failed to stop client IPC logging"));
};
