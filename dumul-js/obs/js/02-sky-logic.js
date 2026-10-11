'use strict';
/* 02-sky-logic.js — data, Pleiades, memory, unlock, observation mode, alignment, time dilation, layout, astrophoto plate */
/* ---------- data: koordinat asli (RA derajat, Dec derajat) ---------- */
/* =====================================================================================================
   DATA RASI / BINTANG / SEKTOR ada di sky-data.js (dimuat sebelum file ini) — cara tambah rasi/SFX baru ditulis di header file itu.
   Di sini cuma tabel turunan + logika. Cek konsistensi data:  node check-sky.js
   ===================================================================================================== */
var CONS_OFF=SKY.consOff;   /* rasi dengan off:true di sky-data.js: data ada, UI mati (lihat sectShow) */
var CONS=SKY.cons;          /* geometri (titik + garis) — diproses di bawah */

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
var CAPS={bh:$('#cap-bh')};SKY.rasi.forEach(function(r){if(r.cap)CAPS[r.id]=$('#cap-'+r.id);}); /* caption rasi: dari `cap` di sky-data.js */
CONS.forEach(function(c){if(JOIN_LEAD[c.id])c.lead=cons(JOIN_LEAD[c.id]);}); /* rasi gabungan: goyangan ikut rasi 'lead' */

var PORTALS=[
 {id:'band',cons:'orion',stars:['mintaka','alnilam','alnitak'],from:'mintaka',hit:'alnilam',href:'dumul.html',title:'DUMUL',sub:'music \u00b7 Limerence album',col:'110,229,255',place:'fig-right'}
];
var TRIGGERS=SKY.TRIGGERS; /* key -> {id,cons,star,rgb}; hanya rasi yang punya SFX */

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
/* Lookup tanpa alokasi (dulu .filter(...)[0] tiap frame / tiap partikel). */
function plStarByName(n){var a=PLEIADES.bright;for(var i=0;i<a.length;i++)if(a[i].name===n)return a[i];}
function plInteractive(){var a=PLEIADES.bright;for(var i=0;i<a.length;i++)if(a[i].interactive)return a[i];}
/* Shared compact breath/pulse geometry — same size language as Orion belt portal rings (~8). */
var TRIGGER_PULSE_BASE=5.6;

/* ---------- Stellar Memory + Discovery Log + Signal Fragments ---------- */
var STELLAR_KEYS=SKY.STELLAR_KEYS;
var STELLAR_LABELS=SKY.STELLAR_LABELS;
var STELLAR_CONS=SKY.STELLAR_CONS;
var CONS_LABELS=SKY.CONS_LABELS;
/* Interactive stars per constellation (only the ones with SFX). */
var CONS_STARS=SKY.CONS_STARS;
var SIGNAL_FRAGMENTS=SKY.SIGNAL_FRAGMENTS;

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
/* Rasi tanpa SFX (CONS_STARS kosong) nggak punya bintang yang bisa "ditangkap", jadi nggak ada progres SCANNING -> READY.
   Status log-nya ikut alignment: sudah di-unlock (alignment selesai) = ARCHIVED. Rasi ber-SFX tetap lewat StellarMem.archived. */
function consNoSfx(cid){var s=CONS_STARS[cid];return !(s&&s.length);}
function consArchived(cid){return consNoSfx(cid)?isUnlocked(cid):StellarMem.isArchived(cid);}

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
var UNLOCK_CONS=SKY.UNLOCK_CONS; /* rasi yang bisa di-unlock/arsip (unlock:true di sky-data.js) */
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

