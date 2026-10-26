'use strict';
/* 08-tx-drone.js — animasi + indikator drone Transmitter (TX) / Receiver (RX).
   Sebelumnya mekanik ini nggak punya visual sama sekali (cuma toast + label "relay" di portal). Sekarang:
   1. Ring tahan di teleskop: waktu long-press, cincin progres ngisi (580 ms) = petunjuk "tahan terus".
   2. Di dalam sektor: drone terbang dari teleskop ke target, orbit di sana, tether putus-putus + paket sinyal ngalir ke teleskop.
        - SRC         : sektor sumber SFX → target = bintang pemancar. Kalau Gargantua mini lagi dipanggil, paket lanjut teleskop → Gargantua (masuk tunnel).
        - RCV         : sektor lain → standby pink di teleskop (F8; dulu: Gargantua mini). SBY = kuning, standby di teleskop.
      Lepas (long-press lagi / recall) = drone balik ke teleskop. Pindah sektor = tanpa animasi (langsung posisi akhir).
   3. Di overview sektor: Gargantua = tunnel. Garis sumber → Gargantua → sektor penerima, paket cahaya ngalir searah sinyal.
   Warna jalur/drone/ring mengikuti indikator interlocking sektornya (kuning/pink). F9: tether TIDAK permanen (cuma ±1,2 dtk setelah transisi + selama tahan); mode cam: semua disembunyikan. Cincin pulse cyan di teleskop (txLinked) DIHAPUS: status interlock sekarang dibaca dari LED indikator di antena teleskop (13-scope3d.js).
   Garis putus-putus (tether drone→teleskop + sinyal RX turun) TIDAK digambar saat drone docking jadi RECEIVER di sektor selain sumber; drop drone dari teleskop (kuning) dan TX di sektor sumber tetap menampilkannya (lalu hilang, tidak permanen).
   Dipanggil dari frame() lewat drawTxLines(now) (sudah ada di 04-render/05-sector-ui, tinggal didefinisikan).
   MENDARAT DI PLANET: di sektor, drone yang di-drop (tahan teleskop) terbang dari teleskop lalu MENDARAT di permukaan planet (17-planet3d.js: planetGroundAt),
   berdiri di tanah dan ikut berputar bersama permukaan (koordinat tanah ug/sg, bukan koordinat layar), pulse di kaki. TX/RX tetap berdiri di tanah:
   TX = berkas sinyal dari bintang SFX ke drone, RX = sinyal turun dari atas. Terbawa rotasi sampai keluar layar = lepas landas, mendarat lagi di sisi lain.
   Planet mati/tak tersedia (?planet3d=0) = perilaku lama (standby orbit teleskop / orbit bintang). Semua gambar drone dikumpulkan di drawTop() (dipanggil SETELAH planet).
   Hook long-press ada di 06-interaction.js (TXFX.holdStart / holdEnd). State dibaca dari TX / SECT (s.drn); modul ini TIDAK mengubah state apa pun. */
