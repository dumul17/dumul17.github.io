'use strict';
/* 08-tx-drone.js — animasi + indikator drone Transmitter (TX) / Receiver (RX).
   Sebelumnya mekanik ini nggak punya visual sama sekali (cuma toast + label "relay" di portal). Sekarang:
   1. Ring tahan di teleskop: waktu long-press, cincin progres ngisi (580 ms) = petunjuk "tahan terus".
   2. Di dalam sektor: drone terbang dari teleskop ke target, orbit di sana, tether putus-putus + paket sinyal ngalir ke teleskop.
        - SRC (cyan)  : sektor sumber SFX → target = bintang pemancar. Kalau Gargantua mini lagi dipanggil, paket lanjut teleskop → Gargantua (masuk tunnel).
        - RCV (pink)  : sektor lain → target = Gargantua mini (mulut tunnel). Paket ngalir dari Gargantua ke teleskop.
      Lepas (long-press lagi / recall) = drone balik ke teleskop. Pindah sektor = tanpa animasi (langsung posisi akhir).
   3. Di overview sektor: Gargantua = tunnel. Garis sumber → Gargantua → sektor penerima, paket cahaya ngalir searah sinyal.
   Dipanggil dari frame() lewat drawTxLines(now) (sudah ada di 04-render/05-sector-ui, tinggal didefinisikan).
   Hook long-press ada di 06-interaction.js (TXFX.holdStart / holdEnd). State dibaca dari TX / SUM / SECT; modul ini TIDAK mengubah state apa pun. */
