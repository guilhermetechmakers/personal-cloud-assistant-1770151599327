import { supabase } from "@/lib/supabase";
import type {
  Automation,
  AutomationInsert,
  AutomationUpdate,
} from "@/types/database/automations";
import type {
  AutomationRun,
  AutomationRunInsert,
} from "@/types/database/automation_runs";

const AUTOMATIONS_TABLE = "automations";
const AUTOMATION_RUNS_TABLE = "automation_runs";

/**
 * List automations for a user (optionally filtered by status).
 */
export async function listAutomations(
  userId: string,
  filters?: { status?: "enabled" | "disabled" }
): Promise<{ data: Automation[]; error: string | null }> {
  let query = supabase
    .from(AUTOMATIONS_TABLE)
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;
  return { data: (data ?? []) as Automation[], error: error?.message ?? null };
}

/**
 * Get a single automation by id. Caller must own it (RLS enforces).
 */
export async function getAutomation(
  automationId: string
): Promise<{ data: Automation | null; error: string | null }> {
  const { data, error } = await supabase
    .from(AUTOMATIONS_TABLE)
    .select("*")
    .eq("id", automationId)
    .maybeSingle();
  return { data: data as Automation | null, error: error?.message ?? null };
}

/**
 * Create a new automation.
 */
export async function createAutomation(
  userId: string,
  payload: Omit<AutomationInsert, "user_id">
): Promise<{ data: Automation | null; error: string | null }> {
  const { data, error } = await supabase
    .from(AUTOMATIONS_TABLE)
    .insert({ user_id: userId, ...payload })
    .select()
    .single();
  return { data: data as Automation | null, error: error?.message ?? null };
}

/**
 * Update an existing automation.
 */
export async function updateAutomation(
  automationId: string,
  payload: AutomationUpdate
): Promise<{ data: Automation | null; error: string | null }> {
  const { data, error } = await supabase
    .from(AUTOMATIONS_TABLE)
    .update(payload)
    .eq("id", automationId)
    .select()
    .single();
  return { data: data as Automation | null, error: error?.message ?? null };
}

/**
 * Delete an automation (and its runs via CASCADE).
 */
export async function deleteAutomation(
  automationId: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from(AUTOMATIONS_TABLE)
    .delete()
    .eq("id", automationId);
  return { error: error?.message ?? null };
}

/**
 * List runs for an automation (for audit / last run).
 */
export async function listAutomationRuns(
  automationId: string,
  limit = 20
): Promise<{ data: AutomationRun[]; error: string | null }> {
  const { data, error } = await supabase
    .from(AUTOMATION_RUNS_TABLE)
    .select("*")
    .eq("automation_id", automationId)
    .order("run_time", { ascending: false })
    .limit(limit);
  return { data: (data ?? []) as AutomationRun[], error: error?.message ?? null };
}

/**
 * Get the most recent run for an automation (audit snapshot).
 */
export async function getLastRun(
  automationId: string
): Promise<{ data: AutomationRun | null; error: string | null }> {
  const { data, error } = await supabase
    .from(AUTOMATION_RUNS_TABLE)
    .select("*")
    .eq("automation_id", automationId)
    .order("run_time", { ascending: false })
    .limit(1)
    .maybeSingle();
  return { data: data as AutomationRun | null, error: error?.message ?? null };
}

/**
 * Create a run record (for audit; actual execution is backend).
 */
export async function createAutomationRun(
  payload: AutomationRunInsert
): Promise<{ data: AutomationRun | null; error: string | null }> {
  const { data, error } = await supabase
    .from(AUTOMATION_RUNS_TABLE)
    .insert(payload)
    .select()
    .single();
  return { data: data as AutomationRun | null, error: error?.message ?? null };
}

/**
 * List runs for the user in a date range (for calendar view).
 * Fetches automation ids for user, then runs in range.
 */
export async function listRunsInRange(
  userId: string,
  start: string,
  end: string
): Promise<{ data: AutomationRun[]; error: string | null }> {
  const { data: automations, error: err1 } = await supabase
    .from(AUTOMATIONS_TABLE)
    .select("id")
    .eq("user_id", userId);
  if (err1) return { data: [], error: err1.message };
  const ids = (automations ?? []).map((a) => a.id);
  if (ids.length === 0) return { data: [], error: null };

  const { data: runs, error: err2 } = await supabase
    .from(AUTOMATION_RUNS_TABLE)
    .select("*")
    .in("automation_id", ids)
    .gte("run_time", start)
    .lte("run_time", end)
    .order("run_time", { ascending: false });
  return { data: (runs ?? []) as AutomationRun[], error: err2?.message ?? null };
}
