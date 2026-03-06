import type { TransactionListItem } from "../../../../shared/types/transaction";
import { formatDateRu, formatRub } from "../../../lib/formatters";
import { CategoryIcon } from "../../../components/CategoryIcon";

type Props = {
  items: TransactionListItem[];
  total: number;
  onEdit: (item: TransactionListItem) => void;
  onDelete: (item: TransactionListItem) => void;
};

export function TransactionsTable({ items, total, onEdit, onDelete }: Props) {
  if (!items.length) {
    return (
      <div className="card">
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3 className="empty-state-title">Нет операций</h3>
          <p className="empty-state-desc">Пока нет операций за выбранный период. Создайте первую операцию, чтобы начать учёт.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="table-header">
        <h3>Операции</h3>
        <span className="muted">Всего записей: {total}</span>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Дата</th>
              <th>Тип</th>
              <th>Категория</th>
              <th>Комментарий</th>
              <th className="align-right">Сумма</th>
              <th className="align-right">Действия</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const sign = item.type === "income" ? "+" : "-";

              return (
                <tr key={item.id}>
                  <td>{formatDateRu(item.date)}</td>

                  <td>
                    <span className={`badge ${item.type}`}>
                      {item.type === "income"
                        ? "Доход"
                        : item.type === "expense"
                        ? "Расход"
                        : "Служ."}
                    </span>
                  </td>

                  <td>
                    <span className="category-pill">
                      <span
                        className="category-dot"
                        style={{ backgroundColor: item.categoryColor }}
                      />
                      <CategoryIcon iconName={item.categoryIconName} />
                      <span className="category-name">{item.categoryNameRu}</span>
                    </span>
                  </td>

                  <td className="muted comment-cell">{item.comment || "—"}</td>

                  <td className={`align-right amount ${item.type}`}>
                    {sign}
                    {formatRub(item.amountRub)}
                  </td>

                  <td className="align-right">
                    <div className="row-actions">
                      <button
                        className="btn ghost icon-action-btn"
                        onClick={() => onEdit(item)}
                        title="Редактировать"
                        aria-label="Редактировать"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn ghost danger icon-action-btn"
                        onClick={() => onDelete(item)}
                        title="Удалить"
                        aria-label="Удалить"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
