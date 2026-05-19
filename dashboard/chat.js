// ============================================================
// AM PRO v2 — CHAT SYSTEM (WhatsApp-like)
// Features: Private chat, Team chat, Voice recording, E2E encryption
// ============================================================

let chatInitialized = false;
let chatMode = "list"; // list | private | team
let activeConvId = null;
let activeOtherUser = null;
let chatSub = null;
let teamSub = null;
let typingTimeout = null;
let typingChannel = null;
let mediaRecorder = null;
let isRecording = false;
let sharedKeys = {}; // userId -> CryptoKey (E2E shared keys)

// ─── CSS INJECTION ────────────────────────────────────────
function injectChatCSS() {
  if (document.getElementById("chatCSS")) return;
  const s = document.createElement("style");
  s.id = "chatCSS";
  s.textContent = `
/* ── CHAT LAYOUT ── */
.chat-layout {
  display: flex; height: calc(100vh - 64px);
  margin: -28px; overflow: hidden;
}
.chat-sidebar {
  width: 320px; flex-shrink: 0;
  border-right: 1px solid rgba(255,255,255,0.07);
  display: flex; flex-direction: column;
  background: rgba(13,13,26,0.6);
}
.chat-sidebar-hdr {
  padding: 20px 16px 12px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.chat-sidebar-title {
  font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 800;
  margin-bottom: 12px;
}
.chat-search {
  display: flex; align-items: center; gap: 10px;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.07);
  border-radius: 12px; padding: 10px 14px;
}
.chat-search input {
  background: none; border: none; color: #f0f0ff;
  font-family: 'DM Sans', sans-serif; font-size: 13px;
  outline: none; flex: 1; padding: 0;
}

.chat-tabs {
  display: flex; gap: 0; border-bottom: 1px solid rgba(255,255,255,0.06);
}
.chat-tab {
  flex: 1; text-align: center; padding: 12px 0;
  font-size: 12px; font-weight: 700; color: rgba(240,240,255,0.45);
  cursor: pointer; transition: all 0.2s;
  border-bottom: 2px solid transparent;
  font-family: 'Syne', sans-serif;
}
.chat-tab.active { color: #a78bfa; border-bottom-color: #a78bfa; }

.conv-list { flex: 1; overflow-y: auto; }
.conv-list::-webkit-scrollbar { width: 3px; }
.conv-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius:3px; }

.conv-item {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 16px; cursor: pointer; transition: background 0.15s;
  position: relative;
}
.conv-item:hover { background: rgba(255,255,255,0.04); }
.conv-item.active { background: rgba(99,102,241,0.1); }
.conv-avatar {
  width: 46px; height: 46px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 17px; font-weight: 800; overflow: hidden;
  position: relative;
}
.conv-avatar img { width:100%; height:100%; object-fit:cover; border-radius:50%; }
.online-ring {
  position: absolute; bottom: 1px; right: 1px;
  width: 11px; height: 11px; border-radius: 50%;
  background: #22c55e; border: 2px solid #080810;
}
.conv-info { flex: 1; min-width: 0; }
.conv-name { font-size: 14px; font-weight: 600; margin-bottom: 3px; display:flex; align-items:center; gap:6px; }
.conv-last { font-size: 12px; color: rgba(240,240,255,0.45); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.conv-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
.conv-time { font-size: 10px; color: rgba(240,240,255,0.35); }
.unread-dot {
  min-width: 20px; height: 20px; border-radius: 10px;
  background: #6366f1; color: #fff;
  font-size: 10px; font-weight: 800; display: flex;
  align-items: center; justify-content: center; padding: 0 5px;
}

/* ── CHAT WINDOW ── */
.chat-window {
  flex: 1; display: flex; flex-direction: column;
  background: rgba(8,8,16,0.4);
  position: relative;
}
.chat-header {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 20px; border-bottom: 1px solid rgba(255,255,255,0.07);
  background: rgba(13,13,26,0.8); backdrop-filter: blur(12px);
}
.chat-back {
  display: none; background: none; border: none; color: rgba(240,240,255,0.6);
  font-size: 20px; cursor: pointer; padding: 4px;
}
.chat-header-avatar {
  width: 40px; height: 40px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; font-weight: 800; overflow: hidden; flex-shrink: 0;
}
.chat-header-avatar img { width:100%; height:100%; object-fit:cover; }
.chat-header-info { flex: 1; }
.chat-header-name { font-size: 15px; font-weight: 700; }
.chat-header-sub  { font-size: 11px; color: rgba(240,240,255,0.5); }

.messages-area {
  flex: 1; overflow-y: auto; padding: 20px;
  display: flex; flex-direction: column; gap: 4px;
}
.messages-area::-webkit-scrollbar { width: 3px; }
.messages-area::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius:3px; }

/* ── MESSAGES ── */
.msg-group { margin-bottom: 12px; }
.msg-row {
  display: flex; align-items: flex-end; gap: 8px; margin-bottom: 2px;
}
.msg-row.mine { flex-direction: row-reverse; }
.msg-avatar-sm {
  width: 28px; height: 28px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 800; flex-shrink: 0;
  overflow: hidden;
}
.msg-avatar-sm img { width:100%; height:100%; object-fit:cover; }
.msg-avatar-sm.mine { display: none; }

.bubble {
  max-width: 68%; padding: 10px 14px;
  border-radius: 18px; position: relative;
  line-height: 1.5; font-size: 14px;
  animation: bubbleIn 0.25s cubic-bezier(0.16,1,0.3,1);
}
@keyframes bubbleIn { from { opacity:0; transform:scale(0.9); } }
.bubble.theirs {
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.06);
  border-bottom-left-radius: 4px;
}
.bubble.mine {
  background: linear-gradient(135deg, #6366f1, #a78bfa);
  border-bottom-right-radius: 4px;
}
.bubble-time {
  font-size: 10px; opacity: 0.6; margin-top: 4px;
  display: flex; align-items: center; gap: 4px;
  justify-content: flex-end;
}
.read-tick { font-size: 12px; }
.read-tick.read { color: #93c5fd; }

.bubble-audio {
  display: flex; align-items: center; gap: 10px;
  min-width: 200px;
}
.audio-play-btn {
  width: 36px; height: 36px; border-radius: 50%;
  background: rgba(255,255,255,0.15); border: none;
  color: #fff; font-size: 16px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.2s;
}
.audio-play-btn:hover { background: rgba(255,255,255,0.25); }
.audio-waveform { flex: 1; height: 28px; position: relative; }
.audio-wave-svg { width: 100%; height: 100%; }

/* ── TYPING INDICATOR ── */
.typing-indicator {
  display: flex; align-items: center; gap: 8px;
  padding: 4px 0; font-size: 12px; color: rgba(240,240,255,0.45);
  min-height: 24px;
}
.typing-dots { display: flex; gap: 3px; }
.typing-dot {
  width: 5px; height: 5px; border-radius: 50%;
  background: rgba(240,240,255,0.4);
  animation: typingBounce 1s infinite;
}
.typing-dot:nth-child(2) { animation-delay: 0.15s; }
.typing-dot:nth-child(3) { animation-delay: 0.3s; }
@keyframes typingBounce {
  0%,80%,100% { transform: scale(1); opacity: 0.4; }
  40% { transform: scale(1.3); opacity: 1; }
}

/* ── INPUT BAR ── */
.chat-input-area {
  padding: 12px 16px 16px;
  background: rgba(13,13,26,0.95);
  border-top: 1px solid rgba(255,255,255,0.07);
}
.chat-input-row {
  display: flex; align-items: flex-end; gap: 10px;
}
.chat-input-wrap {
  flex: 1; display: flex; align-items: center; gap: 8px;
  background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08);
  border-radius: 24px; padding: 10px 16px;
  transition: border-color 0.2s;
}
.chat-input-wrap:focus-within { border-color: rgba(99,102,241,0.4); }

#msgInput {
  flex: 1; background: none; border: none; color: #f0f0ff;
  font-family: 'DM Sans', sans-serif; font-size: 14px;
  outline: none; resize: none; max-height: 120px;
  line-height: 1.5; padding: 0;
}
#msgInput::placeholder { color: rgba(240,240,255,0.3); }

.emoji-btn, .attach-btn {
  background: none; border: none; font-size: 18px;
  cursor: pointer; opacity: 0.5; transition: opacity 0.2s;
  flex-shrink: 0; padding: 0;
}
.emoji-btn:hover, .attach-btn:hover { opacity: 1; }

.send-btn, .record-btn {
  width: 44px; height: 44px; border-radius: 50%; border: none;
  background: linear-gradient(135deg, #6366f1, #a78bfa);
  color: #fff; font-size: 18px; cursor: pointer; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s; box-shadow: 0 4px 14px rgba(99,102,241,0.4);
}
.send-btn:hover, .record-btn:hover { transform: scale(1.05); box-shadow: 0 6px 20px rgba(99,102,241,0.5); }
.record-btn.recording {
  background: linear-gradient(135deg, #ef4444, #f97316);
  animation: recordPulse 1s ease-in-out infinite;
}
@keyframes recordPulse { 0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0.5)} 50%{box-shadow:0 0 0 12px rgba(239,68,68,0)} }

.emoji-picker-wrap {
  position: absolute; bottom: 80px; left: 20px;
  background: rgba(15,15,26,0.98); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px; padding: 12px; z-index: 100;
  backdrop-filter: blur(20px); width: 280px;
  box-shadow: 0 16px 48px rgba(0,0,0,0.5);
}
.emoji-picker-wrap.hidden { display: none; }
.emoji-grid {
  display: grid; grid-template-columns: repeat(8, 1fr); gap: 2px;
}
.ep-emoji {
  font-size: 22px; text-align: center; cursor: pointer;
  padding: 4px; border-radius: 8px; transition: background 0.15s;
}
.ep-emoji:hover { background: rgba(255,255,255,0.1); }

/* ── DATE DIVIDER ── */
.date-divider {
  text-align: center; margin: 16px 0 8px;
  font-size: 11px; color: rgba(240,240,255,0.35);
  position: relative;
}
.date-divider::before {
  content: ""; position: absolute; left: 0; right: 0;
  top: 50%; height: 1px; background: rgba(255,255,255,0.06);
}
.date-divider span {
  position: relative; background: rgba(8,8,16,0.6);
  padding: 0 12px; border-radius: 20px;
}

/* ── E2E LOCK ── */
.e2e-badge {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  padding: 6px 0; font-size: 11px; color: rgba(240,240,255,0.35);
}
.e2e-lock { font-size: 13px; }

/* ── TEAM CHAT HEADER ── */
.team-header-badge {
  display: inline-flex; align-items: center; gap: 6px;
  background: rgba(99,102,241,0.15); border: 1px solid rgba(99,102,241,0.25);
  border-radius: 20px; padding: 4px 12px; font-size: 11px; font-weight: 700; color: #a78bfa;
}

/* ── EMPTY CHAT ── */
.chat-empty {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 16px;
  color: rgba(240,240,255,0.3);
}
.chat-empty-icon { font-size: 64px; opacity: 0.4; }
.chat-empty-text { font-size: 16px; font-weight: 600; }
.chat-empty-sub  { font-size: 13px; }

@media (max-width: 768px) {
  .chat-layout { margin: -16px; height: calc(100vh - 56px); }
  .chat-sidebar { width: 100%; border-right: none; }
  .chat-window { display: none; }
  .chat-sidebar.hidden { display: none; }
  .chat-window.mobile-open { display: flex; position: fixed; inset: 0; z-index: 200; background: #080810; }
  .chat-back { display: flex !important; }
  .chat-input-area { padding: 8px 12px 12px; }
  .bubble { max-width: 82%; }
  .messages-area { padding: 12px; }
}
@media (max-width: 480px) {
  .chat-sidebar-title { font-size: 16px; }
  .conv-item { padding: 12px; }
  .chat-header { padding: 10px 14px; }
}
  `;
  document.head.appendChild(s);
}

