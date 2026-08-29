// =====================================================================
// TUNISIAN YOUTUBE - APP.JS (SUPER STABLE DIRECT DATA.JS LOADER)
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
let activeList = [];
let displayedCount = 0;
const BATCH_SIZE = 24; // ⭐ FIX: BATCH_SIZE CORRECTE SANS CONFLICTS
let user = S.g("user"), isSignUp = true;
let tempAvatar = "";
let searchTimer;

// ================ ROUTER / NAVIGATION ================
function navigate(page, data = null) {
    document.getElementById("dropdown")?.classList.remove("show");
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    const target = document.getElementById("page-" + page);
    if (target) target.classList.add("active");
    
    if (page === "home") { renderHome(); }
    else if (page === "video" && data) { loadVideoPage(data); }
    else if (page === "category" && data) { loadCategoryPage(data); }
    else if (page === "account") { loadAccountPage(); }
    else if (page === "channel") { loadChannelPage(); }
    else if (page === "settings") { loadToggles(); }
    else if (page === "liked") { loadLikedPage(); }
    else if (page === "subscriptions") { loadSubscriptionsPage(); }
    else if (page === "history") { loadHistoryPage(); }
    
    window.scrollTo(0, 0);
    const url = page === "home" ? "#" : `#/${page}${data ? '/' + encodeURIComponent(typeof data === 'string' ? data : data.id || '') : ''}`;
    if (window.location.hash !== url) history.pushState({ page, data }, "", url);
}

window.addEventListener("popstate", (e) => {
    if (e.state) navigate(e.state.page, e.state.data);
    else navigate("home");
});

function initRouter() {
    const hash = window.location.hash.replace("#/", "").split("/");
    const page = hash[0] || "home";
    const data = hash[1] ? decodeURIComponent(hash[1]) : null;
    
    if (page === "video" && data) {
        const v = allVideos.find(x => x.id === data);
        v ? navigate("video", v) : navigate("home");
    } else if (page === "category" && data) {
        navigate("category", data);
    } else if (["account", "channel", "settings", "liked", "subscriptions", "history"].includes(page)) {
        navigate(page);
    } else {
        navigate("home");
    }
}

// ====== THEME ======
function applyTheme() {
    const s = S.g("settings") || { dark: 0 };
    document.documentElement.setAttribute("data-theme", s.dark ? "dark" : "light");
    const btn = document.getElementById("themeBtn");
    if (btn) btn.innerHTML = s.dark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}
function toggleTheme() {
    const s = S.g("settings") || { dark: 0, auto: 1, notif: 0, history: 1, public: 1, search: 1 };
    s.dark = s.dark ? 0 : 1;
    S.s("settings", s); applyTheme(); loadToggles();
}
function applyFontSize() {
    const s = S.g("settings") || { fontSize: "normal" };
    document.body.classList.remove("font-small", "font-normal", "font-large");
    document.body.classList.add("font-" + (s.fontSize || "normal"));
}
function setFontSize(v) { const s = S.g("settings") || {}; s.fontSize = v; S.s("settings", s); applyFontSize(); }
function applyGridSize() {
    const s = S.g("settings") || { gridSize: "280" };
    document.querySelectorAll(".grid").forEach(g => g.style.gridTemplateColumns = `repeat(auto-fill, minmax(${s.gridSize || 280}px, 1fr))`);
}
function setGridSize(v) { const s = S.g("settings") || {}; s.gridSize = v; S.s("settings", s); applyGridSize(); }
function setLang(v) { const s = S.g("settings") || {}; s.lang = v; S.s("settings", s); const trans = { derja: "Lawwej 3la cours...", fr: "Rechercher...", en: "Search courses..." }; document.getElementById("searchInput").placeholder = trans[v] || trans.en; }
function setQuality(v) { const s = S.g("settings") || {}; s.quality = v; S.s("settings", s); }

