// ============================================================
// AM PRO v2 — DASHBOARD JS  (optimized)
// ============================================================

const SUPABASE_URL  = "https://tzojjwnqodcrhwjaasja.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6b2pqd25xb2Rjcmh3amFhc2phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NzA2ODAsImV4cCI6MjA5MzI0NjY4MH0.G4IGSUgjVIKTNVszU5GpxNaD0VUnSmzUXe8p7uUl418"; // ← replace

const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON);

// ── SVG ICONS (inline, no external font needed) ──────────
const IC = {
  verify: `<i class="fa-solid fa-certificate" style="color:#6366f1;font-size:14px;flex-shrink:0" title="Verified"></i>`,
  medal1: `<svg style="width:18px;height:18px;fill:#fbbf24;stroke:none" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
  medal2: `<svg style="width:16px;height:16px;fill:#94a3b8;stroke:none" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
  medal3: `<svg style="width:15px;height:15px;fill:#a2845e;stroke:none" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
  pin:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/></svg>`,
  star:   `<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1" style="width:11px;height:11px"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  send:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:11px;height:11px"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
  link:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:11px;height:11px"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
  greetSun:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`,
  greetCloud:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>`,
  greetMoon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`,
  bell:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:32px;height:32px;opacity:.4"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
  task_empty:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width:48px;height:48px"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>`,
};

