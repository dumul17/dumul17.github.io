/* Dumul's Observatory — service worker (audio on-demand cache, Opsi A per-halaman)
   - Halaman (navigate)      -> network-first, fallback cache kalau offline
   - CSS/JS/gambar/font      -> stale-while-revalidate
   - Audio (.opus dll)       -> kalau sudah tersimpan: dilayani dari cache lengkap dengan Range/206 (seek aman)
                                kalau belum: diteruskan apa adanya ke network
   - Lagu disimpan HANYA lewat PRECACHE_AUDIO (unduh offline, dipicu pengunjung). Tidak ada simpan otomatis.
   - Opsi A: tiap halaman kirim d.urls (19 Observatory / 5 DUMUL). Satu AUDIO_CACHE bersama; GARG di audio/ root.
     Struktur: audio/obs-audio/ (18), audio/lmr-audio/ (4), audio/glitch-instrumental.opus (handoff).
   Naikkan VERSION tiap deploy besar; naikkan AUDIO_VERSION kalau file .opus diganti isinya. */
const VERSION = 'v510'; /* [PATCH v189 + G5.1: warm GL pra-kapsul (glskyWarm), langkah PRE gl/pl, bar dikalibrasi ulang] naikkan tiap deploy (node check-sky.js memeriksa ?v= vs SHELL) */
const AUDIO_VERSION = 'v3';   /* v3: folder obs-audio / lmr-audio + GARG root; precache per-halaman */
const SHELL_CACHE = `dumul-shell-${VERSION}`;
const RUNTIME_CACHE = `dumul-runtime-${VERSION}`;
const AUDIO_CACHE = `dumul-audio-${AUDIO_VERSION}`;

const MAX_AUDIO_FILES = 24;                /* cukup buat semua lagu (23 file, ~67 MB union) */
const MAX_AUDIO_BYTES = 70 * 1024 * 1024;  /* file lebih besar dari ini tidak disimpan */
const TEE_ON_MISS = false;                 /* true = file yang belum tersimpan diunduh SEKALI: satu cabang ke cache, satu cabang langsung ke pemutar. false = perilaku lama (teruskan ke network, simpan terpisah) */

/* Daftar lagu dari sky-data.js. ALL_AUDIO = union 23 (fallback). Halaman kirim d.urls untuk total per-halaman. */
importScripts('dumul-js/obs/sky-data.js?v=32');
const ALL_AUDIO = SKY.audioFiles();

/* Harus sama persis dengan yang dipanggil HTML (termasuk ?v=) */
const SHELL = [
  './',
  'index.html',
  'dumul.html',
  'dumul-css/index.css?v=109',
  /* harus sama persis dengan <script src> di index.html */
  'dumul-js/obs/sky-data.js?v=32',
  'dumul-js/obs/texts.js?v=1',
  'dumul-js/obs/i18n.js?v=52',
  'dumul-js/obs/i18n-sky.js?v=2',
  'dumul-js/obs/i18n-texts.js?v=1',
  'dumul-js/obs/js/00-rain.js?v=8',
  'dumul-js/obs/js/01-core.js?v=154',
  'dumul-js/obs/js/02-sky-logic.js?v=156',
  'dumul-js/obs/js/03-gargantua.js?v=117',
  'dumul-js/obs/js/04-render.js?v=170',
  'dumul-js/obs/js/05-sector-ui.js?v=210',
  'dumul-js/obs/js/06-interaction.js?v=134',
  'dumul-js/obs/js/07-boot.js?v=189',
  'dumul-js/obs/js/08-tx-drone.js?v=16',
  'dumul-js/obs/js/09-wormhole.js?v=62',
  'dumul-js/obs/js/10-ui-sound.js?v=9',
  'dumul-js/obs/js/11-live-count.js?v=5',
  'dumul-js/obs/js/12-ast3d.js?v=44',
  'dumul-js/obs/js/13-scope3d.js?v=41',
  'dumul-js/obs/js/14-drone3d.js?v=21',
  'dumul-js/obs/js/15-portal3d.js?v=59',
  'dumul-js/obs/js/16-sector-menu.js?v=7',
  'dumul-js/obs/js/17-planet3d.js?v=66',
  'dumul-js/obs/js/18-tune3d.js?v=19',
  'dumul-js/obs/js/22-sky-now.js?v=4',
  'dumul-js/obs/js/24-glsky.js?v=32',
  'dumul-js/obs/lib/three.custom.r186.js?v=2',
  'img/nebula.webp?v=1',
  'img/milky-way.webp?v=3',
  'dumul-css/dumul.css?v=11',
  'dumul-js/lmr/dumul.js?v=13',
  'dumul-js/lmr/dumul-app.js?v=15',
  'audio/lmr-audio/og.webp',
  'audio/obs-audio/collapsars-cover.webp',
  'manifest.json',
  'icons/icon-192.png',
  'icons/icon-512.png'
];

