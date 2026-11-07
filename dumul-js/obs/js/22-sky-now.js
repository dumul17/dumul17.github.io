/* 22-sky-now.js — "Langit malam ini": fase bulan (jam), sektor yang lagi tertinggi (menu sektor), hujan meteor (frekuensi meteor + toast).
   Murni hitungan dari new Date() di HP pengunjung: zona waktu ikut otomatis (WIB/WITA/WIT dst), tanpa API, tanpa izin lokasi, aman offline.
   Fase bulan & hujan meteor sama di seluruh dunia (beda paling sehari karena zona waktu). Nama sektor (Winter dst) cuma label musim belahan utara;
   yang dihitung adalah posisi bintang asli (jam sideris lokal ~ dari offset zona waktu, akurat ±0.5 jam), bukan musim.
   Dipakai: 02-sky-logic.js tickClock() -> moonAttach(el) (tombol fase bulan di jam -> panel); 04-render.js drawShooting() -> ssK(); 16-sector-menu.js smenuRefresh() -> tonight(). Semua dengan guard typeof. */
'use strict';
var SKYNOW=(function(){
  var SYN=29.530588861,DAY=864e5,R=Math.PI/180;
  /* [nama, bulan, tanggal puncak]. Puncak asli bergeser ±1 hari per tahun, jadi toleransi dipakai di shower(). */
  var SHOWERS=[['Quadrantids',1,4],['Lyrids',4,22],['Eta Aquariids',5,6],['Delta Aquariids',7,30],['Perseids',8,12],['Orionids',10,21],['Leonids',11,17],['Geminids',12,14],['Ursids',12,22]];
  /* RA tengah (jam) tiap sektor = rata-rata RA rasi di dalamnya (selisih antar sektor ~6 jam) */
  var SECT_RA={winter:5.9,spring:12,summer:18.7,autumn:1.3};
  var mc=null,tn={hk:-1,key:null},sh={dk:-1,v:null},pill=null,pillMk=-1,P={el:null,open:false,t:0,iv:0};
  function jd(ms){return ms/DAY+2440587.5;}
  /* Waktu fase utama (Meeus, Astronomical Algorithms bab 49, suku utama): n = 4*siklus + q (q 0 baru, 1 perbani awal, 2 purnama, 3 perbani akhir).
     Dicek ke 10 kejadian asli Okt-Des 2026: selisih <= 1 menit. Hasil dalam ms epoch (ΔT 69 dtk dikurangi). */
  function phaseMs(n){
    var K=n/4,T=K/1236.85,T2=T*T,j=2451550.09766+29.530588861*K+.00015437*T2-.00000015*T2*T,E=1-.002516*T-.0000074*T2,
        M=(2.5534+29.1053567*K-.0000014*T2)*R,Pm=(201.5643+385.81693528*K+.0107582*T2)*R,F=(160.7108+390.67050284*K-.0016118*T2)*R,O=(124.7746-1.56375588*K+.0020672*T2)*R,
        q=((n%4)+4)%4,s=Math.sin,c;
    if(q===0||q===2){
      c=(q?-.40614:-.4072)*s(Pm)+(q?.17302:.17241)*E*s(M)+(q?.01614:.01608)*s(2*Pm)+(q?.01043:.01039)*s(2*F)+(q?.00734:.00739)*E*s(Pm-M)
       -(q?.00515:.00514)*E*s(Pm+M)+(q?.00209:.00208)*E*E*s(2*M)-.00111*s(Pm-2*F)-.00057*s(Pm+2*F)+.00056*E*s(2*Pm+M)-.00042*s(3*Pm)
       +.00042*E*s(M+2*F)+.00038*E*s(M-2*F)-.00024*E*s(2*Pm-M)-.00017*s(O);
    }else{
      c=-.62801*s(Pm)+.17172*E*s(M)-.01183*E*s(Pm+M)+.00862*s(2*Pm)+.00804*s(2*F)+.00454*E*s(Pm-M)+.00204*E*E*s(2*M)-.0018*s(Pm-2*F)
       -.0007*s(Pm+2*F)-.0004*s(3*Pm)-.00034*E*s(2*Pm-M)+.00032*E*s(M+2*F)+.00032*E*s(M-2*F)-.00028*E*E*s(Pm+2*M)+.00027*E*s(2*Pm+M)-.00017*s(O);
      c+=(.00306-.00038*E*Math.cos(M)+.00026*Math.cos(Pm)-.00002*Math.cos(Pm-M)+.00002*Math.cos(Pm+M)+.00002*Math.cos(2*F))*(q===1?1:-1);
    }
    return (j+c-2440587.5)*DAY-69e3;
  }
  /* Posisi di siklus p (0..1) diinterpolasi linear antar 4 fase utama yang BENAR-benar terjadi, bukan rata-rata 29.53 hari
     (rata-rata bisa meleset ±14 jam). Iluminasi = (1-cos 2πp)/2. */
  function calc(ms){
    var n0=Math.floor((jd(ms)-2451550.09766)/SYN*4)-1,ev=[],i,k;
    for(i=0;i<9;i++)ev.push({n:n0+i,q:((n0+i)%4+4)%4,t:phaseMs(n0+i)});
    k=0;while(k<7&&ev[k+1].t<=ms)k++;
    var fr=(ms-ev[k].t)/(ev[k+1].t-ev[k].t),p=(ev[k].q+fr)/4;
    return {p:p%1,ill:(1-Math.cos(2*Math.PI*p))/2,age:(p%1)*SYN,idx:Math.floor(p*8+.5)%8,lun:(ev[k].n+fr)/4,next:ev.slice(k+1,k+5),mk:Math.floor(ms/6e4)};
  }
  function cur(){var ms=Date.now(),mk=Math.floor(ms/6e4);if(!mc||mc.mk!==mk)mc=calc(ms);return mc;}
  /* ikon fase: setengah lingkaran sisi terang + elips terminator (rx = |cos| fase), warna ikut currentColor */
  function moonSvg(p,px){
    var wax=p<.5,rx=(4*Math.abs(Math.cos(2*Math.PI*p))).toFixed(2),inner=wax?(p<.25?0:1):(p<.75?0:1),ill=(1-Math.cos(2*Math.PI*p))/2,
        d=(wax?'M5 1A4 4 0 0 1 5 9':'M5 1A4 4 0 0 0 5 9')+'A'+rx+' 4 0 0 '+inner+' 5 1Z';
    return '<svg viewBox="0 0 10 10" width="'+px+'" height="'+px+'" aria-hidden="true" style="display:block;flex:none"><circle cx="5" cy="5" r="4" fill="rgba(8,16,28,.85)" stroke="currentColor" stroke-opacity=".5" stroke-width=".6"/>'+
      (ill>.012?'<path d="'+d+'" fill="currentColor"/>':'')+'</svg>';
  }
  function tx(k,v){try{return T(k,v);}catch(e){return k;}}
  function fmtIn(ms){
    var u=tx('sky.u').split('|'),mi=Math.max(0,Math.floor(ms/6e4)),d=Math.floor(mi/1440),h=Math.floor(mi%1440/60),m=mi%60,t;
    t=d>=1?d+u[0]+' '+h+u[1]:(h>=1?h+u[1]+' '+m+u[2]:(m<1?'<1'+u[2]:m+u[2]));
    return tx('sky.in',{t:t});
  }
  function fmtDate(ms){
    var d=new Date(ms),dn=tx('clock.days').split('|'),mn=tx('clock.months').split('|');
    return dn[d.getDay()]+' '+d.getDate()+' '+mn[d.getMonth()]+' · '+(d.getHours()<10?'0':'')+d.getHours()+':'+(d.getMinutes()<10?'0':'')+d.getMinutes();
  }
  /* ---------- tombol di jam + panel ---------- */
  var CSS=
    '#bh-clock .skm{display:inline-flex;align-items:center;gap:4px;margin-left:8px;padding:3px 7px 3px 5px;border:1px solid rgba(110,229,255,.34);border-radius:11px;background:rgba(110,229,255,.07);color:rgba(214,238,248,.92);vertical-align:middle;cursor:pointer;letter-spacing:.08em;text-transform:uppercase;white-space:nowrap}'+
    '#bh-clock .skm svg{width:13px;height:13px}#bh-clock .skm:active{background:rgba(110,229,255,.22)}'+
    '#sky-moon{position:fixed;left:0;top:0;right:0;bottom:0;z-index:9500;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .18s ease;font-family:"Space Grotesk",system-ui,sans-serif;color:#d9f6ff;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent}'+
    '#sky-moon[hidden]{display:none}#sky-moon.on{opacity:1}'+
    '#sky-moon .skp-bd{position:absolute;left:0;top:0;right:0;bottom:0;background:rgba(2,6,12,.74)}'+
    '#sky-moon .skp-card{position:relative;width:min(92vw,360px);max-height:94vh;overflow-y:auto;box-sizing:border-box;padding:16px 18px 14px;border:1px solid rgba(110,229,255,.22);border-radius:16px;background:rgba(6,14,26,.94);box-shadow:0 0 40px rgba(110,229,255,.08);outline:none}'+
    '#sky-moon button{font-family:inherit;-webkit-appearance:none;appearance:none}'+
    '#sky-moon .skp-x{position:absolute;right:4px;top:4px;width:40px;height:40px;border:0;border-radius:50%;background:transparent;color:rgba(217,246,255,.8);font-size:24px;line-height:1;cursor:pointer}'+
    '#sky-moon .skp-ttl{font-size:11px;letter-spacing:.28em;text-transform:uppercase;color:rgba(110,229,255,.8);margin-bottom:12px}'+
    '#sky-moon .skp-hero{display:flex;align-items:center;gap:16px}'+
    '#sky-moon .skp-big{color:#eaf6ff;filter:drop-shadow(0 0 7px rgba(160,220,255,.4));flex:none}'+
    '#sky-moon .skp-nm{font-size:18px;font-weight:600;letter-spacing:.14em;text-transform:uppercase}'+
    '#sky-moon .skp-sub{font-size:12px;opacity:.72;margin-top:5px}'+
    '#sky-moon .skp-bar{position:relative;height:6px;margin:20px 9px 26px;border-radius:3px;background:rgba(110,229,255,.16)}'+
    '#sky-moon .skp-fill{position:absolute;left:0;top:0;bottom:0;border-radius:3px;background:linear-gradient(90deg,rgba(110,229,255,.15),rgba(110,229,255,.7))}'+
    '#sky-moon .skp-mk{position:absolute;top:50%;width:12px;height:12px;margin:-6px 0 0 -6px;border-radius:50%;background:#eaf8ff;box-shadow:0 0 10px rgba(110,229,255,.95)}'+
    '#sky-moon .skp-tk{position:absolute;top:10px;color:rgba(214,238,248,.7);transform:translateX(-50%)}'+
    '#sky-moon .skp-h{font-size:10px;letter-spacing:.24em;text-transform:uppercase;opacity:.55;margin:4px 0 6px}'+
    '#sky-moon .skp-ev,#sky-moon .skp-sh{list-style:none;margin:0;padding:0}'+
    '#sky-moon .skp-ev li,#sky-moon .skp-sh li{display:flex;align-items:center;gap:10px;padding:7px 0;border-top:1px solid rgba(110,229,255,.1);color:rgba(214,238,248,.9)}'+
    '#sky-moon .skp-ev li:first-child{color:#eaf8ff}'+
    '#sky-moon .skp-en{flex:1;min-width:0}#sky-moon .skp-en b{display:block;font-size:13px;font-weight:600;letter-spacing:.06em}#sky-moon .skp-en small{display:block;font-size:10.5px;opacity:.6;letter-spacing:.05em;margin-top:2px}'+
    '#sky-moon .skp-in{font:600 11.5px "Courier New",monospace;color:#6ee5ff;white-space:nowrap}'+
    '#sky-moon .skp-ft{font-size:10px;opacity:.45;margin-top:10px;text-align:center}'+
    'body.ls #sky-moon{left:calc(-1 * var(--gut,0px));right:calc(-1 * var(--gut,0px))}'+
    '@media (prefers-reduced-motion:reduce){#sky-moon{transition:none}}';
  function css(){if(document.getElementById('sky-moon-css'))return;var s=document.createElement('style');s.id='sky-moon-css';s.textContent=CSS;document.head.appendChild(s);}
  /* Dipanggil tickClock() tiap detik setelah innerHTML jam ditulis ulang: tombol = SATU node yang dipasang ulang (listener & gesture tap tidak putus). */
  function moonAttach(el){
    var c=cur();
    if(!pill){
      css();pill=document.createElement('span');pill.className='skm';pill.setAttribute('role','button');
      pill.addEventListener('pointerdown',function(e){e.stopPropagation();},false);   /* jangan dihitung 5x-tap terminal jam / drag langit */
      pill.addEventListener('click',function(e){e.stopPropagation();e.preventDefault();openPanel();},false);
    }
    if(pillMk!==c.mk){pill.innerHTML=moonSvg(c.p,13)+'<span>'+tx('sky.ph').split('|')[c.idx]+' · '+Math.round(c.ill*100)+'%</span>';pill.setAttribute('aria-label',tx('sky.moon.ttl'));pillMk=c.mk;}
    el.appendChild(pill);
  }
  function build(){
    if(P.el)return;
    css();
    var a=P.el=document.createElement('div'),i,h='';
    a.id='sky-moon';a.hidden=true;a.setAttribute('role','dialog');a.setAttribute('aria-modal','true');
    for(i=0;i<5;i++)h+='<span class="skp-tk" style="left:'+(i*25)+'%">'+moonSvg(i/4,16)+'</span>';
    a.innerHTML='<div class="skp-bd"></div><div class="skp-card" tabindex="-1"><button type="button" class="skp-x" data-a="x">\u00d7</button>'+
      '<div class="skp-ttl"></div><div class="skp-hero"><div class="skp-big"></div><div><div class="skp-nm"></div><div class="skp-sub"></div></div></div>'+
      '<div class="skp-bar"><div class="skp-fill"></div><div class="skp-mk"></div>'+h+'</div>'+
      '<div class="skp-h" data-k="next"></div><ul class="skp-ev"></ul>'+
      '<div class="skp-h" data-k="shw"></div><ul class="skp-sh"></ul><div class="skp-ft"></div></div>';
    document.body.appendChild(a);
    /* isolasi penuh seperti #sect-menu: tidak tembus ke langit / BH / teleskop */
    ['pointerdown','pointerup','pointercancel','pointermove','touchstart','touchmove','touchend','wheel','contextmenu','mousedown','mouseup'].forEach(function(tp){
      a.addEventListener(tp,function(e){e.stopPropagation();},{passive:true,capture:true});
    });
    a.addEventListener('click',function(e){
      e.stopPropagation();
      if(performance.now()-P.t<400){e.preventDefault();return;}   /* klik susulan dari tap yang MEMBUKA panel */
      var t=e.target,b=t.closest&&t.closest('[data-a]');
      if(b||!(t.closest&&t.closest('.skp-card')))closePanel();
    },true);
    window.addEventListener('keydown',function(e){if(P.open&&(e.key==='Escape'||e.key==='Esc')){e.stopPropagation();closePanel();}},true);
  }
  function nextShower(){
    var d=new Date(),base=Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()),best=null,bd=1e9,i,y,df;
    for(i=0;i<SHOWERS.length;i++)for(y=d.getFullYear();y<=d.getFullYear()+1;y++){
      df=Math.round((Date.UTC(y,SHOWERS[i][1]-1,SHOWERS[i][2])-base)/DAY);
      if(df>=-1&&df<bd){bd=df;best={name:SHOWERS[i][0],days:df,ms:Date.UTC(y,SHOWERS[i][1]-1,SHOWERS[i][2])};}
    }
    return best;
  }
  function render(){
    var c=cur(),a=P.el,now=Date.now(),L=tx('sky.ph').split('|'),EV=tx('sky.moon.ev').split('|'),h='',i,e,ns,u=tx('sky.u').split('|'),dn=tx('clock.days').split('|'),mn=tx('clock.months').split('|'),sd;
    a.querySelector('.skp-ttl').textContent=tx('sky.moon.ttl');
    a.querySelector('.skp-big').innerHTML=moonSvg(c.p,72);
    a.querySelector('.skp-nm').textContent=L[c.idx];
    a.querySelector('.skp-sub').textContent=tx('sky.moon.lit',{p:Math.round(c.ill*100),d:Math.floor(c.age)});
    a.querySelector('.skp-fill').style.width=(c.p*100).toFixed(1)+'%';
    a.querySelector('.skp-mk').style.left=(c.p*100).toFixed(1)+'%';
    a.querySelector('[data-k=next]').textContent=tx('sky.next');
    for(i=0;i<c.next.length;i++){
      e=c.next[i];
      h+='<li><span style="color:#eaf6ff">'+moonSvg(e.q/4,18)+'</span><div class="skp-en"><b>'+EV[e.q]+'</b><small>'+fmtDate(e.t)+'</small></div><span class="skp-in">'+fmtIn(e.t-now)+'</span></li>';
    }
    a.querySelector('.skp-ev').innerHTML=h;
    a.querySelector('[data-k=shw]').textContent=tx('sky.shower.next');
    ns=nextShower();
    sd=new Date(ns.ms);
    a.querySelector('.skp-sh').innerHTML='<li><div class="skp-en"><b>'+ns.name+'</b><small>'+sd.getUTCDate()+' '+mn[sd.getUTCMonth()]+'</small></div><span class="skp-in">'+(ns.days<=1?tx('sky.shower.now'):tx('sky.in',{t:ns.days+u[0]}))+'</span></li>';
    a.querySelector('.skp-ft').textContent=tx('sky.local');
  }
  function openPanel(){
    build();
    if(P.open)return;
    P.open=true;P.t=performance.now();render();
    P.el.hidden=false;
    requestAnimationFrame(function(){P.el.classList.add('on');});
    clearInterval(P.iv);P.iv=setInterval(render,15000);
    try{UIS.tap();}catch(e){}try{haptic(6);}catch(e2){}
    try{P.el.querySelector('.skp-card').focus({preventScroll:true});}catch(e3){}
  }
  function closePanel(){
    if(!P.open)return;
    P.open=false;clearInterval(P.iv);P.el.classList.remove('on');
    setTimeout(function(){if(!P.open)P.el.hidden=true;},200);
  }
  /* Sektor yang meridiannya paling dekat dengan jam sideris lokal. Malam (19-05 lokal) = sekarang; siang = jam 21:00 lokal hari ini. */
  function tonight(){
    var now=Date.now(),d=new Date(now),hk=Math.floor(now/36e5);
    if(tn.hk===hk)return tn.key;
    var h=d.getHours(),t=now,gm,lst,k,df,best=null,bd=99;
    if(h>=5&&h<19)t=new Date(d.getFullYear(),d.getMonth(),d.getDate(),21,0,0).getTime();
    gm=((18.697374558+24.06570982441908*(jd(t)-2451545))%24+24)%24;
    lst=((gm-d.getTimezoneOffset()/60)%24+24)%24;
    for(k in SECT_RA){df=Math.abs(SECT_RA[k]-lst);if(df>12)df=24-df;if(df<bd){bd=df;best=k;}}
    tn.hk=hk;tn.key=best;return best;
  }
  /* Hujan meteor terdekat dalam ±3 hari dari tanggal lokal. peak = ±1 hari dari puncak. */
  function shower(){
    var d=new Date(),dk=d.getFullYear()*400+d.getMonth()*32+d.getDate();
    if(sh.dk===dk)return sh.v;
    var base=Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()),name=null,bd=99,i,y,df;
    for(i=0;i<SHOWERS.length;i++)for(y=d.getFullYear()-1;y<=d.getFullYear()+1;y++){
      df=Math.round((base-Date.UTC(y,SHOWERS[i][1]-1,SHOWERS[i][2]))/DAY);
      if(Math.abs(df)<Math.abs(bd)){bd=df;name=SHOWERS[i][0];}
    }
    sh.dk=dk;sh.v=Math.abs(bd)<=3?{name:name,off:bd,peak:Math.abs(bd)<=1}:null;
    return sh.v;
  }
  /* pengali jarak antar meteor acak: puncak ~2x lebih sering, hari sekitar puncak ~1.4x */
  function ssK(){var s=shower();return s?(s.peak?.45:.7):1;}
  /* Toast sekali per kejadian (hujan meteor per tahun, bulan purnama / baru per siklus), setelah boot selesai. */
  function announce(){
    var s=shower(),m=cur(),txt=null,key=null,st=null;
    if(s){key='s'+s.name+new Date().getFullYear();txt=T(s.peak?'sky.shower.peak':'sky.shower.on',{s:s.name});}
    else if(m.age<1.5||m.age>SYN-1.5){key='n'+Math.round(m.lun);txt=T('sky.moon.new');}
    else if(Math.abs(m.age-SYN/2)<1.5){key='f'+Math.floor(m.lun);txt=T('sky.moon.full');}
    if(!txt)return;
    try{st=localStorage.getItem('dumul_sn_v1');}catch(e){}
    if(st===key)return;
    try{localStorage.setItem('dumul_sn_v1',key);}catch(e2){}
    if(typeof showModeToast==='function')showModeToast(txt,'tip',4200);
  }
  (function(){
    var n=0,iv=setInterval(function(){
      if(++n>90){clearInterval(iv);return;}
      if(typeof bootDone==='undefined'||!bootDone||document.hidden)return;
      clearInterval(iv);
      try{announce();}catch(e){}
    },1000);
  })();
  return {moonAttach:moonAttach,tonight:tonight,shower:shower,ssK:ssK,phase:cur,phaseMs:phaseMs};
})();