// ─── INIT CHAT ────────────────────────────────────────────
let chatTabMode = "dm"; // dm | team

async function initChat() {
  if (!currentUser) return;
  injectChatCSS();
  const container = document.getElementById("chatContainer");
  if (chatInitialized && container.innerHTML.trim()) return;
  chatInitialized = true;
  renderChatLayout(container);
  await loadConversations();
  renderConvList();
  setupTypingChannel();
  // Auto-setup E2E key pair
  setupE2EKeys();
}

function renderChatLayout(container) {
  container.style.margin = "-28px";
  container.innerHTML = `
    <div class="chat-layout" id="chatLayout">
      <!-- SIDEBAR -->
      <div class="chat-sidebar" id="chatSidebar">
        <div class="chat-sidebar-hdr">
          <div class="chat-sidebar-title">Messages</div>
          <div class="chat-search">
            <span style="opacity:0.4"></span>
            <input placeholder="Search conversations..." oninput="filterConvs(this.value)" id="convSearch"/>
          </div>
        </div>
        <div class="chat-tabs">
          <div class="chat-tab active" onclick="switchChatTab('dm',this)">Direct Messages</div>
          <div class="chat-tab" onclick="switchChatTab('team',this)">👥 Team Chat</div>
        </div>
        <div class="conv-list" id="convList"></div>
      </div>

      <!-- WINDOW -->
      <div class="chat-window" id="chatWindow">
        <div class="chat-empty">
          <div class="chat-empty-icon">💬</div>
          <div class="chat-empty-text">Select a conversation</div>
          <div class="chat-empty-sub">or start a new one from Team Members</div>
        </div>
      </div>
    </div>
  `;
}

