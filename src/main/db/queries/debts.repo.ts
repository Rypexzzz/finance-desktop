import { getDb } from "../client";
import type {
  AddDebtPaymentInput,
  CreateDebtInput,
  DebtPayment,
  DebtStatus,
  DebtWithProgress,
  UpdateDebtInput
} from "../../../shared/types/debt";

export function listDebts(year: number, month: number): DebtWithProgress[] {
  const db = getDb();
  const ym = `${year}-${String(month).padStart(2, "0")}`;
  const rows = db.prepare(`
    SELECT
      d.*,
      COALESCE((SELECT SUM(dp.amount_rub) FROM debt_payments dp WHERE dp.debt_id = d.id AND substr(dp.date, 1, 7) = ?), 0) as paid_month_rub
    FROM debts d
    ORDER BY d.status ASC, d.created_at DESC
  `).all(ym) as Array<any>;

  return rows.map((row) => ({
    id: row.id,
    debtType: row.debt_type,
    name: row.name,
    initialAmountRub: row.initial_amount_rub,
    currentBalanceRub: row.current_balance_rub,
    monthlyPlanRub: row.monthly_plan_rub,
    minimumPaymentRub: row.minimum_payment_rub,
    targetCloseDate: row.target_close_date,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    progressTotal: row.initial_amount_rub > 0 ? (row.initial_amount_rub - row.current_balance_rub) / row.initial_amount_rub : 0,
    paidMonthRub: row.paid_month_rub,
    progressMonth: row.monthly_plan_rub ? row.paid_month_rub / row.monthly_plan_rub : null
  }));
}

export function createDebt(payload: CreateDebtInput): number {
  const db = getDb();
  const now = new Date().toISOString();
  const result = db.prepare(`
    INSERT INTO debts (debt_type, name, initial_amount_rub, current_balance_rub, monthly_plan_rub, minimum_payment_rub, target_close_date, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)
  `).run(
    payload.debtType,
    payload.name,
    payload.initialAmountRub,
    payload.initialAmountRub,
    payload.monthlyPlanRub ?? null,
    payload.minimumPaymentRub ?? null,
    payload.targetCloseDate ?? null,
    now,
    now
  );
  return Number(result.lastInsertRowid);
}

export function updateDebt(id: number, payload: UpdateDebtInput): number | null {
  const db = getDb();
  const sets: string[] = [];
  const params: unknown[] = [];
  if (payload.debtType !== undefined) { sets.push("debt_type = ?"); params.push(payload.debtType); }
  if (payload.name !== undefined) { sets.push("name = ?"); params.push(payload.name); }
  if (payload.initialAmountRub !== undefined) { sets.push("initial_amount_rub = ?"); params.push(payload.initialAmountRub); }
  if (payload.monthlyPlanRub !== undefined) { sets.push("monthly_plan_rub = ?"); params.push(payload.monthlyPlanRub); }
  if (payload.minimumPaymentRub !== undefined) { sets.push("minimum_payment_rub = ?"); params.push(payload.minimumPaymentRub); }
  if (payload.targetCloseDate !== undefined) { sets.push("target_close_date = ?"); params.push(payload.targetCloseDate); }
  if (!sets.length) return id;
  sets.push("updated_at = ?"); params.push(new Date().toISOString());
  params.push(id);
  const res = db.prepare(`UPDATE debts SET ${sets.join(", ")} WHERE id = ?`).run(...params);
  return res.changes > 0 ? id : null;
}

export function changeDebtStatus(id: number, status: DebtStatus): number | null {
  const db = getDb();
  const res = db.prepare("UPDATE debts SET status = ?, updated_at = ? WHERE id = ?").run(status, new Date().toISOString(), id);
  return res.changes > 0 ? id : null;
}

export function getDebtById(id: number) {
  const db = getDb();
  return db.prepare("SELECT * FROM debts WHERE id = ?").get(id) as any;
}

export function listDebtPayments(debtId: number): DebtPayment[] {
  const db = getDb();
  const rows = db.prepare(`SELECT * FROM debt_payments WHERE debt_id = ? ORDER BY date DESC, id DESC`).all(debtId) as Array<any>;
  return rows.map((row) => ({
    id: row.id,
    debtId: row.debt_id,
    transactionId: row.transaction_id,
    amountRub: row.amount_rub,
    date: row.date,
    balanceBeforeRub: row.balance_before_rub,
    balanceAfterRub: row.balance_after_rub,
    comment: row.comment ?? "",
    createdAt: row.created_at
  }));
}

export function addDebtPayment(debtId: number, transactionId: number, payload: AddDebtPaymentInput, balanceBefore: number, balanceAfter: number): number {
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO debt_payments (debt_id, transaction_id, amount_rub, date, balance_before_rub, balance_after_rub, comment, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(debtId, transactionId, payload.amountRub, payload.date, balanceBefore, balanceAfter, payload.comment ?? "", new Date().toISOString());

  db.prepare("UPDATE debts SET current_balance_rub = ?, status = ?, updated_at = ? WHERE id = ?").run(
    balanceAfter,
    balanceAfter === 0 ? "closed" : "active",
    new Date().toISOString(),
    debtId
  );

  return Number(result.lastInsertRowid);
}
