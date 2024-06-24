export const retryPending = <V>(getter: () => Promise<V>): Promise<V | undefined> =>
	new Promise((res) => {
		const timeout = setTimeout(() => {
			clearInterval(interval);
			res(undefined);
		}, 5000);
		const interval = setInterval(async () => {
			const value = await getter();
			if (value !== undefined) {
				res(value);
				clearInterval(interval);
				clearTimeout(timeout);
			}
		}, 100);
	});
