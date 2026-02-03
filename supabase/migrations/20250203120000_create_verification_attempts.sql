-- =====================================================
-- Migration: Verification attempts tracking
-- Created: 2025-02-03T12:00:00.000Z
-- Tables: verification_attempts
-- Purpose: Track email verification resend attempts for cooldown and audit
-- =====================================================

-- Enable UUID extension (idempotent)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: verification_attempts
-- Purpose: Log verification email resend attempts per user
-- =====================================================
CREATE TABLE IF NOT EXISTS verification_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- attempt_time: when the resend was requested
  attempt_time TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- status: pending (sent), resent (triggered), verified (user verified later)
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resent', 'verified')),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS verification_attempts_user_id_idx ON verification_attempts(user_id);
CREATE INDEX IF NOT EXISTS verification_attempts_attempt_time_idx ON verification_attempts(attempt_time DESC);
CREATE INDEX IF NOT EXISTS verification_attempts_status_idx ON verification_attempts(status);

-- Enable Row Level Security
ALTER TABLE verification_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own attempts
CREATE POLICY "verification_attempts_select_own"
  ON verification_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "verification_attempts_insert_own"
  ON verification_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- No UPDATE/DELETE for audit integrity; only insert and select

-- Documentation
COMMENT ON TABLE verification_attempts IS 'Audit log of email verification resend attempts';
COMMENT ON COLUMN verification_attempts.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN verification_attempts.user_id IS 'User who requested the resend (references auth.users)';
COMMENT ON COLUMN verification_attempts.attempt_time IS 'When the resend was requested';
COMMENT ON COLUMN verification_attempts.status IS 'pending = sent, resent = triggered, verified = user verified';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS verification_attempts CASCADE;
