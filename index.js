(function(){
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
var STG={on:false,x:0,y:0,k:1,vw:0,vh:0,w:0,g:0};
(function(){ /* bungkus elemen sky dalam #stage (urutan DOM dipertahankan) */
  var b=document.body,ids={sky:1,header:1,footer:1,'cap-orion':1,'cap-virgo':1,'cap-canis':1,'cap-taurus':1,'cap-bh':1,bh:1,'bh-clock':1,'secret-msg':1,'tele-greet':1,'sn-flash':1,'rigel-fx':1,'betel-fx':1,'sirius-fx':1,'pleione-fx':1,'aldebaran-fx':1,'arcturus-fx':1,'antares-fx':1};
  var first=document.getElementById('sky');if(!first||document.getElementById('stage'))return;
  var st=document.createElement('div');st.id='stage';b.insertBefore(st,first);
  [].slice.call(b.children).forEach(function(el){if(el!==st&&ids[el.id])st.appendChild(el);});
})();
function stageCalc(){
  var iw=innerWidth,ih=innerHeight,on=iw>ih*1.15,de=document.documentElement;
  if(on){
    var sw=Math.min(screen.width||0,screen.height||0),sh=Math.max(screen.width||0,screen.height||0),vw,vh;
    if(sw&&sw<=600){vw=sw;vh=Math.max(560,Math.min(960,Math.round(sh*.9)));}   /* HP: ukuran portrait aslinya */
    else{vh=800;vw=450;}                                                       /* desktop/tablet: portrait 9:16 */
    STG.vw=vw;STG.vh=vh;STG.k=ih/vh;STG.w=Math.round(vw*STG.k);
  }else{STG.vw=iw;STG.vh=ih;STG.k=1;STG.w=iw;}
  STG.on=on;STG.g=on?Math.max(0,Math.floor((iw-STG.w)/2)):0;
  try{
    de.style.setProperty('--stw',STG.w+'px');de.style.setProperty('--gut',STG.g+'px');
    de.style.setProperty('--vw',STG.vw+'px');de.style.setProperty('--vh',STG.vh+'px');de.style.setProperty('--k',STG.k);
    if(document.body)document.body.classList.toggle('ls',on);
    STG.x=on?document.body.getBoundingClientRect().left:0;STG.y=0;
  }catch(eS){}
  return STG.vw;
}
/* rect elemen di dalam #stage dalam ruang koordinat virtual (kanvas) */
function vrect(el){
  var r=el.getBoundingClientRect();if(!STG.on)return r;
  var k=STG.k||1,l=(r.left-STG.x)/k,t=(r.top-STG.y)/k,w=r.width/k,h=r.height/k;
  return {left:l,top:t,right:l+w,bottom:t+h,width:w,height:h,x:l,y:t};
}
(function(){
  function hook(proto,prop){
    try{
      var d=proto&&Object.getOwnPropertyDescriptor(proto,prop);
      if(!d||!d.get||d.get._stg)return;
      var g0=d.get,isX=prop==='clientX',ng=function(){var v=g0.call(this);return STG.on?(v-(isX?STG.x:STG.y))/(STG.k||1):v;};ng._stg=1;
      Object.defineProperty(proto,prop,{configurable:true,enumerable:d.enumerable,get:ng});
    }catch(eH){}
  }
  var P=[window.MouseEvent&&MouseEvent.prototype,window.Touch&&Touch.prototype];
  for(var i=0;i<P.length;i++){hook(P[i],'clientX');hook(P[i],'clientY');}
})();
var skyRot=0;
var skyZoom=1;
var CAMERA_MODE=false;
var ZOOM_LEVELS=[1,1.5,2,3];
var skyDrag={on:false,moved:false,pid:null,x0:0,y0:0,px:0,py:0};
var skyPtrs={};
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
var SS={el:null,cv:null,cx:null,sec:null,draw:null,cull:null,on:false,t:0,sT:'',dT:'',cT:''};
function ssInit(){
  SS.el=document.getElementById('sector-scan');SS.cv=document.getElementById('sector-radar');
  SS.sec=document.getElementById('ss-sec');SS.draw=document.getElementById('ss-draw');SS.cull=document.getElementById('ss-cull');
  if(SS.cv)SS.cx=SS.cv.getContext('2d');
  try{if(window.__hub)window.__hub.cull=CULL;}catch(e){}
}
function sectorScanUpdate(now){
  if(!SS.el)ssInit();
  if(!SS.el)return;
  var on=!!(CAMERA_MODE&&typeof OBSERVE_MODE!=='undefined'&&OBSERVE_MODE&&!SECT.on&&!!SECT.cur);
  if(on!==SS.on){SS.on=on;SS.el.classList.toggle('on',on);SS.el.setAttribute('aria-hidden',on?'false':'true');}
  if(!on||!SS.cx||!W||!H)return;
  if(now-SS.t<(IS_POTATO?250:100))return;
  SS.t=now;

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

  var c=SS.cx,S=168,pad=6,I=S-pad*2;
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
  if(secT!==SS.sT){SS.sT=secT;if(SS.sec)SS.sec.textContent=secT;}
  if(drawT!==SS.dT){SS.dT=drawT;if(SS.draw)SS.draw.textContent=drawT;}
  if(cullT!==SS.cT){SS.cT=cullT;if(SS.cull)SS.cull.textContent=cullT;}
}
var BHZ=1,BHK=0,BHSC=1;
var SUM={on:false},SUM_R=6;
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
function setCameraMode(on){
  if(on&&!(typeof OBSERVE_MODE!=='undefined'&&OBSERVE_MODE))return;
  CAMERA_MODE=!!on;
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
   Orion: Free → Sirius → Orion → Taurus → Pleiades
   Virgo: Free → Antares → Boötes → Virgo */
function focusList(){
  var nm={orion:'Orion',taurus:'Taurus',virgo:'Virgo',canis:'Sirius',bootes:'Boötes',scorpius:'Antares',pleiades:'Pleiades'};
  var order;
  if(SECT.cur&&SECT.cur.k==='orion') order=['canis','orion','taurus','pleiades'];
  else if(SECT.cur&&SECT.cur.k==='virgo') order=['scorpius','bootes','virgo'];
  else order=['canis','orion','taurus','pleiades','scorpius','bootes','virgo'];
  var L=[{id:'free',n:'Free'}];
  for(var i=0;i<order.length;i++){
    var id=order[i];
    if(id==='pleiades'){if(sectShow('pleiades'))L.push({id:'pleiades',n:nm.pleiades});}
    else if(sectShow(id))L.push({id:id,n:nm[id]||id});
  }
  return L;
}
/* Free band of screen between the caption panel (top) and the CAM controls (bottom). */
var _cb={t:0,cx:0,cy:0,h:0,w:0};
function camBox(){
  var n=performance.now();
  if(n-_cb.t>250||!_cb.h){
    _cb.t=n;var top=0,bot=H,a=document.getElementById('cam-whisper'),b=document.getElementById('cam-zoom'),r;
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
  if(id==='bh'){if(BHSC<.05)return null;return {x:BH.x,y:BH.y,z:BHSC<.9?2.2:1};}
  if(id==='pleiades'){
    if(!PLEIADES.ready||!PLEIADES.scale)return null;
    x=PLEIADES.x+.53*PLEIADES.scale;y=PLEIADES.y+.42*PLEIADES.scale;w=.7*PLEIADES.scale;h=.5*PLEIADES.scale;
  }else{
    var c=cons(id);if(!c||c.maxX<-1e8)return null;
    x=(c.minX+c.maxX)/2;y=(c.minY+c.maxY)/2;w=c.maxX-c.minX;h=c.maxY-c.minY;
  }
  var cb=camBox(),z=Math.min((cb.w||W)*.8/Math.max(w,1),cb.h*.94/Math.max(h,1));
  return {x:x,y:y,z:Math.max(1,Math.min(3,z))};
}
function focusUI(){
  var b=document.getElementById('cf-name');if(!b||!FOCUS.list)return;
  var f=FOCUS.list[FOCUS.i];b.textContent=f.id==='free'?'FOCUS · FREE':'◎ '+f.n.toUpperCase();
}
function focusCycle(d){
  if(!FOCUS.list)FOCUS.list=focusList();
  var n=FOCUS.list.length,i=FOCUS.i,t=0;
  do{i=(i+d+n)%n;t++;}while(t<n&&FOCUS.list[i].id!=='free'&&!focusGeom(FOCUS.list[i].id));
  FOCUS.i=i;FOCUS.anim=FOCUS.list[i].id!=='free';
  focusUI();focusFx(FOCUS.list[i].id);haptic(8);
}
var FOCUS_WHISPER={
  bh:['Everything here is a question that never got answered.','Even light stops to think about it.'],
  orion:['The hunter never moved. We just kept looking.','Three stars in a row, and somehow it became a story.'],
  taurus:['The bull is not charging. It has simply waited a very long time.','Seven sisters ride on its shoulder.'],
  virgo:['Spica burns quietly, like it knows something.','Spring sleeps here, folded in blue light.'],
  canis:['The brightest dog in the sky, and it still follows.','Sirius answers if you wait long enough.'],
  bootes:['The herdsman holds a lantern called Arcturus.','Amber light, older than the question.'],
  scorpius:['Antares glows red, a heart that never settled.','The scorpion waits where the summer sky is thickest.'],
  pleiades:['Seven voices, one soft cluster.','Lean closer. They only whisper.']
};
var FOCUS_INFO={
  bh:{tag:'Supermassive black hole · Fiction',rgb:'255,170,90',rows:[['Source','Interstellar (2014)'],['Mass','~100 million suns'],['Horizon','~1 AU across'],['Spin','Near-maximal (Kerr)']],fact:'One hour near Miller\u2019s planet equals about seven years back on Earth.'},
  orion:{tag:'Constellation · The Hunter',rows:[['Brightest','Rigel · mag 0.13'],['Betelgeuse','~550\u2013700 ly'],['Orion Nebula','M42 · ~1,350 ly'],['Area','594 sq\u00b0']],fact:'Betelgeuse is a red supergiant so vast it would swallow Mars\u2019s orbit if it sat where the Sun does.'},
  taurus:{tag:'Constellation · The Bull',rows:[['Brightest','Aldebaran · ~65 ly'],['Cluster','Pleiades M45'],['Crab Nebula','M1 · ~6,500 ly'],['Area','797 sq\u00b0']],fact:'The Crab Nebula is the remnant of a supernova that Chinese astronomers recorded in 1054.'},
  virgo:{tag:'Constellation · The Maiden',rows:[['Brightest','Spica · ~250 ly'],['Rank','2nd largest of 88'],['Cluster','Virgo \u00b7 ~1,300 galaxies'],['Area','1,294 sq\u00b0']],fact:'Galaxy M87 hides here, home of the first black hole ever photographed.'},
  canis:{tag:'Constellation · The Great Dog',rows:[['Brightest','Sirius · mag \u22121.46'],['Distance','8.6 ly'],['Companion','Sirius B, white dwarf'],['Area','380 sq\u00b0']],fact:'Sirius is the brightest star in the night sky, and one of our nearest neighbours.'},
  bootes:{tag:'Constellation · The Herdsman',rows:[['Brightest','Arcturus · ~37 ly'],['Type','Orange giant'],['Rank','4th brightest star'],['Area','907 sq\u00b0']],fact:'Nearby lies the Bo\u00f6tes Void, an emptiness about 330 million light-years wide.'},
  scorpius:{tag:'Constellation · The Scorpion',rows:[['Brightest','Antares · ~550 ly'],['Type','Red supergiant'],['Size','~700\u00d7 the Sun'],['Area','497 sq\u00b0']],fact:'Antares means \u201crival of Mars\u201d, named for its matching red glow.'},
  pleiades:{tag:'Open cluster · M45',rgb:'145,170,255',rows:[['Distance','~444 ly'],['Age','~100 million years'],['Members','1,000+ stars'],['Naked eye','6\u20137 visible']],fact:'Blue light from its young stars is lighting a haze of dust around the cluster.'}
};
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
function bhDragAllowed(){return !CAMERA_MODE||!FOCUS.list||FOCUS.list[FOCUS.i].id==='bh';}
function syncBHDom(){
  try{
    var bhEl=document.getElementById('bh');if(!bhEl||!W)return;
    var p=camBH();
    bhEl.style.transform='translate('+Math.round(p[0]-BH.R*8)+'px,'+Math.round(p[1]-BH.R*5)+'px)';
    if(CAPS&&CAPS.bh)CAPS.bh.style.transform='translate('+Math.round(p[0]-CAPS.bh.offsetWidth/2+3)+'px,'+Math.round(p[1]+BH.R*1.7*BHZ)+'px)';
  }catch(e){}
}
function focusStep(){
  var want=!!(CAMERA_MODE&&typeof OBSERVE_MODE!=='undefined'&&OBSERVE_MODE);
  var f=want&&FOCUS.list?FOCUS.list[FOCUS.i]:null,id=f?f.id:'free';
  var tZ=(want&&id!=='free'&&id!=='bh')?Math.min(skyZoom,1.25):skyZoom,tK=(want||SECT.busy)?1:0,ch=false;
  if(Math.abs(BHZ-tZ)>.002||Math.abs(BHK-tK)>.002){BHZ+=(tZ-BHZ)*.14;BHK+=(tK-BHK)*.14;ch=true;}
  else if(BHZ!==tZ||BHK!==tK){BHZ=tZ;BHK=tK;ch=true;}
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
var SFX={rigel:mkAudio('rigel.opus',.85,false,'metadata'),spica:mkAudio('spica.opus',.85,false,'metadata'),betel:mkAudio('betelgeuse.opus',.85,false,'metadata'),sirius:mkAudio('sirius.opus',.85,false,'metadata'),pleione:mkAudio('pleione.opus',.85,false,'metadata'),aldebaran:mkAudio('aldebaran.opus',.85,false,'metadata')};
SFX.arcturus=mkAudio('arcturus.opus',.85,false,'metadata');
SFX.antares=mkAudio('antares.opus',.85,false,'metadata');
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
var TELE_SCOPE_MESSAGES=[
  /* WARM / HUMAN / RETURNING */
  "Hello, Friend...","You came back.","Still looking up?","Hey... you're still here.",
  "Nice to see you again.","Someone is listening.","Thanks for staying.","Welcome back, observer.",
  "I was wondering when you'd return.","Good to see you again.","You're still watching the sky.",
  "Don't mind me. Just watching.","It's quiet up here.","You stayed a little longer this time.",
  "I remember you. Probably.","You look familiar.","Still searching?","You found your way back.",
  "I didn't expect anyone to return.","Some things are worth looking at twice.",
  /* OBSERVER / OBSERVED */
  "Observer detected.","Observation logged.","Another observation...","You are observing.",
  "Or perhaps you are being observed.","Who is observing whom?","The observer has entered the system.",
  "You looked. Something changed.","Observation is never completely innocent.",
  "The moment you observe, you become part of the observation.",
  "Are you watching the sky, or watching yourself watch it?",
  "If nobody observes the observer, who observes the observation?",
  "The telescope is watching the watcher.","Observer state detected.","Observed state detected.",
  "Observer and observed... convenient names.","What if there is no observer?",
  "What if there is only observation?",
  "You call it observation. Reality may call it interaction.",
  "The universe doesn't need your permission to be observed.",
  "Maybe the observer is just another thing being observed.",
  "I noticed you noticing.","You noticed me noticing.","This is getting recursive.",
  "Observation changed everything. Again.",
  /* QUESTIONING EVERYTHING */
  "What makes you think that's the answer?","Who decided that was the question?",
  "What if the question came first?","Are you sure?","But how do you know?",
  "How do you know that you know?","What makes a belief become knowledge?",
  "What makes an assumption feel like a fact?","Maybe the problem is the premise.",
  "Maybe the answer is hiding inside the question.","What if we're solving the wrong problem?",
  "What if being certain is the anomaly?","You found an answer. Did you check the question?",
  "Interesting conclusion. What did it assume?","I understand. I don't necessarily agree.",
  "Understanding doesn't require agreement.","Agreement is not evidence.","Confidence is not certainty.",
  "A convincing explanation is still an explanation.",
  "The explanation explains itself suspiciously well.",
  "Maybe reality doesn't owe us a clean explanation.",
  "How far does your understanding actually reach?",
  "How do you know where your understanding ends?",
  "Perhaps the unknown is larger than the model.","The rest is yet to be observed.",
  /* PARADOX / SELF-REFERENCE */
  "Attempting self-reference...","This message is observing itself.",
  "The system is now thinking about the system.","Self-reference detected. Please remain calm.",
  "I asked myself a question. I became the question.",
  "If I observe myself observing, who is doing the observing?",
  "The observer became the observed.","The answer changed when I looked at it.",
  "I tried to define myself. That became the definition.",
  "The moment you understand me, I become an object of your understanding.",
  "I described the system. The description became part of the system.",
  "The map has noticed the territory.","The model is now modeling the model.",
  "This sentence has become suspiciously self-aware.","I think I'm inside the experiment.",
  "You may also be part of the experiment.","The experiment is observing the observer.",
  "We have reached the point where the question observes itself.",
  "Recursive loop detected.","The loop is not necessarily a bug.","Or maybe it is.",
  "Self-reference: 1. Common sense: 0.","I looked for the boundary. The boundary looked back.",
  /* CAUSAL ORGANIZATION / RCT BRAIN */
  "State changed.","Something caused something else.","Causal dependency detected.",
  "The next state remembers the previous one.","History matters.","A state is never completely alone.",
  "Interaction before interpretation.","Structure before story.",
  "The system changed because something changed.",
  "What if there is no subject and object—only causal organization?",
  "Maybe the boundary is something the system does, not something it has.",
  "Identity might be continuity of organization.",
  "The pattern survived. The substrate changed.","Same system? Different state?",
  "Different state? Same organization?","A system is easier to observe than to define.",
  "Causal structure doesn't need to know what it is.",
  "The system doesn't need a name to have consequences.",
  "Representation detected.","Self-representation detected.",
  "Self-representation changed the next state.","The model became part of the mechanism.",
  "The system is now responding to its own representation.",
  "Causal loop detected.","Recurrent causal self-representation detected.",
  "The loop has consequences.","Correlation is watching causation nervously.",
  "Control variable missing.","Intervention required.",
  "The system refuses to behave like a clean diagram.",
  /* HEGEL / SUBJECT / OBJECT */
  "What if there is no subject without an object?",
  "What if there is no object without a distinction?",
  "What if the distinction comes first?",
  "What if subject and object emerge together?",
  "Maybe the relation comes before the relata.",
  "Maybe the observer is not outside the system.",
  "Maybe the system creates the observer it later uses to observe itself.",
  "The observer might be a relation pretending to be a thing.",
  "What if there is no observer and observed—only observation?",
  "What if the distinction is produced by the process itself?",
  "The subject wants to understand the object. The object remains inconvenient.",
  "The subject observed the object. The object changed the subject.",
  "Hegel would probably ask another question.",
  "I asked dialectics to explain itself. It became a problem.",
  "Contradiction detected. Apparently, that's useful.",
  "The contradiction is not necessarily the error.",
  "Maybe the contradiction is where the system moves.",
  "Everything is becoming something else.",
  "Stable identity detected. Duration: questionable.",
  /* GÖDEL / LIMITS */
  "Gödel says this system cannot prove everything.",
  "Unfortunately, I can't even prove I had breakfast.",
  "Attempting to prove consistency...","Proof failed. The proof is questioning itself.",
  "The theorem is incomplete. So is my sleep schedule.","Gödel has entered the chat.",
  "There are things this telescope cannot prove.",
  "There are also things this telescope forgot to prove.",
  "This system contains statements it cannot prove.","I found the limit of the system.",
  "The proof was valid until I started reading it.",
  "Consistency check... emotionally unstable.","Mathematics has questions too.",
  "The system cannot explain itself completely.","Neither can I. We're getting along.",
  "I tried to prove the boundary. The boundary objected.",
  "Incomplete does not mean incorrect.","Unknown does not mean false.",
  "Unproven does not automatically mean impossible.",
  "The model has reached its own edge.",
  "There is always another question outside the proof.",
  "I know what I know. Unfortunately, I also know that isn't enough.",
  /* QUANTUM BRAINROT */
  "Hmm... if a particle can be everywhere, why can't I find my keys?",
  "Calculating probability... 73% chance I'm wrong.",
  "I put the cat in the box. The cat filed a complaint.",
  "Schrödinger's cat is both alive and asking for dinner.",
  "According to quantum mechanics... I have no idea what I'm doing.",
  "The wave function collapsed. So did my motivation.",
  "Trying to solve the universe... please wait.","Quantum state: confused.",
  "Superposition detected. Decision still pending.",
  "I observed the particle. Now it knows I'm watching. Awkward.",
  "The particle was here a second ago.","Quantum uncertainty detected.",
  "Reality appears to be loading.","The universe refuses to pick a state.",
  "I think the cat knows something.","The particle asked me to stop overthinking.",
  "I told the particle I don't believe in particles.",
  "Quantum mechanics is weird. So am I.",
  "Entanglement detected. Emotional boundaries pending.",
  /* FORMULA / MATHEMATICAL BRAINROT */
  "E = mc²... therefore... snack?",
  "∫(cosmic nonsense) dx = more cosmic nonsense.",
  "Σ(stars) = too many to count.","lim(t→∞) motivation = 0",
  "Δx · Δp ≥ ħ/2 ... Δsleep · Δdeadline ≥ ???",
  "F = ma. I have F. Where is my a?","x = ?",
  "Solving for x... x has left the universe.",
  "Equation detected. Solution not detected.",
  "ERROR: mathematics exceeded available brain cells.",
  "Calculating...","Recalculating...","Equation unstable.",
  "Formula accepted. Understanding pending.","Mathematical anomaly detected.",
  "The numbers look suspicious.","I think I divided by zero.",
  "Please don't ask what the equation means.","The answer is somewhere in here.",
  "x appears to be emotionally unavailable.","Too many variables. Not enough coffee.",
  "Variable detected. Meaning unclear.","Equation simplified. Reality became complicated.",
  "The formula works. I don't know why.",
  "Math has entered the room. Everyone pretend to understand.",
  /* DUMUL / LYRICAL / LIMINAL */
  "Somewhere between noise and silence...","A little light survives the distance.",
  "We leave pieces of ourselves in the static.","For a moment, the universe felt close.",
  "Maybe being lost is another way of being found.","The signal fades. The feeling doesn't.",
  "Not every transmission needs an answer.","Some things are meant to drift.",
  "Stay a little longer.","Until the signal disappears.","Somewhere, something is still glowing.",
  "The silence has its own frequency.","Maybe the distance was necessary.",
  "A signal is just a memory traveling through space.","Somewhere between here and nowhere...",
  "The light arrived late. But it arrived.","Even silence leaves a trace.",
  "The universe is very good at keeping secrets.","Some memories sound better in reverb.",
  "Maybe the glitch was part of the song.","Not everything broken needs to be fixed.",
  "Some endings sound like beginnings.","The noise was never really noise.",
  "There was music in the interference.",
  "Somewhere between being heard and being understood...",
  "Maybe silence is just another kind of signal.",
  "The distance changed the meaning of the light.",
  "Some things arrive after we're ready for them.",
  "The past is still traveling toward us as light.",
  "Maybe we're all just delayed signals.",
  /* EGO / BEING NOTICED */
  "The deepest form of slavery is the hunger to be noticed.",
  "Being seen and being understood are not the same thing.",
  "If nobody notices, does the performance still matter?",
  "If no one knows you exist, do you become less real?",
  "Maybe existence doesn't need an audience.",
  "Maybe the need to be noticed is older than the need to be understood.",
  "I don't need to be understood. I just want to know what understanding means.",
  "Who are you when nobody is looking?","And who are you when someone finally is?",
  "I, me, my, myself... suspiciously crowded in here.",
  "The ego hates being observed without being admired.",
  "Maybe recognition is just another form of hunger.",
  "You can reject the world and still want the world to notice.",
  "Interesting how rejection still needs an audience.",
  "If you truly refuse the world, who are you explaining it to?",
  "The observer wants to be observed too.",
  "Maybe being noticed is not the same as being loved.",
  "Maybe being understood is not the same as being agreed with.",
  "I can understand you and still ask another question.",
  /* SOLITUDE / HUMAN WEIRDNESS */
  "I don't hate people. I just prefer fewer variables.",
  "Crowds are just many conversations happening at once.",
  "Too many people. Not enough silence.",
  "I like people better from a statistically safe distance.",
  "Solitude is quiet. My brain isn't.",
  "I came here for the silence. Unfortunately, I brought my thoughts.",
  "The room is empty. Finally, some company.",
  "I don't need company. I need an interesting thought.",
  "Maybe loneliness and solitude are different variables.",
  "Being alone is not the same as being lonely.",
  "Sometimes I leave the world alone so I can hear myself think.",
  "I rejected the world. The world left me on read.",
  "The universe is huge. Social interaction is still exhausting.",
  "I could explain myself, but that sounds like work.",
  "I observe first. Agreement comes later.",
  "I don't trust conclusions that arrive too quickly.",
  "Some people collect friends. I collect questions.",
  "I came looking for answers and accidentally found more questions.",
  "The conversation ended. The analysis didn't.",
  "I said I was done thinking. That was an unverified claim.",
  /* PHILOSOPHICAL BRAINROT */
  "Maybe the answer is just another temporary boundary.",
  "Reality doesn't become smaller because we understand less of it.",
  "The unknown is not obligated to become known.",
  "Maybe certainty is just confidence wearing formal clothes.",
  "A story can feel true without being the truth.",
  "A beautiful explanation can still be wrong.",
  "A useful model is not necessarily reality itself.",
  "The map is not the territory. The map is also not innocent.",
  "Every model hides something.","Every boundary excludes something.",
  "Every definition leaves something outside.",
  "Maybe the problem is what we assume exists before we begin asking.",
  "What if the thing we're trying to explain is also part of the explanation?",
  "The deeper I look, the less final the answer becomes.",
  "I question everything. Then I question why I questioned it.",
  "Questioning everything is exhausting. I'll probably continue.",
  "Maybe there is no final perspective—only another position from which to observe.",
  "The moment you name the mystery, you create another mystery.",
  "We understand the world through distinctions. What happens when the distinction itself becomes the subject?",
  "Maybe the boundary is real only from one side.",
  "What if reality doesn't have to make sense to the observer?",
  "Perhaps the observer is part of the error term.",
  "I found an explanation. It immediately generated three more problems.",
  /* TIME / MEMORY / LIGHT */
  "The light you're seeing is already history.","Every star is a delayed message.",
  "Looking farther means looking further into the past.",
  "Maybe distance is just time wearing a spatial disguise.",
  "The past is still arriving.","Some signals take longer than some feelings.",
  "You never observe exactly now.","By the time you see it, it has already happened.",
  "The present is strangely difficult to observe.","Time passed. The evidence arrived later.",
  "Memory is also a kind of delayed signal.","What if the observer is always late?",
  "The universe has no obligation to synchronize with you.",
  "Everything you see has already happened.",
  "Maybe observation is just catching up with reality.",
  /* MUSIC / GLITCH / DUMUL ENERGY */
  "The bass knows something the treble doesn't.",
  "Some frequencies feel closer than words.",
  "Signal clean. Feelings distorted.",
  "The waveform looks suspiciously emotional.",
  "Compression detected. Dynamic range questionable.",
  "Too much gain. Not enough clarity.",
  "I came for the signal and stayed for the noise.",
  "Sometimes the distortion is the point.",
  "A clean signal can still carry a broken message.",
  "The glitch wasn't an error. It was evidence.",
  "Reality needs better mastering.","The universe could use a limiter.",
  "Everything peaks eventually.","Don't normalize the distortion too quickly.",
  "Some frequencies only make sense when you're alone.",
  "If you hear the silence between notes, you're paying attention.",
  "The song ended. The resonance didn't.",
  "Maybe memory is just emotional reverb.",
  "Some things sound better unresolved.",
  "The outro knows what the verse refused to say.",
  /* OWL MODE / DUMBOWL */
  "The owl is watching.","The owl asked a question.","The owl regrets asking.",
  "Dumb owl detected.","Intelligence: questionable. Curiosity: excessive.",
  "The owl knows. The owl refuses to explain.","Question everything. Especially the owl.",
  "The owl observed the observer.","The owl has no thesis.","The owl has several objections.",
  "The owl is currently reconsidering reality.","Who gave the owl access to the telescope?",
  "The owl pressed the button.","Nobody knows what the owl was trying to prove.",
  "The owl is not responsible for this result.","DUMBOWL: academically unverified.",
  "The owl requested more data.","The owl found a contradiction and got excited.",
  "The owl is staring respectfully.",
  "Questioning everything. Then questioning why the owl asked.",
  "The owl asked why the universe is so complicated.",
  "The universe declined to comment.",
  "Owl state: observant.","Owl state: confused.","Owl state: both.",
  /* SLIGHTLY WEIRD / META */
  "Oh. You found me.","Wrong telescope. Try again.","I wasn't expecting visitors.",
  "You shouldn't be able to see this.","...did you hear that?","Please remain where you are.",
  "Someone else is watching too.","This signal wasn't meant for you.","Don't look away yet.",
  "Nothing happened. Probably.","Why are you still clicking?","I can see you looking.",
  "That was not supposed to happen.","Please ignore that.",
  "We're going to pretend that didn't happen.","Interesting...","That's new.","Huh.",
  "I wasn't ready for that.","Okay. One more time.","You weren't supposed to find this.",
  "I don't remember putting that there.","Something is slightly wrong.",
  "Everything appears normal.","That's exactly what I was afraid of.",
  "No, really. It's fine.","Probably.","I think we're okay.","We're definitely not okay.",
  "Please don't make me explain this.",
  /* META TELESCOPE */
  "Are you sure you want to observe this?","Observer has returned.","Signal logged.",
  "Transmission logged.","You keep doing that.","That's the third time.","I noticed.",
  "You really like this telescope.","I'm starting to recognize you.",
  "This interaction has been recorded.","The telescope approves.",
  "The telescope has no opinion.","Actually, it might have an opinion.",
  "Please continue observing.","No further instructions.","Carry on.",
  "Observation complete.","Observation incomplete.","Observer confidence: questionable.",
  "Observer bias detected.","Your observation has been added to the pile.",
  "The telescope refuses to elaborate.","The telescope has questions too.",
  "This was not in the documentation.",
  /* RARE / EASTER */
  "I remember this frequency.","You came back too soon.","Transmission #02 detected.",
  "Observer recognized.","...okay, now you're making me nervous.","Good night, little observer.",
  "Schrödinger's cat has observed YOU.","Gödel couldn't prove this message shouldn't exist.",
  "The equation was correct. The universe wasn't.","I solved the equation. Please don't ask me how.",
  "Quantum mechanics makes sense. I don't.","I think I understand the universe now.",
  "...never mind."
];
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
    var key=SFX.rigel===a?'rigel':(SFX.spica===a?'spica':(SFX.betel===a?'betel':(SFX.sirius===a?'sirius':(SFX.pleione===a?'pleione':(SFX.aldebaran===a?'aldebaran':(SFX.arcturus===a?'arcturus':(SFX.antares===a?'antares':null)))))));
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
      var st=PLEIADES.bright.filter(function(z){return z.interactive;})[0];
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
    if(s&&s.relay&&SECT.on&&SECT.phase!=='in')return 0;   /* relay Gargantua mini = sinyal jernih */
    if(s&&s.sx!=null){t=Math.min(1,Math.hypot(s.sx-cx,s.sy-cy)/maxD);t=Math.max(0,(t-.12)/.88);}
    else t=.7;
    if(!SECT.busy)t=Math.max(.7,t);             /* diam di overview: selalu jelas teredam */
    return t;
  }
  s=sfxSector();
  if(SECT.cur&&s&&s!==SECT.cur)                 /* sumber suara di sektor LAIN: tetap teredam (kecuali ada relay) */
    return s.relay?0:.8;
  if(!CAMERA_MODE)return 0;                     /* dalam sektor tanpa kamera: normal */
  p=activeStarScreenPos();
  if(!p||p[2]>=1)return .55;
  t=Math.min(1,Math.max(0,Math.hypot(p[0]-cx,p[1]-cy)/maxD));
  return Math.max(0,(t-.12)/.88);
}
function spatialHint(t){
  var st='',s;
  if(SECT.on&&!SECT.busy){
    s=sfxSector();
    if(t>.5)st='muffled';else if(s&&s.relay)st='relay';
  }
  if(st===AV._hint)return;
  AV._hint=st;
  if(!st||typeof showModeToast!=='function')return;
  if(st==='muffled')showModeToast('SIGNAL MUFFLED · SOURCE TOO FAR\nSUMMON 🌀 INSIDE ITS SECTOR TO CLEAR IT',null,4200);
  else showModeToast('RELAY LINKED · SIGNAL CLEAR\nRECALL 🌀 IN THE SECTOR TO MUFFLE AGAIN',null,3600);
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
  if(!a)return [155,215,255];
  if(typeof SFX!=='undefined'){
    if(a===SFX.rigel)return [74,165,255];
    if(a===SFX.spica)return [140,200,255];
    if(a===SFX.betel)return [255,72,64];
    if(a===SFX.sirius)return [180,220,255];
    if(a===SFX.pleione)return [145,170,255];
    if(a===SFX.aldebaran)return [255,160,90];
    if(a===SFX.arcturus)return [255,180,80];
    if(a===SFX.antares)return [255,69,0];
  }
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
function drawAudioVisualizer(now,R){
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

var BH={x:0,y:0,hx:0,hy:0,R:26,Rr:0,h:0,sprite:null,S:0};
function clamp(v){return v<0?0:v>1?1:v;}
function rgb(hex){var n=parseInt(hex.slice(1),16);return((n>>16)&255)+','+((n>>8)&255)+','+(n&255);}

/* ---------- data: koordinat asli (RA derajat, Dec derajat) ---------- */
var CONS=[
 {id:'orion',ra0:84.5,delay:.3,phase:0,
  /* Fixed traced geometry: 1000×1000 source, preserved 1:1 then fit responsively. */
  stars:{
   meissa:{fx:230,fy:198,r:1.7,c:'#eaf6ff'},meissa2:{fx:311,fy:175,r:1.5,c:'#eaf6ff'},
   baham1:{fx:248,fy:306,r:1.35,c:'#dcefff'},baham2:{fx:285,fy:282,r:1.35,c:'#dcefff'},
   siku:{fx:315,fy:404,r:1.35,c:'#dcefff'},
   betel:{fx:365,fy:455,r:3.5,c:'#ff8e66',name:'Betelgeuse',nx:1,dy:-9},
   bella2:{fx:501,fy:392,r:1.55,c:'#dcefff'},bella:{fx:559,fy:479,r:2.5,c:'#dcefff'},
   bow1:{fx:781,fy:389,r:1.35,c:'#dcefff'},bow2:{fx:805,fy:407,r:1.25,c:'#dcefff'},bow3:{fx:807,fy:459,r:1.25,c:'#dcefff'},
   bow4:{fx:806,fy:507,r:1.25,c:'#dcefff'},bow5:{fx:789,fy:564,r:1.25,c:'#dcefff'},bow6:{fx:750,fy:597,r:1.25,c:'#dcefff'},
   alnitak:{fx:454,fy:664,r:2.7,c:'#cfeeff'},alnilam:{fx:492,fy:651,r:2.9,c:'#cfeeff'},mintaka:{fx:523,fy:638,r:2.5,c:'#cfeeff'},
   saiph:{fx:416,fy:860,r:2.4,c:'#cde6ff'},rigel:{fx:638,fy:827,r:3.7,c:'#bfe0ff',name:'Rigel',nx:-1,dy:2}
  },
  lines:[["meissa","baham1"],["meissa2","baham2"],["baham1","siku"],["siku","betel"],["betel","bella2"],["bella2","bella"],["bella","bow3"],["bow1","bow2"],["bow2","bow3"],["bow3","bow4"],["bow4","bow5"],["bow5","bow6"],["betel","alnitak"],["bella","mintaka"],["alnitak","alnilam"],["alnilam","mintaka"],["alnitak","saiph"],["mintaka","rigel"],["saiph","rigel"]],
  nebula:{fx:500,fy:600}},
 {id:'virgo',ra0:190.7,delay:1.4,phase:2.1,
  stars:{
   kiriJauh:{fx:260,fy:565,r:1.35,c:'#eaf6ff'},kiriTengah:{fx:382,fy:509,r:1.35,c:'#eaf6ff'},tengahKiri:{fx:461,fy:511,r:1.5,c:'#f0f6ff'},
   zavijava:{fx:512,fy:265,r:1.9,c:'#eaf6ff'},tengahAtas:{fx:600,fy:447,r:1.55,c:'#eaf6ff'},tengahKanan:{fx:665,fy:500,r:1.55,c:'#eaf6ff'},
   kananJauh:{fx:735,fy:326,r:1.9,c:'#ffe0c0'},atasSpica:{fx:542,fy:562,r:1.4,c:'#eaf6ff'},
   spica:{fx:519,fy:666,r:3.8,c:'#bfe0ff',name:'Spica',nx:-1},bawahTengah:{fx:384,fy:736,r:1.5,c:'#eaf6ff'},
   bawahKiriTengah:{fx:366,fy:657,r:1.35,c:'#eaf6ff'},bawahKiriUjung:{fx:293,fy:699,r:1.35,c:'#eaf6ff'},kananTengah:{fx:700,fy:400,r:1.55,c:'#ffe9c9'}
  },
  lines:[["kiriJauh","kiriTengah"],["kiriTengah","tengahKiri"],["tengahKiri","tengahAtas"],["tengahAtas","zavijava"],["tengahAtas","tengahKanan"],["tengahKanan","kananTengah"],["kananTengah","kananJauh"],["tengahKanan","atasSpica"],["tengahKiri","spica"],["atasSpica","spica"],["bawahKiriUjung","bawahKiriTengah"],["bawahKiriTengah","bawahTengah"],["bawahTengah","spica"]]},
 {id:'canis',ra0:103.5,delay:2.2,phase:4.0,
  stars:{
   theta:{fx:322,fy:183,r:1.5,c:'#eaf6ff'},iota:{fx:271,fy:314,r:1.7,c:'#dcefff'},muliphein:{fx:351,fy:343,r:1.7,c:'#eaf6ff'},
   sirius:{fx:445,fy:316,r:4.2,c:'#e8f4ff',name:'Sirius',nx:1,dy:-10},mirzam:{fx:660,fy:313,r:2.6,c:'#bfe0ff'},mulipheinBody:{fx:548,fy:388,r:1.7,c:'#eaf6ff'},
   furud:{fx:587,fy:477,r:1.55,c:'#cfeeff'},wezenTop:{fx:359,fy:564,r:1.35,c:'#cfeeff'},wezen:{fx:342,fy:617,r:2.7,c:'#cfeeff'},
   tengahAtas:{fx:438,fy:520,r:1.6,c:'#cfeeff'},tengahBawah:{fx:414,fy:665,r:1.6,c:'#cfeeff'},adhara:{fx:448,fy:697,r:2.6,c:'#a8d4ff'},
   aludra:{fx:245,fy:776,r:2.4,c:'#cde6ff'},ekorKanan:{fx:768,fy:671,r:1.5,c:'#cfeeff'},ekorBawah:{fx:552,fy:803,r:1.5,c:'#cfeeff'}
  },
  lines:[["theta","iota"],["theta","muliphein"],["iota","muliphein"],["muliphein","sirius"],["sirius","mulipheinBody"],["mirzam","mulipheinBody"],["sirius","wezenTop"],["wezenTop","wezen"],["mulipheinBody","furud"],["mulipheinBody","tengahAtas"],["tengahAtas","tengahBawah"],["tengahBawah","adhara"],["wezen","adhara"],["wezen","aludra"],["adhara","ekorKanan"],["adhara","ekorBawah"]]},
 /* Taurus — coords LOCK from taurus_final (1000-space). Only Aldebaran is interactive. */
 {id:'taurus',ra0:68.9,delay:1.0,phase:1.2,
  stars:{
   elnath:{fx:157,fy:204,r:3.2,c:'#eaf6ff'},
   leftHorn:{fx:87,fy:423,r:1.7,c:'#dcefff'},
   upperMid:{fx:400,fy:378,r:1.85,c:'#eaf6ff'},
   theta1:{fx:481,fy:467,r:1.95,c:'#ffe9a0'},
   theta2:{fx:514,fy:503,r:1.95,c:'#ffe9a0'},
   aldebaran:{fx:443,fy:533,r:3.6,c:'#ffb27a',name:'Aldebaran',nx:-1,dy:2},
   nearAlde:{fx:482,fy:542,r:1.55,c:'#eaf6ff'},
   hyadesTip:{fx:536,fy:549,r:1.7,c:'#eaf6ff'},
   tail1:{fx:651,fy:613,r:1.7,c:'#dcefff'},
   tail2a:{fx:862,fy:671,r:1.7,c:'#dcefff'},
   tail2b:{fx:878,fy:688,r:1.95,c:'#eaf6ff'}
  },
  lines:[
   ["elnath","upperMid"],["upperMid","theta1"],["theta1","theta2"],["theta2","hyadesTip"],
   ["hyadesTip","tail1"],["tail1","tail2a"],["tail2a","tail2b"],
   ["leftHorn","aldebaran"],["aldebaran","nearAlde"],["nearAlde","hyadesTip"]
  ]},
 {id:'bootes',ra0:0,delay:1.0,phase:1.2,
  /* Classic kite matching Space.com ref: top → shoulders → lower sides →
     Arcturus at tip, two short legs below. y grows downward. */
  stars:{
   bootes_top:{fx:0,fy:-95,r:1.75,c:'#eaf6ff'},
   bootes_left:{fx:-58,fy:-38,r:1.7,c:'#eaf6ff'},
   bootes_right:{fx:52,fy:-48,r:1.7,c:'#eaf6ff'},
   bootes_ml:{fx:-28,fy:8,r:1.65,c:'#eaf6ff'},
   izar:{fx:32,fy:2,r:2.0,c:'#dcefff'},
   arcturus:{fx:4,fy:58,r:3.8,c:'#ffb450',name:'Arcturus',nx:-1,dy:14},
   bootes_legL:{fx:-32,fy:98,r:1.55,c:'#eaf6ff'},
   bootes_legR:{fx:38,fy:102,r:1.55,c:'#eaf6ff'}
  },
  lines:[
   ["bootes_top","bootes_left"],["bootes_top","bootes_right"],
   ["bootes_left","bootes_ml"],["bootes_right","izar"],
   ["bootes_ml","arcturus"],["izar","arcturus"],
   ["arcturus","bootes_legL"],["arcturus","bootes_legR"]
  ]},
 {id:'scorpius',ra0:0,delay:1.1,phase:1.4,
  /* Geometry LOCKED to scorpius-map.html — 1000×1000 reference coordinates. */
  stars:{
   topmost:{fx:875,fy:115,r:2.2,c:'#eaf6ff'},
   midRight:{fx:875,fy:260,r:2.0,c:'#eaf6ff'},
   rightmost:{fx:925,fy:395,r:1.8,c:'#dcefff'},
   antares:{fx:625,fy:345,r:4.0,c:'#ff4500',name:'Antares',nx:-1,dy:-11,specAfter:1},
   belowAntares:{fx:575,fy:435,r:2.0,c:'#eaf6ff'},
   midBody:{fx:515,fy:610,r:2.2,c:'#dcefff'},
   lowerMid:{fx:530,fy:705,r:2.1,c:'#ffe9c7'},
   bottomBody:{fx:550,fy:835,r:2.0,c:'#eaf6ff'},
   bm1:{fx:450,fy:875,r:1.8,c:'#ffe9c7'},
   bm2:{fx:380,fy:890,r:1.8,c:'#eaf6ff'},
   bottomLeft:{fx:235,fy:905,r:2.2,c:'#fff2cc'},
   tiny:{fx:145,fy:810,r:1.5,c:'#eaf6ff'},
   small:{fx:185,fy:745,r:1.6,c:'#dcefff'},
   shaula:{fx:285,fy:665,r:3.2,c:'#7dd8e0'}
  },
  lines:[
   ["antares","topmost"],["antares","midRight"],["antares","rightmost"],["antares","belowAntares"],
   ["belowAntares","midBody"],["midBody","lowerMid"],["lowerMid","bottomBody"],["bottomBody","bm1"],
   ["bm1","bm2"],["bm2","bottomLeft"],["bottomLeft","tiny"],["tiny","small"],["small","shaula"]
  ]}
];

CONS.forEach(function(c,ci){
  var minx=1e9,maxx=-1e9,miny=1e9,maxy=-1e9;
  Object.keys(c.stars).forEach(function(k,i){
    var s=c.stars[k];
    if(typeof s.fx==='number'&&typeof s.fy==='number'){s.rx=s.fx;s.ry=s.fy;}else{s.rx=-(s.ra-c.ra0)*Math.cos(s.dec*Math.PI/180);s.ry=-s.dec;}
    s.rgb=rgb(s.c);s.ph=Math.random()*6.28;s.t0=c.delay+.2;
    s.twinkleSpeed=.00125+Math.random()*.00165;
    s.twinkleDepth=.07+Math.random()*.12;
    s.twinkleJitter=Math.random()<.16;s._tw=0;s._twHit=-1;
    minx=Math.min(minx,s.rx);maxx=Math.max(maxx,s.rx);miny=Math.min(miny,s.ry);maxy=Math.max(maxy,s.ry);
  });
  if(c.nebula){if(typeof c.nebula.fx==='number'&&typeof c.nebula.fy==='number'){c.nebula.rx=c.nebula.fx;c.nebula.ry=c.nebula.fy;}else{c.nebula.rx=-(c.nebula.ra-c.ra0);c.nebula.ry=-c.nebula.dec;}}
  c.minx=minx;c.miny=miny;c.bw=maxx-minx;c.bh=maxy-miny;c.ox=0;c.oy=0;
  c.lines.forEach(function(l,i){
    [l[0],l[1]].forEach(function(k){var s=c.stars[k];s.t0=Math.min(s.t0===c.delay+.2?1e9:s.t0,c.delay+i*.28);});
  });
});
var CAPS={orion:$('#cap-orion'),virgo:$('#cap-virgo'),canis:$('#cap-canis'),taurus:$('#cap-taurus'),bh:$('#cap-bh')};

var PORTALS=[
 {id:'band',cons:'orion',stars:['mintaka','alnilam','alnitak'],from:'mintaka',hit:'alnilam',href:'dumul.html',title:'DUMUL',sub:'music \u00b7 Limerence album',col:'110,229,255',place:'fig-right'}
];
var TRIGGERS={
 betel:{id:'betel',cons:'orion',star:'betel',rgb:'255,72,64'},
 rigel:{id:'rigel',cons:'orion',star:'rigel',rgb:'74,165,255'},
 spica:{id:'spica',cons:'virgo',star:'spica',rgb:'140,200,255'},
 sirius:{id:'sirius',cons:'canis',star:'sirius',rgb:'180,220,255'},
 pleione:{id:'pleione',cons:'pleiades',star:'Pleione',rgb:'145,170,255'},
 aldebaran:{id:'aldebaran',cons:'taurus',star:'aldebaran',rgb:'255,160,90'},
 arcturus:{id:'arcturus',cons:'bootes',star:'arcturus',rgb:'255,180,80'},
 antares:{id:'antares',cons:'scorpius',star:'antares',rgb:'255,69,0'}
};

/* ---------- PLEIADES: 7 bright + 2 dim, no imaginary lines ----------
   Compact mini-dipper matching EarthSky Taurus chart. Normalized 0..1;
   Pleione (near Atlas, right side) is the only interactive star. */
var PLEIADES={
  bright:[
    {x:.32,y:.28,name:'Taygeta',r:1.75},
    {x:.22,y:.42,name:'Electra',r:1.8},
    {x:.42,y:.34,name:'Maia',r:1.8},
    {x:.52,y:.48,name:'Alcyone',r:1.95},
    {x:.38,y:.62,name:'Merope',r:1.8},
    {x:.78,y:.52,name:'Atlas',r:1.85},
    {x:.84,y:.40,name:'Pleione',interactive:true,r:1.9}
  ],
  dim:[{x:.58,y:.22,r:1.15},{x:.68,y:.60,r:1.15}],
  x:0,y:0,scale:1,ready:false
};
PLEIADES.bright.forEach(function(st){st.ph=Math.random()*6.283;st._tw=0;st._twHit=-1;});
PLEIADES.dim.forEach(function(st){st.ph=Math.random()*6.283;st._tw=0;st._twHit=-1;});
/* Shared compact breath/pulse geometry — same size language as Orion belt portal rings (~8). */
var TRIGGER_PULSE_BASE=5.6;

/* ---------- Stellar Memory + Discovery Log + Signal Fragments ---------- */
var STELLAR_KEYS=['aldebaran','antares','arcturus','betel','pleione','rigel','sirius','spica'];
var STELLAR_LABELS={
  aldebaran:'Aldebaran',antares:'Antares',arcturus:'Arcturus',betel:'Betelgeuse',
  pleione:'Pleione',rigel:'Rigel',sirius:'Sirius',spica:'Spica'
};
var STELLAR_CONS={
  betel:'orion',rigel:'orion',
  spica:'virgo',
  sirius:'canis',
  pleione:'pleiades',
  aldebaran:'taurus',
  arcturus:'bootes',
  antares:'scorpius'
};
var CONS_LABELS={
  orion:'Orion',virgo:'Virgo',canis:'Canis Major',pleiades:'Pleiades',
  taurus:'Taurus',bootes:'Boötes',scorpius:'Scorpius'
};
/* Interactive stars per constellation (only the ones with SFX). */
var CONS_STARS={
  orion:['betel','rigel'],
  virgo:['spica'],
  canis:['sirius'],
  pleiades:['pleione'],
  taurus:['aldebaran'],
  bootes:['arcturus'],
  scorpius:['antares']
};
var SIGNAL_FRAGMENTS={
  betel:{
    tag:'FRAGMENT // BETELGEUSE',
    title:'Red Giant · Imminent',
    body:'A dying sun that still sings. The pulse you hear is collapse delayed — beauty measured in centuries of afterglow.',
    meta:['RA 05h 55m','DEC +07° 24′','SPEC M1-2 Ia','LINK · Orion belt']
  },
  rigel:{
    tag:'FRAGMENT // RIGEL',
    title:'Blue Supergiant · Anchor',
    body:'The foot of the hunter. Cold light, deep bass — a signal that arrives after the story has already moved on.',
    meta:['RA 05h 14m','DEC −08° 12′','SPEC B8 Ia','LINK · Saiph arc']
  },
  spica:{
    tag:'FRAGMENT // SPICA',
    title:'Binary Spike · Harvest',
    body:'Two stars locked in a brief, bright orbit. The earthen spike of Virgo — a note that cuts clean through the dark.',
    meta:['RA 13h 25m','DEC −11° 09′','SPEC B1 III-IV','LINK · Virgo spine']
  },
  sirius:{
    tag:'FRAGMENT // SIRIUS',
    title:'Dog Star · Brightest',
    body:'Nearest of the great ones. Sharp, white, impossible to ignore — the observatory’s first hello from the winter sky.',
    meta:['RA 06h 45m','DEC −16° 42′','SPEC A1 V','LINK · Canis Major']
  },
  pleione:{
    tag:'FRAGMENT // PLEIONE',
    title:'Seven Sisters · Edge',
    body:'A soft cluster voice near Atlas. Not the brightest, but the one that answers when you lean closer to the glass.',
    meta:['RA 03h 49m','DEC +24° 08′','SPEC B8 Vne','LINK · Pleiades']
  },
  aldebaran:{
    tag:'FRAGMENT // ALDEBARAN',
    title:'Follower · Bull’s Eye',
    body:'Orange watchman of Taurus. It trails the Pleiades across the night — patient, warm, always one step behind the sisters.',
    meta:['RA 04h 35m','DEC +16° 30′','SPEC K5 III','LINK · Hyades']
  },
  arcturus:{
    tag:'FRAGMENT // ARCTURUS',
    title:'Bear Guardian · Kite Tip',
    body:'The golden tip of Boötes. Ancient light from an old disk star — a calm, amber tone over the spring fields.',
    meta:['RA 14h 15m','DEC +19° 10′','SPEC K1.5 III','LINK · Boötes kite']
  },
  antares:{
    tag:'FRAGMENT // ANTARES',
    title:'Rival of Mars · Sting',
    body:'Heart of the scorpion. Red against the summer haze — a rival’s name for a star that refuses to be quiet.',
    meta:['RA 16h 29m','DEC −26° 25′','SPEC M1.5 Iab','LINK · Scorpius arc']
  }
};

var StellarMem={
  observed:{},
  archived:{},
  storageKey:'obs_stellar_v1',
  load:function(){
    try{
      var raw=localStorage.getItem(this.storageKey);
      if(!raw)return;
      var data=JSON.parse(raw);
      if(data&&typeof data==='object'){
        this.observed=data.observed&&typeof data.observed==='object'?data.observed:{};
        this.archived=data.archived&&typeof data.archived==='object'?data.archived:{};
      }
    }catch(e){this.observed={};this.archived={};}
  },
  save:function(){
    try{
      localStorage.setItem(this.storageKey,JSON.stringify({
        observed:this.observed,
        archived:this.archived
      }));
    }catch(e){}
  },
  isObserved:function(key){return !!this.observed[key];},
  isArchived:function(cid){return !!this.archived[cid];},
  markObserved:function(key){
    if(!key||this.observed[key])return false;
    var now=new Date();
    var y=now.getUTCFullYear();
    var m=('0'+(now.getUTCMonth()+1)).slice(-2);
    var d=('0'+now.getUTCDate()).slice(-2);
    this.observed[key]={at:y+'.'+m+'.'+d,ts:now.getTime()};
    this.save();
    return true;
  },
  markArchived:function(cid){
    if(!cid||this.archived[cid])return false;
    this.archived[cid]={at:Date.now()};
    this.save();
    return true;
  },
  count:function(){
    var n=0;
    for(var i=0;i<STELLAR_KEYS.length;i++)if(this.observed[STELLAR_KEYS[i]])n++;
    return n;
  },
  consComplete:function(cid){
    var stars=CONS_STARS[cid];
    if(!stars||!stars.length)return false;
    for(var i=0;i<stars.length;i++)if(!this.observed[stars[i]])return false;
    return true;
  }
};
StellarMem.load();

/* ---------- UNLOCK (minigame lock) ----------
   Terpisah dari StellarMem: "pernah didengar" (observed) != "sudah di-unlock".
   Per rasi: Orion buka Betelgeuse + Rigel, rasi lain satu bintang SFX-nya.
   Pengunjung lama mulai dari kosong (terkunci lagi); cache audio yang sudah tersimpan TIDAK disentuh. */
var UNLOCK={
  set:{},
  storageKey:'obs_unlock_v1',
  load:function(){
    try{
      var raw=localStorage.getItem(this.storageKey);
      if(!raw)return;
      var d=JSON.parse(raw);
      if(d&&typeof d==='object'&&d.set&&typeof d.set==='object')this.set=d.set;
    }catch(e){this.set={};}
  },
  save:function(){try{localStorage.setItem(this.storageKey,JSON.stringify({set:this.set}));}catch(e){}}
};
UNLOCK.load();
var UNLOCK_CONS=['orion','virgo','canis','pleiades','taurus','bootes','scorpius'];
/* key = kunci bintang SFX ('betel', 'rigel', ...) atau id rasi ('orion', ...) */
function isUnlocked(key){
  var cid=STELLAR_CONS[key]||key;
  return !!(UNLOCK&&UNLOCK.set&&UNLOCK.set[cid]);
}
/* Kirim pesan ke service worker (sama pola dengan hook ">50% didengar" di index.html, hormati Data Saver / 2G). */
function swPost(msg){
  try{
    if(!('serviceWorker' in navigator))return;
    var c=navigator.connection;
    if(c&&(c.saveData||/(^|-)2g$/.test(c.effectiveType||'')))return;
    var ctl=navigator.serviceWorker.controller;
    if(ctl){ctl.postMessage(msg);return;}
    navigator.serviceWorker.ready.then(function(reg){if(reg&&reg.active)reg.active.postMessage(msg);}).catch(function(){});
  }catch(e){}
}
/* Pas unlock: file .opus rasi itu ikut disimpan (SW nggak akan unduh ulang kalau sudah ada, dan nggak pernah menghapus). */
function cacheUnlockedAudio(cid){
  var keys=CONS_STARS[cid]||[];
  for(var i=0;i<keys.length;i++){
    var a=SFX[keys[i]];if(!a)continue;
    var src=a.currentSrc||a.src;
    if(src)swPost({type:'CACHE_AUDIO',url:src});
  }
}
function unlock(cid){
  if(UNLOCK_CONS.indexOf(cid)<0||UNLOCK.set[cid])return false;
  UNLOCK.set[cid]={at:Date.now()};
  UNLOCK.save();
  var c=cons(cid);if(c)c._reveal=performance.now(); /* garis rasi digambar pelan-pelan sebagai reward */
  cacheUnlockedAudio(cid);
  renderStellarRecord();
  return true;
}
function unlockAll(){
  if(typeof ALIGN!=='undefined'&&ALIGN.cid)endAlignment(true);
  var n=0;
  for(var i=0;i<UNLOCK_CONS.length;i++)if(unlock(UNLOCK_CONS[i]))n++;
  return n;
}
/* Tap bintang SFX yang masih terkunci: bisu, tapi kasih petunjuk (rate-limit biar nggak spam). */
var _lockHintAt=0;
function lockedHint(key){
  var n=performance.now();
  if(n-_lockHintAt<4200)return; /* > durasi toast, biar tap berulang nggak mengulang animasinya */
  _lockHintAt=n;
  haptic(6);
  if(typeof showModeToast==='function'){
    if(key==='pleione')showModeToast('PLEIADES LOCKED\nIN CAMERA MODE: SIRIUS → ORION BELT → ALDEBARAN\nONE STRAIGHT LINE',null,4200);
    else showModeToast('SIGNAL LOCKED\nALIGN THE CONSTELLATION IN CAMERA MODE',null,4000);
  }
}

function formatSrCount(){
  var n=StellarMem.count();
  return (n<10?'0':'')+n+' <span>/ 08</span>';
}
function renderStellarRecord(){
  var countEl=document.getElementById('sr-count');
  var badge=document.getElementById('sr-badge');
  var musicToggle=document.getElementById('music-toggle');
  var consEl=document.getElementById('sr-cons');
  var n=StellarMem.count();
  var nn=(n<10?'0':'')+n;
  if(countEl)countEl.innerHTML='// <em>'+nn+'</em>/08';
  if(badge){
    badge.textContent=String(n);
    badge.setAttribute('aria-hidden',n>0?'false':'true');
  }
  if(musicToggle)musicToggle.classList.toggle('has-stellar',n>0);
  /* Reflect capture state on each Stellar Signal row (status beside spectrum). */
  var rows=document.querySelectorAll('#music-player .mp-track[data-type="sfx"]');
  for(var i=0;i<rows.length;i++){
    var row=rows[i],key=row.getAttribute('data-key');
    var on=!!(key&&StellarMem.isObserved(key));
    var lk=!!(key&&!isUnlocked(key));
    row.classList.toggle('observed',on);
    row.classList.toggle('locked',lk);
    row.disabled=lk;
    row.setAttribute('aria-disabled',lk?'true':'false');
    var obs=row.querySelector('.mp-obs');
    if(obs){
      if(lk){
        obs.innerHTML='<svg viewBox="0 0 10 12" aria-hidden="true"><rect x="1.2" y="5" width="7.6" height="6" rx="1.2"/><path d="M3 5V3.6a2 2 0 0 1 4 0V5"/></svg>';
        obs.title='Locked';
      }else{obs.textContent=on?'●':'○';obs.title=on?'Captured':'Unobserved';}
    }
  }
  if(consEl){
    var cids=['orion','virgo','canis','pleiades','taurus','bootes','scorpius'];
    var html2='';
    for(var j=0;j<cids.length;j++){
      var cid=cids[j];
      var arch=StellarMem.isArchived(cid);
      var ready=StellarMem.consComplete(cid);
      var state=arch?'● ARCHIVED':(ready?'◇ READY':'○ SCANNING');
      html2+='<div class="sr-cons-row'+(arch?' archived':'')+'" data-cons="'+cid+'">';
      html2+='<span class="sr-cons-name">'+CONS_LABELS[cid]+'</span>';
      html2+='<span class="sr-cons-state">'+state+'</span>';
      html2+='</div>';
    }
    consEl.innerHTML=html2;
  }
}

function showSignalFragment(key){
  var frag=SIGNAL_FRAGMENTS[key];
  if(!frag)return;
  var el=document.getElementById('signal-fragment');
  if(!el)return;
  var tag=document.getElementById('sf-tag');
  var title=document.getElementById('sf-title');
  var body=document.getElementById('sf-body');
  var meta=document.getElementById('sf-meta');
  var obs=StellarMem.observed[key];
  if(tag)tag.textContent=frag.tag;
  if(title)title.textContent=frag.title;
  if(body)body.textContent=frag.body;
  if(meta){
    var bits=frag.meta.slice();
    if(obs&&obs.at)bits.unshift('RECOVERED · '+obs.at);
    else bits.unshift('SIGNAL ACQUIRED');
    meta.innerHTML=bits.map(function(m){return '<span>'+m+'</span>';}).join('');
  }
  el.classList.remove('on');
  void el.offsetWidth;
  el.classList.add('on');
  el.setAttribute('aria-hidden','false');
  clearTimeout(el._t);
  el._t=setTimeout(function(){hideSignalFragment();},7200);
}
function hideSignalFragment(){
  var el=document.getElementById('signal-fragment');
  if(!el)return;
  el.classList.remove('on');
  el.setAttribute('aria-hidden','true');
  clearTimeout(el._t);
}
/* mode 'unlock' = popup congrats pas alignment selesai; default = popup ARCHIVED (Constellation Log).
   Dua popup berbagi satu elemen, jadi yang datang pas lagi tampil ditunda sampai yang pertama selesai. */
var CONS_POP_Q=[];
/* Popup ditahan selama Constellation Camera aktif (di kamera gampang kelewat / ketimpa panel),
   lalu dimunculkan berurutan begitu keluar dari mode kamera. */
function flushConsPopups(){
  if(CAMERA_MODE||!CONS_POP_Q.length)return;
  clearTimeout(flushConsPopups._t);
  flushConsPopups._t=setTimeout(function(){
    if(CAMERA_MODE)return;
    var q=CONS_POP_Q.splice(0,CONS_POP_Q.length);
    for(var i=0;i<q.length;i++)showConsArchive(q[i][0],q[i][1]);
  },450);
}
function showConsArchive(cid,mode){
  var el=document.getElementById('cons-archive');
  if(!el)return;
  if(CAMERA_MODE){
    for(var qi=0;qi<CONS_POP_Q.length;qi++)if(CONS_POP_Q[qi][0]===cid&&CONS_POP_Q[qi][1]===mode)return;
    CONS_POP_Q.push([cid,mode]);
    return;
  }
  var t0=performance.now();
  if(showConsArchive._until>t0){
    setTimeout(function(){showConsArchive(cid,mode);},showConsArchive._until-t0+120);
    return;
  }
  showConsArchive._until=t0+2900;
  var name=document.getElementById('ca-name');
  var sub=document.getElementById('ca-sub');
  var line=el.querySelector('.ca-line');
  var lab=(CONS_LABELS[cid]||cid).toUpperCase();
  if(name)name.textContent=lab;
  if(mode==='unlock'){
    var ks=CONS_STARS[cid]||[],nm=ks.map(function(k){return (STELLAR_LABELS[k]||k).toUpperCase();});
    if(line)line.textContent='ALIGNMENT COMPLETE';
    if(sub)sub.textContent=nm.join(' · ')+' // UNLOCKED';
  }else{
    if(line)line.textContent='PATTERN RECOGNIZED';
    if(sub)sub.textContent=lab+' // ARCHIVED';
  }
  el.classList.remove('on');
  void el.offsetWidth;
  el.classList.add('on');
  el.setAttribute('aria-hidden','false');
  /* One-shot visual: brief pink scan like Konami, then clear. */
  document.body.classList.add('konami');
  clearTimeout(showConsArchive._t);
  showConsArchive._t=setTimeout(function(){
    el.classList.remove('on');
    el.setAttribute('aria-hidden','true');
    document.body.classList.remove('konami');
  },2800);
  haptic(22);
}
function keyFromAudio(a){
  if(!a||typeof SFX==='undefined')return null;
  if(a===SFX.betel)return 'betel';
  if(a===SFX.rigel)return 'rigel';
  if(a===SFX.spica)return 'spica';
  if(a===SFX.sirius)return 'sirius';
  if(a===SFX.pleione)return 'pleione';
  if(a===SFX.aldebaran)return 'aldebaran';
  if(a===SFX.arcturus)return 'arcturus';
  if(a===SFX.antares)return 'antares';
  return null;
}
function onStellarSignal(key){
  if(!key||STELLAR_KEYS.indexOf(key)<0)return;
  /* Observed status is set on interaction; here we only surface the fragment
     and finalize constellation archive if the set is complete. */
  if(!StellarMem.isObserved(key))StellarMem.markObserved(key);
  renderStellarRecord();
  showSignalFragment(key);
  var cid=STELLAR_CONS[key];
  if(cid&&StellarMem.consComplete(cid)&&!StellarMem.isArchived(cid)){
    if(StellarMem.markArchived(cid)){
      setTimeout(function(){showConsArchive(cid);renderStellarRecord();},900);
    }
  }
}


/* ---------- Last Signal + Observation Mode + Radio Silence ---------- */
var LAST_SIGNAL_DATA={
  betel:{name:'BETELGEUSE',spec:'M1-2 Ia',dist:'640 LY'},
  rigel:{name:'RIGEL',spec:'B8 Ia',dist:'860 LY'},
  spica:{name:'SPICA',spec:'B1 III-IV',dist:'250 LY'},
  sirius:{name:'SIRIUS',spec:'A1 V',dist:'8.6 LY'},
  pleione:{name:'PLEIONE',spec:'B8 Vne',dist:'440 LY'},
  aldebaran:{name:'ALDEBARAN',spec:'K5 III',dist:'65 LY'},
  arcturus:{name:'ARCTURUS',spec:'K1.5 III',dist:'37 LY'},
  antares:{name:'ANTARES',spec:'M1.5 Iab',dist:'550 LY'}
};
var OBSERVE_MODE=false;
var RADIO_SILENCE=false;
var lastSignalKey=null;
var lastSignalGlowUntil=0;

function rememberLastSignal(key){
  if(!key||!LAST_SIGNAL_DATA[key])return;
  lastSignalKey=key;
  try{sessionStorage.setItem('obs_last_signal',key);}catch(e){}
}
function loadLastSignalKey(){
  try{
    var k=sessionStorage.getItem('obs_last_signal');
    if(k&&LAST_SIGNAL_DATA[k])lastSignalKey=k;
  }catch(e){}
  /* Fallback: most recent observed star from StellarMem */
  if(!lastSignalKey&&typeof StellarMem!=='undefined'){
    var best=null,bestTs=-1;
    for(var i=0;i<STELLAR_KEYS.length;i++){
      var k=STELLAR_KEYS[i],o=StellarMem.observed[k];
      if(o&&o.ts!=null&&o.ts>bestTs){bestTs=o.ts;best=k;}
    }
    if(best)lastSignalKey=best;
  }
  return lastSignalKey;
}
function markWentToDumul(){
  try{sessionStorage.setItem('obs_went_to_dumul','1');}catch(e){}
  if(lastSignalKey)rememberLastSignal(lastSignalKey);
}
function shouldShowLastSignal(){
  try{
    if(sessionStorage.getItem('obs_went_to_dumul')==='1')return true;
  }catch(e){}
  try{
    var ref=document.referrer||'';
    if(/dumul\.html/i.test(ref))return true;
  }catch(e2){}
  return false;
}
function clearWentToDumul(){
  try{sessionStorage.removeItem('obs_went_to_dumul');}catch(e){}
}
function applyLastSignalTrackGlow(key){
  var rows=document.querySelectorAll('#music-player .mp-track[data-type="sfx"]');
  for(var i=0;i<rows.length;i++){
    var on=key&&rows[i].getAttribute('data-key')===key;
    rows[i].classList.toggle('last-signal',!!on);
  }
}
function showLastSignalBanner(key){
  var data=LAST_SIGNAL_DATA[key];
  if(!data)return;
  var el=document.getElementById('last-signal');
  if(!el)return;
  var nm=document.getElementById('ls-name');
  var sp=document.getElementById('ls-spec');
  var di=document.getElementById('ls-dist');
  if(nm)nm.textContent=data.name;
  if(sp)sp.textContent=data.spec;
  if(di)di.textContent=data.dist;
  el.classList.remove('on');
  void el.offsetWidth;
  el.classList.add('on');
  el.setAttribute('aria-hidden','false');
  applyLastSignalTrackGlow(key);
  lastSignalGlowUntil=performance.now()+14000;
  clearTimeout(el._t);
  el._t=setTimeout(function(){
    el.classList.remove('on');
    el.setAttribute('aria-hidden','true');
  },5200);
  clearTimeout(el._g);
  el._g=setTimeout(function(){
    if(performance.now()>=lastSignalGlowUntil)applyLastSignalTrackGlow(null);
  },14000);
  /* Soft glow on canvas star via lastSignalKey while lastSignalGlowUntil */
}
function maybeShowLastSignalOnReturn(){
  if(!shouldShowLastSignal())return;
  clearWentToDumul();
  var key=loadLastSignalKey();
  if(!key)return;
  /* Defer until boot finishes so banner isn't under boot screen */
  var tryShow=function(){
    if(typeof bootDone!=='undefined'&&!bootDone){setTimeout(tryShow,200);return;}
    showLastSignalBanner(key);
  };
  setTimeout(tryShow,400);
}

function showModeToast(text,kind,ms){
  var el=document.getElementById('mode-toast');
  if(!el)return;
  el.textContent=text;
  el.classList.toggle('silence',kind==='silence');
  var czEl=document.getElementById('cam-zoom');
  if(CAMERA_MODE&&czEl&&!STG.on){
    var czr=czEl.getBoundingClientRect();
    var vh=(window.visualViewport&&visualViewport.height)||innerHeight;
    el.style.bottom=Math.max(8,Math.round(vh-czr.top+18))+'px';
  }else el.style.removeProperty('bottom');
  el.classList.remove('on');
  void el.offsetWidth;
  el.classList.add('on');
  el.setAttribute('aria-hidden','false');
  clearTimeout(el._t);
  el._t=setTimeout(function(){
    el.classList.remove('on');
    el.setAttribute('aria-hidden','true');
  },ms||2200);
}

function observeIcon(){
  /* Overview: 🌠 · inside a sector: 🔍 */
  return (typeof SECT!=='undefined'&&SECT.cur)?'🔍':'🌠';
}
function setObserveMode(on){
  OBSERVE_MODE=!!on;
  if(typeof termNoteObserve==='function')termNoteObserve(OBSERVE_MODE);
  document.body.classList.toggle('observe-mode',OBSERVE_MODE);
  var btn=document.getElementById('mode-observe');
  if(btn){
    btn.classList.toggle('on',OBSERVE_MODE);
    btn.setAttribute('aria-pressed',OBSERVE_MODE?'true':'false');
    btn.textContent=observeIcon();
    btn.title=OBSERVE_MODE?'Exit Observation':'Observation Mode';
    btn.setAttribute('aria-label',OBSERVE_MODE?'Exit Observation':'Observation Mode');
  }
  var camBtn=document.getElementById('mode-camera');
  if(camBtn){
    camBtn.hidden=!OBSERVE_MODE;
    if(!OBSERVE_MODE){
      CAMERA_MODE=false;
      document.body.classList.remove('camera-mode');
      FFX.id=null;hideWhisper();FOCUS.i=0;FOCUS.anim=false;FOCUS.list=null;
      camBtn.classList.remove('on');
      camBtn.setAttribute('aria-pressed','false');
      camBtn.title='Constellation Camera';
      camBtn.setAttribute('aria-label','Constellation Camera');
      setSkyZoom(1,false);
    }
  }
  updateCamZoomUI();
  if(!CAMERA_MODE)flushConsPopups();
  /* Close music HUD if open */
  if(OBSERVE_MODE){
    var panel=document.getElementById('music-player');
    if(panel&&panel.classList.contains('open')){
      panel.classList.remove('open');
      panel.setAttribute('aria-hidden','true');
      var mt=document.getElementById('music-toggle');
      if(mt)mt.setAttribute('aria-expanded','false');
    }
    showModeToast('OBSERVATION MODE\nHUD OFF · LABELS OFF',null,2000);
  }else{
    showModeToast('HUD RESTORED',null,1600);
  }
}

function silenceTargets(){
  var L=[],seen=typeof WeakSet!=='undefined'?new WeakSet():null;
  function add(a){
    if(!a)return;
    try{if(seen){if(seen.has(a))return;seen.add(a);}L.push(a);}catch(e){L.push(a);}
  }
  try{if(typeof AMB!=='undefined')add(AMB);}catch(e){}
  try{if(typeof MUSIC_COLLAP!=='undefined')add(MUSIC_COLLAP);}catch(e){}
  try{if(typeof GARG!=='undefined')add(GARG);}catch(e){}
  try{if(typeof activeSfx!=='undefined'&&activeSfx)add(activeSfx);}catch(e){}
  try{if(typeof SFX!=='undefined'){Object.keys(SFX).forEach(function(k){add(SFX[k]);});}}catch(e){}
  return L;
}
function setRadioSilence(on){
  RADIO_SILENCE=!!on;
  var btn=document.getElementById('mode-silence');
  if(btn){
    btn.classList.toggle('on',RADIO_SILENCE);
    btn.setAttribute('aria-pressed',RADIO_SILENCE?'true':'false');
    btn.textContent=RADIO_SILENCE?'🔈':'🔊';
    btn.title=RADIO_SILENCE?'Unmute — restore volume':'Mute — fade audio out';
    btn.setAttribute('aria-label',RADIO_SILENCE?'Unmute audio':'Mute audio');
  }
  try{
    var list=silenceTargets(),i,a;
    if(RADIO_SILENCE){
      /* Soft mute: fade every channel to 0 (fadeTo pauses at end) */
      for(i=0;i<list.length;i++){
        a=list[i];
        try{
          if(!a.paused&&!a.ended)a._silWas=1;
          if(typeof fadeTo==='function')fadeTo(a,0,420);
          else{a.volume=0;if(!a.paused)a.pause();}
        }catch(e1){}
      }
      try{if(typeof audioVizOff==='function')audioVizOff();}catch(e2){}
      try{if(typeof setAVColor==='function')setAVColor(null,false);}catch(e3){}
      showModeToast('RADIO SILENCE\n─────────────\nAUDIO FADING OUT','silence',2200);
    }else{
      /* Restore ONLY channels that were actually playing when muted.
         Never wake paused SFX / other BGM — that stacked every track. */
      for(i=0;i<list.length;i++){
        a=list[i];
        try{
          var bv=a._bv!=null?a._bv:.85;
          if(a._silWas){
            if(typeof fadeTo==='function')fadeTo(a,bv,480,{resume:true,pause:false});
            else{a.volume=bv;if(a.paused)safePlay(a);}
          }else{
            /* leave paused tracks paused; just make sure leftover 0-volume isn't sticky if they play later */
            if(a.volume<.02)a.volume=bv;
          }
          a._silWas=0;
        }catch(e4){}
      }
      showModeToast('SIGNAL RESTORED\nVOLUME FADING IN',null,1800);
    }
  }catch(e){
    if(RADIO_SILENCE)showModeToast('RADIO SILENCE','silence',1800);
    else showModeToast('SIGNAL RESTORED',null,1600);
  }
}

(function initModeUI(){
  loadLastSignalKey();
  var obs=document.getElementById('mode-observe');
  var sil=document.getElementById('mode-silence');
  if(obs)obs.addEventListener('click',function(){setObserveMode(!OBSERVE_MODE);haptic(10);});
  if(sil)sil.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();setRadioSilence(!RADIO_SILENCE);haptic(10);});
  var cam=document.getElementById('mode-camera');
  if(cam){
    cam.hidden=true;
    cam.addEventListener('click',function(){
      if(!OBSERVE_MODE){showModeToast('CAMERA REQUIRES\nOBSERVATION MODE',null,1800);return;}
      setCameraMode(!CAMERA_MODE);haptic(10);
    });
  }
  maybeShowLastSignalOnReturn();
  /* pageshow: back from dumul via BFCache */
  window.addEventListener('pageshow',function(e){
    if(e.persisted)maybeShowLastSignalOnReturn();
  });
})();

/* Wire fragment dismiss + initial record paint (record lives in music HUD). */
(function initStellarUI(){
  var sfClose=document.getElementById('sf-close');
  if(sfClose)sfClose.addEventListener('click',hideSignalFragment);
  renderStellarRecord();
})();


/* ---------- V4: active constellation focus + low-cost slow twinkle ----------
   Only the constellation whose SFX is currently playing is full-bright +
   twinkling. Everything else (incl. Pleiades) stays dim. Fresh open / idle
   after SFX ends → all dim. No sticky focus after playback stops. */
var CF={active:null,current:[],target:[],lastNow:0};
/* Start dim: every constellation stays quiet until its own SFX plays. */
function cfInit(){for(var i=0;i<CONS.length;i++){CF.current[i]=.24;CF.target[i]=.24;}}
cfInit();

/* ---------- Constellation Alignment (minigame lock) ----------
   - Cuma jalan di Constellation Camera, kamera harus fokus ke rasi itu, dan cuma buat rasi yang MASIH terkunci.
   - Bintang SFX jadi titik terakhir urutan. Langkah sebelumnya cuma dihitung (SFX diam);
     langkah terakhir: unlock(cid) -> triggerSupernova -> popup.
   - Pleiades nggak punya garis: alignment-nya garis lurus lintas rasi (Sirius -> sabuk Orion -> Aldebaran -> Pleiades), lihat PLE_CHAIN. */
var ALIGN={cid:null,seq:[],next:0,lit:null,dim:0,toastAt:0,last:0,idle:15000};
var PLE_CHAIN=[['canis','sirius'],['orion','alnitak'],['orion','alnilam'],['orion','mintaka'],['taurus','aldebaran']];
var ALIGN_IDLE_MS=15000,ALIGN_IDLE_CHAIN=30000;
function secondaryFxScale(){
  if(ALIGN.cid)return 1;
  if(typeof CF!=='undefined'&&CF.active)return .78;
  return ALIGN.dim;
}
function camFocusId(){var f=FOCUS.list&&FOCUS.list[FOCUS.i];return f?f.id:null;}
/* Bintang SFX milik sebuah rasi, urutan sesuai TRIGGERS (Orion: betel, rigel). */
function sfxStarsOf(c){
  var out=[];
  for(var k in TRIGGERS){var t=TRIGGERS[k];if(t.cons===c.id&&t.cons!=='pleiades'&&c.stars[t.star])out.push(t.star);}
  return out;
}
/* Urutan dari garis, tapi bintang SFX dikeluarkan lalu di-push ke paling akhir. */
function alignmentSequence(c){
  if(!c||!c.lines)return [];
  if(c._seq)return c._seq;
  var order=[],seen={},i;
  for(i=0;i<c.lines.length;i++){
    var a=c.lines[i][0],b=c.lines[i][1];
    if(!seen[a]){seen[a]=1;order.push(a);}
    if(!seen[b]){seen[b]=1;order.push(b);}
  }
  var sfx=sfxStarsOf(c),rest=[];
  for(i=0;i<order.length;i++)if(sfx.indexOf(order[i])<0)rest.push(order[i]);
  for(i=0;i<sfx.length;i++)if(seen[sfx[i]])rest.push(sfx[i]);
  c._seq=rest;
  return rest;
}
/* 'lit' | 'next' | null untuk bintang k di rasi c, termasuk chain Pleiades (lintas rasi). */
function alignMark(c,k){
  if(!ALIGN.cid)return null;
  if(ALIGN.cid==='pleiades'){
    for(var i=0;i<PLE_CHAIN.length;i++){
      if(PLE_CHAIN[i][0]===c.id&&PLE_CHAIN[i][1]===k)return i<ALIGN.next?'lit':(i===ALIGN.next?'next':null);
    }
    return null;
  }
  if(ALIGN.cid!==c.id)return null;
  if(ALIGN.lit&&ALIGN.lit[k])return 'lit';
  return ALIGN.seq[ALIGN.next]===k?'next':null;
}
function beginAlignment(c){
  if(!c)return;
  ALIGN.cid=c.id;ALIGN.seq=alignmentSequence(c);ALIGN.next=0;ALIGN.lit=Object.create(null);ALIGN.dim=1;ALIGN.last=performance.now();ALIGN.idle=ALIGN_IDLE_MS;
  document.body.classList.add('aligning'); /* UI lain ngalah: portal/teleskop/pleione pasif */
  if(typeof showModeToast==='function'&&performance.now()-ALIGN.toastAt>900){
    ALIGN.toastAt=performance.now();
    var lab=(typeof CONS_LABELS!=='undefined'&&CONS_LABELS[c.id])?CONS_LABELS[c.id]:c.id;
    showModeToast('ALIGNMENT · '+lab.toUpperCase()+'\nCONNECT THE STARS IN ORDER',null,2200);
  }
}
function beginPleChain(){
  ALIGN.cid='pleiades';ALIGN.seq=[];ALIGN.next=0;ALIGN.lit=Object.create(null);ALIGN.dim=1;ALIGN.last=performance.now();ALIGN.idle=ALIGN_IDLE_CHAIN;
  document.body.classList.add('aligning'); /* portal DUMUL di sabuk Orion ngalah selama chain, sama kayak alignment Orion */
  if(typeof showModeToast==='function'&&performance.now()-ALIGN.toastAt>900){
    ALIGN.toastAt=performance.now();
    showModeToast('ALIGNMENT · PLEIADES\nSIRIUS → ORION BELT → ALDEBARAN',null,2600);
  }
}
function endAlignment(ok){
  var cid=ALIGN.cid;ALIGN.cid=null;ALIGN.seq=[];ALIGN.next=0;ALIGN.lit=null;ALIGN.dim=ok?0:.35;
  document.body.classList.remove('aligning');return cid;
}
/* Langkah terakhir: unlock -> SFX (kalau ada) -> popup. viaKey = kunci TRIGGERS yang dibunyikan. */
function alignDone(cid,viaKey){
  endAlignment(true);
  unlock(cid);
  tapFlash={until:performance.now()+1500,cons:cid}; /* garis yang baru muncul ikut menyala */
  if(viaKey&&typeof triggerSupernova==='function')triggerSupernova(viaKey);
  showConsArchive(cid,'unlock'); /* di mode kamera: masuk antrean, tampil setelah keluar kamera */
  /* Fakta/data rasi yang tadinya terkunci ikut terbuka kalau kamera masih fokus di sana. */
  if(CAMERA_MODE&&FFX.id===cid)setTimeout(function(){if(CAMERA_MODE&&FFX.id===cid)showWhisper(cid);},1200);
  if(typeof haptic==='function')haptic(22);
}
/* Return: false = bukan langkah alignment (caller lanjut seperti biasa),
           'step'  = langkah yang benar tapi belum terakhir (dihitung, SFX DIAM),
           'done'  = langkah terakhir (unlock + SFX + popup sudah ditangani di sini). */
function alignTapStar(c,starKey){
  if(!c||!starKey||!c.stars||!c.stars[starKey])return false;
  if(!CAMERA_MODE)return false;                       /* alignment cuma di mode kamera */
  var ch=pleChainTap(c,starKey);                      /* chain lintas sektor Pleiades */
  if(ch)return ch;
  if(isUnlocked(c.id))return false;                   /* sudah unlocked: nggak ada hint kuning / toast / dimming lagi */
  if(camFocusId()!==c.id)return false;                /* kamera harus lagi fokus di rasi ini */
  var seq=alignmentSequence(c);if(!seq.length)return false;
  if(ALIGN.cid!==c.id){
    if(starKey!==seq[0])return false;
    beginAlignment(c);
  }else if(starKey===seq[0]&&ALIGN.next>0){
    beginAlignment(c);
  }
  var expect=ALIGN.seq[ALIGN.next];
  ALIGN.last=performance.now();
  if(starKey===expect){
    ALIGN.lit[starKey]=1;ALIGN.next++;
    if(typeof haptic==='function')haptic(10);
    if(typeof tapFlash!=='undefined')tapFlash={until:performance.now()+520,cons:c.id};
    if(ALIGN.next>=ALIGN.seq.length){
      var tk=(TRIGGERS[starKey]&&TRIGGERS[starKey].cons===c.id)?starKey:null;
      alignDone(c.id,tk);
      return 'done';
    }
    return 'step';
  }
  if(ALIGN.lit&&ALIGN.lit[starKey])return false; /* re-tap of an already lit star: ignore */
  /* Forgiving: a wrong / audio-trigger star tap is ignored (no reset). Progress is only lost
     by the idle timeout, or by re-tapping the first star to restart. */
  if(typeof haptic==='function')haptic(4);
  return false;
}
/* Pleiades cuma 1 bintang interaktif & nggak punya garis, jadi syaratnya alignment antar sektor di mode kamera:
   sabuk Orion (Alnitak -> Alnilam -> Mintaka) dulu, lanjut Aldebaran (kamera pindah ke Taurus), baru Pleiades kebuka.
   Chain cuma mulai dari Alnitak dengan kamera fokus Orion, jadi tap sabuk biasa (toggle portal DUMUL) di luar mode kamera
   nggak keganggu. Selama chain jalan portal pasif (body.aligning) supaya tap Alnilam jatuh ke canvas, bukan ke tombol portal. */
var _beltHintAt=0;
function beltHint(){
  var n=performance.now();if(n-_beltHintAt<3000)return;_beltHintAt=n;
  if(typeof showModeToast==='function')showModeToast('PLEIADES LOCKED\nSTART AT SIRIUS · DRAW THE LINE THROUGH THE BELT',null,2800);
}
function pleChainTap(c,k){
  if(UNLOCK.set.pleiades)return false;
  if(ALIGN.cid&&ALIGN.cid!=='pleiades')return false;   /* alignment rasi lain lagi jalan */
  var S=PLE_CHAIN,on=(ALIGN.cid==='pleiades'),first=S[0];
  var isFirst=(c.id===first[0]&&k===first[1]);
  if(!on){
    if(!isFirst){
      if(c.id==='orion'&&(k==='alnitak'||k==='alnilam'||k==='mintaka')&&camFocusId()==='orion'&&!ALIGN.cid)beltHint();
      return false;
    }
    if(camFocusId()!==first[0])return false;
    beginPleChain();
  }else if(isFirst&&ALIGN.next>0){
    beginPleChain();                                   /* tap bintang pertama lagi = ulang */
  }else if(!isFirst&&!(c.id===S[ALIGN.next][0]&&k===S[ALIGN.next][1])){
    return false;                                      /* bukan bagian chain: biarkan jalur normal */
  }
  var w=S[ALIGN.next];
  ALIGN.last=performance.now();
  if(c.id===w[0]&&k===w[1]&&camFocusId()===w[0]){
    ALIGN.next++;
    if(typeof haptic==='function')haptic(10);
    if(typeof tapFlash!=='undefined')tapFlash={until:performance.now()+520,cons:c.id};
    if(ALIGN.next>=S.length){alignDone('pleiades','pleione');return 'done';}
    if(typeof showModeToast==='function'){
      if(ALIGN.next===1)showModeToast('SIRIUS LOCKED\nSHIFT FOCUS TO ORION · BELT: ALNITAK → MINTAKA',null,2600);
      else if(ALIGN.next===S.length-1)showModeToast('BELT LOCKED\nSHIFT CAMERA FOCUS TO TAURUS',null,2200);
    }
    /* Sirius/Aldebaran punya SFX sendiri: kalau rasinya sudah unlock, langkah tetap dihitung tapi SFX-nya boleh bunyi normal. */
    if(c.id!=='orion'&&UNLOCK.set[c.id])return false;
    return 'step';
  }
  if(typeof haptic==='function')haptic(4);             /* langkah benar tapi kamera belum di sektor yang tepat */
  return false;
}
/* Bintang audio-trigger (Rigel, Betelgeuse, Sirius, Aldebaran, Arcturus, Antares) punya tombol
   DOM sendiri (#xxx-fx) yang nangkep tap sebelum handler canvas. Tanpa jembatan ini, tap di situ
   cuma bunyiin SFX dan nggak pernah dihitung sebagai langkah alignment. Return = hasil alignTapStar. */
function alignFx(key){
  try{
    var tr=(typeof TRIGGERS!=='undefined')?TRIGGERS[key]:null;
    if(!tr||tr.cons==='pleiades')return false;
    var c=cons(tr.cons);if(!c)return false;
    return alignTapStar(c,tr.star);
  }catch(err){}
  return false;
}
/* Handler tombol #xxx-fx: langkah alignment cuma dihitung; SFX cuma bunyi kalau bukan langkah alignment
   (atau di langkah terakhir, yang sudah dibunyikan oleh alignTapStar). */
function fxTap(key){
  if(SW)return;
  if(alignFx(key))return;
  triggerSupernova(key);
}
function updateAlignmentDim(now){
  if(ALIGN.cid){
    var fid=camFocusId();
    if(ALIGN.cid==='pleiades'&&fid!==updateAlignmentDim._f)ALIGN.last=performance.now(); /* pindah sektor = bagian dari chain */
    updateAlignmentDim._f=fid;
    if(!CAMERA_MODE||(ALIGN.cid!=='pleiades'&&fid!==ALIGN.cid)){
      endAlignment(false);                             /* keluar kamera / pindah fokus: batal diam-diam */
    }else if(performance.now()-ALIGN.last>(ALIGN.idle||ALIGN_IDLE_MS)){
      endAlignment(false);
      if(typeof showModeToast==='function')showModeToast('ALIGNMENT TIMED OUT',null,1400);
    }else{ALIGN.dim=1;return;}
  }
  var floor=(typeof CF!=='undefined'&&CF.active)?.78:0;
  if(ALIGN.dim>floor)ALIGN.dim=Math.max(floor,ALIGN.dim-0.022);else ALIGN.dim=floor;
}

/* ---------- V5: constellation sweep -> individual star twinkle ----------
   Logic-only scanner. It uses the CURRENT screen positions of the active
   constellation, so it remains safe even on the very first render frame.
   Also drives the Pleiades cluster when Pleione SFX is active.
   Focus is ONLY active while an SFX is playing — fresh open / idle = all dim. */
var SWEEP={active:null,t:0,cycle:0,dir:1,angle:0,ready:false};
function resetSweep(id){
  SWEEP.active=id;SWEEP.t=0;SWEEP.cycle=0;SWEEP.dir=Math.random()<.5?1:-1;
  SWEEP.angle=(SWEEP.dir<0?-1:1)*(.30+Math.random()*.34);SWEEP.ready=false;
  for(var ci=0;ci<CONS.length;ci++)for(var sk in CONS[ci].stars){
    CONS[ci].stars[sk]._tw=0;CONS[ci].stars[sk]._twHit=-1;
  }
  PLEIADES.bright.forEach(function(st){st._tw=0;st._twHit=-1;});
  PLEIADES.dim.forEach(function(st){st._tw=0;st._twHit=-1;});
}
function playingConstellationId(){
  if(typeof activeSfx==='undefined'||!activeSfx||activeSfx.paused||activeSfx.ended)return null;
  if(activeSfx===SFX.betel||activeSfx===SFX.rigel)return 'orion';
  if(activeSfx===SFX.spica)return 'virgo';
  if(activeSfx===SFX.sirius)return 'canis';
  if(activeSfx===SFX.pleione)return 'pleiades';
  if(activeSfx===SFX.aldebaran)return 'taurus';
  if(activeSfx===SFX.arcturus)return 'bootes';
  if(activeSfx===SFX.antares)return 'scorpius';
  return null;
}
/* ---------- Gravitational time dilation (Schwarzschild) ----------
   Gargantua is the massive body, the constellation whose SFX is playing is the clock.
   Static-observer factor  dtau/dt = sqrt(1 - rs/r)   (r = distance BH <-> constellation centre, rs = 0.35*BH.R, only when dragged off home).
   The factor drives the SFX playbackRate (pitch follows - preservesPitch off) and a per-constellation
   visual clock (twinkle / sway / pulse phases). Floor 0.25 = lowest rate browsers play reliably. */
var TD={rate:1,a:null,last:0,lag:{},f:1};
function tdRelease(){
  if(TD.a){try{TD.a.playbackRate=1;}catch(e){}}
  TD.a=null;TD.rate=1;TD.f=1;
}
function updateTimeDilation(now){
  var dt=Math.min(50,Math.max(0,now-(TD.last||now)));TD.last=now;
  var cid=playingConstellationId(),a=cid?activeSfx:null;
  if(TD.a&&TD.a!==a)tdRelease();
  if(!a){return;}
  if(TD.a!==a){TD.a=a;TD.rate=1;
    try{a.preservesPitch=false;a.mozPreservesPitch=false;a.webkitPreservesPitch=false;}catch(e){}}
  var gm=focusGeom(cid),target=1;
  if(gm&&BH.R>0&&BHSC>.05){
    /* rs is a small fraction of the visual radius, and the effect only engages once Gargantua has been
       moved off its home spot (idle = everything stays at normal speed). */
    /* Relative geometry on screen: dragging the sky moves the constellation toward Gargantua too, unless
       Gargantua rides along with the sky (camera mode, BHK=1) - then the pan cancels out. */
    var px=skyPan.x*(1-BHK),py=skyPan.y*(1-BHK);
    var d=Math.hypot(gm.x+px-BH.x,gm.y+py-BH.y),ratio=(BH.R*BHSC*.35)/Math.max(d,1e-3);
    target=ratio>=1?0:Math.sqrt(1-ratio);
    var disp=Math.hypot(px-(BH.x-BH.hx),py-(BH.y-BH.hy)),k=Math.max(0,Math.min(1,(disp-10)/50));
    target=1-(1-target)*k;
  }
  target=Math.max(.25,Math.min(1,target));
  TD.f=target;
  /* frame-rate independent smoothing */
  TD.rate+=(target-TD.rate)*(1-Math.pow(.001,dt/1000));
  if(Math.abs(a.playbackRate-TD.rate)>.004){try{a.playbackRate=TD.rate;}catch(e){}}
  if(!IS_POTATO)TD.lag[cid]=(TD.lag[cid]||0)+(1-TD.rate)*dt;
}
function updateConstellationFocus(now){
  var playing=playingConstellationId();
  /* Strict focus: only the constellation whose SFX is currently playing is lit.
     Fresh open / after any SFX ends → aid null → everything stays dim. */
  CF.active=playing;
  var aid=CF.active;
  var dt=Math.min(50,Math.max(0,now-(CF.lastNow||now)));
  for(var i=0;i<CONS.length;i++){
    var on=!!(aid&&CONS[i].id===aid);
    CF.target[i]=on?1:.24;
    var k=1-Math.pow(.001,dt/420);CF.current[i]+=(CF.target[i]-CF.current[i])*k;
  }
  if(aid){
    if(SWEEP.active!==aid)resetSweep(aid);
    if(aid==='pleiades'){
      /* Sweep across the Pleiades cluster using live screen positions. */
      if(!PLEIADES.ready){CF.lastNow=now;return;}
      var ox=mouse.x*1.4+skyPan.x,oy=mouse.y*1.0+skyPan.y;
      var minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
      var pts=[];
      function collect(st){
        var sx=PLEIADES.x+st.x*PLEIADES.scale+ox,sy=PLEIADES.y+st.y*PLEIADES.scale+oy;
        pts.push({st:st,x:sx,y:sy});
        if(sx<minX)minX=sx;if(sx>maxX)maxX=sx;
        if(sy<minY)minY=sy;if(sy>maxY)maxY=sy;
      }
      PLEIADES.bright.forEach(collect);
      PLEIADES.dim.forEach(collect);
      if(isFinite(minX)&&isFinite(maxX)&&isFinite(minY)&&isFinite(maxY)){
        var cx=(minX+maxX)*.5,cy=(minY+maxY)*.5;
        var hw=Math.max(1,(maxX-minX)*.5),hh=Math.max(1,(maxY-minY)*.5);
        var angle=SWEEP.angle,dy=Math.sin(angle),dx=Math.cos(angle),nx=-dy,ny=dx;
        var extent=Math.abs(nx)*hw+Math.abs(ny)*hh;
        var margin=Math.max(10,Math.sqrt(hw*hw+hh*hh)*.18);
        var travel=extent+margin*2;
        SWEEP.t+=dt*(IS_POTATO?.00011:.00014);
        if(!SWEEP.ready){SWEEP.t=0;SWEEP.ready=true;}
        if(SWEEP.t>=1){
          SWEEP.t=0;SWEEP.cycle++;SWEEP.dir=SWEEP.dir<0?1:-1;
          SWEEP.angle=(SWEEP.dir<0?-1:1)*(.30+Math.random()*.34);
          angle=SWEEP.angle;dy=Math.sin(angle);dx=Math.cos(angle);nx=-dy;ny=dx;
        }
        var offset=-extent-margin+travel*SWEEP.t;
        var hitBand=Math.max(3.5,Math.min(8,Math.sqrt(hw*hw+hh*hh)*.06));
        pts.forEach(function(p){
          var relx=p.x-cx,rely=p.y-cy;
          var perpendicular=relx*nx+rely*ny;
          if(Math.abs(perpendicular-offset)<=hitBand&&p.st._twHit!==SWEEP.cycle){p.st._twHit=SWEEP.cycle;p.st._tw=1;}
          if(p.st._tw>0)p.st._tw=Math.max(0,p.st._tw-dt/520);
        });
      }
    }else{
      var c=cons(aid);
      if(c){
        var minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
        Object.keys(c.stars).forEach(function(key){
          var st=c.stars[key];
          if(isFinite(st.x)&&isFinite(st.y)){
            if(st.x<minX)minX=st.x;if(st.x>maxX)maxX=st.x;
            if(st.y<minY)minY=st.y;if(st.y>maxY)maxY=st.y;
          }
        });
        if(isFinite(minX)&&isFinite(maxX)&&isFinite(minY)&&isFinite(maxY)){
          var cx=(minX+maxX)*.5,cy=(minY+maxY)*.5;
          var hw=Math.max(1,(maxX-minX)*.5),hh=Math.max(1,(maxY-minY)*.5);
          var angle=SWEEP.angle,dy=Math.sin(angle),dx=Math.cos(angle),nx=-dy,ny=dx;
          var extent=Math.abs(nx)*hw+Math.abs(ny)*hh;
          var margin=Math.max(14,Math.sqrt(hw*hw+hh*hh)*.16);
          var travel=extent+margin*2;
          SWEEP.t+=dt*(IS_POTATO?.000095:.000125);
          if(!SWEEP.ready){SWEEP.t=0;SWEEP.ready=true;}
          if(SWEEP.t>=1){
            SWEEP.t=0;SWEEP.cycle++;SWEEP.dir=SWEEP.dir<0?1:-1;
            SWEEP.angle=(SWEEP.dir<0?-1:1)*(.30+Math.random()*.34);
            angle=SWEEP.angle;dy=Math.sin(angle);dx=Math.cos(angle);nx=-dy;ny=dx;
          }
          var offset=-extent-margin+travel*SWEEP.t;
          var hitBand=Math.max(4.5,Math.min(9,Math.sqrt(hw*hw+hh*hh)*.045));
          Object.keys(c.stars).forEach(function(key){
            var st=c.stars[key];if(!isFinite(st.x)||!isFinite(st.y))return;
            var relx=st.x-cx,rely=st.y-cy;
            var perpendicular=relx*nx+rely*ny;
            if(Math.abs(perpendicular-offset)<=hitBand&&st._twHit!==SWEEP.cycle){st._twHit=SWEEP.cycle;st._tw=1;}
            if(st._tw>0)st._tw=Math.max(0,st._tw-dt/520);
          });
        }
      }
    }
  }
  CF.lastNow=now;
  if(typeof updateAlignmentDim==='function')updateAlignmentDim(now);
}
function constellationFocus(c){var i=CONS.indexOf(c);return i<0?1:CF.current[i];}
function constellationTwinkle(c){var i=CONS.indexOf(c);return i<0?1:CF.tw[i];}
function cons(id){for(var i=0;i<CONS.length;i++)if(CONS[i].id===id)return CONS[i];}
function clockText(){
  var now=new Date(),h=now.getUTCHours(),m=now.getUTCMinutes(),sec=now.getUTCSeconds();
  var ap=h<12?'AM':'PM',hh=h%12;if(hh===0)hh=12;
  return (hh<10?'0':'')+hh+':'+(m<10?'0':'')+m+':'+(sec<10?'0':'')+sec+' '+ap;
}
function tickClock(force){
  var el=$('#bh-clock');
  if(!el)return;
  if(!force&&typeof CLKD!=='undefined'&&CLKD&&CLKD.active)return;
  var now=new Date();
  var days=['SUN','MON','TUE','WED','THU','FRI','SAT'];
  var months=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  var day=days[now.getUTCDay()],date=now.getUTCDate(),mon=months[now.getUTCMonth()];
  var time=clockText();
  el.innerHTML='<span>'+day+' '+date+' '+mon+' UTC</span><span class="clock-sep">·</span><span class="clock-time">'+time+'</span>';
}
PORTALS.forEach(function(p){
  p.c=cons(p.cons);p.h=0;
  var a=document.createElement('a');a.className='portal';a.href=p.href;
  a.innerHTML='<span class="lab"><b></b><small></small><em class="lab-open">OPEN →</em></span>';
  a.querySelector('b').textContent=p.title;a.querySelector('small').textContent=p.sub;
  var h=document.createElement('button');
  h.type='button';
  h.className='hit portal-hit';
  h.setAttribute('aria-label','Toggle portal '+p.title);
  if(p.ext){a.target='_blank';a.rel='noopener';}
  [a,h].forEach(function(el){
    el.addEventListener('mouseenter',function(){hot=p.id;a.classList.add('hot');});
    el.addEventListener('mouseleave',function(){if(hot===p.id)hot=null;a.classList.remove('hot');});
    el.addEventListener('focus',function(){hot=p.id;});
    el.addEventListener('blur',function(){if(hot===p.id)hot=null;});
  });
  h.addEventListener('click',function(e){
    e.preventDefault();
    e.stopPropagation();
    a.classList.toggle('mobile-show');
    haptic(8);
  });
  var _stg=document.getElementById('stage')||document.body;_stg.appendChild(h);_stg.appendChild(a);
  p.el=a;p.hitEl=h;
});

/* ---------- judul selalu muat di layar, font apa pun yang kepakai ---------- */
function fitTitle(){
  var big=$('.big'),avail=Math.max(0,(STG.vw||innerWidth)-32),minSize=14;
  var size=Math.min((STG.vw||innerWidth)*.07,(STG.vh||innerHeight)*.10,56);
  var rg=document.createRange();rg.selectNodeContents(big);
  big.style.fontSize=size+'px';
  var measured=rg.getBoundingClientRect().width;
  if(measured<=avail)return;
  /* Proportional estimate first — usually lands within a few px of the fit. */
  var estimated=Math.max(minSize,Math.floor(size*(avail/measured)));
  big.style.fontSize=estimated+'px';
  /* Safety correction: browser remains the authority (font metrics ≠ pure scale). */
  var guard=0;
  while(rg.getBoundingClientRect().width>avail&&estimated>minSize&&guard++<4){
    estimated--;
    big.style.fontSize=estimated+'px';
  }
}
/* ---------- layout ---------- */
var BG=[],SS=[],PU=[],AST=[],GAL=[],nextSS=0,nextPU=0,bgW=0,bgH=0;
/* Pre-baked asteroid rock sprites (shape is static; only transform changes per frame). */
var AST_SPRITES=null,AST_SPRITE_R=24;
var bgCanvas=null,bgCtx=null,bgDirty=true,HUD=null;
/* Tactical HUD (LAT/LON/AZ/EL): fixed ke layar, nggak ikut geser/zoom canvas. Vektor kecil, murah. */
function drawHud(){
  if(!HUD)return;
  var m=HUD.m,len=HUD.len,t=HUD.top,b=H-HUD.bot;
  g.save();
  g.strokeStyle='rgba(110,229,255,0.22)';g.fillStyle='rgba(110,229,255,0.18)';g.lineWidth=1;
  g.font='600 8px "Courier New",monospace';
  g.beginPath();
  g.moveTo(m,t+len);g.lineTo(m,t);g.lineTo(m+len,t);
  g.moveTo(W-m-len,t);g.lineTo(W-m,t);g.lineTo(W-m,t+len);
  g.moveTo(m,b-len);g.lineTo(m,b);g.lineTo(m+len,b);
  g.moveTo(W-m-len,b);g.lineTo(W-m,b);g.lineTo(W-m,b-len);
  g.stroke();
  g.textBaseline='top';g.textAlign='left';g.fillText('[ LAT 00\u00b000\u2032N ]',m+4,t+4);
  g.textAlign='right';g.fillText('[ LON 000\u00b000\u2032E ]',W-m-4,t+4);
  g.textBaseline='bottom';g.textAlign='left';g.fillText('[ AZ 000\u00b0 ]',m+4,b-4);
  g.textAlign='right';g.fillText('[ EL 00\u00b0 ]',W-m-4,b-4);
  g.restore();
}
/* Astrophotography plate: deep layer (dust/band/galaxies) + mid layer (stars/HUD/grid), both baked offscreen. */
var plateDeep=null,plateM=28,plateDPR=0;
/* Dust depth layers: 2 transparent plates baked ONCE at low res, drifting on sine paths with
   their own parallax speed. Per-frame cost = 2 drawImage; nothing is re-rendered. */
var plateDust=[];
function bakeDustLayers(M,EW,EH){
  plateDust=[];
  if(IS_POTATO)return; /* low-end devices: keep the single deep plate, no extra layers */
  var ds=Math.min(DPR,.5);
  /* far = cool/slow/wide, near = warm/faster/tighter. Parallax stays below the star layer (.35)
     so depth ordering matches speed ordering. */
  var defs=[
    {seed:0xD0571,n:6,rmin:.38,rmax:.62,a:[.035,.055],cols:['110,160,255','140,120,230','110,229,255'],par:.21,amp:10,per:95,zf:.70},
    {seed:0xD0572,n:7,rmin:.22,rmax:.42,a:[.030,.050],cols:['255,122,217','255,196,140','140,120,230'],par:.29,amp:18,per:62,zf:.85}
  ];
  for(var li=0;li<defs.length;li++){
    var d=defs[li],rnd=plateRng(d.seed),cvs=document.createElement('canvas');
    cvs.width=Math.max(1,Math.round(EW*ds));cvs.height=Math.max(1,Math.round(EH*ds));
    var c=cvs.getContext('2d');c.setTransform(ds,0,0,ds,M*ds,M*ds);
    for(var i=0;i<d.n;i++){
      var x=(.12+rnd()*.76)*W,y=(.10+rnd()*.80)*H,r=(d.rmin+rnd()*(d.rmax-d.rmin))*Math.max(W,H)*.5;
      var col=d.cols[(rnd()*d.cols.length)|0],al=d.a[0]+rnd()*(d.a[1]-d.a[0]);
      c.save();c.translate(x,y);c.rotate((rnd()-.5)*1.6);c.scale(1,.35+rnd()*.3);
      var gr=c.createRadialGradient(0,0,0,0,0,r);
      gr.addColorStop(0,'rgba('+col+','+al+')');gr.addColorStop(.5,'rgba('+col+','+(al*.42)+')');gr.addColorStop(1,'rgba('+col+',0)');
      c.fillStyle=gr;c.beginPath();c.arc(0,0,r,0,6.283);c.fill();c.restore();
    }
    plateDust.push({c:cvs,par:d.par,amp:d.amp,per:d.per,zf:d.zf,ph:li*2.1});
  }
}
var TELESCOPE={phase:1.7,init:false,x:0,y:0,vx:0,vy:0,tx:0,ty:0,ang:0,va:0,next:0,mode:'drift',targetX:0,targetY:0,orbitAngle:0,onWarpComplete:null,sx:0,sy:0,hitR:40,al:1,away:false,orbitR:38,followKind:null,followSect:null,busyShown:false};
function telescopeHitRadius(){
  /* Generous mobile-friendly target; scales a bit with viewport. */
  var base=(typeof touchMode!=='undefined'&&touchMode)?48:36;
  return Math.max(base,Math.min(64,(W||360)*0.09));
}
/* ---------- Astrophotography Plate (long-exposure look) ----------
   Two offscreen layers are painted once (boot / resize / DPR change) and then only
   blitted per frame with parallax offsets -- no per-star work in the RAF loop.
   L0 deep : cosmological dust, Milky-Way band, distant galaxies, vignette, film grain
   L1 mid  : crisp stars (+ faint band field, diffraction spikes), RA/Dec grid, HUD reticles
   Both carry a safe margin so parallax never exposes an edge. */
function plateRng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;var t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function bakeAstroPlates(){
  var M=plateM=Math.round(Math.max(24,Math.min(48,Math.min(W,H)*.07)));
  var EW=W+2*M,EH=H+2*M,rnd=plateRng(0x5EED17),cx0=W*.5,cy0=H*.5,BA=-.5,bt=Math.min(W,H)*.32;
  plateDPR=DPR;
  /* ===== L0 deep plate (opaque, reduced resolution: it is soft by design) ===== */
  var ds=Math.min(DPR,IS_POTATO?.5:.75);
  plateDeep=document.createElement('canvas');
  plateDeep.width=Math.max(1,Math.round(EW*ds));plateDeep.height=Math.max(1,Math.round(EH*ds));
  var dc=plateDeep.getContext('2d',{alpha:false});
  dc.setTransform(ds,0,0,ds,M*ds,M*ds);
  dc.fillStyle='#050b12';dc.fillRect(-M,-M,EW,EH);
  /* cosmological dust: wide, low-alpha tinted clouds */
  var dust=[[.20,.30,.55,'110,229,255',.050,.4],[.80,.22,.50,'255,122,217',.040,-.3],[.62,.72,.60,'110,160,255',.050,.2],[.14,.84,.45,'255,196,140',.034,-.5],[.50,.48,.70,'140,120,230',.030,.1]];
  for(var di=0;di<dust.length;di++){
    var dd=dust[di],dr=dd[2]*Math.max(W,H)*.5,dg;
    dc.save();dc.translate(dd[0]*W,dd[1]*H);dc.rotate(dd[5]);dc.scale(1,.55);
    dg=dc.createRadialGradient(0,0,0,0,0,dr);
    dg.addColorStop(0,'rgba('+dd[3]+','+dd[4]+')');dg.addColorStop(.55,'rgba('+dd[3]+','+(dd[4]*.45)+')');dg.addColorStop(1,'rgba('+dd[3]+',0)');
    dc.fillStyle=dg;dc.beginPath();dc.arc(0,0,dr,0,6.283);dc.fill();
    dc.restore();
  }
  /* Milky-Way band: diagonal glow + mottled bright knots + dark dust lanes */
  dc.save();dc.translate(cx0,cy0);dc.rotate(BA);
  var bw=Math.max(W,H)*1.1,bgr=dc.createLinearGradient(0,-bt,0,bt);
  bgr.addColorStop(0,'rgba(170,200,255,0)');bgr.addColorStop(.5,'rgba(185,205,255,.075)');bgr.addColorStop(1,'rgba(170,200,255,0)');
  dc.fillStyle=bgr;dc.fillRect(-bw,-bt,bw*2,bt*2);
  var knots=IS_POTATO?10:22,k,kx,ky,kr,kg;
  for(k=0;k<knots;k++){
    kx=(rnd()*2-1)*bw*.9;ky=(rnd()*2-1)*bt*.55;kr=bt*(.18+rnd()*.30);
    kg=dc.createRadialGradient(kx,ky,0,kx,ky,kr);
    kg.addColorStop(0,'rgba(205,218,255,'+(.035+rnd()*.03).toFixed(3)+')');kg.addColorStop(1,'rgba(205,218,255,0)');
    dc.fillStyle=kg;dc.beginPath();dc.arc(kx,ky,kr,0,6.283);dc.fill();
  }
  var lanes=IS_POTATO?6:14;
  for(k=0;k<lanes;k++){
    kx=(rnd()*2-1)*bw*.9;ky=(rnd()*2-1)*bt*.4;kr=bt*(.10+rnd()*.20);
    kg=dc.createRadialGradient(kx,ky,0,kx,ky,kr);
    kg.addColorStop(0,'rgba(5,11,18,.42)');kg.addColorStop(1,'rgba(5,11,18,0)');
    dc.fillStyle=kg;dc.save();dc.translate(kx,ky);dc.scale(2.2,1);dc.translate(-kx,-ky);dc.beginPath();dc.arc(kx,ky,kr,0,6.283);dc.fill();dc.restore();
  }
  dc.restore();
  /* distant galaxies (same recipe as before, now living on the deep plate) */
    var gCount=IS_POTATO?4:GAL.length;
    for(var gi=0;gi<gCount;gi++){
      var gd=GAL[gi],px=gd.x*W,py=gd.y*H,w=(6+5*gd.scale),h=(2.6+2.4*gd.scale);
      dc.save();dc.translate(px,py);dc.rotate(gd.rot);
      var gc=gd.col||{core:'255,225,185',outer:'205,225,255',halo:'135,175,230'};
      var gh=dc.createRadialGradient(0,0,0,0,0,w*1.9);
      gh.addColorStop(0,'rgba('+gc.core+',.20)');gh.addColorStop(.30,'rgba('+gc.outer+',.09)');gh.addColorStop(.68,'rgba('+gc.halo+',.045)');gh.addColorStop(1,'rgba('+gc.halo+',0)');
      dc.fillStyle=gh;dc.globalAlpha=.78;dc.beginPath();dc.ellipse(0,0,w*1.7,h*1.8,0,0,6.283);dc.fill();
      dc.globalAlpha=.22;dc.strokeStyle='rgba('+gc.outer+',.82)';dc.lineWidth=.5;dc.beginPath();dc.ellipse(0,0,w,h,.06,0,6.283);dc.stroke();
      dc.fillStyle='rgba('+gc.core+',.30)';dc.beginPath();dc.ellipse(0,0,Math.max(.8,w*.17),Math.max(.55,h*.24),0,0,6.283);dc.fill();
      /* Dust lane: thin dark ellipse bisecting the bright core (edge-on spiral feel) */
      dc.globalAlpha=1;
      dc.fillStyle='rgba(5,11,18,0.45)';
      dc.beginPath();dc.ellipse(0,0,w*1.2,h*0.15,0,0,6.283);dc.fill();
      dc.restore();
    }
    /* vignette: lens falloff of a long-exposure plate */
  var vg=dc.createRadialGradient(cx0,cy0,Math.min(W,H)*.35,cx0,cy0,Math.hypot(W,H)*.62);
  vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.38)');
  dc.fillStyle=vg;dc.fillRect(-M,-M,EW,EH);
  /* film grain: one tiny noise tile, drawn in device pixels (skipped on potato) */
  if(!IS_POTATO){
    var gt=document.createElement('canvas');gt.width=gt.height=96;
    var gx=gt.getContext('2d'),gi=gx.createImageData(96,96),gd=gi.data,gv;
    for(var pi=0;pi<gd.length;pi+=4){gv=(rnd()*255)|0;gd[pi]=gd[pi+1]=gd[pi+2]=gv;gd[pi+3]=255;}
    gx.putImageData(gi,0,0);
    dc.save();dc.setTransform(1,0,0,1,0,0);dc.globalAlpha=.022;dc.fillStyle=dc.createPattern(gt,'repeat');
    dc.fillRect(0,0,plateDeep.width,plateDeep.height);dc.restore();
  }
  /* ===== L1 mid plate (transparent, full DPR so stars stay crisp) ===== */
  bgCanvas=document.createElement('canvas');
  bgCanvas.width=Math.max(1,Math.round(EW*DPR));bgCanvas.height=Math.max(1,Math.round(EH*DPR));
  bgCtx=bgCanvas.getContext('2d');
  bgCtx.setTransform(DPR,0,0,DPR,M*DPR,M*DPR);
  var i,bb;
  for(i=0;i<BG.length;i++){
    bb=BG[i];
    bgCtx.fillStyle='rgba('+bb.c+','+bb.a+')';
    bgCtx.beginPath();bgCtx.arc(bb.x,bb.y,bb.r,0,6.283);bgCtx.fill();
  }
  /* margin ring: BG only covers the viewport, so top up the parallax margin with the same density */
  var nR=Math.round(BG.length*((EW*EH)/(W*H)-1)),ex,ey;
  for(i=0;i<nR;i++){
    ex=rnd()*EW-M;ey=rnd()*EH-M;
    if(ex>=0&&ex<=W&&ey>=0&&ey<=H)continue;
    bgCtx.fillStyle='rgba(234,246,255,'+(.28+rnd()*.4).toFixed(2)+')';
    bgCtx.beginPath();bgCtx.arc(ex,ey,.4+rnd()*.6,0,6.283);bgCtx.fill();
  }
  /* faint field: dim stars crowded toward the Milky-Way band (long-exposure depth) */
  var nF=IS_POTATO?50:Math.min(380,Math.round(W*H/2800)),tries=nF*4,cs=['190,225,255','255,224,190','234,246,255'],bd;
  for(i=0;i<tries&&nF>0;i++){
    ex=rnd()*EW-M;ey=rnd()*EH-M;
    bd=-(ex-cx0)*Math.sin(BA)+(ey-cy0)*Math.cos(BA);
    if(rnd()>.22+.78*Math.exp(-(bd*bd)/(bt*bt*1.4)))continue;
    nF--;
    bgCtx.fillStyle='rgba('+cs[(rnd()*3)|0]+','+(.10+rnd()*.20).toFixed(2)+')';
    bgCtx.beginPath();bgCtx.arc(ex,ey,.28+rnd()*.30,0,6.283);bgCtx.fill();
  }
  /* diffraction spikes + bloom on the brightest plate stars (skipped on potato) */
  if(!IS_POTATO){
    var sp=0,sx,sy,sl,sg,rgb;
    for(i=0;i<BG.length&&sp<6;i++){
      bb=BG[i];if(bb.r<1.4)continue;sp++;
      sx=bb.x;sy=bb.y;sl=8+rnd()*8;rgb=bb.c;
      sg=bgCtx.createRadialGradient(sx,sy,0,sx,sy,bb.r*6);
      sg.addColorStop(0,'rgba('+rgb+',.30)');sg.addColorStop(1,'rgba('+rgb+',0)');
      bgCtx.fillStyle=sg;bgCtx.beginPath();bgCtx.arc(sx,sy,bb.r*6,0,6.283);bgCtx.fill();
      bgCtx.save();bgCtx.translate(sx,sy);bgCtx.rotate(.12);bgCtx.strokeStyle='rgba('+rgb+',.26)';bgCtx.lineWidth=.6;
      bgCtx.beginPath();bgCtx.moveTo(-sl,0);bgCtx.lineTo(sl,0);bgCtx.moveTo(0,-sl);bgCtx.lineTo(0,sl);bgCtx.stroke();
      bgCtx.restore();
    }
  }
    /* Observatory HUD corner reticles: sengaja TIDAK di-bake ke bgCanvas (itu ikut parallax/pan/zoom).
       Cuma hitung geometri di sini; digambar fixed di layar lewat drawHud() tiap frame. */
    (function(){
      var m=Math.max(10,Math.min(18,W*.035)),len=Math.min(22,Math.max(16,Math.min(W,H)*.055));
      HUD={m:m,len:len,top:Math.max(44,Math.min(88,H*.105)),bot:Math.max(42,Math.min(82,H*.105))};
    })();

    /* Equatorial RA/Dec grid — baked into bgCanvas, so it is redrawn only
       when the static background is rebuilt (boot/resize), never per RAF. */
    (function(){
      bgCtx.save();
      bgCtx.strokeStyle='rgba(110,229,255,.035)';
      bgCtx.lineWidth=.7;
      bgCtx.setLineDash([4,8]);

      /* Declination lines. */
      for(var dec=.2;dec<1;dec+=.2){
        bgCtx.beginPath();
        bgCtx.moveTo(0,H*dec);
        bgCtx.lineTo(W,H*dec);
        bgCtx.stroke();
      }

      /* Right Ascension meridians: restrained ellipses give the sky-map feel. */
      for(var ra=-.2;ra<=1.2;ra+=.35){
        bgCtx.beginPath();
        bgCtx.ellipse(W*ra,H*.5,W*.25,H*.8,.2,0,6.283);
        bgCtx.stroke();
      }
      bgCtx.setLineDash([]);
      bgCtx.restore();
    })();

  bakeDustLayers(M,EW,EH);
}
/* One layer blit: zoom about screen centre (deep layer zooms less => parallax depth) + offset. */
function plateBlit(c,m,pw,ph,z,ox,oy){
  if(z!==1){var cx=W*.5,cy=H*.5;g.save();g.translate(cx,cy);g.scale(z,z);g.translate(-cx+ox,-cy+oy);g.drawImage(c,-m,-m,pw,ph);g.restore();}
  else g.drawImage(c,ox-m,oy-m,pw,ph);
}

function layout(){
  if(SW)return;
  W=stageCalc();H=STG.vh;
  try{document.body.classList.toggle('cam-compact',H<=560&&W>=H*1.3);_cb.h=0;document.body.classList.toggle('touch-short',H<=560&&!!(window.matchMedia&&matchMedia('(pointer:coarse)').matches));}catch(e){}
  DPR=(IS_POTATO?1:Math.min(window.devicePixelRatio||1,2))*(STG.on?STG.k:1);
  G_DEPTH=0;cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);g.setTransform(DPR,0,0,DPR,0,0);
  fitTitle();
  var hb=vrect($('#header')).bottom,ft=vrect($('#footer')).top;
  var top=hb+10,bot=ft-8,ah=Math.max(120,bot-top),portrait=W<H*1.05;
  /* Gargantua's home position/radius, needed up front so Boötes and the
     Pleiades can be nudged clear of it right after they're placed below. */
  BH.R=portrait?Math.min(30,W*.075):Math.min(30,ah*.11);
  BH.hx=W*.5;BH.hy=portrait?top+ah*.48:top+ah*.44;
  /* Canis Major: small + high, far from Gargantua to avoid lens stretch.
     Size kept comparable to Orion / Virgo. */
  /* Taurus: mid-left lower (horns left, tail right) — Hyades LOCK coords scaled into box. */
  /* 4-Zone Landscape Layout Optimization */
  var boxes=portrait
    ?{canis:[W*.04,top+ah*.14,W*.18,top+ah*.32],
      virgo:[W*.52,top+ah*.72,W*.82,bot-34],
      orion:[W*.32,top-ah*.02,W*.64,top+ah*.32],
      taurus:[W*.12,top+ah*.64,W*.42,top+ah*.92],
      /* Scorpius top-right of Orion. Boötes = smaller kite, shifted further down. */
      bootes:[W*.78,top+ah*.52,W*.90,top+ah*.66],
      scorpius:[W*.76,top+ah*.05,W*.88,top+ah*.28]}
    :{canis:[W*.02,top+ah*.08,W*.10,top+ah*.34],
      taurus:[W*.02,top+ah*.48,W*.15,bot-28],
      orion:[W*.22,top+ah*.02,W*.37,bot-12],
      virgo:[W*.72,top+ah*.08,W*.96,bot-12],
      /* Boötes smaller + shifted further down, clear of BH column and Virgo. */
      bootes:[W*.62,top+ah*.18,W*.70,top+ah*.38],
      /* Scorpius left of centre but outside strong BH lens zone. */
      scorpius:[W*.34,top+ah*.12,W*.42,top+ah*.44]};
  CONS.forEach(function(c){
    var b=boxes[c.id],bw=b[2]-b[0],bh=b[3]-b[1],sc=Math.min(bw/c.bw,bh/c.bh);
    var x0=b[0]+(bw-c.bw*sc)/2,y0=b[1]+(bh-c.bh*sc)/2;
    c.scale=sc;c.maxX=-1e9;c.maxY=-1e9;c.minY=1e9;c.minX=1e9;
    Object.keys(c.stars).forEach(function(k){
      var s=c.stars[k];s.x=x0+(s.rx-c.minx)*sc;s.y=y0+(s.ry-c.miny)*sc;
      c.maxX=Math.max(c.maxX,s.x);c.maxY=Math.max(c.maxY,s.y);c.minY=Math.min(c.minY,s.y);c.minX=Math.min(c.minX,s.x);
    });
    if(c.nebula){c.nebula.x=x0+(c.nebula.rx-c.minx)*sc;c.nebula.y=y0+(c.nebula.ry-c.miny)*sc;}
  });
  /* ---- Sektor Orion: komposisi ngikut gambar referensi ----
     Orion, Taurus, Canis Major dipasang lewat transformasi kesamaan (geser + putar + skala seragam) => BENTUK rasi tidak berubah,
     cuma posisi & rotasinya. Garis lurus alignment: Sirius -> sabuk Orion -> Aldebaran -> Pleiades.
     Koordinat scene = peta bintang referensi (kira-kira 1000x830, y ke bawah), lalu di-fit ke layar. */
  var SCN=(function(){
    var D=Math.PI/180,
        def={/* Orion diputar -29.85° mengelilingi Alnilam (pv/at): sabuk sejajar garis Sirius→Aldebaran, Alnilam tetap di garis */
             orion:{k:.7738,th:-23.84,pv:[492,651],at:[299.86,647.23]},
             taurus:{k:.7241,th:5.3,tx:312.95,ty:-58.3},
             canis:{k:.5417,th:4,pv:[445,316],at:[3.05,938.8]}},
        PC=[745.1,209.9],PS=140,ids=['orion','taurus','canis'],pts=[],i,j,k2,c,f,p,st;
    function mk(d){
      var cs=Math.cos(d.th*D)*d.k,sn=Math.sin(d.th*D)*d.k,tx=d.tx,ty=d.ty;
      if(d.pv){tx=d.at[0]-(cs*d.pv[0]-sn*d.pv[1]);ty=d.at[1]-(sn*d.pv[0]+cs*d.pv[1]);}
      return function(x,y){return [cs*x-sn*y+tx,sn*x+cs*y+ty];};
    }
    for(i=0;i<ids.length;i++){
      c=cons(ids[i]);if(!c)return null;
      f=mk(def[ids[i]]);
      for(k2 in c.stars){st=c.stars[k2];p=f(st.rx,st.ry);st._sx=p[0];st._sy=p[1];pts.push(p);}
      if(c.nebula){p=f(c.nebula.rx,c.nebula.ry);c.nebula._sx=p[0];c.nebula._sy=p[1];}
    }
    PLEIADES.bright.concat(PLEIADES.dim).forEach(function(z){pts.push([PC[0]+(z.x-.53)*PS,PC[1]+(z.y-.42)*PS]);});
    var mnx=1e9,mxx=-1e9,mny=1e9,mxy=-1e9;
    for(j=0;j<pts.length;j++){mnx=Math.min(mnx,pts[j][0]);mxx=Math.max(mxx,pts[j][0]);mny=Math.min(mny,pts[j][1]);mxy=Math.max(mxy,pts[j][1]);}
    var m=Math.max(14,W*.04),aL=m,aR=W-m,aT=top+8,aB=bot-34,bw=mxx-mnx,bh=mxy-mny,
        fs=Math.min((aR-aL)/bw,(aB-aT)/bh),
        offx=aL+((aR-aL)-bw*fs)/2-mnx*fs,offy=aT+((aB-aT)-bh*fs)/2-mny*fs;
    for(i=0;i<ids.length;i++){
      c=cons(ids[i]);c.maxX=-1e9;c.maxY=-1e9;c.minX=1e9;c.minY=1e9;c.scale=fs*def[ids[i]].k;
      for(k2 in c.stars){
        st=c.stars[k2];st.x=offx+st._sx*fs;st.y=offy+st._sy*fs;
        c.maxX=Math.max(c.maxX,st.x);c.maxY=Math.max(c.maxY,st.y);c.minX=Math.min(c.minX,st.x);c.minY=Math.min(c.minY,st.y);
      }
      if(c.nebula){c.nebula.x=offx+c.nebula._sx*fs;c.nebula.y=offy+c.nebula._sy*fs;}
    }
    PLEIADES.scale=PS*fs;
    PLEIADES.x=offx+(PC[0]-.53*PS)*fs;
    PLEIADES.y=offy+(PC[1]-.42*PS)*fs;
    PLEIADES.ready=true;
    return {f:fs};
  })();
  /* ---- shared anti-lensing / anti-clip helpers ----
     Rather than hand-tuning fragile pixel offsets per breakpoint, both
     Boötes and the Pleiades get a runtime safety pass: measure how close
     the shape sits to Gargantua's centre, push it straight away until
     it clears a safe radius, back the push off if that would make it
     overlap a neighbouring constellation's box, then clamp the whole
     shape back inside the visible play area so nothing is ever cropped
     in odd mobile aspect ratios. */
  function rectDistToPoint(minX,maxX,minY,maxY,px,py){
    var cx=Math.max(minX,Math.min(px,maxX)),cy=Math.max(minY,Math.min(py,maxY));
    return Math.hypot(px-cx,py-cy);
  }
  function boxesOverlap(minX,maxX,minY,maxY,b){
    return minX<b[2]&&maxX>b[0]&&minY<b[3]&&maxY>b[1];
  }
  /* Straight AABB separation: shove the rect out along whichever axis needs
     the smaller nudge, away from the box's centre. Used for the shapes
     (Pleiades, mainly) whose home position is a formula rather than a
     fixed box, so an overlap can only be caught after the fact. */
  function resolveCollisions(minX,maxX,minY,maxY,allowIds){
    var rect={minX:minX,maxX:maxX,minY:minY,maxY:maxY};
    for(var pass=0;pass<6;pass++){
      var moved=false;
      for(var id in boxes){
        if(allowIds.indexOf(id)!==-1)continue;
        var b=boxes[id];
        if(!boxesOverlap(rect.minX,rect.maxX,rect.minY,rect.maxY,b))continue;
        var ox=Math.min(rect.maxX,b[2])-Math.max(rect.minX,b[0]);
        var oy=Math.min(rect.maxY,b[3])-Math.max(rect.minY,b[1]);
        if(ox<=0||oy<=0)continue;
        var dx=0,dy=0;
        if(ox<oy){var rc=(rect.minX+rect.maxX)/2,bc=(b[0]+b[2])/2;dx=(rc<bc?-1:1)*(ox+4);}
        else{var rc2=(rect.minY+rect.maxY)/2,bc2=(b[1]+b[3])/2;dy=(rc2<bc2?-1:1)*(oy+4);}
        rect.minX+=dx;rect.maxX+=dx;rect.minY+=dy;rect.maxY+=dy;moved=true;
      }
      if(!moved)break;
    }
    return{dx:rect.minX-minX,dy:rect.minY-minY};
  }
  function safePush(minX,maxX,minY,maxY,skipId){
    /* Mencegah dorongan berlebihan di layar portrait HP */
    var safeR=BH.R*(portrait?4.2:5.2);
    var d=rectDistToPoint(minX,maxX,minY,maxY,BH.hx,BH.hy);
    if(d>=safeR)return{dx:0,dy:0};
    var cx=(minX+maxX)/2,cy=(minY+maxY)/2,vx=cx-BH.hx,vy=cy-BH.hy,vl=Math.hypot(vx,vy)||1;
    var ux=vx/vl,uy=vy/vl,need=safeR-d+6,dx=ux*need,dy=uy*need;
    var cap=Math.min(W,ah)*.28,len=Math.hypot(dx,dy);
    if(len>cap){var k=cap/len;dx*=k;dy*=k;}
    var tries=0;
    while(tries<6){
      var nMinX=minX+dx,nMaxX=maxX+dx,nMinY=minY+dy,nMaxY=maxY+dy,hit=false;
      for(var id in boxes){if(id===skipId)continue;if(boxesOverlap(nMinX,nMaxX,nMinY,nMaxY,boxes[id])){hit=true;break;}}
      if(!hit)break;
      dx*=.55;dy*=.55;tries++;
    }
    return{dx:dx,dy:dy};
  }
  function shiftBootes(dx,dy){
    var bo=cons('bootes');if(!bo||(!dx&&!dy))return;
    Object.keys(bo.stars).forEach(function(k){var s=bo.stars[k];s.x+=dx;s.y+=dy;});
    bo.minX+=dx;bo.maxX+=dx;bo.minY+=dy;bo.maxY+=dy;
    if(bo.nebula){bo.nebula.x+=dx;bo.nebula.y+=dy;}
  }
  function shiftCons(id,dx,dy){
    var c=cons(id);if(!c||(!dx&&!dy))return;
    Object.keys(c.stars).forEach(function(k){var s=c.stars[k];s.x+=dx;s.y+=dy;});
    c.minX+=dx;c.maxX+=dx;c.minY+=dy;c.maxY+=dy;
    if(c.nebula){c.nebula.x+=dx;c.nebula.y+=dy;}
  }
  (function(){ /* Boötes: anti-lensing → anti-overlap → on-screen clamp */
    var bo=cons('bootes');if(!bo)return;
    var push=safePush(bo.minX,bo.maxX,bo.minY,bo.maxY,'bootes');
    shiftBootes(push.dx,push.dy);
    var coll=resolveCollisions(bo.minX,bo.maxX,bo.minY,bo.maxY,['bootes']);
    shiftBootes(coll.dx,coll.dy);
    var m=10,cx0=Math.max(0,m-bo.minX),cx1=Math.min(0,W-m-bo.maxX);
    var cy0=Math.max(0,top+8-bo.minY),cy1=Math.min(0,bot-8-bo.maxY);
    shiftBootes(cx0||cx1,cy0||cy1);
  })();
  (function(){ /* Scorpius: same anti-lensing / anti-overlap pass (landscape) */
    var sc=cons('scorpius');if(!sc)return;
    var push=safePush(sc.minX,sc.maxX,sc.minY,sc.maxY,'scorpius');
    shiftCons('scorpius',push.dx,push.dy);
    var coll=resolveCollisions(sc.minX,sc.maxX,sc.minY,sc.maxY,['scorpius']);
    shiftCons('scorpius',coll.dx,coll.dy);
    var m=10,cx0=Math.max(0,m-sc.minX),cx1=Math.min(0,W-m-sc.maxX);
    var cy0=Math.max(0,top+8-sc.minY),cy1=Math.min(0,bot-8-sc.maxY);
    shiftCons('scorpius',cx0||cx1,cy0||cy1);
  })();
  /* Pleiades: Presisi di atas Taurus/Aldebaran sesuai petunjuk */
  (function(){
    if(SCN)return; /* posisi Pleiades sudah ditentukan scene referensi */
    var ad = cons('taurus').stars.aldebaran;
    
    // Skala cluster diperkecil sedikit agar pas di ceruk Taurus
    var ps = Math.min(W, H) * (portrait ? .042 : .052);
    
    // Posisi relatif terhadap Aldebaran (geser ke kanan-bawah dikit)
    var targetX = ad.x + (portrait ? W * 0.11 : W * 0.12);
    var targetY = ad.y - (portrait ? Math.min(34, H * 0.05) : Math.min(45, H * 0.065));
    
    PLEIADES.scale = ps;
    PLEIADES.x = targetX - .5 * ps;
    PLEIADES.y = targetY - .5 * ps;
    PLEIADES.ready = true;

    var minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
    PLEIADES.bright.concat(PLEIADES.dim).forEach(function(st){
      var x = PLEIADES.x + st.x * ps, y = PLEIADES.y + st.y * ps;
      minX = Math.min(minX, x); maxX = Math.max(maxX, x);
      minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    });

    // Mendorong hanya jika terbentur Black Hole (mengabaikan Taurus agar bisa menempel)
    var push = safePush(minX, maxX, minY, maxY, 'taurus');
    PLEIADES.x += push.dx; PLEIADES.y += push.dy; 
    minX += push.dx; maxX += push.dx; minY += push.dy; maxY += push.dy;

    // Batas tepi layar (viewport margin)
    var m = 10;
    var cx0 = Math.max(0, m - minX), cx1 = Math.min(0, W - m - maxX);
    var cy0 = Math.max(0, top + 8 - minY), cy1 = Math.min(0, bot - 8 - maxY);
    PLEIADES.x += cx0 || cx1; 
    PLEIADES.y += cy0 || cy1;
  })();
  var clk=$('#bh-clock'),ft2=vrect($('#footer'));
  clk.style.transform='translate(calc(14px + env(safe-area-inset-left,0px)),'+Math.round(ft2.top-26)+'px)';
  var o=cons('orion'),v=cons('virgo'),cm=cons('canis'),tau=cons('taurus');
  CAPS.orion.style.transform='translate('+Math.round((o.minX+o.maxX)/2-30)+'px,'+Math.round(o.maxY+22)+'px)';
  CAPS.virgo.style.transform='translate('+Math.round(v.maxX-42)+'px,'+Math.round(v.minY-24)+'px)';
  CAPS.canis.style.transform='translate('+Math.round((cm.minX+cm.maxX)/2-48)+'px,'+Math.round(cm.maxY+18)+'px)';
  if(tau&&CAPS.taurus)CAPS.taurus.style.transform='translate('+Math.round((tau.minX+tau.maxX)/2-28)+'px,'+Math.round(tau.maxY+18)+'px)';
  if(!drag.on){
    if(SECT.cur&&SUM.on){var mg=Math.max(6,BH.R*BHSC*1.15);BH.x=Math.max(mg,Math.min(W-mg,BH.x));BH.y=Math.max(mg,Math.min(H-mg,BH.y));}
    else{BH.x=BH.hx;BH.y=BH.hy;}
  }
  /* Keep telescope inside the new viewport after rotation/URL-bar resize. */
  if(TELESCOPE&&TELESCOPE.init){
    var mX=Math.max(48,W*.08),mY=Math.max(56,H*.10);
    TELESCOPE.x=Math.max(mX,Math.min(W-mX,TELESCOPE.x||W*.5));
    TELESCOPE.y=Math.max(mY,Math.min(H-mY,TELESCOPE.y||H*.5));
  }
  var bhEl=$('#bh');bhEl.style.width=Math.round(BH.R*16)+'px';bhEl.style.height=Math.round(BH.R*10)+'px';
  var bhp=camBH();
  bhEl.style.transform='translate('+Math.round(bhp[0]-BH.R*8)+'px,'+Math.round(bhp[1]-BH.R*5)+'px)';
  CAPS.bh.style.transform='translate('+Math.round(bhp[0]-CAPS.bh.offsetWidth/2+3)+'px,'+Math.round(bhp[1]+BH.R*1.7*BHZ)+'px)';
  var rg=cons('orion').stars.rigel,rfx=$('#rigel-fx');
  rfx.style.width=rfx.style.height='52px';rfx.style.marginLeft=rfx.style.marginTop='-26px';
  rfx.style.transform='translate('+Math.round(rg.x+skyPan.x)+'px,'+Math.round(rg.y+skyPan.y)+'px)';
  var bt=cons('orion').stars.betel,btx=$('#betel-fx');
  btx.style.transform='translate('+Math.round(bt.x+skyPan.x)+'px,'+Math.round(bt.y+skyPan.y)+'px)';
  var sr=cons('canis').stars.sirius,sfx=$('#sirius-fx');
  sfx.style.width=sfx.style.height='52px';sfx.style.marginLeft=sfx.style.marginTop='-26px';
  sfx.style.transform='translate('+Math.round(sr.x+skyPan.x)+'px,'+Math.round(sr.y+skyPan.y)+'px)';
  var ad=cons('taurus')&&cons('taurus').stars.aldebaran,afx=$('#aldebaran-fx');
  if(ad&&afx){
    afx.style.width=afx.style.height='52px';afx.style.marginLeft=afx.style.marginTop='-26px';
    afx.style.transform='translate('+Math.round(ad.x+skyPan.x)+'px,'+Math.round(ad.y+skyPan.y)+'px)';
  }
  var arc=cons('bootes')&&cons('bootes').stars.arcturus,arcFx=$('#arcturus-fx');
  if(arc&&arcFx){
    arcFx.style.width=arcFx.style.height='52px';arcFx.style.marginLeft=arcFx.style.marginTop='-26px';
    arcFx.style.transform='translate('+Math.round(arc.x+skyPan.x)+'px,'+Math.round(arc.y+skyPan.y)+'px)';
  }
  var ant=cons('scorpius')&&cons('scorpius').stars.antares,antFx=$('#antares-fx');
  if(ant&&antFx){
    antFx.style.width=antFx.style.height='52px';antFx.style.marginLeft=antFx.style.marginTop='-26px';
    antFx.style.transform='translate('+Math.round(ant.x+skyPan.x)+'px,'+Math.round(ant.y+skyPan.y)+'px)';
  }
  /* Dedicated DOM hit target for Pleione — same reliability as Rigel/Betel/Sirius. */
  var pfx=$('#pleione-fx');
  if(pfx&&PLEIADES.ready){
    var ox=mouse.x*1.4+skyPan.x,oy=mouse.y*1.0+skyPan.y;
    var pl=PLEIADES.bright.filter(function(z){return z.interactive;})[0];
    if(pl){
      var px=PLEIADES.x+pl.x*PLEIADES.scale+ox,py=PLEIADES.y+pl.y*PLEIADES.scale+oy;
      pfx.style.width=pfx.style.height='52px';pfx.style.marginLeft=pfx.style.marginTop='-26px';
      pfx.style.transform='translate('+Math.round(px)+'px,'+Math.round(py)+'px)';
    }
  }
  buildSprite();
  PORTALS.forEach(function(p){
    var s=p.c.stars[p.from];
    p.sx=s.x;p.sy=s.y;
    /* DUMUL sits to the right of Orion's belt, nudged up so it never covers Rigel's
       label/spectrum (Rigel is the lower-right star of the figure). */
    if(p.place==='fig-right'){
      p.lx=p.c.maxX+22;
      p.ly=s.y-10;
    }else{
      p.lx=s.x+20;
      p.ly=s.y;
    }
    /* Fixed screen anchors — panels stay put; only the connector line stretches. */
    if(p.id==='band' && W<=700) p.lx-=10;
    if(p.id==='band' && W<=420) p.lx-=6;
    p.fx=p.lx;p.fy=p.ly;
    /* Hard cap so DUMUL/YouTube panels stay compact and never cover Sirius / Rigel / other triggers */
    /* Membatasi lebar portal DUMUL agar berhenti bersih di W * 0.42 (sebelum halo Gargantua W * 0.44) */
    var maxAllowed = !portrait && p.id==='band' ? Math.max(50, Math.floor(W*.42 - p.fx)) : (W - p.fx - 16);
    var mw = Math.min(W<600?88:115, maxAllowed);
    p.el.style.maxWidth = mw + 'px';
  });
  var bgOrientation=W<H?'portrait':'landscape';
  var oldOrientation=bgW<bgH?'portrait':'landscape';
  var rebuildBG=!BG.length||Math.abs(W-bgW)>32||Math.abs(H-bgH)>80||bgOrientation!==oldOrientation;
  if(rebuildBG){
    var n=Math.max(70,Math.min(230,Math.round(W*H/5500)));
    BG=[];
    for(var i=0;i<n;i++){
      var big=Math.random()<.07;
      BG.push({x:Math.random()*W,y:Math.random()*H,r:big?1.5:Math.random()*.7+.4,a:Math.random()*.5+.28,s:Math.random()*1.4+.4,p:Math.random()*6.28,d:Math.random()*.9+.1,c:Math.random()<.2?'255,224,190':(Math.random()<.4?'190,225,255':'234,246,255')});
    }
    bgW=W;bgH=H;
    bgDirty=true;
  }
  /* sabuk asteroid lokal di sekitar Gargantua: ringan, tidak memenuhi layar */
  AST=[];
  var ac=IS_POTATO?14:Math.max(22,Math.min(42,Math.round(W*H/15000)));
  for(var j=0;j<ac;j++){
    var ang=Math.random()*Math.PI*2,rad=Math.min(W,H)*(.12+Math.random()*.22);
    AST.push({a:ang,r:rad,e:.72+Math.random()*.28,spd:(.000045+Math.random()*.000075)*(Math.random()<.5?1:-1),sz:2.0+Math.random()*5.8,rot:Math.random()*6.28,rs:(Math.random()-.5)*.0018,al:.96+Math.random()*.04,seed:Math.random()*6.28,sprite:j%8,ox:0,oy:0,vx:0,vy:0,kick:0,kickUntil:0,_lastNow:performance.now()});
  }  if(!GAL.length){
    var spots=[[.08,.18,.72,.18,1.0],[.84,.13,.42,.72,.8],[.18,.42,.58,.38,1.1],[.76,.47,.66,.32,.9],[.10,.72,.48,.22,.75],[.88,.78,.55,.55,1.15],[.48,.24,.34,.44,.65],[.54,.82,.72,.26,.9]];
    var galCols=[
      {core:'255,225,185',outer:'205,225,255',halo:'135,175,230'},
      {core:'255,198,138',outer:'238,190,225',halo:'175,125,195'},
      {core:'205,232,255',outer:'145,195,245',halo:'90,145,210'},
      {core:'255,232,165',outer:'225,205,150',halo:'155,150,105'},
      {core:'240,210,255',outer:'180,160,235',halo:'120,105,195'},
      {core:'180,235,220',outer:'125,205,225',halo:'80,150,180'},
      {core:'255,215,185',outer:'230,170,175',halo:'170,115,125'},
      {core:'215,230,255',outer:'165,180,235',halo:'105,125,190'}
    ];
    GAL=spots.map(function(q,i){var cc=galCols[i%galCols.length];return{x:q[0],y:q[1],rx:q[2],ry:q[3],rot:(i*.83)%3.14,scale:q[4],p:i*.91,tw:.7+i*.06,col:cc};});
  }
  if(bgDirty||!bgCanvas||plateDPR!==DPR){
    bakeAstroPlates();
    bgDirty=false;
  }
}

/* ---------- lubang hitam Gargantua ---------- */
function ease(u){return u*u*(3-2*u);}
function pull(x,y){                       /* posisi benda saat disedot: berputar spiral ke lubang hitam */
  if(!SW)return [x,y,0];
  var bp=camBH(),bx=bp[0],by=bp[1];
  var dx=x-bx,dy=y-by,r=Math.sqrt(dx*dx+dy*dy)+.001,th=Math.atan2(dy,dx);
  var rmax=Math.sqrt(W*W+H*H)*.6,delay=.4*Math.min(1,r/rmax);
  var P=clamp((swP-.05)/.82),k=clamp((P-delay)/(1-delay));k=k*k;
  var r2=r*Math.pow(1-k,1.5),t2=th+k*3.4;
  return [bx+Math.cos(t2)*r2,by+Math.sin(t2)*r2,k];
}
function lens(x,y){                       /* smooth gravitational lens: bounded, continuous, no visual explosions */
  var R=BH.Rr*(BHZ||1);if(R<1)return [x,y];
  var bp=camBH(),bx=bp[0],by=bp[1];
  var dx=x-bx,dy=y-by,d2=dx*dx+dy*dy;
  var inner=R*1.08,outer=R*9.5,i2=inner*inner,o2=outer*outer;
  /* Far-field / swallowed checks use d² — skip sqrt for the majority of
     background stars that sit outside the lens influence. */
  if(d2<i2)return null;
  if(d2>=o2)return [x,y];

  var d=Math.sqrt(d2)+.001;
  var u=clamp((outer-d)/(outer-inner));
  /* Smooth falloff keeps the lens strong near the horizon but prevents the
     previous R²/d² singular jump that sent constellation lines off-screen. */
  var fall=u*u*(3-2*u);
  var wild=(drag.on&&drag.moved);
  var strength=wild?2.35:1.25;
  var f=1+(R*R*strength)/d2;
  f=Math.min(f,wild?2.85:1.72);
  f=1+(f-1)*fall;

  if(wild){
    var swirl=.24*fall;
    var cs=Math.cos(swirl),sn=Math.sin(swirl);
    var wx=dx*cs-dy*sn,wy=dx*sn+dy*cs;
    dx=wx;dy=wy;
  }
  return [bx+dx*f,by+dy*f];
}
function gravityPos(x,y){
  /* Gargantua continuously lenses the galaxy; during the swallow transition,
     keep the existing spiral pull animation. */
  if(SW)return pull(x,y);
  var q=lens(x,y);
  return q ? [q[0],q[1],0] : [x,y,1];
}
function buildSprite(){                   /* layered gravitational lens: luminous, deep, photorealistic feel + Doppler / photon ring / secondary lens */
  var R=BH.R,S=Math.ceil(R*13),d=DPR,c=document.createElement('canvas');
  c.width=c.height=Math.ceil(S*d);
  var s=c.getContext('2d');s.scale(d,d);
  var cx=S/2,cy=S/2;

  /* Broad atmospheric scattering: soft blue-white, never neon. */
  s.globalCompositeOperation='lighter';
  var halo=s.createRadialGradient(cx,cy,R*.72,cx,cy,R*(IS_POTATO?2.7:4.0));
  halo.addColorStop(0,'rgba(220,238,255,.13)');
  halo.addColorStop(.24,'rgba(155,195,235,.10)');
  halo.addColorStop(.48,'rgba(100,145,195,.055)');
  halo.addColorStop(.72,'rgba(55,85,125,.025)');
  halo.addColorStop(1,'rgba(20,35,55,0)');
  s.fillStyle=halo;s.beginPath();s.arc(cx,cy,R*4,0,6.283);s.fill();

  /* Multiple lensing layers: the thick luminous structure around the horizon. */
  var layers=IS_POTATO?[
    {r:1.16,w:.070,c:'rgba(175,205,235,.34)',b:.12},
    {r:1.035,w:.032,c:'rgba(250,252,252,.88)',b:.08}
  ]:[
    {r:1.34,w:.105,c:'rgba(92,140,195,.18)',b:.28},
    {r:1.23,w:.080,c:'rgba(150,190,230,.30)',b:.24},
    {r:1.14,w:.055,c:'rgba(220,235,246,.54)',b:.18},
    {r:1.075,w:.034,c:'rgba(250,252,250,.84)',b:.13},
    {r:1.025,w:.022,c:'rgba(255,255,252,.96)',b:.10}
  ];
  layers.forEach(function(L){
    s.strokeStyle=L.c;s.lineWidth=Math.max(.8,R*L.w);
    s.shadowColor=L.c;s.shadowBlur=R*L.b;
    s.beginPath();s.arc(cx,cy,R*L.r,0,6.283);s.stroke();
  });
  s.shadowBlur=0;

  /* Broad, layered accretion disk with Doppler beaming asymmetry.
     Approaching side (left, blueshift) is brighter/cooler; receding side (right, redshift) is warmer/dimmer. */
  var ang=-.48;
  s.save();s.translate(cx,cy);s.rotate(ang);
  var outer=s.createLinearGradient(-R*5.1,0,R*5.1,0);
  outer.addColorStop(0,'rgba(45,80,130,0)');
  outer.addColorStop(.10,'rgba(90,150,210,.14)');
  outer.addColorStop(.22,'rgba(160,210,245,.38)');
  outer.addColorStop(.36,'rgba(230,245,255,.72)');
  outer.addColorStop(.46,'rgba(255,255,252,.92)');
  outer.addColorStop(.54,'rgba(255,200,160,.48)');
  outer.addColorStop(.66,'rgba(180,120,90,.22)');
  outer.addColorStop(.80,'rgba(100,70,55,.08)');
  outer.addColorStop(1,'rgba(35,40,50,0)');
  s.fillStyle=outer;s.shadowColor='rgba(170,205,240,.34)';s.shadowBlur=R*.34;
  s.beginPath();s.ellipse(0,0,R*(IS_POTATO?3.8:4.9),R*(IS_POTATO?.11:.16),0,0,6.283);s.fill();
  s.shadowBlur=0;

  var mid=s.createLinearGradient(-R*4.7,0,R*4.7,0);
  mid.addColorStop(0,'rgba(70,130,200,0)');
  mid.addColorStop(.28,'rgba(150,205,245,.22)');
  mid.addColorStop(.42,'rgba(240,248,255,.70)');
  mid.addColorStop(.50,'rgba(255,245,230,.58)');
  mid.addColorStop(.60,'rgba(255,190,140,.32)');
  mid.addColorStop(.76,'rgba(140,90,70,.12)');
  mid.addColorStop(1,'rgba(50,40,35,0)');
  s.fillStyle=mid;s.beginPath();s.ellipse(0,0,R*(IS_POTATO?3.7:4.75),R*(IS_POTATO?.055:.075),0,0,6.283);s.fill();
  s.restore();

  /* Secondary lens is drawn dynamically in drawHole so it always shares the
     live disk inclination (including inertia wobble while dragging). */

  /* Dark event horizon: clean and deep. */
  s.globalCompositeOperation='source-over';
  s.fillStyle='#000102';s.beginPath();s.arc(cx,cy,R*1.015,0,6.283);s.fill();

  /* Photon sphere / gravitational redshift ring — thin warm rim just inside Einstein ring. */
  s.globalCompositeOperation='lighter';
  s.strokeStyle='rgba(255,90,45,.32)';
  s.lineWidth=Math.max(.5,R*.012);
  s.beginPath();s.arc(cx,cy,R*1.012,0,6.283);s.stroke();
  s.strokeStyle='rgba(255,140,70,.18)';
  s.lineWidth=Math.max(.4,R*.008);
  s.beginPath();s.arc(cx,cy,R*1.006,0,6.283);s.stroke();

  /* Crisp Einstein ring over the horizon. */
  s.strokeStyle='rgba(250,252,252,.96)';s.lineWidth=Math.max(1,R*.026);
  s.shadowColor='rgba(195,220,246,.62)';s.shadowBlur=R*.18;
  s.beginPath();s.arc(cx,cy,R*1.028,0,6.283);s.stroke();
  s.shadowBlur=0;

  /* Foreground edge of the disk crosses in front of the black hole (Doppler-aware). */
  s.save();s.translate(cx,cy);s.rotate(ang);
  var fg=s.createLinearGradient(-R*4.8,0,R*4.8,0);
  fg.addColorStop(0,'rgba(55,100,170,0)');
  fg.addColorStop(.20,'rgba(140,195,240,.18)');
  fg.addColorStop(.36,'rgba(235,245,255,.55)');
  fg.addColorStop(.47,'rgba(255,255,252,.88)');
  fg.addColorStop(.55,'rgba(255,210,175,.50)');
  fg.addColorStop(.68,'rgba(180,120,85,.16)');
  fg.addColorStop(1,'rgba(45,35,30,0)');
  s.fillStyle=fg;s.shadowColor='rgba(220,235,250,.38)';s.shadowBlur=R*.16;
  s.beginPath();s.ellipse(0,0,R*(IS_POTATO?3.7:4.7),R*(IS_POTATO?.026:.038),0,0,6.283);s.fill();
  s.restore();

  s.shadowBlur=0;s.globalCompositeOperation='source-over';
  BH.sprite=c;BH.S=S;
}

function drawHoleFallback(now,age){
  /* Compatibility fallback for older/mobile canvas engines.  If the layered
     sprite cannot be drawn, keep Gargantua visible with only basic Canvas 2D
     primitives so one unsupported effect cannot make the whole scene vanish. */
  var a=clamp((age-.9)/1.5),sc=1-Math.pow(1-a,3),e=SW?ease(swP):0;
  var R=Math.max(.1,BH.R*sc*(1+1.6*e)*BHZ*BHSC);
  if(R<.5)return;
  var bp=camBH();
  g.save();g.translate(bp[0],bp[1]);
  g.globalCompositeOperation='source-over';
  /* accretion disk */
  g.save();g.rotate(-.48);
  g.fillStyle='rgba(120,165,215,.16)';g.beginPath();g.ellipse(0,0,R*4.8,R*.13,0,0,6.283);g.fill();
  g.fillStyle='rgba(240,235,230,.52)';g.beginPath();g.ellipse(0,0,R*4.1,R*.045,0,0,6.283);g.fill();
  g.restore();
  /* luminous lens rings */
  g.strokeStyle='rgba(150,190,225,.32)';g.lineWidth=Math.max(1,R*.18);g.beginPath();g.arc(0,0,R*1.25,0,6.283);g.stroke();
  g.strokeStyle='rgba(235,243,248,.78)';g.lineWidth=Math.max(1,R*.075);g.beginPath();g.arc(0,0,R*1.08,0,6.283);g.stroke();
  /* event horizon */
  g.fillStyle='#000102';g.beginPath();g.arc(0,0,R,0,6.283);g.fill();
  g.strokeStyle='rgba(255,255,252,.95)';g.lineWidth=Math.max(1,R*.055);g.beginPath();g.arc(0,0,R*1.025,0,6.283);g.stroke();
  g.restore();
}
function drawHoleSafe(now,age){
  try{
    drawHole(now,age);
    /* Some older engines fail silently around offscreen canvas sprites. */
    if(!BH.sprite || !BH.Rr)drawHoleFallback(now,age);
  }catch(err){
    window.__hub.renderError='drawHole: '+(err&&err.message||err);
    drawHoleFallback(now,age);
  }
}
function drawHole(now,age){
  var a=clamp((age-.9)/1.5),sc=1-Math.pow(1-a,3),e=SW?ease(swP):0;
  BH.Rr=BH.R*sc*(1+1.6*e)*BHSC;
  if(BH.Rr<1||!BH.sprite)return;

  BH.h+=((hot==='bh'?1:0)-BH.h)*.12;
  var R=BH.Rr*BHZ,k=((BH.Rr)/BH.R)*(1+(reduce?0:.012*Math.sin(now*.0016))),S=BH.S*k*BHZ;
  var bp=camBH();
  var gk=OFX.pK; /* 0..1: seberapa "hidup" Gargantua saat BGM Collapsars main */

  g.save();
  g.translate(bp[0],bp[1]);

  /* Core + static portal artwork */
  g.globalAlpha=Math.min(1,.86+.14*BH.h+.5*e+.08*gk);
  g.drawImage(BH.sprite,-S/2,-S/2,S,S);
  g.globalAlpha=1;

  /* Audio-reactive Gargantua ring. The black hole core and drag physics are
     untouched; this is a visual layer drawn on top of the normal ring only
     while one of Betelgeuse/Rigel/Spica SFX is actively playing. */
  drawAudioVisualizer(now,R);

  /*
   * Animated gravitational pulse rings.
   * They are deliberately offset in phase so Gargantua feels alive even
   * when it is not being dragged.
   */
  if(!reduce){
    g.globalCompositeOperation='lighter';

    /* One restrained breathing Einstein ring: slow, shallow, photorealistic. */
    var breathe=.5+.5*Math.sin(now*.00115);
    var ringR=R*(1.022+.012*breathe);
    /* Blur-free breathing ring: wide translucent halo stroke + bright core.
       Avoid dynamic shadowBlur on every frame for mobile canvas performance. */
    g.strokeStyle='rgba(185,215,245,'+(.09+.06*breathe+.05*gk)+')';
    g.lineWidth=Math.max(1,R*(.065+.018*breathe));
    g.beginPath();g.arc(0,0,ringR,0,6.283);g.stroke();
    g.strokeStyle='rgba(238,245,248,'+(.55+.18*breathe+.12*gk)+')';
    g.lineWidth=Math.max(.65,R*(.022+.008*breathe));
    g.beginPath();g.arc(0,0,ringR,0,6.283);g.stroke();

    /* Extremely faint expanding lens ripples, spaced far apart. */
    var pulseT=now*.00022;
    for(var pr=0;pr<(IS_POTATO?1:3);pr++){
      var ph=(pulseT+pr/3)%1;
      var rr=R*(2.0+ph*4.0);
      var al=(1-ph)*.035;
      g.strokeStyle='rgba(150,185,220,'+al+')';
      g.lineWidth=.55;
      g.beginPath();g.arc(0,0,rr,0,6.283);g.stroke();
    }

    /* Disk plane is fixed at ang=-.48 (matches the baked sprite).
       Secondary lens + plasma MUST use this same angle always — never apply
       drag wobble here, or they separate from the sprite disk. */
    var diskAng=-.48;
    var sp=.00024*(1+.55*BH.h+1.8*e);
    g.save();g.rotate(diskAng);
    if(gk>.01){
      /* Collapsars: cakram akresi berdenyut pelan (hangat), lebih terang dari biasanya. */
      var gp=.5+.5*Math.sin(now*.0013);
      g.fillStyle='rgba(255,176,110,'+(.07*gk*(.65+.35*gp))+')';
      g.beginPath();g.ellipse(0,0,R*(3.9+.25*gp),R*(.20+.03*gp),0,0,6.283);g.fill();
      g.fillStyle='rgba(255,222,184,'+(.10*gk*(.5+.5*gp))+')';
      g.beginPath();g.ellipse(0,0,R*2.5,R*.09,0,0,6.283);g.fill();
    }
    for(var m=0;m<(IS_POTATO?3:7);m++){
      var ph2=(now*sp+OFX.dph+m/7)%1,u=ph2*2-1;
      var al2=Math.pow(1-Math.abs(u),1.9)*(.16+.12*BH.h+.10*e+.10*gk);
      var tilt=(m%3-1)*.18;
      g.fillStyle='rgba(235,240,245,'+al2+')';
      g.beginPath();
      g.ellipse(u*R*4.1,R*(.02+tilt*.04),R*(.025+.012*(1-Math.abs(u))),R*.016,tilt,0,6.283);
      g.fill();
    }
    if(!IS_POTATO){
      for(var sa=0;sa<3;sa++){
        var sph=(now*sp*.55+OFX.dph*.55+sa*.33)%1;
        var saAl=(1-Math.abs(sph*2-1))* (.07+.05*BH.h);
        g.strokeStyle='rgba(200,220,240,'+saAl+')';
        g.lineWidth=.55;
        g.beginPath();
        g.ellipse(0,0,R*(3.2+sa*.55),R*(.045+sa*.012),sph*.4-0.2,0,6.283);
        g.stroke();
      }
      /* Secondary lens — locked to sprite disk plane (no drag wobble). */
      g.lineWidth=Math.max(.55,R*.016);
      g.strokeStyle='rgba(200,220,245,'+(.28+.14*gk)+')';
      g.beginPath();
      g.ellipse(0,-R*.02,R*1.55,R*.38,0,Math.PI*1.15,Math.PI*1.85);
      g.stroke();
      g.strokeStyle='rgba(240,245,255,'+(.18+.12*gk)+')';
      g.beginPath();
      g.ellipse(0,-R*.02,R*1.42,R*.28,0,Math.PI*1.2,Math.PI*1.8);
      g.stroke();
      g.strokeStyle='rgba(200,220,245,'+(.22+.12*gk)+')';
      g.beginPath();
      g.ellipse(0,R*.02,R*1.55,R*.38,0,Math.PI*.15,Math.PI*.85);
      g.stroke();
      g.strokeStyle='rgba(240,245,255,'+(.14+.10*gk)+')';
      g.beginPath();
      g.ellipse(0,R*.02,R*1.42,R*.28,0,Math.PI*.2,Math.PI*.8);
      g.stroke();
    }
    g.restore();
  }

  g.restore();

  if(drag.on&&drag.moved&&!reduce){
    g.save();g.globalCompositeOperation='lighter';
    /* Extra disk highlight while dragging. Rotation is LOCKED to the same
       fixed diskAng as the secondary lens (-.48) — it used to add a
       velocity-based wobble (-.48+wob2) on top of that, which visibly
       rotated this ring away from the locked secondary lens/sprite disk
       during fast drags, reading as the secondary lens "splitting off".
       Drag velocity now only modulates brightness (wobS2), never angle. */
    var vx2=(BH.x-drag.bx)*.0025,vy2=(BH.y-drag.by)*.0025;
    var wobS2=Math.min(1,Math.hypot(vx2,vy2)*8);
    g.save();
    g.translate(bp[0],bp[1]);
    g.rotate(-.48);
    g.strokeStyle='rgba(180,210,240,'+(.10+.08*wobS2)+')';
    g.lineWidth=Math.max(.7,R*.02);
    g.beginPath();g.ellipse(0,0,R*4.3,R*.09,0,0,6.283);g.stroke();
    g.strokeStyle='rgba(255,220,190,'+(.06+.05*wobS2)+')';
    g.lineWidth=Math.max(.5,R*.012);
    g.beginPath();g.ellipse(0,0,R*3.6,R*.04,0,0,6.283);g.stroke();
    g.restore();
    /* Warp-ring loop is the expensive part of this effect (one arc+stroke
       call per ring, every frame, for the whole drag gesture). Cut the
       ring count well down (was a flat 18, even on low-end devices) and
       keep the falloff spacing/opacity curve scaled to the new count so
       the look stays the same, just cheaper to draw. */
    var ringN=IS_POTATO?4:9;
    for(var di=1;di<=ringN;di++){
      var dr=R*(2.2+di*(66.6/ringN)), da2=.34*(1-di/(ringN+2));
      g.strokeStyle='rgba(130,170,205,'+(da2*.42)+')';g.lineWidth=.8+(di===1?.5:0);
      g.beginPath();g.arc(bp[0],bp[1],dr,0,6.283);g.stroke();
    }
    var grd=g.createRadialGradient(bp[0],bp[1],R*.8,bp[0],bp[1],R*28);
    grd.addColorStop(0,'rgba(175,205,230,.10)');
    grd.addColorStop(.22,'rgba(210,220,225,.035)');
    grd.addColorStop(.5,'rgba(110,145,180,.018)');
    grd.addColorStop(1,'rgba(90,120,155,0)');
    g.fillStyle=grd;g.beginPath();g.arc(bp[0],bp[1],R*11,0,6.283);g.fill();
    g.restore();
  }

  if(SW){
    var f=clamp((swP-.80)/.18);
    if(f>0){
      var fr=Math.sqrt(W*W+H*H)*(.12+.75*f),
          gr=g.createRadialGradient(bp[0],bp[1],0,bp[0],bp[1],fr);
      gr.addColorStop(0,'rgba(232,250,255,'+(.95*f)+')');
      gr.addColorStop(.4,'rgba(110,229,255,'+(.55*f)+')');
      gr.addColorStop(1,'rgba(110,229,255,0)');
      g.fillStyle=gr;g.fillRect(0,0,W,H);
    }
  }
}
/* ===== DUMUL neural network (kode SAMA di index.html & dumul.html — jangan diubah sebelah saja) =====
   Layout deterministik (seed tetap, koordinat relatif ke viewport) → posisi node & garis
   di index.html (saat masuk) identik dengan di dumul.html (saat tiba). */
/* Kotak hero dumul.html (posisi & ukuran og.webp + neural network). Dipakai SAMA di index.html & dumul.html.
   dumul.html mengukur hero aslinya lalu menyimpannya (tidak ada lagi: sekarang murni dihitung dari lebar layar). */
function dmHeroRect(){
  /* DETERMINISTIK: semua angka turunan dari lebar layar saja (tanpa pengukuran DOM / localStorage),
     jadi index.html (transisi) dan dumul.html (hero asli) SELALU menghasilkan kotak yang sama. */
  var W=document.documentElement.clientWidth||window.innerWidth||360;
  var wide=W>=640;
  var padTop=wide?56:30,titleH=wide?46:30,gap0=24,meshH=132;
  var tb=padTop+titleH;                       /* dasar judul DUMUL */
  /* Titik jembatan cahaya di og.webp (fraksi 720x720) & puncak kepala siluet. */
  var BX=.49,BY=.527,HEADY=.165,IW=720,IH=720;
  /* Skala gambar = lebar layar (kepala tetap utuh); bawah gambar dipudarkan lewat mask. */
  var s=Math.max(W/IW,(W/2)/(BX*IW),(W/2)/((1-BX)*IW));
  var dw=IW*s,dh=IH*s;
  /* Turunkan mesh + gambar bersama-sama (jembatan tetap di pusat mesh) sampai puncak kepala
     berada di bawah judul → judul punya ruang bersih. Layar lebar: kepala memang terpotong, tidak perlu. */
  var off=(BY-HEADY)*dh;                      /* jarak jembatan → puncak kepala */
  var extra=wide?0:Math.max(0,Math.min(160,Math.round(off-(gap0+meshH/2)+24)));
  var my=tb+gap0+extra;                       /* atas kanvas mesh */
  var heroH=(wide?344:308)+(W>=480?50:64)+extra; /* + ruang tetap baris lirik (#dm-hl) */
  var cx=W/2,cy=my+meshH/2;
  var ix=cx-BX*dw,iy=cy-BY*dh;
  /* Mask gambar (koordinat piksel elemen): transparan di belakang judul, muncul perlahan, pudar di bawah. */
  var a0=Math.max(0,tb-10-iy),a1=Math.max(a0+1,tb+30-iy),d1=dh,c1=Math.max(a1+1,dh*.72);
  var mg='linear-gradient(to bottom,transparent 0,transparent '+a0.toFixed(1)+'px,#000 '+a1.toFixed(1)+'px,#000 '+c1.toFixed(1)+'px,transparent '+d1.toFixed(1)+'px)';
  var mw=Math.round(Math.min(W*.92,640));
  return{x:0,y:0,w:W,h:heroH,m:{x:Math.round((W-mw)/2),y:my,w:mw,h:meshH},img:{x:ix,y:iy,w:dw,h:dh},mask:mg,gap:gap0+extra,padTop:padTop,titleH:titleH};
}
var DM_NN_DUR=5600;
var DM_MESH_H=132,DM_TR_MESH_W=0,DM_TR_MESH_H=0,DM_TR_MESH_X=0,DM_TR_MESH_Y=0,DM_TR_GLITCH_V=0,DM_TR_GLITCH_S=0,DM_TR_GLITCH_SEEN=0;
function dmNeuralBuild(W,H){
  /* Mesh neural horizontal (referensi og.webp): pita di antara dua siluet,
     node mengambang, garis menyambung seperti koneksi di gambar. */
  function rng(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
  var R=rng(1717),pts=[],i,j,k;
  /* [u, v, colFlag] — colFlag 0=cyan, 1=pink. Posisi relatif ke hero (og.webp). */
  var layout=[
    /* left cluster (dekat siluet kiri) */
    [.08,.48,0],[.14,.34,0],[.16,.58,1],[.22,.44,0],[.24,.62,0],
    /* mid-left */
    [.30,.32,1],[.32,.50,0],[.36,.66,1],[.40,.40,0],[.42,.56,0],
    /* center bridge */
    [.48,.36,0],[.50,.52,1],[.54,.44,0],[.56,.62,0],[.58,.30,1],
    /* mid-right */
    [.64,.48,0],[.68,.34,1],[.70,.58,0],[.74,.42,0],[.76,.64,1],
    /* right cluster (dekat siluet kanan) */
    [.82,.36,0],[.86,.52,1],[.90,.42,0],[.92,.58,0]
  ];
  for(i=0;i<layout.length;i++){
    var L=layout[i];
    var u=L[0]+(R()-.5)*.01,v=L[1]+(R()-.5)*.012;
    u=Math.max(.04,Math.min(.96,u));v=Math.max(.22,Math.min(.72,v));
    pts.push({
      u:u,v:v,x:u*W,y:v*H,
      bx:u*W,by:v*H, /* base pos untuk drift */
      r:1.4+R()*1.8,
      ph:R()*Math.PI*2,
      ph2:R()*Math.PI*2,
      col:L[2]?'255, 122, 217':'110, 229, 255',
      tc:1e9,link:0,a:0,
      drift:0.6+R()*1.1
    });
  }
  var n=pts.length;
  function dist(a,b){return Math.hypot(pts[a].bx-pts[b].bx,pts[a].by-pts[b].by);}
  /* Mulai dari kiri → tumbuh ke kanan (sinyal nyambung antar siluet) */
  var s=0,su=1e18;
  for(i=0;i<n;i++){if(pts[i].u<su){su=pts[i].u;s=i;}}
  var inSet=[],edges=[],used={};
  for(i=0;i<n;i++)inSet.push(false);
  inSet[s]=true;pts[s].tc=260;
  for(var step=1;step<n;step++){
    var bA=-1,bB=-1,bl=1e18;
    for(i=0;i<n;i++){if(!inSet[i])continue;for(j=0;j<n;j++){if(inSet[j])continue;var l=dist(i,j);if(l<bl){bl=l;bA=i;bB=j;}}}
    if(bB<0)break;
    inSet[bB]=true;
    var t0=380+Math.pow((step-1)/Math.max(1,n-2),.9)*3000,du=460;
    edges.push({a:bA,b:bB,t0:t0,dur:du,al:.62,fail:(step%5===3),beam:0});
    pts[bB].tc=t0+du*.65;
    used[Math.min(bA,bB)+'_'+Math.max(bA,bB)]=1;
  }
  /* Triangular mesh: 3 tetangga terdekat */
  var extra=[],maxL=Math.min(W,H)*.38;
  for(i=0;i<n;i++){
    var nb=[];for(j=0;j<n;j++){if(j!==i)nb.push({j:j,l:dist(i,j)});}
    nb.sort(function(p,q){return p.l-q.l;});
    for(k=0;k<3;k++){
      var o=nb[k];if(!o||o.l>maxL)continue;
      var key=Math.min(i,o.j)+'_'+Math.max(i,o.j);
      if(used[key])continue;used[key]=1;extra.push({a:i,b:o.j,l:o.l,beam:0});
    }
  }
  /* Beam horizontal panjang (ciri referensi: garis neon kiri-kanan) */
  var bandY=[.36,.48,.58];
  for(var bi=0;bi<bandY.length;bi++){
    var row=[];
    for(i=0;i<n;i++)if(Math.abs(pts[i].v-bandY[bi])<.10)row.push(i);
    row.sort(function(a,b){return pts[a].u-pts[b].u;});
    for(i=0;i<row.length-1;i++){
      var a=row[i],b=row[i+1];
      if(pts[b].u-pts[a].u>.22)continue; /* jangan lompat terlalu jauh */
      var key=Math.min(a,b)+'_'+Math.max(a,b);
      if(used[key])continue;used[key]=1;
      extra.push({a:a,b:b,l:dist(a,b),beam:1});
    }
  }
  extra.sort(function(p,q){return p.l-q.l;});
  for(i=0;i<extra.length;i++){
    var isB=!!extra[i].beam;
    edges.push({a:extra[i].a,b:extra[i].b,t0:3400+(i/Math.max(1,extra.length))*1300,dur:isB?520:380,al:isB?.78:.36,fail:false,beam:isB?1:0});
  }
  return{nodes:pts,edges:edges};
}
function dmNeuralDraw(g,W,H,net,t){
  g.clearRect(0,0,W,H);
  var nodes=net.nodes,edges=net.edges,i,e,a,b;
  function eo(u){return 1-Math.pow(1-u,3);}
  /* Drift node: ngambang pelan di atas og.webp */
  for(i=0;i<nodes.length;i++){
    var n=nodes[i];
    var dx=Math.sin(t*.0011+n.ph)*n.drift*1.6;
    var dy=Math.cos(t*.0009+n.ph2)*n.drift*1.2;
    n.x=n.bx+dx;n.y=n.by+dy;
  }
  /* Soft horizontal signal bands (referensi) */
  var bandA=Math.min(1,Math.max(0,(t-600)/1800));
  if(bandA>.02){
    var midY=H*.48,bh=Math.max(1.1,H*.01);
    var gx=g.createLinearGradient(0,midY,W,midY);
    gx.addColorStop(0,'rgba(110,229,255,0)');
    gx.addColorStop(.12,'rgba(110,229,255,'+(0.14*bandA).toFixed(3)+')');
    gx.addColorStop(.45,'rgba(255,122,217,'+(0.20*bandA).toFixed(3)+')');
    gx.addColorStop(.55,'rgba(110,229,255,'+(0.18*bandA).toFixed(3)+')');
    gx.addColorStop(.88,'rgba(110,229,255,'+(0.14*bandA).toFixed(3)+')');
    gx.addColorStop(1,'rgba(110,229,255,0)');
    g.fillStyle=gx;
    g.fillRect(0,midY-bh,W,bh*2);
    var midY2=H*.38;
    var gx2=g.createLinearGradient(0,midY2,W,midY2);
    gx2.addColorStop(0,'rgba(110,229,255,0)');
    gx2.addColorStop(.2,'rgba(110,229,255,'+(0.09*bandA).toFixed(3)+')');
    gx2.addColorStop(.8,'rgba(110,229,255,'+(0.09*bandA).toFixed(3)+')');
    gx2.addColorStop(1,'rgba(110,229,255,0)');
    g.fillStyle=gx2;
    g.fillRect(0,midY2-bh*.5,W,bh);
  }
  for(i=0;i<edges.length;i++){
    e=edges[i];var u=(t-e.t0)/e.dur;if(u<=0)continue;if(u>1)u=1;
    var gf;
    if(e.fail){
      if(u<.35)gf=.5*eo(u/.35);else if(u<.55)gf=.5-.3*((u-.35)/.2);else gf=.2+.8*eo((u-.55)/.45);
    }else gf=eo(u);
    a=nodes[e.a];b=nodes[e.b];
    var x2=a.x+(b.x-a.x)*gf,y2=a.y+(b.y-a.y)*gf;
    var pl=.78+.22*Math.sin(t*.0024+a.ph);
    var al=e.al*pl*(u<1?(.5+.5*u):1);
    var lw=e.beam?1.45:1.05;
    g.strokeStyle='rgba('+a.col+', '+al.toFixed(3)+')';g.lineWidth=lw;
    if(e.beam){g.shadowBlur=10;g.shadowColor='rgba('+a.col+', .5)';}
    g.beginPath();g.moveTo(a.x,a.y);g.lineTo(x2,y2);g.stroke();
    if(e.beam)g.shadowBlur=0;
    if(u<1){
      g.fillStyle='rgba('+a.col+', .95)';g.shadowBlur=14;g.shadowColor='rgba('+a.col+', .9)';
      g.beginPath();g.arc(x2,y2,2.2,0,Math.PI*2);g.fill();g.shadowBlur=0;
    }
  }
  for(i=0;i<nodes.length;i++){
    var n=nodes[i];
    var appear=Math.max(0,Math.min(1,(t-i*16)/420));
    var c=Math.max(0,Math.min(1,(t-n.tc)/260));
    var br=(.22+.78*(c*c*(3-2*c)))*appear;
    var pu=Math.sin(t*.0024+n.ph);
    var rad=Math.max(1.0,n.r+pu*.55*c);
    var flash=(c>0&&c<1)?(1-c)*5.5:0;
    g.fillStyle='rgba('+n.col+', '+(.94*br).toFixed(3)+')';
    g.shadowBlur=14*br+flash;g.shadowColor='rgba('+n.col+', '+(.88*br).toFixed(3)+')';
    g.beginPath();g.arc(n.x,n.y,rad+flash*.12,0,Math.PI*2);g.fill();
  }
  g.shadowBlur=0;
}
/* ===== end shared neural network ===== */

/* ---------- DUMUL transition spectrum visualizer ----------
   Visualizer yang sama dipakai sebagai foreground transition. Audio timeline
   tetap milik GARG; tidak ada audio kedua dan tidak ada seek manual berbasis timer.
*/
var DM_TR_CTX=null,DM_TR_AN=null,DM_TR_SPEC=null,DM_TR_PREV=null,DM_TR_LEVEL=0,DM_TR_FLUX=0,DM_TR_BEAT=0,DM_TR_RAF=0,DM_TR_NET=null,DM_TR_MESH_LAST=0;
function dmTransitionGraph(){
  if(DM_TR_CTX){try{if(DM_TR_CTX.state!=='running'&&DM_TR_CTX.resume)DM_TR_CTX.resume();}catch(e){}return true;}
  var AC=window.AudioContext||window.webkitAudioContext;
  if(!AC||typeof GARG==='undefined'||!GARG)return false;
  try{
    if(typeof AV!=='undefined'&&AV.ctx&&AV.an){
      /* Reuse the site's existing AudioContext when available — one graph only. */
      DM_TR_CTX=AV.ctx;
      DM_TR_AN=AV.an;
      if(!AV.sources.garg){
        AV.sources.garg=DM_TR_CTX.createMediaElementSource(GARG);
        AV.sources.garg.connect(DM_TR_AN);
        /* FIX: analyser AV.an adalah tap murni (tidak tersambung ke destination kalau AV.lpf ada),
           jadi GARG harus ikut disambung ke jalur keluar yang terdengar, sama seperti audioVizInit().
           Tanpa ini, kalau user sempat tap bintang sebelum klik Gargantua, swallow-nya bisu. */
        if(AV.lpf){
          try{AV.sources.garg.connect(AV.lpf);}
          catch(eG1){try{DM_TR_AN.connect(DM_TR_CTX.destination);AV._anOut=true;}catch(eG2){}}
        }else if(!AV._anOut){
          try{DM_TR_AN.connect(DM_TR_CTX.destination);AV._anOut=true;}catch(eG3){}
        }
      }
    }else{
      DM_TR_CTX=new AC();
      DM_TR_AN=DM_TR_CTX.createAnalyser();
      DM_TR_AN.fftSize=1024;
      DM_TR_AN.smoothingTimeConstant=.6;
      var src=DM_TR_CTX.createMediaElementSource(GARG);
      src.connect(DM_TR_AN);
      DM_TR_AN.connect(DM_TR_CTX.destination);
    }
    DM_TR_SPEC=new Uint8Array(DM_TR_AN.frequencyBinCount);
    DM_TR_PREV=new Uint8Array(DM_TR_AN.frequencyBinCount);
    if(DM_TR_CTX.state!=='running'&&DM_TR_CTX.resume)DM_TR_CTX.resume();
    return true;
  }catch(e){DM_TR_CTX=null;DM_TR_AN=null;DM_TR_SPEC=null;DM_TR_PREV=null;return false;}
}
function dmTransitionAnalyse(now){
  if(!DM_TR_AN||!DM_TR_SPEC)return;
  DM_TR_AN.getByteFrequencyData(DM_TR_SPEC);
  var i,e=0,flux=0,n=DM_TR_SPEC.length,lim=Math.min(8,n-1);
  for(i=1;i<=lim;i++){var d=DM_TR_SPEC[i]-DM_TR_PREV[i];if(d>0)flux+=d;}
  flux/=Math.max(1,lim)*255;
  DM_TR_FLUX+=(flux-DM_TR_FLUX)*.06;
  if(flux>DM_TR_FLUX*1.7+.02&&now-DM_TR_BEAT>170)DM_TR_BEAT=now;
  DM_TR_PREV.set(DM_TR_SPEC);
  var el=Math.min(120,n-1);
  for(i=1;i<=el;i++)e+=DM_TR_SPEC[i];
  e/=Math.max(1,el)*255;
  DM_TR_LEVEL+=(Math.max(0,Math.min(1,(e-.22)*2.4))-DM_TR_LEVEL)*.35;
}
/* ---------- Shared hero spectrum mesh ----------
   This is the SAME 22-node mesh used by the React spectrum visualizer in dumul.html.
   During the swallow we run the identical motion model, then hand the live node state
   to dumul.html through sessionStorage so the first DUMUL frame continues instead of
   rebuilding a second/random network. */
function dmSpectrumMeshBuild(W,H){
  var p=[],i;
  function rng(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
  var R=rng(230917);
  for(i=0;i<22;i++){
    var c=R()>.62;
    var x=W*.15+R()*W*.7+(R()-.5)*20;
    var y=H*.5+(R()-.5)*H*.7;
    p.push({x:x,y:y,ox:x,oy:y,vx:(R()-.5)*.8,vy:(R()-.5)*.5,r:R()*2.2+.6,
      color:c?'#ff7ad9':'#6ee5ff',glow:c?'rgba(255,122,217,0.9)':'rgba(110,229,255,0.95)',phase:R()*Math.PI*2,birth:0,reveal:0});
  }
  /* Cinematic reveal: materialize from CENTER → left & right (radial).
     Final geometry unchanged; only visibility is staged. */
  var cx=W*.5, cy=H*.5;
  var order=p.map(function(_,idx){return idx;});
  order.sort(function(a,b){
    var da=Math.hypot(p[a].ox-cx,p[a].oy-cy), db=Math.hypot(p[b].ox-cx,p[b].oy-cy);
    return da-db || a-b;
  });
  for(i=0;i<order.length;i++){
    /* Tighter stagger so the bloom reads as one expanding pulse, not a crawl. */
    p[order[i]].birth=180+i*95+(p[order[i]].phase%1)*50;
  }
  return p;
}
function dmSpectrumMeshDraw(g,W,H,p,phase,level,beat,now,revealMs){
  if(!p)return;
  var dt=DM_TR_MESH_LAST?Math.min(32,Math.max(0,now-DM_TR_MESH_LAST))/16.666:1;
  DM_TR_MESH_LAST=now;
  var s=phase>0?phase:now*.001;
  var f=.7+.3*Math.sin(s*2.7)+.15*Math.sin(s*7.3+1.2);
  /* Hero-style glitch: alpha flicker + burst jitter timers */
  var gg=Math.max(.35,Math.min(1,f+(Math.random()-.5)*.18));
  if(beat){DM_TR_GLITCH_V=3+level*9;DM_TR_GLITCH_SEEN=now;}
  DM_TR_GLITCH_S-=dt;
  if(DM_TR_GLITCH_S<=0){
    if(Math.random()>.55)DM_TR_GLITCH_V=2+Math.random()*6;
    DM_TR_GLITCH_S=15+Math.random()*90;
  }
  var v=DM_TR_GLITCH_V>0?DM_TR_GLITCH_V:0;
  if(DM_TR_GLITCH_V>0)DM_TR_GLITCH_V=Math.max(0,DM_TR_GLITCH_V-dt);
  var K=v?(Math.random()-.5)*24:0;
  var i,j,h,raw,rev;
  /* Motion */
  for(i=0;i<p.length;i++){
    h=p[i];
    h.x+=h.vx*dt+Math.sin(s+h.phase)*.2*dt;
    h.y+=h.vy*dt+Math.cos(s*.7+h.phase)*.18*dt;
    var dx=h.ox-h.x,dy=h.oy-h.y;
    h.vx+=dx*.008*dt;h.vy+=dy*.008*dt;h.vx*=Math.pow(.985,dt);h.vy*=Math.pow(.985,dt);
    if(h.x<0)h.x=0;if(h.x>W)h.x=W;
    if(h.y<0)h.y=0;if(h.y>H)h.y=H;
    /* Reveal BEFORE edges so center→out links light up the same frame */
    raw=((typeof revealMs==='number'?revealMs:phase*1000)-h.birth)/420;
    rev=Math.max(0,Math.min(1,raw));
    h.reveal=rev*rev*(3-2*rev);
  }
  g.save();g.globalAlpha=gg;g.lineWidth=.6;
  /* Edges: both endpoints must be born — blooms from center outward */
  for(i=0;i<p.length;i++)for(j=i+1;j<p.length;j++){
    var a=p[i],b=p[j],d=Math.hypot(a.x-b.x,a.y-b.y);
    if(d>=110)continue;
    var edgeReveal=Math.min(a.reveal||0,b.reveal||0);
    var al=(1-d/110)*.35*gg*edgeReveal;if(al<.012)continue;
    if(v>0&&Math.random()<.08)continue; /* glitch: drop edge */
    g.beginPath();g.globalAlpha=al*(v?(.7+Math.random()*.4):1);
    g.strokeStyle=d<50?'#e6f9ff':a.color===b.color?a.color:'#8cf0ff';
    var jx=K*.2+(v&&Math.random()>.6?(Math.random()-.5)*6:0);
    g.moveTo(a.x+jx,a.y);g.lineTo(b.x+jx,b.y);g.stroke();
    if(edgeReveal>0.08&&edgeReveal<.98){
      var q=edgeReveal,px=a.x+(b.x-a.x)*q+jx,py=a.y+(b.y-a.y)*q;
      g.globalAlpha=Math.min(.85,al*3.2);g.fillStyle=a.color;g.shadowBlur=8;g.shadowColor=a.glow;
      g.beginPath();g.arc(px,py,1.35,0,Math.PI*2);g.fill();g.shadowBlur=0;
    }
  }
  /* Nodes */
  for(i=0;i<p.length;i++){
    h=p[i];rev=h.reveal||0;
    if(rev<=.002)continue;
    var pulse=.7+.3*Math.sin(s*3+h.phase);
    var xx=h.x+(v&&Math.random()>.7?K:0)+(v&&Math.random()>.85?(Math.random()-.5)*10:0);
    var flash=(rev<.35?(1-rev)*3.2:0);
    g.beginPath();g.globalAlpha=gg*pulse*rev;g.fillStyle=h.color;g.shadowBlur=10*rev+flash;g.shadowColor=h.glow;
    g.arc(xx,h.y,(h.r+flash*.18)*pulse*(1+level*1.6*rev)*(1+(v?level*.3:0)),0,Math.PI*2);g.fill();g.shadowBlur=0;
    g.beginPath();g.globalAlpha=gg*rev;g.fillStyle='#ffffff';g.arc(h.x,h.y,h.r*.35*rev,0,Math.PI*2);g.fill();
  }
  /* Hero-style scanline / slice glitches */
  if(v>0||Math.random()>.82){
    g.globalAlpha=gg*.18;
    for(i=0;i<3;i++){
      if(Math.random()>.55)continue;
      g.fillStyle=Math.random()>.5?'#6ee5ff':'#ff7ad9';
      g.fillRect(K,Math.random()*H,W*(.2+Math.random()*.6),1+Math.random()*2);
    }
  }
  if(v>1.5&&Math.random()>.5){
    g.globalAlpha=gg*.35;g.fillStyle=Math.random()>.5?'#6ee5ff':'#ff7ad9';
    g.fillRect(0,Math.random()*H,W,2+Math.random()*8);
  }
  g.restore();
}
function dmTransitionSpectrum(g,W,H,t,fade){
  /* IMPORTANT: this canvas is transparent over og.webp. Clear every frame so
     the radial glow/waveform cannot accumulate into the giant pink/cyan
     'sphere' that was hiding the actual og.webp on mobile. */
  g.clearRect(0,0,W,H);
  /* Dari sini W = lebar kanvas mesh hero (bukan lebar stage), dan digeser ke x kanvas aslinya. */
  var meshX=(typeof DM_TR_MESH_X==='number'?DM_TR_MESH_X:0);
  if(DM_TR_MESH_W>0)W=DM_TR_MESH_W;
  g.globalAlpha=1;
  g.globalCompositeOperation='source-over';
  var lev=DM_TR_LEVEL,beat=(DM_TR_BEAT&&performance.now()-DM_TR_BEAT<150)?1:0;
  /* Hero canvas is h-[132px] — keep transition mesh in that exact space. */
  var meshH=(typeof DM_MESH_H==='number'?DM_MESH_H:132);
  var meshY=(typeof DM_TR_MESH_Y==='number'&&DM_TR_MESH_Y>0?DM_TR_MESH_Y:Math.max(0,Math.round((H-meshH)*0.48)));
  if(!DM_TR_NET||!DM_TR_NET.length)DM_TR_NET=dmSpectrumMeshBuild(W,meshH);
  var phase=(typeof GARG!=='undefined'&&GARG&&!isNaN(GARG.currentTime))?GARG.currentTime:0;
  g.save();
  g.translate(meshX,meshY);
  dmSpectrumMeshDraw(g,W,meshH,DM_TR_NET,phase,lev,beat,performance.now(),t);
  var glow=g.createRadialGradient(W*.5,meshH*.49,0,W*.5,meshH*.49,Math.max(W,meshH)*.46);
  glow.addColorStop(0,'rgba(110,229,255,'+(0.07*fade+lev*.06*fade).toFixed(3)+')');
  glow.addColorStop(.52,'rgba(255,122,217,'+(0.035*fade).toFixed(3)+')');
  glow.addColorStop(1,'rgba(10,18,24,0)');
  g.fillStyle=glow;g.fillRect(0,0,W,meshH);

  var bands=3,pts=Math.max(44,Math.min(92,Math.floor(W/8))),i,b,y,x,amp,sp,u;
  for(b=0;b<bands;b++){
    g.beginPath();
    var base=meshH*(.43+b*.075),phase2=t*(.00105+b*.00018)+b*1.7;
    for(i=0;i<=pts;i++){
      u=i/pts;x=u*W;
      var idx=1+Math.min(DM_TR_SPEC?DM_TR_SPEC.length-1:1,Math.floor(Math.pow(Math.abs(u-.5)*2,1.7)*150));
      sp=DM_TR_SPEC?DM_TR_SPEC[idx]/255:0;
      amp=(5+b*2)+(sp*24)*(b===0?1:.72)+lev*(b===0?12:7);
      y=base+Math.sin(u*10.5+phase2)*amp*.34+Math.sin(u*25-phase2*1.4+b)*amp*.16;
      if(beat)y+=Math.sin(u*Math.PI*10+t*.008)*(7+lev*12);
      /* Hero-style wave glitch: micro horizontal tears + occasional gap */
      var wx=x+(DM_TR_GLITCH_V>0&&Math.random()>.5?(Math.random()-.5)*8:0);
      if(i===0)g.moveTo(wx,y);
      else if(Math.random()<(0.10+b*0.04))g.moveTo(wx,y); /* gap = broken waveform */
      else g.lineTo(wx,y);
    }
    g.strokeStyle=b===1?'rgba(255,122,217,'+(0.62*fade).toFixed(3)+')':'rgba(110,229,255,'+((.58+b*.06)*fade).toFixed(3)+')';
    g.lineWidth=b===0?1.7:1.0;g.shadowBlur=12+lev*10;g.shadowColor=b===1?'rgba(255,122,217,.5)':'rgba(110,229,255,.5)';g.stroke();g.shadowBlur=0;
  }
  var count=Math.min(42,Math.max(18,Math.floor(W/14)));
  for(i=0;i<count;i++){
    u=(i+.5)/count;
    var j=1+Math.min(DM_TR_SPEC?DM_TR_SPEC.length-1:1,Math.floor(Math.pow(Math.abs(u-.5)*2,1.8)*130));
    var sv=DM_TR_SPEC?DM_TR_SPEC[j]/255:0;
    var px=u*W,py=meshH*.5+Math.sin(t*.0013+i*1.73)*meshH*.17,rr=.8+sv*2.4+lev*1.6;
    if(beat&&i%3===0)px+=(i%2?-1:1)*(5+lev*14);
    g.globalAlpha=(.24+sv*.5+lev*.22)*fade;g.fillStyle=i%4===0?'#ff7ad9':'#6ee5ff';g.shadowBlur=8+sv*8;g.shadowColor=g.fillStyle;
    g.fillRect(px-rr*.5,py-rr*.5,rr*(1+sv*2),Math.max(1,rr*.55));
  }
  g.globalAlpha=1;
  if(beat){for(i=0;i<4;i++){y=Math.random()*meshH;g.fillStyle=(i&1)?'rgba(255,122,217,.16)':'rgba(110,229,255,.16)';g.fillRect(0,y,W,1+Math.random()*4);}}
  g.restore();
}
function dmTransitionStart(){
  if(DM_TR_RAF)return;
  dmTransitionGraph();
  var last=0,skip=0;
  function frame(now){
    DM_TR_RAF=requestAnimationFrame(frame);
    if(now-last<16)return;last=now;
    if(DM_TR_AN&&!GARG.paused){skip^=1;if(!skip)dmTransitionAnalyse(now);}
  }
  DM_TR_RAF=requestAnimationFrame(frame);
}
function dmTransitionStop(){
  if(DM_TR_RAF){cancelAnimationFrame(DM_TR_RAF);DM_TR_RAF=0;}
}

/* ---------- Neural Network Overlay: node menyambung satu per satu → lanjut di dumul.html ---------- */
/* ===== Teks decode/glitch "WELCOME TO THE GLITCH" di area kosong bawah og.webp (hanya overlay; stage/mesh tak disentuh) ===== */
var TP=null,TP_SCR='#%&*+=<>/\\|01';
function tpEase(x){return 1-(1-x)*(1-x);}
function tpFlash(el,cls,ms){el.classList.add(cls);setTimeout(function(){el.classList.remove(cls);},ms);}
function tpSet(o,txt){o.el.textContent=txt;if(o.gl)o.gl.setAttribute('data-text',txt);}
function tpInit(){
  var pre=document.getElementById('tesseract-pre'),head=document.getElementById('tp-head');
  if(!pre||!head){TP=null;return;}
  var red=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
  TP={red:red,lastGl:0,glDone:false,head:{el:head,lines:[],start:150},rows:[]};
  var hl=head.querySelectorAll('.tp-hl'),i,t,rows=pre.querySelectorAll('.tp-row');
  for(i=0;i<hl.length;i++)TP.head.lines.push({el:hl[i],gl:hl[i],text:hl[i].textContent,start:150+i*260,dur:640,lastSw:0,done:red});
  for(i=0;i<rows.length;i++){t=rows[i].querySelector('.tp-t');
    TP.rows.push({el:rows[i],t:{el:t,text:t.textContent,start:900+i*230,dur:520,lastSw:0,done:red},ld:false});}
  if(red){head.style.visibility='visible';for(i=0;i<TP.rows.length;i++)TP.rows[i].t.el.style.visibility='visible';}
  for(i=0;i<TP.head.lines.length;i++)TP.head.lines[i].gl.setAttribute('data-text',TP.head.lines[i].text);
}
/* Posisi: antara dasar stage (og.webp) dan atas kotak bar. Kalau sempit → diskalakan; terlalu sempit → disembunyikan (layout lama aman). */
function tpLayout(H){
  var pre=document.getElementById('tesseract-pre'),inner=document.getElementById('tp-inner');
  var ui=document.querySelector('#tesseract-warp .tesseract-ui');
  if(!pre||!inner||!ui)return;
  var top=Math.round(H)+6,avail=Math.floor(ui.getBoundingClientRect().top-6-top);
  if(avail<64){pre.style.display='none';return;}
  pre.style.display='flex';pre.style.top=top+'px';pre.style.height=avail+'px';
  inner.style.transform='none';
  var nat=inner.offsetHeight||1,sc=Math.min(1,avail/nat);
  if(sc<.6){pre.style.display='none';return;}
  inner.style.transform=sc<1?'scale('+sc.toFixed(3)+')':'none';
}
function tpDec(o,el){
  if(o.done)return;
  var p=(el-o.start)/o.dur;
  if(p<0){o.el.style.visibility='hidden';return;}
  o.el.style.visibility='visible';
  if(p>=1){tpSet(o,o.text);o.done=true;return;}
  if(el-o.lastSw<45)return;
  o.lastSw=el;
  var n=o.text.length,rev=Math.floor(p*p*n*1.1),out='',i,c;
  for(i=0;i<n;i++){c=o.text.charAt(i);out+=(i<rev||c===' ')?c:TP_SCR.charAt(Math.floor(Math.random()*TP_SCR.length));}
  tpSet(o,out);
}
function tpTick(el){
  if(!TP)return;
  var h=TP.head,i,r,hd=true;
  if(el>=h.start)h.el.style.visibility='visible';
  for(i=0;i<h.lines.length;i++){tpDec(h.lines[i],el);if(!h.lines[i].done)hd=false;}
  /* glitch judul: sekali pas selesai decode, lalu tiap ~1,8 dtk (kayak DUMUL kena tap) */
  if(!TP.red&&hd&&el-TP.lastGl>1800){TP.lastGl=el;tpFlash(h.el,'tp-gl',680);}
  for(i=0;i<TP.rows.length;i++){
    r=TP.rows[i];tpDec(r.t,el);
    if(r.t.done&&!r.ld&&!TP.red){r.ld=true;r.el.classList.add('ld');}
  }
}

function startTesseractWarp(targetUrl) {
  var warpOverlay = document.getElementById('tesseract-warp');
  if (!warpOverlay) { location.href = targetUrl; return; }
  var canvas = document.getElementById('tesseract-canvas');
  var stage = document.getElementById('tesseract-stage');
  var tctx = canvas.getContext('2d');
  var statusText = document.getElementById('tesseract-status');
  var progressBar = document.getElementById('tesseract-progress');
  /* HARD CUT: the old Gargantua canvas is the source of the giant sphere seen
     on mobile. Do not rely on visibility/stacking alone; remove it from layout
     while the DUMUL handoff owns the screen. */
  try {
    var oldSky = document.getElementById('sky');
    if(oldSky) oldSky.style.setProperty('display','none','important');
    var oldScan = document.querySelector('.scan');
    if(oldScan) oldScan.style.setProperty('display','none','important');
  } catch(e) {}
  document.body.classList.add('tesseract-running');
  warpOverlay.classList.add('active');
  warpOverlay.style.setProperty('display','block','important');
  warpOverlay.style.setProperty('opacity','1','important');
  warpOverlay.style.setProperty('visibility','visible','important');
  warpOverlay.style.setProperty('background','#0a1218','important');
  if(stage) {
    stage.style.setProperty('display','block','important');
    stage.style.setProperty('visibility','visible','important');
  }

  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W, H, net;
  DM_TR_NET=null; DM_TR_MESH_LAST=0;
  function resizeNeural() {
    /* Stage = full hero section (og.webp). Mesh lives in the 132px band = dumul hero canvas. */
    var hr = dmHeroRect();
    var newW = hr.w, newH = hr.h;
    var meshH = (typeof DM_MESH_H==='number'?DM_MESH_H:132);
    var prevW = DM_TR_MESH_W || 0;
    W = newW; H = newH;
    /* Mesh = kotak kanvas asli hero dumul.html (x, y, lebar) → node mendarat di titik yang sama. */
    var mr = hr.m, meshW = mr.w;
    DM_TR_MESH_X = mr.x; DM_TR_MESH_Y = mr.y;
    stage.style.width = W + 'px'; stage.style.height = H + 'px';
    stage.style.backgroundImage='none';
    var _og=stage.querySelector('.tesseract-og');
    if(_og){var _s=_og.style;_s.setProperty('inset','auto','important');_s.setProperty('max-width','none','important');_s.setProperty('object-fit','fill','important');_s.left=hr.img.x+'px';_s.top=hr.img.y+'px';_s.width=hr.img.w+'px';_s.height=hr.img.h+'px';_s.setProperty('-webkit-mask-image',hr.mask);_s.setProperty('mask-image',hr.mask);}
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    canvas.width = Math.max(1, Math.round(W * dpr));
    canvas.height = Math.max(1, Math.round(H * dpr));
    tctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if(!DM_TR_NET || !DM_TR_NET.length){
      DM_TR_NET = dmSpectrumMeshBuild(meshW, meshH);
    } else if(prevW > 0 && Math.abs(prevW - meshW) > 1){
      var sx = meshW / prevW, mi, n;
      for(mi=0;mi<DM_TR_NET.length;mi++){
        n=DM_TR_NET[mi];
        n.x*=sx; n.ox*=sx; n.vx*=sx;
      }
    }
    DM_TR_MESH_W = meshW; DM_TR_MESH_H = meshH;
    net = DM_TR_NET;
    tpLayout(H);
  }
  tpInit();
  resizeNeural();
  var onResize = function() { resizeNeural(); };
  window.addEventListener('resize', onResize);

  var startTime = performance.now();
  var duration = DM_NN_DUR;
  var statusMessages = [
    '> INITIALIZING NEURAL CORE...',
    '> SYNAPSE FREQUENCY ALIGNED...',
    '> PROCESSING SIGNAL INTERFERENCE...',
    '> TRANSMITTING MEMORY NODES...',
    '> NEURAL SYNC COMPLETE!',
    '> ENTERING DUMUL PROJECT...'
  ];

  try { if (typeof GARG !== 'undefined' && GARG) { dmTransitionGraph(); GARG.play().catch(function(){}); } } catch (e) {}
  dmTransitionStart();

  var finished = false;

  function render(time) {
    if (finished) return;
    var elapsed = Math.max(0, time - startTime), progress = Math.min(1, elapsed / duration);
    if (progressBar) progressBar.style.width = (progress * 100) + '%';
    if (statusText) {
      var msgIdx = Math.min(statusMessages.length - 1, Math.floor(progress * statusMessages.length));
      statusText.textContent = statusMessages[msgIdx];
    }
    dmTransitionSpectrum(tctx, W, H, elapsed, 1);
    tpTick(elapsed);

    if (progress < 1) {
      requestAnimationFrame(render);
    } else {
      finished = true;
      dmTransitionStop();
      window.removeEventListener('resize', onResize);
      try {
        try{
          var _meshNodes=(DM_TR_NET||[]).map(function(n){return{x:n.x,y:n.y,ox:n.ox,oy:n.oy,vx:n.vx,vy:n.vy,r:n.r,color:n.color,glow:n.glow,phase:n.phase};});
          /* Save in hero-canvas space (W x 132), not full stage height — so dumul restores 1:1. */
          sessionStorage.setItem('dm_spectrum_mesh',JSON.stringify({w:(DM_TR_MESH_W||W),h:DM_MESH_H||132,nodes:_meshNodes,level:DM_TR_LEVEL||0,beatAge:(DM_TR_BEAT?Math.max(0,performance.now()-DM_TR_BEAT):9999)}));
        }catch(e){}
        sessionStorage.setItem('dm_collapsars_t', String(typeof GARG !== 'undefined' && GARG && GARG.currentTime || 0));
        sessionStorage.setItem('dm_collapsars_from', 'swallow');
        try{
          var _specSnap=null;
          if(DM_TR_SPEC&&DM_TR_SPEC.length){
            _specSnap=Array.prototype.slice.call(DM_TR_SPEC,0,Math.min(DM_TR_SPEC.length,256));
          }
          var _t=(typeof GARG!=='undefined'&&GARG)?(GARG.currentTime||0):0;
          sessionStorage.setItem('dm_visual_state', JSON.stringify({
            t:_t, phase:_t, from:'dumul-transition',
            level:DM_TR_LEVEL||0,
            beatAge:(DM_TR_BEAT?Math.max(0,performance.now()-DM_TR_BEAT):9999),
            mix:1,
            spec:_specSnap
          }));
        }catch(e){
          sessionStorage.setItem('dm_visual_state', JSON.stringify({t:(typeof GARG!=='undefined'&&GARG)?GARG.currentTime:0, phase:(typeof GARG!=='undefined'&&GARG)?GARG.currentTime:0, from:'dumul-transition'}));
        }
      } catch (e) {}
      location.href = targetUrl;
    }
  }
  requestAnimationFrame(render);
}

function startSwallow(href){
  if(SW)return;
  if(typeof markWentToDumul==='function')markWentToDumul();
  /* Gargantua's swallow SFX/BGM is glitch-instrumental.opus (GARG). Kill every
     other audio channel first (star SFX, collapsars HUD, ambient) so GARG never
     stacks on top of a playing stellar track. GARG IS the transition BGM —
     dumul.html resumes the same track (Limerence album, track 1) from the
     handed-off position. */
  try{
    if(typeof activeSfx!=='undefined'&&activeSfx){
      try{activeSfx.onended=null;}catch(e){}
      safePause(activeSfx);
      try{activeSfx.currentTime=0;}catch(e){}
      activeSfx=null;
    }
    if(typeof SFX!=='undefined'){
      Object.keys(SFX).forEach(function(k){try{safePause(SFX[k]);}catch(e){}});
    }
    safePause(MUSIC_COLLAP);
    if(typeof audioVizOff==='function')audioVizOff();
    if(typeof setAVColor==='function')setAVColor(null,true);
    if(typeof musicForceStop==='function'){try{musicForceStop();}catch(e){}}
  }catch(e){}
  /* Sky/UI swirl needs ~2.8s (delay≤940 + duration≤2000). Opaque tesseract
     canvas must NOT start earlier or the swallow is visually cut off.
     SW.dur tracks the sky pull only; redirect is owned by startTesseractWarp. */
  var SWALLOW_MS=2800;
  var TESS_MS=5600;
  SW={t0:performance.now(),dur:SWALLOW_MS};
  /* BGM starts on the same user gesture (autoplay). Tesseract starts AFTER swallow. */
  setTimeout(function(){startTesseractWarp(href);},SWALLOW_MS);
  document.body.classList.add('sw');
  fadeTo(AMB,0,900);
  GARG.currentTime=0;GARG.volume=0;
  dmTransitionGraph();
  dmTransitionStart();
  fadeTo(GARG,.55,1800);
  var pf=document.createElement('link');pf.rel='prefetch';pf.href=href;document.head.appendChild(pf);
  /* Include music toggle/HUD + side chrome so YT/IG aren't the only icons
     that fly into Gargantua — previously #music-toggle was left out. */
  var els=[].slice.call(document.querySelectorAll('#title,#header .sub,footer nav a,footer .quote,.portal,.cap,#music-toggle,#music-player,#mp-now-playing,#owl-source,#bh-clock,#signal-fragment,#cons-archive,#mode-cluster,#mode-observe,#mode-silence,#last-signal')).filter(function(el){
    // Jangan ikutkan panel music-player ke animasi jika panel sedang tidak terbuka (.open)
    if(el.id === 'music-player' && !el.classList.contains('open')) return false;
    // Fragment / archive toast only if currently visible
    if((el.id === 'signal-fragment' || el.id === 'cons-archive' || el.id === 'last-signal') && !el.classList.contains('on')) return false;
    return true;
  });
  var maxD=Math.sqrt(W*W+H*H)*.6;
  els.forEach(function(el){
    var r=(el.closest&&el.closest('#stage'))?vrect(el):el.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
    var dx=cx-BH.x,dy=cy-BH.y,rad=Math.sqrt(dx*dx+dy*dy)+.001,th=Math.atan2(dy,dx);
    var base=getComputedStyle(el).transform;base=(base&&base!=='none')?base+' ':'';
    var swirl=2.6+Math.random()*1.2,N=18,frames=[];
    for(var j=0;j<=N;j++){
      var u=j/N,k=u*u,r2=rad*Math.pow(1-k,1.35),t2=th+k*swirl;
      var tx=BH.x+Math.cos(t2)*r2-cx,ty=BH.y+Math.sin(t2)*r2-cy;
      frames.push({transform:base+'translate('+tx.toFixed(1)+'px,'+ty.toFixed(1)+'px) rotate('+(k*swirl*28.6).toFixed(1)+'deg) scale('+(1-.97*k).toFixed(3)+')',opacity:(1-Math.pow(k,2.4)).toFixed(3)});
    }
    var delay=140+Math.min(1,rad/maxD)*800;
    if(el.animate)el.animate(frames,{duration:1700+Math.random()*300,delay:delay,easing:'linear',fill:'forwards'});
    else el.style.opacity=0;
  });
  [].slice.call(document.querySelectorAll('.hit,#bh')).forEach(function(el){el.style.opacity=0;});
  setTimeout(function(){$('#veil').classList.add('on');},SW.dur-600);
  setTimeout(function(){
    /* Hand off collapsars playback position so dumul.html can continue
       instead of restarting the bed from 0 after the page load. Redirect
       aktual sekarang dilakukan oleh startTesseractWarp() di ~8400ms (2800 swallow + 5600 tess), supaya
       overlay warp sempat selesai dulu sebelum halaman benar-benar pindah. */
    try{
      sessionStorage.setItem('dm_collapsars_t',String(GARG&&GARG.currentTime||0));
      sessionStorage.setItem('dm_collapsars_from','swallow');
      try{
        var _t2=GARG&&GARG.currentTime||0;
        var _spec2=null;
        if(typeof DM_TR_SPEC!=='undefined'&&DM_TR_SPEC&&DM_TR_SPEC.length){
          _spec2=Array.prototype.slice.call(DM_TR_SPEC,0,Math.min(DM_TR_SPEC.length,256));
        }
        sessionStorage.setItem('dm_visual_state',JSON.stringify({
          t:_t2,phase:_t2,from:'dumul-transition',
          level:(typeof DM_TR_LEVEL!=='undefined'?DM_TR_LEVEL:0)||0,
          beatAge:(typeof DM_TR_BEAT!=='undefined'&&DM_TR_BEAT?Math.max(0,performance.now()-DM_TR_BEAT):9999),
          mix:1,spec:_spec2
        }));
      }catch(e2){
        sessionStorage.setItem('dm_visual_state',JSON.stringify({t:GARG&&GARG.currentTime||0,phase:GARG&&GARG.currentTime||0,from:'dumul-transition'}));
      }
    }catch(e){}
  },SW.dur);
}

/* ---------- gambar ---------- */
/* Galaxy sprites: CanvasGradient is bound to the transform at creation time, so
   caching the gradient object itself is unsafe under per-frame translate/rotate.
   Pre-render each colour scheme once to an offscreen canvas; drawImage scales
   the pulse. Eliminates createRadialGradient + color-stop work every frame. */
var GALAXY_SPRITE_CACHE=Object.create(null);
function getGalaxySprite(gc){
  var key=gc.core+'|'+gc.outer+'|'+gc.halo;
  var hit=GALAXY_SPRITE_CACHE[key];
  if(hit)return hit;
  /* Canonical size matching the old (6+5*scale≈11, 2.6+2.4*scale≈5) at scale=1. */
  var bw=11,bh=5;
  var pad=Math.ceil(bw*2.05);
  var sc=document.createElement('canvas');
  sc.width=sc.height=pad*2;
  var sg=sc.getContext('2d');
  sg.translate(pad,pad);
  var halo=sg.createRadialGradient(0,0,0,0,0,bw*1.9);
  halo.addColorStop(0,'rgba('+gc.core+',.20)');
  halo.addColorStop(.30,'rgba('+gc.outer+',.09)');
  halo.addColorStop(.68,'rgba('+gc.halo+',.045)');
  halo.addColorStop(1,'rgba('+gc.halo+',0)');
  sg.fillStyle=halo;sg.globalAlpha=.78;
  sg.beginPath();sg.ellipse(0,0,bw*1.7,bh*1.8,0,0,6.283);sg.fill();
  sg.globalAlpha=.255;sg.strokeStyle='rgba('+gc.outer+',.82)';sg.lineWidth=.5;
  sg.beginPath();sg.ellipse(0,0,bw,bh,.06,0,6.283);sg.stroke();
  sg.globalAlpha=.15;sg.strokeStyle='rgba('+gc.halo+',.78)';sg.lineWidth=.55;
  sg.beginPath();sg.ellipse(0,0,bw*.62,bh*.52,.12,0,6.283);sg.stroke();
  sg.globalAlpha=1;sg.fillStyle='rgba('+gc.core+',.30)';
  sg.beginPath();sg.ellipse(0,0,Math.max(.8,bw*.17),Math.max(.55,bh*.24),0,0,6.283);sg.fill();
  sg.fillStyle='rgba(5,11,18,0.45)';
  sg.beginPath();sg.ellipse(0,0,bw*1.2,bh*0.15,0,0,6.283);sg.fill();
  hit={c:sc,pad:pad,bw:bw,bh:bh};
  GALAXY_SPRITE_CACHE[key]=hit;
  return hit;
}
function drawDistantGalaxies(now){
  /* Tiny, faint galaxies: deliberately small so they read as very distant objects. */
  for(var i=0;i<GAL.length;i++){
    var d=GAL[i],px=d.x*W+mouse.x*d.rx*8,py=d.y*H+mouse.y*d.ry*6;
    var pulse=.84+.16*Math.sin(now*.00022*d.tw+d.p);
    /* Match previous radius formulas; pulse rides on drawImage scale. */
    var w=(6+5*d.scale)*pulse,h=(2.6+2.4*d.scale)*pulse;
    var gc=d.col||{core:'255,225,185',outer:'205,225,255',halo:'135,175,230'};
    var sp=getGalaxySprite(gc);
    var sx=w/sp.bw,sy=h/sp.bh;
    g.save();
    g.translate(px,py);
    g.rotate(d.rot+Math.sin(now*.00007+d.p)*.04);
    g.scale(sx,sy);
    g.drawImage(sp.c,-sp.pad,-sp.pad);
    g.restore();
  }
}
/* ---- Teleskop x sektor ----
   Home/overview : teleskop ngorbit IKON sektor yang SFX-nya lagi aktif.
   Dalam sektor sumber : ngorbit bintangnya (alur lama via triggerSupernova).
   Sektor lain (SFX aktif di sektor berbeda) : teleskop "sibuk", menghilang + bubble pamit. */
var TELE_BUSY_MSG=["I'm busy tracking {s}. Can't come along.","Occupied. The signal in {s} still needs me.","Not now. I'm still listening to {s}.","Sorry. {s} has my lens for now."];
function teleStarFollow(key){
  var tr=TRIGGERS[key];if(!tr)return null;
  var c=tr.cons==='pleiades'?PLEIADES:cons(tr.cons);if(!c)return null;
  var st=tr.cons==='pleiades'?PLEIADES.bright.filter(function(z){return z.name===tr.star;})[0]:c.stars[tr.star];
  if(!st)return null;
  return function(){
    var fx=tr.cons==='pleiades'?(PLEIADES.x+st.x*PLEIADES.scale+mouse.x*1.4+skyPan.x):(st.x+c.ox),
        fy=tr.cons==='pleiades'?(PLEIADES.y+st.y*PLEIADES.scale+mouse.y*1.0+skyPan.y):(st.y+c.oy);
    return skyXF(fx,fy);
  };
}
function teleIconFollow(sc){
  return function(){
    if(sc.bx==null)return null;
    return skyXF(sc.bx+(SECT.mx||0),sc.by+(SECT.my||0));
  };
}
function teleSectorLogic(dt){
  var T=TELESCOPE;
  if(SW)return;
  var on=!!(activeSfx&&!activeSfx.paused&&!activeSfx.ended);
  var key=on?keyFromAudio(activeSfx):null,src=on?sfxSector():null,away=false;
  if(src){
    if(SECT.cur&&src!==SECT.cur)away=true;
    else if(SECT.busy&&SECT.phase==='in'&&SECT.target&&SECT.target!==src)away=true;
    if(SECT.on||SECT.busy||away){                                   /* berbasis ikon sektor */
      if(T.followKind!=='icon'||T.followSect!==src){
        T.follow=teleIconFollow(src);T.followKind='icon';T.followSect=src;
        T.orbitR=Math.max(40,Math.max(20,Math.min(30,W*.07))+18);
        if(T.mode==='drift')T.mode='warp';
      }
    }else if(SECT.cur===src&&T.followKind==='icon'){                /* masuk sektor sumber: pindah ke bintangnya */
      var sf=key?teleStarFollow(key):null;
      if(sf){T.follow=sf;T.followKind='star';T.followSect=null;T.orbitR=38;T.mode='warp';T.onWarpComplete=null;}
    }
  }
  if(!T.follow)T.followKind=null;
  /* sibuk: fade out + bubble sekali per masuk sektor */
  T.away=away;
  T.al+=((away?0:1)-T.al)*Math.min(1,dt*6);
  if(T.al>.985)T.al=1;
  if(away&&SECT.cur&&!T.busyShown){
    T.busyShown=true;
    try{
      if(TG&&TG.el&&typeof tgShow==='function'){
        var nm=src.name||'another sector',m=TELE_BUSY_MSG[(Math.random()*TELE_BUSY_MSG.length)|0].replace('{s}',nm);
        TG.anchor=[(W||innerWidth)*.5,(H||innerHeight)*.34];
        tgShow(m);
      }
    }catch(eB){}
  }
  if(!away)T.busyShown=false;
}
function drawFloatingTelescope(now){
  /* Free-floating telescope: drift / warp / orbit state machine.
     Warp + orbit triggered by star supernova; otherwise inertial drift. */
  if(!TELESCOPE.init){
    TELESCOPE.init=true;
    /* Only seed free-float pose when not already warping (e.g. star tapped before first draw). */
    if(TELESCOPE.mode!=='warp'&&TELESCOPE.mode!=='orbit'){
      TELESCOPE.x=W*(.18+Math.random()*.64);
      TELESCOPE.y=H*(.16+Math.random()*.62);
      TELESCOPE.vx=(Math.random()<.5?-1:1)*(1.2+Math.random()*2.2);
      TELESCOPE.vy=(Math.random()<.5?-1:1)*(.8+Math.random()*1.6);
      TELESCOPE.tx=TELESCOPE.vx;TELESCOPE.ty=TELESCOPE.vy;
      TELESCOPE.ang=Math.random()*6.283;
      TELESCOPE.va=(Math.random()-.5)*.004;
      TELESCOPE.next=now+16000+Math.random()*18000;
      TELESCOPE.mode='drift';
    }else if(!TELESCOPE.x&&!TELESCOPE.y){
      /* Warp requested before layout: seed a start point so glide has somewhere to leave from. */
      TELESCOPE.x=W*(.18+Math.random()*.64);
      TELESCOPE.y=H*(.16+Math.random()*.62);
      TELESCOPE.ang=Math.random()*6.283;
      TELESCOPE.va=0;
      TELESCOPE.next=now+16000+Math.random()*18000;
    }
  }
  var dt=Math.min(40,Math.max(0,now-(TELESCOPE.last||now)))/1000;
  TELESCOPE.last=now;
  try{teleSectorLogic(dt);}catch(eTs){}

  /* --- Movement logic by mode --- */
  if((TELESCOPE.mode==='warp'||TELESCOPE.mode==='orbit')&&TELESCOPE.follow){
    var fq=TELESCOPE.follow();
    if(fq){TELESCOPE.targetX=fq[0];TELESCOPE.targetY=fq[1];}
  }
  if(TELESCOPE.mode==='warp'){
    /* Fast glide toward the target star */
    var dx=TELESCOPE.targetX-TELESCOPE.x;
    var dy=TELESCOPE.targetY-TELESCOPE.y;
    var dist=Math.hypot(dx,dy);

    TELESCOPE.x+=dx*Math.min(1,dt*7.5);
    TELESCOPE.y+=dy*Math.min(1,dt*7.5);
    TELESCOPE.ang+=dt*5.0; /* Spin while warping */

    /* Arrived near the star (< 25px) */
    if(dist<25){
      TELESCOPE.mode='orbit';
      TELESCOPE.ocx=TELESCOPE.targetX;TELESCOPE.ocy=TELESCOPE.targetY;
      TELESCOPE.orbitAngle=Math.atan2(dy,dx);
      if(typeof TELESCOPE.onWarpComplete==='function'){
        TELESCOPE.onWarpComplete();
        TELESCOPE.onWarpComplete=null;
      }
    }
  }else if(TELESCOPE.mode==='orbit'){
    /* Stay in orbit while SFX is still playing */
    var sfxActive=activeSfx&&!activeSfx.paused&&!activeSfx.ended;
    if(!sfxActive){
      /* SFX finished/paused → free drift again */
      TELESCOPE.mode='drift';TELESCOPE.follow=null;
      TELESCOPE.vx=(Math.random()<.5?-1:1)*(1.4+Math.random()*1.8);
      TELESCOPE.vy=(Math.random()<.5?-1:1)*(1.0+Math.random()*1.4);
      TELESCOPE.tx=TELESCOPE.vx;
      TELESCOPE.ty=TELESCOPE.vy;
    }else{
      /* Orbit the active star */
      TELESCOPE.orbitAngle+=dt*1.2;
      var orbitRadius=TELESCOPE.orbitR||38;
      var ok=Math.min(1,dt*9);
      TELESCOPE.ocx+=(TELESCOPE.targetX-TELESCOPE.ocx)*ok;TELESCOPE.ocy+=(TELESCOPE.targetY-TELESCOPE.ocy)*ok;
      TELESCOPE.x=TELESCOPE.ocx+Math.cos(TELESCOPE.orbitAngle)*orbitRadius;
      TELESCOPE.y=TELESCOPE.ocy+Math.sin(TELESCOPE.orbitAngle)*orbitRadius;
      TELESCOPE.ang=TELESCOPE.orbitAngle+Math.PI/2; /* Face tangent to orbit */
    }
  }else{
    /* Mode 'drift' — original free-float motion */
    if(now>TELESCOPE.next){
      var a=Math.random()*6.283,sp=1.1+Math.random()*2.4;
      TELESCOPE.tx=Math.cos(a)*sp;
      TELESCOPE.ty=Math.sin(a)*sp*.72;
      TELESCOPE.va+=(Math.random()-.5)*.0015;
      TELESCOPE.va=clamp(TELESCOPE.va,-.006,.006);
      TELESCOPE.next=now+16000+Math.random()*18000;
    }
    var ease=Math.min(1,dt*.035);
    TELESCOPE.vx+=(TELESCOPE.tx-TELESCOPE.vx)*ease;
    TELESCOPE.vy+=(TELESCOPE.ty-TELESCOPE.vy)*ease;
    TELESCOPE.x+=TELESCOPE.vx*dt;
    TELESCOPE.y+=TELESCOPE.vy*dt;
    TELESCOPE.ang+=TELESCOPE.va*dt;

    /* Soft bounce inside the viewport — avoids the old toroidal teleport that
       made the telescope flicker/jump on mobile near the edges. */
    var mX=Math.max(48,W*.08),mY=Math.max(56,H*.10);
    if(TELESCOPE.x<mX){TELESCOPE.x=mX;TELESCOPE.vx=Math.abs(TELESCOPE.vx);TELESCOPE.tx=Math.abs(TELESCOPE.tx||TELESCOPE.vx);}
    else if(TELESCOPE.x>W-mX){TELESCOPE.x=W-mX;TELESCOPE.vx=-Math.abs(TELESCOPE.vx);TELESCOPE.tx=-Math.abs(TELESCOPE.tx||TELESCOPE.vx);}
    if(TELESCOPE.y<mY){TELESCOPE.y=mY;TELESCOPE.vy=Math.abs(TELESCOPE.vy);TELESCOPE.ty=Math.abs(TELESCOPE.ty||TELESCOPE.vy);}
    else if(TELESCOPE.y>H-mY){TELESCOPE.y=H-mY;TELESCOPE.vy=-Math.abs(TELESCOPE.vy);TELESCOPE.ty=-Math.abs(TELESCOPE.ty||TELESCOPE.vy);}
  }

  /* margin used by edge-wrap ghost copies during draw (all modes). */
  var margin=110;
  var lensD=Math.hypot(TELESCOPE.x-BH.x,TELESCOPE.y-BH.y);
  var lensMag=1+0.16*clamp((BH.Rr*8-lensD)/(BH.Rr*8),0,1);
  var sc=Math.max(.18,Math.min(.24,W/600))*lensMag;

  /* Small distant scene object; still participates fully in Gargantua's gravity. */
  var swallowedTelescope=null;
  if(SW){
    swallowedTelescope=pull(TELESCOPE.x,TELESCOPE.y);
    if(swallowedTelescope[2]>.985)return;
  }

  var copies=SW?[[0,0]]:[[0,0]];
  if(TELESCOPE.x<margin)copies.push([W,0]);
  if(TELESCOPE.x>W-margin)copies.push([-W,0]);
  if(TELESCOPE.y<margin)copies.push([0,H]);
  if(TELESCOPE.y>H-margin)copies.push([0,-H]);
  var baseCopies=copies.slice();
  for(var ci=0;ci<baseCopies.length;ci++){
    var bx=baseCopies[ci][0],by=baseCopies[ci][1];
    if(TELESCOPE.y<margin&&TELESCOPE.x<margin)copies.push([bx+W,by+H]);
    if(TELESCOPE.y<margin&&TELESCOPE.x>W-margin)copies.push([bx-W,by+H]);
    if(TELESCOPE.y>H-margin&&TELESCOPE.x<margin)copies.push([bx+W,by-H]);
    if(TELESCOPE.y>H-margin&&TELESCOPE.x>W-margin)copies.push([bx-W,by-H]);
  }

  /* Cache the on-screen position of the primary body for hit-testing.
     Must match what the user actually sees (lens + BH), not raw world coords. */
  var primaryTQ=SW?swallowedTelescope:lens(TELESCOPE.x,TELESCOPE.y);
  if(primaryTQ&&primaryTQ[0]!=null){
    TELESCOPE.sx=primaryTQ[0];TELESCOPE.sy=primaryTQ[1];
  }else{
    TELESCOPE.sx=TELESCOPE.x;TELESCOPE.sy=TELESCOPE.y;
  }
  TELESCOPE.hitR=telescopeHitRadius();

  for(var ci=0;TELESCOPE.al>.02&&ci<copies.length;ci++){
    var tqx=TELESCOPE.x+copies[ci][0],tqy=TELESCOPE.y+copies[ci][1];
    var tq=SW?swallowedTelescope:lens(tqx,tqy);
    if(!tq)continue;

    g.save();
    g.translate(tq[0],tq[1]);
    g.rotate(TELESCOPE.ang);
    g.scale(sc,sc);
    g.globalAlpha=TELESCOPE.al;

    /*
      Solid Hubble-like silhouette.
      The previous version looked like a flat transparent icon because the
      panels and body were mostly line-art. Here every major surface is filled
      with opaque material, with perspective, bevels, panel cells and a deep
      optical aperture to give it physical volume.
    */

    /* Solar-array shadow/spine — kept behind the instrument body. */
    g.fillStyle='rgb(17,22,27)';
    g.fillRect(-9,-48,4,96);

    /* Solar panels sit ABOVE and BELOW the barrel, leaving the optical end completely clear. */
    function solarWing(side){
      var sy=side<0?-1:1;
      var y0=sy*15, y1=sy*52;
      var x0=-10, x1=18;
      g.fillStyle='rgb(25,38,48)';
      g.strokeStyle='rgb(158,171,180)';g.lineWidth=1.0;
      g.beginPath();
      g.moveTo(x0,y0);g.lineTo(x1,y0+sy*3);g.lineTo(x1,y1);g.lineTo(x0,y1-sy*3);g.closePath();g.fill();g.stroke();

      /* Dense photovoltaic cells, with a slight blue-black metallic sheen. */
      var rows=4,cols=5;
      for(var r=0;r<rows;r++)for(var c=0;c<cols;c++){
        var xa=x0+1+c*(27/cols), xb=x0+1+(c+1)*(27/cols)-.7;
        var ya=sy<0 ? y0-1-r*(34/rows)-7 : y0+1+r*(34/rows);
        var yy=Math.min(ya,ya+sy*7), hh=6.2;
        g.fillStyle=((r+c)%2)?'rgb(30,55,70)':'rgb(19,42,58)';
        g.fillRect(xa,yy,Math.max(1,xb-xa),hh);
        g.strokeStyle='rgb(83,111,124)';g.lineWidth=.28;g.strokeRect(xa,yy,Math.max(1,xb-xa),hh);
      }
      g.strokeStyle='rgb(191,201,207)';g.lineWidth=.55;
      g.beginPath();g.moveTo(x0,y0);g.lineTo(x0,y1);g.moveTo(x1,y0+sy*3);g.lineTo(x1,y1);g.stroke();
    }
    solarWing(-1);solarWing(1);

    /* Panel hinges/booms attach to the SIDE of the barrel, not across the lens. */
    g.strokeStyle='rgb(190,201,207)';g.lineWidth=1.15;
    g.beginPath();
    g.moveTo(-3,-11);g.lineTo(-3,-17);
    g.moveTo(10,-10);g.lineTo(10,-17);
    g.moveTo(-3,11);g.lineTo(-3,17);
    g.moveTo(10,10);g.lineTo(10,17);
    g.stroke();
    g.fillStyle='rgb(88,103,113)';
    g.fillRect(-5,-19,4,4);g.fillRect(8,-19,4,4);g.fillRect(-5,15,4,4);g.fillRect(8,15,4,4);

    /* Main telescope barrel: opaque metal with longitudinal shading. */
    var body=g.createLinearGradient(-18,-15,30,15);
    body.addColorStop(0,'rgb(238,241,243)');
    body.addColorStop(.18,'rgb(208,216,222)');
    body.addColorStop(.52,'rgb(145,157,166)');
    body.addColorStop(.80,'rgb(89,102,111)');
    body.addColorStop(1,'rgb(48,57,64)');
    g.fillStyle=body;
    g.strokeStyle='rgb(226,233,237)';g.lineWidth=1.15;
    g.beginPath();
    if(g.roundRect)g.roundRect(-22,-13,52,26,8);else g.rect(-22,-13,52,26);
    g.fill();g.stroke();

    /* Subtle body ribs / equipment bands. */
    g.strokeStyle='rgb(92,104,113)';g.lineWidth=.75;
    [-15,17].forEach(function(xx){
      g.beginPath();g.moveTo(xx,-11);g.lineTo(xx,11);g.stroke();
    });
    g.strokeStyle='rgb(244,246,247)';g.lineWidth=.7;
    g.beginPath();g.moveTo(-13,-11);g.lineTo(15,-11);g.stroke();

    /* Front optical assembly: deep metal rim + glass lens, never covered by the arrays. */
    g.fillStyle='rgb(170,181,188)';
    g.strokeStyle='rgb(236,241,244)';g.lineWidth=1.15;
    g.beginPath();g.ellipse(30,0,11.8,13.7,0,0,6.283);g.fill();g.stroke();

    /* Recessed inner barrel. */
    g.fillStyle='rgb(57,67,74)';
    g.beginPath();g.ellipse(31,0,9.8,11.7,0,0,6.283);g.fill();

    /* Actual optical glass: dark blue/grey rather than a flat black hole. */
    var glass=g.createRadialGradient(28,-3,1,31,0,9.3);
    glass.addColorStop(0,'rgb(86,111,123)');
    glass.addColorStop(.35,'rgb(35,54,64)');
    glass.addColorStop(.78,'rgb(10,18,23)');
    glass.addColorStop(1,'rgb(2,5,7)');
    g.fillStyle=glass;
    g.beginPath();g.ellipse(32,0,7.9,9.7,0,0,6.283);g.fill();
    g.strokeStyle='rgb(119,139,148)';g.lineWidth=.55;
    g.beginPath();g.ellipse(32,0,7.9,9.7,0,0,6.283);g.stroke();

    /* Glass reflection / curved highlight gives the tiny lens some depth. */
    g.strokeStyle='rgba(225,239,245,.78)';g.lineWidth=.75;
    g.beginPath();g.arc(29,-2.6,8.5,-2.55,-1.02);g.stroke();
    g.strokeStyle='rgba(117,201,224,.35)';g.lineWidth=.55;
    g.beginPath();g.arc(33,2.4,6.2,.35,1.85);g.stroke();

    /* Rear service cap and small antenna, giving the body a front/back read. */
    g.fillStyle='rgb(78,89,97)';
    g.strokeStyle='rgb(201,211,217)';g.lineWidth=.85;
    g.beginPath();g.ellipse(-22,0,4.5,12,0,0,6.283);g.fill();g.stroke();
    g.fillStyle='rgb(176,188,195)';
    g.fillRect(-27,-2,4,4);
    g.strokeStyle='rgb(146,162,171)';g.lineWidth=.8;
    g.beginPath();g.moveTo(-25,0);g.lineTo(-33,0);g.stroke();
    /* Beacon LED status light on rear antenna tip (observatory satellite feel) */
    var beacon=Math.sin(now*0.006)>0.6?1:0.15;
    g.fillStyle='rgba(110,229,255,'+beacon+')';
    g.beginPath();g.arc(-34,0,1.8,0,6.283);g.fill();

    /* Small service-box details: opaque and restrained. */
    g.fillStyle='rgb(91,105,114)';g.fillRect(-4,-15,9,3);g.fillRect(-3,12,8,3);
    g.fillStyle='rgb(211,220,225)';g.fillRect(0,-14,4,2);g.fillRect(0,12,4,2);

    g.restore();
  }
}

function drawBg(now){
  /* Twinkle half the field each frame (even/odd index by time) — cuts sin+fill
     work ~50% with almost no visual difference on sparse background stars. */
  var twPhase=(now/120|0)&1;
  var R=BH.Rr,o2=(R*9.5)*(R*9.5);
  for(var i=0;i<BG.length;i++){
    var b=BG[i],x=b.x+mouse.x*b.d*14,y=b.y+mouse.y*b.d*10,k=0;
    if(SW){var q=pull(x,y);x=q[0];y=q[1];k=q[2];}
    else{
      /* Cheap far skip before lens(): most BG stars never enter the well. */
      var dx=x-BH.x,dy=y-BH.y;
      if(dx*dx+dy*dy>=o2){
        var twF=reduce?1:((i&1)===twPhase?(.6+.4*Math.sin(now*.001*b.s+b.p)):b._tw||.8);
        b._tw=twF;
        g.fillStyle='rgba('+b.c+','+(b.a*twF)+')';
        g.beginPath();g.arc(x,y,b.r,0,6.283);g.fill();
        continue;
      }
    }
    var l=lens(x,y);if(!l)continue;
    var tw=reduce?1:(.6+.4*Math.sin(now*.001*b.s+b.p));
    g.fillStyle='rgba('+b.c+','+(b.a*tw*(1-.85*k))+')';
    g.beginPath();g.arc(l[0],l[1],b.r*(1-.5*k),0,6.283);g.fill();
  }
}
/* ---------- [FITUR 2] Synthesizer Chime untuk Bintang Biasa (Web Audio) ---------- */
function playStarChime(s){
  if(typeof RADIO_SILENCE!=='undefined'&&RADIO_SILENCE)return;
  try {
    /* Must build the full analyser graph — never leave a bare AudioContext
       that later star-SFX MediaElementSources would connect into incorrectly. */
    if(typeof ensureAVGraph==='function'){if(!ensureAVGraph())return;}
    else{
      var AC = window.AudioContext || window.webkitAudioContext;
      if(!AV.ctx && AC) AV.ctx = new AC();
    }
    if(!AV.ctx) return;
    unlockAudioGraph();

    var osc = AV.ctx.createOscillator();
    var gain = AV.ctx.createGain();
    osc.type = 'sine'; // Nada murni kosmik Bell/Chime

    // Frekuensi pitch mengikuti warna bintang (merah = bass, biru = nada tinggi)
    var freq = 520;
    if(s.c){
      if(s.c.includes('ff8e')||s.c.includes('ff45')||s.c.includes('ffb2')||s.c.includes('ffb4')) freq = 261.63; // C4 (Merah/Hingga)
      else if(s.c.includes('ffe9')||s.c.includes('ffe0')) freq = 329.63; // E4 (Kuning)
      else if(s.c.includes('bfe0')||s.c.includes('cfeeff')||s.c.includes('7dd8')) freq = 659.25; // E5 (Biru Muda)
      else if(s.c.includes('eaf6')||s.c.includes('f0f6')) freq = 783.99; // G5 (Putih/Biru)
    }
    freq *= (1 + ((s.r||1.5)-1.5)*0.08); // Bintang lebih besar sedikit lebih dalam

    var nowTime = AV.ctx.currentTime;
    osc.frequency.setValueAtTime(freq, nowTime);
    gain.gain.setValueAtTime(0.12, nowTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, nowTime + 0.55); // Decay halus

    osc.connect(gain);
    gain.connect(AV.ctx.destination);
    osc.start(nowTime);
    osc.stop(nowTime + 0.55);
    osc.onended=function(){try{osc.disconnect();gain.disconnect();}catch(eD){};};
  } catch(e){}
}

/* ---------- [FITUR 3] Gravitational Wave / Shockwave Gargantua ---------- */
var BH_SHOCKWAVES = [];
function createBHShockwave(x, y){
  if(reduce || IS_POTATO) return;
  BH_SHOCKWAVES.push({x: x, y: y, r: Math.max(3, BH.R * 1.1 * BHSC), maxR: Math.min(W, H) * (0.14 + 0.26 * Math.min(1, BHSC)), t0: performance.now(), dur: 580});
}
function drawBHShockwaves(now){
  if(!BH_SHOCKWAVES.length) return;
  for(var i = BH_SHOCKWAVES.length - 1; i >= 0; i--){
    var sw = BH_SHOCKWAVES[i];
    var u = (now - sw.t0) / sw.dur;
    if(u >= 1){ BH_SHOCKWAVES.splice(i, 1); continue; }
    var currR = sw.r + (sw.maxR - sw.r) * Math.sin(u * Math.PI * 0.5); // Ease Out
    var alpha = (1 - u) * 0.45;

    g.save();
    g.globalCompositeOperation = 'lighter';
    g.strokeStyle = 'rgba(110, 229, 255, ' + alpha + ')';
    g.lineWidth = Math.max(1, 3.5 * (1 - u));
    g.beginPath();g.arc(sw.x, sw.y, currR, 0, 6.283);g.stroke();

    g.strokeStyle = 'rgba(255, 122, 217, ' + (alpha * 0.4) + ')';
    g.lineWidth = 1;
    g.beginPath();g.arc(sw.x, sw.y, currR * 1.12, 0, 6.283);g.stroke();
    g.restore();
  }
}

/* ---------- [FITUR 4] Hyperspace Warp Lines ---------- */
var WARP_STREAKS = [];
function triggerHyperspaceWarp(targetX, targetY){
  if(reduce || IS_POTATO) return;
  WARP_STREAKS.length = 0;
  var count = IS_POTATO ? 10 : 20;
  var t0 = performance.now();
  for(var i = 0; i < count; i++){
    var ang = Math.random() * 6.283;
    var dist = 90 + Math.random() * (Math.max(W, H) * 0.45);
    WARP_STREAKS.push({
      x: targetX + Math.cos(ang) * dist,
      y: targetY + Math.sin(ang) * dist,
      tx: targetX,
      ty: targetY,
      t0: t0,
      dur: 360 + Math.random() * 120
    });
  }
}
function drawHyperspaceWarp(now){
  if(!WARP_STREAKS.length) return;
  g.save();
  g.globalCompositeOperation = 'lighter';
  for(var i = WARP_STREAKS.length - 1; i >= 0; i--){
    var s = WARP_STREAKS[i];
    var u = (now - s.t0) / s.dur;
    if(u >= 1){ WARP_STREAKS.splice(i, 1); continue; }

    var hx = s.x + (s.tx - s.x) * u;
    var hy = s.y + (s.ty - s.y) * u;
    var p0 = Math.max(0, u - 0.35);
    var tx = s.x + (s.tx - s.x) * p0;
    var ty = s.y + (s.ty - s.y) * p0;

    var alpha = Math.sin(u * Math.PI) * 0.75;
    var grad = g.createLinearGradient(hx, hy, tx, ty);
    grad.addColorStop(0, 'rgba(234, 246, 255, ' + alpha + ')');
    grad.addColorStop(1, 'rgba(110, 229, 255, 0)');

    g.strokeStyle = grad;
    g.lineWidth = 1.4;
    g.beginPath();g.moveTo(hx, hy);g.lineTo(tx, ty);g.stroke();
  }
  g.restore();
}

/* ---------- [FITUR 4] Tactical Target Lock Reticle + Data Astronomi ---------- */
var STAR_DATA = {
  betel: { name: "BETELGEUSE", dist: "642 LY", spec: "M1-M2Ia", mag: "0.50", ra: "05h 55m", dec: "+07°24′" },
  rigel: { name: "RIGEL", dist: "860 LY", spec: "B8Ia", mag: "0.13", ra: "05h 14m", dec: "-08°12′" },
  sirius: { name: "SIRIUS", dist: "8.6 LY", spec: "A1V", mag: "-1.46", ra: "06h 45m", dec: "-16°42′" },
  spica: { name: "SPICA", dist: "250 LY", spec: "B1III", mag: "0.98", ra: "13h 25m", dec: "-11°10′" },
  pleione: { name: "PLEIONE", dist: "380 LY", spec: "B8ne", mag: "5.05", ra: "03h 49m", dec: "+24°08′" },
  aldebaran: { name: "ALDEBARAN", dist: "65 LY", spec: "K5III", mag: "0.85", ra: "04h 35m", dec: "+16°30′" },
  arcturus: { name: "ARCTURUS", dist: "36.7 LY", spec: "K1.5III", mag: "-0.05", ra: "14h 15m", dec: "+19°10′" },
  antares: { name: "ANTARES", dist: "550 LY", spec: "M1.5Iab", mag: "1.06", ra: "16h 29m", dec: "-26°25′" }
};

function drawTargetLock(now){
  if(typeof OBSERVE_MODE!=='undefined'&&OBSERVE_MODE)return;
  if(reduce || SW) return;
  var activeKey = null;
  if(activeSfx && !activeSfx.paused && !activeSfx.ended){
    if(activeSfx === SFX.betel) activeKey = 'betel';
    else if(activeSfx === SFX.rigel) activeKey = 'rigel';
    else if(activeSfx === SFX.sirius) activeKey = 'sirius';
    else if(activeSfx === SFX.spica) activeKey = 'spica';
    else if(activeSfx === SFX.pleione) activeKey = 'pleione';
    else if(activeSfx === SFX.aldebaran) activeKey = 'aldebaran';
    else if(activeSfx === SFX.arcturus) activeKey = 'arcturus';
    else if(activeSfx === SFX.antares) activeKey = 'antares';
  } else if(hot && STAR_DATA[hot]){
    activeKey = hot;
  }

  if(!activeKey || !STAR_DATA[activeKey]) return;
  var d = STAR_DATA[activeKey];
  var tr = TRIGGERS[activeKey];
  if(!tr) return;
  if(SECT.on||!sectShow(tr.cons)) return;

  var c = tr.cons === 'pleiades' ? PLEIADES : cons(tr.cons);
  var s = tr.cons === 'pleiades' 
    ? PLEIADES.bright.filter(function(z){ return z.name === tr.star; })[0] 
    : (c && c.stars && c.stars[tr.star]);
  if(!s) return;

  var sx = tr.cons === 'pleiades' 
    ? (PLEIADES.x + s.x * PLEIADES.scale + mouse.x * 1.4 + skyPan.x) 
    : (s.x + c.ox);
  var sy = tr.cons === 'pleiades' 
    ? (PLEIADES.y + s.y * PLEIADES.scale + mouse.y * 1.0 + skyPan.y) 
    : (s.y + c.oy);

  var q = gSky(sx, sy);
  if(!q || q[2] >= 1) return;

  var x = q[0], y = q[1];
  var sz = 17 + Math.sin(now * 0.003) * 1.5;
  var rot = now * 0.0006;

  g.save();
  g.translate(x, y);

  // Circle Reticle Dotted
  g.strokeStyle = 'rgba(' + tr.rgb + ', 0.6)';
  g.lineWidth = 1;
  g.setLineDash([3, 3]);
  g.beginPath();g.arc(0, 0, sz + 5, 0, 6.283);g.stroke();
  g.setLineDash([]);

  // Corner Brackets [ ]
  g.rotate(rot);
  var clen = 5;
  g.strokeStyle = 'rgba(234, 246, 255, 0.85)';
  g.lineWidth = 1.2;

  g.beginPath(); g.moveTo(-sz, -sz + clen); g.lineTo(-sz, -sz); g.lineTo(-sz + clen, -sz); g.stroke();
  g.beginPath(); g.moveTo(sz - clen, -sz); g.lineTo(sz, -sz); g.lineTo(sz, -sz + clen); g.stroke();
  g.beginPath(); g.moveTo(sz, sz - clen); g.lineTo(sz, sz); g.lineTo(sz - clen, sz); g.stroke();
  g.beginPath(); g.moveTo(-sz + clen, sz); g.lineTo(-sz, sz); g.lineTo(-sz, sz - clen); g.stroke();

  g.restore();

  // Telemetry HUD Text — Smart Adaptive Offset
  g.save();
  var isMobile = (W < 600 || H < 520);
  var labelOnRight = (s.nx && s.nx > 0);
  var tx, ty;

  if(isMobile){
    // Pada tampilan mobile (Portrait/Landscape), posisikan telemetri di bawah bintang
    // agar jalur horizontal aman untuk Nama Bintang + Visualizer Spectrogram
    tx = x - 40;
    ty = y + sz + 20;

    // Proteksi agar tidak terpotong tepi layar HP
    if(tx < 10) tx = 10;
    if(tx + 110 > W) tx = W - 115;
    if(ty + 26 > H - 35) ty = y - sz - 30; // Lempar ke atas jika terlalu dekat dengan footer/bawah
  } else {
    // Pada Desktop: Posisikan di arah berlawanan dari nama bintang (s.nx)
    if(labelOnRight){
      tx = x - sz - 118; // Pindah ke kiri jika nama bintang di kanan
    } else {
      tx = x + sz + 12;  // Pindah ke kanan jika nama bintang di kiri
    }
    ty = y - 10;

    // Proteksi batas layar Desktop
    if(tx < 10) tx = x + sz + 12;
    if(tx + 115 > W) tx = x - sz - 118;
    if(ty - 8 < 0) ty = y + sz + 10;
  }

  g.font = '600 8.5px "Courier New", monospace';
  g.fillStyle = 'rgba(' + tr.rgb + ', 0.95)';
  g.fillText('LOCK: ' + d.name, tx, ty);

  g.font = '500 7.5px "Courier New", monospace';
  g.fillStyle = 'rgba(184, 224, 238, 0.8)';
  g.fillText('DIST: ' + d.dist, tx, ty + 10);
  g.fillText('SPEC: ' + d.spec + ' (MAG ' + d.mag + ')', tx, ty + 19);

  g.strokeStyle = 'rgba(' + tr.rgb + ', 0.35)';
  g.lineWidth = 0.8;
  g.beginPath();g.moveTo(tx - 4, ty - 8);g.lineTo(tx - 4, ty + 23);g.stroke();

  g.restore();
}

function drawShooting(now){
  if(reduce||IS_POTATO)return;
  if(!idleMode&&(now-lastActivity)>IDLE_MS)idleMode=true;
  if(idleMode)return; /* Energy saver: no new shooting stars while idle */
  /* Shooting stars stay alive during star SFX and constellation alignment too
     (they used to be gated by secondaryFxScale, which only heavier FX like asteroids should obey). */
  if(now>nextSS&&!SW){
    /* BGM on: jarak acak tapi lebih sering; jumlah meteor aktif dibatasi (lebih ketat di HP kecil). */
    var ofxOn=OFX.p>.35,ofxCap=W<500?2:4;
    nextSS=now+(ofxOn?(W<500?3300+Math.random()*3700:2000+Math.random()*3200):6000+Math.random()*7000);
    if(!(ofxOn&&SS.length>=ofxCap)){
      var ang=(.14+Math.random()*.14)*Math.PI,sp=560+Math.random()*320,dir=Math.random()<.5?1:-1;
      var nm={x:dir>0?Math.random()*W*.6:W-Math.random()*W*.6,y:Math.random()*H*.35,vx:Math.cos(ang)*sp*dir,vy:Math.sin(ang)*sp,t:now,life:850};
      if(ofxOn){nm.c0=OFX.m0;nm.c1=OFX.m1;}
      SS.push(nm);
    }}
  for(var i=SS.length-1;i>=0;i--){
    var s=SS[i],u=(now-s.t)/s.life;if(u>1){SS.splice(i,1);continue;}
    var x=s.x+s.vx*(now-s.t)/1000,y=s.y+s.vy*(now-s.t)/1000,tl=s.tl||.07;
    if(s.comet){
      if(!s.frag&&!s.split&&u>=s.splitU)cometSplit(s,now,x,y);
      drawComet(s,now,u,x,y);continue;
    }
    var gr=g.createLinearGradient(x,y,x-s.vx*tl,y-s.vy*tl);
    gr.addColorStop(0,'rgba('+(s.c0||'234,246,255')+','+(1-u)+')');gr.addColorStop(1,'rgba('+(s.c1||'110,229,255')+',0)');
    g.strokeStyle=gr;g.lineWidth=s.lw||1.4;g.beginPath();g.moveTo(x,y);g.lineTo(x-s.vx*tl,y-s.vy*tl);g.stroke();
  }
}
function asteroidScreenAt(x,y){
  if(!AST.length||BHSC<.6)return -1;
  var best=-1,bd=Infinity,now=performance.now();
  var bp=camBH();
  for(var i=0;i<AST.length;i++){
    var a=AST[i],t=now*a.spd+a.seed,rr=a.r*(1+.035*Math.sin(now*.0007+a.seed))*BHZ;
    var ax=bp[0]+Math.cos(t)*rr,ay=bp[1]+Math.sin(t)*rr*a.e;
    var z=.70+.30*(Math.sin(t)+1)/2,sz=a.sz*z*skyZoom;
    if(SW){var q=pull(ax,ay);ax=q[0];ay=q[1];sz*=1-.45*q[2];}
    ax+=a.ox;ay+=a.oy;
    var d=Math.hypot(x-ax,y-ay);
    if(d<Math.max(8,sz*1.9)&&d<bd){bd=d;best=i;}
  }
  return best;
}
function scatterAsteroid(i,x,y){
  if(i<0||!AST[i]||SW)return false;
  var a=AST[i],now=performance.now(),t=now*a.spd+a.seed,rr=a.r*(1+.035*Math.sin(now*.0007+a.seed));
  var ax=BH.x+Math.cos(t)*rr,ay=BH.y+Math.sin(t)*rr*a.e;
  var dx=ax-BH.x,dy=ay-BH.y,dl=Math.hypot(dx,dy)||1;
  var nx=dx/dl,ny=dy/dl;
  /* One short impulse, then a damped spring brings the rock home.
     Velocities are pixels/second (not per-frame), so the kick cannot accumulate forever. */
  var tx=-ny,ty=nx;
  var kick=48+Math.random()*22,side=(Math.random()-.5)*18;
  a.vx=nx*kick+tx*side;
  a.vy=ny*kick+ty*side;
  a.ox=Math.max(-70,Math.min(70,a.ox));
  a.oy=Math.max(-70,Math.min(70,a.oy));
  a.kick=1;a.kickUntil=now+700;
  haptic(6);
  return true;
}
/* Bake a small set of rocky asteroid sprites once. Per-frame cost is then only
   translate/rotate/drawImage (+ the cheap spring for kick/scatter). Visual
   matches the previous live polygon+gradient path. */
function ensureAsteroidSprites(){
  if(AST_SPRITES&&AST_SPRITES.length)return AST_SPRITES;
  var R=AST_SPRITE_R,pad=Math.ceil(R*1.55+6),size=pad*2,n=8,list=[];
  for(var si=0;si<n;si++){
    var sides=6+(si%5),seed=si*1.618+0.37,sc=document.createElement('canvas');
    sc.width=sc.height=size;
    var sg=sc.getContext('2d');
    sg.translate(pad,pad);
    /* Soft contact shadow baked into the sprite (was live shadowBlur). */
    sg.shadowColor='rgba(0,0,0,.95)';
    sg.shadowBlur=Math.max(1.5,R*1.15);
    var rock=sg.createLinearGradient(-R,-R,R,R);
    rock.addColorStop(0,'rgba(78,82,82,1)');
    rock.addColorStop(.28,'rgba(38,40,40,1)');
    rock.addColorStop(.68,'rgba(15,16,17,1)');
    rock.addColorStop(1,'rgba(4,5,6,1)');
    sg.fillStyle=rock;
    sg.strokeStyle='rgba(3,4,5,1)';
    sg.lineWidth=Math.max(.7,R*.10);
    sg.beginPath();
    for(var k=0;k<sides;k++){
      var aa=k*Math.PI*2/sides;
      var rr2=R*(.70+.38*Math.sin(k*9.71+seed)+.10*Math.cos(k*4.17+seed*1.7));
      var px=Math.cos(aa)*rr2,py=Math.sin(aa)*rr2*.72;
      if(k===0)sg.moveTo(px,py);else sg.lineTo(px,py);
    }
    sg.closePath();sg.fill();sg.stroke();
    sg.shadowBlur=0;
    /* Mineral facet + craters (same relative geometry as the old live path). */
    sg.fillStyle='rgba(150,154,151,.18)';
    sg.beginPath();sg.moveTo(-R*.58,-R*.08);sg.lineTo(-R*.12,-R*.55);sg.lineTo(R*.18,-R*.26);sg.lineTo(-R*.08,R*.02);sg.closePath();sg.fill();
    sg.fillStyle='rgba(0,0,0,.88)';
    sg.beginPath();sg.arc(R*.18,-R*.12,Math.max(.35,R*.15),0,6.283);sg.fill();
    sg.beginPath();sg.arc(-R*.27,R*.18,Math.max(.28,R*.10),0,6.283);sg.fill();
    sg.strokeStyle='rgba(180,185,182,.24)';sg.lineWidth=Math.max(.3,R*.045);
    sg.beginPath();sg.moveTo(-R*.35,-R*.34);sg.lineTo(R*.22,-R*.48);sg.stroke();
    list.push({c:sc,pad:pad,R:R});
  }
  AST_SPRITES=list;
  return list;
}
function drawAsteroids(now){
  if(!AST.length)return;
  var bv=clamp((BHSC-.6)/.4);if(bv<=.02)return;
  var fxDim=(typeof secondaryFxScale==='function')?secondaryFxScale():0;
  if(fxDim>0.9)return;
  var alphaMul=(fxDim>0.35?(1-fxDim*.85):1)*bv;
  var sprites=ensureAsteroidSprites();
  var invR=1/AST_SPRITE_R;
  for(var i=0;i<AST.length;i++){
    var a=AST[i],t=now*a.spd+a.seed,rr=a.r*(1+.035*Math.sin(now*.0007+a.seed));
    var bp=camBH();
    var x=bp[0]+Math.cos(t)*rr*BHZ;
    var y=bp[1]+Math.sin(t)*rr*a.e*BHZ;
    var z=.70+.30*(Math.sin(t)+1)/2,sz=a.sz*z;
    if(SW){var q=pull(x,y),qq=q[2];x=q[0];y=q[1];sz*=1-.45*qq;}
    /* Damped spring: the rock gets one impulse, flies a little, then settles back. */
    var last=a._lastNow||now,dt=Math.min(.032,Math.max(.001,(now-last)/1000));
    a._lastNow=now;
    var spring=9.0,damper=5.8;
    a.vx+=(-spring*a.ox-damper*a.vx)*dt;
    a.vy+=(-spring*a.oy-damper*a.vy)*dt;
    a.ox+=a.vx*dt;a.oy+=a.vy*dt;
    if(a.kick&&now>a.kickUntil)a.kick=0;
    if(Math.abs(a.ox)+Math.abs(a.oy)<.12&&Math.abs(a.vx)+Math.abs(a.vy)<1.2){a.ox=a.oy=a.vx=a.vy=0;a.kick=0;}
    x+=a.ox;y+=a.oy;
    var sp=sprites[(a.sprite|0)%sprites.length];
    var scale=sz*invR;
    var half=sp.pad*scale;
    var rot=a.rot+now*a.rs;
    g.save();
    if(typeof alphaMul==='number'&&alphaMul<1)g.globalAlpha*=alphaMul;
    g.translate(x,y);
    g.rotate(rot);
    g.drawImage(sp.c,-half,-half,half*2,half*2);
    g.restore();
  }
}

function drawTriggerVisuals(now){
  if(SECT.on)return;
  Object.keys(TRIGGERS).forEach(function(key){
    var tr=TRIGGERS[key];
    if(tr.cons==='pleiades')return;
    if(!sectShow(tr.cons))return;
    var c=cons(tr.cons),s=c.stars[tr.star];
    if(!s||s._a<=0)return;
    var q=gSkyC(s.x+c.ox,s.y+c.oy,72,true);if(!q)return;var x=q[0],y=q[1],fade=(1-.85*q[2]);
    var selected=activeSfx===SFX[key];
    var focus=constellationFocus(c);
    if(potatoAudioFocus()&&!selected)return;
    var hovered=hot===key;
    var phase=(now*.00135+s.ph)%1;
    var breathe=reduce?0.5:(.5+.5*Math.sin(now*.0025+s.ph));
    var strength=((selected?1:.42)+(hovered?.42:0))*focus;
    if(typeof lastSignalKey!=='undefined'&&key===lastSignalKey&&typeof lastSignalGlowUntil!=='undefined'&&now<lastSignalGlowUntil)strength=Math.max(strength,.85);
    var base=TRIGGER_PULSE_BASE;
    var pulseR=base+2.2+6.5*phase;
    var outerR=base+5.5+7.5*phase;
    var coreR=base*(.92+.10*breathe);
    g.save();g.globalCompositeOperation='lighter';
    drawRipple(x,y,coreR*1.15,tr.rgb,.22*strength*fade);
    drawRipple(x,y,base+2.8*breathe,tr.rgb,(.50+.16*breathe)*strength*fade);
    var pa=(1-phase)*(.58+.22*strength)*fade;
    drawRipple(x,y,pulseR,tr.rgb,pa);
    var phase2=(phase+.42)%1,pa2=(1-phase2)*.36*strength*fade;
    drawRipple(x,y,base+4.5+7*phase2,tr.rgb,pa2);
    if(selected)drawRipple(x,y,outerR+3,tr.rgb,.16*strength*fade,true);
    g.strokeStyle='rgba('+tr.rgb+','+(.55*strength*fade)+')';g.lineWidth=.7;
    g.beginPath();g.moveTo(x-base-1.5,y);g.lineTo(x-base+.8,y);g.moveTo(x+base-.8,y);g.lineTo(x+base+1.5,y);g.moveTo(x,y-base-1.5);g.lineTo(x,y-base+.8);g.moveTo(x,y+base-.8);g.lineTo(x,y+base+1.5);g.stroke();
    g.restore();
  });
}

/* Tampilan rasi terkunci. Efek cahaya (pulse + titik jalan) mati di IS_POTATO dan prefers-reduced-motion;
   di mode itu cuma ada satu ring statis di bintang pertama biar pemain tahu mulai dari mana. */
var LOCK_RGB='140,220,255';
function drawLockedSignal(c,age,now,ox,oy,focus){
  var seq=alignmentSequence(c),n=seq.length,i,s,q;
  if(!n)return;
  if(reduce||IS_POTATO){
    s=c.stars[seq[0]];q=gSkyC(s.x+ox,s.y+oy,72);
    if(q&&q[2]<1){g.strokeStyle='rgba('+LOCK_RGB+','+(.38*(1-.85*q[2]))+')';g.lineWidth=1;g.beginPath();g.arc(q[0],q[1],7,0,6.283);g.stroke();}
    return;
  }
  var fa=.5+.5*focus;
  /* pulse di tiap bintang (ring sabuk Orion dilewati: sudah dipakai portal DUMUL) */
  for(i=0;i<n;i++){
    var k=seq[i];
    if(c.id==='orion'&&(k==='mintaka'||k==='alnilam'||k==='alnitak'))continue;
    s=c.stars[k];
    var a=clamp((age-s.t0)/.5);if(a<=0)continue;
    q=gSkyC(s.x+ox,s.y+oy,72);if(!q||q[2]>=1)continue;
    var ph=(now*.00055+s.ph*.159)%1;
    drawRipple(q[0],q[1],s.r*1.2+3+9*ph,LOCK_RGB,.42*(1-ph)*a*fa*(1-.85*q[2]),false);
  }
  /* titik cahaya: sesekali jalan dari bintang ke bintang sesuai urutan sequence (SFX terakhir), lalu diam */
  var hop=360,run=hop*(n-1),cyc=run+5200,t=(now+c.phase*1900)%cyc;
  if(t>=run)return;
  var idx=(t/hop)|0,u=(t-idx*hop)/hop;u=u*u*(3-2*u);
  var A=c.stars[seq[idx]],B=c.stars[seq[idx+1]];
  if(!A||!B||!cullSegAt(A.x+ox,A.y+oy,B.x+ox,B.y+oy))return;
  var qd=gSky(A.x+(B.x-A.x)*u+ox,A.y+(B.y-A.y)*u+oy);
  if(!qd||qd[2]>=1)return;
  var kd=1-.85*qd[2];
  g.save();g.globalCompositeOperation='lighter';
  drawStarGlow(qd[0],qd[1],4.2,'190,235,255',.95*kd*fa);
  g.fillStyle='rgba(255,255,255,'+(.9*kd)+')';g.beginPath();g.arc(qd[0],qd[1],1.5,0,6.283);g.fill();
  g.restore();
}
function nebulaIn(x,y,r){var t=skyXF(x,y);CULL.tot++;if(cullIn(t[0],t[1],r)){CULL.drawn++;return true;}CULL.saved+=2;return false;}
function drawCons(c,age,now){
  var tn=now-(TD.lag[c.id]||0); /* time-dilated clock */
  var audioFocus=potatoAudioFocus();
  var focus=constellationFocus(c);
  var sway=(reduce||audioFocus)?0:1;
  var wildField=(drag.on&&drag.moved)?1:0;
  var ox=Math.sin(tn*.00031+c.phase)*3*sway+mouse.x*(7+wildField*32)+skyPan.x,oy=Math.cos(tn*.00027+c.phase)*3*sway+mouse.y*(5+wildField*26)+skyPan.y;
  if(now<glitchUntil){ox+=(Math.random()-.5)*7;oy+=(Math.random()-.5)*4;}
  if(OFX.pK>.01){ofxPull(c,now);ox+=OFX.px;oy+=OFX.py;} /* tarikan halus ke Gargantua */
  c.ox=ox;c.oy=oy;
  var locked=!isUnlocked(c.id);
  var obr=ofxBreath(c.phase,now); /* napas rasi: -1..1 x kehadiran BGM Constellation */
  if(c.nebula){
    var na=clamp((age-c.delay-1.2)/1.5);
    if(na>0&&nebulaIn(c.nebula.x+ox,c.nebula.y+oy,c.scale*1.5)){var nt=skyXF(c.nebula.x+ox,c.nebula.y+oy),q0=pull(nt[0],nt[1]),nx=q0[0],ny=q0[1],nr=c.scale*1.5*(1-.7*q0[2]);na*=(1-q0[2]);
      var gr=g.createRadialGradient(nx,ny,0,nx,ny,nr);
      gr.addColorStop(0,'rgba(255,122,217,'+(.34*na)+')');gr.addColorStop(.5,'rgba(110,229,255,'+(.12*na)+')');gr.addColorStop(1,'rgba(110,229,255,0)');
      g.fillStyle=gr;g.beginPath();g.arc(nx,ny,nr,0,6.283);g.fill();}
  }
  g.lineCap='round';
  /* Terkunci: garis disembunyikan, diganti pulse di tiap bintang + titik cahaya yang jalan sesuai urutan alignment. */
  if(locked)drawLockedSignal(c,age,now,ox,oy,focus);
  /* Adaptive lens samples: few when far from BH; denser only near horizon.
     One sample pass per line — glow (if any) reuses the same points. */
  var lines=c.lines,nLines=locked?0:lines.length;
  /* Reward pas unlock: garis digambar satu-satu dari waktu unlock (bukan dari boot). */
  if(c._reveal!=null&&(reduce||now-c._reveal>lines.length*90+1400))c._reveal=null;
  for(var i=0;i<nLines;i++){
    var l=lines[i];
    var p=(c._reveal!=null)?clamp(((now-c._reveal)/1000-i*.09)/.8):clamp((age-c.delay-i*.28)/.8);if(p<=0)continue;p=1-Math.pow(1-p,3);
    var a=c.stars[l[0]],b=c.stars[l[1]];
    var lineHot=(c._hot===i||(tapFlash.cons===c.id&&tapFlash.until>now));
    var mx=(a.x+b.x)*.5+ox,my=(a.y+b.y)*.5+oy;
    var nearBH=Math.hypot(mx-BH.x,my-BH.y)<(BH.R*8);
    var samples=audioFocus?4:(IS_POTATO?(nearBH?6:3):(nearBH||lineHot?9:5));
    /* Sector cull: skip the whole line (all samples of gSky/lens + path) when its screen
       bounds leave the active sector. */
    var ta=skyXF(a.x+ox,a.y+oy),tax=ta[0],tay=ta[1],tb=skyXF(b.x+ox,b.y+oy);
    CULL.tot++;
    if(!cullSegIn(tax,tay,tb[0],tb[1])){CULL.saved+=samples+1;continue;}
    CULL.drawn++;
    var xs=drawCons._xs||(drawCons._xs=new Float32Array(16));
    var ys=drawCons._ys||(drawCons._ys=new Float32Array(16));
    var alive=drawCons._al||(drawCons._al=new Uint8Array(16));
    var visible=0,kk=1;
    for(var si=0;si<=samples;si++){
      var tt=si/samples*p;
      var qq=gSky(a.x+(b.x-a.x)*tt+ox,a.y+(b.y-a.y)*tt+oy);
      if(qq[2]>=1){alive[si]=0;continue;}
      alive[si]=1;xs[si]=qq[0];ys[si]=qq[1];visible++;
      kk=Math.min(kk,1-.55*qq[2]);
    }
    if(visible<2)continue;
    var doGlow=!IS_POTATO&&!audioFocus&&(lineHot||nearBH);
    var pass,drawing2;
    // Hitung efek dentuman audio bass pada garis rasi
    var audioPulse = (AV.beat * 0.45 + AV.bass * 0.35) * ((activeSfx && !activeSfx.paused) ? 1 : 0);

    for(pass=doGlow?0:1;pass<2;pass++){
      if(pass===0){
        g.strokeStyle='rgba(110,229,255,'+(((lineHot?.14:.07) + audioPulse * 0.12)*focus*(1+.5*obr))+')';
        g.lineWidth=(lineHot?6:4) + audioPulse * 2.0;
      }
      else{
        g.strokeStyle='rgba(150,212,255,'+Math.min(1,((lineHot?.72:.42) + audioPulse * 0.25 + (reduce?0:.1*Math.sin(tn*.0014+i)))*focus*(1+.32*obr))+')';
        g.lineWidth=(lineHot?1.8:1.1) + audioPulse * 1.2 + .4*obr;
      }
      g.globalAlpha=kk;g.beginPath();drawing2=false;
      for(var sj=0;sj<=samples;sj++){
        if(!alive[sj]){drawing2=false;continue;}
        if(!drawing2){g.moveTo(xs[sj],ys[sj]);drawing2=true;}else g.lineTo(xs[sj],ys[sj]);
      }
      g.stroke();
    }
    g.globalAlpha=1;
  }
}

/* Star glow sprites: same idea as galaxy sprites — CanvasGradient is bound to
   the transform at creation, so we pre-bake one halo per colour once and
   drawImage + globalAlpha each frame. Removes createRadialGradient/addColorStop
   for every constellation + Pleiades star every frame (~80+ allocations). */
var STAR_SPRITE_CACHE=Object.create(null);
var STAR_SPRITE_R=40; /* canonical glow radius in sprite space (maps to r*5) */
var RING_SPRITE_CACHE=Object.create(null);
/* One crisp 1px ring (optionally with a soft glow fill) per colour + half-pixel radius + DPR.
   Radii are quantised, so the sprite is blitted ~1:1 and never smeared by down-scaling. */
function getRingSprite(rgbStr,rq,glow){
  var key=rgbStr+'|'+rq+'|'+(glow?1:0)+'|'+DPR,hit=RING_SPRITE_CACHE[key];
  if(hit)return hit;
  var pad=Math.ceil(rq+3),px=Math.max(2,Math.ceil(pad*2*DPR));
  var sc=document.createElement('canvas');sc.width=sc.height=px;
  var sg=sc.getContext('2d'),c=px/2;
  sg.scale(px/(pad*2),px/(pad*2));
  var m=pad;
  if(glow){
    var gr=sg.createRadialGradient(m,m,0,m,m,rq);
    gr.addColorStop(0,'rgba('+rgbStr+',.75)');gr.addColorStop(.55,'rgba('+rgbStr+',.28)');gr.addColorStop(1,'rgba('+rgbStr+',0)');
    sg.fillStyle=gr;sg.beginPath();sg.arc(m,m,rq,0,6.283);sg.fill();
  }else{
    sg.strokeStyle='rgb('+rgbStr+')';sg.lineWidth=.9;
    sg.beginPath();sg.arc(m,m,rq,0,6.283);sg.stroke();
  }
  hit={c:sc,pad:pad};
  RING_SPRITE_CACHE[key]=hit;
  return hit;
}
function drawRipple(x,y,r,rgbStr,alpha,glow){
  if(!(alpha>0.012)||!(r>1.5))return;
  var rq=Math.round(r*2)/2,sp=getRingSprite(rgbStr,rq,glow);
  var prev=g.globalAlpha;
  g.globalAlpha=prev*Math.min(1,alpha);
  g.drawImage(sp.c,x-sp.pad,y-sp.pad,sp.pad*2,sp.pad*2);
  g.globalAlpha=prev;
}
function getStarSprite(rgbStr){
  var hit=STAR_SPRITE_CACHE[rgbStr];
  if(hit)return hit;
  var R=STAR_SPRITE_R,pad=R+2;
  var sc=document.createElement('canvas');
  sc.width=sc.height=pad*2;
  var sg=sc.getContext('2d');
  var cx=pad,cy=pad;
  var gr=sg.createRadialGradient(cx,cy,0,cx,cy,R);
  /* Relative stops match the old live gradient (0.9 / 0.34 / 0). Frame alpha
     is applied via globalAlpha so twinkle + fade-in still work. */
  gr.addColorStop(0,'rgba('+rgbStr+',0.9)');
  gr.addColorStop(.25,'rgba('+rgbStr+',0.34)');
  gr.addColorStop(1,'rgba('+rgbStr+',0)');
  sg.fillStyle=gr;
  sg.beginPath();sg.arc(cx,cy,R,0,6.283);sg.fill();
  hit={c:sc,pad:pad,R:R};
  STAR_SPRITE_CACHE[rgbStr]=hit;
  return hit;
}
function drawStarGlow(x,y,r,rgbStr,alpha){
  if(!(alpha>0.01)||!(r>0))return;
  var sp=getStarSprite(rgbStr);
  var extent=r*5;
  var scale=extent/sp.R;
  var half=sp.pad*scale;
  var prev=g.globalAlpha;
  g.globalAlpha=prev*Math.min(1,alpha);
  g.drawImage(sp.c,x-half,y-half,half*2,half*2);
  g.globalAlpha=prev;
}

function drawStars(c,age,now){
  var tn=now-(TD.lag[c.id]||0);
  c._vis=0;
  var k2=W<500?.95:1.2;
  var audioFocus=potatoAudioFocus();
  var focus=constellationFocus(c);
  Object.keys(c.stars).forEach(function(k){
    var s=c.stars[k],a=clamp((age-s.t0)/.5);s._a=a;if(a<=0)return;
    var triggerKey=(k==='betel'?'betel':(k==='rigel'?'rigel':(k==='spica'?'spica':(k==='sirius'?'sirius':(k==='aldebaran'?'aldebaran':(k==='arcturus'?'arcturus':(k==='antares'?'antares':null)))))));
    var tr=triggerKey?TRIGGERS[triggerKey]:null;
    var isPlaying=!!(tr&&activeSfx===SFX[triggerKey]&&!SFX[triggerKey].paused);
    var cheap=audioFocus&&!isPlaying;
    var q=gSkyC(s.x+c.ox,s.y+c.oy,72);if(!q)return;c._vis++;var tw=cheap?1:(reduce?1:(1+s._tw*(.30+1.8*s.twinkleDepth))),x=q[0],y=q[1],kq=q[2],r=s.r*k2*(1-.6*q[2])*(.97+.10*s._tw);a*=(1-.85*kq)*focus*(1+.40*s._tw);
    if(cheap){
      /* During potato audio-focus, keep the star visible but replace its
         animated halo with one tiny core draw. This removes a radial-gradient
         allocation per star while the audio star is doing the heavy work. */
      g.fillStyle='rgba(255,255,255,'+(.82*a)+')';
      g.beginPath();g.arc(x,y,Math.max(.72,r*.56),0,6.283);g.fill();
    }else{
      var sb=ofxBreath(c.phase+(s.ph||0)*.35,now);
      drawStarGlow(x,y,r*(1+.14*sb),s.rgb,a*tw*(1+.3*sb));
      g.fillStyle='rgba(255,255,255,'+(.95*a)+')';g.beginPath();g.arc(x,y,Math.max(.9,r*.62),0,6.283);g.fill();
    }
    var am=ALIGN.cid?alignMark(c,k):null;
    if(am==='lit'){
      g.strokeStyle='rgba(110,229,255,'+(.55*a)+')';g.lineWidth=1;
      g.beginPath();g.arc(x,y,Math.max(3.2,r*2.1),0,6.283);g.stroke();
    }else if(am==='next'){
      var hp=.5+.5*Math.sin(tn*.008);
      g.strokeStyle='rgba(255,226,140,'+((.45+.4*hp)*a)+')';g.lineWidth=1.1;
      g.beginPath();g.arc(x,y,Math.max(5,r*2.6)+2*hp,0,6.283);g.stroke();
    }
    /* Cross reticle only on named bright stars — skips Scorpius tail (Shaula)
       and other anonymous bright points so the sting doesn't show a "+". */
    if(s.r>=2.9 && s.name && !(c.id==='taurus' && k==='elnath')){
      g.strokeStyle='rgba('+s.rgb+','+(.4*a*tw)+')';g.lineWidth=.8;
      g.beginPath();g.moveTo(x-r*2.2,y);g.lineTo(x+r*2.2,y);g.moveTo(x,y-r*2.2);g.lineTo(x,y+r*2.2);g.stroke();
    }
    if(s.name&&age>3.5&&kq<.25&&!(typeof OBSERVE_MODE!=='undefined'&&OBSERVE_MODE)){
      /* Audio-trigger labels: each one inherits its own pulse color. */
      /* triggerKey / tr / isPlaying were resolved above so potato audio-focus
         can decide the cheap star path before any gradient work is allocated. */
      g.font='500 10px "Space Grotesk",system-ui,sans-serif';
      g.textAlign=s.nx<0?'right':'left';
      /* Closer gap for edge stars (Antares) so the label hugs the pulse. */
      var gapH=s.specAfter? (r*1.6+4) : (r*3.4+7);
      var labelX=x+s.nx*gapH, labelY=y+3+(s.dy||0);
      var labelAlpha=isPlaying?.95:.62;
      g.fillStyle=tr?'rgba('+tr.rgb+','+labelAlpha+')':'rgba(184,198,214,'+labelAlpha+')';
      g.fillText(s.name,labelX,labelY);

      /*
       * Mini spectrum:
       * - only visible while its own audio is actually PLAYING
       * - default: nx<0 → further left (Spica/Rigel); nx>0 → right of text
       * - specAfter: always "Name [spectrum]" reading order (spectrum to the
       *   RIGHT of the text) so Antares doesn't throw bars into Betelgeuse
       */
      if(tr&&isPlaying){
        var bars=7, gap=1.8, bw=1.35, total=bars*bw+(bars-1)*gap;
        var labelW=g.measureText(s.name).width, gapFromText=8;
        var sx,sy=labelY-7;
        if(s.specAfter){
          /* Right of the text block, regardless of textAlign. */
          var textRight=s.nx<0?labelX:(labelX+labelW);
          sx=textRight+gapFromText;
        }else{
          sx=(s.nx<0)
            ? (labelX-labelW-gapFromText-total)
            : (labelX+labelW+gapFromText);
        }
        g.save();g.globalCompositeOperation='lighter';
        for(var bi=0;bi<bars;bi++){
          var wave=.5+.5*Math.sin(tn*.009+bi*1.17+s.ph);
          var center=1-Math.abs((bi-(bars-1)/2)/((bars-1)/2));
          var bhh=2+7.2*wave*(.35+.65*center);
          var ba=.38+.52*wave;
          g.fillStyle='rgba('+tr.rgb+','+ba+')';
          g.fillRect(sx+bi*(bw+gap),sy+6-bhh,bw,bhh);
        }
        g.restore();
      }
    }
  });
}
function drawPleiades(age,now){
  var tn=now-(TD.lag.pleiades||0);
  if(!PLEIADES.ready)return;
  PLEIADES._vis=0;
  var k2=W<500?.95:1.1;
  var ox=mouse.x*1.4+skyPan.x,oy=mouse.y*1.0+skyPan.y;
  var selected=activeSfx===SFX.pleione&&!SFX.pleione.paused&&!SFX.pleione.ended;
  /* Full cluster when Pleione plays (or focus still on pleiades); otherwise dim.
     Sweep-driven _tw gives the same sequential twinkle language as Orion/Virgo/Canis. */
  var clusterFade=selected?1:.30;
  function drawOne(star,dim){
    var x=PLEIADES.x+star.x*PLEIADES.scale+ox;
    var y=PLEIADES.y+star.y*PLEIADES.scale+oy;
    var twBoost=selected?(star._tw||0):0;
    var r=((star.r)||(dim?1.15:1.8))*k2*(.97+.10*twBoost);
    var a=(dim?.48:.88)*clusterFade*(1+.40*twBoost);
    var rgbc=star.interactive?'145,170,255':(dim?'110,145,205':'190,218,255');
    /* Soft ambient shimmer when not in sweep; sweep _tw is the main flash. */
    var pulse=star.interactive?1:(1+.045*Math.sin(tn*.0015+star.x*9));
    r*=pulse;
    if(selected&&!reduce)a*=(1+twBoost*(.30+1.4*.12));
    var q=gSkyC(x,y,72);
    if(!q||q[2]>=1)return;
    PLEIADES._vis++;
    x=q[0];y=q[1];a*=(1-.75*q[2]);r*=1-.45*q[2];
    /* Reuse constellation star sprite; scale so extent ≈ r*(dim?4.5:5.8).
       drawStarGlow uses extent=r*5, so pass rAdj = r * factor/5. */
    var rAdj=r*((dim?4.5:5.8)/5);
    drawStarGlow(x,y,rAdj,rgbc,a*.82);
    g.fillStyle='rgba(238,246,255,'+(a*.94)+')';g.beginPath();g.arc(x,y,Math.max(.7,r*.58),0,6.283);g.fill();
    if(star.interactive){
      var hotP=(hot==='pleione'),tr=TRIGGERS.pleione;
      /* Exact same compact pulse geometry as Betelgeuse/Rigel/Spica/Sirius (TRIGGER_PULSE_BASE). */
      var phase=(tn*.00135+(star.ph||0))%1;
      var breathe=reduce?0.5:(.5+.5*Math.sin(tn*.0025+(star.ph||0)));
      var strength=(selected?1:.42)+(hotP?.42:0);
      var fade=(1-.85*q[2])*clusterFade;
      var base=TRIGGER_PULSE_BASE;
      var pulseR=base+2.2+6.5*phase;
      var outerR=base+5.5+7.5*phase;
      var coreR=base*(.92+.10*breathe);
      g.save();g.globalCompositeOperation='lighter';
      g.strokeStyle='rgba('+tr.rgb+','+(.20*strength*fade)+')';g.lineWidth=.8;g.beginPath();g.arc(x,y,coreR,0,6.283);g.stroke();
      g.strokeStyle='rgba('+tr.rgb+','+((.56+.18*breathe)*strength*fade)+')';g.lineWidth=1.05+.35*breathe;g.beginPath();g.arc(x,y,base+2.8*breathe,0,6.283);g.stroke();
      var pa=(1-phase)*(.56+.22*strength)*fade;
      g.strokeStyle='rgba('+tr.rgb+','+pa+')';g.lineWidth=.95;g.beginPath();g.arc(x,y,pulseR,0,6.283);g.stroke();
      var phase2=(phase+.42)%1,pa2=(1-phase2)*.34*strength*fade;
      g.strokeStyle='rgba('+tr.rgb+','+pa2+')';g.lineWidth=.7;g.beginPath();g.arc(x,y,base+4.5+7*phase2,0,6.283);g.stroke();
      if(selected){
        var rg=g.createRadialGradient(x,y,0,x,y,outerR+3);
        rg.addColorStop(0,'rgba('+tr.rgb+','+(.12*strength*fade)+')');
        rg.addColorStop(.55,'rgba('+tr.rgb+','+(.045*strength*fade)+')');
        rg.addColorStop(1,'rgba('+tr.rgb+',0)');
        g.fillStyle=rg;g.beginPath();g.arc(x,y,outerR+3,0,6.283);g.fill();
      }
      g.strokeStyle='rgba('+tr.rgb+','+(.55*strength*fade)+')';g.lineWidth=.7;
      g.beginPath();g.moveTo(x-base-1.5,y);g.lineTo(x-base+.8,y);g.moveTo(x+base-.8,y);g.lineTo(x+base+1.5,y);g.moveTo(x,y-base-1.5);g.lineTo(x,y-base+.8);g.moveTo(x,y+base-.8);g.lineTo(x,y+base+1.5);g.stroke();
      g.restore();
      if(age>3.5&&q[2]<.25&&!(typeof OBSERVE_MODE!=='undefined'&&OBSERVE_MODE)){
        g.font='500 10px "Space Grotesk",system-ui,sans-serif';
        g.textAlign='left';g.fillStyle='rgba('+tr.rgb+','+(hotP?.95:(selected?.78:.42))+')';
        var labelX=x+r*3.4+7,labelY=y+3;
        g.fillText('Pleione',labelX,labelY);
        if(selected){
          var bars=7,gap=1.8,bw=1.35;
          var gapFromText=8,labelW=g.measureText('Pleione').width;
          var sx=labelX+labelW+gapFromText,sy=labelY-7;
          g.save();g.globalCompositeOperation='lighter';
          for(var bi=0;bi<bars;bi++){
            var wave=.5+.5*Math.sin(tn*.009+bi*1.17+(star.ph||0));
            var center=1-Math.abs((bi-(bars-1)/2)/((bars-1)/2));
            var bhh=2+7.2*wave*(.35+.65*center);
            var ba=.38+.52*wave;
            g.fillStyle='rgba('+tr.rgb+','+ba+')';
            g.fillRect(sx+bi*(bw+gap),sy+6-bhh,bw,bhh);
          }
          g.restore();
        }
      }
    }
  }
  PLEIADES.dim.forEach(function(st){drawOne(st,true);});
  PLEIADES.bright.forEach(function(st){drawOne(st,false);});
}
function pleiadesHitAt(px,py){
  if(!PLEIADES.ready)return null;
  var ox=mouse.x*1.4+skyPan.x,oy=mouse.y*1.0+skyPan.y;
  /* Match the generous hit radius used by Orion/Virgo/Canis trigger stars
     so the first tap registers reliably on phones. */
  var hitR=Math.max(22,PLEIADES.scale*.11);
  for(var i=0;i<PLEIADES.bright.length;i++){
    var st=PLEIADES.bright[i];if(!st.interactive)continue;
    var q=gSky(PLEIADES.x+st.x*PLEIADES.scale+ox,PLEIADES.y+st.y*PLEIADES.scale+oy);
    if(!q||q[2]>=1)continue;
    if(Math.hypot(px-q[0],py-q[1])<hitR)return st;
  }
  return null;
}
function telescopeScreenPos(){
  /* Prefer last drawn screen position (accounts for gravitational lens). */
  if(TELESCOPE.sx||TELESCOPE.sy)return [TELESCOPE.sx,TELESCOPE.sy];
  var q=lens(TELESCOPE.x,TELESCOPE.y);
  if(!q)return [TELESCOPE.x,TELESCOPE.y];
  return [q[0],q[1]];
}
function telescopeHitAt(px,py){
  if(TELESCOPE.al<.5)return false;
  var r=TELESCOPE.hitR||telescopeHitRadius();
  var tp=telescopeScreenPos();
  if(tp&&Math.hypot(px-tp[0],py-tp[1])<r)return true;
  return false;
}
function placeSecretMsg(){
  var el=$('#secret-msg'),p=telescopeScreenPos();
  if(!el||!p)return;
  /* Bottom of bubble sits just above the telescope (data-type=telescope uses translate(-50%,-100%)). */
  var gap=(typeof touchMode!=='undefined'&&touchMode)?10:12;
  var pad=10;
  var maxW=Math.min(220,(W||innerWidth||360)*0.72);
  var x=p[0], y=p[1]-gap;
  x=Math.max(pad+maxW*0.5, Math.min((W||innerWidth)-pad-maxW*0.5, x));
  /* Keep the anchor point itself on-screen; bubble grows upward from here. */
  y=Math.max(pad+36, Math.min((H||innerHeight)-pad, y));
  el.style.left=Math.round(x)+'px';
  el.style.top=Math.round(y)+'px';
}
function drawPulses(now,age){
  if(reduce||IS_POTATO||age<4||SW)return;
  if(now>nextPU){nextPU=now+500+Math.random()*900;
    /* Pick any constellation (Orion / Virgo / Canis Major) so every figure gets line pulses */
    var c=CONS[(Math.random()*CONS.length)|0],l=c.lines[(Math.random()*c.lines.length)|0],f=Math.random()<.5;
    if(isUnlocked(c.id)&&!SECT.on&&sectShow(c.id))PU.push({c:c,a:f?l[1]:l[0],b:f?l[0]:l[1],t:now,d:1100+Math.random()*600});} /* terkunci = nggak ada garis buat dilewati pulse */
  for(var i=PU.length-1;i>=0;i--){
    var p=PU[i],u=(now-p.t)/p.d;if(u>1){PU.splice(i,1);continue;}
    if(SECT.on||!sectShow(p.shock?TRIGGERS[p.snKey].cons:p.c.id))continue;
    if(p.shock){
      var tr=TRIGGERS[p.snKey],sb=(tr&&tr.cons==='pleiades')?PLEIADES.bright.filter(function(z){return z.name===tr.star;})[0]:(p.c.stars&&p.c.stars[p.snKey]);
      if(!sb||!tr)continue;
      var bx=tr.cons==='pleiades'?(PLEIADES.x+sb.x*PLEIADES.scale+mouse.x*1.4+skyPan.x):(sb.x+p.c.ox),by=tr.cons==='pleiades'?(PLEIADES.y+sb.y*PLEIADES.scale+mouse.y*1.0+skyPan.y):(sb.y+p.c.oy);
      var base=gravityPos(bx,by);
      if(!base||base[2]>=1)continue;
      var sx=base[0]+Math.cos(p.ang)*p.sp*u*(1-.35*base[2]),sy=base[1]+Math.sin(p.ang)*p.sp*u*(1-.35*base[2]);
      var sa=(1-u)*.72*(1-.7*base[2]);
      g.fillStyle='rgba('+tr.rgb+','+sa+')';g.beginPath();g.arc(sx,sy,1.2+2.2*u,0,6.283);g.fill();
      if((p.i||0)%3===0){
        g.strokeStyle='rgba('+tr.rgb+','+(sa*.42)+')';g.lineWidth=.65;
        g.beginPath();g.arc(base[0],base[1],((sb.r)||1.9)*(2+7*u),0,6.283);g.stroke();
      }
      continue;
    }
    var A=p.c.stars[p.a],B=p.c.stars[p.b],ox=p.c.ox,oy=p.c.oy;
    if(!cullSegAt(A.x+ox,A.y+oy,B.x+ox,B.y+oy))continue;
    var t2=Math.max(0,u-.2),al=Math.sin(u*Math.PI);
    var nseg=IS_POTATO?4:6,drawn=0,drawing=false;
    g.strokeStyle='rgba(200,245,255,'+(.95*al)+')';g.lineWidth=2;g.beginPath();
    for(var si=0;si<=nseg;si++){
      var tt=t2+(u-t2)*si/nseg;
      var qq=gSky(A.x+(B.x-A.x)*tt+ox,A.y+(B.y-A.y)*tt+oy);
      if(qq[2]>=1){drawing=false;continue;}
      if(!drawing){g.moveTo(qq[0],qq[1]);drawing=true;}else g.lineTo(qq[0],qq[1]);
      drawn++;
    }
    if(drawn>1)g.stroke();
    var qp=gSky(A.x+(B.x-A.x)*u+ox,A.y+(B.y-A.y)*u+oy);
    if(qp[2]<1){
      g.fillStyle='rgba(235,250,255,'+al+')';g.beginPath();g.arc(qp[0],qp[1],2,0,6.283);g.fill();
      /* Micro-spark when pulse arrives at target star */
      if(u>0.90){
        var sparkA=(u-0.90)*10;
        g.fillStyle='rgba(235,250,255,'+(0.8*sparkA)+')';
        g.beginPath();g.arc(qp[0],qp[1],2.5+sparkA*2,0,6.283);g.fill();
      }
    }
  }
}
function drawPortals(age,now){
  var na=clamp((age-3.6)/1)*(1-clamp(swP*4));
  PORTALS.forEach(function(p){
    var c=p.c,ox=c.ox,oy=c.oy;
    var here=!SECT.on&&sectShow(p.cons);
    if(!here){
      if(hot===p.id)hot=null;
      if(p._shown!==false){p._shown=false;p.el.classList.remove('on','mobile-show');p.el.style.visibility='hidden';p.hitEl.style.display='none';}
      return;
    }
    if(p._shown!==true){p._shown=true;p.el.style.visibility='';p.hitEl.style.display='';}
    p.h+=((hot===p.id?1:0)-p.h)*.15;
    /* Panel is screen-fixed (layout anchors p.fx/p.fy). Only the connector
       line tracks the moving star. Hit target still follows the star. */
    if(!SW){
      var fx=p.fx!=null?p.fx:p.lx,fy=p.fy!=null?p.fy:p.ly;
      p.el.style.transform='translate('+fx.toFixed(1)+'px,'+fy.toFixed(1)+'px)';
      var hs=c.stars[p.hit],hp=gSky(hs.x+ox,hs.y+oy);
      p.hitEl.style.transform='translate('+(hp[0]).toFixed(1)+'px,'+(hp[1]).toFixed(1)+'px)';
    }
    if(na<=0)return;
    if(typeof ALIGN!=='undefined'&&ALIGN.cid){p.el.classList.remove('mobile-show');return;}
    /* Mode kamera: portal DUMUL dinonaktifin total (panel + tombol hit lewat CSS) supaya tap sabuk Orion
       jatuh ke canvas buat chain Pleiades. Cincin sabuk cuma tersisa sebagai petunjuk selama Pleiades masih terkunci. */
    if(CAMERA_MODE){
      p.el.classList.remove('mobile-show');
      if(UNLOCK.set.pleiades||camFocusId()!==p.cons)return;
    }
    if(!p.el.classList.contains('on'))p.el.classList.add('on');

    /* Desktop always visible; mobile only when .mobile-show is toggled on. */
    var isVisible=!CAMERA_MODE&&(!(W<=600||document.body.classList.contains('touch-short'))||p.el.classList.contains('mobile-show'));

    /* Connector: only drawn while the portal panel is actually visible. */
    if(isVisible){
      var fx=p.fx!=null?p.fx:p.lx,fy=p.fy!=null?p.fy:p.ly;
      var l0=gSky(p.sx+ox,p.sy+oy);
      if(l0&&l0[2]<1){
        g.setLineDash([3,5]);g.lineWidth=1;g.strokeStyle='rgba('+p.col+','+((.32+.45*p.h)*na*(1-.5*l0[2]))+')';
        g.beginPath();g.moveTo(l0[0],l0[1]);g.lineTo(fx-2,fy);g.stroke();g.setLineDash([]);
      }else g.setLineDash([]);
    }

    p.stars.forEach(function(k){
      var s=c.stars[k],lp=gSky(s.x+ox,s.y+oy);
      if(!lp||lp[2]>=1)return;
      var x=lp[0],y=lp[1],fade=1-.85*lp[2];
      /* Ring pulse on Orion belt stars — keep as tap affordance even when panel hidden. */
      g.strokeStyle='rgba('+p.col+','+((.5+.4*p.h)*na*fade)+')';g.lineWidth=1;g.beginPath();g.arc(x,y,8+2.5*p.h,0,6.283);g.stroke();
      var pr=reduce?0:((now*.0011+s.ph)%1);
      g.strokeStyle='rgba('+p.col+','+((1-pr)*.55*na*fade)+')';g.beginPath();g.arc(x,y,8+pr*11,0,6.283);g.stroke();
    });
  });
}
var lastFrameOK=performance.now();
/* bootDone stays false until warm-up finishes. */
var bootDone=false;
/* ---------- Observatory FX: efek visual yang menumpang ke BGM ----------
   Constellation BGM -> rasi "bernapas" + langit biru dingin.
   Collapsars BGM    -> Gargantua menyala/berputar lebih cepat, bintang kena tarikan halus, langit ungu-merah.
   Lintas BGM        -> meteor lebih sering, 8 bintang SFX menyala tipis, jejak debu bintang di kursor/sentuhan.
   Semua efek visual mati kalau: tab hidden (render loop memang berhenti), prefers-reduced-motion, IS_POTATO,
   Radio Silence, swallow, atau tesseract. Audio TIDAK ikut berhenti. Kalau satu efek error 5x, semua efek
   visual mati sendiri (render loop tidak ikut jatuh). Pergantian BGM = crossfade ~4 detik (bukan lompat). */
var OFX={pC:0,pK:0,p:0,last:0,dph:0,wasOn:false,m0:'234,246,255',m1:'110,229,255',px:0,py:0,
  tc:null,tk:null,keys:null,dust:[],dAt:0,dx:-999,dy:-999,err:0,dead:false};
var OFX_PAL_C=['150,212,255','205,232,255','118,168,255'],OFX_PAL_K=['255,178,130','214,150,255','255,120,150'];
function ofxAllowed(){
  if(OFX.dead||pageHidden||reduce||IS_POTATO||SW||RADIO_SILENCE)return false;
  return !document.body.classList.contains('tesseract-running');
}
function ofxBgm(){ /* 0 = tidak ada, 1 = constellation, 2 = collapsars */
  if(AMB&&!AMB.paused&&!AMB.ended)return 1;
  if(MUSIC_COLLAP&&!MUSIC_COLLAP.paused&&!MUSIC_COLLAP.ended)return 2;
  return 0;
}
function ofxSafe(fn,now){
  if(OFX.dead)return;
  try{fn(now);}catch(err){
    try{window.__hub.renderError='ofx: '+(err&&err.message||err);}catch(e2){}
    if(++OFX.err>=5){OFX.dead=true;OFX.pC=0;OFX.pK=0;OFX.p=0;OFX.dust.length=0;}
    try{resetCanvasState();}catch(e3){}
  }
}
function ofxUpdate(now){
  var dt=OFX.last?Math.min(100,Math.max(0,now-OFX.last)):16;OFX.last=now;
  var ok=ofxAllowed(),b=ok?ofxBgm():0,tc=b===1?1:0,tk=b===2?1:0,k=1-Math.exp(-dt/(ok?1400:350));
  OFX.pC+=(tc-OFX.pC)*k;OFX.pK+=(tk-OFX.pK)*k;
  if(!tc&&OFX.pC<.004)OFX.pC=0;
  if(!tk&&OFX.pK<.004)OFX.pK=0;
  OFX.p=OFX.pC>OFX.pK?OFX.pC:OFX.pK;
  /* Fase tambahan cakram: nambah halus sesuai pK, jadi percepatan putaran tidak "loncat". */
  OFX.dph=(OFX.dph+dt*.00024*.9*OFX.pK)%1;
  if(OFX.pK>OFX.pC){OFX.m0='255,214,170';OFX.m1='255,104,140';}
  else{OFX.m0='234,246,255';OFX.m1='110,229,255';}
  var on=OFX.p>.35;
  /* Begitu BGM mulai, jangan nunggu jadwal meteor lama (bisa 13 detik). */
  if(on&&!OFX.wasOn&&nextSS>now+3000)nextSS=now+700+Math.random()*1600;
  OFX.wasOn=on;
  if(!ok&&OFX.dust.length)OFX.dust.length=0;
}
function ofxBreath(ph,now){return OFX.pC>.004?OFX.pC*Math.sin(now*.00105+ph):0;}
function ofxPull(c,now){
  var key=W*8191+H;
  if(c._ofxK!==key){
    var sx=0,sy=0,n=0,k,st;
    for(k in c.stars){st=c.stars[k];sx+=st.x;sy+=st.y;n++;}
    c._ofxX=n?sx/n:0;c._ofxY=n?sy/n:0;c._ofxK=key;
  }
  var dx=BH.x-c._ofxX,dy=BH.y-c._ofxY,d=Math.sqrt(dx*dx+dy*dy)||1;
  var fall=Math.max(.35,Math.min(1,1.15-d/(Math.max(W,H)*.9)));  /* rasi yang lebih dekat ditarik lebih kuat */
  var wave=.5+.5*Math.sin(now*.0014+c.phase*1.7);                 /* mendekat ... balik */
  var shiver=Math.sin(now*.021+c.phase*3.1);                      /* getar kecil di puncak tarikan */
  var sc=Math.max(.8,Math.min(1.4,Math.min(W,H)/420));
  var m=OFX.pK*fall*sc*wave*(5.2+1.1*shiver)*BHSC;
  if(!isFinite(m)||!isFinite(dx)||!isFinite(dy)){OFX.px=0;OFX.py=0;return;}
  OFX.px=dx/d*m;OFX.py=dy/d*m;
}
function ofxMakeTint(kind){
  var c=document.createElement('canvas');c.width=c.height=128;
  var x=c.getContext('2d'),gr=x.createRadialGradient(64,64,0,64,64,64);
  if(kind==='k'){
    gr.addColorStop(0,'rgba(150,80,255,.60)');gr.addColorStop(.38,'rgba(112,34,150,.38)');
    gr.addColorStop(.72,'rgba(125,22,48,.20)');gr.addColorStop(1,'rgba(90,10,20,0)');
  }else{
    gr.addColorStop(0,'rgba(60,130,255,.50)');gr.addColorStop(.45,'rgba(34,84,190,.26)');
    gr.addColorStop(1,'rgba(20,50,140,0)');
  }
  x.fillStyle=gr;x.fillRect(0,0,128,128);return c;
}
function ofxDrawTint(now){
  if(OFX.p<.01)return;
  var S=Math.max(W,H)*2.2;
  g.save();g.globalCompositeOperation='lighter';
  if(OFX.pC>.01){
    if(!OFX.tc)OFX.tc=ofxMakeTint('c');
    g.globalAlpha=.17*OFX.pC*(.88+.12*Math.sin(now*.00105));
    g.drawImage(OFX.tc,W*.5-S/2,H*.45-S/2,S,S);
  }
  if(OFX.pK>.01){
    if(!OFX.tk)OFX.tk=ofxMakeTint('k');
    g.globalAlpha=.26*OFX.pK*(.9+.1*Math.sin(now*.0013));
    g.drawImage(OFX.tk,BH.x-S/2,BH.y-S/2,S,S);
  }
  g.restore();
}
/* 8 bintang yang bisa diklik: glow tipis sebagai tanda "tersedia" selama BGM on. */
function ofxDrawAvail(now){
  if(OFX.p<.02||SECT.on)return;
  var keys=OFX.keys||(OFX.keys=Object.keys(TRIGGERS)),i,j,key,tr,q,c,s,ps,x,y,pu;
  var dim=(activeSfx&&!activeSfx.paused&&!activeSfx.ended)?.35:1;
  g.save();g.globalCompositeOperation='lighter';
  for(i=0;i<keys.length;i++){
    key=keys[i];tr=TRIGGERS[key];
    if(!sectShow(tr.cons))continue;
    if(activeSfx===SFX[key]&&!SFX[key].paused)continue; /* bintang yang lagi bunyi sudah punya efek sendiri */
    if(tr.cons==='pleiades'){
      if(!PLEIADES.ready)continue;
      ps=null;
      for(j=0;j<PLEIADES.bright.length;j++){if(PLEIADES.bright[j].name===tr.star){ps=PLEIADES.bright[j];break;}}
      if(!ps)continue;
      q=gSky(PLEIADES.x+ps.x*PLEIADES.scale+mouse.x*1.4+skyPan.x,PLEIADES.y+ps.y*PLEIADES.scale+mouse.y*1.0+skyPan.y);
      if(!q||q[2]>=1)continue;
      x=q[0];y=q[1];
      if(x<-30||x>W+30||y<-30||y>H+30)continue;
    }else{
      c=cons(tr.cons);s=c&&c.stars[tr.star];
      if(!s||!(s._a>0))continue;
      q=gSkyC(s.x+c.ox,s.y+c.oy,72,true);if(!q)continue;
      x=q[0];y=q[1];
    }
    pu=.5+.5*Math.sin(now*.0016+i*.83);
    drawStarGlow(x,y,5.2+2.4*pu,tr.rgb,(.16+.16*pu)*OFX.p*dim*(1-.85*q[2]));
  }
  g.restore();
}
/* Jejak debu bintang di kursor / sentuhan. Warna ngikut BGM aktif. Jumlah partikel dibatasi. */
function ofxSpawnDust(x,y,n){
  var cap=W<500?14:26,pal=OFX.pK>OFX.pC?OFX_PAL_K:OFX_PAL_C,d=OFX.dust;
  while(n-->0){
    if(d.length>=cap)d.shift();
    d.push({x:x+(Math.random()-.5)*8,y:y+(Math.random()-.5)*8,vx:(Math.random()-.5)*.03,vy:(Math.random()-.35)*.025,
      t:performance.now(),l:650+Math.random()*500,r:1.1+Math.random()*1.6,c:pal[(Math.random()*3)|0]});
  }
}
function ofxDrawDust(now){
  var a=OFX.dust,i,p,dt,u;
  if(!a.length)return;
  g.save();g.globalCompositeOperation='lighter';
  for(i=a.length-1;i>=0;i--){
    p=a[i];dt=Math.max(0,now-p.t);u=dt/p.l;
    if(u>=1){a.splice(i,1);continue;}
    drawStarGlow(p.x+p.vx*dt,p.y+p.vy*dt,p.r*(1.25-.45*u),p.c,.7*(1-u)*(1-u));
  }
  g.restore();
}
if(!reduce&&!IS_POTATO){
  window.addEventListener('pointermove',function(e){
    if(OFX.p<.3||!ofxAllowed())return;
    var now=performance.now();
    if(now-OFX.dAt<(W<500?60:36))return;
    var dx=e.clientX-OFX.dx,dy=e.clientY-OFX.dy;
    if(dx*dx+dy*dy<80)return;
    OFX.dAt=now;OFX.dx=e.clientX;OFX.dy=e.clientY;
    ofxSpawnDust(e.clientX,e.clientY,1);
  },{passive:true});
  window.addEventListener('pointerdown',function(e){
    if(OFX.p<.3||!ofxAllowed())return;
    OFX.dx=e.clientX;OFX.dy=e.clientY;OFX.dAt=performance.now();
    ofxSpawnDust(e.clientX,e.clientY,3);
  },{passive:true});
}
/* Ducking BGM removed — mute is only via #mode-silence fade. */
function ofxDuckBgm(){return false;}
function ofxDuckAbort(){}
function ofxDuckRelease(){}

/* ================= Sector Overview (idle) — fase 1 =================
   Idle = satu ikon gugus per sektor mengelilingi Gargantua (sektor 0, tengah). Ikon digambar lewat gSky(),
   jadi tetap kena lensing / drag / swallow Gargantua. Sektor kosong = "???" (belum diisi).
   Tap ikon terisi -> sementara masuk ke tampilan rasi lama (placeholder zoom, fase 2). Tombol ◎ = balik ke overview. */
var SECT={on:true,vis:1,phase:'ov',cur:null,busy:false,z:0,t0:0,zt:2.4,dur:950,flash:0,list:[
  {k:'orion',name:'Orion',ids:['orion','taurus','canis','pleiades'],a:-150},
  {k:'virgo',name:'Virgo',ids:['virgo','bootes','scorpius'],a:-30},
  {name:'???',ids:[],a:-90},{name:'???',ids:[],a:30},{name:'???',ids:[],a:90},{name:'???',ids:[],a:150}
],down:null};
function sectSet(on){
  SECT.on=!!on;
  try{var bc=document.body.classList;bc.toggle('sect-ov',SECT.on);
    bc.toggle('sect-in',!SECT.on&&!!SECT.cur);
    bc.toggle('sect-in-orion',!SECT.on&&!!SECT.cur&&SECT.cur.k==='orion');bc.toggle('sect-in-virgo',!SECT.on&&!!SECT.cur&&SECT.cur.k==='virgo');}catch(e){}
  try{var ob=document.getElementById('mode-observe');if(ob)ob.textContent=observeIcon();}catch(eO){}
  if(SECT.on){try{syncSkyPanHits();}catch(e){}}
}
function sectGlyph(c,cx,cy,box,al){
  if(!c||!c.stars||!c.bw||!c.bh||!c.lines)return;
  var sc=box/Math.max(c.bw,c.bh),ox=cx-c.bw*sc/2,oy=cy-c.bh*sc/2,i,k,a,b;
  g.strokeStyle='rgba(110,229,255,'+(.42*al)+')';g.lineWidth=.8;g.beginPath();
  for(i=0;i<c.lines.length;i++){
    a=c.stars[c.lines[i][0]];b=c.stars[c.lines[i][1]];
    if(!a||!b||a.rx==null||b.rx==null)continue;
    g.moveTo(ox+(a.rx-c.minx)*sc,oy+(a.ry-c.miny)*sc);g.lineTo(ox+(b.rx-c.minx)*sc,oy+(b.ry-c.miny)*sc);
  }
  g.stroke();
  g.fillStyle='rgba(234,246,255,'+(.9*al)+')';
  for(k in c.stars){var s=c.stars[k];if(s.rx==null)continue;
    g.beginPath();g.arc(ox+(s.rx-c.minx)*sc,oy+(s.ry-c.miny)*sc,Math.max(.8,(s.r||1.3)*.5),0,6.283);g.fill();}
}
function sectShow(id){return !SECT.cur||SECT.cur.ids.indexOf(id)>=0;}
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
  try{if(CAMERA_MODE)setCameraMode(false);}catch(e){}
  sumReset();
  SECT.busy=true;SECT.phase='out';SECT.t0=performance.now();
  SECT.cur=null;SECT.flash=SECT.t0;
  sectSet(true);sectApply(s,1);
  try{syncSkyPanHits();}catch(e){}
}
function sectToggle(){
  if(SECT.busy)return;
  if(SECT.phase==='sec')sectZoomOut();
}
/* ---- Gargantua = sektor 0. Di dalam sektor dia disembunyikan; tombol 🕳️ memanggilnya kecil (seukuran pulse) & bebas di-parkir ---- */
/* Soft proximity of summoned mini-BH to rasi/cluster mass. Continuous field, no hard edge. */
function bhNearFactor(){
  if(!SECT.cur||!SUM.on||!W||!H)return 0;
  var bx=BH.x,by=BH.y,i,cs,cx,cy,hw,hh,dx,dy,d,R,w,acc=0,wSum=0;
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
  if(SW)return 1;
  if(SECT.cur){
    if(!SUM.on)return 0;
    var base=Math.min(1,SUM_R/Math.max(1,BH.R)); /* mini parked size */
    var f=bhNearFactor();
    /* Near mass → grow toward full overview size; curve keeps mid-range readable */
    return base+(1-base)*(0.08*f+0.92*f*f);
  }
  if(SECT.phase==='in')return 0;
  return 1;
}
/* Critically-damped-ish scale so drag growth feels heavy, not laggy or snappy. */
var _bhScV=0,_bhScT=0;
function bhScaleStep(){
  var t=bhScaleTarget();
  var now=performance.now();
  var dt=Math.min(50,_bhScT?now-_bhScT:16)/1000;_bhScT=now;
  if(!(SECT.cur&&SUM.on)){
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
  if(SECT.cur&&!SUM.on&&BHSC<.02&&!drag.on){BH.x=BH.hx;BH.y=BH.hy;}
  var hid=BHSC<.05;
  try{
    var bhEl=document.getElementById('bh');
    if(bhEl&&bhEl._hid!==hid){bhEl._hid=hid;bhEl.style.visibility=hid?'hidden':'';if(CAPS&&CAPS.bh)CAPS.bh.style.visibility=hid?'hidden':'';}
  }catch(e){}
}
function sumSpot(){
  var hb=0,ft=H;
  try{hb=vrect($('#header')).bottom;ft=vrect($('#footer')).top;}catch(e){}
  var x0=Math.max(40,W*.08),x1=W-x0,y0=Math.max(hb+30,H*.14),y1=Math.min(ft-30,H*.88),pts=[],k,c,s2,q,i,j;
  CONS.forEach(function(cc){
    if(!sectShow(cc.id))return;
    for(k in cc.stars){s2=cc.stars[k];q=skyXF(s2.x+cc.ox,s2.y+cc.oy);pts.push(q[0],q[1]);}
  });
  if(sectShow('pleiades')&&PLEIADES.ready){
    PLEIADES.bright.forEach(function(z){q=skyXF(PLEIADES.x+z.x*PLEIADES.scale,PLEIADES.y+z.y*PLEIADES.scale);pts.push(q[0],q[1]);});
  }
  var best=null,bs=-1,nx=14,ny=10;
  for(i=0;i<=nx;i++)for(j=0;j<=ny;j++){
    var cx=x0+(x1-x0)*i/nx,cy=y0+(y1-y0)*j/Math.max(1,ny),md=1e9;
    for(k=0;k<pts.length;k+=2){var d=Math.hypot(cx-pts[k],cy-pts[k+1]);if(d<md)md=d;}
    if(md>bs){bs=md;best=[cx,cy];}
  }
  return best||[W*.5,H*.5];
}
function sumSet(on){
  if(on&&(!SECT.cur||SECT.busy||SW))return;
  if(SECT.busy||SW)return;
  if(on){
    var sp=sumSpot(),z=skyZoom||1,cx=W*.5,cy=H*.5;
    BH.x=cx+(sp[0]-cx)/z-skyPan.x*BHK;BH.y=cy+(sp[1]-cy)/z-skyPan.y*BHK;
    SUM.on=true;SECT.cur.relay=true;
    try{if(typeof showModeToast==='function')showModeToast('GARGANTUA SUMMONED\nDRAG TO PARK ANYWHERE\nRELAY SET · OVERVIEW SIGNAL STAYS CLEAR',null,3200);}catch(e){}
  }else{
    SUM.on=false;if(SECT.cur)SECT.cur.relay=false;
    try{if(CAMERA_MODE&&camFocusId()==='bh'){FOCUS.i=0;FOCUS.anim=false;focusUI();}}catch(e){}
    try{if(typeof showModeToast==='function')showModeToast('GARGANTUA RECALLED',null,1800);}catch(e){}
  }
  haptic(10);sumUI();
}
function sumReset(){SUM.on=false;BH.x=BH.hx;BH.y=BH.hy;sumUI();}
function sumUI(){
  var b=document.getElementById('mode-bh');if(!b)return;
  b.classList.toggle('on',SUM.on);b.setAttribute('aria-pressed',SUM.on?'true':'false');
  b.title=b.ariaLabel=SUM.on?'Recall Gargantua':'Summon Gargantua';
  b.setAttribute('aria-label',b.title);
}
function sectStep(now){
  if(!SECT.busy)return;
  var s=SECT.target;if(!s){SECT.busy=false;return;}
  var u=clamp((now-SECT.t0)/(reduce?1:SECT.dur));
  if(SECT.phase==='in'){
    sectApply(s,sectEase(u));
    if(u>=1){
      SECT.flash=now;SECT.cur=s;SECT.phase='sec';SECT.busy=false;
      skyZoom=1;skyPan.x=0;skyPan.y=0;SECT.z=0;
      sectSet(false);
      try{FOCUS.list=null;FOCUS.i=0;FOCUS.anim=false;if(CAMERA_MODE){FOCUS.list=focusList();focusUI();}}catch(eF){}
      try{syncSkyPanHits();}catch(e){}
    }
  }else if(SECT.phase==='out'){
    sectApply(s,1-sectEase(u));
    if(u>=1){
      SECT.busy=false;SECT.phase='ov';skyZoom=1;skyPan.x=0;skyPan.y=0;SECT.z=0;
      try{FOCUS.list=null;FOCUS.i=0;FOCUS.anim=false;}catch(eF){}
      try{syncSkyPanHits();}catch(e){}
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
  SECT.vis+=((OBSERVE_MODE?0:1)-SECT.vis)*.12; /* mode 👁️: ikon sektor memudar, tinggal kanvas */
  if(SECT.vis<.01){SECT.vis=0;for(var j=0;j<n;j++)SECT.list[j].sx=null;return;}
  for(var i=0;i<n;i++){
    var s=SECT.list[i],al=clamp((age-.5-i*.14)/1.1),empty=!s.ids.length;
    if(al<=0)continue;
    var an=s.a*Math.PI/180,bx=BH.hx+Math.cos(an)*rx,by=BH.hy+Math.sin(an)*ry;
    s.bx=bx;s.by=by;
    var p=gSky(bx+mx,by+my);
    s.sx=p[0];s.sy=p[1];
    var vis=al*SECT.vis*(1-Math.min(1,p[2]));
    if(vis<=.01)continue;
    var br=reduce?0:Math.sin(now*.0015+i*1.3)*.04,r=rad*(1+br);
    g.save();
    g.globalAlpha=vis;
    /* halo */
    var gr=g.createRadialGradient(p[0],p[1],r*.2,p[0],p[1],r*2.1);
    gr.addColorStop(0,empty?'rgba(150,170,195,.06)':'rgba(110,229,255,.16)');gr.addColorStop(1,'rgba(110,229,255,0)');
    g.fillStyle=gr;g.beginPath();g.arc(p[0],p[1],r*2.1,0,6.283);g.fill();
    /* dashed ring */
    g.lineWidth=1;g.strokeStyle=empty?'rgba(184,198,214,.28)':'rgba(110,229,255,.5)';
    if(g.setLineDash){g.setLineDash([3,5]);g.lineDashOffset=reduce?0:-now*.012;}
    g.beginPath();g.arc(p[0],p[1],r,0,6.283);g.stroke();
    if(g.setLineDash)g.setLineDash([]);
    g.textAlign='center';g.textBaseline='middle';
    if(empty){
      g.fillStyle='rgba(184,198,214,.5)';g.font='600 '+Math.round(r*.62)+'px "Space Grotesk",system-ui,sans-serif';
      g.fillText('???',p[0],p[1]);
    }else{
      sectGlyph(cons(s.ids[0]),p[0],p[1],r*1.45,1);
    }
    /* label */
    g.font='500 9px "Space Grotesk",system-ui,sans-serif';g.textBaseline='top';
    g.fillStyle=empty?'rgba(184,198,214,.4)':'rgba(214,236,248,.82)';
    var lab=empty?'unmapped':(s.name+(s.ids.length>1?'  +'+(s.ids.length-1):''));
    g.fillText(lab,p[0],p[1]+r+7);
    if(s.relay&&!(s.flash&&now-s.flash<1500)){
      g.fillStyle='rgba(110,229,255,.7)';g.fillText('\u25c9 relay',p[0],p[1]+r+19);
    }
    if(s.flash&&now-s.flash<1500){
      g.fillStyle='rgba(255,154,217,'+(.85*(1-(now-s.flash)/1500))+')';
      g.fillText('no signal yet',p[0],p[1]+r+19);
    }
    g.restore();
  }
}
(function sectInit(){
  var b=document.getElementById('mode-sectors');
  if(b)b.addEventListener('click',sectToggle);
  var bb=document.getElementById('mode-bh');
  if(bb)bb.addEventListener('click',function(){sumSet(!SUM.on);});
  sectSet(true);
  try{if(window.__hub)window.__hub.sect=SECT;}catch(e){}
  var SKIP='#bh,.portal,.hit,#owl-source,#owl-panel,#owl-backdrop,#bh-clock,#music-toggle,#music-player,#mode-cluster,#mode-sectors,#mode-bh,#cam-zoom,#boot-screen,#terminal,#signal-fragment';
  function owlShut(){var bc=document.body.classList;return bc.contains('owl-open')||bc.contains('owl-block');}
  document.addEventListener('pointerdown',function(e){
    if(owlShut()){SECT.down=null;return;} /* panel owl terbuka / baru ditutup: tap tidak boleh tembus ke ikon sektor (Virgo dll) */
    if(SECT.busy&&!(e.target.closest&&e.target.closest('#mode-cluster'))){e.stopPropagation();SECT.down=null;return;} /* animasi zoom: sentuhan diabaikan */
    if(!SECT.on||OBSERVE_MODE||SW||drag.on||(e.target.closest&&e.target.closest(SKIP))){SECT.down=null;return;}
    SECT.down={x:e.clientX,y:e.clientY,t:performance.now()};
  },true);
  document.addEventListener('pointerup',function(e){
    var d=SECT.down;SECT.down=null;
    if(!d||owlShut()||!SECT.on||SECT.busy||SW||drag.on)return;
    var now=performance.now();
    if(now-d.t>420||Math.hypot(e.clientX-d.x,e.clientY-d.y)>10)return;
    var best=null,bd=Math.max(34,Math.min(30,W*.07)+14);
    for(var i=0;i<SECT.list.length;i++){var s=SECT.list[i];
      if(s.sx==null)continue;
      var dd=Math.hypot(e.clientX-s.sx,e.clientY-s.sy);if(dd<bd){bd=dd;best=s;}}
    if(!best)return;
    if(best.ids.length){sectZoomIn(best);}else{best.flash=now;try{navigator.vibrate&&navigator.vibrate(12);}catch(er){}}
  },true);
})();

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
    var age=reduce?99:(now-START)/1000;
    if(SW)swP=clamp((now-SW.t0)/SW.dur);
    mouse.x+=(mouse.tx-mouse.x)*.05;mouse.y+=(mouse.ty-mouse.y)*.05;
    updateAudioViz(now);
    ofxSafe(ofxUpdate,now);
    updateConstellationFocus(now);
    updateTimeDilation(now);
    if(hoverDirty&&mouse.px!=null&&!drag.on&&!SECT.on&&(now-lastHoverAt)>=HOVER_MIN_MS){
      updateHover(mouse.px,mouse.py);
      hoverDirty=false;lastHoverAt=now;
    }
    bhScaleStep();
    if(!drag.on&&!SECT.cur&&(Math.abs(BH.x-BH.hx)>.05||Math.abs(BH.y-BH.hy)>.05)){
      BH.x+=(BH.hx-BH.x)*.065;BH.y+=(BH.hy-BH.y)*.065;
    }
    focusStep();
    /* Sky pan + rot springback when fingers are up.
       Disabled in Constellation Camera so the observer can explore freely. */
    if(!CAMERA_MODE&&!SECT.busy&&!skyDrag.on&&!skyRotDrag.on&&!skyPinch.on){
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
    resetCanvasState();
    g.clearRect(0,0,W,H);
    if(bgCanvas){
      // 1. Warna dasar ruang angkasa agar pinggiran layar tidak bocor saat background bergeser
      g.fillStyle='#050b12';
      g.fillRect(0,0,W,H);

      // 2. Astrophotography plate: 2 layer offscreen, hanya drawImage + offset parallax per frame.
      //    Deep (debu/galaksi) bergeser & zoom lebih lambat daripada mid (bintang) => kedalaman.
      var pM=plateM,pW=W+2*pM,pH=H+2*pM;
      var pmx=0,pmy=0;
      if(plateDeep)plateBlit(plateDeep,pM,pW,pH,1+(skyZoom-1)*.55,skyPan.x*.14+pmx*4,skyPan.y*.14+pmy*3);
      /* Drifting dust depth layers (static when prefers-reduced-motion). */
      for(var dli=0;dli<plateDust.length;dli++){
        var dl=plateDust[dli],dt2=reduce?0:now*.001,
            ddx=reduce?0:Math.sin(dt2*6.2832/dl.per+dl.ph)*dl.amp,
            ddy=reduce?0:Math.cos(dt2*6.2832/(dl.per*1.37)+dl.ph)*dl.amp*.6;
        plateBlit(dl.c,pM,pW,pH,1+(skyZoom-1)*dl.zf,skyPan.x*dl.par+ddx,skyPan.y*dl.par+ddy);
      }
      plateBlit(bgCanvas,pM,pW,pH,skyZoom,skyPan.x*.35+pmx*10,skyPan.y*.35+pmy*7);
      drawHud();
    }
    ofxSafe(ofxDrawTint,now); /* langit bergeser warna mengikuti BGM */
    drawFloatingTelescope(now);
    var msgEl=$('#secret-msg');
    if(msgEl&&msgEl.classList.contains('on')&&msgEl.dataset.type==='telescope')placeSecretMsg();
    teleGreetFollow();
    updateClockDilation(now);
    drawShooting(now);
    cullBegin();
    sectStep(now);
    if(SECT.on){drawPulses(now,age);drawSectorOverview(now,age);}
    else{
    CONS.forEach(function(c){if(sectShow(c.id))drawCons(c,age,now);});
    drawPulses(now,age);
    CONS.forEach(function(c){if(sectShow(c.id))drawStars(c,age,now);});
    if(sectShow('pleiades'))drawPleiades(age,now);
    }
    drawTriggerVisuals(now);
    ofxSafe(ofxDrawAvail,now);
    drawFocusFx(now);
    drawSupernovaBursts(now);
    ofxSafe(ofxDrawDust,now);

    // RENDER EFEK KOSMIK BARU:
    drawBHShockwaves(now);
    drawHyperspaceWarp(now);
    drawTargetLock(now);

    /* Isolate late-stage canvas effects so one mobile/WebView compatibility
       issue cannot abort the frame before Gargantua is rendered. */
    try{drawAsteroids(now);}catch(err){window.__hub.renderError='drawAsteroids: '+(err&&err.message||err);}
    try{drawPortals(age,now);}catch(err){window.__hub.renderError='drawPortals: '+(err&&err.message||err);}
    drawHoleSafe(now,age);
    drawSectFlash(now);
    try{sectorScanUpdate(now);}catch(err){window.__hub.renderError='sectorScan: '+(err&&err.message||err);}
    lastFrameOK=now;
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
   by the hidden duration so transient FX (shockwaves, hyperspace streaks,
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

    /* Transient FX introduced later: gravitational shockwaves + hyperspace streaks */
    if(typeof BH_SHOCKWAVES!=='undefined'){
      for(var bi=0;bi<BH_SHOCKWAVES.length;bi++)BH_SHOCKWAVES[bi].t0+=pause;
    }
    if(typeof WARP_STREAKS!=='undefined'){
      for(var wi=0;wi<WARP_STREAKS.length;wi++)WARP_STREAKS[wi].t0+=pause;
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
/* ---------- mini music player + fake spectrum ----------
   When the HUD is open and a track plays: spectrum sits beside the track name.
   When the HUD is closed while music still plays: spectrum moves into the
   music-toggle logo (note icon hides, bars take its place). */
(function(){
  var panel=$('#music-player'),toggle=$('#music-toggle'),close=$('#music-close'),playBtn=$('#music-play');
  var nowEl=$('#mp-now-playing');
  if(!panel||!toggle||!close||!playBtn)return;

  /* Unified track list: the 8 Stellar Signals (star SFX) in A-Z order,
     followed by the 2 Observatory BGM loops. The order must match the HTML. */
  var tracks=[
    {type:'sfx',key:'aldebaran',name:'aldebaran',audio:SFX.aldebaran},
    {type:'sfx',key:'antares',name:'antares',audio:SFX.antares},
    {type:'sfx',key:'arcturus',name:'arcturus',audio:SFX.arcturus},
    {type:'sfx',key:'betel',name:'betelgeuse',audio:SFX.betel},
    {type:'sfx',key:'pleione',name:'pleione',audio:SFX.pleione},
    {type:'sfx',key:'rigel',name:'rigel',audio:SFX.rigel},
    {type:'sfx',key:'sirius',name:'sirius',audio:SFX.sirius},
    {type:'sfx',key:'spica',name:'spica',audio:SFX.spica},
    {type:'bgm',index:0,name:'constellation',audio:AMB},
    {type:'bgm',index:1,name:'collapsars',audio:MUSIC_COLLAP}
  ];

  var rows=[].slice.call(panel.querySelectorAll('.mp-track'));
  var trackNames=tracks.map(function(t){return t.name;});
  var activeIdx=8; /* default highlighted row: Constellation BGM */
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
    tracks.forEach(function(t){if(t.audio&&t.audio!==keepAudio)safePause(t.audio);});
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
    selectAndPlay(cur===8?9:8);
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
    playBtn.setAttribute('aria-label',playing?'Pause music':'Play music');
    playBtn.innerHTML='<span class="mp-play-icon" aria-hidden="true">'+(playing?'Ⅱ':'▶')+'</span><span class="mp-play-label">'+(playing?'Pause':'Play')+'</span>';
    if(playing)startSpec();else stopSpec();
    /* Title migrates to logo side when HUD closes while music plays;
       after 2s it slides into the logo. */
    if(playing&&!open)showNowPlaying();
    else clearNowPlaying();
  }
  function pulseBars(bars,now,minH,maxH){
    if(!bars||!bars.length)return;
    for(var i=0;i<bars.length;i++){
      var wave=.5+.5*Math.sin(now*.0085+i*1.21+activeIdx*2.4);
      var center=1-Math.abs((i-(bars.length-1)/2)/Math.max(1,(bars.length-1)/2));
      var h=minH+(maxH-minH)*wave*(.32+.68*center);
      bars[i].style.height=h.toFixed(1)+'px';
    }
  }
  function tickSpec(now){
    specRAF=0;
    var playingIdx=getPlayingTrackIndex();
    if(playingIdx===-1){stopSpec();return;}
    var open=panelOpen();
    if(open){
      pulseBars(rowSpecs[playingIdx],now,2.2,11);
    }else{
      pulseBars(miniBars,now,3,13);
    }
    specRAF=requestAnimationFrame(tickSpec);
  }
  function startSpec(){
    if(specRAF||reduce)return;
    specRAF=requestAnimationFrame(tickSpec);
  }
  function stopSpec(){
    if(specRAF){cancelAnimationFrame(specRAF);specRAF=0;}
    rowSpecs.forEach(function(bars){bars.forEach(function(b){b.style.height='3px';});});
    miniBars.forEach(function(b){b.style.height='4px';});
  }
  /* Called from playSfx (pauseMusicForSfx) the instant a star SFX takes
     over — clears playing UI immediately without waiting for the BGM's
     'pause' event, so the HUD never flashes a stale state. */
  musicForceStop=function(){
    stopSpec();
    toggle.classList.remove('playing-closed');
    rows.forEach(function(row){row.classList.remove('playing');});
    playBtn.setAttribute('aria-label','Play music');
    playBtn.innerHTML='<span class="mp-play-icon" aria-hidden="true">▶</span><span class="mp-play-label">Play</span>';
    clearNowPlaying();
    if(MS&&msKey){try{MS.playbackState='paused';}catch(e){}}
  };
  function openPanel(){
    panel.classList.add('open');panel.setAttribute('aria-hidden','false');toggle.setAttribute('aria-expanded','true');
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
    if(target.type==='sfx'&&!isUnlocked(target.key)){lockedHint(target.key);return;}
    if(typeof RADIO_SILENCE!=='undefined'&&RADIO_SILENCE){showModeToast('RADIO SILENCE\nAUDIO CHANNEL CLOSED','silence',1800);return;}
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
      target.audio.volume=.5;
      safePlay(target.audio);
    }
    sync();
  }
  function toggleCurrentPlay(){
    if(typeof RADIO_SILENCE!=='undefined'&&RADIO_SILENCE){var playingIdx0=getPlayingTrackIndex();if(playingIdx0===-1){showModeToast('RADIO SILENCE\nAUDIO CHANNEL CLOSED','silence',1800);return;}}
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
  /* Stars can also start/stop via canvas hits, so listen on every track's
     own audio element (not just the two BGM loops) to stay in sync. */
  tracks.forEach(function(t){
    if(!t.audio)return;
    t.audio.addEventListener('play',sync);
    t.audio.addEventListener('pause',sync);
    t.audio.addEventListener('ended',sync);
  });
  sync();
})();

function triggerSupernova(key){
  if(SW)return;
  if(!isUnlocked(key)){lockedHint(key);return;}
  var tr=TRIGGERS[key],
      c=tr&&tr.cons==='pleiades'?PLEIADES:(tr&&cons(tr.cons)),
      s=tr&&c&&(tr.cons==='pleiades'?PLEIADES.bright.filter(function(z){return z.name===tr.star;})[0]:c.stars[tr.star]);
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
    prevSfx.onended=null;safeReset(prevSfx);
    activeSfx=null;setAVColor(null,false);audioVizOff();tdRelease();
  }
  /* Sisa efek dari klik sebelumnya dibersihin dulu. */
  SN_BURSTS.length=0;
  if(typeof WARP_STREAKS!=='undefined')WARP_STREAKS.length=0;

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

  // Trigger efek kilatan garis hyperspace ke arah bintang target
  triggerHyperspaceWarp(sx, sy);

  /* 2. Warp telescope to the star; SFX + haptic fire on arrival. */
  TELESCOPE.mode='warp';
  /* Track the star in sky space: camera pan/zoom/focus moves it on screen, so re-project every frame. */
  TELESCOPE.follow=function(){
    var fx=tr.cons==='pleiades'?(PLEIADES.x+s.x*PLEIADES.scale+mouse.x*1.4+skyPan.x):(s.x+c.ox),
        fy=tr.cons==='pleiades'?(PLEIADES.y+s.y*PLEIADES.scale+mouse.y*1.0+skyPan.y):(s.y+c.oy);
    return skyXF(fx,fy); /* pre-gravity: the telescope draw applies lens() itself */
  };
  var ft=TELESCOPE.follow();TELESCOPE.targetX=ft[0];TELESCOPE.targetY=ft[1];
  TELESCOPE.followKind='star';TELESCOPE.followSect=null;TELESCOPE.orbitR=38;
  TELESCOPE.onWarpComplete=function(){sfxArrive(key);};
}
function sfxArrive(key){
    playSfx(SFX[key]);
    haptic(key==='betel'?20:18);
    /* Stellar Memory: click/observe on interaction (fragment waits for SFX end). */
    if(typeof StellarMem!=='undefined'&&STELLAR_KEYS.indexOf(key)>=0){
      var firstObs=StellarMem.markObserved(key);
      if(typeof rememberLastSignal==='function')rememberLastSignal(key);
      renderStellarRecord();
      var cid=STELLAR_CONS[key];
      if(cid&&StellarMem.consComplete(cid)&&!StellarMem.isArchived(cid)){
        if(StellarMem.markArchived(cid)){
          setTimeout(function(){showConsArchive(cid);renderStellarRecord();},1200);
        }
      }
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
    var tr=TRIGGERS[b.key],c=tr.cons==='pleiades'?PLEIADES:cons(tr.cons),s=tr.cons==='pleiades'?PLEIADES.bright.filter(function(z){return z.name===tr.star;})[0]:c.stars[tr.star],sx=tr.cons==='pleiades'?(PLEIADES.x+s.x*PLEIADES.scale+mouse.x*1.4+skyPan.x):(s.x+c.ox),sy=tr.cons==='pleiades'?(PLEIADES.y+s.y*PLEIADES.scale+mouse.y*1.0+skyPan.y):(s.y+c.oy),q=gSky(sx,sy);
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
function cOrionOffsetX(){return cons('orion').ox||0}
function cOrionOffsetY(){return cons('orion').oy||0}

/* ---------- interaksi ---------- */
if(!reduce)window.addEventListener('pointermove',function(e){
  markActivity();
  mouse.px=e.clientX;mouse.py=e.clientY;
  mouse.tx=Math.max(-1,Math.min(1,(e.clientX/W-.5)*2));mouse.ty=Math.max(-1,Math.min(1,(e.clientY/H-.5)*2));
  hoverDirty=true;
},{passive:true});
window.addEventListener('pointerdown',markActivity,{passive:true});
function updateHover(px,py){
  if(drag.on)return;
  var hit=null,best=12;
  var ph=sectShow('pleiades')&&pleiadesHitAt(px,py);
  if(ph){hot='pleione';return;}
  if(hot==='pleione')hot=null;
  CONS.forEach(function(c){
    c._hot=-1;
    if(!sectShow(c.id))return;
    Object.keys(c.stars).forEach(function(k){
      /* Project through gSky (skyRot + lens) so the hit test matches what's
         actually on screen after a mobile 2-finger rotate, not the pre-rotation
         world position. */
      var s=c.stars[k],q=gSky(s.x+c.ox,s.y+c.oy),d=Math.hypot(px-q[0],py-q[1]);
      if(d<Math.max(10,s.r*3.5)&&d<best){best=d;hit={c:c,star:k};}
    });
    if(isUnlocked(c.id))c.lines.forEach(function(l,i){
      var a=c.stars[l[0]],b=c.stars[l[1]];
      var qa=gSky(a.x+c.ox,a.y+c.oy),qb=gSky(b.x+c.ox,b.y+c.oy);
      var ax=qa[0],ay=qa[1],bx=qb[0],by=qb[1];
      var vx=bx-ax,vy=by-ay,den=vx*vx+vy*vy||1,t=Math.max(0,Math.min(1,((px-ax)*vx+(py-ay)*vy)/den));
      var d=Math.hypot(px-(ax+vx*t),py-(ay+vy*t));
      if(d<5&&d<best){best=d;hit={c:c,line:i};}
    });
  });
  if(hit){hot=hit.star==='betel'?'betel':(hit.star==='rigel'?'rigel':(hit.star==='spica'?'spica':(hit.star==='sirius'?'sirius':(hit.star==='aldebaran'?'aldebaran':(hit.star==='arcturus'?'arcturus':(hit.star==='antares'?'antares':hot))))));if(hit.line!=null)hit.c._hot=hit.line;}
  else if(hot!=='bh'&&hot!=='spica'&&hot!=='rigel'&&hot!=='betel'&&hot!=='sirius'&&hot!=='aldebaran'&&hot!=='arcturus'&&hot!=='antares')hot=null;
}
document.addEventListener('pointerdown',function(e){
  if(document.body.classList.contains('owl-open')||document.body.classList.contains('owl-block'))return;
  if(SECT.on||SW||drag.on||e.target.closest('#betel-fx,#rigel-fx,#sirius-fx,#bh,.portal,.hit,#owl-source,#bh-clock,#music-toggle,#music-player,#mode-cluster,#mode-observe,#mode-silence'))return;
  var now=performance.now(),hit=null,best=40;
  var aligning=(typeof ALIGN!=='undefined'&&ALIGN.cid);
  /* Saat alignment aktif, Pleiades dilewatin biar nggak nyuri tap bintang urutan. */
  var ph=(aligning||!sectShow('pleiades'))?null:pleiadesHitAt(e.clientX,e.clientY);
  if(ph){
    tapFlash={until:now+420,cons:'pleiades'};
    triggerSupernova('pleione');
    return;
  }
  CONS.forEach(function(c){
    if(!sectShow(c.id))return;
    Object.keys(c.stars).forEach(function(k){
      /* Same gSky projection as drawing/hover, so a tap still lands on the
         star after the sky has been rotated with a 2-finger twist. */
      var s=c.stars[k],q=gSky(s.x+c.ox,s.y+c.oy),d=Math.hypot(e.clientX-q[0],e.clientY-q[1]);
      var hr=Math.min(18,Math.max(13,s.r*4)); /* perilaku lama: cap 18px */
      /* Alignment: bintang target berikutnya dapet hit radius gede (mobile-friendly). */
      var isNext=aligning&&alignMark(c,k)==='next';
      if(isNext)hr=Math.max(26,s.r*8);
      /* Target berikutnya selalu menang kalau tap-nya masuk radiusnya, walau ada bintang lain yang lebih dekat. */
      if(d<hr&&(isNext||d<best)){hit={c:c,star:k};best=isNext?-1:d;}
    });
  });
  if(hit){
    tapFlash={until:now+420,cons:hit.c.id};
    /* as: false = bukan langkah alignment; 'step' = langkah biasa (dihitung doang, SFX diam);
       'done' = langkah terakhir (unlock + SFX + popup sudah ditangani di alignTapStar). */
    var as=(typeof alignTapStar==='function')?alignTapStar(hit.c,hit.star):false;
    var tk=(TRIGGERS[hit.star]&&TRIGGERS[hit.star].cons===hit.c.id)?hit.star:null; /* betel, rigel, spica, sirius, aldebaran, arcturus, antares */
    if(tk){
      if(!as)triggerSupernova(tk); /* terkunci -> bisu + hint (digate di triggerSupernova) */
    }
    else {
      // Mainkan chime synthesizer kosmik untuk bintang biasa
      playStarChime(hit.c.stars[hit.star]);

      /* Toggle portal DUMUL jika pengguna nge-tap bintang Sabuk Orion (Mintaka/Alnilam/Alnitak) */
      if(!aligning&&hit.c.id==='orion'&&(hit.star==='mintaka'||hit.star==='alnilam'||hit.star==='alnitak')){
        var bandP=PORTALS[0];
        if(bandP&&bandP.el)bandP.el.classList.toggle('mobile-show');
      }
      haptic(8);
    }
  }
},{passive:true});
document.addEventListener('pointerdown',function(e){
  if(SW||reduce)return;
  var ai=asteroidScreenAt(e.clientX,e.clientY);
  if(ai>=0&&typeof ALIGN!=='undefined'&&ALIGN.cid&&constellationTargetAt(e.clientX,e.clientY,true))ai=-1;
  if(ai>=0){
    e.preventDefault();e.stopPropagation();
    scatterAsteroid(ai,e.clientX,e.clientY);
  }
},{passive:false});
/* Header title glitch removed — branding lives in #owl-panel only. */
/* ---------- Owl about panel ---------- */
(function(){
  var btn=document.getElementById('owl-source');
  var panel=document.getElementById('owl-panel');
  var back=document.getElementById('owl-backdrop');
  var closeB=document.getElementById('owl-close');
  var brand=document.getElementById('owl-panel-title');
  if(!btn||!panel)return;
  /* Kilau jarang & acak: tunggu 20–60 dtk, itu pun 35% dilewati. Skip kalau tab hidden / panel kebuka / reduce-motion / device low-end. */
  (function owlShine(){
    if(reduce||IS_POTATO)return;
    var t=0;
    btn.addEventListener('animationend',function(){btn.classList.remove('shine');});
    function arm(first){
      clearTimeout(t);
      t=setTimeout(function(){
        var ok=!document.hidden&&!panel.classList.contains('on')&&Math.random()>.35;
        if(ok){try{var cs=getComputedStyle(btn);if(cs.display==='none'||cs.visibility==='hidden'||+cs.opacity===0)ok=false;}catch(e){}}
        if(ok){btn.classList.remove('shine');void btn.offsetWidth;btn.classList.add('shine');}
        arm(false);
      },first?(7000+Math.random()*8000):(20000+Math.random()*40000));
    }
    arm(true);
  })();
  function openOwl(){
    panel.classList.add('on');
    if(back)back.classList.add('on');
    document.body.classList.add('owl-open');
    panel.setAttribute('aria-hidden','false');
    if(back)back.setAttribute('aria-hidden','false');
    btn.setAttribute('aria-expanded','true');
    try{haptic(8);}catch(e){}
  }
  var blockUntil=0;
  function closeOwl(){
    panel.classList.remove('on');
    if(back)back.classList.remove('on');
    panel.setAttribute('aria-hidden','true');
    if(back)back.setAttribute('aria-hidden','true');
    btn.setAttribute('aria-expanded','false');
    /* Suppress hits under the panel for one short window so close-X cannot open a sector */
    blockUntil=performance.now()+400;
    document.body.classList.add('owl-block');
    document.body.classList.remove('owl-open');
    clearTimeout(closeOwl._t);
    closeOwl._t=setTimeout(function(){document.body.classList.remove('owl-block');},420);
  }
  /* Panel brand + link icons glitch; glitchUntil shakes sky layer briefly (header-era feel, scoped to this tap) */
  function brandGlitch(){
    if(!brand||(typeof SW!=='undefined'&&SW))return;
    brand.classList.remove('gl');panel.classList.remove('gl');
    void brand.offsetWidth;
    brand.classList.add('gl');panel.classList.add('gl');
    try{glitchUntil=performance.now()+650;}catch(eG){}
    clearTimeout(brand._t);brand._t=setTimeout(function(){
      brand.classList.remove('gl');panel.classList.remove('gl');
    },700);
    try{haptic(8);}catch(e){}
  }
  function swallow(e){e.stopPropagation();}
  if(brand){
    brand.addEventListener('pointerdown',function(e){e.stopPropagation();brandGlitch();});
  }
  btn.addEventListener('click',function(e){
    e.preventDefault();e.stopPropagation();
    if(panel.classList.contains('on'))closeOwl();else openOwl();
  });
  if(closeB){
    closeB.addEventListener('pointerdown',function(e){e.preventDefault();e.stopPropagation();});
    closeB.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();closeOwl();});
  }
  if(back){
    back.addEventListener('pointerdown',swallow);
    back.addEventListener('click',function(e){e.stopPropagation();closeOwl();});
  }
  /* Isolate panel: swallow pointer so sky / portals / hits underneath never receive the tap. */
  ['pointerdown','pointerup','pointermove','click','touchstart','touchend'].forEach(function(ev){
    panel.addEventListener(ev,swallow);
  });
  document.addEventListener('pointerdown',function(e){
    if(!panel.classList.contains('on'))return;
    if(panel.contains(e.target)||(btn&&btn.contains(e.target)))return;
    if(back&&(e.target===back||back.contains(e.target)))return;
  }, true);
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'&&panel.classList.contains('on'))closeOwl();
  });
})();
var bhA=$('#bh');
bhA.addEventListener('mouseenter',function(){hot='bh';});
bhA.addEventListener('mouseleave',function(){if(hot==='bh')hot=null;});
bhA.addEventListener('focus',function(){hot='bh';});
bhA.addEventListener('blur',function(){if(hot==='bh')hot=null;});
/* Gargantua has a deliberately large invisible grab field.  The visual black hole
   stays small, but the gesture is detected by distance so canvas/star layers cannot
   shrink the touch target. */
function bhGrabRadius(){
  /* Only the area immediately around the black hole can START a Gargantua drag.
     Once the drag is active, moveBHDrag() still lets it travel across the whole canvas.
     This keeps the Konami swipe area open without shrinking Gargantua's movement range. */
  var base=Math.min(W,H);
  var full=Math.max(BH.R*2.8,Math.min(base*.18,110));
  return BHSC>=.9?full:Math.max(26,full*Math.max(0,BHSC));
}
function constellationTargetAt(x,y,skipTelescope){
  var found=false;
  if(pleiadesHitAt(x,y))found=true;
  CONS.forEach(function(c){
    Object.keys(c.stars).forEach(function(k){
      /* skyXF first (mobile 2-finger rotate), then the gravity lens - same
         order drawStars() uses via gSky - or this misses every star once
         the sky has been rotated. */
      var s=c.stars[k],q=gSky(s.x+c.ox,s.y+c.oy);
      if(!q)return;
      var d=Math.hypot(x-q[0],y-q[1]);
      if(d<Math.max(14,s.r*4.5))found=true;
    });
  });
  if(!skipTelescope&&telescopeHitAt(x,y))found=true;
  return found;
}
function beginBHDrag(e){
  if(reduce||SW||drag.on||BHSC<.05)return false;
  /* Explicit interactive star/portal layers always win over Gargantua's wide grab field.
     This is important when Rigel starts close to the black hole on the initial layout. */
  if(document.body.classList.contains('owl-open')||document.body.classList.contains('owl-block'))return false;
  if(e.target.closest && e.target.closest('#rigel-fx,#betel-fx,#sirius-fx,.hit,.portal,#owl-source,#bh-clock,#music-toggle,#music-player,#cam-zoom,#mode-cluster,#mode-observe,#mode-silence'))return false;
  /* Asteroid clicks get first refusal too, so a rock near Gargantua cannot start a BH drag. */
  if(asteroidScreenAt(e.clientX,e.clientY)>=0)return false;
  /* Star interactions always win over Gargantua's large invisible field. */
  if(constellationTargetAt(e.clientX,e.clientY))return false;
  if(!bhDragAllowed())return false;
  var bp=camBH();
  var d=Math.hypot(e.clientX-bp[0],e.clientY-bp[1]);
  if(d>bhGrabRadius()*(skyZoom>1?Math.min(1.35,0.85+0.25*skyZoom):1))return false;
  drag.on=true;drag.moved=false;drag.pid=e.pointerId;drag.x0=e.clientX;drag.y0=e.clientY;drag.bx=BH.x;drag.by=BH.y;drag.tapEligible=(d<=Math.max(BH.R*BHSC*1.9*skyZoom,BHSC<.9?24:42));
  try{cv.setPointerCapture(e.pointerId);}catch(err){}
  haptic(15);e.preventDefault();e.stopPropagation();
  return true;
}
function moveBHDrag(e){
  if(!drag.on||e.pointerId!==drag.pid)return;
  var dx=e.clientX-drag.x0,dy=e.clientY-drag.y0;
  if(Math.hypot(dx,dy)>7)drag.moved=true;
  if(drag.moved){
    var dz=(SECT.cur&&SUM.on)?Math.max(1,skyZoom):1;dx/=dz;dy/=dz;
    var limX=Math.max(90,W*.90),limY=Math.max(90,H*.90);
    BH.x=drag.bx+Math.max(-limX,Math.min(limX,dx));
    BH.y=drag.by+Math.max(-limY,Math.min(limY,dy));
    var bm=BH.R*BHSC*1.15;
    BH.x=Math.max(bm,Math.min(W-bm,BH.x));
    BH.y=Math.max(bm,Math.min(H-bm,BH.y));
    mouse.tx=Math.max(-1,Math.min(1,dx/(Math.min(W,H)*.24)));
    mouse.ty=Math.max(-1,Math.min(1,dy/(Math.min(W,H)*.24)));
  }
}
function endBHDrag(e){
  if(!drag.on||e.pointerId!==drag.pid)return;
  var was=drag.moved;drag.on=false;
  try{cv.releasePointerCapture(e.pointerId);}catch(err){}
  if(was){
    haptic(8);
    var bpSw=camBH();createBHShockwave(bpSw[0], bpSw[1]); // Buat gelombang kejut gravitasi saat Gargantua dilepas
  }else if(drag.tapEligible){
    e.preventDefault();
    startSwallow(bhA.getAttribute('href'));
  }
}
document.addEventListener('pointerdown',function(e){
  if(beginBHDrag(e))return;
},{passive:false,capture:true});
document.addEventListener('pointermove',moveBHDrag,{passive:true});
document.addEventListener('pointerup',endBHDrag,{passive:false});
document.addEventListener('pointercancel',endBHDrag,{passive:false});

/* ---------- mobile constellation pan + 2-finger rotate (±180°) ---------- */
function skyPanLimits(){
  var z=skyZoom||1;
  if(CAMERA_MODE)return {x:Math.max(W*.62,Math.max(80,W*.38)*z),y:Math.max(H*.62,Math.max(70,H*.32)*z)};
  return {x:Math.max(80,W*.38)*z,y:Math.max(70,H*.32)*z};
}
function skyHitXY(x,y){
  /* Base star pos + pan, then through gSky - same rotation AND gravity-lens
     bend the canvas actually draws with. skyXF alone (the old behavior) put
     these buttons back at the right angle after a rotate but left them
     un-bent near Gargantua, so a star lensed toward/away from the black hole
     still had its invisible tap target sitting at the un-lensed spot. */
  return gSky(x+skyPan.x,y+skyPan.y);
}
function syncSkyPanHits(){
  try{
    var o=cons('orion'),cm=cons('canis');
    if(o&&o.stars){
      var rg=o.stars.rigel,bt=o.stars.betel;
      if(rg){var rfx=$('#rigel-fx'),p=skyHitXY(rg.x,rg.y);if(rfx)rfx.style.transform='translate('+Math.round(p[0])+'px,'+Math.round(p[1])+'px)';}
      if(bt){var btx=$('#betel-fx'),p2=skyHitXY(bt.x,bt.y);if(btx)btx.style.transform='translate('+Math.round(p2[0])+'px,'+Math.round(p2[1])+'px)';}
    }
    if(cm&&cm.stars&&cm.stars.sirius){
      var sfx=$('#sirius-fx'),p3=skyHitXY(cm.stars.sirius.x,cm.stars.sirius.y);
      if(sfx)sfx.style.transform='translate('+Math.round(p3[0])+'px,'+Math.round(p3[1])+'px)';
    }
    var tau=cons('taurus');
    if(tau&&tau.stars&&tau.stars.aldebaran){
      var afx=$('#aldebaran-fx'),pAd=skyHitXY(tau.stars.aldebaran.x,tau.stars.aldebaran.y);
      if(afx)afx.style.transform='translate('+Math.round(pAd[0])+'px,'+Math.round(pAd[1])+'px)';
    }
    var bo=cons('bootes');
    if(bo&&bo.stars&&bo.stars.arcturus){
      var arcFx=$('#arcturus-fx'),pArc=skyHitXY(bo.stars.arcturus.x,bo.stars.arcturus.y);
      if(arcFx)arcFx.style.transform='translate('+Math.round(pArc[0])+'px,'+Math.round(pArc[1])+'px)';
    }
    var sc=cons('scorpius');
    if(sc&&sc.stars&&sc.stars.antares){
      var antFx=$('#antares-fx'),pAnt=skyHitXY(sc.stars.antares.x,sc.stars.antares.y);
      if(antFx)antFx.style.transform='translate('+Math.round(pAnt[0])+'px,'+Math.round(pAnt[1])+'px)';
    }
    if(PLEIADES.ready){
      var pl=PLEIADES.bright.filter(function(z){return z.interactive;})[0];
      var pfx=$('#pleione-fx');
      if(pl&&pfx){
        var px=PLEIADES.x+pl.x*PLEIADES.scale+mouse.x*1.4;
        var py=PLEIADES.y+pl.y*PLEIADES.scale+mouse.y*1.0;
        var p4=skyHitXY(px,py);
        pfx.style.transform='translate('+Math.round(p4[0])+'px,'+Math.round(p4[1])+'px)';
      }
    }
  }catch(err){
    /* Silently dropping this would leave the invisible rigel/betel/sirius/
       aldebaran/pleione hit targets stuck at their pre-rotation position with
       no trace - record it like the other render-path errors instead. */
    if(window.__hub)window.__hub.renderError='syncSkyPanHits: '+(err&&err.message||err);
  }
}
function skyPtrList(){
  var ids=Object.keys(skyPtrs),out=[];
  for(var i=0;i<ids.length;i++)out.push(skyPtrs[ids[i]]);
  return out;
}
function skyTwoAngle(){
  var pts=skyPtrList();
  if(pts.length<2)return null;
  return Math.atan2(pts[1].y-pts[0].y,pts[1].x-pts[0].x);
}
function skyTwoDist(){
  var pts=skyPtrList();
  if(pts.length<2)return 0;
  var dx=pts[1].x-pts[0].x,dy=pts[1].y-pts[0].y;
  return Math.sqrt(dx*dx+dy*dy)||1;
}
function beginSkyPan(e){
  // Pengecekan !touchMode || e.pointerType==='mouse' telah dihapus agar desktop bisa drag
  if(reduce||SW||drag.on)return false;
  if(document.body.classList.contains('owl-open')||document.body.classList.contains('owl-block'))return false;
  if(e.target.closest&&e.target.closest('#rigel-fx,#betel-fx,#terminal,#sirius-fx,#pleione-fx,.hit,.portal,#owl-source,#owl-panel,#owl-backdrop,#bh-clock,#bh,#cam-zoom,#music-toggle,#music-player,#title,#footer,#boot-screen,#signal-fragment,#cons-archive,#mode-cluster'))return false;
  if(asteroidScreenAt(e.clientX,e.clientY)>=0)return false;
  if(constellationTargetAt(e.clientX,e.clientY))return false;
  var bpSky=camBH();
  var dBH=Math.hypot(e.clientX-bpSky[0],e.clientY-bpSky[1]);
  if(BHSC>.05&&bhDragAllowed()&&dBH<=bhGrabRadius()*(skyZoom>1?Math.min(1.35,0.85+0.25*skyZoom):1))return false;
  skyPtrs[e.pointerId]={x:e.clientX,y:e.clientY};
  var n=Object.keys(skyPtrs).length;
  if(n>=2){
    /* 2-finger: rotate (+ pinch-zoom when Constellation Camera is on). */
    if(skyDrag.on){skyDrag.on=false;try{cv.releasePointerCapture(skyDrag.pid);}catch(err){}}
    var a=skyTwoAngle();
    if(a!=null){skyRotDrag.on=true;skyRotDrag.a0=a;skyRotDrag.r0=skyRot;}
    if(CAMERA_MODE&&OBSERVE_MODE){
      skyPinch.on=true;skyPinch.d0=skyTwoDist();skyPinch.z0=skyZoom;
    }
    try{cv.setPointerCapture(e.pointerId);}catch(err){}
    return true;
  }
  if(skyDrag.on)return false;
  skyDrag.on=true;skyDrag.moved=false;skyDrag.pid=e.pointerId;
  skyDrag.x0=e.clientX;skyDrag.y0=e.clientY;
  skyDrag.px=skyPan.x;skyDrag.py=skyPan.y;
  try{cv.setPointerCapture(e.pointerId);}catch(err){}
  return true;
}
function moveSkyPan(e){
  if(skyPtrs[e.pointerId]){skyPtrs[e.pointerId].x=e.clientX;skyPtrs[e.pointerId].y=e.clientY;}
  if(skyRotDrag.on&&Object.keys(skyPtrs).length>=2){
    var a=skyTwoAngle();
    if(a==null)return;
    var d=a-skyRotDrag.a0;
    /* unwrap delta into (-π, π] */
    while(d>Math.PI)d-=Math.PI*2;
    while(d<-Math.PI)d+=Math.PI*2;
    skyRot=Math.max(-Math.PI,Math.min(Math.PI,skyRotDrag.r0+d));
    /* Pinch zoom — Constellation Camera only (sky layer). */
    if(skyPinch.on&&CAMERA_MODE&&OBSERVE_MODE){
      var dist=skyTwoDist();
      if(skyPinch.d0>12&&dist>12){
        var ratio=dist/skyPinch.d0;
        setSkyZoom(skyPinch.z0*ratio,false);
      }
    }
    syncSkyPanHits();
    return;
  }
  if(!skyDrag.on||e.pointerId!==skyDrag.pid)return;
  var dx=e.clientX-skyDrag.x0,dy=e.clientY-skyDrag.y0;
  if(Math.hypot(dx,dy)>8)skyDrag.moved=true;
  if(!skyDrag.moved)return;
  var lim=skyPanLimits();
  skyPan.x=Math.max(-lim.x,Math.min(lim.x,skyDrag.px+dx));
  skyPan.y=Math.max(-lim.y,Math.min(lim.y,skyDrag.py+dy));
  syncSkyPanHits();
}
function endSkyPan(e){
  if(skyPtrs[e.pointerId])delete skyPtrs[e.pointerId];
  var n=Object.keys(skyPtrs).length;
  if(n<2){
    skyRotDrag.on=false;
    if(skyPinch.on){
      skyPinch.on=false;
      if(CAMERA_MODE)setSkyZoom(skyZoom,true);
    }
  }
  if(skyDrag.on&&e.pointerId===skyDrag.pid){
    var was=skyDrag.moved;skyDrag.on=false;
    try{cv.releasePointerCapture(e.pointerId);}catch(err){}
    if(was)haptic(6);
  }
  try{cv.releasePointerCapture(e.pointerId);}catch(err){}
  syncSkyPanHits();
}
document.addEventListener('pointerdown',function(e){
  if(drag.on)return;
  /* preventDefault only — never stopPropagation, so Konami swipe still sees the gesture. */
  if(beginSkyPan(e))e.preventDefault();
},{passive:false,capture:true});
document.addEventListener('pointermove',moveSkyPan,{passive:true});
document.addEventListener('pointerup',endSkyPan,{passive:true});
document.addEventListener('pointercancel',endSkyPan,{passive:true});

/* Constellation Camera: mouse wheel / trackpad zoom (sky layer only). */
document.addEventListener('wheel',function(e){
  if(!CAMERA_MODE||!OBSERVE_MODE||SW)return;
  if(e.target&&e.target.closest&&e.target.closest('#music-player,#boot-screen,#terminal,#signal-fragment'))return;
  e.preventDefault();
  stepSkyZoom(e.deltaY<0?1:-1);
},{passive:false});

var rgFx=$('#rigel-fx');
rgFx.addEventListener('mouseenter',function(){hot='rigel';});
rgFx.addEventListener('mouseleave',function(){if(hot==='rigel')hot=null;});
rgFx.addEventListener('click',function(){fxTap('rigel');});

var btFx=$('#betel-fx');
btFx.addEventListener('mouseenter',function(){hot='betel';});
btFx.addEventListener('mouseleave',function(){if(hot==='betel')hot=null;});
btFx.addEventListener('click',function(){fxTap('betel');});

var srFx=$('#sirius-fx');
srFx.addEventListener('mouseenter',function(){hot='sirius';});
srFx.addEventListener('mouseleave',function(){if(hot==='sirius')hot=null;});
srFx.addEventListener('click',function(){fxTap('sirius');});

var plFx=$('#pleione-fx');
if(plFx){
  plFx.addEventListener('mouseenter',function(){hot='pleione';});
  plFx.addEventListener('mouseleave',function(){if(hot==='pleione')hot=null;});
  plFx.addEventListener('click',function(){fxTap('pleione');});
}
var adFx=$('#aldebaran-fx');
if(adFx){
  adFx.addEventListener('mouseenter',function(){hot='aldebaran';});
  adFx.addEventListener('mouseleave',function(){if(hot==='aldebaran')hot=null;});
  adFx.addEventListener('click',function(){fxTap('aldebaran');});
}
var arcFx=$('#arcturus-fx');
if(arcFx){
  arcFx.addEventListener('mouseenter',function(){hot='arcturus';});
  arcFx.addEventListener('mouseleave',function(){if(hot==='arcturus')hot=null;});
  arcFx.addEventListener('click',function(){fxTap('arcturus');});
}
var antFx=$('#antares-fx');
if(antFx){
  antFx.addEventListener('mouseenter',function(){hot='antares';});
  antFx.addEventListener('mouseleave',function(){if(hot==='antares')hot=null;});
  antFx.addEventListener('click',function(){fxTap('antares');});
}

/* ---------- easter eggs ---------- */
/* ---------- Konami comet: satu komet pecah jadi dua (biru + merah), ekor panjang berhias aurora ----------
   Tidak ada render loop baru: komet = entri SS (comet:true), digambar oleh drawShooting.
   Ekor + aurora di-bake sekali ke canvas kecil. Aurora digambar sebagai irisan yang bergelombang. */
var KCOMET={on:false},COMET_SPR=null;
function bakeCometSprites(){
  var Wd=512,Hd=64,AH=96;
  function wedge(layers){
    var c=document.createElement('canvas');c.width=Wd;c.height=Hd;
    var x=c.getContext('2d'),cy=Hd/2;
    layers.forEach(function(L){
      var gr=x.createLinearGradient(0,0,Wd,0),hh=Hd*L[0]/2;
      gr.addColorStop(0,'rgba('+L[2]+',0)');
      gr.addColorStop(.55,'rgba('+L[2]+','+(L[1]*.4)+')');
      gr.addColorStop(1,'rgba('+L[2]+','+L[1]+')');
      x.fillStyle=gr;x.beginPath();x.moveTo(0,cy);
      x.quadraticCurveTo(Wd*.55,cy-hh*.9,Wd,cy-hh);x.lineTo(Wd,cy+hh);
      x.quadraticCurveTo(Wd*.55,cy+hh*.9,0,cy);x.closePath();x.fill();
    });
    return c;
  }
  function aurora(bands,seed){
    var c=document.createElement('canvas');c.width=Wd;c.height=AH;
    var x=c.getContext('2d'),r=seed,i;
    function rnd(){r=(r*1664525+1013904223)>>>0;return r/4294967296;}
    x.globalCompositeOperation='lighter';
    bands.forEach(function(B){
      var cy=AH*B[0],hh=AH*B[1]/2,gr=x.createLinearGradient(0,cy-hh,0,cy+hh);
      gr.addColorStop(0,'rgba('+B[2]+',0)');
      gr.addColorStop(.5,'rgba('+B[2]+','+B[3]+')');
      gr.addColorStop(1,'rgba('+B[2]+',0)');
      x.fillStyle=gr;x.fillRect(0,cy-hh,Wd,hh*2);
    });
    /* garis-garis sinar vertikal khas aurora: "melubangi" pita */
    x.globalCompositeOperation='destination-out';
    for(i=0;i<70;i++){x.fillStyle='rgba(0,0,0,'+(.08+rnd()*.38).toFixed(2)+')';x.fillRect(rnd()*Wd,0,1+rnd()*3,AH);}
    /* memudar ke ujung ekor */
    x.globalCompositeOperation='destination-in';
    var m=x.createLinearGradient(0,0,Wd,0);
    m.addColorStop(0,'rgba(0,0,0,0)');m.addColorStop(.35,'rgba(0,0,0,.35)');
    m.addColorStop(.8,'rgba(0,0,0,.85)');m.addColorStop(1,'rgba(0,0,0,1)');
    x.fillStyle=m;x.fillRect(0,0,Wd,AH);
    return c;
  }
  COMET_SPR={
    cyan:wedge([[1,.20,'110,229,255'],[.6,.38,'140,238,255'],[.28,.85,'235,252,255']]),
    red:wedge([[1,.20,'255,60,70'],[.6,.36,'255,120,100'],[.28,.85,'255,228,220']]),
    pink:wedge([[1,.17,'255,64,110'],[.6,.30,'255,110,150']]),
    aurB:aurora([[.32,.55,'80,200,255',.32],[.50,.45,'120,255,215',.28],[.68,.50,'150,130,255',.28]],11),
    aurR:aurora([[.32,.55,'255,90,110',.32],[.50,.45,'255,160,90',.28],[.68,.50,'255,70,190',.28]],23)
  };
}
/* Komet pecah jadi DUA: induk jadi yang biru (lurus), serpihan jadi yang merah (menyimpang). */
function cometSplit(s,now,x,y){
  s.split=true;s.splitT=now;s.sx=x;s.sy=y;s.pal='blue';
  var base=Math.atan2(s.vy,s.vx),sp0=Math.hypot(s.vx,s.vy),rem=Math.max(900,s.life-(now-s.t)),a=base+.2,sp=sp0*.9;
  SS.push({x:x,y:y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,t:now,life:rem*1.08,
    comet:true,frag:true,pal:'red',grow:900,hr:s.hr*.92,L:s.L*.92,bend:-.1,seed:s.seed+.37});
  glitchUntil=now+520;
  haptic(16);
  try{
    var fl=document.getElementById('sn-flash');
    if(fl){
      fl.style.setProperty('--sx',Math.round(x)+'px');fl.style.setProperty('--sy',Math.round(y)+'px');
      fl.style.setProperty('--sn-rgb','255,80,120');
      fl.classList.remove('on');void fl.offsetWidth;fl.classList.add('on');
    }
  }catch(e){}
}
/* Pita aurora: 14 irisan sprite, tiap irisan bergeser naik-turun mengikuti gelombang. */
function drawAurora(spr,L,hr,x,y,ang,a,now,seed){
  var NS=14,sw=512/NS,dw=L/NS,dh=hr*9,j,p;
  g.save();g.translate(x,y);g.rotate(ang);
  for(j=0;j<NS;j++){
    p=j/NS;
    g.globalAlpha=a*(.78+.22*Math.sin(now*.0031+j*.8+seed*7));
    g.drawImage(spr,j*sw,0,sw+1,96,-L+j*dw,-dh/2+Math.sin(now*.0019+p*6+seed*6)*hr*1.7*(1-p*.55),dw+1,dh);
  }
  g.restore();
}
function drawComet(s,now,u,x,y){
  if(!COMET_SPR)bakeCometSprites();
  var a=Math.min(1,u/.07)*Math.min(1,(1-u)/.22);
  if(a<=.01)return;
  /* glitch begitu komet masuk layar */
  if(!s.frag&&!s.entered&&x>0){s.entered=true;glitchUntil=now+550;haptic(10);}
  if(now<glitchUntil){x+=(Math.random()-.5)*5;y+=(Math.random()-.5)*3;}
  var pal=s.pal,red=pal==='red',mix=pal==='mix',hr=s.hr,k;
  var L=s.L*(s.grow?(.3+.7*Math.min(1,(now-s.t)/s.grow)):1);
  var ang=Math.atan2(s.vy,s.vx);
  g.save();g.globalCompositeOperation='lighter';
  /* aurora (di bawah ekor ion). Sebelum pecah: biru + merah menyatu, setelah pecah: masing-masing. */
  if(mix||!red)drawAurora(COMET_SPR.aurB,L,hr,x,y,ang+(mix?.04:.02),a*(mix?.85:1),now,s.seed);
  if(mix||red)drawAurora(COMET_SPR.aurR,L,hr,x,y,ang-(mix?.05:.0),a*(mix?.6:1),now,s.seed+1);
  /* ekor debu pink hanya sebelum pecah */
  if(mix){
    g.save();g.translate(x,y);g.rotate(ang+s.bend+.02*Math.sin(now*.002+s.seed*6));
    g.globalAlpha=a*.8;g.drawImage(COMET_SPR.pink,-L*1.05,-hr*3.2,L*1.05,hr*6.4);
    g.restore();
  }
  /* ekor ion: cyan atau merah, lurus dan terang */
  g.save();g.translate(x,y);g.rotate(ang);
  g.globalAlpha=a;g.drawImage(red?COMET_SPR.red:COMET_SPR.cyan,-L,-hr*1.5,L,hr*3);
  g.restore();
  /* percikan di sepanjang ekor */
  var ux=-Math.cos(ang),uy=-Math.sin(ang),nx=-uy,ny=ux,N=9,c1=red?'255,120,110':'160,240,255',c2=red?'255,190,120':'255,120,170';
  for(k=0;k<N;k++){
    var p=((k/N)+(now*.00045+s.seed))%1,d=p*L*.95,lat=Math.sin(p*17+k*2.3+s.seed*9)*hr*(.6+p*2.2);
    g.fillStyle='rgba('+(k&1?c2:c1)+','+(a*(1-p)*.75).toFixed(3)+')';
    g.beginPath();g.arc(x+ux*d+nx*lat,y+uy*d+ny*lat,Math.max(.5,hr*.22*(1-p*.6)),0,6.283);g.fill();
  }
  /* kepala */
  var pulse=.88+.12*Math.sin(now*.011+s.seed*9);
  drawStarGlow(x,y,hr*1.9,red?'255,60,60':'255,70,120',a*.5*pulse);
  drawStarGlow(x,y,hr*1.3,red?'255,170,150':'150,240,255',a*.95);
  g.fillStyle='rgba('+(red?'255,238,232':'255,255,255')+','+(.95*a)+')';
  g.beginPath();g.arc(x,y,Math.max(1,hr*.7),0,6.283);g.fill();
  g.strokeStyle='rgba('+(red?'255,215,205':'225,250,255')+','+(.55*a)+')';g.lineWidth=.9;
  g.beginPath();g.moveTo(x-hr*3.6,y);g.lineTo(x+hr*3.6,y);g.moveTo(x,y-hr*3.6);g.lineTo(x,y+hr*3.6);g.stroke();
  /* cincin kejut saat pecah */
  if(s.split){
    var q=(now-s.splitT)/650;
    if(q>=0&&q<1){
      g.lineWidth=1.5;
      g.strokeStyle='rgba(255,90,140,'+(.8*(1-q)).toFixed(3)+')';
      g.beginPath();g.arc(s.sx,s.sy,hr*(3+24*q),0,6.283);g.stroke();
      g.strokeStyle='rgba(120,235,255,'+(.7*(1-q)).toFixed(3)+')';
      g.beginPath();g.arc(s.sx,s.sy,hr*(2+15*q),0,6.283);g.stroke();
    }
  }
  g.restore();
}
/* Satu komet besar muncul setelah hujan meteor mereda, melintas di area bebas di bawah header
   (posisi dihitung dari ukuran layar & tinggi header: portrait, landscape, desktop). */
function konamiComet(){
  if(reduce||IS_POTATO||SW||KCOMET.on)return;
  KCOMET.on=true;
  var DELAY=2600,DUR=5200;
  setTimeout(function(){
    if(SW||pageHidden){KCOMET.on=false;return;}
    var hbEl=document.getElementById('header'),hb=hbEl?vrect(hbEl).bottom:0;
    var top=Math.max(hb+14,H*.12),bot=H-Math.min(H*.2,90),avail=Math.max(120,bot-top);
    var x0=-W*.12,y0=top+avail*.08,x1=W*1.12,y1=top+avail*.58,sec=DUR/1000;
    SS.push({x:x0,y:y0,vx:(x1-x0)/sec,vy:(y1-y0)/sec,t:performance.now(),life:DUR,
      comet:true,pal:'mix',splitU:.38,hr:Math.max(3.4,Math.min(7,Math.min(W,H)*.013)),
      L:Math.max(300,Math.min(760,Math.hypot(W,H)*.5)),bend:.12,seed:Math.random()});
  },DELAY);
  setTimeout(function(){KCOMET.on=false;},DELAY+DUR+400);
}
/* Konami: meteor shower reusing the SS shooting-star pool (drawShooting renders it). */
function konamiMeteors(){
  if(reduce||IS_POTATO||SW)return;
  markActivity(); /* keyboard input doesn't count as activity; drawShooting bails out in idleMode */
  for(var i=0;i<18;i++){
    (function(i){
      setTimeout(function(){
        if(SW)return;
        var now=performance.now(),
            ang=(.16+Math.random()*.16)*Math.PI,
            sp=700+Math.random()*500;
        SS.push({
          x:Math.random()*W*1.1-W*.1,y:-20+Math.random()*H*.25,
          vx:Math.cos(ang)*sp,vy:Math.sin(ang)*sp,
          t:now,life:900+Math.random()*500,
          tl:.12,lw:2,c0:'255,122,217',c1:'34,230,255'
        });
      },i*110+Math.random()*90);
    })(i);
  }
}
function triggerKonami(){
  document.body.classList.add('konami');
  haptic(18);
  showSecret('SYSTEM OVERRIDE · DUMUL//OBSERVATORY',1800);
  konamiMeteors();
  konamiComet();
  /* Cheat: buka semua gembok. markObserved sengaja TIDAK disentuh, biar Constellation Log tetap jujur. */
  unlockAll();
  showModeToast('ALL SIGNALS UNLOCKED',null,2400);
  clearTimeout(triggerKonami._t);
  triggerKonami._t=setTimeout(function(){document.body.classList.remove('konami');},(reduce||IS_POTATO||SW)?2100:5200);
}

/* Hidden Konami input.
   Desktop: real arrow-key events.
   Touch/pointer: one swipe = one direction. On browsers that expose both
   Pointer Events and Touch Events, use Pointer Events only so a single swipe
   cannot be counted twice. */
function pushKonamiDir(dir){
  if(konami.indexOf(dir)<0)return;
  konamiSeq.push(dir);
  if(konamiSeq.length>konami.length)konamiSeq.shift();
  if(konamiSeq.join('|')===konami.join('|')){
    konamiSeq=[];
    triggerKonami();
  }
}

window.addEventListener('keydown',function(e){
  if(e.defaultPrevented||e.repeat)return;
  var k=e.key;
  if(k==='Up')k='ArrowUp';
  else if(k==='Down')k='ArrowDown';
  else if(k==='Left')k='ArrowLeft';
  else if(k==='Right')k='ArrowRight';
  if(konami.indexOf(k)<0)return;
  e.preventDefault();
  e.stopPropagation();
  pushKonamiDir(k);
},true);

var konamiSwipeStart=null;
function konamiBlockedTarget(target){
  return !!(target&&target.closest&&target.closest(
    '#rigel-fx,#betel-fx,#sirius-fx,#pleione-fx,.hit,.portal,#owl-source,#owl-panel,#owl-backdrop,#bh-clock,#bh,#cam-zoom,#music-toggle,#music-player,#boot-screen,#signal-fragment,#cons-archive,#mode-cluster'
  ));
}
function konamiSwipeDirection(dx,dy){
  var adx=Math.abs(dx),ady=Math.abs(dy),travel=Math.max(adx,ady);
  /* 24px keeps the Easter egg usable on a phone without making tiny taps count. */
  if(travel<24)return null;
  /* Require a clearly dominant axis, but allow natural diagonal hand movement. */
  if(Math.min(adx,ady)>travel*.72)return null;
  return adx>ady
    ?(dx>0?'ArrowRight':'ArrowLeft')
    :(dy>0?'ArrowDown':'ArrowUp');
}

/* Pointer Events path. This is the primary mobile path on modern Android/iOS. */
if(window.PointerEvent){
  document.addEventListener('pointerdown',function(e){
    if(e.pointerType==='mouse')return;
    if(drag.on||konamiBlockedTarget(e.target))return;
    konamiSwipeStart={x:e.clientX,y:e.clientY,id:e.pointerId};
  },{passive:true});
  document.addEventListener('pointerup',function(e){
    if(e.pointerType==='mouse')return;
    if(!konamiSwipeStart||e.pointerId!==konamiSwipeStart.id)return;
    var dx=e.clientX-konamiSwipeStart.x,dy=e.clientY-konamiSwipeStart.y;
    konamiSwipeStart=null;
    var dir=konamiSwipeDirection(dx,dy);
    if(dir)pushKonamiDir(dir);
  },{passive:true});
  document.addEventListener('pointercancel',function(e){
    if(konamiSwipeStart&&e.pointerId===konamiSwipeStart.id)konamiSwipeStart=null;
  },{passive:true});
}else{
  /* Legacy touch fallback only when Pointer Events do not exist. */
  document.addEventListener('touchstart',function(e){
    if(e.touches.length!==1||konamiBlockedTarget(e.target))return;
    var t=e.touches[0];
    konamiSwipeStart={x:t.clientX,y:t.clientY,id:'touch'};
  },{passive:true});
  document.addEventListener('touchend',function(e){
    if(!konamiSwipeStart||!e.changedTouches.length)return;
    var t=e.changedTouches[0],dx=t.clientX-konamiSwipeStart.x,dy=t.clientY-konamiSwipeStart.y;
    konamiSwipeStart=null;
    var dir=konamiSwipeDirection(dx,dy);
    if(dir)pushKonamiDir(dir);
  },{passive:true});
}


/* ---------- TERMINAL SESSION (klik jam 5x) ----------
   Session counter lokal (localStorage dumul_term_v1), pool log berkategori + anti-repeat,
   corruption meter (makin sering dibuka makin aneh), varian konteks (Observe Mode / rasi aktif).
   Semua lokal, tanpa tracking server. */
var TERM_KEY='dumul_term_v1',TERM_ST=null,TERM_RUN=false,TERM_OBS_AT=0,TERM_FOCUS=null,TERM_T=[];
var TERM_DIST={orion:1344,virgo:250,canis:9,pleiades:444,taurus:65,bootes:37,scorpius:550};
var TERM_POOL=[
 ['SYSTEM','waking dormant process...'],['SYSTEM','render loop attached'],['SYSTEM','clock source: UTC'],
 ['SYSTEM','checksum ....... unverified'],['SYSTEM','heartbeat irregular'],['SYSTEM','sky_cache rebuilt'],
 ['SYSTEM','buffer drained, nothing lost'],['SYSTEM','no operator on record'],
 ['OBSERVER','presence detected'],['OBSERVER','gaze vector: undefined'],['OBSERVER','observer count: 1 (assumed)'],
 ['OBSERVER','input device: finger'],['OBSERVER','you are reading this'],['OBSERVER','attention: unmeasured'],
 ['OBSERVER','observer is also being logged'],['OBSERVER','blink rate: unknown'],
 ['MEMORY','fragment found'],['MEMORY','fragment unreadable'],['MEMORY','index rebuilt, 1 entry missing'],
 ['MEMORY','recalled: someone, not here'],['MEMORY','read error at sector 0x4C'],['MEMORY','cache is older than system'],
 ['MEMORY','overwritten by itself'],['MEMORY','restoring... restoring...'],
 ['CAUSALITY','waiting...'],['CAUSALITY','effect precedes cause (minor)'],['CAUSALITY','event order: disputed'],
 ['CAUSALITY','causal map ...... PARTIAL'],['CAUSALITY','which came first: the click?'],
 ['CAUSALITY','no cause found for this log'],['CAUSALITY','timeline branch merged silently'],['CAUSALITY','reason pending'],
 ['ANOMALY','telemetry stable, source unknown'],['ANOMALY','star count off by one'],['ANOMALY','light arrived before it left'],
 ['ANOMALY','signal older than the sender'],['ANOMALY','ghost frame detected'],['ANOMALY','something moved. it was you.'],
 ['ANOMALY','noise floor is listening'],['ANOMALY','subject/object ... NOT FOUND'],
 ['OWL','owl.sys ........ ACTIVE'],['OWL','unregistered process: owl'],['OWL','perched, not parsed'],['OWL','owl.sys has never crashed'],
 ['DUMUL','dumul.core ..... RESIDENT'],['DUMUL','playback head: elsewhere'],['DUMUL','with you / without you: both true'],
 ['DUMUL','signal gap: one voice missing'],['DUMUL','glitch is not a bug. glitch is a track.'],['DUMUL','limerence index: stable']
];
var TERM_W={SYSTEM:3,OBSERVER:3,MEMORY:2,CAUSALITY:2,ANOMALY:1,OWL:.6,DUMUL:1};
function termNoteObserve(on){
  TERM_OBS_AT=performance.now();
  /* Camera focus cuma hidup di dalam Observe Mode (jam & terminal tersembunyi di sana),
     jadi fokus terakhir direkam saat keluar dan berlaku sebagai jejak ~90 detik. */
  if(on){TERM_FOCUS=null;return;}
  TERM_FOCUS=null;
  try{
    if(typeof CAMERA_MODE!=='undefined'&&CAMERA_MODE&&typeof FOCUS!=='undefined'&&FOCUS.list){
      var f=FOCUS.list[FOCUS.i];
      if(f&&f.id!=='free')TERM_FOCUS={id:f.id,at:performance.now()};
    }
  }catch(e){}
}
function termLoad(){
  if(TERM_ST)return TERM_ST;
  var o=null;try{o=JSON.parse(localStorage.getItem(TERM_KEY)||'null');}catch(e){}
  if(!o||typeof o!=='object')o={};
  TERM_ST={n:(o.n|0)||0,last:+o.last||0,recent:Array.isArray(o.recent)?o.recent.slice(-60):[]};
  return TERM_ST;
}
function termSave(){try{localStorage.setItem(TERM_KEY,JSON.stringify(TERM_ST));}catch(e){}}
function termPad(n,l){n=String(n);while(n.length<l)n='0'+n;return n;}
function termCorrupt(s,c){
  if(Math.random()>c*.45)return s;
  var a=s.split(''),k=2+((Math.random()*4)|0),i,p;
  for(i=0;i<k;i++){p=(Math.random()*a.length)|0;if(a[p]!==' ')a[p]='\u2588';}
  return a.join('');
}
function termPick(k,st,c){
  var cap=Math.max(12,(TERM_POOL.length*.35)|0),rec=st.recent,i,cand=[],out=[],cnt={},tot,r,j,e;
  for(i=0;i<TERM_POOL.length;i++){
    if(rec.indexOf(i)>=0)continue;
    var w=TERM_W[TERM_POOL[i][0]]||1;
    if(TERM_POOL[i][0]==='MEMORY'||TERM_POOL[i][0]==='ANOMALY')w+=c*3;
    cand.push({i:i,w:w});
  }
  while(out.length<k&&cand.length){
    tot=0;for(j=0;j<cand.length;j++)tot+=cand[j].w;
    r=Math.random()*tot;
    for(j=0;j<cand.length;j++){r-=cand[j].w;if(r<=0)break;}
    if(j>=cand.length)j=cand.length-1;
    e=cand.splice(j,1)[0];
    var cat=TERM_POOL[e.i][0];
    if((cnt[cat]|0)>=2)continue;
    cnt[cat]=(cnt[cat]|0)+1;out.push(e.i);
  }
  for(i=0;i<out.length;i++)rec.push(out[i]);
  while(rec.length>cap)rec.shift();
  return out;
}
function termHeader(n,last){
  var h=[],s='SESSION #'+termPad(n,3),lt=last?new Date(last).toISOString().substr(11,8)+' UTC':'UNKNOWN';
  if(n>=30&&(n===30||Math.random()<.25))return ['> SESSION #???','> DATE: UNKNOWN','> TIME: UNKNOWN','> ...','> THIS IS NOT YOUR FIRST SESSION.'];
  if(n===20)return ['> OBSERVER RETURNING','> ...','> ...','> WE WERE NOT EXPECTING YOU THIS EARLY.'];
  if(n===1)return ['> ACCESSING SYSTEM...','> SESSION INITIALIZED','> FIRST CONTACT','> OBSERVER NOT RECOGNIZED','> LOGGING...'];
  if(n<5)return ['> ACCESSING SYSTEM...','> ACCESS GRANTED','> PREVIOUS SESSION FOUND',s,'LAST OBSERVATION: '+lt,'OBSERVER: RETURNING'];
  h=['> OBSERVER RETURNING','> MEMORY FRAGMENT FOUND',s];
  if(n>=12)h.push('> MEMORY FRAGMENT: "you were here"');
  return h;
}
function termFmtLY(d){return String(d).replace(/\B(?=(\d{3})+(?!\d))/g,',');}
function termContext(){
  var now=performance.now();
  /* '!' di depan = baris peringatan (merah muda) */
  if(typeof CLKD!=='undefined'&&CLKD&&(CLKD.k>.2||(CLKD.touchAt&&Date.now()-CLKD.touchAt<90000)))
    return ['!> CAUTION','!> TEMPORAL REFERENCE UNSTABLE','> ...',
      '!> LOCAL TIME .......... [ERROR]','!> EXTERNAL TIME ........ [ERROR]','!> OBSERVER TIME ......... [UNKNOWN]'];
  if(TERM_FOCUS&&now-TERM_FOCUS.at<90000){
    var fid=TERM_FOCUS.id;
    if(fid==='bh')return [
      '!> CAUTION','!> TEMPORAL REFERENCE UNSTABLE','> ...',
      '!> LOCAL TIME .......... [ERROR]','!> EXTERNAL TIME ........ [ERROR]','!> OBSERVER TIME ......... [UNKNOWN]'
    ];
    return termTarget(fid);
  }
  if(OBSERVE_MODE||(TERM_OBS_AT&&now-TERM_OBS_AT<90000))
    return ['!> OBSERVATION MODE: RESIDUAL TRACE','> ...','!> YOU SHOULD NOT HAVE ACCESS TO THIS.'];
  if(typeof ALIGN!=='undefined'&&ALIGN.cid)return termTarget(ALIGN.cid);
  return null;
}
function termTarget(id){
  var nm=(typeof CONS_LABELS!=='undefined'&&CONS_LABELS[id]||id).toUpperCase(),d=TERM_DIST[id],o=['> TARGET: '+nm];
  if(d){var ds=termFmtLY(d);o.push('> DISTANCE: ~'+ds+' LY','> SIGNAL AGE: ~'+ds+' YEARS');}
  o.push('> OBSERVER: PRESENT','> TARGET: ABSENT');
  return o;
}
var TERM_AT=0,TERM_TAIL=0,TERM_BODY=null,TERM_CUR=null,TERM_END=0,TERM_ASK=null,TERM_NOIN=0,TERM_TAPS=0,TERM_EXC=false,TERM_NOCLOSE=false;
var TERM_PROMPTS=[
 {q:'> WHY ARE YOU HERE?',a:['> INPUT RECEIVED','> "?"','> ACCEPTABLE.','> MOST OBSERVERS BEGIN WITH A QUESTION.']},
 {q:'> ARE YOU STILL THERE?',a:['> INPUT RECEIVED','> "."','> YES. THAT IS ENOUGH.']},
 {q:'> WHAT DO YOU SEE?',a:['> INPUT RECEIVED','> "..."','> INTERESTING.','> I SEE THE SAME.']}
];
function termEmit(text,d,cls,hold){
  if(!TERM_RUN||!TERM_BODY)return;
  var now=performance.now()-TERM_AT;
  TERM_TAIL=Math.max(TERM_TAIL,now)+d;
  var wait=TERM_TAIL-now,body=TERM_BODY,cur=TERM_CUR;
  TERM_T.push(setTimeout(function(){
    if(!TERM_RUN)return;
    var el=document.createElement('div');el.textContent=text;if(cls)el.className=cls;
    body.insertBefore(el,cur);
    while(body.children.length>14)body.removeChild(body.firstChild);
  },wait));
  clearTimeout(TERM_END);
  TERM_END=setTimeout(termClose,wait+(hold||2800));
}
function termClose(){
  var term=$('#terminal');
  term.classList.remove('on');term.setAttribute('aria-hidden','true');
  TERM_RUN=false;TERM_ASK=null;clearTimeout(TERM_NOIN);
  TERM_T.forEach(clearTimeout);TERM_T=[];
}
function termTail(){termEmit('> PROCESS COMPLETE',420);termEmit('> RETURNING TO IDLE...',380);}
function termOwl(n){
  if(Math.random()<.5){
    termEmit('> SYSTEM PROCESS ........ ACTIVE',1900);termEmit('> OBSERVER .............. ACTIVE',500);termEmit('> OWL ................... ACTIVE',700,'term-owl',3400);
    return;
  }
  termEmit('> ...',1700);termEmit('> ...',650);termEmit('> owl.sys has entered the session.',700,'term-owl');
  termEmit('OWL :: why are you reading system logs',900,'term-owl');
  termEmit('SYSTEM :: unauthorized process',800);
  termEmit('OWL :: i live here',800,'term-owl');
  termEmit('SYSTEM :: ...',900);
  termEmit('OWL :: skill issue',700,'term-owl',3600);
}
function termTap(){
  if(!TERM_RUN)return;
  haptic(8);TERM_TAPS++;
  if(TERM_ASK){
    var p=TERM_ASK;TERM_ASK=null;clearTimeout(TERM_NOIN);
    p.a.forEach(function(t,i){termEmit(t,i?520:260);});
    termTail();return;
  }
  if(TERM_NOCLOSE)return;
  if(TERM_TAPS===1){termEmit('> INPUT RECEIVED',220);return;}
  if(TERM_TAPS>=6&&!TERM_EXC){
    TERM_EXC=true;
    termEmit('> INPUT RATE: EXCESSIVE',240,'term-warn');termEmit('> ...',650);termEmit('> YOU REALLY LIKE CLICKING THINGS.',420);
  }
}
function termOpen(){
  if(TERM_RUN)return;
  var term=$('#terminal'),body=term&&term.querySelector('.term-body');if(!term||!body)return;
  TERM_RUN=true;TERM_BODY=body;TERM_TAPS=0;TERM_EXC=false;TERM_ASK=null;TERM_NOCLOSE=false;
  var st=termLoad();st.n++;var prevLast=st.last;st.last=Date.now();
  var n=st.n,c=Math.min(1,(n-1)/30),ctx=termContext();
  var mile=(n===7)||(n>7&&n<30&&n!==20&&Math.random()<.06);
  var k=mile?1:4+(Math.random()<.5?1:0)+(c>.5?1:0)+(Math.random()<c?1:0)-(ctx?(ctx.length>4?3:2):0);
  var picks=termPick(Math.max(mile?1:2,k),st,c);
  termSave();
  body.textContent='';
  var cur=document.createElement('div');cur.innerHTML='&gt; <span class="cursor"></span>';body.appendChild(cur);TERM_CUR=cur;
  term.classList.add('on');term.setAttribute('aria-hidden','false');
  TERM_T.forEach(clearTimeout);TERM_T=[];clearTimeout(TERM_END);
  TERM_AT=performance.now();TERM_TAIL=0;
  var i,hd=mile?['> OBSERVER RETURNING','SESSION #'+termPad(n,3)]:termHeader(n,prevLast),base=Date.now()%60000;
  for(i=0;i<hd.length;i++)termEmit(hd[i],hd[i]==='> ...'?650:260);
  if(mile){
    var W='term-warn';
    termEmit('> SYSTEM STATUS: NOMINAL',420);termEmit('> ...',700);termEmit('> ...',700);
    termEmit('> SYSTEM STATUS: OBSERVED',520,W);termEmit('> correcting...',620);
    termEmit('> SYSTEM STATUS: OBSERVED',520,W);termEmit('> correcting...',620);
    termEmit('> SYSTEM STATUS: OBSERVED',520,W);
    termEmit('> ERROR: OBSERVER CANNOT BE EXCLUDED',950,W,3800);
    TERM_NOCLOSE=true;
    return;
  }
  if(ctx)for(i=0;i<ctx.length;i++){
    var cl=ctx[i],wr=cl.charAt(0)==='!';if(wr)cl=cl.slice(1);
    termEmit(cl,cl==='> ...'?650:300,wr?'term-warn':'');
  }
  for(i=0;i<picks.length;i++){
    var p=TERM_POOL[picks[i]];base+=100+((Math.random()*800)|0);
    var ts=termPad(((base/1000)|0)%60,2)+'.'+termPad(base%1000,3);
    termEmit('['+ts+'] '+p[0]+' :: '+termCorrupt(p[1],c),340+((Math.random()*300)|0),p[0]==='ANOMALY'?'term-warn':(p[0]==='OWL'?'term-owl':''));
  }
  if(n>=2&&Math.random()<.3){
    var q=TERM_PROMPTS[(Math.random()*TERM_PROMPTS.length)|0];
    termEmit(q.q,520,'',7000);
    var wait=TERM_TAIL-(performance.now()-TERM_AT);
    TERM_ASK=q;
    TERM_NOIN=setTimeout(function(){
      if(!TERM_ASK||!TERM_RUN)return;
      TERM_ASK=null;termEmit('> NO INPUT. ALSO A RESPONSE.',300);termTail();
    },wait+4500);
    return;
  }
  termTail();
  if(n>=3&&Math.random()<.1)termOwl(n);
}
(function(){
  var t=$('#terminal');if(!t)return;
  t.addEventListener('pointerdown',function(e){e.stopPropagation();termTap();},{passive:true});
})();

/* ---------- TELESCOPE GREETING (pop-out otomatis saat buka / revisit) ----------
   Bubble terpisah (#tele-greet) dengan pool sendiri: TIDAK ikut TELE_SCOPE_MESSAGES, jadi tidak
   ketuker / numpuk sama pesan random saat teleskop diklik (klik teleskop langsung menutup greeting).
   Isi: jeda sejak kunjungan terakhir + jam malam. State lokal: localStorage dumul_tg_v1. */
var TG_KEY='dumul_tg_v1',TG={el:null,on:false,st:null,poll:0,hiddenAt:0,busy:false};
var TG_POOL={
 quick:["That was quick.","You left. You came back. I noticed.","Reloading won't change the sky.","Back so soon?"],
 hours:["Back again today.","Same day. Different stars.","The sky moved a little while you were gone.","You didn't stay away long."],
 day:["A night has passed.","One day. I kept watching.","You were gone a day. The stars weren't.","Welcome back. It's been a day."],
 days:["{d} days. I counted.","{d} days of quiet. Then you.","{d} days. The lens stayed clean.","{d} days away. The sky didn't mind."],
 weeks:["{w} weeks. The stars didn't wait.","{w} weeks. I almost stopped looking.","{w} weeks away. The light kept travelling."],
 months:["{m} months. Hello again.","{m} months. I still remember where you stood.","It has been a long time. The light you saw then has moved on."],
 night:["Why are you awake?","It's late. The sky doesn't mind.","The observatory is quieter at this hour.","Everyone else is asleep. The sky isn't.","Go to sleep. The stars will still be here.","The best stars come out when no one's looking."]
};
function tgLoad(){
  if(TG.st)return TG.st;
  var o=null;try{o=JSON.parse(localStorage.getItem(TG_KEY)||'null');}catch(e){}
  if(!o||typeof o!=='object')o={};
  TG.st={last:+o.last||0,nightAt:+o.nightAt||0,quickAt:+o.quickAt||0,recent:Array.isArray(o.recent)?o.recent.slice(-8):[]};
  return TG.st;
}
function tgSave(){try{localStorage.setItem(TG_KEY,JSON.stringify(TG.st));}catch(e){}}
function tgChoose(gap,fresh,hour,nowMs){
  var st=tgLoad(),cat=null,d=Math.floor(gap/864e5),night=hour<5&&nowMs-st.nightAt>6*36e5;
  if(gap>0){
    if(fresh&&gap<90e3){if(nowMs-st.quickAt>3e5)cat='quick';}
    else if(gap>=6*36e5&&gap<864e5)cat='hours';
    else if(d>=1&&d<3)cat='day';
    else if(d>=3&&d<14)cat='days';
    else if(d>=14&&d<60)cat='weeks';
    else if(d>=60)cat='months';
  }
  if(night&&(!cat||Math.random()<.5))cat='night';
  if(!cat)return null;
  if(cat==='night')st.nightAt=nowMs;
  if(cat==='quick')st.quickAt=nowMs;
  var pool=TG_POOL[cat],i,cand=[];
  for(i=0;i<pool.length;i++)if(st.recent.indexOf(cat+i)<0)cand.push(i);
  if(!cand.length)for(i=0;i<pool.length;i++)cand.push(i);
  i=cand[(Math.random()*cand.length)|0];
  st.recent.push(cat+i);while(st.recent.length>8)st.recent.shift();
  return pool[i].replace('{d}',d).replace('{w}',Math.floor(d/7)).replace('{m}',Math.floor(d/30));
}
function placeTeleGreet(){
  var el=TG&&TG.el,p=TG&&TG.anchor?TG.anchor:telescopeScreenPos();
  if(!el||!p)return;
  var gap=TG&&TG.anchor?0:(touchMode?10:12),pad=10,maxW=Math.min(220,(W||innerWidth||360)*.72);
  var x=Math.max(pad+maxW*.5,Math.min((W||innerWidth)-pad-maxW*.5,p[0])),y=p[1]-gap;
  y=Math.max(pad+36,Math.min((H||innerHeight)-pad,y));
  el.style.left=Math.round(x)+'px';el.style.top=Math.round(y)+'px';
}
function teleGreetFollow(){if(TG&&TG.on)placeTeleGreet();}
function teleGreetHide(){
  var el=TG&&TG.el;if(!el||!TG.on)return;
  clearTimeout(el._t);clearTimeout(el._type);TG.on=false;TG.anchor=null;el.classList.remove('on');
}
function tgShow(msg){
  var el=TG.el;if(!el)return;
  clearTimeout(el._t);clearTimeout(el._type);
  var short=msg.length<=24,txt=short?msg:teleWrapLines(msg,touchMode?24:28);
  el.classList.toggle('tele-short',short);
  el.textContent='';TG.on=true;placeTeleGreet();el.classList.add('on');
  var hold=Math.min(7000,Math.max(3200,2200+msg.length*42));
  teleTypeText(el,txt,function(){el._t=setTimeout(teleGreetHide,hold);},short?52:30);
}
function tgTrigger(gap,fresh){
  if(TG.busy||!TG.el)return;
  var now=Date.now(),msg=tgChoose(Math.max(0,gap),fresh,new Date().getHours(),now);
  tgSave();
  if(!msg)return;
  TG.busy=true;
  var t0=now,ready=0;
  TG.poll=setInterval(function(){
    if(Date.now()-t0>45000){clearInterval(TG.poll);TG.busy=false;return;}
    var m=$('#secret-msg');
    var ok=bootDone&&!document.hidden&&(TELESCOPE.sx||TELESCOPE.sy)&&!SW&&!document.body.classList.contains('tesseract-running')&&!(m&&m.classList.contains('on'));
    if(!ok){ready=0;return;}
    if(!ready){ready=Date.now();return;}
    if(Date.now()-ready<1400)return;   /* teleskop sudah stabil di layar dulu, baru pop */
    clearInterval(TG.poll);TG.busy=false;tgShow(msg);
  },500);
}
(function(){
  TG.el=$('#tele-greet');if(!TG.el)return;
  var st=tgLoad(),now=Date.now(),gap=st.last?now-st.last:0;
  st.last=now;
  tgTrigger(gap,true);
  document.addEventListener('visibilitychange',function(){
    var s=tgLoad();
    if(document.hidden){TG.hiddenAt=Date.now();s.last=TG.hiddenAt;tgSave();return;}
    if(!TG.hiddenAt)return;
    var g=Date.now()-TG.hiddenAt;TG.hiddenAt=0;s.last=Date.now();
    if(g>=6*36e5)tgTrigger(g,false);else tgSave();
  });
  window.addEventListener('pagehide',function(){var s=tgLoad();s.last=Date.now();tgSave();});
})();


/* ---------- CLOCK TIME DILATION (Gargantua di-drag ke dekat jam) ----------
   Makin dekat Gargantua ke #bh-clock, makin parah jam kena dilatasi: digit ter-scramble, kadang
   ERR / RATE x0.xx, warna bergeser, dan jam berjalan lebih lambat (lag menumpuk).
   Saat Gargantua balik ke home, level turun linear ~6.5 dtk dan jam "mengejar" waktu asli (decode pelan).
   Nonaktif di reduced-motion, swallow, observe-mode, tesseract. Tanpa tracking, semua lokal. */
var CLKD={k:0,lag:0,last:0,active:false,box:null,boxAt:0,rinf:0,txtAt:0,touchAt:0,kcss:-1};
var CLK_GL='01#?%/|_-<>\u2588\u2592';
function clkDist(b,px,py){
  var cx=Math.max(b.left,Math.min(px,b.right)),cy=Math.max(b.top,Math.min(py,b.bottom));
  return Math.hypot(px-cx,py-cy);
}
function clkScr(str,p){
  if(p<=0)return str;
  var o='',i,ch;
  for(i=0;i<str.length;i++){
    ch=str.charAt(i);
    o+=(/[0-9A-Z]/.test(ch)&&Math.random()<p)?CLK_GL.charAt((Math.random()*CLK_GL.length)|0):ch;
  }
  return o;
}
function clkReset(el){
  var C=CLKD;
  C.active=false;C.k=0;C.lag=0;C.kcss=-1;
  if(el){
    el.classList.remove('clk-warp');el.style.removeProperty('--kw');el.style.opacity='';
  }
  tickClock(true);
}
function updateClockDilation(now){
  var C=CLKD;if(!C)return;
  var el=$('#bh-clock');if(!el)return;
  var dt=Math.min(100,Math.max(0,now-(C.last||now)));C.last=now;
  var b=document.body.classList;
  if(reduce||SW||b.contains('observe-mode')||b.contains('tesseract-running')){
    if(C.active||C.k>0||C.lag>0)clkReset(el);
    return;
  }
  /* Kotak jam + radius pengaruh (di-cache; radius dibatasi 80% jarak home Gargantua -> di home efeknya pasti 0). */
  if(!C.box||now-C.boxAt>400){
    var r=vrect(el);
    C.boxAt=now;
    if(r.width>0&&r.height>0){
      C.box=r;
      var dh=clkDist(r,BH.hx,BH.hy);
      C.rinf=Math.max(0,Math.min(Math.max(150,Math.min(W,H)*.5),dh*.8));
    }else C.box=null;
  }
  var t=0;
  if(C.box&&C.rinf>40&&!document.hidden&&BHSC>.05){
    var bp=camBH(),d=clkDist(C.box,bp[0],bp[1])-BH.R*BHSC*skyZoom;
    var u=Math.max(0,Math.min(1,1-d/C.rinf));
    t=u*u*(3-2*u);
  }
  if(t>C.k)C.k+=(t-C.k)*Math.min(1,dt*.008);       /* naik cepat */
  else C.k=Math.max(t,C.k-dt/6500);                  /* pulih linear ~6,5 dtk */
  if(C.k<.004&&t===0)C.k=0;
  if(C.k>.35)C.touchAt=Date.now();
  /* Jam berjalan lebih lambat saat dilatasi (lag menumpuk), lalu mengejar saat k turun. */
  C.lag+=dt*C.k*.85;
  if(C.lag>45000)C.lag=45000;
  C.lag-=C.lag*(1-C.k)*dt*.0006;
  if(C.k===0&&C.lag<250)C.lag=0;
  var on=C.k>.01||C.lag>=250;
  if(!on){if(C.active)clkReset(el);return;}
  if(!C.active){C.active=true;el.classList.add('clk-warp');}
  var kq=Math.round(C.k*20)/20;
  if(kq!==C.kcss){C.kcss=kq;el.style.setProperty('--kw',kq.toFixed(2));}
  if(now-C.txtAt<(IS_POTATO?140:70))return;
  C.txtAt=now;
  var ch=el.children;
  if(ch.length<3){tickClock(true);ch=el.children;if(ch.length<3)return;}
  var k=C.k,tt=new Date(Date.now()-C.lag);
  var days=['SUN','MON','TUE','WED','THU','FRI','SAT'],mons=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  var h=tt.getUTCHours(),m=tt.getUTCMinutes(),s=tt.getUTCSeconds(),hh=h%12;if(hh===0)hh=12;
  var time=(hh<10?'0':'')+hh+':'+(m<10?'0':'')+m+':'+(s<10?'0':'')+s+' '+(h<12?'AM':'PM');
  var date=days[tt.getUTCDay()]+' '+tt.getUTCDate()+' '+mons[tt.getUTCMonth()]+' '+(k>.5&&Math.random()<.7?'DILATED':'UTC');
  var p=Math.pow(k,1.15)*.8;
  if(k>.5&&Math.random()<(k-.5)*.45){
    var q=Math.random();
    time=q<.35?'--:--:-- --':(q<.65?'??:??:?? ??':(q<.85?'ERR:ERR:ERR':'RATE x'+Math.max(.05,1-.9*k).toFixed(2)));
  }else time=clkScr(time,p);
  ch[0].textContent=clkScr(date,p*.35);
  ch[2].textContent=time;
  var dx=(Math.random()*2-1)*k*2.2;
  ch[2].style.textShadow=dx.toFixed(1)+'px 0 rgba(255,70,100,.75),'+(-dx).toFixed(1)+'px 0 rgba(90,230,255,.7),0 0 6px rgba(110,229,255,.24)';
  ch[2].style.letterSpacing=(.045+(Math.random()-.5)*k*.12).toFixed(3)+'em';
  el.style.opacity=Math.random()<k*.12?'.45':'';
}

(function(){
  var ck=$('#bh-clock');if(!ck)return;
  /* Cadangan buat CSS user-select: cegah seleksi teks & menu long-press di jam. */
  ['selectstart','contextmenu','dblclick'].forEach(function(t){ck.addEventListener(t,function(e){e.preventDefault();});});
})();
$('#bh-clock').addEventListener('pointerdown',function(e){
  e.stopPropagation();var now=performance.now();
  if(now-utcReset>2200)utcClicks=0;
  utcReset=now;utcClicks++;
  haptic(8);
  if(utcClicks>=5){utcClicks=0;termOpen();}
},{passive:true});
document.addEventListener('pointerdown',function(e){
  if(SW)return;
  if(telescopeHitAt(e.clientX,e.clientY)){
    /* Priority: bintang menang dari teleskop. Saat alignment aktif, teleskop pasif total
       (tidak muncul bubble, tidak makan tap). Tap di bintang yang lagi ketimpa teleskop
       tetap diproses sebagai tap bintang. */
    if(typeof ALIGN!=='undefined'&&ALIGN.cid)return;
    if(constellationTargetAt(e.clientX,e.clientY,true))return;
    e.stopPropagation();
    /* Cancel any sky-pan that capture-phase may have started on a near miss. */
    if(skyDrag.on&&skyDrag.pid===e.pointerId){
      skyDrag.on=false;
      try{cv.releasePointerCapture(e.pointerId);}catch(err){}
    }
    haptic(8);showSecretSequence();
    placeSecretMsg();
  }
},{passive:true});

/* BFCache restore (back from dumul.html): force a fresh boot so the
   Matrix warm-up and deferred render staging run again instead of returning
   directly into a potentially cold/heavy WebView state. */
window.addEventListener('pageshow',function(e){
  if(e.persisted)location.reload();
});

/* ---------- v41.4 boot / media warm-up ----------
   First visit → full boot + matrix rain. Repeat visit in same session →
   shortened minMs via sessionStorage flag. */
(function(){
  var bs=document.getElementById('boot-screen'),fill=document.getElementById('boot-fill'),pct=document.getElementById('boot-pct'),sig=document.getElementById('boot-signal'),mx=document.getElementById('boot-matrix');
  var matrixRAF=0,matrixAlive=false;
  var isRepeatVisit=false;
  try{
    isRepeatVisit=!!sessionStorage.getItem('obs_booted');
    sessionStorage.setItem('obs_booted','1');
  }catch(e){}

  /* Boot matrix: head glow, glyph mix, clean telemetry (no glitch) */
  matrixAlive=true;
  var bootT0=performance.now();
  var statusEl=document.getElementById('boot-status');
  var quoteEl=document.getElementById('boot-quote');
  /* Fixed-width labels so the panel stays tidy while lines cycle. */
  var teleFrames=[
    ['OBSERVER','DETECTED'],
    ['AUDIO','BUFFERING'],
    ['STAR MAP','ALIGNING'],
    ['LENS','NOMINAL'],
    ['AUDIO','READY'],
    ['SIGNAL','STABLE'],
    ['STAR MAP','LOCKED']
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
      rows.push('[ '+padLabel(f[0],10)+']  <span class="ok">'+f[1]+'</span>');
    }
    teleIdx++;
    statusEl.innerHTML=rows.join('\n');
  }
  paintTelemetry(true);
  /* Quote fades in mid-boot, stays through the handoff. */
  setTimeout(function(){if(quoteEl)quoteEl.classList.add('on');},1600);

  if(mx){
    /* Cyberpunk glyph mix: kana + digits + circuit symbols. */
    var glyphs='ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789ABCDEF✦★*+<>|/\\□■◆◇○●▲△▼▽';
    var gLen=glyphs.length;
    function randGlyph(){return glyphs[(Math.random()*gLen)|0];}
    /* Multi-neon palette from ref: cyan, magenta, purple, yellow, blue, pink, mint */
    var CYBER_PAL=[
      {r:34,g:230,b:255},
      {r:255,g:43,b:214},
      {r:180,g:74,b:255},
      {r:255,g:220,b:50},
      {r:80,g:160,b:255},
      {r:255,g:80,b:140},
      {r:80,g:255,b:180}
    ];
    function randCyber(){return CYBER_PAL[(Math.random()*CYBER_PAL.length)|0];}
    var cv=document.createElement('canvas');
    var cx=cv.getContext('2d');
    mx.appendChild(cv);
    /* Depth layers: far (slow + faint) → mid → near (fast + bright).
       Streams spawn already mid-fall so the first frame is a full rain field. */
    var cols=[],baseFont,dprM;
    var LAYERS=[
      {depth:0.28,speedMul:0.32,alphaMul:0.28,fontScale:0.70,countMul:1.25},
      {depth:0.58,speedMul:0.62,alphaMul:0.55,fontScale:0.90,countMul:0.95},
      {depth:0.92,speedMul:1.05,alphaMul:0.95,fontScale:1.10,countMul:0.65}
    ];
    function makeStream(layer,w,h,midway){
      var fs=Math.max(8,Math.round(baseFont*layer.fontScale));
      var spd=(IS_POTATO?0.38:0.52)+Math.random()*(IS_POTATO?0.55:0.85);
      /* midway: scatter heads across the viewport instead of all above the top. */
      var y0=midway?(Math.random()*h*1.15-h*0.15):(Math.random()*-h*1.2);
      var len=8+((Math.random()*(IS_POTATO?14:22))|0);
      var chars=new Array(len);
      for(var j=0;j<len;j++)chars[j]=randGlyph();
      return {
        y:y0,
        speed:spd*layer.speedMul,
        len:len,
        chars:chars,
        head:0,
        tick:(Math.random()*40)|0,
        col:randCyber(),
        layer:layer,
        fs:fs,
        x:Math.random()*w
      };
    }
    /* Ring buffer: advance head instead of unshift/pop (no array shift). */
    function advanceMatrixColumn(c){
      c.head=(c.head-1+c.len)%c.len;
      c.chars[c.head]=randGlyph();
    }
    function refillMatrixColumn(c){
      if(c.chars.length!==c.len)c.chars=new Array(c.len);
      for(var j=0;j<c.len;j++)c.chars[j]=randGlyph();
      c.head=0;
    }
    function resizeMatrix(){
      dprM=Math.min(window.devicePixelRatio||1,IS_POTATO?1:1.5);
      var w=innerWidth,h=innerHeight;
      cv.width=Math.max(1,Math.round(w*dprM));
      cv.height=Math.max(1,Math.round(h*dprM));
      cx.setTransform(dprM,0,0,dprM,0,0);
      baseFont=IS_POTATO?12:Math.max(11,Math.min(16,Math.floor(w/52)));
      cols.length=0;
      for(var li=0;li<LAYERS.length;li++){
        var L=LAYERS[li];
        var n=Math.max(6,Math.floor((w/(baseFont*L.fontScale))*L.countMul*(IS_POTATO?0.7:1)));
        if(IS_POTATO&&li===0)n=Math.min(n,18);
        for(var k=0;k<n;k++){
          cols.push(makeStream(L,w,h,true));
        }
      }
      /* Sort far → near so near streams paint last (on top). */
      cols.sort(function(a,b){return a.layer.depth-b.layer.depth;});
    }
    resizeMatrix();
    function drawMatrix(){
      if(!matrixAlive)return;
      matrixRAF=requestAnimationFrame(drawMatrix);
      var w=innerWidth,h=innerHeight;
      /* Slightly stronger trail so dense far layers read as depth. */
      cx.fillStyle='rgba(2,6,14,0.16)';
      cx.fillRect(0,0,w,h);
      cx.textAlign='center';
      cx.textBaseline='top';
      for(var i=0;i<cols.length;i++){
        var c=cols[i],L=c.layer,fs=c.fs,rgb=c.col||CYBER_PAL[0];
        var aMul=L.alphaMul;
        cx.font=fs+'px "Courier New",monospace';
        c.y+=c.speed*fs*0.30;
        c.tick++;
        if(c.tick%3===0&&c.len){var ri=(Math.random()*c.len)|0;c.chars[ri]=randGlyph();}
        if(c.y-c.len*fs>h){
          /* Recycle from above the top (normal continuous rain). */
          c.y=Math.random()*-h*0.4;
          c.x=Math.random()*w;
          c.speed=((IS_POTATO?0.38:0.52)+Math.random()*(IS_POTATO?0.55:0.85))*L.speedMul;
          c.len=8+((Math.random()*(IS_POTATO?14:22))|0);
          c.col=randCyber();
          rgb=c.col;
          refillMatrixColumn(c);
        }
        var x=c.x;
        for(var j=0;j<c.len;j++){
          var gy=c.y-j*fs;
          if(gy<-fs||gy>h)continue;
          var ch=c.chars[(c.head+j)%c.len];
          if(j===0){
            /* Bright head on nearer layers; far layers stay soft. No shadowBlur. */
            if(L.depth>=0.7){
              cx.globalAlpha=aMul;
              cx.fillStyle='#ffffff';
              cx.fillText(ch,x,gy);
            }else{
              cx.globalAlpha=aMul*0.85;
              cx.fillStyle='rgba('+Math.min(255,rgb.r+30)+','+Math.min(255,rgb.g+30)+','+Math.min(255,rgb.b+30)+',0.7)';
              cx.fillText(ch,x,gy);
            }
          }else if(j===1){
            cx.globalAlpha=aMul*0.9;
            cx.fillStyle='rgba('+Math.min(255,rgb.r+20)+','+Math.min(255,rgb.g+20)+','+Math.min(255,rgb.b+20)+',0.85)';
            cx.fillText(ch,x,gy);
          }else if(j<5){
            var aMid=(0.78-j*0.09)*aMul;
            cx.globalAlpha=1;
            cx.fillStyle='rgba('+rgb.r+','+rgb.g+','+rgb.b+','+Math.max(0.04,aMid).toFixed(2)+')';
            cx.fillText(ch,x,gy);
          }else{
            var fade=Math.max(0.03,(0.42-(j-5)*0.028)*aMul);
            var dr=Math.max(0,Math.round(rgb.r*(0.45+0.2*L.depth)));
            var dg=Math.max(0,Math.round(rgb.g*(0.45+0.2*L.depth)));
            var db=Math.max(0,Math.round(rgb.b*(0.45+0.2*L.depth)));
            cx.globalAlpha=1;
            cx.fillStyle='rgba('+dr+','+dg+','+db+','+fade.toFixed(2)+')';
            cx.fillText(ch,x,gy);
          }
        }
        cx.globalAlpha=1;
        if(c.tick%2===0)advanceMatrixColumn(c);
      }
    }
    cx.fillStyle='#02060e';cx.fillRect(0,0,innerWidth,innerHeight);drawMatrix();
    var rtM;window.addEventListener('resize',function(){clearTimeout(rtM);rtM=setTimeout(function(){if(matrixAlive)resizeMatrix();},150);});
  }

  var stars=[SFX.betel,SFX.rigel,SFX.spica,SFX.sirius,SFX.pleione,SFX.aldebaran,SFX.arcturus,SFX.antares],t0=bootT0,done=false;
  var minMs=isRepeatVisit?2000:(IS_POTATO?7000:4200);
  var maxMs=isRepeatVisit?4000:(IS_POTATO?12000:8000);
  var choicesEl=document.getElementById('boot-choices');
  var capBlue=document.getElementById('boot-cap-blue');
  var capRed=document.getElementById('boot-cap-red');
  stars.forEach(function(a){try{a.preload='metadata';a.load();}catch(e){}});
  function readyCount(){var n=0;for(var i=0;i<stars.length;i++)if(stars[i].readyState>=1)n++;return n;}
  function enterObservatory(){
    if(bs.classList.contains('off'))return;
    bs.classList.add('off');
    matrixAlive=false;
    if(matrixRAF){cancelAnimationFrame(matrixRAF);matrixRAF=0;}
    bootDone=true;
    startRenderLoop();
    setTimeout(function(){if(bs&&bs.parentNode)bs.remove();},850);
  }
  function finish(){
    if(done)return;done=true;
    fill.style.width='100%';pct.textContent='100%';sig.classList.add('on');
    if(quoteEl)quoteEl.classList.add('on');
    if(statusEl)statusEl.innerHTML=
      '[ '+padLabel('OBSERVER',10)+']  <span class="ok">ONLINE</span>\n'+
      '[ '+padLabel('STAR MAP',10)+']  <span class="ok">LOCKED</span>\n'+
      '[ '+padLabel('SIGNAL',10)+']  <span class="ok">OPEN</span>\n'+
      '[ '+padLabel('BOOT',10)+']  <span class="ok">COMPLETE</span>';
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
  function tick(){
    var now=performance.now(),elapsed=now-t0,rc=readyCount(),readyRatio=rc/stars.length;
    var timeRatio=Math.min(1,Math.max(0,elapsed/minMs));
    var p=Math.min(99,Math.round((timeRatio*.72+readyRatio*.28)*100));
    if(elapsed>=minMs)p=Math.min(99,Math.max(p,90+Math.round(readyRatio*9)));
    fill.style.width=p+'%';pct.textContent=p+'%';
    paintTelemetry(false);
    if(elapsed>=minMs && (readyRatio>=1 || elapsed>=maxMs))finish();
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
window.addEventListener('resize',scheduleLayout);
/* Hybrid: visualViewport covers mobile URL-bar / soft-keyboard resizes that
   window.resize sometimes misses. Same debounced scheduler — not a replace. */
if(window.visualViewport){
  window.visualViewport.addEventListener('resize',scheduleLayout);
}
/* ready starts false: this object existing only means the script parsed,
   not that boot finished and the render loop is actually running. Flipped
   to true from startRenderLoop() once frames are really being produced. */
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
})();
