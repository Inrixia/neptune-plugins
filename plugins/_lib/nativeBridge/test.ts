import { invoke } from ".";

export const startNativeIpcLogging = invoke("startNativeIpcLogging");
export const stopNativeIpcLogging = invoke("stopNativeIpcLogging");
export const getClientMessageChannelEnum = invoke("getClientMessageChannelEnum");
