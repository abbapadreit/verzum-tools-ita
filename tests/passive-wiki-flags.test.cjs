/* Run with node --test tests/passive-wiki-flags.test.cjs */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'../public');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
test('passive Wiki contains 4 primary skills, 40 linked items and complete artwork',()=>{
 const html=read('wiki-pages/systems/passive_skills.html');
 const images=[...new Set([...html.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/g)].map(x=>x[1]))];
 const ids=[...new Set([...html.matchAll(/href="#wiki\/item\/(\d+)"/g)].map(x=>x[1]))];
 assert.equal(images.length,58);
 assert.equal(ids.length,40);
 for(const file of images){
  assert.ok(file.startsWith('wiki-original/'),file);
  assert.ok(fs.existsSync(path.join(root,file)),file+' must be available locally');
 }
 for(const title of ['Guida','Guerriero coraggioso','Guerriero del Dio Drago','Campione dei sotterranei','4.1 Maestro delle abilità','4.2 Maestro passivo','4.3 Erborista','4.4 Benedizione del Mare'])
  assert.ok(html.includes(title),title);
});
test('calculator Wiki overlay preserves source and original native cost engine',()=>{
 const tree=read('calculator-passive-wiki-tree.js'),bridge=read('calculator-original-bridge.js');
 assert.ok(tree.includes('wiki-pages/systems/passive_skills.html'));
 assert.ok(tree.includes('data-pi'));
 assert.ok(tree.includes('verzum_passive_wiki_tree_v1'));
 assert.ok(tree.includes("bookRows.map("));
 assert.ok(bridge.includes("frame.dataset.nativeRoute==='passive'"));
 assert.ok(bridge.includes('calculator-passive-wiki-tree.js'));
 assert.ok(bridge.includes('calculator-passive-wiki-tree.css'));
 assert.doesNotMatch(tree,/\bfunction rPas\(/);
});
test('colored offline SVGs cover all 29 sidebar language variants',()=>{
 const ctx={window:{},encodeURIComponent};
 for(const file of ['flags-europe-a.js','flags-world-b.js','language-flags.js'])vm.runInNewContext(read(file),ctx);
 const langs=ctx.window.VERZUM_FLAG_SVGS;
 const codes=Object.keys(langs.codes);
 assert.equal(codes.length,29);
 for(const code of codes){
  const image=langs.url(code);
  assert.ok(image.startsWith('data:image/svg+xml;charset=utf-8,'),code);
  assert.ok(decodeURIComponent(image).includes('<svg'),code);
 }
 assert.ok(read('index.html').includes('language-flag-dropdown.js'));
 assert.ok(read('index.html').includes('language-flag-dropdown.css'));
});
