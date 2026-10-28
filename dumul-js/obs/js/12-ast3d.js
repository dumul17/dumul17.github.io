'use strict';
/* 12-ast3d.js — asteroid 3D (Three.js r128, dimuat LAZY).
   Cara kerja: fisika/posisi/lensing batu tetap dari astStep() (04-render.js): layer ini cuma menggantikan drawImage sprite.
   Satu renderer WebGL offscreen (canvas tidak masuk DOM). Tiap pass drawAsteroids (belakang / depan BH) merender batu pass itu,
   lalu hasilnya di-drawImage ke canvas 2D -> urutan lapisan (di bawah rasi/BH vs di atas BH), rotasi landscape, dan zoom persis sama.
   Pencahayaan: kunci hangat dari arah Gargantua per batu (dihitung di shader dari posisi batu -> BH), jadi satu draw call per varian.
   Gagal apa pun (WebGL mati, context lost, file nggak termuat) -> state 3 -> sprite 2D lama dipakai lagi.
   Matikan: ?ast3d=0 di URL atau localStorage dumul_ast3d=0. */
var AST3D_CFG={
  on:true,
  lib:'dumul-js/obs/lib/three.min.js?v=1',
  gltfLib:'dumul-js/obs/lib/GLTFLoader.js?v=1',
  glb:[],        /* model NASA (opsional): ['dumul-js/obs/img/ast/bennu.glb', ...]; kosong = batu procedural saja */
  dprMax:1.5,    /* resolusi render dibatasi: batu kecil + lembut, nggak perlu DPR penuh */
  procVariants:6,
  reuse:true,    /* cache hasil render per pass: kalau pan/zoom/posisi BH/layout nggak berubah, GL + astStep cuma jalan ~fps (bawah), frame lain tinggal blit cache. false = render tiap frame seperti dulu */
  slowAlt:0,     /* HP lambat (FS.slow): 1 = pass belakang cuma di frame genap & depan cuma di ganjil (hemat GL, tapi tiap pass cuma ~fps/2 -> orbit patah-patah). 0 = kedua pass boleh render tiap frame (mulus) */
  slowMax:60,    /* HP lambat (FS.slow): batas atas jeda render batu (ms). Dulu min(140, 2 x interval frame) = ~8 update/dtk di HP 15 fps -> patah. 60 = tiap frame di HP lambat */
  fps:30,        /* laju render batu saat diam (cache dipakai ulang di antaranya). Saat pan/zoom/BH bergerak: tiap frame */
  lod:[[1,2.6],[2,4.2]]   /* LOD batu: [detail ikosahedron, batas _sz (px)]; batu dgn _sz di bawah batas pakai mesh detail itu, sisanya detail 3 (320 segitiga). Batu 1-4px nggak butuh 320 segitiga. [] = semua detail 3 seperti dulu */
};
try{
  if(/[?&]ast3d=0(&|$)/.test(location.search)||localStorage.getItem('dumul_ast3d')==='0')AST3D_CFG.on=false;
}catch(eA3){}
var AST3D={cache:[null,null,null],ver:0,rT:-1e9,reuseNow:-1,nx:[-1e9,-1e9,-1e9],ru:[-1,-1,-1],rd:[-1,-1,-1],sgT:-1,sgSame:false,hotF:false,sigA:[],sigB:[],reused:0,rendered:0,tiers:[],state:0,/* 0 belum, 1 memuat, 2 siap, 3 gagal/nonaktif */r:null,cam:null,sc:null,mat:null,uni:null,vars:[],cap:0,w:0,h:0,pr:0,drawn:0,passes:0,err:''};

/* Warm-up shader: render pertama sebuah renderer Three.js mengompilasi program shader (ratusan ms di HP) -> hitch pas drone/batu/teleskop pertama muncul; setSize pertama (realokasi framebuffer MSAA) juga mahal, jadi ukuran kanvas diset di build.
   compile() cuma MEMINDAHKAN stall itu; jadi dipanggil saat idle (layar boot, user belum main), satu renderer per giliran supaya tidak numpuk.
   Dipakai juga oleh 13-scope3d.js dan 14-drone3d.js. */
