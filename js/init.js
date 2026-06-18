// ============================================================
// BOOT
// ============================================================
(async function boot() {
  try {
    const { data } = await sb.auth.getSession();
    if (data?.session) await initPlatform(data.session.user.id);
    else window.location.href = "auth.html";
  } catch (e) {
    console.error("[AMPRO]", e);
    toast("Failed to load. Please refresh.", "error");
  }
})();

async function initPlatform(uid) {
  const [
    { data: me },
    { data: members },
    { data: tasks },
    { data: courses },
    { data: completions },
    { data: notifs }
  ] = await Promise.all([
    sb.from("users").select("*").eq("id", uid).single(),
    sb.from("users").select("*").order("level", { ascending: false }),
    sb.from("tasks").select("*").order("created_at", { ascending: false }),
    sb.from("courses").select("*").order("order_index"),
    sb.from("course_completions").select("*").eq("user_id", uid),
    sb.from("notifications").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(40)
  ]);

  currentUser   = me;
  allMembers    = members    || [];
  allTasks      = tasks      || [];
  allCourses    = courses    || [];
  myCompletions = completions || [];

  // Admin visibility
  const isAdmin = me && ["founder","co-founder","admin"].includes(me.role);
  document.querySelectorAll(".admin-only").forEach(el => el.style.display = isAdmin ? "" : "none");

  updateSidebar(me);
  await updatePresence(uid);

  renderCommunity();
  renderMembers();
  renderTasks();
  renderCourses();
  renderProfileSection(me);
  renderSettings(me);
  renderNotifications(notifs || []);
  if (isAdmin) renderAdminPanel();

  updateNotifBadge(notifs || []);
  updateTaskBadge();

  loadCommunityMessages();
  loadDmList();
  setupRealtime(uid);
}

// ── SIDEBAR ──
function updateSidebar(me) {
  if (!me) return;
  const name  = me.name || me.username || "User";
  const color = avatarColor(name);
  document.getElementById("sidebarName").textContent = name;
  document.getElementById("sidebarRole").textContent = getRoleInfo(me.role).label;

  const av = document.getElementById("sidebarAvatar");
  if (me.avatar_url) {
    av.innerHTML = `<img src="${esc(me.avatar_url)}" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`;
    av.style.background = "none";
  } else {
    av.textContent  = name[0]?.toUpperCase() || "?";
    av.style.background = color;
    av.style.color  = "#fff";
  }
}

// ── MOBILE SIDEBAR ──
window.toggleSidebar = () => {
  document.getElementById("sidebar").classList.toggle("open");
  document.getElementById("sidebarOverlay").classList.toggle("open");
};
function closeSidebar() {
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("sidebarOverlay").classList.remove("open");
}

// ── SECTION SWITCH ──
window.switchSection = function(id, btn) {
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach(b => b.classList.remove("active"));
  const sec = document.getElementById("section-" + id);
  if (sec) sec.classList.add("active");
  if (btn) btn.classList.add("active");
  currentSection = id;
  closeSidebar();
  if (id === "admin") renderAdminPanel();
};

// ── PRESENCE ──
async function updatePresence(uid) {
  try {
    await sb.from("users").update({ online: true, last_seen: new Date().toISOString() }).eq("id", uid);
    window.addEventListener("beforeunload", () => {
      navigator.sendBeacon(
        `https://tzojjwnqodcrhwjaasja.supabase.co/rest/v1/users?id=eq.${uid}`,
        JSON.stringify({ online: false })
      );
    });
    setInterval(() => sb.from("users").update({ online: true, last_seen: new Date().toISOString() }).eq("id", uid), 90000);
  } catch (e) {}
}

