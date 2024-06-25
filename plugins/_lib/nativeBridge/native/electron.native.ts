import type { OpenDialogOptions, SaveDialogOptions, SaveDialogReturnValue, OpenDialogReturnValue } from "electron";
export type { OpenDialogOptions, SaveDialogOptions, SaveDialogReturnValue, OpenDialogReturnValue };
// @ts-expect-error
const _dialog = electron.dialog;
export const openDialog = (openDialogOptions?: OpenDialogOptions): OpenDialogReturnValue => _dialog.showOpenDialog(openDialogOptions);
export const saveDialog = (openDialogOptions?: SaveDialogOptions): SaveDialogReturnValue => _dialog.showSaveDialog(openDialogOptions);
