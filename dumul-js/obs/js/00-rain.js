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
    /* Reaktif boot: pT = progres target 0..1 (dari 07-boot), pS = nilai halus yang dipakai. */
    var pT=0,pS=0;
    /* Mood palet: mT 0..1 = peluang kolom baru/recolor memilih warna hangat (magenta/pink/ungu) vs dingin (cyan/biru/hijau). Atlas sudah memuat semua warna → ganti c.ci saja, tanpa render ulang. Kuning (3) dipakai khusus kedip sentuh → hijau matrix. */
    var mT=0,COOL=[0,4,6],WARM=[1,5,2];
    function pickCi(){var a=Math.random()<mT?WARM:COOL;return a[(Math.random()*3)|0];}
    /* Sentuhan: pts = sampai 3 pointer {id,x,y,s(kekuatan 0..1),on}. RAD = jangkauan sedot, RADK = jangkauan sentakan tap. */
    var pts=[],RAD=90,RADK=130;
    /* Kolom yang kebaca: sesekali SATU kolom near berhenti, glyph-nya "mengkristal" jadi kata (vertikal, atas→bawah), tahan sebentar, lalu larut & lanjut jatuh.
       Huruf kata di luar set glyph hujan ditaruh di sel ekstra atlas (indeks >= NG) → rg() tetap hanya memilih glyph hujan biasa. Mode low: mati (WORDS kosong). */
    var WORDS=POT?[]:(cfg.words||[]),XCH=[],XI={},WD=[],rdCol=null,rdNext=1000+Math.random()*1000,AV=null;   /* AV = [l,t,r,b] area panel boot (CSS px) yang harus dihindari; null = belum diterima → belum mulai baca */
    (function(){
      for(var wi=0;wi<WORDS.length;wi++){
        var ws=String(WORDS[wi]).toUpperCase(),arr=[];
        for(var k=0;k<ws.length;k++){
          var ch=ws.charAt(k);
          if(!/[A-Z0-9]/.test(ch))continue;
          var gi=G.indexOf(ch);
          if(gi<0){if(XI[ch]===undefined){XI[ch]=NG+XCH.length;XCH.push(ch);}gi=XI[ch];}
          arr.push(gi);
        }
        if(arr.length>=3&&arr.length<=14)WD.push(arr);
      }
    })();
    var NT=NG+XCH.length;
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
      atlas=mk();atlas.width=NT*cell;atlas.height=LAYERS.length*8*cell;
      var a=atlas.getContext('2d');
      a.textAlign='center';a.textBaseline='top';
      for(var li=0;li<LAYERS.length;li++){
        a.font=(lfs[li]*dprM)+'px "Courier New",monospace';
        for(var ci=0;ci<8;ci++){
          if(ci===7&&LAYERS[li].depth<0.7)continue;
          a.fillStyle=ci===7?'#ffffff':'rgb('+PAL[ci].r+','+PAL[ci].g+','+PAL[ci].b+')';
          var y=(li*8+ci)*cell+pad;
          for(var g=0;g<NT;g++)a.fillText(g<NG?G[g]:XCH[g-NG],g*cell+cell/2,y);
        }
      }
    }
    function makeStream(li,w,h,midway){
      var L=LAYERS[li],len=pickLen(),chars=new Uint8Array(len),x=Math.random()*w;
      for(var j=0;j<len;j++)chars[j]=rg();
      return {
        y:midway?(Math.random()*h*1.15-h*0.15):(Math.random()*-h*1.2),
        speed:pickSpeed(L),len:len,chars:chars,head:0,
        mt:Math.random()*K.mutMs,sh:Math.random()*(K.shiftMs||1),
        ci:pickCi(),rc:0,li:li,layer:L,fs:lfs[li],x:x,
        hx:x,fl:0,kick:0   /* hx = x asal (kolom kembali ke sini), fl = sisa ms kedip hijau matrix, kick = sentakan tap 1->0 */
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
      cols.length=0;rdCol=null;
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
    /* Pilih satu kolom near yang seluruh katanya muat di layar, lalu mulai "baca". Belum ada kandidat → coba lagi 0,4 dtk kemudian. */
    function rdTry(){
      if(!AV){rdNext=300;return;}
      var wd=WD[(Math.random()*WD.length)|0],n=wd.length,best=null,i,c;
      for(i=0;i<cols.length;i++){
        c=cols[i];
        if(c.li!==2||c.rd||c.fl>0||c.kick>0||c.x!==c.hx)continue;
        var yT=c.y-(n-1)*c.fs-c.fs*0.5,yB=c.y+c.fs*0.5;
        if(yT<vh*0.04||yB>vh*0.97||c.x<vw*0.03||c.x>vw*0.97)continue;
        if(AV[2]>AV[0]&&c.x>AV[0]&&c.x<AV[2]&&yB>AV[1]&&yT<AV[3])continue;   /* jangan berhenti di belakang panel boot */
        if(!best||Math.random()<0.3)best=c;
      }
      if(!best){rdNext=400;return;}
      var len=best.len<n+5?n+5:best.len,ch=new Uint8Array(len);
      for(i=0;i<len;i++)ch[i]=rg();
      best.len=len;best.chars=ch;best.head=0;
      best.rd={wd:wd,n:n,t:0,hold:2200+Math.random()*800,dc:0};
      rdCol=best;
    }
    /* jarak titik (x,y) ke segmen vertikal kolom c (kepala di c.y, ekor ke atas sepanjang len*fs) */
    function colDist(c,x,y){
      var yT=c.y-c.len*c.fs,dx=c.hx-x,dy=y<yT?yT-y:(y>c.y?y-c.y:0);
      return Math.sqrt(dx*dx+dy*dy);
    }
    /* a: 2 = tap/down (sentakan), 1 = geser/hover, 0 = lepas */
    function ptSet(id,x,y,a){
      var p=null,i;
      for(i=0;i<pts.length;i++)if(pts[i].id===id){p=pts[i];break;}
      if(!p){
        if(a===0)return;
        if(pts.length>=3)pts.shift();
        p={id:id,x:x,y:y,s:0,on:1};pts.push(p);
      }
      p.x=x;p.y=y;p.on=a===0?0:1;
      if(a===2){
        for(i=0;i<cols.length;i++){
          var c=cols[i],d=colDist(c,x,y);
          if(d<RADK){c.fl=900;var kk=1-d/RADK;if(kk>c.kick)c.kick=kk;}
        }
      }
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
      pS+=(pT-pS)*(1-Math.exp(-dt/320));
      if(WD.length&&!rdCol){rdNext-=dt;if(rdNext<=0)rdTry();}
      /* gm = pengali kecepatan jatuh (pelan di awal -> makin cepat mengikuti progres). Mode low: tetap 1 (hemat). */
      var gm=POT?1:(0.85+0.6*pS);
      var np=pts.length,kIn=1-Math.exp(-dt/110),kOut=1-Math.exp(-dt/450),q;
      for(q=np-1;q>=0;q--){
        var pp=pts[q];pp.s+=((pp.on?1:0)-pp.s)*(1-Math.exp(-dt/(pp.on?90:420)));
        if(!pp.on&&pp.s<0.01){pts.splice(q,1);np--;}
      }
      /* Jejak dihitung per waktu, bukan per frame → sama di 60/90/120Hz. */
      cx.globalAlpha=1;
      cx.fillStyle='rgba(2,6,14,'+(1-Math.pow(1-K.trail,dt/16.667)).toFixed(3)+')';
      cx.fillRect(0,0,cv.width,cv.height);
      for(var i=0;i<cols.length;i++){
        var c=cols[i],L=c.layer,fs=c.fs,len=c.len;
        var w2=0,px=0;
        if(np){
          for(q=0;q<np;q++){
            var p2=pts[q],ww=(1-colDist(c,p2.x,p2.y)/RAD)*p2.s;
            if(ww>w2){w2=ww;px=p2.x;}
          }
        }
        if(w2>0.02){c.fl=380;c.mt-=dt*6*w2;c.x+=(c.hx+(px-c.hx)*0.85*w2-c.x)*kIn;}   /* tersedot ke jari + glyph teracak lebih cepat */
        else if(c.x!==c.hx){c.x+=(c.hx-c.x)*kOut;if(Math.abs(c.hx-c.x)<0.05)c.x=c.hx;}
        if(c.fl>0)c.fl-=dt;
        if(c.rc>0){c.rc-=dt;if(c.rc<=0)c.ci=pickCi();}   /* recolor mood, bertahap per kolom */
        if(c.kick>0){c.kick-=dt/650;if(c.kick<0)c.kick=0;}
        /* sf = pengali kecepatan (melambat → diam → melaju lagi), rdA = terang huruf kata. Tap dekat kolom (kick) memutus baca lebih awal. */
        var rd=c.rd,sf=1,rdA=0;
        if(rd){
          rd.t+=dt;
          if(c.kick>0.3&&rd.t<rd.hold)rd.t=rd.hold;
          var rT=rd.t,rH=rd.hold;
          if(rT>=rH+450){c.rd=rd=null;rdCol=null;rdNext=2200+Math.random()*2400;}
          else{
            sf=rT<250?1-rT/250:(rT<rH?0:(rT-rH)/450);
            rdA=rT<rH?1:1-(rT-rH)/450;
            if(rT<rH){
              rd.dc-=dt;
              if(rd.dc<=0){   /* decode: huruf yang belum "terkunci" diacak, terkunci satu per satu dari atas */
                rd.dc=60;
                for(var wk2=0;wk2<rd.n;wk2++)c.chars[(c.head+rd.n-1-wk2)%len]=rT>wk2*55+200?rd.wd[wk2]:rg();
              }
            }
          }
        }
        c.y+=c.speed*fs*18*ds*gm*(1+1.4*c.kick)*sf;   /* 18 = 0.30 px/frame × 60 → kecepatan sama dgn versi lama di 60Hz */
        c.mt-=dt;
        if(rd&&rd.t<rd.hold)c.mt=K.mutMs;   /* selama kata ditahan, huruf tidak dimutasi; sesudahnya larut lewat mutasi biasa */
        else for(var mm=0;c.mt<=0&&mm<4;mm++){c.mt+=K.mutMs;c.chars[(Math.random()*len)|0]=rg();}
        if(K.shiftMs>0&&!rd){
          c.sh-=dt;
          if(c.sh<=0){c.sh+=K.shiftMs;c.head=(c.head-1+len)%len;c.chars[c.head]=rg();}
        }
        if(c.y-len*fs>h){
          /* Recycle from above the top (normal continuous rain). */
          if(c.rd){c.rd=null;rdCol=null;rdNext=4000;}
          c.y=Math.random()*-h*0.4;
          c.x=c.hx=Math.random()*w;c.fl=0;c.kick=0;
          c.speed=pickSpeed(L);
          len=c.len=pickLen();
          c.ci=pickCi();
          c.chars=new Uint8Array(len);
          for(var r=0;r<len;r++)c.chars[r]=rg();
          c.head=0;
        }
        var ALP=ALPHA[c.li],head=c.head,chars=c.chars;
        var rowBody=(c.li*8+(c.fl>0?3:c.ci))*cell,rowHead=L.depth>=0.7?(c.li*8+7)*cell:rowBody,rowWd=(c.li*8+(c.fl>0?3:0))*cell,rdN=rd?rd.n:0;
        var dx=Math.round(c.x*dprM-cell/2);
        for(var j=0;j<len;j++){
          var gy=c.y-j*fs;
          if(gy<-fs||gy>h)continue;
          var al=ALP[j],inW=j<rdN;
          if(inW&&0.92*rdA>al)al=0.92*rdA;
          if(al<0.02)continue;
          cx.globalAlpha=al;
          cx.drawImage(atlas,chars[(head+j)%len]*cell,inW?rowWd:(j===0?rowHead:rowBody),cell,cell,dx,gy*dprM-pad,cell,cell);
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
      prog:function(v){pT=v<0?0:(v>1?1:v);},
      pt:ptSet,
      avoid:function(r){AV=r;},
      mood:function(v){mT=POT?0:(v<0?0:(v>1?1:v));for(var i=0;i<cols.length;i++)cols[i].rc=200+Math.random()*1800;},
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
      else if(m.t==='prog'&&eng){eng.prog(m.v);}
      else if(m.t==='avoid'&&eng){eng.avoid(m.r);}
      else if(m.t==='mood'&&eng){eng.mood(m.v);}
      else if(m.t==='pt'&&eng){eng.pt(m.id,m.x,m.y,m.a);}
      else if(m.t==='stop'&&eng){eng.stop();}
    };
  }

  var glyphs='ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789ABCDEF✦★*+<>|/\\□■◆◇○●▲△▼▽';
  var CYBER_PAL=[
    {r:34,g:230,b:255},{r:255,g:43,b:214},{r:180,g:74,b:255},{r:0,g:255,b:65},
    {r:80,g:160,b:255},{r:255,g:80,b:140},{r:80,g:255,b:180}
  ];
  /* ---- Knob hujan matrix ---- */
  var MX={
    fpsCap:60,    /* batas fps; 0 = ikut refresh layar */
    shiftMs:0,    /* >0 = isi glyph kolom bergeser tiap N ms (look lama ≈33, tapi bikin kedip); 0 = glyph diam, kolom meluncur mulus */
    mutMs:50,     /* ganti 1 glyph acak per kolom tiap N ms */
    trail:0.16    /* kekuatan jejak per 1/60 dtk (makin kecil = jejak makin panjang) */
  };
  /* Kata untuk "kolom yang kebaca" (nama situs + judul lagu album). Mode low: kosong. */
  var WORDS=IS_POTATO?[]:['DUMUL','OBSERVATORY','LIMERENCE','GLITCH','NASTENKA','LARUNG'];
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
      {pal:CYBER_PAL,glyphs:glyphs,potato:IS_POTATO,k:MX,soft:true,words:WORDS}
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
        cfg:{pal:CYBER_PAL,glyphs:glyphs,potato:IS_POTATO,k:MX,soft:false,words:WORDS}},[off]);
    }catch(eW){
      killWorker();
      try{mx.removeChild(c);}catch(e3){}
      return false;
    }
    return true;
  }
  if(!startWorker())startMain();
  /* Rect panel boot (#boot-core + bayangan gelapnya) dikirim ke engine supaya kata "kolom yang kebaca" tidak berhenti di belakang panel. #boot-core baru ada setelah HTML diparse → kirim saat DOM siap, saat resize, dan berkala (tinggi panel berubah saat kapsul tampil). */
  var avT=0;
  function avSend(){
    if(!alive||IS_POTATO)return;
    var e=document.getElementById('boot-core'),r=[0,0,0,0];
    if(e){var b=e.getBoundingClientRect();if(b.width>0)r=[b.left-40,b.top-34,b.right+40,b.bottom+34];}
    if(wk)wk.postMessage({t:'avoid',r:r});else if(mainEng)mainEng.avoid(r);
  }
  if(!IS_POTATO){
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',avSend);else avSend();
    avT=setInterval(avSend,1500);
  }
  var rtM;window.addEventListener('resize',function(){clearTimeout(rtM);rtM=setTimeout(function(){
    if(!alive)return;avSend();
    var w=innerWidth,h=innerHeight,d=window.devicePixelRatio||1;
    if(wk)wk.postMessage({t:'size',w:w,h:h,dpr:d});else if(mainEng)mainEng.resize(w,h,d);
  },150);});
  /* ---- Sentuh = gangguan: jari/kursor "menyedot" kolom di sekitarnya + kolom itu berkedip hijau matrix & glyph-nya teracak sebentar; tap = sentakan lebih besar. Mode low: mati. ---- */
  var ptOff=[];
  function ptSend(id,x,y,a){if(!alive)return;if(wk)wk.postMessage({t:'pt',id:id,x:x,y:y,a:a});else if(mainEng)mainEng.pt(id,x,y,a);}
  if(!IS_POTATO){
    var pend={},pendRaf=0;
    var ptFlush=function(){pendRaf=0;for(var k in pend)ptSend(+k,pend[k].x,pend[k].y,1);pend={};};
    var ptOn=function(t,fn,tgt){var o={passive:true,capture:true};(tgt||window).addEventListener(t,fn,o);ptOff.push(function(){(tgt||window).removeEventListener(t,fn,o);});};
    ptOn('pointermove',function(e){if(!alive)return;pend[e.pointerId]={x:e.clientX,y:e.clientY};if(!pendRaf)pendRaf=requestAnimationFrame(ptFlush);});
    ptOn('pointerdown',function(e){if(!alive)return;delete pend[e.pointerId];ptSend(e.pointerId,e.clientX,e.clientY,2);});
    var ptUp=function(e){if(!alive)return;delete pend[e.pointerId];ptSend(e.pointerId,e.clientX,e.clientY,0);};
    ptOn('pointerup',ptUp);ptOn('pointercancel',ptUp);
    ptOn('pointerleave',ptUp,document.documentElement);
  }
  window.__rain={kill:function(){alive=false;clearInterval(avT);killWorker();if(mainEng){mainEng.stop();mainEng=null;}for(var i=0;i<ptOff.length;i++)ptOff[i]();ptOff=[];},
    /* prog: hujan ikut progres boot (v 0..1). Aman dipanggil kapan saja (no-op kalau sudah di-kill). */
    prog:function(v){if(!alive)return;if(wk)wk.postMessage({t:'prog',v:v});else if(mainEng)mainEng.prog(v);},
    /* mood: 0 = dingin (cyan/biru/hijau), 1 = hangat (magenta/pink/ungu). Mode low: no-op. */
    mood:function(v){if(!alive)return;if(wk)wk.postMessage({t:'mood',v:v});else if(mainEng)mainEng.mood(v);}};
})();
