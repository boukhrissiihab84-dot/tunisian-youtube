// ==========================================
// 5. SOCIAL.JS - التفاعلات (لايك، تعليق، مشاركة)
// ==========================================

function getLikes(id) { return (S.g("likes") || {})[id] || []; }
function toggleLike(id) { 
    if (!user) { openAuth(); return; } 
    const l = S.g("likes") || {}; 
    if (!l[id]) l[id] = []; 
    const i = l[id].indexOf(user.id); 
    i > -1 ? l[id].splice(i, 1) : l[id].push(user.id); 
    S.s("likes", l); refreshActionsLarge(id); 
}
function isLiked(id) { return user ? getLikes(id).includes(user.id) : false; }

function getSubs() { return user ? S.g("subs_" + user.id) || [] : []; }
function toggleSub(ch) { 
    if (!user) { openAuth(); return; } 
    const k = "subs_" + user.id; let s = S.g(k) || []; 
    const i = s.indexOf(ch); 
    i > -1 ? s.splice(i, 1) : s.push(ch); 
    S.s(k, s); refreshActionsLarge(currentVid); 
}
function toggleSubFromPage() { toggleSub(document.getElementById("mChanLarge").textContent); }
function isSub(ch) { return getSubs().includes(ch); }

function getCmts(id) { return (S.g("comments") || {})[id] || []; }
function postCmt(id) { 
    if (!user) { openAuth(); return; } 
    const inp = document.getElementById("cmtInputLarge"); if (!inp) return; 
    const t = inp.value.trim(); if (!t) return; 
    const c = S.g("comments") || {}; if (!c[id]) c[id] = []; 
    c[id].unshift({ id: Date.now().toString(), uid: user.id, name: user.name, text: t, time: new Date().toLocaleString() }); 
    S.s("comments", c); inp.value = ""; renderCmtsLarge(id); 
}
function delCmt(vid, cid) { 
    const c = S.g("comments") || {}; 
    if (c[vid]) { c[vid] = c[vid].filter(x => x.id !== cid); S.s("comments", c); renderCmtsLarge(vid); } 
}

function shareV(id) { 
    const u = `https://www.youtube.com/watch?v=${id}`; 
    if (navigator.share) navigator.share({ title: "Cours Tounsi", url: u }); 
    else { navigator.clipboard.writeText(u); alert("✅ Link copied!"); } 
}
