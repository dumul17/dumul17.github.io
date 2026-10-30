/* index.js dipecah jadi js/01..07 — script klasik berurutan, SATU scope global (tanpa IIFE). Urutan load di index.html jangan diubah. */
/* 01-core.js — setup, stage, sector scan, kamera, audio, spatial muffle, visualizer */
'use strict';
var $=function(s){return document.querySelector(s);};
var cv=$('#sky'),g=cv.getContext('2d');
/* Canvas-state guard: count save()/restore() depth so frame() can always
   unwind a leak (an exception between save() and restore() used to leave
   globalCompositeOperation='lighter' stuck, making the whole sky additive,
   brighter and bluer until the next resize). */
var G_DEPTH=0;
(function(){
  var sv=g.save,rs=g.restore;
  g.save=function(){G_DEPTH++;return sv.call(g);};
  g.restore=function(){if(G_DEPTH>0)G_DEPTH--;return rs.call(g);};
})();
function resetCanvasState(){
  while(G_DEPTH>0){G_DEPTH--;try{CanvasRenderingContext2D.prototype.restore.call(g);}catch(e){break;}}
  g.setTransform(DPR,0,0,DPR,0,0);
  g.globalCompositeOperation='source-over';
  g.globalAlpha=1;
  g.shadowBlur=0;
  g.setLineDash([]);
}
var reduce=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
/* Tanpa auto-detect device: default HIGH. Prioritas quality: ?perf= (tes) > localStorage.dumul_quality (pilihan user lewat panel Setelan) > HIGH. */
var IS_POTATO=false;
try{
  var _pf=/[?&]perf=(high|low)/.exec(location.search);
  if(_pf){IS_POTATO=_pf[1]==='low';}
  else{
    var _qs=null;try{_qs=localStorage.getItem('dumul_quality');}catch(eQ){}
    if(_qs==='high')IS_POTATO=false;
    else if(_qs==='low')IS_POTATO=true;
  }
}catch(e){}
/* TES RESOLUSI: ?dpr=0.75 mengalikan DPR kanvas utama (layout() membaca window.__dprMul). Tanpa parameter = 1 (tidak berubah). */
try{var _dm=/[?&]dpr=([0-9.]+)/.exec(location.search);if(_dm){var _dv=parseFloat(_dm[1]);if(_dv>=.4&&_dv<=1)window.__dprMul=_dv;}}catch(eDm){}
try{if(IS_POTATO)document.documentElement.classList.add('perf-tier-0');else document.documentElement.classList.remove('perf-tier-0');}catch(e){}
var W=0,H=0,DPR=1,START=performance.now(),renderRAF=0,renderGeneration=0,pageHidden=false,hiddenAt=0;
/* Idle saver: after 60s without pointer activity, skip secondary particles (SS) etc. */
var lastActivity=performance.now(),idleMode=false,IDLE_MS=60000;
function markActivity(){lastActivity=performance.now();if(idleMode)idleMode=false;}
var mouse={x:0,y:0,tx:0,ty:0,px:null,py:null},glitchUntil=0,hot=null;
/* Hover hit-test is expensive (all stars + lines through gSky). Only run when
   the pointer actually moved, throttled ~30Hz — never every render frame. */
var hoverDirty=false,lastHoverAt=0,HOVER_MIN_MS=33;
var touchMode=('ontouchstart' in window)||navigator.maxTouchPoints>0;
var drag={on:false,moved:false,pid:null,x0:0,y0:0,bx:0,by:0,tapEligible:false,lpTimer:null,lpFired:false,armed:false,ov:false};
/* Mobile sky-pan + rotate: swipe to slide, 2-finger twist ±180°, both spring back. */
var skyPan={x:0,y:0};
/* ---- Landscape stage ----
   Landscape: sky (canvas, rasi, cluster, Gargantua, sektor) dikunci ke komposisi PORTRAIT. Layout dihitung di ukuran portrait virtual
   (STG.vw x STG.vh) lalu #stage di-scale seragam (STG.k) ke tinggi layar dan ditaruh di tengah. Panel di luar #stage, digeser CSS ke gutter.
   Koordinat pointer dikonversi ke ruang virtual: (client - offset kolom) / k. */
/* Mode ROT (HP landscape, gaya app kamera): sky TIDAK diskala/di-letterbox. Stage tetap berukuran bingkai portrait HP
   (vw = sisi pendek layar, vh = sisi panjang) lalu diputar 90° supaya memenuhi seluruh layar landscape; arah putar mengikuti
   orientasi fisik HP (sisi atas HP = sisi atas sky). Ikon + panel (HUD) ada di luar #stage dan memakai layout landscape biasa.
   STG.rot: 0 = tidak diputar, -90 = diputar CCW (HP miring ke kiri), 90 = diputar CW (HP miring ke kanan). */
var STG={on:false,x:0,y:0,k:1,vw:0,vh:0,w:0,g:0,rot:0,iw:0,ih:0,raw:false,up:'',pt:''};
/* Elemen UI per rasi / bintang SFX dibuat dari registry (sky-data.js): caption #cap-<id> (rasi punya `cap`)
   dan tombol hit #<key>-fx (bintang SFX, kecuali fx:false). Nggak perlu lagi nambah HTML/CSS tiap ada rasi baru. */
var FXBTN={};
(function(){
  var capRef=document.getElementById('cap-bh'),fxRef=document.getElementById('sn-flash'),prev=fxRef,i;
  if(capRef)SKY.rasi.forEach(function(r){
    if(!r.cap||document.getElementById('cap-'+r.id))return;
    var sp=document.createElement('span');sp.className='cap';sp.id='cap-'+r.id;sp.setAttribute('aria-hidden','true');sp.textContent=r.cap.text;
    capRef.parentNode.insertBefore(sp,capRef);
  });
  if(!fxRef)return;
  SKY.FX_KEYS.forEach(function(key){
    var d=SKY.sfxBy[key],el=document.getElementById(key+'-fx');
    if(!el){
      el=document.createElement('button');el.type='button';el.id=key+'-fx';
      el.className='hit fx'+(SKY.rasiBy[d.cons].cluster?' fx-cluster':'');
      el.setAttribute('aria-label',T('fx.aria',{s:d.label}));
      el.style.width=el.style.height='52px';el.style.marginLeft=el.style.marginTop='-26px';
      prev.parentNode.insertBefore(el,prev.nextSibling);prev=el;
    }
    FXBTN[key]=el;
  });
})();
(function(){ /* bungkus elemen sky dalam #stage (urutan DOM dipertahankan) */
  var b=document.body,ids={sky:1,header:1,footer:1,'cap-bh':1,bh:1,'bh-clock':1,'secret-msg':1,'tele-greet':1,'sn-flash':1,'cat-lock':1};
  SKY.rasi.forEach(function(r){if(r.cap)ids['cap-'+r.id]=1;});
  SKY.FX_KEYS.forEach(function(k){ids[k+'-fx']=1;});
  var first=document.getElementById('sky');if(!first||document.getElementById('stage'))return;
  var st=document.createElement('div');st.id='stage';b.insertBefore(st,first);
  [].slice.call(b.children).forEach(function(el){if(el!==st&&ids[el.id])st.appendChild(el);});
})();
/* Arah putar stage di HP landscape. screen.orientation.angle: 90 = HP dimiringkan ke kiri (sisi atas HP di kiri layar) -> sky diputar CCW;
   270 = sisi atas HP di kanan layar -> sky diputar CW. Kalau di HP lu arahnya kebalik, buka situs dengan ?lrflip=1 (atau ganti LR_FLIP). */
var LR_FLIP=false;
try{LR_FLIP=/[?&]lrflip=1/.test(location.search);}catch(eF){}
function lrDir(){
  var a=null;
  try{if(screen.orientation&&typeof screen.orientation.angle==='number')a=screen.orientation.angle;}catch(e1){}
  if(a===null&&typeof window.orientation==='number')a=window.orientation;
  if(a===null)a=90;
  a=((a%360)+360)%360;
  var cw=(a===270);
  if(LR_FLIP)cw=!cw;
  return cw?90:-90;
}
function stageCalc(){
  var iw=innerWidth,ih=innerHeight,on=iw>ih*1.15,de=document.documentElement,rot=0;
  if(on){
    var sw=Math.min(screen.width||0,screen.height||0),sh=Math.max(screen.width||0,screen.height||0),vw,vh;
    if(sw&&sw<=600){                                 /* HP: sky memenuhi layar, diputar 90° (mode ROT) */
      rot=lrDir();vw=ih;vh=iw;
      STG.vw=vw;STG.vh=vh;STG.k=1;STG.w=iw;
    }else{
      vh=800;vw=450;                                 /* desktop/tablet: portrait 9:16, di-letterbox */
      STG.vw=vw;STG.vh=vh;STG.k=ih/vh;STG.w=Math.round(vw*STG.k);
    }
  }else{STG.vw=iw;STG.vh=ih;STG.k=1;STG.w=iw;}
  STG.on=on;STG.rot=rot;STG.iw=iw;STG.ih=ih;
  STG.g=(on&&!rot)?Math.max(0,Math.floor((iw-STG.w)/2)):0;
  /* sufiks transform supaya teks/label kecil di dalam stage tetap TEGAK di layar (putar balik terhadap stage) */
  STG.up=rot<0?' rotate(90deg)':(rot>0?' rotate(-90deg)':'');
  STG.pt=rot<0?' rotate(90deg) translate(-6px,-100%)':(rot>0?' rotate(-90deg) translate(-6px,0)':'');
  try{
    de.style.setProperty('--stw',STG.w+'px');de.style.setProperty('--gut',STG.g+'px');
    de.style.setProperty('--vw',STG.vw+'px');de.style.setProperty('--vh',STG.vh+'px');de.style.setProperty('--k',STG.k);
    de.style.setProperty('--iw',iw+'px');de.style.setProperty('--ih',ih+'px');
    if(document.body){
      var cl=document.body.classList;
      cl.toggle('ls',on&&!rot);cl.toggle('lr',!!rot);cl.toggle('lr-cw',rot>0);
      STG.x=(on&&!rot)?document.body.getBoundingClientRect().left:0;STG.y=0;
    }
  }catch(eS){}
  return STG.vw;
}
/* konversi titik: ruang virtual (kanvas/stage) <-> koordinat layar asli (client) */
function v2c(x,y){
  if(!STG.on)return [x,y];
  if(STG.rot<0)return [y,STG.ih-x];
  if(STG.rot>0)return [STG.iw-y,x];
  return [x*(STG.k||1)+STG.x,y*(STG.k||1)+STG.y];
}
function c2v(cx,cy){
  if(!STG.on)return [cx,cy];
  if(STG.rot<0)return [STG.ih-cy,cx];
  if(STG.rot>0)return [cy,STG.iw-cx];
  var k=STG.k||1;return [(cx-STG.x)/k,(cy-STG.y)/k];
}
/* rect (koordinat layar asli) -> ruang koordinat virtual (kanvas) */
function vconv(r){
  if(!STG.on)return r;
  if(STG.rot){
    var a=c2v(r.left,r.top),b=c2v(r.right,r.bottom);
    var l=Math.min(a[0],b[0]),rr=Math.max(a[0],b[0]),t=Math.min(a[1],b[1]),bb=Math.max(a[1],b[1]);
    return {left:l,top:t,right:rr,bottom:bb,width:rr-l,height:bb-t,x:l,y:t};
  }
  var k=STG.k||1,l2=(r.left-STG.x)/k,t2=(r.top-STG.y)/k,w=r.width/k,h=r.height/k;
  return {left:l2,top:t2,right:l2+w,bottom:t2+h,width:w,height:h,x:l2,y:t2};
}
/* rect elemen di dalam #stage dalam ruang koordinat virtual (kanvas) */
function vrect(el){return vconv(el.getBoundingClientRect());}
/* titik pointer di koordinat layar ASLI (tanpa konversi stage) - buat gesture arah layar, mis. swipe Konami */
function scrPt(e){STG.raw=true;try{return [e.clientX,e.clientY];}finally{STG.raw=false;}}
(function(){ /* clientX/clientY event & touch otomatis dikonversi ke ruang virtual stage (termasuk rotasi 90°) */
  function hook(proto){
    try{
      var dX=proto&&Object.getOwnPropertyDescriptor(proto,'clientX'),dY=proto&&Object.getOwnPropertyDescriptor(proto,'clientY');
      if(!dX||!dY||!dX.get||!dY.get||dX.get._stg)return;
      var gX=dX.get,gY=dY.get;
      var nX=function(){
        var v=gX.call(this);if(!STG.on||STG.raw)return v;
        if(STG.rot)return STG.rot<0?STG.ih-gY.call(this):gY.call(this);
        return (v-STG.x)/(STG.k||1);
      };
      var nY=function(){
        var v=gY.call(this);if(!STG.on||STG.raw)return v;
        if(STG.rot)return STG.rot<0?gX.call(this):STG.iw-gX.call(this);
        return (v-STG.y)/(STG.k||1);
      };
      nX._stg=1;nY._stg=1;
      Object.defineProperty(proto,'clientX',{configurable:true,enumerable:dX.enumerable,get:nX});
      Object.defineProperty(proto,'clientY',{configurable:true,enumerable:dY.enumerable,get:nY});
    }catch(eH){}
  }
  var P=[window.MouseEvent&&MouseEvent.prototype,window.Touch&&Touch.prototype];
  for(var i=0;i<P.length;i++)hook(P[i]);
})();
/* Penempatan label anti-kepotong + anti-tabrakan. Dipanggil per label tiap frame; daftar kotak label frame ini ditampung di LBLR (direset tiap `now` baru).
   x,y = posisi bintang di kanvas; w,h = ukuran blok teks (nama + tipe spektral); cands = kandidat [ox,oy,al] berurutan dari yang paling disukai
   (ox/oy = offset titik teks dari bintang dalam sumbu LAYAR (setelah uprBegin), oy = baseline; al = 'l' | 'r' | 'c' = teks mulai di / berakhir di / berpusat di ox).
   Dipilih kandidat pertama yang muat di layar dan nggak menimpa label lain; kalau semua gagal dipakai yang skornya terendah, lalu digeser masuk ke dalam layar.
   Return [ox,oy,al] final. */
var LBLR=[];LBLR.t=-1;
/* Area terlarang label = panel UI yang menutupi langit: panel CAM (zoom + tombol fokus/pita/garis), kartu rasi, sheet katalog, radar sektor, tombol mode.
   Kotaknya dibaca dari DOM tiap ~250ms (bukan tiap frame) dan diubah ke ruang yang sama dengan lblFit (ruang stage; mode ROT = koordinat layar asli). */
var _lblUi={t:-1e9,r:[]};
var LBL_UI_SEL=['#cam-zoom','#cam-whisper','#cam-cat','#cam-ach','#sector-scan','#cg-btn','#mode-cluster'];
function lblUiSeed(){
  var tn=performance.now(),i,el,b,cs,k,x0,x1,y0,y1,rr;
  if(tn-_lblUi.t>250){
    _lblUi.t=tn;_lblUi.r=[];
    for(i=0;i<LBL_UI_SEL.length;i++){
      el=document.querySelector(LBL_UI_SEL[i]);if(!el)continue;
      b=el.getBoundingClientRect();if(b.width<4||b.height<4)continue;
      cs=getComputedStyle(el);if(cs.visibility==='hidden'||cs.display==='none'||+cs.opacity<.05)continue;
      x0=b.left;x1=b.right;y0=b.top;y1=b.bottom;
      if(!STG.rot&&STG.on){k=STG.k||1;x0=(x0-STG.x)/k;x1=(x1-STG.x)/k;y0=(y0-STG.y)/k;y1=(y1-STG.y)/k;}
      _lblUi.r.push([x0-4,x1+4,y0-4,y1+4,1.6]);
    }
  }
  for(i=0;i<_lblUi.r.length;i++){rr=_lblUi.r[i];LBLR.push([rr[0],rr[1],rr[2],rr[3],rr[4]]);}
}
function lblFit(now,x,y,w,h,cands){
  var sx=x,sy=y,limW=W,limH=H,m=6,i,j,cd,x0,x1,y0,y1,ov,col,sc,r,best=null,bs=1e9,dx=0,dy=0;
  if(STG.rot){var pp=v2c(x,y);sx=pp[0];sy=pp[1];limW=STG.iw;limH=STG.ih;}
  if(LBLR.t!==now){LBLR.length=0;LBLR.t=now;lblUiSeed();}
  for(i=0;i<cands.length;i++){
    cd=cands[i];
    x0=cd[2]==='r'?sx+cd[0]-w:(cd[2]==='c'?sx+cd[0]-w/2:sx+cd[0]);x1=x0+w;
    y0=sy+cd[1]-9;y1=y0+h;
    ov=Math.max(0,m-x0)+Math.max(0,x1-(limW-m))+Math.max(0,8-y0)+Math.max(0,y1-(limH-m));
    col=0;for(j=0;j<LBLR.length;j++){r=LBLR[j];if(x0<r[1]&&x1>r[0]&&y0<r[3]&&y1>r[2])col+=r[4]||1;}   /* kotak UI (r[4]=1.6) lebih 'terlarang' daripada label lain */
    sc=ov*10+col*40+i*.01;
    if(sc<bs){bs=sc;best=[cd,x0,x1,y0,y1];}
    if(sc<.5)break;
  }
  x0=best[1];x1=best[2];y0=best[3];y1=best[4];
  if(x0<m)dx=m-x0;else if(x1>limW-m)dx=limW-m-x1;
  if(y0<8)dy=8-y0;else if(y1>limH-m)dy=limH-m-y1;
  LBLR.push([x0+dx,x1+dx,y0+dy,y1+dy,1]);
  return [best[0][0]+dx,best[0][1]+dy,best[0][2]];
}
/* Teks/sprite di canvas ikut berputar bareng #stage di HP landscape. uprBegin putar balik terhadap titik (x,y) supaya tegak di layar. */
function upAng(){return STG.rot<0?Math.PI/2:(STG.rot>0?-Math.PI/2:0);}
function uprBegin(x,y){
  if(!STG.rot)return false;
  g.save();g.translate(x,y);g.rotate(upAng());g.translate(-x,-y);return true;
}
function uprEnd(on){if(on)g.restore();}
var skyRot=0;
var skyZoom=1;
window.__layoutEditMode=false;
function isLayoutEdit(){return!!window.__layoutEditMode;}

var CAMERA_MODE=false;
var GAME_ON=false;   /* mode 🎮 (game alignment) di kamera: default mati, mati lagi saat kamera mati. Game cuma jalan kalau true. */
var _gamePrevLines=true;   /* pilihan tombol GARIS sebelum 🎮 dinyalakan (dipulihkan saat 🎮 mati) */
var CAM_LINES=true;   /* garis rasi di mode kamera: tombol LINES (reset ON saat kamera mati) */
var BAND='vis';   /* filter pita spektral kamera: 'vis' | 'uv' | 'ir' (aktif hanya saat CAMERA_MODE) */
/* Rasi yang digabung di overview (mis. Taurus nyambung ke Auriga lewat Elnath): `joinTo` di sky-data.js.
   Di overview keduanya gerak/goyang bareng (satu 'lead'), di mode kamera fokus rasi pasangannya disembunyikan. */
var JOIN_LEAD={};SKY.rasi.forEach(function(r){if(r.joinTo)JOIN_LEAD[r.id]=r.joinTo;});
function joinPartner(id){if(JOIN_LEAD[id])return JOIN_LEAD[id];for(var k in JOIN_LEAD)if(JOIN_LEAD[k]===id)return k;return null;}
function joinHide(id){if(!CAMERA_MODE)return false;var f=camFocusId();return !!f&&f!=='free'&&f!==id&&joinPartner(id)===f;}
var ZOOM_LEVELS=[1,1.5,2,3,5,10];   /* langkah tombol/ketuk zoom kamera */
var ZOOM_MAX=ZOOM_LEVELS[ZOOM_LEVELS.length-1];   /* batas atas zoom bebas (cubit/roda) = level terakhir */
var skyDrag={on:false,moved:false,pid:null,x0:0,y0:0,px:0,py:0};
var skyPtrs={};
var skyAll={},skyGestureAt=0; /* semua kontak sentuh (termasuk yang jatuh di bintang) + waktu gesture 2 jari terakhir */
var skyRotDrag={on:false,a0:0,r0:0};
var skyPinch={on:false,d0:0,z0:1};
var tapFlash={until:0,cons:null};
var _skyT=[0,0];
var _rotKey=NaN,_rotC=1,_rotS=0;
function skyXF(x,y){
  /* Rotate + zoom constellation space around screen center (pan already in x/y via ox).
     Zoom only affects the sky layer via this transform — UI chrome stays fixed.
     cos/sin are cached per skyRot value (it changes rarely; skyXF runs hundreds of times/frame). */
  var cx=W*.5,cy=H*.5,dx=x-cx,dy=y-cy;
  if(skyRot*skyRot>=1e-8){
    if(skyRot!==_rotKey){_rotKey=skyRot;_rotC=Math.cos(skyRot);_rotS=Math.sin(skyRot);}
    var c=_rotC,s=_rotS;
    var rx=dx*c-dy*s,ry=dx*s+dy*c;
    dx=rx;dy=ry;
  }
  if(skyZoom!==1){dx*=skyZoom;dy*=skyZoom;}
  _skyT[0]=cx+dx;_skyT[1]=cy+dy;return _skyT;
}
function gSky(x,y){var t=skyXF(x,y);return gravityPos(t[0],t[1]);}
/* ================= Spatial Viewport Culling — "Deep Space Sector Scan" =================
   Objects are tested in screen space (right after skyXF: pan/rotate/zoom) against the
   viewport + safety margin BEFORE any lens()/gravityPos() or line-sample work runs.
   Safe-by-construction rules:
   - lens() is the identity outside BH.Rr*9.5, so outside that zone the pre-lens position
     is the final position and the viewport test is exact.
   - Inside the lens zone a point can be displaced (up to ~2.85x its BH distance), so zone
     members are never culled — and the zone is ignored only when it is provably too far
     away for any displaced point to reach the viewport.
   - During the swallow animation (SW) pull() spirals everything toward the hole, so
     culling is switched off entirely. */
var CULL={on:true,off:false,m:64,x0:0,y0:0,x1:0,y1:0,zone:false,bx:0,by:0,zr2:0,
  tot:0,drawn:0,saved:0,lTot:0,lDrawn:0,lSaved:0};
function cullBegin(){
  CULL.lTot=CULL.tot;CULL.lDrawn=CULL.drawn;CULL.lSaved=CULL.saved;
  CULL.tot=0;CULL.drawn=0;CULL.saved=0;
  CULL.off=!CULL.on||!W||!H;
  CULL.zone=false;
  if(CULL.off)return;
  var m=Math.max(48,Math.min(W,H)*.12);
  CULL.m=m;CULL.x0=-m;CULL.y0=-m;CULL.x1=W+m;CULL.y1=H+m;
  var R=BH.Rr*(BHZ||1);
  if(R>=1){
    var bp=camBH(),bx=bp[0],by=bp[1],outer=R*9.5;
    /* distance from BH to the (unexpanded) viewport rect */
    var ex=Math.max(0,-bx,bx-W),ey=Math.max(0,-by,by-H);
    if(Math.sqrt(ex*ex+ey*ey)<=outer*2.9+m){
      CULL.zone=true;CULL.bx=bx;CULL.by=by;
      var zr=outer+m;CULL.zr2=zr*zr;
    }
  }
}
function cullIn(x,y,pad){
  if(CULL.off)return true;
  var m=pad||0;
  if(x>=CULL.x0-m&&x<=CULL.x1+m&&y>=CULL.y0-m&&y<=CULL.y1+m)return true;
  if(CULL.zone){var dx=x-CULL.bx,dy=y-CULL.by;if(dx*dx+dy*dy<=CULL.zr2)return true;}
  return false;
}
function cullSegIn(x1,y1,x2,y2){
  if(CULL.off)return true;
  var minx=x1<x2?x1:x2,maxx=x1<x2?x2:x1,miny=y1<y2?y1:y2,maxy=y1<y2?y2:y1;
  if(maxx>=CULL.x0&&minx<=CULL.x1&&maxy>=CULL.y0&&miny<=CULL.y1)return true;
  if(CULL.zone){
    var cx=CULL.bx<minx?minx:(CULL.bx>maxx?maxx:CULL.bx),cy=CULL.by<miny?miny:(CULL.by>maxy?maxy:CULL.by);
    var dx=cx-CULL.bx,dy=cy-CULL.by;
    if(dx*dx+dy*dy<=CULL.zr2)return true;
  }
  return false;
}
/* Culled gSky(): returns null when the point is outside the active sector (no lens work done). */
function gSkyC(x,y,pad,nc){
  var t=skyXF(x,y),tx=t[0],ty=t[1];
  if(!nc)CULL.tot++;
  if(!cullIn(tx,ty,pad)){if(!nc)CULL.saved++;return null;}
  if(!nc)CULL.drawn++;
  return gravityPos(tx,ty);
}
function cullSegAt(x1,y1,x2,y2){
  var a=skyXF(x1,y1),ax=a[0],ay=a[1],b=skyXF(x2,y2);
  return cullSegIn(ax,ay,b[0],b[1]);
}

