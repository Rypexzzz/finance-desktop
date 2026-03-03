import { NavLink, useLocation } from "react-router-dom";
import type { PropsWithChildren } from "react";
import { useState } from "react";

const navItems = [
  { to: "/transactions", label: "Операции" },
  { to: "/analytics", label: "Аналитика" },
  { to: "/goals", label: "Цели" },
  { to: "/debts", label: "Долги" },
  { to: "/settings", label: "Настройки" }
];

export function AppShell({ children }: PropsWithChildren) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`app-shell ${collapsed ? "collapsed" : ""}`}>
      <aside className="sidebar">
        <button className="btn ghost" onClick={() => setCollapsed((prev) => !prev)}>
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
        </header>

        <main className="content">{children}</main>
      </div>
    </div>
  );
}
