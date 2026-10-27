'use strict';
/* 15-portal3d.js — Portal (rombak BH -> portal, fase F2 di rencana-portal.md). Jalur tunggal (flag PORTAL_ON sudah dihapus di F5).
   Pola sama dengan 12/13/14: Three.js r128 dimuat LAZY (three.min.js yang sama), satu WebGL renderer offscreen kecil merender SATU cincin portal, hasilnya di-drawImage ke canvas 2D.
   Gagal apa pun (potato, reduce motion, perf-tier-0, WebGL mati / context lost / three.js nggak termuat) -> cincin 2D sederhana, tanpa error.
   Isi:
     - Cincin 3D: 12 plat segmen logam gelap (tipis, sudut miring + takik), jejak sirkuit cyan EMISSIVE simetris dari tekstur procedural polar, tepi dalam lilac, tengah transparan.
     - Mulut wormhole IDLE di tengah cincin (2D, dipasang di bawah cincin): gradien gelap + 3 lengan spiral pelan. Potato / reduce motion = statis. Tidak menyentuh state 09-wormhole.js, muffle tetap 0.
       (Rencana awal: mode WORMHOLE.idle di 09. Dipilih terpisah di sini karena 09 punya state/mask/kanvas sendiri untuk hold & swallow; idle statis murah ini tidak perlu ikut ke sana.)
     - Visualizer: 12 plat <-> 12 pita (AVB.v) = intensitas emissive; warna cincin DIKUNCI ke tema scope3d (PT3D_CFG.ringCol), tidak ikut AV_COLOR (tema BGM/SFX). Debu + pulse elips visualizer BH lama DIGANTI kilatan petir di dalam cincin (ptBolts): onset pita musik memicu petir yang tumbuh dari tengah portal ke tepi cincin di sudut pita itu (sudut = posisi plat); tiap sambaran memercik di cincin. Tanpa musik cuma kilat redup jarang. Reduce motion = tanpa petir. Spike = petir bercabang + kilat mulut.
   Penempatan: overview = dipanggil dari drawHole (03-gargantua.js) di anchor BH (menggantikan gambar BH). Di dalam sektor TIDAK ada portal lagi (F10-F11, rencana-drone-sektor.md): menu sektor dibuka dari tombol HUD #mode-bh, pusat interlock = drone (08-tx-drone.js). Yang tersisa dari sisi sektor cuma ptSecR() (ukuran R mulut wormhole keluar sektor).
   Rombak F6 (mulut idle + charge + dive): (1) mulut wormhole IDLE di dalam cincin = terowongan warp mini (ptt*, buffer feedback 80px, ~30 fps) — tidak ada lagi mulut yang tumbuh di luar cincin saat hold / pindah sektor;
     (2) tekan & tahan: 12 plat menyala SATU PER SATU searah jarum jam (WORMHOLE.charge() 0..1), tiap plat memicu petir + percikan, full charge = ledakan petir + petir terus-menerus keliling cincin;
     (3) saat lompat, 09-wormhole.js memegang cincin (WORMHOLE.ringOwned) dan memanggil portal3dDraw(...,{noMouth:true,ch:1}) di kanvasnya sendiri: cincin membesar (zoom-in) dengan terowongan di dalamnya.
   Matikan 3D saja: ?portal3d=0 atau localStorage dumul_portal3d=0 (cincin 2D tetap tampil). */
var PT3D_CFG={
  on:true,
  lib:(typeof AST3D_CFG!=='undefined'&&AST3D_CFG.lib)||'dumul-js/obs/lib/three.min.js?v=1',   /* path + ?v= harus sama dgn SHELL service-worker */
  ovK:2,        /* cadangan: radius luar cincin overview = ovK x horizon BH (BH.Rr), dipakai kalau ptOvK() tidak bisa menghitung */
  ovMenu:.5,    /* ukuran portal overview = ovMenu x ukuran cincin di window menu sektor (16-sector-menu.js, smenuRingD). .5 = setengahnya */
  secK:0.50,       /* dasar ukuran R mulut wormhole keluar sektor (ptSecR) = secK x BH.R x .62 */
  half:1.5,       /* setengah lebar kamera ortho (satuan model; radius luar cincin = 1) */
  resMin:128,resMax:384,
  ringCol:'53,243,255',    /* warna cincin (emissive 12 plat + garis cahaya + tepi mulut + denyut petunjuk), DIKUNCI tema scope3d (cyan #35f3ff, 13-scope3d.js); tidak ikut warna SFX */
  inR:.86,          /* radius tepi dalam plat (radius luar = 1). Makin besar = cincin makin tipis. Mulut/petir/percikan pakai PT_IN (= inR-.015); 09-wormhole.js ikut PT_IN */
  ringAcc:'160,120,255',   /* aksen tepi dalam cincin (lilac, dari hemisphere violet 0x7a5cd8 + rim magenta di scope3d/drone3d) */
  plateCol:0x161c23,       /* warna dasar plat gunmetal (hull scope 0x44505c / 0x2b333c, tapi di sini tanpa envMap jadi dibuat gelap) */
  mouthStars:35,    /* streak bintang tajam di mulut idle (0 = mati); versi mini dari N_STARS di 09-wormhole.js */
  glow:1.3,         /* pengali terang garis sirkuit emissive */
  boltMax:9,       /* petir bersamaan (potato: 1) */
  boltCd:17,        /* jeda minimum per pita (ms), potato 90 */
  boltCap:6,        /* maks petir baru per frame dari onset pita (potato 1) */
  onFlux:.09,       /* ambang lonjakan mentah per pita buat memicu petir (makin kecil = makin sensitif; fallback tanpa analyser pakai .14) */
  spikeK:6.3,       /* spike = flux total > rata-rata x spikeK (+.05). Naikkan kalau spike terlalu sering, turunkan kalau jarang */
  boltW:.4,         /* ketebalan petir (tetap, tidak ikut kekuatan beat); .4 = setara petir idle */
  boltCol:'255,255,255',   /* warna petir + kilau tepi + kilat mulut + inti percikan (tetap putih, tidak ikut warna SFX) */
  sparkCol:'255,214,140',  /* warna ekor percikan api/listrik di titik sambaran */
  sparkMax:90,      /* percikan bersamaan (potato 14) */
  spikeBr:[3,5],    /* jumlah cabang utama saat spike (min,max); tiap cabang bisa punya sub-cabang */
  idleMin:220,idleMax:560,   /* jeda kilat redup saat tanpa musik (ms) */
  /* P4: kemiringan cincin overview, mengikuti gambar referensi (cincin dilihat 3/4: elips agak tegak, miring ke kanan). Radian. Urutan rotasi: yaw (y) -> pitch (x) -> roll (z, di bidang layar).
     y = seberapa 'menyamping' (0 = hadap penuh; .9 = elips lebar ~62%). x = condong ke atas/bawah. z = roll (negatif = puncak cincin condong ke kanan). Window menu sektor + wormhole TIDAK memakai ini (datar). */
  tilt:{x:.1745,y:.8727,z:-.1745},   /* = 10 / 50 / -10 derajat (kelipatan 5 supaya kena snap slider panel tuning; dulu .2 / .9 / -.22) */
  spin:.0873,      /* = 5 derajat/dtk (dulu .08) */ /* kecepatan putar plat di bidang cincin, rad/dtk (.05 = ±2 menit/putaran, .2 = ±31 dtk, .6 = ±10 dtk). Berlaku di semua cincin (overview, menu sektor, wormhole); 0 = diam */
  tiltOv:1,       /* 0..1 pengali kemiringan di overview (0 = datar seperti dulu) */
  /* P4: orbit portal overview = orbit biasa (elips penuh, tanpa terbit/tenggelam): sumbu panjang sejajar kemiringan horizon planet (17-planet3d.js), pusat di home BH.
     Selama di-drag, orbit berhenti (portal ikut jari) lalu springback seperti dulu. reduce motion = portal diam di home. */
  orb:{on:true,
    ax:.30,        /* setengah sumbu panjang terhadap lebar layar (dijepit supaya cincin tetap di dalam layar) */
    ay:.09,        /* setengah sumbu pendek terhadap tinggi layar (kecil = elips pipih menyusuri horizon) */
    per:90,        /* detik per satu putaran orbit (dulu 26). Pelan: gaya orbit drone di atmosfer (08-tx-drone.js) tapi jauh lebih lambat */
    depth:.05,     /* cincin sedikit lebih besar di sisi dekat (bawah elips) dan lebih kecil di sisi jauh (atas), +-sekian x radius. 0 = ukuran tetap */
    bob:1.5,         /* naik-turun ringan (px CSS), seperti drone. 0 = mati */
    counter:1,     /* 1 = arah orbit MELAWAN rotasi permukaan planet (PL3D_CFG.live.rot), 0 = selalu searah jarum jam */
    bet:1,         /* pengali kemiringan sumbu terhadap tangen limb (1 = sejajar horizon; >1 lebih curam) */
    gap:.5,       /* jarak minimum titik terendah orbit ke limb, x radius cincin (pusat orbit digeser naik kalau perlu) */
    near:1        /* 0..1 seberapa jauh pusat orbit DITURUNKAN ke arah limb (x ruang kosong antara titik terendah orbit dan limb). 0 = pusat tetap di home BH (tengah layar, portal tidak pernah dekat planet, flare tidak muncul); 1 = titik terendah orbit tepat di jarak 'gap' dari limb (menyusuri horizon, flare tiap putaran) */
  }
};
try{
  if(/[?&]portal3d=0(&|$)/.test(location.search)||localStorage.getItem('dumul_portal3d')==='0')PT3D_CFG.on=false;
}catch(ePT0){}
var PT_IN=PT3D_CFG.inR-.015;   /* rasio radius mulut terhadap Rp (dulu hard-code .745); dipakai juga 09-wormhole.js */
var PT3D={state:0,/* 0 belum, 1 memuat, 2 siap, 3 gagal/nonaktif */r:null,sc:null,cam:null,grp:null,mats:[],glow:[],tex:null,res:0,err:'',lastCol:'',cr:.21,cg:.95,cb:1,xr:.63,xg:.47,xb:1,lv:[],lastNow:-1,bolts:[],nb:0,lastBolt:0,nextIdle:0,prevBeat:0,mn:null,cf:null,fl:null,lastBT:0,lastBS:0,lastTk:0,rim:0,spkT:-1e9,pt:null,df:null,avgF:0,lastHit:0,lastSpk:0,sparks:[],cl:[],cOn:[],cFull:0,cTt:0,cB:0,cS:0,rz:0,big:0,tilt:null,lastTilt:-1,ovX:null,ovY:null,ovHid:0,orb:null,orbPhi:null,orbLast:0,orbInSect:0};

