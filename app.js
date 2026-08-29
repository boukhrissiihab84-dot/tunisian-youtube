// =====================================================================
// TUNISIAN YOUTUBE - APP.JS (LOADER 100% ANTI-CACHE)
// =====================================================================

let allVideos = [];
let currentFilter = { category: null, subCategory: null, search: "" };

function initApp(rawList) {
    if (!rawList || rawList.length === 0) {
        document.getElementById("videoGrid").innerHTML = "<p style='color:red; text-align:center; grid-column:1/-1;'>⚠️ Aucun cours trouvé.</p>";
        return;
    }

    allVideos = rawList.map(v => {
        const vidId = v.Video_ID || v.video_id || v.id || extractId(v.Lien || v.url || "");
        return {
            id: vidId,
            title: v.Titre || v.title || "Cours Tounsi",
            channel: v.Chaine || v.channel || "Chaine Tunisienne",
            category: v.Categorie || v.category || "Autre",
            topic: v.Mawdhou3 || v.topic || v.sub_category || "Général",
            url: v.Lien || v.url || `https://www.youtube.com/watch?v=${vidId}`,
            thumbnail: `https://img.youtube.com/vi/${vidId}/hqdefault.jpg`
        };
    }).filter(v => v.id && v.id.length === 11);

    document.getElementById("videoCount").textContent = `${allVideos.length} cours 🇹🇳`;
    buildSidebar();
    buildChips();
    renderVideos(allVideos);
}

function extractId(url) {
    const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
    return match ? match[1] : "";
}

// ⚡ DYNAMIC LOADER 100% ANTI-CACHE ⚡
const timestamp = new Date().getTime();
const scriptLoader = document.createElement("script");
scriptLoader.src = `data.js?v=${timestamp}`;
scriptLoader.onload = () => {
    if (typeof rawVideosData !== 'undefined' && Array.isArray(rawVideosData)) {
        console.log("✅ data.js chargée, vids:", rawVideosData.length);
        initApp(rawVideosData);
    } else {
        fallbackToJSON();
    }
};
scriptLoader.onerror = () => {
    fallbackToJSON();
};
document.head.appendChild(scriptLoader);

function fallbackToJSON() {
    fetch(`tounes_courses.json?v=${timestamp}`, { cache: "no-store" })
        .then(res => res.json())
        .then(jsonData => initApp(jsonData))
        .catch(err => {
            document.getElementById("videoGrid").innerHTML = "<p style='color:red; text-align:center; grid-column:1/-1;'>Mochkla fel chargement des vidéos.</p>";
        });
}

// ======================= SIDEBAR =======================
function buildSidebar() {
    const cats = {};
    const subCats = {};

    allVideos.forEach(v => {
        cats[v.category] = (cats[v.category] || 0) + 1;
        if (v.topic && v.topic !== "Général") {
            subCats[v.topic] = (subCats[v.topic] || 0) + 1;
        }
    });

    const catList = document.getElementById("categoryList");
    catList.innerHTML = `<button class="sidebar-btn active" onclick="filterByCategory(null, this)">🌐 El Kol <span class="cat-count">${allVideos.length}</span></button>`;
    
    const catIcons = {
        "Design": "🎨", "Programmation": "💻", "Langues": "🗣️",
        "Marketing": "📈", "Montage": "🎬", "Freelance": "💼",
        "Bac & Etudes": "📚", "Bureautique": "📊", "Autre": "📦"
    };

    Object.entries(cats).sort((a,b) => b[1] - a[1]).forEach(([cat, count]) => {
        const icon = catIcons[cat] || "📦";
        catList.innerHTML += `<button class="sidebar-btn" onclick="filterByCategory('${cat}', this)">${icon} ${cat} <span class="cat-count">${count}</span></button>`;
    });

    const subList = document.getElementById("subCategoryList");
    subList.innerHTML = "";
    Object.entries(subCats).sort((a,b) => b[1] - a[1]).slice(0, 20).forEach(([sub, count]) => {
        subList.innerHTML += `<button class="sidebar-btn" onclick="filterByTopic('${sub}', this)">📌 ${sub} <span class="cat-count">${count}</span></button>`;
    });
}

// ======================= CHIPS =======================
function buildChips() {
    const chipsDiv = document.getElementById("filterChips");
    const cats = [...new Set(allVideos.map(v => v.category))];
    
    chipsDiv.innerHTML = `<button class="chip active" onclick="showAll()">El Kol</button>`;
    cats.forEach(cat => {
        chipsDiv.innerHTML += `<button class="chip" onclick="filterByChip('${cat}', this)">${cat}</button>`;
    });
}

