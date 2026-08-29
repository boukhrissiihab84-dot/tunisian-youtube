// =====================================================================
// TUNISIAN YOUTUBE - APP.JS (SUPER STABLE & BULLETPROOF)
// =====================================================================

// ====== STORAGE HELPER ======
const S = {
    g(k) {
        try {
            const v = localStorage.getItem(k);
            return v ? JSON.parse(v) : null;
        } catch (e) {
            return null;
        }
    },
    s(k, v) {
        try {
            localStorage.setItem(k, JSON.stringify(v));
        } catch (e) {}
    },
    r(k) {
        try {
            localStorage.removeItem(k);
        } catch (e) {}
    }
};

let allVideos = [];
let currentFilter = { cat: null, sub: null, search: "" };
let currentVid = "";

// ====== AUTH ======
let user = S.g("user"), isSignUp = true;

function renderAuth() {
    const a = document.getElementById("authArea");
    if (!a) return;
    if (user) {
        const pic = user.avatar ? `<img src="${user.avatar}">` : (user.name || "U")[0].toUpperCase();
        a.innerHTML = `<div class="avatar" onclick="toggleDropdown()">${typeof pic === 'string' && pic.length === 1 ? pic : `<img src="${user.avatar}">`}</div>`;
        
        const ddN = document.getElementById("ddName");
        const ddE = document.getElementById("ddEmail");
        const da = document.getElementById("ddAvatar");
        
        if (ddN) ddN.textContent = user.name || "User";
        if (ddE) ddE.textContent = user.email;
        if (da) da.innerHTML = user.avatar ? `<img src="${user.avatar}">` : (user.name || "U")[0].toUpperCase();
    } else {
        a.innerHTML = `<button class="auth-cta" onclick="openAuth()"><i class="fas fa-user-circle"></i> Sign In</button>`;
    }
}

function toggleDropdown() {
    const dd = document.getElementById("dropdown");
    if (dd) dd.classList.toggle("show");
}

document.addEventListener("click", e => {
    const dd = document.getElementById("dropdown");
    if (dd && !e.target.closest(".avatar") && !e.target.closest(".dropdown")) {
        dd.classList.remove("show");
    }
});

function openAuth() {
    const ov = document.getElementById("authOv");
    if (ov) ov.classList.add("active");
}

function closeAuth() {
    const ov = document.getElementById("authOv");
    if (ov) ov.classList.remove("active");
    const err = document.getElementById("authError");
    if (err) err.textContent = "";
}

function toggleAuthMode() {
    isSignUp = !isSignUp;
    const title = document.getElementById("authTitle");
    const submitBtn = document.querySelector("#authOv .btn-primary");
    const nameGroup = document.getElementById("nameGroup");
    const signupAvatar = document.getElementById("signupAvatar");
    const authSwitch = document.getElementById("authSwitch");
    
    if (title) title.textContent = isSignUp ? "Create Account" : "Welcome Back";
    if (submitBtn) submitBtn.textContent = isSignUp ? "Create Account" : "Sign In";
    if (nameGroup) nameGroup.style.display = isSignUp ? "block" : "none";
    if (signupAvatar) signupAvatar.style.display = isSignUp ? "flex" : "none";
    if (authSwitch) authSwitch.innerHTML = isSignUp ? 'Already have an account? <b>Sign In</b>' : 'Don\'t have an account? <b>Sign Up</b>';
}

let tempAvatar = "";
function previewAvatar(e) {
    const f = e.target.files[0];
    if (f) {
        const r = new FileReader();
        r.onload = x => {
            tempAvatar = x.target.result;
            const sa = document.getElementById("signupAvatar");
            if (sa) sa.innerHTML = `<img src="${tempAvatar}"><input type="file" accept="image/*" onchange="previewAvatar(event)">`;
        };
        r.readAsDataURL(f);
    }
}

