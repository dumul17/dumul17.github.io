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
var IS_POTATO=!!((navigator.deviceMemory&&navigator.deviceMemory<=2)||(navigator.hardwareConcurrency&&navigator.hardwareConcurrency<=2)||(navigator.connection&&navigator.connection.saveData));
/* Override manual buat ngetes: ?perf=high (paksa normal) / ?perf=low (paksa potato). Berguna di WebView yang salah lapor spek. */
try{var _pf=/[?&]perf=(high|low)/.exec(location.search);if(_pf)IS_POTATO=_pf[1]==='low';}catch(e){}
try{if(IS_POTATO)document.documentElement.classList.add('perf-tier-0');}catch(e){}
var W=0,H=0,DPR=1,START=performance.now(),renderRAF=0,renderGeneration=0,pageHidden=false,hiddenAt=0;
/* Idle saver: after 60s without pointer activity, skip secondary particles (SS) etc. */
var lastActivity=performance.now(),idleMode=false,IDLE_MS=60000;
function markActivity(){lastActivity=performance.now();if(idleMode)idleMode=false;}
var mouse={x:0,y:0,tx:0,ty:0,px:null,py:null},glitchUntil=0,hot=null;
/* Hover hit-test is expensive (all stars + lines through gSky). Only run when
   the pointer actually moved, throttled ~30Hz — never every render frame. */
