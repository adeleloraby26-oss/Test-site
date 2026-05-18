-- ============================================================
-- AM PRO v2 — SUPABASE FULL SETUP
-- شغّل الملف ده كاملاً في SQL Editor في Supabase مرة واحدة بس
-- ============================================================

-- ── EXTENSIONS ───────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ══════════════════════════════════════════════════════════
-- TABLES
-- ══════════════════════════════════════════════════════════

-- ── RANKS ────────────────────────────────────────────────
create table if not exists public.ranks (
  id              uuid primary key default uuid_generate_v4(),
  name            text not null,
  min_points      int  not null default 0,
  max_points      int,
  color           text not null default '#8e8e93',
  gradient_from   text,
  gradient_to     text,
  glow_color      text,
  icon            text default 'wind',
  created_at      timestamptz default now()
);

-- ── TITLES ───────────────────────────────────────────────
create table if not exists public.titles (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  color         text default '#ffffff',
  glow_color    text,
  gradient_from text,
  gradient_to   text,
  animation     text, -- pulse | shimmer | rainbow | fire | electric
  created_at    timestamptz default now()
);

-- ── USERS ────────────────────────────────────────────────
create table if not exists public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text,
  username    text unique,
  email       text,
  bio         text,
  field       text,
  avatar_url  text,
  banner_url  text,
  points      int default 0,
  rank_id     uuid references public.ranks(id),
  title_id    uuid references public.titles(id),
  verified    boolean default false,
  online      boolean default false,
  last_seen   timestamptz default now(),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ── USER_TITLES (many-to-many) ───────────────────────────
create table if not exists public.user_titles (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references public.users(id) on delete cascade,
  title_id   uuid references public.titles(id) on delete cascade,
  awarded_at timestamptz default now(),
  unique(user_id, title_id)
);

-- ── TASKS ────────────────────────────────────────────────
create table if not exists public.tasks (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references public.users(id) on delete cascade,
  title       text not null,
  body        text,
  points      int default 0,
  status      text default 'pending', -- pending | submitted | approved | rejected
  link        text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ── TASK_SUBMISSIONS ─────────────────────────────────────
create table if not exists public.task_submissions (
  id          uuid primary key default uuid_generate_v4(),
  task_id     uuid references public.tasks(id) on delete cascade,
  user_id     uuid references public.users(id) on delete cascade,
  submitted_at timestamptz default now()
);

-- ── CONVERSATIONS ────────────────────────────────────────
create table if not exists public.conversations (
  id          uuid primary key default uuid_generate_v4(),
  user1_id    uuid references public.users(id) on delete cascade,
  user2_id    uuid references public.users(id) on delete cascade,
  last_msg    text,
  last_msg_at timestamptz default now(),
  created_at  timestamptz default now(),
  unique(user1_id, user2_id)
);

-- ── MESSAGES ─────────────────────────────────────────────
create table if not exists public.messages (
  id              uuid primary key default uuid_generate_v4(),
  conversation_id uuid references public.conversations(id) on delete cascade,
  sender_id       uuid references public.users(id) on delete cascade,
  content         text,           -- encrypted for E2E
  file_url        text,
  file_type       text,           -- image | voice | file
  read            boolean default false,
  created_at      timestamptz default now()
);

-- ── TEAM_MESSAGES ────────────────────────────────────────
create table if not exists public.team_messages (
  id          uuid primary key default uuid_generate_v4(),
  sender_id   uuid references public.users(id) on delete cascade,
  content     text,
  file_url    text,
  file_type   text,
  created_at  timestamptz default now()
);

-- ── PUBLIC_KEYS (E2E encryption) ─────────────────────────
create table if not exists public.public_keys (
  user_id     uuid primary key references public.users(id) on delete cascade,
  public_key  text not null,
  updated_at  timestamptz default now()
);

-- ── NOTIFICATIONS ────────────────────────────────────────
create table if not exists public.notifications (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references public.users(id) on delete cascade,
  title       text not null,
  body        text,
  read        boolean default false,
  created_at  timestamptz default now()
);

-- ── DELETE_REQUESTS ──────────────────────────────────────
create table if not exists public.delete_requests (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references public.users(id) on delete cascade,
  reason      text,
  status      text default 'pending', -- pending | approved | rejected
  created_at  timestamptz default now()
);

-- ── ADMIN_USERS ──────────────────────────────────────────
create table if not exists public.admin_users (
  id          serial primary key,
  username    text not null unique,
  password    text not null,
  created_at  timestamptz default now()
);

-- ══════════════════════════════════════════════════════════
-- TRIGGERS
-- ══════════════════════════════════════════════════════════

-- Auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email, name, username)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
    lower(regexp_replace(coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)), '[^a-z0-9]', '', 'g'))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-update rank when points change
