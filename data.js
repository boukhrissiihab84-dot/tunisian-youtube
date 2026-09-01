/* ==================================================
   TunisianTube - data.js
   el base de données: tekrah mel tounes_courses.json
   (fel repo 9oddem el html, ya github pages)
================================================== */

const JSON_PATH = "tounes_courses.json";

// fallback: ken el fetch mayemchich (file:// wala json mouch mawjoud)
const FALLBACK_VIDEOS = [
  {yt:"PkZNo7MFNFg",t:"JavaScript — الكورس الكامل من الصفر",ch:"Darija Code Academy",cat:"Programming",topic:"Web",dur:"3:26:41",d:400},
  {yt:"rfscVS0vtbw",t:"Python Full Course — تعلم البايثون خطوة بخطوة",ch:"El Academy",cat:"Programming",topic:"Python",dur:"4:26:52",d:380},
  {yt:"nu_pCVPKzTk",t:"React كامل — ابني أول App متاعك",ch:"Darija Code Academy",cat:"Programming",topic:"Web",dur:"11:55:27",d:220},
  {yt:"UB1O30fR-EE",t:"HTML للمبتدئين — Crash بالتونسي",ch:"Tounsi Tech",cat:"Programming",topic:"Web",dur:"39:51",d:15},
  {yt:"VPvVD8t02U8",t:"Flutter — App لـ Android و iOS في كورس وحدة",ch:"Tounsi Tech",cat:"Programming",topic:"Mobile",dur:"37:06:20",d:170},
  {yt:"HXV3zeQKqGY",t:"SQL & Databases — الكورس الكامل",ch:"El Academy",cat:"Programming",topic:"Data",dur:"4:20:39",d:280},
  {yt:"SWYqp7iY_Tc",t:"Git & GitHub — Crash Course",ch:"Tounsi Tech",cat:"Programming",topic:"DevOps",dur:"32:41",d:40},
  {yt:"aircAruvnKk",t:"شنوة الـ Neural Network؟ — شرح بصري",ch:"Math Bel Darja",cat:"Education",topic:"IA",dur:"19:13",d:100},
  {yt:"RxCR3g6aYJ0",t:"Français — Apprends en 1 heure (A1)",ch:"Lingua TN",cat:"Languages",topic:"Français",dur:"1:05:21",d:160},
  {yt:"TcDlF9ayfUM",t:"Apprendre le Tunisien (Derja) #1 — Salutations",ch:"Lingua TN",cat:"Languages",topic:"Derja",dur:"08:42",d:340}
];

// yetkharrej el id mtee3 youtube mel url, mel ay forme
function ytIdFrom(s){
  if(!s) return null;
  s = String(s).trim();
  const m = s.match(/(?:watch\?v=|youtu\.be\/|embed\/|shorts\/|\/v\/|v=)([\w-]{11})/);
  if(m) return m[1];
  if(/^[\w-]{11}$/.test(s)) return s; // id bark, barcha nas taaml hakka
  return null;
}

// nbaddlou ay ligne mel json l objet standard, nkabblou fr w en
function normalizeCourse(raw, i){
  if(!raw || typeof raw !== "object") return null;
  const yt = ytIdFrom(raw.yt || raw.ytId || raw.videoId || raw.id || raw.url || raw.link || raw.embed);
  if(!yt) return null;
  const cat = raw.categorie || raw.category || raw.cat || "Other";
  return {
    id: "v" + i + "-" + yt,
    yt,
    t: raw.titre || raw.title || raw.t || raw.name || ("Vidéo " + (i+1)),
    ch: raw.chaine || raw.channel || raw.ch || raw.author || "Chaîne",
    cat,
    topic: raw.sujet || raw.topic || cat,
    dur: raw.duree || raw.duration || raw.dur || "—",
    d: daysAgoFrom(raw) || (20 + (i * 37) % 400),
    views: num(raw.vues || raw.views) || null,
    likes: num(raw.likes) || null,
    tags: Array.isArray(raw.tags) ? raw.tags : (raw.motcles ? String(raw.motcles).split(",") : [])
  };
}
function num(x){ const n = parseInt(x); return isNaN(n) ? null : n; }
function daysAgoFrom(raw){
  const ds = raw.dateAjout || raw.date || raw.added;
  if(!ds) return null;
  const t = Date.parse(ds);
  if(isNaN(t)) return null;
  return Math.max(1, Math.floor((Date.now() - t) / 864e5));
}

