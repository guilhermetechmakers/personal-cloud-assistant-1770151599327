/**
 * Database types for automation_runs table
 * Run history and audit snapshot for automations
 */

export type AutomationRunStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export interface AutomationRun {
  id: string;
  automation_id: string;
  run_time: string;
  status: AutomationRunStatus;
  result_summary: string | null;
  result_metadata: Record<string, unknown>;
  created_at: string;
}

export interface AutomationRunInsert {
  id?: string;
  automation_id: string;
  run_time?: string;
  status?: AutomationRunStatus;
  result_summary?: string | null;
  result_metadata?: Record<string, unknown>;
}

export type AutomationRunRow = AutomationRun;
