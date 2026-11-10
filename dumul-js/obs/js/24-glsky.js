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
        Masih 2D (belum pindah): bintang/rasi/label, BH, planet, ofxDrawTint (tint BGM), drawHud, bandDimDraw (source-over, aman).
   CATATAN KNOWN: efek 'lighter' yang masih 2D (halo BH, supernova, bintang jatuh, tint BGM) kini digambar aditif di atas kanvas 2D transparan lalu ditumpuk
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
  vig:.34,drift:0,starOn:true,lineOn:true,soft:1,inst:false,sn:0,ln:0,bs:null,bl:null,ms:null,ml:null,now:0,ops:[],n:0,mesh:[],geo:null,dummy:null,tx:new Map(),col:Object.create(null),sw:0,maxTex:2048,
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
    if(/[?&]glsoft=0(&|#|$)/.test(location.search))GLSKY.soft=0;
    if(/[?&]gllay=0(&|#|$)/.test(location.search))GLSKY.lay=false;
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
  try{if(S.r)S.r.dispose();}catch(e5){}
  S.r=null;
}

/* salin gaya inline #sky (transform kamera wormhole, opacity, dst) ke kanvas GL */
function glskyMirror(){
  var S=GLSKY,a=cv.style,b;
  if(!S.cv)return;
  b=S.cv.style;
  if(b.transform!==a.transform)b.transform=a.transform;
  if(b.transformOrigin!==a.transformOrigin)b.transformOrigin=a.transformOrigin;
  if(b.opacity!==a.opacity)b.opacity=a.opacity;
  if(b.willChange!==a.willChange)b.willChange=a.willChange;
  if(b.visibility!==a.visibility)b.visibility=a.visibility;
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
/* highp WAJIB: uv di quad ~1800 px, mediump (10 bit) menggeser sampling beberapa piksel. uTex 0 = isi warna (uC sudah premultiplied), 1 = texture premultiplied x alpha (uC.a), 2 = vignette (hitam, alpha uC.a x kurva jarak dari pusat) */
var GLSKY_FS='precision highp float;varying vec2 vUv;uniform sampler2D uMap;uniform vec4 uC;uniform float uTex;uniform float uB;void main(){if(uTex>1.5){vec2 p=(vUv-0.5)*2.0;gl_FragColor=vec4(0.0,0.0,0.0,uC.a*smoothstep(0.5,1.4,length(p)));}else gl_FragColor=uTex>0.5?texture2D(uMap,vUv,uB)*uC.a:uC;}';

function glskyCol(str){
  var c=GLSKY.col[str],a;
  if(c)return c;
  a=String(str).split(',');
  return (GLSKY.col[str]=[(+a[0]||0)/255,(+a[1]||0)/255,(+a[2]||0)/255]);
}
function glskyOp(){var S=GLSKY,o=S.ops[S.n];if(!o)o=S.ops[S.n]={};o.b=0;S.n++;return o;}   /* b = bias LOD texture (0 = normal) */
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
/* gambar canvas c: pusat (cx,cy), ukuran w x h (px stage), rotasi rad (searah canvas.rotate), add=1 'lighter' */
function glskyImg(c,a,cx,cy,w,h,rot,add){
  var o=glskyOp();o.k=1;o.t=c;o.a=a;o.add=add?1:0;o.cx=cx;o.cy=cy;o.w=w;o.h=h;o.rot=rot||0;
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
  if(typeof NEB!=='undefined'&&NEB.tint)for(k in NEB.tint)if(NEB.tint[k]===c)return true;
  if(typeof SKYT!=='undefined')for(k in SKYT)if(SKYT[k]&&(SKYT[k].spr===c||SKYT[k].spr2===c))return true;
  return false;
}
function glskyTex(c){
  var S=GLSKY,T=window.THREE,e=S.tx.get(c),v=c.__glv|0,t;
  if(e&&(e.v!==v||e.w!==c.width||e.h!==c.height)){e.t.dispose();S.tx.delete(c);e=null;}   /* isi/ukuran berubah (grid bake ulang): texture baru, jangan timpa storage lama */
  if(!e){
    if(c.width>S.maxTex||c.height>S.maxTex){S.big=1;return null;}
    t=new T.CanvasTexture(c);
    t.flipY=false;t.premultiplyAlpha=true;t.generateMipmaps=false;t.minFilter=T.LinearFilter;t.magFilter=T.LinearFilter;
    if(c.__glmip){t.generateMipmaps=true;t.minFilter=T.LinearMipmapLinearFilter;}   /* gambar besar yang diperkecil (Milky Way): mipmap supaya tidak berkilau saat bergulir */
    e={t:t,v:v,w:c.width,h:c.height};S.tx.set(c,e);S.st.up++;
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
  m.frustumCulled=false;m.renderOrder=10+i;
  S.layers.add(m);S.mesh[i]=m;
  return m;
}
function glskyApply(m,o){
  var S=GLSKY,T=window.THREE,u=m.material.uniforms,a=o.a,tx;
  if(o.k===2){u.uTex.value=2;u.uC.value.set(0,0,0,a);}
  else if(o.k){
    tx=glskyTex(o.t);
    if(!tx){m.visible=false;return;}
    u.uMap.value=tx;u.uTex.value=1;u.uB.value=o.b||0;u.uC.value.set(0,0,0,a);
  }else{
    u.uTex.value=0;u.uC.value.set(o.c[0]*a,o.c[1]*a,o.c[2]*a,a);
  }
  m.material.blendDst=o.add?T.OneFactor:T.OneMinusSrcAlphaFactor;
  m.position.set(o.cx,o.cy,0);m.rotation.z=o.rot;m.scale.set(o.w,o.h,1);
  m.visible=true;
}

function glskyBuild(){
  var S=GLSKY,T=window.THREE,c,r;
  if(S.err>=3||S.r)return;
  try{
    c=document.createElement('canvas');c.id='glsky';c.setAttribute('aria-hidden','true');
    c.style.cssText='position:fixed;left:0;top:0;width:100%;height:100%;display:block;pointer-events:none;touch-action:none';
    r=new T.WebGLRenderer({canvas:c,alpha:true,premultipliedAlpha:true,antialias:false,depth:false,stencil:false,preserveDrawingBuffer:false,powerPreference:'low-power'});
    r.setPixelRatio(1);
    r.autoClear=true;
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
    S.cam=new T.OrthographicCamera(0,1,0,1,0.1,10);   /* left,right,top,bottom: top=0 bawah=H => y ke bawah seperti kanvas 2D */
    S.cam.position.z=5;
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
    S.now=now;S.sn=0;S.ln=0;S.want=!!want;S.act=true;
  }catch(e){glskyFail(String(e&&e.message||e));return false;}
  return true;
}

/* dipanggil sekali per frame SETELAH blok latar 2D: render daftar op yang dicatat plateBlit/sectDrawSky */
function glskyFlush(){
  var S=GLSKY,t0,ms,i,m;
  if(!S.act||!S.r)return;
  t0=performance.now();
  try{
    S.big=0;
    if(S.vig>0&&S.want&&S.lay&&!S.test){var vo=glskyOp();vo.k=2;vo.a=S.vig;vo.add=0;vo.cx=W*.5;vo.cy=H*.5;vo.w=W;vo.h=H;vo.rot=0;}   /* vignette: op terakhir => di atas latar GL, di bawah semua yang masih 2D */
    for(i=0;i<S.n;i++){m=S.mesh[i]||glskyMesh(i);glskyApply(m,S.ops[i]);}
    for(;i<S.mesh.length;i++)S.mesh[i].visible=false;
    glskyInstFlush();
    if(S.big){S.lay=false;glskyFail('texture melebihi batas GPU ('+S.maxTex+'px)');return;}   /* texture terlalu besar: tidak bisa jujur menggantikan 2D -> 2D penuh */
    S.r.setClearColor(0x050b12,S.want?1:0);   /* ColorManagement mati (threeLoad) => hex dipakai apa adanya = #050b12 */
    S.r.render(S.scene,S.cam);
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
  try{S.r.render(S.scene,S.cam);x.drawImage(S.cv,dx,dy,dw,dh);return true;}catch(e){return false;}
}
