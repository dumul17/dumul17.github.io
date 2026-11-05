'use strict';
/* 07-boot.js — boot, layout editor, render loop */
/* ===== Karakter Teleskop + Dumb Owl (SVG dipakai bersama: layar boot + panel pamitan EXITP di bawah) =====
   Satu sumber supaya tampilan sama di dua tempat. Sengaja TANPA <defs>/id (dua salinan di DOM tidak bentrok). Isi dibuat SOLID berlapis (dasar + highlight + bayangan)
   di atas piringan latar (dc-disc), bukan outline di atas latar gelap. Kelas kait untuk CSS/JS: tl-m(-n|-smile|-soft) mulut, tl-blush, tl-glow lensa, tl-eyes / ow-eyes (kedip), ow-beak. */
var DUMUL_CHARS=(function(){
  var tele=[
    '<svg class="ex-tele" viewBox="0 0 64 64" aria-hidden="true">',
    '<circle class="dc-disc" cx="32" cy="32" r="30.5" fill="#0f2c3f" stroke="#6ee5ff" stroke-opacity=".6" stroke-width="1.2"/>',
    '<g stroke="#8fc3da" stroke-width="2.6" stroke-linecap="round" fill="none"><path d="M33 42 L22 60"/><path d="M33 42 L33 61"/><path d="M33 42 L45 60"/></g>',
    '<circle cx="33" cy="41" r="3.4" fill="#2f7596" stroke="#a9f3ff" stroke-width="1.3"/>',
    '<g transform="rotate(-16 33 32)">',
      '<rect x="49" y="27" width="9" height="10" rx="3" fill="#2a6784" stroke="#8eeeff" stroke-width="1.3"/>',
      '<rect x="12" y="22" width="40" height="20" rx="8" fill="#1f5b7c" stroke="#8eeeff" stroke-width="1.6"/>',
      '<rect x="15" y="23.4" width="34" height="3.6" rx="1.8" fill="#6cc0e2" opacity=".55"/>',
      '<rect x="15" y="37.2" width="34" height="3.2" rx="1.6" fill="#0a2535" opacity=".5"/>',
      '<rect x="6" y="20" width="9" height="24" rx="4" fill="#2d7195" stroke="#8eeeff" stroke-width="1.6"/>',
      '<ellipse class="tl-glow" cx="7.5" cy="32" rx="2.2" ry="9" fill="#c8fbff"/>',
      '<g class="tl-eyes"><circle cx="26" cy="30" r="3" fill="#fff"/><circle cx="38" cy="30" r="3" fill="#fff"/>',
        '<circle cx="26.6" cy="30.4" r="1.5" fill="#0d1b26"/><circle cx="38.6" cy="30.4" r="1.5" fill="#0d1b26"/></g>',
      '<g class="tl-blush" fill="#ff8fd6" opacity=".85"><circle cx="21" cy="35.5" r="2.2"/><circle cx="43" cy="35.5" r="2.2"/></g>',
      '<g fill="none" stroke="#f4feff" stroke-width="1.7" stroke-linecap="round">',
        '<path class="tl-m tl-m-n" d="M29 37.3 q3 .5 6 0"/>',
        '<path class="tl-m tl-m-smile" d="M28 36 q4 4.6 8 0"/>',
        '<path class="tl-m tl-m-soft" d="M29.5 38.4 q2.5 -2.4 5 0"/>',
      '</g>',
    '</g></svg>'
  ].join('');
  var owl=[
    '<svg class="ex-owl" viewBox="0 0 64 64" aria-hidden="true">',
    '<circle class="dc-disc" cx="32" cy="32" r="30.5" fill="#2a1431" stroke="#ff9ad9" stroke-opacity=".6" stroke-width="1.2"/>',
    '<g stroke="#ffb3e0" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">',
      '<path d="M15 33 C9 37 10 47 18 50 Z" fill="#5c316f"/><path d="M49 33 C55 37 54 47 46 50 Z" fill="#5c316f"/>',
      '<path d="M16.5 11 L23 20 L14 22 Z" fill="#5c316f"/><path d="M47.5 11 L41 20 L50 22 Z" fill="#5c316f"/>',
      '<path d="M32 10 C20 10 14 20 14 33 C14 47 22 55 32 55 C42 55 50 47 50 33 C50 20 44 10 32 10Z" fill="#6f3f84"/>',
      '<ellipse cx="32" cy="46" rx="8.5" ry="6.5" fill="#a874ba" stroke="none" opacity=".6"/>',
      '<circle cx="24" cy="29" r="8" fill="#8a57a3"/><circle cx="40" cy="29" r="8" fill="#8a57a3"/>',
      '<path d="M26 47 q6 3 12 0 M27 51.5 q5 2.5 10 0" fill="none" opacity=".6" stroke-width="1.2"/>',
      '<path d="M26 55 v4 M32 55.5 v4 M38 55 v4" fill="none"/>',
    '</g>',
    '<g class="ow-eyes"><circle cx="24" cy="29" r="4" fill="#fff0f9"/><circle cx="40" cy="29" r="4" fill="#fff0f9"/>',
      '<circle cx="25" cy="29.8" r="2" fill="#1a0f1c"/><circle cx="41" cy="29.8" r="2" fill="#1a0f1c"/>',
      '<circle cx="25.6" cy="29" r=".7" fill="#fff"/><circle cx="41.6" cy="29" r=".7" fill="#fff"/></g>',
    '<path class="ow-beak" d="M29.5 36.5 L34.5 36.5 L32 42Z" fill="#ffc4e6" stroke="#ffc4e6" stroke-width="1" stroke-linejoin="round"/></svg>'
  ].join('');
  return {tele:tele,owl:owl};
})();

