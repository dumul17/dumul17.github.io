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
   G3g: PLEIADES bintang (drawPleiades, 04-render.js) halo+inti lewat glskyStar (mesh bintang yang sama); label/nama/spektrum tetap 2D. Flag ?glplei=0 A/B | konsol GLSKY.pleiOn.
   G4.14: bintang mode kamera + Pleiades mode kamera pindah ke mesh bintang GL (inti saja, tanpa halo; gaya sensor). camLens / label / reticle / spektrum tetap 2D. Guard !CAMERA_MODE di glskyStarsOn/glskyPleiOn diangkat. Flag ?glstars=0 / ?glplei=0 A/B.
   G4.14b: hotfix stacking — bintang ber-camLens: inti 2D di #sky SETELAH lensa (identik ?glsky=0); tanpa lensa tetap mesh GL.
   G4.2b: PORTAL overview full GL (cincin billboard + mulut PTT + petir glskySeg + percikan + charge) SEBELUM flush; #sky 2D tidak lagi menerima blit portal. Flag ?glportal=0 A/B | konsol GLSKY.portalOn.
   G4.3b: BH BODY+plasma+drag (drawHoleGl) sprite+bloom+serat+kilau cakram+warp drag ke GL sebelum flush. Flag ?glbh=0 A/B | konsol GLSKY.bhOn.
   G4.5: TELESKOP 3D (13-scope3d.js) jadi Group di PASS ATAS (glskyAttachTop: scene+kamera y-ke-atas sendiri, dirender sesudah scene utama; lihat catatan FIX di glskyAttachTop): tanpa renderer 'small', tanpa blit/drawImage ke #sky saat GL aktif; salinan tepi layar = klon Group; wormhole dive tetap jalur 2D (terowongan masih kanvas 2D z 13). Flag ?glscope=0 A/B | konsol SCP3D_GL.on.
   G4.4: AST dual-mesh — pass depan meshF RO 5200 tanpa blit (12-ast3d.js). Flag ?glast=0.
   G3h: EFEK KECIL sesudah flush pindah ke GL (dicatat sebelum flush, di atas BH/trigger): ofxDrawAvail (glow 8 bintang), ofxDrawDust (debu kursor), drawFocusFx (cincin/rasi fokus mode kamera, glskyFocusFx), reticle drawTargetLock (glskyLockReticle; teks telemetri tetap 2D). Glow = sprite getStarSprite lewat glskyImg add=1 hi=1, garis/cincin = glskySeg/glskyPoly. drawSectFlash SENGAJA tetap 2D (flash layar penuh harus di atas semua unit). Flag ?glfx=0 A/B | konsol GLSKY.fxOn.
   G4.7: DRONE TX/RX 3D (14-drone3d.js) = Group di LAYER DRONE (kanvas #gldrone di ATAS #sky, kanvas GL ketiga, malas), tanpa blit/drawImage; halo lembut tetap 2D di bawahnya. Di atas #sky karena planet masih blit 2D dan drone digambar sesudah planet. Planet pindah GL => drone pindah ke pass atas, layer dihapus. Flag ?gldrone=0 A/B | konsol GLSKY.drOn.
   G4.8: PLANET full GL (17-planet3d.js pl3dGlPrep): shader strip yang sama digambar langsung di PASS PLANET (pScene + tCam y-ke-atas), dirender sesudah pass teleskop dan sebelum #sky (urutan 2D lama). Tanpa renderer 'big', tanpa blit. Efek 2D planet (aurora/debris/flare/petir) tetap di #sky. Flag ?glplanet=0 A/B | konsol GLSKY.plOn, PL3D.glm.
   G4.9: EFEK PLANET (aurora/debris/flare/petir, 17-planet3d.js pl3dGlFx) pindah ke PASS PLANET (pScene) sesudah permukaan: aurora = mesh kolom instancing (VS menghitung tinggi/alpha tirai per kolom dari fungsi waktu, tanpa bake/keyframe/kanvas offscreen), debris = titik+garis, flare = blob radial 3-stop, petir = ruas garis (glow awan tetap shader uBolt planet). Titik planet-ruang -> pass planet lewat affine (ayunan libr + rotasi stage + balik y) dari JS. Blend source-over premultiplied (sama dgn 'lighter' di kanvas transparan lalu ditumpuk normal). Flag ?glplfx=0 A/B | konsol GLSKY.pfOn, PL3D.fxGl.
   G4.18: KOMET/KONAMI ke GL (06-interaction.js drawCometGl + 12-ast3d.js ast3dHeads): aurora = irisan quad dengan sub-rect UV (uUV, glskyImg arg ke-11), ekor ion/debu = quad texture, percikan/silang/cincin kejut = titik/garis GL, glow kepala = sprite bintang; kepala batu 3D = Group di PASS KEPALA (hScene, sesudah scene utama, sebelum pass teleskop = urutan 2D lama), tanpa renderer 'big', tanpa blit. Flag ?glcomet=0 A/B | konsol GLSKY.cometOn, GLSKY.hAct.
   G4.15: SUPERSAMPLE UNIT KECIL (teleskop di pass atas + drone di pass drone): tiap unit dirender dulu ke WebGLRenderTarget seukuran kotaknya saja (2x piksel layar, tanpa MSAA; ?glssms=N untuk MSAA target), lalu ditempel sebagai quad bertekstur di renderer utama.
       RT dibuat 'seperti kanvas': flag isXRRenderTarget + texture.colorSpace sRGB membuat three menerapkan ACES + enkode sRGB per fragmen (sama dgn jalur langsung), jadi warna identik dan glow toneMapped:false tidak ikut ter-ACES. Blend aditif di RT tidak menyentuh kanal alpha (supaya quad tidak meredupkan latar).
       Swa-uji sekali di glskyBuild (abu-abu .5 harus terbaca ~188 + ACES harus beda); gagal/tidak didukung/galat = jalur langsung lama otomatis. Flag ?glssaa=0 A/B, ?glssk=2 (faktor), ?glssms=0|2|4 | konsol GLSKY.sa.
   CATATAN KNOWN: efek 'lighter' yang masih 2D (halo BH, supernova, bintang jatuh) kini digambar aditif di atas kanvas 2D transparan lalu ditumpuk
   normal di atas GL, bukan aditif di atas plate => bisa ada cincin gelap tipis di atas nebula terang. Halo bintang pindah ke GL di G2.
   - Posisi / lensing / rotasi / zoom tetap dihitung JS (W,H = ruang stage, sama dgn #sky). Kamera ortho = piksel CSS ruang stage, y ke bawah.
   - Landscape (STG.rot) & letterbox desktop: kanvas GL anak #stage persis seperti #sky, jadi ikut diputar / di-scale CSS.
   - Transform/opacity inline yang dipasang wormhole ke #sky (kamera zoom) disalin ke kanvas GL lewat MutationObserver.
   - DEFAULT NYALA (bukan lagi opt-in): script defer statis di index.html + SHELL SW. Mati lewat ?glsky=0, localStorage dumul_glsky=0, mode potato/low, atau reduced-motion (kecuali ?glsky=1 / localStorage=1 memaksa).
   Flag:  ?glsky=1 nyala | ?glsky=0 paksa 2D (menang atas localStorage) | ?glsky=test nyala + lapisan uji (gradien + 4 penanda sudut; latar 2D dimatikan supaya GL kelihatan)
          ?gllay=0 = G0 saja (latar tetap digambar 2D, GL cuma warna dasar) untuk A/B | ?glskydpr=1|1.5|2 batas DPR buffer GL (default: TIDAK dibatasi = ukuran piksel sama persis dgn kanvas 2D, round(W*DPR); dulu 1.5 -> Milky Way burik/berkilau karena di-upscale kompositor) | ?glmwsnap=1 tile Milky Way dibulatkan ke piksel perangkat (uji coba anti-kilau)
          ?glvig=0 matikan vignette (?glvig=0.5 kekuatan 0..1, default .34) | ?gldrift=1 nyalakan drift (default 0 = diam; ?gldrift=2 = 2x lebih lebar) | konsol: GLSKY.vig / GLSKY.drift boleh diubah langsung.
          Konsol: GLSKY.on=false/true (A/B 2D vs GL), GLSKY.lay=false/true (G0 vs G1), GLSKY.st = {fr, msAvg, msMax, up (jumlah texture diunggah), tex (texture hidup)}.
   Fallback: renderer gagal / konteks hilang >=3x / texture melebihi batas GPU => balik ke 2D, kanvas GL disembunyikan, tanpa reload.
   Jalur 2D lama utuh: kalau file ini tidak dimuat, semua hook di frame()/plateBlit()/sectDrawSky()/snapCompose() tidak melakukan apa-apa (typeof / GLSKY guard). Token bench off= tetap jalur 2D saja.
   Pola penanda uji: sudut kiri-atas MERAH, kanan-atas HIJAU, kiri-bawah BIRU, kanan-bawah KUNING (kalau tertukar = arah y / rotasi salah). */
var GLSKY={on:true,lay:true,act:false,err:0,ok:false,init:false,why:'',test:false,base:'#050b12',want:false,
  r:null,scene:null,cam:null,root:null,cv:null,mo:null,W:0,H:0,pw:0,ph:0,S:1,sCap:99,mwSnap:0,shown:true,px:null,tm:null,
  vig:.34,drift:0,rec:false,fxOn:true,starOn:true,lineOn:true,ssOn:true,soft:1,inst:false,sn:0,ln:0,ln2:0,ln3:0,hiOv:0,bs:null,bl:null,bl2:null,bl3:null,ms:null,ml:null,ml2:null,ml3:null,now:0,ops:[],n:0,mesh:[],geo:null,dummy:null,tx:new Map(),col:Object.create(null),sw:0,maxTex:2048,
  /* [PATCH G4.1] unit 3D yang di-attach ke scene bersama (batu belakang dulu); astOn = A/B ?glast=0 */
  /* [PATCH G3d] bhShockOn = A/B ?glbhshock=0 */
  /* [G4.18] komet/Konami: cometOn = A/B ?glcomet=0; hScene = pass kepala batu komet; hAct = ada kepala yang digambar frame ini */
  cometOn:true,hScene:null,hAct:false,
  units:[],tScene:null,tCam:null,tUnits:[],oR:null,oCv:null,oScene:null,oCam:null,oOk:false,oErr:0,oPw:0,oPh:0,astOn:true,bhShockOn:true,snOn:true,trigOn:true,pleiOn:true,portalOn:true,bhOn:true,
  /* [G4.7] layer drone: kanvas GL ketiga (#gldrone) DI ATAS #sky, anak #stage; dibuat malas saat drone pertama muncul. drOn = A/B ?gldrone=0 */
  drOn:true,dR:null,dCv:null,dScene:null,dCam:null,dOk:false,dErr:0,dPw:0,dPh:0,dShown:false,
  /* [G4.8] pass planet: pScene dirender sesudah pass atas (teleskop). plOn = A/B ?glplanet=0; pAct = planet dijadwalkan frame ini (di-reset glskyBegin); pChk = diagnosa shader belum dicek; pErr = galat prep */
  plOn:true,pScene:null,pAct:false,pChk:false,pErr:0,
  /* [G4.9] efek planet di pass planet: plfxOn = A/B ?glplfx=0; pf = {au,ds,dl,db,...} mesh; pfOk = mesh berhasil dibangun; pdn/pln/pbn/pan = jumlah baris dicatat frame ini (di-reset glskyBegin) */
  plfxOn:true,pf:null,pfOk:false,pdn:0,pln:0,pbn:0,pan:0,
  /* [G4.10] PASS DRONE di renderer utama: dbScene (efek di BAWAH drone: trail/tether/kaki/halo/ping) lalu mdScene (Group drone + cincin tahan di ATAS). dpOn = A/B ?gldpass=0 (drone balik ke layer #gldrone); dpOk = mesh efek berhasil dibangun; dpAct = ada yang dijadwalkan frame ini; dbn/dln/dsn/dtn = jumlah blob/garis/titik/garis-atas dicatat frame ini (di-reset glskyBegin); aa = antialias renderer utama (?glaa=1) */
  dpOn:true,dp:null,dpOk:false,dpErr:0,dpAct:false,dbn:0,dln:0,dsn:0,dtn:0,mdScene:null,dbScene:null,aa:false,
  /* [G4.15] supersample unit kecil. saOn = A/B ?glssaa=0; saK = faktor resolusi RT (2 = 2x2 piksel per piksel layar); saMs = samples MSAA RT (0 = mati); saM / saMd = margin kotak teleskop / drone terhadap radius model; sa = status (ok, test, why, n, px, fr, err, sl). Catatan: ssOn di atas = meteor (?glss=0), BUKAN ini */
  saOn:true,saK:2,saMs:0,saM:1.45,saMd:1.08,sa:{ok:false,tried:false,err:0,why:'',test:null,cap:2048,cc:null,cam:null,qs:null,q:null,u:null,sl:[null,null],n:0,px:0,fr:0},
  st:{fr:0,ms:0,mx:0,msAvg:0,msMax:0,lost:0,up:0,tex:0}};
try{window.__glsky=GLSKY;}catch(eG0){}
(function(){
  try{
    var m=/[?&]glsky=(0|1|test)(&|#|$)/.exec(location.search),d=/[?&]glskydpr=([0-9.]+)/.exec(location.search);
    if(m){GLSKY.on=m[1]!=='0';GLSKY.test=m[1]==='test';}
    /* [DEFAULT-ON] tanpa ?glsky= eksplisit: GL nyala, kecuali localStorage dumul_glsky=0, mode potato/low, atau prefers-reduced-motion (jalur itu tetap 2D lama). ?glsky=1|test atau localStorage=1 memaksa nyala; ?glsky=0 paksa 2D. */
    if(!m){
      var lsv=null;try{lsv=localStorage.getItem('dumul_glsky');}catch(eLs){}
      if(lsv==='0'){GLSKY.on=false;GLSKY.why='ls-off';}
      else if(lsv!=='1'&&((typeof IS_POTATO!=='undefined'&&IS_POTATO)||(typeof reduce!=='undefined'&&reduce))){GLSKY.on=false;GLSKY.why='default-low';}
    }
    if(d&&parseFloat(d[1])>0)GLSKY.sCap=parseFloat(d[1]);
    if(/[?&]glmwsnap=1(&|#|$)/.test(location.search))GLSKY.mwSnap=1;
    if(/[?&]glstars=0(&|#|$)/.test(location.search))GLSKY.starOn=false;
    if(/[?&]gllines=0(&|#|$)/.test(location.search))GLSKY.lineOn=false;
    if(/[?&]glss=0(&|#|$)/.test(location.search))GLSKY.ssOn=false;
    if(/[?&]glcomet=0(&|#|$)/.test(location.search))GLSKY.cometOn=false;   /* [G4.18] */
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
    if(/[?&]glplfx=0(&|#|$)/.test(location.search))GLSKY.plfxOn=false;   /* [G4.9] A/B: efek planet tetap 2D di #sky */
    if(/[?&]gldpass=0(&|#|$)/.test(location.search))GLSKY.dpOn=false;   /* [G4.10] A/B: drone tetap di layer #gldrone (G4.7) */
    if(/[?&]glssaa=0(&|#|$)/.test(location.search))GLSKY.saOn=false;   /* [G4.15] A/B: teleskop + drone tanpa supersample (render langsung ke kanvas utama) */
    var sk=/[?&]glssk=([0-9.]+)/.exec(location.search),sm=/[?&]glssms=([0-9]+)/.exec(location.search);
    if(sk&&isFinite(parseFloat(sk[1])))GLSKY.saK=Math.max(1.2,Math.min(4,parseFloat(sk[1])));   /* [G4.15] faktor resolusi RT (default 2) */
    if(sm)GLSKY.saMs=Math.min(8,parseInt(sm[1],10)||0);   /* [G4.15] samples MSAA RT (default 0) */
    if(/[?&]glaa=1(&|#|$)/.test(location.search))GLSKY.aa=true;   /* [G4.10] antialias MSAA renderer utama (drone kecil jadi halus; lebih berat) */
    if(/[?&]glplanet=0(&|#|$)/.test(location.search))GLSKY.plOn=false;   /* [G4.8] A/B: planet tetap jalur lama (renderer 'big' + blit) */
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
/* [G4.18] varian dengan sub-rect UV (uUV = offset xy, skala zw): irisan aurora komet. Dipakai HANYA material quad op (glskyMesh); material supersample (sa.q) tetap GLSKY_VS tanpa uUV. */
var GLSKY_VS_UV='varying vec2 vUv;uniform vec4 uUV;void main(){vUv=uv*uUV.zw+uUV.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}';
/* highp WAJIB: uv di quad ~1800 px, mediump (10 bit) menggeser sampling beberapa piksel. uTex 0 = isi warna (uC sudah premultiplied), 1 = texture premultiplied x alpha (uC.a), 2 = vignette (hitam, alpha uC.a x kurva jarak dari pusat), 3 = MULTIPLY (texture premultiplied; faktor = 1 - a*(tex.a - tex.rgb), blend ZERO,SRC_COLOR = canvas 'multiply' di atas backdrop opak; uC.a = alpha) */
var GLSKY_FS='precision highp float;varying vec2 vUv;uniform sampler2D uMap;uniform vec4 uC;uniform float uTex;uniform float uB;void main(){if(uTex>2.5){vec4 t=texture2D(uMap,vUv,uB);gl_FragColor=vec4(vec3(1.0)-uC.a*(vec3(t.a)-t.rgb),1.0);}else if(uTex>1.5){vec2 p=(vUv-0.5)*2.0;gl_FragColor=vec4(0.0,0.0,0.0,uC.a*smoothstep(0.5,1.4,length(p)));}else gl_FragColor=uTex>0.5?texture2D(uMap,vUv,uB)*uC.a:uC;}';

function glskyCol(str){
  var c=GLSKY.col[str],a;
  if(c)return c;
  a=String(str).split(',');
  return (GLSKY.col[str]=[(+a[0]||0)/255,(+a[1]||0)/255,(+a[2]||0)/255]);
}
function glskyOp(){var S=GLSKY,o=S.ops[S.n];if(!o)o=S.ops[S.n]={};o.b=0;o.hi=0;o.uv=null;o.aff=null;S.n++;return o;}   /* [G4.18] uv/aff juga di-reset: glskyMW dkk tidak mengisinya, dulu bisa mewarisi sisa op lain di index yang sama */   /* [FIX] hi di-reset: objek op dipakai ulang antar frame, hi=1 sisa frame lalu bikin op lain (fill/vignette) ikut renderOrder 5100 */   /* b = bias LOD texture (0 = normal) */
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
/* aff (opsional) = [a,b,c,d] affine 2x2 gaya g.transform/ptTiltMat (x'=a*x+c*y, y'=b*x+d*y) yang dikenakan pada quad SEBELUM rotasi rot, mis. mulut portal yang ikut kemiringan cincin */
function glskyImg(c,a,cx,cy,w,h,rot,add,hi,aff,uv){
  var o=glskyOp();o.k=1;o.t=c;o.a=a;o.add=add===2?2:(add?1:0);o.cx=cx;o.cy=cy;o.w=w;o.h=h;o.rot=rot||0;o.hi=GLSKY.hiOv?GLSKY.hiOv:(hi>=1000?hi:(hi?1:0));o.aff=aff||null;o.uv=uv||null;   /* [G4.18] uv = [u0,v0,du,dv] sub-rect texture (irisan aurora komet) */   /* [G4.16] hi >= 1000 = renderOrder literal (urutan di dalam portal: mulut 5100 < petir 5101 < cincin 5102 < kilau+percikan 5103); GLSKY.hiOv (sementara) menimpa hi untuk efek kecil yang dipanggil lewat drawRipple   /* [PATCH G3d] hi=1 -> renderOrder 5100 */
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
  try{if(typeof COMET_SPR!=='undefined'&&COMET_SPR){for(k in COMET_SPR)if(COMET_SPR[k]===c)return true;}}catch(eCs){}   /* [G4.18] sprite komet (aurora/ekor): jangan ikut tersapu */
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
  /* [G4.16] mesh garis tingkat 2/3 (portal overview): petir DI ATAS mulut (5100) tapi di bawah cincin (5102); kilau charge + percikan DI ATAS cincin. Mesh garis utama 5000 selalu di bawah semua op hi (5100+). */
  S.bl2=glskyInstGeo(T,[['iP',4],['iL',4],['iW',2]],1536);
  S.bl3=glskyInstGeo(T,[['iP',4],['iL',4],['iW',2]],1536);
  S.ml2=GLSKY_T_MESH(T,S.bl2,GLSKY_LINE_VS,GLSKY_LINE_FS,{uS:{value:1},uSoft:{value:1}},5101);
  S.ml3=GLSKY_T_MESH(T,S.bl3,GLSKY_LINE_VS,GLSKY_LINE_FS,{uS:{value:1},uSoft:{value:1}},5103);
  S.layers.add(S.ml);S.layers.add(S.ms);S.layers.add(S.ml2);S.layers.add(S.ml3);
  S.inst=true;
}
/* [PATCH G4.14] guard !CAMERA_MODE diangkat: mode kamera kirim inti saja lewat glskyStar (tanpa halo) */
function glskyStarsOn(){var S=GLSKY;return !!(S.act&&S.lay&&S.starOn&&S.inst);}
function glskyLinesOn(){var S=GLSKY;return !!(S.act&&S.lay&&S.lineOn&&S.inst);}
/* G3c: meteor acak (drawShooting, mode sprite ?ss=2) = quad texture lewat glskyImg; tidak butuh mesh instancing dan tetap di mode kamera (di 2D pun meteor di bawah garis/bintang) */
/* [G4.11] cincin sabuk Orion + garis penghubung portal (drawPortals) ke mesh garis GL; hanya dalam jendela rekam (sebelum flush). Mode kamera tetap boleh (garis GL tidak peduli). ?glportal=0 / ?gllines=0 = 2D */
function glskyPortalRingsOn(){var S=GLSKY;return !!(S.act&&S.rec&&S.lay&&S.lineOn&&S.inst&&S.portalOn&&S.ok&&S.r);}
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
/* [G4.16] ruas garis di tingkat urutan lv: 2 = di atas mulut/di bawah cincin portal (5101), 3 = di atas cincin (5103); selain itu = mesh garis utama (glskySeg) */
function glskySegL(lv,x0,y0,x1,y1,w,c,al,soft){
  var S=GLSKY,B,n,a,o;
  if(lv!==2&&lv!==3){glskySeg(x0,y0,x1,y1,w,c,al,soft);return;}
  B=lv===2?S.bl2:S.bl3;n=lv===2?S.ln2:S.ln3;
  if(!B||n>=B.cap)return;
  a=B.a;o=n*4;
  a.iP[o]=x0;a.iP[o+1]=y0;a.iP[o+2]=x1;a.iP[o+3]=y1;
  a.iL[o]=c[0];a.iL[o+1]=c[1];a.iL[o+2]=c[2];a.iL[o+3]=al>1?1:(al<0?0:al);
  a.iW[n*2]=w;a.iW[n*2+1]=soft;
  if(lv===2)S.ln2=n+1;else S.ln3=n+1;
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
  n=Math.max(8,Math.min(160,Math.ceil(Math.abs(a1-a0)*r/1.4)));   /* [FIX G5.2] ruas ~1,4 px (dulu 5 px, maks 64): cincin kecil (pulse sabuk Orion r 8-19) tampak bersudut + berkedip tiap n berganti; simpangan sekarang <0,03 px */
  for(i=0;i<=n;i++){a=a0+(a1-a0)*i/n;GLF_X[i]=cx+Math.cos(a)*r;GLF_Y[i]=cy+Math.sin(a)*r;GLF_A[i]=1;}
  glskyPoly(GLF_X,GLF_Y,GLF_A,n,w,rgb,al,0);
}
function glfDot(x,y,r,rgb,al){if(al>.004)glskyStar(x,y,0,'0,0,0',0,r,rgb,al);}   /* lingkaran padat (ekuivalen arc + fill) */
function glfLine(x0,y0,x1,y1,w,rgb,al){if(al>.004)glskySeg(x0,y0,x1,y1,w,glskyCol(rgb),al,0);}
/* garis putus-putus (g.setLineDash([on,off]) + lineDashOffset): ph = posisi pola di awal garis (px), ext = perpanjangan tiap dash di dua ujung (setengah lebar bila canvas pakai lineCap round).
   mode 0 = mesh garis utama (glskySeg), 1 = pass drone di bawah drone (glskyDpSeg). */
function glfDash(x0,y0,x1,y1,w,rgb,al,on,off,ph,ext,mode){
  var L=Math.hypot(x1-x0,y1-y0),ux,uy,per=on+off,s,pos=0,len,c,ea=ext||0,a,b,n=0;
  if(!(al>.004)||L<.5)return;
  ux=(x1-x0)/L;uy=(y1-y0)/L;c=glskyCol(rgb);
  s=((ph||0)%per+per)%per;
  while(pos<L&&n++<600){
    if(s<on){
      len=on-s;a=Math.max(0,pos-ea);b=Math.min(L,pos+len+ea);
      if(mode===1)glskyDpSeg(x0+ux*a,y0+uy*a,x0+ux*b,y0+uy*b,w,c,al,0);else glskySeg(x0+ux*a,y0+uy*a,x0+ux*b,y0+uy*b,w,c,al,0);
      pos+=len;s=on;
    }else{pos+=per-s;s=0;}
  }
}
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
  if(S.ml2){
    S.ml2.material.uniforms.uS.value=S.S;S.ml2.material.uniforms.uSoft.value=S.soft?1:0;
    S.ml3.material.uniforms.uS.value=S.S;S.ml3.material.uniforms.uSoft.value=S.soft?1:0;
    glskyInstUpload(S.bl2,S.ml2,S.ln2);glskyInstUpload(S.bl3,S.ml3,S.ln3);
  }
  glskyInstUpload(S.bl,S.ml,S.ln);glskyInstUpload(S.bs,S.ms,S.sn);
}

function glskyMesh(i){
  var S=GLSKY,T=window.THREE,m;
  m=new T.Mesh(S.geo,new T.ShaderMaterial({
    uniforms:{uMap:{value:S.dummy},uC:{value:new T.Vector4(0,0,0,1)},uTex:{value:0},uB:{value:0},uUV:{value:new T.Vector4(0,0,1,1)}},
    vertexShader:GLSKY_VS_UV,fragmentShader:GLSKY_FS,
    transparent:true,depthTest:false,depthWrite:false,side:T.DoubleSide,
    blending:T.CustomBlending,blendEquation:T.AddEquation,blendSrc:T.OneFactor,blendDst:T.OneMinusSrcAlphaFactor}));
  m.frustumCulled=false;m.renderOrder=10+i;m.__ro=10+i;
  S.layers.add(m);S.mesh[i]=m;
  return m;
}
function glskyApply(m,o){
  var S=GLSKY,T=window.THREE,u=m.material.uniforms,a=o.a,tx;
  if(o.uv)u.uUV.value.set(o.uv[0],o.uv[1],o.uv[2],o.uv[3]);else u.uUV.value.set(0,0,1,1);   /* [G4.18] */
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
  m.renderOrder=o.hi?(o.hi>=1000?o.hi:5100):m.__ro;   /* [FIX] selalu di-set ulang: dulu sekali 5100 tetap 5100 walau op di index itu bukan hi lagi (vignette/plate jadi menimpa bintang) */
  if(o.aff&&o.k===1){   /* [PATCH G4.13] quad dengan affine: M = T(cx,cy) R(rot) A S(w,h) */
    var A=o.aff,cr=Math.cos(o.rot),sr=Math.sin(o.rot),sw=o.w,sh=o.h;
    m.matrixAutoUpdate=false;
    m.matrix.set(cr*A[0]*sw-sr*A[1]*sw,cr*A[2]*sh-sr*A[3]*sh,0,o.cx, sr*A[0]*sw+cr*A[1]*sw,sr*A[2]*sh+cr*A[3]*sh,0,o.cy, 0,0,1,0, 0,0,0,1);
    m.matrixWorldNeedsUpdate=true;
  }else{
    m.matrixAutoUpdate=true;
    m.position.set(o.cx,o.cy,0);m.rotation.z=o.rot;m.scale.set(o.w,o.h,1);
  }
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
/* [G4.10] pass drone di renderer utama dipakai selama planet GL JALAN (PL3D.glm===2): urutan lapisan drone di atas planet sudah dijamin pass-nya sendiri, jadi layer #gldrone tidak perlu.
   DpReady = struktur siap (tidak tergantung jendela rekam); DpOn = DpReady + jendela rekam frame ini terbuka (antre op sebelum glskyFlush). DpHold = jangan bikin layer (planet GL sedang kompilasi / sudah jalan). */
function glskyDpReady(){var S=GLSKY;return !!(S.dpOn&&S.dpOk&&S.dpErr<3&&S.ok&&S.r&&S.plOn&&S.pErr<3&&typeof PL3D!=='undefined'&&PL3D.glm===2);}
function glskyDpOn(){var S=GLSKY;return !!(S.act&&S.rec&&S.lay&&glskyDpReady());}
function glskyDpHold(){var S=GLSKY,m;if(!S.dpOn||!S.dpOk||S.dpErr>=3||!S.plOn||S.pErr>=3||typeof PL3D==='undefined')return false;m=PL3D.glm;return m===1||m===2;}
/* 2 = pass drone utama, 1 = layer #gldrone, 0 = tidak ada (blit 2D) */
function glskyDrTarget(){return glskyDpOn()?2:(glskyDpReady()?0:(glskyDrOn()?1:0));}
function glskyDrWant(){var S=GLSKY;return !!(S.drOn&&S.act&&S.ok&&!S.dR&&S.dErr<3&&!glskyDpHold());}
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
function glskyDrScene(tg){var S=GLSKY;return tg===2?S.mdScene:S.dScene;}
function glskyDrAttach(grp,tg){var sc=glskyDrScene(tg);if(!sc||!grp)return false;try{sc.add(grp);return true;}catch(e){return false;}}
function glskyDrDetach(grp){var S=GLSKY;try{if(grp&&grp.parent&&(grp.parent===S.dScene||grp.parent===S.mdScene))grp.parent.remove(grp);}catch(e){}}
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
/* ---------- [G4.15] SUPERSAMPLE UNIT KECIL (teleskop + drone) ----------
   Latar: ?glaa=1 = MSAA seluruh layar (±1,4 jt piksel x sampel tiap frame di HP DPR 2). Unit kecil cuma butuh AA di kotaknya sendiri: teleskop ±0,2 jt piksel RT, drone puluhan piksel.
   Cara: unit (pivot di pass atas / pass drone) dirender ke WebGLRenderTarget sub-viewport seukuran kotaknya (faktor saK, default 2x2) lalu quad bertekstur menempelkannya di pass yang sama (urutan lapisan tidak berubah).
   Kotak = pusat pivot +- radius model x skala x margin, dibulatkan ke piksel layar penuh supaya blok 2x2 RT tepat satu piksel layar (filter bilinear = box filter sempurna).
   Warna: RT dibuat berperilaku seperti kanvas. three hanya menerapkan tone mapping + enkode sRGB kalau target null atau isXRRenderTarget; flag itu dipasang SESUDAH storage dialokasikan (RGBA8 biasa, bukan SRGB8_ALPHA8)
   bersama texture.colorSpace = sRGB. Hasil: ACES (exposure renderer, drone 1.05) + enkode per fragmen = persis jalur langsung, material toneMapped:false (glow, api, LED) tidak tersentuh, kunci program shader sama dgn jalur langsung (tidak ada kompilasi ganda).
   Blend: RT berisi warna premultiplied + alpha, quad ONE,1-SRCA. Material AdditiveBlending dipatch sementara jadi CustomBlending (SRC_ALPHA,ONE; alpha tidak berubah) selama render RT, supaya glow tetap menambah ke latar dan tidak ikut meredupkan latar lewat alpha.
   Swa-uji sekali (glskySaInit): dua bidang abu-abu .5 (toneMapped false/true) harus terbaca ~188 (enkode sRGB) dan beda (ACES aktif). Gagal / ekstensi tidak ada / galat render = sa.ok=false, jalur langsung. Konteks hilang: glskySaReset. */
var GLSKY_SA_FS='precision highp float;varying vec2 vUv;uniform sampler2D uMap;uniform vec4 uUV;void main(){gl_FragColor=texture2D(uMap,mix(uUV.xy,uUV.zw,vUv));}';
var GLSKY_SA_AD=[],GLSKY_SA_SV=[];
function glskySaAlloc(T,cw,ch){
  var S=GLSKY,r=S.r,pr=r.getRenderTarget(),rt,ta=GLSG.cur?performance.now():0;
  rt=new T.WebGLRenderTarget(cw,ch,{depthBuffer:true,stencilBuffer:false,minFilter:T.LinearFilter,magFilter:T.LinearFilter,samples:S.saMs|0});
  r.setRenderTarget(rt);r.setRenderTarget(pr);   /* alokasi storage + framebuffer SEKARANG, sebelum flag (kalau flag lebih dulu, storage jadi SRGB8_ALPHA8) */
  if(ta&&GLSG.cur)(GLSG.cur.al||(GLSG.cur.al=[])).push([cw,ch,+(performance.now()-ta).toFixed(1)]);   /* [B4i] biaya alokasi RT */
  rt.isXRRenderTarget=true;rt.texture.colorSpace=T.SRGBColorSpace;   /* program: ACES + enkode sRGB (sama dgn kanvas); storage tetap RGBA8 */
  return rt;
}
function glskySaInit(T){
  var S=GLSKY,sa=S.sa,r=S.r,rt,ts,tc,m1,m2,b1=new Uint8Array(4),b2=new Uint8Array(4),pr,ca,ac;
  sa.tried=true;sa.ok=false;sa.sl=[null,null];sa.why='';
  if(!S.saOn||!r||!T||!T.WebGLRenderTarget){sa.why='mati/tidak ada';return;}
  sa.cap=Math.min(S.maxTex||2048,2048);
  sa.cc=sa.cc||new T.Color();
  if(!sa.q){
    sa.cam=new T.OrthographicCamera(0,1,1,0,-600,600);sa.cam.position.z=5;
    sa.u={uMap:{value:null},uUV:{value:new T.Vector4(0,0,1,1)}};
    sa.qs=new T.Scene();
    sa.q=new T.Mesh(S.geo,new T.ShaderMaterial({uniforms:sa.u,vertexShader:GLSKY_VS,fragmentShader:GLSKY_SA_FS,transparent:true,depthTest:false,depthWrite:false,side:T.DoubleSide,
      blending:T.CustomBlending,blendEquation:T.AddEquation,blendSrc:T.OneFactor,blendDst:T.OneMinusSrcAlphaFactor}));   /* premultiplied source-over, sama dgn mesh GLSky lain */
    sa.q.frustumCulled=false;sa.qs.add(sa.q);
  }
  rt=glskySaAlloc(T,64,64);
  ts=new T.Scene();tc=new T.OrthographicCamera(-1,1,1,-1,-10,10);tc.position.z=5;
  m1=new T.Mesh(S.geo,new T.MeshBasicMaterial({color:0x808080,toneMapped:false}));
  m2=new T.Mesh(S.geo,new T.MeshBasicMaterial({color:0x808080,toneMapped:true}));
  m1.position.set(-.5,0,0);m1.scale.set(1,2,1);m2.position.set(.5,0,0);m2.scale.set(1,2,1);ts.add(m1);ts.add(m2);
  pr=r.getRenderTarget();r.getClearColor(sa.cc);ca=r.getClearAlpha();ac=r.autoClear;
  rt.viewport.set(0,0,8,4);rt.scissor.set(0,0,8,4);rt.scissorTest=true;
  r.setRenderTarget(rt);r.setClearColor(0x000000,0);r.autoClear=true;
  try{r.render(ts,tc);r.readRenderTargetPixels(rt,1,1,1,1,b1);r.readRenderTargetPixels(rt,6,1,1,1,b2);}
  finally{r.setRenderTarget(pr);r.setClearColor(sa.cc,ca);r.autoClear=ac;}
  try{m1.material.dispose();m2.material.dispose();rt.dispose();}catch(eD){}
  sa.test=[b1[0],b1[3],b2[0]];
  if(Math.abs(b1[0]-188)>6||b1[3]<250){sa.why='enkode sRGB tidak cocok ('+b1[0]+'/'+b1[3]+', harus ~188/255)';return;}
  if(Math.abs(b2[0]-b1[0])<6){sa.why='tone mapping ACES tidak aktif di RT ('+b2[0]+' vs '+b1[0]+')';return;}
  sa.ok=true;
}
function glskySaReset(){
  var S=GLSKY,sa=S.sa,T=window.THREE;
  sa.ok=false;sa.sl=[null,null];sa.tried=false;
  if(S.saOn&&sa.err<3&&T)glskySaInit(T);
}
function glskySaFail(why){var sa=GLSKY.sa;sa.err++;sa.ok=false;sa.why=why;try{console.warn('[glsky] supersample unit kecil mati, jalur langsung:',why);}catch(e){}}
/* kapasitas RT per slot (0 = teleskop, 1 = drone): tumbuh seketika, menyusut pelan (kebutuhan terbesar 150 pemakaian terakhir x 2.5) supaya tidak bolak-balik alokasi */
function glskySaFit(T,i,vw,vh){
  var sa=GLSKY.sa,s=sa.sl[i]||(sa.sl[i]={rt:null,cw:0,ch:0,hw:0,hh:0,t:0}),nw=0,nh=0,old;
  if(vw>s.hw)s.hw=vw;if(vh>s.hh)s.hh=vh;
  if(!s.rt||vw>s.cw||vh>s.ch){nw=vw;nh=vh;}
  else if(++s.t>=150){if(s.cw>=s.hw*2.5&&s.ch>=s.hh*2.5){nw=s.hw;nh=s.hh;}s.hw=s.hh=0;s.t=0;}
  if(nw>0&&nh>0){
    nw=Math.min(sa.cap,Math.max(32,Math.ceil(nw*1.25/32)*32));nh=Math.min(sa.cap,Math.max(32,Math.ceil(nh*1.25/32)*32));
    old=s.rt;s.rt=glskySaAlloc(T,nw,nh);s.cw=nw;s.ch=nh;s.t=0;
    if(old){try{old.dispose();}catch(e){}}
  }
  return s.rt;
}
/* kotak layar (piksel kanvas, asal kiri-BAWAH = sumbu pass y-ke-atas) untuk pusat (cx,cy) dalam koordinat pass dan radius R (px CSS).
   null = di luar layar (tidak perlu digambar); 0 = terlalu besar untuk RT (pemanggil jatuh ke jalur langsung); selain itu {x0,y0,w,h,k} */
function glskySaBox(cx,cy,R){
  var S=GLSKY,sa=S.sa,sx=S.pw/S.W,sy=S.ph/S.H,x0=Math.max(0,Math.floor((cx-R)*sx)),x1=Math.min(S.pw,Math.ceil((cx+R)*sx)),y0=Math.max(0,Math.floor((cy-R)*sy)),y1=Math.min(S.ph,Math.ceil((cy+R)*sy)),w=x1-x0,h=y1-y0,k=S.saK,m;
  if(!(w>0&&h>0))return null;
  m=Math.max(w,h);if(m*k>sa.cap)k=sa.cap/m;
  if(w*h*k*k>2.2e6)k=Math.min(k,Math.sqrt(2.2e6/(w*h)));   /* batas area: unit raksasa (zoom dekat) lebih murah langsung daripada RT besar */
  if(!(k>=1.15))return 0;
  return {x0:x0,y0:y0,w:w,h:h,k:k};
}
function glskySaAddOn(scene){
  var L=GLSKY_SA_AD,V=GLSKY_SA_SV,k,m;
  L.length=0;V.length=0;
  scene.traverse(function(o){var mm=o.material,j,x;if(!mm)return;mm=mm.length?mm:[mm];for(j=0;j<mm.length;j++){x=mm[j];if(x&&x.blending===2&&L.indexOf(x)<0)L.push(x);}});   /* 2 = AdditiveBlending */
  for(k=0;k<L.length;k++){m=L[k];V.push(m.blendSrc,m.blendDst,m.blendEquation,m.blendSrcAlpha,m.blendDstAlpha);m.blending=5;m.blendSrc=204;m.blendDst=201;m.blendEquation=100;m.blendSrcAlpha=200;m.blendDstAlpha=201;}   /* 5 Custom; RGB: SRC_ALPHA,ONE; alpha: ZERO,ONE (alpha RT tidak berubah) */
}
function glskySaAddOff(){
  var L=GLSKY_SA_AD,V=GLSKY_SA_SV,k,m;
  for(k=0;k<L.length;k++){m=L[k];m.blending=2;m.blendSrc=V[k*5];m.blendDst=V[k*5+1];m.blendEquation=V[k*5+2];m.blendSrcAlpha=V[k*5+3];m.blendDstAlpha=V[k*5+4];}
  L.length=0;V.length=0;
}
/* render scene ke RT (sub-viewport kotak) lalu tempel quad ke kanvas utama. Dipanggil di tengah glskyRenderAll (autoClear sudah false). */
function glskySaUnit(T,slot,scene,box){
  var S=GLSKY,sa=S.sa,r=S.r,k=box.k,vw=Math.round(box.w*k),vh=Math.round(box.h*k),sx=S.pw/S.W,sy=S.ph/S.H,cam=sa.cam,rt=glskySaFit(T,slot,vw,vh),pr=r.getRenderTarget(),ca,ac=r.autoClear,u=sa.u,tm0=GLSG.cur?performance.now():0,tm1=0;
  cam.left=box.x0/sx;cam.right=(box.x0+box.w)/sx;cam.bottom=box.y0/sy;cam.top=(box.y0+box.h)/sy;cam.updateProjectionMatrix();
  rt.viewport.set(0,0,vw,vh);rt.scissor.set(0,0,vw,vh);rt.scissorTest=true;
  r.getClearColor(sa.cc);ca=r.getClearAlpha();
  glskySaAddOn(scene);
  r.setRenderTarget(rt);r.setClearColor(0x000000,0);r.autoClear=true;
  try{r.render(scene,cam);}
  finally{glskySaAddOff();r.setRenderTarget(pr);r.setClearColor(sa.cc,ca);r.autoClear=ac;}
  if(tm0)tm1=performance.now();
  u.uMap.value=rt.texture;u.uUV.value.set(0,0,vw/rt.width,vh/rt.height);
  sa.q.position.set((box.x0+box.w*.5)/sx,(box.y0+box.h*.5)/sy,0);sa.q.scale.set(box.w/sx,box.h/sy,1);
  r.render(sa.qs,S.tCam);
  if(tm0&&GLSG.cur){var tmc=GLSG.cur.tm||(GLSG.cur.tm=[0,0]);tmc[0]+=tm1-tm0;tmc[1]+=performance.now()-tm1;}   /* [B4i] [ms render RT, ms tempel quad] */
  sa.n++;sa.px+=vw*vh;
}
/* pass atas (teleskop + salinan tepi layar): true = sudah digambar lewat RT (atau tidak ada yang tampak); false = pemanggil render tScene langsung */
function glskySaTop(){
  var S=GLSKY,sa=S.sa,T=window.THREE,u=S.tUnits,i,j,b,a,c,bx=[],hf,R,done=0;
  if(!S.saOn||sa.err>=3)return false;
  try{
    if(!sa.tried)glskySaInit(T);
    if(!sa.ok)return false;
    hf=(typeof SCP3D_CFG!=='undefined'&&SCP3D_CFG.half)||64;
    for(i=0;i<u.length;i++){
      if(!u[i].visible)continue;
      b=glskySaBox(u[i].position.x,u[i].position.y,hf*u[i].scale.x*S.saM);
      if(b===0)return false;
      if(b)bx.push(b);
    }
    for(i=0;i<bx.length;i++)for(j=i+1;j<bx.length;j++){a=bx[i];c=bx[j];if(a.x0<c.x0+c.w&&c.x0<a.x0+a.w&&a.y0<c.y0+c.h&&c.y0<a.y0+a.h)return false;}   /* kotak tumpang tindih: unit tetangga ikut tergambar dua kali; langsung saja */
    for(i=0;i<bx.length;i++){glskySaUnit(T,0,S.tScene,bx[i]);done++;}
    if(done)sa.fr++;
    return true;
  }catch(e){glskySaFail(String(e&&e.message||e));return done>0;}
}
/* pass drone: badan drone lewat RT (cincin tahan = mesh garis dp.mt disembunyikan dulu), lalu mdScene tanpa badan (cincin tahan di atasnya, urutan lama). false = pemanggil render mdScene langsung */
function glskySaDrone(){
  var S=GLSKY,sa=S.sa,T=window.THREE,pv,hf,b,mt,vm,quad=false;
  if(!S.saOn||sa.err>=3||typeof DR3D==='undefined')return false;
  pv=DR3D.glPv;
  if(!pv||!pv.visible||!DR3D.glIn||DR3D.glTg!==2)return false;
  try{
    if(!sa.tried)glskySaInit(T);
    if(!sa.ok)return false;
    hf=(typeof DR3D_CFG!=='undefined'&&DR3D_CFG.half)||50;
    b=glskySaBox(pv.position.x,pv.position.y,hf*pv.scale.x*S.saMd);
    if(b===0)return false;
    mt=S.dp&&S.dp.mt;vm=mt?mt.visible:false;
    if(b){
      if(mt)mt.visible=false;
      try{glskySaUnit(T,1,S.mdScene,b);quad=true;}
      finally{if(mt)mt.visible=vm;}
    }
    pv.visible=false;
    try{S.r.render(S.mdScene,S.tCam);}finally{pv.visible=true;}
    if(quad)sa.fr++;
    return true;
  }catch(e){glskySaFail(String(e&&e.message||e));return quad;}
}

/* [B4i] warm jalur RT supersample pass atas (teleskop) pasca-kapsul, sesudah scp/dr. Flush asli: glskySaTop -> glskySaUnit = alokasi RT seukuran kotak unit + render unit ke RT + tempel quad sa.q (program ShaderMaterial sendiri,
   tidak ada di daftar compileAsync pra-kapsul). glskyWarmOne cuma merender tScene langsung ke kanvas utama, jadi jalur ini baru pernah jalan di flush pertama (ff[0] r.top ±52 ms vs steady 8,5 ms).
   Di sini: compileAsync(sa.qs) -> alokasi RT seukuran unit terbesar (glskySaFit slot 0) -> render tiap unit tScene ke RT (scissor 1x1 di RT) -> tempel quad 1x1 ke kanvas utama (scissor 1x1, RT transparan = tidak mengubah piksel).
   Risiko sama dgn warm B4c: piksel 1x1 pojok kiri-bawah kanvas bisa berkedip <=1 vsync. Flag: ?glwsa=0 = mati (A/B). Hasil di dump: glseg.w1.sa = {ok, why, ms, cmp, al, rt:[w,h], rtMs, qMs}. */
function glskySaWarm(wm){
  var S=GLSKY,sa=S.sa,T=window.THREE,r=S.r,u=S.tUnits||[],tu=S.tScene&&S.tScene.children||[],i,mx=0,hf,b,vw,vh,rt,pr,ca,ac,sT,sr,t0=performance.now(),t1,o={ok:0,why:''};
  wm.sa=o;
  if(!S.saOn||sa.err>=3||!r||!T){o.why='off';return;}
  if(!sa.tried)glskySaInit(T);
  if(!sa.ok||!sa.q||!sa.qs){o.why='no-sa';return;}
  for(i=0;i<u.length;i++)if(u[i].scale.x>mx)mx=u[i].scale.x;
  o.sc=mx>0?+mx.toFixed(2):.5;mx=o.sc;   /* tUnits masih kosong sebelum flush pertama (glskyAttachTop dipanggil saat teleskop pertama digambar): skala cadangan .5 = RT 448x448 di run headless 360x634; ukuran asli dibaca dari ffd[i].sa.rt1 lalu stel ulang */
  hf=(typeof SCP3D_CFG!=='undefined'&&SCP3D_CFG.half)||64;
  b=glskySaBox(S.W*.5,S.H*.5,hf*mx*S.saM);
  if(!b){o.why='box'+(b===0?'0':'n');return;}
  vw=Math.round(b.w*b.k);vh=Math.round(b.h*b.k);
  try{if(r.compileAsync)r.compileAsync(sa.qs,S.tCam).catch(function(){});else r.compile(sa.qs,S.tCam);}catch(eC){}
  o.cmp=Math.round(performance.now()-t0);
  t1=performance.now();
  rt=glskySaFit(T,0,vw,vh);
  o.al=Math.round(performance.now()-t1);o.rt=[rt.width,rt.height];
  pr=r.getRenderTarget();sT=r.getScissorTest();sr=r.getScissor(new T.Vector4());ac=r.autoClear;r.getClearColor(sa.cc);ca=r.getClearAlpha();
  try{
    t1=performance.now();
    rt.viewport.set(0,0,vw,vh);rt.scissor.set(0,0,1,1);rt.scissorTest=true;
    r.setRenderTarget(rt);r.setClearColor(0x000000,0);r.autoClear=true;
    for(i=0;i<tu.length;i++)glskyWarmOne(r,S.tScene,S.tCam,tu[i]);   /* render ke RT (viewport/scissor RT dipakai three, bukan scissor renderer) */
    try{if(typeof SCP3D!=='undefined'&&SCP3D.state===2&&SCP3D.sc&&SCP3D.sc.parent!==S.tScene){glskyWarmOne(r,SCP3D.sc,S.tCam,null);o.scp=1;}}catch(eSc){}   /* isi pass atas yang sebenarnya (scp belum menempel ke tScene sebelum gambar pertama); biaya first-use sudah dibayar irisan scp, ini cuma target RT */
    r.setRenderTarget(pr);
    o.rtMs=Math.round(performance.now()-t1);
    t1=performance.now();
    sa.u.uMap.value=rt.texture;sa.u.uUV.value.set(0,0,1/rt.width,1/rt.height);
    sa.q.position.set(.5,.5,0);sa.q.scale.set(1,1,1);
    r.autoClear=false;r.setScissorTest(true);r.setScissor(0,0,1,1);
    r.render(sa.qs,S.tCam);
    o.qMs=Math.round(performance.now()-t1);
    o.ok=1;
  }catch(e){o.why=String(e&&e.message||e).slice(0,80);}
  finally{try{r.setRenderTarget(pr);r.setClearColor(sa.cc,ca);r.autoClear=ac;r.setScissorTest(!!sT);if(sr)r.setScissor(sr.x,sr.y,sr.z,sr.w);}catch(e2){}}
  o.ms=Math.round(performance.now()-t0);
}
function glskyRenderAll(){
  var S=GLSKY,i,top=false,ex,tg;
  S.sa.n=0;S.sa.px=0;
  glsgScan('main',S.scene);tg=glsgT();S.r.render(S.scene,S.cam);glsgR('r.main',tg);
  for(i=0;i<S.tUnits.length;i++)if(S.tUnits[i].visible){top=true;break;}
  if(!top&&!S.pAct&&!S.dpAct&&!S.hAct)return;
  S.r.autoClear=false;
  try{
    if(S.hAct&&S.hScene){S.r.clearDepth();glsgScan('head',S.hScene);tg=glsgT();S.r.render(S.hScene,S.tCam);glsgR('r.head',tg);}   /* [G4.18] pass kepala komet: di atas scene utama, di bawah teleskop (urutan 2D lama: komet digambar sebelum teleskop/planet) */
    if(top){S.r.clearDepth();glsgScan('top',S.tScene);tg=glsgT();if(!glskySaTop())S.r.render(S.tScene,S.tCam);glsgR('r.top',tg);}   /* pass atas: teleskop ([G4.15] lewat RT supersample; false = langsung) */
    if(S.pAct&&S.pScene){S.r.clearDepth();glsgScan('pl',S.pScene);tg=glsgT();S.r.render(S.pScene,S.tCam);glsgR('r.pl',tg);}      /* [G4.8] pass planet: di atas teleskop (urutan 2D lama), di bawah #sky */
    if(S.dpAct&&S.dpOk&&S.dbScene){                                          /* [G4.10] pass drone: di atas planet + efek planet */
      S.r.clearDepth();glsgScan('dfx',S.dbScene);tg=glsgT();S.r.render(S.dbScene,S.tCam);glsgR('r.dfx',tg);                          /*   efek di BAWAH drone (garis/titik/blob: tanpa depth) */
      try{if(typeof dr3dGlSync==='function')dr3dGlSync();}catch(eDs){}
      ex=S.r.toneMappingExposure;S.r.toneMappingExposure=1.05;                /*   exposure drone = renderer 'small' lama */
      try{S.r.clearDepth();glsgScan('dmd',S.mdScene);tg=glsgT();if(!glskySaDrone())S.r.render(S.mdScene,S.tCam);glsgR('r.dmd',tg);}finally{S.r.toneMappingExposure=ex;}   /*   Group drone + cincin tahan (di atas drone); [G4.15] drone lewat RT supersample */
    }
  }finally{S.r.autoClear=true;}
  if(S.pAct&&S.pChk){S.pChk=false;try{if(typeof pl3dGlVerify==='function')pl3dGlVerify();}catch(eV){}}   /* diagnosa shader planet, sekali, sesudah render pertama */
}
/* [G4.18] komet/Konami: efek (aurora, ekor, percikan, glow, cincin kejut) dicatat sebagai op GL sebelum flush; kepala batu 3D = Group di pass kepala */
function glskyCometOn(){var S=GLSKY;return !!(S.act&&S.rec&&S.lay&&S.ssOn&&S.cometOn&&S.ok&&S.r&&typeof glfDot==='function');}
function glskyHeadsOn(){var S=GLSKY;return !!(S.act&&S.rec&&S.cometOn&&S.ok&&S.r&&S.hScene&&S.err<3);}
function glskyHeadsAttach(grp){var S=GLSKY;if(!S.hScene||!grp)return false;try{if(grp.parent!==S.hScene)S.hScene.add(grp);return true;}catch(e){return false;}}
function glskyAstOn(){var S=GLSKY;return !!(S.act&&S.astOn&&S.ok&&S.r);}   /* [PATCH G4.1] true = batu belakang boleh ikut scene GL */
function glskyBhShockOn(){var S=GLSKY;return !!(S.act&&S.rec&&S.lay&&S.bhShockOn&&S.ok&&S.r);}   /* [PATCH G3d] true = BH shockwaves digambar di GL */
function glskySnOn(){var S=GLSKY;return !!(S.act&&S.rec&&S.lay&&S.snOn&&S.ok&&S.r);}   /* [PATCH G3e] true = supernova/belt digambar di GL */
function glskyTrigOn(){var S=GLSKY;return !!(S.act&&S.rec&&S.lay&&S.trigOn&&S.ok&&S.r);}   /* [FIX] +rec: drawRipple dipanggil juga setelah flush (drawTargetLock, drawHole 2D) -> harus tetap 2D */   /* [PATCH G3f] true = trigger ripple / pulse shock di GL */
/* [PATCH G4.14] guard !CAMERA_MODE diangkat: mode kamera Pleiades = inti saja di mesh bintang GL */
function glskyPleiOn(){var S=GLSKY;return !!(S.act&&S.rec&&S.lay&&S.starOn&&S.pleiOn&&S.inst);}   /* [PATCH G3g] Pleiades halo+inti di mesh bintang GL */
function glskyPortalOn(){var S=GLSKY;return !!(S.act&&S.rec&&S.lay&&S.portalOn&&S.ok&&S.r);}   /* [PATCH G4.2] true = cincin portal overview ke GL billboard */
function glskyFxOn(){var S=GLSKY;return !!(S.act&&S.rec&&S.lay&&S.fxOn&&S.inst&&S.ok&&S.r);}   /* [PATCH G3h] true = efek kecil (avail/dust/focus/lock) boleh dicatat ke GL; false di luar jendela rekam */
function glskyPlOn(){var S=GLSKY;return !!(S.act&&S.rec&&S.lay&&S.plOn&&S.ok&&S.r&&S.pScene&&S.pErr<3);}   /* [G4.8] true = permukaan planet boleh dijadwalkan ke pass planet (sebelum flush) */
function glskyPlWait(){var S=GLSKY;return !!(S.on&&S.plOn&&S.lay&&!S.test&&S.err<3&&S.pErr<3);}   /* [G4.8] true = jalur lama planet menunggu (GLSky aktif/sedang dimuat): jangan bangun renderer 'big' dulu */
function glskyPlSet(v){GLSKY.pAct=!!v;}
function glskyBhOn(){var S=GLSKY;return !!(S.act&&S.rec&&S.lay&&S.bhOn&&S.ok&&S.r);}   /* [PATCH G4.3] true = body BH ke GL */


/* ---------- [G4.9] EFEK PLANET di PASS PLANET (pScene, kamera y-ke-ATAS: y_pass = H - y_stage) ----------
   Dicatat 17-planet3d.js (pl3dGlFx) SEBELUM glskyFlush, digambar sesudah permukaan (renderOrder 0): aurora 10, blob (flare) 11, titik (debris) 12, garis (debris/petir) 13.
   Blend premultiplied source-over (ONE, 1-SRCA) = efek 'lighter' di kanvas transparan yang lalu ditumpuk normal di atas planet (cara 2D lama). Koordinat titik/garis/blob = ruang pass (planet-ruang sudah dipetakan JS).
   AURORA = satu mesh instancing kolom (3 lapisan x ceil(PW/st) kolom). VS menghitung per titik-sudut kolom: limb, env, tinggi tirai, alpha dari fungsi waktu + fase (dikurangi mod 2pi di JS), lalu memetakan planet-ruang -> pass lewat affine
   uPA/uPC. FS = gradien vertikal analitik (stop sama dgn sprite 1x64 lama). Tidak ada bake, keyframe, kanvas offscreen, drawImage. */
var GLSKY_AU_VS='attribute vec2 iX;uniform vec4 uPA;uniform vec4 uPC;uniform vec4 uG;uniform vec4 uS;uniform vec4 uL0[3];uniform vec4 uL1[3];uniform vec4 uPh[3];uniform float uPm[3];varying float vV;varying float vAl;varying float vS;'+
  'void main(){'+
  'vec4 l0=iX.y<0.5?uL0[0]:(iX.y<1.5?uL0[1]:uL0[2]);vec4 l1=iX.y<0.5?uL1[0]:(iX.y<1.5?uL1[1]:uL1[2]);vec4 ph=iX.y<0.5?uPh[0]:(iX.y<1.5?uPh[1]:uPh[2]);float pm=iX.y<0.5?uPm[0]:(iX.y<1.5?uPm[1]:uPm[2]);'+
  'float xv=iX.x+position.x*uS.w;float dx=xv-uG.x;float limb=uG.y-sqrt(max(uG.z*uG.z-dx*dx,0.0));'+
  'float te=clamp((abs(xv-uS.x)/uG.w-0.08)/0.6,0.0,1.0);float env=te*te*(3.0-2.0*te);float TP=6.2831853/uG.w;'+
  'float a1=l0.x*TP*xv+ph.x;float b1=l0.y*TP*xv+ph.y;float m=0.5+0.5*(0.62*sin(a1)+0.38*sin(b1));'+
  'float ray=0.5+0.5*(0.6*sin(xv*0.20943951+ph.z)+0.4*sin(xv*0.36959914+ph.w));'+
  'float mm=0.65+0.35*sin((1.7*l0.x+l0.y)*TP*xv+pm);float ry=l0.w;'+
  'float al=uS.y*l0.z*env*mm*((1.0-ry*0.65)+ry*0.65*ray);float h=uS.z*l1.x*(0.3+0.7*m)*((1.0-ry*0.25)+ry*0.35*ray);'+
  'float yb=limb-l1.y;float vv=0.5-position.y;float y=(yb-h)+vv*h*1.111;'+
  'vV=vv;vAl=min(al,1.0)*uPC.z;vS=iX.y;'+
  'vec2 q=vec2(uPA.x*xv+uPA.y*y+uPC.x,uPA.z*xv+uPA.w*y+uPC.y);'+
  'gl_Position=projectionMatrix*modelViewMatrix*vec4(q,0.0,1.0);}';
/* stop gradien = sprite lama (17-planet3d.js pl3dAurSpr): sprite 0 (kabut) warna atm, alpha 0/.08/.3/.6/.6/0 di v 0/.3/.6/.85/.9/1; sprite 1 (tirai) warna cT/cT/atm/cB/cB/cB, alpha 0/.16/.5/.85/.8/0 di v 0/.22/.5/.74/.9/1 */
var GLSKY_AU_FS='precision highp float;uniform vec3 uCa;uniform vec3 uCb;uniform vec3 uCt;varying float vV;varying float vAl;varying float vS;'+
  'void main(){float v=clamp(vV,0.0,1.0);vec3 c;float a;'+
  'if(vS<0.5){c=uCa;'+
  'if(v<0.3)a=mix(0.0,0.08,v/0.3);else if(v<0.6)a=mix(0.08,0.3,(v-0.3)/0.3);else if(v<0.85)a=mix(0.3,0.6,(v-0.6)/0.25);else if(v<0.9)a=0.6;else a=mix(0.6,0.0,(v-0.9)/0.1);}'+
  'else{'+
  'if(v<0.22){c=uCt;a=mix(0.0,0.16,v/0.22);}else if(v<0.5){c=mix(uCt,uCa,(v-0.22)/0.28);a=mix(0.16,0.5,(v-0.22)/0.28);}'+
  'else if(v<0.74){c=mix(uCa,uCb,(v-0.5)/0.24);a=mix(0.5,0.85,(v-0.5)/0.24);}else{c=uCb;if(v<0.9)a=mix(0.85,0.8,(v-0.74)/0.16);else a=mix(0.8,0.0,(v-0.9)/0.1);}}'+
  'a*=vAl;gl_FragColor=vec4(c*a,a);}';
/* BLOB (flare): elips radial 3-stop. iB = cx,cy,rx,ry; iQ = rotasi (rad, ruang pass), p1 (posisi stop tengah), a0, a1 (alpha di 0 dan p1; 0 di tepi); iC0/iC1 = rgb di stop 0 dan stop tengah/tepi (non-premultiplied seperti gradien kanvas) */
var GLSKY_BL_VS='attribute vec4 iB;attribute vec4 iQ;attribute vec4 iC0;attribute vec4 iC1;varying vec2 vQ;varying vec4 vK;varying vec3 vC0;varying vec3 vC1;'+
  'void main(){vec2 q=position.xy*2.0;vec2 s=vec2(q.x*iB.z,q.y*iB.w);float c=cos(iQ.x);float sn=sin(iQ.x);vec2 p=iB.xy+vec2(s.x*c-s.y*sn,s.x*sn+s.y*c);'+
  'vQ=q;vK=iQ;vC0=iC0.rgb;vC1=iC1.rgb;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,0.0,1.0);}';
var GLSKY_BL_FS='precision highp float;varying vec2 vQ;varying vec4 vK;varying vec3 vC0;varying vec3 vC1;'+
  'void main(){float d=length(vQ);if(d>=1.0){gl_FragColor=vec4(0.0);return;}float p1=max(vK.y,0.001);vec3 c;float a;'+
  'if(d<p1){float s=d/p1;c=mix(vC0,vC1,s);a=mix(vK.z,vK.w,s);}else{c=vC1;a=mix(vK.w,0.0,(d-p1)/max(1.0-p1,0.001));}'+
  'gl_FragColor=vec4(c*a,a);}';
function glskyPfBuild(T){
  var S=GLSKY,pf={},V4=function(){return new T.Vector4();},m,au,i;
  au=glskyInstGeo(T,[['iX',2]],3000);
  pf.au={B:au,cap:3000,N:0,key:'',uni:{uPA:{value:V4()},uPC:{value:V4()},uG:{value:V4()},uS:{value:V4()},uL0:{value:[V4(),V4(),V4()]},uL1:{value:[V4(),V4(),V4()]},uPh:{value:[V4(),V4(),V4()]},uPm:{value:[0,0,0]},
    uCa:{value:[1,1,1]},uCb:{value:[1,1,1]},uCt:{value:[1,1,1]}}};
  /* uCa/uCb/uCt: array 3 float -> uniform vec3 lewat three (array of numbers diterima sebagai vec3) */
  m=GLSKY_T_MESH(T,au,GLSKY_AU_VS,GLSKY_AU_FS,pf.au.uni,10);pf.au.m=m;
  pf.bb=glskyInstGeo(T,[['iB',4],['iQ',4],['iC0',4],['iC1',4]],24);
  pf.mb=GLSKY_T_MESH(T,pf.bb,GLSKY_BL_VS,GLSKY_BL_FS,{},11);
  pf.bs=glskyInstGeo(T,[['iA',4],['iG',4],['iC',4]],128);
  pf.ms=GLSKY_T_MESH(T,pf.bs,GLSKY_STAR_VS,GLSKY_STAR_FS,{uS:{value:1}},12);
  pf.bl=glskyInstGeo(T,[['iP',4],['iL',4],['iW',2]],768);
  pf.ml=GLSKY_T_MESH(T,pf.bl,GLSKY_LINE_VS,GLSKY_LINE_FS,{uS:{value:1},uSoft:{value:1}},13);
  S.pScene.add(m);S.pScene.add(pf.mb);S.pScene.add(pf.ms);S.pScene.add(pf.ml);
  S.pf=pf;S.pfOk=true;
}
function glskyPfOn(){var S=GLSKY;return !!(S.plfxOn&&S.pfOk&&S.pf&&glskyPlOn());}
/* titik padat (debris, ujung): x,y = ruang pass, r = radius px, c = [r,g,b] 0..1, al = alpha */
function glskyPfDot(x,y,r,c,al){
  var S=GLSKY,B=S.pf&&S.pf.bs,n=S.pdn,a,o;
  if(!B||n>=B.cap||!(al>.004))return;
  a=B.a;o=n*4;
  a.iA[o]=x;a.iA[o+1]=y;a.iA[o+2]=0;a.iA[o+3]=r;
  a.iG[o]=0;a.iG[o+1]=0;a.iG[o+2]=0;a.iG[o+3]=0;
  a.iC[o]=c[0];a.iC[o+1]=c[1];a.iC[o+2]=c[2];a.iC[o+3]=al>1?1:al;
  S.pdn=n+1;
}
function glskyPfLine(x0,y0,x1,y1,w,c,al,soft){
  var S=GLSKY,B=S.pf&&S.pf.bl,n=S.pln,a,o;
  if(!B||n>=B.cap||!(al>.004))return;
  a=B.a;o=n*4;
  a.iP[o]=x0;a.iP[o+1]=y0;a.iP[o+2]=x1;a.iP[o+3]=y1;
  a.iL[o]=c[0];a.iL[o+1]=c[1];a.iL[o+2]=c[2];a.iL[o+3]=al>1?1:al;
  a.iW[n*2]=w;a.iW[n*2+1]=soft?1:0;
  S.pln=n+1;
}
/* blob radial: c0 = warna stop 0, c1 = warna stop p1 (dan tepi); alpha a0 di 0, a1 di p1, 0 di tepi */
function glskyPfBlob(x,y,rx,ry,rot,p1,a0,a1,c0,c1){
  var S=GLSKY,B=S.pf&&S.pf.bb,n=S.pbn,a,o;
  if(!B||n>=B.cap||!(a0>.004||a1>.004))return;
  a=B.a;o=n*4;
  a.iB[o]=x;a.iB[o+1]=y;a.iB[o+2]=rx;a.iB[o+3]=ry;
  a.iQ[o]=rot;a.iQ[o+1]=p1;a.iQ[o+2]=a0;a.iQ[o+3]=a1;
  a.iC0[o]=c0[0];a.iC0[o+1]=c0[1];a.iC0[o+2]=c0[2];a.iC0[o+3]=0;
  a.iC1[o]=c1[0];a.iC1[o+1]=c1[1];a.iC1[o+2]=c1[2];a.iC1[o+3]=0;
  S.pbn=n+1;
}
/* aurora: siapkan instance kolom (statis per PW/lapisan/lebar kolom) + jumlah yang digambar frame ini. nL = 3. Mengembalikan lebar kolom st yang dipakai (px planet-ruang). */
function glskyPfAurPrep(PWv,nL){
  var S=GLSKY,au=S.pf&&S.pf.au,st,N,i,j,k,arr,key;
  if(!au)return 0;
  st=Math.max(2,Math.ceil(PWv*nL/au.cap));N=Math.ceil(PWv/st);
  key=PWv+'|'+nL+'|'+st;
  if(au.key!==key){
    arr=au.B.a.iX;k=0;
    for(i=0;i<nL;i++)for(j=0;j<N;j++){arr[k++]=(j+.5)*st;arr[k++]=i;}
    au.N=N*nL;au.key=key;au.dirty=true;
  }
  S.pan=au.N;
  return st;
}
function glskyPfUpload(){
  var S=GLSKY,pf=S.pf,au,at;
  if(!pf)return;
  if(!S.pfOk){pf.au.m.visible=false;pf.mb.visible=false;pf.ms.visible=false;pf.ml.visible=false;return;}   /* efek GL dimatikan (galat): sembunyikan sisa frame lalu */
  pf.ms.material.uniforms.uS.value=S.S;pf.ml.material.uniforms.uS.value=S.S;pf.ml.material.uniforms.uSoft.value=S.soft?1:0;
  au=pf.au;
  au.m.visible=S.pan>0;au.B.g.instanceCount=S.pan>0?S.pan:0;
  if(S.pan>0&&au.dirty){at=au.B.g.attributes.iX;try{at.clearUpdateRanges();at.addUpdateRange(0,au.N*2);}catch(e){}at.needsUpdate=true;au.dirty=false;}
  glskyInstUpload(pf.bb,pf.mb,S.pbn);glskyInstUpload(pf.bs,pf.ms,S.pdn);glskyInstUpload(pf.bl,pf.ml,S.pln);
}

/* ================= [G4.10] PASS DRONE =================
   Efek drone (trail, tether + paket sinyal, berkas, kaki/cincin mendarat, ping, halo lembut, cincin tahan) = garis/titik/blob instancing di dua scene yang dirender sesudah pass planet (glskyRenderAll):
   dbScene = di BAWAH drone (blob RO 0, garis RO 1, titik RO 2), mdScene = Group drone 3D + cincin tahan (garis RO 10, transparan sehingga selalu di atas badan opaque drone).
   Argumen helper = koordinat STAGE (y ke bawah, sama dgn #sky); y dibalik di sini (kamera pass y-ke-atas = tCam). Warna = string 'r,g,b' 0..255 (glskyCol). Logika/timing tetap di TXFX (08-tx-drone.js). */
function glskyDpBuild(T){
  var S=GLSKY,dp={};
  dp.bb=glskyInstGeo(T,[['iB',4],['iQ',4],['iC0',4],['iC1',4]],24);
  dp.mb=GLSKY_T_MESH(T,dp.bb,GLSKY_BL_VS,GLSKY_BL_FS,{},0);
  dp.bl=glskyInstGeo(T,[['iP',4],['iL',4],['iW',2]],1024);
  dp.ml=GLSKY_T_MESH(T,dp.bl,GLSKY_LINE_VS,GLSKY_LINE_FS,{uS:{value:1},uSoft:{value:1}},1);
  dp.bs=glskyInstGeo(T,[['iA',4],['iG',4],['iC',4]],128);
  dp.ms=GLSKY_T_MESH(T,dp.bs,GLSKY_STAR_VS,GLSKY_STAR_FS,{uS:{value:1}},2);
  dp.tl=glskyInstGeo(T,[['iP',4],['iL',4],['iW',2]],768);
  dp.mt=GLSKY_T_MESH(T,dp.tl,GLSKY_LINE_VS,GLSKY_LINE_FS,{uS:{value:1},uSoft:{value:1}},10);
  S.dbScene.add(dp.mb);S.dbScene.add(dp.ml);S.dbScene.add(dp.ms);S.mdScene.add(dp.mt);
  S.dp=dp;S.dpOk=true;
}
function glskyDpSet(){GLSKY.dpAct=true;}   /* ada isi di pass drone frame ini (mis. pivot drone 3D) */
function glskyDpSeg(x0,y0,x1,y1,w,c,al,top){
  var S=GLSKY,dp=S.dp,B,n,a,o,H=S.H;
  if(!dp||!(al>.004))return;
  if(top){B=dp.tl;n=S.dtn;}else{B=dp.bl;n=S.dln;}
  if(n>=B.cap)return;
  a=B.a;o=n*4;
  a.iP[o]=x0;a.iP[o+1]=H-y0;a.iP[o+2]=x1;a.iP[o+3]=H-y1;
  a.iL[o]=c[0];a.iL[o+1]=c[1];a.iL[o+2]=c[2];a.iL[o+3]=al>1?1:al;
  a.iW[n*2]=w;a.iW[n*2+1]=0;
  if(top)S.dtn=n+1;else S.dln=n+1;
  S.dpAct=true;
}
function glskyDpDot(x,y,r,col,al){   /* lingkaran padat (g.arc + fill) */
  var S=GLSKY,dp=S.dp,B,n=S.dsn,a,o,c;
  if(!dp||!(al>.004)||!(r>.1))return;
  B=dp.bs;if(n>=B.cap)return;
  a=B.a;o=n*4;c=glskyCol(col);
  a.iA[o]=x;a.iA[o+1]=S.H-y;a.iA[o+2]=0;a.iA[o+3]=r;
  a.iG[o]=0;a.iG[o+1]=0;a.iG[o+2]=0;a.iG[o+3]=0;
  a.iC[o]=c[0];a.iC[o+1]=c[1];a.iC[o+2]=c[2];a.iC[o+3]=al>1?1:al;
  S.dsn=n+1;S.dpAct=true;
}
/* elips padat (kaki): rot = sudut sumbu-x elips di ruang STAGE (rad, y ke bawah); tepi lembut ~1.2 px (pengganti antialias) */
function glskyDpEll(x,y,rx,ry,rot,col,al){
  var S=GLSKY,dp=S.dp,B,n=S.dbn,a,o,c,p1;
  if(!dp||!(al>.004)||!(rx>.3))return;
  B=dp.bb;if(n>=B.cap)return;
  a=B.a;o=n*4;c=glskyCol(col);
  p1=Math.max(.55,1-1.2/Math.max(1,Math.min(rx,ry)));
  a.iB[o]=x;a.iB[o+1]=S.H-y;a.iB[o+2]=rx;a.iB[o+3]=ry;
  a.iQ[o]=-rot;a.iQ[o+1]=p1;a.iQ[o+2]=al;a.iQ[o+3]=al;
  a.iC0[o]=c[0];a.iC0[o+1]=c[1];a.iC0[o+2]=c[2];a.iC0[o+3]=0;
  a.iC1[o]=c[0];a.iC1[o+1]=c[1];a.iC1[o+2]=c[2];a.iC1[o+3]=0;
  S.dbn=n+1;S.dpAct=true;
}
/* goresan busur (g.arc + stroke); seg = panjang ruas px (kecil untuk garis tebal supaya sambungan rapat) */
function glskyDpArc(cx,cy,r,a0,a1,w,col,al,top,seg){
  var c,n,i,a,xa,ya,xb,yb;
  if(!(al>.004)||!(r>.5))return;
  c=glskyCol(col);n=Math.max(8,Math.min(256,Math.ceil(Math.abs(a1-a0)*r/(seg||4))));
  xa=cx+Math.cos(a0)*r;ya=cy+Math.sin(a0)*r;
  for(i=1;i<=n;i++){
    a=a0+(a1-a0)*i/n;xb=cx+Math.cos(a)*r;yb=cy+Math.sin(a)*r;
    glskyDpSeg(xa,ya,xb,yb,w,c,al,top);xa=xb;ya=yb;
  }
}
function glskyDpUpload(){
  var S=GLSKY,dp=S.dp;
  if(!dp)return;
  if(!S.dpOk||!S.dpAct){dp.mb.visible=false;dp.ml.visible=false;dp.ms.visible=false;dp.mt.visible=false;return;}
  dp.ml.material.uniforms.uS.value=S.S;dp.mt.material.uniforms.uS.value=S.S;dp.ms.material.uniforms.uS.value=S.S;
  dp.ml.material.uniforms.uSoft.value=0;dp.mt.material.uniforms.uSoft.value=0;
  glskyInstUpload(dp.bb,dp.mb,S.dbn);glskyInstUpload(dp.bl,dp.ml,S.dln);glskyInstUpload(dp.bs,dp.ms,S.dsn);glskyInstUpload(dp.tl,dp.mt,S.dtn);
}

function glskyBuild(){
  var S=GLSKY,T=window.THREE,c,r;
  if(S.err>=3||S.r)return;
  try{
    c=document.createElement('canvas');c.id='glsky';c.setAttribute('aria-hidden','true');
    c.style.cssText='position:fixed;left:0;top:0;width:100%;height:100%;display:block;pointer-events:none;touch-action:none';
    r=new T.WebGLRenderer({canvas:c,alpha:true,premultipliedAlpha:true,antialias:!!S.aa,depth:true,stencil:false,preserveDrawingBuffer:false,powerPreference:'low-power'});   /* [PATCH G4.1] depth:true supaya unit 3D (batu) bisa depthTest; lapisan 2D-style tetap depthTest:false */
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
      S.W=S.H=S.pw=S.ph=0;S.ok=true;glskyShow(true);
      try{glskySaReset();}catch(eSaR){}   /* [G4.15] RT lama tidak sah: bangun ulang + uji lagi */   /* three memasang ulang state sendiri; ukuran dipaksa dihitung ulang */
    },false);
    S.cv=c;S.r=r;
    try{S.maxTex=r.capabilities.maxTextureSize||2048;}catch(eM0){}
    S.scene=new T.Scene();
    S.cam=new T.OrthographicCamera(0,1,0,1,-600,600);   /* [PATCH G4.1] near/far sama dgn AST3D (iZ batu ~±120*sz); dulu 0.1..10 cukup utk quad 2D saja */
    S.cam.position.z=5;
    S.tCam=new T.OrthographicCamera(0,1,1,0,-600,600);S.tCam.position.z=5;   /* [FIX G4.5] y-ke-ATAS (top=H, bottom=0) */
    S.tScene=new T.Scene();S.tUnits=[];
    S.pScene=new T.Scene();   /* [G4.8] pass planet */
    S.hScene=new T.Scene();   /* [G4.18] pass kepala komet (di bawah pass teleskop) */
    S.dbScene=new T.Scene();S.mdScene=new T.Scene();   /* [G4.10] pass drone: bawah + (drone, atas) */
    S.root=new T.Group();S.scene.add(S.root);
    S.layers=new T.Group();S.root.add(S.layers);
    S.geo=new T.PlaneGeometry(1,1);
    try{glskyInstBuild(T);}catch(eIn){S.inst=false;try{console.warn('[glsky] instancing gagal, bintang/garis tetap 2D:',eIn);}catch(e0){}}   /* gagal di sini TIDAK menjatuhkan GL: latar tetap jalan, bintang/garis 2D */
    try{glskyPfBuild(T);}catch(ePf){S.pfOk=false;S.pf=null;try{console.warn('[glsky] efek planet GL gagal, tetap 2D:',ePf);}catch(e0b){}}   /* [G4.9] gagal di sini TIDAK menjatuhkan GL: efek planet tetap 2D */
    try{glskyDpBuild(T);}catch(eDp){S.dpOk=false;S.dp=null;try{console.warn('[glsky] pass drone gagal, drone tetap layer #gldrone:',eDp);}catch(e0c){}}   /* [G4.10] gagal di sini TIDAK menjatuhkan GL */
    S.dummy=new T.DataTexture(new Uint8Array([0,0,0,0]),1,1,T.RGBAFormat);S.dummy.needsUpdate=true;
    if(S.test)S.root.add(glskyBuildTest(T));
    cv.parentNode.insertBefore(c,cv);   /* tepat SEBELUM #sky di dalam #stage => di bawahnya; urutan DOM lain tidak berubah */
    glskyMirror();
    try{S.mo=new MutationObserver(glskyMirror);S.mo.observe(cv,{attributes:true,attributeFilter:['style']});}catch(eM){}
    try{if(S.saOn)glskySaInit(T);}catch(eSa){S.sa.ok=false;S.sa.why=String(eSa&&eSa.message||eSa);}   /* [G4.15] swa-uji RT; gagal = jalur langsung */
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

/* ================= [G5.1] WARM GL PRA-KAPSUL =================
   Masalah (dump 12 Nov, itel A6610L, ?glsky=1 default): renderer GLSky, 21 program shader, 20 texture dan strip planet pertama baru dibangun di frame() PERTAMA sesudah Blue
   (glNew GLSMALL +480 ms sesudah entered, compile 103 ms + render 334 ms, longtask 972 ms / LoAF 1238 ms di 05-sector-ui frame). Warm lama jalan di renderer 'big'/'small' yang di mode GL
   dibuang / tidak dipakai (PL3D state 0 = tidak pernah dibangun di boot), jadi konteks yang benar-benar menggambar tetap dingin.
   Sekarang 07-boot preStart (langkah 'gl' + 'pl') memanggil glskyWarm() di jendela idle pra-kapsul, DI konteks GLSky sendiri, tiap tahap di task terpisah:
     init    : glskyInit() (build renderer + scene + mesh instancing + pass fx + uji supersample) lebih awal dari frame pertama.
     compile : compileAsync() tiap scene (utama, kepala, atas, planet, drone bawah/atas) + scene unit yang sudah dibangun renderer lamanya (AST3D/SCP3D/DR3D: program yang sama dikompilasi ulang
               di renderer GLSky). compileAsync = traverse (bukan traverseVisible), jadi mesh yang visible=false ikut; dengan KHR_parallel_shader_compile tidak memblok main thread.
     planet  : pl3dGlBuild() (mesh + render target + compileAsync internalnya) lalu render PENUH strip pertama ke render target + sinkron GPU (pl3dGlRtFull), sama dgn pl3dWarmFirst jalur lama:
               frame pertama memakai snapshot itu, bukan render penuh 300+ ms.
   Tidak menggambar apa pun ke kanvas GL (tidak ada kedip di bawah layar boot). Berhenti begitu Blue (stop()). Gagal / dilewati -> perilaku lama persis (frame pertama membangun sendiri).
   Flag: ?glwarm=0 = nonaktif (A/B). Hasil: window.__glwarm {st 0 idle|1 jalan|2 selesai|3 gagal/lewat, why, ms{init,cmp,cmpOk|cmpTmo,plBuild,cmpDone,plDraw,end}, pl, plDraw, cmpTmo, n (scene dikompilasi)}. */
var GLW={on:true,st:0,why:'',ms:{},pl:0,plDraw:0,cmpTmo:0,n:0,r1:true,r1f:false,r1n:0,r1t:[],r1c:[],post:true,sa:null,saOn:true,hold:0,seenAt:0,relAt:0,fade:420,holdMax:12000,defer:[],p:{st:0}};   /* [B4] r1 = render pertama per scene di warm (?glwarm1=0 = nonaktif, A/B); r1t = [[kunci,ms]] */
try{if(/[?&]glwarm=0(&|#|$)/.test(location.search))GLW.on=false;if(/[?&]glwarm1=0(&|#|$)/.test(location.search))GLW.r1=false;if(/[?&]glwarm1=f(&|#|$)/.test(location.search))GLW.r1f=true;if(/[?&]glwarmpost=0(&|#|$)/.test(location.search))GLW.post=false;if(/[?&]glwsa=0(&|#|$)/.test(location.search))GLW.saOn=false;var mF=/[?&]glwfade=(\d+)(&|#|$)/.exec(location.search);if(mF)GLW.fade=Math.max(0,Math.min(3000,+mF[1]));window.__glwarm=GLW;}catch(eGw0){}
/* [B4h] TAHAN + FADE teleskop. Warm scp/dr dipindah ke SESUDAH kapsul (glskyWarm.postArm), jadi di flush pertama teleskop belum boleh tergambar (first-use scp ±1,3 dtk: 12 sampai 370 ms per anak).
   hold 0 = tidak menahan | 1 = menahan (warm pasca-kapsul belum selesai) | 2 = fade-in (GLW.fade ms, smoothstep) | selesai -> 0.
   Pemakai: 04-render.js drawFloatingTelescopeGl (kalau <=0 teleskop tidak digambar sama sekali, jalur 2D juga dilewati). Pengaman: tahan paling lama GLW.holdMax ms sejak teleskop pertama minta gambar. ?glwarmpost=0 = perilaku B4g (tanpa tahan). */
function glskyHoldK(){
  var W=GLW,n,k;
  if(!W.hold)return 1;
  n=performance.now();
  if(W.hold===1){
    if(!W.seenAt)W.seenAt=n;
    if(n-W.seenAt>W.holdMax){W.hold=2;W.relAt=n;W.p.rel='timeout';}
    else return 0;
  }
  k=W.fade>0?(n-W.relAt)/W.fade:1;
  if(k<=0)return 0;
  if(!W.p.vis)W.p.vis=Math.round(n);
  if(k>=1){W.hold=0;W.p.full=Math.round(n);return 1;}
  return k*k*(3-2*k);
}
function glskyWarmWant(){var S=GLSKY;return !!(GLW.on&&S.on&&S.lay&&!S.test&&S.err<3&&!/[?&]off=/.test(location.search));}
/* stop() = true -> berhenti (Blue sudah terjadi). onPl(ok) dipanggil begitu bagian planet selesai/dilewati, onDone(ok,why) saat semuanya selesai. Keduanya idempotent di sisi pemanggil. */
/* [B4] render pertama 1 piksel (scissor) satu scene/unit: memaksa upload buffer + tekstur + link program yang dipakai SEBELUM kapsul, bukan di frame pertama (dump 12 Nov: flush #1 545-736 ms, #2 ~100, #3 ~180 ms, hampir semua di r.top/r.main).
   Semua anak dipaksa visible sementara (state dikembalikan), render ke kanvas GL yang masih tersembunyi di bawah layar boot. only = hanya subtree itu yang tampil (scene atas: per unit, supaya satu task tidak menelan 500 ms sekaligus). Error ditelan. */
function glskyWarmOne(r,sc,cam,only,cont){   /* [B4d] cont = wadah tempat 'only' berada (default: sc sendiri); saudara 'only' di wadah itu disembunyikan, leluhur wadah dipaksa visible */
  var T=window.THREE,st=[],i,sT,sr,ok=false,ch,pa;
  if(!r||!sc||!cam||!T)return false;
  try{
    sT=r.getScissorTest();sr=r.getScissor(new T.Vector4());
    sc.traverse(function(o){st.push(o,o.visible);});
    if(GLW.r1f){   /* ?glwarm1=f: semua anak dipaksa visible (varian tersembunyi ikut dirakit; 12 Nov: scp 1,3 dtk + dr 0,7 dtk, terlalu mahal) */
      if(only){ch=sc.children;for(i=0;i<ch.length;i++)if(ch[i]!==only)ch[i].visible=false;only.traverse(function(o){o.visible=true;});}
      else sc.traverse(function(o){o.visible=true;});
    }else{   /* default: HANYA akar scene/unit dipaksa visible, anak tetap sesuai keadaan bawaan = yang benar-benar tergambar di flush pertama */
      sc.visible=true;
      if(only){
        pa=only;   /* [B4g] jalur only -> sc: di tiap level saudara non-lampu disembunyikan, leluhur dipaksa visible (cont sekarang hanya petunjuk, jalur dihitung dari parent) */
        while(pa&&pa!==sc){
          ch=pa.parent?pa.parent.children:[];for(i=0;i<ch.length;i++)if(ch[i]!==pa&&!ch[i].isLight)ch[i].visible=false;
          pa.visible=true;pa=pa.parent;
        }   /* [B4e] lampu JANGAN disembunyikan: jumlah lampu ikut kunci program three, tanpa lampu program yang dihangatkan beda dgn yang dipakai flush asli (ff[0] balik ~500 ms di B4c) */
      }
    }
    r.setScissorTest(true);r.setScissor(0,0,1,1);
    r.render(sc,cam);ok=true;
  }catch(e){ok=false;}
  try{for(i=0;i<st.length;i+=2)st[i].visible=st[i+1];}catch(e1){}
  try{r.setScissorTest(!!sT);if(sr)r.setScissor(sr.x,sr.y,sr.z,sr.w);}catch(e2){}
  return ok;
}
function glskyWarm(stop,onPl,onDone){
  var S=GLSKY,Wm=GLW,T0=performance.now(),fin=false,tries=0,r=null,ps=[],cl=[],k=0,pg=false,post=false;
  if(Wm.st!==0)return;
  Wm.st=1;
  function mk(n){Wm.ms[n]=Math.round(performance.now()-T0);}
  function plDone(ok){var f=onPl;onPl=null;try{if(f)f(ok);}catch(e){}}
  function end(why){
    if(fin)return;fin=true;Wm.st=why?3:2;Wm.why=why||'';mk('end');
    plDone(!why);
    try{if(onDone)onDone(!why,why||'');}catch(e){}
    try{postArm();}catch(eP){}
  }
  function halt(){if(fin)return true;if(stop&&stop()){end('entered');return true;}return false;}
  function hlt(){return post?false:halt();}   /* [B4h] fase pasca-kapsul: end() sudah terjadi (fin=true), tapi irisan scp/dr tetap jalan */
  function s0(){   /* init: renderer GLSky lebih awal dari frame pertama */
    if(halt())return;
    if(!glskyWarmWant()||typeof glskyInit!=='function'){end('skip');return;}
    if(S.err>=3){end('gl-err');return;}
    if(!S.init)glskyInit();
    if(S.ok&&S.r){mk('init');setTimeout(s1,40);return;}
    if(++tries>130){end('init-timeout');return;}   /* ±8 dtk */
    setTimeout(s0,60);
  }
  function s1(){   /* compile: tiap scene di task sendiri (sisi main thread compileAsync = membuat + mengirim shader, ±3-30 ms) */
    if(halt())return;
    r=S.r;
    try{glskySize();}catch(eSz){}
    try{if(!S.mesh.length)glskyMesh(0);}catch(eM0){}   /* pool quad latar: material op ikut terkompilasi (frame() memakai S.mesh[i]||glskyMesh(i), jadi aman) */
    cl=[[S.scene,S.cam],[S.hScene,S.tCam],[S.tScene,S.tCam],[S.pScene,S.tCam],[S.dbScene,S.tCam],[S.mdScene,S.tCam]];
    try{if(S.astOn&&typeof AST3D!=='undefined'&&AST3D.state===2&&AST3D.sc)cl.push([AST3D.sc,S.cam]);}catch(eA){}
    try{if(typeof SCP3D_GL!=='undefined'&&SCP3D_GL.on&&SCP3D_GL.err<3&&typeof SCP3D!=='undefined'&&SCP3D.state===2&&SCP3D.sc)cl.push([SCP3D.sc,S.tCam]);}catch(eS){}
    try{if(S.drOn&&S.dpOn&&typeof DR3D!=='undefined'&&DR3D.state===2&&DR3D.sc)cl.push([DR3D.sc,S.tCam]);}catch(eD){}
    nx();
  }
  function nx(){
    if(halt())return;
    if(k>=cl.length){mk('cmp');setTimeout(s2,30);return;}
    var p=cl[k++];
    try{if(p[0]&&p[1]){Wm.n++;var q=r.compileAsync?r.compileAsync(p[0],p[1]):(r.compile(p[0],p[1]),Promise.resolve());try{q.catch(function(){});}catch(eQ){}ps.push(q);}}catch(eC){}   /* catch kosong: reject sebelum Promise.all dipasang tidak jadi 'Uncaught (in promise)' */
    setTimeout(nx,30);
  }
  function s2(){   /* planet: build mesh + RT (pl3dGlBuild memulai compileAsync-nya sendiri), lalu tunggu semua program siap */
    if(halt())return;
    try{
      if(S.plOn&&typeof pl3dGlBuild==='function'&&typeof PL3D!=='undefined'&&PL3D.glm===0&&PL3D.state===0&&typeof glskyPlWait==='function'&&glskyPlWait()
         &&PL3D_CFG.on&&!PL3D_CFG.force2d&&!(typeof IS_POTATO!=='undefined'&&IS_POTATO)&&!(typeof reduce!=='undefined'&&reduce)){   /* syarat sama dgn pl3dGlPrep */
        pl3dSync();
        if(PW&&PH)pg=!!pl3dGlBuild();
      }
    }catch(ePb){pg=false;}
    Wm.pl=pg?1:0;mk('plBuild');
    var pr=false,t1=performance.now();
    try{Promise.all(ps).then(function(){pr=true;},function(){pr=true;});}catch(eP){pr=true;}
    (function poll(){
      if(halt())return;
      var plOk=!pg||PL3D.glm===2||PL3D.glm<0;   /* 2 = siap (fin compile / 4 dtk), <0 = pl3dGlFail */
      if(pr&&plOk){mk('cmpOk');mk('cmpDone');setTimeout(s3,30);return;}
      if(performance.now()-t1>5500){Wm.cmpTmo=1;mk('cmpTmo');mk('cmpDone');setTimeout(s3,30);return;}
      setTimeout(poll,40);
    })();
  }
  function s3(){   /* render PENUH strip planet pertama ke render target + sinkron GPU (readback di pl3dGlRtFull), di task sendiri */
    if(halt())return;
    if(pg&&PL3D.glm===2&&PL3D.glRtOn&&PL3D.glRt&&!document.hidden){
      try{
        var t0=performance.now(),bp,lx,ly;
        pl3dSync();pl3dPalUpdate();pl3dPhase(t0);
        PL3D.curNow=t0;
        bp=pl3dLightPos();lx=bp[0];ly=PH-bp[1];
        pl3dGlRtAlloc();
        if(pl3dGlRtFull(t0,lx,ly,false))Wm.plDraw=Math.round(performance.now()-t0);
      }catch(ePd){Wm.plErr=String(ePd&&ePd.message||ePd).slice(0,120);}
      mk('plDraw');
    }
    plDone(!!(pg&&PL3D.glm===2));   /* jujur: planet yang tidak sempat dibangun GL = bukan 'selesai' (gerbang tetap lepas, frame pertama membangun sendiri seperti dulu) */
    setTimeout(sR,40);
  }
  function sR(pq,cb){   /* [B4] render pertama per scene/unit, tiap satu di task sendiri. [B4h] pq/cb = fase pasca-kapsul (hanya scp/dr, tanpa s4) */
    if(hlt())return;
    if(pq&&document.hidden){setTimeout(function(){sR(pq,cb);},300);return;}
    if(!pq&&(!Wm.r1||!r||document.hidden)){setTimeout(s4,10);return;}
    var q=[],j,tu=S.tScene&&S.tScene.children||[];
    try{q.push(['main',S.scene,S.cam,null]);q.push(['head',S.hScene,S.tCam,null]);q.push(['pl',S.pScene,S.tCam,null]);q.push(['dfx',S.dbScene,S.tCam,null]);q.push(['dmd',S.mdScene,S.tCam,null]);}catch(eQ0){}
    for(j=0;j<tu.length;j++)q.push(['top'+j,S.tScene,S.tCam,tu[j]]);
    try{if(S.astOn&&typeof AST3D!=='undefined'&&AST3D.state===2&&AST3D.sc&&AST3D.sc.parent!==S.root)q.push(['ast',AST3D.sc,S.cam,null]);}catch(eA1){}
    try{if(typeof SCP3D_GL!=='undefined'&&SCP3D_GL.on&&SCP3D_GL.err<3&&typeof SCP3D!=='undefined'&&SCP3D.state===2&&SCP3D.sc&&SCP3D.sc.parent!==S.tScene)q.push(['scp',SCP3D.sc,S.tCam,null,1]);}catch(eS1){}
    try{if(S.drOn&&S.dpOn&&typeof DR3D!=='undefined'&&DR3D.state===2&&DR3D.sc&&DR3D.sc.parent!==S.mdScene)q.push(['dr',DR3D.sc,S.tCam,null,1]);}catch(eD1){}
    if(pq)q=pq;
    else if(Wm.post){   /* [B4h] scp/dr (item [4]) tidak dimanaskan pra-kapsul: dicatat di Wm.defer, dikerjakan postArm sesudah kapsul muncul; teleskop ditahan sampai selesai */
      var q2=[],z;
      for(z=0;z<q.length;z++){if(q[z][4])Wm.defer.push(q[z][0]);else q2.push(q[z]);}
      q=q2;
      if(Wm.defer.indexOf('scp')>=0)Wm.hold=1;
    }
    var qi=0;
    function kidsRun(it,done){   /* [B4g: antrean rekursif, w1.c[5]=kedalaman] [B4c] unit besar (scp/dr): satu anak per render, irisan <=24 ms per task + jeda 6 ms (bar tetap jalan); anak berat (>=15 ms) dicatat di GLW.r1c = [unit,nama,ms,tipe material,ukuran map] */
      var sc=it[1],cam=it[2],cont=sc,ch,i=0,tt=performance.now(),tot=0,dp,j,b;
      function cnt(o){var n=0;o.traverse(function(){n++;});return n;}
      /* [B4g] turun ke anak terbesar (>=60%) dengan menciutkan rantai satu-anak (dr: sc>yaw>lean>mdl); lalu antrean irisan dibuka rekursif: anak dgn >=8 turunan diganti anak-anaknya (scp: Group 0,5 dtk) */
      for(dp=0;dp<6;dp++){
        b=null;var bn=0,tn=cnt(cont),cn;for(j=0;j<cont.children.length;j++){cn=cnt(cont.children[j]);if(cn>bn){bn=cn;b=cont.children[j];}}
        while(b&&b.children.length===1&&!b.children[0].isLight)b=b.children[0];
        if(b&&b.children.length>=2&&bn>=(tn-1)*.6)cont=b;else break;
      }
      ch=[];
      (function ex(n,d){   /* [B4g] Group/Object3D dgn >=8 turunan & >=2 anak dibuka jadi anak-anaknya (maks 6 level, maks 160 irisan); sisanya satu irisan */
        var k=n.children.slice(),q;
        for(q=0;q<k.length;q++){
          if(ch.length<160&&d<6&&(k[q].type==='Group'||k[q].type==='Object3D')&&k[q].children.length>=2&&cnt(k[q])-1>=8)ex(k[q],d+1);
          else ch.push({n:k[q],d:d});
        }
      })(cont,0);
      (function step(){
        if(hlt())return;
        if(post&&document.hidden){setTimeout(step,250);return;}
        var t0=performance.now(),c,t1,m,mp,im,dd=0;
        while(i<ch.length&&performance.now()-t0<24){
          c=ch[i++];dd=c.d;c=c.n;t1=performance.now();
          try{glskyWarmOne(r,sc,cam,c,cont);}catch(eK){}
          t1=performance.now()-t1;tot+=t1;
          if(t1>=15&&GLW.r1c.length<40){
            try{m=c.material;if(m&&m.length)m=m[0];mp=m&&m.map;im=mp&&mp.image;}catch(eM){}
            GLW.r1c.push([it[0],String(c.name||c.type||'?').slice(0,24),Math.round(t1),(m&&m.type)||'',im&&im.width?(im.width+'x'+im.height):'',dd]);
          }
        }
        if(i<ch.length){setTimeout(step,6);return;}
        GLW.r1n++;if(GLW.r1t.length<24)GLW.r1t.push([it[0],Math.round(performance.now()-tt),ch.length,Math.round(tot),cont===sc?0:1]);
        done();
      })();
    }
    (function nr(){
      if(hlt())return;
      if(qi>=q.length){if(pq){setTimeout(cb,0);return;}mk('r1');setTimeout(s4,30);return;}
      var it=q[qi++],t1=performance.now();
      if(it[0]==='sa'){try{glskySaWarm(Wm);}catch(eSw){Wm.sa={ok:0,why:String(eSw&&eSw.message||eSw).slice(0,80)};}setTimeout(nr,30);return;}   /* [B4i] */
      if(it[4]&&it[1]&&it[1].children&&it[1].children.length){kidsRun(it,function(){setTimeout(nr,30);});return;}
      try{if(it[1]&&it[2]){glskyWarmOne(r,it[1],it[2],it[3]);Wm.r1n++;if(Wm.r1t.length<24)Wm.r1t.push([it[0],Math.round(performance.now()-t1)]);}}catch(eN){}
      setTimeout(nr,30);
    })();
  }
  function postFin(why){   /* [B4h] selesai (atau tidak ada yang dikerjakan): lepas tahan -> fade-in */
    post=false;Wm.p.st=2;Wm.p.why=why||'';Wm.p.ms=Wm.p.t0?Math.round(performance.now()-Wm.p.t0):0;Wm.p.end=Math.round(performance.now());
    if(Wm.hold===1){Wm.hold=2;Wm.relAt=performance.now();}
  }
  function postGo(){
    var it=[];
    if(!S.ok||!S.r||S.err>=3){postFin('no-r');return;}
    r=S.r;
    try{if(typeof SCP3D_GL!=='undefined'&&SCP3D_GL.on&&SCP3D_GL.err<3&&!SCP3D_GL.act&&typeof SCP3D!=='undefined'&&SCP3D.state===2&&SCP3D.sc&&SCP3D.sc.parent!==S.tScene)it.push(['scp',SCP3D.sc,S.tCam,null,1]);}catch(eS2){}
    try{if(S.drOn&&S.dpOn&&typeof DR3D!=='undefined'&&DR3D.state===2&&DR3D.sc&&!DR3D.glIn&&DR3D.sc.parent!==S.mdScene)it.push(['dr',DR3D.sc,S.tCam,null,1]);}catch(eD2){}
    try{if(Wm.saOn&&S.saOn&&S.sa&&S.sa.ok&&S.sa.qs&&S.tScene)it.push(['sa',null,null,null,2]);}catch(eSa){}   /* [B4i] terakhir: RT teleskop + quad tempel */
    if(!it.length){postFin('none');return;}
    post=true;Wm.p.t0=performance.now();Wm.p.n=it.length;
    sR(it,function(){postFin('');});
  }
  function postArm(){   /* [B4h] dipanggil end(): tunggu kapsul muncul (performance.mark obs-capsule) atau Blue, lalu irisan scp/dr jalan di jendela tunggu-tap / awal sektor */
    var wt=0;
    if(!Wm.hold||Wm.p.st)return;
    Wm.p.st=1;Wm.p.arm=Math.round(performance.now());
    (function w(){
      var cap=false;
      try{cap=performance.getEntriesByName('obs-capsule').length>0;}catch(eC){}
      if(cap||window.__obsEntered||++wt>200){Wm.p.cap=Math.round(performance.now());setTimeout(postGo,250);return;}   /* 200 x 150 ms = 30 dtk */
      setTimeout(w,150);
    })();
  }
  function s4(){
    if(halt())return;
    try{if(r&&S.dummy&&r.initTexture)r.initTexture(S.dummy);}catch(eT){}
    end('');
  }
  setTimeout(s0,0);
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
  S.act=false;S.n=0;S.hAct=false;S.pAct=false;S.pdn=0;S.pln=0;S.pbn=0;S.pan=0;S.dpAct=false;S.dbn=0;S.dln=0;S.dsn=0;S.dtn=0;
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
    S.now=now;S.sn=0;S.ln=0;S.ln2=0;S.ln3=0;S.hiOv=0;S.want=!!want;S.act=true;S.rec=true;   /* [FIX] rec = jendela rekam op GL: dari sini sampai glskyFlush */
  }catch(e){glskyFail(String(e&&e.message||e));return false;}
  return true;
}

/* dipanggil sekali per frame SETELAH blok latar 2D: render daftar op yang dicatat plateBlit/sectDrawSky */
/* [B0/F0] instrumentasi bench (hanya aktif kalau URL punya ?bench=1; produksi = no-op). Waktu per segmen glskyFlush + tiap r.render, jumlah upload tekstur, draw call, 6 flush pertama, spike >=8 ms. Keluar di dump bench sebagai "glseg" (glskySegOut). */
var GLSG={on:/[?&]bench=1(&|$)/.test(location.search),s:{},ff:[],fd:[],cur:null,spk:[],t:0,fr:0,upTot:0,upFr:0,upMax:0,calls:0,tris:0};
function glsgT(){return GLSG.on?performance.now():0;}
function glsgBegin(){if(GLSG.on)GLSG.t=performance.now();}
function glsgAdd(k,t0){
  if(!GLSG.on)return 0;
  var n=performance.now(),ms=n-t0,o=GLSG.s[k]||(GLSG.s[k]={n:0,ms:0,mx:0});
  o.n++;o.ms+=ms;if(ms>o.mx)o.mx=ms;
  if(GLSG.cur)GLSG.cur.s[k]=+((GLSG.cur.s[k]||0)+ms).toFixed(1);   /* [B4i] per-flush (6 pertama) */
  if(ms>=8&&GLSG.spk.length<40)GLSG.spk.push([+n.toFixed(0),k,+ms.toFixed(1)]);
  return ms;
}
function glsgLap(k){if(!GLSG.on)return;var n=performance.now();glsgAdd(k,GLSG.t);GLSG.t=n;}
function glsgR(k,t0){   /* sesudah satu r.render: waktu + draw call/segitiga render itu (info autoReset per render) */
  if(!GLSG.on)return;
  glsgAdd(k,t0);
  try{var f=GLSKY.r.info.render;GLSG.calls+=f.calls;GLSG.tris+=f.triangles;}catch(e){}
}
/* [B4i] SEBELUM r.render satu pass (hanya 6 flush pertama, hanya ?bench=1): apa yang belum pernah dipakai three = kandidat biaya first-use di pass itu.
   m = jumlah material visible, p = material yang BELUM punya program (first-use material; program-nya sendiri mungkin sudah di cache three), t = tekstur yang BELUM di-upload ke GPU [lebar,tinggi,mipmap,jenis].
   Tekstur dibaca dari material.map dan uniforms.uMap (quad GLSky). r.properties dipakai persis seperti three (get = buat entri kosong kalau belum ada). */
function glsgScan(k,sc){
  var cur=GLSG.cur,P,o,seen=[];
  if(!cur||!sc)return;
  try{
    P=GLSKY.r.properties;o={m:0,p:0,t:[]};
    sc.traverseVisible(function(x){
      var mm=x.material,j,c,m,t,im;
      if(!mm)return;
      mm=mm.length?mm:[mm];
      for(j=0;j<mm.length;j++){
        m=mm[j];if(!m)continue;
        o.m++;if(!P.get(m).currentProgram)o.p++;
        for(c=0;c<2;c++){
          t=c?(m.uniforms&&m.uniforms.uMap&&m.uniforms.uMap.value):m.map;
          if(t&&seen.indexOf(t)<0){seen.push(t);if(!P.get(t).__webglTexture&&o.t.length<12){im=t.image;o.t.push([(im&&(im.width||im.videoWidth))|0,(im&&im.height)|0,t.generateMipmaps?1:0,t.isCanvasTexture?'c':(t.isDataTexture?'d':'?')]);}}
        }
      }
    });
    cur.sc[k]=o;
  }catch(e){cur.sc[k]={err:1};}
}
window.glskySegOut=function(){
  if(!GLSG.on)return null;
  var o={fr:GLSG.fr,seg:{},ff:GLSG.ff,ffd:GLSG.fd,spk:GLSG.spk,upTot:GLSG.upTot,upFr:GLSG.upFr,upMax:GLSG.upMax,callsPerFr:GLSG.fr?+(GLSG.calls/GLSG.fr).toFixed(1):0,trisPerFr:GLSG.fr?Math.round(GLSG.tris/GLSG.fr):0,_cols:'seg[k]=[n,avgMs,totMs,maxMs]; ff=[abs ms,ms] 6 flush pertama; ffd[i]={t,ms,n=jumlah op,ops={kind:jumlah},s={segmen:ms},sc={pass:{m=material,p=material tanpa program,t=[[w,h,mip,jenis] tekstur belum di-upload]}},tx/pg/ge=delta tekstur/program/geometri three,up=upload dinamis,calls,tris,sa={n,px,rt0,rt1,al=[[w,h,ms] alokasi RT],tm=[ms render RT,ms tempel quad]},q0=quad tempel sudah punya program};  spk=[abs ms,seg,ms>=8]; upTot=total upload tekstur dinamis, upFr=jumlah frame yang ada upload, upMax=max per frame; callsPerFr/trisPerFr = rata2 draw call/segitiga semua render per flush'},k;
  for(k in GLSG.s){var g=GLSG.s[k];o.seg[k]=[g.n,+(g.ms/g.n).toFixed(2),+g.ms.toFixed(0),+g.mx.toFixed(1)];}
  try{o.w1={r1:GLW.r1,f:GLW.r1f,n:GLW.r1n,t:GLW.r1t,c:GLW.r1c,ms:GLW.ms,st:GLW.st,post:GLW.post,defer:GLW.defer,hold:GLW.hold,p:GLW.p,fade:GLW.fade,sa:GLW.sa};}catch(eW1){}
  try{o.info={programs:GLSKY.r.info.programs?GLSKY.r.info.programs.length:null,geometries:GLSKY.r.info.memory.geometries,textures:GLSKY.r.info.memory.textures,pr:GLSKY.r.getPixelRatio(),w:GLSKY.pw,h:GLSKY.ph};}catch(e){}
  return o;
};
function glsgFlushBegin(){
  var S=GLSKY,r=S.r,sa=S.sa,sl=sa.sl&&sa.sl[0],h={},z,k,q0=null,c;
  try{for(z=0;z<S.n;z++){k=S.ops[z]&&S.ops[z].k|0;h[k]=(h[k]|0)+1;}}catch(e){}
  try{if(sa.q)q0=!!r.properties.get(sa.q.material).currentProgram;}catch(e2){}
  c={n:S.n,ok:h,s:{},sc:{},q0:q0,al:null,tm:null,rt0:sl&&sl.rt?[sl.cw,sl.ch]:null,c0:GLSG.calls,tr0:GLSG.tris,u0:S.st.up};
  try{c.tx0=r.info.memory.textures;c.pg0=r.info.programs?r.info.programs.length:0;c.ge0=r.info.memory.geometries;}catch(e3){c.tx0=c.pg0=c.ge0=0;}
  GLSG.cur=c;
  return c;
}
function glsgFlushEnd(c,t0,ms,du){
  var S=GLSKY,r=S.r,sa=S.sa,sl=sa.sl&&sa.sl[0],ri=r.info,tx=0,pg=0,ge=0;
  try{tx=ri.memory.textures-c.tx0;pg=(ri.programs?ri.programs.length:0)-c.pg0;ge=ri.memory.geometries-c.ge0;}catch(e){}
  GLSG.fd.push({t:+t0.toFixed(0),ms:+ms.toFixed(1),n:c.n,ops:c.ok,s:c.s,sc:c.sc,tx:tx,pg:pg,ge:ge,up:du,calls:GLSG.calls-c.c0,tris:GLSG.tris-c.tr0,
    sa:{n:sa.n,px:sa.px,rt0:c.rt0,rt1:sl&&sl.rt?[sl.cw,sl.ch]:null,al:c.al,tm:c.tm&&[+c.tm[0].toFixed(1),+c.tm[1].toFixed(1)]},q0:c.q0});
  GLSG.cur=null;
}
function glskyFlush(){
  var S=GLSKY,t0,ms,i,m,u0=S.st.up,tR,gc=null;
  if(!S.act||!S.r)return;
  S.rec=false;
  if(GLSG.on){GLSG.cur=null;if(GLSG.ff.length<6){gc=glsgFlushBegin();}}   /* [B4i] rekam rinci 6 flush pertama */   /* [FIX] op yang dicatat setelah flush tidak akan pernah digambar -> pemanggil harus jatuh ke 2D */
  t0=performance.now();glsgBegin();
  try{
    S.big=0;
    if(S.vig>0&&S.want&&S.lay&&!S.test){var vo=glskyOp();vo.k=2;vo.a=S.vig;vo.add=0;vo.cx=W*.5;vo.cy=H*.5;vo.w=W;vo.h=H;vo.rot=0;}   /* vignette: op terakhir => di atas latar GL, di bawah semua yang masih 2D */
    for(i=0;i<S.n;i++){m=S.mesh[i]||glskyMesh(i);glskyApply(m,S.ops[i]);}
    for(;i<S.mesh.length;i++)S.mesh[i].visible=false;
    glsgLap('ops');
    glskyInstFlush();
    glsgLap('inst');
    try{glskyDpUpload();}catch(eDpU){S.dpErr++;S.dpAct=false;if(S.dpErr>=3)S.dpOk=false;}   /* [G4.10] gagal x3 -> drone balik ke layer */
    glsgLap('dpUp');
    try{glskyPfUpload();}catch(ePfU){S.pfOk=false;}   /* [G4.9] efek planet: gagal -> hilang sampai frame berikut (pl3dGlFx kembali ke 2D karena pfOk false) */
    glsgLap('pfUp');
    if(S.big){S.lay=false;glskyFail('texture melebihi batas GPU ('+S.maxTex+'px)');return;}   /* texture terlalu besar: tidak bisa jujur menggantikan 2D -> 2D penuh */
    S.r.setClearColor(0x050b12,S.want?1:0);   /* ColorManagement mati (threeLoad) => hex dipakai apa adanya = #050b12 */
    tR=glsgT();glskyRenderAll();glsgAdd('render',tR);
    S.st.fr++;
    if(S.st.fr%90===0)glskySweep();
  }catch(e){glskyFail(String(e&&e.message||e));return;}
  ms=performance.now()-t0;S.st.ms+=ms;if(ms>S.st.mx)S.st.mx=ms;
  if(GLSG.on){var du=S.st.up-u0;GLSG.fr++;GLSG.upTot+=du;if(du>0)GLSG.upFr++;if(du>GLSG.upMax)GLSG.upMax=du;glsgAdd('flush',t0);if(GLSG.ff.length<6)GLSG.ff.push([+t0.toFixed(0),+ms.toFixed(1)]);if(gc)glsgFlushEnd(gc,t0,ms,du);}
  S.st.msAvg=S.st.fr?+(S.st.ms/S.st.fr).toFixed(3):0;S.st.msMax=+S.st.mx.toFixed(2);
}

/* capture langit (01-core snapCompose): GL tidak bisa dibaca setelah frame ditampilkan (preserveDrawingBuffer:false), jadi render ulang daftar op terakhir
   SEKARANG lalu langsung drawImage ke kanvas capture di task yang sama. Mengembalikan true kalau GL tergambar (latar 2D tidak perlu diisi lagi). */
function glskySnap(x,dx,dy,dw,dh){
  var S=GLSKY;
  if(!S.act||!S.r||!S.ok)return false;
  try{glskyRenderAll();x.drawImage(S.cv,dx,dy,dw,dh);return true;}catch(e){return false;}
}
