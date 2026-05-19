// ============================================================
// AM PRO v2 — PROFILE & SETTINGS
// ============================================================

// ─── CSS INJECTION ────────────────────────────────────────
function injectProfileCSS() {
  if (document.getElementById("profileCSS")) return;
  const s = document.createElement("style");
  s.id = "profileCSS";
  s.textContent = `
/* ── PROFILE PAGE ── */
.profile-page { max-width: 680px; margin: 0 auto; }

.profile-banner-wrap {
  position: relative; height: 160px; border-radius: 20px; overflow: hidden;
  margin-bottom: 0; background: linear-gradient(135deg, rgba(99,102,241,0.3), rgba(167,139,250,0.2));
}
.profile-banner-img {
  width: 100%; height: 100%; object-fit: cover;
}
.banner-edit-btn {
  position: absolute; bottom: 10px; right: 10px;
  background: rgba(0,0,0,0.55); border: 1px solid rgba(255,255,255,0.15);
  border-radius: 10px; color: #fff; font-size: 12px; font-weight: 600;
  padding: 6px 12px; cursor: pointer; backdrop-filter: blur(8px);
  transition: background 0.2s;
}
.banner-edit-btn:hover { background: rgba(0,0,0,0.75); }

.profile-avatar-row {
  display: flex; align-items: flex-end; justify-content: space-between;
  padding: 0 20px; margin-top: -40px; margin-bottom: 16px;
}
.profile-avatar-wrap {
  width: 80px; height: 80px; border-radius: 50%;
  border: 3px solid #080810; overflow: hidden; position: relative;
  display: flex; align-items: center; justify-content: center;
  font-size: 28px; font-weight: 800; flex-shrink: 0;
}
.profile-avatar-wrap img { width:100%; height:100%; object-fit:cover; }
.avatar-edit-btn {
  position: absolute; bottom: 0; left: 0; right: 0;
  background: rgba(0,0,0,0.65); color: #fff; font-size: 10px;
  text-align: center; padding: 4px 0; cursor: pointer;
  transition: opacity 0.2s; opacity: 0;
}
.profile-avatar-wrap:hover .avatar-edit-btn { opacity: 1; }
.profile-gear-btn {
  background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px; color: rgba(240,240,255,0.7); cursor: pointer;
  font-size: 18px; padding: 10px 14px; transition: all 0.2s;
  display: flex; align-items: center; gap: 8px;
  font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
}
.profile-gear-btn:hover { background: rgba(255,255,255,0.12); color: #fff; }

.profile-info { padding: 0 4px; margin-bottom: 20px; }
.profile-name {
  font-family: -apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',sans-serif; font-size: 22px; font-weight: 800;
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
}
.profile-username { font-size: 14px; color: rgba(240,240,255,0.45); margin-bottom: 12px; }
.profile-badges { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; }
.profile-bio {
  font-size: 15px;
  color: rgba(245,245,247,0.80);
  line-height: 1.7;
  max-width: 480px;
  font-family: -apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",sans-serif;
  font-weight: 400;
  word-break: break-word;
  white-space: pre-wrap;
}

.profile-stats {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
  margin-bottom: 24px;
}
.pstat {
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07);
  border-radius: 16px; padding: 16px; text-align: center;
}
.pstat-val {
  font-family: -apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',sans-serif; font-size: 22px; font-weight: 800;
  color: #f5f5f7;
}
.pstat-lbl { font-size: 11px; color: rgba(240,240,255,0.4); text-transform:uppercase; letter-spacing:0.5px; margin-top:4px; }

/* Progress card */
.rank-progress-card {
  background: rgba(99,102,241,0.08); border: 1px solid rgba(99,102,241,0.2);
  border-radius: 18px; padding: 20px;
  margin-bottom: 20px;
}
.rpc-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; }
.rpc-title { font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',sans-serif; font-size:15px; font-weight:700; }
.rpc-pct { font-family:'Syne',monospace; font-size:13px; color:#a78bfa; font-weight:800; }
.rpc-track { height:8px; background:rgba(255,255,255,0.08); border-radius:6px; overflow:hidden; margin-bottom:10px; }
.rpc-fill {
  height:100%; border-radius:6px;
  background: linear-gradient(90deg, rgba(255,255,255,0.5), rgba(255,255,255,0.9));
  box-shadow: 0 0 8px rgba(255,255,255,0.3);
  transition: width 1s cubic-bezier(0.16,1,0.3,1);
}
.rpc-labels { display:flex; justify-content:space-between; font-size:11px; color:rgba(240,240,255,0.4); }

/* Titles row */
.titles-section { margin-bottom: 24px; }
.titles-title { font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',sans-serif; font-size:15px; font-weight:700; margin-bottom:12px; }
.titles-grid { display:flex; flex-wrap:wrap; gap:8px; }

/* ── SETTINGS ── */
.settings-page { max-width: 560px; margin: 0 auto; }
.settings-section {
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
  border-radius: 20px; overflow: hidden; margin-bottom: 16px;
}
.settings-hdr {
  padding: 16px 20px; font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',sans-serif; font-size:13px; font-weight:700;
  color: rgba(240,240,255,0.5); text-transform:uppercase; letter-spacing:0.8px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
.settings-row {
  display: flex; align-items: center; padding: 16px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.04); gap: 14px;
  transition: background 0.15s; cursor: pointer;
}
.settings-row:last-child { border-bottom: none; }
.settings-row:hover { background: rgba(255,255,255,0.04); }
.settings-row-icon { font-size:18px; width:24px; text-align:center; }
.settings-row-info { flex:1; }
.settings-row-label { font-size:14px; font-weight:600; margin-bottom:2px; }
.settings-row-sub   { font-size:11px; color:rgba(240,240,255,0.4); }
.settings-row-arrow { color:rgba(240,240,255,0.3); font-size:14px; }
.settings-row.danger { }
.settings-row.danger .settings-row-label { color: #ef4444; }

/* Settings form fields */
.settings-field-wrap { padding: 0 20px 20px; }
.settings-input {
  width: 100%; padding: 12px 14px;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09);
  border-radius: 12px; color: #f0f0ff;
  font-family: 'DM Sans', sans-serif; font-size: 14px; outline: none;
  transition: border-color 0.2s; margin-top: 8px;
}
.settings-input:focus { border-color: rgba(255,255,255,0.35); box-shadow:0 0 0 3px rgba(255,255,255,0.07); }
.settings-input-lbl { font-size:12px; color:rgba(240,240,255,0.5); font-weight:600; }
textarea.settings-input { resize:vertical; min-height:80px; }
.settings-save-btn {
  margin-top: 12px; width: 100%;
  background: rgba(255,255,255,0.92);
  border: none; border-radius: 12px; color: #000;
  font-size:14px; font-weight:700;
  padding: 13px; cursor: pointer; transition: all 0.2s;
  box-shadow: 0 4px 14px rgba(0,0,0,0.3);
}
.settings-save-btn:hover { transform:translateY(-1px); background:#fff; box-shadow:0 8px 24px rgba(0,0,0,0.4); }

/* Danger zone */
.danger-zone {
  background: rgba(239,68,68,0.05); border: 1px solid rgba(239,68,68,0.15);
  border-radius: 20px; padding: 20px; margin-top: 8px;
}
.danger-zone-title {
  font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',sans-serif; font-size:14px; font-weight:700;
  color:#ef4444; margin-bottom:12px; display:flex; align-items:center; gap:8px;
}
.danger-zone-desc {
  font-size:13px; color:rgba(240,240,255,0.5); line-height:1.6; margin-bottom:16px;
}
.btn-danger {
  background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3);
  border-radius: 12px; color: #ef4444;
  font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',sans-serif; font-size:13px; font-weight:700;
  padding: 11px 20px; cursor: pointer; transition: all 0.2s; width:100%;
}
.btn-danger:hover { background: rgba(239,68,68,0.25); }
.btn-logout-full {
  background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px; color: rgba(240,240,255,0.8);
  font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',sans-serif; font-size:13px; font-weight:700;
  padding: 11px 20px; cursor: pointer; transition: all 0.2s; width:100%;
  margin-bottom: 10px;
}
.btn-logout-full:hover { background: rgba(255,255,255,0.1); }

/* Modal overlay for confirm */
.confirm-overlay {
  position:fixed; inset:0; z-index:600;
  background:rgba(0,0,0,0.75); backdrop-filter:blur(16px);
  display:flex; align-items:center; justify-content:center; padding:20px;
  animation: fadeIn 0.2s;
}
.confirm-overlay.hidden { display:none; }
.confirm-modal {
  background:#0d0d1a; border:1px solid rgba(239,68,68,0.25);
  border-radius:20px; padding:28px; max-width:360px; width:100%;
  animation: slideUp 0.3s cubic-bezier(0.16,1,0.3,1);
}
.confirm-title { font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',sans-serif; font-size:18px; font-weight:800; margin-bottom:10px; }
.confirm-body  { font-size:13px; color:rgba(240,240,255,0.6); line-height:1.6; margin-bottom:20px; }
.confirm-reason {
  width:100%; padding:10px 14px; margin-bottom:16px;
  background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.09);
  border-radius:12px; color:#f0f0ff; font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text','Segoe UI',sans-serif; font-size:13px; outline:none;
  resize:vertical; min-height:70px;
}
.confirm-reason:focus { border-color:rgba(239,68,68,0.4); }
.confirm-actions { display:flex; gap:10px; }
.btn-cancel-confirm {
  flex:1; padding:12px; background:rgba(255,255,255,0.06);
  border:1px solid rgba(255,255,255,0.1); border-radius:12px;
  color:#f0f0ff; font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',sans-serif; font-size:13px; font-weight:700;
  cursor:pointer; transition:background 0.2s;
}
.btn-cancel-confirm:hover { background:rgba(255,255,255,0.1); }
.btn-confirm-danger {
  flex:1; padding:12px;
  background:linear-gradient(135deg,#ef4444,#f97316);
  border:none; border-radius:12px; color:#fff;
  font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',sans-serif; font-size:13px; font-weight:700;
  cursor:pointer; box-shadow:0 4px 16px rgba(239,68,68,0.4);
}
  `;
  document.head.appendChild(s);
}