// ── RANK ICON MAP (name → SVG) ────────────────────────────
// Admins can still store emoji in rank.icon — we render it as-is.
// For built-in SVG icons, check if icon matches a key name.
const RANK_SVGS = {
  sword:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" y1="19" x2="19" y2="13"/><line x1="16" y1="16" x2="20" y2="20"/><line x1="19" y1="21" x2="21" y2="19"/></svg>`,
  trophy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>`,
  gem:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px"><polygon points="6 3 18 3 22 9 12 22 2 9"/><line x1="2" y1="9" x2="22" y2="9"/><line x1="12" y1="9" x2="12" y2="22"/></svg>`,
  crown:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg>`,
  zap:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  flame:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`,
  star:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  wind:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>`,
};

function getRankIcon(iconStr) {
  if (!iconStr) return RANK_SVGS.sword;
  // If it's a known SVG name, return SVG
  if (RANK_SVGS[iconStr]) return RANK_SVGS[iconStr];
  // Otherwise render as text (emoji or whatever was stored)
  return `<span style="font-size:14px;line-height:1">${iconStr}</span>`;
}

// ── TITLE ANIMATION KEYFRAMES ─────────────────────────────
const _styles = document.createElement("style");
_styles.textContent = `
@keyframes titlePulse{0%,100%{opacity:1}50%{opacity:0.6}}
@keyframes titleShimmer{0%{filter:brightness(1)}50%{filter:brightness(1.4)}100%{filter:brightness(1)}}
@keyframes titleRainbow{0%{filter:hue-rotate(0deg)}100%{filter:hue-rotate(360deg)}}
@keyframes titleFire{from{text-shadow:0 0 8px #ff9500}to{text-shadow:0 0 20px #ff2d55,0 0 40px #ff9500}}
@keyframes titleElectric{from{opacity:1}to{opacity:0.5}}
`;
document.head.appendChild(_styles);

// ── STATE ─────────────────────────────────────────────────
let currentUser    = null;
let currentProfile = null;
let allMembers     = [];
let allRanks       = [];
let allTitles      = [];
let memberTabMode  = "lb";
let notifOpen      = false;

// ── INIT ──────────────────────────────────────────────────
(async function init() {
  const { data } = await sb.auth.getSession();
  if (!data?.session) return window.location.href = "../auth/";
  currentUser = data.session.user;

  // Parallel load — fastest possible init
  await Promise.all([loadRanks(), loadTitles()]);
  await loadProfile();
  await Promise.all([loadTasks(), loadMembers(), loadNotifications()]);
  setupPresence();
  setupRealtime();
  renderGreeting();
})();

// ── RANKS ──────────────────────────────────────────────────
async function loadRanks() {
  const { data } = await sb.from("ranks").select("*").order("min_points");
  if (data) allRanks = data;
}

function getRankForPoints(pts) {
  for (const r of [...allRanks].reverse()) {
    if (pts >= r.min_points) return r;
  }
  return allRanks[0] || { name:"Dust", color:"#8e8e93", icon:"wind", min_points:0, max_points:100 };
}

function getRankBadgeHTML(rank, small = false) {
  if (!rank) return "";
  const bg   = rank.gradient_from ? `linear-gradient(135deg,${rank.gradient_from},${rank.gradient_to})` : rank.color;
  const glow = rank.glow_color || rank.color + "66";
  const sz   = small ? "padding:4px 10px;font-size:11px;" : "padding:8px 16px;font-size:13px;";
  return `<span class="rank-badge-pro" style="background:${bg};box-shadow:0 0 16px ${glow};${sz}color:#fff">
    <span class="rank-icon">${getRankIcon(rank.icon)}</span>
    <span class="rank-name">${esc(rank.name)}</span>
  </span>`;
}

// ── TITLES ─────────────────────────────────────────────────
async function loadTitles() {
  const { data } = await sb.from("titles").select("*");
  if (data) allTitles = data;
}

function getTitleBadgeHTML(title) {
  if (!title) return "";
  const color = title.color || "#fff";
  const glow  = title.glow_color || color + "66";
  const anim  = getTitleAnimation(title.animation);
  const bg = title.gradient_from
    ? `linear-gradient(135deg,${title.gradient_from},${title.gradient_to})`
    : "rgba(255,255,255,0.08)";
  return `<span style="color:${color};text-shadow:0 0 8px ${glow};background:${bg};border:1px solid ${glow};padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;font-family:'Syne',sans-serif;${anim}">${esc(title.name)}</span>`;
}

function getTitleAnimation(anim) {
  const map = {
    pulse:    "animation:titlePulse 2s ease-in-out infinite;",
    shimmer:  "animation:titleShimmer 2s linear infinite;",
    rainbow:  "animation:titleRainbow 3s linear infinite;",
    fire:     "animation:titleFire 1.5s ease-in-out infinite alternate;",
    electric: "animation:titleElectric 0.5s linear infinite alternate;"
  };
  return map[anim] || "";
}

// ── PROFILE ────────────────────────────────────────────────
async function loadProfile() {
  const { data } = await sb.from("users")
    .select("*")
    .eq("id", currentUser.id).single();
  if (!data) return;
  currentProfile = data;

  const rank  = getRankForPoints(data.points || 0);
  const title = data.title_id ? allTitles.find(t => t.id === data.title_id) : null;

  // Sidebar avatar
  const sba = document.getElementById("sidebarAvatar");
  if (data.avatar_url) {
    sba.innerHTML = `<img src="${data.avatar_url}" alt="avatar"/>`;
  } else {
    sba.textContent = (data.name||"?")[0].toUpperCase();
    sba.style.background = avatarColor(data.name);
  }
  document.getElementById("sidebarName").textContent = data.name || data.username;

  // Welcome card
  document.getElementById("welcomeName").textContent = data.name || data.username;
  document.getElementById("rankBadge").innerHTML     = getRankBadgeHTML(rank);
  document.getElementById("titleBadge").innerHTML    = title ? getTitleBadgeHTML(title) : "";
  document.getElementById("pointsVal").textContent   = (data.points||0).toLocaleString();

  // Progress
  const pts      = data.points || 0;
  const nextRank = allRanks.find(r => r.min_points > pts);
  if (nextRank) {
    const pct = Math.min(100, ((pts - rank.min_points) / (nextRank.min_points - rank.min_points)) * 100);
    document.getElementById("progressFill").style.width = pct + "%";
    document.getElementById("progressNext").textContent = `${(nextRank.min_points - pts).toLocaleString()} pts to ${nextRank.name}`;
  } else {
    document.getElementById("progressFill").style.width = "100%";
    document.getElementById("progressNext").textContent = "Max rank reached!";
  }
}

// ── TASKS ──────────────────────────────────────────────────
async function loadTasks() {
  const { data } = await sb.from("tasks").select("*")
    .eq("user_id", currentUser.id).order("created_at", {ascending:false});
  const list = document.getElementById("taskList");
  const cnt  = document.getElementById("taskCount");
  if (!data?.length) {
    list.innerHTML = `<div class="empty-state"><div class="empty-icon">${IC.task_empty}</div><div class="empty-text">No tasks assigned yet</div></div>`;
    cnt.textContent = "0 TASKS";
    return;
  }
  cnt.textContent = `${data.length} TASK${data.length !== 1 ? "S" : ""}`;
  list.innerHTML = data.map(t => `
    <div class="task-card">
      <div class="task-icon-wrap">${IC.pin}</div>
      <div class="task-body">
        <div class="task-title">${esc(t.title)}</div>
        <div class="task-desc">${esc(t.body||"")}</div>
        <div class="task-footer">
          <span class="task-pts">${IC.star} ${t.points||0} pts</span>
          <span class="task-status ${t.status}">${t.status}</span>
          ${t.link ? `<a href="${esc(t.link)}" target="_blank" rel="noopener" style="font-size:11px;color:var(--accent2);display:inline-flex;align-items:center;gap:3px">${IC.link} View Link</a>` : ""}
          ${t.status === "pending" ? `<button class="btn-submit" onclick="submitTask('${t.id}')">${IC.send} Submit</button>` : ""}
        </div>
      </div>
    </div>
  `).join("");
}

async function submitTask(taskId) {
  const { error } = await sb.from("task_submissions").insert({ task_id:taskId, user_id:currentUser.id });
  if (error) { showToast("Error submitting task","error"); return; }
  await sb.from("tasks").update({ status:"submitted" }).eq("id", taskId);
  showToast("Task submitted for review!");
  loadTasks();
}

// ── MEMBERS ────────────────────────────────────────────────
async function loadMembers() {
  const { data } = await sb.from("users").select("*").order("points",{ascending:false});
  if (!data) return;
  allMembers = data;
  document.getElementById("memberCount").textContent = `${data.length} MEMBERS`;
  renderMemberLb();
  renderMemberGrid();
}

function renderMemberLb() {
  const list = document.getElementById("memberLb");
  if (!allMembers.length) {
    list.innerHTML = `<div class="empty-state"><div class="empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width:48px;height:48px"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div><div class="empty-text">No members yet</div></div>`;
    return;
  }
  list.innerHTML = allMembers.map((m, i) => {
    const rank = getRankForPoints(m.points||0);
    const bg   = rank.gradient_from ? `linear-gradient(135deg,${rank.gradient_from},${rank.gradient_to})` : rank.color||"#333";
    const glow = rank.glow_color || rank.color + "66";
    let posEl;
    if (i === 0) posEl = `<span class="lb-pos p1">${IC.medal1}</span>`;
    else if (i === 1) posEl = `<span class="lb-pos p2">${IC.medal2}</span>`;
    else if (i === 2) posEl = `<span class="lb-pos p3">${IC.medal3}</span>`;
    else posEl = `<span class="lb-pos pn">#${i+1}</span>`;
    const avatarBg = m.avatar_url ? "" : `background:${avatarColor(m.name)};`;
    const avatarContent = m.avatar_url ? `<img src="${m.avatar_url}" alt="" loading="lazy"/>` : (m.name||"?")[0].toUpperCase();
    return `<div class="lb-row" onclick="openMemberModal('${m.id}')">
      ${posEl}
      <div class="lb-avatar" style="${avatarBg}">${avatarContent}</div>
      <div class="lb-info">
        <div class="lb-name">${esc(m.name||m.username)}${m.verified ? IC.verify : ""}</div>
        <div class="lb-sub">${esc(m.field||"")} · ${esc(m.username||"")}</div>
      </div>
      <span class="rank-badge-pro" style="background:${bg};box-shadow:0 0 10px ${glow};padding:4px 10px;font-size:11px;color:#fff">
        ${getRankIcon(rank.icon)} ${esc(rank.name)}
      </span>
      <span class="lb-pts">${(m.points||0).toLocaleString()}</span>
    </div>`;
  }).join("");
}

