// ============================================================
// CHAT SYSTEM
// ============================================================
async function loadCommunityMessages() {
  const el = document.getElementById("communityMessages");
  if (!el) return;
  const { data } = await sb.from("messages")
    .select("*,sender:users(id,name,username,avatar_url,role,verified)")
    .eq("channel","community").eq("deleted",false)
    .order("created_at",{ ascending:true }).limit(80);
  communityMessages = data || [];
  el.innerHTML = "";
  if (!communityMessages.length) {
    el.innerHTML = `<div class="empty-state"><div class="empty-state-icon">💬</div><div class="empty-state-title">No messages yet</div><div class="empty-state-desc">Be the first to say something!</div></div>`;
    return;
  }
  communityMessages.forEach(m => el.insertAdjacentHTML("beforeend", messageBubbleHTML(m,"community")));
  scrollToBottom("communityMessages");
  const lastEl = document.getElementById("communityLastMsg");
  if (lastEl && communityMessages.length) lastEl.textContent = communityMessages[communityMessages.length-1].content || "📎 Media";
}

function messageBubbleHTML(m, chatType) {
  const isMe   = m.sender_id === currentUser?.id;
  const sender = m.sender || allMembers.find(x => x.id === m.sender_id);
  const c      = avatarColor(sender?.name);

  if (m.type === "sticker") {
    return `<div class="msg-bubble-wrap ${isMe?"mine":""}" id="msg-${m.id}" data-id="${m.id}" oncontextmenu="showMsgCtx(event,'${esc(m.id)}','${chatType}')">
      ${!isMe?`<div class="msg-avatar" style="background:${c}22">${avatarInnerHTML(sender||{})}</div>`:""}
      <div class="msg-body">
        ${!isMe?`<span class="msg-sender">${esc(sender?.name||"—")}</span>`:""}
        <div class="msg-sticker" ondblclick="quickReact('${esc(m.id)}','❤️','${chatType}')">${m.sticker_id||"👋"}</div>
        <div class="msg-reactions" id="react-${m.id}">${reactionsHTML(m.reactions)}</div>
      </div>
    </div>`;
  }

  if (m.type==="image"||m.type==="video") {
    const media = m.type==="image"
      ? `<img class="msg-image" src="${esc(m.media_url)}" loading="lazy" onclick="viewMedia('${esc(m.media_url)}')" />`
      : `<video src="${esc(m.media_url)}" controls style="max-width:240px;max-height:200px;border-radius:12px;display:block"></video>`;
    return `<div class="msg-bubble-wrap ${isMe?"mine":""}" id="msg-${m.id}">
      ${!isMe?`<div class="msg-avatar" style="background:${c}22">${avatarInnerHTML(sender||{})}</div>`:""}
      <div class="msg-body">
        ${!isMe?`<span class="msg-sender">${esc(sender?.name||"—")}</span>`:""}
        <div ondblclick="quickReact('${esc(m.id)}','❤️','${chatType}')">${media}</div>
        <span style="font-size:10px;color:var(--text-muted)">${fmtTime(m.created_at)}</span>
        <div class="msg-reactions" id="react-${m.id}">${reactionsHTML(m.reactions)}</div>
      </div>
    </div>`;
  }

  if (m.type==="voice") {
    return `<div class="msg-bubble-wrap ${isMe?"mine":""}" id="msg-${m.id}">
      ${!isMe?`<div class="msg-avatar" style="background:${c}22">${avatarInnerHTML(sender||{})}</div>`:""}
      <div class="msg-body">
        ${!isMe?`<span class="msg-sender">${esc(sender?.name||"—")}</span>`:""}
        <div class="voice-msg">
          <button class="voice-play-btn" onclick="playVoice('${esc(m.media_url)}',this)"><i class="fa-solid fa-play"></i></button>
          <div class="voice-waveform">${"<span></span>".repeat(12)}</div>
          <button class="voice-speed-btn" onclick="cycleSpeed(this)" data-url="${esc(m.media_url)}">1x</button>
        </div>
        <span style="font-size:10px;color:var(--text-muted)">${fmtTime(m.created_at)}</span>
      </div>
    </div>`;
  }

  // Text
  const replyBlock = m.reply_to
    ? `<div class="msg-reply-preview">↩ Replying to a message</div>` : "";
  const html = (m.content||"")
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/@(\w+)/g,`<span style="color:var(--blue);font-weight:600">@$1</span>`);

  return `<div class="msg-bubble-wrap ${isMe?"mine":""}" id="msg-${m.id}" data-id="${m.id}"
    oncontextmenu="showMsgCtx(event,'${esc(m.id)}','${chatType}')">
    ${!isMe?`<div class="msg-avatar" style="background:${c}22">${avatarInnerHTML(sender||{})}</div>`:""}
    <div class="msg-body">
      ${!isMe?`<span class="msg-sender">${esc(sender?.name||"—")}${sender?.verified?`<i class="fa-solid fa-circle-check" style="color:var(--blue);font-size:10px;margin-left:3px"></i>`:""}</span>`:""}
      <div class="msg-bubble" ondblclick="quickReact('${esc(m.id)}','❤️','${chatType}')">
        ${replyBlock}
        ${html}
        <span class="msg-time">${fmtTime(m.created_at)}</span>
      </div>
      <div class="msg-reactions" id="react-${m.id}">${reactionsHTML(m.reactions)}</div>
      ${isMe?`<div class="seen-indicator">${m.seen?"✓✓":"✓"}</div>`:""}
    </div>
  </div>`;
}

