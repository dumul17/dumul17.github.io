'use strict';
/* 14-drone3d.js — drone TX/RX jadi drone BOLA 3D (Three.js r128, dimuat LAZY, memakai three.min.js yang sama dengan 12-ast3d.js / 13-scope3d.js).
   Cara kerja: sama seperti 13-scope3d.js. Satu WebGL renderer offscreen kecil merender SATU drone, hasilnya di-drawImage ke canvas 2D
   di posisi yang dihitung TXFX (08-tx-drone.js): terbang teleskop -> target, orbit, balik, hold, trail, tether, label, semua tetap 2D & tidak berubah.
   Layer ini cuma menggantikan ISI drawDrone() lewat drone3dDraw(). Gagal apa pun -> return false -> drone 2D lama dipakai lagi.
   Model (mengikuti foto referensi drone bola): badan bola baja gelap berpanel + paku-paku kecil di sekelilingnya; muka depan (hidung = -z) cekung dengan
   cincin, 8 jari-jari neon yang berputar pelan, dan cincin segi-6 di tengah; baris kancing cyan + dua lampu atas; di tiap sisi: 2 sirip tegak bergaris,
   2 sayap sapu (bentuk X) bergaris magenta, 2 pod roket, as + ujung runcing; di bawah: 2 tabung thruster bergaris + kabel selang.
   Warna = palet teleskop (13-scope3d.js): baja 0x44505c / gelap 0x2b333c, neon cyan, magenta, aksen oranye, thruster ion hijau.
   Jari-jari depan = warna interlock sektor (param col dari TXFX: kuning/pink/netral) supaya TX & RX tetap kebaca dari warnanya.
   Gerak (santuy): badan menghadap arah terbang dengan tolehan lambat, condong tipis sesuai kecepatan, melayang naik-turun pelan, jari-jari muka berputar pelan,
   api thruster berdenyut halus.
   Cahaya: kunci hangat dari arah Gargantua (sama seperti batu & teleskop) + rim magenta + fill cyan + hemisphere ungu + env kecil dari 13-scope3d.js (kalau ada).
   Dilewati (-> 2D): potato, reduce motion, perf-tier-0, WebGL mati / context lost / file nggak termuat.
   Matikan: ?drone3d=0 di URL atau localStorage dumul_drone3d=0. Ukuran di layar: DR3D_CFG.size (px, sebelum skala sc dari TXFX). */