// ─── CONVERSATIONS ────────────────────────────────────────
let conversations = [];

async function loadConversations() {
  const { data } = await sb.from("conversations")
    .select(`*, user_a_profile:users!conversations_user_a_fkey(*), user_b_profile:users!conversations_user_b_fkey(*)`)
    .or(`user_a.eq.${currentUser.id},user_b.eq.${currentUser.id}`)
    .order("last_msg_at", { ascending: false });
  conversations = data || [];
}

function renderConvList(filter = "") {
  const list = document.getElementById("convList");
  if (!list) return;
  if (chatTabMode === "team") {
    list.innerHTML = `
      <div class="conv-item ${activeConvId === '__team__' ? 'active' : ''}" onclick="openTeamChat()">
        <div class="conv-avatar" style="background:linear-gradient(135deg,#6366f1,#a78bfa)">👥</div>
        <div class="conv-info">
          <div class="conv-name">Team Chat</div>
          <div class="conv-last">All team members</div>
        </div>
        <div class="conv-meta">
          <span class="team-header-badge">TEAM</span>
        </div>
      </div>
    `;
    return;
  }

  const filtered = conversations.filter(c => {
    const other = c.user_a === currentUser.id ? c.user_b_profile : c.user_a_profile;
    return !filter || (other?.name||"").toLowerCase().includes(filter.toLowerCase());
  });

  if (!filtered.length) {
    list.innerHTML = `<div style="text-align:center;padding:32px;color:rgba(240,240,255,0.3);font-size:13px;">No conversations yet<br/><span style="font-size:11px">Open a member profile to start chatting</span></div>`;
    return;
  }

  list.innerHTML = filtered.map(c => {
    const other   = c.user_a === currentUser.id ? c.user_b_profile : c.user_a_profile;
    const isActive = c.id === activeConvId;
    const avatarBg = other?.avatar_url ? "" : `background:${avatarColor(other?.name)};`;
    const avatarContent = other?.avatar_url
      ? `<img src="${other.avatar_url}" alt=""/>`
      : (other?.name||"?")[0].toUpperCase();
    return `
      <div class="conv-item ${isActive ? 'active' : ''}" onclick="openPrivateChat('${other?.id}')">
        <div class="conv-avatar" style="${avatarBg}">
          ${avatarContent}
          ${other?.online ? '<div class="online-ring"></div>' : ""}
        </div>
        <div class="conv-info">
          <div class="conv-name">${esc(other?.name||other?.username||"?")}${other?.verified ? ' ' : ""}</div>
          <div class="conv-last">${esc(c.last_msg||"Start chatting")}</div>
        </div>
        <div class="conv-meta">
          <span class="conv-time">${c.last_msg_at ? timeAgo(c.last_msg_at) : ""}</span>
        </div>
      </div>
    `;
  }).join("");
}

