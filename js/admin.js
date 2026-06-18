// ============================================================
window.openSearch = function() {
  openModal("searchOverlay");
  setTimeout(() => document.getElementById("globalSearchInput")?.focus(), 100);
};
window.closeSearch = e => { if(e.target.id==="searchOverlay") closeModal("searchOverlay"); };

document.addEventListener("keydown", e => {
  if (e.key==="Escape") {
    closeModal("searchOverlay"); closeModal("memberProfileOverlay");
    closeModal("taskModalOverlay"); closeModal("courseModalOverlay");
    closeModal("announcementModalOverlay"); closeModal("passwordModalOverlay");
    closeModal("deleteModalOverlay");
    document.getElementById("notificationsDrawer").style.display="none";
  }
  if ((e.metaKey||e.ctrlKey) && e.key==="k") { e.preventDefault(); openSearch(); }
});

window.globalSearch = function() {
  const q   = document.getElementById("globalSearchInput").value.trim().toLowerCase();
  const el  = document.getElementById("searchResults");
  if (!q) { el.innerHTML=`<div class="search-hint">Start typing to search…</div>`; return; }

  const results = [];

  allMembers.filter(m => (m.name||"").toLowerCase().includes(q)||(m.username||"").toLowerCase().includes(q)).slice(0,4).forEach(m => {
    results.push({ type:"Member", icon:"👤", color:"rgba(79,142,247,.15)", title:m.name||"—", sub:"@"+(m.username||"—"), action:`openMemberProfile('${m.id}')` });
  });

  allTasks.filter(t => (t.title||"").toLowerCase().includes(q)).slice(0,3).forEach(t => {
    results.push({ type:"Task", icon:"✅", color:"rgba(34,197,94,.15)", title:t.title||"Task", sub:t.status, action:`openTaskModal('${t.id}')` });
  });

  allCourses.filter(c => (c.title||"").toLowerCase().includes(q)).slice(0,3).forEach(c => {
    results.push({ type:"Course", icon:"🎓", color:"rgba(139,92,246,.15)", title:c.title, sub:c.category||"general", action:`switchSection('courses',document.querySelector('[data-section=courses]'))` });
  });

  if (!results.length) { el.innerHTML=`<div class="empty-state" style="padding:24px"><div class="empty-state-icon">🔍</div><div class="empty-state-title">No results for "${esc(q)}"</div></div>`; return; }

  el.innerHTML = results.map(r => `
    <div class="search-result-item" onclick="${r.action};closeModal('searchOverlay')">
      <div class="search-result-icon" style="background:${r.color}">${r.icon}</div>
      <div><div class="search-result-title">${esc(r.title)}</div><div class="search-result-sub">${esc(r.sub)}</div></div>
      <span class="search-result-type">${r.type}</span>
    </div>`).join("");
};

// ============================================================
// ADMIN PANEL
// ============================================================
function renderAdminPanel() {
  const tab = document.querySelector(".admin-tab.active");
  const activeTab = tab ? tab.textContent.toLowerCase() : "members";
  switchAdminTab(activeTab, tab||document.querySelector(".admin-tab"));
}

window.switchAdminTab = function(tab, btn) {
  document.querySelectorAll(".admin-tab").forEach(b => b.classList.remove("active")); if(btn) btn.classList.add("active");
  document.querySelectorAll(".admin-panel").forEach(p => p.style.display="none");
  const panelMap = { members:"adminPanel-members", tasks:"adminPanel-tasks", courses:"adminPanel-courses", deletions:"adminPanel-deletions", announcements:"adminPanel-announcements" };
  const panel = document.getElementById(panelMap[tab]);
  if (panel) panel.style.display="block";
  if (tab==="members")       renderAdminMembers();
  if (tab==="tasks")         renderAdminTasks();
  if (tab==="courses")       renderAdminCourses();
  if (tab==="deletions")     renderAdminDeletions();
  if (tab==="announcements") renderAdminAnnouncements();
};

