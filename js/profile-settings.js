// ============================================================
// PROFILE SECTION
// ============================================================
function renderProfileSection(me) {
  if (!me) return;
  const r=getRoleInfo(me.role), c=avatarColor(me.name);

  document.getElementById("myProfileName").textContent = me.name||"—";
  document.getElementById("myVerifyBadge").style.display = me.verified?"flex":"none";
  document.getElementById("myRankBadge").innerHTML = rankBadgeHTML(me.role);

  const initEl=document.getElementById("myAvatarInitial");
  const imgEl =document.getElementById("myAvatarImg");
  const ringEl=document.getElementById("myAvatarCircle");
  ringEl.style.background = c+"22";
  ringEl.style.boxShadow  = `0 0 0 3px ${r.color}66`;
  if (me.avatar_url) { imgEl.src=me.avatar_url; imgEl.style.display="block"; initEl.style.display="none"; }
  else { initEl.textContent=(me.name||"?")[0]?.toUpperCase()||"?"; initEl.style.color=c; initEl.style.display="block"; imgEl.style.display="none"; }

  const bImg =document.getElementById("myBannerImg");
  const bGrad=document.getElementById("myBannerGradient");
  if (me.banner_url) { bImg.src=me.banner_url; bImg.style.display="block"; }
  else { bGrad.style.background=`linear-gradient(135deg,${r.color}44,${c}33)`; bImg.style.display="none"; }

  document.getElementById("editName").value     = me.name     ||"";
  document.getElementById("editUsername").value = me.username ||"";
  document.getElementById("editBio").value      = me.bio      ||"";
  document.getElementById("editField").value    = me.field    ||"";
  updateBioCount();
}

window.updateBioCount = function() {
  const ta = document.getElementById("editBio");
  const cc = document.getElementById("bioCharCount");
  if (ta&&cc) cc.textContent = (ta.value||"").length+"/160";
};

window.saveProfile = async function() {
  const name     = document.getElementById("editName").value.trim();
  const username = document.getElementById("editUsername").value.trim();
  const bio      = document.getElementById("editBio").value.trim();
  const field    = document.getElementById("editField").value.trim();
  if (!name) { toast("Display name required","error"); return; }

  const btn = document.getElementById("saveProfileBtn");
  btn.disabled=true; btn.textContent="Saving…";

  const { error } = await sb.from("users").update({ name,username,bio,field,updated_at:new Date().toISOString() }).eq("id",currentUser.id);
  btn.disabled=false; btn.innerHTML=`<i class="fa-solid fa-check"></i> Save Profile`;

  if (error) { toast("Failed: "+error.message,"error"); return; }
  Object.assign(currentUser,{ name,username,bio,field });
  updateSidebar(currentUser);
  const idx = allMembers.findIndex(m => m.id===currentUser.id);
  if (idx!==-1) Object.assign(allMembers[idx],{ name,username,bio,field });
  toast("Profile saved! ✓","success");
  document.getElementById("myProfileName").textContent = name;
};

window.uploadAvatar = async function(input) {
  const file = input.files[0];
  if (!file||!currentUser) return;
  input.value="";
  toast("Uploading avatar…","info");
  const ext  = file.name.split(".").pop()||"jpg";
  const path = `${currentUser.id}/avatar.${ext}`;
  await sb.storage.from("avatars").remove([path]);
  const { error:upErr } = await sb.storage.from("avatars").upload(path,file,{upsert:true,contentType:file.type});
  if (upErr) { toast("Upload failed","error"); return; }
  const { data:{publicUrl} } = sb.storage.from("avatars").getPublicUrl(path);
  const url = publicUrl+"?t="+Date.now();
  await sb.from("users").update({ avatar_url:url }).eq("id",currentUser.id);
  currentUser.avatar_url = url;
  const imgEl = document.getElementById("myAvatarImg");
  if (imgEl) { imgEl.src=url; imgEl.style.display="block"; document.getElementById("myAvatarInitial").style.display="none"; }
  updateSidebar(currentUser);
  const idx = allMembers.findIndex(m => m.id===currentUser.id);
  if (idx!==-1) allMembers[idx].avatar_url = url;
  toast("Avatar updated ✓","success");
};

