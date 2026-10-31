'use strict';
/* ===== 09-wormhole.js — wormhole transisi (lompat antar sektor + sektor -> overview) + muffle audio =====
   F11b: mesin hold (holdStart/Arm/Move/Commit/Cancel, state charge/armed/held), hole() di bawah sky, dan tarikan pull()/HPV dibuang (tidak ada pemanggil sejak portal sektor pensiun).
   v5: fix cover() ganda (NaN), frame error aman.
   v4: terowongan "warp" biru-ungu-magenta dengan kilau hangat di tepi lubang, streak bintang melesat radial + berputar pelan
   (referensi: foto wormhole berkilau). Canvas 2D biasa: tanpa WebGL, tanpa shader, tanpa tekstur eksternal.
   Cara kerjanya (ringan): 2 buffer kecil (setengah resolusi layar) dipakai ping-pong sebagai "feedback zoom" — tiap frame isi buffer
   sebelumnya digambar lagi sedikit lebih besar + diputar sedikit + diredupkan, lalu disuntik titik bintang & blob warna dinding
   di dekat lubang. Zoom itulah yang bikin ekor streak/blur radial otomatis (panjang ekor ~ jarak dari pusat = perspektif), jadi
   nggak perlu gambar ratusan glyph/garis. Di atasnya digambar ~110 streak bintang tajam (garis pendek) + lubang hitam + vignette.
   Biaya per frame: 1 drawImage kecil (feedback) + ~120 sprite + 1 drawImage ke layar + ~110 garis.

   Titik sambung (semua lewat window.WORMHOLE, selalu dibungkus try/catch + cek keberadaan) — TIDAK BERUBAH dari v3:
     - 05-sector-ui.js  sectJumpTo()     -> WORMHOLE.gate(s,pos,R,cb)       lompat antar sektor / overview -> sektor (pos = teleskop atau tengah layar, wormAnchor())
     - 05-sector-ui.js  sectWormholeOut()-> WORMHOLE.overview(pos,R,cb)     sektor -> overview; jadwal & durasi SAMA dengan gate(), tanpa swallow
     - (swallow BH overview dihapus di F5; masuk dumul.html lewat beltEnter di 04-render.js, tanpa WORMHOLE)
     - 01-core.js       spatialTarget()  -> WORMHOLE.muffle()               redam audio selama di dalam wormhole
   Efek mati sendiri (no-op) kalau prefers-reduced-motion atau canvas 2D tidak ada. */
