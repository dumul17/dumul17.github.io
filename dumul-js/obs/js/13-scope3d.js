'use strict';
/* 13-scope3d.js — teleskop jadi pesawat NEON 3D (Three.js r128, dimuat LAZY, memakai three.min.js yang sama dengan 12-ast3d.js).
   Cara kerja: satu WebGL renderer offscreen kecil merender pesawat di frame LOKAL badan (+x = hidung, sama seperti teleDrawBody 2D),
   lalu hasilnya di-drawImage sebagai kotak -64..64. Karena cuma menggantikan ISI teleDrawBody() (04-render.js), semua yang lain tetap:
   posisi/lensing/ghost copy, rotasi T.ang, skala sc, hit-test, dan gambar ulang di atas terowongan wormhole (09-wormhole.js).
   Desain (cyberpunk spacecraft): badan prisma segi-6 meruncing (abu baja, karat oranye), muka depan bergaris sirkuit cyan + tepi magenta,
   kokpit segi-8 bercahaya cyan, dua pod kaca transparan di sisi, antena di hidung, blok mesin dengan DUA thruster ion hijau.
   Pencahayaan: kunci hangat dari arah Gargantua (dihitung dari posisi teleskop -> BH, diputar balik ke frame badan) + fill cyan + rim magenta + env ungu kecil.
   Pose: roll/yaw pelan supaya terasa 3D walau gerak 2D-nya tetap. Api mesin ikut mode (drift tipis, orbit sedang, warp menyala).
   DUA antena sama panjang, dua LED sama terang: LED atas = IDLE (warna dari panel setelan Tele), LED bawah = INDIKATOR interlocking
   (kuning = drone di-drop, cyan/biru = TX di sektor sumber, pink = RX di sektor lain, merah = Lost-in-Space; padam kalau tidak ada state) lewat teIdleStep() / teIndStep() di 04-render.js.
   Lost-in-Space: sirkuit & tepi neon ikut berubah merah dan berkedip.
   Gagal apa pun (WebGL mati, context lost, file nggak termuat, potato, reduce motion) -> tele3dBody() return false -> badan 2D lama dipakai lagi.
   Matikan: ?scope3d=0 di URL atau localStorage dumul_scope3d=0. */
var SCP3D_CFG={
  on:true,
  lib:(typeof AST3D_CFG!=='undefined'&&AST3D_CFG.lib)||'dumul-js/obs/lib/three.custom.r186.js?v=1',   /* path + ?v= harus sama dgn SHELL service-worker */
  half:64,       /* kotak gambar -half..half (satuan lokal teleDrawBody) */
  envSize:256,   /* ukuran cube PMREM env pantulan (teleskop + drone). Default 256 = tampilan lama. Turunkan (128/64) buat hemat CPU saat boot; A/B lewat ?envsz=N (dibatasi 32..256, dibulatkan ke pangkat 2) */
  resMin:128,resMax:256,
  /* Pose IDLE (di overview & di sektor): teleskop tidak datar — mengayun 3D pelan + condong ke arah gerakannya (bank/lean).
     Tersambung ke panel tuning tab Tele: SPIN = kecepatan + besar ayunan (0 = pose beku, tetap miring 3D), HOVER = kecepatan melayang -> makin kencang makin condong.
     pitch/yaw/roll = besar ayunan (rad, di spin 1×) · bank = seberapa condong ke arah gerak (0 = mati) · ref = kecepatan (px/s) yang dianggap "penuh"
     sx/sy = balik ke -1 kalau condongnya terasa terbalik · on:0 = pose idle lama (ayunan kecil) */
  idle:{on:1,pitch:.38,yaw:.55,roll:.13,bank:.5,ref:40,sx:1,sy:1}
};
try{
  if(/[?&]scope3d=0(&|$)/.test(location.search)||localStorage.getItem('dumul_scope3d')==='0')SCP3D_CFG.on=false;
}catch(eS3){}
var SCP3D={state:0,/* 0 belum, 1 memuat, 2 siap, 3 gagal/nonaktif */r:null,sc:null,cam:null,root:null,res:0,last:-1e9,err:'',m:{},o:{}};

function scp3dFail(why){SCP3D.state=3;SCP3D.err=String(why||'');try{console.warn('[scope3d] fallback ke badan 2D:',SCP3D.err);}catch(e){}}

function scp3dLoad(){
  if(SCP3D.state!==0)return;
  if(!SCP3D_CFG.on){SCP3D.state=3;SCP3D.err='off';return;}
  SCP3D.state=1;
  var go=function(){try{scp3dBuild();}catch(e){scp3dFail(e&&e.message||e);}};
  threeLoad(go,function(m){scp3dFail(m);});   /* pemuat bersama di 12-ast3d.js (import() dinamis, satu promise utk semua modul) */
}

