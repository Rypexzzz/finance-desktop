import { registerCategoriesHandlers } from "./categories.handlers";
import { registerTransactionsHandlers } from "./transactions.handlers";
import { registerGoalsHandlers } from "./goals.handlers";
import { registerDebtsHandlers } from "./debts.handlers";
import { registerSettingsHandlers } from "./settings.handlers";

export function registerIpcHandlers() {
  registerCategoriesHandlers();
  registerTransactionsHandlers();
  registerGoalsHandlers();
  registerDebtsHandlers();
  registerSettingsHandlers();
}