create or replace function public.update_user_rank()
returns trigger language plpgsql as $$
declare
  new_rank_id uuid;
begin
  select id into new_rank_id
  from public.ranks
  where min_points <= new.points
  order by min_points desc
  limit 1;

  if new_rank_id is not null and new_rank_id is distinct from new.rank_id then
    new.rank_id := new_rank_id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_points_change on public.users;
create trigger on_points_change
  before update of points on public.users
  for each row execute function public.update_user_rank();

-- Update conversation last_msg on new message
create or replace function public.update_conversation_last_msg()
returns trigger language plpgsql as $$
begin
  update public.conversations
  set last_msg = new.content, last_msg_at = new.created_at
  where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists on_new_message on public.messages;
create trigger on_new_message
  after insert on public.messages
  for each row execute function public.update_conversation_last_msg();

-- ══════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ══════════════════════════════════════════════════════════

alter table public.users            enable row level security;
alter table public.ranks            enable row level security;
alter table public.titles           enable row level security;
alter table public.user_titles      enable row level security;
alter table public.tasks            enable row level security;
alter table public.task_submissions enable row level security;
alter table public.conversations    enable row level security;
alter table public.messages         enable row level security;
alter table public.team_messages    enable row level security;
alter table public.public_keys      enable row level security;
alter table public.notifications    enable row level security;
alter table public.delete_requests  enable row level security;

-- RANKS & TITLES — everyone reads
create policy "ranks_read_all"  on public.ranks  for select using (true);
create policy "titles_read_all" on public.titles for select using (true);

-- USERS — everyone reads, own row update
create policy "users_read_all"   on public.users for select using (true);
create policy "users_insert_own" on public.users for insert with check (auth.uid() = id);
create policy "users_update_own" on public.users for update using (auth.uid() = id);

-- USER_TITLES
create policy "user_titles_read"   on public.user_titles for select using (true);
create policy "user_titles_insert" on public.user_titles for insert with check (auth.uid() = user_id);

-- TASKS — read own tasks
create policy "tasks_read_own" on public.tasks for select using (auth.uid() = user_id);
create policy "tasks_update_own" on public.tasks for update using (auth.uid() = user_id);

-- TASK_SUBMISSIONS
create policy "submissions_insert_own" on public.task_submissions
  for insert with check (auth.uid() = user_id);
create policy "submissions_read_own" on public.task_submissions
  for select using (auth.uid() = user_id);

-- CONVERSATIONS — read if participant
create policy "conv_read" on public.conversations
  for select using (auth.uid() = user1_id or auth.uid() = user2_id);
create policy "conv_insert" on public.conversations
  for insert with check (auth.uid() = user1_id or auth.uid() = user2_id);
create policy "conv_update" on public.conversations
  for update using (auth.uid() = user1_id or auth.uid() = user2_id);

-- MESSAGES — read if in conversation
create policy "msg_select" on public.messages for select using (
  exists (
    select 1 from public.conversations c
    where c.id = messages.conversation_id
      and (c.user1_id = auth.uid() or c.user2_id = auth.uid())
  )
);
create policy "msg_insert" on public.messages for insert with check (auth.uid() = sender_id);
create policy "msg_update_read" on public.messages for update using (
  exists (
    select 1 from public.conversations c
    where c.id = messages.conversation_id
      and (c.user1_id = auth.uid() or c.user2_id = auth.uid())
  )
);

-- TEAM_MESSAGES — all authenticated
create policy "team_msg_read"   on public.team_messages for select using (auth.role() = 'authenticated');
create policy "team_msg_insert" on public.team_messages for insert with check (auth.uid() = sender_id);

-- PUBLIC_KEYS
create policy "pubkeys_read" on public.public_keys for select using (true);
create policy "pubkeys_upsert" on public.public_keys
  for insert with check (auth.uid() = user_id);
create policy "pubkeys_update" on public.public_keys
  for update using (auth.uid() = user_id);

-- NOTIFICATIONS — own only
create policy "notif_read_own"   on public.notifications for select using (auth.uid() = user_id);
create policy "notif_update_own" on public.notifications for update using (auth.uid() = user_id);

-- DELETE_REQUESTS — own only
create policy "delreq_insert_own" on public.delete_requests
  for insert with check (auth.uid() = user_id);
create policy "delreq_read_own" on public.delete_requests
  for select using (auth.uid() = user_id);

-- ══════════════════════════════════════════════════════════
-- STORAGE BUCKETS
-- ══════════════════════════════════════════════════════════

