/* ==================================================
   TunisianTube - app.js
   el logique koll: pages, auth, likes, comments...
   el videos yjiw mel data.js (tounes_courses.json)
================================================== */

let VIDEOS = []; // yamboo3 ba3d ma naloadjou el json

/* ---------- sécurité: ken data.js tensa mel push ---------- */
// bech el site mayekserch 7atta ken el fichier ma3ach mawjoud
if(typeof loadCourses !== "function"){
  console.warn("[app] data.js ma l9inehouch -> nkhedmou bel fallback integré");
  window.h32 = function(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
  window.vViews  = v => v.views || (4000 + (h32(v.id) % 880000));
  window.vLikes  = v => (v.likes != null ? v.likes : 40 + (h32("L"+v.id) % 9000));
  window.vDate   = v => new Date(Date.now() - (v.d % 420) * 864e5);
  window.chGrad  = ch => {const h=h32(ch)%360;return `linear-gradient(135deg,hsl(${h} 78% 46%),hsl(${(h+42)%360} 84% 58%))`};
  window.userGrad= n  => {const h=h32(n)%360;return `linear-gradient(135deg,hsl(${h} 80% 48%),hsl(${(h+40)%360} 85% 58%))`};
  window.catIcon = c => ({"Programming":"code","Design":"palette","Languages":"language","Marketing":"bullhorn","Education":"graduation-cap"}[c] || "folder");
  window.topicIcon = () => "hashtag";
  window.CMT_NAMES = ["Ahmed","Yasmine","Mehdi","Cyrine","Skander","Amine","Nour","Karim","Salma","Oussama"];
  window.CMT_POOL  = ["شرح واضح برشا، شكرا!","Enfin j'ai compris, merci!","بارك الله فيك، محتوى عالمي","Bravo 3lik, continue","هذا أحسن كورس شفته","Merci, yelzem exemples akther","Top content ماشاء الله","شكرا، استنى الجزء الثاني"];
  window.descFor   = () => "Cours gratuit, sélectionné pour la communauté. خلي لايك وشيير!";
  window.FALLBACK_LOCAL = [
    {id:"f0",yt:"PkZNo7MFNFg",t:"JavaScript — الكورس الكامل من الصفر",ch:"Darija Code Academy",cat:"Programming",topic:"Web",dur:"3:26:41",d:60,views:null,likes:null,tags:["javascript"]},
    {id:"f1",yt:"rfscVS0vtbw",t:"Python Full Course — تعلم البايثون",ch:"El Academy",cat:"Programming",topic:"Python",dur:"4:26:52",d:90,views:null,likes:null,tags:["python"]},
    {id:"f2",yt:"nu_pCVPKzTk",t:"React كامل — ابني أول App متاعك",ch:"Darija Code Academy",cat:"Programming",topic:"Web",dur:"11:55:27",d:120,views:null,likes:null,tags:["react"]},
    {id:"f3",yt:"UB1O30fR-EE",t:"HTML للمبتدئين — Crash بالتونسي",ch:"Tounsi Tech",cat:"Programming",topic:"Web",dur:"39:51",d:20,views:null,likes:null,tags:["html"]},
    {id:"f4",yt:"VPvVD8t02U8",t:"Flutter — Android و iOS في كورس وحدة",ch:"Tounsi Tech",cat:"Programming",topic:"Mobile",dur:"37:06:20",d:150,views:null,likes:null,tags:["flutter"]},
    {id:"f5",yt:"HXV3zeQKqGY",t:"SQL & Databases — الكورس الكامل",ch:"El Academy",cat:"Programming",topic:"Data",dur:"4:20:39",d:180,views:null,likes:null,tags:["sql"]},
    {id:"f6",yt:"SWYqp7iY_Tc",t:"Git & GitHub — Crash Course",ch:"Tounsi Tech",cat:"Programming",topic:"DevOps",dur:"32:41",d:45,views:null,likes:null,tags:["git"]},
    {id:"f7",yt:"aircAruvnKk",t:"شنوة الـ Neural Network؟",ch:"Math Bel Darja",cat:"Education",topic:"IA",dur:"19:13",d:100,views:null,likes:null,tags:["ia"]},
    {id:"f8",yt:"RxCR3g6aYJ0",t:"Français — Apprends en 1 heure (A1)",ch:"Lingua TN",cat:"Languages",topic:"Français",dur:"1:05:21",d:160,views:null,likes:null,tags:["français"]},
    {id:"f9",yt:"TcDlF9ayfUM",t:"Apprendre le Tunisien (Derja) #1",ch:"Lingua TN",cat:"Languages",topic:"Derja",dur:"08:42",d:200,views:null,likes:null,tags:["derja"]}
  ];
  window.loadCourses = async () => window.FALLBACK_LOCAL;
}

/* ---------- storage ---------- */
const store = {
  get(k, d){ try{ const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; }catch(e){ return d; } },
  set(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }
};

let users        = store.get("tt_users", []);
let session      = store.get("tt_session", null);
let likes        = store.get("tt_likes", {});
let subs         = store.get("tt_subs", []);
let historyList  = store.get("tt_history", []);
let commentsDB   = store.get("tt_comments", {});
let channelProfile = store.get("tt_channel", {name:"",bio:"",cat:"",link:"",social:""});
let settings     = Object.assign({theme:"dark",lang:"fr",autoplay:true,quality:"auto",font:"normal"}, store.get("tt_settings", {}));

let filter = "all", searchQ = "", batch = 12, shown = 0;
let currentList = [], currentVid = null;
let authMode = "signup", signupAvatarData = null;
let settingsTab = "account";

const curUser = () => users.find(u => u.email === session) || null;

/* ---------- i18n (derja / fr / en) ---------- */
const I18N = {
en:{search:"Search courses...",cats:"Categories",topics:"Topics",all:"All",courses:"courses",free:"free",content:"hours of content",signin:"Sign In",welcome:"Welcome",bye:"Signed out",mychannel:"My Channel",accset:"Account Settings",appset:"App Settings",liked:"Liked Videos",subs_p:"Subscriptions",hist:"Watch History",out:"Sign Out",related:"Related Videos",sub:"Subscribe",subd:"Subscribed",share:"Share",dl:"Download",dl_title:"Download Video",comments:"Comments",cmtph:"Add a comment...",post:"Post",login_cmt:"Sign in to join the conversation",back:"Back",home:"Home",empty:"No videos found",empty_p:"Try different keywords or browse categories.",views:"views",ago:"ago",justnow:"just now",hero_kicker:"The Tunisian learning platform",hero_t1:"Learn something",hero_t2:"new every day",hero_t3:"بالدارجة التونسية",hero_p:"Free courses in programming, design, languages and marketing — curated for the Tunisian community.",hero_cta:"Start watching",hero_pref:"Preferences",set_title:"Settings",set_sub:"Manage your account, channel and preferences.",tab_acc:"My Account",tab_ch:"My Channel",tab_pref:"Preferences",tab_sec:"Security",acc_info:"Personal Information",dname:"Display Name",cur_pass:"Current Password",new_pass:"New Password",save:"Save",save2:"Save",login_view:"Sign in to edit your account",ch_perso:"Channel Customization",ch_name:"Channel Name",ch_cat:"Category",dark_m:"Dark Mode",dark_d:"Night mode interface",lang:"Language",lang_d:"Interface language",auto_d:"Play videos automatically",qual:"Quality",qual_d:"Default resolution",fsize:"Text Size",data_sec:"Data & Security",clr_hist:"Clear history",clr_hist_p:"Remove all watched videos",clr_like:"Clear likes",clr_like_p:"Reset all your liked videos",reset_all:"Reset everything",reset_all_p:"Delete all your local data",clear:"Clear",reset:"Reset All",upload_img:"Upload image",random_av:"Random",link_copied:"Link copied!",saved_ok:"Saved",no_like:"No liked videos yet",no_subs:"Subscribe to channels to see their videos",no_hist:"No watch history yet",need_login:"You need to sign in first",cmt_del:"Comment deleted",cmt_added:"Comment posted",acc_upd:"Account updated",ch_saved:"Channel saved",reset_done:"Done",err_name:"Enter a valid name",err_email:"Enter a valid email",err_pass:"Password: min 6 characters",err_exists:"Account already exists — sign in",err_creds:"Wrong email or password",err_oldpass:"Current password incorrect",foot1:"Learn in Darija, grow without limits."},
fr:{search:"Rechercher des cours...",cats:"Catégories",topics:"Sujets",all:"Tout",courses:"cours",free:"gratuit",content:"heures de contenu",signin:"Se connecter",welcome:"Bienvenue",bye:"Déconnecté",mychannel:"Ma Chaîne",accset:"Paramètres du compte",appset:"Paramètres de l'app",liked:"Vidéos aimées",subs_p:"Abonnements",hist:"Historique",out:"Se déconnecter",related:"Vidéos similaires",sub:"S'abonner",subd:"Abonné",share:"Partager",dl:"Télécharger",dl_title:"Télécharger la vidéo",comments:"Commentaires",cmtph:"Ajouter un commentaire...",post:"Publier",login_cmt:"Connecte-toi pour commenter",back:"Retour",home:"Accueil",empty:"Aucune vidéo trouvée",empty_p:"Essaie d'autres mots-clés ou parcours les catégories.",views:"vues",ago:"il y a",justnow:"à l'instant",hero_kicker:"La plateforme d'apprentissage tunisienne",hero_t1:"Apprends quelque chose de",hero_t2:"nouveau chaque jour",hero_t3:"بالدارجة التونسية",hero_p:"Des cours gratuits en programmation, design, langues et marketing — sélectionnés pour la communauté tunisienne.",hero_cta:"Commencer",hero_pref:"Préférences",set_title:"Paramètres",set_sub:"Gérez votre compte, chaîne et préférences.",tab_acc:"Mon Compte",tab_ch:"Ma Chaîne",tab_pref:"Préférences",tab_sec:"Sécurité",acc_info:"Informations Personnelles",dname:"Nom affiché",cur_pass:"Mot de passe actuel",new_pass:"Nouveau mot de passe",save:"Enregistrer",save2:"Sauvegarder",login_view:"Connecte-toi pour modifier ton compte",ch_perso:"Personnalisation de la chaîne",ch_name:"Nom de la chaîne",ch_cat:"Catégorie",dark_m:"Mode Sombre",dark_d:"Interface de nuit",lang:"Langue",lang_d:"Langue de l'interface",auto_d:"Lecture automatique des vidéos",qual:"Qualité",qual_d:"Résolution par défaut",fsize:"Taille du texte",data_sec:"Données & Sécurité",clr_hist:"Effacer l'historique",clr_hist_p:"Supprime toutes les vidéos vues",clr_like:"Effacer les likes",clr_like_p:"Réinitialise tes vidéos aimées",reset_all:"Tout réinitialiser",reset_all_p:"Supprime toutes tes données locales",clear:"Effacer",reset:"Tout Reset",upload_img:"Charger une image",random_av:"Aléatoire",link_copied:"Lien copié !",saved_ok:"Enregistré",no_like:"Aucune vidéo aimée pour l'instant",no_subs:"Abonne-toi à des chaînes pour voir leurs vidéos",no_hist:"Aucun historique de visionnage",need_login:"Tu dois d'abord te connecter",cmt_del:"Commentaire supprimé",cmt_added:"Commentaire publié",acc_upd:"Compte mis à jour",ch_saved:"Chaîne enregistrée",reset_done:"Fait",err_name:"Entre un nom valide",err_email:"Entre un email valide",err_pass:"Mot de passe : 6 caractères min",err_exists:"Ce compte existe déjà — connecte-toi",err_creds:"Email ou mot de passe incorrect",err_oldpass:"Mot de passe actuel incorrect",foot1:"Apprends en darija, évolue sans limites."},
dz:{search:"Fettech 3la cours...",cats:"Les Catégories",topics:"Sujets",all:"El Kol",courses:"cours",free:"belbech",content:"se3a mte3 contenu",signin:"Dokhol",welcome:"Ahla bik",bye:"Okhrejna",mychannel:"Channel mte3i",accset:"Compte mte3i",appset:"Réglages el App",liked:"Videos eli 3ejbouk",subs_p:"Abonnements",hist:"Eli tchouftha",out:"Okhroj",related:"Videos Kif Kif",sub:"Abonne-toi",subd:"M'abbouné",share:"Partage",dl:"T7ammel",dl_title:"T7ammel el video",comments:"Commentaires",cmtph:"Ekteb ra2yek...",post:"Ab3ath",login_cmt:"Sajjel bech tekteb commentaire",back:"Erja3",home:"El Acceuil",empty:"Ma l9ina chay",empty_p:"Jarreb kelmet okhrin wala tfarej 3la catégories.",views:"vues",ago:"9bal",justnow:"tawa",hero_kicker:"Plateforme el ta3lim el Tounsiya",hero_t1:"Ta3allam 7aja",hero_t2:"jdida kol nhar",hero_t3:"بالدارجة التونسية",hero_p:"Cours belbech fel programmation, design, lenghet w marketing — m5ayrin 3ala 9yess el touensa.",hero_cta:"Abda tawa",hero_pref:"Réglages",set_title:"Réglages",set_sub:"Rigel compte mte3ek, channel w préférences.",tab_acc:"Compte mte3i",tab_ch:"Channel mte3i",tab_pref:"Préférences",tab_sec:"Sécurité",acc_info:"Informations mte3ek",dname:"Esmek",cur_pass:"Mot de passe el 9dim",new_pass:"Mot de passe jdid",save:"Sajjel",save2:"Sajjel",login_view:"Sajjel bech tbeddel el compte",ch_perso:"Personnalisé el channel",ch_name:"Esm el channel",ch_cat:"Catégorie",dark_m:"Mode Lil",dark_d:"Interface fel dhelam",lang:"Lougha",lang_d:"Lougha mte3 l'interface",auto_d:"El video tekhdem wa7edha",qual:"Qualité",qual_d:"Résolution par défaut",fsize:"7ajm el texte",data_sec:"Données & Sécurité",clr_hist:"Fasakh l'historique",clr_hist_p:"Yemsa7 kol chay tchouftha",clr_like:"Fasakh el likes",clr_like_p:"Yemsa7 kol el likes",reset_all:"Fasakh kol chay",reset_all_p:"Yemsa7 kol el données",clear:"Fasakh",reset:"Fasakh Kol",upload_img:"Dakhel taswira",random_av:"Aléatoire",link_copied:"Lien copié!",saved_ok:"Tesajjel",no_like:"Mazelt ma3jebek chay",no_subs:"Abonna 3la channels bech todhror vidéothom",no_hist:"Mazelt ma tchouf chay",need_login:"Lazemk tsajjel el lowel",cmt_del:"Commentaire tfasakh",cmt_added:"Commentaire tba3ath",acc_upd:"Compte tbeddel",ch_saved:"Channel tesajjlet",reset_done:"Tmet",err_name:"Ekteb esm s7i7",err_email:"Ekteb email s7i7",err_pass:"Mot de passe: 6 7ourouf minimum",err_exists:"El compte mawjoud — sajjel",err_creds:"Email wala mot de passe ghalta",err_oldpass:"Mot de passe el 9dim ghalta",foot1:"Ta3allam bederja, w tkabber bla 7doud."}
};
const t = k => (I18N[settings.lang] && I18N[settings.lang][k]) || I18N.fr[k] || k;
function applyLang(){
  document.querySelectorAll("[data-i18n]").forEach(el => el.textContent = t(el.dataset.i18n));
  document.querySelectorAll("[data-i18n-ph]").forEach(el => el.placeholder = t(el.dataset.i18nPh));
  const si = document.getElementById("searchInput"); if(si) si.placeholder = t("search");
  const sel = document.getElementById("langSelectPro"); if(sel) sel.value = settings.lang;
  updateCount(); renderSidebar(); renderChips();
  if(currentVid) renderVideoPage(currentVid, true);
}

/* ---------- helpers sghar ---------- */
const $  = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const esc = s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const ic = n => `<i class="fa-solid fa-${n}"></i>`;
function avatarHTML(name, grad, cls, img){
  const L = (name || "U").trim().charAt(0).toUpperCase();
  return `<div class="${cls}" style="background:${grad}">${img ? `<img src="${img}">` : L}</div>`;
}
function fmtViews(n){
  if(n >= 1e6) return (n/1e6).toFixed(1).replace(".",",") + " M " + t("views");
  if(n >= 1e3) return Math.round(n/1e3) + " k " + t("views");
  return n + " " + t("views");
}
function relTime(date){
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if(s < 90) return t("justnow");
  const u = [[31536000,"an"],[2592000,"mois"],[604800,"sem"],[86400,"j"],[3600,"h"],[60,"min"]];
  for(const [sec,l] of u){
    const n = Math.floor(s/sec);
    if(n >= 1){
      if(settings.lang === "en") return n + l.charAt(0) + " " + t("ago");
      return t("ago") + " " + n + " " + l;
    }
  }
  return t("justnow");
}
function toast(msg, icon){
  const el = document.createElement("div");
  el.className = "toast";
  el.innerHTML = ic(icon || "check") + `<span>${msg}</span>`;
  $("#toasts").appendChild(el);
  setTimeout(() => { el.classList.add("out"); setTimeout(() => el.remove(), 320); }, 2600);
}

/* ---------- search + filtres ---------- */
function currentFilter(){
  shown = 0;
  let list = [...VIDEOS].sort((a,b) => vDate(b) - vDate(a));
  if(filter !== "all") list = list.filter(v => v.cat === filter);
  if(searchQ){
    const q = searchQ.toLowerCase();
    list = list.filter(v => (v.t + " " + v.ch + " " + v.cat + " " + v.topic + " " + v.tags.join(" ")).toLowerCase().includes(q));
  }
  currentList = list;
  return list;
}
let searchTimer = null;
function onSearchInput(){
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    searchQ = $("#searchInput").value.trim();
    if(!$("#page-home").classList.contains("active")) navigate("home");
    else { rebuildHome(); renderGrid(true); }
  }, 180);
}
function renderChips(){
  const cats = [...new Set(VIDEOS.map(v => v.cat))];
  $("#filterBar").innerHTML =
    `<button class="chip ${filter==="all"?"active":""}" onclick="setFilter('all')">${ic("fire")} ${t("all")}</button>` +
    cats.map(c => `<button class="chip ${filter===c?"active":""}" onclick="setFilter('${esc(c)}')">${ic(catIcon(c))} ${esc(c)}</button>`).join("");
}
function setFilter(c){ filter = c; renderChips(); rebuildHome(); renderGrid(true); }
function rebuildHome(){
  const hide = !!searchQ || filter !== "all";
  $("#hero").style.display = hide ? "none" : "";
  $("#marqueeWrap").style.display = hide ? "none" : "";
  currentFilter();
}
function updateCount(){
  $("#vCount").textContent = VIDEOS.length + " " + t("courses");
  $("#statV").textContent = VIDEOS.length;
  $("#statC").textContent = new Set(VIDEOS.map(v => v.cat)).size;
  let sec = 0;
  VIDEOS.forEach(v => {
    const p = String(v.dur).split(":").map(Number);
    if(p.length === 3 && !p.some(isNaN)) sec += p[0]*3600 + p[1]*60 + p[2];
    else if(p.length === 2 && !p.some(isNaN)) sec += p[0]*60 + p[1];
  });
  $("#statH").textContent = Math.floor(sec/3600) + "h+";
}
function renderMarquee(){
  const topics = [...new Set(VIDEOS.map(v => v.topic))];
  const seq = topics.map(tp => `<span class="mq-chip">${ic(topicIcon(tp))} ${esc(tp)}</span>`).join("");
  $("#marquee").innerHTML = seq + seq;
}

