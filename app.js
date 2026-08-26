// =====================================================================
// TUNISIAN YOUTUBE - MAIN APP
// =====================================================================

let allVideos = [];
let currentFilter = { category: null, subCategory: null, difficulty: null, search: "" };

// Load data
fetch("enhanced_database.json")
    .then(res => res.json())
    .then(data => {
        allVideos = data;
        document.getElementById("videoCount").textContent = `${data.length} cours`;
        buildSidebar();
        buildChips();
        renderVideos(allVideos);
    })
    .catch(err => {
        console.error("Error loading database:", err);
        document.getElementById("videoGrid").innerHTML = "<p style='color:red'>Error loading videos. Check enhanced_database.json exists.</p>";
    });

// ======================= SIDEBAR =======================
function buildSidebar() {
    // Main categories
    const cats = {};
    const subCats = {};

    allVideos.forEach(v => {
        const mc = v.main_category || "Autre";
        const sc = v.sub_category || "Général";
        cats[mc] = (cats[mc] || 0) + 1;
        subCats[sc] = (subCats[sc] || 0) + 1;
    });

    const catList = document.getElementById("categoryList");
    catList.innerHTML = `<button class="sidebar-btn active" onclick="filterByCategory(null, this)">🌐 El Kol <span class="cat-count">${allVideos.length}</span></button>`;
    
    const catIcons = {
        "Design": "🎨", "Programmation": "💻", "Langues": "🗣️",
        "Marketing": "📈", "Montage Vidéo": "🎬", "Freelance": "💼",
        "Bureautique": "📊", "Autre": "📦"
    };

    Object.entries(cats)
        .sort((a, b) => b[1] - a[1])
        .forEach(([cat, count]) => {
            const icon = catIcons[cat] || "📦";
            catList.innerHTML += `<button class="sidebar-btn" onclick="filterByCategory('${cat}', this)">${icon} ${cat} <span class="cat-count">${count}</span></button>`;
        });

    // Sub categories
    const subList = document.getElementById("subCategoryList");
    subList.innerHTML = "";
    Object.entries(subCats)
        .sort((a, b) => b[1] - a[1])
        .forEach(([sub, count]) => {
            subList.innerHTML += `<button class="sidebar-btn" onclick="filterBySubCategory('${sub}', this)">📌 ${sub} <span class="cat-count">${count}</span></button>`;
        });
}

// ======================= CHIPS =======================
function buildChips() {
    const chipsDiv = document.getElementById("filterChips");
    const cats = [...new Set(allVideos.map(v => v.main_category || "Autre"))];
    
    chipsDiv.innerHTML = `<button class="chip active" onclick="showAll()">El Kol</button>`;
    cats.forEach(cat => {
        chipsDiv.innerHTML += `<button class="chip" onclick="filterByChip('${cat}', this)">${cat}</button>`;
    });
}

// ======================= RENDER =======================
function renderVideos(videos) {
    const grid = document.getElementById("videoGrid");
    const empty = document.getElementById("emptyState");

    if (videos.length === 0) {
        grid.innerHTML = "";
        empty.style.display = "block";
        return;
    }

    empty.style.display = "none";

    grid.innerHTML = videos.map(v => {
        const diffClass = (v.difficulty || "").toLowerCase().includes("débutant") ? "beginner" :
                          (v.difficulty || "").toLowerCase().includes("inter") ? "intermediate" : "advanced";
        const diffLabel = v.difficulty || "Débutant";

        return `
        <div class="video-card" onclick="openVideo('${v.video_id}', '${escapeQuotes(v.title)}', '${escapeQuotes(v.channel)}', ${JSON.stringify(v.tags || []).replace(/"/g, '&quot;')})">
            <div class="video-thumbnail">
                <img src="${v.thumbnail}" alt="${v.title}" loading="lazy"
                     onerror="this.src='https://img.youtube.com/vi/${v.video_id}/hqdefault.jpg'">
                <span class="difficulty-badge ${diffClass}">${diffLabel}</span>
                <span class="sub-cat-badge">${v.sub_category || ""}</span>
            </div>
            <div class="video-info">
                <div class="video-title">${v.title}</div>
                <div class="video-channel">${v.channel}</div>
                <div class="video-category">${v.main_category} → ${v.sub_category}</div>
            </div>
        </div>`;
    }).join("");
}

function escapeQuotes(str) {
    return (str || "").replace(/'/g, "\\'").replace(/"/g, '\\"');
}

