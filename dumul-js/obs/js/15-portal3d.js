'use strict';
/* 15-portal3d.js — Portal (rombak BH -> portal, fase F2 di rencana-portal.md). Hanya aktif kalau PORTAL_ON (?portal=1); flag mati = file ini tidak dipanggil siapa pun.
   Pola sama dengan 12/13/14: Three.js r128 dimuat LAZY (three.min.js yang sama), satu WebGL renderer offscreen kecil merender SATU cincin portal, hasilnya di-drawImage ke canvas 2D.
   Gagal apa pun (potato, reduce motion, perf-tier-0, WebGL mati / context lost / three.js nggak termuat) -> cincin 2D sederhana, tanpa error.
   Isi:
     - Cincin 3D: 12 plat segmen logam gelap, sirkuit cyan EMISSIVE dari tekstur procedural, tengah transparan.
     - Mulut wormhole IDLE di tengah cincin (2D, dipasang di bawah cincin): gradien gelap + 3 lengan spiral pelan. Potato / reduce motion = statis. Tidak menyentuh state 09-wormhole.js, muffle tetap 0.
       (Rencana awal: mode WORMHOLE.idle di 09. Dipilih terpisah di sini karena 09 punya state/mask/kanvas sendiri untuk hold & swallow; idle statis murah ini tidak perlu ikut ke sana.)
     - Visualizer: drawAudioVisualizer(now,R) dipanggil dari sini (bukan dari BH). 12 plat <-> 12 pita (AVB.v) = intensitas emissive; warna ikut AV_COLOR (tema BGM/SFX).
   Penempatan: overview = dipanggil dari drawHole (03-gargantua.js) di anchor BH (menggantikan gambar BH). Sektor = portal3dSectorDraw() (05-sector-ui.js frame), muncul saat relay aktif (SUM.on), posisi disimpan per sektor di s.ptl (ruang BH).
   Matikan 3D saja: ?portal3d=0 atau localStorage dumul_portal3d=0 (cincin 2D tetap tampil). */
