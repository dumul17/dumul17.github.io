'use strict';
/* ================= STARGL (prototipe, nyala: ?stargl=1) =================
   Halo + inti bintang rasi digambar lewat WebGL: SATU titik (point sprite) per bintang, satu drawArrays per frame untuk SEMUA rasi,
   lalu hasilnya di-drawImage SEKALI ke kanvas utama (g) di titik yang sama dengan drawStars lama -> urutan lapisan tidak berubah
   (garis rasi di bawah; planet / BH / portal / asteroid depan tetap menutupi bintang seperti biasa).
   BUKAN 3D orbit: posisi, lensing BH, rotasi, zoom, parallax tetap dihitung JS (gSkyC); GL cuma pengganti drawStarGlow + arc inti.
   Yang tetap 2D: label, silang, spektrum, tanda alignment, Pleiades, mode kamera (CAMERA_MODE), jalur potato audio-focus.
   Nol biaya untuk pengunjung biasa: file ini cuma dimuat kalau URL punya ?stargl=1 (loader inline di index.html; bukan di SHELL SW).
   Konteks WebGL SENDIRI (offscreen, tidak masuk DOM), terpisah dari renderer three.js bersama, supaya tidak mengganggu state three.
   Kalau konteks gagal / hilang: STGL.err naik, begitu >=3 semua bintang kembali digambar 2D seperti semula.
   Uji A/B langsung di console: STGL.on=false / true. Statistik: STGL.st {fr, pts, msAvg, msMax}. Ganti DPR kanvas GL: ?stgldpr=1 / 1.5 / 2 (default min(DPR,1.5)). */
var STGL={on:true,act:false,err:0,ok:false,init:false,n:0,cap:0,buf:null,gl:null,cv:null,prog:null,vb:null,
  S:1,sCap:1.5,cw:0,ch:0,maxPt:64,uRes:null,uS:null,uMax:null,col:Object.create(null),st:{fr:0,pts:0,ms:0,mx:0}};
(function(){try{var m=/[?&]stgldpr=([0-9.]+)/.exec(location.search);if(m&&parseFloat(m[1])>0)STGL.sCap=parseFloat(m[1]);}catch(e){}})();
try{window.__stgl=STGL;}catch(eS){}

var STGL_VS=
'attribute vec2 aPos;attribute vec2 aSz;attribute vec4 aG;attribute vec4 aC;'+
'uniform vec2 uRes;uniform float uS;uniform float uMax;'+
'varying vec4 vG;varying vec4 vC;varying vec2 vR;varying float vH;'+
'void main(){'+
'  vec2 p=aPos/uRes;gl_Position=vec4(p.x*2.0-1.0,1.0-p.y*2.0,0.0,1.0);'+
'  float ext=max(aSz.x,aSz.y+1.0)*2.0*uS;'+          /* diameter (px perangkat): halo (radius aSz.x) atau inti + 1 px antialias */
'  float sz=min(ext,uMax);'+
'  gl_PointSize=sz;vH=sz*0.5;vR=aSz*uS;vG=aG;vC=aC;'+
'}';
/* halo = profil sprite lama (stop .9 / .34 / 0 di 0 / .25 / 1 radius, linear) x alpha halo; inti = lingkaran padat berujung lembut 1 px; inti di atas halo; keluaran premultiplied */
var STGL_FS=
'precision mediump float;'+
'varying vec4 vG;varying vec4 vC;varying vec2 vR;varying float vH;'+
'void main(){'+
'  float d=length(gl_PointCoord*2.0-1.0)*vH;'+
'  float t=clamp(d/max(vR.x,0.001),0.0,1.0);'+
'  float gp=(t<0.25)?mix(0.9,0.34,t*4.0):mix(0.34,0.0,(t-0.25)*1.33333);'+
'  float ga=vG.a*gp;'+
'  float ca=vC.a*clamp(vR.y-d+0.5,0.0,1.0);'+
'  vec3 col=vC.rgb*ca+vG.rgb*ga*(1.0-ca);'+
'  gl_FragColor=vec4(col,ca+ga*(1.0-ca));'+
'}';

function stglFail(why){STGL.err=3;STGL.act=false;STGL.ok=false;try{console.warn('[stargl] fallback ke 2D:',why);}catch(e){}try{window.__hub.renderError='stargl: '+why;}catch(e2){}}