/* ---------- Sector Scan HUD — per-sector minimap (camera / observe) ----------
   Di dalam sector: radar di-frame ke bounds rasi/cluster sector itu saja (bukan 4 kuadran full sky).
   Fokus kamera: target aktif di-highlight. Draw/cull stats tetap dari CULL. */
var SSC={el:null,cv:null,cx:null,sec:null,draw:null,cull:null,on:false,t:0,sT:'',dT:'',cT:''};
function ssInit(){
  SSC.el=document.getElementById('sector-scan');SSC.cv=document.getElementById('sector-radar');
  SSC.sec=document.getElementById('ss-sec');SSC.draw=document.getElementById('ss-draw');SSC.cull=document.getElementById('ss-cull');
  if(SSC.cv)SSC.cx=SSC.cv.getContext('2d');
  try{if(window.__hub)window.__hub.cull=CULL;}catch(e){}
}
function sectorScanUpdate(now){
  if(!SSC.el)ssInit();
  if(!SSC.el)return;
  var on=!!(CAMERA_MODE&&typeof OBSERVE_MODE!=='undefined'&&OBSERVE_MODE&&!SECT.on&&!!SECT.cur);
  if(on!==SSC.on){SSC.on=on;SSC.el.classList.toggle('on',on);SSC.el.setAttribute('aria-hidden',on?'false':'true');placeGameBtn();if(on)setTimeout(placeGameBtn,420);}
  if(!on||!SSC.cx||!W||!H)return;
  if(now-SSC.t<(IS_POTATO?250:100))return;
  SSC.t=now;

  var sect=SECT.cur,ids=sect.ids||[],fid=null;
  try{fid=typeof camFocusId==='function'?camFocusId():null;}catch(eF){}
  var pts=[],i,cs,cx,cy,lab;

  function pushPt(x,y,id,vis,rgb,r,label){
    pts.push({x:x,y:y,id:id,vis:!!vis,rgb:rgb,r:r||4,label:label||''});
  }
  for(i=0;i<CONS.length;i++){
    cs=CONS[i];
    if(!cs||ids.indexOf(cs.id)<0)continue;
    if(!(cs.maxX>-1e8))continue;
    cx=(cs.minX+cs.maxX)*.5;cy=(cs.minY+cs.maxY)*.5;
    lab=(cs.id==='canis'?'SIRIUS':cs.id==='scorpius'?'ANTARES':(cs.id||'').toUpperCase());
    pushPt(cx,cy,cs.id,(cs._vis|0)>0,'110,229,255',5,lab);
  }
  if(ids.indexOf('pleiades')>=0&&typeof PLEIADES!=='undefined'&&PLEIADES.ready&&PLEIADES.scale){
    pushPt(PLEIADES.x+.53*PLEIADES.scale,PLEIADES.y+.42*PLEIADES.scale,'pleiades',(PLEIADES._vis|0)>0,'190,218,255',4,'PLEIADES');
  }
  /* Optional: summoned Gargantua inside this sector */
  if(typeof BH!=='undefined'&&typeof RELAY!=='undefined'&&SECT.cur&&BHSC>.05){
    pushPt(BH.x,BH.y,'bh',true,'255,170,90',4,'BH');
  }

  /* Bounds of sector content (world / layout space) */
  var minX=1e18,minY=1e18,maxX=-1e18,maxY=-1e18;
  if(pts.length){
    for(i=0;i<pts.length;i++){
      if(pts[i].x<minX)minX=pts[i].x;if(pts[i].y<minY)minY=pts[i].y;
      if(pts[i].x>maxX)maxX=pts[i].x;if(pts[i].y>maxY)maxY=pts[i].y;
    }
  }else{
    minX=0;minY=0;maxX=W||1;maxY=H||1;
  }
  var padW=Math.max(40,(maxX-minX)*.22),padH=Math.max(40,(maxY-minY)*.22);
  minX-=padW;maxX+=padW;minY-=padH;maxY+=padH;
  var bw=Math.max(1,maxX-minX),bh=Math.max(1,maxY-minY);
  /* Square-ish frame so dots don't squash */
  if(bw>bh){var d=(bw-bh)*.5;minY-=d;maxY+=d;bh=bw;}
  else if(bh>bw){var d2=(bh-bw)*.5;minX-=d2;maxX+=d2;bw=bh;}

  var c=SSC.cx,S=168,pad=6,I=S-pad*2;
  function RX(x){return pad+(x-minX)/bw*I;}
  function RY(y){return pad+(y-minY)/bh*I;}

  c.clearRect(0,0,S,S);
  /* soft sector field */
  c.fillStyle='rgba(110,229,255,.05)';
  c.fillRect(pad,pad,I,I);
  c.strokeStyle='rgba(110,229,255,.34)';c.lineWidth=1;
  c.strokeRect(pad+.5,pad+.5,I-1,I-1);
  /* crosshair grid */
  c.strokeStyle='rgba(110,229,255,.12)';
  c.beginPath();c.moveTo(S/2,pad);c.lineTo(S/2,S-pad);c.moveTo(pad,S/2);c.lineTo(S-pad,S/2);c.stroke();
  c.beginPath();c.arc(S/2,S/2,I*.22,0,6.283);c.moveTo(S/2+I*.44,S/2);c.arc(S/2,S/2,I*.44,0,6.283);c.stroke();

  /* sweep */
  if(!reduce){
    var ang=(now*.0012)%6.2832,R2=I*.72;
    c.save();c.beginPath();c.rect(pad,pad,I,I);c.clip();
    for(i=0;i<7;i++){
      var an=ang-i*.06;
      c.strokeStyle='rgba(110,229,255,'+(.34*(1-i/7))+')';
      c.beginPath();c.moveTo(S/2,S/2);c.lineTo(S/2+Math.cos(an)*R2,S/2+Math.sin(an)*R2);c.stroke();
    }
    c.restore();
  }

  /* objects in this sector only */
  for(i=0;i<pts.length;i++){
    var p=pts[i],X=RX(p.x),Y=RY(p.y),focus=fid&&p.id===fid;
    if(focus){
      c.strokeStyle='rgba(234,252,255,.85)';c.lineWidth=1.5;
      c.beginPath();c.arc(X,Y,p.r+5,0,6.283);c.stroke();
      c.fillStyle='rgba('+p.rgb+',1)';
      c.beginPath();c.arc(X,Y,p.r+1.5,0,6.283);c.fill();
    }else if(p.vis){
      c.fillStyle='rgba('+p.rgb+',.95)';
      c.beginPath();c.arc(X,Y,p.r,0,6.283);c.fill();
    }else{
      c.strokeStyle='rgba('+p.rgb+',.38)';c.lineWidth=1;
      c.beginPath();c.arc(X,Y,p.r,0,6.283);c.stroke();
    }
  }

  /* viewport frame (visible window projected into sector field) */
  var z=skyZoom||1,cr=Math.cos(skyRot),sr=Math.sin(skyRot);
  var sx=[0,W,W,0],sy=[0,0,H,H],vx=[],vy=[],j;
  for(j=0;j<4;j++){
    var dx=(sx[j]-W*.5)/z,dy=(sy[j]-H*.5)/z;
    vx.push(W*.5+(dx*cr+dy*sr)-skyPan.x);
    vy.push(H*.5+(-dx*sr+dy*cr)-skyPan.y);
  }
  c.save();c.beginPath();c.rect(pad-1,pad-1,I+2,I+2);c.clip();
  c.beginPath();c.moveTo(RX(vx[0]),RY(vy[0]));
  for(j=1;j<4;j++)c.lineTo(RX(vx[j]),RY(vy[j]));
  c.closePath();
  c.fillStyle='rgba(255,255,255,.05)';c.fill();
  c.strokeStyle='rgba(255,255,255,.88)';c.lineWidth=1.5;c.stroke();
  var cwx=W*.5-skyPan.x,cwy=H*.5-skyPan.y;
  var px=RX(cwx),py=RY(cwy);
  c.strokeStyle='rgba(234,252,255,.9)';c.lineWidth=1;
  c.beginPath();c.moveTo(px-5,py);c.lineTo(px+5,py);c.moveTo(px,py-5);c.lineTo(px,py+5);c.stroke();
  c.restore();

  /* readout */
  var nm=(sect.name||sect.k||'SECTOR').toUpperCase();
  if(nm.length>10)nm=nm.slice(0,10);
  var secT=fid&&fid!=='free'?nm+' · '+(fid==='canis'?'SIRIUS':fid==='scorpius'?'ANTARES':fid==='pleiades'?'PLEIADES':fid==='bh'?'BH':String(fid).toUpperCase()):nm;
  var tot=CULL.lTot,dr=CULL.lDrawn;
  var drawT='DRAW '+dr+'/'+tot;
  var cullT='CULL '+(tot>0?Math.round((1-dr/tot)*100):0)+'% \u2212'+CULL.lSaved;
  if(secT!==SSC.sT){SSC.sT=secT;if(SSC.sec)SSC.sec.textContent=secT;}
  if(drawT!==SSC.dT){SSC.dT=drawT;if(SSC.draw)SSC.draw.textContent=drawT;}
  if(cullT!==SSC.cT){SSC.cT=cullT;if(SSC.cull)SSC.cull.textContent=cullT;}
}
var BHZ=1,BHK=0,BHSC=1;
var RELAY={x0:0,y0:0,moved:false,pend:0};   /* F10: .on dihapus (relay/portal sektor pensiun); sisanya dipakai dilatasi audio BH mini (02-sky-logic.js) */
/* OVSEL.seen = pengunjung sudah pernah membuka menu sektor -> petunjuk idle (cincin portal berdenyut, 15-portal3d.js) berhenti. (F6: .open/.t pensiun bersama ikon sektor.) */
var OVSEL={seen:false};
try{OVSEL.seen=localStorage.getItem('dumul_portal_seen')==='1';}catch(eOV){}
/* Tune Gargantua (panel 🎚️): size = ukuran, str = kekuatan lensing, bloom = glow hangat, speed = kecepatan animasi. Disimpan di localStorage.dumul_bh_cfg. */
var BHU_DEF={size:1,str:1,bloom:1,speed:1};
var BHU={size:1,str:1,bloom:1,speed:1};
var BHU_RNG={size:[.5,1.8],str:[0,2.5],bloom:[0,2],speed:[0,3]};
/* Asteroid: sabuk orbit BERDIRI SENDIRI (nggak ikut BH mini / slider Gargantua). Pusat = anchor home BH (BH.hx/hy lewat skyXF),
   jari-jari tetap (AST_K, pengali global), bidang miring ikut BH.ang. Toggle ada di panel tab Langit, disimpan di localStorage.dumul_ast_cfg. */
var AST_K=1;
/* AST_CFG: on = tampil, n = jumlah batu (-1 = otomatis dari ukuran layar), sz/w/spd = pengali ukuran / lebar orbit / kecepatan orbit, t = ketebalan cincin (sebaran radius + kemiringan elips; kecil = cincin tipis rapat). Disimpan di localStorage.dumul_ast_cfg */
var AST_DEF={on:1,n:120,sz:.5,w:2,spd:.4,t:.5,ring:1,mx:300,ed:.05,lm:15,tp:.05,arch:.3,fi:450,fo:260},   /* DEFAULT = hasil COPY TUNE 2026-10-29 (dulu n:-1 otomatis, sz/w/spd/t/arch 1, mx 600) */
    AST_RNG={n:[0,300],sz:[.4,2.5],w:[.3,8],spd:[0,3],t:[.1,3],mx:[50,1200],ed:[0,.3],lm:[0,60],tp:[0,.3],arch:[0,2],fi:[0,1500],fo:[0,1000]},
    AST_CFG={},AST_AUTO=40,AST_T=0,AST_TL=0;
/* knob sabuk di limb planet (tab Asteroid, ikut Save/Reset + terpisah overview vs sektor): ring = 1 sabuk di limb / 0 sabuk lama, (pengali jumlah .5 dan skala batu .95 = konstanta AST_RING_NK / AST_RING_Z di 04-render.js, bukan slider: sudah diwakili Jumlah dan Ukuran),
   mx = batas atas jumlah batu simulasi, ed = lebar fade di dua ujung busur (fraksi), lm = px fade dekat limb, tp = batas puncak busur dari tepi atas layar (fraksi tinggi layar), arch = lengkung busur (1 = seperti semula, 0 = rata mengikuti lengkung horizon planet, 2 = lebih melambung), fi / fo = durasi fade masuk / keluar (ms) */
var AST_KEYS=['sz','w','spd','t','mx','ed','lm','tp','arch','fi','fo'];
(function(){for(var k in AST_DEF)AST_CFG[k]=AST_DEF[k];})();
function astClamp(k,v){v=+v;if(!isFinite(v))return AST_DEF[k];var r=AST_RNG[k];return Math.max(r[0],Math.min(r[1],k==='n'?Math.round(v):v));}
function astNorm(o){var r={},k;for(k in AST_DEF)r[k]=AST_DEF[k];if(o&&typeof o==='object'){if(typeof o.on==='number')r.on=o.on>=.5?1:0;if(typeof o.ring==='number')r.ring=o.ring>=.5?1:0;
  if(typeof o.n==='number'&&o.n>=0)r.n=astClamp('n',o.n);AST_KEYS.forEach(function(q){if(typeof o[q]==='number')r[q]=astClamp(q,o[q]);});}return r;}
/* ===== Sabuk asteroid: set tune TERPISAH overview (0) vs sektor (1) =====
   Sektor = kunci lama dumul_ast_cfg (nilai lama tetap dipakai); overview = dumul_ast_cfg_o (kalau belum ada: disalin dari kunci lama).
   Ganti konteks (SECT.cur): AST_CFG diisi ulang dari set tujuan (objeknya tetap sama), sabuk mulai dari transparan lalu di-fade masuk (AST_MIX 0->1)
   setelah transisi selesai (terowongan wormhole / SECT.busy). Keluar sektor lewat back: sabuk di-fade keluar dulu sebelum konteks berganti. */
var AST_SETS=[null,null],AST_CTX=0,AST_MIX=1,AST_MIXT=0,AST_MIXL=0,astRepaint=null;   /* durasi fade = AST_CFG.fi / AST_CFG.fo (panel Asteroid) */
function astKey(){return 'dumul_ast_cfg';}   /* satu set tuning untuk overview + sektor (dulu terpisah: _o = overview) */
(function(){var s=null,o=null;
  try{s=JSON.parse(localStorage.getItem('dumul_ast_cfg')||'null');}catch(e){}
  try{o=JSON.parse(localStorage.getItem('dumul_ast_cfg_o')||'null');}catch(e){}
  AST_SETS[1]=astNorm(s||o);AST_SETS[0]=AST_SETS[1];   /* objek SAMA: ganti konteks tidak menukar nilai; simpanan sektor menang, fallback overview lama */
  AST_CFG=astNorm(AST_SETS[0]);
})();
function astCtxSync(){
  var cx=(typeof SECT!=='undefined'&&SECT.cur)?1:0;if(cx===AST_CTX)return;
  var k,from=AST_SETS[AST_CTX],to=AST_SETS[cx];
  for(k in AST_DEF)from[k]=AST_CFG[k];
  for(k in AST_DEF)AST_CFG[k]=to[k];
  AST_CTX=cx;AST_MIX=0;AST_MIXT=0;
  try{if(typeof astResize==='function')astResize();}catch(e){}
  try{if(astRepaint)astRepaint();}catch(e){}
}
/* satu langkah fade sabuk (dipanggil dari astStep): tahan 0 selama transisi sektor / terowongan wormhole, lalu naik mulus; keluar sektor (back) turun dulu */
function astMixStep(now){
  var dt=AST_MIXL?Math.min(100,Math.max(0,now-AST_MIXL)):16,busy=false,out=false;AST_MIXL=now;
  try{busy=!!((typeof SECT!=='undefined'&&SECT.busy)||(typeof whBusy==='function'&&whBusy()));out=!!(typeof SECT!=='undefined'&&SECT.busy&&SECT.phase==='out');}catch(e){}
  if(out&&AST_CTX===1){AST_MIX=Math.max(0,AST_MIX-dt/Math.max(1,AST_CFG.fo));AST_MIXT=0;}
  else if(AST_MIX<1){
    if(busy){AST_MIX=0;AST_MIXT=0;}
    else{if(!AST_MIXT)AST_MIXT=now;var u=Math.min(1,(now-AST_MIXT)/Math.max(1,AST_CFG.fi));AST_MIX=u*u*(3-2*u);}
  }
  return AST_MIX;
}
function bhuClamp(k,v){var r=BHU_RNG[k];v=+v;if(!(v===v))v=BHU_DEF[k];return Math.max(r[0],Math.min(r[1],v));}
try{var _bc=JSON.parse(localStorage.getItem('dumul_bh_cfg')||'null');if(_bc)for(var _bk in BHU_DEF)if(typeof _bc[_bk]==='number')BHU[_bk]=bhuClamp(_bk,_bc[_bk]);}catch(e){}
/* ===== Tune terpisah: overview vs BH mini di dalam sector =====
   Sector: BHSC = BHU.size / BH_SECT_MAXSIZE. size 1.80 = seukuran BH overview (1.00×).
   Default sector 0.50 (slider min) → BHSC 0.28× (bisa recall/summon lagi via tombol; nilai yang pernah di-Save di panel tune tetap dipakai sampai di-Reset).
   BH sector TIDAK membesar/mengecil karena dekat/jauh dari rasi (ukuran murni dari slider). */
var BHU_SDEF={size:0.5,str:1,bloom:1,speed:1},BH_SECT_MAXSIZE=1.8;
var BHU_O={},BHU_S={},BHU_CTX=0,bhuRepaint=null;
(function(){for(var k in BHU_DEF){BHU_O[k]=BHU[k];BHU_S[k]=BHU_SDEF[k];}
  try{var c=JSON.parse(localStorage.getItem('dumul_bh_cfg_s')||'null');if(c)for(var k2 in BHU_SDEF)if(typeof c[k2]==='number')BHU_S[k2]=bhuClamp(k2,c[k2]);}catch(e){}})();
function bhuDef(){return BHU_CTX?BHU_SDEF:BHU_DEF;}
function bhuKey(){return BHU_CTX?'dumul_bh_cfg_s':'dumul_bh_cfg';}
function bhSizeMul(){return BHU_CTX?1:BHU.size;} /* sector: ukuran sudah masuk ke BHSC */
function bhuCtxSync(){ /* tukar set tune aktif saat masuk/keluar sector */
  var cx=(typeof SECT!=='undefined'&&SECT.cur)?1:0;if(cx===BHU_CTX)return;
  var from=BHU_CTX?BHU_S:BHU_O,to=cx?BHU_S:BHU_O,k;
  for(k in BHU_DEF){from[k]=BHU[k];}
  for(k in BHU_DEF){BHU[k]=to[k];}
  BHU_CTX=cx;try{if(bhuRepaint)bhuRepaint();}catch(e){}
}
var bhTuneClose=null; /* diisi controller panel tune: tutup panel dari luar (mode kamera) */
var bhTuneSync=null; /* diisi controller panel tune */
function camBH(){
  var px=BH.x+skyPan.x*BHK,py=BH.y+skyPan.y*BHK;
  if(skyZoom===1)return [px,py];
  var cx=W*.5,cy=H*.5;
  return [cx+(px-cx)*skyZoom,cy+(py-cy)*skyZoom];
}
function formatZoom(z){
  if(Math.abs(z-1)<.01)return '1×';
  if(Math.abs(z-1.5)<.01)return '1.5×';
  if(Math.abs(z-2)<.01)return '2×';
  if(Math.abs(z-3)<.01)return '3×';
  return (Math.round(z*10)/10)+'×';
}
function snapZoom(z){
  var best=ZOOM_LEVELS[0],bd=1e9;
  for(var i=0;i<ZOOM_LEVELS.length;i++){
    var d=Math.abs(ZOOM_LEVELS[i]-z);
    if(d<bd){bd=d;best=ZOOM_LEVELS[i];}
  }
  return best;
}
function nearestZoomIndex(z){
  var best=0,bd=1e9;
  for(var i=0;i<ZOOM_LEVELS.length;i++){
    var d=Math.abs(ZOOM_LEVELS[i]-z);
    if(d<bd){bd=d;best=i;}
  }
  return best;
}
function setSkyZoom(z,snap){
  z=Math.max(1,Math.min(ZOOM_MAX,+z||1));
  if(snap)z=snapZoom(z);
  if(Math.abs(z-skyZoom)<1e-4){updateCamZoomUI();return;}
  skyZoom=z;
  updateCamZoomUI();
  try{syncSkyPanHits();}catch(e){}
  try{
    var bhEl=document.getElementById('bh');
    if(bhEl&&typeof BH!=='undefined'&&W){
      var p=camBH();
      bhEl.style.width=Math.round(BH.R*16)+'px';
      bhEl.style.height=Math.round(BH.R*10)+'px';
      bhEl.style.transform='translate('+Math.round(p[0]-BH.R*8)+'px,'+Math.round(p[1]-BH.R*5)+'px)';
    }
  }catch(e2){}
}
function stepSkyZoom(dir){
  var i=nearestZoomIndex(skyZoom);
  var ni=Math.max(0,Math.min(ZOOM_LEVELS.length-1,i+(dir>0?1:-1)));
  setSkyZoom(ZOOM_LEVELS[ni],false);
  haptic(8);
}
var _slDrag=false;   /* true selama jari/pointer memegang slider zoom */
function updateCamZoomUI(){
  var el=document.getElementById('cam-zoom');
  var val=document.getElementById('cam-zoom-val');
  if(val)val.textContent=formatZoom(skyZoom);
  var sl=document.getElementById('cam-zslider');
  if(sl){var zt=zoomToT(skyZoom);if(!_slDrag&&Math.abs((+sl.value)-zt)>1)sl.value=zt;sl.setAttribute('aria-valuetext',formatZoom(skyZoom));}   /* saat jari di slider, nilainya JANGAN ditulis ulang dari kode (snap magnetik di 10x bikin jempol 'melawan' jari dan loncat-loncat) */
  if(el){
    var show=!!(CAMERA_MODE&&typeof OBSERVE_MODE!=='undefined'&&OBSERVE_MODE);
    el.classList.toggle('on',show);
    el.setAttribute('aria-hidden',show?'false':'true');
    if(show!==_czShown){_czShown=show;camDock();setTimeout(function(){camDock();placeGameBtn();},420);}
  }
}
/* Ukur posisi atas panel CAM -> var --cz-top. CSS pakai ini buat: (1) kartu info compact (landscape) nggak boleh turun ke bawah slider zoom,
   (2) radar HUD (portrait) naik di atas panel CAM, bukan nimpa. Panel off/hidden => var dihapus (CSS jatuh ke nilai bawaan). */