function handleAuth() {
    const n = document.getElementById("authName").value.trim();
    const em = document.getElementById("authEmail").value.trim();
    const p = document.getElementById("authPass").value;
    const err = document.getElementById("authError");
    if (!err) return;
    
    err.textContent = "";
    if (!em || !p) { err.textContent = "Fill all fields!"; return; }
    if (p.length < 6) { err.textContent = "Password must be 6+ characters"; return; }
    
    let users = S.g("users") || [];
    if (isSignUp) {
        if (!n) { err.textContent = "Enter your name!"; return; }
        if (users.find(u => u.email === em)) { err.textContent = "Email already exists!"; return; }
        user = { id: Date.now().toString(), name: n, email: em, pass: p, avatar: tempAvatar || "", bio: "" };
        users.push(user);
        S.s("users", users);
        S.s("user", user);
    } else {
        const found = users.find(u => u.email === em && u.pass === p);
        if (!found) { err.textContent = "Wrong email or password!"; return; }
        user = found;
        S.s("user", user);
    }
    renderAuth();
    closeAuth();
    tempAvatar = "";
}

function logOut() {
    user = null;
    S.r("user");
    renderAuth();
    const dd = document.getElementById("dropdown");
    if (dd) dd.classList.remove("show");
}

// ====== PROFILE ======
function openProfile() {
    const dd = document.getElementById("dropdown");
    if (dd) dd.classList.remove("show");
    if (!user) { openAuth(); return; }
    
    document.getElementById("profileName").value = user.name || "";
    document.getElementById("profileEmail").value = user.email || "";
    document.getElementById("profileBio").value = user.bio || "";
    
    const w = document.getElementById("profileAvatarWrap");
    if (w) {
        w.innerHTML = user.avatar ? `<img src="${user.avatar}"><input type="file" accept="image/*" onchange="changeProfilePic(event)">` : `<i class="fas fa-camera"></i><input type="file" accept="image/*" onchange="changeProfilePic(event)">`;
    }
    const po = document.getElementById("profileOv");
    if (po) po.classList.add("active");
}

function closeProfile() {
    const po = document.getElementById("profileOv");
    if (po) po.classList.remove("active");
}

function changeProfilePic(e) {
    const f = e.target.files[0];
    if (f) {
        const r = new FileReader();
        r.onload = x => {
            user.avatar = x.target.result;
            S.s("user", user);
            let users = S.g("users") || [];
            const idx = users.findIndex(u => u.id === user.id);
            if (idx > -1) {
                users[idx] = user;
                S.s("users", users);
            }
            renderAuth();
            openProfile();
        };
        r.readAsDataURL(f);
    }
}

function saveProfile() {
    user.name = document.getElementById("profileName").value.trim();
    user.bio = document.getElementById("profileBio").value.trim();
    S.s("user", user);
    let users = S.g("users") || [];
    const idx = users.findIndex(u => u.id === user.id);
    if (idx > -1) {
        users[idx] = user;
        S.s("users", users);
    }
    renderAuth();
    closeProfile();
    alert("✅ Profile saved!");
}

// ====== SETTINGS ======
function openSettings() {
    const dd = document.getElementById("dropdown");
    if (dd) dd.classList.remove("show");
    loadToggles();
    const so = document.getElementById("settingsOv");
    if (so) so.classList.add("active");
}

function closeSettings() {
    const so = document.getElementById("settingsOv");
    if (so) so.classList.remove("active");
}

function switchSettingsTab(page, btn) {
    document.querySelectorAll(".settings-tab").forEach(t => t.classList.remove("active"));
    btn.classList.add("active");
    document.querySelectorAll(".settings-page").forEach(p => p.classList.remove("active"));
    const sp = document.getElementById("page-" + page);
    if (sp) sp.classList.add("active");
}

function loadToggles() {
    const s = S.g("settings") || { dark: 1, auto: 1, notif: 0, replies: 1, public: 1, history: 1 };
    Object.keys(s).forEach(k => {
        const el = document.getElementById("t-" + k);
        if (el) {
            if (s[k]) el.classList.add("on");
            else el.classList.remove("on");
        }
    });
}

function toggleSet(k) {
    const s = S.g("settings") || { dark: 1, auto: 1, notif: 0, replies: 1, public: 1, history: 1 };
    s[k] = s[k] ? 0 : 1;
    S.s("settings", s);
    loadToggles();
}

function saveLang(v) { S.s("lang", v); }
function clearHistory() { S.r("history"); alert("✅ History cleared"); }
function resetAll() {
    if (confirm("T7eb tfa9as kol chay?")) {
        localStorage.clear();
        location.reload();
    }
}

