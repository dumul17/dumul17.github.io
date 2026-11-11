'use strict';
/* ================= GLSKY (G0 kerangka + G1 latar; nyala: ?glsky=1) =================
   Rencana: rencana-gl-sky.md. Tujuan proyek: SERU, BUKAN ngejar fps (tidak ada tahap yang dinilai dari angka fps).
   Kanvas WebGL (three r186 yang sudah ada, SATU WebGLRenderer) ditaruh DI BAWAH #sky di dalam #stage.
   G0: warna dasar #050b12 (pengganti fillRect lama di frame()).
   G1: LATAR ikut pindah ke GL: plateDeep, 2 layer debu, nebula bertopeng + dim + tint aditif sektor (sectDrawSky), bgCanvas, grid mode kamera.
       Canvas hasil bake (yang sudah ada) diunggah jadi texture SEKALI per canvas (canvas baru = bake baru; grid pakai penanda __glv), bukan tiap frame.
       Kode 2D lama TIDAK menghitung ulang apa pun: plateBlit() dan sectDrawSky() tetap menghitung alpha/zoom/pan seperti biasa, tapi saat GLSKY.act&&GLSKY.lay
       gambarnya dicatat jadi daftar op (glskyPlate/glskyFill/glskyImg), lalu glskyFlush() menggambarnya sekali per frame sebagai quad. Satu sumber kebenaran.
       Blend: shader sendiri, premultiplied (texture diunggah premultiplyAlpha) -> source-over = ONE,1-SRCA; 'lighter' = ONE,ONE. Sama dgn canvas 2D.
   Mainan G1 (khusus GL, 2D tidak punya): VIGNETTE (shader, gelap lembut di tepi, ikut tertangkap saat capture) + DRIFT opsional (DEFAULT MATI: langit sektor sengaja diam, planet yang bergerak) untuk plateDeep, nebula.webp sektor (NEB.tint) & glow sektor; nyalakan ?gldrift=1. Overview (milky-way.webp, mwDraw) belum di GL dan sudah bergerak di 2D.
   G1b: Milky Way overview (mwDraw, milky-way.webp) ikut GL lewat hook 1 baris di mwDraw (02-sky-logic.js) -> glskyMW(): gulungan tile, mirror, zoom, pan, portrait/landscape dihitung
        sama persis dgn mwDraw; MW.off/MW.t/tuning tune3d tetap milik mwDraw (satu sumber kebenaran). Gambar diunggah SEKALI (mipmap aktif); kalau lebih besar dari batas GPU, diperkecil sekali ke kanvas.
   G2+G3: BINTANG (halo + inti, profil sama dgn 23-stargl.js) dan GARIS RASI digambar di kanvas GL, masing-masing SATU mesh instancing (satu draw call per jenis, bukan satu mesh per bintang/garis).
        Hook: drawStars (04-render.js) memanggil glskyStar() persis di titik stglPush lama; drawCons memanggil glskyPoly() menggantikan g.stroke() (sampel lensa gSky tetap dihitung JS);
        glskyFlush dipindah ke SESUDAH loop cons+stars di frame() (05-sector-ui.js) supaya garis & bintang sempat tercatat. Urutan GL: latar -> garis -> bintang. Kedip/napas/LOD/aturan BGM tetap dihitung JS (belum pindah ke shader).
        Garis glow (pass lebar) ditepikan lembut (profil pangkat 1.5); ?glsoft=0 = tepi keras seperti 2D. Bintang di mode kamera & jalur potato audio-focus tetap 2D (di atas garis GL, urutan benar).
        Flag: ?glstars=0 bintang tetap 2D | ?gllines=0 garis tetap 2D | ?glsoft=0 glow garis keras. Konsol: GLSKY.starOn / GLSKY.lineOn / GLSKY.soft.
        Masih 2D (belum pindah): bintang/rasi/label, BH, planet, drawHud, bandDimDraw (source-over, aman).
   G3c: METEOR ACAK (drawShooting, 04-render.js) pindah ke GL: sprite goresan yang sama (ssSprite) diunggah jadi texture SEKALI lewat glskyImg (source-over), posisi/arah/umur tetap dihitung JS; urutan sama dgn 2D (di bawah garis+bintang GL). Komet/Konami (kepala batu 3D, aurora, 'lighter') dan ?ss=1 tetap 2D. Flag: ?glss=0 meteor tetap 2D | konsol GLSKY.ssOn.
   G2c: tint BGM (ofxDrawTint, constellation.opus 'lighter' biru + collapsars.opus 'multiply' merah) pindah ke GL lewat glskyImg add=1 / add=2; dulu digambar di #sky 2D yang menutup bintang GL dan 'multiply' di kanvas transparan cuma jadi overlay merah, bukan menggelapkan.
   G4.1: BATU BELAKANG (drawAsteroids half=-1, 12-ast3d.js) masuk scene bersama lewat glskyAttach (renderOrder 200). Batu depan tetap 2D (BH masih 2D di atas GL). Flag ?glast=0 A/B. depth:true di renderer supaya mesh 3D bisa depthTest; lapisan 2D-style (latar/bintang/garis) tetap depthTest:false.
   G3d: BH SHOCKWAVES (drawBHShockwaves, 04-render.js) pindah ke GL: sprite cincin lembut aditif (add=1), renderOrder 5100 (di atas bintang/garis 5000). Body BH / breathing ring tetap 2D. Flag ?glbhshock=0 A/B | konsol GLSKY.bhShockOn.
   G3e: SUPERNOVA + BELT FX (drawSupernovaBursts / drawBeltFx, 05-sector-ui.js) pindah ke GL lewat sprite snBake yang sama (core/ring/streak/flash), add=1 + hi=1. Flag ?glsn=0 A/B | konsol GLSKY.snOn.
   G3f: TRIGGER VISUALS + pulse shock (drawTriggerVisuals / drawPulses.shock / drawRipple, 04-render.js) pindah ke GL lewat getRingSprite yang sama, add=1 + hi=1. Flag ?gltrig=0 A/B | konsol GLSKY.trigOn.
   G3g: PLEIADES bintang (drawPleiades, 04-render.js) halo+inti lewat glskyStar (mesh bintang yang sama); label/nama/spektrum tetap 2D. Flag ?glplei=0 A/B | konsol GLSKY.pleiOn. Mode kamera tetap 2D (sama glskyStarsOn).
   G4.2b: PORTAL overview full GL (cincin billboard + mulut PTT + petir glskySeg + percikan + charge) SEBELUM flush; #sky 2D tidak lagi menerima blit portal. Flag ?glportal=0 A/B | konsol GLSKY.portalOn.
   G4.3b: BH BODY+plasma+drag (drawHoleGl) sprite+bloom+serat+kilau cakram+warp drag ke GL sebelum flush. Flag ?glbh=0 A/B | konsol GLSKY.bhOn.
   G4.5: TELESKOP 3D (13-scope3d.js) jadi Group di PASS ATAS (glskyAttachTop: scene+kamera y-ke-atas sendiri, dirender sesudah scene utama; lihat catatan FIX di glskyAttachTop): tanpa renderer 'small', tanpa blit/drawImage ke #sky saat GL aktif; salinan tepi layar = klon Group; wormhole dive tetap jalur 2D (terowongan masih kanvas 2D z 13). Flag ?glscope=0 A/B | konsol SCP3D_GL.on.
   G4.4: AST dual-mesh — pass depan meshF RO 5200 tanpa blit (12-ast3d.js). Flag ?glast=0.
   G3h: EFEK KECIL sesudah flush pindah ke GL (dicatat sebelum flush, di atas BH/trigger): ofxDrawAvail (glow 8 bintang), ofxDrawDust (debu kursor), drawFocusFx (cincin/rasi fokus mode kamera, glskyFocusFx), reticle drawTargetLock (glskyLockReticle; teks telemetri tetap 2D). Glow = sprite getStarSprite lewat glskyImg add=1 hi=1, garis/cincin = glskySeg/glskyPoly. drawSectFlash SENGAJA tetap 2D (flash layar penuh harus di atas semua unit). Flag ?glfx=0 A/B | konsol GLSKY.fxOn.
   G4.7: DRONE TX/RX 3D (14-drone3d.js) = Group di LAYER DRONE (kanvas #gldrone di ATAS #sky, kanvas GL ketiga, malas), tanpa blit/drawImage; halo lembut tetap 2D di bawahnya. Di atas #sky karena planet masih blit 2D dan drone digambar sesudah planet. Planet pindah GL => drone pindah ke pass atas, layer dihapus. Flag ?gldrone=0 A/B | konsol GLSKY.drOn.
   CATATAN KNOWN: efek 'lighter' yang masih 2D (halo BH, supernova, bintang jatuh) kini digambar aditif di atas kanvas 2D transparan lalu ditumpuk
   normal di atas GL, bukan aditif di atas plate => bisa ada cincin gelap tipis di atas nebula terang. Halo bintang pindah ke GL di G2.
   - Posisi / lensing / rotasi / zoom tetap dihitung JS (W,H = ruang stage, sama dgn #sky). Kamera ortho = piksel CSS ruang stage, y ke bawah.
   - Landscape (STG.rot) & letterbox desktop: kanvas GL anak #stage persis seperti #sky, jadi ikut diputar / di-scale CSS.
   - Transform/opacity inline yang dipasang wormhole ke #sky (kamera zoom) disalin ke kanvas GL lewat MutationObserver.
   - Nol biaya untuk pengunjung biasa: file ini hanya dimuat kalau ?glsky=1|test (atau localStorage dumul_glsky=1). Loader inline di index.html, BUKAN di SHELL SW.
   Flag:  ?glsky=1 nyala | ?glsky=0 paksa 2D (menang atas localStorage) | ?glsky=test nyala + lapisan uji (gradien + 4 penanda sudut; latar 2D dimatikan supaya GL kelihatan)
          ?gllay=0 = G0 saja (latar tetap digambar 2D, GL cuma warna dasar) untuk A/B | ?glskydpr=1|1.5|2 batas DPR buffer GL (default: TIDAK dibatasi = ukuran piksel sama persis dgn kanvas 2D, round(W*DPR); dulu 1.5 -> Milky Way burik/berkilau karena di-upscale kompositor) | ?glmwsnap=1 tile Milky Way dibulatkan ke piksel perangkat (uji coba anti-kilau)
          ?glvig=0 matikan vignette (?glvig=0.5 kekuatan 0..1, default .34) | ?gldrift=1 nyalakan drift (default 0 = diam; ?gldrift=2 = 2x lebih lebar) | konsol: GLSKY.vig / GLSKY.drift boleh diubah langsung.
          Konsol: GLSKY.on=false/true (A/B 2D vs GL), GLSKY.lay=false/true (G0 vs G1), GLSKY.st = {fr, msAvg, msMax, up (jumlah texture diunggah), tex (texture hidup)}.
   Fallback: renderer gagal / konteks hilang >=3x / texture melebihi batas GPU => balik ke 2D, kanvas GL disembunyikan, tanpa reload.
   Jalur 2D lama utuh: kalau file ini tidak dimuat, semua hook di frame()/plateBlit()/sectDrawSky()/snapCompose() tidak melakukan apa-apa (typeof / GLSKY guard). Token bench off= tetap jalur 2D saja.
   Pola penanda uji: sudut kiri-atas MERAH, kanan-atas HIJAU, kiri-bawah BIRU, kanan-bawah KUNING (kalau tertukar = arah y / rotasi salah). */