var THREE_WARM={q:[],busy:false};
function threeWarm(r,sc,cam,pre){
  try{if((typeof IS_POTATO!=='undefined'&&IS_POTATO)||(typeof reduce!=='undefined'&&reduce))return;}catch(e){}
  THREE_WARM.q.push({r:r,sc:sc,cam:cam,pre:pre});
  if(!THREE_WARM.busy)threeWarmNext();
}
function threeWarmNext(){
  var it=THREE_WARM.q.shift();
  if(!it){THREE_WARM.busy=false;return;}
  THREE_WARM.busy=true;
  var run=function(){
    try{if(it.pre)it.pre();}catch(e){}   /* pra-ukur kanvas (W/H sudah valid di layar boot) */
    try{it.r.compile(it.sc,it.cam);it.r.render(it.sc,it.cam);}catch(e){}   /* compile + satu render: upload tekstur/buffer pertama ikut dibayar di sini */
    setTimeout(threeWarmNext,150);
  };
  if(typeof requestIdleCallback==='function')requestIdleCallback(run,{timeout:2000});else setTimeout(run,300);
}

function ast3dFail(why){AST3D.state=3;AST3D.err=String(why||'');try{console.warn('[ast3d] fallback ke sprite 2D:',AST3D.err);}catch(e){}}

function ast3dScript(src,ok,bad){
  var s=document.createElement('script');
  s.src=src;s.async=true;
  s.onload=ok;s.onerror=function(){bad('gagal muat '+src);};
  document.head.appendChild(s);
}

function ast3dLoad(){
  if(AST3D.state!==0)return;
  if(!AST3D_CFG.on){AST3D.state=3;AST3D.err='off';return;}
  AST3D.state=1;
  var go=function(){
    try{ast3dBuild();}catch(e){ast3dFail(e&&e.message||e);}
  };
  if(typeof THREE!=='undefined'&&THREE.REVISION){go();return;}
  ast3dScript(AST3D_CFG.lib,go,ast3dFail);
}

function ast3dMulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}

/* Batu procedural: ikosahedron detail 3 (320 sisi) + deformasi halus + kawah + gepeng. Normal dihitung ulang -> tampak berfacet. */
function ast3dRockGeo(seed,detail){   /* detail dihilangkan = 3 (dipakai 17-planet3d.js apa adanya) */
  var T=THREE,geo=new T.IcosahedronGeometry(1,detail==null?3:detail),pos=geo.attributes.position,v=new T.Vector3(),rnd=ast3dMulberry(seed*7919+13),i,c;
  var cr=[];
  for(i=0;i<7;i++)cr.push({d:new T.Vector3(rnd()-.5,rnd()-.5,rnd()-.5).normalize(),cosA:Math.cos(.20+rnd()*.30),dep:.10+rnd()*.14});
  var sy=.72+rnd()*.28,sz=.62+rnd()*.30,f1=1.6+rnd()*1.6,f2=3.1+rnd()*2.2,p1=rnd()*6.28,p2=rnd()*6.28,p3=rnd()*6.28,sum=0;
  for(i=0;i<pos.count;i++){
    v.fromBufferAttribute(pos,i).normalize();
    var r=1+.20*Math.sin(f1*v.x+p1)*Math.cos(f1*1.3*v.y+p2)+.13*Math.sin(f2*v.z+p3+v.x*2.1)+.07*Math.sin(f2*2.3*(v.x+v.y)+p1);
    for(c=0;c<cr.length;c++){
      var dd=v.dot(cr[c].d);
      if(dd>cr[c].cosA){var t=(dd-cr[c].cosA)/(1-cr[c].cosA);r-=cr[c].dep*t*t*(3-2*t);}
    }
    pos.setXYZ(i,v.x*r,v.y*r*sy,v.z*r*sz);
    sum+=Math.hypot(v.x*r,v.y*r*sy,v.z*r*sz);
  }
  var k=.74/(sum/pos.count);   /* radius rata-rata ~ .74: siluet sepadan dengan sprite lama (poligon ~.7R, gepeng .72) */
  for(i=0;i<pos.count;i++)pos.setXYZ(i,pos.getX(i)*k,pos.getY(i)*k,pos.getZ(i)*k);
  pos.needsUpdate=true;
  geo.computeVertexNormals();
  return geo;
}

