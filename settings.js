// ==========================================
// 4. SETTINGS.JS - إعدادات التطبيق والمستخدم
// ==========================================

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
    // ==========================================
// THEME TOGGLE (Dark ↔ Light)
// ==========================================

function toggleTheme() {
    const html = document.documentElement;
    const current = html.getAttribute("data-theme") || "dark";
    const newTheme = current === "dark" ? "light" : "dark";
    
    html.setAttribute("data-theme", newTheme);
    
    // حفظ في localStorage
    try {
        const s = JSON.parse(localStorage.getItem("tt_settings") || "{}");
        s.theme = newTheme;
        localStorage.setItem("tt_settings", JSON.stringify(s));
    } catch(e) {}
    
    // تحديث الأيقونة (شمس ↔ قمر)
    const btn = document.getElementById("themeBtn");
    if (btn) {
        const icon = btn.querySelector("i");
        if (icon) {
            icon.className = newTheme === "dark" ? "fa-solid fa-sun" : "fa-solid fa-moon";
        }
    }
    
    // تحديث toggle في الإعدادات لو موجود
    const t = document.getElementById("t-pro-dark");
    if (t) {
        t.classList.toggle("active", newTheme === "dark");
        t.setAttribute("aria-checked", newTheme === "dark" ? "true" : "false");
    }
}

// تطبيق الثيم عند فتح الصفحة
function applyThemeOnLoad() {
    try {
        const s = JSON.parse(localStorage.getItem("tt_settings") || "{}");
        const theme = s.theme || "dark";
        document.documentElement.setAttribute("data-theme", theme);
        
        const btn = document.getElementById("themeBtn");
        if (btn) {
            const icon = btn.querySelector("i");
            if (icon) icon.className = theme === "dark" ? "fa-solid fa-sun" : "fa-solid fa-moon";
        }
    } catch(e) {}
}

// تشغيلها تلقائي عند تحميل الصفحة
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyThemeOnLoad);
} else {
    applyThemeOnLoad();
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

function openSettingsTab(tabId, btn) {
    document.querySelectorAll(".settings-pane-pro").forEach(pane => pane.classList.remove("active"));
    document.querySelectorAll(".tab-btn-pro").forEach(b => b.classList.remove("active"));
    document.getElementById("set-pro-" + tabId)?.classList.add("active");
    if (btn) btn.classList.add("active");
}

function loadUserSettingsPro() {
    if (!user) { openAuth(); navigate('home'); return; }
    
    document.getElementById("accNamePro").value = user.name || "";
    document.getElementById("accEmailPro").value = user.email || "";
    document.getElementById("accOldPassPro").value = "";
    document.getElementById("accNewPassPro").value = "";
    document.getElementById("accErrorPro").textContent = "";

    const wrap = document.getElementById("accAvatarWrapPro");
    if (wrap) {
        wrap.innerHTML = user.avatar 
            ? `<img src="${user.avatar}" style="width:100%!important;height:100%!important;object-fit:cover!important;border-radius:50%!important;position:absolute!important;inset:0!important;">` 
            : (user.name || "U")[0].toUpperCase();
    }

    const ch = S.g("channel_" + user.id) || { name: user.name, bio: "", category: "", link: "", insta: "" };
    document.getElementById("channelNamePro").value = ch.name || "";
    document.getElementById("channelBioPro").value = ch.bio || "";
    document.getElementById("channelCatPro").value = ch.category || "";
    document.getElementById("channelLinkPro").value = ch.link || "";
    document.getElementById("channelSocialPro").value = ch.insta || "";

    const s = S.g("settings") || { dark: 0, auto: 1, notif: 0, history: 1, public: 1, search: 1, fontSize: "normal", gridSize: "280", lang: "derja", quality: "auto" };
    ["dark", "auto"].forEach(k => {
        const el = document.getElementById("t-pro-" + k);
        if (el) { if (s[k]) el.classList.add("on"); else el.classList.remove("on"); }
    });
    const langSel = document.getElementById("langSelectPro"); if (langSel) langSel.value = s.lang || "derja";
    const fontSel = document.getElementById("fontSelectPro"); if (fontSel) fontSel.value = s.fontSize || "normal";
    const qSel = document.getElementById("qualitySelectPro"); if (qSel) qSel.value = s.quality || "auto";
}

function changeAccPicPro(e) {
    const f = e.target.files[0];
    if (f) {
        compressAndCropImage(f, 256, (dataUrl) => {
            user.avatar = dataUrl;
            S.s("user", user);
            let us = S.g("users") || [];
            let idx = us.findIndex(u => u.id === user.id);
            if (idx > -1) { us[idx] = user; S.s("users", us); }
            renderAuth(); loadUserSettingsPro();
        });
    }
}

function randomizeAvatarPro() {
    if (!user) return;
    const seed = Math.random().toString(36).substring(7);
    user.avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`;
    S.s("user", user);
    let us = S.g("users") || [];
    let idx = us.findIndex(u => u.id === user.id);
    if (idx > -1) { us[idx] = user; S.s("users", us); }
    renderAuth(); loadUserSettingsPro();
}

function saveAccountPro() {
    const err = document.getElementById("accErrorPro"); err.textContent = "";
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
    renderAuth(); loadUserSettingsPro(); alert("✅ Vos informations de compte ont été mises à jour!");
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
    s[k] = s[k] ? 0 : 1; S.s("settings", s); loadUserSettingsPro();
    if (k === "dark") applyTheme();
}

function setLangPro(v) {
    const s = S.g("settings") || {}; s.lang = v; S.s("settings", s);
    const trans = { derja: "Lawwej 3la cours...", fr: "Rechercher...", en: "Search courses..." };
    document.getElementById("searchInput").placeholder = trans[v] || trans.en;
}
function setFontSizePro(v) { const s = S.g("settings") || {}; s.fontSize = v; S.s("settings", s); applyFontSize(); }
function setQualityPro(v) { const s = S.g("settings") || {}; s.quality = v; S.s("settings", s); }
function clearHistoryPro() { if (confirm("Voulez-vous vraiment effacer l'historique ?")) { S.r("history"); alert("🧹 Historique effacé!"); } }
function clearLikesPro() { if (confirm("Voulez-vous effacer vos likes ?")) { S.r("likes"); alert("💔 Likes réinitialisées!"); } }
function resetAllAppDataPro() {
    if (confirm("⚠️ ATTENTION : Cela va supprimer absolument toutes vos données locales. Confirmer ?")) {
        localStorage.clear(); alert("🔄 Réinitialisation réussie. Rechargement..."); window.location.reload();
    }
}
