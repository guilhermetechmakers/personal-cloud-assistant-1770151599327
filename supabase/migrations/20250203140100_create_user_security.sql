-- =====================================================
-- Migration: User security (2FA) and sessions
-- Created: 2025-02-03T14:01:00.000Z
-- Tables: user_security, user_sessions
-- Purpose: 2FA toggle and session list for revoke
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: user_security
-- Purpose: 2FA and security preferences per user
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_security (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  two_factor_enabled BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS user_security_user_id_idx ON public.user_security(user_id);

DROP TRIGGER IF EXISTS update_user_security_updated_at ON public.user_security;
CREATE TRIGGER update_user_security_updated_at
  BEFORE UPDATE ON public.user_security
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.user_security ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_security_select_own"
  ON public.user_security FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_security_insert_own"
  ON public.user_security FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_security_update_own"
  ON public.user_security FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE public.user_security IS 'User security settings (2FA enabled)';

-- =====================================================
-- TABLE: user_sessions
-- Purpose: Track sessions for display and revoke (populated by app/trigger)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  device_info TEXT,
  last_active_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS user_sessions_user_id_idx ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS user_sessions_last_active_idx ON public.user_sessions(last_active_at DESC);

ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_sessions_select_own"
  ON public.user_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_sessions_insert_own"
  ON public.user_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_sessions_delete_own"
  ON public.user_sessions FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE public.user_sessions IS 'User sessions for list and revoke (client-tracked)';

-- =====================================================
-- ROLLBACK (documentation only)
-- =====================================================
-- DROP TABLE IF EXISTS public.user_sessions CASCADE;
-- DROP TABLE IF EXISTS public.user_security CASCADE;
