'use strict';
/* 03-gargantua.js — Gargantua, neural network, spectrum */
/* ---------- lubang hitam Gargantua ---------- */
function ease(u){return u*u*(3-2*u);}
function pull(x,y){                       /* posisi benda saat disedot: berputar spiral ke lubang hitam */
  if(!SW)return [x,y,0];
  var bp=camBH(),bx=bp[0],by=bp[1];
  var dx=x-bx,dy=y-by,r=Math.sqrt(dx*dx+dy*dy)+.001,th=Math.atan2(dy,dx);
  var rmax=Math.sqrt(W*W+H*H)*.6,delay=.4*Math.min(1,r/rmax);
  var P=clamp((swP-.05)/.82),k=clamp((P-delay)/(1-delay));k=k*k;
  var r2=r*Math.pow(1-k,1.5),t2=th+k*3.4;
  return [bx+Math.cos(t2)*r2,by+Math.sin(t2)*r2,k];
}
function lens(x,y){                       /* smooth gravitational lens: bounded, continuous, no visual explosions */
  var R=BH.Rr*(BHZ||1);if(R<1)return [x,y];
  var bp=camBH(),bx=bp[0],by=bp[1];
  var dx=x-bx,dy=y-by,d2=dx*dx+dy*dy;
  var inner=R*1.08,outer=R*9.5,i2=inner*inner,o2=outer*outer;
  /* Far-field / swallowed checks use d² — skip sqrt for the majority of
     background stars that sit outside the lens influence. */
  if(d2<i2)return null;
  if(d2>=o2)return [x,y];

  var d=Math.sqrt(d2)+.001;
  var u=clamp((outer-d)/(outer-inner));
  /* Smooth falloff keeps the lens strong near the horizon but prevents the
     previous R²/d² singular jump that sent constellation lines off-screen. */
  var fall=u*u*(3-2*u);
  var wild=(drag.on&&drag.moved);
  var strength=(wild?2.35:1.25)*BHU.str;
  var f=1+(R*R*strength)/d2;
  f=Math.min(f,1+((wild?2.85:1.72)-1)*BHU.str);
  f=1+(f-1)*fall;

  if(wild){
    var swirl=.24*fall;
    var cs=Math.cos(swirl),sn=Math.sin(swirl);
    var wx=dx*cs-dy*sn,wy=dx*sn+dy*cs;
    dx=wx;dy=wy;
  }
  return [bx+dx*f,by+dy*f];
}
function gravityPos(x,y){
  /* Gargantua continuously lenses the galaxy; during the swallow transition,
     keep the existing spiral pull animation. */
  if(SW)return pull(x,y);
  var q=lens(x,y);
  return q ? [q[0],q[1],0] : [x,y,1];
}
/* ===== Visual Gargantua: "Interstellar Blackhole Gargantua #2 - Pure CSS" =====
   Karya Josetxu, https://codepen.io/josetxu/pen/rNWgNeq — lisensi MIT, Copyright (c) 2026 Josetxu. Palet warna diubah ke nuansa film Interstellar (putih-krem panas -> amber -> ember).
   Teks lisensi lengkap: licenses/gargantua-css-LICENSE.txt (wajib ikut tersimpan di repo).
   CSS-nya di-bake SEKALI jadi sprite lewat SVG <foreignObject> (satuan vmax/px diganti variabel --u supaya horizon = BH.R),
   lalu dipakai sebagai BH.sprite. Per frame tetap cuma drawImage di canvas: lensing, swallow, ring spectrum, drag, mode ROT
   nggak berubah. Kalau bake gagal (engine lama), sprite kanvas lama tetap dipakai. Bandingkan dengan visual lama: ?bh=old */