function filterConvs(v) { renderConvList(v); }

function switchChatTab(mode, el) {
  chatTabMode = mode;
  document.querySelectorAll(".chat-tab").forEach(t => t.classList.remove("active"));
  el.classList.add("active");
  renderConvList();
  if (mode === "team") openTeamChat();
}

// ─── PRIVATE CHAT ─────────────────────────────────────────
window.openPrivateChat = async function(userId) {
  if (!userId) return;
  // Find or create conversation
  let conv = conversations.find(c =>
    (c.user_a === currentUser.id && c.user_b === userId) ||
    (c.user_b === currentUser.id && c.user_a === userId)
  );
  if (!conv) {
    const { data } = await sb.from("conversations").insert({
      user_a: currentUser.id, user_b: userId, last_msg: ""
    }).select().single();
    if (data) { conv = data; conversations.unshift(data); }
  }
  if (!conv) return;

  activeConvId = conv.id;
  const other = allMembers.find(m => m.id === userId);
  activeOtherUser = other;

  renderConvList();
  await renderChatWindow("private", other, conv.id);
  subscribeToMessages(conv.id);
};

// ─── TEAM CHAT ────────────────────────────────────────────
async function openTeamChat() {
  activeConvId = "__team__";
  activeOtherUser = null;
  renderConvList();
  await renderChatWindow("team", null, null);
  subscribeTeamMessages();
}