/* ---------- sidebar ---------- */
function renderSidebar(){
  const cats = [...new Set(VIDEOS.map(v => v.cat))];
  $("#catList").innerHTML =
    `<button class="side-link ${filter==="all"?"active":""}" onclick="setFilter('all');navigate('home')">${ic("table-cells-large")} <span>${t("all")}</span><span class="side-count">${VIDEOS.length}</span></button>` +
    cats.map(c => {
      const n = VIDEOS.filter(v => v.cat === c).length;
      return `<button class="side-link ${filter===c?"active":""}" onclick="openCategory('${esc(c)}')">${ic(catIcon(c))} <span>${esc(c)}</span><span class="side-count">${n}</span></button>`;
    }).join("");
  const topics = [...new Set(VIDEOS.map(v => v.topic))]
    .sort((a,b) => VIDEOS.filter(v => v.topic === b).length - VIDEOS.filter(v => v.topic === a).length)
    .slice(0, 10);
  $("#subList").innerHTML = topics.map(tp =>
    `<button class="side-link" onclick="openTopic('${esc(tp)}')">${ic(topicIcon(tp))} <span>${esc(tp)}</span><span class="side-count">${VIDEOS.filter(v => v.topic === tp).length}</span></button>`
  ).join("");
}

/* ---------- grid + scroll infini ---------- */
function thumbSrc(v){ return `https://i.ytimg.com/vi/${v.yt}/mqdefault.jpg`; }
function cardHTML(v){
  return `<article class="card" onclick="openVideo('${v.id}')">
    <div class="thumb">
      <img src="${thumbSrc(v)}" alt="" loading="lazy" onerror="this.onerror=null;this.src='https://picsum.photos/seed/${v.yt}/640/360'">
      <div class="thumb-play"><span>${ic("play")}</span></div>
      <span class="cat-chip">${ic(catIcon(v.cat))} ${esc(v.cat)}</span>
      <span class="dur">${esc(v.dur)}</span>
    </div>
    <div class="card-body">
      ${avatarHTML(v.ch, chGrad(v.ch), "card-avatar")}
      <div class="card-info">
        <h3 class="card-title">${esc(v.t)}</h3>
        <div class="card-ch">${esc(v.ch)} ${ic("circle-check")}</div>
        <div class="card-meta">${fmtViews(vViews(v))} · ${relTime(vDate(v))}</div>
        <span class="card-topic">${esc(v.topic)}</span>
      </div>
    </div>
  </article>`;
}
function skeletons(n){
  return Array.from({length:n}, () =>
    `<div class="skel"><div class="sk-t"></div><div class="sk-l" style="width:82%"></div><div class="sk-l" style="width:55%"></div></div>`).join("");
}
function renderGrid(reset){
  const grid = $("#grid");
  if(reset){
    shown = 0;
    grid.innerHTML = skeletons(8);
    $("#empty").style.display = "none";
    setTimeout(() => { grid.innerHTML = ""; appendBatch(); }, 300);
    return;
  }
  appendBatch();
}
function appendBatch(){
  const grid = $("#grid");
  const next = currentList.slice(shown, shown + batch);
  shown += next.length;
  const tmp = document.createElement("div");
  tmp.innerHTML = next.map(cardHTML).join("");
  while(tmp.firstChild) grid.appendChild(tmp.firstChild);
  $("#empty").style.display = currentList.length === 0 ? "block" : "none";
  const sp = $("#loadSpin"); if(sp) sp.remove();
  if(shown < currentList.length){
    const d = document.createElement("div");
    d.id = "loadSpin"; d.className = "load-spin";
    d.innerHTML = `<div class="sp"></div>`;
    grid.after(d);
  }
}
const io = new IntersectionObserver(es => {
  es.forEach(e => {
    if(e.isIntersecting && $("#page-home").classList.contains("active") && shown < currentList.length) appendBatch();
  });
}, {rootMargin:"300px"});
function scrollToGrid(){ $("#filterBar").scrollIntoView({behavior:"smooth", block:"start"}); }
function listEmpty(el, msg, icon){
  el.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="e-i">${ic(icon || "inbox")}</div><h2>${msg}</h2></div>`;
}

/* ---------- navigation ---------- */
function navigate(page){
  showPage(page);
  if(page === "home"){ rebuildHome(); renderGrid(true); }
  if(page === "liked") renderLiked();
  if(page === "subscriptions") renderSubs();
  if(page === "history") renderHistory();
  if(page === "settings") loadSettingsForms();
  closeMobileSidebar();
  window.scrollTo({top:0, behavior:"smooth"});
}
function goSettings(tab){
  hideDropdown();
  navigate("settings");
  openSettingsTab(tab, document.querySelector(`.tab-btn-pro[data-tab="${tab}"]`));
}
function showPage(id){
  $$(".page").forEach(p => p.classList.remove("active"));
  const el = $("#page-" + id);
  if(el) el.classList.add("active");
  if(id !== "video"){ const pl = $("#playerLarge"); if(pl) pl.innerHTML = ""; } // na9fsou el son
}
function openCategory(cat){
  const list = VIDEOS.filter(v => v.cat === cat);
  $("#catTitle").textContent = cat;
  $("#catSub").textContent = list.length + " " + t("courses");
  $("#catIcon").innerHTML = ic(catIcon(cat));
  $("#categoryGrid").innerHTML = list.map(cardHTML).join("");
  if(!list.length) listEmpty($("#categoryGrid"), t("empty"), "magnifying-glass");
  showPage("category"); closeMobileSidebar();
  window.scrollTo({top:0, behavior:"smooth"});
}
function openTopic(tp){
  const list = VIDEOS.filter(v => v.topic === tp);
  $("#catTitle").textContent = tp;
  $("#catSub").textContent = list.length + " " + t("courses");
  $("#catIcon").innerHTML = ic(topicIcon(tp));
  $("#categoryGrid").innerHTML = list.map(cardHTML).join("");
  showPage("category"); closeMobileSidebar();
  window.scrollTo({top:0, behavior:"smooth"});
}

/* ---------- video page ---------- */
function openVideo(id){
  const v = VIDEOS.find(x => x.id === id);
  if(!v) return;
  currentVid = v;
  historyList = historyList.filter(h => h.id !== id);
  historyList.unshift({id, time: Date.now()});
  store.set("tt_history", historyList);
  showPage("video");
  renderVideoPage(v);
  history.replaceState(null, "", "#v=" + id);
  window.scrollTo({top:0, behavior:"smooth"});
}
function renderVideoPage(v, keepPlayer){
  if(!keepPlayer){
    const auto = settings.autoplay ? 1 : 0;
    $("#playerLarge").innerHTML =
      `<iframe src="https://www.youtube-nocookie.com/embed/${v.yt}?rel=0&autoplay=${auto}" title="${esc(v.t)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
  }
  $("#mTitleLarge").textContent = v.t;
  const av = avatarHTML(v.ch, chGrad(v.ch), "channel-avatar");
  $("#mChanAvatar").outerHTML = av.replace('class="channel-avatar"', 'class="channel-avatar" id="mChanAvatar"');
  $("#mChanLarge").textContent = v.ch;
  $("#mCatLarge").textContent = v.cat + " · " + v.topic;
  renderSubscribeBtn(v);
  renderActions(v);
  $("#mDescLarge").innerHTML =
    `<span class="meta-line">${fmtViews(vViews(v))} · ${relTime(vDate(v))} · ${esc(v.ch)}</span>` +
    esc(descFor(v)) + "<br>" +
    v.tags.map(tag => `<span class="tag">#${esc(tag)}</span>`).join("");
  renderComments(v);
  renderRelated(v);
}
function renderSubscribeBtn(v){
  const b = $("#subscribeBtn");
  const on = subs.includes(v.ch);
  b.className = "subscribe-btn" + (on ? " subscribed" : "");
  b.innerHTML = ic(on ? "bell-slash" : "bell") + ` <span>${on ? t("subd") : t("sub")}</span>`;
}
function toggleSubFromPage(){
  if(!currentVid) return;
  if(!guardAuth()) return;
  const i = subs.indexOf(currentVid.ch);
  if(i > -1){ subs.splice(i,1); toast(t("sub"), "bell-slash"); }
  else { subs.push(currentVid.ch); toast(t("subd"), "bell"); }
  store.set("tt_subs", subs);
  renderSubscribeBtn(currentVid);
}
function renderActions(v){
  const liked = !!likes[v.id];
  $("#mActionsLarge").innerHTML =
    `<button class="action-btn ${liked?"liked":""}" onclick="toggleLike('${v.id}')">${ic("heart")} <span>${vLikes(v) + (liked?1:0)}</span></button>
     <button class="action-btn" onclick="shareVideo('${v.id}')">${ic("share-nodes")} <span>${t("share")}</span></button>
     <button class="action-btn" onclick="openDl('${v.id}')">${ic("download")} <span>${t("dl")}</span></button>`;
}
function toggleLike(id){
  if(!guardAuth()) return;
  if(likes[id]) delete likes[id]; else likes[id] = 1;
  store.set("tt_likes", likes);
  if(currentVid && currentVid.id === id) renderActions(currentVid);
}
function shareVideo(id){
  const url = location.origin + location.pathname + "#v=" + id;
  try{ navigator.clipboard.writeText(url).then(() => toast(t("link_copied"), "link")); }
  catch(e){ toast(url, "link"); }
}
function openDl(id){
  const v = VIDEOS.find(x => x.id === id);
  if(!v) return;
  $("#dlSSYT").href  = "https://ssyoutube.com/watch?v=" + v.yt;
  $("#dlY2Mate").href = "https://www.y2mate.com/youtube/" + v.yt;
  $("#dlCobalt").href = "https://cobalt.tools/";
  $("#dlModal").classList.add("active");
}
function closeDlModal(){ $("#dlModal").classList.remove("active"); }
function renderRelated(v){
  const rel = VIDEOS.filter(x => x.id !== v.id)
    .sort((a,b) => (b.cat===v.cat)-(a.cat===v.cat) || (b.topic===v.topic)-(a.topic===v.topic))
    .slice(0, 8);
  $("#relatedList").innerHTML = rel.map(r =>
    `<div class="related-item" onclick="openVideo('${r.id}')">
      <div class="related-thumb"><img src="${thumbSrc(r)}" loading="lazy" onerror="this.onerror=null;this.src='https://picsum.photos/seed/${r.yt}/320/180'" alt=""><span class="dur">${esc(r.dur)}</span></div>
      <div class="related-info"><div class="related-title">${esc(r.t)}</div><div class="related-ch">${esc(r.ch)}</div><span class="related-cat">${esc(r.cat)}</span></div>
    </div>`).join("");
}

