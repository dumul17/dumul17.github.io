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
  lib:(typeof AST3D_CFG!=='undefined'&&AST3D_CFG.lib)||'dumul-js/obs/lib/three.min.js?v=1',   /* path + ?v= harus sama dgn SHELL service-worker */
  half:64,       /* kotak gambar -half..half (satuan lokal teleDrawBody) */
  resMin:128,resMax:384,
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
  if(typeof THREE!=='undefined'&&THREE.REVISION){go();return;}
  /* three.min.js bisa lagi dimuat 12-ast3d.js: jangan dobel, cukup tunggu sampai THREE ada */
  var src=SCP3D_CFG.lib,has=false,ss=document.getElementsByTagName('script'),i;
  for(i=0;i<ss.length;i++){if((ss[i].getAttribute('src')||'')===src){has=true;break;}}
  if(!has){
    var s=document.createElement('script');
    s.src=src;s.async=true;s.onerror=function(){scp3dFail('gagal muat '+src);};
    document.head.appendChild(s);
  }
  var tries=0,iv=setInterval(function(){
    if(typeof THREE!=='undefined'&&THREE.REVISION){clearInterval(iv);go();}
    else if(++tries>80){clearInterval(iv);scp3dFail('timeout menunggu three.js');}
  },150);
}

/* ---------- tekstur kecil (canvas 2D) ---------- */
function scp3dCanvas(w,h){var c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function scp3dTex(c,srgb){var t=new THREE.CanvasTexture(c);if(srgb!==false)t.encoding=THREE.sRGBEncoding;t.anisotropy=2;return t;}

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
    var pm=new T.PMREMGenerator(r),rt=pm.fromScene(sc,.02);pm.dispose();
    return rt.texture;
  }catch(e){return null;}
}

/* ---------- model pesawat ---------- */
function scp3dBuild(){
  var T=THREE,cv=document.createElement('canvas');
  var r=new T.WebGLRenderer({canvas:cv,alpha:true,antialias:true,premultipliedAlpha:true,powerPreference:'low-power',preserveDrawingBuffer:false});
  r.setClearColor(0x000000,0);
  r.outputEncoding=T.sRGBEncoding;r.toneMapping=T.ACESFilmicToneMapping;r.toneMappingExposure=1.0;
  cv.addEventListener('webglcontextlost',function(e){e.preventDefault();scp3dFail('webglcontextlost');},false);
  SCP3D.r=r;
  var sc=new T.Scene(),H=SCP3D_CFG.half;
  var cam=new T.OrthographicCamera(-H,H,H,-H,-300,300);cam.position.set(0,0,100);cam.lookAt(0,0,0);
  SCP3D.sc=sc;SCP3D.cam=cam;
  var env=scp3dEnv(r),m=SCP3D.m,o=SCP3D.o,DS=T.DoubleSide,PI=Math.PI;
  var face=scp3dFaceTex();
  m.hull=new T.MeshStandardMaterial({color:0x44505c,metalness:.6,roughness:.5,flatShading:true,envMap:env,envMapIntensity:.8});
  m.face=new T.MeshStandardMaterial({map:face.map,emissiveMap:face.emi,emissive:0xffffff,emissiveIntensity:1.45,metalness:.5,roughness:.55,envMap:env,envMapIntensity:.9,side:DS});
  m.dark=new T.MeshStandardMaterial({color:0x2b333c,metalness:.8,roughness:.42,envMap:env,envMapIntensity:1.0,side:DS});
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

  /* kokpit: bezel segi-8 + kaca berisi ruang bercahaya cyan */
  var wx=1.2,tilt=Math.atan((zf(XA)-zf(XN))/(XN-XA)),wg=new T.Group();
  wg.position.set(wx,0,zf(wx));wg.rotation.y=tilt;root.add(wg);
  var bz=new T.CylinderGeometry(5.5,5.5,1.2,8,1,false,PI/8);bz.rotateX(PI/2);
  var bezel=new T.Mesh(bz,m.dark);bezel.position.z=.3;wg.add(bezel);
  var gl=new T.Mesh(new T.CircleGeometry(4.5,8,PI/8),m.room);gl.position.z=.95;wg.add(gl);
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

  /* cahaya: kunci hangat dari arah BH (diset tiap frame), fill cyan, rim magenta, hemisphere ungu */
  o.key=new T.DirectionalLight(0xffc88c,1.5);sc.add(o.key);
  o.rim=new T.DirectionalLight(0xff4fd8,1.1);o.rim.position.set(-60,30,-40);sc.add(o.rim);
  var fill=new T.DirectionalLight(0x40e8ff,.55);fill.position.set(-40,-30,60);sc.add(fill);
  sc.add(new T.HemisphereLight(0x7a5cd8,0x0a0614,.4));
  SCP3D.state=2;
  if(typeof threeWarm==='function')threeWarm(r,sc,cam,function(){   /* pra-ukur: skala teleskop konstan (DPR dibatasi 2) -> res selalu resMin; cocok dgn scp3dUpdate, jadi tanpa setSize di frame pertama */
    SCP3D.res=SCP3D_CFG.resMin;r.setPixelRatio(1);r.setSize(SCP3D.res,SCP3D.res,false);
  });   /* kompilasi shader saat idle, bukan di render pertama */
}