var hoverDirty=false,lastHoverAt=0,HOVER_MIN_MS=33;
var touchMode=('ontouchstart' in window)||navigator.maxTouchPoints>0;
var drag={on:false,moved:false,pid:null,x0:0,y0:0,bx:0,by:0};
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
      el.setAttribute('aria-label','Putar suara '+d.label);
      el.style.width=el.style.height='52px';el.style.marginLeft=el.style.marginTop='-26px';
      prev.parentNode.insertBefore(el,prev.nextSibling);prev=el;
    }
    FXBTN[key]=el;
  });
})();
(function(){ /* bungkus elemen sky dalam #stage (urutan DOM dipertahankan) */
  var b=document.body,ids={sky:1,header:1,footer:1,'cap-bh':1,bh:1,'bh-clock':1,'secret-msg':1,'tele-greet':1,'sn-flash':1};
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
/* Teks/sprite di canvas ikut berputar bareng #stage di HP landscape. uprBegin putar balik terhadap titik (x,y) supaya tegak di layar. */
function upAng(){return STG.rot<0?Math.PI/2:(STG.rot>0?-Math.PI/2:0);}
/* Label bintang otomatis pindah sisi (kiri<->kanan) dan geser vertikal kalau mepet tepi layar, supaya nggak kepotong.
   x,y = posisi bintang di kanvas; nx = sisi awal (<0 kiri, >0 kanan); gapH = jarak dari bintang; wT = lebar teks;
   exL/exR = ruang ekstra (mis. batang spektrum) di sisi kiri/kanan teks. Mode ROT: teks tegak di layar, jadi diukur di koordinat layar asli. */
function lblSide(x,y,nx,gapH,wT,exL,exR){
  var cx=STG.rot?v2c(x,y)[0]:x,lim=STG.rot?STG.iw:W,m=6;
  function over(sg){return sg>0?Math.max(0,cx+gapH+wT+exR-(lim-m)):Math.max(0,m-(cx-gapH-wT-exL));}
  var sg=nx<0?-1:1,o1=over(sg);
  if(o1<=0)return nx;
  var o2=over(-sg);
  return o2<o1?-nx:nx; /* pilih sisi yang paling sedikit kepotong */
}
function lblDY(x,y,dy){
  var cy=STG.rot?v2c(x,y)[1]:y,lim=STG.rot?STG.ih:H;
  var ny=cy+3+dy;
  if(ny<10)return dy+(10-ny);
  if(ny>lim-8)return dy-(ny-(lim-8));
  return dy;
}
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
/* Rasi yang digabung di overview (mis. Taurus nyambung ke Auriga lewat Elnath): `joinTo` di sky-data.js.
   Di overview keduanya gerak/goyang bareng (satu 'lead'), di mode kamera fokus rasi pasangannya disembunyikan. */
var JOIN_LEAD={};SKY.rasi.forEach(function(r){if(r.joinTo)JOIN_LEAD[r.id]=r.joinTo;});
function joinPartner(id){if(JOIN_LEAD[id])return JOIN_LEAD[id];for(var k in JOIN_LEAD)if(JOIN_LEAD[k]===id)return k;return null;}
function joinHide(id){if(!CAMERA_MODE)return false;var f=camFocusId();return !!f&&f!=='free'&&f!==id&&joinPartner(id)===f;}
var ZOOM_LEVELS=[1,1.5,2,3];
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
  CULL.off=!CULL.on||!!SW||!W||!H;
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
function cullPtAt(x,y,pad){var t=skyXF(x,y);return cullIn(t[0],t[1],pad);}

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
  if(on!==SSC.on){SSC.on=on;SSC.el.classList.toggle('on',on);SSC.el.setAttribute('aria-hidden',on?'false':'true');}
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
  if(typeof BH!=='undefined'&&typeof SUM!=='undefined'&&SUM.on&&BHSC>.05){
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
var SUM={on:false},SUM_R=6;
/* Gargantua di OVERVIEW sekarang bisa di-summon/recall (tombol 🕳️ sama seperti di dalam sektor).
   HOME_BH_DEFAULT = kondisi awal kalau pengunjung belum pernah memilih; pilihan terakhir diingat di localStorage.dumul_bh_home. */
var HOME_BH_DEFAULT=true;
var HBH={on:HOME_BH_DEFAULT};
try{var _hb=localStorage.getItem('dumul_bh_home');if(_hb==='0')HBH.on=false;else if(_hb==='1')HBH.on=true;}catch(e){}
/* Tune Gargantua (panel 🎚️): size = ukuran, str = kekuatan lensing, bloom = glow hangat, speed = kecepatan animasi. Disimpan di localStorage.dumul_bh_cfg. */
var BHU_DEF={size:1,str:1,bloom:1,speed:1,ast:1};
var BHU={size:1,str:1,bloom:1,speed:1,ast:1};
var BHU_RNG={size:[.5,1.8],str:[0,2.5],bloom:[0,2],speed:[0,3],ast:[0,1]};
/* Orbit asteroid ikut slider Strength (fisika): 1.0x = jarak asli, makin kuat tarikannya makin merapat (min 0.4x), makin lemah makin jauh (max 1.45x). Dihaluskan lewat AST_K. */
var AST_K=1;
/* Orbit asteroid (fisika): makin kuat tarikan makin rapat. Di sector ikut ukuran BH (BHSC = size/1.8). */
function astOrbitTarget(){return Math.max(.4,1.45-.45*BHU.str)*(BHU_CTX?BHSC:1);}
function bhuClamp(k,v){var r=BHU_RNG[k];v=+v;if(!(v===v))v=BHU_DEF[k];return Math.max(r[0],Math.min(r[1],v));}
try{var _bc=JSON.parse(localStorage.getItem('dumul_bh_cfg')||'null');if(_bc)for(var _bk in BHU_DEF)if(typeof _bc[_bk]==='number')BHU[_bk]=bhuClamp(_bk,_bc[_bk]);}catch(e){}
/* ===== Tune terpisah: overview vs BH yang di-summon di dalam sector =====
   Sector: ukuran 1.80x = ukuran BH overview 1.00x (jadi 0.50x jauh lebih kecil dari overview), strength/bloom/speed 1.00x = sama dgn overview,
   asteroid default Show. BH sector TIDAK lagi membesar/mengecil karena dekat/jauh dari rasi (ukuran murni dari slider). */
var BHU_SDEF={size:1,str:1,bloom:1,speed:1,ast:1},BH_SECT_MAXSIZE=1.8;
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
  z=Math.max(1,Math.min(3,+z||1));
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
function updateCamZoomUI(){
  var el=document.getElementById('cam-zoom');
  var val=document.getElementById('cam-zoom-val');
  if(val)val.textContent=formatZoom(skyZoom);
  if(el){
    var show=!!(CAMERA_MODE&&typeof OBSERVE_MODE!=='undefined'&&OBSERVE_MODE);
    el.classList.toggle('on',show);
    el.setAttribute('aria-hidden',show?'false':'true');
  }
}

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
  CAMERA_MODE=!!on;
  if(CAMERA_MODE&&typeof bhTuneClose==='function')bhTuneClose(); /* panel tune BH ketutup otomatis di mode kamera */
  document.body.classList.toggle('camera-mode',CAMERA_MODE);
  var btn=document.getElementById('mode-camera');
  if(btn){
    btn.classList.toggle('on',CAMERA_MODE);
    btn.setAttribute('aria-pressed',CAMERA_MODE?'true':'false');
    btn.title=CAMERA_MODE?'Exit Constellation Camera':'Constellation Camera';
    btn.setAttribute('aria-label',CAMERA_MODE?'Exit Constellation Camera':'Constellation Camera');
    btn.hidden=!(typeof OBSERVE_MODE!=='undefined'&&OBSERVE_MODE);
  }
  if(!CAMERA_MODE){FOCUS.i=0;FOCUS.anim=false;setSkyZoom(1,false);FOCUS.list=null;}
  else{FOCUS.list=focusList();FOCUS.i=0;}
  if(!CAMERA_MODE){FFX.id=null;hideWhisper();}
  focusUI();
  updateCamZoomUI();
  if(!CAMERA_MODE)flushConsPopups();
  if(typeof showModeToast==='function'){
    if(CAMERA_MODE)showModeToast('CONSTELLATION CAMERA\nTAP ‹ › TO FOCUS · PINCH / WHEEL',null,2200);
    else if(typeof OBSERVE_MODE!=='undefined'&&OBSERVE_MODE)showModeToast('CAMERA OFF',null,1400);
  }
}
/* ---------- Constellation Camera: focus targets (tap to lock + auto-fit zoom) ---------- */
var FOCUS={i:0,anim:false,list:null};
/* Per-sector focus order (display names use brightest star for canis/scorpius).
   Orion: Free → Sirius → Orion → Gemini → Taurus → Pleiades
   Virgo: Free → Boötes → Virgo · Sektor 03 (summer): Free → Antares */
/* Urutan kamera fokus per sektor: dari `focus` + `focusName` di sky-data.js. Rasi off / di luar sektor otomatis terlewat (sectShow). */
function focusList(){
  var order=SKY.focusOrder(SECT.cur?SECT.cur.k:null);
  var L=[{id:'free',n:'Free'}];
  for(var i=0;i<order.length;i++){
    var id=order[i];
    if(sectShow(id,true))L.push({id:id,n:SKY.rasiBy[id].focusName||id});
  }
  /* Di dalam sektor, kalau BH mini lagi dipanggil: opsi fokus terakhir sebelum balik ke Free */
  if(SECT.cur&&SUM.on)L.push({id:'bh',n:'Gargantua'});
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
function focusUI(){
  var b=document.getElementById('cf-name');if(!b||!FOCUS.list)return;
  var f=FOCUS.list[FOCUS.i];b.textContent=f.id==='free'?'FOCUS · FREE':'● '+f.n.toUpperCase();
}
function focusCycle(d){
  if(!FOCUS.list)FOCUS.list=focusList();
  var n=FOCUS.list.length,i=FOCUS.i,t=0;
  do{i=(i+d+n)%n;t++;}while(t<n&&FOCUS.list[i].id!=='free'&&!focusGeom(FOCUS.list[i].id));
  FOCUS.i=i;FOCUS.anim=FOCUS.list[i].id!=='free';_freeReset=FOCUS.list[i].id==='free';
  focusUI();focusFx(FOCUS.list[i].id);haptic(8);
}
var FOCUS_WHISPER=SKY.FOCUS_WHISPER;
var FOCUS_INFO=SKY.FOCUS_INFO;
var FFX={id:null,t0:0},_whT=0;
function hideWhisper(){var w=document.getElementById('cam-whisper');if(w)w.classList.remove('on');clearTimeout(_whT);}
function showWhisper(id){
  var w=document.getElementById('cam-whisper'),a=FOCUS_WHISPER[id],d=FOCUS_INFO[id],f=FOCUS.list&&FOCUS.list[FOCUS.i];
  if(!w||!d||!f)return;
  clearTimeout(_whT);w.classList.remove('on');
  var wh=a?a[(Math.random()*a.length)|0]:'';
  /* Rasi / cluster yang masih terkunci: data & fact ikut terkunci, cuma nama + whisper. */
  if(id!=='bh'&&!isUnlocked(id)){
    var hl='<div class="ci-i ci-name" style="--d:.2s">'+f.n+'</div><div class="ci-i ci-wh" style="--d:.55s">“'+wh+'”</div>';
    w.style.setProperty('--cc','rgb('+(d.rgb||'110,229,255')+')');
    setTimeout(function(){if(FFX.id!==id)return;w.innerHTML=hl;w.classList.add('on');},260);
    return;
  }
  var rows=d.rows.slice(0,3),n=rows.length;
  var h='<div class="ci-i ci-tag" style="--d:.15s">'+d.tag+'</div><div class="ci-i ci-name" style="--d:.3s">'+f.n+'</div><div class="ci-rows">';
  for(var i=0;i<n;i++)h+='<b class="ci-i" style="--d:'+(.55+i*.14)+'s">'+rows[i][0]+'</b><span class="ci-i" style="--d:'+(.6+i*.14)+'s">'+rows[i][1]+'</span>';
  var t=.55+n*.14+.15;
  h+='</div><div class="ci-i ci-fact" style="--d:'+t+'s"><em>FACT</em>'+d.fact+'</div><div class="ci-i ci-wh" style="--d:'+(t+.7)+'s">\u201c'+wh+'\u201d</div>';
  w.style.setProperty('--cc','rgb('+(d.rgb||'110,229,255')+')');
  setTimeout(function(){if(FFX.id!==id)return;w.innerHTML=h;w.classList.add('on');},260);
}
function focusFx(id){
  if(id==='free'){FFX.id=null;hideWhisper();return;}
  FFX.id=id;FFX.t0=performance.now();showWhisper(id);
  if(id==='bh'){[350,650,950].forEach(function(d){setTimeout(function(){if(FFX.id==='bh'){var p=camBH();createBHShockwave(p[0],p[1]);}},d);});}
}
function drawFocusFx(now){
  var id=FFX.id;if(!id||!CAMERA_MODE||reduce)return;
  var t=now-FFX.t0,i,q,A,B,segs=[],rgb='110,229,255';
  g.save();g.globalCompositeOperation='lighter';g.lineCap='round';
  if(id==='bh'){
    var bp=camBH(),R=BH.Rr*BHZ;
    if(R>=1&&t<2800){
      var u=Math.min(1,t/1200),e=u*u*(3-2*u),al=t<1200?1:Math.max(0,1-(t-1200)/1600),a0=-1.5708,a1=a0+6.2832*e;
      g.strokeStyle='rgba(110,229,255,'+(.16*al)+')';g.lineWidth=7;g.beginPath();g.arc(bp[0],bp[1],R*1.2,a0,a1);g.stroke();
      g.strokeStyle='rgba(234,252,255,'+(.85*al)+')';g.lineWidth=1.6;g.beginPath();g.arc(bp[0],bp[1],R*1.2,a0,a1);g.stroke();
      if(u<1){g.fillStyle='rgba(255,255,255,.95)';g.beginPath();g.arc(bp[0]+Math.cos(a1)*R*1.2,bp[1]+Math.sin(a1)*R*1.2,3.2,0,6.2832);g.fill();}
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
    var c=cons(id);if(!c||!isUnlocked(c.id)){g.restore();return;} /* rasi terkunci: garis belum boleh muncul */
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
function focusRefresh(){ /* daftar fokus berubah (BH mini dipanggil/ditarik) saat mode kamera aktif */
  if(!CAMERA_MODE)return;
  var cid=camFocusId(),L=focusList(),k=0;
  for(var i=0;i<L.length;i++)if(L[i].id===cid)k=i;
  if(cid==='bh'&&k===0){FOCUS.anim=false;_freeReset=true;}
  FOCUS.list=L;FOCUS.i=k;focusUI();
}
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
  function bind(id,d){var b=document.getElementById(id);if(!b)return;
    b.addEventListener('pointerdown',function(e){e.stopPropagation();});
    b.addEventListener('click',function(e){e.stopPropagation();focusCycle(d);});}
  bind('cf-prev',-1);bind('cf-name',1);bind('cf-next',1);
})();
var konamiSeq=[],konami=['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight'];
var utcClicks=0,utcReset=0;
var SW=null,swP=0;
var AMB=mkAudio('constellation.opus',.5,true,'auto');
var GARG=mkAudio('glitch-instrumental.opus',0,true,'auto');
var MUSIC_COLLAP=mkAudio('collapsars.opus',.5,true,'metadata');
/* Objek audio per bintang SFX — dibuat dari registry (sky-data.js). File: audio/<nama>.opus */
var SFX={};
SKY.sfx.forEach(function(d){SFX[d.key]=mkAudio(d.audio,.85,false,'metadata');});
function mkAudio(name,vol,loop,preloadMode){var a=new Audio('audio/'+encodeURIComponent(name));a.preload=preloadMode||'metadata';a.loop=!!loop;a.volume=vol;a._bv=vol;return a;}
function safePlay(a){
  if(!a)return false;
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
        if(!a.paused&&!a.ended)return;
        if(typeof unlockAudioGraph==='function')unlockAudioGraph();
        try{var p3=a.play();if(p3&&p3.catch)p3.catch(function(){});}catch(e2){}
      },120);
    });
    return true;
  }catch(e){return false;}
}
function safePause(a){if(!a)return;try{a.pause();}catch(e){}}
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
  var first='Hello, I love You...',finalText='Hello, Friend...';
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
        AV.lpf.connect(AV.ctx.destination);
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
/* ---- Spatial muffle (lowpass "tenggelam" saat sumber suara jauh) ----
   Aktif di: (1) dalam sektor + Constellation Camera (jarak bintang ke tengah layar),
             (2) transisi pindah sektor (jarak ikon sektor sumber ke tengah layar),
             (3) home/overview (selalu teredam; ikon sektor jauh dari Gargantua).
   Di overview, muffle dimatikan kalau sektor sumber punya "relay" = Gargantua mini
   pernah di-summon di sektor itu (recall manual 🕳️ menghapus relay). */