/* ---------- commentaires ---------- */
// TODO: nzid like 3la el comments mn ba3d
function seedComments(v){
  const n = 2 + (h32("c" + v.id) % 3);
  const arr = [];
  for(let i = 0; i < n; i++){
    const name = CMT_NAMES[(h32(v.id) + i*3) % CMT_NAMES.length];
    arr.push({
      name,
      text: CMT_POOL[(h32(v.id + i) % CMT_POOL.length)],
      time: Date.now() - (1 + (h32(v.id + i) % 60)) * 864e5,
      seed: true
    });
  }
  return arr;
}
function allComments(v){
  return [...(commentsDB[v.id] || []), ...seedComments(v)].sort((a,b) => b.time - a.time);
}
function renderComments(v){
  const list = allComments(v);
  const u = curUser();
  const form = u
    ? `<div class="cmt-form-large">
        ${avatarHTML(u.name, u.grad || userGrad(u.name), "cmt-avatar-large", u.avatar)}
        <div class="cmt-input-wrap-large">
          <input class="cmt-input-large" id="cmtInput" placeholder="${t("cmtph")}" onkeydown="if(event.key==='Enter')addComment()">
          <div class="cmt-btns-large"><button class="cmt-submit-large" onclick="addComment()">${t("post")}</button></div>
        </div>
      </div>`
    : `<div class="cmt-login-large">${t("login_cmt")} — <a onclick="openAuth('signin')">${t("signin")}</a></div>`;
  $("#cmtSectionLarge").innerHTML =
    `<div class="cmt-head">${t("comments")} <span>· ${list.length}</span></div>${form}
     <div class="cmt-list-large">${list.map(c =>
      `<div class="cmt-item-large">
        ${avatarHTML(c.name, userGrad(c.name), "cmt-avatar-large", c.avatar)}
        <div style="min-width:0;flex:1">
          <div class="cmt-user-large">${esc(c.name)} <span class="cmt-time-large">· ${relTime(c.time)}</span></div>
          <div class="cmt-text-large">${esc(c.text)}</div>
        </div>
        ${!c.seed && u && c.email === u.email ? `<button class="cmt-del-large" onclick="deleteComment('${v.id}',${c.time})">${ic("trash")}</button>` : ""}
      </div>`).join("")}</div>`;
}
function addComment(){
  if(!guardAuth()) return;
  const u = curUser();
  const inp = $("#cmtInput");
  const text = inp.value.trim();
  if(!text) return;
  (commentsDB[currentVid.id] = commentsDB[currentVid.id] || [])
    .push({name:u.name, email:u.email, text, avatar:u.avatar || null, time:Date.now()});
  store.set("tt_comments", commentsDB);
  renderComments(currentVid);
  toast(t("cmt_added"), "comment-dots");
}
function deleteComment(vid, time){
  commentsDB[vid] = (commentsDB[vid] || []).filter(c => c.time !== time);
  store.set("tt_comments", commentsDB);
  renderComments(VIDEOS.find(v => v.id === vid));
  toast(t("cmt_del"), "trash");
}

