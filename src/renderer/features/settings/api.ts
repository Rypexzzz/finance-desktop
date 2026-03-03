import { electronApi } from "../../lib/electron-api";
import type { AppTheme } from "../../../shared/types/settings";

export async function getSettings() {
  const res = await electronApi.settings.get();
  if (!res.ok) throw new Error(res.error.message);
  return res.data;
}

export async function setTheme(theme: AppTheme) {
  const res = await electronApi.settings.setTheme(theme);
  if (!res.ok) throw new Error(res.error.message);
  return res.data;
}
