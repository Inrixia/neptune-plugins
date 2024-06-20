import { actions } from "@neptune";

export const messageError = (message: string) => (error?: Error) => {
	console.error(message, error);
	const errMessage = error ? `${message} - ${error.message}` : message;
	actions.message.messageError({ message: errMessage, category: "OTHER", severity: "ERROR" });
};
export const messageWarn = (message: string) => {
	console.warn(message);
	actions.message.messageWarn({ message, category: "OTHER", severity: "WARN" });
};
export const messageInfo = (message: string) => {
	console.info(message);
	actions.message.messageInfo({ message, category: "OTHER", severity: "INFO" });
};
