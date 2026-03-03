import { registerCategoriesHandlers } from "./categories.handlers";
import { registerTransactionsHandlers } from "./transactions.handlers";

export function registerIpcHandlers() {
  registerCategoriesHandlers();
  registerTransactionsHandlers();
}