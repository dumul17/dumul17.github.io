'use strict';
/* BENCH v11.11 (?bench=1) — read-only: tidak mengubah perilaku boot. Hanya aktif kalau URL punya ?bench=1. Hapus blok ini setelah selesai ukur.
   v10: flag/build hash + isRepeatVisit; net rtt/downlink + resource detail (three + audio TTFB/size);
   gate timestamps (pageReadyAt/modsAt/warmOkAt/bgmOkAt/sfxOkAt); glLabel; media networkState@load;
   loaf aggregate by fn; microbench + battery + memory + contextlost; pV series + rAF deltas; auto-repeat ?runs=N.
   v11: post-enter rAF (p50/p95/p99 + dropped%); renderer.info per label; memory timeline (start/capsule/3d/30s);
   LCP/CLS/FCP; device info (cores/mem/dpr/viewport/GL_RENDERER); visibility flag; multi-run median/min/max;
   microbench ulang di akhir (thermal/throttle delta). */
(function () {
  if (!/[?&]bench=1(&|$)/.test(location.search)) return;
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
            if (fill && fill.style && fill.style.width) {
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
    x.push('BENCH v11.11 ms (sejak navigasi)');
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

    R.bootTimeout = !!window.__bootTimeout; R.bootFinish = window.__bootFinish || null; R.warmConc = window.__warmConc != null ? window.__warmConc : null; R.ca = window.__ca != null ? window.__ca : null;   /* pass 11: tercatat di JSON supaya run ?nolive=1 dan normal bisa dibedakan */
    R.bootInfo = window.__bootInfo || R.bootInfo || null;   /* v147: warmAt, warmTrig, visAt, sfxViaCap, bar @capsule */
    try { R.nolive = /[?&]nolive=1(&|$)/.test(location.search); } catch (eNl) { R.nolive = null; }
    R.evt = EVT; /* [event, start, inputDelay, processing, total] untuk event >=100ms (klik Blue dll) */
    R.ltTop = LT.slice().sort(function (a, b) { return b[1] - a[1]; }).slice(0, 10); /* [startTime, durasi] terpanjang; bandingkan dgn t.capsule/blue/frame1 dan marks */
    try { var m0 = performance.getEntriesByName('obs-t0')[0], mw = performance.getEntriesByName('obs-warm')[0]; R.t0Start = m0 ? Math.round(m0.startTime) : null; R.warmStart = mw ? Math.round(mw.startTime) : null; R.t0mode = /[?&]legacy=1/.test(location.search) ? 'legacy' : (/[?&]t0=capsule/.test(location.search) ? 'capsule' : 'dcl'); } catch (e) {}
    R.longtaskBeforeCapsule = { n: ltN, ms: Math.round(lt) };
    R.longtaskTotal = { n: ltAllN, ms: Math.round(ltAll) };

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

    R.qs = location.search; R.ws = window.__ws != null ? window.__ws : null; R.envsz = window.__envsz != null ? window.__envsz : null;   /* v11: dump self-describing (flag URL + status irisan) */
    R.ds = window.__ds != null ? window.__ds : null; R.denv = window.__denv != null ? window.__denv : null; R.dmf = window.__dmf != null ? window.__dmf : null; R.senv = window.__senv != null ? window.__senv : null; R.threeQ = window.__threeQ ? (function(q){var w=q.warm;return {n:q.n,runMs:Math.round(q.runMs),waitMs:Math.round(q.waitMs),waitMax:Math.round(q.waitMax),tmo:q.tmo,turns:q.turns,warm:{n:w.n,idleMs:Math.round(w.idleMs),cpuMs:Math.round(w.cpuMs),sl:w.sl,gapMs:Math.round(w.gapMs),items:w.items}};})(window.__threeQ) : null;   /* v11.11: pencatat giliran THREE_Q + THREE_WARM (12-ast3d v20) */ R.smf = window.__smf != null ? window.__smf : null; R.dr3dT = window.__dr3dT || null; R.ss = window.__ss != null ? window.__ss : null; R.scp3dT = window.__scp3dT || null; R.ps = window.__ps != null ? window.__ps : null; R.pt3dT = window.__pt3dT || null; R.pl3dT = window.__pl3dT || null;
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
    R.sfxPar = window.__sfxPar != null ? window.__sfxPar : null;
    R.isRepeatVisit = IS_REPEAT;
    R.bootRepeatFlag = IS_REPEAT; /* kompat */

    /* v10: resource timing detail — three.module + audio (named objects) */
    try {
      var rs = performance.getEntriesByType('resource');
      R.res = rs.length;
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
          initiatorType: e.initiatorType || null
        };
        if (/\.opus|\.mp3|\.ogg|\.wav|audio\//i.test(e.name) || /sfx|bgm|amb|garg|collap/i.test(name)) {
          R.aud.push(obj);
        }
        if (/three\.(module|core)/i.test(name) || /three\.module\.r\d+/i.test(e.name)) {
          if (!R.threeRes) R.threeRes = obj;
          else if (!Array.isArray(R.threeRes)) R.threeRes = [R.threeRes, obj];
          else R.threeRes.push(obj);
        }
      });
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

  document.addEventListener('DOMContentLoaded', function () {
    box = document.createElement('div');
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
          net: o.net,
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
