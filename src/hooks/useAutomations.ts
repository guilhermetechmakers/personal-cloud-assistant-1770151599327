import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listAutomations,
  getAutomation,
  createAutomation,
  updateAutomation,
  deleteAutomation,
  listAutomationRuns,
  getLastRun,
  listRunsInRange,
} from "@/api/automations";
import type { AutomationInsert, AutomationUpdate } from "@/types/database/automations";

export const automationKeys = {
  all: ["automations"] as const,
  list: (userId: string, filters?: { status?: "enabled" | "disabled" }) =>
    ["automations", "list", userId, filters] as const,
  detail: (id: string) => ["automations", "detail", id] as const,
  runs: (automationId: string) => ["automations", "runs", automationId] as const,
  lastRun: (automationId: string) =>
    ["automations", "lastRun", automationId] as const,
  runsInRange: (userId: string, start: string, end: string) =>
    ["automations", "runsInRange", userId, start, end] as const,
};

export function useAutomations(
  userId: string | undefined,
  filters?: { status?: "enabled" | "disabled" }
) {
  return useQuery({
    queryKey: automationKeys.list(userId ?? "", filters),
    queryFn: () =>
      listAutomations(userId!, filters).then((r) =>
        r.error ? Promise.reject(new Error(r.error)) : r.data
      ),
    enabled: Boolean(userId),
  });
}

export function useAutomation(automationId: string | undefined) {
  return useQuery({
    queryKey: automationKeys.detail(automationId ?? ""),
    queryFn: () =>
      getAutomation(automationId!).then((r) =>
        r.error ? Promise.reject(new Error(r.error)) : r.data
      ),
    enabled: Boolean(automationId),
  });
}

export function useCreateAutomation(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<AutomationInsert, "user_id">) =>
      createAutomation(userId!, payload).then((r) =>
        r.error ? Promise.reject(new Error(r.error)) : r.data!
      ),
    onSuccess: () => {
      if (userId)
        queryClient.invalidateQueries({ queryKey: automationKeys.list(userId) });
    },
  });
}

export function useUpdateAutomation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: { id: string; payload: AutomationUpdate }) =>
      updateAutomation(id, payload).then((r) =>
        r.error ? Promise.reject(new Error(r.error)) : r.data!
      ),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: automationKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: automationKeys.all });
    },
  });
}

export function useDeleteAutomation(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (automationId: string) =>
      deleteAutomation(automationId).then((r) =>
        r.error ? Promise.reject(new Error(r.error)) : undefined
      ),
    onSuccess: () => {
      if (userId)
        queryClient.invalidateQueries({ queryKey: automationKeys.list(userId) });
      queryClient.invalidateQueries({ queryKey: automationKeys.all });
    },
  });
}

export function useAutomationRuns(automationId: string | undefined) {
  return useQuery({
    queryKey: automationKeys.runs(automationId ?? ""),
    queryFn: () =>
      listAutomationRuns(automationId!).then((r) =>
        r.error ? Promise.reject(new Error(r.error)) : r.data
      ),
    enabled: Boolean(automationId),
  });
}

export function useLastRun(automationId: string | undefined) {
  return useQuery({
    queryKey: automationKeys.lastRun(automationId ?? ""),
    queryFn: () =>
      getLastRun(automationId!).then((r) =>
        r.error ? Promise.reject(new Error(r.error)) : r.data
      ),
    enabled: Boolean(automationId),
  });
}

export function useRunsInRange(
  userId: string | undefined,
  start: string,
  end: string
) {
  return useQuery({
    queryKey: automationKeys.runsInRange(userId ?? "", start, end),
    queryFn: () =>
      listRunsInRange(userId!, start, end).then((r) =>
        r.error ? Promise.reject(new Error(r.error)) : r.data
      ),
    enabled: Boolean(userId) && Boolean(start) && Boolean(end),
  });
}
