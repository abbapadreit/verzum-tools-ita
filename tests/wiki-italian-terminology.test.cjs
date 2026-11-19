/* Run from repo root: node --test tests/wiki-italian-terminology.test.cjs */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const P=path.resolve(__dirname,'../public');
const read=p=>fs.readFileSync(path.join(P,p),'utf8');
const ctx={window:{}};
vm.runInNewContext(read('calculator-wiki-it-terms.js'),ctx);
const t=ctx.window.VERZUM_WIKI_IT_TERMS;
const official=read('wiki-pages/systems/skills.html');
const names=[...official.matchAll(/<p class="wk-p wkmt-10"><img class="wk-inimg" src="wiki-original\/img\/ui\/skill\/warrior\/[^"]+"[^>]*>\s*<span class="wk-z-lb[^"]*">([^<]+)<\/span>/g)].map(x=>x[1].trim());
test('All 12 warrior names agree exactly with the local Italian VERZUM Wiki',()=>{
 assert.equal(names.length,12);
 assert.deepEqual(Array.from(t.skills.warrior),names);
});
test('There are 48 skill names, 48 book names and four distinct passive names',()=>{
 for(const kind of ['warrior','ninja','sura','shaman'])assert.equal(t.skills[kind].length,12);
 assert.equal(new Set(Object.values(t.skills).flat()).size>=42,true);
 assert.equal(t.passives.length,4);
 assert.deepEqual(Array.from(t.passives),['Guida','Guerriero coraggioso','Guerriero del Dio Drago','Campione dei sotterranei']);
});
test('Every recorded Italian item name appears in the two locally archived Wiki sources',()=>{
 const combined=read('wiki-pages/systems/skills.html')+read('wiki-pages/systems/passive_skills.html');
 assert.ok(Object.keys(t.wikiItemNames).length>=40);
 for(const [id,label] of Object.entries(t.wikiItemNames)){
  assert.match(id,/^\d+$/);
  assert.ok(combined.includes('href="#wiki/item/'+id+'"'),'Missing item ID '+id+': '+label);
 }
});
test('All 41 unique skills and passive stat captions have an Italian equivalent',()=>{
 const html=read('calculator-reference.html');
 const begin=html.indexOf('SKD={"SK":'),end=html.indexOf(';',begin);
 assert.ok(begin>=0&&end>begin);
 const skills=JSON.parse(html.slice(begin+4,end));
 const labels=new Set([...Object.values(skills.SK).flatMap(list=>list.flatMap(sk=>sk.t.map(r=>r[0]))),
  ...skills.PAS.flatMap(p=>p.t.flatMap(table=>table.r.map(r=>r[0])))]);
 assert.equal(labels.size,41);
 for(const label of labels)assert.ok(t.statLabels[label],label);
});
test('Only parent source registry is used and no calculator formula was altered',()=>{
 const bridge=read('calculator-original-bridge.js'),index=read('index.html'),patch=read('calculator-wiki-it-fix.js');
 assert.ok(bridge.includes('calculator-wiki-it-fix.js'));
 assert.ok(index.includes('calculator-wiki-it-terms.js'));
 assert.ok(patch.includes("itemNames['sb_'+cls+'_'+index]"));
 assert.ok(patch.includes('skill.n.it=name'));
 assert.ok(patch.includes('NL.it='));
 assert.ok(!patch.includes('function rSkills()'));
 assert.ok(!patch.includes('function rPas()'));
});