// ====== VIEWS ======
function openLikedVideos() {
    const dd = document.getElementById("dropdown");
    if (dd) dd.classList.remove("show");
    if (!user) return;
    const likes = S.g("likes") || {};
    const likedIds = Object.keys(likes).filter(k => likes[k].includes(user.id));
    const filtered = allVideos.filter(v => likedIds.includes(v.id));
    render(filtered);
    document.querySelectorAll(".f-chip").forEach(c => c.classList.remove("active"));
}

function openSubscriptions() {
    const dd = document.getElementById("dropdown");
    if (dd) dd.classList.remove("show");
    if (!user) return;
    const subs = S.g("subs_" + user.id) || [];
    const filtered = allVideos.filter(v => subs.some(s => v.channel.includes(s)));
    render(filtered);
    document.querySelectorAll(".f-chip").forEach(c => c.classList.remove("active"));
}

// ====== LIKES ======
function getLikes(id) { return (S.g("likes") || {})[id] || []; }
function toggleLike(id) {
    if (!user) { openAuth(); return; }
    const l = S.g("likes") || {};
    if (!l[id]) l[id] = [];
    const i = l[id].indexOf(user.id);
    if (i > -1) l[id].splice(i, 1);
    else l[id].push(user.id);
    S.s("likes", l);
    refreshActions(id);
}
function isLiked(id) { return user ? getLikes(id).includes(user.id) : false; }

// ====== SUBSCRIBE ======
function getSubs() { return user ? S.g("subs_" + user.id) || [] : []; }
function toggleSub(ch) {
    if (!user) { openAuth(); return; }
    const k = "subs_" + user.id;
    let s = S.g(k) || [];
    const i = s.indexOf(ch);
    if (i > -1) s.splice(i, 1);
    else s.push(ch);
    S.s(k, s);
    refreshActions(currentVid);
}
function isSub(ch) { return getSubs().includes(ch); }

// ====== COMMENTS ======
function getCmts(id) { return (S.g("comments") || {})[id] || []; }
function postCmt(id) {
    if (!user) { openAuth(); return; }
    const inp = document.getElementById("cmtInput");
    if (!inp) return;
    const t = inp.value.trim();
    if (!t) return;
    const c = S.g("comments") || {};
    if (!c[id]) c[id] = [];
    c[id].unshift({ id: Date.now().toString(), uid: user.id, name: user.name, text: t, time: new Date().toLocaleString() });
    S.s("comments", c);
    inp.value = "";
    renderCmts(id);
}
function delCmt(vid, cid) {
    const c = S.g("comments") || {};
    if (c[vid]) {
        c[vid] = c[vid].filter(x => x.id !== cid);
        S.s("comments", c);
        renderCmts(vid);
    }
}
function renderCmts(id) {
    const s = document.getElementById("cmtSection"), cmts = getCmts(id);
    if (!s) return;
    let inp = "";
    if (user) {
        const av = user.avatar ? `<img src="${user.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">` : user.name[0].toUpperCase();
        inp = `<div class="cmt-form"><div class="cmt-avatar">${av}</div><div class="cmt-input-wrap"><input class="cmt-input" id="cmtInput" placeholder="Add a comment..." onkeypress="if(event.key==='Enter')postCmt('${id}')"><div class="cmt-btns"><button class="cmt-submit" onclick="postCmt('${id}')">Comment</button></div></div></div>`;
    } else {
        inp = `<p class="cmt-login"><a onclick="openAuth()">Sign in</a> to comment</p>`;
    }
    let list = "";
    if (!cmts.length) list = `<p style="color:var(--text3);font-size:13px;padding:8px 0">No comments yet. Be the first! 💬</p>`;
    else cmts.forEach(c => { list += `<div class="cmt-item"><div class="cmt-avatar" style="width:32px;height:32px;font-size:12px">${c.name ? c.name[0].toUpperCase() : "U"}</div><div style="flex:1"><span class="cmt-user">@${c.name}</span>${user && user.id === c.uid ? `<button class="cmt-del" onclick="delCmt('${id}','${c.id}')"><i class="fas fa-trash"></i></button>` : ""}<p class="cmt-text">${c.text}</p><span class="cmt-time">${c.time}</span></div></div>`; });
    s.innerHTML = `<h3>💬 ${cmts.length} Comments</h3>${inp}${list}`;
}

