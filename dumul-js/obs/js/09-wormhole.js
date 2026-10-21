'use strict';
/* ===== 09-wormhole.js — wormhole transisi (gate Sector Gate + hold Gargantua mini) + muffle audio =====
   v4: terowongan "warp" biru-ungu-magenta dengan kilau hangat di tepi lubang, streak bintang melesat radial + berputar pelan
   (referensi: foto wormhole berkilau). Canvas 2D biasa: tanpa WebGL, tanpa shader, tanpa tekstur eksternal.
   Cara kerjanya (ringan): 2 buffer kecil (setengah resolusi layar) dipakai ping-pong sebagai "feedback zoom" — tiap frame isi buffer
   sebelumnya digambar lagi sedikit lebih besar + diputar sedikit + diredupkan, lalu disuntik titik bintang & blob warna dinding
   di dekat lubang. Zoom itulah yang bikin ekor streak/blur radial otomatis (panjang ekor ~ jarak dari pusat = perspektif), jadi
   nggak perlu gambar ratusan glyph/garis. Di atasnya digambar ~110 streak bintang tajam (garis pendek) + lubang hitam + vignette.
   Biaya per frame: 1 drawImage kecil (feedback) + ~120 sprite + 1 drawImage ke layar + ~110 garis.

   Titik sambung (semua lewat window.WORMHOLE, selalu dibungkus try/catch + cek keberadaan) — TIDAK BERUBAH dari v3:
     - 05-sector-ui.js  sgJump()         -> WORMHOLE.gate(s,camBH())        gate antar sektor
     - 06-interaction.js beginBHDrag()   -> holdStart / holdCommit / holdCancel   hold BH mini (long-press 580ms)
     - 04-render.js     startSwallow()   -> WORMHOLE.swallow(camBH(),ms)    swallow BH overview -> dumul.html (sebelum tesseract); dipicu tekan & tahan BH overview (06-interaction.js, sama seperti BH mini)
     - 01-core.js       spatialTarget()  -> WORMHOLE.muffle()               redam audio selama di dalam wormhole
   Efek mati sendiri (no-op) kalau prefers-reduced-motion atau canvas 2D tidak ada. */
