import { useEffect } from "react";
import { useSetTheme, useSettings } from "../features/settings/hooks";
import type { AppTheme } from "../../shared/types/settings";

function resolveTheme(theme: AppTheme) {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return theme;
}

export function SettingsPage() {
  const settingsQuery = useSettings();
  const setThemeMutation = useSetTheme();

  useEffect(() => {
    if (!settingsQuery.data) return;
    document.documentElement.dataset.theme = resolveTheme(settingsQuery.data.theme);
  }, [settingsQuery.data]);

  const theme = settingsQuery.data?.theme ?? "system";

  const onThemeChange = async (nextTheme: AppTheme) => {
    await setThemeMutation.mutateAsync(nextTheme);
    document.documentElement.dataset.theme = resolveTheme(nextTheme);
  };

  return (
    <div className="page-stack">
      <div><h1>Настройки</h1><p className="muted">Тема и базовые параметры из SQLite.</p></div>
      <div className="card settings-grid">
        <label>
          Тема интерфейса
          <select value={theme} onChange={(e) => onThemeChange(e.target.value as AppTheme)}>
            <option value="dark">Темная</option>
            <option value="light">Светлая</option>
            <option value="system">Системная</option>
          </select>
        </label>
        <div>
          <div className="stat-label">Регион</div>
          <div>{settingsQuery.data?.locale ?? "ru-RU"} • {settingsQuery.data?.currency ?? "RUB"}</div>
        </div>
        <div>
          <div className="stat-label">Версия</div>
          <div>{window.api ? "0.1.0" : "unknown"}</div>
        </div>
      </div>
    </div>
  );
}
