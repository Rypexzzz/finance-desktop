import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AddDebtPaymentInput, CreateDebtInput, DebtStatus, UpdateDebtInput } from "../../../shared/types/debt";
import { addDebtPayment, changeDebtStatus, createDebt, deleteDebt, listDebtPayments, listDebts, updateDebt } from "./api";

export function useDebts() {
  return useQuery({ queryKey: ["debts"], queryFn: () => listDebts() });
}

export function useDebtPayments(debtId?: number) {
  return useQuery({ queryKey: ["debt-payments", debtId], queryFn: () => listDebtPayments(debtId as number), enabled: !!debtId });
}

export function useCreateDebt() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (payload: CreateDebtInput) => createDebt(payload), onSuccess: () => qc.invalidateQueries({ queryKey: ["debts"] }) });
}

export function useUpdateDebt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateDebtInput }) => updateDebt(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["debts"] })
  });
}

export function useChangeDebtStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: DebtStatus }) => changeDebtStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["debts"] })
  });
}

export function useAddDebtPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ debtId, payload }: { debtId: number; payload: AddDebtPaymentInput }) => addDebtPayment(debtId, payload),
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: ["debts"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["debt-payments", vars.debtId] });
    }
  });
}

export function useDeleteDebt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDebt,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    }
  });
}