var PT3D_CFG={
  on:true,
  lib:(typeof AST3D_CFG!=='undefined'&&AST3D_CFG.lib)||'dumul-js/obs/lib/three.min.js?v=1',   /* path + ?v= harus sama dgn SHELL service-worker */
  ovK:2.5,        /* radius luar cincin overview = ovK x horizon BH (BH.Rr) */
  secK:1.9,       /* radius luar cincin sektor = secK x BH.R x BHSC sektor-standar, lihat ptSecR() */
  half:1.3,       /* setengah lebar kamera ortho (satuan model; radius luar cincin = 1) */
  resMin:128,resMax:320,
  vizK:.46        /* R yang dikasih ke drawAudioVisualizer = vizK x radius luar cincin */
};
try{
  if(/[?&]portal3d=0(&|$)/.test(location.search)||localStorage.getItem('dumul_portal3d')==='0')PT3D_CFG.on=false;
}catch(ePT0){}
var PT3D={state:0,/* 0 belum, 1 memuat, 2 siap, 3 gagal/nonaktif */r:null,sc:null,cam:null,grp:null,mats:[],glow:[],tex:null,res:0,err:'',lastCol:'',cr:.43,cg:.9,cb:1,lv:[],lastNow:-1,sa:0,ta:0};

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
  var c=document.createElement('canvas');c.width=c.height=256;var x=c.getContext('2d');
  x.fillStyle='#000';x.fillRect(0,0,256,256);
  var seed=1337,rnd=function(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  x.lineCap='round';x.lineJoin='round';
  var i,j,px,py,hz,len;
  for(i=0;i<30;i++){
    px=Math.floor(rnd()*16)*16+8;py=Math.floor(rnd()*16)*16+8;hz=rnd()<.5;
    x.strokeStyle='rgba(255,255,255,'+(.55+rnd()*.45).toFixed(2)+')';x.lineWidth=(i%5===0)?4:2.2;
    x.beginPath();x.moveTo(px,py);
    for(j=0;j<3+Math.floor(rnd()*3);j++){
      len=(1+Math.floor(rnd()*5))*16*(rnd()<.5?-1:1);
      if(hz)px=Math.max(8,Math.min(248,px+len));else py=Math.max(8,Math.min(248,py+len));
      x.lineTo(px,py);hz=!hz;
    }
    x.stroke();
    x.fillStyle='#fff';x.beginPath();x.arc(px,py,i%4===0?5:3,0,6.2832);x.fill();
  }
  var t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(1.15,1.15);t.encoding=T.sRGBEncoding;
  return t;
}
function pt3dSeg(T,a0,a1,r0,r1){
  var s=new T.Shape(),co=Math.cos,si=Math.sin;
  s.moveTo(co(a0)*r0,si(a0)*r0);s.lineTo(co(a0)*r1,si(a0)*r1);s.absarc(0,0,r1,a0,a1,false);s.lineTo(co(a1)*r0,si(a1)*r0);s.absarc(0,0,r0,a1,a0,true);
  var g=new T.ExtrudeGeometry(s,{depth:.26,bevelEnabled:true,bevelThickness:.035,bevelSize:.03,bevelSegments:1,curveSegments:6});
  g.translate(0,0,-.13);return g;
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
  var grp=new T.Group();sc.add(grp);PT3D.grp=grp;
  var N=12,gap=.075,i,a0,a1,m,mesh;
  for(i=0;i<N;i++){
    a0=i*2*PI/N+gap/2;a1=(i+1)*2*PI/N-gap/2;
    m=new T.MeshStandardMaterial({color:0x06090d,metalness:.8,roughness:.5,emissive:new T.Color(0x6ee5ff),emissiveMap:tex,emissiveIntensity:.8})   /* hex r128 tidak dikonversi ke linear: logam 'gelap' harus sangat gelap */;
    mesh=new T.Mesh(pt3dSeg(T,a0,a1,.76,1),m);grp.add(mesh);PT3D.mats.push(m);
  }
  /* garis cahaya tipis di tepi dalam & luar (additive), warna tema */
  var gm1=new T.MeshBasicMaterial({color:0x6ee5ff,transparent:true,opacity:.5,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false,side:T.DoubleSide});
  var gm2=new T.MeshBasicMaterial({color:0x6ee5ff,transparent:true,opacity:.28,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false,side:T.DoubleSide});
  var g1=new T.Mesh(new T.RingGeometry(.735,.76,72),gm1);g1.position.z=.17;grp.add(g1);
  var g2=new T.Mesh(new T.RingGeometry(1.0,1.03,72),gm2);g2.position.z=.0;grp.add(g2);
  PT3D.glow=[gm1,gm2];
  var key=new T.DirectionalLight(0xffd2a0,.7);key.position.set(.6,.9,1.4);sc.add(key);
  var rim=new T.DirectionalLight(0xff4fd8,.85);rim.position.set(-1.2,-.7,.8);sc.add(rim);
  sc.add(new T.HemisphereLight(0x7a5cd8,0x0a0614,.35));
  var fill=new T.DirectionalLight(0x40e8ff,.5);fill.position.set(-.8,.5,1);sc.add(fill);
  /* pra-ukur ke resolusi overview (setSize pertama = realokasi framebuffer MSAA yang mahal) */
  try{
    var res0=pt3dRes(Math.max(40,(typeof BH!=='undefined'?BH.R:26)*PT3D_CFG.ovK));
    PT3D.res=res0;r.setPixelRatio(1);r.setSize(res0,res0,false);
  }catch(eP){}
  PT3D.state=2;
  if(typeof threeWarm==='function')threeWarm(r,sc,cam);
}
function pt3dRes(Rp){var S=2*PT3D_CFG.half*Rp;return Math.max(PT3D_CFG.resMin,Math.min(PT3D_CFG.resMax,Math.ceil(S*Math.min(1.5,DPR||1)/32)*32));}

/* ---------- warna tema (AV_COLOR 'r,g,b', diperbarui drawAudioVisualizer) ---------- */
function ptCol(){
  var c=(typeof AV_COLOR==='string'&&AV_COLOR)?AV_COLOR:'110,229,255';
  if(c!==PT3D.lastCol){PT3D.lastCol=c;var p=c.split(',');PT3D.cr=(+p[0])/255;PT3D.cg=(+p[1])/255;PT3D.cb=(+p[2])/255;}
  return c;
}
/* intensitas per plat: musik (AVB.v) kalau ada yang main, kalau tidak napas pelan bergeser antar plat */
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