/* ---------- liked / subs / history ---------- */
function renderLiked(){
  const list = Object.keys(likes).map(id => VIDEOS.find(v => v.id === id)).filter(Boolean);
  $("#likedSub").textContent = list.length + " " + t("courses");
  const g = $("#likedGrid");
  g.innerHTML = list.map(cardHTML).join("");
  if(!list.length) listEmpty(g, t("no_like"), "heart");
}
function renderSubs(){
  const list = VIDEOS.filter(v => subs.includes(v.ch));
  $("#subsSub").textContent = subs.length + (subs.length === 1 ? " chaîne" : " chaînes");
  const g = $("#subsGrid");
  g.innerHTML = list.map(cardHTML).join("");
  if(!list.length) listEmpty(g, t("no_subs"), "bell");
}
function renderHistory(){
  const list = historyList.map(h => VIDEOS.find(v => v.id === h.id)).filter(Boolean);
  $("#histSub").textContent = list.length + " " + t("courses");
  const g = $("#historyGrid");
  g.innerHTML = list.map(cardHTML).join("");
  if(!list.length) listEmpty(g, t("no_hist"), "clock-rotate-left");
}

/* ---------- auth (localStorage bark, mafamech server) ---------- */
function guardAuth(){
  if(curUser()) return true;
  openAuth("signin");
  toast(t("need_login"), "lock");
  return false;
}
function openAuth(mode){
  authMode = mode || "signup";
  updateAuthUI();
  $("#authOv").classList.add("active");
}
function closeAuth(){
  $("#authOv").classList.remove("active");
  $("#authError").textContent = "";
  signupAvatarData = null;
  $("#signupAvatar").innerHTML = ic("camera") + '<input type="file" accept="image/*" onchange="previewAvatar(event)">';
}
function toggleAuthMode(){ authMode = authMode === "signup" ? "signin" : "signup"; updateAuthUI(); }
function updateAuthUI(){
  const su = authMode === "signup";
  $("#authTitle").textContent = su ? "Créer un compte" : "Connexion";
  $("#nameGroup").style.display = su ? "" : "none";
  $("#signupAvatar").style.display = su ? "" : "none";
  $("#authBtn").textContent = su ? "Créer le compte" : "Se connecter";
  $("#authSwitch").innerHTML = su ? `Déjà un compte ? <b>Connexion</b>` : `Mazelt m3andekch compte ? <b>Crée-en un</b>`;
}
function previewAvatar(e){
  const f = e.target.files[0];
  if(!f) return;
  const r = new FileReader();
  r.onload = ev => {
    signupAvatarData = ev.target.result;
    $("#signupAvatar").innerHTML = `<img src="${signupAvatarData}"><input type="file" accept="image/*" onchange="previewAvatar(event)">`;
  };
  r.readAsDataURL(f);
}
function handleAuth(){
  const name  = $("#authName").value.trim();
  const email = $("#authEmail").value.trim().toLowerCase();
  const pass  = $("#authPass").value;
  const err   = $("#authError");
  err.textContent = "";
  const okMail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if(authMode === "signup"){
    if(name.length < 2){ err.textContent = t("err_name"); return; }
    if(!okMail){ err.textContent = t("err_email"); return; }
    if(pass.length < 6){ err.textContent = t("err_pass"); return; }
    if(users.some(u => u.email === email)){ err.textContent = t("err_exists"); return; }
    users.push({name, email, pass, avatar: signupAvatarData, grad: userGrad(name)});
    store.set("tt_users", users);
    session = email; store.set("tt_session", session);
  }else{
    const u = users.find(x => x.email === email && x.pass === pass);
    if(!u){ err.textContent = t("err_creds"); return; }
    session = email; store.set("tt_session", session);
  }
  closeAuth();
  renderAuthArea();
  if(currentVid) renderComments(currentVid);
  toast(t("welcome") + ", " + curUser().name.split(" ")[0], "wand-magic-sparkles");
}
function logOut(){
  session = null; store.set("tt_session", null);
  hideDropdown();
  renderAuthArea();
  navigate("home");
  toast(t("bye"), "right-from-bracket");
}
function renderAuthArea(){
  const area = $("#authArea");
  const u = curUser();
  if(!u){
    area.innerHTML = `<button class="signin-btn" onclick="openAuth('signin')">${ic("circle-user")} <span>${t("signin")}</span></button>`;
    return;
  }
  area.innerHTML = `<button class="avatar-btn" style="background:${u.grad || userGrad(u.name)}" onclick="toggleDropdown(event)">${u.avatar ? `<img src="${u.avatar}">` : esc(u.name.charAt(0).toUpperCase())}</button>`;
  const av = avatarHTML(u.name, u.grad || userGrad(u.name), "dd-avatar", u.avatar);
  $("#ddAvatar").outerHTML = av.replace('class="dd-avatar"', 'class="dd-avatar" id="ddAvatar"');
  $("#ddName").textContent = u.name;
  $("#ddEmail").textContent = u.email;
}
function toggleDropdown(e){
  e.stopPropagation();
  $("#dropdown").classList.toggle("open");
}
function hideDropdown(){ $("#dropdown").classList.remove("open"); }
document.addEventListener("click", e => {
  const d = $("#dropdown");
  if(d.classList.contains("open") && !d.contains(e.target)) hideDropdown();
});

