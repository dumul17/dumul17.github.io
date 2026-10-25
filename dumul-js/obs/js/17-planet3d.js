'use strict';
/* 17-planet3d.js — permukaan planet di dasar layar (rencana-planet.md, fase P1; Three.js r128, dimuat LAZY).
   Yang kelihatan cuma tutup (limb + permukaan) bola raksasa di dasar layar. Digambar di frame() (05-sector-ui.js) SETELAH teleskop 3D
   dan SEBELUM asteroid depan: di atas rasi, bintang, portal, BH, drone, teleskop; di bawah asteroid depan + HUD (DOM).
   Cara kerja: satu renderer WebGL offscreen kecil (strip bawah layar, setengah resolusi) merender satu quad; fragment shader menghitung bola
   secara analitik (permukaan = noise prosedural, bukan tekstur), lalu hasilnya disalin ke kanvas 2D (cv2) dan di-drawImage tiap frame.
   Cahaya = sama dengan asteroid (12-ast3d.js): lampu titik di posisi BH (camBH()), hangat, meredup menurut jarak.
   Gagal apa pun (WebGL mati / shader error / context lost / potato / reduce motion) -> strip 2D statis (fallback), tanpa error.
   Matikan total: ?planet3d=0 atau localStorage dumul_planet3d=0.  Paksa fallback 2D (untuk tes): ?planet3d=2d atau localStorage dumul_planet3d=2d.
   P1: bola + tanah berperspektif + batu mesh, satu palette. P3: parallax kecil dari skyPan (+ springback otomatis), zoom ringan, landscape ROT (planet tetap di dasar layar NYATA),
   BH mini boleh terbenam (planetBhOk/planetBhClamp, dipakai sumSpot + moveBHDrag), berhenti render saat wormhole menutup layar. P2: palette + geometri (hL/hR, rot, seed) per sektor (SECTORS[].planet di sky-data.js) di-crossfade lewat bobot SKYT (04-render.js, cuma DIBACA);
   overview (semua bobot 0) = PL3D_CFG.ov. P4: di overview lampu = portal yang mengorbit (15-portal3d.js portalOrbit), portal tenggelam di balik limb planet ini. */
var PL3D_CFG={
  on:true,
  force2d:false,
  lib:(typeof AST3D_CFG!=='undefined'&&AST3D_CFG.lib)||'dumul-js/obs/lib/three.min.js?v=1',   /* path + ?v= harus sama dgn SHELL service-worker */
  /* GEOMETRI PER SEKTOR: hL/hR (garis horizon, x tinggi layar dari atas, di tepi kiri/kanan), rot (px/dtk, + = geser ke kanan, - = ke kiri) dan seed
     (pasangan integer, geser pola noise) ada di ov (overview) dan di SECTORS[].planet (sky-data.js). Landscape (PW>PH): hLLand/hRLand kalau diisi,
     kalau tidak diturunkan dari hL/hR (h+(1-h)*.4). Nilai hidup = blend ov + sektor menurut bobot SKYT (PL3D_CFG.live), sama seperti palette. */
  rK:14,          /* radius bola = rK x lebar layar. Makin besar = horizon makin datar (14 = nyaris lurus) */
  cell:100,        /* lebar 1 sel batu/medan (px CSS) saat 100px di bawah horizon; makin dekat horizon makin kecil (perspektif) */
  persp:120,      /* kekuatan perspektif tanah: makin besar = batu makin gepeng/rapat ke arah horizon */
  haze:95,        /* lebar kabut atmosfer di atas permukaan dekat horizon (px CSS) */
  hazeA:.45,     /* opasitas kabut di horizon 0..1 (tanah + batu). .78 = tebal (lama), .45 = agak transparan, .3 = tipis, 0 = tanpa kabut */
  rockD:1,     /* kepadatan batu 0..1: batu ada kalau acak sel > rockD. .3 rapat, .5 sedang, .7 jarang, >=1 = TIDAK ADA batu (gurun) */
  cloud:.5,     /* opasitas lapisan awan/debu tipis kebiruan di atas tanah (0 = mati) */
  cloudCov:.8,  /* luas area awan 0..1: .5 = seperti dulu, makin besar makin luas/menyambung, .8 = hampir menutup, 0 = bercak kecil */
  cloudH:20,     /* tinggi lapisan awan = cloudH x haze (px dari horizon ke bawah, memudar halus); ikut berubah kalau haze diubah. 0 = tanpa batas tinggi (awan menutup seluruh tanah, seperti dulu) */
  rocks:true,   /* batu = mesh 3D asli (ast3dRockGeo dari 12-ast3d.js, sama dgn asteroid). false = tanpa batu */
  rockSz:.25,  /* skala mesh batu terhadap sel (1 = pas ukuran sel) */
  lod:.25,         /* detail tanah dekat horizon: oktaf noise yang lebih halus dari ~1px layar di-fade ke rata-rata (anti-moire) -> pita MULUS tanpa tekstur di dekat horizon.
                    lod 1 = seperti dulu; .5 = tekstur bertahan lebih dekat ke horizon (pita mulus menyempit); .25 = paling tajam (bisa berkilau/moire). Lebar pita juga ikut persp (makin besar persp = makin lebar) */
  fadeS:10,       /* tanah memudar jadi TRANSPARAN menuju horizon (px dari tepi bola; 0 = mati/opak seperti dulu). Mis. 40 = 40px terakhir ke horizon makin tembus, bintang di belakang kelihatan */
  q:2,           /* skala resolusi render (x px CSS). Dulu 5 (25 sampel/px layar, mubazir); 2 cukup utk layar DPR 2 */
  fps:4,          /* render ulang maks per detik; rotasi cuma 0.5 px/dtk jadi 4 fps tak terlihat bedanya. Gerak cahaya BH punya trigger sendiri di planet3dDraw */
  lightCol:[1,.74,.48],   /* warna cahaya, SAMA dengan asteroid (12-ast3d.js 'warm') */
  ov:{lo:[.014,.022,.036],mid:[.105,.140,.190],hi:[.340,.400,.480],atm:[.43,.90,1],atmA:.17,   /* palette OVERVIEW (netral): biru-baja gelap ke terang + atmosfer cyan tipis (110,229,255) */
      hL:.86,hR:.95,hLLand:.915,hRLand:.97,rot:0,seed:[0,0]},   /* geometri OVERVIEW (rot 0 = planet DIAM di overview; langit yang berputar, lihat MW di 02-sky-logic.js): kesan ekuator = horizon hampir datar (miring cuma .09, dulu .195) */
  /* AYUNAN HORIZON (librasi latitudinal + nutasi), cuma di sektor (overview = 0 lewat bobot SKYT): ujung horizon kiri/kanan naik-turun GANTIAN (tilt, seperti jungkat-jungkit)
     + sedikit naik-turun bersama (lat). Dua periode yang tidak berkelipatan -> tidak pernah persis berulang. Amplitudo = pecahan tinggi layar, periode = detik.
     DIGAMBAR SEBAGAI TRANSFORMASI 2D (geser + miring) pada strip yang sudah dirender, tiap frame penuh (60fps) -> mulus; shader TIDAK dirender ulang (tetap 4 fps).
     on:false / lat:0,tilt:0 = mati. Clamp BH/teleskop + drone ikut (pl3dGeom). */
  libr:{on:true,lat:.004,tilt:.012,pLat:170,pTilt:120},
  rotK:0,         /* pengali kecepatan rotasi tanah (SECTORS[].planet.rot). 0 = permukaan tanah DIAM (itu-itu saja), 1 = menggeser seperti dulu */
  live:null,      /* geometri HIDUP (blend ov + sektor): hL,hR,hLL,hRL,rot,sx,sy; diisi di bawah, jangan diedit */
  par:.045,       /* parallax: px planet per px skyPan (disengaja kecil, lebih pelan dari plateDeep .14; planet paling depan tapi nyaris diam) */
  parMax:24,      /* batas geser parallax (px CSS); juga margin strip supaya strip tidak berubah ukuran */
  zoomK:.12,      /* planet membesar cuma .12x dari skyZoom (diklem di zoom 4; di atas itu planet keluar layar) */
  bhSink:.5,      /* BH mini boleh terbenam di balik limb sedalam sekian x radiusnya (0 = tidak boleh menyentuh limb) */
  teleSink:.35,   /* teleskop: idem bhSink (planetObjClamp). Radius yang dipakai = .7 x radius hit teleskop (04-render.js). 0 = tidak boleh menyentuh limb */
  palFps:20,      /* selama palette bergeser (crossfade sektor), render ulang sampai segini per detik supaya fade mulus; di luar itu pakai fps */
  pal:null        /* palette HIDUP (hasil blend overview + sektor); diisi di bawah, jangan diedit */
};
PL3D_CFG.live={hL:PL3D_CFG.ov.hL,hR:PL3D_CFG.ov.hR,hLL:PL3D_CFG.ov.hLLand,hRL:PL3D_CFG.ov.hRLand,rot:PL3D_CFG.ov.rot,sx:PL3D_CFG.ov.seed[0],sy:PL3D_CFG.ov.seed[1]};
PL3D_CFG.pal={lo:PL3D_CFG.ov.lo.slice(),mid:PL3D_CFG.ov.mid.slice(),hi:PL3D_CFG.ov.hi.slice(),atm:PL3D_CFG.ov.atm.slice(),atmA:PL3D_CFG.ov.atmA};
try{
  var _pq=(location.search.match(/[?&]planet3d=(\w+)/)||[])[1]||localStorage.getItem('dumul_planet3d')||'';
  if(_pq==='0')PL3D_CFG.on=false;else if(_pq==='2d')PL3D_CFG.force2d=true;
}catch(ePL0){}
var PL3D={state:0,/* 0 belum, 1 memuat, 2 siap (3D), 3 gagal/nonaktif -> fallback 2D */r:null,sc:null,cam:null,mat:null,uni:null,cv2:null,c2:null,
  rw:0,rh:0,W:0,H:0,stripH:0,al:1,lastR:-1e9,lastLx:-1e9,lastLy:-1e9,dirty:true,err:'',fb:null,fbKey:'',warm:false,frames:0,renders:0,palR:null,lastB:0,pdef:{},ph:0,phT:null,topC:null,secW:0};

