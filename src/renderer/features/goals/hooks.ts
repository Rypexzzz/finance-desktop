import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AddGoalContributionInput, CreateGoalInput, GoalStatus, UpdateGoalInput } from "../../../shared/types/goal";
import { addGoalContribution, changeGoalStatus, createGoal, listGoalContributions, listGoals, updateGoal } from "./api";

export function useGoals(params?: { year?: number; month?: number }) {
  return useQuery({ queryKey: ["goals", params], queryFn: () => listGoals(params?.year, params?.month) });
}

export function useGoalContributions(goalId?: number) {
  return useQuery({
    queryKey: ["goal-contributions", goalId],
    queryFn: () => listGoalContributions(goalId as number),
    enabled: !!goalId
  });
}

export function useCreateGoal() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (payload: CreateGoalInput) => createGoal(payload), onSuccess: () => qc.invalidateQueries({ queryKey: ["goals"] }) });
}

export function useUpdateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateGoalInput }) => updateGoal(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["goals"] })
  });
}

export function useChangeGoalStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: GoalStatus }) => changeGoalStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["goals"] })
  });
}

export function useAddGoalContribution() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ goalId, payload }: { goalId: number; payload: AddGoalContributionInput }) => addGoalContribution(goalId, payload),
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: ["goals"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["goal-contributions", vars.goalId] });
    }
  });
}
