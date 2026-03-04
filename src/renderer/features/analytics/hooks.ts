import { useQuery } from "@tanstack/react-query";
import {
  getCategoryBreakdown,
  getDashboardSummary,
  getMonthComparison,
  getMonthlyTrend,
  getMonthOverview,
  getYearOverview
} from "./api";

export function useDashboardSummary(year: number, month: number) {
  return useQuery({
    queryKey: ["dashboard-summary", year, month],
    queryFn: () => getDashboardSummary(year, month)
  });
}

export function useMonthOverview(params: {
  year: number;
  month: number;
  type?: "all" | "income" | "expense" | "service";
  categoryId?: number;
}) {
  return useQuery({
    queryKey: ["analytics-month-overview", params],
    queryFn: () => getMonthOverview(params)
  });
}

export function useYearOverview(params: {
  year: number;
  type?: "all" | "income" | "expense" | "service";
  categoryId?: number;
}) {
  return useQuery({
    queryKey: ["analytics-year-overview", params],
    queryFn: () => getYearOverview(params)
  });
}

export function useCategoryBreakdown(params: {
  year: number;
  month?: number;
  type?: "all" | "income" | "expense" | "service";
  categoryId?: number;
}) {
  return useQuery({
    queryKey: ["analytics-category-breakdown", params],
    queryFn: () => getCategoryBreakdown(params)
  });
}

export function useMonthlyTrend(year: number) {
  return useQuery({
    queryKey: ["analytics-monthly-trend", year],
    queryFn: () => getMonthlyTrend(year)
  });
}

export function useMonthComparison(year: number, month: number) {
  return useQuery({
    queryKey: ["analytics-month-comparison", year, month],
    queryFn: () => getMonthComparison(year, month)
  });
}
