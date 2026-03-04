import { electronApi } from "../../lib/electron-api";
import type { AddGoalContributionInput, CreateGoalInput, GoalStatus, UpdateGoalInput } from "../../../shared/types/goal";

export async function listGoals(year?: number, month?: number) {
  const res = await electronApi.goals.list({ year, month });
  if (!res.ok) throw new Error(res.error.message);
  return res.data;
}

export async function createGoal(payload: CreateGoalInput) {
  const res = await electronApi.goals.create(payload);
  if (!res.ok) throw new Error(res.error.message);
  return res.data;
}

export async function updateGoal(id: number, payload: UpdateGoalInput) {
  const res = await electronApi.goals.update(id, payload);
  if (!res.ok) throw new Error(res.error.message);
  return res.data;
}

export async function changeGoalStatus(id: number, status: GoalStatus) {
  const res = await electronApi.goals.changeStatus(id, status);
  if (!res.ok) throw new Error(res.error.message);
  return res.data;
}

export async function listGoalContributions(goalId: number) {
  const res = await electronApi.goals.contributions(goalId);
  if (!res.ok) throw new Error(res.error.message);
  return res.data;
}

export async function getGoalById(id: number, params?: { year?: number; month?: number }) {
  const res = await electronApi.goals.getById(id, params);
  if (!res.ok) throw new Error(res.error.message);
  return res.data;
}

export async function getGoalProgress(id: number, params?: { year?: number; month?: number }) {
  const res = await electronApi.goals.getProgress(id, params);
  if (!res.ok) throw new Error(res.error.message);
  return res.data;
}

export async function getGoalContributions(goalId: number, params?: { page?: number; pageSize?: number }) {
  const res = await electronApi.goals.getContributions(goalId, params);
  if (!res.ok) throw new Error(res.error.message);
  return res.data;
}

export async function addGoalContribution(goalId: number, payload: AddGoalContributionInput) {
  const res = await electronApi.goals.addContribution(goalId, payload);
  if (!res.ok) throw new Error(res.error.message);
  return res.data;
}
