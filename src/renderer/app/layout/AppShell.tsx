import { NavLink, useLocation } from "react-router-dom";
import type { PropsWithChildren } from "react";
import { useState } from "react";
import { SettingsPanel } from "../../features/settings/components/SettingsPanel";

const navItems = [
  { to: "/transactions", label: "Операции", icon: "💳" },
  { to: "/analytics", label: "Аналитика", icon: "📊" },
  { to: "/goals", label: "Цели", icon: "🎯" },
  { to: "/debts", label: "Долги", icon: "🏦" }
];

const PAGE_SUBTITLES: Record<string, string> = {
  "/transactions": "Управление доходами и расходами",
  "/analytics": "Тренды, сводка и структура расходов",
  "/goals": "Накопления и финансовые цели",
  "/debts": "Кредиты и погашения"
};

function formatCurrentDate(): string {
  const now = new Date();
  return now.toLocaleDateString("ru-RU", {
    weekday: "short",
    day: "numeric",
    month: "long"
  });
}

export function AppShell({ children }: PropsWithChildren) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const currentNav = navItems.find((i) => i.to === location.pathname);

  return (
    <div className={`app-shell ${collapsed ? "collapsed" : ""}`}>
      <aside className="sidebar">
        <button className="btn ghost sidebar-toggle" onClick={() => setCollapsed((prev) => !prev)}>
          {collapsed ? "→" : "←"}
        </button>
        {!collapsed && (
          <div className="brand">
            <span style={{ fontSize: 20 }}>💰</span>
            Finance Desktop
          </div>
        )}
        <nav className="nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
              title={item.label}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="main-layout">
        <header className="topbar">
          <div className="topbar-left">
            <div className="topbar-title">
              {currentNav?.label ?? "Приложение"}
            </div>
            <div className="topbar-subtitle">
              {PAGE_SUBTITLES[location.pathname] ?? ""}
            </div>
          </div>
          <div className="topbar-right">
            <span className="topbar-date">{formatCurrentDate()}</span>
            <button className="btn ghost settings-trigger" onClick={() => setIsSettingsOpen(true)} title="Настройки" aria-label="Открыть настройки">
              ⚙️
            </button>
          </div>
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