function sfxSector(){
  if(!activeSfx||typeof TRIGGERS==='undefined'||typeof keyFromAudio!=='function')return null;
  var key=keyFromAudio(activeSfx),tr=key&&TRIGGERS[key];if(!tr)return null;
  for(var i=0;i<SECT.list.length;i++)if(SECT.list[i].ids.indexOf(tr.cons)>=0)return SECT.list[i];
  return null;
}
function spatialTarget(){
  var cx=W*.5,cy=H*.5,maxD=Math.max(120,Math.hypot(W,H)*.48),t,p,s;
  if(SECT.on||SECT.busy){                       /* home/overview + transisi antar sektor */
    s=sfxSector();
    /* Jernih HANYA kalau dua-duanya aktif: BH overview di-summon DAN BH di sektor sumber di-summon (relay). Salah satu saja = teredam. */
    if(HBH.on&&s&&s.relay&&SECT.on&&SECT.phase!=='in')return 0;
    if(s&&s.sx!=null){t=Math.min(1,Math.hypot(s.sx-cx,s.sy-cy)/maxD);t=Math.max(0,(t-.12)/.88);}
    else t=.7;
    if(!SECT.busy)t=Math.max(.7,t);             /* diam di overview: selalu jelas teredam */
    return t;
  }
  s=sfxSector();
  if(SECT.cur&&s&&s!==SECT.cur)                 /* sumber di sektor LAIN: teredam, kecuali Gargantua mini di-summon di sektor INI (relay baru) */
    return (SUM.on&&s.relay)?0:.8;   /* relay harus berantai: sektor sumber WAJIB sudah di-relay (BH di-summon) dulu */
  if(!CAMERA_MODE)return 0;                     /* dalam sektor tanpa kamera: normal */
  p=activeStarScreenPos();
  if(!p||p[2]>=1)return .55;
  t=Math.min(1,Math.max(0,Math.hypot(p[0]-cx,p[1]-cy)/maxD));
  return Math.max(0,(t-.12)/.88);
}
function spatialHint(t){
  var st='',s=sfxSector();
  if(SECT.on&&!SECT.busy){
    var rel=!!(s&&s.relay);
    if(HBH.on&&rel)st='relay';                       /* dua sisi terhubung */
    else if(t>.5)st=HBH.on?'muffled-sec':(rel?'muffled-ov':'muffled');
  }else if(SECT.cur&&!SECT.busy&&s&&s!==SECT.cur){
    st=SUM.on?(s.relay?'relay-here':'norelay'):'far';   /* lagi di sektor lain dari sumber suara */
  }
  if(st===AV._hint)return;
  AV._hint=st;
  if(!st||typeof showModeToast!=='function')return;
  if(st==='muffled')showModeToast('SIGNAL MUFFLED \u00b7 NO RELAY\nSUMMON BH IN THE SOURCE SECTOR AND IN OVERVIEW',null,4400);
  else if(st==='muffled-ov')showModeToast('SIGNAL MUFFLED \u00b7 OVERVIEW BH RECALLED\nSUMMON THE OVERVIEW BH TO LINK THE RELAY',null,4400);
  else if(st==='muffled-sec')showModeToast('SIGNAL MUFFLED \u00b7 SOURCE SECTOR HAS NO RELAY\nENTER IT AND SUMMON BH THERE',null,4400);
  else if(st==='relay')showModeToast('RELAY LINKED \u00b7 SIGNAL CLEAR\nRECALL EITHER BH TO MUFFLE AGAIN',null,3600);
  else if(st==='far')showModeToast('SIGNAL MUFFLED \u00b7 SOURCE IN ANOTHER SECTOR\nRELAY THE SOURCE SECTOR FIRST, THEN SUMMON BH HERE',null,4600);
  else if(st==='norelay')showModeToast('RELAY NOT LINKED \u00b7 SOURCE SECTOR HAS NO RELAY\nSUMMON BH IN THE SOURCE SECTOR FIRST',null,4600);
  else showModeToast('RELAY LINKED \u00b7 SIGNAL CLEAR\nRECALL BH TO MUFFLE AGAIN',null,3600);
}
function spatialRelease(){
  AV.atten=0;AV._hint='';
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
  AV.atten+=(t-AV.atten)*.14;
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
    try{activeSfx.volume=Math.max(.06,(activeSfx._bv||.85)*(1-.88*Math.pow(AV.atten,.8)));}catch(eV){}
  }
  spatialHint(t);
  spatialDbg('MUFFLE '+(useLpf?'LPF':'VOLUME-FALLBACK')+'\npotato='+IS_POTATO+' fb='+AV.fallback+' ready='+AV.ready+' lpf='+!!AV.lpf+'\nctx='+(AV.ctx?AV.ctx.state:'none')+'\nsect.on='+SECT.on+' busy='+SECT.busy+' cam='+CAMERA_MODE+'\ntarget='+t.toFixed(2)+' atten='+AV.atten.toFixed(2));
}
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
/* Dense, audio-reactive ripple rings around Gargantua, built for phones:
   - the expensive part (reading the spectrum, walking the circle) runs ONCE
     into a small shared point profile, reused by every ring that needs it.
   - most of the "density" comes from cheap plain g.arc() rings (a single
     native path op each) whose radius/alpha simply ride the smoothed level
     and beat values already computed in updateAudioViz - no per-vertex work.
   - the shared profile itself is only recomputed every other frame (synced
     to AV.skip, the same cadence the analyser already samples at); audio
     motion is far slower than 60fps so this is invisible but roughly halves
     the per-vertex cost. */