function pt3dRender(now,Rp,playing){
  var T=THREE,r=PT3D.r,res=pt3dRes(Rp);
  if(res!==PT3D.res){PT3D.res=res;r.setPixelRatio(1);r.setSize(res,res,false);}
  ptCol();
  var lv=ptLevels(now,playing),i,m,t=now*.001;
  for(i=0;i<12;i++){
    m=PT3D.mats[i];m.emissive.setRGB(PT3D.cr,PT3D.cg,PT3D.cb);
    m.emissiveIntensity=.4+(playing?.7:.3)*lv[i];   /* terlalu tinggi = ACES memutihkan cyan */
  }
  PT3D.glow[0].color.setRGB(PT3D.cr,PT3D.cg,PT3D.cb);PT3D.glow[1].color.setRGB(PT3D.cr,PT3D.cg,PT3D.cb);
  var still=(typeof reduce!=='undefined'&&reduce);
  PT3D.grp.rotation.x=still?0:.2*Math.sin(t*.5);PT3D.grp.rotation.y=still?0:.28*Math.sin(t*.37+1);PT3D.grp.rotation.z=still?0:t*.05;
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
    g.strokeStyle='#222a33';g.lineWidth=Rp*.22;g.beginPath();g.arc(0,0,Rp*.88,a0,a1);g.stroke();
    g.strokeStyle='rgba('+c+','+(.35+.55*lv[i])+')';g.lineWidth=Math.max(1,Rp*.03);g.beginPath();g.arc(0,0,Rp*.8,a0,a1);g.stroke();
  }
  g.strokeStyle='rgba('+c+',.7)';g.lineWidth=Math.max(1,Rp*.025);g.beginPath();g.arc(0,0,Rp*.755,0,6.2832);g.stroke();
}
/* x,y = pusat di layar, Rp = radius luar cincin (px), a = alpha 0..1 */
function portal3dDraw(g,x,y,Rp,now,a){
  if(!(Rp>2)||!(a>.01))return;
  var use3d=pt3dUsable(),still=(typeof reduce!=='undefined'&&reduce)||(typeof IS_POTATO!=='undefined'&&IS_POTATO),playing=ptPlaying();
  g.save();
  g.translate(x,y);if(typeof STG!=='undefined'&&STG.rot&&typeof upAng==='function')g.rotate(upAng());
  g.globalAlpha=a>1?1:a;
  ptMouth(g,Rp*.745,now,!still);
  /* visualizer cakram/debu: sekarang hidup di cincin portal, bukan di BH */
  try{if(typeof drawAudioVisualizer==='function'){g.globalAlpha=1;drawAudioVisualizer(now,Rp*PT3D_CFG.vizK);g.globalAlpha=a>1?1:a;}}catch(eV){}
  if(use3d){
    try{
      if(now!==PT3D.lastNow){PT3D.lastNow=now;pt3dRender(now,Rp,playing);}
      var S=2*PT3D_CFG.half*Rp;
      g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
      g.drawImage(PT3D.r.domElement,-S/2,-S/2,S,S);
    }catch(e){pt3dFail(e&&e.message||e);ptRing2D(g,Rp,now,playing);}
  }else ptRing2D(g,Rp,now,playing);
  g.restore();
}

/* Overview: dipanggil dari drawHole (03-gargantua.js) menggantikan gambar BH. R = horizon BH sudah termasuk intro/terowongan (ARV)/swallow. true = sudah digambar. */
function portal3dOverview(now,bp,R){
  if(!(R>1))return false;
  if(PT3D.state===0)pt3dLoad();
  var Rp=R*PT3D_CFG.ovK;
  portal3dDraw(g,bp[0],bp[1],Rp,now,1);
  PT3D.ovR=Rp;PT3D.ovT=now;   /* F3: radius terakhir dipakai hit-test tap portal overview (06-interaction.js) */
  /* F3 (D1): petunjuk idle — selama pengunjung belum pernah membuka ikon sektor, cincin luar berdenyut pelan ("portal ini bisa di-tap"). */
  if(!OVSEL.seen&&!OVSEL.open&&!(typeof reduce!=='undefined'&&reduce)&&typeof SECT!=='undefined'&&!SECT.busy&&!SECT.cur){
    var ph=(now%2600)/2600;
    g.save();g.translate(bp[0],bp[1]);
    g.strokeStyle='rgba('+ptCol()+','+(.38*(1-ph))+')';g.lineWidth=1.5;
    g.beginPath();g.arc(0,0,Rp*(1.04+.26*ph),0,6.2832);g.stroke();
    g.restore();
  }
  return true;
}
/* Radius luar portal overview yang baru saja digambar (0 = tidak tampil / bukan overview). */
function ptOvR(){return(PORTAL_ON&&typeof SECT!=='undefined'&&!SECT.cur&&!SECT.busy&&PT3D.ovT&&performance.now()-PT3D.ovT<1200)?PT3D.ovR:0;}