// ─── RENDER PROFILE ───────────────────────────────────────
async function renderProfile() {
  if (!currentProfile) return;
  injectProfileCSS();

  const container = document.getElementById("profileContainer");
  const p = currentProfile;
  const rank  = allRanks.find(r => r.id === p.rank_id) || getRankForPoints(p.points||0);
  const title = p.title_id ? allTitles.find(t => t.id === p.title_id) : null;

  // Fetch user titles
  const { data: userTitles } = await sb.from("user_titles")
    .select("*, title:titles(*)").eq("user_id", currentUser.id);
  const { count: taskCount } = await sb.from("tasks")
    .select("id", {count:"exact",head:true}).eq("user_id", currentUser.id);

  // Progress
  const pts = p.points || 0;
  const nextRank = allRanks.find(r => r.min_points > pts);
  const pct = nextRank
    ? Math.min(100, ((pts - rank.min_points) / (nextRank.min_points - rank.min_points)) * 100)
    : 100;

  const avatarBg = p.avatar_url ? "background:transparent" : `background:${avatarColor(p.name)};`;
  const avatarContent = p.avatar_url ? `<img src="${p.avatar_url}" alt="avatar"/>` : (p.name||"?")[0].toUpperCase();

  const bannerStyle = p.banner_url
    ? `<img src="${p.banner_url}" class="profile-banner-img" alt="banner"/>`
    : "";

  container.innerHTML = `
    <div class="profile-page">
      <div class="profile-banner-wrap">
        ${bannerStyle}
        <label class="banner-edit-btn" for="bannerUpload"> Edit Banner
          <input type="file" id="bannerUpload" accept="image/*" hidden onchange="uploadBanner(this)"/>
        </label>
      </div>

      <div class="profile-avatar-row">
        <label class="profile-avatar-wrap" style="${avatarBg}" for="avatarUpload">
          ${avatarContent}
          <div class="avatar-edit-btn">Edit</div>
          <input type="file" id="avatarUpload" accept="image/*" hidden onchange="uploadAvatar(this)"/>
        </label>
        <button class="profile-gear-btn" onclick="showPage('settings', document.getElementById('nav-settings'))">️ Settings</button>
      </div>

      <div class="profile-info">
        <div class="profile-name">
          ${esc(p.name||"")}
          ${p.verified ? '<span class="verified-check" style="width:22px;height:22px"><svg viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg></span>' : ""}
        </div>
        <div class="profile-username">@${esc(p.username||"")} · ${esc(p.field||"")}</div>

        <!-- ── Rank Logo centred in profile ── -->
        <div style="display:flex;justify-content:center;align-items:center;margin:14px 0 10px;">
          ${getRankLogoHTML(rank, 72, true)}
        </div>

        <div class="profile-badges">
          ${title ? getTitleBadgeHTML(title) : ""}
        </div>
        <div class="profile-bio">${p.bio ? p.bio.replace(/\n/g, "<br/>") : '<span style="opacity:0.45">No bio yet. Click Settings to add one.</span>'}</div>
      </div>

      <div class="profile-stats">
        <div class="pstat">
          <div class="pstat-val">${(pts).toLocaleString()}</div>
          <div class="pstat-lbl">Points</div>
        </div>
        <div class="pstat">
          <div class="pstat-val">${taskCount||0}</div>
          <div class="pstat-lbl">Tasks</div>
        </div>
        <div class="pstat">
          <div class="pstat-val">${rank.name}</div>
          <div class="pstat-lbl">Rank</div>
        </div>
      </div>

      <div class="rank-progress-card">
        <div class="rpc-header">
          <div class="rpc-title">
            ${getRankLogoHTML(rank, 20, false)}
            ${rank.name} → ${nextRank ? getRankLogoHTML(nextRank, 20, false) + " " + nextRank.name : "MAX"}
          </div>
          <div class="rpc-pct">${Math.round(pct)}%</div>
        </div>
        <div class="rpc-track"><div class="rpc-fill" id="profileProgressFill" style="width:0%"></div></div>
        <div class="rpc-labels">
          <span>${pts.toLocaleString()} pts</span>
          <span>${nextRank ? (nextRank.min_points - pts).toLocaleString() + " pts to go" : "Highest rank!"}</span>
        </div>
      </div>

      ${userTitles && userTitles.length ? `
      <div class="titles-section">
        <div class="titles-title"> Your Titles</div>
        <div class="titles-grid">
          ${userTitles.map(ut => ut.title ? getTitleBadgeHTML(ut.title) : "").join("")}
        </div>
      </div>` : ""}
    </div>
  `;

  setTimeout(() => {
    const f = document.getElementById("profileProgressFill");
    if (f) f.style.width = pct + "%";
  }, 150);
}

