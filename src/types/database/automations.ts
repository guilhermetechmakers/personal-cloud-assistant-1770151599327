/**
 * Database types for automations table
 * User automation rules: skill, trigger, schedule, timezone
 */

export type AutomationTriggerType = "manual" | "schedule" | "event";
export type AutomationStatus = "enabled" | "disabled";

export interface Automation {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  skill_id: string | null;
  skill_name: string | null;
  trigger_type: AutomationTriggerType;
  trigger_definition: Record<string, unknown>;
  schedule_cron: string | null;
  timezone: string;
  status: AutomationStatus;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface AutomationInsert {
  id?: string;
  user_id: string;
  name: string;
  description?: string | null;
  skill_id?: string | null;
  skill_name?: string | null;
  trigger_type?: AutomationTriggerType;
  trigger_definition?: Record<string, unknown>;
  schedule_cron?: string | null;
  timezone?: string;
  status?: AutomationStatus;
  metadata?: Record<string, unknown>;
}

export interface AutomationUpdate {
  name?: string;
  description?: string | null;
  skill_id?: string | null;
  skill_name?: string | null;
  trigger_type?: AutomationTriggerType;
  trigger_definition?: Record<string, unknown>;
  schedule_cron?: string | null;
  timezone?: string;
  status?: AutomationStatus;
  metadata?: Record<string, unknown>;
}

export type AutomationRow = Automation;
