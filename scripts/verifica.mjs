import {readFileSync,existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const base=new URL('../public/',import.meta.url);
const read=p=>readFileSync(new URL(p,base),'utf8');
const html=read('index.html'),app=read('app.js'),theme=read('theme-original.css');
const files=['style.css','theme-original.css','app.js','advanced.js','release.js','item-translations.js','i18n.js','assets/icon-index.js','assets/extra-icons.js','robots.txt','assets/sidebar-logo.svg',...['it','en','ro','hu'].map(s=>'assets/flags/'+s+'.svg'),...Array.from({length:9},(_,i)=>'assets/real-icons-'+String(i).padStart(2,'0')+'.js')];
for(const f of files){
 const u=new URL(f,base);assert.ok(existsSync(u),'Risorsa mancante: '+f);
 if(f.endsWith('.js'))execFileSync(process.execPath,['--check',u.pathname]);
}
for(const link of ['style.css','theme-original.css','app.js','advanced.js','release.js','i18n.js','item-translations.js']){
 assert.ok(html.includes(link),'Manca collegamento HTML '+link);
}
for(const p of ['upgrade','gaya','pet','mount','costume','skills','passive','planner','prices','catalog']){
 assert.ok(html.includes('data-nav="'+p+'"'),'Manca sezione '+p);
}
const dat=JSON.parse(read('release.js').split('window.VERZUM_RELEASE=')[1].trim().replace(/;$/,''));
assert.equal(dat.catalog.length,147,'catalogo oggetti');
assert.equal(new Set(dat.catalog.map(i=>i.id)).size,147,'ID oggetti unici');
assert.equal(dat.catalog.filter(i=>i.evolution).length,44,'evoluzioni disponibili');
for(const i of dat.catalog){assert.ok(i.steps.length,'oggetto senza passaggi: '+i.id);for(const s of i.steps){assert.ok(s.pct>=0&&s.pct<=100,'probabilita non valida: '+i.id);assert.ok(s.yang>=0,'costo negativo: '+i.id)}}
const sumYang=id=>dat.catalog.find(i=>i.id===id).steps.reduce((a,s)=>a+s.yang,0);
assert.equal(sumYang('270'),140000000,'Spada di Tritone +0/+9 senza fallimenti');
assert.equal(sumYang('140'),12250000,'Spada da Battaglia +0/+9 senza fallimenti');
assert.equal(sumYang('140')+dat.catalog.find(i=>i.id==='140').evolution.yang,62250000,'Spada da Battaglia + evoluzione');
assert.equal(dat.reference.sys.gaya.yang,200000,'Yang di base Gaya');
assert.equal(dat.gaya.offers.length,18,'Offerte Gaya');
assert.equal(dat.reference.sys.pet.types.length,5,'Progressione tipo pet');
assert.equal(dat.costumes.length,12,'Aspetti pet');
assert.ok(dat.reference.sys.mount.skills.length>0,'Abilita mount');
assert.ok(dat.reference.sys.pet.skills.length>0,'Abilita pet');
assert.ok(Object.keys(dat.prices).length>=60,'Materiali con prezzo impostabile');
for(const c of ['#0A0303','#2A0C0C','#8E3437','#C5996C','#F2DCA4']) assert.ok(theme.includes(c),'Colore mancante: '+c);
assert.ok(html.includes('class="sidebar-languages"')&&html.includes('class="header-languages"'),'Selettori lingue');
assert.ok(html.includes('menu-toggle'),'Menu mobile');
assert.ok(!html.includes('class="notice"')&&!html.includes('side-footer'),'Avvisi pubblici non rimossi');
assert.ok(app.includes('range.evolution'),'Evoluzione non collegata');
assert.ok(app.includes('p.fails?.[i]'),'Pity pet non separato');
console.log('OK: '+files.length+' risorse, 10 sezioni, 147 oggetti, 44 evoluzioni, Gaya, pet, mount, costumi, palette, lingue, responsive.');