/* satu varian = satu InstancedBufferGeometry + satu Mesh; atribut per-instance diisi ulang tiap frame (dipadatkan) */
function ast3dAddVariant(geo,tier){
  var T=THREE,ig=new T.InstancedBufferGeometry(),cap=AST3D.cap,v={};
  ig.index=geo.index;
  ig.setAttribute('position',geo.attributes.position);
  ig.setAttribute('normal',geo.attributes.normal);
  v.A=new T.InstancedBufferAttribute(new Float32Array(cap*4),4).setUsage(T.DynamicDrawUsage);   /* x, y, ukuran, alpha */
  v.B=new T.InstancedBufferAttribute(new Float32Array(cap*4),4).setUsage(T.DynamicDrawUsage);   /* sumbu putar xyz, sudut */
  v.Z=new T.InstancedBufferAttribute(new Float32Array(cap),1).setUsage(T.DynamicDrawUsage);     /* kedalaman */
  ig.setAttribute('iA',v.A);ig.setAttribute('iB',v.B);ig.setAttribute('iZ',v.Z);
  ig.instanceCount=0;
  if(tier==null)tier=AST3D_CFG.lod.length;   /* tanpa tier (GLB) = tier detail penuh */
  v.geo=ig;v.base=geo;v.n=0;v.tier=tier;
  (AST3D.tiers[tier]||(AST3D.tiers[tier]=[])).push(v);
  v.mesh=new T.Mesh(ig,AST3D.mat);
  v.mesh.frustumCulled=false;v.mesh.visible=false;
  AST3D.sc.add(v.mesh);
  AST3D.vars.push(v);
  return v;
}

function ast3dBuild(){
  var T=THREE;
  var cv=document.createElement('canvas');
  var r=new T.WebGLRenderer({canvas:cv,alpha:true,antialias:true,premultipliedAlpha:true,powerPreference:'low-power',preserveDrawingBuffer:false});
  r.setClearColor(0x000000,0);
  cv.addEventListener('webglcontextlost',function(e){e.preventDefault();ast3dFail('webglcontextlost');},false);
  AST3D.r=r;
  AST3D.sc=new T.Scene();
  AST3D.cam=new T.OrthographicCamera(0,W,H,0,-600,600);
  AST3D.uni={uBH:{value:new T.Vector2(W*.5,H*.5)},uBack:{value:0},uFall:{value:Math.max(W,H)*.9}};
  AST3D.mat=new T.ShaderMaterial({
    uniforms:AST3D.uni,
    transparent:true,depthTest:true,depthWrite:true,
    blending:T.CustomBlending,blendEquation:T.AddEquation,blendSrc:T.OneFactor,blendDst:T.OneMinusSrcAlphaFactor,
    vertexShader:[
      'attribute vec4 iA;attribute vec4 iB;attribute float iZ;',
      'uniform vec2 uBH;',
      'varying vec3 vN;varying vec3 vL;varying float vA;varying float vD;',
      'vec3 rot(vec3 v,vec3 k,float a){float c=cos(a),s=sin(a);return v*c+cross(k,v)*s+k*dot(k,v)*(1.-c);}',
      'void main(){',
      '  vec3 p=rot(position,iB.xyz,iB.w);',
      '  vN=rot(normal,iB.xyz,iB.w);',
      '  vec2 d=uBH-iA.xy;float len=length(d);',
      '  vL=normalize(vec3(d,len*.5+18.));',   /* arah ke Gargantua (sedikit mengangkat ke arah kamera biar sisi depan juga kena) */
      '  vA=iA.w;vD=len;',
      '  gl_Position=projectionMatrix*vec4(vec3(iA.xy,iZ)+p*iA.z,1.);',
      '}'
    ].join('\n'),
    fragmentShader:[
      'uniform float uBack;uniform float uFall;',
      'varying vec3 vN;varying vec3 vL;varying float vA;varying float vD;',
      'void main(){',
      '  vec3 n=normalize(vN),L=normalize(vL);',
      '  float nl=max(dot(n,L),0.);',
      '  float fall=clamp(1.25-vD/uFall,.22,1.25);',
      '  vec3 warm=vec3(1.,.74,.48),base=vec3(.13,.135,.13);',
      '  vec3 col=base*.22+base*warm*nl*fall*1.5+warm*pow(nl,4.)*fall*.22;',   /* badan gelap, sisi yang menghadap BH menyala hangat */
      '  float rim=pow(1.-max(n.z,0.),2.5)*pow(max(dot(normalize(n.xy+1e-4),normalize(L.xy+1e-4)),0.),1.5);',
      '  col+=warm*rim*fall*.30;',
      '  col=mix(col,col*vec3(.72,.86,1.12)*.82,uBack);',   /* pass belakang: lebih dingin + redup, seperti sprite belakang */
      '  gl_FragColor=vec4(col*vA,vA);',
      '}'
    ].join('\n')
  });
  AST3D.cap=Math.max(128,(AST&&AST.length||0)+16);
  var LD=AST3D_CFG.lod,ti,i;
  for(ti=0;ti<=LD.length;ti++)
    for(i=0;i<AST3D_CFG.procVariants;i++)ast3dAddVariant(ast3dRockGeo(i+1,ti<LD.length?LD[ti][0]:3),ti);   /* seed sama per tier -> bentuk batu sama, cuma kerapatan mesh beda */
  AST3D.state=2;   /* siap dipakai segera dengan batu procedural */
  threeWarm(r,AST3D.sc,AST3D.cam,function(){ast3dResize();});   /* ukuran layar penuh dipasang di warm-up, bukan di frame batu pertama */
  if(AST3D_CFG.glb&&AST3D_CFG.glb.length)ast3dLoadGlb();
}