function stglInit(){
  var S=STGL,cv,gl,vs,fs,p,sh,r;
  S.init=true;
  try{
    cv=document.createElement('canvas');cv.width=cv.height=2;
    gl=cv.getContext('webgl',{alpha:true,premultipliedAlpha:true,antialias:false,depth:false,stencil:false,preserveDrawingBuffer:false,powerPreference:'low-power'});
    if(!gl){stglFail('webgl tidak tersedia');return;}
    cv.addEventListener('webglcontextlost',function(e){e.preventDefault();stglFail('webglcontextlost');},false);
    function mk(type,src){var s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s)||'shader');return s;}
    vs=mk(gl.VERTEX_SHADER,STGL_VS);fs=mk(gl.FRAGMENT_SHADER,STGL_FS);
    p=gl.createProgram();gl.attachShader(p,vs);gl.attachShader(p,fs);
    gl.bindAttribLocation(p,0,'aPos');gl.bindAttribLocation(p,1,'aSz');gl.bindAttribLocation(p,2,'aG');gl.bindAttribLocation(p,3,'aC');
    gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p)||'link');
    S.uRes=gl.getUniformLocation(p,'uRes');S.uS=gl.getUniformLocation(p,'uS');S.uMax=gl.getUniformLocation(p,'uMax');
    r=gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE);S.maxPt=(r&&r[1])?r[1]:64;
    S.vb=gl.createBuffer();
    S.cap=256;S.buf=new Float32Array(S.cap*12);
    S.cv=cv;S.gl=gl;S.prog=p;S.ok=true;
    gl.disable(gl.DEPTH_TEST);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);   /* premultiplied "over" = source-over canvas 2D */
    gl.clearColor(0,0,0,0);
  }catch(e){stglFail(String(e&&e.message||e));}
}

/* dipanggil sekali per frame SEBELUM loop drawStars (05-sector-ui.js). true = jalur GL aktif frame ini (drawStars memakai stglPush). */
function stglBegin(now){
  var S=STGL;
  S.act=false;S.n=0;
  if(!S.on||S.err>=3||CAMERA_MODE)return false;
  if(!S.init)stglInit();
  if(!S.ok)return false;
  S.act=true;return true;
}

function stglCol(str){
  var c=STGL.col[str],a;
  if(c)return c;
  a=String(str).split(',');
  c=STGL.col[str]=[(+a[0]||0)/255,(+a[1]||0)/255,(+a[2]||0)/255];
  return c;
}

/* x,y = posisi layar (px CSS). Rg = radius halo (0 = tanpa halo), gc/ga = warna 'r,g,b' + alpha halo; rc = radius inti, cc/ca = warna + alpha inti (0 = tanpa inti) */
function stglPush(x,y,Rg,gc,ga,rc,cc,ca){
  var S=STGL,o,c,b;
  if(S.n>=S.cap){var nb=new Float32Array(S.cap*2*12);nb.set(S.buf);S.buf=nb;S.cap*=2;}
  b=S.buf;o=S.n*12;
  b[o]=x;b[o+1]=y;b[o+2]=Rg;b[o+3]=ca>0?rc:0;
  c=stglCol(gc);b[o+4]=c[0];b[o+5]=c[1];b[o+6]=c[2];b[o+7]=ga;
  c=stglCol(cc);b[o+8]=c[0];b[o+9]=c[1];b[o+10]=c[2];b[o+11]=ca;
  S.n++;
}

/* dipanggil sekali per frame SETELAH semua rasi: satu render + satu drawImage ke g (urutan lapisan sama dengan drawStars lama) */
function stglFlush(){
  var S=STGL,gl=S.gl,n=S.n,t0,ms,s,cw,ch;
  if(!S.act)return;
  S.act=false;
  t0=performance.now();
  try{
    S.st.fr++;
    if(!n)return;
    s=Math.min(DPR||1,S.sCap);cw=Math.max(2,Math.ceil(W*s));ch=Math.max(2,Math.ceil(H*s));
    if(cw!==S.cw||ch!==S.ch){S.cv.width=S.cw=cw;S.cv.height=S.ch=ch;}
    S.S=s;
    gl.viewport(0,0,cw,ch);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(S.prog);
    gl.uniform2f(S.uRes,W,H);gl.uniform1f(S.uS,s);gl.uniform1f(S.uMax,S.maxPt);
    gl.bindBuffer(gl.ARRAY_BUFFER,S.vb);
    gl.bufferData(gl.ARRAY_BUFFER,S.buf.subarray(0,n*12),gl.STREAM_DRAW);
    gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,48,0);
    gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,2,gl.FLOAT,false,48,8);
    gl.enableVertexAttribArray(2);gl.vertexAttribPointer(2,4,gl.FLOAT,false,48,16);
    gl.enableVertexAttribArray(3);gl.vertexAttribPointer(3,4,gl.FLOAT,false,48,32);
    gl.drawArrays(gl.POINTS,0,n);
    g.drawImage(S.cv,0,0,cw,ch,0,0,W,H);   /* wajib langsung setelah render (preserveDrawingBuffer:false) */
    S.st.pts+=n;
  }catch(e){stglFail(String(e&&e.message||e));}
  ms=performance.now()-t0;S.st.ms+=ms;if(ms>S.st.mx)S.st.mx=ms;
  S.st.msAvg=S.st.fr?+(S.st.ms/S.st.fr).toFixed(3):0;S.st.msMax=+S.st.mx.toFixed(2);
}