function renderMemberGrid() {
  const grid = document.getElementById("memberGrid");
  grid.innerHTML = allMembers.map(m => {
    const rank = getRankForPoints(m.points||0);
    const bg   = rank.gradient_from ? `linear-gradient(135deg,${rank.gradient_from},${rank.gradient_to})` : rank.color;
    const glow = rank.glow_color || rank.color + "66";
    const avatarBg = m.avatar_url ? "" : `background:${avatarColor(m.name)};`;
    const avatarContent = m.avatar_url ? `<img src="${m.avatar_url}" alt="" loading="lazy"/>` : (m.name||"?")[0].toUpperCase();
    return `<div class="pcard" onclick="openMemberModal('${m.id}')">
      <div class="pcard-avatar" style="${avatarBg}">${avatarContent}</div>
      <div class="pcard-name">${esc(m.name||m.username)}${m.verified ? IC.verify : ""}</div>
      <div class="pcard-field">${esc(m.field||"")}</div>
      <span class="rank-badge-pro" style="background:${bg};padding:3px 10px;font-size:10px;box-shadow:0 0 10px ${glow};color:#fff">
        ${getRankIcon(rank.icon)} ${esc(rank.name)}
      </span>
    </div>`;
  }).join("") || "";
}

function switchMemberTab(mode, el) {
  memberTabMode = mode;
  document.querySelectorAll(".mtab").forEach(t => t.classList.remove("active"));
  el.classList.add("active");
  document.getElementById("memberLb").classList.toggle("hidden", mode !== "lb");
  document.getElementById("memberGrid").classList.toggle("hidden", mode !== "grid");
}