/* Model NASA (.glb): ambil mesh pertama, pusatkan, skala ke radius ~.92, jadikan varian tambahan */
function ast3dLoadGlb(){
  var run=function(){
    try{
      var T=THREE,ld=new T.GLTFLoader();
      AST3D_CFG.glb.forEach(function(url){
        ld.load(url,function(gl){
          try{
            var m=null;gl.scene.traverse(function(o){if(!m&&o.isMesh)m=o;});
            if(!m)return;
            m.updateMatrixWorld(true);
            var geo=m.geometry.clone();geo.applyMatrix4(m.matrixWorld);
            geo.computeBoundingSphere();
            var bs=geo.boundingSphere;
            geo.translate(-bs.center.x,-bs.center.y,-bs.center.z);
            geo.scale(.74/bs.radius,.74/bs.radius,.74/bs.radius);
            if(!geo.attributes.normal)geo.computeVertexNormals();
            ast3dAddVariant(geo);
          }catch(e){try{console.warn('[ast3d] glb dilewati',url,e&&e.message);}catch(e2){}}
        },undefined,function(){try{console.warn('[ast3d] glb gagal dimuat',url);}catch(e){}});
      });
    }catch(e){try{console.warn('[ast3d] GLTFLoader error',e&&e.message);}catch(e2){}}
  };
  if(typeof THREE!=='undefined'&&THREE.GLTFLoader)run();
  else ast3dScript(AST3D_CFG.gltfLib,run,function(m){try{console.warn('[ast3d]',m);}catch(e){}});
}

/* pilih varian: tier menurut ukuran batu (_sz), lalu bentuk menurut sprite; tier kosong -> turun ke tier berikutnya yang ada */
function ast3dPick(a){
  var L=AST3D_CFG.lod,T=AST3D.tiers,t=L.length,i,l;
  for(i=0;i<L.length;i++)if(a._sz<L[i][1]){t=i;break;}
  for(i=t;i<=L.length;i++){l=T[i];if(l&&l.length)return l[(a.sprite|0)%l.length];}
  for(i=t-1;i>=0;i--){l=T[i];if(l&&l.length)return l[(a.sprite|0)%l.length];}
  return AST3D.vars[0];
}

function ast3dResize(){
  var pr=Math.min(DPR||1,AST3D_CFG.dprMax);
  if(AST3D.w===W&&AST3D.h===H&&AST3D.pr===pr)return;
  AST3D.w=W;AST3D.h=H;AST3D.pr=pr;
  AST3D.r.setPixelRatio(pr);AST3D.r.setSize(W,H,false);
  var c=AST3D.cam;c.left=0;c.right=W;c.top=H;c.bottom=0;c.updateProjectionMatrix();
  AST3D.uni.uFall.value=Math.max(W,H)*.9;
}

