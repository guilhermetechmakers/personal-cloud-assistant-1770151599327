-- =====================================================
-- Migration: Automations and automation runs
-- Created: 2025-02-03T16:00:00.000Z
-- Tables: automations, automation_runs
-- Purpose: Scheduled automations and run history for audit
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TABLE: automations
-- Purpose: User-defined automation rules (skill, trigger, schedule, timezone)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.automations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  name TEXT NOT NULL,
  description TEXT,
  skill_id UUID,
  skill_name TEXT,

  trigger_type TEXT NOT NULL DEFAULT 'schedule'
    CHECK (trigger_type IN ('manual', 'schedule', 'event')),
  trigger_definition JSONB DEFAULT '{}'::jsonb,

  schedule_cron TEXT,
  timezone TEXT NOT NULL DEFAULT 'UTC',

  status TEXT NOT NULL DEFAULT 'enabled'
    CHECK (status IN ('enabled', 'disabled')),

  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  CONSTRAINT automations_name_not_empty CHECK (length(trim(name)) > 0)
);

CREATE INDEX IF NOT EXISTS automations_user_id_idx ON public.automations(user_id);
CREATE INDEX IF NOT EXISTS automations_status_idx ON public.automations(status);
CREATE INDEX IF NOT EXISTS automations_created_at_idx ON public.automations(created_at DESC);

DROP TRIGGER IF EXISTS update_automations_updated_at ON public.automations;
CREATE TRIGGER update_automations_updated_at
  BEFORE UPDATE ON public.automations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.automations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "automations_select_own"
  ON public.automations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "automations_insert_own"
  ON public.automations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "automations_update_own"
  ON public.automations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "automations_delete_own"
  ON public.automations FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE public.automations IS 'User automation rules: skill, trigger, schedule, timezone';
COMMENT ON COLUMN public.automations.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN public.automations.user_id IS 'Owner (references auth.users)';
COMMENT ON COLUMN public.automations.trigger_definition IS 'Flexible trigger config (e.g. cron, event filters)';

-- =====================================================
-- TABLE: automation_runs
-- Purpose: Run history and audit snapshot per automation
-- =====================================================
CREATE TABLE IF NOT EXISTS public.automation_runs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  automation_id UUID REFERENCES public.automations(id) ON DELETE CASCADE NOT NULL,

  run_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  result_summary TEXT,
  result_metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS automation_runs_automation_id_idx ON public.automation_runs(automation_id);
CREATE INDEX IF NOT EXISTS automation_runs_run_time_idx ON public.automation_runs(run_time DESC);
CREATE INDEX IF NOT EXISTS automation_runs_status_idx ON public.automation_runs(status);

ALTER TABLE public.automation_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "automation_runs_select_via_automation"
  ON public.automation_runs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.automations a
      WHERE a.id = automation_runs.automation_id AND a.user_id = auth.uid()
    )
  );

CREATE POLICY "automation_runs_insert_via_automation"
  ON public.automation_runs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.automations a
      WHERE a.id = automation_runs.automation_id AND a.user_id = auth.uid()
    )
  );

COMMENT ON TABLE public.automation_runs IS 'Run history and audit snapshot for automations';
COMMENT ON COLUMN public.automation_runs.automation_id IS 'References automations.id';

-- =====================================================
-- ROLLBACK (documentation only)
-- =====================================================
-- DROP TABLE IF EXISTS public.automation_runs CASCADE;
-- DROP TABLE IF EXISTS public.automations CASCADE;
