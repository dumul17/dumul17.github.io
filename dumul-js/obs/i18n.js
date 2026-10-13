/* i18n.js — ganti bahasa EN/ID. Dimuat SETELAH texts.js dan SEBELUM js/01-core.js (lihat urutan <script> di index.html).
   Cara kerja:
   1. Bahasa dipilih: localStorage 'dumul_lang' -> navigator.language -> 'en'.
   2. Kalau 'id': teks data di TXT (texts.js) dan SKY (sky-data.js) ditimpa IN-PLACE dari tabel ID_* di bawah.
      Item yang belum ada terjemahannya otomatis tetap Inggris (aman, tidak ada yang kosong).
   3. Teks statis HTML: tambah atribut data-i18n="kunci" (teks), data-i18n-aria="kunci" (aria-label+title).
   4. Teks di file JS: ganti string literal jadi T('kunci') atau T('kunci',{n:3}).
   5. Ganti bahasa = simpan pilihan lalu reload halaman (paling aman, semua kanvas ikut dirender ulang).
   Nama bintang / rasi / lagu, angka, kode spektrum (K5 III) sengaja tidak diterjemahkan. */
(function(){
  var KEY='dumul_lang',lang='en';
  try{lang=localStorage.getItem(KEY)||'';}catch(e){}
  if(lang!=='id'&&lang!=='en')lang=/^id\b/i.test(navigator.language||'')?'id':'en';

  /* ---------- kamus UI: kunci -> {en, id}. {n} {s} dst = variabel ---------- */
  var UI={
    'sub':{en:'modder & music composer',id:'modder & komposer musik'},
    'quote':{en:'Keep creating, even without the applause.',id:'Tetap berkreasi, meski tanpa apresiasi.'},
    'footer.quote':{en:'Keep creating, even without the applause.',id:'Tetap berkreasi, meski tanpa apresiasi.'},
    'owl.open':{en:'Open about panel',id:'Buka panel tentang'},
    'owl.close':{en:'Close',id:'Tutup'},
    'owl.source':{en:'Source',id:'Kode'},
    'lang.btn':{en:'Language: EN',id:'Bahasa: ID'},
    'lang.label':{en:'EN → ID',id:'ID → EN'},

    /* boot */
    'boot.observer':{en:'OBSERVER',id:'PENGAMAT'},'boot.audio':{en:'AUDIO',id:'AUDIO'},'boot.starmap':{en:'STAR MAP',id:'PETA BINTANG'},
    'boot.lens':{en:'LENS',id:'LENSA'},'boot.signal':{en:'SIGNAL',id:'SINYAL'},'boot.boot':{en:'BOOT',id:'BOOT'},
    'boot.detected':{en:'DETECTED',id:'TERDETEKSI'},'boot.buffering':{en:'BUFFERING',id:'MEMUAT'},'boot.aligning':{en:'ALIGNING',id:'MENYELARASKAN'},
    'boot.nominal':{en:'NOMINAL',id:'NORMAL'},'boot.ready':{en:'READY',id:'SIAP'},'boot.stable':{en:'STABLE',id:'STABIL'},
    'boot.locked':{en:'LOCKED',id:'TERKUNCI'},'boot.online':{en:'ONLINE',id:'AKTIF'},'boot.open':{en:'OPEN',id:'TERBUKA'},'boot.complete':{en:'COMPLETE',id:'SELESAI'},
    'boot.transmitted':{en:'> SIGNAL TRANSMITTED',id:'> SINYAL TERKIRIM'},
    'boot.red':{en:'Red',id:'Merah'},'boot.blue':{en:'Blue',id:'Biru'},'boot.or':{en:'or',id:'atau'},
    'boot.red.aria':{en:'View Source Code',id:'Lihat Kode Sumber'},'boot.blue.aria':{en:'Enter Observatory',id:'Masuk Observatorium'},

    /* player */
    'mp.kicker':{en:"Dumul's Observatory",id:'Observatorium Dumul'},
    'mp.title':{en:'Music Transmission',id:'Transmisi Musik'},
    'mp.vol':{en:'Volume',id:'Volume'},'mp.unmute':{en:'Unmute',id:'Nyalakan suara'},
    'mp.open':{en:'Open music player',id:'Buka pemutar musik'},'mp.close':{en:'Close music player',id:'Tutup pemutar musik'},
    'mp.av.title':{en:'Gargantua Spectrum',id:'Spektrum Gargantua'},'mp.av.sub':{en:'Radial visualizer · signals',id:'Visualizer radial · sinyal'},
    'mp.signals':{en:'Stellar Signals',id:'Sinyal Bintang'},'mp.bgm':{en:'Observatory BGM',id:'BGM Observatorium'},'mp.conslog':{en:'Constellation Log',id:'Catatan Rasi'},
    'mp.play':{en:'Play music',id:'Putar musik'},'mp.pause':{en:'Pause music',id:'Jeda musik'},
    'mp.shuffle':{en:'Shuffle',id:'Acak'},'mp.prev':{en:'Previous',id:'Sebelumnya'},'mp.next':{en:'Next',id:'Berikutnya'},
    'mp.rep.off':{en:'Repeat off',id:'Ulang mati'},'mp.rep.one':{en:'Repeat one',id:'Ulang satu lagu'},'mp.rep.all':{en:'Repeat all',id:'Ulang semua'},
    'mp.seek':{en:'Seek',id:'Geser posisi'},
    'mp.locked':{en:'Locked',id:'Terkunci'},'mp.captured':{en:'Captured',id:'Tertangkap'},'mp.unobserved':{en:'Unobserved',id:'Belum diamati'},
    'sr.archived':{en:'● ARCHIVED',id:'● TERARSIP'},'sr.ready':{en:'◇ READY',id:'◇ SIAP'},'sr.scanning':{en:'○ SCANNING',id:'○ MEMINDAI'},
    'fx.aria':{en:'Play sound {s}',id:'Putar suara {s}'},

    /* mode tombol */
    'mode.observe':{en:'Observation Mode',id:'Mode Pengamatan'},'mode.observe.exit':{en:'Exit Observation',id:'Keluar Pengamatan'},
    'mode.camera':{en:'Constellation Camera',id:'Kamera Rasi'},'mode.camera.exit':{en:'Exit Constellation Camera',id:'Keluar Kamera Rasi'},
    'mode.bh.summon':{en:'Summon Gargantua',id:'Panggil Gargantua'},'mode.bh.recall':{en:'Recall Gargantua',id:'Tarik Gargantua'},
    'mode.tune':{en:'Tuning',id:'Penyetelan'},'mode.sectors':{en:'Back to overview',id:'Kembali ke ringkasan'},

    /* tuning panel */
    'tune.bh':{en:'Gargantua',id:'Gargantua'},'tune.sky':{en:'Sky',id:'Langit'},
    'tune.shape':{en:'Shape',id:'Bentuk'},'tune.light':{en:'Light',id:'Cahaya'},'tune.surr':{en:'Surroundings',id:'Sekitar'},
    'tune.size':{en:'Size',id:'Ukuran'},'tune.size.s':{en:'scale',id:'skala'},'tune.str':{en:'Strength',id:'Kekuatan'},'tune.str.s':{en:'lensing',id:'lensa gravitasi'},
    'tune.bloom':{en:'Bloom',id:'Pendar'},'tune.bloom.s':{en:'warm glow',id:'cahaya hangat'},'tune.speed':{en:'Speed',id:'Kecepatan'},'tune.speed.s':{en:'animation',id:'animasi'},
    'tune.ast':{en:'Asteroids',id:'Asteroid'},'tune.ast.s':{en:'orbiting rocks',id:'batu mengorbit'},
    'tune.show':{en:'Show',id:'Tampil'},'tune.hide':{en:'Hide',id:'Sembunyi'},
    'tune.atm':{en:'Atmosphere',id:'Atmosfer'},'tune.haze':{en:'Haze',id:'Kabut'},'tune.haze.s':{en:'dust clouds + glow',id:'awan debu + pendar'},
    'tune.band':{en:'Band',id:'Pita'},'tune.band.s':{en:'milky way',id:'bima sakti'},'tune.drift':{en:'Drift',id:'Hanyut'},'tune.drift.s':{en:'floating dust',id:'debu melayang'},
    'tune.neb':{en:'Nebula',id:'Nebula'},'tune.neb.s':{en:'image strength',id:'kekuatan gambar'},'tune.halo2':{en:'Blob halo',id:'Halo blob'},'tune.halo2.s':{en:'edge thickness',id:'tebal tepi'},
    'tune.vig':{en:'Vignette',id:'Vinyet'},'tune.vig.s':{en:'edge darkness',id:'gelap tepi'},'tune.portals':{en:'Portals',id:'Portal'},
    'tune.phalo':{en:'Portal halo',id:'Halo portal'},'tune.phalo.s':{en:'dark behind ring',id:'gelap di balik cincin'},
    'tune.save':{en:'Save',id:'Simpan'},'tune.reset':{en:'Reset',id:'Atur ulang'},
    'tune.sub.sky':{en:'Sky // Overview',id:'Langit // Ringkasan'},'tune.sub.sect':{en:'Gargantua // Sector Tune',id:'Gargantua // Setelan Sektor'},'tune.sub.bh':{en:'Gargantua // Tune',id:'Gargantua // Setelan'},
    'tune.saved.sky':{en:'SKY SETTINGS SAVED',id:'SETELAN LANGIT TERSIMPAN'},'tune.saved.bh':{en:'GARGANTUA SETTINGS SAVED',id:'SETELAN GARGANTUA TERSIMPAN'},
    /* tuning panel: tab Asteroid */
    'tune.ast.tab':{en:'Asteroid',id:'Asteroid'},'tune.sub.ast':{en:'Asteroid // Tune',id:'Asteroid // Setelan'},'tune.saved.ast':{en:'ASTEROID SETTINGS SAVED',id:'SETELAN ASTEROID TERSIMPAN'},
    'tune.ast.count':{en:'Count',id:'Jumlah'},'tune.ast.count.s':{en:'rocks',id:'batu'},'tune.ast.size.s':{en:'rock scale',id:'skala batu'},
    'tune.ast.orbit':{en:'Orbit',id:'Orbit'},'tune.ast.orbit.s':{en:'width',id:'lebar'},'tune.ast.thick':{en:'Thickness',id:'Ketebalan'},'tune.ast.thick.s':{en:'ring density',id:'kerapatan cincin'},
    'tune.ast.spd.s':{en:'orbit',id:'orbit'},

    /* kamera / HUD */
    'cam.focus.free':{en:'FOCUS · FREE',id:'FOKUS · BEBAS'},'cam.free':{en:'Free',id:'Bebas'},'cam.hint':{en:'TAP ‹ › TO FOCUS · PINCH / WHEEL · 1×–3×',id:'KETUK ‹ › UNTUK FOKUS · CUBIT / RODA · 1×–3×'},
    'cam.fact':{en:'FACT',id:'FAKTA'},
    'ls.tag':{en:'LAST SIGNAL DETECTED',id:'SINYAL TERAKHIR TERDETEKSI'},
    'sf.close':{en:'Dismiss',id:'Tutup'},
    'sf.recovered':{en:'RECOVERED · {s}',id:'DIPULIHKAN · {s}'},'sf.acquired':{en:'SIGNAL ACQUIRED',id:'SINYAL DIPEROLEH'},
    'ca.pattern':{en:'PATTERN RECOGNIZED',id:'POLA DIKENALI'},'ca.archived':{en:'{s} // ARCHIVED',id:'{s} // TERARSIP'},
    'ca.align':{en:'ALIGNMENT COMPLETE',id:'PENYELARASAN SELESAI'},'ca.unlocked':{en:'{s} // UNLOCKED',id:'{s} // TERBUKA'},
    'sect.relay':{en:'◉ relay',id:'◉ relay'},'sect.nosig':{en:'no signal yet',id:'belum ada sinyal'},
    'bh.cap':{en:'Gargantua',id:'Gargantua'},

    /* toast */
    'toast.obs':{en:'OBSERVATION MODE\nHUD OFF · LABELS OFF',id:'MODE PENGAMATAN\nHUD MATI · LABEL MATI'},
    'toast.hud':{en:'HUD RESTORED',id:'HUD KEMBALI'},
    'toast.camon':{en:'CONSTELLATION CAMERA\nTAP ‹ › TO FOCUS · PINCH / WHEEL',id:'KAMERA RASI\nKETUK ‹ › UNTUK FOKUS · CUBIT / RODA'},
    'toast.camoff':{en:'CAMERA OFF',id:'KAMERA MATI'},
    'toast.camreq':{en:'CAMERA REQUIRES\nOBSERVATION MODE',id:'KAMERA BUTUH\nMODE PENGAMATAN'},
    'toast.silence':{en:'RADIO SILENCE\nAUDIO CHANNEL CLOSED',id:'RADIO HENING\nSALURAN AUDIO DITUTUP'},
    'toast.silence.on':{en:'RADIO SILENCE\n─────────────\nAUDIO FADING OUT',id:'RADIO HENING\n─────────────\nAUDIO MEMUDAR'},
    'toast.restored':{en:'SIGNAL RESTORED\nVOLUME FADING IN',id:'SINYAL PULIH\nVOLUME NAIK PELAN'},
    'toast.unlocked':{en:'ALL SIGNALS UNLOCKED',id:'SEMUA SINYAL TERBUKA'},
    'toast.override':{en:'SYSTEM OVERRIDE · DUMUL//OBSERVATORY',id:'SISTEM DIAMBIL ALIH · DUMUL//OBSERVATORY'},
    'toast.bhsum':{en:'GARGANTUA SUMMONED',id:'GARGANTUA DIPANGGIL'},'toast.bhrec':{en:'GARGANTUA RECALLED',id:'GARGANTUA DITARIK'},
    'toast.bhsum2':{en:'GARGANTUA SUMMONED\nDRAG TO PARK ANYWHERE\nRELAY SET · OVERVIEW BH MUST BE SUMMONED TOO',id:'GARGANTUA DIPANGGIL\nSERET UNTUK DIPARKIR\nRELAY AKTIF · BH RINGKASAN JUGA HARUS DIPANGGIL'},
    'toast.norelay':{en:'NO OTHER RELAY SECTOR\nSUMMON BH IN ANOTHER SECTOR FIRST',id:'BELUM ADA SEKTOR RELAY LAIN\nPANGGIL BH DI SEKTOR LAIN DULU'},
    'toast.jump':{en:'JUMP · SECTOR {s}',id:'LOMPAT · SEKTOR {s}'},
    'toast.muff.norelay':{en:'SIGNAL MUFFLED · NO RELAY\nSUMMON BH IN THE SOURCE SECTOR AND IN OVERVIEW',id:'SINYAL TEREDAM · TANPA RELAY\nPANGGIL BH DI SEKTOR SUMBER DAN DI RINGKASAN'},
    'toast.muff.ov':{en:'SIGNAL MUFFLED · OVERVIEW BH RECALLED\nSUMMON THE OVERVIEW BH TO LINK THE RELAY',id:'SINYAL TEREDAM · BH RINGKASAN DITARIK\nPANGGIL BH RINGKASAN UNTUK MENYAMBUNG RELAY'},
    'toast.muff.sec':{en:'SIGNAL MUFFLED · SOURCE SECTOR HAS NO RELAY\nENTER IT AND SUMMON BH THERE',id:'SINYAL TEREDAM · SEKTOR SUMBER TANPA RELAY\nMASUK KE SANA DAN PANGGIL BH'},
    'toast.relay':{en:'RELAY LINKED · SIGNAL CLEAR\nRECALL EITHER BH TO MUFFLE AGAIN',id:'RELAY TERSAMBUNG · SINYAL JERNIH\nTARIK SALAH SATU BH UNTUK MEREDAM LAGI'},
    'toast.far':{en:'SIGNAL MUFFLED · SOURCE IN ANOTHER SECTOR\nRELAY THE SOURCE SECTOR FIRST, THEN SUMMON BH HERE',id:'SINYAL TEREDAM · SUMBER DI SEKTOR LAIN\nRELAY SEKTOR SUMBER DULU, LALU PANGGIL BH DI SINI'},
    'toast.norelay2':{en:'RELAY NOT LINKED · SOURCE SECTOR HAS NO RELAY\nSUMMON BH IN THE SOURCE SECTOR FIRST',id:'RELAY BELUM TERSAMBUNG · SEKTOR SUMBER TANPA RELAY\nPANGGIL BH DI SEKTOR SUMBER DULU'},
    'toast.relayhere':{en:'RELAY LINKED · SIGNAL CLEAR\nRECALL BH TO MUFFLE AGAIN',id:'RELAY TERSAMBUNG · SINYAL JERNIH\nTARIK BH UNTUK MEREDAM LAGI'},
    'toast.lock.ple':{en:'PLEIADES LOCKED\nIN CAMERA MODE: SIRIUS → ORION BELT → ALDEBARAN\nONE STRAIGHT LINE',id:'PLEIADES TERKUNCI\nDI MODE KAMERA: SIRIUS → SABUK ORION → ALDEBARAN\nSATU GARIS LURUS'},
    'toast.lock':{en:'SIGNAL LOCKED\nALIGN THE CONSTELLATION IN CAMERA MODE',id:'SINYAL TERKUNCI\nSELARASKAN RASI DI MODE KAMERA'},
    'toast.belt':{en:'PLEIADES LOCKED\nSTART AT SIRIUS · DRAW THE LINE THROUGH THE BELT',id:'PLEIADES TERKUNCI\nMULAI DARI SIRIUS · TARIK GARIS MELEWATI SABUK'},
    'toast.align':{en:'ALIGNMENT · {s}\nCONNECT THE STARS IN ORDER',id:'PENYELARASAN · {s}\nHUBUNGKAN BINTANG SECARA BERURUTAN'},
    'toast.align.ple':{en:'ALIGNMENT · PLEIADES\nSIRIUS → ORION BELT → ALDEBARAN',id:'PENYELARASAN · PLEIADES\nSIRIUS → SABUK ORION → ALDEBARAN'},
    'toast.sirius':{en:'SIRIUS LOCKED\nSHIFT FOCUS TO ORION · BELT: ALNITAK → MINTAKA',id:'SIRIUS TERKUNCI\nPINDAH FOKUS KE ORION · SABUK: ALNITAK → MINTAKA'},
    'toast.beltok':{en:'BELT LOCKED\nSHIFT CAMERA FOCUS TO TAURUS',id:'SABUK TERKUNCI\nPINDAH FOKUS KAMERA KE TAURUS'},
    'toast.timeout':{en:'ALIGNMENT TIMED OUT',id:'WAKTU PENYELARASAN HABIS'},

    /* teleskop sibuk */
    'tele.busy.1':{en:"I'm busy tracking {s}. Can't come along.",id:'Aku sibuk melacak {s}. Nggak bisa ikut.'},
    'tele.busy.2':{en:'Occupied. The signal in {s} still needs me.',id:'Lagi sibuk. Sinyal di {s} masih butuh aku.'},
    'tele.busy.3':{en:"Not now. I'm still listening to {s}.",id:'Nanti dulu. Aku masih mendengarkan {s}.'},
    'tele.busy.4':{en:'Sorry. {s} has my lens for now.',id:'Maaf. Lensaku sedang untuk {s}.'},

    /* offline banner */
    'ofl.title':{en:'> OFFLINE ARCHIVE',id:'> ARSIP OFFLINE'},
    'ofl.ask':{en:'Save all {n} tracks (~{mb} MB) so the observatory keeps playing without signal?',id:'Simpan semua {n} lagu (~{mb} MB) supaya observatorium tetap bunyi tanpa sinyal?'},
    'ofl.yes':{en:'SAVE ALL',id:'SIMPAN SEMUA'},'ofl.no':{en:'NOT NOW',id:'NANTI'},
    'ofl.sync':{en:'> SYNCING {d}/{t}',id:'> MENYINKRON {d}/{t}'},'ofl.syncNote':{en:'Runs in the background. Keep exploring.',id:'Jalan di latar belakang. Silakan lanjut menjelajah.'},
    'ofl.done':{en:'> ARCHIVE SECURED',id:'> ARSIP TERSIMPAN'},'ofl.doneNote':{en:'Offline mode ready.',id:'Mode offline siap.'},
    'ofl.part':{en:'> SYNC INTERRUPTED',id:'> SINKRON TERPUTUS'},'ofl.partNote':{en:'{d}/{t} saved. Resumes on your next visit.',id:'{d}/{t} tersimpan. Lanjut di kunjungan berikutnya.'},

    /* terminal (kalimat tetap; label kategori sengaja Inggris) */
    'term.nolnput':{en:'> NO INPUT. ALSO A RESPONSE.',id:'> TANPA INPUT. ITU JUGA JAWABAN.'},
    'term.input':{en:'> INPUT RECEIVED',id:'> INPUT DITERIMA'},
    'term.excess':{en:'> INPUT RATE: EXCESSIVE',id:'> LAJU INPUT: BERLEBIHAN'},
    'term.click':{en:'> YOU REALLY LIKE CLICKING THINGS.',id:'> KAMU SUKA BANGET NGETUK-NGETUK.'}
  };

  /* ---------- terjemahan ID untuk data (in-place). Kosong = tetap Inggris ---------- */
  var ID_TG={
    quick:['Cepat banget.','Kamu pergi. Kamu balik. Aku sadar.','Reload nggak mengubah langit.','Balik lagi secepat ini?'],
    hours:['Balik lagi hari ini.','Hari yang sama. Bintang berbeda.','Langit bergeser sedikit waktu kamu pergi.','Kamu nggak pergi lama.'],
    day:['Satu malam sudah lewat.','Sehari. Aku terus mengawasi.','Kamu pergi sehari. Bintang-bintangnya nggak.','Selamat datang kembali. Sudah sehari.'],
    days:['{d} hari. Aku menghitung.','{d} hari sunyi. Lalu kamu.','{d} hari. Lensanya tetap bersih.','{d} hari pergi. Langit nggak keberatan.'],
    weeks:['{w} minggu. Bintang nggak menunggu.','{w} minggu. Aku hampir berhenti memandang.','{w} minggu pergi. Cahayanya terus melaju.'],
    months:['{m} bulan. Halo lagi.','{m} bulan. Aku masih ingat di mana kamu berdiri.','Sudah lama sekali. Cahaya yang dulu kamu lihat sudah berlalu.'],
    night:['Kenapa belum tidur?','Sudah larut. Langit nggak keberatan.','Observatorium lebih tenang jam segini.','Semua orang tidur. Langit nggak.','Tidur sana. Bintangnya tetap di sini.','Bintang terbaik muncul saat nggak ada yang melihat.']
  };
  var ID_PROMPTS=[
    {q:'> KENAPA KAMU DI SINI?',a:['> INPUT DITERIMA','> "?"','> DITERIMA.','> KEBANYAKAN PENGAMAT MULAI DARI SEBUAH PERTANYAAN.']},
    {q:'> KAMU MASIH DI SANA?',a:['> INPUT DITERIMA','> "."','> YA. ITU CUKUP.']},
    {q:'> APA YANG KAMU LIHAT?',a:['> INPUT DITERIMA','> "..."','> MENARIK.','> AKU MELIHAT HAL YANG SAMA.']}
  ];
  /* Pesan teleskop: tempel terjemahan di sini (array string). Kosong = pakai Inggris. Bisa dicampur: item ID ditambahkan ke pool EN. */
  var ID_TELE=[
    'Halo, Teman...','Kamu kembali.','Masih menatap langit?','Hei... kamu masih di sini.','Senang melihatmu lagi.','Ada yang mendengarkan.',
    'Terima kasih sudah bertahan.','Selamat datang kembali, pengamat.','Di sini sunyi.','Jangan pedulikan aku. Aku cuma mengamati.',
    'Pengamat terdeteksi.','Siapa mengamati siapa?','Mungkin pengamatnya cuma salah satu hal yang diamati.',
    'Yakin?','Kamu sudah memeriksa pertanyaannya?','Keyakinan bukan kepastian.','Yang diketahui lebih kecil dari yang tak diketahui.',
    'Sinyal memudar. Perasaannya tidak.','Tidak semua transmisi butuh jawaban.','Mungkin glitch itu bagian dari lagunya.',
    'Sesuatu di sana masih berpendar.','Cahayanya terlambat. Tapi sampai.','Hening juga meninggalkan jejak.',
    'Aku menyelesaikan persamaannya. Jangan tanya caranya.','Tadi aku membagi dengan nol, kayaknya.','x ternyata tidak tersedia secara emosional.',
    'Burung hantu sedang mengawasi.','Siapa yang kasih burung hantu akses ke teleskop?','Alam semesta menolak berkomentar.',
    'Kamu seharusnya nggak menemukan ini.','Teleskop menyetujui.','Lanjutkan mengamati.'
  ];

  /* ---------- API ---------- */
  function T(k,v){
    var e=UI[k],s=e?(e[lang]||e.en):k,i;
    if(v)for(i in v)s=s.split('{'+i+'}').join(v[i]);
    return s;
  }
  window.T=T;
  window.I18N={lang:lang,t:T,UI:UI,
    set:function(l){try{localStorage.setItem(KEY,l);}catch(e){}location.reload();},
    toggle:function(){window.I18N.set(lang==='id'?'en':'id');}};

  /* ---------- timpa data in-place (hanya bahasa ID) ---------- */
  if(lang==='id'){
    try{
      if(window.TXT){
        TXT.TG_POOL=ID_TG;                                  /* sapaan: kunci sama, ganti penuh */
        TXT.TERM_PROMPTS=ID_PROMPTS;
        /* teleskop: ID dicampur ke pool EN supaya pool tetap besar; mau ID saja -> TXT.TELE_SCOPE_MESSAGES=ID_TELE */
        TXT.TELE_SCOPE_MESSAGES.push.apply(TXT.TELE_SCOPE_MESSAGES,ID_TELE);
      }
    }catch(e){}
  }
  /* Data sky-data.js: isi window.__SKY_ID setelah SKY dibuat (lihat i18n-sky.js nanti): {rasi:{id:{whisper:[..],info:{tag,rows:[[k,v]..],fact}}},sfx:{key:{fragment:{...}}}} */
  window.I18N.applySky=function(map){
    if(lang!=='id'||!window.SKY||!map)return;
    var id,r,m,s,k,i;
    for(id in (map.rasi||{})){r=SKY.rasiBy[id];m=map.rasi[id];if(!r)continue;
      if(m.whisper)for(i=0;i<m.whisper.length&&i<r.whisper.length;i++)if(m.whisper[i])r.whisper[i]=m.whisper[i];
      if(m.info&&r.info){if(m.info.tag)r.info.tag=m.info.tag;if(m.info.fact)r.info.fact=m.info.fact;
        if(m.info.rows)for(i=0;i<m.info.rows.length&&i<r.info.rows.length;i++)if(m.info.rows[i])r.info.rows[i]=m.info.rows[i];}}
    for(k in (map.sfx||{})){s=SKY.sfxBy[k];m=map.sfx[k];if(!s||!m.fragment)continue;
      for(i in m.fragment)if(m.fragment[i])s.fragment[i]=m.fragment[i];}
  };

  /* ---------- DOM statis ---------- */
  function applyDom(root){
    root=root||document;
    var n=root.querySelectorAll('[data-i18n]'),i,el;
    for(i=0;i<n.length;i++){el=n[i];el.textContent=T(el.getAttribute('data-i18n'));}
    n=root.querySelectorAll('[data-i18n-aria]');
    for(i=0;i<n.length;i++){el=n[i];var t=T(el.getAttribute('data-i18n-aria'));el.setAttribute('aria-label',t);el.setAttribute('title',t);}
  }
  window.I18N.apply=applyDom;
  function init(){
    document.documentElement.lang=lang;
    applyDom();
    /* tombol bahasa: dibuat di panel owl (.owl-links) tanpa edit HTML */
    var host=document.querySelector('.owl-links');
    if(host&&!document.getElementById('lang-toggle')){
      /* struktur sama persis dengan <a class="owl-link"> lain (svg langsung + <span>), jadi ukuran/gaya ikut CSS yang sama */
      var b=document.createElement('a');
      b.href='#';b.id='lang-toggle';b.className='owl-link';b.setAttribute('role','button');
      b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18"/></svg><span>'+T('lang.label')+'</span>';
      b.setAttribute('aria-label',T('lang.btn'));b.title=T('lang.btn');
      b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();window.I18N.toggle();});
      ['pointerdown','pointerup','touchstart','touchend'].forEach(function(ev){b.addEventListener(ev,function(e){e.stopPropagation();});});
      host.appendChild(b);
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