/* ---- palette (P2) ----
   Bobot per sektor = SKYT[k].v (04-render.js; sudah diperhalus .06/frame di sectDrawSky, 1 = sedang di sektor itu, semua 0 = overview).
   Palette hidup = (ov*(1-jumlah) + sum(sektor*bobot)) / total. Jadi masuk/keluar sektor dan sektor -> sektor fade mulus tanpa pop. */
var PL3D_PN=['lo','mid','hi','atm'];
function pl3dPalOf(s){   /* palette sebuah sektor: s.planet kalau lengkap, kalau tidak diturunkan dari s.sky.rgb, kalau tidak ada juga -> null (diabaikan) */
  var p=s&&s.planet;
  if(p&&p.lo&&p.mid&&p.hi&&p.atm)return p;
  if(!s||!s.sky||!s.sky.rgb)return null;
  if(PL3D.pdef[s.k])return PL3D.pdef[s.k];
  var m=String(s.sky.rgb).split(','),c;
  if(m.length<3)return null;
  c=[+m[0]/255,+m[1]/255,+m[2]/255];
  return (PL3D.pdef[s.k]={lo:[c[0]*.05,c[1]*.05,c[2]*.05],mid:[c[0]*.30,c[1]*.30,c[2]*.30],hi:[c[0]*.75,c[1]*.75,c[2]*.75],atm:c,atmA:.16});
}
/* geometri sebuah sektor (null = overview): field yang kosong jatuh ke ov; landscape diturunkan dari portrait kalau tidak diisi */
function pl3dGeoOf(s){
  var ov=PL3D_CFG.ov,p=(s&&s.planet)||{},hasH=p.hL!=null&&p.hR!=null,hL=hasH?p.hL:ov.hL,hR=hasH?p.hR:ov.hR,sd=(p.seed&&p.seed.length>=2)?p.seed:ov.seed,
      hLL=p.hLLand!=null?p.hLLand:(hasH?hL+(1-hL)*.4:ov.hLLand),hRL=p.hRLand!=null?p.hRLand:(hasH?hR+(1-hR)*.4:ov.hRLand);
  return {hL:hL,hR:hR,hLL:hLL,hRL:hRL,rot:p.rot!=null?p.rot:ov.rot,sx:sd[0]|0,sy:sd[1]|0};
}
/* batas atas horizon tertinggi di antara SEMUA profil (ov + sektor), supaya ukuran strip tetap waktu geometri di-crossfade */
function pl3dTopFrac(land){
  var L=(typeof SECT!=='undefined'&&SECT&&SECT.list)||[],key=land?1:0,c=PL3D.topC||(PL3D.topC={}),i,g,t;
  if(c[key]&&c[key].n===L.length)return c[key].v;
  g=pl3dGeoOf(null);t=Math.min(land?g.hLL:g.hL,land?g.hRL:g.hR);
  for(i=0;i<L.length;i++){g=pl3dGeoOf(L[i]);t=Math.min(t,land?g.hLL:g.hL,land?g.hRL:g.hR);}
  c[key]={n:L.length,v:t};return t;
}
/* fase geser permukaan (px di limb), diintegrasi supaya ganti kecepatan/arah (crossfade sektor) tidak melompat */
function pl3dPhase(now){
  var dt,rd=(typeof reduce!=='undefined'&&reduce);
  if(PL3D.phT==null)PL3D.phT=now;
  dt=Math.max(0,Math.min(100,now-PL3D.phT));
  if(now>PL3D.phT)PL3D.phT=now;
  if(!rd)PL3D.ph+=dt*.001*PL3D_CFG.live.rot*PL3D_CFG.rotK;
  return PL3D.ph;
}
/* librasi: offset horizon (pecahan tinggi layar) kiri/kanan pada waktu sekarang. Diredam bobot sektor (PL3D.secW, 0 di overview). Waktu = jam fase (PL3D.phT) */
function pl3dLib(){
  var c=PL3D_CFG.libr,w=PL3D.secW;
  if(!c||!c.on||w<=.001||(typeof reduce!=='undefined'&&reduce)||PL3D.phT==null)return [0,0];
  var t=PL3D.phT*.001,la=c.lat*Math.sin(t*6.2831853/c.pLat),ti=c.tilt*Math.sin(t*6.2831853/c.pTilt+1.3);
  return [(la+ti)*w,(la-ti)*w];
}
function pl3dPalUpdate(){
  var L=(typeof SECT!=='undefined'&&SECT&&SECT.list)||[],T=(typeof SKYT!=='undefined')?SKYT:null,cur=PL3D_CFG.pal,ov=PL3D_CFG.ov,
      A=[],B=[],G=[],sum=0,i,j,k,n,v,t,p,w,tot,nm,a,bi=0,bw=-1,lv=PL3D_CFG.live,gk=['hL','hR','hLL','hRL','rot'];
  if(T)for(i=0;i<L.length;i++){
    t=T[L[i].k];w=t?t.v:0;
    if(w>.002&&(p=pl3dPalOf(L[i]))){A.push(p);B.push(w);G.push(pl3dGeoOf(L[i]));sum+=w;}
  }
  PL3D.secW=Math.min(1,sum);
  w=Math.max(0,1-sum);tot=sum+w;A.push(ov);B.push(w);G.push(pl3dGeoOf(null));
  for(n=0;n<4;n++){
    nm=PL3D_PN[n];
    for(k=0;k<3;k++){v=0;for(j=0;j<A.length;j++)v+=A[j][nm][k]*B[j];cur[nm][k]=v/tot;}
  }
  a=0;for(j=0;j<A.length;j++)a+=(A[j].atmA==null?ov.atmA:A[j].atmA)*B[j];
  cur.atmA=a/tot;
  for(n=0;n<5;n++){v=0;for(j=0;j<G.length;j++)v+=G[j][gk[n]]*B[j];lv[gk[n]]=v/tot;}   /* horizon + kecepatan geser: blend halus */
  for(j=0;j<B.length;j++)if(B[j]>bw){bw=B[j];bi=j;}
  lv.sx=G[bi].sx;lv.sy=G[bi].sy;   /* seed tidak bisa di-blend (integer): ikut yang bobotnya terbesar */
  /* berubah sejak render/bake terakhir? (jumlah selisih mutlak 13 angka) */
  var R=PL3D.palR;if(!R)return true;
  var d=Math.abs(cur.atmA-R[12])+(Math.abs(lv.hL-R[13])+Math.abs(lv.hR-R[14])+Math.abs(lv.hLL-R[15])+Math.abs(lv.hRL-R[16]))*4+((lv.sx!==R[17]||lv.sy!==R[18])?1:0);
  for(n=0;n<4;n++){nm=PL3D_PN[n];for(k=0;k<3;k++)d+=Math.abs(cur[nm][k]-R[n*3+k]);}
  return d>.006;
}
function pl3dPalSnap(){   /* catat palette yang barusan dirender / dibake */
  var cur=PL3D_CFG.pal,R=PL3D.palR||(PL3D.palR=new Array(19)),lv=PL3D_CFG.live,n,k;
  for(n=0;n<4;n++)for(k=0;k<3;k++)R[n*3+k]=cur[PL3D_PN[n]][k];
  R[12]=cur.atmA;R[13]=lv.hL;R[14]=lv.hR;R[15]=lv.hLL;R[16]=lv.hRL;R[17]=lv.sx;R[18]=lv.sy;
}

