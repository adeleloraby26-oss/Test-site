// ====================================================
// SUPABASE INIT
// ====================================================
const { createClient } = supabase;
const sb = createClient(
  "https://tzojjwnqodcrhwjaasja.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6b2pqd25xb2Rjcmh3amFhc2phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NzA2ODAsImV4cCI6MjA5MzI0NjY4MH0.G4IGSUgjVIKTNVszU5GpxNaD0VUnSmzUXe8p7uUl418"
);

// ====================================================
// RANKS
// ====================================================
const RANKS = [
  { name:"Dust",        max:5,      color:"#8e8e93" },
  { name:"Stone",       max:6,      color:"#636366" },
  { name:"Iron",        max:6,      color:"#aeaeb2" },
  { name:"Bronze",      max:7,      color:"#a2845e" },
  { name:"Silver",      max:7,      color:"#cfd3d6" },
  { name:"Gold",        max:7,      color:"#ffcc00" },
  { name:"Platinum",    max:8,      color:"#e5e5ea" },
  { name:"Diamond",     max:8,      color:"#007aff" },
  { name:"Emerald",     max:9,      color:"#34c759" },
  { name:"Sapphire",    max:9,      color:"#5856d6" },
  { name:"Obsidian",    max:10,     color:"#3a3a3c" },
  { name:"Mythic",      max:10,     color:"#ff2d55" },
  { name:"Legend",      max:10,     color:"#af52de" },
  { name:"Master",      max:12,     color:"#5ac8fa" },
  { name:"Grandmaster", max:15,     color:"#ff9500" },
  { name:"Imperial",    max:20,     color:"#ffd60a" },
  { name:"Royal",       max:20,     color:"#bf5af2" },
  { name:"Founder",     max:999999, color:"#64d2ff" }
];

function getRank(level) {
  let sum = 0;
  for (const r of RANKS) {
    if (level <= sum + r.max) return { ...r, sub: level - sum };
    sum += r.max;
  }
  return { ...RANKS[RANKS.length - 1], sub: 1 };
}

function avatarColor(name) {
  const pool = ["#007aff","#30d158","#ff9500","#ff2d55","#5856d6","#64d2ff","#af52de","#ffd60a"];
  let h = 0;
  for (const c of (name || "?")) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return pool[h % pool.length];
}

function badgeTxtColor(hex) {
  const light = ["#ffcc00","#e5e5ea","#cfd3d6","#aeaeb2","#ffd60a","#64d2ff","#5ac8fa","#30d158","#34c759"];
  return light.includes(hex) ? "#000" : "#fff";
}