/* ---------- v41.4 boot / media warm-up ----------
   First visit → full boot + matrix rain. Repeat visit in same session →
   timeout capsule + batas tunggu lebih pendek (sessionStorage flag). v126: tanpa minMs / Tier-0; progres = unit kerja nyata. */
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

  /* ---- Karakter boot: Dumb Owl (kiri, di atas Merah) + Teleskop (kanan, di atas Biru), di atas judul. SVG = DUMUL_CHARS (sama dgn panel pamitan).
     Peran: (1) lensa teleskop makin terang mengikuti persen; boot lama -> teleskop kalem + owl ngantuk; capsule tampil -> teleskop senyum + owl melek;
            (2) condong + menyala ke capsule masing-masing (hover/fokus/tekan Merah->owl, Biru->teleskop); (3) tap = bubble kecil (owl "..." + glitch judul);
            (4) teleskop "membacakan" status: mulut bergerak sebentar tiap baris status berganti.
     Prinsip beban: TANPA animasi infinite & TANPA rAF sendiri. Semua gerak = ganti class/atribut sesekali (kedip lewat setTimeout, bicara = class 650 ms),
     progres cuma set satu CSS variable saat angka persen berubah. reduced-motion / IS_POTATO -> kelas .calm (tanpa gerak, state tetap tampil). */
  var chEl=document.getElementById('boot-chars'),chBub=null,chBubT=0,chTalkT=0,chBlTt=0,chBlTo=0,chTapN=0,chPct=-1,chSlow=false,chRdy=false,
      chCalm=!!(reduce||(typeof IS_POTATO!=='undefined'&&IS_POTATO));
  function chAlive(){return !!(bs&&bs.parentNode&&!bs.classList.contains('off'));}
  function chAttr(k,v){if(chEl&&chEl.getAttribute(k)!==v)chEl.setAttribute(k,v);}
  function chHL(c,on){if(chEl)chEl.classList.toggle(c,on);}
  function chSay(w,txt){
    if(!chBub)return;
    chBub.textContent=txt;chBub.setAttribute('data-w',w);chBub.classList.add('on');
    clearTimeout(chBubT);chBubT=setTimeout(function(){chBub.classList.remove('on');},2600);
  }
  function chHop(w){
    if(!chEl||chCalm)return;
    var n=chEl.querySelector(w==='o'?'.bc-owl':'.bc-tele');if(!n)return;
    /* tanpa forced reflow: lepas class sekarang, pasang lagi di frame berikutnya */
    var tk=n._ht=(n._ht||0)+1;
    n.classList.remove('hop');
    requestAnimationFrame(function(){
      if(n._ht!==tk)return;
      n.classList.add('hop');
      setTimeout(function(){if(n._ht===tk)n.classList.remove('hop');},520);
    });
  }
  function chTalk(){
    if(!chEl||chCalm)return;
    chEl.classList.add('talk');clearTimeout(chTalkT);
    chTalkT=setTimeout(function(){chEl.classList.remove('talk');},650);
  }
  function chProg(v){
    if(!chEl||chRdy||v===chPct)return;
    chPct=v;chEl.style.setProperty('--bp',(v/100).toFixed(2));
  }
  function chSlowOn(){chSlow=true;chAttr('data-tm','soft');chAttr('data-om','sleepy');try{if(window.__rain)window.__rain.mood(0.65);}catch(eMd){}}
  function chReadyOn(){
    if(chRdy||!chEl)return;
    chRdy=true;chSlow=false;chAttr('data-tm','smile');chAttr('data-om','awake');
    try{if(window.__rain)window.__rain.mood(0);}catch(eMd){}
    chEl.style.setProperty('--bp','1');chEl.classList.add('pick');
    chHop('t');
  }
  function chReact(w){chHop(w);if(w==='o'){chHL('hl-red',false);chSay('o','...');}}
  function chBlink(w){   /* kedip acak 2,6-6 dtk; berhenti sendiri begitu boot screen hilang */
    var k=w==='o'?'blo':'blt';
    clearTimeout(w==='o'?chBlTo:chBlTt);
    if(!chAlive())return;
    chEl.classList.add(k);
    setTimeout(function(){chEl.classList.remove(k);},140);
    var t=setTimeout(function(){chBlink(w);},2600+Math.random()*3400);
    if(w==='o')chBlTo=t;else chBlTt=t;
  }
  function chTap(w,e){
    if(e)e.stopPropagation();
    if(capTimer)armCap();   /* pengunjung aktif -> timeout masuk otomatis dihitung ulang (hanya kalau timeout sedang berjalan; Merah yang sudah ditekan tetap membatalkannya) */
    if(w==='o'){chSay('o','...');chHop('o');bootGlitch();return;}
    try{haptic(6);}catch(eH){}
    chSay('t',T(chRdy?'boot.tap.t3':(chSlow?'boot.tap.t4':((chTapN++&1)?'boot.tap.t2':'boot.tap.t1'))));
    chHop('t');
  }
  if(chEl){
    chEl.innerHTML='<div class="bc bc-owl">'+DUMUL_CHARS.owl+'</div><div class="bc bc-tele">'+DUMUL_CHARS.tele+'</div><span class="bc-bub"></span>';
    chBub=chEl.querySelector('.bc-bub');
    chAttr('data-tm','n');chAttr('data-om','awake');
    if(chCalm)chEl.classList.add('calm');
    chEl.addEventListener('pointerdown',function(e){var b=e.target.closest&&e.target.closest('.bc');if(b)chTap(b.classList.contains('bc-owl')?'o':'t',e);});
    if(!chCalm){setTimeout(function(){chBlink('t');},1400);setTimeout(function(){chBlink('o');},2500);}
  }
  /* Brand = sama dengan panel owl: tap judul / kutipan -> glitch (kelas .gl, CSS di index.css memakai keyframes owlGl/owlGk). */
  var bTitle=document.getElementById('boot-title'),bCore=document.getElementById('boot-core'),bGlT=0,bGlN=0;
  function bootGlitch(e){
    if(e)e.stopPropagation();
    if(!bTitle||!bCore||reduce)return;
    var tk=++bGlN;   /* tanpa forced reflow (tap owl sebelumnya = 2x reflow: chHop + ini) */
    bTitle.classList.remove('gl');bCore.classList.remove('gl');
    clearTimeout(bGlT);
    requestAnimationFrame(function(){
      if(bGlN!==tk)return;
      bTitle.classList.add('gl');bCore.classList.add('gl');
      bGlT=setTimeout(function(){bTitle.classList.remove('gl');bCore.classList.remove('gl');},700);
    });
    try{haptic(8);}catch(eH){}
  }
  if(bTitle)bTitle.addEventListener('pointerdown',bootGlitch);
  if(quoteEl)quoteEl.addEventListener('pointerdown',bootGlitch);
  /* v126: panel status = kondisi NYATA (bukan frame telemetri palsu yang berputar). Tiap baris dibaca dari state asli: layout/gambar, modul 3D, antrean warm-up shader. */
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

  var stars=STELLAR_KEYS.map(function(k){return SFX[k];}),t0=bootT0,done=false; /* 16 SFX dari registry (SKY.sfx) */
  var choicesEl=document.getElementById('boot-choices');
  var capBlue=document.getElementById('boot-cap-blue');
  var capRed=document.getElementById('boot-cap-red');
  /* karakter condong + menyala ke capsule yang disorot (owl = Merah, teleskop = Biru) */
  [[capBlue,'hl-blue'],[capRed,'hl-red']].forEach(function(pr){
    var bt=pr[0],cl=pr[1];if(!bt)return;
    ['pointerenter','focus'].forEach(function(ev){bt.addEventListener(ev,function(){chHL(cl,true);});});
    ['pointerleave','blur'].forEach(function(ev){bt.addEventListener(ev,function(){chHL(cl,false);});});
  });
  /* v126: TIDAK ADA Tier-0 dan TIDAK ADA minMs. Boot tidak memuat audio sama sekali; capsule tampil begitu pekerjaan nyata selesai (lihat tick()).
     max3d  = batas atas menunggu pekerjaan boot (kalau ada modul macet): capsule tetap tampil, progres bar tetap menunjukkan angka asli (tidak dipaksa 100%).
     maxMs  = TIMEOUT capsule: dihitung sejak capsule tampil; kalau Red/Blue tidak ditekan sampai habis -> masuk Observatory otomatis (jalur sama dgn Blue). */
  var maxMs=isRepeatVisit?10000:20000;
  var max3d=isRepeatVisit?12000:(IS_POTATO?9000:15000);
  /* v148: HARD_CAP = plafon mutlak dari t0. Bench itel: 5 modul state=2 tapi warmOk masih false → cap3d lama memaksa kapsul
     sebelum THREE_WARM + SFX selesai. Setelah modul settle, kita terus nunggu warmOk+SFX sampai HARD_CAP (bukan max3d). */
  var HARD_CAP=isRepeatVisit?32000:(IS_POTATO?50000:60000);   /* [PATCH v167] first visit 45->60 dtk: bench itel 5 Nov (SFX 17 file, 3 gelombang x 12-17 dtk) baru lengkap di ±42 dtk dari t0 */
  /* [PATCH v167] Gate 100%: kapsul biru HANYA tampil setelah bar benar-benar 100% (vis + BGM + 17 SFX nyata selesai DAN bar sudah menyapu ke 100).
     Dulu plafon audio/SFX meloloskan gate: bench 5 Nov kapsul muncul di bar 83% (SFX 7/17) lalu pengunjung menunggu ±17 dtk lagi sampai audio hangat.
     Plafon darurat sekarang cuma HARD_CAP (anti hang; kapsul tetap tampil dgn bar di angka asli). */
  var gateAt=-1;   /* elapsed saat gate nyata pertama lolos; dipakai pengaman sapuan bar (maks 2,5 dtk) */
  var capTimer=0;
  /* v142: batas tunggu pekerjaan boot TIDAK memakan jatah warm-up kalau yang lambat adalah jaringan. Selama three.js belum tiba (atau baru tiba lambat), batas diperpanjang
     sebesar kelebihan waktunya di atas 3 dtk (maks +8 dtk). Plafon mutlak = max3d + 8 dtk, jadi offline/macet tetap tidak menahan capsule selamanya. */
  function cap3dNow(elapsed){
    var ta=window.__threeAt,wait=ta?Math.max(0,ta-t0):elapsed;
    return max3d+Math.min(8000,Math.max(0,wait-3000));
  }
  /* v127: metadata 16 SFX (lalu BGM/GARG, preload='none' di 01-core) dihangatkan mulai SAAT CAPSULE TAMPIL (finish()), bukan setelah Blue +4,2 dtk.
     Alasan (telemetri v126 itel A6610L): boot 12,2 dtk memblokir main thread 89%, jaringan nganggur, audio baru dimulai setelah Blue -> tap pertama cold. Saat capsule tampil
     main thread bebas (build + warm shader sudah selesai). Berbasis penyelesaian: maks WARM_CONC (2) elemen sekaligus, elemen berikutnya jalan setelah loadedmetadata/error
     elemen sebelumnya (atau WARM_SLOT_MS sebagai pelepas slot). Tanpa rIC timeout. Selama ±1,5 dtk setelah Blue antrean ditahan supaya frame pertama sektor tidak berebut.
     Satu jalur retry tetap milik safePlay: elemen yang sedang _retrying/_want/diputar dilewati. */
  /* WARM_CONC = jumlah elemen audio yang di-warm (metadata) bersamaan; tetap 8, tidak ada override lewat URL. */
  var WARM_CONC=8,WARM_SLOT_MS=8000,WARM_SLOT_MAX=20000,warmed=false,warmAt=-1,warmQ=[],warmActive=0,warmHold=0;   /* v146: warmAt = elapsed (dari t0) saat antrean SFX mulai */
  /* [PATCH v160] Kejadian warm audio -> antrean untuk log boot (dikonsumsi logPoll). Menggantikan sfxLastName/sfxLastIsGlitch/sfxGlitchWarm/sfxCacheFlash (v157/v159).
     Tiap file = 1 kejadian, termasuk yang sudah siap duluan (cache/offline), jadi log tetap bisa menghitung 2 BGM + 16 bintang + 1 GARG satu per satu, bukan loncat ke "siap".
     k: 'b' BGM | 's' bintang | 'g' GARG; w: 's' mulai | 'e' selesai (meta / error). */
  var warmEv=[];
  function warmKind(a){
    try{
      if(typeof GARG!=='undefined'&&GARG&&a===GARG)return 'g';
      if((typeof AMB!=='undefined'&&a===AMB)||(typeof MUSIC_COLLAP!=='undefined'&&a===MUSIC_COLLAP))return 'b';
    }catch(eK){}
    return 's';
  }
  function warmEvPush(k,w,nm){if(warmEv.length<80)warmEv.push({k:k,w:w,nm:nm||''});}
  /* v152: WARM_CONC 8 (dulu 4): tiap SFX cuma ±80 KB (probe 300 B + range ±80 KB), jadi yang menentukan latensi per request, bukan bandwidth; konkurensi 4 terlalu sempit. */
  window.__warmConc=WARM_CONC;
  /* v151: SFX warm TIDAK paralel dengan build 3D. Telemetri v149/v150 (8 run, itel): slot SFX yang mulai sebelum kapsul rata-rata ±7 dtk, yang mulai sesudah kapsul ±4 dtk
     (main thread jenuh ±12 dtk long task selama build 3D -> loadedmetadata + warmPump ngantri). Sekarang antrean SFX baru jalan begitu SEMUA modul 3D settle + THREE_WARM kosong.
     BGM (2 file kecil) tetap jalan dari awal. v154: dikembalikan paralel (pemicu three2/allmods/bgm, lihat warmRestEarly); mode sequential v151 sudah dihapus. */
  function warmPump(){
    var gap=warmHold-performance.now();
    if(gap>0){setTimeout(warmPump,gap+20);return;}
    while(warmActive<WARM_CONC&&warmQ.length){
      var a=warmQ.shift();
      try{
        if(a&&a.readyState>=1){   /* [PATCH v160] sudah siap duluan (cache/offline): tetap dicatat supaya log menghitungnya */
          var kp=warmKind(a);
          if(kp==='g'){warmEvPush('g','s');warmEvPush('g','e');}
          else warmEvPush(kp,'e',warmName(a).replace(/\.opus$/i,''));
          continue;
        }
        if(!a||!a.paused||a._retrying||a._want)continue;
      }catch(eE){continue;}
      warmSlot(a);
    }
  }
  /* v129 (diagnostik, tanpa mengubah perilaku): catat tiap slot warm audio -> window.__warmLog, dibaca bench (R.warmLog).
     Baris: [nama, mulai ms, lepas ms, sebab, readyState, networkState, warmActive saat lepas, kode error media, jumlah abort diabaikan (v130)].
     sebab: meta = loadedmetadata, err = error, abort = abort, tmo = WARM_SLOT_MS habis, exc = exception di load().
     __warmMax = konkurensi tertinggi yang pernah terjadi (harus <= WARM_CONC). Tujuan: cari tahu kenapa 19 file mulai dalam ~190 ms padahal WARM_CONC=2. */
  var WLOG=window.__warmLog=window.__warmLog||[];
  function warmName(a){try{return (a.currentSrc||a.src||'').replace(/^.*\//,'').replace(/\?.*$/,'');}catch(eN){return '?';}}
  function warmSlot(a){
    var fin=false,tm=0,t1=Math.round(performance.now()),nm=warmName(a);
    var isGarg=false;try{isGarg=!!(typeof GARG!=='undefined'&&GARG&&a===GARG);}catch(eIg){}
    if(isGarg)warmEvPush('g','s');   /* [PATCH v160] log: GARG mulai di-warm */
    function rel(why){
      if(fin)return;fin=true;
      clearTimeout(tm);
      try{a.removeEventListener('loadedmetadata',onEv);a.removeEventListener('error',onEv);a.removeEventListener('abort',onEv);}catch(eR){}
      try{if(WLOG.length<40)WLOG.push([nm,t1,Math.round(performance.now()),why,a.readyState,a.networkState,warmActive,a.error?a.error.code:0,a._wab||0]);}catch(eG){}
      /* [PATCH v160] GARG selesai karena sebab apa pun (meta / error file glitch / timeout) -> log; BGM + bintang hanya dihitung kalau benar-benar meta/error (sama dengan sfxStatus/audioStatus) */
      if(isGarg)warmEvPush('g','e');
      else if(why==='meta'||why==='err')warmEvPush(warmKind(a),'e',(nm||'').replace(/\.opus$/i,''));
      if(why==='meta'){try{chTalk();}catch(eCh){}}   /* [PATCH v157] mulut teleskop tiap metadata */
      warmActive--;warmPump();
    }
    /* v130: 'abort' DIABAIKAN. Telemetri v129 (3 run, 19/19 slot): load() pada elemen preload='none' menembakkan 'abort' dalam 15-40 ms (readyState 0, networkState 3)
       padahal pemuatan lanjut sesudahnya (metadata tiba 10+ dtk kemudian). Melepas slot di 'abort' membuat semua 19 file mulai dalam ±200 ms dan WARM_CONC tak berlaku.
       Slot kini dilepas hanya oleh loadedmetadata / error / WARM_SLOT_MS. Jumlah abort tetap dicatat (kolom ke-9 warmLog). */
    function onEv(ev){
      if(ev&&ev.type==='abort'){a._wab=(a._wab||0)+1;return;}
      rel(ev&&ev.type==='loadedmetadata'?'meta':(ev&&ev.type)||'?');
    }
    warmActive++;
    try{window.__warmMax=Math.max(window.__warmMax||0,warmActive);}catch(eX){}
    try{
      a.addEventListener('loadedmetadata',onEv);a.addEventListener('error',onEv);a.addEventListener('abort',onEv);
      /* v150: slot TIDAK dilepas di WARM_SLOT_MS selama elemen masih benar-benar memuat (networkState 2, belum ada metadata); dicek tiap 1 dtk sampai WARM_SLOT_MAX.
         Telemetri v149 (5 run, itel 4g): saat jaringan lambat, metadata tiba ±8,2 dtk, sedikit di atas WARM_SLOT_MS=8000 -> 'tmo' massal (14/19), slot lepas padahal unduhan lanjut,
         antrean berikutnya mulai -> konkurensi nyata melebihi WARM_CONC dan bandwidth makin tipis. Slot macet sungguhan (bukan loading) tetap dilepas di WARM_SLOT_MS. */
      tm=setTimeout(function chk(){
        if(fin)return;
        try{if(a.networkState===2&&a.readyState<1&&performance.now()-t1<WARM_SLOT_MAX){tm=setTimeout(chk,1000);return;}}catch(eC){}
        rel('tmo');
      },WARM_SLOT_MS);
      a.preload='metadata';a.load();
    }catch(eL){rel('exc');}
  }
  var warmTrig='',visAt=-1;   /* v147: warmTrig = three2|allmods|bgm|finish; visAt = elapsed saat vis pertama true */
  function bootInfoSnap(extra){
    try{
      var x=extra||{};
      window.__bootInfo={
        warmAt:warmAt,warmTrig:warmTrig||null,visAt:visAt,
        sfxViaCap:!!x.sfxViaCap,bgmViaCap:!!x.bgmViaCap,
        bar:x.bar!=null?x.bar:(typeof pV!=='undefined'?pV:null),
        sfxN:x.sx?x.sx.n:null,sfxTot:x.sx?x.sx.total:null,sfxOk:x.sx?!!x.sx.ok:null,
        vis:x.vis!=null?!!x.vis:null,complete:x.complete!=null?!!x.complete:null
      };
    }catch(eBi){}
  }
  function warmRest(){
    if(warmed)return;warmed=true;
    if(!warmTrig)warmTrig='finish';   /* dipanggil dari finish tanpa early trigger */
    warmAt=Math.round(performance.now()-t0);
    try{performance.mark('obs-warm');}catch(eM){}
    var sq=stars;
    {   /* [PATCH v168] file yang konsisten paling lambat (dump 5 Nov, 3 run: rigel, spica, sirius) dimulai di gelombang pertama, bukan jatuh ke gelombang terakhir dan jadi ekor gate */
      var sl=[],fa=[];
      stars.forEach(function(a){(/^(rigel|spica|sirius)\.opus$/i.test(warmName(a))?sl:fa).push(a);});
      sq=sl.concat(fa);
    }
    warmQ=warmQ.concat(sq);   /* v132: sisa antrean BGM (kalau belum habis) tetap di depan; AMB/MUSIC_COLLAP TIDAK di-load() ulang di sini (memutus request yang sedang jalan) */
    try{if(GARG)warmQ.push(GARG);}catch(e){}
    warmPump();
    bootInfoSnap({});
  }
  /* v145 Mode 2 strict: BGM (2) + SFX stellar (16) + GARG ikut bar + gate.
     Kapsul hanya setelah vis + bgmOk + sfxOk (kerjaan nyata, tanpa minMs palsu).
     warmRest (SFX+GARG) dimajukan ke gap (THREE ada + ≥2 modul settle), bukan nunggu kapsul.
     cap3d / HARD_CAP = plafon darurat saja (modul macet / anti hang), bukan jalur normal.
     Satuan = readyState>=1 atau a.error (dari elemen). Warm BGM tetap dari awal boot. */
  var audioEls=null;
  function audioList(){
    if(audioEls)return audioEls;
    var l=[];
    try{[AMB,MUSIC_COLLAP].forEach(function(a){if(a)l.push(a);});}catch(eA){}
    return (audioEls=l);
  }
  var sfxEls=null;
  function sfxList(){
    if(sfxEls)return sfxEls;
    var l=stars.slice();
    try{if(GARG)l.push(GARG);}catch(eG){}
    return (sfxEls=l);
  }
  function sfxStatus(){
    var l=sfxList(),n=0,i;
    for(i=0;i<l.length;i++){try{if(l[i].readyState>=1||l[i].error)n++;}catch(eS){n++;}}
    return {n:n,total:l.length,ok:l.length?n>=l.length:true};
  }
  /* Trigger opsi B (plan): THREE ada + >=2 modul settle, ATAU fallback: semua modul settle (three gagal/nonaktif) atau BGM sudah siap (jaringan nganggur). Idempotent via warmed. */
  function warmRestEarly(th,au){
    if(warmed)return;
    var three=(typeof THREE!=='undefined'&&THREE.REVISION);
    if(three&&th&&th.mods>=2){warmTrig='three2';warmRest();return;}
    if(th&&th.mods>=th.total){warmTrig='allmods';warmRest();return;}
    if(au&&au.ok){warmTrig='bgm';warmRest();}
  }
  /* v156: cacheBgm() dihapus. Audio tidak lagi disimpan otomatis (warm cukup metadata, hemat bandwidth); simpan hanya lewat unduh offline (PRECACHE_AUDIO). */
  function audioStatus(){
    var l=audioList(),n=0,i;
    for(i=0;i<l.length;i++){try{if(l[i].readyState>=1||l[i].error)n++;}catch(eS){n++;}}
    return {n:n,total:l.length,ok:n>=l.length};
  }
  /* Unit pekerjaan boot (progres bar = unit selesai / total, tanpa komponen waktu):
       1 unit  halaman : DOMContentLoaded sudah lewat (semua <script defer> sudah dieksekusi) + layout() jalan (W>0) + gambar nebula/milky-way tidak sedang di-fetch.
       5 unit  modul 3D: AST3D, SCP3D, DR3D, PT3D, PL3D, masing-masing state 2 (siap) atau 3 (gagal/nonaktif). PL3D sudah termasuk shader warm-up sendiri.
       1 unit  warm-up : antrean THREE_WARM (compile+render pertama AST3D/SCP3D/DR3D/PT3D), pecahan = done/(total+modul yang belum push).
     PENTING: modul 3D (12-17) baru didefinisikan SESUDAH 07-boot jalan, jadi sebelum DCL "belum ada" = BELUM SELESAI (bukan dilewati). Dulu minMs menutupi ini;
     tanpa minMs, gate akan lolos palsu begitu layout() jalan. Setelah DCL: modul tetap undefined = file gagal dimuat -> dianggap selesai (tidak ditunggu);
     modul state 0 setelah 4 dtk = tidak pernah mulai -> tidak ditunggu. */
  var dclDone=(document.readyState==='complete');
  if(!dclDone)document.addEventListener('DOMContentLoaded',function(){dclDone=true;},{once:true});
  function imgSettled(im){return !im||im.complete;}
  function pageReady(){
    if(!dclDone){if(document.readyState==='complete')dclDone=true;else return false;}
    if(!W)return false;
    try{return imgSettled(typeof NEB!=='undefined'&&NEB.img)&&imgSettled(typeof MW!=='undefined'&&MW.img);}catch(e){return true;}
  }
  var MODS=['AST3D','SCP3D','DR3D','PT3D','PL3D'];
  /* v128: bobot unit = BIAYA RELATIF pekerjaan (ms, dari bench itel A6610L: build 3D per modul + warm shader ±5,5 dtk), bukan jumlah unit.
     Tetap jujur: bar hanya naik saat pekerjaan nyata SELESAI, tanpa komponen waktu. Bedanya, unit yang makan 5 dtk (warm) kini mengisi ±48% bar,
     bukan 1/7. Yang dipakai proporsinya, bukan angka mutlak, jadi di HP kencang tetap benar. Urutan mods = MODS. */
  var WT_PAGE=500,WT_MODS=[700,1600,2150,800,800],WT_WARM=5000,WT_AUDIO=4000,WT_SFX=7000;   /* [PATCH v157] WT_SFX 2800→7000 biar fase metadata 16 bintang punya ruang bar lebih panjang; gate tetap 16/16 */
  var WT_SUM=WT_PAGE+WT_WARM+WT_AUDIO+WT_SFX+WT_MODS.reduce(function(a,b){return a+b;},0);
  function threeStatus(elapsed){
    var settled=0,pend=0,st=[],fins=[],i,o,s,fin;
    for(i=0;i<MODS.length;i++){
      o=window[MODS[i]];s=o?o.state:-1;st.push(s);
      fin=(s===2||s===3)||(dclDone&&(s===-1||(s===0&&elapsed>4000)));
      fins.push(!!fin);
      if(fin)settled++;
      else if(i<4)pend++;   /* 4 modul pertama mengantre ke THREE_WARM saat selesai build */
    }
    var wq=window.THREE_WARM,wTot=wq?(wq.total||0):0,wDone=wq?(wq.done||0):0,exp=wTot+pend;
    var drained=!wq||(!wq.busy&&!wq.q.length);
    var warmOk=pend===0&&drained;
    return {mods:settled,total:MODS.length,st:st,fins:fins,pend:pend,wDone:wDone,wTot:wTot,exp:exp,warmOk:warmOk,part:(wq&&wq.part)||0,warmFrac:warmOk?1:(exp?Math.min(1,(wDone+((wq&&wq.part)||0))/exp):0)};
  }
  /* Status = SATU baris. Tiap baris muncul sebagai ">" (sedang jalan) dan jadi "✓" begitu selesai; baris yang selesai antre sesuai URUTAN SELESAI
     di perangkat itu (jadi urutan beda antar HP tidak masalah), tiap baris tampil minimal sebentar lalu fade ke baris berikutnya; semua selesai -> fade kosong.
     paintPanel() cuma mengisi data (R, doneQ); yang menggambar adalah stageStep() (interval 100 ms, berhenti saat boot screen hilang). */
  var R=[],doneQ=[],cur=-1,curDone=false,curAt=0,fadeEnd=0,nxt=-1,nxtDone=false,lastHtml='',stT=0;
  function rowHtml(i,done){
    if(i===-2)return '<span class="ok">\u2713 '+T('boot.allready')+'</span>';   /* baris penutup menetap */
    var r=R[i],t=r.val?r.label+'  '+r.val:r.label;
    return done?'<span class="ok">\u2713 '+t+'</span>':'&gt; '+t;
  }
  function stApply(i,done){
    cur=i;curDone=done;curAt=performance.now();
    var h=i===-1?'':rowHtml(i,done);
    if(h!==lastHtml){lastHtml=h;statusEl.innerHTML=h;if(h)chTalk();}   /* teleskop "membacakan" baris baru */
    statusEl.classList.toggle('pn',i>=0&&!done);
    statusEl.classList.remove('out');
  }
  function movedOn(){var j;for(j=0;j<R.length;j++){if(j!==cur&&R[j]&&!R[j].q&&R[j].at>curAt)return true;}return false;}   /* ada baris belum-selesai lain yang angkanya berubah sejak baris ini tampil */
  function stageStep(){
    if(!statusEl)return;
    var now=performance.now(),j,best=-1,want,wantDone=false,dwell;
    if(fadeEnd){if(now<fadeEnd)return;fadeEnd=0;stApply(nxt,nxtDone);return;}
    if(cur===-2)return;   /* sudah di baris penutup: tidak berubah lagi */
    if(cur>=0&&!curDone&&!R[cur].q){   /* baris jalan: angka ikut hidup (mis. 3/5 -> 4/5) */
      var h=rowHtml(cur,false);
      if(h!==lastHtml){lastHtml=h;statusEl.innerHTML=h;}
    }
    dwell=curDone?(doneQ.length>2?260:(doneQ.length?420:800)):(doneQ.length?380:0);
    if(cur>=0&&now-curAt<dwell)return;
    if(doneQ.length){want=doneQ.shift();wantDone=true;}
    else if(cur>=0&&!curDone&&!R[cur].q&&!(now-curAt>=700&&movedOn()))return;   /* masih jalan: tetap, kecuali baris lain baru bergerak (min 700 ms per baris) */
    else{
      /* pilih baris belum-selesai yang angkanya paling baru berubah (aktivitas terbaru), bukan urutan tetap */
      for(j=0;j<R.length;j++){if(R[j]&&!R[j].q&&!R[j].hold&&(best<0||R[j].at>R[best].at))best=j;}
      want=best;
      if(want<0){
        for(j=0;j<R.length;j++){if(R[j]&&R[j].hold)return;}   /* v146: masih ada baris tertahan (SFX belum mulai): jangan tutup dulu */
        want=-2;wantDone=true;
      }   /* semua baris sudah selesai & ditampilkan -> baris penutup, tidak fade ke kosong */
    }
    if(want===cur){stApply(want,wantDone);return;}   /* baris yang sama baru selesai: ganti di tempat, tanpa fade */
    if(cur<0){stApply(want,wantDone);return;}
    nxt=want;nxtDone=wantDone;
    statusEl.classList.add('out');fadeEnd=now+230;
  }
  function paintPanel(ready,th,complete,au,sx){
    if(!statusEl)return;
    /* v145: satu kalimat karakter per baris (tanpa angka mentah di status atas). sx = sfxStatus. */
    var modsOk=th.mods>=th.total,auOk=!!(au&&au.ok),sxOk=!!(sx&&sx.ok);
    var d=[
      [ready?T('boot.observer.ok'):T('boot.observer.work'),'',ready],
      [ready?T('boot.starmap.ok'):T('boot.starmap.work'),'',ready],
      [modsOk?T('boot.mods.ok'):T('boot.mods.work'),'',modsOk],
      [th.warmOk?T('boot.warm.ok'):T('boot.warm.work'),'',th.warmOk],
      [auOk?T('boot.audio.ok'):T('boot.audio.work'),'',auOk],
      [sxOk?T('boot.sfx.ok'):T('boot.sfx.work'),'',sxOk]
    ],i,r,now=performance.now();
    for(i=0;i<d.length;i++){
      r=R[i]||(R[i]={q:false,at:now,val:''});
      r.label=d[i][0];
      if(r.val!==d[i][1]){r.val=d[i][1];r.at=now;}
      r.ok=!!d[i][2];
      r.hold=(i===5&&!warmed&&!r.ok);   /* v146: baris SFX belum boleh tampil sebelum antreannya benar-benar mulai */
      if(r.ok&&!r.q){r.q=true;doneQ.push(i);}
    }
    stageStep();
  }
  /* v143: LOG BOOT SATU BARIS (bahasa awam, tanpa angka ms), nempel di kiri persen (#boot-row).
     Sumber = penanda tahap yang SUDAH ditulis tiap modul (window.__scp3dT / __dr3dT / __pt3dT / __pl3dT; panjang array = tahap selesai) + state modul + kejadian warm audio (warmEv). Tidak ada hook baru di modul 3D.
     Tinggi baris = baris persen yang sudah ada, jadi panel tidak bergeser. Polling ikut interval 100 ms yang sudah ada; innerHTML hanya ditulis kalau isinya berubah.
     [PATCH v160] Dua jalur tampilan:
       LIVE  = keadaan sekarang (">" tahap yang sedang jalan, atau "\u2713" kejadian terakhir). Jalur lama; dipakai saat jaringan lambat dan kejadian datang satu-satu.
       ANTREAN = kalau satu poll membawa >=2 kejadian (cache / offline / HP kencang: semuanya selesai dalam beberapa ms), tiap kejadian ditampilkan berurutan dengan jeda singkat,
                 jadi pengunjung offline tetap melihat 2 BGM -> 16 bintang -> GARG, tidak loncat ke baris terakhir ("Planet siap").
       Antrean cuma kosmetik: tidak menahan bar, status atas, atau gerbang kapsul. Kalau menumpuk, jedanya mengecil (logDwell) dan tahap modul yang sama dilipat jadi satu. */
  var logEl=document.getElementById('boot-log'),logLast='',logN={},logOut='';
  var LOG_M=[   /* urutan = antrean threeLoad (AST, SCP, DR, PT, PL); [global, array tahap, kunci nama, kunci tahap]. Jumlah langkah = tahap bernama + 1 (langkah penutup = \"siap\") */
    ['AST3D',null,'bl.rock',null],
    ['SCP3D','__scp3dT','bl.scope',['canvas','light','paint','body','cockpit','engine','lamps']],
    ['DR3D','__dr3dT','bl.drone',['canvas','light','paint','wings','engine','join','size']],
    ['PT3D','__pt3dT','bl.portal',['canvas','circuit','plates','lamps','size']],
    ['PL3D','__pl3dT','bl.planet',null]
  ];
  /* label tahap ke-n; null kalau n di luar daftar bernama (langkah penutup / modul tanpa tahap).
     Dulu langkah penutup ikut membaca m[3][n] yang kosong -> kunci \"bl.a.undefined\" tampil di layar. */
  function logStage(m,n){return m[3]&&n<m[3].length?T('bl.a.'+m[3][n]):null;}

  var logQ=[],logCur=null,logCurAt=0,logT=0,logFin=false,logLive={h:'',dec:false};
  var bgmN=0,starN=0,gargOn=false,sfxNm='',bgmNm='',GL_MIN=700,GL_CH='01#?%/|_-\u2588\u2592';
  function logEsc(s){return String(s).replace(/[&<>"]/g,'');}
  /* Scramble gaya jam dilatasi di 06-interaction.js (clkScr), tapi tanpa < > & karena ditulis lewat innerHTML. Spasi dan titik tengah tidak ikut diacak (lebar baris stabil). */
  function glScr(s,p){
    var o='',i,c;
    for(i=0;i<s.length;i++){c=s.charAt(i);o+=(c!==' '&&c!=='\u00b7'&&Math.random()<p)?GL_CH.charAt((Math.random()*GL_CH.length)|0):c;}
    return o;
  }
  /* Baris GARG = decode yang SENGAJA error. res=null: error terus-menerus (digit ter-scramble, kadang ERR / CRC / ??, belah warna merah-cyan seperti jam).
     res 0..1: fase penutup, error mereda (decode \"selesai\" sebentar) sebelum baris \u2713. Hanya warna, text-shadow, dan geser kiri 1-2 px (tidak mengubah lebar baris). */
  function decHtml(res){
    var base=T('bl.glitch')+' \u00b7 '+T('bl.a.decode'),tx,dx,k;
    if(reduce)return '<span class=\"pn dec\">&gt; '+logEsc(base)+'</span>';   /* reduced-motion: statis, tetap kelihatan sebagai baris glitch */
    if(res==null){
      k=Math.random();
      if(k<.22)tx=T('bl.glitch')+' \u00b7 '+(k<.07?'ERR:ERR:ERR':(k<.14?'??:??:??':'CRC 0x'+((Math.random()*65536)|0).toString(16).toUpperCase()));
      else tx=glScr(base,.3+Math.random()*.4);
      dx=(Math.random()*2-1)*2.2;
    }else{
      tx=glScr(base,.5*(1-res));
      dx=(Math.random()*2-1)*2.2*(1-res);
    }
    return '<span class=\"pn dec\" style=\"left:'+dx.toFixed(1)+'px;text-shadow:'+dx.toFixed(1)+'px 0 rgba(255,70,100,.75),'+(-dx).toFixed(1)+'px 0 rgba(90,230,255,.7)\">&gt; '+logEsc(tx)+'</span>';
  }

  function logPoll(){
    if(!logEl)return;
    var thr=(typeof THREE!=='undefined'&&THREE.REVISION),cur='',h='',i,m,o,nm,tot,n,k,st,sx,au,ev=[],e,live,starTot=stars.length,bgmTot=audioList().length,decLive=false;
    if(thr&&!logN.thr){logN.thr=1;ev.push({k:'ok',s:T('bl.engine')+' '+T('bl.ready')});}
    if(!thr)cur=T('bl.engine')+' \u00b7 '+T('bl.a.dl');
    for(i=0;i<LOG_M.length;i++){
      m=LOG_M[i];o=window[m[0]];
      if(!o||o.state===3)continue;   /* belum ada / gagal (jatuh ke 2D): tidak ditampilkan */
      nm=T(m[2]);tot=m[3]?m[3].length+1:1;n=logN[i]|0;
      if(o.state===2)k=tot;
      else if(m[3])k=window[m[1]]?window[m[1]].length:0;
      else k=(m[1]&&window[m[1]]&&window[m[1]].length>=3)?1:0;
      while(n<k&&n<tot){st=logStage(m,n);ev.push({k:'ok',g:'st',mod:i,s:st?nm+' \u00b7 '+st:nm+' '+T('bl.ready')});n++;}
      logN[i]=n;
      if(!cur&&thr&&n<tot)cur=nm+' \u00b7 '+(logStage(m,n)||T('bl.a.load'));
    }
    /* [PATCH v160] kejadian warm audio -> baris log. BGM: x/2, bintang: x/16 (GARG TIDAK ikut hitungan bintang). GARG: mulai = live decode, selesai = fase penutup + \u2713. */
    while(warmEv.length){
      e=warmEv.shift();
      if(e.k==='g'){
        if(e.w==='s')gargOn=true;
        else if(gargOn){gargOn=false;ev.push({k:'dec',min:GL_MIN});ev.push({k:'ok',s:T('bl.glitch')+' '+T('bl.ready')});}
      }else if(e.k==='b'){bgmN++;bgmNm=e.nm;ev.push({k:'ok',s:T('bl.bgm')+' \u00b7 '+e.nm+' \u00b7 '+bgmN+'/'+bgmTot});}
      else{starN++;sfxNm=e.nm;ev.push({k:'ok',g:'sfx',s:T('bl.sfx')+' \u00b7 '+e.nm+' \u00b7 '+starN+'/'+starTot});}
    }
    sx=sfxStatus();au=audioStatus();
    if(sx.ok&&sx.total&&!logN.sfx){logN.sfx=1;ev.push({k:'ok',s:T('bl.sfx')+' '+T('bl.ready')});}
    /* satu kejadian tunggal tanpa antrean = jalur LIVE lama (jaringan lambat); >=2 kejadian dalam satu poll, atau antrean masih jalan = masuk antrean */
    if(ev.length>=2||logQ.length||logCur){for(i=0;i<ev.length;i++)logQ.push(ev[i]);}
    else if(ev.length){e=ev[0];if(e.k==='ok')logLast=e.s;}
    /* baris LIVE (dipakai saat antrean kosong): tahap modul > BGM > bintang; GARG menyela 1 dtk tiap 3 dtk selama masih di-warm (atau sendirian kalau bintang sudah selesai) */
    if(!cur&&!au.ok&&bgmTot){cur=T('bl.bgm')+' \u00b7 '+(bgmNm||T('bl.a.bgm'))+' \u00b7 '+bgmN+'/'+bgmTot;}
    if(!cur&&warmed&&sx.total&&!sx.ok){
      decLive=gargOn&&(starN>=starTot||(((performance.now()/1000)|0)%3===2));
      if(!decLive)cur=T('bl.sfx')+' \u00b7 '+(sfxNm||T('bl.a.sfx'))+' \u00b7 '+starN+'/'+starTot;
    }
    if(decLive)live={h:'',dec:true};
    else if(cur)live={h:'<span class=\"pn\">&gt; '+cur+'</span>',dec:false};
    else if(logLast)live={h:'<span class=\"ok\">\u2713 '+logLast+'</span>',dec:false};
    else live={h:'',dec:false};
    logLive=live;
    logShow();
  }
  /* Jeda tiap baris antrean: makin menumpuk makin pendek; sesudah kapsul tampil dibatasi 50 ms. Baris decode punya jeda sendiri (min). */
  function logDwell(it){
    if(it.k==='dec')return it.min;
    var L=logQ.length,d=L>14?45:(L>8?60:(L>4?80:110));
    return logFin?Math.min(d,50):d;
  }
  function logQNext(){
    var it,j,dup;
    while(logQ.length){
      it=logQ.shift();
      if(it.g==='st'&&logQ.length>5){   /* menumpuk: tahap modul yang sama cukup yang terakhir */
        dup=false;for(j=0;j<logQ.length;j++){if(logQ[j].g==='st'&&logQ[j].mod===it.mod){dup=true;break;}}
        if(dup)continue;
      }
      return it;
    }
    return null;
  }
  function logShow(){
    if(!logEl||bs.classList.contains('off'))return;
    var now=performance.now(),h,busy=false,decFrame=false;
    if(logCur&&now-logCurAt>=logCur.dw)logCur=null;
    if(!logCur&&logQ.length){logCur=logQNext();if(logCur){logCur.dw=logDwell(logCur);logCurAt=now;}}
    if(logCur){
      busy=true;
      if(logCur.k==='dec'){h=decHtml(Math.min(1,(now-logCurAt)/logCur.dw));decFrame=true;}
      else h='<span class=\"ok\">\u2713 '+logCur.s+'</span>';
    }else if(logLive.dec){h=decHtml(null);decFrame=true;busy=true;}
    else h=logLive.h;
    if(h!==logOut){logOut=h;logEl.innerHTML=h;}
    /* selama ada yang beranimasi / antre: ketuk sendiri tiap 50 ms (decode: 66 ms, HP lemah 140 ms); selain itu interval 100 ms di bawah yang menyetir */
    if(busy&&!logT)logT=setTimeout(function(){logT=0;logShow();},decFrame?(IS_POTATO?140:66):50);
  }
  logPoll();
  stT=setInterval(function(){
    if(bs.classList.contains('off')||!bs.parentNode){clearInterval(stT);stT=0;return;}
    logPoll();
    stageStep();
  },100);
  function enterObservatory(){
    if(bs.classList.contains('off'))return;
    if(capTimer){clearTimeout(capTimer);capTimer=0;}
    bs.classList.add('off');
    /* Perisai tap-tembus: boot screen langsung pointer-events:none tapi masih tampak memudar ±0,8 dtk. Tap pada karakter/judul yang masih kelihatan (mis. pas timeout otomatis)
       jatuh ke sky dan mengenai portal di bawahnya -> menu sektor kebuka. Selama jendela fade, event pointer/klik ditelan di fase capture window (sebelum listener document 06-interaction.js).
       Dipasang cuma sebentar lalu dilepas: nol biaya sesudahnya. */
    (function(){
      var until=performance.now()+1100,T4=['pointerdown','pointerup','click','touchstart','touchend'],opt={capture:true,passive:true},tm=0;
      function off(){clearTimeout(tm);T4.forEach(function(t){window.removeEventListener(t,sh,opt);});}
      function sh(e){if(e.timeStamp<until)e.stopPropagation();else off();}   /* timeStamp = saat event DIBUAT: tap saat fade tetap ditelan walau main thread sempat jank dan baru diproses telat */
      T4.forEach(function(t){window.addEventListener(t,sh,opt);});
      tm=setTimeout(off,2500);
    })();
    try{performance.mark('obs-blue');}catch(eM){}
    matrixAlive=false;
    if(matrixKill){try{matrixKill();}catch(eMk){}matrixKill=null;}
    if(matrixRAF){cancelAnimationFrame(matrixRAF);matrixRAF=0;}
    bootDone=true;
    try{sessionStorage.setItem('obs_booted','1');}catch(eSs){}   /* PP-9 */
    startRenderLoop();
    window.__obsEntered=true;
    try{window.dispatchEvent(new Event('obs-entered'));}catch(eEv){}   /* PP-12: index.html mendaftarkan SW setelah ini */
    warmHold=performance.now()+1500;   /* tahan antrean audio selama frame pertama sektor */
    warmRest();   /* no-op kalau sudah jalan sejak gap/kapsul */
    try{if(typeof panelWarmOnce==='function')panelWarmOnce();}catch(eW){}   /* v145: fallback idempotent — biasanya sudah di finish() */
    setTimeout(function(){if(bs&&bs.parentNode)bs.remove();},850);
  }
  function finish(c){
    if(done)return;done=true;
    var th=c.th,ready=c.ready,complete=c.complete;
    logFin=true;   /* [PATCH v160] kapsul tampil: sisa antrean log dipercepat */
    try{window.__boot3d={t:Math.round(performance.now()),done:th.mods+(th.warmOk?1:0),total:th.total+1,st:th.st,warm:th.warmOk,gate:true};}catch(e3){}
    try{performance.mark('obs-capsule');}catch(eM){}   /* dibaca 19-auto-debug (Trace); murah */
    /* Bar hanya 100% kalau SEMUA unit (termasuk audio, v131) benar-benar selesai. Kalau belum, bar tetap di angka asli; startPost() melanjutkannya sesudah capsule tampil. */
    paintBar(c);
    /* v147: snapshot untuk 21-bench — warmAt/trig/visAt/bar saat kapsul */
    bootInfoSnap({bar:typeof pV!=='undefined'?pV:c.p,sx:c.sx,vis:c.vis,complete:complete});
    sig.classList.add('on');
    chReadyOn();
    if(quoteEl)quoteEl.classList.add('on');
    paintPanel(ready,th,complete,c.au,c.sx);
    /* Capsule gate: wait for user choice. maxMs = timeout: tidak ada Red/Blue sampai habis -> masuk otomatis (tanpa haptic, jalur enterObservatory yang sama). */
    if(choicesEl){
      choicesEl.classList.add('on');
      choicesEl.setAttribute('aria-hidden','false');
    }
    warmRest();   /* v145: no-op kalau sudah jalan di gap; fallback kalau modul macet / cap3d */
    setTimeout(function(){try{if(typeof panelWarmOnce==='function')panelWarmOnce();}catch(ePw){}},500);   /* v145: warm panel owl+music saat kapsul */
    startPost();   /* bar lanjut kalau plafon darurat kepakai */
    armCap();
  }
  function armCap(){   /* timeout capsule; di-arm ulang kalau pengunjung menyentuh karakter (aktif), supaya tap karakter tidak berbarengan dengan masuk otomatis */
    if(capTimer)clearTimeout(capTimer);
    capTimer=setTimeout(function(){
      capTimer=0;
      if(bs.classList.contains('off'))return;
      window.__bootTimeout=true;
      enterObservatory();
    },maxMs);
  }
  if(capBlue){
    capBlue.addEventListener('click',function(){
      haptic(12);
      try{chReact('t');}catch(eCh){}
      enterObservatory();
    });
  }
  if(capRed){
    capRed.addEventListener('click',function(){
      haptic(12);
      try{chReact('o');}catch(eCh){}
      if(capTimer){clearTimeout(capTimer);capTimer=0;}   /* pengunjung aktif -> timeout dibatalkan */
      try{
        window.open('https://github.com/dumul17/dumul17.github.io','_blank','noopener');
      }catch(e){
        location.href='https://github.com/dumul17/dumul17.github.io';
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
  var pLast=0,postT=0;
  /* Satu sumber kebenaran untuk bar + panel (dipakai tick() sebelum capsule dan startPost() sesudahnya).
     Progres jujur: bobot biaya unit selesai / total bobot (v128) + audio (v131) + rayapan terbatas di bawah bobot unit yang sedang jalan (v140, lihat crp()). Tanpa clamp +5%.
     Floor + cap 99: 100% hanya ditulis paintBar() saat SEMUA unit selesai. Monoton (tidak turun walau gambar lazy mulai di-fetch dan 'ready' berbalik false). */
  /* v140: RAYAPAN per unit yang sedang jalan (supaya bar tidak diam lalu loncat per unit). Gerak halus, tapi TETAP jujur terhadap bobot:
     unit yang belum selesai hanya boleh menyumbang W x CREEP_CAP x (1 - e^(-umur/EST)), kurva asimtotik di bawah CREEP_CAP (0,9) -> TIDAK PERNAH mencapai bobot penuh,
     jadi tidak mungkin mengklaim unit selesai; begitu selesai, sumbangannya diganti bobot penuh (selalu lebih besar -> total tak pernah turun). Gate capsule / status / 100%
     tetap dari keadaan nyata saja (wDone), rayapan cuma menambah angka bar. Waktu mulai tiap unit dikunci SEKALI saat pertama terlihat jalan (monoton). EST = WT_* (bench itel):
     di HP kencang rayapan pelan lalu menyusul; di HP lemot rayapan mentok ±90% bobot unit. Biaya: beberapa exp() per frame, tanpa timer/rAF baru. */
  var CREEP_CAP=.9,crpAt={},uLast=0,flB=0;
  /* v158: kilat singkat tiap UNIT nyata selesai (halaman, tiap modul 3D, warm, BGM, SFX) — bukan tiap langkah kecil; ±9 kali per boot. */
  function barFlash(){
    if(!bar||bs.classList.contains('off'))return;
    flB^=1;bar.classList.remove(flB?'fb':'fa');bar.classList.add(flB?'fa':'fb');
  }
  function crp(key,running,w,est,elapsed){
    if(!running||!(w>0)||!(est>0))return 0;
    if(crpAt[key]===undefined)crpAt[key]=elapsed;
    var age=elapsed-crpAt[key];
    return age>0?w*CREEP_CAP*(1-Math.exp(-age/est)):0;
  }
  function calc(elapsed){
    var ready=pageReady(),th=threeStatus(elapsed),au=audioStatus(),sx=sfxStatus();
    warmRestEarly(th,au);   /* v146: isi gap — SFX begitu ≥2 modul settle ATAU BGM siap / semua modul settle */
    var vis=ready&&th.mods>=th.total&&th.warmOk;
    if(vis&&visAt<0)visAt=Math.round(elapsed);
    if(vis&&!window.__bootVis){
      window.__bootVis=1;   /* [PATCH v168] 3D + warm shader selesai (GPU sepi): warm CPU kecil (nebPrefetch, bhSpriteWarm, ringWarmStep, sprite batu) boleh jalan di fase tunggu SFX, bukan menumpuk tepat saat kapsul tampil */
      /* [PATCH v169] sinkron GL pertama cincin portal (render + drawImage ke 2D) dibayar SEKARANG, bukan di frame masuk sektor (15-portal3d.js pt3dWarmSync). Ditunda sebentar supaya tidak satu tick dgn warm CPU di atas. */
      try{setTimeout(function(){try{if(typeof pt3dWarmSync==='function')pt3dWarmSync();}catch(eWs){}},120);}catch(eWt){}
    }
    /* Mode 2 strict: kapsul hanya setelah BGM+SFX benar-benar siap (kerjaan nyata; plafon darurat cuma HARD_CAP / cap3d di tick). */
    var complete=vis&&au.ok&&sx.ok;
    var wDone=(ready?WT_PAGE:0)+th.warmFrac*WT_WARM+(au.total?au.n/au.total:1)*WT_AUDIO+(sx.total?sx.n/sx.total:1)*WT_SFX,wi;
    for(wi=0;wi<WT_MODS.length;wi++)if(th.fins[wi])wDone+=WT_MODS[wi];
    var uD=(ready?1:0)+(th.warmOk?1:0)+(au.ok?1:0)+(sx.ok?1:0);
    for(wi=0;wi<WT_MODS.length;wi++)if(th.fins[wi])uD++;
    if(uD>uLast){uLast=uD;barFlash();}
    var wc=0;
    wc+=crp('pg',!ready,WT_PAGE,WT_PAGE,elapsed);
    for(wi=0;wi<WT_MODS.length;wi++)wc+=crp('m'+wi,!th.fins[wi]&&th.st[wi]===1,WT_MODS[wi],WT_MODS[wi],elapsed);
    if(!th.warmOk&&th.wTot>0&&th.exp>0)wc+=crp('w'+th.wDone,true,(WT_WARM/th.exp)*(1-th.part),WT_WARM/th.exp,elapsed);
    if(!au.ok&&au.total>0)wc+=crp('a'+au.n,true,WT_AUDIO/au.total,WT_AUDIO/au.total,elapsed);
    if(!sx.ok&&sx.total>0){
      var per=WT_SFX/sx.total;
      wc+=crp('s'+sx.n,warmed,per,per,elapsed);   /* v151: per langkah metadata selesai */
      /* [PATCH v157] creep tipis selama ada slot aktif — bar tidak diam total di antara dua loadedmetadata; tetap di bawah CREEP_CAP */
      if(warmed&&warmActive>0)wc+=crp('sAct',true,per*0.35,per*1.2,elapsed);
    }
    var p=Math.min(99,Math.floor((wDone+wc)/WT_SUM*100));
    if(p<pLast)p=pLast;
    pLast=p;
    return {ready:ready,th:th,au:au,sx:sx,vis:vis,complete:complete,all:vis&&au.ok&&sx.ok,p:p};
  }
  /* Haluskan angka: TARGET tetap jujur (calc/c.p, bobot unit selesai); yang ditampilkan MENGEJAR target secara eksponensial (BAR_TAU) dengan laju minimum (BAR_MIN %/dtk).
     Tidak pernah melewati target, tidak pernah turun, dan 100% hanya kalau c.all. dt dijepit 64 ms: sesudah blok main-thread 2 dtk bar menyapu pelan di frame berikutnya, bukan loncat.
     Animator rAF sendiri (bukan bergantung pada tick/startPost) supaya sapuan ke 100% tetap selesai walau interval startPost sudah berhenti. Berhenti kalau boot screen hilang. */
  var pShown=0,pTgt=0,pAt=0,pRaf=0,pV=-1,BAR_TAU=220,BAR_MIN=10;
  /* v155: fill selebar bar + translateX (compositor, tetap meluncur saat main thread macet; lihat index.css .bm). */
  try{document.getElementById('boot-bar').classList.add('bm');}catch(eB){}
  /* v158: ghost = segmen TARGET jujur (pTgt) di depan fill; stall = bar macet >1,5 dtk → napas pelan (class .stall, CSS opacity). */
  var ghost=document.getElementById('boot-ghost'),bar=document.getElementById('boot-bar'),gV=-1,mvAt=performance.now(),bsT=0;
  function stallTick(){
    if(bs.classList.contains('off')||pV>=100){clearInterval(bsT);bsT=0;try{bar.classList.remove('stall');}catch(e){}return;}
    try{bar.classList.toggle('stall',performance.now()-mvAt>1500);}catch(e){}
  }
  bsT=setInterval(stallTick,500);
  function barShow(){
    var v=(pTgt>=100&&pShown>=99.5)?100:Math.min(99,Math.floor(pShown+.5));
    if(v===pV)return;
    mvAt=performance.now();if(bar.classList.contains('stall'))bar.classList.remove('stall');
    pV=v;fill.style.transform='translateX('+(v-100)+'%)';fill.setAttribute('data-v',v);pct.textContent=v+'%';
    chProg(v);
    try{if(window.__rain)window.__rain.prog(v/100);}catch(eRp){}   /* hujan matrix ikut progres */
  }
  function barStep(now){
    pRaf=0;
    var dt=Math.min(64,Math.max(0,now-pAt)),gap=pTgt-pShown;pAt=now;
    if(gap>0)pShown=Math.min(pTgt,pShown+Math.max(gap*(1-Math.exp(-dt/BAR_TAU)),Math.min(BAR_MIN*dt/1000,gap)));
    barShow();
    if(pShown<pTgt&&!bs.classList.contains('off'))pRaf=requestAnimationFrame(barStep);
  }
  var rainRd=0;
  function paintBar(c){
    var t=c.all?100:c.p;
    /* hujan: kata mulai dibaca hanya setelah semua modul 3D settle + warm selesai (c.vis); sebelum itu worker hujan cuma mengalir polos (hemat CPU di fase compile). Cadangan di 00-rain: K.wordGateMax. */
    if(c.vis&&!rainRd){rainRd=1;try{if(window.__rain)window.__rain.read();}catch(eRr){}}
    if(t>pTgt)pTgt=t;
    if(ghost){var gv=Math.min(100,Math.round(pTgt));if(gv!==gV){gV=gv;ghost.style.transform='translateX('+(gv-100)+'%)';}}
    if(!pRaf&&pShown<pTgt){pAt=performance.now();pRaf=requestAnimationFrame(barStep);}
  }
  function startPost(){
    if(postT)return;
    postT=setInterval(function(){
      if(bs.classList.contains('off')){clearInterval(postT);postT=0;return;}
      var c=calc(performance.now()-t0);
      paintBar(c);paintPanel(c.ready,c.th,c.complete,c.au,c.sx);
      if(c.all){clearInterval(postT);postT=0;try{window.__bootAudioAll=Math.round(performance.now());}catch(eB){}}
    },250);
  }
  function tick(){
    var elapsed=performance.now()-t0,c=calc(elapsed);
    /* [PATCH v157] jangan anggap "macet" kalau 3D+BGM sudah siap (atau BGM via cap) dan yang tersisa cuma metadata SFX */
    if(!chSlow&&!chRdy&&elapsed>(isRepeatVisit?5000:8000)){
      var onlySfx=false;
      try{
        onlySfx=c.vis&&c.sx&&c.sx.total&&!c.sx.ok&&c.au&&c.au.ok;
      }catch(eOs){}
      if(!onlySfx)chSlowOn();
    }
    paintBar(c);
    paintPanel(c.ready,c.th,false,c.au,c.sx);
    /* v148 strict: 
       - complete → kapsul (BGM+SFX+vis nyata)
       - vis true → jangan cap3d; biarkan complete
       - 5 modul sudah settle tapi !vis (biasanya warmOk masih false di itel) → lanjut sampai complete / HARD_CAP
       - modul macet (mods < total) → cap3d di max3d seperti dulu
       - HARD_CAP → paksa apapun (anti hang) */
    if(c.complete&&gateAt<0)gateAt=elapsed;
    if(c.complete&&(pV>=100||elapsed-gateAt>2500)){window.__bootFinish='gate';finish(c);}   /* [PATCH v167] tunggu bar tampil 100% (sapuan animator), pengaman 2,5 dtk */
    else if(elapsed>=HARD_CAP){window.__bootFinish='cap3d';finish(c);}
    else if(elapsed>=cap3dNow(elapsed)&&!c.vis){
      var modsDone=c.th&&c.th.mods>=c.th.total;
      if(modsDone)requestAnimationFrame(tick);   /* nunggu warmOk + SFX */
      else{window.__bootFinish='cap3d';finish(c);}
    }else requestAnimationFrame(tick);
  }
  try{warmQ=[AMB,MUSIC_COLLAP].filter(Boolean);warmPump();}catch(eW){}   /* v132: warm 2 BGM sejak awal boot */
  paintPanel(false,threeStatus(0),false,null,null);
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
  var TELE_SVG=DUMUL_CHARS.tele,OWL_SVG=DUMUL_CHARS.owl;   /* SVG bersama (didefinisikan di atas file; juga dipakai layar boot) */
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