function pl3dFail(why){
  PL3D.state=3;PL3D.err=String(why||'');PL3D.dirty=true;PL3D.fb=null;
  try{console.warn('[planet3d] fallback ke strip 2D:',PL3D.err);}catch(e){}
}

/* Dimensi ruang gambar planet. Normal = stage (W,H). Mode ROT (HP landscape): stage portrait diputar 90 derajat di CSS, jadi dasar layar NYATA = tepi kiri/kanan stage.
   Planet dihitung & dirender di ruang layar TEGAK (STG.iw x STG.ih, dasar = bawah layar nyata) lalu diputar ke ruang stage cuma saat di-drawImage (planet3dDraw). */
var PW=0,PH=0;
function pl3dSync(){
  var r=(typeof STG!=='undefined'&&STG&&STG.rot)||0;
  if(r){PW=STG.iw;PH=STG.ih;}else{PW=(typeof W!=='undefined'?W:0);PH=(typeof H!=='undefined'?H:0);}
  PL3D.rot=r;
}
function pl3dScr(x,y){return PL3D.rot?v2c(x,y):[x,y];}   /* titik stage -> ruang layar tegak */
/* parallax + zoom dari skyPan/skyZoom (ruang layar tegak). skyPan hidup di ruang stage, jadi diputar kalau ROT. */
function pl3dPar(){
  var px=(typeof skyPan!=='undefined'?skyPan.x:0),py=(typeof skyPan!=='undefined'?skyPan.y:0),rt=PL3D.rot,k=PL3D_CFG.par,M=PL3D_CFG.parMax,z=(typeof skyZoom!=='undefined'?skyZoom:1),sx,sy;
  if(rt<0){sx=py;sy=-px;}else if(rt>0){sx=-py;sy=px;}else{sx=px;sy=py;}
  sx=Math.max(-M,Math.min(M,sx*k));sy=Math.max(-M,Math.min(M,sy*k));
  return {x:sx,y:sy,f:1+(Math.max(1,Math.min(4,z))-1)*PL3D_CFG.zoomK};
}

/* geometri (satuan px CSS, ruang stage): horizon = busur lingkaran besar yang melewati titik kiri (0,hL*H) dan kanan (W,hR*H), planet di bawahnya.
   Pusat (cx,cy), radius R. Strip = bagian bawah layar mulai sedikit di atas titik tertinggi busur (ruang untuk atmosfer) sampai dasar layar. */
function pl3dGeom(still,tgt,nolib){   /* tgt=true: pakai geometri TUJUAN (sektor sekarang), bukan blend hidup; dipakai clamp BH mini supaya parkir saat masuk sektor tidak salah hitung selagi SKYT masih fade-in */
  var land=PW>PH,lv=(tgt&&typeof SECT!=='undefined'&&SECT.cur)?pl3dGeoOf(SECT.cur):PL3D_CFG.live,lb=nolib?[0,0]:pl3dLib(),yL=PH*((land?lv.hLL:lv.hL)+lb[0]),yR=PH*((land?lv.hRL:lv.hR)+lb[1]),R=Math.max(PW*PL3D_CFG.rK,PW*.6),
      dy=yR-yL,c=Math.hypot(PW,dy),hh=Math.sqrt(Math.max(0,R*R-c*c*.25)),
      cx=PW*.5+(-dy/c)*hh,cy=(yL+yR)*.5+(PW/c)*hh,ymin=1e9,i,x,yy;
  for(i=0;i<=16;i++){x=PW*i/16;yy=cy-Math.sqrt(Math.max(0,R*R-(x-cx)*(x-cx)));if(yy<ymin)ymin=yy;}
  /* ukuran strip dari horizon TERTINGGI di semua profil (pl3dTopFrac, dianggap datar -> batas atas konservatif) */
  var yT=PH*pl3dTopFrac(land),yMinB=yT-(R-Math.sqrt(Math.max(0,R*R-PW*PW*.25)));
  var libM=(PL3D_CFG.libr&&PL3D_CFG.libr.on)?(PL3D_CFG.libr.lat+PL3D_CFG.libr.tilt)*PH:0,bo=Math.ceil(libM*2),
      sH=Math.max(8,Math.min(PH,Math.ceil(PH-Math.max(0,yMinB-30-PL3D_CFG.parMax-libM)))),par=still?null:pl3dPar(),f=par?par.f:1,ox=par?par.x:0,oy=par?par.y:0;
  if(f!==1){cx=PW*.5+(cx-PW*.5)*f;cy=PH*.5+(cy-PH*.5)*f;R*=f;ymin=PH*.5+(ymin-PH*.5)*f;}   /* zoom ringan terhadap tengah layar */
  return {R:R,cx:cx+ox,cy:cy+oy,ymin:ymin+oy,stripH:sH+bo,bo:bo,ox:ox,oy:oy,f:f};   /* bo = strip melebar ke BAWAH layar sebesar bo px, supaya transformasi ayunan tidak membuka celah di dasar layar */
}

function pl3dLoad(){
  if(PL3D.state!==0)return;
  if(!PL3D_CFG.on||PL3D_CFG.force2d||(typeof IS_POTATO!=='undefined'&&IS_POTATO)||(typeof reduce!=='undefined'&&reduce)){PL3D.state=3;PL3D.err=PL3D_CFG.on?(PL3D_CFG.force2d?'2d':'potato/reduce'):'off';return;}
  PL3D.state=1;
  var go=function(){try{pl3dBuild();}catch(e){pl3dFail(e&&e.message||e);}};
  if(typeof THREE!=='undefined'&&THREE.REVISION){go();return;}
  /* three.min.js bisa lagi dimuat 12-ast3d.js dkk: jangan dobel, cukup tunggu sampai THREE ada */
  var src=PL3D_CFG.lib,has=false,ss=document.getElementsByTagName('script'),i;
  for(i=0;i<ss.length;i++){if((ss[i].getAttribute('src')||'')===src){has=true;break;}}
  if(!has){
    var s=document.createElement('script');
    s.src=src;s.async=true;s.onerror=function(){pl3dFail('gagal muat '+src);};
    document.head.appendChild(s);
  }
  var tries=0,iv=setInterval(function(){
    if(typeof THREE!=='undefined'&&THREE.REVISION){clearInterval(iv);go();}
    else if(++tries>80){clearInterval(iv);pl3dFail('timeout menunggu three.js');}
  },150);
}

var PL3D_VS=[
  'varying vec2 vPx;',
  'uniform vec2 uSize;',
  'void main(){',
  '  vPx=(position.xy*.5+.5)*uSize;',
  '  gl_Position=vec4(position.xy,0.,1.);',
  '}'
].join('\n');

/* bola analitik: p = titik di bola satuan (n.x, n.y, z); rotasi = putar mengelilingi sumbu pandang (kutub menghadap kamera),
   jadi di limb permukaan bergeser mendatar tanpa foreshortening dan tanpa pinching kutub. */
/* PERMUKAAN: bukan lagi noise di bola, tapi tanah datar berperspektif di bawah horizon.
   s = jarak ke horizon (px CSS), u = jarak sepanjang horizon (px CSS, ikut rotasi pelan).
   Koordinat tanah G = (u, persp)/s: makin dekat horizon makin rapat + gepeng (perspektif sungguhan).
   Detail yang lebih halus dari ~1px layar di-fade (per oktaf) -> tidak ada moire, dan menyatu ke kabut horizon.
   Batu = kubah acak per sel (3x3 sel tetangga, 1 fetch tekstur per sel: R,G = posisi, B = ukuran). */