/* ---------- radial spectrum visualizer ----------
   Lightweight circular bars inspired by the reference image.
   Performance rules:
   - one cached direction table (sin/cos only rebuilt when bar count changes)
   - one shared spectrum profile sampled every analyser tick
   - one Canvas stroke for ALL bars
   - one fixed colour: less compositing/colour work and a calmer look
   - adaptive bar count follows viewport size, with a lower cap on potato devices
*/
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
  AV_COLOR_T=Math.min(1,AV_COLOR_T+16/AV_COLOR_MS);
  var u=AV_COLOR_T, e=u*u*(3-2*u);
  AV_COLOR_RGB[0]=AV_COLOR_FROM[0]+(AV_COLOR_TO[0]-AV_COLOR_FROM[0])*e;
  AV_COLOR_RGB[1]=AV_COLOR_FROM[1]+(AV_COLOR_TO[1]-AV_COLOR_FROM[1])*e;
  AV_COLOR_RGB[2]=AV_COLOR_FROM[2]+(AV_COLOR_TO[2]-AV_COLOR_FROM[2])*e;
  AV_COLOR=''+(AV_COLOR_RGB[0]|0)+','+(AV_COLOR_RGB[1]|0)+','+(AV_COLOR_RGB[2]|0);
}

var AV_RHINT=0;
function avBarCount(){
  if(AV_DOTS&&AV_RHINT>0){
    /* Jarak antar kolom titik ~4.8px di tepi lubang hitam -> kerapatan sama di portrait, landscape, dan zoom cam. */
    var nd=Math.round(6.28318*AV_RHINT*1.06/4.8/12)*12;
    return Math.max(60,Math.min(IS_POTATO?72:132,nd));
  }
  var w=W||innerWidth||360;
  var n=Math.round(w/9);
  n=Math.max(48,Math.min(96,n));
  if(IS_POTATO)n=Math.min(n,52);
  return n;
}

