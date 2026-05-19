-- ============================================================
-- AM PRO — شغّل ده في Supabase SQL Editor
-- ============================================================

-- كولمز ناقصة في users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS banner_url  text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS title_id    uuid;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS online      boolean default false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_seen   timestamptz default now();
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS updated_at  timestamptz default now();

-- كولمز ناقصة في messages
ALTER TABLE public.messages      ADD COLUMN IF NOT EXISTS type      text default 'text';
ALTER TABLE public.messages      ADD COLUMN IF NOT EXISTS encrypted boolean default false;
ALTER TABLE public.team_messages ADD COLUMN IF NOT EXISTS type      text default 'text';

-- كولم gender في users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS gender text;

-- body و link في tasks لو ناقصين
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS body text;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS link text;

-- ============================================================
-- Done!
-- ============================================================