// ======================= FILTERS =======================
function showAll() {
    currentFilter = { category: null, subCategory: null, difficulty: null, search: "" };
    document.getElementById("searchInput").value = "";
    clearActiveButtons();
    applyFilters();
    updateActiveFilters();
    
    document.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
    document.querySelector(".chip").classList.add("active");
}

function filterByCategory(cat, btn) {
    currentFilter.category = cat;
    currentFilter.subCategory = null;
    highlightSidebarBtn(btn, "categoryList");
    applyFilters();
    updateActiveFilters();
}

function filterBySubCategory(sub, btn) {
    currentFilter.subCategory = sub;
    highlightSidebarBtn(btn, "subCategoryList");
    applyFilters();
    updateActiveFilters();
}

function filterByDifficulty(diff) {
    currentFilter.difficulty = diff === "all" ? null : diff;
    applyFilters();
    updateActiveFilters();
}

function filterByChip(cat, btn) {
    currentFilter.category = cat;
    currentFilter.subCategory = null;
    document.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
    btn.classList.add("active");
    applyFilters();
    updateActiveFilters();
}

function searchVideos() {
    currentFilter.search = document.getElementById("searchInput").value.toLowerCase();
    applyFilters();
}

function applyFilters() {
    let filtered = allVideos;

    if (currentFilter.category) {
        filtered = filtered.filter(v => v.main_category === currentFilter.category);
    }
    if (currentFilter.subCategory) {
        filtered = filtered.filter(v => v.sub_category === currentFilter.subCategory);
    }
    if (currentFilter.difficulty) {
        filtered = filtered.filter(v => v.difficulty === currentFilter.difficulty);
    }
    if (currentFilter.search) {
        const s = currentFilter.search;
        filtered = filtered.filter(v =>
            (v.title || "").toLowerCase().includes(s) ||
            (v.channel || "").toLowerCase().includes(s) ||
            (v.sub_category || "").toLowerCase().includes(s) ||
            (v.topic_title || "").toLowerCase().includes(s) ||
            (v.tags || []).some(t => t.toLowerCase().includes(s))
        );
    }

    renderVideos(filtered);
}

function updateActiveFilters() {
    const div = document.getElementById("activeFilters");
    let html = "";
    if (currentFilter.category) {
        html += `<span class="active-filter-tag">📚 ${currentFilter.category} <span class="remove" onclick="currentFilter.category=null;applyFilters();updateActiveFilters();">✕</span></span>`;
    }
    if (currentFilter.subCategory) {
        html += `<span class="active-filter-tag">📌 ${currentFilter.subCategory} <span class="remove" onclick="currentFilter.subCategory=null;applyFilters();updateActiveFilters();">✕</span></span>`;
    }
    if (currentFilter.difficulty) {
        html += `<span class="active-filter-tag">📊 ${currentFilter.difficulty} <span class="remove" onclick="currentFilter.difficulty=null;applyFilters();updateActiveFilters();">✕</span></span>`;
    }
    div.innerHTML = html;
}

function highlightSidebarBtn(btn, listId) {
    if (!btn) return;
    document.querySelectorAll(`#${listId} .sidebar-btn`).forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
}

function clearActiveButtons() {
    document.querySelectorAll(".sidebar-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(`#categoryList .sidebar-btn`)[0]?.classList.add("active");
}

// ======================= MODAL (VIDEO PLAYER) =======================
function openVideo(videoId, title, channel, tags) {
    const overlay = document.getElementById("modalOverlay");
    const player = document.getElementById("videoPlayer");
    const modalTitle = document.getElementById("modalTitle");
    const modalChannel = document.getElementById("modalChannel");
    const modalTags = document.getElementById("modalTags");

    player.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1" allowfullscreen allow="autoplay"></iframe>`;
    modalTitle.textContent = title;
    modalChannel.textContent = `📺 ${channel}`;
    
    const tagsArray = typeof tags === "string" ? JSON.parse(tags) : (tags || []);
    modalTags.innerHTML = tagsArray.map(t => `<span class="modal-tag">#${t}</span>`).join("");

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

// ESC to close
document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeModal();
});

// ======================= SIDEBAR TOGGLE =======================
function toggleSidebar() {
    const sb = document.getElementById("sidebar");
    const mc = document.getElementById("mainContent");
    sb.classList.toggle("hidden");
    mc.style.marginLeft = sb.classList.contains("hidden") ? "0" : "240px";
}