function ensureAVProfile(){
  var N=avBarCount();
  if(AVP.N===N&&AVP.pts)return N;
  AVP.N=N;
  AVP.pts=new Float32Array(N*3);
  AVP.raw=new Float32Array(N);AVP.sm=new Float32Array(N);
  for(var j=0;j<N;j++){
    var ang=(j/N)*6.28318530718-Math.PI*.5;
    AVP.pts[j*3]=Math.cos(ang);
    AVP.pts[j*3+1]=Math.sin(ang);
  }
  /* Fake bars: one extra bar interleaved between every pair of real bars
     (same count as the real ones, so the ring is twice as dense). Each
     fake bar borrows its length from the real bar right before it, so
     it never needs its own spectrum sample. */
  var FN=N*2;
  AVP.fullPts=new Float32Array(FN*2);
  for(var k=0;k<FN;k++){
    var fang=(k/FN)*6.28318530718-Math.PI*.5;
    AVP.fullPts[k*2]=Math.cos(fang);
    AVP.fullPts[k*2+1]=Math.sin(fang);
  }
  AVP.fullN=FN;
  AVP.stamp=-1;
  return N;
}

function buildAVProfile(){
  var N=ensureAVProfile(),pts=AVP.pts;
  var data=AV.data,n=data?data.length:0;
  var b=AV.bass,m=AV.mid,h=AV.high;
  var lim=Math.min(120,n-1);
  if(AV_DOTS){
    if(!AVP.bmax)AVP.bmax=new Float32Array(130).fill(.3);
    var nowT=performance.now(),dtp=Math.min(.1,(nowT-(AVP.t||nowT))/1000);AVP.t=nowT;
    AVP.rot=((AVP.rot||0)+dtp*.022+AV.beat*dtp*.10)%1;
    var lim2=Math.min(96,n-1),bm=AVP.bmax,bi2;
    if(n&&lim2>1){
      /* Whitening: tiap bin dinormalisasi ke puncaknya sendiri (turun pelan), jadi treble
         juga bisa menjulang, bukan cuma bass di bawah. */
      for(bi2=1;bi2<=lim2;bi2++){
        var vv=data[bi2]/255,mm=bm[bi2]*.996;
        if(vv>mm)mm=vv;if(mm<.22)mm=.22;bm[bi2]=mm;
      }
    }
    for(var jd=0;jd<N;jd++){
      var ud=(jd/N+AVP.rot)%1,qd=Math.abs(ud-.5)*2,fvd;
      if(n&&lim2>1){
        var bd=1+((Math.pow(qd,1.2)*(lim2-1))|0);
        var vd=data[bd]/255;
        fvd=vd/bm[bd]*.8+vd*.3;
      }else fvd=.45*b+.35*m+.20*h;
      AVP.raw[jd]=Math.max(.025,Math.min(1,fvd));
    }
  }
  for(var j=0;AV_DOTS?false:j<N;j++){
    /* Mirror the spectrum around the circle. Low frequencies sit near the
       vertical axis and highs spread toward the sides, like a classic radial
       spectrum while remaining cheap to sample. */
    var u=j/(N-1),q=Math.abs(u-.5)*2;
    var bi=1+Math.min(Math.max(1,lim),((q*q*Math.max(1,lim-1))|0));
    var fv;
    if(n&&lim>1)fv=data[bi]/255;
    else fv=.45*b+.35*m+.20*h;

    /* A tiny floor keeps quiet music visible without creating fake spikes. */
    fv=Math.max(.025,Math.min(1,fv));
    AVP.raw[j]=fv;
  }
  /* Calm the ring: 3-tap spatial blend (neighbouring FFT bins are noisy) then fast-attack /
     slow-release per bar, so spikes ride the music instead of jittering all over the circle. */
  var raw=AVP.raw,sm=AVP.sm;
  for(var j2=0;j2<N;j2++){
    var a0=raw[(j2+N-1)%N],a1=raw[j2],a2=raw[(j2+1)%N];
    var tgt=AV_DOTS?(a0*.12+a1*.76+a2*.12):(a0*.25+a1*.5+a2*.25);
    sm[j2]+=(tgt-sm[j2])*(tgt>sm[j2]?.6:.22);
    pts[j2*3+2]=sm[j2];
  }
  AVP.stamp=AV.skip;
}

