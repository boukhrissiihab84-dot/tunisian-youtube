// =====================================================================
// TUNISIAN YOUTUBE - APP.JS (SUPER STABLE DIRECT DATA.JS LOADER)
// =====================================================================

// 🚨 1. EMERGENCY FALLBACK DATABASE (ALWAYS SAFE ON TOP)
const GUARANTEED_TOUNES_COURSES = [
    { "Video_ID": "67UAnLg9WJ8", "Titre": "Tutoriel Photoshop pour Débutants en Derja", "Chaine": "@skander_b", "Categorie": "Design", "Mawdhou3": "Photoshop" },
    { "Video_ID": "vV77G_62K4Q", "Titre": "Apprendre Python de Zéro en Tunisien", "Chaine": "@TounesCode", "Categorie": "Programmation", "Mawdhou3": "Python" },
    { "Video_ID": "JmU3zFmK_Xo", "Titre": "Formation HTML & CSS b Derja Tounsia", "Chaine": "@Carthage_Geek", "Categorie": "Programmation", "Mawdhou3": "HTML/CSS" },
    { "Video_ID": "U36y8O43g18", "Titre": "Apprendre l'anglais b derja tounsia", "Chaine": "@Anglais_b_derja", "Categorie": "Langues", "Mawdhou3": "Anglais" },
    { "Video_ID": "fVw-n9_RbeU", "Titre": "Révision Bac Informatique Algorithmique", "Chaine": "@TakiAcademy", "Categorie": "Bac & Etudes", "Mawdhou3": "Bac Info" },
    { "Video_ID": "Nn03H291410", "Titre": "Figma UI/UX Design Tutorial Tunisien", "Chaine": "@designtounsi", "Categorie": "Design", "Mawdhou3": "Figma" },
    { "Video_ID": "U67kLp89Un3", "Titre": "Tutoriel Montage Vidéo CapCut PC b Derja", "Chaine": "@skander_b", "Categorie": "Montage", "Mawdhou3": "CapCut" },
    { "Video_ID": "f90UjK89La3", "Titre": "Facebook Ads Marketing Tunisie Kifech Tebda", "Chaine": "@Med_Amine_Sahnoun", "Categorie": "Marketing", "Mawdhou3": "Facebook Ads" }
];

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
const BATCH_SIZE = 24;
let user = S.g("user"), isSignUp = true;
let tempAvatar = "";
let searchTimer;

// ====== ID EXTRACTOR (MUST BE DECLARED ON TOP) ======
function extractCleanId(raw) {
    if (!raw) return "";
    let s = String(raw).trim();
    if (s.length === 11 && !s.includes("/") && !s.includes("?")) return s;
    let m = s.match(/(?:v=|\/|youtu\.be\/)([0-9A-Za-z_-]{11})/);
    return m ? m[1] : (s.length >= 11 ? s.substring(0, 11) : "");
}

// ================ ROUTER / NAVIGATION ================
function navigate(page, data = null) {
    document.getElementById("dropdown")?.classList.remove("show");
    
    let targetTab = null;
    if (page === "account") {
        page = "settings";
        targetTab = "account";
    } else if (page === "channel") {
        page = "settings";
        targetTab = "channel";
    }

    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    const target = document.getElementById("page-" + page);
    if (target) target.classList.add("active");
    
    if (page === "home") { 
        renderHome(); 
    }
    else if (page === "video" && data) { 
        loadVideoPage(data); 
    }
    else if (page === "category" && data) { 
        loadCategoryPage(data); 
    }
    else if (page === "settings") { 
        loadUserSettingsPro(); 
        if (targetTab) {
            const tabBtn = document.querySelector(`.tab-btn-pro[onclick*='${targetTab}']`);
            openSettingsTab(targetTab, tabBtn);
        } else {
            const tabBtn = document.querySelector(".tab-btn-pro.active") || document.querySelector(".tab-btn-pro");
            const tabId = tabBtn ? tabBtn.getAttribute("onclick").match(/'([^']+)'/)[1] : "account";
            openSettingsTab(tabId, tabBtn);
        }
    }
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
    const hash = window.location.hash.replace("#/", "").replace("#", "").split("/");
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

// ====== THEME & APPEARANCE ======
function applyTheme() {
    const s = S.g("settings") || { dark: 0 };
    document.documentElement.setAttribute("data-theme", s.dark ? "dark" : "light");
    const btn = document.getElementById("themeBtn");
    if (btn) btn.innerHTML = s.dark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}
