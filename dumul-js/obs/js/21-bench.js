/* BENCH v3 (?bench=1) — read-only: tidak mengubah perilaku boot. Hanya aktif kalau URL punya ?bench=1. Hapus blok ini setelah selesai ukur. */
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
  /* v8: ukur pembuatan WebGLRenderer (konteks + MSAA) dan compile/render pertama per renderer; dipasang begitu THREE termuat. Hanya di ?bench=1. */
  (function () {
    var tries = 0, iv = setInterval(function () {
      try {
        if (window.THREE && THREE.WebGLRenderer && !THREE.__benchWrapped) {
          clearInterval(iv); THREE.__benchWrapped = true;
          var Orig = THREE.WebGLRenderer;
          var W2 = function (o) {
            var t0 = performance.now(), r = new Orig(o), d = performance.now() - t0;
            if (GLN.length < 12) GLN.push([Math.round(t0), Math.round(d), o && o.antialias ? 1 : 0]);
            var n = GLN.length - 1;
            ['compile', 'render'].forEach(function (k) {
              var f = r[k], c = 0;
              r[k] = function () { var a = performance.now(), v = f.apply(this, arguments), e = performance.now() - a; if (c++ < 2 && e > 30 && GLC.length < 24) GLC.push([n, k, Math.round(a), Math.round(e)]); return v; };
            });
            return r;
          };
          W2.prototype = Orig.prototype;
          try { Object.keys(Orig).forEach(function (k) { W2[k] = Orig[k]; }); } catch (e) {}
          THREE.WebGLRenderer = W2;
        } else if (++tries > 2000) clearInterval(iv);
      } catch (e) { clearInterval(iv); }
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
  window.addEventListener('obs-entered', function () { mark('entered'); });
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
  function paint() {
    if (!box) return;
    var t = R.t, x = [];
    x.push('BENCH v9 ms (sejak navigasi)');
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
    if (R.sfxAtBlue) x.push('SFX @blue meta/play: ' + R.sfxAtBlue.metadata + '/' + R.sfxAtBlue.playable);
    if (R.tapLog.length) { var f = R.tapLog[0]; x.push('tap#1: blue+' + f[1] + 'ms  SFX meta/play ' + f[2] + '/' + f[3]); }
    if (R.playLog.length) { var l = R.playLog[R.playLog.length - 1]; x.push('play terakhir: ' + l[0] + ' lat ' + l[3] + 'ms rs' + l[4]); }
    x.push('longtask sblm capsule: ' + ltN + 'x / ' + Math.round(lt) + 'ms');
    box.firstChild.textContent = x.join('\n');
  }
  function snapshot() {
    R.sfxFinal = sfxStates();
    R.ltPhase = LP;
    R.boot3d = window.__boot3d || null; /* {t, done, total, st[AST3D,SCP3D,DR3D,PT3D,PL3D], warm, gate} saat capsule tampil */
    R.glNew = GLN; /* [start, ms, antialias] per WebGLRenderer (urutan = urutan dibuat) */
    R.glCall = GLC; /* [indeks renderer, compile|render, start, ms] 2 panggilan pertama >30 ms */
    R.ric = RIC_HOLD ? 'hold' : 'normal';
    R.loaf = LOAF.slice().sort(function (a, b) { return b[1] - a[1]; }).slice(0, 8); /* [start, dur, blocking, [[file, fungsi, invoker, ms] x3]] */
    /* v130: LoAF sesudah capsule tampil (top 8 menurut durasi) + penanda timeout/auto-enter. R.loaf di atas = top 8 seluruh sesi, hampir semuanya pra-capsule. */
    try { var tc = R.t.capsule; R.loafCap = tc == null ? [] : LOAF.filter(function (x) { return x[0] >= tc; }).sort(function (a, b) { return b[1] - a[1]; }).slice(0, 8); } catch (e) { R.loafCap = []; }
    R.bootTimeout = !!window.__bootTimeout; R.bootFinish = window.__bootFinish || null; R.warmConc = window.__warmConc != null ? window.__warmConc : null;   /* pass 11: tercatat di JSON supaya run ?nolive=1 dan normal bisa dibedakan */
    try { R.nolive = /[?&]nolive=1(&|$)/.test(location.search); } catch (eNl) { R.nolive = null; }
    R.evt = EVT; /* [event, start, inputDelay, processing, total] untuk event >=100ms (klik Blue dll) */
    R.ltTop = LT.slice().sort(function (a, b) { return b[1] - a[1]; }).slice(0, 10); /* [startTime, durasi] terpanjang; bandingkan dgn t.capsule/blue/frame1 dan marks */
    try { var m0 = performance.getEntriesByName('obs-t0')[0], mw = performance.getEntriesByName('obs-warm')[0]; R.t0Start = m0 ? Math.round(m0.startTime) : null; R.warmStart = mw ? Math.round(mw.startTime) : null; R.t0mode = /[?&]legacy=1/.test(location.search) ? 'legacy' : (/[?&]t0=capsule/.test(location.search) ? 'capsule' : 'dcl'); } catch (e) {}
    R.longtaskBeforeCapsule = { n: ltN, ms: Math.round(lt) };
    R.longtaskTotal = { n: ltAllN, ms: Math.round(ltAll) };
    try { R.ver = {}; Array.prototype.forEach.call(document.scripts, function (sc) { var m = /\/([^\/?]+)\?v=(\d+)/.exec(sc.src || ''); if (m && /^(01-core|07-boot)/.test(m[1])) R.ver[m[1]] = +m[2]; }); R.legacy = /[?&]legacy=1/.test(location.search); R.loadAfterCapsule = R.t.load != null && R.t.capsule != null ? R.t.load - R.t.capsule : null; } catch (e) {}
    R.ua = navigator.userAgent; R.potato = typeof IS_POTATO !== 'undefined' ? IS_POTATO : null; R.reduce = typeof reduce !== 'undefined' ? reduce : null;
    R.net = (navigator.connection && navigator.connection.effectiveType) || 'n/a';
    R.swNow = navigator.serviceWorker && navigator.serviceWorker.controller ? 'controlled' : 'no-controller';
    R.swRegAt = window.__swRegAt != null ? window.__swRegAt : null; R.swLog = window.__swLog || []; R.warmLog = window.__warmLog || []; R.warmMax = window.__warmMax || 0;   /* v129 diagnostik */
    R.bootRepeatFlag = 'n/a(dibaca setelah boot)';
    try {
      var rs = performance.getEntriesByType('resource'); R.res = rs.length; R.aud = [];
      rs.forEach(function (e) { if (/\.opus/.test(e.name)) R.aud.push([e.name.replace(/^.*\//, '').replace(/\?.*$/, ''), Math.round(e.startTime), Math.round(e.responseStart), Math.round(e.responseEnd), e.transferSize]); });
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
      if (R.t.bootStart != null) {
        R.bootToCapsule = R.t.capsule - R.t.bootStart;
        /* bootStart ditandai agak telat (setelah seluruh 07-boot.js selesai), jadi jangan bandingkan ke angka persis. Logika pasti: readiness cuma bisa jadi sebab kalau 16/16 sudah metadata. */
        R.finishGuess = window.__bootFinish || (R.sfxAtCapsule.metadata >= R.sfxAtCapsule.total ? 'readiness 16/16' : 'maxMs (readiness belum ' + R.sfxAtCapsule.metadata + '/' + R.sfxAtCapsule.total + ')');
      }
      paint();
    }
  }).observe(ch, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('DOMContentLoaded', function () {
    box = document.createElement('div');
    box.style.cssText = 'position:fixed;top:4px;left:4px;z-index:2147483647;background:rgba(0,0,0,.78);color:#7fffb0;font:10px/1.35 monospace;padding:5px 6px;border:1px solid #2a6;max-width:80vw;white-space:pre;pointer-events:none';
    box.appendChild(document.createElement('div'));
    var b = document.createElement('button');
    b.textContent = 'COPY JSON';
    b.style.cssText = 'pointer-events:auto;margin-top:4px;font:10px monospace;padding:3px 6px;display:block';
    b.onclick = function (ev) { ev.stopPropagation(); var s = snapshot(); try { navigator.clipboard.writeText(s); b.textContent = 'COPIED'; } catch (e) { prompt('Copy:', s); } console.log('[bench]', s); };
    box.appendChild(b);
    document.body.appendChild(box);
    mark('dcl');
    var blue = document.getElementById('boot-cap-blue');
    if (blue) blue.addEventListener('click', function () {
      blueAt = now(); mark('blue'); R.sfxAtBlue = sfxStates(); try { R.bgmAtBlue = { AMB: AMB.readyState, COLLAP: MUSIC_COLLAP.readyState, GARG: GARG.readyState }; } catch (e) {}
      var f0 = typeof lastFrameOK !== 'undefined' ? lastFrameOK : 0, changes = 0, last = f0;
      /* perubahan #1 = startRenderLoop() menulis lastFrameOK; #2 = frame pertama selesai */
      (function poll() {
        if (typeof lastFrameOK !== 'undefined' && lastFrameOK !== last) { last = lastFrameOK; changes++; if (changes >= 2) { mark('frame1'); return; } }
        if (now() - blueAt < 10000) requestAnimationFrame(poll);
      })();
      requestAnimationFrame(function () { requestAnimationFrame(function () { mark('raf2'); }); });
    }, true);
    paint();
  });
  window.addEventListener('load', function () { mark('load'); });
  document.addEventListener('pointerdown', function () { if (blueAt) { tapAt = now(); R.taps++; var st = sfxStates(); if (R.tapLog.length < 40) R.tapLog.push([tapAt, tapAt - blueAt, st.metadata, st.playable]); paint(); } }, true);
})();
