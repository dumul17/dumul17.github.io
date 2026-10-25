'use strict';
/* 05-sector-ui.js — sector overview, sector gate, panel tune, music player */
/* ================= Sector Overview (idle) =================
   Overview = Gargantua (sektor 0, tengah) + portal. Tap portal -> window menu sektor (16-sector-menu.js); ikon sektor di sky sudah pensiun.
   File ini: transisi zoom sektor (sectZoomIn/Out), posisi sektor (s.bx/by + s.gx/gy), relay/TX, panel tuning, music player. */
/* Sektor (4 sektor musim) + rasi tiap sektor: dari sky-data.js (SECTORS + RASI[].sector). list[].ids = rasi AKTIF (juga hitungan 💫N di overview). */
var SECT={on:true,phase:'ov',cur:null,busy:false,z:0,t0:0,zt:2.4,dur:950,flash:0,list:SKY.sectors,down:null};
function sectSet(on){
  SECT.on=!!on;
  try{var bc=document.body.classList;bc.toggle('sect-ov',SECT.on);
    bc.toggle('sect-in',!SECT.on&&!!SECT.cur);
    for(var si=0;si<SECT.list.length;si++)bc.toggle('sect-in-'+SECT.list[si].k,!SECT.on&&SECT.cur===SECT.list[si]);
    fxSectSync();}catch(e){}
  try{applyObserveIcon(document.getElementById('mode-observe'));}catch(eO){}
  if(SECT.on){try{syncSkyPanHits();}catch(e){}}
}
/* sectShow = gerbang gambar + hit-test + kamera. Rasi di CONS_OFF (off:true di sky-data.js) selalu false. */
function sectShow(id,raw){return !CONS_OFF[id]&&(!SECT.cur||SECT.cur.ids.indexOf(id)>=0)&&(raw||!joinHide(id));}
function sectEase(u){return u<.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2;}
/* Transform zoom ke ikon: titik P (dunia) -> tengah layar. pan = (pusat - P)*u, zoom = 1+u*(zt-1). */
function sectApply(s,u){
  skyZoom=1+u*(SECT.zt-1);
  skyPan.x=(W*.5-s.bx)*u;skyPan.y=(H*.5-s.by)*u;
  SECT.z=u;
}
function sectZoomIn(s){
  if(SECT.busy||!s||s.bx==null)return;
  SECT.busy=true;SECT.phase='in';SECT.cur=null;SECT.target=s;SECT.t0=performance.now();
  try{if(typeof setCameraMode==='function'&&CAMERA_MODE)setCameraMode(false);}catch(e){}
}
function sectZoomOut(){
  if(SECT.busy||!SECT.target)return;
  var s=SECT.target;
  /* Dari mode observasi (📡) maupun kamera: matikan Observation Mode (kamera ikut mati) biar overview bersih, nggak nyangkut di 🌠 + HUD LAT/LON. */
  try{if(typeof setObserveMode==='function'&&OBSERVE_MODE)setObserveMode(false);else if(CAMERA_MODE)setCameraMode(false);}catch(e){}
  sumStash();
  SECT.busy=true;SECT.phase='out';SECT.t0=performance.now();
  SECT.cur=null;SECT.flash=SECT.t0;
  try{sumUI();}catch(eU1){}
  sectSet(true);sectApply(s,1);
  try{syncSkyPanHits();}catch(e){}
}
function whBusy(){return typeof WORMHOLE!=='undefined'&&!!WORMHOLE.busy;}   /* transisi portal (09) sedang jalan: abaikan input transisi lain */
function sectToggle(){
  if(SECT.busy||whBusy())return;
  if(SECT.phase==='sec')lisAsk(sectZoomOut,false);   /* ada teleskop di sini? tanya ajak / tinggal dulu */
}
/* Keluar sektor lewat tekan & tahan BH mini (lepas jari): terowongan wormhole (09) dengan jadwal & durasi yang SAMA dengan lompat antar sektor.
   Tanpa swallow: zoom-out jalan di bawah terowongan, lubang hitam terowongan: BH mini -> tengah -> BH overview. */
function sectSwallowToggle(){
  if(SECT.busy||SW||whBusy())return;
  if(SECT.phase==='sec')lisAsk(sectWormholeOut,false);
}
function sectWormholeOut(){
  if(SECT.busy||SW||!SECT.cur||!SECT.target)return;
  var wa=wormAnchor();   /* F10: tanpa cincin portal sektor; posisi mulut dihitung SEBELUM sectZoomOut (sectApply menggeser kamera) */
  /* Urutan: teleskop masuk mulut -> zoom-in -> begitu layar tertutup terowongan, sektor zoom-out di bawahnya (callback onCover) */
  var ok=false;
  try{if(typeof WORMHOLE!=='undefined')ok=!!WORMHOLE.overview(wa.pos,wa.R,function(){sectZoomOut();});}catch(eW){}
  if(!ok)sectZoomOut();   /* tanpa wormhole (reduced-motion dll): zoom-out biasa */
}
/* F10: portal sektor pensiun. Mulut wormhole keluar sektor / lompat sektor: posisi layar teleskop kalau tampak (ruang stage, sama dengan ptRingNow lama), selain itu tengah layar.
   R = ptSecR() * zoom (cincin kecil); wormhole memakai 5% layar kalau R <= 2, jadi tidak pernah 0. */
function wormAnchor(){
  var p=null,R=0;
  try{if(typeof telescopeScreenPos==='function'&&!(typeof lisGone==='function'&&lisGone())&&typeof TELESCOPE!=='undefined'&&TELESCOPE.al>.5)p=telescopeScreenPos();}catch(eP){}
  try{R=ptSecR()*(skyZoom||1);}catch(eR){R=0;}
  if(!(R>2))R=Math.min(W,H)*.05;
  return {pos:p?[p[0],p[1]]:[W*.5,H*.5],R:R};
}
/* ---- Gargantua = sektor 0. Di dalam sektor dia disembunyikan; tombol 🕳️ memanggilnya kecil (seukuran pulse) & bebas di-parkir ---- */
/* Soft proximity of summoned mini-BH to rasi/cluster mass. Continuous field, no hard edge. */
function bhNearFactor(){
  if(!SECT.cur||!W||!H)return 0;
  return bhNearAt(BH.x,BH.y);
}
/* Faktor kedekatan di titik (bx,by) ruang BH. Dipakai juga sumSpot() biar spot parkir dipilih pakai rumus yang SAMA dengan yang menentukan ukuran. */
function bhNearAt(bx,by){
  if(!SECT.cur||!W||!H)return 0;
  var i,cs,cx,cy,hw,hh,dx,dy,d,R,w,acc=0,wSum=0;
  var field=Math.max(100,Math.min(W,H)*.42); /* outer soft influence */
  for(i=0;i<CONS.length;i++){
    cs=CONS[i];
    if(!cs||!sectShow(cs.id)||!(cs.maxX>-1e8))continue;
    cx=(cs.minX+cs.maxX)*.5;cy=(cs.minY+cs.maxY)*.5;
    hw=Math.max(28,(cs.maxX-cs.minX)*.55);hh=Math.max(28,(cs.maxY-cs.minY)*.55);
    /* Distance to axis-aligned cluster bounds (0 inside the cloud) */
    dx=Math.max(Math.abs(bx-cx)-hw,0);dy=Math.max(Math.abs(by-cy)-hh,0);
    d=Math.hypot(dx,dy);
    R=field+Math.max(hw,hh)*.35;
    /* Gravity-like falloff: 1/(1+(d/R)^2) — continuous, never snaps */
    w=1/(1+(d/R)*(d/R));
    acc+=w*w; /* bias toward nearest strong peak without hard max */
    wSum+=w;
  }
  if(sectShow('pleiades')&&typeof PLEIADES!=='undefined'&&PLEIADES.ready&&PLEIADES.scale){
    cx=PLEIADES.x+.53*PLEIADES.scale;cy=PLEIADES.y+.42*PLEIADES.scale;
    hw=Math.max(36,PLEIADES.scale*.55);hh=hw;
    dx=Math.max(Math.abs(bx-cx)-hw,0);dy=Math.max(Math.abs(by-cy)-hh,0);
    d=Math.hypot(dx,dy);
    R=field+hw*.35;
    w=1/(1+(d/R)*(d/R));
    acc+=w*w;wSum+=w;
  }
  if(wSum<=1e-6)return 0;
  /* Soft peak in [0,1], smoothstep for cinematic ramp */
  var f=Math.max(0,Math.min(1,acc/(acc*.35+0.55)));
  return f*f*(3-2*f);
}
function bhScaleTarget(){
  if(SECT.cur){
    if(CAMERA_MODE&&camFocusId()==='bh')return 1; /* fokus kamera ke BH mini (cam 1x): seukuran BH overview; keluar fokus/kamera -> balik ke ukuran parkir */
    return Math.max(.05,Math.min(1,BHU.size/BH_SECT_MAXSIZE)); /* ukuran tetap dari slider: 1.80x = BH overview 1.00x */
  }
  if(SECT.phase==='in')return 0;
  return 1; /* overview: anchor BH selalu ada (portal overview), BHSC mengalir halus ke 1 */
}
/* Critically-damped-ish scale so drag growth feels heavy, not laggy or snappy. */
var _bhScV=0,_bhScT=0;
function bhScaleStep(){
  bhuCtxSync();
  var t=bhScaleTarget();
  var now=performance.now();
  var dt=Math.min(50,_bhScT?now-_bhScT:16)/1000;_bhScT=now;
  if(!SECT.cur){
    /* Default ease when leaving sector / recalling */
    _bhScV=0;
    var k=0.14;
    if(Math.abs(t-BHSC)>.002)BHSC+=(t-BHSC)*k;else BHSC=t;
  }else{
    /* Spring toward target. Stiffer while dragging so it tracks the hand;
       softer when released so size settles with weight. */
    var stiff=drag.on?18:9;
    var damp=drag.on?0.82:0.88;
    var a=(t-BHSC)*stiff;
    _bhScV=_bhScV*Math.pow(damp,dt*60)+a*dt;
    /* Clamp velocity so a long fling cannot overshoot wildly */
    var vmax=drag.on?2.8:1.6;
    if(_bhScV>vmax)_bhScV=vmax;else if(_bhScV<-vmax)_bhScV=-vmax;
    BHSC+=_bhScV*dt;
    if(BHSC<0){BHSC=0;_bhScV=0;}
    if(BHSC>1){BHSC=1;_bhScV*=.3;}
    /* Snap residual when nearly settled */
    if(!drag.on&&Math.abs(t-BHSC)<.003&&Math.abs(_bhScV)<.02){BHSC=t;_bhScV=0;}
  }
  var hid=BHSC<.05;
  try{
    var bhEl=document.getElementById('bh');
    if(bhEl&&bhEl._hid!==hid){bhEl._hid=hid;bhEl.style.visibility=hid?'hidden':'';if(CAPS&&CAPS.bh)CAPS.bh.style.visibility=hid?'hidden':'';}
  }catch(e){}
}
/* ---- Penghalang HUD (koordinat layar): dipakai sumSpot supaya BH mini diparkir tidak menumpuk tombol HUD / teleskop ---- */
function hudRects(){
  var out=[],ids=['owl-source','mode-cluster','mp-now-playing','last-signal','cam-zoom','footer'],i,el,cs,r;
  for(i=0;i<ids.length;i++){
    el=document.getElementById(ids[i]);if(!el)continue;
    try{
      cs=getComputedStyle(el);if(cs.display==='none'||cs.visibility==='hidden'||+cs.opacity<.05)continue;
      r=vrect(el);
    }catch(e){continue;}
    if(!r||!(r.right-r.left>2)||!(r.bottom-r.top>2))continue;
    out.push([r.left,r.top,r.right,r.bottom]);
  }
  try{var tp=telescopeScreenPos();if(tp)out.push([tp[0]-30,tp[1]-30,tp[0]+30,tp[1]+30]);}catch(eT){}
  return out;
}
function hudHit(x,y,R,rects){
  for(var i=0;i<rects.length;i++){
    var q=rects[i],dx=Math.max(q[0]-x,0,x-q[2]),dy=Math.max(q[1]-y,0,y-q[3]);
    if(dx*dx+dy*dy<R*R)return true;
  }
  return false;
}
/* Titik parkir BH mini waktu masuk sektor: titik terjauh dari bintang/rasi di sektor (lingkaran kosong terbesar) yang bebas dari tombol HUD & teleskop.
   F11: layout portal shortcut (sgPoints) dan SPOT_AVOID (portal sektor) sudah pensiun, jadi cuma bintang + HUD yang dihindari. */
function sumSpot(){
  var hb=0,ft=H;
  try{hb=vrect($('#header')).bottom;ft=vrect($('#footer')).top;}catch(e){}
  var x0=Math.max(30,W*.06),x1=W-x0,y0=Math.max(hb+24,H*.12),y1=Math.min(ft-24,H*.9),pts=[],k,s2,q,i,j;
  CONS.forEach(function(cc){
    if(!sectShow(cc.id))return;
    for(k in cc.stars){s2=cc.stars[k];q=skyXF(s2.x+cc.ox,s2.y+cc.oy);pts.push(q[0],q[1]);}
  });
  if(sectShow('pleiades')&&PLEIADES.ready){
    PLEIADES.bright.forEach(function(z){q=skyXF(PLEIADES.x+z.x*PLEIADES.scale,PLEIADES.y+z.y*PLEIADES.scale);pts.push(q[0],q[1]);});
  }
  var rects=hudRects(),tgt=Math.max(.05,Math.min(1,BHU.size/BH_SECT_MAXSIZE)),Rv=Math.max(10,BH.R*tgt*2),
      best=null,bs=-1e9,nx=22,ny=16;
  for(i=0;i<=nx;i++)for(j=0;j<=ny;j++){
    var cx=x0+(x1-x0)*i/nx,cy=y0+(y1-y0)*j/ny,md=320,d,sc;
    if(typeof planetBhOk==='function'&&!planetBhOk(cx,cy,Rv*.5))continue;   /* planet (17-planet3d.js): BH boleh terbenam sedikit di balik limb, tidak lebih */
    for(k=0;k<pts.length;k+=2){d=Math.hypot(cx-pts[k],cy-pts[k+1]);if(d<md)md=d;}
    sc=md-(hudHit(cx,cy,Rv+14,rects)?2000:0)-Math.hypot(cx-W*.5,cy-H*.5)*.02;   /* terjauh dari bintang; HUD bebas; seri → condong ke tengah */
    if(sc>bs){bs=sc;best=[cx,cy];}
  }
  return best||[W*.5,H*.5];
}
/* Taruh BH mini di titik parkir (sumSpot), dikonversi ke ruang BH. */
function sumPlace(){
  var sp=sumSpot(),z=skyZoom||1,cx=W*.5,cy=H*.5;
  BH.x=cx+(sp[0]-cx)/z-skyPan.x*BHK;BH.y=cy+(sp[1]-cy)/z-skyPan.y*BHK;
  RELAY.x0=BH.x;RELAY.y0=BH.y;RELAY.moved=false;
}
/* F10: summon/recall BH mini (sumSet), txAutoBH, dan stash posisi BH mini (s.bhs) dihapus. Portal/relay sektor pensiun: BH mini selalu ada & hanya bisa di-drag (dilatasi audio),
   diparkir ulang di titik kosong tiap masuk sektor (sectStep). Tombol HUD #mode-bh sekarang membuka window menu sektor. */
