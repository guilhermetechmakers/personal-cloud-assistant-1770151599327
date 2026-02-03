/**
 * Database types for profiles table
 * Extended user profile (display name, timezone, locale, workspace role)
 */

export type WorkspaceRole = "member" | "admin" | "owner";

export interface Profile {
  id: string;
  display_name: string | null;
  timezone: string;
  locale: string;
  workspace_role: WorkspaceRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileInsert {
  id: string;
  display_name?: string | null;
  timezone?: string;
  locale?: string;
  workspace_role?: WorkspaceRole;
  avatar_url?: string | null;
}

export interface ProfileUpdate {
  display_name?: string | null;
  timezone?: string;
  locale?: string;
  workspace_role?: WorkspaceRole;
  avatar_url?: string | null;
}

export type ProfileRow = Profile;
