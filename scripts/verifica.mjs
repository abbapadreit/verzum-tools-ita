import {readFileSync,existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const base=new URL('../public/',import.meta.url);
const read=p=>readFileSync(new URL(p,base),'utf8');
const html=read('index.html'),app=read('app.js'),theme=read('theme-original.css'),guide=read('guide.js'),wiki=read('wiki.js'),official=read('wiki-official-guide.html'),originalHome=read('wiki-official-home.js');
const files=['style.css','theme-original.css','wiki.css','wiki-official.css','wiki-official-override.css','wiki-official-home.js','wiki-official.js','wiki-official-guide.html','guide.js','wiki.js','wiki-data.generated.js','app.js','advanced.js','release.js','item-translations.js','i18n.js','assets/icon-index.js','assets/extra-icons.js','robots.txt','assets/sidebar-logo.svg',...['it','en','ro','hu'].map(s=>'assets/flags/'+s+'.svg'),...Array.from({length:9},(_,i)=>'assets/real-icons-'+String(i).padStart(2,'0')+'.js')];
for(const f of files){
 const u=new URL(f,base);assert.ok(existsSync(u),'Risorsa mancante: '+f);
 if(f.endsWith('.js'))execFileSync(process.execPath,['--check',u.pathname]);
}
for(const link of ['style.css','theme-original.css','wiki.css','guide.js','wiki.js','wiki-data.generated.js','app.js','advanced.js','release.js','i18n.js','item-translations.js']){
 assert.ok(html.includes(link),'Manca collegamento HTML '+link);
}
for(const p of ['upgrade','gaya','pet','mount','costume','skills','passive','planner','prices','catalog','guide','wiki']){
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
assert.ok(guide.includes('https://images.verzum.to/item/')&&wiki.includes('https://images.verzum.to/item/'),'icone originarie URL ufficiale');
assert.ok(!guide.includes('wiki-icon-fallback')&&!wiki.includes('wiki-icon-fallback'),'Nessuna icona artificiale');
assert.ok(!guide.includes('Number(raw)-Number(raw)%10')&&!wiki.includes('Number(id)-Number(id)%10'),'Nessuna approssimazione ID icone');
assert.ok(guide.includes("href=(path)=>'#wiki'")&&wiki.includes("href=\"#wiki/"),'Collegamenti interni');
assert.ok(html.includes('data-nav="wiki"'),'Menu Wiki interna');

const originalCategories=['equipment','chests','items','costumes','metins','bosses','dungeons','systems','guides','events'];
const originalBanners=['pvm_banner','premium_banner','faq_banner'];
const originalIllustrations=['hero/vz_level_1_75','vzdg_gear_panel','boss_guide/boosters'];
const originalIds='50187 50188 50203 28550 28555 50189 3219 11279 12249 13049 14149 17109 16029 15049 85003 71143 100138 100142 100131 100130 100129 100132 100133 100134 1179 11479 12389 299 11679 12529 5119 11879 12669 124040 134040 144040 154040 114040 164040 50821'.split(' ');
for(const cat of originalCategories)assert.ok(existsSync(new URL('wiki-original/assets/5258621bfec0/img/wiki/cat/'+cat+'.png',base)),'Icona categoria originale mancante: '+cat);
for(const img of originalBanners)assert.ok(existsSync(new URL('wiki-original/img/ui/wiki/main_page/'+img+'.png',base)),'Banner originale mancante: '+img);
for(const img of originalIllustrations)assert.ok(existsSync(new URL('wiki-original/img/ui/wiki/'+img+'.png',base)),'Illustrazione originale mancante: '+img);
for(const id of originalIds)assert.ok(existsSync(new URL('wiki-original/items/'+id+'.png',base)),'Icona originale item mancante: '+id);
assert.ok(originalHome.includes('wiki-original/img/ui/wiki/main_page/pvm_banner.png'),'Homepage originale senza immagini locali');
assert.ok(originalHome.includes('wiki-original/assets/5258621bfec0/img/wiki/cat/equipment.png'),'Sidebar originale senza icone locali');
for(const n of [1,2,3,4,5,6,7,8,9])assert.ok(official.includes('id="s'+n+'"'),'Sezione guida originale mancante: '+n);
assert.equal(new Set([...official.matchAll(/(?:wiki-original\/items\/|https:\/\/images\.verzum\.to\/item\/)(\d+)\.png/g)].map(m=>m[1])).size,59,'Tutti i 59 ID originali della guida');
assert.ok(!/href="https:\/\/wiki\.verzum\.to\/it\//.test(official),'Link esterni non riscritti nella guida');
assert.ok(html.includes('wiki-official.js')&&html.includes('wiki-official.css'),'Interfaccia originale Wiki non collegata');
assert.ok(app.includes("classList.toggle('wiki-mode'"),'Modalità Wiki isolata non configurata');
console.log('OK: '+files.length+' risorse, 12 sezioni, 147 oggetti, 44 evoluzioni, struttura Wiki originale, 16 PNG grafici e 40 icone item autentiche, lingue, responsive.');