function sumStash(){RELAY.pend=0;BH.x=BH.hx;BH.y=BH.hy;sumUI();}
function sumRestore(s){BH.x=BH.hx;BH.y=BH.hy;sumUI();}
function sumUI(){if(typeof bhTuneSync==='function')bhTuneSync();}
function sectStep(now){
  if(!SECT.busy)return;
  var s=SECT.target;if(!s){SECT.busy=false;return;}
  var u=clamp((now-SECT.t0)/(reduce?1:SECT.dur));
  if(SECT.phase==='in'){
    sectApply(s,sectEase(u));
    if(u>=1){
      SECT.flash=now;SECT.cur=s;SECT.phase='sec';SECT.busy=false;
      try{sumRestore(s);}catch(eSR){}
      try{sumUI();}catch(eU2){}
      skyZoom=1;skyPan.x=0;skyPan.y=0;SECT.z=0;
      RELAY.pend=0;try{sumPlace();}catch(ePl){}   /* BH mini selalu ada -> diparkir di titik kosong saat masuk sektor */
      sectSet(false);
      try{FOCUS.list=null;FOCUS.i=0;FOCUS.anim=false;if(CAMERA_MODE){FOCUS.list=focusList();focusUI();}}catch(eF){}
      try{syncSkyPanHits();}catch(e){}
      try{lisArrive(s.k);}catch(eL){}
    }
  }else if(SECT.phase==='out'){
    sectApply(s,1-sectEase(u));
    if(u>=1){
      SECT.busy=false;SECT.phase='ov';skyZoom=1;skyPan.x=0;skyPan.y=0;SECT.z=0;
      try{FOCUS.list=null;FOCUS.i=0;FOCUS.anim=false;}catch(eF){}
      try{syncSkyPanHits();}catch(e){}
      if(SGATE.pend){var pj=SGATE.pend;SGATE.pend=null;try{sectZoomIn(pj);}catch(eJ){}} /* lanjut masuk sector tujuan (Sector Gate) */
      else{try{lisArrive('ov');}catch(eL2){}}
    }
  }
}
function drawSectFlash(now){
  var t=now-SECT.flash;
  if(SECT.flash&&t<420){
    g.save();g.globalAlpha=.5*(1-t/420);g.fillStyle='#bff4ff';g.fillRect(0,0,W,H);g.restore();
  }
}
function drawSectorOverview(now,age){
  if(window.__hub&&!window.__hub.sect)window.__hub.sect=SECT;
  if(window.__hub&&!window.__hub.sky)window.__hub.sky=function(){return {z:skyZoom,px:skyPan.x,py:skyPan.y,bhk:BHK};};
  var n=SECT.list.length,rad=Math.max(20,Math.min(30,W*.07)),
      ry=Math.max(90,Math.min(H*.30,BH.hy-100)),rx=Math.min(W*.36,ry*1.7),
      mx=reduce?0:mouse.x*7+skyPan.x,my=reduce?0:mouse.y*5+skyPan.y;
  if(reduce){mx=skyPan.x;my=skyPan.y;}
  if(SECT.busy){mx=skyPan.x;my=skyPan.y;}
  SECT.mx=mx;SECT.my=my;
  /* Ikon sektor di overview sudah pensiun (tap portal = window menu sektor, 16-sector-menu.js). Fungsi ini tinggal menghitung posisi:
     s.bx/by (dipakai sectZoomIn) dan posisi hantu s.gx/gy (muffle audio di 01-core spatialTargetBase). */
  for(var i=0;i<n;i++){
    var s=SECT.list[i];
    var an=s.a*Math.PI/180,ox=Math.cos(an)*rx,oy=Math.sin(an)*ry,dx=ox,dy=oy;
    if(STG.rot){
      /* Landscape (stage diputar 90°): susunan portal di LAYAR disamakan dengan portrait (01 tetap di posisi atas, dst).
         Offset portrait (ox,oy) diubah ke ruang stage, dan diskala supaya muat di tinggi layar landscape. */
      /* Portal atas/bawah sudah tidak ada (sudut max 30° -> |sin|=.5), jadi tinggi layar cukup lega. Horizontal landscape lebih lebar:
         portal dijauhkan dari BH sampai sisi layar (dengan sisa margin). */
      var lf=Math.min(1,Math.max(.3,(STG.ih*.5-rad-62)/Math.max(1,ry*.5)));
      var bxs=STG.rot<0?BH.hy:(STG.iw-BH.hy),mg=rad+28;
      var rL=Math.max(rx*lf,Math.min((bxs-mg)*.85,STG.ih*1.1));
      var rR=Math.max(rx*lf,Math.min((STG.iw-bxs-mg)*.85,STG.ih*1.1));
      ox=Math.cos(an)*(Math.cos(an)<0?rL:rR);oy*=lf;
      if(STG.rot<0){dx=-oy;dy=ox;}else{dx=oy;dy=-ox;}
    }
    var bx=BH.hx+dx,by=BH.hy+dy;
    s.bx=bx;s.by=by;
    var p=gSky(bx+mx,by+my);
    s.gx=p[0];s.gy=p[1];   /* posisi hantu — muffle overview di 01-core spatialTargetBase */
  }
  try{if(/[?&]dbg\b/.test(location.search)){g.save();g.fillStyle='rgba(255,255,255,.5)';g.font='9px monospace';g.textAlign='left';g.textBaseline='top';
    g.fillText('build 2026-10-06a \u00b7 PLE '+(PLEIADES.scale||0).toFixed(1),8,top+4);g.restore();}}catch(eD){}
}
/* Interlocking status per sektor: tiga ◉ (ring + titik tengah), masing-masing punya warna sendiri dan menyala sendiri-sendiri:
   kiri ◉ kuning = drone di-summon di sektor itu · kanan ◉ pink = drone aktif/docking. (Dot cyan "BH overview" dihapus: portal overview selalu ada.)
   Yang belum aktif = netral (idle), tanpa teks. Level sektor (txComp, 02-sky-logic.js): 0 netral · 1 kuning (drone di-summon, s.drn) · 2 pink (drone aktif/docking). */
var IL_COL=[null,'255,214,102','255,154,217'];   /* warna per LEVEL: dipakai garis/drone/cincin di 08-tx-drone.js */
/* F6: drawInterlock + IL_DOT (◉◉ di bawah ikon sektor overview) dihapus; window menu sektor menampilkan statusnya sendiri lewat txInterlock (16-sector-menu.js). IL_COL tetap dipakai 08-tx-drone.js. */
/* ---------- panel tuning (di panel owl > Settings): sub tab = ICON, semua halaman satu ukuran (isi panjang di-scroll di dalam) ----------
   GARGANTUA = BH mini sektor (size / strength / bloom / speed) · SKY = overview: Milky Way (kekuatan, skala, geser, ikut zoom, parallax, cermin; slider nebula lama cuma muncul kalau Milky Way tidak aktif) / sektor: nebula bertint
   ASTEROID · TELE · PLANET / DRONE / PORTAL (3 tab terakhir dibuat 18-tune3d.js dari daftar knob CFG-nya, T3D). Save/Reset berlaku untuk tab yang aktif. */