var _czShown=false;
function camDock(){
  var z=document.getElementById('cam-zoom'),rs=document.documentElement.style;
  if(!z||!z.classList.contains('on')){rs.removeProperty('--cz-top');return;}
  var r=z.getBoundingClientRect();
  if(r.height>0)rs.setProperty('--cz-top',Math.round(r.top)+'px');else rs.removeProperty('--cz-top');
}
window.addEventListener('resize',function(){setTimeout(function(){camDock();placeGameBtn();},120);});
window.addEventListener('orientationchange',function(){setTimeout(function(){camDock();placeGameBtn();},400);});

/* Slider zoom kamera: skala logaritmik 1..ZOOM_MAX (t 0..1000, supaya 1→10 terasa rata), snap magnetik ke ZOOM_LEVELS, tanda tick dibuat dari ZOOM_LEVELS. */
function zoomToT(z){return Math.round(Math.log(Math.max(1,z))/Math.log(ZOOM_MAX)*1000);}
function tToZoom(t){return Math.pow(ZOOM_MAX,t/1000);}
(function(){
  var sl=document.getElementById('cam-zslider'),wrap=document.getElementById('cam-zwrap');
  if(!sl||!wrap)return;
  var i,tk,lastSnap=-1,stop=function(e){e.stopPropagation();};
  for(i=1;i<ZOOM_LEVELS.length-1;i++){tk=document.createElement('i');tk.style.setProperty('--p',(zoomToT(ZOOM_LEVELS[i])/1000).toFixed(3));wrap.appendChild(tk);}
  ['pointerdown','mousedown','touchstart','touchmove','wheel'].forEach(function(n){sl.addEventListener(n,stop,{passive:true});});   /* geser slider tidak boleh ikut jadi pan/tap/pinch di langit */
  /* Pegang slider = pengguna yang memegang kendali zoom: animasi kamera otomatis (FOCUS.anim menarik zoom ke g.z, _freeReset menarik zoom ke 1x) dimatikan,
     kalau tidak slider yang didorong ke 10x ditarik balik sendiri. Nilai slider ditulis ulang dari zoom cuma setelah jari dilepas. */
  var endDrag=function(){if(!_slDrag)return;_slDrag=false;updateCamZoomUI();};
  var startDrag=function(){_slDrag=true;FOCUS.anim=false;_freeReset=false;};
  sl.addEventListener('pointerdown',startDrag,{passive:true});
  sl.addEventListener('touchstart',startDrag,{passive:true});
  ['pointerup','pointercancel','touchend','touchcancel','change','blur'].forEach(function(n){sl.addEventListener(n,endDrag,{passive:true});});
  window.addEventListener('pointerup',endDrag,{passive:true});
  window.addEventListener('pointercancel',endDrag,{passive:true});
  sl.addEventListener('input',function(){
    var t=+sl.value,z=tToZoom(t),k,snap=-1;
    FOCUS.anim=false;_freeReset=false;
    for(k=1;k<ZOOM_LEVELS.length;k++){if(Math.abs(t-zoomToT(ZOOM_LEVELS[k]))<=14){z=ZOOM_LEVELS[k];snap=k;break;}}
    if(snap!==lastSnap){if(snap>=0){try{haptic(6);}catch(e){}}lastSnap=snap;}
    setSkyZoom(z,false);
  });
})();

/* ---------- Filter pita spektral (VIS → UV → IR). Efeknya digambar di drawStars (04-render.js) dari SKY.physOf + SKY.bandShift. ---------- */
var BAND_ORDER=['vis','uv','ir'];   /* label tombol lewat T('cam.band.<pita>') di i18n.js */
function setBand(b){
  if(BAND_ORDER.indexOf(b)<0)b='vis';
  BAND=b;
  var el=document.getElementById('cb-btn');
  if(el){el.textContent=T('cam.band.'+b);el.setAttribute('aria-label',T('cam.band.aria'));el.setAttribute('data-band',b);el.setAttribute('aria-pressed',b!=='vis'?'true':'false');}
}
function setLines(on){
  CAM_LINES=!!on;
  var el=document.getElementById('cl-btn');
  if(el){el.textContent=T(CAM_LINES?'cam.lines.on':'cam.lines.off');el.setAttribute('aria-label',T('cam.lines.aria'));el.setAttribute('aria-pressed',CAM_LINES?'false':'true');el.setAttribute('data-off',CAM_LINES?'0':'1');}
}
function toggleLines(){if(GAME_ON)return;setLines(!CAM_LINES);haptic(8);}   /* 🎮 ON: garis dipaksa ON, tombol GARIS disembunyikan */
/* 🎮: saklar game alignment (achievement ALIGNED). ON: garis dipaksa ON; OFF: pilihan GARIS sebelumnya dipulihkan. */
function setGame(on,silent){
  on=!!on&&!!CAMERA_MODE;
  if(on===GAME_ON)return;
  if(on){_gamePrevLines=CAM_LINES;GAME_ON=true;setLines(true);}
  else{
    GAME_ON=false;
    achClose();
    if(typeof ALIGN!=='undefined'&&ALIGN.cid)endAlignment(false);   /* progres alignment dibatalkan diam-diam */
    setLines(_gamePrevLines);
  }
  document.body.classList.toggle('game-on',GAME_ON);
  var b=document.getElementById('cg-btn');
  if(b){b.setAttribute('aria-pressed',GAME_ON?'true':'false');b.setAttribute('data-on',GAME_ON?'1':'0');b.setAttribute('aria-label',T('cam.game.aria'));}
  if(!silent){
    haptic(10);
    if(GAME_ON&&typeof showModeToast==='function')showModeToast(T('toast.game.on'),null,3200);
  }
}
function toggleGame(){setGame(!GAME_ON);}
/* Tombol 🎮 ngambang tepat di bawah panel radar. Radar punya banyak varian posisi (portrait, compact, landscape), jadi posisinya
   diambil dari rect-nya (sudah termasuk translate/transform), bukan ditebak lewat CSS. Dipanggil saat radar on/off dan saat layout berubah. */
function placeGameBtn(){
  camDock();
  var b=document.getElementById('cg-btn'),s=SSC&&SSC.el;
  if(!b||!s)return;
  if(!SSC.on){b.classList.remove('show');return;}
  var r=s.getBoundingClientRect();
  if(!(r.width>0&&r.height>0))return;
  /* Di bawah radar kalau muat; kalau radar nempel di dasar layar (landscape / compact) pindah ke ATAS radar. */
  var bh=b.offsetHeight||32,vh=window.innerHeight||document.documentElement.clientHeight||0,top=r.bottom+6;
  if(vh&&top+bh>vh-8)top=r.top-6-bh;
  /* Radar bisa nempel tepat di atas panel CAM: kalau tombol di bawah radar jadi ketiban panel CAM yang lagi tampil, pindah ke ATAS radar. */
  var bw=b.offsetWidth||32,z=document.getElementById('cam-zoom');
  if(z&&z.classList.contains('on')){
    var zr=z.getBoundingClientRect();
    if(zr.height>0&&r.left<zr.right+4&&r.left+bw>zr.left-4&&top<zr.bottom&&top+bh>zr.top-4)top=r.top-6-bh;
  }
  if(top<4)top=4;
  b.style.left=Math.round(r.left)+'px';b.style.top=Math.round(top)+'px';
  b.classList.add('show');
}
function cycleBand(){setBand(BAND_ORDER[(BAND_ORDER.indexOf(BAND)+1)%BAND_ORDER.length]);haptic(8);}

/* Tap bintang non-SFX → pastikan Observation + Camera on, fokus ke rasi, tampilkan whisper/info. */
function openCamOnCons(cid){
  if(typeof isLayoutEdit==="function"&&isLayoutEdit())return;
  if(!cid||cid==='bh')return;
  if(typeof setObserveMode==='function'&&!OBSERVE_MODE)setObserveMode(true);
  if(typeof setCameraMode==='function'&&!CAMERA_MODE)setCameraMode(true);
  if(!FOCUS.list)FOCUS.list=focusList();
  var i,found=-1;
  for(i=0;i<FOCUS.list.length;i++)if(FOCUS.list[i].id===cid){found=i;break;}
  if(found<0){
    /* rasi mungkin off/di luar sektor aktif — tetap tampilkan whisper kalau ada */
    if(typeof focusFx==='function'){FFX.id=cid;FFX.t0=performance.now();showWhisper(cid);}
    return;
  }
  FOCUS.i=found;FOCUS.anim=true;_freeReset=false;
  focusUI();focusFx(cid);
}
function setCameraMode(on){
  if(typeof isLayoutEdit==="function"&&isLayoutEdit())return;
  if(on&&!(typeof OBSERVE_MODE!=='undefined'&&OBSERVE_MODE))return;
  if(on&&typeof lisBlock==='function'&&lisBlock('cam')){lisDenied('cam');return;}   /* Lost-in-Space */
  CAMERA_MODE=!!on;
  if(CAMERA_MODE&&typeof ensureCamGrid==='function'){try{ensureCamGrid();}catch(eCG){}}   /* bake grid di momen transisi, bukan di tengah frame */
  if(CAMERA_MODE&&typeof bhTuneClose==='function')bhTuneClose(); /* panel tune BH ketutup otomatis di mode kamera */
  document.body.classList.toggle('camera-mode',CAMERA_MODE);
  var btn=document.getElementById('mode-camera');
  if(btn){
    btn.classList.toggle('on',CAMERA_MODE);
    btn.setAttribute('aria-pressed',CAMERA_MODE?'true':'false');
    btn.title=CAMERA_MODE?T('mode.camera.exit'):T('mode.camera');
    btn.setAttribute('aria-label',CAMERA_MODE?T('mode.camera.exit'):T('mode.camera'));
    btn.hidden=!(typeof OBSERVE_MODE!=='undefined'&&OBSERVE_MODE);
  }
  if(!CAMERA_MODE){FOCUS.i=0;FOCUS.anim=false;_focusHome=null;_zoomOut=false;setSkyZoom(1,false);FOCUS.list=null;}   /* v12: gridCanvas TIDAK dilepas lagi (sekarang setengah resolusi, ~1/4 memori); ensureCamGrid() bake ulang hanya kalau DPR/rot/ukuran berubah atau plate di-bake ulang */
  else{FOCUS.list=focusList();FOCUS.i=0;}
  if(!CAMERA_MODE){FFX.id=null;hideWhisper();setGame(false,true);setBand('vis');setLines(true);}
  focusUI();
  updateCamZoomUI();
  if(typeof showModeToast==='function'){
    if(CAMERA_MODE)showModeToast(T('toast.camon'),null,2200);
    else if(typeof OBSERVE_MODE!=='undefined'&&OBSERVE_MODE)showModeToast(T('toast.camoff'),null,1400);
  }
  try{UIS.radar(CAMERA_MODE);}catch(eUR){}
}
/* ---------- Constellation Camera: focus targets (tap to lock + auto-fit zoom) ---------- */
var FOCUS={i:0,anim:false,list:null};
/* Per-sector focus order (display names use brightest star for canis/scorpius).
   Orion: Free → Sirius → Orion → Gemini → Taurus → Pleiades
   Virgo: Free → Boötes → Virgo · Sektor 03 (summer): Free → Antares */
/* Urutan kamera fokus per sektor: dari `focus` + `focusName` di sky-data.js. Rasi off / di luar sektor otomatis terlewat (sectShow). */
function focusList(){
  var order=SKY.focusOrder(SECT.cur?SECT.cur.k:null);
  var L=[{id:'free',n:T('cam.free')}];
  for(var i=0;i<order.length;i++){
    var id=order[i];
    if(sectShow(id,true))L.push({id:id,n:SKY.rasiBy[id].focusName||id});
  }
  /* Di dalam sektor, kalau BH mini lagi dipanggil: opsi fokus terakhir sebelum balik ke Free */
  if(SECT.cur)L.push({id:'bh',n:'Gargantua'});
  return L;
}
/* Free band of screen between the caption panel (top) and the CAM controls (bottom). */
var _cb={t:0,cx:0,cy:0,h:0,w:0};
function camBox(){
  var n=performance.now();
  if(n-_cb.t>250||!_cb.h){
    _cb.t=n;var top=0,bot=H,a=document.getElementById('cam-whisper'),b=document.getElementById('cam-zoom'),r;
    if(STG.rot){
      /* Mode ROT: panel kamera didock di kanan LAYAR (landscape biasa). Area bebas = pita kiri layar; dipetakan ke ruang virtual sky. */
      var rt2=STG.iw;
      if(a){r=a.getBoundingClientRect();if(r.height>0&&r.width>0)rt2=Math.min(rt2,r.left-12);}
      if(b){r=b.getBoundingClientRect();if(r.height>0&&r.width>0)rt2=Math.min(rt2,r.left-12);}
      if(rt2<STG.iw*.4)rt2=STG.iw*.6;
      var y0=STG.rot<0?0:STG.iw-rt2,y1=STG.rot<0?rt2:STG.iw;   /* sumbu panjang stage = sumbu x layar */
      _cb.cx=W*.5;_cb.w=W;_cb.cy=(y0+y1)/2;_cb.h=Math.max(60,(y1-y0)-24);
      return _cb;
    }
    if(STG.on){_cb.cx=W*.5;_cb.w=W;_cb.cy=H*.5;_cb.h=H*.8;return _cb;}
    if(document.body.classList.contains('cam-compact')){
      /* Short/wide screens: panels are docked on the right, so the free area is the left band. */
      var rt=W;
      if(a){r=a.getBoundingClientRect();if(r.height>0&&r.width>0)rt=Math.min(rt,r.left-12);}
      if(b){r=b.getBoundingClientRect();if(r.height>0&&r.width>0)rt=Math.min(rt,r.left-12);}
      if(rt<W*.4)rt=W*.6;
      _cb.cx=rt/2;_cb.w=rt;_cb.cy=H/2;_cb.h=H-24;
      return _cb;
    }
    if(a){r=a.getBoundingClientRect();if(r.height>0)top=r.bottom+14;}
    if(b){r=b.getBoundingClientRect();if(r.height>0)bot=r.top-14;}
    if(bot-top<H*.3){top=H*.22;bot=H*.8;}
    _cb.cx=W*.5;_cb.w=W;_cb.cy=(top+bot)/2;_cb.h=bot-top;
  }
  return _cb;
}
function focusGeom(id){
  var x,y,w,h;
  /* Katalog bintang: bintang yang dikunci menggantikan titik tengah rasi (pan menahan bintang itu di area bebas, zoom ke CAT_LOCK_Z). */
  if(CATLOCK&&CATLOCK.cid===id){var cgm=catGroupGeom(CATLOCK);if(cgm)return cgm;}   /* area kunci (1 bintang atau kelompok berdekatan) */
  if(id==='bh'){if(BHSC<.05)return null;return {x:BH.x,y:BH.y,z:1};} /* BH mini: auto-fit zoom 1x */
  if(id==='pleiades'){
    if(!PLEIADES.ready||!PLEIADES.scale)return null;
    x=PLEIADES.x+.53*PLEIADES.scale;y=PLEIADES.y+.42*PLEIADES.scale;w=.7*PLEIADES.scale;h=.5*PLEIADES.scale;
  }else{
    var c=cons(id);if(!c||c.maxX<-1e8)return null;
    x=(c.minX+c.maxX)/2;y=(c.minY+c.maxY)/2;w=c.maxX-c.minX;h=c.maxY-c.minY;
  }
  var cb=camBox(),z=Math.min((cb.w||W)*.8/Math.max(w,1),cb.h*.94/Math.max(h,1));
  /* landscape + kamera: rasi diputar tegak, jadi lebar rasi lari ke sumbu layar-horizontal (pita bebas cb.h) */
  if(STG.rot&&CAMERA_MODE&&id!=='bh')z=Math.min(cb.h*.94/Math.max(w,1),(cb.w||W)*.8/Math.max(h,1));
  return {x:x,y:y,z:Math.max(1,Math.min(3,z))};
}
/* Tombol tengah panel CAM: nama rasi fokus / Free. Di mode katalog (bintang terkunci) = nama bintangnya; titik anonim = "???"; nama dibaca langsung dari data tiap
   kali, jadi otomatis ikut berubah begitu nama bintang diisi di sky-data.js. "○" = kunci dilepas sementara (kamera Free, zoom tetap). */
function catLockName(){
  if(typeof CATLOCK==='undefined'||!CATLOCK)return null;
  return (CATLOCK.st&&CATLOCK.st.name)||(CATLOCK.pl&&CATLOCK.pl.name)||'???';
}
function focusUI(){
  var b=document.getElementById('cf-name');if(!b||!FOCUS.list)return;
  var f=FOCUS.list[FOCUS.i],ln=(typeof CAT!=='undefined'&&CAT&&CAT.open)?catLockName():null;
  if(ln!==null){   /* mode katalog: saklar KUNCI bintang (nama bintangnya sudah ada di sheet katalog) */
    b.textContent=T(_catFree?'cam.lock.off':'cam.lock.on');
    b.setAttribute('aria-label',T('cam.lock.aria'));b.setAttribute('aria-pressed',_catFree?'false':'true');b.setAttribute('data-off',_catFree?'1':'0');
    return;
  }
  /* Tombol tengah = saklar springback: label nama FUNGSI + status, bukan nama rasi (nama rasi ada di kartu rasi). */
  var sbOn=f.id!=='free';
  b.textContent=T(sbOn?'cam.sb.on':'cam.sb.off');
  b.setAttribute('aria-label',T('cam.sb.aria'));b.setAttribute('aria-pressed',sbOn?'true':'false');b.setAttribute('data-off',sbOn?'0':'1');
}
/* Tombol < dan >: rasi sebelumnya / berikutnya (Free dilewati; Free cuma lewat tombol tengah). */
function focusCycle(d){
  if(!FOCUS.list)FOCUS.list=focusList();
  var n=FOCUS.list.length,i=FOCUS.i,t=0;
  do{i=(i+d+n)%n;t++;}while(t<=n&&(FOCUS.list[i].id==='free'||!focusGeom(FOCUS.list[i].id)));
  if(t>n||FOCUS.list[i].id==='free'||!focusGeom(FOCUS.list[i].id))return;
  FOCUS.i=i;FOCUS.anim=true;_freeReset=false;
  focusUI();focusFx(FOCUS.list[i].id);haptic(8);
}
/* Tombol tengah = saklar springback (BUKAN auto zoom / auto fokus).
   FOKUS (●): layout langit (rasi / cluster) dikunci ke posisi saat tombol ditekan; digeser lalu dilepas -> meluncur balik ke posisi itu. Zoom TETAP.
   BEBAS: nggak ada springback, langit bebas digeser. Zoom & posisi nggak diubah sama sekali waktu pindah mode.
   Auto zoom + pusatkan ke rasi tetap cuma dari tombol < >, ketuk bintang, atau pilih bintang di katalog. */
var _focusBack=-1;
var _zoomOut=false;   /* true = focusStep menurunkan zoom ke 1x pelan-pelan */
function camZoomOut(){_zoomOut=true;FOCUS.anim=false;}
var _focusHome=null;   /* {id,x,y}: posisi pan "rumah" untuk springback; null = pakai titik tengah rasi (perilaku < > / ketuk bintang) */
/* Target fokus terdekat ke tengah area bebas (tanpa animasi): dipakai saat saklar dinyalakan dari BEBAS biar yang terfokus rasi yang lagi kelihatan. */
function focusNearest(){
  var L=FOCUS.list,cb=camBox(),ccx=W*.5,ccy=H*.5,z=Math.max(.2,skyZoom),best=-1,bd=1e18,k,g,dx,dy,qx,qy,sx,sy,d,rc=1,rs=0;
  if(!L)return -1;
  if(skyRot*skyRot>=1e-8){rc=Math.cos(skyRot);rs=Math.sin(skyRot);}
  for(k=1;k<L.length;k++){
    g=focusGeom(L[k].id);if(!g)continue;
    dx=g.x+skyPan.x-ccx;dy=g.y+skyPan.y-ccy;
    qx=dx*rc-dy*rs;qy=dx*rs+dy*rc;
    sx=ccx+z*qx;sy=ccy+z*qy;
    d=(sx-cb.cx)*(sx-cb.cx)+(sy-cb.cy)*(sy-cb.cy);
    if(d<bd){bd=d;best=k;}
  }
  return best;
}
function focusToggleFree(){
  if(!FOCUS.list)FOCUS.list=focusList();
  var cur=FOCUS.list[FOCUS.i],i;
  if(cur&&cur.id!=='free'){   /* FOKUS -> BEBAS: lepas springback, zoom & posisi TETAP */
    _focusBack=FOCUS.i;FOCUS.i=0;FOCUS.anim=false;_freeReset=false;_focusHome=null;
    focusUI();focusFx('free');haptic(8);return;
  }
  /* BEBAS -> FOKUS: pilih rasi terdekat ke tengah layar, kunci posisi sekarang sebagai "rumah". Nggak ada animasi zoom / geser. */
  i=focusNearest();
  if(i<0){   /* nggak ada yang kebaca: jatuh ke rasi terakhir / pertama yang valid */
    i=_focusBack>0&&_focusBack<FOCUS.list.length&&focusGeom(FOCUS.list[_focusBack].id)?_focusBack:-1;
    if(i<0){for(var k=1;k<FOCUS.list.length;k++)if(focusGeom(FOCUS.list[k].id)){i=k;break;}}
  }
  if(i<0)return;
  FOCUS.i=i;FOCUS.anim=false;_freeReset=false;
  _focusHome={id:FOCUS.list[i].id,x:skyPan.x,y:skyPan.y};
  catReset();FFX.id=null;hideWhisper();   /* saklar springback BUKAN pilih rasi: kartu rasi/cluster baru muncul lewat tap < > (focusFx) */
  focusUI();haptic(8);
}
/* Mode katalog (sheet bintang terbuka): < dan > pindah ke bintang sebelumnya / berikutnya di daftar; tombol tengah = lepas kunci (fokus rasi), lalu Free. */
function camNav(d){
  if(CAT.open&&CAT.cid){
    var ents=catEntries(CAT.cid),n=ents.length,i=-1,k;
    if(!n)return;
    for(k=0;k<n;k++)if(ents[k].key===CAT.sel){i=k;break;}
    i=i<0?(d>0?0:n-1):(i+d+n)%n;
    catPick(ents[i].key);return;
  }
  focusCycle(d);
}
var _catFree=false;   /* mode katalog: kunci bintang dilepas sementara -> kamera Free (zoom/pan tetap), reticle & sheet tetap */
function camCenter(){
  if(CAT.open&&CATLOCK){
    var k;
    if(_catFree){   /* Free -> kunci lagi ke bintang yang sama */
      _catFree=false;
      for(k=0;FOCUS.list&&k<FOCUS.list.length;k++)if(FOCUS.list[k].id===CAT.cid){FOCUS.i=k;break;}
      FOCUS.anim=true;_freeReset=false;focusUI();catLockPlace();haptic(8);return;
    }
    _catFree=true;FOCUS.i=0;FOCUS.anim=false;_freeReset=false;focusUI();catLockPlace();haptic(8);return;
  }
  focusToggleFree();
}
var FOCUS_WHISPER=SKY.FOCUS_WHISPER;
var FOCUS_INFO=SKY.FOCUS_INFO;
var FFX={id:null,t0:0},_whT=0;
function hideWhisper(){var w=document.getElementById('cam-whisper');if(w)w.classList.remove('on');clearTimeout(_whT);catReset();}
/* ---------- Spektrograf mini di kartu info rasi (#cam-whisper) ----------
   Strip spektrum bintang acuan rasi (SKY.consPhys): kontinum pelangi diredam sesuai suhu (benda hitam) + garis serapan ILUSTRATIF per kelas spektral
   (H Balmer, Ca H&K, Na D, Mg b, Fe, He I/II, pita TiO). Posisi garis dari panjang gelombang asli, tapi kekuatannya perkiraan artistik, bukan data pengukuran. */
