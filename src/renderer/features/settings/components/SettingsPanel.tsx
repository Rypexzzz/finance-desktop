import { useEffect } from "react";
import { useSetTheme, useSettings } from "../hooks";
import type { AppTheme } from "../../../../shared/types/settings";

type SettingsPanelProps = {
  className?: string;
};

export function SettingsPanel({ className = "card settings-grid" }: SettingsPanelProps) {
  const settingsQuery = useSettings();
  const setThemeMutation = useSetTheme();

  useEffect(() => {
    if (!settingsQuery.data) return;
    document.documentElement.dataset.theme = settingsQuery.data.theme;
  }, [settingsQuery.data]);

  const theme = settingsQuery.data?.theme ?? "dark";

  const onThemeChange = async (nextTheme: AppTheme) => {
    await setThemeMutation.mutateAsync(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
  };

  return (
    <div className={className}>
      <label>
        Тема интерфейса
        <select value={theme} onChange={(e) => onThemeChange(e.target.value as AppTheme)}>
          <option value="dark">Темная</option>
          <option value="light">Светлая</option>
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
  );
}
