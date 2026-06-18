// ============================================================
// TASKS
// ============================================================
function renderTasks() {
  const isAdmin = isCurrentAdmin();
  const tasks   = isAdmin ? allTasks : allTasks.filter(t => t.user_id === currentUser?.id);
  updateTaskOverview(tasks);
  renderKanban(tasks);
  renderListView(tasks);
  updateTaskBadge();

  // Populate assignee dropdown
  const sel = document.getElementById("taskAssignee");
  if (sel) sel.innerHTML = `<option value="">Select member…</option>` +
    allMembers.map(m => `<option value="${esc(m.id)}">${esc(m.name||m.username||"—")}</option>`).join("");
}

function isCurrentAdmin() { return currentUser && ["founder","co-founder","admin"].includes(currentUser.role); }

function updateTaskOverview(tasks) {
  const counts = { todo:0, in_progress:0, review:0, done:0 };
  tasks.forEach(t => { counts[t.status] = (counts[t.status]||0)+1; });
  const total = tasks.length, done = counts.done||0, pct = total ? Math.round((done/total)*100) : 0;
  document.getElementById("totalTasks").textContent      = total;
  document.getElementById("todoTasks").textContent       = counts.todo||0;
  document.getElementById("inprogressTasks").textContent = counts.in_progress||0;
  document.getElementById("doneTasks").textContent       = done;
  document.getElementById("progressPct").textContent     = pct + "%";
  const fill = document.getElementById("progressBarFill");
  if (fill) fill.style.width = pct + "%";
}

function renderKanban(tasks) {
  ["todo","in_progress","review","done"].forEach(col => {
    const colTasks = tasks.filter(t => t.status === col);
    const cnt = document.getElementById("cnt-" + col);
    if (cnt) cnt.textContent = colTasks.length;
    const el = document.getElementById("cards-" + col);
    if (!el) return;
    el.innerHTML = colTasks.length
      ? colTasks.map(t => taskCardHTML(t)).join("")
      : `<div style="text-align:center;color:var(--text-muted);font-size:12px;padding:20px;opacity:.6">No tasks here</div>`;
  });
}

function renderListView(tasks) {
  const el = document.getElementById("taskListItems");
  if (!el) return;
  if (!tasks.length) {
    el.innerHTML = `<div class="empty-state"><div class="empty-state-icon">✅</div><div class="empty-state-title">No tasks yet</div></div>`;
    return;
  }
  el.innerHTML = tasks.map(t => {
    const assignee = allMembers.find(m => m.id === t.user_id);
    const c = avatarColor(assignee?.name);
    const done = t.done || t.status === "done";
    return `<div class="task-list-item">
      <button class="complete-checkbox ${done?"checked":""}" onclick="toggleTaskDone('${esc(t.id)}',${done})">
        ${done?`<i class="fa-solid fa-check" style="font-size:10px"></i>`:""}
      </button>
      <div class="task-list-info">
        <div class="task-list-title" style="${done?"text-decoration:line-through;opacity:.5":""}">${esc(t.title||"Task")}</div>
        <div class="task-list-meta">
          <span class="priority-badge ${t.priority||"medium"}">${t.priority||"medium"}</span>
          ${t.due_date?`<span class="due-badge"><i class="fa-regular fa-calendar"></i> ${fmtDate(t.due_date)}</span>`:""}
          ${assignee?`<span style="display:flex;align-items:center;gap:4px"><div class="task-assign-avatar" style="background:${c}22"><span style="color:${c};font-size:8px;font-weight:700">${(assignee.name||"?")[0]?.toUpperCase()}</span></div>${esc(assignee.name||"—")}</span>`:""}
        </div>
      </div>
      ${isCurrentAdmin()?`<div style="display:flex;gap:4px" onclick="event.stopPropagation()">
        <button class="icon-btn" onclick="openTaskModal('${esc(t.id)}')" style="width:28px;height:28px;font-size:12px"><i class="fa-solid fa-pen"></i></button>
        <button class="icon-btn" onclick="deleteTask('${esc(t.id)}')" style="width:28px;height:28px;font-size:12px;color:var(--red)"><i class="fa-solid fa-trash"></i></button>
      </div>`:""}
    </div>`;
  }).join("");
}

function taskCardHTML(t) {
  const assignee = allMembers.find(m => m.id === t.user_id);
  const c   = avatarColor(assignee?.name);
  const done = t.done || t.status === "done";
  return `<div class="task-card ${done?"done":""}">
    <div class="task-card-title" style="${done?"text-decoration:line-through;opacity:.5":""}">${esc(t.title||"Task")}</div>
    ${t.body?`<div class="task-card-desc">${esc(t.body.substring(0,80))}${t.body.length>80?"…":""}</div>`:""}
    <div class="task-card-meta">
      <span class="priority-badge ${t.priority||"medium"}">${t.priority||"medium"}</span>
      ${t.due_date?`<span class="due-badge"><i class="fa-regular fa-calendar"></i> ${fmtDate(t.due_date)}</span>`:""}
    </div>
    <div class="task-card-footer">
      ${assignee?`<div class="task-assignee"><div class="task-assign-avatar" style="background:${c}22">${avatarInnerHTML(assignee)}</div><span>${esc(assignee.name||"—")}</span></div>`:`<div></div>`}
      <div style="display:flex;gap:4px;align-items:center">
        ${isCurrentAdmin()?`<button class="icon-btn" onclick="openTaskModal('${esc(t.id)}')" style="width:24px;height:24px;font-size:11px"><i class="fa-solid fa-pen"></i></button>`:""}
        <button class="complete-checkbox ${done?"checked":""}" onclick="toggleTaskDone('${esc(t.id)}',${done})">
          ${done?`<i class="fa-solid fa-check" style="font-size:10px"></i>`:""}
        </button>
      </div>
    </div>
  </div>`;
}