(function(){
/* ---------- setelan (ubah di sini) ---------- */
var STAR_PAL=[[255,255,255],[175,205,255],[150,125,255],[255,125,205],[255,175,95],[95,225,255],[255,238,170]];  /* warna bintang (dominan putih/biru, sisanya "pelangi" kecil) */
var NEB_PAL=[[70,95,255],[150,65,240],[255,75,175],[255,125,70],[90,190,255]];   /* warna dinding terowongan; dipilih menurut sudut -> lengan spiral berwarna */
var N_STARS=380, N_STARS_LOW=110;   /* jumlah streak bintang tajam (potato lebih sedikit) */
/* Layer kedalaman (urutan jauh -> dekat): kecepatan, alpha, ketebalan, porsi jumlah */
var LAYERS=[{sp:.6,al:.5,sz:.6,cnt:.50},{sp:1.3,al:.8,sz:1.1,cnt:.32},{sp:2.2,al:1,sz:1.7,cnt:.18}];
var SPEED=2;          /* pengali kecepatan bintang (0.6 = lebih santai) */
var ZOOM=4.0;         /* kecepatan zoom buffer (e-fold/detik) = seberapa kencang terowongan "melesat" */
var SPIN=.20;         /* kecepatan putar terowongan (rad/detik); 0 = lurus tanpa swirl */
var DECAY=.955;       /* sisa terang buffer per frame @60fps. makin besar = ekor streak makin panjang */
var NEB_RATE=60;      /* blob warna dinding per detik. makin banyak = dinding makin pekat/terang */
var NEB_A=.09;        /* terang tiap blob dinding */
var DUST_RATE=2200;   /* debu/streak halus per detik yang disuntik ke buffer -> jadi ribuan garis radial tipis (murah: cuma sprite kecil)*/
var DUST_A=.55;       /* terang tiap debu */
var GLOW_A=.32;       /* terang kilau hangat di tepi lubang (0 = matikan) */
var EDGE_SOLID=.5;    /* mulut portal mini: bagian tengah (x radius) yang tetap pekat; sisanya meluruh halus jadi transparan ke arah tepi (makin kecil = tepi makin lembut) */
var RIM_GLOW=.09;     /* kilau tipis di luar mulut portal mini (0 = tanpa kilau). Pengganti garis cincin cyan yang dulu */
/* Transisi sektor -> overview DAN lompat antar sektor memakai satu jadwal yang sama (go()), jadi durasinya identik:
     0 .. T_OPEN      dinding terowongan tumbuh dari tengah lubang hitam sampai memenuhi layar
     0 .. T_MOVE      lubang hitam terowongan bergeser dari posisi BH mini ke tengah layar (kesan masuk terowongan)
     T_SEEK..T_TRAVEL lubang hitam meluncur dari tengah layar ke tujuan: BH overview (ke overview) / BH mini sektor tujuan (lompat)
     T_TRAVEL..+T_EXIT dinding memudar dari pinggir layar ke tengah (menyusut ke mulut portal tujuan, miring mengikuti cincin), lubang hitam yang pekat memudar jadi transparan
   Total = T_TRAVEL + T_EXIT. Underlying sektor (zoom-out, dan zoom-in untuk lompat) jalan di bawah terowongan; T_TRAVEL cukup panjang untuk keduanya. */
/* Durasi lompatan (ms). T_DWELL = lama di dalam terowongan murni (bintang, teleskop melayang+miring), T_SEEKM = lubang hitam meluncur ke tujuan.
   Total dari lepas tahan = T_ENTER_TELE + T_OPEN + T_DWELL + T_SEEKM (+550 kalau lompat antar sektor) + T_EXIT. Kecilkan T_DWELL kalau kepanjangan. */
var T_OPEN=2300, T_DWELL=2600, T_SEEKM=2200;
var T_TRAVEL=T_OPEN+T_DWELL+T_SEEKM, T_TRAVEL_GATE=T_TRAVEL+1550, T_EXIT=2400, T_SEEK=2300;   /* lompat sektor lebih panjang: sektor asal zoom-out + sektor tujuan zoom-in jalan SETELAH layar tertutup */
function TT(){return S&&S.dest&&!S.fromOv?T_TRAVEL_GATE:T_TRAVEL;}   /* fromOv: overview -> sektor cuma satu zoom-in (tanpa zoom-out sektor asal), jadi jadwalnya = sektor -> overview */
function TS(){return TT()-T_SEEKM;}
/* Kemiringan teleskop di dalam terowongan (badan 3D; 2D cadangan cuma ikut roll). lean = condong ke arah lubang (keluar: condong ke depan), bank = miring ikut gerak melayang,
   buffet = getar halus saat ngebut. sx/sy/sz = arah sumbu (balik ke -1 kalau kemiringannya terasa terbalik). on:0 = mati. */
var TELE_TILT={on:1,lean:.5,bank:.9,buffet:.035,sx:1,sy:1,sz:1,exitDir:1,exitVel:.5};   /* exitDir: 1 = pose keluar sama seperti di terowongan (tidak berbalik), -1 = condong menjauhi lubang; exitVel: pengali bank/pitch dari kecepatan saat keluar */
/* POV "kamera di belakang pesawat" selama di terowongan (hanya badan 3D; badan 2D cadangan tetap pakai spin lama).
   yaw  : 1.5708 = tepat membelakangi (hidung lurus ke dalam layar); dikecilkan (1.1-1.2) supaya sisi badan + kokpit masih kelihatan = terasa 2.5D, bukan datar
   roll : 1.5708 = kokpit di atas (sayap/pod kiri-kanan), 0 = kokpit di samping
   pitch: condong tambahan (rad), + = makin mengintip dari atas
   th   : kekuatan api mesin saat POV belakang (1 = penuh); glow: pelebar kilau hijau mesin (0 = tanpa tambahan)
   exitFace: pose waktu keluar portal tujuan. -1 = muncul menghadap kamera (hidung ke arah kita, api hijau masuk ke lubang) lalu belok ke pose istirahat;
             +1 = tetap membelakangi seperti di terowongan lalu belok. exitMs: porsi pose dipertahankan sebelum mulai belok (0..1 dari pu) */
var TELE_CHASE={on:1,yaw:1.12,roll:1.5708,pitch:0,th:1,glow:.7,exitFace:-1,exitHold:.18};
var T_MOVE=2100, T_FADE=1420, T_CLOSE=1900;   /* T_OPEN = cincin + dinding terowongan membesar (zoom-in ke portal) sampai menutup layar */
var T_ENTER_TELE=1950;
var T_TELE_OVERLAP=1600;   /* ms: zoom-in ke portal mulai SEBELUM teleskop selesai terbang masuk (0 = berurutan seperti dulu; harus < T_ENTER_TELE, otomatis dibatasi 80%) */   /* durasi teleskop terbang masuk ke tengah cincin sebelum zoom-in dimulai */   /* durasi buka portal / geser ke tengah / fade-in / tutup (batal / pengaman) */

var ZN=.05, BG='#02050d', WARM=16;
var cv=null,g=null,spr=null,SC=48,dpr=1,RGB=[],NP=STAR_PAL.length,NN=NEB_PAL.length,
    ST=[],inited=false,ok=true,raf=0,last=0,state='idle',S={},env=0,ema=.016,dens=1,roll=0,tt=0,
    W=0,H=0,bw=0,bh=0,bq=.5,bA=null,bB=null,gA=null,gB=null,nebAcc=0,dustAcc=0;
var reduceMq=window.matchMedia?matchMedia('(prefers-reduced-motion: reduce)'):null;
function potato(){return typeof IS_POTATO!=='undefined'&&IS_POTATO;}
function usable(){return ok&&!(reduceMq&&reduceMq.matches);}
function clamp(v,a,b){return v<a?a:(v>b?b:v);}
function lerp(a,b,t){return a+(b-a)*t;}
function sm(t){t=clamp(t,0,1);return t*t*(3-2*t);}
function eo(t){t=clamp(t,0,1);return 1-Math.pow(1-t,3);}
function winW(){return window.innerWidth||document.documentElement.clientWidth;}
function winH(){return window.innerHeight||document.documentElement.clientHeight;}
function cover(){return Math.hypot(winW(),winH())*1.08;}
/* Koordinat dari camBH()/pointer ada di ruang VIRTUAL stage (landscape HP: stage diputar 90°; desktop/tablet: portrait di-letterbox),
   sedangkan canvas ini menggambar di koordinat LAYAR asli. v2c() (01-core.js) menyamakan keduanya; portrait = identitas. */
function toScr(x,y){
  try{if(typeof v2c==='function'&&typeof STG!=='undefined'&&STG.on){var c=v2c(x,y);if(c&&isFinite(c[0])&&isFinite(c[1]))return c;}}catch(e){}
  return [x,y];
}

/* ---------- sprite titik lembut (di-bake sekali: satu baris per warna bintang + warna dinding) ---------- */
function buildSprites(){
  var all=STAR_PAL.concat(NEB_PAL),c=document.createElement('canvas'),x,i,col,gr,cy;
  SC=potato()?32:48;
  c.width=SC;c.height=all.length*SC;
  x=c.getContext('2d');
  for(i=0;i<all.length;i++){
    col=all[i];cy=i*SC+SC/2;
    gr=x.createRadialGradient(SC/2,cy,0,SC/2,cy,SC/2);
    gr.addColorStop(0,'rgba('+col+',1)');gr.addColorStop(.28,'rgba('+col+',.5)');gr.addColorStop(1,'rgba('+col+',0)');
    x.fillStyle=gr;x.fillRect(0,i*SC,SC,SC);
  }
  spr=c;
}
function spawn(c,isFresh){   /* isFresh=true: langsung muncul (isi awal); false: fade-in singkat */
  var L=LAYERS[c.L];
  c.th=Math.random()*6.283185307;
  /* posisi kepala seragam terhadap RADIUS: tepi layar ikut terisi sejak frame pertama */
  c.z=ZN/(.08+.9*Math.random());c.age=isFresh?1:0;
  c.v=(.9+Math.random()*1.0)*L.sp*SPEED;
  c.ci=Math.random()<.55?((Math.random()*2)|0):((Math.random()*NP)|0);   /* dominan putih/biru-putih */
  c.al=(.6+Math.random()*.4)*L.al;
  c.lf=.8+Math.random()*.5;   /* pengali panjang streak */
}
function build(){
  var n=potato()?N_STARS_LOW:N_STARS,i,li,k,c;
  ST.length=0;
  for(li=0;li<LAYERS.length;li++){
    k=Math.round(n*LAYERS[li].cnt);
    for(i=0;i<k;i++){c={L:li,r:Math.random()};spawn(c,true);ST.push(c);}   /* urut jauh -> dekat: yang dekat digambar terakhir */
  }
  RGB=STAR_PAL.map(function(p){return 'rgb('+p[0]+','+p[1]+','+p[2]+')';});
}
function mkBuf(){var c=document.createElement('canvas');c.width=bw;c.height=bh;return c;}
function clearBufs(){
  [gA,gB].forEach(function(x){if(!x)return;x.setTransform(1,0,0,1,0,0);x.globalCompositeOperation='source-over';x.globalAlpha=1;x.fillStyle=BG;x.fillRect(0,0,bw,bh);});
}
function resize(){
  if(!cv)return;
  var nw,nh;
  W=winW();H=winH();
  dpr=Math.min(window.devicePixelRatio||1,potato()?1:(WH_DPR||2));
  cv.width=Math.max(64,Math.round(W*dpr));cv.height=Math.max(64,Math.round(H*dpr));
  bq=potato()?.3:.5;
  nw=Math.max(32,Math.round(W*bq));nh=Math.max(32,Math.round(H*bq));
  if(!bA||nw!==bw||nh!==bh){
    bw=nw;bh=nh;bA=mkBuf();bB=mkBuf();gA=bA.getContext('2d');gB=bB.getContext('2d');
  }
  clearBufs();
}
function init(){
  if(inited||!usable())return inited&&ok;
  try{
    cv=document.createElement('canvas');cv.id='wh-canvas';cv.setAttribute('aria-hidden','true');
    cv.style.cssText='position:fixed;left:0;top:0;width:100%;height:100%;display:none;pointer-events:none;z-index:13;touch-action:none';
    g=cv.getContext('2d',{alpha:true});
    if(!g)throw new Error('no 2d');
    document.body.appendChild(cv);
    buildSprites();build();
    inited=true;
  }catch(err){
    ok=false;inited=false;
    try{if(cv&&cv.parentNode)cv.parentNode.removeChild(cv);}catch(e2){}
    cv=null;g=null;
    try{console.warn('[wormhole] dimatikan:',err&&err.message);}catch(e3){}
  }
  return inited&&ok;
}

/* ---------- state machine ----------
   idle -> enter (teleskop terbang masuk cincin) -> travel (zoom-in ke portal, terowongan, lubang hitam meluncur) -> exit -> idle   (go(): sektor->overview, lompat antar sektor, overview->sektor)
   close = penutup darurat (pengaman macet). */
function show(){if(cv&&cv.style.display!=='block'){resize();cv.style.display='block';}}
/* KAMERA zoom-in ke portal: canvas #sky di-scale (CSS) di sekitar titik cincin sambil digeser ke tengah layar, jadi langit + cincin ikut mendekat (bukan cincin yang membesar di atas langit diam).
   Koordinat lokal #sky = ruang virtual stage, jadi benar di portrait / landscape / ROT. Terowongan di kanvas ini mengikuti titik + skala yang sama. */
/* SKY_ZOOM: true (default) = kamera zoom CSS pada #sky. ?whzoom=0 di URL = tanpa zoom (mulut portal membesar di atas sky diam, jalur lama ck=null) untuk A/B di device. Di headless tanpa-zoom tidak lebih ringan: biaya utama adalah isi sky yang dirender, bukan scale-nya. */
var SKY_ZOOM=(function(){try{return !/[?&]whzoom=0/.test(location.search);}catch(e){return true;}})();
function skyCam(uu,ee){
  var sk=document.getElementById('sky'),Wv,Hv,m,tx,ty,k;
  if(!sk||S.vx==null)return null;
  Wv=sk.clientWidth||winW();Hv=sk.clientHeight||winH();m=sm(uu);k=Math.exp(S.lnK*ee);
  tx=(Wv*.5-S.vx)*m;ty=(Hv*.5-S.vy)*m;
  sk.style.willChange='transform,opacity';if(WH_DBG.indexOf('nosky')>=0)sk.style.visibility='hidden';sk.style.transformOrigin=S.vx+'px '+S.vy+'px';
  sk.style.transform='translate('+tx.toFixed(2)+'px,'+ty.toFixed(2)+'px) scale('+k.toFixed(4)+')';
  sk.style.opacity=(1-.92*sm((ee-.5)/.5)).toFixed(3);   /* langit meredup menjelang tertutup terowongan (membesar jadi buram) */
  S.skyOn=1;
  return toScr(S.vx+tx,S.vy+ty);
}
/* serah-terima cincin #sky -> kanvas ini, 0..1. Overview: cincin sky langsung disembunyikan (portal3dOverview) -> 1 seketika. Sektor: yang tampak di #sky adalah BH mini (ikut
   di-scale skyCam, glow/disk-nya jauh lebih besar dari cincin) -> dulu terlihat PORTAL GANDA (BH membesar + cincin). Sekarang cincin fade-in & BH fade-out (WH_HANDOFF ms), lalu 03 menyembunyikan BH. */
var WH_HANDOFF=260;
/* diagnosa cincin ganda (URL ?whdbg=noring,nosky): noring = cincin di kanvas wormhole TIDAK digambar; nosky = #sky disembunyikan selama zoom-in. Bandingkan mana yang membuat cincin kedua hilang. */
var WH_DBG=(function(){try{var m=/[?&]whdbg=([a-z,]+)/.exec(location.search);return m?m[1]:'';}catch(e){return '';}})();
/* A/B diagnosa performa (hanya via URL, tanpa URL = perilaku normal). ?whdpr=1.25 = batas dpr kanvas wormhole (default 2). Flag whdbg tambahan:
   notele = teleskop tidak digambar; nostep = buffer terowongan tidak di-update (komposit tetap jalan); nobloom = lewati drawImage bloom kedua. */
/* v15: ?whring=N = cincin GL dirender tiap N frame (default 4; 0/1 = tiap frame). Hasil di-cache ke kanvas 2D dan digambar ulang dgn skala terkini tiap frame. (whdbg cuma menerima huruf, jadi pakai param sendiri) */
var WH_RING=(function(){try{var m=/[?&]whring=([0-9]+)/.exec(location.search),v=m?parseInt(m[1],10):4;return v>1?v:0;}catch(e){return 4;}})();
/* v18->v19 (sekarang default AKTIF, hasil ukur HP: step 4.6->3.0ms, comp 4.1->2.7ms, js zoom 31->26, tak kentara di mata): ?whstep=2 = selama ZOOM (sebelum layar tertutup) buffer terowongan di-update tiap 2 frame dgn dt/adv terakumulasi (hemat ~2-3ms JS/frame);
   ?whbloom=0 = lewati pass bloom aditif selama mulut portal masih lebih kecil dari layar (zoom). Keduanya mengubah tampilan terowongan sedikit. */
var WH_STEP=(function(){try{var m=/[?&]whstep=([0-9]+)/.exec(location.search),v=m?parseInt(m[1],10):2;return v>1?v:0;}catch(e){return 2;}})();   /* v19: DEFAULT ON (2). ?whstep=0 = mati */
var WH_NOBLOOM=(function(){try{return !/[?&]whbloom=1/.test(location.search);}catch(e){return true;}})();   /* v19: DEFAULT ON (bloom dilewati saat zoom). ?whbloom=1 = bloom normal */
var WH_DPR=(function(){try{var m=/[?&]whdpr=([0-9.]+)/.exec(location.search),v=m?parseFloat(m[1]):0;return v>=.5&&v<=3?v:0;}catch(e){return 0;}})();
function ringFade(){
  if(state!=='travel'||!S||!S.ring)return 0;
  if(typeof SECT==='undefined'||!SECT.cur||WH_HANDOFF<=0)return 1;
  return sm(clamp((performance.now()-S.tt)/WH_HANDOFF));
}
/* Pre-warm renderer cincin 3D ke resMax. Hanya bila renderer siap (state 2; potato/reduce/gagal-load dilewati) dan PT3D.res baru diset SETELAH setSize sukses
   (kalau setSize melempar, pt3dRender masih tahu ukuran sebenarnya dan menyesuaikan sendiri). */
function whPrewarm(){
  try{
    if(typeof pt3dWarmMax==='function'){pt3dWarmMax();return;}   /* 15-portal3d.js: setSize(resMax) + 1 render, idempotent */
    if(typeof PT3D!=='undefined'&&PT3D.r&&PT3D.state===2&&typeof PT3D_CFG!=='undefined'){
      var rmax=PT3D_CFG.resMax;PT3D.big=1;
      if(PT3D.res!==rmax){PT3D.r.setPixelRatio(1);PT3D.r.setSize(rmax,rmax,false);PT3D.res=rmax;}
    }
  }catch(ePw){}
}
function skyReset(){
  try{
    var sk=document.getElementById('sky');
    if(sk&&S&&S.skyOn){sk.style.transform='';sk.style.transformOrigin='';sk.style.opacity='';sk.style.willChange='';sk.style.visibility='';}
    if(S)S.skyOn=0;
  }catch(e){}
}
function warpFx(k){try{if(typeof UIS!=='undefined'&&UIS.warpFx)UIS.warpFx(k);}catch(e){}}   /* SFX terowongan (10-ui-sound.js), selalu aman kalau modul suara tidak ada */
function hide(){
  warpFx('stop');skyReset();
  try{if(typeof TELESCOPE!=='undefined')TELESCOPE.dive=0;}catch(eD){}
  try{if(S){S.freshLeft=0;S.freshR=0;}}catch(eF){}
  if(cv){cv.style.display='none';cv.style.opacity='1';cv.style.zIndex='13';}
}
function runCover(){skyReset();if(S&&S.onCover){var f=S.onCover;S.onCover=null;try{f();}catch(eC){}}}
/* ---- recorder FPS on-device: aktif HANYA kalau URL pakai ?whperf=1 (tanpa itu = nol biaya). Setelah transisi selesai muncul panel kecil; tap panel untuk menutup. ---- */
var WP=(function(){try{return /[?&]whperf=1/.test(location.search)?{r:[],t:0,ph:''}:null;}catch(e){return null;}})();
/* v12d: atribusi frame macet lewat Long Animation Frames (Chromium 123+; fallback longtask). Per frame >150ms: durasi total, script (JS), render (style/layout/paint/commit di main thread), sisa (GC/idle/menunggu).
   Kalau durasi frame LoAF kecil padahal interval whperf besar -> main thread bebas, yang menahan GPU/compositor/proses lain. */
if(WP){try{
  WP.lf={};WP.pt=[];WP.lfSup='none';
  var _ty=(window.PerformanceObserver&&PerformanceObserver.supportedEntryTypes)||[];
  var _tn=_ty.indexOf('long-animation-frame')>=0?'long-animation-frame':(_ty.indexOf('longtask')>=0?'longtask':'');
  if(_tn){
    WP.lfSup=_tn==='longtask'?'longtask':'LoAF';
    new PerformanceObserver(function(l){l.getEntries().forEach(function(e){
      if(e.duration<150)return;
      var sc=0,fl=0,src='',i,S=e.scripts||[],bn=0,pp=null,pt=WP.pt||[],end=e.startTime+e.duration;
      for(i=pt.length-1;i>=0;i--)if(pt[i][0]<=e.startTime+1){pp=pt[i];break;}
      if(!pp||(pp[1]!=='zoom'&&pp[1]!=='tunnel'&&pp[1]!=='exit'))return;   /* hanya selama dive; boot/idle diabaikan */
      for(i=0;i<S.length;i++){sc+=S[i].duration||0;fl+=S[i].forcedStyleAndLayoutDuration||0;if((S[i].duration||0)>bn){bn=S[i].duration;src=String(S[i].sourceURL||'').split('/').pop().split('?')[0]+':'+(S[i].sourceFunctionName||S[i].invoker||'?');}}
      /* renderStart / styleAndLayoutStart = timestamp absolut (bukan offset frame): waktu = akhir frame - timestamp itu */
      var rn=e.renderStart>0?Math.max(0,end-e.renderStart):0,sl=e.styleAndLayoutStart>0?Math.max(0,end-e.styleAndLayoutStart):0;
      var L=WP.lf[pp[1]]||(WP.lf[pp[1]]=[]);
      L.push({o:e.startTime-pp[0],d:e.duration,sc:sc,rn:rn,sl:sl,fl:fl,bd:e.blockingDuration||0,src:src});
      L.sort(function(x,y){return y.d-x.d;});if(L.length>3)L.length=3;
    });}).observe({type:_tn,buffered:false});
  }
}catch(eLF){}}
/* v8: js = (now -> akhir tick) SUDAH TERMASUK frame() sky (05-sector-ui.js) yang jalan di rAF yang sama SEBELUM tick ini. WSK = ms yang dipakai frame() sky di rAF ini, jadi js-sky = biaya tick wormhole sendiri. */
var WSK=0;
/* v12f: LoAF menunjukkan stall tunnel = script ~420ms di callback anonim 09-wormhole.js = pembungkus window.frame (sky frame() dari 05-sector-ui.js), BUKAN tick. 'sky max 3xx-6xx' di panel selama ini memang itu.
   Di sini tiap fungsi gambar/logika yang dipanggil frame() dibungkus (hanya ?whperf=1) supaya frame sky >150ms dirinci per fungsi. */
var WFB=[];
if(WP){try{var _wf0=window.frame;if(typeof _wf0==='function'){
  var _wn=['drawStars','drawCons','drawSectorOverview','drawAsteroids','drawHud','planet3dDraw','mwDraw','sectDrawSky','drawPortals','drawPleiades','drawTxLines','drawTxTop','drawTriggerVisuals','drawFloatingTelescope','drawFloatingTelescopeTop','drawBeltFx','drawBHShockwaves','drawHoleSafe','drawFocusFx','drawPulses','drawShooting','drawSupernovaBursts','drawTargetLock','drawSectFlash','sectStep','syncSkyPanHits','plateBlit','bandDimDraw','updateHover','fsTick','updateConstellationFocus','focusStep','sectorScanUpdate','ensureCamGrid','updateAudioViz','updateTimeDilation','updateClockDilation','placeSecretMsg','planetBhClamp','bhScaleStep','teleGreetFollow','startRenderLoop','drawSectorOverview'],_wa={},_wi;
  _wn.forEach(function(nm){var f=window[nm];if(typeof f!=='function'||f.__wp)return;var w=function(){var t=performance.now();try{return f.apply(this,arguments);}finally{_wa[nm]=(_wa[nm]||0)+performance.now()-t;}};w.__wp=1;window[nm]=w;});
  window.frame=function(n){var t=performance.now(),r,k;for(k in _wa)_wa[k]=0;try{r=_wf0.apply(this,arguments);}finally{
    var d=performance.now()-t;WSK+=d;
    if(d>150&&WP.pt){var pp=null,i,pt=WP.pt;for(i=pt.length-1;i>=0;i--)if(pt[i][0]<=t+1){pp=pt[i];break;}
      var bk=[];for(k in _wa)if(_wa[k]>8)bk.push([k,_wa[k]]);bk.sort(function(a,b){return b[1]-a[1];});
      WFB.push({ph:pp?pp[1]:'?',o:pp?t-pp[0]:0,d:d,bk:bk.slice(0,5)});WFB.sort(function(a,b){return b.d-a.d;});if(WFB.length>4)WFB.length=4;}
  }return r;};
}}catch(eWk){}}
/* v9: pecah biaya tick per bagian drawFrame (hanya ?whperf=1). Nama: pre=sebelum drawFrame (skyCam/seek/warpUpd), step=stepBuf, comp=isi+bloom, streak, vig=vinyet+exit mask, ring=portal3dDraw, tele=kilat+teleskop. */
function wpM(n){
  var t=performance.now(),ph=state==='travel'?(S.cov?'tunnel':'zoom'):state,o=WP.s||(WP.s={}),p=o[ph]||(o[ph]={}),c=p[n]||(p[n]=[0,0]);
  c[0]+=t-WP.l;c[1]++;WP.l=t;
}
function wpRec(now,ph,q,js,sky,lead){   /* js = ms dari awal vsync (now) sampai akhir tick ini = CPU/JS main-thread; interval >> js berarti GPU/raster/compositor yang menahan */
  if(ph==='enter'&&WP.ph!=='enter'){WP.r=[];WP.t=0;WP.s={};}
  if(WP.pt&&WP.ph!==ph){WP.pt.push([now,ph]);if(WP.pt.length>400)WP.pt.splice(0,200);}   /* v12e: riwayat transisi fase utk melabeli entri LoAF */
  if(WP.t)WP.r.push([ph,now-WP.t,Math.round(q),js==null?0:js,sky||0,lead||0]);
  WP.t=now;WP.ph=ph;
}
function wpEnd(){
  if(!WP||!WP.r.length)return;
  try{
    var R=WP.r,out=[],P=['enter','zoom','tunnel','exit'],i,j,a,ms,md,mx,tot=0,w=R.slice().sort(function(x,y){return y[1]-x[1];}).slice(0,6);
    for(i=0;i<P.length;i++){
      a=R.filter(function(x){return x[0]===P[i];});if(!a.length)continue;
      ms=a.map(function(x){return x[1];}).sort(function(x,y){return x-y;});
      for(j=0,tot=0;j<ms.length;j++)tot+=ms[j];
      md=ms[ms.length>>1];mx=ms[ms.length-1];
      var jj=a.map(function(x){return x[3];}).sort(function(x,y){return x-y;}),sk=a.map(function(x){return x[4];}).sort(function(x,y){return x-y;}),tk=a.map(function(x){return Math.max(0,x[3]-x[5]);}).sort(function(x,y){return x-y;}),ot=a.map(function(x){return Math.max(0,x[5]-x[4]);}).sort(function(x,y){return x-y;});
      out.push(P[i]+'  n='+a.length+'  fps~'+(1000*a.length/Math.max(1,tot)).toFixed(0)+'  med '+md.toFixed(0)+'ms  p95 '+ms[Math.min(ms.length-1,Math.floor(ms.length*.95))].toFixed(0)+'  max '+mx.toFixed(0)+'  | js med '+jj[jj.length>>1].toFixed(0)+' max '+jj[jj.length-1].toFixed(0)+' = sky med '+sk[sk.length>>1].toFixed(0)+' max '+sk[sk.length-1].toFixed(0)+' + rAF-lain med '+ot[ot.length>>1].toFixed(0)+' max '+ot[ot.length-1].toFixed(0)+' + tick-sendiri med '+tk[tk.length>>1].toFixed(0)+' max '+tk[tk.length-1].toFixed(0));
    }
    try{['zoom','tunnel','exit'].forEach(function(ph){var p=WP.s&&WP.s[ph];if(!p)return;out.push('  '+ph+' ms/frame: '+['pre','fresh','step','comp','streak','vig','ring','tele'].map(function(k){return p[k]?k+' '+(p[k][0]/p[k][1]).toFixed(1):'';}).filter(Boolean).join(' | '));});}catch(eS){}
    out.push('terburuk: '+w.map(function(x){return x[0]+'@'+x[2]+' '+x[1].toFixed(0)+'ms(js '+x[3].toFixed(0)+' sky '+x[4].toFixed(0)+')';}).join(' | '));
    if(typeof window.__whMk==='string')out.push('sectStep(in) ms: '+window.__whMk);
    try{out.push('sky frame() >150ms (fase +ms: total | fungsi ms): '+(WFB.length?WFB.map(function(x){return '['+x.ph+' +'+Math.round(x.o)+'] '+Math.round(x.d)+' | '+(x.bk.length?x.bk.map(function(b){return b[0]+' '+Math.round(b[1]);}).join(', '):'(tak terinci)');}).join('  ;  '):'tidak ada'));}catch(eFB){}
    try{['zoom','tunnel','exit'].forEach(function(ph){var L=WP.lf&&WP.lf[ph];out.push(WP.lfSup+' '+ph+' >150ms (+ms dlm fase: total | script | render | s+l | forced | sumber): '+(L&&L.length?L.map(function(x){return '[+'+Math.round(x.o)+'] '+Math.round(x.d)+' | '+Math.round(x.sc)+' | '+Math.round(x.rn)+' | '+Math.round(x.sl)+' | '+Math.round(x.fl)+' | '+(x.src||'-');}).join('  ;  '):'tidak ada'));});}catch(eL){}
    if(window.__plSt)out.push('planet3d sejak zoom-in: resize '+window.__plSt.rs+' | render-penuh '+window.__plSt.fl+' (terlama '+window.__plSt.mx+'ms'+(/(^|,)plfin(,|$)/.test(WH_DBG)?', GPU':', js')+')');   /* diisi 05-sector-ui.js (blok u>=1 fase in), kalau snippet pengukurnya dipasang */
    var el=document.getElementById('whperf')||document.body.appendChild(document.createElement('div'));
    el.id='whperf';el.style.cssText='position:fixed;left:6px;right:6px;top:6px;z-index:99999;background:rgba(0,0,0,.82);color:#9ff;font:11px/1.45 monospace;white-space:pre-wrap;padding:8px 10px;border-radius:8px;pointer-events:auto';
    el.textContent='whperf (tap = tutup) zoom='+(SKY_ZOOM?'on':'off')+' dpr='+dpr.toFixed(2)+' dbg='+(WH_DBG||'-')+' | build v19 ring='+WH_RING+' step='+WH_STEP+' bloom='+(WH_NOBLOOM?'zoomOFF':'on')+' tele='+(typeof SCP3D_WHALT!=='undefined'?SCP3D_WHALT:'LAMA(13 belum v16)')+' cov='+(typeof WORMHOLE!=='undefined'&&('covered' in WORMHOLE)?'ok':'LAMA')+'\n'+out.join('\n');el.onclick=function(){el.remove();};
  }catch(e){}
}
function hardStop(){if(raf){cancelAnimationFrame(raf);raf=0;}runCover();state='idle';env=0;hide();}
function kick(){if(!raf){last=performance.now();raf=requestAnimationFrame(tick);}}
function startExit(now){
  if(state!=='travel')return;
  S.r0=S.r;S.rate0=S.rate;S.e0=env;S.tx=now;S.u=0;state='exit';kick();warpFx('flash');
}
function startClose(now,ms){
  if(state==='close'||state==='idle')return;
  if(!cv||cv.style.display!=='block'){state='idle';env=0;S={};return;}   /* tanpa kanvas: langsung selesai */
  S.c0=[S.cx,S.cy];S.r0=S.r;S.a0=S.a;S.e0=env;S.rate0=S.rate;S.tc=now;S.cms=ms;state='close';kick();
}
/* progres muatan 0..1 untuk cincin portal overview (plat menyala satu per satu selama 'enter'; penuh selama 'travel') */
function chargeP(now){
  if(state==='enter')return S.ch||0;
  if(state==='travel')return 1;
  return 0;
}
/* go(dest,pos,R,onCover): SATU transisi untuk "sektor -> overview" (dest=null) dan "lompat antar sektor" (dest=objek sektor tujuan).
   pos = [x,y] pusat cincin portal (ruang virtual stage), R = radius LUAR cincin saat ini (virtual). Urutan:
     enter  : (tap-gate: 12 plat charge dulu) teleskop terbang masuk ke tengah cincin
     travel : zoom-in ke portal: cincin + dinding terowongan membesar dari dalam cincin sampai menutup layar -> onCover() (sektor asal zoom-out / lanjut gate)
              -> teleskop muncul lagi dan melayang mengikuti lubang hitam terowongan -> lubang hitam meluncur ke portal tujuan
     exit   : layar flash, terowongan memudar, teleskop keluar dari tengah portal tujuan
   Return true = dijalankan (onCover akan dipanggil); false = tidak didukung (pemanggil jalankan onCover sendiri). */
function go(dest,pos,R,onCover){
  if(!usable()||!init())return false;
  if(state==='travel'||state==='enter'||state==='exit')return false;
  if(WP){WP.r=[];WP.t=0;WP.s={};WP.ph='';}   /* v13: 'enter' tak pernah direkam (tick return dulu) -> statistik menumpuk lintas dive & frame zoom pertama = jeda antar-dive (7108ms palsu) */
  whPrewarm();   /* v7: sinkron di awal go — hitch = latensi klik, bukan patah di tengah enter (bukan setTimeout 60) */
  var sp=pos&&pos[0]!=null&&pos[1]!=null?toScr(pos[0],pos[1]):null,
      x=sp?sp[0]:(S&&S.x!=null?S.x:winW()*.5),y=sp?sp[1]:(S&&S.y!=null?S.y:winH()*.5),
      k=(typeof STG!=='undefined'&&STG.on&&!STG.rot&&STG.k)?STG.k:1,
      Rs=R>2?R*k:Math.min(winW(),winH())*.05,
      tb=teleBase(),carry=false;
  try{carry=!!tb&&!(typeof LIS!=='undefined'&&LIS.pend&&!LIS.pend.carry);}catch(eL){}
  S={vx:sp?pos[0]:null,vy:sp?pos[1]:null,x:x,y:y,cx:x,cy:y,r:Rs*(typeof PT_IN==='number'?PT_IN:.745),rp:Rs,a:1,rate:.7,rim:0,dest:dest||null,fromOv:!!(dest&&typeof SECT!=='undefined'&&!SECT.cur),go:1,cov:0,tgi:0,onCover:onCover||null,t0:performance.now(),carry:carry,ch:0,fl:0,hv:null,tv:0,freshR:0,freshLeft:0};
  S.A=carry?T_ENTER_TELE+450:900;   /* carry: terbang T_ENTER_TELE + 450ms muatan (dulu 1100 tetap -> tf0 negatif kalau T_ENTER_TELE > 1100) */
  S.tf0=carry?S.A-T_ENTER_TELE:0;
  S.chT=carry?Math.max(1,S.A-T_ENTER_TELE):S.A*.9;
  dens=1;env=0;state='enter';
  if(carry){try{TELESCOPE.dive=1;}catch(eT){}}   /* teleskop digambar di kanvas ini selama transisi (canvas #sky melewatinya) */
  show();if(cv)cv.style.zIndex='13';kick();   /* kanvas di ATAS sky (penutup layar) */
  try{if(typeof UIS!=='undefined'&&UIS.warpBegin)UIS.warpBegin(S.A,S.chT);}catch(eU){}
  return true;
}
function engageDive(now){
  /* Bekukan pose teleskop (posisi/skala/sudut) SEBELUM skyCam mulai menskala #sky. teleBase() membaca getBoundingClientRect #sky, jadi saat zoom-in dia ikut membesar eksponensial
     (k kamera) dan begitu runCover() -> skyReset() melepas transform, skalanya LONCAT turun ke ukuran asli = teleskop "kepotong" jadi kecil. Selama travel semua dibaca dari S.tb. */
  S.tb=null;if(S.carry){try{S.tb=teleBase();}catch(eB){S.tb=null;}}
  /* overview -> sektor: cincin di #sky sedang MEMBENGKAK (charge penuh = x(1+PT_SWELL), lihat portal3dOverview) saat diserahkan ke kanvas ini. Dulu kanvas ini mulai dari ukuran dasar
     -> cincin 'mengecil' mendadak (loncat ~30%) di awal zoom-in. Mulai dari ukuran bengkak yang sama (rp/r ikut, jadi mulut + zoom eksponensial konsisten). */
  if(typeof PT_SWELL==='number'&&!(typeof SECT!=='undefined'&&SECT.cur)){var swf=1+PT_SWELL;S.rp*=swf;S.r*=swf;}
  state='travel';S.tt=now;S.r1=S.r;S.cx1=S.cx;S.cy1=S.cy;S.a1=1;S.rate1=S.rate;S.rate=.9;S.rim=0;S.edge=.94;S.ring=0;S.cov=0;S.cvQ=0;S.tgi=0;S.justDive=1;   /* ring=0 dulu: kepemilikan cincin pindah ke kanvas ini di frame travel PENUH pertama (frame justDive tidak menggambar cincin -> kalau sky sudah menyembunyikannya = cincin hilang 1 frame) */
  S.lnK=Math.log(Math.max(2,1.05*(Math.hypot(winW(),winH())*.5)/Math.max(4,S.rp*(typeof PT_IN==='number'?PT_IN:.745))));   /* skala akhir: tepi mulut pas melewati sudut layar */
  /* v7 D: isi buffer terowongan dipecah ~3 frame (bukan 16× stepBuf di frame travel penuh pertama) */
  S.freshR=Math.hypot(winW(),winH())*.56;
  S.freshLeft=potato()?8:(S.freshR>Math.min(winW(),winH())*.4?WARM:9);
  /* pre-warm: safety net (idempotent kalau go()/menu sudah warm); + pra-set willChange/origin #sky */
  whPrewarm();
  try{
    var sk=document.getElementById('sky');
    if(sk&&S.vx!=null){sk.style.willChange='transform,opacity';sk.style.transformOrigin=S.vx+'px '+S.vy+'px';S.skyOn=1;}   /* skyOn=1: kalau transisi dibatalkan sebelum frame travel pertama, skyReset tetap membersihkan style ini */
  }catch(eSk){}
}
function engage(now){engageDive(now);}
/* Titik tujuan lubang hitam terowongan (layar): BH overview (dest=null) atau tengah layar (tujuan sektor). Diperhalus supaya
   perpindahan prediksi -> posisi asli (begitu sektor tujuan selesai di-zoom) tidak melompat. */
function seekTarget(dt){
  var t=null,b;
  try{
    if(!S.dest)t=bhScr();   /* F11: tujuan sektor tidak punya titik (portal sektor pensiun) -> t null -> jatuh ke tengah layar */
  }catch(e){}
  if(!t)t=[winW()*.5,winH()*.5];
  if(!S.tgi){S.tgx=t[0];S.tgy=t[1];S.tgi=1;}
  else{var k=1-Math.exp(-dt*8);S.tgx+=(t[0]-S.tgx)*k;S.tgy+=(t[1]-S.tgy)*k;}
  return [S.tgx,S.tgy];
}
/* posisi BH overview (layar) -> tujuan akhir terowongan swallow sektor, supaya isi overview 'dimuntahkan' dari lubang yang sama */
function bhScr(){
  try{if(typeof camBH==='function'){var b=(typeof ptOvDest==='function')?ptOvDest():camBH(),c=toScr(b[0],b[1]);   /* P4: tujuan terowongan = titik portal overview yang mengorbit (bukan home BH), jadi teleskop keluar dari dalam portal */if(c&&isFinite(c[0])&&isFinite(c[1]))return c;}}catch(e){}
  return [winW()*.5,winH()*.5];
}
function secBusy(){return typeof SECT!=='undefined'&&!!SECT.busy;}
function gatePending(){return typeof SGATE!=='undefined'&&!!SGATE.pend;}

/* ---------- gambar satu frame ---------- */
function moveStars(dt,adv){
  var n=ST.length,i,c;
  for(i=0;i<n;i++){
    c=ST[i];
    if(c.r>dens)continue;   /* kurangi bintang kalau frame berat */
    c.z*=Math.exp(-c.v*adv);
    if(c.z<ZN*.85)spawn(c,false);
    if(c.age<1)c.age=Math.min(1,c.age+dt*3);
  }
}
/* sprite lembut memanjang searah radial (len x w, px layar) di posisi layar (px,py) dengan sudut ang */
function dot(x,ci,px,py,w,len,ang,al){
  var co=Math.cos(ang),si=Math.sin(ang);
  x.globalAlpha=al;
  x.setTransform(co,si,-si,co,px*bq,py*bq);
  x.drawImage(spr,0,ci*SC,SC,SC,-len*bq/2,-w*bq/2,len*bq,w*bq);
}
/* satu langkah feedback: buffer lama di-zoom+putar+redam ke buffer baru, lalu suntik blob dinding, debu, kilau, dan kepala bintang */
function stepBuf(dt,cx,cy,Rv,Rh,adv){
  var s=Math.exp(ZOOM*adv),rot=SPIN*adv,co=Math.cos(rot)*s,si=Math.sin(rot)*s,x=cx*bq,y=cy*bq,
      dec=Math.pow(DECAY,dt*60),k=Math.min(1.6,dt*60),sg=s-1,
      i,n=ST.length,c,L,rh,a,rr,d,ci,f,t,ang,ga;
  gB.globalCompositeOperation='source-over';gB.globalAlpha=1;
  gB.setTransform(1,0,0,1,0,0);
  gB.fillStyle=BG;gB.fillRect(0,0,bw,bh);
  gB.setTransform(co,si,-si,co,x-(co*x-si*y),y-(si*x+co*y));
  gB.globalAlpha=dec;gB.drawImage(bA,0,0);
  gB.globalCompositeOperation='lighter';
  /* blob dinding terowongan: besar & lembut, muncul dekat tepi lubang, warna menurut sudut -> lengan spiral berwarna */
  nebAcc+=NEB_RATE*adv;
  if(nebAcc>40)nebAcc=40;
  while(nebAcc>=1){
    nebAcc-=1;
    ang=Math.random()*6.283185307;
    f=ang/6.283185307*NN+(Math.random()*2-.5);
    ci=NP+(((Math.floor(f)%NN)+NN)%NN);
    rr=Rh*(1.1+.8*Math.random());
    d=rr*(2.2+Math.random()*1.6);
    dot(gB,ci,cx+Math.cos(ang)*rr,cy+Math.sin(ang)*rr,d,d+rr*sg*2,ang,NEB_A*(.5+Math.random()*.7)*k);
  }
  /* debu halus: titik kecil dekat tepi lubang; zoom+putar memanjangkannya jadi streak radial tipis berwarna (inti tampilan "warp") */
  dustAcc+=DUST_RATE*adv;
  if(dustAcc>120)dustAcc=120;
  while(dustAcc>=1){
    dustAcc-=1;
    ang=Math.random()*6.283185307;
    if(Math.random()<.22)ci=(Math.random()*2)|0;   /* sebagian putih/biru-putih */
    else{f=ang/6.283185307*NN+(Math.random()*2.4-.7);ci=NP+(((Math.floor(f)%NN)+NN)%NN);}
    rr=Rh*(1.05+.35*Math.random());
    d=1.5+Math.random()*2.2;
    dot(gB,ci,cx+Math.cos(ang)*rr,cy+Math.sin(ang)*rr,d,d+rr*sg*1.4,ang,DUST_A*(.4+Math.random()*.6)*k);
  }
  /* kilau putih-hangat di tepi lubang: titik terang rapat di satu sisi -> lengkung terang yang melebar ke luar */
  if(GLOW_A>0){
    ga=-2.3+.35*Math.sin(tt*.35);
    for(i=0;i<4;i++){
      ang=ga+(Math.random()-.5)*.7;rr=Rh*(1.05+.25*Math.random());
      d=Rh*(.3+.45*Math.random());
      dot(gB,i&1?6:4,cx+Math.cos(ang)*rr,cy+Math.sin(ang)*rr,d,d+rr*sg*1.6,ang,GLOW_A*.6*k);
    }
  }
  /* kepala bintang -> garis pendek di buffer (ekornya diperpanjang feedback) */
  for(i=0;i<n;i++){
    c=ST[i];
    if(c.r>dens)continue;
    L=LAYERS[c.L];
    rh=Rv*ZN/c.z;
    if(rh<Rh*1.3)continue;
    a=c.th+roll;
    t=clamp((rh-Rh)/(Rh*1.5+1),0,1);
    d=1.4+rh*.005*L.sz;
    dot(gB,c.ci,cx+Math.cos(a)*rh,cy+Math.sin(a)*rh,d,d+rh*sg*1.3,a,c.al*c.age*t*.7*k);
  }
  gB.setTransform(1,0,0,1,0,0);
  t=bA;bA=bB;bB=t;t=gA;gA=gB;gB=t;
}
/* Teleskop ikut "terbang" lewat wormhole. Aslinya digambar di canvas #sky (04-render.js), yang tertutup canvas ini, jadi badannya
   digambar ulang di sini lewat teleDrawBody() (di-share dari 04-render.js). Goyangan/pembesaran naik pelan seiring portal membuka.
   Mendukung portrait, landscape biasa (body.ls, #sky di-scale) dan mode ROT (body.lr / lr-cw, stage diputar 90°). */
/* posisi/skala/rotasi teleskop di layar (px) sesuai yang digambar canvas #sky; null = tidak ada / tidak terlihat */
function teleBase(){
  var T=typeof TELESCOPE!=='undefined'?TELESCOPE:null,sk,rc,k,x,y,rot=0,cl;
  if(!T||typeof teleDrawBody!=='function'||!(T.al>.02)||!T.sc||!(T.sx||T.sy))return null;
  sk=document.getElementById('sky');if(!sk)return null;
  rc=sk.getBoundingClientRect();cl=document.body.classList;
  if(cl.contains('lr')){
    /* mode ROT: #stage diputar 90° (ccw default, cw kalau body.lr-cw). rect = kotak pembatas hasil rotasi, jadi koordinat sky -> layar dihitung dari sisinya */
    k=sk.clientWidth?rc.height/sk.clientWidth:1;
    if(cl.contains('lr-cw')){x=rc.right-T.sy*k;y=rc.top+T.sx*k;rot=1.5707963;}
    else{x=rc.left+T.sy*k;y=rc.bottom-T.sx*k;rot=-1.5707963;}
  }else{
    k=sk.clientWidth?rc.width/sk.clientWidth:1;
    x=rc.left+T.sx*k;y=rc.top+T.sy*k;
  }
  return {x:x,y:y,sc:T.sc*k,rot:rot,ang:T.ang,al:clamp(T.al,0,1)};
}
/* ov (opsional): {x,y} posisi layar pengganti, s = pengali skala, a = pengali alpha, w = goyangan 0..1, sp = putaran tambahan (rad) */
/* h = posisi teleskop, (cx,cy) = lubang, m = sisi pendek layar, k 0..1 = seberapa teleskop "dipegang" terowongan, dir 1 = menuju lubang, -1 = menjauh (keluar) */
function teleTilt(dt,h,cx,cy,m,k,dir,vk){
  var C=TELE_TILT;if(!C.on||!(dt>0))return null;
  vk=vk==null?1:vk;
  var st=S.tt3||(S.tt3={x:0,y:0,z:0,px:h[0],py:h[1],s:state});
  if(st.s!==state){st.s=state;st.px=h[0];st.py=h[1];}
  var vx=clamp((h[0]-st.px)/dt/m,-1.5,1.5),vy=clamp((h[1]-st.py)/dt/m,-1.5,1.5),b=1-Math.exp(-dt*7),
      dx=clamp((cx-h[0])/m*3,-1,1)*dir,dy=clamp((cy-h[1])/m*3,-1,1)*dir,bf=C.buffet*k*S.rate,
      tx=C.sx*(C.lean*dy+.5*vy*C.bank*vk)+bf*Math.sin(tt*17+1.3),
      ty=C.sy*(C.lean*dx+.6*vx*C.bank*vk)+bf*Math.sin(tt*13),
      tz=C.sz*(-vx*C.bank*1.2*vk)+bf*Math.sin(tt*23+.6);
  st.px=h[0];st.py=h[1];
  st.x+=(clamp(tx,-.6,.6)-st.x)*b;st.y+=(clamp(ty,-.6,.6)-st.y)*b;st.z+=(clamp(tz,-.6,.6)-st.z)*b;
  return {x:st.x*k,y:st.y*k,z:st.z*k};
}
function chase3d(){return !!(TELE_CHASE.on&&typeof SCP3D!=='undefined'&&SCP3D.state===2&&typeof SCP3D_CFG!=='undefined'&&SCP3D_CFG.on&&!potato());}   /* true = badan 3D aktif -> POV belakang dipakai */
function wrapPi(a){a=a%6.283185307;if(a>3.141592654)a-=6.283185307;else if(a<-3.141592654)a+=6.283185307;return a;}
/* pose kamera (tanpa offset gerak): k 0..1 = seberapa jauh dari pose normal; face +1 = dari belakang, -1 = dari depan */
function chasePose(k,face,tl,roll){   /* roll (opsional) = roll layar pengganti: dipakai saat keluar supaya hidung searah arah terbang */
  var C=TELE_CHASE,o=tl||{x:0,y:0,z:0};
  return {x:o.x,y:o.y,z:o.z,k:clamp(k,0,1),ty:C.yaw*face,tr:roll!=null?roll:C.roll*face,tp:C.pitch,th:C.th,glow:C.glow};
}
function drawTele(ov){
  if(WH_DBG.indexOf('notele')>=0)return;
  var b=(ov&&ov.base)||teleBase(),wob,x,y,sc,al;   /* ov.base = pose teleskop yang DIBEKUKAN (S.tb); tanpa itu dibaca live dari #sky */
  if(!b)return;
  ov=ov||{};
  wob=ov.w!=null?ov.w:clamp((S.a-.4)/.6,0,1);
  x=(ov.x!=null?ov.x:b.x)+Math.sin(tt*5.3)*3*wob;y=(ov.y!=null?ov.y:b.y)+Math.cos(tt*4.1)*2.5*wob;
  sc=b.sc*(ov.s!=null?ov.s:1+.10*wob);al=b.al*(ov.a!=null?ov.a:1);
  if(sc<.01||al<.01)return;
  g.save();
  if(ov.clip){   /* muncul dari mulut portal: hanya bagian di depan bidang portal yang terlihat (hidung duluan); setengah-bidang tegak lurus arah keluar */
    var Cp=ov.clip,Rc=Math.hypot(W,H)*2,nx=-Cp.dy*Rc,ny=Cp.dx*Rc,fx=Cp.dx*Rc,fy=Cp.dy*Rc;
    g.beginPath();g.moveTo(Cp.x+nx,Cp.y+ny);g.lineTo(Cp.x-nx,Cp.y-ny);g.lineTo(Cp.x-nx+fx,Cp.y-ny+fy);g.lineTo(Cp.x+nx+fx,Cp.y+ny+fy);g.closePath();g.clip();
  }
  var tl=ov.tilt,t3=!!(tl&&typeof SCP3D!=='undefined'&&SCP3D.state===2&&typeof SCP3D_CFG!=='undefined'&&SCP3D_CFG.on&&!potato());
  var a0=b.ang+b.rot,kk=(t3&&tl&&tl.k!=null)?clamp(tl.k,0,1):0;
  if(kk>0)a0=wrapPi(a0)*(1-kk);   /* pose kamera: arah hidung diatur 3D, roll layar-nya diredam ke tegak supaya tidak berputar liar */
  if(ov.head!=null&&!t3){var hk=ov.hk!=null?clamp(ov.hk,0,1):1;a0=a0+wrapPi(ov.head-a0)*hk;}   /* badan 2D: hidung (+x) mengarah ke arah terbang */
  g.translate(x,y);g.rotate(a0+(ov.sp||0)+Math.sin(tt*2.7)*.14*wob*(1-.7*kk)+(tl&&!t3?tl.z:0));g.scale(sc,sc);
  g.globalAlpha=clamp(al,0,1);
  if(t3){SCP3D.tilt=tl;SCP3D.altOK=ov.alt?1:0;SCP3D.last=-1e9;}   /* paksa render 3D ulang dengan kemiringan ini (cache 3ms di tele3dBody) */
  try{teleDrawBody(g,performance.now());}catch(e){}
  if(t3){SCP3D.tilt=null;SCP3D.altOK=0;SCP3D.last=-1e9;}   /* gambar teleskop biasa berikutnya render ulang tanpa kemiringan */
  g.restore();
}
/* lubang hitam tengah terowongan: cakram hitam pekat dengan tepi lembut; al<1 = setengah transparan */
function holeDisc(cx,cy,Rh,al){
  if(al<.004)return;
  var gr=g.createRadialGradient(cx,cy,Rh*.8,cx,cy,Rh*1.3);
  gr.addColorStop(0,'rgba(0,0,0,'+al.toFixed(3)+')');gr.addColorStop(1,'rgba(0,0,0,0)');
  g.fillStyle=gr;g.beginPath();g.arc(cx,cy,Rh*1.3,0,6.283185307);g.fill();
}
function drawFrame(dt,cx,cy,r,cvr){
  if(WP)wpM('pre');
  var Rv=Math.min(r,Math.hypot(W,H)*.56),                 /* radius tampilan perspektif (kepala bintang menyentuh Rv = tepi) */
      Rh=Math.min(r*.15,Math.min(W,H)*.06),              /* radius lubang hitam tengah */
      small=r<cvr*.98,n=ST.length,low=potato(),adv=dt*S.rate,
      i,c,L,rh,a,w,ca,sa,lf,tr,hx,hy,tx,ty,al,gr,Rw,Rhw,sd;
  tt+=dt;
  /* v7 D: isi awal terowongan — maks 6 iter/frame (potato 3), total tetap ~WARM; hindari spike di frame travel #1 */
  if(S&&S.freshLeft>0){
    var nDo=Math.min(S.freshLeft,low?1:2);   /* v10: 2 iter/frame (dulu 6) -> ~8 frame, bukan 3 frame x ~50ms */
    Rw=Math.max(Rv,S.freshR||0);Rhw=Math.min(Rw*.15,Math.min(W,H)*.06);sd=.03*S.rate;
    for(i=0;i<nDo;i++){roll+=sd*SPIN;tt+=.03;moveStars(.03,sd);stepBuf(.03,cx,cy,Rw,Rhw,sd);}
    S.freshLeft-=nDo;
    if(S.freshLeft<=0){S.freshLeft=0;S.freshR=0;}
  }
  roll+=adv*SPIN;
  if(WP)wpM('fresh');
  var stDt=dt,stAdv=adv,doStep=WH_DBG.indexOf('nostep')<0;
  if(WH_STEP>1&&state==='travel'&&!S.cov&&!(S.freshLeft>0)){   /* v18: zoom = update buffer tiap WH_STEP frame, dt/adv diakumulasi */
    S.sdt=(S.sdt||0)+dt;S.sa=(S.sa||0)+adv;
    if(((S.sn=(S.sn||0)+1)%WH_STEP)!==0)doStep=false;else{stDt=S.sdt;stAdv=S.sa;S.sdt=0;S.sa=0;}
  }else if(S.sdt){stDt=dt+S.sdt;stAdv=adv+S.sa;S.sdt=0;S.sa=0;}   /* keluar dari zoom: sisa akumulasi dilepas */
  if(doStep){moveStars(stDt,stAdv);stepBuf(stDt,cx,cy,Rv,Rh,stAdv);}
  if(WP)wpM('step');

  g.setTransform(dpr,0,0,dpr,0,0);
  g.globalCompositeOperation='source-over';g.globalAlpha=1;
  g.clearRect(0,0,W,H);
  g.save();
  /* mulut mengikuti kemiringan cincin (elips, bukan lingkaran): kalau cincin miring (zoom-in dari overview) terowongan tidak meluber keluar cincin */
  var tkW=(S.ring&&small&&typeof ptWhTilt==='function'&&typeof ptTiltMat==='function')?ptWhTilt(r/cvr):0,tmW=null;
  if(tkW>.001){try{tmW=ptTiltMat(ptTiltAng(performance.now(),tkW));}catch(eTm){tmW=null;}}
  /* kanvas ini = koordinat LAYAR asli (tidak ikut #stage yang diputar), jadi TIDAK boleh rotate(upAng()) — itu bikin cincin/mulut miring balik ke sumbu portrait saat landscape */
  var mouthXf=function(){g.translate(cx,cy);if(tmW)g.transform(tmW[0],tmW[1],tmW[2],tmW[3],0,0);};
  if(small){g.save();mouthXf();g.beginPath();g.arc(0,0,Math.max(1,r*1.06),0,6.283185307);g.restore();g.clip();}   /* batas kerja saja; tepi tampak asli dibentuk mask alpha di bawah, bukan potongan ini */
  g.fillStyle=BG;g.fillRect(0,0,W,H);
  g.imageSmoothingEnabled=true;
  g.drawImage(bA,0,0,bw,bh,0,0,W,H);
  if(!low&&WH_DBG.indexOf('nobloom')<0&&!(WH_NOBLOOM&&small)){g.globalCompositeOperation='lighter';g.globalAlpha=.45;g.drawImage(bA,0,0,bw,bh,0,0,W,H);}   /* bloom murah: gambar buffer sekali lagi aditif */

  if(WP)wpM('comp');
  /* streak bintang tajam: garis tipis radial, ekor makin panjang kalau makin dekat tepi (perspektif) */
  g.globalCompositeOperation='lighter';g.lineCap='round';
  for(i=0;i<n;i++){
    c=ST[i];
    if(c.r>dens)continue;
    L=LAYERS[c.L];
    rh=Rv*ZN/c.z;
    if(rh<Rh*1.3)continue;
    a=c.th+roll;
    lf=clamp(.17*Math.sqrt(c.v)*c.lf*S.rate,.06,.5);   /* panjang ekor relatif */
    tr=Math.max(Rh*1.05,rh*(1-lf));
    if(small&&tr>r*1.15)continue;   /* v10: streak seluruhnya di luar mulut portal (clip/mask) = tak terlihat: lewati stroke */
    ca=Math.cos(a);sa=Math.sin(a);
    hx=cx+ca*rh;hy=cy+sa*rh;
    a-=SPIN*lf/Math.max(.3,c.v);   /* ekor sedikit melengkung mengikuti putaran */
    tx=cx+Math.cos(a)*tr;ty=cy+Math.sin(a)*tr;
    al=c.al*c.age*clamp((rh-Rh)/(Rh*1.5+1),0,1);
    if(al<.03)continue;
    w=clamp(.5+rh*.0018*L.sz,.5,2.2);
    g.beginPath();g.moveTo(tx,ty);g.lineTo(hx,hy);
    g.strokeStyle=RGB[c.ci];g.lineWidth=w;g.globalAlpha=al*.55;g.stroke();      /* seluruh streak, redup */
    if(!low&&c.L>0){   /* ujung kepala lebih terang: segmen pendek + inti putih */
      g.beginPath();g.moveTo(hx-(hx-tx)*.35,hy-(hy-ty)*.35);g.lineTo(hx,hy);
      g.lineWidth=w*1.2;g.globalAlpha=al;g.stroke();
      if(c.L>1){g.strokeStyle='#fff';g.lineWidth=w*.6;g.globalAlpha=al*.9;g.stroke();}
    }
  }
  g.globalAlpha=1;g.globalCompositeOperation='source-over';
  if(WP)wpM('streak');
  /* pusat: lubang hitam dengan tepi lembut. Saat exit digambar SETELAH dinding dihapus (lihat bawah), dengan alpha yang memudar */
  if(state!=='exit')holeDisc(cx,cy,Rh,1);
  /* vignette: portal mini = gelap di tepi lingkaran; layar penuh = tepi layar sedikit digelapkan */
  if(small){
    /* tepi mulut portal: alpha diluruhkan halus ke 0 (destination-in) -> terowongan menyatu dengan sky di bawahnya, tanpa potongan keras / vignette gelap */
    g.globalCompositeOperation='destination-in';
    gr=tmW?g.createRadialGradient(0,0,0,0,0,Math.max(1,r)):g.createRadialGradient(cx,cy,0,cx,cy,Math.max(1,r));
    var es=S.edge||EDGE_SOLID;   /* saat zoom-in dari cincin: tepi hampir keras, dirapikan oleh cincin yang digambar di atasnya */
    gr.addColorStop(0,'rgba(0,0,0,1)');gr.addColorStop(es,'rgba(0,0,0,1)');
    gr.addColorStop(es+(1-es)*.36,'rgba(0,0,0,.72)');gr.addColorStop(es+(1-es)*.68,'rgba(0,0,0,.26)');gr.addColorStop(1,'rgba(0,0,0,0)');
    g.fillStyle=gr;
    if(tmW){var BIG=Math.hypot(W,H)*2;g.save();mouthXf();g.fillRect(-BIG,-BIG,BIG*2,BIG*2);g.restore();}else g.fillRect(0,0,W,H);
    g.globalCompositeOperation='source-over';
  }else{
    gr=g.createRadialGradient(cx,cy,Math.hypot(W,H)*.28,cx,cy,Math.hypot(W,H)*.62);
    gr.addColorStop(0,'rgba(2,5,13,0)');gr.addColorStop(1,'rgba(2,5,13,.55)');
    g.fillStyle=gr;g.fillRect(0,0,W,H);
  }
  if(state==='exit'){   /* dinding terowongan memudar dari PINGGIR layar ke tengah: batas dinding menyusut sampai seukuran mulut portal tujuan (miring mengikuti kemiringan cincin overview), lalu memudar habis */
    var ux=S.u,wk=sm(ux/.78),wa=1-sm((ux-.74)/.26),Rm,tkE=0,tmE=null,re,fe=.3,BIGE=Math.hypot(W,H)*2;
    try{
      var kk=(typeof STG!=='undefined'&&STG.on&&!STG.rot&&STG.k)?STG.k:1;
      Rm=(!S.dest&&typeof PT3D!=='undefined'&&PT3D.ovR>2)?PT3D.ovR*kk*(typeof PT_IN==='number'?PT_IN:.745):S.rp*(typeof PT_IN==='number'?PT_IN:.745);
      if(!S.dest&&typeof PT3D_CFG!=='undefined')tkE=(PT3D_CFG.tiltOv||0)*sm((ux-.25)/.5);   /* dinding makin miring seiring menyempit ke mulut portal */
      if(tkE>.001)tmE=ptTiltMat(ptTiltAng(performance.now(),tkE));
    }catch(eX){Rm=Math.min(W,H)*.06;}
    if(!(Rm>2))Rm=Math.min(W,H)*.06;
    re=lerp(Math.hypot(W,H)*1.1,Rm,wk);
    g.globalCompositeOperation='destination-in';
    g.save();g.translate(cx,cy);if(tmE)g.transform(tmE[0],tmE[1],tmE[2],tmE[3],0,0);
    gr=g.createRadialGradient(0,0,0,0,0,Math.max(2,re));
    gr.addColorStop(0,'rgba(0,0,0,'+wa.toFixed(3)+')');gr.addColorStop(1-fe,'rgba(0,0,0,'+wa.toFixed(3)+')');gr.addColorStop(1,'rgba(0,0,0,0)');
    g.fillStyle=gr;g.fillRect(-BIGE,-BIGE,BIGE*2,BIGE*2);
    g.restore();
    g.globalCompositeOperation='source-over';
    holeDisc(cx,cy,Rh,(1-sm(ux))*wa);   /* lubang hitam ikut memudar */
  }
  g.restore();
  g.setTransform(dpr,0,0,dpr,0,0);
  if(small&&RIM_GLOW>0&&S.rim>.02){   /* kilau lembut di sekitar mulut (bukan garis): halo tipis yang memudar ke dua arah */
    g.globalCompositeOperation='lighter';
    gr=g.createRadialGradient(cx,cy,r*.7,cx,cy,r*1.25);
    gr.addColorStop(0,'rgba(120,165,255,0)');gr.addColorStop(.55,'rgba(120,165,255,'+(RIM_GLOW*S.rim).toFixed(3)+')');gr.addColorStop(1,'rgba(120,165,255,0)');
    g.fillStyle=gr;g.beginPath();g.arc(cx,cy,r*1.25,0,6.283185307);g.fill();
    g.globalCompositeOperation='source-over';
  }
  if(WP)wpM('vig');
  /* cincin portal ikut membesar (zoom-in): digambar DI ATAS dinding terowongan, memudar saat sudah hampir memenuhi layar */
  if(S.ring&&small&&typeof portal3dDraw==='function'&&WH_DBG.indexOf('noring')<0){
    var ra=(1-sm((r/cvr-.3)/.55))*ringFade();   /* sektor: BH mini di #sky masih tampak -> cincin fade-in selagi BH fade-out (tidak ganda) */
    if(typeof PX!=='undefined'){if(WH_DBG.indexOf('noringgl')>=0)PX.ptr=1;if(WH_DBG.indexOf('nobolt')>=0)PX.ptb=1;}   /* v14 diagnosa: noringgl = tanpa cincin GL (bolt/kilau 2D tetap), nobolt = tanpa petir+kilau+percikan 2D (GL tetap) */
    if(ra>.01){try{portal3dDraw(g,cx,cy,r/(typeof PT_IN==='number'?PT_IN:.745),performance.now(),ra,{noMouth:true,noRot:true,ch:1,tilt:ptWhTilt(r/cvr),lq:WH_DBG.indexOf('ringhq')<0,alt2:WH_RING});}catch(eR){}}
    g.setTransform(dpr,0,0,dpr,0,0);g.globalCompositeOperation='source-over';g.globalAlpha=1;
  }
  if(WP)wpM('ring');
  if(S.fl>.01){   /* kilat layar (di BAWAH teleskop supaya keluarnya dari portal tetap kelihatan) menjelang tiba di portal tujuan */
    g.globalCompositeOperation='source-over';g.globalAlpha=1;
    g.fillStyle='rgba(228,249,255,'+Math.min(1,S.fl*.96).toFixed(3)+')';g.fillRect(0,0,W,H);
  }
  /* teleskop: melayang mengikuti lubang hitam terowongan (travel), lalu keluar dari tengah portal tujuan (exit) */
  if(S.carry&&state==='travel'){
    /* teleskop terlihat dari awal travel: kecil di tengah mulut -> membesar mengikuti zoom -> melayang+miring di terowongan -> menyusut masuk ke lubang tujuan (lanjut ke exit tanpa pop) */
    var tq=(performance.now()-S.tt),mm=Math.min(W,H),zu=sm(tq/T_OPEN),uu2=clamp(tq/T_OPEN,0,1),ee2=Math.pow(uu2,1.35),ez=lerp(ee2,sm(uu2),sm((uu2-.6)/.4)),   /* P0-1: kapal tumbuh di ruang log dgn waktu yg sama dgn mulut (ee), ease-out di ujung supaya berhenti halus di T_OPEN */
        sw=sm((tq-TS())/Math.max(1,TT()-TS())),
        fq=(performance.now()-S.t0-S.tf0)/T_ENTER_TELE,fe=sm(clamp(fq)),b1=fe<1?(S.tb||teleBase()):null;   /* fe<1 = teleskop masih terbang masuk ke cincin sementara zoom-in sudah jalan (T_TELE_OVERLAP) */
    var sShip=Math.exp(lerp(Math.log(lerp(1,.1,fe)),Math.log(.95),ez)),hoverAmp=sm(clamp((uu2-.45)/.55,0,1)),   /* P0-1 skala kapal (log), P0-2 amp hover */
        rw=sm(tq/320),   /* ramp 0..1: wobble (w) & ayun (sp) naik mulus; enter memakai w:0,sp:0 jadi tanpa ini frame pertama travel meloncat */
        hp2=teleHover(dt,cx,cy,mm,1),bx=b1?lerp(b1.x,cx,fe):cx,by=b1?lerp(b1.y,cy,fe):cy,
        px=lerp(bx+(hp2[0]-cx)*hoverAmp,cx,sw),py=lerp(by+(hp2[1]-cy)*hoverAmp,cy,sw),
        aFade=1-sm(clamp((tq-(TT()-260))/260,0,1));   /* H1: fade teleskop ~260ms sebelum TT() supaya travel→exit tidak pop a:1→aE=0 */
    if(chase3d()){
      var tlc=teleTilt(dt,[px,py],cx,cy,mm,.3+.7*zu,1);
      drawTele({alt:1,base:S.tb,x:px,y:py,s:sShip*(1-.87*sw),a:aFade,w:.7*rw,sp:Math.sin(tt*1.1)*.07*(1-sw)*rw,tilt:chasePose(fe,1,tlc)});   /* POV belakang: bank/lean dari gerak ikut di atas pose */
    }else drawTele({alt:1,base:S.tb,x:px,y:py,s:sShip*(1-.87*sw),a:aFade,w:.7*rw,sp:(fq>=1?5.2-6.2832:fe*5.2)*(1-sm(Math.max(0,fq-1)*T_ENTER_TELE/700))+Math.sin(tt*1.1)*.18*(1-sw)*rw,tilt:teleTilt(dt,[px,py],cx,cy,mm,.3+.7*zu,1)});
  }else if(S.carry&&state==='exit'){
    /* keluar portal: HIDUNG duluan. Hidung mengarah ke arah terbang (portal -> posisi istirahat), bukan arah tetap; selama masih keluar hanya bagian di depan bidang portal yang digambar
       (hidung muncul dulu, badan lalu buritan menyusul), lalu belok mulus ke pose istirahat. Teleskop di atas kilat layar, alpha naik pelan supaya pergantian pose dari terowongan tak terlihat. */
    var xe=clamp((S.u-.4)/.6,0,1),pu=sm(xe),b0=teleBase(),h0=S.hv||[cx,cy];
    if(b0){
      var vx0=b0.x-cx,vy0=b0.y-cy,vl0=Math.hypot(vx0,vy0);
      if(vl0>6)S.xh=Math.atan2(vy0,vx0);else if(S.xh==null)S.xh=wrapPi(b0.ang+b0.rot);
      var hd=S.xh,ddx=Math.cos(hd),ddy=Math.sin(hd),ex=lerp(cx,b0.x,pu),ey=lerp(cy,b0.y,pu),sE=lerp(.4,1,pu),aE=sm((S.u-.38)/.1),
          hold=clamp(TELE_CHASE.exitHold,0,.9),pk=1-sm(clamp((pu-hold)/Math.max(.05,1-hold),0,1)),
          Lh=b0.sc*sE*40,clip=(pu<1&&pu*vl0<Lh*1.4)?{x:cx,y:cy,dx:ddx,dy:ddy}:null;
      if(chase3d()){
        var tle=teleTilt(dt,[ex,ey],cx,cy,Math.min(W,H),pk,TELE_TILT.exitDir,TELE_TILT.exitVel);
        drawTele({x:ex,y:ey,s:sE,a:aE,w:(1-pu)*.5,sp:0,clip:clip,tilt:chasePose(pk,TELE_CHASE.exitFace,tle,-hd)});   /* roll = -arah terbang: hidung (proyeksi layar) searah gerak */
      }else drawTele({x:ex,y:ey,s:sE,a:aE,w:(1-pu)*.5,sp:0,clip:clip,head:hd,hk:pk,tilt:teleTilt(dt,[ex,ey],cx,cy,Math.min(W,H),1-pu,TELE_TILT.exitDir,TELE_TILT.exitVel)});
    }
  }
  if(WP)wpM('tele');
}
/* posisi teleskop di dalam terowongan: menuju titik sedikit di depan/bawah lubang hitam dengan jeda (pegas), jadi kelihatan MENGIKUTI gerakan lubang hitam, bukan menempel */
function teleHover(dt,cx,cy,m,amp){   /* amp 0..1: amplitudo melayang (naik pelan seiring zoom-in) */
  var h=S.hv;amp=amp==null?1:amp;
  if(!h){h=S.hv=[cx,cy];}
  var tx=cx+Math.sin(tt*1.3)*m*.05*amp,ty=cy+(m*.11+Math.cos(tt*1.7)*m*.025)*amp,k=1-Math.exp(-dt*4);
  h[0]+=(tx-h[0])*k;h[1]+=(ty-h[1])*k;
  return h;
}

function tick(now){
  raf=0;
  if(state==='idle'||!g||!ok)return;
  var dt=Math.min(.05,Math.max(0,(now-last)/1000)),p,q,w,cvr,eT,skyMs=0,leadMs=0;
  if(WP){skyMs=WSK;WSK=0;WP.l=performance.now();leadMs=WP.l-now;}   /* v8: biaya frame() sky di rAF ini (jalan sebelum tick) */
  W=winW();H=winH();cvr=cover();
  last=now;ema+=(dt-ema)*.08;
  try{if(typeof UIS!=='undefined'&&UIS.warpUpd)UIS.warpUpd(state,env,S.rate);}catch(eW){}
  var justDive=0;
  if(state==='enter'){
    q=now-S.t0;
    S.ch=sm(q/S.chT);env=Math.min(.5,q/Math.max(1,S.A)*.5);
    if(q>=S.A-(S.carry?Math.min(T_TELE_OVERLAP,T_ENTER_TELE*.8):0)){engageDive(now);justDive=1;}   /* teleskop yang masih terbang diteruskan di blok travel (fe) */
  }
  /* justDive: frame engageDive cuma teleBase + pre-warm + gambar enter-style. Travel penuh (skyCam + terowongan + portal3d) mulai frame berikutnya = anti-hitch awal zoom. */
  if(state==='travel'&&!justDive&&!(S&&S.justDive)){
    q=now-S.tt;S.ring=1;   /* mulai frame ini cincin digambar di sini; sky menyembunyikan miliknya di frame sky berikutnya (tumpang tindih 1 frame, ukuran sama = tak terlihat) */
    {
      /* sektor -> overview & lompat antar sektor: jadwal identik (lihat komentar T_TRAVEL). Beda cuma tujuan akhir lubang hitam. */
      var uu=clamp(q/T_OPEN),ee=Math.pow(uu,1.35),ck=null;   /* kamera mendekat: skala eksponensial, pelan di awal lalu makin cepat */
      S.r=q<T_OPEN?S.rp*(typeof PT_IN==='number'?PT_IN:.745)*Math.exp(S.lnK*ee):cvr;
      if(q<T_OPEN&&SKY_ZOOM&&!S.cov)ck=skyCam(uu,ee);   /* guard !S.cov: jangan pasang ulang transform setelah skyReset (bug laten + aman utk P0-3) */
      if(!S.cov){
        var cd=Math.max(Math.hypot(S.cx,S.cy),Math.hypot(W-S.cx,S.cy),Math.hypot(S.cx,H-S.cy),Math.hypot(W-S.cx,H-S.cy));
        if(S.r>=cd*1.02||q>T_OPEN){
          S.cov=1;warpFx('hit');
          if(!S.cvQ){S.cvQ=1;var Sref=S;requestAnimationFrame(function(){if(S===Sref)runCover();});}   /* P0-3: defer runCover ke frame berikutnya (anti-hitch puncak zoom); token S===Sref biar tak jalan di transisi baru */
        }
      }
      w=sm((q-TS())/(TT()-TS()));
      if(w>0){var tg=seekTarget(dt);S.cx=lerp(W*.5,tg[0],w);S.cy=lerp(H*.5,tg[1],w);}   /* tengah layar -> tujuan (BH overview / BH mini sektor tujuan) */
      else if(ck){S.cx=ck[0];S.cy=ck[1];}   /* titik cincin ikut kamera (bergeser ke tengah layar) */
      else{p=sm(q/T_MOVE);S.cx=lerp(S.cx1,W*.5,p);S.cy=lerp(S.cy1,H*.5,p);}              /* posisi BH mini -> tengah layar */
      S.a=1;S.rate=lerp(S.rate1,1.1,sm(q/T_MOVE))+.6*Math.sin(Math.PI*clamp((q-T_OPEN)/Math.max(1,TS()-T_OPEN)));S.rim=0;S.fl=sm((q-(TT()-380))/380);   /* + lonjakan kecepatan di tengah terowongan (streak memanjang) */
      env=Math.max(env,0);env+=(1-env)*Math.min(1,dt*5);
      if(S.cov&&q>=TT()&&!secBusy()&&!gatePending()&&(!S.dest||(typeof SECT!=='undefined'&&SECT.cur===S.dest)||q>TT()+1500))startExit(now);
      else if(q>TT()+6000){runCover();startClose(now,T_CLOSE);}   /* pengaman: transisi macet */
    }
  }
  if(S&&S.justDive)S.justDive=0;
  if(state==='exit'){
    var ue=clamp((now-S.tx)/T_EXIT,0,1),bt=seekTarget(dt);
    S.u=ue;S.cx=bt[0];S.cy=bt[1];S.r=S.r0;S.a=1;S.rate=lerp(S.rate0,.7,sm(ue));S.rim=0;S.ring=0;S.fl=1-sm(ue/.35);env=S.e0*(1-sm(ue));
    if(ue>=1){
      /* Handoff ke #sky TANPA kedip & tanpa bayangan: dulu hide() langsung di sini -> kanvas wormhole hilang, sedangkan #sky baru menggambar teleskop di frame sky berikutnya
         (frame-cap / slow-mode bisa melewati 1-3 frame) = kedip. Sekarang: TELESCOPE.dive=0 (sky mulai menggambar teleskopnya), sementara exit tetap digambar di ue=1
         (posisi/skala/pose istirahat dari teleBase() LIVE, jadi selalu menempel ke teleskop sky yang bergerak). Begitu satu frame sky utuh selesai, kanvas ini dilepas
         seketika (tanpa crossfade = tanpa bayangan ganda). Pengaman 300ms kalau sky macet. */
      if(S.carry&&typeof lastFrameOK==='number'){
        if(!S.ho){S.ho=1;S.ht=now;S.hf=lastFrameOK;try{TELESCOPE.dive=0;}catch(eH){}}
        else if(lastFrameOK!==S.hf||now-S.ht>300){wpEnd();state='idle';env=0;hide();return;}
      }else{wpEnd();state='idle';env=0;hide();return;}
    }
  }
  if(state==='close'){
    q=clamp((now-S.tc)/S.cms,0,1);eT=sm(q);
    S.cx=S.c0[0];S.cy=S.c0[1];
    S.r=S.r0;
    S.a=S.a0*(1-eT);S.rate=lerp(S.rate0,.6,eT);S.rim=0;env=S.e0*(1-eT);
    if(q>=1){wpEnd();state='idle';env=0;hide();return;}
  }
  if(state==='enter'||justDive){   /* belum ada terowongan: kanvas transparan, hanya teleskop. justDive = frame engageDive tetap ringan (travel penuh frame berikutnya) */
    tt+=dt;
    g.setTransform(dpr,0,0,dpr,0,0);g.globalCompositeOperation='source-over';g.globalAlpha=1;g.clearRect(0,0,W,H);
    if(S.carry){
      var fu=clamp((now-S.t0-S.tf0)/T_ENTER_TELE),b1=(justDive&&S.tb)?S.tb:teleBase(),fe=sm(fu);
      if(b1){
        if(chase3d())drawTele({x:lerp(b1.x,S.x,fe),y:lerp(b1.y,S.y,fe),s:lerp(1,.1,fe),a:1,w:0,sp:0,tilt:chasePose(fe,1)});   /* pesawat berbalik: hidung ke portal, mesin hijau menghadap kita, sambil mengecil masuk */
        else drawTele({x:lerp(b1.x,S.x,fe),y:lerp(b1.y,S.y,fe),s:lerp(1,.1,fe),a:1,w:0,sp:fe*5.2});
      }   /* tetap terlihat di tengah mulut (tidak memudar) supaya travel melanjutkan tanpa pop */
    }
    cv.style.opacity='1';
    raf=requestAnimationFrame(tick);return;
  }
  /* kalau frame berat: kurangi jumlah stream (maks sampai 45%), resolusi tetap tajam */
  if(ema>.034&&dens>.46){dens-=.18;ema=.016;}
  if(cv.width!==Math.round(W*dpr)||cv.height!==Math.round(H*dpr))resize();
  cv.style.opacity=S.a>=.995?'1':S.a.toFixed(3);
  if(!(cvr>0))cvr=Math.hypot(W,H)*1.08;
  if(!isFinite(S.r)||!isFinite(S.cx)||!isFinite(S.cy)){S.r=Math.min(W,H)*.22;S.cx=W*.5;S.cy=H*.5;}
  try{drawFrame(dt,S.cx,S.cy,Math.max(1,S.r),cvr);if(WP)wpRec(now,state==='travel'?(S.cov?'tunnel':'zoom'):state,state==='travel'?q:now-(S.tx||now),performance.now()-now,skyMs,leadMs);}
  catch(errD){   /* satu frame error jangan bikin state nyangkut (portal mati sampai reload) */
    try{console.warn('[wormhole] frame error:',errD&&errD.message);}catch(e4){}
    hardStop();return;
  }
  raf=requestAnimationFrame(tick);
}

/* Muffle audio untuk spatialTarget (01-core.js): 0..1, dipakai sebagai batas bawah target redam.
   .88 = angka yang sama dengan tunnel/star-tracker muffle yang sudah ada. */
function muffle(){return state==='idle'?0:.88*clamp(env,0,1);}

window.WORMHOLE={
  gate:function(s,pos,R,cb){try{return go(s,pos,R,cb);}catch(e){return false;}},          /* lompat antar sektor: BH mini -> tengah -> BH mini sektor tujuan s */
  overview:function(pos,R,cb){try{return go(null,pos,R,cb);}catch(e){return false;}},     /* sektor -> overview: BH mini -> tengah -> BH overview; jadwal & durasi sama dengan gate */
  arrive:function(){if(state==='exit')return .08+.92*eo(clamp(S.u/.6,0,1));if(state==='travel'&&S.go&&S.cov)return .08;return 1;},
  muffle:function(){return muffle();},
  charge:function(){try{return chargeP(performance.now());}catch(e){return 0;}},   /* 0..1: progres muatan cincin (plat menyala satu per satu) */
  ringFade:ringFade,   /* 0..1 serah-terima cincin/BH (dipakai 03-gargantua: BH sektor disembunyikan saat 1) */
  ringOwned:function(){return state==='travel'&&!!S.ring;},   /* cincin portal sektor sedang digambar di kanvas wormhole (zoom-in) */
  get zooming(){return state==='travel'&&!S.cov&&S.tt!=null&&(performance.now()-S.tt)<T_OPEN;},   /* zoom-in ke portal sebelum layar tertutup: sky di bawah cuma di-zoom CSS + meredup, tak perlu dirender penuh tiap frame */
  /* v8: kanvas terowongan menutup SELURUH layar secara buram (travel setelah S.cov, + awal exit sampai dinding mulai menyusut u<.22) -> #sky di bawahnya tak terlihat sama sekali;
     05-sector-ui.js frame() menjarangkan render sky saat ini true (sebelumnya sky dirender PENUH tiap frame di bawah terowongan = biaya js ~20ms/frame). ?whdbg=nocov = perilaku lama (A/B). */
  get covered(){return WH_DBG.indexOf('nocov')<0&&((state==='travel'&&!!S&&!!S.cov)||(state==='exit'&&!!S&&S.u<.22));},
  get on(){return state!=='idle';},
  get busy(){return state==='enter'||state==='travel'||state==='exit';},   /* transisi sedang jalan */
  get supported(){return usable();}
};

window.addEventListener('resize',function(){if(state!=='idle'&&cv)resize();},{passive:true});
/* bake atlas ~puluhan ms: lakukan saat idle supaya transisi pertama tidak patah (HP lemah: lazy). */
if(!potato()&&usable()){
  var idle=window.requestIdleCallback||function(f){return setTimeout(f,3500);};
  idle(function(){if(document.body)init();},{timeout:7000});
}
})();
