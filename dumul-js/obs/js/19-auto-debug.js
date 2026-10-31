'use strict';
/**
 * 19-auto-debug.js — gate debug tunggal: pilih tes di panel, jalankan, export.
 *
 * NOL BIAYA untuk pengunjung biasa:
 *   - file ini TIDAK ada di SHELL service-worker.js (tidak di-precache),
 *   - index.html cuma punya loader kecil yang menyuntik file ini SETELAH window load,
 *     dan hanya kalau URL punya ?debug=1. Tanpa itu file ini tidak pernah diunduh.
 *   - gate di bawah dobel-cek: tanpa ?debug=1 (atau window.__WH_AD_FORCE) langsung return.
 *
 * Alur:
 *   buka  situs?debug=1  → tombol 🐞 kanan-bawah → panel pilih mode:
 *     Dive  → ?whperf=1  : auto dive wormhole OVERVIEW → sektor × N (tiap putaran balik ke overview dulu), simpan panel #whperf
 *     Probe → ?probe=1   : tangkap hasil PROBE (overview / sektor), set normal atau bio, + ?pin=1|2 (orbit portal dikunci)
 *     PERF  → ?perf=1    : snapshot overlay PERF; "Sweep PERF" menyapu semua PX_MODES otomatis (1 snapshot per mode)
 *               (PERF yang menyala dari localStorage dumul_perf=1 juga dikenali sebagai mode PERF)
 *   Override kualitas ?perf=high|low: baris "kualitas" di panel (auto/HIGH/LOW), ikut terbawa saat ganti mode.
 *   Mode dipilih = halaman reload dengan param yang pas (whperf/PERF/PROBE membaca
 *   URL saat load, jadi tidak bisa dinyalakan tanpa reload).
 *   Export: JSON / TXT (semua hasil), tombol Clr untuk reset.
*   UI minimal: panel emas PROBE disilent (tombol Hasil); #whperf dive auto-remove setelah rekam;
*     daftar hasil di tombol Log (hide default) — runtime cuma status + aksi.
 *
 * Posisi tombol: kanan-bawah, di BARIS ATAS tombol musik + cluster mode (observer / kamera / menu sektor),
 *   jadi tidak menimpa satupun. Mengikuti breakpoint & body.ls (translate --gut) yang sama dengan mereka.
 *
 * Pasang: dumul-js/obs/js/19-auto-debug.js + loader inline di index.html (setelah 18-tune3d.js).
 *   Bukan <script src> biasa dan TIDAK masuk SHELL service-worker.js (check-sky.js mengecualikannya).
 * Via console: set window.__WH_AD_FORCE = 1 dulu, baru paste file ini.
 */