var SPEC_L0=380,SPEC_L1=700,SPEC_W=240;
var SPEC_LINES={H:[410.2,434,486.1,656.3],CaHK:[393.4,396.8],Na:[589],Mg:[517.3],Gb:[430.5],Fe:[404,407,438,441,466,489,495,527,532,538,561,617,640,667],HeI:[402.6,447.1,471.3,492.2,587.6],HeII:[454.2,468.6,541.1]};
var SPEC_COL=[[400,'#7b2fff'],[450,'#3a5bff'],[500,'#19d6c8'],[550,'#7de02e'],[600,'#ffc22b'],[650,'#ff4b2b'],[700,'#a01212']];
function specStrength(L,s){   /* L = huruf kelas, s = 0..0.9 (digit/10) -> kekuatan tiap keluarga garis 0..1 */
  var o={H:0,CaHK:0,Na:0,Mg:0,Gb:0,Fe:0,HeI:0,HeII:0,TiO:0};
  switch(L){
    case'O':o.HeII=.55;o.HeI=.35;o.H=.35;break;
    case'B':o.HeI=.6-.5*s;o.H=.45+.4*s;break;
    case'A':o.H=.95-.35*s;o.CaHK=.2+.5*s;o.Fe=.1+.3*s;break;
    case'F':o.H=.65-.35*s;o.CaHK=.6+.2*s;o.Gb=.15;o.Fe=.25+.2*s;o.Na=.1;o.Mg=.1;break;
    case'G':o.H=.3-.1*s;o.CaHK=.9;o.Gb=.5;o.Mg=.45+.15*s;o.Na=.4+.2*s;o.Fe=.45;break;
    case'K':o.H=.15;o.CaHK=.95;o.Gb=.6;o.Mg=.6+.2*s;o.Na=.65+.2*s;o.Fe=.55;o.TiO=s>.4?.25:0;break;
    case'M':o.CaHK=.6;o.Mg=.5;o.Na=.6;o.Fe=.4;o.TiO=.55+.25*s;break;
  }
  return o;
}
function specSvg(spt,teff){
  var m=/^([OBAFGKM])(\d(?:\.\d)?)/.exec(spt||'');if(!m)return '';
  var L=m[1],s=Math.min(.9,parseFloat(m[2])/10),st=specStrength(L,s),sup=/I(a|b|ab)\b/.test(spt)?.7:1,W=SPEC_W,H=14,i,k,x,n,svg;
  function P(l){return 1/(Math.pow(l,5)*(Math.exp(1.438777e-2/(l*teff))-1));}
  var mx=0;for(i=0;i<=16;i++)mx=Math.max(mx,P((SPEC_L0+(SPEC_L1-SPEC_L0)*i/16)*1e-9));
  svg='<svg viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none" role="img" aria-label="'+T('cam.spec.note')+'"><defs><linearGradient id="ci-spg" x1="0" x2="1" y1="0" y2="0">';
  for(i=0;i<SPEC_COL.length;i++){
    var lam=SPEC_COL[i][0],f=Math.sqrt(P(lam*1e-9)/mx);
    svg+='<stop offset="'+((lam-SPEC_L0)/(SPEC_L1-SPEC_L0)).toFixed(3)+'" stop-color="'+SPEC_COL[i][1]+'" stop-opacity="'+(.16+.84*f).toFixed(2)+'"/>';
  }
  svg+='</linearGradient></defs><rect width="'+W+'" height="'+H+'" fill="#02070c"/><rect width="'+W+'" height="'+H+'" fill="url(#ci-spg)"/>';
  if(st.TiO>0){[[615,22],[670,26],[490,9]].forEach(function(b){
    x=(b[0]-SPEC_L0)/(SPEC_L1-SPEC_L0)*W;var bw=b[1]/(SPEC_L1-SPEC_L0)*W;
    svg+='<rect x="'+(x-bw/2).toFixed(1)+'" width="'+bw.toFixed(1)+'" height="'+H+'" fill="#000" opacity="'+(.5*st.TiO).toFixed(2)+'"/>';
  });}
  for(k in SPEC_LINES){
    var v=st[k];if(!v||v<.12)continue;
    for(i=0,n=SPEC_LINES[k];i<n.length;i++){
      x=(n[i]-SPEC_L0)/(SPEC_L1-SPEC_L0)*W;
      svg+='<rect x="'+(x-.5).toFixed(1)+'" width="'+((.9+1.4*v)*sup).toFixed(2)+'" height="'+H+'" fill="#000" opacity="'+Math.min(.92,.2+.8*v).toFixed(2)+'"/>';
    }
  }
  return svg+'</svg>';
}
function showWhisper(id){
  var w=document.getElementById('cam-whisper'),a=FOCUS_WHISPER[id],d=FOCUS_INFO[id],f=FOCUS.list&&FOCUS.list[FOCUS.i];
  if(!w||!d||!f)return;
  try{UIS.pop('open');}catch(eUP){}
  clearTimeout(_whT);w.classList.remove('on');
  var wh=a?a[(Math.random()*a.length)|0]:'';
  var rows=d.rows.slice(0,3),n=rows.length;
  var h='<div class="ci-i ci-tag" style="--d:.15s">'+d.tag+'</div><div class="ci-i ci-name" style="--d:.3s">'+f.n+'</div><div class="ci-rows">';
  for(var i=0;i<n;i++)h+='<b class="ci-i" style="--d:'+(.55+i*.14)+'s">'+rows[i][0]+'</b><span class="ci-i" style="--d:'+(.6+i*.14)+'s">'+rows[i][1]+'</span>';
  var t=.55+n*.14+.15,cbt=catBtn(id,t);
  h+='</div>';
  if(cbt){h+=cbt;t+=.25;}   /* tombol katalog bintang (spektrum pindah ke dalam katalog) */
  h+='<div class="ci-i ci-fact" style="--d:'+t+'s"><em>'+T('cam.fact')+'</em>'+d.fact+'</div><div class="ci-i ci-wh" style="--d:'+(t+.7)+'s">\u201c'+wh+'\u201d</div>';
  w.style.setProperty('--cc','rgb('+(d.rgb||'110,229,255')+')');
  setTimeout(function(){if(FFX.id!==id)return;w.innerHTML=h;w.classList.add('on');},260);
}
function focusFx(id){
  catReset();   /* ganti fokus rasi: sheet katalog ditutup dan kunci bintang dilepas */
  if(id==='free'){FFX.id=null;hideWhisper();return;}
  FFX.id=id;FFX.t0=performance.now();showWhisper(id);
  if(id==='bh'){[350,650,950].forEach(function(d){setTimeout(function(){if(FFX.id==='bh'){var p=camBH();createBHShockwave(p[0],p[1]);}},d);});}
}
/* ---------- Katalog bintang per rasi / cluster (mode kamera) ----------
   Tombol di kartu rasi membuka sheet (ukuran = kartu) berisi SEMUA titik bintang rasi itu. Ketuk satu baris -> kamera mengunci bintangnya
   (focusGeom ditimpa CATLOCK: pan menahan bintang di area bebas, zoom CAT_LOCK_Z) dan sheet menampilkan data lengkap + spektrograf.
   Titik yang belum teridentifikasi tampil "???". Kunci dilepas saat sheet ditutup, fokus rasi diganti, atau kamera dimatikan. */