/* Bentuk visualizer: titik-titik radial (dotted) dengan bagian dalam lebih transparan.
   Set localStorage.dumul_av_shape='bars' buat balik ke bar garis lama. */
var AV_DOTS=(function(){var o=null;try{o=localStorage.getItem('dumul_av_shape');}catch(e){}return o!=='bars';})();
/* Toggle spectrum Gargantua (panel music). Disimpan di localStorage.dumul_av_on ('0' = mati). */
var AV_ON=(function(){var o=null;try{o=localStorage.getItem('dumul_av_on');}catch(e){}return o!=='0';})();
function drawAudioVisualizer(now,R){
  if(!AV_ON)return;
  if(!AV_DOTS)return drawAudioVisualizerBars(now,R);
  updateAVColor(now);
  if(reduce||!activeSfx||activeSfx.paused||activeSfx.ended)return;
  try{
    if(!R||R<1)return;
    AV_RHINT=R;
    if(AVP.stamp!==AV.skip||!AVP.pts||AV.fallback||AVP.N!==avBarCount())buildAVProfile();
    var pts=AVP.pts,N=AVP.N;
    var lv=AV.level,beat=AV.beat;
    var inner=R*1.06;
    var ampBase=R*(.035+.04*lv)*.5;
    var ampSpec=R*(.34+.46*lv+.30*beat)*.5;
    var lw=Math.max(IS_POTATO?1.3:1.5,Math.min(2.6,R*.011));
    var gap=lw*2.5;
    var boost=Math.min(1,.78+.18*lv+.22*beat);
    /* 3 lapis per bar: dalam (transparan), tengah, ujung (terang & lebih tipis).
       Masing-masing satu path = satu stroke. */
    var pA=new Path2D(),pB=new Path2D(),pC=new Path2D();
    for(var j=0;j<N;j++){
      var fv=pts[j*3+2];
      fv=Math.min(1.3,Math.pow(fv,1.6)*1.15*(1+.45*beat));   /* kontras tinggi: puncak jadi duri, beat cuma nambah tinggi duri */
      var rr=inner+ampBase+fv*ampSpec;
      if(fv>.7)rr+=(fv-.7)*ampSpec*1.3;          /* duri tipis di puncak */
      var cx=pts[j*3],cy=pts[j*3+1];
      var len=rr-inner;
      if(len<lw)continue;
      var s1=inner+len*.34,s2=inner+len*.68;
      pA.moveTo(cx*inner,cy*inner);pA.lineTo(cx*s1,cy*s1);
      pB.moveTo(cx*s1,cy*s1);pB.lineTo(cx*s2,cy*s2);
      pC.moveTo(cx*s2,cy*s2);pC.lineTo(cx*rr,cy*rr);
    }
    g.save();
    g.globalCompositeOperation='lighter';
    g.lineCap=IS_POTATO?'butt':'round';
    if(!IS_POTATO)g.setLineDash([.01,gap]);else g.setLineDash([lw*1.2,gap*.8]);
    g.lineWidth=lw;
    g.strokeStyle='rgba('+AV_COLOR+','+(.26*boost)+')';g.stroke(pA);
    g.strokeStyle='rgba('+AV_COLOR+','+(.62*boost)+')';g.stroke(pB);
    g.lineWidth=lw*.85;
    g.strokeStyle='rgba('+AV_COLOR+','+Math.min(.95,.98*boost)+')';g.stroke(pC);
    g.restore();
  }catch(err){}
}
function drawAudioVisualizerBars(now,R){
  updateAVColor(now);
  if(reduce||!activeSfx||activeSfx.paused||activeSfx.ended)return;
  try{
    if(!R||R<1)return;
    if(AVP.stamp!==AV.skip||!AVP.pts||AV.fallback)buildAVProfile();

    var pts=AVP.pts,fullPts=AVP.fullPts,FN=AVP.fullN;
    var lv=AV.level,beat=AV.beat;
    var inner=R*1.045;

    /* Longer bars are deliberate: the old profile topped out too close to
       the Gargantua edge, so the spectrum became hard to read from a distance.
       Keep the renderer cheap, but give normal energy and especially transients
       substantially more radial travel.
       Trimmed to 50% of that length, then the ring is filled back out with
       fake bars (same count as the real ones) interleaved between them; each
       fake bar reuses its preceding real bar's length so it reads as one
       continuous, denser ring instead of a sparser one. */
    var ampBase=R*(.075+.13*lv+.22*beat)*.5;
    var ampSpec=R*(.22+.34*lv+.42*beat)*.5;

    /* One path = one Canvas stroke.  A single colour keeps compositing cheap. */
    g.save();
    g.globalCompositeOperation='lighter';
    g.strokeStyle='rgba('+AV_COLOR+','+Math.min(.92,.56+.25*lv+.28*beat)+')';
    g.lineWidth=Math.max(IS_POTATO?1.25:1.45,Math.min(2.8,R*.012));
    g.lineCap='round';
    g.beginPath();

    for(var k=0;k<FN;k++){
      var ri=k>>1;
      var fv;
      if(k&1){
        /* Fake bar sits between real bar ri and the next one: take whichever
           side is taller so a spike on either neighbour carries through. */
        var riNext=(ri+1)%AVP.N;
        var fvA=pts[ri*3+2],fvB=pts[riNext*3+2];
        fv=fvA>fvB?fvA:fvB;
      }else{
        fv=pts[ri*3+2];
      }
      /* Gamma lift makes quieter FFT bins visible without multiplying the
         number of bars or doing another analyser pass. */
      fv=Math.min(1.12,Math.pow(fv,.72)*1.08);
      var rr=inner+ampBase+fv*ampSpec;
      /* Beat transient is intentionally large and remains visible even when
         the instantaneous FFT frame is a little soft. */
      if(beat>.12)rr+=R*(.055+.12*beat)*.5;
      var cx=fullPts[k*2],cy=fullPts[k*2+1];
      var x=cx*inner;
      var y=cy*inner;
      var x2=cx*rr;
      var y2=cy*rr;
      g.moveTo(x,y);g.lineTo(x2,y2);
    }
    g.stroke();
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
function playSfx(a){
  /* Star SFX no longer warms, loads, or auto-resumes constellation music. */
  if(!a)return;
  /* Gembok: semua jalur (canvas, tombol #xxx-fx, panel musik) berakhir di sini. */
  var lk=keyFromAudio(a);if(lk&&!isUnlocked(lk))return;
  if(typeof RADIO_SILENCE!=='undefined'&&RADIO_SILENCE)return;
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
      requestAnimationFrame(function(){if(activeSfx===a)audioVizInit(a);});
    }else{
      safePause(a);
      audioVizOff();
    }
    return;
  }
  pauseMusicForSfx();
  if(activeSfx&&activeSfx!==a){
    activeSfx.onended=null;
    safeReset(activeSfx);
    try{activeSfx.volume=activeSfx._bv||.85;}catch(eOv){}
  }
  activeSfx=a;
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
  requestAnimationFrame(function(){if(activeSfx===a)audioVizInit(a);});
}

var BH={x:0,y:0,hx:0,hy:0,R:26,Rr:0,h:0,sprite:null,S:0,ang:-.48};
function clamp(v){return v<0?0:v>1?1:v;}
function rgb(hex){var n=parseInt(hex.slice(1),16);return((n>>16)&255)+','+((n>>8)&255)+','+(n&255);}


/* dipindah dari bagian bawah: dipanggil saat load (CONS.forEach di sky-logic), jadi harus sudah ada sebelum file 02 jalan */
function cons(id){for(var i=0;i<CONS.length;i++)if(CONS[i].id===id)return CONS[i];}