var GLSKY={on:true,lay:true,act:false,err:0,ok:false,init:false,why:'',test:false,base:'#050b12',want:false,
  r:null,scene:null,cam:null,root:null,cv:null,mo:null,W:0,H:0,pw:0,ph:0,S:1,sCap:99,mwSnap:0,shown:true,px:null,tm:null,
  vig:.34,drift:0,rec:false,fxOn:true,starOn:true,lineOn:true,ssOn:true,soft:1,inst:false,sn:0,ln:0,bs:null,bl:null,ms:null,ml:null,now:0,ops:[],n:0,mesh:[],geo:null,dummy:null,tx:new Map(),col:Object.create(null),sw:0,maxTex:2048,
  /* [PATCH G4.1] unit 3D yang di-attach ke scene bersama (batu belakang dulu); astOn = A/B ?glast=0 */
  /* [PATCH G3d] bhShockOn = A/B ?glbhshock=0 */
  units:[],tScene:null,tCam:null,tUnits:[],oR:null,oCv:null,oScene:null,oCam:null,oOk:false,oErr:0,oPw:0,oPh:0,astOn:true,bhShockOn:true,snOn:true,trigOn:true,pleiOn:true,portalOn:true,bhOn:true,
  /* [G4.7] layer drone: kanvas GL ketiga (#gldrone) DI ATAS #sky, anak #stage; dibuat malas saat drone pertama muncul. drOn = A/B ?gldrone=0 */
  drOn:true,dR:null,dCv:null,dScene:null,dCam:null,dOk:false,dErr:0,dPw:0,dPh:0,dShown:false,
  st:{fr:0,ms:0,mx:0,msAvg:0,msMax:0,lost:0,up:0,tex:0}};
