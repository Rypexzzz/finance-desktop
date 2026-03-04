import { SettingsPanel } from "../features/settings/components/SettingsPanel";

export function SettingsPage() {
  return (
    <div className="page-stack">
      <div><h1>Настройки</h1><p className="muted">Две полноценные темы интерфейса: светлая и тёмная.</p></div>
      <SettingsPanel />
    </div>
  );
}
