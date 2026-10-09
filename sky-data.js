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
  /* Winter scene: compact Stellarium-like layout. Alignments: Sirius–belt–Aldebaran–Pleiades collinear; Sirius–Procyon–Betelgeuse triangle; Elnath join Auriga↔Taurus. Portrait-scaled. */
  {id:'orion', sector:'winter', label:'Orion', focusName:'Orion', focus:2, dist:1344, unlock:true,
   cap:{text:'Orion', x:'mid', dx:-30, y:'bottom', dy:22},
   box:{portrait:function(W,top,ah,bot){return [W*.32,top-ah*.02,W*.64,top+ah*.32];}, land:function(W,top,ah,bot){return [W*.22,top+ah*.02,W*.37,bot-12];}},
   scene:{k:2.548, th:11, pv:[674,875], at:[909.715,-2508.623]},
   whisper:["The hunter never moved. We just kept looking.","Three stars in a row, and somehow it became a story."],
   info:{"tag":"Constellation · The Hunter","rows":[["Brightest","Rigel · mag 0.13"],["Betelgeuse","~550–700 ly"],["Orion Nebula","M42 · ~1,350 ly"],["Area","594 sq°"]],"fact":"Betelgeuse is a red supergiant so vast it would swallow Mars’s orbit if it sat where the Sun does."}},
  {id:'taurus', sector:'winter', label:'Taurus', focusName:'Taurus', focus:4, dist:65, unlock:true, joinTo:'auriga', /* overview: nyambung ke Auriga lewat Elnath; mode kamera fokus tetap 2 rasi terpisah */
   cap:{text:'Taurus', x:'mid', dx:-28, y:'bottom', dy:18},
   box:{portrait:function(W,top,ah,bot){return [W*.12,top+ah*.64,W*.42,top+ah*.92];}, land:function(W,top,ah,bot){return [W*.02,top+ah*.48,W*.15,bot-28];}},
   scene:{k:2.412, th:-5, pv:[453,627], at:[1712.782,-4059.034]},
   whisper:["The bull is not charging. It has simply waited a very long time.","Seven sisters ride on its shoulder."],
   info:{"tag":"Constellation · The Bull","rows":[["Brightest","Aldebaran · ~65 ly"],["Cluster","Pleiades M45"],["Crab Nebula","M1 · ~6,500 ly"],["Area","797 sq°"]],"fact":"The Crab Nebula is the remnant of a supernova that Chinese astronomers recorded in 1054."}},
  {id:'canis', sector:'winter', label:'Canis Major', focusName:'Sirius', focus:1, dist:9, unlock:true,
   cap:{text:'Canis Major', x:'mid', dx:-48, y:'bottom', dy:18},
   box:{portrait:function(W,top,ah,bot){return [W*.04,top+ah*.14,W*.18,top+ah*.32];}, land:function(W,top,ah,bot){return [W*.02,top+ah*.08,W*.10,top+ah*.34];}},
   scene:{k:1.311, th:-35, pv:[729,312], at:[-894.461,-1975.51]},
   whisper:["The brightest dog in the sky, and it still follows.","Sirius answers if you wait long enough."],
   info:{"tag":"Constellation · The Great Dog","rows":[["Brightest","Sirius · mag −1.46"],["Distance","8.6 ly"],["Companion","Sirius B, white dwarf"],["Area","380 sq°"]],"fact":"Sirius is the brightest star in the night sky, and one of our nearest neighbours."}},
  {id:'pleiades', sector:'winter', label:'Pleiades', focusName:'Pleiades', focus:5, dist:444, cluster:true, unlock:true,
   ple:{at:[2506.089,-4486.856], ps:397.192},
   whisper:["Seven voices, one soft cluster.","Lean closer. They only whisper."],
   info:{"tag":"Open cluster · M45","rgb":"145,170,255","rows":[["Distance","~444 ly"],["Age","~100 million years"],["Members","1,000+ stars"],["Naked eye","6–7 visible"]],"fact":"Blue light from its young stars is lighting a haze of dust around the cluster."}},
  {id:'gemini', sector:'winter', label:'Gemini', focusName:'Gemini', focus:3, dist:34, unlock:true,
   box:{portrait:function(W,top,ah,bot){return [W*.04,top+ah*.0,W*.30,top+ah*.2];}, land:function(W,top,ah,bot){return [W*.12,top+ah*.0,W*.30,top+ah*.3];}},
   scene:{k:4.426, th:20, pv:[181,196], at:[-1453.645,-5192.968]},
   whisper:["Two brothers, one light. They never leave the winter sky.","Castor and Pollux still share the same story."],
   info:{"tag":"Constellation · The Twins","rows":[["Brightest","Pollux · mag 1.14"],["Castor","binary system"],["Distance","~34–52 ly"],["Area","514 sq°"]],"fact":"Pollux is an orange giant; Castor is a complex multiple-star system of six stars."}},
  /* ANCHOR — Capella saja sampai layout Auriga penuh */
  {id:'auriga', sector:'winter', label:'Auriga', focusName:'Auriga', focus:6, dist:43, unlock:true,
   box:{portrait:function(W,top,ah,bot){return [W*.68,top+ah*.02,W*.95,top+ah*.42];}, land:function(W,top,ah,bot){return [W*.52,top+ah*.02,W*.78,top+ah*.48];}},
   scene:{k:2.905, th:2, pv:[315,113], at:[687.107,-7413.935]},
   whisper:["Capella waits where the chariot will stand.","A single warm point — the rest of Auriga is still arriving."],
   info:{"tag":"Constellation · The Charioteer","rows":[["Brightest","Capella · mag 0.08"],["Distance","~43 ly"],["Type","G-type giant pair"],["Area","657 sq°"]],"fact":"Capella is the sixth-brightest star in the night sky and a cornerstone of the Winter Hexagon."}},
  /* ANCHOR — Procyon saja sampai layout Canis Minor penuh */
  {id:'canmin', sector:'winter', label:'Canis Minor', focusName:'Procyon', focus:7, dist:11, unlock:true,
   box:{portrait:function(W,top,ah,bot){return [W*.70,top+ah*.48,W*.95,top+ah*.78];}, land:function(W,top,ah,bot){return [W*.55,top+ah*.42,W*.82,top+ah*.75];}},
   scene:{k:0.476, th:7.5, pv:[263,620], at:[-1521.667,-3494.483]},
   whisper:["The little dog holds one lamp.","Procyon keeps the Winter Triangle until the outline is drawn."],
   info:{"tag":"Constellation · The Little Dog","rows":[["Brightest","Procyon · mag 0.34"],["Distance","~11.5 ly"],["Companion","white dwarf"],["Area","183 sq°"]],"fact":"Procyon means “before the dog” — it rises ahead of Sirius."}},
  {id:'virgo', sector:'spring', label:'Virgo', focusName:'Virgo', focus:2, dist:250, unlock:true,
   cap:{text:'Virgo', x:'right', dx:-42, y:'top', dy:-24},
   ov:{ox:20.395, oy:-75.931, k:1.234, th:51},
   box:{portrait:function(W,top,ah,bot){return [W*.087,top+ah*.535,W*.432,top+ah*.721];}, land:function(W,top,ah,bot){return [W*.087,top+ah*.535,W*.432,top+ah*.721];}},
   whisper:["Spica burns quietly, like it knows something.","Spring sleeps here, folded in blue light."],
   info:{"tag":"Constellation · The Maiden","rows":[["Brightest","Spica · ~250 ly"],["Rank","2nd largest of 88"],["Cluster","Virgo · ~1,300 galaxies"],["Area","1,294 sq°"]],"fact":"Galaxy M87 hides here, home of the first black hole ever photographed."}},
  {id:'bootes', sector:'spring', label:'Boötes', focusName:'Boötes', focus:1, dist:37, unlock:true,
   /* scale naik: kite baru lebih tinggi (fy ~88–590) */
   ov:{ox:19.356, oy:3.324, k:0.615, th:31},
   box:{portrait:function(W,top,ah,bot){return [W*.05,top+ah*.28,W*.30,top+ah*.62];}, land:function(W,top,ah,bot){return [W*.05,top+ah*.22,W*.28,top+ah*.58];}},
   whisper:["The herdsman holds a lantern called Arcturus.","Amber light, older than the question."],
   info:{"tag":"Constellation · The Herdsman","rows":[["Brightest","Arcturus · ~37 ly"],["Type","Orange giant"],["Rank","4th brightest star"],["Area","907 sq°"]],"fact":"Nearby lies the Boötes Void, an emptiness about 330 million light-years wide."}},
  {id:'ursa', sector:'spring', label:'Ursa Major', focusName:'Ursa Major', focus:4, unlock:true, dist:83,
   ov:{ox:-96.583, oy:-91.008, k:1.804, th:309.5},
   box:{portrait:function(W,top,ah,bot){return [W*.7,top+ah*.24,W*.954,top+ah*.353];}, land:function(W,top,ah,bot){return [W*.7,top+ah*.24,W*.954,top+ah*.353];}},
   whisper:["The great bear keeps walking the northern sky.","Seven stars that taught us how to find north."],
   info:{"tag":"Constellation · The Great Bear","rows":[["Brightest","Alioth · mag 1.77"],["Asterism","Big Dipper"],["Distance","~83 ly"],["Area","1,280 sq°"]],"fact":"Alioth is the brightest star of the Big Dipper and helps point the way to Polaris."}},
  {id:'leo', sector:'spring', label:'Leo', focusName:'Leo', focus:3, unlock:true, dist:36,
   ov:{ox:35.217, oy:-67.877, k:1.054, th:1},
   box:{portrait:function(W,top,ah,bot){return [W*.333,top+ah*.426,W*.587,top+ah*.515];}, land:function(W,top,ah,bot){return [W*.333,top+ah*.426,W*.587,top+ah*.515];}},
   whisper:["The lion’s mane is made of spring light.","Denebola marks the tip of the tail."],
   info:{"tag":"Constellation · The Lion","rows":[["Brightest","Regulus · mag 1.40"],["Denebola","tail tip · mag 2.14"],["Distance","~36 ly"],["Area","947 sq°"]],"fact":"The Spring Triangle uses Denebola as one of its corners with Arcturus and Spica."}},
  {id:'hydra', sector:'spring', label:'Hydra', focusName:'Hydra', focus:5, unlock:true, dist:177,
   ov:{ox:-70.017, oy:-35.808, k:1.735, th:6},
   box:{portrait:function(W,top,ah,bot){return [W*.453,top+ah*.526,W*.94,top+ah*.754];}, land:function(W,top,ah,bot){return [W*.453,top+ah*.526,W*.94,top+ah*.754];}},
   whisper:["The longest constellation still crawls across the south.","Alphard is the lonely heart of the serpent."],
   info:{"tag":"Constellation · The Water Snake","rows":[["Brightest","Alphard · mag 1.98"],["Length","longest of 88"],["Distance","~177 ly"],["Area","1,303 sq°"]],"fact":"Hydra is the largest constellation by area, stretching far across the southern spring sky."}},
  {id:'scorpius', sector:'summer', label:'Scorpius', focusName:'Antares', focus:4, unlock:true, dist:550,
   ov:{ox:21.367, oy:-128.772, k:0.943, th:23},
   box:{portrait:function(W,top,ah,bot){return [W*.576,top+ah*.608,W*.954,top+ah*.815];}, land:function(W,top,ah,bot){return [W*.576,top+ah*.608,W*.954,top+ah*.815];}},
   whisper:["Antares glows red, a heart that never settled.","The scorpion waits where the summer sky is thickest."],
   info:{"tag":"Constellation · The Scorpion","rows":[["Brightest","Antares · ~550 ly"],["Type","Red supergiant"],["Size","~700× the Sun"],["Area","497 sq°"]],"fact":"Antares means “rival of Mars”, named for its matching red glow."}},
  {id:'sagit', sector:'summer', label:'Sagittarius', focusName:'Sagittarius', focus:6, unlock:true, dist:228,
   ov:{ox:-41.137, oy:-53.24, k:1.696, th:7},
   box:{portrait:function(W,top,ah,bot){return [W*.269,top+ah*.622,W*.556,top+ah*.762];}, land:function(W,top,ah,bot){return [W*.269,top+ah*.622,W*.556,top+ah*.762];}},
   whisper:["The archer aims toward the centre of the galaxy.","Nunki keeps the teapot steady."],
   info:{"tag":"Constellation · The Archer","rows":[["Brightest","Nunki · mag 2.05"],["Galactic centre","hidden here"],["Distance","~228 ly"],["Area","867 sq°"]],"fact":"Looking at Sagittarius is looking toward the heart of the Milky Way."}},
  {id:'lyra', sector:'summer', label:'Lyra', focusName:'Lyra', focus:1, dist:25, unlock:true,
   ov:{ox:-134.69, oy:-48.118, k:0.321, th:23},
   box:{portrait:function(W,top,ah,bot){return [W*.808,top+ah*.211,W*.954,top+ah*.328];}, land:function(W,top,ah,bot){return [W*.808,top+ah*.211,W*.954,top+ah*.328];}},
   whisper:["Vega is the harp string that never snaps.","Summer begins when this light returns."],
   info:{"tag":"Constellation · The Lyre","rows":[["Brightest","Vega · mag 0.03"],["Distance","25 ly"],["Rank","5th brightest star"],["Area","286 sq°"]],"fact":"Vega was the northern pole star around 12,000 BCE and will be again in about 12,000 years."}},
  {id:'cygnus', sector:'summer', label:'Cygnus', focusName:'Cygnus', focus:3, dist:2615, unlock:true,
   ov:{ox:-116.988, oy:-86.809, k:1.298, th:18},
   box:{portrait:function(W,top,ah,bot){return [W*.453,top+ah*.153,W*.788,top+ah*.307];}, land:function(W,top,ah,bot){return [W*.453,top+ah*.153,W*.788,top+ah*.307];}},
   whisper:["The swan flies along the Milky Way.","Deneb is a distant lighthouse still arriving."],
   info:{"tag":"Constellation · The Swan","rows":[["Brightest","Deneb · mag 1.25"],["Distance","~2,600 ly"],["Type","Blue-white supergiant"],["Area","804 sq°"]],"fact":"Deneb is one of the most luminous stars known; its light left when the Bronze Age was ending."}},
  {id:'ophiuchus', sector:'summer', label:'Ophiuchus', focusName:'Ophiuchus', focus:5, unlock:true, dist:49,
   ov:{ox:42.369, oy:-60.376, k:1.547, th:0},
   box:{portrait:function(W,top,ah,bot){return [W*.311,top+ah*.416,W*.718,top+ah*.597];}, land:function(W,top,ah,bot){return [W*.311,top+ah*.416,W*.718,top+ah*.597];}},
   whisper:["The serpent-bearer stands between the seasons.","Rasalhague watches from the north edge."],
   info:{"tag":"Constellation · The Serpent Bearer","rows":[["Brightest","Rasalhague · mag 2.07"],["Distance","~49 ly"],["Zodiac","13th constellation"],["Area","948 sq°"]],"fact":"Ophiuchus is the forgotten thirteenth zodiacal constellation the Sun still crosses."}},
  {id:'aquila', sector:'summer', label:'Aquila', focusName:'Aquila', focus:2, dist:17, unlock:true,
   ov:{ox:14.657, oy:-61.154, k:1.53, th:0},
   box:{portrait:function(W,top,ah,bot){return [W*.087,top+ah*.405,W*.291,top+ah*.535];}, land:function(W,top,ah,bot){return [W*.087,top+ah*.405,W*.291,top+ah*.535];}},
   whisper:["The eagle carries Altair across the summer triangle.","Three stars in a line mark the flight."],
   info:{"tag":"Constellation · The Eagle","rows":[["Brightest","Altair · mag 0.76"],["Distance","16.7 ly"],["Type","A7 V"],["Area","652 sq°"]],"fact":"Altair is one of the closest naked-eye stars and rotates so fast it is flattened at the poles."}},
  {id:'cassiopeia', sector:'autumn', label:'Cassiopeia', focusName:'Cassiopeia', focus:2, unlock:true, dist:228,
   ov:{ox:17.618, oy:16.037, k:0.446, th:48},
   box:{portrait:function(W,top,ah,bot){return [W*.468,top+ah*.137,W*.823,top+ah*.214];}, land:function(W,top,ah,bot){return [W*.468,top+ah*.137,W*.823,top+ah*.214];}},
   whisper:["The queen still sits on her crooked throne.","W or M — it depends on how the night turns."],
   info:{"tag":"Constellation · The Queen","rows":[["Brightest","Schedar · mag 2.24"],["Shape","W / M"],["Distance","~228 ly"],["Area","598 sq°"]],"fact":"Cassiopeia never sets for northern observers and is one of the easiest patterns to recognise."}},
  {id:'perseus', sector:'autumn', label:'Perseus', focusName:'Perseus', focus:3, unlock:true, dist:92,
   ov:{ox:26.199, oy:-77.811, k:0.832, th:50},
   box:{portrait:function(W,top,ah,bot){return [W*.087,top+ah*.212,W*.372,top+ah*.476];}, land:function(W,top,ah,bot){return [W*.087,top+ah*.212,W*.372,top+ah*.476];}},
   whisper:["The hero still carries Medusa’s eye.","Algol winks every two days and twenty hours."],
   info:{"tag":"Constellation · The Hero","rows":[["Brightest","Mirfak · mag 1.79"],["Algol","variable · mag 2.1–3.4"],["Distance","~92 ly"],["Area","615 sq°"]],"fact":"Algol is an eclipsing binary; its brightness drops when the dimmer star passes in front."}},
  {id:'aries', sector:'autumn', label:'Aries', focusName:'Aries', focus:4, unlock:true, dist:66,
   ov:{ox:24.181, oy:-130.744, k:0.547, th:-13},
   box:{portrait:function(W,top,ah,bot){return [W*.097,top+ah*.572,W*.224,top+ah*.716];}, land:function(W,top,ah,bot){return [W*.097,top+ah*.572,W*.224,top+ah*.716];}},
   whisper:["The ram’s head is quiet now.","Hamal still points the way into autumn."],
   info:{"tag":"Constellation · The Ram","rows":[["Brightest","Hamal · mag 2.00"],["Distance","~66 ly"],["Type","K2 III"],["Area","441 sq°"]],"fact":"Aries once marked the vernal equinox; precession has since moved that point into Pisces."}},
  {id:'pegasus', sector:'autumn', label:'Pegasus', focusName:'Pegasus', focus:1, dist:97, unlock:true,
   ov:{ox:-4.618, oy:-4.692, k:0.993, th:8.5},
   box:{portrait:function(W,top,ah,bot){return [W*.467,top+ah*.425,W*.954,top+ah*.622];}, land:function(W,top,ah,bot){return [W*.467,top+ah*.425,W*.954,top+ah*.622];}},
   whisper:["The Great Square is the autumn door.","Alpheratz holds the corner that belongs to two stories."],
   info:{"tag":"Constellation · The Winged Horse","rows":[["Brightest","Enif · mag 2.38"],["Alpheratz","shared with Andromeda"],["Distance","~97 ly"],["Area","1,121 sq°"]],"fact":"The Great Square of Pegasus is one of the most useful asterisms for finding autumn constellations."}},
  {id:'pisces', sector:'autumn', label:'Pisces', focusName:'Pisces', focus:5, unlock:true, dist:294,
   ov:{ox:-70.966, oy:-121.133, k:1.091, th:-28},
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
  /* Orion FIX V6 dari orion.html (viewBox 1000×1000). Betelgeuse + Rigel SFX. */
  stars:{
   o1:{fx:328,fy:60,r:2.6,c:'#eaf6ff'},
   o2:{fx:263,fy:75,r:2.6,c:'#eaf6ff'},
   o3:{fx:233,fy:221,r:2.3,c:'#dcefff'},
   o4:{fx:203,fy:236,r:2.3,c:'#dcefff'},
   o5:{fx:268,fy:371,r:2.9,c:'#eaf6ff'},
   betel:{fx:315,fy:435,r:4.2,c:'#ff8e66',name:'Betelgeuse',nx:1,dy:-10},
   o7:{fx:464,fy:363,r:2.9,c:'#eaf6ff'},
   o8:{fx:538,fy:465,r:2.9,c:'#eaf6ff'},
   o9:{fx:753,fy:349,r:2.3,c:'#dcefff'},
   o10:{fx:785,fy:385,r:2.3,c:'#dcefff'},
   o11:{fx:793,fy:440,r:2.6,c:'#eaf6ff'},
   o12:{fx:783,fy:482,r:2.3,c:'#dcefff'},
   o13:{fx:772,fy:574,r:2.3,c:'#dcefff'},
   o14:{fx:733,fy:597,r:2.3,c:'#dcefff'},
   alnitak:{fx:490,fy:658,r:3.1,c:'#cfeeff'},
   alnilam:{fx:460,fy:688,r:3.1,c:'#cfeeff'},
   mintaka:{fx:428,fy:708,r:3.1,c:'#cfeeff'},
   rigel:{fx:674,fy:875,r:4.2,c:'#bfe0ff',name:'Rigel',nx:-1,dy:2},
   saiph:{fx:378,fy:936,r:3.1,c:'#cde6ff'}
  },
  lines:[
   ["o1","o3"],["o2","o4"],["o3","o5"],["o4","o5"],
   ["o5","betel"],["betel","o7"],["betel","mintaka"],
   ["o7","o8"],["o8","o11"],
   ["o9","o10"],["o10","o11"],["o11","o12"],["o12","o13"],["o13","o14"],
   ["o8","alnitak"],["alnitak","alnilam"],["alnilam","mintaka"],
   ["mintaka","saiph"],["alnitak","rigel"],["saiph","rigel"]
  ]},
 {id:'virgo',ra0:190.7,delay:1.4,phase:2.1,
  /* Virgo dari virgo.html (viewBox 720×860 → ×1000/720). Spica SFX. */
  stars:{
   v1:{fx:820,fy:102,r:2.2,c:'#eaf6ff'},
   v2:{fx:799,fy:383,r:2.5,c:'#eaf6ff'},
   v3:{fx:716,fy:493,r:2.4,c:'#eaf6ff'},
   v4:{fx:594,fy:463,r:2.5,c:'#eaf6ff'},
   v5:{fx:461,fy:350,r:2.5,c:'#eaf6ff'},
   v6:{fx:498,fy:695,r:2.7,c:'#eaf6ff'},
   v7:{fx:361,fy:758,r:2.3,c:'#eaf6ff'},
   v8:{fx:179,fy:960,r:2.3,c:'#eaf6ff'},
   spica:{fx:685,fy:860,r:4.5,c:'#bfe0ff',name:'Spica',nx:-1},
   v10:{fx:489,fy:1044,r:2.5,c:'#eaf6ff'},
   v11:{fx:413,fy:981,r:2.5,c:'#eaf6ff'},
   v12:{fx:304,fy:1088,r:2.5,c:'#eaf6ff'}
  },
  lines:[
   ["v1","v2"],["v2","v3"],["v3","v4"],["v4","v5"],
   ["v4","v6"],["v6","v7"],["v7","v8"],
   ["v3","spica"],["v6","spica"],
   ["spica","v10"],["v10","v11"],["v11","v12"]
  ]},
 {id:'canis',ra0:103.5,delay:2.2,phase:4.0,
  /* Canis Major dari canis major.html (viewBox 720×720 → ×1000/720). Sirius SFX. */
  stars:{
   cm1:{fx:639,fy:111,r:2.2,c:'#eaf6ff'},
   cm2:{fx:839,fy:72,r:2.2,c:'#eaf6ff'},
   cm3:{fx:639,fy:221,r:2.2,c:'#eaf6ff'},
   sirius:{fx:729,fy:312,r:4.5,c:'#e8f4ff',name:'Sirius',nx:1,dy:-10},
   cm5:{fx:722,fy:417,r:2.7,c:'#eaf6ff'},
   cm6:{fx:72,fy:421,r:2.4,c:'#eaf6ff'},
   cm7:{fx:229,fy:403,r:2.4,c:'#eaf6ff'},
   wezen:{fx:288,fy:435,r:2.9,c:'#eaf6ff',name:'Wezen',nx:-1,dy:-8},
   cm9:{fx:415,fy:390,r:2.4,c:'#eaf6ff'},
   cm10:{fx:286,fy:536,r:2.1,c:'#eaf6ff'},
   cm11:{fx:469,fy:471,r:2.1,c:'#eaf6ff'},
   cm12:{fx:274,fy:594,r:2.6,c:'#eaf6ff'},
   cm13:{fx:654,fy:583,r:2.4,c:'#eaf6ff'},
   cm14:{fx:922,fy:529,r:2.6,c:'#eaf6ff'},
   cm15:{fx:214,fy:776,r:2.1,c:'#eaf6ff'},
   cm16:{fx:500,fy:924,r:2.6,c:'#eaf6ff'}
  },
  lines:[
   ["cm1","cm2"],["cm1","cm3"],["cm3","cm2"],
   ["sirius","cm3"],["sirius","cm5"],
   ["cm5","cm13"],["cm5","cm11"],["cm5","cm14"],
   ["sirius","cm9"],["cm9","wezen"],
   ["cm6","cm7"],["cm7","wezen"],
   ["wezen","cm10"],["cm10","cm11"],["cm10","cm12"],
   ["cm12","cm15"],["cm12","cm16"]
  ]},
 {id:'taurus',ra0:68.9,delay:1.0,phase:1.2,
  /* Taurus dari taurus.html (viewBox 720×860 → ×1000/720). Aldebaran SFX. */
  stars:{
   elnath:{fx:218,fy:180,r:2.9,c:'#eaf6ff',name:'Alnath',nx:-1,dy:-8},
   t2:{fx:424,fy:399,r:2.9,c:'#eaf6ff'},
   t3:{fx:145,fy:438,r:2.5,c:'#eaf6ff'},
   t4:{fx:495,fy:539,r:2.2,c:'#eaf6ff'},
   t5:{fx:522,fy:588,r:2.2,c:'#eaf6ff'},
   aldebaran:{fx:453,fy:627,r:4.5,c:'#ffb450',name:'Aldebaran',nx:1,dy:-8},
   t7:{fx:507,fy:653,r:2.1,c:'#eaf6ff'},
   t8:{fx:545,fy:661,r:2.1,c:'#eaf6ff'},
   t9:{fx:648,fy:788,r:2.6,c:'#eaf6ff'},
   t10:{fx:800,fy:756,r:2.5,c:'#eaf6ff'},
   t11:{fx:823,fy:843,r:2.1,c:'#eaf6ff'},
   t12:{fx:847,fy:880,r:2.0,c:'#eaf6ff'},
   t13:{fx:568,fy:916,r:2.4,c:'#eaf6ff'},
   t14:{fx:636,fy:1005,r:2.5,c:'#eaf6ff'}
  },
  lines:[
   ["elnath","t2"],["t3","aldebaran"],
   ["t2","t4"],["t4","t5"],["t5","t8"],
   ["aldebaran","t7"],["t7","t8"],
   ["t8","t9"],["t9","t10"],["t10","t11"],["t11","t12"],
   ["t9","t13"],["t13","t14"]
  ]},
 {id:'bootes',ra0:0,delay:1.0,phase:1.2,
  /* Boötes dari bootes.html (viewBox 720×480 → ×1000/720). Arcturus α Boo. */
  stars:{
   b1:{fx:536,fy:88,r:2.2,c:'#eaf6ff'},
   b2:{fx:556,fy:88,r:2.2,c:'#eaf6ff'},
   b3:{fx:549,fy:147,r:2.2,c:'#eaf6ff'},
   nekkar:{fx:407,fy:233,r:2.5,c:'#eaf6ff'},
   seginus:{fx:501,fy:268,r:2.5,c:'#eaf6ff'},
   princeps:{fx:362,fy:336,r:2.5,c:'#eaf6ff'},
   b7:{fx:511,fy:361,r:2.7,c:'#eaf6ff'},
   izar:{fx:456,fy:418,r:3.0,c:'#eaf6ff'},
   arcturus:{fx:550,fy:501,r:4.5,c:'#ffb450',name:'Arcturus',nx:-1,dy:12},
   muphrid:{fx:615,fy:508,r:2.7,c:'#eaf6ff'},
   b11:{fx:492,fy:590,r:2.4,c:'#eaf6ff'}
  },
  lines:[
   /* top double → neck */
   ["b1","b3"],["b2","b3"],["b3","seginus"],
   /* Seginus → Nekkar & middle */
   ["seginus","nekkar"],["seginus","b7"],
   /* Nekkar → Princeps → Izar → Arcturus */
   ["nekkar","princeps"],["princeps","izar"],["izar","arcturus"],
   /* middle → Arcturus direct */
   ["b7","arcturus"],
   /* Arcturus → Muphrid & bawah */
   ["arcturus","muphrid"],["arcturus","b11"]
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
  /* Ursa Major dari ursa major.html (viewBox 1000×1000). Alioth SFX. */
  stars:{
   alkaid:{fx:80,fy:55,r:3.2,c:'#eaf6ff'},
   mizar:{fx:215,fy:83,r:3.2,c:'#eaf6ff'},
   alioth:{fx:284,fy:173,r:4.2,c:'#ffe9a0',name:'Alioth',nx:-1,dy:-10},
   megrez:{fx:370,fy:274,r:2.9,c:'#eaf6ff'},
   u5:{fx:360,fy:399,r:2.9,c:'#eaf6ff'},
   u6:{fx:517,fy:472,r:2.9,c:'#eaf6ff'},
   u7:{fx:576,fy:348,r:2.9,c:'#eaf6ff'},
   u8:{fx:780,fy:441,r:2.9,c:'#eaf6ff'},
   u9:{fx:918,fy:541,r:3.2,c:'#eaf6ff'},
   u10:{fx:708,fy:531,r:2.6,c:'#dcefff'},
   u11:{fx:670,fy:649,r:2.6,c:'#dcefff'},
   u12:{fx:301,fy:537,r:2.6,c:'#dcefff'},
   u13:{fx:357,fy:714,r:2.6,c:'#dcefff'},
   u14:{fx:473,fy:906,r:2.4,c:'#dcefff'},
   u15:{fx:501,fy:878,r:2.4,c:'#dcefff'},
   u16:{fx:710,fy:737,r:2.6,c:'#dcefff'},
   u17:{fx:777,fy:888,r:2.4,c:'#dcefff'},
   u18:{fx:797,fy:871,r:2.4,c:'#dcefff'}
  },
  lines:[
   ["alkaid","mizar"],["mizar","alioth"],["alioth","megrez"],
   ["megrez","u7"],["u7","u8"],
   ["u5","megrez"],["u5","u6"],["u6","u7"],["u6","u11"],
   ["u8","u9"],["u10","u9"],["u10","u11"],
   ["u12","u5"],["u12","u13"],["u13","u14"],["u13","u15"],
   ["u11","u16"],["u16","u17"],["u16","u18"]
  ]},
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
  /* Hydra V2 dari hydra.html (viewBox 1000×1000). Alphard utama (belum SFX). */
  stars:{
   h1:{fx:140,fy:725,r:2.9,c:'#eaf6ff'},
   h2:{fx:236,fy:624,r:3.2,c:'#eaf6ff'},
   h3:{fx:480,fy:631,r:2.9,c:'#eaf6ff'},
   h4:{fx:515,fy:595,r:2.9,c:'#eaf6ff'},
   h5:{fx:566,fy:446,r:2.9,c:'#eaf6ff'},
   h6:{fx:629,fy:431,r:2.9,c:'#eaf6ff'},
   h7:{fx:656,fy:386,r:2.9,c:'#eaf6ff'},
   h8:{fx:707,fy:402,r:2.9,c:'#eaf6ff'},
   alphard:{fx:795,fy:320,r:4.2,c:'#ffe9a0',name:'Alphard',nx:-1,dy:-10},
   h10:{fx:711,fy:247,r:2.6,c:'#eaf6ff'},
   h11:{fx:770,fy:197,r:2.6,c:'#eaf6ff'},
   h12:{fx:809,fy:137,r:2.6,c:'#eaf6ff'},
   h13:{fx:839,fy:129,r:2.6,c:'#eaf6ff'},
   h14:{fx:862,fy:136,r:2.6,c:'#eaf6ff'},
   h15:{fx:859,fy:161,r:2.6,c:'#eaf6ff'},
   h16:{fx:820,fy:151,r:2.6,c:'#eaf6ff'}
  },
  lines:[
   ["h1","h2"],["h2","h3"],["h3","h4"],["h4","h5"],["h5","h6"],
   ["h6","h7"],["h7","h8"],["h8","alphard"],
   ["alphard","h10"],["h10","h11"],["h11","h12"],
   ["h12","h13"],["h13","h14"],["h14","h15"],["h15","h16"],["h16","h12"]
  ]},
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
  /* Pisces dari pisces.html (viewBox 1000×1000). Alpherg utama. */
  stars:{
   ps1:{fx:852,fy:50,r:2.6,c:'#eaf6ff'},
   ps2:{fx:770,fy:68,r:2.6,c:'#eaf6ff'},
   ps3:{fx:747,fy:133,r:2.6,c:'#eaf6ff'},
   alpherg:{fx:420,fy:260,r:4.2,c:'#ffe9a0',name:'Alpherg',nx:-1,dy:-10},
   ps5:{fx:290,fy:300,r:2.6,c:'#eaf6ff'},
   ps6:{fx:135,fy:350,r:2.9,c:'#eaf6ff'},
   ps7:{fx:170,fy:365,r:2.2,c:'#dcefff'},
   ps8:{fx:250,fy:375,r:2.4,c:'#dcefff'},
   ps9:{fx:285,fy:400,r:2.4,c:'#dcefff'},
   ps10:{fx:420,fy:500,r:2.6,c:'#eaf6ff'},
   ps11:{fx:480,fy:570,r:2.6,c:'#eaf6ff'},
   ps12:{fx:580,fy:670,r:2.4,c:'#dcefff'},
   ps13:{fx:620,fy:750,r:2.4,c:'#dcefff'},
   ps14:{fx:712,fy:855,r:3.2,c:'#eaf6ff'},
   ps15:{fx:778,fy:886,r:3.0,c:'#eaf6ff'},
   ps16:{fx:780,fy:986,r:3.2,c:'#eaf6ff'},
   ps17:{fx:704,fy:984,r:3.2,c:'#eaf6ff'},
   ps18:{fx:643,fy:917,r:3.0,c:'#eaf6ff'}
  },
  lines:[
   ["ps1","ps2"],["ps2","ps3"],["ps3","ps1"],
   ["ps3","alpherg"],["alpherg","ps5"],["ps5","ps6"],
   ["ps6","ps7"],["ps7","ps8"],["ps8","ps9"],["ps9","ps10"],
   ["ps10","ps11"],["ps11","ps12"],["ps12","ps13"],["ps13","ps14"],
   ["ps14","ps15"],["ps15","ps16"],["ps16","ps17"],["ps17","ps18"],["ps18","ps14"]
  ]},
 {id:'auriga',ra0:0,delay:1.0,phase:0.5,
  /* Auriga full dari auriga.html (viewBox 1000×1000). Capella SFX. */
  stars:{
   capella:{fx:315,fy:113,r:4.5,c:'#ffe9a0',name:'Capella',nx:1,dy:-12},
   menkalinan:{fx:306,fy:404,r:3.2,c:'#eaf6ff'},
   mahassim:{fx:490,fy:365,r:3.2,c:'#eaf6ff'},
   au4:{fx:557,fy:407,r:2.8,c:'#eaf6ff'},
   au5:{fx:542,fy:501,r:2.8,c:'#eaf6ff'},
   au6:{fx:570,fy:492,r:2.8,c:'#eaf6ff'},
   almaaz:{fx:299,fy:646,r:3.2,c:'#eaf6ff'},
   haedus:{fx:609,fy:749,r:3.2,c:'#eaf6ff'},
   elnath:{fx:469,fy:915,r:3.4,c:'#eaf6ff'}
  },
  lines:[
   ["capella","menkalinan"],["capella","mahassim"],["menkalinan","mahassim"],
   ["mahassim","au4"],["mahassim","au5"],["au4","au6"],["au5","au6"],
   ["au5","haedus"],["menkalinan","almaaz"],["almaaz","elnath"],["elnath","haedus"]
  ]},
 {id:'canmin',ra0:0,delay:1.1,phase:0.6,
  /* Canis Minor full dari canis minor.html (viewBox 1000×1000). Procyon SFX. */
  stars:{
   procyon:{fx:263,fy:620,r:4.5,c:'#e8f0ff',name:'Procyon',nx:1,dy:12},
   gomeisa:{fx:705,fy:227,r:3.8,c:'#eaf6ff'},
   cm3:{fx:673,fy:143,r:2.6,c:'#dcefff'},
   cm4:{fx:799,fy:80,r:2.6,c:'#dcefff'}
  },
  lines:[["procyon","gomeisa"]]},
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

/* Batas fit layar scene winter dari layout editor (dikunci supaya skala sama kayak di editor). Harus setelah SKY dibuat. */
SKY.fit=[-1595.573,2602.066,-6658.733,-1201.066];
