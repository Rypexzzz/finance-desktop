import { electronApi } from "../../lib/electron-api";

export async function getDashboardSummary(year: number, month: number) {
  const res = await electronApi.dashboard.getSummary({ year, month });
  if (!res.ok) throw new Error(res.error.message);
  return res.data;
}

export async function getMonthOverview(params: { year: number; month: number; type?: "all" | "income" | "expense" | "service"; categoryId?: number }) {
  const res = await electronApi.analytics.getMonthOverview(params);
  if (!res.ok) throw new Error(res.error.message);
  return res.data;
}

export async function getYearOverview(params: { year: number; type?: "all" | "income" | "expense" | "service"; categoryId?: number }) {
  const res = await electronApi.analytics.getYearOverview(params);
  if (!res.ok) throw new Error(res.error.message);
  return res.data;
}

export async function getCategoryBreakdown(params: { year: number; month?: number; type?: "all" | "income" | "expense" | "service"; categoryId?: number }) {
  const res = await electronApi.analytics.getCategoryBreakdown(params);
  if (!res.ok) throw new Error(res.error.message);
  return res.data;
}

export async function getMonthlyTrend(year: number) {
  const res = await electronApi.analytics.getMonthlyTrend({ year });
  if (!res.ok) throw new Error(res.error.message);
  return res.data;
}

export async function getMonthComparison(year: number, month: number) {
  const res = await electronApi.analytics.getMonthComparison({ year, month });
  if (!res.ok) throw new Error(res.error.message);
  return res.data;
}
