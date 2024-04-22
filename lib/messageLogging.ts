import { actions } from "@neptune";

export const messageError = (message: string) => actions.message.messageError({ message, category: "OTHER", severity: "ERROR" });
export const messageWarn = (message: string) => actions.message.messageWarn({ message, category: "OTHER", severity: "WARN" });
export const messageInfo = (message: string) => actions.message.messageInfo({ message, category: "OTHER", severity: "INFO" });
