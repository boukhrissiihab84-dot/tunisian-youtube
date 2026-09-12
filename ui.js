// ==========================================
// 7. UI.JS - YouTube-Style UI + Touch Tounsi 🇹🇳
// ==========================================

// --- YouTube SVG Icons ---
const YT_ICONS = {
    home: `<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M4 21V10.08l8-6.96 8 6.96V21h-6v-6h-4v6H4z"/></svg>`,
    trending: `<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M17.53 11.2c-.23-.3-.5-.56-.76-.82-.65-.6-1.4-1.03-2.03-1.66C13.3 7.26 13 5.64 13.44 4c-2.13 1.17-3.5 3.2-3.72 5.52-.04.4-.02.8.06 1.18.08.4-.04.68-.32.93-.28.24-.64.3-.97.2-.34-.1-.55-.4-.6-.74-.02-.13-.02-.26-.01-.39-.46.72-.7 1.56-.68 2.42 0 .24.03.48.08.72.3 1.3 1.23 2.38 2.44 2.94 1.2.56 2.6.5 3.74-.14 1.14-.64 1.9-1.8 2.04-3.1.14-1.3-.3-2.6-1.2-3.54z"/></svg>`,
    subs: `<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M10 18v-6l5 3-5 3zm7-15H7v1h10V3zm3 3H4v1h16V6zm2 3H2v12h20V9zM3 20V10h18v10H3z"/></svg>`,
    library: `<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z"/></svg>`,
    history: `<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M14.97 16.95L10 13.87V7h2v5.76l4.03 2.49-1.06 1.7zM22 12c0 5.51-4.49 10-10 10S2 17.51 2 12h1c0 4.96 4.04 9 9 9s9-4.04 9-9-4.04-9-9-9C8.81 3 5.92 4.64 4.28 7.38c-.11.18-.22.37-.31.56L3.94 8H8v1H2.5V3.5h1V7c.22-.39.45-.73.72-1.08C6.04 3.46 8.83 2 12 2c5.51 0 10 4.49 10 10z"/></svg>`,
    liked: `<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M18.77 11h-4.23l1.52-4.94C16.38 5.03 15.54 4 14.38 4c-.58 0-1.14.24-1.52.65L7 11H1v11h6l.97.97c.29.29.67.45 1.07.45h8.53c1.1 0 2.07-.72 2.38-1.78l1.72-5.77c.43-1.44-.22-2.97-1.52-3.63zM7 21H2v-9h5v9zm13.83-7.17l-1.72 5.77c-.1.35-.43.58-.8.58H9.83L14.2 5.6c.13-.14.3-.22.48-.22.39 0 .67.32.55.7l-1.8 5.86c-.1.33.02.68.3.88.14.1.3.15.47.15h4.57c.57 0 .98.55.83 1.09z"/></svg>`,
};

const CAT_ICONS = {
    Design: `<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M12 22C6.49 22 2 17.51 2 12S6.49 2 12 2s10 4.04 10 9c0 3.31-2.69 6-6 6h-1.77c-.28 0-.5.22-.5.5 0 .12.05.23.13.33.41.47.64 1.06.64 1.67A2.5 2.5 0 0112 22zm0-18c-4.41 0-8 3.59-8 8s3.59 8 8 8c.28 0 .5-.22.5-.5a.54.54 0 00-.14-.35c-.41-.46-.63-1.05-.63-1.65a2.5 2.5 0 012.5-2.5H16c2.21 0 4-1.79 4-4 0-3.86-3.59-7-8-7z"/><circle cx="6.5" cy="11.5" r="1.5"/><circle cx="9.5" cy="7.5" r="1.5"/><circle cx="14.5" cy="7.5" r="1.5"/><circle cx="17.5" cy="11.5" r="1.5"/></svg>`,
    Programmation: `<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0L19.2 12l-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>`,
    Langues: `<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0014.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/></svg>`,
    Marketing: `<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></svg>`,
    Montage: `<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/></svg>`,
    Freelance: `<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-2 .89-2 2v11c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/></svg>`,
    "Bac & Etudes": `<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/></svg>`,
    Bureautique: `<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z"/></svg>`,
    Autre: `<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z"/></svg>`
};