// el lecture mel github pages (meme dossier)
async function loadCourses(){
  try{
    const r = await fetch(JSON_PATH, {cache:"no-store"});
    if(!r.ok) throw new Error("http " + r.status);
    const j = await r.json();
    const arr = Array.isArray(j) ? j : (j.videos || j.courses || j.playlist || j.data || []);
    const out = arr.map(normalizeCourse).filter(Boolean);
    if(out.length){
      console.log("[data] " + out.length + " videos mel " + JSON_PATH);
      return out;
    }
  }catch(e){
    console.warn("[data] json mech mawjoud / ma taarech yekrah, nkhedmou bel fallback", e);
  }
  return FALLBACK_VIDEOS.map(normalizeCourse).filter(Boolean);
}

/* ---------- petits helpers deterministes (bch el views mayetbaddlouch) ---------- */
function h32(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function vViews(v){ return v.views || (4000 + (h32(v.id) % 880000)); }
function vLikes(v){ return (v.likes != null ? v.likes : 40 + (h32("L"+v.id) % 9000)); }
function vDate(v){ return new Date(Date.now() - (v.d % 420) * 864e5); }
function chGrad(ch){ const h = h32(ch) % 360; return `linear-gradient(135deg,hsl(${h} 78% 46%),hsl(${(h+42)%360} 84% 58%))`; }
function userGrad(name){ const h = h32(name) % 360; return `linear-gradient(135deg,hsl(${h} 80% 48%),hsl(${(h+40)%360} 85% 58%))`; }

// icons 7asb el categorie (font awesome)
const CAT_ICONS = {
  "Programming":"code","Design":"palette","Languages":"language",
  "Marketing":"bullhorn","Education":"graduation-cap","Other":"folder"
};
function catIcon(c){ return CAT_ICONS[c] || "folder"; }
const TOPIC_ICONS = {
  "Web":"code","Python":"terminal","Mobile":"mobile-screen","Data":"database",
  "DevOps":"code-branch","IA":"brain","Maths":"square-root-variable",
  "UI/UX":"pen-nib","Photoshop":"image","Français":"book-open",
  "Derja":"comment","Marketing":"arrow-trend-up","Anglais":"language"
};
function topicIcon(tp){ return TOPIC_ICONS[tp] || "hashtag"; }

/* ---------- textes eli yad7nou lel app ---------- */
const DESC_POOL = [
  "كورس كامل ومجاني مخصص للتونسيين. خلي لايك وشيير مع صحابك يلي تحب توصلهم الخدمة.",
  "Une formation complète et gratuite, sélectionnée pour la communauté tunisienne. Abonne-toi pour ne rien rater.",
  "شرح مبسط خطوة بخطوة، يصلح للمبتدئ والي عنده مستوى. بالتوفيق!",
  "Cours 100% gratuit — zid abonne ro7ek lel chaîne bech youslouk el jdid."
];
const CMT_NAMES = ["Ahmed Trabelsi","Yasmine Ben Ali","Mehdi Gharbi","Cyrine Haddad","Skander Msakni","Amine Khelifi","Nour Bouzid","Karim Jendoubi","Salma Ayari","Oussama Ben Ammar","Rim Sassi","Wassim Derbali"];
const CMT_POOL = [
  "شرح واضح برشا، شكرا خويا!","Enfin j'ai compris ce concept, merci beaucoup!",
  "بارك الله فيك، محتوى عالمي بصراحة","Bravo 3lik, continue la série!",
  "هذا أحسن كورس شفته في الموضوع","Walfit netfarej, n7eb el contenu kima héké",
  "Merci! Yelzem chwaya exemples akther","الله يعطيك الصحة، تبرك الله فيك",
  "Top quality content, ماشاء الله","سمحني وين نلقى الملفات؟",
  "شكرا، استنى في الجزء الثاني","Simple w clair, برافو"
];
function descFor(v){ return DESC_POOL[h32(v.id) % DESC_POOL.length]; }