var BH_CSS={on:!/[?&]bh=old\b/.test(location.search),key:'',spr:null,tok:0,ang:-23.5*Math.PI/180,S:0,R:0};
var BH_CSS_SRC=".gx { display:flex; justify-content:center; align-items:center; overflow:hidden; --white: #fff0e8; --yellow: #e9ab8e; --ember: #8f4a38; --black: #000000; } *, *:before, *:after { box-sizing: border-box; } *:before, *:after { position: absolute; } .gargantua { width: calc(var(--u)*90); height: calc(var(--u)*60); display: flex; justify-content: center; align-items: center; position: relative; transform: rotate(-23.5deg); filter: saturate(1.04); } .gargantua > div { position: absolute; } .bot-photon-ring { width: calc(var(--u)*18); height: calc(var(--u)*10); border-radius: calc(var(--u)*1) calc(var(--u)*1) calc(var(--u)*20) calc(var(--u)*20); box-shadow: 0 0 calc(var(--u)*0.625) calc(var(--u)*0.25) var(--black); top: calc(var(--u)*28.5); border: calc(var(--u)*0.25) solid var(--white); border-top: 0; background: var(--black); margin-left: calc(var(--u)*0.75); box-shadow: 0 0 calc(var(--u)*0.625) calc(var(--u)*0.25) var(--black), calc(var(--u)*0) calc(var(--u)*0) calc(var(--u)*0.625) calc(var(--u)*0.25) var(--yellow), calc(var(--u)*0) calc(var(--u)*-0.375) calc(var(--u)*1.25) calc(var(--u)*-0.375) var(--yellow) inset; } .image-disk { width: calc(var(--u)*22); height: calc(var(--u)*22); border-radius: 100%; top: calc(var(--u)*19); border: calc(var(--u)*2) solid var(--white); box-shadow: 0 calc(var(--u)*0) calc(var(--u)*1.875) calc(var(--u)*0.375) var(--yellow), 0 calc(var(--u)*0) calc(var(--u)*0.625) calc(var(--u)*0.25) var(--yellow) inset; } .image-disk:before, .image-disk:after { content: \"\"; position: absolute; left: calc(var(--u)*-5.365); top: calc(var(--u)*3.85); width: calc(var(--u)*3.5); height: calc(var(--u)*4.5); border-radius: calc(var(--u)*0) calc(var(--u)*0) calc(var(--u)*4.25) calc(var(--u)*1.25); transform: rotate(23deg); box-shadow: calc(var(--u)*2) calc(var(--u)*0.25) calc(var(--u)*0) calc(var(--u)*0.125) white; } .image-disk:after { left: calc(var(--u)*19.885); transform: rotateY(180deg) rotateZ(23deg); } .image-disk-lines { width: calc(var(--u)*22); height: calc(var(--u)*22); border-radius: 100%; background: radial-gradient( circle at 50% 50%, transparent, transparent calc(var(--u)*9.25), var(--yellow) calc(var(--u)*9.5), var(--yellow) calc(var(--u)*9.55), var(--white) calc(var(--u)*9.55), var(--white) calc(var(--u)*9.95), var(--yellow) calc(var(--u)*9.95), var(--yellow) calc(var(--u)*10.05), var(--white) calc(var(--u)*10.05), var(--white) calc(var(--u)*10.35), var(--yellow) calc(var(--u)*10.35), var(--yellow) calc(var(--u)*10.42), var(--white) calc(var(--u)*10.42), var(--white) calc(var(--u)*10.75), var(--yellow) calc(var(--u)*10.75), var(--yellow) calc(var(--u)*10.79), var(--white) calc(var(--u)*10.79), var(--white) calc(var(--u)*10.95), var(--ember) calc(var(--u)*22) ) ; } .accretion-disk { background: radial-gradient( ellipse at 49.5% 40%, transparent, transparent calc(var(--u)*11.15), var(--white) calc(var(--u)*11.15), var(--yellow) calc(var(--u)*11.15), var(--yellow) calc(var(--u)*11.2), var(--white) calc(var(--u)*11.2), var(--white) calc(var(--u)*12.5), var(--yellow) calc(var(--u)*12.5), var(--yellow) calc(var(--u)*12.65), var(--white) calc(var(--u)*12.65), var(--white) calc(var(--u)*13.5), var(--yellow) calc(var(--u)*13.5), var(--yellow) calc(var(--u)*13.55), var(--white) calc(var(--u)*13.55), var(--white) calc(var(--u)*14.45), var(--yellow) calc(var(--u)*14.45), var(--yellow) calc(var(--u)*14.55), var(--white) calc(var(--u)*14.55), var(--white) calc(var(--u)*15.5), var(--yellow) calc(var(--u)*15.5), var(--yellow) calc(var(--u)*15.65), var(--white) calc(var(--u)*15.65), var(--white) calc(var(--u)*16.5), var(--yellow) calc(var(--u)*16.5), var(--yellow) calc(var(--u)*16.65), var(--white) calc(var(--u)*16.65), var(--white) calc(var(--u)*17.6), var(--yellow) calc(var(--u)*17.6), var(--yellow) calc(var(--u)*17.65), var(--white) calc(var(--u)*17.65), var(--white) calc(var(--u)*18.25), var(--yellow) calc(var(--u)*18.25), var(--yellow) calc(var(--u)*18.35), var(--white) calc(var(--u)*18.35), var(--white) calc(var(--u)*19.15), var(--yellow) calc(var(--u)*19.15), var(--yellow) calc(var(--u)*19.35), var(--white) calc(var(--u)*19.35), var(--white) calc(var(--u)*19.95), var(--yellow) calc(var(--u)*19.95), var(--yellow) calc(var(--u)*20.05), var(--white) calc(var(--u)*20.05), var(--white) calc(var(--u)*20.75), var(--yellow) calc(var(--u)*20.75), var(--yellow) calc(var(--u)*20.85), var(--white) calc(var(--u)*20.85), var(--white) calc(var(--u)*21.5), var(--yellow) calc(var(--u)*21.5), var(--yellow) calc(var(--u)*21.55), var(--white) calc(var(--u)*21.55), var(--white) calc(var(--u)*22.5), var(--yellow) calc(var(--u)*22.5), var(--yellow) calc(var(--u)*22.65), var(--white) calc(var(--u)*22.65), var(--white) calc(var(--u)*23.45), var(--yellow) calc(var(--u)*23.45), var(--yellow) calc(var(--u)*23.52), var(--white) calc(var(--u)*23.55) ), radial-gradient( ellipse at 49.5% 37%, var(--black), var(--black) calc(var(--u)*9.25), var(--white) calc(var(--u)*9.5), var(--white) ) ; width: calc(var(--u)*54); height: calc(var(--u)*6); border-radius: 100%; top: calc(var(--u)*28.5); box-shadow: 0 0 calc(var(--u)*0.375) 0 var(--white), 0 calc(var(--u)*0) calc(var(--u)*1.875) calc(var(--u)*0.375) var(--yellow), 0 0 calc(var(--u)*4.5) calc(var(--u)*1.2) rgba(190,105,78,.34), 0 calc(var(--u)*1.875) calc(var(--u)*1.25) calc(var(--u)*1.25) var(--black); } .top-photon-ring { width: calc(var(--u)*17); height: calc(var(--u)*9); border-radius: calc(var(--u)*20) calc(var(--u)*20) calc(var(--u)*1) calc(var(--u)*1); background: var(--black); top: calc(var(--u)*21.5); box-shadow: 0 calc(var(--u)*0.625) calc(var(--u)*0) calc(var(--u)*0.25) var(--black), calc(var(--u)*-0.375) calc(var(--u)*0.625) calc(var(--u)*0) calc(var(--u)*0.25) var(--black), calc(var(--u)*0.5) calc(var(--u)*0.625) calc(var(--u)*0) calc(var(--u)*0.25) var(--black), calc(var(--u)*-0.25) calc(var(--u)*0.375) calc(var(--u)*0.375) calc(var(--u)*0) var(--yellow); } .top-photon-ring:before { content: \"\"; width: calc(var(--u)*18); height: calc(var(--u)*3); background: black; left: calc(var(--u)*-0.5); border-radius: 100%; bottom: calc(var(--u)*-7.6); box-shadow: 0 0 calc(var(--u)*0.125) calc(var(--u)*0.125) var(--black); position: relative; display: block; } .top-photon-ring:after { content: \"\"; opacity: 0.75; width: calc(var(--u)*17); height: calc(var(--u)*17); border: calc(var(--u)*0.25) solid var(--white); border-radius: 100%; border-bottom-color: transparent; border-left-color: transparent; transform: rotate(-46deg); left: calc(var(--u)*0.25); top: calc(var(--u)*1.25); box-shadow: calc(var(--u)*-0.625) calc(var(--u)*0.625) calc(var(--u)*0.625) calc(var(--u)*-0.5) var(--yellow) inset, calc(var(--u)*0.25) calc(var(--u)*-0.25) calc(var(--u)*0.5) calc(var(--u)*-0.25) var(--yellow); }";
function bhCssApply(R,S,d){
  if(!BH_CSS.on||typeof Image==='undefined')return;
  var key=Math.round(R*100)+'|'+d+'|'+S;
  if(BH_CSS.spr&&BH_CSS.key===key){BH.sprite=BH_CSS.spr;BH.S=S;BH.ang=BH_CSS.ang;return;} /* ukuran sama: pakai ulang, nggak bake lagi */
  /* Selama bake ukuran baru jalan, tetap pakai sprite CSS lama (diskalakan ke R baru) -> nggak kedip ke visual kanvas lama. */
  if(BH_CSS.spr&&BH_CSS.R>0){BH.sprite=BH_CSS.spr;BH.S=BH_CSS.S*R/BH_CSS.R;BH.ang=BH_CSS.ang;}
  var tok=++BH_CSS.tok,P=Math.ceil(S*d),u=(R*d)/9.1;
  var svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+P+'" height="'+P+'"><foreignObject x="0" y="0" width="'+P+'" height="'+P+'">'+
    '<div xmlns="http://www.w3.org/1999/xhtml" class="gx" style="--u:'+u.toFixed(3)+'px;width:'+P+'px;height:'+P+'px"><style>'+BH_CSS_SRC+'</style>'+
    '<div class="gargantua"><div class="bot-photon-ring"></div><div class="image-disk"></div><div class="image-disk-lines"></div><div class="accretion-disk"></div><div class="top-photon-ring"></div></div></div></foreignObject></svg>';
  var img=new Image();
  img.onload=function(){
    if(tok!==BH_CSS.tok)return; /* sudah ada permintaan ukuran yang lebih baru */
    try{
      var c=document.createElement('canvas');c.width=c.height=P;c.getContext('2d').drawImage(img,0,0,P,P);
      BH_CSS.spr=c;BH_CSS.key=key;BH_CSS.S=S;BH_CSS.R=R;BH.sprite=c;BH.S=S;BH.ang=BH_CSS.ang;
    }catch(e){window.__hub&&(window.__hub.renderError='bhCss: '+(e&&e.message||e));}
  };
  img.onerror=function(){}; /* tetap pakai sprite lama */
  img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
}
function buildSprite(){                   /* layered gravitational lens: luminous, deep, photorealistic feel + Doppler / photon ring / secondary lens */
  var R=BH.R,S=Math.ceil(R*13),d=DPR,c=document.createElement('canvas');
  c.width=c.height=Math.ceil(S*d);
  var s=c.getContext('2d');s.scale(d,d);
  var cx=S/2,cy=S/2;

  /* Broad atmospheric scattering: soft blue-white, never neon. */
  s.globalCompositeOperation='lighter';
  var halo=s.createRadialGradient(cx,cy,R*.72,cx,cy,R*(IS_POTATO?2.7:4.0));
  halo.addColorStop(0,'rgba(220,238,255,.13)');
  halo.addColorStop(.24,'rgba(155,195,235,.10)');
  halo.addColorStop(.48,'rgba(100,145,195,.055)');
  halo.addColorStop(.72,'rgba(55,85,125,.025)');
  halo.addColorStop(1,'rgba(20,35,55,0)');
  s.fillStyle=halo;s.beginPath();s.arc(cx,cy,R*4,0,6.283);s.fill();

  /* Multiple lensing layers: the thick luminous structure around the horizon. */
  var layers=IS_POTATO?[
    {r:1.16,w:.070,c:'rgba(175,205,235,.34)',b:.12},
    {r:1.035,w:.032,c:'rgba(250,252,252,.88)',b:.08}
  ]:[
    {r:1.34,w:.105,c:'rgba(92,140,195,.18)',b:.28},
    {r:1.23,w:.080,c:'rgba(150,190,230,.30)',b:.24},
    {r:1.14,w:.055,c:'rgba(220,235,246,.54)',b:.18},
    {r:1.075,w:.034,c:'rgba(250,252,250,.84)',b:.13},
    {r:1.025,w:.022,c:'rgba(255,255,252,.96)',b:.10}
  ];
  layers.forEach(function(L){
    s.strokeStyle=L.c;s.lineWidth=Math.max(.8,R*L.w);
    s.shadowColor=L.c;s.shadowBlur=R*L.b;
    s.beginPath();s.arc(cx,cy,R*L.r,0,6.283);s.stroke();
  });
  s.shadowBlur=0;

  /* Broad, layered accretion disk with Doppler beaming asymmetry.
     Approaching side (left, blueshift) is brighter/cooler; receding side (right, redshift) is warmer/dimmer. */
  var ang=-.48;
  s.save();s.translate(cx,cy);s.rotate(ang);
  var outer=s.createLinearGradient(-R*5.1,0,R*5.1,0);
  outer.addColorStop(0,'rgba(45,80,130,0)');
  outer.addColorStop(.10,'rgba(90,150,210,.14)');
  outer.addColorStop(.22,'rgba(160,210,245,.38)');
  outer.addColorStop(.36,'rgba(230,245,255,.72)');
  outer.addColorStop(.46,'rgba(255,255,252,.92)');
  outer.addColorStop(.54,'rgba(255,200,160,.48)');
  outer.addColorStop(.66,'rgba(180,120,90,.22)');
  outer.addColorStop(.80,'rgba(100,70,55,.08)');
  outer.addColorStop(1,'rgba(35,40,50,0)');
  s.fillStyle=outer;s.shadowColor='rgba(170,205,240,.34)';s.shadowBlur=R*.34;
  s.beginPath();s.ellipse(0,0,R*(IS_POTATO?3.8:4.9),R*(IS_POTATO?.11:.16),0,0,6.283);s.fill();
  s.shadowBlur=0;

  var mid=s.createLinearGradient(-R*4.7,0,R*4.7,0);
  mid.addColorStop(0,'rgba(70,130,200,0)');
  mid.addColorStop(.28,'rgba(150,205,245,.22)');
  mid.addColorStop(.42,'rgba(240,248,255,.70)');
  mid.addColorStop(.50,'rgba(255,245,230,.58)');
  mid.addColorStop(.60,'rgba(255,190,140,.32)');
  mid.addColorStop(.76,'rgba(140,90,70,.12)');
  mid.addColorStop(1,'rgba(50,40,35,0)');
  s.fillStyle=mid;s.beginPath();s.ellipse(0,0,R*(IS_POTATO?3.7:4.75),R*(IS_POTATO?.055:.075),0,0,6.283);s.fill();
  s.restore();

  /* Secondary lens is drawn dynamically in drawHole so it always shares the
     live disk inclination (including inertia wobble while dragging). */

  /* Dark event horizon: clean and deep. */
  s.globalCompositeOperation='source-over';
  s.fillStyle='#000102';s.beginPath();s.arc(cx,cy,R*1.015,0,6.283);s.fill();

  /* Photon sphere / gravitational redshift ring — thin warm rim just inside Einstein ring. */
  s.globalCompositeOperation='lighter';
  s.strokeStyle='rgba(255,90,45,.32)';
  s.lineWidth=Math.max(.5,R*.012);
  s.beginPath();s.arc(cx,cy,R*1.012,0,6.283);s.stroke();
  s.strokeStyle='rgba(255,140,70,.18)';
  s.lineWidth=Math.max(.4,R*.008);
  s.beginPath();s.arc(cx,cy,R*1.006,0,6.283);s.stroke();

  /* Crisp Einstein ring over the horizon. */
  s.strokeStyle='rgba(250,252,252,.96)';s.lineWidth=Math.max(1,R*.026);
  s.shadowColor='rgba(195,220,246,.62)';s.shadowBlur=R*.18;
  s.beginPath();s.arc(cx,cy,R*1.028,0,6.283);s.stroke();
  s.shadowBlur=0;

  /* Foreground edge of the disk crosses in front of the black hole (Doppler-aware). */
  s.save();s.translate(cx,cy);s.rotate(ang);
  var fg=s.createLinearGradient(-R*4.8,0,R*4.8,0);
  fg.addColorStop(0,'rgba(55,100,170,0)');
  fg.addColorStop(.20,'rgba(140,195,240,.18)');
  fg.addColorStop(.36,'rgba(235,245,255,.55)');
  fg.addColorStop(.47,'rgba(255,255,252,.88)');
  fg.addColorStop(.55,'rgba(255,210,175,.50)');
  fg.addColorStop(.68,'rgba(180,120,85,.16)');
  fg.addColorStop(1,'rgba(45,35,30,0)');
  s.fillStyle=fg;s.shadowColor='rgba(220,235,250,.38)';s.shadowBlur=R*.16;
  s.beginPath();s.ellipse(0,0,R*(IS_POTATO?3.7:4.7),R*(IS_POTATO?.026:.038),0,0,6.283);s.fill();
  s.restore();

  s.shadowBlur=0;s.globalCompositeOperation='source-over';
  BH.sprite=c;BH.S=S;BH.ang=-.48;
  bhCssApply(R,S,d); /* ganti dengan visual Gargantua CSS (sync kalau sudah pernah di-bake untuk ukuran ini) */
}

