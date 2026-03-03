import path from "node:path";
import { app } from "electron";

export function getDbFilePath() {
  return path.join(app.getPath("userData"), "finance.db");
}

export function getMigrationsDir() {
  return path.join(app.getAppPath(), "database", "migrations");
}