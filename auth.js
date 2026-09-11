// ==========================================
// 3. AUTH.JS - تسجيل الدخول بـ Firebase
// ==========================================

// مراقبة حالة الحساب (هل هو مسجل دخول أو لا)
auth.onAuthStateChanged(async (firebaseUser) => {
    if (firebaseUser) {
        try {
            const doc = await db.collection("users").doc(firebaseUser.uid).get();
            if (doc.exists) {
                user = { id: firebaseUser.uid, email: firebaseUser.email, ...doc.data() };
            } else {
                user = { id: firebaseUser.uid, email: firebaseUser.email, name: firebaseUser.displayName || "User", avatar: "" };
            }
        } catch (e) {
            user = { id: firebaseUser.uid, email: firebaseUser.email, name: "User", avatar: "" };
        }
        S.s("user", user);
    } else {
        user = null;
        S.r("user");
    }
    renderAuth();
});

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

async function handleAuth() {
    const n = document.getElementById("authName").value.trim();
    const em = document.getElementById("authEmail").value.trim();
    const p = document.getElementById("authPass").value;
    const err = document.getElementById("authError");
    err.textContent = "";

    if (!em || !p) { err.textContent = "Remplissez tous les champs!"; return; }
    if (p.length < 6) { err.textContent = "Mot de passe min 6 caractères"; return; }

    const btn = document.getElementById("authBtn");
    if (btn) btn.disabled = true;

    try {
        if (isSignUp) {
            if (!n) { err.textContent = "Entrez votre nom!"; if(btn) btn.disabled = false; return; }
            
            // صنع حساب جديد في Firebase
            const cred = await auth.createUserWithEmailAndPassword(em, p);
            const uid = cred.user.uid;

            // تسجيل الداتا في Firestore
            const userData = { name: n, email: em, avatar: tempAvatar || "", createdAt: firebase.firestore.FieldValue.serverTimestamp() };
            await db.collection("users").doc(uid).set(userData);
            user = { id: uid, ...userData };
            
        } else {
            // تسجيل الدخول
            const cred = await auth.signInWithEmailAndPassword(em, p);
            const uid = cred.user.uid;
            
            const doc = await db.collection("users").doc(uid).get();
            if (doc.exists) {
                user = { id: uid, ...doc.data() };
            } else {
                user = { id: uid, email: em, name: "User", avatar: "" };
            }
        }

        S.s("user", user);
        renderAuth();
        closeAuth();
        tempAvatar = "";
    } catch (e) {
        console.error("Auth error:", e);
        if (e.code === 'auth/email-already-in-use') err.textContent = "Cet email existe déjà!";
        else if (e.code === 'auth/wrong-password' || e.code === 'auth/user-not-found' || e.code === 'auth/invalid-credential') err.textContent = "Email ou mot de passe incorrect!";
        else err.textContent = "Erreur de connexion!";
    } finally {
        if (btn) btn.disabled = false;
    }
}

async function logOut() {
    try { await auth.signOut(); } catch (e) { console.error(e); }
    user = null;
    S.r("user");
    renderAuth();
    document.getElementById("dropdown")?.classList.remove("show", "open");
    navigate("home");
}