const VER_RE = /[?&]v=\d+(&|$)/;          /* URL versi (immutable) */
const NAV_TIMEOUT = 4000;                 /* navigasi: tunggu network maks 4 dtk kalau sudah ada salinan cache */
const MEDIA_RE = /\.(opus|mp3|ogg|oga|m4a|aac|wav|flac|webm|mp4)$/i;
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL_CACHE);
    /* URL ber-?v= dianggap immutable: kalau sudah ada di shell cache versi sebelumnya, disalin (nol byte unduhan).
       Halaman HTML & aset tanpa ?v= tetap diambil ulang. Konsekuensi: file yang diedit WAJIB bump ?v= (check-sky.js). */
    const oldNames = (await caches.keys()).filter((k) => k.startsWith('dumul-shell-') && k !== SHELL_CACHE);
    const olds = [];
    for (const n of oldNames) olds.push(await caches.open(n));
    await Promise.allSettled(
      SHELL.map(async (u) => {
        if (VER_RE.test(u)) {
          const abs = new URL(u, self.registration.scope).href;
          for (const oc of olds) {
            const hit = await oc.match(abs);
            if (hit) { await cache.put(abs, hit); return; }
          }
        }
        await cache.add(new Request(u, { cache: 'reload' }));
      })
    );
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keep = [SHELL_CACHE, RUNTIME_CACHE, AUDIO_CACHE];
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => !keep.includes(k)).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  const d = event.data;
  if (!d) return;
  if (d.type === 'CACHE_AUDIO' && typeof d.url === 'string') {
    event.waitUntil(cacheAudio(d.url));
  } else if (d.type === 'CACHE_AUDIO_LIST' && Array.isArray(d.urls)) {
    /* v132: beberapa file berurutan (bukan paralel) supaya tidak berebut bandwidth dengan lagu yang sedang diputar */
    event.waitUntil((async () => { for (const u of d.urls.slice(0, 4)) { if (typeof u === 'string') await cacheAudio(u); } })());
  } else if (d.type === 'PRECACHE_AUDIO') {
    event.waitUntil(precacheList(Array.isArray(d.urls) && d.urls.length ? d.urls : ALL_AUDIO));
  } else if (d.type === 'AUDIO_STATUS') {
    event.waitUntil(replyStatus(event.source, Array.isArray(d.urls) && d.urls.length ? d.urls : ALL_AUDIO));
  }
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  /* Audio */
  if (MEDIA_RE.test(url.pathname) || req.destination === 'audio' || req.destination === 'video') {
    if (url.origin === self.location.origin) event.respondWith(serveAudio(req, url, event));
    return;
  }

  /* Request Range lain: jangan disentuh */
  if (req.headers.has('range')) return;

  if (req.mode === 'navigate') {
    event.respondWith(networkFirst(req, event));
    return;
  }

  if (url.origin === self.location.origin && VER_RE.test(url.search)) {
    event.respondWith(cacheFirst(req));    /* ?v= immutable: tanpa revalidate tiap load */
    return;
  }

  if (url.origin === self.location.origin || FONT_HOSTS.includes(url.hostname)) {
    event.respondWith(staleWhileRevalidate(req, event));
  }
});

/* ---------------- AUDIO ---------------- */

/* Kunci cache = origin + path, tanpa query/hash */
function audioKey(u) {
  const x = new URL(u, self.location.href);
  return x.origin + x.pathname;
}

const inflight = new Map();
let precaching = false;