/* ---- Cache hasil render (hemat kerja sia-sia) ----
   Batu bergerak pelan, jadi selama kamera (pan/zoom), posisi BH, layout, dan slider batu TIDAK berubah, render GL + astStep cukup ~AST3D_CFG.fps;
   frame di antaranya cuma drawImage dari kanvas cache per pass (belakang/depan). Ada yang berubah / ada batu yang lagi terpental (tap) -> render tiap frame. */
function ast3dSig(){
  var s=AST3D.sigB,i=0,k,c=AST_CFG,bp=camBH(),an=astAnchor();
  s[i++]=skyZoom;s[i++]=skyPan.x;s[i++]=skyPan.y;s[i++]=bp[0];s[i++]=bp[1];s[i++]=an[0];s[i++]=an[1];
  s[i++]=BHZ||1;s[i++]=BH.Rr;s[i++]=BHU.str;s[i++]=W;s[i++]=H;s[i++]=DPR||1;s[i++]=upAng();s[i++]=astN();
  s[i++]=AST_MIX;s[i++]=AST_RING_LAST?1:0;s[i++]=CAMERA_MODE?1:0;
  s[i++]=SECT.cur?1:0;s[i++]=SECT.busy?1:0;s[i++]=(drag.on&&drag.moved)?1:0;
  s[i++]=(typeof PW!=='undefined'?PW:0);s[i++]=(typeof PH!=='undefined'?PH:0);   /* geometri planet (sabuk limb) cuma berubah saat layout berubah */
  for(k in c){var v=c[k];if(typeof v==='number')s[i++]=v;else if(typeof v==='boolean')s[i++]=v?1:0;}
  s.length=i;
  var p=AST3D.sigA,same=(p.length===i);
  if(same)for(var j=0;j<i;j++)if(p[j]!==s[j]){same=false;break;}
  AST3D.sigA=s;AST3D.sigB=p;   /* tukar: sigA = terbaru */
  return same;
}
/* Signature dicek SEKALI per frame (pass mana pun yang pertama): ada yang berubah / batu masih terpental -> ver naik -> semua cache basi. */
function ast3dFrameSig(now){
  if(AST3D.sgT===now)return AST3D.sgSame;
  AST3D.sgT=now;
  var same=ast3dSig();
  if(!same||AST3D.hotF)AST3D.ver++;
  AST3D.hotF=false;   /* diisi ulang oleh loop render di ast3dDraw */
  AST3D.sgSame=same;
  return same;
}
/* Rencana per pass, dipanggil drawAsteroids (04-render.js) SEBELUM astStep. Tiap pass (belakang / depan) punya jadwal sendiri:
     0 = normal (astStep + render GL)   1 = pakai cache (blit; astStep + GL dilewati)   2 = render GL TANPA astStep (pakai posisi astStep terakhir)
   GANTIAN: kalau pass belakang dan depan jatuh tempo di frame yang sama, pass depan dimajukan setengah periode (jatuh tempo lagi di tengah) -> saat diam tiap frame cuma
   satu pass yang merender (beban rata, tidak ada frame berat-ringan). Pass depan di frame sendiri memakai posisi dari astStep pass belakang (usia <= 1 periode, sama dgn cache). */