function toggleTheme() {
    const s = S.g("settings") || { dark: 0, auto: 1, notif: 0, history: 1, public: 1, search: 1 };
    s.dark = s.dark ? 0 : 1;
    S.s("settings", s); applyTheme(); loadUserSettingsPro();
}
function applyFontSize() {
    const s = S.g("settings") || { fontSize: "normal" };
    document.body.classList.remove("font-small", "font-normal", "font-large");
    document.body.classList.add("font-" + (s.fontSize || "normal"));
}
function applyGridSize() {
    const s = S.g("settings") || { gridSize: "280" };
    document.querySelectorAll(".grid").forEach(g => g.style.gridTemplateColumns = `repeat(auto-fill, minmax(${s.gridSize || 280}px, 1fr))`);
}

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
    document.getElementById("authSwitch").innerHTML = isSignUp ? 'Already have an account? <b>Sign In</b>' : 'Don\'t have an account? <b>Sign Up</b>';
}
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


// ====== UNIFIED SETTINGS LOGIC PRO ======
function openSettingsTab(tabId, btn) {
    document.querySelectorAll(".settings-pane-pro").forEach(pane => pane.classList.remove("active"));
    document.querySelectorAll(".tab-btn-pro").forEach(b => b.classList.remove("active"));
    
    document.getElementById("set-pro-" + tabId)?.classList.add("active");
    if (btn) btn.classList.add("active");
}

function loadUserSettingsPro() {
    if (!user) { openAuth(); navigate('home'); return; }
    
    // Tab 1: Mon Compte
    document.getElementById("accNamePro").value = user.name || "";
    document.getElementById("accEmailPro").value = user.email || "";
    document.getElementById("accOldPassPro").value = "";
    document.getElementById("accNewPassPro").value = "";
    document.getElementById("accErrorPro").textContent = "";

    const wrap = document.getElementById("accAvatarWrapPro");
    if (wrap) {
        wrap.innerHTML = user.avatar 
            ? `<img src="${user.avatar}">` 
            : (user.name || "U")[0].toUpperCase();
    }

    // Tab 2: Ma Chaîne
    const ch = S.g("channel_" + user.id) || { name: user.name, bio: "", category: "", link: "", insta: "" };
    document.getElementById("channelNamePro").value = ch.name || "";
    document.getElementById("channelBioPro").value = ch.bio || "";
    document.getElementById("channelCatPro").value = ch.category || "";
    document.getElementById("channelLinkPro").value = ch.link || "";
    document.getElementById("channelSocialPro").value = ch.insta || "";

    // Tab 3: Préférences
    const s = S.g("settings") || { dark: 0, auto: 1, notif: 0, history: 1, public: 1, search: 1, fontSize: "normal", gridSize: "280", lang: "derja", quality: "auto" };
    ["dark", "auto"].forEach(k => {
        const el = document.getElementById("t-pro-" + k);
        if (el) {
            if (s[k]) el.classList.add("on");
            else el.classList.remove("on");
        }
    });
    const langSel = document.getElementById("langSelectPro"); if (langSel) langSel.value = s.lang || "derja";
    const fontSel = document.getElementById("fontSelectPro"); if (fontSel) fontSel.value = s.fontSize || "normal";
    const qSel = document.getElementById("qualitySelectPro"); if (qSel) qSel.value = s.quality || "auto";
}

function changeAccPicPro(e) {
    const f = e.target.files[0];
    if (f) {
        const r = new FileReader();
        r.onload = x => {
            user.avatar = x.target.result;
            S.s("user", user);
            let us = S.g("users") || [];
            let idx = us.findIndex(u => u.id === user.id);
            if (idx > -1) { us[idx] = user; S.s("users", us); }
            renderAuth();
            loadUserSettingsPro();
        };
        r.readAsDataURL(f);
    }
}

