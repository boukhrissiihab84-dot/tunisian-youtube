// ==========================================
// 8. ROUTER.JS - الروابط والتنقل بين الصفحات
// ==========================================

function navigate(page, data = null) {
    document.getElementById("dropdown")?.classList.remove("show", "open");
    
    let targetTab = null;
    if (page === "account") { page = "settings"; targetTab = "account"; }
    else if (page === "channel") { page = "settings"; targetTab = "channel"; }

    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    const target = document.getElementById("page-" + page);
    if (target) target.classList.add("active");
    
    if (page === "home") { renderHome(); }
    else if (page === "video" && data) { loadVideoPage(data); }
    else if (page === "category" && data) { loadCategoryPage(data); }
    else if (page === "settings") { 
        loadUserSettingsPro(); 
        if (targetTab) {
            const tabBtn = document.querySelector(`.tab-btn-pro[onclick*='${targetTab}']`);
            if(tabBtn) openSettingsTab(targetTab, tabBtn);
        } else {
            const tabBtn = document.querySelector(".tab-btn-pro.active") || document.querySelector(".tab-btn-pro");
            const tabId = tabBtn ? tabBtn.getAttribute("onclick").match(/'([^']+)'/)[1] : "account";
            if(tabBtn) openSettingsTab(tabId, tabBtn);
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
