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
  GoalStatus,
  GoalWithProgress,
  UpdateGoalInput
} from "../types/goal";
import type {
  AddDebtPaymentInput,
  CreateDebtInput,
  DebtPayment,
  DebtStatus,
  DebtWithProgress,
  UpdateDebtInput
} from "../types/debt";
import type { AppSettings, AppTheme } from "../types/settings";

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
    list(params?: { year?: number; month?: number }): Promise<ApiResult<GoalWithProgress[]>>;
    create(payload: CreateGoalInput): Promise<ApiResult<{ id: number }>>;
    update(id: number, payload: UpdateGoalInput): Promise<ApiResult<{ id: number }>>;
    changeStatus(id: number, status: GoalStatus): Promise<ApiResult<{ id: number }>>;
    contributions(goalId: number): Promise<ApiResult<GoalContribution[]>>;
    addContribution(goalId: number, payload: AddGoalContributionInput): Promise<ApiResult<{ id: number }>>;
  };
  debts: {
    list(params?: { year?: number; month?: number }): Promise<ApiResult<DebtWithProgress[]>>;
    create(payload: CreateDebtInput): Promise<ApiResult<{ id: number }>>;
    update(id: number, payload: UpdateDebtInput): Promise<ApiResult<{ id: number }>>;
    changeStatus(id: number, status: DebtStatus): Promise<ApiResult<{ id: number }>>;
    delete(id: number): Promise<ApiResult<{ id: number }>>;
    payments(debtId: number): Promise<ApiResult<DebtPayment[]>>;
    addPayment(debtId: number, payload: AddDebtPaymentInput): Promise<ApiResult<{ id: number }>>;
  };
  settings: {
    get(): Promise<ApiResult<AppSettings>>;
    setTheme(theme: AppTheme): Promise<ApiResult<{ theme: AppTheme }>>;
  };
}