var CATLOCK=null;                         /* {cid,key,st|pl}: bintang yang sedang dikunci */
var CAT={open:false,cid:null,view:'list',sel:null};
var CAT_LOCK_Z=6;                         /* zoom saat bintang dikunci (label & koronagraf sudah penuh di atas x5.5) */
var CAT_SFX=null;
function catEsc(s){return String(s).replace(/[&<>"]/g,function(c){return c==='&'?'&amp;':c==='<'?'&lt;':c==='>'?'&gt;':'&quot;';});}
/* nama dengan huruf Yunani (mis. \u03bb Boo): text-transform:uppercase di CSS mengubah \u03bb jadi \u039b (mirip 'A' tanpa palang), jadi dimatikan khusus nama begini */
var CAT_UNOBS='unobserved';   /* pengganti '???' di sheet katalog untuk data/nama yang belum ada */
function catNm(n){if(!n)return CAT_UNOBS;var h=catEsc(n);return /[\u0370-\u03ff]/.test(n)?'<span class="cc-gr">'+h+'</span>':h;}
function catSfxMap(){if(!CAT_SFX){CAT_SFX={};SKY.sfx.forEach(function(x){CAT_SFX[x.cons+'.'+x.star]=x;});}return CAT_SFX;}
/* daftar titik rasi/cluster: yang bernama dulu (terang -> redup), lalu yang anonim */
function catEntries(cid){
  var out=[],m=catSfxMap(),k,st,c;
  if(cid==='pleiades'){
    PLEIADES.bright.forEach(function(p){out.push({key:p.name.toLowerCase(),name:p.name,r:p.r,pl:p,sfx:m['pleiades.'+p.name]});});
    PLEIADES.dim.forEach(function(p,i){out.push({key:'d'+i,name:null,r:p.r,pl:p});});
  }else{
    c=cons(cid);if(!c)return out;
    for(k in c.stars){st=c.stars[k];out.push({key:k,name:st.name||null,r:st.r,st:st,sfx:m[cid+'.'+k]});}
  }
  out.forEach(function(e,i){var p=SKY.physOf(cid,e.key),q=!p.known&&cid==='pleiades'&&SKY.PL_PHYS&&SKY.PL_PHYS[e.key];if(q)p={spt:q.spt,teff:q.teff,dist:q.dist||null,mag:q.mag!=null?q.mag:null,ra:q.ra||null,dec:q.dec||null,known:true};   /* bintang terang Pleiades: data dari PL_PHYS (kalau field-nya kosong -> unobserved) */
    e.spt=p.known?p.spt:null;e.teff=p.known?p.teff:null;e.dist=p.known?p.dist:null;e.mag=p.known?p.mag:null;e.ra=p.known?p.ra:null;e.dec=p.known?p.dec:null;e.i=i;});
  out.sort(function(a,b){return (b.name?1:0)-(a.name?1:0)||b.r-a.r||a.i-b.i;});
  return out;
}
/* posisi dasar bintang di ruang sky (sebelum pan), sama dengan yang dipakai render/fxBase */
function catBase(L){
  if(!L)return null;
  if(L.pl){if(!PLEIADES.ready||!PLEIADES.scale)return null;return [PLEIADES.x+L.pl.x*PLEIADES.scale,PLEIADES.y+L.pl.y*PLEIADES.scale];}
  return L.st?[L.st.x,L.st.y]:null;
}
function catTc(t){   /* warna titik daftar dari suhu; tanpa data = abu netral */
  return !t?'120,140,155':t<4000?'255,150,90':t<5500?'255,205,130':t<7500?'255,246,220':t<10000?'215,230,255':'170,205,255';
}
function catShift(v){return (v>=0?'+':'\u2212')+Math.abs(v).toFixed(1);}
function catBtn(id,delay){
  if(id==='bh'||!FOCUS.list||!FOCUS.list[FOCUS.i]||FOCUS.list[FOCUS.i].id!==id)return '';
  var n=catEntries(id).length;if(!n)return '';
  return '<button type="button" class="ci-i ci-catbtn" data-cat="'+id+'" style="--d:'+delay+'s"><span>'+T('cat.btn')+'</span><b>'+n+'</b><i>\u203a</i></button>';
}
/* nama rasi sheet katalog: dari CAT.cid (bukan dari FOCUS.i, yang bisa lagi 'Free' saat kunci dilepas) */
function catConsName(){var L=FOCUS.list,i;if(L)for(i=0;i<L.length;i++)if(L[i].id===CAT.cid)return L[i].n;return CAT.cid;}
function catSheet(){return document.getElementById('cam-cat');}
/* Reticle kunci bintang katalog (#cat-lock).
   - Posisi = persis yang digambar render: s.x+c.ox (c.ox memuat pan + parallax per rasi) lewat skyHitXY (rotasi landscape, zoom, lensing
     Gargantua) - sama seperti tombol SFX. Parallax berubah tiap frame, jadi selama terkunci ada loop rAF kecil (1 transform + 1 var CSS).
   - Ukuran: dihitung dari radius lensa koronagraf (camLens: cincin terluar = 1.42*(3*rc+4), rc = inti bintang) + margin, jadi reticle selalu
     di luar lensa. Ukuran dipasang lewat --cs (lebar/tinggi di index.css), bukan scale, supaya garis tetap tipis.
   - Bintang yang berdekatan (sabuk Orion, Pleiades, atau lensa saling menyentuh, lihat CAT_GROUP_K) = SATU reticle area yang melingkupi semuanya;
     kamera juga memusatkan & men-zoom ke area itu (zoom turun kalau area lebih besar dari layar). */
var CAT_GROUPS={orion:[['alnitak','alnilam','mintaka']]};   /* kelompok pasti per rasi (kunci bintang di c.stars) */
var CAT_RET_K=2.1,CAT_RET_GK=2.0,CAT_RET_PAD=24;   /* ukuran retikel kunci: tepi luar = K*(radius lensa terluar) + PAD px; GK untuk kelompok bintang berdekatan (lebih lega) */
var CAT_GROUP_K=1.15;   /* otomatis satu area bila lensa dua bintang bernama (di zoom kunci) saling menyentuh: jarak <= K*(R1+R2); 0 = matikan, naikkan kalau kurang menyatu */
var _catRaf=0,_catLastT='',_catLastS=0;
function catMember(cid,o){return o.pl?{cid:cid,pl:o.pl,r:o.pl.r}:{cid:cid,st:o.st,r:o.st.r};}
function catGroupOf(L){
  var out=[],c,k,i,j,lists,lst,seen,q,m,d,pb,qb;
  if(L.pl){
    if(PLEIADES.bright&&PLEIADES.bright.indexOf(L.pl)>=0){PLEIADES.bright.forEach(function(p){out.push(catMember(L.cid,{pl:p}));});return out;}
    return [catMember(L.cid,L)];
  }
  c=cons(L.cid);if(!c||!L.st)return [catMember(L.cid,L)];
  lists=CAT_GROUPS[L.cid]||[];
  for(i=0;i<lists.length;i++){
    lst=lists[i];
    if(lst.indexOf(L.key)>=0){
      for(j=0;j<lst.length;j++)if(c.stars[lst[j]])out.push(catMember(L.cid,{st:c.stars[lst[j]]}));
      if(out.length)return out;
    }
  }
  if(CAT_GROUP_K>0&&L.st.name){   /* single-linkage antar bintang bernama; jarak diukur di layar pada zoom kunci (CAT_LOCK_Z) */
    var zk=Math.min(3,Math.sqrt(CAT_LOCK_Z));
    seen=[L.st];q=[L.st];
    while(q.length){
      m=q.pop();
      for(k in c.stars){
        d=c.stars[k];
        if(!d.name||seen.indexOf(d)>=0)continue;
        if(Math.hypot(d.x-m.x,d.y-m.y)*CAT_LOCK_Z<=CAT_GROUP_K*(catLensR(catMember(L.cid,{st:m}),zk)+catLensR(catMember(L.cid,{st:d}),zk))){seen.push(d);q.push(d);}
      }
    }
    if(seen.length>1)return seen.map(function(x){return catMember(L.cid,{st:x});});
  }
  return [catMember(L.cid,L)];
}
function catGrp(L){return L.grp||(L.grp=catGroupOf(L));}
/* selisih posisi gambar vs titik dasar (di luar skyPan): parallax dll. */
function catLockLive(M){
  var c,ex=0,ey=0;
  if(M.pl){ex=mouse.x*1.4;ey=mouse.y*1.0;}
  else{c=cons(M.cid);if(c&&c.ox!==undefined){ex=c.ox-skyPan.x;ey=(c.oy||0)-skyPan.y;}}
  return [ex,ey];
}
/* radius cincin lensa terluar bintang M di layar (mengikuti rumus camLens/drawStars di 04-render.js) */
function catLensR(M,zk){
  var k2=W<500?.95:1.2,r,rc;
  if(zk===undefined)zk=typeof camZK==='function'?camZK():1;
  r=(M.r||2)*k2*zk;
  rc=Math.max(.9,r*(M.pl?.7:.62));
  var lens=M.pl||(M.st&&M.st.name&&(typeof ringR!=='function'||M.st.r>=ringR()));
  return lens?1.42*(3*rc+4):rc*2+6;
}
/* geometri kamera untuk kunci: titik tengah area (ruang dasar) + zoom yang memuat seluruh anggota */
function catGroupGeom(L){
  var g=catGrp(L),pts=[],i,b,x0=1e9,x1=-1e9,y0=1e9,y1=-1e9,cx,cy,md=0,cb,fit,z;
  for(i=0;i<g.length;i++){b=catBase(g[i]);if(b)pts.push(b);}
  if(!pts.length)return null;
  for(i=0;i<pts.length;i++){x0=Math.min(x0,pts[i][0]);x1=Math.max(x1,pts[i][0]);y0=Math.min(y0,pts[i][1]);y1=Math.max(y1,pts[i][1]);}
  cx=(x0+x1)/2;cy=(y0+y1)/2;
  for(i=0;i<pts.length;i++)md=Math.max(md,Math.hypot(pts[i][0]-cx,pts[i][1]-cy));
  z=CAT_LOCK_Z;
  if(pts.length>1&&md>1){cb=camBox();fit=Math.min(cb.w||W,cb.h||H)*.5*.7-100;fit=Math.max(60,fit);   /* sisakan ruang buat retikel kelompok yang kini lebih besar */z=Math.max(1,Math.min(CAT_LOCK_Z,fit/md));}
  return {x:cx,y:cy,z:z};
}
function catLockLoop(){
  _catRaf=0;
  if(!CATLOCK||!CAMERA_MODE)return;
  catLockPlace();
}
function catLockPlace(){
  var el=document.getElementById('cat-lock');if(!el)return;
  var ok=CATLOCK&&CAMERA_MODE&&!_catFree&&catBase(CATLOCK);   /* kamera Free (kunci dilepas sementara) = reticle disembunyikan */
  if(!ok){el.classList.remove('on');_catLastT='';return;}
  var g=catGrp(CATLOCK),pts=[],i,M,b,lv,q,rr,x0=1e9,x1=-1e9,y0=1e9,y1=-1e9,cx,cy,R=0;
  for(i=0;i<g.length;i++){
    M=g[i];b=catBase(M);if(!b)continue;
    lv=catLockLive(M);q=skyHitXY(b[0]+lv[0],b[1]+lv[1]);
    rr=catLensR(M);pts.push([q[0],q[1],rr]);
    x0=Math.min(x0,q[0]-rr);x1=Math.max(x1,q[0]+rr);y0=Math.min(y0,q[1]-rr);y1=Math.max(y1,q[1]+rr);
  }
  if(!pts.length){el.classList.remove('on');return;}
  cx=(x0+x1)/2;cy=(y0+y1)/2;
  for(i=0;i<pts.length;i++)R=Math.max(R,Math.hypot(pts[i][0]-cx,pts[i][1]-cy)+pts[i][2]);
  var t='translate('+cx.toFixed(1)+'px,'+cy.toFixed(1)+'px)';
  if(t!==_catLastT){el.style.transform=t;_catLastT=t;}
  var cs=Math.max(36,2*((pts.length>1?CAT_RET_GK:CAT_RET_K)*R+CAT_RET_PAD-7));   /* cincin putus-putus ::before menonjol 7px di luar kotak, jadi tepi terluar = cs/2+7; sekarang jelas lebih besar dari lensa (juga saat zoom) */
  if(Math.abs(cs-_catLastS)>.5){el.style.setProperty('--cs',cs.toFixed(1)+'px');_catLastS=cs;}
  el.classList.add('on');
  if(!_catRaf)_catRaf=requestAnimationFrame(catLockLoop);
}
function catRenderList(){
  var s=catSheet(),f=FOCUS.list&&FOCUS.list[FOCUS.i],ents=catEntries(CAT.cid),h,i,e,on=null;
  if(!s)return;
  h='<div class="cc-hd"><div><div class="cc-tag">'+T('cat.title')+' \u00b7 '+ents.length+'</div><div class="cc-name">'+catEsc(catConsName())+'</div></div><button type="button" class="cc-x" aria-label="'+T('cat.close')+'">\u2715</button></div><div class="cc-body">';
  for(i=0;i<ents.length;i++){
    e=ents[i];
    h+='<button type="button" class="cc-row'+(CAT.sel===e.key?' on':'')+(e.name?'':' cc-anon')+'" data-k="'+catEsc(e.key)+'"><i style="background:rgb('+catTc(e.teff)+')"></i><b>'+catNm(e.name)+'</b><span>'+(e.spt?catEsc(e.spt):'')+'</span></button>';
  }
  s.innerHTML=h+'</div>';CAT.view='list';
  on=s.querySelector('.cc-row.on');var bd=s.querySelector('.cc-body');
  if(on&&bd)bd.scrollTop=Math.max(0,on.offsetTop-bd.clientHeight/2+on.offsetHeight/2);
}
function catRenderDetail(e){
  var s=catSheet(),f=FOCUS.list&&FOCUS.list[FOCUS.i],d=e.sfx&&e.sfx.data,h,rows=[];
  if(!s)return;
  rows.push([T('cat.class'),e.spt||CAT_UNOBS]);
  rows.push([T('cat.temp'),e.teff?e.teff+' K':CAT_UNOBS]);
  rows.push([T('cat.uvir'),e.teff?catShift(SKY.bandShift(e.teff,'uv'))+' / '+catShift(SKY.bandShift(e.teff,'ir')):CAT_UNOBS]);
  rows.push([T('cat.dist'),e.dist?e.dist+' LY':CAT_UNOBS]);
  rows.push([T('cat.mag'),e.mag!=null?e.mag.toFixed(2):CAT_UNOBS]);
  if(e.ra)rows.push([T('cat.radec'),catEsc(e.ra)+' \u00b7 '+catEsc(e.dec||'')]);
  h='<div class="cc-hd"><button type="button" class="cc-back">\u2039 '+T('cat.back')+'</button><button type="button" class="cc-x" aria-label="'+T('cat.close')+'">\u2715</button></div><div class="cc-body">'
   +'<div class="cc-tag">'+catEsc(catConsName())+' \u00b7 '+T('cat.locked')+'</div><div class="cc-name">'+catNm(e.name)+'</div><div class="cc-rows">';
  for(var i=0;i<rows.length;i++)h+='<b>'+rows[i][0]+'</b><span>'+rows[i][1]+'</span>';
  h+='</div>';
  if(e.spt&&e.teff){var sv=specSvg(e.spt,e.teff);if(sv)h+='<div class="cc-spec">'+sv+'<i>'+T('cam.spec')+' \u00b7 '+catEsc(e.spt)+'</i></div>';}
  else h+='<div class="cc-note">'+T('cat.anon')+'</div>';
  s.innerHTML=h+'</div>';CAT.view='detail';
}
function catOpen(cid){
  var w=document.getElementById('cam-whisper'),s=catSheet();
  if(!s||!w||!CAMERA_MODE||!catEntries(cid).length)return;
  var r=w.getBoundingClientRect(),d=FOCUS_INFO[cid];
  s.style.height=Math.max(170,Math.round(r.height))+'px';   /* sheet = ukuran kartu rasi */
  s.style.setProperty('--cc','rgb('+((d&&d.rgb)||'110,229,255')+')');
  try{UIS.pop('open');}catch(eUP){}
  CAT.open=true;CAT.cid=cid;CAT.sel=null;
  catRenderList();
  s.classList.add('on');document.body.classList.add('cat-open');
  haptic(8);
}
function catPick(key){
  var ents=catEntries(CAT.cid),e=null,i;
  for(i=0;i<ents.length;i++)if(ents[i].key===key){e=ents[i];break;}
  if(!e)return;
  CAT.sel=key;
  CATLOCK={cid:CAT.cid,key:key,st:e.st||null,pl:e.pl||null};
  FOCUS.anim=true;_freeReset=false;   /* kamera meluncur ke bintang (zoom + pan) lalu menahannya */
  _catFree=false;
  if(FOCUS.list&&FOCUS.list[FOCUS.i]&&FOCUS.list[FOCUS.i].id==='free'){for(var fi=0;fi<FOCUS.list.length;fi++)if(FOCUS.list[fi].id===CAT.cid){FOCUS.i=fi;break;}}   /* lagi Free (kunci dilepas) lalu pilih bintang lain: kamera kembali memegang rasi/bintang */
  catRenderDetail(e);catLockPlace();focusUI();haptic(8);
}
function catBack(){if(CAT.open){catRenderList();haptic(6);}}   /* kembali ke daftar; kunci tetap */
/* tutup tanpa animasi: dipakai saat fokus berganti / kamera mati / hideWhisper */
function catReset(){
  var s=catSheet(),el=document.getElementById('cat-lock');
  CATLOCK=null;_catFree=false;CAT.open=false;CAT.cid=null;CAT.sel=null;CAT.view='list';
  if(s)s.classList.remove('on');
  document.body.classList.remove('cat-open');
  if(el)el.classList.remove('on');
  try{focusUI();}catch(eU){}   /* tombol tengah balik ke nama rasi */
}
/* tombol X: tutup + lepas kunci, kamera kembali ke fokus rasi */
function catClose(){var had=!!CATLOCK;catReset();if(had&&CAMERA_MODE)FOCUS.anim=true;haptic(6);}
/* ---------- Sheet 🎮 "Constellation Log": dua achievement terpisah per rasi ----------
   ARCHIVED = semua SFX rasi sudah didengar sampai selesai (cuma rasi ber-SFX); ◆ ALIGNED = game alignment rasi itu selesai.
   Baris rasi ber-SFX bisa diketuk -> baca ulang Signal Fragment per bintang (yang belum didengar tampil ???). Pola sama dengan sheet katalog. */
var ACH={open:false,view:'list',cid:null};
function achSheet(){return document.getElementById('cam-ach');}
function achHasSfx(cid){var a=CONS_STARS[cid];return !!(a&&a.length);}
function achRenderList(){
  var s=achSheet();if(!s)return;
  var cids=UNLOCK_CONS,i,cid,al,arch,ready,st,tap,na=0,nsfx=0,nal=0,rows='';
  for(i=0;i<cids.length;i++){
    cid=cids[i];al=isAligned(cid);if(al)nal++;
    if(achHasSfx(cid)){
      nsfx++;arch=StellarMem.isArchived(cid);ready=!arch&&StellarMem.consComplete(cid);if(arch)na++;
      st=arch?T('sr.archived'):(ready?T('sr.ready'):T('sr.scanning'));tap=true;
    }else{arch=false;st='\u2014';tap=false;}
    rows+='<button type="button" class="cc-row'+(arch?' ach-arch':'')+(al?' ach-al':'')+(tap?'':' ach-na')+'" data-c="'+catEsc(cid)+'"'+(tap?'':' disabled')+'><i></i><b>'+catEsc(CONS_LABELS[cid]||cid)+'</b><span>'+st+'</span></button>';
  }
  s.innerHTML='<div class="cc-hd"><div><div class="cc-tag">'+T('ach.legend',{a:na,b:nsfx,c:nal,d:cids.length})+'</div><div class="cc-name">'+T('ach.title')+'</div></div><button type="button" class="cc-x" aria-label="'+T('ach.close')+'">\u2715</button></div><div class="cc-body">'+rows+'</div>';
  ACH.view='list';ACH.cid=null;
}
function achRenderDetail(cid){
  var s=achSheet(),keys=CONS_STARS[cid]||[],i,k,fr,ob,bits,h='';
  if(!s||!keys.length)return;
  for(i=0;i<keys.length;i++){
    k=keys[i];fr=SIGNAL_FRAGMENTS[k];
    if(fr&&StellarMem.isFragSeen(k)){
      ob=StellarMem.observed[k];bits=(fr.meta||[]).slice();
      if(ob&&ob.at)bits.unshift(T('sf.recovered',{s:ob.at}));
      h+='<div class="af"><div class="af-tag">'+catEsc(fr.tag)+'</div><div class="af-title">'+catEsc(fr.title)+'</div><div class="af-body">'+catEsc(fr.body)+'</div><div class="af-meta">'+bits.map(function(m){return '<span>'+catEsc(m)+'</span>';}).join('')+'</div></div>';
    }else h+='<div class="af af-lock"><div class="af-tag">???</div><div class="af-body">'+T('ach.unheard')+'</div></div>';
  }
  s.innerHTML='<div class="cc-hd"><button type="button" class="cc-back" aria-label="'+T('ach.back')+'">\u2039</button><div class="ach-dn"><div class="cc-tag">'+T('ach.frag')+'</div><div class="cc-name">'+catEsc(CONS_LABELS[cid]||cid)+'</div></div><button type="button" class="cc-x" aria-label="'+T('ach.close')+'">\u2715</button></div><div class="cc-body">'+h+'</div>';
  ACH.view='detail';ACH.cid=cid;
  var bd=s.querySelector('.cc-body');if(bd)bd.scrollTop=0;
}
function achRefresh(){if(ACH.open&&ACH.view==='list')achRenderList();}
function achOpen(){
  var w=document.getElementById('cam-whisper'),s=achSheet();
  if(!s||!CAMERA_MODE||!GAME_ON)return;
  catReset();   /* katalog bintang (kalau terbuka) ditutup dulu */
  var r=w?w.getBoundingClientRect():null;
  s.style.height=Math.max(170,Math.round(r?r.height:0))+'px';   /* sheet = ukuran kartu rasi */
  try{UIS.pop('open');}catch(eUP){}
  ACH.open=true;achRenderList();
  s.classList.add('on');document.body.classList.add('ach-open');
  haptic(8);
}
function achClose(){
  var s=achSheet();
  ACH.open=false;ACH.view='list';ACH.cid=null;
  if(s)s.classList.remove('on');
  document.body.classList.remove('ach-open');
}
function achToggle(){if(ACH.open){achClose();haptic(6);}else achOpen();}
(function(){
  var s=achSheet();
  if(s)s.addEventListener('click',function(e){
    var t=e.target,b;if(!t||!t.closest)return;
    if(t.closest('.cc-x')){e.stopPropagation();achClose();haptic(6);return;}
    if(t.closest('.cc-back')){e.stopPropagation();achRenderList();haptic(6);return;}
    b=t.closest('.cc-row');
    if(b&&!b.disabled){e.stopPropagation();achRenderDetail(b.getAttribute('data-c'));haptic(6);}
  });
})();
(function(){
  var w=document.getElementById('cam-whisper'),s=catSheet();
  if(w)w.addEventListener('click',function(e){
    var b=e.target.closest&&e.target.closest('.ci-catbtn');if(!b)return;
    e.stopPropagation();catOpen(b.getAttribute('data-cat'));
  });
  if(s)s.addEventListener('click',function(e){
    var t=e.target,b;if(!t||!t.closest)return;
    if(t.closest('.cc-x')){e.stopPropagation();catClose();return;}
    if(t.closest('.cc-back')){e.stopPropagation();catBack();return;}
    if((b=t.closest('.cc-row'))){e.stopPropagation();catPick(b.getAttribute('data-k'));}
  });
})();
/* Palet cincin fokus BH per pita (VIS = tampilan lama persis). gc/ga/gw = glow, lc/la/lw = garis tipis, hc = titik ujung, rm = pengali radius. */
var BH_FX_PAL={
  vis:{gc:'110,229,255',ga:.16,gw:7,lc:'234,252,255',la:.85,lw:1.6,hc:'255,255,255',rm:1.2},
  uv:{gc:'160,120,255',ga:.2,gw:5,lc:'226,208,255',la:.9,lw:1.2,hc:'240,230,255',rm:1.12},   /* gas panas dekat horizon: cincin ketat, ungu */
  ir:{gc:'255,110,60',ga:.14,gw:9,lc:'255,172,122',la:.7,lw:2,hc:'255,205,160',rm:1.38}      /* debu hangat: cincin lebar, oranye redup */
};
function drawFocusFx(now){
  var id=FFX.id;if(!id||!CAMERA_MODE||reduce)return;
  var t=now-FFX.t0,i,q,A,B,segs=[],rgb='110,229,255';
  g.save();g.globalCompositeOperation='lighter';g.lineCap='round';
  if(id==='bh'){
    var bp=camBH(),R=BH.Rr*BHZ,pal=BH_FX_PAL[BAND]||BH_FX_PAL.vis,rr=R*pal.rm;
    if(R>=1&&t<2800){
      var u=Math.min(1,t/1200),e=u*u*(3-2*u),al=t<1200?1:Math.max(0,1-(t-1200)/1600),a0=-1.5708,a1=a0+6.2832*e;
      g.strokeStyle='rgba('+pal.gc+','+(pal.ga*al)+')';g.lineWidth=pal.gw;g.beginPath();g.arc(bp[0],bp[1],rr,a0,a1);g.stroke();
      g.strokeStyle='rgba('+pal.lc+','+(pal.la*al)+')';g.lineWidth=pal.lw;g.beginPath();g.arc(bp[0],bp[1],rr,a0,a1);g.stroke();
      if(u<1){g.fillStyle='rgba('+pal.hc+',.95)';g.beginPath();g.arc(bp[0]+Math.cos(a1)*rr,bp[1]+Math.sin(a1)*rr,3.2,0,6.2832);g.fill();}
    }
    /* IR: inframerah menembus debu di sekitar lubang hitam, jadi bintang-bintang yang mengorbit dekat (mirip bintang S di Sgr A*) kelihatan.
       4 titik kecil elips miring, makin dekat makin cepat; fade-in 0.9 dtk. Murah: 4 arc/frame. */
    if(BAND==='ir'&&R>=1){
      var fi=Math.min(1,t/900),j,ra,an,ox2,oy2;
      for(j=0;j<4;j++){
        ra=R*(1.9+.55*j);an=t*.0016/(1+.55*j)+j*1.7;
        ox2=bp[0]+Math.cos(an)*ra;oy2=bp[1]+Math.sin(an)*ra*.62;
        g.fillStyle='rgba(255,170,110,'+(.16*fi)+')';g.beginPath();g.arc(ox2,oy2,5,0,6.2832);g.fill();
        g.fillStyle='rgba(255,226,196,'+(.8*fi)+')';g.beginPath();g.arc(ox2,oy2,1.7,0,6.2832);g.fill();
      }
    }
    g.restore();return;
  }
  if(id==='pleiades'){
    /* Cluster, not a constellation: no lines. Stars twinkle one by one, then idle-shimmer softly. */
    if(!PLEIADES.ready){g.restore();return;}
    var ox=mouse.x*1.4+skyPan.x,oy=mouse.y*1.0+skyPan.y,pts=PLEIADES.bright.slice().sort(function(a,b){return a.x-b.x;}),nn=pts.length,per=Math.min(320,2400/Math.max(nn,1)),dur=1100;
    for(i=0;i<nn;i++){
      q=gSky(PLEIADES.x+pts[i].x*PLEIADES.scale+ox,PLEIADES.y+pts[i].y*PLEIADES.scale+oy);
      if(!q||q[2]>=1)continue;
      var ts=t-420-i*per,al=0,sc=1;if(ts<0)continue;
      if(ts<dur){var u=ts/dur;al=Math.sin(u*Math.PI);sc=1+.9*al;}
      else al=.2+.14*Math.sin(t*.0021+i*1.9);
      var r=(3+7*al)*sc,L=(7+16*al)*sc;
      var gr=g.createRadialGradient(q[0],q[1],0,q[0],q[1],r*2.6);
      gr.addColorStop(0,'rgba(235,242,255,'+(.55*al)+')');gr.addColorStop(.4,'rgba(145,170,255,'+(.22*al)+')');gr.addColorStop(1,'rgba(145,170,255,0)');
      g.fillStyle=gr;g.beginPath();g.arc(q[0],q[1],r*2.6,0,6.2832);g.fill();
      g.strokeStyle='rgba(225,236,255,'+(.8*al)+')';g.lineWidth=1;g.beginPath();
      g.moveTo(q[0]-L,q[1]);g.lineTo(q[0]+L,q[1]);g.moveTo(q[0],q[1]-L);g.lineTo(q[0],q[1]+L);g.stroke();
    }
    g.restore();return;
  }else{
    var c=cons(id);if(!c||!linesVisible(c)){g.restore();return;} /* garis rasi ini tidak tampil (terkunci di mode 🎮 / GARIS OFF): jejak garis fokus ikut mati */
    for(i=0;i<c.lines.length;i++){
      A=c.stars[c.lines[i][0]];B=c.stars[c.lines[i][1]];if(!A||!B)continue;
      var qa=gSky(A.x+c.ox,A.y+c.oy),qb=gSky(B.x+c.ox,B.y+c.oy);
      if(qa&&qb)segs.push([[qa[0],qa[1],qa[2]],[qb[0],qb[1],qb[2]]]);
    }
  }
  var n=segs.length;if(!n){g.restore();return;}
  var per=Math.min(190,1900/n),dur=per*1.5,tEnd=420+(n-1)*per+dur;
  var glow=t<tEnd?1:Math.max(.32,1-(t-tEnd)/1600*.68);
  for(i=0;i<n;i++){
    var s0=segs[i][0],s1=segs[i][1];if(s0[2]>=1||s1[2]>=1)continue;
    var ts=t-420-i*per;if(ts<0)continue;
    var p=Math.min(1,ts/dur);p=p*p*(3-2*p);
    var ex=s0[0]+(s1[0]-s0[0])*p,ey=s0[1]+(s1[1]-s0[1])*p;
    g.strokeStyle='rgba('+rgb+','+(.13*glow)+')';g.lineWidth=4.2;g.beginPath();g.moveTo(s0[0],s0[1]);g.lineTo(ex,ey);g.stroke();
    g.strokeStyle='rgba(225,248,255,'+(.78*glow)+')';g.lineWidth=1.1;g.beginPath();g.moveTo(s0[0],s0[1]);g.lineTo(ex,ey);g.stroke();
    if(ts<520){var pu=ts/520;g.strokeStyle='rgba('+rgb+','+(.7*(1-pu))+')';g.lineWidth=1;g.beginPath();g.arc(s0[0],s0[1],3+11*pu,0,6.2832);g.stroke();}
    if(p<1){g.fillStyle='rgba(255,255,255,.95)';g.beginPath();g.arc(ex,ey,2.6,0,6.2832);g.fill();}
    else if(ts-dur<520){var pu2=(ts-dur)/520;g.strokeStyle='rgba('+rgb+','+(.7*(1-pu2))+')';g.lineWidth=1;g.beginPath();g.arc(s1[0],s1[1],3+11*pu2,0,6.2832);g.stroke();}
  }
  g.restore();
}
function bhDragAllowed(){if(typeof isLayoutEdit==="function"&&isLayoutEdit())return false;return !CAMERA_MODE||!FOCUS.list||FOCUS.list[FOCUS.i].id==='bh';}
function syncBHDom(){
  try{
    var bhEl=document.getElementById('bh');if(!bhEl||!W)return;
    var p=camBH();
    bhEl.style.transform='translate('+Math.round(p[0]-BH.R*8)+'px,'+Math.round(p[1]-BH.R*5)+'px)';
    if(CAPS&&CAPS.bh)CAPS.bh.style.transform='translate('+Math.round(p[0]-CAPS.bh.offsetWidth/2+3)+'px,'+Math.round(p[1]+BH.R*1.7*BHZ)+'px)'+STG.up;
  }catch(e){}
}
var _camUpOn=false,_freeReset=false;
function focusStep(){
  var want=!!(CAMERA_MODE&&typeof OBSERVE_MODE!=='undefined'&&OBSERVE_MODE);
  var f=want&&FOCUS.list?FOCUS.list[FOCUS.i]:null,id=f?f.id:'free';
  var tZ=(want&&id!=='free'&&id!=='bh')?Math.min(skyZoom,1.25):skyZoom,tK=(want||SECT.busy)?1:0,ch=false;
  if(Math.abs(BHZ-tZ)>.002||Math.abs(BHK-tK)>.002){BHZ+=(tZ-BHZ)*.14;BHK+=(tK-BHK)*.14;ch=true;}
  else if(BHZ!==tZ||BHK!==tK){BHZ=tZ;BHK=tK;ch=true;}
  /* HP landscape: pas auto-zoom ke rasi, sky ikut diputar balik 90° supaya rasi tegak di layar; balik ke 0 pas Free/BH. */
  if(want&&STG.rot&&!skyRotDrag.on&&!skyPinch.on){
    var ra=(id!=='free'&&id!=='bh')?upAng():(_camUpOn?0:null);
    if(ra!==null){
      if(ra!==0)_camUpOn=true;
      if(Math.abs(skyRot-ra)>.002){skyRot+=(ra-skyRot)*.12;ch=true;}
      else{skyRot=ra;if(ra===0)_camUpOn=false;}
    }
  }
  /* Kamera pindah ke Free: zoom otomatis keluar ke 1x dan pan balik ke tengah (berhenti kalau user mulai gerak sendiri) */
  if(want&&id==='free'&&_freeReset){
    if(skyDrag.on||skyPinch.on||skyRotDrag.on)_freeReset=false;
    else{
      var fdz=1-skyZoom,fpm=skyPan.x*skyPan.x+skyPan.y*skyPan.y;
      if(Math.abs(fdz)>.004)setSkyZoom(skyZoom+fdz*.12,false);else if(skyZoom!==1)setSkyZoom(1,false);
      if(fpm>.09){skyPan.x*=.88;skyPan.y*=.88;}else{skyPan.x=0;skyPan.y=0;}
      ch=true;
      if(Math.abs(skyZoom-1)<=.004&&fpm<=.09)_freeReset=false;
    }
  }
  /* Zoom out otomatis ke 1x (dipakai alignDone biar popup ALIGNED kelihatan); berhenti kalau user mulai gerak sendiri */
  if(want&&_zoomOut){
    if(skyDrag.on||skyPinch.on||skyRotDrag.on)_zoomOut=false;
    else{
      var zdz=1-skyZoom;
      if(Math.abs(zdz)>.004)setSkyZoom(skyZoom+zdz*.12,false);else{if(skyZoom!==1)setSkyZoom(1,false);_zoomOut=false;}
      ch=true;
    }
  }
  if(want&&id!=='free'){
    var g=focusGeom(id);
    if(g){
      if(skyPinch.on)FOCUS.anim=false;
      if(FOCUS.anim||(!skyDrag.on&&!skyRotDrag.on&&!skyPinch.on&&!drag.on)){
        var lim=skyPanLimits(),k=FOCUS.anim?.12:.07;
        /* Solve pan so the focus lands on the free-area centre: screen = c + z*Rot(pt+pan-c) (BH: no rotation). */
        var cb=camBox(),zz=Math.max(.2,FOCUS.anim?g.z:skyZoom),ccx=W*.5,ccy=H*.5,ddx=(cb.cx-ccx)/zz,ddy=(cb.cy-ccy)/zz;
        if(id!=='bh'&&skyRot*skyRot>=1e-8){var rc=Math.cos(skyRot),rs=Math.sin(skyRot),qx=ddx*rc+ddy*rs;ddy=-ddx*rs+ddy*rc;ddx=qx;}
        var tx=Math.max(-lim.x,Math.min(lim.x,ccx+ddx-g.x)),ty=Math.max(-lim.y,Math.min(lim.y,ccy+ddy-g.y));
        /* Saklar FOKUS dari tombol tengah: springback ke posisi saat dinyalakan (bukan ke titik tengah rasi). Animasi < > / ketuk bintang membuangnya. */
        if(FOCUS.anim||(_focusHome&&_focusHome.id!==id))_focusHome=null;
        if(_focusHome){tx=Math.max(-lim.x,Math.min(lim.x,_focusHome.x));ty=Math.max(-lim.y,Math.min(lim.y,_focusHome.y));}
        if(Math.abs(tx-skyPan.x)+Math.abs(ty-skyPan.y)>.3){skyPan.x+=(tx-skyPan.x)*k;skyPan.y+=(ty-skyPan.y)*k;ch=true;}
      }
      if(FOCUS.anim){
        if(Math.abs(g.z-skyZoom)>.004)setSkyZoom(skyZoom+(g.z-skyZoom)*.12,false);
        else{setSkyZoom(g.z,false);FOCUS.anim=false;}
      }
    }
  }
  if(ch){try{syncSkyPanHits();}catch(e){}syncBHDom();}
}
(function(){
  function bind(id,fn){var b=document.getElementById(id);if(!b)return;
    b.addEventListener('pointerdown',function(e){e.stopPropagation();});
    b.addEventListener('click',function(e){e.stopPropagation();fn();});}
  bind('cf-prev',function(){camNav(-1);});bind('cf-name',camCenter);bind('cf-next',function(){camNav(1);});
  var cb=document.getElementById('cb-btn');
  if(cb){cb.addEventListener('pointerdown',function(e){e.stopPropagation();});
    cb.addEventListener('click',function(e){e.stopPropagation();cycleBand();});}
  var cl=document.getElementById('cl-btn');
  if(cl){cl.addEventListener('pointerdown',function(e){e.stopPropagation();});
    cl.addEventListener('click',function(e){e.stopPropagation();toggleLines();});}
  bind('cg-btn',toggleGame);bind('ca-btn',achToggle);
  /* layout berubah (rotasi / resize / varian compact): hitung ulang posisi 🎮 setelah layout selesai */
  var _gbT=0;
  function gbSoon(){clearTimeout(_gbT);_gbT=setTimeout(function(){placeGameBtn();setTimeout(placeGameBtn,450);},150);}
  window.addEventListener('resize',gbSoon);window.addEventListener('orientationchange',gbSoon);
  setBand(BAND);setLines(CAM_LINES);setGame(false,true);   /* teks + aria awal sesuai bahasa (HTML cuma fallback Inggris) */
  /* Anti tembus: seluruh permukaan panel CAM, kartu rasi, dan sheet katalog (bukan cuma tombolnya) menelan pointerdown/touchstart,
     jadi ketukan di panel nggak ikut kena bintang / Pleiades / asteroid / teleskop / pan langit di bawahnya. */
  ['cam-zoom','cam-whisper','cam-cat','cam-ach'].forEach(function(pid){
    var pe=document.getElementById(pid);if(!pe)return;
    pe.addEventListener('pointerdown',function(e){e.stopPropagation();try{markActivity();}catch(eM){}},{passive:true});
    pe.addEventListener('touchstart',function(e){e.stopPropagation();},{passive:true});
  });
})();
var konamiSeq=[],konami=['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight'];
var utcClicks=0,utcReset=0;
var SW=null;   /* SW = transisi keluar ke dumul.html sedang jalan (guard input, dipakai ~65 tempat). F5: hanya SW.kind==='belt' (beltEnter) */
var ARV=1;   /* skala kedatangan BH overview saat keluar dari terowongan swallow sektor (0.08 = jauh di ujung terowongan .. 1 = penuh); dari WORMHOLE.arrive() tiap frame */
var HPV=0,HP_K=.5;   /* HPV: tarikan portal saat hold (0..1, dari WORMHOLE.pull() tiap frame); HP_K: porsi tarikan penuh swallow yang dipakai saat hold */
var AMB=mkAudio('constellation.opus',.5,true,'auto');
var GARG=mkAudio('glitch-instrumental.opus',0,true,'auto');
var MUSIC_COLLAP=mkAudio('collapsars.opus',.5,true,'metadata');
/* Objek audio per bintang SFX — dibuat dari registry (sky-data.js). File: audio/<nama>.opus */
var SFX={};
SKY.sfx.forEach(function(d){SFX[d.key]=mkAudio(d.audio,.85,false,'metadata');});
function mkAudio(name,vol,loop,preloadMode){var a=new Audio('audio/'+encodeURIComponent(name));a.preload=preloadMode||'metadata';a.loop=!!loop;a.volume=vol;a._bv=vol;return a;}
function safePlay(a){
  if(!a)return false;
  a._want=true; /* niat play terakhir; safePause/safeReset menurunkannya, jadi retry async nggak "menghidupkan" track yang sudah ditinggal */
  try{
    /* Wake Web Audio if a prior star-chime/spectrum path left the context suspended.
       MediaElementSource nodes are silent while the context is suspended. */
    if(typeof unlockAudioGraph==='function')unlockAudioGraph();
    /* Recover volume if a fade left the element at 0 (e.g. swallow transition). */
    if(!(a.volume>0.01)){
      if(a===AMB||a===MUSIC_COLLAP)a.volume=.5;
      else if(typeof SFX!=='undefined'){
        for(var sk in SFX){if(SFX[sk]===a){a.volume=.85;break;}}
      }
    }
    /* First tap on a cold file often rejects until the buffer is ready.
       Kick load(), then retry on canplay so Pleione (and any slow SFX)
       starts on the same user gesture without needing a second click. */
    if(a.readyState<2&&!a._retrying){
      /* Guard flag so a rapid double-tap on the same cold file (e.g. Pleione)
         can't stack a second canplay/canplaythrough pair before the first
         one has fired - that used to fire play() twice for one gesture. */
      a._retrying=true;
      try{a.load();}catch(eLoad){}
      var retry=function(){
        a._retrying=false;
        a.removeEventListener('canplay',retry);
        a.removeEventListener('canplaythrough',retry);
        if(!a._want)return; /* sudah di-pause/ganti track selagi loading */
        if(typeof unlockAudioGraph==='function')unlockAudioGraph();
        if(a.paused||a.ended){
          var p2=a.play();if(p2&&p2.catch)p2.catch(function(){});
        }
      };
      a.addEventListener('canplay',retry,{once:true});
      a.addEventListener('canplaythrough',retry,{once:true});
    }
    var p=a.play();
    if(p&&p.catch)p.catch(function(){
      setTimeout(function(){
        if(!a._want)return; /* pause()/ganti track bikin play() reject (AbortError) -> jangan di-retry */
        if(!a.paused&&!a.ended)return;
        if(typeof unlockAudioGraph==='function')unlockAudioGraph();
        try{var p3=a.play();if(p3&&p3.catch)p3.catch(function(){});}catch(e2){}
      },120);
    });
    return true;
  }catch(e){return false;}
}
function safePause(a){if(!a)return;a._want=false;try{a.pause();}catch(e){}}
function safeReset(a){if(!a)return;safePause(a);try{a.currentTime=0;}catch(e){}}
function haptic(ms){
  if(navigator.vibrate)try{navigator.vibrate(ms||10);}catch(e){}
}
function showSecret(text,ms){
  var el=$('#secret-msg');if(!el)return;
  teleGreetHide();
  clearTimeout(el._t);clearTimeout(el._type);
  el.dataset.type='center'; /* Konami / centered overlay — do not follow telescope */
  el.style.left='';
  el.style.top='';
  el.textContent=text;el.classList.add('on');
  el._t=setTimeout(function(){el.classList.remove('on');},ms||2000);
}
/* ---------- Telescope voice: large message pool + anti-repeat ---------- */
var TELE_SCOPE_MESSAGES=TXT.TELE_SCOPE_MESSAGES; /* teks dipindah ke texts.js (objek TXT, dimuat sebelum file ini) */
var teleRecent=[];
var teleClicks=0;
/* Ultra-rare love→friend: first appearance after ~55–90 clicks, then every ~70–120.
   With ~400+ lines, 12–20 felt common; this keeps it as a memory, not a loop. */
var teleNextUltra=55+((Math.random()*36)|0);
/* Block ~1/5 of the pool from immediate reuse (~80–90 lines). */
var TELE_RECENT_CAP=Math.min(90,Math.max(60,(TELE_SCOPE_MESSAGES.length*0.22)|0));

function telePickMessage(){
  /* Anti-repeat: exclude the last TELE_RECENT_CAP messages. */
  var pool=[],i,m;
  for(i=0;i<TELE_SCOPE_MESSAGES.length;i++){
    m=TELE_SCOPE_MESSAGES[i];
    if(teleRecent.indexOf(m)<0)pool.push(m);
  }
  if(!pool.length){
    /* Drain only the oldest half so the freshest lines stay blocked a bit longer. */
    var drop=Math.max(1,(teleRecent.length/2)|0);
    teleRecent.splice(0,drop);
    for(i=0;i<TELE_SCOPE_MESSAGES.length;i++){
      m=TELE_SCOPE_MESSAGES[i];
      if(teleRecent.indexOf(m)<0)pool.push(m);
    }
    if(!pool.length){teleRecent.length=0;pool=TELE_SCOPE_MESSAGES.slice();}
  }
  m=pool[(Math.random()*pool.length)|0];
  teleRecent.push(m);
  if(teleRecent.length>TELE_RECENT_CAP)teleRecent.shift();
  return m;
}

/* Soft-wrap at word boundaries into ~2–3 short lines so the bubble stays compact. */
function teleWrapLines(msg,maxChars){
  maxChars=maxChars||26;
  if(!msg||msg.length<=maxChars)return msg;
  var words=msg.split(/\s+/),lines=[],cur='';
  for(var i=0;i<words.length;i++){
    var w=words[i];
    if(!w)continue;
    /* Single token longer than a line: hard-split. */
    if(w.length>maxChars){
      if(cur){lines.push(cur);cur='';}
      while(w.length>maxChars){lines.push(w.slice(0,maxChars));w=w.slice(maxChars);}
      cur=w;
      continue;
    }
    var next=cur?cur+' '+w:w;
    if(next.length>maxChars&&cur){
      lines.push(cur);
      cur=w;
    }else cur=next;
  }
  if(cur)lines.push(cur);
  /* Prefer at most 3 lines: if more, merge tail gently. */
  if(lines.length>3){
    var head=lines.slice(0,2);
    head.push(lines.slice(2).join(' '));
    lines=head;
  }
  return lines.join('\n');
}

function teleTypeText(el,text,done,msPerChar){
  var i=0,speed=msPerChar||(text.length>42?32:48);
  el.textContent='';
  function tick(){
    if(i<text.length){
      el.textContent+=text.charAt(i++);
      el._type=setTimeout(tick,speed);
      return;
    }
    if(typeof done==='function')done();
  }
  tick();
}

function showUltraLoveSequence(el){
  /* Ultra-rare: original memory sequence — telescope remembers you. */
  el.classList.remove('tele-short');
  var first=T('tele.love1'),finalText=T('tele.love2');
  var i=0;
  function typeFirst(){
    if(i<first.length){el.textContent+=first.charAt(i++);el._type=setTimeout(typeFirst,58);return;}
    el._type=setTimeout(erase,520);
  }
  function erase(){
    if(el.textContent.length>6){el.textContent=el.textContent.slice(0,-1);el._type=setTimeout(erase,42);return;}
    i=6;el._type=setTimeout(typeFinal,280);
  }
  function typeFinal(){
    if(i<finalText.length){el.textContent+=finalText.charAt(i++);el._type=setTimeout(typeFinal,58);return;}
    el._t=setTimeout(function(){el.classList.remove('on');},5200);
  }
  el.textContent='';
  typeFirst();
}

function showSecretSequence(){
  var el=$('#secret-msg');if(!el)return;
  if(!TELE_CFG.bubble)return;   /* bubble teleskop dimatikan di tab Tele */
  teleGreetHide();
  clearTimeout(el._t);clearTimeout(el._type);
  el.dataset.type='telescope'; /* Telescope voice — track with placeSecretMsg each frame */
  el.classList.add('on');
  el.textContent='';
  placeSecretMsg();

  teleClicks++;
  /* Ultra-rare love→friend sequence every ~12–20 clicks (feels like memory). */
  if(teleClicks>=teleNextUltra){
    /* Next ultra is far enough that it feels like the telescope remembering you. */
    teleNextUltra=teleClicks+70+((Math.random()*51)|0);
    showUltraLoveSequence(el);
    return;
  }

  var raw=telePickMessage();
  var short=raw.length<=24;
  var msg=short?raw:teleWrapLines(raw, touchMode?24:28);
  el.classList.toggle('tele-short',short);
  el.classList.toggle('tele-wrap',!short);
  var hold=Math.min(7200,Math.max(2600,2000+raw.length*38));
  teleTypeText(el,msg,function(){
    el._t=setTimeout(function(){el.classList.remove('on');el.classList.remove('tele-wrap');},hold);
  }, short?52:30);
}
function fadeTo(a,vol,ms,opts){
  opts=opts||{};
  clearInterval(a._f);var v0=a.volume,t0=performance.now();
  /* Only resume if the caller explicitly asks. Mute/unmute must not wake every paused track. */
  if(opts.resume&&vol>0&&a.paused)safePlay(a);
  a._f=setInterval(function(){
    var u=Math.min(1,(performance.now()-t0)/ms),v=v0+(vol-v0)*u;
    a.volume=Math.max(0,Math.min(1,v));
    if(u>=1){
      clearInterval(a._f);
      if(vol<=0&&opts.pause!==false)a.pause();
    }
  },40);
}
var activeSfx=null;
function potatoAudioFocus(){return !!(IS_POTATO&&activeSfx&&!activeSfx.paused&&!activeSfx.ended);}
/* ---------- audio spectrum visualizer ----------
   The visualizer taps the currently playing star SFX through Web Audio.
   It never owns playback state: pause/stop simply makes the spectrum decay
   back to the normal Gargantua ring. */
/* Mode visualizer responsif: sampling tiap frame + attack cepat. Otomatis mati di HP RAM kecil / potato.
   Override manual: localStorage.dumul_av_fast = '1' (paksa nyala) atau '0' (paksa mati). */
var AV_FAST=(function(){
  var o=null;try{o=localStorage.getItem('dumul_av_fast');}catch(e){}
  if(o==='1')return true;if(o==='0')return false;
  if(IS_POTATO)return false;
  if(navigator.deviceMemory&&navigator.deviceMemory<4)return false;
  return true;
})();
var AV={_dbg:/[?&]muffdbg/.test(location.search),ctx:null,an:null,lpf:null,sources:{},data:null,prev:null,ready:false,fallback:false,level:0,bass:0,mid:0,high:0,beat:0,peak:0,glitchUntil:0,avgFlux:0,lastBeatT:0,skip:0,atten:0,_tick:0};
/* The analyser path intentionally follows the proven dumul.html recipe:
   one AudioContext + one AnalyserNode, FFT 1024, smoothed spectrum and a
   low-frequency spectral-flux beat detector. Playback remains owned by the
   normal <audio> elements; this layer only observes them. */
function ensureAVGraph(){
  /* Shared Web Audio graph for star spectrum + optional chimes.
     Important: playStarChime used to create AV.ctx without an AnalyserNode.
     Later createMediaElementSource() then connected to a null analyser and
     permanently muted those <audio> elements. Always finish the graph here. */
  try{
    var AC=window.AudioContext||window.webkitAudioContext;
    if(!AC)return false;
    if(!AV.ctx)AV.ctx=new AC();
    if(!AV.an){
      AV.an=AV.ctx.createAnalyser();
      AV.an.fftSize=1024;
      AV.an.smoothingTimeConstant=AV_FAST?.32:.46;
      AV.an.minDecibels=-90;
      AV.an.maxDecibels=-12;
      AV.data=new Uint8Array(AV.an.frequencyBinCount);
      AV.prev=new Uint8Array(AV.an.frequencyBinCount);
    }
    if(!AV.lpf){
      try{
        AV.lpf=AV.ctx.createBiquadFilter();
        AV.lpf.type='lowpass';
        AV.lpf.frequency.value=16000;
        AV.lpf.Q.value=0.707;
        AV.duck=AV.ctx.createGain();AV.lpf.connect(AV.duck);AV.duck.connect(AV.ctx.destination);
      }catch(eLpf){AV.lpf=null;}
    }
    /* Analyser is a pure tap (never muffled) so the Gargantua spikes keep full spectrum;
       audible output goes src -> lpf -> destination (or src -> an -> destination w/o lpf). */
    if(!AV.lpf&&!AV._anOut){try{AV.an.connect(AV.ctx.destination);AV._anOut=true;}catch(eConn){}}
    if(AV.ctx.state!=='running'&&AV.ctx.resume){
      try{
        var rp=AV.ctx.resume();
        if(rp&&rp.catch)rp.catch(function(){});
      }catch(eRes){}
    }
    return true;
  }catch(e){return false;}
}
function unlockAudioGraph(){
  /* Call from any user-gesture play path so suspended contexts wake up. */
  if(typeof AV==='undefined'||!AV.ctx)return;
  if(AV.ctx.state!=='running'&&AV.ctx.resume){
    try{
      var rp=AV.ctx.resume();
      if(rp&&rp.catch)rp.catch(function(){});
    }catch(e){}
  }
}
function audioVizInit(a){
  if(!a)return false;
  /* Potato devices never enter the Web Audio analyser path. Some low-end
     Android WebViews can keep media playback alive while the Canvas/render
     thread stalls when createMediaElementSource() is attached. Use the
     deterministic currentTime fallback instead. */
  if(IS_POTATO){AV.fallback=true;AV.ready=false;return true;}
  try{
    if(!ensureAVGraph()){AV.fallback=true;AV.ready=false;return true;}
    var key=keyFromAudio(a);
    if(!key)return false;
    if(!AV.sources[key]){
      try{
        var src=AV.ctx.createMediaElementSource(a);
        src.connect(AV.an);
        if(AV.lpf){try{src.connect(AV.lpf);}catch(e1){try{AV.an.connect(AV.ctx.destination);AV._anOut=true;}catch(e2){}}}
        AV.sources[key]=src;
      }catch(srcErr){
        /* Element may already be wired from a previous session attempt. */
        AV.fallback=true;AV.ready=false;return true;
      }
    }else{
      /* Re-assert graph connection after a suspended/resumed context. */
      try{
        AV.sources[key].connect(AV.an);
        if(AV.lpf)AV.sources[key].connect(AV.lpf);
      }catch(eRe){}
    }
    unlockAudioGraph();
    AV.fallback=false;
    AV.ready=true;
    AV.skip=0;AV.avgFlux=0;AV.lastBeatT=0;AVP.stamp=-1;if(AVP.sm)AVP.sm.fill(0);
    return true;
  }catch(e){AV.fallback=true;AV.ready=false;return true;}
}
function audioVizOff(){
  AV.level*=.72;AV.bass*=.72;AV.mid*=.72;AV.high*=.72;AV.beat*=.68;AV.peak*=.9;AV.glitchUntil=0;
  /* Snap ke 0: nilai kecil yang nyangkut bikin garis rasi (audioPulse) kelihatan lebih terang dari idle. */
  if(AV.level<.012)AV.level=0;if(AV.bass<.012)AV.bass=0;if(AV.mid<.012)AV.mid=0;
  if(AV.high<.012)AV.high=0;if(AV.beat<.012)AV.beat=0;if(AV.peak<.012)AV.peak=0;
}
function activeStarScreenPos(){
  if(!activeSfx||typeof TRIGGERS==='undefined'||typeof keyFromAudio!=='function')return null;
  var key=keyFromAudio(activeSfx);if(!key)return null;
  var tr=TRIGGERS[key];if(!tr)return null;
  try{
    if(tr.cons==='pleiades'){
      if(!PLEIADES.ready)return null;
      var st=plInteractive();
      if(!st)return null;
      var ox=mouse.x*1.4+skyPan.x,oy=mouse.y*1.0+skyPan.y;
      return gSky(PLEIADES.x+st.x*PLEIADES.scale+ox,PLEIADES.y+st.y*PLEIADES.scale+oy);
    }
    var c=cons(tr.cons),s=c&&c.stars[tr.star];
    if(!s)return null;
    return gSky(s.x+(c.ox||0),s.y+(c.oy||0));
  }catch(e){return null;}
}
/* ---- Spatial muffle (Fase 3–4 refined) ----
   - Sektor sumber: selalu jernih (tanpa TX).
   - Overview / sektor lain: jernih hanya jika TX di-dock di sektor SUMBER + teleskop dibawa (bukan lisGone).
   - Teleskop ditinggal → LIS (disconnect); teleskop ada tapi tanpa TX sumber → muffled.
   - Overview TIDAK perlu dock TX di overview. */
function sfxSector(){
  if(!activeSfx||typeof TRIGGERS==='undefined'||typeof keyFromAudio!=='function')return null;
  var key=keyFromAudio(activeSfx),tr=key&&TRIGGERS[key];if(!tr)return null;
  for(var i=0;i<SECT.list.length;i++)if(SECT.list[i].ids.indexOf(tr.cons)>=0)return SECT.list[i];
  /* SECT.list[].ids cuma rasi AKTIF, tapi panel musik (shuffle / repeat all) memutar SEMUA SFX termasuk rasi off.
     Tanpa fallback ini sumbernya dianggap 'tanpa sektor' -> spatialTarget jatuh ke cabang akhir (jernih di mana-mana)
     dan txFollowSfx tidak jalan. */
  var rb=(typeof SKY!=='undefined'&&SKY.rasiBy)?SKY.rasiBy[tr.cons]:null;
  if(rb)for(var j=0;j<SECT.list.length;j++)if(SECT.list[j].k===rb.sector)return SECT.list[j];
  return null;
}
/* Beban teleskop saat kamera memfokus rasi/cluster di sektor selain sumber sinyal. 0 = tidak ada.
   Jarak = selisih sudut sektor (SECTORS[].a) dengan sektor sumber, 0..180 derajat -> .50 .. .90. */
function camStrain(s){
  if(!CAMERA_MODE||SECT.on||!SECT.cur||!s||s===SECT.cur)return 0;
  var f=typeof camFocusId==='function'?camFocusId():null,zk=1;
  if(!f||f==='bh')return 0;
  if(f==='free'){   /* BEBAS (tanpa kunci fokus): zoom manual lewat slider / pinch juga membebani teleskop. Naik mulus dari 1.05x sampai 1.5x supaya tidak loncat saat slider baru digeser */
    zk=Math.max(0,Math.min(1,(skyZoom-1.05)/.45));
    if(zk<=0)return 0;
  }
  var d=Math.abs(((SECT.cur.a-s.a)%360+360)%360);if(d>180)d=360-d;
  return (.5+.4*(d/180))*zk;
}
/* Sektor sumber interlocking (pink): drone TX docked di sektor itu.
   Dipakai di overview supaya muffle selaras dengan ◉◉ di window menu (txInterlock). */
function srcLinked(s){return !!(s&&typeof sigLinked==='function'&&sigLinked(s,null));}   /* sumber pink, dilihat dari overview — aturan lengkapnya di txWhy (02-sky-logic.js) */
function spatialTargetBase(){
  var cx=W*.5,cy=H*.5,maxD=Math.max(120,Math.hypot(W,H)*.48),t,p,s;
  var gone=(typeof lisGone==='function'&&lisGone());
  s=sfxSector();
  /* Sumber lokal (di dalam sektor sumber): selalu jernih */
  if(SECT.cur&&s&&s===SECT.cur)return 0;   /* sektor sumber: selalu jernih, auto-fit zoom kamera tidak ikut meredam */
  /* Teleskop ditinggal: disconnect penuh (LIS) */
  if(gone)return 1;
  /* Star tracker / tunnel shortcut: muffled */
  if(typeof LIS!=='undefined'&&LIS.cd&&performance.now()<LIS.cd&&LIS.kind==='full')return .88;
  if(typeof SGATE!=='undefined'&&SGATE.tunnelUntil&&performance.now()<SGATE.tunnelUntil)return .88;
  /* Overview: jernih = TX sumber sudah terhubung (relay). TIDAK reset docking/TX. */
  if(SECT.on||SECT.busy){
    if(srcLinked(s)&&SECT.on&&SECT.phase!=='in')return 0;
    /* Ikon sektor sudah pensiun: muffle pakai posisi hantu s.gx/gy (dihitung drawSectorOverview di 05-sector-ui.js). */
    var _sx=(s&&s.gx!=null)?s.gx:null,_sy=(s&&s.gx!=null)?s.gy:null;
    if(_sx!=null){t=Math.min(1,Math.hypot(_sx-cx,_sy-cy)/maxD);t=Math.max(0,(t-.12)/.88);}
    else t=.7;
    if(!SECT.busy)t=Math.max(.7,t);
    return t;
  }
  /* Sektor lain: jernih HANYA kalau sektor sumber level 3 DAN sektor ini juga level 3 (BH mini + receiver + BH overview). Beda level = muffled.
     Star tracker / tunnel muffle sudah di atas. Cam constellation fokus rasi/cluster di sektor bukan sumber = teleskop dipaksa menjauh dari sumber:
     makin jauh sektornya dari sumber makin redam (camStrain), berlaku juga kalau sudah interlocking. */
  if(SECT.cur&&s&&s!==SECT.cur){
    return Math.max(sigLinked(s,SECT.cur)?0:.88,camStrain(s));
  }
  if(!CAMERA_MODE)return 0;
  p=activeStarScreenPos();
  if(!p||p[2]>=1)return .55;
  t=Math.min(1,Math.max(0,Math.hypot(p[0]-cx,p[1]-cy)/maxD));
  return Math.max(0,(t-.12)/.88);
}
/* Wormhole (09-wormhole.js): redam audio selama portal terbuka / dilewati. Cuma batas bawah: aturan muffle asli (spatialTargetBase) tidak diubah.
   Sektor sumber yang biasanya selalu jernih (0) ikut teredam selama wormhole aktif; LIS 'gone' (1) tetap 1. */
function spatialTarget(){
  var b=spatialTargetBase(),w=0;
  try{if(typeof WORMHOLE!=='undefined')w=WORMHOLE.muffle()||0;}catch(eW){}
  return w>b?w:b;
}
function spatialHint(t){
  var st='',s=sfxSector(),w;
  var gone=(typeof lisGone==='function'&&lisGone());
  if(gone){ /* LIS handle toast sendiri; jangan spam spatial */
    if(AV._hint)AV._hint='';
    return;
  }
  if(typeof LIS!=='undefined'&&LIS.cd&&performance.now()<LIS.cd&&LIS.kind==='full'){
    if(AV._hint!=='tracker'){AV._hint='tracker';}
    return; /* toast star tracker sudah dari lisStart */
  }
  /* Alasan & syarat jernih SATU sumber dengan spatialTarget: txWhy (02-sky-logic.js). */
  if(s&&SECT.on&&!SECT.busy){
    w=txWhy(s,null);
    st=w===''?'relay':(w==='far'?(t>.5?'muffled':''):w);
  }else if(s&&SECT.cur&&!SECT.busy&&s!==SECT.cur){
    w=txWhy(s,SECT.cur);
    /* 'strain' (kamera cam constellation menjauh dari sektor sumber) HANYA muncul kalau receiver sudah tersambung penuh (w===''):
       kalau rantai belum lengkap, toast harus menunjuk langkah yang kurang (drone kuning / dock pink), bukan 'terbebani'. */
    st=w===''?(camStrain(s)>0?'strain':'relay-here'):w;
  }
  if(st===AV._hint)return;
  AV._hint=st;
  if(!st||typeof showModeToast!=='function')return;
  if(st==='muffled')showModeToast(T('toast.tx.muff'),null,4400);
  else if(st==='far')showModeToast(T('toast.tx.far'),null,4600);
  else if(st==='needsum')showModeToast(T('toast.tx.needsum'),null,4200);
  else if(st==='needdock')showModeToast(T('toast.tx.needdock'),'tip',4200);
  else if(st==='strain')showModeToast(T('toast.tx.strain'),null,4200);
  /* 'relay' / 'relay-here' (tersambung & jernih) sengaja tanpa toast: berulang tiap SFX baru = noise */
}
function spatialRelease(){
  AV.atten=0;AV._hint='';AV._attFor=null;
  if(AV._lpfLow&&AV.lpf&&AV.ctx){AV._lpfLow=false;try{AV.lpf.frequency.setTargetAtTime(16000,AV.ctx.currentTime,.06);}catch(e){}}
  if(AV._volEl){try{AV._volEl.volume=AV._volEl._bv||.85;}catch(e2){}AV._volLow=false;AV._volEl=null;}
}
/* Ada 2 jalur: (A) lowpass Web Audio (kalau graph jalan), (B) fallback volume <audio> (potato / WebView yang
   gagal createMediaElementSource) supaya efek "tenggelam" tetap kedengeran. */
function spatialDbg(msg){
  if(!AV._dbg)return;
  var el=document.getElementById('muff-dbg');
  if(!el){el=document.createElement('div');el.id='muff-dbg';el.style.cssText='position:fixed;left:6px;top:6px;z-index:99999;font:10px/1.35 monospace;color:#8eeeff;background:rgba(0,0,0,.7);padding:4px 6px;pointer-events:none;white-space:pre';document.body.appendChild(el);}
  el.textContent=msg;
}
function updateSpatialAttenuation(){
  if(!activeSfx||activeSfx.paused||activeSfx.ended){spatialRelease();return;}
  var t=spatialTarget(),useLpf=!!(AV.lpf&&AV.ctx&&!AV.fallback&&AV.ready);
  /* Track baru (shuffle / repeat all / next) mulai dari kondisi jernih (spatialRelease -> atten 0) lalu merambat redam:
     kedengaran jernih sesaat. Snap langsung ke target kalau targetnya lebih redam. Tab hidden: tick jarang, snap saja. */
  if(AV._attFor!==activeSfx){AV._attFor=activeSfx;if(t>AV.atten)AV.atten=t;}
  if(document.hidden)AV.atten=t;else AV.atten+=(t-AV.atten)*.14;
  if(t===0&&AV.atten<.004)AV.atten=0;
  if(useLpf){
    var hz=400+15600*Math.pow(1-AV.atten,1.65);
    AV._lpfLow=AV.atten>0;
    try{if(AV.lpf.frequency.setTargetAtTime)AV.lpf.frequency.setTargetAtTime(hz,AV.ctx.currentTime,.06);else AV.lpf.frequency.value=hz;}catch(eHz){}
    /* kalau context suspended (autoplay policy) filter tidak ngapa-ngapain; bangunin */
    if(AV.ctx.state!=='running')unlockAudioGraph();
    if(AV._volEl){try{AV._volEl.volume=AV._volEl._bv||.85;}catch(eR){}AV._volLow=false;AV._volEl=null;}
  }else{
    /* Fallback: redam lewat volume (tidak bisa lowpass tanpa Web Audio) */
    if(AV._volEl&&AV._volEl!==activeSfx){try{AV._volEl.volume=AV._volEl._bv||.85;}catch(eP){}}
    AV._volEl=activeSfx;AV._volLow=AV.atten>0;
    try{activeSfx.volume=Math.max(.06,(activeSfx._bv||.85)*(1-.88*Math.pow(AV.atten,.8))*(window.UIS?UIS.duckMul():1));}catch(eV){}
  }
  if(!document.hidden)spatialHint(t);   /* toast nggak perlu muncul saat tab tersembunyi */
  spatialDbg('MUFFLE '+(useLpf?'LPF':'VOLUME-FALLBACK')+'\npotato='+IS_POTATO+' fb='+AV.fallback+' ready='+AV.ready+' lpf='+!!AV.lpf+'\nctx='+(AV.ctx?AV.ctx.state:'none')+'\nsect.on='+SECT.on+' busy='+SECT.busy+' cam='+CAMERA_MODE+'\ntarget='+t.toFixed(2)+' atten='+AV.atten.toFixed(2));
}
/* Render loop (rAF) berhenti saat tab hidden / PWA minimize, padahal audio tetap jalan: muffle & wiring harus tetap diurus.
   Timer tetap hidup selama ada audio yang diputar. */
setInterval(function(){
  if(!document.hidden)return;
  if(!activeSfx||activeSfx.paused||activeSfx.ended){spatialRelease();return;}
  try{
    var k=keyFromAudio(activeSfx);
    if(!IS_POTATO&&k&&!AV.fallback&&!AV.sources[k])audioVizInit(activeSfx);
    updateSpatialAttenuation();
  }catch(eBg){}
},400);
function updateAudioViz(now){
  if(typeof RADIO_SILENCE!=='undefined'&&RADIO_SILENCE){audioVizOff();return;}
  if(!activeSfx||activeSfx.paused||activeSfx.ended){audioVizOff();spatialRelease();return;}
  updateSpatialAttenuation();
  if(AV.fallback){
    var t=activeSfx.currentTime||0;
    var ph=(t*2.35)%1;
    var pulse=Math.pow(Math.max(0,1-Math.abs(ph-.10)/.14),1.7);
    var swing=.5+.5*Math.sin(t*2.7);
    var att=1;
    AV.bass+=((.10+.58*pulse+.08*swing)*att-AV.bass)*.34;
    AV.mid+=((.07+.32*(.5+.5*Math.sin(t*7.1+1.2)))*att-AV.mid)*.25;
    AV.high+=((.04+.22*(.5+.5*Math.sin(t*12.7+2.4)))*att-AV.high)*.22;
    AV.level+=(Math.max(AV.bass,AV.mid*.8,AV.high*.55)-AV.level)*.28;
    AV.beat+=(pulse*att-AV.beat)*.45;
    if(pulse>.78&&Math.random()<.12)AV.glitchUntil=now+65;
    return;
  }
  if(!AV.ready||!AV.an||!AV.data)return;
  var period=IS_POTATO?3:(AV_FAST?1:2);
  AV._tick=(AV._tick+1)%period;
  if(AV._tick){AV.beat*=.94;return;}
  var bDec=AV_FAST?.95:.91;
  try{
    AV.an.getByteFrequencyData(AV.data);
    AV.skip=(AV.skip+1)&0x3fffffff; /* invalidate AVP so the ring profile follows the live spectrum */
    var n=AV.data.length,i,e=0,flux=0;
    /* Read a slightly wider low-frequency band so big kicks/bass drops are
       caught even when their energy is spread across neighbouring FFT bins. */
    for(i=1;i<=18&&i<n;i++){var d=AV.data[i]-AV.prev[i];if(d>0)flux+=d;}
    flux/=Math.max(1,Math.min(18,n-1))*255;
    AV.avgFlux+=(flux-AV.avgFlux)*(AV_FAST?.04:.075);
    var bassNow=0,bassLim=Math.min(18,n-1);
    for(i=1;i<=bassLim;i++)bassNow+=AV.data[i]/255;
    bassNow/=Math.max(1,bassLim);
    /* Either a spectral-flux transient or a strong bass rise can trigger the
       beat. The attack is immediate; decay is slower so a climax reads as a
       visible pulse instead of one-frame flicker. */
    var bassRise=bassNow-AV.bass;
    if((flux>AV.avgFlux*1.45+.012||bassRise>.055)&&now-AV.lastBeatT>125){
      AV.lastBeatT=now;
      AV.beat=Math.max(AV.beat,.92+Math.min(.22,Math.max(0,flux-AV.avgFlux)*2.5));
      AV.glitchUntil=now+(Math.random()<.16?75:0);
    }else AV.beat*=bDec;
    AV.prev.set(AV.data);
    for(i=1;i<=120&&i<n;i++)e+=AV.data[i];
    e/=Math.max(1,Math.min(120,n-1))*255;
    var bn=Math.max(1,Math.floor(Math.min(120,n-1)*.10));
    var mn=Math.max(bn+1,Math.floor(Math.min(120,n-1)*.48));
    var bass=0,mid=0,high=0,lim=Math.min(120,n-1);
    for(i=1;i<=lim;i++){
      var v=AV.data[i]/255;
      if(i<=bn)bass+=v;else if(i<=mn)mid+=v;else high+=v;
    }
    bass/=bn;mid/=Math.max(1,mn-bn);high/=Math.max(1,lim-mn);
    var att=1,lvT=Math.max(0,(e-.12)*2.7)*att;
    if(AV_FAST){
      /* Attack cepat (naik), release lebih lambat (turun) -> nempel ke beat tapi nggak kedip. */
      AV.bass+=(bass-AV.bass)*(bass>AV.bass?.60:.20);
      AV.mid+=(mid-AV.mid)*(mid>AV.mid?.50:.18);
      AV.high+=(high-AV.high)*(high>AV.high?.45:.16);
      AV.level+=(lvT-AV.level)*(lvT>AV.level?.60:.20);
      AV.peak+=(AV.bass-AV.peak)*.06;
    }else{
      AV.bass+=(bass*att-AV.bass)*.30;
      AV.mid+=(mid*att-AV.mid)*.24;
      AV.high+=(high*att-AV.high)*.20;
      AV.level+=(lvT-AV.level)*.30;
      AV.peak+=(AV.bass-AV.peak)*.10;
    }
  }catch(e){AV.fallback=true;AV.ready=false;}
}
/* Visualizer Gargantua = asteroid + debu kosmik (lihat blok "Visualizer" di bawah). AVP dipertahankan cuma karena AV.skip/stamp masih dirujuk di atas. */
var AVP={pts:null,N:0,stamp:-1,baseR:0,fullPts:null,fullN:0};
/* Adaptive star colour: only one RGB string is used by the whole visualizer.
   The target is changed once when the active star changes; the tiny RGB
   interpolation below keeps transitions smooth without doing colour math per bar. */
var AV_COLOR='155,215,255';
var AV_COLOR_RGB=[155,215,255];
var AV_COLOR_FROM=[155,215,255];
var AV_COLOR_TO=[155,215,255];
var AV_COLOR_T=1,AV_COLOR_MS=180;
function avColorForAudio(a){
  /* Warna datang dari SKY.TRIGGERS[key].rgb (sky-data.js) — nggak perlu rantai per bintang. */
  var k=a&&keyFromAudio(a),t=k&&TRIGGERS[k];
  if(t){var p=t.rgb.split(',');return [+p[0],+p[1],+p[2]];}
  return [155,215,255];
}
function setAVColor(a,immediate){
  var c=avColorForAudio(a);
  AV_COLOR_FROM[0]=AV_COLOR_RGB[0];AV_COLOR_FROM[1]=AV_COLOR_RGB[1];AV_COLOR_FROM[2]=AV_COLOR_RGB[2];
  AV_COLOR_TO[0]=c[0];AV_COLOR_TO[1]=c[1];AV_COLOR_TO[2]=c[2];
  AV_COLOR_T=immediate?1:0;
  if(immediate){AV_COLOR_RGB[0]=c[0];AV_COLOR_RGB[1]=c[1];AV_COLOR_RGB[2]=c[2];}
  AV_COLOR=''+(AV_COLOR_RGB[0]|0)+','+(AV_COLOR_RGB[1]|0)+','+(AV_COLOR_RGB[2]|0);
}
function updateAVColor(now){
  if(AV_COLOR_T>=1)return;
  if(updateAVColor._n===now)return;updateAVColor._n=now;   /* dipanggil dari cincin portal DAN glow BH mini di frame yang sama: transisi warna jangan jalan 2x */
  AV_COLOR_T=Math.min(1,AV_COLOR_T+16/AV_COLOR_MS);
  var u=AV_COLOR_T, e=u*u*(3-2*u);
  AV_COLOR_RGB[0]=AV_COLOR_FROM[0]+(AV_COLOR_TO[0]-AV_COLOR_FROM[0])*e;
  AV_COLOR_RGB[1]=AV_COLOR_FROM[1]+(AV_COLOR_TO[1]-AV_COLOR_FROM[1])*e;
  AV_COLOR_RGB[2]=AV_COLOR_FROM[2]+(AV_COLOR_TO[2]-AV_COLOR_FROM[2])*e;
  AV_COLOR=''+(AV_COLOR_RGB[0]|0)+','+(AV_COLOR_RGB[1]|0)+','+(AV_COLOR_RGB[2]|0);
}

/* Toggle spectrum portal (panel music; dulu "Gargantua Spectrum"). Disimpan di localStorage.dumul_av_on ('0' = mati). */
var AV_ON=(function(){var o=null;try{o=localStorage.getItem('dumul_av_on');}catch(e){}return o!=='0';})();

/* ---------- Visualizer: debu kosmik yang terlempar dari tepi lubang hitam ----------
   Sinkron ke musik lewat ONSET per pita spektrum, bukan peluang acak:
   - Spektrum dipecah jadi pita (AVB), dipetakan ke SUDUT lingkaran (cermin kiri-kanan, bass di atas/bawah,
     treble ke samping, berputar pelan seperti visualizer lama).
   - Tiap kali sebuah pita MELONJAK (onset: naik tajam + cukup keras), debu langsung ditembakkan dari sudut pita itu.
     Kick, snare, hi-hat jadi semburan di sudut yang beda-beda, tepat di momen bunyinya.
   - Beat (AV.lastBeatT) menambah semburan di sudut-sudut terkeras. SPIKE (beat sangat kuat) = lebih banyak + terbang lebih jauh.
   - Debu "ngegas" lalu cepat melambat (drag kuat) dan hidupnya singkat, jadi gerakannya terbaca sebagai hentakan
     yang pas dengan bunyi, bukan melayang telat di belakang musik.
   Warna diseragamkan (AV_UNI), nggak ikut warna bintang SFX.
   Ringan: pool typed array tetap (72 / 28 di potato), tanpa Path2D baru per frame, tanpa sprite/drawImage,
   digambar batch: 3 tahap fade x (halo + inti) = maksimal 6 fill per frame. Nggak ada loop spawn acak tiap frame. */
var AV_UNI='204,188,150'; /* abu-abu keemasan */
/* Ambang SPIKE: nilai AV.beat saat beat terdeteksi (beat biasa ~.92, makin tajam transiennya makin naik sampai ~1.14).
   Naikkan kalau terlalu sering, turunkan kalau jarang. Mode fallback (tanpa analyser) pakai ambang .85. */
var SPIKE_T=1.0;
var AVB={n:0,v:null,tg:null,d:null,cd:null,bm:null,stamp:-1,t:-1};
function avbInit(){
  var n=IS_POTATO?16:24;
  if(AVB.n===n)return;
  AVB.n=n;AVB.v=new Float32Array(n);AVB.tg=new Float32Array(n);AVB.d=new Float32Array(n);AVB.cd=new Float32Array(n);AVB.stamp=-1;
  if(!AVB.bm)AVB.bm=new Float32Array(130).fill(.3);
}
/* Idempotent per frame. AVB.v = energi pita (0..1, attack cepat), AVB.d = kenaikan v di frame ini (buat deteksi onset). */
function avbUpdate(now){
  if(AVB.t===now)return;AVB.t=now;
  avbInit();
  var n=AVB.n,v=AVB.v,tg=AVB.tg,d=AVB.d,k,i;
  var playing=!!(AV_ON&&!reduce&&activeSfx&&!activeSfx.paused&&!activeSfx.ended);
  if(!playing){
    for(k=0;k<n;k++)tg[k]=0;
  }else if(AV.fallback||!AV.ready||!AV.data){
    /* Tanpa analyser (potato / WebView): pita sintetis dari bass/mid/high + beat */
    var tt=activeSfx.currentTime||0,bb=AV.bass,mm2=AV.mid,hh=AV.high;
    for(k=0;k<n;k++){
      var base=k<n/3?bb:(k<n*2/3?mm2:hh);
      var sv=base*(.55+.7*(.5+.5*Math.sin(tt*(5+k*.37)+k*1.7)))+.25*AV.beat;
      tg[k]=sv>1?1:(sv<0?0:sv);
    }
  }else if(AVB.stamp!==AV.skip){
    AVB.stamp=AV.skip;
    var data=AV.data,lim=Math.min(96,data.length-1),bm=AVB.bm;
    /* Whitening: tiap bin dinormalisasi ke puncaknya sendiri (turun pelan), supaya treble juga menjulang. */
    for(i=1;i<=lim;i++){var vv=data[i]/255,mx=bm[i]*.996;if(vv>mx)mx=vv;if(mx<.22)mx=.22;bm[i]=mx;}
    for(k=0;k<n;k++){
      var i0=1+((Math.pow(k/n,1.3)*(lim-1))|0),i1=1+((Math.pow((k+1)/n,1.3)*(lim-1))|0),pk=0;
      if(i1<i0)i1=i0;
      for(i=i0;i<=i1&&i<=lim;i++){var dv=data[i]/255,w=dv/bm[i]*.8+dv*.3;if(w>pk)pk=w;}
      tg[k]=pk>1?1:pk;
    }
  }
  /* Attack cepat, release lebih lambat: nempel ke musik tapi nggak kedip. */
  for(k=0;k<n;k++){
    var dd=tg[k]-v[k],nv=v[k]+dd*(dd>0?.6:.22);
    if(nv<.004)nv=0;
    d[k]=nv-v[k];v[k]=nv;
  }
}

var VP={n:0,MAX:0,x:null,y:null,vx:null,vy:null,age:null,life:null,sz:null,kind:null,
  bc:null,bh:null,cnt:null,prevBeat:0,lastSpawn:0,lastBT:0,t:0,rot0:0};
function vpInit(){
  var M=IS_POTATO?28:72;
  if(VP.MAX===M)return;
  VP.MAX=M;VP.n=0;
  VP.x=new Float32Array(M);VP.y=new Float32Array(M);VP.vx=new Float32Array(M);VP.vy=new Float32Array(M);
  VP.age=new Float32Array(M);VP.life=new Float32Array(M);VP.sz=new Float32Array(M);VP.kind=new Uint8Array(M);
  /* Buffer per tahap fade (x,y,r): inti dan halo. Dipakai ulang tiap frame, nggak ada alokasi. */
  VP.bc=[new Float32Array(M*3),new Float32Array(M*3),new Float32Array(M*3)];
  VP.bh=[new Float32Array(M*3),new Float32Array(M*3),new Float32Array(M*3)];
  VP.cnt=new Int32Array(6);
}
/* Pita spektrum di sudut th (radian). Pemetaan sama seperti visualizer lama: cermin + putar pelan. */
function avAng(th){
  var u=th/6.2831853+VP.rot0;u-=Math.floor(u);
  var q=Math.abs(u-.5)*2,k=(Math.pow(q,1.2)*AVB.n)|0;
  if(k>=AVB.n)k=AVB.n-1;
  return AVB.v[k];
}
/* Kebalikan avAng: sudut tengah untuk pita k (s = -1 / +1 pilih sisi kiri atau kanan). */
function avBandAng(k,s){
  var q=Math.pow((k+.5)/AVB.n,1/1.2),u=.5+s*q*.5;
  return (u-VP.rot0)*6.2831853;
}
/* R = radius tepi Gargantua (px), power 0..1+ = kekuatan, a = sudut, far>1 = lemparan spike. Posisi relatif ke pusat lubang hitam. */
function vpSpawn(R,power,a,far){
  if(VP.n>=VP.MAX)return;
  far=far||1;
  var i=VP.n++,ca=Math.cos(a),sa=Math.sin(a);
  var us=Math.max(.7,Math.min(1.5,R/90));                 /* skala ukuran ikut ukuran lubang hitam */
  /* Kecepatan awal tinggi + drag kuat (lihat dr di draw) = hentakan cepat lalu berhenti; jarak tempuh tetap ~R */
  var sp=R*(1.0+Math.random()*1.9)*(.65+.7*power)*far;
  VP.sz[i]=(.55+Math.random()*.9)*us;
  VP.life[i]=(.5+Math.random()*.65)*(far>1?1.3:1);
  VP.kind[i]=(!IS_POTATO&&Math.random()<.5)?1:0;         /* 1 = debu glow, 0 = debu polos */
  var r0=R*(1.04+Math.random()*.05),tg=(Math.random()-.5)*.5*sp; /* sedikit komponen tangensial = kesan berputar */
  VP.x[i]=ca*r0;VP.y[i]=sa*r0;
  VP.vx[i]=ca*sp-sa*tg;VP.vy[i]=sa*sp+ca*tg;
  VP.age[i]=0;
}
function vpKill(i){
  var l=--VP.n;
  if(i===l)return;
  VP.x[i]=VP.x[l];VP.y[i]=VP.y[l];VP.vx[i]=VP.vx[l];VP.vy[i]=VP.vy[l];
  VP.age[i]=VP.age[l];VP.life[i]=VP.life[l];VP.sz[i]=VP.sz[l];VP.kind[i]=VP.kind[l];
}
/* ---------- Cakram hidup (DK) ----------
   Cakram akresi Gargantua yang bereaksi ke musik. Dua populasi partikel dalam frame cakram (diputar BH.ang):
   - piringan: elips pipih (ey .115) r 1.28R..2.75R, orbit Keplerian (dalam = cepat)
   - cincin lensa: hampir lingkaran (ey .86) r 1.25R..1.6R, "debu" yang melengkung di sekitar horizon
   SINKRON (penting buat mathrock/polyrhythm): tiap partikel terikat ke SATU pita spektrum lewat posisi radialnya
   (bass = dalam, treble = luar; cincin = treble), jadi pita yang beda ritme menyala sendiri-sendiri di radius yang beda.
   Per pita ada flash onset (attack instan, decay cepat) + energi langsung AVB.v. Tidak ada peluang acak yang bisa telat.
   Beat global / kick kuat = riak yang melebar sepanjang cakram; SPIKE = riak lebih terang + gema melingkar.
   Ringan: pool typed array tetap, partikel di-batch per 4 tingkat kecerahan (4 fill), halo = 1 sprite glow di-bake sekali,
   dibatasi 28 drawImage per frame. Tanpa shadowBlur / filter / gradient per frame. Hanya jalan saat SFX main; fade in/out. */
var DK={N:0,nd:0,ph:null,rr:null,ey:null,w:null,bd:null,sz:null,tw:null,fa:null,
  fl:null,cf:null,mn:null,bk:null,bn:null,hs:null,pr:0,mx:0,t:0,kick:0,lastRip:0,rip:[],sC:null,sD:null,HC:28};
/* Mode idle: cakram + debu muter tetap nyala pelan (denyut halus, tanpa sinkron musik) saat nggak ada SFX. Matikan: DK_IDLE=false.
   Otomatis mati di potato, saat idle saver 60 dtk aktif, dan saat swallow. DK_IDLE_PR = kecerahan idle (0..1). */
var DK_IDLE=true,DK_IDLE_PR=.55;
/* Riak saat idle: jeda antar riak (ms) dan kekuatannya (0..1). Naikin DK_IDLE_RIP_A kalau kurang kelihatan, naikin DK_IDLE_RIP_MS kalau kerapetan. */
var DK_IDLE_RIP_MS=2600,DK_IDLE_RIP_A=.55;
var DK_DC=['150,86,64','222,140,104','246,190,150','255,238,222'],DK_DA=[.50,.68,.85,1];
/* Tint band (UV/IR) untuk partikel cakram: palet dilerp ke band aktif mengikuti BANDV (sinkron dengan crossfade sprite Gargantua).
   Biaya per frame = lerp ~9 warna (string), nggak ada alokasi gambar. Sprite halo di-cache per warna. */
var DK_BP={
  vis:{dc:DK_DC,heat:'255,208,168',rip:'255,226,196',rip2:'255,240,226',halo:'255,226,196',uni:'204,188,150'},
  uv:{dc:['78,56,150','150,120,235','200,180,255','240,232,255'],heat:'190,160,255',rip:'205,185,255',rip2:'240,232,255',halo:'200,175,255',uni:'190,175,240'},
  ir:{dc:['120,40,24','230,90,50','255,150,100','255,215,190'],heat:'255,120,70',rip:'255,150,100',rip2:'255,215,190',halo:'255,140,90',uni:'240,150,110'}
};
var DKP={dc:DK_DC.slice(),heat:'255,208,168',rip:'255,226,196',rip2:'255,240,226',halo:'255,226,196',uni:'204,188,150',on:0},_dkSpc={};
function dkMix(a,b,t){if(t<=0)return a;if(t>=1)return b;var x=a.split(','),y=b.split(',');return((+x[0]+(y[0]-x[0])*t)|0)+','+((+x[1]+(y[1]-x[1])*t)|0)+','+((+x[2]+(y[2]-x[2])*t)|0);}
function dkPalUpdate(){
  var t=(CAMERA_MODE&&!IS_POTATO&&typeof BANDV!=='undefined'&&BANDV>.01&&BANDLAST!=='vis')?BANDV:0,B=DK_BP[BANDLAST]||DK_BP.uv,V=DK_BP.vis,i;
  DKP.on=t;
  for(i=0;i<4;i++)DKP.dc[i]=dkMix(V.dc[i],B.dc[i],t);
  DKP.heat=dkMix(V.heat,B.heat,t);DKP.rip=dkMix(V.rip,B.rip,t);DKP.rip2=dkMix(V.rip2,B.rip2,t);
  DKP.halo=t>.5?B.halo:V.halo;DKP.uni=t>.5?B.uni:V.uni;     /* sprite glow: ganti di tengah fade (cache per warna) */
}
function dkSpr(rgb){return _dkSpc[rgb]||(_dkSpc[rgb]=dkSprite(rgb));}
function dkSprite(rgb){
  var c=document.createElement('canvas');c.width=c.height=48;
  var x=c.getContext('2d'),gr=x.createRadialGradient(24,24,0,24,24,24);
  gr.addColorStop(0,'rgba('+rgb+',1)');gr.addColorStop(.18,'rgba('+rgb+',.55)');
  gr.addColorStop(.5,'rgba('+rgb+',.14)');gr.addColorStop(1,'rgba('+rgb+',0)');
  x.fillStyle=gr;x.fillRect(0,0,48,48);return c;
}
function dkInit(){
  var nd=IS_POTATO?36:110,nr=IS_POTATO?0:40,N=nd+nr,nb=AVB.n,i;
  if(DK.N===N&&DK.fl&&DK.fl.length===nb)return;
  DK.N=N;DK.nd=nd;DK.HC=IS_POTATO?0:28;
  DK.ph=new Float32Array(N);DK.rr=new Float32Array(N);DK.ey=new Float32Array(N);DK.w=new Float32Array(N);
  DK.sz=new Float32Array(N);DK.tw=new Float32Array(N);DK.fa=new Float32Array(N);DK.bd=new Uint8Array(N);
  DK.fl=new Float32Array(nb);DK.cf=new Float64Array(nb);DK.mn=new Float32Array(nb);
  DK.bk=[new Float32Array(N*3),new Float32Array(N*3),new Float32Array(N*3),new Float32Array(N*3)];
  DK.bn=new Int32Array(4);DK.hs=new Float32Array(Math.max(4,DK.HC*4));
  for(i=0;i<N;i++){
    var ring=i>=nd,u=Math.random(),rn;
    if(ring){DK.rr[i]=1.25+u*.35;DK.ey[i]=.86;rn=.2;DK.bd[i]=Math.min(nb-1,(nb*.55+Math.random()*nb*.45)|0);}
    else{rn=Math.pow(u,.8);DK.rr[i]=1.28+rn*1.47;DK.ey[i]=.115;DK.bd[i]=Math.min(nb-1,(rn*nb)|0);}
    DK.ph[i]=Math.random()*6.2831853;
    DK.w[i]=(ring?1.7:1.65)*Math.pow(1.3/DK.rr[i],1.5);   /* rad/s, Keplerian */
    DK.sz[i]=.55+Math.random()*.95;DK.tw[i]=Math.random()*6.2831853;
    DK.fa[i]=1-.4*rn;                                     /* tepi luar sedikit lebih redup */
  }
}
/* Dipanggil tiap frame dari 03-gargantua dengan kanvas sudah di-translate ke pusat lubang hitam. */
function drawAudioVisualizer(now,R){
  if(reduce){VP.n=0;DK.pr=0;return;}
  dkPalUpdate();   /* AV_ON (toggle panel musik) cuma mematikan REAKSI musik; cakram idle tetap jalan */
  updateAVColor(now);
  if(!R||R<1)return;
  try{
    var playing=!!(AV_ON&&activeSfx&&!activeSfx.paused&&!activeSfx.ended);
    var idleOn=DK_IDLE&&!IS_POTATO&&!(typeof idleMode!=='undefined'&&idleMode)&&!(typeof SW!=='undefined'&&SW);
    if(!playing&&!idleOn&&!VP.n&&DK.pr<.012){DK.pr=0;DK.mx=0;VP.prevBeat=0;return;}   /* idle dimatikan: nol biaya */
    vpInit();avbUpdate(now);dkInit();
    var dt=VP.t?(now-VP.t)/1000:.016;VP.t=now;
    if(dt<0||dt>.25){VP.n=0;DK.pr=0;DK.mx=0;DK.rip.length=0;dt=.016;}   /* jeda lama (tab hidden): buang sisa partikel */
    if(dt>.05)dt=.05;
    /* Panel tuning BH (slider Bloom & Speed -> BHU.bloom / BHU.speed): bloom = kuat glow halo/pemanasan/riak, speed = kecepatan putar + denyut idle.
       Sinkron ke musik (flash onset, riak) sengaja TIDAK ikut speed supaya ketukan tetap pas. */
    var bl=(typeof BHU!=='undefined'&&typeof BHU.bloom==='number')?BHU.bloom:1,spd=(typeof BHU!=='undefined'&&typeof BHU.speed==='number')?BHU.speed:1;
    var beat=playing?AV.beat:0,lv=playing?AV.level:0,i,k,b;
    var n=AVB.n,v=AVB.v,d=AVB.d,cd=AVB.cd,fl=DK.fl,cf=DK.cf,mn=DK.mn;
    var onT=AV.fallback?.10:.14,cap=IS_POTATO?2:5,kickLow=false;
    /* flash per pita meluruh: bass pelan (~200ms), treble cepat (~100ms) supaya hi-hat rapat tetap terbaca */
    for(k=0;k<n;k++){fl[k]*=Math.exp(-dt*(5+5*k/n));if(fl[k]<.01)fl[k]=0;}
    if(playing){
      VP.rot0=(VP.rot0+dt*(.022+beat*.10))%1;
      /* 1) Onset per pita (relatif ke rata-rata pitanya sendiri => tetap peka di bagian padat/keras):
            flash cakram SEKETIKA, dan (kalau jatah ada) debu ditembakkan dari sudut pita itu */
      for(k=0;k<n;k++){
        if(!(d[k]>onT&&v[k]>.28&&v[k]>mn[k]+.06))continue;
        if(now-cf[k]<(IS_POTATO?90:48))continue;
        cf[k]=now;
        var fv=v[k]+.35;if(fv>1.25)fv=1.25;if(fv>fl[k])fl[k]=fv;
        if(k<n*.3&&v[k]>.7)kickLow=true;
        if(cap>0&&now-cd[k]>(AV_FAST?85:110)){
          cd[k]=now;cap--;
          var side=Math.random()<.5?-1:1,jit=(Math.random()-.5)*6.2831853/n*1.6,pc=IS_POTATO?1:(v[k]>.7?3:2),j;
          for(j=0;j<pc;j++)vpSpawn(R,v[k],avBandAng(k,side)+jit+(Math.random()-.5)*.18,1);
        }
      }
      /* 2) Beat global (analyser: lastBeatT berubah; fallback: tepi naik). Semburan debu di sudut terkeras. SPIKE = lebih banyak + lebih jauh + riak terang. */
      var nbt=AV.fallback?(beat>.62&&VP.prevBeat<=.62&&now-VP.lastSpawn>110):(AV.lastBeatT>0&&AV.lastBeatT!==VP.lastBT&&beat>.5);
      VP.lastBT=AV.lastBeatT;
      var spike=beat>=(AV.fallback?.85:SPIKE_T);
      if(nbt){
        VP.lastSpawn=now;
        var far=spike?1.8:1;
        var nbn=(IS_POTATO?2:3)+((beat*(IS_POTATO?2:4)+lv*2)|0)+(spike?(IS_POTATO?2:5):0);
        for(i=0;i<nbn;i++){
          var ba=Math.random()*6.2831853,be=avAng(ba),t2,a2,e2;
          for(t2=0;t2<2;t2++){a2=Math.random()*6.2831853;e2=avAng(a2);if(e2>be){be=e2;ba=a2;}}
          vpSpawn(R,Math.max(beat*.7,be),ba,far);
        }
      }
      /* 3) Riak di cakram: beat global ATAU kick kuat di pita bass (cadangan kalau detektor global kelewat di ritme padat) */
      if((nbt||kickLow)&&now-DK.lastRip>150){
        DK.lastRip=now;DK.kick=Math.min(2.2,DK.kick+(nbt?.5:.3)+(spike?.9:0));
        if(DK.rip.length>=(IS_POTATO?1:3))DK.rip.shift();
        DK.rip.push({t:now,a:spike?1:(nbt?.6:.4),s:spike?1:0});
      }
    }
    VP.prevBeat=beat;
    for(k=0;k<n;k++)mn[k]+=(v[k]-mn[k])*Math.min(1,dt*3.2);   /* rata-rata lambat per pita, dipakai deteksi onset frame berikutnya */

    /* ---- cakram hidup ---- */
    DK.pr+=((playing?1:(idleOn?DK_IDLE_PR:0))-DK.pr)*Math.min(1,dt*(playing?5:3));
    /* Riak IDLE: tanpa musik, riak lembut melebar di cakram tiap ~DK_IDLE_RIP_MS (ikut slider Speed). Nggak ngaruh ke DK.kick. */
    if(!playing&&idleOn&&DK.pr>.2&&spd>.05&&now-DK.lastRip>DK_IDLE_RIP_MS/spd){
      DK.lastRip=now;
      if(DK.rip.length>=2)DK.rip.shift();
      DK.rip.push({t:now,a:DK_IDLE_RIP_A,s:0});
    }
    DK.mx+=((playing?1:0)-DK.mx)*Math.min(1,dt*4);var idl=1-DK.mx;   /* 1 = idle murni, 0 = musik penuh */
    var pr=DK.pr;
    if(pr<.012)pr=DK.pr=0;
    if(pr>0){
      DK.kick*=Math.exp(-dt*5.5);
      var bs=playing?(AV.bass>1?1:AV.bass):0,bt=beat>1?1:beat,heat=bt+idl*.3*(.5+.5*Math.sin(DK.t*1.4-1));
      DK.t+=dt*spd;
      var spin=(1+1.1*lv+DK.kick)*spd,eyM=1+.65*bs+.5*bt;     /* bass menebalkan cakram, kick = hentakan putar sesaat */
      var us=Math.max(.7,Math.min(1.5,R/90)),R2=R*R*1.04,ddy=(typeof BH_CSS!=='undefined'&&BH_CSS.spr&&BH.sprite===BH_CSS.spr&&typeof BH_DISK_DY==='number')?R*BH_DISK_DY:0,ta=DK.t,bn=DK.bn,bk=DK.bk,hs=DK.hs,hc=0,HC=DK.HC;
      bn[0]=bn[1]=bn[2]=bn[3]=0;
      for(i=0;i<DK.N;i++){
        var ph=DK.ph[i]+DK.w[i]*spin*dt;if(ph>6.2831853)ph-=6.2831853;DK.ph[i]=ph;
        var s=Math.sin(ph),rr=DK.rr[i]*R,ey=DK.ey[i];if(ey<.5)ey*=eyM;
        var x=Math.cos(ph)*rr,y=s*rr*ey;
        if(s<0&&x*x+(y+ddy)*(y+ddy)<R2)continue;                    /* sisi belakang cakram tertutup horizon */
        b=DK.bd[i];
        var I=(.16+.78*v[b]+.9*fl[b]+.09*Math.sin(ta*3+DK.tw[i])+idl*(.22+.26*(.5+.5*Math.sin(ta*1.4-b*.5))))*DK.fa[i]*(1+.2*s);   /* idl*(...) = denyut gelombang pelan ke luar saat idle */
        if(I>1.4)I=1.4;
        var q=I<.3?0:(I<.55?1:(I<.8?2:3)),r=DK.sz[i]*us*(1+.35*(I>1?1:I))*(1+.15*s),o=bn[q]*3;
        bk[q][o]=x;bk[q][o+1]=y;bk[q][o+2]=r;bn[q]++;
        if(I>.5+.2*DK.mx&&hc<HC&&bl>.05){o=hc*4;hs[o]=x;hs[o+1]=y;hs[o+2]=r*4.2;hs[o+3]=(I-.5)*.6>1?1:(I-.5)*.6;hc++;}
      }
      g.save();
      g.rotate(BH.ang);g.translate(0,ddy);                  /* frame cakram (sama dengan sprite CSS), pusat = pusat cakram bukan horizon */
      g.globalCompositeOperation='lighter';
      if(heat>.04&&bl>.02){                                     /* pemanasan cakram: beat (musik) / denyut pelan (idle) */
        g.fillStyle='rgba('+DKP.heat+','+(.10*heat*pr*(bl>1.6?1.6:bl))+')';
        g.beginPath();g.ellipse(0,0,R*2.7,R*.26*eyM,0,0,6.2831853);g.fill();
      }
      var T=6.2831853,arr,m,j2,p3,rp,u3;
      for(j2=DK.rip.length-1;j2>=0;j2--){               /* riak: ellipse yang melebar sepanjang cakram */
        rp=DK.rip[j2];u3=(now-rp.t)/760;
        if(u3>=1){DK.rip.splice(j2,1);continue;}
        var ra=Math.pow(1-u3,1.6)*(.1+.5*rp.a)*pr*Math.min(1.4,.35+.65*bl),rx=R*(1.18+1.75*u3);
        g.strokeStyle='rgba('+DKP.rip+','+ra+')';g.lineWidth=Math.max(1,R*.018*(1-.5*u3)+.6);
        g.beginPath();g.ellipse(0,0,rx,rx*.115*eyM,0,0,T);g.stroke();
        if(rp.s&&!IS_POTATO){
          g.strokeStyle='rgba('+DKP.rip2+','+(ra*.45)+')';g.lineWidth=Math.max(.8,R*.012);
          g.beginPath();g.arc(0,0,R*(1.05+.55*u3),0,T);g.stroke();
        }
      }
      if(hc){                                           /* halo glow: 1 sprite, maksimal 28 drawImage */
        var sC=dkSpr(DKP.halo);
        for(j2=0;j2<hc;j2++){
          p3=j2*4;g.globalAlpha=Math.min(1,hs[p3+3]*pr*.9*(bl>1.6?1.6:bl));
          var hr=hs[p3+2]*(.7+.3*(bl>1.6?1.6:bl));
          g.drawImage(sC,hs[p3]-hr,hs[p3+1]-hr,hr*2,hr*2);
        }
        g.globalAlpha=1;
      }
      for(b=0;b<4;b++){                                 /* inti partikel: 4 fill (gelap -> terang) */
        m=bn[b];
        if(m){
          g.fillStyle='rgba('+DKP.dc[b]+','+(DK_DA[b]*pr)+')';
          g.beginPath();arr=bk[b];
          for(j2=0;j2<m;j2++){p3=j2*3;g.moveTo(arr[p3]+arr[p3+2],arr[p3+1]);g.arc(arr[p3],arr[p3+1],arr[p3+2],0,T);}
          g.fill();
        }
      }
      g.restore();
    }

    /* ---- debu glowing yang terlempar dari tepi ---- */
    if(!VP.n)return;
    var dr=Math.exp(-2.2*dt),pw=.55+.45*Math.min(1,lv+beat),glowOn=!IS_POTATO;
    var cnt=VP.cnt,bc=VP.bc,bh=VP.bh;
    cnt[0]=cnt[1]=cnt[2]=cnt[3]=cnt[4]=cnt[5]=0;
    for(i=VP.n-1;i>=0;i--){
      var age=VP.age[i]+dt,life=VP.life[i];
      if(age>=life){vpKill(i);continue;}
      VP.age[i]=age;
      var vx=VP.vx[i]*dr,vy=VP.vy[i]*dr;VP.vx[i]=vx;VP.vy[i]=vy;
      var x2=VP.x[i]+vx*dt,y2=VP.y[i]+vy*dt;VP.x[i]=x2;VP.y[i]=y2;
      var fade=1-age/life,r2=VP.sz[i]*(.65+.35*fade),b2=fade>.6?0:(fade>.3?1:2),o2;
      if(VP.kind[i]===1&&glowOn){o2=cnt[3+b2]*3;bh[b2][o2]=x2;bh[b2][o2+1]=y2;bh[b2][o2+2]=r2*3.4;cnt[3+b2]++;}
      o2=cnt[b2]*3;bc[b2][o2]=x2;bc[b2][o2+1]=y2;bc[b2][o2+2]=r2;cnt[b2]++;
    }
    var AB=[1,.55,.22],T2=6.2831853,arr2,m2,j3,q3;
    g.save();
    g.globalCompositeOperation='lighter';
    if(glowOn&&bl>.05&&(cnt[3]||cnt[4]||cnt[5])){
      var sD=dkSpr(DKP.uni);
      for(b=0;b<3;b++){                                 /* halo: sprite glow (bukan lingkaran datar) */
        m2=cnt[3+b];
        if(m2){
          g.globalAlpha=Math.min(1,.62*pw*AB[b]*(bl>1.6?1.6:bl));arr2=bh[b];
          for(j3=0;j3<m2;j3++){q3=j3*3;g.drawImage(sD,arr2[q3]-arr2[q3+2],arr2[q3+1]-arr2[q3+2],arr2[q3+2]*2,arr2[q3+2]*2);}
        }
      }
      g.globalAlpha=1;
    }
    for(b=0;b<3;b++){
      m2=cnt[b];
      if(m2){
        g.fillStyle='rgba('+DKP.uni+','+(.9*pw*AB[b])+')';
        g.beginPath();arr2=bc[b];
        for(j3=0;j3<m2;j3++){q3=j3*3;g.moveTo(arr2[q3]+arr2[q3+2],arr2[q3+1]);g.arc(arr2[q3],arr2[q3+1],arr2[q3+2],0,T2);}
        g.fill();
      }
    }
    g.restore();
  }catch(err){}
}
/* Hook filled by the music-player IIFE — stops HUD spectrum RAF + UI state
   the instant a star SFX takes over, so the two systems never fight. */
var musicForceStop=null;
function pauseMusicForSfx(){
  /* Pause BGM while star SFX plays (ducking removed — volume control is only via 🔊/🔈). */
  safePause(AMB);
  safePause(MUSIC_COLLAP);
  if(typeof musicForceStop==='function'){
    try{musicForceStop();}catch(e){}
  }
}
/* Sambungkan track ke graph (analyser + lowpass muffle). Dulu cuma requestAnimationFrame: saat tab hidden / PWA minimize
   rAF nggak jalan, jadi track berikutnya (auto-advance shuffle/repeat) main mentah tanpa muffle. Hidden -> langsung;
   visible -> rAF (hindari hitch di frame klik) + timer cadangan. */
function sfxWireSoon(a){
  var done=false;
  function go(){if(done)return;done=true;if(activeSfx===a){audioVizInit(a);try{updateSpatialAttenuation();}catch(e){}}}
  if(document.hidden){go();return;}
  requestAnimationFrame(go);
  setTimeout(go,120);
}
function playSfx(a){
  /* Star SFX no longer warms, loads, or auto-resumes constellation music. */
  if(!a)return;
  if(typeof RADIO_SILENCE!=='undefined'&&RADIO_SILENCE)return;
  if(typeof lisBlock==='function'&&lisBlock('sig')){lisDenied('sig');return;}   /* Lost-in-Space: teleskop nggak ada / star tracker belum pulih */
  if(a.preload!=='auto'){a.preload='auto';}
  /* Replay-safe: SFX yang sudah habis dianggap mulai baru (bukan toggle pause), volume balik ke dasar. */
  if(a.ended){safeReset(a);if(activeSfx===a){a.onended=null;activeSfx=null;}}
  try{a.volume=a._bv||.85;}catch(eBv){}
  if(AV._volEl===a){AV._volEl=null;AV._volLow=false;}
  if(activeSfx===a){
    if(a.paused){
      pauseMusicForSfx();
      setAVColor(a,false);
      safePlay(a);
      /* Defer analyser wiring off the click frame — avoids a hitch when the
         music HUD was just torn down and a supernova burst is spawning. */
      sfxWireSoon(a);
    }else{
      safePause(a);
      audioVizOff();
    }
    return;
  }
  pauseMusicForSfx();
  if(activeSfx&&activeSfx!==a){
    activeSfx.onended=null;
    
    activeSfx.loop=false;
    /* repeat-one jangan nempel di track yang ditinggalkan */
    safeReset(activeSfx);
    try{activeSfx.volume=activeSfx._bv||.85;}catch(eOv){}
  }
  /* Satu suara saja: SFX lain yang masih hidup (panel musik / retry loading / sisa loop) dimatikan juga,
     bukan cuma activeSfx. Loop-nya dilepas biar nggak ke-bawa saat diputar lagi lewat jalur lain. */
  try{
    for(var _sk in SFX){
      var _o=SFX[_sk];
      if(_o===a)continue;
      if(!_o.paused||_o._want){_o.onended=null;safeReset(_o);try{_o.volume=_o._bv||.85;}catch(eO2){}}
      _o.loop=false;
    }
  }catch(eKill){}
  activeSfx=a;
  /* Docking tetap: ganti bintang SFX (supernova / panel musik / repeat) → TX ikut sumber baru.
     Satu sektor: key TX diganti. Sektor lain yang sudah relay: sumber TX pindah ke sana, sektor lama jadi receiver (txFollowSfx, 02-sky-logic.js). */
  try{
    if(typeof txFollowSfx==='function'&&typeof keyFromAudio==='function'){
      var _pk=keyFromAudio(a),_ps=typeof sfxSector==='function'?sfxSector():null;
      if(_ps&&_pk)txFollowSfx(_pk,_ps);
    }
  }catch(eTxK){}

  setAVColor(a,false);
  a.onended=null;
  a.onended=function(){
    if(activeSfx===a){
      activeSfx=null;
      setAVColor(null,false);
      audioVizOff();
      /* Intentionally do not resume music here. */
      var sk=keyFromAudio(a);
      if(sk)onStellarSignal(sk);
    }
  };
  safePlay(a);
  try{updateSpatialAttenuation();}catch(eSp0){}   /* redam sejak detik pertama, jangan nunggu frame render berikutnya */
  /* Loop mengikuti mode repeat panel musik walau diputar dari kanvas / supernova (panel tertutup). */
  try{if(typeof window.__mpSyncLoop==='function')window.__mpSyncLoop(a);}catch(eLp){}
  sfxWireSoon(a);
}

var BH={x:0,y:0,hx:0,hy:0,R:26,Rr:0,h:0,sprite:null,S:0,ang:-.48};
function clamp(v){return v<0?0:v>1?1:v;}
function rgb(hex){var n=parseInt(hex.slice(1),16);return((n>>16)&255)+','+((n>>8)&255)+','+(n&255);}


/* dipindah dari bagian bawah: dipanggil saat load (CONS.forEach di sky-logic), jadi harus sudah ada sebelum file 02 jalan */
function cons(id){for(var i=0;i<CONS.length;i++)if(CONS[i].id===id)return CONS[i];}