function pt3dFail(why){PT3D.state=3;PT3D.err=String(why||'');try{console.warn('[portal3d] fallback ke cincin 2D:',PT3D.err);}catch(e){}}
function pt3dLoad(){
  if(PT3D.state!==0)return;
  if(!PT3D_CFG.on){PT3D.state=3;PT3D.err='off';return;}
  PT3D.state=1;
  var go=function(){try{pt3dBuild();}catch(e){pt3dFail(e&&e.message||e);}};
  if(typeof THREE!=='undefined'&&THREE.REVISION){go();return;}
  var src=PT3D_CFG.lib,has=false,ss=document.getElementsByTagName('script'),i;
  for(i=0;i<ss.length;i++){if((ss[i].getAttribute('src')||'')===src){has=true;break;}}
  if(!has){
    var s=document.createElement('script');
    s.src=src;s.async=true;s.onerror=function(){pt3dFail('gagal muat '+src);};
    document.head.appendChild(s);
  }
  var tries=0,iv=setInterval(function(){
    if(typeof THREE!=='undefined'&&THREE.REVISION){clearInterval(iv);go();}
    else if(++tries>80){clearInterval(iv);pt3dFail('timeout menunggu three.js');}
  },150);
}

/* sirkuit procedural (deterministik): garis siku + bantalan, putih di atas hitam -> dipakai sebagai emissiveMap */
function pt3dCircuitTex(T){
  /* Kanvas = citra atas-bawah cincin: 1 satuan model = S/2 px, pusat di tengah kanvas (repeat .5 + offset .5 mengubah UV koordinat model jadi 0..1).
     Jejak sirkuit digambar dalam koordinat polar (lajur sepanjang busur + cabang radial), disimetriskan terhadap tengah tiap plat seperti di gambar referensi. */
  var S=1024,c=document.createElement('canvas');c.width=c.height=S;var x=c.getContext('2d'),H=S/2,PI2=6.2832;
  x.fillStyle='#000';x.fillRect(0,0,S,S);
  var seed=1337,rnd=function(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  x.lineCap='round';x.lineJoin='round';
  var inR=PT3D_CFG.inR,w=1-inR,lanes=[inR+w*.2,inR+w*.4,inR+w*.6,inR+w*.8],N=12,gap=.075,pw=PI2/N-gap;
  function px(r,a){return H+Math.cos(a)*r*H;}
  function py(r,a){return H-Math.sin(a)*r*H;}
  function arc(r,a0,a1){x.beginPath();x.arc(H,H,r*H,-a1,-a0,false);x.stroke();}
  function stub(r0,r1,a){x.beginPath();x.moveTo(px(r0,a),py(r0,a));x.lineTo(px(r1,a),py(r1,a));x.stroke();}
  function dot(r,a,rad){x.beginPath();x.arc(px(r,a),py(r,a),rad,0,PI2);x.fill();}
  var i,j,k,am,off,l0,l1,ln,len,aa,ab,sg;
  x.fillStyle='#fff';
  for(i=0;i<N;i++){
    am=i*PI2/N+PI2/N/2;   /* tengah plat */
    for(k=0;k<3;k++){     /* 3 jejak per plat; tiap jejak dicerminkan ke sisi lain plat */
      off=pw*.06+rnd()*pw*.3;l0=Math.floor(rnd()*4);aa=off;
      x.strokeStyle='rgba(255,255,255,'+(.6+rnd()*.4).toFixed(2)+')';x.lineWidth=k===0?5:3.2;
      for(j=0;j<2+Math.floor(rnd()*3);j++){
        len=pw*(.06+rnd()*.16);ab=Math.min(pw*.47,aa+len);
        for(sg=-1;sg<=1;sg+=2){arc(lanes[l0],am+sg*aa,am+sg*ab);}   /* kiri + kanan tengah plat */
        aa=ab;
        l1=Math.max(0,Math.min(3,l0+(rnd()<.5?-1:1)*(1+Math.floor(rnd()*2))));
        if(l1!==l0){for(sg=-1;sg<=1;sg+=2)stub(lanes[l0],lanes[l1],am+sg*aa);}
        l0=l1;if(aa>=pw*.47)break;
      }
      for(sg=-1;sg<=1;sg+=2)dot(lanes[l0],am+sg*aa,k===0?6:4.5);
    }
    /* garis tengah plat (poros simetri) */
    x.strokeStyle='rgba(255,255,255,.55)';x.lineWidth=3.2;stub(lanes[0],lanes[3],am);dot(lanes[1],am,4.5);
  }
  var t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(.5,.5);t.offset.set(.5,.5);t.anisotropy=4;t.encoding=T.sRGBEncoding;
  return t;
}
function pt3dSeg(T,a0,a1,r0,r1){
  /* plat busur dengan sudut miring dan takik kecil di tengah tepi luar (mirip plat di gambar referensi) */
  var s=new T.Shape(),co=Math.cos,si=Math.sin,w=r1-r0,ch=w*.24,nd=w*.25,am=(a0+a1)/2,hw=.035,ci=ch/r0,co2=ch/r1;
  function P(r,a){return [co(a)*r,si(a)*r];}
  var p=P(r0,a0+ci);s.moveTo(p[0],p[1]);
  s.absarc(0,0,r0,a0+ci,a1-ci,false);
  p=P(r0+ch,a1);s.lineTo(p[0],p[1]);
  p=P(r1-ch,a1);s.lineTo(p[0],p[1]);
  p=P(r1,a1-co2);s.lineTo(p[0],p[1]);
  s.absarc(0,0,r1,a1-co2,am+hw,true);
  p=P(r1-nd,am+hw*.8);s.lineTo(p[0],p[1]);
  s.absarc(0,0,r1-nd,am+hw*.8,am-hw*.8,true);
  p=P(r1,am-hw);s.lineTo(p[0],p[1]);
  s.absarc(0,0,r1,am-hw,a0+co2,true);
  p=P(r1-ch,a0);s.lineTo(p[0],p[1]);
  p=P(r0+ch,a0);s.lineTo(p[0],p[1]);
  s.closePath();
  var g=new T.ExtrudeGeometry(s,{depth:.16,bevelEnabled:true,bevelThickness:.018,bevelSize:.012,bevelSegments:1,curveSegments:12});
  g.translate(0,0,-.08);return g;
}
function pt3dBuild(){
  var T=THREE,cv=document.createElement('canvas'),PI=Math.PI;
  var r=new T.WebGLRenderer({canvas:cv,alpha:true,antialias:true,premultipliedAlpha:true,powerPreference:'low-power',preserveDrawingBuffer:false});
  r.setClearColor(0x000000,0);r.outputEncoding=T.sRGBEncoding;r.toneMapping=T.ACESFilmicToneMapping;r.toneMappingExposure=1.05;
  cv.addEventListener('webglcontextlost',function(e){e.preventDefault();pt3dFail('webglcontextlost');},false);
  PT3D.r=r;
  var sc=new T.Scene(),H=PT3D_CFG.half,cam=new T.OrthographicCamera(-H,H,H,-H,-20,20);
  cam.position.set(0,0,10);cam.lookAt(0,0,0);PT3D.sc=sc;PT3D.cam=cam;
  var tex=pt3dCircuitTex(T);PT3D.tex=tex;
  var tg=new T.Group();tg.rotation.order='ZXY';sc.add(tg);PT3D.tilt=tg;   /* P4: kemiringan = yaw -> pitch -> roll (ZXY = Rz*Rx*Ry); grp di dalamnya cuma berputar di bidang cincin */
  var grp=new T.Group();tg.add(grp);PT3D.grp=grp;
  var N=12,gap=.075,i,a0,a1,m,mesh,IR=PT3D_CFG.inR;
  for(i=0;i<N;i++){
    a0=i*2*PI/N+gap/2;a1=(i+1)*2*PI/N-gap/2;
    m=new T.MeshStandardMaterial({color:PT3D_CFG.plateCol,metalness:.75,roughness:.45,emissive:new T.Color(0x35f3ff),emissiveMap:tex,emissiveIntensity:.8});   /* hex r128 tidak dikonversi ke linear: logam 'gelap' harus gelap */
    mesh=new T.Mesh(pt3dSeg(T,a0,a1,PT3D_CFG.inR+.012,1-.012),m);grp.add(mesh);PT3D.mats.push(m);
  }
  /* garis cahaya tipis: tepi dalam = aksen lilac (ringAcc), tepi luar = cyan ringCol (additive) */
  var gm1=new T.MeshBasicMaterial({color:0x9c7cff,transparent:true,opacity:.75,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false,side:T.DoubleSide});
  var gm2=new T.MeshBasicMaterial({color:0x35f3ff,transparent:true,opacity:.28,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false,side:T.DoubleSide});
  var g1=new T.Mesh(new T.RingGeometry(IR-.026,IR-.004,160),gm1);g1.position.z=.11;grp.add(g1);
  var g2=new T.Mesh(new T.RingGeometry(1.0,1.02,160),gm2);g2.position.z=.0;grp.add(g2);
  PT3D.glow=[gm1,gm2];
  var key=new T.DirectionalLight(0xffc88c,.7);key.position.set(.6,.9,1.4);sc.add(key);
  var rim=new T.DirectionalLight(0xff4fd8,.85);rim.position.set(-1.2,-.7,.8);sc.add(rim);
  sc.add(new T.HemisphereLight(0x7a5cd8,0x0a0614,.35));
  var fill=new T.DirectionalLight(0x40e8ff,.5);fill.position.set(-.8,.5,1);sc.add(fill);
  /* pra-ukur ke resolusi overview (setSize pertama = realokasi framebuffer MSAA yang mahal) */
  try{
    var res0=pt3dRes(Math.max(40,(typeof BH!=='undefined'?BH.R:26)*ptOvK()));
    PT3D.res=res0;r.setPixelRatio(1);r.setSize(res0,res0,false);
  }catch(eP){}
  PT3D.state=2;
  if(typeof threeWarm==='function')threeWarm(r,sc,cam);
}
/* Pengali radius cincin overview terhadap BH.R: dihitung supaya radius luar portal overview (ukuran slider 1x) = ovMenu x radius cincin menu sektor.
   Menu ada di ruang layar asli (CSS px), overview di ruang virtual #stage (skala STG.k di tablet/desktop; HP landscape k=1), jadi dibagi k.
   BHSC / BHZ / ukuran slider teleskop tetap ikut karena mereka mengalikan R di portal3dOverview, bukan masuk ke K ini. */
function ptOvK(){
  try{
    var d=(typeof smenuRingD==='function')?smenuRingD():0,b=BH.R,k=(typeof STG!=='undefined'&&STG.on&&STG.k)?STG.k:1;
    if(d>0&&b>1)return PT3D_CFG.ovMenu*d*.5/k/b;
  }catch(e){}
  return PT3D_CFG.ovK;
}
function pt3dRes(Rp){var S=2*PT3D_CFG.half*Rp;return Math.max(PT3D_CFG.resMin,Math.min(PT3D_CFG.resMax,Math.ceil(S*Math.min(1.5,DPR||1)/32)*32));}

/* ---------- warna cincin: dikunci PT3D_CFG.ringCol ('r,g,b'), TIDAK ikut AV_COLOR / tema SFX ---------- */
function ptCol(){
  var c=PT3D_CFG.ringCol||'53,243,255',ac=PT3D_CFG.ringAcc||c,key=c+'|'+ac;
  if(key!==PT3D.lastCol){PT3D.lastCol=key;var p=c.split(','),q=ac.split(',');PT3D.cr=(+p[0])/255;PT3D.cg=(+p[1])/255;PT3D.cb=(+p[2])/255;PT3D.xr=(+q[0])/255;PT3D.xg=(+q[1])/255;PT3D.xb=(+q[2])/255;}
  return c;
}
/* intensitas per plat (warna tetap, hanya terangnya yang ikut musik): musik (AVB.v) kalau ada yang main, kalau tidak napas pelan bergeser antar plat */
function ptLevels(now,playing){
  var lv=PT3D.lv,i,k,n=0,v=null,a,b,s,e;
  if(playing&&typeof AVB!=='undefined'&&AVB.v&&AVB.n>0){n=AVB.n;v=AVB.v;}
  for(i=0;i<12;i++){
    if(v){a=Math.floor(i*n/12);b=Math.max(a+1,Math.floor((i+1)*n/12));s=0;for(k=a;k<b&&k<n;k++)s+=v[k]||0;e=Math.min(1,s/(b-a));}
    else e=.5+.5*Math.sin(now*.0011-i*.52);
    lv[i]=(lv[i]===undefined)?e:lv[i]+(e-lv[i])*.35;
  }
  return lv;
}
function ptPlaying(){return !!(typeof AV_ON!=='undefined'&&AV_ON&&typeof activeSfx!=='undefined'&&activeSfx&&!activeSfx.paused&&!activeSfx.ended);}

/* P4: sudut kemiringan [pitch,yaw,roll] + goyangan kecil (potato/reduce tanpa goyang). tk = 0..1 */
function ptTiltAng(now,tk){
  var T=PT3D_CFG.tilt,t=now*.001,w=(typeof reduce!=='undefined'&&reduce)?0:1;
  return [tk*(T.x+w*.015*Math.sin(t*.43)),tk*(T.y+w*.02*Math.sin(t*.31+1)),tk*T.z];
}
/* matriks affine 2D (a,b,c,d untuk g.transform) yang sama dengan proyeksi ortografis kemiringan 3D di atas, supaya mulut/petir/percikan (digambar 2D di bidang cincin) ikut miring. Sudah dicek sama dengan THREE.Euler 'ZXY'. */
function ptTiltMat(an){
  var cx=Math.cos(an[0]),sx=Math.sin(an[0]),cy=Math.cos(an[1]),sy=Math.sin(an[1]),cz=Math.cos(an[2]),sz=Math.sin(an[2]);
  var exx=cy*cz-sy*sx*sz,exy=cy*sz+sy*sx*cz,eyx=-cx*sz,eyy=cx*cz;
  return [exx,-exy,-eyx,eyy];   /* y three ke atas, y kanvas ke bawah */
}
function pt3dRender(now,Rp,playing,tk){
  var T=THREE,r=PT3D.r,res=pt3dRes(Rp);
  if(PT3D.big&&res<PT3D_CFG.resMax)res=PT3D_CFG.resMax;   /* sudah pernah charge / dive: tetap resolusi penuh (zoom-in nggak buram, nggak realokasi di tengah animasi) */
  if(res!==PT3D.res){PT3D.res=res;r.setPixelRatio(1);r.setSize(res,res,false);}
  ptCol();
  var lv=ptLevels(now,playing),i,m,t=now*.001;
  for(i=0;i<12;i++){
    var cc=PT3D.cl[i]||0,fk=PT3D.cFull?.5+.5*Math.sin(now*.03+i*1.7):0;   /* cc = muatan plat (menyala satu-satu saat hold); full charge = berkedip */
    m=PT3D.mats[i];m.emissive.setRGB(PT3D.cr+(1-PT3D.cr)*cc*.45,PT3D.cg+(1-PT3D.cg)*cc*.3,PT3D.cb);
    m.emissiveIntensity=(.4+(playing?.7:.3)*lv[i]+cc*(1.1+.5*fk))*PT3D_CFG.glow;   /* terlalu tinggi = ACES memutihkan cyan */
  }
  PT3D.glow[0].color.setRGB(PT3D.xr,PT3D.xg,PT3D.xb);PT3D.glow[1].color.setRGB(PT3D.cr,PT3D.cg,PT3D.cb);
  var still=(typeof reduce!=='undefined'&&reduce);
  PT3D.rz=still?0:t*(PT3D_CFG.spin||0);   /* rz = sudut putar yang sama dgn grp.rotation.z (dipakai kilau muatan + petir) */
  tk=tk||0;
  if(PT3D.tilt){var an=ptTiltAng(now,tk);PT3D.tilt.rotation.set(an[0],an[1],an[2]);}
  PT3D.grp.rotation.x=(tk>0||still)?0:.06*Math.sin(t*.5);PT3D.grp.rotation.y=(tk>0||still)?0:.08*Math.sin(t*.37+1);   /* goyangan dikecilkan: cincin tampak bulat (kalau miring, goyangannya sudah ada di ptTiltAng) */
  PT3D.grp.rotation.z=PT3D.rz;
  r.render(PT3D.sc,PT3D.cam);
}
function pt3dUsable(){
  if(PT3D.state===0){pt3dLoad();return false;}
  if(PT3D.state!==2)return false;
  if(!PT3D_CFG.on||(typeof IS_POTATO!=='undefined'&&IS_POTATO)||(typeof reduce!=='undefined'&&reduce))return false;
  if(document.body&&document.body.classList.contains('perf-tier-0'))return false;
  return true;
}

/* ---------- gambar 2D: mulut idle + cincin ---------- */
function ptMouth(g,Rin,now,animate){
  var c=ptCol(),still=!animate,k,j,th,rr,x,y;
  g.save();g.beginPath();g.arc(0,0,Rin,0,6.2832);g.clip();
  var gr=g.createRadialGradient(0,0,0,0,0,Rin);
  gr.addColorStop(0,'rgba(0,0,0,.98)');gr.addColorStop(.55,'rgba(2,8,16,.92)');gr.addColorStop(1,'rgba('+c+',.30)');
  g.fillStyle=gr;g.fillRect(-Rin,-Rin,Rin*2,Rin*2);
  g.lineCap='round';
  for(k=0;k<3;k++){
    th=(still?0:now*.0007)+k*2.0944;
    g.strokeStyle='rgba('+c+','+(.20-k*.04)+')';g.lineWidth=Math.max(1,Rin*.07);
    g.beginPath();
    for(j=0;j<=22;j++){
      rr=Rin*j/22;x=Math.cos(th+rr/Rin*3.3)*rr;y=Math.sin(th+rr/Rin*3.3)*rr;
      if(j)g.lineTo(x,y);else g.moveTo(x,y);
    }
    g.stroke();
  }
  /* titik terang di pusat (leher wormhole) */
  var cg=g.createRadialGradient(0,0,0,0,0,Rin*.28);
  cg.addColorStop(0,'rgba(0,0,0,1)');cg.addColorStop(1,'rgba(0,0,0,0)');
  g.fillStyle=cg;g.fillRect(-Rin*.3,-Rin*.3,Rin*.6,Rin*.6);
  g.restore();
}
function ptRing2D(g,Rp,now,playing){   /* cadangan tanpa WebGL: 12 busur gelap + garis cyan */
  var c=ptCol(),lv=ptLevels(now,playing),i,a0,a1,N=12,gp=.075;
  g.lineCap='butt';
  for(i=0;i<N;i++){
    a0=i*6.2832/N+gp/2;a1=(i+1)*6.2832/N-gp/2;
    g.strokeStyle='#222a33';g.lineWidth=Rp*(1-PT3D_CFG.inR);g.beginPath();g.arc(0,0,Rp*(1+PT3D_CFG.inR)/2,a0,a1);g.stroke();
    g.strokeStyle='rgba('+c+','+Math.min(1,.35+.55*lv[i]+.6*(PT3D.cl[i]||0))+')';g.lineWidth=Math.max(1,Rp*.025);g.beginPath();g.arc(0,0,Rp*(PT3D_CFG.inR+(1-PT3D_CFG.inR)*.45),a0,a1);g.stroke();
  }
  g.strokeStyle='rgba('+(PT3D_CFG.ringAcc||c)+',.7)';g.lineWidth=Math.max(1,Rp*.02);g.beginPath();g.arc(0,0,Rp*(PT3D_CFG.inR-.012),0,6.2832);g.stroke();
}

/* ---------- mulut wormhole IDLE di dalam cincin: terowongan warp mini (feedback zoom+putar, sama gaya dengan 09-wormhole.js tapi buffer 80px) ---------- */
var PTT={ok:0,fail:0,N:80,A:null,B:null,gA:null,gB:null,spr:null,last:0,acc:0},PTT_PAL=[[70,95,255],[150,65,240],[255,75,175],[255,125,70],[90,190,255],[175,205,255],[255,255,255]];
function pttInit(){
  try{
    var N=PTT.N,mk=function(){var c=document.createElement('canvas');c.width=c.height=N;return c;},S=24,sp=document.createElement('canvas'),x,i,gr,col;
    PTT.A=mk();PTT.B=mk();PTT.gA=PTT.A.getContext('2d');PTT.gB=PTT.B.getContext('2d');
    sp.width=S;sp.height=S*PTT_PAL.length;x=sp.getContext('2d');
    for(i=0;i<PTT_PAL.length;i++){
      col=PTT_PAL[i];gr=x.createRadialGradient(S/2,i*S+S/2,0,S/2,i*S+S/2,S/2);
      gr.addColorStop(0,'rgba('+col+',1)');gr.addColorStop(.3,'rgba('+col+',.5)');gr.addColorStop(1,'rgba('+col+',0)');
      x.fillStyle=gr;x.fillRect(0,i*S,S,S);
    }
    PTT.spr=sp;
    PTT.gA.fillStyle='#02050d';PTT.gA.fillRect(0,0,N,N);PTT.gB.fillStyle='#02050d';PTT.gB.fillRect(0,0,N,N);
    PTT.ok=1;
    for(i=0;i<26;i++)pttStep(.04);   /* isi awal: langsung "penuh" */
  }catch(e){PTT.ok=0;PTT.fail=1;}
}
function pttStep(dt){
  var N=PTT.N,c=N/2,sc=Math.exp(1.7*dt),rot=.22*dt,co=Math.cos(rot)*sc,si=Math.sin(rot)*sc,g2=PTT.gB,i,n,ang,rr,d,ci,t;
  g2.globalCompositeOperation='source-over';g2.globalAlpha=1;g2.setTransform(1,0,0,1,0,0);
  g2.fillStyle='#02050d';g2.fillRect(0,0,N,N);
  g2.setTransform(co,si,-si,co,c-(co*c-si*c),c-(si*c+co*c));
  g2.globalAlpha=Math.pow(.95,dt*60);g2.drawImage(PTT.A,0,0);
  g2.setTransform(1,0,0,1,0,0);g2.globalCompositeOperation='lighter';
  n=Math.max(2,Math.round(dt*420));   /* debu halus dekat lubang -> memanjang jadi streak radial oleh zoom */
  for(i=0;i<n;i++){
    ang=Math.random()*6.2832;ci=Math.random()<.25?5+((Math.random()*2)|0):(((ang/6.2832*5+Math.random()*1.5)|0)%5);
    rr=N*(.06+.06*Math.random());d=2+Math.random()*3;g2.globalAlpha=.5*(.4+.6*Math.random());
    g2.drawImage(PTT.spr,0,ci*24,24,24,c+Math.cos(ang)*rr-d/2,c+Math.sin(ang)*rr-d/2,d,d);
  }
  n=Math.max(1,Math.round(dt*40));   /* blob warna dinding */
  for(i=0;i<n;i++){
    ang=Math.random()*6.2832;ci=((ang/6.2832*5+Math.random()*1.2)|0)%5;
    rr=N*(.08+.07*Math.random());d=N*(.12+.1*Math.random());g2.globalAlpha=.10;
    g2.drawImage(PTT.spr,0,ci*24,24,24,c+Math.cos(ang)*rr-d/2,c+Math.sin(ang)*rr-d/2,d,d);
  }
  g2.globalAlpha=1;g2.globalCompositeOperation='source-over';
  t=PTT.A;PTT.A=PTT.B;PTT.B=t;t=PTT.gA;PTT.gA=PTT.gB;PTT.gB=t;
}
/* streak bintang tajam di mulut idle: melesat dari tengah ke tepi (makin dekat tepi makin cepat dan makin panjang ekornya), ikut berputar pelan seperti terowongannya */
var PTT_STAR=[[255,255,255],[175,205,255],[150,125,255],[255,125,205],[255,175,95],[95,225,255],[255,238,170]];
function ptStarNew(init){return{th:Math.random()*6.2832,p:init?Math.random():0,v:.28+Math.random()*.5,ci:Math.random()<.65?(Math.random()<.5?0:1):((Math.random()*7)|0),L:(Math.random()*3)|0,al:.55+.45*Math.random()};}
function pttStars(g,Rin,dt){
  var n=PT3D_CFG.mouthStars|0;if(n<=0)return;
  var A=PTT.st,i,s,rh,rt,pt,ca,sa,a,w,col,hx,hy;
  if(!A||A.length!==n){A=PTT.st=[];for(i=0;i<n;i++)A.push(ptStarNew(true));}
  g.save();g.globalCompositeOperation='lighter';g.lineCap='round';
  for(i=0;i<n;i++){
    s=A[i];s.p+=s.v*dt*(1+s.p*1.6);s.th+=.22*dt;
    if(s.p>=1){A[i]=s=ptStarNew(false);}
    a=Math.min(1,s.p*3)*(s.p>.85?1-(s.p-.85)/.15*.5:1)*s.al;
    if(a<.03)continue;
    rh=Rin*(.2+.85*Math.pow(s.p,1.7));pt=Math.max(0,s.p-.08-.14*s.p);rt=Rin*(.2+.85*Math.pow(pt,1.7));
    ca=Math.cos(s.th);sa=Math.sin(s.th);col=PTT_STAR[s.ci];w=Math.max(.5,Math.min(1.6,.5+Rin*.01*s.L));
    g.strokeStyle='rgba('+col+','+(a*.55).toFixed(3)+')';g.lineWidth=w;
    g.beginPath();g.moveTo(ca*rt,sa*rt);g.lineTo(ca*rh,sa*rh);g.stroke();
    if(s.L>0){   /* ujung kepala lebih terang */
      hx=ca*(rt+(rh-rt)*.6);hy=sa*(rt+(rh-rt)*.6);
      g.strokeStyle='rgba('+col+','+a.toFixed(3)+')';g.lineWidth=w*1.2;g.beginPath();g.moveTo(hx,hy);g.lineTo(ca*rh,sa*rh);g.stroke();
      if(s.L>1){g.strokeStyle='rgba(255,255,255,'+(a*.9).toFixed(3)+')';g.lineWidth=w*.6;g.stroke();}
    }
  }
  g.restore();
}
/* g sudah di-translate ke pusat portal; Rin = radius mulut (px). true = tergambar */
function pttDraw(g,Rin,now){
  if(!PTT.ok&&!PTT.fail)pttInit();
  if(!PTT.ok)return false;
  var dt=PTT.last?Math.min(.08,(now-PTT.last)/1000):.03,gr,hr=Rin*.16;
  PTT.last=now;PTT.acc+=dt;
  if(PTT.acc>=.032){pttStep(Math.min(.06,PTT.acc));PTT.acc=0;}   /* ~30 fps cukup buat mulut kecil */
  g.save();g.beginPath();g.arc(0,0,Rin,0,6.2832);g.clip();
  g.fillStyle='#02050d';g.fillRect(-Rin,-Rin,Rin*2,Rin*2);
  g.imageSmoothingEnabled=true;g.drawImage(PTT.A,-Rin,-Rin,Rin*2,Rin*2);
  pttStars(g,Rin,dt);   /* streak bintang tajam di atas dinding, di bawah lubang hitam + bayangan tepi */
  gr=g.createRadialGradient(0,0,hr*.6,0,0,hr*1.7);gr.addColorStop(0,'rgba(0,0,0,.98)');gr.addColorStop(1,'rgba(0,0,0,0)');
  g.fillStyle=gr;g.beginPath();g.arc(0,0,hr*1.7,0,6.2832);g.fill();   /* lubang hitam di tengah */
  gr=g.createRadialGradient(0,0,Rin*.62,0,0,Rin);gr.addColorStop(0,'rgba(2,8,16,0)');gr.addColorStop(1,'rgba(2,8,16,.7)');
  g.fillStyle=gr;g.fillRect(-Rin,-Rin,Rin*2,Rin*2);   /* bayangan tepi: menyatu dengan cincin */
  g.restore();
  return true;
}

/* ---------- charge: 12 plat menyala SATU PER SATU saat tekan & tahan (WORMHOLE.charge() 0..1) ---------- */
var PT_ORD=[3,2,1,0,11,10,9,8,7,6,5,4],PT_SWELL=.3;   /* urutan plat searah jarum jam mulai dari atas; PT_SWELL = cincin sedikit membengkak saat charge penuh */
function ptWhCharge(){try{return(typeof WORMHOLE!=='undefined'&&WORMHOLE.charge)?WORMHOLE.charge():0;}catch(e){return 0;}}
function ptChargeHit(i,now,ch){   /* plat i baru menyala: petir dari tengah ke plat itu + percikan api/listrik */
  var th=-((i+.5)*.5236+(PT3D.rz||0));   /* sudut kanvas (y ke bawah) dari pusat plat */
  ptBoltSpawn(th,.55+.4*ch,95,now,false);
  ptSparkHit(Math.cos(th)*.99,Math.sin(th)*.99,.85,false,now);
}
function ptChargeFull(now){   /* muatan penuh: ledakan petir bercabang di semua sisi + kilat mulut */
  var pot=(typeof IS_POTATO!=='undefined'&&IS_POTATO),k,th;
  for(k=0;k<(pot?1:3);k++)ptBoltSpawn(Math.random()*6.2832,1,0,now,true);
  for(k=0;k<(pot?2:6);k++){th=k*1.0472+Math.random()*.5;ptSparkHit(Math.cos(th)*.99,Math.sin(th)*.99,1,true,now);}
  PT3D.spkT=now;
}
function ptChargeStep(now,ch){
  var cl=PT3D.cl,on=PT3D.cOn,n=ch*12,j,i,tg,dt=PT3D.cTt?Math.min(.1,(now-PT3D.cTt)/1000):.016,pot=(typeof IS_POTATO!=='undefined'&&IS_POTATO);
  PT3D.cTt=now;
  for(j=0;j<12;j++){
    i=PT_ORD[j];tg=n-j;tg=tg<0?0:tg>1?1:tg;
    if(cl[i]===undefined)cl[i]=0;
    cl[i]+=(tg-cl[i])*Math.min(1,dt*(tg>cl[i]?18:5));
    if(n>j+.02){if(!on[j]){on[j]=1;ptChargeHit(i,now,ch);}}
    else if(n<j-.05)on[j]=0;
  }
  if(ch>=.999){
    if(!PT3D.cFull){PT3D.cFull=1;PT3D.cB=.08;PT3D.cS=.5;ptChargeFull(now);}
    PT3D.cB-=dt;PT3D.cS-=dt;
    if(PT3D.cB<=0){ptBoltSpawn(Math.random()*6.2832,.75+.25*Math.random(),70+Math.random()*60,now,false);PT3D.cB=(pot?.2:.07)+Math.random()*.07;}   /* petir terus-menerus keliling cincin */
    if(PT3D.cS<=0){ptBoltSpawn(Math.random()*6.2832,1,0,now,true);PT3D.cS=.4+Math.random()*.35;}
  }else PT3D.cFull=0;
}
/* kilau aditif di atas plat yang sudah menyala (terbaca juga di cincin kecil). g di pusat portal, Rp = radius luar cincin */
function ptChargeGlow(g,Rp){
  var cl=PT3D.cl,i,a0,a1,c=ptCol(),rz=PT3D.rz||0,v;
  g.save();g.globalCompositeOperation='lighter';g.lineCap='butt';
  for(i=0;i<12;i++){
    v=cl[i]||0;if(v<.03)continue;
    a0=i*.5236+.0375+rz;a1=(i+1)*.5236-.0375+rz;
    g.strokeStyle='rgba('+c+','+(.30*v).toFixed(3)+')';g.lineWidth=Rp*(1-PT3D_CFG.inR)*1.25;g.beginPath();g.arc(0,0,Rp*(1+PT3D_CFG.inR)/2,-a1,-a0);g.stroke();
    g.strokeStyle='rgba(255,255,255,'+(.4*v).toFixed(3)+')';g.lineWidth=Math.max(1,Rp*.025);g.beginPath();g.arc(0,0,Rp*(PT3D_CFG.inR+.004),-a1,-a0);g.stroke();
  }
  g.restore();
}

/* ---------- petir di dalam cincin ----------
   Geometri dalam satuan radius mulut (1 = tepi dalam cincin), dibuat SEKALI saat spawn (titik tengah digeser acak) -> menggambar per frame murah.
   Petir SELALU berasal dari area tengah portal (jauh di dalam leher wormhole) lalu menyambar ke tepi cincin di sudut th: jalurnya "tumbuh" dari pusat ke tepi
   selama b.g ms (kepala petir), begitu kepala menyentuh cincin -> percikan (ptSparkHit). Ketebalan petir TETAP tipis (boltW), nggak ikut kekuatan beat;
   kekuatan beat cuma menaikkan terang, jumlah cabang, dan jumlah percikan.
   th = sudut tujuan di tepi (rad), inten 0..1 (terang), dur ms, spike = beat sangat kuat (lebih lama, BERCABANG banyak + kilat mulut + kilau tepi semua pita + percikan banyak).
   Pemicu per pita: lonjakan MENTAH pita (AVB.tg, sebelum dihaluskan) -> onset langsung terbaca di ketukan rapat / polyrhythm; baseline per pita turun cepat supaya
   ketukan berikutnya langsung terdeteksi lagi. Beat global = flux total semua pita (adaptif), bukan cuma bass dgn jeda 125 ms dari 01-core. */
function ptBoltPath(x0,y0,x1,y1,amp,lvl,out){
  if(lvl<=0){out.push(x1,y1);return;}
  var mx=(x0+x1)/2,my=(y0+y1)/2,dx=x1-x0,dy=y1-y0,l=Math.sqrt(dx*dx+dy*dy)||1,o=(Math.random()-.5)*2*amp;
  mx+=-dy/l*o;my+=dx/l*o;
  ptBoltPath(x0,y0,mx,my,amp*.55,lvl-1,out);ptBoltPath(mx,my,x1,y1,amp*.55,lvl-1,out);
}
/* satu cabang dari titik acak di path P; depth>0 = boleh beranak sub-cabang. out = daftar {p,s,at,he,hit}.
   at = posisi (0..1) cabang mulai tumbuh sepanjang tumbuhnya petir utama; he = kapan ujungnya selesai tumbuh; hit = {x,y} kalau ujungnya menyentuh cincin (hanya saat spike). */
function ptBoltBranch(P,out,scale,depth,spike,at0){
  var m=P.length/2,k,bx,by,ba,bl,br,at,den,ex,ey,er,hit=null;
  if(m<3)return;
  k=1+((Math.random()*(m-2))|0);bx=P[2*k];by=P[2*k+1];
  at=at0?at0+(k/(m-1))*.18:k/(m-1);if(at>.92)at=.92;
  ba=Math.atan2(by,bx)+(Math.random()-.5)*(spike?1.5:1.2);   /* condong ke luar (menjauhi pusat) */
  bl=(spike?.3:.2)+Math.random()*(spike?.35:.25);
  ex=bx+Math.cos(ba)*bl;ey=by+Math.sin(ba)*bl;er=Math.sqrt(ex*ex+ey*ey);
  if(spike&&er>.88){ex*=.99/er;ey*=.99/er;hit={x:ex,y:ey};}   /* ujung cabang menyentuh cincin -> ikut memercik */
  br=[bx,by];ptBoltPath(bx,by,ex,ey,.07,spike?3:2,br);
  den=Math.max(.05,Math.min(.35,1-at));
  out.push({p:br,s:scale,at:at,he:at+den,den:den,hit:hit,h:0});
  if(depth>0&&Math.random()<.7)ptBoltBranch(br,out,scale*.65,depth-1,spike,at);
}
function ptBoltSpawn(th,inten,dur,now,spike){
  var B=PT3D.bolts,pot=(typeof IS_POTATO!=='undefined'&&IS_POTATO),max=pot?1:PT3D_CFG.boltMax;
  if(B.length>=max)B.shift();
  var oa=Math.random()*6.2832,orr=.02+Math.random()*.1,   /* titik asal: area tengah portal */
      x0=Math.cos(oa)*orr,y0=Math.sin(oa)*orr,x1=Math.cos(th)*.99,y1=Math.sin(th)*.99,pts=[x0,y0];
  ptBoltPath(x0,y0,x1,y1,spike?.2:.16,4,pts);
  var br=[],nb,i,C=PT3D_CFG.spikeBr,d=dur||(spike?130+Math.random()*80:85+Math.random()*60);
  if(spike&&!pot){nb=C[0]+((Math.random()*(C[1]-C[0]+1))|0);for(i=0;i<nb;i++)ptBoltBranch(pts,br,.7,1,true,0);}
  else if(Math.random()<.6)ptBoltBranch(pts,br,.6,pot?0:1,false,0);
  if(spike)PT3D.spkT=now;
  B.push({t0:now,d:d,g:Math.max(24,Math.min(spike?60:44,d*.38)),p:pts,br:br,i:Math.max(.25,Math.min(1,inten)),s:Math.random()*6.28,hs:spike?1:0,h:0});
  PT3D.nb++;PT3D.lastBolt=now;
}
/* percikan di titik sambaran (x,y dalam satuan radius mulut): kilat kecil + serpihan api/listrik yang terpental ke dalam & menyamping di atas plat cincin */
function ptSparkHit(x,y,inten,big,now){
  var S=PT3D.sparks,pot=(typeof IS_POTATO!=='undefined'&&IS_POTATO),max=pot?14:PT3D_CFG.sparkMax,r=Math.sqrt(x*x+y*y)||1,
      nx=x/r,ny=y/r,ia=Math.atan2(-ny,-nx),oa=Math.atan2(ny,nx),cnt=pot?(big?2:1):(big?7+((Math.random()*6)|0):2+((Math.random()*3)|0)),i,a,sp,d;
  while(S.length>=max)S.shift();
  S.push({k:1,x:x,y:y,t0:now,d:big?150:105,a:big?1:Math.min(1,.45+.5*inten),vx:0,vy:0,w:0});
  for(i=0;i<cnt;i++){
    a=(Math.random()<.3)?oa+(Math.random()-.5)*1.7:ia+(Math.random()-.5)*(big?2.7:2.1);   /* sebagian melesat ke luar menyusuri plat */
    sp=(big?1.0:.7)+Math.random()*(big?1.9:1.1);d=(big?170:130)+Math.random()*(big?230:170);
    if(S.length>=max)S.shift();
    S.push({k:0,x:x,y:y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,t0:now,d:d,a:Math.min(1,.55+.5*inten),w:Math.random()});
  }
}
/* pemicu: onset per pita + beat global; tanpa musik = kilat redup acak jarang */
function ptBoltTick(now,playing,still){
  if(still){PT3D.rim=0;return;}
  var pot=(typeof IS_POTATO!=='undefined'&&IS_POTATO),dt=PT3D.lastTk?(now-PT3D.lastTk)/1000:.016;
  PT3D.lastTk=now;if(dt<0||dt>.25)dt=.016;
  if(playing&&typeof AVB!=='undefined'&&AVB.v&&AVB.d&&AVB.tg&&AVB.n>0){
    var n=AVB.n,v=AVB.v,d=AVB.d,tg=AVB.tg,k,j,best=0,bb=0,bd=0,bk,bv,fv,AVo=(typeof AV!=='undefined')?AV:null,fb=!!(AVo&&AVo.fallback),
        beat=AVo?AVo.beat:0,cap=pot?1:PT3D_CFG.boltCap,cd=pot?90:PT3D_CFG.boltCd,thr=fb?.14:PT3D_CFG.onFlux,
        mn,cf,fl,pt,df,sumF=0,made=0,F,hit=false,spk=false,avSpk=false,nbt,ba;
    if(!PT3D.mn||PT3D.mn.length!==n){PT3D.mn=new Float32Array(n);PT3D.cf=new Float32Array(n);PT3D.fl=new Float32Array(n);PT3D.pt=new Float32Array(n);PT3D.df=new Float32Array(n);}
    mn=PT3D.mn;cf=PT3D.cf;fl=PT3D.fl;pt=PT3D.pt;df=PT3D.df;PT3D.rim=1;
    if(pot&&now-PT3D.lastBolt<160)cap=0;
    for(k=0;k<n;k++){
      df[k]=fb?d[k]:tg[k]-pt[k];   /* lonjakan mentah (target sebelum dihaluskan) -> onset langsung terbaca */
      if(df[k]>0)sumF+=df[k];
      if(df[k]>bd){bd=df[k];bb=k;}
      pt[k]=tg[k];
      fl[k]*=Math.exp(-dt*(9+9*k/n));if(fl[k]<.01)fl[k]=0;   /* kilau tepi: bass sedikit lebih lama, treble cepat; keduanya cukup singkat buat ketukan rapat */
      if(v[k]>v[best])best=k;
    }
    /* pita dengan lonjakan terbesar dulu (bukan urutan bass -> treble), jadi jatah per frame (cap) nggak habis di bass saja */
    for(j=0;j<cap;j++){
      bk=-1;bv=thr;
      for(k=0;k<n;k++)if(df[k]>bv&&tg[k]>.2&&tg[k]>mn[k]+.05&&now-cf[k]>=cd){bv=df[k];bk=k;}
      if(bk<0)break;
      cf[bk]=now;df[bk]=0;made++;
      fv=tg[bk]+.35;if(fv>1.25)fv=1.25;if(fv>fl[bk])fl[bk]=fv;
      ptBoltSpawn((bk+.5)/n*6.2832-1.5708+(Math.random()-.5)*.35,.5+.6*tg[bk],70+Math.random()*55,now,false);
    }
    for(k=0;k<n;k++)mn[k]+=(tg[k]-mn[k])*Math.min(1,dt*(tg[k]>mn[k]?3:12));   /* baseline naik pelan, TURUN cepat -> ketukan berikutnya langsung menonjol lagi */
    /* beat global: flux total semua pita vs rata-ratanya sendiri (cepat beradaptasi); jeda antar hit 40 ms, spike 90 ms */
    if(!fb){
      F=sumF/n;
      hit=F>PT3D.avgF*1.6+.012&&now-PT3D.lastHit>40;
      spk=F>PT3D.avgF*PT3D_CFG.spikeK+.05&&now-PT3D.lastSpk>90;
      PT3D.avgF+=(F-PT3D.avgF)*Math.min(1,dt*5);
      if(hit)PT3D.lastHit=now;
    }
    /* beat bass dari 01-core tetap dipakai (kick besar), sebagai sumber spike tambahan */
    nbt=fb?(beat>.62&&PT3D.prevBeat<=.62&&now-PT3D.lastBS>110):(AVo&&AVo.lastBeatT>0&&AVo.lastBeatT!==PT3D.lastBT&&beat>.5);
    if(AVo)PT3D.lastBT=AVo.lastBeatT;PT3D.prevBeat=beat;
    if(nbt){PT3D.lastBS=now;avSpk=beat>=(fb?.85:(typeof SPIKE_T==='number'?SPIKE_T:1));}
    ba=((bd>0?bb:best)+.5)/n*6.2832-1.5708;
    if(spk||avSpk){
      PT3D.lastSpk=now;
      ptBoltSpawn(ba,1,0,now,true);
      if(!pot)ptBoltSpawn(ba+Math.PI+(Math.random()-.5)*1.4,.9,0,now,true);
      for(k=0;k<n;k++)if(fl[k]<.9)fl[k]=.9;
    }else if(made===0&&(hit||nbt))ptBoltSpawn(ba+(Math.random()-.5)*.5,.55+.4*Math.min(1,beat),70+Math.random()*55,now,false);
  }else{
    PT3D.prevBeat=0;PT3D.rim=0;if(PT3D.pt)PT3D.pt.fill(0);PT3D.avgF=0;
    if(!PT3D.nextIdle)PT3D.nextIdle=now+PT3D_CFG.idleMin;
    if(now>=PT3D.nextIdle){
      ptBoltSpawn(Math.random()*6.2832,.3+Math.random()*.15,130+Math.random()*90,now,false);
      PT3D.nextIdle=now+PT3D_CFG.idleMin+Math.random()*(PT3D_CFG.idleMax-PT3D_CFG.idleMin);
    }
  }
}
/* gambar jalur P dari pusat sampai fraksi f (0..1) -> kepala petir bergerak dari tengah ke tepi */
function ptPathTo(g,P,Rin,f){
  var n=P.length/2,tot=f*(n-1),full=tot|0,k,fr;
  g.moveTo(P[0]*Rin,P[1]*Rin);
  for(k=1;k<=full&&k<n;k++)g.lineTo(P[2*k]*Rin,P[2*k+1]*Rin);
  if(full<n-1){fr=tot-full;g.lineTo((P[2*full]+(P[2*full+2]-P[2*full])*fr)*Rin,(P[2*full+1]+(P[2*full+3]-P[2*full+1])*fr)*Rin);}
}
/* g sudah di-translate ke pusat portal; Rin = radius mulut (px). Dipanggil SETELAH ptMouth dan SEBELUM cincin: ujung petir tertutup tepi cincin. Percikan digambar belakangan (ptSparksDraw) di ATAS cincin. */
function ptBoltsDraw(g,Rin,now,c){
  var B=PT3D.bolts,i,j,k,b,u,fl,al,P,sc,mf,f,e,W=PT3D_CFG.boltW,rim=!!(PT3D.rim&&PT3D.fl&&typeof AVB!=='undefined'&&AVB.v&&AVB.n===PT3D.fl.length),sk=(now-PT3D.spkT)/180;
  if(!B.length&&!rim&&!(sk>=0&&sk<1))return;
  g.save();g.beginPath();g.arc(0,0,Rin,0,6.2832);g.clip();
  g.globalCompositeOperation='lighter';g.lineCap='round';g.lineJoin='round';
  if(sk>=0&&sk<1){g.fillStyle='rgba('+c+','+(.2*(1-sk)*(1-sk))+')';g.beginPath();g.arc(0,0,Rin,0,6.2832);g.fill();}   /* kilat mulut saat spike */
  if(rim){   /* kilau tepi per pita: nempel ke energi pita tiap frame + flash saat onset */
    var N=AVB.n,w=6.2832/N,fa=PT3D.fl,vv=AVB.v,a,th;
    g.lineCap='butt';g.lineWidth=Math.max(2,Rin*.14);
    for(k=0;k<N;k++){
      a=.18*vv[k]+.55*(fa[k]||0);if(a<.03)continue;if(a>.8)a=.8;
      th=(k+.5)/N*6.2832-1.5708;
      g.strokeStyle='rgba('+c+','+a+')';g.beginPath();g.arc(0,0,Rin*.97,th-w*.5,th+w*.5);g.stroke();
    }
    g.lineCap='round';
  }
  for(i=B.length-1;i>=0;i--){
    b=B[i];e=now-b.t0;u=e/b.d;mf=e>=b.g?1:e/b.g;   /* mf = seberapa jauh kepala petir utama sudah tumbuh dari pusat */
    /* kepala menyentuh cincin -> percikan (diproses sebelum petir dibuang supaya nggak ada hit yang terlewat saat frame jarang) */
    if(!b.h&&mf>=1){b.h=1;P=b.p;ptSparkHit(P[P.length-2],P[P.length-1],b.i,!!b.hs,now);}
    for(j=0;j<b.br.length;j++){e=b.br[j];if(e.hit&&!e.h&&(mf>=e.he||u>=1)){e.h=1;ptSparkHit(e.hit.x,e.hit.y,b.i*.8,false,now);}}
    if(u>=1){B.splice(i,1);continue;}
    fl=u<.3?1:.55+.45*Math.sin(now*.09+b.s);   /* kedip */
    al=(1-u)*fl*b.i;
    for(j=0;j<=b.br.length;j++){
      if(j){e=b.br[j-1];P=e.p;sc=e.s;f=(mf-e.at)/e.den;if(f<=0)continue;if(f>1)f=1;}
      else{P=b.p;sc=1;f=mf;}
      g.beginPath();ptPathTo(g,P,Rin,f);
      g.strokeStyle='rgba('+c+','+(.22*al)+')';g.lineWidth=Math.max(1.6,Rin*.11*W*sc);g.stroke();
      g.strokeStyle='rgba('+c+','+(.55*al)+')';g.lineWidth=Math.max(1.1,Rin*.045*W*sc);g.stroke();
      g.strokeStyle='rgba(255,255,255,'+(.95*al)+')';g.lineWidth=Math.max(.7,Rin*.016*sc);g.stroke();
    }
  }
  g.restore();
}
/* percikan: digambar SETELAH cincin (di atasnya, tidak di-clip) supaya serpihan yang melesat ke luar terlihat menimpa plat. Rin = radius mulut (px). */
function ptSparksDraw(g,Rin,now){
  var S=PT3D.sparks,i,s,u,t,t2,px,py,qx,qy,al,k,sc=PT3D_CFG.sparkCol,bc=PT3D_CFG.boltCol;
  if(!S.length)return;
  g.save();g.globalCompositeOperation='lighter';g.lineCap='round';
  for(i=S.length-1;i>=0;i--){
    s=S[i];u=(now-s.t0)/s.d;
    if(u>=1||u<0){S.splice(i,1);continue;}
    if(s.k){   /* kilat benturan di titik sambaran */
      al=(1-u)*(1-u)*s.a;
      g.fillStyle='rgba('+sc+','+(.35*al)+')';g.beginPath();g.arc(s.x*Rin,s.y*Rin,Rin*.15*(1+.6*u),0,6.2832);g.fill();
      g.fillStyle='rgba('+bc+','+(.9*al)+')';g.beginPath();g.arc(s.x*Rin,s.y*Rin,Rin*.05,0,6.2832);g.fill();
      continue;
    }
    t=(now-s.t0)/1000;t2=Math.max(0,t-.04);k=1-.35*u;   /* melambat (seret) */
    px=(s.x+s.vx*t*k)*Rin;py=(s.y+s.vy*t*k)*Rin;qx=(s.x+s.vx*t2*k)*Rin;qy=(s.y+s.vy*t2*k)*Rin;
    al=(1-u)*(1-u)*s.a*(.65+.35*Math.sin(now*.05+s.w*20));
    g.beginPath();g.moveTo(qx,qy);g.lineTo(px,py);
    g.strokeStyle='rgba('+sc+','+(.85*al)+')';g.lineWidth=Math.max(1.3,Rin*.032);g.stroke();
    g.strokeStyle='rgba('+bc+','+(.95*al)+')';g.lineWidth=Math.max(.7,Rin*.012);g.stroke();
  }
  g.restore();
}
/* x,y = pusat di layar, Rp = radius luar cincin (px), a = alpha 0..1 */
function portal3dDraw(g,x,y,Rp,now,a,opts){
  if(!(Rp>2)||!(a>.01))return;
  opts=opts||{};var ch=opts.ch||0,tk=Math.max(0,Math.min(1,opts.tilt||0)),tm=null;
  if(ch>0||opts.big)PT3D.big=1;
  var use3d=pt3dUsable(),still=(typeof reduce!=='undefined'&&reduce)||(typeof IS_POTATO!=='undefined'&&IS_POTATO),playing=ptPlaying();
  g.save();
  g.translate(x,y);if(!opts.noRot&&typeof STG!=='undefined'&&STG.rot&&typeof upAng==='function')g.rotate(upAng());   /* noRot: window menu sektor (16) di luar stage, tidak ikut rotasi landscape */
  g.globalAlpha=a>1?1:a;
  ptChargeStep(now,ch);   /* plat menyala satu-satu + petir/percikan pemicunya (ch = WORMHOLE.charge()) */
  if(tk>0.001){tm=ptTiltMat(ptTiltAng(now,tk));}   /* P4: elemen 2D (mulut, petir, percikan, kilau muatan) digambar di bidang cincin = affine yang sama dengan kemiringan 3D */
  var r2d=function(){if(tm){g.save();g.transform(tm[0],tm[1],tm[2],tm[3],0,0);}ptRing2D(g,Rp,now,playing);if(tm)g.restore();};   /* cadangan 2D ikut miring */
  if(tm){g.save();g.transform(tm[0],tm[1],tm[2],tm[3],0,0);}
  if(!opts.noMouth){if(still||!pttDraw(g,Rp*PT_IN,now))ptMouth(g,Rp*PT_IN,now,!still);}   /* mulut idle = terowongan warp mini; statis kalau potato / reduce motion */
  /* visualizer = kilatan petir di dalam cincin (debu + pulse elips visualizer BH lama dibuang). updateAVColor / avbUpdate dulu dipanggil lewat drawAudioVisualizer, sekarang dari sini. */
  try{
    if(typeof updateAVColor==='function')updateAVColor(now);
    if(playing&&typeof avbUpdate==='function')avbUpdate(now);
    if(!(typeof reduce!=='undefined'&&reduce)){ptBoltTick(now,playing,still&&!playing);ptBoltsDraw(g,Rp*PT_IN,now,PT3D_CFG.boltCol);}
  }catch(eV){}
  if(tm)g.restore();
  if(use3d){
    try{
      if(now!==PT3D.lastNow||Math.abs(tk-PT3D.lastTilt)>.001){PT3D.lastNow=now;PT3D.lastTilt=tk;pt3dRender(now,Rp,playing,tk);}
      var S=2*PT3D_CFG.half*Rp;
      g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
      g.drawImage(PT3D.r.domElement,-S/2,-S/2,S,S);
    }catch(e){pt3dFail(e&&e.message||e);r2d();}
  }else r2d();
  if(tm){g.save();g.transform(tm[0],tm[1],tm[2],tm[3],0,0);}
  ptChargeGlow(g,Rp);
  if(!(typeof reduce!=='undefined'&&reduce)){try{ptSparksDraw(g,Rp*PT_IN,now);}catch(eS){}}   /* percikan di atas cincin */
  if(tm)g.restore();
  g.restore();
}

/* ---------- P4: orbit portal overview (hanya overview) ----------
   Elips penuh (bukan terbit/tenggelam): sumbu panjang sejajar tangen limb planet (limb miring turun ke kanan), pusat di home BH (digeser naik kalau titik terendah menyentuh limb),
   searah jarum jam. Sudut diintegrasi per frame (bukan fungsi waktu mutlak): tidak ada lompatan waktu sky berhenti (menu) / geometri berubah (zoom, parallax).
   Berhenti (diam di tempat): selama di-drag (portal ikut jari, lalu springback BH overview seperti dulu), transisi wormhole / zoom sektor, dan terowongan kedatangan (ARV<1).
   Baru datang dari sektor: mulai dari puncak orbit (phi0). Titik itu juga tujuan terowongan wormhole (ptOvDest), jadi teleskop keluar dari dalam portal.
   reduce motion = portal diam di home seperti sebelum P4. */
var PT_PHI0=1.5708;
function ptUp2Stage(x,y){var r=(typeof PL3D!=='undefined')?PL3D.rot:0;return r<0?[STG.ih-y,x]:(r>0?[y,STG.iw-x]:[x,y]);}   /* ruang layar tegak -> ruang stage (kebalikan v2c, sama dengan planetBhClamp) */
function ptOrbRef(){   /* radius cincin 'penuh' (tanpa intro/ARV) supaya geometri orbit tidak bergeser selama cincin masih membesar */
  try{return Math.max(8,BH.R*(BHSC||1)*(typeof bhSizeMul==='function'?bhSizeMul():1)*(BHZ||1)*ptOvK());}catch(e){return 30;}
}
/* posisi orbit pada sudut phi, ruang stage. bp = posisi BH sekarang (camBH, sudah termasuk geseran drag); null = tanpa geseran drag. */
function ptOrbAt(phi,bp){
  var O=PT3D_CFG.orb;
  if(!O||!O.on||typeof pl3dGeom!=='function'||typeof PL3D==='undefined'||typeof astAnchor!=='function')return null;
  pl3dSync();if(!PW||!PH)return null;
  var Rp=ptOrbRef(),gm=pl3dGeom(),R2=gm.R*gm.R,an=astAnchor(),hu=pl3dScr(an[0],an[1]),i;
  var limb=function(x){var d=x-gm.cx;return gm.cy-Math.sqrt(Math.max(0,R2-d*d));};
  var cxo=Math.max(PW*.2,Math.min(PW*.8,hu[0])),cyo=hu[1],dd=cxo-gm.cx,beta=Math.atan(dd/Math.sqrt(Math.max(1,R2-dd*dd)))*(O.bet||1),cb=Math.cos(beta),sb=Math.sin(beta);
  var ax=PW*O.ax,ay=Math.max(PH*O.ay,Rp*.9);
  /* jepit lebar supaya cincin tetap di dalam layar (elips miring: cek ekstrem x lewat sampling) */
  var xm=-1e9,xn=1e9,k,x,c,s2;
  for(k=0;k<24;k++){c=Math.cos(k*.2618);s2=Math.sin(k*.2618);x=cxo+c*ax*cb+s2*ay*sb;if(x>xm)xm=x;if(x<xn)xn=x;}
  var m=Rp*.7;
  if(xm>PW-m&&xm>cxo+1)ax*=Math.max(.35,(PW-m-cxo)/(xm-cxo));
  if(xn<m&&xn<cxo-1)ax*=Math.max(.35,(cxo-m)/(cxo-xn));
  /* titik terendah orbit tidak boleh menyentuh limb: geser pusat naik kalau perlu */
  var need=-1e9,y;
  for(k=0;k<24;k++){c=Math.cos(k*.2618);s2=Math.sin(k*.2618);x=cxo+c*ax*cb+s2*ay*sb;y=cyo+c*ax*sb-s2*ay*cb;need=Math.max(need,y+Rp*O.gap-limb(x));}
  /* need > 0: orbit menyentuh limb -> naik sebesar itu (seperti dulu). need < 0: ada ruang kosong di bawah orbit -> pusat turun near x ruang itu (orbit mendekati/menyusuri horizon) */
  cyo-=need>0?need:need*Math.max(0,Math.min(1,O.near==null?0:O.near));
  var cp=Math.cos(phi),sp=Math.sin(phi),lx=-cp*ax,lu=sp*ay,px=cxo+lx*cb+lu*sb,py=cyo+lx*sb-lu*cb,st=ptUp2Stage(px,py);   /* phi=pi/2 = puncak; bertambah = searah jarum jam */
  return {x:(bp?bp[0]:an[0])+(st[0]-an[0]),y:(bp?bp[1]:an[1])+(st[1]-an[1])};   /* bp - an = geseran drag BH overview */
}
function ptOrbPinned(){
  var arv=(typeof ARV!=='undefined')?ARV:1;
  return arv<.999||PT3D.orbInSect||PT3D.orbPhi==null;
}
function portalOrbit(now,bp,Rp){
  var out=PT3D.orb||(PT3D.orb={on:0,x:0,y:0,hid:0,w:0}),O=PT3D_CFG.orb;
  out.on=0;out.x=bp[0];out.y=bp[1];out.hid=0;out.w=0;out.s=1;
  if(!O||!O.on||(typeof reduce!=='undefined'&&reduce))return out;
  var pin=ptOrbPinned(),phi=pin?PT_PHI0:PT3D.orbPhi;
  if(pin&&!(typeof ARV!=='undefined'&&ARV<.999)){PT3D.orbInSect=0;}   /* sudah selesai datang: mulai dari puncak, lalu jalan */
  var dt=PT3D.orbLast?Math.min(.1,Math.max(0,(now-PT3D.orbLast)/1000)):0;PT3D.orbLast=now;
  var busy=(typeof SECT!=='undefined'&&SECT.busy)||(typeof whBusy==='function'&&whBusy())||(typeof drag!=='undefined'&&drag.on)||pin&&(typeof ARV!=='undefined'&&ARV<.999);
  var dir=1;
  if(O.counter){try{dir=(PL3D_CFG.live.rot>0)?-1:1;}catch(eD){}}   /* lawan rotasi planet */
  if(!busy)phi=(phi+dir*dt*6.283185/O.per+6.283185)%6.283185;
  PT3D.orbPhi=phi;
  var p=ptOrbAt(phi,bp);if(!p)return out;
  out.x=p.x;out.y=p.y+(O.bob?Math.sin(now*.0013)*O.bob:0);out.on=1;out.w=1;
  out.s=1-(O.depth||0)*Math.sin(phi);   /* phi=pi/2 = puncak elips = sisi jauh (lebih kecil); bawah = sisi dekat (lebih besar) */
  return out;
}
function ptSmooth(u){u=u<0?0:(u>1?1:u);return u*u*(3-2*u);}
/* P4: kemiringan cincin saat zoom-in wormhole (09-wormhole.js). Asal overview = mulai dari kemiringan overview (tanpa pop), makin membesar makin tegak menghadap kamera. Asal sektor = datar. u = r/cvr (0 kecil .. 1 penuh layar) */
function ptWhTilt(u){
  try{if(typeof SECT!=='undefined'&&!SECT.cur){var k=PT3D_CFG.tiltOv||0;return k*(1-ptSmooth((u-.08)/.3));}}catch(e){}
  return 0;
}
/* titik tujuan terowongan wormhole sektor -> overview (stage): posisi portal sesaat setelah datang (phi0) / posisi sekarang kalau orbit sudah jalan. Tanpa mengubah state. */
function ptOvDest(){
  var bp=camBH();
  try{var O=PT3D_CFG.orb;if(O&&O.on&&!(typeof reduce!=='undefined'&&reduce)){var p=ptOrbAt(ptOrbPinned()?PT_PHI0:PT3D.orbPhi,bp);if(p)return [p.x,p.y];}}catch(e){}
  return bp;
}
/* posisi portal overview terakhir yang digambar (ruang stage). Dipakai tap/drag (06), jangkar wormhole (05), lampu planet (17). Tanpa data -> posisi BH. */
function ptOvPos(){return(PT3D.ovX!=null)?[PT3D.ovX,PT3D.ovY]:camBH();}
/* (P4 lama: portal hilang di balik planet) sekarang selalu false, orbit biasa tanpa terbit/tenggelam */
function ptOvHidden(){return false;}

/* Overview: dipanggil dari drawHole (03-gargantua.js) menggantikan gambar BH. R = horizon BH sudah termasuk intro/terowongan (ARV)/swallow. true = sudah digambar. */
function portal3dOverview(now,bp,R){
  if(!(R>1))return false;
  if(PT3D.state===0)pt3dLoad();
  var Rp=R*ptOvK();
  if(typeof WORMHOLE!=='undefined'&&WORMHOLE.ringOwned&&WORMHOLE.ringOwned())return true;   /* zoom-in dari overview (F2): cincin digambar di kanvas wormhole; ovR/ovT sengaja tidak diperbarui (portal tidak bisa di-tap selama transisi) */
  var op=portalOrbit(now,bp,Rp),px=op.x,py=op.y,tk=PT3D_CFG.tiltOv||0;
  Rp*=op.s||1;   /* orbit ala drone: sedikit membesar di sisi dekat, mengecil di sisi jauh (PT3D_CFG.orb.depth); ovR (hit-test tap) ikut */
  var ch=ptWhCharge(),Rd=Rp*(1+PT_SWELL*ch*ch*(3-2*ch));   /* muatan 12 plat + cincin membengkak, sama seperti portal sektor */
  if(!smenuHidesSky())portal3dDraw(g,px,py,Rd,now,1,(ch>0||tk>0)?{ch:ch,tilt:tk}:null);   /* window menu sektor terbuka: kanvasnya yang memakai renderer 3D bersama */
  PT3D.ovR=Rp;PT3D.ovT=now;PT3D.ovX=px;PT3D.ovY=py;PT3D.ovHid=op.hid;   /* F3: radius + posisi terakhir dipakai hit-test tap portal overview (06-interaction.js), jangkar wormhole (05), lampu planet (17) */
  /* F3 (D1): petunjuk idle — selama pengunjung belum pernah membuka menu sektor, cincin luar berdenyut pelan ("portal ini bisa di-tap"). */
  if(!OVSEL.seen&&!op.hid&&!(typeof reduce!=='undefined'&&reduce)&&typeof SECT!=='undefined'&&!SECT.busy&&!SECT.cur){
    var ph=(now%2600)/2600;
    g.save();g.translate(px,py);
    if(typeof STG!=='undefined'&&STG.rot&&typeof upAng==='function')g.rotate(upAng());
    if(tk>.001){var tm=ptTiltMat(ptTiltAng(now,tk));g.transform(tm[0],tm[1],tm[2],tm[3],0,0);}   /* denyut ikut miring */
    g.strokeStyle='rgba('+ptCol()+','+(.38*(1-ph))+')';g.lineWidth=1.5;
    g.beginPath();g.arc(0,0,Rp*(1.04+.26*ph),0,6.2832);g.stroke();
    g.restore();
  }
  return true;
}
/* F3 menu sektor (16-sector-menu.js): selama window terbuka / menutup, sky tidak menggambar portal (ketutup backdrop; satu renderer WebGL tidak dipakai dua kanvas dengan resolusi beda tiap frame). */
function smenuHidesSky(){return typeof SMENU!=='undefined'&&(SMENU.open||SMENU.closing);}
/* Radius luar portal overview yang baru saja digambar (0 = tidak tampil / bukan overview). */
function ptOvR(){return(typeof SECT!=='undefined'&&!SECT.cur&&!SECT.busy&&PT3D.ovT&&performance.now()-PT3D.ovT<1200&&!PT3D.ovHid)?PT3D.ovR:0;}   /* P4: 0 juga kalau portal sedang di balik planet (tidak bisa di-tap) */

/* ---------- ukuran cincin kecil (F11: portal sektor sudah pensiun; tinggal dipakai wormAnchor() di 05-sector-ui.js sebagai R mulut wormhole) ---------- */
function ptSecR(){return Math.max(16,(typeof BH!=='undefined'?BH.R:26)*PT3D_CFG.secK*.62);}
try{pt3dLoad();}catch(ePT3L){}   /* mulai muat lebih awal supaya tidak ada "pop" dari 2D ke 3D */