try{window.__glsky=GLSKY;}catch(eG0){}
(function(){
  try{
    var m=/[?&]glsky=(0|1|test)(&|#|$)/.exec(location.search),d=/[?&]glskydpr=([0-9.]+)/.exec(location.search);
    if(m){GLSKY.on=m[1]!=='0';GLSKY.test=m[1]==='test';}
    if(d&&parseFloat(d[1])>0)GLSKY.sCap=parseFloat(d[1]);
    if(/[?&]glmwsnap=1(&|#|$)/.test(location.search))GLSKY.mwSnap=1;
    if(/[?&]glstars=0(&|#|$)/.test(location.search))GLSKY.starOn=false;
    if(/[?&]gllines=0(&|#|$)/.test(location.search))GLSKY.lineOn=false;
    if(/[?&]glss=0(&|#|$)/.test(location.search))GLSKY.ssOn=false;
    if(/[?&]glsoft=0(&|#|$)/.test(location.search))GLSKY.soft=0;
    if(/[?&]gllay=0(&|#|$)/.test(location.search))GLSKY.lay=false;
    if(/[?&]glast=0(&|#|$)/.test(location.search))GLSKY.astOn=false;   /* [PATCH G4.1] A/B: batu belakang tetap 2D */
    if(/[?&]glbhshock=0(&|#|$)/.test(location.search))GLSKY.bhShockOn=false;   /* [PATCH G3d] A/B: BH shock tetap 2D */
    if(/[?&]glsn=0(&|#|$)/.test(location.search))GLSKY.snOn=false;   /* [PATCH G3e] A/B: supernova+belt tetap 2D */
    if(/[?&]gltrig=0(&|#|$)/.test(location.search))GLSKY.trigOn=false;   /* [PATCH G3f] A/B: trigger/ripple/pulse-shock tetap 2D */
    if(/[?&]glfx=0(&|#|$)/.test(location.search))GLSKY.fxOn=false;   /* [PATCH G3h] A/B: efek kecil (avail/dust/focus/lock) tetap 2D */
    if(/[?&]glplei=0(&|#|$)/.test(location.search))GLSKY.pleiOn=false;   /* [PATCH G3g] A/B: Pleiades bintang tetap 2D */
    if(/[?&]glportal=0(&|#|$)/.test(location.search))GLSKY.portalOn=false;   /* [PATCH G4.2] A/B: portal cincin tetap 2D blit */
    if(/[?&]gldrone=0(&|#|$)/.test(location.search))GLSKY.drOn=false;   /* [G4.7] A/B: drone tetap blit 2D */
    if(/[?&]glbh=0(&|#|$)/.test(location.search))GLSKY.bhOn=false;   /* [PATCH G4.3] A/B: BH body tetap 2D */
    var v=/[?&]glvig=([0-9.]+)/.exec(location.search),dr=/[?&]gldrift=([0-9.]+)/.exec(location.search);
    if(v&&isFinite(parseFloat(v[1])))GLSKY.vig=Math.max(0,Math.min(1,parseFloat(v[1])));
    if(dr&&isFinite(parseFloat(dr[1])))GLSKY.drift=Math.max(0,Math.min(4,parseFloat(dr[1])));
    if(/[?&]off=/.test(location.search)){GLSKY.on=false;GLSKY.why='bench-off';}   /* token off= (bench): jalur 2D saja */
  }catch(e){}
})();

function glskyShow(v){
  var S=GLSKY;
  if(!S.cv||S.shown===v)return;
  S.shown=v;S.cv.style.display=v?'block':'none';
}
function glskyRestorePX(){
  var S=GLSKY;
  if(S.px){try{PX.neb=S.px[0];PX.mw=S.px[1];}catch(e){}S.px=null;}
}
function glskyFail(why){
  var S=GLSKY;
  S.err=3;S.act=false;S.ok=false;S.why=String(why||'');S.cap=null;
  try{console.warn('[glsky] fallback ke 2D:',S.why);}catch(e){}
  try{window.__hub.renderError='glsky: '+S.why;}catch(e2){}
  glskyRestorePX();
  try{if(S.mo)S.mo.disconnect();}catch(e3){}
  try{if(S.cv)S.cv.style.display='none';}catch(e4){}
  try{glskyOvHide();}catch(e4b){}
  try{glskyDrKill();}catch(e4c){}   /* [G4.7] layer drone ikut mati: drone balik blit 2D */
  try{if(S.r)S.r.dispose();}catch(e5){}
  S.r=null;
}

/* salin gaya inline #sky (transform kamera wormhole, opacity, dst) ke kanvas GL */
function glskyMirror(){
  var S=GLSKY,a=cv.style,b,L=[S.cv,S.dCv],k;
  if(!S.cv)return;
  for(k=0;k<2;k++){   /* [G4.7] kanvas drone (#gldrone) ikut transform/opacity #sky persis seperti kanvas GL utama */
    if(!L[k])continue;
    b=L[k].style;
    if(b.transform!==a.transform)b.transform=a.transform;
    if(b.transformOrigin!==a.transformOrigin)b.transformOrigin=a.transformOrigin;
    if(b.opacity!==a.opacity)b.opacity=a.opacity;
    if(b.willChange!==a.willChange)b.willChange=a.willChange;
    if(b.visibility!==a.visibility)b.visibility=a.visibility;
  }
}

/* lapisan uji (?glsky=test): gradien piksel-ruang-stage + 4 penanda sudut. ShaderMaterial dipakai supaya jalur shader ikut teruji. */
function glskyBuildTest(T){
  var S=GLSKY,grp=new T.Group(),i,mk,cols=[0xff2030,0x20ff50,0x2060ff,0xffe020],mat;
  mat=new T.ShaderMaterial({
    uniforms:{uTime:{value:0}},
    side:T.DoubleSide,depthTest:false,depthWrite:false,
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader:'precision mediump float;varying vec2 vUv;uniform float uTime;'+
      'void main(){float y=1.0-vUv.y;'+                                   /* y=0 atas layar (kamera ortho y ke bawah) */
      'vec3 c=mix(vec3(0.04,0.22,0.30),vec3(0.24,0.05,0.30),y);'+
      'c+=0.05*sin(uTime*0.8+y*6.2831+vUv.x*3.0);'+                      /* denyut pelan: bukti loop hidup */
      'gl_FragColor=vec4(c,1.0);}'
  });
  S.tm={bg:new T.Mesh(new T.PlaneGeometry(1,1),mat),mat:mat,mk:[]};
  grp.add(S.tm.bg);
  for(i=0;i<4;i++){
    mk=new T.Mesh(new T.PlaneGeometry(1,1),new T.MeshBasicMaterial({color:cols[i],side:T.DoubleSide,depthTest:false,depthWrite:false}));
    S.tm.mk.push(mk);grp.add(mk);
  }
  return grp;
}
function glskyLayoutTest(){
  var S=GLSKY,t=S.tm,s=Math.max(14,Math.round(Math.min(S.W,S.H)*.05)),h=s/2;
  if(!t)return;
  t.bg.scale.set(S.W,S.H,1);t.bg.position.set(S.W/2,S.H/2,0);
  [[h,h],[S.W-h,h],[h,S.H-h],[S.W-h,S.H-h]].forEach(function(p,i){t.mk[i].scale.set(s,s,1);t.mk[i].position.set(p[0],p[1],0.1);});
}


/* ---------- G1: daftar op + texture ---------- */
var GLSKY_VS='varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}';
/* highp WAJIB: uv di quad ~1800 px, mediump (10 bit) menggeser sampling beberapa piksel. uTex 0 = isi warna (uC sudah premultiplied), 1 = texture premultiplied x alpha (uC.a), 2 = vignette (hitam, alpha uC.a x kurva jarak dari pusat), 3 = MULTIPLY (texture premultiplied; faktor = 1 - a*(tex.a - tex.rgb), blend ZERO,SRC_COLOR = canvas 'multiply' di atas backdrop opak; uC.a = alpha) */
var GLSKY_FS='precision highp float;varying vec2 vUv;uniform sampler2D uMap;uniform vec4 uC;uniform float uTex;uniform float uB;void main(){if(uTex>2.5){vec4 t=texture2D(uMap,vUv,uB);gl_FragColor=vec4(vec3(1.0)-uC.a*(vec3(t.a)-t.rgb),1.0);}else if(uTex>1.5){vec2 p=(vUv-0.5)*2.0;gl_FragColor=vec4(0.0,0.0,0.0,uC.a*smoothstep(0.5,1.4,length(p)));}else gl_FragColor=uTex>0.5?texture2D(uMap,vUv,uB)*uC.a:uC;}';

function glskyCol(str){
  var c=GLSKY.col[str],a;
  if(c)return c;
  a=String(str).split(',');
  return (GLSKY.col[str]=[(+a[0]||0)/255,(+a[1]||0)/255,(+a[2]||0)/255]);
}
function glskyOp(){var S=GLSKY,o=S.ops[S.n];if(!o)o=S.ops[S.n]={};o.b=0;o.hi=0;S.n++;return o;}   /* [FIX] hi di-reset: objek op dipakai ulang antar frame, hi=1 sisa frame lalu bikin op lain (fill/vignette) ikut renderOrder 5100 */   /* b = bias LOD texture (0 = normal) */
/* isi layar penuh (pengganti g.fillRect(0,0,W,H) berwarna 'r,g,b' dgn globalAlpha a) */
function glskyFill(rgb,a){
  var o=glskyOp();o.k=0;o.c=glskyCol(rgb);o.a=a;o.add=0;o.cx=W*.5;o.cy=H*.5;o.w=W;o.h=H;o.rot=0;
}
/* DRIFT: sin/cos lambat (pola sama dgn plateDust di frame()). Kelas kanvas di-cache di c.__gld: 1 = plateDeep, 2 = sprite nebula/tint sektor, 3 = lainnya (tidak melayang) */
function glskyDriftClass(c){
  var k,d=c.__gld;
  if(d)return d;
  d=3;
  try{
    if(c===plateDeep)d=1;
    else{
      if(typeof NEB!=='undefined'&&NEB.tint)for(k in NEB.tint)if(NEB.tint[k]===c)d=2;
      if(d===3&&typeof SKYT!=='undefined')for(k in SKYT)if(SKYT[k]&&(SKYT[k].spr===c||SKYT[k].spr2===c))d=2;
    }
  }catch(e){}
  c.__gld=d;return d;
}
function glskyDrift(o,c){
  var S=GLSKY,d,t,sc,dx,dy,ua,uc,us,tx,per,amp,ph;
  if(!(S.drift>0))return;
  try{
    if(typeof reduce!=='undefined'&&reduce)return;
    d=glskyDriftClass(c);if(d>2)return;
    sc=S.drift;   /* sengaja TIDAK ikut SKY_DRIFT (itu =0: langit 2D diam); drift GL punya flag sendiri */
    t=S.now*.001;
    per=d===1?110:84;amp=(d===1?Math.min(6,(typeof plateM!=='undefined'?plateM:28)*.2):11)*sc;ph=d===1?1.3:4.1;   /* deep dibatasi ke 20% margin plate supaya tepi tidak terbuka */
    dx=Math.sin(t*6.2832/per+ph)*amp;dy=Math.cos(t*6.2832/(per*1.37)+ph)*amp*.6;
    if(STG.rot){ua=upAng();uc=Math.cos(ua);us=Math.sin(ua);tx=dx*uc-dy*us;dy=dx*us+dy*uc;dx=tx;}   /* landscape: melayang searah layar */
    o.cx+=dx;o.cy+=dy;
  }catch(e){}
}
/* gambar canvas c: pusat (cx,cy), ukuran w x h (px stage), rotasi rad (searah canvas.rotate), add=1 'lighter', add=2 'multiply' */
function glskyImg(c,a,cx,cy,w,h,rot,add,hi){
  var o=glskyOp();o.k=1;o.t=c;o.a=a;o.add=add===2?2:(add?1:0);o.cx=cx;o.cy=cy;o.w=w;o.h=h;o.rot=rot||0;o.hi=hi?1:0;   /* [PATCH G3d] hi=1 -> renderOrder 5100 */
  glskyDrift(o,c);
}
/* ekuivalen plateBlit(c,m,pw,ph,z,ox,oy) 02-sky-logic.js: zoom z di sekitar pusat layar + offset (ox,oy); alpha = g.globalAlpha saat dipanggil */
function glskyPlate(c,a,m,pw,ph,z,ox,oy){
  var cx=W*.5,cy=H*.5;
  glskyImg(c,a,cx+z*(-m+pw*.5-cx+ox),cy+z*(-m+ph*.5-cy+oy),z*pw,z*ph,0,0);
}
/* sumber texture Milky Way: gambar langsung kalau muat di GPU, kalau tidak diperkecil SEKALI ke kanvas (dicache di im.__glc). null = tidak bisa -> mwDraw menggambar 2D */
function glskyMWSrc(im){
  var S=GLSKY,w=im.naturalWidth||im.width,h=im.naturalHeight||im.height,cap=Math.min(S.maxTex||2048,4096),k,c,x;
  if(!w||!h)return null;
  if(w<=cap&&h<=cap){im.__glmip=1;return im;}
  if(im.__glc)return im.__glc;
  try{
    k=cap/Math.max(w,h);c=document.createElement('canvas');
    c.width=Math.max(1,Math.round(w*k));c.height=Math.max(1,Math.round(h*k));
    x=c.getContext('2d');x.imageSmoothingEnabled=true;x.imageSmoothingQuality='high';x.drawImage(im,0,0,c.width,c.height);
    c.__glmip=1;im.__glc=c;return c;
  }catch(e){return null;}
}
/* ekuivalen bagian gambar mwDraw (02-sky-logic.js): kanvas 2D = translate(pusat+pan*pf) scale(z) rotate(upAng bila landscape) rotate(-90 bila portrait) lalu tile di x0 (mirror = x dibalik), 'lighter'.
   Titik (x0,0) lokal -> pusat + z*x0*(cos th, sin th). Mengembalikan true kalau dicatat ke GL (mwDraw lalu return); false = mwDraw menggambar 2D seperti biasa. */
function glskyMW(im,a,tw,th,lw,z,port,rt){
  var S=GLSKY,src=glskyMWSrc(im),al=Math.min(1,a*MW.A),px=W*.5+skyPan.x*MW.pf,py=H*.5+skyPan.y*MW.pf,
      ang=(rt?upAng():0)+(port?-Math.PI/2:0),ca=Math.cos(ang),sa=Math.sin(ang),
      kMin=Math.floor((-lw*.5-MW.off)/tw)-1,kMax=Math.ceil((lw*.5-MW.off)/tw)+1,k,x0,flip,o;
  if(!src)return false;
  for(k=kMin;k<=kMax;k++){
    x0=k*tw+MW.off;flip=MW.mirror&&(((k%2)+2)%2===1);
    o=glskyOp();o.k=1;o.t=src;o.a=al;o.add=1;o.cx=px+z*x0*ca;o.cy=py+z*x0*sa;o.w=(flip?-1:1)*z*tw;o.h=z*th;o.rot=ang;o.b=-.5;
    if(S.mwSnap&&S.S>0){o.cx=Math.round(o.cx*S.S)/S.S;o.cy=Math.round(o.cy*S.S)/S.S;}
  }
  return true;
}
function glskyLive(c){
  var S=GLSKY,i,k;
  if(c===plateDeep||c===bgCanvas||c===gridCanvas)return true;
  if(typeof MW!=='undefined'&&MW.img&&(c===MW.img||c===MW.img.__glc))return true;   /* texture Milky Way: jangan ikut tersapu */
  for(i=0;i<plateDust.length;i++)if(plateDust[i].c===c)return true;
  if(typeof SS_SPR!=='undefined')for(k in SS_SPR)if(SS_SPR[k]===c)return true;   /* sprite goresan meteor (04-render.js ssSprite): jangan ikut tersapu, kalau tidak di-upload ulang tiap sapuan */
  if(typeof BH_SHOCK_SPR!=='undefined'&&(c===BH_SHOCK_SPR.c0||c===BH_SHOCK_SPR.c1))return true;   /* [PATCH G3d] sprite cincin BH shock */
  if(typeof SNFX!=='undefined'&&SNFX.spr){for(var _sk in SNFX.spr){var _ss=SNFX.spr[_sk];if(_ss&&(c===_ss.core||c===_ss.ring||c===_ss.streak||c===_ss.flash))return true;}}   /* [PATCH G3e] sprite supernova snBake */
  if(typeof RING_SPRITE_CACHE!=='undefined'){for(var _rk in RING_SPRITE_CACHE){var _rs=RING_SPRITE_CACHE[_rk];if(_rs&&_rs.c===c)return true;}}   /* [PATCH G3f] sprite cincin trigger/ripple */
  try{if(typeof PT3D!=='undefined'){if(PT3D.gl&&(c===PT3D.gl.sn||(PT3D.r&&c===PT3D.r.domElement)||c===PT3D.cc))return true;if(c===PT3D._glMouth)return true;}}catch(ePtL){}   /* [PATCH G4.2b] kanvas cincin+mulut portal */
  try{if(typeof BH!=='undefined'){if(c===BH.sprite)return true;}}catch(eBhL){}   /* [PATCH G4.3] sprite BH */
  if(c===GLF_PL)return true;   /* [PATCH G3h] sprite glow Pleiades fokus */
  if(typeof STAR_SPRITE_CACHE!=='undefined'){for(var _gk in STAR_SPRITE_CACHE){var _gs=STAR_SPRITE_CACHE[_gk];if(_gs&&_gs.c===c)return true;}}   /* [PATCH G3h] sprite glow bintang (avail/dust/BH blob) */
  if(typeof NEB!=='undefined'&&NEB.tint)for(k in NEB.tint)if(NEB.tint[k]===c)return true;
  if(typeof SKYT!=='undefined')for(k in SKYT)if(SKYT[k]&&(SKYT[k].spr===c||SKYT[k].spr2===c))return true;
  return false;
}
function glskyTex(c){
  var S=GLSKY,T=window.THREE,e=S.tx.get(c),v=c.__glv|0,t;
  if(e&&(e.v!==v||e.w!==c.width||e.h!==c.height)){e.t.dispose();S.tx.delete(c);e=null;}   /* isi/ukuran berubah (grid bake ulang): texture baru, jangan timpa storage lama */
  if(e&&c.__gldyn&&e.f!==S.st.fr){e.t.needsUpdate=true;e.f=S.st.fr;S.st.up++;}   /* [FIX] kanvas dinamis (mulut/cincin portal, ditandai __gldyn): isi berubah tiap frame -> upload ulang sekali per frame, texture dipakai ulang */
  if(!e){
    if(c.width>S.maxTex||c.height>S.maxTex){S.big=1;return null;}
    t=new T.CanvasTexture(c);
    t.flipY=false;t.premultiplyAlpha=true;t.generateMipmaps=false;t.minFilter=T.LinearFilter;t.magFilter=T.LinearFilter;
    if(c.__glmip){t.generateMipmaps=true;t.minFilter=T.LinearMipmapLinearFilter;}   /* gambar besar yang diperkecil (Milky Way): mipmap supaya tidak berkilau saat bergulir */
    e={t:t,v:v,w:c.width,h:c.height,f:S.st.fr};S.tx.set(c,e);S.st.up++;
  }
  return e.t;
}
function glskySweep(){   /* buang texture yang canvas-nya sudah tidak dipakai (bake ulang / resize); dipanggil jarang */
  var S=GLSKY,dead=[];
  S.tx.forEach(function(e,c){if(!glskyLive(c))dead.push(c);});
  dead.forEach(function(c){try{S.tx.get(c).t.dispose();}catch(e){}S.tx.delete(c);});
  S.st.tex=S.tx.size;
}
/* ---------- G2+G3: bintang & garis rasi (instancing) ----------
   Satuan = piksel CSS ruang stage (sama dgn plateBlit dll). Warna premultiplied, blend ONE,1-SRCA = source-over canvas 2D. */
var GLSKY_STAR_VS='attribute vec4 iA;attribute vec4 iG;attribute vec4 iC;uniform float uS;varying vec4 vG;varying vec4 vC;varying vec2 vR;varying vec2 vQ;'+
  'void main(){float h=max(iA.z,iA.w+1.0/uS);vec2 q=position.xy*2.0*h;vQ=q;vR=iA.zw;vG=iG;vC=iC;'+
  'gl_Position=projectionMatrix*modelViewMatrix*vec4(iA.xy+q,0.0,1.0);}';
/* profil halo = sprite lama: stop .9 / .34 / 0 di 0 / .25 / 1 radius; inti = lingkaran padat, tepi 1 px perangkat; inti di atas halo (sama dgn STGL_FS) */
var GLSKY_STAR_FS='precision highp float;uniform float uS;varying vec4 vG;varying vec4 vC;varying vec2 vR;varying vec2 vQ;'+
  'void main(){float d=length(vQ);float t=clamp(d/max(vR.x,0.001),0.0,1.0);'+
  'float gp=(t<0.25)?mix(0.9,0.34,t*4.0):mix(0.34,0.0,(t-0.25)*1.33333);'+
  'float ga=vG.a*gp;float ca=vC.a*clamp((vR.y-d)*uS+0.5,0.0,1.0);'+
  'vec3 col=vC.rgb*ca+vG.rgb*ga*(1.0-ca);gl_FragColor=vec4(col,ca+ga*(1.0-ca));}';
/* garis: satu quad per ruas (titik sampel lensa berurutan). iP = x0,y0,x1,y1; iL = rgb + alpha; iW = lebar, lembut(0/1) */
var GLSKY_LINE_VS='attribute vec4 iP;attribute vec4 iL;attribute vec2 iW;uniform float uS;varying vec4 vL;varying vec2 vE;varying float vSoft;'+
  'void main(){vec2 a=iP.xy;vec2 d=iP.zw-a;float len=length(d);vec2 dir=len>0.0001?d/len:vec2(1.0,0.0);vec2 nr=vec2(-dir.y,dir.x);'+
  'float hw=iW.x*0.5+1.0/uS;vec2 p=a+d*(position.x+0.5)+nr*position.y*2.0*hw;'+
  'vL=iL;vE=vec2(position.y*2.0*hw,iW.x*0.5);vSoft=iW.y;'+
  'gl_Position=projectionMatrix*modelViewMatrix*vec4(p,0.0,1.0);}';
var GLSKY_LINE_FS='precision highp float;uniform float uS;uniform float uSoft;varying vec4 vL;varying vec2 vE;varying float vSoft;'+
  'void main(){float e=abs(vE.x);float hw=max(vE.y,0.001);float pr=clamp((hw-e)*uS+0.5,0.0,1.0);'+
  'if(vSoft*uSoft>0.5)pr=pow(max(1.0-e/hw,0.0),1.5)*2.5;'+           /* glow: tepi lembut, integral lebar ~ sama dgn goresan keras */
  'float al=min(1.0,vL.a*pr);gl_FragColor=vec4(vL.rgb*al,al);}';

function glskyInstGeo(T,specs,cap){
  var S=GLSKY,ig=new T.InstancedBufferGeometry(),arr={},i,sp;
  ig.index=S.geo.index;ig.setAttribute('position',S.geo.attributes.position);
  for(i=0;i<specs.length;i++){sp=specs[i];arr[sp[0]]=new Float32Array(cap*sp[1]);ig.setAttribute(sp[0],new T.InstancedBufferAttribute(arr[sp[0]],sp[1]).setUsage(T.DynamicDrawUsage));}
  ig.instanceCount=0;
  return {g:ig,a:arr,cap:cap,specs:specs};
}
function GLSKY_T_MESH(T,B,vs,fs,uni,order){
  var m=new T.Mesh(B.g,new T.ShaderMaterial({uniforms:uni,vertexShader:vs,fragmentShader:fs,transparent:true,depthTest:false,depthWrite:false,side:T.DoubleSide,
    blending:T.CustomBlending,blendEquation:T.AddEquation,blendSrc:T.OneFactor,blendDst:T.OneMinusSrcAlphaFactor}));
  m.frustumCulled=false;m.visible=false;m.renderOrder=order;
  return m;
}
function glskyInstBuild(T){
  var S=GLSKY;
  S.bs=glskyInstGeo(T,[['iA',4],['iG',4],['iC',4]],1536);    /* bintang: kapasitas 1536 (sisa dibuang diam-diam) */
  S.bl=glskyInstGeo(T,[['iP',4],['iL',4],['iW',2]],6144);    /* ruas garis: kapasitas 6144 */
  S.ml=GLSKY_T_MESH(T,S.bl,GLSKY_LINE_VS,GLSKY_LINE_FS,{uS:{value:1},uSoft:{value:1}},5000);   /* renderOrder 5000+ = di atas semua op latar (10+i) dan vignette */
  S.ms=GLSKY_T_MESH(T,S.bs,GLSKY_STAR_VS,GLSKY_STAR_FS,{uS:{value:1}},5001);
  S.layers.add(S.ml);S.layers.add(S.ms);
  S.inst=true;
}
function glskyStarsOn(){var S=GLSKY;return !!(S.act&&S.lay&&S.starOn&&S.inst&&!CAMERA_MODE);}
function glskyLinesOn(){var S=GLSKY;return !!(S.act&&S.lay&&S.lineOn&&S.inst);}
/* G3c: meteor acak (drawShooting, mode sprite ?ss=2) = quad texture lewat glskyImg; tidak butuh mesh instancing dan tetap di mode kamera (di 2D pun meteor di bawah garis/bintang) */
function glskyShootOn(){var S=GLSKY;return !!(S.act&&S.lay&&S.ssOn);}
/* x,y = posisi layar; Rg = radius halo (0 = tanpa halo), gc/ga = 'r,g,b' + alpha halo; rc = radius inti, cc/ca = warna + alpha inti (0 = tanpa inti). Argumen = stglPush */
function glskyStar(x,y,Rg,gc,ga,rc,cc,ca){
  var S=GLSKY,B=S.bs,n=S.sn,a,o,c;
  if(!B||n>=B.cap)return;
  a=B.a;o=n*4;
  a.iA[o]=x;a.iA[o+1]=y;a.iA[o+2]=Rg;a.iA[o+3]=ca>0?rc:0;
  c=glskyCol(gc);a.iG[o]=c[0];a.iG[o+1]=c[1];a.iG[o+2]=c[2];a.iG[o+3]=ga;
  c=glskyCol(cc);a.iC[o]=c[0];a.iC[o+1]=c[1];a.iC[o+2]=c[2];a.iC[o+3]=ca;
  S.sn=n+1;
}
function glskySeg(x0,y0,x1,y1,w,c,al,soft){
  var S=GLSKY,B=S.bl,n=S.ln,a,o;
  if(!B||n>=B.cap)return;
  a=B.a;o=n*4;
  a.iP[o]=x0;a.iP[o+1]=y0;a.iP[o+2]=x1;a.iP[o+3]=y1;
  a.iL[o]=c[0];a.iL[o+1]=c[1];a.iL[o+2]=c[2];a.iL[o+3]=al>1?1:(al<0?0:al);
  a.iW[n*2]=w;a.iW[n*2+1]=soft;
  S.ln=n+1;
}
/* ekuivalen polyline g.stroke() di drawCons: ruas hanya antara dua sampel BERURUTAN yang sama-sama hidup (sampel mati = putus, seperti moveTo) */
function glskyPoly(xs,ys,alive,samples,w,rgb,al,soft){
  var c=glskyCol(rgb),i;
  for(i=1;i<=samples;i++)if(alive[i-1]&&alive[i])glskySeg(xs[i-1],ys[i-1],xs[i],ys[i],w,c,al,soft);
}
/* ---------- G3h: efek kecil ---------- */
var GLF_X=[],GLF_Y=[],GLF_A=[],GLF_PL=null;
function glfArc(cx,cy,r,a0,a1,w,rgb,al){   /* goresan busur (ekuivalen g.arc + stroke) */
  var n,i,a;
  if(!(al>.004)||!(r>.5))return;
  n=Math.max(6,Math.min(64,Math.ceil(Math.abs(a1-a0)*r/5)));
  for(i=0;i<=n;i++){a=a0+(a1-a0)*i/n;GLF_X[i]=cx+Math.cos(a)*r;GLF_Y[i]=cy+Math.sin(a)*r;GLF_A[i]=1;}
  glskyPoly(GLF_X,GLF_Y,GLF_A,n,w,rgb,al,0);
}
function glfDot(x,y,r,rgb,al){if(al>.004)glskyStar(x,y,0,'0,0,0',0,r,rgb,al);}   /* lingkaran padat (ekuivalen arc + fill) */
function glfLine(x0,y0,x1,y1,w,rgb,al){if(al>.004)glskySeg(x0,y0,x1,y1,w,glskyCol(rgb),al,0);}
function glfPlSprite(){   /* gradien glow bintang Pleiades fokus (sama stop dgn drawFocusFx 2D), alpha dasar 1 -> dikali al lewat glskyImg */
  var c,x,gr;
  if(GLF_PL)return GLF_PL;
  c=document.createElement('canvas');c.width=c.height=64;x=c.getContext('2d');
  gr=x.createRadialGradient(32,32,0,32,32,32);
  gr.addColorStop(0,'rgba(235,242,255,.55)');gr.addColorStop(.4,'rgba(145,170,255,.22)');gr.addColorStop(1,'rgba(145,170,255,0)');
  x.fillStyle=gr;x.fillRect(0,0,64,64);
  return (GLF_PL=c);
}
/* reticle drawTargetLock: cincin putus-putus (dash 3/3 mulai sudut 0) + 4 bracket sudut diputar rot; teks telemetri tetap 2D */
function glskyLockReticle(x,y,sz,rot,rgb){
  var R=sz+5,n=Math.max(6,Math.floor(6.2832*R/6)),k,i,a0,a1,L=5,ca=Math.cos(rot),sa=Math.sin(rot),p,q0x,q0y,q1x,q1y,c=glskyCol(rgb),cw=glskyCol('234,246,255');
  var P=[[-sz,-sz+L,-sz,-sz,-sz+L,-sz],[sz-L,-sz,sz,-sz,sz,-sz+L],[sz,sz-L,sz,sz,sz-L,sz],[-sz+L,sz,-sz,sz,-sz,sz-L]];
  for(k=0;k<n;k++){a0=k*6/R;a1=(k*6+3)/R;glskySeg(x+Math.cos(a0)*R,y+Math.sin(a0)*R,x+Math.cos(a1)*R,y+Math.sin(a1)*R,1,c,.6,0);}
  for(k=0;k<4;k++){
    p=P[k];
    for(i=0;i<2;i++){
      q0x=p[i*2];q0y=p[i*2+1];q1x=p[i*2+2];q1y=p[i*2+3];
      glskySeg(x+q0x*ca-q0y*sa,y+q0x*sa+q0y*ca,x+q1x*ca-q1y*sa,y+q1x*sa+q1y*ca,1.2,cw,.85,0);
    }
  }
}
/* drawFocusFx (01-core.js) versi GL: logika sama, hanya perintah gambarnya jadi glsky*. Pemanggil memastikan glskyFxOn(). */
function glskyFocusFx(now){
  var id=FFX.id,t,i,q,A,B,segs=[],rgb='110,229,255';
  if(!id||!CAMERA_MODE||reduce)return;
  t=now-FFX.t0;
  if(id==='bh'){
    var bp=camBH(),R=BH.Rr*BHZ,pal=BH_FX_PAL[BAND]||BH_FX_PAL.vis,rr=R*pal.rm;
    if(R>=1&&t<2800){
      var u=Math.min(1,t/1200),e=u*u*(3-2*u),al=t<1200?1:Math.max(0,1-(t-1200)/1600),a0=-1.5708,a1=a0+6.2832*e;
      glfArc(bp[0],bp[1],rr,a0,a1,pal.gw,pal.gc,pal.ga*al);
      glfArc(bp[0],bp[1],rr,a0,a1,pal.lw,pal.lc,pal.la*al);
      if(u<1)glfDot(bp[0]+Math.cos(a1)*rr,bp[1]+Math.sin(a1)*rr,3.2,pal.hc,.95);
    }
    if(BAND==='ir'&&R>=1){
      var fi=Math.min(1,t/900),j,ra,an,ox2,oy2;
      for(j=0;j<4;j++){
        ra=R*(1.9+.55*j);an=t*.0016/(1+.55*j)+j*1.7;
        ox2=bp[0]+Math.cos(an)*ra;oy2=bp[1]+Math.sin(an)*ra*.62;
        glfDot(ox2,oy2,5,'255,170,110',.16*fi);
        glfDot(ox2,oy2,1.7,'255,226,196',.8*fi);
      }
    }
    return;
  }
  if(id==='pleiades'){
    if(!PLEIADES.ready)return;
    var ox=mouse.x*1.4+skyPan.x,oy=mouse.y*1.0+skyPan.y,pts=PLEIADES.bright.slice().sort(function(a,b){return a.x-b.x;}),nn=pts.length,per=Math.min(320,2400/Math.max(nn,1)),dur=1100,spr=glfPlSprite();
    for(i=0;i<nn;i++){
      q=gSky(PLEIADES.x+pts[i].x*PLEIADES.scale+ox,PLEIADES.y+pts[i].y*PLEIADES.scale+oy);
      if(!q||q[2]>=1)continue;
      var ts=t-420-i*per,al2=0,sc=1;if(ts<0)continue;
      if(ts<dur){var u2=ts/dur;al2=Math.sin(u2*Math.PI);sc=1+.9*al2;}
      else al2=.2+.14*Math.sin(t*.0021+i*1.9);
      var r=(3+7*al2)*sc,L=(7+16*al2)*sc;
      glskyImg(spr,Math.min(1,al2),q[0],q[1],r*5.2,r*5.2,0,1,1);
      glfLine(q[0]-L,q[1],q[0]+L,q[1],1,'225,236,255',.8*al2);
      glfLine(q[0],q[1]-L,q[0],q[1]+L,1,'225,236,255',.8*al2);
    }
    return;
  }
  var c=cons(id);if(!c||!linesVisible(c))return;
  for(i=0;i<c.lines.length;i++){
    A=c.stars[c.lines[i][0]];B=c.stars[c.lines[i][1]];if(!A||!B)continue;
    var qa=gSky(A.x+c.ox,A.y+c.oy),qb=gSky(B.x+c.ox,B.y+c.oy);
    if(qa&&qb)segs.push([[qa[0],qa[1],qa[2]],[qb[0],qb[1],qb[2]]]);
  }
  var n=segs.length;if(!n)return;
  var per2=Math.min(190,1900/n),dur2=per2*1.5,tEnd=420+(n-1)*per2+dur2;
  var glow=t<tEnd?1:Math.max(.32,1-(t-tEnd)/1600*.68);
  for(i=0;i<n;i++){
    var s0=segs[i][0],s1=segs[i][1];if(s0[2]>=1||s1[2]>=1)continue;
    var ts2=t-420-i*per2;if(ts2<0)continue;
    var p=Math.min(1,ts2/dur2);p=p*p*(3-2*p);
    var ex=s0[0]+(s1[0]-s0[0])*p,ey=s0[1]+(s1[1]-s0[1])*p;
    glfLine(s0[0],s0[1],ex,ey,4.2,rgb,.13*glow);
    glfLine(s0[0],s0[1],ex,ey,1.1,'225,248,255',.78*glow);
    if(ts2<520){var pu=ts2/520;glfArc(s0[0],s0[1],3+11*pu,0,6.2832,1,rgb,.7*(1-pu));}
    if(p<1)glfDot(ex,ey,2.6,'255,255,255',.95);
    else if(ts2-dur2<520){var pu2=(ts2-dur2)/520;glfArc(s1[0],s1[1],3+11*pu2,0,6.2832,1,rgb,.7*(1-pu2));}
  }
}
function glskyInstUpload(B,m,n){
  var k,at;
  m.visible=n>0;B.g.instanceCount=n;
  if(!n)return;
  for(k in B.a){at=B.g.attributes[k];try{at.clearUpdateRanges();at.addUpdateRange(0,n*at.itemSize);}catch(e){}at.needsUpdate=true;}
}
function glskyInstFlush(){
  var S=GLSKY;
  if(!S.inst)return;
  S.ml.material.uniforms.uS.value=S.S;S.ml.material.uniforms.uSoft.value=S.soft?1:0;
  S.ms.material.uniforms.uS.value=S.S;
  glskyInstUpload(S.bl,S.ml,S.ln);glskyInstUpload(S.bs,S.ms,S.sn);
}

function glskyMesh(i){
  var S=GLSKY,T=window.THREE,m;
  m=new T.Mesh(S.geo,new T.ShaderMaterial({
    uniforms:{uMap:{value:S.dummy},uC:{value:new T.Vector4(0,0,0,1)},uTex:{value:0},uB:{value:0}},
    vertexShader:GLSKY_VS,fragmentShader:GLSKY_FS,
    transparent:true,depthTest:false,depthWrite:false,side:T.DoubleSide,
    blending:T.CustomBlending,blendEquation:T.AddEquation,blendSrc:T.OneFactor,blendDst:T.OneMinusSrcAlphaFactor}));
  m.frustumCulled=false;m.renderOrder=10+i;m.__ro=10+i;
  S.layers.add(m);S.mesh[i]=m;
  return m;
}
function glskyApply(m,o){
  var S=GLSKY,T=window.THREE,u=m.material.uniforms,a=o.a,tx;
  if(o.k===2){u.uTex.value=2;u.uC.value.set(0,0,0,a);}
  else if(o.k){
    tx=glskyTex(o.t);
    if(!tx){m.visible=false;return;}
    u.uMap.value=tx;u.uTex.value=o.add===2?3:1;u.uB.value=o.b||0;u.uC.value.set(0,0,0,a);
  }else{
    u.uTex.value=0;u.uC.value.set(o.c[0]*a,o.c[1]*a,o.c[2]*a,a);
  }
  if(o.add===2){m.material.blendSrc=200;m.material.blendDst=202;}   /* multiply: ZeroFactor, SrcColorFactor (tidak diekspor three-entry, angka standar three) */
  else{m.material.blendSrc=T.OneFactor;m.material.blendDst=o.add?T.OneFactor:T.OneMinusSrcAlphaFactor;}
  /* [PATCH G3d] o.hi = FX aditif di atas bintang/garis (BH shock 5100); meteor/tint tetap renderOrder mesh (10+i) */
  m.renderOrder=o.hi?5100:m.__ro;   /* [FIX] selalu di-set ulang: dulu sekali 5100 tetap 5100 walau op di index itu bukan hi lagi (vignette/plate jadi menimpa bintang) */
  m.position.set(o.cx,o.cy,0);m.rotation.z=o.rot;m.scale.set(o.w,o.h,1);
  m.visible=true;
}


/* [PATCH G4.1] API unit 3D: attach Group ke scene GLSky (satu renderer, satu scene).
   renderOrder usul: latar op 10+i, batu belakang 200, garis/bintang 5000+. */
function glskyAttach(grp, order){
  var S=GLSKY,i;
  if(!S.root||!grp)return false;
  for(i=0;i<S.units.length;i++)if(S.units[i]===grp){grp.renderOrder=order|0;return true;}
  try{
    if(grp.parent)grp.parent.remove(grp);
    grp.renderOrder=order|0;
    S.root.add(grp);
    S.units.push(grp);
    return true;
  }catch(e){try{console.warn('[glsky] attach gagal',e);}catch(e2){}return false;}
}
function glskyDetach(grp){
  var S=GLSKY,i;
  if(!grp)return;
  for(i=S.units.length-1;i>=0;i--)if(S.units[i]===grp)S.units.splice(i,1);
  try{if(grp.parent===S.root)S.root.remove(grp);}catch(e){}
}
/* [FIX G4.5] PASS ATAS: unit yang harus selalu di atas semua isi GL (teleskop) tidak boleh ikut scene utama. Di scene utama latar/bintang/garis = material transparan depthTest:false,
   sedangkan badan teleskop opaque; three menggambar daftar opaque DULU, jadi latar menimpa badan (cuma pod kaca/glow/api yang transparan kelihatan = "badan transparan", di sektor hilang).
   Juga kamera utama y-ke-bawah (top=0,bottom=H) = refleksi, jadi cull FrontSide + normal DoubleSide ikut terbalik. Solusi: scene + kamera y-ke-ATAS sendiri, dirender sesudah scene utama
   (depth dibersihkan, color tidak). Koordinat Group di scene ini: x = x layar, y = H - y layar (pakai GLSKY.tCam.top), rotasi z = -sudut layar. */
function glskyAttachTop(grp){
  var S=GLSKY,i;
  if(!S.tScene||!grp)return false;
  for(i=0;i<S.tUnits.length;i++)if(S.tUnits[i]===grp)return true;
  try{
    if(grp.parent)grp.parent.remove(grp);
    S.tScene.add(grp);S.tUnits.push(grp);
    return true;
  }catch(e){try{console.warn('[glsky] attachTop gagal',e);}catch(e2){}return false;}
}
function glskyDetachTop(grp){
  var S=GLSKY,i;
  if(!grp)return;
  for(i=S.tUnits.length-1;i>=0;i--)if(S.tUnits[i]===grp)S.tUnits.splice(i,1);
  try{if(S.tScene&&grp.parent===S.tScene)S.tScene.remove(grp);}catch(e){}
}
/* [G4.6] OVERLAY teleskop untuk terowongan wormhole. Terowongan (09-wormhole.js) = kanvas 2D #wh-canvas z 13 DI ATAS #sky dan di atas kanvas GL, jadi pass atas GLSky (di bawah #sky) tertutup.
   Solusi tanpa blit/drawImage: kanvas GL kedua (#glscope, z 14, transparan, seukuran jendela, koordinat = koordinat layar asli yang dipakai #wh-canvas) dengan renderer + scene + kamera y-ke-atas sendiri.
   Hanya hidup selama dive (dibuat malas saat teleskop pertama masuk terowongan). Alpha = CSS opacity kanvas (sama dengan globalAlpha 2D: satu kesatuan, bukan per material); potong setengah-bidang (keluar portal) = CSS clip-path
   (build three kita tidak punya Plane untuk clippingPlanes). Selesai dive: Group dikembalikan ke pass atas GLSky (tele3dGlLeave/tele3dGl di 13-scope3d.js). Gagal / konteks hilang >=3x -> jalur 2D lama (tele3dBody). */
function glskyOvEnsure(){
  var S=GLSKY,T=window.THREE,c,r;
  if(S.oR)return !!S.oOk;
  if(S.oErr>=3||!T||!S.ok||!S.act||!document.body)return false;
  try{
    c=document.createElement('canvas');c.id='glscope';c.setAttribute('aria-hidden','true');
    c.style.cssText='position:fixed;left:0;top:0;width:100%;height:100%;display:none;pointer-events:none;touch-action:none;z-index:14';
    document.body.appendChild(c);
    r=new T.WebGLRenderer({canvas:c,alpha:true,premultipliedAlpha:true,antialias:true,depth:true,stencil:false,preserveDrawingBuffer:false,powerPreference:'low-power'});
    r.autoClear=true;r.toneMapping=T.ACESFilmicToneMapping;r.toneMappingExposure=1.0;r.setClearColor(0x000000,0);
    c.addEventListener('webglcontextlost',function(e){
      try{e.preventDefault();}catch(x){}
      S.oOk=false;S.oErr++;glskyOvHide();
    },false);
    c.addEventListener('webglcontextrestored',function(){if(S.oErr<3){S.oPw=S.oPh=0;S.oOk=true;}},false);
    S.oScene=new T.Scene();S.oCam=new T.OrthographicCamera(0,1,1,0,-600,600);S.oCam.position.z=5;
    S.oCv=c;S.oR=r;S.oPw=S.oPh=0;S.oOk=true;
    return true;
  }catch(e){
    S.oErr=3;S.oOk=false;
    try{if(c&&c.parentNode)c.parentNode.removeChild(c);}catch(e2){}
    S.oR=null;S.oCv=null;
    try{console.warn('[glsky] overlay teleskop gagal',e);}catch(e3){}
    return false;
  }
}
function glskyOvAttach(grp){
  var S=GLSKY;
  if(!S.oScene||!grp)return false;
  try{if(grp.parent)grp.parent.remove(grp);S.oScene.add(grp);return true;}catch(e){return false;}
}
function glskyOvDetach(grp){
  var S=GLSKY;
  try{if(S.oScene&&grp&&grp.parent===S.oScene)S.oScene.remove(grp);}catch(e){}
}
function glskyOvHide(){
  var c=GLSKY.oCv;
  if(c){c.style.display='none';c.style.opacity='1';c.style.clipPath='';}
}
/* w,h = ukuran jendela (CSS px, sama dengan #wh-canvas); opacity 0..1; clip = string clip-path CSS atau '' */
function glskyOvDraw(w,h,opacity,clip){
  var S=GLSKY,c=S.oCv,r=S.oR,d,pw,ph;
  if(!c||!r||!S.oOk)return false;
  d=Math.min(window.devicePixelRatio||1,2);pw=Math.max(2,Math.round(w*d));ph=Math.max(2,Math.round(h*d));
  if(pw!==S.oPw||ph!==S.oPh){r.setPixelRatio(1);r.setSize(pw,ph,false);S.oPw=pw;S.oPh=ph;}
  if(S.oCam.right!==w||S.oCam.top!==h){S.oCam.left=0;S.oCam.right=w;S.oCam.top=h;S.oCam.bottom=0;S.oCam.updateProjectionMatrix();}
  c.style.opacity=opacity>=.995?'1':opacity.toFixed(3);
  c.style.clipPath=clip||'';
  if(c.style.display!=='block')c.style.display='block';
  try{r.render(S.oScene,S.oCam);}catch(e){S.oErr++;S.oOk=false;glskyOvHide();return false;}
  return true;
}
/* [G4.7] LAYER DRONE. Planet masih blit 2D di #sky dan drone TX/RX digambar SETELAH planet (berdiri di permukaan), jadi drone di scene utama (di bawah #sky) akan tertutup planet saat
   mendarat/orbit di depannya. Solusi sementara: kanvas GL ketiga #gldrone, anak #stage tepat SESUDAH #sky (di atasnya, tetap di bawah elemen DOM lain seperti dulu), renderer + scene +
   kamera y-ke-atas sendiri (antialias true, ACES, exposure 1.05 = renderer 'small' lama). Hanya hidup saat drone ada di layar (kanvas display:none kalau tidak). Begitu planet pindah ke GL,
   Group drone cukup dipindah ke pass atas scene utama (glskyAttachTop) dan layer ini dihapus. Koordinat Group: x = x layar, y = H - y layar (sama dgn pass atas). Gagal / konteks hilang >=3x
   / GL mati => drone balik ke blit 2D (drone3dDraw return false). */
function glskyDrOn(){var S=GLSKY;return !!(S.drOn&&S.act&&S.ok&&S.dOk&&S.dErr<3);}
function glskyDrWant(){var S=GLSKY;return !!(S.drOn&&S.act&&S.ok&&!S.dR&&S.dErr<3);}
function glskyDrHide(){var S=GLSKY;if(S.dCv&&S.dShown){S.dCv.style.display='none';}S.dShown=false;}
function glskyDrEnsure(){
  var S=GLSKY,T=window.THREE,c,r;
  if(S.dOk)return true;
  if(S.dR||S.dErr>=3||!T||!S.ok||!S.act||!cv||!cv.parentNode)return false;
  try{
    c=document.createElement('canvas');c.id='gldrone';c.setAttribute('aria-hidden','true');
    c.style.cssText='position:fixed;left:0;top:0;width:100%;height:100%;display:none;pointer-events:none;touch-action:none';
    r=new T.WebGLRenderer({canvas:c,alpha:true,premultipliedAlpha:true,antialias:true,depth:true,stencil:false,preserveDrawingBuffer:false,powerPreference:'low-power'});
    r.setPixelRatio(1);r.autoClear=true;r.setClearColor(0x000000,0);
    r.outputColorSpace=T.SRGBColorSpace;r.toneMapping=T.ACESFilmicToneMapping;r.toneMappingExposure=1.05;   /* sama dgn threeGLMake (tone) + expo drone di threeGLGet */
    c.addEventListener('webglcontextlost',function(e){
      try{e.preventDefault();}catch(x){}
      S.dOk=false;S.dErr++;glskyDrHide();
    },false);
    c.addEventListener('webglcontextrestored',function(){if(S.dErr<3){S.dPw=S.dPh=0;S.dOk=true;}},false);
    S.dScene=new T.Scene();S.dCam=new T.OrthographicCamera(0,1,1,0,-600,600);S.dCam.position.z=5;
    S.dCv=c;S.dR=r;S.dPw=S.dPh=0;S.dShown=false;S.dOk=true;
    cv.parentNode.insertBefore(c,cv.nextSibling);   /* tepat SESUDAH #sky => di atasnya */
    glskyMirror();
    return true;
  }catch(e){
    S.dErr=3;S.dOk=false;
    try{if(c&&c.parentNode)c.parentNode.removeChild(c);}catch(e2){}
    S.dR=null;S.dCv=null;
    try{console.warn('[glsky] layer drone gagal, drone tetap blit 2D:',e);}catch(e3){}
    return false;
  }
}
function glskyDrAttach(grp){var S=GLSKY;if(!S.dScene||!grp)return false;try{S.dScene.add(grp);return true;}catch(e){return false;}}
function glskyDrDetach(grp){var S=GLSKY;try{if(S.dScene&&grp&&grp.parent===S.dScene)S.dScene.remove(grp);}catch(e){}}
/* show=false: sembunyikan kanvas (tidak ada drone frame ini). true: ukur + render scene. false dikembalikan kalau gagal (pemanggil jatuh ke 2D di frame berikut) */
function glskyDrDraw(show){
  var S=GLSKY,r=S.dR,c=S.dCv;
  if(!r||!S.dOk)return false;
  if(!show){glskyDrHide();return true;}
  try{
    if(S.dPw!==S.pw||S.dPh!==S.ph){r.setPixelRatio(1);r.setSize(S.pw,S.ph,false);S.dPw=S.pw;S.dPh=S.ph;}
    if(S.dCam.right!==S.W||S.dCam.top!==S.H){S.dCam.left=0;S.dCam.right=S.W;S.dCam.top=S.H;S.dCam.bottom=0;S.dCam.updateProjectionMatrix();}
    if(!S.dShown){c.style.display='block';S.dShown=true;}
    r.render(S.dScene,S.dCam);
  }catch(e){S.dErr++;S.dOk=false;glskyDrHide();return false;}
  return true;
}
function glskyDrKill(){
  var S=GLSKY;
  S.dOk=false;S.dErr=3;
  try{if(S.dCv)S.dCv.style.display='none';}catch(e){}
  S.dShown=false;
  try{if(S.dR)S.dR.dispose();}catch(e2){}
  S.dR=null;
}
/* capture langit: kanvas drone ada di ATAS #sky, jadi digambar SESUDAH drawImage(#sky) di snapCompose (01-core.js). Render ulang sekarang (preserveDrawingBuffer:false) lalu drawImage. */
function glskySnapTop(x,dx,dy,dw,dh){
  var S=GLSKY;
  if(!S.dShown||!S.dOk||!S.dR)return false;
  try{S.dR.render(S.dScene,S.dCam);x.drawImage(S.dCv,dx,dy,dw,dh);return true;}catch(e){return false;}
}
/* render scene utama + pass atas. Dipakai glskyFlush dan glskySnap. */
function glskyRenderAll(){
  var S=GLSKY,i,u,any=false;
  S.r.render(S.scene,S.cam);
  for(i=0;i<S.tUnits.length;i++)if(S.tUnits[i].visible){any=true;break;}
  if(!any)return;
  S.r.autoClear=false;
  try{S.r.clearDepth();S.r.render(S.tScene,S.tCam);}
  finally{S.r.autoClear=true;}
}
function glskyAstOn(){var S=GLSKY;return !!(S.act&&S.astOn&&S.ok&&S.r);}   /* [PATCH G4.1] true = batu belakang boleh ikut scene GL */
function glskyBhShockOn(){var S=GLSKY;return !!(S.act&&S.rec&&S.lay&&S.bhShockOn&&S.ok&&S.r);}   /* [PATCH G3d] true = BH shockwaves digambar di GL */
function glskySnOn(){var S=GLSKY;return !!(S.act&&S.rec&&S.lay&&S.snOn&&S.ok&&S.r);}   /* [PATCH G3e] true = supernova/belt digambar di GL */
function glskyTrigOn(){var S=GLSKY;return !!(S.act&&S.rec&&S.lay&&S.trigOn&&S.ok&&S.r);}   /* [FIX] +rec: drawRipple dipanggil juga setelah flush (drawTargetLock, drawHole 2D) -> harus tetap 2D */   /* [PATCH G3f] true = trigger ripple / pulse shock di GL */
function glskyPleiOn(){var S=GLSKY;return !!(S.act&&S.rec&&S.lay&&S.starOn&&S.pleiOn&&S.inst&&!CAMERA_MODE);}   /* [PATCH G3g] Pleiades halo+inti di mesh bintang GL */
function glskyPortalOn(){var S=GLSKY;return !!(S.act&&S.rec&&S.lay&&S.portalOn&&S.ok&&S.r);}   /* [PATCH G4.2] true = cincin portal overview ke GL billboard */
function glskyFxOn(){var S=GLSKY;return !!(S.act&&S.rec&&S.lay&&S.fxOn&&S.inst&&S.ok&&S.r);}   /* [PATCH G3h] true = efek kecil (avail/dust/focus/lock) boleh dicatat ke GL; false di luar jendela rekam */
function glskyBhOn(){var S=GLSKY;return !!(S.act&&S.rec&&S.lay&&S.bhOn&&S.ok&&S.r);}   /* [PATCH G4.3] true = body BH ke GL */

function glskyBuild(){
  var S=GLSKY,T=window.THREE,c,r;
  if(S.err>=3||S.r)return;
  try{
    c=document.createElement('canvas');c.id='glsky';c.setAttribute('aria-hidden','true');
    c.style.cssText='position:fixed;left:0;top:0;width:100%;height:100%;display:block;pointer-events:none;touch-action:none';
    r=new T.WebGLRenderer({canvas:c,alpha:true,premultipliedAlpha:true,antialias:false,depth:true,stencil:false,preserveDrawingBuffer:false,powerPreference:'low-power'});   /* [PATCH G4.1] depth:true supaya unit 3D (batu) bisa depthTest; lapisan 2D-style tetap depthTest:false */
    r.setPixelRatio(1);
    r.autoClear=true;r.toneMapping=T.ACESFilmicToneMapping;r.toneMappingExposure=1.0;   /* [G4.5] sama dgn renderer 'small' (threeGLGet tone): teleskop 3D di scene ini; ShaderMaterial GLSky tanpa chunk tonemapping tidak terpengaruh */
    c.addEventListener('webglcontextlost',function(e){
      try{e.preventDefault();}catch(x){}
      S.ok=false;S.act=false;S.st.lost++;S.err++;
      if(S.err>=3){glskyFail('webglcontextlost x'+S.err);return;}
      glskyShow(false);   /* 2D menggambar semuanya lagi sampai konteks pulih */
    },false);
    c.addEventListener('webglcontextrestored',function(){
      if(S.err>=3)return;
      S.tx.forEach(function(e){try{e.t.dispose();}catch(x){}});S.tx.clear();   /* texture lama hilang bersama konteks: unggah ulang saat dipakai */
      S.W=S.H=S.pw=S.ph=0;S.ok=true;glskyShow(true);   /* three memasang ulang state sendiri; ukuran dipaksa dihitung ulang */
    },false);
    S.cv=c;S.r=r;
    try{S.maxTex=r.capabilities.maxTextureSize||2048;}catch(eM0){}
    S.scene=new T.Scene();
    S.cam=new T.OrthographicCamera(0,1,0,1,-600,600);   /* [PATCH G4.1] near/far sama dgn AST3D (iZ batu ~±120*sz); dulu 0.1..10 cukup utk quad 2D saja */
    S.cam.position.z=5;
    S.tCam=new T.OrthographicCamera(0,1,1,0,-600,600);S.tCam.position.z=5;   /* [FIX G4.5] y-ke-ATAS (top=H, bottom=0) */
    S.tScene=new T.Scene();S.tUnits=[];
    S.root=new T.Group();S.scene.add(S.root);
    S.layers=new T.Group();S.root.add(S.layers);
    S.geo=new T.PlaneGeometry(1,1);
    try{glskyInstBuild(T);}catch(eIn){S.inst=false;try{console.warn('[glsky] instancing gagal, bintang/garis tetap 2D:',eIn);}catch(e0){}}   /* gagal di sini TIDAK menjatuhkan GL: latar tetap jalan, bintang/garis 2D */
    S.dummy=new T.DataTexture(new Uint8Array([0,0,0,0]),1,1,T.RGBAFormat);S.dummy.needsUpdate=true;
    if(S.test)S.root.add(glskyBuildTest(T));
    cv.parentNode.insertBefore(c,cv);   /* tepat SEBELUM #sky di dalam #stage => di bawahnya; urutan DOM lain tidak berubah */
    glskyMirror();
    try{S.mo=new MutationObserver(glskyMirror);S.mo.observe(cv,{attributes:true,attributeFilter:['style']});}catch(eM){}
    S.ok=true;
  }catch(e){glskyFail(String(e&&e.message||e));}
}

function glskyInit(){
  var S=GLSKY;
  S.init=true;
  if(typeof threeLoad!=='function'){glskyFail('threeLoad tidak ada (12-ast3d.js belum dimuat)');return;}
  /* three dimuat lewat antrean bersama (12-ast3d.js): kita ikut giliran, jadi tidak menumpuk dengan build modul 3D lain. 2D menggambar semuanya sampai siap. */
  threeLoad(glskyBuild,function(m){glskyFail(m);});
}

function glskySize(){
  var S=GLSKY,s=Math.min(DPR||1,S.sCap),pw=Math.max(2,Math.round(W*s)),ph=Math.max(2,Math.round(H*s));   /* round = sama dgn layout() 2D (cv.width=round(W*DPR)): satu piksel GL = satu piksel kanvas 2D, tidak ada resampling kompositor */
  if(pw!==S.pw||ph!==S.ph){S.r.setSize(pw,ph,false);S.pw=pw;S.ph=ph;S.S=s;}   /* false = jangan sentuh style CSS (100% dari #stage) */
  if(W!==S.W||H!==S.H){
    S.cam.left=0;S.cam.right=W;S.cam.top=0;S.cam.bottom=H;S.cam.updateProjectionMatrix();
    if(S.tCam){S.tCam.left=0;S.tCam.right=W;S.tCam.top=H;S.tCam.bottom=0;S.tCam.updateProjectionMatrix();}
    S.W=W;S.H=H;glskyLayoutTest();
  }
}

/* dipanggil sekali per frame di 05-sector-ui.js frame(), SETELAH g.clearRect dan SEBELUM blok latar 2D.
   want = latar 2D akan digambar frame ini (bgCanvas siap). true yang dikembalikan = GL yang menggambar warna dasar (+ latar kalau GLSKY.lay) -> frame() melewati fillRect lama.
   Penggambaran GL sendiri di glskyFlush() (setelah blok latar). */
function glskyBegin(now,want){
  var S=GLSKY;
  S.act=false;S.n=0;
  if(!S.on||S.err>=3){glskyShow(false);glskyRestorePX();return false;}
  if(!S.init){glskyInit();return false;}
  if(!S.ok||!S.r)return false;
  try{
    glskyShow(true);
    glskySize();
    if(S.test){
      if(!S.px){S.px=[PX.neb,PX.mw];}
      PX.neb=1;PX.mw=1;   /* diagnosa PX yang sudah ada: tanpa plate / debu / MW / tint supaya GL kelihatan di bawah bintang & rasi 2D */
      S.tm.mat.uniforms.uTime.value=now*.001;
    }
    S.now=now;S.sn=0;S.ln=0;S.want=!!want;S.act=true;S.rec=true;   /* [FIX] rec = jendela rekam op GL: dari sini sampai glskyFlush */
  }catch(e){glskyFail(String(e&&e.message||e));return false;}
  return true;
}

/* dipanggil sekali per frame SETELAH blok latar 2D: render daftar op yang dicatat plateBlit/sectDrawSky */
function glskyFlush(){
  var S=GLSKY,t0,ms,i,m;
  if(!S.act||!S.r)return;
  S.rec=false;   /* [FIX] op yang dicatat setelah flush tidak akan pernah digambar -> pemanggil harus jatuh ke 2D */
  t0=performance.now();
  try{
    S.big=0;
    if(S.vig>0&&S.want&&S.lay&&!S.test){var vo=glskyOp();vo.k=2;vo.a=S.vig;vo.add=0;vo.cx=W*.5;vo.cy=H*.5;vo.w=W;vo.h=H;vo.rot=0;}   /* vignette: op terakhir => di atas latar GL, di bawah semua yang masih 2D */
    for(i=0;i<S.n;i++){m=S.mesh[i]||glskyMesh(i);glskyApply(m,S.ops[i]);}
    for(;i<S.mesh.length;i++)S.mesh[i].visible=false;
    glskyInstFlush();
    if(S.big){S.lay=false;glskyFail('texture melebihi batas GPU ('+S.maxTex+'px)');return;}   /* texture terlalu besar: tidak bisa jujur menggantikan 2D -> 2D penuh */
    S.r.setClearColor(0x050b12,S.want?1:0);   /* ColorManagement mati (threeLoad) => hex dipakai apa adanya = #050b12 */
    glskyRenderAll();
    S.st.fr++;
    if(S.st.fr%90===0)glskySweep();
  }catch(e){glskyFail(String(e&&e.message||e));return;}
  ms=performance.now()-t0;S.st.ms+=ms;if(ms>S.st.mx)S.st.mx=ms;
  S.st.msAvg=S.st.fr?+(S.st.ms/S.st.fr).toFixed(3):0;S.st.msMax=+S.st.mx.toFixed(2);
}

/* capture langit (01-core snapCompose): GL tidak bisa dibaca setelah frame ditampilkan (preserveDrawingBuffer:false), jadi render ulang daftar op terakhir
   SEKARANG lalu langsung drawImage ke kanvas capture di task yang sama. Mengembalikan true kalau GL tergambar (latar 2D tidak perlu diisi lagi). */
function glskySnap(x,dx,dy,dw,dh){
  var S=GLSKY;
  if(!S.act||!S.r||!S.ok)return false;
  try{glskyRenderAll();x.drawImage(S.cv,dx,dy,dw,dh);return true;}catch(e){return false;}
}
