/* 22-sky-now.js — "Langit malam ini": Fase Astronomi (pil di atas tengah -> panel: tab Bulan + tab Planet), sektor yang lagi tertinggi (menu sektor), hujan meteor (frekuensi meteor + toast).
   Murni hitungan dari new Date() di HP pengunjung: zona waktu ikut otomatis (WIB/WITA/WIT dst), tanpa API, tanpa izin lokasi, aman offline.
   Fase bulan & hujan meteor sama di seluruh dunia (beda paling sehari karena zona waktu). Nama sektor (Winter dst) cuma label musim belahan utara;
   yang dihitung adalah posisi bintang asli (jam sideris lokal ~ dari offset zona waktu, akurat ±0.5 jam), bukan musim.
   Tab Planet: posisi planet dihitung murni JS dari elemen orbit Keplerian JPL (Standish, tabel 1, valid 1800-2050; Bumi = EM Bary), tanpa API. Akurasi waktu kejadian ±beberapa jam (Jupiter/Saturnus yang
   paling kasar, galat elemen ~0.1-0.2 derajat), jadi UI memberi label "perkiraan". Setelah 2050 tab Planet disembunyikan. Dihitung hanya saat panel dibuka (hasil kejadian di-cache sampai kejadiannya lewat).
   Dites ke kejadian asli: oposisi Mars 19 Feb 2027, Jupiter 10 Jan 2026, Saturnus 4 Okt 2026, konjungsi inferior Venus 24 Okt 2026, elongasi barat terbesar Venus 3 Jan 2027 (47 derajat).
   Dipakai: 04-render.js drawShooting() -> ssK(); 16-sector-menu.js smenuRefresh() -> tonight(). Pil dibuat sendiri (body > #sky-pill). Semua dengan guard typeof. */