/* ---------- sektor ---------- */
function ptSecR(){return Math.max(16,(typeof BH!=='undefined'?BH.R:26)*PT3D_CFG.secK*.62);}
function ptSecPlace(s){   /* titik kosong terjauh dari bintang DAN dari BH mini; disimpan di ruang BH seperti sumPlace */
  if(typeof sumSpot!=='function')return null;
  var z=skyZoom||1,cx=W*.5,cy=H*.5,sp;
  try{SPOT_AVOID=camBH();sp=sumSpot();}catch(e){sp=null;}
  SPOT_AVOID=null;
  if(!sp)return null;
  s.ptl={x:cx+(sp[0]-cx)/z-skyPan.x*BHK,y:cy+(sp[1]-cy)/z-skyPan.y*BHK};
  return s.ptl;
}
/* ---------- F3: portal sektor sebagai titik relay (pengganti BH mini untuk gate / hold / docking drone / terowongan) ---------- */
/* [x,y,R] layar portal sektor; null = tidak ada (bukan PORTAL_ON, bukan di sektor, sedang transisi, relay mati).
   Ditempatkan lazy (ptSecPlace, sama dengan portal3dSectorDraw) supaya pemanggil yang datang lebih dulu dari gambar (drone, gate) tidak mendapat null. */
function ptlScreen(){
  if(!PORTAL_ON||typeof SECT==='undefined'||!SECT.cur||SECT.busy||typeof SUM==='undefined'||!SUM.on)return null;
  var s=SECT.cur,p=s.ptl||ptSecPlace(s);if(!p)return null;
  var z=skyZoom||1,px=p.x+skyPan.x*BHK,py=p.y+skyPan.y*BHK;
  if(z!==1){var cx=W*.5,cy=H*.5;px=cx+(px-cx)*z;py=cy+(py-cy)*z;}
  return [px,py,ptSecR()*z];
}
/* Hit-test tap/hold portal sektor. Portal yang masih memudar masuk/keluar (sa<.5) belum bisa disentuh. */
function ptlHitAt(x,y){
  if(PT3D.sa<.5)return null;
  var P=ptlScreen();if(!P)return null;
  var d=Math.hypot(x-P[0],y-P[1]);
  return d<=Math.max(P[2]*1.05,30)?{x:P[0],y:P[1],r:P[2],d:d}:null;
}
/* Pusat relay [x,y,Rv] di layar: portal sektor kalau ada, selain itu BH (perilaku lama). Rv = jari-jari "badan" yang dipakai tata letak gate/dock. */
function relayAnchor(){
  var P=ptlScreen();
  if(P)return [P[0],P[1],Math.max(8,P[2]*.85)];
  var b=camBH();return [b[0],b[1],Math.max(8,BH.Rr*(BHZ||1))];
}
function portal3dSectorDraw(now){
  var s=(typeof SECT!=='undefined')?SECT.cur:null,want=!!(s&&!SECT.busy&&typeof SUM!=='undefined'&&SUM.on);
  var dtp=PT3D.ta?Math.min(100,now-PT3D.ta):16;PT3D.ta=now;   /* fade berbasis waktu (bukan per frame): sama di 60 fps maupun HP lambat */
  PT3D.sa+=((want?1:0)-PT3D.sa)*(1-Math.exp(-dtp/95));
  if(!want&&PT3D.sa<.02){PT3D.sa=0;return;}
  s=s||SECT.target;if(!s)return;
  if(PT3D.state===0)pt3dLoad();
  var p=s.ptl||ptSecPlace(s);if(!p)return;
  var px=p.x+skyPan.x*BHK,py=p.y+skyPan.y*BHK,z=skyZoom||1;
  if(z!==1){var cx=W*.5,cy=H*.5;px=cx+(px-cx)*z;py=cy+(py-cy)*z;}
  portal3dDraw(g,px,py,ptSecR()*z,now,PT3D.sa);
}
try{if(typeof PORTAL_ON!=='undefined'&&PORTAL_ON)pt3dLoad();}catch(ePT3L){}   /* mulai muat lebih awal supaya tidak ada "pop" dari 2D ke 3D */
