// ============================================================
// COMMUNITY SECTION
// ============================================================
async function renderCommunity() {
  await Promise.all([loadAnnouncements(), loadActivityFeed(), loadLeaderboardWidget(), loadEvents()]);
  updateOnlineCount();
}

async function loadAnnouncements() {
  const el = document.getElementById("announcementsList");
  if (!el) return;
  const { data } = await sb.from("announcements")
    .select("*,author:users(name)").order("pinned", { ascending: false })
    .order("created_at", { ascending: false }).limit(5);

  if (!data?.length) {
    el.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📢</div><div class="empty-state-title">No announcements yet</div></div>`;
    return;
  }
  el.innerHTML = data.map(a => `
    <div class="announcement-card ${a.type} ${a.pinned?"pinned":""}">
      ${a.pinned ? `<span style="font-size:10px;color:var(--blue);font-weight:700;letter-spacing:.5px">📌 PINNED</span>` : ""}
      <div class="announcement-title">${esc(a.title)}</div>
      <div class="announcement-body">${esc(a.body)}</div>
      <div class="announcement-meta">${esc(a.author?.name||"Admin")} · ${timeAgo(a.created_at)}</div>
    </div>`).join("");
}

async function loadActivityFeed() {
  const el = document.getElementById("activityFeed");
  if (!el) return;
  const { data } = await sb.from("activity")
    .select("*,user:users(name,avatar_url)").order("created_at", { ascending: false }).limit(10);

  if (!data?.length) { el.innerHTML = `<div class="empty-mini">No recent activity</div>`; return; }
  const icons = { task_done:"✅", course_done:"🎓", rank_up:"⬆️", joined:"👋", achievement:"🏆" };
  el.innerHTML = data.map(a => `
    <div class="activity-item">
      <div class="activity-icon" style="background:${avatarColor(a.user?.name)}22">${icons[a.type]||"📌"}</div>
      <div class="activity-text"><strong>${esc(a.user?.name||"Someone")}</strong> ${esc(a.description)}</div>
      <div class="activity-time">${timeAgo(a.created_at)}</div>
    </div>`).join("");
}

async function loadLeaderboardWidget() {
  const el = document.getElementById("leaderboardWidget");
  if (!el) return;
  const top = allMembers.slice(0, 8);
  if (!top.length) { el.innerHTML = `<div class="empty-mini">No members yet</div>`; return; }
  const cls = ["gold","silver","bronze"];
  el.innerHTML = top.map((m, i) => {
    const r = getRoleInfo(m.role), c = avatarColor(m.name);
    return `
      <div class="lb-widget-item" onclick="openMemberProfile('${esc(m.id)}')">
        <div class="lb-pos-num ${cls[i]||""}">${i<3?["🥇","🥈","🥉"][i]:"#"+(i+1)}</div>
        <div class="avatar-circle" style="background:${c}22;width:32px;height:32px;font-size:13px;border:2px solid ${r.color}55;flex-shrink:0">${avatarInnerHTML(m)}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(m.name||"—")}${m.verified?`<i class="fa-solid fa-circle-check" style="color:var(--blue);font-size:10px;margin-left:3px"></i>`:""}</div>
          <div style="font-size:11px;color:var(--text-dim)">${r.icon} ${r.label}</div>
        </div>
        <div style="font-size:11px;font-weight:700;color:var(--text-muted)">Lv ${m.level||1}</div>
      </div>`;
  }).join("");
}

async function loadEvents() {
  const el = document.getElementById("eventsList");
  if (!el) return;
  const { data } = await sb.from("events").select("*").gte("starts_at", new Date().toISOString()).order("starts_at").limit(3);
  if (!data?.length) { el.innerHTML = `<div class="empty-mini">No upcoming events</div>`; return; }
  el.innerHTML = data.map(e => {
    const d = new Date(e.starts_at);
    return `<div class="event-card">
      <div class="event-date-badge"><div class="event-date-day">${d.getDate()}</div><div class="event-date-month">${d.toLocaleString("en",{month:"short"})}</div></div>
      <div><div class="event-title">${esc(e.title)}</div><div class="event-desc">${esc(e.location||d.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}))}</div></div>
    </div>`;
  }).join("");
}

function updateOnlineCount() {
  const online = allMembers.filter(m => m.online);
  ["onlineCount","communityOnlineCount"].forEach(id => { const el=document.getElementById(id); if(el) el.textContent=online.length; });

  const el = document.getElementById("onlineList");
  if (!el) return;
  if (!online.length) { el.innerHTML=`<div class="empty-mini">No one online right now</div>`; return; }
  el.innerHTML = online.slice(0,8).map(m => {
    const c = avatarColor(m.name);
    return `<div class="online-item" onclick="openMemberProfile('${esc(m.id)}')">
      <div class="avatar-circle" style="background:${c}22;width:28px;height:28px;font-size:11px;border:2px solid ${c}55;flex-shrink:0">${avatarInnerHTML(m)}</div>
      <span style="font-size:13px;font-weight:500">${esc(m.name||"—")}</span>
      <span class="online-dot" style="margin-left:auto"></span>
    </div>`;
  }).join("");
}

// ============================================================
// MEMBERS SECTION
// ============================================================
function renderMembers() {
  document.getElementById("membersCount").textContent = allMembers.length;
  document.getElementById("membersTotal").textContent = allMembers.length;
  displayMembers(allMembers);
}

function displayMembers(list) {
  const el = document.getElementById("membersGrid");
  if (!el) return;
  if (!list.length) {
    el.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-state-icon">👥</div><div class="empty-state-title">No members found</div><div class="empty-state-desc">Try adjusting your search or filters.</div></div>`;
    return;
  }
  el.innerHTML = list.map(m => {
    const r = getRoleInfo(m.role), c = avatarColor(m.name);
    return `
      <div class="member-card" onclick="openMemberProfile('${esc(m.id)}')">
        <div class="member-card-banner">
          ${m.banner_url ? `<img class="member-card-banner-img" src="${esc(m.banner_url)}" loading="lazy"/>` : `<div class="member-card-banner-grad" style="background:linear-gradient(135deg,${r.color}33,${c}22)"></div>`}
        </div>
        <div class="member-card-body">
          <div class="member-card-avatar">
            <div class="avatar-circle" style="background:${c}22;box-shadow:0 0 0 3px ${r.color}55;width:44px;height:44px;font-size:16px;">${avatarInnerHTML(m)}</div>
          </div>
          <div class="member-name-row">
            <span class="member-name">${esc(m.name||"—")}</span>
            ${m.verified?`<i class="fa-solid fa-circle-check verify-badge-icon"></i>`:""}
          </div>
          <div class="member-username">@${esc(m.username||"—")}</div>
          ${rankBadgeHTML(m.role,"sm")}
          ${m.bio?`<div class="member-bio">${esc(m.bio)}</div>`:""}
          <div class="member-card-footer">
            <div class="status-pill">${m.online?`<span class="online-dot"></span> Online`:`<span class="offline-dot"></span> ${m.last_seen?timeAgo(m.last_seen):"Offline"}`}</div>
            <button class="msg-btn" onclick="event.stopPropagation();openChat('${esc(m.id)}')"><i class="fa-solid fa-message"></i> Message</button>
          </div>
        </div>
      </div>`;
  }).join("");
}