function renderAdminMembers() {
  const el = document.getElementById("adminMembersList");
  if (!el) return;
  el.innerHTML = allMembers.map(m => {
    const r = getRoleInfo(m.role);
    return `<div class="admin-list-item">
      <div class="avatar-circle" style="background:${avatarColor(m.name)}22;width:36px;height:36px;font-size:14px">${avatarInnerHTML(m)}</div>
      <div class="admin-item-info">
        <div class="admin-item-name">${esc(m.name||"—")} ${m.verified?`<i class="fa-solid fa-circle-check" style="color:var(--blue);font-size:12px"></i>`:""}</div>
        <div class="admin-item-meta">@${esc(m.username||"—")} · ${r.icon} ${r.label} · Lv ${m.level||1} · <span style="color:${m.online?"var(--green)":"var(--text-muted)"}">${m.online?"Online":"Offline"}</span></div>
      </div>
      <div class="admin-item-actions">
        <button class="btn-secondary sm" onclick="adminChangeRole('${esc(m.id)}','${esc(m.role)}','${esc(m.name||"")}')"><i class="fa-solid fa-user-shield"></i></button>
        ${m.verified?`<button class="btn-secondary sm" onclick="adminToggleVerify('${esc(m.id)}',true)" title="Remove verify"><i class="fa-solid fa-circle-check" style="color:var(--blue)"></i></button>`:`<button class="btn-secondary sm" onclick="adminToggleVerify('${esc(m.id)}',false)" title="Verify"><i class="fa-regular fa-circle-check"></i></button>`}
        <button class="btn-danger sm" onclick="adminSuspend('${esc(m.id)}','${esc(m.name||"")}')"><i class="fa-solid fa-ban"></i></button>
      </div>
    </div>`;
  }).join("")||`<div class="empty-state"><div class="empty-state-title">No members</div></div>`;
}

function renderAdminTasks() {
  const el = document.getElementById("adminTasksList");
  if (!el) return;
  el.innerHTML = allTasks.map(t => {
    const assignee = allMembers.find(m=>m.id===t.user_id);
    return `<div class="admin-list-item">
      <div class="admin-item-info">
        <div class="admin-item-name">${esc(t.title||"Task")}</div>
        <div class="admin-item-meta"><span class="priority-badge ${t.priority||"medium"} sm">${t.priority||"medium"}</span> · ${esc(t.status)} · ${assignee?esc(assignee.name||"—"):"Unassigned"} · ${t.due_date?fmtDate(t.due_date):"No due date"}</div>
      </div>
      <div class="admin-item-actions">
        <button class="btn-secondary sm" onclick="openTaskModal('${esc(t.id)}')"><i class="fa-solid fa-pen"></i></button>
        <button class="btn-danger sm" onclick="deleteTask('${esc(t.id)}')"><i class="fa-solid fa-trash"></i></button>
      </div>
    </div>`;
  }).join("")||`<div class="empty-state"><div class="empty-state-title">No tasks</div></div>`;
}

function renderAdminCourses() {
  const el = document.getElementById("adminCoursesList");
  if (!el) return;
  el.innerHTML = allCourses.map(c => `
    <div class="admin-list-item">
      <div class="admin-item-info">
        <div class="admin-item-name">${esc(c.title)}</div>
        <div class="admin-item-meta">${esc(c.category||"general")} · ${c.link?`<a href="${esc(c.link)}" target="_blank" style="color:var(--blue)">Open Link</a>`:"No link"}</div>
      </div>
      <div class="admin-item-actions">
        <button class="btn-secondary sm" onclick="openCourseModal('${esc(c.id)}')"><i class="fa-solid fa-pen"></i></button>
        <button class="btn-danger sm" onclick="deleteCourse('${esc(c.id)}')"><i class="fa-solid fa-trash"></i></button>
      </div>
    </div>`).join("")||`<div class="empty-state"><div class="empty-state-title">No courses</div></div>`;
}

async function renderAdminDeletions() {
  const el = document.getElementById("adminDeletionsList");
  if (!el) return;
  const { data } = await sb.from("deletion_requests").select("*,user:users(name,username,email)").order("created_at",{ascending:false});
  if (!data?.length) { el.innerHTML=`<div class="empty-state"><div class="empty-state-title">No deletion requests</div></div>`; return; }
  const cfg = { pending:"⏳", approved:"✅", rejected:"❌", suspended:"⚠️" };
  el.innerHTML = data.map(r => `
    <div class="admin-list-item">
      <div class="admin-item-info">
        <div class="admin-item-name">${esc(r.user?.name||"—")} — ${cfg[r.status]||""} <strong>${r.status}</strong></div>
        <div class="admin-item-meta">@${esc(r.user?.username||"—")} · ${r.reason?esc(r.reason):"No reason"} · ${timeAgo(r.created_at)}</div>
      </div>
      ${r.status==="pending"?`<div class="admin-item-actions">
        <button class="btn-primary sm" onclick="reviewDeletion('${esc(r.id)}','approved')">Approve</button>
        <button class="btn-danger sm" onclick="reviewDeletion('${esc(r.id)}','rejected')">Reject</button>
        <button class="btn-secondary sm" onclick="reviewDeletion('${esc(r.id)}','suspended')">Suspend</button>
      </div>`:""}
    </div>`).join("");
}

