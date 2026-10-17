'use strict';
/* Live watching counter — Firebase Realtime Database presence, dihitung PER PERANGKAT.
   Struktur: presence/{deviceId}/{tabId} = true
   - deviceId disimpan di localStorage (1 perangkat/browser = 1 id), tabId baru tiap tab dibuka.
   - Entri tab otomatis hilang saat tab ditutup (onDisconnect); kalau tab terakhir hilang,
     node deviceId ikut hilang sendiri. Jumlah anak di presence/ = jumlah perangkat unik.
   Gagal / offline -> counter tetap tersembunyi, tidak mengganggu bagian lain. */
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js";
import { getDatabase, ref, onValue, set, onDisconnect }
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

function rid() {
  var s = (window.crypto && crypto.randomUUID) ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
  return s.replace(/[^a-zA-Z0-9]/g, '').slice(0, 32);
}
function deviceId() {
  var k = 'dumul_dev', v = '';
  try { v = localStorage.getItem(k) || ''; } catch (e) {}
  if (!/^[a-zA-Z0-9]{8,40}$/.test(v)) {
    v = rid();
    try { localStorage.setItem(k, v); } catch (e) {} /* storage diblokir -> id sementara (per tab) */
  }
  return v;
}

try {
  const el = document.getElementById('live-count');
  const num = el && el.querySelector('b');
  if (el && num) {
    const db = getDatabase(initializeApp(firebaseConfig));
    const me = ref(db, 'presence/' + deviceId() + '/' + rid());

    onValue(ref(db, '.info/connected'), (s) => {
      if (!s.val()) return;
      onDisconnect(me).remove().then(() => set(me, true)).catch(() => {});
    });
    onValue(ref(db, 'presence'), (s) => {
      num.textContent = s.size;   /* jumlah perangkat unik */
      el.hidden = false;
    }, () => { el.hidden = true; });
  }
} catch (e) { /* diam saja */ }
