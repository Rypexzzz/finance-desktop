import { getDb } from "../db/client";
import type {
  AnalyticsCategoryBreakdownItem,
  AnalyticsMonthComparison,
  AnalyticsMonthlyTrendItem,
  AnalyticsOverview,
  DashboardSummary
} from "../../shared/types/analytics";

type AnalyticsFilters = {
  year: number;
  month?: number;
  type?: "all" | "income" | "expense" | "service";
  categoryId?: number;
};

function ensureMonth(month: number) {
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new Error("Некорректный месяц");
  }
}

function buildWhere(params: AnalyticsFilters) {
  const where: string[] = ["strftime('%Y', t.date) = ?"];
  const values: Array<string | number> = [String(params.year)];

  if (params.month !== undefined) {
    ensureMonth(params.month);
    where.push("strftime('%m', t.date) = ?");
    values.push(String(params.month).padStart(2, "0"));
  }

  if (params.type && params.type !== "all") {
    where.push("t.type = ?");
    values.push(params.type);
  }

  if (params.categoryId !== undefined) {
    where.push("t.category_id = ?");
    values.push(params.categoryId);
  }

  return { whereSql: where.join(" AND "), values };
}

function getSummary(params: AnalyticsFilters): DashboardSummary {
  const db = getDb();
  const { whereSql, values } = buildWhere(params);

  const row = db
    .prepare(
      `
      SELECT
        COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount_rub ELSE 0 END), 0) as income_rub,
        COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount_rub ELSE 0 END), 0) as expense_rub,
        COALESCE(SUM(CASE WHEN t.type = 'service' THEN t.amount_rub ELSE 0 END), 0) as service_rub
      FROM transactions t
      WHERE ${whereSql}
    `
    )
    .get(...values) as { income_rub: number; expense_rub: number; service_rub: number };

  const incomeRub = row?.income_rub ?? 0;
  const expenseRub = row?.expense_rub ?? 0;
  const serviceRub = row?.service_rub ?? 0;

  return {
    incomeRub,
    expenseRub,
    serviceRub,
    netRub: incomeRub - expenseRub
  };
}

export function getDashboardSummaryService(year: number, month: number): DashboardSummary {
  return getSummary({ year, month, type: "all" });
}

export function getMonthOverviewService(params: {
  year: number;
  month: number;
  type?: "all" | "income" | "expense" | "service";
  categoryId?: number;
}): AnalyticsOverview {
  const summary = getSummary(params);
  const averageExpenseRub = Math.round(summary.expenseRub / Math.max(new Date(params.year, params.month, 0).getDate(), 1));
  return { ...summary, averageExpenseRub };
}

export function getYearOverviewService(params: {
  year: number;
  type?: "all" | "income" | "expense" | "service";
  categoryId?: number;
}): AnalyticsOverview {
  const summary = getSummary(params);
  const averageExpenseRub = Math.round(summary.expenseRub / 12);
  return { ...summary, averageExpenseRub };
}

export function getCategoryBreakdownService(params: {
  year: number;
  month?: number;
  type?: "all" | "income" | "expense" | "service";
  categoryId?: number;
}): AnalyticsCategoryBreakdownItem[] {
  const db = getDb();
  const { whereSql, values } = buildWhere(params);

  const rows = db
    .prepare(
      `
      SELECT c.name_ru as category_name_ru, COALESCE(SUM(t.amount_rub), 0) as amount_rub
      FROM transactions t
      INNER JOIN categories c ON c.id = t.category_id
      WHERE ${whereSql} AND t.type = 'expense'
      GROUP BY c.name_ru
      ORDER BY amount_rub DESC
    `
    )
    .all(...values) as Array<{ category_name_ru: string; amount_rub: number }>;

  return rows.map((row) => ({ categoryNameRu: row.category_name_ru, amountRub: row.amount_rub }));
}

export function getMonthlyTrendService(year: number): AnalyticsMonthlyTrendItem[] {
  const db = getDb();
  const rows = db
    .prepare(
      `
      SELECT
        CAST(strftime('%m', t.date) AS INTEGER) as month_num,
        COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount_rub ELSE 0 END), 0) as income_rub,
        COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount_rub ELSE 0 END), 0) as expense_rub
      FROM transactions t
      WHERE strftime('%Y', t.date) = ?
      GROUP BY month_num
      ORDER BY month_num ASC
    `
    )
    .all(String(year)) as Array<{ month_num: number; income_rub: number; expense_rub: number }>;

  const map = new Map(rows.map((row) => [row.month_num, row]));
  return Array.from({ length: 12 }, (_, idx) => {
    const month = idx + 1;
    const found = map.get(month);
    return {
      month,
      incomeRub: found?.income_rub ?? 0,
      expenseRub: found?.expense_rub ?? 0
    };
  });
}

export function getMonthComparisonService(year: number, month: number): AnalyticsMonthComparison {
  ensureMonth(month);
  const trend = getMonthlyTrendService(year);
  const current = trend[month - 1] ?? { incomeRub: 0, expenseRub: 0 };
  const prevIdx = month === 1 ? 11 : month - 2;
  const previous = trend[prevIdx] ?? { incomeRub: 0, expenseRub: 0 };

  return {
    current: { incomeRub: current.incomeRub, expenseRub: current.expenseRub },
    previous: { incomeRub: previous.incomeRub, expenseRub: previous.expenseRub }
  };
}
