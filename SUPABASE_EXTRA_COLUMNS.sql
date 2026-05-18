-- ============================================================
-- AM PRO v2 — كولمز إضافية
-- شغّل ده في SQL Editor بعد SUPABASE_FULL_SETUP.sql
-- ============================================================

-- إضافة gender في users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS gender text;

-- إضافة type في messages و team_messages
ALTER TABLE public.messages      ADD COLUMN IF NOT EXISTS type text default 'text';
ALTER TABLE public.team_messages ADD COLUMN IF NOT EXISTS type text default 'text';

-- Done!
