// ============================================================
// REALTIME
// ============================================================
function setupRealtime(uid) {
  // Community messages
  sb.channel("community-msgs")
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: "channel=eq.community" },
      async (payload) => {
        if (payload.new.sender_id === uid) return; // already shown
        const { data: full } = await sb.from("messages")
          .select("*,sender:users(id,name,username,avatar_url,role,verified)")
          .eq("id", payload.new.id).single();
        if (!full) return;
        communityMessages.push(full);
        const el = document.getElementById("communityMessages");
        if (el) { el.insertAdjacentHTML("beforeend", messageBubbleHTML(full, "community")); scrollToBottom("communityMessages"); }
        const lastEl = document.getElementById("communityLastMsg");
        if (lastEl) lastEl.textContent = full.content || "📎 Media";
      })
    .subscribe();

  // DM messages
  sb.channel("dm-msgs-" + uid)
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages",
        filter: `receiver_id=eq.${uid}` },
      async (payload) => {
        const msg = payload.new;
        if (msg.channel !== "dm") return;
        const senderId = msg.sender_id;
        const { data: full } = await sb.from("messages")
          .select("*,sender:users(id,name,username,avatar_url,role,verified)")
          .eq("id", msg.id).single();
        if (!full) return;
        if (!dmMessages[senderId]) dmMessages[senderId] = [];
        dmMessages[senderId].push(full);
        if (currentDmUserId === senderId && currentChatMode === "dm") {
          const el = document.getElementById("dmMessages");
          if (el) { el.insertAdjacentHTML("beforeend", messageBubbleHTML(full, "dm")); scrollToBottom("dmMessages"); }
          // Mark seen
          await sb.from("messages").update({ seen: true, seen_at: new Date().toISOString() }).eq("id", msg.id);
        } else {
          // Show unread badge
          const item = document.getElementById("dm-item-" + senderId);
          if (item) {
            let dot = item.querySelector(".unread-dot");
            if (!dot) { dot = document.createElement("span"); dot.className = "nav-badge unread unread-dot"; dot.textContent = "1"; item.appendChild(dot); }
          }
          toast(`New message from ${full.sender?.name || "someone"}`, "info");
        }
      })
    .subscribe();

  // Notifications
  sb.channel("notifs-" + uid)
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${uid}` },
      (payload) => {
        const notif = payload.new;
        prependNotification(notif);
        updateNotifBadge([notif], true);
      })
    .subscribe();

  // Member presence
  sb.channel("users-presence")
    .on("postgres_changes", { event: "UPDATE", schema: "public", table: "users" },
      (payload) => {
        const idx = allMembers.findIndex(m => m.id === payload.new.id);
        if (idx !== -1) allMembers[idx] = { ...allMembers[idx], ...payload.new };
        updateOnlineCount();
      })
    .subscribe();

  // Tasks update
  sb.channel("tasks-rt-" + uid)
    .on("postgres_changes", { event: "*", schema: "public", table: "tasks" },
      async () => {
        const isAdmin = currentUser && ["founder","co-founder","admin"].includes(currentUser.role);
        let q = sb.from("tasks").select("*").order("created_at", { ascending: false });
        if (!isAdmin) q = q.eq("user_id", uid);
        const { data } = await q;
        allTasks = data || [];
        if (currentSection === "tasks") renderTasks();
        updateTaskBadge();
      })
    .subscribe();
}

