import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Category } from "../../../../shared/types/category";
import type { TransactionListItem } from "../../../../shared/types/transaction";
import { getTodayIsoDate } from "../../../lib/formatters";
import { getCategoryEmoji } from "../../../components/CategoryIcon";
import { transactionFormSchema, type TransactionFormValues } from "../schemas";

type Props = {
  open: boolean;
  mode: "create" | "edit";
  categories: Category[];
  initial?: TransactionListItem | null;
  defaultType?: "expense" | "income";
  onClose: () => void;
  onSubmit: (values: TransactionFormValues) => Promise<void>;
};

export function TransactionFormDialog({
  open,
  mode,
  categories,
  initial,
  defaultType = "expense",
  onClose,
  onSubmit
}: Props) {
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      type: "expense",
      categoryId: undefined as unknown as number,
      amountRub: undefined as unknown as number,
      date: getTodayIsoDate(),
      comment: ""
    }
  });

  const selectedType = form.watch("type");

  const availableCategories = useMemo(
    () => categories.filter((c) => c.type === selectedType),
    [categories, selectedType]
  );

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && initial) {
      form.reset({
        type: initial.type === "service" ? "expense" : initial.type,
        categoryId: initial.categoryId,
        amountRub: initial.amountRub,
        date: initial.date,
        comment: initial.comment ?? ""
      });
    } else {
      const firstCategory = categories.find((c) => c.type === defaultType);
      form.reset({
        type: defaultType,
        categoryId: (firstCategory?.id ?? categories[0]?.id) as number,
        amountRub: undefined as unknown as number,
        date: getTodayIsoDate(),
        comment: ""
      });
    }
  }, [open, mode, initial, categories, form, defaultType]);

  useEffect(() => {
    if (!open) return;
    const currentCategoryId = form.getValues("categoryId");
    const currentCategory = categories.find((c) => c.id === currentCategoryId);
    if (!currentCategory || currentCategory.type !== selectedType) {
      const first = availableCategories[0];
      if (first) form.setValue("categoryId", first.id);
    }
  }, [selectedType, categories, availableCategories, form, open]);

  if (!open) return null;

  const submitHandler = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{mode === "create" ? "Новая операция" : "Редактирование операции"}</h3>
        </div>

        <form
          onSubmit={submitHandler}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              onClose();
            }
          }}
        >
          <div className="form-grid">
            <label>
              Тип
              <select {...form.register("type")}>
                <option value="expense">Расход</option>
                <option value="income">Доход</option>
              </select>
            </label>

            <label>
              Сумма (₽)
              <input type="number" step="1" min="1" {...form.register("amountRub")} />
              {form.formState.errors.amountRub && (
                <span className="field-error">{form.formState.errors.amountRub.message}</span>
              )}
            </label>

            <label>
              Дата
              <input type="date" {...form.register("date")} />
              {form.formState.errors.date && (
                <span className="field-error">{form.formState.errors.date.message}</span>
              )}
            </label>

            <label>
              Категория
              <select {...form.register("categoryId")}>
                {availableCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {getCategoryEmoji(c.iconName)} {c.nameRu}
                  </option>
                ))}
              </select>
              {form.formState.errors.categoryId && (
                <span className="field-error">{form.formState.errors.categoryId.message}</span>
              )}
            </label>

            <label className="full">
              Комментарий
              <input
                type="text"
                placeholder="Например: Пятёрочка / такси / зарплата"
                {...form.register("comment")}
              />
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn ghost" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="btn primary" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Сохранение..." : "Сохранить"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}