async function uploadAvatar(input) {
  const file = input.files[0];
  if (!file) return;
  showToast("Uploading...");
  const path = `${currentUser.id}/avatar.${file.name.split(".").pop()}`;
  const { error: upErr } = await sb.storage.from("avatars").upload(path, file, { upsert: true });
  if (upErr) { showToast("Upload failed: " + upErr.message, "error"); return; }
  const { data } = sb.storage.from("avatars").getPublicUrl(path);
  const avatarUrl = data.publicUrl + "?t=" + Date.now();
  const { error: dbErr } = await sb.from("users").update({ avatar_url: avatarUrl }).eq("id", currentUser.id);
  if (dbErr) { showToast("DB error: " + dbErr.message, "error"); return; }
  // Update currentProfile immediately
  if (currentProfile) currentProfile.avatar_url = avatarUrl;
  // Update sidebar avatar
  const sba = document.getElementById("sidebarAvatar");
  if (sba) sba.innerHTML = `<img src="${avatarUrl}" alt="avatar"/>`;
  // Reload from DB and re-render
  await loadProfile();
  renderProfile();
  showToast("Avatar updated ✓");
}

async function uploadBanner(input) {
  const file = input.files[0];
  if (!file) return;
  const path = `${currentUser.id}/banner.${file.name.split(".").pop()}`;
  await sb.storage.from("banners").upload(path, file, { upsert: true });
  const { data } = sb.storage.from("banners").getPublicUrl(path);
  await sb.from("users").update({ banner_url: data.publicUrl + "?t=" + Date.now() }).eq("id", currentUser.id);
  await loadProfile();
  renderProfile();
  showToast("Banner updated ");
}

