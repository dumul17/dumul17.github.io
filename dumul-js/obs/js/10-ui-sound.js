'use strict';
/* 10-ui-sound.js — SFX synth Web Audio (tanpa file audio): radar cam, noise LIS/star tracker, tap UI, chime rasi.
   Semua lewat satu bus (ikut __mpMasterVol, mati kalau RADIO_SILENCE). Spatial muffle TIDAK disentuh.
   Ducking: Stellar Signals diturunkan lewat AV.duck (GainNode, dipasang di ensureAVGraph) selama noise jalan. */
var UIS=(function(){
  var bus=null,nbuf=null,duckN=0,duckT=0,radarT=0,radarOn=false,lastTap=0;
  var PENTA=[0,2,4,7,9],RADAR_P=6.2832/.0012; /* periode sapuan radar = sama dengan sectorScanUpdate (now*.0012) */
  function ctx(){
    try{if(typeof ensureAVGraph==='function'&&!ensureAVGraph())return null;}catch(e){return null;}
    var c=window.AV&&AV.ctx;if(!c)return null;
    if(c.state!=='running'){try{c.resume();}catch(e2){}}
    return c;
  }
  function vol(){
    if(typeof RADIO_SILENCE!=='undefined'&&RADIO_SILENCE)return 0;
    return window.__mpMasterVol!=null?window.__mpMasterVol:.85;
  }
  function out(c){
    if(!bus||bus.context!==c){bus=c.createGain();bus.connect(c.destination);}
    bus.gain.value=vol()*.6;
    return bus;
  }
  function tone(c,t,f0,f1,dur,peak,type){
    var o=c.createOscillator(),g=c.createGain();
    o.type=type||'sine';
    o.frequency.setValueAtTime(f0,t);
    if(f1!==f0)o.frequency.exponentialRampToValueAtTime(f1,t+dur);
    g.gain.setValueAtTime(0.0001,t);
    g.gain.exponentialRampToValueAtTime(peak,t+.008);
    g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    o.connect(g);g.connect(out(c));
    o.start(t);o.stop(t+dur+.02);
    o.onended=function(){try{o.disconnect();g.disconnect();}catch(e){}};
  }
  function noiseBuf(c){
    if(nbuf&&nbuf.sampleRate===c.sampleRate)return nbuf;
    var n=c.sampleRate*2,b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);
    for(var i=0;i<n;i++)d[i]=Math.random()*2-1;
    return (nbuf=b);
  }
  /* ---- ducking Stellar Signals ---- */
  function applyDuck(){
    var c=window.AV&&AV.ctx;
    if(c&&AV.duck){try{AV.duck.gain.setTargetAtTime(duckN>0?.3:1,c.currentTime,.08);}catch(e){}}
  }
  function duck(ms){
    duckN++;applyDuck();
    setTimeout(function(){duckN=Math.max(0,duckN-1);applyDuck();},ms+250);
  }
  function duckMul(){return duckN>0?.3:1;} /* dipakai jalur fallback volume (potato) di updateSpatialAttenuation */

  /* ---- noise statis LIS / star tracker: durasi = durasi event ---- */
  function noise(ms,full){
    var c=ctx();if(!c||!vol())return;
    var t=c.currentTime,d=Math.max(.4,ms/1000),peak=full?.2:.1;
    var src=c.createBufferSource();src.buffer=noiseBuf(c);src.loop=true;
    var bp=c.createBiquadFilter();bp.type='bandpass';bp.Q.value=.8;
    bp.frequency.setValueAtTime(full?1400:2200,t);
    bp.frequency.linearRampToValueAtTime(full?2600:1600,t+d);
    var g=c.createGain(),n=Math.max(8,Math.ceil(d*24)),cur=new Float32Array(n),i,u,env;
    for(i=0;i<n;i++){ /* envelope naik cepat, turun di 0.5 dtk terakhir + crackle acak */
      u=i/(n-1);env=Math.min(1,u*d/.06)*Math.min(1,(1-u)*d/.5);
      cur[i]=peak*env*(.35+.65*Math.random());
    }
    g.gain.setValueAtTime(0,t);
    g.gain.setValueCurveAtTime(cur,t,d);
    src.connect(bp);bp.connect(g);g.connect(out(c));
    src.start(t);src.stop(t+d+.05);
    src.onended=function(){try{src.disconnect();bp.disconnect();g.disconnect();}catch(e){}};
    if(full){tone(c,t,880,110,.5,.12,'sawtooth');} /* "kehilangan sinyal" turun */
    duck(ms);
  }

  /* ---- radar scanning: aktif selama mode cam; ping jatuh pas sapuan visual di sudut 0 ---- */
  function radarPing(){
    var c=ctx();if(!c||!vol()||document.hidden)return;
    var t=c.currentTime;
    tone(c,t,1500,1000,.35,.10,'sine');
    tone(c,t+.18,1500,1000,.3,.04,'sine'); /* gema */
    var src=c.createBufferSource();src.buffer=noiseBuf(c);
    var bp=c.createBiquadFilter();bp.type='bandpass';bp.Q.value=2;
    bp.frequency.setValueAtTime(600,t);bp.frequency.exponentialRampToValueAtTime(2400,t+.5);
    var g=c.createGain();
    g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(.015,t+.12);g.gain.exponentialRampToValueAtTime(0.0001,t+.5);
    src.connect(bp);bp.connect(g);g.connect(out(c));
    src.start(t);src.stop(t+.55);
    src.onended=function(){try{src.disconnect();bp.disconnect();g.disconnect();}catch(e){}};
  }
  function radarLoop(){
    if(!radarOn)return;
    if(typeof CAMERA_MODE!=='undefined'&&!CAMERA_MODE){radarOn=false;return;} /* Observe dimatikan = CAMERA_MODE ikut mati tanpa lewat setCameraMode */
    radarT=setTimeout(function(){if(typeof CAMERA_MODE!=='undefined'&&!CAMERA_MODE){radarOn=false;return;}radarPing();radarLoop();},RADAR_P-(performance.now()%RADAR_P));
  }
  function radar(on){
    clearTimeout(radarT);radarOn=!!on;
    if(on)radarLoop();
  }

  /* ---- tap UI + deny + chime rasi (satu timbre, tangga pentatonik) ---- */
  function tap(){
    var n=performance.now();if(n-lastTap<40)return;lastTap=n;
    var c=ctx();if(!c||!vol())return;
    tone(c,c.currentTime,1200,900,.05,.07,'triangle');
  }
  function deny(){
    var c=ctx();if(!c||!vol())return;
    var t=c.currentTime;
    tone(c,t,130,120,.09,.08,'sawtooth');tone(c,t+.12,130,110,.09,.08,'sawtooth');
  }
  /* step 0..n = anak tangga pentatonik (naik tiap langkah alignment); -1 = chord penutup */
  function chime(step){
    var c=ctx();if(!c||!vol())return;
    var t=c.currentTime,base=261.63;
    function f(s){return base*Math.pow(2,PENTA[s%5]/12)*(s>=5?2:1);}
    if(step<0){tone(c,t,f(0),f(0),.7,.08);tone(c,t,f(2),f(2),.7,.07);tone(c,t,f(4),f(4),.8,.06);return;}
    var fr=f(step);
    tone(c,t,fr,fr,.5,.1);tone(c,t,fr*2,fr*2,.3,.025); /* + harmonik tipis */
  }

  /* ---- pop: bunyi muncul toast / popup / sheet (satu timbre dgn tap & chime; debounce per jenis) ---- */
  var popLast={};
  function pop(kind){
    var n=performance.now(),gap=kind==='toast'||kind==='tip'?260:120;
    if(n-(popLast[kind]||0)<gap)return;popLast[kind]=n;
    var c=ctx();if(!c||!vol()||document.hidden)return;
    var t=c.currentTime,src,bp,g;
    if(kind==='toast'){tone(c,t,880,1180,.09,.05,'triangle');return;}
    if(kind==='tip'){tone(c,t,660,780,.14,.035,'sine');return;}
    if(kind==='frag'){ /* fragment / last signal: dua nada naik pentatonik + harmonik tipis */
      var a=261.63*Math.pow(2,PENTA[2]/12)*2,b=261.63*Math.pow(2,PENTA[4]/12)*2;
      tone(c,t,a,a,.35,.06);tone(c,t+.14,b,b,.5,.06);tone(c,t+.14,b*2,b*2,.3,.02);return;
    }
    if(kind==='ask'){tone(c,t,700,700,.1,.05,'triangle');tone(c,t+.11,930,930,.14,.05,'triangle');return;}
    if(kind==='open'){ /* sheet / kartu: swoosh noise tipis naik + blip */
      src=c.createBufferSource();src.buffer=noiseBuf(c);
      bp=c.createBiquadFilter();bp.type='bandpass';bp.Q.value=1.2;
      bp.frequency.setValueAtTime(500,t);bp.frequency.exponentialRampToValueAtTime(2200,t+.18);
      g=c.createGain();g.gain.setValueAtTime(0.0001,t);
      g.gain.exponentialRampToValueAtTime(.03,t+.06);g.gain.exponentialRampToValueAtTime(0.0001,t+.2);
      src.connect(bp);bp.connect(g);g.connect(out(c));
      src.start(t);src.stop(t+.22);
      src.onended=function(){try{src.disconnect();bp.disconnect();g.disconnect();}catch(e){}};
      tone(c,t+.05,1000,1400,.08,.03,'triangle');
    }
  }

  /* ---- wormhole tunnel (09-wormhole.js): bed berkelanjutan (angin noise + sub + desis sawtooth) yang mengikuti env & kecepatan terowongan,
     plus one-shot: whine muatan + klik plat (enter), dentum saat layar tertutup (hit), kilat keluar (flash). Lewat bus yang sama, tidak lewat muffle.
     Watchdog: kalau 09-wormhole berhenti memanggil warpUpd (tab hidden / transisi macet / state idle tanpa hide) bunyi dipadamkan sendiri. ---- */
  var WH={on:false,c:null,m:null,n:null,bp:null,sub:null,sh:null,sh2:null,lp:null,last:0,wd:0};
  function burst(c,t,type,f0,f1,dur,peak,q){
    var s=c.createBufferSource();s.buffer=noiseBuf(c);
    var f=c.createBiquadFilter();f.type=type;f.Q.value=q||1;
    f.frequency.setValueAtTime(f0,t);f.frequency.exponentialRampToValueAtTime(f1,t+dur);
    var g=c.createGain();g.gain.setValueAtTime(0.0001,t);
    g.gain.exponentialRampToValueAtTime(peak,t+dur*.15);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    s.connect(f);f.connect(g);g.connect(out(c));
    s.start(t);s.stop(t+dur+.05);
    s.onended=function(){try{s.disconnect();f.disconnect();g.disconnect();}catch(e){}};
  }
  function whBuild(c){
    var t=c.currentTime,m=c.createGain();
    m.gain.setValueAtTime(0.0001,t);m.connect(out(c));
    var n=c.createBufferSource();n.buffer=noiseBuf(c);n.loop=true;
    var bp=c.createBiquadFilter();bp.type='bandpass';bp.Q.value=.9;bp.frequency.value=400;
    var g0=c.createGain();g0.gain.value=.55;
    n.connect(bp);bp.connect(g0);g0.connect(m);
    var sub=c.createOscillator();sub.type='sine';sub.frequency.value=56;
    var g1=c.createGain();g1.gain.value=.5;sub.connect(g1);g1.connect(m);
    var lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=380;lp.Q.value=2;
    var sh=c.createOscillator(),sh2=c.createOscillator();
    sh.type='sawtooth';sh2.type='sawtooth';sh.frequency.value=90;sh2.frequency.value=91.6;   /* dua saw sedikit sumbang = desis berdenyut */
    var g2=c.createGain();g2.gain.value=.15;sh.connect(lp);sh2.connect(lp);lp.connect(g2);g2.connect(m);
    n.start(t,Math.random());sub.start(t);sh.start(t);sh2.start(t);
    WH.c=c;WH.m=m;WH.n=n;WH.bp=bp;WH.sub=sub;WH.sh=sh;WH.sh2=sh2;WH.lp=lp;WH.on=true;WH.last=performance.now();
    clearInterval(WH.wd);
    WH.wd=setInterval(function(){if(performance.now()-WH.last>700)whStop();},300);
  }
  function whStop(){
    if(!WH.on)return;
    var c=WH.c,m=WH.m,t,nodes=[WH.n,WH.sub,WH.sh,WH.sh2];
    WH.on=false;clearInterval(WH.wd);
    try{
      t=c.currentTime;m.gain.cancelScheduledValues(t);m.gain.setTargetAtTime(0.0001,t,.08);
      nodes.forEach(function(o){try{o.stop(t+.5);}catch(e){}});
      nodes[1].onended=function(){try{nodes.forEach(function(o){o.disconnect();});WH.bp.disconnect();WH.lp.disconnect();m.disconnect();}catch(e){}};
    }catch(e2){}
  }
  /* mulai: ms = lama fase enter (teleskop terbang ke cincin), chT = lama muatan plat (12 klik naik nada) */
  function warpBegin(ms,chT){
    var c=ctx();if(!c||!vol()||document.hidden)return;
    if(!WH.on)whBuild(c);else WH.last=performance.now();
    var t=c.currentTime,d=Math.max(.6,(ms||900)/1000),k,ct=Math.max(.3,(chT||ms||900)/1000);
    tone(c,t,200,820,d,.05,'sine');tone(c,t,400,1640,d,.014,'triangle');   /* whine muatan naik */
    for(k=0;k<12;k++)tone(c,t+ct*k/12,900+80*k,820+80*k,.04,.03,'triangle');   /* klik plat */
  }
  /* tiap frame dari tick() wormhole: st = state, env 0..1 (kepekatan terowongan), rate = kecepatan streak */
  function warpUpd(st,env,rate){
    if(st==='idle'){whStop();return;}
    if(!WH.on){var c0=ctx();if(!c0||!vol()||document.hidden)return;whBuild(c0);}
    var c=WH.c,t=c.currentTime,e=Math.max(0,Math.min(1,env||0)),sp=Math.max(0,Math.min(1.3,((rate||.7)-.6)/1.1));
    WH.last=performance.now();
    WH.m.gain.setTargetAtTime(.5*e,t,.09);
    WH.bp.frequency.setTargetAtTime(260+1700*sp,t,.1);
    WH.sub.frequency.setTargetAtTime(52+16*sp,t,.15);
    WH.sh.frequency.setTargetAtTime(88+60*sp,t,.15);WH.sh2.frequency.setTargetAtTime(89.6+61*sp,t,.15);
    WH.lp.frequency.setTargetAtTime(320+700*sp,t,.15);
  }
  function warpFx(kind){
    if(kind==='stop'){whStop();return;}
    var c=ctx();if(!c||!vol()||document.hidden)return;
    var t=c.currentTime;
    if(kind==='hit'){   /* layar tertutup terowongan: dentum rendah + hembusan */
      tone(c,t,140,38,.7,.2,'sine');burst(c,t,'lowpass',900,180,.55,.12,.8);
    }else if(kind==='flash'){   /* keluar dari portal tujuan: kilat + kilau turun */
      burst(c,t,'bandpass',3200,500,.7,.1,1.2);
      tone(c,t,1760,880,.5,.04,'triangle');tone(c,t+.08,2093,1046,.5,.025,'sine');
    }
  }

  /* delegasi tap: ikon HUD, owl (+ isi panelnya), music, portal, tombol fokus cam, panel exit teleskop, kartu pilihan teleskop, panel tuning, kontrol music player (prev/next/shuffle/repeat/mute/visualizer/accordion), tombol CAM (band/lines/log/game), katalog + log rasi, tutup fragment, capsule boot (tap teleskop sendiri: UIS.tap() manual di 06) */
  document.addEventListener('pointerdown',function(e){
    var t=e.target;
    if(t&&t.closest&&t.closest('#mode-cluster button,#owl-source,#music-toggle,.portal,.portal-hit,#cam-focus button,#music-close,#exit-panel button,#exit-backdrop,#owl-close,#owl-backdrop,.owl-link,.owl-chip,.owl-tab,#lis-ask button,#bh-panel button,#owl-perf-save,#owl-perf-reset,#mode-silence,#mp-av-toggle,.mp-grp-head,.mp-ctrl,#cam-band button,#cg-btn,.ci-catbtn,#cam-cat button,#cam-ach button,#sf-close,.boot-cap'))tap();
  },true);

  return {noise:noise,radar:radar,pop:pop,tap:tap,deny:deny,chime:chime,duck:duck,duckMul:duckMul,warpBegin:warpBegin,warpUpd:warpUpd,warpFx:warpFx};
})();