'use strict';
var SKYNOW=(function(){
  var SYN=29.530588861,DAY=864e5,R=Math.PI/180;
  /* [nama, bulan, tanggal puncak]. Puncak asli bergeser ±1 hari per tahun, jadi toleransi dipakai di shower(). */
  var SHOWERS=[['Quadrantids',1,4],['Lyrids',4,22],['Eta Aquariids',5,6],['Delta Aquariids',7,30],['Perseids',8,12],['Orionids',10,21],['Leonids',11,17],['Geminids',12,14],['Ursids',12,22]];
  /* RA tengah (jam) tiap sektor = rata-rata RA rasi di dalamnya (selisih antar sektor ~6 jam) */
  var SECT_RA={winter:5.9,spring:12,summer:18.7,autumn:1.3};
  var mc=null,tn={hk:-1,key:null},sh={dk:-1,v:null},pill=null,pillMk=-1,P={el:null,open:false,t:0,iv:0,tab:'moon',jk:[0,0]},plc={};
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
    /* pil Fase Astronomi: tengah atas, sejajar tengah-vertikal dengan tombol owl (34px, 31px di <=600) dan #live-count */
    '#sky-pill{position:fixed;left:50%;top:calc(18px + env(safe-area-inset-top,0px));z-index:6;transform:translateX(-50%);display:inline-flex;align-items:center;gap:5px;height:26px;box-sizing:border-box;margin:0;padding:0 10px 0 8px;border:1px solid rgba(110,229,255,.34);border-radius:13px;background:rgba(6,11,17,.5);color:rgba(214,238,248,.92);font:600 8.5px/1 "Space Grotesk",system-ui,sans-serif;letter-spacing:.1em;text-transform:uppercase;white-space:nowrap;cursor:pointer;-webkit-appearance:none;appearance:none;-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;text-shadow:0 0 7px rgba(110,229,255,.16)}'+
    '#sky-pill svg{width:13px;height:13px;flex:none}#sky-pill:active{background:rgba(110,229,255,.22)}'+
    '@media (max-width:600px){#sky-pill{top:calc(16.5px + env(safe-area-inset-top,0px))}}'+
    '@media (max-width:520px){#sky-pill{font-size:7.5px;letter-spacing:.08em;padding:0 9px 0 7px}}'+
    '@media (max-width:350px){#sky-pill{font-size:6.8px;letter-spacing:.05em;gap:4px;padding:0 7px 0 6px}#sky-pill svg{width:11px;height:11px}}'+
    'body.tesseract-running #sky-pill,body.observe-mode #sky-pill,body.camera-mode #sky-pill,body.layout-edit #sky-pill{display:none}'+
    'body.sw #sky-pill{opacity:0!important;pointer-events:none;transition:opacity .65s ease-in .12s!important}'+
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
    '#sky-moon .skp-tabs{display:flex;gap:4px;margin:0 0 14px;padding:3px;border:1px solid rgba(110,229,255,.16);border-radius:9px;background:rgba(110,229,255,.04)}'+
    '#sky-moon .skp-tab{flex:1;height:30px;border:0;border-radius:6px;background:transparent;color:rgba(214,238,248,.6);font-size:10.5px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;cursor:pointer;-webkit-tap-highlight-color:transparent}'+
    '#sky-moon .skp-tab.on{background:rgba(110,229,255,.14);color:#eaf8ff}'+
    '#sky-moon .skp-pane[hidden],#sky-moon .skp-tabs[hidden]{display:none}'+
    '#sky-moon .skp-pl{padding:12px 0 2px;border-top:1px solid rgba(110,229,255,.1)}#sky-moon .skp-pl:first-child{border-top:0;padding-top:2px}'+
    '#sky-moon .skp-ph{display:flex;align-items:center;gap:12px}'+
    '#sky-moon .skp-pi{flex:none;display:block;filter:drop-shadow(0 0 5px rgba(160,220,255,.28))}'+
    '#sky-moon .skp-pn{flex:1;min-width:0}#sky-moon .skp-pn b{display:block;font-size:13px;font-weight:700;letter-spacing:.16em;text-transform:uppercase}'+
    '#sky-moon .skp-pn small{display:block;font-size:10.5px;opacity:.7;letter-spacing:.04em;margin-top:3px;line-height:1.35}'+
    '#sky-moon .skp-pl .skp-bar{margin:14px 9px 32px}#sky-moon .skp-pl .skp-tk{top:11px;display:block;line-height:0}'+
    '#sky-moon .skp-nx{display:flex;align-items:center;gap:10px;padding-bottom:6px}'+
    '#sky-moon .skp-apx{opacity:.55}'+
    '#sky-moon .skp-far .skp-pi{opacity:.38}#sky-moon .skp-no{display:flex;align-items:center;gap:5px;color:rgba(255,196,130,.92);opacity:1!important}'+
    '#sky-moon .skp-pl .skp-bar.skp-bar0{height:0;margin:10px 9px 12px;background:none;border-top:1px dashed rgba(110,229,255,.24);border-radius:0}'+
    '#sky-moon .skp-jk{font-size:11.5px;line-height:1.5;opacity:.82;padding:0 2px 8px}'+
    'body.ls #sky-moon{left:calc(-1 * var(--gut,0px));right:calc(-1 * var(--gut,0px))}'+
    '@media (prefers-reduced-motion:reduce){#sky-moon{transition:none}}';
  function css(){if(document.getElementById('sky-moon-css'))return;var s=document.createElement('style');s.id='sky-moon-css';s.textContent=CSS;document.head.appendChild(s);}
  /* Pil "Fase Astronomi": SATU node di body (tidak lagi anak #bh-clock, jadi tidak kena dilatasi jam). Ikon = fase bulan sekarang, diperbarui tiap menit. */
  function pillUpd(){
    var c=cur();
    if(!pill||pillMk===c.mk)return;
    pill.innerHTML=moonSvg(c.p,13)+'<span>'+tx('sky.ap.ttl')+'</span>';
    pill.setAttribute('aria-label',tx('sky.ap.ttl'));pillMk=c.mk;
  }
  function mkPill(){
    if(pill)return;
    if(!document.body){document.addEventListener('DOMContentLoaded',mkPill,{once:true});return;}
    css();pill=document.createElement('button');pill.type='button';pill.id='sky-pill';
    pill.addEventListener('pointerdown',function(e){e.stopPropagation();},false);   /* jangan dihitung drag langit / tap sky */
    pill.addEventListener('click',function(e){e.stopPropagation();e.preventDefault();openPanel();},false);
    document.body.appendChild(pill);pillUpd();
    setInterval(function(){if(!document.hidden)pillUpd();},30000);
  }
  function build(){
    if(P.el)return;
    css();
    var a=P.el=document.createElement('div'),i,h='';
    a.id='sky-moon';a.hidden=true;a.setAttribute('role','dialog');a.setAttribute('aria-modal','true');
    for(i=0;i<5;i++)h+='<span class="skp-tk" style="left:'+(i*25)+'%">'+moonSvg(i/4,16)+'</span>';
    a.innerHTML='<div class="skp-bd"></div><div class="skp-card" tabindex="-1"><button type="button" class="skp-x" data-a="x">\u00d7</button>'+
      '<div class="skp-ttl"></div>'+
      '<div class="skp-tabs" role="tablist"><button type="button" class="skp-tab on" role="tab" data-t="moon"></button><button type="button" class="skp-tab" role="tab" data-t="pl"></button></div>'+
      '<div class="skp-pane" data-p="moon"><div class="skp-hero"><div class="skp-big"></div><div><div class="skp-nm"></div><div class="skp-sub"></div></div></div>'+
      '<div class="skp-bar"><div class="skp-fill"></div><div class="skp-mk"></div>'+h+'</div>'+
      '<div class="skp-h" data-k="next"></div><ul class="skp-ev"></ul>'+
      '<div class="skp-h" data-k="shw"></div><ul class="skp-sh"></ul><div class="skp-ft"></div></div>'+
      '<div class="skp-pane" data-p="pl" hidden><div class="skp-pls"></div><div class="skp-ft skp-pft"></div></div></div>';
    document.body.appendChild(a);
    /* isolasi penuh seperti #sect-menu: tidak tembus ke langit / BH / teleskop */
    ['pointerdown','pointerup','pointercancel','pointermove','touchstart','touchmove','touchend','wheel','contextmenu','mousedown','mouseup'].forEach(function(tp){
      a.addEventListener(tp,function(e){e.stopPropagation();},{passive:true,capture:true});
    });
    a.addEventListener('click',function(e){
      e.stopPropagation();
      if(performance.now()-P.t<400){e.preventDefault();return;}   /* klik susulan dari tap yang MEMBUKA panel */
      var t=e.target,tb=t.closest&&t.closest('[data-t]'),b=t.closest&&t.closest('[data-a]');
      if(tb){setTab(tb.getAttribute('data-t'));try{UIS.tap();}catch(e0){}try{haptic(4);}catch(e1){}return;}
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
  function renderMoon(){
    var c=cur(),a=P.el,now=Date.now(),L=tx('sky.ph').split('|'),EV=tx('sky.moon.ev').split('|'),h='',i,e,ns,u=tx('sky.u').split('|'),dn=tx('clock.days').split('|'),mn=tx('clock.months').split('|'),sd;
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
  /* ---------- tab Planet ---------- */
  /* Elemen Keplerian JPL (Standish, "Keplerian Elements for Approximate Positions of the Major Planets", tabel 1, 1800-2050), per abad dari J2000:
     [a,da, e,de, I,dI, L,dL, lonPeri,d, lonNode,d]. Bumi = EM Bary. Cukup 6 planet: Uranus & Neptunus tidak dihitung (di luar jangkauan mata telanjang). */
  var EL={
    mer:[.38709927,.00000037,.20563593,.00001906,7.00497902,-.00594749,252.2503235,149472.67411175,77.45779628,.16047689,48.33076593,-.12534081],
    ven:[.72333566,.0000039,.00677672,-.00004107,3.39467605,-.0007889,181.9790995,58517.81538729,131.60246718,.00268329,76.67984255,-.27769418],
    ear:[1.00000261,.00000562,.01671123,-.00004392,-.00001531,-.01294668,100.46457166,35999.37244981,102.93768193,.32327364,0,0],
    mar:[1.52371034,.00001847,.0933941,.00007882,1.84969142,-.00813131,-4.55343205,19140.30268499,-23.94362959,.44441088,49.55953891,-.29257343],
    jup:[5.202887,-.00011607,.04838624,-.00013253,1.30439695,-.00183714,34.39644051,3034.74612775,14.72847983,.21252668,100.47390909,.20469106],
    sat:[9.53667594,-.0012506,.05386179,-.00050991,2.48599187,.00193609,49.95424423,1222.49362201,92.59887831,-.41897216,113.66242448,-.28867794]
  };
  var PLN=[{k:'mer',inf:1,c:'#c9c2b6'},{k:'ven',inf:1,c:'#f6e7b4'},{k:'mar',inf:0,c:'#ff8f63'},{k:'jup',inf:0,c:'#e9cfa5'},{k:'sat',inf:0,c:'#e8d48f'}],
      FARC=['#9fe3e8','#7f98ff'],PL_END=Date.UTC(2050,0,1);
  function plOk(){return Date.now()<PL_END;}
  function helio(k,T){
    var e=EL[k],a=e[0]+e[1]*T,ec=e[2]+e[3]*T,I=(e[4]+e[5]*T)*R,w=e[8]+e[9]*T,O=(e[10]+e[11]*T)*R,
        M=((((e[6]+e[7]*T)-w)%360)+540)%360-180,E,i,d,Mr=M*R,om=w*R-O,xp,yp,co=Math.cos(om),so=Math.sin(om),cO=Math.cos(O),sO=Math.sin(O),cI=Math.cos(I),sI=Math.sin(I);
    E=Mr+ec*Math.sin(Mr);
    for(i=0;i<8;i++){d=(E-ec*Math.sin(E)-Mr)/(1-ec*Math.cos(E));E-=d;if(Math.abs(d)<1e-11)break;}
    xp=a*(Math.cos(E)-ec);yp=a*Math.sqrt(1-ec*ec)*Math.sin(E);
    return [(co*cO-so*sO*cI)*xp+(-so*cO-co*sO*cI)*yp,(co*sO+so*cO*cI)*xp+(-so*sO+co*cO*cI)*yp,so*sI*xp+co*sI*yp];
  }
  /* geosentris dari Bumi: dl = selisih bujur ekliptika planet-Matahari (-180..180, + = timur Matahari), el = elongasi 3D (derajat), ill = fraksi terang piringan */
  function geo(k,ms){
    var T=(jd(ms)-2451545)/36525,p=helio(k,T),e=helio('ear',T),x=p[0]-e[0],y=p[1]-e[1],z=p[2]-e[2],
        r=Math.sqrt(p[0]*p[0]+p[1]*p[1]+p[2]*p[2]),D=Math.sqrt(x*x+y*y+z*z),Rr=Math.sqrt(e[0]*e[0]+e[1]*e[1]+e[2]*e[2]),
        ce=(-x*e[0]-y*e[1]-z*e[2])/(D*Rr),ci=(r*r+D*D-Rr*Rr)/(2*r*D);
    return {dl:(((Math.atan2(y,x)-Math.atan2(-e[1],-e[0]))/R+540)%360)-180,el:Math.acos(Math.max(-1,Math.min(1,ce)))/R,ill:(1+ci)/2};
  }
  function bis(f,a,b){var fa=f(a),m,i;for(i=0;i<28;i++){m=(a+b)/2;if((f(m)<=0)===(fa<=0))a=m;else b=m;}return (a+b)/2;}
  /* konjungsi (bujur sama) terdekat sebelum (dir -1) / sesudah (+1) t0; up = bujur relatif naik lewat 0 (konjungsi superior) */
  function conj(k,t0,dir){
    var t=t0,a=geo(k,t).dl,b,i,f=function(x){return geo(k,x).dl;};
    for(i=0;i<760;i++){
      b=geo(k,t+dir*DAY).dl;
      if(a*b<=0&&Math.abs(a)<90&&Math.abs(b)<90)return {t:dir>0?bis(f,t,t+DAY):bis(f,t-DAY,t),up:(dir>0?a:b)<0};
      t+=dir*DAY;a=b;
    }
    return null;
  }
  function elMax(k,t1,t2){
    var a=t1,b=t2,i,m1,m2;
    for(i=0;i<48;i++){m1=a+(b-a)/3;m2=b-(b-a)/3;if(geo(k,m1).el<geo(k,m2).el)a=m1;else b=m2;}
    return (a+b)/2;
  }
  /* Planet inferior: siklus konjungsi superior(0) -> elongasi timur(1) -> konjungsi inferior(2) -> elongasi barat(3). prev/next = kejadian yang apit sekarang. */
  function infState(k,now){
    var cp=conj(k,now,-1),cn=conj(k,now,1),m,s0,ev,i,A,B;
    if(!cp||!cn)return null;
    m=elMax(k,cp.t,cn.t);s0=cp.up?0:2;
    ev=[[cp.t,s0],[m,s0+1],[cn.t,(s0+2)%4]];
    i=now<m?0:1;A=ev[i];B=ev[i+1];
    return {st:A[1],prev:A[0],next:B[0],ns:B[1],nel:(B[1]&1)?geo(k,B[0]).el:0};
  }
  /* Planet superior: u = bujur Matahari - bujur planet (0..360, selalu naik). Konjungsi(0) -> kuadratur barat(90) -> oposisi(180) -> kuadratur timur(270). */
  function uAt(k,t){return ((-geo(k,t).dl)%360+360)%360;}
  function supState(k,now){
    var u=uAt(k,now),s=Math.floor(u/90)%4,tn=((s+1)%4)*90,tp=s*90,t,a,b,i,nx=null,pv=null,
        hn=function(x){return ((uAt(k,x)-tn+540)%360)-180;},hp=function(x){return ((uAt(k,x)-tp+540)%360)-180;};
    a=hn(now);t=now;
    for(i=0;i<460;i++){b=hn(t+DAY);if(a<0&&b>=0&&b<90){nx=bis(hn,t,t+DAY);break;}a=b;t+=DAY;}
    a=hp(now);t=now;
    for(i=0;i<460;i++){b=hp(t-DAY);if(a>=0&&b<0&&b>-90){pv=bis(hp,t-DAY,t);break;}a=b;t-=DAY;}
    if(nx===null||pv===null)return null;
    return {st:s,prev:pv,next:nx,ns:(s+1)%4,nel:0};
  }
  /* semua planet: kejadian di-cache sampai lewat, sisanya (elongasi, terang) dihitung ulang tiap render */
  function plAll(now){
    var out=[],i,d,c,g,u;
    for(i=0;i<PLN.length;i++){
      d=PLN[i];
      try{
        c=plc[i];
        if(!c||now<c.prev||now>=c.next){c=d.inf?infState(d.k,now):supState(d.k,now);plc[i]=c;}
        if(!c)continue;
        g=geo(d.k,now);u=uAt(d.k,now);
        out.push({i:i,inf:d.inf,c:d.c,st:c.st,ns:c.ns,prev:c.prev,next:c.next,nel:c.nel,p:(c.st+(now-c.prev)/(c.next-c.prev))/4,dl:g.dl,el:g.el,ill:g.ill,u:u});
      }catch(e){}
    }
    return out;
  }
  /* diagram konfigurasi (dilihat dari atas): Matahari di tengah, Bumi di bawah, planet di posisinya (timur Matahari = kiri, searah gerak planet) */
  function cfgSvg(inf,s,col,px){
    var Re=inf?7.2:4.2,r=inf?5.2:8.2,ey=10+Re,x=10,y=10-r,al,sg;
    if(s===2){y=10+r;}
    else if(s===1||s===3){
      if(inf){al=Math.acos(r/Re);sg=s===1?-1:1;x=10+sg*r*Math.sin(al);y=10+r*Math.cos(al);}
      else{sg=s===1?1:-1;x=10+sg*Math.sqrt(r*r-Re*Re);y=ey;}
    }
    return '<svg viewBox="0 0 20 20" width="'+px+'" height="'+px+'" aria-hidden="true" style="display:block"><circle cx="10" cy="10" r="'+Re+'" fill="none" stroke="currentColor" stroke-opacity=".3" stroke-width=".6"/>'+
      '<circle cx="10" cy="10" r="'+r+'" fill="none" stroke="currentColor" stroke-opacity=".22" stroke-width=".6"/>'+
      '<line x1="10" y1="'+ey+'" x2="'+x.toFixed(2)+'" y2="'+y.toFixed(2)+'" stroke="currentColor" stroke-opacity=".5" stroke-width=".7"/>'+
      '<circle cx="10" cy="10" r="1.9" fill="#ffcf6e"/><circle cx="10" cy="'+ey+'" r="1.2" fill="#6ee5ff"/><circle cx="'+x.toFixed(2)+'" cy="'+y.toFixed(2)+'" r="1.6" fill="'+col+'"/></svg>';
  }
  var EYE0='<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex:none"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/><path d="M3 3l18 18"/></svg>';
  /* fase piringan untuk moonSvg: sisi terang menghadap Matahari (senja/timur = bentuk seperti bulan muda, fajar/barat = bulan tua) */
  function discP(ill,east){var q=Math.acos(Math.max(-1,Math.min(1,1-2*ill)))/(2*Math.PI);return east?q:1-q;}
  function plRow(r,nm){
    var L=tx(r.inf?'sky.pl.inf':'sky.pl.sup').split('|'),east=r.dl>0,sub=[],vis,h='',i,u=tx('sky.u').split('|'),vk;
    if(r.inf)vk=r.el<12?'sun':(east?'eve':'mor');
    else vk=r.el<25?'sun':(r.u<155?'mor':(r.u<205?'all':'eve'));
    vis=tx('sky.pl.v.'+vk+((!r.inf&&(vk==='eve'||vk==='mor'))?'2':''));
    sub.push(vis+' \u00b7 '+tx('sky.pl.el',{d:Math.round(r.el),s:tx(east?'sky.pl.e':'sky.pl.w')}));
    if(r.inf)sub.push(tx('sky.pl.lit',{p:Math.round(r.ill*100)}));
    for(i=0;i<5;i++)h+='<span class="skp-tk" style="left:'+(i*25)+'%">'+cfgSvg(r.inf,i%4,r.c,18)+'</span>';
    return '<div class="skp-pl"><div class="skp-ph"><span class="skp-pi" style="color:'+r.c+'">'+moonSvg(discP(r.ill,east),34)+'</span><div class="skp-pn"><b>'+nm+'</b><small>'+sub.join('<br>')+'</small></div></div>'+
      '<div class="skp-bar"><div class="skp-fill" style="width:'+(r.p*100).toFixed(1)+'%"></div><div class="skp-mk" style="left:'+(r.p*100).toFixed(1)+'%"></div>'+h+'</div>'+
      '<div class="skp-nx"><div class="skp-en"><b>'+L[r.ns]+((r.nel&&r.nel>0)?' \u00b7 '+Math.round(r.nel)+'\u00b0':'')+'</b><small>'+fmtDate(r.next)+' \u00b7 <span class="skp-apx">'+tx('sky.pl.apx')+'</span></small></div><span class="skp-in">'+fmtIn(r.next-Date.now())+'</span></div></div>';
  }
  function farRow(j,nm){
    var jk=tx(j?'sky.pl.nj':'sky.pl.uj').split('|');
    return '<div class="skp-pl skp-far"><div class="skp-ph"><span class="skp-pi" style="color:'+FARC[j]+'">'+moonSvg(.5,34)+'</span><div class="skp-pn"><b>'+nm+'</b><small class="skp-no">'+EYE0+'<span>'+tx('sky.pl.far')+'</span></small></div></div>'+
      '<div class="skp-bar skp-bar0"></div><div class="skp-jk">'+jk[P.jk[j]%jk.length]+'</div></div>';
  }
  function renderPl(){
    var a=P.el,rows=plAll(Date.now()),nm=tx('sky.pl.nm').split('|'),h='',i;
    for(i=0;i<rows.length;i++)h+=plRow(rows[i],nm[rows[i].i]);
    h+=farRow(0,nm[5])+farRow(1,nm[6]);
    a.querySelector('.skp-pls').innerHTML=h;
    a.querySelector('.skp-pft').textContent=tx('sky.pl.ft');
  }
  function render(){
    var a=P.el,t=P.tab==='pl'&&plOk()?'pl':'moon',tb=a.querySelector('.skp-tabs'),ts=tb.children,i;
    a.querySelector('.skp-ttl').textContent=tx('sky.ap.ttl');
    ts[0].textContent=tx('sky.tab.moon');ts[1].textContent=tx('sky.tab.pl');
    tb.hidden=!plOk();   /* elemen orbit hanya valid sampai 2050 */
    for(i=0;i<2;i++){ts[i].classList.toggle('on',ts[i].getAttribute('data-t')===t);ts[i].setAttribute('aria-selected',ts[i].getAttribute('data-t')===t?'true':'false');}
    a.querySelector('[data-p=moon]').hidden=t!=='moon';a.querySelector('[data-p=pl]').hidden=t!=='pl';
    if(t==='pl')renderPl();else renderMoon();
  }
  function setTab(t){
    if(t!=='pl'&&t!=='moon')return;
    P.tab=t;render();
    try{P.el.querySelector('.skp-card').scrollTop=0;}catch(e){}
  }
  function openPanel(){
    build();
    if(P.open)return;
    P.open=true;P.t=performance.now();P.jk=[Math.floor(Math.random()*9),Math.floor(Math.random()*9)];render();
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
  mkPill();
  return {moonAttach:function(){},isOpen:function(){return P.open;},close:closePanel,tonight:tonight,shower:shower,ssK:ssK,phase:cur,phaseMs:phaseMs,planets:plAll,planetsOk:plOk};
})();