// ── MEMBER MODAL ───────────────────────────────────────────
async function openMemberModal(userId) {
  window._mmUserId = userId;
  const member = allMembers.find(m => m.id === userId);
  if (!member) return;

  const rank  = getRankForPoints(member.points||0);
  const title = member.title_id ? allTitles.find(t => t.id === member.title_id) : null;

  const bg = rank.gradient_from
    ? `linear-gradient(135deg,${rank.gradient_from}44,${rank.gradient_to}22)`
    : rank.color + "22";
  document.getElementById("mmBanner").style.background = bg;

  const mmAv = document.getElementById("mmAvatar");
  if (member.avatar_url) {
    mmAv.innerHTML = `<img src="${member.avatar_url}" alt="avatar"/>`;
    mmAv.style.background = "transparent";
  } else {
    mmAv.textContent = (member.name||"?")[0].toUpperCase();
    mmAv.style.background = avatarColor(member.name);
  }

  document.getElementById("mmName").textContent     = member.name || member.username;
  document.getElementById("mmUsername").textContent = "@" + (member.username||"");
  document.getElementById("mmTitle").innerHTML      = title ? getTitleBadgeHTML(title) : "";
  document.getElementById("mmBio").textContent      = member.bio || "No bio yet.";
  document.getElementById("mmPoints").textContent   = (member.points||0).toLocaleString();
  document.getElementById("mmRank").textContent     = rank.name;

  const { count } = await sb.from("tasks").select("id",{count:"exact",head:true}).eq("user_id",userId);
  document.getElementById("mmTasks").textContent = count||0;

  document.getElementById("memberModal").classList.remove("hidden");
}

function closeMemberModal(e) {
  if (e.target === document.getElementById("memberModal"))
    document.getElementById("memberModal").classList.add("hidden");
}

function openChatWith(userId) {
  document.getElementById("memberModal").classList.add("hidden");
  showPage("chat", document.getElementById("nav-chat"));
  if (typeof window.openPrivateChat === "function") window.openPrivateChat(userId);
}

// ── NOTIFICATIONS ──────────────────────────────────────────
async function loadNotifications() {
  const { data } = await sb.from("notifications")
    .select("*").eq("user_id", currentUser.id)
    .order("created_at",{ascending:false}).limit(30);

  const unread = (data||[]).filter(n => !n.read).length;
  const badge  = document.getElementById("notifBadge");
  if (unread > 0) { badge.textContent = unread; badge.classList.remove("hidden"); }
  else badge.classList.add("hidden");

  const list = document.getElementById("notifList");
  if (!data?.length) {
    list.innerHTML = `<div class="empty-state" style="padding:24px"><div class="empty-icon" style="justify-content:center">${IC.bell}</div><div class="empty-text">No notifications</div></div>`;
    return;
  }
  list.innerHTML = data.map(n => `
    <div class="notif-item ${n.read?'':'unread'}" onclick="readNotif('${n.id}')">
      <div class="notif-title">${esc(n.title)}</div>
      <div class="notif-body">${esc(n.body)}</div>
      <div class="notif-time">${timeAgo(n.created_at)}</div>
    </div>
  `).join("");
}

