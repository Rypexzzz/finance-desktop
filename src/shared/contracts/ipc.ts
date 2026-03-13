import type { ApiResult } from "./result";
import type { Category, CategoryType } from "../types/category";
import type {
  CreateTransactionInput,
  TransactionListFilters,
  TransactionListItem,
  UpdateTransactionInput
} from "../types/transaction";
import type {
  AddGoalContributionInput,
  CreateGoalInput,
  GoalContribution,
  GoalProgress,
  GoalStatus,
  GoalWithProgress,
  UpdateGoalInput
} from "../types/goal";
import type {
  AddDebtPaymentInput,
  CreateDebtInput,
  DebtPayment,
  DebtProgress,
  DebtStatus,
  DebtWithProgress,
  UpdateDebtInput
} from "../types/debt";
import type { AppSettings, AppTheme } from "../types/settings";
import type {
  AnalyticsCategoryBreakdownItem,
  AnalyticsMonthComparison,
  AnalyticsMonthlyTrendItem,
  AnalyticsOverview,
  DashboardSummary
} from "../types/analytics";

export interface ElectronApi {
  categories: {
    list(params?: { type?: CategoryType }): Promise<ApiResult<Category[]>>;
  };
  transactions: {
    list(
      filters: TransactionListFilters
    ): Promise<ApiResult<{ items: TransactionListItem[]; total: number }>>;
    create(payload: CreateTransactionInput): Promise<ApiResult<{ id: number }>>;
    update(
      id: number,
      payload: UpdateTransactionInput
    ): Promise<ApiResult<{ id: number }>>;
    delete(id: number): Promise<ApiResult<{ id: number }>>;
  };
  goals: {
    list(): Promise<ApiResult<GoalWithProgress[]>>;
    create(payload: CreateGoalInput): Promise<ApiResult<{ id: number }>>;
    update(id: number, payload: UpdateGoalInput): Promise<ApiResult<{ id: number }>>;
    changeStatus(id: number, status: GoalStatus): Promise<ApiResult<{ id: number }>>;
    getById(id: number): Promise<ApiResult<GoalWithProgress>>;
    getProgress(id: number): Promise<ApiResult<GoalProgress>>;
    contributions(goalId: number): Promise<ApiResult<GoalContribution[]>>;
    getContributions(goalId: number, params?: { page?: number; pageSize?: number }): Promise<ApiResult<{ items: GoalContribution[]; total: number }>>;
    addContribution(goalId: number, payload: AddGoalContributionInput): Promise<ApiResult<{ id: number }>>;
  };
  debts: {
    list(): Promise<ApiResult<DebtWithProgress[]>>;
    create(payload: CreateDebtInput): Promise<ApiResult<{ id: number }>>;
    update(id: number, payload: UpdateDebtInput): Promise<ApiResult<{ id: number }>>;
    changeStatus(id: number, status: DebtStatus): Promise<ApiResult<{ id: number }>>;
    getById(id: number): Promise<ApiResult<DebtWithProgress>>;
    getProgress(id: number): Promise<ApiResult<DebtProgress>>;
    delete(id: number): Promise<ApiResult<{ id: number }>>;
    payments(debtId: number): Promise<ApiResult<DebtPayment[]>>;
    getPayments(debtId: number, params?: { page?: number; pageSize?: number }): Promise<ApiResult<{ items: DebtPayment[]; total: number }>>;
    addPayment(debtId: number, payload: AddDebtPaymentInput): Promise<ApiResult<{ id: number }>>;
  };
  settings: {
    get(): Promise<ApiResult<AppSettings>>;
    setTheme(theme: AppTheme): Promise<ApiResult<{ theme: AppTheme }>>;
  };
  dashboard: {
    getSummary(params: { year: number; month: number }): Promise<ApiResult<DashboardSummary>>;
  };
  analytics: {
    getMonthOverview(params: { year: number; month: number; type?: "all" | "income" | "expense" | "service"; categoryId?: number }): Promise<ApiResult<AnalyticsOverview>>;
    getYearOverview(params: { year: number; type?: "all" | "income" | "expense" | "service"; categoryId?: number }): Promise<ApiResult<AnalyticsOverview>>;
    getCategoryBreakdown(params: { year: number; month?: number; type?: "all" | "income" | "expense" | "service"; categoryId?: number }): Promise<ApiResult<AnalyticsCategoryBreakdownItem[]>>;
    getMonthlyTrend(params: { year: number }): Promise<ApiResult<AnalyticsMonthlyTrendItem[]>>;
    getMonthComparison(params: { year: number; month: number }): Promise<ApiResult<AnalyticsMonthComparison>>;
  };
}
