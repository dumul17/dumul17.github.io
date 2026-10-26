'use strict';
/* 18-tune3d.js — tab tuning Planet / Drone / Portal (+ Milky Way overview) di panel owl > Settings (#bh-panel).
   Dimuat PALING AKHIR (setelah 14-drone3d, 15-portal3d, 17-planet3d) supaya semua CFG-nya sudah ada.
   Cara kerja: tiap grup = satu objek CFG (PL3D_CFG / DR3D_CFG / PT3D_CFG / MW) + daftar baris. Angka di CFG saat file ini jalan = DEFAULT
   (snapshot sebelum nilai tersimpan dimuat). Slider dibuat dari daftar ini ke dalam .bp-page[data-page] (HTML-nya cuma wadah kosong), jadi gaya,
   scrub (owl-scrub-row), dan Save/Reset sama dengan tab lain. Save -> localStorage (dumul_tune_pl / _dr / _pt, dumul_mw_cfg); Reset -> hapus + balik ke default.
   05-sector-ui.js (bhTune) memanggil API T3D di bawah: has / ok / paint / dirty / save / reset.
   Baris: [path, label EN, label ID, min, max, skala, desimal, satuan, flag] — slider = round(nilai*skala); flag 't' = toggle, 'i' = terbalik (1 - nilai), 'o' = baris cuma di overview, 's' = cuma di sektor (tanpa o/s = dua-duanya; panel menyembunyikan baris yang tidak berlaku di konteks sekarang lewat data-ctx). */
