import type { Category } from "../../../../shared/types/category";
import type { TransactionListFilters } from "../../../../shared/types/transaction";
import { getCategoryEmoji } from "../../../components/CategoryIcon";

type Props = {
  filters: TransactionListFilters;
  onChange: (next: TransactionListFilters) => void;
  categories: Category[];
};

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

export function TransactionFilterBar({ filters, onChange, categories }: Props) {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const yearOptions = Array.from({ length: 8 }, (_, i) => currentYear - i);

  const resetFilters = () => {
    onChange({
      ...filters,
      periodType: "month",
      year: currentYear,
      month: currentMonth,
      type: "all",
      categoryId: undefined,
      search: "",
      page: 1
    });
  };

  return (
    <div className="card filters-card">
      <div className="filters-card-header">
        <div>
          <h3 className="filters-card-title">Фильтры</h3>
          <p className="muted filters-card-subtitle">
            Период, тип операции, категория и поиск по комментарию
          </p>
        </div>

        <button type="button" className="btn ghost" onClick={resetFilters}>
          Сбросить
        </button>
      </div>

      <div className="type-segment" role="tablist" aria-label="Тип операции">
        <button
          type="button"
          className={`segment-btn ${(filters.type ?? "all") === "all" ? "active" : ""}`}
          onClick={() => onChange({ ...filters, type: "all", page: 1 })}
        >
          Все
        </button>
        <button
          type="button"
          className={`segment-btn ${filters.type === "expense" ? "active expense" : ""}`}
          onClick={() => onChange({ ...filters, type: "expense", page: 1 })}
        >
          Расходы
        </button>
        <button
          type="button"
          className={`segment-btn ${filters.type === "income" ? "active income" : ""}`}
          onClick={() => onChange({ ...filters, type: "income", page: 1 })}
        >
          Доходы
        </button>
        <button
          type="button"
          className={`segment-btn ${filters.type === "service" ? "active service" : ""}`}
          onClick={() => onChange({ ...filters, type: "service", page: 1 })}
        >
          Служебные
        </button>
      </div>

      <div className="filters-grid filters-grid-modern">
        <label>
          Период
          <select
            value={filters.periodType}
            onChange={(e) => {
              const periodType = e.target.value as "month" | "year";
              onChange({
                ...filters,
                periodType,
                month: periodType === "month" ? filters.month ?? currentMonth : undefined,
                page: 1
              });
            }}
          >
            <option value="month">Месяц</option>
            <option value="year">Год</option>
          </select>
        </label>

        <label>
          Год
          <select
            value={filters.year}
            onChange={(e) =>
              onChange({ ...filters, year: Number(e.target.value), page: 1 })
            }
          >
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>

        {filters.periodType === "month" && (
          <label>
            Месяц
            <select
              value={filters.month ?? currentMonth}
              onChange={(e) =>
                onChange({ ...filters, month: Number(e.target.value), page: 1 })
              }
            >
              {MONTHS_RU.map((label, index) => {
                const monthValue = index + 1;
                return (
                  <option key={monthValue} value={monthValue}>
                    {label}
                  </option>
                );
              })}
            </select>
          </label>
        )}

        <label>
          Категория
          <select
            value={filters.categoryId ?? ""}
            onChange={(e) =>
              onChange({
                ...filters,
                categoryId: e.target.value ? Number(e.target.value) : undefined,
                page: 1
              })
            }
          >
            <option value="">Все категории</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {getCategoryEmoji(c.iconName)} {c.nameRu}
              </option>
            ))}
          </select>
        </label>

        <label className="filters-search-modern">
          Поиск по комментарию
          <input
            type="text"
            value={filters.search ?? ""}
            placeholder="Например: Пятёрочка, такси, зарплата..."
            onChange={(e) => onChange({ ...filters, search: e.target.value, page: 1 })}
          />
        </label>
      </div>
    </div>
  );
}