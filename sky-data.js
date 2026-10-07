/* =====================================================================================================
   sky-data.js — SATU-SATUNYA tempat data rasi / cluster / bintang SFX / sektor.
   Dimuat SEBELUM index.js (lihat <script> di index.html) dan di-importScripts oleh service-worker.js,
   jadi file ini TIDAK BOLEH menyentuh window / document. Isinya cuma data + fungsi murni.

   index.js mengambil semua tabel turunan dari objek SKY (TRIGGERS, STELLAR_*, CONS_LABELS, UNLOCK_CONS, TERM_DIST,
   SIGNAL_FRAGMENTS, FOCUS_*, daftar track panel musik, tombol #xxx-fx, daftar audio SW, dst). Jadi menambah rasi /
   bintang = isi data di sini, BUKAN lagi edit belasan tempat di index.js.

   ---------------------------------------------------------------------------------------------------
   CARA TAMBAH RASI BARU (tanpa SFX dulu — pola Gemini)
     1. GEOMETRI : tambah objek {id,ra0,delay,phase,stars,lines} di array GEOMETRY (paling bawah file ini).
     2. RASI     : tambah satu record di array RASI. Isi: id, sector, label, focusName, focus, dist, box, whisper, info.
                   - off:true  -> data ada tapi UI mati (tidak digambar / tidak bisa ditap / tidak muncul di sektor).
                   - box       -> kotak layout portrait + landscape (WAJIB, fungsi (W,top,ah,bot) => [x0,y0,x1,y1]).
                   - scene     -> (opsional) kalau ikut komposisi/rotasi sektor Orion (SCN).
                   - cap       -> (opsional) caption di bawah/atas rasi.
                   - unlock:true -> rasi masuk arsip + minigame alignment (WAJIB punya minimal 1 bintang SFX).
     3. SEKTOR   : sector:'winter' | 'summer' | 'spring' | 'autumn' (4 sektor musim). Urutan record = urutan ikon;
                   record PERTAMA di tiap sektor = glyph ikon overview.
     4. Jalankan  node check-sky.js  -> harus keluar "OK" (laporkan data yang kelupaan / salah).

   CARA TAMBAH BINTANG SFX (di rasi yang sudah ada)
     1. Taruh file audio/<label huruf kecil>.opus   (contoh label 'Betelgeuse' -> audio/betelgeuse.opus)
     2. Tambah satu record di array SFX (urutan record = urutan di panel musik, dikelompokkan per sektor).
        Bintang HARUS ada di `lines` rasinya (alignment dihitung dari urutan garis, bintang SFX terakhir).
        fx:false -> tidak ada tombol #xxx-fx (bintang cuma bisa ditap lewat canvas, contoh Spica).
     3. Pastikan rasinya unlock:true (kalau belum, tambahkan).
     4. Jalankan  node check-sky.js

   YANG MASIH DI index.js (bukan data):  posisi cluster (Pleiades), logika alignment khusus (PLE_CHAIN).
   DEPLOY: naikkan ?v= sky-data.js + index.js di index.html, SHELL + VERSION di service-worker.js.
   ===================================================================================================== */
