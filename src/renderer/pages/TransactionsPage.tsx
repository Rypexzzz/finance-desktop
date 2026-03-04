import { useEffect, useMemo, useState } from "react";
import type {
  TransactionListFilters,
  TransactionListItem,
} from "../../shared/types/transaction";
import { useCategories } from "../features/categories/hooks";
import {
  useCreateTransaction,
  useDeleteTransaction,
  useTransactions,
  useUpdateTransaction,
} from "../features/transactions/hooks";
import { TransactionFilterBar } from "../features/transactions/components/TransactionFilterBar";
import { TransactionsTable } from "../features/transactions/components/TransactionsTable";
import { TransactionFormDialog } from "../features/transactions/components/TransactionFormDialog";
import type { TransactionFormValues } from "../features/transactions/schemas";
import { formatRub } from "../lib/formatters";

const MONTHS_RU = [
  "январь",
  "февраль",
  "март",
  "апрель",
  "май",
  "июнь",
  "июль",
  "август",
  "сентябрь",
  "октябрь",
  "ноябрь",
  "декабрь",
];

function getStatsPeriodLabel(filters: TransactionListFilters) {
  if (filters.periodType === "month") {
    const idx = (filters.month ?? 1) - 1;
    return MONTHS_RU[idx] ?? "месяц";
  }
  return String(filters.year);
}