var DR3D_CFG={
  on:true,
  lib:(typeof AST3D_CFG!=='undefined'&&AST3D_CFG.lib)||'dumul-js/obs/lib/three.min.js?v=1',   /* path + ?v= harus sama dgn SHELL service-worker */
  size:30,        /* sisi kotak gambar di layar (px) untuk sc=1; drone ~ memenuhi kotak ini. Kelipatan 5 supaya kena snap slider panel tuning (dulu 28) */
  half:15,        /* setengah lebar kamera ortho (satuan model) */
  resMin:128,resMax:160,
  /* knob tuning (tab Drone di panel owl; 1 = perilaku asli, ini = DEFAULT): */
  spin:1,         /* kecepatan putar jari-jari muka */
  bob:1,          /* amplitudo melayang naik-turun + goyang badan */
  lean:1,         /* seberapa condong ke depan saat terbang */
  flame:1,        /* panjang api thruster */
  turn:1,         /* kecepatan nolehnya badan ke arah terbang (>1 = lebih sigap) */
  light:1,        /* pengali semua lampu (kunci hangat, rim, fill, hemisphere) */
  halo:1,         /* pengali halo lembut 2D di bawah drone */
  swayK:1,        /* pengali bob + lean sekaligus (satu slider 'Sway' di panel tuning; 1 = apa adanya, 0 = diam) */
  glowK:1         /* pengali light + halo sekaligus (satu slider 'Glow' di panel tuning) */
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

/* tekstur badan: baja berpanel (garis bujur/lintang) + baret + sedikit karat oranye, seperti badan teleskop */
function dr3dBodyTex(){
  var c=document.createElement('canvas');c.width=256;c.height=128;
  var x=c.getContext('2d'),i,seed=11;
  function rnd(){seed=(seed*16807)%2147483647;return seed/2147483647;}
  var gr=x.createLinearGradient(0,0,0,128);gr.addColorStop(0,'#6b7886');gr.addColorStop(.5,'#4a5662');gr.addColorStop(1,'#343e48');
  x.fillStyle=gr;x.fillRect(0,0,256,128);
  for(i=0;i<=16;i++){x.fillStyle='rgba(10,14,18,.62)';x.fillRect(i*16-1,0,2,128);x.fillStyle='rgba(190,205,215,.16)';x.fillRect(i*16+1,0,1,128);}
  for(i=1;i<8;i++){x.fillStyle='rgba(10,14,18,.55)';x.fillRect(0,i*16-1,256,2);x.fillStyle='rgba(190,205,215,.14)';x.fillRect(0,i*16+1,256,1);}
  for(i=0;i<34;i++){x.strokeStyle='rgba(205,215,225,'+(.06+rnd()*.12).toFixed(2)+')';x.lineWidth=1;x.beginPath();var sx=rnd()*256,sy=rnd()*128;x.moveTo(sx,sy);x.lineTo(sx+rnd()*18-9,sy+rnd()*8-4);x.stroke();}
  for(i=0;i<16;i++){x.fillStyle='rgba('+(150+(rnd()*50|0))+','+(70+(rnd()*40|0))+',30,'+(.2+rnd()*.3).toFixed(2)+')';x.fillRect(rnd()*256,rnd()*128,3+rnd()*9,2+rnd()*6);}
  var t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=2;return t;
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
  var env=null;try{if(typeof scp3dEnv==='function')env=scp3dEnv(r);}catch(eE){env=null;}   /* env pantulan yang sama dgn teleskop (kalau 13-scope3d.js ada) */
  var ei=env?.8:0;
  /* palet teleskop */
  m.hull=new T.MeshStandardMaterial({map:dr3dBodyTex(),color:0xffffff,metalness:.6,roughness:.5,envMap:env,envMapIntensity:ei});
  m.recess=new T.MeshStandardMaterial({color:0x1b2229,metalness:.7,roughness:.45,envMap:env,envMapIntensity:ei});
  m.dark=new T.MeshStandardMaterial({color:0x2b333c,metalness:.8,roughness:.42,side:DS,envMap:env,envMapIntensity:ei*1.2});
  m.steel=new T.MeshStandardMaterial({color:0x44505c,metalness:.6,roughness:.5,side:DS,envMap:env,envMapIntensity:ei});
  m.cap=new T.MeshStandardMaterial({color:0x74818c,metalness:.7,roughness:.35,envMap:env,envMapIntensity:ei});
  m.black=new T.MeshStandardMaterial({color:0x07090c,metalness:.2,roughness:.8,side:DS});
  m.acc=new T.MeshBasicMaterial({color:0x6ee5ff,toneMapped:false});          /* warna interlock (jari-jari muka) */
  m.cyan=new T.MeshBasicMaterial({color:0x35f3ff,toneMapped:false});
  m.mag=new T.MeshBasicMaterial({color:0xff3fd8,toneMapped:false,side:DS});
  m.orange=new T.MeshBasicMaterial({color:0xffa030,toneMapped:false,side:DS});
  m.ion=new T.MeshBasicMaterial({color:0x1fe81a,toneMapped:false,transparent:true,opacity:.8,depthWrite:false,blending:T.AdditiveBlending,side:DS});
  m.ionCore=new T.MeshBasicMaterial({color:0x9dff7a,toneMapped:false,transparent:true,opacity:.85,depthWrite:false,blending:T.AdditiveBlending,side:DS});

  var V=function(x,y,z){return new T.Vector3(x,y,z);};
  function mk(geo,mat,x,y,z){var s=new T.Mesh(geo,mat);s.position.set(x||0,y||0,z||0);return s;}
  function strip(a,b,rad,mat){   /* silinder dari titik a ke b */
    var d=new T.Vector3().subVectors(b,a),L=d.length(),mesh=new T.Mesh(new T.CylinderGeometry(rad,rad,L,8),mat);
    mesh.position.copy(a).addScaledVector(d,.5);mesh.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return mesh;
  }

  var yaw=new T.Group(),lean=new T.Group(),mdl=new T.Group();
  sc.add(yaw);yaw.add(lean);lean.add(mdl);
  DR3D.yaw=yaw;DR3D.lean=lean;DR3D.mdl=mdl;

  /* ===== badan bola; hidung = -z, ekor = +z ===== */
  var NR=4.2;
  function zOn(rad){return -Math.sqrt(NR*NR-rad*rad);}   /* z permukaan bola (sisi hidung) pada jarak rad dari sumbu */
  function place(mesh,dir,off,axis){   /* tempel di permukaan bola searah dir, sumbu lokal 'axis' (default +y) menghadap keluar */
    var n=dir.clone().normalize();
    mesh.position.copy(n).multiplyScalar(NR+off);
    mesh.quaternion.setFromUnitVectors(axis||V(0,1,0),n);
    mdl.add(mesh);return mesh;
  }
  mdl.add(mk(new T.SphereGeometry(NR,32,22),m.hull));

  /* muka depan: cekungan gelap + cincin + jari-jari neon (berputar) + cincin segi-6 oranye di tengah */
  var capG=new T.SphereGeometry(NR+.03,32,8,0,PI*2,0,Math.asin(2.7/NR));capG.rotateX(-PI/2);
  mdl.add(mk(capG,m.recess));
  mdl.add(mk(new T.TorusGeometry(2.75,.17,8,40),m.cap,0,0,zOn(2.75)));
  mdl.add(mk(new T.TorusGeometry(1.3,.1,8,32),m.cap,0,0,zOn(1.3)));
  var hexG=new T.CylinderGeometry(1.0,1.0,.3,6);hexG.rotateX(PI/2);
  mdl.add(mk(hexG,m.orange,0,0,zOn(1.0)-.02));
  var holeG=new T.CylinderGeometry(.55,.55,.34,18);holeG.rotateX(PI/2);
  mdl.add(mk(holeG,m.black,0,0,zOn(.55)-.06));
  var coneG=new T.ConeGeometry(.3,.7,8);coneG.rotateX(-PI/2);
  mdl.add(mk(coneG,m.cap,0,0,-4.28));
  o.spin=new T.Group();mdl.add(o.spin);
  var spG=new T.BoxGeometry(1.0,.3,.22),spX=1.85,spA=-Math.atan(spX/Math.sqrt(NR*NR-spX*spX)),i;
  for(i=0;i<8;i++){
    var sg=new T.Group();sg.rotation.z=i*PI/4;
    var sp=mk(spG,m.acc,spX,0,zOn(spX)+.02);sp.rotation.y=spA;sg.add(sp);o.spin.add(sg);
  }

  /* dua lampu oranye di atas + kancing cyan (dua baris) */
  var lampG=new T.CylinderGeometry(.7,.7,.2,16),lampR=new T.TorusGeometry(.78,.1,6,18),lx;
  for(i=0;i<2;i++){
    lx=i?-.36:.36;
    place(mk(lampG,m.orange),V(lx,.84,-.38),.02);
    place(mk(lampR,m.cap),V(lx,.84,-.38),.02,V(0,0,1));
  }
  var studG=new T.SphereGeometry(.22,8,6),a,el;
  for(a=-3;a<=3;a++){el=.62;place(mk(studG,m.cyan),V(Math.sin(a*.3)*Math.cos(el),Math.sin(el),-Math.cos(a*.3)*Math.cos(el)),.02);}
  [-1.35,-1.0,1.0,1.35].forEach(function(ph){el=.05;place(mk(studG,m.cyan),V(Math.sin(ph)*Math.cos(el),Math.sin(el),-Math.cos(ph)*Math.cos(el)),.02);});

  /* paku-paku kecil di sekeliling (sisi belakang & samping) */
  var spkG=new T.ConeGeometry(.3,1.1,6);
  [[.9,.35,.25],[-.9,.35,.25],[.75,.2,.65],[-.75,.2,.65],[.35,.85,.4],[-.35,.85,.4],[0,.6,.8],[0,.95,.2],
   [.95,-.1,-.3],[-.95,-.1,-.3],[.55,-.5,.65],[-.55,-.5,.65],[0,-.2,.98]].forEach(function(d){place(mk(spkG,m.dark),V(d[0],d[1],d[2]),.35);});

  /* ===== as + sayap + sirip + pod roket (kiri & kanan) ===== */
  mdl.add(mk((function(){var g2=new T.CylinderGeometry(.26,.26,20.4,8);g2.rotateZ(PI/2);return g2;})(),m.dark,0,0,.9));
  var finS=new T.Shape();finS.moveTo(-1.3,0);finS.lineTo(1.5,0);finS.lineTo(.9,5);finS.lineTo(.1,5.5);finS.closePath();
  var finG=new T.ExtrudeGeometry(finS,{depth:.24,bevelEnabled:false});finG.translate(0,0,-.12);finG.rotateY(PI/2);   /* shape-x -> -z dunia, tebal -> x */
  var wS=new T.Shape();wS.moveTo(0,-1.6);wS.lineTo(4.8,.4);wS.lineTo(4.8,1.6);wS.lineTo(0,2.8);wS.closePath();
  var wG=new T.ExtrudeGeometry(wS,{depth:.14,bevelEnabled:false});wG.translate(0,0,-.07);wG.rotateX(PI/2);               /* shape-y -> z dunia (negatif = depan) */
  var podG=new T.CylinderGeometry(.6,.6,3.6,12);podG.rotateX(PI/2);
  var podCone=new T.ConeGeometry(.6,1.3,12);podCone.rotateX(-PI/2);
  var bandG=new T.CylinderGeometry(.65,.65,.2,12);bandG.rotateX(PI/2);
  var eng=new T.CircleGeometry(.5,12);
  var tipG=new T.ConeGeometry(.4,2.0,8);
  var fi,k;
  [-1,1].forEach(function(sx){
    /* sirip tegak (miring keluar, menyapu ke belakang) + garis oranye */
    [[4.7,.12],[6.2,.2]].forEach(function(fp){
      var fg=new T.Group();fg.position.set(sx*fp[0],.2,1.6);fg.rotation.z=-sx*fp[1];
      fg.add(new T.Mesh(finG,m.steel));
      for(fi=0;fi<5;fi++){
        var yy=.9+fi*.9,xl=-1.3+1.4*yy/5.5,xr=1.5-.6*yy/5,w=(xr-xl)*.55;
        fg.add(mk(new T.BoxGeometry(.3,.2,w),m.orange,0,yy,-(xl+xr)/2));
      }
      mdl.add(fg);
    });
    /* sayap sapu bentuk X + garis magenta */
    [.45,-.45].forEach(function(rx){
      var wg=new T.Group();wg.position.set(sx*4.0,0,.9);wg.rotation.x=rx;wg.scale.x=sx;
      wg.add(new T.Mesh(wG,m.dark));
      for(k=0;k<4;k++){
        var wx=1.0+k*1.0,zf=-1.6+.4167*wx,zb=2.8-.25*wx;
        wg.add(mk(new T.BoxGeometry(.2,.22,(zb-zf)*.5),m.mag,wx,0,(zf+zb)/2));
      }
      mdl.add(wg);
    });
    /* ujung as runcing */
    var tp=mk(tipG,m.cap,sx*11.1,0,.9);tp.rotation.z=-sx*PI/2;mdl.add(tp);
    /* dua pod roket (satu tinggi, satu rendah) */
    [[6.3,.9],[8.0,-.9]].forEach(function(pp){
      var pg=new T.Group();pg.position.set(sx*pp[0],pp[1],.2);
      pg.add(new T.Mesh(podG,m.dark));
      pg.add(mk(podCone,m.steel,0,0,-2.45));
      pg.add(mk(bandG,m.cyan,0,0,-.6));
      pg.add(mk(eng,m.mag,0,0,1.82));
      mdl.add(pg);
    });
  });

  /* ===== dua tabung thruster di bawah + strut + kabel selang ===== */
  var legG=new T.CylinderGeometry(.85,.85,5.2,14);legG.rotateX(PI/2);
  var legCone=new T.ConeGeometry(.85,1.2,14);legCone.rotateX(-PI/2);
  var legRing=new T.CylinderGeometry(.9,.9,.16,14);legRing.rotateX(PI/2);
  var flG=new T.ConeGeometry(.6,2.2,12);flG.translate(0,1.1,0);flG.rotateX(PI/2);   /* alas di z=0, ujung ke +z (belakang) */
  var coreG=new T.CircleGeometry(.65,14);
  o.flames=[];
  [-1,1].forEach(function(sx){
    var lg=new T.Group();lg.position.set(sx*3.1,-5.2,.2);mdl.add(lg);
    lg.add(new T.Mesh(legG,m.dark));
    lg.add(mk(legCone,m.steel,0,0,-3.2));
    [-1.4,-.9,.9,1.4].forEach(function(zz){lg.add(mk(legRing,m.orange,0,0,zz));});
    lg.add(mk(coreG,m.ionCore,0,0,2.62));
    var fl=mk(flG,m.ion,0,0,2.63);lg.add(fl);o.flames.push(fl);
    mdl.add(strip(V(sx*2.3,-2.9,0),V(sx*3.1,-4.6,0),.22,m.dark));
    mdl.add(strip(V(sx*2.3,-2.9,1.4),V(sx*3.1,-4.6,1.4),.22,m.dark));
  });
  mdl.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3([V(3.1,-5.4,2.7),V(2.3,-6.9,3.5),V(.9,-5.3,3.7),V(.5,-3.8,2.3)]),14,.13,5,false),m.black));

  /* cahaya */
  o.key=new T.DirectionalLight(0xffc88c,1.4);o.key.position.set(0,45,60);sc.add(o.key);
  o.rim=new T.DirectionalLight(0xff4fd8,1.1);o.rim.position.set(-30,40,-55);sc.add(o.rim);
  o.hemi=new T.HemisphereLight(0x7a5cd8,0x0a0614,.45);sc.add(o.hemi);
  o.fill=new T.DirectionalLight(0x40e8ff,.55);o.fill.position.set(-40,-30,60);sc.add(o.fill);   /* fill cyan seperti teleskop */
  /* pra-ukur kanvas ke resolusi yang akan dipakai drone pertama (skala sama dgn 08-tx-drone.js: W<420 ? 1 : 1.15): setSize pertama = realokasi framebuffer MSAA, terukur ~detik di headless -> hitch di drone pertama */
  try{
    var sc0=(typeof W!=='undefined'&&W<420)?1:1.15,res0=Math.max(DR3D_CFG.resMin,Math.min(DR3D_CFG.resMax,Math.ceil(DR3D_CFG.size*sc0*Math.min(2,DPR||1)*1.2/32)*32));
    DR3D.res=res0;r.setPixelRatio(1);r.setSize(res0,res0,false);
  }catch(eP){}
  DR3D.state=2;
  if(typeof threeWarm==='function')threeWarm(r,sc,cam);   /* kompilasi shader saat idle, bukan di render pertama (drone pertama muncul) */
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
    var k=1-Math.exp(-dt/140);
    DR3D.vx+=((x-DR3D.px)/dt-DR3D.vx)*k;DR3D.vy+=((y-DR3D.py)/dt-DR3D.vy)*k;
  }else{DR3D.vx=0;DR3D.vy=0;}
  DR3D.px=x;DR3D.py=y;DR3D.pt=now;
  vx=DR3D.vx;vy=DR3D.vy;sp=Math.hypot(vx,vy);

  /* menghadap arah terbang, nolehnya lambat (hidung = -z; layar x -> dunia x, layar y -> dunia z) */
  if(sp>.004){
    var tgt=Math.atan2(-vx,-vy);
    if(!DR3D.hasV){DR3D.yawA=tgt;DR3D.hasV=true;}
    else DR3D.yawA+=dr3dAngDiff(DR3D.yawA,tgt)*(1-Math.exp(-Math.min(60,dt||16)*Math.max(.05,DR3D_CFG.turn)/320));
  }
  DR3D.yaw.rotation.y=DR3D.yawA;
  /* condong tipis ke depan sesuai kecepatan, melayang pelan */
  var ln=Math.min(.32,sp*6)*DR3D_CFG.lean*DR3D_CFG.swayK,tt=now*.001,bb=DR3D_CFG.bob*DR3D_CFG.swayK;
  var LD=Math.max(0,Math.min(1,DR3D.land||0)),fl=1-LD;   /* DR3D.land (diisi 08-tx-drone.js): 0 terbang ... 1 mendarat -> tidak melayang/condong */
  DR3D.lean.rotation.x=(-ln+.025*bb*Math.sin(tt*1.1))*fl;
  DR3D.lean.rotation.z=.03*bb*Math.sin(tt*.8+.8)*fl;
  DR3D.mdl.position.y=.3*bb*Math.sin(tt*1.2)*fl;

  /* jari-jari muka berputar pelan; api thruster berdenyut halus */
  o.spin.rotation.z=(DR3D.spinA=(DR3D.spinA||0)+(DR3D.spinT?Math.min(100,now-DR3D.spinT):0)*.0004*DR3D_CFG.spin);DR3D.spinT=now;   /* diintegrasi: ganti kecepatan lewat slider tidak bikin jari-jari melompat */
  var i;
  for(i=0;i<o.flames.length;i++)o.flames[i].scale.z=(.75+.18*Math.sin(now*.009+i*1.7)+ln*.8)*(1-.75*LD)*DR3D_CFG.flame;

  /* warna interlock (col = 'r,g,b') -> jari-jari muka */
  if(col!==DR3D.lastCol){
    DR3D.lastCol=col;var c=col.split(',');
    DR3D.ar=(+c[0])/255;DR3D.ag=(+c[1])/255;DR3D.ab=(+c[2])/255;
  }
  /* denyut lembut (bukan kedip kasar) */
  var pu=.84+.16*Math.sin(now*.004);
  m.acc.color.setRGB(DR3D.ar*pu,DR3D.ag*pu,DR3D.ab*pu);

  /* kunci hangat dari arah Gargantua */
  try{
    var bp=camBH(),dx=bp[0]-x,dy=bp[1]-y,d=Math.hypot(dx,dy)||1,fall=Math.max(.3,Math.min(1.25,1.25-d/(Math.max(W,H)*.9)));
    o.key.position.set(dx/d*60,45,dy/d*60);o.key.intensity=1.4*fall*DR3D_CFG.light*DR3D_CFG.glowK;
  }catch(eL){}
  var lk=DR3D_CFG.light*DR3D_CFG.glowK;o.rim.intensity=1.1*lk;o.hemi.intensity=.45*lk;o.fill.intensity=.55*lk;
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
    var hk=DR3D_CFG.halo*DR3D_CFG.glowK;
    if(hk>0.001){g.fillStyle='rgba('+col+','+Math.min(1,.10*a*hk)+')';g.beginPath();g.arc(x,y,S*.30,0,6.283);g.fill();
    g.fillStyle='rgba('+col+','+Math.min(1,.14*a*hk)+')';g.beginPath();g.arc(x,y,S*.17,0,6.283);g.fill();}
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