function reactionsHTML(reactions) {
  if (!reactions || typeof reactions!=="object") return "";
  return Object.entries(reactions).filter(([,v])=>v>0)
    .map(([emoji,count]) => `<button class="reaction-pill">${emoji} <span class="count">${count}</span></button>`)
    .join("");
}

window.quickReact = async function(msgId, emoji, chatType) {
  const pool = chatType==="community" ? communityMessages : (dmMessages[currentDmUserId]||[]);
  const msg  = pool.find(m => m.id === msgId);
  if (!msg) return;
  const reactions = { ...(msg.reactions||{}) };
  reactions[emoji] = (reactions[emoji]||0)+1;
  await sb.from("messages").update({ reactions }).eq("id", msgId);
  msg.reactions = reactions;
  const el = document.getElementById("react-"+msgId);
  if (el) el.innerHTML = reactionsHTML(reactions);
};

window.showMsgCtx = function(e, msgId, chatType) {
  e.preventDefault();
  const pool = chatType==="community" ? communityMessages : (dmMessages[currentDmUserId]||[]);
  const msg  = pool.find(m => m.id === msgId);
  if (!msg) return;
  replyingTo[chatType] = msg;
  const preview = document.getElementById(`replyPreview-${chatType}`);
  const text    = document.getElementById(`replyPreviewText-${chatType}`);
  if (preview && text) {
    text.textContent = "↩ " + (msg.content||msg.type||"message").substring(0,50);
    preview.style.display = "flex";
  }
  // Emoji quick-react strip
  const existing = document.getElementById("msgCtxMenu");
  if (existing) existing.remove();
  const menu = document.createElement("div");
  menu.id = "msgCtxMenu";
  menu.style.cssText = "position:fixed;background:#13131f;border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:8px;display:flex;gap:4px;z-index:600;box-shadow:0 8px 24px rgba(0,0,0,.5)";
  menu.style.left = Math.min(e.clientX, window.innerWidth-220) + "px";
  menu.style.top  = (e.clientY - 50) + "px";
  ["👍","❤️","😂","🔥","✅","😮"].forEach(em => {
    const btn = document.createElement("button");
    btn.textContent = em;
    btn.style.cssText = "font-size:20px;background:none;border:none;cursor:pointer;border-radius:6px;padding:4px;width:34px;height:34px";
    btn.onmouseenter = () => btn.style.background = "rgba(255,255,255,.1)";
    btn.onmouseleave = () => btn.style.background = "none";
    btn.onclick = () => { quickReact(msgId, em, chatType); menu.remove(); };
    menu.appendChild(btn);
  });
  document.body.appendChild(menu);
  setTimeout(() => document.addEventListener("click", () => menu.remove(), { once:true }), 50);
};

window.handleMsgKey = function(e, chatType) {
  if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(chatType); }
};

window.autoResize = function(el) {
  el.style.height = "auto";
  el.style.height = Math.min(el.scrollHeight, 120) + "px";
};