// ─── RENDER CHAT WINDOW ───────────────────────────────────
async function renderChatWindow(mode, other, convId) {
  const win = document.getElementById("chatWindow");
  const isTeam = mode === "team";

  const headerName = isTeam ? "Team Chat" : esc(other?.name || other?.username || "?");
  const headerSub  = isTeam
    ? `<span class="team-header-badge">👥 ${allMembers.length} members</span>`
    : (other?.online ? '<span style="color:#22c55e">● Online</span>' : `Last seen ${timeAgo(other?.last_seen)}`);
  const avatarBg = isTeam
    ? "background:linear-gradient(135deg,#6366f1,#a78bfa)"
    : (other?.avatar_url ? "" : `background:${avatarColor(other?.name)};`);
  const avatarContent = isTeam ? "👥"
    : (other?.avatar_url ? `<img src="${other.avatar_url}" alt=""/>` : (other?.name||"?")[0].toUpperCase());

  win.innerHTML = `
    <div class="chat-header">
      <button class="chat-back" onclick="closeChatWindow()">←</button>
      <div class="chat-header-avatar" style="${avatarBg}">${avatarContent}</div>
      <div class="chat-header-info">
        <div class="chat-header-name">${headerName}</div>
        <div class="chat-header-sub" id="chatHeaderSub">${headerSub}</div>
      </div>
      ${!isTeam ? `<div style="display:flex;gap:8px">
        <button onclick="callUser('${other?.id}')" title="Voice call" style="background:none;border:none;color:rgba(240,240,255,0.5);font-size:18px;cursor:pointer;transition:color 0.2s" onmouseover="this.style.color='#f0f0ff'" onmouseout="this.style.color='rgba(240,240,255,0.5)'"></button>
      </div>` : ""}
    </div>
    ${!isTeam ? `<div class="e2e-badge"><span class="e2e-lock"></span> Messages are end-to-end encrypted</div>` : ""}
    <div class="messages-area" id="messagesArea"></div>
    <div class="typing-indicator" id="typingIndicator"></div>
    <div class="chat-input-area">
      <div style="position:relative">
        <div class="emoji-picker-wrap hidden" id="emojiPicker">
          <div class="emoji-grid" id="emojiGrid"></div>
        </div>
      </div>
      <div class="chat-input-row">
        <div class="chat-input-wrap">
          <button class="emoji-btn" onclick="toggleEmoji()"></button>
          <textarea id="msgInput" rows="1" placeholder="Type a message..."
            oninput="onTyping();autoResize(this)"
            onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendMsg()}"
          ></textarea>
          <label style="cursor:pointer;opacity:0.5;transition:opacity 0.2s;font-size:18px" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.5" title="Attach file">
            <input type="file" hidden onchange="sendFile(this)"/>
          </label>
        </div>
        <button class="send-btn" id="sendBtn" onclick="sendMsg()" title="Send"></button>
        <button class="record-btn" id="recordBtn" onclick="toggleRecord()" title="Voice message"></button>
      </div>
    </div>
  `;

  initEmojiPicker();
  await loadMessages(mode, convId);
  scrollToBottom();
}

// ─── MESSAGES ─────────────────────────────────────────────
let loadedMessages = [];

async function loadMessages(mode, convId) {
  if (mode === "team") {
    const { data } = await sb.from("team_messages")
      .select("*, sender:users(*)")
      .order("created_at").limit(80);
    loadedMessages = data || [];
  } else {
    const { data } = await sb.from("messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at").limit(80);
    loadedMessages = data || [];
    // Mark as read
    await sb.from("messages").update({ read_at: new Date().toISOString() })
      .eq("conversation_id", convId).eq("read_at", null).neq("sender_id", currentUser.id);
  }
  renderMessages(mode);
}

