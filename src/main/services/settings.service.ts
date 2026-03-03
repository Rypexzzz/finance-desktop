import { getSettings, setTheme } from "../db/queries/settings.repo";
import type { AppTheme } from "../../shared/types/settings";

export function getSettingsService() {
  return getSettings();
}

export function setThemeService(theme: AppTheme) {
  if (!["light", "dark", "system"].includes(theme)) {
    throw new Error("Некорректная тема");
  }
  return { theme: setTheme(theme) };
}
