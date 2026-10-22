'use strict';
/* 14-drone3d.js — drone TX/RX jadi quadcopter 3D (Three.js r128, dimuat LAZY, memakai three.min.js yang sama dengan 12-ast3d.js / 13-scope3d.js).
   Cara kerja: sama seperti 13-scope3d.js. Satu WebGL renderer offscreen kecil merender SATU drone, hasilnya di-drawImage ke canvas 2D
   di posisi yang dihitung TXFX (08-tx-drone.js): terbang teleskop -> target, orbit, balik, hold, trail, tether, label, semua tetap 2D & tidak berubah.
   Layer ini cuma menggantikan ISI drawDrone() lewat drone3dDraw(). Gagal apa pun -> return false -> drone 2D lama dipakai lagi.
   Model (mengikuti gambar referensi): badan navy membulat + gimbal kamera di depan, 4 lengan diagonal berstrip LED, 4 motor + baling-baling
   yang berputar (blur = 2 bayangan + cakram tembus pandang + cincin), 4 kaki pendek. Warna LED/cakram/rim = warna interlock sektor (param col dari TXFX:
   kuning/pink/cyan/netral), jadi TX & RX tetap kebaca dari warnanya.
   Gerak: badan menghadap arah terbang (halus), condong ke depan sesuai kecepatan (terbang jauh = condong, orbit = condong tipis), melayang naik-turun pelan.
   Cahaya: kunci hangat dari arah Gargantua (sama seperti batu & teleskop) + rim magenta + fill cyan + hemisphere ungu (palet teleskop). Badan baja gelap ala teleskop; LED/cakram tetap warna interlock.
   Dilewati (-> 2D): potato, reduce motion, perf-tier-0, WebGL mati / context lost / file nggak termuat.
   Matikan: ?drone3d=0 di URL atau localStorage dumul_drone3d=0. Ukuran di layar: DR3D_CFG.size (px, sebelum skala sc dari TXFX). */
var DR3D_CFG={
  on:true,
  lib:(typeof AST3D_CFG!=='undefined'&&AST3D_CFG.lib)||'dumul-js/obs/lib/three.min.js?v=1',   /* path + ?v= harus sama dgn SHELL service-worker */
  size:17,        /* sisi kotak gambar di layar (px) untuk sc=1; drone ~ memenuhi kotak ini */
  half:17,        /* setengah lebar kamera ortho (satuan model) */
  resMin:96,resMax:128
};
try{
  if(/[?&]drone3d=0(&|$)/.test(location.search)||localStorage.getItem('dumul_drone3d')==='0')DR3D_CFG.on=false;
}catch(eD3){}
var DR3D={state:0,/* 0 belum, 1 memuat, 2 siap, 3 gagal/nonaktif */r:null,sc:null,cam:null,yaw:null,lean:null,mdl:null,res:0,err:'',m:{},o:{},
  px:0,py:0,pt:0,vx:0,vy:0,yawA:0,hasV:false,lastNow:-1,lastCol:'',ar:.43,ag:.9,ab:1};

function dr3dFail(why){DR3D.state=3;DR3D.err=String(why||'');try{console.warn('[drone3d] fallback ke drone 2D:',DR3D.err);}catch(e){}}

function dr3dLoad(){
  if(DR3D.state!==0)return;
  if(!DR3D_CFG.on){DR3D.state=3;DR3D.err='off';return;}
  DR3D.state=1;
  var go=function(){try{dr3dBuild();}catch(e){dr3dFail(e&&e.message||e);}};
  if(typeof THREE!=='undefined'&&THREE.REVISION){go();return;}
  /* three.min.js bisa lagi dimuat 12-ast3d.js / 13-scope3d.js: jangan dobel, cukup tunggu sampai THREE ada */
  var src=DR3D_CFG.lib,has=false,ss=document.getElementsByTagName('script'),i;
  for(i=0;i<ss.length;i++){if((ss[i].getAttribute('src')||'')===src){has=true;break;}}
  if(!has){
    var s=document.createElement('script');
    s.src=src;s.async=true;s.onerror=function(){dr3dFail('gagal muat '+src);};
    document.head.appendChild(s);
  }
  var tries=0,iv=setInterval(function(){
    if(typeof THREE!=='undefined'&&THREE.REVISION){clearInterval(iv);go();}
    else if(++tries>80){clearInterval(iv);dr3dFail('timeout menunggu three.js');}
  },150);
}

