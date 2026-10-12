/* i18n-sky.js — terjemahan ID untuk data sky-data.js (whisper, kartu info kamera, fragment sinyal).
   Muat SETELAH sky-data.js dan i18n.js, SEBELUM js/01-core.js. Hanya aktif kalau bahasa = 'id'.
   Mengubah objek SKY IN-PLACE, jadi semua tabel turunan (FOCUS_WHISPER, FOCUS_INFO, SIGNAL_FRAGMENTS) ikut berubah.
   Nama bintang/rasi & angka sengaja tidak diterjemahkan. */
(function(){
  if(!window.I18N||I18N.lang!=='id'||!window.SKY)return;
  function R(whisper,tag,rows,fact){return {whisper:whisper,info:{tag:tag,rows:rows,fact:fact}};}
  var rasi={
    orion:R(['Sang pemburu tak pernah bergerak. Kita yang terus memandang.','Tiga bintang berjajar, dan entah bagaimana jadi sebuah cerita.'],
      'Rasi · Sang Pemburu',[['Terterang','Rigel · mag 0.13'],['Betelgeuse','~550–700 ly'],['Nebula Orion','M42 · ~1,350 ly'],['Luas','594 sq°']],
      'Betelgeuse adalah bintang maharaksasa merah yang begitu besar sampai akan menelan orbit Mars jika ditaruh di posisi Matahari.'),
    taurus:R(['Sang banteng tidak sedang menyerang. Ia hanya menunggu sangat lama.','Tujuh bersaudari menunggangi bahunya.'],
      'Rasi · Sang Banteng',[['Terterang','Aldebaran · ~65 ly'],['Gugus','Pleiades M45'],['Nebula Kepiting','M1 · ~6,500 ly'],['Luas','797 sq°']],
      'Nebula Kepiting adalah sisa supernova yang dicatat astronom Tiongkok pada tahun 1054.'),
    canis:R(['Anjing terterang di langit, dan ia tetap mengikuti.','Sirius menjawab kalau kamu cukup sabar menunggu.'],
      'Rasi · Anjing Besar',[['Terterang','Sirius · mag −1.46'],['Jarak','8.6 ly'],['Pendamping','Sirius B, katai putih'],['Luas','380 sq°']],
      'Sirius adalah bintang terterang di langit malam, sekaligus salah satu tetangga terdekat kita.'),
    pleiades:R(['Tujuh suara, satu gugus yang lembut.','Dekatkan telingamu. Mereka hanya berbisik.'],
      'Gugus terbuka · M45',[['Jarak','~444 ly'],['Usia','~100 juta tahun'],['Anggota','1,000+ bintang'],['Mata telanjang','6–7 terlihat']],
      'Cahaya biru dari bintang-bintang mudanya menerangi kabut debu di sekeliling gugus.'),
    gemini:R(['Dua saudara, satu cahaya. Mereka tak pernah meninggalkan langit musim dingin.','Castor dan Pollux masih berbagi kisah yang sama.'],
      'Rasi · Si Kembar',[['Terterang','Pollux · mag 1.14'],['Castor','sistem biner'],['Jarak','~34–52 ly'],['Luas','514 sq°']],
      'Pollux adalah raksasa oranye; Castor adalah sistem bintang majemuk yang terdiri dari enam bintang.'),
    auriga:R(['Capella menunggu di tempat kereta akan berdiri.','Satu titik hangat — sisa Auriga masih dalam perjalanan.'],
      'Rasi · Sang Kusir',[['Terterang','Capella · mag 0.08'],['Jarak','~43 ly'],['Tipe','Pasangan raksasa tipe-G'],['Luas','657 sq°']],
      'Capella adalah bintang terterang keenam di langit malam dan salah satu pilar Heksagon Musim Dingin.'),
    canmin:R(['Anjing kecil itu memegang satu lentera.','Procyon menjaga Segitiga Musim Dingin sampai garis luarnya tergambar.'],
      'Rasi · Anjing Kecil',[['Terterang','Procyon · mag 0.34'],['Jarak','~11.5 ly'],['Pendamping','katai putih'],['Luas','183 sq°']],
      'Procyon berarti “sebelum si anjing” — ia terbit mendahului Sirius.'),
    virgo:R(['Spica menyala tenang, seolah tahu sesuatu.','Musim semi tertidur di sini, terlipat dalam cahaya biru.'],
      'Rasi · Sang Dara',[['Terterang','Spica · ~250 ly'],['Peringkat','Terbesar ke-2 dari 88'],['Gugus','Virgo · ~1,300 galaksi'],['Luas','1,294 sq°']],
      'Galaksi M87 bersembunyi di sini, rumah lubang hitam pertama yang pernah difoto.'),
    bootes:R(['Sang penggembala membawa lentera bernama Arcturus.','Cahaya keemasan, lebih tua dari pertanyaannya.'],
      'Rasi · Sang Penggembala',[['Terterang','Arcturus · ~37 ly'],['Tipe','Raksasa oranye'],['Peringkat','Bintang terterang ke-4'],['Luas','907 sq°']],
      'Di dekatnya ada Void Boötes, ruang kosong selebar sekitar 330 juta tahun cahaya.'),
    ursa:R(['Beruang besar terus berjalan di langit utara.','Tujuh bintang yang mengajari kita menemukan utara.'],
      'Rasi · Beruang Besar',[['Terterang','Alioth · mag 1.77'],['Asterisme','Big Dipper'],['Jarak','~83 ly'],['Luas','1,280 sq°']],
      'Alioth adalah bintang terterang Big Dipper dan membantu menunjuk arah ke Polaris.'),
    leo:R(['Surai sang singa terbuat dari cahaya musim semi.','Denebola menandai ujung ekornya.'],
      'Rasi · Sang Singa',[['Terterang','Regulus · mag 1.40'],['Denebola','ujung ekor · mag 2.14'],['Jarak','~36 ly'],['Luas','947 sq°']],
      'Segitiga Musim Semi memakai Denebola sebagai salah satu sudutnya, bersama Arcturus dan Spica.'),
    hydra:R(['Rasi terpanjang masih merayap di langit selatan.','Alphard adalah jantung sunyi sang ular air.'],
      'Rasi · Ular Air',[['Terterang','Alphard · mag 1.98'],['Panjang','terpanjang dari 88'],['Jarak','~177 ly'],['Luas','1,303 sq°']],
      'Hydra adalah rasi terluas, membentang jauh di langit musim semi bagian selatan.'),
    scorpius:R(['Antares menyala merah, jantung yang tak pernah tenang.','Sang kalajengking menunggu di tempat langit musim panas paling pekat.'],
      'Rasi · Sang Kalajengking',[['Terterang','Antares · ~550 ly'],['Tipe','Maharaksasa merah'],['Ukuran','~700× Matahari'],['Luas','497 sq°']],
      'Antares berarti “saingan Mars”, dinamai karena pendar merahnya yang mirip.'),
    sagit:R(['Sang pemanah membidik ke pusat galaksi.','Nunki menjaga teko tetap mantap.'],
      'Rasi · Sang Pemanah',[['Terterang','Nunki · mag 2.05'],['Pusat galaksi','tersembunyi di sini'],['Jarak','~228 ly'],['Luas','867 sq°']],
      'Memandang Sagittarius berarti memandang ke arah jantung Bima Sakti.'),
    lyra:R(['Vega adalah dawai harpa yang tak pernah putus.','Musim panas dimulai saat cahaya ini kembali.'],
      'Rasi · Harpa',[['Terterang','Vega · mag 0.03'],['Jarak','25 ly'],['Peringkat','Bintang terterang ke-5'],['Luas','286 sq°']],
      'Vega adalah bintang kutub utara sekitar 12.000 SM dan akan kembali menjadi bintang kutub dalam sekitar 12.000 tahun.'),
    cygnus:R(['Sang angsa terbang menyusuri Bima Sakti.','Deneb adalah mercusuar jauh yang cahayanya masih dalam perjalanan.'],
      'Rasi · Sang Angsa',[['Terterang','Deneb · mag 1.25'],['Jarak','~2,600 ly'],['Tipe','Maharaksasa biru-putih'],['Luas','804 sq°']],
      'Deneb adalah salah satu bintang paling bercahaya yang diketahui; cahayanya berangkat saat Zaman Perunggu hampir usai.'),
    ophiuchus:R(['Sang pembawa ular berdiri di antara dua musim.','Rasalhague mengawasi dari tepi utara.'],
      'Rasi · Pembawa Ular',[['Terterang','Rasalhague · mag 2.07'],['Jarak','~49 ly'],['Zodiak','rasi ke-13'],['Luas','948 sq°']],
      'Ophiuchus adalah rasi zodiak ketiga belas yang terlupakan, yang tetap dilewati Matahari.'),
    aquila:R(['Sang elang membawa Altair melintasi segitiga musim panas.','Tiga bintang sebaris menandai penerbangannya.'],
      'Rasi · Sang Elang',[['Terterang','Altair · mag 0.76'],['Jarak','16.7 ly'],['Tipe','A7 V'],['Luas','652 sq°']],
      'Altair adalah salah satu bintang kasatmata terdekat dan berputar begitu cepat sampai gepeng di kutubnya.'),
    cassiopeia:R(['Sang ratu masih duduk di singgasananya yang miring.','W atau M — tergantung bagaimana malam berputar.'],
      'Rasi · Sang Ratu',[['Terterang','Schedar · mag 2.24'],['Bentuk','W / M'],['Jarak','~228 ly'],['Luas','598 sq°']],
      'Cassiopeia tidak pernah terbenam bagi pengamat di utara dan merupakan salah satu pola paling mudah dikenali.'),
    perseus:R(['Sang pahlawan masih membawa mata Medusa.','Algol berkedip tiap dua hari dua puluh jam.'],
      'Rasi · Sang Pahlawan',[['Terterang','Mirfak · mag 1.79'],['Algol','variabel · mag 2.1–3.4'],['Jarak','~92 ly'],['Luas','615 sq°']],
      'Algol adalah biner gerhana; kecerahannya turun saat bintang yang lebih redup lewat di depannya.'),
    aries:R(['Kepala sang domba kini tenang.','Hamal masih menunjuk jalan memasuki musim gugur.'],
      'Rasi · Sang Domba',[['Terterang','Hamal · mag 2.00'],['Jarak','~66 ly'],['Tipe','K2 III'],['Luas','441 sq°']],
      'Aries dulu menandai ekuinoks musim semi; presesi telah memindahkan titik itu ke Pisces.'),
    pegasus:R(['Kotak Besar adalah pintu musim gugur.','Alpheratz memegang sudut yang dimiliki dua kisah sekaligus.'],
      'Rasi · Kuda Bersayap',[['Terterang','Enif · mag 2.38'],['Alpheratz','dibagi dengan Andromeda'],['Jarak','~97 ly'],['Luas','1,121 sq°']],
      'Kotak Besar Pegasus adalah salah satu asterisme paling berguna untuk menemukan rasi musim gugur.'),
    pisces:R(['Dua ikan terikat oleh tali bintang-bintang samar.','Alpherg menandai simpul yang mengikat keduanya.'],
      'Rasi · Dua Ikan',[['Terterang','Alpherg · mag 3.61'],['Jarak','~350 ly'],['Zodiak','ekuinoks saat ini'],['Luas','889 sq°']],
      'Ekuinoks musim semi kini berada di Pisces, setelah bergeser dari Aries akibat presesi.')
  };

  /* fragment: [key, judul, isi, tautan]. Tag & tiga meta pertama (RA/DEC/SPEC) diambil dari data asli. */
  var F=[
    ['aldebaran','Pengikut · Mata Banteng','Penjaga oranye Taurus. Ia membuntuti Pleiades menyusuri malam — sabar, hangat, selalu selangkah di belakang para saudari.','Heksagon Musim Dingin'],
    ['betel','Raksasa Merah · Segera','Matahari sekarat yang masih bernyanyi. Denyut yang kau dengar adalah keruntuhan yang tertunda — keindahan yang diukur dalam abad-abad pendar sisa.','Segitiga Musim Dingin'],
    ['capella','Bintang Kambing · Heksagon','Penggembala terang Auriga. Raksasa ganda hangat di Heksagon Musim Dingin — cahaya jangkar sampai kereta penuh itu tiba.','Heksagon Musim Dingin'],
    ['pleione','Tujuh Bersaudari · Tepi','Suara lembut gugus di dekat Atlas. Bukan yang terterang, tapi dialah yang menjawab saat kau mendekat ke kaca.','Pleiades'],
    ['g9','Kembar · Awal Heksagon','Si kembar yang lebih terang dan sudut awal Heksagon Musim Dingin. Raksasa oranye yang menjangkarkan jalur dingin.','Heksagon Musim Dingin'],
    ['procyon','Sebelum Anjing · Segitiga','Lentera si anjing kecil. Dekat, cepat, dan satu sudut Segitiga Musim Dingin — menunggu bentuk penuh Canis Minor.','Segitiga Musim Dingin'],
    ['rigel','Maharaksasa Biru · Jangkar','Kaki sang pemburu. Cahaya dingin, bass dalam — sinyal yang tiba setelah ceritanya sudah berpindah.','Heksagon Musim Dingin'],
    ['sirius','Bintang Anjing · Terterang','Yang terdekat di antara para besar. Tajam, putih, mustahil diabaikan — salam pertama observatorium dari langit musim dingin.','Heksagon / Segitiga Musim Dingin'],
    ['alioth','Beruang · Terterang di Dipper','Cahaya terterang Beruang Besar. Titik mantap di gagang — yang mengajari para pelaut di mana utara masih menunggu.','Big Dipper / Musim Semi'],
    ['arcturus','Penjaga Beruang · Busur','Ujung emas Boötes. Ikuti lengkung gagang Dipper dan kau sampai di sini — lalu melompat ke Spica.','Segitiga Musim Semi / Busur ke Spica'],
    ['regulus','Jantung Singa · Musim Semi','Ujung sabit sekaligus jantung Leo. Satu sudut Segitiga Musim Semi — biru-putih, mantap, agung.','Segitiga Musim Semi'],
    ['spica','Biner Runcing · Panen','Dua bintang terkunci dalam orbit singkat yang terang. Duri bumi milik Virgo — ujung busur dari Arcturus.','Segitiga Musim Semi / Busur ke Spica'],
    ['aq2','Elang · Pemutar Cepat','Satu sudut Segitiga Musim Panas. Dekat, terang, dan berputar begitu cepat sampai gepeng di kutubnya.','Segitiga Musim Panas'],
    ['c1','Ekor Angsa · Jauh','Sudut terjauh Segitiga Musim Panas. Cahaya yang berangkat saat peradaban masih belajar menulis.','Segitiga Musim Panas'],
    ['y2','Harpa · Pernah Jadi Kutub','Dawai harpa musim panas. Dulu bintang kutub, dan akan jadi lagi — sudut terterang Segitiga Musim Panas.','Segitiga Musim Panas'],
    ['pg1','Sudut Kotak · Berbagi','Sudut timur laut Kotak Besar. Resminya milik Andromeda, tetap diklaim Pegasus — pintu musim gugur.','Kotak Besar']
  ];
  var sfx={};
  F.forEach(function(f){
    var s=SKY.sfxBy[f[0]];if(!s||!s.fragment)return;
    var tag=String(s.fragment.tag||'').replace(/^FRAGMENT/,'FRAGMEN');
    var meta=(s.fragment.meta||[]).slice(0,3);meta.push('TAUTAN · '+f[3]);
    sfx[f[0]]={fragment:{tag:tag,title:f[1],body:f[2],meta:meta}};
  });

  I18N.applySky({rasi:rasi,sfx:sfx});

  /* Gargantua (kartu info kamera) */
  if(SKY.bh){
    SKY.bh.whisper[0]='Semua yang ada di sini adalah pertanyaan yang tak pernah terjawab.';
    SKY.bh.whisper[1]='Bahkan cahaya berhenti sejenak untuk memikirkannya.';
    SKY.bh.info.tag='Lubang hitam supermasif · Fiksi';
    SKY.bh.info.rows=[['Sumber','Interstellar (2014)'],['Massa','~100 juta Matahari'],['Horizon','~1 AU lebarnya'],['Putaran','Nyaris maksimal (Kerr)']];
    SKY.bh.info.fact='Satu jam di dekat planet Miller setara sekitar tujuh tahun di Bumi.';
  }
})();
