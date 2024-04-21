import { actions, store } from "@neptune";
const timeout = setInterval(() => {
	const playerState = store.getState().player;
	// @ts-expect-error state.boombox is now state.player
	if (playerState.activeDeviceMode === "shared") {
		// @ts-expect-error state.boombox is now state.player
		actions.player.setDeviceMode("exclusive");
	}
}, 5000);
export const onUnload = () => clearTimeout(timeout);
