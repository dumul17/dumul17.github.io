'use strict';
/* 18-tune3d.js — tab tuning Planet / Drone / Portal (+ Milky Way overview) di panel owl > Settings (#bh-panel).
   Dimuat PALING AKHIR (setelah 14-drone3d, 15-portal3d, 17-planet3d) supaya semua CFG-nya sudah ada.
   Cara kerja: tiap grup = satu objek CFG (PL3D_CFG / DR3D_CFG / PT3D_CFG / MW) + daftar baris. Angka di CFG saat file ini jalan = DEFAULT
   (snapshot sebelum nilai tersimpan dimuat). Slider dibuat dari daftar ini ke dalam .bp-page[data-page] (HTML-nya cuma wadah kosong), jadi gaya,
   scrub (owl-scrub-row), dan Save/Reset sama dengan tab lain. Save -> localStorage (dumul_tune_pl / _dr / _pt, dumul_mw_cfg); Reset -> hapus + balik ke default.
   05-sector-ui.js (bhTune) memanggil API T3D di bawah: has / ok / paint / dirty / save / reset.
   Baris: [path, label EN, label ID, min, max, skala, desimal, satuan, flag, seksi?, tergantung?] — slider = round(nilai*skala); flag 't' = toggle, 'i' = terbalik (1 - nilai), 'o' = baris cuma di overview, 's' = cuma di sektor (tanpa o/s = dua-duanya; panel menyembunyikan baris yang tidak berlaku di konteks sekarang lewat data-ctx).
   seksi? = kunci di g.secs [EN, ID]: judul seksi dibuat tiap kali kunci berganti (urutan baris = urutan tampil). tergantung? = path baris induk: kalau induk 0 baris ini diredupkan (percuma digeser).
   SNAP (global, 05-sector-ui.js snapStep): lebar rentang slider <=20 -> langkah 1, <=1000 -> 5, lebih -> 50. Jadi tiap default HARUS kelipatan 5 (atau lebar <=20) supaya tidak loncat waktu disentuh; atur lewat skala + default CFG. Satuan: % = kekuatan/kepadatan/pengali, px = piksel, /s = laju, ° = derajat (CFG tetap radian; skala RAD = 180/PI, jadi 1 langkah = 1 derajat). */
