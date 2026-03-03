import { ipcMain } from "electron";
import { getCategories } from "../services/categories.service";
import { ok, fail, toUnknownError } from "../utils/errors";

export function registerCategoriesHandlers() {
  ipcMain.handle("categories:list", async (_event, params?: { type?: "expense" | "income" | "service" }) => {
    try {
      const data = getCategories(params);
      return ok(data);
    } catch (error) {
      return toUnknownError(error);
    }
  });
}