function switchSettingsTab(page, btn) {
    document.querySelectorAll(".settings-tab").forEach(t => t.classList.remove("active"));
    btn.classList.add("active");
    document.querySelectorAll(".settings-page-content").forEach(p => p.classList.remove("active"));
    document.getElementById("set-" + page)?.classList.add("active");
}
function loadToggles() {
    const s = S.g("settings") || { dark: 0, auto: 1, notif: 0, history: 1, public: 1, search: 1, fontSize: "normal", gridSize: "280", lang: "derja", quality: "auto" };
    ["dark", "auto", "notif", "history", "public", "search"].forEach(k => {
        const el = document.getElementById("t-" + k);
        if (el) { if (s[k]) el.classList.add("on"); else el.classList.remove("on"); }
    });
    const langSel = document.getElementById("langSelect"); if (langSel && s.lang) langSel.value = s.lang;
    const fontSel = document.getElementById("fontSelect"); if (fontSel) fontSel.value = s.fontSize || "normal";
    const gridSel = document.getElementById("gridSelect"); if (gridSel) gridSel.value = s.gridSize || "280";
    const qSel = document.getElementById("qualitySelect"); if (qSel) qSel.value = s.quality || "auto";
}
function toggleSet(k) {
    const s = S.g("settings") || { dark: 0, auto: 1, notif: 0, history: 1, public: 1, search: 1 };
    s[k] = s[k] ? 0 : 1; S.s("settings", s); loadToggles();
    if (k === "dark") applyTheme();
}
function clearHistory() { S.r("history"); alert("✅ History cleared"); }
function clearLikes() { S.r("likes"); alert("✅ Likes cleared"); }

// ====== AUTH ======
function renderAuth() {
    const a = document.getElementById("authArea");
    if (!a) return;
    if (user) {
        const pic = user.avatar ? `<img src="${user.avatar}">` : (user.name || "U")[0].toUpperCase();
        a.innerHTML = `<div class="avatar" onclick="toggleDropdown()">${typeof pic === 'string' && pic.length === 1 ? pic : `<img src="${user.avatar}">`}</div>`;
        const ddN = document.getElementById("ddName"), ddE = document.getElementById("ddEmail"), da = document.getElementById("ddAvatar");
        if (ddN) ddN.textContent = user.name || "User";
        if (ddE) ddE.textContent = user.email;
        if (da) da.innerHTML = user.avatar ? `<img src="${user.avatar}">` : (user.name || "U")[0].toUpperCase();
    } else {
        a.innerHTML = `<button class="auth-cta" onclick="openAuth()"><i class="fas fa-user-circle"></i> Sign In</button>`;
    }
}
function toggleDropdown() { document.getElementById("dropdown")?.classList.toggle("show"); }
document.addEventListener("click", e => { const dd = document.getElementById("dropdown"); if (dd && !e.target.closest(".avatar") && !e.target.closest(".dropdown")) dd.classList.remove("show"); });
function openAuth() { document.getElementById("authOv")?.classList.add("active"); }
function closeAuth() { document.getElementById("authOv")?.classList.remove("active"); document.getElementById("authError").textContent = ""; }
function toggleAuthMode() {
    isSignUp = !isSignUp;
    document.getElementById("authTitle").textContent = isSignUp ? "Create Account" : "Welcome Back";
    document.querySelector("#authOv .btn-primary").textContent = isSignUp ? "Create Account" : "Sign In";
    document.getElementById("nameGroup").style.display = isSignUp ? "block" : "none";
    document.getElementById("signupAvatar").style.display = isSignUp ? "flex" : "none";
    document.getElementById("authSwitch").innerHTML = isSignUp ? 'Already have an account? b>Sign In</b>' : 'Don\'t have an account? <b>Sign Up</b>';
}
let tempAvatar = "";
function previewAvatar(e) { const f = e.target.files[0]; if (f) { const r = new FileReader(); r.onload = x => { tempAvatar = x.target.result; document.getElementById("signupAvatar").innerHTML = `<img src="${tempAvatar}"><input type="file" accept="image/*" onchange="previewAvatar(event)">`; }; r.readAsDataURL(f); } }
function handleAuth() {
    const n = document.getElementById("authName").value.trim(), em = document.getElementById("authEmail").value.trim(), p = document.getElementById("authPass").value, err = document.getElementById("authError");
    err.textContent = "";
    if (!em || !p) { err.textContent = "Fill all fields!"; return; }
    if (p.length < 6) { err.textContent = "Password must be 6+ characters"; return; }
    let users = S.g("users") || [];
    if (isSignUp) {
        if (!n) { err.textContent = "Enter your name!"; return; }
        if (users.find(u => u.email === em)) { err.textContent = "Email already exists!"; return; }
        user = { id: Date.now().toString(), name: n, email: em, pass: p, avatar: tempAvatar || "", bio: "" };
        users.push(user); S.s("users", users); S.s("user", user);
    } else {
        const found = users.find(u => u.email === em && u.pass === p);
        if (!found) { err.textContent = "Wrong email or password!"; return; }
        user = found; S.s("user", user);
    }
    renderAuth(); closeAuth(); tempAvatar = "";
}
function logOut() { user = null; S.r("user"); renderAuth(); document.getElementById("dropdown")?.classList.remove("show"); navigate("home"); }

