'use strict';
/* 00-rain.js — hujan matrix boot dijalankan SEDINI mungkin — di Worker (OffscreenCanvas), mulai saat HTML diparse, sebelum script defer (three.js dll) menyumbat main thread. 07-boot.js hanya mengambil alih lewat window.__rain.kill() saat masuk observatory. Fallback main thread kalau Worker/OffscreenCanvas tak didukung. Knob ada di objek MX di bawah. */
(function(){
  var mx=document.getElementById('boot-matrix');
  if(!mx)return;
  var reduce=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
  if(reduce)return;
  /* sama dgn aturan di 01-core.js: ?perf= (tes) > localStorage.dumul_quality > HIGH */
  var IS_POTATO=false;
  try{
    var _pf=/[?&]perf=(high|low)/.exec(location.search);
    if(_pf){IS_POTATO=_pf[1]==='low';}
    else{var _qs=null;try{_qs=localStorage.getItem('dumul_quality');}catch(eQ){}if(_qs==='low')IS_POTATO=true;}
  }catch(eP){}
  /* ---- Mesin hujan matrix: SATU kode, dua jalur — Worker + OffscreenCanvas (mulus walau main thread macet saat loading) atau main thread (fallback).
     SELF-CONTAINED: jangan pakai variabel di luar fungsi ini, karena fungsi ini di-toString() ke Worker. ---- */
  function makeRain(mk,raf,caf,now,cfg){
    var PAL=cfg.pal,G=Array.from(cfg.glyphs),NG=G.length,POT=cfg.potato,K=cfg.k,SOFT=cfg.soft;
    var cv=null,cx=null,cols=[],lfs=[],atlas=null,atlasKey='',cell=0,pad=0,dprM=1,vw=0,vh=0,baseFont=11;
    var alive=false,rafId=0,last=0,t0=0;
    /* Depth layers: far (slow + faint) → mid → near (fast + bright). */
    var LAYERS=[
      {depth:0.28,speedMul:0.32,alphaMul:0.28,fontScale:0.70,countMul:1.25},
      {depth:0.58,speedMul:0.62,alphaMul:0.55,fontScale:0.90,countMul:0.95},
      {depth:0.92,speedMul:1.05,alphaMul:0.95,fontScale:1.10,countMul:0.65}
    ];
    /* Alpha per baris (j=0 kepala), sekali per layer; warna dari sprite atlas. */
    var ALPHA=LAYERS.map(function(L){
      var aMul=L.alphaMul,near=L.depth>=0.7,t=new Float32Array(32);
      for(var j=0;j<32;j++){
        if(j===0)t[j]=near?aMul:0.7*aMul*0.85;
        else if(j===1)t[j]=0.85*aMul*0.9;
        else if(j<5)t[j]=Math.max(0.04,(0.78-j*0.09)*aMul);
        else t[j]=Math.max(0.03,(0.42-(j-5)*0.028)*aMul)*(0.45+0.2*L.depth);
      }
      return t;
    });
    function rg(){return (Math.random()*NG)|0;}
    function pickSpeed(L){return ((POT?0.38:0.52)+Math.random()*(POT?0.55:0.85))*L.speedMul;}
    function pickLen(){return 8+((Math.random()*(POT?14:22))|0);}
    /* Atlas sprite: tiap (layer, warna) satu baris, tiap glyph satu sel. fillText hanya jalan di sini; per frame tinggal drawImage. */
    function buildAtlas(){
      var key=baseFont+'|'+dprM;
      if(atlas&&atlasKey===key)return;
      atlasKey=key;
      var fsMax=Math.max.apply(null,lfs);
      cell=Math.ceil(fsMax*dprM*1.35)+2;pad=Math.ceil(cell*0.1);
      atlas=mk();atlas.width=NG*cell;atlas.height=LAYERS.length*8*cell;
      var a=atlas.getContext('2d');
      a.textAlign='center';a.textBaseline='top';
      for(var li=0;li<LAYERS.length;li++){
        a.font=(lfs[li]*dprM)+'px "Courier New",monospace';
        for(var ci=0;ci<8;ci++){
          if(ci===7&&LAYERS[li].depth<0.7)continue;
          a.fillStyle=ci===7?'#ffffff':'rgb('+PAL[ci].r+','+PAL[ci].g+','+PAL[ci].b+')';
          var y=(li*8+ci)*cell+pad;
          for(var g=0;g<NG;g++)a.fillText(G[g],g*cell+cell/2,y);
        }
      }
    }
    function makeStream(li,w,h,midway){
      var L=LAYERS[li],len=pickLen(),chars=new Uint8Array(len);
      for(var j=0;j<len;j++)chars[j]=rg();
      return {
        y:midway?(Math.random()*h*1.15-h*0.15):(Math.random()*-h*1.2),
        speed:pickSpeed(L),len:len,chars:chars,head:0,
        mt:Math.random()*K.mutMs,sh:Math.random()*(K.shiftMs||1),
        ci:(Math.random()*PAL.length)|0,li:li,layer:L,fs:lfs[li],x:Math.random()*w
      };
    }
    function resize(w,h,dpr){
      vw=w;vh=h;
      dprM=Math.min(dpr||1,POT?1:1.5);
      cv.width=Math.max(1,Math.round(w*dprM));
      cv.height=Math.max(1,Math.round(h*dprM));
      baseFont=POT?12:Math.max(11,Math.min(16,Math.floor(w/52)));
      for(var q=0;q<LAYERS.length;q++)lfs[q]=Math.max(8,Math.round(baseFont*LAYERS[q].fontScale));
      buildAtlas();
      cols.length=0;
      for(var li=0;li<LAYERS.length;li++){
        var L=LAYERS[li];
        var n=Math.max(6,Math.floor((w/(baseFont*L.fontScale))*L.countMul*(POT?0.7:1)));
        if(POT&&li===0)n=Math.min(n,18);
        for(var k=0;k<n;k++)cols.push(makeStream(li,w,h,true));
      }
      /* Sort far → near so near streams paint last (on top). */
      cols.sort(function(a,b){return a.layer.depth-b.layer.depth;});
      cx.fillStyle='#02060e';cx.fillRect(0,0,cv.width,cv.height);
    }
    function frame(ts){
      if(!alive)return;
      rafId=raf(frame);
      var t=(typeof ts==='number')?ts:now();
      var dt=last?t-last:16.7;
      var minDt=(SOFT&&t-t0<900)?30:(K.fpsCap?600/K.fpsCap:0);
      if(last&&dt<minDt)return;
      last=t;
      if(dt>50)dt=50;            /* habis stall: lanjut pelan, jangan teleport */
      var ds=dt/1000,h=vh,w=vw;
      /* Jejak dihitung per waktu, bukan per frame → sama di 60/90/120Hz. */
      cx.globalAlpha=1;
      cx.fillStyle='rgba(2,6,14,'+(1-Math.pow(1-K.trail,dt/16.667)).toFixed(3)+')';
      cx.fillRect(0,0,cv.width,cv.height);
      for(var i=0;i<cols.length;i++){
        var c=cols[i],L=c.layer,fs=c.fs,len=c.len;
        c.y+=c.speed*fs*18*ds;   /* 18 = 0.30 px/frame × 60 → kecepatan sama dgn versi lama di 60Hz */
        c.mt-=dt;
        if(c.mt<=0){c.mt+=K.mutMs;c.chars[(Math.random()*len)|0]=rg();}
        if(K.shiftMs>0){
          c.sh-=dt;
          if(c.sh<=0){c.sh+=K.shiftMs;c.head=(c.head-1+len)%len;c.chars[c.head]=rg();}
        }
        if(c.y-len*fs>h){
          /* Recycle from above the top (normal continuous rain). */
          c.y=Math.random()*-h*0.4;
          c.x=Math.random()*w;
          c.speed=pickSpeed(L);
          len=c.len=pickLen();
          c.ci=(Math.random()*PAL.length)|0;
          c.chars=new Uint8Array(len);
          for(var r=0;r<len;r++)c.chars[r]=rg();
          c.head=0;
        }
        var ALP=ALPHA[c.li],head=c.head,chars=c.chars;
        var rowBody=(c.li*8+c.ci)*cell,rowHead=L.depth>=0.7?(c.li*8+7)*cell:rowBody;
        var dx=Math.round(c.x*dprM-cell/2);
        for(var j=0;j<len;j++){
          var gy=c.y-j*fs;
          if(gy<-fs||gy>h)continue;
          var al=ALP[j];
          if(al<0.02)continue;
          cx.globalAlpha=al;
          cx.drawImage(atlas,chars[(head+j)%len]*cell,j===0?rowHead:rowBody,cell,cell,dx,gy*dprM-pad,cell,cell);
        }
      }
      cx.globalAlpha=1;
    }
    return {
      start:function(canvas,w,h,dpr){
        cv=canvas;cx=cv.getContext('2d',{alpha:false})||cv.getContext('2d');
        resize(w,h,dpr);
        alive=true;t0=now();rafId=raf(frame);
      },
      resize:function(w,h,dpr){if(cv)resize(w,h,dpr);},
      stop:function(){alive=false;try{caf(rafId);}catch(e){}}
    };
  }
  /* Lem di sisi Worker (juga di-toString). */
  function rainWorkerGlue(){
    var eng=null;
    self.onmessage=function(e){
      var m=e.data;
      if(m.t==='init'){
        var hasRaf=typeof self.requestAnimationFrame==='function';
        var raf=hasRaf?function(f){return self.requestAnimationFrame(f);}:function(f){return setTimeout(function(){f(performance.now());},16);};
        var caf=hasRaf?function(i){self.cancelAnimationFrame(i);}:function(i){clearTimeout(i);};
        eng=makeRain(function(){return new OffscreenCanvas(1,1);},raf,caf,function(){return performance.now();},m.cfg);
        eng.start(m.canvas,m.w,m.h,m.dpr);
        self.postMessage({t:'ok'});
      }else if(m.t==='size'&&eng){eng.resize(m.w,m.h,m.dpr);}
      else if(m.t==='stop'&&eng){eng.stop();}
    };
  }

  var glyphs='ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789ABCDEF✦★*+<>|/\\□■◆◇○●▲△▼▽';
  var CYBER_PAL=[
    {r:34,g:230,b:255},{r:255,g:43,b:214},{r:180,g:74,b:255},{r:255,g:220,b:50},
    {r:80,g:160,b:255},{r:255,g:80,b:140},{r:80,g:255,b:180}
  ];
  /* ---- Knob hujan matrix ---- */
  var MX={
    fpsCap:60,    /* batas fps; 0 = ikut refresh layar */
    shiftMs:0,    /* >0 = isi glyph kolom bergeser tiap N ms (look lama ≈33, tapi bikin kedip); 0 = glyph diam, kolom meluncur mulus */
    mutMs:50,     /* ganti 1 glyph acak per kolom tiap N ms */
    trail:0.16    /* kekuatan jejak per 1/60 dtk (makin kecil = jejak makin panjang) */
  };
  var alive=true,wk=null,wkUrl=null,mainEng=null;
  function newCanvas(){
    var c=document.createElement('canvas');
    mx.appendChild(c);
    try{c.style.opacity='0';c.style.transition='opacity .6s ease-out';requestAnimationFrame(function(){c.style.opacity='1';});}catch(eMo){}
    return c;
  }
  function killWorker(){
    if(wk){try{wk.terminate();}catch(e){}wk=null;}
    if(wkUrl){try{URL.revokeObjectURL(wkUrl);}catch(e){}wkUrl=null;}
  }
  function startMain(){
    mainEng=makeRain(
      function(){return document.createElement('canvas');},
      function(f){return requestAnimationFrame(f);},
      function(i){cancelAnimationFrame(i);},
      function(){return performance.now();},
      {pal:CYBER_PAL,glyphs:glyphs,potato:IS_POTATO,k:MX,soft:true}
    );
    mainEng.start(newCanvas(),innerWidth,innerHeight,window.devicePixelRatio||1);
  }
  function startWorker(){
    if(window.__noRainWorker)return false;   /* debug: window.__noRainWorker=true sebelum boot → paksa jalur main thread */
    if(typeof OffscreenCanvas==='undefined'||typeof Worker==='undefined'||typeof Blob==='undefined'||!window.URL||!URL.createObjectURL)return false;
    if(!window.HTMLCanvasElement||!HTMLCanvasElement.prototype.transferControlToOffscreen)return false;
    var c=newCanvas(),ok=false;
    try{
      var off=c.transferControlToOffscreen();
      var src='var makeRain='+makeRain.toString()+';('+rainWorkerGlue.toString()+')();';
      wkUrl=URL.createObjectURL(new Blob([src],{type:'text/javascript'}));
      wk=new Worker(wkUrl);
      wk.onmessage=function(e){if(e.data&&e.data.t==='ok')ok=true;};
      /* Worker gagal sebelum frame pertama (mis. diblok CSP / OffscreenCanvas 2D tak lengkap) → buang canvas itu, jatuh ke main thread. */
      wk.onerror=function(){
        if(ok)return;
        killWorker();
        try{mx.removeChild(c);}catch(e2){}
        if(alive)startMain();
      };
      wk.postMessage({t:'init',canvas:off,w:innerWidth,h:innerHeight,dpr:window.devicePixelRatio||1,
        cfg:{pal:CYBER_PAL,glyphs:glyphs,potato:IS_POTATO,k:MX,soft:false}},[off]);
    }catch(eW){
      killWorker();
      try{mx.removeChild(c);}catch(e3){}
      return false;
    }
    return true;
  }
  if(!startWorker())startMain();
  var rtM;window.addEventListener('resize',function(){clearTimeout(rtM);rtM=setTimeout(function(){
    if(!alive)return;
    var w=innerWidth,h=innerHeight,d=window.devicePixelRatio||1;
    if(wk)wk.postMessage({t:'size',w:w,h:h,dpr:d});else if(mainEng)mainEng.resize(w,h,d);
  },150);});
  window.__rain={kill:function(){alive=false;killWorker();if(mainEng){mainEng.stop();mainEng=null;}}};
})();
