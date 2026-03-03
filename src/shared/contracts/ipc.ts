import type { ApiResult } from "./result";
import type { Category, CategoryType } from "../types/category";
import type {
  CreateTransactionInput,
  TransactionListFilters,
  TransactionListItem,
  UpdateTransactionInput
} from "../types/transaction";

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
}