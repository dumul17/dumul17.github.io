'use strict';
/* 16-sector-menu.js — Menu sektor di window portal (rencana-menu-sektor.md, FASE 1 = shell).
   Tap portal (overview maupun di dalam sektor) membuka window #sect-menu: pilih sektor dengan geser lubang / titik / panah, MASUK = window menutup lalu sectJumpTo(s) (05-sector-ui.js).
   Fase 3: cincin portal (portal3dDraw noMouth, 15-portal3d.js) + peta bintang holo vektor di lubangnya, digambar di satu kanvas (.sm-cv) oleh loop rAF milik window. Geser lubang = peta ikut meluncur (posisi SMENU.pos dipegang JS, bukan transisi CSS).
   Fase 4: sky dibekukan selama window terbuka penuh (smenuFrozen -> frame() di 05-sector-ui.js lewati seluruh gambar, state tetap jalan).
   Fase 5: pilihan ajak/tinggal teleskop ditanam di window (toggle "Ajak teleskop" + centang "Selalu ajak"), diteruskan sectJumpTo(s,carry,always) -> lisDecide (05-sector-ui.js); tidak ada kartu lisAsk lagi di jalur ini. Disembunyikan kalau teleskop sedang tidak di tempat asal (lisGone()).
   Pola DOM seperti #lis-ask: dibangun lewat JS, isolasi sentuhan penuh (stopPropagation di fase capture), CSS disuntik dari sini (tidak menyentuh index.html).
   Hook luar: smenuOpen() dari 06-interaction.js; layer tombol back di 07-boot.js (SMENU.open -> smenuClose). */
var SMENU={fz:'',open:false,closing:false,idx:0,pos:0,list:[],from:null,t:0,last:null,el:null,trk:null,hole:null,ring:null,cv:null,cx:null,d:0,dpr:1,w:0,drag:null,mon:0,cb:null,raf:0,lt:0,err:0,cols:{},carry:false,usr:false};
var SM_PI=(typeof PT_IN==='number')?PT_IN:.845;   /* radius lubang / radius luar cincin (PT_IN dari 15-portal3d.js) */

