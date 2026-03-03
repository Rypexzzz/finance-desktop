import { getDb } from "../client";
import type { AppSettings, AppTheme } from "../../../shared/types/settings";

type Row = { theme: AppTheme; currency: "RUB"; locale: "ru-RU" };

export function getSettings(): AppSettings {
  const db = getDb();
  const row = db.prepare("SELECT theme, currency, locale FROM app_settings WHERE id = 1").get() as Row | undefined;
  if (row) {
    const normalizedTheme: AppTheme = row.theme === "light" ? "light" : "dark";
    if (normalizedTheme !== row.theme) {
      db.prepare("UPDATE app_settings SET theme = ?, updated_at = datetime('now') WHERE id = 1").run(normalizedTheme);
    }
    return { ...row, theme: normalizedTheme };
  }

  db.prepare(
    "INSERT INTO app_settings (id, theme, currency, locale, created_at, updated_at) VALUES (1, 'dark', 'RUB', 'ru-RU', datetime('now'), datetime('now'))"
  ).run();

  return { theme: "dark", currency: "RUB", locale: "ru-RU" };
}

export function setTheme(theme: AppTheme): AppTheme {
  const db = getDb();
  db.prepare(
    "UPDATE app_settings SET theme = ?, updated_at = datetime('now') WHERE id = 1"
  ).run(theme);
  return theme;
}
