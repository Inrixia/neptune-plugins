export const debounce = <T extends (...args: any[]) => any>(func: T, wait: number): ((...args: Parameters<T>) => void) => {
	let timeout: NodeJS.Timeout | null;
	return async function (this: ThisParameterType<T>, ...args: Parameters<T>) {
		const context = this;
		if (timeout) clearTimeout(timeout);
		timeout = setTimeout(async () => {
			timeout = null;
			func.apply(context, args);
		}, wait);
	};
};