function esc(s) {
  return String(s ?? "")
    .replace(/&/g,"&amp;").replace(/</g,"&lt;")
    .replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

// ====================================================
// STATE
// ====================================================
let allMembers   = [];
let memberTaskMap = {};
let currentMemberTab = 'leaderboard';

// ====================================================
// LOGOUT
// ====================================================
document.addEventListener("DOMContentLoaded", function() {
  var btn = document.getElementById("logoutBtn");
  if (btn) {
    btn.addEventListener("click", async function() {
      await sb.auth.signOut();
      window.location.href = "../auth/index.html";
    });
  }
});

// ====================================================
// SESSION CHECK
// ====================================================
(async function() {
  try {
    const { data, error } = await sb.auth.getSession();
    if (error) console.error("[AM-PRO] getSession error:", error);

    if (data && data.session) {
      await initDashboard(data.session.user.id);
    } else {
      const c = document.querySelector(".container");
      if (c) c.innerHTML = `
        <div class="empty-state">
          <h3>Session Expired</h3>
          <p>Please sign in to continue.</p><br>
          <a href="../auth/index.html" class="btn-logout"
             style="background:var(--apple-blue);color:#fff;border:none;
                    padding:10px 24px;text-decoration:none;border-radius:10px;display:inline-block">
            Sign In
          </a>
        </div>`;
    }
  } catch(e) {
    console.error("[AM-PRO] session error:", e);
  }
})();

// ====================================================
// INIT DASHBOARD
// ====================================================
async function initDashboard(uid) {
  // Load current user + all members + user's tasks in parallel
  const [
    { data: me },
    { data: members },
    { data: tasks }
  ] = await Promise.all([
    sb.from("users").select("*").eq("id", uid).single(),
    sb.from("users").select("*").order("level", { ascending: false }),
    sb.from("tasks").select("*").eq("user_id", uid)
  ]);

  // ── My profile ──
  if (me) {
    const rank = getRank(me.level || 1);
    const color = rank.color;
    const tc    = badgeTxtColor(color);

    document.getElementById("userName").innerText    = me.username || me.name || "AM PRO Member";
    document.getElementById("greetingText").innerText = "Welcome back, " + (me.name || me.username || "");

    const rd = document.getElementById("userRankDisplay");
    rd.innerText       = rank.name + " · Level " + (me.level||1) + " · Sub-" + rank.sub;
    rd.style.background = color;
    rd.style.color      = tc;
  }

  // ── My tasks ──
  renderTasks(tasks || []);

  // ── All members ──
  allMembers = members || [];
  document.getElementById("memberCount").textContent = allMembers.length + " MEMBERS";
  renderLeaderboard(allMembers);

  // ── Real-time tasks ──
  sb.channel("tasks-rt-" + uid)
    .on("postgres_changes",
        { event:"*", schema:"public", table:"tasks", filter:"user_id=eq." + uid },
        async () => {
          const { data: updated } = await sb.from("tasks").select("*").eq("user_id", uid);
          renderTasks(updated || []);
        })
    .subscribe();
}

// ====================================================
// RENDER MY TASKS
// ====================================================
function renderTasks(tasks) {
  const list    = document.getElementById("tasksList");
  const countEl = document.getElementById("taskCount");
  if (!list) return;

  if (!tasks || !tasks.length) {
    list.innerHTML = `<div class="empty-state">No tasks right now. Enjoy your day! ✨</div>`;
    if (countEl) countEl.innerText = "0 TASKS";
    return;
  }

  const pending = tasks.filter(t => !t.done).length;
  if (countEl) countEl.innerText = pending + " / " + tasks.length + " TASKS";

  list.innerHTML = tasks.map(t => `
    <div class="task-card${t.done ? " done" : ""}" id="tc-${t.id}">
      <button class="task-icon" onclick="toggleDone('${t.id}', ${t.done})" title="${t.done ? "Mark as pending" : "Mark as done"}">
        <svg viewBox="0 0 14 14"><polyline points="2,7 5.5,10.5 12,3"/></svg>
      </button>
      <div class="task-content">
        <h4>${esc(t.text || "New Task")}</h4>
        <p>${t.done ? "Completed ✓" : "Official task from team management"}</p>
      </div>
    </div>`).join("");
}

// ====================================================
// TOGGLE TASK DONE
// ====================================================
window.toggleDone = async function(taskId, currentDone) {
  const newDone = !currentDone;
  const card    = document.getElementById("tc-" + taskId);
  if (!card) return;

  // Optimistic UI
  if (newDone) {
    card.classList.add("done");
    card.querySelector(".task-content p").textContent = "Completed ✓";
  } else {
    card.classList.remove("done");
    card.querySelector(".task-content p").textContent = "Official task from team management";
  }

  const { error } = await sb.from("tasks").update({ done: newDone }).eq("id", taskId);
  if (error) {
    if (newDone) card.classList.remove("done"); else card.classList.add("done");
    console.error("[AM-PRO] toggleDone error:", error);
  }
};

// ====================================================
// RENDER LEADERBOARD
// ====================================================
function renderLeaderboard(list) {
  const el = document.getElementById("panel-leaderboard");
  if (!el) return;

  if (!list.length) {
    el.innerHTML = `<div class="empty-state">No members yet.</div>`;
    return;
  }

  el.innerHTML = list.map((m, i) => {
    const level = m.level || 1;
    const rank  = getRank(level);
    const color = avatarColor(m.name);
    const init  = (m.name || m.username || "?")[0].toUpperCase();
    const pos   = i + 1;
    const posClass = pos === 1 ? "gold" : pos === 2 ? "silver" : pos === 3 ? "bronze" : "";
    const medal    = pos === 1 ? "🥇" : pos === 2 ? "🥈" : pos === 3 ? "🥉" : `#${pos}`;
    const tc       = badgeTxtColor(rank.color);

    const avatarInner = m.avatar_url
      ? `<img src="${esc(m.avatar_url)}" alt="${esc(m.name)}">`
      : `<span style="color:${color}">${init}</span>`;

    return `<div class="lb-row" onclick="openProfile('${esc(m.id)}')">
      <div class="lb-pos ${posClass}">${medal}</div>
      <div class="lb-avatar" style="background:${color}18;box-shadow:0 0 0 2px ${rank.color}55">
        ${avatarInner}
      </div>
      <div class="lb-info">
        <div class="lb-name">${esc(m.name || "—")}</div>
        <div class="lb-sub">@${esc(m.username || "—")} · ${esc(m.field || "—")}</div>
      </div>
      <span class="lb-rank-badge" style="background:${rank.color};color:${tc}">${rank.name}</span>
      <div class="lb-level">Lv ${level}</div>
    </div>`;
  }).join("");
}

// ====================================================
// RENDER PROFILES GRID
// ====================================================
function renderProfilesGrid(list) {
  const el = document.getElementById("panel-profiles");
  if (!el) return;

  if (!list.length) {
    el.innerHTML = `<div class="empty-state" style="grid-column:1/-1">No members yet.</div>`;
    return;
  }

  el.innerHTML = list.map((m, i) => {
    const level = m.level || 1;
    const rank  = getRank(level);
    const color = avatarColor(m.name);
    const init  = (m.name || m.username || "?")[0].toUpperCase();
    const pos   = i + 1;
    const tc    = badgeTxtColor(rank.color);

    const avatarInner = m.avatar_url
      ? `<img src="${esc(m.avatar_url)}" alt="${esc(m.name)}">`
      : `<span style="color:${color};font-size:22px;font-weight:800">${init}</span>`;

    return `<div class="pcard" onclick="openProfile('${esc(m.id)}')" style="border-color:${rank.color}22">
      <div class="pcard-avatar" style="background:${color}18;box-shadow:0 0 0 2.5px ${rank.color}66,0 6px 18px ${color}18">
        ${avatarInner}
      </div>
      <div class="pcard-name">${esc(m.name || "—")}</div>
      <div class="pcard-user">@${esc(m.username || "—")}</div>
      <span class="pcard-rank" style="background:${rank.color};color:${tc}">${rank.name}</span>
      <div class="pcard-pos">
        ${pos === 1 ? "🥇" : pos === 2 ? "🥈" : pos === 3 ? "🥉" : "#" + pos}
        · Lv ${level}
      </div>
    </div>`;
  }).join("");
}

// ====================================================
// SWITCH MEMBER TAB
// ====================================================
window.switchMemberTab = function(tab, btn) {
  currentMemberTab = tab;
  document.querySelectorAll(".stab").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");

  const lb = document.getElementById("panel-leaderboard");
  const pg = document.getElementById("panel-profiles");

  if (tab === "leaderboard") {
    lb.style.display = "flex";
    pg.style.display = "none";
    renderLeaderboard(allMembers);
  } else {
    lb.style.display = "none";
    pg.style.display = "grid";
    renderProfilesGrid(allMembers);
  }
};

// ====================================================
// OPEN PROFILE MODAL
// ====================================================
window.openProfile = async function(uid) {
  const m = allMembers.find(x => x.id === uid);
  if (!m) return;

  const level = m.level || 1;
  const rank  = getRank(level);
  const color = avatarColor(m.name);
  const init  = (m.name || m.username || "?")[0].toUpperCase();
  const tc    = badgeTxtColor(rank.color);

  // Avatar
  const pmAv = document.getElementById("pmAvatar");
  pmAv.style.background = color + "18";
  pmAv.style.boxShadow  = `0 0 0 3px ${rank.color}66, 0 10px 30px ${color}22`;
  if (m.avatar_url) {
    pmAv.innerHTML = `<img src="${esc(m.avatar_url)}" alt="${esc(m.name)}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;
  } else {
    pmAv.innerHTML = `<span style="color:${color};font-size:32px;font-weight:900">${init}</span>`;
  }

  document.getElementById("pmName").textContent = m.name || "—";
  document.getElementById("pmUser").textContent = "@" + (m.username || "—");
  document.getElementById("pmLevel").textContent = level;
  document.getElementById("pmField").textContent = m.field || "—";

  const pmRank = document.getElementById("pmRank");
  pmRank.textContent   = rank.name + " · Sub-" + rank.sub;
  pmRank.style.background = rank.color;
  pmRank.style.color      = tc;

  // Load this member's tasks
  document.getElementById("pmTasks").textContent = "...";
  document.getElementById("pmTasksWrap").style.display = "none";

  document.getElementById("profileOverlay").classList.remove("hidden");

  const { data: tasks } = await sb
    .from("tasks").select("*").eq("user_id", uid).order("created_at");

  const tList = tasks || [];
  document.getElementById("pmTasks").textContent = tList.length;

  if (tList.length) {
    document.getElementById("pmTasksWrap").style.display = "block";
    document.getElementById("pmTasksList").innerHTML = tList.map(t =>
      `<div class="pm-task-item">${esc(t.text)}</div>`
    ).join("");
  }
};

window.closePM = function(e) {
  if (e.target.id === "profileOverlay")
    document.getElementById("profileOverlay").classList.add("hidden");
};

window.closePMbtn = function() {
  document.getElementById("profileOverlay").classList.add("hidden");
};