async function renderAdminAnnouncements() {
  const el = document.getElementById("adminAnnouncementsList");
  if (!el) return;
  const { data } = await sb.from("announcements").select("*,author:users(name)").order("created_at",{ascending:false});
  if (!data?.length) { el.innerHTML=`<div class="empty-state"><div class="empty-state-title">No announcements</div></div>`; return; }
  el.innerHTML = data.map(a => `
    <div class="admin-list-item">
      <div class="admin-item-info">
        <div class="admin-item-name">${a.pinned?"📌 ":""}${esc(a.title)}</div>
        <div class="admin-item-meta">${a.type} · ${esc(a.author?.name||"—")} · ${timeAgo(a.created_at)}</div>
      </div>
      <div class="admin-item-actions">
        <button class="btn-danger sm" onclick="deleteAnnouncement('${esc(a.id)}')"><i class="fa-solid fa-trash"></i></button>
      </div>
    </div>`).join("");
}

window.adminChangeRole = async function(userId, currentRole, name) {
  const roles = Object.keys(ROLES);
  const newRole = prompt(`Change role for ${name}.\nCurrent: ${currentRole}\n\nAvailable roles:\n${roles.join(", ")}\n\nEnter new role:`);
  if (!newRole||!ROLES[newRole]) { toast("Invalid role","error"); return; }
  const { error } = await sb.from("users").update({ role:newRole }).eq("id",userId);
  if (error) { toast("Failed: "+error.message,"error"); return; }
  const idx = allMembers.findIndex(m => m.id===userId);
  if (idx!==-1) allMembers[idx].role = newRole;
  toast(`${name}'s role → ${newRole} ✓`,"success");
  renderAdminMembers();
};

window.adminToggleVerify = async function(userId, isVerified) {
  const { error } = await sb.from("users").update({ verified:!isVerified }).eq("id",userId);
  if (error) { toast("Failed","error"); return; }
  const idx = allMembers.findIndex(m => m.id===userId);
  if (idx!==-1) allMembers[idx].verified = !isVerified;
  toast((!isVerified?"Verified ✓":"Unverified")+" user","success");
  renderAdminMembers();
};

window.adminSuspend = async function(userId, name) {
  if (!confirm(`Suspend ${name}?`)) return;
  await sb.from("users").update({ status:"suspended" }).eq("id",userId);
  toast(`${name} suspended`,"warning");
  renderAdminMembers();
};

window.reviewDeletion = async function(reqId, status) {
  const note = status==="rejected" ? (prompt("Optional note for user:"))||"" : "";
  const { error } = await sb.from("deletion_requests")
    .update({ status, admin_note:note, reviewed_by:currentUser.id, reviewed_at:new Date().toISOString() }).eq("id",reqId);
  if (error) { toast("Failed","error"); return; }
  if (status==="approved") {
    const { data:req } = await sb.from("deletion_requests").select("user_id").eq("id",reqId).single();
    if (req) await sb.from("users").update({ status:"deleted" }).eq("id",req.user_id);
  }
  toast(`Request ${status} ✓`,"success");
  renderAdminDeletions();
};

window.deleteAnnouncement = async function(id) {
  if (!confirm("Delete this announcement?")) return;
  await sb.from("announcements").delete().eq("id",id);
  toast("Announcement deleted","info");
  renderAdminAnnouncements();
};

// ── ANNOUNCEMENT MODAL ──
window.openAnnouncementModal = function() { openModal("announcementModalOverlay"); };
window.closeAnnouncementModal = e => { if(e.target.id==="announcementModalOverlay") closeModal("announcementModalOverlay"); };
window.closeAnnouncementModalBtn = () => closeModal("announcementModalOverlay");

window.saveAnnouncement = async function() {
  const title  = document.getElementById("announcementTitle").value.trim();
  const body   = document.getElementById("announcementBody").value.trim();
  const type   = document.getElementById("announcementType").value;
  const pinned = document.getElementById("announcementPinned").value==="true";
  if (!title||!body) { toast("Title and body required","error"); return; }
  const { error } = await sb.from("announcements").insert({ title,body,type,pinned,author_id:currentUser.id });
  if (error) { toast("Failed: "+error.message,"error"); return; }
  toast("Announcement posted! 📢","success");
  closeModal("announcementModalOverlay");
  ["announcementTitle","announcementBody"].forEach(id => document.getElementById(id).value="");
  loadAnnouncements();
  if (currentSection==="admin") renderAdminAnnouncements();
};

// ── EVENT MODAL ──
window.openEventModal = function() { toast("Event creation coming soon!","info"); };
window.searchInChat = function() { toast("In-chat search coming soon!","info"); };
