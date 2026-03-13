import { ipcMain } from "electron";
import { fail, ok, toUnknownError } from "../utils/errors";
import {
  addGoalContributionService,
  changeGoalStatusService,
  createGoalService,
  getGoalByIdService,
  getGoalProgressService,
  listGoalContributionsService,
  listGoalsService,
  updateGoalService
} from "../services/goals.service";
import type { AddGoalContributionInput, CreateGoalInput, GoalStatus, UpdateGoalInput } from "../../shared/types/goal";

export function registerGoalsHandlers() {
  ipcMain.handle("goals:list", async () => {
    try {
      return ok(listGoalsService());
    } catch (error) {
      if (error instanceof Error) return fail("VALIDATION_ERROR", error.message);
      return toUnknownError(error);
    }
  });

  ipcMain.handle("goals:create", async (_event, payload: CreateGoalInput) => {
    try {
      return ok(createGoalService(payload));
    } catch (error) {
      if (error instanceof Error) return fail("VALIDATION_ERROR", error.message);
      return toUnknownError(error);
    }
  });

  ipcMain.handle("goals:update", async (_event, args: { id: number; payload: UpdateGoalInput }) => {
    try {
      return ok(updateGoalService(args.id, args.payload));
    } catch (error) {
      if (error instanceof Error) return fail("VALIDATION_ERROR", error.message);
      return toUnknownError(error);
    }
  });

  ipcMain.handle("goals:changeStatus", async (_event, args: { id: number; status: GoalStatus }) => {
    try {
      return ok(changeGoalStatusService(args.id, args.status));
    } catch (error) {
      if (error instanceof Error) return fail("VALIDATION_ERROR", error.message);
      return toUnknownError(error);
    }
  });

  ipcMain.handle("goals:contributions", async (_event, args: { goalId: number }) => {
    try {
      return ok(listGoalContributionsService(args.goalId).items);
    } catch (error) {
      if (error instanceof Error) return fail("VALIDATION_ERROR", error.message);
      return toUnknownError(error);
    }
  });

  ipcMain.handle("goals:getById", async (_event, args: { id: number }) => {
    try {
      return ok(getGoalByIdService(args.id));
    } catch (error) {
      if (error instanceof Error) return fail("VALIDATION_ERROR", error.message);
      return toUnknownError(error);
    }
  });

  ipcMain.handle("goals:getProgress", async (_event, args: { id: number }) => {
    try {
      return ok(getGoalProgressService(args.id));
    } catch (error) {
      if (error instanceof Error) return fail("VALIDATION_ERROR", error.message);
      return toUnknownError(error);
    }
  });

  ipcMain.handle("goals:getContributions", async (_event, args: { goalId: number; page?: number; pageSize?: number }) => {
    try {
      return ok(listGoalContributionsService(args.goalId, { page: args.page, pageSize: args.pageSize }));
    } catch (error) {
      if (error instanceof Error) return fail("VALIDATION_ERROR", error.message);
      return toUnknownError(error);
    }
  });

  ipcMain.handle("goals:addContribution", async (_event, args: { goalId: number; payload: AddGoalContributionInput }) => {
    try {
      return ok(addGoalContributionService(args.goalId, args.payload));
    } catch (error) {
      if (error instanceof Error) return fail("VALIDATION_ERROR", error.message);
      return toUnknownError(error);
    }
  });
}