var T3D=(function(){
  var ID=(function(){try{return window.I18N&&I18N.lang==='id';}catch(e){return false;}})(),G={},ORDER=['pl','dr','pt','mw'];
  function lb(en,id){return ID?id:en;}
  function pget(o,p){var a=p.split('.'),i;for(i=0;i<a.length;i++){if(o==null)return;o=o[a[i]];}return o;}
  function pset(o,p,v){var a=p.split('.'),i;for(i=0;i<a.length-1;i++){o=o[a[i]];if(!o)return;}o[a[a.length-1]]=v;}
  function clamp(v,a,b){return v<a?a:v>b?b:v;}
  function fill(el){var mn=+el.min,mx=+el.max;el.style.setProperty('--p',((+el.value-mn)/((mx-mn)||1)*100)+'%');}
  function ttxt(on){try{return T(on?'tune.on':'tune.off');}catch(e){return on?'On':'Off';}}
  var RAD=180/Math.PI;   /* radian -> derajat; baris derajat pakai skala RAD supaya 1 langkah slider = 1 derajat */
  function lsGet(k){try{return JSON.parse(localStorage.getItem(k)||'null');}catch(e){return null;}}

  /* ---------- definisi grup ---------- */
  function defGroup(id,o){o.id=id;o.rows=o.rows.map(function(r){return{p:r[0],en:r[1],id:r[2],min:r[3],max:r[4],sc:r[5],d:r[6],u:r[7],s:r[9]||'',dep:r[10]||'',t:/t/.test(r[8]||''),inv:/i/.test(r[8]||''),ctx:/o/.test(r[8]||'')?'ov':(/s/.test(r[8]||'')?'sc':''),el:null,out:null,sw:null,rowEl:null};});G[id]=o;}

  defGroup('pl',{key:'dumul_tune_pl',root:function(){return window.PL3D_CFG;},
    en:'PLANET SETTINGS SAVED',idt:'SETELAN PLANET TERSIMPAN',
    /* PRESET (tombol di atas tab Planet): cuma knob "tampilan" (PKEYS); bentuk (Curve/Horizon/Cell/Persp), Sway, Sink, Spin, Rate tidak disentuh.
       v = nilai CFG mentah; semua kelipatan snap. 'def' = nilai default CFG (snapshot saat file ini jalan). Pilih preset = nilai berubah live, Save baru menyimpan. */
    pkeys:['haze','hazeA','fadeS','lod','rockD','rockSz','craterA','craterS','canyonA','canyonS','cloud','cloudCov','cloudH','cloudShd','cloudLit','cloudDet','cloudDrift','atmK','rimLit','rimHalo','fallK','cityA','cityD','cityTw','cityGlow','auroraOn','flareOn','debrisOn','boltOn','evK','par','zoomK'],
    presets:[
      {k:'def',en:'Default',id:'Bawaan'},
      {k:'clean',en:'Clean',id:'Bersih',v:{haze:80,hazeA:.3,fadeS:20,lod:.5,rockD:1,rockSz:.25,craterA:.2,craterS:1,canyonA:0,canyonS:1,cloud:.3,cloudCov:.5,cloudH:20,cloudShd:.3,cloudLit:.6,cloudDet:.3,cloudDrift:1,atmK:.8,rimLit:1,rimHalo:.3,fallK:1,cityA:0,cityD:.55,cityTw:.25,cityGlow:.3,auroraOn:0,flareOn:1,debrisOn:0,boltOn:0,evK:1,par:.05,zoomK:.1}},
      {k:'lively',en:'Lively',id:'Hidup',v:{haze:95,hazeA:.4,fadeS:10,lod:.25,rockD:.6,rockSz:.25,craterA:.6,craterS:.8,canyonA:.4,canyonS:1,cloud:.6,cloudCov:.8,cloudH:20,cloudShd:.6,cloudLit:.9,cloudDet:.6,cloudDrift:8,atmK:1.3,rimLit:1.5,rimHalo:.6,fallK:1.3,cityA:1.5,cityD:.7,cityTw:.4,cityGlow:.6,auroraOn:1,flareOn:1,debrisOn:1,boltOn:1,evK:1.5,par:.08,zoomK:.15}},
      {k:'cine',en:'Cinematic',id:'Sinematik',v:{haze:140,hazeA:.6,fadeS:30,lod:.25,rockD:.8,rockSz:.3,craterA:.8,craterS:1.5,canyonA:.6,canyonS:1.5,cloud:.4,cloudCov:.6,cloudH:30,cloudShd:.7,cloudLit:1,cloudDet:.5,cloudDrift:2,atmK:1.5,rimLit:2,rimHalo:.8,fallK:1.5,cityA:2,cityD:.4,cityTw:.2,cityGlow:.5,auroraOn:1,flareOn:1,debrisOn:0,boltOn:1,evK:.5,par:.1,zoomK:.2}}
    ],
    secs:{shape:['SHAPE','BENTUK'],ground:['GROUND','TANAH'],haze:['HAZE','KABUT'],cloud:['CLOUDS','AWAN'],atm:['ATMOSPHERE & LIGHT','ATMOSFER & CAHAYA'],city:['CITY','KOTA'],fx:['EFFECTS','EFEK'],move:['MOTION','GERAK']},
    after:function(p){try{if(p==='auroraOn'||p==='flareOn'||p==='debrisOn'||p==='boltOn'||p==='evK'||p==='boltK')return;PL3D.dirty=true;if(p==='hzDy')PL3D.topC=null;}catch(e){}},   /* efek 2D digambar tiap frame: tidak perlu render ulang shader */
    rows:[
      /* Bentuk */
      ['rK','Curve','Lengkung',5,40,1,0,'','','shape'],
      ['hzDy','Horizon','Horizon',-.2,.1,100,0,'%','','shape'],            /* global: overview + semua sektor */
      ['cell','Cell','Sel',40,260,1,0,'px','','shape'],
      ['persp','Persp','Perspektif',20,300,1,0,'','','shape'],
      /* Tanah */
      ['lod','Detail','Detail',.05,1,100,0,'%','','ground'],
      ['fadeS','Fade','Pudar',0,80,1,0,'px','','ground'],
      ['rockD','Rocks','Batu',0,1,100,0,'%','i','ground'],                 /* 0% = gurun tanpa batu, 100% = rapat (tampil = kepadatan, bukan nilai mentah) */
      ['rockSz','Rock size','Ukuran batu',.05,1.5,100,0,'%','','ground','rockD'],
      ['craterA','Craters','Kawah',0,1,100,0,'%','','ground'],
      ['craterS','Crater size','Ukuran kawah',.4,2,100,0,'%','','ground','craterA'],
      ['canyonA','Canyons','Kanyon',0,1,100,0,'%','','ground'],
      ['canyonS','Canyon size','Ukuran kanyon',.4,2,100,0,'%','','ground','canyonA'],
      /* Kabut */
      ['haze','Haze','Kabut',0,240,1,0,'px','','haze'],
      ['hazeA','Haze α','Kabut α',0,1,100,0,'%','','haze'],
      /* Awan */
      ['cloud','Cloud','Awan',0,1,100,0,'%','','cloud'],
      ['cloudCov','Cover','Sebaran',0,1,100,0,'%','','cloud','cloud'],
      ['cloudH','Height','Tinggi',0,60,1,0,'×','','cloud','cloud'],
      ['cloudShd','Shade','Bayangan',0,1,100,0,'%','','cloud','cloud'],
      ['cloudLit','Lit','Cahaya awan',0,1.5,100,0,'%','','cloud','cloud'],     /* cahaya sendiri awan: tepi terang / dasar gelap (0 = warna datar) */
      ['cloudDet','Wisps','Serat awan',0,1,100,0,'%','','cloud','cloud'],      /* serat halus di dalam awan (0 = mulus) */
      /* Atmosfer & Cahaya */
      ['atmK','Atmos','Atmosfer',0,3,100,0,'%','','atm'],
      ['rimLit','Rim lit','Rim cahaya',0,2,100,0,'%','','atm'],
      ['rimHalo','Halo','Halo limb',0,1.5,100,0,'%','','atm'],
      ['fallK','Light','Jangkauan cahaya',.3,3,100,0,'%','','atm'],
      /* Kota */
      ['cityA','City','Lampu kota',0,3,100,0,'%','','city'],
      ['cityD','Density','Padat',0,1,100,0,'%','','city','cityA'],
      ['cityTw','Twinkle','Kedip',0,1,100,0,'%','','city','cityA'],
      ['cityGlow','Glow','Pendar kota',0,1,100,0,'%','','city','cityA'],        /* pendar tanah kota + dasar awan di atas kota */
      /* Efek 2D (rancangan: rencana-dekor-planet.md; F1 = knob saja, gambar menyusul F2-F5) */
      ['auroraOn','Aurora','Aurora',0,1,1,0,'','t','fx'],
      ['flareOn','Flare','Flare',0,1,1,0,'','t','fx'],
      ['debrisOn','Debris','Puing',0,1,1,0,'','t','fx'],
      ['boltOn','Lightning','Petir',0,1,1,0,'','t','fx'],
      ['evK','Events','Kejadian',.2,3,100,0,'%','','fx','debrisOn|boltOn'],
      ['boltK','Bolt size','Ukuran petir',.3,2,100,0,'%','','fx','boltOn'],   /* dep any-of: diredupkan kalau puing DAN petir mati */
      /* Gerak */
      ['par','Parallax','Paralaks',0,.15,100,0,'%','','move'],
      ['zoomK','Zoom','Zoom',0,.4,100,0,'%','','move'],
      ['libr.k','Sway','Ayun',0,2,100,0,'%','s','move'],                   /* gabungan Sway Y + Sway tilt (rasio tetap 1:3), cuma sektor */
      ['sinkK','Sink','Terbenam',0,2,100,0,'%','','move'],                 /* gabungan BH sink + Tele sink (rasio tetap .5 : .35) */
      ['rotK','Spin','Putar',0,3,100,0,'%','s','move'],                    /* ov.rot = 0 -> tidak berefek di overview, jadi cuma sektor */
      ['cloudDrift','Drift','Hanyut awan',-20,20,10,1,'px/s','','move','cloud'],
      ['fps','Rate','Laju',1,15,1,0,'/s','','move']
    ]});

  defGroup('dr',{key:'dumul_tune_dr',root:function(){return window.DR3D_CFG;},
    en:'DRONE SETTINGS SAVED',idt:'SETELAN DRONE TERSIMPAN',
    secs:{body:['BODY','BADAN'],fx:['EFFECTS','EFEK']},
    after:function(){},
    rows:[
      /* Badan */
      ['size','Size','Ukuran',15,75,1,0,'px','','body'],
      ['spin','Spin','Putar',0,4,100,0,'%','','body'],
      ['turn','Turn','Tolehan',.2,4,100,0,'%','','body'],
      ['swayK','Sway','Goyang',0,3,100,0,'%','','body'],               /* gabungan Float (bob) + Lean */
      /* Efek */
      ['flame','Flame','Api',0,2.5,100,0,'%','','fx'],
      ['glowK','Glow','Pendar',0,3,100,0,'%','','fx']                  /* gabungan Light + Halo */
    ]});

  defGroup('pt',{key:'dumul_tune_pt',root:function(){return window.PT3D_CFG;},
    en:'PORTAL SETTINGS SAVED',idt:'SETELAN PORTAL TERSIMPAN',
    secs:{ring:['RING','CINCIN'],orbit:['ORBIT','ORBIT'],bolt:['LIGHTNING','PETIR']},
    after:function(){},
    rows:[
      /* Cincin */
      ['ovMenu','Size','Ukuran',.2,1.2,100,0,'%','o','ring'],
      ['secK','Exit','Mulut keluar',.2,1.2,100,0,'%','s','ring'],
      ['glow','Glow','Pendar',0,3,100,0,'%','','ring'],
      ['spin','Spin','Putar',0,45/RAD,RAD,0,'\u00b0/s','','ring'],      /* derajat per detik (CFG = rad/dtk) */
      ['tilt.x','Pitch','Pitch',-60/RAD,60/RAD,RAD,0,'\u00b0','','ring'],
      ['tilt.y','Yaw','Yaw',0,80/RAD,RAD,0,'\u00b0','','ring'],
      ['tilt.z','Roll','Roll',-60/RAD,60/RAD,RAD,0,'\u00b0','','ring'],
      /* Orbit (overview) */
      ['orb.on','Orbit','Orbit',0,1,1,0,'','to','orbit'],
      ['orb.per','Period','Periode',20,240,1,0,'s','o','orbit','orb.on'],
      ['orb.ax','Width','Lebar',.05,.45,100,0,'%','o','orbit','orb.on'],
      ['orb.ay','Height','Tinggi',0,.2,100,0,'%','o','orbit','orb.on'],
      ['orb.depth','Depth','Kedalaman',0,.2,100,0,'%','o','orbit','orb.on'],
      ['orb.bob','Bob','Naik-turun',0,8,10,1,'px','o','orbit','orb.on'],
      ['orb.gap','Gap','Jarak limb',0,2,100,0,'%','o','orbit','orb.on'],
      ['orb.near','Near','Dekat planet',0,1,100,0,'%','o','orbit','orb.on'],   /* 0 = orbit di home BH (jauh dari planet), 1 = orbit menyusuri limb */
      /* Petir */
      ['mouthStars','Stars','Bintang',0,80,1,0,'','','bolt'],
      ['boltMax','Bolts','Jumlah petir',0,16,1,0,'','','bolt'],
      ['boltW','Bolt W','Tebal petir',.1,1.2,100,0,'%','','bolt','boltMax'],
      ['boltGlow','Glow','Pendar petir',0,1,100,0,'%','','bolt','boltMax']
    ]});

  /* Milky Way overview: nilai default + loader ada di 02-sky-logic.js (MW_DEF / mwTuneSet), jadi di sini tidak dimuat ulang */
  defGroup('mw',{key:'dumul_mw_cfg',noLoad:true,box:'t3-mw',root:function(){return(typeof MW_DEF!=='undefined')?window.MW:null;},
    en:'SKY SETTINGS SAVED',idt:'SETELAN LANGIT TERSIMPAN',
    secs:{img:['MILKY WAY','MILKY WAY'],mov:['MOTION','GERAK']},
    get:function(p){return p==='mirror'?(MW.mirror?1:0):MW[p];},
    set:function(p,v){mwTuneSet(p,v);},
    defOf:function(p){return MW_DEF[p];},
    after:function(){},
    rows:[
      /* Gambar */
      ['A','Strength','Kekuatan',0,1,100,0,'%','','img'],
      ['scale','Scale','Skala',.6,2.5,100,0,'%','','img'],
      ['mirror','Mirror','Cermin',0,1,1,0,'','t','img'],
      /* Gerak */
      ['vx','Drift','Geser',-12,12,10,1,'px/s','','mov'],
      ['zf','Zoom','Ikut zoom',0,1,100,0,'%','','mov'],
      ['pf','Parallax','Paralaks',0,.5,100,0,'%','','mov']
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
    var m=r.u==='%'?100:(r.u==='\u2030'?1000:(r.u.charAt(0)==='\u00b0'?RAD:1)),pv=v*m;   /* % = x100, per-mil = x1000, derajat = x180/PI (CFG tetap radian) */
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

  /* ---------- preset ---------- */
  function rowOf(g,p){var i;for(i=0;i<g.rows.length;i++)if(g.rows[i].p===p)return g.rows[i];return null;}
  function presetVal(g,pr,p){return pr.v?pr.v[p]:g.def[p];}   /* preset 'def' = default CFG */
  function applyPreset(id,k){
    var g=G[id],pr=null,i;if(!g||g.dead||!g.presets)return;
    for(i=0;i<g.presets.length;i++)if(g.presets[i].k===k)pr=g.presets[i];if(!pr)return;
    g.pkeys.forEach(function(p){var r=rowOf(g,p),raw=presetVal(g,pr,p);if(!r||typeof raw!=='number')return;vset(g,r,r.inv?1-raw:raw);});
    g.after('*');paint(id);
  }
  function presetOn(g,pr){var i,r,p;for(i=0;i<g.pkeys.length;i++){p=g.pkeys[i];r=rowOf(g,p);if(r&&Math.abs(rawGet(g,r)-presetVal(g,pr,p))>.5/r.sc)return false;}return true;}

  /* ---------- UI ---------- */
  function build(g){
    if(g.built||g.dead)return;
    var host=g.box?document.getElementById(g.box):document.querySelector('#bh-panel .bp-page[data-page="'+g.id+'"]');
    if(!host)return;
    g.built=1;g.host=host;
    var frag=document.createDocumentFragment(),lastSec='';
    if(g.presets){
      var pbar=document.createElement('div');pbar.className='t3-presets';
      g.presets.forEach(function(pr){
        var b=document.createElement('button');b.type='button';b.className='bp-switch off';b.textContent=lb(pr.en,pr.id);
        b.addEventListener('click',function(e){e.stopPropagation();applyPreset(g.id,pr.k);try{haptic(6);}catch(er){}try{bhuRepaint();}catch(er2){}});
        pr.btn=b;pbar.appendChild(b);
      });
      frag.appendChild(pbar);
    }
    g.rows.forEach(function(r){
      if(g.secs&&r.s&&r.s!==lastSec&&g.secs[r.s]){var h=document.createElement('div');h.className='bp-sec t3-sec';h.textContent=lb(g.secs[r.s][0],g.secs[r.s][1]);frag.appendChild(h);}
      lastSec=r.s;
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
      r.rowEl=row;frag.appendChild(row);
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
    if(g.presets)g.presets.forEach(function(pr){if(!pr.btn)return;var on=presetOn(g,pr);pr.btn.classList.toggle('off',!on);pr.btn.setAttribute('aria-pressed',on?'true':'false');});   /* preset aktif = semua knob tampilan cocok */
    g.rows.forEach(function(r){   /* baris tergantung: induk 0 -> diredupkan */
      if(!r.dep||!r.rowEl)return;
      var ps=r.dep.split('|'),fnd=false,any=false;   /* 'a|b' = diredupkan kalau SEMUA induk 0 */
      g.rows.forEach(function(x){if(ps.indexOf(x.p)>=0){fnd=true;if(vget(g,x)>0)any=true;}});
      r.rowEl.classList.toggle('t3-dim',fnd&&!any);
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
