/* Live watching counter — Firebase Realtime Database presence.
   Tiap pengunjung = 1 entri di presence/, otomatis hilang saat tab ditutup (onDisconnect).
   Gagal / offline -> counter tetap tersembunyi, tidak mengganggu bagian lain. */
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js";
import { getDatabase, ref, onValue, push, set, onDisconnect }
  from "https://www.gstatic.com/firebasejs/13.0.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBjsx_DpDbq7OwU5FBhY7T-F_EQNiIojF4",
  authDomain: "dumul-live-counter.firebaseapp.com",
  databaseURL: "https://dumul-live-counter-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "dumul-live-counter",
  storageBucket: "dumul-live-counter.firebasestorage.app",
  messagingSenderId: "332568387431",
  appId: "1:332568387431:web:28667e919b4b972ea519c2"
};

try {
  const el = document.getElementById('live-count');
  const num = el && el.querySelector('b');
  if (el && num) {
    const db = getDatabase(initializeApp(firebaseConfig));
    const me = push(ref(db, 'presence'));

    onValue(ref(db, '.info/connected'), (s) => {
      if (!s.val()) return;
      onDisconnect(me).remove().then(() => set(me, true)).catch(() => {});
    });
    onValue(ref(db, 'presence'), (s) => {
      num.textContent = s.size;
      el.hidden = false;
    }, () => { el.hidden = true; });
  }
} catch (e) { /* diam saja */ }
