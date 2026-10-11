'use strict';
/* 05-sector-ui.js — sector overview, sector gate, panel tune, music player */
/* ================= Sector Overview (idle) — fase 1 =================
   Idle = satu ikon gugus per sektor mengelilingi Gargantua (sektor 0, tengah). Ikon digambar lewat gSky(),
   jadi tetap kena lensing / drag / swallow Gargantua. Sektor kosong = "???" (belum diisi).
   Tap ikon terisi -> sementara masuk ke tampilan rasi lama (placeholder zoom, fase 2). Tombol ◎ = balik ke overview. */
/* Sektor (4 sektor musim) + rasi tiap sektor: dari sky-data.js (SECTORS + RASI[].sector). list[].ids = rasi AKTIF (juga hitungan 💫N di overview). */
var SECT={on:true,vis:1,phase:'ov',cur:null,busy:false,z:0,t0:0,zt:2.4,dur:950,flash:0,list:SKY.sectors,down:null};
function sectSet(on){
  SECT.on=!!on;
  try{var bc=document.body.classList;bc.toggle('sect-ov',SECT.on);
    bc.toggle('sect-in',!SECT.on&&!!SECT.cur);
    for(var si=0;si<SECT.list.length;si++)bc.toggle('sect-in-'+SECT.list[si].k,!SECT.on&&SECT.cur===SECT.list[si]);
    fxSectSync();}catch(e){}
  try{applyObserveIcon(document.getElementById('mode-observe'));}catch(eO){}
  if(SECT.on){try{syncSkyPanHits();}catch(e){}}
}
var SECT_HALO=[null,null];
function sectHaloSprite(empty){
  var k=empty?1:0,c=SECT_HALO[k];
  if(c)return c;
  c=document.createElement('canvas');c.width=c.height=96;
  var x=c.getContext('2d'),gr=x.createRadialGradient(48,48,48*.2/2.1,48,48,48);
  gr.addColorStop(0,empty?'rgba(150,170,195,.06)':'rgba(110,229,255,.16)');gr.addColorStop(1,'rgba(110,229,255,0)');
  x.fillStyle=gr;x.beginPath();x.arc(48,48,48,0,6.283);x.fill();
  SECT_HALO[k]=c;return c;
}
/* Frame SVG per sektor (pengganti ring putus-putus di portal overview). Versi ring-only: cincin + tick/kilau saja,
   TANPA piringan/teks/rasi mini, supaya glyph rasi hidup di tengah tetap kelihatan. Warna ikut sky tiap sektor
   (SECTORS[].sky di sky-data.js): winter biru es + magenta, spring periwinkle, summer oranye + emas, autumn biru dalam.
   Tiap SVG 200x200, tengah transparan: cincin dalam (titik-titik) r68, cincin utama r75, cincin luar r80, ornamen sampai ~r93.
   Di-rasterisasi SEKALI ke canvas (sprite), lalu per frame cuma drawImage. Belum selesai dimuat / gagal -> ring putus-putus lama. */