(function(){
/* ---------- setelan (ubah di sini) ---------- */
var STAR_PAL=[[255,255,255],[175,205,255],[150,125,255],[255,125,205],[255,175,95],[95,225,255],[255,238,170]];  /* warna bintang (dominan putih/biru, sisanya "pelangi" kecil) */
var NEB_PAL=[[70,95,255],[150,65,240],[255,75,175],[255,125,70],[90,190,255]];   /* warna dinding terowongan; dipilih menurut sudut -> lengan spiral berwarna */
var N_STARS=380, N_STARS_LOW=110;   /* jumlah streak bintang tajam (potato lebih sedikit) */
/* Layer kedalaman (urutan jauh -> dekat): kecepatan, alpha, ketebalan, porsi jumlah */
var LAYERS=[{sp:.6,al:.5,sz:.6,cnt:.50},{sp:1.3,al:.8,sz:1.1,cnt:.32},{sp:2.2,al:1,sz:1.7,cnt:.18}];
var SPEED=1;          /* pengali kecepatan bintang (0.6 = lebih santai) */
var ZOOM=2.0;         /* kecepatan zoom buffer (e-fold/detik) = seberapa kencang terowongan "melesat" */
var SPIN=.20;         /* kecepatan putar terowongan (rad/detik); 0 = lurus tanpa swirl */
var DECAY=.955;       /* sisa terang buffer per frame @60fps. makin besar = ekor streak makin panjang */
var NEB_RATE=60;      /* blob warna dinding per detik. makin banyak = dinding makin pekat/terang */
var NEB_A=.09;        /* terang tiap blob dinding */
var DUST_RATE=2200;   /* debu/streak halus per detik yang disuntik ke buffer -> jadi ribuan garis radial tipis (murah: cuma sprite kecil)*/
var DUST_A=.55;       /* terang tiap debu */
var GLOW_A=.32;       /* terang kilau hangat di tepi lubang (0 = matikan) */
var EDGE_SOLID=.5;    /* mulut portal mini: bagian tengah (x radius) yang tetap pekat; sisanya meluruh halus jadi transparan ke arah tepi (makin kecil = tepi makin lembut) */
var RIM_GLOW=.09;     /* kilau tipis di luar mulut portal mini (0 = tanpa kilau). Pengganti garis cincin cyan yang dulu */
var R_HOLD=.22;       /* radius mulut portal saat hold, x min(W,H) */
var CHARGE_MS=580;    /* harus sama dengan setTimeout long-press di beginBHDrag */
var MIN_TRAVEL=2200;  /* ms minimal di dalam wormhole supaya efeknya kebaca */
var T_OPEN=900, T_MOVE=1100, T_FADE=420, T_CLOSE=900;   /* durasi buka portal / geser ke tengah / fade-in / tutup */

var ZN=.05, BG='#02050d', WARM=16;
var cv=null,g=null,spr=null,SC=48,dpr=1,RGB=[],NP=STAR_PAL.length,NN=NEB_PAL.length,
    ST=[],inited=false,ok=true,raf=0,last=0,state='idle',S={},env=0,ema=.016,dens=1,roll=0,tt=0,
    W=0,H=0,bw=0,bh=0,bq=.5,bA=null,bB=null,gA=null,gB=null,fresh=0,nebAcc=0,dustAcc=0;
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
/* Koordinat dari camBH()/pointer ada di ruang VIRTUAL stage (landscape HP: stage diputar 90°; desktop/tablet: portrait di-letterbox),
   sedangkan canvas ini menggambar di koordinat LAYAR asli. v2c() (01-core.js) menyamakan keduanya; portrait = identitas. */
function toScr(x,y){
  try{if(typeof v2c==='function'&&typeof STG!=='undefined'&&STG.on){var c=v2c(x,y);if(c&&isFinite(c[0])&&isFinite(c[1]))return c;}}catch(e){}
  return [x,y];
}

/* ---------- sprite titik lembut (di-bake sekali: satu baris per warna bintang + warna dinding) ---------- */
function buildSprites(){
  var all=STAR_PAL.concat(NEB_PAL),c=document.createElement('canvas'),x,i,col,gr,cy;
  SC=potato()?32:48;
  c.width=SC;c.height=all.length*SC;
  x=c.getContext('2d');
  for(i=0;i<all.length;i++){
    col=all[i];cy=i*SC+SC/2;
    gr=x.createRadialGradient(SC/2,cy,0,SC/2,cy,SC/2);
    gr.addColorStop(0,'rgba('+col+',1)');gr.addColorStop(.28,'rgba('+col+',.5)');gr.addColorStop(1,'rgba('+col+',0)');
    x.fillStyle=gr;x.fillRect(0,i*SC,SC,SC);
  }
  spr=c;
}
function spawn(c,isFresh){   /* isFresh=true: langsung muncul (isi awal); false: fade-in singkat */
  var L=LAYERS[c.L];
  c.th=Math.random()*6.283185307;
  /* posisi kepala seragam terhadap RADIUS: tepi layar ikut terisi sejak frame pertama */
  c.z=ZN/(.08+.9*Math.random());c.age=isFresh?1:0;
  c.v=(.9+Math.random()*1.0)*L.sp*SPEED;
  c.ci=Math.random()<.55?((Math.random()*2)|0):((Math.random()*NP)|0);   /* dominan putih/biru-putih */
  c.al=(.6+Math.random()*.4)*L.al;
  c.lf=.8+Math.random()*.5;   /* pengali panjang streak */
}
function build(){
  var n=potato()?N_STARS_LOW:N_STARS,i,li,k,c;
  ST.length=0;
  for(li=0;li<LAYERS.length;li++){
    k=Math.round(n*LAYERS[li].cnt);
    for(i=0;i<k;i++){c={L:li,r:Math.random()};spawn(c,true);ST.push(c);}   /* urut jauh -> dekat: yang dekat digambar terakhir */
  }
  RGB=STAR_PAL.map(function(p){return 'rgb('+p[0]+','+p[1]+','+p[2]+')';});
}
function mkBuf(){var c=document.createElement('canvas');c.width=bw;c.height=bh;return c;}
function clearBufs(){
  [gA,gB].forEach(function(x){if(!x)return;x.setTransform(1,0,0,1,0,0);x.globalCompositeOperation='source-over';x.globalAlpha=1;x.fillStyle=BG;x.fillRect(0,0,bw,bh);});
}
function resize(){
  if(!cv)return;
  var nw,nh;
  W=winW();H=winH();
  dpr=Math.min(window.devicePixelRatio||1,potato()?1:2);
  cv.width=Math.max(64,Math.round(W*dpr));cv.height=Math.max(64,Math.round(H*dpr));
  bq=potato()?.3:.5;
  nw=Math.max(32,Math.round(W*bq));nh=Math.max(32,Math.round(H*bq));
  if(!bA||nw!==bw||nh!==bh){
    bw=nw;bh=nh;bA=mkBuf();bB=mkBuf();gA=bA.getContext('2d');gB=bB.getContext('2d');
  }
  clearBufs();
}
function init(){
  if(inited||!usable())return inited&&ok;
  try{
    cv=document.createElement('canvas');cv.id='wh-canvas';cv.setAttribute('aria-hidden','true');
    cv.style.cssText='position:fixed;left:0;top:0;width:100%;height:100%;display:none;pointer-events:none;z-index:13;touch-action:none';
    g=cv.getContext('2d',{alpha:true});
    if(!g)throw new Error('no 2d');
    document.body.appendChild(cv);
    buildSprites();build();
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
   idle -> charge (hold berjalan) -> armed (portal terbuka penuh, jari masih menahan; boleh di-drag via holdMove) -> held (jari dilepas: nunggu kartu teleskop / sectZoomOut) -> travel -> close -> idle
   gate() langsung ke travel. holdCancel() / hold gagal -> close (mengecil). */
function show(){if(cv&&cv.style.display!=='block'){resize();cv.style.display='block';}}
function hide(){if(cv){cv.style.display='none';cv.style.opacity='1';cv.style.zIndex='13';}}
function hardStop(){if(raf){cancelAnimationFrame(raf);raf=0;}state='idle';env=0;hide();}
function kick(){if(!raf){last=performance.now();raf=requestAnimationFrame(tick);}}
function startClose(now,ms,shrink){
  if(state==='close'||state==='idle')return;
  S.c0=[S.cx,S.cy];S.r0=S.r;S.a0=S.a;S.e0=env;S.rate0=S.rate;S.tc=now;S.cms=ms;S.shrink=!!shrink;state='close';kick();
}
function holdStart(x,y,ms){
  if(!usable()||state!=='idle'&&state!=='close')return;
  if(!init())return;
  var sp=toScr(x,y);x=sp[0];y=sp[1];
  state='charge';S={x:x,y:y,cx:x,cy:y,t0:performance.now(),ms:ms||CHARGE_MS,r:0,a:0,rate:.5,rim:1};
  dens=1;show();fresh=Math.min(winW(),winH())*R_HOLD;kick();
}
function holdArm(){if(state==='charge'){S.p=1;state='armed';S.ta=performance.now();}}   /* hold selesai: portal siaga, TIDAK masuk dulu */
function holdMove(x,y){if(state==='armed'||state==='charge'){var sp=toScr(x,y);S.x=sp[0];S.y=sp[1];}}            /* geser mulut portal (jari masih menahan) */
function holdCommit(){if(state==='charge'||state==='armed'){S.p=1;state='held';S.th=performance.now();}}   /* jari dilepas -> lanjut masuk */
function holdCancel(){if(state==='charge'||state==='armed')startClose(performance.now(),240,true);}
function gate(s,pos){
  if(!usable()||!init())return;
  var now=performance.now(),sp=pos&&pos[0]!=null&&pos[1]!=null?toScr(pos[0],pos[1]):null,x=sp?sp[0]:winW()*.5,y=sp?sp[1]:winH()*.5;
  if(state==='idle'||state==='close'){dens=1;S={x:x,y:y,cx:x,cy:y,r:Math.min(winW(),winH())*R_HOLD*.5,a:.4,rate:.7,rim:1};}
  engage(now);show();fresh=Math.hypot(winW(),winH())*.56;kick();
}
function engage(now){
  state='travel';S.tt=now;S.r1=S.r;S.cx1=S.cx;S.cy1=S.cy;S.a1=S.a;S.rate1=S.rate;
}
/* Swallow BH overview (tap BH -> dumul.html): terowongan tumbuh dari BH BARENG swallow (ms ~ 2800) tapi digambar DI BAWAH canvas sky (z-index -1), penuh sebelum veil hitam
   menutup dan tesseract mengambil alih. Tidak menutup sendiri (halaman pindah); pengaman 14 dtk kalau navigasi gagal.
   Tanpa teleskop (di-swallow oleh sky canvas) dan tanpa muffle audio (GARG = BGM transisi, bukan stellar signal). */
function swallow(pos,ms,sec){
  if(!usable()||!init())return;
  var now=performance.now(),sp=pos&&pos[0]!=null&&pos[1]!=null?toScr(pos[0],pos[1]):null,
      x=sp?sp[0]:winW()*.5,y=sp?sp[1]:winH()*.5,
      r0=Math.min(winW(),winH())*R_HOLD*.45,a0=.4,rate0=.7,
      hold=(state==='charge'||state==='armed'||state==='held')&&cv&&cv.style.display==='block';   /* portal hold sudah terbuka (overview: tekan & tahan) */
  dens=1;
  if(hold){x=S.cx;y=S.cy;r0=Math.max(S.r,r0);a0=Math.max(S.a,a0);rate0=S.rate;}   /* teruskan portal yang ada: nggak mengecil lalu tumbuh lagi */
  S={x:x,y:y,cx:x,cy:y,r:r0,a:a0,rate:rate0,rim:1,sw:ms||2800,sec:!!sec};   /* sec: swallow BH mini di sektor (lihat startSectorSwallow di 04-render.js) */
  engage(now);show();fresh=hold?0:Math.min(winW(),winH())*R_HOLD;
  cv.style.zIndex='-1';   /* DI BAWAH #sky: bintang/rasi/BH/HUD yang ke-swallow tetap di depan terowongan. Sky "melubangi" platenya sendiri lewat hole() */
  kick();
}
/* Swallow sektor: terowongan sudah menutup layar -> naik ke ATAS sky (z 13) supaya zoom-out sektor di belakangnya tersembunyi, lalu menutup sendiri. */
function cover(){if(cv&&state==='travel'&&S.sec){cv.style.zIndex='13';S.cov=1;}}
/* Lubang di plate sky (koordinat virtual stage, sama dengan canvas #sky) supaya terowongan di bawahnya kelihatan. null = tidak ada. */
function hole(){
  if(state!=='travel'||!S.sw)return null;
  var c=(typeof c2v==='function'&&typeof STG!=='undefined'&&STG.on)?c2v(S.cx,S.cy):[S.cx,S.cy],
      k=(typeof STG!=='undefined'&&STG.on&&!STG.rot&&STG.k)?STG.k:1;
  return {x:c[0],y:c[1],r:S.r/k,a:clamp(S.a,0,1)};
}
function secBusy(){return typeof SECT!=='undefined'&&!!SECT.busy;}
function gatePending(){return typeof SGATE!=='undefined'&&!!SGATE.pend;}
function askOpen(){return (typeof LIS!=='undefined'&&!!LIS.cb)||document.body.classList.contains('lis-asking');}

/* ---------- gambar satu frame ---------- */
function moveStars(dt,adv){
  var n=ST.length,i,c;
  for(i=0;i<n;i++){
    c=ST[i];
    if(c.r>dens)continue;   /* kurangi bintang kalau frame berat */
    c.z*=Math.exp(-c.v*adv);
    if(c.z<ZN*.85)spawn(c,false);
    if(c.age<1)c.age=Math.min(1,c.age+dt*3);
  }
}
/* sprite lembut memanjang searah radial (len x w, px layar) di posisi layar (px,py) dengan sudut ang */
function dot(x,ci,px,py,w,len,ang,al){
  var co=Math.cos(ang),si=Math.sin(ang);
  x.globalAlpha=al;
  x.setTransform(co,si,-si,co,px*bq,py*bq);
  x.drawImage(spr,0,ci*SC,SC,SC,-len*bq/2,-w*bq/2,len*bq,w*bq);
}
/* satu langkah feedback: buffer lama di-zoom+putar+redam ke buffer baru, lalu suntik blob dinding, debu, kilau, dan kepala bintang */
function stepBuf(dt,cx,cy,Rv,Rh,adv){
  var s=Math.exp(ZOOM*adv),rot=SPIN*adv,co=Math.cos(rot)*s,si=Math.sin(rot)*s,x=cx*bq,y=cy*bq,
      dec=Math.pow(DECAY,dt*60),k=Math.min(1.6,dt*60),sg=s-1,
      i,n=ST.length,c,L,rh,a,rr,d,ci,f,t,ang,ga;
  gB.globalCompositeOperation='source-over';gB.globalAlpha=1;
  gB.setTransform(1,0,0,1,0,0);
  gB.fillStyle=BG;gB.fillRect(0,0,bw,bh);
  gB.setTransform(co,si,-si,co,x-(co*x-si*y),y-(si*x+co*y));
  gB.globalAlpha=dec;gB.drawImage(bA,0,0);
  gB.globalCompositeOperation='lighter';
  /* blob dinding terowongan: besar & lembut, muncul dekat tepi lubang, warna menurut sudut -> lengan spiral berwarna */
  nebAcc+=NEB_RATE*adv;
  if(nebAcc>40)nebAcc=40;
  while(nebAcc>=1){
    nebAcc-=1;
    ang=Math.random()*6.283185307;
    f=ang/6.283185307*NN+(Math.random()*2-.5);
    ci=NP+(((Math.floor(f)%NN)+NN)%NN);
    rr=Rh*(1.1+.8*Math.random());
    d=rr*(2.2+Math.random()*1.6);
    dot(gB,ci,cx+Math.cos(ang)*rr,cy+Math.sin(ang)*rr,d,d+rr*sg*2,ang,NEB_A*(.5+Math.random()*.7)*k);
  }
  /* debu halus: titik kecil dekat tepi lubang; zoom+putar memanjangkannya jadi streak radial tipis berwarna (inti tampilan "warp") */
  dustAcc+=DUST_RATE*adv;
  if(dustAcc>120)dustAcc=120;
  while(dustAcc>=1){
    dustAcc-=1;
    ang=Math.random()*6.283185307;
    if(Math.random()<.22)ci=(Math.random()*2)|0;   /* sebagian putih/biru-putih */
    else{f=ang/6.283185307*NN+(Math.random()*2.4-.7);ci=NP+(((Math.floor(f)%NN)+NN)%NN);}
    rr=Rh*(1.05+.35*Math.random());
    d=1.5+Math.random()*2.2;
    dot(gB,ci,cx+Math.cos(ang)*rr,cy+Math.sin(ang)*rr,d,d+rr*sg*1.4,ang,DUST_A*(.4+Math.random()*.6)*k);
  }
  /* kilau putih-hangat di tepi lubang: titik terang rapat di satu sisi -> lengkung terang yang melebar ke luar */
  if(GLOW_A>0){
    ga=-2.3+.35*Math.sin(tt*.35);
    for(i=0;i<4;i++){
      ang=ga+(Math.random()-.5)*.7;rr=Rh*(1.05+.25*Math.random());
      d=Rh*(.3+.45*Math.random());
      dot(gB,i&1?6:4,cx+Math.cos(ang)*rr,cy+Math.sin(ang)*rr,d,d+rr*sg*1.6,ang,GLOW_A*.6*k);
    }
  }
  /* kepala bintang -> garis pendek di buffer (ekornya diperpanjang feedback) */
  for(i=0;i<n;i++){
    c=ST[i];
    if(c.r>dens)continue;
    L=LAYERS[c.L];
    rh=Rv*ZN/c.z;
    if(rh<Rh*1.3)continue;
    a=c.th+roll;
    t=clamp((rh-Rh)/(Rh*1.5+1),0,1);
    d=1.4+rh*.005*L.sz;
    dot(gB,c.ci,cx+Math.cos(a)*rh,cy+Math.sin(a)*rh,d,d+rh*sg*1.3,a,c.al*c.age*t*.7*k);
  }
  gB.setTransform(1,0,0,1,0,0);
  t=bA;bA=bB;bB=t;t=gA;gA=gB;gB=t;
}
/* Teleskop ikut "terbang" lewat wormhole. Aslinya digambar di canvas #sky (04-render.js), yang tertutup canvas ini, jadi badannya
   digambar ulang di sini lewat teleDrawBody() (di-share dari 04-render.js). Goyangan/pembesaran naik pelan seiring portal membuka.
   Mendukung portrait, landscape biasa (body.ls, #sky di-scale) dan mode ROT (body.lr / lr-cw, stage diputar 90°). */
function drawTele(){
  var T=typeof TELESCOPE!=='undefined'?TELESCOPE:null,sk,rc,k,wob,x,y,sc,rot=0,cl;
  if(!T||typeof teleDrawBody!=='function'||!(T.al>.02)||!T.sc||!(T.sx||T.sy))return;
  sk=document.getElementById('sky');if(!sk)return;
  rc=sk.getBoundingClientRect();cl=document.body.classList;
  if(cl.contains('lr')){
    /* mode ROT: #stage diputar 90° (ccw default, cw kalau body.lr-cw). rect = kotak pembatas hasil rotasi, jadi koordinat sky -> layar dihitung dari sisinya */
    k=sk.clientWidth?rc.height/sk.clientWidth:1;
    if(cl.contains('lr-cw')){x=rc.right-T.sy*k;y=rc.top+T.sx*k;rot=1.5707963;}
    else{x=rc.left+T.sy*k;y=rc.bottom-T.sx*k;rot=-1.5707963;}
  }else{
    k=sk.clientWidth?rc.width/sk.clientWidth:1;
    x=rc.left+T.sx*k;y=rc.top+T.sy*k;
  }
  wob=clamp((S.a-.4)/.6,0,1);
  x+=Math.sin(tt*5.3)*3*wob;y+=Math.cos(tt*4.1)*2.5*wob;
  sc=T.sc*k*(1+.10*wob);
  g.save();
  g.translate(x,y);g.rotate(T.ang+rot+Math.sin(tt*2.7)*.14*wob);g.scale(sc,sc);
  g.globalAlpha=clamp(T.al,0,1);
  try{teleDrawBody(g,performance.now());}catch(e){}
  g.restore();
}
function drawFrame(dt,cx,cy,r,cvr){
  var Rv=Math.min(r,Math.hypot(W,H)*.56),                 /* radius tampilan perspektif (kepala bintang menyentuh Rv = tepi) */
      Rh=Math.min(r*.15,Math.min(W,H)*.06),              /* radius lubang hitam tengah */
      small=r<cvr*.98,n=ST.length,low=potato(),adv=dt*S.rate,
      i,c,L,rh,a,w,ca,sa,lf,tr,hx,hy,tx,ty,al,gr,Rw,Rhw,sd;
  tt+=dt;
  /* isi awal supaya terowongan sudah "penuh" begitu kebuka (bukan merambat pelan dari tengah) */
  if(fresh){
    Rw=Math.max(Rv,fresh);Rhw=Math.min(Rw*.15,Math.min(W,H)*.06);sd=.03*S.rate;
    for(i=0;i<(low?8:(Rw>Math.min(W,H)*.4?WARM:9));i++){roll+=sd*SPIN;tt+=.03;moveStars(.03,sd);stepBuf(.03,cx,cy,Rw,Rhw,sd);}
    fresh=0;
  }
  roll+=adv*SPIN;
  moveStars(dt,adv);
  stepBuf(dt,cx,cy,Rv,Rh,adv);

  g.setTransform(dpr,0,0,dpr,0,0);
  g.globalCompositeOperation='source-over';g.globalAlpha=1;
  g.clearRect(0,0,W,H);
  g.save();
  if(small){g.beginPath();g.arc(cx,cy,Math.max(1,r*1.06),0,6.283185307);g.clip();}   /* batas kerja saja; tepi tampak asli dibentuk mask alpha di bawah, bukan potongan ini */
  g.fillStyle=BG;g.fillRect(0,0,W,H);
  g.imageSmoothingEnabled=true;
  g.drawImage(bA,0,0,bw,bh,0,0,W,H);
  if(!low){g.globalCompositeOperation='lighter';g.globalAlpha=.45;g.drawImage(bA,0,0,bw,bh,0,0,W,H);}   /* bloom murah: gambar buffer sekali lagi aditif */

  /* streak bintang tajam: garis tipis radial, ekor makin panjang kalau makin dekat tepi (perspektif) */
  g.globalCompositeOperation='lighter';g.lineCap='round';
  for(i=0;i<n;i++){
    c=ST[i];
    if(c.r>dens)continue;
    L=LAYERS[c.L];
    rh=Rv*ZN/c.z;
    if(rh<Rh*1.3)continue;
    a=c.th+roll;
    lf=clamp(.17*Math.sqrt(c.v)*c.lf*S.rate,.06,.5);   /* panjang ekor relatif */
    tr=Math.max(Rh*1.05,rh*(1-lf));
    ca=Math.cos(a);sa=Math.sin(a);
    hx=cx+ca*rh;hy=cy+sa*rh;
    a-=SPIN*lf/Math.max(.3,c.v);   /* ekor sedikit melengkung mengikuti putaran */
    tx=cx+Math.cos(a)*tr;ty=cy+Math.sin(a)*tr;
    al=c.al*c.age*clamp((rh-Rh)/(Rh*1.5+1),0,1);
    if(al<.03)continue;
    w=clamp(.5+rh*.0018*L.sz,.5,2.2);
    g.beginPath();g.moveTo(tx,ty);g.lineTo(hx,hy);
    g.strokeStyle=RGB[c.ci];g.lineWidth=w;g.globalAlpha=al*.55;g.stroke();      /* seluruh streak, redup */
    if(!low&&c.L>0){   /* ujung kepala lebih terang: segmen pendek + inti putih */
      g.beginPath();g.moveTo(hx-(hx-tx)*.35,hy-(hy-ty)*.35);g.lineTo(hx,hy);
      g.lineWidth=w*1.2;g.globalAlpha=al;g.stroke();
      if(c.L>1){g.strokeStyle='#fff';g.lineWidth=w*.6;g.globalAlpha=al*.9;g.stroke();}
    }
  }
  g.globalAlpha=1;g.globalCompositeOperation='source-over';
  /* pusat: lubang hitam dengan tepi lembut */
  gr=g.createRadialGradient(cx,cy,Rh*.8,cx,cy,Rh*1.3);
  gr.addColorStop(0,'rgba(0,0,0,1)');gr.addColorStop(1,'rgba(0,0,0,0)');
  g.fillStyle=gr;g.beginPath();g.arc(cx,cy,Rh*1.3,0,6.283185307);g.fill();
  /* vignette: portal mini = gelap di tepi lingkaran; layar penuh = tepi layar sedikit digelapkan */
  if(small){
    /* tepi mulut portal: alpha diluruhkan halus ke 0 (destination-in) -> terowongan menyatu dengan sky di bawahnya, tanpa potongan keras / vignette gelap */
    g.globalCompositeOperation='destination-in';
    gr=g.createRadialGradient(cx,cy,0,cx,cy,Math.max(1,r));
    gr.addColorStop(0,'rgba(0,0,0,1)');gr.addColorStop(EDGE_SOLID,'rgba(0,0,0,1)');
    gr.addColorStop(EDGE_SOLID+(1-EDGE_SOLID)*.36,'rgba(0,0,0,.72)');gr.addColorStop(EDGE_SOLID+(1-EDGE_SOLID)*.68,'rgba(0,0,0,.26)');gr.addColorStop(1,'rgba(0,0,0,0)');
    g.fillStyle=gr;g.fillRect(0,0,W,H);
    g.globalCompositeOperation='source-over';
  }else{
    gr=g.createRadialGradient(cx,cy,Math.hypot(W,H)*.28,cx,cy,Math.hypot(W,H)*.62);
    gr.addColorStop(0,'rgba(2,5,13,0)');gr.addColorStop(1,'rgba(2,5,13,.55)');
    g.fillStyle=gr;g.fillRect(0,0,W,H);
  }
  if(!small&&(!S.sw||S.cov))drawTele();   /* mode layar penuh (gate): teleskop ikut di dalam terowongan */
  g.restore();
  g.setTransform(dpr,0,0,dpr,0,0);
  if(small&&RIM_GLOW>0&&S.rim>.02){   /* kilau lembut di sekitar mulut (bukan garis): halo tipis yang memudar ke dua arah */
    g.globalCompositeOperation='lighter';
    gr=g.createRadialGradient(cx,cy,r*.7,cx,cy,r*1.25);
    gr.addColorStop(0,'rgba(120,165,255,0)');gr.addColorStop(.55,'rgba(120,165,255,'+(RIM_GLOW*S.rim).toFixed(3)+')');gr.addColorStop(1,'rgba(120,165,255,0)');
    g.fillStyle=gr;g.beginPath();g.arc(cx,cy,r*1.25,0,6.283185307);g.fill();
    g.globalCompositeOperation='source-over';
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
  }else if(state==='armed'){
    /* siaga: mulut sedikit lebih besar & berdenyut, ikut jari dengan easing halus; tanpa batas waktu singkat (pengaman 30 dtk) */
    p=Math.min(1,dt*16);S.cx+=(S.x-S.cx)*p;S.cy+=(S.y-S.cy)*p;
    S.r=rh*(1.05+.03*Math.sin(now*.008));S.a=1;S.rate=lerp(S.rate,1,Math.min(1,dt*4));S.rim=1;env=.5;
    if(now-S.ta>30000)startClose(now,260,true);
  }else if(state==='held'){
    S.r=rh*(1+.03*Math.sin(now*.008));S.a=1;S.rate=.9;S.rim=1;env=.5;
    if(secBusy()&&typeof SECT!=='undefined'&&SECT.phase==='out')engage(now);
    else if(!askOpen()&&!secBusy()&&now-S.th>450)startClose(now,260,true);   /* kartu teleskop ditutup tanpa jalan */
    else if(now-S.th>20000)startClose(now,260,true);
  }
  if(state==='travel'){
    q=now-S.tt;
    if(S.sw){   /* swallow overview: buka mengikuti tarikan swallow, lalu terus melesat sampai veil/tesseract */
      S.r=lerp(S.r1,cvr,eo(q/(S.sw*.72)));
      p=sm(q/(S.sw*.6));S.cx=lerp(S.cx1,W*.5,p);S.cy=lerp(S.cy1,H*.5,p);
      S.a=lerp(S.a1,1,sm(q/380));S.rate=lerp(S.rate1,1.35,sm(q/(S.sw*.8)));S.rim=1-sm(q/(S.sw*.4));
      env=0;
      if(S.sec&&S.cov&&q>S.sw+400&&!secBusy()&&!gatePending())startClose(now,T_CLOSE,false);   /* swallow sektor: zoom-out selesai -> terowongan menutup, overview muncul */
      else if(q>14000)startClose(now,T_CLOSE,false);   /* pengaman: navigasi gagal / kembali dari bfcache */
    }else{
    S.r=lerp(S.r1,cvr,eo(q/T_OPEN));
    p=sm(q/T_MOVE);S.cx=lerp(S.cx1,W*.5,p);S.cy=lerp(S.cy1,H*.5,p);
    S.a=lerp(S.a1,1,sm(q/T_FADE));S.rate=lerp(S.rate1,1.1,sm(q/T_MOVE));S.rim=1-sm(q/T_OPEN);
    env=Math.max(env,0);env+=(1-env)*Math.min(1,dt*5);
    if(q>MIN_TRAVEL&&!secBusy()&&!gatePending())startClose(now,T_CLOSE,false);
    else if(q>9000)startClose(now,T_CLOSE,false);   /* pengaman: transisi macet */
    }
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
  holdArm:function(){try{holdArm();}catch(e){}},
  holdMove:function(x,y){try{holdMove(x,y);}catch(e){}},
  holdCommit:function(){try{holdCommit();}catch(e){}},
  holdCancel:function(){try{holdCancel();}catch(e){}},
  gate:function(s,pos){try{gate(s,pos);}catch(e){}},
  swallow:function(pos,ms){try{swallow(pos,ms);}catch(e){}},
  hole:function(){try{return hole();}catch(e){return null;}},
  cover:function(){try{cover();}catch(e){}},
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