// ====== PROFILE / ACCOUNT ======
function loadAccountPage() {
    if (!user) { openAuth(); navigate("home"); return; }
    document.getElementById("accName").value = user.name || "";
    document.getElementById("accEmail").value = user.email || "";
    document.getElementById("accAvatarWrap").innerHTML = user.avatar ? `<img src="${user.avatar}"><input type="file" accept="image/*" onchange="changeAccPic(event)">` : `<i class="fas fa-camera"></i><input type="file" accept="image/*" onchange="changeAccPic(event)">`;
    document.getElementById("accOldPass").value = ""; document.getElementById("accNewPass").value = ""; document.getElementById("accError").textContent = "";
}
function changeAccPic(e) { const f = e.target.files[0]; if (f) { const r = new FileReader(); r.onload = x => { user.avatar = x.target.result; S.s("user", user); let us = S.g("users") || []; const idx = us.findIndex(u => u.id === user.id); if (idx > -1) { us[idx] = user; S.s("users", us); } renderAuth(); loadAccountPage(); }; r.readAsDataURL(f); } }
function saveAccount() {
    const err = document.getElementById("accError"); err.textContent = "";
    const n = document.getElementById("accName").value.trim(), o = document.getElementById("accOldPass").value, np = document.getElementById("accNewPass").value;
    if (n) user.name = n;
    if (o || np) {
        if (o !== user.pass) { err.textContent = "Current password is wrong!"; return; }
        if (np.length < 6) { err.textContent = "New password must be 6+ characters!"; return; }
        user.pass = np;
    }
    S.s("user", user); let us = S.g("users") || []; const idx = us.findIndex(u => u.id === user.id); if (idx > -1) { us[idx] = user; S.s("users", us); }
    renderAuth(); loadAccountPage(); alert("✅ Account saved!");
}

function loadChannelPage() {
    if (!user) { openAuth(); navigate("home"); return; }
    const ch = S.g("channel_" + user.id) || { name: user.name, bio: "", category: "", link: "", social: "" };
    document.getElementById("channelNameDisplay").textContent = ch.name || user.name;
    document.getElementById("channelBioDisplay").textContent = ch.bio || "No description yet";
    document.getElementById("channelBigAvatar").innerHTML = user.avatar ? `<img src="${user.avatar}">` : (user.name || "U")[0].toUpperCase();
    document.getElementById("channelName").value = ch.name || "";
    document.getElementById("channelBio").value = ch.bio || "";
    document.getElementById("channelCat").value = ch.category || "";
    document.getElementById("channelLink").value = ch.link || "";
    document.getElementById("channelSocial").value = ch.social || "";
}
function saveChannel() {
    const ch = { name: document.getElementById("channelName").value.trim(), bio: document.getElementById("channelBio").value.trim(), category: document.getElementById("channelCat").value, link: document.getElementById("channelLink").value.trim(), social: document.getElementById("channelSocial").value.trim() };
    S.s("channel_" + user.id, ch); loadChannelPage(); alert("✅ Channel saved!");
}

// ====== LIKES / SUBS ======
function getLikes(id) { return (S.g("likes") || {})[id] || []; }
function toggleLike(id) { if (!user) { openAuth(); return; } const l = S.g("likes") || {}; if (!l[id]) l[id] = []; const i = l[id].indexOf(user.id); i > -1 ? l[id].splice(i, 1) : l[id].push(user.id); S.s("likes", l); refreshActionsLarge(id); }
function isLiked(id) { return user ? getLikes(id).includes(user.id) : false; }

