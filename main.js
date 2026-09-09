// ==========================================
// 9. MAIN.JS - تشغيل التطبيق وجلب البيانات
// ==========================================

function initApp(raw) {
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
    
    if (allVideos.length === 0) {
        console.error("🚨 Zero videos passed the filter! Hard reloading with GUARANTEED data...");
        allVideos = GUARANTEED_TOUNES_COURSES.map(v => {
            const id = v.Video_ID;
            return { id, title: v.Titre, channel: v.Chaine, category: v.Categorie, topic: v.Mawdhou3, thumb: `https://img.youtube.com/vi/${id}/mqdefault.jpg` };
        });
    }
    
    document.getElementById("vCount").textContent = allVideos.length + " cours";
    buildSide(); buildChips(); initRouter();
}

// 🟢 RUN ON START
document.addEventListener("DOMContentLoaded", () => {
    try {
        if (typeof rawVideosData !== 'undefined' && Array.isArray(rawVideosData) && rawVideosData.length > 0) {
            initApp(rawVideosData);
        } else {
            throw new Error("data.js not defined or empty");
        }
    } catch (e) {
        fetch(`tounes_courses.json?nocache=${Date.now()}`, { cache: "no-store" })
            .then(r => { if (!r.ok) throw new Error("JSON Fetch failed"); return r.json(); })
            .then(d => { initApp(d); })
            .catch(err => { initApp(GUARANTEED_TOUNES_COURSES); });
    }

    applyTheme();
    applyFontSize();
    renderAuth();
    
    const il = (S.g("settings") || {}).lang;
    if (il) setLangPro(il);
    
    document.addEventListener("keydown", e => { if (e.key === "Escape") { closeAuth(); closeDlModal(); } });
});
