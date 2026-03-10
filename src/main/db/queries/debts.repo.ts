import { getDb } from "../client";
import type {
  AddDebtPaymentInput,
  CreateDebtInput,
  DebtPayment,
  DebtStatus,
  DebtWithProgress,
  UpdateDebtInput
} from "../../../shared/types/debt";

export function listDebts(): DebtWithProgress[] {
  const db = getDb();
  const rows = db.prepare(`
    SELECT
      d.*,
      COALESCE((SELECT SUM(dp.amount_rub) FROM debt_payments dp WHERE dp.debt_id = d.id), 0) as paid_total_rub
    FROM debts d
    ORDER BY d.status ASC, d.created_at DESC
  `).all() as Array<any>;

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
    paidTotalRub: row.paid_total_rub
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

export function listDebtPayments(debtId: number, page = 1, pageSize = 20): { items: DebtPayment[]; total: number } {
  const db = getDb();
  const limit = Math.max(1, Math.min(pageSize, 200));
  const offset = Math.max(0, (page - 1) * limit);
  const totalRow = db.prepare(`SELECT COUNT(*) as total FROM debt_payments WHERE debt_id = ?`).get(debtId) as { total: number };
  const rows = db.prepare(`SELECT * FROM debt_payments WHERE debt_id = ? ORDER BY date DESC, id DESC LIMIT ? OFFSET ?`).all(debtId, limit, offset) as Array<any>;
  return {
    total: totalRow?.total ?? 0,
    items: rows.map((row) => ({
    id: row.id,
    debtId: row.debt_id,
    transactionId: row.transaction_id,
    amountRub: row.amount_rub,
    date: row.date,
    balanceBeforeRub: row.balance_before_rub,
    balanceAfterRub: row.balance_after_rub,
    comment: row.comment ?? "",
    createdAt: row.created_at
  }))
  };
}


export function getDebtPaymentByTransactionId(transactionId: number): DebtPayment | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM debt_payments WHERE transaction_id = ?").get(transactionId) as any;
  if (!row) return null;
  return {
    id: row.id,
    debtId: row.debt_id,
    transactionId: row.transaction_id,
    amountRub: row.amount_rub,
    date: row.date,
    balanceBeforeRub: row.balance_before_rub,
    balanceAfterRub: row.balance_after_rub,
    comment: row.comment ?? "",
    createdAt: row.created_at
  };
}

export function deleteDebtPaymentByTransactionId(transactionId: number): boolean {
  const db = getDb();
  const res = db.prepare("DELETE FROM debt_payments WHERE transaction_id = ?").run(transactionId);
  return res.changes > 0;
}

export function recalculateDebtAfterPaymentChange(debtId: number): void {
  const db = getDb();
  const debt = db.prepare("SELECT initial_amount_rub, status FROM debts WHERE id = ?").get(debtId) as any;
  if (!debt) return;
  const paid = db.prepare("SELECT COALESCE(SUM(amount_rub), 0) as paid FROM debt_payments WHERE debt_id = ?").get(debtId) as { paid: number };
  const balanceAfter = Math.max(0, debt.initial_amount_rub - (paid?.paid ?? 0));

  db.prepare(`
    UPDATE debts
    SET
      current_balance_rub = ?,
      status = CASE
        WHEN status IN ('paused', 'cancelled') THEN status
        WHEN ? = 0 THEN 'closed'
        ELSE 'active'
      END,
      updated_at = ?
    WHERE id = ?
  `).run(balanceAfter, balanceAfter, new Date().toISOString(), debtId);
}

export function deleteDebt(id: number): boolean {
  const db = getDb();

  const paymentRows = db.prepare("SELECT transaction_id FROM debt_payments WHERE debt_id = ?").all(id) as Array<{ transaction_id: number }>;

  const run = db.transaction(() => {
    const debtRes = db.prepare("DELETE FROM debts WHERE id = ?").run(id);
    if (debtRes.changes === 0) return false;

    for (const row of paymentRows) {
      db.prepare("DELETE FROM transactions WHERE id = ?").run(row.transaction_id);
    }

    return true;
  });

  return run();
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