// ====== SHARE & DOWNLOAD ======
function shareV(id) {
    const u = `https://www.youtube.com/watch?v=${id}`;
    if (navigator.share) navigator.share({ title: "Cours Tounsi", url: u });
    else { navigator.clipboard.writeText(u); alert("✅ Link copied!"); }
}
function downloadV(id) { window.open(`https://www.y2mate.com/youtube/${id}`, "_blank"); }

// ====== DATA LOADER (STANDARD & SECURE) ======
function initApp(raw) {
    if (!Array.isArray(raw)) {
        console.error("raw is not an array");
        return;
    }
    allVideos = raw.map(v => {
        const id = v.Video_ID || v.video_id || v.id || "";
        return { 
            id, 
            title: v.Titre || v.title || "", 
            channel: v.Chaine || v.channel || "", 
            category: v.Categorie || v.category || "Autre", 
            topic: v.Mawdhou3 || v.topic || "Général", 
            thumb: `https://img.youtube.com/vi/${id}/hqdefault.jpg` 
        };
    }).filter(v => v.id && v.id.length === 11);

    const vc = document.getElementById("vCount");
    if (vc) vc.textContent = allVideos.length + " cours";
    buildSide(); 
    buildChips(); 
    render(allVideos);
}

// Charger depuis la variable globale définie dans data.js
if (typeof rawVideosData !== 'undefined' && Array.isArray(rawVideosData)) {
    console.log("✅ rawVideosData chargée depuis data.js");
    initApp(rawVideosData);
} else {
    // Fallback JSON si data.js n'existe pas
    console.log("⚠️ rawVideosData non détectée, fallback JSON...");
    fetch(`tounes_courses.json?v=${Date.now()}`)
        .then(r => r.json())
        .then(d => initApp(d))
        .catch(err => {
            const g = document.getElementById("grid");
            if (g) g.innerHTML = "<p style='color:red;text-align:center;grid-column:1/-1'>Error loading data.js or tounes_courses.json.</p>";
        });
}

// ====== SIDEBAR ======
function buildSide() {
    const cats = {}, subs = {};
    allVideos.forEach(v => { cats[v.category] = (cats[v.category] || 0) + 1; if (v.topic !== "Général") subs[v.topic] = (subs[v.topic] || 0) + 1; });
    const icons = { Design: "🎨", Programmation: "💻", Langues: "🗣️", Marketing: "📈", Montage: "🎬", Freelance: "💼", "Bac & Etudes": "📚", Bureautique: "📊", Autre: "📦" };
    
    const cl = document.getElementById("catList");
    if (cl) {
        cl.innerHTML = `<button class="side-btn active" onclick="filterCat(null,this)">🌐 All <span class="side-cnt">${allVideos.length}</span></button>`;
        Object.entries(cats).sort((a, b) => b[1] - a[1]).forEach(([c, n]) => { cl.innerHTML += `<button class="side-btn" onclick="filterCat('${c}',this)">${icons[c] || "📦"} ${c} <span class="side-cnt">${n}</span></button>`; });
    }
    
    const sl = document.getElementById("subList");
    if (sl) {
        sl.innerHTML = "";
        Object.entries(subs).sort((a, b) => b[1] - a[1]).slice(0, 15).forEach(([s, n]) => { sl.innerHTML += `<button class="side-btn" onclick="filterSub('${s}',this)">• ${s} <span class="side-cnt">${n}</span></button>`; });
    }
}

// ====== FILTER CHIPS ======
function buildChips() {
    const fb = document.getElementById("filterBar");
    if (!fb) return;
    const cats = [...new Set(allVideos.map(v => v.category))];
    fb.innerHTML = `<button class="f-chip active" onclick="showAll()">All</button>`;
    cats.forEach(c => { fb.innerHTML += `<button class="f-chip" onclick="filterChip('${c}',this)">${c}</button>`; });
}

// ====== RENDER ======
function render(list) {
    const g = document.getElementById("grid"), e = document.getElementById("empty");
    if (!g) return;
    if (!list.length) { g.innerHTML = ""; if (e) e.style.display = "block"; return; }
    if (e) e.style.display = "none";
    g.innerHTML = list.map(v => `<div class="card" onclick="openModal('${v.id}','${esc(v.title)}','${esc(v.channel)}')"><div class="card-thumb"><img src="${v.thumb}" loading="lazy" onerror="this.src='https://img.youtube.com/vi/${v.id}/0.jpg'"><span class="card-badge">${v.topic}</span></div><div class="card-body"><div class="card-title">${v.title}</div><div class="card-ch"><i class="fas fa-user-circle"></i> ${v.channel}</div><div class="card-cat">${v.category}</div></div></div>`).join("");
}
function esc(s) { return (s || "").replace(/'/g, "\\'").replace(/"/g, '\\"'); }

