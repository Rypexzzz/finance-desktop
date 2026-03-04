import { getDb } from "../client";
import type {
  AddGoalContributionInput,
  CreateGoalInput,
  GoalContribution,
  GoalStatus,
  GoalWithProgress,
  UpdateGoalInput
} from "../../../shared/types/goal";

export function listGoals(year: number, month: number): GoalWithProgress[] {
  const db = getDb();
  const ym = `${year}-${String(month).padStart(2, "0")}`;
  const rows = db.prepare(`
    SELECT
      g.*,
      COALESCE((SELECT SUM(gc.amount_rub) FROM goal_contributions gc WHERE gc.goal_id = g.id), 0) as contributed_total_rub,
      COALESCE((SELECT SUM(gc.amount_rub) FROM goal_contributions gc WHERE gc.goal_id = g.id AND substr(gc.date, 1, 7) = ?), 0) as month_contributions_rub
    FROM goals g
    ORDER BY g.status ASC, g.created_at DESC
  `).all(ym) as Array<any>;

  return rows.map((row) => {
    const current = row.start_amount_rub + row.contributed_total_rub;
    const targetDelta = Math.max(1, row.target_amount_rub - row.start_amount_rub);
    return {
      id: row.id,
      name: row.name,
      targetAmountRub: row.target_amount_rub,
      startAmountRub: row.start_amount_rub,
      monthlyPlanRub: row.monthly_plan_rub,
      deadlineDate: row.deadline_date,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      contributedTotalRub: row.contributed_total_rub,
      currentAmountRub: current,
      progressTotal: (current - row.start_amount_rub) / targetDelta,
      monthContributionsRub: row.month_contributions_rub,
      progressMonth: row.monthly_plan_rub ? row.month_contributions_rub / row.monthly_plan_rub : null
    } as GoalWithProgress;
  });
}

export function createGoal(payload: CreateGoalInput): number {
  const db = getDb();
  const now = new Date().toISOString();
  const result = db.prepare(`
    INSERT INTO goals (name, target_amount_rub, start_amount_rub, monthly_plan_rub, deadline_date, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 'active', ?, ?)
  `).run(
    payload.name,
    payload.targetAmountRub,
    payload.startAmountRub ?? 0,
    payload.monthlyPlanRub ?? null,
    payload.deadlineDate ?? null,
    now,
    now
  );

  return Number(result.lastInsertRowid);
}

export function updateGoal(id: number, payload: UpdateGoalInput): number | null {
  const db = getDb();
  const sets: string[] = [];
  const params: unknown[] = [];
  if (payload.name !== undefined) { sets.push("name = ?"); params.push(payload.name); }
  if (payload.targetAmountRub !== undefined) { sets.push("target_amount_rub = ?"); params.push(payload.targetAmountRub); }
  if (payload.startAmountRub !== undefined) { sets.push("start_amount_rub = ?"); params.push(payload.startAmountRub); }
  if (payload.monthlyPlanRub !== undefined) { sets.push("monthly_plan_rub = ?"); params.push(payload.monthlyPlanRub); }
  if (payload.deadlineDate !== undefined) { sets.push("deadline_date = ?"); params.push(payload.deadlineDate); }
  if (!sets.length) return id;
  sets.push("updated_at = ?"); params.push(new Date().toISOString());
  params.push(id);
  const res = db.prepare(`UPDATE goals SET ${sets.join(", ")} WHERE id = ?`).run(...params);
  return res.changes > 0 ? id : null;
}

export function changeGoalStatus(id: number, status: GoalStatus): number | null {
  const db = getDb();
  const res = db.prepare("UPDATE goals SET status = ?, updated_at = ? WHERE id = ?").run(status, new Date().toISOString(), id);
  return res.changes > 0 ? id : null;
}

export function getGoalById(id: number) {
  const db = getDb();
  return db.prepare("SELECT * FROM goals WHERE id = ?").get(id) as any;
}

export function listGoalContributions(goalId: number, page = 1, pageSize = 20): { items: GoalContribution[]; total: number } {
  const db = getDb();
  const limit = Math.max(1, Math.min(pageSize, 200));
  const offset = Math.max(0, (page - 1) * limit);
  const totalRow = db.prepare(`SELECT COUNT(*) as total FROM goal_contributions WHERE goal_id = ?`).get(goalId) as { total: number };
  const rows = db.prepare(`SELECT * FROM goal_contributions WHERE goal_id = ? ORDER BY date DESC, id DESC LIMIT ? OFFSET ?`).all(goalId, limit, offset) as Array<any>;
  return {
    total: totalRow?.total ?? 0,
    items: rows.map((row) => ({
    id: row.id,
    goalId: row.goal_id,
    transactionId: row.transaction_id,
    amountRub: row.amount_rub,
    date: row.date,
    comment: row.comment ?? "",
    createdAt: row.created_at
  }))
  };
}

export function addGoalContribution(goalId: number, transactionId: number, payload: AddGoalContributionInput): number {
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO goal_contributions (goal_id, transaction_id, amount_rub, date, comment, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(goalId, transactionId, payload.amountRub, payload.date, payload.comment ?? "", new Date().toISOString());
  return Number(result.lastInsertRowid);
}
