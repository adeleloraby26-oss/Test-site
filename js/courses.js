// ============================================================
// COURSES
// ============================================================
function renderCourses() {
  const el = document.getElementById("coursesGrid");
  if (!el) return;
  if (!allCourses.length) {
    el.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-state-icon">🎓</div><div class="empty-state-title">No courses yet</div>${isCurrentAdmin()?`<button class="btn-primary" onclick="openCourseModal()" style="margin-top:12px">Add First Course</button>`:""}</div>`;
    return;
  }
  const doneSet = new Set(myCompletions.map(c => c.course_id));
  const pct = allCourses.length ? Math.round((doneSet.size/allCourses.length)*100) : 0;
  document.getElementById("courseProgressPct").textContent = `${doneSet.size} / ${allCourses.length} Completed`;
  const fill = document.getElementById("courseProgressFill");
  if (fill) fill.style.width = pct + "%";

  const icons = ["📚","💻","🎨","🔧","🚀","🌐","📊","🔐","⚡","🎯"];
  el.innerHTML = allCourses.map((c, i) => {
    const done = doneSet.has(c.id);
    return `
      <div class="course-card ${done?"completed":""}">
        <div style="display:flex;align-items:flex-start;justify-content:space-between">
          <div class="course-icon">${icons[i%icons.length]}</div>
          ${done?`<span style="font-size:22px">✅</span>`:""}
        </div>
        <span class="course-category">${esc(c.category||"general")}</span>
        <div class="course-title">${esc(c.title)}</div>
        <div class="course-body">${esc(c.body||"")}</div>
        <div class="course-footer">
          <button class="course-complete-btn ${done?"done":"todo"}" onclick="toggleCourseComplete('${esc(c.id)}',${done})">
            ${done?`<i class="fa-solid fa-check"></i> Completed`:`<i class="fa-regular fa-circle"></i> Mark Done`}
          </button>
          <div style="display:flex;gap:6px">
            ${c.link?`<a class="course-link-btn" href="${esc(c.link)}" target="_blank" rel="noopener"><i class="fa-solid fa-arrow-up-right-from-square"></i> Open</a>`:""}
            ${isCurrentAdmin()?`
              <button class="icon-btn" onclick="openCourseModal('${esc(c.id)}')" style="width:28px;height:28px;font-size:12px"><i class="fa-solid fa-pen"></i></button>
              <button class="icon-btn" onclick="deleteCourse('${esc(c.id)}')" style="width:28px;height:28px;font-size:12px;color:var(--red)"><i class="fa-solid fa-trash"></i></button>
            `:""}
          </div>
        </div>
      </div>`;
  }).join("");
}

window.toggleCourseComplete = async function(cid, isDone) {
  if (isDone) {
    await sb.from("course_completions").delete().eq("course_id",cid).eq("user_id",currentUser.id);
    myCompletions = myCompletions.filter(c => c.course_id !== cid);
    toast("Marked as incomplete","info");
  } else {
    await sb.from("course_completions").insert({ course_id:cid, user_id:currentUser.id });
    myCompletions.push({ course_id:cid, user_id:currentUser.id });
    toast("Course completed! 🎓","success");
    await sb.from("activity").insert({ user_id:currentUser.id, type:"course_done", description:"completed a course" });
  }
  renderCourses();
};

window.openCourseModal = function(courseId) {
  const isEdit = !!courseId;
  document.getElementById("courseModalTitle").textContent = isEdit?"Edit Course":"New Course";
  document.getElementById("saveCourseBtn").textContent    = isEdit?"Save Changes":"Save Course";
  document.getElementById("courseModalId").value = courseId||"";
  if (isEdit) {
    const c = allCourses.find(x => x.id===courseId);
    if (c) {
      document.getElementById("courseTitle").value    = c.title    ||"";
      document.getElementById("courseBody").value     = c.body     ||"";
      document.getElementById("courseLink").value     = c.link     ||"";
      document.getElementById("courseCategory").value = c.category ||"";
    }
  } else {
    ["courseTitle","courseBody","courseLink","courseCategory"].forEach(id => document.getElementById(id).value="");
  }
  openModal("courseModalOverlay");
};

window.saveCourse = async function() {
  const id       = document.getElementById("courseModalId").value;
  const title    = document.getElementById("courseTitle").value.trim();
  const body     = document.getElementById("courseBody").value.trim();
  const link     = document.getElementById("courseLink").value.trim();
  const category = document.getElementById("courseCategory").value.trim();
  if (!title) { toast("Title required","error"); return; }

  const payload = { title, body, link, category };
  let error;
  if (id) {
    ({ error } = await sb.from("courses").update(payload).eq("id",id));
    if (!error) { const i=allCourses.findIndex(c=>c.id===id); if(i!==-1) Object.assign(allCourses[i],payload); }
  } else {
    const { data:nc, error:e } = await sb.from("courses").insert({...payload, created_by:currentUser.id, order_index:allCourses.length}).select().single();
    error=e; if(!e&&nc) allCourses.push(nc);
  }
  if (error) { toast("Failed: "+error.message,"error"); return; }
  toast(id?"Course updated ✓":"Course added! 📚","success");
  closeModal("courseModalOverlay");
  renderCourses();
};

window.deleteCourse = async function(id) {
  if (!confirm("Delete this course?")) return;
  await sb.from("courses").delete().eq("id",id);
  allCourses = allCourses.filter(c => c.id!==id);
  toast("Course deleted","info"); renderCourses();
};

window.closeCourseModal    = e => { if(e.target.id==="courseModalOverlay") closeModal("courseModalOverlay"); };
window.closeCourseModalBtn = ()  => closeModal("courseModalOverlay");

// ============================================================
// CHAT SYSTEM
