// ==========================================
// FIREBASE CONFIG - TunisianTube
// Compat SDK (يعمل مع script tags على GitHub Pages)
// ==========================================

const firebaseConfig = {
  apiKey: "AIzaSyB7Q0cNFdwKzop4KMH1QTW09JmP1J_rGcs",
  authDomain: "tunisiantube.firebaseapp.com",
  projectId: "tunisiantube",
  storageBucket: "tunisiantube.firebasestorage.app",
  messagingSenderId: "1075520590917",
  appId: "1:1075520590917:web:7ed5513f4646512685bf2c",
  measurementId: "G-GBWD9H2GW2"
};

// Initialize Firebase (Compat)
firebase.initializeApp(firebaseConfig);

// Services
const auth = firebase.auth();
const db = firebase.firestore();

console.log("✅ Firebase connected:", firebaseConfig.projectId);
