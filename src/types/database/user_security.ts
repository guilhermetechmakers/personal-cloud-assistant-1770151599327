/**
 * Database types for user_security and user_sessions tables
 */

export interface UserSecurity {
  id: string;
  user_id: string;
  two_factor_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserSecurityInsert {
  user_id: string;
  two_factor_enabled?: boolean;
}

export interface UserSecurityUpdate {
  two_factor_enabled?: boolean;
}

export interface UserSession {
  id: string;
  user_id: string;
  device_info: string | null;
  last_active_at: string;
  created_at: string;
}

export interface UserSessionInsert {
  user_id: string;
  device_info?: string | null;
  last_active_at?: string;
}