/* ---------- tekstur kecil (canvas 2D) ---------- */
function scp3dCanvas(w,h){var c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function scp3dTex(c,srgb){var t=new THREE.CanvasTexture(c);if(srgb!==false)t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=2;return t;}

/* muka depan: peta warna (baja + panel + karat) + peta emisif (sirkuit neon). Canvas atas = hidung, kiri->kanan = sisi -y -> +y. */
function scp3dFaceTex(){
  var W=128,H=512,c=scp3dCanvas(W,H),e=scp3dCanvas(W,H),x=c.getContext('2d'),y=e.getContext('2d'),i,seed=7;
  function rnd(){seed=(seed*16807)%2147483647;return seed/2147483647;}
  var gr=x.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#74818c');gr.addColorStop(.55,'#58646f');gr.addColorStop(1,'#414c57');
  x.fillStyle=gr;x.fillRect(0,0,W,H);
  /* kesan panel: jahitan gelap + sorotan tipis */
  var seams=[44,118,196,262,372,432,486];
  seams.forEach(function(sy){
    x.fillStyle='rgba(14,20,26,.6)';x.fillRect(0,sy,W,2);
    x.fillStyle='rgba(190,205,215,.18)';x.fillRect(0,sy+2,W,1);
  });
  x.fillStyle='rgba(14,20,26,.5)';x.fillRect(W/2-1,0,2,H);
  /* paku keling */
  x.fillStyle='rgba(20,26,32,.55)';
  for(i=0;i<seams.length;i++){for(var k=0;k<6;k++){x.beginPath();x.arc(8+k*22+(i&1)*4,seams[i]-5,1.3,0,6.283);x.fill();}}
  /* karat oranye, ngumpul di dekat jahitan & tepi */
  for(i=0;i<46;i++){
    var near=rnd()<.6?seams[(rnd()*seams.length)|0]+(rnd()*18-6):rnd()*H,rx=rnd()<.5?rnd()*26:W-rnd()*26,w=3+rnd()*10,h=2+rnd()*7;
    x.fillStyle='rgba('+(150+(rnd()*50|0))+','+(70+(rnd()*40|0))+',30,'+(.28+rnd()*.4).toFixed(2)+')';
    x.fillRect(rnd()<.5?rx:rnd()*W,near,w,h);
  }
  /* lubang ventilasi di hidung */
  x.fillStyle='#10161c';x.fillRect(34,14,60,26);
  x.fillStyle='rgba(120,140,155,.55)';for(i=0;i<5;i++)x.fillRect(37,18+i*5,54,1.6);
  /* panel gelap di bawah kokpit */
  x.fillStyle='rgba(16,22,28,.65)';x.fillRect(30,392,68,30);

  /* ---- emisif ---- */
  y.fillStyle='#000';y.fillRect(0,0,W,H);
  function line(pts,col,lw,glow){
    y.strokeStyle=col;y.lineWidth=lw;y.lineJoin='miter';y.shadowColor=col;y.shadowBlur=glow;
    y.beginPath();y.moveTo(pts[0],pts[1]);for(var q=2;q<pts.length;q+=2)y.lineTo(pts[q],pts[q+1]);y.stroke();y.shadowBlur=0;
  }
  function dot(px,py,r,col){y.fillStyle=col;y.shadowColor=col;y.shadowBlur=6;y.beginPath();y.arc(px,py,r,0,6.283);y.fill();y.shadowBlur=0;}
  var CY='#35f3ff',MG='#ff3fd8',OR='#ffa030';
  /* dua sirkuit utama zigzag dari hidung ke kokpit */
  var A=[80,48,80,66,66,66,66,112,90,112,90,160,72,160,72,214,84,214,84,246];
  var B=[48,48,48,84,34,84,34,136,56,136,56,184,42,184,42,226,52,226,52,248];
  line(A,CY,3.4,8);line(B,CY,3.4,8);
  dot(84,246,3.6,CY);dot(52,248,3.6,CY);dot(80,48,3,CY);dot(48,48,3,CY);
  /* jalur tipis cadangan */
  line([108,48,108,150,100,150,100,236],CY,1.6,4);line([20,60,20,170,28,170,28,240],CY,1.6,4);
  line([64,48,64,60],CY,1.4,3);line([64,120,64,132],CY,1.4,3);
  /* sirkuit turun mengapit kokpit sampai bawah */
  line([14,262,14,330,10,330,10,512],CY,2.4,6);line([114,262,114,330,118,330,118,512],CY,2.4,6);
  line([30,380,30,430,44,430,44,470],CY,1.6,4);line([98,380,98,436,84,436,84,478],CY,1.6,4);
  dot(44,470,2.6,CY);dot(84,478,2.6,CY);
  /* blok kecil di bawah kokpit */
  y.fillStyle=CY;y.shadowColor=CY;y.shadowBlur=5;y.fillRect(36,400,8,5);y.fillRect(50,400,8,5);y.fillRect(36,410,22,3);y.shadowBlur=0;
  /* magenta: garis pinggir + panel kecil */
  line([122,40,122,500],MG,2.6,7);
  y.fillStyle=MG;y.shadowColor=MG;y.shadowBlur=6;y.fillRect(96,262,16,7);y.fillRect(20,360,10,6);y.fillRect(70,452,22,4);y.shadowBlur=0;
  /* aksen oranye */
  y.fillStyle=OR;y.shadowColor=OR;y.shadowBlur=5;y.fillRect(14,72,14,5);y.fillRect(104,330,12,4);y.shadowBlur=0;
  /* bayangan karat redam sirkuit sedikit di sudut */
  var base=scp3dTex(c),emi=scp3dTex(e);
  return {map:base,emi:emi};
}

/* isi kokpit: ruang kecil bercahaya cyan, panel pink di kanan */
function scp3dRoomTex(){
  var c=scp3dCanvas(128,128),x=c.getContext('2d'),g=x.createRadialGradient(64,60,6,64,64,76);
  g.addColorStop(0,'#f2ffff');g.addColorStop(.35,'#7ef2ff');g.addColorStop(1,'#12829f');
  x.fillStyle=g;x.fillRect(0,0,128,128);
  /* dinding belakang + lantai/langit-langit (perspektif) */
  x.fillStyle='rgba(230,255,255,.85)';x.fillRect(34,30,60,52);
  x.fillStyle='rgba(20,120,150,.55)';
  x.beginPath();x.moveTo(0,0);x.lineTo(34,30);x.lineTo(34,82);x.lineTo(0,128);x.closePath();x.fill();
  x.fillStyle='rgba(120,235,255,.7)';
  x.beginPath();x.moveTo(0,0);x.lineTo(128,0);x.lineTo(94,30);x.lineTo(34,30);x.closePath();x.fill();
  x.fillStyle='rgba(10,90,120,.6)';
  x.beginPath();x.moveTo(0,128);x.lineTo(128,128);x.lineTo(94,82);x.lineTo(34,82);x.closePath();x.fill();
  /* panel pink kanan + konsol kecil */
  x.fillStyle='#ff86dc';
  x.beginPath();x.moveTo(94,30);x.lineTo(128,0);x.lineTo(128,128);x.lineTo(94,82);x.closePath();x.fill();
  x.fillStyle='rgba(255,255,255,.75)';x.fillRect(98,40,12,3);x.fillRect(98,50,18,3);
  x.fillStyle='rgba(8,50,70,.85)';x.fillRect(44,52,14,22);x.fillRect(62,56,10,18);
  x.fillStyle='rgba(255,255,255,.9)';x.fillRect(0,0,128,5);
  return scp3dTex(c);
}

/* isi pod kaca: palang data cyan + pita magenta (alpha) */
function scp3dPodTex(){
  var c=scp3dCanvas(64,128),x=c.getContext('2d'),i,seed=3;
  function rnd(){seed=(seed*16807)%2147483647;return seed/2147483647;}
  x.clearRect(0,0,64,128);
  for(i=0;i<13;i++){
    var yy=4+i*9.4,h=3+rnd()*5,mag=(i%5===2);
    x.fillStyle=mag?'rgba(255,90,225,.9)':'rgba(95,240,255,'+(.55+rnd()*.4).toFixed(2)+')';
    x.fillRect(rnd()*10,yy,64-rnd()*18,h);
  }
  x.fillStyle='rgba(220,255,255,.5)';for(i=0;i<8;i++)x.fillRect(i*8+2,0,1.2,128);
  return scp3dTex(c);
}

function scp3dGlowTex(){
  var T=THREE,c=document.createElement('canvas');c.width=c.height=64;
  var x=c.getContext('2d'),gr=x.createRadialGradient(32,32,0,32,32,32);
  gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.22,'rgba(255,255,255,.55)');gr.addColorStop(.6,'rgba(255,255,255,.12)');gr.addColorStop(1,'rgba(255,255,255,0)');
  x.fillStyle=gr;x.fillRect(0,0,64,64);
  return new T.CanvasTexture(c);
}
/* ukuran cube PMREM: knob SCP3D_CFG.envSize, override ?envsz=N (A/B). Dibulatkan ke pangkat 2 dalam 32..256; terbaca di window.__envsz (dicatat bench). */
function scp3dEnvSize(){
  var n=SCP3D_CFG.envSize||256;
  try{var m=/[?&]envsz=(\d+)(?:&|#|$)/.exec(location.search);if(m)n=+m[1];}catch(e){}
  n=Math.max(32,Math.min(256,n|0));n=Math.pow(2,Math.round(Math.log(n)/Math.LN2));
  try{window.__envsz=n;}catch(e2){}
  return n;
}
/* env kecil buat pantulan logam: bola gradien gelap->ungu + dua softbox (magenta & cyan); gagal -> tanpa env */
function scp3dEnv(r){
  try{
    var T=THREE,sc=new T.Scene(),geo=new T.SphereGeometry(50,24,16),pos=geo.attributes.position,col=new Float32Array(pos.count*3),i,t,c0=new T.Color(0x05030c),c1=new T.Color(0x5a3c9c),cc=new T.Color();
    for(i=0;i<pos.count;i++){t=Math.pow((pos.getY(i)/50+1)/2,1.6);cc.copy(c0).lerp(c1,t);col[i*3]=cc.r;col[i*3+1]=cc.g;col[i*3+2]=cc.b;}
    geo.setAttribute('color',new T.BufferAttribute(col,3));
    sc.add(new T.Mesh(geo,new T.MeshBasicMaterial({vertexColors:true,side:T.BackSide})));
    var mag=new T.Mesh(new T.PlaneGeometry(30,16),new T.MeshBasicMaterial({color:new T.Color(1.7,.45,1.5),side:T.DoubleSide}));
    mag.position.set(32,14,20);mag.lookAt(0,0,0);sc.add(mag);
    var cy=new T.Mesh(new T.PlaneGeometry(26,10),new T.MeshBasicMaterial({color:new T.Color(.35,1.3,1.7),side:T.DoubleSide}));
    cy.position.set(-30,-6,18);cy.lookAt(0,0,0);sc.add(cy);
    var sz=scp3dEnvSize(),pm=new T.PMREMGenerator(r),rt=pm.fromScene(sc,.02,.1,100,{size:sz});pm.dispose();
    return rt.texture;
  }catch(e){return null;}
}

/* ---------- model pesawat ---------- */
function* scp3dBuildG(){
  var T=THREE,gl=threeGLGet('SCP3D','small',true,true,1.0,scp3dFail),r=gl.r;   /* v22: renderer grup 'small' (dibagi dgn DR3D + PT3D); exposure per unit diset di threeGLBegin */
  SCP3D.gl=gl;SCP3D.r=r;
  var sc=new T.Scene(),H=SCP3D_CFG.half;
  var cam=new T.OrthographicCamera(-H,H,H,-H,-300,300);cam.position.set(0,0,100);cam.lookAt(0,0,0);
  SCP3D.sc=sc;SCP3D.cam=cam;
  yield;   /* ---- tahap 0 selesai: renderer + scene ---- */
  /* FLAG ENV TELESKOP (v16): PMREM teleskop ±0,69-0,96 dtk di itel (bench 3 Nov), tidak bisa diiris. v17: default sekarang TANPA env; ?senv=1 = pakai env PMREM (tampilan lama, A/B + rollback).
     Tanpa env logam hanya memantulkan lampu, jadi metalness hull/face/dark dikali SCP3D_MF (?smf=N, default .45; pod kaca tidak diubah). Tahap 1 tetap ada (yield kosong) supaya scp3dT tetap 8 elemen. */
  var env=null;if(SCP3D_ENV){env=scp3dEnv(r);}
  var mf=env?1:SCP3D_MF,m=SCP3D.m,o=SCP3D.o,DS=T.DoubleSide,PI=Math.PI;
  yield;   /* ---- tahap 1 selesai: env PMREM (atau dilewati) ---- */
  var face=scp3dFaceTex();
  m.hull=new T.MeshStandardMaterial({color:0x44505c,metalness:.6*mf,roughness:.5,flatShading:true,envMap:env,envMapIntensity:.8});
  m.face=new T.MeshStandardMaterial({map:face.map,emissiveMap:face.emi,emissive:0xffffff,emissiveIntensity:1.45,metalness:.5*mf,roughness:.55,envMap:env,envMapIntensity:.9,side:DS});
  m.dark=new T.MeshStandardMaterial({color:0x2b333c,metalness:.8*mf,roughness:.42,envMap:env,envMapIntensity:1.0,side:DS});
  m.black=new T.MeshStandardMaterial({color:0x07090c,metalness:.2,roughness:.8,side:DS});
  m.pod=new T.MeshStandardMaterial({color:0x8fe9ff,metalness:.15,roughness:.12,transparent:true,opacity:.3,emissive:0x1aa6c8,emissiveIntensity:.7,envMap:env,envMapIntensity:1.4,depthWrite:false,side:DS});
  m.podcore=new T.MeshBasicMaterial({map:scp3dPodTex(),transparent:true,depthWrite:false,side:DS,toneMapped:false});
  m.room=new T.MeshBasicMaterial({map:scp3dRoomTex(),toneMapped:false});
  m.cyan=new T.MeshBasicMaterial({color:0x35f3ff,toneMapped:false});
  m.mag=new T.MeshBasicMaterial({color:0xff3fd8,toneMapped:false});
  m.green=new T.MeshBasicMaterial({color:0x56ff3e,toneMapped:false});
  m.led=new T.MeshBasicMaterial({color:0x6bff9e,toneMapped:false});    /* LED idle */
  m.led2=new T.MeshBasicMaterial({color:0x3a4248,toneMapped:false});   /* LED indikator interlock (padam = kaca gelap) */
  m.ion=new T.MeshBasicMaterial({color:0x1fe81a,toneMapped:false,transparent:true,opacity:.85,depthWrite:false,blending:T.AdditiveBlending,side:DS});
  m.ionCore=new T.MeshBasicMaterial({color:0x9dff7a,toneMapped:false,transparent:true,opacity:.8,depthWrite:false,blending:T.AdditiveBlending,side:DS});
  yield;   /* ---- tahap 2 selesai: tekstur kanvas + material ---- */
  var glowTex=scp3dGlowTex();
  function sprite(color,s){
    var sp=new T.Sprite(new T.SpriteMaterial({map:glowTex,color:color,transparent:true,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false}));
    sp.scale.set(s,s,1);return sp;
  }
  /* prisma/silinder dengan sumbu ke +x (rt = radius di sisi +x) */
  function hexCyl(rt,rb,len,seg,mat,open,th,sz){
    var g=new T.CylinderGeometry(rt,rb,len,seg,1,!!open,th||0);
    g.rotateZ(-PI/2);if(sz)g.scale(1,1,sz);return new T.Mesh(g,mat);
  }
  function ring(rad,tube,x,mat){var t=new T.Mesh(new T.TorusGeometry(rad,tube,8,32),mat);t.rotation.y=PI/2;t.position.x=x;return t;}
  function box(w,h,d,mat,px,py,pz){var b=new T.Mesh(new T.BoxGeometry(w,h,d),mat);b.position.set(px,py,pz);return b;}
  function strip(a,b,rad,mat){
    var d=new T.Vector3().subVectors(b,a),L=d.length(),mesh=new T.Mesh(new T.CylinderGeometry(rad,rad,L,6),mat);
    mesh.position.copy(a).addScaledVector(d,.5);mesh.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return mesh;
  }

  var root=new T.Group();root.scale.setScalar(1.12);sc.add(root);SCP3D.root=root;

  /* ukuran badan: prisma segi-6 meruncing, muka datar menghadap +z (kamera) */
  var XN=36,XA=-22,RT=7.5,RB=13.5,SZ=.7,S3=Math.sqrt(3)/2;
  function rAt(x){return RB+(RT-RB)*(x-XA)/(XN-XA);}
  function zf(x){return S3*rAt(x)*SZ;}

  /* badan utama */
  var hull=hexCyl(RT,RB,XN-XA,6,m.hull,false,PI/6,SZ);hull.position.x=(XN+XA)/2;root.add(hull);
  /* pelat muka (peta sirkuit) menempel di muka depan */
  var fe=.08,hw0=RB/2,hw1=RT/2,fg=new T.BufferGeometry();
  fg.setAttribute('position',new T.BufferAttribute(new Float32Array([XA,-hw0,zf(XA)+fe, XA,hw0,zf(XA)+fe, XN,hw1,zf(XN)+fe, XN,-hw1,zf(XN)+fe]),3));
  fg.setAttribute('uv',new T.BufferAttribute(new Float32Array([0,0, 1,0, 1,1, 0,1]),2));
  fg.setIndex([0,2,1, 0,3,2]);fg.computeVertexNormals();
  root.add(new T.Mesh(fg,m.face));
  /* cincin penguat badan */
  [-13,19].forEach(function(bx){var rr=rAt(bx)+.5,b=hexCyl(rr,rr,1.6,6,m.dark,false,PI/6,SZ);b.position.x=bx;root.add(b);});
  /* garis neon di tepi muka: magenta (+y) & cyan tipis (-y) */
  function pe(x,s){return new T.Vector3(x,s*rAt(x)/2,zf(x)+.2);}
  o.edgeMag=strip(pe(XA+2,1),pe(XN-1,1),.55,m.mag);root.add(o.edgeMag);
  root.add(strip(pe(XA+2,-1),pe(XN-1,-1),.35,m.cyan));
  /* tutup hidung + antena (LED beacon di ujung antena panjang) */
  /* dua antena kembar (panjang, tebal, ukuran LED, glow semuanya sama): atas = LED idle, bawah = LED indikator interlock */
  [[3.4,'led','led','ledGlow',0x6bff9e],[-3.4,'led2','led2','ledGlow2',0xffd666]].forEach(function(a){
    var ant=hexCyl(.4,.4,9,6,m.dark);ant.position.set(XN+4,a[0],0);root.add(ant);
    var lm=new T.Mesh(new T.SphereGeometry(1.1,12,10),m[a[2]]);lm.position.set(XN+8.8,a[0],0);root.add(lm);o[a[1]]=lm;
    var lg=sprite(a[4],15);lg.position.set(XN+8.8,a[0],3);root.add(lg);o[a[3]]=lg;
  });

  yield;   /* ---- tahap 3 selesai: badan, pelat muka, cincin, neon, antena ---- */
  /* kokpit: bezel segi-8 + kaca berisi ruang bercahaya cyan */
  var wx=1.2,tilt=Math.atan((zf(XA)-zf(XN))/(XN-XA)),wg=new T.Group();
  wg.position.set(wx,0,zf(wx));wg.rotation.y=tilt;root.add(wg);
  var bz=new T.CylinderGeometry(5.5,5.5,1.2,8,1,false,PI/8);bz.rotateX(PI/2);
  var bezel=new T.Mesh(bz,m.dark);bezel.position.z=.3;wg.add(bezel);
  var glw=new T.Mesh(new T.CircleGeometry(4.5,8,PI/8),m.room);glw.position.z=.95;wg.add(glw);   /* v22 fix: dulu 'var gl' = menimpa handle renderer bersama (var di-hoist satu scope generator) -> threeGLSize/threeWarm kena Mesh, kanvas teleskop 0x0 -> fallback 2D */
  o.winGlow=sprite(0x35f3ff,22);o.winGlow.position.z=2.2;o.winGlow.material.opacity=.4;wg.add(o.winGlow);

  /* pod kaca di kiri-kanan badan */
  [1,-1].forEach(function(s){
    var pg=new T.Group(),px=-4;pg.position.set(px,s*(rAt(px)+4.2),0);root.add(pg);
    pg.add(hexCyl(4.8,4.8,19,6,m.pod,true,0));
    pg.add(hexCyl(3.9,3.9,16,6,m.podcore,true,0));
    [-1,1].forEach(function(e){
      var cap=hexCyl(5.1,5.1,1.3,6,m.dark);cap.position.x=e*9.9;pg.add(cap);
      pg.add(ring(4.4,.28,e*8.7,e>0?m.cyan:m.mag));
    });
    pg.add(box(.7,.7,.7,m.cyan,0,0,0));
    [-1,1].forEach(function(e){pg.add(box(2.6,2.2,2.6,m.dark,e*5.2,-s*4.9,0));});   /* braket ke badan */
  });

  yield;   /* ---- tahap 4 selesai: kokpit + pod kaca ---- */
  /* blok mesin + dua thruster ion hijau */
  var EX=XA-4;
  root.add(box(8,20.5,12,m.dark,EX,0,0));
  root.add(box(.8,15,.3,m.green,EX+1.4,0,6.1));
  root.add(box(.8,20.2,.3,m.mag,EX-1.9,0,6.1));
  root.add(box(7,.6,.3,m.cyan,EX,7.5,6.1));root.add(box(7,.6,.3,m.cyan,EX,-7.5,6.1));
  o.fl=[];o.fl2=[];o.eg=[];
  var cg=new T.ConeGeometry(1,1,18,1,true);cg.translate(0,.5,0);cg.rotateZ(PI/2);   /* alas di x=0, ujung ke -x */
  [1,-1].forEach(function(s){
    var bell=hexCyl(3.0,4.3,5.5,18,m.dark);bell.position.set(EX-3.2,s*6,0);root.add(bell);
    var rg=ring(4.3,.55,EX-6,m.green);rg.position.y=s*6;root.add(rg);
    var disc=new T.Mesh(new T.CircleGeometry(3.7,20),m.ionCore);disc.rotation.y=-PI/2;disc.position.set(EX-6.2,s*6,0);root.add(disc);
    var f1=new T.Mesh(cg,m.ion),f2=new T.Mesh(cg,m.ionCore);
    f1.position.set(EX-6.4,s*6,0);f2.position.copy(f1.position);root.add(f1);root.add(f2);
    var eg=sprite(0x58ff3c,22);eg.position.set(EX-7.5,s*6,3);root.add(eg);
    o.fl.push(f1);o.fl2.push(f2);o.eg.push(eg);
  });

  yield;   /* ---- tahap 5 selesai: blok mesin + thruster ---- */
  /* cahaya: kunci hangat dari arah BH (diset tiap frame), fill cyan, rim magenta, hemisphere ungu */
  o.key=new T.DirectionalLight(0xffc88c,1.5*Math.PI);sc.add(o.key);
  o.rim=new T.DirectionalLight(0xff4fd8,1.1*Math.PI);o.rim.position.set(-60,30,-40);sc.add(o.rim);
  var fill=new T.DirectionalLight(0x40e8ff,.55*Math.PI);fill.position.set(-40,-30,60);sc.add(fill);
  sc.add(new T.HemisphereLight(0x7a5cd8,0x0a0614,.4*Math.PI));
  yield;   /* ---- tahap 6 selesai: cahaya ---- */
  SCP3D.state=2;
  if(typeof threeWarm==='function')threeWarm(r,sc,cam,function(){   /* pra-ukur: skala teleskop konstan (DPR dibatasi 2) -> res selalu resMin; cocok dgn scp3dUpdate, jadi tanpa setSize di frame pertama */
    SCP3D.res=SCP3D_CFG.resMin;threeGLSize(gl,SCP3D.res,SCP3D.res);
  },gl);   /* kompilasi shader saat idle, bukan di render pertama */
}

/* Build dipecah jadi 8 tahap (generator, yield di batas tahap), pola sama dgn dr3dBuildG (14-drone3d.js). Tiap tahap jalan satu giliran di THREE_Q lalu menunggu satu frame;
   tahap berikut di-unshift sehingga urutan antar modul tidak berubah. ?ss=0 = sinkron seperti dulu (A/B). Waktu tiap tahap (ms) -> window.__scp3dT, dicatat bench (R.scp3dT, R.ss). */
/* ?senv=1 = teleskop PAKAI env PMREM (rollback ke tampilan lama; default sejak v17: TANPA env). ?smf=N (0..1, default .45) = faktor metalness saat tanpa env. Terbaca di window.__senv / __smf, dicatat bench (R.senv, R.smf). */
var SCP3D_ENV=(function(){var on=false;try{on=/[?&]senv=1(?:&|#|$)/.test(location.search);}catch(e){}try{window.__senv=on?1:0;}catch(e2){}return on;})();
var SCP3D_MF=(function(){var f=.45;try{var m=/[?&]smf=([0-9.]+)(?:&|#|$)/.exec(location.search);if(m)f=Math.max(0,Math.min(1,parseFloat(m[1])||0));}catch(e){}try{window.__smf=f;}catch(e2){}return f;})();
var SCP3D_SLICE=(function(){var on=true;try{on=!/[?&]ss=0(?:&|#|$)/.test(location.search);}catch(e){}try{window.__ss=on?1:0;}catch(e2){}return on;})();
function scp3dDrive(it,tm){
  var t0=performance.now(),r=it.next();
  try{tm.push(Math.round(performance.now()-t0));window.__scp3dT=tm;}catch(e){}
  if(r.done)return;
  if(SCP3D_SLICE&&typeof THREE_Q!=='undefined'){
    THREE_Q.q.unshift(function(){try{scp3dDrive(it,tm);}catch(e){scp3dFail(e&&e.message||e);}});
  }else scp3dDrive(it,tm);
}
function scp3dBuild(){scp3dDrive(scp3dBuildG(),[]);}

/* ---------- per frame ---------- */
function scp3dUpdate(now,mm){
  var T=THREE,r=SCP3D.r,o=SCP3D.o,m=SCP3D.m,sc=Math.hypot(mm.a,mm.b),res=Math.max(SCP3D_CFG.resMin,Math.min(SCP3D_CFG.resMax,Math.ceil(SCP3D_CFG.half*2*sc*1.4/32)*32));
  /* selama transisi portal skala teleskop berubah .1->.95 -> res bergeser per 32px = setSize (realokasi buffer) berulang = stutter. Kunci res di nilai frame pertama transisi. */
  if(typeof WORMHOLE!=='undefined'&&WORMHOLE.busy){if(SCP3D.rl==null)SCP3D.rl=res;res=SCP3D.rl;}else SCP3D.rl=null;
  if(res!==SCP3D.res){SCP3D.res=res;threeGLSize(SCP3D.gl,res,res);}
  var TL=(typeof TELESCOPE!=='undefined')?TELESCOPE:null,mode=TL?TL.mode:'drift';

  /* arah cahaya: telescop -> Gargantua, diputar balik dari frame kanvas ke frame badan (canvas y ke bawah -> GL y ke atas) */
  var lx=0,ly=-1,fall=1;
  try{
    var bp=camBH(),vx=bp[0]-(TL&&(TL.sx||TL.sy)?TL.sx:TL.x),vy=bp[1]-(TL&&(TL.sx||TL.sy)?TL.sy:TL.y),phi=Math.atan2(mm.b,mm.a),c=Math.cos(-phi),s=Math.sin(-phi),d=Math.hypot(vx,vy)||1;
    lx=(vx*c-vy*s)/d;ly=-(vx*s+vy*c)/d;
    fall=Math.max(.3,Math.min(1.25,1.25-d/(Math.max(W,H)*.9)));
  }catch(eL){}
  o.key.position.set(lx*100,ly*100,65);o.key.intensity=1.5*Math.PI*fall;

  /* pose 3D idle: ayunan pelan (SPIN) + condong ke arah gerak (HOVER). Fase diakumulasi per detik, bukan now*rate, supaya geser slider SPIN tidak bikin pose meloncat. */
  var I=SCP3D_CFG.idle||{},cfg=(typeof TELE_CFG!=='undefined')?TELE_CFG:null,spinK=cfg&&isFinite(cfg.spin)?cfg.spin:1;
  var dtI=SCP3D.pn!=null&&now>SCP3D.pn?Math.min(.1,(now-SCP3D.pn)/1000):0;SCP3D.pn=now;
  if(SCP3D.ip==null)SCP3D.ip=now*.001;
  SCP3D.ip+=dtI*spinK;
  var ip=SCP3D.ip,amp=Math.max(.3,Math.min(1.4,.3+.7*spinK)),
      ix=.34+(I.on?I.pitch:.24)*amp*Math.sin(ip*.37),iy=.22+(I.on?I.yaw:.30)*amp*Math.sin(ip*.23),iz=(I.on?I.roll:.05)*amp*Math.sin(ip*.51);
  /* FLIP (slider Flip tab Tele): badan berguling 180° di sumbu hidung (+x) tiap ~7 s / flip, supaya sisi bawah kelihatan. 0 = tidak pernah (selalu sisi atas).
     Fase diakumulasi per detik (geser slider tidak bikin loncat); berhenti di sudut kelipatan 360° kalau slider 0. */
  var fK=(typeof TELE_CFG!=='undefined'&&isFinite(TELE_CFG.flip))?Math.max(0,TELE_CFG.flip):0;
  SCP3D.fp=(SCP3D.fp||0)+dtI*fK;
  var FC=7,fn=Math.floor(SCP3D.fp/FC),fu=Math.min(1,(SCP3D.fp-fn*FC)/FC/.3),fe=fu<.5?4*fu*fu*fu:1-Math.pow(-2*fu+2,3)/2,
      fT=fK>.01?Math.PI*(fn+fe):2*Math.PI*Math.round((SCP3D.fo||0)/(2*Math.PI));
  SCP3D.fo=(SCP3D.fo||0)+(fT-(SCP3D.fo||0))*(fK>.01?1:(1-Math.exp(-dtI*4)));
  var bk=SCP3D.bk||(SCP3D.bk={x:0,y:0,z:0,vx:0,vy:0,px:null,py:null,pt:0});
  if(I.on&&TL){
    var bx0=TL.x,by0=TL.y;
    if(bk.px==null||now<bk.pt){bk.px=bx0;bk.py=by0;bk.pt=now;}
    else if(now-bk.pt>=8){   /* kecepatan dari selisih posisi (jalan juga untuk drift, orbit, warp, dan teleskop yang dibawa pindah sektor) */
      var dv=Math.min(.1,(now-bk.pt)/1000),kv=1-Math.exp(-dv*6);
      bk.vx+=((bx0-bk.px)/dv-bk.vx)*kv;bk.vy+=((by0-bk.py)/dv-bk.vy)*kv;
      bk.px=bx0;bk.py=by0;bk.pt=now;
    }
    var sp=Math.hypot(bk.vx,bk.vy),nn=sp>.01?Math.min(1,Math.sqrt(sp/(I.ref||40))):0,ux=sp>.01?bk.vx/sp:0,uy=sp>.01?bk.vy/sp:0,
        ph2=Math.atan2(mm.b,mm.a),c2=Math.cos(-ph2),s2=Math.sin(-ph2),
        vxl=(ux*c2-uy*s2)*nn,vyl=-(ux*s2+uy*c2)*nn,   /* arah gerak di frame gambar badan (GL: y ke atas), sama seperti arah cahaya di atas */
        bb=(I.bank!=null?I.bank:.5),bs=1-Math.exp(-dtI*5);
    bk.x+=(-vyl*bb*(I.sx||1)-bk.x)*bs;bk.y+=(vxl*bb*(I.sy||1)-bk.y)*bs;bk.z+=(-vxl*bb*.3-bk.z)*bs;
  }else{bk.x*=.9;bk.y*=.9;bk.z*=.9;}
  var tl=SCP3D.tilt;   /* pose dari luar (09-wormhole.js, teleskop di dalam terowongan), rad; null = pose idle.
     Tanpa tl.k : offset euler biasa (x,y,z) ditambah ke pose idle (perilaku lama).
     Dengan tl.k (0..1): pose idle di-slerp ke pose "kamera" — yaw tl.ty (+PI/2 = hidung menjauhi kamera / dilihat dari BELAKANG, mesin hijau menghadap kita;
     -PI/2 = hidung menuju kamera / dilihat dari DEPAN), roll layar tl.tr (kokpit di atas), pitch tl.tp (mengintip dari atas supaya terasa 2.5D),
     lalu tl.x/y/z dipakai sebagai kemiringan tambahan di ruang LAYAR (lean/bank dari gerak). Pose idle = titik awal & akhir slerp, jadi keluar portal menyatu persis dgn sky. */
  var rt=SCP3D.root,qB=SCP3D._q0||(SCP3D._q0=new T.Quaternion()),qT=SCP3D._q1||(SCP3D._q1=new T.Quaternion()),qA=SCP3D._q2||(SCP3D._q2=new T.Quaternion()),eu=SCP3D._e||(SCP3D._e=new T.Euler()),ax=SCP3D._ax||(SCP3D._ax=[new T.Vector3(1,0,0),new T.Vector3(0,1,0),new T.Vector3(0,0,1)]);
  eu.set(ix,iy,iz,'XYZ');qB.setFromEuler(eu);
  qA.setFromAxisAngle(ax[2],bk.z);qB.premultiply(qA);
  qA.setFromAxisAngle(ax[1],bk.y);qB.premultiply(qA);
  qA.setFromAxisAngle(ax[0],bk.x);qB.premultiply(qA);   /* condong ke arah gerak (ruang layar) */
  qA.setFromAxisAngle(ax[0],SCP3D.fo||0);qB.premultiply(qA);   /* flip: guling di sumbu hidung */
  if(tl&&tl.k!=null){
    qT.setFromAxisAngle(ax[1],tl.ty||0);                                   /* yaw: arah hidung terhadap kamera */
    qA.setFromAxisAngle(ax[2],tl.tr||0);qT.premultiply(qA);                /* roll layar: kokpit menghadap atas */
    qA.setFromAxisAngle(ax[0],tl.tp||0);qT.premultiply(qA);                /* pitch: intip dari atas */
    qA.setFromAxisAngle(ax[2],tl.z||0);qT.premultiply(qA);                 /* bank (ruang layar) */
    qA.setFromAxisAngle(ax[1],tl.y||0);qT.premultiply(qA);                 /* belok kiri/kanan */
    qA.setFromAxisAngle(ax[0],tl.x||0);qT.premultiply(qA);                 /* condong ke depan/belakang */
    rt.quaternion.copy(qB).slerp(qT,Math.max(0,Math.min(1,tl.k)));
  }else if(tl){
    rt.rotation.set(ix+tl.x,iy+tl.y,iz+tl.z);
  }else{
    rt.quaternion.copy(qB);
  }

  /* api mesin ion: drift = tipis, orbit = sedang, warp = panjang (dua thruster, fase kedip beda) */
  var th=mode==='warp'?1:(mode==='orbit'?.35:.12),i,ph,fl,fw,gk=0;
  if(tl&&tl.k!=null){th=th+((tl.th!=null?tl.th:1)-th)*Math.max(0,Math.min(1,tl.k));gk=Math.max(0,Math.min(1,tl.k))*(tl.glow!=null?tl.glow:.7);}   /* di terowongan: mesin menyala penuh + kilau hijau lebih lebar */
  for(i=0;i<2;i++){
    ph=i*1.7;
    fl=(.2+th*20)*(1+.12*Math.sin(now*.045+ph)+.07*Math.sin(now*.11+ph*2));fw=(1.5+th*2.4)*(1+.08*Math.sin(now*.07+ph));
    o.fl[i].scale.set(fl,fw,fw);o.fl2[i].scale.set(fl*.6,fw*.38,fw*.38);
    o.eg[i].scale.set((14+th*14)*(1+gk),(14+th*14)*(1+gk),1);o.eg[i].material.opacity=Math.min(1,(.35+.65*th)*(1+.25*gk));
  }
  m.ion.opacity=.45+.35*th;m.ionCore.opacity=.35+.3*th;

  /* dua LED beacon: idle (warna panel setelan, kedip pendek) + indikator interlock (kuning / cyan / pink, merah saat LIS, padam kalau tidak ada state).
     Kecerahan keduanya disamakan: warna x (.25+.75*kedip), glow ukuran + opasitas sama. */
  var lisR=(typeof lisRed==='function')&&lisRed(now),role=(typeof TXFX!=='undefined'&&TXFX.role)?TXFX.role():null,
      ic=teIdleStep(now),nd=teIndStep(now,role,lisR),
      bkI=Math.sin(now*.006)>.6?1:.15,
      bkN=lisR?(Math.sin(now*.02)>-.2?1:.3):(.78+.22*Math.sin(now*.008)),
      cr=nd.c[0]/255,cg=nd.c[1]/255,cb=nd.c[2]/255,na=nd.a,LG=15,LO=.75;
  m.led.color.setRGB(ic[0]/255*(.25+.75*bkI),ic[1]/255*(.25+.75*bkI),ic[2]/255*(.25+.75*bkI));
  o.ledGlow.material.color.setRGB(ic[0]/255,ic[1]/255,ic[2]/255);o.ledGlow.material.opacity=bkI*LO;o.ledGlow.scale.set(LG,LG,1);
  var lv=.25+.75*bkN;
  m.led2.color.setRGB(.23+(cr*lv-.23)*na,.26+(cg*lv-.26)*na,.28+(cb*lv-.28)*na);   /* padam -> abu gelap, menyala -> warna state */
  o.ledGlow2.material.color.setRGB(cr,cg,cb);o.ledGlow2.material.opacity=bkN*LO*na;o.ledGlow2.scale.set(LG,LG,1);

  /* neon: normal = cyan/magenta; Lost-in-Space = merah berkedip; TX/RX/standby = cahaya kokpit ikut warna LED indikator */
  if(lisR){
    m.face.emissive.setRGB(1,.28,.28);m.face.emissiveIntensity=.9+.8*bkN;
    m.mag.color.setRGB(1,.18,.18);o.winGlow.material.color.setRGB(1,.3,.3);
  }else{
    m.face.emissive.setRGB(1,1,1);m.face.emissiveIntensity=1.45+.12*Math.sin(now*.003);
    m.mag.color.setRGB(1,.25,.85);
    if(role)o.winGlow.material.color.setRGB(cr,cg,cb);else o.winGlow.material.color.setRGB(.21,.95,1);
  }
  o.winGlow.material.opacity=.32+.1*Math.sin(now*.004);
  threeGLBegin(SCP3D.gl);
  r.render(SCP3D.sc,SCP3D.cam);
  if(window.__gpuP)glProbe(SCP3D.gl,'sc.sub','sc.gpu');   /* [v21] probe GPU (?bench=1&gpup=1) */
  threeGLSnap(SCP3D.gl);   /* dibagi: salin ke kanvas 2D milik teleskop, karena ghost copy di frame yang sama menggambar ulang tanpa render */
}

/* v15: ?whtele=1 menyalakan render GL teleskop selang-seling selama travel wormhole (whAlt dulu dimatikan permanen lewat '0&&'; umur cache 45ms terlalu pendek utk frame 66ms -> 150ms). */
var SCP3D_WHALT=(function(){try{var m=/[?&]whtele=([0-9]+)/.exec(location.search),v=m?parseInt(m[1],10):2;return v>=2?v:(m&&v===1?2:0);}catch(e){return 2;}})();   /* v16: DEFAULT ON, periode 2 (GL tiap 2 frame). ?whtele=0 = mati, ?whtele=3 = tiap 3 frame. Terukur di HP: zoom med 66 -> 50ms */
/* v23: throttle GL teleskop di overview/sektor saat HP lambat (FS.slow/FS.heavy). GL dirender tiap SCP3D_SLOWALT frame (default 2, fase = paritas FS.n, gantian dgn portal yg render di FS.n genap), frame lain memakai salinan 2D SCP3D.cc (posisi/rotasi/skala tetap per frame, cuma pose+cahaya 3D telat 1 frame). ?slowalt=0 mati, ?slowalt=3 tiap 3 frame. Dikecualikan: warp, wormhole.busy, belt zoom, perubahan skala >8%, cache >130 ms. Data: hemat +-6-7 ms (sc.sub+sc.gpu 13-15 ms), lihat log.txt bagian Analisis kode. */
var SCP3D_SLOWALT=(function(){try{var m=/[?&]slowalt=([0-9]+)/.exec(location.search),v=m?parseInt(m[1],10):2;return v>=2?Math.min(v,4):(m?0:2);}catch(e){return 2;}})();
/* [v24] WARM SINKRON GL teleskop pra-kapsul (07-boot preStart langkah 'sc'). Pola sama dgn pt3dWarmSync (15-portal3d): threeWarm hanya compile + render tanpa sinkron, jadi drawImage GL->2D pertama (menunggu seluruh antrean
   GPU) jatuh di frame overview awal (dump 6 Nov: teleTop 19,6 / 70,7 ms di frame 1-2). Di sini 1x scp3dUpdate lewat jalur yang sama (skala .5 -> res = resMin, cocok pra-ukur build sehingga tanpa setSize) lalu drawImage ke kanvas buangan.
   Efek samping sama dgn satu frame teleskop biasa (fase pose SCP3D.ip/pn mulai berjalan); SCP3D.last TIDAK diubah. Gagal / dilewati (potato, reduce, cfg off) -> false. ?scwf=1 = aktif (default mati sejak v25). Hasil: __warmReal.scf {ms,at}. */
/* [v25] DEFAULT MATI. Dump 7 Nov: scf 230 ms di PRE, teleTop frame 1 malah 27,7 ms (sebelumnya 19,6) dan frame 2-6 tetap 15-25 ms = tidak ada gain terukur. ?scwf=1 menyalakan lagi (A/B). */
var SCP3D_WF=(function(){var on=false;try{on=/[?&]scwf=1(?:&|#|$)/.test(location.search);}catch(e){}return on;})();
function scp3dWarmSync(stop){
  try{
    if(!SCP3D_WF||SCP3D.syncWarm||SCP3D.state!==2||!SCP3D_CFG.on||!SCP3D.r||!SCP3D.gl||document.hidden)return false;
    if((typeof IS_POTATO!=='undefined'&&IS_POTATO)||(typeof reduce!=='undefined'&&reduce))return false;
    if(stop&&stop())return false;
    SCP3D.syncWarm=1;
    var t0=performance.now();
    scp3dUpdate(t0,{a:.5,b:0,c:0,d:.5,e:0,f:0});
    var rs=SCP3D.res,cv=document.createElement('canvas');cv.width=cv.height=rs;
    cv.getContext('2d').drawImage(threeGLSrc(SCP3D.gl),0,0,rs,rs);   /* sinkron GPU->2D pertama */
    cv.width=cv.height=0;
    try{var M=window.__warmReal||(window.__warmReal={});M.scf={ms:Math.round(performance.now()-t0),at:Math.round(t0)};}catch(eM){}
    return true;
  }catch(e){return false;}
}
/* Dipanggil dari teleDrawBody() (04-render.js). true = badan 3D sudah digambar (2D dilewati); false = pakai badan 2D. */
/* [v28] ?whtc=N (1-30; default 0 = MATI) = cache render 3D teleskop di enter/exit wormhole. Latar (A/B whdbg 7 Nov, itel): `notele` menurunkan dt 3 dtk pertama sektor 133 -> 102 ms; whtele (v16, selang-seling) hanya berlaku di fase travel
   (altOK), jadi di enter/exit drawTele memaksa render GL penuh + salinan GL->2D TIAP frame (SCP3D.last=-1e9). Di sini: kalau pose 3D (tilt x/y/z/k/ty/tr/tp/th/glow) beda < N/100 rad dari render terakhir, skala masih dalam 8% (res sama), dan umur cache < 300 ms,
   gambar ulang salinan terakhir (kanvas sendiri SCP3D.tcv; posisi/skala/rotasi tetap dari transform frame ini, jadi hanya pose 3D + cahaya yang telat); selain itu render penuh seperti biasa. TIDAK menyentuh resolusi/ukuran bitmap (bukan whxdpr), tidak menyentuh jalur travel/slow-alt/belt (kanvas cc).
   Statistik: SCP3D.tcHit / SCP3D.tcMiss (dibaca bench lewat WORMHOLE.dbgInfo -> whCfg.tcH/tcM). Mulai coba ?whtc=4 (0,04 rad = 2,3 derajat), lalu 8. */
var SCP3D_WHTC=(function(){try{var m=/[?&]whtc=([0-9]+)/.exec(location.search),v=m?parseInt(m[1],10):0;return v>=1&&v<=30?v/100:0;}catch(e){return 0;}})();
function scp3dTlNear(a,b,e){
  return Math.abs((a.x||0)-(b.x||0))<e&&Math.abs((a.y||0)-(b.y||0))<e&&Math.abs((a.z||0)-(b.z||0))<e&&Math.abs((a.k||0)-(b.k||0))<e&&Math.abs((a.tr||0)-(b.tr||0))<e&&Math.abs((a.ty||0)-(b.ty||0))<e&&Math.abs((a.tp||0)-(b.tp||0))<e&&Math.abs((a.th||0)-(b.th||0))<e&&Math.abs((a.glow||0)-(b.glow||0))<e;
}
function tele3dBody(g,now){
  if(SCP3D.state===0){scp3dLoad();return false;}
  if(SCP3D.state!==2)return false;
  if(!SCP3D_CFG.on||(typeof IS_POTATO!=='undefined'&&IS_POTATO)||(typeof reduce!=='undefined'&&reduce))return false;
  try{
    var mm=g.getTransform?g.getTransform():null;
    if(!mm)return false;
    /* kapal di dalam transisi wormhole (tilt dipaksa dari 09): render GL selang-seling, frame ganjil pakai salinan 2D frame sebelumnya (posisi/skala tetap per frame, hanya pose+cahaya 3D yang 1 frame telat). SCP3D_CFG.whAlt=0 untuk mematikan. */
    var wh=SCP3D_CFG.whAlt=(SCP3D_WHALT>0)&&SCP3D.tilt&&SCP3D.altOK&&typeof WORMHOLE!=='undefined'&&WORMHOLE.busy,cache=null;   /* altOK: hanya dari fase travel (pose berubah pelan); enter/exit pose berubah cepat -> selalu render penuh */
    var bf=(typeof BELT!=='undefined'&&BELT);
    var tcOn=SCP3D_WHTC>0&&!wh&&!bf&&!!SCP3D.tilt&&typeof WORMHOLE!=='undefined'&&WORMHOLE.busy;   /* v28: enter/exit (bukan travel-altOK) */
    if(!bf)SCP3D.bz=false;
    if(bf&&SCP3D.bz&&SCP3D.cc&&SCP3D.ccRes===SCP3D.res)cache=SCP3D.cc;   /* zoom masuk dumul.html: pose kapal dibekukan (salinan 2D), tanpa update/GL */
    else if(now-SCP3D.last>3||now<SCP3D.last){   /* ghost copy di frame yang sama memakai hasil render yang sama */
      var sa=false,scl=Math.hypot(mm.a,mm.b);
      if(!wh&&!bf&&SCP3D_SLOWALT>0&&typeof FS!=='undefined'&&(FS.slow||FS.heavy)&&!(typeof WORMHOLE!=='undefined'&&WORMHOLE.busy)&&!(typeof TELESCOPE!=='undefined'&&TELESCOPE&&TELESCOPE.mode==='warp'))sa=true;   /* v23: jalur slow-alt */
      if(sa){   /* render GL cuma di frame berfase; selain itu pakai cache kalau masih valid */
        var okC=SCP3D.cc&&SCP3D.ccRes===SCP3D.res&&now>=SCP3D.ccT&&now-SCP3D.ccT<130&&SCP3D.ccSc>0&&Math.abs(scl/SCP3D.ccSc-1)<.08;
        if(okC&&(FS.n%SCP3D_SLOWALT)!==1%SCP3D_SLOWALT){cache=SCP3D.cc;SCP3D.altSk=(SCP3D.altSk|0)+1;}
      }
      if(cache){}
      else if(tcOn&&SCP3D.tcv&&SCP3D.tcRes===SCP3D.res&&SCP3D.tcTl&&now>=SCP3D.tcT&&now-SCP3D.tcT<300&&SCP3D.tcSc>0&&Math.abs(scl/SCP3D.tcSc-1)<.08&&scp3dTlNear(SCP3D.tilt,SCP3D.tcTl,SCP3D_WHTC)){cache=SCP3D.tcv;SCP3D.tcHit=(SCP3D.tcHit|0)+1;}   /* v28: pose hampir sama -> pakai salinan terakhir */
      else if(wh&&((SCP3D.whN=(SCP3D.whN||0)+1)%SCP3D_WHALT!==0)&&SCP3D.cc&&SCP3D.ccRes===SCP3D.res&&now-SCP3D.ccT<130*SCP3D_WHALT)cache=SCP3D.cc;
      else{
        SCP3D.last=now;scp3dUpdate(now,mm);
        if(tcOn){var rt=SCP3D.res,tv=SCP3D.tcv||(SCP3D.tcv=document.createElement('canvas'));if(tv.width!==rt||tv.height!==rt){tv.width=rt;tv.height=rt;}var tx=tv.getContext('2d');tx.globalCompositeOperation='copy';tx.drawImage(threeGLSrc(SCP3D.gl),0,0,rt,rt);tx.globalCompositeOperation='source-over';SCP3D.tcRes=rt;SCP3D.tcT=now;SCP3D.tcSc=scl;SCP3D.tcTl=SCP3D.tilt;SCP3D.tcMiss=(SCP3D.tcMiss|0)+1;}   /* v28: simpan render penuh utk frame berikutnya */
        if(wh||bf||sa){var rs=SCP3D.res,cc=SCP3D.cc||(SCP3D.cc=document.createElement('canvas'));if(cc.width!==rs||cc.height!==rs){cc.width=rs;cc.height=rs;}var cx=cc.getContext('2d');cx.globalCompositeOperation='copy';cx.drawImage(threeGLSrc(SCP3D.gl),0,0,rs,rs);cx.globalCompositeOperation='source-over';SCP3D.ccRes=rs;SCP3D.ccT=now;SCP3D.ccSc=scl;if(bf)SCP3D.bz=true;if(sa)cache=cc;}   /* sa: gambar dari cc (satu baca GL saja per frame render) */
      }
    }
    g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
    var H=SCP3D_CFG.half;
    if(!(window.__offB&&window.__offB.sc))g.drawImage(cache||threeGLSrc(SCP3D.gl),-H,-H,H*2,H*2);   /* ?off=scb (21-bench): lewati blit saja, GL tetap dirender */
    return true;
  }catch(e){
    scp3dFail(e&&e.message||e);
    return false;
  }
}
try{scp3dLoad();}catch(eS3L){}   /* mulai muat lebih awal supaya tidak ada "pop" dari 2D ke 3D di tengah sesi */
