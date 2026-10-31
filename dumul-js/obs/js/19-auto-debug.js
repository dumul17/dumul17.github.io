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
 *     muffdbg → ?muffdbg : overlay #muff-dbg spatial audio (installMuff)
 *   Langkah 1a: installPerf / installProbe / installWP / installMuff di file ini (sumber kebenaran body tooling).
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

  /* ---------- INSTALLERS (Langkah 1a): body PERF / PROBE / WP / muff dimiliki 19 ----------
     Dipanggil saat flag mode aktif. Override global supaya setelah 05/09 di-stub, tooling tetap hidup.
     Idempotent (flag __WH_AD_inst*). Sementara 05/09 masih punya body: override function ref = 19 ambil alih. */
  function installPerf() {
    if (window.__WH_AD_instPerf) return true;
    try {
      var PX0 = { sky:0, lines:0, stars:0, pulse:0, ast:0, hole:0, all:0, pa:0, pw:0, pb:0, slow:0, mw:0, pt:0, neb:0, ptr:0, ptm:0, ptb:0 };
      if (typeof window.PX !== 'object' || !window.PX) window.PX = PX0;
      else {
        for (var k in PX0) if (!(k in window.PX)) window.PX[k] = 0;
      }
      /* TIMPA stub 05 (PX_MODES=['normal'], PX_PANEL={}); jangan pakai `||` karena stub itu truthy → tap/Sweep macet di 1 mode */
      window.PX_MODES = ['normal','panel HIDDEN','asteroid OFF','bintang OFF','milky way OFF','portal3d OFF','nebula/plate OFF','SEMUA OFF (loop kosong)'];
      window.PX_PANEL = {
        'panel HIDDEN': { visibility: 'hidden' },
        'panel OPAQUE': { background: '#040a10' },
        'panel NO-CLIP': { overflow: 'visible', contain: 'none', borderRadius: '0' },
        'panel NO-WILLCHANGE': { willChange: 'auto' },
        'panel NO-SHADOW': { boxShadow: 'none' }
      };
      if (typeof window.PP !== 'object' || !window.PP) {
        window.PP = { fs:0, t0:0, last:0, cur:{}, tot:{}, n:0, isum:0, jsum:0, jank:0, ev:[], el:null, upd:0, pnl:null, imax:0, mode:0, ad:0 };
      }
      window.PERF = true;
      /* real implementations — mirror 05-sector-ui.js */
      window.pmk = function pmk(n) {
        if (!window.PERF) return;
        var t = performance.now();
        var PP = window.PP;
        PP.cur[n] = (PP.cur[n] || 0) + (t - PP.t0);
        PP.t0 = t;
      };
      window.pBegin = function pBegin() {
        if (!window.PERF) return;
        var PP = window.PP;
        PP.fs = PP.t0 = performance.now();
        PP.cur = {};
        try { if (typeof AST_DRAWN !== 'undefined') AST_DRAWN = 0; } catch (e) {}
      };
      window.pEnd = function pEnd(now) {
        if (!window.PERF) return;
        var PP = window.PP, PX = window.PX, PX_MODES = window.PX_MODES, PX_PANEL = window.PX_PANEL;
        window.pmk('end');
        var js = performance.now() - PP.fs, iv = PP.last ? now - PP.last : 0;
        PP.last = now;
        try { PP.ad = (typeof AST_DRAWN !== 'undefined') ? AST_DRAWN : 0; } catch (eAd) { PP.ad = 0; }
        try { if (typeof window.probeTick === 'function') window.probeTick(now, iv, js); } catch (ePt) {}
        if (iv > 0 && iv < 1000) {
          PP.n++; PP.isum += iv; PP.jsum += js; if (iv > PP.imax) PP.imax = iv;
          for (var k in PP.cur) PP.tot[k] = (PP.tot[k] || 0) + PP.cur[k];
          if (iv > 34) {
            PP.jank++;
            var top = '', tv = 0;
            for (var k2 in PP.cur) if (PP.cur[k2] > tv) { tv = PP.cur[k2]; top = k2; }
            var pn = PP.pnl || (PP.pnl = document.getElementById('music-player'));
            var sfxOn = false;
            try { sfxOn = !!(typeof activeSfx !== 'undefined' && activeSfx && !activeSfx.paused); } catch (eS) {}
            var secOn = false;
            try { secOn = !!(typeof SECT !== 'undefined' && SECT.on); } catch (eSe) {}
            PP.ev.push((iv | 0) + 'ms js' + (js | 0) + ' ' + top + (tv | 0) + ' ' + (pn && pn.classList.contains('open') ? 'PANEL ' : '') + (sfxOn ? 'SFX ' : '') + (secOn ? 'OVW' : 'SEC'));
            if (PP.ev.length > 6) PP.ev.shift();
          }
        }
        if (now - PP.upd > 700) {
          PP.upd = now;
          if (!PP.el) {
            var d = document.createElement('pre');
            d.style.cssText = 'position:fixed;left:4px;top:calc(4px + env(safe-area-inset-top,0px));z-index:99999;margin:0;padding:4px 6px;font:9px/1.25 monospace;color:#9ff;background:rgba(0,0,0,.72);pointer-events:auto;white-space:pre';
            document.body.appendChild(d);
            PP.el = d;
            PP.mode = PP.mode | 0;
            d.addEventListener('click', function () {
              PP.mode = ((PP.mode | 0) + 1) % PX_MODES.length;
              var nm = PX_MODES[PP.mode];
              PX.pa = nm === 'panel anim OFF' ? 1 : 0;
              PX.pw = nm === 'wave OFF' ? 1 : 0;
              PX.pb = nm === 'bars OFF' ? 1 : 0;
              PX.slow = nm === 'panel anim ~8fps' ? 1 : 0;
              PX.sky = nm === 'langit OFF' ? 1 : 0;
              PX.lines = nm === 'garis rasi OFF' ? 1 : 0;
              PX.stars = nm === 'bintang OFF' ? 1 : 0;
              PX.pulse = nm === 'pulse+TX OFF' ? 1 : 0;
              PX.ast = nm === 'asteroid OFF' ? 1 : 0;
              PX.hole = nm === 'lubang hitam OFF' ? 1 : 0;
              PX.mw = nm === 'milky way OFF' ? 1 : 0;
              PX.pt = nm === 'portal3d OFF' ? 1 : 0;
              PX.neb = nm === 'nebula/plate OFF' ? 1 : 0;
              PX.all = nm.indexOf('SEMUA') === 0 ? 1 : 0;
              var mpn = document.getElementById('music-player');
              if (mpn) {
                for (var pk in PX_PANEL) for (var pp in PX_PANEL[pk]) mpn.style[pp] = '';
                var ov = PX_PANEL[nm];
                if (ov) for (var pp2 in ov) mpn.style[pp2] = ov[pp2];
              }
              PP.n = PP.isum = PP.jsum = PP.jank = PP.imax = 0; PP.tot = {}; PP.ev = [];
            }, true);
          }
          var n = PP.n || 1, arr = [];
          for (var k3 in PP.tot) arr.push([k3, PP.tot[k3] / n]);
          arr.sort(function (a, b) { return b[1] - a[1]; });
          var fsMode = 1, fsSlow = false, fsWhy = '', fsEma = 16.7;
          try {
            if (typeof FS !== 'undefined' && FS) {
              fsMode = FS.mode | 0; fsSlow = !!FS.slow; fsWhy = FS.why || ''; fsEma = FS.ema || 16.7;
            }
          } catch (eFs) {}
          var tx = '[' + PX_MODES[PP.mode | 0] + '] ketuk=ganti\nfps ' + (1000 / (PP.isum / n)).toFixed(0) +
            '  int ' + (PP.isum / n).toFixed(1) + 'ms (max ' + (PP.imax | 0) + ')  js ' + (PP.jsum / n).toFixed(1) + 'ms\n' +
            'fs: ' + ['off', 'auto', 'paksa'][fsMode] + (fsSlow ? ' SLOW (' + (fsWhy || 'paksa') + ')' : ' normal') +
            '  ema ' + fsEma.toFixed(0) + 'ms\njank>34ms: ' + PP.jank + '/' + PP.n + '\n';
          for (var i = 0; i < Math.min(6, arr.length); i++) tx += arr[i][0] + ' ' + arr[i][1].toFixed(2) + 'ms\n';
          try {
            var av = 0;
            if (typeof AST !== 'undefined' && AST && AST.length) {
              for (var ai2 = 0; ai2 < AST.length; ai2++) if (AST[ai2]._vis) av++;
              tx += 'batu: gambar ' + (PP.ad | 0) + ' / _vis ' + av + ' / total ' + AST.length + '\n';
            } else if (PP.ad) {
              tx += 'batu: gambar ' + (PP.ad | 0) + '\n';
            }
          } catch (eA) {}
          if (PP.ev.length) tx += PP.ev.join('\n');
          PP.el.textContent = tx;
          if (PP.n > 240) { PP.n = PP.isum = PP.jsum = PP.jank = PP.imax = 0; PP.tot = {}; PP.ev = []; }
        }
      };
      window.__WH_AD_instPerf = true;
      return true;
    } catch (e) {
      try { console.warn('[19] installPerf', e); } catch (e2) {}
      return false;
    }
  }

  function installProbe() {
    if (window.__WH_AD_instProbe) return true;
    try {
      installPerf(); /* probe membutuhkan PERF + pEnd → probeTick */
      var PROBE = window.PROBE;
      if (typeof PROBE !== 'object' || !PROBE) {
        PROBE = { arm: true, on: false, done: false, i: 0, t0: 0, iv: [], js: [], el: null, S: null, inS: 0, txu: 0, res: [], ctx: '', c0: '', dn: {}, tests: null, seq: null };
        window.PROBE = PROBE;
      }
      PROBE.arm = true;
      var PROBE_SET = '';
      try {
        var _ps = /[?&]pset=([a-z]+)(&|$)/.exec(location.search);
        if (_ps) PROBE_SET = _ps[1];
      } catch (ePs) {}
      window.PROBE_SET = PROBE_SET;
      var PROBE_PIN = 0;
      try {
        var _pm = /[?&]pin=([12])(&|$)/.exec(location.search);
        if (_pm) PROBE_PIN = +_pm[1];
      } catch (ePn) {}
      window.PROBE_PIN = PROBE_PIN;

      var PROBE_TESTS_SEC = [
        ['aurora OFF', function () { PL3D_CFG.auroraOn = false; }],
        ['efek planet OFF (4)', function () { var C = PL3D_CFG; C.auroraOn = C.flareOn = C.debrisOn = C.boltOn = false; }],
        ['rotasi planet OFF', function () { PL3D_CFG.rotK = 0; }],
        ['drone 3D OFF', function () { if (typeof DR3D_CFG !== 'undefined') DR3D_CFG.on = false; }],
        ['PLANET OFF total', function () { PL3D_CFG.on = false; }],
        ['asteroid OFF', function () { PX.ast = 1; }],
        ['bintang OFF', function () { PX.stars = 1; }],
        ['garis rasi OFF', function () { PX.lines = 1; }],
        ['langit OFF', function () { PX.sky = 1; }],
        ['pulse+TX OFF', function () { PX.pulse = 1; }],
        ['lubang hitam OFF', function () { PX.hole = 1; }],
        ['SEMUA OFF (kosong)', function () { PX.all = 1; }]
      ];
      var PROBE_TESTS_BIO = [
        ['kerlip OFF', function () { PL3D_CFG.cityTw = 0; }],
        ['tanah+awan diam', function () { PL3D_CFG.rotK = 0; PL3D_CFG.cloudDrift = 0; }],
        ['diam+kerlip OFF', function () { var C = PL3D_CFG; C.rotK = 0; C.cloudDrift = 0; C.cityTw = 0; }],
        ['biome OFF', function () { PL3D_CFG.bioA = 0; }],
        ['kota OFF', function () { PL3D_CFG.cityA = 0; }],
        ['fade OFF', function () { PL3D_CFG.fade = 0; }],
        ['qSlow OFF (q penuh)', function () { PL3D_CFG.qSlow = 0; }],
        ['bandMin 3', function () { PL3D_CFG.bandMin = 3; }],
        ['bands 3', function () { PL3D_CFG.bands = 3; }],
        ['bands 1', function () { PL3D_CFG.bands = 1; }],
        ['fps 30', function () { PL3D_CFG.fps = 30; }],
        ['aurora OFF', function () { PL3D_CFG.auroraOn = false; }],
        ['PLANET OFF total', function () { PL3D_CFG.on = false; }]
      ];
      var PROBE_TESTS_OV = [
        ['portal3d OFF', function () { PX.pt = 1; }],
        ['portal cincin GL OFF', function () { PX.ptr = 1; }],
        ['portal mulut OFF', function () { PX.ptm = 1; }],
        ['portal petir+kilau OFF', function () { PX.ptb = 1; }],
        ['asteroid OFF', function () { PX.ast = 1; }],
        ['SEMUA OFF (kosong)', function () { PX.all = 1; }]
      ];
      window.PROBE_TESTS_SEC = PROBE_TESTS_SEC;
      window.PROBE_TESTS_BIO = PROBE_TESTS_BIO;
      window.PROBE_TESTS_OV = PROBE_TESTS_OV;

      window.probeSeqOf = function probeSeqOf(T) {
        var q = [['normal', function () {}]];
        for (var k = 0; k < T.length; k++) { q.push(T[k]); q.push(['normal', function () {}]); }
        return q;
      };
      window.probeFreeze = function probeFreeze(on) {
        try {
          if (typeof PT3D === 'undefined') return;
          if (on && PROBE_PIN && PROBE.ctx === 'ov') {
            PT3D.orbFreeze = 1;
            PT3D.orbPhi = PROBE_PIN === 2 ? 4.712389 : 1.5708;
          } else PT3D.orbFreeze = 0;
        } catch (e) {}
      };
      window.probeCtx = function probeCtx() {
        if (typeof SECT === 'undefined' || typeof PL3D_CFG === 'undefined') return '';
        if (SECT.cur && !SECT.on) return 'sec';
        if (SECT.on && !SECT.cur && !SECT.busy) {
          try { if (typeof smenuHidesSky === 'function' && smenuHidesSky()) return ''; } catch (e) {}
          try { if (typeof WORMHOLE !== 'undefined' && WORMHOLE.ringOwned && WORMHOLE.ringOwned()) return ''; } catch (e) {}
          return 'ov';
        }
        return '';
      };
      window.probeSave = function probeSave() {
        var C = PL3D_CFG;
        PROBE.S = {
          a: C.auroraOn, f: C.flareOn, d: C.debrisOn, b: C.boltOn, r: C.rotK, o: C.on,
          dr: (typeof DR3D_CFG !== 'undefined' ? DR3D_CFG.on : true),
          tw: C.cityTw, cd: C.cloudDrift, ba: C.bioA, ca: C.cityA, bn: C.bands, fp: C.fps,
          bm: C.bandMin, fd: C.fade, qq: C.q, qs: C.qSlow
        };
      };
      window.probeRestore = function probeRestore() {
        var C = PL3D_CFG, S = PROBE.S, PX = window.PX;
        if (S) {
          C.auroraOn = S.a; C.flareOn = S.f; C.debrisOn = S.d; C.boltOn = S.b; C.rotK = S.r; C.on = S.o;
          if (S.tw !== undefined) {
            C.cityTw = S.tw; C.cloudDrift = S.cd; C.bioA = S.ba; C.cityA = S.ca; C.bands = S.bn; C.fps = S.fp; C.bandMin = S.bm;
            if (S.qq !== undefined) { C.fade = S.fd; C.q = S.qq; C.qSlow = S.qs; }
          }
          if (typeof DR3D_CFG !== 'undefined') DR3D_CFG.on = S.dr;
        }
        PX.ast = 0; PX.stars = 0; PX.lines = 0; PX.all = 0; PX.sky = 0; PX.pulse = 0; PX.hole = 0;
        PX.mw = 0; PX.pt = 0; PX.neb = 0; PX.ptr = 0; PX.ptm = 0; PX.ptb = 0;
      };
      window.probeP = function probeP(x, n) { x = String(x); while (x.length < n) x += ' '; return x; };
      window.probeL = function probeL(x, n) { x = String(x); while (x.length < n) x = ' ' + x; return x; };
      window.probeSg = function probeSg(v, d) { return (v >= 0 ? '+' : '') + v.toFixed(d); };
      window.probeCopy = function probeCopy(btn) {
        var t = PROBE.txt || '';
        function ok() { btn.textContent = 'TERSALIN'; setTimeout(function () { btn.textContent = 'SALIN'; }, 1500); }
        function fb() {
          try {
            var ta = document.createElement('textarea'); ta.value = t;
            ta.style.cssText = 'position:fixed;opacity:0;left:0;top:0';
            document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); ok();
          } catch (e) { btn.textContent = 'GAGAL'; }
        }
        try { if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(t).then(ok, fb); return; } } catch (e) {}
        fb();
      };
      window.probeUi = function probeUi() {
        if (PROBE.box) return;
        var bx = document.createElement('div'), pr = document.createElement('pre'), row = document.createElement('div');
        var b1 = document.createElement('button'), b2 = document.createElement('button');
        var bs = 'font:inherit;color:inherit;background:rgba(255,210,127,.1);border:1px solid rgba(255,210,127,.5);border-radius:4px;padding:5px 12px;';
        bx.style.cssText = 'position:fixed;left:4px;bottom:calc(150px + env(safe-area-inset-bottom,0px));z-index:99998;max-width:calc(100vw - 8px);box-sizing:border-box;padding:6px 8px;background:rgba(2,8,14,.9);border:1px solid rgba(255,210,127,.3);border-radius:6px;font:10px/1.4 ui-monospace,Menlo,Consolas,monospace;color:#ffd27f;pointer-events:none';
        pr.style.cssText = 'margin:0;font:inherit;white-space:pre;overflow:hidden';
        row.style.cssText = 'display:none;gap:8px;margin-top:6px';
        b1.textContent = 'SALIN'; b1.style.cssText = bs; b1.onclick = function () { window.probeCopy(b1); };
        b2.textContent = 'TUTUP'; b2.style.cssText = bs; b2.onclick = function () { bx.style.display = 'none'; };
        row.appendChild(b1); row.appendChild(b2); bx.appendChild(pr); bx.appendChild(row); document.body.appendChild(bx);
        PROBE.box = bx; PROBE.el = pr; PROBE.row = row;
      };
      window.probeShow = function probeShow(t, fin) {
        window.probeUi();
        PROBE.box.style.display = 'block';
        PROBE.el.textContent = t;
        PROBE.row.style.display = fin ? 'flex' : 'none';
        PROBE.box.style.pointerEvents = fin ? 'auto' : 'none';
        if (fin) PROBE.txt = t;
      };
      window.probeTrim = function probeTrim(a) {
        if (!a.length) return 0;
        var b = a.slice().sort(function (x, y) { return x - y; });
        var lo = Math.floor(b.length * .1), hi = Math.max(lo + 1, Math.ceil(b.length * .9)), s = 0, k;
        for (k = lo; k < hi; k++) s += b[k];
        return s / (hi - lo);
      };
      window.probeReport = function probeReport(R){
        var b4=0,b5=0,b6=0,k,bs=[],dl=[],nz=0,base=0,t,b0,b1,bm,d,fl,tx,rows=[],qs='',prev=null,best=null,nOk=0,df;
        var T=PROBE.tests,ctx=PROBE.ctx,lk=ctx==='ov'?'dumul_probe_last_ov':'dumul_probe_last',verdict='';
        for(k=0;k<R.length;k+=2){bs.push(R[k][1]);b4+=R[k][4]||0;if((R[k][5]||0)>b5)b5=R[k][5];b6+=R[k][6]||0;}
        for(k=0;k+1<bs.length;k++)dl.push(Math.abs(bs[k]-bs[k+1]));
        dl.sort(function(x,y){return x-y;});nz=dl.length?dl[Math.floor(dl.length/2)]:0;
        for(k=0;k<bs.length;k++)base+=bs[k];base/=Math.max(1,bs.length);
        try{qs=location.search.replace(/^\?/,'');}catch(e){}
        tx='HASIL PROBE ['+(ctx==='ov'?'OVERVIEW':'SEKTOR')+(ctx==='ov'&&PROBE_PIN?(PROBE_PIN===2?' orbit DEKAT limb':' orbit JAUH'):'')+']   dpr x'+(+DPR).toFixed(2)+'   kanvas '+cv.width+'x'+cv.height+'\n'+
           'normal '+base.toFixed(1)+' ms = '+(1000/base).toFixed(0)+' fps   (noise +-'+nz.toFixed(1)+' ms)\n'+
           (b4>0?'refresh tanah '+(b4/Math.max(1,bs.length)).toFixed(1)+'/dtk   gap maks '+b5.toFixed(0)+' ms   gpu '+(b6/Math.max(1,bs.length)).toFixed(1)+' ms/pita\n':'')+
           '------------------------------------------\n'+
           window.probeP('tes (dimatikan)',19)+window.probeL('ms',6)+window.probeL('hemat',8)+window.probeL('fps',7)+window.probeL('rf/s',6)+window.probeL('gap',6)+window.probeL('gpu',6)+'\n';
        for(k=0;k<T.length;k++){
          t=R[2*k+1];b0=R[2*k][1];b1=R[2*k+2][1];bm=(b0+b1)/2;d=bm-t[1];df=1000/t[1]-1000/bm;
          fl=(Math.abs(d)<Math.max(nz,2)?'~':' ')+(t[2]>t[1]*1.6?'!':' ');
          tx+=window.probeP(T[k][0],19)+window.probeL(t[1].toFixed(1),6)+window.probeL(window.probeSg(d,1),8)+window.probeL(window.probeSg(df,1),7)+window.probeL((t[4]||0).toFixed(1),6)+window.probeL((t[5]||0).toFixed(0),6)+window.probeL((t[6]||0).toFixed(1),6)+' '+fl+'\n';
          if(fl.charAt(0)!=='~'&&T[k][0].indexOf('SEMUA')<0){nOk++;if(!best||d>best.d)best={n:T[k][0],d:d};}
          if(ctx==='ov'&&(T[k][0]==='milky way OFF'||T[k][0]==='portal3d OFF'))verdict+=T[k][0].replace(' OFF','')+': '+((d>=3&&fl.charAt(0)!=='~')?'>= 3 ms, cache/jarangkan layak':'< 3 ms atau dalam noise, tidak usah repot')+' ('+window.probeSg(d,1)+' ms)\n';
        }
        tx+='------------------------------------------\n'+
            '+ hemat saat dimatikan   ~ dalam noise\n'+
            '! banyak stall (angka kurang pasti)\n'+
            'rf/s refresh penuh tanah per dtk   gap jeda terpanjang (ms)   gpu tunggu GPU per pita (ms)\n';
        tx+=verdict;
        tx+=best?('Menonjol: '+best.n+' ('+window.probeSg(best.d,1)+' ms)\n'):'Tidak ada komponen tunggal yang menonjol\n(biaya tersebar rata)\n';
        try{prev=JSON.parse(localStorage.getItem(lk)||'null');}catch(e){}
        if(prev&&prev.base)tx+='Run lalu: dpr x'+(+prev.dpr).toFixed(2)+'  '+prev.base.toFixed(1)+' ms  ('+window.probeSg(base-prev.base,1)+' ms sekarang)\n';
        try{localStorage.setItem(lk,JSON.stringify({dpr:+DPR,base:base,nz:nz,q:qs,ts:Date.now()}));}catch(e){}
        tx+='fs: '+['off','auto','paksa slow'][FS.mode]+(FS.slow?' (slow aktif)':'')+'   ?'+qs;
        return tx;
      };
      window.probeMed = function probeMed(a, q) {
        if (!a.length) return 0;
        var b = a.slice().sort(function (x, y) { return x - y; });
        return b[Math.min(b.length - 1, Math.floor(b.length * q))];
      };
      window.probeBegin = function probeBegin(now) {
        window.probeRestore();
        try { PROBE.seq[PROBE.i][1](); } catch (e) {}
        PROBE.t0 = now; PROBE.iv = []; PROBE.js = []; PROBE.gs = 0; PROBE.gn = 0; PROBE.pfR = 0; PROBE.pfT = 0;
      };
      window.probeTick = function probeTick(now, iv, js) {
        if (!PROBE.arm) return;
        var cx = window.probeCtx(), PX = window.PX, PP = window.PP;
        if (!PROBE.on) {
          /* konteks harus sama & stabil 3 dtk; boot <12s dilewati; konteks yang sudah selesai dilewati */
          if (now < 12000 || !cx || PROBE.dn[cx] || cx !== PROBE.c0) {
            PROBE.inS = 0; PROBE.c0 = (cx && !PROBE.dn[cx]) ? cx : '';
            return;
          }
          if (!PROBE.inS) PROBE.inS = now;
          if (now - PROBE.inS < 3000) return;
          PROBE.ctx = cx;
          PROBE.tests = cx === 'ov' ? PROBE_TESTS_OV : (PROBE_SET === 'bio' ? PROBE_TESTS_BIO : PROBE_TESTS_SEC);
          PROBE.seq = window.probeSeqOf(PROBE.tests);
          window.probeSave(); window.probeFreeze(true);
          PROBE.on = true; PROBE.i = 0; PROBE.res = [];
          window.probeBegin(now);
          return;
        }
        if (cx !== PROBE.ctx && !PX.all) {
          PROBE.on = false; PROBE.inS = 0; PROBE.c0 = '';
          window.probeRestore(); window.probeFreeze(false);
          window.probeShow('PROBE dibatalkan (pindah ' + (PROBE.ctx === 'ov' ? 'dari overview' : 'dari sektor') + ').\nDiam di overview / sektor 3 dtk, otomatis mulai ulang.', false);
          return;
        }
        var el = now - PROBE.t0;
        if (el > 1200 && iv > 0 && iv < 1000) {
          PROBE.iv.push(iv); PROBE.js.push(js);
          var gq = (PP.cur && PP.cur['pl.gpu']) || 0;
          if (gq > 0) { PROBE.gs += gq; PROBE.gn++; }
        }
        if (el > 1200 && !PROBE.pfR) {
          PROBE.pfR = 1; PROBE.pfT = performance.now();
          try { if (PL3D.pf) { PL3D.pf.n = 0; PL3D.pf.max = 0; PL3D.pf.last = 0; } } catch (ePf2) {}
        }
        if (now - PROBE.txu > 400) {
          PROBE.txu = now;
          window.probeShow('PROBE [' + (PROBE.ctx === 'ov' ? 'OVERVIEW' : 'SEKTOR') + '] ' + (PROBE.i + 1) + '/' + PROBE.seq.length + '   ' + PROBE.seq[PROBE.i][0] +
            '\nsisa +-' + Math.max(0, Math.round((PROBE.seq.length - PROBE.i) * 4.2 - el / 1000)) + ' dtk   (jangan sentuh layar)', false);
        }
        if (el < 4200) return;
        var pfq = null, pfd = 0;
        try { pfq = PL3D.pf || null; } catch (ePf3) {}
        if (PROBE.pfT) pfd = (performance.now() - PROBE.pfT) / 1000;
        PROBE.res.push([
          PROBE.seq[PROBE.i][0],
          window.probeTrim(PROBE.iv),
          window.probeMed(PROBE.iv, .9),
          window.probeMed(PROBE.js, .5),
          (pfq && pfd > .5) ? pfq.n / pfd : 0,
          pfq ? pfq.max : 0,
          PROBE.gn ? PROBE.gs / PROBE.gn : 0
        ]);
        PROBE.i++;
        if (PROBE.i < PROBE.seq.length) { window.probeBegin(now); return; }
        window.probeRestore(); window.probeFreeze(false);
        PROBE.dn[PROBE.ctx] = 1; PROBE.on = false; PROBE.c0 = ''; PROBE.inS = 0;
        window.probeShow(window.probeReport(PROBE.res), true);
      };

      window.__WH_AD_instProbe = true;
      return true;
    } catch (e) {
      try { console.warn('[19] installProbe', e); } catch (e2) {}
      return false;
    }
  }

  function installWP() {
    if (window.__WH_AD_instWP) return true;
    try {
      /* 09-wormhole.js = IIFE strict: WP / wpM / wpRec / wpEnd / WSK / WFB / WH_* / dpr PRIVATE di sana.
         Satu-satunya jalan masuk dari luar = hook WORMHOLE.dbgAttach(obj) + WORMHOLE.dbgInfo() (ditambahkan di 09).
         Objek WP di bawah = salinan setia recorder lama 09 (L218–290); field r/t/s/ph/l/sk dipakai bersama 09 (L318, L703). */
      var WH = window.WORMHOLE;
      if (!WH || typeof WH.dbgAttach !== 'function' || typeof WH.dbgInfo !== 'function') {
        try { console.warn('[19] installWP: 09-wormhole.js belum punya hook dbgAttach/dbgInfo'); } catch (e0) {}
        return false;
      }
      var WP = { r: [], t: 0, ph: '', lf: {}, pt: [], lfSup: 'none', sk: 0 };
      var WFB = [];
      WP.fb = WFB;

      /* v12d: atribusi frame macet lewat Long Animation Frames (Chromium 123+; fallback longtask). */
      try {
        var _ty = (window.PerformanceObserver && PerformanceObserver.supportedEntryTypes) || [];
        var _tn = _ty.indexOf('long-animation-frame') >= 0 ? 'long-animation-frame' : (_ty.indexOf('longtask') >= 0 ? 'longtask' : '');
        if (_tn) {
          WP.lfSup = _tn === 'longtask' ? 'longtask' : 'LoAF';
          new PerformanceObserver(function (l) {
            l.getEntries().forEach(function (e) {
              if (e.duration < 150) return;
              var sc = 0, fl = 0, src = '', i, S = e.scripts || [], bn = 0, pp = null, pt = WP.pt || [], end = e.startTime + e.duration;
              for (i = pt.length - 1; i >= 0; i--) if (pt[i][0] <= e.startTime + 1) { pp = pt[i]; break; }
              if (!pp || (pp[1] !== 'zoom' && pp[1] !== 'tunnel' && pp[1] !== 'exit')) return;   /* hanya selama dive; boot/idle diabaikan */
              for (i = 0; i < S.length; i++) {
                sc += S[i].duration || 0; fl += S[i].forcedStyleAndLayoutDuration || 0;
                if ((S[i].duration || 0) > bn) { bn = S[i].duration; src = String(S[i].sourceURL || '').split('/').pop().split('?')[0] + ':' + (S[i].sourceFunctionName || S[i].invoker || '?'); }
              }
              var rn = e.renderStart > 0 ? Math.max(0, end - e.renderStart) : 0, sl = e.styleAndLayoutStart > 0 ? Math.max(0, end - e.styleAndLayoutStart) : 0;
              var L = WP.lf[pp[1]] || (WP.lf[pp[1]] = []);
              L.push({ o: e.startTime - pp[0], d: e.duration, sc: sc, rn: rn, sl: sl, fl: fl, bd: e.blockingDuration || 0, src: src });
              L.sort(function (x, y) { return y.d - x.d; }); if (L.length > 3) L.length = 3;
            });
          }).observe({ type: _tn, buffered: false });
        }
      } catch (eLF) {}

      /* v12f: pembungkus window.frame + fungsi gambar/logika yang dipanggil frame() (frame sky >150ms dirinci per fungsi).
         WSK (private 09) diganti WP.sk, dibaca & di-nol-kan tick 09. Catatan: dipasang SETELAH window load, jadi fungsi dari file
         belakangan (planet3dDraw dst.) ikut terbungkus; versi lama hanya yang sudah ada saat 09 di-parse. */
      try {
        var _wf0 = window.frame;
        if (typeof _wf0 === 'function') {
          var _wn = ['drawStars','drawCons','drawSectorOverview','drawAsteroids','drawHud','planet3dDraw','mwDraw','sectDrawSky','drawPortals','drawPleiades','drawTxLines','drawTxTop','drawTriggerVisuals','drawFloatingTelescope','drawFloatingTelescopeTop','drawBeltFx','drawBHShockwaves','drawHoleSafe','drawFocusFx','drawPulses','drawShooting','drawSupernovaBursts','drawTargetLock','drawSectFlash','sectStep','syncSkyPanHits','plateBlit','bandDimDraw','updateHover','fsTick','updateConstellationFocus','focusStep','sectorScanUpdate','ensureCamGrid','updateAudioViz','updateTimeDilation','updateClockDilation','placeSecretMsg','planetBhClamp','bhScaleStep','teleGreetFollow','startRenderLoop','drawSectorOverview'], _wa = {};
          _wn.forEach(function (nm) {
            var f = window[nm]; if (typeof f !== 'function' || f.__wp) return;
            var w = function () { var t = performance.now(); try { return f.apply(this, arguments); } finally { _wa[nm] = (_wa[nm] || 0) + performance.now() - t; } };
            w.__wp = 1; window[nm] = w;
          });
          window.frame = function (n) {
            var t = performance.now(), r, k;
            for (k in _wa) _wa[k] = 0;
            try { r = _wf0.apply(this, arguments); } finally {
              var d = performance.now() - t; WP.sk += d;
              if (d > 150 && WP.pt) {
                var pp = null, i, pt = WP.pt;
                for (i = pt.length - 1; i >= 0; i--) if (pt[i][0] <= t + 1) { pp = pt[i]; break; }
                var bk = []; for (k in _wa) if (_wa[k] > 8) bk.push([k, _wa[k]]);
                bk.sort(function (a, b) { return b[1] - a[1]; });
                WFB.push({ ph: pp ? pp[1] : '?', o: pp ? t - pp[0] : 0, d: d, bk: bk.slice(0, 5) });
                WFB.sort(function (a, b) { return b.d - a.d; }); if (WFB.length > 4) WFB.length = 4;
              }
            } return r;
          };
        }
      } catch (eWk) {}

      /* v9: biaya tick per bagian drawFrame. ph dikirim 09 (state/S.cov private di sana). */
      WP.m = function (n, ph) {
        var t = performance.now(), o = WP.s || (WP.s = {}), p = o[ph] || (o[ph] = {}), c = p[n] || (p[n] = [0, 0]);
        c[0] += t - WP.l; c[1]++; WP.l = t;
      };
      WP.rec = function (now, ph, q, js, sky, lead) {   /* js = ms dari awal vsync (now) sampai akhir tick ini = CPU/JS main-thread */
        if (ph === 'enter' && WP.ph !== 'enter') { WP.r = []; WP.t = 0; WP.s = {}; }
        if (WP.pt && WP.ph !== ph) { WP.pt.push([now, ph]); if (WP.pt.length > 400) WP.pt.splice(0, 200); }   /* v12e: riwayat transisi fase utk melabeli entri LoAF */
        if (WP.t) WP.r.push([ph, now - WP.t, Math.round(q), js == null ? 0 : js, sky || 0, lead || 0]);
        WP.t = now; WP.ph = ph;
      };
      WP.end = function () {
        if (!WP || !WP.r.length) return;
        try {
          var I = WH.dbgInfo(), WH_DBG = I.dbg || '';
          var R = WP.r, out = [], P = ['enter', 'zoom', 'tunnel', 'exit'], i, j, a, ms, md, mx, tot = 0, w = R.slice().sort(function (x, y) { return y[1] - x[1]; }).slice(0, 6);
          for (i = 0; i < P.length; i++) {
            a = R.filter(function (x) { return x[0] === P[i]; }); if (!a.length) continue;
            ms = a.map(function (x) { return x[1]; }).sort(function (x, y) { return x - y; });
            for (j = 0, tot = 0; j < ms.length; j++) tot += ms[j];
            md = ms[ms.length >> 1]; mx = ms[ms.length - 1];
            var jj = a.map(function (x) { return x[3]; }).sort(function (x, y) { return x - y; }), sk = a.map(function (x) { return x[4]; }).sort(function (x, y) { return x - y; }), tk = a.map(function (x) { return Math.max(0, x[3] - x[5]); }).sort(function (x, y) { return x - y; }), ot = a.map(function (x) { return Math.max(0, x[5] - x[4]); }).sort(function (x, y) { return x - y; });
            out.push(P[i] + '  n=' + a.length + '  fps~' + (1000 * a.length / Math.max(1, tot)).toFixed(0) + '  med ' + md.toFixed(0) + 'ms  p95 ' + ms[Math.min(ms.length - 1, Math.floor(ms.length * .95))].toFixed(0) + '  max ' + mx.toFixed(0) + '  | js med ' + jj[jj.length >> 1].toFixed(0) + ' max ' + jj[jj.length - 1].toFixed(0) + ' = sky med ' + sk[sk.length >> 1].toFixed(0) + ' max ' + sk[sk.length - 1].toFixed(0) + ' + rAF-lain med ' + ot[ot.length >> 1].toFixed(0) + ' max ' + ot[ot.length - 1].toFixed(0) + ' + tick-sendiri med ' + tk[tk.length >> 1].toFixed(0) + ' max ' + tk[tk.length - 1].toFixed(0));
          }
          try { ['zoom', 'tunnel', 'exit'].forEach(function (ph) { var p = WP.s && WP.s[ph]; if (!p) return; out.push('  ' + ph + ' ms/frame: ' + ['pre', 'fresh', 'step', 'comp', 'streak', 'vig', 'ring', 'tele'].map(function (k) { return p[k] ? k + ' ' + (p[k][0] / p[k][1]).toFixed(1) : ''; }).filter(Boolean).join(' | ')); }); } catch (eS) {}
          out.push('terburuk: ' + w.map(function (x) { return x[0] + '@' + x[2] + ' ' + x[1].toFixed(0) + 'ms(js ' + x[3].toFixed(0) + ' sky ' + x[4].toFixed(0) + ')'; }).join(' | '));
          if (typeof window.__whMk === 'string') out.push('sectStep(in) ms: ' + window.__whMk);
          try { out.push('sky frame() >150ms (fase +ms: total | fungsi ms): ' + (WFB.length ? WFB.map(function (x) { return '[' + x.ph + ' +' + Math.round(x.o) + '] ' + Math.round(x.d) + ' | ' + (x.bk.length ? x.bk.map(function (b) { return b[0] + ' ' + Math.round(b[1]); }).join(', ') : '(tak terinci)'); }).join('  ;  ') : 'tidak ada')); } catch (eFB) {}
          try { ['zoom', 'tunnel', 'exit'].forEach(function (ph) { var L = WP.lf && WP.lf[ph]; out.push(WP.lfSup + ' ' + ph + ' >150ms (+ms dlm fase: total | script | render | s+l | forced | sumber): ' + (L && L.length ? L.map(function (x) { return '[+' + Math.round(x.o) + '] ' + Math.round(x.d) + ' | ' + Math.round(x.sc) + ' | ' + Math.round(x.rn) + ' | ' + Math.round(x.sl) + ' | ' + Math.round(x.fl) + ' | ' + (x.src || '-'); }).join('  ;  ') : 'tidak ada')); }); } catch (eL) {}
          if (window.__plSt) out.push('planet3d sejak zoom-in: resize ' + window.__plSt.rs + ' | render-penuh ' + window.__plSt.fl + ' (terlama ' + window.__plSt.mx + 'ms' + (/(^|,)plfin(,|$)/.test(WH_DBG) ? ', GPU' : ', js') + ')');   /* diisi 05-sector-ui.js (blok u>=1 fase in) */
          var el = document.getElementById('whperf') || document.body.appendChild(document.createElement('div'));
          el.id = 'whperf'; el.style.cssText = 'position:fixed;left:6px;right:6px;top:6px;z-index:99999;background:rgba(0,0,0,.82);color:#9ff;font:11px/1.45 monospace;white-space:pre-wrap;padding:8px 10px;border-radius:8px;pointer-events:auto';
          el.textContent = 'whperf (tap = tutup) zoom=' + (I.zoom ? 'on' : 'off') + ' dpr=' + I.dpr.toFixed(2) + ' dbg=' + (WH_DBG || '-') + ' | build v19 ring=' + I.ring + ' step=' + I.step + ' bloom=' + (I.nobloom ? 'zoomOFF' : 'on') + ' tele=' + (typeof SCP3D_WHALT !== 'undefined' ? SCP3D_WHALT : 'LAMA(13 belum v16)') + ' cov=' + (typeof WORMHOLE !== 'undefined' && ('covered' in WORMHOLE) ? 'ok' : 'LAMA') + '\n' + out.join('\n'); el.onclick = function () { el.remove(); };
        } catch (e) {}
      };

      WH.dbgAttach(WP);
      window.__WH_AD_instWP = true;
      return true;
    } catch (e) {
      try { console.warn('[19] installWP', e); } catch (e2) {}
      return false;
    }
  }

  function installMuff() {
    if (window.__WH_AD_instMuff) return true;
    try {
      if (typeof AV === 'undefined' || !AV) return false;
      AV._dbg = true;
      /* spatialDbg sudah di 01-core (guard AV._dbg); pastikan ada fallback kalau hilang */
      if (typeof window.spatialDbg !== 'function') {
        window.spatialDbg = function spatialDbg(msg) {
          if (!AV || !AV._dbg) return;
          var el = document.getElementById('muff-dbg');
          if (!el) {
            el = document.createElement('div');
            el.id = 'muff-dbg';
            el.style.cssText = 'position:fixed;left:6px;top:6px;z-index:99999;font:10px/1.35 monospace;color:#8eeeff;background:rgba(0,0,0,.7);padding:4px 6px;pointer-events:none;white-space:pre';
            document.body.appendChild(el);
          }
          el.textContent = msg;
        };
      }
      /* #muff-dbg (dibuat 01-core.spatialDbg di kiri-atas) bertabrakan dengan overlay PERF/WP di kiri-atas → pindah ke kiri-bawah lewat stylesheet */
      if (!document.getElementById('muff-dbg-pos')) {
        var ms = document.createElement('style'); ms.id = 'muff-dbg-pos';
        ms.textContent = '#muff-dbg{top:auto!important;bottom:calc(6px + env(safe-area-inset-bottom,0px))!important;left:6px!important;max-width:60vw}';
        (document.head || document.documentElement).appendChild(ms);
      }
      window.__WH_AD_instMuff = true;
      return true;
    } catch (e) {
      try { console.warn('[19] installMuff', e); } catch (e2) {}
      return false;
    }
  }

  /* boot installers sesuai flag / MODE */
  try {
    if (MODE === 'perf' || MODE === 'probe' || flag('perf') || flag('probe') || perfLS()) installPerf();
    if (MODE === 'probe' || flag('probe')) installProbe();
    if (MODE === 'whperf' || flag('whperf')) installWP();
    if (/[?&]muffdbg\b/.test(Q) || flag('muffdbg')) installMuff();
  } catch (eInst) {
    try { console.warn('[19] install boot', eInst); } catch (e2) {}
  }

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
    /* muffdbg toggle (tanpa reload): nyalakan/matikan overlay #muff-dbg spatial audio */
    var muffOn = !!(window.AV && window.AV._dbg);
    var muffB = btn('muff: ' + (muffOn ? 'ON' : 'off'), function () {
      try {
        if (typeof AV === 'undefined' || !AV) return;
        if (!AV._dbg) { installMuff(); AV._dbg = true; }
        else { AV._dbg = false; var me = document.getElementById('muff-dbg'); if (me && me.parentNode) me.parentNode.removeChild(me); }
        muffB.textContent = 'muff: ' + (AV._dbg ? 'ON' : 'off');
      } catch (eMf) {}
    }, muffOn);
    trRow.appendChild(muffB);
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
    installPerf: installPerf,
    installProbe: installProbe,
    installWP: installWP,
    installMuff: installMuff,
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
