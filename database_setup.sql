-- ============================================================
-- AM PRO PLATFORM — Full Supabase Database Setup
-- ============================================================
-- الخطوات:
-- 1. روح Supabase Dashboard > SQL Editor
-- 2. اضغط "New query"
-- 3. انسخ المحتوى كله والصقه
-- 4. اضغط "Run"
-- ============================================================
-- الـ Sections:
--   1.  Extensions
--   2.  Users Table + Auto-create trigger
--   3.  Tasks Table
--   4.  Courses + Course Completions Tables
--   5.  Messages Table (DM + Community)
--   6.  Notifications Table
--   7.  Announcements Table
--   8.  Events Table
--   9.  Account Deletion Requests
--   10. Achievements Table
--   11. Activity Feed Table
--   12. Storage Buckets (avatars, banners, chat-media, files)
--   13. Row Level Security (RLS) Policies
--   14. Storage Policies
--   15. Indexes for Performance
--   16. Realtime Subscriptions
--   17. Seed Data (Optional)
--   18. Helper Functions
-- ============================================================

-- ============================================================
-- SECTION 1: EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- SECTION 2: CORE USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT UNIQUE,
  name          TEXT DEFAULT '',
  username      TEXT UNIQUE,
  avatar_url    TEXT,
  banner_url    TEXT,
  bio           TEXT DEFAULT '',
  field         TEXT DEFAULT '',
  level         INTEGER DEFAULT 1,
  role          TEXT DEFAULT 'member'
                  CHECK (role IN ('founder','co-founder','admin','moderator','senior_developer','developer','designer','member')),
  verified      BOOLEAN DEFAULT FALSE,
  online        BOOLEAN DEFAULT FALSE,
  last_seen     TIMESTAMPTZ DEFAULT NOW(),
  status        TEXT DEFAULT 'active'
                  CHECK (status IN ('active','suspended','pending_delete','deleted')),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email,'@',1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- SECTION 3: TASKS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tasks (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         TEXT NOT NULL DEFAULT 'New Task',
  body          TEXT DEFAULT '',
  link          TEXT DEFAULT '',
  status        TEXT DEFAULT 'todo'
                  CHECK (status IN ('todo','in_progress','review','done')),
  priority      TEXT DEFAULT 'medium'
                  CHECK (priority IN ('low','medium','high','urgent')),
  due_date      DATE,
  user_id       UUID REFERENCES public.users(id) ON DELETE SET NULL,
  assigned_by   UUID REFERENCES public.users(id) ON DELETE SET NULL,
  done          BOOLEAN DEFAULT FALSE,
  progress      INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 4: COURSES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.courses (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         TEXT NOT NULL DEFAULT 'New Course',
  body          TEXT DEFAULT '',
  link          TEXT DEFAULT '',
  thumbnail_url TEXT,
  category      TEXT DEFAULT 'general',
  order_index   INTEGER DEFAULT 0,
  created_by    UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Course completions (per user)
CREATE TABLE IF NOT EXISTS public.course_completions (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id  UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES public.users(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_id, user_id)
);

-- ============================================================
-- SECTION 5: MESSAGES TABLE (DM + Community)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id     UUID REFERENCES public.users(id) ON DELETE SET NULL,
  receiver_id   UUID REFERENCES public.users(id) ON DELETE SET NULL, -- NULL = community
  channel       TEXT DEFAULT 'community',  -- 'community' | 'dm'
  content       TEXT DEFAULT '',
  type          TEXT DEFAULT 'text'
                  CHECK (type IN ('text','image','video','voice','sticker','file','system')),
  media_url     TEXT,
  media_type    TEXT,
  sticker_id    TEXT,
  reply_to      UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  reactions     JSONB DEFAULT '{}',
  seen          BOOLEAN DEFAULT FALSE,
  seen_at       TIMESTAMPTZ,
  pinned        BOOLEAN DEFAULT FALSE,
  one_time      BOOLEAN DEFAULT FALSE,
  one_time_opened BOOLEAN DEFAULT FALSE,
  one_time_opened_at TIMESTAMPTZ,
  expires_at    TIMESTAMPTZ,
  edited        BOOLEAN DEFAULT FALSE,
  deleted       BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 6: NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID REFERENCES public.users(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,   -- 'message','task_assigned','task_done','course_done','mention','announcement','deletion_status'
  title      TEXT NOT NULL DEFAULT '',
  body       TEXT DEFAULT '',
  link       TEXT DEFAULT '',
  read       BOOLEAN DEFAULT FALSE,
  data       JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 7: ANNOUNCEMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.announcements (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL DEFAULT '',
  body        TEXT NOT NULL DEFAULT '',
  author_id   UUID REFERENCES public.users(id) ON DELETE SET NULL,
  pinned      BOOLEAN DEFAULT FALSE,
  type        TEXT DEFAULT 'info' CHECK (type IN ('info','warning','success','danger')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 8: EVENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  starts_at   TIMESTAMPTZ NOT NULL,
  ends_at     TIMESTAMPTZ,
  location    TEXT DEFAULT '',
  created_by  UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 9: ACCOUNT DELETION REQUESTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.deletion_requests (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES public.users(id) ON DELETE CASCADE,
  reason      TEXT DEFAULT '',
  status      TEXT DEFAULT 'pending'
                CHECK (status IN ('pending','approved','rejected','suspended')),
  admin_note  TEXT DEFAULT '',
  reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 10: ACHIEVEMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.achievements (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  icon        TEXT DEFAULT '🏆',
  awarded_by  UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 11: ACTIVITY FEED TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.activity (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES public.users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,  -- 'task_done','course_done','rank_up','joined','achievement'
  description TEXT DEFAULT '',
  data        JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 12: STORAGE BUCKETS
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars',  'avatars',  true, 5242880,  ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('banners',  'banners',  true, 10485760, ARRAY['image/jpeg','image/png','image/webp']),
  ('media',    'media',    true, 52428800, ARRAY['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','audio/webm','audio/mpeg','audio/ogg']),
  ('files',    'files',    true, 20971520, NULL)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SECTION 13: ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS
ALTER TABLE public.users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deletion_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity          ENABLE ROW LEVEL SECURITY;

-- Helper: check if current user is admin/founder
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role IN ('founder','co-founder','admin')
  );
$$;

-- USERS policies
CREATE POLICY "Anyone can read users"     ON public.users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users update own profile"  ON public.users FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND role = (SELECT role FROM public.users WHERE id = auth.uid()));
CREATE POLICY "Admins can update any user" ON public.users FOR UPDATE TO authenticated
  USING (public.is_admin());

-- TASKS policies
CREATE POLICY "Users see own tasks"       ON public.tasks FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "Admins manage tasks"       ON public.tasks FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Users update own task"     ON public.tasks FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- COURSES policies
CREATE POLICY "Anyone reads courses"      ON public.courses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage courses"     ON public.courses FOR ALL TO authenticated USING (public.is_admin());

-- COURSE COMPLETIONS policies
CREATE POLICY "Users see own completions" ON public.course_completions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users mark complete"       ON public.course_completions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users delete own"          ON public.course_completions FOR DELETE TO authenticated USING (user_id = auth.uid());

-- MESSAGES policies
CREATE POLICY "Users read own messages"   ON public.messages FOR SELECT TO authenticated
  USING (sender_id = auth.uid() OR receiver_id = auth.uid() OR channel = 'community');
CREATE POLICY "Users send messages"       ON public.messages FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid());
CREATE POLICY "Users update own messages" ON public.messages FOR UPDATE TO authenticated
  USING (sender_id = auth.uid());

-- NOTIFICATIONS policies
CREATE POLICY "Users read own notifs"     ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins insert notifs"      ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users update own notifs"   ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- ANNOUNCEMENTS policies
CREATE POLICY "Anyone reads announcements" ON public.announcements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage announcements" ON public.announcements FOR ALL TO authenticated USING (public.is_admin());

-- EVENTS policies
CREATE POLICY "Anyone reads events"       ON public.events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage events"      ON public.events FOR ALL TO authenticated USING (public.is_admin());

-- DELETION REQUESTS policies
CREATE POLICY "Users see own requests"    ON public.deletion_requests FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "Users create requests"     ON public.deletion_requests FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins manage requests"    ON public.deletion_requests FOR UPDATE TO authenticated USING (public.is_admin());

-- ACHIEVEMENTS policies
CREATE POLICY "Anyone reads achievements" ON public.achievements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins grant achievements" ON public.achievements FOR ALL TO authenticated USING (public.is_admin());

-- ACTIVITY policies
CREATE POLICY "Anyone reads activity"     ON public.activity FOR SELECT TO authenticated USING (true);
CREATE POLICY "System inserts activity"   ON public.activity FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================================
-- SECTION 14: STORAGE POLICIES
-- ============================================================

-- Avatars
CREATE POLICY "Public read avatars"       ON storage.objects FOR SELECT TO public USING (bucket_id = 'avatars');
CREATE POLICY "Auth upload own avatar"    ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Auth update own avatar"    ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Auth delete own avatar"    ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Banners
CREATE POLICY "Public read banners"       ON storage.objects FOR SELECT TO public USING (bucket_id = 'banners');
CREATE POLICY "Auth upload own banner"    ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'banners' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Auth update own banner"    ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'banners' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Auth delete own banner"    ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'banners' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Media
CREATE POLICY "Public read media"         ON storage.objects FOR SELECT TO public USING (bucket_id = 'media');
CREATE POLICY "Auth upload media"         ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'media');
CREATE POLICY "Auth update own media"     ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'media' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Files
CREATE POLICY "Public read files"         ON storage.objects FOR SELECT TO public USING (bucket_id = 'files');
CREATE POLICY "Auth upload files"         ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'files');

-- ============================================================
-- SECTION 15: INDEXES FOR PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_tasks_user_id        ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status         ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_messages_sender      ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver    ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_channel     ON public.messages(channel);
CREATE INDEX IF NOT EXISTS idx_messages_created     ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user   ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read   ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_activity_user        ON public.activity(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_created     ON public.activity(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_role           ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_online         ON public.users(online);

-- ============================================================
-- SECTION 16: REALTIME SUBSCRIPTIONS
-- Enable realtime on these tables in Supabase Dashboard > Database > Replication
-- ============================================================
-- Tables to enable:
--   public.messages
--   public.notifications
--   public.tasks
--   public.users
--   public.announcements
--   public.activity

-- ============================================================
-- SECTION 17: SEED DATA (Optional — remove in production)
-- ============================================================

-- Insert sample courses
INSERT INTO public.courses (title, body, link, category, order_index)
VALUES
  ('Introduction to Web Development', 'Learn the fundamentals of HTML, CSS, and JavaScript to build modern websites.', 'https://example.com/course/1', 'development', 1),
  ('Advanced React Patterns', 'Deep dive into advanced React patterns including hooks, context, and performance optimization.', 'https://example.com/course/2', 'development', 2),
  ('UI/UX Design Principles', 'Master the core principles of user interface and experience design.', 'https://example.com/course/3', 'design', 3),
  ('Supabase Full Stack', 'Build full-stack applications with Supabase as your backend.', 'https://example.com/course/4', 'development', 4),
  ('TypeScript Mastery', 'Complete TypeScript guide from basics to advanced type systems.', 'https://example.com/course/5', 'development', 5)
ON CONFLICT DO NOTHING;

-- Insert sample announcement
INSERT INTO public.announcements (title, body, type, pinned)
VALUES (
  'Welcome to AM PRO Platform! 🚀',
  'We''re excited to launch our new community platform. Explore tasks, courses, and connect with your team. More features coming soon!',
  'success',
  true
)
ON CONFLICT DO NOTHING;

-- ============================================================
-- SECTION 18: FUNCTIONS
-- ============================================================

-- Update user last_seen and online status
CREATE OR REPLACE FUNCTION public.update_user_presence(user_id UUID, is_online BOOLEAN)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.users
  SET online = is_online, last_seen = NOW(), updated_at = NOW()
  WHERE id = user_id;
END;
$$;

-- Get DM conversation between two users
CREATE OR REPLACE FUNCTION public.get_dm_messages(user_a UUID, user_b UUID)
RETURNS SETOF public.messages LANGUAGE sql SECURITY DEFINER AS $$
  SELECT * FROM public.messages
  WHERE deleted = FALSE
  AND (
    (sender_id = user_a AND receiver_id = user_b)
    OR
    (sender_id = user_b AND receiver_id = user_a)
  )
  ORDER BY created_at ASC;
$$;

-- Mark DM messages as seen
CREATE OR REPLACE FUNCTION public.mark_dm_seen(from_user UUID, to_user UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.messages
  SET seen = TRUE, seen_at = NOW()
  WHERE sender_id = from_user
  AND receiver_id = to_user
  AND seen = FALSE;
END;
$$;

-- Create notification helper
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_body TEXT DEFAULT '',
  p_data JSONB DEFAULT '{}'
)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, body, data)
  VALUES (p_user_id, p_type, p_title, p_body, p_data)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

-- ============================================================
-- DONE! Your AM PRO database is ready.
-- ============================================================
