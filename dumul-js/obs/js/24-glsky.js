'use strict';
/* ================= GLSKY (G0: kerangka, nyala: ?glsky=1) =================
   Rencana: rencana-gl-sky.md. Tujuan proyek: SERU, BUKAN ngejar fps (tidak ada tahap yang dinilai dari angka fps).
   G0 = kanvas WebGL (three r186 yang sudah ada, SATU WebGLRenderer) ditaruh DI BAWAH #sky di dalam #stage. Isinya baru warna dasar langit
   (#050b12, persis fillRect lama di frame()). Selama GLSKY.act, frame() tidak menggambar fillRect itu -> tampilan HARUS sama dengan jalur 2D.
   Lapisan berikutnya (G1 plate, G2 bintang, ...) tinggal menambah Mesh ke GLSKY.root.
   - Posisi / lensing / rotasi / zoom tetap dihitung JS (W,H = ruang stage, sama dgn #sky). Kamera ortho = piksel CSS ruang stage, y ke bawah.
   - Landscape (STG.rot) & letterbox desktop: kanvas GL anak #stage persis seperti #sky, jadi ikut diputar / di-scale CSS tanpa kode tambahan.
   - Transform/opacity inline yang dipasang wormhole ke #sky (kamera zoom) disalin ke kanvas GL lewat MutationObserver.
   - Nol biaya untuk pengunjung biasa: file ini hanya dimuat kalau ?glsky=1|test (atau localStorage dumul_glsky=1). Loader inline di index.html, BUKAN di SHELL SW.
   Flag:  ?glsky=1 nyala | ?glsky=0 paksa 2D (menang atas localStorage) | ?glsky=test nyala + lapisan uji (gradien + 4 penanda sudut; latar 2D dimatikan supaya GL kelihatan)
          ?glskydpr=1|1.5|2 batas DPR buffer GL (default min(DPR,1.5)). Konsol: GLSKY.on=false/true (A/B), GLSKY.st = {fr, msAvg, msMax}.
   Fallback: renderer gagal / konteks hilang >=3x => GLSKY.err=3, kanvas GL disembunyikan, 2D menggambar semuanya lagi (tanpa reload).
   Jalur 2D lama utuh: kalau file ini tidak dimuat, hook di frame() tidak melakukan apa-apa (typeof guard). Token bench off= tetap jalur 2D saja.
   Pola penanda: tes uji GL "terlihat" = sudut kiri-atas MERAH, kanan-atas HIJAU, kiri-bawah BIRU, kanan-bawah KUNING (kalau tertukar = arah y / rotasi salah). */
var GLSKY={on:true,act:false,err:0,ok:false,init:false,why:'',test:false,base:'#050b12',cap:null,
  r:null,scene:null,cam:null,root:null,cv:null,mo:null,W:0,H:0,pw:0,ph:0,S:1,sCap:1.5,shown:true,px:null,tm:null,
  st:{fr:0,ms:0,mx:0,msAvg:0,msMax:0,lost:0}};
try{window.__glsky=GLSKY;}catch(eG0){}
(function(){
  try{
    var m=/[?&]glsky=(0|1|test)(&|#|$)/.exec(location.search),d=/[?&]glskydpr=([0-9.]+)/.exec(location.search);
    if(m){GLSKY.on=m[1]!=='0';GLSKY.test=m[1]==='test';}
    if(d&&parseFloat(d[1])>0)GLSKY.sCap=parseFloat(d[1]);
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
      S.W=S.H=S.pw=S.ph=0;S.ok=true;glskyShow(true);   /* three memasang ulang state sendiri; ukuran dipaksa dihitung ulang */
    },false);
    S.cv=c;S.r=r;
    S.scene=new T.Scene();
    S.cam=new T.OrthographicCamera(0,1,0,1,0.1,10);   /* left,right,top,bottom: top=0 bawah=H => y ke bawah seperti kanvas 2D */
    S.cam.position.z=5;
    S.root=new T.Group();S.scene.add(S.root);
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
  var S=GLSKY,s=Math.min(DPR||1,S.sCap),pw=Math.max(2,Math.ceil(W*s)),ph=Math.max(2,Math.ceil(H*s));
  if(pw!==S.pw||ph!==S.ph){S.r.setSize(pw,ph,false);S.pw=pw;S.ph=ph;S.S=s;}   /* false = jangan sentuh style CSS (100% dari #stage) */
  if(W!==S.W||H!==S.H){
    S.cam.left=0;S.cam.right=W;S.cam.top=0;S.cam.bottom=H;S.cam.updateProjectionMatrix();
    S.W=W;S.H=H;glskyLayoutTest();
  }
}

/* dipanggil sekali per frame di 05-sector-ui.js frame(), SETELAH g.clearRect dan SEBELUM blok latar 2D.
   want = latar 2D akan digambar frame ini (bgCanvas siap). true yang dikembalikan = GL sudah menggambar warna dasar -> frame() melewati fillRect lama. */
function glskyBegin(now,want){
  var S=GLSKY,t0,ms;
  S.act=false;
  if(!S.on||S.err>=3){glskyShow(false);glskyRestorePX();S.cap=null;return false;}
  if(!S.init){glskyInit();return false;}
  if(!S.ok||!S.r){S.cap=null;return false;}
  t0=performance.now();
  try{
    glskyShow(true);
    glskySize();
    if(S.test){
      if(!S.px){S.px=[PX.neb,PX.mw];}
      PX.neb=1;PX.mw=1;   /* diagnosa PX yang sudah ada: tanpa plate / debu / MW / tint supaya GL kelihatan di bawah bintang & rasi 2D */
      S.tm.mat.uniforms.uTime.value=now*.001;
    }
    S.r.setClearColor(0x050b12,want?1:0);   /* ColorManagement mati (threeLoad) => hex dipakai apa adanya = #050b12 */
    S.r.render(S.scene,S.cam);
    S.act=true;
    S.cap=(want&&!S.test)?S.base:null;   /* dipakai capture langit (01-core snapCompose): G0 = warna polos; G1+ akan diganti render ulang GL */
    S.st.fr++;
  }catch(e){glskyFail(String(e&&e.message||e));return false;}
  ms=performance.now()-t0;S.st.ms+=ms;if(ms>S.st.mx)S.st.mx=ms;
  S.st.msAvg=S.st.fr?+(S.st.ms/S.st.fr).toFixed(3):0;S.st.msMax=+S.st.mx.toFixed(2);
  return true;
}