function ast3dReuse(now,half){
  var ci=half<0?0:(half>0?1:2),U=AST3D.ru;
  U[ci]=-1;
  if(!AST3D_CFG.reuse||AST3D.state!==2||!AST3D_CFG.on)return 0;
  try{
    if((typeof IS_POTATO!=='undefined'&&IS_POTATO)||(typeof reduce!=='undefined'&&reduce))return 0;
    var same=ast3dFrameSig(now),C=AST3D.cache,per=1000/Math.max(1,AST3D_CFG.fps),ok=!!(C[ci]&&C[ci].ver===AST3D.ver);
    var fsl=(typeof FS!=='undefined'&&FS.slow)?FS:null;
    if(fsl){   /* HP lambat (05-sector-ui.js FS): jeda render = 2x interval frame (maks 140 ms), pass belakang cuma di frame genap, depan cuma di ganjil -> tiap frame paling banyak satu pass GL */
      per=Math.max(per,Math.min(AST3D_CFG.slowMax||140,fsl.ema*2));
      if(AST3D_CFG.slowAlt&&ok&&ci<2&&((fsl.n&1)!==ci)){U[ci]=now;AST3D.reused++;return 1;}
    }
    if(ok&&now<AST3D.nx[ci]-8){U[ci]=now;AST3D.reused++;return 1;}   /* -8ms: toleransi jitter rAF */
    AST3D.nx[ci]=now+((ci===1&&AST3D.rd[0]===now)?per*.5:per);
    AST3D.rd[ci]=now;AST3D.rendered++;
    if(ci===1&&ok&&same&&typeof AST._stamp==='number'&&AST._stamp!==now&&now-AST._stamp<120)return 2;   /* depan jatuh tempo, belakang nggak jalan astStep di frame ini */
  }catch(e){}
  return 0;
}
function ast3dStore(ci,sx,sy,sw,sh,dx,dy,dw,dh,n){
  var c=AST3D.cache[ci];
  if(!c){var cv=document.createElement('canvas');c=AST3D.cache[ci]={c:cv,x:cv.getContext('2d'),ver:-1};}
  c.sx=sx;c.sy=sy;c.sw=sw;c.sh=sh;c.dx=dx;c.dy=dy;c.dw=dw;c.dh=dh;c.n=n;c.ver=AST3D.ver;
  return c;
}
function ast3dBlitCache(ci){
  var c=AST3D.cache[ci];
  if(!c)return false;
  if(c.sw>0&&c.sh>0)g.drawImage(c.c,0,0,c.sw,c.sh,c.dx,c.dy,c.dw,c.dh);
  AST_DRAWN+=c.n;
  return true;
}

