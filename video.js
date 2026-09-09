// ==========================================
// 6. VIDEO.JS - مشغل الفيديو والتحميل
// ==========================================

function loadVideoPage(v) {
    if (typeof v === 'string') v = allVideos.find(x => x.id === v);
    if (!v) return;
    currentVid = v.id;
    const s = S.g("settings") || { auto: 1 };
    const q = s.quality && s.quality !== "auto" ? `&vq=${s.quality}` : "";
    document.getElementById("playerLarge").innerHTML = `<iframe src="https://www.youtube.com/embed/${v.id}?autoplay=${s.auto ? 1 : 0}${q}" allowfullscreen allow="autoplay"></iframe>`;
    document.getElementById("mTitleLarge").textContent = v.title;
    document.getElementById("mChanLarge").textContent = v.channel;
    document.getElementById("mCatLarge").textContent = `${v.category} • ${v.topic}`;
    document.getElementById("mChanAvatar").textContent = (v.channel || "C")[0].toUpperCase();
    document.getElementById("mDescLarge").innerHTML = `<span class="tag">#${v.category}</span><span class="tag">#${v.topic}</span><br><br>${v.title}`;
    refreshActionsLarge(v.id); renderCmtsLarge(v.id); renderRelatedVideos(v.category, v.id);
    if (S.g("settings")?.history) { let h = S.g("history") || []; if (!h.includes(v.id)) { h.unshift(v.id); S.s("history", h); } }
}

function refreshActionsLarge(id) {
    const l = isLiked(id), lc = getLikes(id).length, ch = document.getElementById("mChanLarge").textContent, s = isSub(ch);
    document.getElementById("mActionsLarge").innerHTML = `
        <button class="action-btn ${l ? 'liked' : ''}" onclick="toggleLike('${id}')"><i class="fas fa-thumbs-up"></i> ${lc}</button>
        <button class="action-btn" onclick="shareV('${id}')"><i class="fas fa-share"></i> Share</button>
        <button class="action-btn download-btn" onclick="downloadV('${id}')"><i class="fas fa-download"></i> Download</button>
    `;
    const b = document.getElementById("subscribeBtn");
    if (b) { b.className = "subscribe-btn" + (s ? " subscribed" : ""); b.innerHTML = s ? '<i class="fas fa-check"></i> Subscribed' : '<i class="fas fa-bell"></i> Subscribe'; }
}

function renderRelatedVideos(cat, cid) {
    const list = document.getElementById("relatedList"); if (!list) return;
    let rel = allVideos.filter(v => v.id !== cid);
    const same = rel.filter(v => v.category === cat);
    const other = rel.filter(v => v.category !== cat);
    const final = [...same.slice(0, 12), ...other.slice(0, 8)];
    if (!final.length) { list.innerHTML = `<p style="color:var(--text3);font-size:13px;padding:12px">Ma fammach videos similaires</p>`; return; }
    list.innerHTML = final.map(v => `
        <div class="related-item" onclick="navigate('video',{id:'${v.id}'})"><div class="related-thumb"><img src="${v.thumb}" loading="lazy" onerror="this.src='https://img.youtube.com/vi/${v.id}/0.jpg'"></div><div class="related-info"><div class="related-title">${v.title}</div><div class="related-ch"><i class="fas fa-user-circle"></i> ${v.channel}</div><div class="related-cat">${v.topic}</div></div></div>`).join("");
}

function renderCmtsLarge(id) {
    const s = document.getElementById("cmtSectionLarge"), cmts = getCmts(id);
    if (!s) return;
    let inp = "";
    if (user) {
        const av = user.avatar ? `<img src="${user.avatar}" style="width:100%!important;height:100%!important;object-fit:cover!important;border-radius:50%!important;position:absolute!important;inset:0!important;">` : user.name[0].toUpperCase();
        inp = `<div class="cmt-form-large"><div class="cmt-avatar-large" style="position:relative!important;">${av}</div><div class="cmt-input-wrap-large"><input class="cmt-input-large" id="cmtInputLarge" placeholder="Add a comment..." onkeypress="if(event.key==='Enter')postCmt('${id}')"><div class="cmt-btns-large"><button class="cmt-submit-large" onclick="postCmt('${id}')">Comment</button></div></div></div>`;
    } else {
        inp = `<p class="cmt-login-large"><a onclick="openAuth()">Sign in</a> to comment</p>`;
    }
    let list = `<div class="cmt-list-large">`;
    if (!cmts.length) list += `<p style="color:var(--text3);font-size:13px;padding:8px 0">No comments yet. Be the first! 💬</p>`;
    else cmts.forEach(c => { list += `<div class="cmt-item-large"><div class="cmt-avatar-large" style="width:32px;height:32px;font-size:12px">${c.name ? c.name[0].toUpperCase() : "U"}</div><div style="flex:1"><span class="cmt-user-large">@${c.name}</span>${user && user.id === c.uid ? `<button class="cmt-del-large" onclick="delCmt('${id}','${c.id}')"><i class="fas fa-trash"></i></button>` : ""}<p class="cmt-text-large">${c.text}</p><span class="cmt-time-large">${c.time}</span></div></div>`; });
    list += `</div>`;
    s.innerHTML = `<h3>💬 ${cmts.length} Comments</h3>${inp}${list}`;
}

function downloadV(id) {
    const url = `https://www.youtube.com/watch?v=${id}`;
    const encoded = encodeURIComponent(url);
    document.getElementById("dlCobalt").href = `https://cobalt.tools/?u=${encoded}`;
    document.getElementById("dlSSYT").href = `https://ssyoutube.com/watch?v=${id}`;
    document.getElementById("dlY2Mate").href = `https://www.y2mate.com/youtube/${id}`;
    document.getElementById("dlModal")?.classList.add("active");
}
function closeDlModal() { document.getElementById("dlModal")?.classList.remove("active"); }
