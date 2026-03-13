import { useMemo, useState } from "react";
import { formatDateRu, formatRub } from "../lib/formatters";
import {
  useAddDebtPayment,
  useChangeDebtStatus,
  useCreateDebt,
  useDebtPayments,
  useDebts,
  useDeleteDebt,
  useUpdateDebt
} from "../features/debts/hooks";
import type { DebtStatus, DebtType } from "../../shared/types/debt";

const TODAY = new Date().toISOString().slice(0, 10);

function getMonthsUntilDate(targetDate: string): number | null {
  if (!targetDate) return null;
  const parsed = new Date(targetDate);
  if (Number.isNaN(parsed.getTime())) return null;
  const now = new Date(TODAY);
  const months = (parsed.getFullYear() - now.getFullYear()) * 12 + (parsed.getMonth() - now.getMonth()) + 1;
  return Math.max(1, months);
}

function buildDeadlineFromMonthlyPlan(initialAmount: number, monthlyPlan: number): string {
  const monthsRequired = Math.max(1, Math.ceil(initialAmount / monthlyPlan));
  const deadline = new Date(TODAY);
  deadline.setMonth(deadline.getMonth() + monthsRequired - 1);
  return deadline.toISOString().slice(0, 10);
}

const DEBT_STATUS_LABELS: Record<DebtStatus, string> = {
  active: "Активный",
  paused: "На паузе",
  closed: "Закрыт",
  cancelled: "Отменён"
};

