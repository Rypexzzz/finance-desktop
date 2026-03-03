import {
  addGoalContribution,
  changeGoalStatus,
  createGoal,
  getGoalById,
  listGoalContributions,
  listGoals,
  updateGoal
} from "../db/queries/goals.repo";
import { createTransaction } from "../db/queries/transactions.repo";
import { getCategoryByCode } from "../db/queries/categories.repo";
import type { AddGoalContributionInput, CreateGoalInput, GoalStatus, UpdateGoalInput } from "../../shared/types/goal";

function validateIsoDate(date: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

export function listGoalsService(params?: { year?: number; month?: number }) {
  const now = new Date();
  return listGoals(params?.year ?? now.getFullYear(), params?.month ?? now.getMonth() + 1);
}

export function createGoalService(payload: CreateGoalInput) {
  if (!payload.name?.trim()) throw new Error("Название цели обязательно");
  if (!Number.isInteger(payload.targetAmountRub) || payload.targetAmountRub <= 0) throw new Error("Целевая сумма должна быть > 0");
  if (payload.startAmountRub !== undefined && (!Number.isInteger(payload.startAmountRub) || payload.startAmountRub < 0)) {
    throw new Error("Стартовая сумма должна быть >= 0");
  }
  if (payload.deadlineDate && !validateIsoDate(payload.deadlineDate)) throw new Error("Некорректный дедлайн");
  return { id: createGoal(payload) };
}

export function updateGoalService(id: number, payload: UpdateGoalInput) {
  if (!Number.isInteger(id) || id <= 0) throw new Error("Некорректный ID цели");
  const updated = updateGoal(id, payload);
  if (!updated) throw new Error("Цель не найдена");
  return { id: updated };
}

export function changeGoalStatusService(id: number, status: GoalStatus) {
  if (!Number.isInteger(id) || id <= 0) throw new Error("Некорректный ID цели");
  const updated = changeGoalStatus(id, status);
  if (!updated) throw new Error("Цель не найдена");
  return { id: updated };
}

export function listGoalContributionsService(goalId: number) {
  if (!Number.isInteger(goalId) || goalId <= 0) throw new Error("Некорректный ID цели");
  return listGoalContributions(goalId);
}

export function addGoalContributionService(goalId: number, payload: AddGoalContributionInput) {
  if (!Number.isInteger(goalId) || goalId <= 0) throw new Error("Некорректный ID цели");
  if (!Number.isInteger(payload.amountRub) || payload.amountRub <= 0) throw new Error("Сумма должна быть > 0");
  if (!validateIsoDate(payload.date)) throw new Error("Некорректная дата");

  const goal = getGoalById(goalId);
  if (!goal) throw new Error("Цель не найдена");

  const serviceCategory = getCategoryByCode("service_goal_contribution");
  if (!serviceCategory) throw new Error("Служебная категория для целей не найдена");

  const txId = createTransaction({
    categoryId: serviceCategory.id,
    amountRub: payload.amountRub,
    date: payload.date,
    comment: payload.comment ?? `Пополнение цели: ${goal.name}`,
    actualType: "service"
  });

  return { id: addGoalContribution(goalId, txId, payload) };
}
