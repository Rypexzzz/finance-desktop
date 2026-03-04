export type DebtType = "loan" | "credit_card";
export type DebtStatus = "active" | "paused" | "closed" | "cancelled";

export type Debt = {
  id: number;
  debtType: DebtType;
  name: string;
  initialAmountRub: number;
  currentBalanceRub: number;
  monthlyPlanRub: number | null;
  minimumPaymentRub: number | null;
  targetCloseDate: string | null;
  status: DebtStatus;
  createdAt: string;
  updatedAt: string;
};

export type DebtWithProgress = Debt & {
  progressTotal: number;
  paidMonthRub: number;
  progressMonth: number | null;
};

export type DebtPayment = {
  id: number;
  debtId: number;
  transactionId: number;
  amountRub: number;
  date: string;
  balanceBeforeRub: number;
  balanceAfterRub: number;
  comment: string;
  createdAt: string;
};

export type DebtProgress = {
  progressTotal: number;
  progressMonth: number | null;
  paidMonthRub: number;
  currentBalanceRub: number;
};

export type CreateDebtInput = {
  debtType: DebtType;
  name: string;
  initialAmountRub: number;
  monthlyPlanRub?: number | null;
  minimumPaymentRub?: number | null;
  targetCloseDate?: string | null;
};

export type UpdateDebtInput = Partial<CreateDebtInput>;

export type AddDebtPaymentInput = {
  amountRub: number;
  date: string;
  comment?: string;
};