var SMENU_CSS=
'#sect-menu{position:fixed;left:0;top:0;right:0;bottom:0;z-index:9500;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .18s ease;font-family:"Space Grotesk",system-ui,sans-serif;color:#d9f6ff;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent}'+
'#sect-menu[hidden]{display:none}'+
'#sect-menu.on{opacity:1}'+
'#sect-menu.closing{pointer-events:none}'+
'#sect-menu .sm-bd{position:absolute;left:0;top:0;right:0;bottom:0;background:rgba(2,6,12,.8)}'+
'#sect-menu .sm-card{position:relative;display:flex;flex-direction:column;align-items:center;gap:10px;max-width:min(92vw,380px);max-height:96vh;padding:16px 18px 18px;box-sizing:border-box;outline:none}'+
'#sect-menu .sm-ttl{font-size:11px;letter-spacing:.28em;text-transform:uppercase;color:rgba(110,229,255,.8)}'+
'#sect-menu .sm-x{position:absolute;right:4px;top:4px;width:40px;height:40px;border:0;border-radius:50%;background:transparent;color:rgba(217,246,255,.8);font-size:24px;line-height:1;cursor:pointer}'+
'#sect-menu button{font-family:inherit;-webkit-appearance:none;appearance:none}'+
'#sect-menu button:focus-visible{outline:2px solid rgba(110,229,255,.9);outline-offset:2px}'+
'#sect-menu .sm-ringw{position:relative;display:flex;align-items:center;justify-content:center;gap:4px}'+
'#sect-menu .sm-ar{width:36px;height:56px;border:0;background:transparent;color:rgba(110,229,255,.85);font-size:30px;line-height:1;cursor:pointer;flex:none}'+
'#sect-menu .sm-ar[disabled]{opacity:.2;cursor:default}'+
'#sect-menu .sm-ring{--d:min(64vw,40vh,280px);position:relative;width:var(--d);height:var(--d);flex:none;touch-action:none;cursor:grab}'+
'#sect-menu .sm-cv{position:absolute;left:50%;top:50%;width:calc(var(--d)*1.5);height:calc(var(--d)*1.5);margin:calc(var(--d)*-.75) 0 0 calc(var(--d)*-.75);pointer-events:none}'+   /* 3 x radius luar = sisi gambar 3D cincin (half=1.5), supaya percikan di tepi tidak terpotong */
'#sect-menu .sm-hole{position:absolute;left:50%;top:50%;width:calc(var(--d)*'+SM_PI+');height:calc(var(--d)*'+SM_PI+');transform:translate(-50%,-50%);border-radius:50%;overflow:hidden;touch-action:none;cursor:inherit}'+
'#sect-menu .sm-trk{display:flex;width:100%;height:100%;will-change:transform}'+
'#sect-menu .sm-sl{flex:0 0 100%;height:100%;display:flex;align-items:center;justify-content:center}'+
'#sect-menu .sm-sn{font-size:clamp(20px,6.4vw,30px);font-weight:600;letter-spacing:.2em;padding-left:.2em;text-transform:uppercase;color:#eaf8ff;text-shadow:0 0 14px rgba(110,229,255,.55)}'+
'#sect-menu .sm-sl .sm-sn{display:none}'+   /* nama sektor ada di bawah cincin (.sm-nm); di lubang cuma "???" untuk sektor kosong, sisanya peta holo di kanvas */
'#sect-menu .sm-sl.sm-empty .sm-sn{display:block;opacity:.35}'+
'#sect-menu .sm-ring.sm-flash{animation:smflash .32s ease}'+
'@keyframes smflash{0%,100%{transform:translateX(0)}25%{transform:translateX(-7px)}60%{transform:translateX(6px)}}'+
'#sect-menu .sm-info{display:flex;flex-direction:column;align-items:center;gap:10px}'+
'#sect-menu .sm-dots{display:flex;gap:4px;align-items:center;justify-content:center}'+
'#sect-menu .sm-dot{width:28px;height:28px;border:0;background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0}'+
'#sect-menu .sm-dot::before{content:"";width:8px;height:8px;border-radius:50%;background:rgba(110,229,255,.28);transition:all .2s}'+
'#sect-menu .sm-dot[aria-current=true]::before{background:rgba(110,229,255,1);box-shadow:0 0 8px rgba(110,229,255,.9);transform:scale(1.25)}'+
'#sect-menu .sm-nm{font-size:17px;font-weight:600;letter-spacing:.22em;padding-left:.22em;text-transform:uppercase;text-align:center}'+
'#sect-menu .sm-tt{font-size:12px;opacity:.7;text-align:center;min-height:1.3em}'+
'#sect-menu .sm-meta{display:flex;gap:12px;align-items:center;justify-content:center;font-size:11px;letter-spacing:.08em;opacity:.8;min-height:16px}'+
'#sect-menu .sm-il{display:inline-flex;gap:6px}'+
'#sect-menu .sm-il i{width:8px;height:8px;border-radius:50%;box-sizing:border-box;border:1px solid rgba(200,214,226,.3)}'+
'#sect-menu .sm-il i.on.y{background:rgb(255,214,102);border-color:rgb(255,214,102);box-shadow:0 0 6px rgba(255,214,102,.7)}'+
'#sect-menu .sm-il i.on.p{background:rgb(255,154,217);border-color:rgb(255,154,217);box-shadow:0 0 6px rgba(255,154,217,.7)}'+
'#sect-menu .sm-st{font-size:11px;letter-spacing:.06em;text-align:center;min-height:2.6em;opacity:.65;max-width:280px}'+
'#sect-menu .sm-st.warn{opacity:1;color:#ffcf8a}'+
'#sect-menu .sm-tele{display:flex;flex-direction:column;align-items:center;gap:2px}'+
'#sect-menu .sm-tele[hidden]{display:none}'+
'#sect-menu .sm-tg{display:inline-flex;align-items:center;gap:10px;min-height:40px;padding:0 6px;border:0;background:transparent;color:#d9f6ff;font-size:12px;letter-spacing:.14em;text-transform:uppercase;cursor:pointer}'+
'#sect-menu .sm-tgk{position:relative;box-sizing:border-box;width:38px;height:22px;flex:none;border-radius:11px;border:1.5px solid rgba(110,229,255,.5);background:rgba(110,229,255,.08);transition:background .18s,border-color .18s}'+
'#sect-menu .sm-tgk::after{content:"";position:absolute;left:2px;top:2px;width:15px;height:15px;border-radius:50%;background:rgba(217,246,255,.7);transition:left .18s,background .18s,box-shadow .18s}'+
'#sect-menu .sm-tg[aria-checked=true] .sm-tgk{background:rgba(110,229,255,.3);border-color:rgba(110,229,255,.95)}'+
'#sect-menu .sm-tg[aria-checked=true] .sm-tgk::after{left:18px;background:#eaf8ff;box-shadow:0 0 8px rgba(110,229,255,.9)}'+
'#sect-menu .sm-tele.dim .sm-tg,#sect-menu .sm-tele.dim .sm-al{opacity:.4}'+   /* sektor yang tidak bisa dimasuki (???, di sini, tanpa portal): tetap tampil supaya layout tidak loncat */
'#sect-menu .sm-al{display:inline-flex;align-items:center;gap:8px;min-height:32px;font-size:11px;letter-spacing:.06em;opacity:.8;cursor:pointer}'+
'#sect-menu .sm-al input{width:16px;height:16px;margin:0;accent-color:#6ee5ff}'+
'#sect-menu .sm-al.dis{opacity:.3;cursor:default}'+   /* "selalu ajak" cuma bermakna kalau teleskop memang diajak */
'#sect-menu .sm-go{min-width:170px;height:46px;padding:0 26px;border-radius:23px;border:1.5px solid rgba(110,229,255,.85);background:rgba(110,229,255,.12);color:#eaf8ff;font-size:14px;font-weight:600;letter-spacing:.3em;padding-left:calc(26px + .3em);cursor:pointer;box-shadow:0 0 18px rgba(70,200,255,.22)}'+
'#sect-menu .sm-ov{min-height:38px;padding:0 18px;border-radius:19px;border:1px solid rgba(200,214,226,.32);background:transparent;color:rgba(214,228,240,.82);font-size:11px;font-weight:600;letter-spacing:.2em;text-transform:uppercase;cursor:pointer}'+
'#sect-menu .sm-ov[hidden]{display:none}'+
'#sect-menu .sm-go.off{opacity:.38;box-shadow:none;border-color:rgba(110,229,255,.4)}'+
'@media (orientation:landscape){#sect-menu .sm-card{display:grid;grid-template-columns:auto auto;grid-template-areas:"ttl ttl" "ring info";column-gap:22px;row-gap:4px;max-width:96vw;align-items:center;justify-items:center}#sect-menu .sm-ttl{grid-area:ttl}#sect-menu .sm-ringw{grid-area:ring}#sect-menu .sm-info{grid-area:info;display:flex;flex-direction:column;align-items:center;gap:6px}#sect-menu .sm-ring{--d:min(58vh,42vw,300px)}#sect-menu .sm-st{min-height:2em}#sect-menu .sm-tele{flex-direction:row;flex-wrap:wrap;justify-content:center;gap:6px}}'+   /* semua landscape (HP, tablet, desktop): tata letak 2 kolom, bukan cuma HP pendek */
'@media (orientation:landscape) and (max-height:430px){#sect-menu .sm-card{padding:8px 16px 10px;row-gap:0}#sect-menu .sm-info{gap:2px}#sect-menu .sm-dot{height:22px}#sect-menu .sm-tt,#sect-menu .sm-meta{min-height:0}#sect-menu .sm-st{min-height:1.2em}#sect-menu .sm-go{height:40px}#sect-menu .sm-ov{min-height:32px}}'+
'body.ls #sect-menu{left:calc(-1 * var(--gut,0px));right:calc(-1 * var(--gut,0px))}'+   /* body.ls punya transform -> position:fixed anak body terkurung di kolom portrait; lebarkan balik ke seluruh layar (pola sama dgn #boot-screen / #veil) */
'@media (prefers-reduced-motion:reduce){#sect-menu,#sect-menu .sm-dot::before,#sect-menu .sm-tgk,#sect-menu .sm-tgk::after{transition:none}#sect-menu .sm-ring.sm-flash{animation:none}}';

