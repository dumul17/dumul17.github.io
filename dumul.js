try{
(function(){
  /* Lirik per lagu. Kunci = judul lagu huruf kecil. Format sinkron: [menit:detik.pecahan] teks baris */
  var LYRICS={"glitch-instrumental": "[ti:Glitch (Instrumental)]\n[ar:Dumul]\n[al:Limerence]\n[00:00.00] [ Track Notes ]\n[00:11.00] Glitch (Instrumental) is the same glitch, before it learned how to speak.\n[00:21.00] There are no lyrics here — just the signal, the noise, and whatever was left behind when the words disappeared.\n[00:36.00] It is the same composition as Glitch, stripped of its voice and placed at the beginning of the album,\n[00:49.00] like finding the corrupted file before opening the folder.\n[00:58.00] Think of it as a memory trying to load.\n[01:05.00] It almost does.\n[01:10.00] Then it glitches again.\n[01:15.00] And that is where the original Glitch eventually arrives: at the line “bersamamu, ku tanpamu.”\n[01:28.00] It sounds like a sentence that should make sense.\n[01:36.00] But it doesn't.\n[01:40.00] The phrase contradicts itself — with you, without you —\n[01:49.00] as if two incompatible states are being written into the same line at the same time.\n[02:01.00] Like a corrupted system log that keeps recording the same event,\n[02:10.00] even though the system can no longer decide which state is true.\n[02:20.00] With you, I feel everything.\n[02:26.00] Without you, I don't know what I'm feeling anymore.\n[02:34.00] So the ending isn't really a conclusion. It's a loop.\n[02:42.00] A final line caught between two states, neither of them willing to disappear.\n[02:53.00] Maybe that's why the song is called Glitch.\n[03:01.00] The error isn't that the memory is broken.\n[03:08.00] The error is that it still works.\n[03:14.00] So this is where the album starts: not with an answer, not even with a question, but with a signal.\n[03:28.00] Listen closely.\n[03:32.00] Something is already watching.\n[03:38.00] Or maybe you're just looking back at yourself.\n[03:46.00] Either way, welcome to the glitch.", "limerence": "[ti:Limerence]\n[ar:Dumul]\n[al:Limerence]\n[00:30.00] Cinta yang kurasa\n[00:33.00] terlanjur sudah\n[00:36.00] tak bisa kulepas\n[00:43.00] maafkanlah\n[00:45.00] jika\n[00:47.00] aku telah memaksa\n[00:52.00] 'tuk kau terima\n[00:55.00] aku\n[01:01.00] maafkan\n[01:02.00] aku\n[01:06.00] tak bisa\n[01:09.00] berhenti\n[01:12.00] mencintaimu\n[01:15.00] salahkan aku\n[01:20.00] andainya\n[01:23.00] kau terluka\n[01:25.00] karena diriku\n[01:30.00] tak bisakah\n[01:34.00] kau mengerti\n[01:56.00] maafkanlah\n[01:58.00] jika\n[02:00.00] aku telah memaksa\n[02:03.00] 'tuk kau terima\n[02:08.00] aku\n[02:14.00] maafkan aku\n[02:19.00] tak bisa\n[02:22.00] berhenti\n[02:25.00] mencintaimu.\n[02:28.00] Salahkan\n[02:30.00] aku\n[02:33.00] andainya\n[02:36.00] kau terluka\n[02:38.00] karena diriku.\n[02:43.00] Tak bisakah\n[02:47.00] kau mengerti?\n[02:50.00] Tak bisakah\n[02:53.00] kau mengerti?\n[02:57.00] Aku... Oh...", "glitch": "[ti:Glitch]\n[ar:Dumul]\n[al:Limerence]\n[00:33.00] Kucoba tuk melupakanmu.\n[00:38.00] Hatiku\n[00:40.00] tak mampu.\n[00:44.00] Bayangmu selalu hantuiku.\n[00:49.00] Belenggu\n[00:51.00] langkahku.\n[01:00.00] Dalam gelapnya hati ini\n[01:05.00] tanpamu\n[01:08.00] kuları.\n[01:11.00] Pencar-i diriku hindari\n[01:16.00] sedihku\n[01:19.00] tak peduli.\n[01:27.00] Bersamamu\n[01:30.00] ku rasakan\n[01:33.00] walau semua duka lara.\n[01:38.00] Dan tanpamu\n[01:41.00] ku tak\n[01:43.00] bisa merasakan\n[01:47.00] arti cinta.\n[02:32.00] Bersamamu\n[02:35.00] kurasakan\n[02:38.00] walau semua duka lara.\n[02:44.00] Dan tanpamu\n[02:47.00] ku tak\n[02:48.00] bisa\n[02:49.00] merasakan\n[02:51.00] arti cinta.\n[02:55.00] Bersamamu.\n[03:00.00] Ku Tanpamu.\n[03:06.00] Bersamamu.\n[03:11.00] Ku Tanpamu.", "nastenka": "[ti:Nastenka]\n[ar:Dumul]\n[al:Limerence]\n[00:27.00] Kusadari\n[00:32.00] jika aku ini\n[00:38.00] bukan terbaik,\n[00:40.00] bukan terindah\n[00:43.00] untuk dirimu.\n[00:48.00] Kupahami\n[00:54.00] isi\n[00:55.00] hatimu\n[00:59.00] yang tak bisa\n[01:01.00] menerima cintaku\n[01:04.00] kepadamu.\n[01:10.00] Jangan ragu\n[01:15.00] tuk ungkapkan isi hatimu.\n[01:20.00] Jangan takut\n[01:25.00] jika ku terluka.\n[01:32.00] Dalam hati aku menangis\n[01:37.00] ketika ku tahu\n[01:40.00] kau tak memilihku.\n[01:42.00] Dalam hati aku kecewa\n[01:48.00] ketika ku sadar\n[01:50.00] cintamu bukan untukku.\n[02:27.00] Dalam hati aku menangis\n[02:33.00] ketika ku tahu\n[02:35.00] kau tak memilihku.\n[02:38.00] Dalam\n[02:39.00] hati aku kecewa\n[02:43.00] ketika ku sadar cintamu\n[02:48.00] bukan untukku.\n[02:57.00] Cintamu bukan untukku.\n[03:07.00] Cintamu\n[03:09.00] bukan\n[03:10.00] untukku...", "larung": "[ti:Larung]\n[ar:Dumul]\n[al:Limerence]\n[00:18.00] Jangan lagi\n[00:22.00] kau bohongi\n[00:25.00] perasaanmu.\n[00:32.00] Jangan lagi\n[00:36.00] kau paksakan\n[00:39.00] hadirmu\n[00:47.00] 'tuk diriku.\n[00:53.00] Ku tahu kau mencintai\n[00:57.00] dia...\n[01:00.00] Sudahi semua.\n[01:08.00] Maafkan aku.\n[01:15.00] Takkan lagi\n[01:18.00] ku paksakan\n[01:22.00] hatiku...\n[01:28.00] Dan takkan lagi\n[01:32.00] ku mencoba\n[01:35.00] mengharapkanmu.\n[01:42.00] Untuk diriku\n[01:49.00] sepenuhnya\n[01:51.00] kau cintai\n[01:53.00] dia...\n[01:56.00] Sudahi\n[01:57.00] semua.\n[02:04.00] Lupakan aku.\n[02:08.00] Ku tahu kau tak pernah\n[02:12.00] bisa....\n[02:17.00] mencintaiku.\n[02:22.00] Ku tahu hatimu hanyalah\n[02:32.00] untuk dirinya,\n[02:38.00] bukan diriku.\n[02:45.00] Ku tahu kau mencintai\n[02:49.00] dia....\n[02:52.00] Sudahi semua.\n[03:00.00] Lupakan\n[03:01.00] aku.....\n[03:32.00] Ku tahu kau tak pernah\n[03:36.00] bisa\n[03:39.00] mencintaiku.\n[03:47.00] Ku tahu hatimu hanyalah\n[03:56.00] untuk dirinya,\n[04:02.00] bukan diriku.\n[04:09.00] Sepenuhnya\n[04:11.00] kau cintai\n[04:13.00] dia.\n[04:17.00] Sudahi saja.\n[04:24.00] Lupakan\n[04:25.00] semua...."};

  var HOLD=10; /* detik: highlight mati kalau baris berikutnya belum datang */
  var SEL='[class*="space-y-[1px]"] > div';
  var audio=new Audio();
  audio.preload='none';
  var current=null,active=null,lastIdx=-2,userScroll=0,raf=0;

  function rows(){return Array.prototype.slice.call(document.querySelectorAll(SEL));}
  function titleOf(r){var s=r.querySelector('span.display');return s?s.textContent.trim():'';}
  function slugOf(r){return titleOf(r).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');}
  function srcOf(r){var s=slugOf(r);if(s==='limerence'||s==='glitch'||s==='nastenka'||s==='larung')return s+'.opus';return s+'.opus';}
  function fmt(s){if(!isFinite(s)||s<0)return '--:--';s=Math.floor(s);var m=Math.floor(s/60),r=s%60;return(m<10?'0':'')+m+':'+(r<10?'0':'')+r;}
  function toast(msg){
    try{if(window.__dmToast){window.__dmToast(msg,false,3200,'ui');return;}}catch(e){}
    /* dock belum siap: titip, dikirim begitu __dmToast ada */
    (window.__dmToastPending=window.__dmToastPending||[]).push([msg,3200]);
  }
  function safePlay(){var p=audio.play();if(p&&p.catch)p.catch(function(){});}
  window.__dmPlayer={audio:audio,rows:rows,title:function(r){try{var x=r||current;return x?titleOf(x):'';}catch(e){return '';}}};

  /* ---------- mini player bar ---------- */
  var bar=document.createElement('div');
  bar.id='dm-bar';
  bar.setAttribute('role','region');
  bar.setAttribute('aria-label','Music player');
  bar.innerHTML='<button id="dm-prev" type="button" aria-label="Lagu sebelumnya"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 6.5v11" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/><path d="M18 7l-8.2 5 8.2 5z" fill="currentColor" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg></button>'+
    '<button id="dm-pp" type="button" aria-label="Play"><svg class="i-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.6 5.8v12.4L18.6 12z" fill="currentColor" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg><svg class="i-pause" viewBox="0 0 24 24" aria-hidden="true"><rect x="6.6" y="5.6" width="3.6" height="12.8" rx="1.5" fill="currentColor"/><rect x="13.8" y="5.6" width="3.6" height="12.8" rx="1.5" fill="currentColor"/></svg></button>'+
    '<button id="dm-next" type="button" aria-label="Lagu berikutnya"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 6.5v11" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/><path d="M6 7l8.2 5L6 17z" fill="currentColor" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg></button>'+
    '<div class="dm-mid"><div class="dm-top"><span id="dm-title" class="display"></span><span id="dm-time">00:00 / --:--</span></div>'+
    '<div class="dm-row"><div id="dm-seek" role="slider" tabindex="0" aria-label="Posisi lagu"><canvas id="dm-wave"></canvas></div>'+
    '<div class="dm-modes" role="group" aria-label="Mode putar">'+
    '<button id="dm-rep" type="button" aria-label="Ulangi: mati" title="Ulangi: mati"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 2.5l3.5 3.5L17 9.5"/><path d="M3.5 11V9.5A3.5 3.5 0 0 1 7 6h13.5"/><path d="M7 21.5L3.5 18 7 14.5"/><path d="M20.5 13v1.5A3.5 3.5 0 0 1 17 18H3.5"/><path class="r1" d="M11 10.2l1.6-1v6.3" stroke-width="1.6"/></svg></button>'+
    '<button id="dm-shuf" type="button" aria-pressed="false" aria-label="Acak lagu" title="Acak"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 6.5h3.2c2.4 0 3.6 1.3 5 3.6l2.6 4.3c1.4 2.3 2.6 3.6 5 3.6h3.2"/><path d="M2.5 17.5h3.2c1.7 0 2.8-.7 3.8-2"/><path d="M13 8.6c1.2-1.4 2.3-2.1 4-2.1h3.2"/><path d="M17.5 3.5l3 3-3 3"/><path d="M17.5 14.5l3 3-3 3"/></svg></button>'+
    '</div></div></div>';
  document.body.appendChild(bar);
  var elPP=bar.querySelector('#dm-pp'),elTitle=bar.querySelector('#dm-title'),
      elTime=bar.querySelector('#dm-time'),elSeek=bar.querySelector('#dm-seek'),elWave=bar.querySelector('#dm-wave');
  var lastTime='',dragging=false,seekPct=0,seekAmp=0,PAD=8;
  var wctx=elWave.getContext('2d');
  var reduceMotion=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* seek bar bergelombang: played line + sine + dot.
     Canvas resize hanya saat ukuran berubah; paint foreground ~30fps (bukan 60). */
  var seekDrawLast=0,seekForce=false,seekW=0,seekH=0,seekDpr=0,seekGlitchUntil=0,seekWasGl=false;
  function drawSeek(now,force){
    now=now||performance.now();
    var gl=seekGlitchUntil>0&&seekGlitchUntil>now;
    if(gl!==seekWasGl){force=true;seekWasGl=gl;}
    if(!force&&!seekForce&&!dragging&&(now-seekDrawLast)<32)return;
    seekDrawLast=now;seekForce=false;
    var w=elWave.clientWidth,h=elWave.clientHeight;
    if(!w||!h)return;
    var dpr=Math.min(window.devicePixelRatio||1,2);
    if(w!==seekW||h!==seekH||dpr!==seekDpr||elWave.width!==Math.round(w*dpr)||elWave.height!==Math.round(h*dpr)){
      seekW=w;seekH=h;seekDpr=dpr;
      elWave.width=Math.round(w*dpr);elWave.height=Math.round(h*dpr);
      wctx.setTransform(dpr,0,0,dpr,0,0);
    }
    wctx.clearRect(0,0,w,h);
    var y=h/2,x0=PAD,x1=w-PAD,xe=x0+(x1-x0)*seekPct/100;
    wctx.lineCap='round';wctx.lineJoin='round';wctx.shadowBlur=0;
    /* sisa track */
    wctx.beginPath();wctx.moveTo(xe,y);wctx.lineTo(x1,y);
    wctx.strokeStyle='rgba(184,198,214,.2)';wctx.lineWidth=2;wctx.stroke();
    if(gl){
      /* glitch: potongan track geser + warna terbelah */
      for(var q=0;q<3;q++){
        var sx=xe+Math.random()*Math.max(1,x1-xe),sl=8+Math.random()*26,sy=(Math.random()-.5)*7;
        wctx.beginPath();wctx.moveTo(sx,y+sy);wctx.lineTo(Math.min(x1,sx+sl),y+sy);
        wctx.strokeStyle=Math.random()<.5?'rgba(255,43,214,.55)':'rgba(34,230,255,.55)';wctx.lineWidth=2;wctx.stroke();
      }
    }
    var amp=2.8*seekAmp,k=2*Math.PI/20,ph=reduceMotion?0:now/1000*7;
    function wave(ox,jit){
      wctx.beginPath();wctx.moveTo(x0+ox,y);
      var seg=0,dy=0;
      for(var x=x0;x<=xe;x+=1.5){
        if(jit&&--seg<=0){seg=4+((Math.random()*14)|0);dy=Math.random()<.55?(Math.random()-.5)*jit:0;}
        var tp=Math.min(1,(x-x0)/12,(xe-x)/12);
        wctx.lineTo(x+ox,y+dy+Math.sin(k*(x-x0)-ph)*amp*Math.max(0,tp));
      }
      wctx.lineTo(xe+ox,y);
    }
    if(gl){
      wave(1.8,8);wctx.strokeStyle='rgba(255,43,214,.8)';wctx.lineWidth=2;wctx.stroke();
      wave(-1.8,8);wctx.strokeStyle='rgba(34,230,255,.9)';wctx.lineWidth=2;wctx.stroke();
      wave(0,3);wctx.strokeStyle='#e6f9ff';wctx.lineWidth=1.1;wctx.stroke();
      if(Math.random()>.25){
        var gx=xe+(Math.random()-.5)*7;
        wctx.beginPath();wctx.arc(gx,y+(Math.random()-.5)*3,4.5,0,Math.PI*2);
        wctx.fillStyle=Math.random()<.5?'#ff7ad9':'#e6f9ff';wctx.fill();
      }
    }else{
      wave(0,0);
      wctx.strokeStyle='#6ee5ff';wctx.lineWidth=2.2;wctx.shadowColor='rgba(110,229,255,.6)';wctx.shadowBlur=6;wctx.stroke();
      wctx.beginPath();wctx.arc(xe,y,dragging?6.5:4.6,0,Math.PI*2);
      wctx.fillStyle='#e6f9ff';wctx.fill();wctx.shadowBlur=0;
      if(dragging){wctx.beginPath();wctx.arc(xe,y,10,0,Math.PI*2);wctx.strokeStyle='rgba(110,229,255,.35)';wctx.lineWidth=1;wctx.stroke();}
    }
    wctx.shadowBlur=0;
  }
  /* Mini spectrum di atas bar: muncul kalau spektrum hero sudah keluar layar (mis. lagu di urutan bawah, lagi baca lirik) */
  var miniEl=document.createElement('canvas');miniEl.id='dm-mini';miniEl.setAttribute('aria-hidden','true');bar.appendChild(miniEl);
  var mctx=miniEl.getContext('2d'),miniW=0,miniH=0,miniDpr=0,miniLast=0,miniOn=false;
  function drawMini(now,playing){
    var want=!!playing&&window.__dmHeroVis===false&&!document.hidden;
    if(want!==miniOn){miniOn=want;miniEl.classList.toggle('dm-on',want);}
    if(!want||now-miniLast<33)return;
    miniLast=now;
    var w=miniEl.clientWidth,h=miniEl.clientHeight;
    if(!w||!h)return;
    var dpr=Math.min(window.devicePixelRatio||1,2);
    if(w!==miniW||h!==miniH||dpr!==miniDpr){
      miniW=w;miniH=h;miniDpr=dpr;
      miniEl.width=Math.round(w*dpr);miniEl.height=Math.round(h*dpr);
      mctx.setTransform(dpr,0,0,dpr,0,0);
    }
    mctx.clearRect(0,0,w,h);
    var y=h/2,t=now/1000,sp=window.__dmSp,amp=h*.42,beat=(now-(A.beatAt||0))<140;
    mctx.lineCap='round';mctx.lineJoin='round';
    mctx.beginPath();mctx.moveTo(0,y);mctx.lineTo(w,y);
    mctx.strokeStyle='rgba(184,198,214,.1)';mctx.lineWidth=1;mctx.stroke();
    for(var pass=0;pass<2;pass++){
      var ox=pass?(beat?(Math.random()-.5)*7:1.4):0;
      mctx.beginPath();
      for(var x=0;x<=w;x+=3){
        var v=sp?sp(x/w):0;
        var yy=y+Math.sin(x*.02+t*2+pass)*1.1+v*Math.sin(x*.13+t*35+pass*1.3)*amp*(pass?.75:1);
        if(x===0)mctx.moveTo(x+ox,yy);else mctx.lineTo(x+ox,yy);
      }
      if(pass){mctx.strokeStyle='rgba(255,122,217,.55)';mctx.lineWidth=1;mctx.shadowBlur=0;}
      else{mctx.strokeStyle='#6ee5ff';mctx.lineWidth=1.5;mctx.shadowColor='rgba(110,229,255,.6)';mctx.shadowBlur=6;}
      mctx.stroke();
    }
    mctx.shadowBlur=0;
  }
  function uiStep(){
    if(!current)return;
    var t=audio.currentTime,d=audio.duration;
    var txt=fmt(t)+' / '+fmt(d);
    if(txt!==lastTime){lastTime=txt;elTime.textContent=txt;}
    var pct=(isFinite(d)&&d>0)?Math.min(100,t/d*100):0;
    if(Math.abs(pct-seekPct)>.02){seekPct=pct;if(!raf){seekForce=true;drawSeek();}}
  }
  function showBar(){
    bar.classList.add('dm-show');document.body.classList.add('dm-has-bar');
    decodeTitle(current?titleOf(current):'');
    lastTime='';seekPct=0;uiStep();seekForce=true;drawSeek(undefined,true);
  }
  function hideBar(){bar.classList.remove('dm-show');document.body.classList.remove('dm-has-bar');titleFinal='';}
  function setPP(on){elPP.classList.toggle('dm-on',on);elPP.setAttribute('aria-label',on?'Pause':'Play');}
  /* judul lagu "decode": huruf acak menyusun judul, hanya saat lagu berganti */
  var titleFinal='',decTimer=0;
  function decodeTitle(txt){
    if(txt===titleFinal)return;
    titleFinal=txt;
    elTitle.setAttribute('aria-label',txt);
    clearInterval(decTimer);
    if(reduceMotion||!txt){elTitle.textContent=txt;elTitle.classList.remove('dm-dec');return;}
    var CH='!<>-_/\\[]{}=+*^?#',n=txt.length,t0=performance.now(),DUR=320+Math.min(n,20)*8;
    elTitle.classList.add('dm-dec');
    decTimer=setInterval(function(){
      var p=(performance.now()-t0)/DUR;
      if(p>=1){clearInterval(decTimer);elTitle.textContent=txt;elTitle.classList.remove('dm-dec');return;}
      var kk=Math.floor(p*n*1.15),o='';
      for(var i=0;i<n;i++){var c=txt.charAt(i);o+=(i<kk||!/[A-Za-z0-9]/.test(c))?c:CH.charAt((Math.random()*CH.length)|0);}
      elTitle.textContent=o;
    },34);
  }
  function seekFromEvent(e){
    var d=audio.duration;if(!isFinite(d)||!d)return;
    var r=elSeek.getBoundingClientRect();
    var p=Math.min(1,Math.max(0,(e.clientX-r.left-PAD)/(r.width-2*PAD)));
    audio.currentTime=p*d;uiStep();seekForce=true;drawSeek(undefined,true);
  }
  elPP.addEventListener('click',function(){if(current)toggle(current);});
  /* ---------- mode putar: 1 tombol ulangi (mati → semua → satu lagu → mati) + acak ---------- */
  var REP=0,SHUF=false,shufOrder=[]; /* REP: 0 mati, 1 semua lagu, 2 satu lagu */
  try{var _m=JSON.parse(localStorage.getItem('dm_mode')||'null');if(_m){REP=(_m.rep===1||_m.rep===2)?_m.rep:0;SHUF=!!_m.shuf;}}catch(e){}
  var elRep=bar.querySelector('#dm-rep'),elShuf=bar.querySelector('#dm-shuf');
  var REP_LBL=['Ulangi: mati','Ulangi semua lagu','Ulangi 1 lagu'];
  function modeUI(){
    elRep.classList.toggle('dm-on',REP>0);elRep.classList.toggle('dm-one',REP===2);
    elRep.setAttribute('aria-label',REP_LBL[REP]);elRep.setAttribute('title',REP_LBL[REP]);
    elShuf.classList.toggle('dm-on',SHUF);elShuf.setAttribute('aria-pressed',SHUF?'true':'false');
    try{localStorage.setItem('dm_mode',JSON.stringify({rep:REP,shuf:SHUF}));}catch(e){}
  }
  function reshuffle(list,first){
    var a=list.filter(function(r){return r!==first;}),i,j,t;
    for(i=a.length-1;i>0;i--){j=Math.floor(Math.random()*(i+1));t=a[i];a[i]=a[j];a[j]=t;}
    return first?[first].concat(a):a;
  }
  /* baris tujuan untuk next(+1)/prev(-1); null = berhenti */
  function pickRow(delta,peek){
    var list=rows();if(!list.length)return null;
    if(SHUF){
      var ok=shufOrder.length===list.length&&list.every(function(r){return shufOrder.indexOf(r)>-1;});
      if(!ok||shufOrder.indexOf(current)<0)shufOrder=reshuffle(list,current);
      var k=shufOrder.indexOf(current)+delta;
      if(k>=0&&k<shufOrder.length)return shufOrder[k];
      if(REP!==1||peek)return null;
      if(delta>0){shufOrder=reshuffle(list,null);if(shufOrder[0]===current&&list.length>1)shufOrder.push(shufOrder.shift());return shufOrder[0];}
      return shufOrder[shufOrder.length-1];
    }
    var i=list.indexOf(current),t=list[i+delta];
    if(!t&&REP===1)t=delta>0?list[0]:list[list.length-1];
    return t||null;
  }
  elRep.addEventListener('click',function(){REP=(REP+1)%3;modeUI();});
  elShuf.addEventListener('click',function(){SHUF=!SHUF;shufOrder=[];modeUI();});
  modeUI();
  function go(delta){
    ensureGraph();
    if(delta<0&&audio.currentTime>3){audio.currentTime=0;return;}
    var t=pickRow(delta);
    if(!t)return;
    current=t;audio.src=srcOf(t);safePlay();
  }
  bar.querySelector('#dm-prev').addEventListener('click',function(){if(current)go(-1);});
  bar.querySelector('#dm-next').addEventListener('click',function(){if(current)go(1);});
  elSeek.addEventListener('pointerdown',function(e){
    dragging=true;try{elSeek.setPointerCapture(e.pointerId);}catch(x){}
    seekFromEvent(e);
  });
  elSeek.addEventListener('pointermove',function(e){if(dragging)seekFromEvent(e);});
  ['pointerup','pointercancel'].forEach(function(ev){elSeek.addEventListener(ev,function(){dragging=false;});});
  elSeek.addEventListener('keydown',function(e){
    var d=audio.duration||0;
    if(e.key==='ArrowLeft'){audio.currentTime=Math.max(0,audio.currentTime-5);e.preventDefault();}
    else if(e.key==='ArrowRight'){audio.currentTime=Math.min(d,audio.currentTime+5);e.preventDefault();}
  });

  /* ---------- audio analyser (buat animasi glitch di hero) ---------- */
  var ctx=null,an=null,SPEC=null,PREV=null,mix=0,level=0,avgFlux=0,lastBeatT=0;
  var anB=null,BSPEC=null,BPREV=null,bAvg=.03,bPk=.25,bFl=.05,bAd=0,ePk=.3,eFl=.1;
  var A=window.__dmA={level:0,beatAt:0,beatStr:0,beatKind:'',active:false,phase:0,bass:0,mid:0,treble:0,memory:0,fracture:0,fracX:0.5,listen:0,sig:'default',blips:[]};
  var TRACK_SIG={
    'glitch':{amp:1.08,frac:0.85,breath:0.7,thin:0.92,sink:0,cyanPink:1,mesh:1.1},
    'glitch-instrumental':{amp:0.92,frac:0.55,breath:0.85,thin:1.08,sink:0,cyanPink:0.7,mesh:0.9},
    'limerence':{amp:1.05,frac:0.45,breath:1.2,thin:0.98,sink:0,cyanPink:0.55,mesh:1.0},
    'nastenka':{amp:0.88,frac:0.3,breath:1.1,thin:1.15,sink:0.12,cyanPink:0.4,mesh:0.8},
    'larung':{amp:0.95,frac:0.35,breath:1.0,thin:1.02,sink:0.55,cyanPink:0.5,mesh:1.05}
  };
  function currentSig(){
    var s=A.sig&&TRACK_SIG[A.sig]?TRACK_SIG[A.sig]:{amp:1,frac:0.8,breath:1,thin:1,sink:0,cyanPink:0.6,mesh:1};
    return s;
  }
  function setTrackSig(slug){
    A.sig=slug||'default';
  }

  /* SMOOTH: 30Hz analysis → 60FPS visual interpolation (analog feel).
     Deklarasi SEBELUM seed supaya handoff tidak di-wipe oleh assignment =null. */
  var SMOOTH=null,SMOOTH_T=null;
  /* Seed visual continuity from index.html transition (level/phase/spec). */
  (function seedVisualContinuity(){
    try{
      var raw=sessionStorage.getItem('dm_visual_state');
      if(!raw)return;
      var vs=JSON.parse(raw);
      if(!vs||vs.from!=='dumul-transition')return;
      if(isFinite(+vs.level)){level=Math.max(0,Math.min(1,+vs.level));A.level=level;A._seedLevel=level;}
      if(isFinite(+vs.phase)&&+vs.phase>0)A.phase=+vs.phase;
      if(isFinite(+vs.t)&&+vs.t>0)A.phase=+vs.t;
      mix=1; /* keep spectrum waves alive across page boundary */
      if(isFinite(+vs.beatAge)&&+vs.beatAge<400){A.beatAt=performance.now()-+vs.beatAge;lastBeatT=A.beatAt;}
      if(vs.spec&&vs.spec.length){
        SPEC=new Uint8Array(512);
        PREV=new Uint8Array(512);
        for(var si=0;si<Math.min(vs.spec.length,SPEC.length);si++)SPEC[si]=vs.spec[si]|0;
        PREV.set(SPEC);
        SMOOTH=new Float32Array(SPEC.length);SMOOTH_T=new Float32Array(SPEC.length);
        for(var _si=0;_si<SPEC.length;_si++){SMOOTH[_si]=SPEC[_si];SMOOTH_T[_si]=SPEC[_si];}
      }
    }catch(e){}
  })();
  window.__dmSp=function(x){
    var src=SMOOTH&&SMOOTH.length?SMOOTH:SPEC;
    if(!src||mix<=0.001)return 0;
    var u=Math.abs(x-.5)*2;
    var bin=1+Math.floor(Math.pow(u,1.7)*Math.min(150,src.length-2));
    var v=src[Math.min(bin,src.length-1)]/255;
    v=Math.max(0,(v-.3)/.7);v=v*v*(1+u*1.8);
    return Math.min(1,v)*mix;
  };
  function ensureGraph(){
    if(ctx){if(ctx.state!=='running'&&ctx.resume)ctx.resume();return;}
    var AC=window.AudioContext||window.webkitAudioContext;
    if(!AC)return;
    try{
      ctx=new AC();
      an=ctx.createAnalyser();
      an.fftSize=1024;an.smoothingTimeConstant=.6;
      var src=ctx.createMediaElementSource(audio);
      src.connect(an);an.connect(ctx.destination);
      try{anB=ctx.createAnalyser();anB.fftSize=2048;anB.smoothingTimeConstant=.25;anB.minDecibels=-90;anB.maxDecibels=-20;src.connect(anB);BSPEC=new Uint8Array(anB.frequencyBinCount);BPREV=new Uint8Array(anB.frequencyBinCount);}catch(_e){anB=null;}
      var seeded=SPEC&&SPEC.length;
      var fresh=new Uint8Array(an.frequencyBinCount);
      var freshP=new Uint8Array(an.frequencyBinCount);
      if(seeded){
        for(var si=0;si<Math.min(SPEC.length,fresh.length);si++)fresh[si]=SPEC[si];
        freshP.set(fresh);
      }
      SPEC=fresh;PREV=freshP;
      SMOOTH=new Float32Array(fresh.length);SMOOTH_T=new Float32Array(fresh.length);
      for(var _si=0;_si<fresh.length;_si++){SMOOTH[_si]=fresh[_si];SMOOTH_T[_si]=fresh[_si];}
      A.active=true;
      if(ctx.state!=='running'&&ctx.resume)ctx.resume();
    }catch(e){ctx=null;an=null;/* keep seeded SPEC if any */A.active=!!SPEC;}
  }
  /* Beat/bass tiap frame (60Hz) dari analyser 2048.
     Kick: bin 1-7 (~23-160Hz). Snare: bin 12-28 (~280-650Hz). Ambang lebih tinggi, cooldown lebih longgar. */
  function beatStep(now){
    if(!anB||!BSPEC)return;
    anB.getByteFrequencyData(BSPEC);
    var i,flux=0,e=0,lim=7,e2=0,snFlux=0,snE=0;
    for(i=1;i<=lim;i++){var v=BSPEC[i],d=v-BPREV[i];if(d>0)flux+=d*(i<=3?1.25:1);e+=v;BPREV[i]=v;}
    for(i=8;i<=12;i++)e2+=BSPEC[i];
    for(i=12;i<=28;i++){var sv=BSPEC[i],sd=sv-(BPREV[i]||0);if(sd>0)snFlux+=sd;snE+=sv;BPREV[i]=sv;}
    flux/=lim*255;e/=lim*255;e2/=5*255;
    snFlux/=17*255;snE/=17*255;
    bAvg+=(flux-bAvg)*.04;
    var thr=bAvg*1.85+.014;
    var snThr=0.045+snE*0.35;
    var isKick=flux>thr&&e>.155&&now-lastBeatT>165;
    var isSnare=!isKick&&snFlux>snThr&&snE>.14&&now-lastBeatT>145;
    if(isKick||isSnare){
      lastBeatT=now;A.beatAt=now;
      A.beatKind=isKick?'kick':'snare';
      A.beatStr=Math.max(.18,Math.min(1,isKick?(flux-bAvg)/.38:(snFlux/snThr)*.85));
      var sig=currentSig();
      /* Fracture lebih lembut — kurang agresif di hero */
      A.fracture=Math.min(0.52,(0.22+level*0.22)*sig.frac*(isKick?1:0.72));
      A.fracX=0.22+Math.random()*0.56;
    }
    var eb=(e*7+e2*5)/12;
    bPk=Math.max(eb,bPk*.9995);bFl+=(eb-bFl)*(eb<bFl?.18:.0007);
    bAd=Math.max(0,Math.min(1,(eb-bFl)/(bPk-bFl+.1)))*.78;
  }
  function analyse(now){
    if(!an||!SPEC)return;
    an.getByteFrequencyData(SPEC);
    var i,e=0,flux=0,n=SPEC.length;
    /* beat = lonjakan energi mendadak di frekuensi rendah (kick/bass) */
    var lim=Math.min(8,n-1);
    for(i=1;i<=lim;i++){var d=SPEC[i]-PREV[i];if(d>0)flux+=d;}
    flux/=Math.max(1,lim)*255;
    avgFlux+=(flux-avgFlux)*.06;
    if(!anB&&flux>avgFlux*2.05+.03&&now-lastBeatT>200){
      lastBeatT=now;A.beatAt=now;A.beatKind='kick';A.beatStr=Math.max(.2,Math.min(1,(flux-avgFlux)/.4));
      /* Beat fracture: crack one zone, then heal — milder */
      var sig=currentSig();
      A.fracture=Math.min(0.52,(0.22+level*0.22)*sig.frac);
      A.fracX=0.22+Math.random()*0.56;
    }
    PREV.set(SPEC);
    var el=Math.min(120,n-1);
    for(i=1;i<=el;i++)e+=SPEC[i];
    e/=Math.max(1,el)*255;
    ePk=Math.max(e,ePk*.998);eFl+=(e-eFl)*(e<eFl?.18:.0018);
    var lvA=Math.max(0,Math.min(1,(e-eFl)/(ePk-eFl+.12)))*.72;
    /* Level gain diturunkan sedikit — spektrum & glow kurang loncat */
    level+=(Math.max(Math.max(0,Math.min(1,(e-.26)*1.85)),lvA)-level)*.28;
    /* Spectrum personality: bass / mid / treble bands */
    var bSum=0,mSum=0,tSum=0,bN=0,mN=0,tN=0;
    var bEnd=Math.min(12,n-1),mEnd=Math.min(64,n-1),tEnd=Math.min(180,n-1);
    for(i=1;i<=bEnd;i++){bSum+=SPEC[i];bN++;}
    for(i=bEnd+1;i<=mEnd;i++){mSum+=SPEC[i];mN++;}
    for(i=mEnd+1;i<=tEnd;i++){tSum+=SPEC[i];tN++;}
    var bT=Math.max(bAd,Math.max(0,Math.min(1,((bSum/Math.max(1,bN)/255)-0.22)*1.75)));
    var mT=Math.max(0,Math.min(1,((mSum/Math.max(1,mN)/255)-0.15)*1.65));
    var tT=Math.max(0,Math.min(1,((tSum/Math.max(1,tN)/255)-0.08)*1.9));
    A.bass+=(bT-A.bass)*.22;
    A.mid+=(mT-A.mid)*.22;
    A.treble+=(tT-A.treble)*.22;
    /* Signal memory peak while playing */
    if(level>A.memory)A.memory=level;
    /* Snap SMOOTH toward live SPEC (analysis is ~30Hz; renderer interpolates at 60) */
    if(!SMOOTH||SMOOTH.length!==n){SMOOTH=new Float32Array(n);SMOOTH_T=new Float32Array(n);}
    for(i=0;i<n;i++)SMOOTH_T[i]=SPEC[i];
  }

  /* ---------- lirik ---------- */
  function parseLrc(txt){
    var out=[],plain=[],re=/^\s*((?:\[\d+:\d+(?:[.:]\d+)?\])+)\s*(.*)$/;
    String(txt||'').split(/\r?\n/).forEach(function(line){
      var m=re.exec(line);
      if(m){
        var text=m[2].trim();
        (m[1].match(/\[\d+:\d+(?:[.:]\d+)?\]/g)||[]).forEach(function(tag){
          var p=/\[(\d+):(\d+(?:[.:]\d+)?)\]/.exec(tag);
          out.push({t:(+p[1])*60+parseFloat(p[2].replace(':','.')),text:text});
        });
      }else if(!/^\s*\[[a-z]+:/i.test(line)){
        plain.push(line.trim());
      }
    });
    if(out.length){out.sort(function(a,b){return a.t-b.t;});return{synced:true,lines:out};}
    while(plain.length&&!plain[0])plain.shift();
    while(plain.length&&!plain[plain.length-1])plain.pop();
    return{synced:false,lines:plain.map(function(s){return{t:0,text:s};})};
  }
  /* Lirik di hero: satu baris saja, tepat di bawah spektrum. Efek decode (huruf acak → jadi teks) + glitch. */
  var hl=null,hlT=null,hlRaf=0,hlTok=0;
  var SCR='#%&*+=<>/\\|01░▒';
  function hlEl(){
    if(hl&&hl.isConnected)return hl;
    var wrap=document.querySelector('section.dm-hero div[class*="w-[min(92vw,640px)]"]');
    if(!wrap||!wrap.parentNode)return null;
    hl=document.getElementById('dm-hl');
    if(!hl){
      hl=document.createElement('div');hl.id='dm-hl';
      hl.setAttribute('aria-live','polite');
      hlT=document.createElement('span');hlT.className='dm-hl-t';
      hl.appendChild(hlT);
      wrap.parentNode.insertBefore(hl,wrap.nextSibling);
    }else hlT=hl.querySelector('.dm-hl-t');
    return hl;
  }
  function hlClear(){
    hlTok++;if(hlRaf){cancelAnimationFrame(hlRaf);hlRaf=0;}
    if(hl){hl.classList.remove('on');}
    if(hlT)hlT.classList.remove('dm-hl-glitch');
  }
  function hlShow(text){
    var el=hlEl();if(!el)return;
    var tok=++hlTok;if(hlRaf){cancelAnimationFrame(hlRaf);hlRaf=0;}
    if(!text){el.classList.remove('on');return;}
    var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;
    hlT.classList.remove('dm-hl-hard');hlT.classList.remove('dm-hl-glitch');void hlT.offsetWidth;
    el.classList.add('on');
    try{if(window.__dmReplaceToast)window.__dmReplaceToast();}catch(e){}
    if(reduce){hlT.textContent=text;return;}
    hlT.classList.add('dm-hl-glitch');
    var n=text.length,dur=Math.min(750,320+n*14),t0=performance.now(),lastSw=0;
    function step(now){
      hlRaf=0;if(tok!==hlTok)return;
      var p=Math.min(1,(now-t0)/dur);
      if(p>=1){hlT.textContent=text;return;}
      if(now-lastSw>38){
        lastSw=now;
        var rev=Math.floor(p*p*n*1.05),o='';
        for(var i=0;i<n;i++){
          var c=text.charAt(i);
          o+=(i<rev||c===' ')?c:SCR.charAt(Math.floor(Math.random()*SCR.length));
        }
        hlT.textContent=o;
      }
      hlRaf=requestAnimationFrame(step);
    }
    hlRaf=requestAnimationFrame(step);
  }
  function showLyrics(row){
    var raw=LYRICS[slugOf(row)];
    if(!raw||!String(raw).trim())return;
    var st=row._dm;
    if(!st){
      var data=parseLrc(raw);
      if(!data.lines.length)return;
      st=row._dm={data:data,panel:null};
    }
    active=st;lastIdx=-2;
    hlClear();
  }
  function ensureVisible(panel){
    if(!panel)return;
    /* Only size the lyrics panel so it fits above the player bar.
       NEVER window.scrollBy — that was yanking the page to mid-track on handoff. */
    var limit=window.innerHeight-(bar.offsetHeight||66)-10-32;
    var top=panel.getBoundingClientRect().top;
    panel.style.maxHeight=Math.max(110,Math.min(210,limit-top))+'px';
  }

  function closeLyrics(){
    hlClear();
    active=null;
  }
  function lyricsStep(){
    if(!active||!active.data.synced)return;
    var t=audio.currentTime,L=active.data.lines,idx=-1;
    for(var i=0;i<L.length;i++){if(L[i].t<=t)idx=i;else break;}
    if(idx>-1&&t-L[idx].t>HOLD)idx=-1;
    if(idx!==lastIdx){
      lastIdx=idx;
      hlShow(idx>-1?L[idx].text:'');
      if(idx>-1)kwGlitch(L[idx].text);
    }
  }

  /* ---------- satu loop buat semuanya ---------- */
  var anSkip=0;
  function loop(now){
    raf=0;
    var playing=!audio.paused&&!audio.ended;
    /* Analyser every other frame — spectrum motion is slower than 60fps.
       seek bar di-throttle ~30fps di dalam drawSeek (bukan full 60). */
    if(anB&&playing)beatStep(now);
    if(an&&playing){anSkip^=1;if(!anSkip)analyse(now);}
    else{anSkip=0;level*=.9;}
    /* 60FPS smooth spectrum interpolation toward last analysis target */
    if(SMOOTH&&SMOOTH_T){
      var si,sn=SMOOTH.length,a=playing?0.14:0.06;
      for(si=0;si<sn;si++)SMOOTH[si]+=(SMOOTH_T[si]-SMOOTH[si])*a;
    }
    /* During handoff buffer, hold mix so spectrum/mesh stay lit.
       Signal Memory: residual shape collapses slowly after pause. */
    if(playing){
      mix+=.08;
      A.memory=Math.max(A.memory,level);
    }else if(handoffT||gargFromSwallow){
      mix=Math.max(0.55,mix-.02);
    }else{
      /* slower decay so afterimage lingers */
      mix-=.018;
      A.memory*=0.992;
      if(A.memory>0.02)mix=Math.max(mix,A.memory*0.55);
    }
    mix=Math.max(0,Math.min(1,mix));
    A.level=Math.max(level*mix, (A._seedLevel||0)*mix*0.6, A.memory*mix*0.45);
    A.phase=(audio.currentTime&&audio.currentTime>0)?audio.currentTime:(handoffT||A.phase||0);
    /* Beat fracture heal */
    if(A.fracture>0)A.fracture=Math.max(0,A.fracture-0.04);
    /* Listening mode: idle ~7s while playing */
    if(playing){
      var _idle=typeof window.__dmIdleAt==="number"?window.__dmIdleAt:(now-8000);if(now-_idle>7000)A.listen=Math.min(1,A.listen+0.012);
      else A.listen=Math.max(0,A.listen-0.04);
    }else{
      A.listen=Math.max(0,A.listen-0.06);
    }
    try{
      var root=document.documentElement;
      if(A.listen>0.15)root.classList.add('dm-listening');
      else root.classList.remove('dm-listening');
      root.style.setProperty('--dm-listen',A.listen.toFixed(3));
    }catch(e){}
    if(playing){lyricsStep();uiStep();}
    seekAmp+=((playing?1:0)-seekAmp)*.12;
    drawSeek(now);
    drawMini(now,playing);
    if(seekGlitchUntil&&performance.now()>=seekGlitchUntil){seekGlitchUntil=0;seekForce=true;drawSeek(undefined,true);}
    if(playing||mix>.001||seekAmp>.01||A.memory>0.01||A.fracture>0.01||A.listen>0.01||seekGlitchUntil>0)raf=requestAnimationFrame(loop);
  }
  function kick(){if(!raf)raf=requestAnimationFrame(loop);}

  /* ---------- player ---------- */
  function clear(){
    rows().forEach(function(r){r.classList.remove('dm-playing');});
    closeLyrics();
  }
  function toggle(r){
    /* Pause path skips Web Audio graph setup — cheaper on every PP tap. */
    if(current===r&&!audio.paused){audio.pause();return;}
    ensureGraph();
    gargCancel();
    try{GARG.pause();}catch(e){}
    if(current!==r){current=r;audio.src=srcOf(r);}
    safePlay();
  }

  /* Bed collapsars.opus dimatikan: di dumul.html tidak ada audio otomatis di background. Objek GARG dibiarkan (tanpa src) supaya pemanggil lama tidak error. */
  var GARG=new Audio();GARG.preload='none';
  var gargTimer=0;
  var gargFromSwallow=false;
  function gargCancel(){if(gargTimer){clearTimeout(gargTimer);gargTimer=0;}}
  /* Handoff dari swallow Gargantua (index.html): GARG di sana = glitch-instrumental.opus.
     Di sini track itu langsung DILANJUT di player album Limerence (track 1,
     Glitch (Instrumental)) dari detik terakhir, bukan lewat bed collapsars. */
  var handoffT=0,handoffTimer=0,handoffSeek=false;
  var handoffVisual=null;
  (function readVisualHandoff(){
    try{
      var raw=sessionStorage.getItem('dm_visual_state');
      if(raw)handoffVisual=JSON.parse(raw);
      sessionStorage.removeItem('dm_visual_state');
      /* Reinforce continuity seed (analyser block may have run already). */
      if(handoffVisual&&handoffVisual.from==='dumul-transition'){
        if(isFinite(+handoffVisual.level)){level=Math.max(level,+handoffVisual.level);A.level=level;}
        if(isFinite(+handoffVisual.phase)&&+handoffVisual.phase>0)A.phase=+handoffVisual.phase;
        if(isFinite(+handoffVisual.t)&&+handoffVisual.t>0)A.phase=+handoffVisual.t;
        mix=Math.max(mix,0.85);
        if(isFinite(+handoffVisual.beatAge)&&+handoffVisual.beatAge<400){
          A.beatAt=performance.now()-+handoffVisual.beatAge;lastBeatT=A.beatAt;
        }
      }
    }catch(e){}
  })();
  (function readHandoff(){
    try{
      var t=parseFloat(sessionStorage.getItem('dm_collapsars_t')||'');
      var from=sessionStorage.getItem('dm_collapsars_from');
      sessionStorage.removeItem('dm_collapsars_t');
      sessionStorage.removeItem('dm_collapsars_from');
      if(from!=='swallow'||!isFinite(t)||t<=0)return;
      gargFromSwallow=true;
      handoffT=t;
      if(handoffVisual&&isFinite(+handoffVisual.t)&&+handoffVisual.t>0&&Math.abs((+handoffVisual.t)-t)<1.5)handoffT=+handoffVisual.t;
      /* Phase locked to handoff time so mesh motion continues before audio metadata loads. */
      if(handoffT>0)A.phase=handoffT;
      if(gargFromSwallow||handoffT>0){
        try{
          var _root=document.documentElement,_prev=_root.style.scrollBehavior;
          _root.style.scrollBehavior='auto';
          window.scrollTo(0,0);_root.scrollTop=0;
          if(document.body)document.body.scrollTop=0;
          _root.style.scrollBehavior=_prev;
        }catch(e3){}
      }
    }catch(e){}
  })();
  function applyHandoffSeek(){
    if(!handoffT)return;
    try{if(Math.abs((audio.currentTime||0)-handoffT)>0.15)audio.currentTime=handoffT;}catch(e){}
  }
  function tryHandoff(){
    if(!handoffT)return;
    var row=rows()[0];
    if(!row)return; /* React belum render list, dicoba lagi */
    if(current!==row||!audio.src){
      current=row;
      setTrackSig(slugOf(row));
      audio.preload='auto';
      audio.src=srcOf(row);
      audio.addEventListener('loadedmetadata',applyHandoffSeek,{once:true});
      audio.addEventListener('canplay',applyHandoffSeek,{once:true});
    }
    applyHandoffSeek();
    /* Keep visual phase locked while audio buffers. */
    A.phase=handoffT;
    mix=Math.max(mix,0.85);
    if(A._seedLevel!=null){level=Math.max(level,A._seedLevel);A.level=level;}
    ensureGraph();
    safePlay();
    kick();
  }
  if(handoffT){
    /* Volume masuk halus (index: 0.55) lalu naik ke level player biasa. */
    audio.volume=.55;
    mix=Math.max(mix,0.85);
    A.phase=handoffT;
    kick(); /* start visual loop immediately so mesh doesn't freeze */
    audio.addEventListener('playing',function onHandoffPlay(){
      audio.removeEventListener('playing',onHandoffPlay);
      applyHandoffSeek();
      handoffT=0; /* seek sudah diterapkan; sejak ini player berjalan normal */
      if(handoffTimer){clearInterval(handoffTimer);handoffTimer=0;}
      var v0=performance.now(),vDur=1500;
      (function ramp(now){
        var u=Math.min(1,(now-v0)/vDur);
        audio.volume=.55+(1-.55)*u;
        /* Fade out seed floor once live analyser is feeding level. */
        if(A._seedLevel!=null)A._seedLevel=A._seedLevel*(1-u);
        if(u>=1){A._seedLevel=null;gargFromSwallow=false;}
        if(u<1)requestAnimationFrame(ramp);
      })(v0);
    });
    /* Poll sampai list lagu ter-render & audio benar-benar jalan (max ~8 dtk). */
    var hTries=0;
    handoffTimer=setInterval(function(){
      if(!handoffT||++hTries>80){clearInterval(handoffTimer);handoffTimer=0;return;}
      tryHandoff();
    },100);
  }
  function gTry(){
    /* Hanya untuk handoff swallow: lanjutkan di player album. Selain itu tidak ada audio otomatis. */
    if(handoffT)tryHandoff();
  }
  function gargSchedule(){gargCancel();} /* tidak ada lagi bed yang dinyalakan setelah pause */
  if(gargFromSwallow){
    setTimeout(gTry,120);
    setTimeout(gTry,400);
    setTimeout(gTry,900);
  }
  function gGesture(e){
    if(!handoffT)return;
    if(e&&e.target&&e.target.closest&&e.target.closest(SEL))return; /* tap di baris lagu → toggle() */
    ensureGraph();
    gTry();
  }
  /* Handoff is already a user-gesture continuation from index.html. The analyser
     is created before safePlay(), so no second tap/pause-play cycle is required. */
  document.addEventListener('pointerdown',gGesture,{once:true});
  document.addEventListener('keydown',gGesture,{once:true});

  audio.addEventListener('play',function(){
    gargCancel();
    try{GARG.pause();}catch(e){}
    clear();
    if(current){current.classList.add('dm-playing');showLyrics(current);setTrackSig(slugOf(current));}
    showBar();setPP(true);
    /* maxHeight only — ensureVisible no longer scrolls the page */
    if(active)ensureVisible(active.panel);
    kick();
  });
  audio.addEventListener('pause',function(){
    setPP(false);
    if(!audio.ended)clear();
    uiStep();kick();
    /* Was 60ms — caused collapsars to fight the album player on every pause. */
    gargSchedule();
  });
  audio.addEventListener('ended',function(){
    clear();setPP(false);
    if(REP===2&&current){gargCancel();audio.currentTime=0;safePlay();return;}
    var nx=current?pickRow(1):null;
    if(nx){
      gargCancel();
      current=nx;audio.src=srcOf(current);safePlay();
    }else{uiStep();kick();gargSchedule();}
  });
  audio.addEventListener('error',function(){
    clear();setPP(false);hideBar();
    toast('Audio belum ditemukan: '+(current?srcOf(current):''));
    current=null;
  });
  ['loadedmetadata','durationchange','timeupdate','seeked'].forEach(function(ev){audio.addEventListener(ev,uiStep);});
  function seekGlitch(ms){var t=performance.now()+ms;if(t>seekGlitchUntil)seekGlitchUntil=t;kick();}
  audio.addEventListener('waiting',function(){seekGlitch(12000);});
  ['playing','canplay'].forEach(function(ev){audio.addEventListener(ev,function(){if(seekGlitchUntil>0)seekGlitchUntil=performance.now()+220;});});
  audio.addEventListener('seeking',function(){seekGlitch(260);});
  audio.addEventListener('loadstart',function(){seekGlitch(380);});

  /* ---------- preload ~10% track berikutnya (di belakang layar) ----------
     Begitu track yang lagi diputar sudah 100% ke-load (termasuk glitch-instrumental hasil handoff),
     ambil ~10% byte pertama track yang akan diputar berikutnya — ikut mode normal / acak / ulangi semua.
     Sekali per track per sesi; ulangi-1-lagu tidak ada "berikutnya"; hemat-data / 2G dilewati. */
  var WARM={};
  function fullyLoaded(){
    var d=audio.duration;if(!isFinite(d)||d<=0)return false;
    var b=audio.buffered,s=0,i;
    for(i=0;i<b.length;i++)s+=b.end(i)-b.start(i);
    return s>=d-0.5;
  }
  function warmNext(){
    try{
      if(!current||!window.fetch||!fullyLoaded())return;
      var nx=pickRow(1,true);if(!nx||nx===current)return;
      var slug=slugOf(nx);if(!slug||WARM[slug])return;
      var c=navigator.connection;if(c&&(c.saveData||/(^|-)2g$/.test(c.effectiveType||'')))return;
      WARM[slug]=1;
      fetch(srcOf(nx),{headers:{Range:'bytes=0-'}}).then(function(res){
        if(!res.ok&&res.status!==206)throw 0;
        var cr=res.headers.get('content-range'),m=cr&&/\/(\d+)$/.exec(cr);
        var total=m?+m[1]:(+res.headers.get('content-length')||0);
        if(!res.body||!res.body.getReader||!total){if(res.body&&res.body.cancel)res.body.cancel();return;}
        var want=Math.ceil(total*0.10),got=0,rd=res.body.getReader();
        function pump(){return rd.read().then(function(r){
          if(r.done)return;
          got+=r.value.length;
          if(got>=want){try{rd.cancel();}catch(e){}return;}
          return pump();
        });}
        return pump();
      }).catch(function(){delete WARM[slug];});
    }catch(e){}
  }
  ['progress','suspend','loadedmetadata','canplaythrough'].forEach(function(ev){audio.addEventListener(ev,warmNext);});
  elRep.addEventListener('click',function(){setTimeout(warmNext,0);});
  elShuf.addEventListener('click',function(){setTimeout(warmNext,0);});

  /* ---------- glitch ngikutin kata kunci di lirik ---------- */
  var KW=/tanpamu|bersamamu|hantui|belenggu|error|loop|corrupt|glitch|watching/i,KW2=/tanpamu|glitch|loop|error|corrupt/i,kwLast=0;
  function kwGlitch(text){
    if(reduceMotion||!text||!KW.test(text))return;
    var n=performance.now();if(n-kwLast<2500)return;kwLast=n;
    try{
      var a=window.__dmA;if(a){a.fracture=Math.max(a.fracture||0,.7);a.fracX=.2+Math.random()*.6;}
      if(hlT){hlT.classList.remove('dm-hl-hard');void hlT.offsetWidth;hlT.classList.add('dm-hl-hard');}
      seekGlitch(320);
      if(KW2.test(text)){var hh=document.querySelector('h1.display');if(hh&&window.__dmGlitch)window.__dmGlitch(hh);}
    }catch(e){}
  }

  /* ---------- Corrupted Memory: pengunjung yang balik dapat log sinyal terakhir ---------- */
  /* Corrupted Memory: data last track/posisi/waktu sekarang disimpan oleh dm_album (lihat snapFrag), dibaca lewat window.__dmMemPrev */
  (function(){
    var hasMem=false,t='',s=0,ts=0,tries=0,dead=false,steps=[];
    function ok(){return !dead&&audio.paused&&!active&&!audio.currentTime;}
    /* urutan: pesan sambutan (The Album Remembers) → memory lama (last signal / gap) → bersihkan */
    function build(){
      var mp=null;try{mp=window.__dmMemPrev&&window.__dmMemPrev();}catch(e){}
      hasMem=!!(mp&&mp.t&&+mp.ts>0);
      if(hasMem){t=String(mp.t).slice(0,40);s=isFinite(+mp.s)?+mp.s:0;ts=+mp.ts||0;}
      var W=[];try{if(window.__dmWelcome)W=window.__dmWelcome()||[];}catch(e){}
      if(!hasMem&&!W.length)return false;
      var at=0;
      W.forEach(function(w){steps.push([at,w]);at+=2600;});
      if(hasMem){
        var m=ts?Math.floor((Date.now()-ts)/60000):0,g='';
        if(m>=60){var hr=Math.floor(m/60);g='signal gap: '+(hr<48?hr+'h':Math.floor(hr/24)+' days');}
        steps.push([at,'memory found.']);
        steps.push([at+2400,'last signal: '+t+(s>=0?' \u2014 '+fmt(s):' \u2014 fully decoded')]);
        if(g)steps.push([at+5600,g]);
        at+=g?8600:5600;
      }
      steps.push([at,'']);
      return true;
    }
    function run(){
      if(!hlEl()){if(++tries<24)setTimeout(run,400);return;}
      steps.forEach(function(st){setTimeout(function(){if(ok())hlShow(st[1]);else dead=true;},st[0]);});
    }
    setTimeout(function(){if(build())run();},1400);
  })();
  document.addEventListener('visibilitychange',function(){
    if(!document.hidden&&ctx&&ctx.state!=='running'&&!audio.paused&&ctx.resume)ctx.resume();
    kick();
  });

  /* ---------- judul tab dinamis + Media Session (lock screen / notifikasi) ---------- */
  (function(){
    var BASE=document.title,AWAY='come back to the stars \u2726';
    function nowPlaying(){return !!current&&!audio.paused&&!audio.ended;}
    function curTitle(){try{return current?titleOf(current):'';}catch(e){return '';}}
    function updateTitle(){
      var t;
      if(nowPlaying()&&curTitle())t='\u25B6 '+curTitle()+' \u2014 DUMUL';
      else if(document.hidden)t=AWAY;
      else t=BASE;
      if(document.title!==t)document.title=t;
    }
    var ms=('mediaSession' in navigator)?navigator.mediaSession:null,lastMeta='';
    function setMeta(){
      if(!ms||!window.MediaMetadata)return;
      var t=curTitle();if(!t||t===lastMeta)return;lastMeta=t;
      try{ms.metadata=new MediaMetadata({title:t,artist:'DUMUL',album:'Limerence',
        artwork:[{src:'og.webp',sizes:'720x720',type:'image/webp'}]});}catch(e){}
    }
    function setPos(){
      if(!ms||!ms.setPositionState)return;
      var d=audio.duration;
      if(!isFinite(d)||!(d>0))return;
      try{ms.setPositionState({duration:d,playbackRate:audio.playbackRate||1,position:Math.min(d,Math.max(0,audio.currentTime||0))});}catch(e){}
    }
    if(ms){
      var H=function(a,f){try{ms.setActionHandler(a,f);}catch(e){}};
      H('play',function(){if(current)safePlay();});
      H('pause',function(){audio.pause();});
      H('previoustrack',function(){if(current)go(-1);});
      H('nexttrack',function(){if(current)go(1);});
      H('seekto',function(d){if(d&&isFinite(d.seekTime)){audio.currentTime=d.seekTime;setPos();}});
      H('seekbackward',function(d){audio.currentTime=Math.max(0,audio.currentTime-((d&&d.seekOffset)||10));setPos();});
      H('seekforward',function(d){audio.currentTime=Math.min(audio.duration||0,audio.currentTime+((d&&d.seekOffset)||10));setPos();});
    }
    audio.addEventListener('play',function(){setMeta();if(ms)ms.playbackState='playing';updateTitle();});
    audio.addEventListener('pause',function(){if(ms)ms.playbackState='paused';setPos();updateTitle();});
    audio.addEventListener('ended',function(){updateTitle();});
    audio.addEventListener('error',function(){lastMeta='';if(ms){ms.playbackState='none';ms.metadata=null;}updateTitle();});
    ['loadedmetadata','durationchange','seeked'].forEach(function(ev){audio.addEventListener(ev,function(){setMeta();setPos();});});
    document.addEventListener('visibilitychange',updateTitle);
  })();

  document.addEventListener('click',function(e){
    var r=e.target.closest&&e.target.closest(SEL);
    if(r)toggle(r);
  });
  document.addEventListener('keydown',function(e){
    if(e.key!=='Enter'&&e.key!==' ')return;
    var r=e.target.closest&&e.target.closest(SEL);
    if(r){e.preventDefault();toggle(r);}
  });

  /* ---------- DUMUL nge-glitch pas disentuh/diklik ---------- */
  function glitch(h){
    h.classList.remove('dm-glitching');
    void h.offsetWidth;
    h.classList.add('dm-glitching');
    clearTimeout(h._g);
    h._g=setTimeout(function(){h.classList.remove('dm-glitching');},700);
  }
  window.__dmGlitch=glitch;
  document.addEventListener('pointerdown',function(e){
    if(!e.isTrusted)return;
    var h=e.target.closest&&e.target.closest('h1.display');
    if(h)glitch(h);
  });

  function enhance(){
    var l=rows(),h=document.querySelector('h1.display');
    if(!l.length||!h)return false;
    l.forEach(function(r){
      r.setAttribute('role','button');
      r.setAttribute('tabindex','0');
      r.setAttribute('aria-label','Play '+titleOf(r));
    });
    h.setAttribute('data-text',h.textContent);
    return true;
  }
  if(!enhance()){
    var mo=new MutationObserver(function(){if(enhance())mo.disconnect();});
    mo.observe(document.getElementById('root')||document.body,{childList:true,subtree:true});
  }
  document.addEventListener('click',function(e){
    var b=e.target.closest&&e.target.closest('.dm-tracklink');
    if(!b)return;
    var name=b.getAttribute('data-title'),list=rows();
    for(var i=0;i<list.length;i++)if(titleOf(list[i])===name){toggle(list[i]);window.scrollTo({top:list[i].getBoundingClientRect().top+scrollY-90,behavior:'smooth'});break;}
  });
})();
}catch(e){console.error(e)}

try{
(function(){
  var scrollRaf=0;
  function yNow(){
    return window.scrollY||document.documentElement.scrollTop||document.body.scrollTop||0;
  }
  function toTop(){
    if(scrollRaf){cancelAnimationFrame(scrollRaf);scrollRaf=0;}
    var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var start=yNow();
    if(start<=0)return;
    if(reduce){window.scrollTo(0,0);return;}
    /* Disable CSS scroll-behavior during the rAF tween so the two systems
       don't fight (that fight was the "stick" at the track list). */
    var root=document.documentElement;
    var prev=root.style.scrollBehavior;
    root.style.scrollBehavior='auto';
    var t0=performance.now();
    /* ease-in-out, slightly longer — reads closer to a CSS smooth scroll */
    var dur=Math.min(1400,Math.max(520,start*0.62));
    function ease(t){
      return t<.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2;
    }
    function step(now){
      var u=Math.min(1,(now-t0)/dur);
      var y=Math.round(start*(1-ease(u)));
      window.scrollTo(0,y);
      if(u<1)scrollRaf=requestAnimationFrame(step);
      else{
        scrollRaf=0;
        window.scrollTo(0,0);
        root.style.scrollBehavior=prev;
      }
    }
    scrollRaf=requestAnimationFrame(step);
  }
  var fab=document.getElementById('dm-top-fab');
  if(fab)fab.addEventListener('click',toTop);
  if(!fab)return;
  var ticking=false,shown=false;
  function update(){
    ticking=false;
    var y=yNow();
    var on=y>420;
    if(on===shown)return;
    shown=on;
    fab.classList.toggle('dm-show',on);
  }
  window.addEventListener('scroll',function(){
    if(!ticking){ticking=true;requestAnimationFrame(update);}
  },{passive:true});
  update();
})();
}catch(e){console.error(e)}

try{
// Aktifkan fade-in + always pin scroll to top (no mid-page land).
  window.addEventListener('DOMContentLoaded', function() {
    try {
      var root = document.documentElement, prev = root.style.scrollBehavior;
      root.style.scrollBehavior = 'auto';
      window.scrollTo(0, 0);
      root.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
      root.style.scrollBehavior = prev;
    } catch(e){}
    requestAnimationFrame(function() {
      document.body.classList.add('dm-loaded');
      try {
        var root = document.documentElement, prev = root.style.scrollBehavior;
        root.style.scrollBehavior = 'auto';
        window.scrollTo(0, 0);
        root.style.scrollBehavior = prev;
      } catch(e){}
    });
  });
  // Catch late browser scroll restoration after load
  window.addEventListener('load', function() {
    try {
      if ((window.scrollY || document.documentElement.scrollTop || 0) > 8) {
        var root = document.documentElement, prev = root.style.scrollBehavior;
        root.style.scrollBehavior = 'auto';
        window.scrollTo(0, 0);
        root.style.scrollBehavior = prev;
      }
    } catch(e){}
  });
}catch(e){console.error(e)}

try{
/* Spectrum interaction + listening-mode idle tracking (extends player, non-destructive) */
(function(){
  var lastInteract = performance.now();
  var tapN = 0, lastTap = 0, tapH = 0;
  /* Signal interruption bertingkat: combo tap (reset kalau jeda >700ms) → [pesan, durasi ms, tulis ke log?] */
  /* Tier tap → pesan dock toast. hot=true masuk hist + toast pink; false = toast saja (bisa di-drop antrean). */
  var TAPS = {
    1:  ['SIGNAL RECEIVED', false],
    2:  ['SIGNAL RECEIVED ×2', false],
    4:  ['SIGNAL INTERRUPTED', true],
    7:  ['STOP.', true],
    10: ['WHY ARE YOU DOING THIS', true]
  };
  /* Satu kanal: toast dock (__dmLog / __dmToast). Tidak pakai #dm-toast center. */
  function tapToast(msg, hot){
    var line = String(msg||'').replace(/\s+/g,' ').trim().slice(0,52);
    if(!line)return;
    try{
      if(hot){
        /* hist saja (silent) + toast lewat jalur depan antrean → muncul seketika, gak nunggu toast lain */
        if(window.__dmLog) window.__dmLog(line, true, true);
        if(window.__dmToast) window.__dmToast(line, true, 2200, 'front');
        return;
      }
      /* tier ringan: antre biasa, boleh di-drop / basi, gak nimpa toast lain */
      if(window.__dmToast) window.__dmToast(line, false, 2200, 'soft');
    }catch(e){}
  }
  /* Expose for player loop */
  window.__dmLastInteract = function(){ return lastInteract; };
  /* Patch into A if player already defined lastInteract — we sync via property */
  function bump(){
    lastInteract = performance.now();
    try{
      var A=window.__dmA; if(A) A.listen = Math.max(0, (A.listen||0) - 0.35);
    }catch(e){}
  }
  /* Bridge: player loop reads lastInteract from closure — inject via window */
  Object.defineProperty(window, '__dmIdleAt', {
    get: function(){ return lastInteract; },
    configurable: true
  });
  ['pointerdown','wheel','touchstart','keydown','scroll'].forEach(function(ev){
    window.addEventListener(ev, bump, {passive:true, capture:true});
  });

  function heroCanvas(){
    var sec = document.querySelector('section.dm-hero');
    if(!sec) return null;
    return sec.querySelector('canvas');
  }
  function onHeroTap(e){
    var A=window.__dmA;
    if(!A) return;
    /* only when audio is active */
    var playing = A.active && (A.level > 0.02 || A.memory > 0.05);
    /* also check if player bar is shown */
    var bar = document.getElementById('dm-bar');
    var likelyPlaying = bar && bar.classList.contains('dm-show');
    if(!playing && !likelyPlaying) return;
    var cv = heroCanvas();
    if(!cv) return;
    var rect = cv.getBoundingClientRect();
    var x = (e.clientX - rect.left) * (cv.width / Math.max(1, rect.width) / (window.devicePixelRatio||1));
    var y = (e.clientY - rect.top) * (cv.height / Math.max(1, rect.height) / (window.devicePixelRatio||1));
    /* Prefer CSS-pixel coords matching draw loop (setTransform already accounts for dpr) */
    x = e.clientX - rect.left;
    y = e.clientY - rect.top;
    if(!A.blips) A.blips = [];
    A.blips.push({x:x, y:y, t:performance.now(), c: Math.random()>0.5 ? '#6ee5ff' : '#ff7ad9'});
    if(A.blips.length > 8) A.blips.shift();
    /* rapid taps → bertingkat: 1, 2, 4, 7, 10, lalu 13 (rare) dan balik normal */
    var now = performance.now();
    if(now - lastTap > 700) tapN = 0;
    lastTap = now;
    tapN++;
    if(tapN === 13){
      tapN = 0;
      tapToast('...', false);
      clearTimeout(tapH);
      tapH = setTimeout(function(){
        tapToast('YOU FOUND NOTHING.', true);
      }, 1500);
    }else if(TAPS[tapN]){
      var tier = TAPS[tapN];
      tapToast(tier[0], tier[1]);
    }
    bump();
  }
  function bind(){
    var cv = heroCanvas();
    if(cv && !cv._dmBlip){
      cv._dmBlip = true;
      cv.addEventListener('pointerdown', onHeroTap);
    }
  }
  bind();
  var moQ = false;
  var mo = new MutationObserver(function(){ if(moQ) return; moQ = true; requestAnimationFrame(function(){ moQ = false; bind(); }); });
  mo.observe(document.getElementById('root')||document.body, {childList:true, subtree:true});
  /* Idle bridge: player loop membaca window.__dmIdleAt (getter di atas). Tidak perlu setInterval / __dmSetIdle. */
})();
}catch(e){console.error(e)}

try{
(function(){
  var KEY='dm_album',MAXL=5,pH=0,pL=0; /* pH/pL = delta ms (here/listened) yang belum ditulis ke storage */
  function slugT(t){return String(t||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');}
  /* ---------- state lokal: tracks + memory fragments ---------- */
  /* tr[slug] = {l: detik didengar total, f: posisi terjauh (detik), d: durasi, p: berapa kali diputar >=20 dtk, ts: terakhir didengar}
     tHere = total ms ada di halaman (visible ATAU audio main di background) · tListen = total ms audio benar-benar main */
  var st={tracksPlayed:[],lastTrack:'',timesVisited:0,lastObserved:'',lastSignal:'',lastInterruption:0,taps:0,lastDwell:0,dumbowl:0,lastPos:0,lastTs:0,tr:{},tHere:0,tListen:0};
  try{
    var o=JSON.parse(localStorage.getItem(KEY)||'null');
    if(o&&typeof o==='object'){
      if(Array.isArray(o.tracksPlayed))st.tracksPlayed=o.tracksPlayed.filter(function(x){return typeof x==='string';}).slice(0,20);
      if(typeof o.lastTrack==='string')st.lastTrack=o.lastTrack.slice(0,60);
      if(+o.timesVisited>0)st.timesVisited=Math.min(Math.floor(+o.timesVisited),9999);
      if(typeof o.lastObserved==='string')st.lastObserved=o.lastObserved.slice(0,40);
      if(typeof o.lastSignal==='string')st.lastSignal=o.lastSignal.slice(0,12);
      if(+o.lastInterruption>0)st.lastInterruption=Math.min(Math.floor(+o.lastInterruption),99999);
      if(+o.taps>0)st.taps=Math.min(Math.floor(+o.taps),99999);
      if(+o.lastDwell>0)st.lastDwell=Math.min(Math.floor(+o.lastDwell),86400000);
      if(+o.dumbowl>0)st.dumbowl=1;
      if(+o.lastTs>0)st.lastTs=Math.floor(+o.lastTs);
      if(isFinite(+o.lastPos)&&+o.lastPos>=-1)st.lastPos=Math.floor(+o.lastPos);
      if(+o.tHere>0)st.tHere=Math.min(Math.floor(+o.tHere),3.6e9*24);
      if(+o.tListen>0)st.tListen=Math.min(Math.floor(+o.tListen),3.6e9*24);
      if(o.tr&&typeof o.tr==='object'){
        Object.keys(o.tr).slice(0,12).forEach(function(k){
          var r=o.tr[k];if(!r||typeof r!=='object'||!/^[a-z0-9-]{1,40}$/.test(k))return;
          st.tr[k]={l:Math.max(0,+r.l||0),f:Math.max(0,+r.f||0),d:Math.max(0,+r.d||0),p:Math.max(0,Math.floor(+r.p||0)),ts:Math.max(0,Math.floor(+r.ts||0))};
        });
      }
    }
  }catch(e){}
  /* migrasi sekali jalan: dm_mem (store lama) -> dm_album, supaya pengunjung lama tidak kehilangan memori */
  try{
    var rawOld=localStorage.getItem('dm_mem');
    if(rawOld!==null){
      var om=JSON.parse(rawOld);
      if(om&&typeof om.t==='string'&&om.t&&+om.ts>st.lastTs){
        st.lastTrack=om.t.slice(0,60);
        st.lastPos=isFinite(+om.s)?Math.max(-1,Math.floor(+om.s)):0;
        st.lastTs=Math.floor(+om.ts);
      }
      localStorage.setItem(KEY,JSON.stringify(st));
      localStorage.removeItem('dm_mem');
    }
  }catch(e){}
  var prev={
    tracksPlayed:st.tracksPlayed.slice(),lastTrack:st.lastTrack,timesVisited:st.timesVisited,
    lastObserved:st.lastObserved,lastSignal:st.lastSignal,lastInterruption:st.lastInterruption,taps:st.taps,
    lastDwell:st.lastDwell,dumbowl:st.dumbowl,lastPos:st.lastPos,lastTs:st.lastTs,
    tHere:st.tHere,tListen:st.tListen,tr:JSON.parse(JSON.stringify(st.tr))
  };
  window.__dmMemPrev=function(){return {t:prev.lastTrack,s:prev.lastPos,ts:prev.lastTs};};
  /* save: total waktu DIAKUMULASI (stored + delta), bukan ditimpa — aman buat reload cepat & banyak tab */
  function save(){
    try{
      try{flushHere();}catch(e0){}
      var s=JSON.parse(localStorage.getItem(KEY)||'null');
      var bH=s&&+s.tHere>0?Math.floor(+s.tHere):0,bL=s&&+s.tListen>0?Math.floor(+s.tListen):0;
      st.tHere=bH+Math.round(pH);st.tListen=bL+Math.round(pL);pH=0;pL=0;
      Object.keys(st.tr).forEach(function(k){var r=st.tr[k];r.l=Math.round(r.l*10)/10;r.f=Math.round(r.f);});
      localStorage.setItem(KEY,JSON.stringify(st));
    }catch(e){}
  }
  /* saver tunggal fragmen memori: lagu terakhir, posisi, waktu. Posisi/track hanya ditulis setelah >=3 detik atau saat lagu selesai. */
  function snapFrag(){
    var P=window.__dmPlayer,t=P&&P.title?P.title():'';
    if(!t)return;
    var a=P.audio,c=a?(a.currentTime||0):0,end=!!(a&&a.ended);
    st.lastObserved=String(t).replace(/\s+/g,' ').trim().slice(0,40); /* judul utuh: "Glitch" ≠ "Glitch (Instrumental)" */
    if(a)st.lastSignal=end?'END':fmtSig(c);
    if(end||c>=3){st.lastTrack=String(t).slice(0,60);st.lastPos=end?-1:Math.floor(c);st.lastTs=Date.now();}
    st.lastInterruption=st.taps||st.lastInterruption||0;
    save();
  }
  function fmtSig(sec){
    sec=Math.max(0,Math.floor(+sec||0));
    var m=Math.floor(sec/60),s=sec%60;
    return (m<10?'0':'')+m+':'+(s<10?'0':'')+s;
  }
  /* hitung kunjungan sekali per sesi tab (reload tidak menggelembungkan angka) */
  var newSession=true;
  try{newSession=!sessionStorage.getItem('dm_sess');sessionStorage.setItem('dm_sess','1');}catch(e){}
  if(newSession){st.timesVisited++;save();}

  /* ---------- SESSION LOG + OBSERVATORY DOCK (UTC 12h, dragable 🦉) ---------- */
  var MAXHIST=40;
  var hist=[]; /* {ts,msg,hot} */
  var bodyRoot=document.body||document.documentElement;
  var DOCK_KEY='dm_dock_pos';

  /* Dock wrapper — posisi bebas, default kiri-bawah */
  var dock=document.createElement('div');
  dock.id='dm-dock';
  var owl=document.createElement('button');
  owl.id='dm-owl';owl.type='button';
  owl.setAttribute('aria-label','Open session log and observatory');
  owl.setAttribute('title','Drag to move · tap to open');
  owl.setAttribute('aria-expanded','false');
  owl.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="9" cy="10.5" r="1.4" fill="currentColor" stroke="none"/><circle cx="15" cy="10.5" r="1.4" fill="currentColor" stroke="none"/><path d="M9 14.2c.9.9 2.1 1.3 3 1.3s2.1-.4 3-1.3"/><path d="M7.2 7.8C8.4 6.6 10 6 12 6s3.6.6 4.8 1.8"/><path d="M4.8 11.2c.3-1.6 1-2.8 1.8-3.6"/><path d="M19.2 11.2c-.3-1.6-1-2.8-1.8-3.6"/></svg>';
  dock.appendChild(owl);
  bodyRoot.appendChild(dock);

  /* Single-line toast (auto-hide) */
  var toastEl=document.createElement('div');
  toastEl.id='dm-log-toast';toastEl.setAttribute('aria-live','polite');toastEl.setAttribute('aria-hidden','true');
  bodyRoot.appendChild(toastEl);
  var toastTimer=0;

  /* Panel: Back to Observatory di atas, session log di bawah */
  var box=document.createElement('div');
  box.id='dm-log';box.setAttribute('aria-hidden','true');box.setAttribute('role','dialog');box.setAttribute('aria-label','Observatory and session log');
  var backLink=document.createElement('a');
  backLink.className='dm-back';backLink.href='/';
  backLink.setAttribute('aria-label','Back to Dumul\'s Observatory');
  backLink.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg><span>Back to Observatory</span>';
  var head=document.createElement('div');head.className='h';
  var headLbl=document.createElement('span');headLbl.textContent='DUMUL // SESSION LOG';
  var closeBtn=document.createElement('button');closeBtn.type='button';closeBtn.className='dm-log-close';
  closeBtn.setAttribute('aria-label','Close');closeBtn.textContent='\u00d7';
  head.appendChild(headLbl);head.appendChild(closeBtn);
  var list=document.createElement('div');list.className='dm-log-list';
  box.appendChild(backLink);box.appendChild(head);box.appendChild(list);
  bodyRoot.appendChild(box);

  /* ---- drag / parkir dock ---- */
  function dockSize(){return {w:dock.offsetWidth||44,h:dock.offsetHeight||44};}
  function clampDock(x,y){
    var s=dockSize(),pad=6;
    var maxX=Math.max(pad,(window.innerWidth||360)-s.w-pad);
    var maxY=Math.max(pad,(window.innerHeight||640)-s.h-pad);
    return {x:Math.min(maxX,Math.max(pad,x)),y:Math.min(maxY,Math.max(pad,y))};
  }
  function applyDock(x,y,parked){
    var p=clampDock(x,y);
    dock.style.left=p.x+'px';
    dock.style.top=p.y+'px';
    dock.style.right='auto';
    dock.style.bottom='auto';
    if(parked)dock.setAttribute('data-parked','1');
    else dock.removeAttribute('data-parked');
    return p;
  }
  function saveDock(x,y){
    try{localStorage.setItem(DOCK_KEY,JSON.stringify({x:Math.round(x),y:Math.round(y)}));}catch(e){}
  }
  function loadDock(){
    try{
      var o=JSON.parse(localStorage.getItem(DOCK_KEY)||'null');
      if(o&&isFinite(+o.x)&&isFinite(+o.y)){
        applyDock(+o.x,+o.y,true);
        return true;
      }
    }catch(e){}
    return false;
  }
  loadDock();
  window.addEventListener('resize',function(){
    if(dock.hasAttribute('data-parked')){
      var r=dock.getBoundingClientRect();
      applyDock(r.left,r.top,true);
    }
    if(box.classList.contains('open'))placePanel();
    if(toastEl.classList.contains('on'))placeToast();
    placeObs();
  });

  function placePanel(){
    var r=dock.getBoundingClientRect();
    var pw=Math.min(window.innerWidth*0.78,300);
    var gap=8,pad=8;
    var left=r.left;
    if(left+pw>window.innerWidth-pad)left=Math.max(pad,window.innerWidth-pw-pad);
    if(left<pad)left=pad;
    /* prefer open above dock; fallback below */
    var spaceAbove=r.top-pad;
    var spaceBelow=window.innerHeight-r.bottom-pad;
    var preferAbove=spaceAbove>=160||spaceAbove>=spaceBelow;
    box.style.left=left+'px';
    box.style.width=pw+'px';
    box.style.right='auto';
    if(preferAbove){
      box.style.bottom=(window.innerHeight-r.top+gap)+'px';
      box.style.top='auto';
      box.style.maxHeight=Math.min(window.innerHeight*0.48,Math.max(140,spaceAbove-gap))+'px';
    }else{
      box.style.top=(r.bottom+gap)+'px';
      box.style.bottom='auto';
      box.style.maxHeight=Math.min(window.innerHeight*0.48,Math.max(140,spaceBelow-gap))+'px';
    }
  }
  /* Area yang gak boleh ditimpa toast/obs: bar player (+ mini spektrum), baris lirik hero, panel lirik terbuka. */
  function avoidRects(){
    var out={rects:[],barTop:null},vh=window.innerHeight||640,vw=window.innerWidth||360;
    function add(el){
      if(!el)return null;
      var r=el.getBoundingClientRect();
      if(r.width<2||r.height<2||r.bottom<0||r.top>vh||r.right<0||r.left>vw)return null;
      out.rects.push(r);return r;
    }
    var bar=document.getElementById('dm-bar');
    if(bar&&bar.classList.contains('dm-show')){
      var br=add(bar);
      if(br)out.barTop=br.top;
      var mini=document.getElementById('dm-mini');
      if(mini&&parseFloat(getComputedStyle(mini).opacity)>0.05){
        var mr=add(mini);
        if(mr&&(out.barTop===null||mr.top<out.barTop))out.barTop=mr.top;
      }
    }
    var hl=document.getElementById('dm-hl');
    if(hl&&hl.classList.contains('on'))add(hl);
    add(document.querySelector('.dm-lyrics.dm-open'));
    return out;
  }
  /* Anchor UI ke dock: pilih sisi terdekat yang muat — jangan pernah loncat ke ujung layar jauh. */
  function placeNearDock(el, tw, th, fit){
    var r=dock.getBoundingClientRect();
    if(fit){
      /* Pakai ukuran teks ASLI (bukan lebar maksimum) supaya sisi kiri dock tidak renggang. */
      el.style.maxWidth=Math.max(0,tw)+'px';
      /* reset ke (0,0) dulu: elemen fixed dengan left lama dekat tepi kanan bakal ke-shrink dan keukur terlalu sempit */
      el.style.left='0px';el.style.top='0px';el.style.right='auto';el.style.bottom='auto';
      var br=el.getBoundingClientRect();
      if(br.width>0)tw=Math.min(tw,Math.ceil(br.width));
      if(br.height>0)th=Math.ceil(br.height);
    }
    var gap=6,pad=8;
    var vw=window.innerWidth||360,vh=window.innerHeight||640;
    tw=Math.min(tw,vw-pad*2);
    th=th||32;
    var cx=r.left+r.width/2,cy=r.top+r.height/2;
    var mid=vw/2;
    /* kandidat: kanan, kiri, atas, bawah — skor = jarak ke pusat dock + penalti out-of-bounds */
    var cands=[
      {left:r.right+gap, top:cy-th/2},
      {left:r.left-tw-gap, top:cy-th/2},
      {left:cx-tw/2, top:r.top-th-gap},
      {left:cx-tw/2, top:r.bottom+gap}
    ];
    /* prefer sisi menghadap pusat layar */
    if(cx>=mid){cands=[cands[1],cands[0],cands[2],cands[3]];}
    var avoid=avoidRects();
    /* dock ketutup bar player? kandidat tambahan: tepat di atas bar */
    if(avoid.barTop!==null)cands.push({left:cx-tw/2, top:avoid.barTop-th-gap});
    var best=null,bestScore=1e15;
    for(var i=0;i<cands.length;i++){
      var c=cands[i];
      var L=Math.min(vw-tw-pad,Math.max(pad,c.left));
      var T=Math.min(vh-th-pad,Math.max(pad,c.top));
      /* penalti besar kalau clamp menjauh dari dock (>28px = “kepisah”) */
      var drift=Math.abs(L-c.left)+Math.abs(T-c.top);
      var dx=(L+tw/2)-cx,dy=(T+th/2)-cy;
      var dist=Math.sqrt(dx*dx+dy*dy);
      var score=dist+drift*4+(drift>28?200:0);
      /* penalti kalau nimpa bar / lirik */
      var ov=0;
      for(var j=0;j<avoid.rects.length;j++){
        var a=avoid.rects[j];
        var ix=Math.min(L+tw,a.right)-Math.max(L,a.left);
        var iy=Math.min(T+th,a.bottom)-Math.max(T,a.top);
        if(ix>0&&iy>0)ov+=ix*iy;
      }
      if(ov>0)score+=Math.min(1,ov/Math.max(1,tw*th))*500;
      if(score<bestScore){bestScore=score;best={left:L,top:T};}
    }
    el.style.left=best.left+'px';
    el.style.top=best.top+'px';
    el.style.bottom='auto';
    el.style.right='auto';
    el.style.maxWidth=tw+'px';
    return best;
  }
  function placeToast(){
    var tw=Math.min(window.innerWidth*0.56,240);
    placeNearDock(toastEl,tw,34,true);
    toastEl.setAttribute('data-anchored','1');
  }
  function placeObs(){
    if(!obsEl||!obsEl.classList.contains('on'))return;
    /* compact label di atas/samping dock */
    placeNearDock(obsEl,Math.min(window.innerWidth*0.42,160),18,true);
  }

  var drag={on:false,moved:false,pid:0,ox:0,oy:0,sx:0,sy:0};
  function onDragStart(e){
    if(e.button!=null&&e.button!==0)return;
    drag.on=true;drag.moved=false;drag.pid=e.pointerId;
    var r=dock.getBoundingClientRect();
    drag.ox=e.clientX-r.left;drag.oy=e.clientY-r.top;
    drag.sx=e.clientX;drag.sy=e.clientY;
    try{owl.setPointerCapture(e.pointerId);}catch(err){}
  }
  function onDragMove(e){
    if(!drag.on||e.pointerId!==drag.pid)return;
    var dx=e.clientX-drag.sx,dy=e.clientY-drag.sy;
    if(!drag.moved&&(dx*dx+dy*dy)<64)return; /* threshold ~8px */
    drag.moved=true;
    dock.classList.add('dm-dragging');
    if(box.classList.contains('open'))setOpen(false);
    var p=applyDock(e.clientX-drag.ox,e.clientY-drag.oy,true);
    if(toastEl.classList.contains('on'))placeToast();
    placeObs();
    /* live-save light: only on end */
    drag._lx=p.x;drag._ly=p.y;
  }
  function onDragEnd(e){
    if(!drag.on||(e.pointerId!=null&&e.pointerId!==drag.pid))return;
    drag.on=false;
    dock.classList.remove('dm-dragging');
    try{owl.releasePointerCapture(drag.pid);}catch(err){}
    if(drag.moved){
      var r=dock.getBoundingClientRect();
      var p=applyDock(r.left,r.top,true);
      saveDock(p.x,p.y);
      placeObs();
      if(toastEl.classList.contains('on'))placeToast();
    }
  }
  owl.addEventListener('pointerdown',onDragStart);
  owl.addEventListener('pointermove',onDragMove);
  owl.addEventListener('pointerup',onDragEnd);
  owl.addEventListener('pointercancel',onDragEnd);

  function pad(n){return n<10?'0'+n:''+n;}
  /* UTC 12-hour clock, e.g. 02:15:30 PM UTC */
  function stamp(){
    var d=new Date();
    var h=d.getUTCHours();
    var ampm=h>=12?'PM':'AM';
    h=h%12;if(h===0)h=12;
    return pad(h)+':'+pad(d.getUTCMinutes())+':'+pad(d.getUTCSeconds())+' '+ampm+' UTC';
  }
  function renderList(){
    list.textContent='';
    var start=Math.max(0,hist.length-MAXL);
    for(var i=start;i<hist.length;i++){
      var e=hist[i];
      var l=document.createElement('div');l.className='l'+(e.hot?' x':'');
      var t=document.createElement('span');t.className='t';t.textContent=e.ts;
      l.appendChild(t);l.appendChild(document.createTextNode(e.msg));
      list.appendChild(l);
    }
  }
  function showToast(msg,hot,holdMs){
    toastEl.textContent='';
    var t=document.createElement('span');t.className='t';t.textContent=stamp();
    toastEl.appendChild(t);toastEl.appendChild(document.createTextNode(String(msg).replace(/\s+/g,' ').trim().slice(0,52)));
    toastEl.classList.toggle('x',!!hot);
    placeToast(); /* setelah isi terpasang, supaya ukuran yang diukur = ukuran toast sebenarnya */
    toastEl.classList.add('on');
    toastEl.setAttribute('aria-hidden','false');
    clearTimeout(toastTimer);
    toastTimer=setTimeout(function(){
      toastEl.classList.remove('on');
      toastEl.setAttribute('aria-hidden','true');
    },holdMs||2800);
  }
  /* Toast UI saja (tanpa hist) — dipakai player/deck/settings. Selalu nempel ke dock. */
  /* mode: 'ui'/'front' = feedback langsung (depan antrean, gak di-drop) · 'soft' = antre biasa, bisa di-drop/basi · kosong = antre biasa */
  window.__dmToast=function(msg,hot,holdMs,mode){
    if(box.classList.contains('open'))return; /* panel terbuka = jangan ganggu */
    var m=String(msg||'');if(!m)return;
    var fr=(mode==='ui'||mode==='front');
    enqueueToast({msg:m,hot:!!hot,hold:holdMs||2600,at:Date.now(),keep:fr,front:fr,soft:mode==='soft'});
  };
  window.__dmReplaceToast=function(){if(toastEl.classList.contains('on'))placeToast();};
  /* toast yang dititip sebelum dock siap */
  setTimeout(function(){
    try{
      var pend=window.__dmToastPending;window.__dmToastPending=null;
      if(pend)for(var i=0;i<pend.length;i++)window.__dmToast(pend[i][0],false,pend[i][1],'ui');
    }catch(e){}
  },0);
  function setOpen(on){
    box.classList.toggle('open',on);
    box.setAttribute('aria-hidden',on?'false':'true');
    owl.setAttribute('aria-expanded',on?'true':'false');
    owl.setAttribute('aria-label',on?'Close panel':'Open session log and observatory');
    if(on){renderList();placePanel();}
  }
  owl.addEventListener('click',function(e){
    e.stopPropagation();
    if(drag.moved){drag.moved=false;return;} /* selesai drag → jangan toggle */
    setOpen(!box.classList.contains('open'));
  });
  closeBtn.addEventListener('click',function(e){e.stopPropagation();setOpen(false);});
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'&&box.classList.contains('open')){setOpen(false);}
  });
  /* Auto-hide full panel when tapping / scrolling outside it */
  document.addEventListener('pointerdown',function(e){
    if(!box.classList.contains('open'))return;
    var t=e.target;
    if(box.contains(t)||dock.contains(t))return;
    setOpen(false);
  },true);
  var scrollCloseT=0;
  function onOutsideScroll(){
    if(!box.classList.contains('open'))return;
    clearTimeout(scrollCloseT);
    scrollCloseT=setTimeout(function(){setOpen(false);},40);
  }
  window.addEventListener('scroll',onOutsideScroll,{passive:true,capture:true});
  document.addEventListener('touchmove',function(e){
    if(!box.classList.contains('open'))return;
    var t=e.target;
    if(box.contains(t))return; /* allow scrolling inside the panel */
    onOutsideScroll();
  },{passive:true});

  var narrBusy=false,narrUntil=0;
  /* busy flags generator — dideklarasi di sini biar obsTick/idleTick/reflect/dwell bisa cek aman */
  var nullBusy=false,conflictBusy=false,bugBusy=false;
  function narrLock(ms){narrBusy=true;narrUntil=Date.now()+(ms||4000);}
  function narrFree(){if(Date.now()>=narrUntil)narrBusy=false;}
  /* Antrian toast TUNGGAL (log() + __dmToast lewat sini). Urutan terjaga.
     - hot / keep selalu masuk; non-hot dibuang kalau antrean sudah >=2
     - front (feedback user: settings, error audio, tap hot) disisipkan di depan, dan memotong toast yang sudah tampil >=700ms
     - soft yang sudah basi (>2.5s di antrean) dilewati */
  var toastQ=[],toastBusy=false,toastSlotT=0,toastSlotAt=0,toastCur='',TOAST_HOLD=1400,TOAST_MIN=700;
  function drainToast(){
    if(toastBusy)return;
    var e=null;
    while(toastQ.length){
      var c=toastQ.shift();
      if(c.soft&&Date.now()-c.at>2500)continue;
      e=c;break;
    }
    if(!e)return;
    if(box.classList.contains('open')){toastQ.length=0;return;}
    toastBusy=true;toastSlotAt=Date.now();toastCur=e.msg;
    showToast(e.msg,e.hot,e.hold);
    clearTimeout(toastSlotT);
    toastSlotT=setTimeout(function(){toastBusy=false;drainToast();},e.keep?Math.min(e.hold||1800,1800):TOAST_HOLD);
  }
  function enqueueToast(entry){
    if(box.classList.contains('open'))return;
    var last=toastQ.length?toastQ[toastQ.length-1]:null;
    if(last&&last.msg===entry.msg)return;
    if(toastBusy&&!toastQ.length&&toastCur===entry.msg)return;
    if(entry.front){
      toastQ.unshift(entry);
    }else{
      if(!entry.hot&&!entry.keep&&toastQ.length>=2)return;
      if(toastQ.length>=6)toastQ.shift();
      toastQ.push(entry);
    }
    if(!toastBusy)drainToast();
    else if(entry.front&&Date.now()-toastSlotAt>=TOAST_MIN){
      clearTimeout(toastSlotT);toastBusy=false;drainToast();
    }
  }
  function log(msg,hot,silent){
    var entry={ts:stamp(),msg:String(msg).slice(0,60),hot:!!hot};
    hist.push(entry);
    while(hist.length>MAXHIST)hist.shift();
    if(box.classList.contains('open')){renderList();return;}
    if(silent)return;
    enqueueToast({msg:entry.msg,hot:entry.hot,hold:2800,at:Date.now()});
  }
  function pair(a,b,gap,hotB){log(a,true);setTimeout(function(){log(b,hotB!==false);},gap||1400);}
  window.__dmLog=function(msg,hot,silent){log(msg,hot,silent);};

  /* ---------- sambutan + MEMORY FRAGMENT (hero via return; session log ringkas) ---------- */
  /* Sumber tunggal daftar lagu = row di player (urutan DOM = urutan keyboard 1-5). Fallback kalau player belum siap. */
  var FALLBACK_TRACKS=['Glitch (Instrumental)','Limerence','Glitch','Nastenka','Larung'];
  function normT(x){return String(x||'').toLowerCase().replace(/\s+/g,' ').trim();}
  function trackList(){
    try{
      var P=window.__dmPlayer,r=P&&P.rows?P.rows():[],out=[];
      for(var i=0;i<r.length;i++){var t=P.title.call(null,r[i]);if(t)out.push(t);}
      if(out.length)return out;
    }catch(e){}
    return FALLBACK_TRACKS;
  }
  function playedIdx(list,title){
    var n=normT(title);
    for(var i=0;i<list.length;i++){if(normT(list[i])===n)return i;}
    return -1;
  }
  function allObserved(list){
    var tr=trackList();
    for(var i=0;i<tr.length;i++){if(playedIdx(list||[],tr[i])<0)return false;}
    return tr.length>0;
  }
  var welcomed=false,allObservedLogged=false;
  window.__dmWelcome=function(){
    if(welcomed||!newSession||prev.timesVisited<1)return [];
    welcomed=true;
    var out=[];
    var hasFrag=!!(prev.lastObserved||prev.lastInterruption>0||prev.lastSignal);
    if(hasFrag){
      if(Math.random()<0.45)out.push('I REMEMBER THIS.');
      else out.push('YOU WERE HERE BEFORE.');
      if(prev.lastObserved)out.push('LAST OBSERVED: '+prev.lastObserved.toUpperCase());
      /* LAST SIGNAL di-skip: Corrupted Memory (lastTrack/lastPos/lastTs) sudah tampilkan last signal + gap di hero */
      if(prev.lastInterruption>0)out.push('LAST INTERRUPTION: '+prev.lastInterruption+' TAPS');
    }else{
      out.push('WELCOME BACK.');
    }
    try{
      var all=allObserved(prev.tracksPlayed);
      /* hanya kalau lagu "Glitch*" berhenti di tengah (lastPos -1 = sudah tamat) */
      if(/^glitch/.test(slugT(prev.lastTrack))&&prev.lastPos>=0)out.push('YOU LEFT THE SIGNAL UNFINISHED.');
      if(all){out.push('ALL SIGNALS HAVE BEEN OBSERVED.');allObservedLogged=true;}
    }catch(e){}
    if(prev.timesVisited>=2&&Math.random()<0.12){
      out=['YOU CAME BACK.','I WONDER WHY.'];
      if(prev.lastObserved)out.push('LAST OBSERVED: '+prev.lastObserved.toUpperCase());
    }
    /* satu toast ringkas — detail penuh hanya di hero (hindari double-spam toast+lirik) */
    var summary=hasFrag?'MEMORY FRAGMENT RECOVERED.':(out[0]||'WELCOME BACK.');
    setTimeout(function(){log(summary,true);},400);
    return out;
  };

  /* ---------- OBSERVER STATUS ---------- */
  var obsEl=document.createElement('div');
  obsEl.id='dm-obs';obsEl.setAttribute('aria-live','polite');obsEl.setAttribute('aria-hidden','true');
  bodyRoot.appendChild(obsEl);
  var obsState='',obsSilentAt=0,obsYouCool=0,obsActiveCool=0,obsSilentCool=0,obsDetected=false;
  /* Toast HANYA untuk momen bermakna. SILENT/ACTIVE = indikator saja (hindari spam saat lirik/scroll). */
  var OBS_TOAST={DETECTED:1,ABSENT:1,RETURNED:1,YOU:1};
  function setObs(stName,toastIt){
    if(stName===obsState)return;
    obsState=stName;
    obsEl.textContent='OBSERVER: '+stName;
    obsEl.setAttribute('data-st',stName);
    obsEl.classList.add('on');
    obsEl.setAttribute('aria-hidden','false');
    placeObs();
    if(toastIt&&OBS_TOAST[stName])log('OBSERVER: '+stName,stName==='YOU'||stName==='RETURNED'||stName==='DETECTED');
  }
  function obsPlaying(){
    try{var p=document.getElementById('dm-pp');return !!(p&&p.classList.contains('dm-on'));}catch(e){return false;}
  }
  function obsTick(){
    setTimeout(obsTick,2000);
    if(document.hidden)return;
    /* Jangan timpa state selama NULL sequence atau status ABSENT/RETURNED/NULL */
    if(nullBusy||obsState==='ABSENT'||obsState==='RETURNED'||obsState==='NULL')return;
    var idle=Date.now()-lastAct;
    /* threshold lebih longgar saat musik main — lirik pindah ≠ user "aktif" */
    var need=obsPlaying()?28000:14000;
    if(idle>=need){
      if(obsState!=='SILENT'&&obsState!=='YOU'&&Date.now()>obsSilentCool){
        if(Date.now()>obsYouCool&&Math.random()<0.10){
          setObs('YOU',true);
          obsYouCool=Date.now()+120000;
          setTimeout(function(){
            if(obsState==='YOU'&&Date.now()-lastAct>=need)setObs('SILENT',false);
          },3200);
        }else setObs('SILENT',false); /* indikator only, no toast */
      }
    }else if(obsDetected&&obsState!=='ACTIVE'&&obsState!=='DETECTED'){
      if(Date.now()>obsActiveCool){setObs('ACTIVE',false);obsActiveCool=Date.now()+4000;}
    }
  }
  setTimeout(obsTick,2000);

  /* ---------- interaksi & idle ---------- */
  var seen=false,lastAct=Date.now(),idleFired=false,hiddenAt=0,sessTaps=0;
  var sigDecay=0; /* 0 ok, 1 STABLE, 2 WEAKENING, 3 FADING, 4 ... */
  var actMoveAt=0;
  function act(isTap,isMove){
    /* throttle gerak pasif (mousemove/scroll/wheel): jangan refresh lastAct di dalam window
       supaya SIGNAL DECAY / SILENT tetap bisa tembak saat user diam baca lirik */
    if(isMove){
      var n=Date.now();
      if(n-actMoveAt<3000)return;
      actMoveAt=n;
    }
    lastAct=Date.now();idleFired=false;
    if(isTap){
      sessTaps++;
      st.taps=(st.taps||0)+1;
      st.lastInterruption=st.taps;
      if(sessTaps%7===0)save();
    }
    if(sigDecay>0&&(isTap||!isMove)){
      sigDecay=0;
      log('SIGNAL RESTORED.',true);
    }else if(sigDecay>0&&isMove){
      /* gerak pasif (di luar throttle) mereset decay stage tanpa toast */
      sigDecay=0;
    }
    if(!obsDetected){
      obsDetected=true;
      setObs('DETECTED',false); /* indikator saja: 'LISTENER DETECTED' sudah jadi toast pembuka */
      setTimeout(function(){if(obsState==='DETECTED')setObs('ACTIVE',false);},1800);
    }else if(obsState==='SILENT'||obsState==='YOU'||obsState==='RETURNED'){
      /* ACTIVE tanpa toast; cooldown supaya gak bolak-balik ke SILENT */
      obsSilentCool=Date.now()+8000;
      setObs('ACTIVE',obsState==='RETURNED');
    }
  }
  /* pointerdown saja: touchstart ikut nembak di HP -> tap kehitung dobel. isTrusted: abaikan event sintetis. */
  window.addEventListener('pointerdown',function(e){
    if(!e.isTrusted)return;
    if(!seen){seen=true;log('LISTENER DETECTED');}
    act(true,false);
  },{passive:true,capture:true});
  ['keydown'].forEach(function(ev){
    window.addEventListener(ev,function(){
      if(!seen){seen=true;log('LISTENER DETECTED');}
      act(false,false);
    },{passive:true,capture:true});
  });
  ['wheel','mousemove','scroll'].forEach(function(ev){
    window.addEventListener(ev,function(){
      if(!seen){seen=true;log('LISTENER DETECTED');}
      act(false,true);
    },{passive:true,capture:true});
  });
  /* long-idle narrative — setelah decay stage penuh (130s) supaya tidak bertumpuk dengan WEAKENING/FADING */
  function idleTick(){
    setTimeout(idleTick,8000);
    narrFree();
    if(document.hidden||idleFired||narrBusy||nullBusy||conflictBusy||bugBusy)return;
    if(Date.now()-lastAct<140000)return; /* ≥140s: melewati decay stage 4 @ 130s */
    if(sigDecay>0&&sigDecay<4)return; /* tunggu decay selesai / di-restore dulu */
    idleFired=true;
    narrLock(5000);
    pair('USER STILL HERE','WHY',1400);
  }
  setTimeout(idleTick,8000);
  document.addEventListener('visibilitychange',function(){
    if(document.hidden){
      hiddenAt=Date.now();
      setObs('ABSENT',true);
      /* persist memory fragment on leave */
      try{snapFrag();}catch(e){}
      return;
    }
    if(hiddenAt){
      var away=Date.now()-hiddenAt;
      setObs('RETURNED',true);
      if(away>15000&&Math.random()<0.3){
        log('SESSION TERMINATED',true);log('...',true);
        setTimeout(function(){log('NOT REALLY',true);},1000);
      }
      setTimeout(function(){if(obsState==='RETURNED')setObs('ACTIVE',false);},2400);
    }
    hiddenAt=0;act(false);
  });
  window.addEventListener('pagehide',function(){
    try{snapFrag();}catch(e){}
  });
  setTimeout(function(){log('SIGNAL FOUND');},700);
  /* indikator idle awal — menunggu deteksi */
  setTimeout(function(){if(!obsDetected){obsEl.textContent='OBSERVER: —';obsEl.classList.add('on');placeObs();}},900);

  /* ---------- TIME LOST (dwell) ---------- */
  var dwellVisible=0,visStart=document.hidden?0:Date.now(),timeLostShown=false,dwellMilestone=false;
  /* hereMark: jam mulai hitung TIME HERE (visible, atau hidden tapi audio masih main). sessL: ms didengar di sesi ini. */
  var hereMark=document.hidden?0:Date.now(),sessL=0;
  function flushHere(){if(hereMark){var n=Date.now();pH+=Math.max(0,n-hereMark);hereMark=n;}}
  function audioOn(){var P=window.__dmPlayer;return !!(P&&P.audio&&!P.audio.paused&&!P.audio.ended);}
  function fmtHMS(ms){
    ms=Math.max(0,Math.floor(+ms||0));
    var s=Math.floor(ms/1000),h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=s%60;
    function p(n){return n<10?'0'+n:''+n;}
    return p(h)+':'+p(m)+':'+p(sec);
  }
  function fmtMS(ms){
    ms=Math.max(0,Math.floor(+ms||0));
    var s=Math.floor(ms/1000),m=Math.floor(s/60),sec=s%60;
    function p(n){return n<10?'0'+n:''+n;}
    return p(m)+':'+p(sec);
  }
  /* dwell = akumulasi waktu tab visible saja (bukan jam dinding) */
  function dwellNow(){
    return dwellVisible+(visStart?Date.now()-visStart:0);
  }
  function persistDwell(){
    st.lastDwell=dwellNow();
    save(); /* save() sudah flush TIME HERE & menambahkannya ke total */
  }
  /* TIME LOST = TIME HERE − TIME LISTENED (akumulasi semua kunjungan sebelum ini):
     waktu kamu ada di sini tapi tidak mendengarkan. Panel log: 3 baris; toast: baris TIME LOST saja. */
  (function(){
    var H=prev.tHere,L=Math.min(prev.tListen,H),lost=Math.max(0,H-L);
    if(H<60000)return;
    setTimeout(function(){
      log('TIME HERE      '+fmtHMS(H),false,true);
      log('TIME LISTENED  '+fmtHMS(L),false,true);
      log('TIME LOST      '+fmtHMS(lost),true);
      /* total durasi album dari durasi yang pernah terekam; hanya kalau semua lagu sudah diketahui */
      var tot=0,ok=true;
      trackList().forEach(function(n){var r=prev.tr[slugT(n)];if(r&&r.d>0)tot+=r.d;else ok=false;});
      if(ok&&tot>0&&prev.tListen/1000>=tot){
        setTimeout(function(){log('YOU HAVE HEARD THIS ALBUM '+(prev.tListen/1000/tot).toFixed(1)+' TIMES.',true);},2600);
      }
    },3200);
  })();
  /* milestone ~20 menit */
  function dwellTick(){
    setTimeout(dwellTick,15000);
    if(document.hidden)return;
    var d=dwellNow();
    persistDwell();
    narrFree();
    /* jangan tumpuk di atas NULL/CONFLICT/BUG/idle narrative */
    if(narrBusy||nullBusy||conflictBusy||bugBusy)return;
    if(!dwellMilestone&&d>=20*60*1000){
      dwellMilestone=true;
      narrLock(4000);
      if(Math.random()<0.55){
        log('YOU HAVE BEEN HERE FOR '+fmtMS(d)+'.',true);
        setTimeout(function(){log('DID YOU NOTICE?',true);},2200);
      }else{
        log('TIME LOST: '+fmtHMS(Math.max(0,d-sessL)),true); /* sesi ini: ada di sini − mendengarkan */
      }
    }
    /* soft reminders tiap ~15 menit setelah milestone, jarang */
    else if(dwellMilestone&&d>=35*60*1000&&!timeLostShown&&Math.random()<0.08){
      timeLostShown=true;
      narrLock(2800);
      log('TIME LOST: '+fmtHMS(Math.max(0,d-sessL)),true);
    }
  }
  setTimeout(dwellTick,12000);
  /* pastikan dwell tersimpan saat leave (sudah ada pagehide fragment — tambah dwell) */
  var _ph=window.onpagehide;
  /* augment existing pagehide via additional listener (already have one above — this is fine, multiple ok) */
  window.addEventListener('pagehide',persistDwell);
  document.addEventListener('visibilitychange',function(){
    if(document.hidden){
      if(visStart){dwellVisible+=Date.now()-visStart;visStart=0;}
      persistDwell();
      if(!audioOn())hereMark=0; /* musik masih main di background → TIME HERE tetap jalan */
    }else{
      if(!visStart)visStart=Date.now();
      if(!hereMark)hereMark=Date.now();
    }
  });

  /* ---------- NULL STATE (semantic glitch, sporadis) ---------- */
  var nullPrevObs='';
  function nullSequence(){
    narrFree();
    if(nullBusy||document.hidden||conflictBusy||bugBusy||narrBusy)return;
    nullBusy=true;narrLock(6000);
    nullPrevObs=obsState||'';
    var steps=[
      [0,'SIGNAL: NULL',true],
      [900,'MEMORY: NULL',true],
      [1800,'OBSERVER: NULL',true],
      [2800,'...',false],
      [4200,null,false] /* restore */
    ];
    steps.forEach(function(step){
      setTimeout(function(){
        if(step[1]===null){
          /* kembali normal tanpa penjelasan */
          if(nullPrevObs&&nullPrevObs!=='ABSENT')setObs(nullPrevObs,false);
          else if(obsDetected)setObs('ACTIVE',false);
          else{obsEl.textContent='OBSERVER: —';obsEl.removeAttribute('data-st');placeObs();}
          nullBusy=false;
          return;
        }
        log(step[1],step[2]);
        if(step[1]==='OBSERVER: NULL'){
          obsEl.textContent='OBSERVER: NULL';
          obsEl.setAttribute('data-st','YOU');
          obsEl.classList.add('on');
          obsState='NULL';
          placeObs();
        }
      },step[0]);
    });
  }
  function nullSchedule(){
    /* jadwal berikutnya: 45s–3.5 menit, peluang tembak ~18% */
    var wait=45000+Math.floor(Math.random()*165000);
    setTimeout(function(){
      if(!document.hidden&&Math.random()<0.18)nullSequence();
      nullSchedule();
    },wait);
  }
  setTimeout(nullSchedule,25000);

  /* ---------- SIGNAL DECAY (idle panjang, timer + state only) ---------- */
  var decayLabels=['','SIGNAL: STABLE','SIGNAL: WEAKENING','SIGNAL: FADING','SIGNAL: ...'];
  var decayAt=[0,40000,70000,100000,130000]; /* ms idle thresholds */
  function decayTick(){
    setTimeout(decayTick,4000);
    narrFree();
    if(document.hidden||nullBusy||conflictBusy||bugBusy||narrBusy)return;
    var idle=Date.now()-lastAct;
    var stage=0;
    for(var i=decayAt.length-1;i>=1;i--){
      if(idle>=decayAt[i]){stage=i;break;}
    }
    if(stage>sigDecay){
      sigDecay=stage;
      narrLock(2800);
      log(decayLabels[stage],stage>=3);
    }
  }
  setTimeout(decayTick,8000);

  /* ---------- REFLECTION ERROR (aksi berulang → komentar psikologis) ---------- */
  var refl={kind:'',count:0,last:0};
  function reflect(kind){
    if(!kind)return;
    /* hormati narrasi aktif (NULL/CONFLICT/BUG/idle/decay) supaya tidak numpuk */
    narrFree();
    if(narrBusy||nullBusy||conflictBusy||bugBusy)return;
    var now=Date.now();
    if(kind===refl.kind&&now-refl.last<14000)refl.count++;
    else{refl.kind=kind;refl.count=1;}
    refl.last=now;
    var c=refl.count;
    /* track/pp sudah dapat TRACK CHANGED / MEMORY ACCESSED — jangan dobel di awal */
    var soft=(kind==='track'||kind==='tracklink'||kind==='pp');
    if(soft){
      if(c===4)log('YOU KEEP CHECKING.',true);
      else if(c===5)log('WHY?',true);
      else if(c===6)log('...',true);
      else if(c===9)log('THIS WON\'T CHANGE ANYTHING.',true);
      else if(c===12)log('STILL WATCHING.',true);
      return;
    }
    if(c===1||c===2)log('SIGNAL RECEIVED.');
    else if(c===3)log('YOU KEEP CHECKING.',true);
    else if(c===4)log('WHY?',true);
    else if(c===5)log('...',true);
    else if(c===7)log('THIS WON\'T CHANGE ANYTHING.',true);
    else if(c===10)log('STILL WATCHING.',true);
    else if(c===14)log('OK.',true);
  }
  /* owl = cek session log berulang */
  owl.addEventListener('click',function(){reflect('owl');},true);
  /* player controls + track rows (delegasi, non-destruktif) */
  document.addEventListener('click',function(e){
    var t=e.target;if(!t||!t.closest)return;
    if(t.closest('#dm-pp'))reflect('pp');
    else if(t.closest('#dm-next'))reflect('next');
    else if(t.closest('#dm-prev'))reflect('prev');
    else if(t.closest('#dm-help'))reflect('help');
    else if(t.closest('[class*="space-y-[1px]"] > div'))reflect('track');
    else if(t.closest('.dm-tracklink'))reflect('tracklink');
    else if(t.closest('#dm-seek,[role="slider"]'))reflect('seek');
  },true);
  /* reset rantai refleksi setelah idle */
  setInterval(function(){
    if(refl.count&&Date.now()-refl.last>16000){refl.kind='';refl.count=0;}
  },5000);

  /* ---------- STATE CONTRADICTION (semantic, sporadis) ---------- */
  var conflictSets=[
    ['SIGNAL: ACTIVE','MEMORY: LOST','OBSERVER: ABSENT','SYSTEM: AWAKE'],
    ['OBSERVER: ABSENT','OBSERVATION: ACTIVE'],
    ['SIGNAL: STABLE','SIGNAL: FADING'],
    ['MEMORY: PRESENT','MEMORY: NULL','OBSERVER: YOU'],
    ['SYSTEM: ASLEEP','OBSERVER: ACTIVE','SIGNAL: AWAKE']
  ];
  function conflictSequence(){
    narrFree();
    if(conflictBusy||document.hidden||nullBusy||bugBusy||narrBusy)return;
    conflictBusy=true;narrLock(7000);
    var set=conflictSets[Math.floor(Math.random()*conflictSets.length)];
    var t0=0;
    set.forEach(function(line,i){
      setTimeout(function(){log(line,true);},t0);
      t0+=850;
    });
    setTimeout(function(){log('STATE CONFLICT.',true);},t0+400);
    setTimeout(function(){conflictBusy=false;},t0+2000);
  }
  function conflictSchedule(){
    var wait=70000+Math.floor(Math.random()*150000);
    setTimeout(function(){
      if(!document.hidden&&Math.random()<0.22)conflictSequence();
      conflictSchedule();
    },wait);
  }
  setTimeout(conflictSchedule,55000);

  /* ---------- THE BUG THAT ISN'T A BUG ---------- */
  var bugScripts=[
    function(){
      log('WARNING:',true);
      setTimeout(function(){log('EXPECTED BEHAVIOR NOT FOUND.',true);},900);
    },
    function(){
      log('ERROR 0x00000000',true);
      setTimeout(function(){log('CAUSE: UNKNOWN');},800);
      setTimeout(function(){log('STATUS: NORMAL');},1600);
    },
    function(){
      log('NO ERROR DETECTED.',true);
      setTimeout(function(){log('ERROR: USER LOOKING FOR ERROR.',true);},1100);
    },
    function(){
      log('EXCEPTION IN OBSERVER',true);
      setTimeout(function(){log('STACK: [redacted]');},900);
      setTimeout(function(){log('CONTINUE ANYWAY.');},1800);
    }
  ];
  function bugSequence(){
    narrFree();
    if(bugBusy||document.hidden||nullBusy||conflictBusy||narrBusy)return;
    bugBusy=true;narrLock(5500);
    var fn=bugScripts[Math.floor(Math.random()*bugScripts.length)];
    fn();
    setTimeout(function(){bugBusy=false;},4500);
  }
  function bugSchedule(){
    var wait=90000+Math.floor(Math.random()*180000);
    setTimeout(function(){
      if(!document.hidden&&Math.random()<0.16)bugSequence();
      bugSchedule();
    },wait);
  }
  setTimeout(bugSchedule,80000);
  /* refresh after fake "EXPECTED BEHAVIOR NOT FOUND" → soft callback on visibility if flagged */
  var expectBehavior=false;
  var _bugLog=log;
  /* patch: when WARNING path fires, mark flag; on return show BEHAVIOR FOUND */
  var origBug0=bugScripts[0];
  bugScripts[0]=function(){
    expectBehavior=true;
    origBug0();
  };
  document.addEventListener('visibilitychange',function(){
    if(!document.hidden&&expectBehavior){
      expectBehavior=false;
      setTimeout(function(){log('BEHAVIOR FOUND.',true);},600);
    }
  });

  /* ---------- TRACK MEMORY (jejak digital, bukan chart) ---------- */
  var traceShown=false;
  function rep(ch,n){return n>0?Array(n+1).join(ch):'';}
  /* Bar = ingatan per lagu, dari data asli:
     ■ panjang = sejauh mana kamu benar-benar mendengar (min(posisi terjauh, total didengar) / durasi)
     ▒░ = titik kamu berhenti, sisanya belum didengar
     □ = bagian yang memudar karena lama tidak didengar (maks 75%, tidak pernah hilang total)
     ×N = berapa kali diputar · · = belum pernah · ▒▒▒▒▒▒▒▒ = jejak lama tanpa data (versi sebelumnya) */
  function barsFor(name){
    var N=8,r=st.tr[slugT(name)];
    if(!r||!(r.l>=5))return playedIdx(st.tracksPlayed,name)>=0?rep('▒',N):'·';
    var d=r.d>0?r.d:0,cov=Math.min(r.f||0,r.l||0);
    var done=d>0&&r.f>=d-2&&r.l>=d*0.8;
    var n=done||!d?N:Math.max(1,Math.min(N,Math.round(cov/d*N)));
    var age=(Date.now()-(r.ts||Date.now()))/864e5; /* hari sejak terakhir didengar */
    var k=Math.floor(n*Math.min(0.75,age/12));
    var out=rep('■',n-k)+rep('□',k);
    if(n<N)out+='▒'+rep('░',N-n-1);
    if(r.p>1)out+='  ×'+r.p;
    return out;
  }
  function shortName(t){
    return String(t||'').replace(/\s*\(Instrumental\)/i,' (INSTRU)').replace(/\s+/g,' ').trim().toUpperCase().slice(0,15);
  }
  function showMemoryTrace(){
    if(!st.tracksPlayed.length&&!Object.keys(st.tr).length)return;
    log('MEMORY TRACE',true);
    var delay=900;
    trackList().forEach(function(name){
      var label=shortName(name);
      setTimeout(function(){log(label+rep(' ',Math.max(1,17-label.length))+barsFor(name),false);},delay);
      delay+=700;
    });
  }
  function checkAllObserved(){
    if(allObservedLogged)return;
    if(allObserved(st.tracksPlayed)){
      allObservedLogged=true;
      setTimeout(function(){log('ALL SIGNALS HAVE BEEN OBSERVED.',true);},400);
    }
  }
  /* tampilkan TRACE sekali per sesi saat buka owl (kalau sudah ada jejak) */
  owl.addEventListener('click',function(){
    if(traceShown||Math.max(st.tracksPlayed.length,Object.keys(st.tr).length)<2)return;
    if(box.classList.contains('open'))return; /* will open */
    setTimeout(function(){
      if(!box.classList.contains('open'))return;
      traceShown=true;
      showMemoryTrace();
      checkAllObserved();
    },300);
  },true);

  /* ---------- DUMBOWL DENIAL ---------- */
  var denyStep=0,denyLast=0;
  function dumbowlDeny(){
    var now=Date.now();
    if(now-denyLast>20000)denyStep=0;
    denyLast=now;
    denyStep++;
    if(denyStep===1)log('PROTOCOL NOT FOUND.',true);
    else if(denyStep===2)log('THERE IS NO OWL HERE.',true);
    else if(denyStep===3)log('STOP LOOKING.',true);
    else if(denyStep===4)log('...',true);
    else{log('the owl knows.',true);denyStep=0;}
  }
  window.__dmDumbowl=function(found){
    /* dipanggil dari signal deck saat ketik "dumul" */
    if(found){
      if(!st.dumbowl){st.dumbowl=1;save();log('PROTOCOL ACKNOWLEDGED.',true);}
      return false; /* first discovery / allow effect */
    }
    if(st.dumbowl||prev.dumbowl){dumbowlDeny();return true;} /* deny = block normal effect */
    return false;
  };
  /* kalau sudah pernah discover, coba ketik dumul lagi → denial */
  /* signal deck akan cek __dmDumbowl */

  /* ---------- hook player: MEMORY ACCESSED / TRACK CHANGED / album remembers ---------- */
  function hook(tries){
    var P=window.__dmPlayer;
    if(!P||!P.audio){if(tries<40)setTimeout(function(){hook(tries+1);},250);return;}
    var a=P.audio,shown='',first=true,marked='',obsA=false,obsB=false,sigSaveAt=0,lastC=-1,lastT='';
    function persistFrag(){snapFrag();}
    function trRec(t){var k=slugT(t);if(!k)return null;return st.tr[k]||(st.tr[k]={l:0,f:0,d:0,p:0,ts:0});}
    /* posisi pembanding untuk menghitung waktu dengar: dibuang saat seek/pause/ganti lagu supaya scrub tidak dihitung sebagai "didengar" */
    ['seeking','pause','loadstart'].forEach(function(ev){a.addEventListener(ev,function(){lastC=-1;});});
    a.addEventListener('seeked',function(){lastC=a.currentTime||0;});
    a.addEventListener('play',function(){
      if(!hereMark)hereMark=Date.now(); /* audio main di background → TIME HERE tetap jalan */
      var t=P.title();if(!t)return;
      if(t!==shown){
        if(first){log('MEMORY ACCESSED');first=false;}
        else log('TRACK CHANGED');
        narrLock(2000);
        shown=t;obsA=obsB=false;
        st.lastObserved=String(t).replace(/\s+/g,' ').trim().slice(0,40);
        save();
      }
    });
    a.addEventListener('pause',function(){
      if(!a.ended)persistFrag();
      if(document.hidden){flushHere();hereMark=0;save();} /* tab hidden + audio berhenti → stop hitung */
    });
    a.addEventListener('ended',function(){
      /* handler player sudah memindah current ke lagu berikutnya, jadi pakai judul yang terakhir dicatat (lastT) */
      var r=lastT?trRec(lastT):null;
      if(r){if(r.d>0)r.f=r.d;r.ts=Date.now();}
      if(lastT){st.lastObserved=String(lastT).replace(/\s+/g,' ').trim().slice(0,40);st.lastTrack=String(lastT).slice(0,60);st.lastPos=-1;st.lastSignal='END';st.lastTs=Date.now();}
      marked='';lastC=-1;
      save();
    });
    a.addEventListener('timeupdate',function(){
      var t=P.title(),c=a.currentTime||0;
      var rec=(t&&!a.paused)?trRec(t):null;
      if(rec){
        lastT=t;
        if(isFinite(a.duration)&&a.duration>0)rec.d=Math.round(a.duration);
        if(lastC>=0){
          var dd=c-lastC;
          if(dd>0&&dd<6){rec.l+=dd;pL+=dd*1000;sessL+=dd*1000;if(c>rec.f)rec.f=c;}
        }else if(c>rec.f&&c<=1)rec.f=c;
        lastC=c;rec.ts=Date.now();
      }
      /* track dianggap "sudah didengar" setelah 20 detik; p = berapa kali diputar */
      if(t&&c>=20&&marked!==t){
        marked=t;
        var r2=trRec(t);if(r2)r2.p++;
        if(st.tracksPlayed.indexOf(t)<0){st.tracksPlayed.push(t);save();checkAllObserved();}
      }
      /* autosave signal position ~ tiap 8 detik */
      var n=Date.now();
      if(n-sigSaveAt>8000){sigSaveAt=n;snapFrag();}
      /* sinkron dengan catatan Glitch (Instrumental): "Something is already watching..." */
      if(/instrumental/i.test(t||'')){
        if(!obsA&&c>=212&&c<226){obsA=true;narrFree();var qa=!narrBusy;if(qa)narrLock(4000);setObs('DETECTED',qa);}
        if(!obsB&&c>=218&&c<232){obsB=true;narrFree();var qb=!narrBusy;if(qb)narrLock(4000);setObs('YOU',qb);}
      }
    });
  }
  hook(0);
})();
}catch(e){console.error(e)}

try{
(function(){
  var root=document.documentElement;
  function q(id){return document.getElementById(id);}
  function A(){return window.__dmA;}
  function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v);}catch(e){}return null;}
  var reduce=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
  function ss(k,v){try{if(v===undefined)return sessionStorage.getItem(k);sessionStorage.setItem(k,v);}catch(e){}return null;}
  /* Fresh open = full visuals. Low-power hanya kalau dipilih manual (berlaku selama sesi tab) atau auto-lighten dinyalakan. */
  var lowPref=ss('dm_lowfx'),auto=false,autoGov=ls('dm_autogov')==='1',hap=ls('dm_haptic')==='1';
  var ROWS='[class*="space-y-[1px]"] > div';
  var chips={};

  function toast(m){
    try{if(window.__dmToast){window.__dmToast(m,false,3000,'ui');return;}}catch(e){}
    (window.__dmToastPending=window.__dmToastPending||[]).push([m,3000]);
  }

  /* ---------- mode hemat daya ---------- */
  function isLow(){return lowPref==='1'||(lowPref!=='0'&&auto);}
  function sync(){
    if(chips.fx)chips.fx.setAttribute('aria-pressed',isLow()?'true':'false');
    if(chips.hap)chips.hap.setAttribute('aria-pressed',hap?'true':'false');
    if(chips.gov)chips.gov.setAttribute('aria-pressed',autoGov?'true':'false');
  }
  function applyFx(){
    var low=isLow();
    root.classList.toggle('dm-lowfx',low);
    root.classList.toggle('dm-fx',!low&&!reduce);
    sync();
  }

  /* ---------- chip di Track Notes ---------- */
  function chip(k,label,pressed,fn){
    var b=document.createElement('button');
    b.type='button';b.className='dm-chip';b.textContent=label;
    if(pressed!==null)b.setAttribute('aria-pressed',pressed?'true':'false');
    b.addEventListener('click',fn);chips[k]=b;return b;
  }
  var hasKb=!!(window.matchMedia&&matchMedia('(hover:hover) and (pointer:fine)').matches);
  var notes=q('dm-notes');
  if(notes){
    var deck=document.createElement('div');
    deck.id='dm-deck';deck.setAttribute('role','group');deck.setAttribute('aria-label','Display and playback options');
    deck.appendChild(chip('fx','Low-power visuals',false,function(){
      lowPref=isLow()?'0':'1';ss('dm_lowfx',lowPref);auto=false;applyFx();
      toast(isLow()?'Low-power visuals on':'Full visuals on');
    }));
    deck.appendChild(chip('gov','Auto-lighten when laggy',autoGov,function(){
      autoGov=!autoGov;ls('dm_autogov',autoGov?'1':'0');sync();
      toast(autoGov?'Auto-lighten on':'Auto-lighten off (always full visuals)');
    }));
    if(navigator.vibrate)deck.appendChild(chip('hap','Haptic bass',hap,function(){
      hap=!hap;ls('dm_haptic',hap?'1':'0');sync();
      if(!hap){toast('Haptic bass off');return;}
      var ok=false;try{ok=navigator.vibrate([60,80,60]);}catch(e){}
      toast(ok?'Haptic bass on. You should feel two buzzes now':'Vibration blocked. Check Android vibration / battery saver settings');
    }));
    notes.appendChild(deck);
  }

  /* ---------- panel pintasan ---------- */
  var ov=document.createElement('div');
  ov.id='dm-keys';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-label','Keyboard shortcuts');
  ov.innerHTML='<div class="dm-kp"><h3>Keyboard shortcuts</h3><dl>'+
    '<dt><kbd>Space</kbd></dt><dd>Play / pause</dd>'+
    '<dt><kbd>N</kbd> <kbd>P</kbd></dt><dd>Next / previous track</dd>'+
    '<dt><kbd>\u2190</kbd> <kbd>\u2192</kbd></dt><dd>Seek 5 seconds</dd>'+
    '<dt><kbd>1</kbd>\u2013<kbd>5</kbd></dt><dd>Jump to track</dd>'+
    '<dt><kbd>?</kbd></dt><dd>This panel</dd></dl></div>';
  document.body.appendChild(ov);
  var lastFocus=null;
  function keys(open){
    if(open){lastFocus=document.activeElement;ov.classList.add('on');ov.tabIndex=-1;ov.focus();}
    else{ov.classList.remove('on');if(lastFocus&&lastFocus.focus)lastFocus.focus();}
  }
  ov.addEventListener('click',function(){keys(false);});
  if(hasKb){
    var hb=document.createElement('button');
    hb.id='dm-help';hb.type='button';hb.textContent='?';hb.setAttribute('aria-label','Keyboard shortcuts');hb.title='Keyboard shortcuts';
    hb.addEventListener('click',function(){keys(true);});
    document.body.appendChild(hb);
  }

  /* ---------- keyboard ---------- */
  var typed='';
  function barOn(){var b=q('dm-bar');return !!(b&&b.classList.contains('dm-show'));}
  function press(id){var el=q(id);if(el)el.click();}
  document.addEventListener('keydown',function(e){
    if(e.ctrlKey||e.metaKey||e.altKey||e.defaultPrevented)return;
    var t=e.target,tag=t&&t.tagName;
    if(tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT'||(t&&t.isContentEditable))return;
    var k=e.key;
    if(ov.classList.contains('on')){
      if(k==='Escape'||k==='?'||k==='Enter'||k===' '){keys(false);e.preventDefault();}
      return;
    }
    if(k==='?'){keys(true);e.preventDefault();return;}
    if(k&&k.length===1){
      typed=(typed+k.toLowerCase()).slice(-5);
      if(typed==='dumul'){
        typed='';
        try{
          var known=false;
          try{var raw=localStorage.getItem('dm_album');if(raw){var o=JSON.parse(raw);known=!!(o&&o.dumbowl);}}catch(e1){}
          if(known&&window.__dmDumbowl){window.__dmDumbowl(false);return;}
          if(window.__dmDumbowl)window.__dmDumbowl(true);
        }catch(e2){}
        var h=document.querySelector('h1.display');
        if(h){if(window.__dmGlitch)window.__dmGlitch(h);toast('signal locked');}
      }
    }
    var digit=/^[1-9]$/.test(k)&&+k<=document.querySelectorAll(ROWS).length;
    if(!digit&&!barOn())return;
    var interactive=t&&t.closest&&t.closest('button,a,[role="slider"],[role="button"],[tabindex]');
    if(k===' '){if(interactive)return;press('dm-pp');e.preventDefault();}
    else if(k==='n'||k==='N')press('dm-next');
    else if(k==='p'||k==='P')press('dm-prev');
    else if(k==='ArrowRight'||k==='ArrowLeft'){
      if(interactive)return;
      var sk=q('dm-seek');
      if(sk){sk.dispatchEvent(new KeyboardEvent('keydown',{key:k,bubbles:true,cancelable:true}));e.preventDefault();}
    }
    else if(digit){
      var r=document.querySelectorAll(ROWS)[+k-1];
      if(r){r.click();e.preventDefault();}
    }
  });

  /* ---------- warna address bar per lagu ---------- */
  var TINT={'glitch':'#170f20','glitch-instrumental':'#0b1a24','limerence':'#0e1b2a','nastenka':'#0b1424','larung':'#150f22'};
  var meta=document.querySelector('meta[name="theme-color"]'),sigNow='';
  function tint(){
    var a=A(),s=(a&&a.sig)||'default';
    if(s===sigNow)return;
    sigNow=s;if(meta)meta.setAttribute('content',TINT[s]||'#0a1218');
  }

  /* ---------- loop ringan: hanya jalan saat musik main & tab terlihat ---------- */
  var raf=0,last=0,acc=0,frames=0,bad=0,lastBeat=0,tickN=0,startedAt=0,prev='',hEl=null,bEl=null;
  function playing(){var p=q('dm-pp');return !!(p&&p.classList.contains('dm-on'));}
  function setBeat(v){
    var s=v.toFixed(2);if(s===prev)return;prev=s;
    if(!hEl||!hEl.isConnected)hEl=document.querySelector('h1.display');
    if(!bEl||!bEl.isConnected)bEl=q('dm-bar');
    if(hEl)hEl.style.setProperty('--dm-beat',s);
    if(bEl)bEl.style.setProperty('--dm-beat',s);
  }
  function tick(now){
    raf=0;
    var p=playing(),a=A();
    var b=(a&&a.beatAt&&p)?Math.max(0,1-(now-a.beatAt)/320):0;
    if(root.classList.contains('dm-fx'))setBeat(b);
    if(hap&&p&&a&&a.beatAt&&a.beatAt!==lastBeat){
      lastBeat=a.beatAt;
      if(now-(window.__dmLV||0)>130){
        window.__dmLV=now;
        var st=a.beatStr||.5,kind=a.beatKind||'kick';
        try{
          if(kind==='snare'){
            /* snare: short sharp click */
            var sn=Math.round(12+st*18);
            navigator.vibrate(sn);
          }else{
            /* kick: deeper pulse — longer first hit, optional second thump */
            var k1=Math.round(28+st*42),k2=Math.round(14+st*22);
            navigator.vibrate(st>.55?[k1,38,k2]:k1);
          }
        }catch(e){}
      }
    }
    if(((++tickN)&15)===0)tint();
    /* governor: 2 jendela x 2.5 detik di bawah 40fps (setelah 4 detik pemanasan) => hemat daya otomatis */
    if(p&&last&&now-startedAt>4000){
      var dt=now-last;
      if(dt<250){
        acc+=dt;frames++;
        if(acc>=2500){
          bad=(frames*1000/acc<40)?bad+1:0;acc=0;frames=0;
          if(bad>=2&&autoGov&&lowPref===null&&!auto){auto=true;applyFx();toast('Visuals lightened to keep playback smooth');}
        }
      }
    }
    last=now;
    if(p&&!document.hidden)raf=requestAnimationFrame(tick);
    else{setBeat(0);last=0;acc=0;frames=0;}
  }
  function kick(){
    if(raf||document.hidden||!playing())return;
    last=0;acc=0;frames=0;bad=0;startedAt=performance.now();tint();
    raf=requestAnimationFrame(tick);
  }
  var pp=q('dm-pp');
  if(pp)new MutationObserver(kick).observe(pp,{attributes:true,attributeFilter:['class']});
  document.addEventListener('visibilitychange',function(){
    if(document.hidden){if(raf){cancelAnimationFrame(raf);raf=0;}}
    else kick();
  });

  applyFx();
  kick();
})();
}catch(e){console.error(e)}
