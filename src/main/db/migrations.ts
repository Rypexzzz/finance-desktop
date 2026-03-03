import fs from "node:fs";
import path from "node:path";
import type Database from "better-sqlite3";

export function runMigrations(db: Database.Database, migrationsDir: string) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INTEGER PRIMARY KEY,
      filename TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL
    );
  `);

  if (!fs.existsSync(migrationsDir)) {
    throw new Error(`Migrations directory not found: ${migrationsDir}`);
  }

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const hasMigrationStmt = db.prepare(
    "SELECT 1 FROM schema_migrations WHERE filename = ? LIMIT 1"
  );
  const insertMigrationStmt = db.prepare(
    "INSERT INTO schema_migrations (filename, applied_at) VALUES (?, datetime('now'))"
  );

  const apply = db.transaction((filename: string, sql: string) => {
    db.exec(sql);
    insertMigrationStmt.run(filename);
  });

  for (const filename of files) {
    const alreadyApplied = hasMigrationStmt.get(filename);
    if (alreadyApplied) continue;

    const sql = fs.readFileSync(path.join(migrationsDir, filename), "utf-8");
    apply(filename, sql);
    console.log(`[migration] applied ${filename}`);
  }
}