var PL3D_FS=[
  'varying vec2 vPx;',
  'uniform vec2 uSize;uniform vec2 uC;uniform float uR;uniform float uRot;',
  'uniform vec2 uLight;uniform float uFall;uniform vec3 uWarm;',
  'uniform vec3 uLo;uniform vec3 uMid;uniform vec3 uHi;uniform vec3 uAtm;uniform float uAtmA;',
  'uniform vec2 uSeed;uniform float uLod;uniform float uFadeS;uniform float uHazeA;uniform float uCloudCov;uniform float uCloudH;uniform float uCloud;uniform float uPhi0;uniform float uFx;uniform float uPer;uniform float uHaze;uniform float uRock;',
  'uniform sampler2D uNoise;',
  /* value noise 2D: 1 fetch, f di-smooth lalu bilinear hardware = interpolasi smoothstep */
  'float vn2(vec2 p){',
  '  vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.-2.*f);',
  '  return texture2D(uNoise,(i+f+.5)/256.).x;',
  '}',
  /* jejak batu 0..1 di titik G (posisi/ukuran SAMA dgn mesh batu di JS, pl3dRocks). Dipakai cuma utk bayangan + kontak di tanah; batu sendiri digambar sbg mesh */
  'float boul(vec2 G){',
  '  vec2 ci=floor(G);float h=0.;',
  '  for(int j=-1;j<=1;j++){for(int i=-1;i<=1;i++){',
  '    vec2 c=ci+vec2(float(i),float(j));',
  '    vec3 r=texture2D(uNoise,(c+uSeed+.5)/256.).xyz;',
  '    vec2 dv=G-(c+.2+.6*r.xy);',
  '    float rad=.15+.30*r.z*r.z;',
  '    float q=1.-dot(dv,dv)/(rad*rad);',
  '    h=max(h,sqrt(max(q,0.))*step(uRock,r.z));',
  '  }}',
  '  return h;',
  '}',
  /* fbm 5 oktaf dgn LOD: oktaf yang lebih halus dari ~1px layar di-fade ke rata-rata (tak ada moire) */
  'float fbmL(vec2 G,float pv,vec2 off){',
  '  float tn=0.;float a=.5;float fq=1.;',
  '  for(int o=0;o<5;o++){',
  '    float w=clamp((pv/fq-1.2*uLod)/(1.8*uLod),0.,1.);',
  '    tn+=a*mix(.5,vn2(G*fq+off),w);',
  '    fq*=2.;a*=.5;',
  '  }',
  '  return tn;',
  '}',
  /* tanah: tekstur lama (bercak + punggungan/kontur ridged), sekarang di bidang tanah berperspektif */
  'float terr(float u,float s){',
  '  vec2 G=vec2(u,uPer)/s*uFx;',
  '  float pv=s*s/(uPer*uFx);',                                  /* periode vertikal 1 sel di layar (px CSS) */
  '  float e=fbmL(G,pv,vec2(7.1,3.7)+uSeed);',
  '  float r=1.-abs(2.*fbmL(G*.7,pv/.7,vec2(11.,5.)+uSeed)-1.);',
  '  float x=e*.78+r*r*.30-.06;',
  '  return clamp((x-.42)*2.6+.45,0.,1.);',
  '}',
  'float cloudAt(float u,float s){',
  '  vec2 G=vec2(u,uPer)/s*uFx;',
  '  float pv=s*s/(uPer*uFx);',
  '  float lo=1.05-uCloudCov;',                                  /* cov .5 -> lo .55 (batas lama); makin besar makin banyak area terlewati */
  '  float c=smoothstep(lo,lo+.30,fbmL(G*.45,pv/.45,vec2(3.,9.)+uSeed));',
  '  return uCloudH>0.?c*exp(-s/(uHaze*uCloudH)):c;',
  '}',
  'float bh(float u,float s){',
  '  float pv=s*s/(uPer*uFx);',
  '  float wb=clamp((pv*.4-1.2)/1.8,0.,1.);',
  '  if(wb<=0.)return 0.;',
  '  return boul(vec2(u,uPer)/s*uFx)*wb;',
  '}',
  'void main(){',
  '  vec2 d=(vPx-uC)/uR;',
  '  float len=length(d);',
  '  float pxo=(len-1.)*uR;',                                   /* jarak ke tepi bola, px: >0 di luar */
  '  float inside=1.-smoothstep(-1.2,.6,pxo);',
  '  float glow=uAtmA*exp(-max(pxo,0.)/9.);',
  '  vec3 col=vec3(0.);',
  '  if(inside>0.){',
  '    float z=sqrt(max(0.,1.-len*len));',
  '    vec3 n=vec3(d,z);',
  '    float s=max(-pxo,.6);',
  '    float u=(atan(d.y,d.x)-uPhi0+uRot)*uR;',
  '    float e=terr(u,s);',
  '    vec3 alb=e<.5?mix(uLo,uMid,e*2.):mix(uMid,uHi,(e-.5)*2.);',
  '    vec2 tl=uLight-vPx;float ll=length(tl);',
  '    vec3 L=normalize(vec3(tl,ll*.5+18.));',
  '    vec2 tdn=tl/max(ll,1.);',
  '    float e2=terr(u+tdn.x*2.5,max(s-tdn.y*2.5,.6));',
  '    float relief=clamp(1.+(e-e2)*12.,.45,1.7);',
  '    float unit=s/uFx;',                                       /* px layar per 1 sel tanah di kedalaman ini */
  '    float b0=bh(u,s);',
  '    float b1=bh(u+tdn.x*unit*.22,max(s-tdn.y*unit*.22,.6));',
  '    float b2=bh(u+tdn.x*unit*.5,max(s-tdn.y*unit*.5,.6));',
  '    float sh=clamp(max(b1*.95,b2*.75)*1.3-b0*1.5,0.,.8);',     /* bayangan batu jatuh menjauhi cahaya */
  '    float nl=max(dot(n,L),0.);',
  '    float fall=clamp(1.25-ll/uFall,.22,1.25);',
  '    col=alb*.30+(alb*uWarm*nl*fall*1.55*relief+uWarm*pow(nl,4.)*fall*.05*(.4+e))*(1.-sh);',
  '    col=mix(col,uAtm*.55+vec3(.18),cloudAt(u,s)*uCloud*(.35+.65*nl*fall));',
  '    col*=1.-.55*clamp(b0*2.,0.,1.);',                         /* gelap di kaki batu (kontak) */
  '    float hz=exp(-s/uHaze);',                                  /* kabut atmosfer makin tebal ke arah horizon */
  '    col=mix(col,uAtm*.40+vec3(.04),hz*uHazeA);',
  '  }',
  '  float eff=inside*(uFadeS>0.?smoothstep(0.,uFadeS,max(-pxo,0.)):1.);',   /* transparan menuju horizon (fadeS) */
  '  vec3 rgb=col*eff+uAtm*glow*(1.-eff);',
  '  float a=eff+glow*(1.-eff);',
  '  gl_FragColor=vec4(rgb,clamp(a,0.,1.));',
  '}'
].join('\n');

/* batu = mesh instanced (geometri dari ast3dRockGeo, shading mirip asteroid). Posisi layar (px strip) + ukuran dihitung di JS (pl3dRocks);
   kedalaman dari s (jarak ke horizon): makin jauh dari horizon = makin dekat kamera = menutupi yang di belakang. */