/* ---------- settings pro ---------- */
function openSettingsTab(tab, btn){
  $$(".tab-btn-pro").forEach(b => b.classList.remove("active"));
  if(btn) btn.classList.add("active");
  $$(".settings-pane-pro").forEach(p => p.classList.remove("active"));
  const p = $("#set-pro-" + tab);
  if(p) p.classList.add("active");
  settingsTab = tab;
}
function loadSettingsForms(){
  const u = curUser();
  $("#accLocked").innerHTML = u ? "" : `<div class="cmt-login-large">${t("login_view")} — <a onclick="openAuth('signin')">${t("signin")}</a></div>`;
  $("#accBody").style.display = u ? "" : "none";
  if(u){
    $("#accNamePro").value = u.name;
    $("#accEmailPro").value = u.email;
    $("#accOldPassPro").value = "";
    $("#accNewPassPro").value = "";
    $("#accErrorPro").textContent = "";
    const av = avatarHTML(u.name, u.grad || userGrad(u.name), "avatar-preview-wrapper-pro", u.avatar);
    $("#accAvatarWrapPro").outerHTML = av.replace('class="avatar-preview-wrapper-pro"', 'class="avatar-preview-wrapper-pro" id="accAvatarWrapPro"');
  }
  $("#channelNamePro").value = channelProfile.name || "";
  $("#channelBioPro").value = channelProfile.bio || "";
  $("#channelCatPro").value = channelProfile.cat || "";
  $("#channelLinkPro").value = channelProfile.link || "";
  $("#channelSocialPro").value = channelProfile.social || "";
  $("#t-pro-dark").classList.toggle("on", settings.theme === "dark");
  $("#t-pro-auto").classList.toggle("on", !!settings.autoplay);
  $("#langSelectPro").value = settings.lang;
  $("#qualitySelectPro").value = settings.quality;
  $("#fontSelectPro").value = settings.font;
}
function changeAccPicPro(e){
  const u = curUser(); if(!u) return;
  const f = e.target.files[0]; if(!f) return;
  const r = new FileReader();
  r.onload = ev => {
    u.avatar = ev.target.result;
    store.set("tt_users", users);
    loadSettingsForms(); renderAuthArea();
    toast(t("acc_upd"), "image");
  };
  r.readAsDataURL(f);
}
function randomizeAvatarPro(){
  const u = curUser(); if(!u) return;
  u.avatar = null;
  const h = Math.floor(Math.random() * 360);
  u.grad = `linear-gradient(135deg,hsl(${h} 82% 48%),hsl(${(h+50)%360} 86% 60%))`;
  store.set("tt_users", users);
  loadSettingsForms(); renderAuthArea();
  toast(t("acc_upd"), "shuffle");
}
function saveAccountPro(){
  const u = curUser(); if(!u) return;
  const err = $("#accErrorPro"); err.textContent = "";
  const name = $("#accNamePro").value.trim();
  const oldp = $("#accOldPassPro").value;
  const newp = $("#accNewPassPro").value;
  if(name.length < 2){ err.textContent = t("err_name"); return; }
  if(newp){
    if(oldp !== u.pass){ err.textContent = t("err_oldpass"); return; }
    if(newp.length < 6){ err.textContent = t("err_pass"); return; }
    u.pass = newp;
  }
  u.name = name;
  store.set("tt_users", users);
  renderAuthArea();
  toast(t("acc_upd"), "check");
}
function saveChannelPro(){
  channelProfile = {
    name: $("#channelNamePro").value.trim(),
    bio: $("#channelBioPro").value.trim(),
    cat: $("#channelCatPro").value,
    link: $("#channelLinkPro").value.trim(),
    social: $("#channelSocialPro").value.trim()
  };
  store.set("tt_channel", channelProfile);
  toast(t("ch_saved"), "tv");
}
function toggleSetPro(k){
  if(k === "dark"){
    settings.theme = settings.theme === "dark" ? "light" : "dark";
    applyTheme();
    $("#t-pro-dark").classList.toggle("on", settings.theme === "dark");
  }
  if(k === "auto"){
    settings.autoplay = !settings.autoplay;
    $("#t-pro-auto").classList.toggle("on", settings.autoplay);
  }
  store.set("tt_settings", settings);
}
function setLangPro(v){ settings.lang = v; store.set("tt_settings", settings); applyLang(); toast(t("saved_ok"), "globe"); }
function setQualityPro(v){ settings.quality = v; store.set("tt_settings", settings); toast(t("saved_ok"), "display"); }
function setFontSizePro(v){ settings.font = v; store.set("tt_settings", settings); applyFont(); toast(t("saved_ok"), "text-height"); }
function clearHistoryPro(){
  historyList = []; store.set("tt_history", []);
  if($("#page-history").classList.contains("active")) renderHistory();
  toast(t("reset_done"), "trash");
}
function clearLikesPro(){
  likes = {}; store.set("tt_likes", {});
  if(currentVid) renderActions(currentVid);
  toast(t("reset_done"), "heart");
}
function resetAllAppDataPro(){
  localStorage.clear();
  toast(t("reset_done"), "shield-halved");
  setTimeout(() => location.reload(), 900);
}

