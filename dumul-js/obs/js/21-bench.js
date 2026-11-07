'use strict';
/* BENCH v11.29 (?bench=1) — v11.29u: cfg.pl.hint/hintAt/rsl/plSt (petunjuk slow + log resize planet, 17-planet3d v57; ?plhint=0 = mati, ?plhint=1 = paksa nyala). v11.29t: cfg.ast.sm (anti-kilau batu kecil, 12-ast3d v39; ?astsm=0 = A/B). v11.29s: cfg.pl.bmHi/bmAt/bmAd (latch bandMin adaptif, 17-planet3d v55). v11.29r: fsState memuat js/wait/wlog (pengukur pasif waktu tunggu render, 05-sector-ui v191). v11.29q: cfg.ast = {rwSlow, dprMax, pr, pw, ph, W, H} (ukuran kanvas GL batu; ?astrw=0 = A/B). v11.29i: label fase ABAB unik per token (A1_sglow, B1_sglow; run ulang token sama diberi #2), banyak token dalam satu run (?ab=sgs,sgm,sgl atau tombol), riwayat semua run di pmk.offSeqRuns (urutan token), jendela rekam otomatis diperpanjang sampai seq selesai, token jumlah sghalf/sgquart/schalf/scquart (tinggal 50%/25% bintang yang digambar halo/inti), tiap mode mencatat haloN/coreN/haloPx2 yang benar-benar digambar per frame (+ stCnt per ember). v11.29h: seq `sizes` (halo/inti per ukuran s.r: sgs sgm sgl scs scm scl, batas ?stb=2.4,3.0, hitungan stCnt), seq `plei` (pname pglow pcore pint), runner ABAB tanpa reload `?offseq=abab&ab=sglow` (+ &abn=3 pasang, default 10 dtk/fase), dump mode kini punya dtAvg/dtP50/dtP95/fps (periode antar frame, berlaku tanpa gpup=1); jendela rekam default 300 dtk kalau ?debug=1. v11.29g: seq `stars` (pecah rasi+bintang sektor: token cname lstroke sglow score smark slbl splei sdraw, penanda pmk s.cons/s.pulse/s.stars/s.plei; ?offseq=stars, ?stseg=1). v11.29f: dump mencatat saklar pt2d (R.pt2d = window.__pt2d dari 15-portal3d, R.pt3d = {state, err} PT3D saat snapshot). v11.29d: token `all` (tidak menggambar apa pun, pBegin/q.* tetap jalan = LANTAI backlog) dan `plfx` (efek 2D planet, guard di 17-planet3d); set seq ketiga 'floor' (base, all, hole, pulse, plfx, combo, combo+, base2; tombol 'seq floor', ?offseq=floor). Saat fase 'all' layar kosong. v11.29c: token blit (?off=plb,astb,ptb,scb,drb | blit = semua; lewati hanya g.drawImage GL->#sky, GL tetap dirender; guard di 12/13/14/15/17), runner 2 set (tombol 'seq blit' / 'seq layer', ?offseq=blit|layer), timer fase+sisa + STOP, panel bench terlipat default (tombol BENCH ▸), panel lain dilipat otomatis selama seq, ?pbms default 200000 bila gpup=1. v11.29b: runner tanpa reload (?offseq=1 atau tombol 'seq' di panel A/B, ?offms=N): label mode jadi 'ov+S|sky' dst, urutan base,sky,skyhide,hud,mw,neb,lines+stars,base2; pmk.offSeq. v11.29: ?off=a,b,c = matikan lapisan otomatis lewat URL (token: sky mw neb lines stars pulse hole ast = PX.* di 05-sector-ui; hud = semua DOM HUD visibility:hidden; skyhide = elemen #sky disembunyikan lewat CSS tapi kanvasnya tetap digambar). Pembeda raster vs kompositor: kalau q.big turun di 'sky' tapi tidak di 'skyhide' = raster 2D; turun di 'skyhide'/'hud' = kompositor. Daftar terpakai tercatat di R.off dan pmk.off (ikut ringkasan ?runs=N). Catatan: 'ast' juga melewati render GL batu (bukan murni 2D).
   v11.28: ?gpuo=1 (bersama ?gpup=1) = BALIK urutan sinkron q.* di awal frame (small dulu, baru big; default big dulu). Tes: kalau q.small jadi besar dan q.big kecil, angkanya milik sinkron PERTAMA (menyerap antrean GPU dari kerja non-GL: raster 2D / kompositor), bukan milik konteks 'big'. Urutan terpakai tercatat di pmk.qOrder.
   v11.27: probe GPU pakai readPixels 1x1 (glSync) bukan finish() (Chrome: finish = flush saja, marker .gpu v11.26 selalu ±0).
   v11.26: ?gpup=1 = probe GPU: finish() setelah render tiap unit GL (marker as/sc/dr/pt/pl .sub = CPU kirim, .gpu = tunggu GPU) + q.big/q.small = backlog di awal frame; R.gpup. Segmen modes.seg jadi 28 teratas saat probe.
   (header lama:) BENCH v11.19 (?bench=1) — read-only: tidak mengubah perilaku boot. Hanya aktif kalau URL punya ?bench=1. Hapus blok ini setelah selesai ukur.
   v10: flag/build hash + isRepeatVisit; net rtt/downlink + resource detail (three + audio TTFB/size);
   gate timestamps (pageReadyAt/modsAt/warmOkAt/bgmOkAt/sfxOkAt); glLabel; media networkState@load;
   loaf aggregate by fn; microbench + battery + memory + contextlost; pV series + rAF deltas; auto-repeat ?runs=N.
   v11: post-enter rAF (p50/p95/p99 + dropped%); renderer.info per label; memory timeline (start/capsule/3d/30s);
   LCP/CLS/FCP; device info (cores/mem/dpr/viewport/GL_RENDERER); visibility flag; multi-run median/min/max;
   microbench ulang di akhir (thermal/throttle delta).
   merge: v11.14 + data-v pV sampling + bm flag (?bm=0).
   v11.15: penghitung document.fonts 'loadingdone' (jumlah + waktu) dan layout() (jumlah, total ms, max, pre-capsule, yang dipicu loadingdone) -> R.loadingdone / R.layout.
   v11.16: atribusi fromLoadingdone dibetulkan (v11.15 salah-tandai boot() yang kebetulan jalan di tick yang sama): flag dibersihkan tepat setelah listener 07-boot selesai, bukan via setTimeout(0).
   v11.17: resource audio/three + proto (nextHopProtocol), q (antre+connect sebelum request terkirim), w (tunggu server murni), conn (ms connect, 0 = koneksi dipakai ulang), sw (lewat service worker); R.protoAll (hitung per protokol, semua resource) dan R.audPeak (puncak request audio yang tumpang tindih di network). Untuk membedakan batas 6 koneksi HTTP/1.1 vs server/VPN lambat.
   v11.18: R.three = THREE.REVISION (r159/r186 kelihatan di dump); regex resource three juga cocok dgn three.custom.rNNN.js (sebelumnya threeRes selalu null utk bundle custom).
   v11.19: pencatat warm/bake PASCA-BOOT dgn dump terpisah (POST COPY/JSON/TXT, window.__benchPost()): fungsi bake/warm global, rIC (asal file:baris), longtask/LoAF, rAF per detik, memori, warmLog audio, THREE_WARM. ?pbms=N = panjang jendela setelah entered (default 60000). */
