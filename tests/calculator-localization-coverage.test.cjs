/* Verifica delle etichette Wiki nei calcolatori incorporati senza toccare formule o dati. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const publicRoot=path.join(__dirname,'../public');
const load=name=>fs.readFileSync(path.join(publicRoot,name),'utf8');
const ctx={window:{}};
vm.runInNewContext(load('calculator-wiki-it-terms.js'),ctx);
const terms=ctx.window.VERZUM_WIKI_IT_TERMS;
test('Bonus in costume: cediglia, diacritici e percentuali hanno etichette italiane',()=>{
 const frame={
  window:{parent:{VERZUM_WIKI_IT_TERMS:terms},addEventListener(){}},
  SKD:{SK:{},PAS:[]},NL:{it:{i:{},m:{}}},LANG:'it',
  hrs:v=>String(v),tx:v=>String(v),rSkills(){},rPas(){},trNode(){},
  document:{body:{},querySelector(){return null}},
  MutationObserver:class{observe(){}},requestAnimationFrame(){},
  location:{hash:'#costume',origin:'https://verzum-tools-ita.pages.dev'},
  NodeFilter:{SHOW_TEXT:4},console
 };
 vm.runInNewContext(load('calculator-wiki-it-fix.js'),frame);
 assert.equal(frame.tx('Tare împotriva monștrilor +2%'),'Forza contro i mostri +2%');
 assert.equal(frame.tx('Tare împotriva monştrilor +2%'),'Forza contro i mostri +2%');
 assert.equal(frame.tx('Tare împotriva Pietrelor metin +2%'),'Forza contro le pietre Metin +2%');
 assert.equal(frame.tx('Șansă de drop extra de lingou +5%'),'Probabilità di ottenere lingotti extra +5%');
 assert.equal(frame.tx('Omoară'),'Sconfiggi');
 assert.ok(frame.window.VERZUM_IT_WIKI_SKILL_FIX.auditAll);
 assert.ok(frame.window.VERZUM_IT_WIKI_SKILL_FIX.repair);
});
test('Ladd-on è installato in tutte le otto sezioni del calcolatore originale',()=>{
 const bridge=load('calculator-original-bridge.js');
 for(const route of ['upgrade','gaya','pet','mount','costume','skills','passive','prices'])
  assert.ok(bridge.includes(route+':'),'Missing route '+route);
 assert.ok(bridge.includes('installItalianWikiTerms(doc)'));
});
test('I nomi italiani dei libri e i dati del calcolatore rimangono separati dalla correzione dei testi',()=>{
 const patch=load('calculator-wiki-it-fix.js');
 assert.ok(patch.includes("itemNames['sb_'+cls+'_'+index]"));
 assert.ok(patch.includes('skill.n.it=name'));
 assert.ok(!patch.includes('function rCost('));
 assert.ok(!patch.includes('function rCrafting('));
 assert.ok(!patch.includes('function calc('));
});
test('Le altre lingue non ricevono automaticamente etichette italiane',()=>{
 const frame={
  window:{parent:{VERZUM_WIKI_IT_TERMS:terms},addEventListener(){}},
  SKD:{SK:{},PAS:[]},NL:{it:{i:{},m:{}}},LANG:'en',
  hrs:v=>String(v),tx:v=>String(v),rSkills(){},rPas(){},trNode(){},
  document:{body:{},querySelector(){return null}},
  MutationObserver:class{observe(){}},requestAnimationFrame(){},
  location:{hash:'#costume',origin:'https://verzum-tools-ita.pages.dev'},
  NodeFilter:{SHOW_TEXT:4},console
 };
 vm.runInNewContext(load('calculator-wiki-it-fix.js'),frame);
 assert.equal(frame.tx('Tare împotriva monștrilor +2%'),'Tare împotriva monștrilor +2%');
});
test('Le 25 lingue aggiuntive sono dichiarate parziali, non presentate come complete',()=>{
 const world=load('i18n-world.js');
 assert.match(world,/partial":true/);
 const locale=load('i18n.js');
 assert.ok(locale.includes('Partial translation'));
 assert.ok(locale.includes("['it','en','ro','hu']"));
});