insert into storage.buckets (id, name, public)
values
  ('avatars',     'avatars',     true),
  ('banners',     'banners',     true),
  ('chat-files',  'chat-files',  true),
  ('voice-notes', 'voice-notes', true)
on conflict (id) do nothing;

-- Storage policies
create policy "avatars_public_read" on storage.objects for select
  using (bucket_id = 'avatars');
create policy "avatars_auth_upload" on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.role() = 'authenticated');
create policy "avatars_auth_update" on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "banners_public_read" on storage.objects for select
  using (bucket_id = 'banners');
create policy "banners_auth_upload" on storage.objects for insert
  with check (bucket_id = 'banners' and auth.role() = 'authenticated');
create policy "banners_auth_update" on storage.objects for update
  using (bucket_id = 'banners' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "chat_files_read" on storage.objects for select
  using (bucket_id = 'chat-files' and auth.role() = 'authenticated');
create policy "chat_files_upload" on storage.objects for insert
  with check (bucket_id = 'chat-files' and auth.role() = 'authenticated');

create policy "voice_notes_read" on storage.objects for select
  using (bucket_id = 'voice-notes' and auth.role() = 'authenticated');
create policy "voice_notes_upload" on storage.objects for insert
  with check (bucket_id = 'voice-notes' and auth.role() = 'authenticated');

-- ══════════════════════════════════════════════════════════
-- REALTIME
-- ══════════════════════════════════════════════════════════

-- Enable realtime on required tables
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.team_messages;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.tasks;
alter publication supabase_realtime add table public.users;

-- ══════════════════════════════════════════════════════════
-- SEED DATA — الرتب الـ 18
-- ══════════════════════════════════════════════════════════

insert into public.ranks (name, min_points, max_points, color, gradient_from, gradient_to, glow_color, icon) values
  ('Dust',        0,       99,     '#8e8e93', null,      null,      null,        'wind'),
  ('Stone',       100,     249,    '#636366', '#636366', '#8e8e93', '#63636644', 'wind'),
  ('Iron',        250,     499,    '#aeaeb2', '#8e8e93', '#c7c7cc', '#aeaeb244', 'zap'),
  ('Bronze',      500,     999,    '#a2845e', '#a2845e', '#c8a97c', '#a2845e44', 'sword'),
  ('Silver',      1000,    1999,   '#8e8e93', '#8e8e93', '#d1d1d6', '#8e8e9344', 'sword'),
  ('Gold',        2000,    3499,   '#ffd700', '#f5c842', '#ffd700', '#ffd70044', 'star'),
  ('Platinum',    3500,    5999,   '#00b4d8', '#00b4d8', '#90e0ef', '#00b4d844', 'gem'),
  ('Diamond',     6000,    9999,   '#48cae4', '#48cae4', '#a9d6e5', '#48cae444', 'gem'),
  ('Emerald',     10000,   14999,  '#22c55e', '#16a34a', '#4ade80', '#22c55e44', 'gem'),
  ('Sapphire',    15000,   21999,  '#6366f1', '#4f46e5', '#818cf8', '#6366f144', 'gem'),
  ('Obsidian',    22000,   30999,  '#1c1c2e', '#0f0f1a', '#3d3d5c', '#6366f166', 'flame'),
  ('Mythic',      31000,   42999,  '#a78bfa', '#7c3aed', '#c4b5fd', '#a78bfa44', 'flame'),
  ('Legend',      43000,   59999,  '#f97316', '#ea580c', '#fb923c', '#f9731644', 'trophy'),
  ('Master',      60000,   84999,  '#ef4444', '#dc2626', '#f87171', '#ef444444', 'trophy'),
  ('Grandmaster', 85000,   119999, '#ec4899', '#be185d', '#f472b6', '#ec489944', 'crown'),
  ('Imperial',    120000,  169999, '#f59e0b', '#b45309', '#fcd34d', '#f59e0b44', 'crown'),
  ('Royal',       170000,  249999, '#8b5cf6', '#5b21b6', '#a78bfa', '#8b5cf644', 'crown'),
  ('Founder',     250000,  null,   '#fff',    '#f0f0ff', '#a78bfa', '#ffffff66', 'crown')
on conflict do nothing;

-- ══════════════════════════════════════════════════════════
-- ADMIN USER (غيّر البيانات دي بعد ما تشغّل السكريبت)
-- ══════════════════════════════════════════════════════════

insert into public.admin_users (username, password)
values ('admin', 'Change_Me_123!')
on conflict do nothing;

-- ══════════════════════════════════════════════════════════
-- Done! الإعداد اتكمل 
-- ══════════════════════════════════════════════════════════
