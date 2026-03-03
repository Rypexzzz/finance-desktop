import { useMemo, useState } from "react";
import { useTransactions } from "../features/transactions/hooks";
import { useCategories } from "../features/categories/hooks";
import { formatRub } from "../lib/formatters";

const MONTHS_RU = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];

export function AnalyticsPage() {
  const now = new Date();
  const [periodType, setPeriodType] = useState<"month" | "year">("month");
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [type, setType] = useState<"all" | "income" | "expense" | "service">("all");
  const [categoryId, setCategoryId] = useState<number | undefined>();

  const yearOptions = Array.from({ length: 8 }, (_, i) => now.getFullYear() - i);
  const transactionsQuery = useTransactions({
    periodType,
    year,
    month: periodType === "month" ? month : undefined,
    type,
    categoryId,
    page: 1,
    pageSize: 600
  });

  const yearQuery = useTransactions({
    periodType: "year",
    year,
    type: "all",
    page: 1,
    pageSize: 1200
  });

  const categoriesQuery = useCategories();

  const metrics = useMemo(() => {
    const items = transactionsQuery.data?.items ?? [];
    const expenses = items.filter((item) => item.type === "expense");
    const income = items.filter((item) => item.type === "income").reduce((acc, item) => acc + item.amountRub, 0);
    const expense = expenses.reduce((acc, item) => acc + item.amountRub, 0);
    const service = items.filter((item) => item.type === "service").reduce((acc, item) => acc + item.amountRub, 0);
    const net = income - expense;

    const averageExpense = Math.round(expense / Math.max(periodType === "month" ? new Date(year, month, 0).getDate() : 12, 1));

    const byCategory = new Map<string, number>();
    for (const item of expenses) {
      byCategory.set(item.categoryNameRu, (byCategory.get(item.categoryNameRu) ?? 0) + item.amountRub);
    }

    const topCategories = Array.from(byCategory.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);

    return { income, expense, net, service, averageExpense, topCategories };
  }, [transactionsQuery.data?.items, periodType, year, month]);

  const trend = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, index) => ({ month: index + 1, income: 0, expense: 0 }));
    for (const item of yearQuery.data?.items ?? []) {
      if (item.type === "service") continue;
      const m = Number(item.date.slice(5, 7));
      const bucket = months[m - 1];
      if (!bucket) continue;
      if (item.type === "income") bucket.income += item.amountRub;
      if (item.type === "expense") bucket.expense += item.amountRub;
    }
    const max = Math.max(...months.map((item) => Math.max(item.income, item.expense)), 1);
    return { months, max };
  }, [yearQuery.data?.items]);

  const comparison = useMemo(() => {
    const current = trend.months[month - 1] ?? { income: 0, expense: 0 };
    const prevIndex = month === 1 ? 11 : month - 2;
    const previous = trend.months[prevIndex] ?? { income: 0, expense: 0 };
    return { current, previous };
  }, [trend.months, month]);

  return (
    <div className="page-stack">
      <div>
        <h1>Аналитика</h1>
        <p className="muted">Доходы, расходы, средние значения, тренды и топ категорий за выбранный период.</p>
      </div>

      <div className="card analytics-filters-grid">
        <label>
          Период
          <select value={periodType} onChange={(e) => setPeriodType(e.target.value as "month" | "year")}>
            <option value="month">Месяц</option>
            <option value="year">Год</option>
          </select>
        </label>
        <label>
          Год
          <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {yearOptions.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>
        {periodType === "month" && (
          <label>
            Месяц
            <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
              {MONTHS_RU.map((name, index) => <option key={name} value={index + 1}>{name}</option>)}
            </select>
          </label>
        )}
        <label>
          Тип
          <select value={type} onChange={(e) => setType(e.target.value as typeof type)}>
            <option value="all">Все</option>
            <option value="income">Доходы</option>
            <option value="expense">Расходы</option>
            <option value="service">Служебные</option>
          </select>
        </label>
        <label>
          Категория
          <select value={categoryId ?? ""} onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : undefined)}>
            <option value="">Все категории</option>
            {(categoriesQuery.data ?? []).map((category) => (
              <option key={category.id} value={category.id}>{category.emoji} {category.nameRu}</option>
            ))}
          </select>
        </label>
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
          <div className="trend-chart">
            {trend.months.map((item) => (
              <div key={item.month} className="trend-col">
                <div className="trend-bars">
                  <div className="trend-bar income" style={{ height: `${Math.round((item.income / trend.max) * 100)}%` }} title={`Доходы: ${formatRub(item.income)}`} />
                  <div className="trend-bar expense" style={{ height: `${Math.round((item.expense / trend.max) * 100)}%` }} title={`Расходы: ${formatRub(item.expense)}`} />
                </div>
                <span className="muted trend-label">{MONTHS_RU[item.month - 1]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="dashboard-section-title">Сравнение с прошлым месяцем</h3>
          <div className="comparison-grid">
            <div><div className="muted">Текущий месяц доходы</div><strong className="income-text">{formatRub(comparison.current.income)}</strong></div>
            <div><div className="muted">Прошлый месяц доходы</div><strong className="income-text">{formatRub(comparison.previous.income)}</strong></div>
            <div><div className="muted">Текущий месяц расходы</div><strong className="expense-text">{formatRub(comparison.current.expense)}</strong></div>
            <div><div className="muted">Прошлый месяц расходы</div><strong className="expense-text">{formatRub(comparison.previous.expense)}</strong></div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h3 className="dashboard-section-title">Топ категорий расходов</h3>
          {metrics.topCategories.length === 0 ? <p className="muted">Нет расходных операций.</p> : metrics.topCategories.map(([name, amount]) => (
            <div className="dashboard-breakdown-row" key={name}><span>{name}</span><strong>{formatRub(amount)}</strong></div>
          ))}
        </div>

        <div className="card">
          <h3 className="dashboard-section-title">Служебные операции</h3>
          <p className="muted">Исключаются из базовой аналитики доходов/расходов и учитываются отдельно.</p>
          <div className="stat-value">{formatRub(metrics.service)}</div>
        </div>
      </div>

      <div className="card table-wrap">
        <div className="table-header"><h3>История операций</h3><span className="muted">{transactionsQuery.data?.total ?? 0} записей</span></div>
        <table className="table">
          <thead><tr><th>Дата</th><th>Категория</th><th>Тип</th><th className="align-right">Сумма</th><th>Комментарий</th></tr></thead>
          <tbody>
            {(transactionsQuery.data?.items ?? []).map((item) => (
              <tr key={item.id}><td>{item.date}</td><td>{item.categoryNameRu}</td><td>{item.type}</td><td className="align-right">{formatRub(item.amountRub)}</td><td>{item.comment || "—"}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