var SECT_FRAME_SVG={"winter": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 200 200\" width=\"200\" height=\"200\" fill=\"none\"><defs><filter id=\"glow\" x=\"-50%\" y=\"-50%\" width=\"200%\" height=\"200%\"><feGaussianBlur stdDeviation=\"1.6\" result=\"b\"/><feMerge><feMergeNode in=\"b\"/><feMergeNode in=\"SourceGraphic\"/></feMerge></filter><linearGradient id=\"g\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop offset=\"0\" stop-color=\"#6EB9FF\"/><stop offset=\"1\" stop-color=\"#E15FBE\"/></linearGradient></defs><g stroke-linecap=\"round\" stroke-linejoin=\"round\" filter=\"url(#glow)\"><circle cx=\"100\" cy=\"100\" r=\"68\" stroke=\"#6EB9FF\" stroke-width=\"1.1\" opacity=\"0.6\" stroke-dasharray=\"1 5\"/><circle cx=\"100\" cy=\"100\" r=\"75\" stroke=\"url(#g)\" stroke-width=\"1.5\" opacity=\"0.95\" stroke-dasharray=\"9 4.5 3 4.5\"/><circle cx=\"100\" cy=\"100\" r=\"80\" stroke=\"#6EB9FF\" stroke-width=\"0.9\" opacity=\"0.45\"/><path d=\"M100 17L100 9\" stroke=\"#6EB9FF\" stroke-width=\"1.4\" opacity=\"0.65\"/><path d=\"M183 100L191 100\" stroke=\"#6EB9FF\" stroke-width=\"1.4\" opacity=\"0.65\"/><path d=\"M100 183L100 191\" stroke=\"#6EB9FF\" stroke-width=\"1.4\" opacity=\"0.65\"/><path d=\"M17 100L9 100\" stroke=\"#6EB9FF\" stroke-width=\"1.4\" opacity=\"0.65\"/></g><g filter=\"url(#glow)\"><path d=\"M161.52 33.68L162.86 37.14L166.32 38.48L162.86 39.82L161.52 43.28L160.18 39.82L156.72 38.48L160.18 37.14Z\" fill=\"#D6EBFF\" opacity=\"0.95\"/><path d=\"M38.48 157.92L39.49 160.51L42.08 161.52L39.49 162.53L38.48 165.12L37.47 162.53L34.88 161.52L37.47 160.51Z\" fill=\"#E15FBE\" opacity=\"0.9\"/><circle cx=\"160.81\" cy=\"160.81\" r=\"1.5\" fill=\"#D6EBFF\" opacity=\"0.8\"/><circle cx=\"39.19\" cy=\"39.19\" r=\"1.5\" fill=\"#6EB9FF\" opacity=\"0.8\"/></g></svg>", "spring": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 200 200\" width=\"200\" height=\"200\" fill=\"none\"><defs><filter id=\"glow\" x=\"-50%\" y=\"-50%\" width=\"200%\" height=\"200%\"><feGaussianBlur stdDeviation=\"1.6\" result=\"b\"/><feMerge><feMergeNode in=\"b\"/><feMergeNode in=\"SourceGraphic\"/></feMerge></filter></defs><g stroke-linecap=\"round\" stroke-linejoin=\"round\" filter=\"url(#glow)\"><circle cx=\"100\" cy=\"100\" r=\"68\" stroke=\"#96B2E4\" stroke-width=\"1.2\" opacity=\"0.65\" stroke-dasharray=\"1.6 4.4\"/><circle cx=\"100\" cy=\"100\" r=\"75\" stroke=\"#D3E0F8\" stroke-width=\"1.7\" opacity=\"0.95\" stroke-dasharray=\"5 5\"/><circle cx=\"100\" cy=\"100\" r=\"80\" stroke=\"#96B2E4\" stroke-width=\"1\" opacity=\"0.6\"/><path d=\"M158.69 41.31L162.23 37.77\" stroke=\"#7089C8\" stroke-width=\"1.3\" opacity=\"0.6\"/><path d=\"M158.69 158.69L162.23 162.23\" stroke=\"#7089C8\" stroke-width=\"1.3\" opacity=\"0.6\"/><path d=\"M41.31 158.69L37.77 162.23\" stroke=\"#7089C8\" stroke-width=\"1.3\" opacity=\"0.6\"/><path d=\"M41.31 41.31L37.77 37.77\" stroke=\"#7089C8\" stroke-width=\"1.3\" opacity=\"0.6\"/><circle cx=\"100\" cy=\"25\" r=\"4.6\" stroke=\"#96B2E4\" stroke-width=\"0.9\" opacity=\"0.5\"/><circle cx=\"175\" cy=\"100\" r=\"4.6\" stroke=\"#96B2E4\" stroke-width=\"0.9\" opacity=\"0.5\"/><circle cx=\"100\" cy=\"175\" r=\"4.6\" stroke=\"#96B2E4\" stroke-width=\"0.9\" opacity=\"0.5\"/><circle cx=\"25\" cy=\"100\" r=\"4.6\" stroke=\"#96B2E4\" stroke-width=\"0.9\" opacity=\"0.5\"/></g><g filter=\"url(#glow)\"><circle cx=\"100\" cy=\"25\" r=\"2.6\" fill=\"#D3E0F8\" opacity=\"0.95\"/><circle cx=\"175\" cy=\"100\" r=\"2.6\" fill=\"#D3E0F8\" opacity=\"0.95\"/><circle cx=\"100\" cy=\"175\" r=\"2.6\" fill=\"#D3E0F8\" opacity=\"0.95\"/><circle cx=\"25\" cy=\"100\" r=\"2.6\" fill=\"#D3E0F8\" opacity=\"0.95\"/></g></svg>", "summer": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 200 200\" width=\"200\" height=\"200\" fill=\"none\"><defs><filter id=\"glow\" x=\"-50%\" y=\"-50%\" width=\"200%\" height=\"200%\"><feGaussianBlur stdDeviation=\"1.6\" result=\"b\"/><feMerge><feMergeNode in=\"b\"/><feMergeNode in=\"SourceGraphic\"/></feMerge></filter><linearGradient id=\"g\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop offset=\"0\" stop-color=\"#FFA03C\"/><stop offset=\"1\" stop-color=\"#FFE196\"/></linearGradient></defs><g stroke-linecap=\"round\" stroke-linejoin=\"round\" filter=\"url(#glow)\"><circle cx=\"100\" cy=\"100\" r=\"68\" stroke=\"#E8742A\" stroke-width=\"1.1\" opacity=\"0.7\" stroke-dasharray=\"1.4 4.4\"/><circle cx=\"100\" cy=\"100\" r=\"75\" stroke=\"url(#g)\" stroke-width=\"1.9\" opacity=\"0.95\"/><circle cx=\"100\" cy=\"100\" r=\"80\" stroke=\"#FFE196\" stroke-width=\"1\" opacity=\"0.7\" stroke-dasharray=\"8 3.5\"/><path d=\"M100 16L100 8\" stroke=\"#FFA03C\" stroke-width=\"1.5\" opacity=\"0.75\"/><path d=\"M132.15 22.39L133.87 18.24\" stroke=\"#E8742A\" stroke-width=\"1.2\" opacity=\"0.6\"/><path d=\"M159.4 40.6L165.05 34.95\" stroke=\"#FFA03C\" stroke-width=\"1.5\" opacity=\"0.75\"/><path d=\"M177.61 67.85L181.76 66.13\" stroke=\"#E8742A\" stroke-width=\"1.2\" opacity=\"0.6\"/><path d=\"M184 100L192 100\" stroke=\"#FFA03C\" stroke-width=\"1.5\" opacity=\"0.75\"/><path d=\"M177.61 132.15L181.76 133.87\" stroke=\"#E8742A\" stroke-width=\"1.2\" opacity=\"0.6\"/><path d=\"M159.4 159.4L165.05 165.05\" stroke=\"#FFA03C\" stroke-width=\"1.5\" opacity=\"0.75\"/><path d=\"M132.15 177.61L133.87 181.76\" stroke=\"#E8742A\" stroke-width=\"1.2\" opacity=\"0.6\"/><path d=\"M100 184L100 192\" stroke=\"#FFA03C\" stroke-width=\"1.5\" opacity=\"0.75\"/><path d=\"M67.85 177.61L66.13 181.76\" stroke=\"#E8742A\" stroke-width=\"1.2\" opacity=\"0.6\"/><path d=\"M40.6 159.4L34.95 165.05\" stroke=\"#FFA03C\" stroke-width=\"1.5\" opacity=\"0.75\"/><path d=\"M22.39 132.15L18.24 133.87\" stroke=\"#E8742A\" stroke-width=\"1.2\" opacity=\"0.6\"/><path d=\"M16 100L8 100\" stroke=\"#FFA03C\" stroke-width=\"1.5\" opacity=\"0.75\"/><path d=\"M22.39 67.85L18.24 66.13\" stroke=\"#E8742A\" stroke-width=\"1.2\" opacity=\"0.6\"/><path d=\"M40.6 40.6L34.95 34.95\" stroke=\"#FFA03C\" stroke-width=\"1.5\" opacity=\"0.75\"/><path d=\"M67.85 22.39L66.13 18.24\" stroke=\"#E8742A\" stroke-width=\"1.2\" opacity=\"0.6\"/></g><g filter=\"url(#glow)\"><circle cx=\"100\" cy=\"7\" r=\"1.7\" fill=\"#FFE196\" opacity=\"0.9\"/><circle cx=\"193\" cy=\"100\" r=\"1.7\" fill=\"#FFE196\" opacity=\"0.9\"/><circle cx=\"100\" cy=\"193\" r=\"1.7\" fill=\"#FFE196\" opacity=\"0.9\"/><circle cx=\"7\" cy=\"100\" r=\"1.7\" fill=\"#FFE196\" opacity=\"0.9\"/></g></svg>", "autumn": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 200 200\" width=\"200\" height=\"200\" fill=\"none\"><defs><filter id=\"glow\" x=\"-50%\" y=\"-50%\" width=\"200%\" height=\"200%\"><feGaussianBlur stdDeviation=\"1.6\" result=\"b\"/><feMerge><feMergeNode in=\"b\"/><feMergeNode in=\"SourceGraphic\"/></feMerge></filter></defs><g stroke-linecap=\"round\" stroke-linejoin=\"round\" filter=\"url(#glow)\"><circle cx=\"100\" cy=\"100\" r=\"68\" stroke=\"#A5C0FF\" stroke-width=\"1.1\" opacity=\"0.5\" stroke-dasharray=\"2.2 5.5\"/><circle cx=\"100\" cy=\"100\" r=\"75\" stroke=\"#4A7BE6\" stroke-width=\"1.5\" opacity=\"0.95\" stroke-dasharray=\"6 2.4 1.2 2.4\"/><circle cx=\"100\" cy=\"100\" r=\"80\" stroke=\"#2B5BD0\" stroke-width=\"1\" opacity=\"0.7\"/></g><g filter=\"url(#glow)\"><path d=\"M100 8.4L102.85 13L100 17.6L97.15 13Z\" fill=\"#A5C0FF\" opacity=\"0.9\"/><path d=\"M187 95.4L189.85 100L187 104.6L184.15 100Z\" fill=\"#A5C0FF\" opacity=\"0.9\"/><path d=\"M100 182.4L102.85 187L100 191.6L97.15 187Z\" fill=\"#A5C0FF\" opacity=\"0.9\"/><path d=\"M13 95.4L15.85 100L13 104.6L10.15 100Z\" fill=\"#A5C0FF\" opacity=\"0.9\"/><circle cx=\"159.4\" cy=\"40.6\" r=\"1.5\" fill=\"#4A7BE6\" opacity=\"0.75\"/><circle cx=\"159.4\" cy=\"159.4\" r=\"1.5\" fill=\"#4A7BE6\" opacity=\"0.75\"/><circle cx=\"40.6\" cy=\"159.4\" r=\"1.5\" fill=\"#4A7BE6\" opacity=\"0.75\"/><circle cx=\"40.6\" cy=\"40.6\" r=\"1.5\" fill=\"#4A7BE6\" opacity=\"0.75\"/></g></svg>"};
var SECT_FRAME_SPR={},SECT_FRAME_PX=256;
function sectFrameSprite(k){
  var e=SECT_FRAME_SPR[k];
  if(e!==undefined)return e&&e.ready?e.c:null;
  var svg=SECT_FRAME_SVG[k];
  if(!svg){SECT_FRAME_SPR[k]=null;return null;}
  e=SECT_FRAME_SPR[k]={ready:false,c:null};
  try{
    var im=new Image();
    im.onload=function(){
      try{
        var c=document.createElement('canvas');c.width=c.height=SECT_FRAME_PX;
        c.getContext('2d').drawImage(im,0,0,SECT_FRAME_PX,SECT_FRAME_PX);
        e.c=c;e.ready=true;
      }catch(eD){SECT_FRAME_SPR[k]=null;}
    };
    im.onerror=function(){SECT_FRAME_SPR[k]=null;};
    im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
  }catch(eI){SECT_FRAME_SPR[k]=null;}
  return null;
}
['winter','spring','summer','autumn'].forEach(sectFrameSprite);
/* Glyph rasi di-render SEKALI ke canvas kecil (sprite), lalu tinggal drawImage per frame. */
var GLYPH_SPR={},GLYPH_URL={},GLYPH_PX=96;
function glyphSprite(id){
  var c=GLYPH_SPR[id];if(c)return c;
  c=document.createElement('canvas');c.width=c.height=GLYPH_PX;
  var og=g;g=c.getContext('2d');
  try{sectGlyphAny(id,GLYPH_PX/2,GLYPH_PX/2,GLYPH_PX*.78,1);}catch(e){}
  g=og;GLYPH_SPR[id]=c;return c;
}
function drawGlyphSprite(id,cx,cy,box,al){
  if(al<=.01)return;
  var c=glyphSprite(id);
  g.save();g.globalAlpha*=al;g.drawImage(c,cx-box*.64,cy-box*.64,box*1.28,box*1.28);g.restore();
}
/* Rasi dari track yang lagi "dimuat" (main ATAU pause) sampai track habis / diganti / distop. */
function trackConsId(){
  if(typeof activeSfx==='undefined'||!activeSfx||activeSfx.ended)return null;
  return consIdFromAudio(activeSfx);
}
/* Pleiades bukan CONS (nggak punya garis), jadi glyph-nya cuma titik-titik cluster. */
function sectGlyphAny(id,cx,cy,box,al){
  if(al<=.01)return;
  if(id==='pleiades'){
    var pts=PLEIADES.bright.concat(PLEIADES.dim),sc=box/.62,i,z;
    g.fillStyle='rgba(234,246,255,'+(.9*al)+')';
    for(i=0;i<pts.length;i++){z=pts[i];
      g.beginPath();g.arc(cx+(z.x-.53)*sc,cy+(z.y-.42)*sc,Math.max(.8,(z.r||1.3)*.55),0,6.283);g.fill();}
    return;
  }
  sectGlyph(cons(id),cx,cy,box,al);
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
function sectToggle(){
  if(SECT.busy)return;
  if(SECT.phase==='sec')sectZoomOut();
}
/* ---- Gargantua = sektor 0. Di dalam sektor dia disembunyikan; tombol 🕳️ memanggilnya kecil (seukuran pulse) & bebas di-parkir ---- */
/* Soft proximity of summoned mini-BH to rasi/cluster mass. Continuous field, no hard edge. */
function bhNearFactor(){
  if(!SECT.cur||!SUM.on||!W||!H)return 0;
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
  if(SW)return 1;
  if(SECT.cur){
    if(!SUM.on)return 0;
    if(CAMERA_MODE&&SUM.on&&camFocusId()==='bh')return 1; /* fokus kamera ke BH mini (cam 1x): seukuran BH overview; keluar fokus/kamera -> balik ke ukuran parkir */
    return Math.max(.05,Math.min(1,BHU.size/BH_SECT_MAXSIZE)); /* ukuran tetap dari slider: 1.80x = BH overview 1.00x */
  }
  if(SECT.phase==='in')return 0;
  return HBH.on?1:0; /* overview: Gargantua muncul/hilang lewat summon (BHSC mengalir halus ke target) */
}
/* Critically-damped-ish scale so drag growth feels heavy, not laggy or snappy. */
var _bhScV=0,_bhScT=0;
function bhScaleStep(){
  bhuCtxSync();
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
  var best=null,bs=1e9,nx=18,ny=13,zz=skyZoom||1,ccx=W*.5,ccy=H*.5;
  for(i=0;i<=nx;i++)for(j=0;j<=ny;j++){
    var cx=x0+(x1-x0)*i/nx,cy=y0+(y1-y0)*j/Math.max(1,ny),md=1e9;
    for(k=0;k<pts.length;k+=2){var d=Math.hypot(cx-pts[k],cy-pts[k+1]);if(d<md)md=d;}
    /* screen -> ruang BH (rumus sama dengan sumSet), lalu nilai pakai bhNearAt: makin kecil = makin kecil pula BH mini pas parkir */
    var bxx=ccx+(cx-ccx)/zz-skyPan.x*BHK,byy=ccy+(cy-ccy)/zz-skyPan.y*BHK;
    var sc=bhNearAt(bxx,byy)-Math.min(md,200)/2000;   /* tie-break: yang lebih jauh dari bintang menang */
    if(sc<bs){bs=sc;best=[cx,cy];}
  }
  return best||[W*.5,H*.5];
}
function sumSet(on){
  if(on&&(!SECT.cur||SECT.busy||SW))return;
  if(SECT.busy||SW)return;
  if(on){
    var sp=sumSpot(),z=skyZoom||1,cx=W*.5,cy=H*.5;
    BH.x=cx+(sp[0]-cx)/z-skyPan.x*BHK;BH.y=cy+(sp[1]-cy)/z-skyPan.y*BHK;
    SUM.on=true;SECT.cur.relay=true;SUM.x0=BH.x;SUM.y0=BH.y;SUM.moved=false;   /* belum di-drag = dilatasi audio pasif */
    try{focusRefresh();}catch(eFR){}
    try{var so=sfxSector();   /* kalau sumber suara di sektor lain, toast relay dari spatialHint yang tampil */
      if(typeof showModeToast==='function'&&!(so&&so!==SECT.cur))showModeToast('GARGANTUA SUMMONED\nDRAG TO PARK ANYWHERE\nRELAY SET \u00b7 OVERVIEW BH MUST BE SUMMONED TOO',null,3200);}catch(e){}
  }else{
    SUM.on=false;if(SECT.cur){SECT.cur.relay=false;SECT.cur.sum=null;}
    try{focusRefresh();}catch(eFR){}
    try{if(typeof showModeToast==='function')showModeToast('GARGANTUA RECALLED',null,1800);}catch(e){}
  }
  haptic(10);sumUI();
}
function sumReset(){SUM.on=false;BH.x=BH.hx;BH.y=BH.hy;sumUI();}
/* Keluar sektor: Gargantua mini DISIMPAN di sektornya (posisi + relay tetap), bukan di-reset. */
function sumStash(){
  var c=SECT.cur;
  if(c)c.sum=SUM.on?{x:BH.x,y:BH.y,x0:SUM.x0,y0:SUM.y0,moved:!!SUM.moved}:null;
  SUM.on=false;BH.x=BH.hx;BH.y=BH.hy;sumUI();
}
/* Masuk sektor: kalau tadi sudah di-summon di sini, munculkan lagi di posisi parkir terakhir. */
function sumRestore(s){
  if(!s||!s.sum)return;
  var mg=Math.max(6,SUM_R*1.15);
  BH.x=Math.max(mg,Math.min(W-mg,s.sum.x));BH.y=Math.max(mg,Math.min(H-mg,s.sum.y));
  SUM.on=true;s.relay=true;SUM.x0=s.sum.x0==null?s.sum.x:s.sum.x0;SUM.y0=s.sum.y0==null?s.sum.y:s.sum.y0;SUM.moved=!!s.sum.moved;sumUI();
}
function sumUI(){
  var b=document.getElementById('mode-bh');
  var vis=SECT.cur?SUM.on:HBH.on;   /* di sektor: BH mini; di overview: BH utama */
  try{document.body.classList.toggle('bh-live',!!vis);}catch(e){}
  if(b){
    b.classList.toggle('on',!!vis);b.setAttribute('aria-pressed',vis?'true':'false');
    b.title=vis?'Recall Gargantua':'Summon Gargantua';
    b.setAttribute('aria-label',b.title);
  }
  if(typeof bhTuneSync==='function')bhTuneSync();
}
/* Summon / recall Gargantua di OVERVIEW (kembaran sumSet yang dipakai di dalam sektor). */
function homeSet(on){
  if(SECT.cur||SECT.busy||SW)return;
  on=!!on;if(on===HBH.on)return;
  HBH.on=on;
  try{localStorage.setItem('dumul_bh_home',on?'1':'0');}catch(e){}
  if(!on){drag.on=false;BH.x=BH.hx;BH.y=BH.hy;}
  try{
    var sfxOn=!!(activeSfx&&!activeSfx.paused&&!activeSfx.ended);   /* lagi ada SFX: toast ikut status sinyal (jernih / teredam) */
    /* Lagi ada SFX: status sinyal (linked / muffled) diumumkan spatialHint karena tergantung relay sektor sumber juga, jadi toast di sini dilewati. */
    if(!sfxOn&&typeof showModeToast==='function')showModeToast(on?'GARGANTUA SUMMONED':'GARGANTUA RECALLED',null,on?2000:2400);
  }catch(e){}
  haptic(10);sumUI();
}
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
      if(SGATE.pend){var pj=SGATE.pend;SGATE.pend=null;try{sectZoomIn(pj);}catch(eJ){}} /* lanjut masuk sector tujuan (Sector Gate) */
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
    var an=s.a*Math.PI/180,ox=Math.cos(an)*rx,oy=Math.sin(an)*ry,dx=ox,dy=oy;
    if(STG.rot){
      /* Landscape (stage diputar 90°): susunan portal di LAYAR disamakan dengan portrait (01 tetap di posisi atas, dst).
         Offset portrait (ox,oy) diubah ke ruang stage, dan diskala supaya muat di tinggi layar landscape. */
      /* Portal atas/bawah sudah tidak ada (sudut max 30° -> |sin|=.5), jadi tinggi layar cukup lega. Horizontal landscape lebih lebar:
         portal dijauhkan dari BH sampai sisi layar (dengan sisa margin). */
      var lf=Math.min(1,Math.max(.3,(STG.ih*.5-rad-36)/Math.max(1,ry*.5)));
      var bxs=STG.rot<0?BH.hy:(STG.iw-BH.hy),avail=Math.min(bxs,STG.iw-bxs)-rad-24;
      var rxL=Math.max(rx*lf,Math.min(avail*.85,STG.ih*1.1));
      ox=Math.cos(an)*rxL;oy*=lf;
      if(STG.rot<0){dx=-oy;dy=ox;}else{dx=oy;dy=-ox;}
    }
    var bx=BH.hx+dx,by=BH.hy+dy;
    s.bx=bx;s.by=by;
    var p=gSky(bx+mx,by+my);
    s.sx=p[0];s.sy=p[1];
    var vis=al*SECT.vis*(1-Math.min(1,p[2]));
    if(vis<=.01)continue;
    var br=reduce?0:Math.sin(now*.0015+i*1.3)*.04,r=rad*(1+br);
    g.save();
    g.globalAlpha=vis;
    uprBegin(p[0],p[1]); /* ikon+teks sektor tegak di landscape (restore ikut g.restore di bawah) */
    /* halo */
    g.drawImage(sectHaloSprite(empty),p[0]-r*2.1,p[1]-r*2.1,r*4.2,r*4.2);
    /* frame SVG sektor (kalau sudah siap & sektor sudah terpetakan); kalau belum -> ring putus-putus. Cincin utama frame (r75/200) = jari-jari r. */
    var frSpr=empty?null:sectFrameSprite(s.k),useFrame=!!frSpr,lo=r+7;
    if(useFrame){
      var fh=r*(100/75);
      g.drawImage(frSpr,p[0]-fh,p[1]-fh,fh*2,fh*2);
      lo=r*1.28+4; /* ornamen frame menjorok sampai ~1.27r (r95/r75), label digeser turun */
    }else{
      g.lineWidth=1;g.strokeStyle=empty?'rgba(184,198,214,.28)':'rgba(110,229,255,.5)';
      if(g.setLineDash){g.setLineDash([3,5]);g.lineDashOffset=reduce?0:-now*.012;}
      g.beginPath();g.arc(p[0],p[1],r,0,6.283);g.stroke();
      if(g.setLineDash)g.setLineDash([]);
    }
    g.textAlign='center';g.textBaseline='middle';
    if(empty){
      g.fillStyle='rgba(184,198,214,.5)';g.font='600 '+Math.round(r*.62)+'px "Space Grotesk",system-ui,sans-serif';
      g.fillText('???',p[0],p[1]);
    }else{
      /* Ikon ngikut track yang lagi diputar: Aldebaran -> Taurus, Antares -> Scorpius, dst. Berhenti -> balik ke ikon utama. */
      var want=s.ids[0],pid=trackConsId();
      if(pid&&s.ids.indexOf(pid)>=0)want=pid;
      if(s.gid==null)s.gid=want;
      if(want!==s.gid){s.gprev=reduce?null:s.gid;s.gid=want;s.gt=now;}
      var gp=s.gprev!=null?clamp((now-s.gt)/320):1;
      if(gp>=1)s.gprev=null;
      if(s.gprev!=null)drawGlyphSprite(s.gprev,p[0],p[1],r*1.45,1-gp);
      drawGlyphSprite(s.gid,p[0],p[1],r*1.45,gp);
    }
    /* label '01 - *4' di bawah portal dibuang (dikosongkan dulu); sisa: penanda relay / 'no signal yet' */
    g.font='500 9px "Space Grotesk",system-ui,sans-serif';g.textBaseline='top';
    if(s.relay&&!(s.flash&&now-s.flash<1500)){
      g.fillStyle='rgba(110,229,255,.7)';g.fillText('\u25c9 relay',p[0],p[1]+lo);
    }
    if(s.flash&&now-s.flash<1500){
      g.fillStyle='rgba(255,154,217,'+(.85*(1-(now-s.flash)/1500))+')';
      g.fillText('no signal yet',p[0],p[1]+lo);
    }
    g.restore();g.restore();
  }
  try{if(/[?&]dbg\b/.test(location.search)){g.save();g.fillStyle='rgba(255,255,255,.5)';g.font='9px monospace';g.textAlign='left';g.textBaseline='top';
    g.fillText('build 2026-10-06a \u00b7 PLE '+(PLEIADES.scale||0).toFixed(1),8,top+4);g.restore();}}catch(eD){}
}
/* ---------- panel tune Gargantua: size / strength / bloom / speed + SAVE ---------- */
(function bhTune(){
  var panel=document.getElementById('bh-panel'),btn=document.getElementById('mode-bhset');
  if(!panel||!btn)return;
  var keys=['size','str','bloom','speed'],allKeys=keys.concat(['ast']),astBtn=document.getElementById('bp-ast'),inp={},out={},bSave=document.getElementById('bp-save'),bReset=document.getElementById('bp-reset'),bClose=document.getElementById('bp-close');
  keys.forEach(function(k){inp[k]=document.getElementById('bp-'+k);out[k]=document.getElementById('bp-'+k+'-v');});
  function stored(){var o=null;try{o=JSON.parse(localStorage.getItem(bhuKey())||'null');}catch(e){}var r={},df=bhuDef();allKeys.forEach(function(k){r[k]=(o&&typeof o[k]==='number')?bhuClamp(k,o[k]):df[k];});return r;}
  var tag=panel.querySelector('.bp-tag');
  function paint(){
    if(tag)tag.textContent=BHU_CTX?'Gargantua // Sector Tune':'Gargantua // Tune';
    keys.forEach(function(k){if(inp[k])inp[k].value=String(Math.round(BHU[k]*100));if(out[k])out[k].textContent=BHU[k].toFixed(2)+'\u00d7';});
    if(astBtn){var ao=BHU.ast>=.5;astBtn.setAttribute('aria-pressed',ao?'true':'false');astBtn.textContent=ao?'Show':'Hide';astBtn.classList.toggle('off',!ao);}
    var st=stored(),d=false;allKeys.forEach(function(k){if(Math.abs(st[k]-BHU[k])>.004)d=true;});
    if(bSave)bSave.classList.toggle('dirty',d);
  }
  function open(on){
    on=!!on&&document.body.classList.contains('bh-live');
    panel.classList.toggle('on',on);panel.setAttribute('aria-hidden',on?'false':'true');
    btn.classList.toggle('on',on);btn.setAttribute('aria-expanded',on?'true':'false');
    if(on)paint();
  }
  bhuRepaint=paint;
  bhTuneSync=function(){if(!document.body.classList.contains('bh-live'))open(false);};
  btn.addEventListener('click',function(e){e.stopPropagation();open(!panel.classList.contains('on'));haptic(6);});
  if(bClose)bClose.addEventListener('click',function(e){e.stopPropagation();open(false);});
  keys.forEach(function(k){
    if(!inp[k])return;
    inp[k].addEventListener('input',function(){BHU[k]=bhuClamp(k,inp[k].value/100);if(out[k])out[k].textContent=BHU[k].toFixed(2)+'\u00d7';paint();});
  });
  if(astBtn)astBtn.addEventListener('click',function(e){e.stopPropagation();BHU.ast=BHU.ast>=.5?0:1;paint();haptic(6);});
  if(bSave)bSave.addEventListener('click',function(e){
    e.stopPropagation();
    try{localStorage.setItem(bhuKey(),JSON.stringify(BHU));}catch(er){}
    paint();haptic(10);
    try{if(typeof showModeToast==='function')showModeToast('GARGANTUA SETTINGS SAVED',null,1500);}catch(er){}
  });
  if(bReset)bReset.addEventListener('click',function(e){
    e.stopPropagation();
    allKeys.forEach(function(k){BHU[k]=bhuDef()[k];});
    try{localStorage.removeItem(bhuKey());}catch(er){}
    paint();haptic(8);
  });
  panel.addEventListener('pointerdown',function(e){e.stopPropagation();});
  /* Isolasi: sentuhan/scroll/klik di panel tidak boleh tembus ke langit, BH, asteroid, atau zoom kamera. */
  ['pointerup','click','touchstart','touchmove','wheel','contextmenu'].forEach(function(t){
    panel.addEventListener(t,function(e){e.stopPropagation();},{passive:true});
  });
  /* Tap di luar panel menutup (pola sama dengan panel music); tombol gear ditangani handler-nya sendiri. */
  document.addEventListener('pointerdown',function(e){
    if(!panel.classList.contains('on'))return;
    var t=e.target;
    if(panel.contains(t)||(btn&&btn.contains(t)))return;
    open(false);
  },true);
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&panel.classList.contains('on'))open(false);});
  bhTuneClose=function(){if(panel.classList.contains('on'))open(false);};
  paint();
})();