(function bhTune(){
  var panel=document.getElementById('bh-panel'),btn=document.getElementById('mode-bhset');
  if(!panel)return; /* mode-bhset removed — panel lives in owl Tune tab */
  var body=document.body,keys=['size','str','bloom','speed'],allKeys=keys,astBtn=document.getElementById('bp-ast'),AK=['n','sz','w','t','spd'],ain={},aout={},inp={},out={},
      bSave=document.getElementById('bp-save'),bReset=document.getElementById('bp-reset'),bClose=document.getElementById('bp-close'),sub=document.getElementById('bp-sub'),
      tabs=[].slice.call(panel.querySelectorAll('.bp-tab')),pages={},cur='bh',SKYK=['HAZE','BAND','DRIFT','A_OV','THICK','VIG'],SECK=['A_SEC','SDIM','SPREAD','ZF'],ALLK=SKYK.concat(SECK),sin={},sout={},bakeT=0,tintT=0;
  AK.forEach(function(k){ain[k]=document.getElementById('ap-'+k);aout[k]=document.getElementById('ap-'+k+'-v');});
  function tx(k,f){try{var v=T(k);return(v&&v!==k)?v:f;}catch(e){return f;}}
  [].slice.call(panel.querySelectorAll('.bp-page')).forEach(function(p){pages[p.getAttribute('data-page')]=p;});
  keys.forEach(function(k){inp[k]=document.getElementById('bp-'+k);out[k]=document.getElementById('bp-'+k+'-v');});
  function nt(k){return NEB_TUNE[k]||NEBS_TUNE[k];}
  ALLK.forEach(function(k){sin[k]=document.getElementById('sp-'+k);sout[k]=document.getElementById('sp-'+k+'-v');
    if(sin[k]){sin[k].min=String(Math.round(nt(k).min*100));sin[k].max=String(Math.round(nt(k).max*100));}});
  function fill(el){if(!el)return;var mn=+el.min,mx=+el.max;el.style.setProperty('--p',((+el.value-mn)/((mx-mn)||1)*100)+'%');}   /* isi track slider */
  function skyFmt(k,v){return k==='VIG'?v.toFixed(2)+'\u00d7':Math.round(v*100)+'%';}
  /* ---- tab Gargantua ---- */
  function stored(){var o=null;try{o=JSON.parse(localStorage.getItem(bhuKey())||'null');}catch(e){}var r={},df=bhuDef();allKeys.forEach(function(k){r[k]=(o&&typeof o[k]==='number')?bhuClamp(k,o[k]):df[k];});return r;}
  function paintBH(){
    keys.forEach(function(k){if(inp[k]){inp[k].value=String(Math.round(BHU[k]*100));fill(inp[k]);}if(out[k])out[k].textContent=BHU[k].toFixed(2)+'\u00d7';});
  }
  /* ---- tab Langit ---- */
  function skyStored(){var o=null;try{o=JSON.parse(localStorage.getItem('dumul_sky_cfg')||'null');}catch(e){}var r={};SKYK.forEach(function(k){r[k]=(o&&typeof o[k]==='number')?o[k]:NEB_TUNE[k].def;});return r;}
  function skyMw(){return body.classList.contains('sect-ov')&&mwOn()&&t3('mw');}   /* overview + Milky Way aktif -> slider Milky Way (T3D 'mw') */
  function skyOv(){return body.classList.contains('sect-ov')&&NEB.on&&!mwOn();}   /* slider nebula/kabut/vinyet LAMA: cuma kalau Milky Way tidak aktif (potato, ?mw=0, gambar gagal); selain itu plateDeep di-fade keluar dan slider ini tidak terasa */   /* baris kabut/nebula/vinyet: cuma overview (di sektor plate ini diredam + ditimpa nebula bertint, jadi slider-nya nggak terasa) */
  function skySect(){return body.classList.contains('sect-in')&&NEB.on;}   /* baris langit sektor: A_SEC/SDIM/SPREAD/ZF, disimpan terpisah (dumul_sky_cfg_s) */
  function secStored(){var o=null;try{o=JSON.parse(localStorage.getItem('dumul_sky_cfg_s')||'null');}catch(e){}var r={};SECK.forEach(function(k){r[k]=(o&&typeof o[k]==='number')?o[k]:NEBS_TUNE[k].def;});return r;}
  function astStored(){var o=null;try{o=JSON.parse(localStorage.getItem('dumul_ast_cfg')||'null');}catch(e){}return astNorm(o);}
  function astFmt(k,v){return k==='n'?String(v):v.toFixed(2)+'\u00d7';}
  function paintAst(){
    if(astBtn){var ao=!!AST_CFG.on;astBtn.setAttribute('aria-pressed',ao?'true':'false');astBtn.textContent=ao?T('tune.show'):T('tune.hide');astBtn.classList.toggle('off',!ao);}
    AK.forEach(function(k){
      var v=k==='n'?(AST_CFG.n<0?AST_AUTO:AST_CFG.n):AST_CFG[k],el=ain[k];
      if(el){el.value=String(k==='n'?v:Math.round(v*100));fill(el);}
      if(aout[k])aout[k].textContent=astFmt(k,v);
    });
  }
  function astDirty(){var st=astStored(),d=false;if(st.on!==AST_CFG.on)d=true;AK.forEach(function(k){if(k==='n'?st.n!==AST_CFG.n:Math.abs(st[k]-AST_CFG[k])>.004)d=true;});return d;}
  function paintSky(){ALLK.forEach(function(k){var v=NEB[k];if(sin[k]){sin[k].value=String(Math.round(v*100));fill(sin[k]);}if(sout[k])sout[k].textContent=skyFmt(k,v);});}
  function skyBake(){clearTimeout(bakeT);bakeT=setTimeout(function(){try{bakeAstroPlates();}catch(e){}},110);}   /* debounce: bake plate tidak tiap geseran */
  function sectChanged(k){if(k!=='SPREAD')return;clearTimeout(tintT);tintT=setTimeout(function(){nebSTuneChanged(k);},120);}   /* debounce: hue di-bake ulang cuma setelah geseran berhenti */
  function skyChanged(k){
    nebTuneChanged(k);
    skyBake();
  }
  /* ---- tab Tele ---- */
  var TK=['spd','spin','size'],tin={},tout={},tBub=document.getElementById('bp-tele-bub'),tAuto=document.getElementById('bp-tele-auto'),tLeds=[].slice.call(panel.querySelectorAll('.bp-led'));
  TK.forEach(function(k){tin[k]=document.getElementById('tp-'+k);tout[k]=document.getElementById('tp-'+k+'-v');});
  function teleStored(){var o=null;try{o=JSON.parse(localStorage.getItem(TELE_CFG_KEY)||'null');}catch(e){}return teleCfgNorm(o);}
  function teleDirty(){var st=teleStored();if(st.bubble!==TELE_CFG.bubble||st.led!==TELE_CFG.led)return true;return TK.some(function(k){return Math.abs(st[k]-TELE_CFG[k])>.004;});}
  function teleBubbleOff(){   /* bubble yang lagi tampil ikut dimatikan */
    try{teleGreetHide();}catch(e){}
    var m=document.getElementById('secret-msg');if(m){clearTimeout(m._t);clearTimeout(m._type);m.classList.remove('on');}
  }
  function paintTele(){
    if(tBub){var bo=!!TELE_CFG.bubble;tBub.setAttribute('aria-pressed',bo?'true':'false');tBub.textContent=tx(bo?'tune.on':'tune.off',bo?'On':'Off');tBub.classList.toggle('off',!bo);}
    try{lisAutoSync();}catch(e){}
    tLeds.forEach(function(b,i){var on=i===TELE_CFG.led;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on?'true':'false');});
    TK.forEach(function(k){var el=tin[k];if(el){el.value=String(Math.round(TELE_CFG[k]*100));fill(el);}if(tout[k])tout[k].textContent=TELE_CFG[k].toFixed(2)+'\u00d7';});
  }
  /* ---- umum ---- */
  function paint(){
    if(sub)sub.textContent=cur==='pl'?tx('tune.sub.pl','Planet // Tune'):cur==='dr'?tx('tune.sub.dr','Drone // Tune'):cur==='pt'?tx('tune.sub.pt','Portal // Tune'):cur==='tele'?tx('tune.sub.tele','Telescope // Tune'):cur==='ast'?tx('tune.sub.ast','Asteroid // Tune'):cur==='sky'?(skySect()?T('tune.sub.skys'):T('tune.sub.sky')):(BHU_CTX?T('tune.sub.sect'):T('tune.sub.bh'));
    paintBH();paintSky();paintAst();paintTele();
    var d=false,st;
    if(typeof T3D!=='undefined'){if(T3D.has(cur)&&t3(cur))T3D.paint(cur);if(skyMw())T3D.paint('mw');}
    if(cur==='pl'||cur==='dr'||cur==='pt')d=t3(cur)&&T3D.dirty(cur);
    else if(cur==='sky'&&skyMw())d=T3D.dirty('mw');
    else if(cur==='bh'){st=stored();allKeys.forEach(function(k){if(Math.abs(st[k]-BHU[k])>.004)d=true;});}
    else if(cur==='ast')d=astDirty();
    else if(cur==='tele')d=teleDirty();
    else if(skyOv()){st=skyStored();SKYK.forEach(function(k){if(Math.abs(st[k]-NEB[k])>.004)d=true;});}
    else if(skySect()){st=secStored();SECK.forEach(function(k){if(Math.abs(st[k]-NEB[k])>.004)d=true;});}
    if(bSave)bSave.classList.toggle('dirty',d);
  }
  function t3(id){return typeof T3D!=='undefined'&&T3D.ok(id);}
  function mwOn(){return typeof mwReady==='function'&&mwReady();}   /* overview memakai Milky Way (bukan nebula lama) */
  function avail(){var c=body.classList,ov=c.contains('sect-ov'),sc=c.contains('sect-in'),any=ov||sc;return{bh:sc,sky:(ov&&(NEB.on||mwOn()))||(sc&&NEB.on),ast:any,tele:any,pl:any&&t3('pl'),dr:any&&t3('dr'),pt:any&&t3('pt')};}   /* Langit: overview (kabut/nebula/vinyet/halo portal) + di dalam sektor (setelan langit sektor) */
  function refresh(){   /* tab yang tersedia tergantung konteks: Gargantua = BH sedang tampil, Langit = overview */
    var a=avail();
    tabs.forEach(function(tb){tb.hidden=!a[tb.getAttribute('data-tab')];});
    if(!a[cur])cur=a.bh?'bh':(a.sky?'sky':(a.ast?'ast':(a.tele?'tele':cur)));
    tabs.forEach(function(tb){var on=tb.getAttribute('data-tab')===cur;tb.classList.toggle('on',on);tb.setAttribute('aria-selected',on?'true':'false');});
    Object.keys(pages).forEach(function(id){pages[id].hidden=(id!==cur);});
    var ov=skyOv();[].slice.call(panel.querySelectorAll('[data-ov]')).forEach(function(el){el.hidden=!ov;});
    var mwb=document.getElementById('t3-mw');if(mwb)mwb.hidden=!skyMw();
    var sc=skySect();[].slice.call(panel.querySelectorAll('[data-sc]')).forEach(function(el){el.hidden=!sc;});   /* baris khusus overview (halo portal) */
    panel.classList.toggle('empty',!(a.bh||a.sky||a.ast||a.tele||a.pl||a.dr||a.pt));   /* belum ada yang bisa di-tune (mis. saat boot): tampilkan keterangan, sembunyikan tab/slider */
    paint();
  }
  function open(on){
    var a=avail();on=!!on&&(a.bh||a.sky||a.ast||a.tele||a.pl||a.dr||a.pt);
    panel.classList.toggle('on',on);panel.setAttribute('aria-hidden',on?'false':'true');
    if(btn)btn.classList.toggle('on',on);if(btn)btn.setAttribute('aria-expanded',on?'true':'false');
    if(on)refresh();
  }
  bhuRepaint=paint;
  bhTuneSync=refresh;
  try{new MutationObserver(function(){if(panel.classList.contains('on'))refresh();}).observe(body,{attributes:true,attributeFilter:['class']});}catch(e){}
  if(btn)btn.addEventListener('click',function(e){e.stopPropagation();open(!panel.classList.contains('on'));haptic(6);});
  if(bClose)bClose.addEventListener('click',function(e){e.stopPropagation();open(false);});
  tabs.forEach(function(tb){tb.addEventListener('click',function(e){e.stopPropagation();var id=tb.getAttribute('data-tab');if(!avail()[id])return;cur=id;refresh();haptic(6);});});
  keys.forEach(function(k){
    if(!inp[k])return;
    inp[k].addEventListener('input',function(){BHU[k]=bhuClamp(k,inp[k].value/100);paint();});
  });
  SKYK.forEach(function(k){
    if(!sin[k])return;
    sin[k].addEventListener('input',function(){nebTuneApply(k,sin[k].value/100);skyChanged(k);paint();});
  });
  SECK.forEach(function(k){
    if(!sin[k])return;
    sin[k].addEventListener('input',function(){nebSTuneApply(k,sin[k].value/100);sectChanged(k);paint();});
  });
  if(tBub)tBub.addEventListener('click',function(e){e.stopPropagation();TELE_CFG.bubble=TELE_CFG.bubble?0:1;if(!TELE_CFG.bubble)teleBubbleOff();paint();haptic(6);});
  tLeds.forEach(function(b,i){b.addEventListener('click',function(e){e.stopPropagation();teleLedSet(i);paint();haptic(6);});});
  TK.forEach(function(k){
    if(!tin[k])return;
    tin[k].addEventListener('input',function(){TELE_CFG[k]=teleCfgClamp(k,tin[k].value/100);paint();});
  });
  if(astBtn)astBtn.addEventListener('click',function(e){e.stopPropagation();AST_CFG.on=AST_CFG.on?0:1;paint();haptic(6);});
  AK.forEach(function(k){
    if(!ain[k])return;
    ain[k].addEventListener('input',function(){
      AST_CFG[k]=astClamp(k,k==='n'?ain[k].value:ain[k].value/100);
      if(k==='n')astResize();
      paint();
    });
  });
  if(bSave)bSave.addEventListener('click',function(e){
    e.stopPropagation();
    if(cur==='pl'||cur==='dr'||cur==='pt'){
      if(t3(cur))T3D.save(cur);   /* T3D sendiri yang menulis localStorage + toast */
      paint();haptic(10);return;
    }
    if(cur==='sky'&&skyMw()){T3D.save('mw');paint();haptic(10);return;}
    if(cur==='tele'){
      try{localStorage.setItem(TELE_CFG_KEY,JSON.stringify(TELE_CFG));}catch(er){}
    }else if(cur==='ast'){
      try{localStorage.setItem('dumul_ast_cfg',JSON.stringify(AST_CFG));}catch(er){}
    }else if(cur==='sky'){
      if(skyOv()){var o={};SKYK.forEach(function(k){o[k]=NEB[k];});
        try{localStorage.setItem('dumul_sky_cfg',JSON.stringify(o));}catch(er){}}
      else if(skySect()){var o2={};SECK.forEach(function(k){o2[k]=NEB[k];});
        try{localStorage.setItem('dumul_sky_cfg_s',JSON.stringify(o2));}catch(er){}}
    }else{try{localStorage.setItem(bhuKey(),JSON.stringify(BHU));}catch(er){}}
    paint();haptic(10);
    try{if(typeof showModeToast==='function')showModeToast(cur==='tele'?tx('tune.saved.tele','TELESCOPE SETTINGS SAVED'):cur==='ast'?tx('tune.saved.ast','Asteroid saved'):cur==='sky'?(skySect()?T('tune.saved.skys'):T('tune.saved.sky')):T('tune.saved.bh'),null,1500);}catch(er){}
  });
  if(bReset)bReset.addEventListener('click',function(e){
    e.stopPropagation();
    if(cur==='pl'||cur==='dr'||cur==='pt'){if(t3(cur))T3D.reset(cur);paint();haptic(8);return;}
    if(cur==='sky'&&skyMw()){T3D.reset('mw');paint();haptic(8);return;}
    if(cur==='tele'){
      var dc=teleCfgDef();Object.keys(dc).forEach(function(k){TELE_CFG[k]=dc[k];});teleLedSet(dc.led);
      try{localStorage.removeItem(TELE_CFG_KEY);}catch(er){}
    }else if(cur==='ast'){
      AST_CFG=astNorm(null);astResize();
      try{localStorage.removeItem('dumul_ast_cfg');}catch(er){}
    }else if(cur==='sky'){
      if(skyOv()){
        SKYK.forEach(function(k){nebTuneApply(k,NEB_TUNE[k].def);nebTuneChanged(k);});
        try{localStorage.removeItem('dumul_sky_cfg');}catch(er){}
        skyBake();
      }else if(skySect()){
        SECK.forEach(function(k){nebSTuneApply(k,NEBS_TUNE[k].def);});
        nebSTuneChanged('SPREAD');
        try{localStorage.removeItem('dumul_sky_cfg_s');}catch(er){}
      }
    }else{
      allKeys.forEach(function(k){BHU[k]=bhuDef()[k];});
      try{localStorage.removeItem(bhuKey());}catch(er){}
    }
    paint();haptic(8);
  });
  panel.addEventListener('pointerdown',function(e){e.stopPropagation();});

  /* Scrub: saat geser slider, panel nyusut — cuma baris itu + angka, sky kelihatan di belakang */
  (function scrubMode(){
    var owl=document.getElementById('owl-panel'),back=document.getElementById('owl-backdrop');
    if(!panel||!owl)return;
    var active=null;
    function end(){
      if(!active)return;
      try{active.classList.remove('owl-scrub-row');}catch(e){}
      active=null;
      owl.classList.remove('owl-scrub');
      if(back)back.classList.remove('owl-scrub-bg');
    }
    function start(row){
      if(!row||!owl.classList.contains('on'))return;
      end();
      active=row;row.classList.add('owl-scrub-row');
      owl.classList.add('owl-scrub');
      if(back)back.classList.add('owl-scrub-bg');
    }
    /* delegasi: slider yang dibuat belakangan (T3D: planet / drone / portal / milky way) ikut dapat scrub */
    panel.addEventListener('pointerdown',function(e){
      var inp=e.target&&e.target.closest&&e.target.closest('input.bp-range');
      if(!inp)return;
      var row=inp.closest('.bp-row');if(row)start(row);
    },true);
    panel.addEventListener('pointerup',end);
    panel.addEventListener('pointercancel',end);
    panel.addEventListener('change',end);
    document.addEventListener('pointerup',function(){if(active)end();});
    document.addEventListener('pointercancel',function(){if(active)end();});
  })();

  /* Isolasi: sentuhan/scroll/klik di panel tidak boleh tembus ke langit, BH, asteroid, atau zoom kamera. */
  ['pointerup','click','touchstart','touchmove','wheel','contextmenu'].forEach(function(tp){
    panel.addEventListener(tp,function(e){e.stopPropagation();},{passive:true});
  });
  /* Tap di luar panel menutup (pola sama dengan panel music); tombol gear ditangani handler-nya sendiri. */
  /* Panel embedded in owl — close is owned by owl close / tab switch, not a floating outside-tap. */
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&panel.classList.contains('on')&&!document.body.classList.contains('owl-open'))open(false);});
  bhTuneClose=function(){if(panel.classList.contains('on'))open(false);};
  /* Embedded in owl: force visible while Tune tab active */
  window.__bhTuneShow=function(show){
    if(show){panel.classList.add('on');panel.setAttribute('aria-hidden','false');refresh();}
    else{panel.classList.remove('on');panel.setAttribute('aria-hidden','true');}
  };
  refresh();
})();

(function sectInit(){
  /* Fase 2: #mode-sectors diganti long-press BH mini — tombol disembunyikan CSS, handler tidak dipasang. */
  var bb=document.getElementById('mode-bh');
  if(bb)bb.addEventListener('click',function(){if(SECT.cur)smenuOpen();});   /* F10: tombol HUD = buka window menu sektor */
  try{sumUI();}catch(eU0){}
  sectSet(true);
  try{if(window.__hub)window.__hub.sect=SECT;}catch(e){}
  function owlShut(){var bc=document.body.classList;return bc.contains('owl-open')||bc.contains('owl-block')||bc.contains('smenu-open');}
  /* F6: tap ikon sektor dihapus (portal -> window menu sektor). Yang tersisa: sentuhan diabaikan selama animasi zoom sektor. */
  document.addEventListener('pointerdown',function(e){
    if(owlShut())return;
    if(SECT.busy&&!(e.target.closest&&e.target.closest('#mode-cluster')))e.stopPropagation();
  },true);
})();

/* ===== Lost-in-Space (LIS) =====
   Teleskop = "observer". Tiap pindah (portal masuk, tombol balik overview, shortcut BH / Sector Gate) kalau teleskop ada di tempat asal,
   muncul pilihan AJAK / TINGGAL. LIS.at = lokasi teleskop ('ov' atau SECT.k); LIS.last = lokasi pengamat saat terakhir mendarat.
   - Diajak, pindah biasa (portal / balik overview)  -> normal.
   - Diajak lewat Sector Gate + SFX bintang aktif     -> SFX putus, bubble teleskop, LED merah 5 dtk, kamera + Stellar Signal terkunci, layar glitch/grain.
   - Diajak lewat Sector Gate tanpa SFX               -> kamera terkunci 3 dtk (LED merah + indikator).
   - Ditinggal                                        -> tanpa teleskop: kamera + Stellar Signal terkunci, grain/glitch menetap, sampai balik ke tempat teleskop.
   BGM nggak disentuh. Status ini nggak disimpan (reload = teleskop ikut pengamat lagi). */
var LIS={at:'ov',last:'ov',cd:0,kind:'',pend:null,tm:0,iv:0,deny:0,ui:null,hud:null,fx:null,cb:null,wasGone:false,auto:false};
/* Mode "selalu ajak teleskop": panel ajak/tinggal dilewati, selalu dianggap AJAK. Disimpan; centang di panel ajak (pertama kali) dan di panel Tuning (untuk mematikan). */
try{LIS.auto=localStorage.getItem('dumul_lis_auto')==='1';}catch(eLA){}
function lisAutoSync(){var el=document.getElementById('bp-tele-auto');if(!el)return;var on=!!LIS.auto;el.setAttribute('aria-pressed',on?'true':'false');el.textContent=T(on?'tune.on':'tune.off');el.classList.toggle('off',!on);}   /* switch di tab Tele */
function lisAutoSet(on){LIS.auto=!!on;try{localStorage.setItem('dumul_lis_auto',LIS.auto?'1':'0');}catch(e){}lisAutoSync();}
(function(){var el=document.getElementById('bp-tele-auto');if(!el)return;lisAutoSync();el.addEventListener('click',function(e){e.stopPropagation();lisAutoSet(!LIS.auto);try{haptic(6);}catch(er){}});})();
function lisLoc(){return SECT.busy?null:(SECT.cur?SECT.cur.k:'ov');}
function lisGone(){var l=lisLoc();return l!==null&&LIS.at!==l;}
function lisBlock(kind){
  if(lisGone())return true;
  if(performance.now()<LIS.cd)return kind==='cam'||LIS.kind==='full';
  return false;
}
function lisRed(now){return now<LIS.cd;}
function lisWhere(k){
  if(k==='ov')return T('lis.where.ov');
  for(var i=0;i<SECT.list.length;i++)if(SECT.list[i].k===k)return T('lis.where.sec',{n:sgNum(SECT.list[i])});
  return String(k);
}
function lisToast(key,ms,vars){try{showModeToast(T(key,vars),null,ms||2600);}catch(e){}}
function lisDenied(kind){
  var n=performance.now();if(n-LIS.deny<900)return;LIS.deny=n;
  try{UIS.deny();}catch(eUD){}
  lisToast(lisGone()?(kind==='cam'?'lis.deny.cam.gone':'lis.deny.sig.gone'):'lis.deny.cd',2400);
  try{haptic(8);}catch(e){}
}
function lisEls(){
  if(LIS.ui)return;
  var d=document,b=d.body;
  LIS.fx=d.createElement('div');LIS.fx.id='lis-fx';LIS.fx.setAttribute('aria-hidden','true');b.appendChild(LIS.fx);
  LIS.hud=d.createElement('div');LIS.hud.id='lis-hud';LIS.hud.setAttribute('aria-live','polite');b.appendChild(LIS.hud);
  var a=LIS.ui=d.createElement('div');a.id='lis-ask';a.setAttribute('role','dialog');a.hidden=true;
  a.innerHTML='<div class="la-q"></div><div class="la-b"><button type="button" data-a="bring"></button><button type="button" data-a="leave"></button></div><label class="la-c"><input type="checkbox" data-c="auto"><span class="la-ct"></span></label>';
  b.appendChild(a);
  /* Isolasi penuh: panel ajak/tinggal tidak tembus ke sky/BH/gate/tele */
  ['pointerdown','pointerup','pointermove','click','touchstart','touchmove','touchend','wheel','contextmenu'].forEach(function(tp){
    a.addEventListener(tp,function(e){e.stopPropagation();},{passive:false,capture:true});
  });
  a.addEventListener('click',function(e){
    var btn=e.target.closest&&e.target.closest('button[data-a]');
    if(!btn)return;   /* centang "selalu ajak" (label/checkbox): biarkan default toggle jalan */
    e.preventDefault();e.stopPropagation();
    lisChoose(btn.getAttribute('data-a')==='bring');
  },true);
  d.addEventListener('pointerdown',function(e){
    if(a.hidden)return;
    if(a.contains(e.target)){e.stopPropagation();return;}
    lisCancel();
  },true);
  d.addEventListener('keydown',function(e){if(e.key==='Escape'&&!a.hidden)lisCancel();});
}
function lisCancel(){if(LIS.ui)LIS.ui.hidden=true;LIS.cb=null;document.body.classList.remove('lis-asking');}
function lisAsk(cb,gate){
  var sfxOn=!!(activeSfx&&!activeSfx.paused&&!activeSfx.ended);
  if(!LIS.ui)lisEls();
  if(lisGone()){LIS.pend={carry:false,gate:!!gate,sfx:sfxOn,t:performance.now()};cb();return;}   /* teleskop memang nggak di sini: nggak ada yang ditanya */
  if(LIS.auto){LIS.pend={carry:true,gate:!!gate,sfx:sfxOn,t:performance.now()};cb();return;}   /* selalu ajak: tanpa panel */
  var a=LIS.ui;
  a.querySelector('.la-ct').textContent=T('lis.auto');
  a.querySelector('input[data-c=auto]').checked=false;
  a.querySelector('.la-q').textContent=T('lis.ask.q');
  a.querySelector('[data-a=bring]').textContent=T('lis.ask.bring');
  a.querySelector('[data-a=leave]').textContent=T('lis.ask.leave');
  LIS.cb={fn:cb,gate:!!gate,sfx:sfxOn};a.hidden=false;document.body.classList.add('lis-asking');try{UIS.pop('ask');}catch(eUP){}
}
function lisChoose(carry){
  var c=LIS.cb;LIS.cb=null;if(LIS.ui)LIS.ui.hidden=true;document.body.classList.remove('lis-asking');if(!c)return;
  LIS.pend={carry:!!carry,gate:c.gate,sfx:c.sfx,t:performance.now()};
  try{haptic(8);}catch(e){}
  try{var ck=LIS.ui&&LIS.ui.querySelector('input[data-c=auto]');if(carry&&ck&&ck.checked){lisAutoSet(true);lisToast('lis.auto.on',3200);}}catch(eC){}   /* centang cuma berlaku untuk AJAK */
  c.fn();
}
/* F5: versi tanpa panel dari lisAsk/lisChoose. Pilihan ajak/tinggal sudah diputuskan di window menu sektor (16-sector-menu.js), jadi di sini cuma mencatat LIS.pend lalu cb().
   carry = toggle "Ajak teleskop"; always = centang "Selalu ajak" (true/false), undefined = jangan sentuh. Hanya AJAK yang boleh menyalakan lisAutoSet(true); mematikan lewat centang boleh (centang memang mencerminkan LIS.auto).
   haptic(8) milik lisChoose sudah diwakili haptic tombol MASUK di smenuEnter. lisEls() tetap dipanggil: HUD/FX teleskop (lisStart/lisArrive) dibuat di situ, bukan oleh panel. */
