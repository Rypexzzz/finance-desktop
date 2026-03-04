export type DashboardSummary = {
  incomeRub: number;
  expenseRub: number;
  serviceRub: number;
  netRub: number;
};

export type AnalyticsOverview = DashboardSummary & {
  averageExpenseRub: number;
};

export type AnalyticsCategoryBreakdownItem = {
  categoryNameRu: string;
  amountRub: number;
};

export type AnalyticsMonthlyTrendItem = {
  month: number;
  incomeRub: number;
  expenseRub: number;
};

export type AnalyticsMonthComparison = {
  current: { incomeRub: number; expenseRub: number };
  previous: { incomeRub: number; expenseRub: number };
};