(function sectInit(){
  var b=document.getElementById('mode-sectors');
  if(b)b.addEventListener('click',sectToggle);
  var bb=document.getElementById('mode-bh');
  if(bb)bb.addEventListener('click',function(){if(SECT.cur)sumSet(!SUM.on);else homeSet(!HBH.on);});
  try{sumUI();}catch(eU0){}
  sectSet(true);
  try{if(window.__hub)window.__hub.sect=SECT;}catch(e){}
  var SKIP='#bh,.portal,.hit,#owl-source,#owl-panel,#owl-backdrop,#bh-clock,#music-toggle,#music-player,#mode-cluster,#mode-sectors,#mode-bh,#cam-zoom,#bh-panel,#boot-screen,#terminal,#signal-fragment';
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

/* ===== Sector Gate =====
   Di dalam sector, tap Gargantua mini (yang sedang di-summon = relay) membuka portal tujuan: ikon portal overview versi kecil,
   satu per sector LAIN yang statusnya relay. Tap portal = lompat (keluar ke overview lalu masuk sector tujuan). BH tetap parkir
   (jadi relay), fungsinya cuma shortcut. Portal ke dumul.html tetap cuma lewat BH overview. */
var SGATE={open:false,t:0,items:[],down:null,pend:null,sup:0};
function sgDests(){var r=[],i,s;for(i=0;i<SECT.list.length;i++){s=SECT.list[i];if(s!==SECT.cur&&s.relay&&s.ids&&s.ids.length)r.push(s);}return r;}
function sgNum(s){var i=SECT.list.indexOf(s)+1;return (i<10?'0':'')+i;}
function sgClose(){SGATE.open=false;SGATE.items.length=0;SGATE.down=null;}
function sgToggle(){
  if(SGATE.open){sgClose();return;}
  if(!SECT.cur||!SUM.on||SECT.busy)return;
  if(!sgDests().length){try{showModeToast('NO OTHER RELAY SECTOR\\nSUMMON BH IN ANOTHER SECTOR FIRST',null,2800);}catch(e){}return;}
  SGATE.open=true;SGATE.t=performance.now();SGATE.down=null;haptic(8);
}
function sgJump(s){
  if(!SGATE.open||SECT.busy||!SECT.cur||s===SECT.cur||!s.relay)return;
  SGATE.pend=s;sgClose();
  try{showModeToast('JUMP \\u00b7 SECTOR '+sgNum(s),null,1500);}catch(e){}
  haptic(12);sectZoomOut();
  if(!SECT.busy)SGATE.pend=null;
}
function sgHit(x,y){
  for(var i=0;i<SGATE.items.length;i++){var it=SGATE.items[i];if(Math.hypot(x-it.x,y-it.y)<=Math.max(it.r*1.35,22))return it;}
  return null;
}
function drawSectorGate(now){
  if(!SGATE.open)return;
  if(!SECT.cur||!SUM.on||SECT.busy||CAMERA_MODE||(drag.on&&drag.moved)){sgClose();return;}
  var dests=sgDests(),n=dests.length;if(!n){sgClose();return;}
  var bp=camBH(),Rv=Math.max(8,BH.Rr*(BHZ||1)),rad=Math.max(15,Math.min(22,W*.05)),ring=Math.max(Rv*2.2,40)+rad*1.6,
      u=clamp((now-SGATE.t)/(reduce?1:260)),e=1-Math.pow(1-u,3),pts=[],i,j,s,dx,dy,len,x,y,m=rad+10;
  /* arah portal = arah ikon sektor itu di overview terhadap Gargantua (susunan sama dengan overview) */
  for(i=0;i<n;i++){
    s=dests[i];
    dx=(s.bx!=null)?s.bx-BH.hx:(i-(n-1)/2)*60;dy=(s.by!=null)?s.by-BH.hy:0;
    len=Math.hypot(dx,dy)||1;
    pts.push([bp[0]+dx/len*ring,bp[1]+dy/len*ring]);
  }
  for(var it=0;it<4;it++){ /* longgarkan kalau dua portal bertabrakan */
    for(i=0;i<n;i++)for(j=i+1;j<n;j++){
      dx=pts[j][0]-pts[i][0];dy=pts[j][1]-pts[i][1];len=Math.hypot(dx,dy)||.01;
      if(len<rad*2.6){var k=(rad*2.6-len)/2;dx/=len;dy/=len;pts[i][0]-=dx*k;pts[i][1]-=dy*k;pts[j][0]+=dx*k;pts[j][1]+=dy*k;}
    }
  }
  SGATE.items.length=0;
  g.save();g.textAlign='center';
  for(i=0;i<n;i++){
    s=dests[i];
    x=Math.max(m,Math.min(W-m,pts[i][0]));y=Math.max(m,Math.min(H-m,pts[i][1]));
    var px=bp[0]+(x-bp[0])*e,py=bp[1]+(y-bp[1])*e,br=reduce?0:Math.sin(now*.0015+i*1.3)*.04,r=rad*(.55+.45*e)*(1+br);
    g.save();g.globalAlpha=e;
    g.strokeStyle='rgba(110,229,255,.26)';g.lineWidth=1;
    if(g.setLineDash){g.setLineDash([3,5]);g.lineDashOffset=reduce?0:-now*.01;}
    var ldx=px-bp[0],ldy=py-bp[1],ll=Math.hypot(ldx,ldy)||1,a0=Rv*1.25,a1=ll-r*1.3;
    if(a1>a0){g.beginPath();g.moveTo(bp[0]+ldx/ll*a0,bp[1]+ldy/ll*a0);g.lineTo(bp[0]+ldx/ll*a1,bp[1]+ldy/ll*a1);g.stroke();}
    if(g.setLineDash)g.setLineDash([]);
    var up=uprBegin(px,py);
    g.drawImage(sectHaloSprite(false),px-r*2.1,py-r*2.1,r*4.2,r*4.2);
    var fr=sectFrameSprite(s.k),lo=r+6;
    if(fr){var fh=r*(100/75);g.drawImage(fr,px-fh,py-fh,fh*2,fh*2);lo=r*1.28+3;}
    else{g.lineWidth=1;g.strokeStyle='rgba(110,229,255,.5)';g.beginPath();g.arc(px,py,r,0,6.283);g.stroke();}
    drawGlyphSprite(s.ids[0],px,py,r*1.45,1);
    g.font='600 9px "Space Grotesk",system-ui,sans-serif';g.textBaseline='top';g.fillStyle='rgba(110,229,255,.85)';
    g.fillText(sgNum(s),px,py+lo);
    if(up)g.restore();
    g.restore();
    SGATE.items.push({s:s,x:px,y:py,r:r});
  }
  g.restore();
}
window.addEventListener('pointerdown',function(e){
  if(!SGATE.open)return;
  var h=sgHit(e.clientX,e.clientY);
  if(h){e.preventDefault();e.stopPropagation();SGATE.down={s:h.s,x:e.clientX,y:e.clientY,t:performance.now(),id:e.pointerId};SGATE.sup=performance.now()+700;return;}
  var bp=camBH();
  if(Math.hypot(e.clientX-bp[0],e.clientY-bp[1])<=Math.max(BH.Rr*(BHZ||1)*1.9,40))return; /* tap BH sendiri = toggle lewat endBHDrag */
  sgClose(); /* tap di luar: tutup (tap tetap lanjut seperti biasa) */
},true);
window.addEventListener('pointerup',function(e){
  var d=SGATE.down;if(!d||e.pointerId!==d.id)return;
  SGATE.down=null;e.stopPropagation();
  if(performance.now()-d.t>600||Math.hypot(e.clientX-d.x,e.clientY-d.y)>12)return;
  var h=sgHit(e.clientX,e.clientY);if(h&&h.s===d.s)sgJump(d.s);
},true);
window.addEventListener('pointercancel',function(){SGATE.down=null;},true);
window.addEventListener('click',function(e){if(SGATE.sup&&performance.now()<SGATE.sup){e.stopPropagation();e.preventDefault();}},true); /* klik susulan tidak tembus ke tombol di bawah portal */
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&SGATE.open)sgClose();});

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
      sectDrawSky();   /* warna langit per sektor (data: SECTORS[].sky di sky-data.js) */
      plateBlit(bgCanvas,pM,pW,pH,skyZoom,skyPan.x*.35+pmx*10,skyPan.y*.35+pmy*7);
      drawHud();
    }
    ofxSafe(ofxDrawTint,now); /* langit bergeser warna mengikuti BGM */
    drawFloatingTelescope(now);
    var msgEl=frame._m||(frame._m=$('#secret-msg'));
    if(msgEl&&msgEl.classList.contains('on')&&msgEl.dataset.type==='telescope')placeSecretMsg();
    teleGreetFollow();
    updateClockDilation(now);
    drawShooting(now);
    cullBegin();
    sectStep(now);
    if(SECT.on){if(PU.length)PU.length=0;drawSectorOverview(now,age);}
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
    try{drawSectorGate(now);}catch(err){window.__hub.renderError='sectorGate: '+(err&&err.message||err);}
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
    return '<button class="mp-track" type="button" '+attrs+'><span class="mp-num">'+pad2(n)+'</span><span class="mp-name">'+name+'</span>'+(obs?'<span class="mp-obs" aria-hidden="true" title="Unobserved">\u25CB</span>':'')+SPEC+'</button>';
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
  groups.forEach(function(g){g.querySelector('.mp-grp-head').addEventListener('click',function(){var on=!g.classList.contains('open');groups.forEach(function(o){grpOpen(o,false);});grpOpen(g,on);});}); /* satu sektor terbuka sekali waktu */
  toggle.addEventListener('click',function(){
    if(panel.classList.contains('open'))return;
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
    playBtn.setAttribute('aria-label',playing?'Pause music':'Play music');
    playBtn.innerHTML='<span class="mp-play-icon" aria-hidden="true"><svg class="ico ico-play" viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden="true"'+(playing?' hidden':'')+'><path d="M8 5.5v13l11-6.5L8 5.5z"/></svg><svg class="ico ico-pause" viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden="true"'+(playing?'':' hidden')+'><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg></span>';
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
    playBtn.innerHTML='<span class="mp-play-icon" aria-hidden="true"><svg class="ico ico-play" viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13l11-6.5L8 5.5z"/></svg><svg class="ico ico-pause" viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden="true" hidden><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg></span>';
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
      target.audio._bv=.5;
      try{target.audio.volume=Math.max(0,Math.min(1,.5*(window.__mpMasterVol!=null?window.__mpMasterVol:.85)));}catch(eV){target.audio.volume=.5;}
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
      volBtn.title=muted?'Unmute':'Volume';
      volBtn.setAttribute('aria-label',muted?'Unmute':'Volume');
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
    if(t.type==='sfx'&&typeof isUnlocked==='function'&&!isUnlocked(t.key))return false;
    return true;
  }
  function playableList(){
    var L=[];
    for(var i=0;i<tracks.length;i++)if(isPlayable(i))L.push(i);
    return L;
  }
  function pickNext(from,dir){
    var L=playableList();
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
      showModeToast('RADIO SILENCE\nAUDIO CHANNEL CLOSED','silence',1600);return;
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
    if(repeatMode===1)a.loop=true;
    else if(repeatMode===2)a.loop=false;
    else a.loop=!!isBgm;
  }
  function onTrackEnded(t){
    if(!t||!t.audio)return;
    if(repeatMode===1){
      try{t.audio.currentTime=0;}catch(e){}
      safePlay(t.audio);return;
    }
    if(repeatMode===2||shuffleOn){
      var cur=tracks.indexOf(t);
      var n=pickNext(cur,1);
      if(n>=0&&n!==cur)selectAndPlay(n);
      else if(n===cur){try{t.audio.currentTime=0;}catch(e2){}safePlay(t.audio);}
      return;
    }
    sync();
  }
  function fmtTime(s){
    if(!isFinite(s)||s<0)return '0:00';
    s=Math.floor(s);
    return ((s/60)|0)+':'+((s%60)<10?'0':'')+(s%60);
  }
  function paintWave(prog,playing){
    if(!waveCx||!waveCv)return;
    var w=waveCv.width,h=waveCv.height;
    waveCx.clearRect(0,0,w,h);
    var bars=36,gap=2,bw=(w-gap*(bars-1))/bars,mid=h*.55;
    var seed=waveSeed;
    for(var i=0;i<bars;i++){
      seed=(seed*16807+i*13)%2147483647;
      var n=((seed%1000)/1000);
      var env=.35+.65*Math.sin((i/bars)*Math.PI);
      var bh=Math.max(2,mid*env*(.45+.55*n));
      if(playing){
        var pulse=.5+.5*Math.sin(performance.now()*.006+i*.55);
        bh*=.75+.25*pulse;
      }
      var x=i*(bw+gap);
      var filled=(i/bars)<prog;
      waveCx.fillStyle=filled?'rgba(110,229,255,.75)':'rgba(110,229,255,.18)';
      waveCx.fillRect(x,mid-bh*.55,bw,bh);
    }
    var px=Math.max(0,Math.min(w,prog*w));
    waveCx.fillStyle='rgba(234,252,255,.9)';
    waveCx.fillRect(px-0.5,2,1.5,h-4);
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
    if(t0El)t0El.textContent=fmtTime(cur);
    if(t1El)t1El.textContent=dur>0?fmtTime(dur):'0:00';
    if(seekEl&&!seekDrag)seekEl.value=String(Math.round(prog*1000));
    paintWave(prog,!!a&&!a.paused);
  }
  var seekRAF=0;
  function tickSeek(){
    seekRAF=0;
    /* Hanya jalan saat panel terbuka + ada audio playing */
    if(!panelOpen()||getPlayingTrackIndex()===-1){stopSeekTick();return;}
    updateSeekUI();
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
      btnRepeat.title=repeatMode===1?'Repeat one':(repeatMode===2?'Repeat all':'Repeat off');
      btnRepeat.setAttribute('aria-label',btnRepeat.title);
    }
    var pi=getPlayingTrackIndex();
    if(pi>=0&&panelOpen()){waveSeed=(pi+1)*97;startSeekTick();}
    else stopSeekTick();
  };

  if(btnPrev)btnPrev.addEventListener('click',function(){stepTrack(-1);haptic(6);});
  if(btnNext)btnNext.addEventListener('click',function(){stepTrack(1);haptic(6);});
  if(btnShuffle)btnShuffle.addEventListener('click',function(){
    shuffleOn=!shuffleOn;
    try{localStorage.setItem('mp_shuffle',shuffleOn?'1':'0');}catch(e){}
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
    t.audio.addEventListener('play',sync);
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
  if(!isUnlocked(key)){lockedHint(key);return;}
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
function cOrionOffsetX(){return cons('orion').ox||0}
function cOrionOffsetY(){return cons('orion').oy||0}