export function TransactionsPage() {
  const now = new Date();

  const [filters, setFilters] = useState<TransactionListFilters>({
    periodType: "month",
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    type: "all",
    sortBy: "date",
    sortDir: "desc",
    page: 1,
    pageSize: 50,
    search: "",
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editingItem, setEditingItem] = useState<TransactionListItem | null>(
    null,
  );
  const [errorText, setErrorText] = useState<string>("");
  const [createDefaultType, setCreateDefaultType] = useState<
    "expense" | "income"
  >("expense");
  const [deletingItem, setDeletingItem] = useState<TransactionListItem | null>(null);

  const categoriesQuery = useCategories();
  const txQuery = useTransactions(filters);

  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();
  const deleteMutation = useDeleteTransaction();

  const categories = categoriesQuery.data ?? [];

  const categoryOptionsForFilter = useMemo(
    () => categories.filter((c) => c.isActive),
    [categories],
  );

  const selectedCategoryName = useMemo(() => {
    if (!filters.categoryId) return "все категории";
    return (
      categories.find((c) => c.id === filters.categoryId)?.nameRu ?? "категория"
    );
  }, [categories, filters.categoryId]);

  const summary = useMemo(() => {
    const items = txQuery.data?.items ?? [];
    let income = 0;
    let expense = 0;
    let service = 0;

    for (const item of items) {
      if (item.type === "income") income += item.amountRub;
      else if (item.type === "expense") expense += item.amountRub;
      else service += item.amountRub;
    }

    return {
      income,
      expense,
      service,
      net: income - expense,
    };
  }, [txQuery.data?.items]);

  const openCreateDialog = (type: "expense" | "income" = "expense") => {
    setErrorText("");
    setDialogMode("create");
    setEditingItem(null);
    setCreateDefaultType(type);
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: TransactionListItem) => {
    setErrorText("");
    setDialogMode("edit");
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleDelete = async (item: TransactionListItem) => {
    setDeletingItem(item);
  };

  const confirmDelete = async () => {
    if (!deletingItem) return;
    setErrorText("");
    try {
      await deleteMutation.mutateAsync(deletingItem.id);
      setDeletingItem(null);
    } catch (e) {
      setErrorText(e instanceof Error ? e.message : "Ошибка удаления");
    }
  };

  const handleDialogSubmit = async (values: TransactionFormValues) => {
    setErrorText("");
    try {
      if (dialogMode === "create") {
        await createMutation.mutateAsync(values);
      } else if (editingItem) {
        await updateMutation.mutateAsync({
          id: editingItem.id,
          payload: values,
        });
      }
      setIsDialogOpen(false);
    } catch (e) {
      setErrorText(e instanceof Error ? e.message : "Ошибка сохранения");
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === "n") {
        e.preventDefault();
        openCreateDialog("expense");
      }
      if (e.key === "Escape" && isDialogOpen) {
        setIsDialogOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isDialogOpen]);

  const periodLabel = getStatsPeriodLabel(filters);

  const typeLabel =
    filters.type === "expense"
      ? "расходы"
      : filters.type === "income"
        ? "доходы"
        : filters.type === "service"
          ? "служебные"
          : "все";

  const compactFiltersSummary = [
    `Период: ${periodLabel}`,
    `Тип: ${typeLabel}`,
    `Категория: ${selectedCategoryName}`,
    (filters.search ?? "").trim() ? `Поиск: "${filters.search}"` : "",
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <div className="page-stack">
      <div className="page-header-row">
        <div>
          <h1>Операции</h1>
          <p className="muted">
            Добавление, редактирование и просмотр доходов/расходов.
          </p>
        </div>

        <div className="header-actions">
          <button
            className="btn expense-btn"
            onClick={() => openCreateDialog("expense")}
          >
            + Расход
          </button>
          <button
            className="btn income-btn"
            onClick={() => openCreateDialog("income")}
          >
            + Доход
          </button>
        </div>
      </div>

      {errorText && <div className="alert error">{errorText}</div>}

      <section
        className="card filters-disclosure"
        aria-label="Фильтры операций"
      >
        <div className="filters-disclosure-header">
          <span
            className="filters-toggle-summary"
            title={compactFiltersSummary}
          >
            {compactFiltersSummary}
          </span>

          <button
            type="button"
            className="filters-toggle-btn"
            onClick={() => setIsFiltersVisible((prev) => !prev)}
            aria-expanded={isFiltersVisible}
          >
            <span className="filters-toggle-btn-icon" aria-hidden="true">
              {isFiltersVisible ? "▴" : "▾"}
            </span>
            {isFiltersVisible ? "Скрыть фильтры" : "Показать фильтры"}
          </button>
        </div>

        {isFiltersVisible && (
          <div className="filters-disclosure-body">
            <TransactionFilterBar
              filters={filters}
              onChange={(next) => setFilters({ ...next, page: 1 })}
              categories={categoryOptionsForFilter}
            />
          </div>
        )}
      </section>

      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-label">Доходы</div>
          <div className="stat-value income-text">
            {formatRub(summary.income)}
          </div>
          <div className="stat-sub muted">Период: {periodLabel}</div>
        </div>

        <div className="card stat-card">
          <div className="stat-label">Расходы</div>
          <div className="stat-value expense-text">
            {formatRub(summary.expense)}
          </div>
          <div className="stat-sub muted">Период: {periodLabel}</div>
        </div>

        <div className="card stat-card">
          <div className="stat-label">Чистый поток</div>
          <div
            className={`stat-value ${summary.net >= 0 ? "income-text" : "expense-text"}`}
          >
            {summary.net >= 0 ? "+" : "-"}
            {formatRub(Math.abs(summary.net))}
          </div>
          <div className="stat-sub muted">Доходы − расходы</div>
        </div>

        <div className="card stat-card">
          <div className="stat-label">Служебные</div>
          <div className="stat-value">{formatRub(summary.service)}</div>
          <div className="stat-sub muted">
            Не входят в базовую аналитику (позже)
          </div>
        </div>
      </div>

      {txQuery.isLoading || categoriesQuery.isLoading ? (
        <div className="card">
          <p>Загрузка...</p>
        </div>
      ) : txQuery.isError ? (
        <div className="card">
          <p className="alert error">
            Не удалось загрузить операции:{" "}
            {txQuery.error instanceof Error ? txQuery.error.message : "Ошибка"}
          </p>
        </div>
      ) : (
        <TransactionsTable
          items={txQuery.data?.items ?? []}
          total={txQuery.data?.total ?? 0}
          onEdit={openEditDialog}
          onDelete={handleDelete}
        />
      )}

      <TransactionFormDialog
        open={isDialogOpen}
        mode={dialogMode}
        categories={categories.filter((c) => c.type !== "service")}
        initial={editingItem}
        defaultType={createDefaultType}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleDialogSubmit}
      />

      {deletingItem && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Подтверждение удаления" onClick={() => setDeletingItem(null)}>
          <div className="modal delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Удалить операцию?</h3>
            </div>
            <p>
              Операция «{deletingItem.categoryNameRu}» на <b>{formatRub(deletingItem.amountRub)}</b> будет удалена без возможности восстановления.
            </p>
            <div className="modal-actions">
              <button className="btn" onClick={() => setDeletingItem(null)}>
                Отмена
              </button>
              <button className="btn ghost danger" onClick={confirmDelete}>
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
