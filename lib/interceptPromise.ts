import { intercept } from "@neptune";
import { ActionType, CallbackFunction, PayloadActionTypeTuple } from "neptune-types/api/intercept";

export const interceptPromise = <RESAT extends ActionType, REJAT extends ActionType>(resActionType: RESAT[], rejActionType: REJAT[], timeoutMs = 5000): Promise<PayloadActionTypeTuple<RESAT>> => {
	let res: CallbackFunction<RESAT>;
	let rej: (err: PayloadActionTypeTuple<REJAT> | string) => void;
	const p = new Promise<PayloadActionTypeTuple<RESAT>>((_res, _rej) => {
		res = _res;
		rej = _rej;
	});
	const unloadRes = intercept(resActionType, res!, true);
	const unloadRej = intercept(rejActionType, rej!, true);
	const timeout = setTimeout(() => rej(`${rejActionType}_TIMEOUT`), timeoutMs);
	return p.finally(() => {
		clearTimeout(timeout);
		unloadRes();
		unloadRej();
	});
};