var PL3D_RVS=[
  'attribute vec4 iA;attribute vec4 iB;attribute float iS;',
  'uniform vec2 uSize;uniform vec2 uLight;uniform float uPer;',
  'varying vec3 vN;varying vec3 vL;varying float vS;varying float vT;varying float vD;varying vec3 vP;varying float vTl;',
  'vec3 rot(vec3 v,vec3 k,float a){float c=cos(a),s=sin(a);return v*c+cross(k,v)*s+k*dot(k,v)*(1.-c);}',
  'void main(){',
  '  vec3 p=rot(position,iB.xyz,iB.w);',
  '  vN=rot(normal,iB.xyz,iB.w);',
  '  vec2 d=uLight-iA.xy;float len=length(d);',
  '  vL=normalize(vec3(d,len*.5+18.));',
  '  vS=iS;vT=iA.w;vD=len;vP=p;vTl=min(iS/uPer,1.);',
  '  vec2 px=iA.xy+p.xy*iA.z;',
  '  float zc=.9-1.8*(iS+p.z*iA.z)/(uSize.y*1.1);',
  '  gl_Position=vec4(px/uSize*2.-1.,zc,1.);',
  '}'
].join('\n');
var PL3D_RFS=[
  'uniform float uFall;uniform float uHaze;uniform float uHazeA;uniform vec3 uWarm;uniform vec3 uMid;uniform vec3 uHi;uniform vec3 uAtm;',
  'varying vec3 vN;varying vec3 vL;varying float vS;varying float vT;varying float vD;varying vec3 vP;varying float vTl;',
  'void main(){',
  '  float g=vP.y+vTl*vP.z;',                                    /* bidang tanah berperspektif lewat tengah batu: yang di bawahnya terbenam */
  '  if(g<-.02)discard;',
  '  vec3 n=normalize(vN),L=normalize(vL);',
  '  float nl=max(dot(n,L),0.);',
  '  float fall=clamp(1.25-vD/uFall,.22,1.25);',
  '  vec3 base=mix(uMid,uHi,.30+.40*vT);',
  '  vec3 col=base*.30+base*uWarm*nl*fall*1.6+uWarm*pow(nl,4.)*fall*.16;',
  '  float rim=pow(1.-max(n.z,0.),2.5)*pow(max(dot(normalize(n.xy+1e-4),normalize(L.xy+1e-4)),0.),1.5);',
  '  col+=uWarm*rim*fall*.25;',
  '  col*=mix(.45,1.,smoothstep(0.,.45,g));',                     /* gelap di garis kontak dgn tanah */
  '  float hz=exp(-vS/uHaze);',
  '  col=mix(col,uAtm*.40+vec3(.04),hz*uHazeA);',
  '  gl_FragColor=vec4(col,1.);',
  '}'
].join('\n');

function pl3dBuild(){
  var T=THREE;
  var cv=document.createElement('canvas');
  var r=new T.WebGLRenderer({canvas:cv,alpha:true,antialias:false,premultipliedAlpha:true,powerPreference:'low-power',preserveDrawingBuffer:false});
  r.setClearColor(0x000000,0);r.setPixelRatio(1);
  cv.addEventListener('webglcontextlost',function(e){e.preventDefault();pl3dFail('webglcontextlost');},false);
  var P=PL3D_CFG.pal,L=PL3D_CFG.lightCol;
  PL3D.r=r;PL3D.sc=new T.Scene();PL3D.cam=new T.Camera();
  /* tekstur noise 256x256 (tileable, deterministik): R = acak(x,y), G = R digeser (+37,+17), B = acak kedua (ukuran batu) */
  var nz=new Uint8Array(256*256*4),nr=new Uint8Array(256*256),nb=new Uint8Array(256*256),ni,nx,ny,sd=1337;
  for(ni=0;ni<nr.length;ni++){sd=(Math.imul(sd,1664525)+1013904223)>>>0;nr[ni]=sd>>>24;}
  for(ni=0;ni<nb.length;ni++){sd=(Math.imul(sd,1664525)+1013904223)>>>0;nb[ni]=sd>>>24;}
  for(ny=0;ny<256;ny++)for(nx=0;nx<256;nx++){ni=(ny*256+nx)*4;nz[ni]=nr[ny*256+nx];nz[ni+1]=nr[((ny+17)&255)*256+((nx+37)&255)];nz[ni+2]=nb[ny*256+nx];nz[ni+3]=255;}
  var ntex=new T.DataTexture(nz,256,256,T.RGBAFormat);
  ntex.wrapS=ntex.wrapT=T.RepeatWrapping;ntex.minFilter=ntex.magFilter=T.LinearFilter;ntex.generateMipmaps=false;ntex.needsUpdate=true;
  PL3D.ntex=ntex;PL3D.nr=nr;PL3D.nb=nb;
  PL3D.uni={
    uSize:{value:new T.Vector2(2,2)},uC:{value:new T.Vector2(1,-1)},uR:{value:1000},uRot:{value:0},
    uLight:{value:new T.Vector2(1,1)},uFall:{value:Math.max(PW,PH)*.9},uWarm:{value:new T.Vector3(L[0],L[1],L[2])},
    uLo:{value:new T.Vector3(P.lo[0],P.lo[1],P.lo[2])},uMid:{value:new T.Vector3(P.mid[0],P.mid[1],P.mid[2])},uHi:{value:new T.Vector3(P.hi[0],P.hi[1],P.hi[2])},
    uAtm:{value:new T.Vector3(P.atm[0],P.atm[1],P.atm[2])},uAtmA:{value:P.atmA},
    uSeed:{value:new T.Vector2(PL3D_CFG.live.sx,PL3D_CFG.live.sy)},uCloud:{value:PL3D_CFG.cloud},uPhi0:{value:1.5707963},uFx:{value:1.4},uPer:{value:PL3D_CFG.persp},uHaze:{value:PL3D_CFG.haze},uLod:{value:PL3D_CFG.lod},uFadeS:{value:PL3D_CFG.fadeS},uCloudCov:{value:PL3D_CFG.cloudCov},uCloudH:{value:PL3D_CFG.cloudH},uHazeA:{value:PL3D_CFG.hazeA},uRock:{value:PL3D_CFG.rockD},uNoise:{value:ntex}
  };
  PL3D.mat=new T.ShaderMaterial({uniforms:PL3D.uni,vertexShader:PL3D_VS,fragmentShader:PL3D_FS,transparent:false,depthTest:false,depthWrite:false,blending:T.NoBlending});
  var mesh=new T.Mesh(new T.PlaneBufferGeometry(2,2),PL3D.mat);
  mesh.frustumCulled=false;mesh.renderOrder=-10;PL3D.sc.add(mesh);
  PL3D.rk=[];
  try{
    if(PL3D_CFG.rocks&&typeof ast3dRockGeo==='function'){
      PL3D.rmat=new T.ShaderMaterial({uniforms:PL3D.uni,vertexShader:PL3D_RVS,fragmentShader:PL3D_RFS,transparent:false,depthTest:true,depthWrite:true,blending:T.NoBlending});
      var rv,rg,ri,cap=160;
      for(ri=0;ri<4;ri++){
        rg=ast3dRockGeo(ri+11);
        var ig=new T.InstancedBufferGeometry();
        ig.index=rg.index;ig.setAttribute('position',rg.attributes.position);ig.setAttribute('normal',rg.attributes.normal);
        rv={A:new T.InstancedBufferAttribute(new Float32Array(cap*4),4).setUsage(T.DynamicDrawUsage),   /* x, y (px strip), ukuran px, nada warna */
            B:new T.InstancedBufferAttribute(new Float32Array(cap*4),4).setUsage(T.DynamicDrawUsage),   /* sumbu putar xyz, sudut */
            S:new T.InstancedBufferAttribute(new Float32Array(cap),1).setUsage(T.DynamicDrawUsage),     /* s = jarak ke horizon */
            geo:ig,n:0,cap:cap};
        ig.setAttribute('iA',rv.A);ig.setAttribute('iB',rv.B);ig.setAttribute('iS',rv.S);ig.instanceCount=0;
        rv.mesh=new T.Mesh(ig,PL3D.rmat);rv.mesh.frustumCulled=false;PL3D.sc.add(rv.mesh);
        PL3D.rk.push(rv);
      }
    }
  }catch(eRk){PL3D.rk=[];try{console.warn('[planet3d] batu mesh nonaktif:',eRk&&eRk.message);}catch(e2){}}
  pl3dResize();
  /* kompilasi shader sekarang (saat idle/boot), lalu cek hasilnya: shader error di three TIDAK melempar, jadi diperiksa lewat diagnostics program */
  var warm=function(){
    if(PL3D.state!==1)return;
    try{
      pl3dUniforms(performance.now());
      r.compile(PL3D.sc,PL3D.cam);r.render(PL3D.sc,PL3D.cam);
      var ps=r.info.programs||[],i,bad='';
      for(i=0;i<ps.length;i++){var dg=ps[i].diagnostics;if(dg&&dg.runnable===false){bad=(dg.programLog||'')+' '+((dg.fragmentShader&&dg.fragmentShader.log)||'')+' '+((dg.vertexShader&&dg.vertexShader.log)||'');break;}}
      if(bad){pl3dFail('shader: '+bad.replace(/\s+/g,' ').slice(0,300));return;}
      if(r.getContext&&r.getContext().isContextLost&&r.getContext().isContextLost()){pl3dFail('context lost');return;}
      PL3D.state=2;PL3D.dirty=true;PL3D.warm=true;
    }catch(e){pl3dFail(e&&e.message||e);}
  };
  if(typeof requestIdleCallback==='function')requestIdleCallback(warm,{timeout:2500});else setTimeout(warm,400);
}