(function () {
  if (!/[?&]bench=1(&|$)/.test(location.search)) return;
  try { window.__gpuP = /[?&]gpup=1(&|$)/.test(location.search) ? 1 : 0; } catch (eGpu) {}
  try { window.__gpuO = /[?&]gpuo=1(&|$)/.test(location.search) ? 1 : 0; } catch (eGpo) {}   /* v11.28: ?gpuo=1 = urutan sinkron q.* dibalik */   /* v11.26: ?gpup=1 = probe GPU (finish() per unit GL + backlog di awal frame) */
  /* v11.29: ?off=a,b,c = matikan lapisan untuk tes q.big (otomatis dari URL, tercatat di dump) */
  var OFF_PX = ['sky', 'mw', 'neb', 'lines', 'stars', 'pulse', 'hole', 'ast', 'all', 'cname', 'lstroke', 'sglow', 'score', 'smark', 'slbl', 'splei', 'sgs', 'sgm', 'sgl', 'scs', 'scm', 'scl', 'sghalf', 'sgquart', 'schalf', 'scquart', 'pglow', 'pcore', 'pint', 'pname'], OFF_B = { plb: 'pl', astb: 'ast', ptb: 'pt', scb: 'sc', drb: 'dr', plfx: 'plfx' }, OFF_ALL = OFF_PX.concat(['sdraw', 'hud', 'skyhide', 'blit', 'plb', 'astb', 'ptb', 'scb', 'drb', 'plfx']), OFF_L = [];
  try {
    var offM = /[?&]off=([a-z,]+)/.exec(location.search);
    if (offM) offM[1].split(',').forEach(function (t) { if (OFF_ALL.indexOf(t) >= 0 && OFF_L.indexOf(t) < 0) OFF_L.push(t); });
    window.__stSeg = /[?&]stseg=1(&|$)/.test(location.search) ? 1 : 0;   /* v11.29g: ?stseg=1 = penanda pmk s.cons/s.pulse/s.stars/s.plei di loop sektor (05-sector-ui) */
    window.__offL = OFF_L.length ? OFF_L.slice() : null;
  } catch (eOff) {}
  /* v11.29b: CSS lewat kelas di <html> supaya bisa di-toggle saat jalan (tanpa reload) */
  try {
    var offSt = document.createElement('style'); offSt.id = '__bench_off_css';
    offSt.textContent = 'html.__bo-hud body>*:not(#sky):not(#wh-canvas):not(#whperf):not(#boot-screen):not(#bh):not(#cap-bh):not(#muff-dbg):not(#__bench_box):not(#__bench_phase):not(#__bench_copy_fallback):not([id^="wh-ad"]):not(script):not(style){visibility:hidden!important}html.__bo-skyhide #sky{visibility:hidden!important}';
    (document.head || document.documentElement).appendChild(offSt);
  } catch (eOffC) {}
  var OFF_CUR = OFF_L.slice(), OFF_MANAGE = OFF_L.length > 0;   /* OFF_MANAGE: baru mengatur PX/kelas kalau ?off= ada atau runner jalan */
  function offApply() {   /* idempoten; PX = var global di 05-sector-ui.js */
    if (!OFF_MANAGE) return;
    try {
      document.documentElement.classList.toggle('__bo-hud', OFF_CUR.indexOf('hud') >= 0);
      document.documentElement.classList.toggle('__bo-skyhide', OFF_CUR.indexOf('skyhide') >= 0);
      if (typeof PX === 'object' && PX) { var sd = OFF_CUR.indexOf('sdraw') >= 0; OFF_PX.forEach(function (k) { PX[k] = (OFF_CUR.indexOf(k) >= 0 || (sd && (k === 'sglow' || k === 'score' || k === 'smark' || k === 'slbl'))) ? 1 : 0; }); }   /* sdraw = semua gambar bintang mati (halo+inti+tanda+label), loop hitung tetap jalan */
      var all = OFF_CUR.indexOf('blit') >= 0, ob = {}; Object.keys(OFF_B).forEach(function (k) { ob[OFF_B[k]] = ((all && k !== 'plfx') || OFF_CUR.indexOf(k) >= 0) ? 1 : 0; });   /* 'blit' = 5 blit GL->#sky, TIDAK termasuk plfx */
      window.__offB = ob;   /* dibaca guard `g.drawImage` di 12/13/14/15/17: lewati blit GL->#sky saja, render GL tetap jalan */
    } catch (eA) {}
  }
  /* Eksperimen ?ric=hold (hanya bersama ?bench=1): tahan SEMUA requestIdleCallback yang dijadwalkan sebelum masuk (obs-entered); dilepas 1.5 dtk setelah masuk.
     Inline script ini jalan sebelum script defer, jadi wrapper terpasang sebelum modul memanggil rIC. Untuk menguji apakah rIC warm steps penyebab capsule 'beku'. */
  var RIC_HOLD = /[?&]ric=hold(&|$)/.test(location.search);
  if (RIC_HOLD && window.requestIdleCallback) {
    var _ric = window.requestIdleCallback.bind(window), _q = [], _entered = false;
    window.requestIdleCallback = function (fn, o) { if (_entered) return _ric(fn, o); _q.push([fn, o]); return -_q.length; };
    window.addEventListener('obs-entered', function () { _entered = true; setTimeout(function () { _q.splice(0).forEach(function (a) { _ric(a[0], a[1]); }); }, 1500); }, { once: true });
  }

  var LOAF = [], EVT = [], GLN = [], GLC = [];
  var GATE = { pageReadyAt: null, modsAt: null, warmOkAt: null, bgmOkAt: null, sfxOkAt: null };
  var PV_SERIES = [];   /* [t, pV] sampling untuk plateau */
  var RAF_DELTAS = [];  /* rAF delta selama boot (pre-capsule) */
  var MEDIA_AT_LOAD = null; /* { total, networkState2, names } saat window.load */
  var CTX_LOST = [];    /* webglcontextlost events */
  var MICRO = null;     /* { iters, ms } micro-benchmark */
  var BAT = null;       /* { charging, level, chargingTime, dischargingTime } */
  var MEM = null;       /* performance.memory snapshot */
  var HASH = { boot: null, css: null }; /* short content hash */
  var ALL_V = {};       /* filename -> ?v= value for all scripts/styles */
  var IS_REPEAT = null;
  var GL_BY_LABEL = {};   /* label -> { renderer, createdAt } */
  var MEM_TIMELINE = [];  /* [{t, tag, jsHeapUsed, ...}] */
  var RAF_POST = [];      /* rAF deltas after obs-entered (~10s) */
  var RAF_POST_STATS = null;
  var HIDDEN_DURING = false;
  var HIDDEN_MS = 0;
  var _hiddenSince = null;
  var VITALS = { fcp: null, lcp: null, cls: 0, lcpEntries: 0 };
  var DEVICE = null;
  var MICRO_END = null;
  var GL_RENDERER = null;

  /* v11.15: penghitung 'loadingdone' (document.fonts) + layout() (jumlah & ms).
     Listener dipasang SEKARANG (bench jalan sinkron sebelum script defer) -> terhitung semua event, dan listener bench jalan lebih dulu dari 01-core/07-boot.
     layout() adalah function declaration global di 02-sky-logic.js; dibungkus lewat event 'load' tag <script> 02 (jalan tepat setelah 02 dieksekusi, sebelum 07-boot).
     Semua pemanggil memakai nama global layout (boot(), loadingdone, setTimeout(layout,120) di resize) jadi ikut terbungkus. Perilaku tidak berubah (return value + this diteruskan, error dilempar ulang). */
  var LD = { n: 0, at: [] };                      /* at: waktu tiap loadingdone (maks 30 pertama) */
  var LAY = { n: 0, ms: 0, max: 0, fromLD: 0, fromLDms: 0, calls: [], wrapped: false, at: null };  /* calls: [start, ms, dariLD] maks 60 pertama */
  var _inLD = false, _clrReady = false;
  try {
    if (document.fonts && document.fonts.addEventListener) {
      document.fonts.addEventListener('loadingdone', function () {
        LD.n++; if (LD.at.length < 30) LD.at.push(Math.round(performance.now()));
        _inLD = true;
        if (!_clrReady) setTimeout(function () { _inLD = false; }, 0);   /* cadangan: listener pembersih belum terpasang (loadingdone datang sebelum 07-boot dieksekusi) */
      });
    }
  } catch (eLD) {}
  function wrapLayout() {
    try {
      if (LAY.wrapped || typeof window.layout !== 'function') return false;
      var orig = window.layout;
      window.layout = function () {
        var t0 = performance.now(), ld = _inLD;
        try { return orig.apply(this, arguments); }
        finally {
          var ms = performance.now() - t0;
          LAY.n++; LAY.ms += ms; if (ms > LAY.max) LAY.max = ms;
          if (ld) { LAY.fromLD++; LAY.fromLDms += ms; }
          if (LAY.calls.length < 60) LAY.calls.push([Math.round(t0), Math.round(ms * 10) / 10, ld ? 1 : 0]);
        }
      };
      LAY.wrapped = true; LAY.at = Math.round(performance.now());
      return true;
    } catch (eW) { return false; }
  }
  try {
    var _s02 = document.querySelector('script[src*="02-sky-logic"]');
    if (_s02) _s02.addEventListener('load', wrapLayout, { once: true });
    document.addEventListener('DOMContentLoaded', wrapLayout, { once: true });   /* cadangan (tag 02 tidak ketemu); dibungkus sekali saja */
    /* Pembersih flag _inLD: dipasang lewat event 'load' tag 07-boot (jalan tepat setelah 07 dieksekusi) -> urutan listener: bench, 01-core, 07-boot, PEMBERSIH.
       Jadi layout() yang dipanggil handler 07-boot ikut ditandai, tapi boot() yang jalan di tick yang sama sesudahnya tidak. */
    var _armClr = function () {
      if (_clrReady) return; _clrReady = true;
      try { if (document.fonts && document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', function () { _inLD = false; }); } catch (eC) {}
    };
    var _s07 = document.querySelector('script[src*="07-boot"]');
    if (_s07) _s07.addEventListener('load', _armClr, { once: true });
    document.addEventListener('DOMContentLoaded', _armClr, { once: true });   /* cadangan: DCL jalan setelah semua script defer */
  } catch (eL2) {}

  function runMicro() {
    try {
      var t0m = performance.now(), iters = 0;
      while (performance.now() - t0m < 50) { iters++; var x = Math.sqrt(iters) * Math.sin(iters); }
      return { iters: iters, ms: Math.round(performance.now() - t0m) };
    } catch (e) { return null; }
  }

  /* --- micro-benchmark kalibrasi (loop ~50 ms) --- */
  MICRO = runMicro();

  /* --- battery (async) --- */
  try {
    if (navigator.getBattery) {
      navigator.getBattery().then(function (b) {
        BAT = { charging: b.charging, level: Math.round(b.level * 1000) / 1000, chargingTime: b.chargingTime, dischargingTime: b.dischargingTime };
      }).catch(function () {});
    }
  } catch (e) {}

  /* --- memory snapshot (awal + di snapshot) --- */
  function snapMem() {
    try {
      var m = performance.memory;
      if (m) return { jsHeapUsed: m.usedJSHeapSize, jsHeapTotal: m.totalJSHeapSize, jsHeapLimit: m.jsHeapSizeLimit };
    } catch (e) {}
    return null;
  }
  MEM = snapMem();
  try { MEM_TIMELINE.push(Object.assign({ t: Math.round(performance.now()), tag: 'start' }, MEM || {})); } catch (e) {}

  /* --- device info --- */
  try {
    DEVICE = {
      hardwareConcurrency: navigator.hardwareConcurrency || null,
      deviceMemory: navigator.deviceMemory || null,
      devicePixelRatio: window.devicePixelRatio || null,
      viewport: { w: window.innerWidth, h: window.innerHeight },
      screen: (typeof screen !== 'undefined') ? { w: screen.width, h: screen.height, availW: screen.availWidth, availH: screen.availHeight } : null,
      maxTouchPoints: navigator.maxTouchPoints || 0,
      platform: navigator.platform || null,
      language: navigator.language || null
    };
  } catch (e) { DEVICE = null; }

  /* --- visibility --- */
  try {
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        HIDDEN_DURING = true;
        _hiddenSince = performance.now();
      } else if (_hiddenSince != null) {
        HIDDEN_MS += performance.now() - _hiddenSince;
        _hiddenSince = null;
      }
    });
  } catch (e) {}

  /* --- web vitals: FCP, LCP, CLS --- */
  try {
    new PerformanceObserver(function (list) {
      list.getEntries().forEach(function (e) {
        if (e.name === 'first-contentful-paint' && VITALS.fcp == null) VITALS.fcp = Math.round(e.startTime);
      });
    }).observe({ type: 'paint', buffered: true });
  } catch (e) {}
  try {
    new PerformanceObserver(function (list) {
      list.getEntries().forEach(function (e) {
        VITALS.lcp = Math.round(e.startTime);
        VITALS.lcpEntries++;
      });
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  } catch (e) {}
  try {
    new PerformanceObserver(function (list) {
      list.getEntries().forEach(function (e) {
        if (!e.hadRecentInput) VITALS.cls += e.value;
      });
    }).observe({ type: 'layout-shift', buffered: true });
  } catch (e) {}

  /* --- isRepeatVisit --- */
  try {
    IS_REPEAT = !!sessionStorage.getItem('obs_booted');
  } catch (e) { IS_REPEAT = null; }

  /* --- content hash singkat (fetch + digest) untuk 07-boot.js & index.css --- */
  function shortHash(buf) {
    return crypto.subtle.digest('SHA-256', buf).then(function (d) {
      var a = new Uint8Array(d);
      var h = '';
      for (var i = 0; i < 6; i++) h += ('0' + a[i].toString(16)).slice(-2);
      return h;
    });
  }
  function hashUrl(url, key) {
    try {
      fetch(url, { cache: 'force-cache' }).then(function (r) { return r.arrayBuffer(); }).then(function (buf) {
        return shortHash(buf);
      }).then(function (h) { HASH[key] = h; }).catch(function () { HASH[key] = 'err'; });
    } catch (e) { HASH[key] = 'err'; }
  }
  try {
    var bootSrc = null, cssHref = null;
    Array.prototype.forEach.call(document.scripts, function (sc) {
      if (/07-boot\.js/.test(sc.src || '')) bootSrc = sc.src;
    });
    Array.prototype.forEach.call(document.querySelectorAll('link[rel="stylesheet"]'), function (lk) {
      if (/index\.css/.test(lk.href || '')) cssHref = lk.href;
    });
    if (bootSrc) hashUrl(bootSrc, 'boot');
    if (cssHref) hashUrl(cssHref, 'css');
  } catch (e) {}

  /* --- collect ?v= all scripts + styles --- */
  try {
    Array.prototype.forEach.call(document.scripts, function (sc) {
      var m = /\/([^\/?]+)\?v=(\d+)/.exec(sc.src || '');
      if (m) ALL_V[m[1]] = +m[2];
    });
    Array.prototype.forEach.call(document.querySelectorAll('link[rel="stylesheet"]'), function (lk) {
      var m = /\/([^\/?]+)\?v=(\d+)/.exec(lk.href || '');
      if (m) ALL_V[m[1]] = +m[2];
    });
  } catch (e) {}

  /* v8: ukur pembuatan WebGLRenderer (konteks + MSAA) dan compile/render pertama per renderer; dipasang begitu THREE termuat. Hanya di ?bench=1.
     v10: catat window.__glLabel saat konstruktor (set label di modul sebelum new WebGLRenderer, mis. window.__glLabel='SCP3D'). */
  (function () {
    function wrapThree() {
      if (!(window.THREE && THREE.WebGLRenderer) || THREE.__benchWrapped) return false;
      THREE.__benchWrapped = true;
      var Orig = THREE.WebGLRenderer;
      var W2 = function (o) {
        var label = (typeof window.__glLabel === 'string' && window.__glLabel) ? window.__glLabel : null;
        var t0 = performance.now(), r = new Orig(o), d = performance.now() - t0;
        if (GLN.length < 12) GLN.push([Math.round(t0), Math.round(d), o && o.antialias ? 1 : 0, label]);
        var n = GLN.length - 1;
        try {
          if (label) GL_BY_LABEL[label] = { renderer: r, createdAt: Math.round(t0), idx: n };
          else GL_BY_LABEL['_' + n] = { renderer: r, createdAt: Math.round(t0), idx: n };
        } catch (e) {}
        /* once: GL_RENDERER via debug extension */
        try {
          if (!GL_RENDERER && r.getContext) {
            var gl = r.getContext();
            if (gl) {
              var ext = gl.getExtension('WEBGL_debug_renderer_info');
              if (ext) GL_RENDERER = {
                vendor: gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) || null,
                renderer: gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || null
              };
              else GL_RENDERER = { vendor: gl.getParameter(gl.VENDOR), renderer: gl.getParameter(gl.RENDERER) };
            }
          }
        } catch (e) {}
        /* listen contextlost on canvas if present */
        try {
          if (r.domElement) {
            r.domElement.addEventListener('webglcontextlost', function (ev) {
              CTX_LOST.push({ t: Math.round(performance.now()), label: label, prevented: ev.defaultPrevented });
            }, false);
          }
        } catch (e) {}
        ['compile', 'render'].forEach(function (k) {
          var f = r[k], c = 0;
          r[k] = function () {
            var a = performance.now(), v = f.apply(this, arguments), e = performance.now() - a;
            if (c++ < 2 && e > 30 && GLC.length < 24) GLC.push([n, k, Math.round(a), Math.round(e), label]);
            return v;
          };
        });
        return r;
      };
      W2.prototype = Orig.prototype;
      try { Object.keys(Orig).forEach(function (k) { W2[k] = Orig[k]; }); } catch (e) {}
      THREE.WebGLRenderer = W2;
      return true;
    }
    /* r186: threeLoad() (12-ast3d.js) memanggil window.__threeReady begitu THREE terpasang, SEBELUM build modul pertama -> semua renderer terukur.
       Polling lama dipertahankan sebagai cadangan (mis. THREE sudah ada lebih dulu). */
    window.__threeReady = function () { try { wrapThree(); } catch (e) {} };
    var tries = 0, iv = setInterval(function () {
      try { if (wrapThree() || ++tries > 2000) clearInterval(iv); } catch (e) { clearInterval(iv); }
    }, 20);
  })();

  function fileOf(u) { try { return String(u || '').split('?')[0].split('/').pop(); } catch (e) { return ''; } }

  try {
    new PerformanceObserver(function (l) {
      l.getEntries().forEach(function (e) {
        if (e.duration < 120) return;
        var sc = (e.scripts || []).slice().sort(function (a, b) { return b.duration - a.duration; }).slice(0, 3).map(function (x) {
          return [fileOf(x.sourceURL), x.sourceFunctionName || '', String(x.invokerType || '').replace('event-listener', 'evt').replace('classic-script', 'cs').replace('user-callback', 'cb').replace('resolve-promise', 'prom'), Math.round(x.duration)];
        });
        LOAF.push([Math.round(e.startTime), Math.round(e.duration), Math.round(e.blockingDuration || 0), sc]);
      });
    }).observe({ type: 'long-animation-frame', buffered: true });
  } catch (e) {}

  try {
    new PerformanceObserver(function (l) {
      l.getEntries().forEach(function (e) {
        if (e.duration < 100 || EVT.length >= 20) return;
        /* [event, startTime, input delay, processing, total] */
        EVT.push([e.name, Math.round(e.startTime), Math.round(e.processingStart - e.startTime), Math.round(e.processingEnd - e.processingStart), Math.round(e.duration)]);
      });
    }).observe({ type: 'event', durationThreshold: 80, buffered: true });
  } catch (e) {}

  var R = { t: {}, meta: {}, ls: {}, cp: {}, playLog: [], tapLog: [], taps: 0, playing: 0 }, playReq = {}, playRs = {}, LT = [], LP = { pre: { n: 0, ms: 0 }, cap2blue: { n: 0, ms: 0 }, blue2f1: { n: 0, ms: 0 }, after: { n: 0, ms: 0 } }, lt = 0, ltN = 0, ltAll = 0, ltAllN = 0, capDone = false, blueAt = 0, tapAt = 0, box, hooked = false;

  function now() { return Math.round(performance.now()); }
  function mark(k) { if (R.t[k] == null) { R.t[k] = now(); paint(); } }

  try {
    new PerformanceObserver(function (l) {
      l.getEntries().forEach(function (e) {
        /* v6: fase ditentukan dari e.startTime (bukan waktu callback; callback longtask datang terlambat saat main thread sibuk -> v5 salah atribusi) */
        var st = e.startTime, T = R.t;
        var ph = (T.capsule == null || st < T.capsule) ? 'pre' : ((T.blue == null || st < T.blue) ? 'cap2blue' : ((T.frame1 == null || st < T.frame1) ? 'blue2f1' : 'after'));
        ltAll += e.duration; ltAllN++;
        if (ph === 'pre') { lt += e.duration; ltN++; }
        var q = LP[ph]; q.n++; q.ms += Math.round(e.duration);
        LT.push([Math.round(st), Math.round(e.duration)]);
      });
    }).observe({ entryTypes: ['longtask'] });
  } catch (e) {}

  window.addEventListener('obs-entered', function () {
    mark('entered');
    /* memory after enter (all 3D typically ready) */
    try { MEM_TIMELINE.push(Object.assign({ t: Math.round(performance.now()), tag: 'entered' }, snapMem() || {})); } catch (e) {}
    /* post-enter rAF sampling ~10s for frame stability */
    (function () {
      var start = performance.now();
      var last = null; /* skip first sample — rAF ts vs performance.now() bisa beda sedikit */
      var budget = 10000;
      var skipped = 0;
      function tick(now) {
        if (last == null) { last = now; skipped = 1; requestAnimationFrame(tick); return; }
        var d = now - last;
        last = now;
        if (RAF_POST.length < 700) RAF_POST.push(Math.round(d * 10) / 10);
        if (now - start < budget) requestAnimationFrame(tick);
        else {
          /* compute stats */
          try {
            var arr = RAF_POST.slice().sort(function (a, b) { return a - b; });
            if (!arr.length) { RAF_POST_STATS = { n: 0 }; return; }
            var sum = 0;
            arr.forEach(function (d) { sum += d; });
            function pct(p) {
              var i = (arr.length - 1) * p;
              var lo = Math.floor(i), hi = Math.ceil(i);
              if (lo === hi) return arr[lo];
              return Math.round((arr[lo] + (arr[hi] - arr[lo]) * (i - lo)) * 10) / 10;
            }
            var med = pct(0.5);
            /* relatif: p10 ≈ vsync saat ada frame cepat; absolut: 20ms (<50fps @60Hz), 33.5ms (≥2 vsync missed) */
            var base = pct(0.1);
            var hzEst = base > 0 ? Math.round(1000 / base) : 60;
            var dropThr = base > 0 ? base * 1.5 : 20;
            var dropped = 0, d20 = 0, d33 = 0;
            arr.forEach(function (d) {
              if (d > dropThr) dropped++;
              if (d > 20) d20++;
              if (d > 33.5) d33++;
            });
            RAF_POST_STATS = {
              n: arr.length,
              mean: Math.round((sum / arr.length) * 10) / 10,
              p10: base,
              p50: med,
              p95: pct(0.95),
              p99: pct(0.99),
              max: arr[arr.length - 1],
              droppedPct: Math.round((dropped / arr.length) * 1000) / 10,
              dropped20Pct: Math.round((d20 / arr.length) * 1000) / 10,
              dropped33Pct: Math.round((d33 / arr.length) * 1000) / 10,
              dropThrMs: Math.round(dropThr * 10) / 10,
              hzEst: hzEst,
              windowMs: Math.round(now - start),
              skippedFirst: skipped
            };
          } catch (e) {}
          /* thermal: re-run micro at end of post sampling */
          MICRO_END = runMicro();
          try { MEM_TIMELINE.push(Object.assign({ t: Math.round(performance.now()), tag: 'post10s' }, snapMem() || {})); } catch (e) {}
        }
      }
      requestAnimationFrame(tick);
    })();
    /* also schedule +30s memory */
    setTimeout(function () {
      try { MEM_TIMELINE.push(Object.assign({ t: Math.round(performance.now()), tag: 't30s' }, snapMem() || {})); } catch (e) {}
    }, 30000);
  });
  try { if (navigator.serviceWorker) navigator.serviceWorker.addEventListener('controllerchange', function () { mark('swctl'); }); } catch (e) {}   /* v129: kapan SW mengambil alih halaman */

  function sfxStates() {
    var m = 0, p = 0, tot = 0;
    try { Object.keys(SFX).forEach(function (k) { tot++; var s = SFX[k].readyState; if (s >= 1) m++; if (s >= 2) p++; }); } catch (e) {}
    return { total: tot, metadata: m, playable: p };
  }

  function hookAud(k, a) {
    if (!a || !a.addEventListener) return;
    if (a.readyState >= 1) R.meta[k] = 'pre'; /* sudah siap sebelum hook dipasang */
    a.addEventListener('loadedmetadata', function () { if (R.meta[k] == null) R.meta[k] = now(); });
    a.addEventListener('canplay', function () { if (R.cp[k] == null) R.cp[k] = now(); });
    a.addEventListener('play', function () { playReq[k] = now(); playRs[k] = a.readyState; });
    a.addEventListener('playing', function () {
      var t = now();
      if (k.indexOf('bgm:') !== 0) R.playing++;
      if (playReq[k] != null) {
        /* [key, t_play(), t_playing, latensi, readyState saat play(), detik sejak Blue] */
        if (R.playLog.length < 40) R.playLog.push([k, playReq[k], t, t - playReq[k], playRs[k], blueAt ? t - blueAt : null]);
        delete playReq[k];
      }
      if (k.indexOf('bgm:') !== 0 && blueAt && tapAt && R.tapToPlay == null) { R.tapToPlay = t - tapAt; R.tapKey = k; paint(); }
    });
  }

  function hookSfx() {
    if (hooked) return; hooked = true;
    try { Object.keys(SFX).forEach(function (k) { hookAud(k, SFX[k]); }); } catch (e) {}
    /* BGM (panel musik / swallow): preload='none', dihangatkan warmRest -> catat juga */
    try { if (typeof AMB !== 'undefined') hookAud('bgm:AMB', AMB); } catch (e) {}
    try { if (typeof MUSIC_COLLAP !== 'undefined') hookAud('bgm:MUSIC_COLLAP', MUSIC_COLLAP); } catch (e) {}
    try { if (typeof GARG !== 'undefined') hookAud('bgm:GARG', GARG); } catch (e) {}
  }

  /* --- sample pV (progress bar) + rAF deltas pre-capsule --- */
  (function () {
    var lastRaf = performance.now();
    function sample() {
      var t = performance.now();
      if (!capDone) {
        var d = t - lastRaf;
        if (RAF_DELTAS.length < 400) RAF_DELTAS.push(Math.round(d));
        lastRaf = t;
        /* coba baca pV dari DOM atau global */
        try {
          var v = null;
          /* pV di 07-boot local scope — baca DOM: #boot-pct / #boot-fill */
          var pctEl = document.getElementById('boot-pct');
          if (pctEl) {
            var m = /(\d+)/.exec(pctEl.textContent || '');
            if (m) v = +m[1];
          }
          if (v == null) {
            var fill = document.getElementById('boot-fill');
            if (fill && fill.getAttribute('data-v') != null) {
              var dv = parseFloat(fill.getAttribute('data-v'));
              if (!isNaN(dv)) v = Math.round(dv);
            } else if (fill && fill.style && fill.style.width) {
              var w = parseFloat(fill.style.width);
              if (!isNaN(w)) v = Math.round(w);
            }
          }
          if (v != null && (PV_SERIES.length === 0 || PV_SERIES[PV_SERIES.length - 1][1] !== v)) {
            if (PV_SERIES.length < 300) PV_SERIES.push([Math.round(t), v]);
          }
        } catch (e) {}
      }
      if (!capDone || (R.t.capsule != null && t - R.t.capsule < 3000)) requestAnimationFrame(sample);
    }
    requestAnimationFrame(sample);
  })();

  /* --- gate timestamp polling (baca dari __bootInfo / __boot3d yang di-update boot) --- */
  (function () {
    var lastBi = null;
    var iv = setInterval(function () {
      if (capDone && GATE.sfxOkAt != null && GATE.bgmOkAt != null) { clearInterval(iv); return; }
      try {
        var bi = window.__bootInfo;
        var b3 = window.__boot3d;
        if (bi) {
          if (GATE.pageReadyAt == null && bi.pageReady) GATE.pageReadyAt = now();
          /* infer dari field yang sudah ada */
          if (bi.visAt != null && bi.visAt >= 0 && GATE.pageReadyAt == null) {
            /* visAt adalah elapsed; konversi kasar ke performance.now via t0 jika ada */
          }
          if (bi.sfxOk && GATE.sfxOkAt == null) GATE.sfxOkAt = now();
          if (bi.bgmOk && GATE.bgmOkAt == null) GATE.bgmOkAt = now();
          lastBi = bi;
        }
        if (b3) {
          if (GATE.modsAt == null && b3.done >= b3.total) GATE.modsAt = now();
          if (GATE.warmOkAt == null && b3.warm) GATE.warmOkAt = now();
        }
        /* juga coba deteksi lewat status internal jika terekspos */
        if (typeof pageReady === 'function' && GATE.pageReadyAt == null) {
          try { if (pageReady()) GATE.pageReadyAt = now(); } catch (e) {}
        }
      } catch (e) {}
    }, 50);
    /* stop setelah capsule + 5s */
    setTimeout(function () { clearInterval(iv); }, 60000);
  })();

  function paint() {
    if (!box) return;
    var t = R.t, x = [];
    x.push('BENCH v11.17+ ms (sejak navigasi)');
    x.push('dcl: ' + (t.dcl || '-') + '  load: ' + (t.load || '-'));
    x.push('boot start: ' + (t.bootStart || '-'));
    x.push('capsule: ' + (t.capsule || '-') + (R.bootToCapsule != null ? ' (boot+' + R.bootToCapsule + ')' : ''));
    x.push('blue klik: ' + (t.blue || '-'));
    x.push('frame1 (lastFrameOK#2): ' + (t.frame1 || '-') + (t.frame1 && t.blue ? ' (+' + (t.frame1 - t.blue) + ')' : ''));
    x.push('raf2 setelah blue: ' + (t.raf2 || '-') + (t.raf2 && t.blue ? ' (+' + (t.raf2 - t.blue) + ')' : ''));
    x.push('tap->bunyi: ' + (R.tapToPlay != null ? R.tapToPlay + 'ms ' + (R.tapKey || '') : '-') + '  tap/play: ' + R.taps + '/' + R.playing);
    if (R.sfxAtBootStart) x.push('SFX @bootStart meta/play: ' + R.sfxAtBootStart.metadata + '/' + R.sfxAtBootStart.playable);
    if (R.sfxAtCapsule) x.push('SFX @capsule meta/play: ' + R.sfxAtCapsule.metadata + '/' + R.sfxAtCapsule.playable + ' dari ' + R.sfxAtCapsule.total);
    if (R.finishGuess) x.push('capsule krn: ' + R.finishGuess);
    if (R.bootInfo) {
      var bi = R.bootInfo;
      x.push('warmAt/trig/visAt: ' + bi.warmAt + ' / ' + (bi.warmTrig || '-') + ' / ' + bi.visAt +
        (bi.sfxViaCap ? '  sfxViaCap' : '') + (bi.bgmViaCap ? '  bgmViaCap' : '') +
        (bi.bar != null ? '  bar@cap ' + bi.bar + '%' : ''));
    }
    if (GATE.modsAt || GATE.warmOkAt || GATE.sfxOkAt) {
      x.push('gateAt mods/warm/sfx: ' + (GATE.modsAt || '-') + '/' + (GATE.warmOkAt || '-') + '/' + (GATE.sfxOkAt || '-'));
    }
    if (R.sfxAtBlue) x.push('SFX @blue meta/play: ' + R.sfxAtBlue.metadata + '/' + R.sfxAtBlue.playable);
    if (R.tapLog.length) { var f = R.tapLog[0]; x.push('tap#1: blue+' + f[1] + 'ms  SFX meta/play ' + f[2] + '/' + f[3]); }
    if (R.playLog.length) { var l = R.playLog[R.playLog.length - 1]; x.push('play terakhir: ' + l[0] + ' lat ' + l[3] + 'ms rs' + l[4]); }
    x.push('longtask sblm capsule: ' + ltN + 'x / ' + Math.round(lt) + 'ms');
    x.push('loadingdone: ' + LD.n + 'x' + (LD.at.length ? ' (pertama @' + LD.at[0] + ', terakhir @' + LD.at[LD.at.length - 1] + ')' : ''));
    x.push('layout(): ' + LAY.n + 'x / ' + Math.round(LAY.ms) + 'ms  max ' + Math.round(LAY.max) + 'ms  dr loadingdone ' + LAY.fromLD + 'x' + (LAY.wrapped ? '' : '  (BELUM terbungkus)'));
    if (IS_REPEAT != null) x.push('repeatVisit: ' + IS_REPEAT);
    if (MICRO) x.push('microbench: ' + MICRO.iters + ' iters / ' + MICRO.ms + 'ms');
    if (RAF_POST_STATS) {
      var rp = RAF_POST_STATS;
      x.push('rafPost p50/p95: ' + rp.p50 + '/' + rp.p95 + '  drop20/33: ' + (rp.dropped20Pct != null ? rp.dropped20Pct : '-') + '/' + (rp.dropped33Pct != null ? rp.dropped33Pct : '-') + '%  hz~' + (rp.hzEst || '-'));
    }
    if (VITALS.lcp != null) x.push('LCP: ' + VITALS.lcp + '  FCP: ' + (VITALS.fcp || '-') + '  CLS: ' + (Math.round(VITALS.cls * 1000) / 1000));
    if (HIDDEN_DURING) x.push('hiddenDuringRun: yes (' + Math.round(HIDDEN_MS) + 'ms)');
    if (box && box._txt) box._txt.textContent = x.join('\n');
  }

  function aggregateLoafByFn(loafArr, beforeT) {
    var map = {};
    (loafArr || []).forEach(function (row) {
      if (beforeT != null && row[0] >= beforeT) return;
      var scripts = row[3] || [];
      scripts.forEach(function (s) {
        var fn = (s[1] || s[0] || 'anon') + '';
        if (!map[fn]) map[fn] = { n: 0, ms: 0, inv: {} };
        map[fn].n++;
        map[fn].ms += (s[3] || 0);
        var inv = s[2] || '?';
        map[fn].inv[inv] = (map[fn].inv[inv] || 0) + 1;
      });
    });
    return Object.keys(map).map(function (k) {
      return { fn: k, n: map[k].n, ms: map[k].ms, inv: map[k].inv };
    }).sort(function (a, b) { return b.ms - a.ms; });
  }

  function snapshot() {
    R.sfxFinal = sfxStates();
    R.ltPhase = LP;
    R.boot3d = window.__boot3d || null; /* {t, done, total, st[AST3D,SCP3D,DR3D,PT3D,PL3D], warm, gate} saat capsule tampil */
    R.glNew = GLN; /* [start, ms, antialias, label] per WebGLRenderer */
    R.glCall = GLC; /* [indeks renderer, compile|render, start, ms, label] 2 panggilan pertama >30 ms */
    R.ric = RIC_HOLD ? 'hold' : 'normal';
    R.loaf = LOAF.slice().sort(function (a, b) { return b[1] - a[1]; }).slice(0, 8); /* [start, dur, blocking, [[file, fungsi, invoker, ms] x3]] */
    /* v130: LoAF sesudah capsule tampil (top 8 menurut durasi) + penanda timeout/auto-enter. R.loaf di atas = top 8 seluruh sesi, hampir semuanya pra-capsule. */
    try { var tc = R.t.capsule; R.loafCap = tc == null ? [] : LOAF.filter(function (x) { return x[0] >= tc; }).sort(function (a, b) { return b[1] - a[1]; }).slice(0, 8); } catch (e) { R.loafCap = []; }
    /* v10: agregat LoAF by function name untuk seluruh fase pra-capsule (bukan cuma top 8) */
    try {
      var tc2 = R.t.capsule;
      R.loafByFnPre = aggregateLoafByFn(LOAF, tc2);
      R.loafByFnAll = aggregateLoafByFn(LOAF, null);
    } catch (e) { R.loafByFnPre = []; R.loafByFnAll = []; }

    R.bootTimeout = !!window.__bootTimeout; R.bootFinish = window.__bootFinish || null; R.ca = window.__ca != null ? window.__ca : null;   /* pass 11: tercatat di JSON supaya run ?nolive=1 dan normal bisa dibedakan */
    R.bootInfo = window.__bootInfo || R.bootInfo || null;   /* v147: warmAt, warmTrig, visAt, sfxViaCap, bar @capsule */
    R.preMs = window.__preMs || null;   /* PRA-KAPSUL (07-boot): ms dari vis sampai ui / ast / fb selesai */
    R.evt = EVT; /* [event, start, inputDelay, processing, total] untuk event >=100ms (klik Blue dll) */
    R.ltTop = LT.slice().sort(function (a, b) { return b[1] - a[1]; }).slice(0, 10); /* [startTime, durasi] terpanjang; bandingkan dgn t.capsule/blue/frame1 dan marks */
    try { var m0 = performance.getEntriesByName('obs-t0')[0], mw = performance.getEntriesByName('obs-warm')[0]; R.t0Start = m0 ? Math.round(m0.startTime) : null; R.warmStart = mw ? Math.round(mw.startTime) : null; R.t0mode = /[?&]legacy=1/.test(location.search) ? 'legacy' : (/[?&]t0=capsule/.test(location.search) ? 'capsule' : 'dcl'); } catch (e) {}
    R.longtaskBeforeCapsule = { n: ltN, ms: Math.round(lt) };
    R.longtaskTotal = { n: ltAllN, ms: Math.round(ltAll) };
    /* v11.15: loadingdone + layout() */
    try {
      var tcL = R.t.capsule, pre = { n: 0, ms: 0 }, preLD = 0;
      LAY.calls.forEach(function (c) { if (tcL == null || c[0] < tcL) { pre.n++; pre.ms += c[1]; } });
      LD.at.forEach(function (t) { if (tcL == null || t < tcL) preLD++; });
      R.loadingdone = { n: LD.n, preCapsule: preLD, at: LD.at };
      R.layout = {
        wrapped: LAY.wrapped, wrapAt: LAY.at, n: LAY.n, ms: Math.round(LAY.ms * 10) / 10, max: Math.round(LAY.max * 10) / 10,
        fromLoadingdone: { n: LAY.fromLD, ms: Math.round(LAY.fromLDms * 10) / 10 },
        preCapsule: { n: pre.n, ms: Math.round(pre.ms * 10) / 10, note: LAY.calls.length >= 60 ? 'dari 60 panggilan pertama' : 'lengkap' },
        calls: LAY.calls   /* [start, ms, 1=dipicu loadingdone] */
      };
    } catch (eLY) { R.loadingdone = null; R.layout = null; }

    /* v10: ver semua file + hash konten 07-boot & index.css */
    try {
      R.ver = {};
      Array.prototype.forEach.call(document.scripts, function (sc) {
        var m = /\/([^\/?]+)\?v=(\d+)/.exec(sc.src || '');
        if (m) R.ver[m[1]] = +m[2];
      });
      Array.prototype.forEach.call(document.querySelectorAll('link[rel="stylesheet"]'), function (lk) {
        var m = /\/([^\/?]+)\?v=(\d+)/.exec(lk.href || '');
        if (m) R.ver[m[1]] = +m[2];
      });
      R.verAll = ALL_V;
      R.hash = { '07-boot.js': HASH.boot, 'index.css': HASH.css };
      R.legacy = /[?&]legacy=1/.test(location.search);
      R.loadAfterCapsule = R.t.load != null && R.t.capsule != null ? R.t.load - R.t.capsule : null;
    } catch (e) {}

    R.three = (window.THREE && window.THREE.REVISION) || null; R.qs = location.search; R.ws = window.__ws != null ? window.__ws : null; R.envsz = window.__envsz != null ? window.__envsz : null;   /* v11: dump self-describing (flag URL + status irisan) */
    R.off = window.__offL || null; R.pt2d = window.__pt2d != null ? window.__pt2d : null; try { R.pt3d = typeof PT3D !== 'undefined' ? { state: PT3D.state, err: PT3D.err || '' } : null; } catch (ePt) { R.pt3d = null; } R.ds = window.__ds != null ? window.__ds : null; R.denv = window.__denv != null ? window.__denv : null; R.dmf = window.__dmf != null ? window.__dmf : null; R.senv = window.__senv != null ? window.__senv : null; R.threeQ = window.__threeQ ? (function(q){var w=q.warm;return {tqb:window.__tqb!=null?window.__tqb:null,tqp:window.__tqp!=null?window.__tqp:null,yp:q.yp,n:q.n,nb:q.nb,bj:q.bj,runMs:Math.round(q.runMs),waitMs:Math.round(q.waitMs),waitMax:Math.round(q.waitMax),tmo:q.tmo,turns:q.turns,warm:{n:w.n,idleMs:Math.round(w.idleMs),cpuMs:Math.round(w.cpuMs),sl:w.sl,gapMs:Math.round(w.gapMs),items:w.items}};})(window.__threeQ) : null;   /* v11.11: pencatat giliran THREE_Q + THREE_WARM (12-ast3d v20) */ R.smf = window.__smf != null ? window.__smf : null; R.bm = window.__bm != null ? window.__bm : null;   /* v11.13: ?bm=0 (07-boot v155) */ R.wi = window.__wi != null ? window.__wi : null;   /* v11.12: ?wi=0 (12-ast3d v21) */ R.dr3dT = window.__dr3dT || null; R.ss = window.__ss != null ? window.__ss : null; R.scp3dT = window.__scp3dT || null; R.ps = window.__ps != null ? window.__ps : null; R.pt3dT = window.__pt3dT || null; R.pl3dT = window.__pl3dT || null; R.warmReal = window.__warmReal || null; R.rwPre = window.__rwPre || null; try { R.barG = window.__barG ? window.__barG() : null; } catch (eBg) { R.barG = null; } R.rw = window.__rw || null; R.enteredAt = window.__enteredAt != null ? Math.round(window.__enteredAt) : null; R.gpup = window.__gpuP ? 1 : 0;   /* v11.24: warm nyata pra-kapsul (07-boot v172) */
    try { R.sc = typeof scDumpObj === 'function' ? scDumpObj() : null; } catch (eSc) { R.sc = null; }   /* starcache (04-render.js): ?starcache=1 */
    try { R.cfg = cfgOut(); } catch (eCf) { R.cfg = null; }
    R.gs = window.__gs != null ? window.__gs : null; try { R.glG = typeof window.__glG === 'function' ? window.__glG() : null; } catch (eG) { R.glG = null; }   /* v11.13: renderer GL dibagi (12-ast3d v22): ?gs=0 mati; glG = ukuran kanvas + unit per grup */
    R.ua = navigator.userAgent; R.potato = typeof IS_POTATO !== 'undefined' ? IS_POTATO : null; R.reduce = typeof reduce !== 'undefined' ? reduce : null;

    /* v10: network detail */
    try {
      var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      R.net = conn ? {
        effectiveType: conn.effectiveType || null,
        rtt: conn.rtt != null ? conn.rtt : null,
        downlink: conn.downlink != null ? conn.downlink : null,
        saveData: !!conn.saveData,
        type: conn.type || null
      } : { effectiveType: 'n/a' };
    } catch (e) { R.net = { effectiveType: 'n/a' }; }

    R.swNow = navigator.serviceWorker && navigator.serviceWorker.controller ? 'controlled' : 'no-controller';
    R.swRegAt = window.__swRegAt != null ? window.__swRegAt : null; R.swLog = window.__swLog || []; R.warmLog = window.__warmLog || []; R.warmMax = window.__warmMax || 0;   /* v129 diagnostik */
    R.isRepeatVisit = IS_REPEAT;
    R.bootRepeatFlag = IS_REPEAT; /* kompat */

    /* v10: resource timing detail — three (module/core/custom) + audio (named objects) */
    try {
      var rs = performance.getEntriesByType('resource');
      R.res = rs.length;
      var PROTO_ALL = {};
      R.aud = [];
      R.threeRes = null;
      rs.forEach(function (e) {
        var name = (e.name || '').replace(/^.*\//, '').replace(/\?.*$/, '');
        var ttfb = (e.responseStart > 0 && e.startTime >= 0) ? Math.round(e.responseStart - e.startTime) : null;
        var obj = {
          name: name,
          start: Math.round(e.startTime),
          responseStart: Math.round(e.responseStart),
          responseEnd: Math.round(e.responseEnd),
          ttfb: ttfb,
          transferSize: e.transferSize,
          encodedBodySize: e.encodedBodySize,
          decodedBodySize: e.decodedBodySize,
          initiatorType: e.initiatorType || null,
          proto: e.nextHopProtocol || null,
          q: e.requestStart > 0 ? Math.round(e.requestStart - e.startTime) : null,
          w: (e.requestStart > 0 && e.responseStart > 0) ? Math.round(e.responseStart - e.requestStart) : null,
          conn: e.connectEnd > 0 ? Math.round(e.connectEnd - e.connectStart) : null,
          sw: e.workerStart > 0 ? 1 : 0
        };
        try { var pk = e.nextHopProtocol || '?'; PROTO_ALL[pk] = (PROTO_ALL[pk] || 0) + 1; } catch (ePk) {}
        if (/\.opus|\.mp3|\.ogg|\.wav|audio\//i.test(e.name) || /sfx|bgm|amb|garg|collap/i.test(name)) {
          R.aud.push(obj);
        }
        if (/three\.(module|core|custom)/i.test(name)) {
          if (!R.threeRes) R.threeRes = obj;
          else if (!Array.isArray(R.threeRes)) R.threeRes = [R.threeRes, obj];
          else R.threeRes.push(obj);
        }
      });
      R.protoAll = PROTO_ALL;
      /* puncak request audio yang benar-benar ke network (transferSize > 0) dan tumpang tindih; dihitung dari start..responseEnd.
         Kalau puncak ~6 padahal konkurensi warm 8 -> kemungkinan batas 6 koneksi HTTP/1.1 per host. */
      var ev = [];
      R.aud.forEach(function (a) { if (a.transferSize > 0) { ev.push([a.start, 1]); ev.push([a.responseEnd, -1]); } });
      ev.sort(function (x, y) { return x[0] - y[0] || x[1] - y[1]; });
      var cur = 0, pk2 = 0; ev.forEach(function (x) { cur += x[1]; if (cur > pk2) pk2 = cur; });
      R.audPeak = pk2;
    } catch (e) {}

    /* v10: gate timestamps */
    R.gateAt = {
      pageReadyAt: GATE.pageReadyAt,
      modsAt: GATE.modsAt,
      warmOkAt: GATE.warmOkAt,
      bgmOkAt: GATE.bgmOkAt,
      sfxOkAt: GATE.sfxOkAt,
      visAt: (R.bootInfo && R.bootInfo.visAt != null) ? R.bootInfo.visAt : null
    };

    /* v10: media masih networkState===2 saat load */
    R.mediaAtLoad = MEDIA_AT_LOAD;

    /* v10/v11: device conditions */
    R.microbench = MICRO;
    R.microbenchEnd = MICRO_END;
    R.microbenchDelta = (MICRO && MICRO_END) ? { iters: MICRO_END.iters - MICRO.iters, ms: MICRO_END.ms - MICRO.ms } : null;
    R.battery = BAT;
    R.memory = snapMem() || MEM;
    R.memoryTimeline = MEM_TIMELINE.slice();
    R.contextLost = CTX_LOST;
    R.device = DEVICE;
    R.glRenderer = GL_RENDERER;
    R.hiddenDuringRun = HIDDEN_DURING;
    R.hiddenMs = Math.round(HIDDEN_MS + (_hiddenSince != null ? performance.now() - _hiddenSince : 0));

    /* v11: renderer.info per label */
    try {
      R.glInfo = {};
      Object.keys(GL_BY_LABEL).forEach(function (lab) {
        var ent = GL_BY_LABEL[lab];
        if (!ent || !ent.renderer || !ent.renderer.info) return;
        var info = ent.renderer.info;
        R.glInfo[lab] = {
          idx: ent.idx,
          createdAt: ent.createdAt,
          memory: info.memory ? { geometries: info.memory.geometries, textures: info.memory.textures } : null,
          programs: info.programs ? info.programs.length : (info.memory && info.memory.programs) || null,
          render: info.render ? {
            calls: info.render.calls,
            triangles: info.render.triangles,
            points: info.render.points,
            lines: info.render.lines,
            frame: info.render.frame
          } : null
        };
      });
    } catch (e) { R.glInfo = {}; }

    /* v10: UX metrics */
    R.pV = PV_SERIES.slice();
    /* ringkas rAF: mean/median/p95 pre-capsule + count */
    try {
      var deltas = RAF_DELTAS.slice();
      if (deltas.length) {
        deltas.sort(function (a, b) { return a - b; });
        var sum = 0; deltas.forEach(function (d) { sum += d; });
        R.rafStats = {
          n: deltas.length,
          mean: Math.round(sum / deltas.length),
          median: deltas[Math.floor(deltas.length / 2)],
          p95: deltas[Math.min(deltas.length - 1, Math.floor(deltas.length * 0.95))],
          max: deltas[deltas.length - 1]
        };
      } else R.rafStats = null;
    } catch (e) { R.rafStats = null; }

    /* v11: post-enter frame stability */
    R.rafPost = RAF_POST_STATS;
    R.rafPostN = RAF_POST.length;

    /* v11: web vitals */
    R.vitals = {
      fcp: VITALS.fcp,
      lcp: VITALS.lcp,
      cls: Math.round(VITALS.cls * 10000) / 10000,
      lcpEntries: VITALS.lcpEntries
    };

    /* v10/v11: auto-repeat runs accumulator + aggregate stats */
    try {
      var runsMatch = /[?&]runs=(\d+)/.exec(location.search);
      R.runsRequested = runsMatch ? +runsMatch[1] : null;
      var prev = null;
      try { prev = JSON.parse(sessionStorage.getItem('__bench_runs') || 'null'); } catch (e) {}
      R.runsPrev = prev;
      if (prev && prev.length) {
        function agg(keyFn) {
          var vals = [];
          prev.forEach(function (r) {
            var v = keyFn(r);
            if (v != null && typeof v === 'number' && !isNaN(v)) vals.push(v);
          });
          if (!vals.length) return null;
          vals.sort(function (a, b) { return a - b; });
          var sum = 0; vals.forEach(function (x) { sum += x; });
          return {
            n: vals.length,
            min: vals[0],
            max: vals[vals.length - 1],
            median: (function () {
              var n = vals.length;
              if (n % 2) return vals[Math.floor(n / 2)];
              return Math.round(((vals[n / 2 - 1] + vals[n / 2]) / 2) * 10) / 10;
            })(),
            mean: Math.round((sum / vals.length) * 10) / 10
          };
        }
        R.runsAgg = {
          capsule: agg(function (r) { return r.capsule; }),
          bootToCapsule: agg(function (r) { return r.bootToCapsule; }),
          load: agg(function (r) { return r.load; }),
          longtaskPreMs: agg(function (r) { return r.longtaskPre && r.longtaskPre.ms; }),
          microIters: agg(function (r) { return r.microbench && r.microbench.iters; }),
          rafPostP95: agg(function (r) { return r.rafPost && r.rafPost.p95; }),
          rafPostDrop20: agg(function (r) { return r.rafPost && r.rafPost.dropped20Pct; }),
          rafPostDrop33: agg(function (r) { return r.rafPost && r.rafPost.dropped33Pct; }),
          lcp: agg(function (r) { return r.vitals && r.vitals.lcp; })
        };
      }
    } catch (e) {}

    return JSON.stringify(R);
  }

  /* waktu eksekusi tiap <script defer>: event 'load' script defer terpicu setelah script itu selesai dieksekusi.
     Selisih antar-script berurutan ~ biaya eksekusi script (+ tunggu download kalau belum ada). */
  R.scr = {};
  try {
    Array.prototype.forEach.call(document.scripts, function (s) {
      if (!s.src) return;
      var n = s.src.replace(/^.*\//, '').replace(/\?.*$/, '');
      s.addEventListener('load', function () { R.scr[n] = now(); });
    });
  } catch (e) {}

  /* boot start = saat 07-boot menandai #boot-matrix[data-boot] (hujan matrix sendiri sudah jalan lebih awal lewat 00-rain.js) */
  var mx = document.getElementById('boot-matrix');
  if (mx) new MutationObserver(function (m, ob) {
    if (R.t.bootStart == null) { mark('bootStart'); R.sfxAtBootStart = sfxStates(); hookSfx(); ob.disconnect(); }
  }).observe(mx, { childList: true, attributes: true, attributeFilter: ['data-boot'] });

  var ch = document.getElementById('boot-choices');
  if (ch) new MutationObserver(function () {
    if (ch.classList.contains('on') && !capDone) {
      capDone = true; R.sfxAtCapsule = sfxStates(); mark('capsule'); hookSfx();
      try { MEM_TIMELINE.push(Object.assign({ t: Math.round(performance.now()), tag: 'capsule' }, snapMem() || {})); } catch (e) {}
      if (R.t.bootStart != null) {
        R.bootToCapsule = R.t.capsule - R.t.bootStart;
        /* v147: bedakan gate nyata vs plafon SFX/BGM lewat __bootInfo */
        R.bootInfo = window.__bootInfo || null;
        var bi = R.bootInfo, fin = window.__bootFinish;
        if (fin === 'cap3d') R.finishGuess = 'cap3d';
        else if (bi && bi.sfxViaCap) R.finishGuess = 'gate+sfxCap meta ' + (R.sfxAtCapsule.metadata + '/' + R.sfxAtCapsule.total);
        else if (bi && bi.bgmViaCap) R.finishGuess = 'gate+bgmCap';
        else if (R.sfxAtCapsule.metadata >= R.sfxAtCapsule.total) R.finishGuess = 'gate readiness 16/16';
        else R.finishGuess = fin || ('gate? meta ' + R.sfxAtCapsule.metadata + '/' + R.sfxAtCapsule.total);
      }
      /* final gate snapshot */
      try {
        var b3 = window.__boot3d;
        if (b3) {
          if (GATE.modsAt == null && b3.done >= (b3.total || 0)) GATE.modsAt = now();
          if (GATE.warmOkAt == null && b3.warm) GATE.warmOkAt = now();
        }
        if (R.bootInfo) {
          if (R.bootInfo.sfxOk && GATE.sfxOkAt == null) GATE.sfxOkAt = now();
          if (R.bootInfo.bgmOk && GATE.bgmOkAt == null) GATE.bgmOkAt = now();
        }
      } catch (e) {}
      paint();
    }
  }).observe(ch, { attributes: true, attributeFilter: ['class'] });

  /* ===== v11.19: PENCATAT WARM/BAKE PASCA-BOOT (dump TERPISAH: tombol POST JSON / POST TXT / POST COPY; snapshot() utama tidak berubah) =====
     Jendela rekam: mulai saat kapsul muncul (atau obs-entered kalau lebih dulu) sampai entered + PB_MS (default 60 dtk, ?pbms=N). Hanya MENGUKUR, tidak mengubah urutan kerja:
     (1) fungsi global bake/warm dibungkus (waktu mulai + durasi sinkron + argumen ringkas). Dipasang di DOMContentLoaded (semua script defer sudah jalan). Fungsi per-frame berbasis cache
         (snBake, bhCssApply, ensureAsteroidSprites ...) tetap dihitung di agregat, tapi baris event cuma dicatat kalau >= 1 ms.
     (2) requestIdleCallback dibungkus: asal (file:baris dari stack saat dijadwalkan), jeda jadwal->jalan, durasi, timeRemaining awal, didTimeout. Hanya yang JALAN sesudah kapsul.
     (3) longtask + LoAF (>=50 ms, atribusi skrip), rAF per detik (n, max, >33 ms, >50 ms) selama jendela, memori tiap 10 dtk, warmLog audio, THREE_WARM + __threeQ.warm.
     Hasil: ringkasan per nama + timeline gabungan (relatif kapsul) + detail. window.__benchPost() = snapshot string (console). */
  var PB_MS = (function () { var m = /[?&]pbms=(\d+)/.exec(location.search); return m ? Math.max(5000, +m[1]) : (/[?&]gpup=1(&|$)/.test(location.search) ? 200000 : (/[?&]debug=1(&|$)/.test(location.search) ? 300000 : 60000)); })();   /* v11.29c: dengan gpup=1 jendela 200 dtk supaya seq (±75-100 dtk) tidak terpotong */
  var PB = { ev: [], agg: {}, ric: [], ricN: 0, ricMs: 0, loaf: [], lt: [], fr: {}, mem: [], t0: null, tEnd: null, wrapped: [], missing: [], sampler: false };
  var PB_FN = ['bakeAstroPlates', 'bakeDustLayers', 'bakeHudGeom', 'bakeCamGrid', 'ensureCamGrid', 'nebTint', 'nebTintStep', 'nebTintSync', 'nebLiteFallback',
    'bhBandBake', 'bhCssApply', 'bhBloomSprite', 'bhFiberSprite', 'buildSprite', 'ensureAsteroidSprites', 'ofxMakeTint', 'ringWarmStep', 'nebPrefetch', 'bhSpriteWarm', 'getRingSprite', 'getStarSprite',
    'skyWarmStep', 'snBake', 'bakeCometSprites', 'panelWarmOnce', 'whPrewarm', 'buildSprites', 'threeWarm', 'threeWarmNext', 'threeGLWarmBegin',
    'pl3dBake2D', 'pl3dAurBake', 'pl3dAurBakeMk', 'pt3dWarmMax', 'warmRest', 'warmPump'];
  function pbArg(a) {
    try {
      if (!a || !a.length) return '';
      var v = a[0], t = typeof v;
      if (v == null) return '';
      if (t === 'number' || t === 'boolean') return String(v);
      if (t === 'string') return v.slice(0, 24);
      if (Array.isArray(v)) return '[' + v.slice(0, 3).join(',') + ']';
      if (t === 'object') return String(v.id || v.name || v.key || v.k || '{}').slice(0, 24);
    } catch (e) {}
    return '';
  }
  function pbRec(name, t, d, a) {
    var g = PB.agg[name] || (PB.agg[name] = { n: 0, ms: 0, max: 0, nPost: 0, msPost: 0, maxPost: 0, first: null, last: null });
    g.n++; g.ms += d; if (d > g.max) g.max = d;
    var tc = R.t.capsule;
    if (tc != null && t >= tc && (PB.tEnd == null || t <= PB.tEnd)) {
      g.nPost++; g.msPost += d; if (d > g.maxPost) g.maxPost = d;
      if (g.first == null) g.first = Math.round(t);
      g.last = Math.round(t);
      if (d >= 1 && PB.ev.length < 500) PB.ev.push([name, Math.round(t), Math.round(d * 10) / 10, pbArg(a)]);
    }
  }
  function pbWrap(name) {
    try {
      var f = window[name];
      if (typeof f !== 'function') { PB.missing.push(name); return; }
      if (f.__pb) return;
      var w = function () {
        var t = performance.now();
        try { return f.apply(this, arguments); }
        finally { try { pbRec(name, t, performance.now() - t, arguments); } catch (e) {} }
      };
      w.__pb = 1; w.prototype = f.prototype;
      window[name] = w; PB.wrapped.push(name);
    } catch (e) { PB.missing.push(name + '!'); }
  }
  /* rIC: dibungkus SEKARANG (sebelum script defer menjadwalkan); callback asli tetap dipanggil dgn deadline yang sama */
  try {
    if (window.requestIdleCallback) {
      var _ric2 = window.requestIdleCallback.bind(window);
      window.requestIdleCallback = function (fn, o) {
        var org = '', sched = performance.now();
        try {
          var st = (new Error().stack || '').split('\n');
          for (var i = 1; i < st.length; i++) { if (st[i].indexOf('21-bench') < 0) { var m = /([^\/\s(]+\.js)[^:]*:(\d+)/.exec(st[i]); org = m ? m[1] + ':' + m[2] : st[i].trim().slice(0, 40); break; } }
        } catch (e) {}
        return _ric2(function (dl) {
          var t = performance.now(), tc = R.t.capsule;
          try { return fn.call(this, dl); }
          finally {
            try {
              var d = performance.now() - t;
              if (tc != null && t >= tc) {
                PB.ricN++; PB.ricMs += d;
                if (PB.ric.length < 300) { var tr = -1; try { tr = Math.round(dl.timeRemaining()); } catch (e1) {} PB.ric.push([org, Math.round(sched), Math.round(t), Math.round(d * 10) / 10, o && o.timeout || 0, dl && dl.didTimeout ? 1 : 0, tr]); }
              }
            } catch (e) {}
          }
        }, o);
      };
    }
  } catch (e) {}
  try {
    new PerformanceObserver(function (l) {
      l.getEntries().forEach(function (e) {
        if (e.duration < 50 || PB.loaf.length >= 150) return;
        var sc = (e.scripts || []).slice().sort(function (a, b) { return b.duration - a.duration; }).slice(0, 3).map(function (x) {
          return [fileOf(x.sourceURL), x.sourceFunctionName || '', Math.round(x.duration)];
        });
        PB.loaf.push([Math.round(e.startTime), Math.round(e.duration), Math.round(e.blockingDuration || 0), Math.round(e.renderStart ? e.renderStart - e.startTime : 0), sc]);
      });
    }).observe({ type: 'long-animation-frame', buffered: true });
  } catch (e) {}
  try {
    new PerformanceObserver(function (l) {
      l.getEntries().forEach(function (e) { if (PB.lt.length < 300) PB.lt.push([Math.round(e.startTime), Math.round(e.duration)]); });
    }).observe({ type: 'longtask', buffered: true });
  } catch (e) {}
  function pbStartSampler() {
    if (PB.sampler) return; PB.sampler = true;
    PB.t0 = performance.now(); var last = null, lastMem = PB.t0;
    function tick(ts) {
      var tE = R.t.entered, stop = Math.max((tE != null ? tE + PB_MS : PB.t0 + PB_MS + 120000), window.__pbExt || 0);
      if (ts > stop) { PB.tEnd = Math.round(ts); return; }
      if (last != null) {
        var d = ts - last, k = Math.floor((ts - PB.t0) / 1000), b = PB.fr[k] || (PB.fr[k] = [0, 0, 0, 0]);
        b[0]++; if (d > b[1]) b[1] = Math.round(d * 10) / 10; if (d > 33.5) b[2]++; if (d > 50) b[3]++;
      }
      last = ts;
      if (ts - lastMem >= 10000) { lastMem = ts; try { PB.mem.push(Object.assign({ t: Math.round(ts) }, snapMem() || {})); } catch (e) {} }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  (function () {
    var iv = setInterval(function () {
      if (R.t.capsule != null || R.t.entered != null) { clearInterval(iv); pbStartSampler(); }
    }, 250);
    setTimeout(function () { clearInterval(iv); }, 120000);
  })();
  /* ===== v11.20: akumulator pmk ringan per segmen frame (hanya ?bench=1; dilewati kalau HUD PERF 19-auto-debug aktif).
     Menimpa window.pmk/pBegin/pEnd (no-op di produksi) setelah DOMContentLoaded. Tiap nilai segmen = waktu sejak pmk SEBELUMNYA (jadi 'cons+stars' di overview = drawSectorOverview + tx lines).
     Dipisah per label mode: ov (overview) / sec (dalam sektor) / trans (SECT.busy) + '+H' (FS.heavy) / '+S' (FS.slow). Hanya frame yang SAMPAI pBegin (frame yang di-throttle tidak dihitung). */
  var PM = { on: false, t0: 0, fs0: 0, cur: {}, modes: {}, worst: [], ff: [] };   /* ff = 6 frame pertama (semua segmen >=1,5 ms) */
  function pmLbl() {
    var s = typeof SECT !== 'undefined' ? SECT : null, f = typeof FS !== 'undefined' ? FS : null;
    var l = !s ? '?' : s.busy ? 'trans' : s.on ? 'ov' : s.cur ? 'sec' : 'ov?';
    if (f) { if (f.heavy) l += '+H'; if (f.slow) l += '+S'; }
    if (window.__offPh) l += '|' + window.__offPh;   /* v11.29b: fase runner ?offseq */
    if (window.SCACHE && window.SCACHE.act) l += '~sc';   /* frame yang memakai starcache (04-render.js) dipisah di label supaya A/B cons+stars terbaca dalam satu dump */
    return l;
  }
  function pmEnd() {
    var t = performance.now(), k, fdt = (PM.pf0 != null) ? PM.fs0 - PM.pf0 : null;
    PM.pf0 = PM.fs0;   /* periode antar frame yang SAMPAI pBegin (frame ter-throttle ikut memanjangkan periode) */
    if (window.__offSkip && t < window.__offSkip) return;   /* v11.29b: frame awal fase (settle) tidak dihitung */
    PM.cur.end = (PM.cur.end || 0) + (t - PM.t0);
    if (PB.t0 == null || PB.tEnd != null) return;
    var js = t - PM.fs0, lb = pmLbl(), m = PM.modes[lb] || (PM.modes[lb] = { n: 0, js: 0, mx: 0, smp: [], seg: {}, dn: 0, dt: 0, ds: [] });
    if (fdt != null && fdt > 0 && fdt < 600) { m.dn++; m.dt += fdt; if (m.ds.length < 800) m.ds.push(fdt); }
    if (window.__stCnt && typeof ST_C === 'object') { var d1 = ST_C.f - (PM.sf || 0), d2 = ST_C.g - (PM.sg || 0), d3 = ST_C.c - (PM.sc || 0), d4 = ST_C.ga - (PM.sga || 0); PM.sf = ST_C.f; PM.sg = ST_C.g; PM.sc = ST_C.c; PM.sga = ST_C.ga; if (d1 >= 0 && d1 <= 2) { m.sf = (m.sf || 0) + d1; m.sg = (m.sg || 0) + d2; m.sc = (m.sc || 0) + d3; m.sga = (m.sga || 0) + d4; } }
    m.n++; m.js += js; if (js > m.mx) m.mx = js; if (m.smp.length < 800) m.smp.push(js);
    if (PM.ff.length < 6) { var ffo = {}; for (k in PM.cur) if (PM.cur[k] >= 1.5) ffo[k] = Math.round(PM.cur[k] * 10) / 10; PM.ff.push([Math.round(t), lb, Math.round(js * 10) / 10, ffo]); }
    for (k in PM.cur) { var s = m.seg[k] || (m.seg[k] = [0, 0]); s[0] += PM.cur[k]; if (PM.cur[k] > s[1]) s[1] = PM.cur[k]; }
    if (js >= 30) {   /* 15 frame terburuk + rincian 4 segmen terbesar */
      var top = Object.keys(PM.cur).sort(function (a, b) { return PM.cur[b] - PM.cur[a]; }).slice(0, 4).map(function (q) { return q + ' ' + (Math.round(PM.cur[q] * 10) / 10); });
      var row = [Math.round(t), lb, Math.round(js * 10) / 10, top.join(' ; ')];
      if (PM.worst.length < 15) PM.worst.push(row);
      else { var mi = 0, i; for (i = 1; i < PM.worst.length; i++) if (PM.worst[i][2] < PM.worst[mi][2]) mi = i; if (js > PM.worst[mi][2]) PM.worst[mi] = row; }
    }
  }
  function pmInstall() {
    try { var sb = /[?&]stb=([0-9.]+),([0-9.]+)/.exec(location.search); if (sb && typeof STB === 'object') { STB[0] = +sb[1]; STB[1] = +sb[2]; } } catch (eSb) {}
    offApply();
    try {
      if (window.PERF || typeof window.pmk !== 'function' || window.pmk.__pm) return;
      var f = function (n) { var t = performance.now(); PM.cur[n] = (PM.cur[n] || 0) + (t - PM.t0); PM.t0 = t; };
      f.__pm = 1;
      window.pmk = f;
      window.__pmB = 1;   /* pl3dMk (17-planet3d v46) ikut mencatat marker pl.* */
      window.pBegin = function () {
        PM.fs0 = PM.t0 = performance.now(); PM.cur = {};
        if (window.__gpuP && typeof THREE_GLG !== 'undefined') {   /* v11.26: backlog GPU SEBELUM modul mana pun menggambar di frame ini: q.big / q.small */
          try {
            var qk = Object.keys(THREE_GLG);   /* default: urutan pembuatan (big, small) */
            if (window.__gpuO) qk.reverse();   /* v11.28: ?gpuo=1 -> small dulu, baru big */
            PM.qo = qk.join(',');
            for (var qi = 0; qi < qk.length; qi++) { var gk = qk[qi], gG = THREE_GLG[gk]; if (gG && gG.r) { if (typeof glSync === 'function') glSync(gG.r.getContext()); else gG.r.getContext().finish(); f('q.' + gk); } }
          } catch (eQ) {}
        }
      };
      window.pEnd = pmEnd;
      PM.on = true;
    } catch (e) {}
  }
  /* ===== v11.29b: runner lapisan-mati TANPA reload. Tap tombol 'seq' (panel A/B) atau window.__offSeqStart() saat sudah di overview / sektor.
     Tiap fase = set lapisan mati selama ?offms=N (default 8000) ms, 1000 ms pertama dibuang (settle). Label mode jadi 'ov+S|sky' dst, jadi satu dump memuat semua fase.
     Urutan: base, sky, skyhide, hud, mw, neb, lines+stars, base2 (base2 = cek drift termal). Tercatat di pmk.offSeq. ?offseq=1 = mulai otomatis 6 dtk setelah obs-entered. */
  var OS = { on: false, log: [], runs: [], ms: 8000, kind: 'blit', i: 0, n: 0, name: '', phEnd: 0, totEnd: 0, tm: 0, lastTxt: '' };
  var OS_SETS = {
    blit: [['base', []], ['plb', ['plb']], ['astb', ['astb']], ['ptb', ['ptb']], ['scb', ['scb']], ['drb', ['drb']], ['blit', ['blit']], ['ast', ['ast']], ['base2', []]],   /* blit = lewati drawImage GL->#sky tiap unit; ast = lewati batu sama sekali (GL+blit) */
    floor: [['base', []], ['all', ['all']], ['hole', ['hole']], ['pulse', ['pulse']], ['plfx', ['plfx']], ['combo', ['blit', 'hole', 'pulse', 'plfx', 'ast']], ['combo+', ['blit', 'hole', 'pulse', 'plfx', 'ast', 'sky', 'lines', 'stars']], ['base2', []]],   /* all = TIDAK ada gambar sama sekali (PX.all; pBegin + q.* tetap jalan) = LANTAI backlog; combo/combo+ = semua lapisan yang sudah ketahuan mati; selisih combo+ vs all = sisa yang bukan dari gambar kita */
    stars: [['base', []], ['cname', ['cname']], ['lstroke', ['lstroke']], ['lines', ['lines']], ['sglow', ['sglow']], ['score', ['score']], ['slbl', ['slbl']], ['splei', ['splei']], ['sdraw', ['sdraw']], ['stars', ['stars']], ['base2', []]],   /* v11.29g: pecah 'lines+stars' di SEKTOR (±13 ms). cname=nama rasi+nebula; lstroke=goresan garis (hitung gSky tetap); lines=drawCons utuh; sglow=halo bintang; score=inti bintang; slbl=silang+label+spektrum; splei=Pleiades; sdraw=semua gambar bintang mati (tinggal hitung); stars=drawStars+Pleiades utuh. Sisa lines−cname−lstroke = hitung/culling garis; stars−sdraw−splei = hitung bintang. Dump juga memuat seg s.cons/s.pulse/s.stars/s.plei (waktu JS perekaman, bukan raster) */
    sizes: [['base', []], ['sgs', ['sgs']], ['sgm', ['sgm']], ['sgl', ['sgl']], ['scs', ['scs']], ['scm', ['scm']], ['scl', ['scl']], ['sglow', ['sglow']], ['score', ['score']], ['base2', []]],   /* v11.29h: halo (sg*) dan inti (sc*) dimatikan per ember ukuran s.r mentah: s=kecil (<STB[0]), m=sedang, l=besar (>=STB[1]); sglow/score = semua ukuran (pembanding). Dump: stCnt = jumlah bintang + luas halo per frame per ember */
    plei: [['base', []], ['pname', ['pname']], ['pglow', ['pglow']], ['pcore', ['pcore']], ['pint', ['pint']], ['splei', ['splei']], ['base2', []]],   /* v11.29h: Pleiades: pname=kotak nama, pglow=halo, pcore=inti, pint=pulse+label Pleione (composite lighter), splei=semua */
    layer: [['base', []], ['sky', ['sky']], ['skyhide', ['skyhide']], ['hud', ['hud']], ['mw', ['mw']], ['neb', ['neb']], ['lines+stars', ['lines', 'stars']], ['base2', []]]
  };
  function osBox(c) { try { var b = document.getElementById('__bench_box'); if (b) b.classList.toggle('bc', !!c); } catch (e) {} }
  function osLabel(txt, withStop) {
    try {
      var e = document.getElementById('__bench_phase');
      if (!e) {
        e = document.createElement('div'); e.id = '__bench_phase';
        e.style.cssText = 'position:fixed;bottom:4px;left:4px;z-index:2147483647;background:rgba(0,0,0,.8);color:#ffd27f;font:10px monospace;padding:3px 6px;border:1px solid #a82;display:flex;gap:6px;align-items:center;pointer-events:none';
        var t = document.createElement('span'); e.appendChild(t);
        var st = document.createElement('button'); st.textContent = 'STOP'; st.style.cssText = 'font:10px monospace;padding:1px 5px;pointer-events:auto;display:none';
        st.onclick = function (ev) { ev.stopPropagation(); offSeqStop(); };
        ['pointerdown', 'pointerup', 'touchstart', 'touchend', 'click', 'mousedown', 'mouseup'].forEach(function (evn) { e.addEventListener(evn, function (ev) { ev.stopPropagation(); }, false); });
        e.appendChild(st); document.body.appendChild(e);
      }
      if (OS.lastTxt !== txt) { e.firstChild.textContent = txt; OS.lastTxt = txt; }
      e.lastChild.style.display = withStop ? 'inline-block' : 'none';
    } catch (eL) {}
  }
  function osFmt(ms) { var s = Math.max(0, Math.ceil(ms / 1000)); return Math.floor(s / 60) + ':' + (s % 60 < 10 ? '0' : '') + (s % 60); }
  function osTick() {   /* tulis DOM cuma kalau detik berubah (1x/dtk) */
    if (!OS.on) return;
    var t = performance.now();
    osLabel('seq ' + OS.kind + ' ' + OS.i + '/' + OS.n + ' \u00b7 ' + OS.name + ' \u00b7 fase ' + osFmt(OS.phEnd - t) + ' \u00b7 sisa ' + osFmt(OS.totEnd - t), true);
  }
  function offSeqStop() {
    if (!OS.on) return;
    OS.on = false; clearTimeout(OS.tm); clearInterval(OS.iv);
    OFF_CUR = OFF_L.slice(); offApply(); window.__offPh = null; window.__offSkip = 0;
    window.__stSeg = /[?&]stseg=1(&|$)/.test(location.search) ? 1 : 0;
    osBox(false); osLabel('seq DIBATALKAN \u2014 dump hanya memuat fase yang sudah jalan', false);
  }
  function offSeqStart(kind, tok) {
    if (OS.on) return false;
    var PH, mm = /[?&]offms=(\d+)/.exec(location.search), msDef = 8000;
    if (kind === 'abab') {   /* v11.29i: tok = 'sglow' | 'sglow+score' (digabung dalam satu fase B) | 'sgs,sgm,sgl' (beberapa ABAB berurutan dalam SATU run). Label unik per token: A1_sglow / B1_sglow, run ulang token sama -> #2 */
      var groups = String(tok || 'sglow').split(',').map(function (g2) { return g2.split('+').filter(function (t) { return OFF_ALL.indexOf(t) >= 0; }); }).filter(function (g2) { return g2.length; });
      if (!groups.length) return false;
      var an = /[?&]abn=(\d+)/.exec(location.search), np = an ? Math.max(1, Math.min(6, +an[1])) : (groups.length > 1 ? 2 : 3), ii, gi;
      PH = []; window.__abUsed = window.__abUsed || {};
      for (gi = 0; gi < groups.length; gi++) {
        var nm = groups[gi].join('+'), uc = (window.__abUsed[nm] = (window.__abUsed[nm] || 0) + 1), sfx = '_' + nm + (uc > 1 ? '#' + uc : '');
        for (ii = 1; ii <= np; ii++) { PH.push(['A' + ii + sfx, []]); PH.push(['B' + ii + sfx, groups[gi]]); }
      }
      msDef = 10000; OS.ab = groups.map(function (g2) { return g2.join('+'); }).join(',');
    } else { kind = OS_SETS[kind] ? kind : 'blit'; PH = OS_SETS[kind]; OS.ab = null; }
    OS.ms = mm ? Math.max(3000, Math.min(60000, +mm[1])) : msDef;
    OS.on = true; OS.log = []; OS.kind = kind; OS.n = PH.length; OS.i = 0; OFF_MANAGE = true;
    OS.runs.push({ kind: kind, ab: OS.ab || null, t0: Math.round(performance.now()), phases: PH.length, ms: OS.ms, log: OS.log });   /* riwayat SEMUA run seq (urutan token) */
    window.__pbExt = performance.now() + PH.length * OS.ms + 6000;   /* jendela rekam bench diperpanjang sampai seq selesai */
    window.__stCnt = 1;   /* hitung bintang/halo/inti yang digambar per frame (murah) */
    if (kind === 'stars' || kind === 'sizes' || kind === 'plei') window.__stSeg = 1;
    if (kind === 'sizes') { try { if (typeof ST_C === 'object') { ST_C.f = 0; ST_C.n = [0, 0, 0]; ST_C.a = [0, 0, 0]; } } catch (eSt) {} }   /* penanda s.* aktif di semua fase seq stars (base ikut, jadi sebanding) */
    OS.totEnd = performance.now() + PH.length * OS.ms;
    osBox(true); try { if (window.__WH_AD && window.__WH_AD.collapse) window.__WH_AD.collapse(); } catch (eC) {}   /* panel lain dilipat selama seq */
    OS.iv = setInterval(osTick, 250);
    (function step() {
      if (!OS.on) return;
      if (OS.i >= PH.length) {
        clearInterval(OS.iv); OFF_CUR = OFF_L.slice(); offApply(); window.__offPh = null; window.__offSkip = 0; OS.on = false;
        osBox(false); osLabel('seq SELESAI \u2014 salin dump (POST COPY / SAVE) sekarang', false); return;
      }
      var ph = PH[OS.i++], t = performance.now(); OFF_CUR = ph[1].slice(); offApply(); window.__offPh = ph[0]; window.__offSkip = t + 1000;
      OS.name = ph[0]; OS.phEnd = t + OS.ms;
      OS.log.push([ph[0], ph[1].join('+') || '-', Math.round(t)]);
      osTick();
      OS.tm = setTimeout(step, OS.ms);
    })();
    return true;
  }
  window.__stSegOk = 1; window.__abOk = 1;
  window.__offSeqStart = offSeqStart; window.__offSeqStop = offSeqStop;
  window.__offSeqOn = function () { return OS.on; };
  (function () { var q = /[?&]offseq=(1|blit|layer|floor|stars|sizes|plei|abab)(&|$)/.exec(location.search); if (q) window.addEventListener('obs-entered', function () { setTimeout(function () { var am = /[?&]ab=([a-z+,]+)/.exec(location.search); offSeqStart(q[1] === '1' ? 'blit' : q[1], am ? am[1] : null); }, 6000); }, { once: true }); })();

  function pmOut() {
    var r1 = function (v) { return Math.round(v * 10) / 10; }, modes = {};
    Object.keys(PM.modes).forEach(function (k) {
      var m = PM.modes[k], s = m.smp.slice().sort(function (a, b) { return a - b; });
      var ds = m.ds.slice().sort(function (a, b) { return a - b; });
      modes[k] = { n: m.n, dtAvg: m.dn ? r1(m.dt / m.dn) : null, dtP50: ds.length ? r1(ds[Math.floor(ds.length * 0.5)]) : null, dtP95: ds.length ? r1(ds[Math.floor(ds.length * 0.95)]) : null, fps: m.dn ? r1(1000 / (m.dt / m.dn)) : null, haloN: m.sf ? r1(m.sg / m.sf) : null, coreN: m.sf ? r1(m.sc / m.sf) : null, haloPx2: m.sf ? Math.round(m.sga * 25 * 3.1416 / m.sf) : null, avgJs: r1(m.js / m.n), p95Js: r1(s[Math.floor(s.length * 0.95)] || 0), maxJs: r1(m.mx),
        seg: Object.keys(m.seg).map(function (q) { return [q, r1(m.seg[q][0] / m.n), r1(m.seg[q][1])]; }).sort(function (a, b) { return b[1] - a[1]; }).slice(0, window.__gpuP ? 28 : 14) };
    });
    var stc = null; try { if (typeof ST_C === 'object' && ST_C.f) stc = { frames: ST_C.f, stb: STB.slice(), '_cols': 'per frame: n = bintang digambar, haloPx2 = jumlah luas halo (pi*(5r)^2, px CSS) per ember s/m/l', n: ST_C.n.map(function (v) { return r1(v / ST_C.f); }), haloPx2: ST_C.a.map(function (v) { return Math.round(v * 25 * 3.1416 / ST_C.f); }) }; } catch (eSc) {}
    return { on: PM.on, stCnt: stc, abTok: OS.ab || null, perfHudActive: !!window.PERF, qOrder: PM.qo || null, off: window.__offL || null, offSeqRuns: OS.runs.length > 1 || (OS.runs[0] && OS.runs[0].kind === 'abab') ? OS.runs.map(function (q) { return { kind: q.kind, ab: q.ab, t0: q.t0, ms: q.ms, phases: q.log.map(function (p) { return p[0]; }) }; }) : null, offSeq: OS.log.length ? { cols: '[fase, lapisan mati, t ms]', kind: OS.kind, phases: OS.log, ms: OS.ms, selesai: !OS.on && OS.i >= OS.n } : null, firstFrames: PM.ff, '_cols': 'seg: [nama, rata2 ms/frame, max ms] (waktu sejak pmk sebelumnya); avgJs = rata2 total kerja JS frame', modes: modes, worst: PM.worst.slice().sort(function (a, b) { return b[2] - a[2]; }) };
  }
  /* v11.29p: setelan aktif yang mempengaruhi rasa halus (planet bands/rate/q, portal spin/alt/res) + ukuran kanvas hasilnya, supaya dump antar HP bisa dibandingkan tanpa menebak. */
  function cfgOut() {
    var o = {}, P = typeof PL3D_CFG !== 'undefined' ? PL3D_CFG : null, T = typeof PT3D_CFG !== 'undefined' ? PT3D_CFG : null;
    try { if (P) o.pl = { fps: P.fps, bands: P.bands, bandMin: P.bandMin, q: P.q, qSlow: P.qSlow, rwSlow: P.rwSlow, qEff: typeof pl3dQ === 'function' ? pl3dQ() : null, rw: typeof PL3D !== 'undefined' ? PL3D.rw : null, bmHi: typeof PL3D !== 'undefined' ? (PL3D.bmHi || 0) : null, bmAt: typeof PL3D !== 'undefined' ? (PL3D.bmAt || null) : null, bmAd: P.bmAdapt || null, rh: typeof PL3D !== 'undefined' ? PL3D.rh : null, PW: typeof PW !== 'undefined' ? PW : null, hint: typeof PL3D !== 'undefined' ? (PL3D.hint || 0) : null, hintAt: typeof PL3D !== 'undefined' ? (PL3D.hintAt || null) : null, rsl: typeof PL3D !== 'undefined' ? (PL3D.rsl || null) : null, plSt: window.__plSt || null, _rsl_cols: 'rsl = [abs ms, ms resize, rw, rh, FS.slow, hint]' }; } catch (e1) {}
    try { if (typeof AST3D_CFG !== 'undefined') o.ast = { sm: AST3D_CFG.smooth ? AST3D_CFG.smooth.on : null, rwSlow: AST3D_CFG.rwSlow, dprMax: AST3D_CFG.dprMax, pr: typeof AST3D !== 'undefined' ? AST3D.pr : null, pw: typeof AST3D !== 'undefined' ? AST3D.pw : null, ph: typeof AST3D !== 'undefined' ? AST3D.ph : null, W: typeof W !== 'undefined' ? W : null, H: typeof H !== 'undefined' ? H : null }; } catch (e3) {}
    try { if (T) o.pt = { spin: T.spin, alt: T.alt, ovAlt: T.ovAlt, resMin: T.resMin, resMax: T.resMax, dpr: typeof DPR !== 'undefined' ? DPR : null }; } catch (e2) {}
    return o;
  }
  function fsOut() {
    var f = typeof FS !== 'undefined' ? FS : null;
    return f ? { slow: f.slow, heavy: f.heavy, ema: Math.round(f.ema * 10) / 10, js: f.js == null ? null : Math.round(f.js * 10) / 10, wait: f.wait == null ? null : Math.round(f.wait * 10) / 10, wlog: f.wlog || null, '_wlog_cols': '[abs ms, wait ms (ema dt - ema js), js ms, ema dt ms] tiap ~2 dtk', mode: f.mode, why: f.why, hlog: f.hlog, '_hlog_cols': '[abs ms, 1=heavy ON/0=OFF, ema]' } : null;
  }
  document.addEventListener('DOMContentLoaded', function () { PB_FN.forEach(pbWrap); pmInstall(); });
  function pbSnapshot() {
    var tc = R.t.capsule, te = R.t.entered, tb = tc != null ? tc : (te != null ? te : 0), end = PB.tEnd != null ? PB.tEnd : Infinity;
    var inW = function (t) { return t >= tb && t <= end; };
    var rel = function (t) { return '+' + (Math.round(t - tb)); };
    var agg = Object.keys(PB.agg).filter(function (k) { return PB.agg[k].nPost; }).map(function (k) {
      var g = PB.agg[k]; return [k, g.nPost, Math.round(g.msPost), Math.round(g.maxPost * 10) / 10, g.first, g.last];
    }).sort(function (a, b) { return b[2] - a[2]; });
    var ricBy = {};
    PB.ric.forEach(function (r) { var g = ricBy[r[0]] || (ricBy[r[0]] = [0, 0, 0, 0]); g[0]++; g[1] += r[3]; if (r[3] > g[2]) g[2] = r[3]; if (r[5]) g[3]++; });
    var ricAgg = Object.keys(ricBy).map(function (k) { var g = ricBy[k]; return [k, g[0], Math.round(g[1]), Math.round(g[2] * 10) / 10, g[3]]; }).sort(function (a, b) { return b[2] - a[2]; });
    var lt = PB.lt.filter(function (x) { return inW(x[0]); }), loaf = PB.loaf.filter(function (x) { return inW(x[0]); });
    var wl = (window.__warmLog || []).filter(function (r) { return r[2] >= tb - 0; });
    var frames = Object.keys(PB.fr).map(function (k) { var b = PB.fr[k]; return [+k, b[0], b[1], b[2], b[3]]; });
    /* timeline gabungan (relatif kapsul) */
    var tl = [];
    PB.ev.forEach(function (e) { tl.push([e[1], 'fn   ' + e[0] + (e[3] ? '(' + e[3] + ')' : '') + ' ' + e[2] + 'ms']); });
    PB.ric.forEach(function (r) { if (r[3] >= 1) tl.push([r[2], 'rIC  ' + r[0] + ' ' + r[3] + 'ms' + (r[5] ? ' TMO' : '') + ' (tunggu ' + (r[2] - r[1]) + ', sisa ' + r[6] + ')']); });
    lt.forEach(function (x) { tl.push([x[0], 'LT   ' + x[1] + 'ms']); });
    loaf.forEach(function (x) { tl.push([x[0], 'LoAF ' + x[1] + 'ms blk ' + x[2] + ' | ' + x[4].map(function (s) { return s[0] + ':' + (s[1] || '-') + ' ' + s[2]; }).join(' ; ')]); });
    wl.forEach(function (r) { tl.push([r[2], 'warm ' + r[0] + ' selesai (' + r[3] + ') ' + (r[2] - r[1]) + 'ms']); });
    if (te != null) tl.push([te, '---- obs-entered ----']);
    tl.sort(function (a, b) { return a[0] - b[0]; });
    var tlTxt = tl.slice(0, 400).map(function (x) { return rel(x[0]) + '  ' + x[1]; });
    var tw = window.THREE_WARM, tq = window.__threeQ;
    var o = {
      kind: 'post-boot', url: location.href, qs: location.search, three: (window.THREE && window.THREE.REVISION) || null, at: new Date().toISOString(), nowMs: now(),
      t: { capsule: tc, blue: R.t.blue, entered: te, frame1: R.t.frame1, winStart: PB.t0 != null ? Math.round(PB.t0) : null, winEnd: PB.tEnd, pbMs: PB_MS, closed: PB.tEnd != null },
      bootInfo: window.__bootInfo || null,
      wrapped: PB.wrapped, missing: PB.missing,
      byFn: agg, '_byFn_cols': 'nama, jumlah, totalMs, maxMs, pertama, terakhir (abs ms)',
      ricSummary: { n: PB.ricN, totalMs: Math.round(PB.ricMs), cap: PB.ric.length >= 300 }, ricByOrigin: ricAgg, '_ricByOrigin_cols': 'file:baris, jumlah, totalMs, maxMs, timeout',
      longtasks: lt, loaf: loaf, '_loaf_cols': 'start, dur, blocking, renderDelay, [file, fn, ms] x3',
      framesPerSec: frames, '_framesPerSec_cols': 'detik sejak winStart, jumlah frame, max delta, >33.5ms, >50ms',
      mem: PB.mem, warmLog: wl,
      threeWarm: tw ? { total: tw.total, done: tw.done, busy: tw.busy, qlen: tw.q ? tw.q.length : null } : null,
      threeQWarm: tq && tq.warm ? { n: tq.warm.n, idleMs: Math.round(tq.warm.idleMs), cpuMs: Math.round(tq.warm.cpuMs), items: tq.warm.items } : null,
      timeline: tlTxt,
      pmk: pmOut(), fsState: fsOut(), cfg: cfgOut(), nebDbg: window.__nebDbg || null, '_nebDbg_cols': 'job: [ukuran base, y band, ms alokasi, ms getImageData, ms salin]; pf: ["pf", y band, ms, abs ms, boot3d.warm 0/1]',
      events: PB.ev.filter(function (e) { return inW(e[1]); }), '_events_cols': 'nama, start, ms, arg',
      ricRuns: PB.ric.filter(function (r) { return inW(r[2]); }), '_ricRuns_cols': 'asal, dijadwalkan, mulai, ms, timeoutOpt, didTimeout, timeRemaining'
    };
    return JSON.stringify(o);
  }
  window.__benchPost = pbSnapshot;
  function pbTxt(s) {
    var o = JSON.parse(s), out = ['BENCH POST-BOOT DUMP', 'url: ' + o.url, 'waktu: ' + o.at, 'three: ' + o.three, 't: ' + JSON.stringify(o.t), '', '== RINGKASAN fn (totalMs desc) =='];
    o.byFn.forEach(function (r) { out.push('  ' + r.join('  ')); });
    out.push('', '== RINGKASAN rIC per asal =='); o.ricByOrigin.forEach(function (r) { out.push('  ' + r.join('  ')); });
    out.push('', 'rIC total: ' + JSON.stringify(o.ricSummary), 'THREE_WARM: ' + JSON.stringify(o.threeWarm), '', '== TIMELINE (relatif kapsul, ms) ==');
    o.timeline.forEach(function (l) { out.push(l); });
    out.push('', '== DETAIL ==');
    Object.keys(o).forEach(function (k) {
      if (k === 'timeline' || k === 'byFn' || k === 'ricByOrigin') return;
      var v = o[k];
      if (Array.isArray(v)) { out.push(k + ' (' + v.length + '):'); v.forEach(function (r) { out.push('  ' + JSON.stringify(r)); }); }
      else if (v && typeof v === 'object') out.push(k + ': ' + JSON.stringify(v));
      else out.push(k + ': ' + v);
    });
    return out.join('\n');
  }

  document.addEventListener('DOMContentLoaded', function () {
    box = document.createElement('div'); box.id = '__bench_box';
    box.style.cssText = 'position:fixed;top:4px;left:4px;z-index:2147483647;background:rgba(0,0,0,.78);color:#7fffb0;font:10px/1.35 monospace;padding:5px 6px;border:1px solid #2a6;max-width:92vw;max-height:70vh;display:flex;flex-direction:column;pointer-events:none;';
    /* jangan tembus ke situs (06-interaction hit-test) */
    /* bubble (false): biarkan event sampai ke tombol di dalam box, tapi jangan naik ke document/situs */
    ['pointerdown', 'pointerup', 'touchstart', 'touchend', 'click', 'mousedown', 'mouseup'].forEach(function (evn) {
      box.addEventListener(evn, function (ev) { ev.stopPropagation(); }, false);
    });

    /* tombol di atas supaya selalu terlihat di landscape */
    var btnRow = document.createElement('div');
    btnRow.style.cssText = 'flex:0 0 auto;margin-bottom:4px;line-height:0;pointer-events:auto;';
    box.appendChild(btnRow);
    /* v11.29c: panel bisa dilipat (default terlipat jadi chip kecil). CSS: kelas .bc menyembunyikan teks/foot dan semua tombol selain .__bt */
    try {
      var bcSt = document.createElement('style'); bcSt.id = '__bench_bc_css';
      bcSt.textContent = '#__bench_box.bc>div:nth-child(n+2){display:none!important}#__bench_box.bc>div:first-child>button:not(.__bt){display:none!important}#__bench_box.bc{padding:2px 3px!important}#__bench_box.bc>div:first-child{margin-bottom:0!important}';
      document.head.appendChild(bcSt);
    } catch (eBc) {}
    box.classList.add('bc');
    var bt = document.createElement('button'); bt.className = '__bt'; bt.textContent = 'BENCH \u25B8';
    bt.style.cssText = 'pointer-events:auto;margin:2px 4px 2px 0;font:10px monospace;padding:3px 6px;display:inline-block;vertical-align:middle;';
    bt.onclick = function (ev) { ev.stopPropagation(); var c = box.classList.toggle('bc'); bt.textContent = c ? 'BENCH \u25B8' : 'BENCH \u25BE lipat'; };
    btnRow.appendChild(bt);

    var txt = document.createElement('div');
    /* default none: tidak nutupin situs; MAX mengaktifkan scroll */
    txt.style.cssText = 'flex:1 1 auto;overflow:hidden;white-space:pre-wrap;word-break:break-word;max-height:45vh;pointer-events:none;-webkit-overflow-scrolling:touch;';
    box.appendChild(txt);
    box._txt = txt;
    var panelExpanded = false;

    var foot = document.createElement('div');
    foot.style.cssText = 'flex:0 0 auto;margin-top:2px;color:#9f8;white-space:pre-wrap;';
    box.appendChild(foot);
    box._foot = foot;

    function btnStyle() {
      return 'pointer-events:auto;margin:2px 4px 2px 0;font:10px monospace;padding:3px 6px;display:inline-block;vertical-align:middle;';
    }
    function stamp() {
      var d = new Date(), z = function (n) { return (n < 10 ? '0' : '') + n; };
      return d.getFullYear() + z(d.getMonth() + 1) + z(d.getDate()) + '-' + z(d.getHours()) + z(d.getMinutes()) + z(d.getSeconds());
    }
    function toTxt(s) {
      var o = JSON.parse(s), out = ['BENCH DUMP', 'url: ' + location.href, 'waktu: ' + new Date().toISOString(), '', '== RINGKASAN ==', (box._txt ? box._txt.textContent : ''), '', '== DETAIL =='];
      Object.keys(o).forEach(function (k) {
        var v = o[k];
        if (Array.isArray(v)) { out.push(k + ' (' + v.length + '):'); v.forEach(function (r) { out.push('  ' + JSON.stringify(r)); }); }
        else if (v && typeof v === 'object') out.push(k + ': ' + JSON.stringify(v));
        else out.push(k + ': ' + v);
      });
      return out.join('\n');
    }
    /* fallback copy: textarea readonly + select (HP long-press / Ctrl+C) */
    function showCopyFallback(label, text) {
      try {
        var old = document.getElementById('__bench_copy_fallback');
        if (old) old.remove();
        var wrap = document.createElement('div');
        wrap.id = '__bench_copy_fallback';
        wrap.style.cssText = 'position:fixed;inset:8px;z-index:2147483647;background:rgba(0,0,0,.92);color:#7fffb0;padding:8px;display:flex;flex-direction:column;font:12px monospace;pointer-events:auto;';
        ['pointerdown', 'pointerup', 'touchstart', 'touchend', 'click', 'mousedown', 'mouseup'].forEach(function (evn) {
          wrap.addEventListener(evn, function (ev) { ev.stopPropagation(); }, false);
        });
        var h = document.createElement('div');
        h.textContent = label + ' — long-press / Ctrl+C, lalu tutup';
        h.style.cssText = 'margin-bottom:6px;flex:0 0 auto;';
        var ta = document.createElement('textarea');
        ta.readOnly = true;
        ta.value = text;
        ta.style.cssText = 'flex:1 1 auto;width:100%;background:#111;color:#7fffb0;border:1px solid #2a6;font:11px monospace;padding:6px;';
        var close = document.createElement('button');
        close.textContent = 'TUTUP';
        close.style.cssText = 'margin-top:6px;font:12px monospace;padding:6px 10px;flex:0 0 auto;';
        close.onclick = function (ev) { ev.stopPropagation(); wrap.remove(); };
        wrap.appendChild(h); wrap.appendChild(ta); wrap.appendChild(close);
        document.body.appendChild(wrap);
        ta.focus(); ta.select();
        try { ta.setSelectionRange(0, ta.value.length); } catch (e) {}
      } catch (e) {
        try { prompt(label, text.slice(0, 2000)); } catch (e2) {}
      }
    }
    function saveFile(name, text, mime) {
      try {
        var u = URL.createObjectURL(new Blob([text], { type: mime })), a = document.createElement('a');
        a.href = u; a.download = name; a.style.display = 'none'; document.body.appendChild(a); a.click();
        setTimeout(function () { URL.revokeObjectURL(u); a.remove(); }, 1500);
        return true;
      } catch (e) { return false; }
    }
    function tryShare(name, text, mime) {
      try {
        if (!navigator.share || !navigator.canShare) return Promise.resolve(false);
        var file = new File([text], name, { type: mime });
        var data = { files: [file], title: name };
        if (!navigator.canShare(data)) return Promise.resolve(false);
        return navigator.share(data).then(function () { return true; }).catch(function () { return false; });
      } catch (e) { return Promise.resolve(false); }
    }

    var b = document.createElement('button');
    b.textContent = 'COPY JSON';
    b.style.cssText = btnStyle();
    b.onclick = function (ev) {
      ev.stopPropagation();
      var s = snapshot();
      console.log('[bench]', s);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(s).then(function () {
          b.textContent = 'COPIED';
          setTimeout(function () { b.textContent = 'COPY JSON'; }, 1500);
        }, function () {
          showCopyFallback('COPY JSON', s);
        });
      } else {
        showCopyFallback('COPY JSON', s);
      }
    };
    btnRow.appendChild(b);

    [['SAVE JSON', 'json', 'application/json'], ['SAVE TXT', 'txt', 'text/plain']].forEach(function (c) {
      var x = document.createElement('button');
      x.textContent = c[0];
      x.style.cssText = btnStyle();
      x.onclick = function (ev) {
        ev.stopPropagation();
        var s = snapshot(), t = c[1] === 'json' ? JSON.stringify(JSON.parse(s), null, 2) : toTxt(s);
        var name = 'bench-' + stamp() + '.' + c[1];
        if (saveFile(name, t, c[2])) {
          x.textContent = 'SAVED';
          setTimeout(function () { x.textContent = c[0]; }, 1500);
        } else {
          showCopyFallback(c[0], t);
        }
      };
      btnRow.appendChild(x);
    });

    var sh = document.createElement('button');
    sh.textContent = 'SHARE';
    sh.style.cssText = btnStyle();
    sh.onclick = function (ev) {
      ev.stopPropagation();
      var s = snapshot();
      var pretty = JSON.stringify(JSON.parse(s), null, 2);
      var name = 'bench-' + stamp() + '.json';
      tryShare(name, pretty, 'application/json').then(function (ok) {
        if (ok) {
          sh.textContent = 'SHARED';
          setTimeout(function () { sh.textContent = 'SHARE'; }, 1500);
        } else {
          /* fallback: copy path */
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(pretty).then(function () {
              sh.textContent = 'COPIED';
              setTimeout(function () { sh.textContent = 'SHARE'; }, 1500);
            }, function () { showCopyFallback('SHARE / COPY', pretty); });
          } else {
            showCopyFallback('SHARE / COPY', pretty);
          }
        }
      });
    };
    btnRow.appendChild(sh);

    var mm = document.createElement('button');
    mm.textContent = 'MAX';
    mm.title = 'Expand/collapse text (scroll)';
    mm.style.cssText = btnStyle();
    mm.onclick = function (ev) {
      ev.stopPropagation();
      panelExpanded = !panelExpanded;
      if (panelExpanded) {
        txt.style.pointerEvents = 'auto';
        txt.style.overflow = 'auto';
        txt.style.maxHeight = '55vh';
        mm.textContent = 'MIN';
      } else {
        txt.style.pointerEvents = 'none';
        txt.style.overflow = 'hidden';
        txt.style.maxHeight = '45vh';
        txt.scrollTop = 0;
        mm.textContent = 'MAX';
      }
    };
    btnRow.appendChild(mm);

    /* v11.19: dump TERPISAH pasca-boot (warm/bake) */
    [['POST COPY', null], ['POST JSON', 'json'], ['POST TXT', 'txt']].forEach(function (c) {
      var x = document.createElement('button');
      x.textContent = c[0];
      x.style.cssText = btnStyle();
      x.onclick = function (ev) {
        ev.stopPropagation();
        var s = pbSnapshot();
        console.log('[bench-post]', s);
        if (c[1] == null) {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(s).then(function () { x.textContent = 'COPIED'; setTimeout(function () { x.textContent = c[0]; }, 1500); }, function () { showCopyFallback(c[0], s); });
          } else showCopyFallback(c[0], s);
          return;
        }
        var t = c[1] === 'json' ? JSON.stringify(JSON.parse(s), null, 2) : pbTxt(s), name = 'bench-post-' + stamp() + '.' + c[1];
        if (saveFile(name, t, c[1] === 'json' ? 'application/json' : 'text/plain')) { x.textContent = 'SAVED'; setTimeout(function () { x.textContent = c[0]; }, 1500); }
        else showCopyFallback(c[0], t);
      };
      btnRow.appendChild(x);
    });

    document.body.appendChild(box);
    mark('dcl');
    var blue = document.getElementById('boot-cap-blue');
    if (blue) blue.addEventListener('click', function () {
      blueAt = now(); mark('blue'); R.sfxAtBlue = sfxStates(); try { R.bgmAtBlue = { AMB: AMB.readyState, COLLAP: MUSIC_COLLAP.readyState, GARG: GARG.readyState }; } catch (e) {}
      var f0 = typeof lastFrameOK !== 'undefined' ? lastFrameOK : 0, changes = 0, last = f0;
      (function poll() {
        if (typeof lastFrameOK !== 'undefined' && lastFrameOK !== last) { last = lastFrameOK; changes++; if (changes >= 2) { mark('frame1'); return; } }
        if (now() - blueAt < 10000) requestAnimationFrame(poll);
      })();
      requestAnimationFrame(function () { requestAnimationFrame(function () { mark('raf2'); }); });
    }, true);
    paint();
  });

  window.addEventListener('load', function () {
    mark('load');
    /* v10: media element yang masih networkState===2 (LOADING) saat load fire */
    try {
      var medias = document.querySelectorAll('audio, video');
      var still = [], tot = 0;
      Array.prototype.forEach.call(medias, function (el) {
        tot++;
        if (el.networkState === 2) {
          var nm = el.id || el.src || el.currentSrc || el.className || 'anon';
          try { nm = String(nm).replace(/^.*\//, '').slice(0, 64); } catch (e) {}
          still.push(nm);
        }
      });
      /* SFX dibuat lewat new Audio() — tidak di DOM; sample objek global juga */
      var sfxStill = [], sfxTot = 0;
      try {
        if (typeof SFX !== 'undefined' && SFX) {
          Object.keys(SFX).forEach(function (k) {
            sfxTot++;
            var a = SFX[k];
            if (a && a.networkState === 2) sfxStill.push(k);
          });
        }
        ['AMB', 'MUSIC_COLLAP', 'GARG'].forEach(function (k) {
          try {
            var a = window[k];
            if (a && typeof a.networkState === 'number') {
              sfxTot++;
              if (a.networkState === 2) sfxStill.push('bgm:' + k);
            }
          } catch (e2) {}
        });
      } catch (e3) {}
      MEDIA_AT_LOAD = {
        total: tot,
        networkState2: still.length,
        names: still,
        sfxTotal: sfxTot,
        sfxNetworkState2: sfxStill.length,
        sfxNames: sfxStill
      };
    } catch (e) { MEDIA_AT_LOAD = { error: String(e) }; }
    paint();
  });

  document.addEventListener('pointerdown', function (ev) {
    if (box && box.contains(ev.target)) return; /* jangan hitung tap di panel bench */
    if (blueAt) {
      tapAt = now(); R.taps++;
      var st = sfxStates();
      if (R.tapLog.length < 40) R.tapLog.push([tapAt, tapAt - blueAt, st.metadata, st.playable]);
      paint();
    }
  }, true);

  /* --- auto-repeat: ?bench=1&runs=N → reload sendiri, tumpuk ringkasan di sessionStorage --- */
  (function () {
    var m = /[?&]runs=(\d+)/.exec(location.search);
    if (!m) return;
    var N = Math.max(1, Math.min(20, +m[1] || 1));
    var KEY = '__bench_runs';
    var RUN_KEY = '__bench_run_i';
    function getRunI() {
      try { return +(sessionStorage.getItem(RUN_KEY) || '0'); } catch (e) { return 0; }
    }
    function setRunI(i) {
      try { sessionStorage.setItem(RUN_KEY, String(i)); } catch (e) {}
    }
    function getAcc() {
      try { return JSON.parse(sessionStorage.getItem(KEY) || '[]'); } catch (e) { return []; }
    }
    function setAcc(a) {
      try { sessionStorage.setItem(KEY, JSON.stringify(a)); } catch (e) {}
    }
    /* Bugfix: reset accumulator di run pertama sequence (getRunI===0) supaya sequence baru tidak nyampur data lama */
    if (getRunI() === 0) setAcc([]);

    /* tunggu post-enter metrics (rafPost + microbenchEnd) sebelum snapshot.
       obs-entered dipicu enterObservatory() (tap / timeout maxMs), bukan saat capsule tampil.
       Poll singkat; fallback 15s setelah entered, atau 45s absolut dari navigasi. */
    var done = false;
    function takeAndAdvance() {
      if (done) return;
      done = true;
      try {
        var s = snapshot();
        var o = JSON.parse(s);
        var summary = {
          i: getRunI() + 1,
          t: new Date().toISOString(),
          capsule: o.t && o.t.capsule,
          bootToCapsule: o.bootToCapsule,
          load: o.t && o.t.load,
          longtaskPre: o.longtaskBeforeCapsule,
          loadingdone: o.loadingdone && o.loadingdone.n,
          layout: o.layout && { n: o.layout.n, ms: o.layout.ms, max: o.layout.max, fromLD: o.layout.fromLoadingdone && o.layout.fromLoadingdone.n },
          net: o.net,
          off: o.off,
          isRepeat: o.isRepeatVisit,
          finishGuess: o.finishGuess,
          threeRes: o.threeRes,
          microbench: o.microbench,
          microbenchEnd: o.microbenchEnd,
          microbenchDelta: o.microbenchDelta,
          rafStats: o.rafStats,
          rafPost: o.rafPost,
          vitals: o.vitals,
          gateAt: o.gateAt,
          hash: o.hash,
          ver: o.ver,
          glInfo: o.glInfo,
          device: o.device,
          glRenderer: o.glRenderer,
          hiddenDuringRun: o.hiddenDuringRun,
          hiddenMs: o.hiddenMs,
          entered: o.t && o.t.entered
        };
        var acc = getAcc();
        acc.push(summary);
        setAcc(acc);
        var next = getRunI() + 1;
        if (next < N) {
          setRunI(next);
          location.reload();
        } else {
          console.log('[bench] runs complete (' + N + ')', acc);
          try {
            var s2 = snapshot();
            var o2 = JSON.parse(s2);
            if (o2.runsAgg) console.log('[bench] runsAgg', o2.runsAgg);
          } catch (e2) {}
          try {
            if (box && box._foot) {
              box._foot.textContent = 'RUNS DONE ' + N + '/' + N + ' — lihat console / COPY JSON (runsPrev)';
            }
          } catch (e) {}
          setRunI(0); /* reset index; biarkan acc tetap sampai sequence berikutnya (yang akan setAcc([]) di run 0) */
        }
      } catch (e) { console.warn('[bench] runs error', e); }
    }

    function waitPostThenFinish() {
      if (done) return;
      var t0 = performance.now();
      var poll = setInterval(function () {
        if (done) { clearInterval(poll); return; }
        var hasPost = RAF_POST_STATS != null && MICRO_END != null;
        /* baca entered live — capsule trigger bisa jalan sebelum obs-entered */
        var enteredAt = (R.t && R.t.entered) || null;
        var sinceEntered = enteredAt != null ? (performance.now() - enteredAt) : 0;
        var absolute = performance.now() - t0;
        /* siap kalau post metrics ada, atau 15s setelah entered, atau 45s absolut (fallback keras) */
        if (hasPost || (enteredAt != null && sinceEntered >= 15000) || absolute >= 45000) {
          clearInterval(poll);
          takeAndAdvance();
        }
      }, 250);
    }

    var waiting = false;
    function maybeFinish() {
      if (done || waiting || !capDone) return;
      waiting = true;
      /* jangan snapshot dulu — tunggu entered + post sampling */
      waitPostThenFinish();
    }

    /* observe capsule (mulai menunggu post-enter) */
    var obs = new MutationObserver(function () {
      if (capDone) maybeFinish();
    });
    var ch2 = document.getElementById('boot-choices');
    if (ch2) obs.observe(ch2, { attributes: true, attributeFilter: ['class'] });
    /* fallback: kalau capsule sudah / akan muncul */
    setTimeout(function () { if (capDone) maybeFinish(); }, 25000);
    /* juga trigger dari obs-entered langsung */
    window.addEventListener('obs-entered', function () {
      setTimeout(function () { maybeFinish(); }, 0);
    }, { once: true });
  })();
})();