/* Diameter cincin di window (px layar) = --d di CSS: portrait min(64vw,40vh,280px), landscape min(58vh,42vw,300px). Dipakai 15-portal3d.js (ptOvK) supaya portal overview = setengah ukuran ini. */
function smenuRingD(){var w=window.innerWidth||0,h=window.innerHeight||0;return w>h?Math.min(h*.58,w*.42,300):Math.min(w*.64,h*.40,280);}
function smenuStatus(s){   /* 'empty' sektor belum terpetakan · 'here' sedang di sini · 'ok' */
  if(!s||!s.ids||!s.ids.length)return 'empty';
  if(SECT.cur&&s===SECT.cur)return 'here';
  return 'ok';
}
function smenuTx(k,f,v){try{var r=T(k,v);return(r&&r!==k)?r:f;}catch(e){return f;}}
/* F4: true = frame() sky tidak menggambar apa-apa (kanvas dibiarkan berisi frame terakhir). Menunggu fade-in selesai (backdrop sudah gelap); begitu menutup (closing) sky langsung hidup lagi.
   Ukuran kanvas / DPR berubah (rotasi layar) = kanvas terhapus browser, jadi beku dilepas dan sky menggambar ulang. */
function smenuFzKey(){return W+'x'+H+'x'+DPR;}
function smenuFrozen(){return SMENU.open&&!SMENU.closing&&performance.now()-SMENU.t>260&&SMENU.fz===smenuFzKey();}
function smenuCanOpen(){
  if(SMENU.open||SMENU.closing)return false;
  if(SECT.busy||SW||whBusy()||CAMERA_MODE||OBSERVE_MODE)return false;
  return true;
}
function smenuBuild(){
  if(SMENU.el)return;
  var d=document,st=d.createElement('style');st.id='sect-menu-css';st.textContent=SMENU_CSS;d.head.appendChild(st);
  var a=SMENU.el=d.createElement('div');
  a.id='sect-menu';a.hidden=true;a.setAttribute('role','dialog');a.setAttribute('aria-modal','true');a.setAttribute('aria-labelledby','sm-title');
  a.innerHTML=
    '<div class="sm-bd"></div>'+
    '<div class="sm-card" tabindex="-1">'+
      '<button type="button" class="sm-x" data-a="close">\u00d7</button>'+
      '<div class="sm-ttl" id="sm-title"></div>'+
      '<div class="sm-ringw"><button type="button" class="sm-ar" data-a="prev">\u2039</button>'+
        '<div class="sm-ring"><canvas class="sm-cv" aria-hidden="true"></canvas><div class="sm-hole"><div class="sm-trk"></div></div></div>'+
      '<button type="button" class="sm-ar" data-a="next">\u203a</button></div>'+
      '<div class="sm-info">'+
        '<div class="sm-dots"></div>'+
        '<div class="sm-nm"></div><div class="sm-tt"></div>'+
        '<div class="sm-meta"><span class="sm-cnt"></span><span class="sm-il"></span></div>'+
        '<div class="sm-st" aria-live="polite"></div>'+
        '<div class="sm-tele" hidden><button type="button" class="sm-tg" data-a="tele" role="switch" aria-checked="true"><span class="sm-tgk"></span><span class="sm-tgt"></span></button>'+
          '<label class="sm-al"><input type="checkbox" data-c="auto"><span class="sm-alt"></span></label></div>'+
        '<button type="button" class="sm-go" data-a="go"></button>'+
        '<button type="button" class="sm-ov" data-a="ov" hidden></button>'+
      '</div>'+
    '</div>';
  d.body.appendChild(a);
  SMENU.trk=a.querySelector('.sm-trk');SMENU.hole=a.querySelector('.sm-hole');SMENU.ring=a.querySelector('.sm-ring');SMENU.cv=a.querySelector('.sm-cv');SMENU.cx=SMENU.cv.getContext('2d');
  /* Isolasi penuh: tidak tembus ke sky/BH/portal/teleskop (06-interaction.js juga mengecualikan #sect-menu di daftar closest-nya). */
  ['pointerup','pointercancel','pointermove','touchstart','touchmove','touchend','wheel','contextmenu','mousedown','mouseup'].forEach(function(tp){
    a.addEventListener(tp,function(e){e.stopPropagation();},{passive:false,capture:true});
  });
  a.addEventListener('pointerdown',function(e){e.stopPropagation();smenuDown(e);},true);
  a.addEventListener('pointermove',smenuMove,true);
  a.addEventListener('pointerup',smenuUp,true);
  a.addEventListener('pointercancel',smenuUp,true);
  a.addEventListener('click',function(e){
    e.stopPropagation();
    var t=e.target,b=t.closest&&t.closest('[data-a]'),k=b&&b.getAttribute('data-a');
    if(!b){   /* tap di luar kartu = tutup (abaikan klik susulan dari tap yang membuka window) */
      if(!(t.closest&&t.closest('.sm-card'))&&performance.now()-SMENU.t>350)smenuClose();
      return;
    }
    e.preventDefault();
    if(k==='close')smenuClose();
    else if(k==='go')smenuEnter();
    else if(k==='ov')smenuOverview();
    else if(k==='tele'){SMENU.carry=!SMENU.carry;if(!SMENU.carry)smenuAutoCk(false);smenuTele();try{UIS.tap();}catch(eT){}try{haptic(6);}catch(eH){}}
    else if(k==='prev')smenuGo(SMENU.idx-1,true);
    else if(k==='next')smenuGo(SMENU.idx+1,true);
    else if(k==='dot')smenuGo(+b.getAttribute('data-i'),true);
  },true);
  a.querySelector('input[data-c=auto]').addEventListener('change',function(){if(this.checked)SMENU.carry=true;smenuTele();});
  window.addEventListener('keydown',smenuKey,true);
  window.addEventListener('resize',function(){if(SMENU.open)smenuLayout();});
}
function smenuSlides(){
  var h='',i,s,st;
  for(i=0;i<SMENU.list.length;i++){
    s=SMENU.list[i];st=smenuStatus(s);
    h+='<div class="sm-sl sm-'+st+'"><span class="sm-sn">'+(st==='empty'?'???':String(s.name||s.k).replace(/</g,'&lt;'))+'</span></div>';
  }
  SMENU.trk.innerHTML=h;
}
function smenuPlace(){SMENU.trk.style.transform='translate3d('+(-SMENU.pos*SMENU.w)+'px,0,0)';}
function smenuLayout(){
  var d=SMENU.ring.clientWidth||1,cs=d*1.5,dp=(typeof IS_POTATO!=='undefined'&&IS_POTATO)?1:Math.min(window.devicePixelRatio||1,2),n=Math.max(2,Math.round(cs*dp));
  SMENU.w=SMENU.hole.clientWidth||1;SMENU.d=d;SMENU.dpr=n/cs;
  if(SMENU.cv.width!==n){SMENU.cv.width=n;SMENU.cv.height=n;}
  smenuPlace();
}
function smenuRefresh(){
  var s=SMENU.list[SMENU.idx],a=SMENU.el,st=smenuStatus(s),n=SMENU.list.length,i,h='',il,st2=a.querySelector('.sm-st'),hint='';
  a.querySelector('.sm-ttl').textContent=smenuTx('smenu.title','Pilih sektor');
  a.querySelector('.sm-x').setAttribute('aria-label',smenuTx('smenu.close','Tutup'));
  a.querySelector('[data-a=prev]').setAttribute('aria-label',smenuTx('smenu.prev','Sektor sebelumnya'));
  a.querySelector('[data-a=next]').setAttribute('aria-label',smenuTx('smenu.next','Sektor berikutnya'));
  a.querySelector('[data-a=prev]').disabled=SMENU.idx<=0;
  a.querySelector('[data-a=next]').disabled=SMENU.idx>=n-1;
  for(i=0;i<n;i++)h+='<button type="button" class="sm-dot" data-a="dot" data-i="'+i+'" aria-label="'+String(SMENU.list[i].name||SMENU.list[i].k).replace(/"/g,'')+'"'+(i===SMENU.idx?' aria-current="true"':'')+'></button>';
  a.querySelector('.sm-dots').innerHTML=h;
  a.querySelector('.sm-nm').textContent=st==='empty'?'???':String(s.name||s.k);
  a.querySelector('.sm-tt').textContent=st==='empty'?'':(s.title||'');
  a.querySelector('.sm-cnt').textContent=st==='empty'?'':smenuTx('smenu.count',s.ids.length+' rasi',{n:s.ids.length});
  il=a.querySelector('.sm-il');
  if(st!=='empty'&&typeof txInterlock==='function'){var x=txInterlock(s);il.innerHTML='<i class="y'+(x.y?' on':'')+'"></i><i class="p'+(x.p?' on':'')+'"></i>';}
  else il.innerHTML='';
  if(st==='here')hint=smenuTx('smenu.here','KAMU DI SINI');
  else if(st==='empty')hint=smenuTx('smenu.empty','Belum terpetakan.');
  else if(n>1)hint=smenuTx('smenu.swipe','Geser lubang untuk ganti sektor');
  st2.textContent=hint;st2.className='sm-st'+(st==='empty'?' warn':'');
  var go=a.querySelector('.sm-go');go.textContent=smenuTx('smenu.go','MASUK');go.classList.toggle('off',st!=='ok');
  go.setAttribute('aria-disabled',st!=='ok'?'true':'false');
  var ov=a.querySelector('.sm-ov');   /* F10: KE OVERVIEW hanya saat menu dibuka dari dalam sektor */
  ov.hidden=!SMENU.from;ov.textContent='\u25ce '+smenuTx('smenu.overview','KE OVERVIEW');
  smenuTele();
}
/* F10: balik overview dari window (menggantikan tekan-tahan portal): tutup window, tunggu 2 frame sky, lalu terowongan wormhole sektor -> overview (sectSwallowToggle di 05-sector-ui.js). */
function smenuOverview(){
  if(!SMENU.from||SECT.cur!==SMENU.from||SECT.busy||SW||whBusy())return;
  try{haptic(10);}catch(eH){}
  smenuClose(function(){try{sectSwallowToggle();}catch(eS){}});
}
/* F5: baris pilihan teleskop. Tampil hanya kalau teleskop ada di tempat asal (!lisGone()); selain itu disembunyikan dan lompat otomatis tanpa teleskop.
   Nilai awal (smenuOpen): ajak = LIS.auto (default OFF), centang "selalu ajak" = LIS.auto. Aturan: centang ON -> toggle otomatis ON; toggle OFF -> centang otomatis dilepas; toggle ON tidak menyentuh centang. Keduanya dibaca saat MASUK (smenuEnter). */
function smenuAutoCk(v){var ck=SMENU.el.querySelector('input[data-c=auto]');if(ck)ck.checked=!!v;}
function smenuTele(){
  var a=SMENU.el,row=a.querySelector('.sm-tele'),tg=a.querySelector('.sm-tg'),ck=a.querySelector('input[data-c=auto]'),lb=a.querySelector('.sm-al'),on=!!SMENU.carry,
      gone=(typeof lisGone==='function')?lisGone():true,st=smenuStatus(SMENU.list[SMENU.idx]);
  row.hidden=gone;
  row.classList.toggle('dim',st!=='ok');
  a.querySelector('.sm-tgt').textContent=smenuTx('smenu.bring','Ajak teleskop');
  a.querySelector('.sm-alt').textContent=smenuTx('smenu.auto','Selalu ajak');
  tg.setAttribute('aria-checked',on?'true':'false');
  ck.disabled=false;lb.classList.remove('dis');
}
function smenuGo(i,anim){
  var n=SMENU.list.length;i=Math.max(0,Math.min(n-1,i|0));
  var ch=i!==SMENU.idx;SMENU.idx=i;if(ch)SMENU.usr=true;   /* pilihan user (panah/titik/geser/keyboard), bukan pilihan otomatis dari smenuOpen */
  if(!anim||reduce){SMENU.pos=i;smenuPlace();}   /* selain itu SMENU.pos menyusul pelan di smenuTick */
  if(ch){try{UIS.tap();}catch(e){}try{haptic(6);}catch(e2){}}
  smenuRefresh();
}
function smenuDeny(){
  try{UIS.deny();}catch(e){}try{haptic(12);}catch(e2){}
  var rg=SMENU.ring;
  if(rg&&!reduce){rg.classList.remove('sm-flash');void rg.offsetWidth;rg.classList.add('sm-flash');}
}
function smenuEnter(){
  var s=SMENU.list[SMENU.idx],st=smenuStatus(s);
  if(!s)return;
  if(st!=='ok'){
    smenuDeny();
    return;
  }
  try{haptic(10);}catch(e2){}
  var carry=false,always;   /* dibaca SEKARANG (sebelum window menutup): teleskop tidak di sini = tanpa teleskop, centang tidak berlaku */
  if(typeof lisGone==='function'&&!lisGone()){
    var ck=SMENU.el.querySelector('input[data-c=auto]');
    carry=!!SMENU.carry;
    if(carry&&ck)always=!!ck.checked;
  }
  smenuClose(function(){sectJumpTo(s,carry,always);});
}
/* geser lubang: mulai dihitung setelah ±12 px; lepas = snap ke sektor terdekat dengan inersia pendek (maks ±1 dari posisi awal) */
/* clientX/clientY event di-hook global (01-core.js) ke ruang virtual #stage: di HP landscape (mode ROT) sumbunya DITUKAR, di tablet/desktop diskala + digeser.
   Window ini di luar #stage dan hidup di ruang layar asli, jadi geser harus pakai koordinat layar mentah (scrPt). */
function smenuX(e){return (typeof scrPt==='function')?scrPt(e)[0]:e.clientX;}
function smenuDown(e){
  var h=e.target.closest&&e.target.closest('.sm-ring');
  if(!h||SMENU.drag||(e.button>0&&e.pointerType==='mouse'))return;
  SMENU.w=SMENU.hole.clientWidth||1;   /* satu slide = selebar lubang */
  var px=smenuX(e);SMENU.drag={id:e.pointerId,x0:px,x:px,t:e.timeStamp,vx:0,on:false,i0:SMENU.idx,el:h};
}
function smenuMove(e){
  var d=SMENU.drag;e.stopPropagation();
  if(!d||e.pointerId!==d.id)return;
  var cx=smenuX(e),dx=cx-d.x0,n=SMENU.list.length,w=SMENU.w,pos,mn;
  if(!d.on){
    if(Math.abs(dx)<12)return;
    d.on=true;try{d.el.setPointerCapture(d.id);}catch(er){}
  }
  var dt=e.timeStamp-d.t;if(dt>0){d.vx=d.vx*.7+((cx-d.x)/dt)*.3;}
  d.x=cx;d.t=e.timeStamp;
  pos=-d.i0*w+dx;mn=-(n-1)*w;
  if(pos>0)pos*=.35;else if(pos<mn)pos=mn+(pos-mn)*.35;   /* karet di ujung */
  d.pos=pos;SMENU.pos=-pos/w;smenuPlace();
  e.preventDefault();
}
function smenuUp(e){
  var d=SMENU.drag;e.stopPropagation();
  if(!d||e.pointerId!==d.id)return;
  SMENU.drag=null;
  try{d.el.releasePointerCapture(d.id);}catch(er){}
  if(!d.on)return;
  if(e.type==='pointercancel'){smenuGo(d.i0,true);return;}
  var proj=(d.pos==null?-d.i0*SMENU.w:d.pos)+(reduce?0:d.vx*160),t=Math.round(-proj/SMENU.w);
  smenuGo(Math.max(d.i0-1,Math.min(d.i0+1,t)),true);
}
function smenuKey(e){
  if(!SMENU.open)return;
  var k=e.key,a=SMENU.el;
  e.stopPropagation();   /* selama menu terbuka, tombol tidak sampai ke sky (musik, kamera, dll.) */
  if(k==='Escape'){e.preventDefault();smenuClose();}
  else if(k==='ArrowLeft'){e.preventDefault();smenuGo(SMENU.idx-1,true);}
  else if(k==='ArrowRight'){e.preventDefault();smenuGo(SMENU.idx+1,true);}
  else if(k==='Enter'&&!(e.target&&e.target.tagName==='BUTTON')){e.preventDefault();smenuEnter();}
  else if(k==='Tab'){   /* jebakan fokus sederhana */
    var f=[].slice.call(a.querySelectorAll('button:not([disabled]),input:not([disabled])')),first=f[0],last=f[f.length-1];
    if(!f.length)return;
    if(e.shiftKey&&(document.activeElement===first||!a.contains(document.activeElement))){e.preventDefault();last.focus();}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  }
}
/* ---------- kanvas: peta bintang holo (vektor, dari CONS) di dalam lubang + cincin portal (portal3dDraw) di atasnya ----------
   Urutan gambar per frame: holo (di-clip ke lubang) -> portal3dDraw(noMouth,noRot): petir visualizer -> cincin 3D -> kilau -> percikan.
   Satu renderer WebGL dipakai bersama sky (PT3D.r): sky tidak menggambar portalnya selama window terbuka (guard SMENU di 15-portal3d.js), jadi tidak ada render ganda / ganti resolusi tiap frame. */
function smenuMix(rgb){   /* 'r,g,b' dicampur putih ±55% biar garis rasi terbaca juga di sektor biru tua (Autumn) */
  var c=SMENU.cols[rgb];
  if(!c){var p=rgb.split(','),i;for(i=0;i<3;i++)p[i]=Math.round((+p[i])+(255-(+p[i]))*.55);c=SMENU.cols[rgb]=p.join(',');}
  return c;
}
function smenuSpots(n){   /* posisi + sisi kotak tiap rasi, satuan radius lubang; semua muat di dalam lingkaran */
  if(n<=1)return [[0,0,1.2]];
  if(n===2)return [[-.42,-.14,.74],[.42,.14,.74]];
  if(n===3)return [[0,-.5,.6],[-.46,.3,.6],[.46,.3,.6]];
  if(n===4)return [[-.38,-.38,.56],[.38,-.38,.56],[-.38,.38,.56],[.38,.38,.56]];
  var o=[],m=n>=7?6:n,r=n>=7?.64:.58,b=n>=7?.44:(n===5?.52:.48),k,a;
  for(k=0;k<m;k++){a=-1.5708+k*6.2832/m;o.push([Math.cos(a)*r,Math.sin(a)*r,b]);}
  if(n>=7)o.push([0,0,.46]);   /* rasi ke-8 dst. tidak digambar (belum ada sektor segitu) */
  return o;
}
/* satu rasi: garis + bintang (vektor, digambar di ctx kanvas menu sendiri). cx,cy,box = piksel. */
function smenuCons(g,id,cx,cy,box,rgb,now,still,ks){
  var lc=smenuMix(rgb),i,k,a,b,z,st,r,al;
  if(id==='pleiades'&&typeof PLEIADES!=='undefined'){   /* cluster: cuma titik */
    var sc0=box/.62,L=[PLEIADES.bright,PLEIADES.dim],q,arr;
    for(q=0;q<2;q++){arr=L[q];
      for(i=0;i<arr.length;i++){z=arr[i];r=Math.max(.9,(z.r||1.3)*.55*ks);al=still?1:.8+.2*Math.sin(now*.0021+i*1.9+q);
        g.fillStyle='rgba('+rgb+','+(.16*al)+')';g.beginPath();g.arc(cx+(z.x-.53)*sc0,cy+(z.y-.42)*sc0,r*3,0,6.2832);g.fill();
        g.fillStyle='rgba(234,246,255,'+(.95*al)+')';g.beginPath();g.arc(cx+(z.x-.53)*sc0,cy+(z.y-.42)*sc0,r,0,6.2832);g.fill();}
    }
    return;
  }
  var c=cons(id);
  if(!c||!c.stars||!c.bw||!c.bh||!c.lines)return;
  var sc=box/Math.max(c.bw,c.bh),ox=cx-c.bw*sc/2,oy=cy-c.bh*sc/2;
  g.lineJoin='round';g.lineCap='round';
  g.beginPath();
  for(i=0;i<c.lines.length;i++){
    a=c.stars[c.lines[i][0]];b=c.stars[c.lines[i][1]];
    if(!a||!b||a.rx==null||b.rx==null)continue;
    g.moveTo(ox+(a.rx-c.minx)*sc,oy+(a.ry-c.miny)*sc);g.lineTo(ox+(b.rx-c.minx)*sc,oy+(b.ry-c.miny)*sc);
  }
  g.strokeStyle='rgba('+rgb+',.20)';g.lineWidth=3*Math.max(1,ks*.7);g.stroke();   /* kilau di bawah garis */
  g.strokeStyle='rgba('+lc+',.62)';g.lineWidth=Math.max(.9,ks*.55);g.stroke();
  for(k in c.stars){
    st=c.stars[k];if(st.rx==null)continue;
    r=Math.max(.9,(st.r||1.3)*.5*ks);
    al=still?1:.78+.22*Math.sin(now*(st.twinkleSpeed||.002)*2+(st.ph||0));   /* berkedip pelan; statis saat reduce-motion / potato */
    a=ox+(st.rx-c.minx)*sc;b=oy+(st.ry-c.miny)*sc;
    g.fillStyle='rgba('+rgb+','+(.18*al)+')';g.beginPath();g.arc(a,b,r*3,0,6.2832);g.fill();
    g.fillStyle='rgba(234,246,255,'+(.95*al)+')';g.beginPath();g.arc(a,b,r,0,6.2832);g.fill();
  }
}
/* satu slide holo; ox = geser horizontal (px, 0 = di tengah lubang), Rin = radius lubang (px) */
function smenuHolo(g,s,ox,Rin,now,still){
  if(ox>Rin*2.05||ox<-Rin*2.05)return;
  var st=smenuStatus(s),rgb=(s.sky&&s.sky.rgb)||'110,185,255',al=st==='ok'?1:(st==='empty'?.25:.5),k,a,gr,sp,n,j,ks=Math.max(1,Rin/62);
  g.save();g.translate(ox,0);g.globalAlpha=al;
  gr=g.createRadialGradient(0,0,0,0,0,Rin);   /* semburat warna sektor (SECTORS[].sky.rgb) */
  gr.addColorStop(0,'rgba('+rgb+',.36)');gr.addColorStop(.6,'rgba('+rgb+',.11)');gr.addColorStop(1,'rgba('+rgb+',0)');
  g.fillStyle=gr;g.fillRect(-Rin,-Rin,Rin*2,Rin*2);
  g.strokeStyle='rgba('+rgb+',.2)';g.lineWidth=1;   /* kisi holo: 3 cincin + 6 jari-jari */
  for(k=1;k<=3;k++){g.beginPath();g.arc(0,0,Rin*k*.31,0,6.2832);g.stroke();}
  g.strokeStyle='rgba('+rgb+',.10)';g.beginPath();
  for(k=0;k<6;k++){a=k*1.0472;g.moveTo(0,0);g.lineTo(Math.cos(a)*Rin,Math.sin(a)*Rin);}
  g.stroke();
  if(!still&&st!=='empty'){   /* sapuan radar: 3 baji bertingkat (tanpa conic gradient supaya jalan di semua WebView) */
    var sw=(now*.0006)%6.2832;g.save();g.rotate(sw);
    for(k=0;k<3;k++){g.fillStyle='rgba('+rgb+','+(.04+.035*k)+')';g.beginPath();g.moveTo(0,0);g.arc(0,0,Rin,-.62+k*.2,-.42+k*.2);g.closePath();g.fill();}
    g.strokeStyle='rgba('+smenuMix(rgb)+',.4)';g.lineWidth=1;g.beginPath();g.moveTo(0,0);g.lineTo(Rin,0);g.stroke();
    g.restore();
  }
  if(st!=='empty'&&s.ids&&s.ids.length){
    n=s.ids.length;sp=smenuSpots(n);
    g.rotate(still?0:now*.00004);   /* seluruh peta berputar pelan */
    for(j=0;j<n&&j<sp.length;j++)smenuCons(g,s.ids[j],sp[j][0]*Rin,sp[j][1]*Rin,sp[j][2]*Rin,rgb,now,still,ks);
  }
  g.restore();
}
function smenuDraw(now){
  var g=SMENU.cx,d=SMENU.d,cs=d*1.5,c=cs/2,Rp=d/2,Rin=Rp*SM_PI,n=SMENU.list.length,i,vg,
      still=!!(reduce||(typeof IS_POTATO!=='undefined'&&IS_POTATO));
  if(!g||!(d>2))return;
  g.setTransform(SMENU.dpr,0,0,SMENU.dpr,0,0);g.clearRect(0,0,cs,cs);
  g.save();g.translate(c,c);g.beginPath();g.arc(0,0,Rin,0,6.2832);g.clip();
  g.fillStyle='#03070d';g.fillRect(-Rin,-Rin,Rin*2,Rin*2);
  for(i=Math.floor(SMENU.pos);i<=Math.ceil(SMENU.pos);i++){if(i>=0&&i<n)smenuHolo(g,SMENU.list[i],(i-SMENU.pos)*Rin*2,Rin,now,still);}
  vg=g.createRadialGradient(0,0,Rin*.62,0,0,Rin);vg.addColorStop(0,'rgba(3,7,13,0)');vg.addColorStop(1,'rgba(3,7,13,.7)');   /* bayangan tepi: peta yang meluncur keluar memudar ke cincin */
  g.fillStyle=vg;g.fillRect(-Rin,-Rin,Rin*2,Rin*2);
  g.restore();
  if(typeof portal3dDraw==='function')portal3dDraw(g,c,c,Rp,now,1,{noMouth:true,noRot:true});
}
function smenuTick(now){
  SMENU.raf=0;
  if(!SMENU.open&&!SMENU.closing)return;
  var dt=SMENU.lt?Math.min(.05,Math.max(0,(now-SMENU.lt)/1000)):.016,df;SMENU.lt=now;
  if(!SMENU.drag||!SMENU.drag.on){   /* slide menyusul target (tanpa transisi CSS supaya kanvas & teks selalu sama posisinya) */
    df=SMENU.idx-SMENU.pos;
    if(df!==0){
      if(reduce||Math.abs(df)<.002)SMENU.pos=SMENU.idx;else SMENU.pos+=df*(1-Math.exp(-dt*13));
      smenuPlace();
    }
  }
  if(SMENU.ring&&Math.abs((SMENU.ring.clientWidth||1)-SMENU.d)>.5){try{smenuLayout();}catch(eL){}}   /* rotasi / ganti layout (portrait <-> landscape): ukur ulang cincin + kanvas + lebar slide, jangan menunggu event resize */
  try{smenuDraw(now);}catch(e){if(!SMENU.err){SMENU.err=1;try{console.warn('[smenu] gambar gagal:',e&&e.message||e);}catch(e2){}}}
  SMENU.raf=requestAnimationFrame(smenuTick);
}
function smenuLoop(){if(!SMENU.raf){SMENU.lt=0;SMENU.raf=requestAnimationFrame(smenuTick);}}
/* Index sektor tempat bintang SFX yang SEDANG bunyi (activeSfx, 01-core.js; sfxSector() sudah menangani rasi off lewat SKY.rasiBy). -1 = tidak ada SFX aktif / sektornya belum terpetakan. */
function smenuSfxIdx(){
  try{
    if(typeof activeSfx==='undefined'||!activeSfx||activeSfx.paused||activeSfx.ended||typeof sfxSector!=='function')return -1;
    var sc=sfxSector(),ix=sc?SMENU.list.indexOf(sc):-1;
    return(ix>=0&&smenuStatus(sc)!=='empty')?ix:-1;
  }catch(e){return -1;}
}
function smenuOpen(){
  if(!smenuCanOpen())return false;
  smenuBuild();
  var i,s,first=-1,pick=-1,sf;
  SMENU.list=SECT.list.slice();SMENU.from=SECT.cur||null;SMENU.usr=false;
  if(!SMENU.last){try{SMENU.last=localStorage.getItem('dumul_smenu_last')||null;}catch(eL){}}
  for(i=0;i<SMENU.list.length;i++){s=SMENU.list[i];if(first<0&&smenuStatus(s)!=='empty'&&smenuStatus(s)!=='here')first=i;if(SMENU.last&&s.k===SMENU.last&&smenuStatus(s)!=='empty')pick=i;}
  sf=smenuSfxIdx();
  SMENU.idx=sf>=0?sf:(pick>=0?pick:(first>=0?first:0));   /* urutan: sektor bintang SFX yang lagi bunyi > pilihan terakhir user > sektor pertama yang terpetakan */
  if(!OVSEL.seen){OVSEL.seen=true;try{localStorage.setItem('dumul_portal_seen','1');}catch(eS){}}   /* petunjuk denyut "portal bisa di-tap" berhenti, sama seperti ovSelSet lama */
  smenuSlides();
  SMENU.carry=!!LIS.auto;smenuAutoCk(LIS.auto);   /* F5: default toggle OFF; kalau "selalu ajak" sudah aktif: toggle ON + centang */
  SMENU.pos=SMENU.idx;SMENU.err=0;
  SMENU.fz=smenuFzKey();
  SMENU.open=true;SMENU.closing=false;SMENU.t=performance.now();SMENU.drag=null;
  var a=SMENU.el;a.hidden=false;a.classList.remove('closing');
  document.body.classList.add('smenu-open');
  smenuLayout();smenuRefresh();smenuLoop();
  void a.offsetWidth;a.classList.add('on');
  try{UIS.pop('open');}catch(eU){}try{haptic(10);}catch(eH){}
  try{var cd=a.querySelector('.sm-card');cd.focus({preventScroll:true});}catch(eF){}
  clearInterval(SMENU.mon);
  SMENU.mon=setInterval(function(){   /* keadaan berubah di belakang menu (transisi, kamera, pindah sektor, portal hilang): tutup otomatis */
    if(!SMENU.open){clearInterval(SMENU.mon);SMENU.mon=0;return;}
    if(SECT.busy||SW||whBusy()||CAMERA_MODE||OBSERVE_MODE||(SECT.cur||null)!==SMENU.from)smenuClose();
  },200);
  return true;
}
/* Tutup: fade ±180 ms. Kalau ada cb (MASUK), tunggu 2 frame sky setelah window hilang baru dipanggil (risiko #1 di rencana: posisi cincin harus segar). */
function smenuClose(cb){
  if(!SMENU.open)return;
  var a=SMENU.el,sel=SMENU.list[SMENU.idx];
  if(sel&&(cb||SMENU.usr)){SMENU.last=sel.k;try{localStorage.setItem('dumul_smenu_last',sel.k);}catch(eS){}}   /* MASUK atau user sempat memilih; menutup tanpa menyentuh = pilihan terakhir tidak diubah (jangan menimpa dengan sektor SFX otomatis) */
  SMENU.open=false;SMENU.closing=true;SMENU.drag=null;
  clearInterval(SMENU.mon);SMENU.mon=0;
  a.classList.add('closing');a.classList.remove('on');
  try{UIS.tap();}catch(eU){}
  setTimeout(function(){
    a.hidden=true;a.classList.remove('closing');
    document.body.classList.remove('smenu-open');
    SMENU.closing=false;
    try{if(a.contains(document.activeElement))document.activeElement.blur();}catch(eB){}
    if(typeof cb==='function')requestAnimationFrame(function(){requestAnimationFrame(function(){try{cb();}catch(eC){}});});
  },reduce?0:180);
}
