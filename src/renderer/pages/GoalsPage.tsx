import { useMemo, useState } from "react";
import { formatDateRu, formatRub } from "../lib/formatters";
import {
  useAddGoalContribution,
  useChangeGoalStatus,
  useCreateGoal,
  useGoalContributions,
  useGoals,
  useUpdateGoal
} from "../features/goals/hooks";
import type { GoalStatus } from "../../shared/types/goal";

const TODAY = new Date().toISOString().slice(0, 10);

const GOAL_STATUS_LABELS: Record<GoalStatus, string> = {
  active: "Активная",
  paused: "На паузе",
  completed: "Выполнена",
  cancelled: "Отменена"
};

export function GoalsPage() {
  const [selectedGoalId, setSelectedGoalId] = useState<number | undefined>();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [targetAmountRub, setTargetAmountRub] = useState(100000);
  const [startAmountRub, setStartAmountRub] = useState(0);
  const [monthlyPlanRub, setMonthlyPlanRub] = useState(0);
  const [deadlineDate, setDeadlineDate] = useState("");

  const [contribAmount, setContribAmount] = useState(5000);
  const [contribDate, setContribDate] = useState(TODAY);
  const [contribComment, setContribComment] = useState("");

  const [editName, setEditName] = useState("");
  const [editPlan, setEditPlan] = useState(0);

  const goalsQuery = useGoals();
  const contributionsQuery = useGoalContributions(selectedGoalId);

  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();
  const changeStatus = useChangeGoalStatus();
  const addContribution = useAddGoalContribution();

  const selectedGoal = (goalsQuery.data ?? []).find((goal) => goal.id === selectedGoalId);

  const summary = useMemo(() => {
    const goals = goalsQuery.data ?? [];
    return {
      total: goals.length,
      completed: goals.filter((g) => g.status === "completed" || g.progressTotal >= 1).length,
      monthAdded: goals.reduce((acc, g) => acc + g.monthContributionsRub, 0)
    };
  }, [goalsQuery.data]);

  async function onCreateGoal() {
    await createGoal.mutateAsync({
      name,
      targetAmountRub,
      startAmountRub,
      monthlyPlanRub: monthlyPlanRub > 0 ? monthlyPlanRub : null,
      deadlineDate: deadlineDate || null
    });
    setName("");
    setTargetAmountRub(100000);
    setStartAmountRub(0);
    setMonthlyPlanRub(0);
    setDeadlineDate("");
    setIsCreateOpen(false);
  }

  async function onAddContribution() {
    if (!selectedGoalId) return;
    await addContribution.mutateAsync({
      goalId: selectedGoalId,
      payload: { amountRub: contribAmount, date: contribDate, comment: contribComment || undefined }
    });
    setContribComment("");
  }

  async function onChangeStatus(goalId: number, status: GoalStatus) {
    await changeStatus.mutateAsync({ id: goalId, status });
  }

  async function onSaveEdit() {
    if (!selectedGoalId) return;
    await updateGoal.mutateAsync({
      id: selectedGoalId,
      payload: {
        name: editName || undefined,
        monthlyPlanRub: editPlan > 0 ? editPlan : null
      }
    });
  }

  return (
    <div className="page-stack">
      <div className="page-header-row">
        <div>
          <h1>Цели накоплений</h1>
          <p className="muted">Полноценный учёт целей: статус, пополнения, прогресс и история.</p>
        </div>
        <div className="header-actions">
          <button className="btn income-btn" onClick={() => setIsCreateOpen(true)}>+ Новая цель</button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="card stat-card"><div className="stat-label">Всего целей</div><div className="stat-value">{summary.total}</div></div>
        <div className="card stat-card"><div className="stat-label">Выполнено</div><div className="stat-value income-text">{summary.completed}</div></div>
        <div className="card stat-card"><div className="stat-label">Пополнения за месяц</div><div className="stat-value">{formatRub(summary.monthAdded)}</div></div>
      </div>

      <div className="goals-grid">
        {(goalsQuery.data ?? []).length === 0 && (
          <div className="card" style={{ gridColumn: "1 / -1" }}>
            <div className="empty-state">
              <div className="empty-state-icon">🎯</div>
              <h3 className="empty-state-title">Нет целей</h3>
              <p className="empty-state-desc">Создайте первую цель накоплений, чтобы начать отслеживать прогресс.</p>
            </div>
          </div>
        )}
        {(goalsQuery.data ?? []).map((goal) => {
          const totalPercent = Math.max(0, Math.min(100, Math.round(goal.progressTotal * 100)));
          const monthPercent = goal.progressMonth === null ? null : Math.max(0, Math.min(100, Math.round(goal.progressMonth * 100)));
          const isSelected = selectedGoalId === goal.id;
          return (
            <div className={`card goal-card ${isSelected ? "selected" : ""}`} key={goal.id}>
              <div className="goal-card-header">
                <div className="goal-card-title">
                  <span className={`status-dot ${goal.status}`} />
                  {goal.name}
                </div>
                <select value={goal.status} onChange={(e) => onChangeStatus(goal.id, e.target.value as GoalStatus)} style={{ maxWidth: 140 }}>
                  <option value="active">{GOAL_STATUS_LABELS.active}</option><option value="paused">{GOAL_STATUS_LABELS.paused}</option><option value="completed">{GOAL_STATUS_LABELS.completed}</option><option value="cancelled">{GOAL_STATUS_LABELS.cancelled}</option>
                </select>
              </div>
              <div className="goal-card-amounts">
                <span className="goal-card-current">{formatRub(goal.currentAmountRub)}</span>
                <span className="goal-card-target">из {formatRub(goal.targetAmountRub)}</span>
              </div>
              {goal.deadlineDate && <div className="muted" style={{ fontSize: 12, marginBottom: 4 }}>До {formatDateRu(goal.deadlineDate)}</div>}
              {monthPercent !== null && (
                <>
                  <div className="progress-bar"><div className="progress-fill" style={{ width: `${monthPercent}%` }} /></div>
                  <div className="muted" style={{ fontSize: 12 }}>Прогресс за месяц: <strong>{monthPercent}%</strong></div>
                </>
              )}
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${totalPercent}%` }} /></div>
              <div className="goal-card-footer">
                <span className="goal-card-percent">{totalPercent}%</span>
                <button className="btn primary" style={{ padding: "7px 14px", fontSize: 13 }} onClick={() => { setSelectedGoalId(goal.id); setEditName(goal.name); setEditPlan(goal.monthlyPlanRub ?? 0); }}>
                  {isSelected ? "Выбрана" : "Выбрать"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <h3>Управление целью {selectedGoal ? `— ${selectedGoal.name}` : ""}</h3>
        {!selectedGoalId ? <p className="muted">Выберите цель для редактирования и пополнения.</p> : (
          <>
            <div className="analytics-filters-grid">
              <label>Название<input value={editName} onChange={(e) => setEditName(e.target.value)} /></label>
              <label>План/мес<input type="number" value={editPlan} onChange={(e) => setEditPlan(Number(e.target.value))} /></label>
              <div className="form-actions-inline"><button className="btn" onClick={onSaveEdit}>Сохранить изменения</button></div>
            </div>
            <div className="analytics-filters-grid" style={{ marginTop: 12 }}>
              <label>Сумма пополнения<input type="number" value={contribAmount} onChange={(e) => setContribAmount(Number(e.target.value))} /></label>
              <label>Дата<input type="date" value={contribDate} onChange={(e) => setContribDate(e.target.value)} /></label>
              <label>Комментарий<input value={contribComment} onChange={(e) => setContribComment(e.target.value)} /></label>
              <div className="form-actions-inline"><button className="btn primary" onClick={onAddContribution}>Пополнить цель</button></div>
            </div>
          </>
        )}
      </div>

      <div className="card">
        <h3>История пополнений {selectedGoal ? `— ${selectedGoal.name}` : ""}</h3>
        {!selectedGoalId ? <p className="muted">Выберите цель, чтобы увидеть историю.</p> : (
          <div className="table-wrap"><table className="table"><thead><tr><th>Дата</th><th className="align-right">Сумма</th><th>Комментарий</th></tr></thead><tbody>{(contributionsQuery.data ?? []).map((item) => <tr key={item.id}><td>{formatDateRu(item.date)}</td><td className="align-right">{formatRub(item.amountRub)}</td><td>{item.comment || "—"}</td></tr>)}</tbody></table></div>
        )}
      </div>

      {isCreateOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Новая цель" onClick={() => setIsCreateOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Новая цель накоплений</h3>
            </div>
            <div className="form-grid">
              <label className="full">Название<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Например: Отпуск" /></label>
              <label>Целевая сумма, ₽<input type="number" value={targetAmountRub} onChange={(e) => setTargetAmountRub(Number(e.target.value))} /></label>
              <label>Начальная сумма, ₽<input type="number" value={startAmountRub} onChange={(e) => setStartAmountRub(Number(e.target.value))} /></label>
              <label>План в месяц, ₽<input type="number" value={monthlyPlanRub} onChange={(e) => setMonthlyPlanRub(Number(e.target.value))} /></label>
              <label>Дедлайн<input type="date" value={deadlineDate} onChange={(e) => setDeadlineDate(e.target.value)} /></label>
            </div>
            <div className="modal-actions">
              <button className="btn" onClick={() => setIsCreateOpen(false)}>Отмена</button>
              <button className="btn primary" onClick={onCreateGoal} disabled={!name.trim()}>Создать цель</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
