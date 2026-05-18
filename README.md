# AM PRO v2

منصة اجتماعية لتتبع الإنجازات والنقاط والرتب، مبنية بـ HTML/CSS/JS خالص متصلة بـ Supabase كـ backend.

---

## المميزات

- **نظام رتب متكامل** — 18 رتبة من Dust لـ Founder بناءً على النقاط
- **داشبورد تفاعلي** — ليدربورد، مهام، محادثات، إعدادات الملف الشخصي
- **نظام محادثات** — شات خاص بين المستخدمين + شات جماعي للفريق
- **لوحة أدمن منفصلة** — إدارة المستخدمين والمهام والرتب والألقاب
- **أيقونات SVG inline** — بدون أي مكتبة خارجية
- **Realtime** — تحديثات فورية للرسائل والإشعارات
- **E2E Encryption** — تشفير المحادثات الخاصة
- **RLS كامل** — Row Level Security على كل الجداول

---

## هيكل الملفات

```
root/
├── index.html              ← redirect تلقائي لصفحة الدخول
├── auth/
│   ├── index.html          ← تسجيل الدخول / إنشاء حساب
│   ├── auth.css
│   └── auth.js
├── dashboard/
│   ├── index.html          ← الداشبورد الرئيسي
│   ├── dashboard.css
│   ├── dash.js             ← الرتب، النقاط، الليدربورد
│   ├── chat.js             ← نظام المحادثات
│   └── profile.js          ← الملف الشخصي والإعدادات
├── admin/
│   ├── index.html          ← لوحة التحكم
│   ├── admin.css
│   └── admin.js
└── shared/
    ├── config.js           ← بيانات الاتصال بـ Supabase
    └── icons.js            ← مكتبة الأيقونات SVG
```

---

## الإعداد

### 1. Supabase — مرة واحدة فقط

- روح [supabase.com](https://supabase.com) → مشروعك → **SQL Editor**
- شغّل ملف `SUPABASE_FULL_SETUP.sql` كاملاً
- ده هينشئ كل الجداول والـ policies والـ storage buckets

### 2. تحديث الـ Credentials

في `dashboard/dash.js` و `chat.js` و `profile.js` و `auth/auth.js`:
```js
const SUPABASE_URL  = "https://your-project.supabase.co";
const SUPABASE_ANON = "your-anon-key";
```

في `admin/admin.js`:
```js
// ⚠ Service role key — لا تحطه في user-site أبداً
const SUPABASE_SERVICE = "your-service-role-key";
```

### 3. تغيير بيانات الأدمن

```sql
UPDATE public.admin_users
SET username = 'your_username', password = 'YourStrongPass!'
WHERE id = 1;
```

### 4. الرفع على GitHub Pages

- ارفع كل الملفات على الـ root مباشرةً في الـ repo
- روح **Settings → Pages → Branch: main → Save**
- الموقع هيكون متاح على: `https://username.github.io/repo-name`

> **ملاحظة:** لوحة الأدمن يُفضّل ترفعها على رابط منفصل وتحميها بـ password لأنها بتستخدم service role key.

---

## قاعدة البيانات

| الجدول | الوصف |
|--------|-------|
| `users` | بيانات المستخدمين والملفات الشخصية |
| `ranks` | الرتب الـ 18 بالنقاط والألوان والأيقونات |
| `titles` | الألقاب الخاصة القابلة للتخصيص |
| `tasks` | المهام المطلوبة من المستخدمين |
| `task_submissions` | تسليمات المهام في انتظار الموافقة |
| `conversations` | المحادثات الخاصة |
| `messages` | رسائل المحادثات الخاصة |
| `team_messages` | رسائل الشات الجماعي |
| `notifications` | إشعارات الرتب والمهام والرسائل |
| `delete_requests` | طلبات حذف الحساب |
| `public_keys` | مفاتيح التشفير E2E |
| `admin_users` | بيانات الأدمن |

---

## نظام الرتب

| الرتبة | النقاط |
|--------|--------|
| Dust | 0 – 99 |
| Stone | 100 – 249 |
| Iron | 250 – 499 |
| Bronze | 500 – 999 |
| Silver | 1,000 – 1,999 |
| Gold | 2,000 – 3,499 |
| Platinum | 3,500 – 5,999 |
| Diamond | 6,000 – 9,999 |
| Emerald | 10,000 – 14,999 |
| Sapphire | 15,000 – 21,999 |
| Obsidian | 22,000 – 30,999 |
| Mythic | 31,000 – 42,999 |
| Legend | 43,000 – 59,999 |
| Master | 60,000 – 84,999 |
| Grandmaster | 85,000 – 119,999 |
| Imperial | 120,000 – 169,999 |
| Royal | 170,000 – 249,999 |
| Founder | 250,000+ |

الرتبة بتتحدث تلقائياً عن طريق Postgres trigger لما بتتغير نقاط اليوزر.

---

## الأمان

- **RLS** على كل الجداول — كل يوزر بيشوف بياناته بس
- **Service role key** مش موجود في user-site
- **E2E encryption** — الـ private keys ما بتطلعش من المتصفح
- **طلبات الحذف** بتعدي على الأدمن — ما فيش self-deletion مباشر

---

## التقنيات المستخدمة

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Supabase (PostgreSQL + Realtime + Storage + Auth)
- **Fonts:** Syne + DM Sans (Google Fonts)
- **Icons:** SVG inline — بدون أي مكتبة خارجية
- **Hosting:** GitHub Pages / Vercel / Netlify
