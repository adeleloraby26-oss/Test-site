# AM PRO Platform 🚀

منصة AM PRO الكاملة — Landing · Auth · Dashboard

---

## 📁 هيكل المشروع

```
am-pro-platform/
│
├── index.html          ← الصفحة الرئيسية (Landing Page)
├── auth.html           ← تسجيل الدخول / إنشاء حساب
├── dashboard.html      ← لوحة التحكم الرئيسية
│
├── css/
│   ├── landing.css     ← ستايل الصفحة الرئيسية
│   ├── auth.css        ← ستايل صفحة تسجيل الدخول
│   └── dashboard.css   ← ستايل لوحة التحكم
│
├── js/
│   ├── landing.js      ← سكريبت الصفحة الرئيسية
│   ├── auth.js         ← Supabase Auth (login + signup)
│   ├── config.js       ← ⬅️ ضع هنا مفاتيح Supabase
│   ├── init.js         ← تهيئة البلاتفورم + Sidebar
│   ├── realtime.js     ← Realtime subscriptions
│   ├── community.js    ← Community + Announcements + Events
│   ├── tasks.js        ← Tasks (Kanban + List)
│   ├── courses.js      ← Courses + Completions
│   ├── chat.js         ← Chat + DMs + Voice + Stickers
│   ├── profile-settings.js  ← Profile + Settings + Notifications
│   └── admin.js        ← Admin Panel
│
├── assets/
│   └── logo.png
│
├── database_setup.sql  ← ⬅️ SQL كامل للداتابيز (شغّله مرة واحدة)
├── .env.example        ← template للمفاتيح
└── .gitignore
```

---

## ⚙️ Setup من الصفر (3 خطوات)

### الخطوة 1 — إنشاء Supabase Project

1. روح [supabase.com](https://supabase.com) → **New Project**
2. اختر اسم + كلمة مرور + أقرب Region
3. استنى دقيقتين لحد ما يتكمّل

---

### الخطوة 2 — تشغيل الداتابيز

1. من الـ Supabase sidebar: **SQL Editor → New query**
2. افتح ملف `database_setup.sql` والصق كل المحتوى
3. اضغط **Run**

---

### الخطوة 3 — ربط المفاتيح

من **Supabase → Settings → API** انسخ:
- **Project URL**
- **anon / public key**

افتح **`js/config.js`** و **`js/auth.js`** واستبدل:

```js
// في config.js و auth.js
const sb = createClient(
  "YOUR_SUPABASE_URL",      // ← ضع الـ Project URL
  "YOUR_SUPABASE_ANON_KEY"  // ← ضع الـ anon key
);
```

---

## 🚀 رفع على GitHub

```bash
git init
git add .
git commit -m "Initial commit — AM PRO Platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/am-pro-platform.git
git push -u origin main
```

> ⚠️ تأكد إن `config.js` و `auth.js` فيهم `YOUR_SUPABASE_URL` وليس المفاتيح الحقيقية قبل الـ push!

---

## 🗺️ تدفق المستخدم

```
index.html  →  (Join Us button)  →  auth.html
                                        ↓ (login/signup)
                                   dashboard.html
```

---

## 👥 الرتب

| الرتبة | الأيقونة |
|--------|----------|
| Founder | 👑 |
| Co-Founder | 🔱 |
| Admin | 🛡️ |
| Moderator | ⚖️ |
| Senior Developer | 💻 |
| Developer | ⚡ |
| Designer | 🎨 |
| Member | ⭐ |
