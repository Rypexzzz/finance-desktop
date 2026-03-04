import { z } from "zod";
import { parseRuDateToIso } from "../../lib/formatters";

export const transactionFormSchema = z.object({
  type: z.enum(["expense", "income"]),
  categoryId: z.coerce.number().int().positive("Выберите категорию"),
  amountRub: z.coerce.number().int("Только целые рубли").positive("Сумма должна быть > 0"),
  date: z
    .string()
    .trim()
    .regex(/^\d{2}\.\d{2}\.\d{4}$/, "Введите дату в формате дд.мм.гггг")
    .transform((value, ctx) => {
      const isoDate = parseRuDateToIso(value);
      if (!isoDate) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Некорректная дата" });
        return z.NEVER;
      }
      return isoDate;
    }),
  comment: z.string().max(255).optional().default("")
});

export type TransactionFormValues = z.infer<typeof transactionFormSchema>;