/* ukuran strip + kanvas 2D penyimpan hasil (kanvas WebGL offscreen tidak dijamin menyimpan isinya antar-task) */
function pl3dResize(){
  pl3dSync();
  var gm=pl3dGeom(true,false,true),q=PL3D_CFG.q,rw=Math.max(8,Math.round(PW*q)),rh=Math.max(4,Math.round(gm.stripH*q));
  if(PL3D.W===PW&&PL3D.H===PH&&PL3D.rw===rw&&PL3D.rh===rh&&PL3D.cv2)return;
  PL3D.W=PW;PL3D.H=PH;PL3D.rw=rw;PL3D.rh=rh;PL3D.stripH=gm.stripH;PL3D.dirty=true;
  if(!PL3D.cv2){PL3D.cv2=document.createElement('canvas');PL3D.c2=PL3D.cv2.getContext('2d');}
  PL3D.cv2.width=rw;PL3D.cv2.height=rh;
  PL3D.fb=null;
  if(PL3D.r){PL3D.r.setSize(rw,rh,false);if(PL3D.uni)PL3D.uni.uFall.value=Math.max(PW,PH)*.9;}
}

/* titik lampu (ruang layar tegak): overview = portal yang sedang mengorbit (P4; kalau di balik limb, lampunya di balik planet jadi cuma pinggir limb yang menyala), sektor = BH mini */
function pl3dLightPos(){
  var p=null;
  try{if(typeof SECT!=='undefined'&&!SECT.cur&&typeof PT3D!=='undefined'&&PT3D.orb&&PT3D.orb.on&&PT3D.ovX!=null)p=[PT3D.ovX,PT3D.ovY];}catch(eL){}
  if(!p)p=camBH();
  return pl3dScr(p[0],p[1]);
}
function pl3dUniforms(now){
  pl3dSync();
  var gm=pl3dGeom(false,false,true),U=PL3D.uni,bp=pl3dLightPos();   /* geometri RENDER tanpa ayunan; ayunan = transformasi saat drawImage */
  U.uSize.value.set(PW,gm.stripH);
  U.uC.value.set(gm.cx,PH-gm.cy+gm.bo);                               /* ruang strip: y ke atas, 0 = dasar layar */
  U.uR.value=gm.R;
  U.uFx.value=100/PL3D_CFG.cell;
  U.uPhi0.value=Math.atan2(Math.sqrt(Math.max(0,gm.R*gm.R-(PW*.5-gm.cx)*(PW*.5-gm.cx))),PW*.5-gm.cx);   /* arah titik horizon di tengah layar = titik hilang perspektif */
  U.uRot.value=pl3dPhase(now)/gm.R;
  U.uSeed.value.set(PL3D_CFG.live.sx,PL3D_CFG.live.sy);
  U.uHaze.value=PL3D_CFG.haze;U.uHazeA.value=PL3D_CFG.hazeA;U.uCloud.value=PL3D_CFG.cloud;U.uLod.value=PL3D_CFG.lod;U.uFadeS.value=PL3D_CFG.fadeS;U.uCloudCov.value=PL3D_CFG.cloudCov;U.uCloudH.value=PL3D_CFG.cloudH;   /* knob kabut bisa diubah live (console/panel tuning) */
  U.uLight.value.set(bp[0],PH-bp[1]+gm.bo);
  PL3D.bo=gm.bo;PL3D.rox=gm.ox;PL3D.roy=gm.oy;PL3D.rf=gm.f;   /* parallax/zoom yang baru dirender: selisihnya ke posisi sekarang digeser saat drawImage */
  pl3dPalUpdate();var P=PL3D_CFG.pal;   /* palette hidup (crossfade sektor) */
  U.uLo.value.set(P.lo[0],P.lo[1],P.lo[2]);U.uMid.value.set(P.mid[0],P.mid[1],P.mid[2]);U.uHi.value.set(P.hi[0],P.hi[1],P.hi[2]);
  U.uAtm.value.set(P.atm[0],P.atm[1],P.atm[2]);U.uAtmA.value=P.atmA;
  pl3dPalSnap();
  return gm;
}

/* tempatkan batu mesh: sel tanah (gx,gy) sama persis dgn yang dipakai shader (boul), jadi bayangan/kontak di tanah pas dgn mesh.
   Dipanggil sebelum tiap render (4 fps), isi atribut instance per varian. */
function pl3dRocks(gm){
  var rk=PL3D.rk,U=PL3D.uni;if(!rk||!rk.length)return;
  var R=gm.R,sh=gm.stripH,cxs=gm.cx,cys=PH-gm.cy+gm.bo,N=U.uFx.value,F=PL3D_CFG.persp,phi0=U.uPhi0.value,rotpx=U.uRot.value*R,rd=PL3D_CFG.rockD,nr=PL3D.nr,nb=PL3D.nb,
      nV=rk.length,i,v,gx,gy,pm=Math.PI,sdx=U.uSeed.value.x|0,sdy=U.uSeed.value.y|0;
  function sOf(x,y){return R-Math.hypot(x-cxs,y-cys);}
  function uOf(x,y){return (Math.atan2(y-cys,x-cxs)-phi0)*R;}
  var sMax=Math.max(sOf(0,0),sOf(PW,0)),sMin=7;
  var u1=uOf(0,0),u2=uOf(PW,0),u3=uOf(0,sh),u4=uOf(PW,sh),uMin=Math.min(u1,u2,u3,u4),uMax=Math.max(u1,u2,u3,u4);
  for(i=0;i<nV;i++)rk[i].n=0;
  var gy0=Math.floor(F*N/sMax)-1,gy1=Math.min(Math.ceil(F*N/sMin),gy0+160);
  for(gy=gy0;gy<=gy1;gy++){
    var sr=F*N/(gy+.5),xlo=Math.floor((uMin+rotpx)*N/sr)-1,xhi=Math.ceil((uMax+rotpx)*N/sr)+1;
    if(xhi-xlo>400)continue;
    for(gx=xlo;gx<=xhi;gx++){
      var nx=(((gx+sdx)%256)+256)%256,ny=(((gy+sdy)%256)+256)%256,rz=nb[ny*256+nx]/255;   /* seed sektor = geser indeks noise, sama dgn uSeed di shader (boul) */
      if(!(rz>=rd))continue;
      var rx=nr[ny*256+nx]/255,ry=nr[((ny+17)&255)*256+((nx+37)&255)]/255,cyg=gy+.2+.6*ry;
      var s=F*N/cyg;if(s<sMin||s>sMax*1.2)continue;
      var cxg=gx+.2+.6*rx,uS=cxg*s/N-rotpx,phi=phi0+uS/R,rr=R-s,px=cxs+rr*Math.cos(phi),py=cys+rr*Math.sin(phi);
      var rad=.15+.30*rz*rz,k=rad*s/N*PL3D_CFG.rockSz;
      if(k<1.2||px<-k*1.3||px>PW+k*1.3||py<-k*1.3||py>sh+k)continue;
      v=rk[(nx*31+ny*17)%nV];if(v.n>=v.cap)continue;
      var j=v.n++,ax=rx*2-1,ay=ry*2-1,az=rz*2-1,al=Math.hypot(ax,ay,az)||1;
      v.A.array[j*4]=px;v.A.array[j*4+1]=py;v.A.array[j*4+2]=k;v.A.array[j*4+3]=rx;
      v.B.array[j*4]=ax/al;v.B.array[j*4+1]=ay/al;v.B.array[j*4+2]=az/al;v.B.array[j*4+3]=(rx+ry)*pm;
      v.S.array[j]=s;
    }
  }
  for(i=0;i<nV;i++){
    v=rk[i];v.geo.instanceCount=v.n;
    v.A.updateRange.offset=0;v.A.updateRange.count=v.n*4;v.A.needsUpdate=true;
    v.B.updateRange.offset=0;v.B.updateRange.count=v.n*4;v.B.needsUpdate=true;
    v.S.updateRange.offset=0;v.S.updateRange.count=v.n;v.S.needsUpdate=true;
    v.mesh.visible=v.n>0;
  }
}

