import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./layout/AppShell";
import { TransactionsPage } from "../pages/TransactionsPage";
import { PlaceholderPage } from "../pages/PlaceholderPage";
import { DashboardPage } from "../pages/DashboardPage";

export function AppRouter() {
  return (
    <HashRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/analytics" element={<PlaceholderPage title="Аналитика (скоро)" />} />
          <Route path="/goals" element={<PlaceholderPage title="Цели (скоро)" />} />
          <Route path="/debts" element={<PlaceholderPage title="Долги (скоро)" />} />
          <Route path="/settings" element={<PlaceholderPage title="Настройки (скоро)" />} />
        </Routes>
      </AppShell>
    </HashRouter>
  );
}