var BH_BLOOM=null;
function bhBloomSprite(){
  if(BH_BLOOM)return BH_BLOOM;
  var c=document.createElement('canvas');c.width=c.height=192;
  var x=c.getContext('2d'),gr=x.createRadialGradient(96,96,17,96,96,96);
  gr.addColorStop(0,'rgba(255,228,210,.55)');gr.addColorStop(.28,'rgba(242,164,132,.26)');
  gr.addColorStop(.55,'rgba(176,84,62,.10)');gr.addColorStop(1,'rgba(112,46,36,0)');
  x.fillStyle=gr;x.fillRect(0,0,192,192);
  return (BH_BLOOM=c);
}
/* Overlay serat cakram + lengkung lensa (mirip render film): di-bake SEKALI ke satu kanvas, lalu per frame cuma 1x drawImage.
   Isi: haze bidang cakram, serat tipis yang melebar di kiri-kanan, serat lengkung tebal di atas lubang, dan lengkung lensa bawah.
   Dibuat dalam frame cakram (sudah diputar BH.ang). Re-bake hanya kalau BH.R / DPR berubah. */
var BH_FIB=null;
function bhFiberSprite(){
  var R=BH.R,d=DPR||1,key=Math.round(R*d*10);
  if(BH_FIB&&BH_FIB.key===key)return BH_FIB;
  if(!(R>2))return BH_FIB;
  var w=R*13,h=R*8,c=document.createElement('canvas');
  c.width=Math.ceil(w*d);c.height=Math.ceil(h*d);
  var x=c.getContext('2d');x.scale(d,d);x.translate(w/2,h/2);
  x.globalCompositeOperation='lighter';x.lineCap='round';
  var seed=1337;function rnd(){seed|=0;seed=seed+0x6D2B79F5|0;var t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}
  var lite=IS_POTATO,lw0=Math.max(.35,.5/d);
  /* haze tipis sepanjang bidang cakram */
  x.save();x.scale(1,.075);
  var hz=x.createRadialGradient(0,0,R*1.2,0,0,R*5.4);
  hz.addColorStop(0,'rgba(255,214,190,0)');hz.addColorStop(.28,'rgba(255,214,190,.20)');hz.addColorStop(.55,'rgba(228,142,108,.09)');hz.addColorStop(1,'rgba(150,70,50,0)');
  x.fillStyle=hz;x.beginPath();x.arc(0,0,R*5.4,0,6.283);x.fill();x.restore();
  /* serat horizontal: makin jauh makin tipis, hangat, ujung kiri sedikit lebih panjang (kayak referensi) */
  var NS=lite?20:52;
  for(var side=-1;side<=1;side+=2){
    for(var i=0;i<NS;i++){
      var x0=R*(1.75+rnd()*.9),len=R*(1.1+Math.pow(rnd(),1.3)*2.9)*(side<0?1.18:1),x1=x0+len;
      var up=(rnd()<.62)?1:-.25,hh=R*(.02+rnd()*.17)*up,ty=R*(rnd()-.5)*.09,a=.10+rnd()*.24;
      var gr=x.createLinearGradient(side*x0,0,side*x1,0);
      gr.addColorStop(0,'rgba(255,238,228,'+a+')');gr.addColorStop(.32,'rgba(240,176,142,'+(a*.72)+')');
      gr.addColorStop(.72,'rgba(176,102,72,'+(a*.36)+')');gr.addColorStop(1,'rgba(96,52,40,0)');
      x.strokeStyle=gr;x.lineWidth=Math.max(lw0,R*(.005+rnd()*.016));
      x.beginPath();x.moveTo(side*x0,-hh);
      x.quadraticCurveTo(side*(x0+len*.5),-hh*.35+R*(rnd()-.5)*.03,side*x1,ty);x.stroke();
    }
  }
  /* serat lengkung: half-annulus; dir=-1 atas (lensa depan), dir=+1 bawah (lensa belakang cakram) */
  function arcs(dir,n,r0,r1,cy,aMax,ry){
    for(var i=0;i<n;i++){
      var u=Math.pow(rnd(),1.35),r=R*(r0+u*(r1-r0)),a=aMax*(.55+.45*rnd())*(1-.45*u);
      var ca=Math.PI*(.015+rnd()*.16),cb=Math.PI*(.985-rnd()*.16),segs=lite?5:9;
      var cr=Math.round(255-(41*u)),cg=Math.round(238-(98*u)),cbl=Math.round(232-(122*u));
      x.lineWidth=Math.max(lw0,R*(.008+rnd()*.02));
      for(var s=0;s<segs;s++){
        var t0=s/segs,t1=(s+1)/segs,tm=(t0+t1)/2,env=Math.pow(Math.sin(Math.PI*tm),.8);
        x.strokeStyle='rgba('+cr+','+cg+','+cbl+','+(a*env)+')';
        x.beginPath();
        x.ellipse(0,dir*R*cy,r,r*ry,0,dir*(ca+(cb-ca)*t0),dir*(ca+(cb-ca)*t1),dir<0);
        x.stroke();
      }
    }
  }
  arcs(-1,lite?26:70,1.2,1.9,.04,.36,.93); /* tebalkan lengkung atas */
  arcs(1,lite?22:64,1.12,1.68,.08,.34,.95);  /* lengkung lensa bawah */
  return(BH_FIB={key:key,c:c,w:w,h:h});
}
function drawHoleFallback(now,age){
  /* Compatibility fallback for older/mobile canvas engines.  If the layered
     sprite cannot be drawn, keep Gargantua visible with only basic Canvas 2D
     primitives so one unsupported effect cannot make the whole scene vanish. */
  var a=clamp((age-.9)/1.5),sc=1-Math.pow(1-a,3),e=SW?ease(swP):0;
  var R=Math.max(.1,BH.R*sc*(1+1.6*e)*BHZ*BHSC);
  if(R<.5)return;
  var bp=camBH();
  g.save();g.translate(bp[0],bp[1]);
  if(STG.rot)g.rotate(upAng());
  g.globalCompositeOperation='source-over';
  /* accretion disk */
  g.save();g.rotate(-.48);
  g.fillStyle='rgba(120,165,215,.16)';g.beginPath();g.ellipse(0,0,R*4.8,R*.13,0,0,6.283);g.fill();
  g.fillStyle='rgba(240,235,230,.52)';g.beginPath();g.ellipse(0,0,R*4.1,R*.045,0,0,6.283);g.fill();
  g.restore();
  /* luminous lens rings */
  g.strokeStyle='rgba(150,190,225,.32)';g.lineWidth=Math.max(1,R*.18);g.beginPath();g.arc(0,0,R*1.25,0,6.283);g.stroke();
  g.strokeStyle='rgba(235,243,248,.78)';g.lineWidth=Math.max(1,R*.075);g.beginPath();g.arc(0,0,R*1.08,0,6.283);g.stroke();
  /* event horizon */
  g.fillStyle='#000102';g.beginPath();g.arc(0,0,R,0,6.283);g.fill();
  g.strokeStyle='rgba(255,255,252,.95)';g.lineWidth=Math.max(1,R*.055);g.beginPath();g.arc(0,0,R*1.025,0,6.283);g.stroke();
  g.restore();
}
function drawHoleSafe(now,age){
  try{
    drawHole(now,age);
    /* Some older engines fail silently around offscreen canvas sprites. */
    if(!BH.sprite || !BH.Rr)drawHoleFallback(now,age);
  }catch(err){
    window.__hub.renderError='drawHole: '+(err&&err.message||err);
    drawHoleFallback(now,age);
  }
}
function drawHole(now,age){
  var a=clamp((age-.9)/1.5),sc=1-Math.pow(1-a,3),e=SW?ease(swP):0;
  BH.Rr=BH.R*sc*(1+1.6*e)*BHSC*bhSizeMul();
  if(BH.Rr<1||!BH.sprite)return;

  BH.h+=((hot==='bh'?1:0)-BH.h)*.12;
  var R=BH.Rr*BHZ,k=((BH.Rr)/BH.R)*(1+(reduce?0:.012*Math.sin(now*.0016*BHU.speed))),S=BH.S*k*BHZ;
  var bp=camBH();
  var gk=OFX.pK; /* 0..1: seberapa "hidup" Gargantua saat BGM Collapsars main */
  var bhFull=!!(BH_CSS.spr&&BH.sprite===BH_CSS.spr),bhCS=bhFull?.72:1; /* disk CSS lebih pendek dari sprite lama: overlay horizontal ikut diskalakan */

  g.save();
  g.translate(bp[0],bp[1]);
  if(STG.rot)g.rotate(upAng()); /* BH tegak seperti di portrait */

  /* Core + static portal artwork */
  /* Bloom hangat (warna film) di belakang sprite: satu drawImage dari sprite gradien yang di-cache. */
  if(bhFull&&BHU.bloom>.01){
    var bhr=R*4.6,bha=Math.min(1,.42*BHU.bloom*(1+.35*gk+.15*BH.h+.3*e));
    g.globalCompositeOperation='lighter';g.globalAlpha=bha;
    g.drawImage(bhBloomSprite(),-bhr,-bhr,bhr*2,bhr*2);
    g.globalAlpha=1;g.globalCompositeOperation='source-over';
  }
  g.globalAlpha=Math.min(1,.86+.14*BH.h+.5*e+.08*gk);
  g.drawImage(BH.sprite,-S/2,-S/2,S,S);
  g.globalAlpha=1;
  /* Overlay serat cakram: slider Bloom mengatur intensitas; berkedip halus kecuali reduce-motion / potato. */
  if(bhFull&&BHU.bloom>.01&&BH.S>0){
    var fb=bhFiberSprite();
    if(fb){
      var fk=S/BH.S,fsh=(reduce||IS_POTATO)?0:Math.sin(now*.0011*BHU.speed);
      var fa=Math.min(1,(.8+.2*BH.h+.4*e+.12*gk)*Math.min(1,.5+.5*BHU.bloom))*(1+.1*(reduce||IS_POTATO?0:Math.sin(now*.0007*BHU.speed+1.3)));
      var fw=fb.w*fk*(1+.012*fsh),fh=fb.h*fk;
      g.save();g.rotate(BH.ang);g.globalCompositeOperation='lighter';g.globalAlpha=Math.min(1,fa);
      g.drawImage(fb.c,-fw/2,-fh/2,fw,fh);
      g.restore();
    }
  }

  /* Audio-reactive Gargantua ring. The black hole core and drag physics are
     untouched; this is a visual layer drawn on top of the normal ring only
     while one of Betelgeuse/Rigel/Spica SFX is actively playing. */
  drawAudioVisualizer(now,R);

  /*
   * Animated gravitational pulse rings.
   * They are deliberately offset in phase so Gargantua feels alive even
   * when it is not being dragged.
   */
  if(!reduce){
    g.globalCompositeOperation='lighter';

    if(!bhFull){ /* visual CSS sudah lengkap sendiri: hiasan kanvas lama dilewati (lebih ringan juga) */
    /* One restrained breathing Einstein ring: slow, shallow, photorealistic. */
    var breathe=.5+.5*Math.sin(now*.00115);
    var ringR=R*(1.022+.012*breathe);
    g.globalAlpha=bhCS<1?.5:1; /* ring CSS sudah ada: redam breathing ring */
    /* Blur-free breathing ring: wide translucent halo stroke + bright core.
       Avoid dynamic shadowBlur on every frame for mobile canvas performance. */
    g.strokeStyle='rgba(185,215,245,'+(.09+.06*breathe+.05*gk)+')';
    g.lineWidth=Math.max(1,R*(.065+.018*breathe));
    g.beginPath();g.arc(0,0,ringR,0,6.283);g.stroke();
    g.strokeStyle='rgba(238,245,248,'+(.55+.18*breathe+.12*gk)+')';
    g.lineWidth=Math.max(.65,R*(.022+.008*breathe));
    g.beginPath();g.arc(0,0,ringR,0,6.283);g.stroke();

    g.globalAlpha=1;
    /* Extremely faint expanding lens ripples, spaced far apart. */
    var pulseT=now*.00022;
    for(var pr=0;pr<(IS_POTATO?1:3);pr++){
      var ph=(pulseT+pr/3)%1;
      var rr=R*(2.0+ph*4.0);
      var al=(1-ph)*.035;
      g.strokeStyle='rgba(150,185,220,'+al+')';
      g.lineWidth=.55;
      g.beginPath();g.arc(0,0,rr,0,6.283);g.stroke();
    }

    } /* end !bhFull */
    /* Disk plane is fixed at ang=-.48 (matches the baked sprite).
       Secondary lens + plasma MUST use this same angle always — never apply
       drag wobble here, or they separate from the sprite disk. */
    var diskAng=BH.ang; /* bidang cakram sprite (-.48 visual lama, -23.5deg visual CSS) */
    var sp=.00024*(1+.55*BH.h+1.8*e);
    g.save();g.rotate(diskAng);
    if(gk>.01){
      /* Collapsars: cakram akresi berdenyut pelan (hangat), lebih terang dari biasanya. */
      var gp=.5+.5*Math.sin(now*.0013*BHU.speed);
      g.fillStyle='rgba(255,176,110,'+(.07*gk*(.65+.35*gp))+')';
      g.beginPath();g.ellipse(0,0,R*(3.9+.25*gp)*bhCS,R*(.20+.03*gp),0,0,6.283);g.fill();
      g.fillStyle='rgba(255,222,184,'+(.10*gk*(.5+.5*gp))+')';
      g.beginPath();g.ellipse(0,0,R*2.5*bhCS,R*.09,0,0,6.283);g.fill();
    }
    if(bhFull&&BHU.speed>.01){ /* kilau plasma di sepanjang cakram CSS; kecepatan = slider speed */
      var sp2=.00020*BHU.speed*(1+.55*BH.h+1.8*e);
      for(var m2=0;m2<(IS_POTATO?3:6);m2++){
        var q2=(now*sp2+OFX.dph+m2/6)%1,uu=q2*2-1;
        var al3=Math.pow(1-Math.abs(uu),1.8)*(.22+.14*BH.h+.10*gk)*Math.min(1,.6+.4*BHU.bloom);
        g.fillStyle='rgba(255,233,216,'+al3+')';
        g.beginPath();g.ellipse(uu*R*2.7,R*(.015+((m2%3)-1)*.05),R*(.05+.025*(1-Math.abs(uu))),R*.02,0,0,6.283);g.fill();
      }
    }
    if(!bhFull){
    for(var m=0;m<(IS_POTATO?3:7);m++){
      var ph2=(now*sp+OFX.dph+m/7)%1,u=ph2*2-1;
      var al2=Math.pow(1-Math.abs(u),1.9)*(.16+.12*BH.h+.10*e+.10*gk);
      var tilt=(m%3-1)*.18;
      g.fillStyle='rgba(235,240,245,'+al2+')';
      g.beginPath();
      g.ellipse(u*R*4.1*bhCS,R*(.02+tilt*.04),R*(.025+.012*(1-Math.abs(u))),R*.016,tilt,0,6.283);
      g.fill();
    }
    if(!IS_POTATO){
      for(var sa=0;sa<3;sa++){
        var sph=(now*sp*.55+OFX.dph*.55+sa*.33)%1;
        var saAl=(1-Math.abs(sph*2-1))* (.07+.05*BH.h);
        g.strokeStyle='rgba(200,220,240,'+saAl+')';
        g.lineWidth=.55;
        g.beginPath();
        g.ellipse(0,0,R*(3.2+sa*.55)*bhCS,R*(.045+sa*.012),sph*.4-0.2,0,6.283);
        g.stroke();
      }
      if(bhCS===1){ /* visual CSS sudah punya photon ring sendiri -> secondary lens kanvas dilewati */
      /* Secondary lens — locked to sprite disk plane (no drag wobble). */
      g.lineWidth=Math.max(.55,R*.016);
      g.strokeStyle='rgba(200,220,245,'+(.28+.14*gk)+')';
      g.beginPath();
      g.ellipse(0,-R*.02,R*1.55,R*.38,0,Math.PI*1.15,Math.PI*1.85);
      g.stroke();
      g.strokeStyle='rgba(240,245,255,'+(.18+.12*gk)+')';
      g.beginPath();
      g.ellipse(0,-R*.02,R*1.42,R*.28,0,Math.PI*1.2,Math.PI*1.8);
      g.stroke();
      g.strokeStyle='rgba(200,220,245,'+(.22+.12*gk)+')';
      g.beginPath();
      g.ellipse(0,R*.02,R*1.55,R*.38,0,Math.PI*.15,Math.PI*.85);
      g.stroke();
      g.strokeStyle='rgba(240,245,255,'+(.14+.10*gk)+')';
      g.beginPath();
      g.ellipse(0,R*.02,R*1.42,R*.28,0,Math.PI*.2,Math.PI*.8);
      g.stroke();
      }
    }
    } /* end !bhFull */
    g.restore();
  }

  g.restore();

  if(drag.on&&drag.moved&&!reduce){
    g.save();g.globalCompositeOperation='lighter';
    /* Extra disk highlight while dragging. Rotation is LOCKED to the same
       fixed diskAng as the secondary lens (-.48) — it used to add a
       velocity-based wobble (-.48+wob2) on top of that, which visibly
       rotated this ring away from the locked secondary lens/sprite disk
       during fast drags, reading as the secondary lens "splitting off".
       Drag velocity now only modulates brightness (wobS2), never angle. */
    var vx2=(BH.x-drag.bx)*.0025,vy2=(BH.y-drag.by)*.0025;
    var wobS2=Math.min(1,Math.hypot(vx2,vy2)*8);
    g.save();
    g.translate(bp[0],bp[1]);
    g.rotate(BH.ang+upAng()); /* landscape: ikut tegak bareng BH */
    g.strokeStyle='rgba(255,200,140,'+(.10+.08*wobS2)+')';
    g.lineWidth=Math.max(.7,R*.02);
    g.beginPath();g.ellipse(0,0,R*4.3*bhCS,R*.09,0,0,6.283);g.stroke();
    g.strokeStyle='rgba(255,220,190,'+(.06+.05*wobS2)+')';
    g.lineWidth=Math.max(.5,R*.012);
    g.beginPath();g.ellipse(0,0,R*3.6*bhCS,R*.04,0,0,6.283);g.stroke();
    g.restore();
    /* Warp-ring loop is the expensive part of this effect (one arc+stroke
       call per ring, every frame, for the whole drag gesture). Cut the
       ring count well down (was a flat 18, even on low-end devices) and
       keep the falloff spacing/opacity curve scaled to the new count so
       the look stays the same, just cheaper to draw. */
    var ringN=IS_POTATO?4:9;
    for(var di=1;di<=ringN;di++){
      var dr=R*(2.2+di*(66.6/ringN)), da2=.34*(1-di/(ringN+2));
      g.strokeStyle='rgba(205,150,100,'+(da2*.42)+')';g.lineWidth=.8+(di===1?.5:0);
      g.beginPath();g.arc(bp[0],bp[1],dr,0,6.283);g.stroke();
    }
    var grd=g.createRadialGradient(bp[0],bp[1],R*.8,bp[0],bp[1],R*28);
    grd.addColorStop(0,'rgba(255,200,140,.10)');
    grd.addColorStop(.22,'rgba(240,190,140,.035)');
    grd.addColorStop(.5,'rgba(190,120,80,.018)');
    grd.addColorStop(1,'rgba(150,90,60,0)');
    g.fillStyle=grd;g.beginPath();g.arc(bp[0],bp[1],R*11,0,6.283);g.fill();
    g.restore();
  }

  if(SW){
    var f=clamp((swP-.80)/.18);
    if(f>0){
      var fr=Math.sqrt(W*W+H*H)*(.12+.75*f),
          gr=g.createRadialGradient(bp[0],bp[1],0,bp[0],bp[1],fr);
      gr.addColorStop(0,'rgba(232,250,255,'+(.95*f)+')');
      gr.addColorStop(.4,'rgba(110,229,255,'+(.55*f)+')');
      gr.addColorStop(1,'rgba(110,229,255,0)');
      g.fillStyle=gr;g.fillRect(0,0,W,H);
    }
  }
}
/* ===== DUMUL neural network (kode SAMA di index.html & dumul.html — jangan diubah sebelah saja) =====
   Layout deterministik (seed tetap, koordinat relatif ke viewport) → posisi node & garis
   di index.html (saat masuk) identik dengan di dumul.html (saat tiba). */
