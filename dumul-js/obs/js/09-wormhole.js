'use strict';
/* ===== 09-wormhole.js — wormhole transisi (lompat antar sektor + sektor -> overview) + muffle audio =====
   F11b: mesin hold (holdStart/Arm/Move/Commit/Cancel, state charge/armed/held), hole() di bawah sky, dan tarikan pull()/HPV dibuang (tidak ada pemanggil sejak portal sektor pensiun).
   v5: fix cover() ganda (NaN), frame error aman.
   v4: terowongan "warp" biru-ungu-magenta dengan kilau hangat di tepi lubang, streak bintang melesat radial + berputar pelan
   (referensi: foto wormhole berkilau). Canvas 2D biasa: tanpa WebGL, tanpa shader, tanpa tekstur eksternal.
   Cara kerjanya (ringan): 2 buffer kecil (setengah resolusi layar) dipakai ping-pong sebagai "feedback zoom" — tiap frame isi buffer
   sebelumnya digambar lagi sedikit lebih besar + diputar sedikit + diredupkan, lalu disuntik titik bintang & blob warna dinding
   di dekat lubang. Zoom itulah yang bikin ekor streak/blur radial otomatis (panjang ekor ~ jarak dari pusat = perspektif), jadi
   nggak perlu gambar ratusan glyph/garis. Di atasnya digambar ~110 streak bintang tajam (garis pendek) + lubang hitam + vignette.
   Biaya per frame: 1 drawImage kecil (feedback) + ~120 sprite + 1 drawImage ke layar + ~110 garis.

   Titik sambung (semua lewat window.WORMHOLE, selalu dibungkus try/catch + cek keberadaan) — TIDAK BERUBAH dari v3:
     - 05-sector-ui.js  sectJumpTo()     -> WORMHOLE.gate(s,pos,R,cb)       lompat antar sektor / overview -> sektor (pos = teleskop atau tengah layar, wormAnchor())
     - 05-sector-ui.js  sectWormholeOut()-> WORMHOLE.overview(pos,R,cb)     sektor -> overview; jadwal & durasi SAMA dengan gate(), tanpa swallow
     - (swallow BH overview dihapus di F5; masuk dumul.html lewat beltEnter di 04-render.js, tanpa WORMHOLE)
     - 01-core.js       spatialTarget()  -> WORMHOLE.muffle()               redam audio selama di dalam wormhole
   Efek mati sendiri (no-op) kalau prefers-reduced-motion atau canvas 2D tidak ada. */