async function readNotif(id) {
  await sb.from("notifications").update({read:true}).eq("id",id);
  loadNotifications();
}

async function markAllRead() {
  await sb.from("notifications").update({read:true}).eq("user_id",currentUser.id);
  loadNotifications();
}

function toggleNotifications() {
  const panel = document.getElementById("notifPanel");
  notifOpen = !notifOpen;
  panel.classList.toggle("hidden", !notifOpen);
  if (notifOpen) loadNotifications();
}

document.addEventListener("click", e => {
  if (notifOpen && !e.target.closest("#notifPanel") && !e.target.closest(".icon-btn"))
    { notifOpen = false; document.getElementById("notifPanel").classList.add("hidden"); }
});

// ── PRESENCE ───────────────────────────────────────────────
function setupPresence() {
  sb.from("users").update({online:true,last_seen:new Date().toISOString()}).eq("id",currentUser.id);
  window.addEventListener("beforeunload", () => {
    sb.from("users").update({online:false,last_seen:new Date().toISOString()}).eq("id",currentUser.id);
  });
  // Heartbeat every 30s
  setInterval(() => {
    sb.from("users").update({online:true,last_seen:new Date().toISOString()}).eq("id",currentUser.id);
  }, 30000);
}

// ── REALTIME ───────────────────────────────────────────────
function setupRealtime() {
  sb.channel("notifications-ch")
    .on("postgres_changes",{event:"INSERT",schema:"public",table:"notifications",filter:`user_id=eq.${currentUser.id}`},
      payload => { loadNotifications(); showToast(payload.new.title); })
    .subscribe();

  sb.channel("tasks-ch")
    .on("postgres_changes",{event:"*",schema:"public",table:"tasks",filter:`user_id=eq.${currentUser.id}`},
      () => loadTasks())
    .subscribe();
}

// ── PAGE ROUTING ───────────────────────────────────────────
const pageTitles = {
  dashboard:"Dashboard", members:"Team Members",
  chat:"Messages", profile:"My Profile", settings:"Settings"
};

function showPage(name, el) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".nav-item,.mobile-nav-item").forEach(n => n.classList.remove("active"));
  document.getElementById("page-"+name)?.classList.add("active");
  if (el) el.classList.add("active");
  document.getElementById("topbarTitle").textContent = pageTitles[name] || name;
  if (name === "profile")  renderProfile();
  if (name === "settings") renderSettings();
  if (name === "chat")     initChat();
}

// ── GREETING ───────────────────────────────────────────────
function renderGreeting() {
  const h = new Date().getHours();
  const el = document.getElementById("greeting");
  if (h < 12) {
    el.innerHTML = `${IC.greetSun} Good morning`;
  } else if (h < 17) {
    el.innerHTML = `${IC.greetCloud} Good afternoon`;
  } else {
    el.innerHTML = `${IC.greetMoon} Good evening`;
  }
}

// ── UTILS ──────────────────────────────────────────────────
function avatarColor(name) {
  const pool = ["#6366f1","#a78bfa","#22c55e","#f97316","#ef4444","#06b6d4","#fbbf24","#ec4899"];
  let h = 0;
  for (const c of (name||"?")) h = (h*31+c.charCodeAt(0))&0xffff;
  return pool[h%pool.length];
}

function esc(s) {
  return String(s??"")
    .replace(/&/g,"&amp;").replace(/</g,"&lt;")
    .replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

function timeAgo(iso) {
  const sec = Math.floor((Date.now()-new Date(iso))/1000);
  if(sec<60)return "just now";
  if(sec<3600)return Math.floor(sec/60)+"m ago";
  if(sec<86400)return Math.floor(sec/3600)+"h ago";
  return Math.floor(sec/86400)+"d ago";
}

let _tid;
function showToast(msg, type = "success") {
  const el = document.getElementById("toast");
  document.getElementById("toastText").textContent = msg;
  el.classList.remove("show","success","error");
  void el.offsetWidth;
  el.classList.add("show", type);
  clearTimeout(_tid);
  _tid = setTimeout(() => el.classList.remove("show"), 3500);
}
