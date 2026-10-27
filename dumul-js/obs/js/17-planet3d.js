'use strict';
/* 17-planet3d.js — permukaan planet di dasar layar (rencana-planet.md, fase P1; Three.js r128, dimuat LAZY).
   Yang kelihatan cuma tutup (limb + permukaan) bola raksasa di dasar layar. Digambar di frame() (05-sector-ui.js) SETELAH teleskop 3D
   dan SEBELUM asteroid depan: di atas rasi, bintang, portal, BH, drone, teleskop; di bawah asteroid depan + HUD (DOM).
   Cara kerja: satu renderer WebGL offscreen kecil (strip bawah layar, setengah resolusi) merender satu quad; fragment shader menghitung bola
   secara analitik (permukaan = noise prosedural, bukan tekstur), lalu hasilnya disalin ke kanvas 2D (cv2) dan di-drawImage tiap frame.
   Cahaya = sama dengan asteroid (12-ast3d.js): lampu titik di posisi BH (camBH()), hangat, meredup menurut jarak.
   RENDER DIPECAH: tiap refresh strip dibagi PL3D_CFG.bands pita, 1 pita per frame (scissor, kanvas belakang cv3, tukar saat selesai) -> tidak ada lonjakan GPU. Petir: render parsial cuma kotak kecil di sekitar kilau (pl3dBoltWin).
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
  rK:15,          /* radius bola = rK x lebar layar. Makin besar = horizon makin datar (15 = nyaris lurus). Default kelipatan 5 supaya kena snap slider panel tuning */
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
  fps:8,          /* refresh PENUH strip per detik (bukan jumlah render GPU: tiap refresh dipecah jadi `bands` pita, 1 pita per frame, jadi tidak ada lonjakan). Tuner 'Rate' */
  bands:4,        /* pecah 1 refresh jadi N pita horizontal, dirender 1 pita per frame (scissor) ke kanvas belakang lalu ditukar sekaligus. Beban GPU per frame ~1/N, tanpa sambungan. 1 = render penuh sekali jalan (cara lama) */
  lightCol:[1,.74,.48],   /* warna cahaya, SAMA dengan asteroid (12-ast3d.js 'warm') */
  ov:{lo:[.014,.022,.036],mid:[.105,.140,.190],hi:[.340,.400,.480],atm:[.43,.90,1],atmA:.17,   /* palette OVERVIEW (netral): biru-baja gelap ke terang + atmosfer cyan tipis (110,229,255) */
      hL:.86,hR:.95,hLLand:.915,hRLand:.97,rot:0,seed:[0,0]},   /* geometri OVERVIEW (rot 0 = planet DIAM di overview; langit yang berputar, lihat MW di 02-sky-logic.js): kesan ekuator = horizon hampir datar (miring cuma .09, dulu .195) */
  /* AYUNAN HORIZON (librasi latitudinal + nutasi), cuma di sektor (overview = 0 lewat bobot SKYT): ujung horizon kiri/kanan naik-turun GANTIAN (tilt, seperti jungkat-jungkit)
     + sedikit naik-turun bersama (lat). Dua periode yang tidak berkelipatan -> tidak pernah persis berulang. Amplitudo = pecahan tinggi layar, periode = detik.
     DIGAMBAR SEBAGAI TRANSFORMASI 2D (geser + miring) pada strip yang sudah dirender, tiap frame penuh (60fps) -> mulus; shader TIDAK dirender ulang (tetap 4 fps).
     on:false / lat:0,tilt:0 = mati. Clamp BH/teleskop + drone ikut (pl3dGeom). */
  libr:{on:true,lat:.004,tilt:.012,pLat:170,pTilt:120,k:1},   /* k = pengali amplitudo lat+tilt (satu slider 'Sway' di panel tuning; 1 = seperti lat/tilt di atas, 0 = diam) */
  rotK:0,         /* pengali kecepatan rotasi tanah (SECTORS[].planet.rot). 0 = permukaan tanah DIAM (itu-itu saja), 1 = menggeser seperti dulu */
  live:null,      /* geometri HIDUP (blend ov + sektor): hL,hR,hLL,hRL,rot,sx,sy; diisi di bawah, jangan diedit */
  par:.05,        /* parallax: px planet per px skyPan (disengaja kecil, lebih pelan dari plateDeep .14; planet paling depan tapi nyaris diam) */
  parMax:24,      /* batas geser parallax (px CSS); juga margin strip supaya strip tidak berubah ukuran */
  zoomK:.1,       /* planet membesar cuma .1x dari skyZoom (diklem di zoom 4; di atas itu planet keluar layar) */
  sinkK:1,        /* pengali bhSink + teleSink (satu slider 'Sink' di panel tuning; 1 = apa adanya, 0 = tidak boleh menyentuh limb) */
  bhSink:.5,      /* BH mini boleh terbenam di balik limb sedalam sekian x radiusnya (0 = tidak boleh menyentuh limb) */
  teleSink:.35,   /* teleskop: idem bhSink (planetObjClamp). Radius yang dipakai = .7 x radius hit teleskop (04-render.js). 0 = tidak boleh menyentuh limb */
  /* knob tuning tambahan (tab Planet di panel owl; angka ini = DEFAULT): */
  atmK:1,         /* pengali opasitas atmosfer/glow limb (palette tetap per sektor) */
  fallK:1,        /* pengali jangkauan cahaya BH/portal di tanah (>1 = cahaya sampai lebih jauh) */
  hzDy:0,         /* geser horizon GLOBAL: overview + semua sektor (pecahan tinggi layar; + = turun). Dulu 'ovDy' (cuma overview) */
  /* DEKORASI (rim glow / awan / lampu kota; semua prosedural, tanpa aset). Angka 0 = mati. */
  rimLit:1,       /* rim glow condong ke sisi yang kena cahaya (BH mini / portal) + hangat sedikit. 0 = rata seperti dulu, 1 = penuh, 2 = lebih ekstrem */
  rimHalo:.45,    /* halo lebar tipis di luar limb (x opasitas atmosfer); 0 = tanpa halo */
  cloudDrift:4,   /* awan hanyut pelan (px/dtk di limb; + = ke kanan, - = ke kiri). 0 = awan diam. Butuh render periodik (fps) selama != 0 */
  cloudShd:.5,    /* bayangan awan di tanah, jatuh menjauhi cahaya (0 = tanpa bayangan) */
  cityA:1.1,      /* kecerahan lampu kota di sisi gelap (0 = mati) */
  cityD:.55,      /* kepadatan lampu kota di area permukiman 0..1 */
  cityTw:.25,     /* kedip lampu kota 0..1 (0 = tidak kedip; render periodik berhenti kalau drift awan juga 0) */
  cloudLit:.8,    /* cahaya sendiri awan: tepi yang menghadap cahaya terang, bagian yang terhalang awan lain gelap, inti tebal sedikit gelap (0 = warna datar seperti dulu) */
  cloudDet:.5,    /* serat/gumpalan halus di dalam awan (0 = mulus, 1 = berserat kuat); rata-rata kepadatan tidak berubah */
  cityGlow:.5,    /* pendar lampu kota: tanah di kawasan kota ikut menyala tipis + dasar awan di atas kota berpendar hangat (0 = titik saja) */
  craterA:.4,     /* kawah di tanah (kubah terbalik + bibir terang), posisi ikut seed sektor. 0 = tanpa kawah. Memudar menuju horizon (anti-moire) */
  canyonA:.3,     /* kanyon: alur panjang berkelok yang menggelapkan tanah (dalam, cuma di area tertentu). 0 = tanpa kanyon */
  craterS:1,      /* ukuran kawah (pengali; 1 = normal, >1 = lebih besar + lebih jarang, <1 = lebih kecil + lebih rapat) */
  canyonS:1,      /* ukuran kanyon (pengali skala alur: >1 = alur lebih lebar dan panjang, <1 = lebih halus dan rapat) */
  /* EFEK 2D (aurora / flare / puing / petir): overlay Canvas 2D di planet3dDraw, 60fps, ikut ROT + ayunan. Rancangan: rencana-dekor-planet.md. F1 = kerangka saja (belum ada gambar). */
  auroraOn:true,  /* tirai aurora di atas limb sisi gelap */
  flareOn:true,   /* kilau saat cahaya (portal / BH mini) lewat limb; tanpa acak */
  debrisOn:true,  /* puing / satelit kecil melintas di atas limb */
  boltOn:false,   /* kilat di sisi gelap (mati dulu) */
  evK:1,          /* pengali frekuensi kejadian acak (puing + petir); flare dan aurora tidak terpengaruh */
  boltK:1,        /* skala ukuran petir (panjang, tebal garis, jari-jari kilau). 1 = default kecil (panjang 10-28px); .3 = sangat kecil, 2 = dua kali lipat */
  fxDebug:false,  /* uji F1 lewat console: PL3D_CFG.fxDebug=true -> garis limb magenta + titik cahaya (kuning) + titik limb di bawah cahaya */
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
  rw:0,rh:0,W:0,H:0,stripH:0,al:1,lastR:-1e9,lastLx:-1e9,lastLy:-1e9,dirty:true,err:'',fb:null,fbKey:'',warm:false,frames:0,renders:0,palR:null,lastB:0,pdef:{},ph:0,phT:null,topC:null,secW:0,cv3:null,c3:null,cyc:null,full:true,bwR:null};

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
  var od=PL3D_CFG.hzDy||0;   /* hzDy: overview + sektor */
  return {hL:hL+od,hR:hR+od,hLL:hLL+od,hRL:hRL+od,rot:p.rot!=null?p.rot:ov.rot,sx:sd[0]|0,sy:sd[1]|0};
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
  var t=PL3D.phT*.001,kk=(c.k==null?1:c.k),la=c.lat*kk*Math.sin(t*6.2831853/c.pLat),ti=c.tilt*kk*Math.sin(t*6.2831853/c.pTilt+1.3);
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
  PL3D.state=3;PL3D.err=String(why||'');PL3D.dirty=true;PL3D.fb=null;PL3D.cyc=null;PL3D.bwR=null;
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
  var libM=(PL3D_CFG.libr&&PL3D_CFG.libr.on)?(PL3D_CFG.libr.lat+PL3D_CFG.libr.tilt)*Math.max(1,PL3D_CFG.libr.k==null?1:PL3D_CFG.libr.k)*PH:0,bo=Math.ceil(libM*2),
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
  'uniform float uT;uniform float uCDrift;uniform float uShd;uniform float uRimLit;uniform float uRimHalo;uniform float uCityA;uniform float uCityD;uniform float uCityTw;uniform float uCrat;uniform float uCany;uniform float uCratS;uniform float uCanyS;',
  'uniform float uCloudLit;uniform float uCloudDet;uniform float uCityGlow;uniform vec4 uBolt;uniform float uBoltAsp;',
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
  /* kawah: 1 per sel (sel = G*.6), pusat dibatasi di tengah sel supaya tidak ada jahitan antar sel. Mangkuk (turun) + bibir (naik tipis), diredam di dekat horizon */
  'float crat(vec2 Gc,float pc){',
  '  float wc=clamp((pc*.4-1.2)/1.8,0.,1.);',
  '  if(wc<=0.)return 0.;',
  '  vec2 ci=floor(Gc);',
  '  vec3 r=texture2D(uNoise,(ci+uSeed+vec2(53.,29.)+.5)/256.).xyz;',
  '  float ex=texture2D(uNoise,(ci+uSeed+vec2(17.,71.)+.5)/256.).x;',   /* ada/tidaknya kawah di sel ini (~55% sel) */
  '  float rad=.10+.16*r.z;',
  '  float q=length(Gc-(ci+.35+.30*r.xy))/rad;',
  '  float bowl=1.-smoothstep(.15,1.,q);',
  '  float rim=exp(-(q-1.)*(q-1.)*20.);',
  '  return (.14*rim-.34*bowl)*step(ex,.55)*wc;',
  '}',
  /* kanyon: kontur (level .5) dari noise 3 oktaf = alur panjang berkelok; dibatasi mask noise besar supaya cuma di sebagian wilayah. Oktaf terhalus ikut LOD */
  'float cany(vec2 G,float pv){',
  '  float wl=clamp((pv*uCanyS/1.2*.5-1.2)/1.8,0.,1.);',
  '  if(wl<=0.)return 0.;',
  '  vec2 Gk=G*.3/uCanyS;float f=0.;float a=.5;float fq=1.;',
  '  for(int o=0;o<3;o++){f+=a*vn2(Gk*fq+vec2(23.,61.)+uSeed);fq*=2.;a*=.5;}',
  '  f/=.875;',
  '  float line=1.-smoothstep(0.,.05,abs(f-.5));',
  '  float msk=smoothstep(.40,.65,vn2(G*.09/uCanyS+vec2(5.,77.)+uSeed));',
  '  return -.45*line*msk*wl;',
  '}',
  /* tanah: tekstur lama (bercak + punggungan/kontur ridged), sekarang di bidang tanah berperspektif */
  'float terr(float u,float s){',
  '  vec2 G=vec2(u,uPer)/s*uFx;',
  '  float pv=s*s/(uPer*uFx);',                                  /* periode vertikal 1 sel di layar (px CSS) */
  '  float e=fbmL(G,pv,vec2(7.1,3.7)+uSeed);',
  '  float r=1.-abs(2.*fbmL(G*.7,pv/.7,vec2(11.,5.)+uSeed)-1.);',
  '  float x=e*.78+r*r*.30-.06;',
  '  float h=clamp((x-.42)*2.6+.45,0.,1.);',
  '  if(uCrat>0.||uCany>0.){',
  '    float m=min(uCrat+uCany,1.);',
  '    h=h*(1.-.25*m)+.12*m;',                                     /* sisakan ruang di bawah supaya kawah/kanyon tidak mentok di 0 (tanah gelap) */
  '    if(uCrat>0.){float kc=.6/uCratS;h+=uCrat*crat(G*kc,pv/kc);}',
  '    if(uCany>0.)h+=uCany*cany(G,pv);',
  '    h=clamp(h,0.,1.);',
  '  }',
  '  return h;',
  '}',
  /* AWAN v2. Dulu: value-noise 5 oktaf sejajar sumbu + ambang smoothstep -> gumpalan "kotak" dan lembaran rata waktu Sebaran/Awan digeser tinggi.
     Sekarang: (1) tiap oktaf DIPUTAR + digeser (kisi noise tidak lagi sejajar sumbu), (2) domain warp pelan (bentuk melengkung), (3) skala sumbu mendatar
     lebih panjang (awan memanjang searah horizon seperti stratus, tetap di bidang tanah berperspektif), (4) kepadatan = 1-exp(-k*(n-lo)) bukan smoothstep:
     tidak pernah "mentok" jadi lembaran datar walau Sebaran tinggi, bagian dalam tetap bervariasi, (5) satu oktaf serat halus (cloudDet) yang ikut LOD. */
  'const mat2 CR=mat2(.8,.6,-.6,.8);',
  'float fbmC(vec2 G,float pv,vec2 off){',
  '  float tn=0.;float a=.5;float fq=1.;vec2 p=G+off;',
  '  for(int o=0;o<5;o++){',
  '    float w=clamp((pv/fq-1.2*uLod)/(1.8*uLod),0.,1.);',
  '    tn+=a*mix(.5,vn2(p),w);',
  '    p=CR*p*2.03+vec2(17.3,9.1);fq*=2.03;a*=.5;',
  '  }',
  '  return tn;',
  '}',
  'float cloudAt(float u,float s){',
  '  vec2 G=vec2(u+uT*uCDrift,uPer)/s*uFx;',
  '  float pv=s*s/(uPer*uFx);',
  '  vec2 Gs=G*vec2(.34,.50);float pvs=pv/.50;',
  '  vec2 wp=vec2(vn2(Gs*.7+vec2(5.2,1.3)+uSeed),vn2(Gs*.7+vec2(8.3,2.8)+uSeed))-.5;',
  '  Gs+=wp*(1.1*clamp(pvs*.5,0.,1.));',                         /* warp memudar menuju horizon (anti-berkilau) */
  '  float n=fbmC(Gs,pvs,vec2(3.,9.)+uSeed);',
  '  float lo=1.05-uCloudCov;',                                  /* cov .5 -> lo .55 (batas lama); makin besar makin banyak area terlewati */
  '  float d=max(n-lo,0.);',
  '  float c=(1.-exp(-d*7.))*smoothstep(0.,.05,d);',
  '  float dl=clamp((pvs/6.1-1.2*uLod)/(1.8*uLod),0.,1.);',
  '  float dt=mix(.5,vn2(CR*Gs*6.1+vec2(3.7,8.9)+uSeed),dl);',
  '  c=clamp(c*(1.-uCloudDet*.9+uCloudDet*1.8*dt),0.,1.);',      /* rata-rata pengali = 1: kepadatan keseluruhan tetap */
  '  return uCloudH>0.?c*exp(-s/(uHaze*uCloudH)):c;',
  '}',
  /* titik lampu kota 1 sel (k = sel per satuan G, rad dalam satuan sel, dens 0..1). Mengembalikan (terang, acak 0..1). Pusat dijauhkan dari tepi sel -> tanpa jahitan */
  'vec2 cdot(vec2 Gc,float k,float rad,float dens,float unit,float so){',
  '  vec2 P=Gc*k;vec2 ci=floor(P);',
  '  vec3 rc=texture2D(uNoise,(ci+uSeed+vec2(91.,53.)+so+.5)/256.).xyz;',
  '  vec2 dv=P-(ci+.25+.5*rc.xy);',
  '  float rpx=rad*unit/k;',                                    /* jari-jari titik di layar (px) kalau ikut perspektif murni */
  '  rad*=min(1.,2.4/max(rpx,.01));',                           /* dekat kamera titik tidak boleh jadi piringan besar: batasi ~2.4px (lampu kota = titik kecil) */
  '  float d2=dot(dv,dv)/(rad*rad);',
  '  float ab=clamp(rad*unit/k/.8,0.,1.);',                      /* titik < ~1px di dekat horizon memudar (anti-kilau) */
  '  float on=step(1.-dens,rc.z);',
  '  float I=(exp(-d2*2.2)*.75+(1.-smoothstep(.15,1.,d2))*.5)*on*ab*(.55+.45*fract(rc.z*47.+rc.x*13.));',
  '  return vec2(I,rc.y);',
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
  '  vec2 dn=d/max(len,1e-4);',
  '  vec2 tlv=uLight-vPx;',
  '  float lit=smoothstep(-.35,.85,dot(dn,tlv/max(length(tlv),1.)));',          /* sisi limb yang menghadap cahaya */
  '  float prox=exp(-length(tlv)/(uFall*.5));',                                  /* dekat cahaya (termasuk cahaya tepat di balik limb = backlit) */
  '  float rk=1.+uRimLit*(.55+.95*max(lit*.75,prox)-1.);',
  '  float po=max(pxo,0.);',
  '  float glow=uAtmA*rk*(exp(-po/9.)+uRimHalo*exp(-po/24.)*(1.-smoothstep(14.,28.,po)));',
  '  vec3 gcol=mix(uAtm,uAtm*.6+uWarm*.5,clamp(rk-1.,0.,1.)*.5);',
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
  '    float cl=cloudAt(u,s);',
  '    if(uShd>0.&&uCloud>0.){',                                   /* bayangan awan: awan di arah cahaya menutupi titik ini */
  '      float so=min(unit,70.)*.8;',
  '      float csh=cloudAt(u+tdn.x*so,max(s-tdn.y*so,.6));',
  '      col*=1.-uShd*csh*(1.-cl)*(.4+.6*nl*fall);',
  '    }',
  '    float cb=1.;',
  '    if(cl>.01&&uCloudLit>0.){',                                  /* cahaya sendiri awan: lebih banyak awan ke arah cahaya = terbayang (gelap); tepi yang menghadap cahaya = terang */
  '      float so2=min(unit,60.)*.30;',
  '      float cl2=cloudAt(u+tdn.x*so2,max(s-tdn.y*so2,.6));',
  '      cb=clamp(1.+uCloudLit*(1.6*(cl-cl2)-.35*cl*cl),.25,1.7);',
  '    }',
  '    vec3 ccol=(uAtm*.30+vec3(.05))*(.55+.45*cb)+(uWarm*.80+uAtm*.20)*(nl*fall)*cb*.80;',
  '    col=mix(col,ccol,cl*uCloud*(.55+.45*nl*fall));',
  '    if(uBolt.w>0.){',                                            /* kilat: cahaya elips di bidang tanah, MENYINARI awan (bentuk awan terlihat), bukan lingkaran 2D */
  '      vec2 bq=(vPx-uBolt.xy)/vec2(uBolt.z,uBolt.z*uBoltAsp);',
  '      float bf=uBolt.w*exp(-dot(bq,bq)*1.7);',
  '      col+=vec3(.55,.70,1.)*bf*(.10+1.15*cl*uCloud*(.45+.55*cb));',
  '    }',
  '    if(uCityA>0.){',                                              /* lampu kota v2: 2 lapis titik (rapat kecil + jarang besar), mengikuti "jalan" berkelok, warna bervariasi, pendar ke tanah + dasar awan */
  '      float nt=1.-smoothstep(.10,.50,nl*fall);',
  '      if(nt>.02){',
  '        vec2 Gc=vec2(u,uPer)/s*uFx;',
  '        float pvc=s*s/(uPer*uFx);',
  '        float cm=smoothstep(.50,.66,fbmL(CR*Gc*.30,pvc/.30,vec2(41.,17.)+uSeed));',
  '        if(cm>0.){',
  '          float rdw=clamp((pvc*.55-1.2)/1.8,0.,1.);',
  '          float road=mix(.25,1.-smoothstep(0.,.07,abs(vn2(CR*Gc*.55+vec2(13.,7.)+uSeed)-.5)),rdw);',
  '          vec2 f1=cdot(Gc,7.5,.16,cm*uCityD*(.22+.8*road),unit,0.);',
  '          vec2 f2=cdot(Gc,3.0,.16,cm*uCityD*(.18+.7*road),unit,31.);',
  '          vec2 f3=cdot(Gc,1.1,.15,cm*uCityD*.25*(.4+road),unit,67.);',
  '          vec3 lc1=mix(uWarm,uAtm,.15+.35*f1.y);vec3 lc2=mix(uWarm,uAtm,.10+.30*f2.y);vec3 lc3=mix(uWarm*1.1,vec3(1.),.30);',
  '          float tw=1.-uCityTw*.5*(1.+sin(uT*2.1+f1.y*60.+f2.y*17.));',
  '          vec3 Lc=(lc1*f1.x*.80+lc2*f2.x*1.25+lc3*f3.x*1.6)*tw*uCityA*nt*(1.-cl*uCloud*.85);',
  '          col+=1.-exp(-Lc*1.4);',                                 /* kompresi per kanal: terang berlebih tetap beraksen hangat, bukan piringan putih */
  '          vec3 gcw=mix(uWarm,uAtm,.2)*cm*uCityD*uCityGlow*uCityA*nt;',
  '          col+=gcw*(.05*(.5+.5*road)+.20*cl*uCloud);',
  '        }',
  '      }',
  '    }',
  '    col*=1.-.55*clamp(b0*2.,0.,1.);',                         /* gelap di kaki batu (kontak) */
  '    float hz=exp(-s/uHaze);',                                  /* kabut atmosfer makin tebal ke arah horizon */
  '    col=mix(col,uAtm*.40+vec3(.04),hz*uHazeA);',
  '  }',
  '  float eff=inside*(uFadeS>0.?smoothstep(0.,uFadeS,max(-pxo,0.)):1.);',   /* transparan menuju horizon (fadeS) */
  '  vec3 rgb=col*eff+gcol*glow*(1.-eff);',
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
    uSeed:{value:new T.Vector2(PL3D_CFG.live.sx,PL3D_CFG.live.sy)},uCloud:{value:PL3D_CFG.cloud},uPhi0:{value:1.5707963},uFx:{value:1.4},uPer:{value:PL3D_CFG.persp},uHaze:{value:PL3D_CFG.haze},uLod:{value:PL3D_CFG.lod},uFadeS:{value:PL3D_CFG.fadeS},uCloudCov:{value:PL3D_CFG.cloudCov},uCloudH:{value:PL3D_CFG.cloudH},uHazeA:{value:PL3D_CFG.hazeA},uRock:{value:PL3D_CFG.rockD},uNoise:{value:ntex},
    uT:{value:0},uCDrift:{value:PL3D_CFG.cloudDrift},uShd:{value:PL3D_CFG.cloudShd},uRimLit:{value:PL3D_CFG.rimLit},uRimHalo:{value:PL3D_CFG.rimHalo},uCityA:{value:PL3D_CFG.cityA},uCityD:{value:PL3D_CFG.cityD},uCityTw:{value:PL3D_CFG.cityTw},uCrat:{value:PL3D_CFG.craterA},uCany:{value:PL3D_CFG.canyonA},uCratS:{value:PL3D_CFG.craterS},uCanyS:{value:PL3D_CFG.canyonS},uCloudLit:{value:PL3D_CFG.cloudLit},uCloudDet:{value:PL3D_CFG.cloudDet},uCityGlow:{value:PL3D_CFG.cityGlow},uBolt:{value:new T.Vector4(0,0,1,0)},uBoltAsp:{value:.4}
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
  if(!PL3D.cv3){PL3D.cv3=document.createElement('canvas');PL3D.c3=PL3D.cv3.getContext('2d');}   /* kanvas belakang: pita dirender ke sini, ditukar ke cv2 saat siklus selesai */
  PL3D.cv3.width=rw;PL3D.cv3.height=rh;PL3D.cyc=null;PL3D.full=true;PL3D.bwR=null;   /* ukuran berubah: render penuh sekali jalan dulu */
  PL3D.fb=null;
  if(PL3D.r){PL3D.r.setSize(rw,rh,false);if(PL3D.uni)PL3D.uni.uFall.value=Math.max(PW,PH)*.9*PL3D_CFG.fallK;}
}

