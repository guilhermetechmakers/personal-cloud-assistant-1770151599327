import { supabase } from "@/lib/supabase";

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
