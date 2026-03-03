import {
  createTransaction,
  deleteTransaction,
  getTransactionById,
  listTransactions,
  updateTransaction
} from "../db/queries/transactions.repo";
import { getCategoryById } from "../db/queries/categories.repo";
import type {
  CreateTransactionInput,
  TransactionListFilters,
  UpdateTransactionInput
} from "../../shared/types/transaction";

function validateIsoDate(date: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

function validateCreate(payload: CreateTransactionInput) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Пустые данные");
  }
  if (!["expense", "income"].includes(payload.type)) {
    throw new Error("Тип операции должен быть income или expense");
  }
  if (!Number.isInteger(payload.amountRub) || payload.amountRub <= 0) {
    throw new Error("Сумма должна быть целым положительным числом");
  }
  if (!Number.isInteger(payload.categoryId) || payload.categoryId <= 0) {
    throw new Error("Выберите категорию");
  }
  if (!validateIsoDate(payload.date)) {
    throw new Error("Некорректная дата");
  }
}

function validateUpdate(payload: UpdateTransactionInput) {
  if (payload.amountRub !== undefined) {
    if (!Number.isInteger(payload.amountRub) || payload.amountRub <= 0) {
      throw new Error("Сумма должна быть целым положительным числом");
    }
  }
  if (payload.categoryId !== undefined) {
    if (!Number.isInteger(payload.categoryId) || payload.categoryId <= 0) {
      throw new Error("Выберите категорию");
    }
  }
  if (payload.date !== undefined && !validateIsoDate(payload.date)) {
    throw new Error("Некорректная дата");
  }
  if (payload.type !== undefined && !["expense", "income"].includes(payload.type)) {
    throw new Error("Некорректный тип операции");
  }
}

function resolveCategoryType(categoryId: number) {
  const category = getCategoryById(categoryId);
  if (!category) throw new Error("Категория не найдена");
  return category;
}

export function listTransactionsService(filters: TransactionListFilters) {
  return listTransactions(filters);
}

export function createTransactionService(payload: CreateTransactionInput) {
  validateCreate(payload);

  const category = resolveCategoryType(payload.categoryId);
  if (category.type !== payload.type) {
    throw new Error("Категория не соответствует типу операции");
  }

  const id = createTransaction({
    ...payload,
    actualType: category.type
  });

  return { id };
}

export function updateTransactionService(id: number, payload: UpdateTransactionInput) {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Некорректный ID операции");
  }

  const existing = getTransactionById(id);
  if (!existing) throw new Error("Операция не найдена");

  validateUpdate(payload);

  let actualType: "expense" | "income" | "service" | undefined;
  if (payload.categoryId !== undefined) {
    const category = resolveCategoryType(payload.categoryId);
    if (payload.type && category.type !== payload.type) {
      throw new Error("Категория не соответствует типу операции");
    }
    actualType = category.type;
  } else if (payload.type !== undefined) {
    // Если пользователь меняет только type без category — запретим во избежание рассинхрона
    throw new Error("Для смены типа выберите категорию соответствующего типа");
  }

  const updatedId = updateTransaction(id, {
    ...payload,
    actualType
  });

  if (!updatedId) throw new Error("Операция не найдена");
  return { id: updatedId };
}

export function deleteTransactionService(id: number) {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Некорректный ID операции");
  }

  const deleted = deleteTransaction(id);
  if (!deleted) throw new Error("Операция не найдена");

  return { id };
}