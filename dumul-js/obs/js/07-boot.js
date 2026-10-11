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
  var sel=null,drag=null,rs=null,hud=null,info=null,ring=null,preview=false,collapsed=false,stepI=1,rq=0,dropped=false,grp=false;
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

  function snapshot(){
    var scene={};
    SKY.rasi.forEach(function(r){
      if(r.scene)scene[r.id]={scene:{k:r.scene.k,th:r.scene.th,pv:r.scene.pv?r.scene.pv.slice():null,at:r.scene.at.slice()}};
      if(r.ple){scene[r.id]=scene[r.id]||{};scene[r.id].ple={at:r.ple.at.slice(),ps:r.ple.ps};}
    });
    return {base:BASE,scene:scene,ov:JSON.parse(JSON.stringify(window.__layOV||{})),fit:window.__scnBounds?window.__scnBounds.slice():null};
  }
  function autosave(){try{localStorage.setItem(LS_KEY,JSON.stringify(snapshot()));}catch(e){}}
  function save(){try{localStorage.setItem(LS_KEY,JSON.stringify(snapshot()));toast('SAVED ✓');}catch(e){toast('SAVE GAGAL');}}

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
    info.textContent=msg;info.style.color='#fff';
    clearTimeout(toast._t);toast._t=setTimeout(function(){if(info)info.style.color='';updateInfo();},1500);
  }
  function updateInfo(){
    if(!info)return;
    var sec=SECT.cur?SECT.cur.k.toUpperCase():'OVERVIEW';
    if(!SECT.cur){info.textContent='OVERVIEW · tap ikon sektor buat masuk';return;}
    if(sel==='*'){info.textContent='GRUP '+sec+' · '+sectorIds().length+' rasi · geser = pindah semua · ◢ = ukuran · ↺↻ −+';return;}
    if(!sel){info.textContent=sec+' · tap rasi lalu geser · tarik ◢ = ukuran'+(dropped?' · draft lama dibuang (sky-data berubah)':'');return;}
    var r=SKY.rasiBy[sel],t;
    if(r.scene)t='k='+rnd(r.scene.k)+' th='+rnd(r.scene.th)+' at='+r.scene.at.map(rnd);
    else if(r.ple)t='ps='+rnd(r.ple.ps)+' at='+r.ple.at.map(rnd);
    else{var o=getOV(sel);t='ox='+rnd(o.ox)+' oy='+rnd(o.oy)+' k='+rnd(o.k)+' th='+rnd(o.th);}
    info.textContent=sec+' · '+sel+' · '+t;
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
    rq=requestAnimationFrame(function(){rq=0;try{layout();}catch(e){console.warn(e);}updateInfo();paintSel();autosave();});
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
    if(a==='edit'||a==='preview'){setPreview(a==='preview'?true:false);return;}
    if(a==='save'){save();return;}
    if(a==='copy'){
      var t=exportText();
      if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(function(){toast('COPIED ✓ (tempel ke sky-data.js)');}).catch(function(){prompt('Copy:',t);});
      else prompt('Copy:',t);
      console.log('[layout export]\n'+t);return;
    }
    if(a==='fit'){window.__scnRefit=true;refresh();toast('FIT ULANG dari anchor');return;}
    if(a==='rst'){
      if(!confirm('Buang draft layout & muat ulang dari sky-data.js?'))return;
      try{localStorage.removeItem(LS_KEY);}catch(e){}
      window.__layOV={};window.__scnBounds=null;location.reload();return;
    }
    if(a==='collapse'){collapsed=!collapsed;hud.classList.toggle('col',collapsed);return;}
    if(a==='step'){stepI=(stepI+1)%3;var sb=hud.querySelector('[data-a=step]');if(sb)sb.textContent='STEP '+(stepI+1);return;}
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
    if(a==='l'||a==='r'||a==='u'||a==='d'){
      var s=ST[stepI],d=screenStep(a==='l'?-s:a==='r'?s:0,a==='u'?-s:a==='d'?s:0);
      moveW(sel,d[0],d[1]);refresh();return;
    }
    if(sel==='*'){
      var sn0=gSnap();
      if(a==='rotl')gApply(sn0,1,-RT[stepI],0,0);
      else if(a==='rotr')gApply(sn0,1,RT[stepI],0,0);
      else if(a==='zoout')gApply(sn0,1-SCF[stepI]*2,0,0,0);
      else if(a==='zoin')gApply(sn0,1+SCF[stepI]*2,0,0,0);
      refresh();return;
    }
    if(a==='rotl'){rotateBy(sel,-RT[stepI]);refresh();return;}
    if(a==='rotr'){rotateBy(sel,RT[stepI]);refresh();return;}
    if(a==='zoout'){setScale(sel,getScale(sel)*(1-SCF[stepI]*2));refresh();return;}
    if(a==='zoin'){setScale(sel,getScale(sel)*(1+SCF[stepI]*2));refresh();return;}
  }

  function inUI(e){return e.target&&e.target.closest&&e.target.closest('#lay-hud,#lay-fab');}

  function build(){
    if(hud)return;
    var css=[
      '#lay-hud{position:fixed;left:6px;right:6px;bottom:calc(6px + env(safe-area-inset-bottom,0px));z-index:99999;font:11px/1.3 "Courier New",monospace;color:#cfeffa;background:rgba(2,8,13,.94);border:1px solid rgba(110,229,255,.35);border-radius:8px;padding:6px;box-shadow:0 0 14px rgba(0,0,0,.55);touch-action:manipulation}',
      '#lay-hud .r{display:flex;gap:4px;margin-top:4px;align-items:stretch}',
      '#lay-hud .r:first-child{margin-top:0}',
      '#lay-hud #lay-info{flex:1;min-height:28px;font-size:10px;color:rgba(207,239,250,.9);overflow:hidden;word-break:break-all;display:flex;align-items:center}',
      '#lay-hud button,#lay-fab{min-height:34px;padding:2px 8px;border:1px solid rgba(110,229,255,.4);border-radius:5px;background:rgba(110,229,255,.08);color:#6ee5ff;font:700 12px "Courier New",monospace;-webkit-tap-highlight-color:transparent}',
      '#lay-hud button:active,#lay-fab:active{background:rgba(110,229,255,.3)}',
      '#lay-hud .g{flex:1}',
      '#lay-hud .a{border-color:rgba(255,154,217,.6);color:#ff9ad9}',
      '#lay-hud .on{background:rgba(255,154,217,.35);color:#fff}',
      '#lay-hud .p{border-color:rgba(130,255,170,.6);color:#8dffb0}',
      '#lay-hud.col .r:not(:first-child){display:none}',
      '#lay-fab{position:fixed;top:calc(8px + env(safe-area-inset-top,0px));right:8px;z-index:99999;display:none;background:rgba(2,8,13,.85);min-height:32px}',
      '#lay-sel{position:fixed;pointer-events:none;z-index:99990;border:1.5px dashed rgba(110,229,255,.85);border-radius:4px;box-shadow:0 0 10px rgba(110,229,255,.25);display:none}',
      '#lay-hdl{position:absolute;right:-14px;bottom:-14px;width:32px;height:32px;pointer-events:auto;touch-action:none;display:flex;align-items:flex-end;justify-content:flex-end;color:#6ee5ff;font-size:20px;line-height:1}',
      '#lay-hdl i{display:block;width:22px;height:22px;background:rgba(2,8,13,.9);border:1.5px solid #6ee5ff;border-radius:5px;text-align:center;font-style:normal;font-size:14px;line-height:21px}',
      'body.layout-edit,body.layout-edit canvas{touch-action:none}',
      /* sembunyikan fitur yang bentrok, TAPI biarkan 🛰️ (kembali ke overview) tetap ada */
      'body.layout-edit #mode-observe,body.layout-edit #mode-camera,body.layout-edit #mode-bh,body.layout-edit #cam-cluster,body.layout-edit #obs-btn,body.layout-edit #cam-btn,body.layout-edit #music-player,body.layout-edit #zoom-cluster,body.layout-edit .mp-wrap,body.layout-edit #owl-source,body.layout-edit #cf-bar,body.layout-edit #cam-whisper,body.layout-edit [id$="-fx"]{display:none!important;pointer-events:none!important}',
      'body.layout-edit #bh,body.layout-edit #cap-bh{pointer-events:none!important}',
      'body.layout-edit #mode-sectors{display:flex!important;pointer-events:auto!important}'
    ].join('');
    var st=document.createElement('style');st.id='lay-style';st.textContent=css;document.head.appendChild(st);
    hud=document.createElement('div');hud.id='lay-hud';
    hud.innerHTML=
      '<div class="r"><div id="lay-info"></div><button data-a="collapse" title="ciutkan">▾</button></div>'+
      '<div class="r"><button class="p g" data-a="preview"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:4px" aria-hidden="true"><path d="M2 12 C5 6.5 8.5 5 12 5 s7 1.5 10 7 c-3 5.5 -6.5 7 -10 7 S5 17.5 2 12 Z"/><circle cx="12" cy="12" r="3"/></svg>PREVIEW</button><button class="g" data-a="ovw"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:4px" aria-hidden="true"><circle cx="12" cy="12" r="4"/><ellipse cx="12" cy="12" rx="10" ry="3.6" transform="rotate(-25 12 12)"/></svg>OVERVIEW</button><button data-a="grp" title="Edit semua rasi di sektor sekaligus">◫ GRUP</button><button data-a="prev">‹</button><button data-a="next">›</button></div>'+
      '<div class="r"><button data-a="l">←</button><button data-a="u">↑</button><button data-a="d">↓</button><button data-a="r">→</button><button data-a="rotl">↺</button><button data-a="rotr">↻</button><button data-a="zoout">−</button><button data-a="zoin">+</button><button data-a="step">STEP 2</button></div>'+
      '<div class="r"><button class="a g" data-a="save">SAVE</button><button class="a g" data-a="copy">COPY</button><button class="g" data-a="fit">FIT</button><button class="g" data-a="rst">RST</button></div>';
    document.body.appendChild(hud);
    info=document.getElementById('lay-info');
    var fab=document.createElement('button');fab.id='lay-fab';fab.type='button';fab.setAttribute('data-a','edit');fab.innerHTML='<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:4px" aria-hidden="true"><path d="M4 20 l1 -4.5 L16.5 4 a2 2 0 0 1 3 3 L8 18.5 Z"/><path d="M14.5 6 l3 3"/></svg>EDIT';document.body.appendChild(fab);
    ring=document.createElement('div');ring.id='lay-sel';ring.innerHTML='<div id="lay-hdl"><i>◢</i></div>';document.body.appendChild(ring);

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
      if(e.target&&e.target.id==='lay-hdl'||(e.target.closest&&e.target.closest('#lay-hdl'))){
        var b=ringBox(sel);if(!b)return;
        var cx=(b[0]+b[2])/2,cy=(b[1]+b[3])/2;
        rs={id:sel,cx:cx,cy:cy,d0:Math.max(12,Math.hypot(e.clientX-cx,e.clientY-cy)),s0:sel==='*'?1:getScale(sel),snap:sel==='*'?gSnap():null};
        e.stopImmediatePropagation();e.preventDefault();return;
      }
      var id=hitCons(e.clientX,e.clientY);
      if(id){
        sel=id;updateInfo();paintSel();
        drag={id:id,last:v2w(e.clientX,e.clientY)};
        e.stopImmediatePropagation();e.preventDefault();
      }
    },opt());
    window.addEventListener('pointermove',function(e){
      if(preview)return;
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
      if(rs||drag){autosave();updateInfo();e&&e.stopImmediatePropagation&&e.stopImmediatePropagation();}
      rs=null;drag=null;
    }
    window.addEventListener('pointerup',end,opt());
    window.addEventListener('pointercancel',end,opt());
    window.addEventListener('beforeunload',autosave);
    window.addEventListener('resize',function(){setTimeout(paintSel,200);});
    setInterval(function(){if(sel&&!preview&&!drag&&!rs)paintSel();},500);
    updateInfo();
    console.log('[layout editor v4] preview + overview + handle resize');
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
