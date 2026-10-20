'use strict';
/* 07-boot.js — boot, layout editor, render loop */
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
    [T('boot.observer'),T('boot.detected')],
    [T('boot.audio'),T('boot.buffering')],
    [T('boot.starmap'),T('boot.aligning')],
    [T('boot.lens'),T('boot.nominal')],
    [T('boot.audio'),T('boot.ready')],
    [T('boot.signal'),T('boot.stable')],
    [T('boot.starmap'),T('boot.locked')]
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
      rows.push('[ '+padLabel(f[0],12)+']  <span class="ok">'+f[1]+'</span>');
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

  var stars=STELLAR_KEYS.map(function(k){return SFX[k];}),t0=bootT0,done=false; /* semua audio SFX dari registry */
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
      '[ '+padLabel(T('boot.observer'),12)+']  <span class="ok">'+T('boot.online')+'</span>\n'+
      '[ '+padLabel(T('boot.starmap'),12)+']  <span class="ok">'+T('boot.locked')+'</span>\n'+
      '[ '+padLabel(T('boot.signal'),12)+']  <span class="ok">'+T('boot.open')+'</span>\n'+
      '[ '+padLabel(T('boot.boot'),12)+']  <span class="ok">'+T('boot.complete')+'</span>';
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
/* Stage (putar/skala) langsung diperbarui begitu ukuran/orientasi berubah; layout() penuh tetap di-debounce. */
function onGeo(){try{if(W&&!SW)stageCalc();}catch(eG){}scheduleLayout();}
window.addEventListener('resize',onGeo);
window.addEventListener('orientationchange',onGeo);
/* Landscape-kiri <-> landscape-kanan tidak mengubah ukuran viewport, jadi cuma event orientasi yang kena. */
try{if(screen.orientation&&screen.orientation.addEventListener)screen.orientation.addEventListener('change',onGeo);}catch(eO){}
/* Hybrid: visualViewport covers mobile URL-bar / soft-keyboard resizes that
   window.resize sometimes misses. Same debounced scheduler — not a replace. */
if(window.visualViewport){
  window.visualViewport.addEventListener('resize',onGeo);
}
/* ready starts false: this object existing only means the script parsed,
   not that boot finished and the render loop is actually running. Flipped
   to true from startRenderLoop() once frames are really being produced. */

/* ========== LAYOUT EDITOR v4 (?layout=1) ==========
   Buka: dumul17.github.io/?layout=1  → masuk sektor (tap ikon) → tap rasi → geser / handle pojok kanan-bawah = ukuran.
   PREVIEW = lihat hasil asli tanpa HUD (tombol ✎ EDIT di pojok kembali). SAVE = draft di localStorage.
   COPY = teks buat ditempel ke sky-data.js (nilai ABSOLUT: scene/ple/ov + SKY.fit).
   Draft otomatis dibuang kalau sky-data.js berubah (jadi data baru nggak ketimpa draft lama).
   =================================================== */

/* Override layar (ov) dari sky-data.js / editor. Nilai editor = ABSOLUT (menggantikan ov sky-data, bukan ditumpuk).
   Dipanggil di akhir layout(), untuk SEMUA sektor (bukan cuma sektor yang lagi dibuka). */
window.__applyLayOV=function(){
  var ov={};
  SKY.rasi.forEach(function(r){
    if(r.scene||r.ple||r.off)return;
    var s=window.__layOV&&window.__layOV[r.id],o=s||r.ov;if(!o)return;
    ov[r.id]={ox:o.ox||0,oy:o.oy||0,k:o.k||1,th:o.th||0};
  });
  Object.keys(ov).forEach(function(id){
    var o=ov[id],c=cons(id);if(!c||c.minX==null||c.minX>1e8)return;
    var cx=(c.minX+c.maxX)/2,cy=(c.minY+c.maxY)/2,k=o.k,th=o.th*Math.PI/180,cs=Math.cos(th),sn=Math.sin(th);
    (window.__ovPivot=window.__ovPivot||{})[id]=[cx,cy]; /* titik putar dasar tiap rasi (dipakai edit grup sektor) */
    var nMin=1e9,nMax=-1e9,nMinY=1e9,nMaxY=-1e9;
    Object.keys(c.stars).forEach(function(key){
      var s=c.stars[key],dx=(s.x-cx)*k,dy=(s.y-cy)*k;
      s.x=cx+dx*cs-dy*sn+o.ox;s.y=cy+dx*sn+dy*cs+o.oy;
      if(s.x<nMin)nMin=s.x;if(s.x>nMax)nMax=s.x;if(s.y<nMinY)nMinY=s.y;if(s.y>nMaxY)nMaxY=s.y;
    });
    c.minX=nMin;c.maxX=nMax;c.minY=nMinY;c.maxY=nMaxY;
    if(c.nebula){var n=c.nebula,ndx=(n.x-cx)*k,ndy=(n.y-cy)*k;n.x=cx+ndx*cs-ndy*sn+o.ox;n.y=cy+ndx*sn+ndy*cs+o.oy;}
  });
};

