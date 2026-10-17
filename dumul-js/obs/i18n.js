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
    'owl.tab.set':{en:'Settings',id:'Setelan'},'owl.tab.about':{en:'About',id:'Tentang'},
    'perf.chip':{en:'Perf · {m}',id:'Performa · {m}'},
    'tune.quality':{en:'Quality',id:'Kualitas'},'tune.quality.hint':{en:'HIGH = full effects. LOW = lighter for weak devices. Tap to switch, then Save.',id:'HIGH = efek penuh. LOW = lebih ringan untuk perangkat lemah. Ketuk untuk ganti, lalu Simpan.'},
    'tune.none':{en:'Nothing to tune here yet.',id:'Belum ada yang bisa disetel di sini.'},
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
    'tune.sneb':{en:'Sector sky',id:'Langit sektor'},'tune.sneb.s':{en:'tinted image strength',id:'kekuatan nebula tema'},'tune.sdim':{en:'Depth',id:'Kedalaman'},'tune.sdim.s':{en:'darken base sky',id:'gelapkan langit dasar'},
    'tune.sprd':{en:'Hue variety',id:'Variasi warna'},'tune.sprd.s':{en:'stays in sector theme',id:'tetap di tema sektor'},'tune.szf':{en:'Zoom follow',id:'Ikut zoom'},'tune.szf.s':{en:'nebula zooms with sector',id:'nebula ikut zoom sektor'},
    'tune.sub.skys':{en:'Sky // Sector Tune',id:'Langit // Setelan Sektor'},'tune.saved.skys':{en:'SECTOR SKY SAVED',id:'LANGIT SEKTOR TERSIMPAN'},
    'tune.phalo':{en:'Portal halo',id:'Halo portal'},'tune.phalo.s':{en:'dark behind ring',id:'gelap di balik cincin'},
    'tune.save':{en:'Save',id:'Simpan'},'tune.reset':{en:'Reset',id:'Atur ulang'},
    'tune.sub.sky':{en:'Sky // Overview',id:'Langit // Ringkasan'},'tune.sub.sect':{en:'Gargantua // Sector Tune',id:'Gargantua // Setelan Sektor'},'tune.sub.bh':{en:'Gargantua // Tune',id:'Gargantua // Setelan'},
    'tune.saved.sky':{en:'SKY SETTINGS SAVED',id:'SETELAN LANGIT TERSIMPAN'},'tune.saved.bh':{en:'GARGANTUA SETTINGS SAVED',id:'SETELAN GARGANTUA TERSIMPAN'},
    /* tuning panel: tab Asteroid */
    'tune.ast.tab':{en:'Asteroid',id:'Asteroid'},'tune.sub.ast':{en:'Asteroid // Tune',id:'Asteroid // Setelan'},'tune.saved.ast':{en:'ASTEROID SETTINGS SAVED',id:'SETELAN ASTEROID TERSIMPAN'},
    'tune.ast.count':{en:'Count',id:'Jumlah'},'tune.ast.count.s':{en:'rocks',id:'batu'},'tune.ast.size.s':{en:'rock scale',id:'skala batu'},
    'tune.ast.orbit':{en:'Orbit',id:'Orbit'},'tune.ast.orbit.s':{en:'width',id:'lebar'},'tune.ast.thick':{en:'Thickness',id:'Ketebalan'},'tune.ast.thick.s':{en:'ring density',id:'kerapatan cincin'},
    'tune.ast.spd.s':{en:'orbit',id:'orbit'},
    /* tuning panel: tab Tele (teleskop) */
    'tune.tele.tab':{en:'Tele',id:'Tele'},'tune.sub.tele':{en:'Telescope // Tune',id:'Teleskop // Setelan'},'tune.saved.tele':{en:'TELESCOPE SETTINGS SAVED',id:'SETELAN TELESKOP TERSIMPAN'},
    'tune.on':{en:'On',id:'Nyala'},'tune.off':{en:'Off',id:'Mati'},
    'tune.tele.go':{en:'Bring along',id:'Ajak kemana saja'},'tune.tele.bub':{en:'Bubble messages',id:'Pesan bubble'},'tune.tele.led':{en:'LED color',id:'Warna LED'},
    'tune.tele.hover':{en:'Hover',id:'Melayang'},'tune.tele.spin':{en:'Spin',id:'Putar'},
    'tune.led.0':{en:'Green',id:'Hijau'},'tune.led.1':{en:'Amber',id:'Amber'},'tune.led.2':{en:'White',id:'Putih'},'tune.led.3':{en:'Blue',id:'Biru'},'tune.led.4':{en:'Violet',id:'Ungu'},

    /* kamera / HUD */
    'cam.focus.free':{en:'FOCUS · FREE',id:'FOKUS · BEBAS'},'cam.free':{en:'Free',id:'Bebas'},'cam.hint':{en:'TAP ‹ › TO FOCUS · PINCH / WHEEL · 1×–3×',id:'KETUK ‹ › UNTUK FOKUS · CUBIT / RODA · 1×–3×'},
    'cam.fact':{en:'FACT',id:'FAKTA'},
    'ls.tag':{en:'LAST SIGNAL DETECTED',id:'SINYAL TERAKHIR TERDETEKSI'},
    'sf.close':{en:'Dismiss',id:'Tutup'},
    'sf.recovered':{en:'RECOVERED · {s}',id:'DIPULIHKAN · {s}'},'sf.acquired':{en:'SIGNAL ACQUIRED',id:'SINYAL DIPEROLEH'},
    'ca.pattern':{en:'PATTERN RECOGNIZED',id:'POLA DIKENALI'},'ca.archived':{en:'{s} // ARCHIVED',id:'{s} // TERARSIP'},
    'ca.align':{en:'ALIGNMENT COMPLETE',id:'PENYELARASAN SELESAI'},'ca.unlocked':{en:'{s} // UNLOCKED',id:'{s} // TERBUKA'},
    'sect.nosig':{en:'no signal yet',id:'belum ada sinyal'},
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
    'toast.bhlp':{en:'RETURN TO OVERVIEW\nPRESS BACK OR HOLD THE MINI BH',id:'KEMBALI KE OVERVIEW\nTEKAN BACK ATAU TAHAN BH MINI'},
    'toast.bhsumtip':{en:'MINI BH SUMMONED\nTAP IT FOR SECTOR SHORTCUTS',id:'BH MINI DIPANGGIL\nTAP UNTUK SHORTCUT ANTAR SEKTOR'},
    'toast.tx.redock':{en:'TRANSMITTER RESET\nSIGNAL MUFFLED · HOLD TELESCOPE TO RE-DOCK',id:'TRANSMITTER DIRESET\nSINYAL TEREDAM · TAHAN TELESKOP UNTUK DOCK ULANG'},
    'toast.sectip':{en:'RETURN TO OVERVIEW\nPRESS BACK OR HOLD THE MINI BH',id:'KEMBALI KE OVERVIEW\nTEKAN BACK ATAU TAHAN BH MINI'},
    'toast.nosum':{en:'SHORTCUT LOCKED\nSUMMON THE MINI BH IN THAT SECTOR FIRST',id:'SHORTCUT TERKUNCI\nPANGGIL BH MINI DI SEKTOR TUJUAN DULU'},
    'toast.tx.deploy':{en:'TRANSMITTER DOCKED\n{s}',id:'TRANSMITTER TERDOCK\n{s}'},
    'toast.tx.recall':{en:'TRANSMITTER RECALLED\n{s}',id:'TRANSMITTER DITARIK\n{s}'},
    'toast.tx.linked':{en:'TRANSMITTER LINKED\nSIGNAL CLEAR',id:'TRANSMITTER TERSAMBUNG\nSINYAL JERNIH'},
    'toast.tx.muff':{en:'SIGNAL MUFFLED\nNO TRANSMITTER · DOCK ONE IN THE SOURCE SECTOR',id:'SINYAL TEREDAM\nBELUM ADA TRANSMITTER · DOCK DI SEKTOR SUMBER'},
    'toast.tx.far':{en:'SOURCE IN ANOTHER SECTOR\nDOCK TX THERE, THEN BRING THE TELESCOPE',id:'SUMBER DI SEKTOR LAIN\nDOCK TX DI SANA, LALU AJAK TELESKOP'},
    'toast.tx.away':{en:'TRANSMITTER NEEDS THE SOURCE SECTOR\nENTER THE SECTOR PLAYING THE SIGNAL',id:'TRANSMITTER BUTUH SEKTOR SUMBER\nMASUK KE SEKTOR YANG SEDANG MEMUTAR SINYAL'},
    'toast.tx.ov':{en:'DOCK IN THE SOURCE SECTOR\nOVERVIEW NEEDS NO TRANSMITTER',id:'DOCK DI SEKTOR SUMBER\nOVERVIEW TIDAK PERLU TRANSMITTER'},
    'toast.tx.tip':{en:'HOLD THE TELESCOPE\nTO DOCK THE DRONE TRANSMITTER',id:'TAHAN TELESKOP\nUNTUK DOCK DRONE TRANSMITTER'},
    'toast.tx.tiprecv':{en:'HOLD THE TELESCOPE\nTO LINK THE RECEIVER TO THE MINI BH',id:'TAHAN TELESKOP\nUNTUK SAMBUNG RECEIVER KE BH MINI'},
    'toast.tx.needplay':{en:'PLAY A STELLAR SIGNAL FIRST\nTHEN HOLD THE TELESCOPE TO DOCK',id:'PUTAR STELLAR SIGNAL DULU\nLALU TAHAN TELESKOP UNTUK DOCK'},
    'toast.tx.strain':{en:'TELESCOPE STRAINED\nFOCUSED FAR FROM THE SOURCE SECTOR · SIGNAL DEGRADED',id:'TELESKOP TERBEBANI\nFOKUS JAUH DARI SEKTOR SUMBER · SINYAL MENURUN'},
    'toast.tx.needov':{en:'SIGNAL MUFFLED\nSUMMON THE OVERVIEW BH TO LINK THE SIGNAL',id:'SINYAL TEREDAM\nPANGGIL BH RINGKASAN UNTUK MENYAMBUNGKAN SINYAL'},
    'lis.auto':{en:'Always bring telescope',id:'Selalu ajak teleskop'},
    'lis.auto.on':{en:'TELESCOPE ALWAYS COMES ALONG\nTURN OFF IN TUNING',id:'TELESKOP SELALU IKUT\nMATIKAN DI PANEL TUNING'},
    'toast.tx.recvoff':{en:'RECEIVER UNLINKED\n{s}',id:'RECEIVER LEPAS\n{s}'},
    'toast.tx.needbh':{en:'SIGNAL MUFFLED\nSUMMON THE MINI BH HERE, THEN LINK THE RECEIVER',id:'SINYAL TEREDAM\nPANGGIL BH MINI DI SINI, LALU SAMBUNGKAN RECEIVER'},
    'toast.tx.needbhsrc':{en:'SIGNAL MUFFLED\nTHE SOURCE SECTOR\'S MINI BH IS NOT SUMMONED',id:'SINYAL TEREDAM\nBH MINI DI SEKTOR SUMBER BELUM DIPANGGIL'},
    'toast.tx.linked.rx':{en:'RECEIVER LINKED\nSIGNAL CLEAR',id:'RECEIVER TERSAMBUNG\nSINYAL JERNIH'},
    'toast.jump':{en:'JUMP TO SECTOR {s}',id:'LOMPAT KE SEKTOR {s}'},
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
    'lis.ask.q':{en:'Take the telescope along?',id:'Ajak teleskop?'},'lis.ask.bring':{en:'Bring',id:'Ajak'},'lis.ask.leave':{en:'Leave it',id:'Tinggal'},
    'lis.where.ov':{en:'OVERVIEW',id:'OVERVIEW'},'lis.where.sec':{en:'SECTOR {n}',id:'SEKTOR {n}'},
    'lis.toast.full':{en:'LOST IN SPACE\nCAMERA + SIGNAL LOCKED',id:'LOST IN SPACE\nKAMERA + SINYAL TERKUNCI'},
    'lis.toast.cam':{en:'STAR TRACKER CALIBRATING\nCAMERA LOCKED',id:'STAR TRACKER KALIBRASI\nKAMERA TERKUNCI'},
    'lis.toast.done':{en:'STAR TRACKER ONLINE\nCAMERA READY',id:'STAR TRACKER AKTIF\nKAMERA SIAP'},
    'lis.toast.left':{en:'TELESCOPE LEFT BEHIND\nIT IS IN {w}',id:'TELESKOP DITINGGAL\nADA DI {w}'},
    'lis.toast.noobs':{en:'NO OBSERVER HERE\nTELESCOPE IS IN {w}',id:'OBSERVER TIDAK ADA\nTELESKOP ADA DI {w}'},
    'lis.toast.back':{en:'TELESCOPE REUNITED\nOBSERVER ONLINE',id:'TELESKOP BERTEMU LAGI\nOBSERVER AKTIF'},
    'lis.deny.cam.gone':{en:'CAMERA OFFLINE\nTELESCOPE IS NOT HERE',id:'KAMERA MATI\nTELESKOP TIDAK ADA DI SINI'},
    'lis.deny.sig.gone':{en:'SIGNAL UNAVAILABLE\nTELESCOPE IS NOT HERE',id:'SINYAL TIDAK BISA DIPUTAR\nTELESKOP TIDAK ADA DI SINI'},
    'lis.deny.cd':{en:'STAR TRACKER RECOVERING\nTRY AGAIN IN A MOMENT',id:'STAR TRACKER BELUM PULIH\nCOBA LAGI SEBENTAR LAGI'},
    'lis.hud.full':{en:'STAR TRACKER · REACQUIRING',id:'STAR TRACKER · MENCARI POSISI'},'lis.hud.cam':{en:'CAMERA · CALIBRATING',id:'KAMERA · KALIBRASI'},
    'lis.hud.gone':{en:'NO OBSERVER · SCOPE @ {w}',id:'TANPA OBSERVER · TELESKOP @ {w}'},
    /* teleskop kehilangan arah → dikenali lagi: ditunjukkan lewat tingkah teleskop, bukan diumumkan */
    'lis.bub.start':{en:"Static... only static. Turning slowly. One familiar light. Just one. Where are you?",id:"Statis... cuma statis. Aku berputar pelan. Satu cahaya yang kukenal. Satu aja. Di mana kamu?"},
    'lis.bub.done':{en:"There. Three bright points in a row. I know that line. ...Hello again. I'm home.",id:"Itu dia. Tiga titik terang berjajar. Aku kenal garis itu. ...Halo lagi. Aku sudah di rumah."},
    /* panel pamitan (back terakhir) — dialog teleskop; Dumb Owl cuma bisa "..." */
    'exit.aria':{en:"Goodbye message",id:"Pesan perpisahan"},
    'exit.name.t':{en:"Telescope",id:"Teleskop"},'exit.name.o':{en:"Dumb Owl",id:"Dumb Owl"},
    'exit.l1':{en:"Oh... you're leaving already? Wait, just a moment. Someone asked me to pass something on to you.",id:"Eh... udah mau pergi? Tunggu sebentar. Ada titipan buat kamu."},
    'exit.l2':{en:"The Dumb Owl wanted you to know... thank you for visiting. Truly.",id:"Dumb Owl bilang... terima kasih sudah mampir. Beneran."},
    'exit.l3':{en:"...",id:"..."},
    'exit.l4':{en:"Yeah, that's all the owl can say. But I've known that owl a long time. When it goes quiet like that, it means a lot.",id:"Iya, cuma itu yang bisa dia bilang. Tapi aku kenal dia lama. Kalau dia sampai diam begitu, artinya dia senang banget."},
    'exit.l5':{en:"Every night the owl leaves the observatory lights on, just in case someone wanders in. Tonight, someone did. It was you.",id:"Tiap malam dia biarin lampu observatorium ini tetap nyala, siapa tahu ada yang mampir. Malam ini ada. Kamu."},
    'exit.l6':{en:"Come back whenever you like. The sky will be right here. So will we.",id:"Balik lagi kapan aja, ya. Langitnya tetap di sini. Kami juga."},
    'exit.stay':{en:"Stay a little longer",id:"Tinggal sebentar lagi"},'exit.leave':{en:"Sorry, I need to get going",id:"Maaf, aku harus pergi"},
    'exit.bye':{en:"Safe travels, okay? Look up sometimes. We'll be looking back.",id:"Hati-hati di jalan, ya. Sesekali lihat ke atas. Kami juga lagi lihat ke arahmu."},
    'exit.native':{en:"Press back once more to leave",id:"Tekan back sekali lagi untuk keluar"},
    'exit.stay.bub':{en:"You stayed... Thank you. The stars burn brighter with company.",id:"Kamu tetap di sini... Makasih ya. Bintang-bintang lebih terang kalau ada yang nemenin."},
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
    var host=document.getElementById('owl-sys')||document.querySelector('.owl-links');
    if(host&&!document.getElementById('lang-toggle')){
      /* struktur sama persis dengan <a class="owl-link"> lain (svg langsung + <span>), jadi ukuran/gaya ikut CSS yang sama */
      var b=document.createElement('a');
      b.href='#';b.id='lang-toggle';b.className='owl-chip';b.setAttribute('role','button');
      b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18"/></svg><span>'+T('lang.label')+'</span>';
      b.setAttribute('aria-label',T('lang.btn'));b.title=T('lang.btn');
      b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();window.I18N.toggle();});
      ['pointerdown','pointerup','touchstart','touchend'].forEach(function(ev){b.addEventListener(ev,function(e){e.stopPropagation();});});
      host.insertBefore(b,host.firstChild);   /* bahasa di kiri, performa di kanan */
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
