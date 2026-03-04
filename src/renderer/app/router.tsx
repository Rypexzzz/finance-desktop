import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./layout/AppShell";
import { TransactionsPage } from "../pages/TransactionsPage";
import { AnalyticsPage } from "../pages/AnalyticsPage";
import { GoalsPage } from "../pages/GoalsPage";
import { DebtsPage } from "../pages/DebtsPage";
import { SettingsPage } from "../pages/SettingsPage";

export function AppRouter() {
  return (
    <HashRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<Navigate to="/transactions" replace />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/goals" element={<GoalsPage />} />
          <Route path="/debts" element={<DebtsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </AppShell>
    </HashRouter>
  );
}
