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
    const 