var TXFX=(function(){
  var SRC='110,229,255',RCV='255,154,217',NEU='200,214,226',HOLD_MS=580,HOLD_SHOW=160;
  var D={},hold=null,pings=[],lastCur=null,TOP=null;
  function c01(v){return v<0?0:v>1?1:v;}
  function ease(u){return u<.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2;}
  function hsh(k){var h=0,i;for(i=0;i<k.length;i++)h=(h*31+k.charCodeAt(i))|0;return (h&1)?1:-1;}
  function lite(){return document.body&&document.body.classList.contains('perf-tier-0');}
  /* ---------- mendarat di planet ---------- */
  /* Orbit di atmosfer planet (bukan berdiri diam di tanah): drone mengitari titik jangkar di atas permukaan. ru = radius sepanjang horizon (px), rs = radius kedalaman (px, ke/menjauhi horizon),
     lift = tinggi di atas tanah (px x skala), bob = naik-turun ringan, per = ms per putaran, counter = parallax LAWAN rotasi planet (1 = jangkar diam di layar, 0 = ikut berputar bersama tanah),
     pose = 0 drone tetap pose terbang (tanpa kaki mendarat), 1 = pose mendarat. */
  var DRONE_ORB={ru:46,rs:9,lift:34,bob:5,per:7000,counter:1,pose:0};
  function landMode(){return typeof planetGroundAt==='function'&&typeof PL3D_CFG!=='undefined'&&PL3D_CFG.on;}
  function fScale(){return W<420?1:1.15;}
  function landSc(k){return fScale()*Math.max(.8,Math.min(1.2,k/46));}
  function liftOf(sc){return 28*sc*.40;}   /* pusat badan di atas kaki (ukuran drone 3D = 28 px x sc) */
  function ping(x,y,col,now,big){pings.push({x:x,y:y,col:col,t:now,r:big?32:22});if(pings.length>8)pings.shift();}
  function bez(a,b,e,k){   /* kurva kuadratik a→b, k = lengkungan relatif (tanda = sisi) */
    var mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2,dx=b[0]-a[0],dy=b[1]-a[1],cx=mx-dy*k,cy=my+dx*k,i=1-e;
    return [i*i*a[0]+2*i*e*cx+e*e*b[0],i*i*a[1]+2*i*e*cy+e*e*b[1]];
  }
  function tele(){var p=telescopeScreenPos();return p?[p[0],p[1]]:null;}
  /* Warna jalur/drone = warna indikator interlocking sektornya (txInterlock + IL_COL di 05-sector-ui.js):
     1 kuning, 2 pink (cyan pensiun). Lvl 0 (belum ada drone) = netral. Peran TX/RX tetap dibedakan lewat label & arah paket. */
  function ilLvl(s){return(s&&typeof txInterlock==='function')?txInterlock(s).lvl:0;}
  function lvlCol(l){return(typeof IL_COL!=='undefined'&&IL_COL[l])||NEU;}
  function ilCol(s){return lvlCol(ilLvl(s));}
  /* Fade warna: tiap jalur punya warna berjalan sendiri (key), dilerp ke target. Lama nggak digambar (>400 ms) = snap, bukan fade basi. */
  var CF={};
  function fcol(key,tgt,now){
    var t=tgt.split(','),c=CF[key],i,k,dt;
    if(!c||now-c.t>400){CF[key]={v:[+t[0],+t[1],+t[2]],t:now};return tgt;}
    if(c.t!==now){dt=Math.min(100,now-c.t);k=reduce?1:1-Math.exp(-dt/220);for(i=0;i<3;i++)c.v[i]+=(+t[i]-c.v[i])*k;c.t=now;}
    return Math.round(c.v[0])+','+Math.round(c.v[1])+','+Math.round(c.v[2]);
  }

  /* ---------- state yang diinginkan di sektor sekarang ---------- */
  function want(s){
    var t=TX.by[s.k],src=typeof sfxSector==='function'?sfxSector():null;
    if(src===s&&t&&t.on&&!t.recv)return 'src';
    if(!s.drn)return null;                    /* F8: drone cuma ada kalau kuning */
    if(TX.recv[s.k])return 'rcv';             /* receiver: standby di teleskop, pink (tanpa RELAY.on) */
    return 'sby';                              /* kuning (atau pink sumber tanpa SFX bunyi): standby di teleskop */
  }
  function targetOf(s,mode,d,now){
    if(d&&landMode()){   /* mendarat: titik tujuan = tanah planet (null kalau planet belum/tidak kelihatan) */
      if(d.gu==null)return null;
      var g0=planetGroundAt(d.gu,d.gs,now,0);if(!g0)return null;
      var O=DRONE_ORB,a=reduce?.8:now*(6.2832/O.per)*d.sg+1.2,cp=(typeof planetRotPx==='function')?(planetRotPx(now)-(d.g0||0))*O.counter:0,   /* parallax lawan rotasi: jangkar digeser berlawanan arah putaran tanah */
          ug=d.gu+cp+Math.cos(a)*O.ru,sg=Math.max(10,d.gs+Math.sin(a)*O.rs),
          g1=planetGroundAt(ug,sg,now,0);if(!g1)return null;
      var lsc=landSc(g1.k),lf=O.lift*lsc+(reduce?0:Math.sin(now*.0016+d.sg)*O.bob*lsc),gl=planetGroundAt(ug,sg,now,lf);
      return gl?{x:gl.lx,y:gl.ly,r:0,ground:gl,sc:lsc}:null;
    }
    if(mode==='rcv'||mode==='sby'){   /* standby: orbit teleskop; radius cukup besar supaya area tap drone dan teleskop tidak saling menutup */
      var tp=tele();return tp?{x:tp[0],y:tp[1],r:Math.round(42*(typeof TELE_CFG!=='undefined'?Math.max(1,TELE_CFG.size):1))}:null;
    }
    var t=TX.by[s.k],p=t&&txStarPos(t.key);if(!p)return null;
    var q=gravityPos(p[0],p[1]);return q?{x:q[0],y:q[1],r:17}:null;
  }
  function orbit(T,now,sg){var a=reduce?.8:now*.00042*sg+1.2;return [T.x+Math.cos(a)*T.r,T.y+Math.sin(a)*T.r*.55];}

  /* ---------- primitif gambar ---------- */
  function drawDrone(x,y,col,a,now,sc){
    if(typeof drone3dDraw==='function'&&drone3dDraw(g,x,y,col,a,now,sc))return;   /* quadcopter 3D (14-drone3d.js); false = gambar 2D di bawah */
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
    while(tr.length&&now-tr[0][2]>600)tr.shift();
    if(tr.length<2)return;
    g.lineWidth=1.4;g.lineCap='round';
    for(i=1;i<tr.length;i++){
      p=tr[i];pr=tr[i-1];age=1-(now-p[2])/600;
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

  /* ---------- F9: tether non-permanen + cincin status ---------- */
  var TETH_HOLD=800,TETH_FADE=400;
  var BEAM_HOLD=1800,BEAM_FADE=900;   /* berkas bintang SFX -> drone (TX) / sinyal turun (RX): tampil BEAM_HOLD ms setelah mulai / drone mendarat / SFX ganti bintang, lalu pudar BEAM_FADE ms. Tidak permanen. */
  function beamF(d,now){   /* 1 selama tahan; sesudah itu sama seperti tethF tapi pakai penanda sendiri d.bch */
    if(hold)return 1;
    var e=now-(d.bch||-1e9);
    return e<BEAM_HOLD?1:(e<BEAM_HOLD+BEAM_FADE?1-(e-BEAM_HOLD)/BEAM_FADE:0);
  }
  function tethF(d,now){   /* 1 selama tahan; setelah transisi (d.tch) penuh TETH_HOLD ms lalu pudar TETH_FADE ms */
    if(hold)return 1;
    var e=now-(d.tch||-1e9);
    return e<TETH_HOLD?1:(e<TETH_HOLD+TETH_FADE?1-(e-TETH_HOLD)/TETH_FADE:0);
  }
  function teleSize(){return typeof TELE_CFG!=='undefined'?Math.max(1,TELE_CFG.size):1;}
  /* pulse di kaki drone (elips di tanah; bidang tanah gepeng oleh perspektif). Kuning pelan = drone di-drop, pink cepat = TX/RX aktif. Digambar di ruang layar tegak. */
  function ell(x,y,rx,ry){if(g.ellipse)g.ellipse(x,y,rx,ry,0,0,6.283);else{g.save();g.translate(x,y);g.scale(1,ry/rx);g.arc(0,0,rx,0,6.283);g.restore();}}
  function drawFeet(fp,col,pink,now,d){
    var x=fp.ux,y=fp.uy,k=Math.max(.8,Math.min(1.2,fp.k/46))*fScale(),per=pink?1500:2600,i,f,lt;
    planetUprightBegin(g);
    g.lineWidth=1.2;
    g.fillStyle='rgba('+col+','+(pink?.24:.12)+')';g.beginPath();ell(x,y,7*k,2.4*k);g.fill();
    if(reduce||lite()){g.strokeStyle='rgba('+col+','+(pink?.55:.3)+')';g.beginPath();ell(x,y,13*k,4.4*k);g.stroke();}
    else for(i=0;i<(pink?2:1);i++){
      f=((now+i*per*.5)%per)/per;
      g.strokeStyle='rgba('+col+','+((pink?.62:.34)*(1-f))+')';g.beginPath();ell(x,y,(6+f*22)*k,(6+f*22)*k*.34);g.stroke();
    }
    lt=(d&&d.landT)?now-d.landT:1e9;
    if(lt<700&&!reduce){f=lt/700;g.strokeStyle='rgba('+col+','+((1-f)*.75)+')';g.lineWidth=1.6;g.beginPath();ell(x,y,(8+f*38)*k,(8+f*38)*k*.34);g.stroke();}
    g.restore();
  }

  /* ---------- ring tahan teleskop ---------- */
  function drawHold(now){
    if(!hold)return;
    var el=now-hold.t0;if(el<HOLD_SHOW)return;
    var t=tele(),dd=(hold.tg==='drone'&&SECT.cur&&D[SECT.cur.k])?D[SECT.cur.k].pos:null;
    if(dd)t=dd;if(!t)return;
    var col=NEU;
    if(SECT.cur&&!SECT.on)col=fcol('hold',ilCol(SECT.cur),now);
    var f=c01(el/HOLD_MS),R=dd?18:26*(typeof TELE_CFG!=='undefined'?Math.max(1,TELE_CFG.size):1),fade=c01((el-HOLD_SHOW)/120),full=f>=1,pulse=full&&!reduce?.6+.4*Math.sin(now*.02):1;
    g.save();g.lineCap='round';
    g.strokeStyle='rgba('+col+','+(.18*fade)+')';g.lineWidth=2;g.beginPath();g.arc(t[0],t[1],R,0,6.283);g.stroke();
    g.strokeStyle='rgba('+col+','+(.28*fade*pulse)+')';g.lineWidth=6;g.beginPath();g.arc(t[0],t[1],R,-1.5708,-1.5708+6.283*f);g.stroke();
    g.strokeStyle='rgba('+col+','+(.95*fade*pulse)+')';g.lineWidth=2;g.beginPath();g.arc(t[0],t[1],R,-1.5708,-1.5708+6.283*f);g.stroke();
    g.restore();
  }

  /* ---------- di dalam sektor ---------- */
  function drawSector(now,s){
    if(typeof lisGone==='function'&&lisGone()){lastCur=null;return;}   /* teleskop ditinggal di sektor lain: nggak ada yang digambar */
    var mode=want(s),d=D[s.k]||(D[s.k]={ph:'idle',mode:null,trail:[],sg:hsh(s.k),t0:0,from:null,pos:null,key:null,hop:false,gu:null,gs:0,landT:0}),
        curKey=(mode==='src'&&TX.by[s.k])?TX.by[s.k].key:null;   /* bintang pemancar sekarang (berubah kalau SFX ganti) */
    var LM=landMode();
    if(lastCur!==s){lastCur=s;d.bon=false;d.trail.length=0;d.ph=mode?'dock':'idle';d.mode=mode;d.from=null;d.pos=null;d.key=curKey;d.hop=false;   /* masuk sektor: snap, tanpa animasi */
      if(LM&&d.gu!=null){var gq=planetGroundAt(d.gu,d.gs,now,0);if(gq&&gq.off)d.gu=null;}}   /* selama ditinggal permukaan terus berputar: kalau drone sudah terbawa keluar layar, cari tempat baru */
    var tp=tele();if(!tp)return;
    if(LM&&mode&&d.gu==null){   /* tempat mendarat: dekat teleskop, dipilih saat planet sudah kelihatan */
      var pk=planetLandPick(tp[0],tp[1],now,null);if(pk){d.gu=pk.u;d.gs=pk.s;d.g0=(typeof planetRotPx==='function')?planetRotPx(now):0;}
    }
    var col=fcol('sec:'+s.k,ilCol(s),now);
    /* transisi state */
    if(LM&&mode&&d.ph==='dock'&&d.mode!==mode){d.mode=mode;d.key=curKey;}   /* sudah mendarat: ganti peran (sby/rcv/src) tanpa terbang lagi */
    if(mode&&(d.ph==='idle'||d.ph==='back'||d.mode!==mode)){
      var live=!!(d.pos&&(d.ph==='back'||d.ph==='dock'||d.ph==='out'));
      d.from=live?d.pos.slice():null;
      d.hop=!!(live&&d.ph!=='back');   /* ganti peran (TX↔RX) saat drone masih di luar: terbang langsung dari posisi sekarang, tanpa fade dari teleskop */
      d.ph='out';d.t0=now;d.tch=now;d.mode=mode;d.key=curKey;col=fcol('sec:'+s.k,ilCol(s),now);
      if(!d.hop)ping(tp[0],tp[1],col,now,false);else ping(d.pos[0],d.pos[1],col,now,false);
    }else if(mode==='src'&&d.key!==curKey){   /* SFX ganti bintang di sektor yang sama: drone pindah orbit ke bintang baru */
      if(!LM&&d.ph==='dock'&&d.pos){d.from=d.pos.slice();d.ph='out';d.t0=now;d.tch=now;d.hop=true;ping(d.pos[0],d.pos[1],col,now,false);}
      d.key=curKey;   /* kalau masih 'out': targetOf() dihitung ulang tiap frame, jalur otomatis membelok ke bintang baru */
    }else if(!mode&&(d.ph==='out'||d.ph==='dock')){
      d.from=d.pos?d.pos.slice():tp;d.ph='back';d.t0=now;d.tch=now;d.hop=false;
    }
    if(d.ph==='idle')return;
    var T=d.mode?targetOf(s,d.mode,d,now):null,pos,al=1,u,e,baseSc=fScale(),dsc=baseSc,landF=0;
    if(d.ph==='out'){
      if(!T){if(LM){d.t0=now;return;}d.ph='idle';return;}   /* planet belum kelihatan: tahan dulu, terbang mulai saat tanah ada */
      u=reduce?1:c01((now-d.t0)/1700);e=ease(u);al=d.hop?1:e;
      pos=bez(d.from||tp,orbit(T,now,d.sg),e,d.sg*.28);
      if(T.sc){dsc=baseSc+(T.sc-baseSc)*e;landF=c01((e-.7)/.3);}
      if(u>=1){d.ph='dock';d.hop=false;d.tch=now;if(LM)d.landT=now;else ping(T.x,T.y,col,now,true);}
    }else if(d.ph==='dock'){
      if(!T){if(LM)return;d.ph='idle';return;}
      if(T.ground&&T.ground.off){   /* terbawa rotasi sampai keluar layar: lepas landas, mendarat lagi di sisi lain (status interlock tetap) */
        var rp=planetLandPick(tp[0],tp[1],now,T.ground.ux>PW*.5?.13:.5);
        if(rp){d.gu=rp.u;d.gs=rp.s;d.g0=(typeof planetRotPx==='function')?planetRotPx(now):0;d.from=d.pos?d.pos.slice():null;d.hop=true;d.ph='out';d.t0=now;d.tch=now;}
        return;
      }
      pos=orbit(T,now,d.sg);
      if(T.sc){dsc=T.sc;landF=1;}
    }else{   /* back */
      u=reduce?1:c01((now-d.t0)/1400);e=ease(u);al=1-e;
      pos=bez(d.from||tp,tp,e,-d.sg*.28);
      if(T&&T.sc){dsc=T.sc+(baseSc-T.sc)*e;landF=1-c01(e/.35);}
      if(u>=1){d.ph='idle';d.trail.length=0;d.gu=null;ping(tp[0],tp[1],col,now,false);return;}
    }
    d.pos=pos;landF*=DRONE_ORB.pose;
    if(!reduce){var tl=d.trail,lp=tl.length?tl[tl.length-1]:null;if(!lp||Math.abs(lp[0]-pos[0])+Math.abs(lp[1]-pos[1])>1.2){tl.push([pos[0],pos[1],now]);if(tl.length>28)tl.shift();}}
    /* semua gambar drone ditunda ke drawTop() (setelah planet): trail, tether, berkas bintang, pulse kaki, sprite, label */
    var tx=TX.by[s.k],beam=null;
    /* docking jadi receiver (sektor selain sumber): tanpa garis putus-putus. Berlaku saat sudah RX, dan selama menahan drone yang akan jadi RX. Drop drone dari teleskop (kuning) tetap bergaris. */
    var rcvQuiet=(d.mode==='rcv')||!!(hold&&hold.tg==='drone'&&d.mode==='sby'&&!(typeof sfxSector==='function'&&sfxSector()===s));
    var bOn=!!(d.ph==='dock'&&tx&&tx.on);
    if(bOn&&(!d.bon||d.bkey!==curKey))d.bch=now;   /* berkas baru muncul (SFX mulai / mendarat / ganti bintang): mulai hitung tampil -> pudar */
    d.bon=bOn;d.bkey=curKey;
    if(bOn){
      if(!tx.recv){var sp0=txStarPos(tx.key),q0=sp0&&gravityPos(sp0[0],sp0[1]);if(q0)beam={a:[q0[0],q0[1]],rx:false};}   /* TX: berkas dari bintang SFX ke drone */
      else if(!rcvQuiet)beam={a:[pos[0],Math.max(6,pos[1]-H*.4)],rx:true};   /* RX: sinyal turun dari atas (tidak di sektor selain sumber: docking receiver tanpa garis putus) */
    }
    TOP={x:pos[0],y:pos[1],col:col,al:al,txt:(tx&&tx.on)?(tx.recv?'RX':'TX'):'',d:d,tp:tp,sc:dsc,land:landF,beam:beam,
         foot:(d.ph==='dock'&&T&&T.ground)?T.ground:null,pulse:!!(tx&&tx.on),quiet:rcvQuiet};
  }
  /* Tahap atas: dipanggil SETELAH planet (05-sector-ui.js frame()), jadi drone yang mendarat berdiri DI ATAS permukaan planet, di atas Gargantua/reticle. */
  function drawTop(now){
    var T=TOP;TOP=null;
    if(typeof g==='undefined'||!g||CAMERA_MODE)return;
    g.save();
    try{
      if(T){
        drawTrail(T.d,T.col,now);
        if(T.beam)tether(T.beam.a,[T.x,T.y],T.col,(T.beam.rx?.7:1)*beamF(T.d,now),now,T.beam.rx?0:8,10);   /* memudar sendiri (beamF), bukan permanen */
        if(!T.quiet)tether([T.x,T.y],T.tp,T.col,T.al*tethF(T.d,now),now,6,15);   /* sinyal drone→teleskop: hanya saat transisi/tahan, dan tidak saat jadi receiver */
        if(T.foot)drawFeet(T.foot,T.col,T.pulse,now,T.d);
        if(typeof DR3D!=='undefined')DR3D.land=T.land;
        drawDrone(T.x,T.y,T.col,Math.max(.35,T.al),now,T.sc);
        if(T.txt)label(T.x,T.y-26*T.sc,T.txt,T.col,T.al);
      }
      drawHold(now);   /* cincin tahan di atas planet juga, supaya cincin di drone yang mendarat tidak tertutup */
    }finally{g.restore();}
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

  function draw(now){
    TOP=null;
    if(typeof g==='undefined'||!g)return;
    if(CAMERA_MODE){lastCur=null;return;}   /* mode cam: drone + teleskop disembunyikan; keluar cam = snap ke posisi akhir tanpa animasi */
    g.save();
    try{
      if(SECT.cur&&!SECT.on){if(!SECT.busy)drawSector(now,SECT.cur);}
      else lastCur=null;
      drawPings(now);
    }finally{g.restore();}
  }
  return {
    ORB:DRONE_ORB,   /* knob orbit atmosfer: TXFX.ORB.ru / rs / lift / bob / per / counter / pose (bisa dituning live dari console) */
    draw:draw,
    drawTop:drawTop,
    holdStart:function(tg){hold={t0:performance.now(),tg:tg||'tele'};},
    /* hit-test drone (F8): true kalau (x,y) kena drone yang sedang terlihat di sektor ini. Dites SEBELUM teleskop. */
    droneAt:function(x,y){
      if(CAMERA_MODE||!SECT.cur||SECT.on||SECT.busy)return false;
      if(typeof lisGone==='function'&&lisGone())return false;
      var d=D[SECT.cur.k];if(!d||!d.pos||(d.ph!=='dock'&&d.ph!=='out'))return false;
      return Math.hypot(x-d.pos[0],y-d.pos[1])<=Math.max(22,W*.05);
    },
    holdEnd:function(){hold=null;},
    role:function(){   /* 'src' = TX docked di sektor ini, 'rcv' = RX standby pink, 'sby' = kuning, null = idle; dipakai LED teleskop */
      if(!SECT.cur||SECT.on||SECT.busy)return null;
      if(typeof lisGone==='function'&&lisGone())return null;
      return want(SECT.cur);
    },
    reset:function(){D={};CF={};hold=null;pings.length=0;lastCur=null;TOP=null;}
  };
})();
function drawTxLines(now){TXFX.draw(now);}
function drawTxTop(now){TXFX.drawTop(now);}
