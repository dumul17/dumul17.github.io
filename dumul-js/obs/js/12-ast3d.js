'use strict';
/* 12-ast3d.js — asteroid 3D (Three.js r128, dimuat LAZY).
   Cara kerja: fisika/posisi/lensing batu tetap dari astStep() (04-render.js): layer ini cuma menggantikan drawImage sprite.
   Satu renderer WebGL offscreen (canvas tidak masuk DOM). Tiap pass drawAsteroids (belakang / depan BH) merender batu pass itu,
   lalu hasilnya di-drawImage ke canvas 2D -> urutan lapisan (di bawah rasi/BH vs di atas BH), rotasi landscape, dan zoom persis sama.
   Pencahayaan: kunci hangat dari arah Gargantua per batu (dihitung di shader dari posisi batu -> BH), jadi satu draw call per varian.
   Gagal apa pun (WebGL mati, context lost, file nggak termuat) -> state 3 -> sprite 2D lama dipakai lagi.
   Matikan: ?ast3d=0 di URL atau localStorage dumul_ast3d=0. */
var AST3D_CFG={
  on:true,
  lib:'dumul-js/obs/lib/three.module.r186.js?v=1',   /* ES module (r186); anak-nya three.core.r186.js diimpor otomatis. Path + ?v= harus sama dgn SHELL service-worker */
  dprMax:1,   /* resolusi render dibatasi: batu kecil (1-4 px) + lembut, nggak perlu DPR penuh. v23: dulu 1,5; kalau masih berat coba 1 */
  procVariants:6,
  reuse:true,    /* cache hasil render per pass: kalau pan/zoom/posisi BH/layout nggak berubah, GL + astStep cuma jalan ~fps (bawah), frame lain tinggal blit cache. false = render tiap frame seperti dulu */
  slowAlt:0,     /* HP lambat (FS.slow): 1 = pass belakang cuma di frame genap & depan cuma di ganjil (hemat GL, tapi tiap pass cuma ~fps/2 -> orbit patah-patah). 0 = kedua pass boleh render tiap frame (mulus) */
  slowMax:0,     /* HP lambat (FS.slow): batas atas jeda render batu (ms); jeda = max(1000/fps, min(slowMax, 2 x interval frame)). Dulu 140 -> ~8 update/dtk. 60 pun masih bikin frame 50 ms (kuantisasi vsync 16,6 ms) kena cache selang-seling -> patah. 0 = jeda tidak dilebarkan (default, orbit mulus seperti ?fs=0) */
  fps:30,        /* laju render batu saat diam (cache dipakai ulang di antaranya). Saat pan/zoom/BH bergerak: tiap frame */
  lod:[[1,2.6],[2,4.2]]   /* LOD batu: [detail ikosahedron, batas _sz (px)]; batu dgn _sz di bawah batas pakai mesh detail itu, sisanya detail 3 (320 segitiga). Batu 1-4px nggak butuh 320 segitiga. [] = semua detail 3 seperti dulu */
};
try{
  if(/[?&]ast3d=0(&|$)/.test(location.search)||localStorage.getItem('dumul_ast3d')==='0')AST3D_CFG.on=false;
}catch(eA3){}
var AST3D={cache:[null,null,null],ver:0,rT:-1e9,reuseNow:-1,nx:[-1e9,-1e9,-1e9],ru:[-1,-1,-1],rd:[-1,-1,-1],sgT:-1,sgSame:false,hotF:false,sigA:[],sigB:[],reused:0,rendered:0,tiers:[],state:0,/* 0 belum, 1 memuat, 2 siap, 3 gagal/nonaktif */r:null,gl:null,pw:0,ph:0,cam:null,sc:null,mat:null,uni:null,vars:[],cap:0,w:0,h:0,pr:0,drawn:0,passes:0,err:''};

/* Warm-up shader: render pertama sebuah renderer Three.js mengompilasi program shader (ratusan ms di HP) -> hitch pas drone/batu/teleskop pertama muncul; setSize pertama (realokasi framebuffer MSAA) juga mahal, jadi ukuran kanvas diset di build.
   compile() cuma MEMINDAHKAN stall itu; jadi dipanggil saat idle (layar boot, user belum main), satu renderer per giliran supaya tidak numpuk.
   Dipakai juga oleh 13-scope3d.js dan 14-drone3d.js. */