// =====================
// BUILD SIDEBAR (YouTube)
// =====================
function buildSide() {
    const cats = {}, subs = {};
    allVideos.forEach(v => {
        cats[v.category] = (cats[v.category] || 0) + 1;
        if (v.topic !== "Général") subs[v.topic] = (subs[v.topic] || 0) + 1;
    });

    const cl = document.getElementById("catList");
    if (cl) {
        cl.innerHTML = `
            <div class="yt-side-section">
                <button class="yt-side-btn active" onclick="showAll()">
                    ${YT_ICONS.home}<span>الرئيسية</span>
                </button>
                <button class="yt-side-btn" onclick="navigate('trending')">
                    ${YT_ICONS.trending}<span>الرائج 🔥</span>
                </button>
                <button class="yt-side-btn" onclick="navigate('subscriptions')">
                    ${YT_ICONS.subs}<span>الاشتراكات</span>
                </button>
            </div>
            <div class="yt-side-divider"></div>
            <div class="yt-side-section">
                <h3 class="yt-side-heading">🇹🇳 دورات تونسية</h3>
                <button class="yt-side-btn" onclick="navigate('library')">
                    ${YT_ICONS.library}<span>المكتبة</span>
                </button>
                <button class="yt-side-btn" onclick="navigate('history')">
                    ${YT_ICONS.history}<span>السجل</span>
                </button>
                <button class="yt-side-btn" onclick="navigate('liked')">
                    ${YT_ICONS.liked}<span>إعجابات</span>
                </button>
            </div>
            <div class="yt-side-divider"></div>
            <div class="yt-side-section">
                <h3 class="yt-side-heading">التصنيفات</h3>
        `;
        Object.entries(cats).sort((a, b) => b[1] - a[1]).forEach(([c, n]) => {
            cl.innerHTML += `
                <button class="yt-side-btn" onclick="navigate('category','${c}')">
                    ${CAT_ICONS[c] || CAT_ICONS.Autre}<span>${c}</span>
                    <span class="yt-side-count">${n}</span>
                </button>`;
        });
        cl.innerHTML += `</div>`;
    }

    const sl = document.getElementById("subList");
    if (sl) {
        sl.innerHTML = `<div class="yt-side-divider"></div><div class="yt-side-section"><h3 class="yt-side-heading">المواضيع</h3>`;
        Object.entries(subs).sort((a, b) => b[1] - a[1]).slice(0, 15).forEach(([s, n]) => {
            sl.innerHTML += `
                <button class="yt-side-btn yt-side-sub" onclick="filterSubHome('${s}')">
                    <span class="yt-side-dot"></span><span>${s}</span>
                    <span class="yt-side-count">${n}</span>
                </button>`;
        });
        sl.innerHTML += `</div>`;
    }
}

// =====================
// BUILD CHIPS (YouTube Pills)
// =====================
function buildChips() {
    const fb = document.getElementById("filterBar");
    if (!fb) return;
    const cats = [...new Set(allVideos.map(v => v.category))];
    const labels = {
        Programmation: "💻 برمجة", Design: "🎨 تصميم", Langues: "🗣️ لغات",
        Marketing: "📈 تسويق", Montage: "🎬 مونتاج", Freelance: "💼 فريلانس",
        "Bac & Etudes": "📚 بكالوريا", Bureautique: "📊 مكتبية"
    };
    fb.innerHTML = `<button class="yt-chip active" onclick="showAll()">الكل</button>`;
    cats.forEach(c => {
        fb.innerHTML += `<button class="yt-chip" onclick="filterChipHome('${c}')">${labels[c] || c}</button>`;
    });
}

// =====================
// RENDER ENGINE
// =====================
function renderHome() { apply(); }

function setListAndRender(list) {
    activeList = list;
    displayedCount = 0;
    const g = document.getElementById("grid");
    const e = document.getElementById("empty");
    if (g) g.innerHTML = "";
    if (!activeList.length) {
        if (e) {
            e.style.display = "flex";
            e.innerHTML = `<div class="yt-empty">
                <svg viewBox="0 0 24 24" width="120" height="120" fill="#717171"><path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/></svg>
                <h2>ما فما حتى فيديو 🇹🇳</h2>
                <p>جرّب تبدّل الفلتر ولا البحث</p>
            </div>`;
        }
        return;
    }
    if (e) e.style.display = "none";
    setupInfiniteScroll();
    renderNextBatch();
}

function setupInfiniteScroll() {
    if (observer) observer.disconnect();
    const sentinel = document.getElementById("sentinel");
    if (!sentinel) return;
    observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) renderNextBatch();
    }, { rootMargin: "400px" });
    observer.observe(sentinel);
}

// --- YouTube Card Template ---
function ytCard(v) {
    const views = v.views ? formatViews(v.views) + " مشاهدة" : "";
    const time = v.date ? timeAgo(v.date) : "";
    const meta = [views, time].filter(Boolean).join(" • ") || v.category + " • " + v.topic;
    return `
        <div class="yt-card" onclick="navigate('video',{id:'${v.id}'})">
            <div class="yt-thumb-wrap">
                <img class="yt-thumb" src="${v.thumb}" alt="${v.title}" loading="lazy"
                     onerror="this.src='https://img.youtube.com/vi/${v.id}/hqdefault.jpg'">
                ${v.duration ? `<span class="yt-duration">${v.duration}</span>` : ""}
                <span class="yt-badge-tounes">🇹🇳</span>
            </div>
            <div class="yt-card-info">
                <div class="yt-ch-avatar">${(v.channel || "?").charAt(0).toUpperCase()}</div>
                <div class="yt-card-text">
                    <h3 class="yt-card-title">${v.title}</h3>
                    <p class="yt-card-channel">${v.channel}</p>
                    <p class="yt-card-meta">${meta}</p>
                </div>
                <button class="yt-card-menu" onclick="event.stopPropagation()" aria-label="المزيد">⋮</button>
            </div>
        </div>`;
}

