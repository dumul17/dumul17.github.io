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

  /* delegasi tap: ikon HUD, owl (+ isi panelnya), music, portal, tombol fokus cam, panel exit teleskop, kartu pilihan teleskop (tap teleskop sendiri: UIS.tap() manual di 06) */
  document.addEventListener('pointerdown',function(e){
    var t=e.target;
    if(t&&t.closest&&t.closest('#mode-cluster button,#owl-source,#music-toggle,.portal,.portal-hit,#cam-focus button,#bp-close,#music-close,#exit-panel button,#exit-backdrop,#owl-close,#owl-backdrop,.owl-link,.owl-chip,.owl-tab,#lis-ask button'))tap();
  },true);

  return {noise:noise,radar:radar,tap:tap,deny:deny,chime:chime,duck:duck,duckMul:duckMul};
})();