var TXFX=(function(){
  var SRC='110,229,255',RCV='255,154,217',NEU='200,214,226',HOLD_MS=580,HOLD_SHOW=160;
  var D={},hold=null,pings=[],lastCur=null;
  function c01(v){return v<0?0:v>1?1:v;}
  function ease(u){return u<.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2;}
  function hsh(k){var h=0,i;for(i=0;i<k.length;i++)h=(h*31+k.charCodeAt(i))|0;return (h&1)?1:-1;}
  function lite(){return document.body&&document.body.classList.contains('perf-tier-0');}
  function ping(x,y,col,now,big){pings.push({x:x,y:y,col:col,t:now,r:big?32:22});if(pings.length>8)pings.shift();}
  function bez(a,b,e,k){   /* kurva kuadratik a→b, k = lengkungan relatif (tanda = sisi) */
    var mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2,dx=b[0]-a[0],dy=b[1]-a[1],cx=mx-dy*k,cy=my+dx*k,i=1-e;
    return [i*i*a[0]+2*i*e*cx+e*e*b[0],i*i*a[1]+2*i*e*cy+e*e*b[1]];
  }
  function tele(){var p=telescopeScreenPos();return p?[p[0],p[1]]:null;}

  /* ---------- state yang diinginkan di sektor sekarang ---------- */
  function want(s){
    var t=TX.by[s.k],src=typeof sfxSector==='function'?sfxSector():null;
    if(src===s&&t&&t.on&&!t.recv)return 'src';
    if(TX.recv[s.k]&&SUM.on&&BHSC>.05)return 'rcv';
    return null;
  }
  function targetOf(s,mode){
    if(mode==='rcv'){var b=camBH();return b?{x:b[0],y:b[1],r:Math.max(10,BH.Rr*(BHZ||1))*1.5+10}:null;}
    var t=TX.by[s.k],p=t&&txStarPos(t.key);if(!p)return null;
    var q=gravityPos(p[0],p[1]);return q?{x:q[0],y:q[1],r:15}:null;
  }
  function orbit(T,now,sg){var a=reduce?.8:now*.0013*sg+1.2;return [T.x+Math.cos(a)*T.r,T.y+Math.sin(a)*T.r*.55];}

  /* ---------- primitif gambar ---------- */
  function drawDrone(x,y,col,a,now,sc){
    g.save();g.translate(x,y);g.scale(sc,sc);
    g.fillStyle='rgba('+col+','+(.10*a)+')';g.beginPath();g.arc(0,0,11,0,6.283);g.fill();
    g.fillStyle='rgba('+col+','+(.16*a)+')';g.beginPath();g.arc(0,0,6.5,0,6.283);g.fill();
    g.strokeStyle='rgba(226,240,248,'+(.85*a)+')';g.lineWidth=1;
    g.beginPath();g.moveTo(-5,-4);g.lineTo(5,4);g.moveTo(-5,4);g.lineTo(5,-4);g.stroke();
    var rot=reduce?0:now*.045,i,tx,ty;
    g.strokeStyle='rgba('+col+','+(.75*a)+')';g.lineWidth=1;g.beginPath();
    for(i=0;i<4;i++){
      tx=(i&1?5:-5);ty=(i&2?4:-4);
      g.moveTo(tx+Math.cos(rot+i*1.57)*2.6,ty+Math.sin(rot+i*1.57)*2.6);g.lineTo(tx-Math.cos(rot+i*1.57)*2.6,ty-Math.sin(rot+i*1.57)*2.6);
    }
    g.stroke();
    g.fillStyle='rgba(8,18,26,'+a+')';g.strokeStyle='rgba('+col+','+a+')';g.beginPath();g.arc(0,0,2.7,0,6.283);g.fill();g.stroke();
    if(reduce||((now%700)<350)){g.fillStyle='rgba(255,255,255,'+a+')';g.beginPath();g.arc(0,0,1,0,6.283);g.fill();}
    g.restore();
  }
  function drawTrail(d,col,now){
    var tr=d.trail,i,p,age,pr=null;
    while(tr.length&&now-tr[0][2]>420)tr.shift();
    if(tr.length<2)return;
    g.lineWidth=1.4;g.lineCap='round';
    for(i=1;i<tr.length;i++){
      p=tr[i];pr=tr[i-1];age=1-(now-p[2])/420;
      if(p[2]-pr[2]>90||Math.abs(p[0]-pr[0])+Math.abs(p[1]-pr[1])>70)continue;   /* loncat (tab di-background / lag): jangan tarik garis panjang */
      g.strokeStyle='rgba('+col+','+(.5*age*age)+')';g.beginPath();g.moveTo(pr[0],pr[1]);g.lineTo(p[0],p[1]);g.stroke();
    }
  }
  function tether(a,b,col,al,now,pa,pb){   /* garis putus-putus a→b + paket sinyal ngalir a→b; pa/pb = jarak potong di ujung */
    var dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy);if(L<pa+pb+6||al<=.01)return;
    var ux=dx/L,uy=dy/L,x0=a[0]+ux*pa,y0=a[1]+uy*pa,x1=b[0]-ux*pb,y1=b[1]-uy*pb,i,f,px,py;
    g.save();
    g.strokeStyle='rgba('+col+','+(.24*al)+')';g.lineWidth=1;
    if(g.setLineDash){g.setLineDash([2,5]);g.lineDashOffset=reduce?0:-now*.02;}
    g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.stroke();
    if(g.setLineDash)g.setLineDash([]);
    for(i=0;i<3;i++){
      f=reduce?(i+.5)/3:((now*.00055+i/3)%1);
      px=x0+(x1-x0)*f;py=y0+(y1-y0)*f;
      var pk=Math.sin(f*3.1416)*al;
      g.fillStyle='rgba('+col+','+(.22*pk)+')';g.beginPath();g.arc(px,py,4,0,6.283);g.fill();
      g.fillStyle='rgba(235,250,255,'+(.9*pk)+')';g.beginPath();g.arc(px,py,1.5,0,6.283);g.fill();
    }
    g.restore();
  }
  function label(x,y,txt,col,a){
    if(typeof OBSERVE_MODE!=='undefined'&&OBSERVE_MODE)return;
    var up=uprBegin(x,y);
    g.font='600 7px "Courier New",monospace';g.textAlign='center';g.textBaseline='top';
    g.fillStyle='rgba('+col+','+(.8*a)+')';g.fillText(txt,x,y);
    uprEnd(up);
  }
  function drawPings(now){
    var i,p,u,e;
    for(i=pings.length-1;i>=0;i--){
      p=pings[i];u=(now-p.t)/750;if(u>=1){pings.splice(i,1);continue;}
      e=1-Math.pow(1-u,2);
      g.strokeStyle='rgba('+p.col+','+((1-u)*.7)+')';g.lineWidth=1.4;g.beginPath();g.arc(p.x,p.y,p.r*e,0,6.283);g.stroke();
      if(u>.22){var u2=(u-.22)/.78,e2=1-Math.pow(1-u2,2);g.strokeStyle='rgba('+p.col+','+((1-u2)*.45)+')';g.beginPath();g.arc(p.x,p.y,p.r*e2*.8,0,6.283);g.stroke();}
    }
  }

  /* ---------- ring tahan teleskop ---------- */
  function drawHold(now){
    if(!hold)return;
    var el=now-hold.t0;if(el<HOLD_SHOW)return;
    var t=tele();if(!t)return;
    var col=NEU;
    if(SECT.cur&&!SECT.on){col=(typeof sfxSector==='function'&&sfxSector()===SECT.cur)?SRC:RCV;}
    var f=c01(el/HOLD_MS),R=26,fade=c01((el-HOLD_SHOW)/120),full=f>=1,pulse=full&&!reduce?.6+.4*Math.sin(now*.02):1;
    g.save();g.lineCap='round';
    g.strokeStyle='rgba('+col+','+(.18*fade)+')';g.lineWidth=2;g.beginPath();g.arc(t[0],t[1],R,0,6.283);g.stroke();
    g.strokeStyle='rgba('+col+','+(.28*fade*pulse)+')';g.lineWidth=6;g.beginPath();g.arc(t[0],t[1],R,-1.5708,-1.5708+6.283*f);g.stroke();
    g.strokeStyle='rgba('+col+','+(.95*fade*pulse)+')';g.lineWidth=2;g.beginPath();g.arc(t[0],t[1],R,-1.5708,-1.5708+6.283*f);g.stroke();
    g.restore();
  }

  /* ---------- di dalam sektor ---------- */
  function drawSector(now,s){
    if(typeof lisGone==='function'&&lisGone()){lastCur=null;return;}   /* teleskop ditinggal di sektor lain: nggak ada yang digambar */
    var mode=want(s),d=D[s.k]||(D[s.k]={ph:'idle',mode:null,trail:[],sg:hsh(s.k),t0:0,from:null,pos:null});
    if(lastCur!==s){lastCur=s;d.trail.length=0;d.ph=mode?'dock':'idle';d.mode=mode;d.from=null;d.pos=null;}   /* masuk sektor: snap, tanpa animasi */
    var tp=tele();if(!tp)return;
    var col=(d.mode||mode)==='rcv'?RCV:SRC;
    /* transisi state */
    if(mode&&(d.ph==='idle'||d.ph==='back'||d.mode!==mode)){
      d.from=(d.ph==='back'&&d.pos)?d.pos.slice():null;
      d.ph='out';d.t0=now;d.mode=mode;col=mode==='rcv'?RCV:SRC;ping(tp[0],tp[1],col,now,false);
    }else if(!mode&&(d.ph==='out'||d.ph==='dock')){
      d.from=d.pos?d.pos.slice():tp;d.ph='back';d.t0=now;
    }
    if(d.ph==='idle')return;
    var T=d.mode?targetOf(s,d.mode):null,pos,al=1,u,e;
    if(d.ph==='out'){
      if(!T){d.ph='idle';return;}
      u=reduce?1:c01((now-d.t0)/1150);e=ease(u);al=e;
      pos=bez(d.from||tp,orbit(T,now,d.sg),e,d.sg*.28);
      if(u>=1){d.ph='dock';ping(T.x,T.y,col,now,true);}
    }else if(d.ph==='dock'){
      if(!T){d.ph='idle';return;}
      pos=orbit(T,now,d.sg);
    }else{   /* back */
      u=reduce?1:c01((now-d.t0)/950);e=ease(u);al=1-e;
      pos=bez(d.from||tp,tp,e,-d.sg*.28);
      if(u>=1){d.ph='idle';d.trail.length=0;ping(tp[0],tp[1],col,now,false);return;}
    }
    d.pos=pos;
    if(!reduce){var tl=d.trail,lp=tl.length?tl[tl.length-1]:null;if(!lp||Math.abs(lp[0]-pos[0])+Math.abs(lp[1]-pos[1])>1.2){tl.push([pos[0],pos[1],now]);if(tl.length>28)tl.shift();}}
    g.save();
    /* denyut antena di teleskop */
    if(!reduce&&!lite()){
      var f=(now%2200)/2200;
      g.strokeStyle='rgba('+col+','+(.30*(1-f)*al)+')';g.lineWidth=1.2;g.beginPath();g.arc(tp[0],tp[1],14+f*22,0,6.283);g.stroke();
    }
    drawTrail(d,col,now);
    tether(pos,tp,col,al,now,6,15);   /* sinyal ngalir dari drone ke teleskop */
    if(d.mode==='src'&&d.ph==='dock'&&SUM.on&&BHSC>.05){   /* lanjut: teleskop → Gargantua mini (masuk tunnel) */
      var b=camBH();if(b)tether(tp,[b[0],b[1]],col,.75,now,15,Math.max(8,BH.Rr*(BHZ||1))*1.25);
    }
    drawDrone(pos[0],pos[1],col,Math.max(.35,al),now,W<420?1:1.15);
    label(pos[0],pos[1]+11,d.mode==='rcv'?'RX':'TX',col,al);
    g.restore();
  }

  /* ---------- overview sektor: Gargantua = tunnel ---------- */
  function link(a,b,rA,rB,col,flow,now,sgn){   /* garis melengkung a→b; flow = paket ngalir a→b */
    var dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy);if(L<rA+rB+12)return;
    var f0=rA/L,f1=1-rB/L,k=sgn*.10,i,n=16,p,pk,f;
    g.save();
    g.strokeStyle='rgba('+col+','+(flow?.30:.14)+')';g.lineWidth=1.1;
    if(g.setLineDash){g.setLineDash([3,5]);g.lineDashOffset=reduce?0:(flow?-now*.02:0);}
    g.beginPath();
    for(i=0;i<=n;i++){p=bez(a,b,f0+(f1-f0)*i/n,k);if(i)g.lineTo(p[0],p[1]);else g.moveTo(p[0],p[1]);}
    g.stroke();if(g.setLineDash)g.setLineDash([]);
    if(flow){
      for(i=0;i<3;i++){
        f=reduce?(i+.5)/3:((now*.00045+i/3)%1);p=bez(a,b,f0+(f1-f0)*f,k);pk=Math.sin(f*3.1416);
        g.fillStyle='rgba('+col+','+(.25*pk)+')';g.beginPath();g.arc(p[0],p[1],4.5,0,6.283);g.fill();
        g.fillStyle='rgba(235,250,255,'+(.95*pk)+')';g.beginPath();g.arc(p[0],p[1],1.7,0,6.283);g.fill();
      }
    }
    g.restore();
  }
  function drawOverview(now){
    lastCur=null;
    if(SECT.busy||SECT.vis<.05)return;
    var bp=camBH(),Rv=Math.max(8,BH.Rr*(BHZ||1)),rad=Math.max(20,Math.min(30,W*.07)),i,s,t,srcs=[],rcvs=[];
    if(!bp)return;
    for(i=0;i<SECT.list.length;i++){
      s=SECT.list[i];if(s.sx==null||!s.ids||!s.ids.length)continue;
      t=TX.by[s.k];if(!t||!t.on)continue;
      if(t.recv){if(s.summed)rcvs.push(s);}else srcs.push(s);
    }
    if(!srcs.length&&!rcvs.length)return;
    g.save();g.globalAlpha=SECT.vis;
    var bpp=[bp[0],bp[1]],flowIn=srcs.length>0;
    for(i=0;i<srcs.length;i++)link([srcs[i].sx,srcs[i].sy],bpp,rad*1.35,Rv*1.35,SRC,true,now,hsh(srcs[i].k));
    for(i=0;i<rcvs.length;i++)link(bpp,[rcvs[i].sx,rcvs[i].sy],Rv*1.35,rad*1.35,RCV,flowIn,now,hsh(rcvs[i].k));
    /* cincin tunnel di Gargantua: ngembang pelan selama ada sinyal lewat */
    if(!reduce&&!lite()){
      var f=(now%2600)/2600,a=(flowIn&&rcvs.length)?1:.55;
      g.strokeStyle='rgba('+(rcvs.length?RCV:SRC)+','+(.34*(1-f)*a)+')';g.lineWidth=1.3;
      g.beginPath();g.arc(bpp[0],bpp[1],Rv*1.4+f*Rv*1.6,0,6.283);g.stroke();
    }
    g.restore();
  }

  function draw(now){
    if(typeof g==='undefined'||!g)return;
    g.save();
    try{
      if(SECT.cur&&!SECT.on){if(!SECT.busy)drawSector(now,SECT.cur);}
      else if(SECT.on&&!SECT.cur)drawOverview(now);
      else lastCur=null;
      drawHold(now);drawPings(now);
    }finally{g.restore();}
  }
  return {
    draw:draw,
    holdStart:function(){hold={t0:performance.now()};},
    holdEnd:function(){hold=null;},
    reset:function(){D={};hold=null;pings.length=0;lastCur=null;}
  };
})();
function drawTxLines(now){TXFX.draw(now);}