/* Satu pass: half<0 belakang saja, >0 depan saja, 0 semua. true = pass ditangani (sprite 2D dilewati); false = pakai sprite. */
function ast3dDraw(now,half){
  if(AST3D.state===0){ast3dLoad();return false;}
  if(AST3D.state!==2)return false;
  if(!AST3D_CFG.on||(typeof IS_POTATO!=='undefined'&&IS_POTATO)||(typeof reduce!=='undefined'&&reduce))return false;
  try{
    var ci=half<0?0:(half>0?1:2);
    if(AST3D.ru[ci]===now&&ast3dBlitCache(ci))return true;   /* frame cache: nggak ada GL, nggak ada astStep */
    var vars=AST3D.vars,nv=vars.length,nA=astN(),i,a,v,k,total=0;
    if(!nv)return false;
    if(nA+4>AST3D.cap){   /* jumlah batu bertambah (slider): bangun ulang varian dengan kapasitas baru */
      AST3D.cap=nA+32;
      var bases=vars.map(function(b){return [b.base,b.tier];});
      for(i=0;i<nv;i++){AST3D.sc.remove(vars[i].mesh);vars[i].geo.dispose();}
      vars.length=0;AST3D.tiers=[];
      bases.forEach(function(q){ast3dAddVariant(q[0],q[1]);});
    }
    ast3dResize();
    for(i=0;i<nv;i++)vars[i].n=0;
    var bx0=1e9,by0=1e9,bx1=-1e9,by1=-1e9;   /* bbox layar (px CSS) dari batu yang kegambar: blit cuma area ini */
    for(i=0;i<nA;i++){
      a=AST[i];
      if(!a._vis)continue;
      if(a.ox||a.oy||a.vx||a.vy||a.kick)AST3D.hotF=true;   /* batu lagi terpental (tap): jangan di-cache */
      if(half<0&&!a._back)continue;
      if(half>0&&a._back)continue;
      var hf=a._sz*1.7;
      if(a._x+hf<0||a._x-hf>W||a._y+hf<0||a._y-hf>H)continue;
      if(a._ax===undefined){   /* sumbu putar tetap per batu: sebar merata di bola (golden angle) */
        var th=(i*2.399963)%6.283185,cz=1-2*((i*.618034+.13)%1),sz2=Math.sqrt(Math.max(0,1-cz*cz));
        a._ax=sz2*Math.cos(th);a._ay=sz2*Math.sin(th);a._az=cz;
      }
      v=ast3dPick(a);k=v.n++;
      var al=a._fl?.96:(a._back?.86+.36*a._s:Math.min(1,.9+.1*a._s));
      al*=(a._fa==null?1:a._fa);
      var A=v.A.array,B=v.B.array,o=k*4;
      A[o]=a._x;A[o+1]=H-a._y;A[o+2]=a._sz;A[o+3]=al>1?1:(al<0?0:al);
      B[o]=a._ax;B[o+1]=a._ay;B[o+2]=a._az;B[o+3]=a.rot*2+now*a.rs;
      v.Z.array[k]=a._s*120;
      if(a._x-hf<bx0)bx0=a._x-hf;if(a._x+hf>bx1)bx1=a._x+hf;if(a._y-hf<by0)by0=a._y-hf;if(a._y+hf>by1)by1=a._y+hf;
      total++;
    }
    AST3D.passes++;AST3D.drawn+=total;
    AST_DRAWN+=total;
    if(!total){ast3dStore(ci,0,0,0,0,0,0,0,0,0);return true;}
    var bp=camBH();
    AST3D.uni.uBH.value.set(bp[0],H-bp[1]);
    AST3D.uni.uBack.value=(half<0&&!(AST.length&&AST[0]._fl))?1:0;   /* batu cincin limb (a._fl) tampil seperti batu depan: tanpa tint dingin pass belakang */
    for(i=0;i<nv;i++){
      v=vars[i];
      v.mesh.visible=v.n>0;
      if(!v.n)continue;
      v.geo.instanceCount=v.n;
      v.A.updateRange.offset=0;v.A.updateRange.count=v.n*4;v.A.needsUpdate=true;
      v.B.updateRange.offset=0;v.B.updateRange.count=v.n*4;v.B.needsUpdate=true;
      v.Z.updateRange.offset=0;v.Z.updateRange.count=v.n;v.Z.needsUpdate=true;
    }
    AST3D.r.render(AST3D.sc,AST3D.cam);
    var cvA=AST3D.r.domElement,kx=cvA.width/W,ky=cvA.height/H,
        rx0=Math.max(0,Math.floor(bx0)-2),ry0=Math.max(0,Math.floor(by0)-2),rx1=Math.min(W,Math.ceil(bx1)+2),ry1=Math.min(H,Math.ceil(by1)+2);
    if(rx1>rx0&&ry1>ry0){
      if(!AST3D_CFG.reuse)g.drawImage(cvA,rx0*kx,ry0*ky,(rx1-rx0)*kx,(ry1-ry0)*ky,rx0,ry0,rx1-rx0,ry1-ry0);   /* sama persis dgn blit penuh: di luar bbox kanvas GL transparan */
      else{
        /* salin bbox (piksel perangkat, bulat, 1:1) ke kanvas cache pass ini, lalu blit dari cache -> hasil sama, dan frame berikut bisa pakai ulang */
        var sx=Math.max(0,Math.floor(rx0*kx)),sy=Math.max(0,Math.floor(ry0*ky)),ex=Math.min(cvA.width,Math.ceil(rx1*kx)),ey=Math.min(cvA.height,Math.ceil(ry1*ky)),sw=ex-sx,sh=ey-sy;
        if(sw>0&&sh>0){
          var cc=ast3dStore(ci,sx,sy,sw,sh,sx/kx,sy/ky,sw/kx,sh/ky,total);
          if(cc.c.width<sw||cc.c.height<sh){cc.c.width=Math.max(cc.c.width,sw+32);cc.c.height=Math.max(cc.c.height,sh+32);}   /* cuma membesar (set width = kosongkan + realokasi) */
          else cc.x.clearRect(0,0,cc.c.width,cc.c.height);
          cc.x.drawImage(cvA,sx,sy,sw,sh,0,0,sw,sh);
          g.drawImage(cc.c,0,0,sw,sh,cc.dx,cc.dy,cc.dw,cc.dh);
        }else ast3dStore(ci,0,0,0,0,0,0,0,0,0);
      }
    }else ast3dStore(ci,0,0,0,0,0,0,0,0,0);
    return true;
  }catch(e){
    ast3dFail(e&&e.message||e);
    return false;
  }
}
try{ast3dLoad();}catch(eA3L){}   /* mulai muat + warm-up lebih awal (layar boot), bukan menunggu batu pertama digambar */
