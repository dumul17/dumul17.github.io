/* check-sky.js — jalankan:  node check-sky.js   (dari folder situs). Harus keluar "OK" sebelum deploy.
   Memeriksa: data sky-data.js (SKY.check), file audio ada, ?v= index.html cocok dengan SHELL service-worker, sisa kode lama. */
var fs=require('fs'),vm=require('vm'),path=require('path'),dir=__dirname,P=[];
function rd(f){return fs.readFileSync(path.join(dir,f),'utf8');}
var ctx={};vm.runInNewContext(rd('sky-data.js')+';this.SKY=SKY',ctx);
P=P.concat(ctx.SKY.check());
/* audio (hanya kalau folder audio/ ada di folder ini) */
if(fs.existsSync(path.join(dir,'audio')))ctx.SKY.audioFiles().forEach(function(f){if(!fs.existsSync(path.join(dir,f)))P.push('file audio hilang: '+f);});
else console.log('(folder audio/ tidak ada di sini — cek file audio dilewati)');
/* ?v= html vs SHELL service worker */
var html=rd('index.html'),sw=rd('service-worker.js');
var shell=sw.slice(sw.indexOf('const SHELL'));shell=shell.slice(0,shell.indexOf('];'));
['index.js','index.css','sky-data.js','texts.js'].forEach(function(n){
  var m=html.match(new RegExp('(?:src|href)="('+n.replace('.','\\.')+'\\?v=\\d+)"'));
  if(!m){P.push(n+': tag di index.html tidak ketemu / tanpa ?v=');return;}
  if(shell.indexOf("'"+m[1]+"'")<0)P.push('SHELL service-worker belum memuat \''+m[1]+'\' (harus sama persis dengan index.html)');
});
/* texts.js: harus bisa dieksekusi sendiri (data murni) dan punya semua kunci yang dipakai index.js */
var tctx={};try{vm.runInNewContext(rd('texts.js')+';this.TXT=TXT',tctx);}catch(e){P.push('texts.js error: '+e.message);}
if(tctx.TXT)['TELE_SCOPE_MESSAGES','TERM_POOL','TERM_W','TERM_PROMPTS','TG_POOL'].forEach(function(k){
  var v=tctx.TXT[k];if(!v||(Array.isArray(v)?!v.length:!Object.keys(v).length))P.push('texts.js: TXT.'+k+' kosong / hilang');
});
/* sisa pola lama */
var js=rd('index.js');
['TELE_SCOPE_MESSAGES','TERM_POOL','TERM_PROMPTS','TG_POOL'].forEach(function(k){if(new RegExp('var '+k+'=[\\[{]').test(js))P.push('index.js: '+k+' masih literal (harus TXT.'+k+', data ada di texts.js)');});
if(/\/08\b/.test(html)&&/sr-count/.test(html)&&/<em>00<\/em>\/08/.test(html))P.push('index.html: hitungan /08 hardcoded');
if(/getElementById\('(?:betel|rigel|sirius|pleione|aldebaran|arcturus|antares)-fx'\)/.test(js))P.push('index.js: tombol -fx per-bintang hardcoded (pakai FXBTN[key])');
if(P.length){console.log('MASALAH ('+P.length+'):');P.forEach(function(m){console.log(' - '+m);});process.exit(1);}
console.log('OK — '+ctx.SKY.rasi.length+' rasi, '+ctx.SKY.sfx.length+' SFX, '+ctx.SKY.sectors.length+' sektor');