window.filterMembers = function() {
  const q    = (document.getElementById("membersSearch")?.value||"").toLowerCase();
  const rank = document.getElementById("rankFilter")?.value||"";
  const sort = document.getElementById("sortMembers")?.value||"level";
  let list   = allMembers.filter(m => {
    const mq = !q || (m.name||"").toLowerCase().includes(q) || (m.username||"").toLowerCase().includes(q);
    const mr = !rank || m.role === rank;
    return mq && mr;
  });
  if (sort==="name")   list.sort((a,b) => (a.name||"").localeCompare(b.name||""));
  if (sort==="online") list.sort((a,b) => (b.online?1:0)-(a.online?1:0));
  displayMembers(list);
};

// ── MEMBER PROFILE MODAL ──
window.openMemberProfile = function(uid) {
  const m = allMembers.find(x => x.id === uid);
  if (!m) return;
  currentProfileViewId = uid;
  const r = getRoleInfo(m.role), c = avatarColor(m.name);

  // Banner
  document.getElementById("pmBannerGrad").style.background = `linear-gradient(135deg,${r.color}55,${c}33)`;
  const pmBI = document.getElementById("pmBannerImg");
  if (m.banner_url) { pmBI.src = m.banner_url; pmBI.style.display = "block"; }
  else pmBI.style.display = "none";

  // Avatar
  const pmAv = document.getElementById("pmAvatar");
  pmAv.style.background  = c + "22";
  pmAv.style.boxShadow   = `0 0 0 4px ${r.color}66,0 8px 24px ${c}22`;
  pmAv.innerHTML         = avatarInnerHTML(m);

  document.getElementById("pmName").textContent = m.name || "—";
  document.getElementById("pmUsername").textContent = "@" + (m.username||"—");
  document.getElementById("pmRankBadge").innerHTML = rankBadgeHTML(m.role);
  const bioEl = document.getElementById("pmBio");
  bioEl.textContent  = m.bio || "";
  bioEl.style.display = m.bio ? "block" : "none";
  document.getElementById("pmField").textContent = m.field || "—";
  document.getElementById("pmLevel").textContent = m.level || 1;
  document.getElementById("pmVerify").style.display = m.verified ? "flex" : "none";
  document.getElementById("pmStatus").innerHTML = m.online
    ? `<span class="online-dot"></span><span style="font-size:12px;color:var(--green);margin-left:4px">Online now</span>`
    : `<span class="offline-dot"></span><span style="font-size:12px;color:var(--text-muted);margin-left:4px">Last seen ${timeAgo(m.last_seen)}</span>`;

  document.getElementById("pmMessageBtn").style.display = currentUser?.id === m.id ? "none" : "flex";
  openModal("memberProfileOverlay");
};

window.closeMemberProfile = e => { if (e.target.id==="memberProfileOverlay") closeModal("memberProfileOverlay"); };
window.closeMemberProfileBtn = () => closeModal("memberProfileOverlay");
window.openDmWithUser = function() { closeModal("memberProfileOverlay"); if (currentProfileViewId) openChat(currentProfileViewId); };
window.openChat = function(userId) {
  switchSection("chats", document.querySelector("[data-section=chats]"));
  setTimeout(() => startDm(userId), 200);
};

// ============================================================
// TASKS
