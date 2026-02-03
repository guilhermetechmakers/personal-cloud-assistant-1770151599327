import { supabase } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

export interface RequestPasswordResetInput {
  email: string;
}

export interface ResetPasswordInput {
  password: string;
}

/**
 * Sends a password reset email to the given address.
 * Supabase sends a secure link; we always show the same confirmation for security.
 */
export async function requestPasswordReset(
  input: RequestPasswordResetInput
): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.resetPasswordForEmail(input.email, {
    redirectTo: `${window.location.origin}/password-reset`,
  });
  return { error: error?.message ?? null };
}

/**
 * Updates the user's password using the recovery session (from the reset link hash).
 * Call this only when the user landed on /password-reset with type=recovery in the URL.
 */
export async function updatePasswordFromRecovery(
  input: ResetPasswordInput
): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.updateUser({ password: input.password });
  return { error: error?.message ?? null };
}

/**
 * Returns true if the current URL hash contains a Supabase recovery (reset) session.
 */
export function hasRecoverySessionInHash(): boolean {
  const hash = window.location.hash;
  if (!hash) return false;
  const params = new URLSearchParams(hash.replace("#", ""));
  return params.get("type") === "recovery";
}

/** Whether the user's email is verified (Supabase: email_confirmed_at set). */
export function isUserEmailVerified(user: User | null): boolean {
  return Boolean(user?.email_confirmed_at);
}

/**
 * Fetches the current session and user. Use for redirect logic (e.g. unverified → /email-verification).
 */
export async function getSession(): Promise<{ session: Session | null; user: User | null }> {
  const { data: { session } } = await supabase.auth.getSession();
  return { session, user: session?.user ?? null };
}

/**
 * Resends the signup/verification email for the current user.
 * Requires the user's email (from session). Supabase rate-limits this;
 * use client-side cooldown (e.g. 60s) to avoid hitting limits.
 */
export async function resendVerificationEmail(email: string): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
  });
  return { error: error?.message ?? null };
}