// ====== FILTERS ======
function showAll() { currentFilter = { cat: null, sub: null, search: "" }; document.getElementById("searchInput").value = ""; document.querySelectorAll(".side-btn,.f-chip").forEach(b => b.classList.remove("active")); document.querySelector(".f-chip")?.classList.add("active"); apply(); }
function filterCat(c, btn) { currentFilter.cat = c; currentFilter.sub = null; document.querySelectorAll("#catList .side-btn").forEach(b => b.classList.remove("active")); btn?.classList.add("active"); apply(); }
function filterSub(s, btn) { currentFilter.sub = s; document.querySelectorAll("#subList .side-btn").forEach(b => b.classList.remove("active")); btn?.classList.add("active"); apply(); }
function filterChip(c, btn) { currentFilter.cat = c; currentFilter.sub = null; document.querySelectorAll(".f-chip").forEach(b => b.classList.remove("active")); btn?.classList.add("active"); apply(); }
function searchVideos() { currentFilter.search = document.getElementById("searchInput").value.toLowerCase(); apply(); }
function apply() { let r = allVideos; if (currentFilter.cat) r = r.filter(v => v.category === currentFilter.cat); if (currentFilter.sub) r = r.filter(v => v.topic === currentFilter.sub); if (currentFilter.search) r = r.filter(v => (v.title + v.channel + v.topic + v.category).toLowerCase().includes(currentFilter.search)); render(r); }

// ====== VIDEO MODAL ======
function openModal(id, title, chan) {
    currentVid = id;
    const s = S.g("settings") || { auto: 1 };
    const p = document.getElementById("player");
    if (p) p.innerHTML = `<iframe src="https://www.youtube.com/embed/${id}${s.auto ? "?autoplay=1" : ""}" allowfullscreen allow="autoplay"></iframe>`;
    
    const mt = document.getElementById("mTitle");
    const mc = document.getElementById("mChan");
    if (mt) mt.textContent = title;
    if (mc) mc.textContent = chan;
    
    refreshActions(id);
    renderCmts(id);
    const vo = document.getElementById("videoOv");
    if (vo) vo.classList.add("active");
    document.body.style.overflow = "hidden";
    
    if (S.g("settings")?.history) {
        let h = S.g("history") || [];
        if (!h.includes(id)) {
            h.unshift(id);
            S.s("history", h);
        }
    }
}

function refreshActions(id) {
    const liked = isLiked(id), lc = getLikes(id).length, ch = document.getElementById("mChan").textContent, sub = isSub(ch);
    const ma = document.getElementById("mActions");
    if (ma) {
        ma.innerHTML = `<button class="v-act ${liked ? 'liked' : ''}" onclick="toggleLike('${id}')"><i class="fas fa-thumbs-up"></i> ${lc}</button><button class="v-act ${sub ? 'subscribed' : ''}" onclick="toggleSub('${esc(ch)}')"><i class="fas fa-bell"></i> ${sub ? 'Subscribed' : 'Subscribe'}</button><button class="v-act" onclick="downloadV('${id}')"><i class="fas fa-download"></i> Download</button><button class="v-act" onclick="shareV('${id}')"><i class="fas fa-share"></i> Share</button>`;
    }
}

function closeModal() {
    const vo = document.getElementById("videoOv");
    if (vo) vo.classList.remove("active");
    const p = document.getElementById("player");
    if (p) p.innerHTML = "";
    document.body.style.overflow = "";
}

// ====== INIT ======
document.addEventListener("keydown", e => { if (e.key === "Escape") { closeModal(); closeAuth(); closeSettings(); closeProfile(); } });
function toggleSidebar() { const s = document.getElementById("sidebar"), m = document.getElementById("mainContent"); if (s && m) { s.classList.toggle("hidden"); m.style.marginLeft = s.classList.contains("hidden") ? "0" : "var(--sidebar-w)"; } }

// Start
renderAuth();
