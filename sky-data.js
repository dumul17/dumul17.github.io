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
     3. SEKTOR   : sector:'winter' | 'spring' | 'summer' | 'autumn' (4 sektor musim). Urutan record = urutan ikon;
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
  /* title = nama sektor; stars = rencana bintang SFX sektor ini (star-hopping).
     Yang belum ada di SFX array (Capella, Procyon, Regulus, Markab, Scheat, Algenib) = catatan saja. */
  {k:'winter', season:'Winter', name:'Winter', title:'The Pantheon of Radiant Heroes', a:-150, sky:{rgb:'110,185,255',a:.05,dim:.84,acc:{rgb:'225,95,190',a:.10,x:.26,y:.66,s:.40,sy:.70,rot:-.4}},
   stars:['Aldebaran','Betelgeuse','Capella','Pleione','Pollux','Procyon','Rigel','Sirius']},
  {k:'spring', season:'Spring', name:'Spring', title:'The Guardians of the Cosmic Balance', a:-30, sky:{rgb:'150,178,228',a:.20,dim:.30},
   stars:['Alioth','Arcturus','Regulus','Spica']},
  {k:'summer', season:'Summer', name:'Summer', title:'The Assembly of Celestial Beasts', a:150, sky:{rgb:'255,160,60',a:.20,dim:.45,acc:{rgb:'255,225,150',a:.26,x:.5,y:.55,s:.90,sy:.28,rot:-.5}},
   stars:['Altair','Deneb','Vega']},
  {k:'autumn', season:'Autumn', name:'Autumn', title:'The Royal Court of the Fallen Dynasty', a:30, sky:{rgb:'20,70,190',a:.22,dim:.55},
   stars:['Algenib','Alpheratz','Markab','Scheat']}
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
  {id:'gemini', sector:'winter', label:'Gemini', focusName:'Gemini', focus:3, dist:34, unlock:true,
   box:{portrait:function(W,top,ah,bot){return [W*.04,top+ah*.0,W*.30,top+ah*.2];}, land:function(W,top,ah,bot){return [W*.12,top+ah*.0,W*.30,top+ah*.3];}},
   scene:{k:.9, th:0, tx:-160, ty:-10},
   whisper:["Two brothers, one light. They never leave the winter sky.","Castor and Pollux still share the same story."],
   info:{"tag":"Constellation · The Twins","rows":[["Brightest","Pollux · mag 1.14"],["Castor","binary system"],["Distance","~34–52 ly"],["Area","514 sq°"]],"fact":"Pollux is an orange giant; Castor is a complex multiple-star system of six stars."}},
  /* ANCHOR — Capella saja sampai layout Auriga penuh */
  {id:'auriga', sector:'winter', label:'Auriga', focusName:'Auriga', focus:6, dist:43, unlock:true,
   box:{portrait:function(W,top,ah,bot){return [W*.72,top+ah*.02,W*.92,top+ah*.18];}, land:function(W,top,ah,bot){return [W*.55,top+ah*.02,W*.72,top+ah*.22];}},
   whisper:["Capella waits where the chariot will stand.","A single warm point — the rest of Auriga is still arriving."],
   info:{"tag":"Constellation · The Charioteer","rows":[["Brightest","Capella · mag 0.08"],["Distance","~43 ly"],["Type","G-type giant pair"],["Area","657 sq°"]],"fact":"Capella is the sixth-brightest star in the night sky and a cornerstone of the Winter Hexagon."}},
  /* ANCHOR — Procyon saja sampai layout Canis Minor penuh */
  {id:'canmin', sector:'winter', label:'Canis Minor', focusName:'Procyon', focus:7, dist:11, unlock:true,
   /* kanan-bawah winter — jauh dari Orion (tengah) & Capella (kanan-atas) */
   box:{portrait:function(W,top,ah,bot){return [W*.72,top+ah*.52,W*.92,top+ah*.68];}, land:function(W,top,ah,bot){return [W*.58,top+ah*.48,W*.76,top+ah*.66];}},
   whisper:["The little dog holds one lamp.","Procyon keeps the Winter Triangle until the outline is drawn."],
   info:{"tag":"Constellation · The Little Dog","rows":[["Brightest","Procyon · mag 0.34"],["Distance","~11.5 ly"],["Companion","white dwarf"],["Area","183 sq°"]],"fact":"Procyon means “before the dog” — it rises ahead of Sirius."}},
  {id:'virgo', sector:'spring', label:'Virgo', focusName:'Virgo', focus:2, dist:250, unlock:true,
   cap:{text:'Virgo', x:'right', dx:-42, y:'top', dy:-24},
   box:{portrait:function(W,top,ah,bot){return [W*.087,top+ah*.535,W*.432,top+ah*.721];}, land:function(W,top,ah,bot){return [W*.087,top+ah*.535,W*.432,top+ah*.721];}},
   whisper:["Spica burns quietly, like it knows something.","Spring sleeps here, folded in blue light."],
   info:{"tag":"Constellation · The Maiden","rows":[["Brightest","Spica · ~250 ly"],["Rank","2nd largest of 88"],["Cluster","Virgo · ~1,300 galaxies"],["Area","1,294 sq°"]],"fact":"Galaxy M87 hides here, home of the first black hole ever photographed."}},
  {id:'bootes', sector:'spring', label:'Boötes', focusName:'Boötes', focus:1, dist:37, unlock:true,
   box:{portrait:function(W,top,ah,bot){return [W*.087,top+ah*.338,W*.249,top+ah*.496];}, land:function(W,top,ah,bot){return [W*.087,top+ah*.338,W*.249,top+ah*.496];}},
   whisper:["The herdsman holds a lantern called Arcturus.","Amber light, older than the question."],
   info:{"tag":"Constellation · The Herdsman","rows":[["Brightest","Arcturus · ~37 ly"],["Type","Orange giant"],["Rank","4th brightest star"],["Area","907 sq°"]],"fact":"Nearby lies the Boötes Void, an emptiness about 330 million light-years wide."}},
  {id:'ursa', sector:'spring', label:'Ursa Major', focusName:'Ursa Major', focus:4, unlock:true, dist:83,
   box:{portrait:function(W,top,ah,bot){return [W*.7,top+ah*.24,W*.954,top+ah*.353];}, land:function(W,top,ah,bot){return [W*.7,top+ah*.24,W*.954,top+ah*.353];}},
   whisper:["The great bear keeps walking the northern sky.","Seven stars that taught us how to find north."],
   info:{"tag":"Constellation · The Great Bear","rows":[["Brightest","Alioth · mag 1.77"],["Asterism","Big Dipper"],["Distance","~83 ly"],["Area","1,280 sq°"]],"fact":"Alioth is the brightest star of the Big Dipper and helps point the way to Polaris."}},
  {id:'leo', sector:'spring', label:'Leo', focusName:'Leo', focus:3, unlock:true, dist:36,
   box:{portrait:function(W,top,ah,bot){return [W*.333,top+ah*.426,W*.587,top+ah*.515];}, land:function(W,top,ah,bot){return [W*.333,top+ah*.426,W*.587,top+ah*.515];}},
   whisper:["The lion’s mane is made of spring light.","Denebola marks the tip of the tail."],
   info:{"tag":"Constellation · The Lion","rows":[["Brightest","Regulus · mag 1.40"],["Denebola","tail tip · mag 2.14"],["Distance","~36 ly"],["Area","947 sq°"]],"fact":"The Spring Triangle uses Denebola as one of its corners with Arcturus and Spica."}},
  {id:'hydra', sector:'spring', label:'Hydra', focusName:'Hydra', focus:5, unlock:true, dist:177,
   box:{portrait:function(W,top,ah,bot){return [W*.453,top+ah*.526,W*.94,top+ah*.754];}, land:function(W,top,ah,bot){return [W*.453,top+ah*.526,W*.94,top+ah*.754];}},
   whisper:["The longest constellation still crawls across the south.","Alphard is the lonely heart of the serpent."],
   info:{"tag":"Constellation · The Water Snake","rows":[["Brightest","Alphard · mag 1.98"],["Length","longest of 88"],["Distance","~177 ly"],["Area","1,303 sq°"]],"fact":"Hydra is the largest constellation by area, stretching far across the southern spring sky."}},
  {id:'scorpius', sector:'summer', label:'Scorpius', focusName:'Antares', focus:4, unlock:true, dist:550,
   box:{portrait:function(W,top,ah,bot){return [W*.576,top+ah*.608,W*.954,top+ah*.815];}, land:function(W,top,ah,bot){return [W*.576,top+ah*.608,W*.954,top+ah*.815];}},
   whisper:["Antares glows red, a heart that never settled.","The scorpion waits where the summer sky is thickest."],
   info:{"tag":"Constellation · The Scorpion","rows":[["Brightest","Antares · ~550 ly"],["Type","Red supergiant"],["Size","~700× the Sun"],["Area","497 sq°"]],"fact":"Antares means “rival of Mars”, named for its matching red glow."}},
  {id:'sagit', sector:'summer', label:'Sagittarius', focusName:'Sagittarius', focus:6, unlock:true, dist:228,
   box:{portrait:function(W,top,ah,bot){return [W*.269,top+ah*.622,W*.556,top+ah*.762];}, land:function(W,top,ah,bot){return [W*.269,top+ah*.622,W*.556,top+ah*.762];}},
   whisper:["The archer aims toward the centre of the galaxy.","Nunki keeps the teapot steady."],
   info:{"tag":"Constellation · The Archer","rows":[["Brightest","Nunki · mag 2.05"],["Galactic centre","hidden here"],["Distance","~228 ly"],["Area","867 sq°"]],"fact":"Looking at Sagittarius is looking toward the heart of the Milky Way."}},
  {id:'lyra', sector:'summer', label:'Lyra', focusName:'Lyra', focus:1, dist:25, unlock:true,
   box:{portrait:function(W,top,ah,bot){return [W*.808,top+ah*.211,W*.954,top+ah*.328];}, land:function(W,top,ah,bot){return [W*.808,top+ah*.211,W*.954,top+ah*.328];}},
   whisper:["Vega is the harp string that never snaps.","Summer begins when this light returns."],
   info:{"tag":"Constellation · The Lyre","rows":[["Brightest","Vega · mag 0.03"],["Distance","25 ly"],["Rank","5th brightest star"],["Area","286 sq°"]],"fact":"Vega was the northern pole star around 12,000 BCE and will be again in about 12,000 years."}},
  {id:'cygnus', sector:'summer', label:'Cygnus', focusName:'Cygnus', focus:3, dist:2615, unlock:true,
   box:{portrait:function(W,top,ah,bot){return [W*.453,top+ah*.153,W*.788,top+ah*.307];}, land:function(W,top,ah,bot){return [W*.453,top+ah*.153,W*.788,top+ah*.307];}},
   whisper:["The swan flies along the Milky Way.","Deneb is a distant lighthouse still arriving."],
   info:{"tag":"Constellation · The Swan","rows":[["Brightest","Deneb · mag 1.25"],["Distance","~2,600 ly"],["Type","Blue-white supergiant"],["Area","804 sq°"]],"fact":"Deneb is one of the most luminous stars known; its light left when the Bronze Age was ending."}},
  {id:'ophiuchus', sector:'summer', label:'Ophiuchus', focusName:'Ophiuchus', focus:5, unlock:true, dist:49,
   box:{portrait:function(W,top,ah,bot){return [W*.311,top+ah*.416,W*.718,top+ah*.597];}, land:function(W,top,ah,bot){return [W*.311,top+ah*.416,W*.718,top+ah*.597];}},
   whisper:["The serpent-bearer stands between the seasons.","Rasalhague watches from the north edge."],
   info:{"tag":"Constellation · The Serpent Bearer","rows":[["Brightest","Rasalhague · mag 2.07"],["Distance","~49 ly"],["Zodiac","13th constellation"],["Area","948 sq°"]],"fact":"Ophiuchus is the forgotten thirteenth zodiacal constellation the Sun still crosses."}},
  {id:'aquila', sector:'summer', label:'Aquila', focusName:'Aquila', focus:2, dist:17, unlock:true,
   box:{portrait:function(W,top,ah,bot){return [W*.087,top+ah*.405,W*.291,top+ah*.535];}, land:function(W,top,ah,bot){return [W*.087,top+ah*.405,W*.291,top+ah*.535];}},
   whisper:["The eagle carries Altair across the summer triangle.","Three stars in a line mark the flight."],
   info:{"tag":"Constellation · The Eagle","rows":[["Brightest","Altair · mag 0.76"],["Distance","16.7 ly"],["Type","A7 V"],["Area","652 sq°"]],"fact":"Altair is one of the closest naked-eye stars and rotates so fast it is flattened at the poles."}},
  {id:'cassiopeia', sector:'autumn', label:'Cassiopeia', focusName:'Cassiopeia', focus:2, unlock:true, dist:228,
   box:{portrait:function(W,top,ah,bot){return [W*.468,top+ah*.137,W*.823,top+ah*.214];}, land:function(W,top,ah,bot){return [W*.468,top+ah*.137,W*.823,top+ah*.214];}},
   whisper:["The queen still sits on her crooked throne.","W or M — it depends on how the night turns."],
   info:{"tag":"Constellation · The Queen","rows":[["Brightest","Schedar · mag 2.24"],["Shape","W / M"],["Distance","~228 ly"],["Area","598 sq°"]],"fact":"Cassiopeia never sets for northern observers and is one of the easiest patterns to recognise."}},
  {id:'perseus', sector:'autumn', label:'Perseus', focusName:'Perseus', focus:3, unlock:true, dist:92,
   box:{portrait:function(W,top,ah,bot){return [W*.087,top+ah*.212,W*.372,top+ah*.476];}, land:function(W,top,ah,bot){return [W*.087,top+ah*.212,W*.372,top+ah*.476];}},
   whisper:["The hero still carries Medusa’s eye.","Algol winks every two days and twenty hours."],
   info:{"tag":"Constellation · The Hero","rows":[["Brightest","Mirfak · mag 1.79"],["Algol","variable · mag 2.1–3.4"],["Distance","~92 ly"],["Area","615 sq°"]],"fact":"Algol is an eclipsing binary; its brightness drops when the dimmer star passes in front."}},
  {id:'aries', sector:'autumn', label:'Aries', focusName:'Aries', focus:4, unlock:true, dist:66,
   box:{portrait:function(W,top,ah,bot){return [W*.097,top+ah*.572,W*.224,top+ah*.716];}, land:function(W,top,ah,bot){return [W*.097,top+ah*.572,W*.224,top+ah*.716];}},
   whisper:["The ram’s head is quiet now.","Hamal still points the way into autumn."],
   info:{"tag":"Constellation · The Ram","rows":[["Brightest","Hamal · mag 2.00"],["Distance","~66 ly"],["Type","K2 III"],["Area","441 sq°"]],"fact":"Aries once marked the vernal equinox; precession has since moved that point into Pisces."}},
  {id:'pegasus', sector:'autumn', label:'Pegasus', focusName:'Pegasus', focus:1, dist:97, unlock:true,
   box:{portrait:function(W,top,ah,bot){return [W*.467,top+ah*.425,W*.954,top+ah*.622];}, land:function(W,top,ah,bot){return [W*.467,top+ah*.425,W*.954,top+ah*.622];}},
   whisper:["The Great Square is the autumn door.","Alpheratz holds the corner that belongs to two stories."],
   info:{"tag":"Constellation · The Winged Horse","rows":[["Brightest","Enif · mag 2.38"],["Alpheratz","shared with Andromeda"],["Distance","~97 ly"],["Area","1,121 sq°"]],"fact":"The Great Square of Pegasus is one of the most useful asterisms for finding autumn constellations."}},
  {id:'pisces', sector:'autumn', label:'Pisces', focusName:'Pisces', focus:5, unlock:true, dist:294,
   box:{portrait:function(W,top,ah,bot){return [W*.416,top+ah*.633,W*.752,top+ah*.897];}, land:function(W,top,ah,bot){return [W*.416,top+ah*.633,W*.752,top+ah*.897];}},
   whisper:["Two fish tied by a cord of faint stars.","Alpherg marks the knot that holds them."],
   info:{"tag":"Constellation · The Fishes","rows":[["Brightest","Alpherg · mag 3.61"],["Distance","~350 ly"],["Zodiac","current equinox"],["Area","889 sq°"]],"fact":"The vernal equinox now lies in Pisces, having drifted from Aries due to precession."}}
];


