import { supabase } from "@/lib/supabase";
import type { Profile, ProfileUpdate } from "@/types/database/profiles";
import type {
  UserPreferences,
  UserPreferencesUpdate,
} from "@/types/database/user_preferences";
import type {
  UserSecurity,
  UserSecurityUpdate,
  UserSession,
} from "@/types/database/user_security";

const PROFILES_TABLE = "profiles";
const USER_PREFERENCES_TABLE = "user_preferences";
const USER_SECURITY_TABLE = "user_security";
const USER_SESSIONS_TABLE = "user_sessions";

/**
 * Get profile by user id (current user).
 */
export async function getProfile(
  userId: string
): Promise<{ data: Profile | null; error: string | null }> {
  const { data, error } = await supabase
    .from(PROFILES_TABLE)
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  return { data: data as Profile | null, error: error?.message ?? null };
}

/**
 * Upsert profile (insert or update). Caller must ensure userId is auth.uid().
 */
export async function upsertProfile(
  userId: string,
  payload: ProfileUpdate
): Promise<{ data: Profile | null; error: string | null }> {
  const { data, error } = await supabase
    .from(PROFILES_TABLE)
    .upsert({ id: userId, ...payload }, { onConflict: "id" })
    .select()
    .single();
  return { data: data as Profile | null, error: error?.message ?? null };
}

/**
 * Get user preferences by user id.
 */
export async function getUserPreferences(
  userId: string
): Promise<{ data: UserPreferences | null; error: string | null }> {
  const { data, error } = await supabase
    .from(USER_PREFERENCES_TABLE)
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return { data: data as UserPreferences | null, error: error?.message ?? null };
}

/**
 * Upsert user preferences.
 */
export async function upsertUserPreferences(
  userId: string,
  payload: UserPreferencesUpdate
): Promise<{ data: UserPreferences | null; error: string | null }> {
  const { data, error } = await supabase
    .from(USER_PREFERENCES_TABLE)
    .upsert(
      { user_id: userId, ...payload, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    )
    .select()
    .single();
  return { data: data as UserPreferences | null, error: error?.message ?? null };
}

/**
 * Get user security (2FA) by user id.
 */
export async function getUserSecurity(
  userId: string
): Promise<{ data: UserSecurity | null; error: string | null }> {
  const { data, error } = await supabase
    .from(USER_SECURITY_TABLE)
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return { data: data as UserSecurity | null, error: error?.message ?? null };
}

/**
 * Set 2FA enabled for user.
 */
export async function setTwoFactorEnabled(
  userId: string,
  enabled: boolean
): Promise<{ data: UserSecurity | null; error: string | null }> {
  const payload: UserSecurityUpdate = { two_factor_enabled: enabled };
  const { data, error } = await supabase
    .from(USER_SECURITY_TABLE)
    .upsert(
      { user_id: userId, ...payload, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    )
    .select()
    .single();
  return { data: data as UserSecurity | null, error: error?.message ?? null };
}

/**
 * List sessions for user (for session management UI).
 */
export async function getSessions(
  userId: string
): Promise<{ data: UserSession[]; error: string | null }> {
  const { data, error } = await supabase
    .from(USER_SESSIONS_TABLE)
    .select("*")
    .eq("user_id", userId)
    .order("last_active_at", { ascending: false });
  return { data: (data ?? []) as UserSession[], error: error?.message ?? null };
}

/**
 * Revoke a session by id (delete row). Only own sessions.
 */
export async function revokeSession(
  sessionId: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from(USER_SESSIONS_TABLE)
    .delete()
    .eq("id", sessionId);
  return { error: error?.message ?? null };
}