// ─── RENDER SETTINGS ──────────────────────────────────────
function renderSettings() {
  if (!currentProfile) return;
  injectProfileCSS();
  const p = currentProfile;
  const container = document.getElementById("settingsContainer");

  container.innerHTML = `
    <div class="settings-page">
      <div style="font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',sans-serif;font-size:22px;font-weight:800;margin-bottom:20px">Settings</div>

      <!-- Profile Info -->
      <div class="settings-section">
        <div class="settings-hdr">Profile Information</div>
        <div class="settings-field-wrap">
          <div class="settings-input-lbl">Full Name</div>
          <input class="settings-input" id="setName" value="${esc(p.name||"")}" placeholder="Your full name"/>
          <div class="settings-input-lbl" style="margin-top:12px">Username</div>
          <input class="settings-input" id="setUsername" value="${esc(p.username||"")}" placeholder="username"/>
          <div class="settings-input-lbl" style="margin-top:12px">Bio</div>
          <textarea class="settings-input" id="setBio" placeholder="Tell the team about yourself...">${esc(p.bio||"")}</textarea>
          <div class="settings-input-lbl" style="margin-top:12px">Field</div>
          <select class="settings-input" id="setField">
            <option value="">Select field</option>
            ${["Programming","Content Creation","Sports","Design","Marketing"].map(f =>
              `<option value="${f}" ${p.field === f ? "selected" : ""}>${f}</option>`
            ).join("")}
          </select>
          <button class="settings-save-btn" onclick="saveProfile()">Save Changes</button>
        </div>
      </div>

      <!-- Password -->
      <div class="settings-section">
        <div class="settings-hdr">Security</div>
        <div class="settings-field-wrap">
          <div class="settings-input-lbl">New Password</div>
          <input class="settings-input" id="setNewPass" type="password" placeholder="Enter new password"/>
          <div class="settings-input-lbl" style="margin-top:12px">Confirm Password</div>
          <input class="settings-input" id="setConfirmPass" type="password" placeholder="Confirm new password"/>
          <button class="settings-save-btn" onclick="changePassword()" style="background:linear-gradient(135deg,#22c55e,#16a34a)">Update Password</button>
        </div>
      </div>

      <!-- Account actions -->
      <div class="settings-section">
        <div class="settings-hdr">Account</div>
        <div class="settings-row" onclick="signOut()">
          <span class="settings-row-icon"></span>
          <div class="settings-row-info">
            <div class="settings-row-label">Sign Out</div>
            <div class="settings-row-sub">Sign out from your account</div>
          </div>
          <span class="settings-row-arrow">›</span>
        </div>
        <div class="settings-row danger" onclick="openDeleteRequest()">
          <span class="settings-row-icon"></span>
          <div class="settings-row-info">
            <div class="settings-row-label">Delete Account</div>
            <div class="settings-row-sub">Request account deletion (reviewed by admin)</div>
          </div>
          <span class="settings-row-arrow">›</span>
        </div>
      </div>
    </div>

    <!-- Confirm Delete Modal -->
    <div class="confirm-overlay hidden" id="deleteConfirmOverlay">
      <div class="confirm-modal">
        <div class="confirm-title">️ Delete Account?</div>
        <div class="confirm-body">
          Your request will be sent to the admin for review. Your account won't be deleted immediately — the admin will approve or reject your request.
        </div>
        <textarea class="confirm-reason" id="deleteReason" placeholder="Why do you want to delete your account? (optional)"></textarea>
        <div class="confirm-actions">
          <button class="btn-cancel-confirm" onclick="closeDeleteConfirm()">Cancel</button>
          <button class="btn-confirm-danger" onclick="submitDeleteRequest()">Send Request</button>
        </div>
      </div>
    </div>
  `;
}