/* ---------- theme / font / sidebar ---------- */
function applyTheme(){
  document.documentElement.setAttribute("data-theme", settings.theme);
  $("#themeBtn").innerHTML = ic(settings.theme === "dark" ? "sun" : "moon");
}
function toggleTheme(){
  settings.theme = settings.theme === "dark" ? "light" : "dark";
  store.set("tt_settings", settings);
  applyTheme();
  const tog = $("#t-pro-dark");
  if(tog) tog.classList.toggle("on", settings.theme === "dark");
}
function applyFont(){ document.body.style.zoom = settings.font === "small" ? 0.92 : settings.font === "large" ? 1.08 : 1; }
function toggleSidebar(){
  if(window.innerWidth <= 1150) document.body.classList.toggle("sidebar-open");
  else document.body.classList.toggle("sidebar-collapsed");
}
function closeMobileSidebar(){ document.body.classList.remove("sidebar-open"); }
function toggleMobileSearch(){
  document.body.classList.toggle("search-open");
  if(document.body.classList.contains("search-open")) $("#searchInput").focus();
}

/* ---------- boot ---------- */
function route(){
  const h = location.hash;
  if(h.startsWith("#v=")){
    const id = h.slice(3);
    if(VIDEOS.some(v => v.id === id)){ openVideo(id); return true; }
  }
  return false;
}
window.addEventListener("hashchange", route);
window.addEventListener("resize", () => {
  const b = $("#mSearchBtn");
  if(b) b.style.display = window.innerWidth <= 860 ? "flex" : "none";
  if(window.innerWidth > 1150) closeMobileSidebar();
});
document.addEventListener("keydown", e => {
  if(e.key === "/" && !["INPUT","TEXTAREA"].includes(document.activeElement.tagName)){
    e.preventDefault(); $("#searchInput").focus();
  }
  if(e.key === "Escape"){ closeAuth(); closeDlModal(); hideDropdown(); }
});
$("#authOv").addEventListener("click", e => { if(e.target.id === "authOv") closeAuth(); });

async function boot(){
  applyTheme(); applyFont(); renderAuthArea();
  $("#grid").innerHTML = skeletons(8);
  io.observe($("#sentinel"));

  VIDEOS = await loadCourses(); // mel data.js -> tounes_courses.json

  applyLang();
  renderMarquee();
  updateCount();
  currentFilter();
  if(!route()) renderGrid(true);
  loadSettingsForms();

  const b = $("#mSearchBtn");
  if(b && window.innerWidth <= 860) b.style.display = "flex";
  console.log("TunisianTube ready:", VIDEOS.length, "videos");
}
boot();
