'use strict';
/* 04-render.js — overlay, teleskop, SFX, reticle, gambar konstelasi, observatory FX */
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

/* ---------- persiapan + handoff ke dumul.html (dipakai beltEnter) ----------
   dumulPrepare: audio kill, GARG, prefetch, neural-net). Kontrak sessionStorage (dm_collapsars_*) ke dumul.html tidak berubah. */
function dumulPrepare(href){
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
  fadeTo(AMB,0,900);
  GARG.currentTime=0;GARG.volume=0;
  dmTransitionGraph();
  dmTransitionStart();
  fadeTo(GARG,.55,1800);
  var pf=document.createElement('link');pf.rel='prefetch';pf.href=href;document.head.appendChild(pf);
}
function dumulHandoff(){
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
}
/* ---------- F4 (D6): masuk dumul.html lewat sabuk Orion ----------
   Supernova di Alnilam + kamera zoom/pan ke bintang itu (~1,5 dtk), veil, lalu startTesseractWarp seperti biasa.
   SW diisi {kind:'belt'} supaya semua guard input (SW) tetap jalan; langit TIDAK disedot spiral.
   Mengembalikan true kalau animasi mulai (klik di-handle); false = biarkan anchor biasa jalan. */
var BELT=null;
var BELT_MS=1500,BELT_Z=3;
function beltEnter(href){
  if(SW||BELT)return false;
  if(typeof isLayoutEdit==='function'&&isLayoutEdit())return false;
  var c=cons('orion'),s=c&&c.stars&&c.stars.alnilam;
  if(!s)return false;
  dumulPrepare(href);
  var ms=reduce?600:BELT_MS,t0=performance.now();
  SW={t0:t0,dur:ms,h0:0,kind:'belt'};
  BELT={t0:t0,dur:ms,z0:skyZoom,rgb:'110,229,255',c:c,s:s,last:t0,ex:c.ox-skyPan.x,ey:c.oy-skyPan.y};   /* ex/ey = bagian non-pan dari c.ox (goyangan/mouse), diambil SEKALI di sini: c.ox baru di-update saat render, jadi (c.ox-skyPan) tidak konsisten begitu pan bergerak */
  document.body.classList.add('sw');
  /* Jadwal wajib duluan: apa pun yang gagal di animasi, tesseract + redirect tetap jalan */
  setTimeout(function(){try{dumulHandoff();}catch(e){}startTesseractWarp(href);},ms);
  setTimeout(function(){var v=$('#veil');if(v)v.classList.add('on');},Math.max(0,ms-480));
  try{haptic(22);}catch(e){}
  try{   /* kilat supernova (overlay yang sama dgn triggerSupernova) di posisi Alnilam */
    var fl=$('#sn-flash'),q=gSky(s.x+c.ox,s.y+c.oy);
    if(fl&&q){
      fl.style.setProperty('--sx',Math.round(q[0])+'px');fl.style.setProperty('--sy',Math.round(q[1])+'px');
      fl.style.setProperty('--sn-rgb',BELT.rgb);
      fl.classList.remove('on');void fl.offsetWidth;fl.classList.add('on');
      clearTimeout(fl._snT);fl._snT=setTimeout(function(){fl.classList.remove('on');},1000);
    }
  }catch(eF){}
  try{   /* HUD memudar (bukan disedot) */
    [].slice.call(document.querySelectorAll('#title,#header .sub,footer nav a,footer .quote,.portal,.cap,#music-toggle,#music-player,#mp-now-playing,#owl-source,#bh-clock,#signal-fragment,#cons-archive,#mode-cluster,#mode-observe,#mode-silence,#last-signal,#mode-bh')).forEach(function(el){
      if(el.animate)el.animate([{opacity:getComputedStyle(el).opacity},{opacity:0}],{duration:reduce?200:650,delay:reduce?0:120,easing:'ease-in',fill:'forwards'});
      else el.style.opacity=0;
    });
  }catch(eH){}
  if(!reduce)requestAnimationFrame(beltCamStep);
  return true;
}
function beltCamStep(now){
  var B=BELT;if(!B)return;
  var u=Math.min(1,(now-B.t0)/B.dur),e=u*u*(3-2*u),dt=Math.max(0,Math.min(250,now-B.last));B.last=now;
  var zt=Math.max(B.z0,BELT_Z);
  try{
    setSkyZoom(B.z0+(zt-B.z0)*e,false);
    /* pan analitik: c.ox = skyPan + goyangan/mouse. Supaya Alnilam di tengah layar: pan = (tengah - posisi dasar bintang) - (bagian non-pan, B.ex/B.ey).
       Tidak tergantung zoom/frame lama; ditarik halus (time-based), dan pas u=1 dikunci tepat. */
    var lim=skyPanLimits(),ex=B.ex,ey=B.ey,
        tx=Math.max(-lim.x,Math.min(lim.x,W*.5-B.s.x-ex)),ty=Math.max(-lim.y,Math.min(lim.y,H*.5-B.s.y-ey)),
        k=u>=1?1:1-Math.exp(-dt/110);
    skyPan.x+=(tx-skyPan.x)*k;skyPan.y+=(ty-skyPan.y)*k;
    B.tx=tx;B.ty=ty;
  }catch(eC){}
  if(u<1)requestAnimationFrame(beltCamStep);
}

/* ---------- gambar ---------- */
/* ---- Teleskop x sektor ----
   Home/overview : teleskop ngorbit IKON sektor yang SFX-nya lagi aktif.
   Dalam sektor sumber : ngorbit bintangnya (alur lama via triggerSupernova).
   Sektor lain (SFX aktif di sektor berbeda) : teleskop "sibuk", menghilang + bubble pamit. */
var TELE_BUSY_MSG=[T('tele.busy.1'),T('tele.busy.2'),T('tele.busy.3'),T('tele.busy.4')];
function teleStarFollow(key){
  var tr=TRIGGERS[key];if(!tr)return null;
  var c=tr.cons==='pleiades'?PLEIADES:cons(tr.cons);if(!c)return null;
  var st=tr.cons==='pleiades'?plStarByName(tr.star):c.stars[tr.star];
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
  /* Fase 4+: tidak auto-warp/orbit ke SFX. Tidak "sibuk stay" di sektor sumber.
     Visibilitas hanya ikut LIS (lisGone): teleskop ikut pengamat kalau di-ajak. */
  if(T.mode==='warp'||T.mode==='orbit'){
    if(T.followKind==='star'||T.followKind==='icon'){
      T.mode='drift';T.follow=null;T.followKind=null;T.followSect=null;T.onWarpComplete=null;
      T.vx=(Math.random()<.5?-1:1)*(1.2+Math.random()*1.8);
      T.vy=(Math.random()<.5?-1:1)*(.9+Math.random()*1.4);
      T.tx=T.vx;T.ty=T.vy;
    }
  }
  if(!T.follow)T.followKind=null;
  T.away=false;T.busyShown=false;
  var gone=(typeof lisGone==='function'&&lisGone());
  T.al+=((gone||CAMERA_MODE?0:1)-T.al)*Math.min(1,dt*6);   /* F9: mode cam = teleskop memudar (drone ikut disembunyikan di 08) */
  if(T.al>.985)T.al=1;
}
/* drawTxLines / drawTxTop didefinisikan di 08-tx-drone.js (stub lama dihapus di F9). */
/* LED beacon teleskop: idle hijau neon, TX (sektor sumber, drone docked) cyan, RX (sektor lain, link ke BH mini) pink.
   Warna dilerp halus (TELED) supaya perpindahan peran tidak loncat. Peran dari TXFX.role() (08-tx-drone.js). */
var TELED_IDLE=TELE_LED[TELE_CFG.led].slice(),TELED_TX=[110,229,255],TELED_RX=[255,154,217],TELED_SBY=[255,214,102];   /* warna idle dari setelan teleskop */
var TELED={c:TELED_IDLE.slice(),t:0};
function teleLedSet(i){TELE_CFG.led=i;TELED_IDLE=TELE_LED[i].slice();}
function teLedStep(now,role){
  var tg=role==='src'?TELED_TX:role==='rcv'?TELED_RX:role==='sby'?TELED_SBY:TELED_IDLE,dt=TELED.t?Math.min(100,now-TELED.t):100,k=reduce?1:1-Math.exp(-dt/200),i;
  if(now-TELED.t>400)k=1;
  TELED.t=now;
  for(i=0;i<3;i++)TELED.c[i]+=(tg[i]-TELED.c[i])*k;
  return Math.round(TELED.c[0])+','+Math.round(TELED.c[1])+','+Math.round(TELED.c[2]);
}
/* Badan teleskop (origin di titik pusat, sudah di-translate/rotate/scale oleh pemanggil, globalAlpha diatur pemanggil).
   Dipakai drawFloatingTelescope (canvas #sky) DAN 09-wormhole.js (digambar ulang di atas terowongan wormhole). */
function teleDrawBody(g,now){
  if(typeof tele3dBody==='function'&&tele3dBody(g,now))return;   /* badan pesawat 3D (13-scope3d.js); false -> lanjut badan 2D di bawah */
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
    var lisR=(typeof lisRed==='function')&&lisRed(now);   /* Lost-in-Space: LED merah selama star tracker belum pulih */
    var _role=(typeof TXFX!=='undefined'&&TXFX.role)?TXFX.role():null,_lc=teLedStep(now,_role);
    /* idle: kedip pendek seperti sebelumnya; TX/RX: menyala stabil dengan denyut halus + glow lebih kuat */
    var beacon=lisR?(Math.sin(now*0.02)>-0.2?1:0.3):(_role?(.78+.22*Math.sin(now*0.008)):(Math.sin(now*0.006)>0.6?1:0.15));
    if(lisR){g.fillStyle='rgba(255,60,60,'+(beacon*.35)+')';g.beginPath();g.arc(-34,0,6,0,6.283);g.fill();}
    else{g.fillStyle='rgba('+_lc+','+(beacon*(_role?.42:.24))+')';g.beginPath();g.arc(-34,0,_role?7:5,0,6.283);g.fill();}
    g.fillStyle=lisR?'rgba(255,72,72,'+beacon+')':'rgba('+_lc+','+beacon+')';
    g.beginPath();g.arc(-34,0,lisR?2.8:(_role?2.2:1.8),0,6.283);g.fill();

    /* Small service-box details: opaque and restrained. */
    g.fillStyle='rgb(91,105,114)';g.fillRect(-4,-15,9,3);g.fillRect(-3,12,8,3);
    g.fillStyle='rgb(211,220,225)';g.fillRect(0,-14,4,2);g.fillRect(0,12,4,2);
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
      var orbitRadius=(TELESCOPE.orbitR||38)*Math.max(1,TELE_CFG.size);
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
    TELESCOPE.x+=TELESCOPE.vx*dt*TELE_CFG.spd;   /* spd/spin: setelan hover teleskop */
    TELESCOPE.y+=TELESCOPE.vy*dt*TELE_CFG.spd;
    TELESCOPE.ang+=TELESCOPE.va*dt*TELE_CFG.spin;

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
  var sc=Math.max(.36,Math.min(.48,W/600))*lensMag*TELE_CFG.size;
  TELESCOPE.sc=sc;   /* dipakai 09-wormhole.js untuk menggambar teleskop di atas terowongan */

  /* Small distant scene object; still participates fully in Gargantua's gravity. */
  var copies=[[0,0]];
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
  var primaryTQ=lens(TELESCOPE.x,TELESCOPE.y);
  if(primaryTQ&&primaryTQ[0]!=null){
    TELESCOPE.sx=primaryTQ[0];TELESCOPE.sy=primaryTQ[1];
  }else{
    TELESCOPE.sx=TELESCOPE.x;TELESCOPE.sy=TELESCOPE.y;
  }
  TELESCOPE.hitR=telescopeHitRadius();
  /* TX lines digambar di drawTxLines() setelah portal sx/sy di-set */

  /* Gambar DITUNDA: badan teleskop digambar di drawFloatingTelescopeTop() (dipanggil paling akhir di frame(), setelah rasi/bintang/garis/portal/BH/drone),
     supaya teleskop selalu di atas semuanya. Di sini cuma simpan bahan gambarnya. */
  TELE_DRAW={copies:copies,sc:sc};
}

/* Pass gambar teleskop (lapisan paling atas canvas #sky). Posisi/skala/lensing sama persis dengan versi lama; logika gerak tetap di drawFloatingTelescope(). */
var TELE_DRAW=null;
function drawFloatingTelescopeTop(now){
  var D=TELE_DRAW;TELE_DRAW=null;
  if(!D||!(TELESCOPE.al>.02))return;
  if(TELESCOPE.dive)return;   /* selama transisi portal, teleskop digambar di kanvas wormhole (09-wormhole.js) */
  var copies=D.copies,sc=D.sc,al=TELESCOPE.al;
  for(var ci=0;ci<copies.length;ci++){
    var tqx=TELESCOPE.x+copies[ci][0],tqy=TELESCOPE.y+copies[ci][1];
    var tq=lens(tqx,tqy);
    if(!tq)continue;

    g.save();
    g.translate(tq[0],tq[1]);
    g.rotate(TELESCOPE.ang);
    g.scale(sc,sc);
    g.globalAlpha=al;

    teleDrawBody(g,now);

    g.restore();
  }
}

