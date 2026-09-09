// ==========================================
// 7. UI.JS - واجهة المستخدم، الـ Grid، والبحث
// ==========================================

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

function setupInfiniteScroll() {
    if (observer) observer.disconnect();
    const sentinel = document.getElementById("sentinel");
    if (!sentinel) return;
    observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) renderNextBatch();
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

function toggleSidebar() { 
    const s = document.getElementById("sidebar"), m = document.getElementById("mainContent"); 
    s.classList.toggle("hidden"); 
    m.style.marginLeft = s.classList.contains("hidden") ? "0" : "var(--sidebar-w)"; 
}
