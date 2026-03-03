import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateTransactionInput,
  TransactionListFilters,
  UpdateTransactionInput
} from "../../../shared/types/transaction";
import {
  createTransaction,
  deleteTransaction,
  listTransactions,
  updateTransaction
} from "./api";

export function useTransactions(filters: TransactionListFilters) {
  return useQuery({
    queryKey: ["transactions", filters],
    queryFn: () => listTransactions(filters)
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTransactionInput) => createTransaction(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
    }
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateTransactionInput }) =>
      updateTransaction(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
    }
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteTransaction(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
    }
  });
}