async function saveProfile() {
  const name     = document.getElementById("setName").value.trim();
  const username = document.getElementById("setUsername").value.trim().toLowerCase();
  const bio      = document.getElementById("setBio").value.trim();
  const field    = document.getElementById("setField").value;
  if (!name) return showToast("Name is required", "error");

  const { error } = await sb.from("users").update({ name, username, bio, field }).eq("id", currentUser.id);
  if (error) return showToast("Error: " + error.message, "error");
  await loadProfile();
  showToast("Profile saved ");
}

async function changePassword() {
  const np = document.getElementById("setNewPass").value;
  const cp = document.getElementById("setConfirmPass").value;
  if (!np) return showToast("Enter a new password", "error");
  if (np !== cp) return showToast("Passwords don't match", "error");
  if (np.length < 8) return showToast("Password must be at least 8 characters", "error");
  const { error } = await sb.auth.updateUser({ password: np });
  if (error) return showToast("Error: " + error.message, "error");
  document.getElementById("setNewPass").value = "";
  document.getElementById("setConfirmPass").value = "";
  showToast("Password updated ");
}

async function signOut() {
  await sb.auth.signOut();
  window.location.href = "../auth/";
}

function openDeleteRequest() {
  document.getElementById("deleteConfirmOverlay").classList.remove("hidden");
}
function closeDeleteConfirm() {
  document.getElementById("deleteConfirmOverlay").classList.add("hidden");
}

async function submitDeleteRequest() {
  const reason = document.getElementById("deleteReason").value.trim();
  // Check for existing pending request
  const { data: existing } = await sb.from("delete_requests")
    .select("id").eq("user_id", currentUser.id).eq("status","pending").maybeSingle();
  if (existing) return showToast("You already have a pending delete request", "error");

  const { error } = await sb.from("delete_requests").insert({ user_id: currentUser.id, reason });
  if (error) return showToast("Error: " + error.message, "error");
  closeDeleteConfirm();
  showToast("Delete request sent to admin ");
}