/* ---------- per frame ---------- */
function scp3dUpdate(now,mm){
  var T=THREE,r=SCP3D.r,o=SCP3D.o,m=SCP3D.m,sc=Math.hypot(mm.a,mm.b),res=Math.max(SCP3D_CFG.resMin,Math.min(SCP3D_CFG.resMax,Math.ceil(SCP3D_CFG.half*2*sc*1.4/32)*32));
  /* selama transisi portal skala teleskop berubah .1->.95 -> res bergeser per 32px = setSize (realokasi buffer) berulang = stutter. Kunci res di nilai frame pertama transisi. */
  if(typeof WORMHOLE!=='undefined'&&WORMHOLE.busy){if(SCP3D.rl==null)SCP3D.rl=res;res=SCP3D.rl;}else SCP3D.rl=null;
  if(res!==SCP3D.res){SCP3D.res=res;r.setPixelRatio(1);r.setSize(res,res,false);}
  var TL=(typeof TELESCOPE!=='undefined')?TELESCOPE:null,mode=TL?TL.mode:'drift';

  /* arah cahaya: telescop -> Gargantua, diputar balik dari frame kanvas ke frame badan (canvas y ke bawah -> GL y ke atas) */
  var lx=0,ly=-1,fall=1;
  try{
    var bp=camBH(),vx=bp[0]-(TL&&(TL.sx||TL.sy)?TL.sx:TL.x),vy=bp[1]-(TL&&(TL.sx||TL.sy)?TL.sy:TL.y),phi=Math.atan2(mm.b,mm.a),c=Math.cos(-phi),s=Math.sin(-phi),d=Math.hypot(vx,vy)||1;
    lx=(vx*c-vy*s)/d;ly=-(vx*s+vy*c)/d;
    fall=Math.max(.3,Math.min(1.25,1.25-d/(Math.max(W,H)*.9)));
  }catch(eL){}
  o.key.position.set(lx*100,ly*100,65);o.key.intensity=1.5*fall;

  /* pose 3D idle: ayunan pelan (SPIN) + condong ke arah gerak (HOVER). Fase diakumulasi per detik, bukan now*rate, supaya geser slider SPIN tidak bikin pose meloncat. */
  var I=SCP3D_CFG.idle||{},cfg=(typeof TELE_CFG!=='undefined')?TELE_CFG:null,spinK=cfg&&isFinite(cfg.spin)?cfg.spin:1;
  var dtI=SCP3D.pn!=null&&now>SCP3D.pn?Math.min(.1,(now-SCP3D.pn)/1000):0;SCP3D.pn=now;
  if(SCP3D.ip==null)SCP3D.ip=now*.001;
  SCP3D.ip+=dtI*spinK;
  var ip=SCP3D.ip,amp=Math.max(.3,Math.min(1.4,.3+.7*spinK)),
      ix=.34+(I.on?I.pitch:.24)*amp*Math.sin(ip*.37),iy=.22+(I.on?I.yaw:.30)*amp*Math.sin(ip*.23),iz=(I.on?I.roll:.05)*amp*Math.sin(ip*.51);
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
  r.render(SCP3D.sc,SCP3D.cam);
}

/* v15: ?whtele=1 menyalakan render GL teleskop selang-seling selama travel wormhole (whAlt dulu dimatikan permanen lewat '0&&'; umur cache 45ms terlalu pendek utk frame 66ms -> 150ms). */
var SCP3D_WHALT=(function(){try{return /[?&]whtele=1/.test(location.search)?1:0;}catch(e){return 0;}})();
/* Dipanggil dari teleDrawBody() (04-render.js). true = badan 3D sudah digambar (2D dilewati); false = pakai badan 2D. */
function tele3dBody(g,now){
  if(SCP3D.state===0){scp3dLoad();return false;}
  if(SCP3D.state!==2)return false;
  if(!SCP3D_CFG.on||(typeof IS_POTATO!=='undefined'&&IS_POTATO)||(typeof reduce!=='undefined'&&reduce))return false;
  try{
    var mm=g.getTransform?g.getTransform():null;
    if(!mm)return false;
    /* kapal di dalam transisi wormhole (tilt dipaksa dari 09): render GL selang-seling, frame ganjil pakai salinan 2D frame sebelumnya (posisi/skala tetap per frame, hanya pose+cahaya 3D yang 1 frame telat). SCP3D_CFG.whAlt=0 untuk mematikan. */
    var wh=SCP3D_CFG.whAlt=SCP3D_WHALT&&SCP3D.tilt&&SCP3D.altOK&&typeof WORMHOLE!=='undefined'&&WORMHOLE.busy,cache=null;   /* altOK: hanya dari fase travel (pose berubah pelan); enter/exit pose berubah cepat -> selalu render penuh */
    if(now-SCP3D.last>3||now<SCP3D.last){   /* ghost copy di frame yang sama memakai hasil render yang sama */
      if(wh&&((SCP3D.whN=(SCP3D.whN||0)+1)&1)&&SCP3D.cc&&SCP3D.ccRes===SCP3D.res&&now-SCP3D.ccT<150)cache=SCP3D.cc;
      else{
        SCP3D.last=now;scp3dUpdate(now,mm);
        if(wh){var rs=SCP3D.res,cc=SCP3D.cc||(SCP3D.cc=document.createElement('canvas'));if(cc.width!==rs||cc.height!==rs){cc.width=rs;cc.height=rs;}var cx=cc.getContext('2d');cx.globalCompositeOperation='copy';cx.drawImage(SCP3D.r.domElement,0,0,rs,rs);cx.globalCompositeOperation='source-over';SCP3D.ccRes=rs;SCP3D.ccT=now;}
      }
    }
    g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
    var H=SCP3D_CFG.half;
    g.drawImage(cache||SCP3D.r.domElement,-H,-H,H*2,H*2);
    return true;
  }catch(e){
    scp3dFail(e&&e.message||e);
    return false;
  }
}
try{scp3dLoad();}catch(eS3L){}   /* mulai muat lebih awal supaya tidak ada "pop" dari 2D ke 3D di tengah sesi */
