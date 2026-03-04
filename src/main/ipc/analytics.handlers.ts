import { ipcMain } from "electron";
import { fail, ok, toUnknownError } from "../utils/errors";
import {
  getCategoryBreakdownService,
  getDashboardSummaryService,
  getMonthComparisonService,
  getMonthOverviewService,
  getMonthlyTrendService,
  getYearOverviewService
} from "../services/analytics.service";

export function registerAnalyticsHandlers() {
  ipcMain.handle("dashboard:getSummary", async (_event, params: { year: number; month: number }) => {
    try {
      return ok(getDashboardSummaryService(params.year, params.month));
    } catch (error) {
      if (error instanceof Error) return fail("VALIDATION_ERROR", error.message);
      return toUnknownError(error);
    }
  });

  ipcMain.handle("analytics:getMonthOverview", async (_event, params: { year: number; month: number; type?: "all" | "income" | "expense" | "service"; categoryId?: number }) => {
    try {
      return ok(getMonthOverviewService(params));
    } catch (error) {
      if (error instanceof Error) return fail("VALIDATION_ERROR", error.message);
      return toUnknownError(error);
    }
  });

  ipcMain.handle("analytics:getYearOverview", async (_event, params: { year: number; type?: "all" | "income" | "expense" | "service"; categoryId?: number }) => {
    try {
      return ok(getYearOverviewService(params));
    } catch (error) {
      if (error instanceof Error) return fail("VALIDATION_ERROR", error.message);
      return toUnknownError(error);
    }
  });

  ipcMain.handle("analytics:getCategoryBreakdown", async (_event, params: { year: number; month?: number; type?: "all" | "income" | "expense" | "service"; categoryId?: number }) => {
    try {
      return ok(getCategoryBreakdownService(params));
    } catch (error) {
      if (error instanceof Error) return fail("VALIDATION_ERROR", error.message);
      return toUnknownError(error);
    }
  });

  ipcMain.handle("analytics:getMonthlyTrend", async (_event, params: { year: number }) => {
    try {
      return ok(getMonthlyTrendService(params.year));
    } catch (error) {
      if (error instanceof Error) return fail("VALIDATION_ERROR", error.message);
      return toUnknownError(error);
    }
  });

  ipcMain.handle("analytics:getMonthComparison", async (_event, params: { year: number; month: number }) => {
    try {
      return ok(getMonthComparisonService(params.year, params.month));
    } catch (error) {
      if (error instanceof Error) return fail("VALIDATION_ERROR", error.message);
      return toUnknownError(error);
    }
  });
}
