import { z } from "zod";

export const transactionFormSchema = z.object({
  type: z.enum(["expense", "income"]),
  categoryId: z.coerce.number().int().positive("Выберите категорию"),
  amountRub: z.coerce.number().int("Только целые рубли").positive("Сумма должна быть > 0"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Некорректная дата"),
  comment: z.string().max(255).optional().default("")
});

export type TransactionFormValues = z.infer<typeof transactionFormSchema>;