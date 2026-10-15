/* ===== 09-wormhole.js — wormhole transisi (gate Sector Gate + hold Gargantua mini) + muffle audio =====
   v3: terowongan hujan-kode "Matrix" (glyph + palet neon yang sama dengan boot di 07-boot.js) melesat radial dari tengah,
   dengan lubang hitam polos di tengah, 3 layer kedalaman (jauh: kecil/redup/lambat, dekat: besar/terang/cepat) seperti boot matrix. Canvas 2D biasa: tanpa WebGL, tanpa tekstur,
   tanpa shader -> ringan, tajam (DPR sampai 2), dan nggak butuh lisensi pen CodePen lagi (kodenya bukan turunan pen itu).
   Perspektif: kepala stream bergerak eksponensial ke arah kamera, glyph di ekornya berjarak geometris (makin ke tengah makin rapat),
   ukuran glyph ~ jarak dari pusat.

   Titik sambung (semua lewat window.WORMHOLE, selalu dibungkus try/catch + cek keberadaan):
     - 05-sector-ui.js  sgJump()         -> WORMHOLE.gate(s,camBH())        gate antar sektor
     - 06-interaction.js beginBHDrag()   -> holdStart / holdCommit / holdCancel   hold BH mini (long-press 580ms)
     - 01-core.js       spatialTarget()  -> WORMHOLE.muffle()               redam audio selama di dalam wormhole
   Efek mati sendiri (no-op) kalau prefers-reduced-motion atau canvas 2D tidak ada. */