/* ---------- [FITUR 2] Synthesizer Chime untuk Bintang Biasa (Web Audio) ---------- */
function playStarChime(s){
  try{UIS.chime((ALIGN.cid&&ALIGN.next>0)?ALIGN.next-1:0);return;}catch(eUC){}   /* UIS belum termuat -> jatuh ke chime lama di bawah */
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

/* ---------- [FITUR 4] Tactical Target Lock Reticle + Data Astronomi ---------- */
var STAR_DATA = SKY.STAR_DATA;

/* Posisi panel HUD (LOCK/DIST/SPEC) relatif ke bintang. Coba beberapa sisi berurutan (HP: bawah/atas dulu,
   desktop: sisi yang berlawanan dengan nama bintang dulu), jepit ke area kelihatan vb=[x0,y0,x1,y1], lalu pilih
   yang tidak menyentuh zona reticle (radius R). Kalau semua menyentuh, ambil yang paling longgar. */
function hudPlace(sx,sy,R,pw,ph,vb,mobile,labelRight){
  var gp=4,below=[-pw*.5,R+gp],above=[-pw*.5,-R-gp-ph],right=[R+gp,-ph*.5],left=[-R-gp-pw,-ph*.5];
  var side=labelRight?[left,right]:[right,left];
  var order=mobile?[below,above].concat(side):side.concat([below,above]);
  var best=null,bestShort=1e9,i;
  for(i=0;i<order.length;i++){
    var rx=order[i][0],ry=order[i][1];
    var loX=vb[0]-sx,hiX=vb[2]-sx-pw,loY=vb[1]-sy,hiY=vb[3]-sy-ph;
    rx=hiX<loX?loX:Math.max(loX,Math.min(hiX,rx));
    ry=hiY<loY?loY:Math.max(loY,Math.min(hiY,ry));
    var dx=rx>0?rx:(rx+pw<0?-(rx+pw):0),dy=ry>0?ry:(ry+ph<0?-(ry+ph):0);
    var short=Math.max(0,R-Math.sqrt(dx*dx+dy*dy));
    if(short<bestShort){bestShort=short;best=[rx,ry];}
    if(short===0)break;
  }
  return best;
}

/* Panel HUD LOCK/DIST/SPEC: teksnya statis selama bintang yang dikunci sama. Dirender sekali ke sprite
   (set g.font + fillText tiap frame ternyata jadi baris termahal drawTargetLock di profil); tiap frame tinggal drawImage. */
var TL_HUD={key:null,c:null,pw:0,ph:34};
function tlHudSprite(l1,l2,l3,rgb){
  var key=l1+'|'+l2+'|'+l3+'|'+rgb+'|'+DPR;
  if(TL_HUD.key===key)return TL_HUD;
  var c=TL_HUD.c||(TL_HUD.c=document.createElement('canvas')),sg=c.getContext('2d');
  sg.font='600 8.5px "Courier New", monospace';
  var wMax=sg.measureText(l1).width;
  sg.font='500 7.5px "Courier New", monospace';
  wMax=Math.max(wMax,sg.measureText(l2).width,sg.measureText(l3).width);
  var pw=Math.ceil(wMax)+16,ph=34;
  c.width=Math.ceil(pw*DPR);c.height=Math.ceil(ph*DPR);   /* ganti ukuran = reset state ctx */
  sg.scale(DPR,DPR);
  sg.fillStyle='rgba(2, 8, 13, 0.55)';sg.fillRect(0,0,pw,ph);
  sg.strokeStyle='rgba('+rgb+', 0.45)';sg.lineWidth=0.8;
  sg.beginPath();sg.moveTo(0.5,0);sg.lineTo(0.5,ph);sg.stroke();
  sg.textAlign='left';sg.textBaseline='alphabetic';
  sg.font='600 8.5px "Courier New", monospace';
  sg.fillStyle='rgba('+rgb+', 0.95)';sg.fillText(l1,8,12);
  sg.font='500 7.5px "Courier New", monospace';
  sg.fillStyle='rgba(184, 224, 238, 0.8)';sg.fillText(l2,8,22);sg.fillText(l3,8,31);
  TL_HUD.key=key;TL_HUD.pw=pw;TL_HUD.ph=ph;
  return TL_HUD;
}
function drawTargetLock(now){
  if(typeof OBSERVE_MODE!=='undefined'&&OBSERVE_MODE)return;
  if(reduce || SW) return;
  var activeKey = null;
  if(activeSfx && !activeSfx.paused && !activeSfx.ended){
    activeKey = keyFromAudio(activeSfx);
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
    ? plStarByName(tr.star) 
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

  // Telemetry HUD Text — panel diukur dari lebar teks asli, dijepit ke area layar yang kelihatan,
  // dan dijauhkan dari reticle (lingkaran + bracket) supaya frame & teks nggak numpuk / kepotong.
  var _upT=uprBegin(x,y);
  g.save();
  g.textAlign = 'left'; g.textBaseline = 'alphabetic';
  var isMobile = (W < 600 || H < 520);
  var l1 = 'LOCK: ' + d.name;
  var l2 = 'DIST: ' + d.dist;
  var l3 = 'SPEC: ' + d.spec + ' (MAG ' + d.mag + ')';
  var hs = tlHudSprite(l1, l2, l3, tr.rgb);
  var pw = hs.pw, ph = hs.ph;
  /* Batas area kelihatan di ruang tempat teks digambar (layar tegak). Landscape HP (stage diputar):
     petakan kotak virtual [margin..W-margin]x[margin..H-footer] ke koordinat layar. */
  var sp0 = [x, y], vb = [8, 8, W - 8, H - 35];
  if(STG.rot){
    var pA = v2c(vb[0], vb[1]), pB = v2c(vb[2], vb[3]);
    sp0 = v2c(x, y);
    vb = [Math.min(pA[0], pB[0]), Math.min(pA[1], pB[1]), Math.max(pA[0], pB[0]), Math.max(pA[1], pB[1])];
  }
  var pos = hudPlace(sp0[0], sp0[1], sz * 1.45 + 6, pw, ph, vb, isMobile, !!(s.nx && s.nx > 0));
  var tx = x + pos[0], ty = y + pos[1];   /* pojok kiri-atas panel */

  g.drawImage(hs.c, tx, ty, hs.c.width / DPR, hs.c.height / DPR);

  g.restore();
  uprEnd(_upT);
}

function drawShooting(now){
  if(reduce||IS_POTATO)return;
  if(!idleMode&&(now-lastActivity)>IDLE_MS)idleMode=true;
  if(idleMode)return; /* Energy saver: no new shooting stars while idle */
  /* Shooting stars stay alive during star SFX and constellation alignment too
     (they used to be gated by secondaryFxScale). */
  if(now>nextSS&&!SW){
    /* BGM on: jarak acak tapi lebih sering; jumlah meteor aktif dibatasi (lebih ketat di HP kecil). */
    var ofxOn=OFX.p>.35,ofxCap=W<500?2:4;
    nextSS=now+(ofxOn?(W<500?3300+Math.random()*3700:2000+Math.random()*3200):6000+Math.random()*7000);
    if(!(ofxOn&&SS.length>=ofxCap)){
      var ang=(.14+Math.random()*.14)*Math.PI,sp=560+Math.random()*320,dir=Math.random()<.5?1:-1;
      var nm={x:dir>0?Math.random()*W*.6:W-Math.random()*W*.6,y:Math.random()*H*.35,vx:Math.cos(ang)*sp*dir,vy:Math.sin(ang)*sp,t:now,life:850};
      nm.c0=OFX.m0;nm.c1=OFX.m1;
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
/* Pusat orbit = anchor home BH (BH.hx/hy), diproyeksikan lewat skyXF (pan/rotate/zoom). BHK ikut seperti camBH() supaya mode kamera
   tetap sinkron; di luar mode kamera BHK=0 jadi anchor diam di tengah langit, nggak ikut BH mini yang di-drag / di-summon. */
function astAnchor(){
  var px=BH.hx+skyPan.x*BHK,py=BH.hy+skyPan.y*BHK;
  if(skyZoom===1)return [px,py];
  var cx=W*.5,cy=H*.5;
  return [cx+(px-cx)*skyZoom,cy+(py-cy)*skyZoom];
} /* sama persis dengan camBH() (tanpa rotasi: BH digambar tegak), tapi pakai home BH.hx/hy */
/* Skala kedalaman mulus dari sin(t): jauh (-1) kecil, dekat (+1) besar -> kesan perspektif. */
function astDepth(s){return .52+.62*(s+1)/2;}
/* Posisi layar 1 batu: elips (rr, rr*e) diputar BH.ang(+upAng di landscape) = bidang yang sama dengan cakram. out.s = sin(t): <0 = separuh belakang. */
function astPlace(a,now,c,out){
  var T=AST_CFG.t,rk=a.rb?a.rb*Math.max(.06,.63+(a.k-.63)*T):a.r,ee=Math.max(.12,Math.min(.75,.40+(a.e-.40)*T)); /* T = ketebalan cincin: sebaran radius + sebaran kemiringan elips */
  var t=(a.ph||0)+a.seed,rr=rk*AST_K*AST_CFG.w*(1+.035*Math.sin(now*.0007+a.seed))*skyZoom;
  var ex=Math.cos(t)*rr,ey=Math.sin(t)*rr*ee,ba=BH.ang+upAng(),ca=Math.cos(ba),sa=Math.sin(ba); /* + upAng(): landscape (stage diputar 90deg) bidang sabuk ikut tegak bareng cakram BH (sama dgn 03-gargantua: BH.ang+upAng()); portrait/desktop upAng()=0 */
  out.x=c[0]+ex*ca-ey*sa;out.y=c[1]+ex*sa+ey*ca;out.s=Math.sin(t);
  return out;
}
var _astP={x:0,y:0,s:0};
/* Mode kamera: batu cuma dekorasi dan area pandang sempit (ketutup kartu/panel), jadi hanya AST_CAM_MAX batu pertama yang di-step, digambar, dan bisa di-tap.
   Sisanya dibekukan (bukan dihapus) dan lanjut lagi begitu kamera mati. Batu memang sudah berupa sprite ter-bake (drawImage), bukan poligon. */
var AST_CAM_MAX=12;
function astN(){return CAMERA_MODE?Math.min(AST.length,AST_CAM_MAX):AST.length;}
function asteroidScreenAt(x,y){
  if(!AST.length||!AST_CFG.on)return -1;
  var best=-1,bd=Infinity,nA=astN();
  for(var i=0;i<nA;i++){
    var a=AST[i];
    if(!a._vis||a._fa<.25)continue; /* disembunyikan (di luar layar / di dalam horizon / hampir pudar karena zoom) = nggak bisa di-tap */
    var d=Math.hypot(x-a._x,y-a._y);
    if(d<Math.max(8,a._sz*1.9)&&d<bd){bd=d;best=i;}
  }
  return best;
}
function scatterAsteroid(i,x,y){
  if(i<0||!AST[i]||SW)return false;
  var a=AST[i],now=performance.now(),c=astAnchor(),p=astPlace(a,now,c,_astP);
  var dx=p.x-c[0],dy=p.y-c[1],dl=Math.hypot(dx,dy)||1;
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
/* Tap = AREA: semua batu dalam radius R dari titik tap ditendang menjauhi jari (makin dekat makin kuat). Haptic cuma sekali. */
function scatterAsteroidArea(x,y,R){
  if(SW||!AST.length||!AST_CFG.on)return 0;
  var now=performance.now(),c=astAnchor(),n=0,nA=astN();
  for(var i=0;i<nA;i++){
    var a=AST[i];
    if(!a._vis)continue;
    var dx=a._x-x,dy=a._y-y,d=Math.hypot(dx,dy);
    if(d>=R)continue;
    if(d<1){dx=a._x-c[0];dy=a._y-c[1];d=Math.hypot(dx,dy)||1;} /* tepat di titik tap: jatuh ke arah menjauhi pusat */
    var nx=dx/d,ny=dy/d,tx=-ny,ty=nx,f=1-.5*Math.min(1,d/R);
    var kick=(240+Math.random()*100)*f,side=(Math.random()-.5)*60;
    a.vx=nx*kick+tx*side;
    a.vy=ny*kick+ty*side;
    a.ox=Math.max(-70,Math.min(70,a.ox));
    a.oy=Math.max(-70,Math.min(70,a.oy));
    a.kick=1;a.kickUntil=now+700;
    n++;
  }
  if(n)haptic(6);
  return n;
}
/* Bake a small set of rocky asteroid sprites once. Per-frame cost is then only
   translate/rotate/drawImage (+ the cheap spring for kick/scatter). Visual
   matches the previous live polygon+gradient path. */
function ensureAsteroidSprites(){
  if(AST_SPRITES&&AST_SPRITES.length)return AST_SPRITES;
  var n=8,list=[],back=[];
  for(var si=0;si<n;si++){
    var sides=6+(si%5),seed=si*1.618+0.37;
    /* ---- DEPAN: besar, tajam, detail penuh (facet, kawah, rim light hangat dari sisi BH) ---- */
    var R=AST_SPRITE_R,pad=Math.ceil(R*1.55+6),size=pad*2,sc=document.createElement('canvas');
    sc.width=sc.height=size;
    var sg=sc.getContext('2d');
    sg.translate(pad,pad);
    sg.shadowColor='rgba(0,0,0,.95)';
    sg.shadowBlur=Math.max(1.5,R*1.15);
    var rock=sg.createLinearGradient(-R,-R,R,R);
    rock.addColorStop(0,'rgba(92,96,95,1)');
    rock.addColorStop(.28,'rgba(42,44,44,1)');
    rock.addColorStop(.68,'rgba(15,16,17,1)');
    rock.addColorStop(1,'rgba(4,5,6,1)');
    sg.fillStyle=rock;
    sg.strokeStyle='rgba(3,4,5,1)';
    sg.lineWidth=Math.max(.7,R*.10);
    var pts=[];
    sg.beginPath();
    for(var k=0;k<sides;k++){
      var aa=k*Math.PI*2/sides;
      var rr2=R*(.70+.38*Math.sin(k*9.71+seed)+.10*Math.cos(k*4.17+seed*1.7));
      var px=Math.cos(aa)*rr2,py=Math.sin(aa)*rr2*.72;pts.push([px,py]);
      if(k===0)sg.moveTo(px,py);else sg.lineTo(px,py);
    }
    sg.closePath();sg.fill();sg.stroke();
    sg.shadowBlur=0;
    /* rim light hangat di sisi kiri-atas (menghadap cakram) */
    sg.strokeStyle='rgba(255,196,128,.34)';sg.lineWidth=Math.max(.5,R*.07);
    sg.beginPath();for(k=0;k<=Math.ceil(sides/2);k++){var q=pts[(k+sides-Math.floor(sides/4))%sides];if(k===0)sg.moveTo(q[0],q[1]);else sg.lineTo(q[0],q[1]);}sg.stroke();
    sg.fillStyle='rgba(150,154,151,.20)';
    sg.beginPath();sg.moveTo(-R*.58,-R*.08);sg.lineTo(-R*.12,-R*.55);sg.lineTo(R*.18,-R*.26);sg.lineTo(-R*.08,R*.02);sg.closePath();sg.fill();
    sg.fillStyle='rgba(0,0,0,.88)';
    sg.beginPath();sg.arc(R*.18+Math.sin(seed)*R*.1,-R*.12,Math.max(.35,R*.15),0,6.283);sg.fill();
    sg.beginPath();sg.arc(-R*.27,R*.18,Math.max(.28,R*.10),0,6.283);sg.fill();
    sg.beginPath();sg.arc(R*.38,R*.2,Math.max(.25,R*.07),0,6.283);sg.fill();
    sg.strokeStyle='rgba(180,185,182,.26)';sg.lineWidth=Math.max(.3,R*.045);
    sg.beginPath();sg.moveTo(-R*.35,-R*.34);sg.lineTo(R*.22,-R*.48);sg.moveTo(-R*.2,R*.32);sg.lineTo(R*.12,R*.12);sg.stroke();
    list.push({c:sc,pad:pad,R:R});
    /* ---- BELAKANG: resolusi rendah (jadi lembut), siluet polos, tanpa kawah/facet, agak kebiruan seperti kabut jauh ---- */
    var Rb=9,padb=Math.ceil(Rb*1.5+3),bc=document.createElement('canvas');
    bc.width=bc.height=padb*2;
    var bg2=bc.getContext('2d');
    bg2.translate(padb,padb);
    var bgr=bg2.createRadialGradient(-Rb*.3,-Rb*.3,0,0,0,Rb*1.1);
    bgr.addColorStop(0,'rgba(58,66,76,1)');bgr.addColorStop(.6,'rgba(26,30,36,1)');bgr.addColorStop(1,'rgba(10,12,15,1)');
    bg2.fillStyle=bgr;
    bg2.beginPath();
    for(k=0;k<sides-1;k++){
      var ab=k*Math.PI*2/(sides-1),rb=Rb*(.78+.2*Math.sin(k*7.3+seed));
      var bx=Math.cos(ab)*rb,by=Math.sin(ab)*rb*.76;
      if(k===0)bg2.moveTo(bx,by);else bg2.lineTo(bx,by);
    }
    bg2.closePath();bg2.fill();
    back.push({c:bc,pad:padb,R:Rb});
  }
  AST_SPRITES=list;AST_SPRITES.back=back;
  return list;
}
/* Radius orbit dasar 1 batu (sebelum pengali lebar/zoom) */
function astRk(a){return a.rb?a.rb*Math.max(.06,.63+(a.k-.63)*AST_CFG.t):a.r;}
/* Faktor laju orbit: diikat ke RADIUS ORBIT (konstan per batu), bukan jarak layar -> batu satu cincin sama lambat, nggak ada yang menyusul/numpuk.
   1 = normal (jauh dari BH), AST_SLOW_MIN = hampir diam di dekat horizon. Zona: 1.6R .. 9.5R. */
var AST_SLOW_MIN=.08;
function astSlow(rk,R){
  if(R<1)return 1;
  var u=Math.max(0,Math.min(1,(rk*AST_K*AST_CFG.w*skyZoom/R-1.6)/7.9));
  return AST_SLOW_MIN+(1-AST_SLOW_MIN)*u*u*(3-2*u);
}
/* Satu langkah per frame: posisi + spring semua batu dihitung sekali (di pass belakang / pass tunggal), pass depan tinggal pakai hasilnya.
   Batu di luar layar (cincin seluruhnya di luar, atau posisinya di luar + bukan zona lensing) = a._vis 0: nggak dihitung lens/spring, nggak digambar. */
function astStep(now){
  var dtc=AST_TL?Math.min(100,Math.max(0,now-AST_TL)):0;AST_TL=now;AST_T+=dtc*AST_CFG.spd; /* AST_T cuma dipakai sbg fase awal batu baru */
  var c=astAnchor(),p=_astP,bp=camBH(),R=BH.Rr*(BHZ||1),T=AST_CFG.t,mg=200,
      dmax=Math.max(Math.hypot(c[0],c[1]),Math.hypot(W-c[0],c[1]),Math.hypot(c[0],H-c[1]),Math.hypot(W-c[0],H-c[1]))+mg,
      lz=R*9.5+mg;lz*=lz;
  var nAst=astN();
  for(var i=0;i<nAst;i++){
    var a=AST[i],rk=astRk(a);
    /* fase per batu (diintegrasi): ganti slider / zoom / ukuran BH nggak bikin batu loncat */
    a.ph=(a.ph==null?AST_T*a.spd:a.ph)+dtc*AST_CFG.spd*a.spd*astSlow(rk,R);
      /* cull tingkat cincin: titik terdekat cincin ke pusat = rr*ee; kalau sudah lewat sudut layar terjauh, tak ada bagian cincin yang kelihatan */
      var ee=Math.max(.12,Math.min(.75,.40+(a.e-.40)*T));
      if(rk*AST_K*AST_CFG.w*skyZoom*.96*ee>dmax){a._vis=0;a.ox=a.oy=a.vx=a.vy=0;a.kick=0;a._lastNow=now;continue;}
      /* zoom tinggi (>x6): sebagian besar cincin "di luar layar", tersisa ±15-20% di x10 yang sesekali melintas. Hash golden-ratio per batu = stabil.
         Pudar mulus per batu (alpha dikali di drawAsteroids, 0 biaya tambahan) mengikuti zoom, bukan pop. */
      var fa=1;
      if(skyZoom>6){
        var zk=Math.min(1,(skyZoom-6)/4);
        fa=Math.max(0,Math.min(1,(1.15-.85*zk-(i*.618034)%1)/.15));
        if(fa<=.01){a._vis=0;a._fa=0;a.ox=a.oy=a.vx=a.vy=0;a.kick=0;a._lastNow=now;continue;}
      }
      a._fa=fa;
    astPlace(a,now,c,p);
    var x=p.x,y=p.y,z=astDepth(p.s),sz=a.sz*z*(skyZoom<=3?skyZoom:3*Math.sqrt(skyZoom/3))*AST_CFG.sz,vis=1;   /* ukuran batu tumbuh melambat di atas x3 (x10 = 5.5x, bukan 10x) */
      var dx0=x-bp[0],dy0=y-bp[1];
      if(dx0*dx0+dy0*dy0>lz){
        /* jauh dari BH (di luar zona lensing): kalau di luar layar, lewati sisanya */
        if(x<-mg||x>W+mg||y<-mg||y>H+mg){vis=0;a.ox=a.oy=a.vx=a.vy=0;a.kick=0;a._lastNow=now;a._vis=0;continue;}
      }else if(p.s<0){
        /* lensing cuma untuk batu BELAKANG BH (batu yang lewat di depan nggak dibelokkan) */
        var L=lens(x,y);
        if(L){
          var d0=Math.sqrt(dx0*dx0+dy0*dy0)||1,f=Math.hypot(L[0]-bp[0],L[1]-bp[1])/d0;
          x=L[0];y=L[1];sz*=1+.35*Math.min(1,f-1); /* sedikit membesar dekat BH */
        }else vis=0; /* di dalam horizon: tersembunyi di balik lubang */
      }
    /* Damped spring: the rock gets one impulse, flies a little, then settles back. */
    var last=a._lastNow||now,dt=Math.min(.032,Math.max(.001,(now-last)/1000));
    a._lastNow=now;
    var spring=5.0,damper=4.5;
    a.vx+=(-spring*a.ox-damper*a.vx)*dt;
    a.vy+=(-spring*a.oy-damper*a.vy)*dt;
    a.ox+=a.vx*dt;a.oy+=a.vy*dt;
    if(a.kick&&now>a.kickUntil)a.kick=0;
    if(Math.abs(a.ox)+Math.abs(a.oy)<.12&&Math.abs(a.vx)+Math.abs(a.vy)<1.2){a.ox=a.oy=a.vx=a.vy=0;a.kick=0;}
    a._x=x+a.ox;a._y=y+a.oy;a._sz=sz;a._back=p.s<0;a._s=p.s;a._vis=vis;
  }
  AST._stamp=now;
}
/* half: -1 = separuh belakang (gambar SEBELUM Rasi/BH, lebih redup), 1 = separuh depan (SESUDAH BH), 0/undefined = semua sekaligus. */
var AST_DRAWN=0;   /* jumlah batu yang benar-benar di-drawImage pada frame ini (dibaca probe) */
function drawAsteroids(now,half){
  if(!AST.length||!AST_CFG.on||(typeof PX!=='undefined'&&PX.ast))return;
  half=half|0;
  if(half<=0||AST._stamp!==now)astStep(now);
  if(typeof ast3dDraw==='function'&&ast3dDraw(now,half))return;   /* batu 3D (12-ast3d.js, lazy); false = sprite 2D di bawah */
  var sprites=ensureAsteroidSprites(),bsp=sprites.back;
  /* Hemat panggilan canvas: 300 batu x (save+alpha+translate+rotate+drawImage+restore) = 1800 call/pass di WebView lemah.
     Sekarang satu save/restore untuk seluruh loop, lalu per batu cuma setTransform (= translate+rotate digabung, matriks dasar M dibaca sekali) + alpha + drawImage.
     Hasil gambar identik: M * T(x,y) * R(th). */
  var m0=g.getTransform?g.getTransform():null,A0=g.globalAlpha,
      ma=m0?m0.a:1,mb=m0?m0.b:0,mc=m0?m0.c:0,md=m0?m0.d:1,me=m0?m0.e:0,mf=m0?m0.f:0;
  if(!m0){   /* fallback tanpa getTransform: jalur lama */
    for(var i0=0,nA0=astN();i0<nA0;i0++){
      var a0=AST[i0];
      if(!a0._vis)continue;
      if(half<0&&!a0._back)continue;
      if(half>0&&a0._back)continue;
      var sj=(a0.sprite|0)%sprites.length,sq=a0._back?bsp[sj]:sprites[sj],hq=sq.pad*(a0._sz/sq.R);
      g.save();
      if(a0._back)g.globalAlpha*=.86+.36*a0._s; else g.globalAlpha*=Math.min(1,.9+.1*a0._s);
      g.globalAlpha*=(a0._fa==null?1:a0._fa);
      g.translate(a0._x,a0._y);g.rotate(a0.rot+now*a0.rs);
      g.drawImage(sq.c,-hq,-hq,hq*2,hq*2);
      g.restore();
    }
    return;
  }
  g.save();
  for(var i=0,nA1=astN();i<nA1;i++){
    var a=AST[i];
    if(!a._vis)continue;
    if(half<0&&!a._back)continue;
    if(half>0&&a._back)continue;
    var si2=(a.sprite|0)%sprites.length,sp=a._back?bsp[si2]:sprites[si2];
    var scale=a._sz/sp.R,hf=sp.pad*scale;
    /* Cull layar ketat: margin cull di astStep (200px) cuma buat hitung lensing; batu yang kotaknya sepenuhnya di luar kanvas tidak kelihatan -> jangan digambar. */
    if(a._x+hf<0||a._x-hf>W||a._y+hf<0||a._y-hf>H)continue;
    AST_DRAWN++;
    /* belakang: makin jauh (sin t -> -1) makin redup + kecil; depan: sedikit lebih terang saat paling dekat */
    g.globalAlpha=A0*(a._back?.86+.36*a._s:Math.min(1,.9+.1*a._s))*(a._fa==null?1:a._fa);
    var th=a.rot+now*a.rs,co=Math.cos(th),si=Math.sin(th),x=a._x,y=a._y;
    g.setTransform(ma*co+mc*si,mb*co+md*si,mc*co-ma*si,md*co-mb*si,ma*x+mc*y+me,mb*x+md*y+mf);
    g.drawImage(sp.c,-hf,-hf,hf*2,hf*2);
  }
  g.restore();   /* transform + alpha kembali ke kondisi sebelum loop */
}

function drawTriggerVisuals(now){
  if(SECT.on)return;
  (OFX.keys||(OFX.keys=Object.keys(TRIGGERS))).forEach(function(key){
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
/* ---------- Teks nama rasi (watermark) di viewport sektor ----------
   Nama rasi (CONS_LABELS di sky-data.js) huruf renggang "O R I O N" / "C A N I S  M A J O R" / "P L E I A D E S", horizontal atau vertikal
   (acak tapi tetap per rasi; bisa dipaksa lewat field nameDir:'h'|'v' di RASI sky-data.js), tipis, di lapisan paling bawah rasi.
   Di-render SEKALI ke canvas kecil (sprite) lalu per frame cuma drawImage; warna ikut sky sektor. */
var NAME_SPR={},NAME_FS=48;
var NAME_AL=.2,NAME_ALF=.34; /* opacity dasar nama rasi / saat difokus kamera. Naikin kalau masih tipis */
function nameMix(rgb){var p=rgb.split(','),t=[205,232,255],o=[],i;for(i=0;i<3;i++)o.push(Math.round(+p[i]*.6+t[i]*.4));return o.join(',');} /* warna sky sektor digeser ke biru muda supaya kebaca */
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){NAME_SPR={};});
function consNameVert(id){
  var r=SKY.rasiBy[id];if(r&&r.nameDir)return r.nameDir==='v';
  var h=0,i;for(i=0;i<id.length;i++)h=(h*31+id.charCodeAt(i))|0;
  return ((h>>>3)&1)===1;
}
function consNameText(id){var r=SKY.rasiBy[id];return String(CONS_LABELS[id]||(r&&r.name)||id).toUpperCase();} /* nama RASI (bukan nama bintang fokus): Canis Major, Scorpius, Canis Minor, dst */
function consSkyRgb(id){for(var i=0;i<SECT.list.length;i++){var s=SECT.list[i];if(s.sky&&s.ids.indexOf(id)>=0)return s.sky.rgb;}return '184,198,214';}
function consNameSprite(id){
  var vert=consNameVert(id),k=id+(vert?'v':'h'),e=NAME_SPR[k];
  if(e)return e;
  var txt=consNameText(id),rgb=nameMix(consSkyRgb(id)),FS=NAME_FS,gap=FS*.62,pad=8,i;
  var m=document.createElement('canvas').getContext('2d');
  m.font='700 '+FS+'px "Space Grotesk",system-ui,sans-serif';
  var ws=[],tot=0;
  for(i=0;i<txt.length;i++){var w=m.measureText(txt[i]).width;ws.push(w);tot+=w;}
  tot+=gap*(txt.length-1);
  var L=Math.ceil(tot)+pad*2,T=Math.ceil(FS*1.2)+pad*2;
  var c=document.createElement('canvas');c.width=vert?T:L;c.height=vert?L:T;
  var x=c.getContext('2d');
  x.font=m.font;x.fillStyle='rgb('+rgb+')';x.textBaseline='middle';x.textAlign='left';
  if(vert){x.translate(T/2,0);x.rotate(Math.PI/2);}else x.translate(0,T/2);
  var px=pad;
  for(i=0;i<txt.length;i++){x.fillText(txt[i],px,0);px+=ws[i]+gap;}
  e=NAME_SPR[k]={c:c,vert:vert,em:tot/FS};
  return e;
}
/* t1/t2 = pojok bbox rasi di layar (stage). al = opacity dasar. now = penanda frame (buat daftar label yang sudah digambar).
   Posisi: tengah bbox; kalau keluar layar dijepit masuk, kalau nabrak label rasi lain digeser ke bawah/atas/samping bbox. */
var NAME_R=[],NAME_T=-1;
function drawNameBox(id,t1,t2,al,now){
  if(!(al>.005))return;
  var cx=(t1[0]+t2[0])*.5,cy=(t1[1]+t2[1])*.5,bw=Math.abs(t2[0]-t1[0]),bh=Math.abs(t2[1]-t1[1]);
  if(!cullIn(cx,cy,Math.max(bw,bh)*.7+40))return;
  var sp=consNameSprite(id);
  /* span utama teks searah layar tegak: landscape HP memutar stage 90deg -> bw/bh tertukar */
  var span=sp.vert?(STG.rot?bw:bh):(STG.rot?bh:bw);
  var fs=Math.max(9,Math.min(30,span*.92/sp.em)); /* clamp() global cuma 1 argumen (0..1), jadi jangan dipakai buat rentang */
  var s=fs/NAME_FS,dw=sp.c.width*s,dh=sp.c.height*s;
  var rw=STG.rot?dh:dw,rh=STG.rot?dw:dh; /* ukuran teks di ruang stage (tegak di layar) */
  if(now!==NAME_T){NAME_T=now;NAME_R.length=0;}
  var gp=3,mx=6,my=6,myb=H-40,i,j,best=null;
  var cand=[[0,0],[0,bh*.5+rh*.5+gp],[0,-(bh*.5+rh*.5+gp)],[bw*.5+rw*.5+gp,0],[-(bw*.5+rw*.5+gp),0]];
  for(i=0;i<cand.length;i++){
    var px=Math.max(mx+rw*.5,Math.min(W-mx-rw*.5,cx+cand[i][0])),py=Math.max(my+rh*.5,Math.min(myb-rh*.5,cy+cand[i][1]));
    var r0=[px-rw*.5,py-rh*.5,px+rw*.5,py+rh*.5],hit=false;
    for(j=0;j<NAME_R.length;j++){var q=NAME_R[j];if(r0[0]<q[2]+2&&r0[2]>q[0]-2&&r0[1]<q[3]+2&&r0[3]>q[1]-2){hit=true;break;}}
    if(!best)best=[px,py,r0]; /* kandidat pertama (tengah, sudah dijepit) = cadangan kalau semua nabrak */
    if(!hit){best=[px,py,r0];break;}
  }
  NAME_R.push(best[2]);
  var up=uprBegin(best[0],best[1]),pa=g.globalAlpha;
  g.globalAlpha=pa*al;
  g.drawImage(sp.c,best[0]-dw/2,best[1]-dh/2,dw,dh);
  g.globalAlpha=pa;
  uprEnd(up);
}
/* Rasi ini lagi SFX aktif? Cocokkan activeSfx dgn SFX[triggerKey] bintang-bintangnya (triggerKey = starKeyOf, sama persis dgn drawStars).
   Daftar triggerKey di-cache di c._sfxKeys supaya tidak scan tiap frame. */
function consSfxOn(c){
  if(!activeSfx||activeSfx.paused||activeSfx.ended)return false;
  var ks=c._sfxKeys,i;
  if(!ks){
    ks=[];
    (c._keys||(c._keys=Object.keys(c.stars))).forEach(function(k){var t=starKeyOf(k);if(t&&ks.indexOf(t)<0)ks.push(t);});
    c._sfxKeys=ks;
  }
  for(i=0;i<ks.length;i++)if(SFX[ks[i]]&&activeSfx===SFX[ks[i]])return true;
  return false;
}
/* Fade halus faktor tampil nama (c._nA / PLEIADES._nA) mengejar target nT; pola sama dgn s._la di label bintang. reduce => langsung. */
function nameFadeStep(o,nT,now){
  var cur=o._nA||0;
  if(reduce)cur=nT;
  else{var dt=Math.min(.1,(now-(o._nAt||now))/1000);cur+=(nT-cur)*Math.min(1,dt*9);if(nT===0&&cur<.004)cur=0;}
  o._nA=cur;o._nAt=now;
  return cur;
}
/* Garis rasi tampil? (fase 6)
   - Mode cam: ikut tombol GARIS saja; SFX nyala/mati tidak ngaruh (di mode 🎮 GARIS dipaksa ON).
   - Di luar cam: rasi yang SFX-nya lagi bunyi, atau semua rasi saat BGM constellation.opus nyala (tanpa SFX).
   - Pengecualian: reveal lagi jalan (alignment selesai / cheat Konami) supaya animasinya tetap kelihatan.
   - Rasi yang masih "terkunci" di mode 🎮 nggak punya garis (diganti pulse petunjuk). */
function linesVisible(c){
  if(typeof isLayoutEdit==='function'&&isLayoutEdit())return true;   /* editor layout (?layout=1): garis SELALU tampil (preview = perilaku live) */
  if(consLocked(c.id))return false;
  if(c._reveal!=null)return true;
  return CAMERA_MODE?CAM_LINES:(consSfxOn(c)||(AT.bgm&&!AT.sfx));   /* di luar cam: rasi SFX aktif, atau semua rasi saat constellation.opus (tanpa SFX) */
}
/* ================= animTier (fase 6): level animasi per rasi =================
   FULL = halo bintang + napas rasi (BGM constellation) + kilau garis + pulse PU/spark. IDLE = cuma inti bintang + kedip halus + sway.
   Mode cam   : fokus/springback ON -> semua rasi tenang (IDLE, sway berhenti); fokus OFF (free) -> semua FULL. SFX nyala/mati tidak ngaruh di cam.
   Di luar cam: ada SFX bunyi -> cuma rasi SFX itu FULL; tanpa SFX -> semua FULL kalau BGM (constellation / collapsars) nyala, selain itu IDLE.
   Faktor FULL (c._fK) di-ease 0..1 supaya perubahan tier nggak pop. Sway tetap jalan di semua tier kecuali fokus cam. */
/* Halo bintang: IDLE / cam free ~1x = tipis & kecil (HALO_IDLE_*), FULL = penuh. Cam fokus / auto-zoom fit = tanpa halo, inti lebih terang. */
var HALO_IDLE_S=.55,HALO_IDLE_A=.5,CAM_HALO_Z0=1.15,CAM_HALO_Z1=.55,CAM_IDLE_FOCUS=.24;   /* CAM_IDLE_FOCUS = kecerahan rasi di idle (CF idle .24): cam free ~1x harus sama dengan idle, baru naik ke 1 bareng halo hilang */   /* ukuran, alpha halo tipis; halo cam memudar antara zoom 1.15x dan 1.7x */
var CAM_RET_GAP=1.5,CAM_RET_ARM=16;   /* retikel silang cam: jarak mulai lengan = 1.15x cincin terluar lensa; panjang lengan minimal 12px (atau 45% radius lensa) */
var AMB_TW=true;   /* kedip halus bintang rasi (pembeda dari bintang latar); pakai s.twinkleSpeed/Depth/Jitter yang sudah ada di data. false = mati */
var AT={t:-1,calm:false,sfx:false,bgm:false,pK:0,twT:0,swayK:1};   /* bgm = constellation.opus; pK = collapsars.opus (eased 0..1); twT = jam kedip (melambat saat collapsars) */
function animFrame(now){
  if(AT.t===now)return;
  var dt=Math.min(.1,Math.max(0,(now-(AT.t>=0?AT.t:now))/1000)),fi=FOCUS.list&&FOCUS.list[FOCUS.i],tg;
  AT.t=now;
  AT.calm=!!(CAMERA_MODE&&fi&&fi.id!=='free');
  AT.sfx=!!(activeSfx&&!activeSfx.paused&&!activeSfx.ended);
  AT.bgm=OFX.pC>.25;   /* constellation.opus nyala (eased) dan efek visual diizinkan (bukan potato / reduce / radio silence) */
  AT.pK=OFX.pK;        /* collapsars.opus: tanpa garis/napas, bintang lebih redup dan kedip lebih lambat (cuma di luar cam) */
  AT.twT+=dt*1000*(CAMERA_MODE?1:(1-.6*AT.pK));
  tg=AT.calm?0:1;
  if(reduce)AT.swayK=tg;else{AT.swayK+=(tg-AT.swayK)*Math.min(1,dt*5);if(Math.abs(tg-AT.swayK)<.003)AT.swayK=tg;}
}
function clusterSfxOn(){return !!(activeSfx&&SFX.pleione&&activeSfx===SFX.pleione&&!SFX.pleione.paused&&!SFX.pleione.ended);}
function consFullTarget(c){
  if(CAMERA_MODE)return AT.calm?0:1;
  if(AT.sfx)return (c===PLEIADES?clusterSfxOn():consSfxOn(c))?1:0;
  return AT.bgm?1:0;
}
function consFullK(c,now){
  animFrame(now);
  if(c._fKt===now)return c._fK;
  var t=consFullTarget(c),cur=(c._fK===undefined)?t:c._fK;   /* pertama kali: langsung ke target */
  if(reduce)cur=t;
  else{var dt=Math.min(.1,(now-(c._fKt||now))/1000);cur+=(t-cur)*Math.min(1,dt*5);if(Math.abs(t-cur)<.01)cur=t;}
  c._fK=cur;c._fKt=now;
  return cur;
}
/* Fade halus faktor tampil garis (c._lA) mengejar target; reduce => langsung. Garis nggak pop pas SFX mulai/selesai atau GARIS di-toggle. */
function lineFadeStep(c,nT,now){
  var cur=c._lA||0;
  if(reduce)cur=nT;
  else{var dt=Math.min(.1,(now-(c._lAt||now))/1000);cur+=(nT-cur)*Math.min(1,dt*7);if(nT===0&&cur<.004)cur=0;}
  c._lA=cur;c._lAt=now;
  return cur;
}
function drawConsName(c,age,now,ox,oy,focus,locked){
  if(locked||!(c.maxX>-1e8)||!(c.minX<1e8))return;
  /* Nama rasi cuma tampil saat cam ON atau SFX rasi ini bunyi; sisanya fade out (bukan pop). */
  var nA=nameFadeStep(c,(CAMERA_MODE||consSfxOn(c))?1:0,now);
  var a0=clamp((age-c.delay-1.6)/1.6)*focus*nA;
  if(a0<=.01)return;
  var q1=skyXF(c.minX+ox,c.minY+oy),t1=[q1[0],q1[1]]; /* skyXF() balikin array yang dipakai ulang tiap panggilan: WAJIB disalin, kalau nggak t1===t2 */
  var q2=skyXF(c.maxX+ox,c.maxY+oy),t2=[q2[0],q2[1]];
  drawNameBox(c.id,t1,t2,(CAMERA_MODE&&camFocusId()===c.id?NAME_ALF:NAME_AL)*a0,now);
}
function drawCons(c,age,now){
  var tn=now-(TD.lag[c.id]||0); /* time-dilated clock */
  var audioFocus=potatoAudioFocus();
  var focus=constellationFocus(c);
  var fK=consFullK(c,now);   /* faktor FULL rasi ini (animTier) */
  var sway=((reduce||audioFocus)?0:1)*AT.swayK;   /* sway tetap jalan di semua tier; berhenti halus cuma di fokus cam */
  var wildField=(drag.on&&drag.moved)?1:0;
  var ld=c.lead||c,tp=now-(TD.lag[ld.id]||0); /* rasi gabungan (Taurus+Auriga) pakai jam & fase yang sama => titik Elnath nggak lepas */
  var ox=Math.sin(tp*.00031+ld.phase)*3*sway+mouse.x*(7+wildField*32)+skyPan.x,oy=Math.cos(tp*.00027+ld.phase)*3*sway+mouse.y*(5+wildField*26)+skyPan.y;
  if(now<glitchUntil){ox+=(Math.random()-.5)*7;oy+=(Math.random()-.5)*4;}
  if(OFX.pK>.01){ofxPull(ld,now);ox+=OFX.px;oy+=OFX.py;} /* tarikan halus ke Gargantua */
  c.ox=ox;c.oy=oy;
  var locked=(typeof isLayoutEdit==='function'&&isLayoutEdit())?false:consLocked(c.id);
  var obr=ofxBreath(ld.phase,now)*fK; /* napas rasi: -1..1 x kehadiran BGM Constellation */
  if(c.nebula){
    var na=clamp((age-c.delay-1.2)/1.5);
    if(na>0&&nebulaIn(c.nebula.x+ox,c.nebula.y+oy,c.scale*1.5)){var nt=skyXF(c.nebula.x+ox,c.nebula.y+oy),nx=nt[0],ny=nt[1],nr=c.scale*1.5;
      var gr=g.createRadialGradient(nx,ny,0,nx,ny,nr);
      gr.addColorStop(0,'rgba(255,122,217,'+(.34*na)+')');gr.addColorStop(.5,'rgba(110,229,255,'+(.12*na)+')');gr.addColorStop(1,'rgba(110,229,255,0)');
      g.fillStyle=gr;g.beginPath();g.arc(nx,ny,nr,0,6.283);g.fill();}
  }
  drawConsName(c,age,now,ox,oy,focus,locked); /* teks nama rasi: lapisan paling bawah, di bawah garis & bintang */
  g.lineCap='round';
  /* Terkunci: garis disembunyikan, diganti pulse di tiap bintang + titik cahaya yang jalan sesuai urutan alignment. */
  if(locked)drawLockedSignal(c,age,now,ox,oy,focus);
  /* Adaptive lens samples: few when far from BH; denser only near horizon.
     One sample pass per line — glow (if any) reuses the same points. */
  var lines=c.lines,lfa=lineFadeStep(c,linesVisible(c)?1:0,now),nLines=(locked||lfa<.004)?0:lines.length;   /* garis: lihat linesVisible (cam = tombol GARIS, di luar cam = cuma rasi SFX aktif) */
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
    var audioPulse=0;   /* dulu garis berkedip ngikut bass SFX; sekarang dentuman itu diterapkan ke bintang rasi SFX (drawStars) */

    for(pass=doGlow?0:1;pass<2;pass++){
      if(pass===0){
        g.strokeStyle='rgba(110,229,255,'+(((lineHot?.14:.07) + audioPulse * 0.12)*focus*lfa*(1+.5*obr))+')';
        g.lineWidth=(lineHot?6:4) + audioPulse * 2.0;
      }
      else{
        g.strokeStyle='rgba(150,212,255,'+Math.min(1,((lineHot?.72:.42) + audioPulse * 0.25 + (reduce?0:.1*fK*Math.sin(tn*.0014+i)))*focus*lfa*(1+.32*obr))+')';
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

/* Filter pita (UV/IR). Dasar fisika: kecerlangan = geser magnitudo benda hitam (SKY.bandShift); hue = false-color per kelas suhu.
   Palet 4 bucket Teff per pita → paling banyak 8 sprite glow ter-cache (getStarSprite). Semua dihitung sekali per bintang per pita (s._bf/_bg/_bk). */
var BAND_PAL={
  uv:[[10000,'205,190,255','240,236,255'],[6500,'185,150,255','228,216,255'],[4500,'165,125,250','218,205,252'],[0,'140,100,235','205,190,248']],   /* panas = violet-putih terang, dingin = violet pekat (hampir padam) */
  ir:[[10000,'255,215,200','255,240,235'],[6500,'255,185,150','255,232,220'],[4500,'255,150,100','255,220,200'],[0,'255,110,70','255,205,185']]    /* panas = putih-rose pucat, dingin = oranye-merah menyala */
};
function bandBucket(band,T){var P=BAND_PAL[band],i;for(i=0;i<P.length-1;i++)if(T>=P[i][0])return P[i];return P[P.length-1];}
function bandFactor(s,cid,k){
  if(s._bb!==BAND){
    var ph=SKY.physOf(cid,k),bk=bandBucket(BAND,ph.teff);
    s._bf=Math.pow(10,-.4*SKY.bandShift(ph.teff,BAND));   /* >1 = lebih terang di pita ini */
    s._bg=bk[1];s._bk=bk[2];s._sp=ph.known?ph.spt:null;s._bb=BAND;
  }
  return s._bf;
}
/* Latar saat filter aktif: nebula/tint sektor adalah gambar cahaya tampak, jadi tidak valid di UV/IR → diredam satu fillRect berwarna pita
   (pola sama dengan "pass 1: dim" di sectDrawSky). Fade halus lewat BANDV; biaya per frame = 1 fillRect, 0 saat VIS. */
function sptOf(s,cid,k){if(s._sg===undefined){var ph=SKY.physOf(cid,k);s._sg=ph.known?ph.spt:null;}return s._sg;}   /* tipe spektral dari STAR_PHYS, di-cache per bintang (dipakai gerbang zoom VIS; filter UV/IR tetap lewat bandFactor) */
function plSpt(nm){var key=String(nm).toLowerCase();if(key==='pleione'){var p=SKY.physOf('pleiades','pleione');return p.known?p.spt:null;}var q=SKY.PL_PHYS[key];return q?q.spt:null;}
var BANDV=0,BANDLAST='uv',BAND_BG={uv:'8,4,26',ir:'26,6,4'};
function bandDimDraw(){
  var on=CAMERA_MODE&&BAND!=='vis';
  if(on)BANDLAST=BAND;
  BANDV+=((on?1:0)-BANDV)*.12;if(Math.abs((on?1:0)-BANDV)<.004)BANDV=on?1:0;
  if(BANDV<.01)return;
  g.save();g.globalAlpha=BANDV*.62;g.fillStyle='rgb('+BAND_BG[BANDLAST]+')';g.fillRect(0,0,W,H);g.restore();
}
/* Mode kamera = sensor teleskop masa depan: TANPA halo (halo = kesan polusi cahaya), TANPA diffraction spike dan TANPA cincin Airy (lensa pembelok cahaya sudah membelokkannya menjauh dari inti).
   Bintang = titik inti berwarna; bintang bernama yang terang dapat lensa pembelok cahaya (camLens) saat zoom tinggi. */
var CAM_LBL_Z=4.5;   /* zoom mulai munculnya label semua bintang bernama (mode kamera) */
var RING_R=3.6;   /* ambang s.r bintang rasi yang dapat lensa pembelok cahaya (≈ bintang bernama paling terang: Sirius, Spica, Arcturus, Betelgeuse, Rigel, ...) — diturunkan lewat ringR() saat zoom */
var _czV=-1,_czK=1;
function camZK(){if(skyZoom!==_czV){_czV=skyZoom;_czK=skyZoom<=1?1:Math.min(3,Math.sqrt(skyZoom));}return _czK;}   /* inti bintang membesar ~akar zoom: x2 1.4×, x5 2.2×, x10 3.2× (dipotong 3×). Ubah rumus/batas di sini kalau kurang/kebanyakan. */
function ringR(){return skyZoom<=1?RING_R:RING_R/(1+.25*Math.log(skyZoom));}   /* ambang turun saat zoom (x5 ≈ 2.6, x10 ≈ 2.3) → lebih banyak bintang bernama dapat cincin */
/* Lensa Pembelok Cahaya (teknologi purba yang hilang): cahaya inti bintang terang tidak diredam, tapi DIBELOKKAN ke samping seperti di sekitar lubang hitam
   -> tidak ada spike/halo. Visual: rongga gelap tipis di sekitar inti (cahaya yang dialihkan), cincin foton tajam, cincin dalam samar, dan sepasang busur
   Einstein berseberangan (satu panjang, satu pendek) yang melayang pelan di orbit luar.
   Dipanggil SEBELUM inti digambar (inti tetap kelihatan di tengah). Muncul mulai x2.5, penuh di x5.5.
   Biaya = 1 fill + 5 stroke per bintang terang (bukan semua bintang), tanpa gradient. */
/* Grup lensa: bintang bernama yang cincin terluar lensanya (1.42*R) saling menyentuh (jarak <= CAT_GROUP_K*(Ro1+Ro2), single-linkage, sama dengan reticle katalog di 01-core.js)
   + kelompok pasti (CAT_GROUPS, mis. sabuk Orion) digabung jadi SATU lensa yang melingkupi semuanya. it = [{x,y,o(radius cincin terluar),k}], forced = [[kunci..]].
   Hasil: tiap anggota grup dapat m.g = {x,y,R,drawn}; bintang tunggal m.g undefined. Dibuat ulang tiap frame (murah: cuma bintang bernama terang). */
function lensCluster(it,forced){
  var n=it.length,p=[],i,j,m,K=(typeof CAT_GROUP_K==='number')?CAT_GROUP_K:1.15,by={},ks=[],root,o,x0,x1,y0,y1,cx,cy,Ro,g;
  if(n<2)return it;
  function f(a){while(p[a]!==a){p[a]=p[p[a]];a=p[a];}return a;}
  for(i=0;i<n;i++)p[i]=i;
  if(K>0)for(i=0;i<n;i++)for(j=i+1;j<n;j++)if(Math.hypot(it[i].x-it[j].x,it[i].y-it[j].y)<=K*(it[i].o+it[j].o))p[f(i)]=f(j);
  if(forced)forced.forEach(function(l){var first=-1;it.forEach(function(mm,ix){if(l.indexOf(mm.k)>=0){if(first<0)first=ix;else p[f(ix)]=f(first);}});});
  for(i=0;i<n;i++){root=f(i);(by[root]||(by[root]=[])).push(it[i]);}
  for(root in by){
    o=by[root];if(o.length<2)continue;
    x0=1e9;x1=-1e9;y0=1e9;y1=-1e9;
    for(i=0;i<o.length;i++){m=o[i];x0=Math.min(x0,m.x-m.o);x1=Math.max(x1,m.x+m.o);y0=Math.min(y0,m.y-m.o);y1=Math.max(y1,m.y+m.o);}
    cx=(x0+x1)/2;cy=(y0+y1)/2;Ro=0;
    for(i=0;i<o.length;i++){m=o[i];Ro=Math.max(Ro,Math.hypot(m.x-cx,m.y-cy)+m.o);}
    g={x:cx,y:cy,R:Ro/1.42,drawn:false};   /* cincin terluar grup (1.42*R) = melingkupi semua cincin terluar anggota */
    for(i=0;i<o.length;i++)o[i].g=g;
  }
  return it;
}
function camLens(x,y,rc,rgb,a,now){camLensR(x,y,rc*3+4,rgb,a,now);}
function camLensR(x,y,R,rgb,a,now){
  var az=clamp((skyZoom-2.5)/3);if(az<=.01)return;
  var st=reduce||AT.calm,br=st?1:.9+.1*Math.sin(now*.0021+x*.013),ang=st?.6:now*.00032+x*.01,k=a*az;   /* fokus cam: lensa diam */
  g.fillStyle='rgba(2,6,12,'+(.36*k)+')';
  g.beginPath();g.arc(x,y,R*.8,0,6.283);g.fill();                                  /* rongga: cahaya yang dibelokkan menjauh dari inti */
  g.lineWidth=.8;
  g.strokeStyle='rgba('+rgb+','+(.46*k*br)+')';
  g.beginPath();g.arc(x,y,R,0,6.283);g.stroke();                                   /* cincin foton */
  g.lineWidth=.5;g.strokeStyle='rgba('+rgb+','+(.16*k)+')';
  g.beginPath();g.arc(x,y,R*.62,0,6.283);g.stroke();                               /* cincin dalam (gambar orde kedua) */
  g.beginPath();g.arc(x,y,R*1.42,0,6.283);g.stroke();                              /* orbit busur Einstein */
  g.lineCap='round';
  g.lineWidth=1.1;g.strokeStyle='rgba('+rgb+','+(.5*k)+')';
  g.beginPath();g.arc(x,y,R*1.42,ang,ang+1.15);g.stroke();                         /* busur utama (gambar besar) */
  g.lineWidth=.8;g.strokeStyle='rgba('+rgb+','+(.3*k)+')';
  g.beginPath();g.arc(x,y,R*1.42,ang+3.1416+.2,ang+3.1416+.65);g.stroke();         /* busur kedua (gambar kecil, berseberangan) */
  g.lineCap='butt';
}
/* fillStyle inti bintang dari tabel (alpha dibulatkan ke 1/64, selisih maks .008): nggak rakit + parse string rgba baru tiap bintang tiap frame.
   Hasil profil: baris inti bintang (fillStyle + arc + fill) = ~60% waktu JS drawStars. */
var CORE_STY=Object.create(null);
function coreStyle(col,al){
  var b=al>=1?64:(al<=0?0:(al*64+.5)|0),t=CORE_STY[col]||(CORE_STY[col]=[]);
  return t[b]||(t[b]='rgba('+col+','+(b/64)+')');
}
function drawStars(c,age,now){
  var tn=now-(TD.lag[c.id]||0);
  c._vis=0;
  var k2=W<500?.95:1.2;
  var audioFocus=potatoAudioFocus();
  var focus=constellationFocus(c);
  var fK=consFullK(c,now);
  var hkC=CAMERA_MODE?clamp(1-(skyZoom-CAM_HALO_Z0)/CAM_HALO_Z1):1,focusK=CAMERA_MODE?(CAM_IDLE_FOCUS+(1-CAM_IDLE_FOCUS)*(1-hkC)):1;   /* cam: 1 = tampilan idle (zoom ~1x), 0 = tajam (fokus / zoom) */
  var sfxR=consSfxOn(c),ap=(reduce||!sfxR)?0:(AV.beat*.45+AV.bass*.35);   /* dentuman bass SFX -> bintang rasi yang SFX-nya bunyi (pengganti kedip garis) */
  var twn=AT.twT-(TD.lag[c.id]||0),dk=(CAMERA_MODE||sfxR)?0:AT.pK;   /* twn = jam kedip; dk = redup saat collapsars.opus (rasi SFX aktif & mode cam dikecualikan) */
  if(c._topR===undefined){var _mx=0,_kk;for(_kk in c.stars){if(c.stars[_kk].name&&c.stars[_kk].r>_mx)_mx=c.stars[_kk].r;}c._topR=_mx;}   /* r terbesar di antara bintang bernama = bintang paling terang rasi ini (seri ikut) */
  /* pra-pass lensa: bintang bernama berdekatan (lensa saling menyentuh / kelompok pasti) -> satu lensa grup, bukan satu-satu */
  var lensOn=false;
  if(CAMERA_MODE&&skyZoom>2.55){
    var lensIt=[],lrr=ringR(),lzk=camZK();
    (c._keys||(c._keys=Object.keys(c.stars))).forEach(function(k){
      var s=c.stars[k],lq;s._lg=null;
      if(!s.name||s.r<lrr||clamp((age-s.t0)/.5)<=0)return;
      lq=gSkyC(s.x+c.ox,s.y+c.oy,72);if(!lq)return;
      lensIt.push({x:lq[0],y:lq[1],o:1.42*(3*Math.max(.9,s.r*k2*(1-.6*lq[2])*lzk*.62)+4),k:k,s:s});
    });
    lensCluster(lensIt,(typeof CAT_GROUPS!=='undefined'&&CAT_GROUPS[c.id])||null);
    lensIt.forEach(function(m){m.s._lg=m.g||null;});
    lensOn=true;
  }
  (c._keys||(c._keys=Object.keys(c.stars))).forEach(function(k){
    var s=c.stars[k],a=clamp((age-s.t0)/.5);s._a=a;if(a<=0)return;
    var triggerKey=(s._tk!==undefined)?s._tk:(s._tk=starKeyOf(k));   /* dicari sekali per bintang (dulu hasOwnProperty tiap frame) */
    var tr=triggerKey?TRIGGERS[triggerKey]:null;
    var isPlaying=!!(tr&&activeSfx===SFX[triggerKey]&&!SFX[triggerKey].paused);
    var cheap=audioFocus&&!isPlaying;
    var q=gSkyC(s.x+c.ox,s.y+c.oy,72);if(!q)return;c._vis++;var tw=cheap?1:(reduce?1:(1+s._tw*(.30+1.8*s.twinkleDepth))),x=q[0],y=q[1],kq=q[2],r=s.r*k2*(1-.6*q[2])*(.97+.10*s._tw);a*=(1-.85*kq)*focus*focusK*(1+.40*s._tw);
    if(!cheap){   /* kedip halus: bintang rasi tetap beda dari bintang latar walau halo mati (idle / fokus cam) */
      var amb=(AMB_TW&&!reduce)?Math.sin(twn*s.twinkleSpeed+s.x*.0173+s.y*.0131):0;
      if(amb&&s.twinkleJitter)amb+=.5*Math.sin(twn*s.twinkleSpeed*2.7+s.x*.031);
      a*=1+s.twinkleDepth*1.5*amb;r*=1+.05*amb;
    }
    if(ap>0){a*=1+.5*ap;r*=1+.25*ap;}
    if(dk>0)a*=1-.4*dk;
    var bandOn=CAMERA_MODE&&BAND!=='vis',bandCol=null,bandCore=null;
    if(bandOn){
      var bf=bandFactor(s,c.id,k);
      r*=Math.max(.5,Math.min(1.3,Math.pow(bf,.2)));
      a*=Math.max(.1,Math.min(1.5,Math.sqrt(bf)));
      bandCol=s._bg;bandCore=s._bk;
    }
    if(cheap){
      /* During potato audio-focus, keep the star visible but replace its
         animated halo with one tiny core draw. This removes a radial-gradient
         allocation per star while the audio star is doing the heavy work. */
      g.fillStyle=coreStyle(bandCore||'255,255,255',.82*a);
      g.beginPath();g.arc(x,y,Math.max(.72,r*.56),0,6.283);g.fill();
    }else if(CAMERA_MODE){
      /* sensor teleskop tajam: tanpa halo. VIS = warna asli bintang (s.rgb) + putih panas di tengah; UV/IR = warna pita (bandCore). Bintang bernama terang dapat lensa pembelok cahaya (camLens). */
      var cc=bandCore||s.rgb,rz=r*camZK();
      /* halo tipis ada saat cam free di zoom ~1x (kayak idle); hilang saat fokus / auto-zoom fit, dan inti jadi lebih terang */
      var hk=hkC;
      if(hk>.02){var sbc=ofxBreath(c.phase+(s.ph||0)*.35,now)*fK;drawStarGlow(x,y,r*HALO_IDLE_S*(1+.14*sbc),bandCol||s.rgb,a*tw*HALO_IDLE_A*hk*(1+.3*sbc));}
      if(s.name&&s.r>=ringR()){var lg=lensOn&&s._lg;if(lg){if(!lg.drawn){lg.drawn=true;camLensR(lg.x,lg.y,lg.R,cc,a,now);}}else camLens(x,y,Math.max(.9,rz*.62),cc,a,now);}   /* lensa grup (1 lensa utk bintang berdekatan) atau lensa tunggal; cuma bintang bernama terang (titik anonim seperti ekor Scorpius tidak) */
      if(hk>.02){g.fillStyle=coreStyle(bandCore||'255,255,255',.95*a*hk);g.beginPath();g.arc(x,y,Math.max(.9,r*.62),0,6.283);g.fill();}   /* inti gaya idle (putih): persis sama dengan idle di zoom ~1x */
      if(hk<.98){   /* inti tajam sensor (warna asli + putih panas): menggantikan inti idle secara halus saat fokus / zoom, dan lebih terang */
        var ik=1-hk;
        g.fillStyle='rgba('+cc+','+(.95*a*ik*1.1)+')';g.beginPath();g.arc(x,y,Math.max(.9,rz*.62),0,6.283);g.fill();
        if(!bandOn){g.fillStyle='rgba(255,255,255,'+(.8*a*ik)+')';g.beginPath();g.arc(x,y,Math.max(.5,rz*.3),0,6.283);g.fill();}
      }
    }else{
      var sb=ofxBreath(c.phase+(s.ph||0)*.35,now)*fK;
      drawStarGlow(x,y,r*(HALO_IDLE_S+(1-HALO_IDLE_S)*fK)*(1+.14*sb),bandCol||s.rgb,a*tw*(HALO_IDLE_A+(1-HALO_IDLE_A)*fK)*(1+.3*sb));   /* IDLE: halo tipis & kecil; FULL: penuh */
      g.fillStyle=coreStyle(bandCore||'255,255,255',.95*a);g.beginPath();g.arc(x,y,Math.max(.9,r*.62),0,6.283);g.fill();
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
    /* Label bintang (+ reticle silang + spektrum) tersembunyi dulu:
       - bintang ber-SFX: tampil pas SFX-nya main, cuma di bintang yang lagi aktif
       - bintang tanpa SFX: tampil tipis cuma pas mode cam fokus di rasi ini
       Fade halus lewat s._la (mengejar target lblT). */
    var nmS=s.name,lblT=0,gateZ=false,gateLbl=false,alwaysLbl=!!(tr||(s.name&&s.r>=c._topR-1e-6));   /* alwaysLbl = punya SFX atau paling terang di rasinya */
    if(nmS&&age>3.5&&kq<.25){
      gateZ=CAMERA_MODE&&skyZoom>CAM_LBL_Z;
      gateLbl=CAMERA_MODE&&!CAM_LINES&&(alwaysLbl||gateZ);   /* VIS + zoom lewat gerbang + LINES·OFF = nama + tipe spektral semua bintang bernama. LINES·ON = cuma nama rasi/cluster (drawConsName) */
      if(gateLbl)lblT=.8*(alwaysLbl?1:clamp((skyZoom-CAM_LBL_Z)/1));   /* VIS/UV/IR sama. Garis OFF: bintang SFX / paling terang selalu berlabel; sisanya baru lewat gerbang zoom CAM_LBL_Z. Garis ON = cuma nama rasi/cluster */
      else{
        if(isPlaying)lblT=1;   /* SFX aktif = label tampil, di mode apa pun (observe/normal/cam) */
        else if(!(typeof OBSERVE_MODE!=='undefined'&&OBSERVE_MODE)&&!tr&&s.name&&CAMERA_MODE&&!gateZ&&camFocusId()===c.id)lblT=.34;   /* lewat gerbang zoom + garis ON: label fokus tipis ikut mati, sisa nama rasi saja (guard OBSERVE_MODE lama dipertahankan: perilaku cam tidak berubah) */
      }
    }
    var lblA=s._la||0;
    if(reduce)lblA=lblT;
    else{var dtL=Math.min(.1,(now-(s._lt||now))/1000);lblA+=(lblT-lblA)*Math.min(1,dtL*9);}
    s._la=lblA;s._lt=now;
    /* Cross reticle only on named bright stars — skips Scorpius tail (Shaula)
       and other anonymous bright points so the sting doesn't show a "+". */
    if(lblA>.02 && s.r>=2.9 && s.name && !(c.id==='taurus' && k==='elnath') && !(lensOn&&s._lg&&clamp((skyZoom-2.5)/3)>.01)){   /* anggota grup lensa: tanpa silang sendiri (reticle area katalog yang melingkupi grup) */
      g.strokeStyle='rgba('+s.rgb+','+(.4*(a/focusK)*tw*Math.min(1,lblA*1.6))+')';g.lineWidth=.8;   /* a/focusK: retikel tetap seterang sebelumnya walau inti bintang cam di zoom ~1x disamakan dengan idle */
      /* Saat zoom, lensa pembelok cahaya (camLens) membesar ~akar zoom sedangkan retikel dulu tetap r*2.2 -> ketutup lensa. Sekarang lengan retikel
         menjauh ke LUAR cincin terluar lensa (1.42*(3*rc+4)) mengikuti fade lensa (az); tanpa lensa = silang penuh seperti semula. */
      var azR=(CAMERA_MODE&&s.name&&s.r>=ringR())?clamp((skyZoom-2.5)/3):0,lensOut=1.42*(3*Math.max(.9,r*camZK()*.62)+4),
          rG=azR*lensOut*CAM_RET_GAP,rL=r*2.2+azR*(lensOut*CAM_RET_GAP+Math.max(CAM_RET_ARM,lensOut*.45)-r*2.2);
      g.beginPath();g.moveTo(x-rL,y);g.lineTo(x-rG,y);g.moveTo(x+rG,y);g.lineTo(x+rL,y);g.moveTo(x,y-rL);g.lineTo(x,y-rG);g.moveTo(x,y+rG);g.lineTo(x,y+rL);g.stroke();
    }
    if(lblA>.02){
      /* Audio-trigger labels: each one inherits its own pulse color. */
      /* triggerKey / tr / isPlaying were resolved above so potato audio-focus
         can decide the cheap star path before any gradient work is allocated. */
      var _upL=uprBegin(x,y);
      g.font='500 10px "Space Grotesk",system-ui,sans-serif';
      /* Closer gap for edge stars (Antares) so the label hugs the pulse. */
      var gapH=s.specAfter? (r*1.6+4) : (r*3.4+7);
      var _wT=s._wT||(s._wT=g.measureText(nmS).width),_sp=(tr&&isPlaying)?(8+7*1.35+6*1.8):0;
      /* lebar blok = nama atau tipe spektral (mana yang lebih lebar) + batang spektrum; posisi dipilih lblFit (01-core.js): sisi awal -> sisi lawan -> atas -> bawah,
         yang muat di layar dan nggak menimpa label lain (atas/bawah cuma kalau nggak ada batang spektrum). */
      var _spE=(bandOn||gateLbl)?sptOf(s,c.id,k):null,_wS=0;
      if(_spE){if(s._wSk!==_spE){g.font='500 8px "Space Grotesk",system-ui,sans-serif';s._wS=g.measureText(_spE).width;s._wSk=_spE;g.font='500 10px "Space Grotesk",system-ui,sans-serif';}_wS=s._wS;}
      var _pn=s.nx<0?-1:1,_dyP=(s.dy||0),_cd=[[_pn*gapH,3+_dyP,_pn<0?'r':'l'],[-_pn*gapH,3+_dyP,_pn<0?'l':'r']];
      if(!_sp){_cd.push([0,-(r*2.2+12),'c'],[0,r*2.2+16,'c']);}
      var _ft=lblFit(now,x,y,Math.max(_wT,_wS)+_sp,_spE?21:12,_cd),_nx=_ft[2]==='r'?-1:1;
      g.textAlign=_ft[2]==='r'?'right':(_ft[2]==='c'?'center':'left');
      var labelX=x+_ft[0], labelY=y+_ft[1];
      var labelAlpha=lblA*(isPlaying?.95:1);
      g.fillStyle=tr?'rgba('+tr.rgb+','+labelAlpha+')':(bandOn?'rgba('+bandCore+','+labelAlpha+')':'rgba(184,198,214,'+labelAlpha+')');
      g.fillText(nmS,labelX,labelY);
      var _spT=(bandOn||gateLbl)?sptOf(s,c.id,k):null;
      if(_spT){   /* tipe spektral di bawah nama (dari STAR_PHYS): filter UV/IR aktif, atau VIS lewat gerbang zoom saat garis OFF */
        g.font='500 8px "Space Grotesk",system-ui,sans-serif';
        g.fillStyle='rgba('+(bandOn?bandCol:'150,170,196')+','+(labelAlpha*.85)+')';
        g.fillText(_spT,labelX,labelY+10);
        g.font='500 10px "Space Grotesk",system-ui,sans-serif';
      }

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
          var textRight=_nx<0?labelX:(labelX+labelW);
          sx=textRight+gapFromText;
        }else{
          sx=(_nx<0)
            ? (labelX-labelW-gapFromText-total)
            : (labelX+labelW+gapFromText);
        }
        g.save();g.globalCompositeOperation='lighter';
        for(var bi=0;bi<bars;bi++){
          var wave=.5+.5*Math.sin(tn*.009+bi*1.17+s.ph);
          var center=1-Math.abs((bi-(bars-1)/2)/((bars-1)/2));
          var bhh=2+7.2*wave*(.35+.65*center);
          var ba=(.38+.52*wave)*lblA;
          g.fillStyle='rgba('+tr.rgb+','+ba+')';
          g.fillRect(sx+bi*(bw+gap),sy+6-bhh,bw,bhh);
        }
        g.restore();
      }
      uprEnd(_upL);
    }
  });
}
/* Pleiades: klaster muda, bintangnya panas tipe B (~12-14 ribu K) -> terang di UV, meredup di IR. Pleione pakai STAR_PHYS (pleiades.pleione);
   bintang klaster lain tidak punya data per bintang, jadi memakai Teff klaster (PL_TEFF) dan tanpa label tipe spektral. Cache per bintang per pita. */
var PL_TEFF=13000;
function plBand(st){
  if(st._bb!==BAND){
    var ph=st.interactive?SKY.physOf('pleiades','pleione'):{teff:PL_TEFF,spt:null,known:false},bk=bandBucket(BAND,ph.teff);
    st._bf=Math.pow(10,-.4*SKY.bandShift(ph.teff,BAND));st._bg=bk[1];st._bk=bk[2];st._sp=ph.known?ph.spt:null;st._bb=BAND;
  }
  return st._bf;
}
function drawPleiades(age,now){
  var tn=now-(TD.lag.pleiades||0);
  if(!PLEIADES.ready)return;
  PLEIADES._vis=0;
  PLEIADES._ax=PLEIADES._ay=PLEIADES._an=0;   /* akumulasi pusat klaster di layar (dipakai frame berikutnya buat arah garis penghubung label) */
  var linesOffP=CAMERA_MODE&&!CAM_LINES,gFP=clamp((skyZoom-CAM_LBL_Z)/1);
  if(PLEIADES._topR===undefined){var _pm=0;PLEIADES.bright.forEach(function(st){if(st.name&&st.r>_pm)_pm=st.r;});PLEIADES._topR=_pm;}   /* bintang paling terang klaster (Alcyone) */
  var k2=W<500?.95:1.1;
  var ox=mouse.x*1.4+skyPan.x,oy=mouse.y*1.0+skyPan.y;
  var selected=activeSfx===SFX.pleione&&!SFX.pleione.paused&&!SFX.pleione.ended;
  var pFK=consFullK(PLEIADES,now),pAP=(selected&&!reduce)?(AV.beat*.45+AV.bass*.35):0,pDK=(CAMERA_MODE||clusterSfxOn())?0:AT.pK;
  var pNA=nameFadeStep(PLEIADES,(CAMERA_MODE||selected)?1:0,now);   /* nama cluster: cam ON atau Pleione bunyi, fade halus */
  if(!consLocked('pleiades')){ /* teks nama cluster: lapisan paling bawah, di bawah bintang */
    var pS=PLEIADES.scale,pA=clamp((age-1.6)/1.6)*pNA;
    var pq1=skyXF(PLEIADES.x+.22*pS+ox,PLEIADES.y+.22*pS+oy),pt1=[pq1[0],pq1[1]];
    var pq2=skyXF(PLEIADES.x+.84*pS+ox,PLEIADES.y+.62*pS+oy),pt2=[pq2[0],pq2[1]];
    drawNameBox('pleiades',pt1,pt2,(CAMERA_MODE&&camFocusId()==='pleiades'?NAME_ALF:NAME_AL)*pA,now);
  }
  /* Full cluster when Pleione plays (or focus still on pleiades); otherwise dim.
     Sweep-driven _tw gives the same sequential twinkle language as Orion/Virgo/Canis. */
  var clusterFade=selected?1:.30;
  var plLens=false;   /* pra-pass lensa Pleiades: semua bintang terang klaster yang tampak = satu lensa grup (sama dengan reticle katalog) */
  if(CAMERA_MODE&&skyZoom>2.55){
    var pit=[];
    PLEIADES.bright.forEach(function(st){
      var gx=PLEIADES.x+st.x*PLEIADES.scale+ox,gy=PLEIADES.y+st.y*PLEIADES.scale+oy,gq;st._lg=null;
      gq=gSkyC(gx,gy,72);if(!gq||gq[2]>=1)return;
      pit.push({x:gq[0],y:gq[1],o:1.42*(3*Math.max(.9,((st.r)||1.8)*k2*(1-.45*gq[2])*.7*camZK())+4),k:st,s:st});
    });
    lensCluster(pit,[PLEIADES.bright]);
    pit.forEach(function(m){m.s._lg=m.g||null;});
    plLens=true;
  }
  function drawOne(star,dim){
    var x=PLEIADES.x+star.x*PLEIADES.scale+ox;
    var y=PLEIADES.y+star.y*PLEIADES.scale+oy;
    var twBoost=selected?(star._tw||0):0;
    var r=((star.r)||(dim?1.15:1.8))*k2*(.97+.10*twBoost);
    var a=(dim?.48:.88)*clusterFade*(1+.40*twBoost);
    var rgbc=star.interactive?'145,170,255':(dim?'110,145,205':'190,218,255');
    /* Soft ambient shimmer when not in sweep; sweep _tw is the main flash. */
    var pulse=star.interactive?1:(1+.045*Math.sin((AT.twT-(now-tn))*.0015+star.x*9));
    r*=pulse;
    if(selected&&!reduce)a*=(1+twBoost*(.30+1.4*.12));
    if(pAP>0){a*=1+.5*pAP;r*=1+.25*pAP;}
    if(pDK>0)a*=1-.4*pDK;
    var q=gSkyC(x,y,72);
    if(!q||q[2]>=1)return;
    PLEIADES._vis++;
    x=q[0];y=q[1];if(!dim){PLEIADES._ax+=x;PLEIADES._ay+=y;PLEIADES._an++;}a*=(1-.75*q[2]);r*=1-.45*q[2];
    var bandOn=CAMERA_MODE&&BAND!=='vis',bandCol=null,bandCore=null;   /* filter UV/IR: pola sama dengan drawStars */
    if(bandOn){
      var bf=plBand(star);
      r*=Math.max(.5,Math.min(1.3,Math.pow(bf,.2)));
      a*=Math.max(.1,Math.min(1.5,Math.sqrt(bf)));
      bandCol=star._bg;bandCore=star._bk;
    }
    /* Reuse constellation star sprite; scale so extent ≈ r*(dim?4.5:5.8).
       drawStarGlow uses extent=r*5, so pass rAdj = r * factor/5. */
    var rAdj=r*((dim?4.5:5.8)/5);
    var pHK=CAMERA_MODE?clamp(1-(skyZoom-CAM_HALO_Z0)/CAM_HALO_Z1):1,pHF=CAMERA_MODE?0:pFK;   /* halo: sama dengan drawStars (idle / cam free ~1x tipis, FULL penuh, fokus cam tanpa halo) */
    if(pHK>.02)drawStarGlow(x,y,rAdj*(HALO_IDLE_S+(1-HALO_IDLE_S)*pHF),rgbc,a*.82*(HALO_IDLE_A+(1-HALO_IDLE_A)*pHF)*pHK);   /* mode kamera: tanpa halo, sama dengan drawStars */
    if(CAMERA_MODE&&!dim){var plg=plLens&&star._lg;if(plg){if(!plg.drawn){plg.drawn=true;camLensR(plg.x,plg.y,plg.R,bandCore||'238,246,255',a,now);}}else camLens(x,y,Math.max(.9,r*.7*camZK()),bandCore||'238,246,255',a,now);}   /* bintang terang klaster (non-dim): lensa pembelok cahaya di bawah inti */
    g.fillStyle='rgba('+(bandCore||'238,246,255')+','+(a*.94*(CAMERA_MODE?(1+.1*(1-pHK)):1))+')';g.beginPath();g.arc(x,y,CAMERA_MODE?(Math.max(.7,r*.58)*pHK+Math.max(.9,r*.7*camZK())*(1-pHK)):Math.max(.7,r*.58),0,6.283);g.fill();
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
      if(selected&&age>3.5&&q[2]<.25){ /* label Pleione cuma pas SFX-nya main (di mode apa pun) */
        var _upP=uprBegin(x,y);
        g.font='500 10px "Space Grotesk",system-ui,sans-serif';
        g.textAlign='left';g.fillStyle='rgba('+tr.rgb+','+(hotP?.95:(selected?.78:.42))+')';
        var labelW0=g.measureText('Pleione').width,_bw=(selected?8+7*3.15:0),_pw=labelW0+_bw,_g=r*3.4+7;
        /* kanan bintang -> kiri -> atas -> bawah: yang muat di layar dan kosong (lblFit); batang spektrum ikut dihitung di lebar blok */
        var _pf2=lblFit(now,x,y,_pw+4,12,[[_g,3,'l'],[-_g,3,'r'],[0,-(r*2.2+12),'c'],[0,r*2.2+16,'c']]);
        var labelX=_pf2[2]==='r'?x+_pf2[0]-_pw:(_pf2[2]==='c'?x+_pf2[0]-_pw/2:x+_pf2[0]),labelY=y+_pf2[1];
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
        uprEnd(_upP);
      }
    }
    /* Label VIS lewat gerbang zoom (garis OFF): klaster rapat, jadi label digeser keluar dari pusat klaster dan disambung garis putus-putus.
       Nama diambil dari star.name di data PLEIADES (Pleione otomatis). Selang-seling 2 jarak biar label tetangga nggak tumpuk. */
    var nmL=star.name||(star.interactive?'Pleione':null);
    var alP=!!(star.interactive||(star.name&&star.r>=PLEIADES._topR-1e-6));   /* SFX (Pleione) / paling terang = selalu berlabel saat garis OFF; sisanya lewat gerbang zoom */
    if(linesOffP&&(alP||skyZoom>CAM_LBL_Z)&&!dim&&nmL&&age>3.5&&q[2]<.25){   /* tanpa cek OBSERVE_MODE: mode kamera selalu butuh OBSERVE_MODE aktif, jadi cek itu bikin label ini nggak pernah tampil */
      var _li=star._li||0,dd=24+(_li%2)*14,ux,uy;
      if(PLEIADES._cx===undefined){var an=_li*2.4;ux=Math.cos(an);uy=Math.sin(an);}
      else{ux=x-PLEIADES._cx;uy=y-PLEIADES._cy;var ul=Math.hypot(ux,uy)||1;ux/=ul;uy/=ul;}
      var ala=.8*(alP?1:gFP)*(1-.85*q[2]),spL=plSpt(nmL);
      var _upD=uprBegin(x,y);
      /* label klaster: kandidat arah (menjauh dari pusat klaster, cermin horizontal/vertikal, lalu lebih jauh); lblFit milih yang muat di layar dan kosong */
      g.font='500 10px "Space Grotesk",system-ui,sans-serif';
      var _wN=g.measureText(nmL).width,_wS2=0;
      if(spL){g.font='500 8px "Space Grotesk",system-ui,sans-serif';_wS2=g.measureText(spL).width;g.font='500 10px "Space Grotesk",system-ui,sans-serif';}
      var _vs=[[ux,uy,dd],[-ux,uy,dd],[ux,-uy,dd],[-ux,-uy,dd],[ux,uy,dd*1.7],[-ux,uy,dd*1.7],[ux,-uy,dd*1.7],[-ux,-uy,dd*1.7]],_cp=[],_vi;
      for(_vi=0;_vi<_vs.length;_vi++)_cp.push([_vs[_vi][0]*_vs[_vi][2]+(_vs[_vi][0]<0?-3:3),_vs[_vi][1]*_vs[_vi][2]+3,_vs[_vi][0]<0?'r':'l']);
      var _pf=lblFit(now,x,y,Math.max(_wN,_wS2)+4,spL?21:12,_cp),lax=x+_pf[0]+(_pf[2]==='r'?3:-3),lay=y+_pf[1]-3,
          _lx=lax-x,_ly=lay-y,_ll=Math.hypot(_lx,_ly)||1;
      g.save();g.setLineDash([2,3]);g.lineWidth=.7;g.strokeStyle='rgba('+(bandOn?bandCol:'150,170,196')+','+(ala*.55)+')';
      g.beginPath();g.moveTo(x+_lx/_ll*(r*1.6+4),y+_ly/_ll*(r*1.6+4));g.lineTo(lax,lay);g.stroke();g.restore();
      g.textAlign=_pf[2]==='r'?'right':'left';
      var tx=x+_pf[0],ty=y+_pf[1];
      g.fillStyle=bandOn?'rgba('+bandCore+','+ala+')':'rgba(184,198,214,'+ala+')';g.fillText(nmL,tx,ty);
      if(spL){g.font='500 8px "Space Grotesk",system-ui,sans-serif';g.fillStyle='rgba('+(bandOn?bandCol:'150,170,196')+','+(ala*.85)+')';g.fillText(spL,tx,ty+10);}
      uprEnd(_upD);
    }
  }
  PLEIADES.dim.forEach(function(st){drawOne(st,true);});
  PLEIADES.bright.forEach(function(st,i){st._li=i;drawOne(st,false);});
  if(PLEIADES._an){PLEIADES._cx=PLEIADES._ax/PLEIADES._an;PLEIADES._cy=PLEIADES._ay/PLEIADES._an;}
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
/* Mode ROT: bubble ditaruh dengan jangkar di koordinat LAYAR (teks tegak), lalu dikonversi balik ke ruang stage. */
function bubbleXYRot(p,gap,pad,maxW){
  var c=v2c(p[0],p[1]);
  var cx=Math.max(pad+maxW*.5,Math.min(STG.iw-pad-maxW*.5,c[0])),cy=Math.max(pad+36,Math.min(STG.ih-pad,c[1]-gap));
  return c2v(cx,cy);
}
function placeSecretMsg(){
  var el=$('#secret-msg'),p=telescopeScreenPos();
  if(!el||!p)return;
  if(STG.rot){
    var vv=bubbleXYRot(p,((typeof touchMode!=='undefined'&&touchMode)?10:12)+teleBubbleGap(),10,Math.min(220,STG.iw*.72));
    el.style.left=Math.round(vv[0])+'px';el.style.top=Math.round(vv[1])+'px';
    return;
  }
  /* Bottom of bubble sits just above the telescope (data-type=telescope uses translate(-50%,-100%)). */
  var gap=((typeof touchMode!=='undefined'&&touchMode)?10:12)+teleBubbleGap();
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
    var cand=[],ci;
    animFrame(now);
    if(!SECT.on)for(ci=0;ci<CONS.length;ci++)if(linesVisible(CONS[ci])&&consFullTarget(CONS[ci])&&sectShow(CONS[ci].id))cand.push(CONS[ci]);   /* cuma rasi yang garisnya tampil DAN tier FULL (fokus cam = tenang, tanpa pulse) */
    if(cand.length){
      var c=cand[(Math.random()*cand.length)|0],l=c.lines[(Math.random()*c.lines.length)|0],f=Math.random()<.5;
      PU.push({c:c,a:f?l[1]:l[0],b:f?l[0]:l[1],t:now,d:1100+Math.random()*600});
    }}
  for(var i=PU.length-1;i>=0;i--){
    var p=PU[i],u=(now-p.t)/p.d;if(u>1){PU.splice(i,1);continue;}
    if(SECT.on||!sectShow(p.shock?TRIGGERS[p.snKey].cons:p.c.id))continue;
    if(p.shock){
      var tr=TRIGGERS[p.snKey],sb=(tr&&tr.cons==='pleiades')?plStarByName(tr.star):(p.c.stars&&p.c.stars[p.snKey]);
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
    if(!linesVisible(p.c)||!consFullTarget(p.c))continue;   /* garis rasi ini lagi tidak tampil / tier-nya tenang: pulse yang sudah terlanjur ada ikut disembunyikan (kedaluwarsa sendiri di atas) */
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
  var na=clamp((age-3.6)/1);
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
      var ptf='translate('+fx.toFixed(1)+'px,'+fy.toFixed(1)+'px)'+STG.pt;
      if(p._tf!==ptf){p._tf=ptf;p.el.style.transform=ptf;}
      var hs=c.stars[p.hit],hp=gSky(hs.x+ox,hs.y+oy);
      p.hitEl.style.transform='translate('+(hp[0]).toFixed(1)+'px,'+(hp[1]).toFixed(1)+'px)';
    }
    if(na<=0)return;
    if(typeof ALIGN!=='undefined'&&ALIGN.cid){p.el.classList.remove('mobile-show');return;}
    /* Mode kamera: portal DUMUL dinonaktifin total (panel + tombol hit lewat CSS) supaya tap sabuk Orion
       jatuh ke canvas buat chain Pleiades. Cincin sabuk cuma tersisa sebagai petunjuk selama Pleiades masih terkunci. */
    if(CAMERA_MODE){
      p.el.classList.remove('mobile-show');
      if(!GAME_ON||UNLOCK.set.pleiades||camFocusId()!==p.cons)return;   /* cincin petunjuk sabuk: cuma di mode 🎮 */
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
var OFX={pC:0,pK:0,p:0,last:0,dph:0,wasOn:false,m0:'255,214,170',m1:'255,104,140',px:0,py:0,
  tc:null,tk:null,keys:null,dust:[],dAt:0,dx:-999,dy:-999,err:0,dead:false};
var OFX_PAL_C=['150,212,255','205,232,255','118,168,255'],OFX_PAL_K=['235,96,76','176,38,62','255,70,64'];
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
  /* Meteor: default = hangat (palet Collapsars lama), AMB = cyan, Collapsars = merah gelap. Dipilih saat meteor lahir. */
  if(OFX.pC>OFX.pK&&OFX.pC>.35){OFX.m0='234,246,255';OFX.m1='110,229,255';}
  else if(OFX.pK>OFX.pC&&OFX.pK>.35){OFX.m0='255,120,100';OFX.m1='150,14,24';}
  else{OFX.m0='255,214,170';OFX.m1='255,104,140';}
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
  if(kind==='k'){ /* dipakai mode 'multiply': menggelapkan + menggeser langit ke merah tua */
    gr.addColorStop(0,'rgba(140,22,30,.88)');gr.addColorStop(.4,'rgba(165,32,42,.62)');
    gr.addColorStop(.75,'rgba(205,62,72,.30)');gr.addColorStop(1,'rgba(255,255,255,0)');
  }else{
    gr.addColorStop(0,'rgba(60,130,255,.50)');gr.addColorStop(.45,'rgba(34,84,190,.26)');
    gr.addColorStop(1,'rgba(20,50,140,0)');
  }
  x.fillStyle=gr;x.fillRect(0,0,128,128);return c;
}
/* Warna langit per sektor: sprite radial kecil per sektor (di-cache), di-crossfade lewat alpha. Data: SECTORS[].sky = {rgb:'r,g,b', a:0..1} */
var SKYT={};
function sectSkySprite(rgb){
  var c=document.createElement('canvas'),x,gr;c.width=c.height=128;x=c.getContext('2d');
  gr=x.createRadialGradient(64,64,0,64,64,64);
  gr.addColorStop(0,'rgba('+rgb+',1)');gr.addColorStop(.45,'rgba('+rgb+',.42)');gr.addColorStop(1,'rgba('+rgb+',0)');
  x.fillStyle=gr;x.fillRect(0,0,128,128);return c;
}
/* Data: SECTORS[].sky = {rgb,a, dim:0..1 (redam kabut/dust default dulu, biar warna sektor nggak campur), dimRgb:'r,g,b', acc:{rgb,a,x,y,s,sy,rot}}
   Urutan: (1) dim = source-over gelapin plate default, (2) tint aditif, (3) aksen aditif (blob/pita). Dua pass supaya crossfade antar sektor nggak saling nutup. */
function sectDrawSky(){
  var i,s,t,tgt,S=Math.max(W,H)*2.2,A;
  for(i=0;i<SECT.list.length;i++){
    s=SECT.list[i];if(!s.sky)continue;
    t=SKYT[s.k]||(SKYT[s.k]={v:0,spr:null,spr2:null});
    tgt=(!SECT.on&&SECT.cur===s)?1:0;                 /* overview = netral, tanpa tint */
    t.v+=(tgt-t.v)*.06;if(Math.abs(tgt-t.v)<.004)t.v=tgt;
  }
  for(i=0;i<SECT.list.length;i++){                    /* pass 1: dim */
    s=SECT.list[i];t=s.sky&&SKYT[s.k];
    if(!t||t.v<.01||!s.sky.dim)continue;
    g.save();g.globalAlpha=t.v*s.sky.dim;g.fillStyle='rgb('+(s.sky.dimRgb||'2,5,10')+')';g.fillRect(0,0,W,H);g.restore();
  }
  var zn=skyZoom<=4?1:Math.max(0,1-(skyZoom-4)/4);zn=zn*zn*(3-2*zn);   /* nebula "keluar layar" saat zoom tinggi: penuh sampai x4, hilang di x8+ (skip blit = lebih ringan) */
  if(NEB.base){                                       /* pass 1b: nebula gambar berwarna sektor (di atas plate yang sudah diredam, di bawah tint aditif) */
    for(i=0;i<SECT.list.length;i++){
      s=SECT.list[i];t=s.sky&&SKYT[s.k];
      if(!t||t.v<.01)continue;
      A=nebTint(s);if(!A)continue;
      g.save();
      if(A._m){g.globalAlpha=t.v*NEB.SDIM;g.fillStyle='rgb(2,5,10)';g.fillRect(0,0,W,H);}   /* nebula bertopeng: gelapkan plate (nebula overview) dulu biar nggak dobel + latar pekat */
      if(zn>.01){
        g.globalAlpha=t.v*NEB.A_SEC*zn;
        plateBlit(A,plateM,W+2*plateM,H+2*plateM,1+(skyZoom-1)*NEB.ZF,skyPan.x*.14,skyPan.y*.14);
      }
      g.restore();
    }
  }
  for(i=0;i<SECT.list.length;i++){                    /* pass 2: tint + aksen */
    s=SECT.list[i];t=s.sky&&SKYT[s.k];
    if(!t||t.v<.01)continue;
    if(!t.spr)t.spr=sectSkySprite(s.sky.rgb);
    g.save();g.globalCompositeOperation='lighter';g.globalAlpha=t.v*(s.sky.a==null?.22:s.sky.a);
    g.drawImage(t.spr,W*.5-S/2,H*.45-S/2,S,S);
    A=s.sky.acc;
    if(A){
      if(!t.spr2)t.spr2=sectSkySprite(A.rgb);
      var as=S*(A.s||.6);
      g.globalAlpha=t.v*A.a;
      g.translate(W*A.x,H*A.y);if(A.rot)g.rotate(A.rot);if(A.sy)g.scale(1,A.sy);
      g.drawImage(t.spr2,-as/2,-as/2,as,as);
    }
    g.restore();
  }
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
    g.globalCompositeOperation='multiply';
    g.globalAlpha=OFX.pK*(.92+.08*Math.sin(now*.0013));
    /* Di dalam sektor, tint tetap di posisi HOME (sama seperti overview) - jangan ikut Gargantua mini yang di-summon/di-drag. */
    var tkx=SECT.cur?(BH.hx||BH.x):BH.x,tky=SECT.cur?(BH.hy||BH.y):BH.y;
    g.drawImage(OFX.tk,tkx-S/2,tky-S/2,S,S);
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

