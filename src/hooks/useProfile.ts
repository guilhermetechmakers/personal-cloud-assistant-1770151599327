import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProfile,
  upsertProfile,
  getUserPreferences,
  upsertUserPreferences,
  getUserSecurity,
  setTwoFactorEnabled,
  getSessions,
  revokeSession,
} from "@/api/profile";
import type { ProfileUpdate } from "@/types/database/profiles";
import type { UserPreferencesUpdate } from "@/types/database/user_preferences";

const profileKeys = {
  all: ["profile"] as const,
  profile: (userId: string) => ["profile", userId] as const,
  preferences: (userId: string) => ["profile", "preferences", userId] as const,
  security: (userId: string) => ["profile", "security", userId] as const,
  sessions: (userId: string) => ["profile", "sessions", userId] as const,
};

export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: profileKeys.profile(userId ?? ""),
    queryFn: () => getProfile(userId!).then((r) => (r.error ? Promise.reject(new Error(r.error)) : r.data)),
    enabled: Boolean(userId),
  });
}

export function useUpdateProfile(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProfileUpdate) =>
      upsertProfile(userId!, payload).then((r) =>
        r.error ? Promise.reject(new Error(r.error)) : r.data!
      ),
    onSuccess: (_, __, ___) => {
      if (userId) queryClient.invalidateQueries({ queryKey: profileKeys.profile(userId) });
    },
  });
}

export function useUserPreferences(userId: string | undefined) {
  return useQuery({
    queryKey: profileKeys.preferences(userId ?? ""),
    queryFn: () =>
      getUserPreferences(userId!).then((r) =>
        r.error ? Promise.reject(new Error(r.error)) : r.data
      ),
    enabled: Boolean(userId),
  });
}

export function useUpdateUserPreferences(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UserPreferencesUpdate) =>
      upsertUserPreferences(userId!, payload).then((r) =>
        r.error ? Promise.reject(new Error(r.error)) : r.data!
      ),
    onSuccess: (_, __, ___) => {
      if (userId) queryClient.invalidateQueries({ queryKey: profileKeys.preferences(userId) });
    },
  });
}

export function useUserSecurity(userId: string | undefined) {
  return useQuery({
    queryKey: profileKeys.security(userId ?? ""),
    queryFn: () =>
      getUserSecurity(userId!).then((r) =>
        r.error ? Promise.reject(new Error(r.error)) : r.data
      ),
    enabled: Boolean(userId),
  });
}

export function useSetTwoFactor(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (enabled: boolean) =>
      setTwoFactorEnabled(userId!, enabled).then((r) =>
        r.error ? Promise.reject(new Error(r.error)) : r.data!
      ),
    onSuccess: (_, __, ___) => {
      if (userId) queryClient.invalidateQueries({ queryKey: profileKeys.security(userId) });
    },
  });
}

export function useSessions(userId: string | undefined) {
  return useQuery({
    queryKey: profileKeys.sessions(userId ?? ""),
    queryFn: () =>
      getSessions(userId!).then((r) =>
        r.error ? Promise.reject(new Error(r.error)) : r.data
      ),
    enabled: Boolean(userId),
  });
}

export function useRevokeSession(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) =>
      revokeSession(sessionId).then((r) =>
        r.error ? Promise.reject(new Error(r.error)) : undefined
      ),
    onSuccess: (_, __, ___) => {
      if (userId) queryClient.invalidateQueries({ queryKey: profileKeys.sessions(userId) });
    },
  });
}
