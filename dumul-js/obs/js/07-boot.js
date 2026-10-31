'use strict';
/* 07-boot.js — boot, layout editor, render loop */
/* ---------- v41.4 boot / media warm-up ----------
   First visit → full boot + matrix rain. Repeat visit in same session →
   shortened minMs via sessionStorage flag. */
(function(){
  var bs=document.getElementById('boot-screen'),fill=document.getElementById('boot-fill'),pct=document.getElementById('boot-pct'),sig=document.getElementById('boot-signal'),mx=document.getElementById('boot-matrix');
  var matrixRAF=0,matrixAlive=false;
  var isRepeatVisit=false;
  try{
    isRepeatVisit=!!sessionStorage.getItem('obs_booted');
    /* PP-9: marker ditulis di enterObservatory() (masuk sukses), bukan di sini — reload sebelum Blue tetap dihitung first visit. */
  }catch(e){}

  /* Boot matrix: head glow, glyph mix, clean telemetry (no glitch) */
  matrixAlive=true;
  var bootT0=performance.now();
  var statusEl=document.getElementById('boot-status');
  var quoteEl=document.getElementById('boot-quote');
  /* Fixed-width labels so the panel stays tidy while lines cycle. */
  var teleFrames=[
    [T('boot.observer'),T('boot.detected')],
    [T('boot.audio'),T('boot.buffering')],
    [T('boot.starmap'),T('boot.aligning')],
    [T('boot.lens'),T('boot.nominal')],
    [T('boot.audio'),T('boot.ready')],
    [T('boot.signal'),T('boot.stable')],
    [T('boot.starmap'),T('boot.locked')]
  ];
  var teleIdx=0,teleLast=0;
  function padLabel(s,n){
    s=String(s);
    while(s.length<n)s+=' ';
    return s;
  }
  function paintTelemetry(force){
    if(!statusEl)return;
    var now=performance.now();
    if(!force&&now-teleLast<1100)return;
    teleLast=now;
    var rows=[];
    for(var r=0;r<4;r++){
      var f=teleFrames[(teleIdx+r)%teleFrames.length];
      rows.push('[ '+padLabel(f[0],12)+']  <span class="ok">'+f[1]+'</span>');
    }
    teleIdx++;
    statusEl.innerHTML=rows.join('\n');
  }
  paintTelemetry(true);
  /* Quote fades in mid-boot, stays through the handoff. */
  setTimeout(function(){if(quoteEl)quoteEl.classList.add('on');},1600);

  if(mx&&reduce){
    /* PP-4: prefers-reduced-motion → tanpa hujan matrix (background #boot-screen sudah gelap). */
    matrixAlive=false;
  }
  /* Hujan matrix sudah dijalankan lebih awal oleh inline <script> RAIN-EARLY di index.html (window.__rain: Worker + OffscreenCanvas, knob di sana).
     Di sini cuma ditandai + disediakan matrixKill supaya enterObservatory() mematikannya. */
  var matrixKill=function(){try{if(window.__rain)window.__rain.kill();}catch(eRk){}};
  try{if(mx)mx.setAttribute('data-boot','1');}catch(eDb){}

  var stars=STELLAR_KEYS.map(function(k){return SFX[k];}),t0=bootT0,done=false; /* semua audio SFX dari registry */
  /* Baseline perangkat nyata: capsule selalu lewat maxMs (0/16 metadata), jadi tuas efektif = gate Tier-0 + maxMs lebih pendek. */
  var minMs=isRepeatVisit?1500:(IS_POTATO?5000:3200);
  var maxMs=isRepeatVisit?3000:(IS_POTATO?9000:6000);
  var choicesEl=document.getElementById('boot-choices');
  var capBlue=document.getElementById('boot-cap-blue');
  var capRed=document.getElementById('boot-cap-red');
  /* PP-2/PP-3: Tier-0 = SFX yang paling mungkin dibunyikan pertama (aldebaran = tap pertama di probe; Orion). Hanya ini yang di-load saat boot,
     preload='metadata' + gate readyState>=1. JANGAN 'auto': di Chrome Android itu menarik file penuh (±3 MB/file, terbukti di probe) dan bikin Tier-0 lebih lambat; tap pertama tetap lewat safePlay (±0.3-0.4 dtk). Sisanya dihangatkan setelah masuk (warmRest). */
  var tier0=['aldebaran','betel','rigel'].map(function(k){return SFX[k];}).filter(Boolean);
  if(!tier0.length)tier0=stars.slice(0,3);
  tier0.forEach(function(a){try{a.preload='metadata';a.load();}catch(e){}});
  function tier0Count(){var n=0;for(var i=0;i<tier0.length;i++)if(tier0[i].readyState>=1)n++;return n;}
  /* Hangatkan sisa audio bertahap (3 file per 400ms) agar tidak bersaing dgn frame pertama / SW install. Satu jalur retry tetap milik safePlay. */
  var warmed=false;
  function warmRest(){
    if(warmed)return;warmed=true;
    var q=stars.filter(function(a){return tier0.indexOf(a)<0;});
    try{q.push(MUSIC_COLLAP,AMB,GARG);}catch(e){}
    (function step(){
      for(var n=0;n<3&&q.length;n++){
        var a=q.shift();
        try{
          if(a&&a.readyState<1&&a.paused&&!a._retrying&&!a._want){a.preload='metadata';a.load();}
        }catch(e){}
      }
      if(q.length)setTimeout(step,400);
    })();
  }
  function readyCount(){return tier0Count();}
  function enterObservatory(){
    if(bs.classList.contains('off'))return;
    bs.classList.add('off');
    try{performance.mark('obs-blue');}catch(eM){}
    matrixAlive=false;
    if(matrixKill){try{matrixKill();}catch(eMk){}matrixKill=null;}
    if(matrixRAF){cancelAnimationFrame(matrixRAF);matrixRAF=0;}
    bootDone=true;
    try{sessionStorage.setItem('obs_booted','1');}catch(eSs){}   /* PP-9 */
    startRenderLoop();
    window.__obsEntered=true;
    try{window.dispatchEvent(new Event('obs-entered'));}catch(eEv){}   /* PP-12: index.html mendaftarkan SW setelah ini */
    var wr=window.requestIdleCallback||function(f){return setTimeout(f,300);};
    wr(function(){setTimeout(warmRest,1200);},{timeout:3000});   /* setelah frame pertama (±0.5s di SM-T837A) */
    setTimeout(function(){if(bs&&bs.parentNode)bs.remove();},850);
  }
  function finish(){
    if(done)return;done=true;
    try{performance.mark('obs-capsule');}catch(eM){}   /* dibaca 19-auto-debug (Trace); murah */
    fill.style.width='100%';pct.textContent='100%';sig.classList.add('on');
    if(quoteEl)quoteEl.classList.add('on');
    if(statusEl)statusEl.innerHTML=
      '[ '+padLabel(T('boot.observer'),12)+']  <span class="ok">'+T('boot.online')+'</span>\n'+
      '[ '+padLabel(T('boot.starmap'),12)+']  <span class="ok">'+T('boot.locked')+'</span>\n'+
      '[ '+padLabel(T('boot.signal'),12)+']  <span class="ok">'+T('boot.open')+'</span>\n'+
      '[ '+padLabel(T('boot.boot'),12)+']  <span class="ok">'+T('boot.complete')+'</span>';
    /* Capsule gate: wait for user choice instead of auto-entering. */
    if(choicesEl){
      choicesEl.classList.add('on');
      choicesEl.setAttribute('aria-hidden','false');
    }
  }
  if(capBlue){
    capBlue.addEventListener('click',function(){
      haptic(12);
      enterObservatory();
    });
  }
  if(capRed){
    capRed.addEventListener('click',function(){
      haptic(12);
      try{
        window.open('https://github.com/dumul17/dumul17.github.io/blob/main/index.html','_blank','noopener');
      }catch(e){
        location.href='https://github.com/dumul17/dumul17.github.io/blob/main/index.html';
      }
      /* Red already used — drop Red + or, leave Blue centered. */
      var redChoice=document.getElementById('boot-choice-red');
      var orEl=document.getElementById('boot-or');
      if(redChoice)redChoice.style.display='none';
      if(orEl)orEl.style.display='none';
      if(choicesEl){
        choicesEl.style.justifyContent='center';
        choicesEl.style.gap='0';
      }
    });
  }
  var pLast=0;
  function tick(){
    var now=performance.now(),elapsed=now-t0,rc=readyCount(),readyRatio=rc/tier0.length;
    var timeRatio=Math.min(1,Math.max(0,elapsed/minMs));
    var p=Math.min(99,Math.round((timeRatio*.72+readyRatio*.28)*100));
    if(elapsed>=minMs)p=Math.min(99,Math.max(p,90+Math.round(readyRatio*9)));
    /* PP-2 anti-jump: maks +5%/tick (frame jank / batch event tidak bikin bar loncat). */
    if(p>pLast+5)p=pLast+5;
    if(p<pLast)p=pLast;
    pLast=p;
    fill.style.width=p+'%';pct.textContent=p+'%';
    paintTelemetry(false);
    /* Gate = aset halaman siap (window load: gambar nebula/milky-way), bukan audio: tap pertama tetap ±0.4 dtk lewat safePlay walau audio belum siap (probe). maxMs = safety net. */
    if(elapsed>=minMs && (document.readyState==='complete' || elapsed>=maxMs))finish();
    else requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();

tickClock();setInterval(tickClock,1000);
var rt;
function scheduleLayout(){
  clearTimeout(rt);
  rt=setTimeout(layout,120);
}
/* Stage (putar/skala) langsung diperbarui begitu ukuran/orientasi berubah; layout() penuh tetap di-debounce. */
function onGeo(){try{if(W&&!SW)stageCalc();}catch(eG){}scheduleLayout();}
window.addEventListener('resize',onGeo);
window.addEventListener('orientationchange',onGeo);
/* Landscape-kiri <-> landscape-kanan tidak mengubah ukuran viewport, jadi cuma event orientasi yang kena. */
try{if(screen.orientation&&screen.orientation.addEventListener)screen.orientation.addEventListener('change',onGeo);}catch(eO){}
/* Hybrid: visualViewport covers mobile URL-bar / soft-keyboard resizes that
   window.resize sometimes misses. Same debounced scheduler — not a replace. */
if(window.visualViewport){
  window.visualViewport.addEventListener('resize',onGeo);
}
/* ready starts false: this object existing only means the script parsed,
   not that boot finished and the render loop is actually running. Flipped
   to true from startRenderLoop() once frames are really being produced. */

/* ========== LAYOUT EDITOR v4 (?layout=1) ==========
   Buka: dumul17.github.io/?layout=1  → masuk sektor (tap ikon) → tap rasi → geser / handle pojok kanan-bawah = ukuran.
   PREVIEW = lihat hasil asli tanpa HUD (tombol ✎ EDIT di pojok kembali). SAVE = draft di localStorage.
   COPY = teks buat ditempel ke sky-data.js (nilai ABSOLUT: scene/ple/ov + SKY.fit).
   Draft otomatis dibuang kalau sky-data.js berubah (jadi data baru nggak ketimpa draft lama).
   =================================================== */

/* Override layar (ov) dari sky-data.js / editor. Nilai editor = ABSOLUT (menggantikan ov sky-data, bukan ditumpuk).
   Dipanggil di akhir layout(), untuk SEMUA sektor (bukan cuma sektor yang lagi dibuka). */
window.__applyLayOV=function(){
  var ov={};
  SKY.rasi.forEach(function(r){
    if(r.scene||r.ple||r.off)return;
    var s=window.__layOV&&window.__layOV[r.id],o=s||r.ov;if(!o)return;
    ov[r.id]={ox:o.ox||0,oy:o.oy||0,k:o.k||1,th:o.th||0};
  });
  Object.keys(ov).forEach(function(id){
    var o=ov[id],c=cons(id);if(!c||c.minX==null||c.minX>1e8)return;
    var cx=(c.minX+c.maxX)/2,cy=(c.minY+c.maxY)/2,k=o.k,th=o.th*Math.PI/180,cs=Math.cos(th),sn=Math.sin(th);
    (window.__ovPivot=window.__ovPivot||{})[id]=[cx,cy]; /* titik putar dasar tiap rasi (dipakai edit grup sektor) */
    var nMin=1e9,nMax=-1e9,nMinY=1e9,nMaxY=-1e9;
    Object.keys(c.stars).forEach(function(key){
      var s=c.stars[key],dx=(s.x-cx)*k,dy=(s.y-cy)*k;
      s.x=cx+dx*cs-dy*sn+o.ox;s.y=cy+dx*sn+dy*cs+o.oy;
      if(s.x<nMin)nMin=s.x;if(s.x>nMax)nMax=s.x;if(s.y<nMinY)nMinY=s.y;if(s.y>nMaxY)nMaxY=s.y;
    });
    c.minX=nMin;c.maxX=nMax;c.minY=nMinY;c.maxY=nMaxY;
    if(c.nebula){var n=c.nebula,ndx=(n.x-cx)*k,ndy=(n.y-cy)*k;n.x=cx+ndx*cs-ndy*sn+o.ox;n.y=cy+ndx*sn+ndy*cs+o.oy;}
  });
};

/* Layout editor dipindah ke 20-layout-editor.js (lazy: index.html hanya memuatnya kalau ?layout=1 / localStorage.obs_layout_on=1). Yang tetap di sini: flag + class body, supaya
   isLayoutEdit() (01/02/04/05/06) sudah true sebelum boot() pertama walau 20 baru dieksekusi sesudah script ini. __applyLayOV (atas) tetap produksi. */
(function(){
  var en=false;
  try{en=/[?&]layout=1\b/.test(location.search)||localStorage.getItem('obs_layout_on')==='1';}catch(e){}
  if(en){window.__layoutEditMode=true;document.body.classList.add('layout-edit');}
})();

window.__hub={ready:false};
if(document.fonts&&document.fonts.addEventListener){document.fonts.addEventListener('loadingdone',function(){if(W)layout();});}
function boot(){
  if(W)return;
  START=performance.now();
  layout();
  nextSS=START+5000;
  if(bootDone)startRenderLoop();
}
if(document.fonts&&document.fonts.ready){document.fonts.ready.then(boot);setTimeout(function(){if(!W)boot();},1500);}else{boot();}

/* ===== Panel pamitan (back terakhir sebelum keluar site) =====
   Dialog gaya visual-novel (kayak kotak dialog Harvest Moon) tapi tema observatory: karakter yang bicara nongol di sudut kiri-atas panel.
   Teleskop menyampaikan pesan Dumb Owl; Dumb Owl sendiri cuma bisa "..." (potret ganti jadi owl waktu dia bicara).
   DOM dibuat sekali, malas (lazy), dari JS. Teks lewat T('exit.*') di i18n.js. Dibuka/ditutup oleh backNav di bawah (EXITP.open / EXITP.stay).
   Body dikasih class 'owl-block' selama panel terbuka, supaya sky/BH/portal tidak ikut kena sentuhan (mekanisme yang sama dengan panel About). */
var EXITP=(function(){
  var P=null,BD=null,NAME,TA,TB,NEXT,CH,E={open:false,i:0,typing:false,tm:0,fin:null,bt:0,leaving:false,doLeave:null};
  var SCRIPT=[
    {w:'t',k:'exit.l1',m:'n'},
    {w:'t',k:'exit.l2',m:'smile'},
    {w:'o',k:'exit.l3',m:'n',sp:95},          /* Dumb Owl: cuma "..." (diketik pelan) */
    {w:'t',k:'exit.l4',m:'smile'},
    {w:'t',k:'exit.l5',m:'soft'},
    {w:'t',k:'exit.l6',m:'smile'}
  ];
  var TELE_SVG='<svg class="ex-tele" viewBox="0 0 64 64" aria-hidden="true">'+
    '<g stroke="#3e5f72" stroke-width="2.2" stroke-linecap="round" fill="none"><path d="M33 42 L22 60"/><path d="M33 42 L33 61"/><path d="M33 42 L45 60"/></g>'+
    '<circle cx="33" cy="41" r="3.2" fill="#143042" stroke="#6ee5ff" stroke-width="1.2"/>'+
    '<g transform="rotate(-16 33 32)">'+
      '<rect x="49" y="27" width="9" height="10" rx="3" fill="#10222e" stroke="#6ee5ff" stroke-width="1.2"/>'+
      '<rect x="12" y="22" width="40" height="20" rx="8" fill="#0d1b26" stroke="#6ee5ff" stroke-width="1.4"/>'+
      '<rect x="6" y="20" width="9" height="24" rx="4" fill="#10222e" stroke="#6ee5ff" stroke-width="1.4"/>'+
      '<ellipse class="tl-glow" cx="7.5" cy="32" rx="2.2" ry="9" fill="#6ee5ff"/>'+
      '<circle cx="26" cy="30" r="3" fill="#eafcff"/><circle cx="38" cy="30" r="3" fill="#eafcff"/>'+
      '<circle cx="26.6" cy="30.4" r="1.4" fill="#0d1b26"/><circle cx="38.6" cy="30.4" r="1.4" fill="#0d1b26"/>'+
      '<g class="tl-blush" fill="#ff9ad9" opacity=".5"><circle cx="21" cy="35.5" r="2.2"/><circle cx="43" cy="35.5" r="2.2"/></g>'+
      '<g fill="none" stroke="#8eeeff" stroke-width="1.7" stroke-linecap="round">'+
        '<path class="tl-m tl-m-n" d="M29 37.3 q3 .5 6 0"/>'+
        '<path class="tl-m tl-m-smile" d="M28 36 q4 4.6 8 0"/>'+
        '<path class="tl-m tl-m-soft" d="M29.5 38.4 q2.5 -2.4 5 0"/>'+
      '</g>'+
    '</g></svg>';
  var OWL_SVG='<svg class="ex-owl" viewBox="0 0 64 64" aria-hidden="true">'+
    '<g stroke="#ffb3e0" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">'+
      '<path d="M32 10 C20 10 14 20 14 33 C14 47 22 55 32 55 C42 55 50 47 50 33 C50 20 44 10 32 10Z" fill="#1a0f1c"/>'+
      '<path d="M17 12 L22 20 M47 12 L42 20" fill="none"/>'+
      '<path d="M15 33 C9 37 10 47 18 50 M49 33 C55 37 54 47 46 50" fill="none"/>'+
      '<circle cx="24" cy="29" r="8" fill="#2a1630"/><circle cx="40" cy="29" r="8" fill="#2a1630"/>'+
      '<path d="M26 47 q6 3 12 0 M27 51.5 q5 2.5 10 0" fill="none" opacity=".5" stroke-width="1.2"/>'+
      '<path d="M26 55 v4 M32 55.5 v4 M38 55 v4" fill="none"/>'+
    '</g>'+
    '<circle cx="24" cy="29" r="4" fill="#ffe3f3"/><circle cx="40" cy="29" r="4" fill="#ffe3f3"/>'+
    '<circle cx="25" cy="29.8" r="2" fill="#1a0f1c"/><circle cx="41" cy="29.8" r="2" fill="#1a0f1c"/>'+
    '<circle cx="25.6" cy="29" r=".7" fill="#fff"/><circle cx="41.6" cy="29" r=".7" fill="#fff"/>'+
    '<path class="ow-beak" d="M29.5 36.5 L34.5 36.5 L32 42Z" fill="#ffb3e0" stroke="#ffb3e0" stroke-width="1" stroke-linejoin="round"/></svg>';
  function build(){
    if(P)return;
    var d=document,b=d.body;
    BD=d.createElement('div');BD.id='exit-backdrop';BD.setAttribute('aria-hidden','true');
    P=d.createElement('div');P.id='exit-panel';P.setAttribute('role','dialog');P.setAttribute('aria-modal','true');P.setAttribute('aria-label',T('exit.aria'));
    P.setAttribute('data-who','t');P.setAttribute('data-mood','n');
    P.innerHTML='<div class="ex-portrait">'+TELE_SVG+OWL_SVG+'</div><div class="ex-name"></div>'+
      '<p class="ex-text" aria-live="polite"><span class="ex-a"></span><span class="ex-b" style="visibility:hidden"></span></p><i class="ex-next"></i>'+
      '<div class="ex-choices"><button type="button" data-a="stay"></button><button type="button" data-a="leave"></button></div>';
    b.appendChild(BD);b.appendChild(P);
    NAME=P.querySelector('.ex-name');TA=P.querySelector('.ex-a');TB=P.querySelector('.ex-b');NEXT=P.querySelector('.ex-next');CH=P.querySelector('.ex-choices');
    P.querySelector('[data-a=stay]').textContent=T('exit.stay');P.querySelector('[data-a=leave]').textContent=T('exit.leave');
    /* isolasi: sentuhan di panel / backdrop tidak tembus ke sky */
    [P,BD].forEach(function(el){
      ['pointerdown','pointerup','pointermove','touchstart','touchend','mousedown','mouseup','contextmenu'].forEach(function(tp){
        el.addEventListener(tp,function(e){e.stopPropagation();},{passive:true});
      });
      ['touchmove','wheel'].forEach(function(tp){el.addEventListener(tp,function(e){e.stopPropagation();e.preventDefault();},{passive:false});});
    });
    BD.addEventListener('click',function(e){e.stopPropagation();});
    P.addEventListener('click',function(e){
      e.stopPropagation();
      var btn=e.target.closest&&e.target.closest('button[data-a]');
      if(btn){if(btn.getAttribute('data-a')==='stay')stay();else leave();return;}
      advance();
    });
    d.addEventListener('keydown',function(e){
      if(!E.open)return;
      if(e.key==='Escape'){e.preventDefault();stay();return;}
      if((e.key==='Enter'||e.key===' '||e.key==='ArrowRight'||e.key==='ArrowDown')&&!(e.target&&e.target.closest&&e.target.closest('button'))){e.preventDefault();advance();}
    });
  }
  function say(txt,sp,done){   /* ketik huruf demi huruf; jeda di koma / titik / "..." supaya terasa ngomong */
    clearTimeout(E.tm);var n=0;E.typing=true;P.classList.add('talk');
    function fin(){clearTimeout(E.tm);E.typing=false;E.fin=null;TA.textContent=txt;TB.textContent='';P.classList.remove('talk');if(done)done();}
    E.fin=fin;
    function step(){
      n++;TA.textContent=txt.slice(0,n);TB.textContent=txt.slice(n);
      if(n>=txt.length){fin();return;}
      var c=txt.charAt(n-1),nx=txt.charAt(n),dl=sp;
      if(c===','||c==='—')dl=sp*5;
      else if(c==='.'&&nx==='.')dl=sp*4;
      else if(c==='.'||c==='?'||c==='!')dl=sp*9;
      E.tm=setTimeout(step,dl);
    }
    TA.textContent='';TB.textContent=txt;
    E.tm=setTimeout(step,sp);
  }
  function line(){
    var L=SCRIPT[E.i];
    P.setAttribute('data-who',L.w);P.setAttribute('data-mood',L.m);
    NAME.textContent=T(L.w==='o'?'exit.name.o':'exit.name.t');
    NEXT.classList.remove('on');
    say(T(L.k),L.sp||26,function(){
      if(E.i<SCRIPT.length-1)NEXT.classList.add('on');
      else{CH.classList.add('on');setTimeout(function(){if(E.open&&!E.leaving){var b=P.querySelector('[data-a=stay]');if(b)try{b.focus({preventScroll:true});}catch(e){}}},380);}
    });
  }
  function advance(){
    if(!E.open||E.leaving)return;
    if(E.typing){if(E.fin)E.fin();return;}
    if(E.i<SCRIPT.length-1){E.i++;line();}
  }
  function hide(){
    E.open=false;clearTimeout(E.tm);clearTimeout(E.bt);E.typing=false;E.fin=null;
    if(P){P.classList.remove('on','talk');BD.classList.remove('on');CH.classList.remove('on');NEXT.classList.remove('on');}
    setTimeout(function(){if(!E.open)document.body.classList.remove('owl-block');},380);
  }
  function open(){
    if(E.open)return;
    build();
    E.open=true;E.leaving=false;E.i=0;
    try{teleGreetHide();}catch(e){}
    try{UIS.pop('ask');}catch(eUP){}
    document.body.classList.add('owl-block');
    CH.classList.remove('on');BD.classList.add('on');P.classList.add('on');
    try{haptic(10);}catch(e2){}
    line();
  }
  function stay(){
    if(!E.open||E.leaving)return;
    try{haptic(8);}catch(e){}
    hide();
    E.bt=setTimeout(function(){try{TG.anchor=null;tgShow(T('exit.stay.bub'));}catch(er){}},550);   /* teleskop senang: bubble di kanvas */
  }
  function leave(){
    if(!E.open||E.leaving)return;
    E.leaving=true;try{haptic(8);}catch(e){}
    CH.classList.remove('on');NEXT.classList.remove('on');
    P.setAttribute('data-who','t');P.setAttribute('data-mood','smile');NAME.textContent=T('exit.name.t');
    say(T('exit.bye'),30,function(){
      E.bt=setTimeout(function(){if(E.doLeave)E.doLeave();else{try{history.back();}catch(e){}}},1300);
    });
  }
  function reset(){E.leaving=false;hide();}
  return {open:open,stay:stay,reset:reset,isOpen:function(){return E.open;},setLeave:function(f){E.doLeave=f;}};
})();

/* ===== Tombol Back (tombol back HP / gesture back / Alt+←) =====
   Tiap lapisan yang bisa ditutup punya satu "guard" entry di history; back = tutup lapisan paling atas, urutannya:
   kartu ajak/tinggal → Sector Gate → panel About → panel Tune → music player → kamera rasi → Observation Mode → keluar sektor ke overview.
   Selama transisi sektor back ditelan. Di overview tanpa lapisan terbuka, back TERAKHIR membuka panel pamitan (EXITP: teleskop menyampaikan pesan Dumb Owl);
   back lagi = tutup panel (tinggal), tombol "Maaf, aku harus pergi" = baru benar-benar keluar site (EXITP → doLeave: history.go mundur melewati semua guard).
   Layer dasar (root guard) cuma dipasang setelah boot selesai + ada sentuhan user pertama (aturan Chrome soal entry history "skippable").
   PENTING: guard cuma di-push saat lapisan dibuka (poll 150 ms setelah sentuhan user), TIDAK PERNAH di dalam handler popstate:
   push tanpa sentuhan user membuat Chrome menandai entry sebelumnya "skippable", lalu back berikutnya melompatinya dan keluar site.
   Guard yang baru di-pop dipakai ulang lewat history.go(1). Guard berlebih (lapisan ditutup lewat jalur lain: long-press BH, tombol X, tap luar) dibuang otomatis. */
(function backNav(){
  if(!window.history||!history.pushState)return;
  var g=0,fwd=0,skip=0,leaving=false,touched=false,noRoot=false;
  try{var s0=history.state;if(s0&&s0.dumulBack>0)g=s0.dumulBack|0;}catch(e0){}   /* balik dari halaman lain lewat back: kita lagi duduk di guard lama, anggap itu guard root */
  ['pointerdown','touchstart','mousedown','keydown'].forEach(function(ev){window.addEventListener(ev,function(){touched=true;},{capture:true,passive:true});});   /* g = jumlah guard di history sekarang; fwd = guard yang baru di-pop back dan masih ada di "forward"; skip = history.go() buatan kita yang belum selesai */
  function el(id){return document.getElementById(id);}
  function has(id,c){var e=el(id);return !!(e&&e.classList.contains(c));}
  function layers(){   /* semua lapisan aktif, paling atas dulu: {f:penutup, w:jumlah guard yang dimiliki} */
    var L=[];
    if(typeof isLayoutEdit==='function'&&isLayoutEdit()){   /* layout editor: back = keluar sektor ke overview (sama seperti live), selain itu jangan ikut campur */
      try{if(SECT.busy)L.push({f:function(){},w:1});else if(SECT.cur)L.push({f:function(){if(typeof window.__layBack==='function')window.__layBack();else sectToggle();},w:1});}catch(eL){}
      return L;
    }
    try{
      if(EXITP.isOpen())L.push({f:EXITP.stay,w:0});   /* panel pamitan: back = tutup (tinggal); guard-nya milik layer root di bawah */
      if(LIS&&LIS.ui&&!LIS.ui.hidden)L.push({f:lisCancel,w:(SECT.cur||SECT.busy)?0:1});   /* kartu ajak/tinggal: di dalam sektor muncul DARI back (sektor→overview) jadi nggak punya guard sendiri (guard sektor dipakai ulang); di overview (tap portal) dia lapisan sendiri */
      if(typeof SMENU!=='undefined'&&SMENU.open)L.push({f:function(){smenuClose();},w:1});   /* menu sektor (16): back = tutup menu dulu */
      if(has('owl-panel','on'))L.push({f:function(){var b=el('owl-backdrop');if(b)b.click();},w:1});
      if(has('bh-panel','on'))L.push({f:function(){if(typeof bhTuneClose==='function')bhTuneClose();},w:1});
      if(has('music-player','open'))L.push({f:function(){var c=el('music-close');if(c)c.click();},w:1});
      if(CAMERA_MODE)L.push({f:function(){setCameraMode(false);},w:1});   /* kamera rasi = sub-mode Observation: back pertama matikan kamera saja */
      if(OBSERVE_MODE)L.push({f:function(){setObserveMode(false);},w:1});
      if(SECT.busy)L.push({f:function(){},w:1});                  /* transisi sektor: telan back */
      else if(SECT.cur)L.push({f:sectToggle,w:1});               /* sektor → overview (lewat kartu ajak/tinggal kalau teleskop ada) */
      if(bootDone&&!noRoot&&(touched||g>0))L.push({f:EXITP.open,w:1});     /* layer dasar: back terakhir → panel pamitan (bukan langsung keluar site) */
    }catch(e){}
    return L;
  }
  function need(L){var n=0,i;for(i=0;i<L.length;i++)n+=L[i].w;return n;}
  function sync(fromPop){
    if(document.hidden||skip>0||leaving)return;
    var n=need(layers()),d;
    if(g<n){
      d=n-g;
      if(fromPop&&fwd>=d){skip++;fwd-=d;g+=d;try{history.go(d);}catch(e){skip--;}}   /* guard yang baru di-pop masih ada di forward: maju lagi, BUKAN push (push di dalam handler back = tanpa sentuhan user, Chrome menandai entry sebelumnya "skippable" lalu back berikutnya melompati dan keluar site) */
      else{while(d-->0){try{history.pushState({dumulBack:g+1},'');g++;fwd=0;}catch(e){break;}}}
    }else if(g>n){d=g-n;skip++;g-=d;fwd+=d;try{history.go(-d);}catch(e){skip--;}}   /* lapisan sudah tertutup lewat jalur lain: buang guard berlebih */
  }
  window.addEventListener('popstate',function(e){
    if(leaving)return;
    if(skip>0){skip--;return;}                       /* popstate dari history.go() buatan kita sendiri */
    var dep=(e.state&&e.state.dumulBack)||0,L;
    if(dep>g){fwd=Math.max(0,fwd-(dep-g));g=dep;sync(false);return;}   /* mis. tombol forward desktop masuk lagi ke guard */
    fwd+=g-dep;g=dep;                                 /* guard terpakai oleh back ini (kalau Chrome melompati beberapa, dep sudah menghitungnya) */
    L=layers();if(L.length){try{L[0].f();}catch(er){}}
    sync(true);                                       /* butuh guard lagi? (mis. kartu ajak/tinggal muncul) pakai guard forward, bukan push */
  });
  setInterval(function(){sync(false);},150);
  /* Tombol "Maaf, aku harus pergi": mundur melewati semua guard + entry asli = keluar ke halaman sebelum situs ini.
     Kalau tidak ada halaman sebelumnya (tab baru / PWA) history.go tidak keluar → coba window.close(); kalau tetap di sini,
     JANGAN navigasi ke about:blank (di PWA malah looping). Cukup matikan root guard (noRoot): guard sudah habis, jadi back
     berikutnya dari sistem (tombol/gesture back HP) keluar secara native. Panel ditutup + toast petunjuk. */
  EXITP.setLeave(function(){
    leaving=true;skip=0;
    try{history.go(-(g+1));}catch(e){}
    setTimeout(function(){
      try{window.close();}catch(e1){}
      setTimeout(function(){
        if(document.hidden)return;
        noRoot=true;leaving=false;g=0;fwd=0;skip=0;EXITP.reset();
        try{if(typeof showModeToast==='function')showModeToast(T('exit.native'),null,3200);}catch(e2){}
      },450);
    },700);
  });
  window.addEventListener('pageshow',function(e){   /* kembali dari bfcache setelah keluar: panel jangan nyangkut di state "pamit" */
    if(!e.persisted)return;
    leaving=false;noRoot=false;skip=0;fwd=0;g=(history.state&&history.state.dumulBack)|0;EXITP.reset();
  });
})();