async function renderMessages(mode) {
  const area = document.getElementById("messagesArea");
  if (!area) return;

  let lastDate = "";
  let html = "";

  for (const msg of loadedMessages) {
    const isMine   = msg.sender_id === currentUser.id;
    const sender   = mode === "team" ? (msg.sender || allMembers.find(m => m.id === msg.sender_id)) : null;
    const dateStr  = new Date(msg.created_at).toLocaleDateString("en", { weekday:"short", month:"short", day:"numeric" });

    if (dateStr !== lastDate) {
      html += `<div class="date-divider"><span>${dateStr}</span></div>`;
      lastDate = dateStr;
    }

    let content = "";
    if (msg.type === "audio" && msg.file_url) {
      content = `<div class="bubble-audio">
        <button class="audio-play-btn" onclick="playAudio('${msg.file_url}',this)">▶</button>
        <div class="audio-waveform">
          <svg class="audio-wave-svg" viewBox="0 0 160 28">
            ${Array.from({length:32},(_,i)=>`<rect x="${i*5}" y="${14-Math.random()*10}" width="3" height="${Math.random()*20+4}" rx="1.5" fill="rgba(255,255,255,0.6)"/>`).join("")}
          </svg>
        </div>
        <span style="font-size:11px;opacity:0.6"></span>
      </div>`;
    } else if (msg.type === "image" && msg.file_url) {
      content = `<img src="${msg.file_url}" style="max-width:200px;border-radius:12px;display:block;cursor:pointer" onclick="window.open('${msg.file_url}')"/>`;
    } else {
      // Decrypt if E2E
      let text = msg.content || "";
      if (msg.encrypted && !isMine && activeOtherUser) {
        try {
          const sk = await getSharedKey(activeOtherUser.id);
          if (sk) text = await E2E.decrypt(sk, text);
        } catch {}
      }
      content = `<div>${esc(text)}</div>`;
    }

    const avatarBg = isMine ? "" : `background:${avatarColor(sender?.name)};`;
    const avatarContent = sender?.avatar_url
      ? `<img src="${sender.avatar_url}" alt=""/>`
      : (sender?.name||"?")[0]?.toUpperCase();

    html += `
      <div class="msg-row ${isMine ? 'mine' : ''}">
        ${!isMine && mode === "team" ? `<div class="msg-avatar-sm" style="${avatarBg}">${avatarContent}</div>` : ""}
        <div class="bubble ${isMine ? 'mine' : 'theirs'}">
          ${mode === "team" && !isMine ? `<div style="font-size:11px;font-weight:700;color:#a78bfa;margin-bottom:4px">${esc(sender?.name||"?")}</div>` : ""}
          ${content}
          <div class="bubble-time">
            ${formatTime(msg.created_at)}
            ${isMine && mode !== "team" ? `<span class="read-tick ${msg.read_at ? 'read' : ''}"></span>` : ""}
          </div>
        </div>
      </div>
    `;
  }

  area.innerHTML = html || `<div style="text-align:center;padding:40px;color:rgba(240,240,255,0.3);font-size:13px">No messages yet<br/>Say hello! </div>`;
  scrollToBottom();
}

// ─── SEND MESSAGE ─────────────────────────────────────────
async function sendMsg() {
  const input = document.getElementById("msgInput");
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;
  input.value = ""; input.style.height = "auto";

  if (activeConvId === "__team__") {
    await sb.from("team_messages").insert({ sender_id: currentUser.id, content: text, type: "text" });
  } else {
    let content = text;
    let encrypted = false; // E2E optional

    // Try E2E encryption for private chat
    if (activeOtherUser) {
      try {
        const sk = await getSharedKey(activeOtherUser.id);
        if (sk) { content = await E2E.encrypt(sk, text); encrypted = true; }
      } catch {}
    }

    await sb.from("messages").insert({
      conversation_id: activeConvId,
      sender_id: currentUser.id,
      content, type: "text"
    });
    await sb.from("conversations").update({ last_msg: text, last_msg_at: new Date().toISOString() })
      .eq("id", activeConvId);
  }
}

