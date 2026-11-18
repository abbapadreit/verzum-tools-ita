/* Run: node --test tests/wiki-live-hotfix.test.cjs */
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'../public');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const categories=['boss_beginner','boss_tier1','boss_tier2','boss_tier3','boss_tier4','boss_dungeon_mini','boss_dungeon'];
const assoc={5163:'monkey',694:'orc',792:'esoteric',2092:'spider',1093:'demon_tower',2598:'azrael',1095:'triad',2493:'dragon',100010:'gnoll',100011:'triton',6091:'razador',6191:'nemere'};
test('61 linked boss pages and 12 verified dungeon guides',()=>{
 const linked=new Set(categories.flatMap(cat=>[...read('wiki-pages/bosses/'+cat+'.html').matchAll(/<a class="wk-namebar__name" href="#wiki\/mob\/(\d+)"/g)].map(m=>m[1])));
 assert.equal(linked.size,61);
 const mount=read('wiki-boss-mount.js');
 for(const id of linked)assert.ok(mount.includes("'"+id+"'"),'Missing boss '+id);
 for(const [id,dungeon] of Object.entries(assoc)){
  assert.ok(linked.has(id));
  assert.ok(mount.includes("'"+id+"':'"+dungeon+"'"),id);
  const html=read('wiki-pages/dungeons/'+dungeon+'.html');
  for(const title of ['Equipaggiamento consigliato','Abilità consigliate','Bonus totali consigliati','Consumabili e potenziamenti consigliati'])assert.ok(html.includes(title),dungeon+': '+title);
  assert.ok(html.includes('href="#wiki/mob/'+id+'"'),dungeon+': '+id);
 }
});
test('all 68 different guide images refer to existing local files',()=>{
 const html=read('wiki-official-guide.html');
 const imgs=[...html.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/g)].map(m=>m[1]);
 assert.ok(imgs.length>=100);
 assert.equal(new Set(imgs).size,68);
 for(const img of imgs){assert.match(img,/^wiki-original\//);assert.ok(fs.existsSync(path.join(root,img)),img)}
 assert.doesNotMatch(html,/https:\/\/wiki\.verzum\.to\/img\/ui\/key_buttons\//);
 assert.doesNotMatch(html,/https:\/\/images\.verzum\.to\/item\//);
});
test('standalone mount, CSS and refreshed HTML are wired',()=>{
 const index=read('index.html'),mount=read('wiki-boss-mount.js'),wiki=read('wiki-official.js');
 assert.ok(index.indexOf('wiki-boss-recommendations.js')<index.indexOf('wiki-boss-mount.js'));
 assert.ok(index.includes('wiki-boss-recommendations.css'));
 assert.ok(mount.includes('new MutationObserver(schedule)'));
 assert.ok(mount.includes('wk-page--mob'));
 assert.ok(mount.includes('unavailable.has(dungeon)'));
 assert.ok(mount.includes("cache:'no-cache'"));
 assert.ok(wiki.includes('wiki-official-guide.html?v=20261118-1'));
 assert.ok(!index.includes('verzum-build-tools.js'));
});
test('visual render module contains original equipment, alchemy and skill sections',()=>{
 const env={window:{}};vm.runInNewContext(read('wiki-boss-recommendations.js'),env);
 const api=env.window.VERZUM_BOSS_RECOMMENDATIONS;
 assert.equal(Object.keys(api.classes).length,4);
 assert.equal(typeof api.render,'function');
 assert.equal(typeof api.renderGeneric,'function');
 const source=read('wiki-boss-recommendations.js');
 for(const symbol of ['.wk-vz--gear','.wk-alch__row','Abilità di Buffi','Abilità passive','Consumabili e potenziamenti consigliati'])
  assert.ok(source.includes(symbol),symbol);
});
