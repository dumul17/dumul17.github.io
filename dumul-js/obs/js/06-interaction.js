'use strict';
/* 06-interaction.js — interaksi, easter egg, terminal, greeting, clock dilation */
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
    if(linesVisible(c))c.lines.forEach(function(l,i){   /* garis yang tidak tampil (linesVisible, 04-render.js) tidak boleh bisa di-tap (nyala/flash) */
      var a=c.stars[l[0]],b=c.stars[l[1]];
      var qa=gSky(a.x+c.ox,a.y+c.oy),qb=gSky(b.x+c.ox,b.y+c.oy);
      var ax=qa[0],ay=qa[1],bx=qb[0],by=qb[1];
      var vx=bx-ax,vy=by-ay,den=vx*vx+vy*vy||1,t=Math.max(0,Math.min(1,((px-ax)*vx+(py-ay)*vy)/den));
      var d=Math.hypot(px-(ax+vx*t),py-(ay+vy*t));
      if(d<5&&d<best){best=d;hit={c:c,line:i};}
    });
  });
  if(hit){hot=starKeyOf(hit.star)||hot;if(hit.line!=null)hit.c._hot=hit.line;}
  else if(hot!=='bh'&&!starKeyOf(hot))hot=null;
}
document.addEventListener('pointerdown',function(e){
  if(document.body.classList.contains('owl-open')||document.body.classList.contains('owl-block'))return;
  if(SECT.on||SW||drag.on||e.target.closest('#bh,.portal,.hit,#owl-source,#sky-pill,#bh-clock,#music-toggle,#music-player,#bh-panel,#mode-cluster,#mode-observe,#mode-silence,#cam-zoom,#cg-btn,#cam-whisper,#cam-cat,#cam-ach,#lis-ask,#sect-menu,#sector-scan'))return;
  var now=performance.now(),hit=null,best=40;
  var aligning=(typeof ALIGN!=='undefined'&&ALIGN.cid);
  /* Saat alignment aktif, Pleiades dilewatin biar nggak nyuri tap bintang urutan. */
  var ph=(aligning||!sectShow('pleiades'))?null:pleiadesHitAt(e.clientX,e.clientY);
  if(ph){
    tapFlash={until:now+420,cons:'pleiades'};
    if(!(typeof isLayoutEdit==='function'&&isLayoutEdit()))triggerSupernova('pleione');
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
  if(hit && !(typeof isLayoutEdit==="function"&&isLayoutEdit())){
    tapFlash={until:now+420,cons:hit.c.id};
    var as=(typeof alignTapStar==='function')?alignTapStar(hit.c,hit.star):false;
    var tk=(TRIGGERS[hit.star]&&TRIGGERS[hit.star].cons===hit.c.id)?hit.star:null;
    if(tk){
      if(!as)triggerSupernova(tk);
    }
    else {
      playStarChime(hit.c.stars[hit.star]);
      if(!aligning&&hit.c.id==='orion'&&(hit.star==='mintaka'||hit.star==='alnilam'||hit.star==='alnitak')){
        var bandP=PORTALS[0];
        if(bandP&&bandP.el)bandP.el.classList.toggle('mobile-show');
      }
      haptic(8);
      if(!as && typeof openCamOnCons==='function')openCamOnCons(hit.c.id);
    }
  }
},{passive:true});
document.addEventListener('pointerdown',function(e){
  if(SW||reduce)return;
  if(e.target&&e.target.closest&&e.target.closest('#bh-panel,#cam-zoom,#cg-btn,#cam-whisper,#cam-cat,#cam-ach,#lis-ask,#sect-menu,#mode-cluster,#music-player'))return; /* panel (tune / CAM / kartu rasi / katalog): jangan tembus ke asteroid */
  var ai=asteroidScreenAt(e.clientX,e.clientY);
  if(ai>=0&&typeof ALIGN!=='undefined'&&ALIGN.cid&&constellationTargetAt(e.clientX,e.clientY,true))ai=-1;
  if(ai>=0){
    e.preventDefault();e.stopPropagation();
    scatterAsteroidArea(e.clientX,e.clientY,80); /* area tap: radius px */
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
        if(ok){btn.classList.remove('shine');requestAnimationFrame(function(){btn.classList.add('shine');});}
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
    var tk=brand._gn=(brand._gn||0)+1;   /* tanpa forced reflow */
    brand.classList.remove('gl');panel.classList.remove('gl');
    clearTimeout(brand._t);
    requestAnimationFrame(function(){
      if(brand._gn!==tk)return;
      brand.classList.add('gl');panel.classList.add('gl');
      try{glitchUntil=performance.now()+650;}catch(eG){}
      brand._t=setTimeout(function(){
        brand.classList.remove('gl');panel.classList.remove('gl');
      },700);
    });
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

  /* Tabs: Settings (tune) | About */
  (function owlTabs(){
    var tabs=[].slice.call(panel.querySelectorAll('.owl-tab'));
    var panes={about:document.getElementById('owl-pane-about'),tune:document.getElementById('owl-pane-tune')};
    function setTab(name){
      tabs.forEach(function(t){var on=t.getAttribute('data-owl-tab')===name;t.classList.toggle('on',on);t.setAttribute('aria-selected',on?'true':'false');});
      Object.keys(panes).forEach(function(k){var p=panes[k];if(!p)return;var on=k===name;p.classList.toggle('on',on);if(on)p.removeAttribute('hidden');else p.setAttribute('hidden','');});
      try{if(typeof window.__bhTuneShow==='function')window.__bhTuneShow(name==='tune');}catch(e){}
    }
    tabs.forEach(function(t){t.addEventListener('click',function(e){e.stopPropagation();setTab(t.getAttribute('data-owl-tab'));});});
    setTab('tune');
    var _open=openOwl;
    openOwl=function(){_open();setTab(panel.getAttribute('data-last-tab')||'tune');};
    var _close=closeOwl;
    closeOwl=function(){
      var on=panel.querySelector('.owl-tab.on');
      if(on)panel.setAttribute('data-last-tab',on.getAttribute('data-owl-tab')||'tune');
      try{panel.classList.remove('owl-scrub');var _bd=document.getElementById('owl-backdrop');if(_bd)_bd.classList.remove('owl-scrub-bg');
        var _sr=panel.querySelectorAll('.owl-scrub-row');for(var _i=0;_i<_sr.length;_i++)_sr[_i].classList.remove('owl-scrub-row');
      }catch(eS){}
      try{if(typeof window.__bhTuneShow==='function')window.__bhTuneShow(false);}catch(e){}
      _close();
    };
  })();
  /* Quality HIGH/LOW: localStorage.dumul_quality (persist). Save = tulis + reload. Reset = hapus preferensi, balik ke default HIGH (tanpa auto-detect device, lihat 01-core.js). */
  (function owlPerf(){
    var b=document.getElementById('owl-perf'),bSave=document.getElementById('owl-perf-save'),bReset=document.getElementById('owl-perf-reset'),bAct=document.getElementById('owl-perf-act'),bTxt=document.getElementById('owl-perf-t');
    if(!b)return;
    var draft=null; /* pending choice before Save; null = tampilkan yang aktif */
    function stored(){
      try{var s=localStorage.getItem('dumul_quality');if(s==='high'||s==='low')return s;}catch(e){}
      return null;
    }
    function live(){
      try{var m=/[?&]perf=(high|low)/.exec(location.search);if(m)return m[1];}catch(e){}
      var s=stored();if(s)return s;
      return (typeof IS_POTATO!=='undefined'&&IS_POTATO)?'low':'high';
    }
    function cur(){return draft||live();}
    function paint(){
      var v=cur(),st=stored(),lv=live();
      var lbl=v==='low'?'LOW':'HIGH';
      if(bTxt)bTxt.textContent=T('perf.chip',{m:lbl});else b.textContent=lbl;
      b.title=T('tune.quality.hint');
      b.setAttribute('aria-pressed',v==='low'?'true':'false');
      b.classList.toggle('on',v==='low');
      b.classList.toggle('dirty',draft!=null&&draft!==lv);
      if(bSave)bSave.disabled=!(draft!=null&&draft!==st);
      if(bAct){var hasUrl=false;try{hasUrl=/[?&]perf=(high|low)/.test(location.search);}catch(eU){}bAct.hidden=!(draft!=null||st!=null||hasUrl);}   /* Save/Reset cuma muncul kalau ada perubahan atau preferensi tersimpan */
    }
    function apply(v,clearUrl){
      try{
        if(v==null)localStorage.removeItem('dumul_quality');
        else localStorage.setItem('dumul_quality',v);
      }catch(e){}
      try{
        var u=new URL(location.href);
        if(clearUrl||v==null)u.searchParams.delete('perf');
        else u.searchParams.set('perf',v);
        location.replace(u.pathname+u.search+u.hash);
      }catch(err){
        location.reload();
      }
    }
    paint();
    b.addEventListener('click',function(e){
      e.stopPropagation();
      draft=cur()==='low'?'high':'low';
      paint();
      try{haptic(6);}catch(eH){}
    });
    if(bSave)bSave.addEventListener('click',function(e){
      e.stopPropagation();
      var v=cur();
      draft=null;
      apply(v,false);
    });
    if(bReset)bReset.addEventListener('click',function(e){
      e.stopPropagation();
      draft=null;
      apply(null,true); /* hapus preferensi → kembali ke default HIGH */
    });
  })();

})();
var bhA=$('#bh');
bhA.addEventListener('click',function(e){
  e.preventDefault();smenuOpen();   /* F10: di overview maupun di sektor link ini = buka window menu sektor (keyboard/AT); dumul.html lewat link sabuk Orion */
});
try{bhA.setAttribute('data-i18n-aria','portal.link');bhA.setAttribute('aria-label',T('portal.link'));bhA.title=T('portal.link');}catch(ePL){}
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
  var full=Math.max(BH.R*2.8*Math.max(1,bhSizeMul()),Math.min(base*.18,110));
  return BHSC>=.9?full:Math.max(26,full*Math.max(0,BHSC));
}
function constellationTargetAt(x,y,skipTelescope){
  var found=false;
  if(pleiadesHitAt(x,y))found=true;
  CONS.forEach(function(c){
    if(CONS_OFF[c.id])return; /* rasi off:true tidak jadi target */
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
/* Jarak ke bintang rasi/Pleiades yang KENA tap (Infinity kalau tidak ada). Dipakai buat adu "siapa lebih dekat" antara bintang vs teleskop di area padat. */
function constellationHitDist(x,y){
  var best=Infinity,d;
  if(PLEIADES.ready){
    var ox=mouse.x*1.4+skyPan.x,oy=mouse.y*1.0+skyPan.y,hitR=Math.max(22,PLEIADES.scale*.11);
    for(var i=0;i<PLEIADES.bright.length;i++){
      var st=PLEIADES.bright[i];if(!st.interactive)continue;
      var q=gSky(PLEIADES.x+st.x*PLEIADES.scale+ox,PLEIADES.y+st.y*PLEIADES.scale+oy);
      if(!q||q[2]>=1)continue;
      d=Math.hypot(x-q[0],y-q[1]);if(d<hitR&&d<best)best=d;
    }
  }
  CONS.forEach(function(c){
    if(CONS_OFF[c.id])return;
    Object.keys(c.stars).forEach(function(k){
      var s=c.stars[k],q=gSky(s.x+c.ox,s.y+c.oy);
      if(!q)return;
      d=Math.hypot(x-q[0],y-q[1]);
      if(d<Math.max(14,s.r*4.5)&&d<best)best=d;
    });
  });
  return best;
}
/* F10: gestur PORTAL sektor (PTG: tap = menu, tahan = balik overview) dihapus — portal sektor pensiun. Menu sektor dibuka dari tombol HUD #mode-bh; balik overview = tombol KE OVERVIEW di window menu (16-sector-menu.js). BH mini hanya bisa di-drag. */
function beginBHDrag(e){
  if(reduce||SW||drag.on||BHSC<.05)return false;
  if(e.target.closest&&e.target.closest('#boot-screen'))return false;   /* layar boot masih tampil: tap karakter/judul/capsule tidak boleh jadi tap portal (menu sektor kebuka) / drag BH di bawahnya */
  /* Explicit interactive star/portal layers always win over Gargantua's wide grab field.
     This is important when Rigel starts close to the black hole on the initial layout. */
  if(document.body.classList.contains('owl-open')||document.body.classList.contains('owl-block')||document.body.classList.contains('smenu-open'))return false;
  if(e.target.closest && e.target.closest('.hit,.portal,#owl-source,#sky-pill,#bh-clock,#music-toggle,#music-player,#cam-zoom,#cg-btn,#cam-whisper,#cam-cat,#cam-ach,#lis-ask,#sect-menu,#bh-panel,#mode-cluster,#mode-observe,#mode-silence'))return false;
  /* Asteroid clicks get first refusal too, so a rock near Gargantua cannot start a BH drag. */
  if(asteroidScreenAt(e.clientX,e.clientY)>=0)return false;
  /* Star interactions always win over Gargantua's large invisible field. */
  if(!SECT.cur&&typeof ptOvHidden==='function'&&ptOvHidden())return false;   /* P4: portal overview sedang di balik planet = tidak bisa di-tap / di-drag */
  var ovR=ptOvR(),bp=(ovR>0&&typeof ptOvPos==='function')?ptOvPos():camBH();   /* radius portal overview yang tergambar (0 = bukan overview / belum tergambar); pusat = posisi portal yang mengorbit */
  var inPtl=ovR>0&&Math.hypot(e.clientX-bp[0],e.clientY-bp[1])<=ovR*.8;   /* di dalam cincin portal: portal menutupi bintang di belakangnya, jadi portal menang */
  if(!inPtl&&constellationTargetAt(e.clientX,e.clientY))return false;
  if(!bhDragAllowed())return false;
  var d=Math.hypot(e.clientX-bp[0],e.clientY-bp[1]),grab=bhGrabRadius();
  if(ovR>0)grab=Math.max(grab,ovR*.95);
  if(d>grab*(skyZoom>1?Math.min(1.35,0.85+0.25*skyZoom):1))return false;
  drag.on=true;drag.moved=false;drag.pid=e.pointerId;drag.x0=e.clientX;drag.y0=e.clientY;drag.bx=BH.x;drag.by=BH.y;
  drag.px0=bp[0];drag.py0=bp[1];drag.pr0=ovR;   /* posisi + radius portal overview saat mulai drag (orbit dibekukan selama drag): dasar clamp limb planet */
  drag.tapEligible=ovR>0?(d<=Math.max(ovR*.85,42)):(d<=Math.max(BH.R*BHSC*1.9*skyZoom,BHSC<.9?24:42));
  /* BH mini hanya drag. Overview: tap portal = buka menu sektor (endBHDrag). */
  try{cv.setPointerCapture(e.pointerId);}catch(err){}
  haptic(15);e.preventDefault();e.stopPropagation();
  return true;
}
function moveBHDrag(e){
  if(!drag.on||e.pointerId!==drag.pid)return;
  var dx=e.clientX-drag.x0,dy=e.clientY-drag.y0;
  var mv=Math.hypot(dx,dy);
  if(mv>7)drag.moved=true;
  if(drag.moved){
    var dz=SECT.cur?Math.max(1,skyZoom):1;dx/=dz;dy/=dz;
    var limX=Math.max(90,W*.90),limY=Math.max(90,H*.90);
    BH.x=drag.bx+Math.max(-limX,Math.min(limX,dx));
    BH.y=drag.by+Math.max(-limY,Math.min(limY,dy));
    var bm=BH.R*BHSC*1.15*Math.max(1,bhSizeMul());
    BH.x=Math.max(bm,Math.min(W-bm,BH.x));
    BH.y=Math.max(bm,Math.min(H-bm,BH.y));
    if(SECT.cur&&typeof planetBhClamp==='function'){var pcl=planetBhClamp(BH.x,BH.y,bm/1.15);BH.x=pcl[0];BH.y=pcl[1];}   /* planet: BH mini boleh terbenam sedikit di balik limb, tidak sampai hilang */
    if(!SECT.cur&&drag.pr0>0&&typeof planetObjClamp==='function'){   /* overview: portal ikut jari tapi maksimal tenggelam PL3D_CFG.ptSink (1 = 50%, pusat di limb) di balik limb planet; geser BH sebesar koreksi supaya portal ikut tertahan */
      var pcx=drag.px0+(BH.x-drag.bx),pcy=drag.py0+(BH.y-drag.by),pco=planetObjClamp(pcx,pcy,drag.pr0,PL3D_CFG.ptSink);
      BH.x+=pco[0]-pcx;BH.y+=pco[1]-pcy;
    }
    mouse.tx=Math.max(-1,Math.min(1,dx/(Math.min(W,H)*.24)));
    mouse.ty=Math.max(-1,Math.min(1,dy/(Math.min(W,H)*.24)));
  }
}
function endBHDrag(e){
  if(!drag.on||e.pointerId!==drag.pid)return;
  var was=drag.moved;
  drag.on=false;
  try{cv.releasePointerCapture(e.pointerId);}catch(err){}
  if(was){
    haptic(8);
    var bpSw=(!SECT.cur&&typeof ptOvPos==='function')?ptOvPos():camBH();createBHShockwave(bpSw[0], bpSw[1]);
  }else if(drag.tapEligible){
    e.preventDefault();
    if(!SECT.cur&&!SECT.busy)smenuOpen();   /* tap portal overview = buka/tutup ikon sektor (D1); tap BH mini di sektor tidak melakukan apa-apa */
  }
}
document.addEventListener('pointerdown',function(e){
  if(beginBHDrag(e))return;
},{passive:false,capture:true});
document.addEventListener('pointermove',function(e){moveBHDrag(e);},{passive:true});
document.addEventListener('pointerup',function(e){endBHDrag(e);},{passive:false});
document.addEventListener('pointercancel',function(e){endBHDrag(e);},{passive:false});

/* ---------- mobile constellation pan + 2-finger rotate (±180°) ---------- */
function skyPanLimits(){
  var z=Math.min(skyZoom||1,3),lx,ly;   /* batas pan (ruang dunia) berhenti tumbuh di atas x3: x10 nggak perlu 10 layar ruang kosong */
  if(CAMERA_MODE){lx=Math.max(W*.62,Math.max(80,W*.38)*z);ly=Math.max(H*.62,Math.max(70,H*.32)*z);}
  else{lx=Math.max(80,W*.38)*z;ly=Math.max(70,H*.32)*z;}
  /* Landscape ROT: pan hidup di ruang sky (sebelum skyRot), jadi saat sky diputar ~90deg (kamera fokus rasi) sumbu x/y batasnya ikut tertukar */
  if(STG.rot){var sn=Math.sin(skyRot),k=sn*sn;return {x:lx*(1-k)+ly*k,y:ly*(1-k)+lx*k};}
  return {x:lx,y:ly};
}
function skyHitXY(x,y){
  /* Base star pos + pan, then through gSky - same rotation AND gravity-lens
     bend the canvas actually draws with. skyXF alone (the old behavior) put
     these buttons back at the right angle after a rotate but left them
     un-bent near Gargantua, so a star lensed toward/away from the black hole
     still had its invisible tap target sitting at the un-lensed spot. */
  return gSky(x+skyPan.x,y+skyPan.y);
}
/* Posisi bintang SFX di koordinat sky (cluster = bintang interaktif Pleiades), atau null kalau belum siap. */
function fxBase(d){
  var r=SKY.rasiBy[d.cons];
  if(r&&r.cluster){
    if(!PLEIADES.ready)return null;
    var pl=plInteractive();
    return pl?[PLEIADES.x+pl.x*PLEIADES.scale+mouse.x*1.4,PLEIADES.y+pl.y*PLEIADES.scale+mouse.y*1.0]:null;
  }
  var c=cons(d.cons),st=c&&c.stars&&c.stars[d.star];
  return st?[st.x,st.y]:null;
}
/* Taruh semua tombol #<key>-fx di atas bintangnya. hit=true: ikut lensing (skyHitXY); false: layout awal (+skyPan). */
function fxPlace(hit){
  for(var i=0;i<SKY.FX_KEYS.length;i++){
    var key=SKY.FX_KEYS[i],el=FXBTN[key],p=el&&fxBase(SKY.sfxBy[key]);
    if(!p)continue;
    var q=hit?skyHitXY(p[0],p[1]):[p[0]+skyPan.x,p[1]+skyPan.y];
    el.style.transform='translate('+Math.round(q[0])+'px,'+Math.round(q[1])+'px)';
  }
}
/* Sembunyikan tombol bintang yang bukan milik sektor yang lagi dibuka. */
function fxSectSync(){
  var inS=!SECT.on&&!!SECT.cur;
  for(var key in FXBTN)FXBTN[key].classList.toggle('fx-other',inS&&SECT.cur.ids.indexOf(SKY.sfxBy[key].cons)<0);
}
function syncSkyPanHits(){
  try{
    fxPlace(true); /* tombol hit bintang SFX ikut pan/zoom/lensing */
    catLockPlace(); /* reticle kunci bintang katalog ikut pan/zoom/lensing */
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
  /* FIX pinch zoom di cam fokus (dalam sektor): dulu SETIAP jari dicek ke hit-test bintang/asteroid/BH, dan di dalam sektor
     hampir seluruh layar = target bintang -> jari ke-2 ditolak -> pinch nggak pernah mulai. Sekarang semua kontak sentuh dicatat,
     dan jari ke-2 cuma ditolak kalau jatuh di UI (panel/tombol), bukan di bintang. */
  var UI_T='#terminal,#owl-panel,#owl-backdrop,#music-player,#bh-panel,#boot-screen,#signal-fragment,#cons-archive,#mode-cluster,#cam-zoom,#cg-btn,#cam-whisper,#cam-cat,#cam-ach,#lis-ask,#sect-menu,#title,#footer,#owl-source,#sky-pill,#bh-clock,#music-toggle';
  if(e.target.closest&&e.target.closest(UI_T))return false;
  if(!CAMERA_MODE)return false;   /* idle/mode biasa: geser + putar sky dimatikan; hanya cam constellation yang boleh */
  var multi=false;
  if(e.pointerType!=='mouse'){
    var tNow=performance.now(),ak;
    for(ak in skyAll)if(!skyPtrs[ak]&&tNow-skyAll[ak].t>10000)delete skyAll[ak];
    skyAll[e.pointerId]={x:e.clientX,y:e.clientY,t:tNow};
    multi=Object.keys(skyAll).length>=2;
  }
  if(multi){
    var ids2=Object.keys(skyAll);
    for(var qi=0;qi<ids2.length&&Object.keys(skyPtrs).length<2;qi++){
      if(!skyPtrs[ids2[qi]])skyPtrs[ids2[qi]]={x:skyAll[ids2[qi]].x,y:skyAll[ids2[qi]].y};
    }
  }else{
  if(e.target.closest&&e.target.closest('#terminal,.hit,.portal,#owl-source,#sky-pill,#owl-panel,#owl-backdrop,#bh-clock,#bh,#cam-zoom,#cg-btn,#cam-whisper,#cam-cat,#cam-ach,#lis-ask,#sect-menu,#bh-panel,#music-toggle,#music-player,#title,#footer,#boot-screen,#signal-fragment,#cons-archive,#mode-cluster'))return false;
  if(asteroidScreenAt(e.clientX,e.clientY)>=0)return false;
  if(constellationTargetAt(e.clientX,e.clientY))return false;
  var bpSky=camBH();
  var dBH=Math.hypot(e.clientX-bpSky[0],e.clientY-bpSky[1]);
  if(BHSC>.05&&bhDragAllowed()&&dBH<=bhGrabRadius()*(skyZoom>1?Math.min(1.35,0.85+0.25*skyZoom):1))return false;
  skyPtrs[e.pointerId]={x:e.clientX,y:e.clientY};
  }
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
  if(skyAll[e.pointerId]){skyAll[e.pointerId].x=e.clientX;skyAll[e.pointerId].y=e.clientY;skyAll[e.pointerId].t=performance.now();}
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
  /* Landscape ROT: pan ada di ruang sky yang sudah diputar skyRot (kamera fokus rasi => ~90deg), sedangkan jari terbaca di ruang stage.
     Putar balik delta jari dgn -skyRot (rumus sama dgn focusStep) supaya geser kiri/kanan di layar = sky gerak kiri/kanan. */
  if(STG.rot&&skyRot*skyRot>=1e-8){var rc=Math.cos(skyRot),rs=Math.sin(skyRot),qx=dx*rc+dy*rs;dy=-dx*rs+dy*rc;dx=qx;}
  /* skyPan hidup di ruang dunia lalu dikali skyZoom di skyXF (screen = c + z*(pt+pan-c)): 1px jari = z px layar, makin zoom makin sensitif.
     Bagi delta dengan zoom supaya langit mengikuti jari 1:1 di zoom berapa pun. */
  var zd=skyZoom>1?skyZoom:1;dx/=zd;dy/=zd;
  skyPan.x=Math.max(-lim.x,Math.min(lim.x,skyDrag.px+dx));
  skyPan.y=Math.max(-lim.y,Math.min(lim.y,skyDrag.py+dy));
  syncSkyPanHits();
}
function endSkyPan(e){
  delete skyAll[e.pointerId];
  if(skyPtrs[e.pointerId])delete skyPtrs[e.pointerId];
  var n=Object.keys(skyPtrs).length;
  if(n<2){
    if(skyRotDrag.on||skyPinch.on)skyGestureAt=performance.now();
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
document.addEventListener('click',function(e){
  if(skyGestureAt&&performance.now()-skyGestureAt<350){e.preventDefault();e.stopImmediatePropagation();}
},true);
document.addEventListener('pointerdown',function(e){
  if(drag.on)return;
  /* preventDefault only — never stopPropagation, so Konami swipe still sees the gesture. */
  if(beginSkyPan(e))e.preventDefault();
},{passive:false,capture:true});
document.addEventListener('pointermove',moveSkyPan,{passive:true});
document.addEventListener('pointerup',function(e){delete skyAll[e.pointerId];},true);
document.addEventListener('pointercancel',function(e){delete skyAll[e.pointerId];},true);
document.addEventListener('pointerup',endSkyPan,{passive:true});
document.addEventListener('pointercancel',endSkyPan,{passive:true});

/* Constellation Camera: mouse wheel / trackpad zoom (sky layer only). */
document.addEventListener('wheel',function(e){
  if(!CAMERA_MODE||!OBSERVE_MODE||SW)return;
  if(e.target&&e.target.closest&&e.target.closest('#music-player,#bh-panel,#boot-screen,#terminal,#signal-fragment'))return;
  e.preventDefault();
  stepSkyZoom(e.deltaY<0?1:-1);
},{passive:false});

/* Listener hover/klik tombol bintang SFX (semua dari registry). */
SKY.FX_KEYS.forEach(function(key){
  var el=FXBTN[key];if(!el)return;
  el.addEventListener('mouseenter',function(){hot=key;});
  el.addEventListener('mouseleave',function(){if(hot===key)hot=null;});
  el.addEventListener('click',function(){fxTap(key);});
});

/* ---------- easter eggs ---------- */
/* ---------- Konami comet: satu komet pecah jadi dua (biru + merah), ekor panjang berhias aurora ----------
   Tidak ada render loop baru: komet = entri SS (comet:true), digambar oleh drawShooting.
   Ekor + aurora di-bake sekali ke canvas kecil. Aurora digambar sebagai irisan yang bergelombang. */
var KCOMET={on:false},COMET_SPR=null;
/* Putar hue rgb 0..1 (matriks YIQ). SALINAN pl3dHue (17-planet3d.js) supaya komet tidak bergantung ke file planet. */
function cometHue(c,deg){
  var a=deg*Math.PI/180,cs=Math.cos(a),sn=Math.sin(a),r=c[0],g=c[1],b=c[2];
  return [r*(.299+.701*cs+.168*sn)+g*(.587-.587*cs+.330*sn)+b*(.114-.114*cs-.497*sn),
          r*(.299-.299*cs-.328*sn)+g*(.587+.413*cs+.035*sn)+b*(.114-.114*cs+.292*sn),
          r*(.299-.300*cs+1.250*sn)+g*(.587-.588*cs-1.050*sn)+b*(.114+.886*cs-.203*sn)];
}
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
  /* Aurora ala planet3d: gradien menurut palet (tengah = warna dasar, tepi = hue -32 lebih gelap, inti = hue +38 dicampur putih 25%),
     lalu sinar "melubangi" pita. Kanvas 2x lebar dan pola sinar TILEABLE (periode 512) -> drawAurora cukup menggeser x sumber untuk
     menggerakkan sinar sepanjang ekor (nol biaya tambahan). Pemudaran ke ujung ekor dipindah ke alpha per irisan di drawAurora. */
  function aurora(atm,seed){
    var c=document.createElement('canvas');c.width=Wd*2;c.height=AH;
    var x=c.getContext('2d'),r=seed,i;
    function rnd(){r=(r*1664525+1013904223)>>>0;return r/4294967296;}
    function q(col,m){return Math.max(0,Math.min(255,Math.round(col[0]*255*m)))+','+Math.max(0,Math.min(255,Math.round(col[1]*255*m)))+','+Math.max(0,Math.min(255,Math.round(col[2]*255*m)));}
    var cB=cometHue(atm,38),cT=cometHue(atm,-32);
    cB=[cB[0]*.75+.25,cB[1]*.75+.25,cB[2]*.75+.25];
    var gr=x.createLinearGradient(0,0,0,AH),D=[[0,cT,0,.85],[.2,cT,.2,.85],[.4,atm,.5,1],[.5,cB,.9,1],[.6,atm,.5,1],[.8,cT,.2,.85],[1,cT,0,.85]];
    D.forEach(function(st){gr.addColorStop(st[0],'rgba('+q(st[1],st[3])+','+st[2]+')');});
    x.globalCompositeOperation='lighter';
    x.fillStyle=gr;x.fillRect(0,0,Wd*2,AH);
    /* garis sinar vertikal khas aurora, ditulis di x dan x+512 supaya pola menyambung saat digeser */
    x.globalCompositeOperation='destination-out';
    for(i=0;i<70;i++){
      var rx=rnd()*Wd,rw=1+rnd()*3,ra=(.08+rnd()*.38).toFixed(2);
      x.fillStyle='rgba(0,0,0,'+ra+')';x.fillRect(rx,0,rw,AH);x.fillRect(rx+Wd,0,rw,AH);
    }
    return c;
  }
  COMET_SPR={
    cyan:wedge([[1,.20,'110,229,255'],[.6,.38,'140,238,255'],[.28,.85,'235,252,255']]),
    red:wedge([[1,.20,'255,60,70'],[.6,.36,'255,120,100'],[.28,.85,'255,228,220']]),
    pink:wedge([[1,.17,'255,64,110'],[.6,.30,'255,110,150']]),
    aurB:aurora([.31,.78,1],11),
    aurR:aurora([1,.42,.45],23)
  };
}
/* Komet pecah jadi DUA: induk jadi yang biru (lurus), serpihan jadi yang merah (menyimpang). */
function cometSplit(s,now,x,y){
  s.split=true;s.splitT=now;s.sx=x;s.sy=y;s.pal='blue';
  var base=Math.atan2(s.vy,s.vx),sp0=Math.hypot(s.vx,s.vy),rem=Math.max(900,s.life-(now-s.t)),a=base+.2,sp=sp0*.9;
  SS.push({x:x,y:y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,t:now,life:rem*1.08,
    comet:true,frag:true,pal:'red',grow:900,hr:s.hr*.92,L:s.L*.92,bend:-.1,seed:s.seed+.37});
  cometDebris(s,now,x,y,base,sp0);
  glitchUntil=now+520;
  haptic(16);
  try{
    var fl=document.getElementById('sn-flash');
    if(typeof snFlash==='function'&&snFlash(x,y,'255,80,120')){}   /* SNFX: flash sprite di canvas */
    else if(fl){
      fl.style.setProperty('--sx',Math.round(x)+'px');fl.style.setProperty('--sy',Math.round(y)+'px');
      fl.style.setProperty('--sn-rgb','255,80,120');
      fl.classList.remove('on');void fl.offsetWidth;fl.classList.add('on');
    }
  }catch(e){}
}
/* Pita aurora: 14 irisan sprite, tiap irisan bergeser naik-turun mengikuti gelombang. Sinar mengalir ke arah ekor (x sumber digeser per waktu),
   dan ujung ekor memudar lewat alpha per irisan (dulu di-bake ke sprite). */
function drawAurora(spr,L,hr,x,y,ang,a,now,seed){
  var NS=14,sw=512/NS,dw=L/NS,dh=hr*9,j,p,f,sc=(now*.045+seed*211)%512;
  g.save();g.translate(x,y);g.rotate(ang);
  for(j=0;j<NS;j++){
    p=j/NS;f=Math.min(1,p/.8);f=f*f*(3-2*f);
    g.globalAlpha=a*f*(.78+.22*Math.sin(now*.0031+j*.8+seed*7));
    g.drawImage(spr,(j*sw+sc)%512,0,sw+1,96,-L+j*dw,-dh/2+Math.sin(now*.0019+p*6+seed*6)*hr*1.7*(1-p*.55),dw+1,dh);
  }
  g.restore();
}
/* Kepala komet = batu 3D berapi (ast3dHeads di 12-ast3d.js, renderer GL 'big' yang sama dengan batu asteroid). drawComet mengisi COMET_HEADS,
   drawShooting memanggil cometHeadsFlush sekali per frame setelah semua komet. 3D tidak tersedia (potato/reduce/gagal/belum siap) -> bulatan putih seperti dulu. */
var COMET_HEADS=[];
function cometHeadsFlush(now){
  var L=COMET_HEADS,i,h,ok=false;
  if(!L.length)return;
  try{if(typeof ast3dHeads==='function')ok=ast3dHeads(L,now);}catch(e){ok=false;}
  if(!ok){
    for(i=0;i<L.length;i++){
      h=L[i];
      g.fillStyle='rgba('+(h.red?'255,238,232':'255,255,255')+','+(.95*h.a)+')';
      g.beginPath();g.arc(h.x,h.y,Math.max(1,h.r*.7),0,6.283);g.fill();
    }
  }
  L.length=0;
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
  /* kepala: glow 2D di sini, batu 3D digambar belakangan oleh cometHeadsFlush (di atas semua ekor) */
  var pulse=.88+.12*Math.sin(now*.011+s.seed*9);
  drawStarGlow(x,y,hr*1.5,red?'255,60,60':'255,70,120',a*.5*pulse);
  drawStarGlow(x,y,hr*1.05,red?'255,170,150':'150,240,255',a*.95);
  g.strokeStyle='rgba('+(red?'255,215,205':'225,250,255')+','+(.55*a)+')';g.lineWidth=.9;
  g.beginPath();g.moveTo(x-hr*2.8,y);g.lineTo(x+hr*2.8,y);g.moveTo(x,y-hr*2.8);g.lineTo(x,y+hr*2.8);g.stroke();
  COMET_HEADS.push({x:x,y:y,vx:s.vx,vy:s.vy,r:hr,a:a,red:red,k:red?1:0,seed:s.seed,pulse:pulse});
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
  var DELAY=2600,DUR=8800;   /* DUR: lama melintas (dtk x1000); makin besar = komet makin pelan */
  setTimeout(function(){
    if(SW||pageHidden){KCOMET.on=false;return;}
    /* Landscape ROT (STG.rot): kanvas/stage portrait diputar 90 derajat, planet ada di dasar layar NYATA. Jalur komet dihitung di ruang layar nyata (tegak, kiri -> kanan di atas planet)
       lalu dikonversi ke ruang stage (c2v), bukan x 0..W di stage (itu jadi vertikal di layar dan menembus planet). Portrait/desktop: ruang stage seperti semula. */
    var hbEl=document.getElementById('header'),rot=(typeof STG!=='undefined'&&STG.rot)?STG.rot:0,UW=rot?STG.iw:W,UH=rot?STG.ih:H,hb=0,hr0;
    if(hbEl){
      if(rot){hr0=hbEl.getBoundingClientRect();hb=(hr0.height<UH*.5)?hr0.bottom:0;}
      else hb=vrect(hbEl).bottom;
    }
    var top=Math.max(hb+14,UH*.12),bot=UH-Math.min(UH*.2,90),avail=Math.max(120,bot-top);
    var x0=-UW*.12,y0=top+avail*.08,x1=UW*1.12,y1=top+avail*.58,sec=DUR/1000,q0,q1;
    if(rot){q0=c2v(x0,y0);q1=c2v(x1,y1);x0=q0[0];y0=q0[1];x1=q1[0];y1=q1[1];}
    SS.push({x:x0,y:y0,vx:(x1-x0)/sec,vy:(y1-y0)/sec,t:performance.now(),life:DUR,
      comet:true,pal:'mix',splitU:.38,hr:Math.max(3.4,Math.min(7,Math.min(W,H)*.013)),
      L:Math.max(300,Math.min(760,Math.hypot(W,H)*.5)),bend:.12,seed:Math.random()});
  },DELAY);
  setTimeout(function(){KCOMET.on=false;},DELAY+DUR+400);
}
/* Puing pecahan komet: muncul SETELAH komet pecah, bertahap ~2,3 dtk. Lahir di sekitar EKOR aurora (di belakang kepala, sebar selebar pita), kecil dan pelan,
   lalu hanyut jatuh ke arah PLANET (pusat planet di ruang stage; planet digambar di atas langit jadi puing yang sampai tertutup = masuk atmosfer).
   Separuh biru (ekor induk), separuh merah (ekor serpihan). Tetap entri SS biasa (sprite goresan di drawShooting).
   Planet tidak ada / gagal dihitung -> target = tengah bawah layar. */
var DEBRIS_PAL=[['234,246,255','110,229,255'],['255,214,170','255,80,70']];
function cometPlanetTarget(){
  try{
    if(typeof pl3dSync==='function'&&typeof pl3dGeom==='function'&&typeof ptUp2Stage==='function'){
      pl3dSync();var gm=pl3dGeom();
      if(gm&&gm.R>0)return ptUp2Stage(gm.cx,gm.cy);
    }
  }catch(e){}
  return [W*.5,H*1.1];
}
function cometDebris(s,now,x,y,base,sp0){
  if(reduce||IS_POTATO||SW)return;
  var N=18,i;
  for(i=0;i<N;i++){
    (function(i){
      var d=i*120+Math.random()*80,k=i&1,ang0=k?base+.2:base,sk=k?sp0*.9:sp0,
          ux=Math.cos(ang0),uy=Math.sin(ang0),back=s.L*(.08+Math.random()*.7),lat=(Math.random()-.5)*s.hr*8,
          ox=x+ux*sk*d/1000-ux*back-uy*lat,oy=y+uy*sk*d/1000-uy*back+ux*lat,   /* posisi kepala saat itu, mundur ke ekor, geser menyamping */
          sp=95+Math.random()*95,jit=(Math.random()-.5)*.5;
      setTimeout(function(){
        if(SW||pageHidden)return;
        markActivity();
        var T=cometPlanetTarget(),ang=Math.atan2(T[1]-oy,T[0]-ox)+jit;
        SS.push({x:ox,y:oy,vx:Math.cos(ang)*sp,vy:Math.sin(ang)*sp,t:performance.now(),life:1500+Math.random()*1100,
          tl:.16,lw:1.1,c0:DEBRIS_PAL[k][0],c1:DEBRIS_PAL[k][1]});
      },d);
    })(i);
  }
}
function triggerKonami(){
  document.body.classList.add('konami');
  haptic(18);
  showSecret(T('toast.override'),1800);
  markActivity();   /* input keyboard tidak dihitung aktivitas; drawShooting berhenti di idleMode */
  konamiComet();
  try{if(typeof ast3dHeadsPrep==='function')ast3dHeadsPrep();}catch(eHp){}   /* compile shader kepala komet sekarang (komet baru muncul ~2,6 dtk lagi) */
  /* Cheat: selesaikan semua alignment (achievement ALIGNED). markObserved sengaja TIDAK disentuh, biar Constellation Log tetap jujur. */
  alignAll();
  showModeToast(T('toast.alignall'),null,2400);
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
    '.hit,.portal,#owl-source,#sky-pill,#owl-panel,#owl-backdrop,#bh-clock,#bh,#cam-zoom,#cg-btn,#cam-whisper,#cam-cat,#cam-ach,#lis-ask,#sect-menu,#bh-panel,#music-toggle,#music-player,#boot-screen,#signal-fragment,#cons-archive,#mode-cluster'
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
    var sp0=scrPt(e);konamiSwipeStart={x:sp0[0],y:sp0[1],id:e.pointerId};
  },{passive:true});
  document.addEventListener('pointerup',function(e){
    if(e.pointerType==='mouse')return;
    if(!konamiSwipeStart||e.pointerId!==konamiSwipeStart.id)return;
    var sp1=scrPt(e),dx=sp1[0]-konamiSwipeStart.x,dy=sp1[1]-konamiSwipeStart.y;
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
    var t=e.touches[0],sp2=scrPt(t);
    konamiSwipeStart={x:sp2[0],y:sp2[1],id:'touch'};
  },{passive:true});
  document.addEventListener('touchend',function(e){
    if(!konamiSwipeStart||!e.changedTouches.length)return;
    var t=e.changedTouches[0],sp3=scrPt(t),dx=sp3[0]-konamiSwipeStart.x,dy=sp3[1]-konamiSwipeStart.y;
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
var TERM_DIST=SKY.TERM_DIST;
var TERM_POOL=TXT.TERM_POOL;
var TERM_W=TXT.TERM_W;
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
  var h=[],s=T('term.session',{n:termPad(n,3)}),lt=last?new Date(last).toISOString().substr(11,8)+' UTC':T('term.unknown');
  if(n>=30&&(n===30||Math.random()<.25))return [T('term.sess.unk'),T('term.date.unk'),T('term.time.unk'),'> ...',T('term.notfirst')];
  if(n===20)return [T('term.returning'),'> ...','> ...',T('term.notexp')];
  if(n===1)return [T('term.access'),T('term.sess.init'),T('term.first'),T('term.notrec'),T('term.logging')];
  if(n<5)return [T('term.access'),T('term.granted'),T('term.prevfound'),s,T('term.lastobs',{t:lt}),T('term.obsret')];
  h=[T('term.returning'),T('term.memfound'),s];
  if(n>=12)h.push(T('term.memfrag'));
  return h;
}
function termFmtLY(d){return String(d).replace(/\B(?=(\d{3})+(?!\d))/g,',');}
function termContext(){
  var now=performance.now();
  /* '!' di depan = baris peringatan (merah muda) */
  if(typeof CLKD!=='undefined'&&CLKD&&(CLKD.k>.2||(CLKD.touchAt&&Date.now()-CLKD.touchAt<90000)))
    return [T('term.caution'),T('term.tempunst'),'> ...',
      T('term.localtime'),T('term.exttime'),T('term.obstime')];
  if(TERM_FOCUS&&now-TERM_FOCUS.at<90000){
    var fid=TERM_FOCUS.id;
    if(fid==='bh')return [
      T('term.caution'),T('term.tempunst'),'> ...',
      T('term.localtime'),T('term.exttime'),T('term.obstime')
    ];
    return termTarget(fid);
  }
  if(OBSERVE_MODE||(TERM_OBS_AT&&now-TERM_OBS_AT<90000))
    return [T('term.resid'),'> ...',T('term.noaccess')];
  if(typeof ALIGN!=='undefined'&&ALIGN.cid)return termTarget(ALIGN.cid);
  return null;
}
function termTarget(id){
  var nm=(typeof CONS_LABELS!=='undefined'&&CONS_LABELS[id]||id).toUpperCase(),d=TERM_DIST[id],o=[T('term.target',{s:nm})];
  if(d){var ds=termFmtLY(d);o.push(T('term.dist',{d:ds}),T('term.age',{d:ds}));}
  o.push(T('term.present'),T('term.absent'));
  return o;
}
var TERM_AT=0,TERM_TAIL=0,TERM_BODY=null,TERM_CUR=null,TERM_END=0,TERM_ASK=null,TERM_NOIN=0,TERM_TAPS=0,TERM_EXC=false,TERM_NOCLOSE=false;
var TERM_PROMPTS=TXT.TERM_PROMPTS;
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
function termTail(){termEmit(T('term.done'),420);termEmit(T('term.idle'),380);}
function termOwl(n){
  if(Math.random()<.5){
    termEmit(T('term.sysact'),1900);termEmit(T('term.obsact'),500);termEmit(T('term.owlact'),700,'term-owl',3400);
    return;
  }
  termEmit('> ...',1700);termEmit('> ...',650);termEmit(T('term.owlenter'),700,'term-owl');
  termEmit(T('term.owl1'),900,'term-owl');
  termEmit(T('term.sys1'),800);
  termEmit(T('term.owl2'),800,'term-owl');
  termEmit('SYSTEM :: ...',900);
  termEmit(T('term.owl3'),700,'term-owl',3600);
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
  if(TERM_TAPS===1){termEmit(T('term.input'),220);return;}
  if(TERM_TAPS>=6&&!TERM_EXC){
    TERM_EXC=true;
    termEmit(T('term.excess'),240,'term-warn');termEmit('> ...',650);termEmit(T('term.click'),420);
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
  var i,hd=mile?[T('term.returning'),T('term.session',{n:termPad(n,3)})]:termHeader(n,prevLast),base=Date.now()%60000;
  for(i=0;i<hd.length;i++)termEmit(hd[i],hd[i]==='> ...'?650:260);
  if(mile){
    var W='term-warn';
    termEmit(T('term.st.nom'),420);termEmit('> ...',700);termEmit('> ...',700);
    termEmit(T('term.st.obs'),520,W);termEmit(T('term.correct'),620);
    termEmit(T('term.st.obs'),520,W);termEmit(T('term.correct'),620);
    termEmit(T('term.st.obs'),520,W);
    termEmit(T('term.err.excl'),950,W,3800);
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
      TERM_ASK=null;termEmit(T('term.nolnput'),300);termTail();
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
var TG_POOL=TXT.TG_POOL;
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
  var gap=(TG&&TG.anchor)?0:((touchMode?10:12)+teleBubbleGap()),pad=10,maxW=Math.min(220,(W||innerWidth||360)*.72);
  if(STG.rot){
    var vv=bubbleXYRot(p,gap,pad,Math.min(220,STG.iw*.72));
    el.style.left=Math.round(vv[0])+'px';el.style.top=Math.round(vv[1])+'px';
    return;
  }
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
  var el=TG.el;if(!el||!TELE_CFG.bubble)return;
  try{UIS.pop('tele');}catch(eUP){}   /* bunyi bubble teleskop (bubble mati = tidak sampai sini = tanpa bunyi) */
  clearTimeout(el._t);clearTimeout(el._type);
  var short=msg.length<=24,txt=short?msg:teleWrapLines(msg,touchMode?24:28);
  el.classList.toggle('tele-short',short);
  el.textContent='';TG.on=true;placeTeleGreet();el.classList.add('on');
  var hold=Math.min(7000,Math.max(3200,2200+msg.length*42));
  teleTypeText(el,txt,function(){el._t=setTimeout(teleGreetHide,hold);},short?52:30);
}
function tgTrigger(gap,fresh){
  if(TG.busy||!TG.el||!TELE_CFG.bubble)return;
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


/* ---------- CLOCK TIME DILATION (portal overview / BH mini sektor terbenam di limb planet) ----------
   Makin dalam portal (overview) atau BH mini (sektor) terbenam di balik limb planet (0 -> batas clamp), makin parah jam kena dilatasi (cara lama: jarak Gargantua ke #bh-clock, jadi cadangan kalau planet mati): digit ter-scramble, kadang
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
  if(typeof planetSinkDepth==='function'&&PL3D_CFG.on&&PL3D.state!==3){
    /* Trigger = seberapa dalam portal overview / BH mini sektor terbenam di balik limb planet: 0% (tepi bawah menyentuh limb) -> 0, batas clamp (overview ptSink = 50% tenggelam; sektor bhSink x sinkK) -> 1.
       Posisi jam tidak dipakai lagi. Planet tidak tampil (cam mode, menu, belum siap) -> 0. */
    var sd=null,smx=0;
    if(!document.hidden&&BHSC>.05){
      if(SECT.cur){smx=PL3D_CFG.bhSink*PL3D_CFG.sinkK;if(smx>0)sd=planetSinkDepth(BH.x,BH.y,BH.R*BHSC*Math.max(1,bhSizeMul()),false);}
      else{var sr=ptOvR();smx=PL3D_CFG.ptSink;if(sr>0&&smx>0){var sp=ptOvPos();sd=planetSinkDepth(sp[0],sp[1],sr,true);}}
    }
    if(sd!=null&&smx>0){var su=Math.max(0,Math.min(1,sd/smx));t=su*su*(3-2*su);}
  }else if(C.box&&C.rinf>40&&!document.hidden&&BHSC>.05){   /* cadangan (planet dimatikan): cara lama, jarak Gargantua ke jam */
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
/* Teleskop: short-tap (pointerup) = bubble; long-press teleskop = kuning (summon/recall drone), long-press drone = pink (dock/undock). F8. */
(function(){
  var lpT=null,lpPid=null,lpX=0,lpY=0,lpMoved=false,lpFired=false,lpTg=null;
  function clearTimer(){if(lpT){clearTimeout(lpT);lpT=null;}}
  function reset(){clearTimer();lpPid=null;lpMoved=false;lpFired=false;lpTg=null;try{if(window.TXFX)TXFX.holdEnd();}catch(eH){}}
  /* F8: drone dites SEBELUM teleskop (orbit standby diberi jarak, tapi kalau berhimpit drone menang). Syarat UI/menu sama dengan teleskop. */
  function droneHitOk(e){
    if(SW||SECT.busy||CAMERA_MODE)return false;
    if(document.body.classList.contains('smenu-open')||(typeof SMENU!=='undefined'&&(SMENU.open||SMENU.closing)))return false;
    if(e.target&&e.target.closest&&e.target.closest('#bh-panel,#music-player,#mode-cluster,#cam-zoom,#cg-btn,#cam-whisper,#cam-cat,#cam-ach,#lis-ask,#sect-menu'))return false;
    if(typeof ALIGN!=='undefined'&&ALIGN.cid)return false;
    return !!(window.TXFX&&TXFX.droneAt&&TXFX.droneAt(e.clientX,e.clientY));
  }
  function teleHitOk(e){
    if(SW||SECT.busy||CAMERA_MODE)return false;   /* F9: mode cam = teleskop disembunyikan, tidak bisa di-hit */
    /* Window menu sektor (16): sky di bawahnya beku, tapi teleskop dites pakai koordinat layar dan handler ini fase capture di document
       (jalan SEBELUM listener #sect-menu + stopPropagation) -> tap tombol di atas teleskop dicuri. Selama menu terbuka/menutup: teleskop tidak ikut. */
    if(document.body.classList.contains('smenu-open')||(typeof SMENU!=='undefined'&&(SMENU.open||SMENU.closing)))return false;
    if(e.target&&e.target.closest&&e.target.closest('#bh-panel,#music-player,#mode-cluster,#cam-zoom,#cg-btn,#cam-whisper,#cam-cat,#cam-ach,#lis-ask,#sect-menu'))return false;
    if(typeof telescopeHitAt!=='function'||!telescopeHitAt(e.clientX,e.clientY))return false;
    if(typeof ALIGN!=='undefined'&&ALIGN.cid)return false;
    var _tp=typeof telescopeScreenPos==='function'?telescopeScreenPos():[0,0];
    var _dT=Math.hypot(e.clientX-_tp[0],e.clientY-_tp[1]);
    var _dS=typeof constellationHitDist==='function'?constellationHitDist(e.clientX,e.clientY):Infinity;
    if(_dS<Infinity&&_dT>_dS&&_dT>Math.max(22,W*.04))return false;
    return true;
  }
  document.addEventListener('pointerdown',function(e){
    var tg=droneHitOk(e)?'drone':(teleHitOk(e)?'tele':null);
    if(!tg)return;
    skyGestureAt=performance.now();
    e.stopPropagation();
    if(skyDrag.on&&skyDrag.pid===e.pointerId){
      skyDrag.on=false;
      try{cv.releasePointerCapture(e.pointerId);}catch(err){}
    }
    reset();lpPid=e.pointerId;lpX=e.clientX;lpY=e.clientY;lpTg=tg;
    try{if(window.TXFX)TXFX.holdStart(tg);}catch(eH){}   /* ring progres tahan di teleskop / drone (08-tx-drone.js) */
    lpT=setTimeout(function(){
      lpT=null;
      if(lpMoved||lpPid==null)return;
      lpFired=true;
      var ok=false;
      try{if(lpTg==='drone'){if(typeof txLongPressDrone==='function')ok=!!txLongPressDrone();}else if(typeof txLongPressTele==='function')ok=!!txLongPressTele();}catch(er){}
      if(ok)haptic(16);else lpFired=false;
    },580);
  },true);
  document.addEventListener('pointermove',function(e){
    if(lpPid==null||e.pointerId!==lpPid)return;
    if(Math.hypot(e.clientX-lpX,e.clientY-lpY)>10){lpMoved=true;clearTimer();}
  },true);
  function end(e){
    if(lpPid==null||e.pointerId!==lpPid)return;
    var fireBubble=!lpFired&&!lpMoved&&lpTg==='tele';   /* tap singkat drone = diam (tidak bocor ke bintang di bawahnya) */
    var wasLp=lpFired;
    reset();
    if(wasLp||!fireBubble)return;
    haptic(8);try{UIS.tap();}catch(eUT){}showSecretSequence();placeSecretMsg();
  }
  document.addEventListener('pointerup',end,true);
  document.addEventListener('pointercancel',function(e){if(e.pointerId===lpPid)reset();},true);
})();

/* BFCache restore (back from dumul.html): force a fresh boot so the
   Matrix warm-up and deferred render staging run again instead of returning
   directly into a potentially cold/heavy WebView state. */
window.addEventListener('pageshow',function(e){
  if(e.persisted)location.reload();
});

/* Pre-warm panel owl + music player (sekali, idle setelah masuk observatory; dipanggil 07-boot.js).
   Dua panel ini tersembunyi (visibility:hidden / opacity:0), jadi raster, layer compositor, dan cache glyph-nya baru dibayar di frame buka pertama.
   Di sini keduanya ditampilkan transparan (.001) tanpa transisi selama 4 frame lalu dikembalikan (CSS: .pw-warm di index.css). Tidak kelihatan, tidak bisa disentuh. */
var _pwDone=false,_pwTry=0;
function panelWarmOnce(){
  if(_pwDone)return;
  try{
    if(typeof IS_POTATO!=='undefined'&&IS_POTATO){_pwDone=true;return;}
    var bc=document.body.classList;
    if(document.hidden||bc.contains('sw')||bc.contains('owl-open')||bc.contains('smenu-open')||bc.contains('tesseract-running')){
      if(++_pwTry<6)setTimeout(panelWarmOnce,3000);
      return;
    }
    _pwDone=true;
    var els=[document.getElementById('owl-panel'),document.getElementById('music-player')].filter(function(e){return e&&!e.classList.contains('on')&&!e.classList.contains('open');});
    if(!els.length)return;
    els.forEach(function(e){e.classList.add('pw-warm');});
    var n=0;
    (function f(){if(++n<4){requestAnimationFrame(f);return;}els.forEach(function(e){e.classList.remove('pw-warm');});})();
  }catch(e){}
}