/* titik lampu (ruang layar tegak): overview = portal yang sedang mengorbit (P4; kalau di balik limb, lampunya di balik planet jadi cuma pinggir limb yang menyala), sektor = BH mini */
function pl3dLightPos(){
  var p=null;
  try{if(typeof SECT!=='undefined'&&!SECT.cur&&typeof PT3D!=='undefined'&&PT3D.orb&&PT3D.orb.on&&PT3D.ovX!=null)p=[PT3D.ovX,PT3D.ovY];}catch(eL){}
  if(!p)p=camBH();
  return pl3dScr(p[0],p[1]);
}
function pl3dUniforms(now,nobolt){
  pl3dSync();
  var gm=pl3dGeom(false,false,true),U=PL3D.uni,bp=pl3dLightPos();   /* geometri RENDER tanpa ayunan; ayunan = transformasi saat drawImage */
  U.uSize.value.set(PW,gm.stripH);
  U.uC.value.set(gm.cx,PH-gm.cy+gm.bo);                               /* ruang strip: y ke atas, 0 = dasar layar */
  U.uR.value=gm.R;
  U.uFx.value=100/PL3D_CFG.cell;U.uPer.value=PL3D_CFG.persp;U.uRock.value=PL3D_CFG.rockD;U.uFall.value=Math.max(PW,PH)*.9*PL3D_CFG.fallK;
  U.uPhi0.value=Math.atan2(Math.sqrt(Math.max(0,gm.R*gm.R-(PW*.5-gm.cx)*(PW*.5-gm.cx))),PW*.5-gm.cx);   /* arah titik horizon di tengah layar = titik hilang perspektif */
  U.uRot.value=pl3dPhase(now)/gm.R;
  U.uSeed.value.set(PL3D_CFG.live.sx,PL3D_CFG.live.sy);
  U.uHaze.value=PL3D_CFG.haze;U.uHazeA.value=PL3D_CFG.hazeA;U.uCloud.value=PL3D_CFG.cloud;U.uLod.value=PL3D_CFG.lod;U.uFadeS.value=PL3D_CFG.fadeS;U.uCloudCov.value=PL3D_CFG.cloudCov;U.uCloudH.value=PL3D_CFG.cloudH;   /* knob kabut bisa diubah live (console/panel tuning) */
  U.uT.value=now*.001;U.uCDrift.value=PL3D_CFG.cloudDrift;U.uShd.value=PL3D_CFG.cloudShd;U.uRimLit.value=PL3D_CFG.rimLit;U.uRimHalo.value=PL3D_CFG.rimHalo;
  U.uCityA.value=PL3D_CFG.cityA;U.uCityD.value=PL3D_CFG.cityD;U.uCityTw.value=PL3D_CFG.cityTw;U.uCrat.value=PL3D_CFG.craterA;U.uCany.value=PL3D_CFG.canyonA;U.uCratS.value=Math.max(.2,PL3D_CFG.craterS);U.uCanyS.value=Math.max(.2,PL3D_CFG.canyonS);   /* knob dekorasi, bisa diubah live */
  U.uLight.value.set(bp[0],PH-bp[1]+gm.bo);
  U.uCloudLit.value=PL3D_CFG.cloudLit;U.uCloudDet.value=PL3D_CFG.cloudDet;U.uCityGlow.value=PL3D_CFG.cityGlow;
  var bu=PL3D.bu;if(bu&&bu.a>.002&&!nobolt){U.uBolt.value.set(bu.x,PH-bu.y+gm.bo,bu.r,bu.a);U.uBoltAsp.value=bu.asp;}else U.uBolt.value.w=0;   /* kilat aktif: posisi (ruang layar tegak -> strip), jari-jari x, kekuatan; elips tinggi = x asp */
  PL3D.bo=gm.bo;PL3D.rox=gm.ox;PL3D.roy=gm.oy;PL3D.rf=gm.f;   /* parallax/zoom yang baru dirender: selisihnya ke posisi sekarang digeser saat drawImage */
  pl3dPalUpdate();var P=PL3D_CFG.pal;   /* palette hidup (crossfade sektor) */
  U.uLo.value.set(P.lo[0],P.lo[1],P.lo[2]);U.uMid.value.set(P.mid[0],P.mid[1],P.mid[2]);U.uHi.value.set(P.hi[0],P.hi[1],P.hi[2]);
  U.uAtm.value.set(P.atm[0],P.atm[1],P.atm[2]);U.uAtmA.value=P.atmA*PL3D_CFG.atmK;
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

/* ---- RENDER DIPECAH (anti-lonjakan GPU) ----
   Satu refresh strip = `bands` pita horizontal, 1 pita per frame (gl scissor). Uniform + batu dibekukan di awal siklus, jadi semua pita sama waktu/cahaya/palette.
   Hasil ditulis ke kanvas belakang (cv3); setelah pita terakhir, cv2 <-> cv3 ditukar -> yang tampil selalu satu gambar utuh (tanpa sambungan antar pita). */
function pl3dCycleStart(now,lx,ly,nb){
  var pv={x:PL3D.rox,y:PL3D.roy,f:PL3D.rf};   /* parallax yang sedang TAMPIL di cv2 */
  pl3dRocks(pl3dUniforms(now,true));
  PL3D.cyc={t:now,i:0,n:nb,rox:PL3D.rox,roy:PL3D.roy,rf:PL3D.rf};
  PL3D.rox=pv.x;PL3D.roy=pv.y;PL3D.rf=pv.f;   /* offset baru baru berlaku saat tukar buffer */
  PL3D.lastR=now;PL3D.lastLx=lx;PL3D.lastLy=ly;PL3D.dirty=false;
}
function pl3dCycleStep(){
  var c=PL3D.cyc,r=PL3D.r,rw=PL3D.rw,rh=PL3D.rh,n=c.n,k=c.i,y0=Math.round(rh*k/n),y1=Math.round(rh*(k+1)/n),h=y1-y0,t;
  if(h>0){
    PL3D.uni.uBolt.value.w=0;   /* kilau petir TIDAK dibake ke dasar; petir punya jendela sendiri (pl3dBoltWin) */
    r.setScissorTest(true);r.setScissor(0,rh-y1,rw,h);   /* y scissor dari BAWAH */
    r.render(PL3D.sc,PL3D.cam);
    r.setScissorTest(false);
    PL3D.c3.clearRect(0,y0,rw,h);
    PL3D.c3.drawImage(r.domElement,0,y0,rw,h,0,y0,rw,h);
  }
  if(++c.i>=n){
    t=PL3D.cv2;PL3D.cv2=PL3D.cv3;PL3D.cv3=t;t=PL3D.c2;PL3D.c2=PL3D.c3;PL3D.c3=t;
    PL3D.rox=c.rox;PL3D.roy=c.roy;PL3D.rf=c.rf;PL3D.cyc=null;PL3D.renders++;
  }
}
/* PETIR: render ulang cuma kotak kecil di sekitar kilau (shader yang sama, uniform terakhir), ditimpa ke cv2 yang sedang tampil. Kilat berakhir -> kotak yang sama
   dirender sekali lagi tanpa kilau (mengembalikan dasar). Dipanggil SETELAH langkah siklus di frame yang sama, jadi tukar buffer tidak menghapus kilau. */
function pl3dBoltWin(){
  var bu=PL3D.bu,U=PL3D.uni,r=PL3D.r,act=!!(bu&&bu.a>.002),W=PL3D.bwR,q=PL3D_CFG.q,rw=PL3D.rw,rh=PL3D.rh,cy,hx,hy,x0,y0,x1,y1,w,h;
  if(!r||!U||!PL3D.c2||(!act&&!W))return;
  if(act){
    cy=PH-bu.y+(PL3D.bo||0);hx=bu.r*2.2+2;hy=bu.r*bu.asp*2.2+2;   /* exp(-1.7*d^2) < .001 di d = 2.2 */
    x0=(bu.x-hx)*q;x1=(bu.x+hx)*q;y0=(cy-hy)*q;y1=(cy+hy)*q;
    if(W){x0=Math.min(x0,W[0]);y0=Math.min(y0,W[1]);x1=Math.max(x1,W[2]);y1=Math.max(y1,W[3]);}
    PL3D.bwR=[x0,y0,x1,y1];
    U.uBolt.value.set(bu.x,cy,bu.r,bu.a);U.uBoltAsp.value=bu.asp;
  }else{x0=W[0];y0=W[1];x1=W[2];y1=W[3];PL3D.bwR=null;U.uBolt.value.w=0;}
  x0=Math.max(0,Math.floor(x0));y0=Math.max(0,Math.floor(y0));x1=Math.min(rw,Math.ceil(x1));y1=Math.min(rh,Math.ceil(y1));
  w=x1-x0;h=y1-y0;
  if(!(w>0&&h>0))return;
  r.setScissorTest(true);r.setScissor(x0,y0,w,h);
  r.render(PL3D.sc,PL3D.cam);
  r.setScissorTest(false);
  PL3D.c2.clearRect(x0,rh-y1,w,h);
  PL3D.c2.drawImage(r.domElement,x0,rh-y1,w,h,x0,rh-y1,w,h);
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

/* ---- EFEK 2D (F1: kerangka). Semua di ruang layar TEGAK, di dalam save/restore planet3dDraw -> otomatis ikut ROT, ayunan libr, dan PL3D.al.
   Geometri = pl3dGeom(false,false,true), SAMA dgn yang dipakai render shader (ayunan = transform g, bukan di geometri). ---- */
function pl3dLimbY(gm,x){var dx=x-gm.cx,r2=gm.R*gm.R-dx*dx;return gm.cy-Math.sqrt(r2>0?r2:0);}   /* y limb (layar tegak) di kolom x */
function pl3dFxOn(){var C=PL3D_CFG,F=PL3D.fx;return !!(C.auroraOn||C.flareOn||C.debrisOn||C.boltOn||C.fxDebug||(F&&(F.aur>.001||F.flv>.001||(F.deb&&F.deb.length)||F.bolt)));}   /* F.aur>0: aurora masih memudar keluar setelah toggle dimatikan */
/* stub per efek: diisi di fase berikutnya (F2 aurora, F3 flare, F4 puing, F5 petir). F = PL3D.fx (konteks per frame) */
/* AURORA (F2 v2): tirai KONTINU di atas limb, HANYA sisi gelap (memudar mulus ke sisi terang).
   Dulu: quad ~22px per segmen, tiap quad gradient + alpha sendiri -> ada loncatan di tiap sambungan (kelihatan "tempelan").
   Sekarang: dibake ke kanvas offscreen setengah resolusi (kolom 1px offscreen = 2px layar, tinggi + alpha berubah halus antar kolom, tanpa jahitan),
   lalu di-blit 1x per frame dengan upscale bilinear (sekalian melembutkan). Bake cuma ~22x/dtk (aurora gerak pelan); blit tiap frame + kompensasi parallax.
   Lapisan: 0 = kabut lebar tipis (tanpa sinar), 1 = tirai utama (sinar vertikal lembut), 2 = tirai kedua lebih pendek (potato: tanpa lapisan 2).
   Warna dari palette hidup: bawah = atm geser hue +38 (lebih terang), tengah = atm, atas = atm geser hue -32 (lebih gelap). Tepi bawah memudar SEDIKIT ke dalam atmosfer (tidak ada garis keras di limb). */
var PL3D_AUR=[   /* s = sprite (0 kabut, 1 tirai), H = tinggi relatif x Hb, lift = px di atas limb, a = alpha relatif, ry = kekuatan sinar 0..1, k/w/ph + k2/w2/ph2 = dua gelombang tinggi (siklus selebar layar, rad/dtk, fase) */
  {s:0,H:2.1,lift:0,a:.38,ry:0,k:1.3,w:.12,ph:0,k2:2.6,w2:-.10,ph2:1.3},
  {s:1,H:1.1,lift:0,a:1,ry:1,k:2.1,w:.22,ph:.7,k2:3.7,w2:-.15,ph2:1.3},
  {s:1,H:.75,lift:8,a:.55,ry:1,k:3.3,w:-.17,ph:2.1,k2:5.1,w2:.2,ph2:.4}];
function pl3dHue(c,deg){   /* putar hue rgb 0..1 (matriks YIQ standar) */
  var a=deg*Math.PI/180,cs=Math.cos(a),sn=Math.sin(a),r=c[0],g=c[1],b=c[2];
  return [r*(.299+.701*cs+.168*sn)+g*(.587-.587*cs+.330*sn)+b*(.114-.114*cs-.497*sn),
          r*(.299-.299*cs-.328*sn)+g*(.587+.413*cs+.035*sn)+b*(.114-.114*cs+.292*sn),
          r*(.299-.300*cs+1.250*sn)+g*(.587-.588*cs-1.050*sn)+b*(.114+.886*cs-.203*sn)];
}
function pl3dAurSpr(F){   /* 2 sprite gradient vertikal 1x64 (kabut, tirai); atas = v0, limb = v .9, tepi bawah memudar sampai v1. Di-cache selama palette tidak berubah */
  var a=F.pal.atm,key=Math.round(a[0]*255)+','+Math.round(a[1]*255)+','+Math.round(a[2]*255);
  if(F.aurKey===key&&F.aurSp)return F.aurSp;
  function q(c,m){return Math.max(0,Math.min(255,Math.round(c[0]*255*m)))+','+Math.max(0,Math.min(255,Math.round(c[1]*255*m)))+','+Math.max(0,Math.min(255,Math.round(c[2]*255*m)));}
  var cB=pl3dHue(a,38),cT=pl3dHue(a,-32),i,sp=[],cv,cx,gr;
  cB=[cB[0]*.75+.25,cB[1]*.75+.25,cB[2]*.75+.25];   /* bawah dicampur putih 25%: pita terang di horizon */
  var D=[   /* [v, warna, alpha] per sprite */
    [[0,a,0],[.3,a,.08],[.6,a,.3],[.85,a,.6],[.9,a,.6],[1,a,0]],
    [[0,cT,0],[.22,cT,.16],[.5,a,.5],[.74,cB,.85],[.9,cB,.8],[1,cB,0]]];
  for(i=0;i<2;i++){
    cv=document.createElement('canvas');cv.width=1;cv.height=64;cx=cv.getContext('2d');
    gr=cx.createLinearGradient(0,0,0,64);
    D[i].forEach(function(st){gr.addColorStop(st[0],'rgba('+q(st[1],st[1]===cT?.85:1)+','+st[2]+')');});
    cx.fillStyle=gr;cx.fillRect(0,0,1,64);sp.push(cv);
  }
  F.aurKey=key;F.aurSp=sp;return sp;
}
function pl3dAurEnv(x,lx){var t=(Math.abs(x-lx)/PW-.08)/.6;t=t<0?0:(t>1?1:t);return t*t*(3-2*t);}   /* 0 di dekat cahaya, 1 di sisi gelap (transisi lebar = tidak ada batas tegas) */
var PL3D_AUR_SC=.5;   /* skala kanvas offscreen terhadap layar */
function pl3dAurBake(F,A){
  var gm=F.gm,SC=PL3D_AUR_SC,W=F.aurCv.width,Hh=F.aurCv.height,c=F.aurCx,sp=pl3dAurSpr(F),pot=F.pot,st=pot?4:2,N=Math.ceil(PW/st),
      nL=pot?2:3,Hb=Math.min(150,.15*Math.max(PW,PH)),t=F.t*.001,TP=6.2832/PW,lx=F.lx,cw=st*SC,yMin=1e9,yMax=-1e9,
      rk1=6.2832/30,rk2=6.2832/17,i,j,x,L,m,ray,a1,b1,al,h,yb,env,mm,lay,R;
  c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,W,Hh);c.globalCompositeOperation='lighter';c.globalAlpha=1;
  for(i=0;i<nL;i++){
    lay=PL3D_AUR[i];
    for(j=0;j<N;j++){
      x=(j+.5)*st;env=pl3dAurEnv(x,lx);if(env<.01)continue;
      a1=lay.k*TP*x+lay.w*t+lay.ph;b1=lay.k2*TP*x+lay.w2*t+lay.ph2;
      m=.5+.5*(.62*Math.sin(a1)+.38*Math.sin(b1));                     /* tinggi tirai berombak (halus, periode panjang) */
      ray=.5+.5*(.6*Math.sin(x*rk1+t*.35+lay.ph*3)+.4*Math.sin(x*rk2-t*.5+lay.ph2*2));   /* sinar vertikal lembut (periode >=17px, > 4 kolom: tidak aliasing) */
      mm=.65+.35*Math.sin(a1*1.7+b1+1.7);
      al=A*lay.a*env*mm*((1-lay.ry*.65)+lay.ry*.65*ray);
      if(al<.012)continue;
      h=Hb*lay.H*(.3+.7*m)*((1-lay.ry*.25)+lay.ry*.35*ray);
      yb=pl3dLimbY(gm,x)-lay.lift;
      c.globalAlpha=al>1?1:al;
      c.drawImage(sp[lay.s],0,0,1,64,j*cw,(yb-h)*SC,cw,h*1.111*SC);   /* sprite menutup [limb-h .. limb+.11h]: tepi bawah memudar ke atmosfer */
      if(yb-h<yMin)yMin=yb-h;if(yb+h*.111>yMax)yMax=yb+h*.111;
    }
  }
  c.globalAlpha=1;
  F.aurB0=Math.max(0,Math.floor(yMin*SC)-1);F.aurB1=Math.min(Hh,Math.ceil(yMax*SC)+1);
  if(!(F.aurB1>F.aurB0)){F.aurB0=0;F.aurB1=0;}
  F.aurG={cx:gm.cx,cy:gm.cy,R:gm.R};F.aurR=F.t;
}
function pl3dFxAurora(g,F){
  var C=PL3D_CFG,P=F.pal,gm=F.gm,ba=g.globalAlpha,SC=PL3D_AUR_SC;
  F.aur=Math.max(0,Math.min(1,F.aur+(C.auroraOn?1:-1)*F.dt/.6));   /* fade-in/out 0.6 dtk (diterapkan saat blit, bukan saat bake) */
  if(F.aur<=.001){F.aur=0;return;}
  var A=Math.min(.5,P.atmA*C.atmK*2.2);   /* kecerahan ikut slider Atmosfer */
  if(A<.01)return;
  var W=Math.max(2,Math.ceil(PW*SC)),Hh=Math.max(2,Math.ceil(PH*SC));
  if(!F.aurCv||F.aurCv.width!==W||F.aurCv.height!==Hh){
    F.aurCv=document.createElement('canvas');F.aurCv.width=W;F.aurCv.height=Hh;F.aurCx=F.aurCv.getContext('2d');F.aurG=null;
  }
  if(!F.aurCx)return;
  var afps=F.pot?12:22;
  if(!F.aurG||Math.abs(gm.R-F.aurG.R)>.5||F.t-F.aurR>=1000/afps)pl3dAurBake(F,A);
  if(F.aurB1<=F.aurB0)return;
  var dx=gm.cx-F.aurG.cx,dy=gm.cy-F.aurG.cy;   /* parallax murni = geser: aurora tetap menempel di limb walau bake lebih jarang dari frame */
  g.globalAlpha=ba*F.aur;
  g.imageSmoothingEnabled=true;
  g.drawImage(F.aurCv,0,F.aurB0,W,F.aurB1-F.aurB0,dx,F.aurB0/SC+dy,W/SC,(F.aurB1-F.aurB0)/SC);
  g.globalAlpha=ba;
}
/* PUING (F4 v2): TANPA ekor (versi pertama terlihat seperti kecebong). Dua jenis benda, sama-sama cuma titik/garis kecil yang berkedip:
   k=0 SATELIT: titik kecil stabil + lampu strobo (nyala singkat, pendar kecil, jeda panjang), kedip sekitar .35-.75 Hz.
   k=1 SERPIHAN: potongan pendek 2.5-5px berputar pelan; hampir tak terlihat, lalu 'glint' terang saat permukaannya menghadap cahaya (kedip tidak teratur).
   Maks 4 sekaligus (potato 2), lahir tiap rata-rata 7 dtk / evK (acak +-40%, jeda min 1.5 dtk). Masuk dari kiri/kanan layar, 10-70px di atas limb (y = limbY(x) - tinggi, mengikuti lengkung limb), 12-40 px/dtk.
   Fade .5 dtk di awal/akhir, umur maks 40 dtk. Digambar SETELAH planet + aurora -> melintas di depan BH mini. Toggle off: yang ada memudar .5 dtk (F.dbv). */
function pl3dFxDebris(g,F){
  var C=PL3D_CFG,gm=F.gm,pool=F.deb||(F.deb=[]),mx=F.pot?2:4,dt=F.dt,ba=g.globalAlpha,lc=F.lc,i,p,x,y,a,fo,rem,cs,w,d,ph,pu,th,gl,hl;
  F.dbv=Math.max(0,Math.min(1,(F.dbv||0)+(C.debrisOn?1:-1)*dt/.5));
  if(C.debrisOn){
    if(F.debNext==null)F.debNext=F.t+800+Math.random()*1800;   /* baru dinyalakan: yang pertama muncul sebentar lagi */
    if(F.t>=F.debNext){
      if(pool.length<mx){
        d=Math.random()<.5?1:-1;
        pool.push({d:d,k:Math.random()<.45?0:1,x:d>0?-12:PW+12,h:10+Math.random()*60,v:12+Math.random()*28,sz:1+Math.random()*.8,len:2.5+Math.random()*2.5,
          bf:.35+Math.random()*.4,gf:.7+Math.random()*1.3,rw:(Math.random()<.5?-1:1)*(.8+Math.random()*1.6),gp:Math.random()*6.2832,al:.45+Math.random()*.45,w:.3+Math.random()*.6,age:0});
        F.debNext=F.t+Math.max(1500,7000/Math.max(.2,C.evK||1)*(.6+.8*Math.random())*(F.pot?1.5:1));
      }else F.debNext=F.t+1500;   /* pool penuh: coba lagi nanti */
    }
  }else F.debNext=null;
  if(F.dbv<=.001&&!C.debrisOn){pool.length=0;return;}
  for(i=pool.length-1;i>=0;i--){
    p=pool[i];p.age+=dt;p.x+=p.d*p.v*dt;
    rem=p.d>0?(PW+12-p.x)/p.v:(p.x+12)/p.v;   /* detik sampai keluar sisi seberang */
    if(rem<=0||p.age>40){pool.splice(i,1);continue;}
    fo=Math.min(1,p.age/.5,rem/.5,(40-p.age)/.5)*F.dbv;
    x=p.x;y=pl3dLimbY(gm,x)-p.h;w=p.w;
    cs=Math.round((lc[0]*(1-w)+w)*255)+','+Math.round((lc[1]*(1-w)+w)*255)+','+Math.round((lc[2]*(1-w)+w)*255);
    g.globalAlpha=ba;
    if(p.k===0){   /* satelit: titik redup + strobo */
      ph=(F.t*.001*p.bf+p.gp)%1;if(ph<0)ph+=1;
      pu=ph<.14?Math.sin(3.1416*ph/.14):0;                   /* 0..1 hanya di 14% awal siklus */
      a=p.al*fo*(.32+.68*pu);if(a<.015)continue;
      g.fillStyle='rgba('+cs+','+a+')';g.beginPath();g.arc(x,y,p.sz*.62,0,6.2832);g.fill();
      if(pu>.05){g.fillStyle='rgba('+cs+','+(p.al*fo*pu*.28)+')';g.beginPath();g.arc(x,y,p.sz*3,0,6.2832);g.fill();}
    }else{          /* serpihan: garis pendek berputar, terang cuma saat glint */
      th=p.gp+p.rw*p.age;
      gl=Math.sin(F.t*.001*p.gf*2.1+p.gp*1.7)*.5+.5;gl=gl*gl*gl*gl;   /* glint jarang: pangkat 4 */
      a=p.al*fo*(.12+.88*gl);if(a<.015)continue;
      hl=p.len*.5*(.45+.55*Math.abs(Math.cos(th*.7)));        /* panjang tampak berubah (berputar 3D) */
      g.strokeStyle='rgba('+cs+','+a+')';g.lineWidth=p.sz*.85;
      g.beginPath();g.moveTo(x-Math.cos(th)*hl,y-Math.sin(th)*hl);g.lineTo(x+Math.cos(th)*hl,y+Math.sin(th)*hl);g.stroke();
      if(gl>.45){g.fillStyle='rgba('+cs+','+(p.al*fo*gl*.22)+')';g.beginPath();g.arc(x,y,p.sz*2.6,0,6.2832);g.fill();}
    }
  }
  g.globalAlpha=ba;
}
/* FLARE (F3): kilau saat cahaya (portal overview / BH mini sektor) lewat limb. DETERMINISTIK (fungsi posisi cahaya terhadap limb), tanpa acak.
   d = ly - limbY(lx): + = cahaya sudah di bawah limb. Puncak di d = -.6 x Lr (portal overview tertahan 'gap' di atas limb, tidak pernah menyentuhnya),
   memudar sampai |d + .6Lr| = 2.2 x Lr. Tiga bagian: kilau inti di titik limb di bawah cahaya, goresan tipis sepanjang tangen limb, 2 ghost di garis cahaya -> pusat layar.
   Warna = lightCol (ghost ke-2 = atm palette). Fade pelan saat cahaya melompat (datang dari sektor) dan saat toggle (F.flv). */
function pl3dFxFlare(g,F){
  var C=PL3D_CFG,gm=F.gm,lx=F.lx,ly=F.ly,Lr=28,lc=F.lc,dm,u,f,ef,xl,yl,dx,ang,v,ba=g.globalAlpha,gr,r,i,t,px,py,at=F.pal.atm;
  dm=(ly-pl3dLimbY(gm,lx))+Lr*.6;u=Math.abs(dm)/(2.2*Lr);f=u>=1?0:1-u*u*(3-2*u);
  ef=lx<0?-lx:(lx>PW?lx-PW:0);f*=ef>=70?0:1-ef/70;   /* cahaya di luar layar: kilau ikut memudar, bukan menempel di tepi */
  f*=C.flareOn?1:0;
  F.flv+=(f-F.flv)*Math.min(1,F.dt*(f>F.flv?9:5));   /* naik cepat, turun sedikit lebih pelan */
  v=F.flv;if(v<.012){F.flv=v<.004?0:v;return;}
  function rgb(c,a,w){w=w||0;return 'rgba('+Math.round((c[0]*(1-w)+w)*255)+','+Math.round((c[1]*(1-w)+w)*255)+','+Math.round((c[2]*(1-w)+w)*255)+','+a+')';}
  xl=Math.max(-40,Math.min(PW+40,lx));yl=pl3dLimbY(gm,xl);dx=xl-gm.cx;ang=Math.atan(dx/Math.sqrt(Math.max(1,gm.R*gm.R-dx*dx)));   /* ang = kemiringan tangen limb di xl */
  /* 1. kilau inti */
  r=40+30*v;gr=g.createRadialGradient(xl,yl,0,xl,yl,r);
  gr.addColorStop(0,rgb(lc,.5*v,.45));gr.addColorStop(.3,rgb(lc,.24*v));gr.addColorStop(1,rgb(lc,0));
  g.globalAlpha=ba;g.fillStyle=gr;g.fillRect(xl-r,yl-r,r*2,r*2);
  /* 2. goresan sepanjang limb: lingkaran gradient dipipihkan (ry sekitar 2.5px) lalu diputar mengikuti tangen */
  r=120*(.55+.45*v);
  g.save();g.translate(xl,yl);g.rotate(ang);g.scale(1,.022);
  gr=g.createRadialGradient(0,0,0,0,0,r);
  gr.addColorStop(0,rgb(lc,.7*v,.6));gr.addColorStop(.35,rgb(lc,.3*v));gr.addColorStop(1,rgb(lc,0));
  g.fillStyle=gr;g.fillRect(-r,-r,r*2,r*2);
  g.restore();
  /* 3. ghost: lingkaran kecil di garis cahaya -> pusat layar */
  if(v>.06){
    for(i=0;i<2;i++){
      t=i?.6:.35;px=lx+(PW*.5-lx)*t;py=ly+(PH*.5-ly)*t;r=i?7:12;
      gr=g.createRadialGradient(px,py,0,px,py,r);
      gr.addColorStop(0,rgb(i?at:lc,.16*v));gr.addColorStop(.6,rgb(i?at:lc,.08*v));gr.addColorStop(1,rgb(i?at:lc,0));
      g.fillStyle=gr;g.fillRect(px-r,py-r,r*2,r*2);
    }
  }
  g.globalAlpha=ba;
}
/* PETIR (F5): kilat singkat di sisi GELAP planet, di lapisan awan dekat limb. Default MATI (boltOn:false). Tanpa dependensi ke modul portal (algoritma jalur disalin dari ptBoltPath).
   Syarat lahir: awan aktif (PL3D_CFG.cloud > .05), x di sisi gelap (|x - lightX| > .3 PW). Maks 1 aktif; rata-rata tiap 9 dtk / evK (acak +-40%, jeda min 1.5 dtk; potato x2, jalur lebih sederhana, tanpa cabang).
   Posisi: 14-60px DI BAWAH limb, turun 10-28px x boltK (v2: dikecilkan; v1 25-70px terlalu besar). Digambar DI ATAS awan (awan ada di bitmap shader); ujung atas petir memudar supaya terkesan keluar dari awan. Animasi total sekitar 280 ms: jalur tumbuh 40ms, kilau radial 0-90ms (alpha .26, dipotong ke bola planet + 14px atmosfer), jeda 60ms, kilat kedua 150-240ms (alpha .15);
   garis inti putih .8px + glow 2px (alpha .22) tahan 70ms lalu memudar 120ms. Kecerahan ikut slider Awan. Shader awan tidak terbaca CPU -> petir TIDAK tahu persis di mana awan; dibatasi sisi gelap + band dekat limb.
   Hook suara (nanti): kalau ada fungsi global pl3dOnBolt(x01, y01) dia dipanggil tiap petir lahir (x01 = posisi x 0..1 lebar layar). */
function pl3dBoltPath(x0,y0,x1,y1,amp,lvl,out){
  if(lvl<=0){out.push(x1,y1);return;}
  var mx=(x0+x1)/2,my=(y0+y1)/2,dx=x1-x0,dy=y1-y0,l=Math.sqrt(dx*dx+dy*dy)||1,o=(Math.random()-.5)*2*amp;
  mx+=-dy/l*o;my+=dx/l*o;
  pl3dBoltPath(x0,y0,mx,my,amp*.55,lvl-1,out);pl3dBoltPath(mx,my,x1,y1,amp*.55,lvl-1,out);
}
function pl3dBoltStroke(g,P,n,w,col,al){   /* n titik pertama dari P (array datar x,y) sebagai satu polyline */
  var i;if(n<2||al<.01)return;
  g.globalAlpha=al;g.strokeStyle=col;g.lineWidth=w;g.lineJoin='round';g.beginPath();g.moveTo(P[0],P[1]);
  for(i=1;i<n;i++)g.lineTo(P[2*i],P[2*i+1]);
  g.stroke();
}
/* PETIR v2 (anti-tempelan): ukuran + tebal + jari-jari kilau ikut kedalaman (s0 = px di bawah limb: dekat limb = jauh = kecil), kilau = ELIPS di bidang tanah
   (tinggi = lebar x s/persp), kabut atmosfer menipiskan petir yang dekat limb, glow bertint atmosfer + inti putih. Mode 3D: kilau digambar SHADER (uBolt) sehingga
   yang menyala adalah awan itu sendiri (bentuk awan kelihatan sesaat), render dipaksa tiap frame selama kilat (~0.3 dtk). Fallback 2D: elips gradien. */
function pl3dFxBolt(g,F){
  var C=PL3D_CFG,gm=F.gm,B=F.bolt,ba=g.globalAlpha,BK,k,x,cand,lm,s0,ps,y0,L,x1,P,Bp,m,kk,bx,by,bl,a2,t,n1,n2,fa,la,cf,u,np,gr,gr2,r,at=F.pal.atm,cs,m2,asp,hzf,hz=Math.max(1,C.haze||95),
      sh=!!(PL3D.state===2&&PL3D.r),bu=PL3D.bu,pw;
  if(!B&&C.boltOn){
    if(F.boltNext==null)F.boltNext=F.t+1500+Math.random()*3000;   /* baru dinyalakan: yang pertama beberapa detik lagi */
    if(F.t>=F.boltNext){
      F.boltNext=F.t+Math.max(1500,9000/Math.max(.2,C.evK||1)*(.6+.8*Math.random())*(F.pot?2:1));
      if(C.cloud>.05){
        x=-1;
        for(k=0;k<6;k++){cand=PW*(.06+.88*Math.random());if(Math.abs(cand-F.lx)>PW*.3){x=cand;break;}}   /* sisi gelap saja */
        if(x>=0){
          BK=Math.max(.2,C.boltK||1);
          lm=pl3dLimbY(gm,x);s0=14+Math.random()*46;y0=lm+s0;
          ps=Math.max(.45,Math.min(1.6,s0/38));                                   /* skala perspektif (rata-rata ~1 seperti dulu) */
          L=(10+Math.random()*18)*BK*ps;x1=x+(Math.random()-.5)*L*.5;
          asp=Math.max(.14,Math.min(.7,(s0+L)/Math.max(40,C.persp||120)));        /* lingkaran di tanah -> elips setipis s/persp */
          hzf=1-Math.min(1,C.hazeA||0)*Math.exp(-s0/hz);                          /* kabut horizon menipiskan petir yang jauh */
          P=[x,y0];pl3dBoltPath(x,y0,x1,y0+L,L*.2,F.pot?2:3,P);
          Bp=null;kk=0;
          if(!F.pot&&Math.random()<.5){   /* 0-1 cabang dari titik acak di jalur utama */
            m=P.length/2;kk=1+((Math.random()*(m-2))|0);bx=P[2*kk];by=P[2*kk+1];bl=L*(.3+.25*Math.random());a2=(Math.random()<.5?-1:1)*(.4+Math.random()*.5);
            Bp=[bx,by];pl3dBoltPath(bx,by,bx+Math.sin(a2)*bl,by+Math.cos(a2)*bl,bl*.2,2,Bp);
          }
          B=F.bolt={t:0,P:P,Bp:Bp,kk:kk,k:BK,ps:ps,asp:asp,hzf:hzf,y0:y0,L:L,cx:(x+x1)*.5,fy:y0+L*.85,r:(26+Math.random()*26)*BK*ps*1.3};
          try{if(typeof pl3dOnBolt==='function')pl3dOnBolt(x/PW,(y0+L*.5)/PH);}catch(eB){}   /* hook suara (nanti) */
        }
      }
    }
  }else if(!B&&!C.boltOn)F.boltNext=null;
  if(!B){if(bu&&bu.a>0)bu.a=0;return;}   /* jendela petir (pl3dBoltWin) yang memulihkan dasar */
  B.t+=F.dt*1000;t=B.t;
  if(t>=280){F.bolt=null;if(bu&&bu.a>0)bu.a=0;return;}
  n1=t<90?(t<20?t/20:1-(t-20)/70):0;                                  /* kilau 1: 0..1 */
  n2=(t>=150&&t<240)?((t-150)<20?(t-150)/20:1-(t-170)/70):0;          /* kilau 2 */
  fa=n1*.26+n2*.15;
  la=t<70?1:(t<190?1-(t-70)/120:0);if(n2*.5>la)la=n2*.5;              /* garis: tahan 70ms, fade 120ms, muncul redup lagi di kilat kedua */
  cf=Math.min(1,C.cloud/.4);cf=.45+.55*cf;                            /* kecerahan ikut slider Awan */
  hzf=B.hzf;
  cs=Math.round((at[0]*.55+.45)*255)+','+Math.round((at[1]*.55+.45)*255)+','+Math.round((at[2]*.55+.45)*255);
  if(fa*cf>.004){
    if(sh){                                                            /* 3D: shader menyalakan awan; render ulang tiap frame selama kilau */
      bu=PL3D.bu||(PL3D.bu={x:0,y:0,r:1,a:0,asp:.4});
      bu.x=B.cx;bu.y=B.fy;bu.r=B.r;bu.asp=B.asp;bu.a=fa*cf*hzf*4;   /* render ulang cuma kotak kecil di sekitar kilau (pl3dBoltWin), bukan seluruh strip */
    }else if(fa*cf>.01){                                               /* fallback 2D: elips gradien di bidang tanah, dipotong ke bola planet (+14px atmosfer) */
      g.save();g.beginPath();g.arc(gm.cx,gm.cy,gm.R+14,0,6.2832);g.clip();
      r=B.r;g.translate(B.cx,B.fy);g.scale(1,B.asp);
      gr=g.createRadialGradient(0,0,0,0,0,r);
      gr.addColorStop(0,'rgba('+cs+','+(fa*cf*hzf)+')');gr.addColorStop(.45,'rgba('+cs+','+(fa*cf*hzf*.35)+')');gr.addColorStop(1,'rgba('+cs+',0)');
      g.globalAlpha=ba;g.fillStyle=gr;g.fillRect(-r,-r,r*2,r*2);
      g.restore();
    }
  }else if(bu&&bu.a>0)bu.a=0;
  if(la>.01){
    u=Math.min(1,t/40);np=Math.max(2,Math.ceil(u*B.P.length/2));      /* jalur tumbuh 40ms */
    pw=Math.pow(B.ps,.6);                                              /* tebal garis ikut kedalaman (lebih halus dari ukuran, supaya yang jauh tidak hilang) */
    gr=g.createLinearGradient(0,B.y0,0,B.y0+B.L);   /* inti putih; ujung atas memudar: kesannya keluar dari dalam awan, bukan tertempel di depannya */
    gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.5,'rgba(255,255,255,1)');gr.addColorStop(1,'rgba(255,255,255,1)');
    gr2=g.createLinearGradient(0,B.y0,0,B.y0+B.L);  /* glow bertint atmosfer (bukan putih murni) */
    gr2.addColorStop(0,'rgba('+cs+',0)');gr2.addColorStop(.5,'rgba('+cs+',1)');gr2.addColorStop(1,'rgba('+cs+',1)');
    pl3dBoltStroke(g,B.P,np,5*Math.min(1.5,B.k)*pw,gr2,ba*.07*la*cf*hzf);
    pl3dBoltStroke(g,B.P,np,2*Math.min(1.5,B.k)*pw,gr2,ba*.22*la*cf*hzf);
    pl3dBoltStroke(g,B.P,np,.8*Math.min(1.5,B.k)*pw,gr,ba*.85*la*cf*hzf);
    if(B.Bp&&u>=B.kk/(B.P.length/2-1)){                                 /* cabang mulai setelah jalur utama sampai titik asalnya */
      m2=Math.min(1,(t-40*B.kk/(B.P.length/2-1))/30);np=Math.max(2,Math.ceil(m2*B.Bp.length/2));
      pl3dBoltStroke(g,B.Bp,np,1.4*Math.min(1.5,B.k)*pw,gr2,ba*.16*la*cf*hzf);
      pl3dBoltStroke(g,B.Bp,np,.6*Math.min(1.5,B.k)*pw,gr,ba*.6*la*cf*hzf);
    }
    g.globalAlpha=ba;
  }
}