(function () {
  if (window.__WH_AD) { try { window.__WH_AD.open(); } catch (e) {} return; }

  /* ---------- gate ---------- */
  var Q = '';
  try { Q = location.search || ''; } catch (e) {}
  function flag(k) { return new RegExp('[?&]' + k + '=1(&|$)').test(Q); }
  function param(k) {
    var m = new RegExp('[?&]' + k + '=([a-z0-9]+)(&|$)').exec(Q);
    return m ? m[1] : '';
  }
  function perfLS() { try { return localStorage.getItem('dumul_perf') === '1'; } catch (e) { return false; } }
  function perfGlobal() { try { return typeof PERF !== 'undefined' && !!PERF; } catch (e) { return false; } }
  var URL_MODE = flag('whperf') ? 'whperf' : flag('probe') ? 'probe' : flag('perf') ? 'perf' : '';
  /* PERF bisa menyala tanpa ?perf=1: localStorage dumul_perf=1 (flag PERF di 05-sector-ui.js) → tetap dianggap mode PERF */
  var PERF_FROM_LS = !URL_MODE && (perfLS() || perfGlobal());
  var MODE = URL_MODE || (PERF_FROM_LS ? 'perf' : '');
  if (!flag('debug') && !window.__WH_AD_FORCE) return;

  /* ---------- TRACE (PP-11): tangkap Long Animation Frames / longtask / resource script ----------
     Observer 'buffered' → data sejak navigasi tetap ikut walau file ini baru dimuat setelah window load (buffer browser maks ±200 entri).
     Penanda capsule/Blue dari performance.mark('obs-capsule'|'obs-blue') di 07-boot.js. Nol biaya tanpa ?debug=1. */
  var TR = { loaf: [], lt: [], paints: {}, sup: { loaf: 0, longtask: 0 } };
  function trR(x) { return Math.round(x || 0); }
  function trShort(u) { return String(u || '').replace(/^.*\//, '').replace(/\?.*$/, '') || '(inline)'; }
  function trPick(e) {
    var sc = [];
    (e.scripts || []).forEach(function (s) {
      sc.push({ u: trShort(s.sourceURL), f: s.sourceFunctionName || '', k: s.invokerType || '', i: trShort(s.invoker),
        s: trR(s.startTime), c: trR(s.executionStart - s.startTime), d: trR(s.duration), fl: trR(s.forcedStyleAndLayoutDuration) });
    });
    return { s: trR(e.startTime), d: trR(e.duration), b: trR(e.blockingDuration), rs: trR(e.renderStart), sl: trR(e.styleAndLayoutStart), sc: sc };
  }
  function trObs(type, fn) {
    try { new PerformanceObserver(function (l) { l.getEntries().forEach(fn); }).observe({ type: type, buffered: true }); return 1; } catch (e) { return 0; }
  }
  TR.sup.loaf = trObs('long-animation-frame', function (e) { TR.loaf.push(trPick(e)); });
  TR.sup.longtask = trObs('longtask', function (e) { TR.lt.push([trR(e.startTime), trR(e.duration)]); });
  trObs('paint', function (e) { TR.paints[e.name] = trR(e.startTime); });
  trObs('largest-contentful-paint', function (e) { TR.paints.LCP = trR(e.startTime); });
  function trMarks() {
    var m = {}, nav = null;
    try { nav = performance.getEntriesByType('navigation')[0]; } catch (e) {}
    if (nav) { m.dcl = trR(nav.domContentLoadedEventEnd); m.load = trR(nav.loadEventStart); }
    ['obs-capsule', 'obs-blue'].forEach(function (n) {
      try { var e = performance.getEntriesByName(n)[0]; if (e) m[n.slice(4)] = trR(e.startTime); } catch (e2) {}
    });
    return m;
  }
  function trScripts() {
    var out = [];
    try {
      performance.getEntriesByType('resource').forEach(function (e) {
        if (/\.js(\?|$)/.test(e.name)) out.push([trShort(e.name), trR(e.startTime), trR(e.responseStart), trR(e.responseEnd), e.transferSize | 0, e.decodedBodySize | 0]);
      });
    } catch (e) {}
    return out;
  }
  function traceSummary() {
    var marks = trMarks(), cap = marks.capsule == null ? 1e9 : marks.capsule, per = {};
    var tot = { frames: TR.loaf.length, ms: 0, blocking: 0, preFrames: 0, preMs: 0, preBlocking: 0 };
    TR.loaf.forEach(function (f) {
      tot.ms += f.d; tot.blocking += f.b;
      if (f.s < cap) { tot.preFrames++; tot.preMs += f.d; tot.preBlocking += f.b; }
      f.sc.forEach(function (s) {
        var key = s.u + '|' + s.k + '|' + s.f;
        var p = per[key] || (per[key] = { u: s.u, k: s.k, f: s.f, n: 0, dur: 0, cmp: 0, max: 0, forced: 0, pre: 0, at: s.s });
        p.n++; p.dur += s.d; p.cmp += s.c; p.forced += s.fl; if (s.d > p.max) p.max = s.d; if (s.s < cap) p.pre += s.d;
      });
    });
    var top = Object.keys(per).map(function (k) { return per[k]; }).sort(function (a, b) { return b.dur - a.dur; }).slice(0, 30);
    var heavy = TR.loaf.slice().sort(function (a, b) { return b.d - a.d; }).slice(0, 12);
    var ltPre = 0, ltPreN = 0, ltAll = 0;
    TR.lt.forEach(function (x) { ltAll += x[1]; if (x[0] < cap) { ltPre += x[1]; ltPreN++; } });
    return JSON.stringify({
      meta: { ua: navigator.userAgent, url: location.search, exportedAt: new Date().toISOString(), support: TR.sup,
        sw: navigator.serviceWorker && navigator.serviceWorker.controller ? 'controlled' : 'no-controller',
        net: (navigator.connection && navigator.connection.effectiveType) || 'n/a', cores: navigator.hardwareConcurrency, mem: navigator.deviceMemory },
      marks: marks, paints: TR.paints, totals: tot, longtask: { preCapsule: [ltPreN, ltPre], total: [TR.lt.length, ltAll] },
      perScript: top, heaviestFrames: heavy, scriptRes: trScripts(), longtasks: TR.lt.slice(0, 60)
    });
  }
  function traceJson() {
    var ev = [], pid = 1, marks = trMarks(), names = { 1: 'LoAF frames', 2: 'script (compile+exec)', 3: 'longtask', 4: 'script download', 5: 'marks' };
    Object.keys(names).forEach(function (t) { ev.push({ ph: 'M', name: 'thread_name', pid: pid, tid: +t, args: { name: names[t] } }); });
    ev.push({ ph: 'M', name: 'process_name', pid: pid, tid: 0, args: { name: 'obs trace' } });
    TR.loaf.forEach(function (f) {
      ev.push({ name: 'LoAF', cat: 'loaf', ph: 'X', ts: f.s * 1000, dur: f.d * 1000, pid: pid, tid: 1, args: { blocking: f.b, renderStart: f.rs, styleLayoutStart: f.sl } });
      f.sc.forEach(function (s) {
        ev.push({ name: s.u + (s.f ? ' ' + s.f : '') + ' [' + s.k + ']', cat: 'script', ph: 'X', ts: s.s * 1000, dur: s.d * 1000, pid: pid, tid: 2, args: { compileMs: s.c, forcedLayoutMs: s.fl, invoker: s.i } });
      });
    });
    TR.lt.forEach(function (x) { ev.push({ name: 'longtask', cat: 'longtask', ph: 'X', ts: x[0] * 1000, dur: x[1] * 1000, pid: pid, tid: 3 }); });
    trScripts().forEach(function (s) { ev.push({ name: s[0], cat: 'net', ph: 'X', ts: s[1] * 1000, dur: Math.max(1, s[3] - s[1]) * 1000, pid: pid, tid: 4, args: { ttfb: s[2] - s[1], bytes: s[4], decoded: s[5] } }); });
    Object.keys(marks).forEach(function (k) { ev.push({ name: k, ph: 'i', s: 'g', ts: marks[k] * 1000, pid: pid, tid: 5 }); });
    Object.keys(TR.paints).forEach(function (k) { ev.push({ name: k, ph: 'i', s: 'g', ts: TR.paints[k] * 1000, pid: pid, tid: 5 }); });
    return JSON.stringify({ traceEvents: ev, displayTimeUnit: 'ms' });
  }
  function traceCopy() {
    var s = traceSummary(), n = TR.loaf.length;
    try { navigator.clipboard.writeText(s).then(function () { log('trace summary disalin (' + n + ' frame)'); }, function () { prompt('Copy:', s); }); }
    catch (e) { prompt('Copy:', s); }
  }
  function traceSave() {
    try {
      var u = URL.createObjectURL(new Blob([traceJson()], { type: 'application/json' })), a = document.createElement('a');
      a.href = u; a.download = 'obs-trace-' + Date.now() + '.json'; document.body.appendChild(a); a.click(); a.remove();
      log('trace file disimpan (buka di ui.perfetto.dev / DevTools Performance)');
    } catch (e) { log('trace save gagal: ' + e.message); }
  }

  var MODES = [
    { id: 'whperf', label: 'Dive', hint: 'auto-dive wormhole overview → sektor (sama tiap putaran, balik ke overview di sela-sela), rekam panel whperf' },
    { id: 'probe', label: 'Probe', hint: 'diam di overview/sektor sampai PROBE selesai, hasil ditangkap otomatis' },
    { id: 'perf', label: 'PERF', hint: 'overlay PERF aktif; Snap = 1 snapshot, Sweep = semua mode PERF otomatis' }
  ];

  var CFG = {
    dives: 3, settleMs: 900, timeoutMs: 45000, startMs: 3000, preferCarry: true, alwaysSkipAsk: true, probePollMs: 800,
    ovWaitMs: 3000,           /* jeda di overview sebelum putaran berikutnya (setelah back HP) */
    secHoldMs: 800,           /* jeda singkat di dalam sektor sebelum back / lompat lanjut */
    sweepSettleMs: 1300,
    sweepMinN: 120,
    sweepTimeoutMs: 10000
  };
  /* indeks 0-based sektor yang dipilih untuk Loop 1 sektor (tombol 1..4 di UI) */
  var diveSecIdx = 0;

  var store = [], probeStore = [], perfStore = [];
  var running = false, stopReq = false, probeWatch = null, lastProbeKey = '', ui = null;

  /* ---------- util ---------- */
  function nowIso() { return new Date().toISOString(); }
  function dpr() { return Math.min(window.devicePixelRatio || 1, 3); }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function log(msg) {
    try { console.log('[wh-ad]', msg); } catch (e) {}
    if (ui && ui.status) ui.status.textContent = msg;
  }
  function busy() {
    var w = typeof WORMHOLE !== 'undefined' && WORMHOLE.busy;
    var s = typeof SECT !== 'undefined' && SECT.busy;
    return !!(w || s);
  }
  function waitIdle(ms) {
    ms = ms || CFG.timeoutMs;
    return new Promise(function (resolve, reject) {
      var t0 = performance.now();
      (function tick() {
        if (!busy()) return resolve();
        if (performance.now() - t0 > ms) return reject(new Error('timeout waitIdle ' + ms + 'ms'));
        setTimeout(tick, 120);
      })();
    });
  }
  function waitBusyStart(ms) {
    return new Promise(function (resolve, reject) {
      var t0 = performance.now();
      (function tick() {
        if (busy()) return resolve();
        if (performance.now() - t0 > ms) return reject(new Error('dive tidak mulai (' + ms + 'ms)'));
        setTimeout(tick, 60);
      })();
    });
  }
  function waitPerfPanel(ms) {
    ms = ms || 10000;
    return new Promise(function (resolve) {
      var t0 = performance.now();
      (function tick() {
        var el = document.getElementById('whperf');
        if (el && el.textContent && el.textContent.indexOf('whperf') >= 0) return resolve(el.textContent);
        if (performance.now() - t0 > ms) return resolve(null);
        setTimeout(tick, 200);
      })();
    });
  }
  /* ?perf=high|low (override kualitas, 01-core.js) = param TERPISAH dari ?perf=1 (overlay PERF) tapi namanya sama:
     keduanya ditulis sebagai dua param 'perf' (…&perf=1&perf=high). Regex situs (/[?&]perf=1(&|$)/ dan /[?&]perf=(high|low)/)
     membaca string query mentah, jadi dua-duanya tetap terbaca. */
  function qualityParam() {
    var m = /[?&]perf=(high|low)(&|$)/.exec(Q);
    return m ? m[1] : '';
  }
  /* extra: {k:v} param tambahan (nilai kosong = dilewati). extra.quality: 'high'|'low' set, '' hapus, tidak diisi = pertahankan
     override kualitas yang sekarang (kecuali mode===null / Matikan: bersih semua). */
  function urlFor(mode, extra) {
    var u = new URL(location.href), qv = (mode === null) ? '' : qualityParam();
    ['whperf', 'probe', 'perf', 'pset', 'pin', 'debug'].forEach(function (k) { u.searchParams.delete(k); });
    if (mode !== null) u.searchParams.set('debug', '1');
    if (mode) u.searchParams.set(mode, '1');
    if (extra) Object.keys(extra).forEach(function (k) {
      if (k === 'quality') { qv = extra[k] || ''; return; }
      if (extra[k]) u.searchParams.set(k, extra[k]);
    });
    if (qv === 'high' || qv === 'low') u.searchParams.append('perf', qv);
    return u.toString();
  }
  /* URL mode Probe dengan pset/pin yang dipertahankan kecuali di-override */
  function probeUrl(over) {
    var ps = param('pset'), pn = param('pin');
    var o = { pset: ps === 'bio' ? 'bio' : '', pin: (pn === '1' || pn === '2') ? pn : '' };
    Object.keys(over || {}).forEach(function (k) { o[k] = over[k]; });
    return urlFor('probe', o);
  }
  function go(url) { try { location.href = url; } catch (e) { log('gagal pindah: ' + e.message); } }

  /* ---------- sektor / dive ---------- */
  function validSectors() {
    if (typeof SECT === 'undefined' || !SECT.list) return [];
    return SECT.list.filter(function (s) { return s && s.ids && s.ids.length; });
  }
  function sectorByIndex(i) {
    var v = validSectors();
    if (!v.length) return null;
    i = ((i | 0) % v.length + v.length) % v.length;
    return v[i] || null;
  }
  function sectorLabel(s, i) {
    if (!s) return '#' + ((i | 0) + 1);
    return (i + 1) + ':' + (s.k || s.name || '?');
  }
  function diveTarget(pref) {
    var v = validSectors();
    if (!v.length) return null;
    if (pref && v.indexOf(pref) >= 0) return pref;
    var pick = sectorByIndex(diveSecIdx);
    if (pick) return pick;
    for (var i = 0; i < v.length; i++) if (v[i].bx != null && isFinite(v[i].bx)) return v[i];
    return v[0];
  }
  function stripWhperf() {
    try { var el = document.getElementById('whperf'); if (el) el.remove(); } catch (e) {}
  }
  /* Tutup lapisan UI yang bisa “mencuri” history.back() sebelum back sektor. */
  function closeUiLayers() {
    try {
      if (typeof SMENU !== 'undefined' && SMENU.open && typeof smenuClose === 'function') smenuClose();
    } catch (e0) {}
    try {
      var ob = document.getElementById('owl-backdrop'); if (ob) ob.click();
    } catch (e1) {}
    try {
      if (typeof bhTuneClose === 'function') bhTuneClose();
    } catch (e2) {}
    try {
      var mc = document.getElementById('music-close'); if (mc) mc.click();
    } catch (e3) {}
    try {
      if (typeof CAMERA_MODE !== 'undefined' && CAMERA_MODE && typeof setCameraMode === 'function') setCameraMode(false);
    } catch (e4) {}
  }
  /* Keluar sektor = jalur tombol BACK HP (history.back → popstate → sectToggle → sectZoomOut),
     BUKAN wormhole/portal. Dialog teleskop di-skip lewat LIS.auto sementara. */
  async function returnToOverview() {
    if (typeof SECT === 'undefined' || !SECT.cur) return;
    await waitIdle();
    stripWhperf();
    closeUiLayers();
    await sleep(120);

    var lisBefore = null;
    try { lisBefore = (typeof LIS !== 'undefined') ? !!LIS.auto : null; } catch (eL) {}
    try {
      if (lisBefore === false && typeof lisAutoSet === 'function') lisAutoSet(true);
    } catch (eA) {}

    var stillIn = true;
    try {
      history.back();
    } catch (eB) {
      /* fallback: sectZoomOut langsung (tanpa portal) */
      try {
        if (typeof lisDecide === 'function') {
          lisDecide(function () { if (typeof sectZoomOut === 'function') sectZoomOut(); }, false, !!CFG.preferCarry, false);
        } else if (typeof sectZoomOut === 'function') sectZoomOut();
      } catch (eZ) {}
    }

    try {
      await waitBusyStart(CFG.startMs);
    } catch (eS) {
      /* kadang back instan tanpa busy flag — cek SECT.cur saja */
    }
    await waitIdle();
    stillIn = !!(typeof SECT !== 'undefined' && SECT.cur);
    if (stillIn) {
      /* back tertelan layer lain / gagal: paksa zoom-out tanpa portal */
      try {
        if (typeof lisDecide === 'function') {
          lisDecide(function () { if (typeof sectZoomOut === 'function') sectZoomOut(); }, false, !!CFG.preferCarry, false);
        } else if (typeof sectZoomOut === 'function') sectZoomOut();
        await waitBusyStart(CFG.startMs);
        await waitIdle();
      } catch (eF) {}
    }
    try {
      if (lisBefore === false && typeof lisAutoSet === 'function') lisAutoSet(false);
    } catch (eR) {}
    stripWhperf();
    if (typeof SECT !== 'undefined' && SECT.cur) throw new Error('gagal balik ke overview (back HP)');
  }
  async function jumpToSector(s) {
    if (!s) throw new Error('sektor kosong');
    await waitIdle();
    ensureOverviewPositions();
    stripWhperf();
    if (typeof sectJumpTo !== 'function') throw new Error('sectJumpTo tidak ada');
    var ok = sectJumpTo(s, !!CFG.preferCarry, !!CFG.alwaysSkipAsk);
    if (ok === false) throw new Error('sectJumpTo ditolak');
    await waitBusyStart(CFG.startMs);
    await waitIdle();
    var panel = await waitPerfPanel(8000);
    stripWhperf();
    return panel;
  }
  async function ensureOnOverview() {
    await waitIdle();
    if (typeof SECT !== 'undefined' && SECT.cur) {
      log('balik overview (back HP)…');
      await returnToOverview();
      await sleep(CFG.settleMs);
    }
  }

  function ensureOverviewPositions() {
    try {
      if (typeof SECT !== 'undefined' && !SECT.cur && typeof drawSectorOverview === 'function') {
        drawSectorOverview(performance.now(), 0);
      }
    } catch (e) {}
  }
  function parsePanelHints(text) {
    var h = {};
    if (!text) return h;
    var m;
    if ((m = text.match(/sky frame\(\) >150ms[^\n]*/))) h.skyHeavy = m[0];
    if ((m = text.match(/terburuk:[^\n]*/))) h.worst = m[0];
    if ((m = text.match(/sectStep\(in\) ms:[^\n]*/))) h.sectStep = m[0];
    if ((m = text.match(/zoom\s+n=\d+[^\n]*/))) h.zoom = m[0];
    if ((m = text.match(/tunnel\s+n=\d+[^\n]*/))) h.tunnel = m[0];
    if ((m = text.match(/exit\s+n=\d+[^\n]*/))) h.exit = m[0];
    return h;
  }
  function snapshot(i, sector, panel) {
    return {
      i: i, ts: nowIso(), t: performance.now(),
      sector: sector ? (sector.k || sector.name || '?') : '?',
      phase: (typeof SECT !== 'undefined' && SECT.phase) || '?',
      cur: (typeof SECT !== 'undefined' && SECT.cur && (SECT.cur.k || SECT.cur.name)) || null,
      dpr: dpr(), url: String(location.href), ua: navigator.userAgent || '',
      whMk: (typeof window.__whMk === 'string') ? window.__whMk : null,
      panel: panel || null,
      hints: parsePanelHints(panel)
    };
  }

  async function runSeries() {
    /* default = loop 1 sektor terpilih (kompat tombol Dive×N lama) */
    return runLoopOne();
  }

  /* Loop 1 sektor: overview → sektor terpilih → back HP → tunggu ovWaitMs di overview → ulangi × dives */
  async function runLoopOne() {
    if (running) return log('sudah jalan…');
    if (MODE !== 'whperf') return log('pilih mode Dive dulu');
    if (typeof sectJumpTo !== 'function' || typeof SECT === 'undefined') return log('⚠️ sectJumpTo / SECT tidak ada');
    if (typeof WORMHOLE === 'undefined' || !WORMHOLE.supported) return log('⚠️ WORMHOLE tidak supported di device ini');
    var s = sectorByIndex(diveSecIdx);
    if (!s) return log('⚠️ sektor #' + (diveSecIdx + 1) + ' tidak ada');
    running = true; stopReq = false;
    store.length = 0;
    updateList();
    var name = s.k || s.name || '?';
    log('Loop ×' + CFG.dives + ' → sektor ' + (diveSecIdx + 1) + ' (' + name + ') · back HP · tunggu ' + (CFG.ovWaitMs / 1000) + 's ov');
    try {
      await ensureOnOverview();
      for (var i = 1; i <= CFG.dives; i++) {
        if (stopReq) { log('dihentikan (' + store.length + ' tersimpan)'); break; }
        log('siklus ' + i + '/' + CFG.dives + ' — overview → ' + name);
        await sleep(CFG.settleMs);
        ensureOverviewPositions();
        var panel = await jumpToSector(s);
        var snap = snapshot(i, s, panel);
        snap.leg = 'ov→sec·backHP';
        snap.cycle = i;
        store.push(snap);
        updateList();
        await sleep(CFG.secHoldMs);
        if (stopReq) break;
        log('siklus ' + i + ' — back HP → overview…');
        await returnToOverview();
        log('siklus ' + i + ' — tunggu ' + (CFG.ovWaitMs / 1000) + 's di overview…');
        await sleep(CFG.ovWaitMs);
      }
      if (!stopReq) log('selesai Loop ×' + store.length + ' (' + name + ') — Export');
    } catch (e) {
      log('error: ' + (e && e.message ? e.message : e));
      try { console.warn(e); } catch (e2) {}
    } finally {
      running = false;
    }
  }

  /* Loop all: overview → sec1 → sec2 → … → secN → back HP → tunggu ov → ulangi × dives */
  async function runLoopAll() {
    if (running) return log('sudah jalan…');
    if (MODE !== 'whperf') return log('pilih mode Dive dulu');
    if (typeof sectJumpTo !== 'function' || typeof SECT === 'undefined') return log('⚠️ sectJumpTo / SECT tidak ada');
    if (typeof WORMHOLE === 'undefined' || !WORMHOLE.supported) return log('⚠️ WORMHOLE tidak supported');
    var list = validSectors();
    if (!list.length) return log('⚠️ tidak ada sektor');
    running = true; stopReq = false;
    store.length = 0;
    updateList();
    log('Loop ALL ×' + CFG.dives + ' · ' + list.length + ' sektor · back HP · tunggu ' + (CFG.ovWaitMs / 1000) + 's ov');
    try {
      await ensureOnOverview();
      var n = 0;
      for (var c = 1; c <= CFG.dives; c++) {
        if (stopReq) break;
        log('putaran ' + c + '/' + CFG.dives + ' — mulai overview');
        await sleep(CFG.settleMs);
        ensureOverviewPositions();
        for (var si = 0; si < list.length; si++) {
          if (stopReq) break;
          var s = list[si];
          var nm = s.k || s.name || ('#' + (si + 1));
          log('putaran ' + c + ' · sektor ' + (si + 1) + '/' + list.length + ' → ' + nm);
          var panel = await jumpToSector(s);
          n++;
          var snap = snapshot(n, s, panel);
          snap.leg = 'all·sec' + (si + 1);
          snap.cycle = c;
          store.push(snap);
          updateList();
          await sleep(CFG.secHoldMs);
        }
        if (stopReq) break;
        log('putaran ' + c + ' — back HP → overview…');
        await returnToOverview();
        log('putaran ' + c + ' — tunggu ' + (CFG.ovWaitMs / 1000) + 's di overview…');
        await sleep(CFG.ovWaitMs);
      }
      if (!stopReq) log('selesai Loop ALL · ' + store.length + ' dive — Export');
    } catch (e) {
      log('error: ' + (e && e.message ? e.message : e));
      try { console.warn(e); } catch (e2) {}
    } finally {
      running = false;
    }
  }

  /* ---------- probe ----------
     Panel emas built-in (PROBE.box) DISILENCE: probe tetap jalan di background (?probe=1),
     tapi overlay tidak muncul otomatis. Hasil ditangkap ke probeStore; tampilkan lewat
     tombol "Hasil PROBE" di panel debug. */
  var probeUiShown = false;
  function hideGoldProbe() {
    try {
      if (typeof PROBE !== 'undefined' && PROBE && PROBE.box) {
        PROBE.box.style.display = 'none';
        PROBE.box.style.pointerEvents = 'none';
      }
    } catch (e) {}
  }
  function installProbeSilence() {
    if (window.__whProbeSilenced) return;
    function tryHook() {
      if (typeof probeShow !== 'function') return false;
      if (window.__whProbeSilenced) return true;
      window.__whProbeSilenced = true;
      var orig = probeShow;
      /* override global probeShow: hitung & simpan teks, JANGAN tampilkan panel emas */
      window.probeShow = function (t, fin) {
        try {
          /* jalankan logic asli (PROBE.txt, localStorage) tapi langsung hide box */
          orig(t, fin);
        } catch (e0) {}
        hideGoldProbe();
        if (fin) {
          try { captureProbeIfNew(); } catch (e1) {}
          log('probe selesai — ketuk Hasil / Export');
        } else if (t) {
          /* status jalan: cukup di bar status debug, bukan overlay emas */
          var short = String(t).split('\n')[0] || 'PROBE…';
          if (short.length > 64) short = short.slice(0, 61) + '…';
          log(short);
        }
      };
      hideGoldProbe();
      return true;
    }
    if (tryHook()) return;
    var n = 0, iv = setInterval(function () {
      n++;
      if (tryHook() || n > 40) clearInterval(iv);
    }, 250);
  }
  function readProbeText() {
    var t = '';
    try { if (typeof PROBE !== 'undefined' && PROBE && typeof PROBE.txt === 'string') t = PROBE.txt; } catch (e) {}
    if (!t) {
      try {
        t = localStorage.getItem('dumul_probe_last') || '';
        var ov = localStorage.getItem('dumul_probe_last_ov') || '';
        if (ov && (!t || ov.length > t.length)) t = ov;
      } catch (e2) {}
    }
    return t || '';
  }
  function probeCtxLabel() {
    try { if (PROBE && PROBE.ctx) return PROBE.ctx === 'ov' ? 'OVERVIEW' : 'SEKTOR'; } catch (e) {}
    return '?';
  }
  function captureProbeIfNew() {
    var t = readProbeText();
    if (!t || t.indexOf('HASIL PROBE') < 0) return false;
    var key = t.slice(0, 120) + '|' + t.length;
    if (key === lastProbeKey) return false;
    lastProbeKey = key;
    probeStore.push({ ts: nowIso(), ctx: probeCtxLabel(), dpr: dpr(), url: String(location.href), text: t });
    updateList();
    hideGoldProbe();
    log('probe tertangkap [' + probeStore[probeStore.length - 1].ctx + '] — Hasil / Export');
    return true;
  }
  function startProbeWatch() {
    installProbeSilence();
    if (probeWatch) return;
    probeWatch = setInterval(function () {
      try {
        captureProbeIfNew();
        hideGoldProbe();
      } catch (e) {}
    }, CFG.probePollMs);
  }
  function toggleProbeResult() {
    captureProbeIfNew();
    var t = '';
    if (probeStore.length) t = probeStore[probeStore.length - 1].text;
    if (!t) t = readProbeText();
    if (!t || t.indexOf('HASIL PROBE') < 0) {
      log('belum ada hasil probe — diam di ov/sektor sampai selesai');
      return;
    }
    if (!ui || !ui.viewer) return;
    probeUiShown = !probeUiShown;
    if (probeUiShown) {
      ui.viewer.textContent = t;
      ui.viewer.style.display = 'block';
      if (ui.btnHasil) ui.btnHasil.textContent = 'Tutup';
      log('hasil PROBE ditampilkan (scroll)');
    } else {
      ui.viewer.style.display = 'none';
      ui.viewer.textContent = '';
      if (ui.btnHasil) ui.btnHasil.textContent = 'Hasil';
      log('hasil PROBE disembunyikan');
    }
  }

  /* ---------- perf ---------- */
  function ppReady() { try { return typeof PP !== 'undefined' && !!(PP && PP.el); } catch (e) { return false; } }
  function perfModeNow() { try { return (typeof PX_MODES !== 'undefined' && PX_MODES[PP.mode | 0]) || '?'; } catch (e) { return '?'; } }
  function qualityNow() { try { return (typeof IS_POTATO !== 'undefined' && IS_POTATO) ? 'low' : 'high'; } catch (e) { return '?'; } }
  function ctxNow() {
    try { return SECT.on ? 'OVERVIEW' : 'SEKTOR' + (SECT.cur ? ' ' + (SECT.cur.k || SECT.cur.name || '') : ''); } catch (e) { return '?'; }
  }
  /* Baca ringkasan dari TEKS overlay ("[mode] … fps N int X ms (max M) js Y ms … jank>34ms: J/N").
     Teks dihitung overlay tepat sebelum jendela ukurnya di-reset (n>240), jadi lebih andal daripada membaca PP.n sesudahnya. */
  function parsePerfText(t) {
    if (!t) return null;
    var m = /^\[([^\]]+)\]/.exec(t),
        f = /fps\s+(\d+)\s+int\s+([\d.]+)ms\s+\(max\s+(\d+)\)\s+js\s+([\d.]+)ms/.exec(t),
        j = /jank>34ms:\s*(\d+)\/(\d+)/.exec(t);
    if (!f || !j) return null;
    return { mode: m ? m[1] : '?', fps: f[1], intMs: f[2], jsMs: f[4], imax: +f[3], jank: +j[1], n: +j[2], src: 'text' };
  }
  /* opt.text = paksa ringkasan dari teks overlay (dipakai sweep); opt.tag = label snapshot */
  function snapshotPerf(opt) {
    opt = (opt && typeof opt === 'object' && !opt.target) ? opt : {};   /* dipakai juga sebagai onclick (arg = event) */
    var panel = '', summary = {};
    if (!ppReady()) { log('⚠️ overlay PERF belum aktif (butuh mode PERF; overlay muncul ~1 dtk setelah load)'); return null; }
    try {
      panel = PP.el.textContent || '';
      var n = PP.n || 0;
      if (!opt.text && n >= 30) {
        summary = {
          n: n,
          fps: (1000 / (PP.isum / n)).toFixed(1),
          intMs: (PP.isum / n).toFixed(2),
          jsMs: (PP.jsum / n).toFixed(2),
          imax: PP.imax || 0, jank: PP.jank || 0,
          mode: perfModeNow(), src: 'PP'
        };
      } else {
        /* jendela PP baru di-reset (atau diminta dari teks) → pakai angka dari teks overlay */
        summary = parsePerfText(panel) || { n: n, fps: null, intMs: null, jsMs: null, imax: PP.imax || 0, jank: PP.jank || 0, mode: perfModeNow(), src: 'kosong' };
      }
    } catch (e2) {}
    var snap = { ts: nowIso(), dpr: dpr(), ctx: ctxNow(), quality: qualityNow(), tag: opt.tag || 'snap', url: String(location.href), summary: summary, panel: panel };
    perfStore.push(snap);
    updateList();
    log('perf snapshot #' + perfStore.length + ' [' + (summary.mode || '?') + ']');
    return snap;
  }
  function cyclePerfMode() { try { PP.el.click(); } catch (e) {} }   /* handler ketuk overlay situs: PP.mode++ → set PX.* → reset jendela */
  function waitPerfEl(ms) {
    return new Promise(function (resolve) {
      var t0 = performance.now();
      (function tick() {
        if (ppReady()) return resolve(true);
        if (performance.now() - t0 > ms) return resolve(false);
        setTimeout(tick, 150);
      })();
    });
  }
  /* tunggu teks overlay untuk mode `nm` dengan jendela ukur >= minN frame */
  function waitFreshPerf(nm, minN, ms) {
    return new Promise(function (resolve) {
      var t0 = performance.now();
      (function tick() {
        var p = ppReady() ? parsePerfText(PP.el.textContent || '') : null;
        if (p && p.mode === nm && p.n >= minN) return resolve(true);
        if (performance.now() - t0 > ms) return resolve(false);
        setTimeout(tick, 120);
      })();
    });
  }
  async function perfModeToZero() {
    var N = (typeof PX_MODES !== 'undefined' && PX_MODES.length) || 1;
    for (var g = 0; g < N && (PP.mode | 0) !== 0; g++) { cyclePerfMode(); await sleep(60); }
  }
  /* Sweep PERF: dari mode 'normal' ketuk overlay satu per satu sampai PX_MODES habis; tiap mode = settle → tunggu jendela ukur
     terisi → 1 snapshot. Berhenti di 'normal' (siklus penuh). Konteks (overview/sektor) = tempat kita berdiri saat dijalankan. */
  async function sweepPerf() {
    if (running) return log('sudah jalan…');
    if (MODE !== 'perf') return log('pilih mode PERF dulu');
    if (typeof PX_MODES === 'undefined' || !PX_MODES.length) return log('⚠️ PX_MODES tidak ada');
    running = true; stopReq = false;
    var done = 0, N = PX_MODES.length;
    try {
      log('sweep: tunggu overlay PERF…');
      if (!(await waitPerfEl(8000))) throw new Error('overlay PERF tidak muncul (loop frame belum jalan?)');
      if (busy()) { log('sweep: tunggu transisi selesai…'); await waitIdle(); }
      await perfModeToZero();
      for (var k = 0; k < N; k++) {
        if (stopReq) { log('sweep dihentikan (' + done + '/' + N + ')'); break; }
        var nm = PX_MODES[PP.mode | 0];
        log('sweep ' + (k + 1) + '/' + N + ' — ' + nm + '…');
        await sleep(CFG.sweepSettleMs);
        var fresh = await waitFreshPerf(nm, CFG.sweepMinN, CFG.sweepTimeoutMs);
        var snap = snapshotPerf({ text: true, tag: 'sweep' });
        if (snap) { done++; if (!fresh) snap.partial = true; }
        cyclePerfMode();   /* mode berikutnya (setelah mode terakhir → balik ke 'normal') */
        await sleep(80);
      }
      if (!stopReq) log('sweep selesai: ' + done + '/' + N + ' mode tersimpan — Export JSON/TXT');
    } catch (e) {
      log('error: ' + (e && e.message ? e.message : e));
      try { console.warn(e); } catch (e2) {}
    } finally {
      try { if (ppReady()) await perfModeToZero(); } catch (e3) {}   /* jangan tinggalkan situs di mode diagnosa (mis. SEMUA OFF) */
      running = false;
    }
  }

  /* ---------- export ---------- */
  function empty() { return !store.length && !probeStore.length && !perfStore.length; }
  function buildExportObj() {
    return {
      meta: {
        exportedAt: nowIso(), mode: MODE || '-', url: String(location.href), dpr: dpr(), ua: navigator.userAgent || '',
        dives: store.length, probes: probeStore.length, perfs: perfStore.length,
        quality: qualityNow(), qualityUrl: qualityParam() || null, perfFromLocalStorage: PERF_FROM_LS,
        pin: param('pin') || null, pset: param('pset') || null,
        cfg: { dives: CFG.dives, settleMs: CFG.settleMs, sweepSettleMs: CFG.sweepSettleMs, sweepMinN: CFG.sweepMinN }
      },
      runs: store, probes: probeStore, perfs: perfStore
    };
  }
  function download(filename, text, mime) {
    var blob = new Blob([text], { type: mime || 'text/plain' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      try { URL.revokeObjectURL(a.href); } catch (e) {}
      try { a.remove(); } catch (e2) {}
    }, 1500);
  }
  /* Nama file mengikuti ISI data (bukan selalu debug):
       probe-….txt / perf-….txt / dive-….txt
       probe+perf-….txt kalau digabung, dst. */
  function exportStem() {
    var k = [];
    if (probeStore.length) k.push('probe');
    if (perfStore.length) k.push('perf');
    if (store.length) k.push('dive');
    if (k.length) return k.join('+');
    if (MODE === 'probe') return 'probe';
    if (MODE === 'perf') return 'perf';
    if (MODE === 'whperf') return 'dive';
    return 'debug';
  }
  function buildTxtBody() {
    var m = buildExportObj().meta, L = [];
    L.push('=== debug export (' + exportStem() + ') ===');
    L.push('exportedAt: ' + m.exportedAt, 'mode: ' + m.mode, 'url: ' + m.url, 'dpr: ' + m.dpr);
    L.push('quality: ' + m.quality + (m.qualityUrl ? ' (?perf=' + m.qualityUrl + ')' : '') + (m.pin ? '  pin: ' + m.pin : '') + (m.pset ? '  pset: ' + m.pset : '') + (m.perfFromLocalStorage ? '  perf: dari localStorage' : ''));
    L.push('dives: ' + m.dives + '  probes: ' + m.probes + '  perfs: ' + m.perfs, '');
    store.forEach(function (r) {
      L.push('========== DIVE ' + r.i + ' @ ' + r.ts + ' → ' + r.sector + (r.leg ? ' (' + r.leg + ')' : '') + ' ==========');
      if (r.whMk) L.push('sectStep: ' + r.whMk);
      ['skyHeavy', 'worst', 'zoom', 'tunnel', 'exit'].forEach(function (k) { if (r.hints && r.hints[k]) L.push(r.hints[k]); });
      L.push('--- panel ---', r.panel || '(tidak ada #whperf)', '');
    });
    probeStore.forEach(function (p, i) {
      L.push('========== PROBE #' + (i + 1) + ' [' + p.ctx + '] @ ' + p.ts + ' ==========', p.text || '(kosong)', '');
    });
    perfStore.forEach(function (p, i) {
      L.push('========== PERF SNAP #' + (i + 1) + ' @ ' + p.ts + ' [' + (p.tag || 'snap') + (p.partial ? ', jendela ukur belum penuh' : '') + '] ==========');
      var s = p.summary || {};
      L.push('mode: ' + (s.mode || '?') + '  konteks: ' + (p.ctx || '?') + '  kualitas: ' + (p.quality || '?'));
      L.push('fps: ' + (s.fps || '?') + '  int: ' + (s.intMs || '?') + 'ms  js: ' + (s.jsMs || '?') + 'ms');
      L.push('imax: ' + (s.imax || 0) + '  jank: ' + (s.jank || 0) + '/' + (s.n || 0));
      L.push('--- panel ---', p.panel || '(kosong)', '');
    });
    return L.join('\n');
  }
  function exportJSON() {
    if (empty()) return log('belum ada data');
    var name = exportStem() + '-' + Date.now() + '.json';
    download(name, JSON.stringify(buildExportObj(), null, 2), 'application/json');
    log('download ' + name);
  }
  function exportTXT() {
    if (!empty()) captureProbeIfNew();
    if (empty()) return log('belum ada data');
    var name = exportStem() + '-' + Date.now() + '.txt';
    download(name, buildTxtBody(), 'text/plain');
    log('download ' + name);
  }
  /* satu tombol: TXT + JSON, stem sama */
  function exportAll() {
    if (!empty()) captureProbeIfNew();
    if (empty()) return log('belum ada data');
    var stem = exportStem() + '-' + Date.now();
    download(stem + '.txt', buildTxtBody(), 'text/plain');
    download(stem + '.json', JSON.stringify(buildExportObj(), null, 2), 'application/json');
    log('download ' + stem + '.txt + .json');
  }
  function clearAll() {
    store.length = 0; probeStore.length = 0; perfStore.length = 0; lastProbeKey = '';
    probeUiShown = false;
    if (ui && ui.viewer) { ui.viewer.style.display = 'none'; ui.viewer.textContent = ''; }
    if (ui && ui.btnHasil) ui.btnHasil.textContent = 'Hasil';
    updateList();
    log('cleared');
  }

  /* ---------- UI ---------- */
  function updateList() {
    if (!ui || !ui.list) return;
    if (ui.logShown === false) {
      ui.list.style.display = 'none';
      return;
    }
    ui.list.style.display = 'block';
    var parts = [];
    if (store.length) {
      parts.push(store.map(function (r) {
        return 'D#' + r.i + ' ' + r.sector + (r.hints && r.hints.skyHeavy ? ' ⚠' : '');
      }).join('\n'));
    }
    if (probeStore.length) {
      parts.push(probeStore.map(function (p, i) { return 'P#' + (i + 1) + ' ' + p.ctx; }).join('\n'));
    }
    if (perfStore.length) {
      parts.push(perfStore.map(function (p, i) {
        var s = p.summary || {};
        return 'F#' + (i + 1) + (s.mode ? ' [' + s.mode + ']' : '') + (s.fps ? ' ' + s.fps + 'fps' : '');
      }).join('\n'));
    }
    ui.list.textContent = parts.length ? parts.join('\n') : '(kosong)';
  }

  var BTN = 'background:#0e2430;color:#cfe;border:1px solid #2a6;border-radius:6px;padding:5px 8px;font:inherit;font-size:10px;cursor:pointer;pointer-events:auto;touch-action:manipulation;line-height:1.2';
  var BTN_ON = 'background:#1b6b55;color:#fff;border-color:#7fffd4;font-weight:700';

  function mk(tag, css, text) {
    var el = document.createElement(tag);
    if (css) el.style.cssText = css;
    if (text != null) el.textContent = text;
    return el;
  }
  function btn(label, onclick, on) {
    var b = mk('button', BTN + (on ? ';' + BTN_ON : ''), label);
    b.type = 'button';
    b.onclick = function (e) { e.stopPropagation(); onclick(); };
    return b;
  }

  /* posisi lewat stylesheet (bukan inline) supaya bisa pakai media query; angka diambil dari index.css:
     #music-toggle = right 12 / bottom 12 / 32px; #mode-cluster = bottom 12 (3 tombol, tumbuh ke kiri).
     Kita duduk satu baris di ATAS keduanya: bottom = 12 + 32 + 6. #music-player (z 12, bottom 58) menutupi kita
     saat dibuka — kita z 11 sehingga tidak pernah menutupi panel musik. */
  function addStyle() {
    if (document.getElementById('wh-ad-css')) return;
    var st = document.createElement('style');
    st.id = 'wh-ad-css';
    st.textContent =
      '#wh-autodive{position:fixed;right:12px;bottom:calc(50px + env(safe-area-inset-bottom,0px));z-index:11;' +
      'font:11px/1.35 ui-monospace,Menlo,Consolas,monospace;color:#b8fff0;pointer-events:auto;touch-action:manipulation;' +
      'user-select:none;-webkit-user-select:none;display:flex;flex-direction:column;align-items:flex-end}' +
      '@media (max-width:520px){#wh-autodive{right:10px;bottom:calc(49px + env(safe-area-inset-bottom,0px))}#wh-ad-fab{width:31px!important;height:31px!important}}' +
      '@media (orientation:landscape) and (max-height:520px){#wh-autodive{right:8px;bottom:calc(39px + env(safe-area-inset-bottom,0px))}#wh-ad-fab{width:28px!important;height:28px!important;font-size:13px!important}}' +
      'body.ls #wh-autodive{translate:var(--gut,0px) 0}' +
      'body.layout-edit #wh-autodive{display:none}';
    (document.head || document.documentElement).appendChild(st);
  }

  function open() {
    if (ui && ui.root && ui.root.parentNode) {
      ui.root.style.display = 'block';
      return;
    }
    if (!document.getElementById('wh-ad-css')) {
      var st = document.createElement('style');
      st.id = 'wh-ad-css';
      st.textContent =
        '#wh-autodive{position:fixed;right:12px;bottom:calc(50px + env(safe-area-inset-bottom,0px));z-index:11;' +
        'font:11px/1.35 ui-monospace,Menlo,Consolas,monospace;color:#b8fff0;pointer-events:auto;touch-action:manipulation}' +
        '@media (max-width:520px){#wh-autodive{right:10px;bottom:calc(49px + env(safe-area-inset-bottom,0px))}#wh-ad-fab{width:31px!important;height:31px!important}}' +
        '@media (orientation:landscape) and (max-height:520px){#wh-autodive{right:8px;bottom:calc(39px + env(safe-area-inset-bottom,0px))}#wh-ad-fab{width:28px!important;height:28px!important;font-size:13px!important}}' +
        'body.ls #wh-autodive{translate:var(--gut,0px) 0}' +
        'body.layout-edit #wh-autodive{display:none}';
      document.head.appendChild(st);
    }

    var root = document.createElement('div');
    root.id = 'wh-autodive';
    ['pointerdown', 'pointerup', 'touchstart', 'touchend', 'mousedown', 'click', 'wheel'].forEach(function (ev) {
      root.addEventListener(ev, function (e) { e.stopPropagation(); }, { passive: false });
    });

    var fab = mk('button', BTN + ';width:32px;height:32px;padding:0;font-size:15px;border-radius:5px;background:rgba(6,11,17,.34);border-color:rgba(110,229,255,.17);display:grid;place-items:center', '🐞');
    fab.id = 'wh-ad-fab';
    fab.type = 'button';
    fab.title = 'debug';

    var panel = mk('div',
      'display:none;min-width:min(260px,88vw);max-width:min(300px,92vw);padding:10px 12px;' +
      'background:rgba(0,10,18,.94);border:1px solid rgba(100,255,220,.32);border-radius:10px;' +
      'box-shadow:0 8px 28px rgba(0,0,0,.5)');

    var head = mk('div', 'display:flex;align-items:center;justify-content:space-between;gap:6px;margin-bottom:6px');
    head.appendChild(mk('div', 'font-weight:700;font-size:11px', 'debug'));
    head.appendChild(btn('✕', function () { expand(false); }));
    panel.appendChild(head);

    /* —— 2 mode utama —— */
    panel.appendChild(mk('div', 'opacity:.7;font-size:10px;margin-bottom:3px', 'mode:'));
    var modes = mk('div', 'display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px');
    [
      { id: 'probe', label: 'Probe' },
      { id: 'perf', label: 'PERF' }
    ].forEach(function (m) {
      modes.appendChild(btn(m.label, function () {
        if (running) return log('tunggu tes selesai');
        if (MODE === m.id) return;
        go(urlFor(m.id));
      }, MODE === m.id));
    });
    /* Dive tetap ada tapi sekunder (wormhole) */
    modes.appendChild(btn('Dive', function () {
      if (running) return log('tunggu tes selesai');
      if (MODE === 'whperf') return;
      go(urlFor('whperf'));
    }, MODE === 'whperf'));
    panel.appendChild(modes);

    var status = mk('div', 'opacity:.9;min-height:2.6em;margin-bottom:8px;font-size:10px;line-height:1.35', 'siap');
    panel.appendChild(status);

    /* aksi mode-spesifik (satu baris, ringkas) */
    var acts = mk('div', 'display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px');
    if (MODE === 'whperf') {
      /* pilih sektor 1..4 */
      var secRow = mk('div', 'display:flex;flex-wrap:wrap;align-items:center;gap:4px;margin-bottom:4px;width:100%');
      secRow.appendChild(mk('span', 'opacity:.7;font-size:10px', 'sektor:'));
      var secBtns = [];
      var vsec = validSectors();
      var nSec = Math.max(4, vsec.length || 4);
      function paintSec() {
        secBtns.forEach(function (b, i) {
          var on = i === diveSecIdx;
          b.style.background = on ? 'rgba(80,200,180,.28)' : '';
          b.style.borderColor = on ? 'rgba(120,255,220,.55)' : '';
        });
      }
      for (var si = 0; si < Math.min(4, nSec); si++) {
        (function (idx) {
          var lab = String(idx + 1);
          try {
            if (vsec[idx] && (vsec[idx].k || vsec[idx].name))
              lab = (idx + 1) + '';
          } catch (e) {}
          var b = btn(lab, function () {
            diveSecIdx = idx;
            paintSec();
            var s = sectorByIndex(idx);
            log('sektor ' + (idx + 1) + (s ? ' (' + (s.k || s.name) + ')' : ''));
          }, idx === diveSecIdx);
          secBtns.push(b);
          secRow.appendChild(b);
        })(si);
      }
      paintSec();
      acts.appendChild(secRow);

      /* jumlah siklus */
      var nRow = mk('div', 'display:flex;flex-wrap:wrap;align-items:center;gap:4px;margin-bottom:4px;width:100%');
      nRow.appendChild(mk('span', 'opacity:.7;font-size:10px', 'siklus:'));
      var nLab = mk('span', 'font-size:10px;opacity:.9', '×' + CFG.dives);
      [['−', -1], ['+', 1]].forEach(function (p) {
        nRow.appendChild(btn(p[0], function () {
          var n = CFG.dives + p[1];
          if (n < 1) n = 1;
          if (n > 20) n = 20;
          CFG.dives = n;
          nLab.textContent = '×' + CFG.dives;
        }));
      });
      nRow.appendChild(nLab);
      acts.appendChild(nRow);

      acts.appendChild(btn('Loop', function () { runLoopOne(); }));
      acts.appendChild(btn('Loop ALL', function () { runLoopAll(); }));
      acts.appendChild(btn('Stop', function () { if (running) { stopReq = true; log('stop…'); } }));
    } else if (MODE === 'probe') {
      acts.appendChild(btn('set normal', function () { go(probeUrl({ pset: '' })); }, param('pset') !== 'bio'));
      acts.appendChild(btn('set bio', function () { go(probeUrl({ pset: 'bio' })); }, param('pset') === 'bio'));
    } else if (MODE === 'perf') {
      acts.appendChild(btn('Snap', function () { snapshotPerf(); }));
      acts.appendChild(btn('Sweep', sweepPerf));
      acts.appendChild(btn('Stop', function () { if (running) { stopReq = true; log('stop…'); } }));
    } else {
      acts.appendChild(mk('span', 'opacity:.65;font-size:10px', 'pilih Probe atau PERF'));
    }
    if (acts.childNodes.length) panel.appendChild(acts);

    /* Trace (PP-11): selalu tersedia, apa pun modenya */
    var trRow = mk('div', 'display:flex;flex-wrap:wrap;align-items:center;gap:4px;margin-bottom:6px');
    trRow.appendChild(mk('span', 'opacity:.7;font-size:10px', 'trace:'));
    trRow.appendChild(btn('Copy', traceCopy));
    trRow.appendChild(btn('Save', traceSave));
    panel.appendChild(trRow);

    /* —— 2 tombol utama: Hasil + Export —— */
    var main = mk('div', 'display:flex;flex-wrap:wrap;gap:6px;margin-bottom:6px');
    var btnHasil = btn('Hasil', function () {
      /* Probe: tampilkan laporan. PERF/Dive: tampilkan Log ringkas. */
      if (MODE === 'probe' || probeStore.length) {
        toggleProbeResult();
        if (ui.btnHasil) ui.btnHasil.textContent = probeUiShown ? 'Tutup' : 'Hasil';
        return;
      }
      ui.logShown = !ui.logShown;
      updateList();
      if (ui.btnHasil) ui.btnHasil.textContent = ui.logShown ? 'Tutup' : 'Hasil';
      if (ui.logShown && empty()) log('belum ada data — jalankan tes dulu');
    });
    var btnExport = btn('Export', exportAll);
    main.appendChild(btnHasil);
    main.appendChild(btnExport);
    panel.appendChild(main);

    var foot = mk('div', 'display:flex;flex-wrap:wrap;gap:4px;margin-bottom:4px');
    foot.appendChild(btn('Clr', clearAll));
    foot.appendChild(btn('Matikan', function () { go(urlFor(null)); }));
    panel.appendChild(foot);

    var list = mk('pre', 'margin:0;max-height:5.5em;overflow:auto;opacity:.88;white-space:pre-wrap;font-size:10px;pointer-events:auto;display:none', '(kosong)');
    panel.appendChild(list);

    var viewer = mk('pre',
      'display:none;margin:6px 0 0;max-height:min(38vh,280px);overflow:auto;' +
      'opacity:.95;white-space:pre-wrap;font-size:9px;line-height:1.35;' +
      'padding:6px 7px;border-radius:6px;border:1px solid rgba(255,210,127,.35);' +
      'background:rgba(2,8,14,.92);color:#ffd27f;pointer-events:auto', '');
    panel.appendChild(viewer);

    root.appendChild(panel);
    root.appendChild(fab);
    ui = {
      root: root, status: status, list: list, panel: panel, fab: fab,
      viewer: viewer, btnHasil: btnHasil, btnProbeRes: btnHasil, logShown: false
    };

    function expand(on) {
      panel.style.display = on ? 'block' : 'none';
      fab.style.display = on ? 'none' : 'grid';
    }
    fab.onclick = function (e) { e.stopPropagation(); expand(true); };
    ui.expand = expand;

    document.body.appendChild(root);
    expand(true);
    updateList();
    installProbeSilence();
    if (MODE === 'probe') startProbeWatch();
    else if (MODE === 'whperf') {
      try { var w0 = document.getElementById('whperf'); if (w0) w0.remove(); } catch (e0) {}
    }

    var boot = {
      whperf: 'Dive — pilih sektor · Loop / Loop ALL · back HP · Export',
      probe: 'PROBE silent — diam sampai selesai → Hasil / Export',
      perf: 'Snap sekali atau Sweep semua mode → Export'
    };
    log(MODE ? boot[MODE] : 'pilih Probe atau PERF');
  }

  window.__WH_AD = {
    open: open,
    run: runSeries,
    runLoopOne: runLoopOne,
    runLoopAll: runLoopAll,
    snapPerf: snapshotPerf,
    sweepPerf: sweepPerf,
    captureProbe: captureProbeIfNew,
    exportJSON: exportJSON,
    exportTXT: exportTXT,
    exportAll: exportAll,
    traceSummary: traceSummary,
    traceCopy: traceCopy,
    traceSave: traceSave,
    cfg: CFG,
    mode: MODE,
    get store() { return store.slice(); },
    get probes() { return probeStore.slice(); },
    get perfs() { return perfStore.slice(); },
    stop: function () { stopReq = true; if (probeWatch) { clearInterval(probeWatch); probeWatch = null; } running = false; }
  };

  if (document.body) open();
  else document.addEventListener('DOMContentLoaded', open);
})();