function pad2(n){return (n<10?'0':'')+n;}
function formatSrCount(){
  var n=StellarMem.count();
  return (n<10?'0':'')+n+' <span>/ '+pad2(STELLAR_KEYS.length)+'</span>';
}
function renderStellarRecord(){
  var countEl=document.getElementById('sr-count');
  var badge=document.getElementById('sr-badge');
  var musicToggle=document.getElementById('music-toggle');
  var consEl=document.getElementById('sr-cons');
  var n=StellarMem.count();
  var nn=(n<10?'0':'')+n;
  if(countEl)countEl.innerHTML='// <em>'+nn+'</em>/'+pad2(STELLAR_KEYS.length);
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
    var cids=UNLOCK_CONS; /* baris Constellation Log = semua rasi unlock:true (urutan per sektor) */
    var html2='';
    for(var j=0;j<cids.length;j++){
      var cid=cids[j];
      var arch=consArchived(cid);
      var ready=!arch&&StellarMem.consComplete(cid);
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
  for(var i=0;i<STELLAR_KEYS.length;i++)if(SFX[STELLAR_KEYS[i]]===a)return STELLAR_KEYS[i];
  return null;
}
/* bintang di GEOMETRY (id bintang) -> key SFX-nya, atau null. Cluster (Pleione) nggak lewat sini. */
function starKeyOf(starId){return Object.prototype.hasOwnProperty.call(SKY.STAR_KEY,starId)?SKY.STAR_KEY[starId]:null;}
/* SFX yang lagi dipegang -> id rasi pemiliknya (atau null). */
function consIdFromAudio(a){var k=keyFromAudio(a);return k?TRIGGERS[k].cons:null;}
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
var LAST_SIGNAL_DATA=SKY.LAST_SIGNAL_DATA;
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
  if(CAMERA_MODE&&czEl&&(!STG.on||STG.rot)){
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
  /* Overview: out (shooting star) · inside a sector: in (signal dish) */
  return (typeof SECT!=='undefined'&&SECT.cur)?'in':'out';
}
function applyObserveIcon(btn){
  if(!btn)return;
  var state=observeIcon();
  var out=btn.querySelector('.ico-obs-out');
  var inn=btn.querySelector('.ico-obs-in');
  if(out)out.hidden=state!=='out';
  if(inn)inn.hidden=state!=='in';
}
function setObserveMode(on){
  if(typeof isLayoutEdit==="function"&&isLayoutEdit())return;
  OBSERVE_MODE=!!on;
  if(typeof termNoteObserve==='function')termNoteObserve(OBSERVE_MODE);
  document.body.classList.toggle('observe-mode',OBSERVE_MODE);
  var btn=document.getElementById('mode-observe');
  if(btn){
    btn.classList.toggle('on',OBSERVE_MODE);
    btn.setAttribute('aria-pressed',OBSERVE_MODE?'true':'false');
    applyObserveIcon(btn);
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
    (function(){var on=btn.querySelector('.ico-vol-on'),off=btn.querySelector('.ico-vol-off');if(on)on.hidden=!!RADIO_SILENCE;if(off)off.hidden=!RADIO_SILENCE;})();
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
  if(obs)obs.addEventListener('click',function(){if(typeof isLayoutEdit==='function'&&isLayoutEdit())return;setObserveMode(!OBSERVE_MODE);haptic(10);});
  if(sil)sil.addEventListener('click',function(e){
    e.preventDefault();e.stopPropagation();
    if(typeof window.__mpVolToggle==='function'){window.__mpVolToggle(e);haptic(8);return;}
    setRadioSilence(!RADIO_SILENCE);haptic(10);
  });
  var cam=document.getElementById('mode-camera');
  if(cam){
    cam.hidden=true;
    cam.addEventListener('click',function(){
      if(!OBSERVE_MODE){showModeToast('CAMERA REQUIRES\nOBSERVATION MODE',null,1800);return;}
      if(typeof isLayoutEdit==='function'&&isLayoutEdit())return;setCameraMode(!CAMERA_MODE);haptic(10);
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
  /* viaKey ada = langkah terakhir adalah bintang SFX → supernova + audio.
     viaKey null = rasi tanpa SFX → diam, cuma archive. */
  if(viaKey&&typeof triggerSupernova==='function')triggerSupernova(viaKey);
  var hasSfx=!!(SKY.CONS_STARS[cid]&&SKY.CONS_STARS[cid].length);
  if(!hasSfx){StellarMem.markArchived(cid);renderStellarRecord();} /* no-SFX: alignment selesai = langsung ARCHIVED di Constellation Log */
  showConsArchive(cid, hasSfx ? 'unlock' : undefined); /* no-SFX → toast ARCHIVED saja */
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
  if(UNLOCK_CONS.indexOf(c.id)<0)return false;        /* rasi tanpa SFX / belum unlock:true (mis. Gemini) nggak bisa di-alignment */
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
  return consIdFromAudio(activeSfx);
}
/* Nama track Stellar Signals yang lagi bunyi (sama dengan nama di panel musik), atau null kalau nggak ada. */
var SIGNAL_NAMES=SKY.SIGNAL_NAMES; /* key -> nama track di panel musik (dari sky-data.js) */
function playingSignalName(){
  if(typeof activeSfx==='undefined'||!activeSfx||activeSfx.paused||activeSfx.ended)return null;
  return SIGNAL_NAMES[keyFromAudio(activeSfx)]||null;
}
/* ---------- Gravitational time dilation (Schwarzschild) ----------
   Gargantua is the massive body, the constellation whose SFX is playing is the clock.
   Static-observer factor  dtau/dt = sqrt(1 - rs/r)   (r = distance BH <-> constellation centre, rs = 0.35*BH.R, only when dragged off home).
   The factor drives the SFX playbackRate (pitch follows - preservesPitch off) and a per-constellation
   visual clock (twinkle / sway / pulse phases). Floor 0.25 = lowest rate browsers play reliably. */
var TD={rate:1,a:null,last:0,lag:{},f:1};
function tdRelease(){
  if(TD.a){try{TD.a.playbackRate=1;}catch(e){}}
  TD.a=null;TD.rate=1;TD.ar=1;TD.f=1;
}
function updateTimeDilation(now){
  var dt=Math.min(50,Math.max(0,now-(TD.last||now)));TD.last=now;
  var cid=playingConstellationId(),a=cid?activeSfx:null;
  if(TD.a&&TD.a!==a)tdRelease();
  if(!a){return;}
  if(TD.a!==a){TD.a=a;TD.rate=1;TD.ar=1;
    try{a.preservesPitch=false;a.mozPreservesPitch=false;a.webkitPreservesPitch=false;}catch(e){}}
  var gm=focusGeom(cid),target=1,miniBH=false;
  if(SECT.cur&&SUM.on){
    if(!SUM.moved&&Math.hypot(BH.x-SUM.x0,BH.y-SUM.y0)>8)SUM.moved=true;   /* latch: sekali di-drag dari titik spawn, dilatasi aktif */
    miniBH=SUM.moved&&!(CAMERA_MODE&&camFocusId()==='bh');
  }   /* fokus kamera di BH mini: audio normal */   /* distorsi AUDIO cuma buat Gargantua mini di dalam sektor */
  if(gm&&BH.R>0&&BHSC>.05&&sectShow(cid)){   /* rasi sumber harus ada di sektor yang lagi dimasuki; kalau di sektor lain, BH mini nggak ngaruh */
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
  /* audio: di overview selalu normal; efek visual (lag) tetap ikut TD.rate */
  TD.ar=(TD.ar==null?1:TD.ar);
  TD.ar+=((miniBH?TD.rate:1)-TD.ar)*(1-Math.pow(.001,dt/1000));
  if(Math.abs(a.playbackRate-TD.ar)>.004){try{a.playbackRate=TD.ar;}catch(e){}}
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
  if(aid&&!(SECT.on&&!SECT.busy)){ /* overview diam: rasi nggak digambar, sweep twinkle-nya nggak perlu dihitung */
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
        (c._keys||(c._keys=Object.keys(c.stars))).forEach(function(key){
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
          (c._keys||(c._keys=Object.keys(c.stars))).forEach(function(key){
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
  var mw0=function(){var rr=rg.getBoundingClientRect();return STG.rot?vconv(rr).width:rr.width;};
  var measured=mw0();
  if(measured<=avail)return;
  /* Proportional estimate first — usually lands within a few px of the fit. */
  var estimated=Math.max(minSize,Math.floor(size*(avail/measured)));
  big.style.fontSize=estimated+'px';
  /* Safety correction: browser remains the authority (font metrics ≠ pure scale). */
  var guard=0;
  while(mw0()>avail&&estimated>minSize&&guard++<4){
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
  /* LAT/LON/AZ/EL cuma di mode observasi (🌠/📡) dan kamera (📷); tampilan biasa bersih. */
  if(!(OBSERVE_MODE||CAMERA_MODE))return;
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
  var T={tl:'[ LAT 00\u00b000\u2032N ]',tr:'[ LON 000\u00b000\u2032E ]',bl:'[ AZ 000\u00b0 ]',br:'[ EL 00\u00b0 ]'};
  if(!STG.rot){
    g.textBaseline='top';g.textAlign='left';g.fillText(T.tl,m+4,t+4);
    g.textAlign='right';g.fillText(T.tr,W-m-4,t+4);
    g.textBaseline='bottom';g.textAlign='left';g.fillText(T.bl,m+4,b-4);
    g.textAlign='right';g.fillText(T.br,W-m-4,b-4);
  }else{
    /* landscape: label tegak di pojok LAYAR (kiri-atas LAT, kanan-atas LON, kiri-bawah AZ, kanan-bawah EL) */
    var cs=[[m,t],[W-m,t],[m,b],[W-m,b]];
    for(var ci=0;ci<4;ci++){
      var sp=v2c(cs[ci][0],cs[ci][1]),lf=sp[0]<STG.iw/2,tp=sp[1]<STG.ih/2;
      var v=c2v(sp[0]+(lf?4:-4),sp[1]+(tp?4:-4));
      g.save();g.translate(v[0],v[1]);g.rotate(upAng());
      g.textAlign=lf?'left':'right';g.textBaseline=tp?'top':'bottom';
      g.fillText(tp?(lf?T.tl:T.tr):(lf?T.bl:T.br),0,0);
      g.restore();
    }
  }
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
/* ---------- Nebula plate (gambar) ----------
   Gambar nebula dipakai sebagai layer dasar plateDeep (overview) dan, lewat nebTint(), versi berwarna per sektor (dipakai sectDrawSky di 04-render.js).
   Semua di-bake SEKALI ke canvas (ukuran plate); per frame cuma drawImage. Gambar dimuat lazy, selesai dimuat -> bake ulang plate otomatis.
   Gagal dimuat / IS_POTATO -> plate prosedural lama. ?v= di src HARUS sama persis dengan SHELL service-worker.
   Tuning: A_OV = kuat nebula di overview, A_SEC = kuat nebula bertint di sektor, SPREAD = seberapa lebar variasi hue asli gambar dipertahankan di sektor (0 = satu hue datar, 1 = variasi penuh asli), SATMIX = seberapa saturasi sektor ikut menggeser saturasi blob (0..1), HC = hue pusat gambar asli (ungu ~270), TINT = (cuma fallback tanpa topeng) kuat warna sektor 0..1, SDIM = gelapkan plate di sektor sebelum nebula bertopeng (0..1), MASK = [batas bawah, atas] terang piksel untuk topeng latar transparan (null = matikan), ZF = seberapa ikut membesar saat zoom sektor (0 = tetap, .55 = sama dgn plate), VIG = kuat vignette tepi (0 = mati, 1 = default, >1 lebih gelap). */
var NEB={on:!IS_POTATO,A_OV:.85,A_SEC:.9,TINT:.65,SDIM:.7,MASK:[10,80],SPREAD:.45,SATMIX:.5,HC:270,ZF:.25,VIG:1,src:{p:'dumul-js/obs/img/nebula-portrait.webp?v=1',l:'dumul-js/obs/img/nebula-landscape.webp?v=1'},img:{},base:null,key:'',tint:{}};
function nebBase(EW,EH,ds){
  if(!NEB.on)return null;
  var k=W<H*1.05?'p':'l',im=NEB.img[k];
  if(!im){
    im=NEB.img[k]=new Image();
    im.onload=function(){im._ok=1;try{bakeAstroPlates();}catch(e){}};
    im.onerror=function(){NEB.on=false;NEB.base=null;NEB.tint={};};
    im.src=NEB.src[k];return null;
  }
  if(!im._ok){NEB.base=null;return null;}
  var cw=Math.max(1,Math.round(EW*ds)),ch=Math.max(1,Math.round(EH*ds)),hy=Math.round(BH.hy||H*.45),key=k+'|'+cw+'x'+ch+'|'+hy;
  if(NEB.base&&NEB.key===key)return NEB.base;
  var c=document.createElement('canvas');c.width=cw;c.height=ch;
  var x=c.getContext('2d'),sc=Math.max(cw/im.naturalWidth,ch/im.naturalHeight),dw=im.naturalWidth*sc,dh=im.naturalHeight*sc;
  x.drawImage(im,(cw-dw)/2,(ch-dh)/2,dw,dh);   /* cover-fit, crop tengah */
  /* redam bagian tengah supaya Gargantua + garis rasi tetap menonjol */
  var R=Math.min(W,H)*.62*ds,gx=(plateM+(BH.hx||W*.5))*ds,gy=(plateM+hy)*ds,gr=x.createRadialGradient(gx,gy,0,gx,gy,R);
  gr.addColorStop(0,'rgba(5,11,18,.62)');gr.addColorStop(.55,'rgba(5,11,18,.28)');gr.addColorStop(1,'rgba(5,11,18,0)');
  x.fillStyle=gr;x.fillRect(0,0,cw,ch);
  /* vignette tepi layar, ikut ter-bake ke nebula (overview + semua sektor, ikut parallax, 0 biaya per frame). Radius dari setengah diagonal supaya merata di portrait maupun landscape. */
  var hh=Math.hypot(cw,ch)*.5,vg2=x.createRadialGradient(cw/2,ch/2,hh*.45,cw/2,ch/2,hh);
  vg2.addColorStop(0,'rgba(0,0,0,0)');vg2.addColorStop(.7,'rgba(0,0,0,'+(.15*NEB.VIG)+')');vg2.addColorStop(1,'rgba(0,0,0,'+(.65*NEB.VIG)+')');
  x.fillStyle=vg2;x.fillRect(0,0,cw,ch);
  NEB.base=c;NEB.key=key;NEB.tint={};return c;
}
/* Versi nebula berwarna sektor (hue+saturasi dari SECTORS[].sky.rgb, terang tetap dari gambar). Di-bake lazy, sekali per sektor. */
var NEBH=[0,0,0];
function nebHsl(r,g,b){ /* rgb 0..255 -> NEBH=[h 0..360, s, l] */
  r/=255;g/=255;b/=255;
  var mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2,d=mx-mn,h=0,sa=0;
  if(d>1e-6){sa=l>.5?d/(2-mx-mn):d/(mx+mn);h=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;h*=60;}
  NEBH[0]=h;NEBH[1]=sa;NEBH[2]=l;
}
function nebC(p,q,t){if(t<0)t+=1;if(t>1)t-=1;return t<1/6?p+(q-p)*6*t:t<.5?q:t<2/3?p+(q-p)*(2/3-t)*6:p;}
function nebAng(a,b){return((a-b+540)%360)-180;}   /* selisih hue terpendek a-b, -180..180 */
/* Versi nebula berwarna sektor. Hue SEMUA blob digeser ke hue tema sektor tapi variasi relatifnya dipertahankan (SPREAD): ungu/pink/teal asli jadi
   biru/violet/cyan di autumn, oranye/merah/rose di summer, dst. Terang piksel tetap, bintang putih tetap putih (saturasi rendah tidak disentuh).
   Warna aksen sektor (acc) menarik hue di sekitar posisinya. Latar gelap gambar -> transparan (MASK). Di-bake lazy, sekali per sektor. */
function nebTint(s){
  if(!NEB.base||!s||!s.sky)return null;
  var c=NEB.tint[s.k];if(c)return c;
  var w=NEB.base.width,h=NEB.base.height,A=s.sky.acc,k=w/(W+2*plateM),bd=null,x;
  if(NEB.MASK){try{bd=NEB.base.getContext('2d').getImageData(0,0,w,h).data;}catch(e){bd=null;}}
  c=document.createElement('canvas');c.width=w;c.height=h;
  x=c.getContext('2d');
  if(bd){
    var id=x.createImageData(w,h),d=id.data,lo=NEB.MASK[0],hi=NEB.MASK[1],i,p,m,hb,hS,sS,hA=0,ax=0,ay=0,R=Math.max(w,h)*.9*.7,wg,dh,nh,ns,l,q,pp,rgb;
    rgb=s.sky.rgb.split(',');nebHsl(+rgb[0],+rgb[1],+rgb[2]);hS=NEBH[0];sS=NEBH[1];
    if(A){rgb=A.rgb.split(',');nebHsl(+rgb[0],+rgb[1],+rgb[2]);hA=NEBH[0];ax=(plateM+W*A.x)*k;ay=(plateM+H*A.y)*k;}
    var sf=1+NEB.SATMIX*(sS/.6-1);   /* faktor saturasi: sektor jenuh (autumn) sedikit menaikkan, sektor pucat (spring) sedikit menurunkan */
    for(i=0;i<d.length;i+=4){
      m=(.3*bd[i]+.59*bd[i+1]+.11*bd[i+2]-lo)/(hi-lo);m=m<0?0:m>1?1:m;
      if(m<=0)continue;   /* latar: transparan, lewati (~90% piksel) */
      d[i+3]=(m*m*(3-2*m)*255)|0;
      nebHsl(bd[i],bd[i+1],bd[i+2]);
      hb=hS;
      if(A){p=i>>2;wg=1-Math.sqrt(Math.pow(p%w-ax,2)+Math.pow(((p/w)|0)-ay,2))/R;if(wg>0)hb=hS+nebAng(hA,hS)*(wg>1?1:wg);}
      nh=(hb+nebAng(NEBH[0],NEB.HC)*NEB.SPREAD+720)%360/360;
      ns=NEBH[1]*sf;ns=ns>1?1:ns;l=NEBH[2];
      q=l<.5?l*(1+ns):l+ns-l*ns;pp=2*l-q;
      d[i]=nebC(pp,q,nh+1/3)*255;d[i+1]=nebC(pp,q,nh)*255;d[i+2]=nebC(pp,q,nh-1/3)*255;
    }
    x.putImageData(id,0,0);c._m=1;
  }else{
    /* fallback (getImageData ditolak): blend 'color' biasa, opaque */
    x.drawImage(NEB.base,0,0);
    x.globalCompositeOperation='color';
    if(x.globalCompositeOperation!=='color')return null;
    x.globalAlpha=NEB.TINT;x.fillStyle='rgb('+s.sky.rgb+')';x.fillRect(0,0,w,h);
    x.globalAlpha=1;x.globalCompositeOperation='source-over';
  }
  NEB.tint[s.k]=c;return c;
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
  /* nebula gambar (kalau sudah dimuat); kabut/glow prosedural lama diredam (dk) biar nggak dobel */
  var nb=nebBase(EW,EH,ds),dk=nb?.4:1;
  if(nb){dc.save();dc.setTransform(1,0,0,1,0,0);dc.globalAlpha=NEB.A_OV;dc.drawImage(nb,0,0,plateDeep.width,plateDeep.height);dc.restore();}
  /* cosmological dust: wide, low-alpha tinted clouds */
  var dust=[[.20,.30,.55,'110,229,255',.050,.4],[.80,.22,.50,'255,122,217',.040,-.3],[.62,.72,.60,'110,160,255',.050,.2],[.14,.84,.45,'255,196,140',.034,-.5],[.50,.48,.70,'140,120,230',.030,.1]];
  for(var di=0;di<dust.length;di++){
    var dd=dust[di],dr=dd[2]*Math.max(W,H)*.5,dg;
    dc.save();dc.globalAlpha=dk;dc.translate(dd[0]*W,dd[1]*H);dc.rotate(dd[5]);dc.scale(1,.55);
    dg=dc.createRadialGradient(0,0,0,0,0,dr);
    dg.addColorStop(0,'rgba('+dd[3]+','+dd[4]+')');dg.addColorStop(.55,'rgba('+dd[3]+','+(dd[4]*.45)+')');dg.addColorStop(1,'rgba('+dd[3]+',0)');
    dc.fillStyle=dg;dc.beginPath();dc.arc(0,0,dr,0,6.283);dc.fill();
    dc.restore();
  }
  /* Warna dasar langit (dulu hanya muncul saat Collapsars main): glow ungu-merah di sekitar posisi home Gargantua. */
  (function(){
    var R=Math.max(W,H)*1.1,hx=BH.hx||W*.5,hy=BH.hy||H*.45,tg=dc.createRadialGradient(hx,hy,0,hx,hy,R);
    tg.addColorStop(0,'rgba(150,80,255,.156)');tg.addColorStop(.38,'rgba(112,34,150,.099)');
    tg.addColorStop(.72,'rgba(125,22,48,.052)');tg.addColorStop(1,'rgba(90,10,20,0)');
    dc.save();dc.globalCompositeOperation='lighter';dc.globalAlpha=dk;dc.fillStyle=tg;dc.fillRect(-M,-M,EW,EH);dc.restore();
  })();
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
  try{document.body.classList.toggle('cam-compact',!!STG.rot||(H<=560&&W>=H*1.3));_cb.h=0;document.body.classList.toggle('touch-short',H<=560&&!!(window.matchMedia&&matchMedia('(pointer:coarse)').matches));}catch(e){}
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
  /* Kotak layout tiap rasi [x0,y0,x1,y1] — datanya di sky-data.js (RASI[].box.portrait / .land). */
  var boxes={};
  SKY.rasi.forEach(function(r){if(r.box)boxes[r.id]=(portrait?r.box.portrait:r.box.land)(W,top,ah,bot);});
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
  /* Komposisi sektor Orion: rasi yang punya `scene` di sky-data.js (yang off tidak ikut menentukan skala fit layar). */
  var SCN=(function(){
    var D=Math.PI/180,
        def=(function(){var d={};SKY.rasi.forEach(function(r){if(r.scene)d[r.id]=r.scene;});return d;})(), /* transformasi tiap rasi: `scene` di sky-data.js */
        plr=SKY.rasiBy.pleiades||{},plp=plr.ple,
        PC=plp?plp.at:[745.1,209.9],PS=plp?plp.ps:75,ids=SKY.rasi.filter(function(r){return r.scene&&!CONS_OFF[r.id];}).map(function(r){return r.id;}),pts=[],i,j,k2,c,f,p,st;
    function mk(d){
      var cs=Math.cos(d.th*D)*d.k,sn=Math.sin(d.th*D)*d.k,tx=d.tx,ty=d.ty;
      if(d.pv){tx=d.at[0]-(cs*d.pv[0]-sn*d.pv[1]);ty=d.at[1]-(sn*d.pv[0]+cs*d.pv[1]);}
      return function(x,y){return [cs*x-sn*y+tx,sn*x+cs*y+ty];};
    }
    /* Transform all stars to scene space (_sx/_sy). Fit uses ANCHORS only
       (scene.at + Pleiades centre) + fixed pad — so scaling individual k
       does NOT zoom the whole sky out. Figures can grow/shrink independently. */
    for(i=0;i<ids.length;i++){
      c=cons(ids[i]);if(!c)return null;
      f=mk(def[ids[i]]);
      for(k2 in c.stars){st=c.stars[k2];p=f(st.rx,st.ry);st._sx=p[0];st._sy=p[1];}
      if(c.nebula){p=f(c.nebula.rx,c.nebula.ry);c.nebula._sx=p[0];c.nebula._sy=p[1];}
    }
    var PK=.55; /* PK = pengecil khusus ukuran tampilan cluster Pleiades */
    var m=Math.max(28,Math.min(W*.11,48)),aL=m,aR=W-m,aT=top+36,aB=bot-72,fs=1,offx=0,offy=0;
    /* Batas scene (SKY.fit) menentukan skala/posisi fit layar. Di ?layout=1 batas ini DIKUNCI (bukan fs-nya), jadi
       geser/scale satu rasi nggak menggeser seluruh langit dan nggak ke-reset waktu ukuran layar berubah.
       Export editor menulis SKY.fit supaya tampilan live == tampilan editor. */
    var editOn=false;
    try{editOn=/[?&]layout=1\b/.test(location.search)||localStorage.getItem('obs_layout_on')==='1';}catch(eE){}
    var B=null,refit=!!window.__scnRefit;
    if(editOn&&window.__scnBounds&&!refit)B=window.__scnBounds;
    else if(!refit&&SKY.fit&&SKY.fit.length===4&&SKY.fit[1]>SKY.fit[0]&&SKY.fit[3]>SKY.fit[2])B=SKY.fit.slice();
    if(!B){
      var mnx=1e9,mxx=-1e9,mny=1e9,mxy=-1e9;
      for(i=0;i<ids.length;i++){var aa=def[ids[i]].at;mnx=Math.min(mnx,aa[0]);mxx=Math.max(mxx,aa[0]);mny=Math.min(mny,aa[1]);mxy=Math.max(mxy,aa[1]);}
      mnx=Math.min(mnx,PC[0]);mxx=Math.max(mxx,PC[0]);mny=Math.min(mny,PC[1]);mxy=Math.max(mxy,PC[1]);
      var pad=300;
      B=[mnx-pad,mxx+pad,mny-pad,mxy+pad];
    }
    if(editOn){window.__scnBounds=B.slice();window.__scnRefit=false;}
    var dx=B[1]-B[0],dy=B[3]-B[2];if(dx<1)dx=1;if(dy<1)dy=1;
    fs=Math.min((aR-aL)/dx,(aB-aT)/dy);
    offx=aL+((aR-aL)-dx*fs)/2-B[0]*fs;offy=aT+((aB-aT)-dy*fs)/2-B[2]*fs;
    for(i=0;i<ids.length;i++){
      c=cons(ids[i]);c.maxX=-1e9;c.maxY=-1e9;c.minX=1e9;c.minY=1e9;c.scale=fs*def[ids[i]].k;
      for(k2 in c.stars){
        st=c.stars[k2];st.x=offx+st._sx*fs;st.y=offy+st._sy*fs;
        c.maxX=Math.max(c.maxX,st.x);c.maxY=Math.max(c.maxY,st.y);c.minX=Math.min(c.minX,st.x);c.minY=Math.min(c.minY,st.y);
      }
      if(c.nebula){c.nebula.x=offx+c.nebula._sx*fs;c.nebula.y=offy+c.nebula._sy*fs;}
    }
    /* PS dikali fs (faktor fit-layar, bisa ~1.9 di HP) => PS=75 tampil ~140. PK = pengecil khusus ukuran tampilan,
       titik tengah cluster tetap di tempat yang sama. Mau lebih kecil/besar? ubah PK aja. */
    var psc=PS*fs*PK;
    PLEIADES.scale=psc;
    PLEIADES.x=offx+PC[0]*fs-.53*psc;
    PLEIADES.y=offy+PC[1]*fs-.42*psc;
    PLEIADES.ready=true;
    window.__scnFit={fs:fs,offx:offx,offy:offy,ids:ids.slice()};
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
        if(allowIds.indexOf(id)!==-1||CONS_OFF[id])continue; /* off:true di sky-data.js */
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
      for(var id in boxes){if(id===skipId||CONS_OFF[id])continue; /* off:true di sky-data.js */if(boxesOverlap(nMinX,nMaxX,nMinY,nMaxY,boxes[id])){hit=true;break;}}
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
  if(STG.rot){ /* mode ROT: jam ditaruh di pojok kiri-bawah LAYAR, teks tegak (jangan numpuk sama ikon HUD di kanan-bawah) */
    var cpv=c2v(12,STG.ih-30);
    clk.style.transform='translate('+Math.round(cpv[0])+'px,'+Math.round(cpv[1])+'px) rotate('+(STG.rot<0?90:-90)+'deg)';
  }else clk.style.transform='translate(calc(14px + env(safe-area-inset-left,0px)),'+Math.round(ft2.top-26)+'px)';
  SKY.rasi.forEach(function(r){ /* caption rasi: posisi dari `cap` {x:'mid'|'right', dx, y:'bottom'|'top', dy} di sky-data.js */
    var cp=r.cap,el=cp&&CAPS[r.id],c=cp&&cons(r.id);if(!el||!c)return;
    var x=(cp.x==='right'?c.maxX:(c.minX+c.maxX)/2)+cp.dx,y=(cp.y==='top'?c.minY:c.maxY)+cp.dy;
    /* caption jangan kepotong layar. Mode ROT (HP landscape): teks diputar tegak terhadap stage, jadi lebarnya memanjang ke sumbu-y stage -> jepit pakai pusat teks. */
    var cw=el.offsetWidth||(cp.text.length*11),chh=el.offsetHeight||12;
    if(STG.rot){var ccx=x+cw/2,ccy=y+chh/2;ccx=Math.max(8+chh/2,Math.min(W-8-chh/2,ccx));ccy=Math.max(8+cw/2,Math.min(H-8-cw/2,ccy));x=ccx-cw/2;y=ccy-chh/2;}
    else{x=Math.max(6,Math.min(W-6-cw,x));y=Math.max(top,Math.min(bot-14,y));}
    el.style.transform='translate('+Math.round(x)+'px,'+Math.round(y)+'px)'+STG.up;
  });
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
  CAPS.bh.style.transform='translate('+Math.round(bhp[0]-CAPS.bh.offsetWidth/2+3)+'px,'+Math.round(bhp[1]+BH.R*1.7*BHZ)+'px)'+STG.up;
  fxPlace(false); /* tombol hit bintang SFX (layout awal) */
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
    var mw = STG.rot ? 104 : Math.min(W<600?88:115, maxAllowed);   /* ROT: lebar label di layar tidak dibatasi sisa lebar sky */
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
  if(typeof window.__applyLayOV==='function')try{window.__applyLayOV();}catch(eOV){}
}