(function(){
/* ---------- setelan (ubah di sini) ---------- */
var STAR_PAL=[[255,255,255],[175,205,255],[150,125,255],[255,125,205],[255,175,95],[95,225,255],[255,238,170]];  /* warna bintang (dominan putih/biru, sisanya "pelangi" kecil) */
var NEB_PAL=[[70,95,255],[150,65,240],[255,75,175],[255,125,70],[90,190,255]];   /* warna dinding terowongan; dipilih menurut sudut -> lengan spiral berwarna */
var N_STARS=380, N_STARS_LOW=110;   /* jumlah streak bintang tajam (potato lebih sedikit) */
/* Layer kedalaman (urutan jauh -> dekat): kecepatan, alpha, ketebalan, porsi jumlah */
var LAYERS=[{sp:.6,al:.5,sz:.6,cnt:.50},{sp:1.3,al:.8,sz:1.1,cnt:.32},{sp:2.2,al:1,sz:1.7,cnt:.18}];
var SPEED=2;          /* pengali kecepatan bintang (0.6 = lebih santai) */
var ZOOM=4.0;         /* kecepatan zoom buffer (e-fold/detik) = seberapa kencang terowongan "melesat" */
var SPIN=.20;         /* kecepatan putar terowongan (rad/detik); 0 = lurus tanpa swirl */
var DECAY=.955;       /* sisa terang buffer per frame @60fps. makin besar = ekor streak makin panjang */
var NEB_RATE=60;      /* blob warna dinding per detik. makin banyak = dinding makin pekat/terang */
var NEB_A=.09;        /* terang tiap blob dinding */
var DUST_RATE=2200;   /* debu/streak halus per detik yang disuntik ke buffer -> jadi ribuan garis radial tipis (murah: cuma sprite kecil)*/
var DUST_A=.55;       /* terang tiap debu */
var GLOW_A=.32;       /* terang kilau hangat di tepi lubang (0 = matikan) */
var EDGE_SOLID=.5;    /* mulut portal mini: bagian tengah (x radius) yang tetap pekat; sisanya meluruh halus jadi transparan ke arah tepi (makin kecil = tepi makin lembut) */
var RIM_GLOW=.09;     /* kilau tipis di luar mulut portal mini (0 = tanpa kilau). Pengganti garis cincin cyan yang dulu */
/* Transisi sektor -> overview DAN lompat antar sektor memakai satu jadwal yang sama (go()), jadi durasinya identik:
     0 .. T_OPEN      dinding terowongan tumbuh dari tengah lubang hitam sampai memenuhi layar
     0 .. T_MOVE      lubang hitam terowongan bergeser dari posisi BH mini ke tengah layar (kesan masuk terowongan)
     T_SEEK..T_TRAVEL lubang hitam meluncur dari tengah layar ke tujuan: BH overview (ke overview) / BH mini sektor tujuan (lompat)
     T_TRAVEL..+T_EXIT dinding memudar dari pinggir layar ke tengah (menyusut ke mulut portal tujuan, miring mengikuti cincin), lubang hitam yang pekat memudar jadi transparan
   Total = T_TRAVEL + T_EXIT. Underlying sektor (zoom-out, dan zoom-in untuk lompat) jalan di bawah terowongan; T_TRAVEL cukup panjang untuk keduanya. */
/* Durasi lompatan (ms). T_DWELL = lama di dalam terowongan murni (bintang, teleskop melayang+miring), T_SEEKM = lubang hitam meluncur ke tujuan.
   Total dari lepas tahan = T_ENTER_TELE + T_OPEN + T_DWELL + T_SEEKM (+550 kalau lompat antar sektor) + T_EXIT. Kecilkan T_DWELL kalau kepanjangan. */
var T_OPEN=2300, T_DWELL=2600, T_SEEKM=2200;
var T_TRAVEL=T_OPEN+T_DWELL+T_SEEKM, T_TRAVEL_GATE=T_TRAVEL+1550, T_EXIT=2400, T_SEEK=2300;   /* lompat sektor lebih panjang: sektor asal zoom-out + sektor tujuan zoom-in jalan SETELAH layar tertutup */
function TT(){return S&&S.dest&&!S.fromOv?T_TRAVEL_GATE:T_TRAVEL;}   /* fromOv: overview -> sektor cuma satu zoom-in (tanpa zoom-out sektor asal), jadi jadwalnya = sektor -> overview */
function TS(){return TT()-T_SEEKM;}
/* Kemiringan teleskop di dalam terowongan (badan 3D; 2D cadangan cuma ikut roll). lean = condong ke arah lubang (keluar: condong ke depan), bank = miring ikut gerak melayang,
   buffet = getar halus saat ngebut. sx/sy/sz = arah sumbu (balik ke -1 kalau kemiringannya terasa terbalik). on:0 = mati. */
var TELE_TILT={on:1,lean:.5,bank:.9,buffet:.035,sx:1,sy:1,sz:1,exitDir:1,exitVel:.5};   /* exitDir: 1 = pose keluar sama seperti di terowongan (tidak berbalik), -1 = condong menjauhi lubang; exitVel: pengali bank/pitch dari kecepatan saat keluar */
/* POV "kamera di belakang pesawat" selama di terowongan (hanya badan 3D; badan 2D cadangan tetap pakai spin lama).
   yaw  : 1.5708 = tepat membelakangi (hidung lurus ke dalam layar); dikecilkan (1.1-1.2) supaya sisi badan + kokpit masih kelihatan = terasa 2.5D, bukan datar
   roll : 1.5708 = kokpit di atas (sayap/pod kiri-kanan), 0 = kokpit di samping
   pitch: condong tambahan (rad), + = makin mengintip dari atas
   th   : kekuatan api mesin saat POV belakang (1 = penuh); glow: pelebar kilau hijau mesin (0 = tanpa tambahan)
   exitFace: pose waktu keluar portal tujuan. -1 = muncul menghadap kamera (hidung ke arah kita, api hijau masuk ke lubang) lalu belok ke pose istirahat;
             +1 = tetap membelakangi seperti di terowongan lalu belok. exitMs: porsi pose dipertahankan sebelum mulai belok (0..1 dari pu) */
var TELE_CHASE={on:1,yaw:1.12,roll:1.5708,pitch:0,th:1,glow:.7,exitFace:-1,exitHold:.18};
var T_MOVE=2100, T_FADE=1420, T_CLOSE=1900;   /* T_OPEN = cincin + dinding terowongan membesar (zoom-in ke portal) sampai menutup layar */
var T_ENTER_TELE=1950;
var T_TELE_OVERLAP=1600;   /* ms: zoom-in ke portal mulai SEBELUM teleskop selesai terbang masuk (0 = berurutan seperti dulu; harus < T_ENTER_TELE, otomatis dibatasi 80%) */   /* durasi teleskop terbang masuk ke tengah cincin sebelum zoom-in dimulai */   /* durasi buka portal / geser ke tengah / fade-in / tutup (batal / pengaman) */

var ZN=.05, BG='#02050d', WARM=16;
var cv=null,g=null,spr=null,SC=48,dpr=1,RGB=[],NP=STAR_PAL.length,NN=NEB_PAL.length,
    ST=[],inited=false,ok=true,raf=0,last=0,state='idle',S={},env=0,ema=.016,dens=1,roll=0,tt=0,
    W=0,H=0,bw=0,bh=0,bq=.5,bA=null,bB=null,gA=null,gB=null,nebAcc=0,dustAcc=0;
/* [PATCH G4.12] feedback terowongan lewat WebGLRenderTarget ping-pong (ganti bA/bB saat hidup).
   [PATCH G4.12b] inject radial + composite layar penuh (#glwh): streak + hole + mask; #wh-canvas sisa portal.
   Flag ?glwh=0 A/B | ?glsky=0 paksa 2D | konsol WORMHOLE.gl / WHG.
   [PATCH G4.12f P0] hormati glsky=0; hole/mask/rim/clip uniform = piksel FB; smoothstep edge0<edge1.
   [PATCH G4.12 P2] satu WebGLRenderer (#glwh) utk feedback+composite+portal+tele (bukan 2 konteks). */
var WHG={on:true,ok:false,err:0,cv:null,r:null,rtA:null,rtB:null,scene:null,cam:null,fbMat:null,fbMesh:null,
  injScene:null,injMesh:null,injGeo:null,injN:0,injCap:0,tex:null,sprTex:null,dummy:null,why:'',
  bg:[2/255,5/255,13/255],
  fullCv:null,fullR:null,compScene:null,compCam:null,compMesh:null,compMat:null,
  stGeo:null,stMesh:null,stN:0,stCap:0,holeMesh:null,holeMat:null,maskMesh:null,maskMat:null,
  teleScene:null,teleCam:null,teleGrp:null,
  fullW:0,fullH:0,compOk:false,skipTeleGl:false};
try{if(/[?&]glwh=0(&|#|$)/.test(location.search))WHG.on=false;}catch(eGlw){}
var WHG_AA=true;try{if(/[?&]glwhaa=0(&|#|$)/.test(location.search))WHG_AA=false;}catch(eGaa){}   /* [G5] ?glwhaa=0 = tanpa MSAA di #glwh (A/B) */
try{if(/[?&]glsky=0(&|#|$)/.test(location.search)||(!/[?&]glsky=/.test(location.search)&&localStorage.getItem('dumul_glsky')==='0'))WHG.on=false;}catch(eGls){}   /* [PATCH G4.12f P0] rencana 0.1: ?glsky=0 = paksa 2D termasuk wormhole */
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
  try{whGlClear();}catch(eWgc){}   /* [PATCH G4.12] */
}
function resize(){
  if(!cv)return;
  var nw,nh;
  W=winW();H=winH();
  dpr=Math.min(window.devicePixelRatio||1,potato()?1:(WH_DPR||2));
  cv.width=Math.max(64,Math.round(W*dpr));cv.height=Math.max(64,Math.round(H*dpr));
  bq=potato()?.3:.5;
  nw=Math.max(32,Math.round(W*bq));nh=Math.max(32,Math.round(H*bq));
  if(!bA||nw!==bw||nh!==bh){
    bw=nw;bh=nh;bA=mkBuf();bB=mkBuf();gA=bA.getContext('2d');gB=bB.getContext('2d');
    try{whGlResize(bw,bh);}catch(eWgr){}   /* [PATCH G4.12] */
  }
  clearBufs();
}
/* ---------- [PATCH G4.12] feedback GL (WebGLRenderTarget ping-pong) ---------- */
var WHG_FB_VS='varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}';
var WHG_FB_FS=[
  'precision highp float;',
  'uniform sampler2D tPrev;uniform vec2 uC;uniform float uS;uniform float uR;uniform float uD;uniform vec3 uBg;uniform vec2 uRes;',
  'varying vec2 vUv;',
  'void main(){',
  '  vec2 uv=(vUv-uC)*uRes;',   /* [G5] rotasi di ruang PIKSEL buffer (bw x bh), bukan ruang UV: di UV (0..1) buffer portrait memutar dengan geser anisotropik (swirl miring), 2D memutar murni */
  '  float c=cos(uR),s=sin(uR);',
  '  uv=vec2(c*uv.x-s*uv.y,s*uv.x+c*uv.y)/max(uS,1e-4);',
  '  uv=uv/uRes+uC;',
  '  if(uv.x<0.0||uv.x>1.0||uv.y<0.0||uv.y>1.0){gl_FragColor=vec4(uBg,1.0);return;}',
  '  vec4 p=texture2D(tPrev,uv);',
  '  gl_FragColor=vec4(mix(uBg,p.rgb,uD),1.0);',
  '}'
].join('\n');
/* [PATCH G4.12b] inject: iP=x,y,len,w (buffer px); iC=atlas uv; iA=alpha,ang */
var WHG_IN_VS=[
  'attribute vec4 iP;attribute vec4 iC;attribute vec2 iA;',
  'varying vec2 vUv;varying float vA;',
  'uniform vec2 uRes;',
  'void main(){',
  '  vec2 q=position.xy*0.5+0.5;',
  '  vUv=mix(iC.xy,iC.zw,q);',
  '  vA=iA.x;',
  '  float c=cos(iA.y),s=sin(iA.y);',
  '  vec2 loc=vec2((q.x-0.5)*iP.z,(q.y-0.5)*iP.w);',
  '  vec2 p=iP.xy+vec2(c*loc.x-s*loc.y,s*loc.x+c*loc.y);',
  '  vec2 ndc=vec2((p.x/uRes.x)*2.0-1.0,1.0-(p.y/uRes.y)*2.0);',
  '  gl_Position=vec4(ndc,0.0,1.0);',
  '}'
].join('\n');
var WHG_IN_FS=[
  'precision highp float;',
  'uniform sampler2D tSpr;',
  'varying vec2 vUv;varying float vA;',
  'void main(){',
  '  vec4 t=texture2D(tSpr,vUv);',
  '  gl_FragColor=vec4(t.rgb*t.a*vA,t.a*vA);',
  '}'
].join('\n');
/* composite full: feedback + bloom uniform */
var WHG_COMP_VS='varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}';
var WHG_COMP_FS=[
  'precision highp float;',
  'uniform sampler2D tFb;uniform float uBloom;uniform vec3 uBg;',
  'varying vec2 vUv;',
  'void main(){',
  '  vec3 c=texture2D(tFb,vUv).rgb;',
  '  c=c+c*uBloom;',
  '  gl_FragColor=vec4(c,1.0);',
  '}'
].join('\n');
/* streak lines: iP = x0,y0,x1,y1 (px CSS); iC = rgb + alpha; iW = lebar (px CSS).
   [G5 polish] tepi dihitung di fragment (cakupan piksel + ujung bulat), meniru stroke() kanvas 2D yang antialias + lineCap round.
   Dulu quad polos tanpa AA: garis 0.5-2.2 px jadi bergerigi / putus-putus dan jauh lebih sedikit terlihat daripada ?glsky=0.
   Semua jarak di sini dalam piksel PERANGKAT (uDpr = rasio CSS -> perangkat). */
var WHG_ST_VS=[
  'attribute vec4 iP;attribute vec4 iC;attribute float iW;',
  'varying vec4 vC;varying vec4 vE;',
  'uniform vec2 uRes;uniform float uDpr;',
  'void main(){',
  '  vec2 a=iP.xy,b=iP.zw;',
  '  vec2 dir=b-a;float len=length(dir);',
  '  vec2 n=len>1e-4?dir/len:vec2(1.0,0.0);',
  '  vec2 perp=vec2(-n.y,n.x);',
  '  float lenD=len*uDpr;',
  '  float hw=iW*uDpr*0.5;',
  '  float pad=hw+1.0;',
  '  float u=mix(-pad,lenD+pad,position.x*0.5+0.5);',
  '  float v=position.y*pad;',
  '  vec2 p=a+n*(u/uDpr)+perp*(v/uDpr);',
  '  vC=iC;vE=vec4(u,v,hw,lenD);',
  '  gl_Position=vec4((p.x/uRes.x)*2.0-1.0,1.0-(p.y/uRes.y)*2.0,0.0,1.0);',
  '}'
].join('\n');
var WHG_ST_FS=[
  'precision highp float;',
  'varying vec4 vC;varying vec4 vE;',
  'void main(){',
  '  float dx=vE.x<0.0?-vE.x:(vE.x>vE.w?vE.x-vE.w:0.0);',
  '  float d=length(vec2(dx,vE.y));',
  '  float cov=min(clamp(vE.z+0.5-d,0.0,1.0),2.0*vE.z);',
  '  float al=vC.a*cov;',
  '  gl_FragColor=vec4(vC.rgb*al,al);',
  '}'
].join('\n');
/* hole + soft mask (radial) */
/* [PATCH G4.12f P0] uC/uR/uRes = koordinat framebuffer (CSS×dpr). smoothstep edge0<edge1. */
var WHG_HOLE_FS=[
  'precision highp float;',
  'uniform vec2 uC;uniform float uR;uniform float uA;uniform vec2 uRes;',
  'void main(){',
  '  vec2 p=gl_FragCoord.xy;p.y=uRes.y-p.y;',
  '  float d=distance(p,uC);',
  '  float a=uA*(1.0-smoothstep(uR*0.8,uR*1.3,d));',
  '  gl_FragColor=vec4(0.0,0.0,0.0,a);',
  '}'
].join('\n');
/* uMode 0 = destination-in soft mouth (small/exit); 1 = vignette source-over full-screen [G4.12f P1] */
var WHG_MASK_FS=[
  'precision highp float;',
  'uniform vec2 uC;uniform float uR;uniform float uEdge;uniform float uFade;uniform vec2 uRes;uniform vec4 uTm;',
  'uniform float uUseTm;uniform float uMode;',
  'void main(){',
  '  vec2 p=gl_FragCoord.xy;p.y=uRes.y-p.y;',
  '  vec2 d=p-uC;',
  '  if(uUseTm>0.5){',
  '    float inv=uTm.x*uTm.w-uTm.y*uTm.z;inv=abs(inv)<1e-8?1.0:1.0/inv;',
  '    d=inv*vec2(uTm.w*d.x-uTm.z*d.y,-uTm.y*d.x+uTm.x*d.y);',
  '  }',
  '  float rr=length(d)/max(uR,1.0);',
  '  if(uMode>0.5){',
  '    float edge=smoothstep(clamp(uEdge,0.0,0.99),1.0,rr);',
  '    float a=edge*0.55*clamp(uFade,0.0,1.0);',
  '    gl_FragColor=vec4(0.0078,0.0196,0.0510,1.0)*a;',
  '    return;',
  '  }',
  '  float es=clamp(uEdge,0.0,0.999);',
  '  float a=1.0;',
  '  if(rr>es){float t=clamp((rr-es)/max(1e-4,1.0-es),0.0,1.0);a=1.0-smoothstep(0.0,1.0,t);a*=mix(1.0,a,0.35);}',
  '  if(rr>1.0)a=0.0;',
  '  a*=clamp(uFade,0.0,1.0);',
  '  gl_FragColor=vec4(0.0,0.0,0.0,a);',
  '}'
].join('\n');
/* [PATCH G4.12j] konstanta blend INTERNAL three (bukan nilai GL mentah): ZeroFactor=200, OneFactor=201, SrcAlphaFactor=204, OneMinusSrcAlphaFactor=205.
   (three custom r186 tidak meng-export ZeroFactor/SrcAlphaFactor, tapi factorToGL tetap memetakan angka ini. Nilai GL mentah 0/770/1/771 -> undefined -> faktor 0 -> mask menghapus SELURUH #glwh = terowongan hilang.) */
var WHG_GL_ZERO=200,WHG_GL_SRC_ALPHA=204,WHG_GL_ONE=201,WHG_GL_ONE_MINUS_SRC_ALPHA=205;
function whGlWant(){
  return !!(WHG.on&&!potato()&&usable()&&typeof THREE!=='undefined'&&THREE.WebGLRenderTarget&&THREE.WebGLRenderer);
}
/* [PATCH G4.12f P1] snapshot feedback GL → buffer 2D sebelum fallback (hindari loncatan kosong) */
function whGlHandoff(){
  var gx,G=WHG,r,u;
  try{
    if(!bA||!G.ok)return;
    /* jika present ke WHG.cv di-skip (compOk), render sekali rtA → cv dulu */
    if(G.compOk&&G.r&&G.rtA&&G.fbMat&&G.scene&&G.cam){
      try{
        u=G.fbMat.uniforms;u.tPrev.value=G.rtA.texture;
        u.uC.value.set(.5,.5);u.uS.value=1;u.uR.value=0;u.uD.value=1;
        r=G.r;r.setRenderTarget(null);r.setClearColor(0x02050d,1);r.render(G.scene,G.cam);
      }catch(eP){}
    }
    if(!G.cv||!(G.cv.width>0))return;
    gx=gA||bA.getContext('2d');
    if(!gx)return;
    gx.setTransform(1,0,0,1,0,0);gx.globalAlpha=1;gx.globalCompositeOperation='copy';
    gx.drawImage(G.cv,0,0,G.cv.width,G.cv.height,0,0,bw,bh);
    gx.globalCompositeOperation='source-over';
  }catch(e){}
}
function whGlFail(why){
  try{whGlHandoff();}catch(eH){}   /* [PATCH G4.12f P1] */
  WHG.err++;WHG.ok=false;WHG.why=why||'err';
  try{console.warn('[wormhole] GL feedback mati → 2D:',WHG.why,'(#'+WHG.err+')');}catch(e){}
  if(WHG.err>=3)WHG.on=false;
}
function whGlDisposeRt(){
  try{if(WHG.rtA)WHG.rtA.dispose();}catch(e){}
  try{if(WHG.rtB)WHG.rtB.dispose();}catch(e){}
  WHG.rtA=WHG.rtB=null;
}
function whGlAllocRt(T,w,h){
  return new T.WebGLRenderTarget(w,h,{depthBuffer:false,stencilBuffer:false,minFilter:T.LinearFilter,magFilter:T.LinearFilter});
}
/* [PATCH G4.12 P2] satu WebGLRenderer (#glwh) utk feedback RT + composite + portal + tele */
function whGlEnsure(w,h){
  var T,r,c,geo,mat,cap,pw,ph;
  if(!whGlWant()||WHG.err>=3)return false;
  if(WHG.ok&&WHG.r&&WHG.rtA&&WHG.rtA.width===w&&WHG.rtA.height===h)return true;
  try{
    T=THREE;
    pw=Math.max(64,Math.round(W*dpr));ph=Math.max(64,Math.round(H*dpr));
    if(!WHG.r){
      c=document.createElement('canvas');c.id='glwh';c.setAttribute('aria-hidden','true');
      c.style.cssText='position:fixed;left:0;top:0;width:100%;height:100%;display:none;pointer-events:none;z-index:12;touch-action:none';
      if(cv&&cv.parentNode)cv.parentNode.insertBefore(c,cv);else document.body.appendChild(c);
      WHG.fullCv=c;WHG.cv=c;   /* cv = fullCv: handoff drawImage dari canvas yang sama */
      r=new T.WebGLRenderer({canvas:c,alpha:true,premultipliedAlpha:true,antialias:WHG_AA,depth:true,stencil:false,preserveDrawingBuffer:true,powerPreference:'low-power'});
      r.setClearColor(0x02050d,1);r.autoClear=true;
      r.toneMapping=T.ACESFilmicToneMapping;r.toneMappingExposure=1.0;   /* [FIX kedip] sama dgn renderer GLSky/overlay: tanpa ini badan teleskop berganti warna saat serah-terima sky<->terowongan (shader raw + portal toneMapped:false tidak terpengaruh) */
      WHG.r=r;WHG.fullR=r;   /* [P2] satu konteks */
      WHG.cam=new T.OrthographicCamera(-1,1,1,-1,-1,1);
      WHG.scene=new T.Scene();
      WHG.injScene=new T.Scene();
      WHG.dummy=new T.DataTexture(new Uint8Array([2,5,13,255]),1,1);
      WHG.dummy.needsUpdate=true;
      geo=new T.PlaneGeometry(2,2);
      mat=new T.ShaderMaterial({
        uniforms:{tPrev:{value:WHG.dummy},uC:{value:new T.Vector2(.5,.5)},uS:{value:1},uR:{value:0},uD:{value:1},uBg:{value:new T.Vector3(WHG.bg[0],WHG.bg[1],WHG.bg[2])},uRes:{value:new T.Vector2(w,h)}},
        vertexShader:WHG_FB_VS,fragmentShader:WHG_FB_FS,depthTest:false,depthWrite:false
      });
      WHG.fbMat=mat;WHG.fbMesh=new T.Mesh(geo,mat);WHG.fbMesh.frustumCulled=false;WHG.scene.add(WHG.fbMesh);
      cap=512;WHG.injCap=cap;
      WHG.injGeo=new T.InstancedBufferGeometry();
      WHG.injGeo.setAttribute('position',geo.attributes.position);
      WHG.injGeo.setAttribute('uv',geo.attributes.uv);
      WHG.injGeo.setIndex(geo.index);
      WHG.injGeo.setAttribute('iP',new T.InstancedBufferAttribute(new Float32Array(cap*4),4).setUsage(T.DynamicDrawUsage));
      WHG.injGeo.setAttribute('iC',new T.InstancedBufferAttribute(new Float32Array(cap*4),4).setUsage(T.DynamicDrawUsage));
      WHG.injGeo.setAttribute('iA',new T.InstancedBufferAttribute(new Float32Array(cap*2),2).setUsage(T.DynamicDrawUsage));
      WHG.injGeo.instanceCount=0;
      mat=new T.ShaderMaterial({
        uniforms:{tSpr:{value:WHG.dummy},uRes:{value:new T.Vector2(w,h)}},
        vertexShader:WHG_IN_VS,fragmentShader:WHG_IN_FS,
        transparent:true,depthTest:false,depthWrite:false,side:T.DoubleSide,   /* [PATCH G4.12k] VS membalik y (px y-bawah -> NDC y-atas) = winding terbalik: FrontSide meng-cull SEMUA sprite inject */
        blending:T.CustomBlending,blendEquation:T.AddEquation,blendSrc:T.OneFactor,blendDst:T.OneFactor
      });
      WHG.injMesh=new T.Mesh(WHG.injGeo,mat);WHG.injMesh.frustumCulled=false;WHG.injScene.add(WHG.injMesh);
    }else{
      WHG.fbMat.uniforms.uRes.value.set(w,h);
      WHG.injMesh.material.uniforms.uRes.value.set(w,h);
    }
    whGlDisposeRt();
    WHG.rtA=whGlAllocRt(T,w,h);WHG.rtB=whGlAllocRt(T,w,h);
    WHG.r.setRenderTarget(WHG.rtA);WHG.r.setClearColor(0x02050d,1);WHG.r.clear();
    WHG.r.setRenderTarget(WHG.rtB);WHG.r.clear();
    WHG.r.setRenderTarget(null);
    if(spr&&!WHG.sprTex){
      WHG.sprTex=new T.CanvasTexture(spr);
      WHG.sprTex.minFilter=T.LinearFilter;WHG.sprTex.magFilter=T.LinearFilter;
      WHG.sprTex.flipY=false;   /* [PATCH G4.12i] baris ci dari atas (sama dgn 2D drawImage ci*SC) */
      WHG.injMesh.material.uniforms.tSpr.value=WHG.sprTex;
    }
    WHG.ok=true;WHG.why='';
    return true;
  }catch(e){
    whGlFail((e&&e.message)||'ensure');
    return false;
  }
}
function whGlResize(w,h){
  if(!WHG.ok&&!whGlWant())return;
  try{
    if(WHG.ok){WHG.ok=false;whGlEnsure(w,h);}
  }catch(e){whGlFail('resize');}
}
function whGlClear(){
  if(!WHG.ok||!WHG.r)return;
  try{
    WHG.r.setRenderTarget(WHG.rtA);WHG.r.setClearColor(0x02050d,1);WHG.r.clear();
    WHG.r.setRenderTarget(WHG.rtB);WHG.r.clear();
    WHG.r.setRenderTarget(null);
    WHG.r.setClearColor(0x02050d,1);WHG.r.clear();
  }catch(e){}
}
function whGlKill(){
  try{whGlDisposeRt();}catch(e){}
  try{if(WHG.sprTex)WHG.sprTex.dispose();}catch(e2){}
  try{if(WHG.r)WHG.r.dispose();}catch(e3){}
  try{if(WHG.fullCv&&WHG.fullCv.parentNode)WHG.fullCv.parentNode.removeChild(WHG.fullCv);}catch(e4){}
  WHG.ok=false;WHG.compOk=false;WHG.r=null;WHG.fullR=null;WHG.cv=null;WHG.fullCv=null;
  WHG.scene=null;WHG.injScene=null;WHG.compScene=null;WHG.teleScene=null;
  WHG.fbMat=null;WHG.fbMesh=null;WHG.injMesh=null;WHG.injGeo=null;WHG.sprTex=null;
  WHG.compMesh=null;WHG.stMesh=null;WHG.holeMesh=null;WHG.maskMesh=null;
}
/* [PATCH G4.12b] x,y,len,w buffer-px; ang = sudut radial (sama dot 2D) */
function whGlPush(x,y,len,w,ang,ci,al){
  var n=WHG.injN,cap=WHG.injCap,a,o,rows,v0,v1;
  if(!WHG.injGeo||n>=cap||!(al>.004))return;
  a=WHG.injGeo.attributes;o=n*4;
  a.iP.array[o]=x;a.iP.array[o+1]=y;a.iP.array[o+2]=len;a.iP.array[o+3]=w;
  rows=STAR_PAL.length+NEB_PAL.length;
  v0=ci/rows;v1=(ci+1)/rows;
  a.iC.array[o]=0;a.iC.array[o+1]=v0;a.iC.array[o+2]=1;a.iC.array[o+3]=v1;
  a.iA.array[n*2]=al>1?1:al;a.iA.array[n*2+1]=ang||0;
  WHG.injN=n+1;
}
function whGlStep(dt,cx,cy,Rv,Rh,adv){
  var G=WHG,r,s,rot,dec,k,sg,x,y,i,n,c,L,rh,a,rr,d,ci,f,t,ang,ga,u,pr,T;
  if(!G.ok&&!whGlEnsure(bw,bh))return false;
  if(!G.ok||!G.r||!G.rtA)return false;
  try{
    r=G.r;T=THREE;
    s=Math.exp(ZOOM*adv);rot=SPIN*adv;dec=Math.pow(DECAY,dt*60);k=Math.min(1.6,dt*60);sg=s-1;
    x=cx*bq;y=cy*bq; /* pusat di ruang buffer */
    /* 1) feedback: sample rtA → rtB */
    u=G.fbMat.uniforms;
    u.tPrev.value=G.rtA.texture;
    u.uC.value.set(x/bw,1-y/bh);   /* [PATCH G4.12i] RT y-ke-atas, cx/cy y-ke-bawah: pivot zoom harus (x, 1-y) */
    u.uS.value=s;
    u.uR.value=rot;
    u.uD.value=dec;
    u.uRes.value.set(bw,bh);
    r.setRenderTarget(G.rtB);
    r.setClearColor(0x02050d,1);
    r.autoClear=true;
    r.render(G.scene,G.cam);
    /* 2) inject additive ke rtB */
    G.injN=0;
    nebAcc+=NEB_RATE*adv;if(nebAcc>40)nebAcc=40;
    while(nebAcc>=1){
      nebAcc-=1;
      ang=Math.random()*6.283185307;
      f=ang/6.283185307*NN+(Math.random()*2-.5);
      ci=NP+(((Math.floor(f)%NN)+NN)%NN);
      rr=Rh*(1.1+.8*Math.random());
      d=rr*(2.2+Math.random()*1.6);
      whGlPush((cx+Math.cos(ang)*rr)*bq,(cy+Math.sin(ang)*rr)*bq,(d+rr*sg*2)*bq,d*bq,ang,ci,NEB_A*(.5+Math.random()*.7)*k);
    }
    dustAcc+=DUST_RATE*adv;if(dustAcc>120)dustAcc=120;
    while(dustAcc>=1){
      dustAcc-=1;
      ang=Math.random()*6.283185307;
      if(Math.random()<.22)ci=(Math.random()*2)|0;
      else{f=ang/6.283185307*NN+(Math.random()*2.4-.7);ci=NP+(((Math.floor(f)%NN)+NN)%NN);}
      rr=Rh*(1.05+.35*Math.random());
      d=1.5+Math.random()*2.2;
      whGlPush((cx+Math.cos(ang)*rr)*bq,(cy+Math.sin(ang)*rr)*bq,(d+rr*sg*1.4)*bq,d*bq,ang,ci,DUST_A*(.4+Math.random()*.6)*k);
    }
    if(GLOW_A>0){
      ga=-2.3+.35*Math.sin(tt*.35);
      for(i=0;i<4;i++){
        ang=ga+(Math.random()-.5)*.7;rr=Rh*(1.05+.25*Math.random());
        d=Rh*(.3+.45*Math.random());
        whGlPush((cx+Math.cos(ang)*rr)*bq,(cy+Math.sin(ang)*rr)*bq,(d+rr*sg*1.6)*bq,d*bq,ang,i&1?6:4,GLOW_A*.6*k);
      }
    }
    n=ST.length;
    for(i=0;i<n;i++){
      c=ST[i];
      if(c.r>dens)continue;
      L=LAYERS[c.L];
      rh=Rv*ZN/c.z;
      if(rh<Rh*1.3)continue;
      a=c.th+roll;
      t=clamp((rh-Rh)/(Rh*1.5+1),0,1);
      d=1.4+rh*.005*L.sz;
      whGlPush((cx+Math.cos(a)*rh)*bq,(cy+Math.sin(a)*rh)*bq,(d+rh*sg*1.3)*bq,d*bq,a,c.ci,c.al*c.age*t*.7*k);
    }
    if(G.injN>0){
      G.injGeo.attributes.iP.needsUpdate=true;
      G.injGeo.attributes.iC.needsUpdate=true;
      G.injGeo.attributes.iA.needsUpdate=true;
      G.injGeo.instanceCount=G.injN;
      if(G.sprTex)G.injMesh.material.uniforms.tSpr.value=G.sprTex;
      r.autoClear=false;
      r.render(G.injScene,G.cam);
      r.autoClear=true;
    }
    /* 3) swap RT */
    pr=G.rtA;G.rtA=G.rtB;G.rtB=pr;
    /* 4) present rtA → WHG.cv hanya jika composite belum hidup (fallback 2D / whGlSrc). [PATCH G4.12f P1] skip redundan saat #glwh membaca rtA.texture */
    if(!G.compOk){
      u.tPrev.value=G.rtA.texture;
      u.uC.value.set(.5,.5);u.uS.value=1;u.uR.value=0;u.uD.value=1;
      r.setRenderTarget(null);
      r.setClearColor(0x02050d,1);
      r.render(G.scene,G.cam);
    }
    return true;
  }catch(e){
    whGlFail((e&&e.message)||'step');
    return false;
  }
}
function whGlSrc(){return (WHG.ok&&WHG.cv)?WHG.cv:bA;}   /* sumber drawImage feedback */
/* ---------- [PATCH G4.12b] composite layar penuh ---------- */
function whGlCompEnsure(){
  var T,G=WHG,geo,mat,cap,pw,ph;
  if(!G.ok||!G.r)return false;
  G.fullR=G.r;G.fullCv=G.fullCv||G.cv;   /* [P2] alias satu renderer */
  if(G.compOk&&G.fullCv&&G.fullW===Math.round(W*dpr)&&G.fullH===Math.round(H*dpr))return true;
  try{
    T=THREE;
    pw=Math.max(64,Math.round(W*dpr));ph=Math.max(64,Math.round(H*dpr));
    if(!G.compScene){
      G.compCam=new T.OrthographicCamera(-1,1,1,-1,-1,1);
      G.compScene=new T.Scene();
      geo=new T.PlaneGeometry(2,2);
      mat=new T.ShaderMaterial({
        uniforms:{tFb:{value:G.dummy},uBloom:{value:0},uBg:{value:new T.Vector3(G.bg[0],G.bg[1],G.bg[2])}},
        vertexShader:WHG_COMP_VS,fragmentShader:WHG_COMP_FS,depthTest:false,depthWrite:false
      });
      G.compMat=mat;G.compMesh=new T.Mesh(geo,mat);G.compMesh.frustumCulled=false;G.compScene.add(G.compMesh);
      cap=768;G.stCap=cap;
      G.stGeo=new T.InstancedBufferGeometry();
      G.stGeo.setAttribute('position',geo.attributes.position);
      G.stGeo.setAttribute('uv',geo.attributes.uv);
      G.stGeo.setIndex(geo.index);
      G.stGeo.setAttribute('iP',new T.InstancedBufferAttribute(new Float32Array(cap*4),4).setUsage(T.DynamicDrawUsage));
      G.stGeo.setAttribute('iC',new T.InstancedBufferAttribute(new Float32Array(cap*4),4).setUsage(T.DynamicDrawUsage));
      G.stGeo.setAttribute('iW',new T.InstancedBufferAttribute(new Float32Array(cap),1).setUsage(T.DynamicDrawUsage));
      G.stGeo.instanceCount=0;
      mat=new T.ShaderMaterial({
        uniforms:{uRes:{value:new T.Vector2(W,H)},uDpr:{value:dpr||1}},
        vertexShader:WHG_ST_VS,fragmentShader:WHG_ST_FS,
        transparent:true,depthTest:false,depthWrite:false,side:T.DoubleSide,   /* [G5] VS membalik y (px y-bawah -> NDC y-atas) + basis (n,perp) = winding terbalik: FrontSide meng-cull SEMUA streak (sama dgn pelajaran G4.12k di sprite inject) */
        blending:T.CustomBlending,blendEquation:T.AddEquation,blendSrc:T.OneFactor,blendDst:T.OneFactor
      });
      G.stMesh=new T.Mesh(G.stGeo,mat);G.stMesh.frustumCulled=false;G.compScene.add(G.stMesh);
      mat=new T.ShaderMaterial({
        uniforms:{uC:{value:new T.Vector2(0,0)},uR:{value:1},uA:{value:1},uRes:{value:new T.Vector2(W,H)}},
        vertexShader:WHG_COMP_VS,fragmentShader:WHG_HOLE_FS,
        transparent:true,depthTest:false,depthWrite:false,
        blending:T.CustomBlending,blendEquation:T.AddEquation,blendSrc:T.OneFactor,blendDst:T.OneMinusSrcAlphaFactor
      });
      G.holeMat=mat;G.holeMesh=new T.Mesh(geo.clone(),mat);G.holeMesh.frustumCulled=false;G.compScene.add(G.holeMesh);
      mat=new T.ShaderMaterial({
        uniforms:{
          uC:{value:new T.Vector2(0,0)},uR:{value:1},uEdge:{value:EDGE_SOLID},uFade:{value:1},
          uRes:{value:new T.Vector2(W,H)},uTm:{value:new T.Vector4(1,0,0,1)},uUseTm:{value:0},uMode:{value:0}
        },
        vertexShader:WHG_COMP_VS,fragmentShader:WHG_MASK_FS,
        transparent:true,depthTest:false,depthWrite:false,
        blending:T.CustomBlending,blendEquation:T.AddEquation,
        blendSrc:WHG_GL_ZERO,blendDst:WHG_GL_SRC_ALPHA,
        blendSrcAlpha:WHG_GL_ZERO,blendDstAlpha:WHG_GL_SRC_ALPHA
      });
      G.maskMat=mat;G.maskMesh=new T.Mesh(geo.clone(),mat);G.maskMesh.frustumCulled=false;G.maskMesh.renderOrder=10;G.compScene.add(G.maskMesh);
      G.teleScene=new T.Scene();
      G.teleCam=new T.OrthographicCamera(0,1,1,0,-600,600);G.teleCam.position.z=5;
    }
    /* setSize drawing buffer = full window; RT feedback tetap half-res terpisah */
    G.fullCv.width=pw;G.fullCv.height=ph;G.fullR.setSize(pw,ph,false);
    G.fullW=pw;G.fullH=ph;
    G.stMesh.material.uniforms.uRes.value.set(W,H);G.stMesh.material.uniforms.uDpr.value=dpr||1;
    G.holeMat.uniforms.uRes.value.set(pw,ph);
    if(G.maskMat)G.maskMat.uniforms.uRes.value.set(pw,ph);
    if(G.teleCam){G.teleCam.left=0;G.teleCam.right=W;G.teleCam.top=H;G.teleCam.bottom=0;G.teleCam.updateProjectionMatrix();}
    G.compOk=true;
    return true;
  }catch(e){
    G.compOk=false;
    try{console.warn('[wormhole] composite GL gagal:',e&&e.message);}catch(e2){}
    return false;
  }
}
function whGlStPush(x0,y0,x1,y1,rgb,al,w){
  var n=WHG.stN,a,o;
  if(!WHG.stGeo||n>=WHG.stCap||!(al>.02))return;
  a=WHG.stGeo.attributes;o=n*4;
  a.iP.array[o]=x0;a.iP.array[o+1]=y0;a.iP.array[o+2]=x1;a.iP.array[o+3]=y1;
  a.iC.array[o]=(rgb[0]|0)/255;a.iC.array[o+1]=(rgb[1]|0)/255;a.iC.array[o+2]=(rgb[2]|0)/255;a.iC.array[o+3]=al>1?1:al;
  a.iW.array[n]=w;
  WHG.stN=n+1;
}
/* true = composite GL berhasil digambar ke #glwh (pemanggil skip 2D feedback/streak/hole/mask) */
function whGlComposite(cx,cy,r,cvr,Rv,Rh,small,low,tmW){
  var G=WHG,rdr,i,n,c,L,rh,a,lf,tr,ca,sa,hx,hy,tx,ty,al,w,col,bloom,es;
  if(!G.ok||!whGlCompEnsure())return false;
  try{
    rdr=G.fullR;
    /* feedback texture */
    G.compMat.uniforms.tFb.value=G.rtA?G.rtA.texture:G.dummy;
    bloom=(!low&&WH_DBG.indexOf('nobloom')<0&&!(WH_NOBLOOM&&small))?.45:0;
    G.compMat.uniforms.uBloom.value=bloom;
    G.stN=0;G.stMesh.material.uniforms.uDpr.value=dpr||1;
    n=ST.length;
    for(i=0;i<n;i++){
      c=ST[i];
      if(c.r>dens)continue;
      L=LAYERS[c.L];
      rh=Rv*ZN/c.z;
      if(rh<Rh*1.3)continue;
      a=c.th+roll;
      lf=clamp(.17*Math.sqrt(c.v)*c.lf*S.rate,.06,.5);
      tr=Math.max(Rh*1.05,rh*(1-lf));
      if(small&&tr>r*1.15)continue;
      ca=Math.cos(a);sa=Math.sin(a);
      hx=cx+ca*rh;hy=cy+sa*rh;
      a-=SPIN*lf/Math.max(.3,c.v);
      tx=cx+Math.cos(a)*tr;ty=cy+Math.sin(a)*tr;
      al=c.al*c.age*clamp((rh-Rh)/(Rh*1.5+1),0,1);
      if(al<.03)continue;
      w=clamp(.5+rh*.0018*L.sz,.5,2.2);
      col=STAR_PAL[c.ci]||STAR_PAL[0];
      whGlStPush(tx,ty,hx,hy,col,al*.55,w);
      if(!low&&c.L>0){
        whGlStPush(hx-(hx-tx)*.35,hy-(hy-ty)*.35,hx,hy,col,al,w*1.2);
        if(c.L>1)whGlStPush(hx-(hx-tx)*.2,hy-(hy-ty)*.2,hx,hy,[255,255,255],al*.9,w*.6);
      }
    }
    if(G.stN>0){
      G.stGeo.attributes.iP.needsUpdate=true;
      G.stGeo.attributes.iC.needsUpdate=true;
      G.stGeo.attributes.iW.needsUpdate=true;
      G.stGeo.instanceCount=G.stN;
      G.stMesh.visible=true;
    }else{G.stMesh.visible=false;G.stGeo.instanceCount=0;}
    /* hole — uniform dalam piksel FB (×dpr) [G4.12f P0] */
    var _px=dpr||1;
    if(state!=='exit'){
      G.holeMesh.visible=true;
      G.holeMat.uniforms.uC.value.set(cx*_px,cy*_px);
      G.holeMat.uniforms.uR.value=Rh*_px;
      G.holeMat.uniforms.uA.value=1;
    }else{
      var uxH=S.u||0,waH=1-sm((uxH-.74)/.26);
      G.holeMesh.visible=waH>.01;
      G.holeMat.uniforms.uC.value.set(cx*_px,cy*_px);
      G.holeMat.uniforms.uR.value=Rh*_px;
      G.holeMat.uniforms.uA.value=Math.max(0,(1-sm(uxH))*waH);
    }
    /* soft mask (small/exit) atau vignette full-screen [G4.12f P1] — FB px */
    if(G.maskMesh&&G.maskMat){
      var maskR=r,maskFade=1,es=S.edge||EDGE_SOLID,mode=0;
      if(state==='exit'){
        var ux=S.u||0,wk=sm(ux/.78),wa=1-sm((ux-.74)/.26),Rm=Math.min(W,H)*.06;
        try{
          var kk=(typeof STG!=='undefined'&&STG.on&&!STG.rot&&STG.k)?STG.k:1;
          Rm=(!S.dest&&typeof PT3D!=='undefined'&&PT3D.ovR>2)?PT3D.ovR*kk*(typeof PT_IN==='number'?PT_IN:.745):S.rp*(typeof PT_IN==='number'?PT_IN:.745);
        }catch(eRm){}
        if(!(Rm>2))Rm=Math.min(W,H)*.06;
        maskR=lerp(Math.hypot(W,H)*1.1,Rm,wk);
        maskFade=wa;es=.7;mode=0;
      }else if(!small){
        /* full-screen: source-over gelap tepi (setara gradient 2D alpha .55), bukan destination-in */
        maskR=Math.hypot(W,H)*.62;es=.45;mode=1;
      }
      G.maskMat.uniforms.uC.value.set(cx*_px,cy*_px);
      G.maskMat.uniforms.uR.value=Math.max(1,maskR*_px);
      G.maskMat.uniforms.uEdge.value=es;
      G.maskMat.uniforms.uFade.value=maskFade;
      G.maskMat.uniforms.uMode.value=mode;
      if(tmW&&tmW.length>=4){
        G.maskMat.uniforms.uTm.value.set(tmW[0],tmW[1],tmW[2],tmW[3]);
        G.maskMat.uniforms.uUseTm.value=1;
      }else G.maskMat.uniforms.uUseTm.value=0;
      if(mode>0.5){
        G.maskMat.blendSrc=WHG_GL_ONE;G.maskMat.blendDst=WHG_GL_ONE_MINUS_SRC_ALPHA;
        G.maskMat.blendSrcAlpha=WHG_GL_ONE;G.maskMat.blendDstAlpha=WHG_GL_ONE_MINUS_SRC_ALPHA;
      }else{
        G.maskMat.blendSrc=WHG_GL_ZERO;G.maskMat.blendDst=WHG_GL_SRC_ALPHA;
        G.maskMat.blendSrcAlpha=WHG_GL_ZERO;G.maskMat.blendDstAlpha=WHG_GL_SRC_ALPHA;
      }
      G.maskMesh.visible=true;
    }
    /* render: clear transparent, feedback, streaks, hole, mask */
    rdr.setClearColor(0x000000,0);
    rdr.autoClear=true;
    rdr.setSize(G.fullW,G.fullH,false);
    G.compMesh.renderOrder=0;G.stMesh.renderOrder=1;G.holeMesh.renderOrder=2;
    if(G.maskMesh)G.maskMesh.renderOrder=10;
    rdr.setRenderTarget(null);   /* [PATCH G4.12g] composite WAJIB ke layar: sesudah whGlStep target masih rtA (feedback loop rtA->rtA) */
    rdr.render(G.compScene,G.compCam);
    /* reset CSS leftovers dari G4.12b */
    if(G.fullCv){G.fullCv.style.clipPath='none';G.fullCv.style.opacity='1';if(G.fullCv.style.display!=='block')G.fullCv.style.display='block';}
    return true;
  }catch(e){
    try{console.warn('[wormhole] composite:',e&&e.message);}catch(e2){}
    return false;
  }
}
/* [FIX kedip masuk] selama 'enter' belum ada composite, #glwh tersembunyi padahal teleskop sudah dipindah ke sana = teleskop HILANG ±1 dtk lalu muncul lagi. Sekarang #glwh ditampilkan + dibersihkan transparan tiap frame enter. */
function whGlEnterPrep(){
  var G=WHG,r;
  if(!whGlWant()||!(G.ok||whGlEnsure(bw,bh))||!whGlCompEnsure())return false;
  try{
    r=G.fullR;r.setRenderTarget(null);r.setClearColor(0x000000,0);r.clear();
    if(G.fullCv){G.fullCv.style.clipPath='none';G.fullCv.style.opacity='1';if(G.fullCv.style.display!=='block')G.fullCv.style.display='block';}
    return true;
  }catch(e){return false;}
}
function whGlCompHide(){
  if(WHG.fullCv)WHG.fullCv.style.display='none';
}
/* [PATCH G4.12c/d] teleskop di present #glwh; [G4.12d] clip setengah-bidang lewat tele RT + shader */
function whGlTeleWant(){return !!(WHG.compOk&&WHG.fullR&&WHG.teleScene&&WHG.ok&&!WHG.skipTeleGl);}   /* [PATCH G4.12f P1] skipTeleGl saat portal fallback 2D */
function whGlTeleAttach(grp){
  if(!whGlTeleWant()||!grp)return false;
  try{
    if(grp.parent&&grp.parent!==WHG.teleScene)grp.parent.remove(grp);
    if(grp.parent!==WHG.teleScene)WHG.teleScene.add(grp);
    WHG.teleGrp=grp;return true;
  }catch(e){return false;}
}
function whGlTeleDetach(grp){
  try{if(WHG.teleScene&&grp&&grp.parent===WHG.teleScene)WHG.teleScene.remove(grp);}catch(e){}
  if(WHG.teleGrp===grp)WHG.teleGrp=null;
}
var WHG_CLIP_VS='varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}';
var WHG_CLIP_FS=[
  'precision highp float;',
  'uniform sampler2D tMap;uniform vec2 uP;uniform vec2 uN;uniform float uUseClip;uniform float uA;',
  'varying vec2 vUv;',
  'void main(){',
  '  vec4 c=texture2D(tMap,vUv);',
  '  if(uUseClip>0.5){',
  '    vec2 p=vec2(vUv.x,1.0-vUv.y);', /* vUv top-left style → match screen y-down if texture from RT */
  '    /* RT di three: v=0 bawah; p layar: y ke bawah dari atas → pakai frag di present */',
  '  }',
  '  gl_FragColor=vec4(c.rgb*uA,c.a*uA);',
  '}'
].join('\n');
/* clip FS memakai gl_FragCoord (lebih andal daripada vUv flip) */
var WHG_CLIP_FS2=[
  'precision highp float;',
  'uniform sampler2D tMap;uniform vec2 uP;uniform vec2 uN;uniform float uUseClip;uniform float uA;uniform vec2 uRes;',
  'varying vec2 vUv;',
  'void main(){',
  '  if(uUseClip>0.5){',
  '    vec2 p=gl_FragCoord.xy;p.y=uRes.y-p.y;',
  '    if(dot(p-uP,uN)<0.0)discard;',
  '  }',
  '  vec4 c=texture2D(tMap,vUv);',
  '  gl_FragColor=vec4(c.rgb*uA,c.a*uA);',   /* [FIX] RT sudah premultiplied: jangan dikali alpha dua kali */
  '}'
].join('\n');
function whGlTeleEnsureClip(){
  var G=WHG,T,pw,ph,geo,mat;
  if(!G.compOk||!G.fullR)return false;
  if(G.teleRT&&G.clipMat)return true;
  try{
    T=THREE;pw=G.fullW||Math.max(64,Math.round(W*dpr));ph=G.fullH||Math.max(64,Math.round(H*dpr));
    G.teleRT=new T.WebGLRenderTarget(pw,ph,{depthBuffer:true,stencilBuffer:false,samples:WHG_AA?4:0,minFilter:T.LinearFilter,magFilter:T.LinearFilter});
    {var _pr=G.fullR.getRenderTarget();G.fullR.setRenderTarget(G.teleRT);G.fullR.setRenderTarget(_pr);}   /* alokasi storage dulu, baru flag (pola glskySaAlloc): ACES + sRGB per fragmen = sama dgn jalur langsung */
    G.teleRT.isXRRenderTarget=true;G.teleRT.texture.colorSpace=T.SRGBColorSpace;   /* [G5] MSAA badan teleskop saat keluar portal (jalur clip) */
    geo=new T.PlaneGeometry(2,2);
    mat=new T.ShaderMaterial({
      uniforms:{tMap:{value:G.dummy},uP:{value:new T.Vector2(0,0)},uN:{value:new T.Vector2(1,0)},uUseClip:{value:0},uA:{value:1},uRes:{value:new T.Vector2(W,H)}},
      vertexShader:WHG_CLIP_VS,fragmentShader:WHG_CLIP_FS2,
      transparent:true,depthTest:false,depthWrite:false,
      blending:T.CustomBlending,blendEquation:T.AddEquation,blendSrc:T.OneFactor,blendDst:T.OneMinusSrcAlphaFactor
    });
    G.clipMat=mat;G.clipMesh=new T.Mesh(geo,mat);G.clipMesh.frustumCulled=false;
    G.clipScene=new T.Scene();G.clipScene.add(G.clipMesh);
    G.clipCam=new T.OrthographicCamera(-1,1,1,-1,-1,1);
    return true;
  }catch(e){return false;}
}
function whGlTeleDraw(opacity,clip){
  var G=WHG,rdr,pr,ac,pw,ph,useClip;
  if(!whGlTeleWant()||!G.teleGrp)return false;
  try{
    rdr=G.fullR;
    if(G.teleCam.right!==W||G.teleCam.top!==H){
      G.teleCam.left=0;G.teleCam.right=W;G.teleCam.top=H;G.teleCam.bottom=0;G.teleCam.updateProjectionMatrix();
    }
    useClip=!!(clip&&clip.dx!=null&&clip.dy!=null);
    if(useClip){
      if(!whGlTeleEnsureClip())return false;
      pw=G.fullW;ph=G.fullH;
      if(G.teleRT.width!==pw||G.teleRT.height!==ph){G.teleRT.setSize(pw,ph);}
      pr=rdr.getRenderTarget();ac=rdr.autoClear;
      rdr.setRenderTarget(G.teleRT);rdr.setClearColor(0x000000,0);rdr.autoClear=true;
      rdr.render(G.teleScene,G.teleCam);
      /* present clipped */
      G.clipMat.uniforms.tMap.value=G.teleRT.texture;
      G.clipMat.uniforms.uUseClip.value=1;
      /* [G4.12f P0] clip point dalam FB px; normal arah (unit) tidak di-scale */
      G.clipMat.uniforms.uP.value.set(clip.x*(dpr||1),clip.y*(dpr||1));
      G.clipMat.uniforms.uN.value.set(clip.dx,clip.dy);
      G.clipMat.uniforms.uA.value=opacity<0?0:(opacity>1?1:opacity);
      G.clipMat.uniforms.uRes.value.set(G.fullW,G.fullH);
      rdr.setRenderTarget(null);rdr.autoClear=false;
      rdr.render(G.clipScene,G.clipCam);
      rdr.autoClear=ac;rdr.setRenderTarget(pr);
    }else{
      pr=rdr.getRenderTarget();ac=rdr.autoClear;
      rdr.setRenderTarget(null);rdr.autoClear=false;
      rdr.clearDepth();   /* [PATCH G4.12i] badan teleskop butuh depth test (dulu kanvas tanpa depth = badan terbalik/kedip) */
      rdr.render(G.teleScene,G.teleCam);
      rdr.autoClear=ac;rdr.setRenderTarget(pr);
    }
    return true;
  }catch(e){
    try{console.warn('[wormhole] tele GL:',e&&e.message);}catch(e2){}
    return false;
  }
}
/* [PATCH G4.12d] portal tunnel: bake portal3dDraw → texture → quad di #glwh */
function whGlPortalDraw(cx,cy,Rp,now,a,opts){
  var G=WHG,T,res,cv,gx,src,mat,mesh,S,ang=0,tm=null,tk,pw,ph,rdr,pr,ac,u,bs;
  if(!G.compOk||!G.fullR||!(Rp>2)||!(a>.01))return false;
  if(typeof portal3dDraw!=='function')return false;
  try{
    T=THREE;
    /* [PATCH G4.12i] bake pada resolusi perangkat: bs = piksel bake per px CSS (maks dpr/2, dan <=1024 px kanvas); tier 256/512/768/1024 supaya tekstur jarang dialokasi ulang */
    bs=Math.min(Math.min(2,dpr||1),1024/(Rp*2.4));
    var need=Rp*2.4*bs;res=need<=256?256:(need<=512?512:(need<=768?768:1024));
    cv=G.ptCv||(G.ptCv=document.createElement('canvas'));
    if(cv.width!==res||cv.height!==res){cv.width=res;cv.height=res;if(G.ptTex){try{G.ptTex.dispose();}catch(eD){}G.ptTex=null;}}
    gx=cv.getContext('2d');
    gx.setTransform(1,0,0,1,0,0);gx.clearRect(0,0,res,res);
    gx.setTransform(bs,0,0,bs,res/2,res/2);
    portal3dDraw(gx,0,0,Rp,now,1,opts||{});
    if(!G.ptTex){
      G.ptTex=new T.CanvasTexture(cv);
      G.ptTex.minFilter=T.LinearFilter;G.ptTex.magFilter=T.LinearFilter;
      G.ptTex.flipY=true;
    }else{G.ptTex.image=cv;G.ptTex.needsUpdate=true;}
    if(!G.ptMesh){
      /* [FIX portal pudar/abu-abu] MeshBasicMaterial di-encode sRGB lagi oleh renderer (outputColorSpace default) -> piksel gelap/semi-transparan hasil bake jadi abu-abu terang (selubung di mulut, kilau charge jadi cakram datar). Shader polos = nilai bake dipakai apa adanya, sama dgn drawImage 2D. */
      mat=new T.ShaderMaterial({uniforms:{map:{value:G.ptTex},uOp:{value:1}},
        vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
        fragmentShader:'precision highp float;uniform sampler2D map;uniform float uOp;varying vec2 vUv;void main(){vec4 c=texture2D(map,vUv);gl_FragColor=vec4(c.rgb,c.a*uOp);}',
        transparent:true,depthTest:false,depthWrite:false,blending:T.CustomBlending,blendEquation:T.AddEquation,blendSrc:WHG_GL_SRC_ALPHA,blendDst:WHG_GL_ONE_MINUS_SRC_ALPHA,blendSrcAlpha:WHG_GL_ONE,blendDstAlpha:WHG_GL_ONE_MINUS_SRC_ALPHA});
      G.ptMat=mat;
      G.ptMesh=new T.Mesh(new T.PlaneGeometry(1,1),mat);
      G.ptMesh.frustumCulled=false;
      if(!G.ptScene){G.ptScene=new T.Scene();G.ptCam=new T.OrthographicCamera(0,1,1,0,-10,10);G.ptCam.position.z=5;}
      G.ptScene.add(G.ptMesh);
    }
    G.ptMat.uniforms.map.value=G.ptTex;G.ptMat.uniforms.uOp.value=a>1?1:a;
    /* ukuran di layar: portal3dDraw radius Rp = outer; kanvas res mencakup ~2.4*Rp diameter → scale = res/2.4 in CSS px? 
       Kita menggambar di pusat 0,0 dengan Rp dalam px layar di context yang ditranslate res/2 — jadi diameter visual di texture ≈ 2*Rp*scale di mana scale=1 di unit px.
       Transform gx: unit = 1 px layar; texture width res px mewakili res layar-px → quad size = res (CSS px) */
    S=res/bs; /* [G4.12i] ukuran quad dalam px CSS = piksel tekstur / skala bake */
    G.ptMesh.position.set(cx,H-cy,0);
    G.ptMesh.scale.set(S,S,1);
    tk=(opts&&opts.tilt)||0;
    if(tk>0.001&&typeof ptTiltAng==='function'&&typeof ptTiltMat==='function'){
      /* approx: apply rotation only from tilt angle around Z is incomplete for affine; bake already includes tilt in 2D */
    }
    G.ptCam.left=0;G.ptCam.right=W;G.ptCam.top=H;G.ptCam.bottom=0;G.ptCam.updateProjectionMatrix();
    rdr=G.fullR;pr=rdr.getRenderTarget();ac=rdr.autoClear;
    rdr.setRenderTarget(null);rdr.autoClear=false;
    rdr.render(G.ptScene,G.ptCam);
    rdr.autoClear=ac;rdr.setRenderTarget(pr);
    G.ptOk=true;
    return true;
  }catch(e){
    G.ptOk=false;
    try{console.warn('[wormhole] portal GL:',e&&e.message);}catch(e2){}
    return false;
  }
}
/* [PATCH G4.12e] rim glow mulut + flash layar di #glwh (di BAWAH tele, di ATAS portal) — stacking = 2D */
var WHG_RIM_FS=[
  'precision highp float;',
  'uniform vec2 uC;uniform float uR;uniform float uA;uniform vec2 uRes;',
  'void main(){',
  '  vec2 p=gl_FragCoord.xy;p.y=uRes.y-p.y;',
  '  float d=distance(p,uC)/max(uR,1.0);',
  '  float ring=smoothstep(0.70,0.95,d)*(1.0-smoothstep(1.05,1.30,d));',
  '  float a=uA*ring;',
  '  gl_FragColor=vec4(0.47,0.65,1.0,1.0)*a;',
  '}'
].join('\n');
var WHG_FLASH_FS=[
  'precision highp float;',
  'uniform float uA;',
  'void main(){gl_FragColor=vec4(0.894,0.976,1.0,1.0)*uA;}',
].join('\n');
function whGlOverlayEnsure(){
  var G=WHG,T,geo,mat;
  if(!G.compOk||!G.fullR)return false;
  if(G.rimMesh&&G.flashMesh)return true;
  try{
    T=THREE;geo=new T.PlaneGeometry(2,2);
    if(!G.ovScene){G.ovScene=new T.Scene();G.ovCam=new T.OrthographicCamera(-1,1,1,-1,-1,1);}
    mat=new T.ShaderMaterial({
      uniforms:{uC:{value:new T.Vector2(0,0)},uR:{value:1},uA:{value:0},uRes:{value:new T.Vector2(W,H)}},
      vertexShader:WHG_COMP_VS,fragmentShader:WHG_RIM_FS,
      transparent:true,depthTest:false,depthWrite:false,
      blending:T.CustomBlending,blendEquation:T.AddEquation,blendSrc:T.OneFactor,blendDst:T.OneFactor
    });
    G.rimMat=mat;G.rimMesh=new T.Mesh(geo,mat);G.rimMesh.frustumCulled=false;G.ovScene.add(G.rimMesh);
    mat=new T.ShaderMaterial({
      uniforms:{uA:{value:0}},
      vertexShader:WHG_COMP_VS,fragmentShader:WHG_FLASH_FS,
      transparent:true,depthTest:false,depthWrite:false,
      blending:T.CustomBlending,blendEquation:T.AddEquation,blendSrc:T.OneFactor,blendDst:T.OneMinusSrcAlphaFactor
    });
    G.flashMat=mat;G.flashMesh=new T.Mesh(geo.clone(),mat);G.flashMesh.frustumCulled=false;G.ovScene.add(G.flashMesh);
    return true;
  }catch(e){return false;}
}
function whGlRim(cx,cy,r,al){
  var G=WHG,rdr,pr,ac;
  if(!(al>.01)||!(r>1)||!whGlOverlayEnsure())return false;
  try{
    G.rimMesh.visible=true;G.flashMesh.visible=false;
    G.rimMat.uniforms.uC.value.set(cx*(dpr||1),cy*(dpr||1));
    G.rimMat.uniforms.uR.value=r*(dpr||1);
    G.rimMat.uniforms.uA.value=al>1?1:al;
    G.rimMat.uniforms.uRes.value.set(G.fullW||Math.round(W*(dpr||1)),G.fullH||Math.round(H*(dpr||1)));
    rdr=G.fullR;pr=rdr.getRenderTarget();ac=rdr.autoClear;
    rdr.setRenderTarget(null);rdr.autoClear=false;
    rdr.render(G.ovScene,G.ovCam);
    rdr.autoClear=ac;rdr.setRenderTarget(pr);
    return true;
  }catch(e){return false;}
}
function whGlFlash(al){
  var G=WHG,rdr,pr,ac;
  if(!(al>.01)||!whGlOverlayEnsure())return false;
  try{
    G.rimMesh.visible=false;G.flashMesh.visible=true;
    G.flashMat.uniforms.uA.value=Math.min(1,al);
    rdr=G.fullR;pr=rdr.getRenderTarget();ac=rdr.autoClear;
    rdr.setRenderTarget(null);rdr.autoClear=false;
    rdr.render(G.ovScene,G.ovCam);
    rdr.autoClear=ac;rdr.setRenderTarget(pr);
    return true;
  }catch(e){return false;}
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
   idle -> enter (teleskop terbang masuk cincin) -> travel (zoom-in ke portal, terowongan, lubang hitam meluncur) -> exit -> idle   (go(): sektor->overview, lompat antar sektor, overview->sektor)
   close = penutup darurat (pengaman macet). */
function show(){if(cv&&cv.style.display!=='block'){resize();cv.style.display='block';}}
/* KAMERA zoom-in ke portal: canvas #sky di-scale (CSS) di sekitar titik cincin sambil digeser ke tengah layar, jadi langit + cincin ikut mendekat (bukan cincin yang membesar di atas langit diam).
   Koordinat lokal #sky = ruang virtual stage, jadi benar di portrait / landscape / ROT. Terowongan di kanvas ini mengikuti titik + skala yang sama. */
/* SKY_ZOOM: true (default) = kamera zoom CSS pada #sky. ?whzoom=0 di URL = tanpa zoom (mulut portal membesar di atas sky diam, jalur lama ck=null) untuk A/B di device. Di headless tanpa-zoom tidak lebih ringan: biaya utama adalah isi sky yang dirender, bukan scale-nya. */
var SKY_ZOOM=(function(){try{return !/[?&]whzoom=0/.test(location.search);}catch(e){return true;}})();
function skyCam(uu,ee){
  var sk=document.getElementById('sky'),Wv,Hv,m,tx,ty,k;
  if(!sk||S.vx==null)return null;
  Wv=sk.clientWidth||winW();Hv=sk.clientHeight||winH();m=sm(uu);k=Math.exp(S.lnK*ee);
  tx=(Wv*.5-S.vx)*m;ty=(Hv*.5-S.vy)*m;
  /* clamp: tepi canvas #sky tidak boleh masuk ke dalam layar (portal dekat tepi -> translate ke tengah lebih cepat dari scale -> celah, milky-way "kepotong").
     Dengan origin = portal, tepi kiri/atas ada di S.vx-S.vx*k+tx; syarat tetap menutup layar: tx<=vx*(k-1), tx>=-(Wv-vx)*(k-1). Return di bawah memakai tx/ty hasil clamp, jadi terowongan tetap sejajar. */
  if(k>1){tx=Math.max(-(Wv-S.vx)*(k-1),Math.min(S.vx*(k-1),tx));ty=Math.max(-(Hv-S.vy)*(k-1),Math.min(S.vy*(k-1),ty));}
  sk.style.willChange='transform,opacity';if(WH_DBG.indexOf('nosky')>=0)sk.style.visibility='hidden';sk.style.transformOrigin=S.vx+'px '+S.vy+'px';
  sk.style.transform='translate('+tx.toFixed(2)+'px,'+ty.toFixed(2)+'px) scale('+k.toFixed(4)+')';
  sk.style.opacity=(1-.92*sm((ee-.5)/.5)).toFixed(3);   /* langit meredup menjelang tertutup terowongan (membesar jadi buram) */
  S.skyOn=1;
  return toScr(S.vx+tx,S.vy+ty);
}
/* serah-terima cincin #sky -> kanvas ini, 0..1. Overview: cincin sky langsung disembunyikan (portal3dOverview) -> 1 seketika. Sektor: yang tampak di #sky adalah BH mini (ikut
   di-scale skyCam, glow/disk-nya jauh lebih besar dari cincin) -> dulu terlihat PORTAL GANDA (BH membesar + cincin). Sekarang cincin fade-in & BH fade-out (WH_HANDOFF ms), lalu 03 menyembunyikan BH. */
var WH_HANDOFF=260;
/* diagnosa cincin ganda (URL ?whdbg=noring,nosky): noring = cincin di kanvas wormhole TIDAK digambar; nosky = #sky disembunyikan selama zoom-in. Bandingkan mana yang membuat cincin kedua hilang. */
var WH_DBG=(function(){try{var m=/[?&]whdbg=([a-z,]+)/.exec(location.search);return m?m[1]:'';}catch(e){return '';}})();
/* A/B diagnosa performa (hanya via URL, tanpa URL = perilaku normal). ?whdpr=1.25 = batas dpr kanvas wormhole (default 2). Flag whdbg tambahan:
   notele = teleskop tidak digambar; nostep = buffer terowongan tidak di-update (komposit tetap jalan); nobloom = lewati drawImage bloom kedua; telenoclip = lewati clip setengah-bidang teleskop (v48). */
/* v15: ?whring=N = cincin GL dirender tiap N frame (default 4; 0/1 = tiap frame). Hasil di-cache ke kanvas 2D dan digambar ulang dgn skala terkini tiap frame. (whdbg cuma menerima huruf, jadi pakai param sendiri) */
var WH_RING=(function(){try{var m=/[?&]whring=([0-9]+)/.exec(location.search),v=m?parseInt(m[1],10):4;return v>1?v:0;}catch(e){return 4;}})();
/* v18->v19 (sekarang default AKTIF, hasil ukur HP: step 4.6->3.0ms, comp 4.1->2.7ms, js zoom 31->26, tak kentara di mata): ?whstep=2 = selama ZOOM (sebelum layar tertutup) buffer terowongan di-update tiap 2 frame dgn dt/adv terakumulasi (hemat ~2-3ms JS/frame);
   ?whbloom=0 = lewati pass bloom aditif selama mulut portal masih lebih kecil dari layar (zoom). Keduanya mengubah tampilan terowongan sedikit. */
var WH_STEP=(function(){try{var m=/[?&]whstep=([0-9]+)/.exec(location.search),v=m?parseInt(m[1],10):2;return v>1?v:0;}catch(e){return 2;}})();   /* v19: DEFAULT ON (2). ?whstep=0 = mati */
var WH_NOBLOOM=(function(){try{return !/[?&]whbloom=1/.test(location.search);}catch(e){return true;}})();   /* v19: DEFAULT ON (bloom dilewati saat zoom). ?whbloom=1 = bloom normal */
/* [v46] ?whxdpr (dpr kanvas wormhole selama exit) DIBUANG: A/B ABABAB 7 Nov (itel) tidak berefek ke dt punuk sektor (133 vs 132 ms, selisih < noise) dan teleskop BURAM saat exit. JANGAN DIULANG; punuk bukan dari ukuran kanvas wormhole. */
/* [v45] Statistik biaya per fase (zoom / tunnel / exit / close): frame, js drawFrame (ms), dt (ms), ukuran kanvas & dpr terakhir. Murah (satu objek, tanpa alokasi per frame). Dibaca bench: WORMHOLE.dbgStats(). */
var WHS={};
var WH_DPR=(function(){try{var m=/[?&]whdpr=([0-9.]+)/.exec(location.search),v=m?parseFloat(m[1]):0;return v>=.5&&v<=3?v:0;}catch(e){return 0;}})();
function ringFade(){
  if(state!=='travel'||!S||!S.ring)return 0;
  if(typeof SECT==='undefined'||!SECT.cur||WH_HANDOFF<=0)return 1;
  return sm(clamp((performance.now()-S.tt)/WH_HANDOFF));
}
/* Pre-warm renderer cincin 3D ke resMax. Hanya bila renderer siap (state 2; potato/reduce/gagal-load dilewati) dan PT3D.res baru diset SETELAH setSize sukses
   (kalau setSize melempar, pt3dRender masih tahu ukuran sebenarnya dan menyesuaikan sendiri). */
function whPrewarm(){
  try{
    if(typeof pt3dWarmMax==='function'){pt3dWarmMax();return;}   /* 15-portal3d.js: setSize(resMax) + 1 render, idempotent */
    if(typeof PT3D!=='undefined'&&PT3D.r&&PT3D.state===2&&typeof PT3D_CFG!=='undefined'){
      var rmax=PT3D_CFG.resMax;PT3D.big=1;
      if(PT3D.res!==rmax){PT3D.r.setPixelRatio(1);PT3D.r.setSize(rmax,rmax,false);PT3D.res=rmax;}
    }
  }catch(ePw){}
}
function skyReset(){
  try{
    var sk=document.getElementById('sky');
    if(sk&&S&&S.skyOn){sk.style.transform='';sk.style.transformOrigin='';sk.style.opacity='';sk.style.willChange='';sk.style.visibility='';}
    if(S)S.skyOn=0;
  }catch(e){}
}
function warpFx(k){try{if(typeof UIS!=='undefined'&&UIS.warpFx)UIS.warpFx(k);}catch(e){}}   /* SFX terowongan (10-ui-sound.js), selalu aman kalau modul suara tidak ada */
function hide(){
  warpFx('stop');skyReset();
  try{if(typeof TELESCOPE!=='undefined')TELESCOPE.dive=0;}catch(eD){}
  try{if(S){S.freshLeft=0;S.freshR=0;}}catch(eF){}
  if(cv){cv.style.display='none';cv.style.opacity='1';cv.style.zIndex='13';}
  try{if(typeof tele3dGlLeave==='function')tele3dGlLeave(2);}catch(eTv){}   /* [G4.6] overlay teleskop GL dilepas (Group balik ke scene; pass atas GLSky sudah mengambil alih di handoff) */
  try{whGlClear();}catch(eWgh){}   /* [PATCH G4.12] kosongkan RT, konteks GL tetap hidup untuk dive berikutnya */
  try{whGlCompHide();if(WHG.fullCv){WHG.fullCv.style.clipPath='none';WHG.fullCv.style.opacity='1';}}catch(eWgc2){}   /* [PATCH G4.12b] */
}
function runCover(){skyReset();if(S&&S.onCover){var f=S.onCover;S.onCover=null;try{f();}catch(eC){}}}
/* ---- recorder FPS on-device (?whperf=1): implementasi PINDAH ke 19-auto-debug.js (installWP). Di sini cuma hook tipis.
   WP = null -> semua call site `if(WP)...` no-op (nol biaya, tanpa ?debug=1 tidak ada recorder). 19 memasang objek recorder lewat
   WORMHOLE.dbgAttach(obj); obj punya m(n,ph) / rec(...) / end() / sk (ms frame() sky per rAF, dibaca tick L~703) + field r,t,s,ph,l (juga disentuh L318). ---- */
var WP=null;
function wpM(n){WP.m(n,state==='travel'?(S.cov?'tunnel':'zoom'):state);}
function wpRec(now,ph,q,js,sky,lead){WP.rec(now,ph,q,js,sky,lead);}
function wpEnd(){if(WP)WP.end();}
function hardStop(){if(raf){cancelAnimationFrame(raf);raf=0;}runCover();state='idle';env=0;hide();}
function kick(){if(!raf){last=performance.now();raf=requestAnimationFrame(tick);}}
function startExit(now){
  if(state!=='travel')return;
  S.r0=S.r;S.rate0=S.rate;S.e0=env;S.tx=now;S.u=0;state='exit';kick();warpFx('flash');
}
function startClose(now,ms){
  if(state==='close'||state==='idle')return;
  if(!cv||cv.style.display!=='block'){state='idle';env=0;S={};return;}   /* tanpa kanvas: langsung selesai */
  S.c0=[S.cx,S.cy];S.r0=S.r;S.a0=S.a;S.e0=env;S.rate0=S.rate;S.tc=now;S.cms=ms;state='close';kick();
}
/* progres muatan 0..1 untuk cincin portal overview (plat menyala satu per satu selama 'enter'; penuh selama 'travel') */
function chargeP(now){
  if(state==='enter')return S.ch||0;
  if(state==='travel')return 1;
  return 0;
}
/* go(dest,pos,R,onCover): SATU transisi untuk "sektor -> overview" (dest=null) dan "lompat antar sektor" (dest=objek sektor tujuan).
   pos = [x,y] pusat cincin portal (ruang virtual stage), R = radius LUAR cincin saat ini (virtual). Urutan:
     enter  : (tap-gate: 12 plat charge dulu) teleskop terbang masuk ke tengah cincin
     travel : zoom-in ke portal: cincin + dinding terowongan membesar dari dalam cincin sampai menutup layar -> onCover() (sektor asal zoom-out / lanjut gate)
              -> teleskop muncul lagi dan melayang mengikuti lubang hitam terowongan -> lubang hitam meluncur ke portal tujuan
     exit   : layar flash, terowongan memudar, teleskop keluar dari tengah portal tujuan
   Return true = dijalankan (onCover akan dipanggil); false = tidak didukung (pemanggil jalankan onCover sendiri). */
function go(dest,pos,R,onCover){
  if(!usable()||!init())return false;
  if(state==='travel'||state==='enter'||state==='exit')return false;
  if(WP){WP.r=[];WP.t=0;WP.s={};WP.ph='';}   /* v13: 'enter' tak pernah direkam (tick return dulu) -> statistik menumpuk lintas dive & frame zoom pertama = jeda antar-dive (7108ms palsu) */
  whPrewarm();   /* v7: sinkron di awal go — hitch = latensi klik, bukan patah di tengah enter (bukan setTimeout 60) */
  var sp=pos&&pos[0]!=null&&pos[1]!=null?toScr(pos[0],pos[1]):null,
      x=sp?sp[0]:(S&&S.x!=null?S.x:winW()*.5),y=sp?sp[1]:(S&&S.y!=null?S.y:winH()*.5),
      k=(typeof STG!=='undefined'&&STG.on&&!STG.rot&&STG.k)?STG.k:1,
      Rs=R>2?R*k:Math.min(winW(),winH())*.05,
      tb=teleBase(),carry=false;
  try{carry=!!tb&&!(typeof LIS!=='undefined'&&LIS.pend&&!LIS.pend.carry);}catch(eL){}
  S={vx:sp?pos[0]:null,vy:sp?pos[1]:null,x:x,y:y,cx:x,cy:y,r:Rs*(typeof PT_IN==='number'?PT_IN:.745),rp:Rs,a:1,rate:.7,rim:0,dest:dest||null,fromOv:!!(dest&&typeof SECT!=='undefined'&&!SECT.cur),go:1,cov:0,tgi:0,onCover:onCover||null,t0:performance.now(),carry:carry,ch:0,fl:0,hv:null,tv:0,freshR:0,freshLeft:0};
  S.A=carry?T_ENTER_TELE+450:900;   /* carry: terbang T_ENTER_TELE + 450ms muatan (dulu 1100 tetap -> tf0 negatif kalau T_ENTER_TELE > 1100) */
  S.tf0=carry?S.A-T_ENTER_TELE:0;
  S.chT=carry?Math.max(1,S.A-T_ENTER_TELE):S.A*.9;
  dens=1;env=0;state='enter';
  if(carry){try{TELESCOPE.dive=1;}catch(eT){}}   /* teleskop digambar di kanvas ini selama transisi (canvas #sky melewatinya) */
  show();if(cv)cv.style.zIndex='13';
  try{if(carry&&whGlWant()&&(WHG.ok||whGlEnsure(bw,bh)))whGlCompEnsure();}catch(eGp){}   /* [FIX] siapkan #glwh sekarang, bukan di tengah animasi */
  kick();   /* kanvas di ATAS sky (penutup layar) */
  try{if(typeof UIS!=='undefined'&&UIS.warpBegin)UIS.warpBegin(S.A,S.chT);}catch(eU){}
  return true;
}
function engageDive(now){
  /* Bekukan pose teleskop (posisi/skala/sudut) SEBELUM skyCam mulai menskala #sky. teleBase() membaca getBoundingClientRect #sky, jadi saat zoom-in dia ikut membesar eksponensial
     (k kamera) dan begitu runCover() -> skyReset() melepas transform, skalanya LONCAT turun ke ukuran asli = teleskop "kepotong" jadi kecil. Selama travel semua dibaca dari S.tb. */
  S.tb=null;if(S.carry){try{S.tb=teleBase();}catch(eB){S.tb=null;}}
  /* overview -> sektor: cincin di #sky sedang MEMBENGKAK (charge penuh = x(1+PT_SWELL), lihat portal3dOverview) saat diserahkan ke kanvas ini. Dulu kanvas ini mulai dari ukuran dasar
     -> cincin 'mengecil' mendadak (loncat ~30%) di awal zoom-in. Mulai dari ukuran bengkak yang sama (rp/r ikut, jadi mulut + zoom eksponensial konsisten). */
  if(typeof PT_SWELL==='number'&&!(typeof SECT!=='undefined'&&SECT.cur)){var swf=1+PT_SWELL;S.rp*=swf;S.r*=swf;}
  state='travel';S.tt=now;S.r1=S.r;S.cx1=S.cx;S.cy1=S.cy;S.a1=1;S.rate1=S.rate;S.rate=.9;S.rim=0;S.edge=.94;S.ring=0;S.cov=0;S.cvQ=0;S.tgi=0;S.justDive=1;   /* ring=0 dulu: kepemilikan cincin pindah ke kanvas ini di frame travel PENUH pertama (frame justDive tidak menggambar cincin -> kalau sky sudah menyembunyikannya = cincin hilang 1 frame) */
  S.lnK=Math.log(Math.max(2,1.05*(Math.hypot(winW(),winH())*.5)/Math.max(4,S.rp*(typeof PT_IN==='number'?PT_IN:.745))));   /* skala akhir: tepi mulut pas melewati sudut layar */
  /* v7 D: isi buffer terowongan dipecah ~3 frame (bukan 16× stepBuf di frame travel penuh pertama) */
  S.freshR=Math.hypot(winW(),winH())*.56;
  S.freshLeft=potato()?8:(S.freshR>Math.min(winW(),winH())*.4?WARM:9);
  /* pre-warm: safety net (idempotent kalau go()/menu sudah warm); + pra-set willChange/origin #sky */
  whPrewarm();
  try{
    var sk=document.getElementById('sky');
    if(sk&&S.vx!=null){sk.style.willChange='transform,opacity';sk.style.transformOrigin=S.vx+'px '+S.vy+'px';S.skyOn=1;}   /* skyOn=1: kalau transisi dibatalkan sebelum frame travel pertama, skyReset tetap membersihkan style ini */
  }catch(eSk){}
}
function engage(now){engageDive(now);}
/* Titik tujuan lubang hitam terowongan (layar): BH overview (dest=null) atau tengah layar (tujuan sektor). Diperhalus supaya
   perpindahan prediksi -> posisi asli (begitu sektor tujuan selesai di-zoom) tidak melompat. */
function seekTarget(dt){
  var t=null,b;
  try{
    if(!S.dest)t=bhScr();   /* F11: tujuan sektor tidak punya titik (portal sektor pensiun) -> t null -> jatuh ke tengah layar */
  }catch(e){}
  if(!t)t=[winW()*.5,winH()*.5];
  if(!S.tgi){S.tgx=t[0];S.tgy=t[1];S.tgi=1;}
  else{var k=1-Math.exp(-dt*8);S.tgx+=(t[0]-S.tgx)*k;S.tgy+=(t[1]-S.tgy)*k;}
  return [S.tgx,S.tgy];
}
/* posisi BH overview (layar) -> tujuan akhir terowongan swallow sektor, supaya isi overview 'dimuntahkan' dari lubang yang sama */
function bhScr(){
  try{if(typeof camBH==='function'){var b=(typeof ptOvDest==='function')?ptOvDest():camBH(),c=toScr(b[0],b[1]);   /* P4: tujuan terowongan = titik portal overview yang mengorbit (bukan home BH), jadi teleskop keluar dari dalam portal */if(c&&isFinite(c[0])&&isFinite(c[1]))return c;}}catch(e){}
  return [winW()*.5,winH()*.5];
}
function secBusy(){return typeof SECT!=='undefined'&&!!SECT.busy;}
function gatePending(){return typeof SGATE!=='undefined'&&!!SGATE.pend;}

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
  /* [PATCH G4.12] coba feedback GL dulu; gagal/mati → jalur 2D lama utuh */
  if(whGlWant()&&(WHG.ok||whGlEnsure(bw,bh))&&whGlStep(dt,cx,cy,Rv,Rh,adv))return;
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
/* posisi/skala/rotasi teleskop di layar (px) sesuai yang digambar canvas #sky; null = tidak ada / tidak terlihat */
function teleBase(){
  var T=typeof TELESCOPE!=='undefined'?TELESCOPE:null,sk,rc,k,x,y,rot=0,cl;
  if(!T||typeof teleDrawBody!=='function'||!(T.al>.02)||!T.sc||!(T.sx||T.sy))return null;
  sk=document.getElementById('sky');if(!sk)return null;
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
  return {x:x,y:y,sc:T.sc*k,rot:rot,ang:T.ang,al:clamp(T.al,0,1)};
}
/* ov (opsional): {x,y} posisi layar pengganti, s = pengali skala, a = pengali alpha, w = goyangan 0..1, sp = putaran tambahan (rad) */
/* h = posisi teleskop, (cx,cy) = lubang, m = sisi pendek layar, k 0..1 = seberapa teleskop "dipegang" terowongan, dir 1 = menuju lubang, -1 = menjauh (keluar) */
function teleTilt(dt,h,cx,cy,m,k,dir,vk){
  var C=TELE_TILT;if(!C.on||!(dt>0))return null;
  vk=vk==null?1:vk;
  var st=S.tt3||(S.tt3={x:0,y:0,z:0,px:h[0],py:h[1],s:state});
  if(st.s!==state){st.s=state;st.px=h[0];st.py=h[1];}
  var vx=clamp((h[0]-st.px)/dt/m,-1.5,1.5),vy=clamp((h[1]-st.py)/dt/m,-1.5,1.5),b=1-Math.exp(-dt*7),
      dx=clamp((cx-h[0])/m*3,-1,1)*dir,dy=clamp((cy-h[1])/m*3,-1,1)*dir,bf=C.buffet*k*S.rate,
      tx=C.sx*(C.lean*dy+.5*vy*C.bank*vk)+bf*Math.sin(tt*17+1.3),
      ty=C.sy*(C.lean*dx+.6*vx*C.bank*vk)+bf*Math.sin(tt*13),
      tz=C.sz*(-vx*C.bank*1.2*vk)+bf*Math.sin(tt*23+.6);
  st.px=h[0];st.py=h[1];
  st.x+=(clamp(tx,-.6,.6)-st.x)*b;st.y+=(clamp(ty,-.6,.6)-st.y)*b;st.z+=(clamp(tz,-.6,.6)-st.z)*b;
  return {x:st.x*k,y:st.y*k,z:st.z*k};
}
function chase3d(){return !!(TELE_CHASE.on&&typeof SCP3D!=='undefined'&&SCP3D.state===2&&typeof SCP3D_CFG!=='undefined'&&SCP3D_CFG.on&&!potato());}   /* true = badan 3D aktif -> POV belakang dipakai */
function wrapPi(a){a=a%6.283185307;if(a>3.141592654)a-=6.283185307;else if(a<-3.141592654)a+=6.283185307;return a;}
/* pose kamera (tanpa offset gerak): k 0..1 = seberapa jauh dari pose normal; face +1 = dari belakang, -1 = dari depan */
function chasePose(k,face,tl,roll){   /* roll (opsional) = roll layar pengganti: dipakai saat keluar supaya hidung searah arah terbang */
  var C=TELE_CHASE,o=tl||{x:0,y:0,z:0};
  return {x:o.x,y:o.y,z:o.z,k:clamp(k,0,1),ty:C.yaw*face,tr:roll!=null?roll:C.roll*face,tp:C.pitch,th:C.th,glow:C.glow};
}
function drawTele(ov){
  if(WH_DBG.indexOf('notele')>=0)return;
  var b=(ov&&ov.base)||teleBase(),wob,x,y,sc,al;   /* ov.base = pose teleskop yang DIBEKUKAN (S.tb); tanpa itu dibaca live dari #sky */
  if(!b)return;
  ov=ov||{};
  wob=ov.w!=null?ov.w:clamp((S.a-.4)/.6,0,1);
  x=(ov.x!=null?ov.x:b.x)+Math.sin(tt*5.3)*3*wob;y=(ov.y!=null?ov.y:b.y)+Math.cos(tt*4.1)*2.5*wob;
  sc=b.sc*(ov.s!=null?ov.s:1+.10*wob);al=b.al*(ov.a!=null?ov.a:1);
  if(sc<.01||al<.01)return;
  var tl=ov.tilt,t3=!!(tl&&typeof SCP3D!=='undefined'&&SCP3D.state===2&&typeof SCP3D_CFG!=='undefined'&&SCP3D_CFG.on&&!potato());
  var a0=b.ang+b.rot,kk=(t3&&tl&&tl.k!=null)?clamp(tl.k,0,1):0;
  if(kk>0)a0=wrapPi(a0)*(1-kk);   /* pose kamera: arah hidung diatur 3D, roll layar-nya diredam ke tegak supaya tidak berputar liar */
  if(ov.head!=null&&!t3){var hk=ov.hk!=null?clamp(ov.hk,0,1):1;a0=a0+wrapPi(ov.head-a0)*hk;}   /* badan 2D: hidung (+x) mengarah ke arah terbang */
  var rotT=a0+(ov.sp||0)+Math.sin(tt*2.7)*.14*wob*(1-.7*kk)+(tl&&!t3?tl.z:0),clipOn=!!(ov.clip&&WH_DBG.indexOf('telenoclip')<0);
  /* [G4.6] ?glsky=1: teleskop GL penuh di overlay #glscope (13-scope3d.js tele3dTopDraw), tanpa blit ke kanvas ini. false = jalur 2D di bawah. */
  if(t3&&typeof tele3dTopDraw==='function'){
    var tdr=false;try{tdr=tele3dTopDraw(performance.now(),x,y,sc,clamp(al,0,1),rotT,tl,clipOn?ov.clip:null);}catch(eTop){tdr=false;}
    if(tdr)return;
  }
  g.save();
  if(clipOn){   /* [v48] ?whdbg=telenoclip = lewati clip setengah-bidang (ALAT UKUR A/B: teleskop terlihat di kedua sisi bidang portal; tanpa flag = perilaku normal) */   /* muncul dari mulut portal: hanya bagian di depan bidang portal yang terlihat (hidung duluan); setengah-bidang tegak lurus arah keluar */
    var Cp=ov.clip,Rc=Math.hypot(W,H)*2,nx=-Cp.dy*Rc,ny=Cp.dx*Rc,fx=Cp.dx*Rc,fy=Cp.dy*Rc;
    g.beginPath();g.moveTo(Cp.x+nx,Cp.y+ny);g.lineTo(Cp.x-nx,Cp.y-ny);g.lineTo(Cp.x-nx+fx,Cp.y-ny+fy);g.lineTo(Cp.x+nx+fx,Cp.y+ny+fy);g.closePath();g.clip();
  }
  g.translate(x,y);g.rotate(rotT);g.scale(sc,sc);
  g.globalAlpha=clamp(al,0,1);
  if(t3){SCP3D.tilt=tl;SCP3D.altOK=ov.alt?1:0;SCP3D.last=-1e9;}   /* paksa render 3D ulang dengan kemiringan ini (cache 3ms di tele3dBody) */
  try{teleDrawBody(g,performance.now());}catch(e){}
  if(t3){SCP3D.tilt=null;SCP3D.altOK=0;SCP3D.last=-1e9;}   /* gambar teleskop biasa berikutnya render ulang tanpa kemiringan */
  g.restore();
}
/* lubang hitam tengah terowongan: cakram hitam pekat dengan tepi lembut; al<1 = setengah transparan */
function holeDisc(cx,cy,Rh,al){
  if(al<.004)return;
  var gr=g.createRadialGradient(cx,cy,Rh*.8,cx,cy,Rh*1.3);
  gr.addColorStop(0,'rgba(0,0,0,'+al.toFixed(3)+')');gr.addColorStop(1,'rgba(0,0,0,0)');
  g.fillStyle=gr;g.beginPath();g.arc(cx,cy,Rh*1.3,0,6.283185307);g.fill();
}
function drawFrame(dt,cx,cy,r,cvr){
  if(WP)wpM('pre');
  var Rv=Math.min(r,Math.hypot(W,H)*.56),                 /* radius tampilan perspektif (kepala bintang menyentuh Rv = tepi) */
      Rh=Math.min(r*.15,Math.min(W,H)*.06),              /* radius lubang hitam tengah */
      small=r<cvr*.98,n=ST.length,low=potato(),adv=dt*S.rate,
      i,c,L,rh,a,w,ca,sa,lf,tr,hx,hy,tx,ty,al,gr,Rw,Rhw,sd;
  tt+=dt;
  /* v7 D: isi awal terowongan — maks 6 iter/frame (potato 3), total tetap ~WARM; hindari spike di frame travel #1 */
  if(S&&S.freshLeft>0){
    var nDo=Math.min(S.freshLeft,low?1:2);   /* v10: 2 iter/frame (dulu 6) -> ~8 frame, bukan 3 frame x ~50ms */
    Rw=Math.max(Rv,S.freshR||0);Rhw=Math.min(Rw*.15,Math.min(W,H)*.06);sd=.03*S.rate;
    for(i=0;i<nDo;i++){roll+=sd*SPIN;tt+=.03;moveStars(.03,sd);stepBuf(.03,cx,cy,Rw,Rhw,sd);}
    S.freshLeft-=nDo;
    if(S.freshLeft<=0){S.freshLeft=0;S.freshR=0;}
  }
  roll+=adv*SPIN;
  if(WP)wpM('fresh');
  var stDt=dt,stAdv=adv,doStep=WH_DBG.indexOf('nostep')<0;
  if(WH_STEP>1&&state==='travel'&&!S.cov&&!(S.freshLeft>0)){   /* v18: zoom = update buffer tiap WH_STEP frame, dt/adv diakumulasi */
    S.sdt=(S.sdt||0)+dt;S.sa=(S.sa||0)+adv;
    if(((S.sn=(S.sn||0)+1)%WH_STEP)!==0)doStep=false;else{stDt=S.sdt;stAdv=S.sa;S.sdt=0;S.sa=0;}
  }else if(S.sdt){stDt=dt+S.sdt;stAdv=adv+S.sa;S.sdt=0;S.sa=0;}   /* keluar dari zoom: sisa akumulasi dilepas */
  if(doStep){moveStars(stDt,stAdv);stepBuf(stDt,cx,cy,Rv,Rh,stAdv);}
  if(WP)wpM('step');

  g.setTransform(dpr,0,0,dpr,0,0);
  g.globalCompositeOperation='source-over';g.globalAlpha=1;
  g.clearRect(0,0,W,H);
  g.save();
  /* mulut mengikuti kemiringan cincin (elips, bukan lingkaran): kalau cincin miring (zoom-in dari overview) terowongan tidak meluber keluar cincin */
  var tkW=(S.ring&&small&&typeof ptWhTilt==='function'&&typeof ptTiltMat==='function')?ptWhTilt(r/cvr):0,tmW=null;
  if(tkW>.001){try{tmW=ptTiltMat(ptTiltAng(performance.now(),tkW));}catch(eTm){tmW=null;}}
  /* kanvas ini = koordinat LAYAR asli (tidak ikut #stage yang diputar), jadi TIDAK boleh rotate(upAng()) — itu bikin cincin/mulut miring balik ke sumbu portrait saat landscape */
  var mouthXf=function(){g.translate(cx,cy);if(tmW)g.transform(tmW[0],tmW[1],tmW[2],tmW[3],0,0);};
  if(small){g.save();mouthXf();g.beginPath();g.arc(0,0,Math.max(1,r*1.06),0,6.283185307);g.restore();g.clip();}   /* batas kerja saja; tepi tampak asli dibentuk mask alpha di bawah, bukan potongan ini */
  /* [PATCH G4.12b] composite GL penuh (feedback+streak+hole) → #glwh; #wh-canvas transparan utk portal */
  var glComp=false;
  try{if(WHG.ok)glComp=whGlComposite(cx,cy,r,cvr,Rv,Rh,small,low,tmW);}catch(eGc){glComp=false;}
  if(glComp){
    g.setTransform(dpr,0,0,dpr,0,0);
    g.globalCompositeOperation='source-over';g.globalAlpha=1;
    g.clearRect(0,0,W,H);   /* 2D hanya portal di atas #glwh */
    if(WP)wpM('comp');
    if(WP)wpM('streak');
  }else{
  try{whGlCompHide();}catch(eGh){}
  g.fillStyle=BG;g.fillRect(0,0,W,H);
  g.imageSmoothingEnabled=true;
  /* [PATCH G4.12] sumber feedback: kanvas WebGL (WHG.cv) kalau GL hidup, else bA 2D */
  var fbSrc=whGlSrc();
  g.drawImage(fbSrc,0,0,bw,bh,0,0,W,H);
  if(!low&&WH_DBG.indexOf('nobloom')<0&&!(WH_NOBLOOM&&small)){g.globalCompositeOperation='lighter';g.globalAlpha=.45;g.drawImage(fbSrc,0,0,bw,bh,0,0,W,H);}   /* bloom murah: gambar buffer sekali lagi aditif */

  if(WP)wpM('comp');
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
    if(small&&tr>r*1.15)continue;   /* v10: streak seluruhnya di luar mulut portal (clip/mask) = tak terlihat: lewati stroke */
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
  if(WP)wpM('streak');
  /* pusat: lubang hitam dengan tepi lembut. Saat exit digambar SETELAH dinding dihapus (lihat bawah), dengan alpha yang memudar */
  if(state!=='exit')holeDisc(cx,cy,Rh,1);
  } /* end !glComp */
  /* [PATCH G4.12c] vignette/mask: GL sudah di shader; 2D hanya jika !glComp */
  if(glComp){
    /* mask + exit sudah di whGlComposite */
  }else if(small){
    /* tepi mulut portal: alpha diluruhkan halus ke 0 (destination-in) -> terowongan menyatu dengan sky di bawahnya, tanpa potongan keras / vignette gelap */
    g.globalCompositeOperation='destination-in';
    gr=tmW?g.createRadialGradient(0,0,0,0,0,Math.max(1,r)):g.createRadialGradient(cx,cy,0,cx,cy,Math.max(1,r));
    var es=S.edge||EDGE_SOLID;   /* saat zoom-in dari cincin: tepi hampir keras, dirapikan oleh cincin yang digambar di atasnya */
    gr.addColorStop(0,'rgba(0,0,0,1)');gr.addColorStop(es,'rgba(0,0,0,1)');
    gr.addColorStop(es+(1-es)*.36,'rgba(0,0,0,.72)');gr.addColorStop(es+(1-es)*.68,'rgba(0,0,0,.26)');gr.addColorStop(1,'rgba(0,0,0,0)');
    g.fillStyle=gr;
    if(tmW){var BIG=Math.hypot(W,H)*2;g.save();mouthXf();g.fillRect(-BIG,-BIG,BIG*2,BIG*2);g.restore();}else g.fillRect(0,0,W,H);
    g.globalCompositeOperation='source-over';
  }else{
    gr=g.createRadialGradient(cx,cy,Math.hypot(W,H)*.28,cx,cy,Math.hypot(W,H)*.62);
    gr.addColorStop(0,'rgba(2,5,13,0)');gr.addColorStop(1,'rgba(2,5,13,.55)');
    g.fillStyle=gr;g.fillRect(0,0,W,H);
  }
  if(!glComp&&state==='exit'){   /* dinding terowongan memudar dari PINGGIR layar ke tengah: batas dinding menyusut sampai seukuran mulut portal tujuan (miring mengikuti kemiringan cincin overview), lalu memudar habis */
    var ux=S.u,wk=sm(ux/.78),wa=1-sm((ux-.74)/.26),Rm,tkE=0,tmE=null,re,fe=.3,BIGE=Math.hypot(W,H)*2;
    try{
      var kk=(typeof STG!=='undefined'&&STG.on&&!STG.rot&&STG.k)?STG.k:1;
      Rm=(!S.dest&&typeof PT3D!=='undefined'&&PT3D.ovR>2)?PT3D.ovR*kk*(typeof PT_IN==='number'?PT_IN:.745):S.rp*(typeof PT_IN==='number'?PT_IN:.745);
      if(!S.dest&&typeof PT3D_CFG!=='undefined')tkE=(PT3D_CFG.tiltOv||0)*sm((ux-.25)/.5);   /* dinding makin miring seiring menyempit ke mulut portal */
      if(tkE>.001)tmE=ptTiltMat(ptTiltAng(performance.now(),tkE));
    }catch(eX){Rm=Math.min(W,H)*.06;}
    if(!(Rm>2))Rm=Math.min(W,H)*.06;
    re=lerp(Math.hypot(W,H)*1.1,Rm,wk);
    g.globalCompositeOperation='destination-in';
    g.save();g.translate(cx,cy);if(tmE)g.transform(tmE[0],tmE[1],tmE[2],tmE[3],0,0);
    gr=g.createRadialGradient(0,0,0,0,0,Math.max(2,re));
    gr.addColorStop(0,'rgba(0,0,0,'+wa.toFixed(3)+')');gr.addColorStop(1-fe,'rgba(0,0,0,'+wa.toFixed(3)+')');gr.addColorStop(1,'rgba(0,0,0,0)');
    g.fillStyle=gr;g.fillRect(-BIGE,-BIGE,BIGE*2,BIGE*2);
    g.restore();
    g.globalCompositeOperation='source-over';
    holeDisc(cx,cy,Rh,(1-sm(ux))*wa);   /* lubang hitam ikut memudar */
  }
  g.restore();
  g.setTransform(dpr,0,0,dpr,0,0);
  /* [PATCH G4.12e] rim: GL di #glwh; 2D hanya !glComp */
  if(small&&RIM_GLOW>0&&S.rim>.02){
    if(glComp){try{whGlRim(cx,cy,r,RIM_GLOW*S.rim);}catch(eRim){}}
    else{
      g.globalCompositeOperation='lighter';
      gr=g.createRadialGradient(cx,cy,r*.7,cx,cy,r*1.25);
      gr.addColorStop(0,'rgba(120,165,255,0)');gr.addColorStop(.55,'rgba(120,165,255,'+(RIM_GLOW*S.rim).toFixed(3)+')');gr.addColorStop(1,'rgba(120,165,255,0)');
      g.fillStyle=gr;g.beginPath();g.arc(cx,cy,r*1.25,0,6.283185307);g.fill();
      g.globalCompositeOperation='source-over';
    }
  }
  if(WP)wpM('vig');
  /* cincin portal; [G4.12f P1] bake gagal + glComp → portal 2D + skipTeleGl (tele ke #glscope z14, stacking aman) */
  WHG.skipTeleGl=false;
  if(S.ring&&small&&typeof portal3dDraw==='function'&&WH_DBG.indexOf('noring')<0){
    var ra=(1-sm((r/cvr-.3)/.55))*ringFade();
    if(typeof PX!=='undefined'){if(WH_DBG.indexOf('noringgl')>=0)PX.ptr=1;if(WH_DBG.indexOf('nobolt')>=0)PX.ptb=1;}
    if(ra>.01){
      var pOpt={noMouth:true,noRot:true,ch:1,tilt:ptWhTilt(r/cvr),lq:WH_DBG.indexOf('ringhq')<0,alt2:WH_RING},
          RpP=r/(typeof PT_IN==='number'?PT_IN:.745),nowP=performance.now(),didPt=false;
      if(glComp){try{didPt=whGlPortalDraw(cx,cy,RpP,nowP,ra,pOpt);}catch(ePg){didPt=false;}}
      if(!didPt){
        if(glComp)WHG.skipTeleGl=true;   /* tele tidak di #glwh agar portal 2D di z13 tidak menutup badan */
        try{portal3dDraw(g,cx,cy,RpP,nowP,ra,pOpt);}catch(eR){}
      }
    }
    g.setTransform(dpr,0,0,dpr,0,0);g.globalCompositeOperation='source-over';g.globalAlpha=1;
  }
  if(WP)wpM('ring');
  /* [PATCH G4.12e] flash di #glwh sebelum tele (2D: di bawah tele di kanvas yang sama) */
  if(S.fl>.01){
    if(glComp){try{whGlFlash(Math.min(1,S.fl*.96));}catch(eFl){}}
    else{
      g.globalCompositeOperation='source-over';g.globalAlpha=1;
      g.fillStyle='rgba(228,249,255,'+Math.min(1,S.fl*.96).toFixed(3)+')';g.fillRect(0,0,W,H);
    }
  }
  /* teleskop: melayang mengikuti lubang hitam terowongan (travel), lalu keluar dari tengah portal tujuan (exit) */
  if(S.carry&&state==='travel'){
    /* teleskop terlihat dari awal travel: kecil di tengah mulut -> membesar mengikuti zoom -> melayang+miring di terowongan -> menyusut masuk ke lubang tujuan (lanjut ke exit tanpa pop) */
    var tq=(performance.now()-S.tt),mm=Math.min(W,H),zu=sm(tq/T_OPEN),uu2=clamp(tq/T_OPEN,0,1),ee2=Math.pow(uu2,1.35),ez=lerp(ee2,sm(uu2),sm((uu2-.6)/.4)),   /* P0-1: kapal tumbuh di ruang log dgn waktu yg sama dgn mulut (ee), ease-out di ujung supaya berhenti halus di T_OPEN */
        sw=sm((tq-TS())/Math.max(1,TT()-TS())),
        fq=(performance.now()-S.t0-S.tf0)/T_ENTER_TELE,fe=sm(clamp(fq)),b1=fe<1?(S.tb||teleBase()):null;   /* fe<1 = teleskop masih terbang masuk ke cincin sementara zoom-in sudah jalan (T_TELE_OVERLAP) */
    var sShip=Math.exp(lerp(Math.log(lerp(1,.1,fe)),Math.log(.95),ez)),hoverAmp=sm(clamp((uu2-.45)/.55,0,1)),   /* P0-1 skala kapal (log), P0-2 amp hover */
        rw=sm(tq/320),   /* ramp 0..1: wobble (w) & ayun (sp) naik mulus; enter memakai w:0,sp:0 jadi tanpa ini frame pertama travel meloncat */
        hp2=teleHover(dt,cx,cy,mm,1),bx=b1?lerp(b1.x,cx,fe):cx,by=b1?lerp(b1.y,cy,fe):cy,
        px=lerp(bx+(hp2[0]-cx)*hoverAmp,cx,sw),py=lerp(by+(hp2[1]-cy)*hoverAmp,cy,sw),
        aFade=1-sm(clamp((tq-(TT()-260))/260,0,1));   /* H1: fade teleskop ~260ms sebelum TT() supaya travel→exit tidak pop a:1→aE=0 */
    if(chase3d()){
      var tlc=teleTilt(dt,[px,py],cx,cy,mm,.3+.7*zu,1);
      drawTele({alt:1,base:S.tb,x:px,y:py,s:sShip*(1-.87*sw),a:aFade,w:.7*rw,sp:Math.sin(tt*1.1)*.07*(1-sw)*rw,tilt:chasePose(fe,1,tlc)});   /* POV belakang: bank/lean dari gerak ikut di atas pose */
    }else drawTele({alt:1,base:S.tb,x:px,y:py,s:sShip*(1-.87*sw),a:aFade,w:.7*rw,sp:(fq>=1?5.2-6.2832:fe*5.2)*(1-sm(Math.max(0,fq-1)*T_ENTER_TELE/700))+Math.sin(tt*1.1)*.18*(1-sw)*rw,tilt:teleTilt(dt,[px,py],cx,cy,mm,.3+.7*zu,1)});
  }else if(S.carry&&state==='exit'){
    /* keluar portal: HIDUNG duluan. Hidung mengarah ke arah terbang (portal -> posisi istirahat), bukan arah tetap; selama masih keluar hanya bagian di depan bidang portal yang digambar
       (hidung muncul dulu, badan lalu buritan menyusul), lalu belok mulus ke pose istirahat. Teleskop di atas kilat layar, alpha naik pelan supaya pergantian pose dari terowongan tak terlihat. */
    var xe=clamp((S.u-.4)/.6,0,1),pu=sm(xe),b0=teleBase(),h0=S.hv||[cx,cy];
    if(b0){
      var vx0=b0.x-cx,vy0=b0.y-cy,vl0=Math.hypot(vx0,vy0);
      if(vl0>6)S.xh=Math.atan2(vy0,vx0);else if(S.xh==null)S.xh=wrapPi(b0.ang+b0.rot);
      var hd=S.xh,ddx=Math.cos(hd),ddy=Math.sin(hd),ex=lerp(cx,b0.x,pu),ey=lerp(cy,b0.y,pu),sE=lerp(.4,1,pu),aE=sm((S.u-.38)/.1),
          hold=clamp(TELE_CHASE.exitHold,0,.9),pk=1-sm(clamp((pu-hold)/Math.max(.05,1-hold),0,1)),
          Lh=b0.sc*sE*40,clip=(pu<1&&pu*vl0<Lh*1.4)?{x:cx,y:cy,dx:ddx,dy:ddy}:null;
      if(chase3d()){
        var tle=teleTilt(dt,[ex,ey],cx,cy,Math.min(W,H),pk,TELE_TILT.exitDir,TELE_TILT.exitVel);
        drawTele({x:ex,y:ey,s:sE,a:aE,w:(1-pu)*.5,sp:0,clip:clip,tilt:chasePose(pk,TELE_CHASE.exitFace,tle,-hd)});   /* roll = -arah terbang: hidung (proyeksi layar) searah gerak */
      }else drawTele({x:ex,y:ey,s:sE,a:aE,w:(1-pu)*.5,sp:0,clip:clip,head:hd,hk:pk,tilt:teleTilt(dt,[ex,ey],cx,cy,Math.min(W,H),1-pu,TELE_TILT.exitDir,TELE_TILT.exitVel)});
    }
  }
  if(WP)wpM('tele');
}
/* posisi teleskop di dalam terowongan: menuju titik sedikit di depan/bawah lubang hitam dengan jeda (pegas), jadi kelihatan MENGIKUTI gerakan lubang hitam, bukan menempel */
function teleHover(dt,cx,cy,m,amp){   /* amp 0..1: amplitudo melayang (naik pelan seiring zoom-in) */
  var h=S.hv;amp=amp==null?1:amp;
  if(!h){h=S.hv=[cx,cy];}
  var tx=cx+Math.sin(tt*1.3)*m*.05*amp,ty=cy+(m*.11+Math.cos(tt*1.7)*m*.025)*amp,k=1-Math.exp(-dt*4);
  h[0]+=(tx-h[0])*k;h[1]+=(ty-h[1])*k;
  return h;
}

function tick(now){
  raf=0;
  if(state==='idle'||!g||!ok)return;
  var dt=Math.min(.05,Math.max(0,(now-last)/1000)),p,q,w,cvr,eT,skyMs=0,leadMs=0;
  if(WP){skyMs=WP.sk;WP.sk=0;WP.l=performance.now();leadMs=WP.l-now;}   /* v8: biaya frame() sky di rAF ini (jalan sebelum tick) */
  W=winW();H=winH();cvr=cover();
  last=now;ema+=(dt-ema)*.08;
  try{if(typeof UIS!=='undefined'&&UIS.warpUpd)UIS.warpUpd(state,env,S.rate);}catch(eW){}
  var justDive=0;
  if(state==='enter'){
    q=now-S.t0;
    S.ch=sm(q/S.chT);env=Math.min(.5,q/Math.max(1,S.A)*.5);
    if(q>=S.A-(S.carry?Math.min(T_TELE_OVERLAP,T_ENTER_TELE*.8):0)){engageDive(now);justDive=1;}   /* teleskop yang masih terbang diteruskan di blok travel (fe) */
  }
  /* justDive: frame engageDive cuma teleBase + pre-warm + gambar enter-style. Travel penuh (skyCam + terowongan + portal3d) mulai frame berikutnya = anti-hitch awal zoom. */
  if(state==='travel'&&!justDive&&!(S&&S.justDive)){
    q=now-S.tt;S.ring=1;   /* mulai frame ini cincin digambar di sini; sky menyembunyikan miliknya di frame sky berikutnya (tumpang tindih 1 frame, ukuran sama = tak terlihat) */
    {
      /* sektor -> overview & lompat antar sektor: jadwal identik (lihat komentar T_TRAVEL). Beda cuma tujuan akhir lubang hitam. */
      var uu=clamp(q/T_OPEN),ee=Math.pow(uu,1.35),ck=null;   /* kamera mendekat: skala eksponensial, pelan di awal lalu makin cepat */
      S.r=q<T_OPEN?S.rp*(typeof PT_IN==='number'?PT_IN:.745)*Math.exp(S.lnK*ee):cvr;
      if(q<T_OPEN&&SKY_ZOOM&&!S.cov)ck=skyCam(uu,ee);   /* guard !S.cov: jangan pasang ulang transform setelah skyReset (bug laten + aman utk P0-3) */
      if(!S.cov){
        var cd=Math.max(Math.hypot(S.cx,S.cy),Math.hypot(W-S.cx,S.cy),Math.hypot(S.cx,H-S.cy),Math.hypot(W-S.cx,H-S.cy));
        if(S.r>=cd*1.02||q>T_OPEN){
          S.cov=1;warpFx('hit');
          if(!S.cvQ){S.cvQ=1;var Sref=S;requestAnimationFrame(function(){if(S===Sref)runCover();});}   /* P0-3: defer runCover ke frame berikutnya (anti-hitch puncak zoom); token S===Sref biar tak jalan di transisi baru */
        }
      }
      w=sm((q-TS())/(TT()-TS()));
      if(w>0){var tg=seekTarget(dt);S.cx=lerp(W*.5,tg[0],w);S.cy=lerp(H*.5,tg[1],w);}   /* tengah layar -> tujuan (BH overview / BH mini sektor tujuan) */
      else if(ck){S.cx=ck[0];S.cy=ck[1];}   /* titik cincin ikut kamera (bergeser ke tengah layar) */
      else{p=sm(q/T_MOVE);S.cx=lerp(S.cx1,W*.5,p);S.cy=lerp(S.cy1,H*.5,p);}              /* posisi BH mini -> tengah layar */
      S.a=1;S.rate=lerp(S.rate1,1.1,sm(q/T_MOVE))+.6*Math.sin(Math.PI*clamp((q-T_OPEN)/Math.max(1,TS()-T_OPEN)));S.rim=0;S.fl=sm((q-(TT()-380))/380);   /* + lonjakan kecepatan di tengah terowongan (streak memanjang) */
      env=Math.max(env,0);env+=(1-env)*Math.min(1,dt*5);
      if(S.cov&&q>=TT()&&!secBusy()&&!gatePending()&&(!S.dest||(typeof SECT!=='undefined'&&SECT.cur===S.dest)||q>TT()+1500))startExit(now);
      else if(q>TT()+6000){runCover();startClose(now,T_CLOSE);}   /* pengaman: transisi macet */
    }
  }
  if(S&&S.justDive)S.justDive=0;
  if(state==='exit'){
    var ue=clamp((now-S.tx)/T_EXIT,0,1),bt=seekTarget(dt);
    S.u=ue;S.cx=bt[0];S.cy=bt[1];S.r=S.r0;S.a=1;S.rate=lerp(S.rate0,.7,sm(ue));S.rim=0;S.ring=0;S.fl=1-sm(ue/.35);env=S.e0*(1-sm(ue));
    if(ue>=1){
      /* Handoff ke #sky TANPA kedip & tanpa bayangan: dulu hide() langsung di sini -> kanvas wormhole hilang, sedangkan #sky baru menggambar teleskop di frame sky berikutnya
         (frame-cap / slow-mode bisa melewati 1-3 frame) = kedip. Sekarang: TELESCOPE.dive=0 (sky mulai menggambar teleskopnya), sementara exit tetap digambar di ue=1
         (posisi/skala/pose istirahat dari teleBase() LIVE, jadi selalu menempel ke teleskop sky yang bergerak). Begitu satu frame sky utuh selesai, kanvas ini dilepas
         seketika (tanpa crossfade = tanpa bayangan ganda). Pengaman 300ms kalau sky macet. */
      if(S.carry&&typeof lastFrameOK==='number'){
        if(!S.ho){S.ho=1;S.ht=now;S.hf=lastFrameOK;try{TELESCOPE.dive=0;}catch(eH){}}
        else if(lastFrameOK!==S.hf||now-S.ht>300){wpEnd();state='idle';env=0;hide();return;}
      }else{wpEnd();state='idle';env=0;hide();return;}
    }
  }
  if(state==='close'){
    q=clamp((now-S.tc)/S.cms,0,1);eT=sm(q);
    S.cx=S.c0[0];S.cy=S.c0[1];
    S.r=S.r0;
    S.a=S.a0*(1-eT);S.rate=lerp(S.rate0,.6,eT);S.rim=0;env=S.e0*(1-eT);
    if(q>=1){wpEnd();state='idle';env=0;hide();return;}
  }
  if(state==='enter'||justDive){   /* belum ada terowongan: kanvas transparan, hanya teleskop. justDive = frame engageDive tetap ringan (travel penuh frame berikutnya) */
    tt+=dt;
    g.setTransform(dpr,0,0,dpr,0,0);g.globalCompositeOperation='source-over';g.globalAlpha=1;g.clearRect(0,0,W,H);
    if(S.carry){
      WHG.skipTeleGl=false;try{whGlEnterPrep();}catch(eEp){}
      var fu=clamp((now-S.t0-S.tf0)/T_ENTER_TELE),b1=(justDive&&S.tb)?S.tb:teleBase(),fe=sm(fu);
      if(b1){
        if(chase3d())drawTele({x:lerp(b1.x,S.x,fe),y:lerp(b1.y,S.y,fe),s:lerp(1,.1,fe),a:1,w:0,sp:0,tilt:chasePose(fe,1)});   /* pesawat berbalik: hidung ke portal, mesin hijau menghadap kita, sambil mengecil masuk */
        else drawTele({x:lerp(b1.x,S.x,fe),y:lerp(b1.y,S.y,fe),s:lerp(1,.1,fe),a:1,w:0,sp:fe*5.2});
      }   /* tetap terlihat di tengah mulut (tidak memudar) supaya travel melanjutkan tanpa pop */
    }
    cv.style.opacity='1';
    try{if(typeof tele3dTopEnd==='function')tele3dTopEnd();}catch(eTe){}
    raf=requestAnimationFrame(tick);return;
  }
  /* kalau frame berat: kurangi jumlah stream (maks sampai 45%), resolusi tetap tajam */
  if(ema>.034&&dens>.46){dens-=.18;ema=.016;}
  if(cv.width!==Math.round(W*dpr)||cv.height!==Math.round(H*dpr))resize();
  cv.style.opacity=S.a>=.995?'1':S.a.toFixed(3);
  if(!(cvr>0))cvr=Math.hypot(W,H)*1.08;
  if(!isFinite(S.r)||!isFinite(S.cx)||!isFinite(S.cy)){S.r=Math.min(W,H)*.22;S.cx=W*.5;S.cy=H*.5;}
  var _w0=performance.now();
  try{drawFrame(dt,S.cx,S.cy,Math.max(1,S.r),cvr);
    try{var _k=state==='travel'?(S.cov?'tunnel':'zoom'):state,_o=WHS[_k]||(WHS[_k]={n:0,js:0,dt:0,max:0,cw:0,ch:0,dpr:0}),_j=performance.now()-_w0;_o.n++;_o.js+=_j;_o.dt+=dt*1000;if(_j>_o.max)_o.max=_j;_o.cw=cv.width;_o.ch=cv.height;_o.dpr=dpr;}catch(eWs){}
    if(WP)wpRec(now,state==='travel'?(S.cov?'tunnel':'zoom'):state,state==='travel'?q:now-(S.tx||now),performance.now()-now,skyMs,leadMs);
    try{if(typeof tele3dTopEnd==='function')tele3dTopEnd();}catch(eTe2){}}
  catch(errD){   /* satu frame error jangan bikin state nyangkut (portal mati sampai reload) */
    try{console.warn('[wormhole] frame error:',errD&&errD.message);}catch(e4){}
    hardStop();return;
  }
  raf=requestAnimationFrame(tick);
}

/* Muffle audio untuk spatialTarget (01-core.js): 0..1, dipakai sebagai batas bawah target redam.
   .88 = angka yang sama dengan tunnel/star-tracker muffle yang sudah ada. */
function muffle(){return state==='idle'?0:.88*clamp(env,0,1);}

window.WORMHOLE={
  gate:function(s,pos,R,cb){try{return go(s,pos,R,cb);}catch(e){return false;}},          /* lompat antar sektor: BH mini -> tengah -> BH mini sektor tujuan s */
  overview:function(pos,R,cb){try{return go(null,pos,R,cb);}catch(e){return false;}},     /* sektor -> overview: BH mini -> tengah -> BH overview; jadwal & durasi sama dengan gate */
  arrive:function(){if(state==='exit')return .08+.92*eo(clamp(S.u/.6,0,1));if(state==='travel'&&S.go&&S.cov)return .08;return 1;},
  muffle:function(){return muffle();},
  charge:function(){try{return chargeP(performance.now());}catch(e){return 0;}},   /* 0..1: progres muatan cincin (plat menyala satu per satu) */
  ringFade:ringFade,   /* 0..1 serah-terima cincin/BH (dipakai 03-gargantua: BH sektor disembunyikan saat 1) */
  ringOwned:function(){return state==='travel'&&!!S.ring;},   /* cincin portal sektor sedang digambar di kanvas wormhole (zoom-in) */
  get zooming(){return state==='travel'&&!S.cov&&S.tt!=null&&(performance.now()-S.tt)<T_OPEN;},   /* zoom-in ke portal sebelum layar tertutup: sky di bawah cuma di-zoom CSS + meredup, tak perlu dirender penuh tiap frame */
  /* v8: kanvas terowongan menutup SELURUH layar secara buram (travel setelah S.cov, + awal exit sampai dinding mulai menyusut u<.22) -> #sky di bawahnya tak terlihat sama sekali;
     05-sector-ui.js frame() menjarangkan render sky saat ini true (sebelumnya sky dirender PENUH tiap frame di bawah terowongan = biaya js ~20ms/frame). ?whdbg=nocov = perilaku lama (A/B). */
  get covered(){return WH_DBG.indexOf('nocov')<0&&((state==='travel'&&!!S&&!!S.cov)||(state==='exit'&&!!S&&S.u<.22));},
  get on(){return state!=='idle';},
  get busy(){return state==='enter'||state==='travel'||state==='exit';},   /* transisi sedang jalan */
  get supported(){return usable();},
  /* flag whdbg bertoken persis (dipisah koma), untuk modul lain: WH_DBG private di IIFE ini. ?whdbg=noplanet = A/B planet3d dilewati selama wormhole aktif (17-planet3d.js) */
  dbgHas:function(t){return (','+WH_DBG+',').indexOf(','+t+',')>=0;},
  get noPlanet(){return (','+WH_DBG+',').indexOf(',noplanet,')>=0;},
  /* hook debug untuk 19-auto-debug.js (?debug=1&whperf=1): WP/flag di dalam IIFE ini private */
  dbgAttach:function(w){WP=w;},
  dbgInfo:function(){return {dpr:dpr,zoom:SKY_ZOOM,ring:WH_RING,step:WH_STEP,nobloom:WH_NOBLOOM,dbg:WH_DBG,smq:(typeof SCP3D_SMQ!=='undefined'?SCP3D_SMQ:''),gl:WHG.ok,glErr:WHG.err,glWhy:WHG.why};},
  dbgStats:function(){var o={},k,a;for(k in WHS){a=WHS[k];o[k]={n:a.n,js:a.n?Math.round(a.js/a.n*10)/10:0,dt:a.n?Math.round(a.dt/a.n*10)/10:0,max:Math.round(a.max*10)/10,cv:a.cw+'x'+a.ch,dpr:a.dpr};}return o;},
  /* [PATCH G4.12] status feedback GL */
  get gl(){return !!(WHG.ok&&WHG.on);},
  get glOn(){return !!WHG.on;},
  glWHG:WHG,
  /* [PATCH G4.12c] API teleskop present #glwh (dipakai 13-scope3d tele3dTopDraw) */
  teleWant:whGlTeleWant,
  teleAttach:whGlTeleAttach,
  teleDetach:whGlTeleDetach,
  teleDraw:whGlTeleDraw
};
/* bridge global utk 13-scope3d (IIFE wormhole) */
try{
  window.whGlTeleWant=whGlTeleWant;
  window.whGlTeleAttach=whGlTeleAttach;
  window.whGlTeleDetach=whGlTeleDetach;
  window.whGlTeleDraw=whGlTeleDraw;
}catch(eBr){}

window.addEventListener('resize',function(){if(state!=='idle'&&cv)resize();},{passive:true});
/* bake atlas ~puluhan ms: lakukan saat idle supaya transisi pertama tidak patah (HP lemah: lazy). */
if(!potato()&&usable()){
  var idle=window.requestIdleCallback||function(f){return setTimeout(f,3500);};
  idle(function(){if(document.body)init();},{timeout:7000});
}
/* v23: html.wh-busy selama transisi wormhole atau sektor (SECT.busy); dipakai index.css untuk menjeda animasi HUD. Polling 100ms, DOM hanya disentuh saat nilai berubah. */
(function(){
  var de=document.documentElement,cur=false;
  setInterval(function(){
    var b=state==='enter'||state==='travel'||state==='exit'||(typeof SECT!=='undefined'&&!!SECT.busy);
    if(b!==cur){cur=b;de.classList.toggle('wh-busy',b);}
  },100);
})();
})();
