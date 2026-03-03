CREATE TABLE IF NOT EXISTS app_settings (
  id INTEGER PRIMARY KEY,
  theme TEXT NOT NULL DEFAULT 'dark',
  currency TEXT NOT NULL DEFAULT 'RUB',
  locale TEXT NOT NULL DEFAULT 'ru-RU',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name_ru TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('expense', 'income', 'service')),
  icon_name TEXT NOT NULL,
  color TEXT NOT NULL,
  is_service INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('expense', 'income', 'service')),
  category_id INTEGER NOT NULL,
  amount_rub INTEGER NOT NULL CHECK (amount_rub > 0),
  date TEXT NOT NULL, -- YYYY-MM-DD
  comment TEXT DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE INDEX IF NOT EXISTS idx_categories_type_sort_order
  ON categories(type, sort_order);

CREATE INDEX IF NOT EXISTS idx_transactions_date
  ON transactions(date);

CREATE INDEX IF NOT EXISTS idx_transactions_type
  ON transactions(type);

CREATE INDEX IF NOT EXISTS idx_transactions_category_id
  ON transactions(category_id);