var T3D=(function(){
  var ID=(function(){try{return window.I18N&&I18N.lang==='id';}catch(e){return false;}})(),G={},ORDER=['pl','dr','pt','mw'];
  function lb(en,id){return ID?id:en;}
  function pget(o,p){var a=p.split('.'),i;for(i=0;i<a.length;i++){if(o==null)return;o=o[a[i]];}return o;}
  function pset(o,p,v){var a=p.split('.'),i;for(i=0;i<a.length-1;i++){o=o[a[i]];if(!o)return;}o[a[a.length-1]]=v;}
  function clamp(v,a,b){return v<a?a:v>b?b:v;}
  function fill(el){var mn=+el.min,mx=+el.max;el.style.setProperty('--p',((+el.value-mn)/((mx-mn)||1)*100)+'%');}
  function ttxt(on){try{return T(on?'tune.on':'tune.off');}catch(e){return on?'On':'Off';}}
  function lsGet(k){try{return JSON.parse(localStorage.getItem(k)||'null');}catch(e){return null;}}

  /* ---------- definisi grup ---------- */
  function defGroup(id,o){o.id=id;o.rows=o.rows.map(function(r){return{p:r[0],en:r[1],id:r[2],min:r[3],max:r[4],sc:r[5],d:r[6],u:r[7],t:/t/.test(r[8]||''),inv:/i/.test(r[8]||''),ctx:/o/.test(r[8]||'')?'ov':(/s/.test(r[8]||'')?'sc':''),el:null,out:null,sw:null};});G[id]=o;}

  defGroup('pl',{key:'dumul_tune_pl',root:function(){return window.PL3D_CFG;},
    en:'PLANET SETTINGS SAVED',idt:'SETELAN PLANET TERSIMPAN',
    after:function(p){try{PL3D.dirty=true;if(p==='ovDy')PL3D.topC=null;}catch(e){}},
    rows:[
      ['rK','Curve','Lengkung',3,40,2,1,'',''],
      ['ovDy','Horizon','Horizon',-.2,.1,100,0,'%','o'],
      ['cell','Cell','Sel',40,260,1,0,'px',''],
      ['persp','Persp','Perspektif',20,300,1,0,'',''],
      ['haze','Haze','Kabut',0,240,1,0,'px',''],
      ['hazeA','Haze α','Kabut α',0,1,100,0,'%',''],
      ['cloud','Cloud','Awan',0,1,100,0,'%',''],
      ['cloudCov','Cover','Sebaran',0,1,100,0,'%',''],
      ['cloudH','Cloud H','Tinggi awan',0,60,1,0,'×',''],
      ['lod','Detail','Detail',.05,1,100,2,'×',''],
      ['fadeS','Fade','Pudar',0,80,1,0,'px',''],
      ['rockD','Rocks','Batu',0,1,100,0,'%','i'],
      ['rockSz','Rock size','Ukuran batu',.05,1.5,100,2,'×',''],
      ['rotK','Spin','Putar',0,3,100,2,'×',''],
      ['libr.lat','Sway Y','Ayun Y',0,.03,1000,1,'\u2030','s'],
      ['libr.tilt','Sway tilt','Ayun miring',0,.05,1000,1,'\u2030','s'],
      ['par','Parallax','Paralaks',0,.15,1000,0,'\u2030',''],
      ['zoomK','Zoom','Zoom',0,.4,100,2,'×',''],
      ['atmK','Atmos','Atmosfer',0,3,100,2,'×',''],
      ['fallK','Light','Cahaya',.3,3,100,2,'×',''],
      ['bhSink','BH sink','BH terbenam',0,1,100,2,'×',''],
      ['teleSink','Tele sink','Tele terbenam',0,1,100,2,'×',''],
      ['fps','Rate','Laju',1,15,1,0,'/s','']
    ]});

  defGroup('dr',{key:'dumul_tune_dr',root:function(){return window.DR3D_CFG;},
    en:'DRONE SETTINGS SAVED',idt:'SETELAN DRONE TERSIMPAN',
    after:function(){},
    rows:[
      ['size','Size','Ukuran',12,72,1,0,'px',''],
      ['spin','Spin','Putar',0,4,100,2,'×',''],
      ['bob','Float','Melayang',0,3,100,2,'×',''],
      ['lean','Lean','Condong',0,3,100,2,'×',''],
      ['flame','Flame','Api',0,2.5,100,2,'×',''],
      ['turn','Turn','Tolehan',.2,4,100,2,'×',''],
      ['light','Light','Cahaya',0,2.5,100,2,'×',''],
      ['halo','Halo','Halo',0,3,100,2,'×','']
    ]});

  defGroup('pt',{key:'dumul_tune_pt',root:function(){return window.PT3D_CFG;},
    en:'PORTAL SETTINGS SAVED',idt:'SETELAN PORTAL TERSIMPAN',
    after:function(){},
    rows:[
      ['ovMenu','Size','Ukuran',.2,1.2,100,2,'×','o'],
      ['orb.on','Orbit','Orbit',0,1,1,0,'','to'],
      ['orb.per','Period','Periode',20,240,1,0,'s','o'],
      ['orb.ax','Orbit W','Lebar orbit',.05,.45,100,1,'%','o'],
      ['orb.ay','Orbit H','Tinggi orbit',0,.25,100,1,'%','o'],
      ['orb.depth','Depth','Kedalaman',0,.2,100,1,'%','o'],
      ['orb.bob','Bob','Naik-turun',0,8,10,1,'px','o'],
      ['orb.gap','Gap','Jarak limb',0,2,100,2,'×','o'],
      ['spin','Spin','Putar',0,.8,100,2,'',''],
      ['glow','Glow','Pendar',0,3,100,2,'×',''],
      ['tilt.x','Pitch','Pitch',-1,1,100,2,'',''],
      ['tilt.y','Yaw','Yaw',0,1.4,100,2,'',''],
      ['tilt.z','Roll','Roll',-1,1,100,2,'',''],
      ['mouthStars','Stars','Bintang',0,80,1,0,'',''],
      ['boltMax','Bolts','Petir',0,16,1,0,'',''],
      ['boltW','Bolt W','Tebal petir',.1,1.2,100,2,'×',''],
      ['secK','Exit','Mulut keluar',.2,1.2,100,2,'×','s']
    ]});

  /* Milky Way overview: nilai default + loader ada di 02-sky-logic.js (MW_DEF / mwTuneSet), jadi di sini tidak dimuat ulang */
  defGroup('mw',{key:'dumul_mw_cfg',noLoad:true,box:'t3-mw',root:function(){return(typeof MW_DEF!=='undefined')?window.MW:null;},
    en:'SKY SETTINGS SAVED',idt:'SETELAN LANGIT TERSIMPAN',
    get:function(p){return p==='mirror'?(MW.mirror?1:0):MW[p];},
    set:function(p,v){mwTuneSet(p,v);},
    defOf:function(p){return MW_DEF[p];},
    after:function(){},
    rows:[
      ['A','Strength','Kekuatan',0,1,100,0,'%',''],
      ['scale','Scale','Skala',.6,2.5,100,0,'%',''],
      ['vx','Drift','Geser',-12,12,10,1,'/s',''],
      ['zf','Zoom','Ikut zoom',0,1,100,0,'%',''],
      ['pf','Parallax','Paralaks',0,.5,100,0,'%',''],
      ['mirror','Mirror','Cermin',0,1,1,0,'','t']
    ]});

  /* ---------- nilai ---------- */
  function rootOf(g){try{return g.root();}catch(e){return null;}}
  function vget(g,r){var v=g.get?g.get(r.p):pget(rootOf(g),r.p);if(r.t)return v?1:0;v=+v;if(!isFinite(v))v=g.def[r.p];return r.inv?1-v:v;}
  function vset(g,r,v){
    if(r.t)v=v?1:0;else{v=clamp(+v,r.min,r.max);if(r.inv)v=1-v;}
    if(g.set)g.set(r.p,v);else if(r.t)pset(rootOf(g),r.p,!!v);else pset(rootOf(g),r.p,v);
    g.after(r.p);
  }
  function show(r,v){
    if(r.t)return ttxt(v);
    var m=r.u==='%'?100:(r.u==='\u2030'?1000:1),pv=v*m;   /* % = x100, per-mil = x1000 (angka kecil: ayunan, parallax) */
    return(r.d?pv.toFixed(r.d):String(Math.round(pv)))+r.u;
  }

  /* ---------- default + simpanan ---------- */
  function snapshot(g){
    g.def={};var o=rootOf(g);if(!o){g.dead=1;return;}
    g.rows.forEach(function(r){
      var v=g.defOf?g.defOf(r.p):(r.t?(pget(o,r.p)?1:0):pget(o,r.p));
      if(typeof v!=='number'||!isFinite(v)){if(!r.t){g.dead=1;}v=r.t?0:r.min;}
      g.def[r.p]=v;
    });
  }
  function loadSaved(g){
    if(g.noLoad||g.dead)return;
    var o=lsGet(g.key);if(!o||typeof o!=='object')return;
    g.rows.forEach(function(r){var raw=o[r.p];if(typeof raw==='number'&&isFinite(raw))vset(g,r,r.t?raw:(r.inv?1-raw:raw));});   /* simpanan = nilai CFG apa adanya */
  }
  function rawGet(g,r){var v=g.get?g.get(r.p):pget(rootOf(g),r.p);return r.t?(v?1:0):+v;}
  function stored(g){var o=lsGet(g.key),s={};g.rows.forEach(function(r){s[r.p]=(o&&typeof o[r.p]==='number')?o[r.p]:g.def[r.p];});return s;}

  /* ---------- UI ---------- */
  function build(g){
    if(g.built||g.dead)return;
    var host=g.box?document.getElementById(g.box):document.querySelector('#bh-panel .bp-page[data-page="'+g.id+'"]');
    if(!host)return;
    g.built=1;g.host=host;
    var frag=document.createDocumentFragment();
    g.rows.forEach(function(r){
      var row=document.createElement(r.t?'div':'label'),k=document.createElement('span'),kt=document.createElement('span');
      row.className=r.t?'bp-row bp-tog bp-wide':'bp-row';if(r.ctx)row.setAttribute('data-ctx',r.ctx);
      k.className='bp-k';kt.textContent=lb(r.en,r.id);k.appendChild(kt);row.appendChild(k);
      if(r.t){
        var b=document.createElement('button');b.type='button';b.className='bp-switch';b.setAttribute('aria-pressed','true');
        b.addEventListener('click',function(e){e.stopPropagation();vset(g,r,vget(g,r)?0:1);paint(g.id);try{haptic(6);}catch(er){}try{bhuRepaint();}catch(er2){}});
        row.appendChild(b);r.sw=b;
      }else{
        var inp=document.createElement('input'),out=document.createElement('output');
        inp.type='range';inp.className='bp-range';inp.step='1';
        inp.min=String(Math.round(r.min*r.sc));inp.max=String(Math.round(r.max*r.sc));   /* baris terbalik (inv): rentang min/max sudah dalam nilai TAMPIL */
        inp.addEventListener('input',function(){vset(g,r,(+inp.value)/r.sc);paint(g.id);try{bhuRepaint();}catch(er){}});
        row.appendChild(inp);row.appendChild(out);r.el=inp;r.out=out;
      }
      frag.appendChild(row);
    });
    host.appendChild(frag);
  }
  /* baris terbalik (inv): tampil = 1 - nilai CFG, simpan = 1 - nilai slider (vget/vset yang membalik) */
  function paint(id){
    var g=G[id];if(!g||g.dead)return;
    if(!g.built)build(g);
    g.rows.forEach(function(r){
      var v=vget(g,r);
      if(r.t){if(r.sw){r.sw.setAttribute('aria-pressed',v?'true':'false');r.sw.textContent=ttxt(v);r.sw.classList.toggle('off',!v);}return;}
      if(r.el){r.el.value=String(Math.round(v*r.sc));fill(r.el);}
      if(r.out)r.out.textContent=show(r,v);
    });
  }
  function dirty(id){
    var g=G[id];if(!g||g.dead)return false;
    var st=stored(g),d=false;
    g.rows.forEach(function(r){var tol=r.t?.5:(.5/r.sc);if(Math.abs(rawGet(g,r)-st[r.p])>tol)d=true;});
    return d;
  }
  function toast(g){try{if(typeof showModeToast==='function')showModeToast(ID?g.idt:g.en,null,1500);}catch(e){}}
  function save(id){
    var g=G[id];if(!g||g.dead)return;
    var o={};g.rows.forEach(function(r){o[r.p]=rawGet(g,r);});
    try{localStorage.setItem(g.key,JSON.stringify(o));}catch(e){}
    toast(g);
  }
  function reset(id){
    var g=G[id];if(!g||g.dead)return;
    g.rows.forEach(function(r){
      var dv=g.def[r.p];
      if(g.set)g.set(r.p,dv);else if(r.t)pset(rootOf(g),r.p,!!dv);else pset(rootOf(g),r.p,dv);
    });
    g.after('*');
    try{localStorage.removeItem(g.key);}catch(e){}
  }

  /* ---------- init ---------- */
  ORDER.forEach(function(id){var g=G[id];snapshot(g);if(g.dead)return;loadSaved(g);g.after('*');});
  function init(){ORDER.forEach(function(id){var g=G[id];if(!g.dead)build(g);});try{bhuRepaint();}catch(e){}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();

  return{
    has:function(id){return !!G[id];},
    ok:function(id){var g=G[id];return !!g&&!g.dead;},
    paint:paint,dirty:dirty,save:save,reset:reset,
    defaults:function(id){return G[id]?G[id].def:null;}
  };
})();