window.uploadBanner = async function(input) {
  const file = input.files[0];
  if (!file||!currentUser) return;
  input.value="";
  toast("Uploading banner…","info");
  const ext  = file.name.split(".").pop()||"jpg";
  const path = `${currentUser.id}/banner.${ext}`;
  await sb.storage.from("banners").remove([path]);
  const { error:upErr } = await sb.storage.from("banners").upload(path,file,{upsert:true,contentType:file.type});
  if (upErr) { toast("Upload failed","error"); return; }
  const { data:{publicUrl} } = sb.storage.from("banners").getPublicUrl(path);
  const url = publicUrl+"?t="+Date.now();
  await sb.from("users").update({ banner_url:url }).eq("id",currentUser.id);
  currentUser.banner_url = url;
  const imgEl = document.getElementById("myBannerImg");
  if (imgEl) { imgEl.src=url; imgEl.style.display="block"; }
  const idx = allMembers.findIndex(m => m.id===currentUser.id);
  if (idx!==-1) allMembers[idx].banner_url = url;
  toast("Banner updated ✓","success");
};

window.toggleProfilePreview = function() {
  if (currentUser) openMemberProfile(currentUser.id);
};

// ============================================================
// SETTINGS
// ============================================================
function renderSettings(me) {
  if (!me) return;
  const email = document.getElementById("settingsEmail");
  if (email) email.textContent = me.email||"—";
  loadDeletionStatus();
}

async function loadDeletionStatus() {
  if (!currentUser) return;
  const { data } = await sb.from("deletion_requests").select("*").eq("user_id",currentUser.id).order("created_at",{ascending:false}).limit(1).maybeSingle();
  const area = document.getElementById("deletionStatusArea");
  const card = document.getElementById("deletionStatusCard");
  const btn  = document.getElementById("deleteRequestBtn");
  if (!data || !area || !card) return;

  const cfg = {
    pending:  { cls:"pending",  icon:"🕐", title:"Request Pending",  desc:"Your deletion request is under review by the admin team.", color:"var(--yellow)" },
    approved: { cls:"approved", icon:"✅", title:"Request Approved", desc:"Your account will be deleted shortly.",                    color:"var(--green)"  },
    rejected: { cls:"rejected", icon:"❌", title:"Request Rejected",  desc:data.admin_note||"Your deletion request was rejected.",     color:"var(--red)"    },
    suspended:{ cls:"rejected", icon:"⚠️", title:"Account Suspended", desc:"Your account has been suspended.",                        color:"var(--orange)" }
  };
  const cf = cfg[data.status]||cfg.pending;
  card.className   = `deletion-status-card ${cf.cls}`;
  card.innerHTML   = `<span style="font-size:20px">${cf.icon}</span><div><div class="deletion-status-title" style="color:${cf.color}">${cf.title}</div><div class="deletion-status-desc">${esc(cf.desc)}</div></div>`;
  area.style.display = "block";
  if (btn && (data.status==="pending"||data.status==="approved")) btn.disabled = true;
}

window.openChangePassword = () => openModal("passwordModalOverlay");
window.closePasswordModal = e => { if(e.target.id==="passwordModalOverlay") closeModal("passwordModalOverlay"); };
window.closePasswordModalBtn = () => closeModal("passwordModalOverlay");

window.changePassword = async function() {
  const np = document.getElementById("newPassword").value;
  const cp = document.getElementById("confirmPassword").value;
  if (!np||np.length<6) { toast("Password must be at least 6 characters","error"); return; }
  if (np!==cp) { toast("Passwords do not match","error"); return; }
  const { error } = await sb.auth.updateUser({ password:np });
  if (error) { toast("Failed: "+error.message,"error"); return; }
  toast("Password updated ✓","success");
  closeModal("passwordModalOverlay");
};

