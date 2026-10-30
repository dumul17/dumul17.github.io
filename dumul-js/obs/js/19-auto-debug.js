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
 *     Dive  → ?whperf=1  : auto dive wormhole antar sektor × N, simpan panel #whperf
 *     Probe → ?probe=1   : tangkap hasil PROBE (overview / sektor), set normal atau bio
 *     PERF  → ?perf=1    : snapshot overlay PERF
 *   Mode dipilih = halaman reload dengan param yang pas (whperf/PERF/PROBE membaca
 *   URL saat load, jadi tidak bisa dinyalakan tanpa reload).
 *   Export: JSON / TXT (semua hasil), tombol Clr untuk reset.
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
  var MODE = flag('whperf') ? 'whperf' : flag('probe') ? 'probe' : flag('perf') ? 'perf' : '';
  if (!flag('debug') && !window.__WH_AD_FORCE) return;

  var MODES = [
    { id: 'whperf', label: 'Dive', hint: 'auto-dive wormhole antar sektor, rekam panel whperf' },
    { id: 'probe', label: 'Probe', hint: 'diam di overview/sektor sampai PROBE selesai, hasil ditangkap otomatis' },
    { id: 'perf', label: 'PERF', hint: 'overlay PERF aktif; tekan Snap untuk simpan snapshot' }
  ];

  var CFG = { dives: 3, settleMs: 900, timeoutMs: 45000, startMs: 3000, preferCarry: true, alwaysSkipAsk: true, probePollMs: 800 };

  var store = [], probeStore = [], perfStore = [];
  var running = false, probeWatch = null, lastProbeKey = '', ui = null;

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
  function urlFor(mode, extra) {
    var u = new URL(location.href);
    ['whperf', 'probe', 'perf', 'pset', 'pin', 'debug'].forEach(function (k) { u.searchParams.delete(k); });
    if (mode !== null) u.searchParams.set('debug', '1');
    if (mode) u.searchParams.set(mode, '1');
    if (extra) Object.keys(extra).forEach(function (k) { u.searchParams.set(k, extra[k]); });
    return u.toString();
  }
  function go(url) { try { location.href = url; } catch (e) { log('gagal pindah: ' + e.message); } }

  /* ---------- sektor / dive ---------- */
  function validSectors() {
    if (typeof SECT === 'undefined' || !SECT.list) return [];
    return SECT.list.filter(function (s) { return s && s.ids && s.ids.length; });
  }
  function nextSector() {
    var v = validSectors();
    if (!v.length) return null;
    var cur = SECT.cur;
    if (!cur) {
      for (var i = 0; i < v.length; i++) if (v[i].bx != null && isFinite(v[i].bx)) return v[i];
      return v[0];
    }
    if (v.length < 2) return null;
    var k = v.indexOf(cur);
    return v[(k + 1) % v.length];
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
    if (running) return log('sudah jalan…');
    if (MODE !== 'whperf') return log('pilih mode Dive dulu');
    if (typeof sectJumpTo !== 'function' || typeof SECT === 'undefined') return log('⚠️ sectJumpTo / SECT tidak ada');
    if (typeof WORMHOLE === 'undefined' || !WORMHOLE.supported) return log('⚠️ WORMHOLE tidak supported di device ini');
    running = true;
    store.length = 0;
    updateList();
    /* sectJumpTo(...,always=true) menyalakan & MENYIMPAN pengaturan lis-auto → kembalikan di akhir */
    var lisBefore = (typeof LIS !== 'undefined') ? !!LIS.auto : null;
    try {
      for (var i = 1; i <= CFG.dives; i++) {
        log('dive ' + i + '/' + CFG.dives + ' — tunggu idle…');
        await waitIdle();
        await sleep(CFG.settleMs);
        ensureOverviewPositions();
        var s = nextSector();
        if (!s) throw new Error('tidak ada sektor tujuan yang valid');
        var old = document.getElementById('whperf');
        if (old) old.remove();   /* supaya panel yang dibaca pasti milik dive ini */
        log('dive ' + i + ' → ' + (s.k || s.name || '?'));
        var ok = sectJumpTo(s, !!CFG.preferCarry, !!CFG.alwaysSkipAsk);
        if (ok === false) throw new Error('sectJumpTo ditolak (busy / sektor kosong)');
        await waitBusyStart(CFG.startMs);
        log('dive ' + i + ' — berjalan…');
        await waitIdle();
        var panel = await waitPerfPanel(10000);
        var snap = snapshot(i, s, panel);
        store.push(snap);
        updateList();
        log('dive ' + i + ' tersimpan' + (panel ? '' : ' (panel whperf tidak muncul)') + (snap.hints.skyHeavy ? ' · ada sky>150ms' : ''));
        await sleep(CFG.settleMs);
      }
      log('selesai ' + store.length + ' dive — Export JSON/TXT');
    } catch (e) {
      log('error: ' + (e && e.message ? e.message : e));
      try { console.warn(e); } catch (e2) {}
    } finally {
      running = false;
      try {
        if (lisBefore === false && LIS.auto && typeof lisAutoSet === 'function') lisAutoSet(false);
      } catch (e3) {}
    }
  }

  /* ---------- probe ---------- */
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
    log('probe tertangkap [' + probeStore[probeStore.length - 1].ctx + ']');
    return true;
  }
  function startProbeWatch() {
    if (probeWatch) return;
    probeWatch = setInterval(function () { try { captureProbeIfNew(); } catch (e) {} }, CFG.probePollMs);
  }

  /* ---------- perf ---------- */
  function snapshotPerf() {
    var hasEl = false, panel = '', summary = {};
    try { hasEl = typeof PP !== 'undefined' && !!(PP && PP.el); } catch (e) {}
    if (!hasEl) { log('⚠️ overlay PERF belum aktif (butuh mode PERF)'); return null; }
    try {
      panel = PP.el.textContent || '';
      var n = PP.n || 0;
      summary = {
        n: n,
        fps: n ? (1000 / (PP.isum / n)).toFixed(1) : null,
        intMs: n ? (PP.isum / n).toFixed(2) : null,
        jsMs: n ? (PP.jsum / n).toFixed(2) : null,
        imax: PP.imax || 0, jank: PP.jank || 0,
        mode: (typeof PX_MODES !== 'undefined' && PX_MODES[PP.mode | 0]) || '?'
      };
    } catch (e2) {}
    var snap = { ts: nowIso(), dpr: dpr(), url: String(location.href), summary: summary, panel: panel };
    perfStore.push(snap);
    updateList();
    log('perf snapshot #' + perfStore.length);
    return snap;
  }

  /* ---------- export ---------- */
  function empty() { return !store.length && !probeStore.length && !perfStore.length; }
  function buildExportObj() {
    return {
      meta: {
        exportedAt: nowIso(), mode: MODE || '-', url: String(location.href), dpr: dpr(), ua: navigator.userAgent || '',
        dives: store.length, probes: probeStore.length, perfs: perfStore.length,
        cfg: { dives: CFG.dives, settleMs: CFG.settleMs }
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
  function exportJSON() {
    if (empty()) return log('belum ada data');
    var name = 'wh-debug-' + Date.now() + '.json';
    download(name, JSON.stringify(buildExportObj(), null, 2), 'application/json');
    log('download ' + name);
  }
  function exportTXT() {
    if (!empty()) captureProbeIfNew();
    if (empty()) return log('belum ada data');
    var m = buildExportObj().meta, L = [];
    L.push('=== wh auto-debug export ===');
    L.push('exportedAt: ' + m.exportedAt, 'mode: ' + m.mode, 'url: ' + m.url, 'dpr: ' + m.dpr);
    L.push('dives: ' + m.dives + '  probes: ' + m.probes + '  perfs: ' + m.perfs, '');
    store.forEach(function (r) {
      L.push('========== DIVE ' + r.i + ' @ ' + r.ts + ' → ' + r.sector + ' ==========');
      if (r.whMk) L.push('sectStep: ' + r.whMk);
      ['skyHeavy', 'worst', 'zoom', 'tunnel', 'exit'].forEach(function (k) { if (r.hints && r.hints[k]) L.push(r.hints[k]); });
      L.push('--- panel ---', r.panel || '(tidak ada #whperf)', '');
    });
    probeStore.forEach(function (p, i) {
      L.push('========== PROBE #' + (i + 1) + ' [' + p.ctx + '] @ ' + p.ts + ' ==========', p.text || '(kosong)', '');
    });
    perfStore.forEach(function (p, i) {
      L.push('========== PERF SNAP #' + (i + 1) + ' @ ' + p.ts + ' ==========');
      var s = p.summary || {};
      L.push('mode: ' + (s.mode || '?'));
      L.push('fps: ' + (s.fps || '?') + '  int: ' + (s.intMs || '?') + 'ms  js: ' + (s.jsMs || '?') + 'ms');
      L.push('imax: ' + (s.imax || 0) + '  jank: ' + (s.jank || 0) + '/' + (s.n || 0));
      L.push('--- panel ---', p.panel || '(kosong)', '');
    });
    var name = 'wh-debug-' + Date.now() + '.txt';
    download(name, L.join('\n'), 'text/plain');
    log('download ' + name);
  }
  function clearAll() {
    store.length = 0; probeStore.length = 0; perfStore.length = 0; lastProbeKey = '';
    updateList();
    log('cleared');
  }

  /* ---------- UI ---------- */
  function updateList() {
    if (!ui || !ui.list) return;
    var p = [];
    if (store.length) p.push(store.map(function (r) { return 'D#' + r.i + ' ' + r.sector + (r.hints && r.hints.skyHeavy ? ' ⚠sky' : ''); }).join('\n'));
    if (probeStore.length) p.push(probeStore.map(function (x, i) { return 'P#' + (i + 1) + ' ' + x.ctx; }).join('\n'));
    if (perfStore.length) p.push(perfStore.map(function (x, i) { return 'F#' + (i + 1) + (x.summary && x.summary.fps ? ' ' + x.summary.fps + 'fps' : ''); }).join('\n'));
    ui.list.textContent = p.length ? p.join('\n') : '(kosong)';
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
    if (ui && ui.root && ui.root.parentNode) { ui.root.style.display = ''; if (ui.expand) ui.expand(true); return; }

    addStyle();
    var root = mk('div');
    root.id = 'wh-autodive';
    ['pointerdown', 'pointerup', 'pointermove', 'touchstart', 'touchend', 'touchmove', 'mousedown', 'mouseup', 'click', 'wheel'].forEach(function (ev) {
      root.addEventListener(ev, function (e) { e.stopPropagation(); }, { passive: false });
    });

    var fab = mk('button', BTN + ';width:32px;height:32px;padding:0;font-size:15px;border-radius:5px;background:rgba(6,11,17,.34);border-color:rgba(110,229,255,.17);display:grid;place-items:center', '🐞');
    fab.id = 'wh-ad-fab';
    fab.type = 'button';
    fab.title = 'auto-debug';

    var panel = mk('div',
      'background:rgba(0,10,18,.94);padding:8px 10px;border-radius:10px;border:1px solid rgba(100,255,220,.32);' +
      'width:min(290px,calc(100vw - 24px));max-height:calc(100vh - 110px);overflow:auto;box-shadow:0 8px 28px rgba(0,0,0,.5);backdrop-filter:blur(6px);display:none');

    var head = mk('div', 'display:flex;align-items:center;justify-content:space-between;gap:6px;margin-bottom:6px');
    head.appendChild(mk('div', 'font-weight:700;font-size:11px', 'wh-debug'));
    var xb = btn('✕', function () { expand(false); });
    head.appendChild(xb);
    panel.appendChild(head);

    /* pilih mode (reload dengan param yang pas) */
    panel.appendChild(mk('div', 'opacity:.7;font-size:10px;margin-bottom:3px', 'pilih tes:'));
    var modes = mk('div', 'display:flex;flex-wrap:wrap;gap:4px;margin-bottom:4px');
    MODES.forEach(function (m) {
      modes.appendChild(btn(m.label, function () {
        if (m.id === MODE) return;
        if (running) return log('tunggu dive selesai dulu');
        go(urlFor(m.id));
      }, m.id === MODE));
    });
    panel.appendChild(modes);

    var cur = null;
    MODES.forEach(function (m) { if (m.id === MODE) cur = m; });
    panel.appendChild(mk('div', 'opacity:.8;font-size:10px;margin-bottom:6px;line-height:1.3',
      cur ? cur.hint : 'belum ada mode — pilih salah satu (halaman akan reload)'));

    var status = mk('div', 'opacity:.9;min-height:2.4em;margin-bottom:6px;font-size:10px;line-height:1.3', 'siap');
    panel.appendChild(status);

    /* aksi per mode */
    var acts = mk('div', 'display:flex;flex-wrap:wrap;align-items:center;gap:4px;margin-bottom:6px');
    if (MODE === 'whperf') {
      var lab = mk('label', 'display:flex;align-items:center;gap:4px;font-size:10px', 'dives');
      var inp = mk('input', 'width:2.8em;background:#0a1a22;color:#b8fff0;border:1px solid #2a5;border-radius:4px;padding:1px 3px;font:inherit');
      inp.type = 'number'; inp.min = '1'; inp.max = '20'; inp.value = String(CFG.dives);
      lab.appendChild(inp);
      acts.appendChild(lab);
      var runB = btn('Dive×' + CFG.dives, function () {
        var n = parseInt(inp.value, 10);
        if (n >= 1 && n <= 20) CFG.dives = n;
        runB.textContent = 'Dive×' + CFG.dives;
        runSeries();
      });
      acts.appendChild(runB);
    } else if (MODE === 'probe') {
      var ps = param('pset');
      acts.appendChild(btn('set normal', function () { go(urlFor('probe')); }, ps !== 'bio'));
      acts.appendChild(btn('set bio', function () { go(urlFor('probe', { pset: 'bio' })); }, ps === 'bio'));
      acts.appendChild(btn('Tangkap', function () { if (!captureProbeIfNew()) log('belum ada hasil PROBE — tunggu selesai'); }));
    } else if (MODE === 'perf') {
      acts.appendChild(btn('Snap PERF', snapshotPerf));
    }
    panel.appendChild(acts);

    var exp = mk('div', 'display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px');
    exp.appendChild(btn('JSON', exportJSON));
    exp.appendChild(btn('TXT', exportTXT));
    exp.appendChild(btn('Clr', clearAll));
    exp.appendChild(btn('Matikan', function () { go(urlFor(null)); }));
    panel.appendChild(exp);

    var list = mk('pre', 'margin:0;max-height:5.5em;overflow:auto;opacity:.88;white-space:pre-wrap;font-size:10px;pointer-events:auto', '(kosong)');
    panel.appendChild(list);

    root.appendChild(panel);
    root.appendChild(fab);
    ui = { root: root, status: status, list: list, panel: panel, fab: fab };

    function expand(on) {
      panel.style.display = on ? 'block' : 'none';
      fab.style.display = on ? 'none' : 'grid';
    }
    fab.onclick = function (e) { e.stopPropagation(); expand(true); };
    ui.expand = expand;

    document.body.appendChild(root);
    expand(true);
    updateList();
    if (MODE === 'probe') startProbeWatch();

    var boot = { whperf: 'Dive siap — tekan Dive×N', probe: 'probe watch ON — diam sampai PROBE selesai', perf: 'PERF aktif — tekan Snap PERF' };
    log(MODE ? boot[MODE] : 'pilih tes di atas');
  }

  window.__WH_AD = {
    open: open,
    run: runSeries,
    snapPerf: snapshotPerf,
    captureProbe: captureProbeIfNew,
    exportJSON: exportJSON,
    exportTXT: exportTXT,
    cfg: CFG,
    mode: MODE,
    get store() { return store.slice(); },
    get probes() { return probeStore.slice(); },
    get perfs() { return perfStore.slice(); },
    stop: function () { if (probeWatch) { clearInterval(probeWatch); probeWatch = null; } running = false; }
  };

  if (document.body) open();
  else document.addEventListener('DOMContentLoaded', open);
})();
