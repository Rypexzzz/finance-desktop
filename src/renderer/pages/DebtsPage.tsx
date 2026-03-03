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

const DEBT_STATUS_LABELS: Record<DebtStatus, string> = {
  active: "Активный",
  paused: "На паузе",
  closed: "Закрыт",
  cancelled: "Отменён"
};

export function DebtsPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [selectedDebtId, setSelectedDebtId] = useState<number | undefined>();

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

  const debtsQuery = useDebts({ year, month });
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
      paidMonth: debts.reduce((acc, d) => acc + d.paidMonthRub, 0)
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
      <div><h1>Долги</h1><p className="muted">Кредиты и кредитные карты с историей погашений и служебными транзакциями.</p></div>

      <div className="card analytics-filters-grid">
        <label>Год<input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} /></label>
        <label>Месяц<input type="number" min={1} max={12} value={month} onChange={(e) => setMonth(Number(e.target.value))} /></label>
      </div>

      <div className="stats-grid">
        <div className="card stat-card"><div className="stat-label">Всего долгов</div><div className="stat-value">{summary.total}</div></div>
        <div className="card stat-card"><div className="stat-label">Активные</div><div className="stat-value">{summary.active}</div></div>
        <div className="card stat-card"><div className="stat-label">Погашено за месяц</div><div className="stat-value income-text">{formatRub(summary.paidMonth)}</div></div>
      </div>

      <div className="card analytics-filters-grid">
        <label>Тип<select value={debtType} onChange={(e) => setDebtType(e.target.value as DebtType)}><option value="loan">Кредит</option><option value="credit_card">Кредитная карта</option></select></label>
        <label>Название<input value={name} onChange={(e) => setName(e.target.value)} /></label>
        <label>Начальный долг, ₽<input type="number" value={initialAmountRub} onChange={(e) => setInitialAmountRub(Number(e.target.value))} /></label>
        <label>План/мес, ₽<input type="number" value={monthlyPlanRub} onChange={(e) => setMonthlyPlanRub(Number(e.target.value))} /></label>
        <label>Мин. платеж, ₽<input type="number" value={minimumPaymentRub} onChange={(e) => setMinimumPaymentRub(Number(e.target.value))} /></label>
        <label>Цель закрытия<input type="date" value={targetCloseDate} onChange={(e) => setTargetCloseDate(e.target.value)} /></label>
        <div className="form-actions-inline"><button className="btn primary" onClick={onCreateDebt}>+ Добавить долг</button></div>
      </div>

      <div className="goals-grid">
        {(debtsQuery.data ?? []).map((debt) => {
          const totalPercent = Math.max(0, Math.min(100, Math.round(debt.progressTotal * 100)));
          const monthPercent = debt.progressMonth === null ? null : Math.max(0, Math.min(100, Math.round(debt.progressMonth * 100)));
          return (
            <div className="card" key={debt.id}>
              <div className="goal-title-row">
                <strong>{debt.name}</strong>
                <select value={debt.status} onChange={(e) => onChangeStatus(debt.id, e.target.value as DebtStatus)}>
                  <option value="active">{DEBT_STATUS_LABELS.active}</option><option value="paused">{DEBT_STATUS_LABELS.paused}</option><option value="closed">{DEBT_STATUS_LABELS.closed}</option><option value="cancelled">{DEBT_STATUS_LABELS.cancelled}</option>
                </select>
              </div>
              <p className="muted">Остаток {formatRub(debt.currentBalanceRub)} из {formatRub(debt.initialAmountRub)}</p>
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${totalPercent}%` }} /></div>
              <div className="goal-title-row"><span>Общий прогресс: {totalPercent}%</span><div className="row-actions"><button className="btn" onClick={() => { setSelectedDebtId(debt.id); setEditName(debt.name); setEditPlan(debt.monthlyPlanRub ?? 0); }}>Выбрать</button><button className="btn ghost danger" onClick={() => onDeleteDebt(debt.id)}>Удалить долг</button></div></div>
              <div className="muted">За месяц: {debt.monthlyPlanRub ? `${monthPercent}% от плана` : formatRub(debt.paidMonthRub)}</div>
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
    </div>
  );
}
