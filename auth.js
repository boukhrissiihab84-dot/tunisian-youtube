// ==========================================
// 3. AUTH.JS - تسجيل الدخول والحسابات
// ==========================================

function renderAuth() {
    const a = document.getElementById("authArea");
    if (!a) return;
    if (user) {
        const initial = (user.name || "U")[0].toUpperCase();
        const pic = user.avatar 
            ? `<img src="${user.avatar}" alt="${user.name || 'User'}" class="avatar-img" style="width:100%!important;height:100%!important;object-fit:cover!important;object-position:center!important;border-radius:50%!important;position:absolute!important;inset:0!important;display:block!important;margin:0!important;padding:0!important;">` 
            : initial;
        a.innerHTML = `<button type="button" class="avatar avatar-btn" id="userAvatarBtn" onclick="toggleDropdown(event)" aria-label="Menu utilisateur" title="${user.name || 'User'}" style="width:38px!important;height:38px!important;min-width:38px!important;min-height:38px!important;max-width:38px!important;max-height:38px!important;border-radius:50%!important;border:2px solid var(--accent)!important;overflow:hidden!important;display:flex!important;align-items:center!important;justify-content:center!important;padding:0!important;position:relative!important;cursor:pointer!important;background:var(--surface2)!important;color:#fff!important;font-weight:800!important;font-size:14px!important;flex-shrink:0!important;box-sizing:border-box!important;">${pic}</button>`;
        const ddN = document.getElementById("ddName"), ddE = document.getElementById("ddEmail"), da = document.getElementById("ddAvatar");
        if (ddN) ddN.textContent = user.name || "User";
        if (ddE) ddE.textContent = user.email || "";
        if (da) {
            da.innerHTML = user.avatar 
                ? `<img src="${user.avatar}" alt="${user.name || 'User'}" class="avatar-img" style="width:100%!important;height:100%!important;object-fit:cover!important;object-position:center!important;border-radius:50%!important;position:absolute!important;inset:0!important;display:block!important;margin:0!important;padding:0!important;">` 
                : initial;
        }
    } else {
        a.innerHTML = `<button class="signin-btn auth-cta" onclick="openAuth()"><i class="fas fa-user-circle"></i> <span data-i18n="signin">Sign In</span></button>`;
    }
}

function toggleDropdown(e) { 
    if (e) e.stopPropagation();
    const dd = document.getElementById("dropdown"); 
    if (dd) {
        const isOpen = dd.classList.contains("open") || dd.classList.contains("show");
        if (isOpen) dd.classList.remove("open", "show");
        else dd.classList.add("open", "show");
    }
}

document.addEventListener("click", e => { 
    const dd = document.getElementById("dropdown"); 
    if (dd && !e.target.closest(".avatar") && !e.target.closest(".avatar-btn") && !e.target.closest(".dropdown")) {
        dd.classList.remove("open", "show"); 
    }
});

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

function previewAvatar(e) { 
    const f = e.target.files[0]; 
    if (f) { 
        compressAndCropImage(f, 256, (dataUrl) => {
            tempAvatar = dataUrl;
            const el = document.getElementById("signupAvatar");
            if (el) {
                el.innerHTML = `<img src="${tempAvatar}" style="width:100%!important;height:100%!important;object-fit:cover!important;border-radius:50%!important;position:absolute!important;inset:0!important;"><input type="file" accept="image/*" onchange="previewAvatar(event)" style="position:absolute;inset:0;opacity:0;cursor:pointer;z-index:10;width:100%;height:100%;">`; 
            }
        });
    } 
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

function logOut() { user = null; S.r("user"); renderAuth(); document.getElementById("dropdown")?.classList.remove("show", "open"); navigate("home"); }
