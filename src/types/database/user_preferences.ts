/**
 * Database types for user_preferences table
 * Assistant tone, verbosity, default approval level
 */

export type AssistantTone = "professional" | "friendly" | "concise" | "detailed";
export type Verbosity = "low" | "medium" | "high";
export type DefaultApprovalLevel = "draft_only" | "requires_approval" | "always_allow";

export interface UserPreferences {
  id: string;
  user_id: string;
  assistant_tone: AssistantTone;
  verbosity: Verbosity;
  default_approval_level: DefaultApprovalLevel;
  created_at: string;
  updated_at: string;
}

export interface UserPreferencesInsert {
  user_id: string;
  assistant_tone?: AssistantTone;
  verbosity?: Verbosity;
  default_approval_level?: DefaultApprovalLevel;
}

export interface UserPreferencesUpdate {
  assistant_tone?: AssistantTone;
  verbosity?: Verbosity;
  default_approval_level?: DefaultApprovalLevel;
}

export type UserPreferencesRow = UserPreferences;
