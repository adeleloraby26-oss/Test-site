// ── CONFIG ── (update these)
const SUPABASE_URL  = "https://tzojjwnqodcrhwjaasja.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6b2pqd25xb2Rjcmh3amFhc2phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NzA2ODAsImV4cCI6MjA5MzI0NjY4MH0.G4IGSUgjVIKTNVszU5GpxNaD0VUnSmzUXe8p7uUl418";

const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON);

// ── SVG icons for eye toggle ──
const SVG_EYE     = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`;
const SVG_EYE_OFF = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>`;

// ── Session check ──
sb.auth.getSession().then(({ data }) => {
  if (data?.session) window.location.href = "../dashboard/";
});

// ── Tab switch ──
function switchTab(tab) {
  document.getElementById("loginBox").classList.toggle("hidden", tab !== "login");
  document.getElementById("signupBox").classList.toggle("hidden", tab !== "signup");
  document.getElementById("tabLogin").classList.toggle("active", tab === "login");
  document.getElementById("tabSignup").classList.toggle("active", tab === "signup");
}

// ── Toast ──
let _tid;
function showToast(msg, type = "success") {
  const el = document.getElementById("toast");
  el.classList.remove("show","success","error");
  document.getElementById("toastText").textContent = msg;
  clearTimeout(_tid);
  void el.offsetWidth;
  el.classList.add("show", type);
  _tid = setTimeout(() => el.classList.remove("show"), 3500);
}

// ── Eye toggle (SVG swap) ──
function toggleEye(inputId, btnId) {
  const inp = document.getElementById(inputId);
  const btn = document.getElementById(btnId);
  const isPass = inp.type === "password";
  inp.type = isPass ? "text" : "password";
  btn.innerHTML = isPass ? SVG_EYE_OFF : SVG_EYE;
}

// ── Password strength ──
function checkStrength(v) {
  let s = 0;
  if (v.length >= 8) s++;
  if (/[A-Z]/.test(v)) s++;
  if (/[0-9]/.test(v)) s++;
  if (/[^A-Za-z0-9]/.test(v)) s++;
  if (v.length >= 12) s++;
  const labels = ["","Very Weak","Weak","Fair","Strong","Very Strong"];
  document.getElementById("strengthLbl").textContent = s > 0 ? labels[s] : "Password strength";
  for (let i = 1; i <= 5; i++) {
    document.getElementById("sb"+i).className = "sb" + (i <= s ? " s"+s : "");
  }
}

// ── Login ──
async function login() {
  const email = document.getElementById("loginEmail").value.trim();
  const pass  = document.getElementById("loginPass").value;
  if (!email || !pass) return showToast("Please fill in all fields","error");
  const btn = document.getElementById("loginBtn");
  btn.disabled = true; btn.textContent = "Signing in...";
  const { error } = await sb.auth.signInWithPassword({ email, password: pass });
  btn.disabled = false; btn.textContent = "Sign In";
  if (error) return showToast(error.message,"error");
  showToast("Welcome back!");
  setTimeout(() => window.location.href = "../dashboard/", 800);
}

// ── Signup ──
async function signup() {
  const name     = document.getElementById("sigName").value.trim();
  const username = document.getElementById("sigUsername").value.trim().toLowerCase();
  const gender   = document.getElementById("sigGender").value;
  const field    = document.getElementById("sigField").value;
  const email    = document.getElementById("sigEmail").value.trim();
  const pass     = document.getElementById("sigPass").value;
  const confirm  = document.getElementById("sigConfirm").value;

  if (!name || !username || !email || !pass || !gender || !field)
    return showToast("Please fill in all fields","error");
  if (pass !== confirm)
    return showToast("Passwords don't match","error");
  if (pass.length < 8)
    return showToast("Password must be at least 8 characters","error");

  const btn = document.getElementById("signupBtn");
  btn.disabled = true; btn.textContent = "Creating account...";

  const { data, error } = await sb.auth.signUp({ email, password: pass });
  if (error) { btn.disabled=false; btn.textContent="Create Account"; return showToast(error.message,"error"); }

  await sb.from("users").upsert({ id: data.user.id, email, name, username, gender, field, points: 0 }, { onConflict: "id" });

  btn.disabled = false; btn.textContent = "Create Account";
  showToast("Account created! Welcome to AM PRO");
  setTimeout(() => window.location.href = "../dashboard/", 1200);
}

// ── Enter key support ──
document.addEventListener("keydown", e => {
  if (e.key !== "Enter") return;
  if (!document.getElementById("signupBox").classList.contains("hidden")) signup();
  else login();
});
