import { modules } from "@neptune";

export const findModuleFunction = <T>(propertyName: string, propertyType: string): T | undefined => {
	for (const module of modules) {
		if (typeof module?.exports !== "object") continue;
		for (const _key in module.exports) {
			const property = module.exports[_key]?.[propertyName];
			if (typeof property === propertyType) return property;
		}
	}
};