function lisDecide(cb,gate,carry,always){
  var sfxOn=!!(activeSfx&&!activeSfx.paused&&!activeSfx.ended),c;
  if(!LIS.ui)lisEls();
  if(lisGone()){LIS.pend={carry:false,gate:!!gate,sfx:sfxOn,t:performance.now()};cb();return;}   /* teleskop memang nggak di sini: toggle disembunyikan di window, lompat tanpa teleskop */
  c=!!carry;
  LIS.pend={carry:c,gate:!!gate,sfx:sfxOn,t:performance.now()};
  if(c&&always===true&&!LIS.auto){lisAutoSet(true);lisToast('lis.auto.on',3200);}
  else if(c&&always===false&&LIS.auto)lisAutoSet(false);
  cb();
}
function lisStopSfx(){   /* SFX bintang memudar lalu mati (BGM tidak disentuh) */
  var a=activeSfx;if(!a)return;
  a.onended=null;var v0=a.volume||.85,n=0,iv=setInterval(function(){
    n++;try{a.volume=Math.max(0,v0*(1-n/8));}catch(e){}
    if(n>=8){clearInterval(iv);try{safeReset(a);a.volume=a._bv||.85;}catch(e2){}}
  },110);
  if(activeSfx===a){activeSfx=null;try{setAVColor(null,false);audioVizOff();tdRelease();}catch(e3){}}
}
function lisHud(){
  var h=LIS.hud;if(!h)return;var now=performance.now(),cls=document.body.classList;
  if(now<LIS.cd){
    h.textContent=T(LIS.kind==='full'?'lis.hud.full':'lis.hud.cam')+' · '+Math.max(0,(LIS.cd-now)/1000).toFixed(1)+'s';
    h.className='on red';
  }else if(lisGone()||(SECT.busy&&LIS.at!==LIS.last)){
    h.textContent=T('lis.hud.gone',{w:lisWhere(LIS.at)});h.className='on';
  }else h.className='';
}
function lisEnd(){
  clearTimeout(LIS.tm);clearInterval(LIS.iv);LIS.iv=0;
  var full=LIS.kind==='full';LIS.cd=0;LIS.kind='';
  document.body.classList.remove('lis-burst');
  lisHud();
  if(lisGone())return;
  lisToast('lis.toast.done',2600);
  if(full){try{TG.anchor=null;tgShow(T('lis.bub.done'));}catch(e){}}
}
function lisStart(full){
  var ms=full?5000:3000;
  clearTimeout(LIS.tm);clearInterval(LIS.iv);
  LIS.cd=performance.now()+ms;LIS.kind=full?'full':'cam';
  try{UIS.noise(ms,full);}catch(eUN){}
  try{if(CAMERA_MODE)setCameraMode(false);}catch(e){}
  if(full){
    /* Star tracker: JANGAN putus SFX total — muffle selama LIS.cd; user long-press tele → receiver. */
    document.body.classList.add('lis-burst');
    lisToast('lis.toast.full',3200);
    try{TG.anchor=null;tgShow(T('lis.bub.start'));}catch(e2){}
    setTimeout(function(){
      /* Cek ulang state SAAT toast mau muncul (bukan saat lisStart dipanggil): lompat gate antar sektor yang sudah interlocking
         nggak boleh menyuruh dock/sambung lagi — TX/receiver tidak di-reset oleh star tracker, jadi kalau sektor ini sudah terpasang, diam.
         Sektor sumber yang belum dock → petunjuk dock drone (bukan receiver). */
      try{
        if(typeof showModeToast!=='function'||!SECT.cur||lisGone())return;
        var X=SECT.cur;
        if(typeof txOn==='function'&&txOn(X))return;
        var isSrc=(typeof sfxSector==='function'&&sfxSector()===X);
        showModeToast(T(!X.drn?'toast.tx.tip':(isSrc?'toast.tx.tipdock':'toast.tx.tiprecv')),'tip',4200);   /* belum ada drone: panggil dulu (tahan teleskop); sudah ada: tahan drone */
      }catch(e3){}
    },900);
  }else lisToast('lis.toast.cam',2600);
  LIS.tm=setTimeout(lisEnd,ms+30);LIS.iv=setInterval(lisHud,100);lisHud();
}
function lisArrive(dest){   /* dipanggil sekali per pendaratan akhir (bukan overview perantara Sector Gate) */
  lisEls();
  var p=LIS.pend;LIS.pend=null;if(p&&performance.now()-p.t>9000)p=null;
  var from=LIS.last;LIS.last=dest;
  var had=(LIS.at===from);
  if(had&&(!p||p.carry))LIS.at=dest;
  var here=(LIS.at===dest),body=document.body.classList;
  if(!here){
    body.add('lis-gone');
    try{if(CAMERA_MODE)setCameraMode(false);}catch(e){}
    lisStopSfx();
    lisToast(had?'lis.toast.left':'lis.toast.noobs',3600,{w:lisWhere(LIS.at)});
    LIS.wasGone=true;lisHud();return;
  }
  body.remove('lis-gone');
  if(LIS.wasGone){LIS.wasGone=false;lisToast('lis.toast.back',2800);lisHud();return;}
  if(p&&p.gate&&p.carry&&had)lisStart(!!p.sfx);   /* lompat antar sector bawa teleskop: star tracker kehilangan orientasi */
  else lisHud();
}

/* ===== Sector Gate (pensiun, F6) =====
   Cincin ikon sektor di sekeliling portal sudah diganti window menu sektor (16-sector-menu.js). Yang tersisa dipakai jalur lompat:
   SGATE.pend = sektor tujuan yang dilanjutkan sectZoomIn setelah zoom-out sektor ke overview; SGATE.tunnelUntil = muffle terowongan (01-core, 09-wormhole). */
var SGATE={pend:null,tunnelUntil:0};
function sgNum(s){return String((s&&(s.name||s.k))||'').toUpperCase();}   /* nama sektor (WINTER/SPRING/SUMMER/AUTUMN) untuk toast lompat + lis.where */
/* Menu sektor (16-sector-menu.js) memanggil ini setelah window menutup. F5: pilihan ajak/tinggal teleskop sudah ditanam di window (carry/always), diteruskan ke lisDecide; lisAsk tidak dipakai jalur ini lagi.
   Dari sektor: jalur sektor ke sektor (tujuan harus kuning = s.drn). Dari overview (F2): WORMHOLE.gate dari cincin portal overview, sectZoomIn jalan di bawah terowongan saat layar tertutup; tanpa wormhole (reduce-motion dll) = sectZoomIn biasa. */
function sectJumpTo(s,carry,always){
  if(!s||SECT.busy||SW||whBusy()||!s.ids||!s.ids.length)return false;
  if(SECT.cur){
    if(s===SECT.cur)return false;
    lisDecide(function(){
      if(SECT.busy||whBusy()||!SECT.cur||s===SECT.cur)return;
      SGATE.pend=s;
      /* Tunnel side-effect: selalu muffle 2 dtk; lanjut muffle jika tujuan belum dock/summon siap */
      SGATE.tunnelUntil=performance.now()+2000;
      try{showModeToast(T('toast.jump',{s:sgNum(s)}),null,1500);}catch(e){}
      var wa=wormAnchor();   /* posisi mulut SEBELUM sectZoomOut (sectApply menggeser kamera) */
      haptic(12);
      var runOut=function(){sectZoomOut();if(!SECT.busy)SGATE.pend=null;};   /* dipanggil saat layar sudah tertutup terowongan (zoom-in ke portal) */
      var okG=false;
      try{if(typeof WORMHOLE!=='undefined')okG=!!WORMHOLE.gate(s,wa.pos,wa.R,runOut);}catch(eW){}
      if(!okG)runOut();
    },true,carry,always);
    return true;
  }
  lisDecide(function(){
    if(SECT.busy||SW||whBusy()||SECT.cur)return;
    /* pusat + radius cincin overview: PT3D.ovR langsung (ptOvR() basi >1200 ms kalau sky sempat berhenti menggambar); cadangan = horizon BH x ovK */
    var bp=(typeof ptOvPos==='function')?ptOvPos():camBH(),R=(typeof PT3D!=='undefined'&&PT3D.ovR>2)?PT3D.ovR:0;   /* P4: mulut wormhole di titik portal yang sedang mengorbit (orbit dibekukan selama transisi) */
    if(!(R>2)){try{R=BH.R*ptOvK();}catch(eR){R=0;}}
    var okO=false;
    try{if(typeof WORMHOLE!=='undefined')okO=!!WORMHOLE.gate(s,[bp[0],bp[1]],R,function(){sectZoomIn(s);});}catch(eW){}
    if(!okO)sectZoomIn(s);
  },false,carry,always);
  return true;
}

/* ---------- PROBE PERFORMA (aktif hanya dengan ?perf=1 atau localStorage dumul_perf=1) ----------
   Ukur: interval antar frame (rAF) vs waktu JS per frame + waktu per tahap. Kalau interval besar tapi JS kecil =>
   beban ada di GPU/compositor, bukan di JS. Titik jank mencatat konteks: panel terbuka? SFX main? mode sektor? */
var PX={sky:0,lines:0,stars:0,pulse:0,ast:0,hole:0,all:0,pa:0,pw:0,pb:0,slow:0};   /* saklar diagnosa (diubah dengan ketuk overlay); semua 0/1 = normal */
var PX_MODES=['normal','panel HIDDEN','asteroid OFF','bintang OFF','SEMUA OFF (loop kosong)'];
/* override style inline pada #music-player untuk diagnosa biaya render panel (dikembalikan ke '' tiap ganti mode) */
var PX_PANEL={'panel HIDDEN':{visibility:'hidden'},'panel OPAQUE':{background:'#040a10'},'panel NO-CLIP':{overflow:'visible',contain:'none',borderRadius:'0'},'panel NO-WILLCHANGE':{willChange:'auto'},'panel NO-SHADOW':{boxShadow:'none'}};
var PERF=false;try{PERF=/[?&]perf=1(&|$)/.test(location.search)||localStorage.getItem('dumul_perf')==='1';}catch(ePf){}
var PP={fs:0,t0:0,last:0,cur:{},tot:{},n:0,isum:0,jsum:0,jank:0,ev:[],el:null,upd:0,pnl:null,imax:0};
function pmk(n){if(!PERF)return;var t=performance.now();PP.cur[n]=(PP.cur[n]||0)+(t-PP.t0);PP.t0=t;}
function pBegin(){if(!PERF)return;PP.fs=PP.t0=performance.now();PP.cur={};AST_DRAWN=0;}
function pEnd(now){
  if(!PERF)return;
  pmk('end');
  var js=performance.now()-PP.fs,iv=PP.last?now-PP.last:0;PP.last=now;PP.ad=AST_DRAWN;
  if(iv>0&&iv<1000){
    PP.n++;PP.isum+=iv;PP.jsum+=js;if(iv>PP.imax)PP.imax=iv;
    for(var k in PP.cur)PP.tot[k]=(PP.tot[k]||0)+PP.cur[k];
    if(iv>34){
      PP.jank++;
      var top='',tv=0;for(var k2 in PP.cur)if(PP.cur[k2]>tv){tv=PP.cur[k2];top=k2;}
      var pn=PP.pnl||(PP.pnl=document.getElementById('music-player'));
      PP.ev.push((iv|0)+'ms js'+(js|0)+' '+top+(tv|0)+' '+(pn&&pn.classList.contains('open')?'PANEL ':'')+(activeSfx&&!activeSfx.paused?'SFX ':'')+(SECT.on?'OVW':'SEC'));
      if(PP.ev.length>6)PP.ev.shift();
    }
  }
  if(now-PP.upd>700){
    PP.upd=now;
    if(!PP.el){var d=document.createElement('pre');d.style.cssText='position:fixed;left:4px;top:calc(4px + env(safe-area-inset-top,0px));z-index:99999;margin:0;padding:4px 6px;font:9px/1.25 monospace;color:#9ff;background:rgba(0,0,0,.72);pointer-events:auto;white-space:pre';document.body.appendChild(d);PP.el=d;PP.mode=0;
      d.addEventListener('click',function(){
        PP.mode=(PP.mode+1)%PX_MODES.length;var m=PP.mode;
        var nm=PX_MODES[m];
        PX.pa=nm==='panel anim OFF'?1:0;PX.pw=nm==='wave OFF'?1:0;PX.pb=nm==='bars OFF'?1:0;PX.slow=nm==='panel anim ~8fps'?1:0;PX.sky=nm==='langit OFF'?1:0;PX.lines=nm==='garis rasi OFF'?1:0;PX.stars=nm==='bintang OFF'?1:0;PX.pulse=nm==='pulse+TX OFF'?1:0;PX.ast=nm==='asteroid OFF'?1:0;PX.hole=nm==='lubang hitam OFF'?1:0;PX.all=nm.indexOf('SEMUA')===0?1:0;
        var mpn=document.getElementById('music-player');
        if(mpn){for(var pk in PX_PANEL)for(var pp in PX_PANEL[pk])mpn.style[pp]='';var ov=PX_PANEL[nm];if(ov)for(var pp2 in ov)mpn.style[pp2]=ov[pp2];}
        PP.n=PP.isum=PP.jsum=PP.jank=PP.imax=0;PP.tot={};PP.ev=[];
      },true);}
    var n=PP.n||1,arr=[];for(var k3 in PP.tot)arr.push([k3,PP.tot[k3]/n]);arr.sort(function(a,b){return b[1]-a[1];});
    var tx='['+PX_MODES[PP.mode|0]+'] ketuk=ganti\nfps '+(1000/(PP.isum/n)).toFixed(0)+'  int '+(PP.isum/n).toFixed(1)+'ms (max '+(PP.imax|0)+')  js '+(PP.jsum/n).toFixed(1)+'ms\njank>34ms: '+PP.jank+'/'+PP.n+'\n';
    for(var i=0;i<Math.min(6,arr.length);i++)tx+=arr[i][0]+' '+arr[i][1].toFixed(2)+'\n';
    var av=0;for(var ai2=0;ai2<AST.length;ai2++)if(AST[ai2]._vis)av++;
    tx+='batu: gambar '+(PP.ad|0)+' / _vis '+av+' / total '+AST.length+'\n';
    tx+=PP.ev.join('\n');
    PP.el.textContent=tx;
    if(PP.n>240){PP.n=PP.isum=PP.jsum=PP.jank=PP.imax=0;PP.tot={};PP.ev=[];}   /* jendela bergulir ~4 dtk */
  }
}

