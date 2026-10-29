'use strict';
/* 18-tune3d.js — tab tuning Planet / Drone / Portal (+ Milky Way overview) di panel owl > Settings (#bh-panel).
   PLANET = slot per konteks (overview + tiap sektor, lihat 'slots'/'ui' di defGroup('pl')): Basic = kartu seksi lipat + saklar + slider master, Advanced = semua slider mentah.
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
    /* SLOT per konteks (bukan preset lagi): overview + tiap sektor punya setelan sendiri (key dumul_tune_pl_<ov|k sektor>). Panel mengedit slot konteks yang LAGI AKTIF;
       pindah konteks = nilai CFG di-lerp ke slot tujuan. Slot kosong / habis di-Reset = default CFG. fps + bandMin = setelan performa, GLOBAL (key dumul_tune_pl_perf), bukan per slot. */
    slots:true,perf:{fps:1,bandMin:1},
    /* UI Basic: tiap seksi = kartu yang bisa dilipat. mem = knob yang digabung jadi 1 slider master (nilai = default x master, 100% = tampilan bawaan, knob default<=0 tidak ikut),
       tog = ada saklar on/off (= master 0 <-> terakhir), fx = saklar gabungan 4 efek 2D, raw = slider mentah yang tetap tampil di Basic. Sisanya masuk ADVANCED (semua slider mentah). */
    ui:[
      {id:'shape',raw:['rK','hzDy','cell','persp','lod']},
      {id:'ground',mem:['craterA','canyonA'],tog:1,raw:['craterS','canyonS']},
      {id:'bio',mem:['bioA','bioSea','bioMtn','bioFor','bioUrb','earthK'],tog:1,raw:['urbPatch','urbMin','urbMax']},
      {id:'haze',raw:['haze','hazeA']},
      {id:'cloud',mem:['cloud','cloudCov','cloudShd','cloudLit','cloudDet'],tog:1,raw:['cloudH']},
      {id:'atm',mem:['atmK','rimLit','rimHalo'],tog:1,raw:['fallK']},
      {id:'city',mem:['cityA','cityD','cityTw','cityGlow'],tog:1},
      {id:'fx',fx:1,raw:['evK']},
      {id:'move',mem:['par','zoomK','rotK','sinkK','libr.k'],tog:1}
    ],
    secs:{adv:['ADVANCED','LANJUTAN'],shape:['SHAPE','BENTUK'],ground:['GROUND','TANAH'],bio:['BIOMES','BIOME'],haze:['HAZE','KABUT'],cloud:['CLOUDS','AWAN'],atm:['ATMOSPHERE & LIGHT','ATMOSFER & CAHAYA'],city:['CITY','KOTA'],fx:['EFFECTS','EFEK'],move:['MOTION','GERAK'],perf:['PERFORMANCE (ALL SLOTS)','PERFORMA (SEMUA SLOT)']},
    after:function(p){try{if(p==='auroraOn'||p==='flareOn'||p==='debrisOn'||p==='boltOn'||p==='evK'||p==='boltK')return;PL3D.dirty=true;if(p==='hzDy')PL3D.topC=null;}catch(e){}},   /* efek 2D digambar tiap frame: tidak perlu render ulang shader */
    rows:[
      /* Bentuk */
      ['rK','Curve','Lengkung',5,40,1,0,'','','shape'],
      ['hzDy','Horizon','Horizon',-.2,.1,100,0,'%','','shape'],            /* global: overview + semua sektor */
      ['cell','Cell','Sel',40,260,1,0,'px','','shape'],
      ['persp','Persp','Perspektif',20,300,1,0,'','','shape'],
      /* Tanah */
      ['lod','Detail','Detail',.5,3,100,0,'%','','ground'],   /* 50%..300%: di bawah 50% sel tanah sub-piksel -> strip lurus makin kasar ke horizon; makin besar = pita mulus dekat horizon makin lebar */
      ['fadeS','Fade','Pudar',0,80,1,0,'px','','ground'],
      ['groundSkip','Flat','Datar horizon',0,200,1,0,'px','','ground'],   /* tanah memudar rata menuju horizon (zona sel gepeng = strip lurus); 0 = tekstur sampai horizon */
      ['craterA','Craters','Kawah',0,1,100,0,'%','','ground'],
      ['craterS','Crater size','Ukuran kawah',.4,2,100,0,'%','','ground','craterA'],
      ['canyonA','Canyons','Kanyon',0,1,100,0,'%','','ground'],
      ['canyonS','Canyon size','Ukuran kanyon',.4,2,100,0,'%','','ground','canyonA'],
      /* Biome (warna dikunci, cuma di area biome; bioCol 0 = ngikut tema sektor) */
      ['bioA','Biomes','Biome',0,1,100,0,'%','','bio'],
      ['bioCol','Biome color','Warna biome',0,1,100,0,'%','','bio','bioA'],
      ['bioSea','Sea','Laut',0,1,100,0,'%','','bio','bioA'],
      ['bioMtn','Mountains','Gunung',0,1,100,0,'%','','bio','bioA'],
      ['bioFor','Forest','Hutan',0,1,100,0,'%','','bio','bioA'],
      ['bioUrb','Cyber city','Kota cyber',0,1,100,0,'%','','bio','bioA'],
      ['urbSkip','City reach','Jangkauan kota',.2,1,100,0,'%','','bio','bioUrb'],   /* kota cuma di bagian jauh tanah; 100% = sampai dasar layar */
      ['urbPatch','City patch','Skala bercak kota',.3,3,100,0,'%','','bio','bioUrb'],   /* ukuran gumpalan area kota; tepi organik */
      ['urbMin','Cell min','Sel kota min',3,20,1,0,'px','','bio','bioUrb'],   /* sel grid di layar tidak lebih kecil dari ini (digabung = jalan utama saja) */
      ['urbMax','Cell max','Sel kota maks',16,120,1,0,'px','','bio','bioUrb'],   /* sel grid di layar tidak lebih besar dari ini (dibelah = tanpa blok raksasa) */
      ['earthK','Earth','Bumi',0,1,100,0,'%','','bio','bioA'],   /* overview + sektor (sama): laut luas + benua + awan putih. Tab Planet sekarang IDENTIK di overview dan sektor */
      /* Kabut */
      ['haze','Haze','Kabut',0,240,1,0,'px','','haze'],
      ['hazeA','Haze α','Kabut α',0,1,100,0,'%','','haze'],
      /* Awan */
      ['cloud','Cloud','Awan',0,1,100,0,'%','','cloud'],
      ['cloudCov','Cover','Sebaran',0,1,100,0,'%','','cloud','cloud'],
      ['cloudH','Height','Tinggi',0,60,1,0,'×','','cloud','cloud'],
      ['cloudSkip','Skip','Lewati horizon',0,200,1,0,'px','','cloud','cloud'],   /* awan memudar menuju horizon (zona sel gepeng = strip lurus); 0 = sampai horizon */
      ['cloudShd','Shade','Bayangan',0,1,100,0,'%','','cloud','cloud'],
      ['cloudLit','Lit','Cahaya awan',0,1.5,100,0,'%','','cloud','cloud'],     /* cahaya sendiri awan: tepi terang / dasar gelap (0 = warna datar) */
      ['cloudDet','Wisps','Serat awan',0,1,100,0,'%','','cloud','cloud'],      /* serat halus di dalam awan (0 = mulus) */
      /* Atmosfer & Cahaya */
      ['atmK','Atmos','Atmosfer',0,3,100,0,'%','','atm'],
      ['rimLit','Rim lit','Rim cahaya',0,2,100,0,'%','','atm'],
      ['rimHalo','Halo','Halo limb',0,1.5,100,0,'%','','atm'],
      ['fallK','Light','Jangkauan cahaya',.3,3,100,0,'%','','atm'],
      /* Kota */
      ['cityA','City','Lampu kota',0,3,100,0,'%','','city','bioUrb'],   /* lampu cuma di biome Cyber city: kalau Cyber city 0 baris ini diredupkan (percuma digeser) */
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
      ['libr.k','Sway','Ayun',0,2,100,0,'%','','move'],                    /* gabungan Sway Y + Sway tilt (rasio tetap 1:3); tampil di overview + sektor */
      ['sinkK','Sink','Terbenam',0,2,100,0,'%','','move'],                 /* gabungan BH sink + Tele sink (rasio tetap .5 : .35) */
      ['rotK','Spin','Putar',0,3,100,0,'%','','move'],                     /* tampil + berefek di overview dan sektor (ov.rot .5) */
      ['cloudDrift','Drift','Hanyut awan',-20,20,10,1,'px/s','','move','cloud'],
      ['fps','Rate','Laju',1,15,1,0,'/s','','perf'],
      ['bandMin','Min bands','Pita min',1,6,1,0,'','','perf']      /* 6 = tanpa pita adaptif; lebih kecil = refresh lampu kota/awan lebih rapat di HP lambat (beban per frame naik) */
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
    secs:{ring:['RING','CINCIN'],orbit:['ORBIT','ORBIT'],mouth:['WORMHOLE MOUTH','MULUT WORMHOLE'],bolt:['LIGHTNING','PETIR']},
    after:function(){},
    rows:[
      /* Cincin */
      ['ovMenu','Size','Ukuran',.2,1.2,100,0,'%','','ring'],
      ['glow','Glow','Pendar',0,3,100,0,'%','','ring'],
      ['spin','Spin','Putar',0,45/RAD,RAD,0,'\u00b0/s','','ring'],      /* derajat per detik (CFG = rad/dtk) */
      ['tilt.x','Pitch','Pitch',-60/RAD,60/RAD,RAD,0,'\u00b0','','ring'],
      ['tilt.y','Yaw','Yaw',0,80/RAD,RAD,0,'\u00b0','','ring'],
      ['tilt.z','Roll','Roll',-60/RAD,60/RAD,RAD,0,'\u00b0','','ring'],
      /* Orbit (overview) */
      ['orb.on','Orbit','Orbit',0,1,1,0,'','t','orbit'],
      ['orb.per','Period','Periode',20,240,1,0,'s','','orbit','orb.on'],
      ['orb.ax','Width','Lebar',.05,.45,100,0,'%','','orbit','orb.on'],
      ['orb.ay','Height','Tinggi',0,.2,100,0,'%','','orbit','orb.on'],
      ['orb.depth','Depth','Kedalaman',0,.2,100,0,'%','','orbit','orb.on'],
      ['orb.bob','Bob','Naik-turun',0,8,10,1,'px','','orbit','orb.on'],
      ['orb.gap','Gap','Jarak limb',0,2,100,0,'%','','orbit','orb.on'],
      ['orb.near','Near','Dekat planet',0,1,100,0,'%','','orbit','orb.on'],   /* 0 = orbit di home BH (jauh dari planet), 1 = orbit menyusuri limb */
      /* Mulut wormhole (hilang saat idle, muncul saat musik / charge / pindah sektor) */
      ['idleMouth','Hide at idle','Sembunyi saat idle',0,1,1,0,'','t','mouth'],
      ['mouthIn','Fade in','Muncul',.1,1.5,100,0,'s','','mouth','idleMouth'],
      ['mouthOut','Fade out','Hilang',.1,1.5,100,0,'s','','mouth','idleMouth'],
      ['mouthStars','Stars','Bintang',0,80,1,0,'','','mouth'],
      /* Petir */
      ['boltMax','Bolts','Jumlah petir',0,16,1,0,'','','bolt'],
      ['boltW','Bolt W','Tebal petir',.1,1.2,100,0,'%','','bolt','boltMax'],
      ['boltGlow','Glow','Pendar petir',0,1,100,0,'%','','bolt','boltMax'],
      ['idleMin','Idle gap min','Jeda idle min',100,1000,1,0,'ms','','bolt'],
      ['idleMax','Idle gap max','Jeda idle maks',100,2000,1,0,'ms','','bolt']
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
    if(g.slots){g.ctx=ctxKey();var sv=allVals(g,g.ctx);g.rows.forEach(function(r){if(typeof sv[r.p]==='number')vset(g,r,sv[r.p]);});return;}
    var o=lsGet(g.key);if(!o||typeof o!=='object')return;
    g.rows.forEach(function(r){var raw=o[r.p];if(typeof raw==='number'&&isFinite(raw))vset(g,r,r.t?raw:(r.inv?1-raw:raw));});   /* simpanan = nilai CFG apa adanya */
  }
  function rawGet(g,r){var v=g.get?g.get(r.p):pget(rootOf(g),r.p);return r.t?(v?1:0):+v;}
  function stored(g){if(g.slots)return allVals(g,g.ctx||ctxKey());var o=lsGet(g.key),s={};g.rows.forEach(function(r){s[r.p]=(o&&typeof o[r.p]==='number')?o[r.p]:g.def[r.p];});return s;}

  function rowOf(g,p){var i;for(i=0;i<g.rows.length;i++)if(g.rows[i].p===p)return g.rows[i];return null;}

  /* ---------- slot per konteks (planet) ---------- */
  var LPMS=600,FXK=['auroraOn','flareOn','debrisOn','boltOn'];
  function ctxKey(){try{if(typeof SECT==='undefined')return'ov';if(SECT.busy&&SECT.phase==='in'&&SECT.target)return SECT.target.k;return SECT.cur?SECT.cur.k:'ov';}catch(e){return'ov';}}   /* zoom-in: langsung konteks tujuan supaya lerp jalan bareng crossfade SKYT */
  function sectList(){try{return(typeof SECT!=='undefined'&&SECT.list)||[];}catch(e){return[];}}
  function ctxName(k){
    if(k==='ov')return 'Overview';
    var L=sectList(),i,s,nm;
    for(i=0;i<L.length;i++)if(L[i].k===k){s=L[i];nm=s.name||s.title||s.nm||s.k;return 'S'+(i+1)+' \u00b7 '+String(nm).toUpperCase();}
    return String(k);
  }
  function ctxShort(k){if(k==='ov')return 'Overview';var L=sectList(),i;for(i=0;i<L.length;i++)if(L[i].k===k)return 'S'+(i+1);return String(k);}
  function slotKey(g,k){return g.key+'_'+k;}
  function slotObj(g,k){var o=lsGet(slotKey(g,k));if(!o||typeof o!=='object')o=lsGet(g.key);return o||{};}   /* slot belum ada -> simpanan lama (dumul_tune_pl) -> default; slot {} (habis Reset) = default murni */
  function slotSaved(g,k){var o=lsGet(slotKey(g,k));return !!o&&typeof o==='object'&&Object.keys(o).length>0;}
  function valuesFor(g,k){var o=slotObj(g,k),s={};g.rows.forEach(function(r){if(g.perf[r.p])return;s[r.p]=(typeof o[r.p]==='number'&&isFinite(o[r.p]))?o[r.p]:g.def[r.p];});return s;}
  function perfVals(g){var o=lsGet(slotKey(g,'perf'))||lsGet(g.key)||{},s={};Object.keys(g.perf).forEach(function(p){s[p]=(typeof o[p]==='number'&&isFinite(o[p]))?o[p]:g.def[p];});return s;}
  function allVals(g,k){var s=valuesFor(g,k),p=perfVals(g),q;for(q in p)s[q]=p[q];return s;}
  function cancelLerp(g){g.lp=null;}
  function putRaw(g,r,v){if(r.t)pset(rootOf(g),r.p,!!v);else pset(rootOf(g),r.p,clamp(+v,r.min,r.max));}
  function afterAll(g){g.after('hzDy');g.after('*');}
  function applyVals(g,vals){cancelLerp(g);g.rows.forEach(function(r){if(typeof vals[r.p]==='number')putRaw(g,r,vals[r.p]);});afterAll(g);}
  function startLerp(g,to){
    cancelLerp(g);
    var from={},rd=(typeof reduce!=='undefined'&&reduce);
    g.rows.forEach(function(r){
      if(typeof to[r.p]!=='number')return;
      if(r.t||rd){putRaw(g,r,to[r.p]);return;}   /* saklar: langsung; lainnya: lerp (kecuali reduce-motion) */
      from[r.p]=rawGet(g,r);
    });
    if(rd){afterAll(g);return;}
    var L={t0:performance.now(),from:from,to:to};g.lp=L;
    (function step(now){
      if(g.lp!==L)return;
      var u=Math.min(1,(now-L.t0)/LPMS),e=u*u*(3-2*u);
      g.rows.forEach(function(r){if(!(r.p in L.from))return;putRaw(g,r,L.from[r.p]+(L.to[r.p]-L.from[r.p])*e);});
      afterAll(g);
      if(u>=1){g.lp=null;if(g.built)paint(g.id);try{bhuRepaint();}catch(e2){}}else requestAnimationFrame(step);
    })(L.t0);
  }
  function ctxTick(){
    var g=G.pl;if(!g||g.dead)return;
    var k=ctxKey();if(k===g.ctx)return;
    g.ctx=k;startLerp(g,valuesFor(g,k));
    if(g.built)paint('pl');
    try{bhuRepaint();}catch(e){}
  }

  /* ---------- master seksi (planet) ---------- */
  function mOf(g,sec){var num=0,den=0;sec.mem.forEach(function(p){var r=rowOf(g,p),d=g.def[p];if(!r||!(d>0))return;num+=rawGet(g,r)*d;den+=d*d;});return den?num/den:1;}   /* proyeksi nilai mentah ke arah default -> posisi slider master selalu jujur walau knob mentah diubah di Advanced */
  function mSet(g,sec,m){sec.mem.forEach(function(p){var r=rowOf(g,p),d=g.def[p];if(!r||!(d>0))return;pset(rootOf(g),p,clamp(d*m,r.min,r.max));});g.after('*');}
  function mMax(g,sec){var mx=2;sec.mem.forEach(function(p){var r=rowOf(g,p),d=g.def[p];if(r&&d>0)mx=Math.min(mx,r.max/d);});return Math.max(1,mx);}
  function fxOn(g){var on=false;FXK.forEach(function(p){if(pget(rootOf(g),p))on=true;});return on;}
  function secToggle(g,sec){
    if(sec.fx){
      if(fxOn(g)){sec.keep=FXK.map(function(p){return pget(rootOf(g),p)?1:0;});FXK.forEach(function(p){pset(rootOf(g),p,false);});}
      else FXK.forEach(function(p,i){pset(rootOf(g),p,sec.keep?!!sec.keep[i]:true);});
      if(!fxOn(g))FXK.forEach(function(p){pset(rootOf(g),p,true);});
      g.after('*');return;
    }
    var m=mOf(g,sec);
    if(m>.004){sec.last=m;mSet(g,sec,0);}else mSet(g,sec,sec.last||1);
  }
  function secOn(g,sec){return sec.fx?fxOn(g):mOf(g,sec)>.004;}

  /* ---------- UI ---------- */
  function inject(){
    if(document.getElementById('t3-css'))return;
    var st=document.createElement('style');st.id='t3-css';
    st.textContent='.t3-head{display:flex;align-items:center;gap:8px;cursor:pointer;user-select:none}.t3-head .t3-ttl{flex:1}.t3-head .t3-chev{opacity:.6;font-size:11px;width:12px;text-align:center}'
      +'.t3-head .bp-switch{flex:none}.t3-shut{display:none!important}.t3-info{font-size:11px;opacity:.7;padding:2px 2px 6px}.t3-sub{font-size:11px;opacity:.6;padding:6px 2px 0}';
    document.head.appendChild(st);
  }
  function makeRow(g,r){
    var row=document.createElement(r.t?'div':'label'),k=document.createElement('span'),kt=document.createElement('span');
    row.className=r.t?'bp-row bp-tog bp-wide':'bp-row';if(r.ctx)row.setAttribute('data-ctx',r.ctx);
    k.className='bp-k';kt.textContent=lb(r.en,r.id);k.appendChild(kt);row.appendChild(k);
    if(r.t){
      var b=document.createElement('button');b.type='button';b.className='bp-switch';b.setAttribute('aria-pressed','true');
      b.addEventListener('click',function(e){e.stopPropagation();cancelLerp(g);vset(g,r,vget(g,r)?0:1);paint(g.id);try{haptic(6);}catch(er){}try{bhuRepaint();}catch(er2){}});
      row.appendChild(b);r.sw=b;
    }else{
      var inp=document.createElement('input'),out=document.createElement('output');
      inp.type='range';inp.className='bp-range';inp.step='1';
      inp.min=String(Math.round(r.min*r.sc));inp.max=String(Math.round(r.max*r.sc));   /* baris terbalik (inv): rentang min/max sudah dalam nilai TAMPIL */
      inp.addEventListener('input',function(){cancelLerp(g);vset(g,r,(+inp.value)/r.sc);paint(g.id);try{bhuRepaint();}catch(er){}});
      row.appendChild(inp);row.appendChild(out);r.el=inp;r.out=out;
    }
    r.rowEl=row;return row;
  }
  function makeMaster(g,sec){
    var row=document.createElement('label'),k=document.createElement('span'),kt=document.createElement('span'),inp=document.createElement('input'),out=document.createElement('output');
    row.className='bp-row';k.className='bp-k';kt.textContent=lb('Intensity','Intensitas');k.appendChild(kt);row.appendChild(k);
    inp.type='range';inp.className='bp-range';inp.step='1';inp.min='0';inp.max=String(Math.round(mMax(g,sec)*100));   /* 100 = tampilan bawaan; atas = sampai knob pertama mentok */
    inp.addEventListener('input',function(){cancelLerp(g);mSet(g,sec,(+inp.value)/100);paint(g.id);try{bhuRepaint();}catch(er){}});
    row.appendChild(inp);row.appendChild(out);sec.el=inp;sec.out=out;sec.rowEl=row;return row;
  }
  function makeCard(g,frag,id,open,sec){
    var h=document.createElement('div'),t=document.createElement('span'),ch=document.createElement('span'),body=document.createElement('div');
    h.className='bp-sec t3-sec t3-head';t.className='t3-ttl';t.textContent=lb(g.secs[id][0],g.secs[id][1]);h.appendChild(t);
    if(sec&&(sec.tog||sec.fx)){
      var sw=document.createElement('button');sw.type='button';sw.className='bp-switch';sw.setAttribute('aria-pressed','true');
      sw.addEventListener('click',function(e){e.stopPropagation();cancelLerp(g);secToggle(g,sec);paint(g.id);try{haptic(6);}catch(er){}try{bhuRepaint();}catch(er2){}});
      h.appendChild(sw);sec.sw=sw;
    }
    ch.className='t3-chev';h.appendChild(ch);body.className='t3-body';
    function sync(shut){body.classList.toggle('t3-shut',shut);ch.textContent=shut?'\u25b8':'\u25be';}
    var shut=!open;sync(shut);
    h.addEventListener('click',function(){shut=!shut;sync(shut);});
    frag.appendChild(h);frag.appendChild(body);return body;
  }
  function buildSlots(g,host){
    inject();
    var frag=document.createDocumentFragment(),used={},adv;
    g.bar=document.createElement('div');g.bar.className='t3-presets t3-ctx';
    g.info=document.createElement('div');g.info.className='t3-info';
    g.cbar=document.createElement('div');g.cbar.className='t3-presets t3-copy';
    frag.appendChild(g.bar);frag.appendChild(g.info);frag.appendChild(g.cbar);
    g.ui.forEach(function(sec,i){
      var body=makeCard(g,frag,sec.id,i===0,sec);
      if(sec.mem)body.appendChild(makeMaster(g,sec));
      (sec.raw||[]).forEach(function(p){var r=rowOf(g,p);if(!r)return;used[p]=1;body.appendChild(makeRow(g,r));});
    });
    adv=makeCard(g,frag,'adv',false,null);
    var last='';
    g.rows.forEach(function(r){
      if(used[r.p])return;
      if(r.s&&r.s!==last&&g.secs[r.s]){var h=document.createElement('div');h.className='bp-sec t3-sec';h.textContent=lb(g.secs[r.s][0],g.secs[r.s][1]);adv.appendChild(h);}
      last=r.s;adv.appendChild(makeRow(g,r));
    });
    host.appendChild(frag);
  }
  function build(g){
    if(g.built||g.dead)return;
    var host=g.box?document.getElementById(g.box):document.querySelector('#bh-panel .bp-page[data-page="'+g.id+'"]');
    if(!host)return;
    g.built=1;g.host=host;
    if(g.slots){buildSlots(g,host);return;}
    var frag=document.createDocumentFragment(),lastSec='';
    g.rows.forEach(function(r){
      if(g.secs&&r.s&&r.s!==lastSec&&g.secs[r.s]){var h=document.createElement('div');h.className='bp-sec t3-sec';h.textContent=lb(g.secs[r.s][0],g.secs[r.s][1]);frag.appendChild(h);}
      lastSec=r.s;frag.appendChild(makeRow(g,r));
    });
    host.appendChild(frag);
  }
  function chip(txt,on,fn){var b=document.createElement('button');b.type='button';b.className='bp-switch'+(on?'':' off');b.textContent=txt;b.setAttribute('aria-pressed',on?'true':'false');b.addEventListener('click',function(e){e.stopPropagation();fn();});return b;}
  function paintBar(g){
    var cur=g.ctx||ctxKey(),L=sectList(),ks=['ov'],i,sig;
    for(i=0;i<L.length;i++)ks.push(L[i].k);
    sig=ks.map(function(k){return k+(slotSaved(g,k)?'*':'');}).join(',')+'|'+cur;
    if(g.sig!==sig){
      g.sig=sig;g.bar.textContent='';g.cbar.textContent='';
      ks.forEach(function(k){g.bar.appendChild(chip(ctxShort(k)+(slotSaved(g,k)?' \u2022':''),k===cur,function(){}));});   /* indikator saja: slot ikut konteks yang lagi aktif; \u2022 = sudah tersimpan */
      var lab=document.createElement('span');lab.className='t3-sub';lab.textContent=lb('Copy from','Salin dari');g.cbar.appendChild(lab);
      g.cbar.appendChild(chip(lb('Default','Bawaan'),false,function(){copyFrom(g,'def');}));
      ks.forEach(function(k){if(k!==cur)g.cbar.appendChild(chip(ctxShort(k),false,function(){copyFrom(g,k);}));});
    }
    g.info.textContent=lb('Editing: ','Mengedit: ')+ctxName(cur);
  }
  function copyFrom(g,k){
    var v=(k==='def')?(function(){var o={};g.rows.forEach(function(r){if(!g.perf[r.p])o[r.p]=g.def[r.p];});return o;})():valuesFor(g,k);
    applyVals(g,v);paint(g.id);try{haptic(6);}catch(e){}try{bhuRepaint();}catch(e2){}   /* belum disimpan: tekan Save untuk mengunci ke slot ini */
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
    if(g.slots&&g.built){
      paintBar(g);
      g.ui.forEach(function(sec){
        if(!sec.mem&&!sec.fx)return;   /* Shape / Haze: cuma slider mentah, tidak ada master/saklar */
        var on=secOn(g,sec);
        if(sec.el){var m=mOf(g,sec);sec.el.value=String(Math.round(m*100));fill(sec.el);sec.out.textContent=Math.round(m*100)+'%';sec.rowEl.classList.toggle('t3-dim',!on);}
        if(sec.sw){sec.sw.setAttribute('aria-pressed',on?'true':'false');sec.sw.textContent=ttxt(on);sec.sw.classList.toggle('off',!on);}
      });
    }
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
  function toast(g){try{if(typeof showModeToast==='function')showModeToast((ID?g.idt:g.en)+(g.slots?' \u00b7 '+ctxShort(g.ctx||ctxKey()):''),null,1500);}catch(e){}}
  function save(id){
    var g=G[id];if(!g||g.dead)return;
    var o={},po={};
    g.rows.forEach(function(r){if(g.slots&&g.perf[r.p])po[r.p]=rawGet(g,r);else o[r.p]=rawGet(g,r);});
    try{
      if(g.slots){localStorage.setItem(slotKey(g,g.ctx||ctxKey()),JSON.stringify(o));localStorage.setItem(slotKey(g,'perf'),JSON.stringify(po));g.sig=null;}
      else localStorage.setItem(g.key,JSON.stringify(o));
    }catch(e){}
    toast(g);
  }
  function reset(id){
    var g=G[id];if(!g||g.dead)return;
    if(g.slots){   /* Reset = slot konteks aktif balik ke default (perf global tidak disentuh); {} supaya simpanan lama tidak muncul lagi */
      cancelLerp(g);
      g.rows.forEach(function(r){if(!g.perf[r.p])putRaw(g,r,g.def[r.p]);});
      afterAll(g);
      try{localStorage.setItem(slotKey(g,g.ctx||ctxKey()),'{}');}catch(e){}
      g.sig=null;return;
    }
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
  if(G.pl&&!G.pl.dead)setInterval(ctxTick,100);   /* pantau konteks (overview / sektor) -> lerp ke slot tujuan */
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();

  /* ---------- export semua setelan (tombol COPY TUNE di menu editor ?layout=1, 07-boot.js) ----------
     Nilai LIVE (yang lagi tampil), bukan cuma yang sudah di-Save. Format per grup = persis isi localStorage-nya (nilai CFG mentah),
     jadi bisa ditempel balik: localStorage.setItem(key, '<json>'). Grup yang mati (CFG-nya tidak ada) dilewati. */
  function r5(v){return Math.round(v*1e5)/1e5;}
  var TITLE={pl:'PLANET',dr:'DRONE',pt:'PORTAL',mw:'SKY / MILKY WAY'};
  function exportAll(){
    var L=['// TUNE3D \u2014 semua setelan tuning (nilai LIVE di layar, belum tentu sudah di-Save)'],n=0;
    ORDER.forEach(function(id){
      var g=G[id];if(!g||g.dead)return;
      var o={},ch=0;
      g.rows.forEach(function(r){var v=r5(rawGet(g,r));o[r.p]=v;if(Math.abs(v-g.def[r.p])>(r.t?.5:.5/r.sc))ch++;});
      L.push('','// '+TITLE[id]+' \u00b7 key '+g.key+(g.slots?'_'+(g.ctx||ctxKey()):'')+' \u00b7 '+ch+' beda dari default',JSON.stringify(o));n++;
      if(g.slots)['ov'].concat(sectList().map(function(x){return x.k;})).concat(['perf']).forEach(function(k){var so=lsGet(slotKey(g,k));if(so&&Object.keys(so).length)L.push('// slot '+k+' \u00b7 key '+slotKey(g,k),JSON.stringify(so));});
    });
    return n?L.join('\n'):'';
  }

  return{
    exportAll:exportAll,
    has:function(id){return !!G[id];},
    ok:function(id){var g=G[id];return !!g&&!g.dead;},
    paint:paint,dirty:dirty,save:save,reset:reset,
    defaults:function(id){return G[id]?G[id].def:null;}
  };
})();
