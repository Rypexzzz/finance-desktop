import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AppTheme } from "../../../shared/types/settings";
import { getSettings, setTheme } from "./api";

export function useSettings() {
  return useQuery({ queryKey: ["settings"], queryFn: getSettings });
}

export function useSetTheme() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (theme: AppTheme) => setTheme(theme),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings"] })
  });
}