var SKY=(function(){

/* ---------- 1. SEKTOR (4 sektor musim) ---------- */
var SECTORS=[
  /* title = nama sektor; stars = rencana bintang SFX sektor ini (alfabet, DATA SAJA — belum ada audio/record SFX).
     Saat SFX-nya jadi: tambah record di array SFX, nama di `stars` dipakai check-sky.js buat nandain yang belum dibuat. */
  {k:'winter', season:'Winter', name:'Winter', title:'The Pantheon of Radiant Heroes', a:-150,
   stars:['Aldebaran','Betelgeuse','Castor','Pollux','Pleione','Rigel','Sirius']},
  {k:'summer', season:'Summer', name:'Summer', title:'The Guardians of the Cosmic Balance', a:-30,
   stars:['Alioth','Alphard','Arcturus','Denebola','Spica']},
  {k:'spring', season:'Spring', name:'Spring', title:'The Assembly of Celestial Beasts', a:150,
   stars:['Altair','Antares','Deneb','Nunki','Rasalhague','Vega']},
  {k:'autumn', season:'Autumn', name:'Autumn', title:'The Royal Court of the Fallen Dynasty', a:30,
   stars:['Algol','Alpheratz','Alpherg','Hamal','Schedar']}
];

/* ---------- 2. RASI & CLUSTER ---------- */
var RASI=[
  {id:'orion', sector:'winter', label:'Orion', focusName:'Orion', focus:2, dist:1344, unlock:true,
   cap:{text:'Orion', x:'mid', dx:-30, y:'bottom', dy:22},
   box:{portrait:function(W,top,ah,bot){return [W*.32,top-ah*.02,W*.64,top+ah*.32];}, land:function(W,top,ah,bot){return [W*.22,top+ah*.02,W*.37,bot-12];}},
   scene:{k:.7738, th:-23.84, pv:[492,651], at:[299.86,647.23]},
   whisper:["The hunter never moved. We just kept looking.","Three stars in a row, and somehow it became a story."],
   info:{"tag":"Constellation · The Hunter","rows":[["Brightest","Rigel · mag 0.13"],["Betelgeuse","~550–700 ly"],["Orion Nebula","M42 · ~1,350 ly"],["Area","594 sq°"]],"fact":"Betelgeuse is a red supergiant so vast it would swallow Mars’s orbit if it sat where the Sun does."}},
  {id:'taurus', sector:'winter', label:'Taurus', focusName:'Taurus', focus:4, dist:65, unlock:true,
   cap:{text:'Taurus', x:'mid', dx:-28, y:'bottom', dy:18},
   box:{portrait:function(W,top,ah,bot){return [W*.12,top+ah*.64,W*.42,top+ah*.92];}, land:function(W,top,ah,bot){return [W*.02,top+ah*.48,W*.15,bot-28];}},
   scene:{k:.7241, th:5.3, tx:312.95, ty:-58.3},
   whisper:["The bull is not charging. It has simply waited a very long time.","Seven sisters ride on its shoulder."],
   info:{"tag":"Constellation · The Bull","rows":[["Brightest","Aldebaran · ~65 ly"],["Cluster","Pleiades M45"],["Crab Nebula","M1 · ~6,500 ly"],["Area","797 sq°"]],"fact":"The Crab Nebula is the remnant of a supernova that Chinese astronomers recorded in 1054."}},
  {id:'canis', sector:'winter', label:'Canis Major', focusName:'Sirius', focus:1, dist:9, unlock:true,
   cap:{text:'Canis Major', x:'mid', dx:-48, y:'bottom', dy:18},
   box:{portrait:function(W,top,ah,bot){return [W*.04,top+ah*.14,W*.18,top+ah*.32];}, land:function(W,top,ah,bot){return [W*.02,top+ah*.08,W*.10,top+ah*.34];}},
   scene:{k:.5417, th:4, pv:[445,316], at:[3.05,938.8]},
   whisper:["The brightest dog in the sky, and it still follows.","Sirius answers if you wait long enough."],
   info:{"tag":"Constellation · The Great Dog","rows":[["Brightest","Sirius · mag −1.46"],["Distance","8.6 ly"],["Companion","Sirius B, white dwarf"],["Area","380 sq°"]],"fact":"Sirius is the brightest star in the night sky, and one of our nearest neighbours."}},
  {id:'pleiades', sector:'winter', label:'Pleiades', focusName:'Pleiades', focus:5, dist:444, cluster:true, unlock:true,
   whisper:["Seven voices, one soft cluster.","Lean closer. They only whisper."],
   info:{"tag":"Open cluster · M45","rgb":"145,170,255","rows":[["Distance","~444 ly"],["Age","~100 million years"],["Members","1,000+ stars"],["Naked eye","6–7 visible"]],"fact":"Blue light from its young stars is lighting a haze of dust around the cluster."}},
  {id:'gemini', sector:'winter', label:'Gemini', focusName:'Gemini', focus:3, dist:34, off:true,
   box:{portrait:function(W,top,ah,bot){return [W*.04,top+ah*.0,W*.30,top+ah*.2];}, land:function(W,top,ah,bot){return [W*.12,top+ah*.0,W*.30,top+ah*.3];}},
   scene:{k:.9, th:0, tx:-160, ty:-10},
   whisper:[] /* BELUM ADA — isi sebelum off dilepas */,
   info:null /* BELUM ADA — isi sebelum off dilepas */},
  {id:'virgo', sector:'summer', label:'Virgo', focusName:'Virgo', focus:2, dist:250, unlock:true,
   cap:{text:'Virgo', x:'right', dx:-42, y:'top', dy:-24},
   box:{portrait:function(W,top,ah,bot){return [W*.52,top+ah*.72,W*.82,bot-34];}, land:function(W,top,ah,bot){return [W*.72,top+ah*.08,W*.96,bot-12];}},
   whisper:["Spica burns quietly, like it knows something.","Spring sleeps here, folded in blue light."],
   info:{"tag":"Constellation · The Maiden","rows":[["Brightest","Spica · ~250 ly"],["Rank","2nd largest of 88"],["Cluster","Virgo · ~1,300 galaxies"],["Area","1,294 sq°"]],"fact":"Galaxy M87 hides here, home of the first black hole ever photographed."}},
  {id:'bootes', sector:'summer', label:'Boötes', focusName:'Boötes', focus:1, dist:37, unlock:true,
   box:{portrait:function(W,top,ah,bot){return [W*.78,top+ah*.52,W*.90,top+ah*.66];}, land:function(W,top,ah,bot){return [W*.62,top+ah*.18,W*.70,top+ah*.38];}}, /* kite kecil, digeser turun */
   whisper:["The herdsman holds a lantern called Arcturus.","Amber light, older than the question."],
   info:{"tag":"Constellation · The Herdsman","rows":[["Brightest","Arcturus · ~37 ly"],["Type","Orange giant"],["Rank","4th brightest star"],["Area","907 sq°"]],"fact":"Nearby lies the Boötes Void, an emptiness about 330 million light-years wide."}},
  {id:'scorpius', sector:'spring', label:'Scorpius', focusName:'Antares', focus:1, dist:550, unlock:true,
   box:{portrait:function(W,top,ah,bot){return [W*.76,top+ah*.05,W*.88,top+ah*.28];}, land:function(W,top,ah,bot){return [W*.34,top+ah*.12,W*.42,top+ah*.44];}}, /* kanan-atas Orion / kiri tengah (luar zona lensing BH) */
   whisper:["Antares glows red, a heart that never settled.","The scorpion waits where the summer sky is thickest."],
   info:{"tag":"Constellation · The Scorpion","rows":[["Brightest","Antares · ~550 ly"],["Type","Red supergiant"],["Size","~700× the Sun"],["Area","497 sq°"]],"fact":"Antares means “rival of Mars”, named for its matching red glow."}}
];

/* Lubang hitam (Gargantua) bukan rasi, tapi punya bisikan + kartu info kamera. */
var BH={
  whisper:["Everything here is a question that never got answered.","Even light stops to think about it."],
  info:{"tag":"Supermassive black hole · Fiction","rgb":"255,170,90","rows":[["Source","Interstellar (2014)"],["Mass","~100 million suns"],["Horizon","~1 AU across"],["Spin","Near-maximal (Kerr)"]],"fact":"One hour near Miller’s planet equals about seven years back on Earth."}
};

/* ---------- 3. BINTANG SFX (urutan = urutan di panel musik; dikelompokkan per sektor) ---------- */
var SFX=[
  {key:'betel', label:'Betelgeuse', cons:'orion', star:'betel', rgb:'255,72,64',
   recap:{"name":"BETELGEUSE","spec":"M1-2 Ia","dist":"640 LY"},
   data:{"name":"BETELGEUSE","dist":"642 LY","spec":"M1-M2Ia","mag":"0.50","ra":"05h 55m","dec":"+07°24′"},
   fragment:{"tag":"FRAGMENT // BETELGEUSE","title":"Red Giant · Imminent","body":"A dying sun that still sings. The pulse you hear is collapse delayed — beauty measured in centuries of afterglow.","meta":["RA 05h 55m","DEC +07° 24′","SPEC M1-2 Ia","LINK · Orion belt"]}},
  {key:'rigel', label:'Rigel', cons:'orion', star:'rigel', rgb:'74,165,255',
   recap:{"name":"RIGEL","spec":"B8 Ia","dist":"860 LY"},
   data:{"name":"RIGEL","dist":"860 LY","spec":"B8Ia","mag":"0.13","ra":"05h 14m","dec":"-08°12′"},
   fragment:{"tag":"FRAGMENT // RIGEL","title":"Blue Supergiant · Anchor","body":"The foot of the hunter. Cold light, deep bass — a signal that arrives after the story has already moved on.","meta":["RA 05h 14m","DEC −08° 12′","SPEC B8 Ia","LINK · Saiph arc"]}},
  {key:'sirius', label:'Sirius', cons:'canis', star:'sirius', rgb:'180,220,255',
   recap:{"name":"SIRIUS","spec":"A1 V","dist":"8.6 LY"},
   data:{"name":"SIRIUS","dist":"8.6 LY","spec":"A1V","mag":"-1.46","ra":"06h 45m","dec":"-16°42′"},
   fragment:{"tag":"FRAGMENT // SIRIUS","title":"Dog Star · Brightest","body":"Nearest of the great ones. Sharp, white, impossible to ignore — the observatory’s first hello from the winter sky.","meta":["RA 06h 45m","DEC −16° 42′","SPEC A1 V","LINK · Canis Major"]}},
  {key:'aldebaran', label:'Aldebaran', cons:'taurus', star:'aldebaran', rgb:'255,160,90',
   recap:{"name":"ALDEBARAN","spec":"K5 III","dist":"65 LY"},
   data:{"name":"ALDEBARAN","dist":"65 LY","spec":"K5III","mag":"0.85","ra":"04h 35m","dec":"+16°30′"},
   fragment:{"tag":"FRAGMENT // ALDEBARAN","title":"Follower · Bull’s Eye","body":"Orange watchman of Taurus. It trails the Pleiades across the night — patient, warm, always one step behind the sisters.","meta":["RA 04h 35m","DEC +16° 30′","SPEC K5 III","LINK · Hyades"]}},
  {key:'pleione', label:'Pleione', cons:'pleiades', star:'Pleione', rgb:'145,170,255',
   recap:{"name":"PLEIONE","spec":"B8 Vne","dist":"440 LY"},
   data:{"name":"PLEIONE","dist":"380 LY","spec":"B8ne","mag":"5.05","ra":"03h 49m","dec":"+24°08′"},
   fragment:{"tag":"FRAGMENT // PLEIONE","title":"Seven Sisters · Edge","body":"A soft cluster voice near Atlas. Not the brightest, but the one that answers when you lean closer to the glass.","meta":["RA 03h 49m","DEC +24° 08′","SPEC B8 Vne","LINK · Pleiades"]}},
  {key:'spica', label:'Spica', cons:'virgo', star:'spica', rgb:'140,200,255', fx:false,
   recap:{"name":"SPICA","spec":"B1 III-IV","dist":"250 LY"},
   data:{"name":"SPICA","dist":"250 LY","spec":"B1III","mag":"0.98","ra":"13h 25m","dec":"-11°10′"},
   fragment:{"tag":"FRAGMENT // SPICA","title":"Binary Spike · Harvest","body":"Two stars locked in a brief, bright orbit. The earthen spike of Virgo — a note that cuts clean through the dark.","meta":["RA 13h 25m","DEC −11° 09′","SPEC B1 III-IV","LINK · Virgo spine"]}},
  {key:'arcturus', label:'Arcturus', cons:'bootes', star:'arcturus', rgb:'255,180,80',
   recap:{"name":"ARCTURUS","spec":"K1.5 III","dist":"37 LY"},
   data:{"name":"ARCTURUS","dist":"36.7 LY","spec":"K1.5III","mag":"-0.05","ra":"14h 15m","dec":"+19°10′"},
   fragment:{"tag":"FRAGMENT // ARCTURUS","title":"Bear Guardian · Kite Tip","body":"The golden tip of Boötes. Ancient light from an old disk star — a calm, amber tone over the spring fields.","meta":["RA 14h 15m","DEC +19° 10′","SPEC K1.5 III","LINK · Boötes kite"]}},
  {key:'antares', label:'Antares', cons:'scorpius', star:'antares', rgb:'255,69,0',
   recap:{"name":"ANTARES","spec":"M1.5 Iab","dist":"550 LY"},
   data:{"name":"ANTARES","dist":"550 LY","spec":"M1.5Iab","mag":"1.06","ra":"16h 29m","dec":"-26°25′"},
   fragment:{"tag":"FRAGMENT // ANTARES","title":"Rival of Mars · Sting","body":"Heart of the scorpion. Red against the summer haze — a rival’s name for a star that refuses to be quiet.","meta":["RA 16h 29m","DEC −26° 25′","SPEC M1.5 Iab","LINK · Scorpius arc"]}}
];

/* Audio non-SFX (tanpa .opus). BGM dipakai index.html, DUMUL_AUDIO dipakai dumul.html — dua-duanya ikut precache SW. */
var BGM_AUDIO=['constellation','glitch-instrumental','collapsars'];
var DUMUL_AUDIO=['limerence','glitch','nastenka','larung'];

/* ---------- 4. GEOMETRI (titik + garis imajiner hasil trace) ---------- */
var GEOMETRY=[
 {id:'orion',ra0:84.5,delay:.3,phase:0,
  /* Fixed traced geometry: 1000×1000 source, preserved 1:1 then fit responsively. */
  stars:{
   meissa:{fx:230,fy:198,r:1.7,c:'#eaf6ff'},meissa2:{fx:311,fy:175,r:1.5,c:'#eaf6ff'},
   baham1:{fx:248,fy:306,r:1.35,c:'#dcefff'},baham2:{fx:285,fy:282,r:1.35,c:'#dcefff'},
   siku:{fx:315,fy:404,r:1.35,c:'#dcefff'},
   betel:{fx:365,fy:455,r:3.5,c:'#ff8e66',name:'Betelgeuse',nx:1,dy:-9},
   bella2:{fx:501,fy:392,r:1.55,c:'#dcefff'},bella:{fx:559,fy:479,r:2.5,c:'#dcefff'},
   bow1:{fx:781,fy:389,r:1.35,c:'#dcefff'},bow2:{fx:805,fy:407,r:1.25,c:'#dcefff'},bow3:{fx:807,fy:459,r:1.25,c:'#dcefff'},
   bow4:{fx:806,fy:507,r:1.25,c:'#dcefff'},bow5:{fx:789,fy:564,r:1.25,c:'#dcefff'},bow6:{fx:750,fy:597,r:1.25,c:'#dcefff'},
   alnitak:{fx:454,fy:664,r:2.7,c:'#cfeeff'},alnilam:{fx:492,fy:651,r:2.9,c:'#cfeeff'},mintaka:{fx:523,fy:638,r:2.5,c:'#cfeeff'},
   saiph:{fx:416,fy:860,r:2.4,c:'#cde6ff'},rigel:{fx:638,fy:827,r:3.7,c:'#bfe0ff',name:'Rigel',nx:-1,dy:2}
  },
  lines:[["meissa","baham1"],["meissa2","baham2"],["baham1","siku"],["siku","betel"],["betel","bella2"],["bella2","bella"],["bella","bow3"],["bow1","bow2"],["bow2","bow3"],["bow3","bow4"],["bow4","bow5"],["bow5","bow6"],["betel","alnitak"],["bella","mintaka"],["alnitak","alnilam"],["alnilam","mintaka"],["alnitak","saiph"],["mintaka","rigel"],["saiph","rigel"]],
  nebula:{fx:500,fy:600}},
 {id:'virgo',ra0:190.7,delay:1.4,phase:2.1,
  stars:{
   kiriJauh:{fx:260,fy:565,r:1.35,c:'#eaf6ff'},kiriTengah:{fx:382,fy:509,r:1.35,c:'#eaf6ff'},tengahKiri:{fx:461,fy:511,r:1.5,c:'#f0f6ff'},
   zavijava:{fx:512,fy:265,r:1.9,c:'#eaf6ff'},tengahAtas:{fx:600,fy:447,r:1.55,c:'#eaf6ff'},tengahKanan:{fx:665,fy:500,r:1.55,c:'#eaf6ff'},
   kananJauh:{fx:735,fy:326,r:1.9,c:'#ffe0c0'},atasSpica:{fx:542,fy:562,r:1.4,c:'#eaf6ff'},
   spica:{fx:519,fy:666,r:3.8,c:'#bfe0ff',name:'Spica',nx:-1},bawahTengah:{fx:384,fy:736,r:1.5,c:'#eaf6ff'},
   bawahKiriTengah:{fx:366,fy:657,r:1.35,c:'#eaf6ff'},bawahKiriUjung:{fx:293,fy:699,r:1.35,c:'#eaf6ff'},kananTengah:{fx:700,fy:400,r:1.55,c:'#ffe9c9'}
  },
  lines:[["kiriJauh","kiriTengah"],["kiriTengah","tengahKiri"],["tengahKiri","tengahAtas"],["tengahAtas","zavijava"],["tengahAtas","tengahKanan"],["tengahKanan","kananTengah"],["kananTengah","kananJauh"],["tengahKanan","atasSpica"],["tengahKiri","spica"],["atasSpica","spica"],["bawahKiriUjung","bawahKiriTengah"],["bawahKiriTengah","bawahTengah"],["bawahTengah","spica"]]},
 {id:'canis',ra0:103.5,delay:2.2,phase:4.0,
  stars:{
   theta:{fx:322,fy:183,r:1.5,c:'#eaf6ff'},iota:{fx:271,fy:314,r:1.7,c:'#dcefff'},muliphein:{fx:351,fy:343,r:1.7,c:'#eaf6ff'},
   sirius:{fx:445,fy:316,r:4.2,c:'#e8f4ff',name:'Sirius',nx:1,dy:-10},mirzam:{fx:660,fy:313,r:2.6,c:'#bfe0ff'},mulipheinBody:{fx:548,fy:388,r:1.7,c:'#eaf6ff'},
   furud:{fx:587,fy:477,r:1.55,c:'#cfeeff'},wezenTop:{fx:359,fy:564,r:1.35,c:'#cfeeff'},wezen:{fx:342,fy:617,r:2.7,c:'#cfeeff'},
   tengahAtas:{fx:438,fy:520,r:1.6,c:'#cfeeff'},tengahBawah:{fx:414,fy:665,r:1.6,c:'#cfeeff'},adhara:{fx:448,fy:697,r:2.6,c:'#a8d4ff'},
   aludra:{fx:245,fy:776,r:2.4,c:'#cde6ff'},ekorKanan:{fx:768,fy:671,r:1.5,c:'#cfeeff'},ekorBawah:{fx:552,fy:803,r:1.5,c:'#cfeeff'}
  },
  lines:[["theta","iota"],["theta","muliphein"],["iota","muliphein"],["muliphein","sirius"],["sirius","mulipheinBody"],["mirzam","mulipheinBody"],["sirius","wezenTop"],["wezenTop","wezen"],["mulipheinBody","furud"],["mulipheinBody","tengahAtas"],["tengahAtas","tengahBawah"],["tengahBawah","adhara"],["wezen","adhara"],["wezen","aludra"],["adhara","ekorKanan"],["adhara","ekorBawah"]]},
 /* Taurus — coords LOCK from taurus_final (1000-space). Only Aldebaran is interactive. */
 {id:'taurus',ra0:68.9,delay:1.0,phase:1.2,
  stars:{
   elnath:{fx:157,fy:204,r:3.2,c:'#eaf6ff'},
   leftHorn:{fx:87,fy:423,r:1.7,c:'#dcefff'},
   upperMid:{fx:400,fy:378,r:1.85,c:'#eaf6ff'},
   theta1:{fx:481,fy:467,r:1.95,c:'#ffe9a0'},
   theta2:{fx:514,fy:503,r:1.95,c:'#ffe9a0'},
   aldebaran:{fx:443,fy:533,r:3.6,c:'#ffb27a',name:'Aldebaran',nx:-1,dy:2},
   nearAlde:{fx:482,fy:542,r:1.55,c:'#eaf6ff'},
   hyadesTip:{fx:536,fy:549,r:1.7,c:'#eaf6ff'},
   tail1:{fx:651,fy:613,r:1.7,c:'#dcefff'},
   tail2a:{fx:862,fy:671,r:1.7,c:'#dcefff'},
   tail2b:{fx:878,fy:688,r:1.95,c:'#eaf6ff'}
  },
  lines:[
   ["elnath","upperMid"],["upperMid","theta1"],["theta1","theta2"],["theta2","hyadesTip"],
   ["hyadesTip","tail1"],["tail1","tail2a"],["tail2a","tail2b"],
   ["leftHorn","aldebaran"],["aldebaran","nearAlde"],["nearAlde","hyadesTip"]
  ]},
 {id:'bootes',ra0:0,delay:1.0,phase:1.2,
  /* Classic kite matching Space.com ref: top → shoulders → lower sides →
     Arcturus at tip, two short legs below. y grows downward. */
  stars:{
   bootes_top:{fx:0,fy:-95,r:1.75,c:'#eaf6ff'},
   bootes_left:{fx:-58,fy:-38,r:1.7,c:'#eaf6ff'},
   bootes_right:{fx:52,fy:-48,r:1.7,c:'#eaf6ff'},
   bootes_ml:{fx:-28,fy:8,r:1.65,c:'#eaf6ff'},
   izar:{fx:32,fy:2,r:2.0,c:'#dcefff'},
   arcturus:{fx:4,fy:58,r:3.8,c:'#ffb450',name:'Arcturus',nx:-1,dy:14},
   bootes_legL:{fx:-32,fy:98,r:1.55,c:'#eaf6ff'},
   bootes_legR:{fx:38,fy:102,r:1.55,c:'#eaf6ff'}
  },
  lines:[
   ["bootes_top","bootes_left"],["bootes_top","bootes_right"],
   ["bootes_left","bootes_ml"],["bootes_right","izar"],
   ["bootes_ml","arcturus"],["izar","arcturus"],
   ["arcturus","bootes_legL"],["arcturus","bootes_legR"]
  ]},
 {id:'scorpius',ra0:0,delay:1.1,phase:1.4,
  /* Geometry LOCKED to scorpius-map.html — 1000×1000 reference coordinates. */
  stars:{
   topmost:{fx:875,fy:115,r:2.2,c:'#eaf6ff'},
   midRight:{fx:875,fy:260,r:2.0,c:'#eaf6ff'},
   rightmost:{fx:925,fy:395,r:1.8,c:'#dcefff'},
   antares:{fx:625,fy:345,r:4.0,c:'#ff4500',name:'Antares',nx:-1,dy:-11,specAfter:1},
   belowAntares:{fx:575,fy:435,r:2.0,c:'#eaf6ff'},
   midBody:{fx:515,fy:610,r:2.2,c:'#dcefff'},
   lowerMid:{fx:530,fy:705,r:2.1,c:'#ffe9c7'},
   bottomBody:{fx:550,fy:835,r:2.0,c:'#eaf6ff'},
   bm1:{fx:450,fy:875,r:1.8,c:'#ffe9c7'},
   bm2:{fx:380,fy:890,r:1.8,c:'#eaf6ff'},
   bottomLeft:{fx:235,fy:905,r:2.2,c:'#fff2cc'},
   tiny:{fx:145,fy:810,r:1.5,c:'#eaf6ff'},
   small:{fx:185,fy:745,r:1.6,c:'#dcefff'},
   shaula:{fx:285,fy:665,r:3.2,c:'#7dd8e0'}
  },
  lines:[
   ["antares","topmost"],["antares","midRight"],["antares","rightmost"],["antares","belowAntares"],
   ["belowAntares","midBody"],["midBody","lowerMid"],["lowerMid","bottomBody"],["bottomBody","bm1"],
   ["bm1","bm2"],["bm2","bottomLeft"],["bottomLeft","tiny"],["tiny","small"],["small","shaula"]
  ]},
 /* Gemini: DATA aktif (titik+shape+garis), UI integrasi NONAKTIF (lihat CONS_OFF, R3, R5, sectShow). */
 {id:'gemini',ra0:0,delay:1.0,phase:.8,
  /* Geometry dari gemini-constellation.html: 17 titik, viewBox 713×430 (Castor = g2, Pollux = g9). Belum ada SFX -> slot terkunci, tidak interaktif. */
  stars:{
   g1:{fx:314,fy:51,r:2.6,c:'#eaf6ff'},
   g2:{fx:205,fy:121,r:3.1,c:'#eaf6ff',name:'Castor',nx:-1,dy:-8},
   g3:{fx:283,fy:127,r:2.23,c:'#eaf6ff'},
   g4:{fx:560,fy:127,r:2.11,c:'#eaf6ff'},
   g5:{fx:529,fy:158,r:1.86,c:'#eaf6ff'},
   g6:{fx:410,fy:164,r:3.1,c:'#eaf6ff'},
   g7:{fx:504,fy:171,r:2.17,c:'#eaf6ff'},
   g8:{fx:258,fy:185,r:2.11,c:'#eaf6ff'},
   g9:{fx:181,fy:196,r:3.3,c:'#ffd9a8',name:'Pollux',nx:-1,dy:7},
   g10:{fx:229,fy:210,r:2.36,c:'#eaf6ff'},
   g11:{fx:485,fy:217,r:2.05,c:'#eaf6ff'},
   g12:{fx:214,fy:263,r:2.17,c:'#eaf6ff'},
   g13:{fx:364,fy:269,r:2.11,c:'#eaf6ff'},
   g14:{fx:306,fy:270,r:2.23,c:'#eaf6ff'},
   g15:{fx:482,fy:308,r:2.85,c:'#eaf6ff'},
   g16:{fx:333,fy:364,r:2.29,c:'#eaf6ff'},
   g17:{fx:453,fy:371,r:2.23,c:'#eaf6ff'}
  },
  lines:[["g1","g3"],["g2","g3"],["g3","g6"],["g6","g7"],["g7","g5"],["g5","g4"],["g6","g11"],["g3","g8"],["g8","g10"],["g9","g10"],["g10","g12"],["g10","g14"],["g14","g13"],["g13","g15"],["g14","g16"],["g16","g17"]]}
];

/* =====================================================================================================
   BAGIAN BAWAH = PEMBANGUN TABEL TURUNAN. Biasanya tidak perlu disentuh.
   ===================================================================================================== */
var rasiBy={},sfxBy={},consOff={},D={};
RASI.forEach(function(r){rasiBy[r.id]=r;if(r.off)consOff[r.id]=1;});
SFX.forEach(function(s){sfxBy[s.key]=s;s.name=s.label.toLowerCase();s.audio=s.name+'.opus';});

/* sektor runtime: ids = rasi AKTIF (off tidak ikut) dalam urutan record */
var sectors=SECTORS.map(function(s){
  return {k:s.k,name:s.name,title:s.title,season:s.season,a:s.a,
    ids:RASI.filter(function(r){return r.sector===s.k&&!r.off;}).map(function(r){return r.id;})};
});

/* tabel turunan (bentuknya sama persis dengan tabel manual lama di index.js) */
D.TRIGGERS={};D.STELLAR_LABELS={};D.STELLAR_CONS={};D.CONS_LABELS={};D.CONS_STARS={};D.SIGNAL_FRAGMENTS={};
D.LAST_SIGNAL_DATA={};D.STAR_DATA={};D.SIGNAL_NAMES={};D.FOCUS_WHISPER={bh:BH.whisper};D.FOCUS_INFO={bh:BH.info};
D.TERM_DIST={};D.UNLOCK_CONS=[];D.STELLAR_KEYS=[];D.STAR_KEY={};D.FX_KEYS=[];
SFX.forEach(function(s){
  D.TRIGGERS[s.key]={id:s.key,cons:s.cons,star:s.star,rgb:s.rgb};
  D.STELLAR_KEYS.push(s.key);D.STELLAR_LABELS[s.key]=s.label;D.STELLAR_CONS[s.key]=s.cons;
  (D.CONS_STARS[s.cons]=D.CONS_STARS[s.cons]||[]).push(s.key);
  D.SIGNAL_FRAGMENTS[s.key]=s.fragment;D.LAST_SIGNAL_DATA[s.key]=s.recap;D.STAR_DATA[s.key]=s.data;
  D.SIGNAL_NAMES[s.key]=s.name;
  if(s.fx!==false)D.FX_KEYS.push(s.key);
  if(!rasiBy[s.cons]||!rasiBy[s.cons].cluster)D.STAR_KEY[s.star]=s.key;   /* bintang di GEOMETRY -> key (cluster ditangani terpisah) */
});
D.STELLAR_KEYS.sort();
RASI.forEach(function(r){
  D.CONS_LABELS[r.id]=r.label;D.TERM_DIST[r.id]=r.dist;
  if(r.whisper&&r.whisper.length)D.FOCUS_WHISPER[r.id]=r.whisper;
  if(r.info)D.FOCUS_INFO[r.id]=r.info;
  if(r.unlock)D.UNLOCK_CONS.push(r.id);
});

/* urutan kamera fokus: per sektor (k) atau semua sektor kalau k kosong. Rasi off tetap ikut (index.js menyaring lewat sectShow). */
function focusOrder(k){
  var out=[];
  SECTORS.forEach(function(s){
    if(k&&s.k!==k)return;
    RASI.filter(function(r){return r.sector===s.k;}).sort(function(a,b){return a.focus-b.focus;}).forEach(function(r){out.push(r.id);});
  });
  return out;
}

/* grup panel musik: tiap sektor + semua SFX miliknya (rasi off tetap dihitung biar relay jalan) */
function panelGroups(){
  return SECTORS.map(function(s,i){
    return {k:s.k,no:i+1,season:s.season,name:s.name,title:s.title,planned:s.stars,
      sfx:SFX.filter(function(x){return rasiBy[x.cons]&&rasiBy[x.cons].sector===s.k;})};
  });
}

/* daftar file audio buat service worker (path relatif, urutan: BGM, SFX, DUMUL) */
function audioFiles(){
  return BGM_AUDIO.map(function(n){return 'audio/'+n+'.opus';})
    .concat(SFX.map(function(s){return 'audio/'+s.audio;}))
    .concat(DUMUL_AUDIO.map(function(n){return 'audio/'+n+'.opus';}));
}

/* pemeriksaan konsistensi -> array pesan masalah (kosong = aman). Dipakai check-sky.js; juga jalan sekali di console kalau ?dev. */
function check(){
  var P=[],geo={},seen={};
  GEOMETRY.forEach(function(c){geo[c.id]=c;});
  SECTORS.forEach(function(s){if(seen['s'+s.k])P.push('sektor ganda: '+s.k);seen['s'+s.k]=1;});
  if(SECTORS.length!==4)P.push('jumlah sektor harus 4 (musim), sekarang '+SECTORS.length);
  RASI.forEach(function(r){
    var w='rasi '+r.id+': ';
    if(seen['r'+r.id])P.push(w+'id ganda');seen['r'+r.id]=1;
    if(!SECTORS.some(function(s){return s.k===r.sector;}))P.push(w+'sector "'+r.sector+'" tidak ada');
    if(!r.label)P.push(w+'label kosong');
    if(typeof r.dist!=='number')P.push(w+'dist (jarak ly) belum diisi');
    if(typeof r.focus!=='number')P.push(w+'focus (urutan kamera) belum diisi');
    if(r.cluster){if(geo[r.id])P.push(w+'cluster tidak boleh punya GEOMETRY');}
    else{
      if(!geo[r.id])P.push(w+'tidak ada di GEOMETRY');
      if(!r.box||!r.box.portrait||!r.box.land)P.push(w+'box.portrait / box.land WAJIB (layout crash tanpa ini)');
    }
    if(!r.off){
      if(!r.whisper||r.whisper.length<2)P.push(w+'whisper (min 2 kalimat) belum ada');
      if(!r.info)P.push(w+'info kartu kamera belum ada');
    }
    var own=SFX.filter(function(s){return s.cons===r.id;});
    if(r.unlock&&!own.length)P.push(w+'unlock:true tapi belum punya bintang SFX (alignment mustahil selesai)');
    if(!r.unlock&&own.length)P.push(w+'punya SFX tapi unlock tidak true');
    if(r.unlock&&r.off)P.push(w+'unlock tidak boleh bareng off');
  });
  GEOMETRY.forEach(function(c){if(!rasiBy[c.id])P.push('GEOMETRY '+c.id+' tidak punya record di RASI');});
  SFX.forEach(function(s){
    var w='sfx '+s.key+': ',r=rasiBy[s.cons];
    if(seen['f'+s.key])P.push(w+'key ganda');seen['f'+s.key]=1;
    if(seen['n'+s.name])P.push(w+'nama/audio ganda ('+s.name+')');seen['n'+s.name]=1;
    if(!r){P.push(w+'rasi "'+s.cons+'" tidak ada');return;}
    if(!/^\d+,\d+,\d+$/.test(s.rgb))P.push(w+'rgb harus "r,g,b"');
    if(!s.recap||!s.data||!s.fragment)P.push(w+'recap/data/fragment belum lengkap');
    if(!r.cluster){
      var c=geo[s.cons];
      if(!c||!c.stars[s.star])P.push(w+'bintang "'+s.star+'" tidak ada di GEOMETRY '+s.cons);
      else if(!c.lines.some(function(l){return l[0]===s.star||l[1]===s.star;}))P.push(w+'bintang tidak ada di lines (alignment mustahil)');
      if(s.star!==s.key)P.push(w+'id bintang di GEOMETRY harus sama dengan key ('+s.key+')');
    }
  });
  return P;
}

return {
  sectors:sectors,rasi:RASI,rasiBy:rasiBy,sfx:SFX,sfxBy:sfxBy,cons:GEOMETRY,consOff:consOff,bh:BH,
  TRIGGERS:D.TRIGGERS,STELLAR_KEYS:D.STELLAR_KEYS,STELLAR_LABELS:D.STELLAR_LABELS,STELLAR_CONS:D.STELLAR_CONS,
  CONS_LABELS:D.CONS_LABELS,CONS_STARS:D.CONS_STARS,SIGNAL_FRAGMENTS:D.SIGNAL_FRAGMENTS,LAST_SIGNAL_DATA:D.LAST_SIGNAL_DATA,
  STAR_DATA:D.STAR_DATA,SIGNAL_NAMES:D.SIGNAL_NAMES,FOCUS_WHISPER:D.FOCUS_WHISPER,FOCUS_INFO:D.FOCUS_INFO,
  TERM_DIST:D.TERM_DIST,UNLOCK_CONS:D.UNLOCK_CONS,STAR_KEY:D.STAR_KEY,FX_KEYS:D.FX_KEYS,
  focusOrder:focusOrder,panelGroups:panelGroups,audioFiles:audioFiles,check:check
};
})();
