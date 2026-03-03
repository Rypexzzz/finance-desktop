import { electronApi } from "../../lib/electron-api";
import type { AddDebtPaymentInput, CreateDebtInput, DebtStatus, UpdateDebtInput } from "../../../shared/types/debt";

export async function listDebts(year?: number, month?: number) {
  const res = await electronApi.debts.list({ year, month });
  if (!res.ok) throw new Error(res.error.message);
  return res.data;
}

export async function createDebt(payload: CreateDebtInput) {
  const res = await electronApi.debts.create(payload);
  if (!res.ok) throw new Error(res.error.message);
  return res.data;
}

export async function updateDebt(id: number, payload: UpdateDebtInput) {
  const res = await electronApi.debts.update(id, payload);
  if (!res.ok) throw new Error(res.error.message);
  return res.data;
}

export async function changeDebtStatus(id: number, status: DebtStatus) {
  const res = await electronApi.debts.changeStatus(id, status);
  if (!res.ok) throw new Error(res.error.message);
  return res.data;
}

export async function listDebtPayments(debtId: number) {
  const res = await electronApi.debts.payments(debtId);
  if (!res.ok) throw new Error(res.error.message);
  return res.data;
}

export async function addDebtPayment(debtId: number, payload: AddDebtPaymentInput) {
  const res = await electronApi.debts.addPayment(debtId, payload);
  if (!res.ok) throw new Error(res.error.message);
  return res.data;
}
