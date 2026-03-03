export type TransactionType = "expense" | "income" | "service";

export type Transaction = {
  id: number;
  type: TransactionType;
  categoryId: number;
  amountRub: number;
  date: string; // YYYY-MM-DD
  comment: string;
  createdAt: string;
  updatedAt: string;
};

export type TransactionListItem = Transaction & {
  categoryNameRu: string;
  categoryIconName: string;
  categoryColor: string;
};

export type TransactionListFilters = {
  periodType: "month" | "year";
  year: number;
  month?: number;
  type?: TransactionType | "all";
  categoryId?: number;
  search?: string;
  sortBy?: "date" | "amount";
  sortDir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
};

export type CreateTransactionInput = {
  type: "expense" | "income";
  categoryId: number;
  amountRub: number;
  date: string;
  comment?: string;
};

export type UpdateTransactionInput = Partial<CreateTransactionInput>;