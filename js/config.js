// ============================================================
// config.js — Supabase client + Role system + Utilities
// ============================================================

// ── SUPABASE ──
// ⚠️  ضع هنا بياناتك من Supabase Dashboard > Settings > API
// ⚠️  لا ترفع المفاتيح الحقيقية على GitHub — استخدم .env
const { createClient } = supabase;
const sb = createClient(
  "YOUR_SUPABASE_URL",       // مثال: https://xxxx.supabase.co
  "YOUR_SUPABASE_ANON_KEY"   // المفتاح الـ anon/public من Supabase
);

// ── RANK / ROLE SYSTEM ──
const ROLES = {
  "founder":          { label:"Founder",          stars:5, icon:"👑", gradient:"linear-gradient(135deg,#f59e0b,#d97706)", color:"#f59e0b", glow:"rgba(245,158,11,.3)" },
  "co-founder":       { label:"Co-Founder",        stars:4, icon:"🔱", gradient:"linear-gradient(135deg,#8b5cf6,#6d28d9)", color:"#8b5cf6", glow:"rgba(139,92,246,.3)" },
  "admin":            { label:"Admin",             stars:4, icon:"🛡️",  gradient:"linear-gradient(135deg,#ef4444,#b91c1c)", color:"#ef4444", glow:"rgba(239,68,68,.3)"  },
  "moderator":        { label:"Moderator",         stars:3, icon:"⚖️",  gradient:"linear-gradient(135deg,#3b82f6,#1d4ed8)", color:"#3b82f6", glow:"rgba(59,130,246,.3)"  },
  "senior_developer": { label:"Senior Developer",  stars:3, icon:"💻", gradient:"linear-gradient(135deg,#06b6d4,#0891b2)", color:"#06b6d4", glow:"rgba(6,182,212,.3)"   },
  "developer":        { label:"Developer",         stars:2, icon:"⚡", gradient:"linear-gradient(135deg,#22c55e,#16a34a)", color:"#22c55e", glow:"rgba(34,197,94,.3)"   },
  "designer":         { label:"Designer",          stars:2, icon:"🎨", gradient:"linear-gradient(135deg,#ec4899,#be185d)", color:"#ec4899", glow:"rgba(236,72,153,.3)"  },
  "member":           { label:"Member",            stars:1, icon:"⭐", gradient:"linear-gradient(135deg,#6b7280,#4b5563)", color:"#6b7280", glow:"rgba(107,114,128,.3)"  }
};

function getRoleInfo(role) { return ROLES[role] || ROLES["member"]; }

function starsHTML(n) {
  let h = "";
  for (let i = 1; i <= 5; i++)
    h += i <= n ? '<span style="color:#f59e0b">★</span>' : '<span style="color:rgba(255,255,255,.15)">★</span>';
  return h;
}

function rankBadgeHTML(role, size) {
  const r  = getRoleInfo(role);
  const fs = size === "sm" ? "10px" : "12px";
  const px = size === "sm" ? "3px 8px" : "4px 11px";
  return `<span class="rank-badge-pill" style="background:${r.gradient};font-size:${fs};padding:${px};color:#fff;box-shadow:0 2px 8px ${r.glow}">${r.icon} ${r.label} ${starsHTML(r.stars)}</span>`;
}

// ── AVATAR HELPERS ──
const AV_COLORS = ["#4f8ef7","#8b5cf6","#22c55e","#f97316","#ef4444","#06b6d4","#ec4899","#f59e0b"];
function avatarColor(name) {
  if (!name) return AV_COLORS[0];
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return AV_COLORS[h % AV_COLORS.length];
}

function avatarInnerHTML(user) {
  const color = avatarColor(user?.name);
  const init  = (user?.name || user?.username || "?")[0]?.toUpperCase() || "?";
  if (user?.avatar_url)
    return `<img src="${esc(user.avatar_url)}" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`;
  return `<span style="color:${color};font-weight:800;">${init}</span>`;
}

// ── TINY UTILITIES ──
function esc(s) {
  return String(s ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
function timeAgo(ts) {
  if (!ts) return "";
  const s = Math.floor((Date.now() - new Date(ts)) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return Math.floor(s / 60) + "m ago";
  if (s < 86400) return Math.floor(s / 3600) + "h ago";
  return Math.floor(s / 86400) + "d ago";
}
function fmtTime(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" });
}
function fmtDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString([], { month:"short", day:"numeric" });
}

// ── TOAST ──
function toast(msg, type) {
  type = type || "info";
  const icons = { success:"fa-check-circle", error:"fa-circle-xmark", info:"fa-circle-info", warning:"fa-triangle-exclamation" };
  const t = document.createElement("div");
  t.className = `toast ${type}`;
  t.innerHTML = `<i class="fa-solid ${icons[type]||icons.info}"></i> ${esc(msg)}`;
  document.getElementById("toastContainer").appendChild(t);
  setTimeout(() => { t.classList.add("out"); setTimeout(() => t.remove(), 300); }, 3200);
}

// ── MODAL HELPERS ──
function openModal(id) {
  const el = document.getElementById(id);
  if (el) { el.style.display = "flex"; requestAnimationFrame(() => el.classList.add("open")); }
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.remove("open"); setTimeout(() => { el.style.display = "none"; }, 200); }
}

// ============================================================
// GLOBAL STATE
// ============================================================
let currentUser     = null;
let allMembers      = [];
let allTasks        = [];
let allCourses      = [];
let myCompletions   = [];
let currentSection  = "community";
let currentChatMode = "community";
let currentDmUserId = null;
let currentDmUser   = null;
let replyingTo      = { community: null, dm: null };
let activeEmojiTarget   = null;
let activeStickerTarget = null;
let chatMediaTarget     = null;
let communityMessages   = [];
let dmMessages          = {};
let mediaRecorder   = null;
let audioChunks     = [];
let recTimer        = null;
let recSeconds      = 0;
let currentAudio    = null;
let voiceChatTarget = null;
let currentProfileViewId = null;
let currentStickerCat    = "Greetings";

// ============================================================
// BOOT
// ============================================================
(async function boot() {
  try {
    const { data } = await sb.auth.getSession();
    if (data?.session) await initPlatform(data.session.user.id);
    else window.location.href = "../auth/index.html";
  } catch (e) {
    console.error("[AMPRO]", e);
    toast("Failed to load. Please refresh.", "error");
  }
})();
