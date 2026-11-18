/* Run: node --test tests/wiki-boss-guide.test.cjs
   Structural integrity of all 61 Wiki boss entries and locally mirrored dungeon recommendations. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'../public');
const load=p=>fs.readFileSync(path.join(root,p),'utf8');
const folders=['boss_beginner','boss_tier1','boss_tier2','boss_tier3','boss_tier4','boss_dungeon_mini','boss_dungeon'];
const dungeons={5163:'monkey',694:'orc',792:'esoteric',2092:'spider',1093:'demon_tower',2598:'azrael',1095:'triad',2493:'dragon',100010:'gnoll',100011:'triton',6091:'razador',6191:'nemere'};
test('seven boss lists cover 61 distinct bosses',()=>{
 const found=new Set();
 for(const id of folders){
  const html=load('wiki-pages/bosses/'+id+'.html');
  for(const match of html.matchAll(/<a class="wk-namebar__name" href="#wiki\/mob\/(\d+)"/g)){
   assert.ok(fs.existsSync(path.join(root,'wiki-pages/mob',match[1]+'.html')),match[1]);
   found.add(match[1]);
  }
 }
 assert.equal(found.size,61);
});
test('every dungeon boss is grounded in a unique official dungeon Wiki page',()=>{
 assert.equal(Object.keys(dungeons).length,12);
 for(const [id,dungeon] of Object.entries(dungeons)){
  const html=load('wiki-pages/dungeons/'+dungeon+'.html');
  assert.ok(html.includes('wk-dginfo__row'),dungeon);
  assert.ok(html.includes('Equipaggiamento consigliato'),dungeon);
  assert.ok(html.includes('Abilità consigliate'),dungeon);
  assert.ok(html.includes('Consumabili e potenziamenti consigliati'),dungeon);
  assert.ok(html.includes('Bonus totali consigliati'),dungeon);
  assert.ok(html.includes('href="#wiki/mob/'+id+'"'),dungeon+' must point to '+id);
 }
});
test('guide 1-75 uses only local and existing PNG references',()=>{
 const html=load('wiki-official-guide.html');
 assert.doesNotMatch(html,/<img\b[^>]*\bsrc="https?:/);
 const images=[...html.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/g)].map(m=>m[1]);
 assert.ok(images.length>=100,'guide must keep artwork');
 for(const image of images){
  assert.ok(image.startsWith('wiki-original/'),image);
  assert.ok(fs.existsSync(path.join(root,image)),image+' missing from repository');
 }
});
test('visual recommendation panel covers gear, alchemy, all support skills and consumables',()=>{
 const template=load('wiki-boss-recommendations.js');
 const app=load('verzum-build-tools.js');
 const index=load('index.html');
 assert.match(template,/function renderGeneric\(/);
 assert.match(template,/function mainGear\(/);
 assert.match(template,/function alchemy\(/);
 assert.match(template,/Abilità passive/);
 assert.match(template,/Abilità di Buffi/);
 assert.match(template,/Consumabili e potenziamenti consigliati/);
 for(const [id,dungeon] of Object.entries(dungeons))
  assert.ok(app.includes("'"+id+"':'"+dungeon+"'"),id+' missing from app map');
 assert.ok(index.indexOf('wiki-boss-recommendations.js')<index.indexOf('verzum-build-tools.js'));
});