window.switchTaskView = function(view, btn) {
  document.querySelectorAll(".view-btn").forEach(b => b.classList.remove("active")); btn.classList.add("active");
  document.getElementById("kanbanBoard").style.display = view==="kanban"?"grid":"none";
  document.getElementById("listView").style.display    = view==="list"?"block":"none";
};

window.toggleTaskDone = async function(taskId, isDone) {
  const nd = !isDone, ns = nd?"done":"todo";
  const { error } = await sb.from("tasks").update({ done:nd, status:ns }).eq("id", taskId);
  if (error) { toast("Update failed","error"); return; }
  const idx = allTasks.findIndex(t => t.id === taskId);
  if (idx !== -1) { allTasks[idx].done = nd; allTasks[idx].status = ns; }
  if (nd) {
    toast("Task completed! 🎉","success");
    if (currentUser) await sb.from("activity").insert({ user_id:currentUser.id, type:"task_done", description:`completed task "${allTasks.find(t=>t.id===taskId)?.title||"a task"}"` });
  }
  renderTasks();
};

window.openTaskModal = function(taskId) {
  const isEdit = !!taskId;
  document.getElementById("taskModalTitle").textContent = isEdit?"Edit Task":"New Task";
  document.getElementById("saveTaskBtn").textContent    = isEdit?"Save Changes":"Create Task";
  document.getElementById("taskModalId").value = taskId || "";
  if (isEdit) {
    const t = allTasks.find(x => x.id === taskId);
    if (t) {
      document.getElementById("taskTitle").value    = t.title    || "";
      document.getElementById("taskBody").value     = t.body     || "";
      document.getElementById("taskPriority").value = t.priority || "medium";
      document.getElementById("taskStatus").value   = t.status   || "todo";
      document.getElementById("taskDueDate").value  = t.due_date || "";
      document.getElementById("taskAssignee").value = t.user_id  || "";
      document.getElementById("taskLink").value     = t.link     || "";
    }
  } else {
    ["taskTitle","taskBody","taskDueDate","taskLink"].forEach(id => document.getElementById(id).value="");
    document.getElementById("taskPriority").value = "medium";
    document.getElementById("taskStatus").value   = "todo";
    document.getElementById("taskAssignee").value = "";
  }
  openModal("taskModalOverlay");
};

window.saveTask = async function() {
  const id       = document.getElementById("taskModalId").value;
  const title    = document.getElementById("taskTitle").value.trim();
  const body     = document.getElementById("taskBody").value.trim();
  const priority = document.getElementById("taskPriority").value;
  const status   = document.getElementById("taskStatus").value;
  const dueDate  = document.getElementById("taskDueDate").value;
  const assignee = document.getElementById("taskAssignee").value;
  const link     = document.getElementById("taskLink").value.trim();
  if (!title) { toast("Title required","error"); return; }

  const btn = document.getElementById("saveTaskBtn");
  btn.disabled = true; btn.textContent = "Saving…";

  const payload = { title, body, priority, status, link, done: status==="done", user_id: assignee||null, due_date: dueDate||null, assigned_by: currentUser?.id };
  let error;
  if (id) {
    ({ error } = await sb.from("tasks").update(payload).eq("id", id));
    if (!error) { const i=allTasks.findIndex(t=>t.id===id); if(i!==-1) Object.assign(allTasks[i],payload); }
  } else {
    const { data: nt, error: e } = await sb.from("tasks").insert(payload).select().single();
    error = e;
    if (!e && nt) allTasks.unshift(nt);
  }

  btn.disabled = false; btn.textContent = id?"Save Changes":"Create Task";
  if (error) { toast("Failed: "+error.message,"error"); return; }

  if (assignee && assignee !== currentUser?.id)
    await sb.from("notifications").insert({ user_id:assignee, type:"task_assigned", title:"New Task Assigned", body:`"${title}" has been assigned to you` });

  toast(id?"Task updated ✓":"Task created! 🎯","success");
  closeModal("taskModalOverlay");
  renderTasks();
  if (currentSection==="admin") renderAdminPanel();
};

window.deleteTask = async function(taskId) {
  if (!confirm("Delete this task?")) return;
  await sb.from("tasks").delete().eq("id", taskId);
  allTasks = allTasks.filter(t => t.id !== taskId);
  toast("Task deleted","info"); renderTasks();
};

window.closeTaskModal    = e => { if(e.target.id==="taskModalOverlay") closeModal("taskModalOverlay"); };
window.closeTaskModalBtn = ()  => closeModal("taskModalOverlay");

function updateTaskBadge() {
  const my = allTasks.filter(t => t.user_id===currentUser?.id && !t.done && t.status!=="done");
  const el = document.getElementById("tasksCount");
  if (el) { el.textContent = my.length||""; el.style.display = my.length?"":"none"; }
}