// ======================= RENDER =======================
function renderVideos(videos) {
    const grid = document.getElementById("videoGrid");
    const empty = document.getElementById("emptyState");

    if (!videos || videos.length === 0) {
        grid.innerHTML = "";
        empty.style.display = "block";
        return;
    }
    empty.style.display = "none";

    grid.innerHTML = videos.map(v => `
        <div class="video-card" onclick="openVideo('${v.id}', '${escapeQuotes(v.title)}', '${escapeQuotes(v.channel)}')">
            <div class="video-thumbnail">
                <img src="${v.thumbnail}" alt="${v.title}" loading="lazy" onerror="this.src='https://img.youtube.com/vi/${v.id}/0.jpg'">
                <span class="sub-cat-badge">${v.topic}</span>
            </div>
            <div class="video-info">
                <div class="video-title">${v.title}</div>
                <div class="video-channel">📺 ${v.channel}</div>
                <div class="video-category">📁 ${v.category}</div>
            </div>
        </div>
    `).join("");
}

function escapeQuotes(str) {
    return (str || "").replace(/'/g, "\\'").replace(/"/g, '\\"');
}

// ======================= FILTERS =======================
function showAll() {
    currentFilter = { category: null, subCategory: null, search: "" };
    document.getElementById("searchInput").value = "";
    document.querySelectorAll(".sidebar-btn").forEach(b => b.classList.remove("active"));
    document.querySelector("#categoryList .sidebar-btn")?.classList.add("active");
    document.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
    document.querySelector(".chip")?.classList.add("active");
    applyFilters();
}

function filterByCategory(cat, btn) {
    currentFilter.category = cat;
    currentFilter.subCategory = null;
    document.querySelectorAll("#categoryList .sidebar-btn").forEach(b => b.classList.remove("active"));
    if (btn) btn.classList.add("active");
    applyFilters();
}

function filterByTopic(topic, btn) {
    currentFilter.subCategory = topic;
    document.querySelectorAll("#subCategoryList .sidebar-btn").forEach(b => b.classList.remove("active"));
    if (btn) btn.classList.add("active");
    applyFilters();
}

function filterByChip(cat, btn) {
    currentFilter.category = cat;
    currentFilter.subCategory = null;
    document.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
    if (btn) btn.classList.add("active");
    applyFilters();
}

function searchVideos() {
    currentFilter.search = document.getElementById("searchInput").value.toLowerCase();
    applyFilters();
}

function applyFilters() {
    let filtered = allVideos;

    if (currentFilter.category) {
        filtered = filtered.filter(v => v.category === currentFilter.category);
    }
    if (currentFilter.subCategory) {
        filtered = filtered.filter(v => v.topic === currentFilter.subCategory);
    }
    if (currentFilter.search) {
        const s = currentFilter.search;
        filtered = filtered.filter(v =>
            (v.title || "").toLowerCase().includes(s) ||
            (v.channel || "").toLowerCase().includes(s) ||
            (v.topic || "").toLowerCase().includes(s) ||
            (v.category || "").toLowerCase().includes(s)
        );
    }

    renderVideos(filtered);
    updateActiveFilters();
}

function updateActiveFilters() {
    const div = document.getElementById("activeFilters");
    let html = "";
    if (currentFilter.category) {
        html += `<span class="active-filter-tag">📚 ${currentFilter.category} <span class="remove" onclick="filterByCategory(null)">✕</span></span>`;
    }
    if (currentFilter.subCategory) {
        html += `<span class="active-filter-tag">📌 ${currentFilter.subCategory} <span class="remove" onclick="filterByTopic(null)">✕</span></span>`;
    }
    div.innerHTML = html;
}

// ======================= MODAL PLAYER =======================
function openVideo(videoId, title, channel) {
    const overlay = document.getElementById("modalOverlay");
    const player = document.getElementById("videoPlayer");
    const modalTitle = document.getElementById("modalTitle");
    const modalChannel = document.getElementById("modalChannel");

    player.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1" allowfullscreen allow="autoplay"></iframe>`;
    modalTitle.textContent = title;
    modalChannel.textContent = `📺 ${channel}`;

    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeModal() {
    const overlay = document.getElementById("modalOverlay");
    const player = document.getElementById("videoPlayer");
    overlay.classList.remove("active");
    player.innerHTML = "";
    document.body.style.overflow = "";
}

document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeModal();
});

function toggleSidebar() {
    const sb = document.getElementById("sidebar");
    const mc = document.getElementById("mainContent");
    sb.classList.toggle("hidden");
    mc.style.marginLeft = sb.classList.contains("hidden") ? "0" : "240px";
}
