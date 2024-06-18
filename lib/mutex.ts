export class Mutex {
	private _queue: (() => void)[] = [];
	private _isLocked: boolean = false;

	lock(): Promise<void> {
		return new Promise<void>((resolve) => {
			if (!this._isLocked) {
				this._isLocked = true;
				resolve();
			} else {
				this._queue.push(resolve);
			}
		});
	}

	unlock(): void {
		if (this._isLocked) {
			const nextResolve = this._queue.shift();
			if (nextResolve) {
				nextResolve();
			} else {
				this._isLocked = false;
			}
		}
	}
}
