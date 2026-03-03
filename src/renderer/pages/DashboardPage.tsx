import { useMemo, useState } from "react";
import { useTransactions } from "../features/transactions/hooks";
import { formatDateRu, formatRub } from "../lib/formatters";
import { CategoryIcon } from "../components/CategoryIcon";

function getMonthName(monthIndex: number) {
  return new Intl.DateTimeFormat("ru-RU", { month: "long" }).format(new Date(2025, monthIndex, 1));
}

const BREAKDOWN_COLORS = ["#3b82f6", "#22c55e", "#f97316", "#a855f7", "#14b8a6", "#6b7280"];
const MONTHS_RU = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь"
];

type BreakdownItem = {
  label: string;
  amount: number;
  color: string;
};

export function DashboardPage() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const [periodType, setPeriodType] = useState<"month" | "year">("month");
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);

  const yearOptions = Array.from({ length: 8 }, (_, i) => currentYear - i);

  const monthQuery = useTransactions({
    periodType,
    year,
    month: periodType === "month" ? month : undefined,
    type: "all",
    page: 1,
    pageSize: 300
  });

  const recentQuery = useTransactions({
    periodType,
    year,
    month: periodType === "month" ? month : undefined,
    type: "all",
    sortBy: "date",
    sortDir: "desc",
    page: 1,
    pageSize: 6
  });

  const summary = useMemo(() => {
    const items = monthQuery.data?.items ?? [];
    let income = 0;
    let expense = 0;
    let service = 0;

    for (const item of items) {
      if (item.type === "income") income += item.amountRub;
      else if (item.type === "expense") expense += item.amountRub;
      else service += item.amountRub;
    }

    return { income, expense, service, net: income - expense };
  }, [monthQuery.data?.items]);

  const breakdown = useMemo<BreakdownItem[]>(() => {
    const map = new Map<string, number>();
    for (const item of monthQuery.data?.items ?? []) {
      if (item.type !== "expense") continue;
      map.set(item.categoryNameRu, (map.get(item.categoryNameRu) ?? 0) + item.amountRub);
    }

    const sorted = Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([label, amount], index) => ({
        label,
        amount,
        color: BREAKDOWN_COLORS[index] ?? BREAKDOWN_COLORS[BREAKDOWN_COLORS.length - 1]
      }));

    if (sorted.length <= 5) return sorted;

    const visible = sorted.slice(0, 4);
    const otherAmount = sorted.slice(4).reduce((acc, item) => acc + item.amount, 0);
    return [...visible, { label: "Остальные", amount: otherAmount, color: BREAKDOWN_COLORS[5] }];
  }, [monthQuery.data?.items]);

  const donutBackground = useMemo(() => {
    const total = breakdown.reduce((acc, item) => acc + item.amount, 0);
    if (total <= 0) return "conic-gradient(#1f2937 0deg 360deg)";

    let start = 0;
    const stops = breakdown.map((item) => {
      const sweep = (item.amount / total) * 360;
      const end = start + sweep;
      const chunk = `${item.color} ${start}deg ${end}deg`;
      start = end;
      return chunk;
    });

    return `conic-gradient(${stops.join(", ")})`;
  }, [breakdown]);

  const isLoading = monthQuery.isLoading || recentQuery.isLoading;
  const hasError = monthQuery.isError || recentQuery.isError;

  return (
    <div className="page-stack">
      <div>
        <h1>Дашборд</h1>
        <p className="muted">Выберите период, чтобы посмотреть сводку, последние операции и структуру расходов.</p>
      </div>

      <div className="card dashboard-period-card">
        <div className="dashboard-period-grid">
          <label>
            Период
            <select
              value={periodType}
              onChange={(e) => {
                const nextType = e.target.value as "month" | "year";
                setPeriodType(nextType);
              }}
            >
              <option value="month">Месяц</option>
              <option value="year">Год</option>
            </select>
          </label>

          <label>
            Год
            <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
              {yearOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          {periodType === "month" && (
            <label>
              Месяц
              <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                {MONTHS_RU.map((name, index) => {
                  const monthValue = index + 1;
                  return (
                    <option key={monthValue} value={monthValue}>
                      {name}
                    </option>
                  );
                })}
              </select>
            </label>
          )}
        </div>
      </div>

      {hasError && (
        <div className="alert error">
          Не удалось загрузить данные дашборда: {monthQuery.error instanceof Error ? monthQuery.error.message : "Ошибка"}
        </div>
      )}

      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-label">Доходы за месяц</div>
          <div className="stat-value income-text">{formatRub(summary.income)}</div>
          <div className="stat-sub muted">
            {periodType === "month" ? `${getMonthName(month - 1)} ${year}` : `За ${year} год`}
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Расходы за {periodType === "month" ? "месяц" : "год"}</div>
          <div className="stat-value expense-text">{formatRub(summary.expense)}</div>
          <div className="stat-sub muted">Без учета служебных</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Чистый поток</div>
          <div className={`stat-value ${summary.net >= 0 ? "income-text" : "expense-text"}`}>
            {summary.net >= 0 ? "+" : "-"}
            {formatRub(Math.abs(summary.net))}
          </div>
          <div className="stat-sub muted">Доходы − расходы</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Служебные операции</div>
          <div className="stat-value">{formatRub(summary.service)}</div>
          <div className="stat-sub muted">Пополнения целей и погашения</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <section className="card">
          <div className="table-header">
            <h3>Последние операции</h3>
            <span className="muted">
              {(recentQuery.data?.total ?? 0)} за {periodType === "month" ? `${getMonthName(month - 1)} ${year}` : `${year} год`}
            </span>
          </div>

          {isLoading ? (
            <p className="muted">Загрузка...</p>
          ) : (recentQuery.data?.items.length ?? 0) === 0 ? (
            <p className="muted">Операций пока нет.</p>
          ) : (
            <div className="dashboard-recent-list">
              {recentQuery.data?.items.map((item) => (
                <div className="dashboard-recent-row" key={item.id}>
                  <div className="dashboard-recent-main">
                    <span className="category-pill">
                      <span className="category-dot" style={{ backgroundColor: item.categoryColor }} />
                      <CategoryIcon iconName={item.categoryIconName} />
                      <span>{item.categoryNameRu}</span>
                    </span>
                    <span className="muted">{formatDateRu(item.date)}</span>
                  </div>
                  <div className={`dashboard-recent-amount ${item.type === "income" ? "income-text" : "expense-text"}`}>
                    {item.type === "income" ? "+" : "-"}
                    {formatRub(item.amountRub)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card">
          <h3 className="dashboard-section-title">Расходы по категориям</h3>
          <div className="dashboard-donut-wrap">
            <div className="dashboard-donut" style={{ background: donutBackground }} aria-label="Структура расходов" />
            <div className="dashboard-donut-hole">
              <span className="muted">Всего</span>
              <strong>{formatRub(summary.expense)}</strong>
            </div>
          </div>

          <div className="dashboard-breakdown-list">
            {breakdown.length === 0 ? (
              <p className="muted">
                Нет расходных операций за {periodType === "month" ? "выбранный месяц" : "выбранный год"}.
              </p>
            ) : (
              breakdown.map((item) => (
                <div key={item.label} className="dashboard-breakdown-row">
                  <span className="dashboard-breakdown-label">
                    <span className="dashboard-breakdown-swatch" style={{ backgroundColor: item.color }} />
                    {item.label}
                  </span>
                  <span>{formatRub(item.amount)}</span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