/* ---------- model ---------- */
function dr3dBuild(){
  var T=THREE,cv=document.createElement('canvas'),PI=Math.PI,DS=T.DoubleSide;
  var r=new T.WebGLRenderer({canvas:cv,alpha:true,antialias:true,premultipliedAlpha:true,powerPreference:'low-power',preserveDrawingBuffer:false});
  r.setClearColor(0x000000,0);
  r.outputEncoding=T.sRGBEncoding;r.toneMapping=T.ACESFilmicToneMapping;r.toneMappingExposure=1.05;
  cv.addEventListener('webglcontextlost',function(e){e.preventDefault();dr3dFail('webglcontextlost');},false);
  DR3D.r=r;
  var sc=new T.Scene(),R=DR3D_CFG.half,cam=new T.OrthographicCamera(-R,R,R,-R,-200,200);
  cam.position.set(0,70,52);cam.lookAt(0,0,0);   /* dari atas-depan (~53°), seperti gambar referensi */
  DR3D.sc=sc;DR3D.cam=cam;
  var m=DR3D.m,o=DR3D.o;
  m.shell=new T.MeshStandardMaterial({color:0x44505c,metalness:.6,roughness:.5});
  m.belly=new T.MeshStandardMaterial({color:0x2b333c,metalness:.8,roughness:.42});
  m.arm=new T.MeshStandardMaterial({color:0x2b333c,metalness:.8,roughness:.42,flatShading:true});
  m.motor=new T.MeshStandardMaterial({color:0x07090c,metalness:.5,roughness:.5});
  m.cap=new T.MeshStandardMaterial({color:0x74818c,metalness:.7,roughness:.35});
  m.blade=new T.MeshStandardMaterial({color:0x07090c,metalness:.3,roughness:.6,side:DS});
  m.black=new T.MeshStandardMaterial({color:0x05080c,metalness:.3,roughness:.4});
  m.acc=new T.MeshBasicMaterial({color:0x6ee5ff,toneMapped:false});
  m.g1=new T.MeshBasicMaterial({color:0x6ee5ff,transparent:true,opacity:.30,depthWrite:false,toneMapped:false,side:DS});
  m.g2=new T.MeshBasicMaterial({color:0x6ee5ff,transparent:true,opacity:.14,depthWrite:false,toneMapped:false,side:DS});
  m.disc=new T.MeshBasicMaterial({color:0x6ee5ff,transparent:true,opacity:.13,depthWrite:false,blending:T.AdditiveBlending,side:DS,toneMapped:false});
  m.ring=new T.MeshBasicMaterial({color:0x6ee5ff,transparent:true,opacity:.30,depthWrite:false,blending:T.AdditiveBlending,side:DS,toneMapped:false});

  function box(w,h,d,mat,x,y,z){var b=new T.Mesh(new T.BoxGeometry(w,h,d),mat);b.position.set(x,y,z);return b;}
  function strip(a,b,rad,mat){   /* silinder dari titik a ke b */
    var d=new T.Vector3().subVectors(b,a),L=d.length(),mesh=new T.Mesh(new T.CylinderGeometry(rad,rad,L,8),mat);
    mesh.position.copy(a).addScaledVector(d,.5);mesh.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return mesh;
  }
  var V=function(x,y,z){return new T.Vector3(x,y,z);};

  var yaw=new T.Group(),lean=new T.Group(),mdl=new T.Group();
  sc.add(yaw);yaw.add(lean);lean.add(mdl);
  DR3D.yaw=yaw;DR3D.lean=lean;DR3D.mdl=mdl;

  /* badan: cangkang membulat + perut gelap + pelat atas; hidung = -z (kamera gimbal), ekor = +z */
  var shell=new T.Mesh(new T.SphereGeometry(1,24,16),m.shell);shell.scale.set(3.2,1.55,4.7);mdl.add(shell);
  mdl.add(box(4.6,1.0,6.4,m.belly,0,-1.0,.2));
  mdl.add(box(1.7,.22,3.4,m.cap,0,1.52,.3));
  mdl.add(box(1.3,.34,.3,m.acc,0,.2,4.62));   /* lampu belakang */
  /* gimbal kamera */
  mdl.add(box(1.3,.6,1.3,m.black,0,-.4,-3.7));
  var gim=new T.Mesh(new T.SphereGeometry(1.05,16,12),m.black);gim.position.set(0,-1.0,-4.2);mdl.add(gim);
  var lens=new T.Mesh(new T.SphereGeometry(.4,10,8),m.acc);lens.position.set(0,-1.0,-5.1);mdl.add(lens);

  /* 4 lengan + motor + baling-baling + kaki */
  var MX=7.4,MZ=6.6,PY=1.75;
  o.props=[];
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(c,i){
    var sx=c[0],sz=c[1];
    mdl.add(strip(V(sx*2.2,0,sz*1.8),V(sx*MX,.3,sz*MZ),.62,m.arm));
    mdl.add(strip(V(sx*3.0,.66,sz*2.5),V(sx*(MX-1.7),.82,sz*(MZ-1.5)),.2,m.acc));   /* strip LED di lengan */
    var mo=new T.Mesh(new T.CylinderGeometry(1.4,1.4,1.7,18),m.motor);mo.position.set(sx*MX,.3,sz*MZ);mdl.add(mo);
    var cap=new T.Mesh(new T.CylinderGeometry(.9,.9,.45,14),m.cap);cap.position.set(sx*MX,1.3,sz*MZ);mdl.add(cap);
    /* baling-baling: satu bilah + 2 bayangan (blur gerak) dalam satu group yang diputar */
    var pg=new T.Group();pg.position.set(sx*MX,PY,sz*MZ);mdl.add(pg);
    var bl=new T.BoxGeometry(11.6,.14,1.25);
    pg.add(new T.Mesh(bl,m.blade));
    var b1=new T.Mesh(bl,m.g1);b1.rotation.y=-.55;pg.add(b1);
    var b2=new T.Mesh(bl,m.g2);b2.rotation.y=-1.1;pg.add(b2);
    var hub=new T.Mesh(new T.CylinderGeometry(.45,.45,.5,10),m.cap);pg.add(hub);
    var dg=new T.CircleGeometry(5.9,30);dg.rotateX(-PI/2);
    var disc=new T.Mesh(dg,m.disc);disc.position.set(sx*MX,PY+.05,sz*MZ);mdl.add(disc);
    var rg=new T.RingGeometry(5.35,5.95,36);rg.rotateX(-PI/2);
    var ring=new T.Mesh(rg,m.ring);ring.position.set(sx*MX,PY+.04,sz*MZ);mdl.add(ring);
    o.props.push({g:pg,dir:((sx*sz)>0?1:-1),ph:i*1.3});
    /* kaki */
    mdl.add(strip(V(sx*MX*.95,-.4,sz*MZ*.95),V(sx*(MX+.9),-3.3,sz*(MZ+.8)),.28,m.arm));
  });

  /* cahaya */
  o.key=new T.DirectionalLight(0xffc88c,1.4);o.key.position.set(0,45,60);sc.add(o.key);
  o.rim=new T.DirectionalLight(0xff4fd8,1.1);o.rim.position.set(-30,40,-55);sc.add(o.rim);
  o.hemi=new T.HemisphereLight(0x7a5cd8,0x0a0614,.4);sc.add(o.hemi);
  o.fill=new T.DirectionalLight(0x40e8ff,.55);o.fill.position.set(-40,-30,60);sc.add(o.fill);   /* fill cyan seperti teleskop */
  DR3D.state=2;
}