function pl3dFx(g,now,cp){
  var C=PL3D_CFG,F=PL3D.fx;
  if(!F)F=PL3D.fx={t:now,dt:0,gm:null,lx:0,ly:0,pal:null,lc:C.lightCol,pot:false,frames:0,aur:0,flv:0};
  F.dt=Math.min(.05,Math.max(0,(now-F.t)/1000));F.t=now;   /* detik sejak frame efek sebelumnya (klem 50ms) */
  var gm=pl3dGeom(false,false,true),lp=pl3dLightPos();
  F.gm=gm;F.lx=lp[0];F.ly=lp[1];F.cp=cp;F.lc=C.lightCol;F.pot=(typeof IS_POTATO!=='undefined'&&IS_POTATO);
  pl3dPalUpdate();F.pal=C.pal;
  F.frames++;PL3D.fxFrames=F.frames;                       /* penanda hook jalan (cek di console: PL3D.fxFrames naik) */
  g.save();
  g.globalCompositeOperation='lighter';                    /* semua glow additive */
  if(C.auroraOn||F.aur>.001)pl3dFxAurora(g,F);
  if(C.debrisOn||(F.deb&&F.deb.length))pl3dFxDebris(g,F);
  if(C.flareOn||F.flv>.001)pl3dFxFlare(g,F);
  if(C.boltOn||F.bolt)pl3dFxBolt(g,F);
  g.restore();
  if(C.fxDebug){                                           /* verifikasi geometri: limb harus menempel di tepi planet yang terlihat */
    var x,y,y0;
    g.save();g.strokeStyle='rgba(255,60,200,.9)';g.lineWidth=1;g.beginPath();
    for(x=0;x<=PW;x+=24){y=pl3dLimbY(gm,x);if(x)g.lineTo(x,y);else g.moveTo(x,y);}
    g.stroke();
    g.fillStyle='rgba(255,255,0,.95)';g.fillRect(F.lx-2,F.ly-2,4,4);        /* posisi cahaya */
    y0=pl3dLimbY(gm,F.lx);g.fillRect(F.lx-2,y0-2,4,4);                      /* titik limb tepat di bawah/atas cahaya */
    g.restore();
  }
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
      /* render periodik (fps) CUMA kalau permukaan memang berputar (rot x rotK != 0). Kalau diam, render hanya karena: dirty, cahaya bergeser,
         palette/parallax berubah, atau sekali lagi saat palette selesai settle (sisa selisih di bawah ambang palCh). */
      var rotMov=Math.abs(PL3D_CFG.live.rot*PL3D_CFG.rotK)>1e-6;
      var animOn=(PL3D_CFG.cloud>0&&PL3D_CFG.cloudDrift!==0)||(PL3D_CFG.cityA>0&&PL3D_CFG.cityTw>0);   /* awan hanyut / lampu kedip: render periodik di fps (4/dtk); matikan keduanya = render on-demand lagi (hemat baterai) */
      var lMv=Math.abs(lx-PL3D.lastLx)+Math.abs(ly-PL3D.lastLy);
      var settle=!!PL3D.wasCh&&!palCh;PL3D.wasCh=palCh;
      var due=PL3D.dirty||(!still&&(rotMov||animOn)&&now-PL3D.lastR>=1000/PL3D_CFG.fps)||(lMv>(rotMov?40:.5)&&now-PL3D.lastR>=(rotMov?30:1000/PL3D_CFG.fps))||settle||((palCh||parCh)&&now-PL3D.lastR>=1000/PL3D_CFG.palFps);
      var nb=Math.max(1,Math.min(8,PL3D_CFG.bands|0));
      if(PL3D.cyc&&settle)PL3D.dirty=true;   /* "settle" cuma sekali: jangan hilang selagi siklus jalan */
      if(PL3D.cyc){   /* siklus pecah sedang jalan: 1 pita per frame */
        if(now-PL3D.cyc.t>600){PL3D.cyc=null;PL3D.dirty=true;}   /* basi (render ditahan lama oleh menu/tab) */
        else pl3dCycleStep();
      }else if(due){
        if(nb<=1||PL3D.full||!PL3D.chk||!PL3D.cv3){   /* render penuh sekali jalan: pertama kali, ukuran berubah, atau bands=1 */
          pl3dRocks(pl3dUniforms(now,true));
          PL3D.r.setScissorTest(false);
          PL3D.r.render(PL3D.sc,PL3D.cam);
          if(!PL3D.chk){   /* sekali: piksel dasar-tengah harus terisi (di dalam bola). Program yang tidak jalan tapi lolos diagnostics -> fallback 2D */
            PL3D.chk=1;
            var gl=PL3D.r.getContext(),px=new Uint8Array(4);
            gl.readPixels(PL3D.rw>>1,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);
            if(px[3]<200){pl3dFail('render kosong (alpha '+px[3]+')');return;}
          }
          PL3D.c2.clearRect(0,0,PL3D.rw,PL3D.rh);
          PL3D.c2.drawImage(PL3D.r.domElement,0,0,PL3D.rw,PL3D.rh);
          PL3D.lastR=now;PL3D.lastLx=lx;PL3D.lastLy=ly;PL3D.dirty=false;PL3D.full=false;PL3D.cyc=null;PL3D.renders++;
        }else{pl3dCycleStart(now,lx,ly,nb);pl3dCycleStep();}
      }
      pl3dBoltWin();   /* petir: render parsial kotak kecil, di atas hasil siklus frame ini */
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
    if(!PL3D.fxOff&&!(typeof reduce!=='undefined'&&reduce)&&pl3dFxOn()){   /* efek 2D: error di sini TIDAK boleh mematikan planet 3D (pl3dFail) */
      try{pl3dFx(g,now,cp);}catch(eFx){PL3D.fxOff=1;try{console.warn('[planet3d] efek 2D dimatikan:',eFx&&eFx.message);}catch(eW){}}
    }
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
  return limb-r+r*(sink==null?PL3D_CFG.bhSink*PL3D_CFG.sinkK:sink);
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