/* true = lagu ini sekarang ada di cache (sudah ada atau baru berhasil disimpan), false = gagal */
function cacheAudio(rawUrl) {
  let key;
  try {
    const url = new URL(rawUrl, self.location.href);
    if (url.origin !== self.location.origin || !MEDIA_RE.test(url.pathname)) return Promise.resolve(false);
    key = audioKey(url.href);
  } catch (err) { return Promise.resolve(false); }
  if (inflight.has(key)) return inflight.get(key);   /* jalur lain sedang mengunduh file yang sama */
  const p = storeAudio(key).finally(() => inflight.delete(key));
  inflight.set(key, p);
  return p;
}

async function storeAudio(key) {
  try {
    const cache = await caches.open(AUDIO_CACHE);
    if (await cache.match(key)) return true;

    const res = await fetch(key);                /* tanpa Range -> 200 utuh */
    if (!res.ok || res.status !== 200) return false;
    const len = +res.headers.get('content-length') || 0;
    if (len > MAX_AUDIO_BYTES) return false;

    await cache.put(key, res);                   /* koneksi putus di tengah -> put gagal, tidak ada file setengah jadi */
    await trimAudio(cache);
    return true;
  } catch (err) { return false; }                /* diam: ini cuma optimasi */
}

/* Buang yang paling lama disimpan kalau jumlah file melebihi MAX_AUDIO_FILES */
async function trimAudio(cache) {
  const keys = await cache.keys();               /* urutan = paling lama disimpan dulu */
  for (let i = 0; i < keys.length - MAX_AUDIO_FILES; i++) await cache.delete(keys[i]);
}

/* Hitung berapa path dari list yang sudah ada di AUDIO_CACHE (per-halaman lewat urls). */
async function countCached(urls) {
  const list = urls && urls.length ? urls : ALL_AUDIO;
  const cache = await caches.open(AUDIO_CACHE);
  let n = 0;
  for (const f of list) {
    if (await cache.match(audioKey(new URL(f, self.registration.scope).href))) n++;
  }
  return n;
}

async function replyStatus(client, urls) {
  try {
    const list = urls && urls.length ? urls : ALL_AUDIO;
    if (client) client.postMessage({ type: 'AUDIO_STATUS', cached: await countCached(list), total: list.length });
  } catch (e) {}
}

/* Unduh daftar urls satu per satu (Opsi A: 19 atau 5). Fallback ALL_AUDIO kalau urls kosong. */
async function precacheList(urls) {
  if (precaching) return;
  precaching = true;
  const list = urls && urls.length ? urls : ALL_AUDIO;
  let ok = 0;
  try {
    for (let i = 0; i < list.length; i++) {
      const good = await cacheAudio(new URL(list[i], self.registration.scope).href);
      if (good) ok++;
      await notify({ type: 'AUDIO_CACHED', file: list[i], done: ok, total: list.length });
    }
  } finally {
    precaching = false;
  }
  await notify({ type: 'PRECACHE_DONE', ok: ok, total: list.length });
}

async function notify(msg) {
  try {
    const cs = await self.clients.matchAll({ type: 'window' });
    cs.forEach((c) => c.postMessage(msg));
  } catch (e) {}
}

/* Tee: hanya untuk request tanpa Range atau "bytes=0-" (yang dikirim elemen audio saat mulai), dan bukan mode Save-Data. */
function teeAllowed(req) {
  if (!TEE_ON_MISS) return false;
  if ((req.headers.get('save-data') || '').toLowerCase() === 'on') return false;
  const r = req.headers.get('range');
  return !r || /^bytes=0-$/.test(r.trim());
}

/* File belum tersimpan: unduh utuh SEKALI (tanpa Range, 200). Satu cabang masuk cache (di latar, ditahan waitUntil),
   cabang lain langsung dikirim ke pemutar sebagai 206 (atau 200 kalau requestnya tanpa Range).
   Dicatat di `inflight` sejak awal supaya CACHE_AUDIO / precache / request kedua tidak mengunduh file yang sama lagi.
   Mengembalikan null kalau tidak bisa di-tee (pemanggil jatuh ke fetch(req) biasa). */
