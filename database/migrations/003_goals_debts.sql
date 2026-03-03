CREATE TABLE IF NOT EXISTS goals (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  target_amount_rub INTEGER NOT NULL CHECK (target_amount_rub > 0),
  start_amount_rub INTEGER NOT NULL DEFAULT 0 CHECK (start_amount_rub >= 0),
  monthly_plan_rub INTEGER,
  deadline_date TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS goal_contributions (
  id INTEGER PRIMARY KEY,
  goal_id INTEGER NOT NULL,
  transaction_id INTEGER NOT NULL UNIQUE,
  amount_rub INTEGER NOT NULL CHECK (amount_rub > 0),
  date TEXT NOT NULL,
  comment TEXT DEFAULT '',
  created_at TEXT NOT NULL,
  FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS debts (
  id INTEGER PRIMARY KEY,
  debt_type TEXT NOT NULL CHECK (debt_type IN ('loan', 'credit_card')),
  name TEXT NOT NULL,
  initial_amount_rub INTEGER NOT NULL CHECK (initial_amount_rub > 0),
  current_balance_rub INTEGER NOT NULL CHECK (current_balance_rub >= 0),
  monthly_plan_rub INTEGER,
  minimum_payment_rub INTEGER,
  target_close_date TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'closed', 'cancelled')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS debt_payments (
  id INTEGER PRIMARY KEY,
  debt_id INTEGER NOT NULL,
  transaction_id INTEGER NOT NULL UNIQUE,
  amount_rub INTEGER NOT NULL CHECK (amount_rub > 0),
  date TEXT NOT NULL,
  balance_before_rub INTEGER NOT NULL,
  balance_after_rub INTEGER NOT NULL,
  comment TEXT DEFAULT '',
  created_at TEXT NOT NULL,
  FOREIGN KEY (debt_id) REFERENCES debts(id) ON DELETE CASCADE,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_goal_contributions_goal_id_date
  ON goal_contributions(goal_id, date);

CREATE INDEX IF NOT EXISTS idx_debt_payments_debt_id_date
  ON debt_payments(debt_id, date);
