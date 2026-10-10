/* Dumul's Observatory — service worker v2 (audio on-demand cache)
   - Halaman (navigate)      -> network-first, fallback cache kalau offline
   - CSS/JS/gambar/font      -> stale-while-revalidate
   - Audio (.opus dll)       -> kalau sudah tersimpan: dilayani dari cache lengkap dengan Range/206 (seek aman)
                                kalau belum: diteruskan apa adanya ke network
   - Lagu disimpan kalau: (a) halaman melapor "sudah didengar >50%" (CACHE_AUDIO), atau
                          (b) halaman minta unduh semua lagu (PRECACHE_AUDIO, dipicu pilihan pengunjung)
   Naikkan VERSION tiap deploy besar; naikkan AUDIO_VERSION kalau file .opus diganti isinya. */
const VERSION = 'v89'; /* naikkan tiap deploy (node check-sky.js memeriksa ?v= vs SHELL) */
const AUDIO_VERSION = 'v2';   /* v2: lagu pindah ke folder audio/ */
const SHELL_CACHE = `dumul-shell-${VERSION}`;
const RUNTIME_CACHE = `dumul-runtime-${VERSION}`;
const AUDIO_CACHE = `dumul-audio-${AUDIO_VERSION}`;

const MAX_AUDIO_FILES = 24;                /* cukup buat semua lagu (15 file, sekitar 30-60 MB) */
const MAX_AUDIO_BYTES = 15 * 1024 * 1024;  /* file lebih besar dari ini tidak disimpan */

/* Daftar lagu dari sky-data.js (SKY.audioFiles): BGM + semua SFX + lagu dumul.html. Nggak perlu edit di sini kalau tambah bintang. */
importScripts('sky-data.js?v=22');
const ALL_AUDIO = SKY.audioFiles();

/* Harus sama persis dengan yang dipanggil HTML (termasuk ?v=) */
const SHELL = [
  './',
  'index.html',
  'dumul.html',
  'index.css?v=37',
  /* harus sama persis dengan <script src> di index.html */
  'sky-data.js?v=22',
  'texts.js?v=1',
  'index.js?v=95',
  'dumul.css?v=1',
  'dumul.js?v=2',
  'dumul-app.js?v=1',
  'og.webp',
  'collapsars-cover.webp',
  'manifest.json',
  'icons/icon-192.png',
  'icons/icon-512.png'
];

const MEDIA_RE = /\.(opus|mp3|ogg|oga|m4a|aac|wav|flac|webm|mp4)$/i;
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL_CACHE);
    await Promise.allSettled(
      SHELL.map((u) => cache.add(new Request(u, { cache: 'reload' })))
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
  } else if (d.type === 'PRECACHE_AUDIO') {
    event.waitUntil(precacheAll());
  } else if (d.type === 'AUDIO_STATUS') {
    event.waitUntil(replyStatus(event.source));
  }
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  /* Audio */
  if (MEDIA_RE.test(url.pathname) || req.destination === 'audio' || req.destination === 'video') {
    if (url.origin === self.location.origin) event.respondWith(serveAudio(req, url));
    return;
  }

  /* Request Range lain: jangan disentuh */
  if (req.headers.has('range')) return;

  if (req.mode === 'navigate') {
    event.respondWith(networkFirst(req));
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

    const keys = await cache.keys();             /* urutan = paling lama disimpan dulu */
    for (let i = 0; i < keys.length - MAX_AUDIO_FILES; i++) await cache.delete(keys[i]);
    return true;
  } catch (err) { return false; }                /* diam: ini cuma optimasi */
}

async function countCached() {
  const cache = await caches.open(AUDIO_CACHE);
  let n = 0;
  for (const f of ALL_AUDIO) {
    if (await cache.match(audioKey(new URL(f, self.registration.scope).href))) n++;
  }
  return n;
}

async function replyStatus(client) {
  try {
    if (client) client.postMessage({ type: 'AUDIO_STATUS', cached: await countCached(), total: ALL_AUDIO.length });
  } catch (e) {}
}

/* Unduh semua lagu satu per satu (tidak paralel, biar tidak menyaingi streaming yang sedang jalan) */
async function precacheAll() {
  if (precaching) return;
  precaching = true;
  let ok = 0;
  try {
    for (let i = 0; i < ALL_AUDIO.length; i++) {
      const good = await cacheAudio(new URL(ALL_AUDIO[i], self.registration.scope).href);
      if (good) ok++;
      await notify({ type: 'AUDIO_CACHED', file: ALL_AUDIO[i], done: ok, total: ALL_AUDIO.length });
    }
  } finally {
    precaching = false;
  }
  await notify({ type: 'PRECACHE_DONE', ok: ok, total: ALL_AUDIO.length });
}

async function notify(msg) {
  try {
    const cs = await self.clients.matchAll({ type: 'window' });
    cs.forEach((c) => c.postMessage(msg));
  } catch (e) {}
}

async function serveAudio(req, url) {
  try {
    const cache = await caches.open(AUDIO_CACHE);
    const cached = await cache.match(audioKey(url.href));
    if (!cached) return fetch(req);              /* belum tersimpan -> network seperti biasa */

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

async function networkFirst(req) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const res = await fetch(req);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch (err) {
    return (
      (await caches.match(req, { ignoreSearch: true })) ||
      (await caches.match('index.html')) ||
      Response.error()
    );
  }
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