function frame(now){
  /* Capture generation at entry. If a watchdog/visibility restart bumped
     renderGeneration while this callback was already queued, bail out so
     we never run two concurrent loops. */
  var gen=renderGeneration;
  renderRAF=0;
  if(pageHidden||gen!==renderGeneration)return;
  /* The whole frame is now one safety net: whatever throws, wherever, the
     loop always reschedules itself in the finally block below. A single
     bad frame can no longer freeze the page until a manual reload - at
     worst you lose one frame and the next one recovers. */
  try{
    pBegin();
    if(PX.all){resetCanvasState();g.clearRect(0,0,W,H);pmk('kosong');lastFrameOK=now;pEnd(now);return;}   /* diagnosa: loop jalan, tidak ada gambar sama sekali */
    var age=reduce?99:(now-START)/1000;
    ARV=1;try{if(typeof WORMHOLE!=='undefined'&&WORMHOLE.arrive)ARV=WORMHOLE.arrive();}catch(eAR){}   /* BH overview mendekat dari ujung terowongan */
    mouse.x+=(mouse.tx-mouse.x)*.05;mouse.y+=(mouse.ty-mouse.y)*.05;
    updateAudioViz(now);pmk('audioViz');
    ofxSafe(ofxUpdate,now);
    updateConstellationFocus(now);
    updateTimeDilation(now);pmk('updates');
    if(hoverDirty&&mouse.px!=null&&!drag.on&&!SECT.on&&(now-lastHoverAt)>=HOVER_MIN_MS){
      updateHover(mouse.px,mouse.py);
      hoverDirty=false;lastHoverAt=now;
    }
    bhScaleStep();
    if(!drag.on&&SECT.cur&&!SECT.on&&(skyZoom||1)<=1.02&&typeof planetBhClamp==='function'){   /* planet: BH mini yang kebetulan di balik limb (parkir awal, resize, crossfade geometri) ditarik halus naik; sama dgn clamp drag */
      var bm0=BH.R*BHSC*Math.max(1,bhSizeMul()),pc0=planetBhClamp(BH.x,BH.y,bm0);
      if(pc0[0]!==BH.x||pc0[1]!==BH.y){BH.x+=(pc0[0]-BH.x)*.12;BH.y+=(pc0[1]-BH.y)*.12;}
    }
    if(!drag.on&&!SECT.cur&&(Math.abs(BH.x-BH.hx)>.05||Math.abs(BH.y-BH.hy)>.05)){
      BH.x+=(BH.hx-BH.x)*.065;BH.y+=(BH.hy-BH.y)*.065;
    }
    focusStep();
    /* Sky pan + rot springback when fingers are up.
       Disabled in Constellation Camera so the observer can explore freely. */
    if(!CAMERA_MODE&&!SECT.busy&&!BELT&&!skyDrag.on&&!skyRotDrag.on&&!skyPinch.on){   /* F4: !BELT = springback tidak melawan pan menuju Alnilam */
      if(skyPan.x*skyPan.x+skyPan.y*skyPan.y>0.25){
        skyPan.x+=-skyPan.x*.065;skyPan.y+=-skyPan.y*.065;
        if(skyPan.x*skyPan.x+skyPan.y*skyPan.y<0.25){skyPan.x=0;skyPan.y=0;}
        syncSkyPanHits();
      }
      if(skyRot*skyRot>1e-6){
        skyRot+=-skyRot*.065;
        if(skyRot*skyRot<1e-6)skyRot=0;
        syncSkyPanHits();
      }
    }
    pmk('logic');
    if(typeof smenuFrozen==='function'&&smenuFrozen()){   /* F4: window menu sektor (16) terbuka penuh: kanvas sky DIBEKUKAN (gambar terakhir tetap, ketutup backdrop), cuma state yang jalan. Ini sumber penghematan utama menu. */
      sectStep(now);   /* transisi sektor (state murni) */
      if(SECT.on)drawSectorOverview(now,age);   /* tetap hitung s.bx/by + s.gx/gy (sectZoomIn, muffle audio di 01-core spatialTargetBase) */
      updateClockDilation(now);
      pmk('frozen');lastFrameOK=now;pEnd(now);return;   /* lastFrameOK wajib: watchdog di bawah membatalkan loop kalau 1,5 dtk tanpa frame */
    }
    resetCanvasState();
    g.clearRect(0,0,W,H);
    if(bgCanvas&&!PX.sky){
      // 1. Warna dasar ruang angkasa agar pinggiran layar tidak bocor saat background bergeser
      g.fillStyle='#050b12';
      g.fillRect(0,0,W,H);

      // 2. Astrophotography plate: 2 layer offscreen, hanya drawImage + offset parallax per frame.
      //    Deep (debu/galaksi) bergeser & zoom lebih lambat daripada mid (bintang) => kedalaman.
      var pM=plateM,pW=W+2*pM,pH=H+2*pM;
      var pmx=0,pmy=0;
      var mwA=mwAlpha(now),mwK=1-mwA;   /* overview: Milky Way berputar menggantikan plateDeep + bgCanvas (fade lewat bobot); di sektor mwA=0 -> jalur lama utuh */
      if(mwK<1)g.globalAlpha=mwK;
      if(plateDeep&&mwK>.01)plateBlit(plateDeep,pM,pW,pH,1+(skyZoom-1)*.55,skyPan.x*.14+pmx*4,skyPan.y*.14+pmy*3);
      /* Drifting dust depth layers (static when prefers-reduced-motion). */
      for(var dli=0;dli<plateDust.length&&mwK>.01;dli++){
        var dl=plateDust[dli],dt2=reduce?0:now*.001,
            ddx=(reduce||SKY_DRIFT<=0)?0:Math.sin(dt2*6.2832/dl.per+dl.ph)*dl.amp*SKY_DRIFT,
            ddy=(reduce||SKY_DRIFT<=0)?0:Math.cos(dt2*6.2832/(dl.per*1.37)+dl.ph)*dl.amp*.6*SKY_DRIFT;
        if(STG.rot){var ua=upAng(),uc=Math.cos(ua),us=Math.sin(ua),tx=ddx*uc-ddy*us;ddy=ddx*us+ddy*uc;ddx=tx;}   /* landscape ROT: lintasan melayang searah layar, bukan searah stage yang diputar */
        plateBlit(dl.c,pM,pW,pH,1+(skyZoom-1)*dl.zf,skyPan.x*dl.par+ddx,skyPan.y*dl.par+ddy);
      }
      g.globalAlpha=1;
      if(mwA>.01)mwDraw(now,mwA);
      sectDrawSky();   /* warna langit per sektor (data: SECTORS[].sky di sky-data.js) */
      if(mwK<1)g.globalAlpha=mwK;
      if(mwK>.01&&!bgEmpty)plateBlit(bgCanvas,pM,pW,pH,skyZoom,skyPan.x*.35+pmx*10,skyPan.y*.35+pmy*7);
      g.globalAlpha=1;
      /* Grid RA/Dec: canvas terpisah, cuma di mode cam; param blit persis sama dgn bgCanvas */
      if(CAMERA_MODE){
        ensureCamGrid();
        if(gridCanvas)plateBlit(gridCanvas,pM,pW,pH,skyZoom,skyPan.x*.35+pmx*10,skyPan.y*.35+pmy*7);
      }
      drawHud();
    }
    pmk('sky');
    bandDimDraw();   /* filter UV/IR: redam latar cahaya-tampak (04-render.js) */
    if(!PX.sky)ofxSafe(ofxDrawTint,now); /* langit bergeser warna mengikuti BGM */
    drawFloatingTelescope(now);
    var msgEl=frame._m||(frame._m=$('#secret-msg'));
    if(msgEl&&msgEl.classList.contains('on')&&msgEl.dataset.type==='telescope')placeSecretMsg();
    teleGreetFollow();
    updateClockDilation(now);
    pmk('tint+tele');
    drawShooting(now);
    try{drawAsteroids(now,-1);}catch(err){window.__hub.renderError='drawAsteroidsBack: '+(err&&err.message||err);} /* separuh belakang: di belakang Rasi & BH */
    pmk('shoot+astB');
    cullBegin();
    sectStep(now);
    if(SECT.on){if(PU.length)PU.length=0;drawSectorOverview(now,age);try{if(typeof drawTxLines==='function')drawTxLines(now);}catch(eTx){}}
    else{
    if(!PX.lines)CONS.forEach(function(c){if(sectShow(c.id))drawCons(c,age,now);});
    if(!PX.pulse)drawPulses(now,age);
    if(!PX.stars){CONS.forEach(function(c){if(sectShow(c.id))drawStars(c,age,now);});
    if(sectShow('pleiades'))drawPleiades(age,now);}
    try{if(!PX.pulse&&typeof drawTxLines==='function')drawTxLines(now);}catch(eTx2){}
    }
    pmk('cons+stars');
    drawTriggerVisuals(now);
    ofxSafe(ofxDrawAvail,now);
    drawFocusFx(now);
    drawSupernovaBursts(now);
    if(BELT)drawBeltFx(now);   /* F4: supernova Alnilam + zoom ke sabuk Orion */
    ofxSafe(ofxDrawDust,now);

    // RENDER EFEK KOSMIK BARU:
    pmk('fx');
    drawBHShockwaves(now);
    drawTargetLock(now);

    /* Isolate late-stage canvas effects so one mobile/WebView compatibility
       issue cannot abort the frame before Gargantua is rendered. */
    pmk('warp');
    try{drawPortals(age,now);}catch(err){window.__hub.renderError='drawPortals: '+(err&&err.message||err);}
    pmk('portals');
    if(!PX.hole)drawHoleSafe(now,age);pmk('hole+viz');
    try{drawAsteroids(now,1);}catch(err){window.__hub.renderError='drawAsteroids: '+(err&&err.message||err);} /* seluruh orbit asteroid (separuh depan juga) di BELAKANG planet: digambar sebelum planet3dDraw, jadi permukaan planet menutupinya */
    try{drawFloatingTelescopeTop(now);}catch(err){window.__hub.renderError='teleTop: '+(err&&err.message||err);}   /* teleskop 3D: lapisan paling atas (di atas rasi, bintang, garis, portal, BH, drone) */
    try{if(typeof planet3dDraw==='function')planet3dDraw(now);}catch(err){window.__hub.renderError='planet3d: '+(err&&err.message||err);}   /* permukaan planet (17-planet3d.js): di atas rasi/BH/drone/portal/teleskop, di bawah asteroid depan + HUD */
    try{if(typeof drawTxTop==='function')drawTxTop(now);}catch(eTx3){}   /* drone TX/RX: SETELAH planet (berdiri di permukaan), di atas Gargantua/reticle, di bawah asteroid depan */
    pmk('planet');
    pmk('astFront');
    drawSectFlash(now);
    try{sectorScanUpdate(now);}catch(err){window.__hub.renderError='sectorScan: '+(err&&err.message||err);}
    pmk('tail');
    lastFrameOK=now;
    pEnd(now);
  }catch(err){
    window.__hub.renderError='frame: '+(err&&err.message||err);
    /* If a burst or particle state caused this, clearing it is safer than
       repeating the same crash every frame forever. */
    PU.length=0;SN_BURSTS.length=0;
    try{resetCanvasState();}catch(e2){}
  }finally{
    /* Only reschedule if this generation is still current and the tab is
       visible. Stale RAF callbacks (after watchdog cancel + restart) exit
       without queuing another frame. */
    if(!pageHidden&&gen===renderGeneration){
      renderRAF=requestAnimationFrame(frame);
    }else{
      renderRAF=0;
    }
  }
}

function startRenderLoop(){
  if(pageHidden||renderRAF||!bootDone)return;
  lastFrameOK=performance.now();
  renderRAF=requestAnimationFrame(frame);
  if(window.__hub)window.__hub.ready=true;
}
/* Watchdog: if no frame completed for 1.5s, cancel any pending RAF and
   bump generation so a stale callback cannot re-arm a second loop. */
setInterval(function(){
  if(pageHidden||!bootDone)return;
  if(performance.now()-lastFrameOK>1500){
    try{buildSprite();}catch(e){}
    if(renderRAF){cancelAnimationFrame(renderRAF);renderRAF=0;}
    renderGeneration++;
    startRenderLoop();
  }
},1000);

/* Stop only the visual render loop when the tab/page is hidden.
   Audio is intentionally NOT paused: the browser may choose to suspend
   background media on its own, but this page never calls pause() here.
   On resume, shift every absolute performance.now()-based deadline/timestamp
   by the hidden duration so transient FX (shockwaves,
   particles, cooldowns, telescope schedule) pick up where they left off. */
document.addEventListener('visibilitychange',function(){
  var now=performance.now();
  pageHidden=!!document.hidden;
  if(pageHidden){
    hiddenAt=now;
    if(renderRAF){cancelAnimationFrame(renderRAF);renderRAF=0;}
    renderGeneration++;
    return;
  }
  var pause=hiddenAt?Math.max(0,now-hiddenAt):0;
  if(pause){
    /* Core animation clock + swallow transition */
    START+=pause;
    if(SW)SW.t0+=pause;

    /* Particle / pulse / supernova burst timestamps */
    for(var i=0;i<PU.length;i++)PU[i].t+=pause;
    for(var j=0;j<SN_BURSTS.length;j++)SN_BURSTS[j].t+=pause;
    for(var k=0;k<SS.length;k++)SS[k].t+=pause;

    /* Transient FX introduced later: gravitational shockwaves */
    if(typeof BH_SHOCKWAVES!=='undefined'){
      for(var bi=0;bi<BH_SHOCKWAVES.length;bi++)BH_SHOCKWAVES[bi].t0+=pause;
    }

    /* Absolute "until / next" deadlines */
    if(glitchUntil)glitchUntil+=pause;
    if(tapFlash&&tapFlash.until)tapFlash.until+=pause;
    if(typeof lastSignalGlowUntil!=='undefined'&&lastSignalGlowUntil)lastSignalGlowUntil+=pause;
    if(nextSS)nextSS+=pause;
    if(nextPU)nextPU+=pause;
    if(typeof TELESCOPE!=='undefined'){
      if(TELESCOPE.next)TELESCOPE.next+=pause;
      if(TELESCOPE.last)TELESCOPE.last+=pause;
    }

    /* Asteroid scatter spring: keep kick window + integration clock aligned */
    if(typeof AST!=='undefined'){
      for(var ai=0;ai<AST.length;ai++){
        if(AST[ai].kickUntil)AST[ai].kickUntil+=pause;
        if(AST[ai]._lastNow)AST[ai]._lastNow+=pause;
      }
    }

    /* Supernova per-star cooldown map */
    if(typeof SN_COOLDOWN!=='undefined'){
      for(var ck in SN_COOLDOWN){
        if(Object.prototype.hasOwnProperty.call(SN_COOLDOWN,ck))SN_COOLDOWN[ck]+=pause;
      }
    }

    /* Audio-viz beat/glitch windows (visual only; playback continues) */
    if(typeof AV!=='undefined'){
      if(AV.glitchUntil)AV.glitchUntil+=pause;
      if(AV.lastBeatT)AV.lastBeatT+=pause;
    }

    /* Delta-time baselines so first visible frame does not jump */
    if(typeof CF!=='undefined'&&CF.lastNow)CF.lastNow+=pause;
    if(lastHoverAt)lastHoverAt+=pause;
    if(lastActivity)lastActivity+=pause;
    if(lastFrameOK)lastFrameOK+=pause;
  }
  hiddenAt=0;
  if(typeof unlockAudioGraph==='function')unlockAudioGraph();
  startRenderLoop();
});

