import {
  addDebtPayment,
  changeDebtStatus,
  createDebt,
  getDebtById,
  listDebtPayments,
  listDebts,
  updateDebt
} from "../db/queries/debts.repo";
import { createTransaction } from "../db/queries/transactions.repo";
import { getCategoryByCode } from "../db/queries/categories.repo";
import type { AddDebtPaymentInput, CreateDebtInput, DebtStatus, UpdateDebtInput } from "../../shared/types/debt";

function validateIsoDate(date: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

export function listDebtsService(params?: { year?: number; month?: number }) {
  const now = new Date();
  return listDebts(params?.year ?? now.getFullYear(), params?.month ?? now.getMonth() + 1);
}

export function createDebtService(payload: CreateDebtInput) {
  if (!payload.name?.trim()) throw new Error("Название долга обязательно");
  if (!Number.isInteger(payload.initialAmountRub) || payload.initialAmountRub <= 0) throw new Error("Сумма должна быть > 0");
  return { id: createDebt(payload) };
}

export function updateDebtService(id: number, payload: UpdateDebtInput) {
  if (!Number.isInteger(id) || id <= 0) throw new Error("Некорректный ID долга");
  const updated = updateDebt(id, payload);
  if (!updated) throw new Error("Долг не найден");
  return { id: updated };
}

export function changeDebtStatusService(id: number, status: DebtStatus) {
  if (!Number.isInteger(id) || id <= 0) throw new Error("Некорректный ID долга");
  const updated = changeDebtStatus(id, status);
  if (!updated) throw new Error("Долг не найден");
  return { id: updated };
}

export function listDebtPaymentsService(debtId: number) {
  if (!Number.isInteger(debtId) || debtId <= 0) throw new Error("Некорректный ID долга");
  return listDebtPayments(debtId);
}

export function addDebtPaymentService(debtId: number, payload: AddDebtPaymentInput) {
  if (!Number.isInteger(debtId) || debtId <= 0) throw new Error("Некорректный ID долга");
  if (!Number.isInteger(payload.amountRub) || payload.amountRub <= 0) throw new Error("Сумма должна быть > 0");
  if (!validateIsoDate(payload.date)) throw new Error("Некорректная дата");

  const debt = getDebtById(debtId);
  if (!debt) throw new Error("Долг не найден");
  if (debt.current_balance_rub <= 0) throw new Error("Долг уже закрыт");

  const categoryCode = debt.debt_type === "loan" ? "service_loan_payment" : "service_credit_card_payment";
  const serviceCategory = getCategoryByCode(categoryCode);
  if (!serviceCategory) throw new Error("Служебная категория погашения не найдена");

  const paidAmount = Math.min(payload.amountRub, debt.current_balance_rub);
  const balanceBefore = debt.current_balance_rub;
  const balanceAfter = Math.max(0, balanceBefore - paidAmount);

  const txId = createTransaction({
    categoryId: serviceCategory.id,
    amountRub: paidAmount,
    date: payload.date,
    comment: payload.comment ?? `Погашение долга: ${debt.name}`,
    actualType: "service"
  });

  return { id: addDebtPayment(debtId, txId, { ...payload, amountRub: paidAmount }, balanceBefore, balanceAfter) };
}
