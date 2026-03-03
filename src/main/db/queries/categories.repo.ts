import { getDb } from "../client";
import type { CategoryType, Category } from "../../../shared/types/category";

type CategoryRow = {
  id: number;
  code: string;
  name_ru: string;
  type: CategoryType;
  icon_name: string;
  color: string;
  is_service: number;
  sort_order: number;
  is_active: number;
};

function mapRow(row: CategoryRow): Category {
  return {
    id: row.id,
    code: row.code,
    nameRu: row.name_ru,
    type: row.type,
    iconName: row.icon_name,
    color: row.color,
    isService: !!row.is_service,
    sortOrder: row.sort_order,
    isActive: !!row.is_active
  };
}

export function listCategories(type?: CategoryType): Category[] {
  const db = getDb();

  let sql = `
    SELECT id, code, name_ru, type, icon_name, color, is_service, sort_order, is_active
    FROM categories
    WHERE is_active = 1
  `;
  const params: unknown[] = [];

  if (type) {
    sql += ` AND type = ?`;
    params.push(type);
  }

  sql += ` ORDER BY type ASC, sort_order ASC, name_ru ASC`;

  const rows = db.prepare(sql).all(...params) as CategoryRow[];
  return rows.map(mapRow);
}

export function getCategoryById(id: number): Category | null {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT id, code, name_ru, type, icon_name, color, is_service, sort_order, is_active
       FROM categories WHERE id = ?`
    )
    .get(id) as CategoryRow | undefined;

  return row ? mapRow(row) : null;
}