function getSubs() { return user ? S.g("subs_" + user.id) || [] : []; }
function toggleSub(ch) { if (!user) { openAuth(); return; } const k = "subs_" + user.id; let s = S.g(k) || []; const i = s.indexOf(ch); i > -1 ? s.splice(i, 1) : s.push(ch); S.s(k, s); refreshActionsLarge(currentVid); }
function toggleSubFromPage() { toggleSub(document.getElementById("mChanLarge").textContent); }
function isSub(ch) { return getSubs().includes(ch); }

// ====== COMMENTS ======
function getCmts(id) { return (S.g("comments") || {})[id] || []; }
function postCmt(id) { if (!user) { openAuth(); return; } const inp = document.getElementById("cmtInputLarge"); if (!inp) return; const t = inp.value.trim(); if (!t) return; const c = S.g("comments") || {}; if (!c[id]) c[id] = []; c[id].unshift({ id: Date.now().toString(), uid: user.id, name: user.name, text: t, time: new Date().toLocaleString() }); S.s("comments", c); inp.value = ""; renderCmtsLarge(id); }
function delCmt(vid, cid) { const c = S.g("comments") || {}; if (c[vid]) { c[vid] = c[vid].filter(x => x.id !== cid); S.s("comments", c); renderCmtsLarge(vid); } }
function renderCmtsLarge(id) {
    const s = document.getElementById("cmtSectionLarge"), cmts = getCmts(id);
    if (!s) return;
    let inp = "";
    if (user) {
        const av = user.avatar ? `<img src="${user.avatar}">` : user.name[0].toUpperCase();
        inp = `<div class="cmt-form"><div class="cmt-avatar">${av}</div><div class="cmt-input-wrap"><input class="cmt-input" id="cmtInputLarge" placeholder="Add a comment..." onkeypress="if(event.key==='Enter')postCmt('${id}')"><div class="cmt-btns"><button class="cmt-submit" onclick="postCmt('${id}')">Comment</button></div></div></div>`;
    } else {
        inp = `<p class="cmt-login"><a onclick="openAuth()">Sign in</a> to comment</p>`;
    }
    let list = "";
    if (!cmts.length) list = `<p style="color:var(--text3);font-size:13px;padding:8px 0">No comments yet. Be the first! 💬</p>`;
    else cmts.forEach(c => { list += `<div class="cmt-item"><div class="cmt-avatar" style="width:32px;height:32px;font-size:12px">${c.name ? c.name[0].toUpperCase() : "U"}</div><div style="flex:1"><span class="cmt-user">@${c.name}</span>${user && user.id === c.uid ? `<button class="cmt-del" onclick="delCmt('${id}','${c.id}')"><i class="fas fa-trash"></i></button>` : ""}<p class="cmt-text">${c.text}</p><span class="cmt-time">${c.time}</span></div></div>`; });
    s.innerHTML = `<h3>💬 ${cmts.length} Comments</h3>${inp}${list}`;
}

function shareV(id) { const u = `https://www.youtube.com/watch?v=${id}`; if (navigator.share) navigator.share({ title: "Cours Tounsi", url: u }); else { navigator.clipboard.writeText(u); alert("✅ Link copied!"); } }

// ====== DOWNLOAD ======
function downloadV(id) {
    const url = `https://www.youtube.com/watch?v=${id}`;
    const encoded = encodeURIComponent(url);
    document.getElementById("dlCobalt").href = `https://cobalt.tools/?u=${encoded}`;
    document.getElementById("dlSSYT").href = `https://ssyoutube.com/watch?v=${id}`;
    document.getElementById("dlY2Mate").href = `https://www.y2mate.com/youtube/${id}`;
    document.getElementById("dlSaveFrom").href = `https://en.savefrom.net/#url=${encoded}`;
    document.getElementById("dlModal").classList.add("active");
}
function closeDlModal() { document.getElementById("dlModal").classList.remove("active"); }