function renderNextBatch() {
    const g = document.getElementById("grid");
    if (!g) return;
    const batch = activeList.slice(displayedCount, displayedCount + BATCH_SIZE);
    if (!batch.length) return;
    displayedCount += batch.length;
    g.insertAdjacentHTML("beforeend", batch.map(v => ytCard(v)).join(""));
}

// =====================
// FILTERS
// =====================
function showAll() {
    currentFilter = { cat: null, sub: null, search: "" };
    const si = document.getElementById("searchInput");
    if (si) si.value = "";
    document.querySelectorAll(".yt-side-btn,.yt-chip").forEach(b => b.classList.remove("active"));
    document.querySelector(".yt-chip")?.classList.add("active");
    document.querySelectorAll("#catList .yt-side-btn")[0]?.classList.add("active");
    navigate("home");
}

function filterChipHome(c) {
    currentFilter.cat = c;
    currentFilter.sub = null;
    document.querySelectorAll(".yt-chip").forEach(b => b.classList.remove("active"));
    event?.target?.classList.add("active");
    navigate("home");
}

function filterSubHome(s) {
    currentFilter.sub = s;
    document.querySelectorAll("#subList .yt-side-btn").forEach(b => b.classList.remove("active"));
    event?.target?.closest(".yt-side-btn")?.classList.add("active");
    navigate("home");
}

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
    if (currentFilter.search) r = r.filter(v =>
        (v.title + v.channel + v.topic + v.category).toLowerCase().includes(currentFilter.search)
    );
    setListAndRender(r);
}

// =====================
// PAGE LOADERS
// =====================
function loadCategoryPage(cat) {
    const el = document.getElementById("catIcon");
    if (el) el.innerHTML = CAT_ICONS[cat] || CAT_ICONS.Autre;
    const ct = document.getElementById("catTitle");
    if (ct) ct.textContent = cat;
    const cg = document.getElementById("categoryGrid");
    if (cg) cg.innerHTML = allVideos.filter(v => v.category === cat).map(v => ytCard(v)).join("");
    applyGridSize();
}

function loadLikedPage() {
    if (!user) { openAuth(); navigate("home"); return; }
    const l = S.g("likes") || {};
    const ids = Object.keys(l).filter(k => l[k].includes(user.id));
    renderGridPage("likedGrid", allVideos.filter(v => ids.includes(v.id)), "ما عندك حتى فيديو معجب بيه");
}

function loadSubscriptionsPage() {
    if (!user) { openAuth(); navigate("home"); return; }
    const s = S.g("subs_" + user.id) || [];
    renderGridPage("subsGrid", allVideos.filter(v => s.some(x => v.channel.includes(x))), "ما انت مشترك في حتى قناة");
}

function loadHistoryPage() {
    const h = S.g("history") || [];
    renderGridPage("historyGrid", h.map(id => allVideos.find(v => v.id === id)).filter(Boolean), "السجل فارغ");
}

function renderGridPage(gid, list, msg) {
    const g = document.getElementById(gid);
    if (!g) return;
    if (!list.length) {
        g.innerHTML = `<div class="yt-empty" style="grid-column:1/-1">
            <svg viewBox="0 0 24 24" width="96" height="96" fill="#717171"><path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/></svg>
            <h2>${msg}</h2></div>`;
        return;
    }
    g.innerHTML = list.map(v => ytCard(v)).join("");
    applyGridSize();
}

function toggleSidebar() {
    const s = document.getElementById("sidebar");
    if (!s) return;
    
    // على الشاشات الكبيرة: بدّل بين expanded و mini
    if (window.innerWidth > 900) {
        s.classList.toggle("mini");
        document.body.classList.toggle("sidebar-mini", s.classList.contains("mini"));
    } 
    // على الموبايل: افتح/سكّر الـ drawer
    else {
        s.classList.toggle("show");
        const bd = document.querySelector(".side-backdrop");
        if (bd) bd.classList.toggle("show", s.classList.contains("show"));
    }
}

function closeMobileSidebar() {
    const s = document.getElementById("sidebar");
    const bd = document.querySelector(".side-backdrop");
    if (s) s.classList.remove("show");
    if (bd) bd.classList.remove("show");
}

// =====================
// UTILITIES
// =====================
function formatViews(n) {
    if (!n) return "";
    n = parseInt(n);
    if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
    return n.toString();
}

function timeAgo(dateStr) {
    if (!dateStr) return "";
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return "توّا";
    if (diff < 3600) return Math.floor(diff / 60) + " دقيقة";
    if (diff < 86400) return Math.floor(diff / 3600) + " ساعات";
    if (diff < 2592000) return Math.floor(diff / 86400) + " أيام";
    if (diff < 31536000) return Math.floor(diff / 2592000) + " أشهر";
    return Math.floor(diff / 31536000) + " سنين";
}