var SN_COOLDOWN={};
/* ---------- toggle spectrum visualizer Gargantua (markup #mp-av-toggle ada di index.html) ---------- */
(function(){
  var b=document.getElementById('mp-av-toggle');if(!b)return;
  function sync(){b.setAttribute('aria-checked',AV_ON?'true':'false');}
  b.addEventListener('click',function(e){
    e.stopPropagation();AV_ON=!AV_ON;sync();
    try{localStorage.setItem('dumul_av_on',AV_ON?'1':'0');}catch(er){}
  });
  sync();
})();

/* ---------- mini music player + fake spectrum ----------
   When the HUD is open and a track plays: spectrum sits beside the track name.
   When the HUD is closed while music still plays: spectrum moves into the
   music-toggle logo (note icon hides, bars take its place). */
(function(){
  var panel=$('#music-player'),toggle=$('#music-toggle'),close=$('#music-close'),playBtn=$('#music-play');
  var nowEl=$('#mp-now-playing');
  if(!panel||!toggle||!close||!playBtn)return;

  /* Daftar track dibangun dari registry (sky-data.js -> SKY.panelGroups): SEMUA SFX selalu ada di panel (relay butuh itu),
     dikelompokkan accordion per sektor, lalu BGM. Urutan `tracks` = urutan baris DOM (kontrak: index = index baris). */
  var tracks=[],SPEC='<span class="mp-spec" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span><span class="mp-state" aria-hidden="true">\u25CF</span>';
  var grpEl=document.getElementById('mp-sfx-groups'),bgmEl=document.getElementById('mp-bgm-tracks'),groups=[];
  function trackRow(n,name,attrs,obs){
    return '<button class="mp-track" type="button" '+attrs+'><span class="mp-num">'+pad2(n)+'</span><span class="mp-name">'+name+'</span>'+(obs?'<span class="mp-obs" aria-hidden="true" title="'+T('mp.unobserved')+'">\u25CB</span>':'')+SPEC+'</button>';
  }
  if(grpEl){
    var html='';
    SKY.panelGroups().forEach(function(g){
      if(!g.sfx.length)return; /* sektor belum punya SFX: belum tampil */
      /* urut A-Z per accordion; nomor lokal 01..N */
      var list=g.sfx.slice().sort(function(a,b){
        return a.label.toLowerCase().localeCompare(b.label.toLowerCase());
      });
      var rowsH='',ln=0;
      list.forEach(function(s){
        ln++;
        tracks.push({type:'sfx',key:s.key,name:s.label.toLowerCase(),audio:SFX[s.key]});
        rowsH+=trackRow(ln,s.label.toLowerCase(),'data-type="sfx" data-key="'+s.key+'"',true);
      });
      /* header: judul saja (marquee) + count + chevron — tanpa 01 Winter */
      html+='<div class="mp-grp" data-sector="'+g.k+'"><button type="button" class="mp-grp-head" aria-expanded="false"><span class="mp-grp-name"><span class="mp-grp-marq">'+g.title+'</span></span><span class="mp-grp-n">'+list.length+'</span><span class="mp-grp-chev" aria-hidden="true"></span></button><div class="mp-tracks">'+rowsH+'</div></div>';
    });
    grpEl.innerHTML=html;
  }
  var SFX_N=tracks.length; /* BGM mulai di index ini */
  var BGM=[{index:0,name:'constellation',audio:AMB},{index:1,name:'collapsars',audio:MUSIC_COLLAP}];
  BGM.forEach(function(t,i){tracks.push({type:'bgm',index:t.index,name:t.name,audio:t.audio});});
  if(bgmEl)bgmEl.innerHTML=BGM.map(function(t,i){return '<button class="mp-track'+(i===0?' active':'')+'" type="button" data-type="bgm" data-index="'+t.index+'"><span class="mp-num">'+pad2(i+1)+'</span><span class="mp-name">'+t.name+'</span>'+SPEC+'</button>';}).join('');
  /* accordion: satu sektor terbuka; sektor yang lagi dibuka di peta (atau yang memuat lagu aktif) ikut terbuka saat panel dibuka */
  groups=[].slice.call(panel.querySelectorAll('.mp-grp'));
  function grpOpen(g,on){g.classList.toggle('open',on);g.querySelector('.mp-grp-head').setAttribute('aria-expanded',on?'true':'false');}
  function grpFocus(k){
    var hit=false;groups.forEach(function(g){var o=g.getAttribute('data-sector')===k;if(o)hit=true;grpOpen(g,o);});
    if(!hit&&groups[0])grpOpen(groups[0],true);
  }
  /* satu sektor terbuka sekali waktu. Karena grup lain di atasnya ikut menutup, isi di atas header yang diklik ikut menyusut dan daftar jadi "meleset":
     jadi header yang diklik dijangkar (tetap di posisi layar yang sama), lalu kalau daftar barunya kepotong di bawah, digeser pelan sampai kelihatan
     (header tidak boleh lewat batas atas). Scroll-snap dimatikan sebentar supaya tidak saling tarik dengan penyesuaian ini. */
  var mpScroll=panel.querySelector('.mp-scroll'),mpSnapT=0;
  groups.forEach(function(g){var head=g.querySelector('.mp-grp-head');head.addEventListener('click',function(){
    var on=!g.classList.contains('open'),y0=head.getBoundingClientRect().top;
    if(mpScroll){clearTimeout(mpSnapT);mpScroll.style.scrollSnapType='none';}
    groups.forEach(function(o){grpOpen(o,false);});grpOpen(g,on);
    if(!mpScroll)return;
    mpScroll.scrollTop+=head.getBoundingClientRect().top-y0;   /* jangkar: header tetap di tempat */
    if(on){
      var cr=mpScroll.getBoundingClientRect(),hr=head.getBoundingClientRect(),gr=g.getBoundingClientRect(),
          need=gr.bottom-(cr.bottom-4),room=hr.top-(cr.top+2),d=Math.min(need,room);
      if(d>1){
        var rm=false;try{rm=window.matchMedia('(prefers-reduced-motion:reduce)').matches;}catch(e){}
        mpScroll.scrollTo({top:mpScroll.scrollTop+d,behavior:rm?'auto':'smooth'});
      }
    }
    mpSnapT=setTimeout(function(){mpScroll.style.scrollSnapType='';},420);
  });});
  /* SFX yang lagi bunyi: accordion sektornya otomatis jadi yang terbuka pas panel dibuka (dan barisnya digulir ke tengah kalau kepotong).
     Nggak ada SFX aktif -> perilaku lama (ikut sektor yang lagi dibuka di peta). */
  function focusPlayingGroup(){
    var pi=getPlayingTrackIndex(),t=tracks[pi];
    if(pi<0||!t||t.type!=='sfx')return false;
    var row=rows[pi],g=row&&row.closest&&row.closest('.mp-grp');
    if(!g)return false;
    grpFocus(g.getAttribute('data-sector'));
    requestAnimationFrame(function(){
      if(!mpScroll)return;
      var cr=mpScroll.getBoundingClientRect(),rr=row.getBoundingClientRect();
      if(rr.top<cr.top+2||rr.bottom>cr.bottom-2){
        clearTimeout(mpSnapT);mpScroll.style.scrollSnapType='none';
        mpScroll.scrollTop+=rr.top-cr.top-Math.max(0,(cr.height-rr.height)/2);
        mpSnapT=setTimeout(function(){mpScroll.style.scrollSnapType='';},420);
      }
    });
    return true;
  }
  toggle.addEventListener('click',function(){
    if(panel.classList.contains('open'))return;
    if(focusPlayingGroup())return;
    grpFocus(!SECT.on&&SECT.cur?SECT.cur.k:(SECT.cur&&SECT.cur.k)||null);
  },true);
  grpFocus(null);

  var rows=[].slice.call(panel.querySelectorAll('.mp-track'));
  var trackNames=tracks.map(function(t){return t.name;});
  var activeIdx=SFX_N; /* default highlighted row: Constellation BGM */
  var specRAF=0;
  var nowTimer=0;
  var nowPhase=''; /* '' | 'show' | 'absorb' */
  var lastTrackName='';
  var rowSpecs=rows.map(function(row){return [].slice.call(row.querySelectorAll('.mp-spec i'));});
  var miniBars=[].slice.call(toggle.querySelectorAll('.mp-spec-mini i'));

  /* Whatever is actually making sound right now — a star SFX started from
     the HUD, from a canvas hit, or a BGM loop — not just whatever the HUD
     last selected. Keeps the panel truthful no matter which control fired. */
  function getPlayingTrackIndex(){
    for(var i=0;i<tracks.length;i++){
      var a=tracks[i].audio;
      if(a&&!a.paused&&!a.ended)return i;
    }
    return -1;
  }
  function isPlaying(){return getPlayingTrackIndex()!==-1;}
  function panelOpen(){return panel.classList.contains('open');}
  function stopAllExcept(keepAudio){
    tracks.forEach(function(t){
      if(t.audio&&t.audio!==keepAudio){
        safePause(t.audio);
        if(t.type==='sfx')t.audio.loop=false; /* repeat-one jangan nempel di track yang sudah ditinggal */
      }
    });
  }
  function clearNowPlaying(){
    if(nowTimer){clearTimeout(nowTimer);nowTimer=0;}
    nowPhase='';
    lastTrackName='';
    if(nowEl){nowEl.classList.remove('show','absorb');nowEl.textContent='';}
  }
  function showNowPlaying(){
    if(!nowEl)return;
    var playingIdx=getPlayingTrackIndex();
    if(playingIdx===-1)return;
    var name=trackNames[playingIdx]||'';
    if(!name)return;
    /* Jika lagu yang sama dipicu ulang, jangan re-trigger animasi reflow */
    if(nowPhase==='show'&&lastTrackName===name)return;
    lastTrackName=name;
    if(nowTimer){clearTimeout(nowTimer);nowTimer=0;}
    nowEl.textContent=name;
    if(!nowEl.classList.contains('show')){
      nowEl.classList.remove('absorb');
      void nowEl.offsetWidth; /* Reflow hanya jika benar-benar berganti dari state lain */
      nowEl.classList.add('show');
    }
    nowPhase='show';
    nowTimer=setTimeout(function(){
      nowTimer=0;
      if(nowPhase!=='show'||!isPlaying()||panelOpen())return;
      nowEl.classList.add('absorb');
      nowEl.classList.remove('show');
      nowPhase='absorb';
    },2000);
  }
  /* ---------- Media Session (notif + lock screen) ----------
     Semua track Observatory satu album: "Collapsars" -> art sendiri
     (collapsars-cover.webp), beda dari Limerence di dumul.html. */
  var MS=('mediaSession' in navigator)&&typeof MediaMetadata!=='undefined'?navigator.mediaSession:null;
  var msKey='';
  function msTitle(n){return n?n.charAt(0).toUpperCase()+n.slice(1):'';}
  function msUpdate(playingIdx){
    if(!MS)return;
    try{
      if(playingIdx!==-1){
        var name=trackNames[playingIdx];
        if(msKey!==name){
          msKey=name;
          var base=new URL('collapsars-cover.webp',location.href).href;
          MS.metadata=new MediaMetadata({
            title:msTitle(name),artist:'DUMUL',album:'Collapsars',
            artwork:[{src:base,sizes:'1024x1024',type:'image/webp'}]
          });
        }
        MS.playbackState='playing';
      }else if(msKey){
        MS.playbackState='paused';
      }
    }catch(e){}
  }
  function msStepBgm(){
    var cur=getPlayingTrackIndex();
    if(cur===-1)cur=activeIdx;
    selectAndPlay(cur===SFX_N?SFX_N+1:SFX_N);
  }
  if(MS){
    try{
      MS.setActionHandler('play',function(){if(!isPlaying())toggleCurrentPlay();});
      MS.setActionHandler('pause',function(){if(isPlaying())toggleCurrentPlay();});
      MS.setActionHandler('previoustrack',msStepBgm);
      MS.setActionHandler('nexttrack',msStepBgm);
    }catch(e){}
  }
  function sync(){
    var playingIdx=getPlayingTrackIndex();
    var playing=(playingIdx!==-1);
    msUpdate(playingIdx);
    var open=panelOpen();
    if(playingIdx!==-1)activeIdx=playingIdx;
    rows.forEach(function(row,i){
      row.classList.toggle('active',i===activeIdx);
      row.classList.toggle('playing',i===playingIdx);
    });
    /* Spectrum lives next to the track title while the HUD is open;
       when closed it relocates into the music logo. */
    toggle.classList.toggle('playing-closed',playing&&!open);
    playBtn.setAttribute('aria-label',playing?T('mp.pause'):T('mp.play'));
    if(playBtn._pl!==playing){playBtn._pl=playing;
    playBtn.innerHTML='<span class="mp-play-icon" aria-hidden="true"><svg class="ico ico-play" viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden="true"'+(playing?' hidden':'')+'><path d="M8 5.5v13l11-6.5L8 5.5z"/></svg><svg class="ico ico-pause" viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden="true"'+(playing?'':' hidden')+'><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg></span>';
    }
    if(playing)startSpec();else stopSpec();
    /* Title migrates to logo side when HUD closes while music plays;
       after 2s it slides into the logo. */
    if(playing&&!open)showNowPlaying();
    else clearNowPlaying();
  }
  /* Bar spektrum sekarang murni CSS (.mp-track.playing / #music-toggle.playing-closed) -> tidak ada loop JS lagi.
     startSpec/stopSpec dipertahankan sebagai no-op supaya pemanggil lama tetap aman. */
  function startSpec(){}
  function stopSpec(){}
  /* Called from playSfx (pauseMusicForSfx) the instant a star SFX takes
     over — clears playing UI immediately without waiting for the BGM's
     'pause' event, so the HUD never flashes a stale state. */
  musicForceStop=function(){
    stopSpec();
    toggle.classList.remove('playing-closed');
    rows.forEach(function(row){row.classList.remove('playing');});
    playBtn.setAttribute('aria-label',T('mp.play'));
    playBtn.innerHTML='<span class="mp-play-icon" aria-hidden="true"><svg class="ico ico-play" viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13l11-6.5L8 5.5z"/></svg><svg class="ico ico-pause" viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden="true" hidden><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg></span>';
    playBtn._pl=false;
    clearNowPlaying();
    if(MS&&msKey){try{MS.playbackState='paused';}catch(e){}}
  };
  function openPanel(){
    panel.classList.add('open');panel.setAttribute('aria-hidden','false');toggle.setAttribute('aria-expanded','true');
    if(typeof waveInvalidate==='function')waveInvalidate();
    if(typeof renderStellarRecord==='function')renderStellarRecord();
    sync();
  }
  function shutPanel(){
    panel.classList.remove('open');panel.setAttribute('aria-hidden','true');toggle.setAttribute('aria-expanded','false');
    sync();
  }
  function selectAndPlay(i){
    var target=tracks[i];
    if(!target)return;
    if(typeof RADIO_SILENCE!=='undefined'&&RADIO_SILENCE){showModeToast(T('toast.silence'),'silence',1800);return;}
    var playingIdx=getPlayingTrackIndex();

    /* Tapping the row that's already playing pauses it (toggle). */
    if(playingIdx===i){
      if(target.type==='sfx'){safePause(target.audio);audioVizOff();setAVColor(null,false);}
      else safePause(target.audio);
      sync();
      return;
    }

    activeIdx=i;
    stopAllExcept(null);

    if(target.type==='sfx'){
      /* Same path as clicking the star on the canvas: spectrum, star
         focus/twinkle, supernova burst & flash, HUD equalizer — all of it
         is already handled inside triggerSupernova. Guarded internally
         against the black-hole swallow state (SW). */
      triggerSupernova(target.key);
    }else{
      if(activeSfx&&!activeSfx.paused&&!activeSfx.ended){
        safePause(activeSfx);
        audioVizOff();
        setAVColor(null,false);
      }
      target.audio._bv=.5;
      try{target.audio.volume=Math.max(0,Math.min(1,.5*(window.__mpMasterVol!=null?window.__mpMasterVol:.85)));}catch(eV){target.audio.volume=.5;}
      safePlay(target.audio);
    }
    sync();
  }
  function toggleCurrentPlay(){
    if(typeof RADIO_SILENCE!=='undefined'&&RADIO_SILENCE){var playingIdx0=getPlayingTrackIndex();if(playingIdx0===-1){showModeToast(T('toast.silence'),'silence',1800);return;}}
    var playingIdx=getPlayingTrackIndex();
    if(playingIdx!==-1){
      var t=tracks[playingIdx];
      if(t.type==='sfx'){safePause(t.audio);audioVizOff();setAVColor(null,false);}
      else safePause(t.audio);
      sync();
    }else{
      selectAndPlay(activeIdx);
    }
  }
  toggle.addEventListener('click',function(){panel.classList.contains('open')?shutPanel():openPanel();});
  close.addEventListener('click',shutPanel);
  /* Dismiss the HUD when tapping/clicking anywhere outside it. */
  document.addEventListener('pointerdown',function(e){
    if(!panel.classList.contains('open'))return;
    var target=e.target;
    if(panel.contains(target)||toggle.contains(target))return;
    shutPanel();
  },true);
  playBtn.addEventListener('click',toggleCurrentPlay);
  rows.forEach(function(row,i){row.addEventListener('click',function(){selectAndPlay(i);});});

  /* ---- Transport: prev/next/shuffle/repeat + seek waveform + master volume ---- */
  var btnPrev=document.getElementById('mp-prev');
  var btnNext=document.getElementById('mp-next');
  var btnShuffle=document.getElementById('mp-shuffle');
  var btnRepeat=document.getElementById('mp-repeat');
  var seekEl=document.getElementById('mp-seek');
  var waveCv=document.getElementById('mp-wave');
  var waveCx=waveCv?waveCv.getContext('2d'):null;
  var t0El=document.getElementById('mp-t0');
  var t1El=document.getElementById('mp-t1');
  var volEl=document.getElementById('mp-vol');
  var volBtn=document.getElementById('mode-silence');
  var volWrap=volBtn&&volBtn.parentElement;
  var shuffleOn=false;
  var repeatMode=0; /* 0 off · 1 one · 2 all */
  var masterVol=.85;
  var lastVol=.85;
  var seekDrag=false;
  var waveSeed=1;
  try{var _sv=localStorage.getItem('mp_vol');if(_sv!=null){masterVol=Math.max(0,Math.min(1,Number(_sv)/100));lastVol=masterVol||.85;}}catch(eV0){}
  try{shuffleOn=localStorage.getItem('mp_shuffle')==='1';}catch(eSh){}
  try{repeatMode=Math.max(0,Math.min(2,Number(localStorage.getItem('mp_repeat')||0)|0));}catch(eRp){}
  window.__mpMasterVol=masterVol;

  /* Ikon volume = SVG (bukan emoji) biar seragam dgn ikon lain. 4 level: mute / rendah / sedang / tinggi */
  var VOL_SVG_HEAD='<svg class="ico" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 10 v4 h3.5 L12 18 V6 L7.5 10 H4 Z"/>';
  var VOL_SVG=[
    VOL_SVG_HEAD+'<path d="M16 9 l5 6 M21 9 l-5 6"/></svg>',
    VOL_SVG_HEAD+'<path d="M15.2 9.2 a3.2 3.2 0 0 1 0 5.6"/></svg>',
    VOL_SVG_HEAD+'<path d="M15.2 9.2 a3.2 3.2 0 0 1 0 5.6"/><path d="M17.5 7 a5.5 5.5 0 0 1 0 10"/></svg>',
    VOL_SVG_HEAD+'<path d="M15.2 9.2 a3.2 3.2 0 0 1 0 5.6"/><path d="M17.5 7 a5.5 5.5 0 0 1 0 10"/><path d="M19.6 4.8 a8.4 8.4 0 0 1 0 14.4"/></svg>'
  ];
  var _volLv=-1;
  function volIcon(v){
    return v<.01?0:(v<.34?1:(v<.67?2:3));
  }
  function applyMasterVol(){
    function setA(a){
      if(!a)return;
      var bv=a._bv!=null?a._bv:(a===AMB||a===MUSIC_COLLAP?.5:.85);
      a._bv=bv;
      try{if(a._f)return;a.volume=Math.max(0,Math.min(1,bv*masterVol));}catch(e){}
    }
    tracks.forEach(function(t){setA(t.audio);});
    try{if(typeof SFX==='object')Object.keys(SFX).forEach(function(k){setA(SFX[k]);});}catch(eS){}
    try{setA(AMB);setA(MUSIC_COLLAP);}catch(eB){}
    window.__mpMasterVol=masterVol;
    var muted=masterVol<.01;
    RADIO_SILENCE=muted;
    if(volBtn){
      var lv=volIcon(masterVol);if(lv!==_volLv){_volLv=lv;volBtn.innerHTML=VOL_SVG[lv];}
      volBtn.classList.toggle('on',muted);
      volBtn.classList.toggle('muted',muted);
      volBtn.setAttribute('aria-pressed',muted?'true':'false');
      volBtn.title=muted?T('mp.unmute'):T('mp.vol');
      volBtn.setAttribute('aria-label',muted?T('mp.unmute'):T('mp.vol'));
    }
    if(volEl)volEl.value=String(Math.round(masterVol*100));
  }
  function setMasterVol(v,persist){
    masterVol=Math.max(0,Math.min(1,v));
    if(masterVol>.01)lastVol=masterVol;
    applyMasterVol();
    if(persist!==false){try{localStorage.setItem('mp_vol',String(Math.round(masterVol*100)));}catch(e){}}
  }
  window.__mpVolToggle=function(){
    if(volWrap){
      var open=volWrap.classList.contains('open');
      if(!open){volWrap.classList.add('open');return;}
    }
    if(masterVol<.01)setMasterVol(lastVol||.85);
    else setMasterVol(0);
  };
  if(volEl){
    volEl.value=String(Math.round(masterVol*100));
    volEl.addEventListener('input',function(){setMasterVol(Number(volEl.value)/100);});
    volEl.addEventListener('change',function(){setMasterVol(Number(volEl.value)/100);});
  }
  if(volWrap){
    document.addEventListener('pointerdown',function(e){
      if(!volWrap.classList.contains('open'))return;
      if(volWrap.contains(e.target))return;
      volWrap.classList.remove('open');
    },true);
  }
  applyMasterVol();

  function isPlayable(i){
    var t=tracks[i];
    if(!t)return false;
    return true;
  }
  function playableList(){
    var L=[];
    for(var i=0;i<tracks.length;i++)if(isPlayable(i))L.push(i);
    return L;
  }
  function pickNext(from,dir,scope){   /* scope = 'sfx'|'bgm': hanya cari di daftar itu (repeat all otomatis nggak nyebrang Stellar Signals ↔ BGM) */
    var L=playableList();
    if(scope)L=L.filter(function(i){return tracks[i].type===scope;});
    if(!L.length)return -1;
    if(shuffleOn){
      if(L.length===1)return L[0];
      var opts=L.filter(function(i){return i!==from;});
      return opts[(Math.random()*opts.length)|0];
    }
    var start=from;
    if(start<0)start=activeIdx;
    var idx=L.indexOf(start);
    if(idx<0){
      for(var k=0;k<tracks.length;k++){
        var j=(start+dir*k+tracks.length*20)%tracks.length;
        if(L.indexOf(j)>=0)return j;
      }
      return L[0];
    }
    return L[(idx+dir+L.length*20)%L.length];
  }
  function stepTrack(dir){
    if(typeof RADIO_SILENCE!=='undefined'&&RADIO_SILENCE&&masterVol<.01){
      showModeToast(T('toast.silence'),'silence',1600);return;
    }
    var cur=getPlayingTrackIndex();
    if(cur===-1)cur=activeIdx;
    var n=pickNext(cur,dir);
    if(n<0)return;
    var playingIdx=getPlayingTrackIndex();
    if(playingIdx===n){
      var t=tracks[n];
      if(t&&t.audio){try{t.audio.currentTime=0;}catch(e){}safePlay(t.audio);}
      sync();return;
    }
    selectAndPlay(n);
  }
  function syncLoopFlag(a){
    if(!a)return;
    var isBgm=(a===AMB||a===MUSIC_COLLAP);
    /* Repeat one: track yang diputar selalu loop (SFX maupun BGM).
       BGM auto-loop HANYA kalau repeat off DAN shuffle off. Repeat all / shuffle: loop mati supaya 'ended' jalan dan lanjut ke track berikutnya
       (dulu BGM tetap loop waktu shuffle on, jadi shuffle nggak pernah pindah dari BGM). SFX di luar repeat one nggak pernah loop. */
    if(repeatMode===1)a.loop=true;
    else if(repeatMode===2||shuffleOn)a.loop=false;
    else a.loop=!!isBgm;
  }
  window.__mpSyncLoop=syncLoopFlag;
  function onTrackEnded(t){
    if(!t||!t.audio)return;   
    /* 'ended' basi: track sudah di-reset (currentTime=0) atau bukan track aktif -> abaikan*/
    if(!t.audio.ended)return;
    if(t.type==='sfx'&&activeSfx&&activeSfx!==t.audio)return;    
    /* 'ended' basi (track sudah diganti lewat supernova/panel): jangan restart/advance, itu yang bikin numpuk. */
    if(getPlayingTrackIndex()!==-1)return;
    if(repeatMode===1){
      /* SFX: lewat playSfx supaya activeSfx/onended/viz tetap koheren (restart langsung via safePlay bikin
         activeSfx kosong -> supernova berikutnya nggak mematikan lagu ini -> numpuk). */
      if(t.type==='sfx'&&typeof playSfx==='function'){playSfx(t.audio);return;}
      try{t.audio.currentTime=0;}catch(e){}
      safePlay(t.audio);return;
    }
    if(repeatMode===2||shuffleOn){
      var cur=tracks.indexOf(t);
      /* Repeat all = muter di daftar yang sama (Stellar Signals sendiri, BGM sendiri). Shuffle tetap acak di semua track. */
      var n=pickNext(cur,1,(repeatMode===2&&!shuffleOn)?t.type:null);
      if(n>=0&&n!==cur){
        selectAndPlay(n);
        /* selectAndPlay -> triggerSupernova bisa batal diam-diam (bintang tujuan di luar layar sektor / cooldown) dan rantai auto-lanjut mati.
           Auto-lanjut audionya tetap harus jalan, visual supernova opsional. */
        var nt=tracks[n];
        if(getPlayingTrackIndex()===-1&&nt&&nt.type==='sfx'&&typeof playSfx==='function')playSfx(nt.audio);
      }else if(n===cur){
        /* satu-satunya track di daftarnya: mulai lagi. SFX lewat playSfx (activeSfx/onended tetap koheren). */
        if(t.type==='sfx'&&typeof playSfx==='function')playSfx(t.audio);
        else{try{t.audio.currentTime=0;}catch(e2){}safePlay(t.audio);}
      }
      return;
    }
    sync();
  }
  function fmtTime(s){
    if(!isFinite(s)||s<0)return '0:00';
    s=Math.floor(s);
    return ((s/60)|0)+':'+((s%60)<10?'0':'')+(s%60);
  }
  var waveCW=0,waveLast=0;
  function waveInvalidate(){waveCW=0;waveKey='';}
  window.addEventListener('resize',waveInvalidate,{passive:true});
  window.addEventListener('orientationchange',waveInvalidate,{passive:true});
  function measureWave(){
    /* Jangan biarkan set canvas.width/height mengubah layout box (bug WebView: seekbar mengecil).
       Ukur dari CSS box; fallback ke parent .mp-seek; kunci style width/height setelah resize bitmap.
       Dipanggil SEKALI (buka panel / resize), bukan tiap frame -> tidak ada forced reflow di loop. */
    var wrap=waveCv.parentElement,cw=waveCv.clientWidth,ch=waveCv.clientHeight;
    if(!(cw>1)&&wrap)cw=Math.max(0,(wrap.clientWidth||0)-10);
    if(!(ch>1))ch=12;
    if(cw>1){
      var dpr=Math.min(2,window.devicePixelRatio||1),nw=Math.max(1,Math.round(cw*dpr)),nh=Math.max(1,Math.round(ch*dpr));
      if(waveCv.width!==nw||waveCv.height!==nh){waveCv.width=nw;waveCv.height=nh;}
      if(waveCv.style.width!==cw+'px')waveCv.style.width=cw+'px';
      if(waveCv.style.height!==ch+'px')waveCv.style.height=ch+'px';
      waveCW=cw;
    }
  }
  var waveKey='';
  function paintWave(prog,playing){
    if(!waveCx||!waveCv||PX.pa||PX.pw)return;
    if(!(waveCW>1))measureWave();
    /* Gaya "ruler": garis tipis + tick (besar tiap 4 segmen, kecil di antaranya) + playhead kotak tegak. Warna ikut cyan player. */
    var SEG=24,w=waveCv.width,h=waveCv.height,u=w/(waveCW>1?waveCW:w),pad=Math.round(3*u),
        span=Math.max(1,w-pad*2),px=pad+Math.max(0,Math.min(1,prog))*span,
        key=Math.round(px)+'|'+w+'x'+h;
    if(key===waveKey)return;   /* tidak ada yang berubah: jangan sentuh canvas (hindari upload tekstur + commit panel) */
    waveKey=key;
    waveCx.setTransform(1,0,0,1,0,0);
    waveCx.clearRect(0,0,w,h);
    var mid=Math.round(h/2),lw=Math.max(1,Math.round(1.6*u)),i,x,major,th;
    /* garis dasar: sisa redup, bagian terputar terang */
    waveCx.fillStyle='rgba(110,229,255,.18)';waveCx.fillRect(px,mid-lw/2,Math.max(0,w-pad-px),lw);
    waveCx.fillStyle='rgba(110,229,255,.85)';waveCx.fillRect(pad,mid-lw/2,Math.max(0,px-pad),lw);
    /* tick */
    for(i=0;i<=SEG;i++){
      x=pad+span*i/SEG;major=(i%4===0);
      th=Math.round(h*(major?.62:.32));
      waveCx.fillStyle=x<=px?(major?'rgba(110,229,255,.7)':'rgba(110,229,255,.42)'):(major?'rgba(110,229,255,.3)':'rgba(110,229,255,.16)');
      waveCx.fillRect(Math.round(x-lw/2),mid-Math.round(th/2),lw,th);
    }
    /* playhead */
    var pw=Math.max(3,Math.round(4*u)),ph=Math.round(h*.78),lw2=Math.max(1,Math.round(1.4*u)),
        hx=Math.round(px-pw/2),hy=mid-Math.round(ph/2);
    waveCx.fillStyle='rgba(110,229,255,.35)';waveCx.fillRect(hx,hy,pw,ph);
    waveCx.lineWidth=lw2;waveCx.strokeStyle='rgba(234,252,255,.95)';
    waveCx.strokeRect(hx+lw2/2,hy+lw2/2,pw-lw2,ph-lw2);
  }
  function updateSeekUI(){
    var i=getPlayingTrackIndex();
    var a=i>=0?tracks[i].audio:null;
    var cur=0,dur=0,prog=0;
    if(a){
      try{cur=a.currentTime||0;dur=a.duration||0;}catch(e){}
      if(isFinite(dur)&&dur>0)prog=cur/dur;
      syncLoopFlag(a);
    }
    /* Panel tertutup: jangan gambar waveform / update DOM seek (hemat GPU) */
    if(!panelOpen())return;
    var s0=fmtTime(cur),s1=dur>0?fmtTime(dur):'0:00',sv=String(Math.round(prog*1000));
    if(t0El&&t0El.textContent!==s0)t0El.textContent=s0;
    if(t1El&&t1El.textContent!==s1)t1El.textContent=s1;
    if(seekEl&&!seekDrag&&seekEl.value!==sv)seekEl.value=sv;
    paintWave(prog,!!a&&!a.paused);
  }
  var seekRAF=0;
  var seekLast=0;
  function tickSeek(now){
    seekRAF=0;
    /* Hanya jalan saat panel terbuka + ada audio playing */
    if(!panelOpen()||getPlayingTrackIndex()===-1){stopSeekTick();return;}
    if(!(now-seekLast<100)){seekLast=now;updateSeekUI();}   /* playhead gerak pelan: 10Hz cukup */
    seekRAF=requestAnimationFrame(tickSeek);
  }
  function startSeekTick(){
    if(seekRAF||!panelOpen()||getPlayingTrackIndex()===-1)return;
    seekRAF=requestAnimationFrame(tickSeek);
  }
  function stopSeekTick(){
    if(seekRAF){cancelAnimationFrame(seekRAF);seekRAF=0;}
    /* satu frame terakhir cuma kalau panel masih terbuka */
    if(panelOpen())updateSeekUI();
  }

  var _sync0=sync;
  sync=function(){
    _sync0();
    if(btnShuffle){btnShuffle.classList.toggle('on',shuffleOn);btnShuffle.setAttribute('aria-pressed',shuffleOn?'true':'false');}
    if(btnRepeat){
      btnRepeat.dataset.mode=String(repeatMode);
      btnRepeat.classList.toggle('on',repeatMode>0);
      btnRepeat.setAttribute('aria-pressed',repeatMode>0?'true':'false');
      btnRepeat.title=repeatMode===1?T('mp.rep.one'):(repeatMode===2?T('mp.rep.all'):T('mp.rep.off'));
      btnRepeat.setAttribute('aria-label',btnRepeat.title);
    }
    /* Indikator loop BGM (↻): baris BGM di panel + tombol panel. Auto-loop (repeat off & shuffle off) = semua baris BGM; repeat one = hanya BGM yang lagi diputar / terpilih. */
    var pi2=getPlayingTrackIndex(),autoLoop=(repeatMode===0&&!shuffleOn),oneLoop=(repeatMode===1),ci=pi2>=0?pi2:activeIdx,i2;
    for(i2=SFX_N;i2<tracks.length;i2++){if(rows[i2])rows[i2].classList.toggle('looping',autoLoop||(oneLoop&&i2===ci));}
    toggle.classList.toggle('bgm-loop',pi2>=SFX_N&&(autoLoop||oneLoop));
    if(pi2>=0)syncLoopFlag(tracks[pi2].audio);   /* tiap play/pause/ended: loop track yang main selalu sesuai mode (BGM nyala dari jalur mana pun, panel tertutup sekalipun) */
    var pi=getPlayingTrackIndex();
    if(pi>=0&&panelOpen()){waveSeed=(pi+1)*97;startSeekTick();}
    else stopSeekTick();
  };

  if(btnPrev)btnPrev.addEventListener('click',function(){stepTrack(-1);haptic(6);});
  if(btnNext)btnNext.addEventListener('click',function(){stepTrack(1);haptic(6);});
  if(btnShuffle)btnShuffle.addEventListener('click',function(){
    shuffleOn=!shuffleOn;
    try{localStorage.setItem('mp_shuffle',shuffleOn?'1':'0');}catch(e){}
    var pi0=getPlayingTrackIndex();
    if(pi0>=0)syncLoopFlag(tracks[pi0].audio);   /* BGM yang lagi main: loop-nya ikut aturan baru sekarang juga */
    sync();haptic(6);
  });
  if(btnRepeat)btnRepeat.addEventListener('click',function(){
    repeatMode=(repeatMode+1)%3;
    try{localStorage.setItem('mp_repeat',String(repeatMode));}catch(e){}
    var pi=getPlayingTrackIndex();
    if(pi>=0)syncLoopFlag(tracks[pi].audio);
    sync();haptic(6);
  });
  if(seekEl){
    seekEl.addEventListener('pointerdown',function(){seekDrag=true;});
    seekEl.addEventListener('pointerup',function(){seekDrag=false;});
    seekEl.addEventListener('change',function(){seekDrag=false;});
    seekEl.addEventListener('input',function(){
      var i=getPlayingTrackIndex();
      if(i<0)i=activeIdx;
      var a=tracks[i]&&tracks[i].audio;
      if(!a)return;
      var d=a.duration;
      if(!isFinite(d)||d<=0)return;
      try{a.currentTime=(Number(seekEl.value)/1000)*d;}catch(e){}
      updateSeekUI();
    });
  }
  if(MS){
    try{
      MS.setActionHandler('previoustrack',function(){stepTrack(-1);});
      MS.setActionHandler('nexttrack',function(){stepTrack(1);});
    }catch(eMS){}
  }

  tracks.forEach(function(t){
    if(!t.audio)return;
    t.audio.addEventListener('play',function(){
      /* retry async dari track lama yang sudah ditinggalkan: matikan lagi */
      if(!t.audio._want){safePause(t.audio);if(t.type==='sfx')t.audio.loop=false;sync();return;}
      /* ada track baru mulai: pastikan semua track lain berhenti (single voice) */
      tracks.forEach(function(o){
        if(o.audio&&o.audio!==t.audio&&!o.audio.paused&&!o.audio.ended){
          if(o.audio===activeSfx&&t.type==='sfx'){o.audio.onended=null;}
          safePause(o.audio);
          if(o.type==='sfx')o.audio.loop=false;
        }
      });
      sync();
    });
    t.audio.addEventListener('pause',sync);
    t.audio.addEventListener('ended',function(){onTrackEnded(t);sync();});
    t.audio.addEventListener('timeupdate',function(){if(!seekDrag&&panelOpen())updateSeekUI();});
  });
  var _sel0=selectAndPlay;
  selectAndPlay=function(i){
    _sel0(i);
    applyMasterVol();
    var t=tracks[i];
    if(t&&t.audio)syncLoopFlag(t.audio);
  };
  updateSeekUI();
  sync();
})();