/* ---------- per frame ---------- */
function dr3dAngDiff(a,b){var d=(b-a)%6.283185;if(d>3.141593)d-=6.283185;if(d<-3.141593)d+=6.283185;return d;}

function dr3dUpdate(now,x,y,col){
  var T=THREE,r=DR3D.r,o=DR3D.o,m=DR3D.m,sc=DR3D.sc;
  /* resolusi render mengikuti ukuran di layar */
  var res=Math.max(DR3D_CFG.resMin,Math.min(DR3D_CFG.resMax,Math.ceil(DR3D_CFG.size*(DR3D.scale||1)*Math.min(2,DPR||1)*1.2/32)*32));
  if(res!==DR3D.res){DR3D.res=res;r.setPixelRatio(1);r.setSize(res,res,false);}

  /* kecepatan (px/ms) dari posisi frame sebelumnya; loncatan/jeda panjang = reset */
  var dt=now-DR3D.pt,vx=0,vy=0,sp=0;
  if(DR3D.pt>0&&dt>0&&dt<120&&Math.abs(x-DR3D.px)+Math.abs(y-DR3D.py)<90){
    var k=1-Math.exp(-dt/90);
    DR3D.vx+=((x-DR3D.px)/dt-DR3D.vx)*k;DR3D.vy+=((y-DR3D.py)/dt-DR3D.vy)*k;
  }else{DR3D.vx=0;DR3D.vy=0;}
  DR3D.px=x;DR3D.py=y;DR3D.pt=now;
  vx=DR3D.vx;vy=DR3D.vy;sp=Math.hypot(vx,vy);

  /* menghadap arah terbang (hidung = -z; layar x -> dunia x, layar y -> dunia z) */
  if(sp>.012){
    var tgt=Math.atan2(-vx,-vy);
    if(!DR3D.hasV){DR3D.yawA=tgt;DR3D.hasV=true;}
    else DR3D.yawA+=dr3dAngDiff(DR3D.yawA,tgt)*(1-Math.exp(-Math.min(60,dt||16)/140));
  }
  DR3D.yaw.rotation.y=DR3D.yawA;
  /* condong ke depan: terbang jauh = condong, orbit = tipis; plus melayang pelan */
  var ln=Math.min(.45,sp*8),tt=now*.001;
  DR3D.lean.rotation.x=-ln+.03*Math.sin(tt*1.7);
  DR3D.lean.rotation.z=.035*Math.sin(tt*1.3+.8);
  DR3D.mdl.position.y=.35*Math.sin(tt*2.1);

  /* baling-baling */
  var i,p;
  for(i=0;i<o.props.length;i++){p=o.props[i];p.g.rotation.y=(now*.06+p.ph)*p.dir;}

  /* warna interlock (col = 'r,g,b') */
  if(col!==DR3D.lastCol){
    DR3D.lastCol=col;var c=col.split(',');
    DR3D.ar=(+c[0])/255;DR3D.ag=(+c[1])/255;DR3D.ab=(+c[2])/255;
    m.acc.color.setRGB(DR3D.ar,DR3D.ag,DR3D.ab);m.g1.color.setRGB(DR3D.ar,DR3D.ag,DR3D.ab);m.g2.color.setRGB(DR3D.ar,DR3D.ag,DR3D.ab);
    m.disc.color.setRGB(DR3D.ar,DR3D.ag,DR3D.ab);m.ring.color.setRGB(DR3D.ar,DR3D.ag,DR3D.ab);
  }
  /* lampu berkedip pelan (sama seperti titik putih 2D) */
  m.acc.color.setRGB(DR3D.ar*(.7+.3*(now%700<350?1:.4)),DR3D.ag*(.7+.3*(now%700<350?1:.4)),DR3D.ab*(.7+.3*(now%700<350?1:.4)));

  /* kunci hangat dari arah Gargantua */
  try{
    var bp=camBH(),dx=bp[0]-x,dy=bp[1]-y,d=Math.hypot(dx,dy)||1,fall=Math.max(.3,Math.min(1.25,1.25-d/(Math.max(W,H)*.9)));
    o.key.position.set(dx/d*60,45,dy/d*60);o.key.intensity=1.4*fall;
  }catch(eL){}
  r.render(sc,DR3D.cam);
}