function randomizeAvatarPro() {
    if (!user) return;
    const seed = Math.random().toString(36).substring(7);
    const newAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`;
    user.avatar = newAvatar;
    S.s("user", user);
    let us = S.g("users") || [];
    let idx = us.findIndex(u => u.id === user.id);
    if (idx > -1) { us[idx] = user; S.s("users", us); }
    renderAuth();
    loadUserSettingsPro();
}

function saveAccountPro() {
    const err = document.getElementById("accErrorPro");
    err.textContent = "";
    const n = document.getElementById("accNamePro").value.trim();
    const o = document.getElementById("accOldPassPro").value;
    const np = document.getElementById("accNewPassPro").value;

    if (n) user.name = n;
    if (o || np) {
        if (o !== user.pass) { err.textContent = "كلمة السر الحالية خاطئة!"; return; }
        if (np.length < 6) { err.textContent = "كلمة السر الجديدة قصيرة جداً (6+ حروف)!"; return; }
        user.pass = np;
    }

    S.s("user", user);
    let us = S.g("users") || [];
    let idx = us.findIndex(u => u.id === user.id);
    if (idx > -1) { us[idx] = user; S.s("users", us); }
    renderAuth();
    loadUserSettingsPro();
    alert("✅ Vos informations de compte ont été mises à jour!");
}

function saveChannelPro() {
    const ch = {
        name: document.getElementById("channelNamePro").value.trim(),
        bio: document.getElementById("channelBioPro").value.trim(),
        category: document.getElementById("channelCatPro").value,
        link: document.getElementById("channelLinkPro").value.trim(),
        insta: document.getElementById("channelSocialPro").value.trim()
    };
    S.s("channel_" + user.id, ch);
    alert("✅ Vos paramètres de chaîne ont été enregistrés!");
}

function toggleSetPro(k) {
    const s = S.g("settings") || { dark: 0, auto: 1, notif: 0, history: 1, public: 1, search: 1 };
    s[k] = s[k] ? 0 : 1;
    S.s("settings", s);
    loadUserSettingsPro();
    if (k === "dark") applyTheme();
}

function setLangPro(v) {
    const s = S.g("settings") || {};
    s.lang = v; S.s("settings", s);
    const trans = { derja: "Lawwej 3la cours...", fr: "Rechercher...", en: "Search courses..." };
    document.getElementById("searchInput").placeholder = trans[v] || trans.en;
}

function setFontSizePro(v) {
    const s = S.g("settings") || {};
    s.fontSize = v; S.s("settings", s);
    applyFontSize();
}

function setQualityPro(v) {
    const s = S.g("settings") || {};
    s.quality = v; S.s("settings", s);
}

function clearHistoryPro() {
    if (confirm("Voulez-vous vraiment effacer l'historique ?")) {
        S.r("history");
        alert("🧹 Historique effacé!");
    }
}

function clearLikesPro() {
    if (confirm("Voulez-vous effacer vos likes ?")) {
        S.r("likes");
        alert("💔 Likes réinitialisées!");
    }
}

function resetAllAppDataPro() {
    if (confirm("⚠️ ATTENTION : Cela va supprimer absolument toutes vos données locales. Confirmer ?")) {
        localStorage.clear();
        alert("🔄 Réinitialisation réussie. Rechargement...");
        window.location.reload();
    }
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
        const av = user.avatar ? `<img src="${user.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">` : user.name[0].toUpperCase();
        inp = `<div class="cmt-form-large"><div class="cmt-avatar-large">${av}</div><div class="cmt-input-wrap-large"><input class="cmt-input-large" id="cmtInputLarge" placeholder="Add a comment..." onkeypress="if(event.key==='Enter')postCmt('${id}')"><div class="cmt-btns-large"><button class="cmt-submit-large" onclick="postCmt('${id}')">Comment</button></div></div></div>`;
    } else {
        inp = `<p class="cmt-login-large"><a onclick="openAuth()">Sign in</a> to comment</p>`;
    }
    let list = `<div class="cmt-list-large">`;
    if (!cmts.length) list += `<p style="color:var(--text3);font-size:13px;padding:8px 0">No comments yet. Be the first! 💬</p>`;
    else cmts.forEach(c => { list += `<div class="cmt-item-large"><div class="cmt-avatar-large" style="width:32px;height:32px;font-size:12px">${c.name ? c.name[0].toUpperCase() : "U"}</div><div style="flex:1"><span class="cmt-user-large">@${c.name}</span>${user && user.id === c.uid ? `<button class="cmt-del-large" onclick="delCmt('${id}','${c.id}')"><i class="fas fa-trash"></i></button>` : ""}<p class="cmt-text-large">${c.text}</p><span class="cmt-time-large">${c.time}</span></div></div>`; });
    list += `</div>`;
    s.innerHTML = `<h3>💬 ${cmts.length} Comments</h3>${inp}${list}`;
}

function shareV(id) { const u = `https://www.youtube.com/watch?v=${id}`; if (navigator.share) navigator.share({ title: "Cours Tounsi", url: u }); else { navigator.clipboard.writeText(u); alert("✅ Link copied!"); } }

// ====== DOWNLOAD ======
function downloadV(id) {
    const url = `https://www.youtube.com/watch?v=${id}`;
    const encoded = encodeURIComponent(url);
    const cobalt = document.getElementById("dlCobalt");
    const ssyt = document.getElementById("dlSSYT");
    const y2m = document.getElementById("dlY2Mate");
    if (cobalt) cobalt.href = `https://cobalt.tools/?u=${encoded}`;
    if (ssyt) ssyt.href = `https://ssyoutube.com/watch?v=${id}`;
    if (y2m) y2m.href = `https://www.y2mate.com/youtube/${id}`;
    document.getElementById("dlModal")?.classList.add("active");
}
function closeDlModal() { document.getElementById("dlModal")?.classList.remove("active"); }


// ====== DATA LOADING SYSTEM ======
function initApp(raw) {
    // If raw database is missing or empty, force Emergency Fallback
    if (!Array.isArray(raw) || raw.length === 0) {
        console.warn("⚠️ Database empty! Forcing GUARANTEED fallback...");
        raw = GUARANTEED_TOUNES_COURSES;
    }
    
    allVideos = raw.map(v => {
        const id = extractCleanId(v.Video_ID || v.video_id || v.id || v.Lien || v.url || "");
        return { 
            id, 
            title: v.Titre || v.title || "", 
            channel: v.Chaine || v.channel || "", 
            category: v.Categorie || v.category || "Autre", 
            topic: v.Mawdhou3 || v.topic || "Général", 
            thumb: `https://img.youtube.com/vi/${id}/mqdefault.jpg` 
        };
    }).filter(v => v.id && v.id.length === 11);
    
    // Safety Net: if somehow filtering produced 0 videos, reload with GUARANTEED
    if (allVideos.length === 0) {
        console.error("🚨 Zero videos passed the filter! Hard reloading with GUARANTEED data...");
        allVideos = GUARANTEED_TOUNES_COURSES.map(v => {
            const id = v.Video_ID;
            return {
                id,
                title: v.Titre,
                channel: v.Chaine,
                category: v.Categorie,
                topic: v.Mawdhou3,
                thumb: `https://img.youtube.com/vi/${id}/mqdefault.jpg`
            };
        });
    }
    
    document.getElementById("vCount").textContent = allVideos.length + " cours";
    buildSide(); buildChips(); initRouter();
}

// 🟢 BULLETPROOF DATABASE ROUTER LOADING
try {
    if (typeof rawVideosData !== 'undefined' && Array.isArray(rawVideosData) && rawVideosData.length > 0) {
        console.log("✅ rawVideosData loaded from data.js");
        initApp(rawVideosData);
    } else {
        throw new Error("data.js not defined or empty");
    }
} catch (e) {
    console.warn("⚠️ data.js loading failed. Trying JSON fetch...", e);
    fetch(`tounes_courses.json?nocache=${Date.now()}`, { cache: "no-store" })
        .then(r => {
            if (!r.ok) throw new Error("JSON Fetch failed");
            return r.json();
        })
        .then(d => {
            console.log("✅ Loaded from JSON successfully.");
            initApp(d);
        })
        .catch(err => {
            console.error("🚨 Both data.js and JSON failed. Running Emergency Fallback...");
            initApp(GUARANTEED_TOUNES_COURSES);
        });
}

function buildSide() {
    const cats = {}, subs = {};
    allVideos.forEach(v => { cats[v.category] = (cats[v.category] || 0) + 1; if (v.topic !== "Général") subs[v.topic] = (subs[v.topic] || 0) + 1; });
    const icons = { Design: "🎨", Programmation: "💻", Langues: "🗣️", Marketing: "📈", Montage: "🎬", Freelance: "💼", "Bac & Etudes": "📚", Bureautique: "📊", Autre: "📦" };
    const cl = document.getElementById("catList");
    if (cl) {
        cl.innerHTML = `<button class="side-btn active" onclick="showAll()">🌐 All <span class="side-cnt">${allVideos.length}</span></button>`;
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
    renderNextBatch();
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
    const batch = activeList.slice(displayedCount, displayedCount + BATCH_SIZE);
    if (!batch.length) return;
    displayedCount += batch.length;
    g.insertAdjacentHTML("beforeend", batch.map(v => `
        <div class="card" onclick="navigate('video', {id:'${v.id}'})">
            <div class="card-thumb"><img src="${v.thumb}" loading="lazy" onerror="this.src='https://img.youtube.com/vi/${v.id}/0.jpg'"><span class="card-badge">${v.topic}</span></div>
            <div class="card-body"><div class="card-title">${v.title}</div><div class="card-ch"><i class="fas fa-user-circle"></i> ${v.channel}</div><div class="card-cat">${v.category}</div></div>
        </div>
    `).join(""));
}

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
if (il) setLangPro(il);