/* Lubang hitam (Gargantua) bukan rasi, tapi punya bisikan + kartu info kamera. */
var BH={
  whisper:["Everything here is a question that never got answered.","Even light stops to think about it."],
  info:{"tag":"Supermassive black hole · Fiction","rgb":"255,170,90","rows":[["Source","Interstellar (2014)"],["Mass","~100 million suns"],["Horizon","~1 AU across"],["Spin","Near-maximal (Kerr)"]],"fact":"One hour near Miller’s planet equals about seven years back on Earth."}
};

/* ---------- 3. BINTANG SFX (urutan = urutan di panel musik; dikelompokkan per sektor) ---------- */
var SFX=[
  /* ================================================================
     SFX = bintang star-hopping saja (lihat katalog).
     Winter Hexagon / Triangle · Spring Triangle (Regulus) · Summer Triangle · Great Square
     + Pleione (khusus, bukan rasi).
     Bintang hopping yang rasi/GEOMETRY-nya belum ada → CATATAN di bawah, belum masuk array.
     ================================================================ */

  /* ---- WINTER (A-Z) : Hexagon + Triangle + Pleione ---- */
  {key:'aldebaran', label:'Aldebaran', cons:'taurus', star:'aldebaran', rgb:'255,160,90',
   recap:{"name":"ALDEBARAN","spec":"K5 III","dist":"65 LY"},
   data:{"name":"ALDEBARAN","dist":"65 LY","spec":"K5III","mag":"0.85","ra":"04h 35m","dec":"+16°30′"},
   fragment:{"tag":"FRAGMENT // ALDEBARAN","title":"Follower · Bull’s Eye","body":"Orange watchman of Taurus. It trails the Pleiades across the night — patient, warm, always one step behind the sisters.","meta":["RA 04h 35m","DEC +16° 30′","SPEC K5 III","LINK · Winter Hexagon"]}},
  {key:'betel', label:'Betelgeuse', cons:'orion', star:'betel', rgb:'255,72,64',
   recap:{"name":"BETELGEUSE","spec":"M1-2 Ia","dist":"640 LY"},
   data:{"name":"BETELGEUSE","dist":"642 LY","spec":"M1-M2Ia","mag":"0.50","ra":"05h 55m","dec":"+07°24′"},
   fragment:{"tag":"FRAGMENT // BETELGEUSE","title":"Red Giant · Imminent","body":"A dying sun that still sings. The pulse you hear is collapse delayed — beauty measured in centuries of afterglow.","meta":["RA 05h 55m","DEC +07° 24′","SPEC M1-2 Ia","LINK · Winter Triangle"]}},
  {key:'capella', label:'Capella', cons:'auriga', star:'capella', rgb:'255,200,120',
   recap:{"name":"CAPELLA","spec":"G3 III","dist":"43 LY"},
   data:{"name":"CAPELLA","dist":"43 LY","spec":"G3III","mag":"0.08","ra":"05h 16m","dec":"+45°59′"},
   fragment:{"tag":"FRAGMENT // CAPELLA","title":"Goat Star · Hexagon","body":"The bright shepherd of Auriga. A warm double giant on the Winter Hexagon — anchor light until the full chariot arrives.","meta":["RA 05h 16m","DEC +45° 59′","SPEC G3 III","LINK · Winter Hexagon"]}},
  {key:'pleione', label:'Pleione', cons:'pleiades', star:'Pleione', rgb:'145,170,255',
   recap:{"name":"PLEIONE","spec":"B8 Vne","dist":"440 LY"},
   data:{"name":"PLEIONE","dist":"380 LY","spec":"B8ne","mag":"5.05","ra":"03h 49m","dec":"+24°08′"},
   fragment:{"tag":"FRAGMENT // PLEIONE","title":"Seven Sisters · Edge","body":"A soft cluster voice near Atlas. Not the brightest, but the one that answers when you lean closer to the glass.","meta":["RA 03h 49m","DEC +24° 08′","SPEC B8 Vne","LINK · Pleiades"]}},
  {key:'g9', label:'Pollux', cons:'gemini', star:'g9', rgb:'255,170,100',
   recap:{"name":"POLLUX","spec":"K0 III","dist":"34 LY"},
   data:{"name":"POLLUX","dist":"34 LY","spec":"K0III","mag":"1.14","ra":"07h 45m","dec":"+28°01′"},
   fragment:{"tag":"FRAGMENT // POLLUX","title":"Twin · Hexagon Start","body":"The brighter twin and the starting corner of the Winter Hexagon. Orange giant that anchors the cold path.","meta":["RA 07h 45m","DEC +28° 01′","SPEC K0 III","LINK · Winter Hexagon"]}},
  {key:'procyon', label:'Procyon', cons:'canmin', star:'procyon', rgb:'220,230,255',
   recap:{"name":"PROCYON","spec":"F5 IV-V","dist":"11 LY"},
   data:{"name":"PROCYON","dist":"11.5 LY","spec":"F5IV-V","mag":"0.34","ra":"07h 39m","dec":"+05°13′"},
   fragment:{"tag":"FRAGMENT // PROCYON","title":"Before the Dog · Triangle","body":"The little dog’s lantern. Close, quick, and one corner of the Winter Triangle — waiting for Canis Minor’s full shape.","meta":["RA 07h 39m","DEC +05° 13′","SPEC F5 IV-V","LINK · Winter Triangle"]}},
  {key:'rigel', label:'Rigel', cons:'orion', star:'rigel', rgb:'74,165,255',
   recap:{"name":"RIGEL","spec":"B8 Ia","dist":"860 LY"},
   data:{"name":"RIGEL","dist":"860 LY","spec":"B8Ia","mag":"0.13","ra":"05h 14m","dec":"-08°12′"},
   fragment:{"tag":"FRAGMENT // RIGEL","title":"Blue Supergiant · Anchor","body":"The foot of the hunter. Cold light, deep bass — a signal that arrives after the story has already moved on.","meta":["RA 05h 14m","DEC −08° 12′","SPEC B8 Ia","LINK · Winter Hexagon"]}},
  {key:'sirius', label:'Sirius', cons:'canis', star:'sirius', rgb:'180,220,255',
   recap:{"name":"SIRIUS","spec":"A1 V","dist":"8.6 LY"},
   data:{"name":"SIRIUS","dist":"8.6 LY","spec":"A1V","mag":"-1.46","ra":"06h 45m","dec":"-16°42′"},
   fragment:{"tag":"FRAGMENT // SIRIUS","title":"Dog Star · Brightest","body":"Nearest of the great ones. Sharp, white, impossible to ignore — the observatory’s first hello from the winter sky.","meta":["RA 06h 45m","DEC −16° 42′","SPEC A1 V","LINK · Winter Hexagon / Triangle"]}},

  /* ---- SPRING (A-Z) : Spring Triangle (Arcturus · Spica · Regulus) ---- */
  {key:'alioth', label:'Alioth', cons:'ursa', star:'alioth', rgb:'200,210,255',
   recap:{"name":"ALIOTH","spec":"A0pCr","dist":"83 LY"},
   data:{"name":"ALIOTH","dist":"83 LY","spec":"A0pCr","mag":"1.77","ra":"12h 54m","dec":"+55°57′"},
   fragment:{"tag":"FRAGMENT // ALIOTH","title":"Bear · Dipper Brightest","body":"The brightest light of the Great Bear. A steady point on the handle — the one that taught navigators where north still waits.","meta":["RA 12h 54m","DEC +55° 57′","SPEC A0pCr","LINK · Big Dipper / Spring"]}},
  {key:'arcturus', label:'Arcturus', cons:'bootes', star:'arcturus', rgb:'255,180,80',
   recap:{"name":"ARCTURUS","spec":"K1.5 III","dist":"37 LY"},
   data:{"name":"ARCTURUS","dist":"36.7 LY","spec":"K1.5III","mag":"-0.05","ra":"14h 15m","dec":"+19°10′"},
   fragment:{"tag":"FRAGMENT // ARCTURUS","title":"Bear Guardian · Arc","body":"The golden tip of Boötes. Follow the arc of the Dipper’s handle and you arrive here — then spike to Spica.","meta":["RA 14h 15m","DEC +19° 10′","SPEC K1.5 III","LINK · Spring Triangle / Arc to Spica"]}},
  {key:'regulus', label:'Regulus', cons:'leo', star:'regulus', rgb:'180,210,255',
   recap:{"name":"REGULUS","spec":"B7 V","dist":"79 LY"},
   data:{"name":"REGULUS","dist":"79 LY","spec":"B7V","mag":"1.40","ra":"10h 08m","dec":"+11°58′"},
   fragment:{"tag":"FRAGMENT // REGULUS","title":"Heart of the Lion · Spring","body":"The sickle’s point and the heart of Leo. One corner of the Spring Triangle — blue-white, steady, royal.","meta":["RA 10h 08m","DEC +11° 58′","SPEC B7 V","LINK · Spring Triangle"]}},
  {key:'spica', label:'Spica', cons:'virgo', star:'spica', rgb:'140,200,255', fx:false,
   recap:{"name":"SPICA","spec":"B1 III-IV","dist":"250 LY"},
   data:{"name":"SPICA","dist":"250 LY","spec":"B1III","mag":"0.98","ra":"13h 25m","dec":"-11°10′"},
   fragment:{"tag":"FRAGMENT // SPICA","title":"Binary Spike · Harvest","body":"Two stars locked in a brief, bright orbit. The earthen spike of Virgo — the end of the arc from Arcturus.","meta":["RA 13h 25m","DEC −11° 09′","SPEC B1 III-IV","LINK · Spring Triangle / Arc to Spica"]}},

  /* ---- SUMMER (A-Z) : Summer Triangle ---- */
  {key:'aq2', label:'Altair', cons:'aquila', star:'aq2', rgb:'200,220,255',
   recap:{"name":"ALTAIR","spec":"A7 V","dist":"17 LY"},
   data:{"name":"ALTAIR","dist":"16.7 LY","spec":"A7V","mag":"0.76","ra":"19h 50m","dec":"+08°52′"},
   fragment:{"tag":"FRAGMENT // ALTAIR","title":"Eagle · Fast Spinner","body":"One corner of the Summer Triangle. Close, bright, and spinning so fast it is flattened at the poles.","meta":["RA 19h 50m","DEC +08° 52′","SPEC A7 V","LINK · Summer Triangle"]}},
  {key:'c1', label:'Deneb', cons:'cygnus', star:'c1', rgb:'150,190,255',
   recap:{"name":"DENEB","spec":"A2 Ia","dist":"2600 LY"},
   data:{"name":"DENEB","dist":"2615 LY","spec":"A2Ia","mag":"1.25","ra":"20h 41m","dec":"+45°16′"},
   fragment:{"tag":"FRAGMENT // DENEB","title":"Swan Tail · Distant","body":"The far corner of the Summer Triangle. Light that left when civilisations were still learning to write.","meta":["RA 20h 41m","DEC +45° 16′","SPEC A2 Ia","LINK · Summer Triangle"]}},
  {key:'y2', label:'Vega', cons:'lyra', star:'y2', rgb:'180,210,255',
   recap:{"name":"VEGA","spec":"A0 V","dist":"25 LY"},
   data:{"name":"VEGA","dist":"25 LY","spec":"A0V","mag":"0.03","ra":"18h 36m","dec":"+38°47′"},
   fragment:{"tag":"FRAGMENT // VEGA","title":"Lyre · Pole Once","body":"The harp string of summer. Once the pole star, and destined to be again — the brightest corner of the Summer Triangle.","meta":["RA 18h 36m","DEC +38° 47′","SPEC A0 V","LINK · Summer Triangle"]}},

  /* ---- AUTUMN (A-Z) : Great Square of Pegasus ---- */
  {key:'pg1', label:'Alpheratz', cons:'pegasus', star:'pg1', rgb:'170,190,255',
   recap:{"name":"ALPHERATZ","spec":"B8 IVp","dist":"97 LY"},
   data:{"name":"ALPHERATZ","dist":"97 LY","spec":"B8IV","mag":"2.06","ra":"00h 08m","dec":"+29°05′"},
   fragment:{"tag":"FRAGMENT // ALPHERATZ","title":"Square Corner · Shared","body":"The north-east corner of the Great Square. Officially Andromeda’s, still claimed by Pegasus — the autumn door.","meta":["RA 00h 08m","DEC +29° 05′","SPEC B8 IV","LINK · Great Square"]}}

  /* ----------------------------------------------------------------
     CATATAN — bintang star-hopping yang BELUM bisa masuk SFX
     (rasi / GEOMETRY penuh belum siap). Capella & Procyon = ANCHOR
     (rasi minimal 2 titik) sampai layout Auriga / Canis Minor masuk.

     AUTUMN (sisa Great Square)
       Markab   (α Peg)             — titik ada di GEOMETRY pegasus, belum di-name
       Scheat   (β Peg)             — titik ada di GEOMETRY pegasus, belum di-name
       Algenib  (γ Peg)             — titik ada di GEOMETRY pegasus, belum di-name
     ---------------------------------------------------------------- */
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
  lines:[["g1","g3"],["g2","g3"],["g3","g6"],["g6","g7"],["g7","g5"],["g5","g4"],["g6","g11"],["g3","g8"],["g8","g10"],["g9","g10"],["g10","g12"],["g10","g14"],["g14","g13"],["g13","g15"],["g14","g16"],["g16","g17"]]},
 /* Ursa Major / Big Dipper: 18 titik dari bigdipper-ursa-major.html
    (viewBox 612×424, scale ×1000/612). UI NONAKTIF (RASI off:true). Bintang utama: Alioth. */
 {id:'ursa',ra0:0,delay:1.2,phase:1.0,
  stars:{
   u1:{fx:546,fy:116,r:3.2,c:'#eaf6ff'},
   u2:{fx:634,fy:152,r:3.0,c:'#eaf6ff'},
   u3:{fx:541,fy:173,r:3.1,c:'#eaf6ff'},
   u4:{fx:418,fy:221,r:3.3,c:'#eaf6ff'},
   u5:{fx:531,fy:230,r:2.6,c:'#dcefff'},
   u6:{fx:183,fy:257,r:3.0,c:'#eaf6ff'},
   alioth:{fx:237,fy:265,r:3.6,c:'#ffe9a0',name:'Alioth',nx:-1,dy:-9},
   u8:{fx:306,fy:266,r:3.0,c:'#eaf6ff'},
   u9:{fx:428,fy:286,r:2.5,c:'#dcefff'},
   u10:{fx:547,fy:291,r:2.6,c:'#dcefff'},
   u11:{fx:116,fy:297,r:3.2,c:'#eaf6ff'},
   u12:{fx:592,fy:304,r:2.4,c:'#dcefff'},
   u13:{fx:335,fy:315,r:3.0,c:'#eaf6ff'},
   u14:{fx:670,fy:328,r:2.5,c:'#dcefff'},
   u15:{fx:343,fy:391,r:2.6,c:'#dcefff'},
   u16:{fx:415,fy:430,r:2.9,c:'#eaf6ff'},
   u17:{fx:525,fy:454,r:2.7,c:'#dcefff'},
   u18:{fx:400,fy:572,r:2.6,c:'#dcefff'}
  },
  lines:[
   /* handle kiri (Alkaid side): 11→6→7→8 */
   ["u11","u6"],["u6","alioth"],["alioth","u8"],
   /* bowl / badan: 8→4→3→1→2→3 */
   ["u8","u4"],["u4","u3"],["u3","u1"],["u1","u2"],["u2","u3"],
   /* inner bowl: 3→5→10→12→14 */
   ["u3","u5"],["u5","u10"],["u10","u12"],["u12","u14"],
   /* cross body: 4→9→13, 8→13, 9→5 */
   ["u4","u9"],["u9","u13"],["u8","u13"],["u9","u5"],
   /* legs: 13→15→16→17, 15→18 */
   ["u13","u15"],["u15","u16"],["u16","u17"],["u15","u18"]
  ]},
 /* Leo: 9 titik dari leo-constellation.html (viewBox 581×612 → scale ×1000/581).
    UI NONAKTIF (RASI off:true). Bintang utama nanti: Denebola (l5 — ekor/kiri badan). */
 {id:'leo',ra0:0,delay:1.3,phase:1.1,
  stars:{
   l1:{fx:774,fy:167,r:3.4,c:'#eaf6ff'},
   l2:{fx:833,fy:208,r:2.7,c:'#dcefff'},
   l3:{fx:656,fy:267,r:2.9,c:'#eaf6ff'},
   /* l4 = Algieba (junction sickle/badan) — BUKAN Regulus */
   l4:{fx:662,fy:368,r:3.3,c:'#eaf6ff',name:'Algieba',nx:-1,dy:-8},
   l5:{fx:336,fy:425,r:3.2,c:'#eaf6ff',name:'Denebola',nx:-1,dy:-9},
   l6:{fx:762,fy:425,r:2.8,c:'#dcefff'},
   /* Regulus = ujung BAWAH sickle / batang kanan (α Leo), sesuai diagram */
   regulus:{fx:790,fy:544,r:4.0,c:'#ffe9a0',name:'Regulus',nx:1,dy:10},
   l8:{fx:358,fy:556,r:2.9,c:'#dcefff'},
   l9:{fx:145,fy:613,r:3.5,c:'#eaf6ff'}
  },
  lines:[
   /* sickle / kepala → Algieba */
   ["l1","l2"],["l1","l3"],["l3","l4"],
   /* badan + batang kanan turun ke Regulus */
   ["l4","l5"],["l4","l6"],["l6","regulus"],
   /* kaki / base */
   ["l5","l9"],["l9","l8"],["l8","regulus"]
  ]},
 /* Hydra: 16 titik dari hydra.html (viewBox 581×612 → ×1000/581).
    UI NONAKTIF (off). Bintang utama nanti: Alphard (h9). */
 {id:'hydra',ra0:0,delay:1.4,phase:1.2,
  stars:{
   h1:{fx:139,fy:763,r:2.6,c:'#dcefff'},
   h2:{fx:234,fy:668,r:3.3,c:'#eaf6ff'},
   h3:{fx:478,fy:690,r:2.6,c:'#dcefff'},
   h4:{fx:514,fy:655,r:2.6,c:'#dcefff'},
   h5:{fx:567,fy:463,r:3.6,c:'#eaf6ff'},
   h6:{fx:629,fy:453,r:2.8,c:'#eaf6ff'},
   h7:{fx:655,fy:397,r:2.8,c:'#eaf6ff'},
   h8:{fx:708,fy:413,r:2.8,c:'#eaf6ff'},
   h9:{fx:755,fy:334,r:4.0,c:'#ffe9a0',name:'Alphard',nx:-1,dy:-10},
   h10:{fx:706,fy:262,r:2.0,c:'#dcefff'},
   h11:{fx:766,fy:210,r:2.6,c:'#eaf6ff'},
   /* head cluster */
   h12:{fx:807,fy:151,r:3.0,c:'#eaf6ff'},
   h13:{fx:831,fy:139,r:2.4,c:'#dcefff'},
   h14:{fx:858,fy:142,r:2.4,c:'#dcefff'},
   h15:{fx:847,fy:170,r:2.0,c:'#dcefff'},
   h16:{fx:862,fy:170,r:2.2,c:'#dcefff'}
  },
  lines:[
   /* body chain → head */
   ["h1","h2"],["h2","h3"],["h3","h4"],["h4","h5"],["h5","h6"],["h6","h7"],
   ["h7","h8"],["h8","h9"],["h9","h10"],["h10","h11"],["h11","h12"],
   /* head loop */
   ["h12","h13"],["h13","h14"],["h14","h16"],["h16","h15"],["h15","h12"],
   ["h13","h15"],["h14","h15"]
  ]},
 /* Sagittarius: 21 titik dari sagittarius.html (viewBox 860×860 → ×1000/860).
    UI NONAKTIF (off). Bintang utama nanti: Nunki (s14). Teapot + bow. */
 {id:'sagit',ra0:0,delay:1.5,phase:1.3,
  stars:{
   s1:{fx:314,fy:116,r:2.8,c:'#eaf6ff'},
   s2:{fx:343,fy:147,r:2.5,c:'#dcefff'},
   s3:{fx:479,fy:202,r:2.8,c:'#eaf6ff'},
   s4:{fx:772,fy:205,r:2.8,c:'#eaf6ff'},
   s5:{fx:433,fy:221,r:2.8,c:'#eaf6ff'},
   s6:{fx:235,fy:320,r:2.8,c:'#eaf6ff'},
   s7:{fx:673,fy:326,r:2.8,c:'#eaf6ff'},
   s8:{fx:498,fy:349,r:3.4,c:'#eaf6ff'},
   s9:{fx:558,fy:367,r:2.8,c:'#eaf6ff'},
   s10:{fx:427,fy:391,r:2.8,c:'#eaf6ff'},
   s11:{fx:926,fy:416,r:2.5,c:'#dcefff'},
   s12:{fx:76,fy:427,r:2.8,c:'#eaf6ff'},
   s13:{fx:455,fy:451,r:3.1,c:'#eaf6ff'},
   s14:{fx:710,fy:453,r:3.5,c:'#ffe9a0',name:'Nunki',nx:1,dy:-10},
   s15:{fx:803,fy:478,r:2.8,c:'#eaf6ff'},
   s16:{fx:684,fy:583,r:4.0,c:'#eaf6ff'},
   s17:{fx:129,fy:637,r:2.8,c:'#eaf6ff'},
   s18:{fx:717,fy:652,r:2.8,c:'#eaf6ff'},
   s19:{fx:349,fy:763,r:2.8,c:'#eaf6ff'},
   s20:{fx:184,fy:819,r:2.8,c:'#eaf6ff'},
   s21:{fx:363,fy:883,r:2.8,c:'#eaf6ff'}
  },
  lines:[
   /* upper */
   ["s1","s2"],["s2","s5"],["s5","s3"],["s3","s8"],
   /* polis branch */
   ["s4","s7"],["s7","s9"],["s7","s14"],
   /* teapot core */
   ["s8","s9"],["s8","s10"],["s9","s13"],["s10","s13"],["s9","s14"],
   /* right arm */
   ["s14","s15"],["s15","s11"],["s15","s16"],["s14","s16"],["s13","s16"],["s16","s18"],
   /* left arm / bow */
   ["s10","s6"],["s6","s12"],["s12","s17"],
   /* bottom left */
   ["s17","s20"],["s19","s20"],["s20","s21"],["s19","s21"]
  ]},
 /* Lyra: 6 titik dari lyra.html (viewBox 540×360 → ×1000/540). off. Utama: Vega. */
 {id:'lyra',ra0:0,delay:1.1,phase:0.9,
  stars:{
   y1:{fx:552,fy:150,r:2.6,c:'#eaf6ff'},
   y2:{fx:617,fy:176,r:4.2,c:'#ffe9a0',name:'Vega',nx:1,dy:-10},
   y3:{fx:546,fy:237,r:2.9,c:'#eaf6ff'},
   y4:{fx:431,fy:276,r:2.6,c:'#dcefff'},
   y5:{fx:494,fy:481,r:3.1,c:'#eaf6ff'},
   y6:{fx:370,fy:515,r:2.9,c:'#eaf6ff'}
  },
  lines:[
   ["y1","y2"],["y2","y3"],["y1","y3"],
   ["y3","y4"],["y4","y6"],["y6","y5"],["y5","y3"]
  ]},
 /* Cygnus: 10 titik dari cygnus.html (viewBox 860×860 → ×1000/860). off. Utama: Deneb. Northern Cross. */
 {id:'cygnus',ra0:0,delay:1.2,phase:1.0,
  stars:{
   c1:{fx:530,fy:330,r:4.5,c:'#ffe9a0',name:'Deneb',nx:1,dy:-12},
   c2:{fx:924,fy:130,r:2.6,c:'#dcefff'},
   c3:{fx:876,fy:180,r:2.8,c:'#eaf6ff'},
   c4:{fx:806,fy:365,r:3.1,c:'#eaf6ff'},
   c5:{fx:610,fy:472,r:3.4,c:'#eaf6ff'},
   c6:{fx:451,fy:652,r:3.2,c:'#eaf6ff'},
   c7:{fx:740,fy:653,r:2.9,c:'#eaf6ff'},
   c8:{fx:72,fy:714,r:2.6,c:'#dcefff'},
   c9:{fx:272,fy:723,r:2.9,c:'#eaf6ff'},
   c10:{fx:895,fy:853,r:3.4,c:'#eaf6ff'}
  },
  lines:[
   /* neck / upper wing */
   ["c2","c3"],["c3","c4"],["c4","c5"],
   /* shaft Deneb → center → tip */
   ["c1","c5"],["c5","c10"],
   /* left wing */
   ["c5","c6"],["c6","c9"],["c9","c8"],
   /* right lower */
   ["c5","c7"]
  ]},
 /* Ophiuchus: 21 titik dari ophiuchus-1.html (viewBox 540×360 → ×1000/540). UI NONAKTIF (off). Bintang utama nanti: Rasalhague (o4). Nomor kunci = nomor di HTML (11 & 21 memang tidak ada; o7 duduk di tengah garis o5→o10 yang di HTML digambar satu garis panjang, jadi di data dipecah o5→o7→o10; total 24 garis vs 23 di HTML, bentuk di layar identik). */
 {id:'ophiuchus',ra0:0,delay:1.3,phase:1.1,
  stars:{
   o22:{fx:756,fy:85,r:2.0,c:'#dcefff'},
   o23:{fx:704,fy:128,r:2.0,c:'#dcefff'},
   o1:{fx:756,fy:131,r:2.2,c:'#dcefff'},
   o2:{fx:789,fy:183,r:2.2,c:'#dcefff'},
   o3:{fx:757,fy:230,r:2.4,c:'#eaf6ff'},
   o4:{fx:415,fy:141,r:3.3,c:'#ffe9a0',name:'Rasalhague',nx:-1,dy:-10},
   o5:{fx:526,fy:194,r:2.4,c:'#eaf6ff'},
   o6:{fx:374,fy:241,r:3.4,c:'#eaf6ff'},
   o7:{fx:622,fy:285,r:2.3,c:'#eaf6ff'},
   o8:{fx:185,fy:309,r:2.6,c:'#eaf6ff'},
   o9:{fx:754,fy:319,r:2.2,c:'#eaf6ff'},
   o10:{fx:672,fy:333,r:3.5,c:'#eaf6ff'},
   o12:{fx:307,fy:385,r:2.4,c:'#eaf6ff'},
   o13:{fx:598,fy:431,r:3.3,c:'#eaf6ff'},
   o14:{fx:378,fy:450,r:2.4,c:'#eaf6ff'},
   o15:{fx:494,fy:456,r:2.2,c:'#eaf6ff'},
   o16:{fx:424,fy:476,r:2.2,c:'#dcefff'},
   o17:{fx:513,fy:485,r:3.7,c:'#eaf6ff'},
   o18:{fx:624,fy:494,r:2.6,c:'#eaf6ff'},
   o19:{fx:656,fy:533,r:2.2,c:'#eaf6ff'},
   o20:{fx:515,fy:580,r:2.9,c:'#eaf6ff'}
  },
  lines:[
   ["o22","o1"],["o1","o2"],["o2","o3"],["o22","o23"],
   ["o23","o1"],["o4","o5"],["o5","o7"],["o7","o10"],["o4","o6"],
   ["o5","o13"],["o8","o12"],["o6","o14"],["o17","o20"],
   ["o12","o14"],["o6","o15"],["o15","o17"],["o14","o16"],
   ["o16","o17"],["o10","o13"],["o10","o9"],["o9","o3"],
   ["o13","o18"],["o13","o17"],["o18","o19"]
  ]},
 /* Cassiopeia: 5 titik dari Cassiopeia.html (viewBox 540×360 → ×1000/540). UI NONAKTIF (off). Bintang utama nanti: Schedar (k4; di HTML ditulis "Shedar"). Bentuk W. */
 {id:'cassiopeia',ra0:0,delay:1.0,phase:.7,
  stars:{
   k1:{fx:222,fy:204,r:2.7,c:'#eaf6ff'},
   k2:{fx:361,fy:361,r:2.6,c:'#eaf6ff'},
   k3:{fx:500,fy:287,r:2.9,c:'#eaf6ff'},
   k4:{fx:630,fy:426,r:3.4,c:'#ffe9a0',name:'Schedar',nx:-1,dy:12},
   k5:{fx:778,fy:259,r:2.7,c:'#eaf6ff'}
  },
  lines:[
   ["k1","k2"],["k2","k3"],["k3","k4"],["k4","k5"]
  ]},
 /* Perseus: 11 titik dari Perseus.html (viewBox 540×360 → ×1000/540). UI NONAKTIF (off). Bintang utama nanti: Algol (p9). CATATAN: HTML cuma melabeli Mirfak (p3); posisi Algol = p9 itu TEBAKAN dari arah/jarak aslinya terhadap Mirfak — cek visual. */
 {id:'perseus',ra0:0,delay:1.2,phase:.9,
  stars:{
   p1:{fx:639,fy:74,r:2.2,c:'#dcefff'},
   p2:{fx:583,fy:157,r:2.4,c:'#eaf6ff'},
   p3:{fx:509,fy:241,r:3.9,c:'#eaf6ff'},
   p4:{fx:444,fy:287,r:2.6,c:'#eaf6ff'},
   p5:{fx:380,fy:407,r:2.4,c:'#eaf6ff'},
   p6:{fx:370,fy:491,r:2.2,c:'#eaf6ff'},
   p7:{fx:370,fy:565,r:1.9,c:'#dcefff'},
   p8:{fx:426,fy:556,r:1.8,c:'#dcefff'},
   p9:{fx:574,fy:389,r:2.5,c:'#ffe9a0',name:'Algol',nx:1,dy:-8},
   p10:{fx:602,fy:463,r:2.2,c:'#dcefff'},
   p11:{fx:657,fy:472,r:1.8,c:'#dcefff'}
  },
  lines:[
   ["p1","p2"],["p2","p3"],["p3","p4"],["p4","p5"],
   ["p5","p6"],["p6","p7"],["p7","p8"],["p3","p9"],
   ["p9","p10"],["p10","p11"]
  ]},
 /* Aries: 4 titik dari aries.html (viewBox 540×360 → ×1000/540). UI NONAKTIF (off). Bintang utama nanti: Hamal (a2). */
 {id:'aries',ra0:0,delay:1.1,phase:.6,
  stars:{
   a1:{fx:361,fy:102,r:2.2,c:'#dcefff'},
   a2:{fx:528,fy:324,r:3.7,c:'#ffe9a0',name:'Hamal',nx:1,dy:-8},
   a3:{fx:583,fy:472,r:2.6,c:'#eaf6ff'},
   a4:{fx:556,fy:565,r:2.0,c:'#dcefff'}
  },
  lines:[
   ["a1","a2"],["a2","a3"],["a3","a4"]
  ]},
 /* Aquila: 11 titik dari Aquila.html (viewBox 540×360 → ×1000/540). UI NONAKTIF (off). Bintang utama: Altair (aq2 — tengah trio kepala). Subtitle HTML bilang "10 bintang" tapi SVG-nya 11 titik (nomor 1–11) — data ikut SVG. Nomor kunci = nomor di HTML (urutan 8 → 11 → 9 → 10 di SVG, bukan numerik). */
 {id:'aquila',ra0:0,delay:1.4,phase:.8,
  stars:{
   aq1:{fx:415,fy:185,r:2.6,c:'#eaf6ff'},
   /* Altair = tengah trio kepala (aq1—aq2—aq3), bukan ujung */
   aq2:{fx:393,fy:226,r:3.9,c:'#ffe9a0',name:'Altair',nx:-1,dy:-8},
   aq3:{fx:365,fy:283,r:2.6,c:'#eaf6ff'},
   aq4:{fx:537,fy:357,r:3.4,c:'#eaf6ff'},
   aq5:{fx:270,fy:446,r:2.5,c:'#eaf6ff'},
   aq6:{fx:385,fy:406,r:2.1,c:'#dcefff'},
   aq7:{fx:476,fy:463,r:1.8,c:'#dcefff'},
   aq8:{fx:650,fy:550,r:2.3,c:'#eaf6ff'},
   aq11:{fx:694,fy:576,r:1.7,c:'#dcefff'},
   aq9:{fx:650,fy:111,r:3.5,c:'#eaf6ff'},
   aq10:{fx:689,fy:78,r:2.6,c:'#eaf6ff'}
  },
  lines:[
   ["aq1","aq2"],["aq2","aq3"],["aq1","aq4"],["aq5","aq6"],
   ["aq6","aq4"],["aq5","aq7"],["aq7","aq8"],["aq4","aq9"],
   ["aq9","aq10"],["aq4","aq8"],["aq9","aq8"],["aq8","aq11"]
  ]},
 /* Pegasus: 14 titik dari pegasus.html (viewBox 860×860 → ×1000/860). UI NONAKTIF (off). Bintang utama nanti: Alpheratz (pg1 = pojok kiri-atas Great Square; secara resmi α Andromedae, dulu juga δ Pegasi). Enif = pg14 (satu-satunya yang dilabeli di HTML) sengaja tidak dinamai karena bukan bintang SFX. */
 {id:'pegasus',ra0:0,delay:1.2,phase:1.0,
  stars:{
   pg1:{fx:164,fy:301,r:2.8,c:'#ffe9a0',name:'Alpheratz',nx:1,dy:-10},
   pg2:{fx:461,fy:330,r:3.4,c:'#eaf6ff'},
   pg3:{fx:110,fy:594,r:2.8,c:'#eaf6ff'},
   pg4:{fx:466,fy:615,r:2.8,c:'#eaf6ff'},
   pg5:{fx:554,fy:282,r:2.8,c:'#eaf6ff'},
   pg6:{fx:700,fy:210,r:2.8,c:'#eaf6ff'},
   pg7:{fx:532,fy:414,r:2.8,c:'#eaf6ff'},
   pg8:{fx:550,fy:435,r:2.8,c:'#eaf6ff'},
   pg9:{fx:736,fy:384,r:2.8,c:'#eaf6ff'},
   pg10:{fx:844,fy:366,r:2.8,c:'#eaf6ff'},
   pg11:{fx:560,fy:675,r:2.8,c:'#eaf6ff'},
   pg12:{fx:587,fy:700,r:2.8,c:'#eaf6ff'},
   pg13:{fx:758,fy:790,r:2.8,c:'#eaf6ff'},
   pg14:{fx:889,fy:696,r:4.0,c:'#eaf6ff'}
  },
  lines:[
   ["pg1","pg2"],["pg1","pg3"],["pg3","pg4"],["pg2","pg4"],
   ["pg2","pg5"],["pg5","pg6"],["pg2","pg7"],["pg7","pg8"],
   ["pg8","pg9"],["pg9","pg10"],["pg4","pg11"],["pg11","pg12"],
   ["pg12","pg13"],["pg13","pg14"]
  ]},
 /* Pisces: 17 titik dari Pisces.html (viewBox 540×540 → ×1000/540). UI NONAKTIF (off). Bintang utama nanti: Alpherg (ps4; di HTML dilabeli "Kullat Nunu" = nama lain η Piscium). Subtitle HTML bilang "20 bintang" tapi SVG-nya cuma 17 titik — data ikut SVG. */
 {id:'pisces',ra0:0,delay:1.5,phase:.7,
  stars:{
   ps1:{fx:111,fy:361,r:2.6,c:'#eaf6ff'},
   ps2:{fx:254,fy:330,r:1.9,c:'#dcefff'},
   ps3:{fx:380,fy:294,r:2.2,c:'#dcefff'},
   ps4:{fx:561,fy:228,r:2.9,c:'#ffe9a0',name:'Alpherg',nx:-1,dy:-8},
   ps5:{fx:574,fy:122,r:2.0,c:'#dcefff'},
   ps6:{fx:693,fy:100,r:1.9,c:'#dcefff'},
   ps7:{fx:146,fy:383,r:1.7,c:'#dcefff'},
   ps8:{fx:219,fy:396,r:1.8,c:'#dcefff'},
   ps9:{fx:267,fy:435,r:1.7,c:'#dcefff'},
   ps10:{fx:380,fy:531,r:2.0,c:'#dcefff'},
   ps11:{fx:424,fy:607,r:1.8,c:'#dcefff'},
   ps12:{fx:533,fy:713,r:1.9,c:'#dcefff'},
   ps13:{fx:591,fy:831,r:2.2,c:'#dcefff'},
   ps14:{fx:661,fy:867,r:1.8,c:'#dcefff'},
   ps15:{fx:663,fy:944,r:1.9,c:'#dcefff'},
   ps16:{fx:574,fy:944,r:1.9,c:'#dcefff'},
   ps17:{fx:504,fy:887,r:1.8,c:'#dcefff'}
  },
  lines:[
   ["ps1","ps2"],["ps2","ps3"],["ps3","ps4"],["ps4","ps5"],
   ["ps5","ps6"],["ps4","ps6"],["ps1","ps7"],["ps7","ps8"],
   ["ps8","ps9"],["ps9","ps10"],["ps10","ps11"],["ps11","ps12"],
   ["ps12","ps13"],["ps13","ps14"],["ps14","ps15"],["ps15","ps16"],
   ["ps16","ps17"],["ps17","ps13"]
  ]},
 /* Auriga ANCHOR: Capella + companion (layout penuh belakangan). */
 {id:'auriga',ra0:0,delay:1.0,phase:0.5,
  stars:{
   capella:{fx:500,fy:420,r:4.2,c:'#ffe9a0',name:'Capella',nx:1,dy:-10},
   au2:{fx:560,fy:480,r:1.6,c:'#dcefff'}
  },
  lines:[["capella","au2"]]},
 /* Canis Minor ANCHOR: Procyon + companion (layout penuh belakangan). */
 {id:'canmin',ra0:0,delay:1.1,phase:0.6,
  stars:{
   procyon:{fx:480,fy:500,r:4.0,c:'#e8f0ff',name:'Procyon',nx:1,dy:-10},
   cm2:{fx:540,fy:560,r:1.6,c:'#dcefff'}
  },
  lines:[["procyon","cm2"]]},

];

/* =====================================================================================================
   BAGIAN BAWAH = PEMBANGUN TABEL TURUNAN. Biasanya tidak perlu disentuh.
   ===================================================================================================== */
var rasiBy={},sfxBy={},consOff={},D={};
RASI.forEach(function(r){rasiBy[r.id]=r;if(r.off)consOff[r.id]=1;});
SFX.forEach(function(s){sfxBy[s.key]=s;s.name=s.label.toLowerCase();s.audio=s.name+'.opus';});

/* sektor runtime: ids = rasi AKTIF (off tidak ikut) dalam urutan record */
var sectors=SECTORS.map(function(s){
  return {k:s.k,name:s.name,title:s.title,season:s.season,a:s.a,sky:s.sky,
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
    /* unlock tanpa SFX diizinkan: alignment tetap jalan, archive tanpa autoplay */
    // if(r.unlock&&!own.length)P.push(w+'unlock:true tapi belum punya bintang SFX...');
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
