import { ipcMain } from "electron";
import type {
  CreateTransactionInput,
  TransactionListFilters,
  UpdateTransactionInput
} from "../../shared/types/transaction";
import {
  createTransactionService,
  deleteTransactionService,
  listTransactionsService,
  updateTransactionService
} from "../services/transactions.service";
import { fail, ok, toUnknownError } from "../utils/errors";

export function registerTransactionsHandlers() {
  ipcMain.handle("transactions:list", async (_event, filters: TransactionListFilters) => {
    try {
      const data = listTransactionsService(filters);
      return ok(data);
    } catch (error) {
      if (error instanceof Error) {
        return fail("VALIDATION_ERROR", error.message);
      }
      return toUnknownError(error);
    }
  });

  ipcMain.handle("transactions:create", async (_event, payload: CreateTransactionInput) => {
    try {
      const data = createTransactionService(payload);
      return ok(data);
    } catch (error) {
      if (error instanceof Error) {
        return fail("VALIDATION_ERROR", error.message);
      }
      return toUnknownError(error);
    }
  });

  ipcMain.handle(
    "transactions:update",
    async (_event, args: { id: number; payload: UpdateTransactionInput }) => {
      try {
        const data = updateTransactionService(args.id, args.payload);
        return ok(data);
      } catch (error) {
        if (error instanceof Error) {
          return fail("VALIDATION_ERROR", error.message);
        }
        return toUnknownError(error);
      }
    }
  );

  ipcMain.handle("transactions:delete", async (_event, args: { id: number }) => {
    try {
      const data = deleteTransactionService(args.id);
      return ok(data);
    } catch (error) {
      if (error instanceof Error) {
        return fail("VALIDATION_ERROR", error.message);
      }
      return toUnknownError(error);
    }
  });
}