/* Kotak hero dumul.html (posisi & ukuran og.webp + neural network). Dipakai SAMA di index.html & dumul.html.
   dumul.html mengukur hero aslinya lalu menyimpannya (tidak ada lagi: sekarang murni dihitung dari lebar layar). */
function dmHeroRect(){
  /* DETERMINISTIK: semua angka turunan dari lebar layar saja (tanpa pengukuran DOM / localStorage),
     jadi index.html (transisi) dan dumul.html (hero asli) SELALU menghasilkan kotak yang sama. */
  var W=document.documentElement.clientWidth||window.innerWidth||360;
  var wide=W>=640;
  var padTop=wide?56:30,titleH=wide?46:30,gap0=24,meshH=132;
  var tb=padTop+titleH;                       /* dasar judul DUMUL */
  /* Titik jembatan cahaya di og.webp (fraksi 720x720) & puncak kepala siluet. */
  var BX=.49,BY=.527,HEADY=.165,IW=720,IH=720;
  /* Skala gambar = lebar layar (kepala tetap utuh); bawah gambar dipudarkan lewat mask. */
  var s=Math.max(W/IW,(W/2)/(BX*IW),(W/2)/((1-BX)*IW));
  var dw=IW*s,dh=IH*s;
  /* Turunkan mesh + gambar bersama-sama (jembatan tetap di pusat mesh) sampai puncak kepala
     berada di bawah judul → judul punya ruang bersih. Layar lebar: kepala memang terpotong, tidak perlu. */
  var off=(BY-HEADY)*dh;                      /* jarak jembatan → puncak kepala */
  var extra=wide?0:Math.max(0,Math.min(160,Math.round(off-(gap0+meshH/2)+24)));
  var my=tb+gap0+extra;                       /* atas kanvas mesh */
  var heroH=(wide?344:308)+(W>=480?50:64)+extra; /* + ruang tetap baris lirik (#dm-hl) */
  var cx=W/2,cy=my+meshH/2;
  var ix=cx-BX*dw,iy=cy-BY*dh;
  /* Mask gambar (koordinat piksel elemen): transparan di belakang judul, muncul perlahan, pudar di bawah. */
  var a0=Math.max(0,tb-10-iy),a1=Math.max(a0+1,tb+30-iy),d1=dh,c1=Math.max(a1+1,dh*.72);
  var mg='linear-gradient(to bottom,transparent 0,transparent '+a0.toFixed(1)+'px,#000 '+a1.toFixed(1)+'px,#000 '+c1.toFixed(1)+'px,transparent '+d1.toFixed(1)+'px)';
  var mw=Math.round(Math.min(W*.92,640));
  return{x:0,y:0,w:W,h:heroH,m:{x:Math.round((W-mw)/2),y:my,w:mw,h:meshH},img:{x:ix,y:iy,w:dw,h:dh},mask:mg,gap:gap0+extra,padTop:padTop,titleH:titleH};
}
var DM_NN_DUR=5600;
var DM_MESH_H=132,DM_TR_MESH_W=0,DM_TR_MESH_H=0,DM_TR_MESH_X=0,DM_TR_MESH_Y=0,DM_TR_GLITCH_V=0,DM_TR_GLITCH_S=0,DM_TR_GLITCH_SEEN=0;
function dmNeuralBuild(W,H){
  /* Mesh neural horizontal (referensi og.webp): pita di antara dua siluet,
     node mengambang, garis menyambung seperti koneksi di gambar. */
  function rng(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
  var R=rng(1717),pts=[],i,j,k;
  /* [u, v, colFlag] — colFlag 0=cyan, 1=pink. Posisi relatif ke hero (og.webp). */
  var layout=[
    /* left cluster (dekat siluet kiri) */
    [.08,.48,0],[.14,.34,0],[.16,.58,1],[.22,.44,0],[.24,.62,0],
    /* mid-left */
    [.30,.32,1],[.32,.50,0],[.36,.66,1],[.40,.40,0],[.42,.56,0],
    /* center bridge */
    [.48,.36,0],[.50,.52,1],[.54,.44,0],[.56,.62,0],[.58,.30,1],
    /* mid-right */
    [.64,.48,0],[.68,.34,1],[.70,.58,0],[.74,.42,0],[.76,.64,1],
    /* right cluster (dekat siluet kanan) */
    [.82,.36,0],[.86,.52,1],[.90,.42,0],[.92,.58,0]
  ];
  for(i=0;i<layout.length;i++){
    var L=layout[i];
    var u=L[0]+(R()-.5)*.01,v=L[1]+(R()-.5)*.012;
    u=Math.max(.04,Math.min(.96,u));v=Math.max(.22,Math.min(.72,v));
    pts.push({
      u:u,v:v,x:u*W,y:v*H,
      bx:u*W,by:v*H, /* base pos untuk drift */
      r:1.4+R()*1.8,
      ph:R()*Math.PI*2,
      ph2:R()*Math.PI*2,
      col:L[2]?'255, 122, 217':'110, 229, 255',
      tc:1e9,link:0,a:0,
      drift:0.6+R()*1.1
    });
  }
  var n=pts.length;
  function dist(a,b){return Math.hypot(pts[a].bx-pts[b].bx,pts[a].by-pts[b].by);}
  /* Mulai dari kiri → tumbuh ke kanan (sinyal nyambung antar siluet) */
  var s=0,su=1e18;
  for(i=0;i<n;i++){if(pts[i].u<su){su=pts[i].u;s=i;}}
  var inSet=[],edges=[],used={};
  for(i=0;i<n;i++)inSet.push(false);
  inSet[s]=true;pts[s].tc=260;
  for(var step=1;step<n;step++){
    var bA=-1,bB=-1,bl=1e18;
    for(i=0;i<n;i++){if(!inSet[i])continue;for(j=0;j<n;j++){if(inSet[j])continue;var l=dist(i,j);if(l<bl){bl=l;bA=i;bB=j;}}}
    if(bB<0)break;
    inSet[bB]=true;
    var t0=380+Math.pow((step-1)/Math.max(1,n-2),.9)*3000,du=460;
    edges.push({a:bA,b:bB,t0:t0,dur:du,al:.62,fail:(step%5===3),beam:0});
    pts[bB].tc=t0+du*.65;
    used[Math.min(bA,bB)+'_'+Math.max(bA,bB)]=1;
  }
  /* Triangular mesh: 3 tetangga terdekat */
  var extra=[],maxL=Math.min(W,H)*.38;
  for(i=0;i<n;i++){
    var nb=[];for(j=0;j<n;j++){if(j!==i)nb.push({j:j,l:dist(i,j)});}
    nb.sort(function(p,q){return p.l-q.l;});
    for(k=0;k<3;k++){
      var o=nb[k];if(!o||o.l>maxL)continue;
      var key=Math.min(i,o.j)+'_'+Math.max(i,o.j);
      if(used[key])continue;used[key]=1;extra.push({a:i,b:o.j,l:o.l,beam:0});
    }
  }
  /* Beam horizontal panjang (ciri referensi: garis neon kiri-kanan) */
  var bandY=[.36,.48,.58];
  for(var bi=0;bi<bandY.length;bi++){
    var row=[];
    for(i=0;i<n;i++)if(Math.abs(pts[i].v-bandY[bi])<.10)row.push(i);
    row.sort(function(a,b){return pts[a].u-pts[b].u;});
    for(i=0;i<row.length-1;i++){
      var a=row[i],b=row[i+1];
      if(pts[b].u-pts[a].u>.22)continue; /* jangan lompat terlalu jauh */
      var key=Math.min(a,b)+'_'+Math.max(a,b);
      if(used[key])continue;used[key]=1;
      extra.push({a:a,b:b,l:dist(a,b),beam:1});
    }
  }
  extra.sort(function(p,q){return p.l-q.l;});
  for(i=0;i<extra.length;i++){
    var isB=!!extra[i].beam;
    edges.push({a:extra[i].a,b:extra[i].b,t0:3400+(i/Math.max(1,extra.length))*1300,dur:isB?520:380,al:isB?.78:.36,fail:false,beam:isB?1:0});
  }
  return{nodes:pts,edges:edges};
}
function dmNeuralDraw(g,W,H,net,t){
  g.clearRect(0,0,W,H);
  var nodes=net.nodes,edges=net.edges,i,e,a,b;
  function eo(u){return 1-Math.pow(1-u,3);}
  /* Drift node: ngambang pelan di atas og.webp */
  for(i=0;i<nodes.length;i++){
    var n=nodes[i];
    var dx=Math.sin(t*.0011+n.ph)*n.drift*1.6;
    var dy=Math.cos(t*.0009+n.ph2)*n.drift*1.2;
    n.x=n.bx+dx;n.y=n.by+dy;
  }
  /* Soft horizontal signal bands (referensi) */
  var bandA=Math.min(1,Math.max(0,(t-600)/1800));
  if(bandA>.02){
    var midY=H*.48,bh=Math.max(1.1,H*.01);
    var gx=g.createLinearGradient(0,midY,W,midY);
    gx.addColorStop(0,'rgba(110,229,255,0)');
    gx.addColorStop(.12,'rgba(110,229,255,'+(0.14*bandA).toFixed(3)+')');
    gx.addColorStop(.45,'rgba(255,122,217,'+(0.20*bandA).toFixed(3)+')');
    gx.addColorStop(.55,'rgba(110,229,255,'+(0.18*bandA).toFixed(3)+')');
    gx.addColorStop(.88,'rgba(110,229,255,'+(0.14*bandA).toFixed(3)+')');
    gx.addColorStop(1,'rgba(110,229,255,0)');
    g.fillStyle=gx;
    g.fillRect(0,midY-bh,W,bh*2);
    var midY2=H*.38;
    var gx2=g.createLinearGradient(0,midY2,W,midY2);
    gx2.addColorStop(0,'rgba(110,229,255,0)');
    gx2.addColorStop(.2,'rgba(110,229,255,'+(0.09*bandA).toFixed(3)+')');
    gx2.addColorStop(.8,'rgba(110,229,255,'+(0.09*bandA).toFixed(3)+')');
    gx2.addColorStop(1,'rgba(110,229,255,0)');
    g.fillStyle=gx2;
    g.fillRect(0,midY2-bh*.5,W,bh);
  }
  for(i=0;i<edges.length;i++){
    e=edges[i];var u=(t-e.t0)/e.dur;if(u<=0)continue;if(u>1)u=1;
    var gf;
    if(e.fail){
      if(u<.35)gf=.5*eo(u/.35);else if(u<.55)gf=.5-.3*((u-.35)/.2);else gf=.2+.8*eo((u-.55)/.45);
    }else gf=eo(u);
    a=nodes[e.a];b=nodes[e.b];
    var x2=a.x+(b.x-a.x)*gf,y2=a.y+(b.y-a.y)*gf;
    var pl=.78+.22*Math.sin(t*.0024+a.ph);
    var al=e.al*pl*(u<1?(.5+.5*u):1);
    var lw=e.beam?1.45:1.05;
    g.strokeStyle='rgba('+a.col+', '+al.toFixed(3)+')';g.lineWidth=lw;
    if(e.beam){g.shadowBlur=10;g.shadowColor='rgba('+a.col+', .5)';}
    g.beginPath();g.moveTo(a.x,a.y);g.lineTo(x2,y2);g.stroke();
    if(e.beam)g.shadowBlur=0;
    if(u<1){
      g.fillStyle='rgba('+a.col+', .95)';g.shadowBlur=14;g.shadowColor='rgba('+a.col+', .9)';
      g.beginPath();g.arc(x2,y2,2.2,0,Math.PI*2);g.fill();g.shadowBlur=0;
    }
  }
  for(i=0;i<nodes.length;i++){
    var n=nodes[i];
    var appear=Math.max(0,Math.min(1,(t-i*16)/420));
    var c=Math.max(0,Math.min(1,(t-n.tc)/260));
    var br=(.22+.78*(c*c*(3-2*c)))*appear;
    var pu=Math.sin(t*.0024+n.ph);
    var rad=Math.max(1.0,n.r+pu*.55*c);
    var flash=(c>0&&c<1)?(1-c)*5.5:0;
    g.fillStyle='rgba('+n.col+', '+(.94*br).toFixed(3)+')';
    g.shadowBlur=14*br+flash;g.shadowColor='rgba('+n.col+', '+(.88*br).toFixed(3)+')';
    g.beginPath();g.arc(n.x,n.y,rad+flash*.12,0,Math.PI*2);g.fill();
  }
  g.shadowBlur=0;
}
/* ===== end shared neural network ===== */

/* ---------- DUMUL transition spectrum visualizer ----------
   Visualizer yang sama dipakai sebagai foreground transition. Audio timeline
   tetap milik GARG; tidak ada audio kedua dan tidak ada seek manual berbasis timer.
*/
var DM_TR_CTX=null,DM_TR_AN=null,DM_TR_SPEC=null,DM_TR_PREV=null,DM_TR_LEVEL=0,DM_TR_FLUX=0,DM_TR_BEAT=0,DM_TR_RAF=0,DM_TR_NET=null,DM_TR_MESH_LAST=0;
function dmTransitionGraph(){
  if(DM_TR_CTX){try{if(DM_TR_CTX.state!=='running'&&DM_TR_CTX.resume)DM_TR_CTX.resume();}catch(e){}return true;}
  var AC=window.AudioContext||window.webkitAudioContext;
  if(!AC||typeof GARG==='undefined'||!GARG)return false;
  try{
    if(typeof AV!=='undefined'&&AV.ctx&&AV.an){
      /* Reuse the site's existing AudioContext when available — one graph only. */
      DM_TR_CTX=AV.ctx;
      DM_TR_AN=AV.an;
      if(!AV.sources.garg){
        AV.sources.garg=DM_TR_CTX.createMediaElementSource(GARG);
        AV.sources.garg.connect(DM_TR_AN);
        /* FIX: analyser AV.an adalah tap murni (tidak tersambung ke destination kalau AV.lpf ada),
           jadi GARG harus ikut disambung ke jalur keluar yang terdengar, sama seperti audioVizInit().
           Tanpa ini, kalau user sempat tap bintang sebelum klik Gargantua, swallow-nya bisu. */
        if(AV.lpf){
          try{AV.sources.garg.connect(AV.lpf);}
          catch(eG1){try{DM_TR_AN.connect(DM_TR_CTX.destination);AV._anOut=true;}catch(eG2){}}
        }else if(!AV._anOut){
          try{DM_TR_AN.connect(DM_TR_CTX.destination);AV._anOut=true;}catch(eG3){}
        }
      }
    }else{
      DM_TR_CTX=new AC();
      DM_TR_AN=DM_TR_CTX.createAnalyser();
      DM_TR_AN.fftSize=1024;
      DM_TR_AN.smoothingTimeConstant=.6;
      var src=DM_TR_CTX.createMediaElementSource(GARG);
      src.connect(DM_TR_AN);
      DM_TR_AN.connect(DM_TR_CTX.destination);
    }
    DM_TR_SPEC=new Uint8Array(DM_TR_AN.frequencyBinCount);
    DM_TR_PREV=new Uint8Array(DM_TR_AN.frequencyBinCount);
    if(DM_TR_CTX.state!=='running'&&DM_TR_CTX.resume)DM_TR_CTX.resume();
    return true;
  }catch(e){DM_TR_CTX=null;DM_TR_AN=null;DM_TR_SPEC=null;DM_TR_PREV=null;return false;}
}
function dmTransitionAnalyse(now){
  if(!DM_TR_AN||!DM_TR_SPEC)return;
  DM_TR_AN.getByteFrequencyData(DM_TR_SPEC);
  var i,e=0,flux=0,n=DM_TR_SPEC.length,lim=Math.min(8,n-1);
  for(i=1;i<=lim;i++){var d=DM_TR_SPEC[i]-DM_TR_PREV[i];if(d>0)flux+=d;}
  flux/=Math.max(1,lim)*255;
  DM_TR_FLUX+=(flux-DM_TR_FLUX)*.06;
  if(flux>DM_TR_FLUX*1.7+.02&&now-DM_TR_BEAT>170)DM_TR_BEAT=now;
  DM_TR_PREV.set(DM_TR_SPEC);
  var el=Math.min(120,n-1);
  for(i=1;i<=el;i++)e+=DM_TR_SPEC[i];
  e/=Math.max(1,el)*255;
  DM_TR_LEVEL+=(Math.max(0,Math.min(1,(e-.22)*2.4))-DM_TR_LEVEL)*.35;
}
/* ---------- Shared hero spectrum mesh ----------
   This is the SAME 22-node mesh used by the React spectrum visualizer in dumul.html.
   During the swallow we run the identical motion model, then hand the live node state
   to dumul.html through sessionStorage so the first DUMUL frame continues instead of
   rebuilding a second/random network. */
function dmSpectrumMeshBuild(W,H){
  var p=[],i;
  function rng(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
  var R=rng(230917);
  for(i=0;i<22;i++){
    var c=R()>.62;
    var x=W*.15+R()*W*.7+(R()-.5)*20;
    var y=H*.5+(R()-.5)*H*.7;
    p.push({x:x,y:y,ox:x,oy:y,vx:(R()-.5)*.8,vy:(R()-.5)*.5,r:R()*2.2+.6,
      color:c?'#ff7ad9':'#6ee5ff',glow:c?'rgba(255,122,217,0.9)':'rgba(110,229,255,0.95)',phase:R()*Math.PI*2,birth:0,reveal:0});
  }
  /* Cinematic reveal: materialize from CENTER → left & right (radial).
     Final geometry unchanged; only visibility is staged. */
  var cx=W*.5, cy=H*.5;
  var order=p.map(function(_,idx){return idx;});
  order.sort(function(a,b){
    var da=Math.hypot(p[a].ox-cx,p[a].oy-cy), db=Math.hypot(p[b].ox-cx,p[b].oy-cy);
    return da-db || a-b;
  });
  for(i=0;i<order.length;i++){
    /* Tighter stagger so the bloom reads as one expanding pulse, not a crawl. */
    p[order[i]].birth=180+i*95+(p[order[i]].phase%1)*50;
  }
  return p;
}
function dmSpectrumMeshDraw(g,W,H,p,phase,level,beat,now,revealMs){
  if(!p)return;
  var dt=DM_TR_MESH_LAST?Math.min(32,Math.max(0,now-DM_TR_MESH_LAST))/16.666:1;
  DM_TR_MESH_LAST=now;
  var s=phase>0?phase:now*.001;
  var f=.7+.3*Math.sin(s*2.7)+.15*Math.sin(s*7.3+1.2);
  /* Hero-style glitch: alpha flicker + burst jitter timers */
  var gg=Math.max(.35,Math.min(1,f+(Math.random()-.5)*.18));
  if(beat){DM_TR_GLITCH_V=3+level*9;DM_TR_GLITCH_SEEN=now;}
  DM_TR_GLITCH_S-=dt;
  if(DM_TR_GLITCH_S<=0){
    if(Math.random()>.55)DM_TR_GLITCH_V=2+Math.random()*6;
    DM_TR_GLITCH_S=15+Math.random()*90;
  }
  var v=DM_TR_GLITCH_V>0?DM_TR_GLITCH_V:0;
  if(DM_TR_GLITCH_V>0)DM_TR_GLITCH_V=Math.max(0,DM_TR_GLITCH_V-dt);
  var K=v?(Math.random()-.5)*24:0;
  var i,j,h,raw,rev;
  /* Motion */
  for(i=0;i<p.length;i++){
    h=p[i];
    h.x+=h.vx*dt+Math.sin(s+h.phase)*.2*dt;
    h.y+=h.vy*dt+Math.cos(s*.7+h.phase)*.18*dt;
    var dx=h.ox-h.x,dy=h.oy-h.y;
    h.vx+=dx*.008*dt;h.vy+=dy*.008*dt;h.vx*=Math.pow(.985,dt);h.vy*=Math.pow(.985,dt);
    if(h.x<0)h.x=0;if(h.x>W)h.x=W;
    if(h.y<0)h.y=0;if(h.y>H)h.y=H;
    /* Reveal BEFORE edges so center→out links light up the same frame */
    raw=((typeof revealMs==='number'?revealMs:phase*1000)-h.birth)/420;
    rev=Math.max(0,Math.min(1,raw));
    h.reveal=rev*rev*(3-2*rev);
  }
  g.save();g.globalAlpha=gg;g.lineWidth=.6;
  /* Edges: both endpoints must be born — blooms from center outward */
  for(i=0;i<p.length;i++)for(j=i+1;j<p.length;j++){
    var a=p[i],b=p[j],d=Math.hypot(a.x-b.x,a.y-b.y);
    if(d>=110)continue;
    var edgeReveal=Math.min(a.reveal||0,b.reveal||0);
    var al=(1-d/110)*.35*gg*edgeReveal;if(al<.012)continue;
    if(v>0&&Math.random()<.08)continue; /* glitch: drop edge */
    g.beginPath();g.globalAlpha=al*(v?(.7+Math.random()*.4):1);
    g.strokeStyle=d<50?'#e6f9ff':a.color===b.color?a.color:'#8cf0ff';
    var jx=K*.2+(v&&Math.random()>.6?(Math.random()-.5)*6:0);
    g.moveTo(a.x+jx,a.y);g.lineTo(b.x+jx,b.y);g.stroke();
    if(edgeReveal>0.08&&edgeReveal<.98){
      var q=edgeReveal,px=a.x+(b.x-a.x)*q+jx,py=a.y+(b.y-a.y)*q;
      g.globalAlpha=Math.min(.85,al*3.2);g.fillStyle=a.color;g.shadowBlur=8;g.shadowColor=a.glow;
      g.beginPath();g.arc(px,py,1.35,0,Math.PI*2);g.fill();g.shadowBlur=0;
    }
  }
  /* Nodes */
  for(i=0;i<p.length;i++){
    h=p[i];rev=h.reveal||0;
    if(rev<=.002)continue;
    var pulse=.7+.3*Math.sin(s*3+h.phase);
    var xx=h.x+(v&&Math.random()>.7?K:0)+(v&&Math.random()>.85?(Math.random()-.5)*10:0);
    var flash=(rev<.35?(1-rev)*3.2:0);
    g.beginPath();g.globalAlpha=gg*pulse*rev;g.fillStyle=h.color;g.shadowBlur=10*rev+flash;g.shadowColor=h.glow;
    g.arc(xx,h.y,(h.r+flash*.18)*pulse*(1+level*1.6*rev)*(1+(v?level*.3:0)),0,Math.PI*2);g.fill();g.shadowBlur=0;
    g.beginPath();g.globalAlpha=gg*rev;g.fillStyle='#ffffff';g.arc(h.x,h.y,h.r*.35*rev,0,Math.PI*2);g.fill();
  }
  /* Hero-style scanline / slice glitches */
  if(v>0||Math.random()>.82){
    g.globalAlpha=gg*.18;
    for(i=0;i<3;i++){
      if(Math.random()>.55)continue;
      g.fillStyle=Math.random()>.5?'#6ee5ff':'#ff7ad9';
      g.fillRect(K,Math.random()*H,W*(.2+Math.random()*.6),1+Math.random()*2);
    }
  }
  if(v>1.5&&Math.random()>.5){
    g.globalAlpha=gg*.35;g.fillStyle=Math.random()>.5?'#6ee5ff':'#ff7ad9';
    g.fillRect(0,Math.random()*H,W,2+Math.random()*8);
  }
  g.restore();
}
function dmTransitionSpectrum(g,W,H,t,fade){
  /* IMPORTANT: this canvas is transparent over og.webp. Clear every frame so
     the radial glow/waveform cannot accumulate into the giant pink/cyan
     'sphere' that was hiding the actual og.webp on mobile. */
  g.clearRect(0,0,W,H);
  /* Dari sini W = lebar kanvas mesh hero (bukan lebar stage), dan digeser ke x kanvas aslinya. */
  var meshX=(typeof DM_TR_MESH_X==='number'?DM_TR_MESH_X:0);
  if(DM_TR_MESH_W>0)W=DM_TR_MESH_W;
  g.globalAlpha=1;
  g.globalCompositeOperation='source-over';
  var lev=DM_TR_LEVEL,beat=(DM_TR_BEAT&&performance.now()-DM_TR_BEAT<150)?1:0;
  /* Hero canvas is h-[132px] — keep transition mesh in that exact space. */
  var meshH=(typeof DM_MESH_H==='number'?DM_MESH_H:132);
  var meshY=(typeof DM_TR_MESH_Y==='number'&&DM_TR_MESH_Y>0?DM_TR_MESH_Y:Math.max(0,Math.round((H-meshH)*0.48)));
  if(!DM_TR_NET||!DM_TR_NET.length)DM_TR_NET=dmSpectrumMeshBuild(W,meshH);
  var phase=(typeof GARG!=='undefined'&&GARG&&!isNaN(GARG.currentTime))?GARG.currentTime:0;
  g.save();
  g.translate(meshX,meshY);
  dmSpectrumMeshDraw(g,W,meshH,DM_TR_NET,phase,lev,beat,performance.now(),t);
  var glow=g.createRadialGradient(W*.5,meshH*.49,0,W*.5,meshH*.49,Math.max(W,meshH)*.46);
  glow.addColorStop(0,'rgba(110,229,255,'+(0.07*fade+lev*.06*fade).toFixed(3)+')');
  glow.addColorStop(.52,'rgba(255,122,217,'+(0.035*fade).toFixed(3)+')');
  glow.addColorStop(1,'rgba(10,18,24,0)');
  g.fillStyle=glow;g.fillRect(0,0,W,meshH);

  var bands=3,pts=Math.max(44,Math.min(92,Math.floor(W/8))),i,b,y,x,amp,sp,u;
  for(b=0;b<bands;b++){
    g.beginPath();
    var base=meshH*(.43+b*.075),phase2=t*(.00105+b*.00018)+b*1.7;
    for(i=0;i<=pts;i++){
      u=i/pts;x=u*W;
      var idx=1+Math.min(DM_TR_SPEC?DM_TR_SPEC.length-1:1,Math.floor(Math.pow(Math.abs(u-.5)*2,1.7)*150));
      sp=DM_TR_SPEC?DM_TR_SPEC[idx]/255:0;
      amp=(5+b*2)+(sp*24)*(b===0?1:.72)+lev*(b===0?12:7);
      y=base+Math.sin(u*10.5+phase2)*amp*.34+Math.sin(u*25-phase2*1.4+b)*amp*.16;
      if(beat)y+=Math.sin(u*Math.PI*10+t*.008)*(7+lev*12);
      /* Hero-style wave glitch: micro horizontal tears + occasional gap */
      var wx=x+(DM_TR_GLITCH_V>0&&Math.random()>.5?(Math.random()-.5)*8:0);
      if(i===0)g.moveTo(wx,y);
      else if(Math.random()<(0.10+b*0.04))g.moveTo(wx,y); /* gap = broken waveform */
      else g.lineTo(wx,y);
    }
    g.strokeStyle=b===1?'rgba(255,122,217,'+(0.62*fade).toFixed(3)+')':'rgba(110,229,255,'+((.58+b*.06)*fade).toFixed(3)+')';
    g.lineWidth=b===0?1.7:1.0;g.shadowBlur=12+lev*10;g.shadowColor=b===1?'rgba(255,122,217,.5)':'rgba(110,229,255,.5)';g.stroke();g.shadowBlur=0;
  }
  var count=Math.min(42,Math.max(18,Math.floor(W/14)));
  for(i=0;i<count;i++){
    u=(i+.5)/count;
    var j=1+Math.min(DM_TR_SPEC?DM_TR_SPEC.length-1:1,Math.floor(Math.pow(Math.abs(u-.5)*2,1.8)*130));
    var sv=DM_TR_SPEC?DM_TR_SPEC[j]/255:0;
    var px=u*W,py=meshH*.5+Math.sin(t*.0013+i*1.73)*meshH*.17,rr=.8+sv*2.4+lev*1.6;
    if(beat&&i%3===0)px+=(i%2?-1:1)*(5+lev*14);
    g.globalAlpha=(.24+sv*.5+lev*.22)*fade;g.fillStyle=i%4===0?'#ff7ad9':'#6ee5ff';g.shadowBlur=8+sv*8;g.shadowColor=g.fillStyle;
    g.fillRect(px-rr*.5,py-rr*.5,rr*(1+sv*2),Math.max(1,rr*.55));
  }
  g.globalAlpha=1;
  if(beat){for(i=0;i<4;i++){y=Math.random()*meshH;g.fillStyle=(i&1)?'rgba(255,122,217,.16)':'rgba(110,229,255,.16)';g.fillRect(0,y,W,1+Math.random()*4);}}
  g.restore();
}
function dmTransitionStart(){
  if(DM_TR_RAF)return;
  dmTransitionGraph();
  var last=0,skip=0;
  function frame(now){
    DM_TR_RAF=requestAnimationFrame(frame);
    if(now-last<16)return;last=now;
    if(DM_TR_AN&&!GARG.paused){skip^=1;if(!skip)dmTransitionAnalyse(now);}
  }
  DM_TR_RAF=requestAnimationFrame(frame);
}
function dmTransitionStop(){
  if(DM_TR_RAF){cancelAnimationFrame(DM_TR_RAF);DM_TR_RAF=0;}
}