window.openDeleteRequest = () => openModal("deleteModalOverlay");
window.closeDeleteModal  = e => { if(e.target.id==="deleteModalOverlay") closeModal("deleteModalOverlay"); };
window.closeDeleteModalBtn = () => closeModal("deleteModalOverlay");

window.submitDeletionRequest = async function() {
  const reason = document.getElementById("deleteReason").value.trim();
  const { data:existing } = await sb.from("deletion_requests").select("id").eq("user_id",currentUser.id).eq("status","pending").maybeSingle();
  if (existing) { toast("You already have a pending request","warning"); closeModal("deleteModalOverlay"); return; }
  const { error } = await sb.from("deletion_requests").insert({ user_id:currentUser.id, reason, status:"pending" });
  if (error) { toast("Failed to submit request","error"); return; }
  await sb.from("users").update({ status:"pending_delete" }).eq("id",currentUser.id);
  toast("Deletion request submitted. Admin will review it.","info");
  closeModal("deleteModalOverlay");
  loadDeletionStatus();
};

window.signOut = async function() {
  await sb.from("users").update({ online:false }).eq("id",currentUser?.id);
  await sb.auth.signOut();
  window.location.href = "../auth/index.html";
};

// ============================================================
// NOTIFICATIONS
// ============================================================
function renderNotifications(notifs) {
  const el = document.getElementById("notificationsList");
  if (!el) return;
  if (!notifs.length) { el.innerHTML=`<div class="empty-state"><div class="empty-state-icon">🔔</div><div class="empty-state-title">No notifications</div></div>`; return; }
  el.innerHTML = notifs.map(n => notifItemHTML(n)).join("");
}

function notifItemHTML(n) {
  const icons = { message:"💬", task_assigned:"📋", task_done:"✅", course_done:"🎓", mention:"@", announcement:"📢", deletion_status:"⚠️" };
  const colors= { message:"rgba(79,142,247,.15)", task_assigned:"rgba(234,179,8,.15)", task_done:"rgba(34,197,94,.15)", course_done:"rgba(139,92,246,.15)", announcement:"rgba(249,115,22,.15)" };
  return `<div class="notif-item ${n.read?"":"unread"}" onclick="markNotifRead('${esc(n.id)}',this)">
    <div class="notif-icon" style="background:${colors[n.type]||"rgba(255,255,255,.06)"}">${icons[n.type]||"🔔"}</div>
    <div class="notif-body">
      <div class="notif-title">${esc(n.title)}</div>
      ${n.body?`<div class="notif-text">${esc(n.body)}</div>`:""}
      <div class="notif-time">${timeAgo(n.created_at)}</div>
    </div>
  </div>`;
}

function prependNotification(n) {
  const el = document.getElementById("notificationsList");
  if (!el) return;
  const empty = el.querySelector(".empty-state");
  if (empty) el.innerHTML="";
  el.insertAdjacentHTML("afterbegin", notifItemHTML(n));
}

window.markNotifRead = async function(id, el) {
  if (!el.classList.contains("unread")) return;
  await sb.from("notifications").update({ read:true }).eq("id",id);
  el.classList.remove("unread");
};

window.markAllNotificationsRead = async function() {
  await sb.from("notifications").update({ read:true }).eq("user_id",currentUser.id).eq("read",false);
  document.querySelectorAll(".notif-item.unread").forEach(el => el.classList.remove("unread"));
  document.getElementById("notifDot").style.display="none";
};

function updateNotifBadge(notifs, increment) {
  const unread = increment ? 1 : notifs.filter(n => !n.read).length;
  const dot = document.getElementById("notifDot");
  if (dot) dot.style.display = unread>0 ? "" : "none";
}

window.openNotifications = function() {
  const d = document.getElementById("notificationsDrawer");
  d.style.display = d.style.display==="none" ? "flex" : "none";
};
window.closeNotifications = () => { document.getElementById("notificationsDrawer").style.display="none"; };

// ============================================================
// SEARCH
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

