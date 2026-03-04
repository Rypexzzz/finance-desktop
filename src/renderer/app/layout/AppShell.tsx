import { NavLink, useLocation } from "react-router-dom";
import type { PropsWithChildren } from "react";
import { useState } from "react";
import { SettingsPanel } from "../../features/settings/components/SettingsPanel";

const navItems = [
  { to: "/transactions", label: "Операции" },
  { to: "/analytics", label: "Аналитика" },
  { to: "/goals", label: "Цели" },
  { to: "/debts", label: "Долги" }
];

export function AppShell({ children }: PropsWithChildren) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className={`app-shell ${collapsed ? "collapsed" : ""}`}>
      <aside className="sidebar">
        <button className="btn ghost sidebar-toggle" onClick={() => setCollapsed((prev) => !prev)}>
          {collapsed ? "→" : "←"}
        </button>
        <nav className="nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
              title={item.label}
            >
              {collapsed ? item.label[0] : item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="main-layout">
        <header className="topbar">
          <div className="topbar-title">
            {navItems.find((i) => i.to === location.pathname)?.label ?? "Приложение"}
          </div>
          <button className="btn ghost settings-trigger" onClick={() => setIsSettingsOpen(true)} title="Настройки" aria-label="Открыть настройки">
            ⚙️
          </button>
        </header>

        <main className="content">{children}</main>
      </div>

      {isSettingsOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Настройки" onClick={() => setIsSettingsOpen(false)}>
          <div className="modal settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header settings-modal-header">
              <h3>Настройки</h3>
              <button className="btn ghost" onClick={() => setIsSettingsOpen(false)}>Закрыть</button>
            </div>
            <p className="muted settings-modal-subtitle">Две полноценные темы интерфейса: светлая и тёмная.</p>
            <SettingsPanel className="settings-grid" />
          </div>
        </div>
      )}
    </div>
  );
}