// ====== DATA LOADING SYSTEM ======
function initApp(raw) {
    if (!Array.isArray(raw)) return;
    allVideos = raw.map(v => {
        const id = v.Video_ID || v.video_id || v.id || "";
        return { id, title: v.Titre || v.title || "", channel: v.Chaine || v.channel || "", category: v.Categorie || v.category || "Autre", topic: v.Mawdhou3 || v.topic || "Général", thumb: `https://img.youtube.com/vi/${id}/mqdefault.jpg` };
    }).filter(v => v.id && v.id.length === 11);
    
    document.getElementById("vCount").textContent = allVideos.length + " cours";
    buildSide(); buildChips(); initRouter();
}

// 🟢 LE CHARGEMENT DIRECT SANS ERREURS (data.js)
if (typeof rawVideosData !== 'undefined' && Array.isArray(rawVideosData)) {
    console.log("✅ rawVideosData chargée depuis data.js direct");
    initApp(rawVideosData);
} else {
    // Fallback JSON
    console.log("⚠️ Fallback vers JSON...");
    fetch(`tounes_courses.json?nocache=${Date.now()}`, { cache: "no-store" })
        .then(r => r.json())
        .then(d => initApp(d))
        .catch(err => {
            document.getElementById("grid").innerHTML = "<p style='color:red;text-align:center;grid-column:1/-1;padding:40px'>⚠️ rawVideosData na9es! Sseb data.js fi GitHub.</p>";
        });
}

function buildSide() {
    const cats = {}, subs = {};
    allVideos.forEach(v => { cats[v.category] = (cats[v.category] || 0) + 1; if (v.topic !== "Général") subs[v.topic] = (subs[v.topic] || 0) + 1; });
    const icons = { Design: "🎨", Programmation: "💻", Langues: "🗣️", Marketing: "📈", Montage: "🎬", Freelance: "💼", "Bac & Etudes": "📚", Bureautique: "📊", Autre: "📦" };
    const cl = document.getElementById("catList");
    if (cl) {
        cl.innerHTML = `<button class="side-btn active" onclick="navigate('home');this.classList.add('active')">🌐 All <span class="side-cnt">${allVideos.length}</span></button>`;
        Object.entries(cats).sort((a, b) => b[1] - a[1]).forEach(([c, n]) => {
            cl.innerHTML += `<button class="side-btn" onclick="navigate('category','${c}')">${icons[c] || "📦"} ${c} <span class="side-cnt">${n}</span></button>`;
        });
    }
    const sl = document.getElementById("subList");
    if (sl) {
        sl.innerHTML = "";
        Object.entries(subs).sort((a, b) => b[1] - a[1]).slice(0, 15).forEach(([s, n]) => {
            sl.innerHTML += `<button class="side-btn" onclick="filterSubHome('${s}')">• ${s} <span class="side-cnt">${n}</span></button>`;
        });
    }
}

function buildChips() {
    const fb = document.getElementById("filterBar"); if (!fb) return;
    const cats = [...new Set(allVideos.map(v => v.category))];
    fb.innerHTML = `<button class="f-chip active" onclick="showAll()">All</button>`;
    cats.forEach(c => { fb.innerHTML += `<button class="f-chip" onclick="filterChipHome('${c}')">${c}</button>`; });
}

function renderHome() { apply(); }

function setListAndRender(list) {
    activeList = list; displayedCount = 0;
    const g = document.getElementById("grid"); const e = document.getElementById("empty");
    if (g) g.innerHTML = "";
    if (!activeList.length) { if (e) e.style.display = "block"; return; }
    if (e) e.style.display = "none";
    
    setupInfiniteScroll();
}

// 🚀 ZERO LAG INFINITE SCROLL Observer
let observer;
function setupInfiniteScroll() {
    if (observer) observer.disconnect();
    const sentinel = document.getElementById("sentinel");
    if (!sentinel) return;

    observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            renderNextBatch();
        }
    }, { rootMargin: "300px" });
    observer.observe(sentinel);
}