/* fallback 2D: strip dibake sekali (gradien limb + pita noise + rim atmosfer), lalu cuma di-drawImage */
function pl3dBake2D(){
  pl3dSync();
  var gm=pl3dGeom(false,false,true),w=PL3D.rw,h=PL3D.rh,k=w/PW,P=PL3D_CFG.pal,c=PL3D.c2,i,sy=PH-gm.stripH+gm.bo,cyS=gm.cy-sy,yTop=gm.ymin-sy;   /* sy = y layar tepi atas strip */
  function rgb(a,m){return 'rgb('+Math.round(a[0]*255*m)+','+Math.round(a[1]*255*m)+','+Math.round(a[2]*255*m)+')';}
  PL3D.bo=gm.bo;PL3D.rox=gm.ox;PL3D.roy=gm.oy;PL3D.rf=gm.f;
  c.clearRect(0,0,w,h);
  c.save();c.scale(k,k);
  c.beginPath();c.arc(gm.cx,cyS,gm.R,0,6.2831853);c.clip();
  var gr=c.createLinearGradient(0,yTop,0,gm.stripH);
  gr.addColorStop(0,rgb(P.hi,.92));gr.addColorStop(.35,rgb(P.mid,1));gr.addColorStop(1,rgb(P.lo,1));
  c.fillStyle=gr;c.fillRect(0,0,PW,gm.stripH);
  for(i=0;i<26;i++){                                           /* pita noise sederhana (deterministik) */
    var yy=yTop+((i*37.7)%100)/100*(gm.stripH-yTop),xx=((i*113.3)%100)/100*PW,ww=PW*(.12+((i*53)%40)/100),al=.05+((i*29)%10)/200;
    c.fillStyle='rgba('+Math.round(P.hi[0]*255)+','+Math.round(P.hi[1]*255)+','+Math.round(P.hi[2]*255)+','+al+')';
    c.beginPath();c.ellipse(xx,yy,ww,(gm.stripH-yTop)*.035,0,0,6.2831853);c.fill();
  }
  c.restore();
  c.save();c.scale(k,k);                                       /* rim atmosfer cyan tipis di tepi atas */
  var A=P.atm,ar=Math.round(A[0]*255),ag=Math.round(A[1]*255),ab=Math.round(A[2]*255);
  for(i=0;i<4;i++){
    c.strokeStyle='rgba('+ar+','+ag+','+ab+','+(P.atmA*(1-i*.22))+')';c.lineWidth=2+i*3;
    c.beginPath();c.arc(gm.cx,cyS-i*1.5,gm.R+i*1.5,0,6.2831853);c.stroke();
  }
  c.restore();
}

/* dipanggil dari frame() (05-sector-ui.js) setelah drawFloatingTelescopeTop. Tidak melempar; tidak punya timer render sendiri. */
function planet3dDraw(now){
  try{if(typeof SECT!=='undefined'&&SECT.cur&&typeof PT3D!=='undefined')PT3D.orbInSect=1;}catch(eO){}   /* P4: lagi di sektor -> orbit portal overview mulai dari puncak begitu kembali */
  pl3dSync();
  if(!PL3D_CFG.on||!PW||!PH)return;
  pl3dPalUpdate();pl3dPhase(now);   /* geometri + fase hidup selalu mengikuti SKYT, juga saat render ditahan (menu/cam), supaya tidak melompat waktu kembali */
  if(PL3D.state===0){pl3dLoad();}
  if(typeof pageHidden!=='undefined'&&pageHidden)return;
  /* fade mode cam (zoom rasi): sama seperti teleskop/drone (04-render.js:336), tapi alpha sendiri supaya tidak ikut lisGone */
  var dt=Math.min(40,Math.max(0,now-(PL3D.lastT||now)))/1000;PL3D.lastT=now;
  PL3D.al+=((typeof CAMERA_MODE!=='undefined'&&CAMERA_MODE?0:1)-PL3D.al)*Math.min(1,dt*6);
  if(PL3D.al>.985)PL3D.al=1;
  if(PL3D.al<.02)return;                                       /* mode cam: tidak gambar, tidak render (hemat) */
  if(typeof skyZoom!=='undefined'&&skyZoom>4)return;           /* planet keluar layar */
  if(typeof smenuHidesSky==='function'&&smenuHidesSky())return;
  if(typeof WORMHOLE!=='undefined'&&WORMHOLE.on&&WORMHOLE.arrive&&WORMHOLE.arrive()<.15)return;   /* wormhole sudah menutup layar: planet tidak kelihatan, jangan render */
  try{
    pl3dResize();
    var use3d=PL3D.state===2&&PL3D.r;
    var palCh=pl3dPalUpdate();   /* true selama palette bergeser (masuk/keluar sektor) */
    if(use3d){
      var bp=pl3dLightPos(),lx=bp[0],ly=PH-bp[1],pr=pl3dPar();
      var still=(typeof reduce!=='undefined'&&reduce);
      var parCh=Math.abs(pr.x-PL3D.rox)+Math.abs(pr.y-PL3D.roy)>1.5||Math.abs(pr.f-PL3D.rf)>.004;   /* parallax/zoom bergeser: render ulang (maks palFps) */
      var due=PL3D.dirty||(!still&&now-PL3D.lastR>=1000/PL3D_CFG.fps)||(Math.abs(lx-PL3D.lastLx)+Math.abs(ly-PL3D.lastLy)>40&&now-PL3D.lastR>=30)||((palCh||parCh)&&now-PL3D.lastR>=1000/PL3D_CFG.palFps);
      if(due){
        pl3dRocks(pl3dUniforms(now));
        PL3D.r.render(PL3D.sc,PL3D.cam);
        if(!PL3D.chk){   /* sekali: piksel dasar-tengah harus terisi (di dalam bola). Program yang tidak jalan tapi lolos diagnostics -> fallback 2D */
          PL3D.chk=1;
          var gl=PL3D.r.getContext(),px=new Uint8Array(4);
          gl.readPixels(PL3D.rw>>1,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);
          if(px[3]<200){pl3dFail('render kosong (alpha '+px[3]+')');return;}
        }
        PL3D.c2.clearRect(0,0,PL3D.rw,PL3D.rh);
        PL3D.c2.drawImage(PL3D.r.domElement,0,0,PL3D.rw,PL3D.rh);
        PL3D.lastR=now;PL3D.lastLx=lx;PL3D.lastLy=ly;PL3D.dirty=false;PL3D.renders++;
      }
    }else if(PL3D.state===3||PL3D.state===0||PL3D.state===1){
      /* fallback 2D / sementara 3D belum siap (supaya tidak ada "pop" kosong -> planet): bake ulang kalau perlu, dan selama crossfade palette (maks ~11x/dtk, murah) */
      var s3=PL3D.state===3,p2=pl3dPar(),parC=Math.abs(p2.x-PL3D.rox)+Math.abs(p2.y-PL3D.roy)>6||Math.abs(p2.f-PL3D.rf)>.01;   /* 2D: selisih kecil cukup digeser saat drawImage, bake ulang kalau jauh */
      if((s3&&PL3D.dirty)||!PL3D.fb||((palCh||parC)&&now-PL3D.lastB>=90)){pl3dBake2D();PL3D.fb=true;PL3D.lastB=now;pl3dPalSnap();if(s3)PL3D.dirty=false;}
    }
    if(!PL3D.cv2)return;
    var sh=PL3D.stripH;
    var cp=pl3dPar();
    g.save();
    if(PL3D.rot<0)g.transform(0,1,-1,0,STG.ih,0);else if(PL3D.rot>0)g.transform(0,-1,1,0,0,STG.iw);   /* ROT: ruang layar tegak -> ruang stage (kebalikan v2c) */
    g.globalAlpha=PL3D.al;
    var lb=pl3dLib(),lv=PL3D_CFG.live,land=PW>PH;
    if(lb[0]||lb[1]){   /* ayunan: geser + miring terhadap titik tengah horizon (tiap frame, tanpa render ulang shader) */
      var yc=PH*((land?lv.hLL+lv.hRL:lv.hL+lv.hR)*.5)+cp.y;
      var th=Math.atan2((lb[1]-lb[0])*PH,PW),sc=1+Math.abs(Math.tan(th))*2*Math.max(0,PH+(PL3D.bo||0)-yc)/PW;   /* sc: lebarkan sedikit supaya sudut bawah yang terangkat karena miring tidak membuka celah di tepi kiri/kanan */
      g.translate(PW*.5,yc);g.scale(sc,1);g.rotate(th);g.translate(-PW*.5,-yc+(lb[0]+lb[1])*.5*PH);
    }
    g.drawImage(PL3D.cv2,cp.x-(PL3D.rox||0),PH-sh+(PL3D.bo||0)+cp.y-(PL3D.roy||0),PW,sh);   /* geser selisih parallax sejak render terakhir: gerak mulus walau render cuma 4-20 fps */
    g.restore();
    PL3D.frames++;
  }catch(e){
    pl3dFail(e&&e.message||e);
  }
}
/* ---- BH mini boleh terbenam di balik limb (sektor saja) ----
   Batas: tepi bawah BH boleh masuk ke bawah limb sedalam bhSink x radius. x,y = koordinat STAGE (ruang BH), r = radius visual BH (px).
   Limb dihitung TANPA parallax (statis), jadi BH tidak bergerak sendiri waktu sky digeser. Aktif hanya kalau planet kelihatan. */
