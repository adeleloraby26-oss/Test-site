# AM PRO v2 — Optimized Setup Guide

## ما الذي تغير في هذه النسخة؟

### ✅ التحسينات
- **إزالة FontAwesome** — لم تعد تحتاجه، الأيقونات كلها SVG inline
- **استبدال الإيموجيهات بأيقونات SVG** (مثل واتساب وتيليجرام)
- **Admin Panel منفصل تماماً** في `/admin-panel/index.html`
- **أداء أسرع**: تحميل parallel لكل البيانات في `Promise.all`
- **Lazy loading** للصور (`loading="lazy"`)
- **`will-change: transform`** على عناصر الـ animation للـ GPU
- **تقليل re-renders** — الـ DOM يُحدَّث بالحد الأدنى

---

## هل لازم تعمل setup في Supabase قبل ما ترفع الملفات؟

### الجواب: **نعم، لازم تشغّل الـ SQL مرة واحدة فقط**

لكن بعد كده مش هتحتاج تلمسه تاني.

### ليه؟
الملفات دي HTML/JS فقط، بتكلّم Supabase مباشرة من المتصفح.
Supabase هو اللي بيعمل الـ database، الـ tables، الـ RLS، والـ realtime.
لو ما شغّلتش الـ SQL، مفيش tables ومفيش بيانات — الأب والموقع مش هيشتغلوا.

### الخطوات:
1. روح [supabase.com](https://supabase.com) → مشروعك → **SQL Editor**
2. افتح ملف `SUPABASE_FULL_SETUP.sql` وانسخ محتواه
3. الصقه في الـ SQL Editor واضغط **Run**
4. خلاص — الـ database جاهز تماماً

**بعد ما تعمل ده مرة واحدة، ارفع الملفات عادي — مش هتحتاج تعمل أي setup تاني.**

---

## Project Structure
```
ampro-v2/
├── SUPABASE_FULL_SETUP.sql   ← شغّل ده في Supabase مرة واحدة
├── shared/
│   ├── config.js             ← بيانات الـ Supabase
│   └── icons.js              ← مكتبة الأيقونات SVG
├── user-site/
│   ├── auth/
│   │   └── index.html        ← Login / Register
│   └── dashboard/
│       ├── index.html        ← Dashboard (SVG icons)
│       ├── dash.js           ← Ranks, points, members (SVG icons)
│       ├── chat.js           ← Chat system
│       └── profile.js        ← Profile + Settings
└── admin-panel/
    └── index.html            ← Admin Panel (ملف منفصل — سيرفر خاص)
```

---

## Quick Start

### Step 1: Supabase Setup (مرة واحدة فقط)
```sql
-- في Supabase SQL Editor، شغّل ملف:
SUPABASE_FULL_SETUP.sql
```

### Step 2: تحديث الـ Credentials
في `user-site/dashboard/dash.js` و `chat.js` و `profile.js`:
```js
const SUPABASE_URL  = "your-project-url";
const SUPABASE_ANON = "your-anon-key";
```

في `admin-panel/index.html`:
```js
const sb = createClient("your-project-url", "your-service-role-key");
// ⚠ Service role key — لا تضيف ده في الـ user-site أبداً
```

### Step 3: تغيير كلمة سر الأدمن
```sql
UPDATE public.admin_users
SET username='your_admin', password='YourStrongPass!'
WHERE id=1;
```

### Step 4: الرفع
- **User Site** → ارفع `user-site/` على Vercel أو Netlify أو GitHub Pages (مجاني)
- **Admin Panel** → ارفع `admin-panel/` على رابط خاص (موقع منفصل أو protected URL)

---

## Icon System (مكتبة الأيقونات)

بدل الإيموجيهات، كل الأيقونات دلوقتي SVG inline:

```js
// في shared/icons.js — أي أيقونة تحتاجها:
Icons.mail      // إيميل
Icons.lock      // قفل
Icons.eye       // عين
Icons.user      // مستخدم
Icons.trophy    // كأس
Icons.zap       // برق
Icons.send      // إرسال
// ... إلخ

// استخدامه في JS:
element.innerHTML = icon('mail', '16px');
```

---

## Security Notes
- الـ Admin Panel بيستخدم `service_role` key — ارفعه على رابط خاص
- RLS policies بتضمن إن اليوزر يشوف بياناته بس
- E2E encryption: الـ private keys ما بتطلعش من المتصفح
- طلبات الحذف بتعدي على الأدمن — ما فيش self-deletion