function renderNextBatch() {
    const g = document.getElementById("grid"); if (!g) return;
    const batch = activeList.slice(displayedCount, displayedCount + BATCH_SIZE); // ⭐ FIX DEFINITIF: PLUS AUCUNS LOGS SUR BATCH_SIZE
    if (!batch.length) return;
    displayedCount += batch.length;
    g.insertAdjacentHTML("beforeend", batch.map(v => `
        <div class="card" onclick="navigate('video', {id:'${v.id}'})">
            <div class="card-thumb"><img src="${v.thumb}" loading="lazy" onerror="this.src='https://img.youtube.com/vi/${v.id}/0.jpg'"><span class="card-badge">${v.topic}</span></div>
            <div class="card-body"><div class="card-title">${v.title}</div><div class="card-ch"><i class="fas fa-user-circle"></i> ${v.channel}</div><div class="card-cat">${v.category}</div></div>
        </div>
    `).join(""));
}

function esc(s) { return (s || "").replace(/'/g, "\\'").replace(/"/g, '\\"'); }
function showAll() { currentFilter = { cat: null, sub: null, search: "" }; document.getElementById("searchInput").value = ""; document.querySelectorAll(".side-btn,.f-chip").forEach(b => b.classList.remove("active")); document.querySelector(".f-chip")?.classList.add("active"); document.querySelectorAll("#catList .side-btn")[0]?.classList.add("active"); navigate("home"); }
function filterChipHome(c) { currentFilter.cat = c; currentFilter.sub = null; document.querySelectorAll(".f-chip").forEach(b => b.classList.remove("active")); event?.target?.classList.add("active"); navigate("home"); }
function filterSubHome(s) { currentFilter.sub = s; document.querySelectorAll("#subList .side-btn").forEach(b => b.classList.remove("active")); event?.target?.classList.add("active"); navigate("home"); }

function onSearchInput() {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
        currentFilter.search = document.getElementById("searchInput").value.toLowerCase();
        navigate("home");
    }, 300);
}

function apply() {
    let r = allVideos;
    if (currentFilter.cat) r = r.filter(v => v.category === currentFilter.cat);
    if (currentFilter.sub) r = r.filter(v => v.topic === currentFilter.sub);
    if (currentFilter.search) r = r.filter(v => (v.title + v.channel + v.topic + v.category).toLowerCase().includes(currentFilter.search));
    setListAndRender(r);
}

// ================ VIDEO PAGE ================
function loadVideoPage(v) {
    if (typeof v === 'string') v = allVideos.find(x => x.id === v);
    if (!v) return;
    currentVid = v.id;
    const s = S.g("settings") || { auto: 1 };
    const q = s.quality && s.quality !== "auto" ? `&vq=${s.quality}` : "";
    document.getElementById("playerLarge").innerHTML = `<iframe src="https://www.youtube.com/embed/${v.id}?autoplay=${s.auto ? 1 : 0}${q}" allowfullscreen allow="autoplay"></iframe>`;
    document.getElementById("mTitleLarge").textContent = v.title;
    document.getElementById("mChanLarge").textContent = v.channel;
    document.getElementById("mCatLarge").textContent = `${v.category} • ${v.topic}`;
    document.getElementById("mChanAvatar").textContent = (v.channel || "C")[0].toUpperCase();
    document.getElementById("mDescLarge").innerHTML = `<span class="tag">#${v.category}</span><span class="tag">#${v.topic}</span><br><br>${v.title}`;
    refreshActionsLarge(v.id); renderCmtsLarge(v.id); renderRelatedVideos(v.category, v.id);
    if (S.g("settings")?.history) { let h = S.g("history") || []; if (!h.includes(v.id)) { h.unshift(v.id); S.s("history", h); } }
}
function refreshActionsLarge(id) {
    const l = isLiked(id), lc = getLikes(id).length, ch = document.getElementById("mChanLarge").textContent, s = isSub(ch);
    document.getElementById("mActionsLarge").innerHTML = `
        <button class="action-btn ${l ? 'liked' : ''}" onclick="toggleLike('${id}')"><i class="fas fa-thumbs-up"></i> ${lc}</button>
        <button class="action-btn" onclick="shareV('${id}')"><i class="fas fa-share"></i> Share</button>
        <button class="action-btn download-btn" onclick="downloadV('${id}')"><i class="fas fa-download"></i> Download</button>
    `;
    const b = document.getElementById("subscribeBtn");
    if (b) { b.className = "subscribe-btn" + (s ? " subscribed" : ""); b.innerHTML = s ? '<i class="fas fa-check"></i> Subscribed' : '<i class="fas fa-bell"></i> Subscribe'; }
}
function renderRelatedVideos(cat, cid) {
    const list = document.getElementById("relatedList"); if (!list) return;
    let rel = allVideos.filter(v => v.id !== cid);
    const same = rel.filter(v => v.category === cat);
    const other = rel.filter(v => v.category !== cat);
    const final = [...same.slice(0, 12), ...other.slice(0, 8)];
    if (!final.length) { list.innerHTML = `<p style="color:var(--text3);font-size:13px;padding:12px">Ma fammach videos similaires</p>`; return; }
    list.innerHTML = final.map(v => `
        <div class="related-item" onclick="navigate('video',{id:'${v.id}'})"><div class="related-thumb"><img src="${v.thumb}" loading="lazy" onerror="this.src='https://img.youtube.com/vi/${v.id}/0.jpg'"></div><div class="related-info"><div class="related-title">${v.title}</div><div class="related-ch"><i class="fas fa-user-circle"></i> ${v.channel}</div><div class="related-cat">${v.topic}</div></div></div>`).join("");
}