function pl3dBhOn(){
  return !!(PL3D_CFG.on&&PL3D.al>.5&&typeof SECT!=='undefined'&&SECT.cur&&!(typeof CAMERA_MODE!=='undefined'&&CAMERA_MODE));
}
function pl3dMaxY(sx,r,sink,live){   /* y layar tegak terbawah yang boleh ditempati PUSAT objek (BH / teleskop) di x=sx. live=true: limb ikut parallax/zoom yang sedang tampil */
  var gm=pl3dGeom(!live,!live),dx=sx-gm.cx,limb=gm.cy-Math.sqrt(Math.max(0,gm.R*gm.R-dx*dx));
  return limb-r+r*(sink==null?PL3D_CFG.bhSink:sink);
}
/* Clamp objek bebas (teleskop, 04-render.js): sama seperti BH mini tapi aktif juga di overview, dan memakai limb yang SEDANG tampil (parallax/zoom ikut).
   x,y = koordinat STAGE, r = radius visual (px), sink = berapa x r boleh terbenam. Hasil [x,y] stage; planet tidak kelihatan -> input apa adanya. */
function planetObjClamp(x,y,r,sink){
  if(!(PL3D_CFG.on&&PL3D.al>.5)||(typeof CAMERA_MODE!=='undefined'&&CAMERA_MODE))return [x,y];
  pl3dSync();if(!PW||!PH||!isFinite(x)||!isFinite(y))return [x,y];
  var q=pl3dScr(x,y),m=pl3dMaxY(q[0],r,sink,true);
  if(q[1]<=m)return [x,y];
  q[1]=m;
  return pl3dStage(q[0],q[1]);
}
function planetBhOk(x,y,r){
  if(!pl3dBhOn())return true;
  pl3dSync();if(!PW||!PH)return true;
  var q=pl3dScr(x,y);return q[1]<=pl3dMaxY(q[0],r)+.5;
}
function planetBhClamp(x,y,r){
  if(!pl3dBhOn())return [x,y];
  pl3dSync();if(!PW||!PH)return [x,y];
  var q=pl3dScr(x,y),m=pl3dMaxY(q[0],r);
  if(q[1]<=m)return [x,y];
  q[1]=m;
  return PL3D.rot<0?[STG.ih-q[1],q[0]]:(PL3D.rot>0?[q[1],STG.iw-q[0]]:[q[0],q[1]]);   /* balik ke ruang stage (kebalikan v2c) */
}

/* ---- Tanah untuk drone (drop dari teleskop -> mendarat di permukaan) ----
   Titik di permukaan = (ug, sg): ug = jarak sepanjang horizon (ikut rotasi, sama dgn u di shader), sg = jarak ke horizon (px, sama dgn s di shader).
   Posisi layar dihitung dgn rumus yang SAMA dgn pl3dRocks (batu), jadi drone yang berdiri di tanah ikut bergeser bersama batu & tekstur,
   termasuk parallax/zoom ringan. Dipakai 08-tx-drone.js. Planet tidak kelihatan (cam / menu sektor / zoom > 4 / overview) -> null. */
function planetGroundOk(){
  if(!PL3D_CFG.on||!(PL3D.al>.5))return false;
  if(typeof SECT==='undefined'||!SECT.cur||SECT.on)return false;
  if(typeof CAMERA_MODE!=='undefined'&&CAMERA_MODE)return false;
  if(typeof skyZoom!=='undefined'&&skyZoom>4)return false;
  if(typeof smenuHidesSky==='function'&&smenuHidesSky())return false;
  pl3dSync();return !!(PW&&PH);
}
function pl3dGroundFrame(){
  var gm=pl3dGeom(),R=gm.R,dx=PW*.5-gm.cx;
  return {gm:gm,R:R,cxs:gm.cx,cys:PH-gm.cy,phi0:Math.atan2(Math.sqrt(Math.max(0,R*R-dx*dx)),dx)};
}
function pl3dRotAng(now,R){   /* sudut putar permukaan (rad); sama dgn uRot di pl3dUniforms. Fallback 2D tidak berputar -> 0 */
  return (PL3D.state===2&&!(typeof reduce!=='undefined'&&reduce))?pl3dPhase(now)/R:0;
}
function planetRotPx(now){return pl3dRotAng(now,1);}   /* geseran permukaan (px di limb) sejak mulai; 0 kalau fallback 2D. Dipakai 08-tx-drone.js untuk parallax lawan rotasi */
function pl3dStage(xu,yu){return PL3D.rot<0?[STG.ih-yu,xu]:(PL3D.rot>0?[yu,STG.iw-xu]:[xu,yu]);}   /* ruang layar tegak -> ruang stage (kebalikan v2c) */
/* (ug,sg) -> posisi layar. lift = tinggi (px, ke atas di layar tegak) untuk titik pusat badan drone di atas kaki.
   Hasil: x,y = titik kaki (stage); lx,ly = titik pusat badan (stage); ux,uy = titik kaki di ruang layar tegak; k = sg (skala perspektif); off = sudah keluar layar. */
function planetGroundAt(ug,sg,now,lift){
  if(!planetGroundOk())return null;
  var F=pl3dGroundFrame(),R=F.R,phi=F.phi0+ug/R-pl3dRotAng(now,R),rr=R-sg,
      xu=F.cxs+rr*Math.cos(phi),yu=PH-(F.cys+rr*Math.sin(phi)),a=pl3dStage(xu,yu),b=pl3dStage(xu,yu-(lift||0));
  return {x:a[0],y:a[1],lx:b[0],ly:b[1],ux:xu,uy:yu,k:sg,off:(xu<10||xu>PW-10||yu>PH-8)};
}
/* pilih tempat mendarat: dekat x titik (xs,ys) (stage; mis. teleskop), dijepit ke sisi kiri layar tempat strip planet cukup tebal.
   frac (0..1 lebar layar) memaksa posisi x. Hasil {u,s} = (ug,sg) atau null. */
function planetLandPick(xs,ys,now,frac){
  if(!planetGroundOk())return null;
  var F=pl3dGroundFrame(),R=F.R,q=pl3dScr(xs,ys),xu=(frac!=null)?PW*frac:Math.max(PW*.14,Math.min(PW*.5,q[0])),
      ddx=xu-F.cxs,limb=F.gm.cy-Math.sqrt(Math.max(0,R*R-ddx*ddx)),sg=Math.max(14,Math.min(46,(PH-limb)*.5)),yu=limb+sg,
      dx=xu-F.cxs,dy=(PH-yu)-F.cys,rr=Math.hypot(dx,dy),phi=Math.atan2(dy,dx);
  return {u:(phi-F.phi0+pl3dRotAng(now,R))*R,s:R-rr};
}
/* gambar di ruang layar tegak (mis. elips pulse di tanah): panggil, gambar pakai ux/uy, lalu g.restore() */
function planetUprightBegin(gc){
  gc.save();
  if(PL3D.rot<0)gc.transform(0,1,-1,0,STG.ih,0);else if(PL3D.rot>0)gc.transform(0,-1,1,0,0,STG.iw);
}
try{pl3dLoad();}catch(ePL1){}   /* mulai muat + kompilasi shader saat idle (layar boot), bukan menunggu frame pertama */
