/* 22-sky-now.js — "Langit malam ini": fase bulan (jam), sektor yang lagi tertinggi (menu sektor), hujan meteor (frekuensi meteor + toast).
   Murni hitungan dari new Date() di HP pengunjung: zona waktu ikut otomatis (WIB/WITA/WIT dst), tanpa API, tanpa izin lokasi, aman offline.
   Fase bulan & hujan meteor sama di seluruh dunia (beda paling sehari karena zona waktu). Nama sektor (Winter dst) cuma label musim belahan utara;
   yang dihitung adalah posisi bintang asli (jam sideris lokal ~ dari offset zona waktu, akurat ±0.5 jam), bukan musim.
   Dipakai: 02-sky-logic.js tickClock() -> moonHtml(); 04-render.js drawShooting() -> ssK(); 16-sector-menu.js smenuRefresh() -> tonight(). Semua dengan guard typeof. */
'use strict';
var SKYNOW=(function(){
  var SYN=29.530588853,DAY=864e5,EPOCH=2451550.26;   /* bulan baru acuan 6 Jan 2000 18:14 UTC */
  /* [nama, bulan, tanggal puncak]. Puncak asli bergeser ±1 hari per tahun, jadi toleransi dipakai di shower(). */
  var SHOWERS=[['Quadrantids',1,4],['Lyrids',4,22],['Eta Aquariids',5,6],['Delta Aquariids',7,30],['Perseids',8,12],['Orionids',10,21],['Leonids',11,17],['Geminids',12,14],['Ursids',12,22]];
  /* RA tengah (jam) tiap sektor = rata-rata RA rasi di dalamnya (selisih antar sektor ~6 jam) */
  var SECT_RA={winter:5.9,spring:12,summer:18.7,autumn:1.3};
  var mc={mk:-1,html:''},tn={hk:-1,key:null},sh={dk:-1,v:null};
  function jd(ms){return ms/DAY+2440587.5;}
  function moon(ms){
    var x=(jd(ms)-EPOCH)/SYN,age=((x%1)+1)%1*SYN;
    return {age:age,ill:(1-Math.cos(2*Math.PI*age/SYN))/2,lun:x};
  }
  /* ikon fase: setengah lingkaran sisi terang + elips terminator (rx = |cos| fase). Ikut warna jam (currentColor). */
  function moonHtml(){
    var now=Date.now(),mk=Math.floor(now/6e4);
    if(mc.mk===mk)return mc.html;
    var m=moon(now),p=m.age/SYN,wax=p<.5,rx=(4*Math.abs(Math.cos(2*Math.PI*p))).toFixed(2),
        inner=wax?(p<.25?0:1):(p<.75?0:1),
        d=(wax?'M5 1A4 4 0 0 1 5 9':'M5 1A4 4 0 0 0 5 9')+'A'+rx+' 4 0 0 '+inner+' 5 1Z';
    mc.mk=mk;
    mc.html='<span style="display:inline-flex;align-items:center;gap:2px;margin-left:7px;vertical-align:middle"><svg viewBox="0 0 10 10" width="9" height="9" aria-hidden="true" style="display:block">'+
      '<circle cx="5" cy="5" r="4" fill="none" stroke="currentColor" stroke-opacity=".4" stroke-width=".8"/><path d="'+d+'" fill="currentColor"/></svg>'+Math.round(m.ill*100)+'%</span>';
    return mc.html;
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
    var now=Date.now(),s=shower(),m=moon(now),txt=null,key=null,st=null;
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
  return {moonHtml:moonHtml,tonight:tonight,shower:shower,ssK:ssK,moon:moon};
})();