/* Dipanggil dari drawDrone() (08-tx-drone.js). true = drone 3D sudah digambar (2D dilewati); false = pakai drone 2D. */
function drone3dDraw(g,x,y,col,a,now,sc){
  if(DR3D.state===0){dr3dLoad();return false;}
  if(DR3D.state!==2)return false;
  if(!DR3D_CFG.on||(typeof IS_POTATO!=='undefined'&&IS_POTATO)||(typeof reduce!=='undefined'&&reduce))return false;
  if(document.body&&document.body.classList.contains('perf-tier-0'))return false;
  try{
    DR3D.scale=sc||1;
    if(now!==DR3D.lastNow){DR3D.lastNow=now;dr3dUpdate(now,x,y,col);}
    var S=DR3D_CFG.size*(sc||1);
    g.save();
    /* halo lembut di bawah (sama seperti 2D) supaya drone gelap tetap kebaca di langit hitam */
    g.fillStyle='rgba('+col+','+(.10*a)+')';g.beginPath();g.arc(x,y,S*.30,0,6.283);g.fill();
    g.fillStyle='rgba('+col+','+(.14*a)+')';g.beginPath();g.arc(x,y,S*.17,0,6.283);g.fill();
    g.globalAlpha=a>1?1:(a<0?0:a);
    g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
    g.drawImage(DR3D.r.domElement,x-S/2,y-S/2,S,S);
    g.restore();
    return true;
  }catch(e){
    try{g.restore();}catch(e2){}
    dr3dFail(e&&e.message||e);
    return false;
  }
}
try{dr3dLoad();}catch(eD3L){}   /* mulai muat lebih awal supaya tidak ada "pop" dari 2D ke 3D di tengah sesi */
