import { NavLink, useLocation } from "react-router-dom";
import type { PropsWithChildren } from "react";

const navItems = [
  { to: "/dashboard", label: "Дашборд" },
  { to: "/transactions", label: "Операции" },
  { to: "/analytics", label: "Аналитика" },
  { to: "/goals", label: "Цели" },
  { to: "/debts", label: "Долги" },
  { to: "/settings", label: "Настройки" }
];

export function AppShell({ children }: PropsWithChildren) {
  const location = useLocation();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">💰 Finance Desktop</div>
        <nav className="nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="main-layout">
        <header className="topbar">
          <div className="topbar-title">
            {navItems.find((i) => i.to === location.pathname)?.label ?? "Приложение"}
          </div>
          <div className="topbar-subtitle">Локально • SQLite • Офлайн</div>
        </header>

        <main className="content">{children}</main>
      </div>
    </div>
  );
}