/* check-sky.js — jalankan:  node dumul-js/obs/check-sky.js   (atau  node check-sky.js [folder-root-situs]). Harus keluar "OK" sebelum deploy.
   Letaknya di dumul-js/obs/ (bareng sky-data.js, texts.js, js/); index.html, service-worker.js & audio/ ada di ROOT situs (default: dua tingkat di atas, bisa diganti lewat argumen).
   Memeriksa: data sky-data.js (SKY.check), file audio ada, ?v= index.html cocok dengan SHELL service-worker, sisa kode lama. */
var fs=require('fs'),vm=require('vm'),path=require('path'),dir=__dirname,P=[];
var root=path.resolve(process.argv[2]||path.join(dir,'..','..')),OBS='dumul-js/obs/';
function rd(f){return fs.readFileSync(path.join(dir,f),'utf8');}      /* file di folder obs/ */
function rdR(f){return fs.readFileSync(path.join(root,f),'utf8');}     /* file di root situs */
if(!fs.existsSync(path.join(root,'index.html'))||!fs.existsSync(path.join(root,'service-worker.js'))){console.log('MASALAH: index.html / service-worker.js tidak ada di '+root+' — kasih folder root situs sebagai argumen: node check-sky.js <root>');process.exit(1);}
var ctx={};vm.runInNewContext(rd('sky-data.js')+';this.SKY=SKY',ctx);
P=P.concat(ctx.SKY.check());
/* audio (hanya kalau folder audio/ ada di folder ini) */
if(fs.existsSync(path.join(root,'audio')))ctx.SKY.audioFiles().forEach(function(f){if(!fs.existsSync(path.join(root,f)))P.push('file audio hilang: '+f);});
else console.log('(folder audio/ tidak ada di root situs — cek file audio dilewati)');
/* ?v= html vs SHELL service worker */
var html=rdR('index.html'),sw=rdR('service-worker.js');
var shell=sw.slice(sw.indexOf('const SHELL'));shell=shell.slice(0,shell.indexOf('];'));
/* index.js dipecah jadi js/*.js (script klasik berurutan, satu scope global): tiap file harus ada di index.html + SHELL, urutannya sama */
var jsDir=path.join(dir,'js'),jsFiles=fs.existsSync(jsDir)?fs.readdirSync(jsDir).filter(function(f){return /\.js$/.test(f);}).sort():[];
if(!jsFiles.length)P.push('folder js/ kosong / tidak ada');
var jsTags=[],jsRe=/<script[^>]*src="dumul-js\/obs\/(js\/[^"?]+\.js)\?v=\d+"/g,jm;
while((jm=jsRe.exec(html)))jsTags.push(jm[1]);
if(jsTags.join('|')!==jsFiles.map(function(f){return 'js/'+f;}).join('|'))P.push('urutan/daftar <script src="js/..."> di index.html tidak sama dengan isi folder js/ (urut nama): html=['+jsTags.join(', ')+'] folder=['+jsFiles.join(', ')+']');
jsFiles.forEach(function(f){
  var n='js/'+f,m=html.match(new RegExp('src="('+(OBS+n).replace(/[.\/]/g,'\\$&')+'\\?v=\\d+)"'));
  if(m&&shell.indexOf("'"+m[1]+"'")<0)P.push('SHELL service-worker belum memuat \''+m[1]+'\' (harus sama persis dengan index.html)');
  if(!/^\s*(?:\/\*[\s\S]*?\*\/\s*)*'use strict';/.test(rd(n)))P.push(n+": tidak diawali 'use strict'");
});
['index.css',OBS+'sky-data.js',OBS+'texts.js'].forEach(function(n){
  var m=html.match(new RegExp('(?:src|href)="('+n.replace(/[.\/]/g,'\\$&')+'\\?v=\\d+)"'));
  if(!m){P.push(n+': tag di index.html tidak ketemu / tanpa ?v=');return;}
  if(shell.indexOf("'"+m[1]+"'")<0)P.push('SHELL service-worker belum memuat \''+m[1]+'\' (harus sama persis dengan index.html)');
});
/* texts.js: harus bisa dieksekusi sendiri (data murni) dan punya semua kunci yang dipakai index.js */
var tctx={};try{vm.runInNewContext(rd('texts.js')+';this.TXT=TXT',tctx);}catch(e){P.push('texts.js error: '+e.message);}
if(tctx.TXT)['TELE_SCOPE_MESSAGES','TERM_POOL','TERM_W','TERM_PROMPTS','TG_POOL'].forEach(function(k){
  var v=tctx.TXT[k];if(!v||(Array.isArray(v)?!v.length:!Object.keys(v).length))P.push('texts.js: TXT.'+k+' kosong / hilang');
});
/* sisa pola lama */
var js=jsFiles.map(function(f){return rd('js/'+f);}).join('\n');
['TELE_SCOPE_MESSAGES','TERM_POOL','TERM_PROMPTS','TG_POOL'].forEach(function(k){if(new RegExp('var '+k+'=[\\[{]').test(js))P.push('js/*.js: '+k+' masih literal (harus TXT.'+k+', data ada di texts.js)');});
if(/\/08\b/.test(html)&&/sr-count/.test(html)&&/<em>00<\/em>\/08/.test(html))P.push('index.html: hitungan /08 hardcoded');
if(/getElementById\('(?:betel|rigel|sirius|pleione|aldebaran|arcturus|antares)-fx'\)/.test(js))P.push('js/*.js: tombol -fx per-bintang hardcoded (pakai FXBTN[key])');
if(P.length){console.log('MASALAH ('+P.length+'):');P.forEach(function(m){console.log(' - '+m);});process.exit(1);}
console.log('OK — '+ctx.SKY.rasi.length+' rasi, '+ctx.SKY.sfx.length+' SFX, '+ctx.SKY.sectors.length+' sektor');
