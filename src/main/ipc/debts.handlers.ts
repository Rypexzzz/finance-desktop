import { ipcMain } from "electron";
import { fail, ok, toUnknownError } from "../utils/errors";
import {
  addDebtPaymentService,
  changeDebtStatusService,
  createDebtService,
  deleteDebtService,
  getDebtByIdService,
  getDebtProgressService,
  listDebtPaymentsService,
  listDebtsService,
  updateDebtService
} from "../services/debts.service";
import type { AddDebtPaymentInput, CreateDebtInput, DebtStatus, UpdateDebtInput } from "../../shared/types/debt";

export function registerDebtsHandlers() {
  ipcMain.handle("debts:list", async () => {
    try {
      return ok(listDebtsService());
    } catch (error) {
      if (error instanceof Error) return fail("VALIDATION_ERROR", error.message);
      return toUnknownError(error);
    }
  });

  ipcMain.handle("debts:create", async (_event, payload: CreateDebtInput) => {
    try {
      return ok(createDebtService(payload));
    } catch (error) {
      if (error instanceof Error) return fail("VALIDATION_ERROR", error.message);
      return toUnknownError(error);
    }
  });

  ipcMain.handle("debts:update", async (_event, args: { id: number; payload: UpdateDebtInput }) => {
    try {
      return ok(updateDebtService(args.id, args.payload));
    } catch (error) {
      if (error instanceof Error) return fail("VALIDATION_ERROR", error.message);
      return toUnknownError(error);
    }
  });


  ipcMain.handle("debts:delete", async (_event, args: { id: number }) => {
    try {
      return ok(deleteDebtService(args.id));
    } catch (error) {
      if (error instanceof Error) return fail("VALIDATION_ERROR", error.message);
      return toUnknownError(error);
    }
  });

  ipcMain.handle("debts:changeStatus", async (_event, args: { id: number; status: DebtStatus }) => {
    try {
      return ok(changeDebtStatusService(args.id, args.status));
    } catch (error) {
      if (error instanceof Error) return fail("VALIDATION_ERROR", error.message);
      return toUnknownError(error);
    }
  });

  ipcMain.handle("debts:payments", async (_event, args: { debtId: number }) => {
    try {
      return ok(listDebtPaymentsService(args.debtId).items);
    } catch (error) {
      if (error instanceof Error) return fail("VALIDATION_ERROR", error.message);
      return toUnknownError(error);
    }
  });

  ipcMain.handle("debts:addPayment", async (_event, args: { debtId: number; payload: AddDebtPaymentInput }) => {
    try {
      return ok(addDebtPaymentService(args.debtId, args.payload));
    } catch (error) {
      if (error instanceof Error) return fail("VALIDATION_ERROR", error.message);
      return toUnknownError(error);
    }
  });

  ipcMain.handle("debts:getById", async (_event, args: { id: number }) => {
    try {
      return ok(getDebtByIdService(args.id));
    } catch (error) {
      if (error instanceof Error) return fail("VALIDATION_ERROR", error.message);
      return toUnknownError(error);
    }
  });

  ipcMain.handle("debts:getProgress", async (_event, args: { id: number }) => {
    try {
      return ok(getDebtProgressService(args.id));
    } catch (error) {
      if (error instanceof Error) return fail("VALIDATION_ERROR", error.message);
      return toUnknownError(error);
    }
  });

  ipcMain.handle("debts:getPayments", async (_event, args: { debtId: number; page?: number; pageSize?: number }) => {
    try {
      return ok(listDebtPaymentsService(args.debtId, { page: args.page, pageSize: args.pageSize }));
    } catch (error) {
      if (error instanceof Error) return fail("VALIDATION_ERROR", error.message);
      return toUnknownError(error);
    }
  });
}