function triggerSupernova(key){
  if(typeof isLayoutEdit==="function"&&isLayoutEdit())return;
  if(SW)return;
  if(typeof lisBlock==='function'&&lisBlock('sig')){lisDenied('sig');return;}   /* Lost-in-Space */
  var tr=TRIGGERS[key],
      c=tr&&tr.cons==='pleiades'?PLEIADES:(tr&&cons(tr.cons)),
      s=tr&&c&&(tr.cons==='pleiades'?plStarByName(tr.star):c.stars[tr.star]);
  if(!tr||!s)return;

  /* Cooldown before any visual/audio so rapid double-taps don't stack. */
  var t0g=performance.now();
  if(SN_COOLDOWN[key]&&t0g-SN_COOLDOWN[key]<820)return;
  /* Gate global: klik ganti-ganti bintang cepat (A->B->C) dulu nembus karena cooldown cuma per-key,
     sehingga flash/partikel/warp/spektrum numpuk di HP RAM kecil. */
  if(SN_COOLDOWN.__g&&t0g-SN_COOLDOWN.__g<380)return;
  SN_COOLDOWN[key]=t0g;
  if(SECT.on||!sectShow(tr.cons)){SN_COOLDOWN.__g=t0g;sfxArrive(key);return;}

  var flash=$('#sn-flash'),
      sx=tr.cons==='pleiades'?(PLEIADES.x+s.x*PLEIADES.scale+mouse.x*1.4+skyPan.x):(s.x+c.ox),
      sy=tr.cons==='pleiades'?(PLEIADES.y+s.y*PLEIADES.scale+mouse.y*1.0+skyPan.y):(s.y+c.oy),
      q=gSky(sx,sy);
  if(!q||q[2]>=1)return;
  SN_COOLDOWN.__g=t0g;

  /* Bintang lain masih bunyi? Matikan SEKARANG (jangan nunggu teleskop mendarat), supaya fokus rasi,
     spektrum, time-dilation, dan visual burst nggak nunjuk ke dua bintang berbeda sekaligus. */
  var prevSfx=activeSfx;
  if(prevSfx&&prevSfx!==SFX[key]){    
prevSfx.onended=null;prevSfx.loop=false;safeReset(prevSfx); 
activeSfx=null;setAVColor(null,false);audioVizOff();tdRelease();
  }
  /* Sisa efek dari klik sebelumnya dibersihin dulu. */
  SN_BURSTS.length=0;

  /* 1. Supernova flash & particle burst */
  flash.style.setProperty('--sx',Math.round(q[0])+'px');
  flash.style.setProperty('--sy',Math.round(q[1])+'px');
  flash.style.setProperty('--sn-rgb',tr.rgb);
  flash.classList.remove('on');void flash.offsetWidth;flash.classList.add('on');
  /* Failsafe: kalau animationend nggak kepanggil (WebView RAM kecil), paksa overlay mati. */
  clearTimeout(flash._snT);
  flash._snT=setTimeout(function(){flash.classList.remove('on');},1000);

  var t0=performance.now();
  var busy=!!(drag.on||(activeSfx&&!activeSfx.paused&&!activeSfx.ended));
  var count=IS_POTATO?(busy?5:7):(busy?10:16);
  var puCap=IS_POTATO?36:56;
  /* Hard safety net: oldest particles drop first so work never accumulates. */
  if(PU.length+count>puCap)PU.splice(0,Math.max(0,PU.length+count-puCap));
  for(var i=0;i<count;i++){
    var a=Math.random()*6.283,sp=38+Math.random()*(busy?80:105);
    PU.push({c:c,a:tr.star,b:tr.star,t:t0,d:640+Math.random()*160,shock:true,snKey:key,ang:a,sp:sp,i:i});
  }
  /* One core burst at a time — stacking SN_BURSTS was pure overdraw. */
  if(SN_BURSTS.length>=1)SN_BURSTS.length=0;
  SN_BURSTS.push({key:key,t:t0,d:busy?620:760});

  /* Fase 4: teleskop tidak lagi auto-warp/orbit ke SFX. SFX langsung play. */
  sfxArrive(key);
}
function sfxArrive(key){
    playSfx(SFX[key]);
    haptic(key==='betel'?20:18);
    /* Tutorial: panggil drone (tahan teleskop), lalu dock (tahan drone). Tidak auto-dock. */
    try{
      var _src=typeof sfxSector==='function'?sfxSector():null;
      var _docked=_src&&typeof txOn==='function'&&txOn(_src);
      if(!_docked&&SECT.cur&&_src===SECT.cur&&typeof showModeToast==='function'){
        showModeToast(T(SECT.cur.drn?'toast.tx.tipdock':'toast.tx.tip'),'tip',4200);
      }
    }catch(eTx){}
    /* Stellar Memory: click/observe on interaction (fragment waits for SFX end). */
    if(typeof StellarMem!=='undefined'&&STELLAR_KEYS.indexOf(key)>=0){
      var firstObs=StellarMem.markObserved(key);
      if(typeof rememberLastSignal==='function')rememberLastSignal(key);
      renderStellarRecord();
      if(firstObs){/* light tick already via haptic above */}
    }
}
(function(){
  var fl=document.getElementById('sn-flash');
  if(fl)fl.addEventListener('animationend',function(){fl.classList.remove('on');});
})();
var SN_BURSTS=[];
function drawSupernovaBursts(now){
  if(!SN_BURSTS.length)return;
  for(var i=SN_BURSTS.length-1;i>=0;i--){
    var b=SN_BURSTS[i],u=(now-b.t)/b.d;
    if(u>1){SN_BURSTS.splice(i,1);continue;}
    if(SECT.on||!sectShow(TRIGGERS[b.key].cons))continue;
    var tr=TRIGGERS[b.key],c=tr.cons==='pleiades'?PLEIADES:cons(tr.cons),s=tr.cons==='pleiades'?plStarByName(tr.star):c.stars[tr.star],sx=tr.cons==='pleiades'?(PLEIADES.x+s.x*PLEIADES.scale+mouse.x*1.4+skyPan.x):(s.x+c.ox),sy=tr.cons==='pleiades'?(PLEIADES.y+s.y*PLEIADES.scale+mouse.y*1.0+skyPan.y):(s.y+c.oy),q=gSky(sx,sy);
    if(!q||q[2]>=1)continue;
    var fade=1-.85*q[2],easeOut=1-Math.pow(1-u,3),sr=(s&&s.r)||1.9,base=sr*(2.5+9*easeOut);
    g.save();g.globalCompositeOperation='lighter';
    var rg=g.createRadialGradient(q[0],q[1],0,q[0],q[1],base*2.6);
    rg.addColorStop(0,'rgba(255,255,255,'+(.82*(1-u)*fade)+')');
    rg.addColorStop(.18,'rgba('+tr.rgb+','+(.48*(1-u)*fade)+')');
    rg.addColorStop(1,'rgba('+tr.rgb+',0)');
    g.fillStyle=rg;g.beginPath();g.arc(q[0],q[1],base*2.6,0,6.283);g.fill();
    g.strokeStyle='rgba('+tr.rgb+','+(.72*(1-u)*fade)+')';g.lineWidth=1.15;
    g.beginPath();g.arc(q[0],q[1],base,0,6.283);g.stroke();
    g.strokeStyle='rgba(255,255,255,'+(.48*(1-u)*fade)+')';g.lineWidth=.8;
    g.beginPath();g.moveTo(q[0]-base*1.8,q[1]);g.lineTo(q[0]+base*1.8,q[1]);g.moveTo(q[0],q[1]-base*1.8);g.lineTo(q[0],q[1]+base*1.8);g.stroke();
    g.restore();
  }
}
/* F4 (D6): efek masuk dumul.html lewat sabuk Orion. Posisi Alnilam diambil tiap frame (kamera lagi zoom/pan), jadi ledakan menempel ke bintangnya. */
function drawBeltFx(now){
  var B=BELT;if(!B||!B.s||!B.c)return;
  var u=Math.min(1,Math.max(0,(now-B.t0)/B.dur)),q=gSky(B.s.x+B.c.ox,B.s.y+B.c.oy);
  if(!q||q[2]>=1)return;
  var x=q[0],y=q[1],sr=(B.s.r||2)*Math.max(1,skyZoom*.6),
      b=Math.min(1,u/.42),eo=1-Math.pow(1-b,3),
      core=sr*(3+10*eo)*(1+1.8*u*u),
      wash=Math.max(0,Math.min(1,(u-.58)/.4)),
      big=Math.sqrt(W*W+H*H);
  g.save();g.globalCompositeOperation='lighter';
  var rg=g.createRadialGradient(x,y,0,x,y,core*3);
  rg.addColorStop(0,'rgba(255,255,255,'+(.95*(1-.4*u))+')');
  rg.addColorStop(.2,'rgba('+B.rgb+','+(.62*(1-.3*u))+')');
  rg.addColorStop(1,'rgba('+B.rgb+',0)');
  g.fillStyle=rg;g.beginPath();g.arc(x,y,core*3,0,6.283);g.fill();
  if(b<1){   /* gelombang kejut: dua cincin + flare silang, hanya di awal */
    var ring=core*(1.6+eo*9),a=(1-b);
    g.strokeStyle='rgba('+B.rgb+','+(.75*a)+')';g.lineWidth=1.6;
    g.beginPath();g.arc(x,y,ring,0,6.283);g.stroke();
    g.strokeStyle='rgba(255,255,255,'+(.5*a)+')';g.lineWidth=.9;
    g.beginPath();g.arc(x,y,ring*.62,0,6.283);g.stroke();
    var L=core*(2.2+4*eo);
    g.beginPath();g.moveTo(x-L,y);g.lineTo(x+L,y);g.moveTo(x,y-L);g.lineTo(x,y+L);g.stroke();
  }
  if(wash>0){   /* ujung transisi: cahaya meluas dari bintang, menyambung ke veil -> tesseract */
    var wr=big*(.1+.8*wash),wg=g.createRadialGradient(x,y,0,x,y,wr);
    wg.addColorStop(0,'rgba(232,250,255,'+(.9*wash)+')');
    wg.addColorStop(.45,'rgba('+B.rgb+','+(.5*wash)+')');
    wg.addColorStop(1,'rgba('+B.rgb+',0)');
    g.fillStyle=wg;g.fillRect(0,0,W,H);
  }
  g.restore();
}
function cOrionOffsetX(){return cons('orion').ox||0}
function cOrionOffsetY(){return cons('orion').oy||0}