(function(){
'use strict';
/* ---------- setelan (ubah di sini) ---------- */
var MATRIX_GREEN=false;   /* true = hijau Matrix klasik; false = palet neon CYBER_PAL yang sama dengan boot */
var GLYPHS='ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇ0123456789';
var PAL=MATRIX_GREEN?[[0,255,110],[60,255,140],[120,255,170],[0,210,80],[170,255,200],[30,230,100],[0,180,70]]
                    :[[34,230,255],[255,43,214],[180,74,255],[255,220,50],[80,160,255],[255,80,140],[80,255,180]];
var N_STREAMS=917, N_STREAMS_LOW=100;   /* jumlah stream total (potato lebih sedikit) */
/* Layer kedalaman (urutan jauh -> dekat, sama konsepnya dengan LAYERS di boot): kecepatan, alpha, ukuran glyph, porsi jumlah stream */
var LAYERS=[{sp:.40,al:.45,sz:.55,cnt:.46},{sp:.85,al:.75,sz:.78,cnt:.34},{sp:1.50,al:1,sz:1,cnt:.20}];
var SPEED=1.7;          /* pengali kecepatan keseluruhan stream (0.6 = lebih santai) */
var R_HOLD=.22;       /* radius mulut portal saat hold, x min(W,H) */
var CHARGE_MS=580;    /* harus sama dengan setTimeout long-press di beginBHDrag */
var MIN_TRAVEL=2200;  /* ms minimal di dalam wormhole supaya efeknya kebaca (tadinya 750: kecepetan) */
var T_OPEN=900, T_MOVE=1100, T_FADE=420, T_CLOSE=900;   /* durasi buka portal / geser ke tengah / fade-in / tutup */

var COL2=true;   /* tiap stream punya kolom kedua di sampingnya (lebih rapat di tepi layar; dimatikan otomatis di potato) */
var ZN=.05, ZF=1.7, RATIO=.915, MAXLEN=26;
var cv=null,g=null,atlas=null,CELL=64,dpr=1,GCOLS=GLYPHS.length,WHITE=PAL.length,RGB=[],RP=[],
    ST=[],inited=false,ok=true,raf=0,last=0,state='idle',S={},env=0,ema=.016,dens=1,roll=0,churn=0,
    W=0,H=0;
var reduceMq=window.matchMedia?matchMedia('(prefers-reduced-motion: reduce)'):null;
function potato(){return typeof IS_POTATO!=='undefined'&&IS_POTATO;}
function usable(){return ok&&!(reduceMq&&reduceMq.matches);}
function clamp(v,a,b){return v<a?a:(v>b?b:v);}
function lerp(a,b,t){return a+(b-a)*t;}
function sm(t){t=clamp(t,0,1);return t*t*(3-2*t);}
function eo(t){t=clamp(t,0,1);return 1-Math.pow(1-t,3);}
function winW(){return window.innerWidth||document.documentElement.clientWidth;}
function winH(){return window.innerHeight||document.documentElement.clientHeight;}
function cover(){return Math.hypot(winW(),winH())*1.08;}

/* ---------- atlas glyph (di-bake sekali: tiap glyph x tiap warna + 1 baris putih untuk kepala) ---------- */
function buildAtlas(){
  var c=document.createElement('canvas'),x,r,i,ch;
  CELL=potato()?40:64;
  c.width=GCOLS*CELL;c.height=(PAL.length+1)*CELL;
  x=c.getContext('2d');
  x.textAlign='center';x.textBaseline='middle';
  x.font=Math.round(CELL*.60)+'px "Courier New",monospace';
  for(r=0;r<=PAL.length;r++){
    var col=r===WHITE?[255,255,255]:PAL[r];
    x.fillStyle='rgb('+col[0]+','+col[1]+','+col[2]+')';
    x.shadowColor='rgba('+col[0]+','+col[1]+','+col[2]+',.9)';x.shadowBlur=potato()?0:CELL*.10;
    for(i=0;i<GCOLS;i++){ch=GLYPHS.charAt(i);x.fillText(ch,i*CELL+CELL/2,r*CELL+CELL/2+CELL*.03);}
  }
  atlas=c;
}
function randG(){return (Math.random()*GCOLS)|0;}
function spawn(c,fresh){   /* fresh=true: langsung muncul (isi awal); false: fade-in singkat */
  var j,L=LAYERS[c.L];
  c.th=Math.random()*6.283185307;
  /* posisi kepala seragam terhadap RADIUS (bukan log): tepi layar ikut terisi sejak frame pertama, nggak nunggu stream merambat dari tengah */
  c.z=ZN/(.08+.9*Math.random());c.age=fresh?1:0;
  c.v=(.9+Math.random()*1.0)*L.sp*SPEED;
  c.len=potato()?(8+((Math.random()*6)|0)):(12+((Math.random()*(MAXLEN-12))|0));
  c.ci=(Math.random()*PAL.length)|0;
  c.bar=Math.random()<.30;
  c.al=(.6+Math.random()*.4)*L.al;
  for(j=0;j<MAXLEN;j++){c.gl[j]=randG();c.g2[j]=randG();}
  c.off=(Math.random()<.5?-1:1)*(.03+Math.random()*.035);
}
function build(){
  var n=potato()?N_STREAMS_LOW:N_STREAMS,i,li,k,c;
  ST.length=0;
  for(li=0;li<LAYERS.length;li++){
    k=Math.round(n*LAYERS[li].cnt);
    for(i=0;i<k;i++){c={gl:new Array(MAXLEN),g2:new Array(MAXLEN),L:li,r:Math.random()};spawn(c,true);ST.push(c);}   /* urut jauh -> dekat: yang dekat digambar terakhir (di atas) */
  }
  RGB=PAL.map(function(p){return 'rgb('+p[0]+','+p[1]+','+p[2]+')';});
  RP=[];for(i=0;i<MAXLEN;i++)RP.push(Math.pow(RATIO,i));
}

function resize(){
  if(!cv)return;
  W=winW();H=winH();
  dpr=Math.min(window.devicePixelRatio||1,potato()?1:2);
  cv.width=Math.max(64,Math.round(W*dpr));cv.height=Math.max(64,Math.round(H*dpr));
}
function init(){
  if(inited||!usable())return inited&&ok;
  try{
    cv=document.createElement('canvas');cv.id='wh-canvas';cv.setAttribute('aria-hidden','true');
    cv.style.cssText='position:fixed;left:0;top:0;width:100%;height:100%;display:none;pointer-events:none;z-index:13;touch-action:none';
    g=cv.getContext('2d',{alpha:true});
    if(!g)throw new Error('no 2d');
    document.body.appendChild(cv);
    buildAtlas();build();
    inited=true;
  }catch(err){
    ok=false;inited=false;
    try{if(cv&&cv.parentNode)cv.parentNode.removeChild(cv);}catch(e2){}
    cv=null;g=null;
    try{console.warn('[wormhole] dimatikan:',err&&err.message);}catch(e3){}
  }
  return inited&&ok;
}

/* ---------- state machine ----------
   idle -> charge (hold berjalan) -> held (portal terbuka, nunggu kartu teleskop / sectZoomOut) -> travel -> close -> idle
   gate() langsung ke travel. holdCancel() / hold gagal -> close (mengecil). */
function show(){if(cv&&cv.style.display!=='block'){resize();cv.style.display='block';}}
function hide(){if(cv){cv.style.display='none';cv.style.opacity='1';}}
function hardStop(){if(raf){cancelAnimationFrame(raf);raf=0;}state='idle';env=0;hide();}
function kick(){if(!raf){last=performance.now();raf=requestAnimationFrame(tick);}}
function startClose(now,ms,shrink){
  if(state==='close'||state==='idle')return;
  S.c0=[S.cx,S.cy];S.r0=S.r;S.a0=S.a;S.e0=env;S.rate0=S.rate;S.tc=now;S.cms=ms;S.shrink=!!shrink;state='close';kick();
}
function holdStart(x,y,ms){
  if(!usable()||state!=='idle'&&state!=='close')return;
  if(!init())return;
  state='charge';S={x:x,y:y,cx:x,cy:y,t0:performance.now(),ms:ms||CHARGE_MS,r:0,a:0,rate:.5,rim:1};
  dens=1;show();kick();
}
function holdCommit(){if(state==='charge'){S.p=1;state='held';S.th=performance.now();}}
function holdCancel(){if(state==='charge')startClose(performance.now(),240,true);}
function gate(s,pos){
  if(!usable()||!init())return;
  var now=performance.now(),x=pos&&pos[0]!=null?pos[0]:winW()*.5,y=pos&&pos[1]!=null?pos[1]:winH()*.5;
  if(state==='idle'||state==='close'){dens=1;S={x:x,y:y,cx:x,cy:y,r:Math.min(winW(),winH())*R_HOLD*.5,a:.4,rate:.7,rim:1};}
  engage(now);show();kick();
}
function engage(now){
  state='travel';S.tt=now;S.r1=S.r;S.cx1=S.cx;S.cy1=S.cy;S.a1=S.a;S.rate1=S.rate;
}
function secBusy(){return typeof SECT!=='undefined'&&!!SECT.busy;}
function gatePending(){return typeof SGATE!=='undefined'&&!!SGATE.pend;}
function askOpen(){return (typeof LIS!=='undefined'&&!!LIS.cb)||document.body.classList.contains('lis-asking');}

/* ---------- gambar satu frame ---------- */
function drawFrame(dt,cx,cy,r,cvr){
  var Rv=Math.min(r,Math.hypot(W,H)*.56),                 /* radius tampilan perspektif (kepala stream menyentuh Rv = tepi) */
      Rh=Math.min(r*.14,Math.min(W,H)*.06),              /* radius lubang hitam tengah */
      smax=Math.max(3,Math.min(17,Rv*.055)),
      small=r<cvr*.98,n=ST.length,L,gl,ln,nc=(COL2&&!potato())?2:1,
      i,j,k,c,rh,rj,s,a,cs,sn,fade,al,w,sp,gr,adv=dt*S.rate;
  g.setTransform(dpr,0,0,dpr,0,0);
  g.clearRect(0,0,W,H);
  g.save();
  if(small){g.beginPath();g.arc(cx,cy,Math.max(1,r),0,6.283185307);g.clip();}
  g.fillStyle='#02060e';g.fillRect(0,0,W,H);
  roll+=adv*.10;
  churn+=dt;
  for(i=0;i<n;i++){
    c=ST[i];
    if(c.r>dens)continue;   /* kurangi stream acak kalau frame berat */
    L=LAYERS[c.L];
    c.z*=Math.exp(-c.v*adv);
    if(c.z<ZN*.85){spawn(c,false);}
    if(c.age<1)c.age=Math.min(1,c.age+dt*3);
    rh=Rv*ZN/c.z;
    if(rh<Rh*1.3)continue;
    if(churn>.07){c.gl[(Math.random()*MAXLEN)|0]=randG();c.g2[(Math.random()*MAXLEN)|0]=randG();}
    if(c.bar){
      a=c.th+roll;cs=Math.cos(a)*dpr;sn=Math.sin(a)*dpr;
      g.setTransform(cs,sn,-sn,cs,cx*dpr,cy*dpr);
      w=Math.max(1,rh*.008*L.sz+.5);
      sp=Math.max(Rh,rh*.40);
      g.fillStyle=RGB[c.ci];
      g.globalAlpha=c.al*c.age*.30;g.fillRect(sp,-w/2,rh-sp,w);
      g.globalAlpha=c.al*c.age*.95;g.fillRect(Math.max(sp,rh*.86),-w/2,rh-Math.max(sp,rh*.86),w);
    }else{
      for(k=0;k<nc;k++){
        a=c.th+roll+(k?c.off:0);cs=Math.cos(a)*dpr;sn=Math.sin(a)*dpr;
        g.setTransform(cs,sn,-sn,cs,cx*dpr,cy*dpr);
        gl=k?c.g2:c.gl;ln=k?((c.len*.65)|0):c.len;
        for(j=0;j<ln;j++){
          rj=rh*RP[j];
          if(rj<Rh*1.1)break;
          s=clamp(rj*.06,2.2,smax*L.sz);
          fade=clamp((rj-Rh)/(Rh*1.4+1),0,1);
          al=Math.pow(1-j/ln,1.15)*fade*c.al*c.age*(k?.8:1);
          if(al<.03)continue;
          g.globalAlpha=al;
          g.drawImage(atlas,gl[j]*CELL,(j===0&&!k?WHITE:c.ci)*CELL,CELL,CELL,rj-s/2,-s/2,s,s);
        }
      }
    }
  }
  if(churn>.07)churn=0;
  g.globalAlpha=1;
  g.setTransform(dpr,0,0,dpr,0,0);
  /* vignette tepi portal mini + bloom hangat Gargantua */
  if(small){
    gr=g.createRadialGradient(cx,cy,r*.62,cx,cy,r);
    gr.addColorStop(0,'rgba(2,6,14,0)');gr.addColorStop(1,'rgba(2,6,14,.9)');
    g.fillStyle=gr;g.fillRect(cx-r,cy-r,r*2,r*2);
  }
  /* pusat: lingkaran hitam polos dengan tepi lembut */
  gr=g.createRadialGradient(cx,cy,Rh*.78,cx,cy,Rh*1.3);
  gr.addColorStop(0,'rgba(0,0,0,1)');gr.addColorStop(1,'rgba(0,0,0,0)');
  g.fillStyle=gr;g.beginPath();g.arc(cx,cy,Rh*1.3,0,6.283185307);g.fill();
  g.restore();
  g.setTransform(dpr,0,0,dpr,0,0);
  if(small&&S.rim>.02){
    g.strokeStyle='rgba(110,229,255,'+(.9*S.rim).toFixed(3)+')';g.lineWidth=2;
    g.beginPath();g.arc(cx,cy,Math.max(1,r-1),0,6.283185307);g.stroke();
  }
}

function tick(now){
  raf=0;
  if(state==='idle'||!g||!ok)return;
  var dt=Math.min(.05,Math.max(0,(now-last)/1000)),p,q,cvr,rh,eT;
  W=winW();H=winH();cvr=cover();rh=Math.min(W,H)*R_HOLD;
  last=now;ema+=(dt-ema)*.08;
  if(state==='charge'){
    p=clamp((now-S.t0)/S.ms,0,1);
    S.r=rh*eo(p);S.a=Math.min(1,p*1.7);S.rate=lerp(.5,.9,p);S.cx=S.x;S.cy=S.y;S.rim=1;env=.5*sm(p);
    if(now>S.t0+S.ms+220)startClose(now,240,true);   /* timer long-press batal di tengah jalan tanpa lapor */
  }else if(state==='held'){
    S.r=rh*(1+.03*Math.sin(now*.008));S.a=1;S.rate=.9;S.rim=1;env=.5;
    if(secBusy()&&typeof SECT!=='undefined'&&SECT.phase==='out')engage(now);
    else if(!askOpen()&&!secBusy()&&now-S.th>450)startClose(now,260,true);   /* kartu teleskop ditutup tanpa jalan */
    else if(now-S.th>20000)startClose(now,260,true);
  }
  if(state==='travel'){
    q=now-S.tt;
    S.r=lerp(S.r1,cvr,eo(q/T_OPEN));
    p=sm(q/T_MOVE);S.cx=lerp(S.cx1,W*.5,p);S.cy=lerp(S.cy1,H*.5,p);
    S.a=lerp(S.a1,1,sm(q/T_FADE));S.rate=lerp(S.rate1,1.1,sm(q/T_MOVE));S.rim=1-sm(q/T_OPEN);
    env=Math.max(env,0);env+=(1-env)*Math.min(1,dt*5);
    if(q>MIN_TRAVEL&&!secBusy()&&!gatePending())startClose(now,T_CLOSE,false);
    else if(q>9000)startClose(now,T_CLOSE,false);   /* pengaman: transisi macet */
  }
  if(state==='close'){
    q=clamp((now-S.tc)/S.cms,0,1);eT=sm(q);
    S.cx=S.c0[0];S.cy=S.c0[1];
    S.r=S.shrink?S.r0*(1-.55*eT):S.r0;
    S.a=S.a0*(1-eT);S.rate=lerp(S.rate0,.6,eT);S.rim=S.shrink?1:0;env=S.e0*(1-eT);
    if(q>=1){state='idle';env=0;hide();return;}
  }
  /* kalau frame berat: kurangi jumlah stream (maks sampai 45%), resolusi tetap tajam */
  if(ema>.034&&dens>.46){dens-=.18;ema=.016;}
  if(cv.width!==Math.round(W*dpr)||cv.height!==Math.round(H*dpr))resize();
  cv.style.opacity=S.a>=.995?'1':S.a.toFixed(3);
  drawFrame(dt,S.cx,S.cy,Math.max(1,S.r),cvr);
  raf=requestAnimationFrame(tick);
}

/* Muffle audio untuk spatialTarget (01-core.js): 0..1, dipakai sebagai batas bawah target redam.
   .88 = angka yang sama dengan tunnel/star-tracker muffle yang sudah ada. */
function muffle(){return state==='idle'?0:.88*clamp(env,0,1);}

window.WORMHOLE={
  holdStart:function(x,y,ms){try{holdStart(x,y,ms);}catch(e){}},
  holdCommit:function(){try{holdCommit();}catch(e){}},
  holdCancel:function(){try{holdCancel();}catch(e){}},
  gate:function(s,pos){try{gate(s,pos);}catch(e){}},
  muffle:function(){return muffle();},
  get on(){return state!=='idle';},
  get supported(){return usable();}
};

window.addEventListener('resize',function(){if(state!=='idle'&&cv)resize();},{passive:true});
/* bake atlas ~puluhan ms: lakukan saat idle supaya hold pertama tidak patah (HP lemah: lazy). */
if(!potato()&&usable()){
  var idle=window.requestIdleCallback||function(f){return setTimeout(f,3500);};
  idle(function(){if(document.body)init();},{timeout:7000});
}
})();