async function teeMiss(req, key, cache, event) {
  let settle;
  const gate = new Promise((r) => { settle = r; });
  inflight.set(key, gate);
  const release = (v) => { if (inflight.get(key) === gate) inflight.delete(key); settle(v); };
  try {
    const res = await fetch(key);
    if (res.status !== 200 || !res.body) { release(false); return res.ok ? null : res; }
    const len = +res.headers.get('content-length') || 0;
    if (!len || len > MAX_AUDIO_BYTES) {         /* ukuran tak diketahui / kebesaran: jangan disimpan */
      try { res.body.cancel(); } catch (e) {}
      release(false);
      return null;
    }
    const store = cache.put(key, res.clone())    /* koneksi putus di tengah -> put gagal, tidak ada file setengah jadi */
      .then(() => trimAudio(cache))
      .then(() => true, () => false);
    store.then(release);
    if (event) event.waitUntil(store);

    let type = res.headers.get('content-type') || '';
    if (!type || /octet-stream/i.test(type)) type = 'audio/ogg';
    const ranged = req.headers.has('range');
    const h = { 'Content-Type': type, 'Content-Length': String(len), 'Accept-Ranges': 'bytes' };
    if (ranged) h['Content-Range'] = `bytes 0-${len - 1}/${len}`;
    return new Response(res.body, { status: ranged ? 206 : 200, headers: h });
  } catch (err) { release(false); return null; }
}

async function serveAudio(req, url, event) {
  try {
    const key = audioKey(url.href);
    const cache = await caches.open(AUDIO_CACHE);
    let cached = await cache.match(key);
    if (!cached) {
      if (teeAllowed(req)) {
        if (inflight.has(key)) {                 /* file ini sedang diunduh utuh oleh jalur lain: tunggu, lalu layani dari cache (tanpa unduhan kedua) */
          await inflight.get(key);
          cached = await cache.match(key);
        } else {
          const live = await teeMiss(req, key, cache, event);
          if (live) return live;
        }
      }
      if (!cached) return fetch(req);            /* tidak bisa di-tee (Range tengah/ekor, Save-Data, gagal) -> network seperti biasa */
    }

    const blob = await cached.blob();
    const size = blob.size;
    let type = cached.headers.get('content-type') || '';
    if (!type || /octet-stream/i.test(type)) type = 'audio/ogg';

    const range = req.headers.get('range');
    const m = range && /^bytes=(\d*)-(\d*)$/.exec(range.trim());
    if (!m || (m[1] === '' && m[2] === '')) {
      return new Response(blob, {
        status: 200,
        headers: { 'Content-Type': type, 'Content-Length': String(size), 'Accept-Ranges': 'bytes' }
      });
    }

    let start, end;
    if (m[1] === '') {                           /* bytes=-N (N byte terakhir) */
      start = Math.max(0, size - Number(m[2]));
      end = size - 1;
    } else {
      start = Number(m[1]);
      end = m[2] === '' ? size - 1 : Math.min(Number(m[2]), size - 1);
    }
    if (start >= size || start > end) {
      return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
    }
    return new Response(blob.slice(start, end + 1, type), {
      status: 206,
      headers: {
        'Content-Type': type,
        'Content-Length': String(end - start + 1),
        'Content-Range': `bytes ${start}-${end}/${size}`,
        'Accept-Ranges': 'bytes'
      }
    });
  } catch (err) {
    return fetch(req);
  }
}

/* ---------------- HALAMAN & ASET ---------------- */

async function cacheFirst(req) {
  const hit = await caches.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res && res.ok) {
    const c = await caches.open(RUNTIME_CACHE);
    c.put(req, res.clone());
  }
  return res;
}

async function networkFirst(req, event) {
  const cache = await caches.open(SHELL_CACHE);
  const cached = await caches.match(req, { ignoreSearch: true });
  const net = fetch(req).then((res) => {
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  });
  const fallback = async () => cached || (await caches.match('index.html')) || Response.error();
  if (!cached) {                               /* belum ada salinan: tunggu network apa adanya */
    try { return await net; } catch (err) { return fallback(); }
  }
  event.waitUntil(net.catch(() => {}));        /* kalau timeout menang, network tetap lanjut memperbarui cache */
  const slow = new Promise((r) => setTimeout(() => r(null), NAV_TIMEOUT));
  try { return (await Promise.race([net, slow])) || cached; } catch (err) { return cached; }
}

async function staleWhileRevalidate(req, event) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = (await cache.match(req)) || (await caches.match(req));
  const network = fetch(req)
    .then((res) => {
      if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
      return res;
    })
    .catch(() => cached);
  if (cached) {
    event.waitUntil(network);
    return cached;
  }
  return network;
}