window.sendMessage = async function(chatType) {
  const inputId = chatType==="community" ? "communityMsgInput" : "dmMsgInput";
  const input   = document.getElementById(inputId);
  const text    = input?.value?.trim();
  if (!text || !currentUser) return;
  input.value = ""; input.style.height = "auto";

  const reply = replyingTo[chatType];
  cancelReply(chatType);

  const payload = {
    sender_id:   currentUser.id,
    receiver_id: chatType==="dm" ? currentDmUserId : null,
    channel:     chatType==="dm" ? "dm" : "community",
    content:     text,
    type:        "text",
    reply_to:    reply?.id || null,
    reactions:   {}
  };

  const { data: newMsg, error } = await sb.from("messages")
    .insert(payload).select("*,sender:users(id,name,username,avatar_url,role,verified)").single();
  if (error) { toast("Failed to send","error"); return; }

  if (chatType==="community") {
    communityMessages.push(newMsg);
    const el = document.getElementById("communityMessages");
    if (el) {
      const wasEmpty = el.querySelector(".empty-state");
      if (wasEmpty) el.innerHTML = "";
      el.insertAdjacentHTML("beforeend", messageBubbleHTML(newMsg,"community"));
      scrollToBottom("communityMessages");
    }
    const lastEl = document.getElementById("communityLastMsg");
    if (lastEl) lastEl.textContent = text.substring(0,40);
  } else {
    if (!dmMessages[currentDmUserId]) dmMessages[currentDmUserId] = [];
    dmMessages[currentDmUserId].push(newMsg);
    const el = document.getElementById("dmMessages");
    if (el) {
      document.getElementById("firstTimeStickers").style.display = "none";
      el.insertAdjacentHTML("beforeend", messageBubbleHTML(newMsg,"dm"));
      scrollToBottom("dmMessages");
    }
    if (currentDmUserId !== currentUser.id)
      await sb.from("notifications").insert({ user_id:currentDmUserId, type:"message", title:"New message from "+currentUser.name, body:text.substring(0,80) });
  }
};

window.cancelReply = function(chatType) {
  replyingTo[chatType] = null;
  const el = document.getElementById(`replyPreview-${chatType}`);
  if (el) el.style.display = "none";
};

async function scrollToBottom(elId) {
  await new Promise(r => setTimeout(r,30));
  const el = document.getElementById(elId);
  if (el) el.scrollTop = el.scrollHeight;
}

// ── DM ──
function loadDmList() {
  if (!currentUser) return;
  const el = document.getElementById("dmList");
  if (!el) return;
  const others = allMembers.filter(m => m.id !== currentUser.id);
  if (!others.length) { el.innerHTML=`<div class="empty-mini">No other members yet</div>`; return; }
  el.innerHTML = others.map(m => {
    const c = avatarColor(m.name);
    return `<div class="chat-item" id="dm-item-${m.id}" onclick="startDm('${esc(m.id)}')">
      <div class="chat-item-avatar" style="background:${c}22">${avatarInnerHTML(m)}</div>
      <div class="chat-item-info">
        <div class="chat-item-name">${esc(m.name||"—")}${m.verified?`<i class="fa-solid fa-circle-check" style="color:var(--blue);font-size:10px;margin-left:3px"></i>`:""}</div>
        <div class="chat-item-preview">${getRoleInfo(m.role).label}</div>
      </div>
      <div class="chat-item-meta">${m.online?`<span class="online-dot"></span>`:`<span class="offline-dot"></span>`}</div>
    </div>`;
  }).join("");
}

window.startDm = async function(userId) {
  currentDmUserId = userId;
  currentDmUser   = allMembers.find(m => m.id===userId);
  if (!currentDmUser) return;
  currentChatMode = "dm";

  document.querySelectorAll(".chat-item").forEach(el => el.classList.remove("active"));
  const item = document.getElementById("dm-item-"+userId);
  if (item) { item.classList.add("active"); item.querySelector(".unread-dot")?.remove(); }

  // Switch panels
  const cvComm = document.getElementById("chatView-community");
  const cvDm   = document.getElementById("chatView-dm");
  if (cvComm) cvComm.classList.remove("active");
  if (cvDm)   { cvDm.style.display="flex"; cvDm.classList.add("active"); }

  document.getElementById("chatSidebar").classList.add("dm-open");

  // Update DM header
  const c = avatarColor(currentDmUser.name);
  const hAv = document.getElementById("dmHeaderAvatar");
  hAv.style.background = c+"22";
  hAv.innerHTML = avatarInnerHTML(currentDmUser);
  document.getElementById("dmHeaderName").textContent = currentDmUser.name||"—";
  document.getElementById("dmHeaderStatus").innerHTML = currentDmUser.online
    ? `<span class="online-dot"></span> Online`
    : `<span class="offline-dot"></span> ${timeAgo(currentDmUser.last_seen)||"Offline"}`;

  await loadDmMessages(userId);
};