export function DebtsPage() {
  const [selectedDebtId, setSelectedDebtId] = useState<number | undefined>();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [debtType, setDebtType] = useState<DebtType>("loan");
  const [name, setName] = useState("");
  const [initialAmountRub, setInitialAmountRub] = useState(300000);
  const [monthlyPlanRub, setMonthlyPlanRub] = useState(0);
  const [minimumPaymentRub, setMinimumPaymentRub] = useState(0);
  const [targetCloseDate, setTargetCloseDate] = useState("");

  const [payAmount, setPayAmount] = useState(10000);
  const [payDate, setPayDate] = useState(TODAY);
  const [payComment, setPayComment] = useState("");

  const [editName, setEditName] = useState("");
  const [editPlan, setEditPlan] = useState(0);

  const debtsQuery = useDebts();
  const paymentsQuery = useDebtPayments(selectedDebtId);

  const createDebt = useCreateDebt();
  const updateDebt = useUpdateDebt();
  const changeStatus = useChangeDebtStatus();
  const addPayment = useAddDebtPayment();
  const deleteDebt = useDeleteDebt();

  const selectedDebt = (debtsQuery.data ?? []).find((item) => item.id === selectedDebtId);

  const summary = useMemo(() => {
    const debts = debtsQuery.data ?? [];
    return {
      total: debts.length,
      active: debts.filter((d) => d.status === "active").length,
      paidTotal: debts.reduce((acc, d) => acc + d.paidTotalRub, 0)
    };
  }, [debtsQuery.data]);

  async function onCreateDebt() {
    await createDebt.mutateAsync({
      debtType,
      name,
      initialAmountRub,
      monthlyPlanRub: monthlyPlanRub > 0 ? monthlyPlanRub : null,
      minimumPaymentRub: minimumPaymentRub > 0 ? minimumPaymentRub : null,
      targetCloseDate: targetCloseDate || null
    });
    setName("");
    setInitialAmountRub(300000);
    setMonthlyPlanRub(0);
    setMinimumPaymentRub(0);
    setTargetCloseDate("");
    setDebtType("loan");
    setIsCreateOpen(false);
  }

  function onTargetCloseDateChange(value: string) {
    setTargetCloseDate(value);
    const months = getMonthsUntilDate(value);
    if (!months || initialAmountRub <= 0) return;
    setMonthlyPlanRub(Math.ceil(initialAmountRub / months));
  }

  function onMonthlyPlanChange(value: number) {
    setMonthlyPlanRub(value);
    if (!Number.isFinite(value) || value <= 0 || initialAmountRub <= 0) return;
    setTargetCloseDate(buildDeadlineFromMonthlyPlan(initialAmountRub, value));
  }

  async function onAddPayment() {
    if (!selectedDebtId) return;
    await addPayment.mutateAsync({
      debtId: selectedDebtId,
      payload: { amountRub: payAmount, date: payDate, comment: payComment || undefined }
    });
    setPayComment("");
  }

  async function onSaveEdit() {
    if (!selectedDebtId) return;
    await updateDebt.mutateAsync({
      id: selectedDebtId,
      payload: {
        name: editName || undefined,
        monthlyPlanRub: editPlan > 0 ? editPlan : null
      }
    });
  }

  async function onChangeStatus(debtId: number, status: DebtStatus) {
    await changeStatus.mutateAsync({ id: debtId, status });
  }

  async function onDeleteDebt(debtId: number) {
    await deleteDebt.mutateAsync(debtId);
    if (selectedDebtId === debtId) {
      setSelectedDebtId(undefined);
    }
  }

  return (
    <div className="page-stack">
      <div className="page-header-row">
        <div>
          <h1>Долги</h1>
          <p className="muted">Кредиты и кредитные карты с историей погашений.</p>
        </div>
        <div className="header-actions">
          <button className="btn expense-btn" onClick={() => setIsCreateOpen(true)}>+ Новый долг</button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="card stat-card"><div className="stat-label">Всего долгов</div><div className="stat-value">{summary.total}</div></div>
        <div className="card stat-card"><div className="stat-label">Активные</div><div className="stat-value">{summary.active}</div></div>
        <div className="card stat-card"><div className="stat-label">Погашено</div><div className="stat-value income-text">{formatRub(summary.paidTotal)}</div></div>
      </div>

      <div className="goals-grid">
        {(debtsQuery.data ?? []).length === 0 && (
          <div className="card" style={{ gridColumn: "1 / -1" }}>
            <div className="empty-state">
              <div className="empty-state-icon">🏦</div>
              <h3 className="empty-state-title">Нет долгов</h3>
              <p className="empty-state-desc">Добавьте кредит или кредитную карту для отслеживания погашений.</p>
            </div>
          </div>
        )}
        {(debtsQuery.data ?? []).map((debt) => {
          const totalPercent = Math.max(0, Math.min(100, Math.round(debt.progressTotal * 100)));
          const monthPercent = debt.progressMonth === null ? null : Math.max(0, Math.min(100, Math.round(debt.progressMonth * 100)));
          const isSelected = selectedDebtId === debt.id;
          return (
            <div className={`card goal-card ${isSelected ? "selected" : ""}`} key={debt.id}>
              <div className="goal-card-header">
                <div className="goal-card-title">
                  <span className={`status-dot ${debt.status}`} />
                  {debt.name}
                </div>
                <select value={debt.status} onChange={(e) => onChangeStatus(debt.id, e.target.value as DebtStatus)} style={{ maxWidth: 140 }}>
                  <option value="active">{DEBT_STATUS_LABELS.active}</option><option value="paused">{DEBT_STATUS_LABELS.paused}</option><option value="closed">{DEBT_STATUS_LABELS.closed}</option><option value="cancelled">{DEBT_STATUS_LABELS.cancelled}</option>
                </select>
              </div>
              <div className="goal-card-amounts">
                <span className="goal-card-current expense-text">{formatRub(debt.currentBalanceRub)}</span>
                <span className="goal-card-target">из {formatRub(debt.initialAmountRub)}</span>
              </div>
              {monthPercent !== null && (
                <>
                  <div className="progress-bar"><div className="progress-fill" style={{ width: `${monthPercent}%` }} /></div>
                  <div className="muted" style={{ fontSize: 12 }}>Прогресс за месяц: <strong>{monthPercent}%</strong></div>
                </>
              )}
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${totalPercent}%` }} /></div>
              <div className="goal-card-footer">
                <span className="goal-card-percent">{totalPercent}%</span>
                <div className="row-actions">
                  <button className="btn primary" style={{ padding: "7px 14px", fontSize: 13 }} onClick={() => { setSelectedDebtId(debt.id); setEditName(debt.name); setEditPlan(debt.monthlyPlanRub ?? 0); }}>
                    {isSelected ? "Выбран" : "Выбрать"}
                  </button>
                  <button className="btn ghost danger" style={{ padding: "7px 14px", fontSize: 13 }} onClick={() => onDeleteDebt(debt.id)}>Удалить</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <h3>Управление долгом {selectedDebt ? `— ${selectedDebt.name}` : ""}</h3>
        {!selectedDebtId ? <p className="muted">Выберите долг для редактирования и погашения.</p> : (
          <>
            <div className="analytics-filters-grid">
              <label>Название<input value={editName} onChange={(e) => setEditName(e.target.value)} /></label>
              <label>План/мес<input type="number" value={editPlan} onChange={(e) => setEditPlan(Number(e.target.value))} /></label>
              <div className="form-actions-inline"><button className="btn" onClick={onSaveEdit}>Сохранить изменения</button></div>
            </div>
            <div className="analytics-filters-grid" style={{ marginTop: 12 }}>
              <label>Сумма погашения<input type="number" value={payAmount} onChange={(e) => setPayAmount(Number(e.target.value))} /></label>
              <label>Дата<input type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} /></label>
              <label>Комментарий<input value={payComment} onChange={(e) => setPayComment(e.target.value)} /></label>
              <div className="form-actions-inline"><button className="btn primary" onClick={onAddPayment}>Погасить долг</button></div>
            </div>
          </>
        )}
      </div>

      <div className="card">
        <h3>История погашений {selectedDebt ? `— ${selectedDebt.name}` : ""}</h3>
        {!selectedDebtId ? <p className="muted">Выберите долг, чтобы увидеть историю.</p> : (
          <div className="table-wrap"><table className="table"><thead><tr><th>Дата</th><th className="align-right">Сумма</th><th className="align-right">До</th><th className="align-right">После</th><th>Комментарий</th></tr></thead><tbody>{(paymentsQuery.data ?? []).map((item) => <tr key={item.id}><td>{formatDateRu(item.date)}</td><td className="align-right">{formatRub(item.amountRub)}</td><td className="align-right">{formatRub(item.balanceBeforeRub)}</td><td className="align-right">{formatRub(item.balanceAfterRub)}</td><td>{item.comment || "—"}</td></tr>)}</tbody></table></div>
        )}
      </div>

      {isCreateOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Новый долг" onClick={() => setIsCreateOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Новый долг</h3>
            </div>
            <div className="form-grid">
              <label>Тип<select value={debtType} onChange={(e) => setDebtType(e.target.value as DebtType)}><option value="loan">Кредит</option><option value="credit_card">Кредитная карта</option></select></label>
              <label>Название<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Например: Ипотека" /></label>
              <label>Сумма долга, ₽<input type="number" value={initialAmountRub} onChange={(e) => setInitialAmountRub(Number(e.target.value))} /></label>
              <label>Мин. платёж, ₽<input type="number" value={minimumPaymentRub} onChange={(e) => setMinimumPaymentRub(Number(e.target.value))} /></label>
              <label>План в месяц, ₽<input type="number" value={monthlyPlanRub} onChange={(e) => onMonthlyPlanChange(Number(e.target.value))} /></label>
              <label>Цель закрытия<input type="date" value={targetCloseDate} onChange={(e) => onTargetCloseDateChange(e.target.value)} /></label>
            </div>
            <div className="modal-actions">
              <button className="btn" onClick={() => setIsCreateOpen(false)}>Отмена</button>
              <button className="btn primary" onClick={onCreateDebt} disabled={!name.trim()}>Добавить долг</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
