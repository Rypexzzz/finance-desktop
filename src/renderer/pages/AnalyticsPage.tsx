import { useMemo, useState } from "react";
import { useTransactions } from "../features/transactions/hooks";
import { useCategories } from "../features/categories/hooks";
import {
  useCategoryBreakdown,
  useMonthComparison,
  useMonthOverview,
  useMonthlyTrend,
  useYearOverview
} from "../features/analytics/hooks";
import { formatDateRu, formatRub } from "../lib/formatters";
import { getCategoryEmoji } from "../components/CategoryIcon";

const MONTHS_RU = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];
const BREAKDOWN_COLORS = ["#3b82f6", "#22c55e", "#f97316", "#a855f7", "#14b8a6", "#6b7280"];

export function AnalyticsPage() {
  const now = new Date();
  const [periodType, setPeriodType] = useState<"month" | "year">("month");
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [type, setType] = useState<"all" | "income" | "expense" | "service">("all");
  const [categoryId, setCategoryId] = useState<number | undefined>();

  const yearOptions = Array.from({ length: 8 }, (_, i) => now.getFullYear() - i);
  const transactionsQuery = useTransactions({ periodType, year, month: periodType === "month" ? month : undefined, type, categoryId, page: 1, pageSize: 600 });
  const recentQuery = useTransactions({ periodType, year, month: periodType === "month" ? month : undefined, type: "all", sortBy: "date", sortDir: "desc", page: 1, pageSize: 6 });
  const categoriesQuery = useCategories();

  const monthOverviewQuery = useMonthOverview({ year, month, type, categoryId });
  const yearOverviewQuery = useYearOverview({ year, type, categoryId });
  const breakdownQuery = useCategoryBreakdown({ year, month: periodType === "month" ? month : undefined, type, categoryId });
  const trendQuery = useMonthlyTrend(year);
  const comparisonQuery = useMonthComparison(year, month);

  const overview = periodType === "month" ? monthOverviewQuery.data : yearOverviewQuery.data;

  const metrics = {
    income: overview?.incomeRub ?? 0,
    expense: overview?.expenseRub ?? 0,
    net: overview?.netRub ?? 0,
    averageExpense: overview?.averageExpenseRub ?? 0
  };

  const breakdown = useMemo(() => {
    const sorted = (breakdownQuery.data ?? [])
      .map((item, index) => ({ label: item.categoryNameRu, amount: item.amountRub, color: BREAKDOWN_COLORS[index] ?? BREAKDOWN_COLORS[5] }));

    if (sorted.length <= 5) return sorted;
    return [...sorted.slice(0, 4), { label: "Остальные", amount: sorted.slice(4).reduce((acc, item) => acc + item.amount, 0), color: BREAKDOWN_COLORS[5] }];
  }, [breakdownQuery.data]);

  const donutBackground = useMemo(() => {
    const total = breakdown.reduce((acc, item) => acc + item.amount, 0);
    if (total <= 0) return "conic-gradient(var(--surface-2) 0deg 360deg)";
    let start = 0;
    const chunks = breakdown.map((item) => {
      const sweep = (item.amount / total) * 360;
      const end = start + sweep;
      const part = `${item.color} ${start}deg ${end}deg`;
      start = end;
      return part;
    });
    return `conic-gradient(${chunks.join(", ")})`;
  }, [breakdown]);

  const trend = useMemo(() => {
    const months = (trendQuery.data ?? []).map((item) => ({ month: item.month, income: item.incomeRub, expense: item.expenseRub }));
    const fallback = Array.from({ length: 12 }, (_, index) => ({ month: index + 1, income: 0, expense: 0 }));
    const list = months.length ? months : fallback;
    const max = Math.max(...list.map((item) => Math.max(item.income, item.expense)), 1);
    return { months: list, max };
  }, [trendQuery.data]);

  const comparison = useMemo(() => {
    if (comparisonQuery.data) {
      return {
        current: { income: comparisonQuery.data.current.incomeRub, expense: comparisonQuery.data.current.expenseRub },
        previous: { income: comparisonQuery.data.previous.incomeRub, expense: comparisonQuery.data.previous.expenseRub }
      };
    }
    return { current: { income: 0, expense: 0 }, previous: { income: 0, expense: 0 } };
  }, [comparisonQuery.data]);

  const hasError =
    transactionsQuery.isError ||
    recentQuery.isError ||
    monthOverviewQuery.isError ||
    yearOverviewQuery.isError ||
    breakdownQuery.isError ||
    trendQuery.isError ||
    comparisonQuery.isError;

  return (
    <div className="page-stack">
      <div>
        <h1>Аналитика</h1>
        <p className="muted">Единый раздел со сводкой, трендами, структурой расходов и историей операций.</p>
      </div>

      {hasError && <div className="alert error">Ошибка загрузки аналитики.</div>}

      <div className="card analytics-filters-grid">
        <label>Период<select value={periodType} onChange={(e) => setPeriodType(e.target.value as "month" | "year")}><option value="month">Месяц</option><option value="year">Год</option></select></label>
        <label>Год<select value={year} onChange={(e) => setYear(Number(e.target.value))}>{yearOptions.map((item) => (<option key={item} value={item}>{item}</option>))}</select></label>
        {periodType === "month" && (<label>Месяц<select value={month} onChange={(e) => setMonth(Number(e.target.value))}>{MONTHS_RU.map((name, index) => <option key={name} value={index + 1}>{name}</option>)}</select></label>)}
        <label>Тип<select value={type} onChange={(e) => setType(e.target.value as typeof type)}><option value="all">Все</option><option value="income">Доходы</option><option value="expense">Расходы</option><option value="service">Служебные</option></select></label>
        <label>Категория<select value={categoryId ?? ""} onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : undefined)}><option value="">Все категории</option>{(categoriesQuery.data ?? []).map((category) => (<option key={category.id} value={category.id}>{getCategoryEmoji(category.iconName)} {category.nameRu}</option>))}</select></label>
      </div>

      <div className="stats-grid">
        <div className="card stat-card"><div className="stat-label">Доходы</div><div className="stat-value income-text">{formatRub(metrics.income)}</div></div>
        <div className="card stat-card"><div className="stat-label">Расходы</div><div className="stat-value expense-text">{formatRub(metrics.expense)}</div></div>
        <div className="card stat-card"><div className="stat-label">Чистый поток</div><div className={`stat-value ${metrics.net >= 0 ? "income-text" : "expense-text"}`}>{formatRub(metrics.net)}</div></div>
        <div className="card stat-card"><div className="stat-label">Средний расход {periodType === "month" ? "в день" : "в месяц"}</div><div className="stat-value">{formatRub(metrics.averageExpense)}</div></div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h3 className="dashboard-section-title">Тренд доходов/расходов по месяцам</h3>
          <div className="trend-chart">{trend.months.map((item) => (<div key={item.month} className="trend-col"><div className="trend-bars"><div className="trend-bar income" style={{ height: `${Math.round((item.income / trend.max) * 100)}%` }} title={`Доходы: ${formatRub(item.income)}`} /><div className="trend-bar expense" style={{ height: `${Math.round((item.expense / trend.max) * 100)}%` }} title={`Расходы: ${formatRub(item.expense)}`} /></div><span className="muted trend-label">{MONTHS_RU[item.month - 1]}</span></div>))}</div>
        </div>

        <div className="card">
          <h3 className="dashboard-section-title">Структура расходов</h3>
          <div className="dashboard-donut-wrap"><div className="dashboard-donut" style={{ background: donutBackground }} /><div className="dashboard-donut-hole"><div className="muted" style={{ fontSize: 12 }}>Расходы</div><strong>{formatRub(metrics.expense)}</strong></div></div>
          <div className="dashboard-breakdown-list">{breakdown.length === 0 ? <p className="muted">Нет расходных операций.</p> : breakdown.map((item) => (<div className="dashboard-breakdown-row" key={item.label}><span className="dashboard-breakdown-label"><span className="dashboard-breakdown-swatch" style={{ backgroundColor: item.color }} />{item.label}</span><strong>{formatRub(item.amount)}</strong></div>))}</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h3 className="dashboard-section-title">Сравнение с прошлым месяцем</h3>
          <div className="comparison-grid"><div><div className="muted">Текущий месяц доходы</div><strong className="income-text">{formatRub(comparison.current.income)}</strong></div><div><div className="muted">Прошлый месяц доходы</div><strong className="income-text">{formatRub(comparison.previous.income)}</strong></div><div><div className="muted">Текущий месяц расходы</div><strong className="expense-text">{formatRub(comparison.current.expense)}</strong></div><div><div className="muted">Прошлый месяц расходы</div><strong className="expense-text">{formatRub(comparison.previous.expense)}</strong></div></div>
        </div>
        <div className="card">
          <h3 className="dashboard-section-title">Последние операции</h3>
          <div className="dashboard-recent-list">{(recentQuery.data?.items ?? []).map((item) => (<div className="dashboard-recent-row" key={item.id}><div className="dashboard-recent-main"><strong>{item.categoryNameRu}</strong><span className="muted">{formatDateRu(item.date)} • {item.comment || "Без комментария"}</span></div><span className={`dashboard-recent-amount ${item.type === "income" ? "income-text" : "expense-text"}`}>{item.type === "income" ? "+" : "-"}{formatRub(item.amountRub)}</span></div>))}</div>
        </div>
      </div>

      <div className="card table-wrap">
        <div className="table-header"><h3>История операций</h3><span className="muted">{transactionsQuery.data?.total ?? 0} записей</span></div>
        <table className="table">
          <thead><tr><th>Дата</th><th>Категория</th><th>Тип</th><th className="align-right">Сумма</th><th>Комментарий</th></tr></thead>
          <tbody>
            {(transactionsQuery.data?.items ?? []).map((item) => (
              <tr key={item.id}><td>{item.date}</td><td>{item.categoryNameRu}</td><td>{item.type === "service" ? "служебная" : item.type === "income" ? "доход" : "расход"}</td><td className="align-right">{formatRub(item.amountRub)}</td><td>{item.comment || "—"}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
