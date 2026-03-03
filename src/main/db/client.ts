import Database from "better-sqlite3";

let db: Database.Database | null = null;

export function initDb(dbFilePath: string) {
  if (db) return db;

  db = new Database(dbFilePath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  return db;
}

export function getDb() {
  if (!db) {
    throw new Error("DB is not initialized");
  }
  return db;
}