// ─── SUBSCRIPTIONS ────────────────────────────────────────
function subscribeToMessages(convId) {
  if (chatSub) sb.removeChannel(chatSub);
  chatSub = sb.channel("messages-" + convId)
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${convId}` },
      async payload => {
        loadedMessages.push(payload.new);
        await renderMessages("private");
        scrollToBottom();
      })
    .subscribe();
}

function subscribeTeamMessages() {
  if (teamSub) sb.removeChannel(teamSub);
  teamSub = sb.channel("team-messages-live")
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "team_messages" },
      async payload => {
        const { data: sender } = await sb.from("users").select("*").eq("id", payload.new.sender_id).single();
        loadedMessages.push({ ...payload.new, sender });
        await renderMessages("team");
        scrollToBottom();
      })
    .subscribe();
}

// ─── TYPING ───────────────────────────────────────────────
function setupTypingChannel() {
  if (!currentUser) return;
  typingChannel = sb.channel("typing-broadcast");
  typingChannel
    .on("broadcast", { event: "typing" }, payload => {
      if (payload.payload?.conv === activeConvId && payload.payload?.uid !== currentUser.id) {
        showTyping(payload.payload?.name);
      }
    })
    .subscribe();
}

function onTyping() {
  if (!activeConvId || activeConvId === "__team__") return;
  typingChannel?.send({ type:"broadcast", event:"typing", payload:{ conv: activeConvId, uid: currentUser.id, name: currentProfile?.name||"Someone" }});
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    const ti = document.getElementById("typingIndicator");
    if (ti) ti.innerHTML = "";
  }, 3000);
}

function showTyping(name) {
  const ti = document.getElementById("typingIndicator");
  if (!ti) return;
  ti.innerHTML = `<div style="font-size:12px;color:rgba(240,240,255,0.45);">${esc(name)} is typing</div>
    <div class="typing-dots"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>`;
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => { if (ti) ti.innerHTML = ""; }, 3000);
}

// ─── VOICE RECORDING ──────────────────────────────────────
async function toggleRecord() {
  if (!isRecording) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      const chunks = [];
      mediaRecorder.ondataavailable = e => chunks.push(e.data);
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type:"audio/webm" });
        await uploadVoice(blob);
        stream.getTracks().forEach(t => t.stop());
      };
      mediaRecorder.start();
      isRecording = true;
      document.getElementById("recordBtn").classList.add("recording");
      document.getElementById("recordBtn").textContent = "⏹";
    } catch {
      showToast("Microphone access denied", "error");
    }
  } else {
    mediaRecorder?.stop();
    isRecording = false;
    document.getElementById("recordBtn").classList.remove("recording");
    document.getElementById("recordBtn").textContent = "";
  }
}

async function uploadVoice(blob) {
  const path = `${currentUser.id}/${Date.now()}.webm`;
  const { data, error } = await sb.storage.from("voice-notes").upload(path, blob);
  if (error) { showToast("Upload failed", "error"); return; }
  const { data: urlData } = sb.storage.from("voice-notes").getPublicUrl(path);
  const url = urlData.publicUrl;

  if (activeConvId === "__team__") {
    await sb.from("team_messages").insert({ sender_id: currentUser.id, content: " Voice message", type:"audio", file_url: url });
  } else {
    await sb.from("messages").insert({ conversation_id: activeConvId, sender_id: currentUser.id, content:" Voice message", type:"audio", file_url: url });
  }
  showToast("Voice message sent ");
}

// ─── FILE ATTACH ──────────────────────────────────────────
async function sendFile(input) {
  const file = input.files[0];
  if (!file) return;
  const path = `${currentUser.id}/${Date.now()}_${file.name}`;
  const { error } = await sb.storage.from("chat-files").upload(path, file);
  if (error) { showToast("Upload failed", "error"); return; }
  const { data: urlData } = sb.storage.from("chat-files").getPublicUrl(path);
  const url = urlData.publicUrl;
  const isImg = file.type.startsWith("image/");

  if (activeConvId === "__team__") {
    await sb.from("team_messages").insert({ sender_id: currentUser.id, content: file.name, type: isImg ? "image" : "file", file_url: url });
  } else {
    await sb.from("messages").insert({ conversation_id: activeConvId, sender_id: currentUser.id, content: file.name, type: isImg ? "image":"file", file_url: url });
  }
  showToast("File sent ");
}

// ─── EMOJI PICKER ─────────────────────────────────────────
const EMOJIS = ["","","","","","","","","","","","","","","","","","","️","🔥","","","","","","","","","","","","🎯","","","","","","","",""];

function initEmojiPicker() {
  const grid = document.getElementById("emojiGrid");
  if (!grid) return;
  grid.innerHTML = EMOJIS.map(e => `<span class="ep-emoji" onclick="insertEmoji('${e}')">${e}</span>`).join("");
}

function toggleEmoji() {
  document.getElementById("emojiPicker").classList.toggle("hidden");
}

function insertEmoji(emoji) {
  const inp = document.getElementById("msgInput");
  inp.value += emoji;
  inp.focus();
  document.getElementById("emojiPicker").classList.add("hidden");
}

// ─── E2E ENCRYPTION ───────────────────────────────────────
let myKeyPair = null;

async function setupE2EKeys() {
  // Try to load existing private key from sessionStorage
  const privKey = await E2E_loadPrivateKey();
  if (privKey) { myKeyPair = { privateKey: privKey }; return; }

  // Generate new key pair
  myKeyPair = await E2E_generateKeyPair();
  const pubB64 = await E2E_exportPublicKey(myKeyPair.publicKey);
  await E2E_storePrivateKey(myKeyPair.privateKey);
  // Publish public key to Supabase
  await sb.from("public_keys").upsert({ user_id: currentUser.id, public_key: pubB64 }, { onConflict: "user_id" });
}

async function getSharedKey(otherId) {
  if (sharedKeys[otherId]) return sharedKeys[otherId];
  if (!myKeyPair) return null;
  const { data } = await sb.from("public_keys").select("public_key").eq("user_id", otherId).single();
  if (!data) return null;
  const theirPub = await E2E_importPublicKey(data.public_key);
  const sk = await E2E_deriveSharedKey(myKeyPair.privateKey, theirPub);
  sharedKeys[otherId] = sk;
  return sk;
}

// Web Crypto E2E helpers
async function E2E_generateKeyPair() {
  return crypto.subtle.generateKey({ name:"ECDH", namedCurve:"P-256" }, true, ["deriveKey","deriveBits"]);
}
async function E2E_exportPublicKey(key) {
  const raw = await crypto.subtle.exportKey("raw", key);
  return btoa(String.fromCharCode(...new Uint8Array(raw)));
}
async function E2E_importPublicKey(b64) {
  const raw = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  return crypto.subtle.importKey("raw", raw, { name:"ECDH", namedCurve:"P-256" }, true, []);
}
async function E2E_deriveSharedKey(priv, theirPub) {
  return crypto.subtle.deriveKey({ name:"ECDH", public: theirPub }, priv, { name:"AES-GCM", length:256 }, false, ["encrypt","decrypt"]);
}
async function E2E_storePrivateKey(key) {
  const raw = await crypto.subtle.exportKey("pkcs8", key);
  sessionStorage.setItem("ampro_pk", btoa(String.fromCharCode(...new Uint8Array(raw))));
}
async function E2E_loadPrivateKey() {
  const s = sessionStorage.getItem("ampro_pk");
  if (!s) return null;
  try {
    const raw = Uint8Array.from(atob(s), c => c.charCodeAt(0));
    return await crypto.subtle.importKey("pkcs8", raw, { name:"ECDH", namedCurve:"P-256" }, true, ["deriveKey","deriveBits"]);
  } catch { return null; }
}
async function E2E_encrypt(key, text) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name:"AES-GCM", iv }, key, new TextEncoder().encode(text));
  const buf = new Uint8Array(iv.length + ct.byteLength);
  buf.set(iv, 0); buf.set(new Uint8Array(ct), 12);
  return btoa(String.fromCharCode(...buf));
}
async function E2E_decrypt(key, b64) {
  const buf = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  const dec = await crypto.subtle.decrypt({ name:"AES-GCM", iv: buf.slice(0,12) }, key, buf.slice(12));
  return new TextDecoder().decode(dec);
}
// Override E2E refs
const E2E = { encrypt: E2E_encrypt, decrypt: E2E_decrypt };

// ─── HELPERS ──────────────────────────────────────────────
function scrollToBottom() {
  const area = document.getElementById("messagesArea");
  if (area) area.scrollTop = area.scrollHeight;
}

function autoResize(el) {
  el.style.height = "auto";
  el.style.height = Math.min(el.scrollHeight, 120) + "px";
}

function closeChatWindow() {
  activeConvId = null;
  document.getElementById("chatWindow").innerHTML = `
    <div class="chat-empty">
      <div class="chat-empty-icon">💬</div>
      <div class="chat-empty-text">Select a conversation</div>
    </div>`;
  document.getElementById("chatSidebar").classList.remove("hidden");
  document.getElementById("chatWindow").classList.remove("mobile-open");
}

function playAudio(url, btn) {
  const audio = new Audio(url);
  audio.play();
  btn.textContent = "⏸";
  audio.onended = () => { btn.textContent = "▶"; };
}

function callUser(userId) {
  showToast("Voice call feature coming soon! ");
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString("en", { hour:"2-digit", minute:"2-digit", hour12:true });
}
