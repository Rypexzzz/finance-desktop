export type GoalStatus = "active" | "paused" | "completed" | "cancelled";

export type Goal = {
  id: number;
  name: string;
  targetAmountRub: number;
  startAmountRub: number;
  monthlyPlanRub: number | null;
  deadlineDate: string | null;
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
};

export type GoalWithProgress = Goal & {
  contributedTotalRub: number;
  currentAmountRub: number;
  progressTotal: number;
};

export type GoalContribution = {
  id: number;
  goalId: number;
  transactionId: number;
  amountRub: number;
  date: string;
  comment: string;
  createdAt: string;
};

export type GoalProgress = {
  progressTotal: number;
  currentAmountRub: number;
  contributedTotalRub: number;
};

export type CreateGoalInput = {
  name: string;
  targetAmountRub: number;
  startAmountRub?: number;
  monthlyPlanRub?: number | null;
  deadlineDate?: string | null;
};

export type UpdateGoalInput = Partial<CreateGoalInput>;

export type AddGoalContributionInput = {
  amountRub: number;
  date: string;
  comment?: string;
};
