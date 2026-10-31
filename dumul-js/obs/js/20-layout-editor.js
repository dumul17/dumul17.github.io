'use strict';
/* 20-layout-editor.js: layout editor rasi/portal (dipindah utuh dari 07-boot.js L357–1144, isi tidak diubah).
   LAZY: tidak ada di SHELL service-worker dan bukan <script src> biasa. index.html menyisipkan <script defer> tepat SETELAH 07-boot.js (document.write saat parsing)
   hanya kalau ?layout=1 atau localStorage.obs_layout_on=1, jadi urutan eksekusi sama seperti sebelum dipindah (sebelum 08–18, sebelum boot()).
   Saat eksekusi awal blok ini hanya butuh SKY, window, document, localStorage; semua global lain (layout, SECT, bootDone, T3D, resize, ...) baru dipakai setelah window load (waitReady).
   Ekspor ke luar: window.__layoutEditMode (juga di-set stub 07), __layOV, __scnBounds, __scnRefit, __layBack. */
(function layoutEditor(){
  var enabled=false;
  try{enabled=/[?&]layout=1\b/.test(location.search)||localStorage.getItem('obs_layout_on')==='1';}catch(e){}
  if(!enabled)return;
  window.__layoutEditMode=true;
  document.body.classList.add('layout-edit');

  var LS_KEY='obs_layout_v3';
  var sel=null,drag=null,rs=null,hud=null,info=null,ring=null,preview=false,collapsed=false,stepI=1,rq=0,dropped=false,grp=false,HIS=[],hi=-1,hFlag=false;
  var ST=[6,16,40],RT=[.5,2,5],SCF=[.01,.03,.08];
  window.__layOV=window.__layOV||{};
  try{localStorage.removeItem('obs_layout_v2');}catch(e0){}

  function hash(s){var h=5381,i;for(i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;return String(h>>>0);}
  var BASE=(function(){try{return hash(JSON.stringify({f:SKY.fit||null,r:SKY.rasi.map(function(r){return [r.id,r.scene||null,r.ple||null,r.ov||null];})}));}catch(e){return '0';}})();

  function loadSaved(){
    try{
      var raw=localStorage.getItem(LS_KEY);if(!raw)return;
      var d=JSON.parse(raw);
      if(d.base!==BASE){localStorage.removeItem(LS_KEY);dropped=true;return;}
      if(d.ov)window.__layOV=d.ov;
      if(d.fit&&d.fit.length===4)window.__scnBounds=d.fit.slice();
      SKY.rasi.forEach(function(r){
        var s=d.scene&&d.scene[r.id];if(!s)return;
        if(s.scene&&r.scene){r.scene.k=s.scene.k;r.scene.th=s.scene.th;r.scene.at=s.scene.at.slice();if(s.scene.pv)r.scene.pv=s.scene.pv.slice();}
        if(s.ple&&r.ple){r.ple.at=s.ple.at.slice();if(typeof s.ple.ps==='number')r.ple.ps=s.ple.ps;}
      });
    }catch(e){console.warn('layout load',e);}
  }
  /* Bounds fit ASLI dihitung dari data sky-data.js SEBELUM draft diterapkan. Dikunci selama edit, jadi
     menggeser anchor / memperbesar rasi nggak pernah ikut mengubah skala layar (cuma tombol FIT yang menghitung ulang). */
  /* ANCHOR_B = batas fit dihitung dari anchor sky-data.js SEKARANG (scene.at / ple.at + pad 300; dihitung sebelum draft diterapkan). SKY.fit di sky-data.js cuma angka
     tempelan Export lama: kalau anchor di sky-data diubah tapi SKY.fit tidak ikut diganti, SKY.fit jadi basi dan layout "pakai anchor lama".
     Reset (flag sekali-pakai obs_layout_fresh) memuat bounds dari ANCHOR_B, bukan SKY.fit. */
  var ANCHOR_B=null,FIT_STALE=false;
  (function(){
    var a=[1e9,-1e9,1e9,-1e9];
    function add(p){a[0]=Math.min(a[0],p[0]);a[1]=Math.max(a[1],p[0]);a[2]=Math.min(a[2],p[1]);a[3]=Math.max(a[3],p[1]);}
    SKY.rasi.forEach(function(r){if(r.off)return;if(r.scene)add(r.scene.at);else if(r.ple)add(r.ple.at);});
    if(a[0]<1e8)ANCHOR_B=[a[0]-300,a[1]+300,a[2]-300,a[3]+300];
    if(ANCHOR_B&&SKY.fit&&SKY.fit.length===4)FIT_STALE=ANCHOR_B.some(function(v,i){return Math.abs(v-SKY.fit[i])>2;});
    if(window.__scnBounds)return;
    var fresh=false;try{fresh=localStorage.getItem('obs_layout_fresh')==='1';localStorage.removeItem('obs_layout_fresh');}catch(eF){}
    if(!fresh&&SKY.fit&&SKY.fit.length===4){window.__scnBounds=SKY.fit.slice();return;}
    if(ANCHOR_B)window.__scnBounds=ANCHOR_B.slice();
  })();
  loadSaved();

  function rnd(n){return Math.round(n*1000)/1000;}
  function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
  function getOV(id){var o=window.__layOV[id];if(o)return o;var b=(SKY.rasiBy[id]||{}).ov;return {ox:(b&&b.ox)||0,oy:(b&&b.oy)||0,k:(b&&b.k)||1,th:(b&&b.th)||0};}

  function sectorIds(){
    if(!SECT.cur)return [];
    return SKY.rasi.filter(function(r){return !r.off&&r.sector===SECT.cur.k;}).map(function(r){return r.id;});
  }

  /* ==================== EDITOR BINTANG (template katalog: nama / fx / fy / r) ====================
     Tombol ★ BINTANG di HUD -> panel daftar SEMUA titik rasi yang dipilih. Edit nama (kosong = "???"), fx, fy, r lewat kolom angka,
     geser bintang langsung di kanvas (tap/geser titik saat panel terbuka), atau ←↑↓→ di HUD (menggeser bintang terpilih).
     Draft tersimpan otomatis di localStorage (kunci terpisah dari draft rasi). COPY RASI = blok bintang rasi ini, COPY UBAHAN = baris yang berubah
     di semua rasi; keduanya format sky-data.js (key & urutan tetap, baris yang berubah ditandai // *).
     Catatan: kotak batas rasi (c.minx/miny/bw/bh) DIKUNCI selama edit supaya bintang lain tidak ikut bergeser; setelah data ditempel ke sky-data.js
     dan dimuat ulang, kotak batas dihitung ulang dari data baru. fx/fy itu koordinat peta referensi (bukan 0..1). */
  var STAR_LS='obs_layout_stars_v1',STAR_ORIG={},STAR_BASE='';
  var stOnly=false,stOpen=false,stKey=null,stCid=null,stDrag=null,stPanel=null,stRing=null;
  function rnd1(n){return Math.round(n*10)/10;}
  function fmtN(v){return String(Math.round(v*100)/100);}   /* fx/fy: apa adanya sampai 2 desimal (data asli bisa 283 atau 283.5) */
  function fmtR(v){return (Math.round(v*100)/100).toFixed(2).replace(/0$/,'');}   /* r: 2.23 / 2.2 / 2.0 seperti di sky-data.js */
  function stEsc(x){return String(x).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');}
  function stApply(s,e){
    if(typeof e.fx==='number'){s.fx=e.fx;s.rx=e.fx;}
    if(typeof e.fy==='number'){s.fy=e.fy;s.ry=e.fy;}
    if(typeof e.r==='number')s.r=e.r;
    if('name' in e)stSetName(s,e.name);
  }
  /* nama PROPER vs sebutan Bayer: s.name = label tampil (proper || bayer); s._bo=1 kalau label-nya masih bayer */
  function stPn(s){return s._bo?'':(s.name||'');}
  function stSetName(s,nv){nv=nv||'';if(nv){s.name=nv;s._bo=0;}else if(s.bayer){s.name=s.bayer;s._bo=1;}else{delete s.name;s._bo=0;}}
  (function(){
    var h=[];
    SKY.cons.forEach(function(c){STAR_ORIG[c.id]={};Object.keys(c.stars).forEach(function(k){var s=c.stars[k];STAR_ORIG[c.id][k]={fx:s.fx,fy:s.fy,r:s.r,name:stPn(s)};h.push(c.id+'.'+k+'='+s.fx+','+s.fy+','+s.r+','+(s.name||''));});});
    STAR_BASE=hash(h.join('|'));
    try{
      var raw=localStorage.getItem(STAR_LS);if(!raw)return;
      var d=JSON.parse(raw);
      if(d.base!==STAR_BASE){localStorage.removeItem(STAR_LS);return;}   /* sky-data.js bintang berubah -> draft lama dibuang */
      Object.keys(d.ed||{}).forEach(function(cid){var c=cons(cid);if(!c)return;Object.keys(d.ed[cid]).forEach(function(k){var s=c.stars[k];if(s)stApply(s,d.ed[cid][k]);});});
    }catch(e){console.warn('stars load',e);}
  })();
  function stChanged(cid,k,s){var o=STAR_ORIG[cid]&&STAR_ORIG[cid][k];return !o||o.fx!==s.fx||o.fy!==s.fy||o.r!==s.r||o.name!==stPn(s);}
  function stEdits(){
    var ed={},n=0;
    CONS.forEach(function(c){Object.keys(c.stars).forEach(function(k){var s=c.stars[k];if(!stChanged(c.id,k,s))return;(ed[c.id]=ed[c.id]||{})[k]={fx:s.fx,fy:s.fy,r:s.r,name:stPn(s)};n++;});});
    return {ed:ed,n:n};
  }
  function saveStars(){
    try{var e=stEdits();if(e.n)localStorage.setItem(STAR_LS,JSON.stringify({base:STAR_BASE,ed:e.ed}));else localStorage.removeItem(STAR_LS);}catch(x){}
  }
  function stFmt(k,s,mark){
    var o=['fx:'+fmtN(s.fx),'fy:'+fmtN(s.fy),'r:'+fmtR(s.r)];
    if(s.c!==undefined)o.push("c:'"+s.c+"'");
    if(stPn(s))o.push("name:'"+String(stPn(s)).replace(/'/g,"\\'")+"'");
    if(s.bayer)o.push("bayer:'"+String(s.bayer).replace(/'/g,"\\'")+"'");
    if(typeof s.nx==='number')o.push('nx:'+s.nx);
    if(typeof s.dy==='number')o.push('dy:'+s.dy);
    if(s.specAfter!==undefined)o.push('specAfter:'+JSON.stringify(s.specAfter));
    return '   '+k+':{'+o.join(',')+'},'+(mark?'  // *':'');
  }
  function stExport(onlyChanged){
    var L=[],any=false;
    L.push(onlyChanged?'// BINTANG UBAHAN: ganti baris dengan key yang sama di stars:{...} tiap rasi di sky-data.js (key & urutan jangan diubah).'
                      :'// BINTANG '+(stCid||'').toUpperCase()+': ganti SELURUH isi stars:{...} rasi ini di sky-data.js. Baris bertanda // * = berubah dari data sekarang.');
    CONS.forEach(function(c){
      if(!onlyChanged&&c.id!==stCid)return;
      var blk=[];
      Object.keys(c.stars).forEach(function(k){var s=c.stars[k],ch=stChanged(c.id,k,s);if(onlyChanged&&!ch)return;blk.push(stFmt(k,s,ch));});
      if(blk.length){any=true;L.push('');L.push('=== '+c.id+' ===');L=L.concat(blk);}
    });
    return any?L.join('\n'):'';
  }
  function stCopy(t,msg){
    if(!t){toast('TIDAK ADA UBAHAN');return;}
    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(function(){toast(msg);}).catch(function(){prompt('Copy:',t);});
    else prompt('Copy:',t);
    console.log('[stars export]\n'+t);
  }
  /* peta linear (rx,ry)->(x,y) rasi ini (kemiripan: geser+putar+skala) lewat kuadrat terkecil; dipakai mengubah geseran layar jadi geseran fx/fy */
  function stJac(c){
    var ks=Object.keys(c.stars),n=ks.length,i,s,mx=0,my=0,mu=0,mv=0;
    if(n<2)return null;
    for(i=0;i<n;i++){s=c.stars[ks[i]];mx+=s.rx;my+=s.ry;mu+=s.x;mv+=s.y;}
    mx/=n;my/=n;mu/=n;mv/=n;
    var sxx=0,sxy=0,syy=0,a=0,b=0,cc=0,d=0,dx,dy,du,dv;
    for(i=0;i<n;i++){s=c.stars[ks[i]];dx=s.rx-mx;dy=s.ry-my;du=s.x-mu;dv=s.y-mv;sxx+=dx*dx;sxy+=dx*dy;syy+=dy*dy;a+=du*dx;b+=du*dy;cc+=dv*dx;d+=dv*dy;}
    var det=sxx*syy-sxy*sxy;if(Math.abs(det)<1e-6)return null;
    var i11=syy/det,i12=-sxy/det,i22=sxx/det;
    return [a*i11+b*i12,a*i12+b*i22,cc*i11+d*i12,cc*i12+d*i22];
  }
  function stDelta(c,dx,dy){
    var A=stJac(c);if(!A)return [dx,dy];
    var det=A[0]*A[3]-A[1]*A[2];if(Math.abs(det)<1e-9)return [dx,dy];
    return [(A[3]*dx-A[1]*dy)/det,(-A[2]*dx+A[0]*dy)/det];
  }
  function stMove(s,dr){s.fx=rnd1(s.fx+dr[0]);s.rx=s.fx;s.fy=rnd1(s.fy+dr[1]);s.ry=s.fy;}
  function stOK(){
    if(!SECT.cur){toast('MASUK SEKTOR DULU');return false;}
    if(!sel||sel==='*'){toast('PILIH SATU RASI DULU');return false;}
    if(sel==='pleiades'){toast('PLEIADES: DATA DI 02-sky-logic.js (BELUM)');return false;}
    return !!cons(sel);
  }
  function stNum(v){return typeof v==='number'?fmtN(v):'';}
  /* Saran nama IAU per rasi (dari ingatan, buat autocomplete; cek lagi ke daftar IAU WGSN kalau ragu). Nama yang sudah dipakai di rasi itu otomatis disaring. */
  var IAU_SUG={
    orion:['Betelgeuse','Rigel','Bellatrix','Mintaka','Alnilam','Alnitak','Saiph','Meissa','Hatysa','Tabit','Thabit'],
    virgo:['Spica','Vindemiatrix','Porrima','Zavijava','Zaniah','Heze','Syrma','Auva','Minelauva','Khambalia'],
    canis:['Sirius','Adhara','Wezen','Mirzam','Aludra','Furud','Muliphein','Unurgunite'],
    taurus:['Aldebaran','Alnath','Ain','Alcyone','Atlas','Electra','Maia','Merope','Taygeta','Pleione','Celaeno','Asterope','Prima Hyadum','Secunda Hyadum','Tianguan'],
    bootes:['Arcturus','Izar','Nekkar','Seginus','Muphrid','Princeps','Alkalurops','Merga'],
    scorpius:['Antares','Shaula','Sargas','Dschubba','Acrab','Lesath','Girtab','Wei','Fang','Alniyat','Larawag','Xamidimura','Paikauhale','Jabbah','Iklil'],
    gemini:['Castor','Pollux','Alhena','Wasat','Mebsuta','Mekbuda','Tejat','Propus','Alzirr','Jishui'],
    ursa:['Dubhe','Merak','Phecda','Megrez','Alioth','Mizar','Alkaid','Alcor','Alula Australis','Alula Borealis','Muscida','Talitha','Tania Borealis','Tania Australis'],
    leo:['Regulus','Denebola','Algieba','Zosma','Chertan','Adhafera','Rasalas','Algenubi','Alterf','Subra'],
    hydra:['Alphard','Ashlesha','Minchir','Zhang'],
    sagit:['Kaus Australis','Kaus Media','Kaus Borealis','Nunki','Ascella','Alnasl','Arkab Prior','Arkab Posterior','Albaldah','Polis','Rukbat','Terebellum','Ainalrami'],
    lyra:['Vega','Sheliak','Sulafat','Aladfar','Alathfar'],
    cygnus:['Deneb','Sadr','Gienah','Albireo','Fawaris','Azelfafage','Aljanah'],
    ophiuchus:['Rasalhague','Sabik','Yed Prior','Yed Posterior','Cebalrai','Marfik','Han'],
    cassiopeia:['Schedar','Caph','Navi','Ruchbah','Segin','Achird','Fulu'],
    perseus:['Mirfak','Algol','Atik','Menkib','Misam','Miram'],
    aries:['Hamal','Sheratan','Mesarthim','Botein','Bharani'],
    aquila:['Altair','Tarazed','Alshain','Okab'],
    pegasus:['Markab','Scheat','Algenib','Enif','Homam','Matar','Biham','Sadalbari','Salm','Alpheratz'],
    pisces:['Alrescha','Alpherg','Fumalsamakah','Torcular'],
    auriga:['Capella','Menkalinan','Mahasim','Hassaleh','Almaaz','Haedus','Saclateni','Prijipati'],
    canmin:['Procyon','Gomeisa']
  };
  function stIauOpts(){
    var c=cons(stCid),used={},sug=IAU_SUG[stCid]||[],h='';
    if(c)Object.keys(c.stars).forEach(function(k){var n=stPn(c.stars[k]);if(n)used[String(n).toLowerCase()]=1;});
    sug.forEach(function(n){if(!used[n.toLowerCase()])h+='<option value="'+stEsc(n)+'">';});
    return h;
  }
  /* urutan ??? : paling terang (r terbesar) dulu — bintang terang paling mungkin punya nama IAU */
  function stUnkOrder(c){
    var ks=Object.keys(c.stars),idx={};ks.forEach(function(k,i){idx[k]=i;});
    var u=ks.filter(function(k){return !stPn(c.stars[k]);});
    u.sort(function(a,b){return (c.stars[b].r-c.stars[a].r)||(idx[a]-idx[b]);});
    return u;
  }
  function stUnkN(c){var n=0,k;for(k in c.stars)if(!stPn(c.stars[k]))n++;return n;}
  function stCount(){var c=cons(stCid),el=document.getElementById('lay-sc');if(!c||!el)return;el.textContent=stUnkN(c)+'/'+Object.keys(c.stars).length+' ???';var dl=document.getElementById('lay-iau');if(dl)dl.innerHTML=stIauOpts();}
  function stRender(){
    var c=cons(stCid);if(!c||!stPanel)return;
    var ks=Object.keys(c.stars),rows='',h;
    if(stOnly){var uo=stUnkOrder(c);if(stKey&&c.stars[stKey]&&stPn(c.stars[stKey]))uo.unshift(stKey);ks=uo;}
    ks.forEach(function(k){
      var s=c.stars[k];
      if(stOnly&&stPn(s)&&k!==stKey)return;
      rows+='<div class="sr'+(k===stKey?' on':'')+(stChanged(stCid,k,s)?' ch':'')+'" data-k="'+stEsc(k)+'"><div class="sk">'+stEsc(k)+'</div>'
        +'<input class="sn" data-f="name" list="lay-iau" placeholder="'+stEsc(s.bayer||'???')+'" autocomplete="off" autocapitalize="words" enterkeyhint="next" value="'+stEsc(stPn(s))+'">'
        +'<input data-f="fx" type="number" step="1" inputmode="decimal" value="'+stNum(s.fx)+'">'
        +'<input data-f="fy" type="number" step="1" inputmode="decimal" value="'+stNum(s.fy)+'">'
        +'<input data-f="r" type="number" step="0.1" inputmode="decimal" value="'+stNum(s.r)+'"></div>';
    });
    if(!rows)rows='<div class="se">semua bintang rasi ini sudah bernama \u2713</div>';
    h='<div class="sh"><b>\u2605 '+stEsc(stCid.toUpperCase())+'</b><span class="sc" id="lay-sc"></span><span class="g"></span>'
      +'<button data-sa="only" class="'+(stOnly?'on':'')+'" title="Tampilkan hanya bintang tanpa nama">???</button>'
      +'<button data-sa="unk" title="Lompat ke bintang ??? berikutnya">\u203a???</button>'
      +'<button data-sa="copy" title="Copy semua bintang rasi ini">COPY</button>'
      +'<button data-sa="copyd" title="Copy hanya baris yang berubah">\u0394</button>'
      +'<button data-sa="rstc" title="Kembalikan rasi ini ke data sky-data.js">RST</button>'
      +'<button data-sa="x" title="Tutup">\u2715</button></div><div class="sl">'+rows+'</div><datalist id="lay-iau"></datalist>';
    stPanel.innerHTML=h;stCount();
  }
  function stNextUnk(focus){
    var c=cons(stCid);if(!c)return;
    var u=stUnkOrder(c);
    if(!u.length){toast('SEMUA BINTANG SUDAH BERNAMA');return;}
    var i0=u.indexOf(stKey),k=u[(i0+1)%u.length];   /* i0=-1 -> yang paling terang */
    if(stOnly)stRender();
    stSelect(k,true);
    if(focus){var row=stRow(k),inp=row&&row.querySelector('.sn');if(inp)inp.focus();}
  }
  function stRow(k){return stPanel&&stPanel.querySelector('.sr[data-k="'+k+'"]');}
  function stSync(k){   /* perbarui kolom satu baris tanpa merusak fokus */
    var row=stRow(k),c=cons(stCid),s=c&&c.stars[k];if(!row||!s)return;
    var f,inp,v;
    ['name','fx','fy','r'].forEach(function(f2){
      inp=row.querySelector('[data-f='+f2+']');if(!inp||document.activeElement===inp)return;
      v=f2==='name'?stPn(s):stNum(s[f2]);if(inp.value!==v)inp.value=v;
    });
    row.classList.toggle('ch',stChanged(stCid,k,s));
  }
  function stSelect(k,scroll){
    stKey=k;
    if(stPanel){[].slice.call(stPanel.querySelectorAll('.sr.on')).forEach(function(r){r.classList.remove('on');});var row=stRow(k);if(row){row.classList.add('on');if(scroll&&row.scrollIntoView)row.scrollIntoView({block:'nearest'});}}
    paintStarRing();updateInfo();
  }
  function stSet(k,f,val){
    var c=cons(stCid),s=c&&c.stars[k];if(!s)return;
    if(f==='name'){var nv=String(val).replace(/^\s+|\s+$/g,'');stSetName(s,nv);}
    else{
      var v=parseFloat(val);
      if(!isFinite(v)){stSync(k);return;}
      if(f==='r')s.r=clamp(Math.round(v*100)/100,.5,8);
      else if(f==='fx'){s.fx=rnd1(v);s.rx=s.fx;}
      else{s.fy=rnd1(v);s.ry=s.fy;}
    }
    hMark();refresh();stSync(k);stCount();
  }
  function stNudge(a){
    var c=cons(stCid),s=c&&c.stars[stKey];if(!s)return;
    var st=ST[stepI]/3,d=screenStep(a==='l'?-st:a==='r'?st:0,a==='u'?-st:a==='d'?st:0);
    stMove(s,stDelta(c,d[0],d[1]));hMark();refresh();stSync(stKey);
  }
  function stHit(cx,cy){
    var c=cons(stCid);if(!c)return null;
    var best=null,bd=28*28,k,s,p,dx,dy,dd;
    for(k in c.stars){s=c.stars[k];p=stScr(c,s);dx=p[0]-cx;dy=p[1]-cy;dd=dx*dx+dy*dy;if(dd<bd){bd=dd;best=k;}}
    return best;
  }
  function stPos(){if(!stPanel||!hud)return;var r=hud.getBoundingClientRect();stPanel.style.bottom=Math.round(innerHeight-r.top+4)+'px';}
  function paintStarRing(){
    if(!stRing)return;
    if(stOpen&&stCid!==sel){
      if(sel&&sel!=='*'&&sel!=='pleiades'&&cons(sel)){stCid=sel;stKey=null;stRender();}else stClose();
    }
    if(stPanel)stPanel.style.display=(stOpen&&!preview)?'flex':'none';
    if(stOpen&&!preview)stPos();
    stRingPos();
  }
  /* posisi layar bintang = persis rumus drawStars: gSky(x+c.ox, y+c.oy) (c.ox/oy = sway + mouse + pan, diisi tiap frame oleh drawCons) */
  function stScr(c,s){var q=gSky(s.x+(c.ox||0),s.y+(c.oy||0));return v2c(q[0],q[1]);}
  function stRingPos(){
    if(!stRing)return;
    var c=stOpen&&!preview&&stKey&&SECT.cur?cons(stCid):null,s=c&&c.stars[stKey];
    if(!s){if(stRing.style.display!=='none')stRing.style.display='none';return;}
    var p=stScr(c,s);
    stRing.style.display='block';stRing.style.transform='translate('+(p[0]-14).toFixed(1)+'px,'+(p[1]-14).toFixed(1)+'px)';
  }
  /* mode bintang aktif: semua kontrol edit rasi (grup / putar / skala / FIT / handle ukuran / geser rasi) dikunci supaya layout rasi nggak bergeser */
  function stLock(){
    document.body.classList.toggle('lay-stars-on',!!stOpen);
    if(!hud)return;
    ['grp','rotl','rotr','zoout','zoin'].forEach(function(a){var b=hud.querySelector('[data-a='+a+']');if(b)b.disabled=!!stOpen;});
    var f=hud.querySelector('#lay-menu [data-a=fit]');if(f)f.disabled=!!stOpen;
  }
  function stClose(){
    stOpen=false;stKey=null;stDrag=null;
    if(stPanel)stPanel.style.display='none';
    if(stRing)stRing.style.display='none';
    stLock();
    var b=hud&&hud.querySelector('[data-a=stars]');if(b)b.classList.remove('on');
  }
  function stToggle(){
    if(stOpen){stClose();updateInfo();return;}
    if(!stOK())return;
    stOpen=true;stCid=sel;stKey=null;stRender();
    stPanel.style.display='flex';stPos();stLock();
    var b=hud.querySelector('[data-a=stars]');if(b)b.classList.add('on');
    toast('BINTANG '+stCid.toUpperCase()+' · tap / geser titik, atau edit kolom');
  }
  function stAct(a){
    if(a==='x'){stClose();updateInfo();return;}
    if(a==='only'){stOnly=!stOnly;stRender();return;}
    if(a==='unk'){stNextUnk(true);return;}
    if(a==='copy'){stCopy(stExport(false),'COPIED ✓ blok bintang '+stCid);return;}
    if(a==='copyd'){stCopy(stExport(true),'COPIED ✓ ubahan bintang');return;}
    if(a==='rstc'){
      if(!confirm('Kembalikan semua bintang rasi '+stCid+' ke data sky-data.js?'))return;
      var c=cons(stCid);if(!c)return;
      Object.keys(c.stars).forEach(function(k){var o=STAR_ORIG[stCid]&&STAR_ORIG[stCid][k];if(o)stApply(c.stars[k],o);});
      stRender();hMark();refresh();toast('RASI '+stCid+' DIKEMBALIKAN');
    }
  }
  function buildStars(){
    if(stPanel)return;
    stPanel=document.createElement('div');stPanel.id='lay-stars';document.body.appendChild(stPanel);
    stRing=document.createElement('div');stRing.id='lay-star-ring';document.body.appendChild(stRing);
    stPanel.addEventListener('change',function(e){
      var t=e.target,f=t&&t.getAttribute&&t.getAttribute('data-f'),row=t&&t.closest&&t.closest('.sr');
      if(!f||!row)return;
      stSet(row.getAttribute('data-k'),f,t.value);
    });
    stPanel.addEventListener('focusin',function(e){var row=e.target.closest&&e.target.closest('.sr');if(row&&row.getAttribute('data-k')!==stKey)stSelect(row.getAttribute('data-k'),false);});
    stPanel.addEventListener('keydown',function(e){
      if(e.key!=='Enter')return;
      var t=e.target,row=t&&t.closest&&t.closest('.sr');
      if(!t||!row||t.getAttribute('data-f')!=='name')return;
      e.preventDefault();stSet(row.getAttribute('data-k'),'name',t.value);stNextUnk(true);
    });
    stPanel.addEventListener('click',function(e){
      var b=e.target.closest&&e.target.closest('[data-sa]');
      if(b){e.stopPropagation();stAct(b.getAttribute('data-sa'));return;}
      var row=e.target.closest&&e.target.closest('.sr');
      if(row&&e.target.tagName!=='INPUT')stSelect(row.getAttribute('data-k'),false);
    });
  }

  function snapshot(){
    var scene={};
    SKY.rasi.forEach(function(r){
      if(r.scene)scene[r.id]={scene:{k:r.scene.k,th:r.scene.th,pv:r.scene.pv?r.scene.pv.slice():null,at:r.scene.at.slice()}};
      if(r.ple){scene[r.id]=scene[r.id]||{};scene[r.id].ple={at:r.ple.at.slice(),ps:r.ple.ps};}
    });
    return {base:BASE,scene:scene,ov:JSON.parse(JSON.stringify(window.__layOV||{})),fit:window.__scnBounds?window.__scnBounds.slice():null};
  }
  function autosave(){try{localStorage.setItem(LS_KEY,JSON.stringify(snapshot()));}catch(e){}saveStars();}
  function save(){try{localStorage.setItem(LS_KEY,JSON.stringify(snapshot()));toast('SAVED ✓');}catch(e){toast('SAVE GAGAL');}}

  /* ---- UNDO / REDO: tiap aksi edit (geser, ukuran, putar, grup, bintang) = satu langkah ---- */
  function hMark(){hFlag=true;}
  function hState(){return JSON.stringify({s:snapshot(),t:stEdits().ed});}
  function hCommit(){
    var t=hState();
    if(hi>=0&&HIS[hi]===t)return;
    HIS.length=hi+1;HIS.push(t);
    if(HIS.length>120){HIS.shift();}
    hi=HIS.length-1;hBtn();
  }
  function hBtn(){
    if(!hud)return;
    var u=hud.querySelector('[data-a=undo]'),r=hud.querySelector('[data-a=redo]');
    if(u)u.disabled=hi<=0;if(r)r.disabled=hi>=HIS.length-1;
  }
  function applySnap(d){
    window.__layOV=d.ov?JSON.parse(JSON.stringify(d.ov)):{};
    if(d.fit&&d.fit.length===4)window.__scnBounds=d.fit.slice();
    SKY.rasi.forEach(function(r){
      var s=d.scene&&d.scene[r.id];if(!s)return;
      if(s.scene&&r.scene){r.scene.k=s.scene.k;r.scene.th=s.scene.th;r.scene.at=s.scene.at.slice();if(s.scene.pv)r.scene.pv=s.scene.pv.slice();}
      if(s.ple&&r.ple){r.ple.at=s.ple.at.slice();if(typeof s.ple.ps==='number')r.ple.ps=s.ple.ps;}
    });
  }
  function applyStars(ed){
    CONS.forEach(function(c){var o=STAR_ORIG[c.id];if(!o)return;Object.keys(c.stars).forEach(function(k){if(o[k])stApply(c.stars[k],o[k]);});});
    Object.keys(ed||{}).forEach(function(cid){var c=cons(cid);if(!c)return;Object.keys(ed[cid]).forEach(function(k){var s=c.stars[k];if(s)stApply(s,ed[cid][k]);});});
  }
  function hGo(d){
    var j=hi+d;
    if(j<0||j>=HIS.length){toast(d<0?'TIDAK ADA YANG DI-UNDO':'TIDAK ADA YANG DI-REDO');return;}
    hi=j;
    var o=JSON.parse(HIS[hi]);
    applySnap(o.s);applyStars(o.t);
    if(stOpen){var c=cons(stCid);if(stKey&&!(c&&c.stars[stKey]))stKey=null;stRender();}
    hBtn();hFlag=false;refresh();toast((d<0?'UNDO':'REDO')+' \u2713  '+(hi)+'/'+(HIS.length-1));
  }
  function closeMenu(){var m=document.getElementById('lay-menu');if(m)m.classList.remove('open');}
  function goHome(){   /* keluar mode layout -> situs live (draft tetap tersimpan) */
    try{autosave();localStorage.removeItem('obs_layout_on');}catch(e){}
    location.href=location.pathname;
  }

  function exportText(){
    var L=[],b=window.__scnBounds;
    L.push('// Tempel ke sky-data.js: GANTI baris scene:/ple:/ov: lama di rasi yang sama (jangan dobel).');
    if(b)L.push('// Taruh di paling bawah sky-data.js (setelah SKY dibuat):\nSKY.fit=['+b.map(rnd).join(',')+'];');
    ['winter','spring','summer','autumn'].forEach(function(sec){
      var blk=[];
      SKY.rasi.forEach(function(r){
        if(r.sector!==sec||r.off)return;
        if(r.scene)blk.push(r.id+'  scene:{k:'+rnd(r.scene.k)+', th:'+rnd(r.scene.th)+', pv:['+(r.scene.pv?r.scene.pv.map(rnd).join(','):'')+'], at:['+r.scene.at.map(rnd).join(',')+']}');
        else if(r.ple)blk.push(r.id+'  ple:{at:['+r.ple.at.map(rnd).join(',')+'], ps:'+rnd(r.ple.ps)+'}');
        else{var o=getOV(r.id);if(r.ov||o.ox||o.oy||o.k!==1||o.th)blk.push(r.id+'  ov:{ox:'+rnd(o.ox)+', oy:'+rnd(o.oy)+', k:'+rnd(o.k)+', th:'+rnd(o.th)+'}');}
      });
      if(blk.length){L.push('');L.push('=== '+sec.toUpperCase()+' ===');L=L.concat(blk);}
    });
    return L.join('\n');
  }

  function toast(msg){
    if(!info)return;
    info.textContent=msg;info.style.color='#fff';toast._u=Date.now()+1500;
    clearTimeout(toast._t);toast._t=setTimeout(function(){toast._u=0;if(info)info.style.color='';updateInfo();},1500);
  }
  function updateInfo(){
    if(!info)return;
    if(Date.now()<(toast._u||0))return;   /* toast lagi tampil: jangan ditimpa */
    if(stOpen&&stKey&&sel&&sel!=='*'){var sc=cons(stCid),ss=sc&&sc.stars[stKey];if(ss){info.textContent=stCid+' \u00b7 '+stKey+' '+(stPn(ss)||(ss.bayer?'('+ss.bayer+')':'???'))+' \u00b7 fx'+stNum(ss.fx)+' fy'+stNum(ss.fy)+' r'+stNum(ss.r);return;}}
    var sec=SECT.cur?SECT.cur.k.toUpperCase():'OVERVIEW';
    if(!SECT.cur){info.textContent='OVERVIEW \u00b7 tap sektor untuk masuk';return;}
    if(sel==='*'){info.textContent='GRUP '+sec+' \u00b7 '+sectorIds().length+' rasi \u00b7 geser = semua';return;}
    if(!sel){info.textContent=sec+' \u00b7 tap rasi'+(dropped?' \u00b7 draft lama dibuang':'');return;}
    var r=SKY.rasiBy[sel],t;
    if(r.scene)t='k'+rnd(r.scene.k)+' \u03b8'+rnd(r.scene.th)+' @'+r.scene.at.map(rnd);
    else if(r.ple)t='ps'+rnd(r.ple.ps)+' @'+r.ple.at.map(rnd);
    else{var o=getOV(sel);t='x'+rnd(o.ox)+' y'+rnd(o.oy)+' k'+rnd(o.k)+' \u03b8'+rnd(o.th);}
    info.textContent=sec+' \u00b7 '+sel+' \u00b7 '+t;
  }

  /* ---- koordinat: client (layar) <-> world (ruang layout) — ikut stage-rotate, zoom sektor, pan ---- */
  function v2w(cx,cy){
    var v=c2v(cx,cy),z=skyZoom||1,mx=W*.5,my=H*.5,dx=(v[0]-mx)/z,dy=(v[1]-my)/z;
    if(skyRot*skyRot>=1e-8){var c=Math.cos(-skyRot),s=Math.sin(-skyRot),rx=dx*c-dy*s,ry=dx*s+dy*c;dx=rx;dy=ry;}
    return [mx+dx-skyPan.x,my+dy-skyPan.y];
  }
  function w2c(x,y){var t=skyXF(x+skyPan.x,y+skyPan.y);return v2c(t[0],t[1]);}
  function selRect(id){
    if(id==='*'){ /* GRUP: gabungan kotak semua rasi di sektor aktif */
      var u=null;
      sectorIds().forEach(function(i2){var q=selRect(i2);if(!q)return;u=u?[Math.min(u[0],q[0]),Math.min(u[1],q[1]),Math.max(u[2],q[2]),Math.max(u[3],q[3])]:q.slice();});
      return u;
    }
    if(id==='pleiades'&&PLEIADES.ready){var s=PLEIADES.scale,cx=PLEIADES.x+.53*s,cy=PLEIADES.y+.42*s;return [cx-.4*s,cy-.32*s,cx+.4*s,cy+.32*s];}
    var c=cons(id);if(!c||c.minX==null||c.minX>1e8)return null;
    return [c.minX,c.minY,c.maxX,c.maxY];
  }
  function hitCons(cx,cy){
    if(grp){
      var gr=selRect('*');if(!gr)return null;
      var gw=v2w(cx,cy),gp=18/(skyZoom||1);
      return (gw[0]>=gr[0]-gp&&gw[0]<=gr[2]+gp&&gw[1]>=gr[1]-gp&&gw[1]<=gr[3]+gp)?'*':null;
    }
    var w=v2w(cx,cy),pad=18/(skyZoom||1),best=null,ba=1e18;
    sectorIds().forEach(function(id){
      var r=selRect(id);if(!r)return;
      if(w[0]<r[0]-pad||w[0]>r[2]+pad||w[1]<r[1]-pad||w[1]>r[3]+pad)return;
      var a=(r[2]-r[0]+2*pad)*(r[3]-r[1]+2*pad);
      if(id===sel)a*=.5; /* rasi yang lagi dipilih menang kalau tumpang tindih */
      if(a<ba){ba=a;best=id;}
    });
    return best;
  }
  function ringBox(id){
    var r=selRect(id);if(!r)return null;
    var P=[w2c(r[0],r[1]),w2c(r[2],r[1]),w2c(r[2],r[3]),w2c(r[0],r[3])],x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
    P.forEach(function(p){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1]);});
    return [x0-8,y0-8,x1+8,y1+8];
  }
  function paintSel(){
    paintStarRing();
    if(!ring)return;
    if(preview||!sel||!SECT.cur){ring.style.display='none';return;}
    var b=ringBox(sel);if(!b){ring.style.display='none';return;}
    ring.style.display='block';
    ring.style.left=b[0]+'px';ring.style.top=b[1]+'px';
    ring.style.width=Math.max(34,b[2]-b[0])+'px';ring.style.height=Math.max(34,b[3]-b[1])+'px';
  }

  /* ---- operasi edit ---- */
  /* ---- EDIT GRUP: geser / putar / skala semua rasi di sektor sekaligus (susunan relatif tetap) ---- */
  function gSnap(){
    var S={G:null,fit:window.__scnFit?{fs:window.__scnFit.fs,offx:window.__scnFit.offx,offy:window.__scnFit.offy}:null,items:[]},r0=selRect('*');
    if(r0)S.G=[(r0[0]+r0[2])/2,(r0[1]+r0[3])/2];
    sectorIds().forEach(function(id){
      var r=SKY.rasiBy[id];
      if(r.scene)S.items.push({id:id,t:'s',at:r.scene.at.slice(),k:r.scene.k,th:r.scene.th});
      else if(r.ple)S.items.push({id:id,t:'p',at:r.ple.at.slice(),ps:r.ple.ps});
      else{
        var o=getOV(id),pv=window.__ovPivot&&window.__ovPivot[id];
        if(!pv){var c=cons(id);pv=(c&&c.minX<1e8)?[(c.minX+c.maxX)/2,(c.minY+c.maxY)/2]:[0,0];}
        S.items.push({id:id,t:'o',o:{ox:o.ox,oy:o.oy,k:o.k,th:o.th},pv:pv.slice()});
      }
    });
    return S;
  }
  function gApply(S,f,thDeg,dwx,dwy){
    if(!S||!S.G)return;
    var t=thDeg*Math.PI/180,cs=Math.cos(t)*f,sn=Math.sin(t)*f,G=S.G,fit=S.fit;
    function tw(px,py){var x=px-G[0],y=py-G[1];return [G[0]+cs*x-sn*y+dwx,G[1]+sn*x+cs*y+dwy];}
    S.items.forEach(function(it){
      var r=SKY.rasiBy[it.id];
      if(it.t==='o'){
        var N=tw(it.pv[0]+it.o.ox,it.pv[1]+it.o.oy);
        window.__layOV[it.id]={ox:N[0]-it.pv[0],oy:N[1]-it.pv[1],k:clamp(it.o.k*f,.05,12),th:it.o.th+thDeg};
      }else if(fit&&fit.fs){
        var N2=tw(fit.offx+it.at[0]*fit.fs,fit.offy+it.at[1]*fit.fs),at=[(N2[0]-fit.offx)/fit.fs,(N2[1]-fit.offy)/fit.fs];
        if(it.t==='s'){r.scene.at=at;r.scene.k=clamp(it.k*f,.05,20);r.scene.th=it.th+thDeg;}
        else{r.ple.at=at;r.ple.ps=clamp(it.ps*f,8,3000);}
      }
    });
  }

  function moveW(id,dx,dy){
    if(id==='*'){sectorIds().forEach(function(i2){moveW(i2,dx,dy);});return;}
    var r=SKY.rasiBy[id];if(!r)return;
    if(r.scene||r.ple){var f=(window.__scnFit&&window.__scnFit.fs)||1,at=(r.scene||r.ple).at;at[0]+=dx/f;at[1]+=dy/f;}
    else{var o=getOV(id);o.ox+=dx;o.oy+=dy;window.__layOV[id]=o;}
  }
  function setScale(id,abs){
    var r=SKY.rasiBy[id];if(!r)return;
    if(r.scene)r.scene.k=clamp(abs,.05,10);
    else if(r.ple)r.ple.ps=clamp(abs,8,1500);
    else{var o=getOV(id);o.k=clamp(abs,.2,6);window.__layOV[id]=o;}
  }
  function getScale(id){var r=SKY.rasiBy[id];return r.scene?r.scene.k:r.ple?r.ple.ps:getOV(id).k;}
  function rotateBy(id,d){
    var r=SKY.rasiBy[id];if(!r)return;
    if(r.scene)r.scene.th+=d;
    else if(r.ple){toast('PLEIADES NGGAK BISA DIPUTAR');return;}
    else{var o=getOV(id);o.th+=d;window.__layOV[id]=o;}
  }
  function refresh(){
    if(rq)return;
    rq=requestAnimationFrame(function(){rq=0;try{layout();}catch(e){console.warn(e);}updateInfo();paintSel();autosave();if(hFlag){hFlag=false;hCommit();}});
  }
  function screenStep(dcx,dcy){ /* geser sebesar (dcx,dcy) px LAYAR, diterjemahkan ke world */
    var a=v2w(innerWidth/2,innerHeight/2),b=v2w(innerWidth/2+dcx,innerHeight/2+dcy);
    return [b[0]-a[0],b[1]-a[1]];
  }

  function setPreview(on){
    preview=!!on;
    window.__layoutEditMode=!preview;
    document.body.classList.toggle('layout-edit',!preview);
    document.body.classList.toggle('layout-preview',preview);
    if(hud)hud.style.display=preview?'none':'';
    var fab=document.getElementById('lay-fab');if(fab)fab.style.display=preview?'block':'none';
    drag=null;rs=null;paintSel();
    if(preview)autosave();
    try{layout();}catch(e){}
  }

  function act(a){
    if(a!=='menu')closeMenu();
    if(stOpen&&(a==='rotl'||a==='rotr'||a==='zoout'||a==='zoin'||a==='grp'||a==='fit')){toast('MODE BINTANG: edit rasi dikunci');return;}
    if(stOpen&&(a==='l'||a==='r'||a==='u'||a==='d')){if(stKey)stNudge(a);else toast('PILIH BINTANG DULU (tap titik / baris)');return;}   /* panah = geser BINTANG, tidak pernah geser rasi */
    if(a==='home'){goHome();return;}
    if(a==='menu'){var mn=document.getElementById('lay-menu');if(mn)mn.classList.toggle('open');return;}
    if(a==='undo'){hGo(-1);return;}
    if(a==='redo'){hGo(1);return;}
    if(a==='edit'||a==='preview'){setPreview(a==='preview'?true:false);return;}
    if(a==='save'){save();return;}
    if(a==='stars'){stToggle();return;}
    if(a==='copy'){
      var t=exportText();
      if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(function(){toast('COPIED ✓ (tempel ke sky-data.js)');}).catch(function(){prompt('Copy:',t);});
      else prompt('Copy:',t);
      console.log('[layout export]\n'+t);return;
    }
    if(a==='tune'){   /* copy semua setelan tuning 3D (Planet / Drone / Portal / Sky) dari 18-tune3d.js */
      var tt=(typeof T3D!=='undefined'&&T3D.exportAll)?T3D.exportAll():'';
      if(!tt){toast('TUNE3D BELUM SIAP');return;}
      if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(tt).then(function(){toast('COPIED \u2713 semua setelan tuning');}).catch(function(){prompt('Copy:',tt);});
      else prompt('Copy:',tt);
      console.log('[tune3d export]\n'+tt);return;
    }
    if(a==='fit'){
      window.__scnRefit=true;hMark();refresh();toast('FIT ULANG dari anchor');
      setTimeout(function(){try{var b=window.__scnBounds;if(b){console.log('[layout] FIT ULANG: SKY.fit=['+b.map(rnd).join(',')+']'+(SKY.fit?'  (sky-data.js sekarang: ['+SKY.fit.map(rnd).join(',')+'])':''));toast('FIT \u2713 SKY.fit=['+b.map(rnd).join(',')+']');}}catch(eFt){}},400);
      return;
    }
    if(a==='rst'){
      if(!confirm('Buang draft layout & muat ulang dari sky-data.js?'))return;
      try{localStorage.removeItem(LS_KEY);localStorage.removeItem(STAR_LS);localStorage.setItem('obs_layout_fresh','1');}catch(e){}   /* fresh: bounds dari anchor sky-data, bukan SKY.fit lama */
      window.__layOV={};window.__scnBounds=null;location.reload();return;
    }
    if(a==='collapse'){collapsed=!collapsed;hud.classList.toggle('col',collapsed);stPos();return;}
    if(a==='step'){stepI=(stepI+1)%3;var sb=hud.querySelector('[data-a=step]');if(sb)sb.textContent='S'+(stepI+1);return;}
    if(a==='ovw'){if(SECT.cur&&!SECT.busy){sel=null;sectToggle();}else toast(SECT.cur?'TUNGGU ANIMASI':'SUDAH DI OVERVIEW');return;}
    if(a==='grp'){
      grp=!grp;sel=grp?'*':null;
      var gb=hud.querySelector('[data-a=grp]');if(gb)gb.classList.toggle('on',grp);
      updateInfo();paintSel();toast(grp?'MODE GRUP: semua rasi sektor':'MODE SATUAN');return;
    }
    if(a==='prev'||a==='next'){
      if(grp){toast('MATIKAN GRUP DULU');return;}
      var ids=sectorIds();if(!ids.length){toast('MASUK SEKTOR DULU');return;}
      var i=ids.indexOf(sel);if(i<0)i=a==='next'?-1:0;
      i=a==='next'?(i+1)%ids.length:(i-1+ids.length)%ids.length;
      sel=ids[i];updateInfo();paintSel();return;
    }
    if(!sel){toast('PILIH RASI DULU');return;}
    if(stOpen&&stKey&&(a==='l'||a==='r'||a==='u'||a==='d')){stNudge(a);return;}   /* panel bintang terbuka + bintang terpilih: panah menggeser bintang */
    if(a==='l'||a==='r'||a==='u'||a==='d'){
      var s=ST[stepI],d=screenStep(a==='l'?-s:a==='r'?s:0,a==='u'?-s:a==='d'?s:0);
      moveW(sel,d[0],d[1]);hMark();refresh();return;
    }
    if(sel==='*'){
      var sn0=gSnap();
      if(a==='rotl')gApply(sn0,1,-RT[stepI],0,0);
      else if(a==='rotr')gApply(sn0,1,RT[stepI],0,0);
      else if(a==='zoout')gApply(sn0,1-SCF[stepI]*2,0,0,0);
      else if(a==='zoin')gApply(sn0,1+SCF[stepI]*2,0,0,0);
      hMark();refresh();return;
    }
    if(a==='rotl'){rotateBy(sel,-RT[stepI]);hMark();refresh();return;}
    if(a==='rotr'){rotateBy(sel,RT[stepI]);hMark();refresh();return;}
    if(a==='zoout'){setScale(sel,getScale(sel)*(1-SCF[stepI]*2));hMark();refresh();return;}
    if(a==='zoin'){setScale(sel,getScale(sel)*(1+SCF[stepI]*2));hMark();refresh();return;}
  }

  window.__layBack=function(){if(SECT.cur&&!SECT.busy){sel=null;try{updateInfo();paintSel();}catch(e){}sectToggle();}};
  function inUI(e){return e.target&&e.target.closest&&e.target.closest('#lay-hud,#lay-fab,#lay-stars');}

  function build(){
    if(hud)return;
    var css=[
      /* ===== dock: 2 baris ikon, transparan, nggak menutupi langit ===== */
      '#lay-hud{position:fixed;left:0;right:0;margin:0 auto;bottom:calc(6px + env(safe-area-inset-bottom,0px));width:min(calc(100vw - 12px),348px);box-sizing:border-box;z-index:99999;font:10px/1.2 Courier New,monospace;color:#cfeffa;background:rgba(2,8,13,.8);border:1px solid rgba(110,229,255,.28);border-radius:8px;padding:3px;touch-action:manipulation}',
      '#lay-hud #lay-info{font-size:9px;height:12px;line-height:12px;color:rgba(207,239,250,.85);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:0 2px 2px}',
      '#lay-hud .rw{display:grid;grid-template-columns:repeat(10,1fr);gap:3px}',
      '#lay-hud .rw+.rw{margin-top:3px}',
      '#lay-hud button,#lay-fab{height:30px;min-width:0;padding:0;display:grid;place-items:center;border:1px solid rgba(110,229,255,.32);border-radius:5px;background:rgba(110,229,255,.07);color:#6ee5ff;font:700 10px Courier New,monospace;-webkit-tap-highlight-color:transparent}',
      '#lay-hud button svg,#lay-fab svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round;pointer-events:none}',
      '#lay-hud button:active,#lay-fab:active{background:rgba(110,229,255,.3)}',
      '#lay-hud button:disabled{opacity:.28}',
      '#lay-hud .a{border-color:rgba(255,154,217,.55);color:#ff9ad9}',
      '#lay-hud .p{border-color:rgba(130,255,170,.55);color:#8dffb0}',
      '#lay-hud .on{background:rgba(255,154,217,.35);color:#fff}',
      '#lay-hud.col [data-a=collapse] svg{transform:rotate(180deg)}',
      '#lay-menu{display:none;position:absolute;right:0;bottom:calc(100% + 4px);flex-direction:column;gap:3px;padding:4px;background:rgba(2,8,13,.96);border:1px solid rgba(110,229,255,.3);border-radius:8px}',
      '#lay-menu.open{display:flex}',
      '#lay-hud #lay-menu button{height:28px;padding:0 14px;display:block;text-align:left;white-space:nowrap}',
      /* ciut: sisa ikon penting saja */
      '#lay-hud.col{width:fit-content;max-width:calc(100vw - 12px)}',
      '#lay-hud.col #lay-info,#lay-hud.col .ra{display:none}',
      '#lay-hud.col .rn{display:flex}',
      '#lay-hud.col .rn button:not(.k){display:none}',
      '#lay-hud.col .rn button.k{width:30px}',
      '#lay-fab{position:fixed;top:calc(16px + env(safe-area-inset-top,0px));right:60px;z-index:30;display:none;width:auto;padding:0 9px;line-height:28px;background:rgba(2,8,13,.85)}',
      'body.owl-open #lay-fab{display:none!important}',
      '#lay-sel{position:fixed;pointer-events:none;z-index:99990;border:1.5px dashed rgba(110,229,255,.85);border-radius:4px;box-shadow:0 0 10px rgba(110,229,255,.25);display:none}',
      '#lay-hdl{position:absolute;right:-14px;bottom:-14px;width:32px;height:32px;pointer-events:auto;touch-action:none;display:flex;align-items:flex-end;justify-content:flex-end;color:#6ee5ff;font-size:20px;line-height:1}',
      '#lay-hdl i{display:block;width:22px;height:22px;background:rgba(2,8,13,.9);border:1.5px solid #6ee5ff;border-radius:5px;text-align:center;font-style:normal;font-size:14px;line-height:21px}',
      /* ===== panel bintang: kompak, daftar bisa discroll ===== */
      '#lay-stars{position:fixed;left:0;right:0;margin:0 auto;width:min(calc(100vw - 12px),348px);box-sizing:border-box;bottom:110px;z-index:99998;max-height:min(30vh,200px);display:none;flex-direction:column;font:10px/1.2 Courier New,monospace;color:#cfeffa;background:rgba(2,8,13,.88);border:1px solid rgba(110,229,255,.3);border-radius:8px;padding:3px}',
      '#lay-stars .sh{display:flex;gap:3px;align-items:center;flex:0 0 auto;margin-bottom:3px}',
      '#lay-stars .sh b{font-size:10px;color:#6ee5ff;letter-spacing:.05em;white-space:nowrap}',
      '#lay-stars .sh .sc{font-size:9px;color:#ff9ad9;white-space:nowrap;margin-left:2px}',
      '#lay-stars .sh .g{flex:1}',
      '#lay-stars .sh button{height:22px;min-width:22px;padding:0 5px;border:1px solid rgba(255,154,217,.5);border-radius:4px;background:rgba(255,154,217,.07);color:#ff9ad9;font:700 9px Courier New,monospace;-webkit-tap-highlight-color:transparent}',
      '#lay-stars .sh button.on{background:rgba(255,154,217,.35);color:#fff}',
      '#lay-stars .sl{flex:1 1 auto;min-height:0;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;touch-action:pan-y}',
      '#lay-stars .se{padding:8px 4px;font-size:9px;color:rgba(207,239,250,.6)}',
      '#lay-stars .sr{display:grid;grid-template-columns:30px minmax(0,1fr) 44px 44px 32px;gap:3px;align-items:center;padding:2px 1px;border-bottom:1px solid rgba(110,229,255,.07)}',
      '#lay-stars .sr.on{background:rgba(255,154,217,.18)}',
      '#lay-stars .sr.ch .sk{color:#8dffb0}',
      '#lay-stars .sk{font-size:9px;color:rgba(207,239,250,.65);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '#lay-stars input{width:100%;min-width:0;box-sizing:border-box;height:24px;padding:0 3px;border:1px solid rgba(110,229,255,.28);border-radius:4px;background:rgba(110,229,255,.06);color:#eafcff;font:10px Courier New,monospace;-webkit-appearance:none;appearance:none;-moz-appearance:textfield}',
      '#lay-stars input::-webkit-inner-spin-button,#lay-stars input::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}',
      '#lay-stars input.sn::placeholder{color:#ff9ad9;opacity:.75}',
      '#lay-stars input:focus{outline:1px solid #ff9ad9}',
      '#lay-star-ring{position:fixed;left:0;top:0;will-change:transform;width:28px;height:28px;box-sizing:border-box;border:2px solid #ff9ad9;border-radius:50%;pointer-events:none;z-index:99991;display:none;box-shadow:0 0 10px rgba(255,154,217,.6)}',
      /* ===== HP landscape: dock jadi kolom di tepi kanan, panel bintang di kiri ===== */
      '@media (orientation:landscape) and (max-height:560px){',
      '#lay-hud{left:auto;right:calc(6px + env(safe-area-inset-right,0px));bottom:6px;margin:0;width:auto;display:grid;grid-template-columns:repeat(4,30px);gap:3px;max-height:calc(100vh - 12px)}',
      '#lay-hud .rw{display:contents}',
      '#lay-hud .rw+.rw{margin:0}',
      '#lay-hud #lay-info{position:fixed;left:8px;bottom:6px;right:auto;max-width:48vw;height:auto;padding:2px 6px;background:rgba(2,8,13,.7);border-radius:4px;pointer-events:none}',
      '#lay-hud #lay-menu{right:calc(100% + 4px);bottom:0}',
      '#lay-hud.col{display:flex}',
      '#lay-stars{left:6px;right:auto;margin:0;width:min(52vw,340px);bottom:30px!important;max-height:calc(100vh - 60px)}',
      '}',
      'body.lay-stars-on #lay-hdl{display:none!important}',
      'body.layout-edit,body.layout-edit canvas{touch-action:none}',
      /* sembunyikan panel/tombol live yang nggak relevan buat edit (header, portal sektor, langit tetap sama seperti live) */
      'body.layout-edit #mode-cluster,body.layout-edit #mode-sectors,body.layout-edit #mode-observe,body.layout-edit #mode-camera,body.layout-edit #mode-bh,body.layout-edit #cam-cluster,body.layout-edit #obs-btn,body.layout-edit #cam-btn,body.layout-edit #music-player,body.layout-edit #zoom-cluster,body.layout-edit .mp-wrap,body.layout-edit #owl-source,body.layout-edit #cf-bar,body.layout-edit #cam-whisper,body.layout-edit [id$="-fx"]{display:none!important;pointer-events:none!important}',
      'body.layout-edit #bh,body.layout-edit #cap-bh{pointer-events:none!important}'
    ].join('');
    var st=document.createElement('style');st.id='lay-style';st.textContent=css;document.head.appendChild(st);
    hud=document.createElement('div');hud.id='lay-hud';
    function ic(d,w){return '<svg viewBox="0 0 24 24" aria-hidden="true"'+(w?' style="stroke-width:'+w+'"':'')+'><path d="'+d+'"/></svg>';}
    function B(a,d,cls,title,w){return '<button type="button" data-a="'+a+'"'+(cls?' class="'+cls+'"':'')+' title="'+title+'" aria-label="'+title+'">'+ic(d,w)+'</button>';}
    hud.innerHTML=
      '<div id="lay-info"></div>'+
      '<div class="rw rn">'+
        B('home','M3.5 11 L12 4 L20.5 11 M5.5 9.5 V20 H10 V14 H14 V20 H18.5 V9.5','','Home: keluar mode layout (draft tersimpan)')+
        B('ovw','M8 12 a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0 M2 12 C2 9.5 6.5 7.5 12 7.5 S22 9.5 22 12 S17.5 16.5 12 16.5 S2 14.5 2 12','k','Overview (keluar sektor)')+
        B('prev','M15 5 L8 12 L15 19','','Rasi sebelumnya')+
        B('next','M9 5 L16 12 L9 19','','Rasi berikutnya')+
        B('grp','M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 13h7v7h-7z','','Edit grup: semua rasi di sektor')+
        B('stars','M12 3.5 L14.6 9.3 L21 10 L16.2 14.3 L17.6 20.6 L12 17.4 L6.4 20.6 L7.8 14.3 L3 10 L9.4 9.3 Z','p','Editor bintang')+
        B('preview','M2 12 C5 6.5 8.5 5 12 5 s7 1.5 10 7 c-3 5.5 -6.5 7 -10 7 S5 17.5 2 12 Z M9.2 12 a2.8 2.8 0 1 0 5.6 0 a2.8 2.8 0 1 0 -5.6 0','p k','Preview tanpa panel')+
        B('undo','M9 14 L4 9 L9 4 M4 9 H15 a5 5 0 0 1 0 10 H8','k','Undo')+
        B('redo','M15 14 L20 9 L15 4 M20 9 H9 a5 5 0 0 0 0 10 H16','k','Redo')+
        B('collapse','M6 9 L12 15 L18 9','k','Ciutkan / buka dock')+
      '</div>'+
      '<div class="rw ra">'+
        B('l','M19 12 H5 M11 6 L5 12 L11 18','','Geser kiri')+
        B('u','M12 19 V5 M6 11 L12 5 L18 11','','Geser atas')+
        B('d','M12 5 V19 M6 13 L12 19 L18 13','','Geser bawah')+
        B('r','M5 12 H19 M13 6 L19 12 L13 18','','Geser kanan')+
        B('rotl','M4 12 a8 8 0 1 0 3 -6 M4 4 V9 H9','','Putar kiri')+
        B('rotr','M20 12 a8 8 0 1 1 -3 -6 M20 4 V9 H15','','Putar kanan')+
        B('zoout','M5 12 H19','','Perkecil')+
        B('zoin','M5 12 H19 M12 5 V19','','Perbesar')+
        '<button type="button" data-a="step" title="Besar langkah (S1 kecil, S3 besar)">S2</button>'+
        B('menu','M5 12 h.01 M12 12 h.01 M19 12 h.01','a','Menu: save / copy / fit / reset',3.4)+
      '</div>'+
      '<div id="lay-menu"><button type="button" data-a="save" class="a">SAVE</button><button type="button" data-a="copy" class="a">COPY</button><button type="button" data-a="tune">COPY TUNE</button><button type="button" data-a="fit">FIT ULANG</button><button type="button" data-a="rst">RESET DRAFT</button></div>';
    document.body.appendChild(hud);
    info=document.getElementById('lay-info');
    var fab=document.createElement('button');fab.id='lay-fab';fab.type='button';fab.setAttribute('data-a','edit');fab.innerHTML='<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:4px" aria-hidden="true"><path d="M4 20 l1 -4.5 L16.5 4 a2 2 0 0 1 3 3 L8 18.5 Z"/><path d="M14.5 6 l3 3"/></svg>EDIT';document.body.appendChild(fab);
    ring=document.createElement('div');ring.id='lay-sel';ring.innerHTML='<div id="lay-hdl"><i>◢</i></div>';document.body.appendChild(ring);
    buildStars();

    function opt(){return {capture:true,passive:false};}
    window.addEventListener('click',function(e){
      var b=e.target.closest&&e.target.closest('#lay-hud button,#lay-fab');
      if(!b)return;
      e.preventDefault();e.stopImmediatePropagation();
      act(b.getAttribute('data-a'));
    },opt());
    window.addEventListener('pointerdown',function(e){
      if(inUI(e)){e.stopPropagation();return;}
      if(preview||SECT.busy||!SECT.cur)return;
      if(!stOpen&&(e.target&&e.target.id==='lay-hdl'||(e.target.closest&&e.target.closest('#lay-hdl')))){
        var b=ringBox(sel);if(!b)return;
        var cx=(b[0]+b[2])/2,cy=(b[1]+b[3])/2;
        rs={id:sel,cx:cx,cy:cy,d0:Math.max(12,Math.hypot(e.clientX-cx,e.clientY-cy)),s0:sel==='*'?1:getScale(sel),snap:sel==='*'?gSnap():null};
        e.stopImmediatePropagation();e.preventDefault();return;
      }
      if(stOpen&&stCid&&sel===stCid){   /* panel bintang terbuka: titik di dekat jari = pilih + geser bintang (bukan rasi) */
        var hs=stHit(e.clientX,e.clientY);
        if(hs){stSelect(hs,true);stDrag={k:hs,last:v2w(e.clientX,e.clientY)};e.stopImmediatePropagation();e.preventDefault();return;}
      }
      var id=hitCons(e.clientX,e.clientY);
      if(id){
        sel=id;updateInfo();paintSel();
        if(!stOpen)drag={id:id,last:v2w(e.clientX,e.clientY)};   /* mode bintang: tap rasi cuma pindah pilihan, TIDAK menggeser rasi */
        e.stopImmediatePropagation();e.preventDefault();
      }
    },opt());
    window.addEventListener('pointermove',function(e){
      if(preview)return;
      if(stDrag){
        var c2=cons(stCid),s2=c2&&c2.stars[stDrag.k];
        if(s2){var w2=v2w(e.clientX,e.clientY);stMove(s2,stDelta(c2,w2[0]-stDrag.last[0],w2[1]-stDrag.last[1]));refresh();stDrag.last=v2w(e.clientX,e.clientY);stSync(stDrag.k);updateInfo();}
        e.stopImmediatePropagation();e.preventDefault();return;
      }
      if(rs){
        var f=Math.hypot(e.clientX-rs.cx,e.clientY-rs.cy)/rs.d0;
        if(rs.snap)gApply(rs.snap,clamp(f,.2,5),0,0,0);else setScale(rs.id,rs.s0*f);
        refresh();
        e.stopImmediatePropagation();e.preventDefault();return;
      }
      if(!drag)return;
      var w=v2w(e.clientX,e.clientY);
      moveW(drag.id,w[0]-drag.last[0],w[1]-drag.last[1]);
      drag.last=v2w(e.clientX,e.clientY); /* titik acuan dihitung ulang karena layar bergeser setelah relayout */
      refresh();
      e.stopImmediatePropagation();e.preventDefault();
    },opt());
    function end(e){
      if(rs||drag||stDrag){hMark();refresh();autosave();updateInfo();e&&e.stopImmediatePropagation&&e.stopImmediatePropagation();}
      rs=null;drag=null;stDrag=null;
    }
    window.addEventListener('pointerup',end,opt());
    window.addEventListener('pointercancel',end,opt());
    window.addEventListener('beforeunload',autosave);
    window.addEventListener('resize',function(){setTimeout(paintSel,200);});
    setInterval(function(){if(sel&&!preview&&!drag&&!rs)paintSel();},500);
    hCommit();hBtn();updateInfo();
    (function ringLoop(){try{stRingPos();}catch(e){}requestAnimationFrame(ringLoop);})();   /* ring ikut sway tiap frame (jalan setelah loop render utama) */
    console.log('[layout editor v5] dock ringkas + undo/redo + bantu isi bintang ???');
    if(FIT_STALE){console.warn('[layout] SKY.fit di sky-data.js BASI. sky-data: ['+SKY.fit.map(rnd).join(',')+']  dari anchor sekarang: ['+ANCHOR_B.map(rnd).join(',')+']  -> Reset/FIT ULANG lalu Export & tempel SKY.fit baru.');setTimeout(function(){try{toast('SKY.fit sky-data BASI (beda dari anchor). Lihat console');}catch(eSt){}},900);}
  }

  function waitReady(){
    if(!document.body||typeof layout!=='function'){setTimeout(waitReady,200);return;}
    if(typeof bootDone!=='undefined'&&!bootDone){setTimeout(waitReady,400);return;}
    build();
    setTimeout(function(){try{layout();}catch(e){}},600);
  }
  if(document.readyState==='complete')waitReady();
  else window.addEventListener('load',waitReady);
})();