(function layoutEditor(){
  var enabled=false;
  try{enabled=/[?&]layout=1\b/.test(location.search)||localStorage.getItem('obs_layout_on')==='1';}catch(e){}
  if(!enabled)return;
  window.__layoutEditMode=true;
  document.body.classList.add('layout-edit');

  var LS_KEY='obs_layout_v3';
  var sel=null,drag=null,rs=null,hud=null,info=null,ring=null,preview=false,collapsed=false,stepI=1,rq=0,dropped=false,grp=false,HIS=[],hi=-1,hFlag=false;
  var ST=[6,16,40],RT=[.5,2,5],SCF=[.01,.03,.08];
  window.__layOV=window.__layOV||{};
  try{localStorage.removeItem('obs_layout_v2');}catch(e0){}

  function hash(s){var h=5381,i;for(i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;return String(h>>>0);}
  var BASE=(function(){try{return hash(JSON.stringify({f:SKY.fit||null,r:SKY.rasi.map(function(r){return [r.id,r.scene||null,r.ple||null,r.ov||null];})}));}catch(e){return '0';}})();

  function loadSaved(){
    try{
      var raw=localStorage.getItem(LS_KEY);if(!raw)return;
      var d=JSON.parse(raw);
      if(d.base!==BASE){localStorage.removeItem(LS_KEY);dropped=true;return;}
      if(d.ov)window.__layOV=d.ov;
      if(d.fit&&d.fit.length===4)window.__scnBounds=d.fit.slice();
      SKY.rasi.forEach(function(r){
        var s=d.scene&&d.scene[r.id];if(!s)return;
        if(s.scene&&r.scene){r.scene.k=s.scene.k;r.scene.th=s.scene.th;r.scene.at=s.scene.at.slice();if(s.scene.pv)r.scene.pv=s.scene.pv.slice();}
        if(s.ple&&r.ple){r.ple.at=s.ple.at.slice();if(typeof s.ple.ps==='number')r.ple.ps=s.ple.ps;}
      });
    }catch(e){console.warn('layout load',e);}
  }
  /* Bounds fit ASLI dihitung dari data sky-data.js SEBELUM draft diterapkan. Dikunci selama edit, jadi
     menggeser anchor / memperbesar rasi nggak pernah ikut mengubah skala layar (cuma tombol FIT yang menghitung ulang). */
  (function(){
    if(window.__scnBounds)return;
    if(SKY.fit&&SKY.fit.length===4){window.__scnBounds=SKY.fit.slice();return;}
    var a=[1e9,-1e9,1e9,-1e9];
    function add(p){a[0]=Math.min(a[0],p[0]);a[1]=Math.max(a[1],p[0]);a[2]=Math.min(a[2],p[1]);a[3]=Math.max(a[3],p[1]);}
    SKY.rasi.forEach(function(r){if(r.off)return;if(r.scene)add(r.scene.at);else if(r.ple)add(r.ple.at);});
    if(a[0]<1e8)window.__scnBounds=[a[0]-300,a[1]+300,a[2]-300,a[3]+300];
  })();
  loadSaved();

  function rnd(n){return Math.round(n*1000)/1000;}
  function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
  function getOV(id){var o=window.__layOV[id];if(o)return o;var b=(SKY.rasiBy[id]||{}).ov;return {ox:(b&&b.ox)||0,oy:(b&&b.oy)||0,k:(b&&b.k)||1,th:(b&&b.th)||0};}

  function sectorIds(){
    if(!SECT.cur)return [];
    return SKY.rasi.filter(function(r){return !r.off&&r.sector===SECT.cur.k;}).map(function(r){return r.id;});
  }

  /* ==================== EDITOR BINTANG (template katalog: nama / fx / fy / r) ====================
     Tombol ★ BINTANG di HUD -> panel daftar SEMUA titik rasi yang dipilih. Edit nama (kosong = "???"), fx, fy, r lewat kolom angka,
     geser bintang langsung di kanvas (tap/geser titik saat panel terbuka), atau ←↑↓→ di HUD (menggeser bintang terpilih).
     Draft tersimpan otomatis di localStorage (kunci terpisah dari draft rasi). COPY RASI = blok bintang rasi ini, COPY UBAHAN = baris yang berubah
     di semua rasi; keduanya format sky-data.js (key & urutan tetap, baris yang berubah ditandai // *).
     Catatan: kotak batas rasi (c.minx/miny/bw/bh) DIKUNCI selama edit supaya bintang lain tidak ikut bergeser; setelah data ditempel ke sky-data.js
     dan dimuat ulang, kotak batas dihitung ulang dari data baru. fx/fy itu koordinat peta referensi (bukan 0..1). */
  var STAR_LS='obs_layout_stars_v1',STAR_ORIG={},STAR_BASE='';
  var stOnly=false,stOpen=false,stKey=null,stCid=null,stDrag=null,stPanel=null,stRing=null;
  function rnd1(n){return Math.round(n*10)/10;}
  function fmtN(v){return String(Math.round(v*100)/100);}   /* fx/fy: apa adanya sampai 2 desimal (data asli bisa 283 atau 283.5) */
  function fmtR(v){return (Math.round(v*100)/100).toFixed(2).replace(/0$/,'');}   /* r: 2.23 / 2.2 / 2.0 seperti di sky-data.js */
  function stEsc(x){return String(x).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');}
  function stApply(s,e){
    if(typeof e.fx==='number'){s.fx=e.fx;s.rx=e.fx;}
    if(typeof e.fy==='number'){s.fy=e.fy;s.ry=e.fy;}
    if(typeof e.r==='number')s.r=e.r;
    if('name' in e){if(e.name)s.name=e.name;else delete s.name;}
  }
  (function(){
    var h=[];
    SKY.cons.forEach(function(c){STAR_ORIG[c.id]={};Object.keys(c.stars).forEach(function(k){var s=c.stars[k];STAR_ORIG[c.id][k]={fx:s.fx,fy:s.fy,r:s.r,name:s.name||''};h.push(c.id+'.'+k+'='+s.fx+','+s.fy+','+s.r+','+(s.name||''));});});
    STAR_BASE=hash(h.join('|'));
    try{
      var raw=localStorage.getItem(STAR_LS);if(!raw)return;
      var d=JSON.parse(raw);
      if(d.base!==STAR_BASE){localStorage.removeItem(STAR_LS);return;}   /* sky-data.js bintang berubah -> draft lama dibuang */
      Object.keys(d.ed||{}).forEach(function(cid){var c=cons(cid);if(!c)return;Object.keys(d.ed[cid]).forEach(function(k){var s=c.stars[k];if(s)stApply(s,d.ed[cid][k]);});});
    }catch(e){console.warn('stars load',e);}
  })();
  function stChanged(cid,k,s){var o=STAR_ORIG[cid]&&STAR_ORIG[cid][k];return !o||o.fx!==s.fx||o.fy!==s.fy||o.r!==s.r||o.name!==(s.name||'');}
  function stEdits(){
    var ed={},n=0;
    CONS.forEach(function(c){Object.keys(c.stars).forEach(function(k){var s=c.stars[k];if(!stChanged(c.id,k,s))return;(ed[c.id]=ed[c.id]||{})[k]={fx:s.fx,fy:s.fy,r:s.r,name:s.name||''};n++;});});
    return {ed:ed,n:n};
  }
  function saveStars(){
    try{var e=stEdits();if(e.n)localStorage.setItem(STAR_LS,JSON.stringify({base:STAR_BASE,ed:e.ed}));else localStorage.removeItem(STAR_LS);}catch(x){}
  }
  function stFmt(k,s,mark){
    var o=['fx:'+fmtN(s.fx),'fy:'+fmtN(s.fy),'r:'+fmtR(s.r)];
    if(s.c!==undefined)o.push("c:'"+s.c+"'");
    if(s.name)o.push("name:'"+String(s.name).replace(/'/g,"\\'")+"'");
    if(typeof s.nx==='number')o.push('nx:'+s.nx);
    if(typeof s.dy==='number')o.push('dy:'+s.dy);
    if(s.specAfter!==undefined)o.push('specAfter:'+JSON.stringify(s.specAfter));
    return '   '+k+':{'+o.join(',')+'},'+(mark?'  // *':'');
  }
  function stExport(onlyChanged){
    var L=[],any=false;
    L.push(onlyChanged?'// BINTANG UBAHAN: ganti baris dengan key yang sama di stars:{...} tiap rasi di sky-data.js (key & urutan jangan diubah).'
                      :'// BINTANG '+(stCid||'').toUpperCase()+': ganti SELURUH isi stars:{...} rasi ini di sky-data.js. Baris bertanda // * = berubah dari data sekarang.');
    CONS.forEach(function(c){
      if(!onlyChanged&&c.id!==stCid)return;
      var blk=[];
      Object.keys(c.stars).forEach(function(k){var s=c.stars[k],ch=stChanged(c.id,k,s);if(onlyChanged&&!ch)return;blk.push(stFmt(k,s,ch));});
      if(blk.length){any=true;L.push('');L.push('=== '+c.id+' ===');L=L.concat(blk);}
    });
    return any?L.join('\n'):'';
  }
  function stCopy(t,msg){
    if(!t){toast('TIDAK ADA UBAHAN');return;}
    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(function(){toast(msg);}).catch(function(){prompt('Copy:',t);});
    else prompt('Copy:',t);
    console.log('[stars export]\n'+t);
  }
  /* peta linear (rx,ry)->(x,y) rasi ini (kemiripan: geser+putar+skala) lewat kuadrat terkecil; dipakai mengubah geseran layar jadi geseran fx/fy */
  function stJac(c){
    var ks=Object.keys(c.stars),n=ks.length,i,s,mx=0,my=0,mu=0,mv=0;
    if(n<2)return null;
    for(i=0;i<n;i++){s=c.stars[ks[i]];mx+=s.rx;my+=s.ry;mu+=s.x;mv+=s.y;}
    mx/=n;my/=n;mu/=n;mv/=n;
    var sxx=0,sxy=0,syy=0,a=0,b=0,cc=0,d=0,dx,dy,du,dv;
    for(i=0;i<n;i++){s=c.stars[ks[i]];dx=s.rx-mx;dy=s.ry-my;du=s.x-mu;dv=s.y-mv;sxx+=dx*dx;sxy+=dx*dy;syy+=dy*dy;a+=du*dx;b+=du*dy;cc+=dv*dx;d+=dv*dy;}
    var det=sxx*syy-sxy*sxy;if(Math.abs(det)<1e-6)return null;
    var i11=syy/det,i12=-sxy/det,i22=sxx/det;
    return [a*i11+b*i12,a*i12+b*i22,cc*i11+d*i12,cc*i12+d*i22];
  }
  function stDelta(c,dx,dy){
    var A=stJac(c);if(!A)return [dx,dy];
    var det=A[0]*A[3]-A[1]*A[2];if(Math.abs(det)<1e-9)return [dx,dy];
    return [(A[3]*dx-A[1]*dy)/det,(-A[2]*dx+A[0]*dy)/det];
  }
  function stMove(s,dr){s.fx=rnd1(s.fx+dr[0]);s.rx=s.fx;s.fy=rnd1(s.fy+dr[1]);s.ry=s.fy;}
  function stOK(){
    if(!SECT.cur){toast('MASUK SEKTOR DULU');return false;}
    if(!sel||sel==='*'){toast('PILIH SATU RASI DULU');return false;}
    if(sel==='pleiades'){toast('PLEIADES: DATA DI 02-sky-logic.js (BELUM)');return false;}
    return !!cons(sel);
  }
  function stNum(v){return typeof v==='number'?fmtN(v):'';}
  /* Saran nama IAU per rasi (dari ingatan, buat autocomplete; cek lagi ke daftar IAU WGSN kalau ragu). Nama yang sudah dipakai di rasi itu otomatis disaring. */
  var IAU_SUG={
    orion:['Betelgeuse','Rigel','Bellatrix','Mintaka','Alnilam','Alnitak','Saiph','Meissa','Hatysa','Tabit','Thabit'],
    virgo:['Spica','Vindemiatrix','Porrima','Zavijava','Zaniah','Heze','Syrma','Auva','Minelauva','Khambalia'],
    canis:['Sirius','Adhara','Wezen','Mirzam','Aludra','Furud','Muliphein','Unurgunite'],
    taurus:['Aldebaran','Alnath','Ain','Alcyone','Atlas','Electra','Maia','Merope','Taygeta','Pleione','Celaeno','Asterope','Prima Hyadum','Secunda Hyadum','Tianguan'],
    bootes:['Arcturus','Izar','Nekkar','Seginus','Muphrid','Princeps','Alkalurops','Merga'],
    scorpius:['Antares','Shaula','Sargas','Dschubba','Acrab','Lesath','Girtab','Wei','Fang','Alniyat','Larawag','Xamidimura','Paikauhale','Jabbah','Iklil'],
    gemini:['Castor','Pollux','Alhena','Wasat','Mebsuta','Mekbuda','Tejat','Propus','Alzirr','Jishui'],
    ursa:['Dubhe','Merak','Phecda','Megrez','Alioth','Mizar','Alkaid','Alcor','Alula Australis','Alula Borealis','Muscida','Talitha','Tania Borealis','Tania Australis'],
    leo:['Regulus','Denebola','Algieba','Zosma','Chertan','Adhafera','Rasalas','Algenubi','Alterf','Subra'],
    hydra:['Alphard','Ashlesha','Minchir','Zhang'],
    sagit:['Kaus Australis','Kaus Media','Kaus Borealis','Nunki','Ascella','Alnasl','Arkab Prior','Arkab Posterior','Albaldah','Polis','Rukbat','Terebellum','Ainalrami'],
    lyra:['Vega','Sheliak','Sulafat','Aladfar','Alathfar'],
    cygnus:['Deneb','Sadr','Gienah','Albireo','Fawaris','Azelfafage','Aljanah'],
    ophiuchus:['Rasalhague','Sabik','Yed Prior','Yed Posterior','Cebalrai','Marfik','Han'],
    cassiopeia:['Schedar','Caph','Navi','Ruchbah','Segin','Achird','Fulu'],
    perseus:['Mirfak','Algol','Atik','Menkib','Misam','Miram'],
    aries:['Hamal','Sheratan','Mesarthim','Botein','Bharani'],
    aquila:['Altair','Tarazed','Alshain','Okab'],
    pegasus:['Markab','Scheat','Algenib','Enif','Homam','Matar','Biham','Sadalbari','Salm','Alpheratz'],
    pisces:['Alrescha','Alpherg','Fumalsamakah','Torcular'],
    auriga:['Capella','Menkalinan','Mahasim','Hassaleh','Almaaz','Haedus','Saclateni','Prijipati'],
    canmin:['Procyon','Gomeisa']
  };
  function stIauOpts(){
    var c=cons(stCid),used={},sug=IAU_SUG[stCid]||[],h='';
    if(c)Object.keys(c.stars).forEach(function(k){var n=c.stars[k].name;if(n)used[String(n).toLowerCase()]=1;});
    sug.forEach(function(n){if(!used[n.toLowerCase()])h+='<option value="'+stEsc(n)+'">';});
    return h;
  }
  /* urutan ??? : paling terang (r terbesar) dulu — bintang terang paling mungkin punya nama IAU */
  function stUnkOrder(c){
    var ks=Object.keys(c.stars),idx={};ks.forEach(function(k,i){idx[k]=i;});
    var u=ks.filter(function(k){return !c.stars[k].name;});
    u.sort(function(a,b){return (c.stars[b].r-c.stars[a].r)||(idx[a]-idx[b]);});
    return u;
  }
  function stUnkN(c){var n=0,k;for(k in c.stars)if(!c.stars[k].name)n++;return n;}
  function stCount(){var c=cons(stCid),el=document.getElementById('lay-sc');if(!c||!el)return;el.textContent=stUnkN(c)+'/'+Object.keys(c.stars).length+' ???';var dl=document.getElementById('lay-iau');if(dl)dl.innerHTML=stIauOpts();}
  function stRender(){
    var c=cons(stCid);if(!c||!stPanel)return;
    var ks=Object.keys(c.stars),rows='',h;
    if(stOnly){var uo=stUnkOrder(c);if(stKey&&c.stars[stKey]&&c.stars[stKey].name)uo.unshift(stKey);ks=uo;}
    ks.forEach(function(k){
      var s=c.stars[k];
      if(stOnly&&s.name&&k!==stKey)return;
      rows+='<div class="sr'+(k===stKey?' on':'')+(stChanged(stCid,k,s)?' ch':'')+'" data-k="'+stEsc(k)+'"><div class="sk">'+stEsc(k)+'</div>'
        +'<input class="sn" data-f="name" list="lay-iau" placeholder="???" autocomplete="off" autocapitalize="words" enterkeyhint="next" value="'+stEsc(s.name||'')+'">'
        +'<input data-f="fx" type="number" step="1" inputmode="decimal" value="'+stNum(s.fx)+'">'
        +'<input data-f="fy" type="number" step="1" inputmode="decimal" value="'+stNum(s.fy)+'">'
        +'<input data-f="r" type="number" step="0.1" inputmode="decimal" value="'+stNum(s.r)+'"></div>';
    });
    if(!rows)rows='<div class="se">semua bintang rasi ini sudah bernama \u2713</div>';
    h='<div class="sh"><b>\u2605 '+stEsc(stCid.toUpperCase())+'</b><span class="sc" id="lay-sc"></span><span class="g"></span>'
      +'<button data-sa="only" class="'+(stOnly?'on':'')+'" title="Tampilkan hanya bintang tanpa nama">???</button>'
      +'<button data-sa="unk" title="Lompat ke bintang ??? berikutnya">\u203a???</button>'
      +'<button data-sa="copy" title="Copy semua bintang rasi ini">COPY</button>'
      +'<button data-sa="copyd" title="Copy hanya baris yang berubah">\u0394</button>'
      +'<button data-sa="rstc" title="Kembalikan rasi ini ke data sky-data.js">RST</button>'
      +'<button data-sa="x" title="Tutup">\u2715</button></div><div class="sl">'+rows+'</div><datalist id="lay-iau"></datalist>';
    stPanel.innerHTML=h;stCount();
  }
  function stNextUnk(focus){
    var c=cons(stCid);if(!c)return;
    var u=stUnkOrder(c);
    if(!u.length){toast('SEMUA BINTANG SUDAH BERNAMA');return;}
    var i0=u.indexOf(stKey),k=u[(i0+1)%u.length];   /* i0=-1 -> yang paling terang */
    if(stOnly)stRender();
    stSelect(k,true);
    if(focus){var row=stRow(k),inp=row&&row.querySelector('.sn');if(inp)inp.focus();}
  }
  function stRow(k){return stPanel&&stPanel.querySelector('.sr[data-k="'+k+'"]');}
  function stSync(k){   /* perbarui kolom satu baris tanpa merusak fokus */
    var row=stRow(k),c=cons(stCid),s=c&&c.stars[k];if(!row||!s)return;
    var f,inp,v;
    ['name','fx','fy','r'].forEach(function(f2){
      inp=row.querySelector('[data-f='+f2+']');if(!inp||document.activeElement===inp)return;
      v=f2==='name'?(s.name||''):stNum(s[f2]);if(inp.value!==v)inp.value=v;
    });
    row.classList.toggle('ch',stChanged(stCid,k,s));
  }
  function stSelect(k,scroll){
    stKey=k;
    if(stPanel){[].slice.call(stPanel.querySelectorAll('.sr.on')).forEach(function(r){r.classList.remove('on');});var row=stRow(k);if(row){row.classList.add('on');if(scroll&&row.scrollIntoView)row.scrollIntoView({block:'nearest'});}}
    paintStarRing();updateInfo();
  }
  function stSet(k,f,val){
    var c=cons(stCid),s=c&&c.stars[k];if(!s)return;
    if(f==='name'){var nv=String(val).replace(/^\s+|\s+$/g,'');if(nv)s.name=nv;else delete s.name;}
    else{
      var v=parseFloat(val);
      if(!isFinite(v)){stSync(k);return;}
      if(f==='r')s.r=clamp(Math.round(v*100)/100,.5,8);
      else if(f==='fx'){s.fx=rnd1(v);s.rx=s.fx;}
      else{s.fy=rnd1(v);s.ry=s.fy;}
    }
    hMark();refresh();stSync(k);stCount();
  }
  function stNudge(a){
    var c=cons(stCid),s=c&&c.stars[stKey];if(!s)return;
    var st=ST[stepI]/3,d=screenStep(a==='l'?-st:a==='r'?st:0,a==='u'?-st:a==='d'?st:0);
    stMove(s,stDelta(c,d[0],d[1]));hMark();refresh();stSync(stKey);
  }
  function stHit(cx,cy){
    var c=cons(stCid);if(!c)return null;
    var best=null,bd=28*28,k,s,p,dx,dy,dd;
    for(k in c.stars){s=c.stars[k];p=stScr(c,s);dx=p[0]-cx;dy=p[1]-cy;dd=dx*dx+dy*dy;if(dd<bd){bd=dd;best=k;}}
    return best;
  }
  function stPos(){if(!stPanel||!hud)return;var r=hud.getBoundingClientRect();stPanel.style.bottom=Math.round(innerHeight-r.top+4)+'px';}
  function paintStarRing(){
    if(!stRing)return;
    if(stOpen&&stCid!==sel){
      if(sel&&sel!=='*'&&sel!=='pleiades'&&cons(sel)){stCid=sel;stKey=null;stRender();}else stClose();
    }
    if(stPanel)stPanel.style.display=(stOpen&&!preview)?'flex':'none';
    if(stOpen&&!preview)stPos();
    stRingPos();
  }
  /* posisi layar bintang = persis rumus drawStars: gSky(x+c.ox, y+c.oy) (c.ox/oy = sway + mouse + pan, diisi tiap frame oleh drawCons) */
  function stScr(c,s){var q=gSky(s.x+(c.ox||0),s.y+(c.oy||0));return v2c(q[0],q[1]);}
  function stRingPos(){
    if(!stRing)return;
    var c=stOpen&&!preview&&stKey&&SECT.cur?cons(stCid):null,s=c&&c.stars[stKey];
    if(!s){if(stRing.style.display!=='none')stRing.style.display='none';return;}
    var p=stScr(c,s);
    stRing.style.display='block';stRing.style.transform='translate('+(p[0]-14).toFixed(1)+'px,'+(p[1]-14).toFixed(1)+'px)';
  }
  /* mode bintang aktif: semua kontrol edit rasi (grup / putar / skala / FIT / handle ukuran / geser rasi) dikunci supaya layout rasi nggak bergeser */
  function stLock(){
    document.body.classList.toggle('lay-stars-on',!!stOpen);
    if(!hud)return;
    ['grp','rotl','rotr','zoout','zoin'].forEach(function(a){var b=hud.querySelector('[data-a='+a+']');if(b)b.disabled=!!stOpen;});
    var f=hud.querySelector('#lay-menu [data-a=fit]');if(f)f.disabled=!!stOpen;
  }
  function stClose(){
    stOpen=false;stKey=null;stDrag=null;
    if(stPanel)stPanel.style.display='none';
    if(stRing)stRing.style.display='none';
    stLock();
    var b=hud&&hud.querySelector('[data-a=stars]');if(b)b.classList.remove('on');
  }
  function stToggle(){
    if(stOpen){stClose();updateInfo();return;}
    if(!stOK())return;
    stOpen=true;stCid=sel;stKey=null;stRender();
    stPanel.style.display='flex';stPos();stLock();
    var b=hud.querySelector('[data-a=stars]');if(b)b.classList.add('on');
    toast('BINTANG '+stCid.toUpperCase()+' · tap / geser titik, atau edit kolom');
  }
  function stAct(a){
    if(a==='x'){stClose();updateInfo();return;}
    if(a==='only'){stOnly=!stOnly;stRender();return;}
    if(a==='unk'){stNextUnk(true);return;}
    if(a==='copy'){stCopy(stExport(false),'COPIED ✓ blok bintang '+stCid);return;}
    if(a==='copyd'){stCopy(stExport(true),'COPIED ✓ ubahan bintang');return;}
    if(a==='rstc'){
      if(!confirm('Kembalikan semua bintang rasi '+stCid+' ke data sky-data.js?'))return;
      var c=cons(stCid);if(!c)return;
      Object.keys(c.stars).forEach(function(k){var o=STAR_ORIG[stCid]&&STAR_ORIG[stCid][k];if(o)stApply(c.stars[k],o);});
      stRender();hMark();refresh();toast('RASI '+stCid+' DIKEMBALIKAN');
    }
  }
  function buildStars(){
    if(stPanel)return;
    stPanel=document.createElement('div');stPanel.id='lay-stars';document.body.appendChild(stPanel);
    stRing=document.createElement('div');stRing.id='lay-star-ring';document.body.appendChild(stRing);
    stPanel.addEventListener('change',function(e){
      var t=e.target,f=t&&t.getAttribute&&t.getAttribute('data-f'),row=t&&t.closest&&t.closest('.sr');
      if(!f||!row)return;
      stSet(row.getAttribute('data-k'),f,t.value);
    });
    stPanel.addEventListener('focusin',function(e){var row=e.target.closest&&e.target.closest('.sr');if(row&&row.getAttribute('data-k')!==stKey)stSelect(row.getAttribute('data-k'),false);});
    stPanel.addEventListener('keydown',function(e){
      if(e.key!=='Enter')return;
      var t=e.target,row=t&&t.closest&&t.closest('.sr');
      if(!t||!row||t.getAttribute('data-f')!=='name')return;
      e.preventDefault();stSet(row.getAttribute('data-k'),'name',t.value);stNextUnk(true);
    });
    stPanel.addEventListener('click',function(e){
      var b=e.target.closest&&e.target.closest('[data-sa]');
      if(b){e.stopPropagation();stAct(b.getAttribute('data-sa'));return;}
      var row=e.target.closest&&e.target.closest('.sr');
      if(row&&e.target.tagName!=='INPUT')stSelect(row.getAttribute('data-k'),false);
    });
  }

  function snapshot(){
    var scene={};
    SKY.rasi.forEach(function(r){
      if(r.scene)scene[r.id]={scene:{k:r.scene.k,th:r.scene.th,pv:r.scene.pv?r.scene.pv.slice():null,at:r.scene.at.slice()}};
      if(r.ple){scene[r.id]=scene[r.id]||{};scene[r.id].ple={at:r.ple.at.slice(),ps:r.ple.ps};}
    });
    return {base:BASE,scene:scene,ov:JSON.parse(JSON.stringify(window.__layOV||{})),fit:window.__scnBounds?window.__scnBounds.slice():null};
  }
  function autosave(){try{localStorage.setItem(LS_KEY,JSON.stringify(snapshot()));}catch(e){}saveStars();}
  function save(){try{localStorage.setItem(LS_KEY,JSON.stringify(snapshot()));toast('SAVED ✓');}catch(e){toast('SAVE GAGAL');}}

  /* ---- UNDO / REDO: tiap aksi edit (geser, ukuran, putar, grup, bintang) = satu langkah ---- */
  function hMark(){hFlag=true;}
  function hState(){return JSON.stringify({s:snapshot(),t:stEdits().ed});}
  function hCommit(){
    var t=hState();
    if(hi>=0&&HIS[hi]===t)return;
    HIS.length=hi+1;HIS.push(t);
    if(HIS.length>120){HIS.shift();}
    hi=HIS.length-1;hBtn();
  }
  function hBtn(){
    if(!hud)return;
    var u=hud.querySelector('[data-a=undo]'),r=hud.querySelector('[data-a=redo]');
    if(u)u.disabled=hi<=0;if(r)r.disabled=hi>=HIS.length-1;
  }
  function applySnap(d){
    window.__layOV=d.ov?JSON.parse(JSON.stringify(d.ov)):{};
    if(d.fit&&d.fit.length===4)window.__scnBounds=d.fit.slice();
    SKY.rasi.forEach(function(r){
      var s=d.scene&&d.scene[r.id];if(!s)return;
      if(s.scene&&r.scene){r.scene.k=s.scene.k;r.scene.th=s.scene.th;r.scene.at=s.scene.at.slice();if(s.scene.pv)r.scene.pv=s.scene.pv.slice();}
      if(s.ple&&r.ple){r.ple.at=s.ple.at.slice();if(typeof s.ple.ps==='number')r.ple.ps=s.ple.ps;}
    });
  }
  function applyStars(ed){
    CONS.forEach(function(c){var o=STAR_ORIG[c.id];if(!o)return;Object.keys(c.stars).forEach(function(k){if(o[k])stApply(c.stars[k],o[k]);});});
    Object.keys(ed||{}).forEach(function(cid){var c=cons(cid);if(!c)return;Object.keys(ed[cid]).forEach(function(k){var s=c.stars[k];if(s)stApply(s,ed[cid][k]);});});
  }
  function hGo(d){
    var j=hi+d;
    if(j<0||j>=HIS.length){toast(d<0?'TIDAK ADA YANG DI-UNDO':'TIDAK ADA YANG DI-REDO');return;}
    hi=j;
    var o=JSON.parse(HIS[hi]);
    applySnap(o.s);applyStars(o.t);
    if(stOpen){var c=cons(stCid);if(stKey&&!(c&&c.stars[stKey]))stKey=null;stRender();}
    hBtn();hFlag=false;refresh();toast((d<0?'UNDO':'REDO')+' \u2713  '+(hi)+'/'+(HIS.length-1));
  }
  function closeMenu(){var m=document.getElementById('lay-menu');if(m)m.classList.remove('open');}
  function goHome(){   /* keluar mode layout -> situs live (draft tetap tersimpan) */
    try{autosave();localStorage.removeItem('obs_layout_on');}catch(e){}
    location.href=location.pathname;
  }

  function exportText(){
    var L=[],b=window.__scnBounds;
    L.push('// Tempel ke sky-data.js: GANTI baris scene:/ple:/ov: lama di rasi yang sama (jangan dobel).');
    if(b)L.push('// Taruh di paling bawah sky-data.js (setelah SKY dibuat):\nSKY.fit=['+b.map(rnd).join(',')+'];');
    ['winter','spring','summer','autumn'].forEach(function(sec){
      var blk=[];
      SKY.rasi.forEach(function(r){
        if(r.sector!==sec||r.off)return;
        if(r.scene)blk.push(r.id+'  scene:{k:'+rnd(r.scene.k)+', th:'+rnd(r.scene.th)+', pv:['+(r.scene.pv?r.scene.pv.map(rnd).join(','):'')+'], at:['+r.scene.at.map(rnd).join(',')+']}');
        else if(r.ple)blk.push(r.id+'  ple:{at:['+r.ple.at.map(rnd).join(',')+'], ps:'+rnd(r.ple.ps)+'}');
        else{var o=getOV(r.id);if(r.ov||o.ox||o.oy||o.k!==1||o.th)blk.push(r.id+'  ov:{ox:'+rnd(o.ox)+', oy:'+rnd(o.oy)+', k:'+rnd(o.k)+', th:'+rnd(o.th)+'}');}
      });
      if(blk.length){L.push('');L.push('=== '+sec.toUpperCase()+' ===');L=L.concat(blk);}
    });
    return L.join('\n');
  }

  function toast(msg){
    if(!info)return;
    info.textContent=msg;info.style.color='#fff';toast._u=Date.now()+1500;
    clearTimeout(toast._t);toast._t=setTimeout(function(){toast._u=0;if(info)info.style.color='';updateInfo();},1500);
  }
  function updateInfo(){
    if(!info)return;
    if(Date.now()<(toast._u||0))return;   /* toast lagi tampil: jangan ditimpa */
    if(stOpen&&stKey&&sel&&sel!=='*'){var sc=cons(stCid),ss=sc&&sc.stars[stKey];if(ss){info.textContent=stCid+' \u00b7 '+stKey+' '+(ss.name||'???')+' \u00b7 fx'+stNum(ss.fx)+' fy'+stNum(ss.fy)+' r'+stNum(ss.r);return;}}
    var sec=SECT.cur?SECT.cur.k.toUpperCase():'OVERVIEW';
    if(!SECT.cur){info.textContent='OVERVIEW \u00b7 tap sektor untuk masuk';return;}
    if(sel==='*'){info.textContent='GRUP '+sec+' \u00b7 '+sectorIds().length+' rasi \u00b7 geser = semua';return;}
    if(!sel){info.textContent=sec+' \u00b7 tap rasi'+(dropped?' \u00b7 draft lama dibuang':'');return;}
    var r=SKY.rasiBy[sel],t;
    if(r.scene)t='k'+rnd(r.scene.k)+' \u03b8'+rnd(r.scene.th)+' @'+r.scene.at.map(rnd);
    else if(r.ple)t='ps'+rnd(r.ple.ps)+' @'+r.ple.at.map(rnd);
    else{var o=getOV(sel);t='x'+rnd(o.ox)+' y'+rnd(o.oy)+' k'+rnd(o.k)+' \u03b8'+rnd(o.th);}
    info.textContent=sec+' \u00b7 '+sel+' \u00b7 '+t;
  }

  /* ---- koordinat: client (layar) <-> world (ruang layout) — ikut stage-rotate, zoom sektor, pan ---- */
  function v2w(cx,cy){
    var v=c2v(cx,cy),z=skyZoom||1,mx=W*.5,my=H*.5,dx=(v[0]-mx)/z,dy=(v[1]-my)/z;
    if(skyRot*skyRot>=1e-8){var c=Math.cos(-skyRot),s=Math.sin(-skyRot),rx=dx*c-dy*s,ry=dx*s+dy*c;dx=rx;dy=ry;}
    return [mx+dx-skyPan.x,my+dy-skyPan.y];
  }
  function w2c(x,y){var t=skyXF(x+skyPan.x,y+skyPan.y);return v2c(t[0],t[1]);}
  function selRect(id){
    if(id==='*'){ /* GRUP: gabungan kotak semua rasi di sektor aktif */
      var u=null;
      sectorIds().forEach(function(i2){var q=selRect(i2);if(!q)return;u=u?[Math.min(u[0],q[0]),Math.min(u[1],q[1]),Math.max(u[2],q[2]),Math.max(u[3],q[3])]:q.slice();});
      return u;
    }
    if(id==='pleiades'&&PLEIADES.ready){var s=PLEIADES.scale,cx=PLEIADES.x+.53*s,cy=PLEIADES.y+.42*s;return [cx-.4*s,cy-.32*s,cx+.4*s,cy+.32*s];}
    var c=cons(id);if(!c||c.minX==null||c.minX>1e8)return null;
    return [c.minX,c.minY,c.maxX,c.maxY];
  }
  function hitCons(cx,cy){
    if(grp){
      var gr=selRect('*');if(!gr)return null;
      var gw=v2w(cx,cy),gp=18/(skyZoom||1);
      return (gw[0]>=gr[0]-gp&&gw[0]<=gr[2]+gp&&gw[1]>=gr[1]-gp&&gw[1]<=gr[3]+gp)?'*':null;
    }
    var w=v2w(cx,cy),pad=18/(skyZoom||1),best=null,ba=1e18;
    sectorIds().forEach(function(id){
      var r=selRect(id);if(!r)return;
      if(w[0]<r[0]-pad||w[0]>r[2]+pad||w[1]<r[1]-pad||w[1]>r[3]+pad)return;
      var a=(r[2]-r[0]+2*pad)*(r[3]-r[1]+2*pad);
      if(id===sel)a*=.5; /* rasi yang lagi dipilih menang kalau tumpang tindih */
      if(a<ba){ba=a;best=id;}
    });
    return best;
  }
  function ringBox(id){
    var r=selRect(id);if(!r)return null;
    var P=[w2c(r[0],r[1]),w2c(r[2],r[1]),w2c(r[2],r[3]),w2c(r[0],r[3])],x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
    P.forEach(function(p){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1]);});
    return [x0-8,y0-8,x1+8,y1+8];
  }
  function paintSel(){
    paintStarRing();
    if(!ring)return;
    if(preview||!sel||!SECT.cur){ring.style.display='none';return;}
    var b=ringBox(sel);if(!b){ring.style.display='none';return;}
    ring.style.display='block';
    ring.style.left=b[0]+'px';ring.style.top=b[1]+'px';
    ring.style.width=Math.max(34,b[2]-b[0])+'px';ring.style.height=Math.max(34,b[3]-b[1])+'px';
  }

  /* ---- operasi edit ---- */
  /* ---- EDIT GRUP: geser / putar / skala semua rasi di sektor sekaligus (susunan relatif tetap) ---- */
  function gSnap(){
    var S={G:null,fit:window.__scnFit?{fs:window.__scnFit.fs,offx:window.__scnFit.offx,offy:window.__scnFit.offy}:null,items:[]},r0=selRect('*');
    if(r0)S.G=[(r0[0]+r0[2])/2,(r0[1]+r0[3])/2];
    sectorIds().forEach(function(id){
      var r=SKY.rasiBy[id];
      if(r.scene)S.items.push({id:id,t:'s',at:r.scene.at.slice(),k:r.scene.k,th:r.scene.th});
      else if(r.ple)S.items.push({id:id,t:'p',at:r.ple.at.slice(),ps:r.ple.ps});
      else{
        var o=getOV(id),pv=window.__ovPivot&&window.__ovPivot[id];
        if(!pv){var c=cons(id);pv=(c&&c.minX<1e8)?[(c.minX+c.maxX)/2,(c.minY+c.maxY)/2]:[0,0];}
        S.items.push({id:id,t:'o',o:{ox:o.ox,oy:o.oy,k:o.k,th:o.th},pv:pv.slice()});
      }
    });
    return S;
  }
  function gApply(S,f,thDeg,dwx,dwy){
    if(!S||!S.G)return;
    var t=thDeg*Math.PI/180,cs=Math.cos(t)*f,sn=Math.sin(t)*f,G=S.G,fit=S.fit;
    function tw(px,py){var x=px-G[0],y=py-G[1];return [G[0]+cs*x-sn*y+dwx,G[1]+sn*x+cs*y+dwy];}
    S.items.forEach(function(it){
      var r=SKY.rasiBy[it.id];
      if(it.t==='o'){
        var N=tw(it.pv[0]+it.o.ox,it.pv[1]+it.o.oy);
        window.__layOV[it.id]={ox:N[0]-it.pv[0],oy:N[1]-it.pv[1],k:clamp(it.o.k*f,.05,12),th:it.o.th+thDeg};
      }else if(fit&&fit.fs){
        var N2=tw(fit.offx+it.at[0]*fit.fs,fit.offy+it.at[1]*fit.fs),at=[(N2[0]-fit.offx)/fit.fs,(N2[1]-fit.offy)/fit.fs];
        if(it.t==='s'){r.scene.at=at;r.scene.k=clamp(it.k*f,.05,20);r.scene.th=it.th+thDeg;}
        else{r.ple.at=at;r.ple.ps=clamp(it.ps*f,8,3000);}
      }
    });
  }

  function moveW(id,dx,dy){
    if(id==='*'){sectorIds().forEach(function(i2){moveW(i2,dx,dy);});return;}
    var r=SKY.rasiBy[id];if(!r)return;
    if(r.scene||r.ple){var f=(window.__scnFit&&window.__scnFit.fs)||1,at=(r.scene||r.ple).at;at[0]+=dx/f;at[1]+=dy/f;}
    else{var o=getOV(id);o.ox+=dx;o.oy+=dy;window.__layOV[id]=o;}
  }
  function setScale(id,abs){
    var r=SKY.rasiBy[id];if(!r)return;
    if(r.scene)r.scene.k=clamp(abs,.05,10);
    else if(r.ple)r.ple.ps=clamp(abs,8,1500);
    else{var o=getOV(id);o.k=clamp(abs,.2,6);window.__layOV[id]=o;}
  }
  function getScale(id){var r=SKY.rasiBy[id];return r.scene?r.scene.k:r.ple?r.ple.ps:getOV(id).k;}
  function rotateBy(id,d){
    var r=SKY.rasiBy[id];if(!r)return;
    if(r.scene)r.scene.th+=d;
    else if(r.ple){toast('PLEIADES NGGAK BISA DIPUTAR');return;}
    else{var o=getOV(id);o.th+=d;window.__layOV[id]=o;}
  }
  function refresh(){
    if(rq)return;
    rq=requestAnimationFrame(function(){rq=0;try{layout();}catch(e){console.warn(e);}updateInfo();paintSel();autosave();if(hFlag){hFlag=false;hCommit();}});
  }
  function screenStep(dcx,dcy){ /* geser sebesar (dcx,dcy) px LAYAR, diterjemahkan ke world */
    var a=v2w(innerWidth/2,innerHeight/2),b=v2w(innerWidth/2+dcx,innerHeight/2+dcy);
    return [b[0]-a[0],b[1]-a[1]];
  }

  function setPreview(on){
    preview=!!on;
    window.__layoutEditMode=!preview;
    document.body.classList.toggle('layout-edit',!preview);
    document.body.classList.toggle('layout-preview',preview);
    if(hud)hud.style.display=preview?'none':'';
    var fab=document.getElementById('lay-fab');if(fab)fab.style.display=preview?'block':'none';
    drag=null;rs=null;paintSel();
    if(preview)autosave();
    try{layout();}catch(e){}
  }

  function act(a){
    if(a!=='menu')closeMenu();
    if(stOpen&&(a==='rotl'||a==='rotr'||a==='zoout'||a==='zoin'||a==='grp'||a==='fit')){toast('MODE BINTANG: edit rasi dikunci');return;}
    if(stOpen&&(a==='l'||a==='r'||a==='u'||a==='d')){if(stKey)stNudge(a);else toast('PILIH BINTANG DULU (tap titik / baris)');return;}   /* panah = geser BINTANG, tidak pernah geser rasi */
    if(a==='home'){goHome();return;}
    if(a==='menu'){var mn=document.getElementById('lay-menu');if(mn)mn.classList.toggle('open');return;}
    if(a==='undo'){hGo(-1);return;}
    if(a==='redo'){hGo(1);return;}
    if(a==='edit'||a==='preview'){setPreview(a==='preview'?true:false);return;}
    if(a==='save'){save();return;}
    if(a==='stars'){stToggle();return;}
    if(a==='copy'){
      var t=exportText();
      if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(function(){toast('COPIED ✓ (tempel ke sky-data.js)');}).catch(function(){prompt('Copy:',t);});
      else prompt('Copy:',t);
      console.log('[layout export]\n'+t);return;
    }
    if(a==='fit'){window.__scnRefit=true;hMark();refresh();toast('FIT ULANG dari anchor');return;}
    if(a==='rst'){
      if(!confirm('Buang draft layout & muat ulang dari sky-data.js?'))return;
      try{localStorage.removeItem(LS_KEY);localStorage.removeItem(STAR_LS);}catch(e){}
      window.__layOV={};window.__scnBounds=null;location.reload();return;
    }
    if(a==='collapse'){collapsed=!collapsed;hud.classList.toggle('col',collapsed);stPos();return;}
    if(a==='step'){stepI=(stepI+1)%3;var sb=hud.querySelector('[data-a=step]');if(sb)sb.textContent='S'+(stepI+1);return;}
    if(a==='ovw'){if(SECT.cur&&!SECT.busy){sel=null;sectToggle();}else toast(SECT.cur?'TUNGGU ANIMASI':'SUDAH DI OVERVIEW');return;}
    if(a==='grp'){
      grp=!grp;sel=grp?'*':null;
      var gb=hud.querySelector('[data-a=grp]');if(gb)gb.classList.toggle('on',grp);
      updateInfo();paintSel();toast(grp?'MODE GRUP: semua rasi sektor':'MODE SATUAN');return;
    }
    if(a==='prev'||a==='next'){
      if(grp){toast('MATIKAN GRUP DULU');return;}
      var ids=sectorIds();if(!ids.length){toast('MASUK SEKTOR DULU');return;}
      var i=ids.indexOf(sel);if(i<0)i=a==='next'?-1:0;
      i=a==='next'?(i+1)%ids.length:(i-1+ids.length)%ids.length;
      sel=ids[i];updateInfo();paintSel();return;
    }
    if(!sel){toast('PILIH RASI DULU');return;}
    if(stOpen&&stKey&&(a==='l'||a==='r'||a==='u'||a==='d')){stNudge(a);return;}   /* panel bintang terbuka + bintang terpilih: panah menggeser bintang */
    if(a==='l'||a==='r'||a==='u'||a==='d'){
      var s=ST[stepI],d=screenStep(a==='l'?-s:a==='r'?s:0,a==='u'?-s:a==='d'?s:0);
      moveW(sel,d[0],d[1]);hMark();refresh();return;
    }
    if(sel==='*'){
      var sn0=gSnap();
      if(a==='rotl')gApply(sn0,1,-RT[stepI],0,0);
      else if(a==='rotr')gApply(sn0,1,RT[stepI],0,0);
      else if(a==='zoout')gApply(sn0,1-SCF[stepI]*2,0,0,0);
      else if(a==='zoin')gApply(sn0,1+SCF[stepI]*2,0,0,0);
      hMark();refresh();return;
    }
    if(a==='rotl'){rotateBy(sel,-RT[stepI]);hMark();refresh();return;}
    if(a==='rotr'){rotateBy(sel,RT[stepI]);hMark();refresh();return;}
    if(a==='zoout'){setScale(sel,getScale(sel)*(1-SCF[stepI]*2));hMark();refresh();return;}
    if(a==='zoin'){setScale(sel,getScale(sel)*(1+SCF[stepI]*2));hMark();refresh();return;}
  }

  window.__layBack=function(){if(SECT.cur&&!SECT.busy){sel=null;try{updateInfo();paintSel();}catch(e){}sectToggle();}};
  function inUI(e){return e.target&&e.target.closest&&e.target.closest('#lay-hud,#lay-fab,#lay-stars');}

  function build(){
    if(hud)return;
    var css=[
      /* ===== dock: 2 baris ikon, transparan, nggak menutupi langit ===== */
      '#lay-hud{position:fixed;left:0;right:0;margin:0 auto;bottom:calc(6px + env(safe-area-inset-bottom,0px));width:min(calc(100vw - 12px),348px);box-sizing:border-box;z-index:99999;font:10px/1.2 Courier New,monospace;color:#cfeffa;background:rgba(2,8,13,.8);border:1px solid rgba(110,229,255,.28);border-radius:8px;padding:3px;touch-action:manipulation}',
      '#lay-hud #lay-info{font-size:9px;height:12px;line-height:12px;color:rgba(207,239,250,.85);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:0 2px 2px}',
      '#lay-hud .rw{display:grid;grid-template-columns:repeat(10,1fr);gap:3px}',
      '#lay-hud .rw+.rw{margin-top:3px}',
      '#lay-hud button,#lay-fab{height:30px;min-width:0;padding:0;display:grid;place-items:center;border:1px solid rgba(110,229,255,.32);border-radius:5px;background:rgba(110,229,255,.07);color:#6ee5ff;font:700 10px Courier New,monospace;-webkit-tap-highlight-color:transparent}',
      '#lay-hud button svg,#lay-fab svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round;pointer-events:none}',
      '#lay-hud button:active,#lay-fab:active{background:rgba(110,229,255,.3)}',
      '#lay-hud button:disabled{opacity:.28}',
      '#lay-hud .a{border-color:rgba(255,154,217,.55);color:#ff9ad9}',
      '#lay-hud .p{border-color:rgba(130,255,170,.55);color:#8dffb0}',
      '#lay-hud .on{background:rgba(255,154,217,.35);color:#fff}',
      '#lay-hud.col [data-a=collapse] svg{transform:rotate(180deg)}',
      '#lay-menu{display:none;position:absolute;right:0;bottom:calc(100% + 4px);flex-direction:column;gap:3px;padding:4px;background:rgba(2,8,13,.96);border:1px solid rgba(110,229,255,.3);border-radius:8px}',
      '#lay-menu.open{display:flex}',
      '#lay-hud #lay-menu button{height:28px;padding:0 14px;display:block;text-align:left;white-space:nowrap}',
      /* ciut: sisa ikon penting saja */
      '#lay-hud.col{width:fit-content;max-width:calc(100vw - 12px)}',
      '#lay-hud.col #lay-info,#lay-hud.col .ra{display:none}',
      '#lay-hud.col .rn{display:flex}',
      '#lay-hud.col .rn button:not(.k){display:none}',
      '#lay-hud.col .rn button.k{width:30px}',
      '#lay-fab{position:fixed;top:calc(8px + env(safe-area-inset-top,0px));right:8px;z-index:99999;display:none;width:auto;padding:0 9px;line-height:28px;background:rgba(2,8,13,.85)}',
      '#lay-sel{position:fixed;pointer-events:none;z-index:99990;border:1.5px dashed rgba(110,229,255,.85);border-radius:4px;box-shadow:0 0 10px rgba(110,229,255,.25);display:none}',
      '#lay-hdl{position:absolute;right:-14px;bottom:-14px;width:32px;height:32px;pointer-events:auto;touch-action:none;display:flex;align-items:flex-end;justify-content:flex-end;color:#6ee5ff;font-size:20px;line-height:1}',
      '#lay-hdl i{display:block;width:22px;height:22px;background:rgba(2,8,13,.9);border:1.5px solid #6ee5ff;border-radius:5px;text-align:center;font-style:normal;font-size:14px;line-height:21px}',
      /* ===== panel bintang: kompak, daftar bisa discroll ===== */
      '#lay-stars{position:fixed;left:0;right:0;margin:0 auto;width:min(calc(100vw - 12px),348px);box-sizing:border-box;bottom:110px;z-index:99998;max-height:min(30vh,200px);display:none;flex-direction:column;font:10px/1.2 Courier New,monospace;color:#cfeffa;background:rgba(2,8,13,.88);border:1px solid rgba(110,229,255,.3);border-radius:8px;padding:3px}',
      '#lay-stars .sh{display:flex;gap:3px;align-items:center;flex:0 0 auto;margin-bottom:3px}',
      '#lay-stars .sh b{font-size:10px;color:#6ee5ff;letter-spacing:.05em;white-space:nowrap}',
      '#lay-stars .sh .sc{font-size:9px;color:#ff9ad9;white-space:nowrap;margin-left:2px}',
      '#lay-stars .sh .g{flex:1}',
      '#lay-stars .sh button{height:22px;min-width:22px;padding:0 5px;border:1px solid rgba(255,154,217,.5);border-radius:4px;background:rgba(255,154,217,.07);color:#ff9ad9;font:700 9px Courier New,monospace;-webkit-tap-highlight-color:transparent}',
      '#lay-stars .sh button.on{background:rgba(255,154,217,.35);color:#fff}',
      '#lay-stars .sl{flex:1 1 auto;min-height:0;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;touch-action:pan-y}',
      '#lay-stars .se{padding:8px 4px;font-size:9px;color:rgba(207,239,250,.6)}',
      '#lay-stars .sr{display:grid;grid-template-columns:30px minmax(0,1fr) 44px 44px 32px;gap:3px;align-items:center;padding:2px 1px;border-bottom:1px solid rgba(110,229,255,.07)}',
      '#lay-stars .sr.on{background:rgba(255,154,217,.18)}',
      '#lay-stars .sr.ch .sk{color:#8dffb0}',
      '#lay-stars .sk{font-size:9px;color:rgba(207,239,250,.65);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '#lay-stars input{width:100%;min-width:0;box-sizing:border-box;height:24px;padding:0 3px;border:1px solid rgba(110,229,255,.28);border-radius:4px;background:rgba(110,229,255,.06);color:#eafcff;font:10px Courier New,monospace;-webkit-appearance:none;appearance:none;-moz-appearance:textfield}',
      '#lay-stars input::-webkit-inner-spin-button,#lay-stars input::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}',
      '#lay-stars input.sn::placeholder{color:#ff9ad9;opacity:.75}',
      '#lay-stars input:focus{outline:1px solid #ff9ad9}',
      '#lay-star-ring{position:fixed;left:0;top:0;will-change:transform;width:28px;height:28px;box-sizing:border-box;border:2px solid #ff9ad9;border-radius:50%;pointer-events:none;z-index:99991;display:none;box-shadow:0 0 10px rgba(255,154,217,.6)}',
      /* ===== HP landscape: dock jadi kolom di tepi kanan, panel bintang di kiri ===== */
      '@media (orientation:landscape) and (max-height:560px){',
      '#lay-hud{left:auto;right:calc(6px + env(safe-area-inset-right,0px));bottom:6px;margin:0;width:auto;display:grid;grid-template-columns:repeat(4,30px);gap:3px;max-height:calc(100vh - 12px)}',
      '#lay-hud .rw{display:contents}',
      '#lay-hud .rw+.rw{margin:0}',
      '#lay-hud #lay-info{position:fixed;left:8px;bottom:6px;right:auto;max-width:48vw;height:auto;padding:2px 6px;background:rgba(2,8,13,.7);border-radius:4px;pointer-events:none}',
      '#lay-hud #lay-menu{right:calc(100% + 4px);bottom:0}',
      '#lay-hud.col{display:flex}',
      '#lay-stars{left:6px;right:auto;margin:0;width:min(52vw,340px);bottom:30px!important;max-height:calc(100vh - 60px)}',
      '}',
      'body.lay-stars-on #lay-hdl{display:none!important}',
      'body.layout-edit,body.layout-edit canvas{touch-action:none}',
      /* sembunyikan panel/tombol live yang nggak relevan buat edit (header, portal sektor, langit tetap sama seperti live) */
      'body.layout-edit #mode-cluster,body.layout-edit #mode-sectors,body.layout-edit #mode-observe,body.layout-edit #mode-camera,body.layout-edit #mode-bh,body.layout-edit #cam-cluster,body.layout-edit #obs-btn,body.layout-edit #cam-btn,body.layout-edit #music-player,body.layout-edit #zoom-cluster,body.layout-edit .mp-wrap,body.layout-edit #owl-source,body.layout-edit #cf-bar,body.layout-edit #cam-whisper,body.layout-edit [id$="-fx"]{display:none!important;pointer-events:none!important}',
      'body.layout-edit #bh,body.layout-edit #cap-bh{pointer-events:none!important}'
    ].join('');
    var st=document.createElement('style');st.id='lay-style';st.textContent=css;document.head.appendChild(st);
    hud=document.createElement('div');hud.id='lay-hud';
    function ic(d,w){return '<svg viewBox="0 0 24 24" aria-hidden="true"'+(w?' style="stroke-width:'+w+'"':'')+'><path d="'+d+'"/></svg>';}
    function B(a,d,cls,title,w){return '<button type="button" data-a="'+a+'"'+(cls?' class="'+cls+'"':'')+' title="'+title+'" aria-label="'+title+'">'+ic(d,w)+'</button>';}
    hud.innerHTML=
      '<div id="lay-info"></div>'+
      '<div class="rw rn">'+
        B('home','M3.5 11 L12 4 L20.5 11 M5.5 9.5 V20 H10 V14 H14 V20 H18.5 V9.5','','Home: keluar mode layout (draft tersimpan)')+
        B('ovw','M8 12 a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0 M2 12 C2 9.5 6.5 7.5 12 7.5 S22 9.5 22 12 S17.5 16.5 12 16.5 S2 14.5 2 12','k','Overview (keluar sektor)')+
        B('prev','M15 5 L8 12 L15 19','','Rasi sebelumnya')+
        B('next','M9 5 L16 12 L9 19','','Rasi berikutnya')+
        B('grp','M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 13h7v7h-7z','','Edit grup: semua rasi di sektor')+
        B('stars','M12 3.5 L14.6 9.3 L21 10 L16.2 14.3 L17.6 20.6 L12 17.4 L6.4 20.6 L7.8 14.3 L3 10 L9.4 9.3 Z','p','Editor bintang')+
        B('preview','M2 12 C5 6.5 8.5 5 12 5 s7 1.5 10 7 c-3 5.5 -6.5 7 -10 7 S5 17.5 2 12 Z M9.2 12 a2.8 2.8 0 1 0 5.6 0 a2.8 2.8 0 1 0 -5.6 0','p k','Preview tanpa panel')+
        B('undo','M9 14 L4 9 L9 4 M4 9 H15 a5 5 0 0 1 0 10 H8','k','Undo')+
        B('redo','M15 14 L20 9 L15 4 M20 9 H9 a5 5 0 0 0 0 10 H16','k','Redo')+
        B('collapse','M6 9 L12 15 L18 9','k','Ciutkan / buka dock')+
      '</div>'+
      '<div class="rw ra">'+
        B('l','M19 12 H5 M11 6 L5 12 L11 18','','Geser kiri')+
        B('u','M12 19 V5 M6 11 L12 5 L18 11','','Geser atas')+
        B('d','M12 5 V19 M6 13 L12 19 L18 13','','Geser bawah')+
        B('r','M5 12 H19 M13 6 L19 12 L13 18','','Geser kanan')+
        B('rotl','M4 12 a8 8 0 1 0 3 -6 M4 4 V9 H9','','Putar kiri')+
        B('rotr','M20 12 a8 8 0 1 1 -3 -6 M20 4 V9 H15','','Putar kanan')+
        B('zoout','M5 12 H19','','Perkecil')+
        B('zoin','M5 12 H19 M12 5 V19','','Perbesar')+
        '<button type="button" data-a="step" title="Besar langkah (S1 kecil, S3 besar)">S2</button>'+
        B('menu','M5 12 h.01 M12 12 h.01 M19 12 h.01','a','Menu: save / copy / fit / reset',3.4)+
      '</div>'+
      '<div id="lay-menu"><button type="button" data-a="save" class="a">SAVE</button><button type="button" data-a="copy" class="a">COPY</button><button type="button" data-a="fit">FIT ULANG</button><button type="button" data-a="rst">RESET DRAFT</button></div>';
    document.body.appendChild(hud);
    info=document.getElementById('lay-info');
    var fab=document.createElement('button');fab.id='lay-fab';fab.type='button';fab.setAttribute('data-a','edit');fab.innerHTML='<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:4px" aria-hidden="true"><path d="M4 20 l1 -4.5 L16.5 4 a2 2 0 0 1 3 3 L8 18.5 Z"/><path d="M14.5 6 l3 3"/></svg>EDIT';document.body.appendChild(fab);
    ring=document.createElement('div');ring.id='lay-sel';ring.innerHTML='<div id="lay-hdl"><i>◢</i></div>';document.body.appendChild(ring);
    buildStars();

    function opt(){return {capture:true,passive:false};}
    window.addEventListener('click',function(e){
      var b=e.target.closest&&e.target.closest('#lay-hud button,#lay-fab');
      if(!b)return;
      e.preventDefault();e.stopImmediatePropagation();
      act(b.getAttribute('data-a'));
    },opt());
    window.addEventListener('pointerdown',function(e){
      if(inUI(e)){e.stopPropagation();return;}
      if(preview||SECT.busy||!SECT.cur)return;
      if(!stOpen&&(e.target&&e.target.id==='lay-hdl'||(e.target.closest&&e.target.closest('#lay-hdl')))){
        var b=ringBox(sel);if(!b)return;
        var cx=(b[0]+b[2])/2,cy=(b[1]+b[3])/2;
        rs={id:sel,cx:cx,cy:cy,d0:Math.max(12,Math.hypot(e.clientX-cx,e.clientY-cy)),s0:sel==='*'?1:getScale(sel),snap:sel==='*'?gSnap():null};
        e.stopImmediatePropagation();e.preventDefault();return;
      }
      if(stOpen&&stCid&&sel===stCid){   /* panel bintang terbuka: titik di dekat jari = pilih + geser bintang (bukan rasi) */
        var hs=stHit(e.clientX,e.clientY);
        if(hs){stSelect(hs,true);stDrag={k:hs,last:v2w(e.clientX,e.clientY)};e.stopImmediatePropagation();e.preventDefault();return;}
      }
      var id=hitCons(e.clientX,e.clientY);
      if(id){
        sel=id;updateInfo();paintSel();
        if(!stOpen)drag={id:id,last:v2w(e.clientX,e.clientY)};   /* mode bintang: tap rasi cuma pindah pilihan, TIDAK menggeser rasi */
        e.stopImmediatePropagation();e.preventDefault();
      }
    },opt());
    window.addEventListener('pointermove',function(e){
      if(preview)return;
      if(stDrag){
        var c2=cons(stCid),s2=c2&&c2.stars[stDrag.k];
        if(s2){var w2=v2w(e.clientX,e.clientY);stMove(s2,stDelta(c2,w2[0]-stDrag.last[0],w2[1]-stDrag.last[1]));refresh();stDrag.last=v2w(e.clientX,e.clientY);stSync(stDrag.k);updateInfo();}
        e.stopImmediatePropagation();e.preventDefault();return;
      }
      if(rs){
        var f=Math.hypot(e.clientX-rs.cx,e.clientY-rs.cy)/rs.d0;
        if(rs.snap)gApply(rs.snap,clamp(f,.2,5),0,0,0);else setScale(rs.id,rs.s0*f);
        refresh();
        e.stopImmediatePropagation();e.preventDefault();return;
      }
      if(!drag)return;
      var w=v2w(e.clientX,e.clientY);
      moveW(drag.id,w[0]-drag.last[0],w[1]-drag.last[1]);
      drag.last=v2w(e.clientX,e.clientY); /* titik acuan dihitung ulang karena layar bergeser setelah relayout */
      refresh();
      e.stopImmediatePropagation();e.preventDefault();
    },opt());
    function end(e){
      if(rs||drag||stDrag){hMark();refresh();autosave();updateInfo();e&&e.stopImmediatePropagation&&e.stopImmediatePropagation();}
      rs=null;drag=null;stDrag=null;
    }
    window.addEventListener('pointerup',end,opt());
    window.addEventListener('pointercancel',end,opt());
    window.addEventListener('beforeunload',autosave);
    window.addEventListener('resize',function(){setTimeout(paintSel,200);});
    setInterval(function(){if(sel&&!preview&&!drag&&!rs)paintSel();},500);
    hCommit();hBtn();updateInfo();
    (function ringLoop(){try{stRingPos();}catch(e){}requestAnimationFrame(ringLoop);})();   /* ring ikut sway tiap frame (jalan setelah loop render utama) */
    console.log('[layout editor v5] dock ringkas + undo/redo + bantu isi bintang ???');
  }

  function waitReady(){
    if(!document.body||typeof layout!=='function'){setTimeout(waitReady,200);return;}
    if(typeof bootDone!=='undefined'&&!bootDone){setTimeout(waitReady,400);return;}
    build();
    setTimeout(function(){try{layout();}catch(e){}},600);
  }
  if(document.readyState==='complete')waitReady();
  else window.addEventListener('load',waitReady);
})();

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

/* ===== Panel pamitan (back terakhir sebelum keluar site) =====
   Dialog gaya visual-novel (kayak kotak dialog Harvest Moon) tapi tema observatory: karakter yang bicara nongol di sudut kiri-atas panel.
   Teleskop menyampaikan pesan Dumb Owl; Dumb Owl sendiri cuma bisa "..." (potret ganti jadi owl waktu dia bicara).
   DOM dibuat sekali, malas (lazy), dari JS. Teks lewat T('exit.*') di i18n.js. Dibuka/ditutup oleh backNav di bawah (EXITP.open / EXITP.stay).
   Body dikasih class 'owl-block' selama panel terbuka, supaya sky/BH/portal tidak ikut kena sentuhan (mekanisme yang sama dengan panel About). */
var EXITP=(function(){
  var P=null,BD=null,NAME,TA,TB,NEXT,CH,E={open:false,i:0,typing:false,tm:0,fin:null,bt:0,leaving:false,doLeave:null};
  var SCRIPT=[
    {w:'t',k:'exit.l1',m:'n'},
    {w:'t',k:'exit.l2',m:'smile'},
    {w:'o',k:'exit.l3',m:'n',sp:95},          /* Dumb Owl: cuma "..." (diketik pelan) */
    {w:'t',k:'exit.l4',m:'smile'},
    {w:'t',k:'exit.l5',m:'soft'},
    {w:'t',k:'exit.l6',m:'smile'}
  ];
  var TELE_SVG='<svg class="ex-tele" viewBox="0 0 64 64" aria-hidden="true">'+
    '<g stroke="#3e5f72" stroke-width="2.2" stroke-linecap="round" fill="none"><path d="M33 42 L22 60"/><path d="M33 42 L33 61"/><path d="M33 42 L45 60"/></g>'+
    '<circle cx="33" cy="41" r="3.2" fill="#143042" stroke="#6ee5ff" stroke-width="1.2"/>'+
    '<g transform="rotate(-16 33 32)">'+
      '<rect x="49" y="27" width="9" height="10" rx="3" fill="#10222e" stroke="#6ee5ff" stroke-width="1.2"/>'+
      '<rect x="12" y="22" width="40" height="20" rx="8" fill="#0d1b26" stroke="#6ee5ff" stroke-width="1.4"/>'+
      '<rect x="6" y="20" width="9" height="24" rx="4" fill="#10222e" stroke="#6ee5ff" stroke-width="1.4"/>'+
      '<ellipse class="tl-glow" cx="7.5" cy="32" rx="2.2" ry="9" fill="#6ee5ff"/>'+
      '<circle cx="26" cy="30" r="3" fill="#eafcff"/><circle cx="38" cy="30" r="3" fill="#eafcff"/>'+
      '<circle cx="26.6" cy="30.4" r="1.4" fill="#0d1b26"/><circle cx="38.6" cy="30.4" r="1.4" fill="#0d1b26"/>'+
      '<g class="tl-blush" fill="#ff9ad9" opacity=".5"><circle cx="21" cy="35.5" r="2.2"/><circle cx="43" cy="35.5" r="2.2"/></g>'+
      '<g fill="none" stroke="#8eeeff" stroke-width="1.7" stroke-linecap="round">'+
        '<path class="tl-m tl-m-n" d="M29 37.3 q3 .5 6 0"/>'+
        '<path class="tl-m tl-m-smile" d="M28 36 q4 4.6 8 0"/>'+
        '<path class="tl-m tl-m-soft" d="M29.5 38.4 q2.5 -2.4 5 0"/>'+
      '</g>'+
    '</g></svg>';
  var OWL_SVG='<svg class="ex-owl" viewBox="0 0 64 64" aria-hidden="true">'+
    '<g stroke="#ffb3e0" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">'+
      '<path d="M32 10 C20 10 14 20 14 33 C14 47 22 55 32 55 C42 55 50 47 50 33 C50 20 44 10 32 10Z" fill="#1a0f1c"/>'+
      '<path d="M17 12 L22 20 M47 12 L42 20" fill="none"/>'+
      '<path d="M15 33 C9 37 10 47 18 50 M49 33 C55 37 54 47 46 50" fill="none"/>'+
      '<circle cx="24" cy="29" r="8" fill="#2a1630"/><circle cx="40" cy="29" r="8" fill="#2a1630"/>'+
      '<path d="M26 47 q6 3 12 0 M27 51.5 q5 2.5 10 0" fill="none" opacity=".5" stroke-width="1.2"/>'+
      '<path d="M26 55 v4 M32 55.5 v4 M38 55 v4" fill="none"/>'+
    '</g>'+
    '<circle cx="24" cy="29" r="4" fill="#ffe3f3"/><circle cx="40" cy="29" r="4" fill="#ffe3f3"/>'+
    '<circle cx="25" cy="29.8" r="2" fill="#1a0f1c"/><circle cx="41" cy="29.8" r="2" fill="#1a0f1c"/>'+
    '<circle cx="25.6" cy="29" r=".7" fill="#fff"/><circle cx="41.6" cy="29" r=".7" fill="#fff"/>'+
    '<path class="ow-beak" d="M29.5 36.5 L34.5 36.5 L32 42Z" fill="#ffb3e0" stroke="#ffb3e0" stroke-width="1" stroke-linejoin="round"/></svg>';
  function build(){
    if(P)return;
    var d=document,b=d.body;
    BD=d.createElement('div');BD.id='exit-backdrop';BD.setAttribute('aria-hidden','true');
    P=d.createElement('div');P.id='exit-panel';P.setAttribute('role','dialog');P.setAttribute('aria-modal','true');P.setAttribute('aria-label',T('exit.aria'));
    P.setAttribute('data-who','t');P.setAttribute('data-mood','n');
    P.innerHTML='<div class="ex-portrait">'+TELE_SVG+OWL_SVG+'</div><div class="ex-name"></div>'+
      '<p class="ex-text" aria-live="polite"><span class="ex-a"></span><span class="ex-b" style="visibility:hidden"></span></p><i class="ex-next"></i>'+
      '<div class="ex-choices"><button type="button" data-a="stay"></button><button type="button" data-a="leave"></button></div>';
    b.appendChild(BD);b.appendChild(P);
    NAME=P.querySelector('.ex-name');TA=P.querySelector('.ex-a');TB=P.querySelector('.ex-b');NEXT=P.querySelector('.ex-next');CH=P.querySelector('.ex-choices');
    P.querySelector('[data-a=stay]').textContent=T('exit.stay');P.querySelector('[data-a=leave]').textContent=T('exit.leave');
    /* isolasi: sentuhan di panel / backdrop tidak tembus ke sky */
    [P,BD].forEach(function(el){
      ['pointerdown','pointerup','pointermove','touchstart','touchend','mousedown','mouseup','contextmenu'].forEach(function(tp){
        el.addEventListener(tp,function(e){e.stopPropagation();},{passive:true});
      });
      ['touchmove','wheel'].forEach(function(tp){el.addEventListener(tp,function(e){e.stopPropagation();e.preventDefault();},{passive:false});});
    });
    BD.addEventListener('click',function(e){e.stopPropagation();});
    P.addEventListener('click',function(e){
      e.stopPropagation();
      var btn=e.target.closest&&e.target.closest('button[data-a]');
      if(btn){if(btn.getAttribute('data-a')==='stay')stay();else leave();return;}
      advance();
    });
    d.addEventListener('keydown',function(e){
      if(!E.open)return;
      if(e.key==='Escape'){e.preventDefault();stay();return;}
      if((e.key==='Enter'||e.key===' '||e.key==='ArrowRight'||e.key==='ArrowDown')&&!(e.target&&e.target.closest&&e.target.closest('button'))){e.preventDefault();advance();}
    });
  }
  function say(txt,sp,done){   /* ketik huruf demi huruf; jeda di koma / titik / "..." supaya terasa ngomong */
    clearTimeout(E.tm);var n=0;E.typing=true;P.classList.add('talk');
    function fin(){clearTimeout(E.tm);E.typing=false;E.fin=null;TA.textContent=txt;TB.textContent='';P.classList.remove('talk');if(done)done();}
    E.fin=fin;
    function step(){
      n++;TA.textContent=txt.slice(0,n);TB.textContent=txt.slice(n);
      if(n>=txt.length){fin();return;}
      var c=txt.charAt(n-1),nx=txt.charAt(n),dl=sp;
      if(c===','||c==='—')dl=sp*5;
      else if(c==='.'&&nx==='.')dl=sp*4;
      else if(c==='.'||c==='?'||c==='!')dl=sp*9;
      E.tm=setTimeout(step,dl);
    }
    TA.textContent='';TB.textContent=txt;
    E.tm=setTimeout(step,sp);
  }
  function line(){
    var L=SCRIPT[E.i];
    P.setAttribute('data-who',L.w);P.setAttribute('data-mood',L.m);
    NAME.textContent=T(L.w==='o'?'exit.name.o':'exit.name.t');
    NEXT.classList.remove('on');
    say(T(L.k),L.sp||26,function(){
      if(E.i<SCRIPT.length-1)NEXT.classList.add('on');
      else{CH.classList.add('on');setTimeout(function(){if(E.open&&!E.leaving){var b=P.querySelector('[data-a=stay]');if(b)try{b.focus({preventScroll:true});}catch(e){}}},380);}
    });
  }
  function advance(){
    if(!E.open||E.leaving)return;
    if(E.typing){if(E.fin)E.fin();return;}
    if(E.i<SCRIPT.length-1){E.i++;line();}
  }
  function hide(){
    E.open=false;clearTimeout(E.tm);clearTimeout(E.bt);E.typing=false;E.fin=null;
    if(P){P.classList.remove('on','talk');BD.classList.remove('on');CH.classList.remove('on');NEXT.classList.remove('on');}
    setTimeout(function(){if(!E.open)document.body.classList.remove('owl-block');},380);
  }
  function open(){
    if(E.open)return;
    build();
    E.open=true;E.leaving=false;E.i=0;
    try{teleGreetHide();}catch(e){}
    document.body.classList.add('owl-block');
    CH.classList.remove('on');BD.classList.add('on');P.classList.add('on');
    try{haptic(10);}catch(e2){}
    line();
  }
  function stay(){
    if(!E.open||E.leaving)return;
    try{haptic(8);}catch(e){}
    hide();
    E.bt=setTimeout(function(){try{TG.anchor=null;tgShow(T('exit.stay.bub'));}catch(er){}},550);   /* teleskop senang: bubble di kanvas */
  }
  function leave(){
    if(!E.open||E.leaving)return;
    E.leaving=true;try{haptic(8);}catch(e){}
    CH.classList.remove('on');NEXT.classList.remove('on');
    P.setAttribute('data-who','t');P.setAttribute('data-mood','smile');NAME.textContent=T('exit.name.t');
    say(T('exit.bye'),30,function(){
      E.bt=setTimeout(function(){if(E.doLeave)E.doLeave();else{try{history.back();}catch(e){}}},1300);
    });
  }
  function reset(){E.leaving=false;hide();}
  return {open:open,stay:stay,reset:reset,isOpen:function(){return E.open;},setLeave:function(f){E.doLeave=f;}};
})();

/* ===== Tombol Back (tombol back HP / gesture back / Alt+←) =====
   Tiap lapisan yang bisa ditutup punya satu "guard" entry di history; back = tutup lapisan paling atas, urutannya:
   kartu ajak/tinggal → Sector Gate → panel About → panel Tune → music player → kamera rasi → Observation Mode → keluar sektor ke overview.
   Selama transisi sektor back ditelan. Di overview tanpa lapisan terbuka, back TERAKHIR membuka panel pamitan (EXITP: teleskop menyampaikan pesan Dumb Owl);
   back lagi = tutup panel (tinggal), tombol "Maaf, aku harus pergi" = baru benar-benar keluar site (EXITP → doLeave: history.go mundur melewati semua guard).
   Layer dasar (root guard) cuma dipasang setelah boot selesai + ada sentuhan user pertama (aturan Chrome soal entry history "skippable").
   PENTING: guard cuma di-push saat lapisan dibuka (poll 150 ms setelah sentuhan user), TIDAK PERNAH di dalam handler popstate:
   push tanpa sentuhan user membuat Chrome menandai entry sebelumnya "skippable", lalu back berikutnya melompatinya dan keluar site.
   Guard yang baru di-pop dipakai ulang lewat history.go(1). Guard berlebih (lapisan ditutup lewat jalur lain: long-press BH, tombol X, tap luar) dibuang otomatis. */
(function backNav(){
  if(!window.history||!history.pushState)return;
  var g=0,fwd=0,skip=0,leaving=false,touched=false,noRoot=false;
  try{var s0=history.state;if(s0&&s0.dumulBack>0)g=s0.dumulBack|0;}catch(e0){}   /* balik dari halaman lain lewat back: kita lagi duduk di guard lama, anggap itu guard root */
  ['pointerdown','touchstart','mousedown','keydown'].forEach(function(ev){window.addEventListener(ev,function(){touched=true;},{capture:true,passive:true});});   /* g = jumlah guard di history sekarang; fwd = guard yang baru di-pop back dan masih ada di "forward"; skip = history.go() buatan kita yang belum selesai */
  function el(id){return document.getElementById(id);}
  function has(id,c){var e=el(id);return !!(e&&e.classList.contains(c));}
  function layers(){   /* semua lapisan aktif, paling atas dulu: {f:penutup, w:jumlah guard yang dimiliki} */
    var L=[];
    if(typeof isLayoutEdit==='function'&&isLayoutEdit()){   /* layout editor: back = keluar sektor ke overview (sama seperti live), selain itu jangan ikut campur */
      try{if(SECT.busy)L.push({f:function(){},w:1});else if(SECT.cur)L.push({f:function(){if(typeof window.__layBack==='function')window.__layBack();else sectToggle();},w:1});}catch(eL){}
      return L;
    }
    try{
      if(EXITP.isOpen())L.push({f:EXITP.stay,w:0});   /* panel pamitan: back = tutup (tinggal); guard-nya milik layer root di bawah */
      if(LIS&&LIS.ui&&!LIS.ui.hidden)L.push({f:lisCancel,w:(SECT.cur||SECT.busy)?0:1});   /* kartu ajak/tinggal: di dalam sektor muncul DARI back (sektor→overview) jadi nggak punya guard sendiri (guard sektor dipakai ulang); di overview (tap portal) dia lapisan sendiri */
      if(SGATE&&SGATE.open)L.push({f:sgClose,w:1});
      if(has('owl-panel','on'))L.push({f:function(){var b=el('owl-backdrop');if(b)b.click();},w:1});
      if(has('bh-panel','on'))L.push({f:function(){if(typeof bhTuneClose==='function')bhTuneClose();},w:1});
      if(has('music-player','open'))L.push({f:function(){var c=el('music-close');if(c)c.click();},w:1});
      if(CAMERA_MODE)L.push({f:function(){setCameraMode(false);},w:1});   /* kamera rasi = sub-mode Observation: back pertama matikan kamera saja */
      if(OBSERVE_MODE)L.push({f:function(){setObserveMode(false);},w:1});
      if(SECT.busy)L.push({f:function(){},w:1});                  /* transisi sektor: telan back */
      else if(SECT.cur)L.push({f:sectToggle,w:1});               /* sektor → overview (lewat kartu ajak/tinggal kalau teleskop ada) */
      if(bootDone&&!noRoot&&(touched||g>0))L.push({f:EXITP.open,w:1});     /* layer dasar: back terakhir → panel pamitan (bukan langsung keluar site) */
    }catch(e){}
    return L;
  }
  function need(L){var n=0,i;for(i=0;i<L.length;i++)n+=L[i].w;return n;}
  function sync(fromPop){
    if(document.hidden||skip>0||leaving)return;
    var n=need(layers()),d;
    if(g<n){
      d=n-g;
      if(fromPop&&fwd>=d){skip++;fwd-=d;g+=d;try{history.go(d);}catch(e){skip--;}}   /* guard yang baru di-pop masih ada di forward: maju lagi, BUKAN push (push di dalam handler back = tanpa sentuhan user, Chrome menandai entry sebelumnya "skippable" lalu back berikutnya melompati dan keluar site) */
      else{while(d-->0){try{history.pushState({dumulBack:g+1},'');g++;fwd=0;}catch(e){break;}}}
    }else if(g>n){d=g-n;skip++;g-=d;fwd+=d;try{history.go(-d);}catch(e){skip--;}}   /* lapisan sudah tertutup lewat jalur lain: buang guard berlebih */
  }
  window.addEventListener('popstate',function(e){
    if(leaving)return;
    if(skip>0){skip--;return;}                       /* popstate dari history.go() buatan kita sendiri */
    var dep=(e.state&&e.state.dumulBack)||0,L;
    if(dep>g){fwd=Math.max(0,fwd-(dep-g));g=dep;sync(false);return;}   /* mis. tombol forward desktop masuk lagi ke guard */
    fwd+=g-dep;g=dep;                                 /* guard terpakai oleh back ini (kalau Chrome melompati beberapa, dep sudah menghitungnya) */
    L=layers();if(L.length){try{L[0].f();}catch(er){}}
    sync(true);                                       /* butuh guard lagi? (mis. kartu ajak/tinggal muncul) pakai guard forward, bukan push */
  });
  setInterval(function(){sync(false);},150);
  /* Tombol "Maaf, aku harus pergi": mundur melewati semua guard + entry asli = keluar ke halaman sebelum situs ini.
     Kalau tidak ada halaman sebelumnya (tab baru / PWA) history.go tidak keluar → coba window.close(); kalau tetap di sini,
     JANGAN navigasi ke about:blank (di PWA malah looping). Cukup matikan root guard (noRoot): guard sudah habis, jadi back
     berikutnya dari sistem (tombol/gesture back HP) keluar secara native. Panel ditutup + toast petunjuk. */
  EXITP.setLeave(function(){
    leaving=true;skip=0;
    try{history.go(-(g+1));}catch(e){}
    setTimeout(function(){
      try{window.close();}catch(e1){}
      setTimeout(function(){
        if(document.hidden)return;
        noRoot=true;leaving=false;g=0;fwd=0;skip=0;EXITP.reset();
        try{if(typeof showModeToast==='function')showModeToast(T('exit.native'),null,3200);}catch(e2){}
      },450);
    },700);
  });
  window.addEventListener('pageshow',function(e){   /* kembali dari bfcache setelah keluar: panel jangan nyangkut di state "pamit" */
    if(!e.persisted)return;
    leaving=false;noRoot=false;skip=0;fwd=0;g=(history.state&&history.state.dumulBack)|0;EXITP.reset();
  });
})();
