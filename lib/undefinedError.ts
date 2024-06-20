export const undefinedWarn = (context?: string) => (err: Error) => {
	if (context !== undefined) console.warn(context, err);
	else console.warn(err);
	return undefined;
};
