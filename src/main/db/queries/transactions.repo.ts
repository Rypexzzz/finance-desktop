import { getDb } from "../client";
import type {
  CreateTransactionInput,
  TransactionListFilters,
  TransactionListItem,
  UpdateTransactionInput
} from "../../../shared/types/transaction";

type TransactionRow = {
  id: number;
  type: "expense" | "income" | "service";
  category_id: number;
  amount_rub: number;
  date: string;
  comment: string;
  created_at: string;
  updated_at: string;
  category_name_ru: string;
  category_icon_name: string;
  category_color: string;
};

function mapRow(row: TransactionRow): TransactionListItem {
  return {
    id: row.id,
    type: row.type,
    categoryId: row.category_id,
    amountRub: row.amount_rub,
    date: row.date,
    comment: row.comment ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    categoryNameRu: row.category_name_ru,
    categoryIconName: row.category_icon_name,
    categoryColor: row.category_color
  };
}

export function listTransactions(filters: TransactionListFilters): {
  items: TransactionListItem[];
  total: number;
} {
  const db = getDb();

  const {
    periodType,
    year,
    month,
    type = "all",
    categoryId,
    search = "",
    sortBy = "date",
    sortDir = "desc",
    page = 1,
    pageSize = 50
  } = filters;

  const where: string[] = [];
  const params: unknown[] = [];

  where.push(`strftime('%Y', t.date) = ?`);
  params.push(String(year));

  if (periodType === "month") {
    if (!month || month < 1 || month > 12) {
      throw new Error("Некорректный месяц");
    }
    where.push(`strftime('%m', t.date) = ?`);
    params.push(String(month).padStart(2, "0"));
  }

  if (type !== "all") {
    where.push(`t.type = ?`);
    params.push(type);
  }

  if (categoryId) {
    where.push(`t.category_id = ?`);
    params.push(categoryId);
  }

  if (search.trim()) {
    where.push(`LOWER(COALESCE(t.comment, '')) LIKE ?`);
    params.push(`%${search.trim().toLowerCase()}%`);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const orderCol = sortBy === "amount" ? "t.amount_rub" : "t.date";
  const orderDirection = sortDir === "asc" ? "ASC" : "DESC";
  const limit = Math.max(1, Math.min(pageSize, 200));
  const offset = Math.max(0, (page - 1) * limit);

  const countSql = `
    SELECT COUNT(*) as total
    FROM transactions t
    ${whereSql}
  `;

  const totalRow = db.prepare(countSql).get(...params) as { total: number };
  const total = totalRow?.total ?? 0;

  const dataSql = `
    SELECT
      t.id,
      t.type,
      t.category_id,
      t.amount_rub,
      t.date,
      t.comment,
      t.created_at,
      t.updated_at,
      c.name_ru as category_name_ru,
      c.icon_name as category_icon_name,
      c.color as category_color
    FROM transactions t
    INNER JOIN categories c ON c.id = t.category_id
    ${whereSql}
    ORDER BY ${orderCol} ${orderDirection}, t.id DESC
    LIMIT ? OFFSET ?
  `;

  const rows = db.prepare(dataSql).all(...params, limit, offset) as TransactionRow[];
  return { items: rows.map(mapRow), total };
}

export function createTransaction(payload: CreateTransactionInput & { actualType: "expense" | "income" | "service" }) {
  const db = getDb();
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO transactions (type, category_id, amount_rub, date, comment, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    payload.actualType,
    payload.categoryId,
    payload.amountRub,
    payload.date,
    payload.comment ?? "",
    now,
    now
  );

  return Number(result.lastInsertRowid);
}

export function updateTransaction(id: number, payload: UpdateTransactionInput & { actualType?: "expense" | "income" | "service" }) {
  const db = getDb();
  const existing = db.prepare(`SELECT id FROM transactions WHERE id = ?`).get(id);
  if (!existing) return null;

  const sets: string[] = [];
  const params: unknown[] = [];

  if (payload.actualType) {
    sets.push("type = ?");
    params.push(payload.actualType);
  }
  if (payload.categoryId !== undefined) {
    sets.push("category_id = ?");
    params.push(payload.categoryId);
  }
  if (payload.amountRub !== undefined) {
    sets.push("amount_rub = ?");
    params.push(payload.amountRub);
  }
  if (payload.date !== undefined) {
    sets.push("date = ?");
    params.push(payload.date);
  }
  if (payload.comment !== undefined) {
    sets.push("comment = ?");
    params.push(payload.comment);
  }

  sets.push("updated_at = ?");
  params.push(new Date().toISOString());

  if (sets.length === 1) {
    return id; // только updated_at, но всё равно ок
  }

  params.push(id);

  const sql = `UPDATE transactions SET ${sets.join(", ")} WHERE id = ?`;
  db.prepare(sql).run(...params);

  return id;
}

export function deleteTransaction(id: number) {
  const db = getDb();
  const res = db.prepare(`DELETE FROM transactions WHERE id = ?`).run(id);
  return res.changes > 0;
}

export function getTransactionById(id: number) {
  const db = getDb();
  return db.prepare(`SELECT * FROM transactions WHERE id = ?`).get(id);
}