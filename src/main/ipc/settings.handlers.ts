import { ipcMain } from "electron";
import { fail, ok, toUnknownError } from "../utils/errors";
import { getSettingsService, setThemeService } from "../services/settings.service";
import type { AppTheme } from "../../shared/types/settings";

export function registerSettingsHandlers() {
  ipcMain.handle("settings:get", async () => {
    try {
      return ok(getSettingsService());
    } catch (error) {
      if (error instanceof Error) return fail("VALIDATION_ERROR", error.message);
      return toUnknownError(error);
    }
  });

  ipcMain.handle("settings:setTheme", async (_event, args: { theme: AppTheme }) => {
    try {
      return ok(setThemeService(args.theme));
    } catch (error) {
      if (error instanceof Error) return fail("VALIDATION_ERROR", error.message);
      return toUnknownError(error);
    }
  });
}
