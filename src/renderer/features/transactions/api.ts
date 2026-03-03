import { electronApi } from "../../lib/electron-api";
import type {
  CreateTransactionInput,
  TransactionListFilters,
  UpdateTransactionInput
} from "../../../shared/types/transaction";

export async function listTransactions(filters: TransactionListFilters) {
  const res = await electronApi.transactions.list(filters);
  if (!res.ok) throw new Error(res.error.message);
  return res.data;
}

export async function createTransaction(payload: CreateTransactionInput) {
  const res = await electronApi.transactions.create(payload);
  if (!res.ok) throw new Error(res.error.message);
  return res.data;
}

export async function updateTransaction(id: number, payload: UpdateTransactionInput) {
  const res = await electronApi.transactions.update(id, payload);
  if (!res.ok) throw new Error(res.error.message);
  return res.data;
}

export async function deleteTransaction(id: number) {
  const res = await electronApi.transactions.delete(id);
  if (!res.ok) throw new Error(res.error.message);
  return res.data;
}