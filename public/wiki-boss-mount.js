/* Independent Wiki boss preparation mount. Runs on the current production Wiki
   without requiring the unfinished PvM 2.0 dashboard. */
(function(){
'use strict';
if(window.VERZUM_BOSS_MOUNT)return;
const API=window.VERZUM_BOSS_RECOMMENDATIONS;
const host=document.getElementById('panels');
if(!host||!API)return;
const linkedDungeon={
 '5163':'monkey','694':'orc','792':'esoteric','2092':'spider','1093':'demon_tower',
 '2598':'azrael','1095':'triad','2493':'dragon','100010':'gnoll','100011':'triton',
 '6091':'razador','6191':'nemere'
};
const bossIds=new Set([
 '191','192','193','194','491','492','493','494','531','532','533','534','591',
 '691','2191','791','1304','1901','2091','2206','2306','2307','4700','2492',
 '3090','3190','3290','3291','3391','3490','3590','3591','3595','3690','3691',
 '3790','3890','3891','3091','3390','3491','3791','2597','2495','21837',
 '100122','100123','6051','6151','5163','694','792','2092','1093','2598',
 '1095','2493','100010','100011','6091','6191'
]);
const templates=new Map(),requests=new Map(),unavailable=new Set();
const rootId='vz-wiki-boss-preparation';
let chosenClass='Guerriero',scheduled=false;
try{const saved=localStorage.getItem('vz_wiki_boss_class');if(API.classes[saved])chosenClass=saved}catch(_){}
function currentId(){
 const match=location.hash.match(/^#wiki\/mob\/(\d+)(?:\?.*)?$/);
 return match&&bossIds.has(match[1])?match[1]:null;
}
function title(page){
 return page.querySelector('.wk-namebar__name')?.textContent?.trim()||'Boss';
}
function template(id){
 const dungeon=linkedDungeon[id];
 return dungeon?templates.get(dungeon)||null:null;
}
function parse(response){
 if(!response.ok)throw Error('HTTP '+response.status);
 return response.text().then(content=>{
  const html=new DOMParser().parseFromString(content,'text/html');
  const node=html.querySelector('.wk-page--dungeon');
  if(!node||!node.querySelector('.wk-vz--gear'))throw Error('Dungeon Wiki incompleto');
  return node;
 });
}
function ensureDungeon(id){
 const dungeon=linkedDungeon[id];
 if(!dungeon||templates.has(dungeon)||requests.has(dungeon)||unavailable.has(dungeon))return;
 // Cache revalidation prevents stale Pages deployments and browser-cached data.
 const promise=fetch('wiki-pages/dungeons/'+dungeon+'.html',{cache:'no-cache'})
  .then(parse)
  .then(node=>{templates.set(dungeon,node)})
  .catch(error=>{unavailable.add(dungeon);console.warn('[VERZUM Boss] Impossibile caricare dungeon',dungeon,error)})
  .finally(()=>{requests.delete(dungeon);schedule()});
 requests.set(dungeon,promise);
}
function mountFor(id,page){
 let slot=page.querySelector('#'+rootId);
 if(!slot){
  slot=document.createElement('div');
  slot.id=rootId;slot.dataset.vzbFor=id;
  slot.setAttribute('aria-live','polite');
  page.appendChild(slot);
 }
 if(slot.dataset.vzbFor!==id){slot.dataset.vzbFor=id;slot.innerHTML='';}
 const dungeon=linkedDungeon[id],source=template(id),name=title(page);
 const key=[id,chosenClass,source?'ready':dungeon&&!unavailable.has(dungeon)?'loading':'generic'].join(':');
 if(slot.dataset.vzbKey===key)return;
 slot.dataset.vzbKey=key;
 if(dungeon&&!source){
  ensureDungeon(id);
  if(requests.has(dungeon)){
   slot.innerHTML='<section class="vzw-boss-advice"><p class="vzw-small">Caricamento equipaggiamento, alchimia e abilità consigliati dalla Wiki…</p></section>';
   return;
  }
 }
 try{
  if(source)slot.innerHTML=API.render(source,chosenClass,name,'wiki/dungeons/'+dungeon);
  else slot.innerHTML=API.renderGeneric(page,chosenClass,name,{supports:{},supportNotes:{}});
 }catch(error){
  console.warn('[VERZUM Boss] Errore scheda',id,error);
  slot.innerHTML=API.renderGeneric(page,chosenClass,name,{supports:{},supportNotes:{}});
 }
}
function addShortcuts(){
 if(!/^#wiki\/bosses\/boss_/.test(location.hash))return;
 for(const row of host.querySelectorAll('.vz-wiki .wk-page--list article.wk-row')){
  const link=row.querySelector('a.wk-namebar__name[href^="#wiki/mob/"]');
  if(!link||row.querySelector('.vzw-shortcut'))continue;
  const control=document.createElement('a');
  control.className='vzw-shortcut';control.href=link.getAttribute('href');
  control.textContent='Preparazione consigliata';
  control.setAttribute('aria-label','Apri la preparazione per '+link.textContent.trim());
  row.querySelector('.wk-namebar')?.appendChild(control);
 }
}
function run(){
 addShortcuts();
 const id=currentId();
 if(!id)return;
 const page=host.querySelector('.vz-wiki .wk-page--mob');
 if(!page)return;
 // The site replaces the Wiki markup asynchronously after route changes.
 const model=page.querySelector('.wk-model[data-vnum]');
 if(model&&model.getAttribute('data-vnum')!==id)return;
 mountFor(id,page);
}
function schedule(){
 if(scheduled)return;
 scheduled=true;
 queueMicrotask(()=>{scheduled=false;run()});
}
host.addEventListener('click',event=>{
 const btn=event.target.closest('#'+rootId+' [data-vzw-class]');
 if(!btn||!API.classes[btn.dataset.vzwClass])return;
 event.preventDefault();
 chosenClass=btn.dataset.vzwClass;
 try{localStorage.setItem('vz_wiki_boss_class',chosenClass)}catch(_){}
 const slot=btn.closest('#'+rootId);
 if(slot)delete slot.dataset.vzbKey;
 schedule();
});
new MutationObserver(schedule).observe(host,{childList:true,subtree:true});
window.addEventListener('hashchange',schedule);
window.VERZUM_BOSS_MOUNT={get bosses(){return bossIds.size},get officialDungeons(){return Object.keys(linkedDungeon).length},refresh:schedule};
schedule();
})();