/* ?ca=0 mematikan compileAsync (12 + 17): A/B bench jalur compile sinkron vs async. Default NYALA. Tercatat di JSON bench (R.ca). */
var THREE_CA=(function(){var on=true;try{on=!/[?&]ca=0(?:&|#|$)/.test(location.search);}catch(e){}try{window.__ca=on?1:0;}catch(e){}return on;})();
var THREE_WARM={q:[],busy:false,total:0,done:0,part:0};   /* total/done: dibaca 07-boot (progres warm-up di panel boot); part = pecahan (0..<1) item yang sedang diproses */
/* ?ws=0 mematikan IRISAN warm-up per objek (A/B bench). Default NYALA. */
var THREE_WS=(function(){var on=true;try{on=!/[?&]ws=0(?:&|#|$)/.test(location.search);}catch(e){}try{window.__ws=on?1:0;}catch(e){}return on;})();
/* ?wi=0: warm-up mulai lewat setTimeout(run,0), bukan requestIdleCallback({timeout:2000}) (A/B bench; bagian 23-24 log: tunggu idle ±43-54% rantai warm). Default NYALA = perilaku lama. Tercatat di JSON bench (R.wi). */
var THREE_WI=(function(){var on=true;try{on=!/[?&]wi=0(?:&|#|$)/.test(location.search);}catch(e){}try{window.__wi=on?1:0;}catch(e){}return on;})();
function threeWarmObjs(sc){var o=[];try{sc.traverseVisible(function(x){if(x!==sc&&x.material&&(x.isMesh||x.isPoints||x.isLine||x.isSprite))o.push(x);});}catch(e){return null;}return o;}
function threeWarm(r,sc,cam,pre,H){
  try{if((typeof IS_POTATO!=='undefined'&&IS_POTATO)||(typeof reduce!=='undefined'&&reduce))return;}catch(e){}
  THREE_WARM.q.push({r:r,sc:sc,cam:cam,pre:pre,H:H});THREE_WARM.total++;
  if(!THREE_WARM.busy)threeWarmNext();
}
function threeWarmNext(){
  var it=THREE_WARM.q.shift();
  if(!it){THREE_WARM.busy=false;return;}
  THREE_WARM.busy=true;
  var W=threeWarmRec0();
  var run=function(){
    try{W.idle=performance.now()-W.t0;}catch(eW){}
    try{var tp=performance.now();if(it.pre)it.pre();W.pre=performance.now()-tp;}catch(e){}   /* pra-ukur kanvas (W/H sudah valid di layar boot) */
    var warmDone=function(){THREE_WARM.part=0;THREE_WARM.done++;threeWarmRec1(W);setTimeout(threeWarmNext,150);};
    var pBase=0;   /* dasar pecahan progres item: 0, atau 0,4 kalau fase compile teririsnya sudah jalan dulu */
    var fin=function(){
      var r=it.r,sc=it.sc,cam=it.cam,objs=THREE_WS?threeWarmObjs(sc):null;
      if(!objs||objs.length<2){   /* scene 1 objek / ?ws=0: jalur lama (compile + satu render) */
        var tq=performance.now();
        try{r.compile(sc,cam);threeGLWarmBegin(r,it.H);r.render(sc,cam);}catch(e){}
        try{W.cpu+=performance.now()-tq;W.sl++;}catch(eW){}   /* compile (sudah siap -> murah) + satu render: upload tekstur/buffer pertama ikut dibayar di sini */
        warmDone();return;
      }
      /* IRISAN: satu render per objek (objek lain disembunyikan sementara), maks ±10 ms per giliran lalu yield. Link shader + upload buffer/tekstur tiap material
         jadi blok kecil terpisah (bukan satu blok 1-3 dtk), progres nyata (THREE_WARM.part) dibaca 07-boot. compile() sinkron SENGAJA dilewati di jalur ini:
         tiap render() mengompilasi materialnya sendiri; kalau program sudah siap (compileAsync + KHR_parallel_shader_compile) render murah. Visibility dipulihkan di akhir. */
      var i=0,k,vis=[];
      for(k=0;k<objs.length;k++){vis.push(objs[k].visible);objs[k].visible=false;}
      var step=function(){
        var t=performance.now();
        while(i<objs.length&&performance.now()-t<10){
          objs[i].visible=true;
          try{threeGLWarmBegin(r,it.H);r.render(sc,cam);}catch(e){}
          objs[i].visible=false;i++;
          THREE_WARM.part=Math.min(.98,pBase+(.98-pBase)*i/objs.length);
        }
        try{W.cpu+=performance.now()-t;W.sl++;}catch(eW){}
        if(i<objs.length){setTimeout(step,0);return;}
        for(k=0;k<objs.length;k++)objs[k].visible=vis[k];
        warmDone();
      };
      step();
    };
    /* r158+: compileAsync memakai KHR_parallel_shader_compile (link shader di luar main thread). Tanpa ekstensi itu three jatuh ke compile sinkron, jadi tidak lebih buruk.
       Batas 4 dtk: kalau promise macet, lanjut sinkron supaya progres boot tidak tertahan. */
    var start=function(){
      if(THREE_CA&&it.r.compileAsync){
        var d=false,go=function(){if(d)return;d=true;fin();};
        setTimeout(go,4000);
        try{it.r.compileAsync(it.sc,it.cam).then(go,go);}catch(e){go();}
      }else fin();
    };
    /* IRISAN FASE COMPILE: bagian sinkron compileAsync(scene) membangun SEMUA program sekaligus (bench itel: blok `run` 0,67-0,79 dtk). Di sini program dibangun
       per objek (r.compile(objek, kamera, scene): lampu tetap dari scene), maks ±10 ms per giliran lalu yield; sesudah semua program ada, compileAsync(scene) di start()
       tinggal cache-hit (murah) dan menunggu siap lewat polling-nya sendiri. Pecahan progres 0..0,4 untuk fase ini. ?ws=0 = jalur lama. */
    var cobjs=(THREE_WS&&THREE_CA&&it.r.compileAsync)?threeWarmObjs(it.sc):null;
    try{W.n=cobjs?cobjs.length:0;}catch(eW){}
    if(cobjs&&cobjs.length>=2){
      var cj=0;
      var cstep=function(){
        var t=performance.now();
        while(cj<cobjs.length&&performance.now()-t<10){
          try{it.r.compile(cobjs[cj],it.cam,it.sc);}catch(e){}
          cj++;
          THREE_WARM.part=.4*cj/cobjs.length;
        }
        try{W.cpu+=performance.now()-t;W.sl++;}catch(eW){}
        if(cj<cobjs.length){setTimeout(cstep,0);return;}
        pBase=.4;
        start();
      };
      cstep();
    }else start();
  };
  if(!THREE_WI)setTimeout(run,0);else if(typeof requestIdleCallback==='function')requestIdleCallback(run,{timeout:2000});else setTimeout(run,300);
}

/* ===== RENDERER GL BERSAMA (v22) =====
   Dulu tiap unit 3D (AST3D, SCP3D, DR3D, PT3D, PL3D) membuat WebGLRenderer + konteks WebGL sendiri: lima kali bayar init konteks, alokasi framebuffer, dan memori GPU lima buffer.
   Sekarang dua grup, masing-masing SATU konteks:
     'big'   = AST3D + PL3D (kanvas ukuran layar, antialias:false)
     'small' = SCP3D + DR3D + PT3D (kanvas kecil <= 256 px, antialias:true, ACES + sRGB)
   Semua kanvas GL ini offscreen (tidak masuk DOM) dan hasilnya selalu disalin lewat drawImage, jadi berbagi konteks aman asal tiap unit menyalin hasilnya SEGERA setelah render
   (preserveDrawingBuffer:false) atau lewat salinan 2D miliknya sendiri (threeGLSnap).
   Cara kerja:
   - tiap unit meminta handle H = threeGLGet(...) dan melaporkan ukurannya lewat threeGLSize(H,w,h) (piksel perangkat, pixelRatio renderer selalu 1).
     Ukuran kanvas grup = gabungan (maks lebar x maks tinggi) semua unit; grup 'small' cuma membesar, tidak pernah mengecil (tidak ada setSize bolak-balik antar unit).
   - sebelum render, unit memanggil threeGLBegin(H): viewport + scissor = wilayah unit itu, DIRATAKAN KE ATAS-KIRI kanvas. Jadi koordinat sumber drawImage (0,0,w,h)
     sama seperti kanvas milik sendiri dulu (tanpa balik sumbu y).
   - scissor parsial (pita planet, kotak petir): threeGLRect(H,x,y,w,h) dalam koordinat atas-kiri wilayah unit; threeGLFull(H) = kembali ke seluruh wilayah unit.
   - ?gs=0 = tiap unit kembali punya renderer sendiri seperti sebelum v22 (A/B + rollback). Tercatat di window.__gs dan JSON bench (R.gs, R.glG).
   - webglcontextlost: semua unit di grup itu jatuh ke fallback 2D masing-masing (fail() per unit). */
var THREE_GS=(function(){var on=true;try{on=!/[?&]gs=0(?:&|#|$)/.test(location.search);}catch(e){}try{window.__gs=on?1:0;}catch(e2){}return on;})();
var THREE_GLG={big:null,small:null};
try{window.__glG=function(){var o={},k,G,i;for(k in THREE_GLG){G=THREE_GLG[k];if(!G)continue;o[k]={w:G.w,h:G.h,aa:G.aa,units:G.us.map(function(h){return [h.u,h.w,h.h];})};}return o;};}catch(eG){}
function threeGLMake(aa,tone,label){
  var T=THREE,cv=document.createElement('canvas');
  try{window.__glLabel=label;}catch(e){}   /* dibaca 21-bench.js saat konstruktor */
  var r=new T.WebGLRenderer({canvas:cv,alpha:true,antialias:aa,premultipliedAlpha:true,powerPreference:'low-power',preserveDrawingBuffer:false});
  r.setClearColor(0x000000,0);r.setPixelRatio(1);
  if(tone){r.outputColorSpace=T.SRGBColorSpace;r.toneMapping=T.ACESFilmicToneMapping;r.toneMappingExposure=1.0;}
  var G={r:r,cv:cv,w:0,h:0,aa:aa,us:[],grow:false,label:label};
  r.__G=G;
  cv.addEventListener('webglcontextlost',function(e){
    e.preventDefault();
    var u=G.us.slice(),i;
    for(i=0;i<u.length;i++){try{u[i].fail('webglcontextlost');}catch(e2){}}
  },false);
  return G;
}
/* unit = nama unit (label bench di mode ?gs=0), grp = 'big'|'small', aa/tone = pengaturan renderer SENDIRI (dipakai hanya di ?gs=0), expo = toneMappingExposure unit (null = biarkan),
   fail = fungsi gagal unit (dipanggil saat konteks hilang). */
function threeGLGet(unit,grp,aa,tone,expo,fail){
  var G;
  if(THREE_GS){
    G=THREE_GLG[grp];
    if(!G){G=THREE_GLG[grp]=threeGLMake(grp==='small',grp==='small','GL'+grp.toUpperCase());G.grow=(grp==='small');}
  }else G=threeGLMake(aa,tone,unit);
  var H={u:unit,G:G,r:G.r,w:0,h:0,ex:(expo==null?null:expo),fail:fail,sn:null,sx:null};
  G.us.push(H);
  if(!THREE_GS&&expo!=null)G.r.toneMappingExposure=expo;
  return H;
}
function threeGLSize(H,w,h){
  w=Math.max(1,w|0);h=Math.max(1,h|0);
  H.w=w;H.h=h;
  var G=H.G,u=G.us,i,mw=0,mh=0;
  for(i=0;i<u.length;i++){if(u[i].w>mw)mw=u[i].w;if(u[i].h>mh)mh=u[i].h;}
  if(G.grow){if(G.w>mw)mw=G.w;if(G.h>mh)mh=G.h;}
  if(mw!==G.w||mh!==G.h){G.w=mw;G.h=mh;G.r.setPixelRatio(1);G.r.setSize(mw,mh,false);}
}
/* sebelum SETIAP render unit (frame, warm-up, render pertama) */
function threeGLBegin(H){
  var G=H.G,r=G.r;
  if(H.ex!=null)r.toneMappingExposure=H.ex;
  if(G.us.length>1){var y=G.h-H.h;r.setViewport(0,y,H.w,H.h);r.setScissor(0,y,H.w,H.h);r.setScissorTest(true);}
}
/* scissor parsial; x,y,w,h = koordinat ATAS-KIRI di dalam wilayah unit (piksel perangkat) */
function threeGLRect(H,x,y,w,h){var G=H.G,r=G.r;r.setScissorTest(true);r.setScissor(x,G.h-y-h,w,h);}
function threeGLFull(H){
  var G=H.G,r=G.r;
  if(G.us.length>1){r.setScissor(0,G.h-H.h,H.w,H.h);r.setScissorTest(true);}
  else r.setScissorTest(false);
}
/* y (koordinat GL, dari bawah) baris paling BAWAH wilayah unit; untuk readPixels */
function threeGLOy(H){return H.G.h-H.h;}
/* salinan 2D wilayah unit ke kanvas milik unit. Hanya perlu kalau renderer dibagi DAN hasilnya digambar lagi di frame yang sama tanpa render ulang
   (ghost copy teleskop, cincin portal): unit lain bisa menimpa kanvas GL di antaranya. Tidak dibagi -> null, baca langsung. */
function threeGLSnap(H){
  if(H.G.us.length<2)return null;
  var c=H.sn||(H.sn=document.createElement('canvas')),x;
  if(c.width!==H.w||c.height!==H.h){c.width=H.w;c.height=H.h;H.sx=null;}
  x=H.sx||(H.sx=c.getContext('2d'));
  x.globalCompositeOperation='copy';x.drawImage(H.G.cv,0,0,H.w,H.h,0,0,H.w,H.h);x.globalCompositeOperation='source-over';
  return c;
}
/* sumber gambar untuk drawImage 5/3-argumen (seluruh kanvas): salinan unit kalau dibagi, kanvas GL sendiri kalau tidak */
function threeGLSrc(H){return (H.G.us.length>1&&H.sn)?H.sn:H.r.domElement;}
/* warm-up: render dengan wilayah unit (kalau ada) atau seluruh kanvas grup */
function threeGLWarmBegin(r,H){
  if(H){threeGLBegin(H);threeGLFull(H);}
  else if(r.__G){r.setViewport(0,0,r.__G.w,r.__G.h);r.setScissorTest(false);}
}

function ast3dFail(why){AST3D.state=3;AST3D.err=String(why||'');try{console.warn('[ast3d] fallback ke sprite 2D:',AST3D.err);}catch(e){}}

/* Pemuat three.js BERSAMA (12/13/14/15/17 semuanya memanggil ini). three r186 hanya ada sebagai ES module -> import() dinamis, hasilnya dipasang ke window.THREE
   supaya semua kode lama (T=THREE; T.Mesh ...) tetap jalan. Satu promise (window.__threeP) dipakai bersama: modul kedua dst. tinggal menunggu, tidak muat dobel.
   - window.THREE = SALINAN (Object.assign) agar bisa ditulisi (21-bench.js membungkus THREE.WebGLRenderer); namespace module asli read-only.
   - ColorManagement dimatikan: warna hex dipakai apa adanya seperti r128 (tanpa konversi sRGB->linear), jadi tampilan tidak bergeser. Harus sebelum THREE.Color pertama dibuat.
   Gagal (offline/blokir/browser tanpa import()) -> bad(pesan) -> tiap modul jatuh ke versi 2D seperti sebelumnya. */
/* ANTREAN build modul 3D: r186 memuat lewat import() -> SATU promise, jadi tanpa antrean kelima modul (12/13/14/15/17) build beruntun dalam satu rantai microtask
   (bench itel A6610L: satu blok 6,9 dtk, bar boot beku lalu loncat). Antrean ini menjalankan SATU build per giliran, lalu menunggu satu frame ter-paint
   (rAF -> setTimeout 0) supaya bar/panel boot sempat naik. Total CPU tetap; bedanya blok 6,9 dtk jadi ±5 blok terpisah (target: 0,7-2 dtk per blok, seperti di r128).
   Tab tersembunyi tidak menembakkan rAF -> timer 250 ms sebagai cadangan agar antrean tidak macet. Urutan = urutan panggilan threeLoad. */
var THREE_Q={q:[],run:false};
/* PENCATAT GILIRAN (v20): HANYA mengukur, perilaku antrean tidak berubah. Terbaca di window.__threeQ, dicatat bench (R.threeQ).
   Antrean ini dipakai SEMUA unit 3D (threeLoad -> threeRun di 12/13/14/15/17, plus kelanjutan tahap irisan 13/14/15 yang unshift ke sini), jadi satu pencatat cukup.
   - turns: [label, runMs, waitMs, via] per giliran (maks 100). runMs = lama f(); waitMs = dari threeQWait dipanggil sampai giliran ini mulai (rAF + setTimeout 0, atau cadangan 250 ms);
     via 'r' = lewat rAF, 't' = timer cadangan 250 ms. label ditebak dari array waktu modul yang bertambah selama giliran (SCP3D/DR3D/PT3D/PL3D);
     giliran tanpa array yang bertambah = 'AST?' (AST3D tidak punya array waktu, atau giliran kosong).
   - n/runMs/waitMs/waitMax/tmo: ringkasan semua giliran.
   - warm: antrean THREE_WARM (semua unit): items [objN, idleMs, preMs, cpuMs, slices, totalMs] per renderer (maks 24); idleMs = tunggu requestIdleCallback, preMs = pra-ukur kanvas,
     cpuMs = jumlah badan irisan (cstep/step) atau compile+render jalur lama, totalMs = dari threeWarmNext sampai selesai (sisanya = tunggu yield/compileAsync);
     gapMs = jeda 150 ms antar-item dijumlah. objN = jumlah objek scene (ciri modul: ±7-8 AST3D, ±43 SCP3D, ±12 DR3D, ±14 PT3D, 1 PL3D). */
var THREE_QS={n:0,runMs:0,waitMs:0,waitMax:0,tmo:0,lw:0,lv:'',turns:[],warm:{n:0,idleMs:0,cpuMs:0,sl:0,gapMs:0,last:0,items:[]}};
try{window.__threeQ=THREE_QS;}catch(eQ){}
var THREE_QN=['SCP3D','DR3D','PT3D','PL3D'];
function threeQLens(){try{return [(window.__scp3dT||[]).length,(window.__dr3dT||[]).length,(window.__pt3dT||[]).length,(window.__pl3dT||[]).length];}catch(e){return [0,0,0,0];}}
function threeQRec(a,l0,w,v){
  var S=THREE_QS,run=performance.now()-a,l1=threeQLens(),lb='AST?',i;
  for(i=0;i<4;i++){if(l1[i]>l0[i]){lb=THREE_QN[i];break;}}
  S.n++;S.runMs+=run;S.waitMs+=w;if(w>S.waitMax)S.waitMax=w;if(v==='t')S.tmo++;
  if(S.turns.length<100)S.turns.push([lb,Math.round(run),Math.round(w),v]);
}
function threeWarmRec0(){var W={t0:0,idle:0,pre:0,cpu:0,sl:0,n:0};try{W.t0=performance.now();var S=THREE_QS.warm;if(S.last>0)S.gapMs+=W.t0-S.last;}catch(e){}return W;}
function threeWarmRec1(W){try{var S=THREE_QS.warm,t=performance.now();S.n++;S.idleMs+=W.idle;S.cpuMs+=W.cpu;S.sl+=W.sl;S.last=t;if(S.items.length<24)S.items.push([W.n,Math.round(W.idle),Math.round(W.pre),Math.round(W.cpu),W.sl,Math.round(t-W.t0)]);}catch(e){}}
function threeQNext(){
  var f=THREE_Q.q.shift();
  if(!f){THREE_Q.run=false;return;}
  var qa=0,ql=[0,0,0,0],qw=THREE_QS.lw,qv=THREE_QS.lv;
  try{qa=performance.now();ql=threeQLens();}catch(eq){}
  try{f();}catch(e){try{console.warn('[three] build modul gagal:',e&&e.message||e);}catch(e2){}}
  try{threeQRec(qa,ql,qw,qv);}catch(eq2){}
  threeQWait();
}
function threeQWait(){
  var d=false,t0=0;try{t0=performance.now();}catch(eq){}
  var go=function(v){if(d)return;d=true;try{THREE_QS.lw=performance.now()-t0;THREE_QS.lv=v;}catch(eq2){}threeQNext();};
  try{requestAnimationFrame(function(){setTimeout(function(){go('r');},0);});}catch(e){}
  setTimeout(function(){go('t');},250);
}
function threeRun(fn){
  THREE_Q.q.push(fn);
  if(!THREE_Q.run){THREE_Q.run=true;threeQWait();}
}
function threeLoad(ok,bad){
  if(typeof THREE!=='undefined'&&THREE.REVISION){threeRun(ok);return;}
  var P=window.__threeP;
  if(!P){
    try{
      var url=new URL((typeof AST3D_CFG!=='undefined'&&AST3D_CFG.lib)||'dumul-js/obs/lib/three.module.r186.js?v=1',document.baseURI).href;
      P=window.__threeP=import(url).then(function(m){
        try{m.ColorManagement.enabled=false;}catch(e){}
        window.THREE=Object.assign({},m);
        try{window.__threeAt=performance.now();}catch(e){}   /* waktu three.js selesai di-import: 07-boot memakainya untuk batas tunggu (sinyal lambat) */
        try{if(typeof window.__threeReady==='function')window.__threeReady(window.THREE);}catch(e){}   /* kait untuk 21-bench.js (?bench=1): pasang pembungkus WebGLRenderer SEBELUM build pertama */
        return window.THREE;
      });
    }catch(e){bad('import() tidak didukung: '+(e&&e.message||e));return;}
  }
  P.then(function(){threeRun(ok);},function(e){window.__threeP=null;bad('gagal muat three.js: '+(e&&e.message||e));});
}

function ast3dLoad(){
  if(AST3D.state!==0)return;
  if(!AST3D_CFG.on){AST3D.state=3;AST3D.err='off';return;}
  AST3D.state=1;
  var go=function(){
    try{ast3dBuild();}catch(e){ast3dFail(e&&e.message||e);}
  };
  if(typeof THREE!=='undefined'&&THREE.REVISION){go();return;}
  threeLoad(go,ast3dFail);
}

function ast3dMulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}

/* Batu procedural: ikosahedron detail 3 (320 sisi) + deformasi halus + kawah + gepeng. Normal dihitung ulang -> tampak berfacet. */
function ast3dRockGeo(seed,detail){   /* detail dihilangkan = 3 (dipakai 17-planet3d.js apa adanya) */
  var T=THREE,geo=new T.IcosahedronGeometry(1,detail==null?3:detail),pos=geo.attributes.position,v=new T.Vector3(),rnd=ast3dMulberry(seed*7919+13),i,c;
  var cr=[];
  for(i=0;i<7;i++)cr.push({d:new T.Vector3(rnd()-.5,rnd()-.5,rnd()-.5).normalize(),cosA:Math.cos(.20+rnd()*.30),dep:.10+rnd()*.14});
  var sy=.72+rnd()*.28,sz=.62+rnd()*.30,f1=1.6+rnd()*1.6,f2=3.1+rnd()*2.2,p1=rnd()*6.28,p2=rnd()*6.28,p3=rnd()*6.28,sum=0;
  for(i=0;i<pos.count;i++){
    v.fromBufferAttribute(pos,i).normalize();
    var r=1+.20*Math.sin(f1*v.x+p1)*Math.cos(f1*1.3*v.y+p2)+.13*Math.sin(f2*v.z+p3+v.x*2.1)+.07*Math.sin(f2*2.3*(v.x+v.y)+p1);
    for(c=0;c<cr.length;c++){
      var dd=v.dot(cr[c].d);
      if(dd>cr[c].cosA){var t=(dd-cr[c].cosA)/(1-cr[c].cosA);r-=cr[c].dep*t*t*(3-2*t);}
    }
    pos.setXYZ(i,v.x*r,v.y*r*sy,v.z*r*sz);
    sum+=Math.hypot(v.x*r,v.y*r*sy,v.z*r*sz);
  }
  var k=.74/(sum/pos.count);   /* radius rata-rata ~ .74: siluet sepadan dengan sprite lama (poligon ~.7R, gepeng .72) */
  for(i=0;i<pos.count;i++)pos.setXYZ(i,pos.getX(i)*k,pos.getY(i)*k,pos.getZ(i)*k);
  pos.needsUpdate=true;
  geo.computeVertexNormals();
  return geo;
}

/* satu varian = satu InstancedBufferGeometry + satu Mesh; atribut per-instance diisi ulang tiap frame (dipadatkan) */
function ast3dAddVariant(geo,tier){
  var T=THREE,ig=new T.InstancedBufferGeometry(),cap=AST3D.cap,v={};
  ig.index=geo.index;
  ig.setAttribute('position',geo.attributes.position);
  ig.setAttribute('normal',geo.attributes.normal);
  v.A=new T.InstancedBufferAttribute(new Float32Array(cap*4),4).setUsage(T.DynamicDrawUsage);   /* x, y, ukuran, alpha */
  v.B=new T.InstancedBufferAttribute(new Float32Array(cap*4),4).setUsage(T.DynamicDrawUsage);   /* sumbu putar xyz, sudut */
  v.Z=new T.InstancedBufferAttribute(new Float32Array(cap),1).setUsage(T.DynamicDrawUsage);     /* kedalaman */
  ig.setAttribute('iA',v.A);ig.setAttribute('iB',v.B);ig.setAttribute('iZ',v.Z);
  ig.instanceCount=0;
  if(tier==null)tier=AST3D_CFG.lod.length;   /* tanpa tier (GLB) = tier detail penuh */
  v.geo=ig;v.base=geo;v.n=0;v.tier=tier;
  (AST3D.tiers[tier]||(AST3D.tiers[tier]=[])).push(v);
  v.mesh=new T.Mesh(ig,AST3D.mat);
  v.mesh.frustumCulled=false;v.mesh.visible=false;
  AST3D.sc.add(v.mesh);
  AST3D.vars.push(v);
  return v;
}

function ast3dBuild(){
  var T=THREE;
  var gl=threeGLGet('AST3D','big',true,false,null,ast3dFail),r=gl.r;   /* v22: renderer grup 'big' (dibagi dgn PL3D, antialias:false); ?gs=0 = renderer sendiri antialias:true */
  AST3D.gl=gl;AST3D.r=r;
  AST3D.sc=new T.Scene();
  AST3D.cam=new T.OrthographicCamera(0,W,H,0,-600,600);
  AST3D.uni={uBH:{value:new T.Vector2(W*.5,H*.5)},uBack:{value:0},uFall:{value:Math.max(W,H)*.9}};
  AST3D.mat=new T.ShaderMaterial({
    uniforms:AST3D.uni,
    transparent:true,depthTest:true,depthWrite:true,
    blending:T.CustomBlending,blendEquation:T.AddEquation,blendSrc:T.OneFactor,blendDst:T.OneMinusSrcAlphaFactor,
    vertexShader:[
      'attribute vec4 iA;attribute vec4 iB;attribute float iZ;',
      'uniform vec2 uBH;',
      'varying vec3 vN;varying vec3 vL;varying float vA;varying float vD;',
      'vec3 rot(vec3 v,vec3 k,float a){float c=cos(a),s=sin(a);return v*c+cross(k,v)*s+k*dot(k,v)*(1.-c);}',
      'void main(){',
      '  vec3 p=rot(position,iB.xyz,iB.w);',
      '  vN=rot(normal,iB.xyz,iB.w);',
      '  vec2 d=uBH-iA.xy;float len=length(d);',
      '  vL=normalize(vec3(d,len*.5+18.));',   /* arah ke Gargantua (sedikit mengangkat ke arah kamera biar sisi depan juga kena) */
      '  vA=iA.w;vD=len;',
      '  gl_Position=projectionMatrix*vec4(vec3(iA.xy,iZ)+p*iA.z,1.);',
      '}'
    ].join('\n'),
    fragmentShader:[
      'uniform float uBack;uniform float uFall;',
      'varying vec3 vN;varying vec3 vL;varying float vA;varying float vD;',
      'void main(){',
      '  vec3 n=normalize(vN),L=normalize(vL);',
      '  float nl=max(dot(n,L),0.);',
      '  float fall=clamp(1.25-vD/uFall,.22,1.25);',
      '  vec3 warm=vec3(1.,.74,.48),base=vec3(.13,.135,.13);',
      '  vec3 col=base*.22+base*warm*nl*fall*1.5+warm*pow(nl,4.)*fall*.22;',   /* badan gelap, sisi yang menghadap BH menyala hangat */
      '  float rim=pow(1.-max(n.z,0.),2.5)*pow(max(dot(normalize(n.xy+1e-4),normalize(L.xy+1e-4)),0.),1.5);',
      '  col+=warm*rim*fall*.30;',
      '  col=mix(col,col*vec3(.72,.86,1.12)*.82,uBack);',   /* pass belakang: lebih dingin + redup, seperti sprite belakang */
      '  gl_FragColor=vec4(col*vA,vA);',
      '}'
    ].join('\n')
  });
  AST3D.cap=Math.max(128,(AST&&AST.length||0)+16);
  var LD=AST3D_CFG.lod,ti,i;
  for(ti=0;ti<=LD.length;ti++)
    for(i=0;i<AST3D_CFG.procVariants;i++)ast3dAddVariant(ast3dRockGeo(i+1,ti<LD.length?LD[ti][0]:3),ti);   /* seed sama per tier -> bentuk batu sama, cuma kerapatan mesh beda */
  AST3D.state=2;   /* siap dipakai segera dengan batu procedural */
  threeWarm(r,AST3D.sc,AST3D.cam,function(){ast3dResize();},gl);   /* ukuran layar penuh dipasang di warm-up, bukan di frame batu pertama */
}

/* pilih varian: tier menurut ukuran batu (_sz), lalu bentuk menurut sprite; tier kosong -> turun ke tier berikutnya yang ada */
function ast3dPick(a){
  var L=AST3D_CFG.lod,T=AST3D.tiers,t=L.length,i,l;
  for(i=0;i<L.length;i++)if(a._sz<L[i][1]){t=i;break;}
  for(i=t;i<=L.length;i++){l=T[i];if(l&&l.length)return l[(a.sprite|0)%l.length];}
  for(i=t-1;i>=0;i--){l=T[i];if(l&&l.length)return l[(a.sprite|0)%l.length];}
  return AST3D.vars[0];
}

function ast3dResize(){
  var pr=Math.min(DPR||1,AST3D_CFG.dprMax);
  if(AST3D.w===W&&AST3D.h===H&&AST3D.pr===pr)return;
  AST3D.w=W;AST3D.h=H;AST3D.pr=pr;
  AST3D.pw=Math.max(1,Math.floor(W*pr));AST3D.ph=Math.max(1,Math.floor(H*pr));   /* piksel perangkat (sama dgn kanvas lama: floor(W*pr)); pixelRatio renderer selalu 1 */
  threeGLSize(AST3D.gl,AST3D.pw,AST3D.ph);
  var c=AST3D.cam;c.left=0;c.right=W;c.top=H;c.bottom=0;c.updateProjectionMatrix();
  AST3D.uni.uFall.value=Math.max(W,H)*.9;
}

/* ---- Cache hasil render (hemat kerja sia-sia) ----
   Batu bergerak pelan, jadi selama kamera (pan/zoom), posisi BH, layout, dan slider batu TIDAK berubah, render GL + astStep cukup ~AST3D_CFG.fps;
   frame di antaranya cuma drawImage dari kanvas cache per pass (belakang/depan). Ada yang berubah / ada batu yang lagi terpental (tap) -> render tiap frame. */
function ast3dSig(){
  var s=AST3D.sigB,i=0,k,c=AST_CFG,bp=camBH(),an=astAnchor();
  s[i++]=skyZoom;s[i++]=skyPan.x;s[i++]=skyPan.y;s[i++]=bp[0];s[i++]=bp[1];s[i++]=an[0];s[i++]=an[1];
  s[i++]=BHZ||1;s[i++]=BH.Rr;s[i++]=BHU.str;s[i++]=W;s[i++]=H;s[i++]=DPR||1;s[i++]=upAng();s[i++]=astN();
  s[i++]=AST_MIX;s[i++]=AST_RING_LAST?1:0;s[i++]=CAMERA_MODE?1:0;
  s[i++]=SECT.cur?1:0;s[i++]=SECT.busy?1:0;s[i++]=(drag.on&&drag.moved)?1:0;
  s[i++]=(typeof PW!=='undefined'?PW:0);s[i++]=(typeof PH!=='undefined'?PH:0);   /* geometri planet (sabuk limb) cuma berubah saat layout berubah */
  for(k in c){var v=c[k];if(typeof v==='number')s[i++]=v;else if(typeof v==='boolean')s[i++]=v?1:0;}
  s.length=i;
  var p=AST3D.sigA,same=(p.length===i);
  if(same)for(var j=0;j<i;j++)if(p[j]!==s[j]){same=false;break;}
  AST3D.sigA=s;AST3D.sigB=p;   /* tukar: sigA = terbaru */
  return same;
}
/* Signature dicek SEKALI per frame (pass mana pun yang pertama): ada yang berubah / batu masih terpental -> ver naik -> semua cache basi. */
function ast3dFrameSig(now){
  if(AST3D.sgT===now)return AST3D.sgSame;
  AST3D.sgT=now;
  var same=ast3dSig();
  if(!same||AST3D.hotF)AST3D.ver++;
  AST3D.hotF=false;   /* diisi ulang oleh loop render di ast3dDraw */
  AST3D.sgSame=same;
  return same;
}
/* Rencana per pass, dipanggil drawAsteroids (04-render.js) SEBELUM astStep. Tiap pass (belakang / depan) punya jadwal sendiri:
     0 = normal (astStep + render GL)   1 = pakai cache (blit; astStep + GL dilewati)   2 = render GL TANPA astStep (pakai posisi astStep terakhir)
   GANTIAN: kalau pass belakang dan depan jatuh tempo di frame yang sama, pass depan dimajukan setengah periode (jatuh tempo lagi di tengah) -> saat diam tiap frame cuma
   satu pass yang merender (beban rata, tidak ada frame berat-ringan). Pass depan di frame sendiri memakai posisi dari astStep pass belakang (usia <= 1 periode, sama dgn cache). */
function ast3dReuse(now,half){
  var ci=half<0?0:(half>0?1:2),U=AST3D.ru;
  U[ci]=-1;
  if(!AST3D_CFG.reuse||AST3D.state!==2||!AST3D_CFG.on)return 0;
  try{
    if((typeof IS_POTATO!=='undefined'&&IS_POTATO)||(typeof reduce!=='undefined'&&reduce))return 0;
    if((typeof BELT!=='undefined'&&BELT)&&AST3D.cache[ci]){U[ci]=now;AST3D.reused++;return 1;}   /* zoom masuk dumul.html (beltEnter): batu dibekukan = blit cache terakhir, tanpa signature / astStep / GL */
    var same=ast3dFrameSig(now),C=AST3D.cache,per=1000/Math.max(1,AST3D_CFG.fps),ok=!!(C[ci]&&C[ci].ver===AST3D.ver);
    var fsl=(typeof FS!=='undefined'&&FS.slow)?FS:null;
    if(fsl){   /* HP lambat (05-sector-ui.js FS): jeda render = 2x interval frame (maks 140 ms), pass belakang cuma di frame genap, depan cuma di ganjil -> tiap frame paling banyak satu pass GL */
      if(AST3D_CFG.slowMax>0)per=Math.max(per,Math.min(AST3D_CFG.slowMax,fsl.ema*2));   /* slowMax 0 = jeda TIDAK dilebarkan (sama dgn governor mati) */
      if(AST3D_CFG.slowAlt&&ok&&ci<2&&((fsl.n&1)!==ci)){U[ci]=now;AST3D.reused++;return 1;}
    }
    if(ok&&now<AST3D.nx[ci]-8){U[ci]=now;AST3D.reused++;return 1;}   /* -8ms: toleransi jitter rAF */
    AST3D.nx[ci]=now+((ci===1&&AST3D.rd[0]===now)?per*.5:per);
    AST3D.rd[ci]=now;AST3D.rendered++;
    if(ci===1&&ok&&same&&typeof AST._stamp==='number'&&AST._stamp!==now&&now-AST._stamp<120)return 2;   /* depan jatuh tempo, belakang nggak jalan astStep di frame ini */
  }catch(e){}
  return 0;
}
function ast3dStore(ci,sx,sy,sw,sh,dx,dy,dw,dh,n){
  var c=AST3D.cache[ci];
  if(!c){var cv=document.createElement('canvas');c=AST3D.cache[ci]={c:cv,x:cv.getContext('2d'),ver:-1};}
  c.sx=sx;c.sy=sy;c.sw=sw;c.sh=sh;c.dx=dx;c.dy=dy;c.dw=dw;c.dh=dh;c.n=n;c.ver=AST3D.ver;
  return c;
}
function ast3dBlitCache(ci){
  var c=AST3D.cache[ci];
  if(!c)return false;
  if(c.sw>0&&c.sh>0)g.drawImage(c.c,0,0,c.sw,c.sh,c.dx,c.dy,c.dw,c.dh);
  AST_DRAWN+=c.n;
  return true;
}

/* Satu pass: half<0 belakang saja, >0 depan saja, 0 semua. true = pass ditangani (sprite 2D dilewati); false = pakai sprite. */
function ast3dDraw(now,half){
  if(AST3D.state===0){ast3dLoad();return false;}
  if(AST3D.state!==2)return false;
  if(!AST3D_CFG.on||(typeof IS_POTATO!=='undefined'&&IS_POTATO)||(typeof reduce!=='undefined'&&reduce))return false;
  try{
    var ci=half<0?0:(half>0?1:2);
    if(AST3D.ru[ci]===now&&ast3dBlitCache(ci))return true;   /* frame cache: nggak ada GL, nggak ada astStep */
    var vars=AST3D.vars,nv=vars.length,nA=astN(),i,a,v,k,total=0;
    if(!nv)return false;
    if(nA+4>AST3D.cap){   /* jumlah batu bertambah (slider): bangun ulang varian dengan kapasitas baru */
      AST3D.cap=nA+32;
      var bases=vars.map(function(b){return [b.base,b.tier];});
      for(i=0;i<nv;i++){AST3D.sc.remove(vars[i].mesh);vars[i].geo.dispose();}
      vars.length=0;AST3D.tiers=[];
      bases.forEach(function(q){ast3dAddVariant(q[0],q[1]);});
    }
    ast3dResize();
    for(i=0;i<nv;i++)vars[i].n=0;
    var bx0=1e9,by0=1e9,bx1=-1e9,by1=-1e9;   /* bbox layar (px CSS) dari batu yang kegambar: blit cuma area ini */
    for(i=0;i<nA;i++){
      a=AST[i];
      if(!a._vis)continue;
      if(a.ox||a.oy||a.vx||a.vy||a.kick)AST3D.hotF=true;   /* batu lagi terpental (tap): jangan di-cache */
      if(half<0&&!a._back)continue;
      if(half>0&&a._back)continue;
      var hf=a._sz*1.7;
      if(a._x+hf<0||a._x-hf>W||a._y+hf<0||a._y-hf>H)continue;
      if(a._ax===undefined){   /* sumbu putar tetap per batu: sebar merata di bola (golden angle) */
        var th=(i*2.399963)%6.283185,cz=1-2*((i*.618034+.13)%1),sz2=Math.sqrt(Math.max(0,1-cz*cz));
        a._ax=sz2*Math.cos(th);a._ay=sz2*Math.sin(th);a._az=cz;
      }
      v=ast3dPick(a);k=v.n++;
      var al=a._fl?.96:(a._back?.86+.36*a._s:Math.min(1,.9+.1*a._s));
      al*=(a._fa==null?1:a._fa);
      var A=v.A.array,B=v.B.array,o=k*4;
      A[o]=a._x;A[o+1]=H-a._y;A[o+2]=a._sz;A[o+3]=al>1?1:(al<0?0:al);
      B[o]=a._ax;B[o+1]=a._ay;B[o+2]=a._az;B[o+3]=a.rot*2+now*a.rs;
      v.Z.array[k]=a._s*120;
      if(a._x-hf<bx0)bx0=a._x-hf;if(a._x+hf>bx1)bx1=a._x+hf;if(a._y-hf<by0)by0=a._y-hf;if(a._y+hf>by1)by1=a._y+hf;
      total++;
    }
    AST3D.passes++;AST3D.drawn+=total;
    AST_DRAWN+=total;
    if(!total){ast3dStore(ci,0,0,0,0,0,0,0,0,0);return true;}
    var bp=camBH();
    AST3D.uni.uBH.value.set(bp[0],H-bp[1]);
    AST3D.uni.uBack.value=(half<0&&!(AST.length&&AST[0]._fl))?1:0;   /* batu cincin limb (a._fl) tampil seperti batu depan: tanpa tint dingin pass belakang */
    for(i=0;i<nv;i++){
      v=vars[i];
      v.mesh.visible=v.n>0;
      if(!v.n)continue;
      v.geo.instanceCount=v.n;
      v.A.clearUpdateRanges();v.A.addUpdateRange(0,v.n*4);v.A.needsUpdate=true;   /* r159+: updateRange{offset,count} diganti addUpdateRange(start,count) */
      v.B.clearUpdateRanges();v.B.addUpdateRange(0,v.n*4);v.B.needsUpdate=true;
      v.Z.clearUpdateRanges();v.Z.addUpdateRange(0,v.n);v.Z.needsUpdate=true;
    }
    threeGLBegin(AST3D.gl);
    AST3D.r.render(AST3D.sc,AST3D.cam);
    var cvA=AST3D.r.domElement,kx=AST3D.pw/W,ky=AST3D.ph/H,
        rx0=Math.max(0,Math.floor(bx0)-2),ry0=Math.max(0,Math.floor(by0)-2),rx1=Math.min(W,Math.ceil(bx1)+2),ry1=Math.min(H,Math.ceil(by1)+2);
    if(rx1>rx0&&ry1>ry0){
      if(!AST3D_CFG.reuse)g.drawImage(cvA,rx0*kx,ry0*ky,(rx1-rx0)*kx,(ry1-ry0)*ky,rx0,ry0,rx1-rx0,ry1-ry0);   /* sama persis dgn blit penuh: di luar bbox kanvas GL transparan */
      else{
        /* salin bbox (piksel perangkat, bulat, 1:1) ke kanvas cache pass ini, lalu blit dari cache -> hasil sama, dan frame berikut bisa pakai ulang */
        var sx=Math.max(0,Math.floor(rx0*kx)),sy=Math.max(0,Math.floor(ry0*ky)),ex=Math.min(AST3D.pw,Math.ceil(rx1*kx)),ey=Math.min(AST3D.ph,Math.ceil(ry1*ky)),sw=ex-sx,sh=ey-sy;
        if(sw>0&&sh>0){
          var cc=ast3dStore(ci,sx,sy,sw,sh,sx/kx,sy/ky,sw/kx,sh/ky,total);
          if(cc.c.width<sw||cc.c.height<sh){cc.c.width=Math.max(cc.c.width,sw+32);cc.c.height=Math.max(cc.c.height,sh+32);}   /* cuma membesar (set width = kosongkan + realokasi) */
          else cc.x.clearRect(0,0,cc.c.width,cc.c.height);
          cc.x.drawImage(cvA,sx,sy,sw,sh,0,0,sw,sh);
          g.drawImage(cc.c,0,0,sw,sh,cc.dx,cc.dy,cc.dw,cc.dh);
        }else ast3dStore(ci,0,0,0,0,0,0,0,0,0);
      }
    }else ast3dStore(ci,0,0,0,0,0,0,0,0,0);
    return true;
  }catch(e){
    ast3dFail(e&&e.message||e);
    return false;
  }
}
/* ---- Kepala komet Konami (dipanggil cometHeadsFlush di 06-interaction.js) ----
   Dua batu 3D berapi (bentuk dari ast3dRockGeo, seed lain dari batu sabuk), satu mesh per kepala (k=0 biru/induk, k=1 merah/serpihan).
   Memakai renderer GL 'big' + kamera ortho AST3D, scene SENDIRI (AST3D.sc tidak tersentuh, cache batu sabuk aman). Bagian depan (arah gerak) + tepi menyala
   warna kepala, sisi belakang tetap batu gelap berkawah. Dirender langsung (tanpa cache) karena cuma 2 objek + hanya ~5 dtk setelah Konami.
   Gagal / belum siap -> return false: pemanggil menggambar bulatan putih 2D seperti dulu. Satu kali gagal = berhenti mencoba (D.bad). */
var AST3D_HD={built:false,bad:false,sc:null,mat:null,m:[]};
function ast3dHeadsBuild(){
  var D=AST3D_HD,T,i,geo,ig,v;
  if(D.built)return true;
  if(D.bad||AST3D.state!==2||typeof THREE==='undefined')return false;
  T=THREE;
  D.sc=new T.Scene();
  D.mat=new T.ShaderMaterial({
    transparent:true,depthTest:true,depthWrite:true,
    blending:T.CustomBlending,blendEquation:T.AddEquation,blendSrc:T.OneFactor,blendDst:T.OneMinusSrcAlphaFactor,
    vertexShader:[
      'attribute vec4 iA;attribute vec4 iB;attribute vec4 iC;attribute vec2 iD;',   /* iA x,y,ukuran,alpha | iB sumbu putar xyz,sudut | iC warna panas rgb,denyut | iD arah gerak (y ke atas) */
      'varying vec3 vN;varying vec3 vHot;varying vec2 vD;varying float vA;varying float vP;',
      'vec3 rot(vec3 v,vec3 k,float a){float c=cos(a),s=sin(a);return v*c+cross(k,v)*s+k*dot(k,v)*(1.-c);}',
      'void main(){',
      '  vec3 p=rot(position,iB.xyz,iB.w);',
      '  vN=rot(normal,iB.xyz,iB.w);',
      '  vHot=iC.rgb;vP=iC.w;vD=iD;vA=iA.w;',
      '  gl_Position=projectionMatrix*vec4(vec3(iA.xy,0.)+p*iA.z,1.);',
      '}'
    ].join('\n'),
    fragmentShader:[
      'varying vec3 vN;varying vec3 vHot;varying vec2 vD;varying float vA;varying float vP;',
      'void main(){',
      '  vec3 n=normalize(vN);',
      '  float fr=max(dot(n,normalize(vec3(vD,.45))),0.);',   /* menghadap arah gerak = paling panas (gesekan) */
      '  float rim=pow(1.-max(n.z,0.),2.2);',
      '  float back=max(dot(n,normalize(vec3(-vD,.7))),0.);',
      '  vec3 col=vec3(.17,.135,.12)*(.3+.7*back);',   /* badan batu gelap, sedikit terang dari ekor */
      '  col+=vHot*(pow(fr,1.3)*1.5+rim*.9)*vP;',
      '  col=mix(col,vec3(1.,.95,.88),pow(fr,5.)*.55*vP);',   /* inti depan memutih */
      '  gl_FragColor=vec4(col*vA,vA);',
      '}'
    ].join('\n')
  });
  for(i=0;i<2;i++){
    geo=ast3dRockGeo(41+i*13,3);
    ig=new T.InstancedBufferGeometry();
    ig.index=geo.index;
    ig.setAttribute('position',geo.attributes.position);
    ig.setAttribute('normal',geo.attributes.normal);
    v={A:new T.InstancedBufferAttribute(new Float32Array(4),4).setUsage(T.DynamicDrawUsage),
       B:new T.InstancedBufferAttribute(new Float32Array(4),4).setUsage(T.DynamicDrawUsage),
       C:new T.InstancedBufferAttribute(new Float32Array(4),4).setUsage(T.DynamicDrawUsage),
       D:new T.InstancedBufferAttribute(new Float32Array(2),2).setUsage(T.DynamicDrawUsage)};
    ig.setAttribute('iA',v.A);ig.setAttribute('iB',v.B);ig.setAttribute('iC',v.C);ig.setAttribute('iD',v.D);
    ig.instanceCount=0;
    v.geo=ig;v.mesh=new T.Mesh(ig,D.mat);v.mesh.frustumCulled=false;v.mesh.visible=false;
    D.sc.add(v.mesh);D.m.push(v);
  }
  D.built=true;return true;
}
/* Dipanggil triggerKonami: bangun scene + compile shader sekarang (komet baru muncul ~2,6 dtk kemudian), supaya tidak ada hitch di frame kepala pertama. */
function ast3dHeadsPrep(){
  if(!AST3D_CFG.on||AST3D.state!==2||AST3D_HD.bad)return;
  if((typeof IS_POTATO!=='undefined'&&IS_POTATO)||(typeof reduce!=='undefined'&&reduce))return;
  setTimeout(function(){
    try{
      if(!ast3dHeadsBuild())return;
      var r=AST3D.r,D=AST3D_HD;
      if(r.compileAsync)r.compileAsync(D.sc,AST3D.cam).catch(function(){});else r.compile(D.sc,AST3D.cam);
    }catch(e){AST3D_HD.bad=true;}
  },250);
}
var AST3D_HCOL=[[.45,.9,1],[1,.42,.25]];   /* warna panas: biru-cyan (induk) / oranye-merah (serpihan) */
function ast3dHeads(list,now){
  var D=AST3D_HD,i,h,v,n=0,bx0=1e9,by0=1e9,bx1=-1e9,by1=-1e9,hf,sz,th,cz,sz2,sp,A,B,C,Dd,col;
  if(D.bad||!AST3D_CFG.on||AST3D.state!==2)return false;
  if((typeof IS_POTATO!=='undefined'&&IS_POTATO)||(typeof reduce!=='undefined'&&reduce))return false;
  try{
    if(!ast3dHeadsBuild())return false;
    ast3dResize();
    for(i=0;i<D.m.length;i++){D.m[i].mesh.visible=false;D.m[i].geo.instanceCount=0;}
    for(i=0;i<list.length;i++){
      h=list[i];v=D.m[h.k];if(!v)continue;
      sz=h.r*1.65;hf=sz*1.3;
      if(h.x+hf<0||h.x-hf>W||h.y+hf<0||h.y-hf>H)continue;
      th=h.seed*6.283185+h.k*2.1;cz=Math.cos(th*1.7);sz2=Math.sqrt(Math.max(0,1-cz*cz));
      sp=Math.hypot(h.vx,h.vy)||1;col=AST3D_HCOL[h.k]||AST3D_HCOL[0];
      A=v.A.array;B=v.B.array;C=v.C.array;Dd=v.D.array;
      A[0]=h.x;A[1]=H-h.y;A[2]=sz;A[3]=h.a>1?1:(h.a<0?0:h.a);
      B[0]=sz2*Math.cos(th);B[1]=sz2*Math.sin(th);B[2]=cz;B[3]=now*.0042*(h.k?-1:1)+th;
      C[0]=col[0];C[1]=col[1];C[2]=col[2];C[3]=h.pulse;
      Dd[0]=h.vx/sp;Dd[1]=-h.vy/sp;
      v.A.needsUpdate=true;v.B.needsUpdate=true;v.C.needsUpdate=true;v.D.needsUpdate=true;
      v.geo.instanceCount=1;v.mesh.visible=true;n++;
      if(h.x-hf<bx0)bx0=h.x-hf;if(h.x+hf>bx1)bx1=h.x+hf;if(h.y-hf<by0)by0=h.y-hf;if(h.y+hf>by1)by1=h.y+hf;
    }
    if(!n)return true;   /* kepala di luar layar: tidak ada yang digambar, tapi 3D "siap" (bukan fallback) */
    threeGLBegin(AST3D.gl);
    AST3D.r.render(D.sc,AST3D.cam);
    var cvA=AST3D.r.domElement,kx=AST3D.pw/W,ky=AST3D.ph/H,
        rx0=Math.max(0,Math.floor(bx0)-2),ry0=Math.max(0,Math.floor(by0)-2),rx1=Math.min(W,Math.ceil(bx1)+2),ry1=Math.min(H,Math.ceil(by1)+2);
    if(rx1>rx0&&ry1>ry0)g.drawImage(cvA,rx0*kx,ry0*ky,(rx1-rx0)*kx,(ry1-ry0)*ky,rx0,ry0,rx1-rx0,ry1-ry0);   /* sama dgn blit non-cache ast3dDraw */
    return true;
  }catch(e){D.bad=true;try{console.warn('[ast3d] kepala komet gagal, pakai bulatan 2D:',e&&e.message||e);}catch(e2){}return false;}
}
try{ast3dLoad();}catch(eA3L){}   /* mulai muat + warm-up lebih awal (layar boot), bukan menunggu batu pertama digambar */