function loadCategoryPage(cat) {
    const ic = { Design: "🎨", Programmation: "💻", Langues: "🗣️", Marketing: "📈", Montage: "🎬", Freelance: "💼", "Bac & Etudes": "📚", Bureautique: "📊", Autre: "📦" };
    document.getElementById("catIcon").textContent = ic[cat] || "📁";
    document.getElementById("catTitle").textContent = cat;
    const f = allVideos.filter(v => v.category === cat);
    document.getElementById("categoryGrid").innerHTML = f.map(v => `
        <div class="card" onclick="navigate('video',{id:'${v.id}'})"><div class="card-thumb"><img src="${v.thumb}" loading="lazy" onerror="this.src='https://img.youtube.com/vi/${v.id}/0.jpg'"><span class="card-badge">${v.topic}</span></div><div class="card-body"><div class="card-title">${v.title}</div><div class="card-ch"><i class="fas fa-user-circle"></i> ${v.channel}</div><div class="card-cat">${v.category}</div></div></div>`).join("");
    applyGridSize();
}

function loadLikedPage() {
    if (!user) { openAuth(); navigate("home"); return; }
    const l = S.g("likes") || {};
    const ids = Object.keys(l).filter(k => l[k].includes(user.id));
    renderGridPage("likedGrid", allVideos.filter(v => ids.includes(v.id)), "No liked videos yet");
}
function loadSubscriptionsPage() {
    if (!user) { openAuth(); navigate("home"); return; }
    const s = S.g("subs_"+user.id)||[];
    renderGridPage("subsGrid", allVideos.filter(v => s.some(x => v.channel.includes(x))), "No subscriptions yet");
}
function loadHistoryPage() {
    const h = S.g("history") || [];
    renderGridPage("historyGrid", h.map(id => allVideos.find(v => v.id === id)).filter(Boolean), "No watch history");
}
function renderGridPage(gid, list, msg) {
    const g = document.getElementById(gid);
    if (!list.length) { g.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><i class="fas fa-inbox"></i><h2>${msg}</h2></div>`; return; }
    g.innerHTML = list.map(v => `
        <div class="card" onclick="navigate('video',{id:'${v.id}'})"><div class="card-thumb"><img src="${v.thumb}" loading="lazy" onerror="this.src='https://img.youtube.com/vi/${v.id}/0.jpg'"><span class="card-badge">${v.topic}</span></div><div class="card-body"><div class="card-title">${v.title}</div><div class="card-ch"><i class="fas fa-user-circle"></i> ${v.channel}</div><div class="card-cat">${v.category}</div></div></div>`).join("");
    applyGridSize();
}

document.addEventListener("keydown", e => { if (e.key === "Escape") { closeAuth(); closeDlModal(); } });
function toggleSidebar() { const s = document.getElementById("sidebar"), m = document.getElementById("mainContent"); s.classList.toggle("hidden"); m.style.marginLeft = s.classList.contains("hidden") ? "0" : "var(--sidebar-w)"; }

applyTheme();
applyFontSize();
renderAuth();
const il = (S.g("settings") || {}).lang;
if (il) setLang(il);
</script>
