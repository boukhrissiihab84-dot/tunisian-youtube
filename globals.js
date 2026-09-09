// ==========================================
// 1. GLOBALS.JS - المتغيرات العامة وقاعدة البيانات
// ==========================================

const GUARANTEED_TOUNES_COURSES = [
    { "Video_ID": "67UAnLg9WJ8", "Titre": "Tutoriel Photoshop pour Débutants en Derja", "Chaine": "@skander_b", "Categorie": "Design", "Mawdhou3": "Photoshop" },
    { "Video_ID": "vV77G_62K4Q", "Titre": "Apprendre Python de Zéro en Tunisien", "Chaine": "@TounesCode", "Categorie": "Programmation", "Mawdhou3": "Python" },
    { "Video_ID": "JmU3zFmK_Xo", "Titre": "Formation HTML & CSS b Derja Tounsia", "Chaine": "@Carthage_Geek", "Categorie": "Programmation", "Mawdhou3": "HTML/CSS" },
    { "Video_ID": "U36y8O43g18", "Titre": "Apprendre l'anglais b derja tounsia", "Chaine": "@Anglais_b_derja", "Categorie": "Langues", "Mawdhou3": "Anglais" },
    { "Video_ID": "fVw-n9_RbeU", "Titre": "Révision Bac Informatique Algorithmique", "Chaine": "@TakiAcademy", "Categorie": "Bac & Etudes", "Mawdhou3": "Bac Info" },
    { "Video_ID": "Nn03H291410", "Titre": "Figma UI/UX Design Tutorial Tunisien", "Chaine": "@designtounsi", "Categorie": "Design", "Mawdhou3": "Figma" },
    { "Video_ID": "U67kLp89Un3", "Titre": "Tutoriel Montage Vidéo CapCut PC b Derja", "Chaine": "@skander_b", "Categorie": "Montage", "Mawdhou3": "CapCut" },
    { "Video_ID": "f90UjK89La3", "Titre": "Facebook Ads Marketing Tunisie Kifech Tebda", "Chaine": "@Med_Amine_Sahnoun", "Categorie": "Marketing", "Mawdhou3": "Facebook Ads" }
];

const S = {
    g(k) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } },
    s(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
    r(k) { try { localStorage.removeItem(k); } catch (e) {} }
};

let allVideos = [];
let currentFilter = { cat: null, sub: null, search: "" };
let currentVid = "";
let activeList = [];
let displayedCount = 0;
const BATCH_SIZE = 24;
let user = S.g("user"), isSignUp = true;
let tempAvatar = "";
let searchTimer;
let observer;