async function loadDmMessages(userId) {
  const el = document.getElementById("dmMessages");
  if (!el) return;
  el.innerHTML = `<div class="messages-loading"><div class="skeleton-block" style="height:50px;border-radius:12px;margin-bottom:8px"></div><div class="skeleton-block" style="height:36px;border-radius:12px;width:65%"></div></div>`;

  const { data } = await sb.from("messages")
    .select("*,sender:users(id,name,username,avatar_url,role,verified)")
    .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${currentUser.id})`)
    .eq("deleted",false).order("created_at",{ ascending:true }).limit(80);

  dmMessages[userId] = data || [];
  await sb.from("messages").update({ seen:true, seen_at:new Date().toISOString() })
    .eq("sender_id",userId).eq("receiver_id",currentUser.id).eq("seen",false);

  el.innerHTML = "";
  if (!data?.length) {
    document.getElementById("firstTimeStickers").style.display = "flex";
    return;
  }
  document.getElementById("firstTimeStickers").style.display = "none";
  data.forEach(m => el.insertAdjacentHTML("beforeend", messageBubbleHTML(m,"dm")));
  scrollToBottom("dmMessages");
}

window.backToList = function() {
  document.getElementById("chatSidebar").classList.remove("dm-open");
  const cvComm = document.getElementById("chatView-community");
  const cvDm   = document.getElementById("chatView-dm");
  if (cvDm)   { cvDm.classList.remove("active"); cvDm.style.display="none"; }
  if (cvComm) cvComm.classList.add("active");
  currentChatMode = "community";
};

window.switchChatView = function(mode) {
  if (mode==="community") {
    backToList();
    document.querySelectorAll(".chat-item").forEach(el => el.classList.remove("active"));
    document.querySelector(".community-chat-item")?.classList.add("active");
  }
};

window.filterConversations = function() {
  const q = document.getElementById("chatSearch").value.toLowerCase();
  document.querySelectorAll("#dmList .chat-item").forEach(el => {
    el.style.display = (el.querySelector(".chat-item-name")?.textContent||"").toLowerCase().includes(q) ? "" : "none";
  });
};

// ── STICKERS ──
const STICKER_CATS = {
  "Greetings": ["👋","🤝","🙌","🫡","💐","🎉","🥳","🫶","🙏","🤜"],
  "Funny":     ["😂","🤣","😅","🫠","🙈","🤡","😜","🫣","😝","🤪"],
  "Happy":     ["😊","🥰","😍","🤩","😎","🥹","💛","✨","🌟","💫"],
  "Gaming":    ["🎮","🕹️","🏆","🎯","⚡","🔥","💀","🎲","🃏","⚔️"],
  "Team":      ["💼","🚀","💡","🛠️","📋","🎨","💻","🏗️","📈","🔑"]
};

window.toggleStickerPanel = function(chatType) {
  activeStickerTarget = chatType;
  const panel = document.getElementById("stickerPanel");
  if (panel.style.display==="none") {
    panel.style.display = "block";
    renderStickerPanel();
    document.getElementById("emojiPanel").style.display = "none";
  } else panel.style.display = "none";
};

function renderStickerPanel() {
  document.getElementById("stickerTabs").innerHTML = Object.keys(STICKER_CATS).map(cat =>
    `<button class="sticker-tab ${cat===currentStickerCat?"active":""}" onclick="switchStickerCat('${cat}')">${cat}</button>`
  ).join("");
  document.getElementById("stickerGrid").innerHTML = (STICKER_CATS[currentStickerCat]||[]).map(s =>
    `<button class="sticker-btn-item" onclick="sendSticker('${s}')">${s}</button>`
  ).join("");
}

window.switchStickerCat = function(cat) { currentStickerCat = cat; renderStickerPanel(); };

window.sendSticker = async function(sticker) {
  document.getElementById("stickerPanel").style.display = "none";
  if (!currentUser) return;
  const payload = {
    sender_id:   currentUser.id,
    receiver_id: activeStickerTarget==="dm" ? currentDmUserId : null,
    channel:     activeStickerTarget==="dm" ? "dm" : "community",
    content:     sticker, type:"sticker", sticker_id:sticker, reactions:{}
  };
  const { data: newMsg } = await sb.from("messages")
    .insert(payload).select("*,sender:users(id,name,username,avatar_url,role,verified)").single();
  if (!newMsg) return;
  if (activeStickerTarget==="community") {
    communityMessages.push(newMsg);
    const el = document.getElementById("communityMessages");
    if (el) { el.insertAdjacentHTML("beforeend", messageBubbleHTML(newMsg,"community")); scrollToBottom("communityMessages"); }
  } else {
    if (!dmMessages[currentDmUserId]) dmMessages[currentDmUserId]=[];
    dmMessages[currentDmUserId].push(newMsg);
    document.getElementById("firstTimeStickers").style.display="none";
    const el = document.getElementById("dmMessages");
    if (el) { el.insertAdjacentHTML("beforeend", messageBubbleHTML(newMsg,"dm")); scrollToBottom("dmMessages"); }
  }
};

window.sendQuickSticker = function(type) {
  const map = { wave:"👋", hi:"👋 Hi!", smile:"😊", welcome:"🤝" };
  activeStickerTarget = "dm";
  sendSticker(map[type]||"👋");
};

// ── EMOJI ──
const EMOJIS = ["😀","😂","🥰","😍","🤩","😎","🥳","🤔","😮","😱","❤️","🔥","✨","👍","👎","🎉","🙏","👏","💪","🚀","💡","✅","❌","⭐","🏆","📌","💬","🎯","🎨","🛠️","📊","🔐"];

window.toggleEmojiPicker = function(chatType) {
  activeEmojiTarget = chatType;
  const panel = document.getElementById("emojiPanel");
  if (panel.style.display==="none") {
    panel.style.display = "block";
    document.getElementById("emojiGrid").innerHTML = EMOJIS.map(e => `<button onclick="insertEmoji('${e}')">${e}</button>`).join("");
    document.getElementById("stickerPanel").style.display = "none";
  } else panel.style.display = "none";
};

window.insertEmoji = function(emoji) {
  const input = document.getElementById(activeEmojiTarget==="community"?"communityMsgInput":"dmMsgInput");
  if (input) input.value += emoji;
  document.getElementById("emojiPanel").style.display = "none";
};

document.addEventListener("click", e => {
  if (!e.target.closest(".emoji-btn")&&!e.target.closest("#emojiPanel")) document.getElementById("emojiPanel").style.display="none";
  if (!e.target.closest(".sticker-btn")&&!e.target.closest("#stickerPanel")) document.getElementById("stickerPanel").style.display="none";
});

// ── MEDIA ──
window.openImagePicker  = ct => { chatMediaTarget=ct; document.getElementById("chatImageInput").click(); };
window.openAttachment   = ct => { chatMediaTarget=ct; document.getElementById("chatFileInput").click(); };

window.sendMediaFile = async function(input) {
  const file = input.files[0];
  if (!file||!currentUser) return;
  input.value = "";
  const ext  = file.name.split(".").pop()||"bin";
  const path = `${currentUser.id}/${Date.now()}.${ext}`;
  const isVid = file.type.startsWith("video/");
  const { error:upErr } = await sb.storage.from("media").upload(path,file,{upsert:true});
  if (upErr) { toast("Upload failed","error"); return; }
  const { data:{publicUrl} } = sb.storage.from("media").getPublicUrl(path);
  const payload = {
    sender_id:   currentUser.id,
    receiver_id: chatMediaTarget==="dm" ? currentDmUserId : null,
    channel:     chatMediaTarget==="dm" ? "dm" : "community",
    content:     file.name, type: isVid?"video":"image", media_url:publicUrl, reactions:{}
  };
  const { data:newMsg } = await sb.from("messages").insert(payload).select("*,sender:users(id,name,username,avatar_url,role,verified)").single();
  if (!newMsg) return;
  const tgt  = chatMediaTarget==="community" ? "communityMessages" : "dmMessages";
  const tgtEl = document.getElementById(tgt);
  if (tgtEl) {
    if (chatMediaTarget==="dm") document.getElementById("firstTimeStickers").style.display="none";
    tgtEl.insertAdjacentHTML("beforeend", messageBubbleHTML(newMsg, chatMediaTarget));
    scrollToBottom(tgt);
  }
  if (chatMediaTarget==="community") communityMessages.push(newMsg);
  else { if (!dmMessages[currentDmUserId]) dmMessages[currentDmUserId]=[]; dmMessages[currentDmUserId].push(newMsg); }
};

window.sendFileAttachment = function(input) { if(input.files[0]) sendMediaFile({ files:input.files }); };

// ── VOICE RECORDING ──
const VOICE_SPEEDS = [1,1.5,2];
const voiceSpeedMap = {};

window.startVoiceRecording = async function(chatType) {
  voiceChatTarget = chatType;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio:true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks   = []; recSeconds = 0;
    mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
    mediaRecorder.start();
    document.getElementById("voiceRecordingUI").style.display = "flex";
    recTimer = setInterval(() => {
      recSeconds++;
      const m=Math.floor(recSeconds/60), s=recSeconds%60;
      document.getElementById("recordingTime").textContent = `${m}:${s.toString().padStart(2,"0")}`;
    }, 1000);
  } catch(e) { toast("Mic access denied","error"); }
};

window.stopRecording = async function() {
  if (!mediaRecorder) return;
  clearInterval(recTimer);
  document.getElementById("voiceRecordingUI").style.display = "none";
  mediaRecorder.stop();
  mediaRecorder.onstop = async () => {
    const blob = new Blob(audioChunks,{type:"audio/webm"});
    const path = `${currentUser.id}/voice-${Date.now()}.webm`;
    const { error } = await sb.storage.from("media").upload(path,blob);
    if (error) { toast("Voice upload failed","error"); return; }
    const { data:{publicUrl} } = sb.storage.from("media").getPublicUrl(path);
    const payload = {
      sender_id:   currentUser.id,
      receiver_id: voiceChatTarget==="dm"?currentDmUserId:null,
      channel:     voiceChatTarget==="dm"?"dm":"community",
      content:     "Voice message", type:"voice", media_url:publicUrl, reactions:{}
    };
    const { data:newMsg } = await sb.from("messages").insert(payload).select("*,sender:users(id,name,username,avatar_url,role,verified)").single();
    if (!newMsg) return;
    const tgt  = voiceChatTarget==="community"?"communityMessages":"dmMessages";
    const tEl  = document.getElementById(tgt);
    if (tEl) { tEl.insertAdjacentHTML("beforeend",messageBubbleHTML(newMsg,voiceChatTarget)); scrollToBottom(tgt); }
    toast("Voice message sent!","success");
  };
};

window.cancelRecording = function() {
  if (mediaRecorder) { try{mediaRecorder.stop();}catch(e){} }
  clearInterval(recTimer); audioChunks=[];
  document.getElementById("voiceRecordingUI").style.display="none";
};

window.playVoice = function(url, btn) {
  if (currentAudio && !currentAudio.paused) { currentAudio.pause(); btn.innerHTML='<i class="fa-solid fa-play"></i>'; return; }
  const audio = new Audio(url);
  currentAudio = audio;
  audio.playbackRate = VOICE_SPEEDS[voiceSpeedMap[url]||0];
  audio.play(); btn.innerHTML='<i class="fa-solid fa-pause"></i>';
  audio.onended = () => { currentAudio=null; btn.innerHTML='<i class="fa-solid fa-play"></i>'; };
};

window.cycleSpeed = function(btn) {
  const url = btn.dataset.url;
  voiceSpeedMap[url] = ((voiceSpeedMap[url]||0)+1)%VOICE_SPEEDS.length;
  if (currentAudio) currentAudio.playbackRate = VOICE_SPEEDS[voiceSpeedMap[url]];
  btn.textContent = VOICE_SPEEDS[voiceSpeedMap[url]]+"x";
};

window.viewMedia = function(url) {
  const ov = document.createElement("div");
  ov.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,.92);z-index:999;display:flex;align-items:center;justify-content:center;cursor:zoom-out;backdrop-filter:blur(8px)";
  ov.onclick = () => ov.remove();
  ov.innerHTML = `<img src="${esc(url)}" style="max-width:90vw;max-height:90vh;border-radius:12px;object-fit:contain;box-shadow:0 24px 80px rgba(0,0,0,.7)"/>`;
  document.body.appendChild(ov);
};

// ── TYPING (simulated) ──
const typingTimers = {};
window.broadcastTyping = function(chatType) {
  clearTimeout(typingTimers[chatType]);
  typingTimers[chatType] = setTimeout(() => {}, 2000);
};

