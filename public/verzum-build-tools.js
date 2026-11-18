/* VERZUM 2.0 — Wiki interactive PvM + profile + bosses + Guide 1–75.
   Only in-game measured damage and actual Wiki thresholds; no invented combat formula. */
(function(){
'use strict';
const host=document.getElementById('panels'),core=window.VERZUM_PVM_CORE;
if(!host||!core||window.VERZUM_BUILD_TOOLS)return;
const KEY='verzum_pvm_build_v2',OLD='verzum_pvm_build_v1',guidePath='wiki/guides/vz_level_1_75';
const classes={Guerriero:'warrior',Ninja:'ninja',Sura:'sura',Sciamano:'shaman'};
const supports={pet:'Pet',mount:'Cavalcatura',buff:'Buff',alchemy:'Alchimia',talisman:'Talismano',premium:'Equipaggiamento premium'};
const dungeonPaths=['monkey','orc','esoteric','spider','demon_tower','azrael','dragon','triad','gnoll','triton','razador','nemere'];
const dungeonNames={monkey:'Scimmie',orc:'Orchi',esoteric:'Esoterici',spider:'Ragni',demon_tower:'Torre dei Demoni',azrael:'Azrael',dragon:'Drago',triad:'Morte Blu',gnoll:'Gnoll',triton:'Tritone',razador:'Razador',nemere:'Nemere'};
const bossDungeon={'5163':'monkey','694':'orc','792':'esoteric','2092':'spider','1093':'demon_tower','2598':'azrael','1095':'triad','2493':'dragon','100010':'gnoll','100011':'triton','6091':'razador','6191':'nemere'};
const cache=new Map(),pending=new Set(),missing=new Set();
const defaults=()=>({name:'Personaggio principale',class:'Guerriero',level:55,measuredDps:0,
 bonuses:{},supports:{pet:false,mount:false,buff:false,alchemy:false,talisman:false,premium:false},
 supportNotes:{},owned:{},tasks:{},damage:{normal:0,critical:0,criticalRate:0,hitsPerSecond:0,uptime:100},
 scenarios:{baseline:0,optimized:0},farmingByDungeon:{},farming:{dungeon:'spider',runs:1,lootPerRun:0,expensesPerRun:0,ticketPerRun:0,minutesPerRun:0}});
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const str=(value,length=120)=>String(value??'').slice(0,length);
const fmt=n=>Number.isFinite(n)?new Intl.NumberFormat('it-IT',{maximumFractionDigits:1}).format(n):'—';
const url=()=>{try{return decodeURIComponent(location.hash.slice(1))}catch(_){return ''}};
function load(){
 let raw=null;for(const key of [KEY,OLD]){try{raw=JSON.parse(localStorage.getItem(key)||'null');if(raw)break}catch(_){}}
 const p=defaults();
 if(raw&&typeof raw==='object'){
  for(const k of ['name','class','level','measuredDps'])if(raw[k]!=null)p[k]=raw[k];
  for(const k of ['bonuses','supports','supportNotes','owned','tasks','damage','scenarios','farmingByDungeon','farming'])
   if(raw[k]&&typeof raw[k]==='object'&&!Array.isArray(raw[k]))p[k]={...p[k],...raw[k]};
 }
 if(!classes[p.class])p.class='Guerriero';
 p.level=core.safe(p.level,1,120)||55;
 return p;
}
let profile=load();
function persist(){try{localStorage.setItem(KEY,JSON.stringify(profile))}catch(_){}
 document.dispatchEvent(new CustomEvent('verzum:pvm-profile-updated',{detail:{level:profile.level,class:profile.class}}));
}
function canonicalWiki(text){
 const original=String(text||'').trim().replace(/[’]/g,"'");
 return (window.VERZUM_LOCALE?.normalized?.(original)||original).replace(/[’]/g,"'");
}
function readTitle(page){
 return page?.closest('.wiki-main')?.querySelector('.wk-head__title')?.textContent.trim()
  ||page?.querySelector('.wk-namebar__name')?.textContent.trim()
  ||'Boss';
}
function readInfo(page,label){
 const row=[...(page?.querySelectorAll('.wk-dginfo__row')||[])].find(el=>
  canonicalWiki(el.querySelector('.wk-dginfo__k')?.textContent).toLowerCase()===canonicalWiki(label).toLowerCase());
 return row?.querySelector('.wk-dginfo__v')?.textContent.trim()||'';
}
function bonusGoals(page){
 const section=[...(page?.querySelectorAll('section')||[])].find(s=>
  canonicalWiki(s.querySelector('.wk-vzhead')?.textContent)==='Bonus totali consigliati');
 return [...(section?.querySelectorAll('tbody tr')||[])].map(tr=>{
  const cells=tr.querySelectorAll('td');if(cells.length<2)return null;
  const name=canonicalWiki(cells[0].textContent),label=cells[1].textContent.trim();
  const match=label.match(/([+]?\d[\d.,]*)\s*(%)?\.?\s*$/);
  const number=match?core.number(match[1].replace(/\.$/,'')):null;
  return name&&number!==null?{name,target:number,unit:match[2]?'%':'',label}:null;
 }).filter(Boolean);
}
function recommended(page,kind){
 let scope=null;
 if(kind==='gear'){
  scope=[...(page?.querySelectorAll('section')||[])].find(s=>canonicalWiki(s.querySelector('.wk-vzhead')?.textContent).includes('Equipaggiamento consigliato'));
  const code=classes[profile.class],btn=scope?.querySelector('[data-class="'+code+'"]');
  const panel=btn?.getAttribute('aria-controls')?scope.querySelector('[id="'+btn.getAttribute('aria-controls')+'"]'):null;
  scope=panel||scope?.querySelector('.wk-tabpanel[data-panel="'+(['warrior','ninja','sura','shaman'].indexOf(code))+'"]');
 }else if(kind==='alchemy')scope=page?.querySelector('.wk-alch');
 else if(kind==='consumables')scope=[...(page?.querySelectorAll('section')||[])].find(s=>canonicalWiki(s.querySelector('.wk-vzhead')?.textContent).includes('Consumabili'));
 const seen=new Set();
 return [...(scope?.querySelectorAll('a.wk-ic[href^="#wiki/item/"]')||[])].map(a=>{
  const id=a.getAttribute('href').split('/').pop();
  if(!/^\d+$/.test(id)||seen.has(id))return null;seen.add(id);
  const title=(a.querySelector('img')?.getAttribute('alt')||'').trim();
  let name=title;
  try{const tips=JSON.parse(a.getAttribute('data-tip-full')||'[]');name=tips.find(x=>x.kind==='title')?.text||title}catch(_){}
  const lv=name.match(/\+(\d{1,2})\s*$/);
  return {id,name:name||'Oggetto '+id,upgrade:lv?Number(lv[1]):null,src:a.querySelector('img')?.getAttribute('src')||''};
 }).filter(Boolean);
}
function recommendedSkills(page,keyword){
 const section=[...(page?.querySelectorAll('section')||[])].find(s=>canonicalWiki(s.querySelector('.wk-vzhead')?.textContent).includes('Abilità consigliate'));
 const table=[...(section?.querySelectorAll('table')||[])].find(t=>[...t.querySelectorAll('thead th')].some(th=>canonicalWiki(th.textContent).includes(canonicalWiki(keyword))));
 return [...(table?.querySelectorAll('tbody tr')||[])].map(tr=>{
  const cells=tr.querySelectorAll('td');
  if(cells.length<2)return null;
  return {name:cells[0].textContent.trim(),recommended:cells[1].textContent.trim()};
 }).filter(x=>x&&x.name);
}
function dungeonInfo(page,r){
 const isDungeon=r.startsWith('wiki/dungeons/');
 const title=readTitle(page);
 const mobId=(r.match(/^wiki\/mob\/(\d+)$/)||[])[1];
 const mobText=page?.textContent||'';
 const hp=isDungeon?core.number(readInfo(page,'PV del boss')):core.number(mobText.match(/HP max:\s*([\d.,]+\s*(?:kkk|kk|k)?)/i)?.[1]);
 return {title,hp:hp||null,dps:core.number(readInfo(page,'DPS consigliato'))||null,
  access:readInfo(page,"Livello d'accesso"),race:readInfo(page,'Forte contro')||mobText.match(/Razza:\s*(\w+)/)?.[1]||'',
  element:readInfo(page,'Elemento')||'',goals:bonusGoals(page),mobId,
  link:isDungeon?r:(mobId&&bossDungeon[mobId]?'wiki/dungeons/'+bossDungeon[mobId]:null)};
}
function ensureDungeon(id){
 if(!dungeonPaths.includes(id)||pending.has(id)||missing.has(id)||cache.has(id))return;
 pending.add(id);
 fetch('wiki-pages/dungeons/'+id+'.html',{cache:'force-cache'}).then(async r=>{
  if(!r.ok)throw Error('HTTP '+r.status);
  const source=await r.text();
  if(!source.includes('wk-page--dungeon'))throw Error('Invalid Wiki page');
  const html=new DOMParser().parseFromString(source,'text/html');
  const page=html.querySelector('.wk-page--dungeon');
  if(!page)throw Error('Missing dungeon data');
  cache.set(id,{page,info:dungeonInfo(page,'wiki/dungeons/'+id)});
 }).catch(()=>missing.add(id)).finally(()=>{
  pending.delete(id);
  const active=url();
  if(active==='build'||active===guidePath||active.startsWith('wiki/mob/'))refresh();
 });
}
function effectiveDps(){
 const measured=core.safe(profile.measuredDps,0)||0;
 const byHits=core.observedDps(profile.damage);
 return measured>0?measured:byHits;
}
function field(key,title,type='text',min=0,max=10000000000,placeholder=''){
 const value=profile[key]??'';
 return '<label>'+esc(title)+'<input data-vzw-field="'+esc(key)+'" type="'+type+'"'+(type==='number'?' min="'+min+'" max="'+max+'" step="any"':'')+
  ' value="'+esc(value)+'" placeholder="'+esc(placeholder)+'"></label>';
}
function profileFields(){
 return '<div class="vzw-grid">'+field('name','Nome personaggio')+
  '<label>Classe<select data-vzw-field="class">'+Object.keys(classes).map(cls=>'<option'+(cls===profile.class?' selected':'')+'>'+esc(cls)+'</option>').join('')+'</select></label>'+
  field('level','Livello', 'number',1,120)+field('measuredDps','DPS misurato in gioco','number',0,10000000000,'Opzionale')+'</div>';
}
function supportFields(){
 return '<div class="vzw-supports">'+Object.entries(supports).map(([id,title])=>
  '<label><input type="checkbox" data-vzw-support="'+id+'"'+(profile.supports[id]?' checked':'')+'> '+esc(title)+'</label>').join('')+'</div>';
}
function bonusesUi(targets){
 const report=core.goals(targets,profile.bonuses);
 if(!report.total)return '<p class="vzw-small">Questa scheda non contiene un elenco numerico di bonus-obiettivo verificabile. Non vengono inventati valori.</p>';
 return '<div class="vzw-targets">'+report.rows.map(t=>
  '<div class="vzw-target"><div class="vzw-target-top"><b>'+esc(t.name)+'</b><span>Obiettivo '+fmt(t.target)+t.unit+'</span></div>'+
  '<div class="vzw-target-input"><label>Il mio valore<input type="number" min="0" step="any" data-vzw-bonus="'+esc(t.name)+'" value="'+t.actual+'"></label>'+
  '<span class="vzw-gap">'+(t.met?'Obiettivo raggiunto':'Mancano '+fmt(t.missing)+t.unit)+'</span></div>'+
  '<div class="vzw-track"><span style="width:'+t.percent+'%"></span></div></div>').join('')+'</div>';
}
function ownedUi(items,kind){
 if(!items.length)return '<p class="vzw-small">La Wiki non fornisce un elenco per questa categoria nella pagina esaminata.</p>';
 const selected=items.filter(item=>profile.owned[item.id]?.checked).length;
 return '<div class="vzw-gear-count">'+selected+' di '+items.length+' elementi selezionati</div><div class="vzw-item-grid">'+items.map(item=>{
  const current=profile.owned[item.id]||{},range=item.upgrade===null?null:Math.max(item.upgrade,0);
  return '<div class="vzw-item"><label class="vzw-item-choice"><input type="checkbox" data-vzw-owned="'+item.id+'"'+(current.checked?' checked':'')+'>'+
   (item.src?'<img src="'+esc(item.src)+'" alt="" width="30" height="30" loading="lazy">':'')+'<span><b>'+esc(item.name)+'</b>'+
   (item.upgrade!==null?'<small>Wiki: +'+item.upgrade+'</small>':'')+'</span></label>'+
   (range!==null?'<label class="vzw-item-level">Il mio livello <select data-vzw-gear-level="'+item.id+'">'+
    Array.from({length:range+1},(_,i)=>'<option value="'+i+'"'+(Number(current.level||0)===i?' selected':'')+'>+'+i+'</option>').join('')+'</select></label>':'')+
   '<a class="vzw-item-link" href="#wiki/item/'+item.id+'">Scheda Wiki</a></div>';
 }).join('')+'</div>';
}
function skillsUi(page){
 const categories=[
  ['Abilità del personaggio',profile.class+' · Abilità del personaggio'],
  ['Buff','Abilità di Buffi'],
  ['Pet','Abilità dell’animale'],
  ['Cavalcatura','Abilità della cavalcatura'],
  ['Passive','Abilità passive']
 ];
 const list=categories.map(([name,key])=>{
  const items=recommendedSkills(page,key);
  return '<details class="vzw-details"><summary>'+esc(name)+' <small>'+items.length+' consigli Wiki</small></summary>'+
    (items.length?'<div class="vzw-skill-list">'+items.map(item=>{
     const id='skill:'+name+':'+item.name;
     return '<label><input type="checkbox" data-vzw-owned-skill="'+esc(id)+'"'+(profile.owned[id]?.checked?' checked':'')+'>'+
      '<span>'+esc(item.name)+'</span><small>'+esc(item.recommended)+'</small></label>';
    }).join('')+'</div>':'<p class="vzw-small">Dati non presenti in questa scheda.</p>')+'</details>';
 }).join('');
 return '<h3>Abilità, Buffi, Pet e cavalcatura consigliati</h3>'+list;
}
function metric(label,value){
 return '<div><small>'+esc(label)+'</small><strong>'+esc(value)+'</strong></div>';
}
function dpsInputs(){
 const labels={normal:'Danno colpo normale',critical:'Danno colpo critico',criticalRate:'Critici osservati (%)',hitsPerSecond:'Colpi al secondo misurati',uptime:'Tempo effettivo d’attacco (%)'};
 return '<details class="vzw-details"><summary>Stima DPS dai colpi misurati <small>senza formula di gioco inventata</small></summary><div class="vzw-grid">'+
 Object.entries(labels).map(([key,name])=>
  '<label>'+esc(name)+'<input type="number" step="any" min="0"'+(key==='criticalRate'||key==='uptime'?' max="100"':'')+
  ' data-vzw-damage="'+key+'" value="'+(core.safe(profile.damage[key],0)||0)+'"></label>').join('')+'</div>'+
 '<p class="vzw-small">Calcolo aritmetico: media dei colpi osservati × frequenza reale × tempo di attacco. Non prevede l’effetto di bonus, difese o resistenze del boss.</p></details>';
}
function compareUI(hp){
 const a=core.safe(profile.scenarios.baseline,0)||0,b=core.safe(profile.scenarios.optimized,0)||0;
 const result=core.scenario(a,b,hp);
 return '<details class="vzw-details"><summary>Confronta due configurazioni misurate <small>Build A / Build B</small></summary>'+
 '<div class="vzw-grid"><label>DPS reale Build A<input type="number" data-vzw-scenario="baseline" min="0" value="'+a+'"></label>'+
 '<label>DPS reale Build B<input type="number" data-vzw-scenario="optimized" min="0" value="'+b+'"></label></div>'+
 (result?'<div class="vzw-metrics">'+metric('Variazione DPS',fmt(result.percentChange)+'%')+
   metric('Tempo teorico A',result.baseSeconds===null?'—':fmt(result.baseSeconds)+' s')+
   metric('Tempo teorico B',result.newSeconds===null?'—':fmt(result.newSeconds)+' s')+'</div>':
 '<p class="vzw-small">Inserisci due valori DPS misurati in gioco per confrontare la differenza reale.</p>')+
 '<p class="vzw-small">Il tempo teorico esclude rigenerazione, interruzioni, buff e meccaniche specifiche del boss.</p></details>';
}
function templateFor(r){
 if(!r.startsWith('wiki/mob/'))return null;
 const id=r.split('/').pop(),d=bossDungeon[id];
 if(!d)return null;ensureDungeon(d);return cache.get(d)?.page||null;
}
function bossUI(page,r){
 const mob=r.startsWith('wiki/mob/');
 const tpl=mob?templateFor(r):page;
 const current=dungeonInfo(page,r);
 const wiki=tpl?dungeonInfo(tpl,'wiki/dungeons/'+(bossDungeon[current.mobId]||r.split('/').pop())):null;
 const goals=wiki?.goals||current.goals;
 const target=wiki||current;
 const stats=core.goals(goals,profile.bonuses);
 const dps=effectiveDps(),seconds=core.eta(current.hp||target.hp,dps);
 const isEligible=core.levelEligible(profile.level,target.access);
 const gear=tpl?recommended(tpl,'gear'):[],alchemy=tpl?recommended(tpl,'alchemy'):[],consumables=tpl?recommended(tpl,'consumables'):[];
 const equipped=gear.filter(item=>profile.owned[item.id]?.checked).length;
 return '<section class="vzw-panel" data-vzw-scope="boss" data-vzw-route="'+esc(r)+'">'+
 '<div class="vzw-head"><div><span class="vzw-overline">VERZUM · SIMULATORE PvM 2.0</span>'+
 '<h2>Preparazione: '+esc(current.title)+'</h2></div><span class="vzw-chip">Profilo condiviso</span></div>'+
 '<p>Inserisci i dati del tuo personaggio e confrontali con la configurazione consigliata nella Wiki. Nessuna statistica viene attribuita automaticamente a un oggetto se non è verificata.</p>'+
 profileFields()+supportFields()+
 '<div class="vzw-metrics">'+
 metric('Bonus-obiettivo raggiunti',stats.total?stats.met+' / '+stats.total:'Non disponibili')+
 metric('DPS consigliato Wiki',target.dps?fmt(target.dps):'—')+
 metric('DPS del personaggio',dps?fmt(dps):'Da misurare')+
 metric('Durata teorica',seconds!==null?fmt(seconds)+' s':'Da misurare')+
 (isEligible===null?'':metric('Livello accesso',target.access+' · '+(isEligible?'Compatibile':'Non compatibile')))+
 metric('Equipaggiamento consigliato presente',gear.length?equipped+' / '+gear.length:'Nessun elenco')+'</div>'+
 (mob&&tpl?'<p class="vzw-small">Equipaggiamento e bonus ricavati dalla scheda dungeon correlata: <a href="#wiki/'+esc('dungeons/'+bossDungeon[current.mobId])+'">'+esc(dungeonNames[bossDungeon[current.mobId]])+'</a>.</p>':'')+
 (mob&&!tpl&&bossDungeon[current.mobId]?'<p class="vzw-small">Caricamento delle raccomandazioni dalla pagina dungeon corrispondente…</p>':'')+
 (mob&&tpl&&window.VERZUM_BOSS_RECOMMENDATIONS?
 window.VERZUM_BOSS_RECOMMENDATIONS.render(tpl,profile.class,current.title,'wiki/dungeons/'+bossDungeon[current.mobId]):'')+
  '<h3>Bonus totali consigliati</h3>'+bonusesUi(goals)+
 '<details class="vzw-details" open><summary>Equipaggiamento per '+esc(profile.class)+' <small>'+gear.length+' oggetti della Wiki</small></summary>'+ownedUi(gear,'gear')+'</details>'+
 '<details class="vzw-details"><summary>Alchimia consigliata <small>'+alchemy.length+' pietre della Wiki</small></summary>'+ownedUi(alchemy,'alchemy')+'</details>'+
 '<details class="vzw-details"><summary>Consumabili e potenziamenti <small>'+consumables.length+' oggetti della Wiki</small></summary>'+ownedUi(consumables,'consumables')+'</details>'+
 (tpl?skillsUi(tpl):'')+
 '<h3>Talismani, Pet, Cavalcatura e Premium</h3>'+
 '<p class="vzw-small">Gli elementi non presenti come valori verificati nella Wiki possono essere registrati nel profilo senza trasformarli in bonus danno presunti.</p>'+
 '<div class="vzw-notes">'+Object.entries(supports).map(([id,label])=>
 '<label>'+esc(label)+' · descrizione / livello<input data-vzw-note="'+id+'" value="'+esc(profile.supportNotes[id]||'')+'" placeholder="Es. Lv. 70, abilità 10/10"></label>').join('')+'</div>'+
 '<h3>Danno al boss: dati reali e confronto</h3>'+dpsInputs()+compareUI(current.hp||target.hp)+
 '<div class="vzw-actions"><button type="button" data-vzw-plan="boss">Salva preparazione nel Planner</button>'+
 '<a href="#upgrade">Potenziamenti</a><a href="#skills">Abilità</a><a href="#build">Profilo PvM 2.0</a></div>'+
 '<p class="vzw-small">La stima PV/DPS non considera rigenerazione, immunità, meccaniche o resistenze. Il DPS consigliato viene mostrato solo quando la Wiki lo indica.</p></section>';
}
function guideRows(page){
 const heading=page.querySelector('#s2'),table=heading?.nextElementSibling?.querySelector('table');
 if(!table)return [];
 return [...table.querySelectorAll('tbody tr')].map((tr,index)=>{
  const cells=tr.querySelectorAll('td');
  return cells.length<2?null:{id:String(index),range:cells[0].textContent.trim(),description:cells[1].textContent.trim(),
   links:[...cells[1].querySelectorAll('a[href^="#wiki/"]')].map(a=>({href:a.getAttribute('href'),title:a.textContent.trim()||a.querySelector('img')?.alt||''})).filter(a=>a.title).slice(0,6)};
 }).filter(Boolean);
}
function segmentForLevel(rows){
 const level=Number(profile.level)||1;
 return rows.find(r=>{const match=r.range.match(/(\d+)\s*[-–]\s*(\d+)/);return match?level>=Number(match[1])&&level<=Number(match[2]):Number(r.range)===level})||rows[0];
}
function guideUI(page){
 const steps=guideRows(page),active=segmentForLevel(steps),completed=steps.filter(x=>profile.tasks[x.id]).length;
 return '<section class="vzw-panel" data-vzw-scope="guide"><div class="vzw-head"><div><span class="vzw-overline">WIKI · GUIDA 1–75</span>'+
 '<h2>Pianificatore personale dei livelli</h2></div><span class="vzw-chip">'+completed+' / '+steps.length+' tappe</span></div>'+
 '<p>Le sei fasce e le indicazioni sono lette dalla guida VERZUM. Seleziona la classe e registra ciò che hai completato.</p>'+
 profileFields()+
 (active?'<div class="vzw-guide-focus"><b>La tua fascia: '+esc(active.range)+'</b><p>'+esc(active.description)+'</p>'+
 '<div class="vzw-actions">'+active.links.map(link=>'<a href="'+esc(link.href)+'">'+esc(link.title)+'</a>').join('')+'</div></div>':'')+
 '<div class="vzw-tasks">'+steps.map(step=>
 '<div class="vzw-guide-step"><label class="vzw-task"><input type="checkbox" data-vzw-task="'+esc(step.id)+'"'+(profile.tasks[step.id]?' checked':'')+'>'+
 '<span><b>Livelli '+esc(step.range)+'</b><small>'+esc(step.description)+'</small></span></label>'+
 '<button type="button" data-vzw-plan="guide" data-vzw-step="'+esc(step.id)+'">+ Planner</button></div>').join('')+'</div>'+
 '<h3>Farming e costi con valori personali</h3>'+farmingUI()+
 '<div class="vzw-actions"><a href="#upgrade">Potenziamenti</a><a href="#pet">Pet</a><a href="#mount">Cavalcature</a>'+
 '<a href="#planner">Planner</a><a href="#wiki/dungeons/azrael">Azrael</a><a href="#build">Profilo PvM 2.0</a></div>'+
 '</section>';
}
function farmingUI(){
 const f=profile.farming,id=dungeonPaths.includes(f.dungeon)?f.dungeon:'spider',info=cache.get(id)?.info;
 const profit=core.farming(f),eligible=info?core.levelEligible(profile.level,info.access):null;
 const saved=Object.entries(profile.farmingByDungeon).filter(([key])=>dungeonPaths.includes(key));
 const comparisons=saved.length?'<details class="vzw-details"><summary>Confronta i dungeon salvati <small>'+saved.length+' configurazioni</small></summary>'+
 '<div class="vzw-compare-scroll"><table><thead><tr><th>Dungeon</th><th>Run</th><th>Utile netto</th><th>Yang / ora</th></tr></thead><tbody>'+
 saved.map(([key,values])=>{
  const p=core.farming(values);
  return '<tr><th><a href="#wiki/dungeons/'+key+'">'+esc(dungeonNames[key])+'</a></th>'+
   '<td>'+fmt(p?.runs||0)+'</td><td>'+fmt(p?.profit||0)+'</td><td>'+fmt(p?.profitPerHour)+'</td></tr>';
 }).join('')+'</tbody></table></div>'+
 '<p class="vzw-small">Classifica descrittiva: dipende dai tuoi dati, non da drop previsti dal server.</p></details>':'';
 return '<div class="vzw-farm"><div class="vzw-grid"><label>Dungeon<select data-vzw-farming="dungeon">'+dungeonPaths.map(x=>
  '<option value="'+x+'"'+(id===x?' selected':'')+'>'+esc(dungeonNames[x])+'</option>').join('')+'</select></label>'+
 [['runs','Run pianificate'],['minutesPerRun','Minuti per run'],['lootPerRun','Yang ottenuti per run (stima personale)'],
 ['expensesPerRun','Consumabili per run (Yang)'],['ticketPerRun','Ingresso per run (Yang)']].map(([key,title])=>
 '<label>'+esc(title)+'<input type="number" min="0" step="any" data-vzw-farming="'+key+'" value="'+(core.safe(f[key],0)||0)+'"></label>').join('')+'</div>'+
 '<div class="vzw-metrics">'+
 metric('DPS consigliato Wiki',info?.dps?fmt(info.dps):'—')+
 metric('Livello accesso',info?.access||'—')+
 metric('Utile netto delle run',profit?fmt(profit.profit)+' Yang':'—')+
 metric('Reddito stimato / ora',profit?.profitPerHour!==null&&profit?.profitPerHour!==undefined?fmt(profit.profitPerHour)+' Yang':'—')+
 (eligible===null?'':metric('Accesso personaggio',eligible?'Compatibile':'Non compatibile'))+'</div>'+
 '<p class="vzw-small">Redditività basata solo sui valori inseriti dall’utente. La Wiki non garantisce drop, durata o guadagni.</p>'+
 comparisons+
 '<div class="vzw-actions"><a href="#wiki/dungeons/'+id+'">Apri dungeon '+esc(dungeonNames[id])+'</a>'+
 '<button type="button" data-vzw-plan="farming">Aggiungi farming al Planner</button></div></div>';
}
function dashboardUI(){
 const dps=effectiveDps();
 const r=profile.farming.dungeon;
 if(dungeonPaths.includes(r))ensureDungeon(r);
 return '<section class="vzw-panel" data-vzw-scope="dashboard"><div class="vzw-head"><div>'+
 '<span class="vzw-overline">VERZUM TOOLS 2.0 · BUILD LAB</span><h2>Il mio profilo PvM</h2></div>'+
 '<span class="vzw-chip">Salvataggio nel browser</span></div>'+
 '<p>Un solo profilo per Wiki, guida e dungeon: impostazioni, equipaggiamento posseduto, pet, cavalcatura e misurazioni.</p>'+
 profileFields()+supportFields()+
 '<h3>Configurazione attuale</h3><div class="vzw-notes">'+Object.entries(supports).map(([id,label])=>
 '<label>'+esc(label)+' · dettagli<input data-vzw-note="'+id+'" value="'+esc(profile.supportNotes[id]||'')+'" placeholder="Livello / bonus / competenza"></label>').join('')+'</div>'+
 '<div class="vzw-metrics">'+metric('DPS misurato',dps?fmt(dps):'Da misurare')+
 metric('Oggetti/abilità segnati',Object.values(profile.owned).filter(x=>x.checked).length+'')+
 metric('Classe',profile.class)+metric('Livello',fmt(profile.level))+'</div>'+
 '<h3>Confronto e calibrazione</h3>'+dpsInputs()+compareUI(null)+
 '<h3>Pianificatore farming</h3>'+farmingUI()+
 '<div class="vzw-actions"><a href="#wiki/guides/vz_level_1_75">Guida 1–75</a>'+
 '<a href="#wiki/bosses/boss_dungeon">Scegli un boss</a><a href="#upgrade">Potenziamenti</a><a href="#planner">Planner</a>'+
 '<button type="button" data-vzw-export>Esporta profilo JSON</button><button type="button" data-vzw-import>Importa profilo JSON</button></div>'+
 '<p class="vzw-small">Tutti i dati del profilo rimangono nel browser finché non vengono esportati. Le formule del danno di gioco non sono ancora verificate.</p>'+
 '<input type="file" accept=".json,application/json" data-vzw-file hidden></section>';
}
function renderInto(){
 const route=url(),page=host.querySelector('.vz-wiki .wk-page');
 if(route==='build'){
  const container=host.querySelector('[data-vzw-scope="dashboard"]');
  const markup=dashboardUI();
  if(container)container.outerHTML=markup;
  else{const panel=host.querySelector('.panel-content');if(panel)panel.innerHTML=markup}
  return;
 }
 if(!page)return;
 const old=page.querySelector('[data-vzw-scope]');
 let html='';
 if(route===guidePath){html=guideUI(page);ensureDungeon(profile.farming.dungeon)}
 else if(route.startsWith('wiki/dungeons/')||route.startsWith('wiki/mob/'))html=bossUI(page,route);
 if(html){
  if(old)old.outerHTML=html;
  else{
   const marker=route===guidePath?page.querySelector('#s2'):null;
   if(marker)marker.insertAdjacentHTML('beforebegin',html);
   else page.insertAdjacentHTML('beforeend',html);
  }
 }else if(route==='wiki/bosses/boss_dungeon'){
  page.querySelectorAll('article.wk-row').forEach(row=>{
   if(row.querySelector('.vzw-shortcut'))return;
   const link=row.querySelector('a.wk-namebar__name[href^="#wiki/mob/"]');
   if(!link)return;
   const a=document.createElement('a');a.className='vzw-shortcut';a.href=link.getAttribute('href');
   a.textContent='Calcola build';a.setAttribute('aria-label','Apri il laboratorio PvM per '+link.textContent.trim());
   row.querySelector('.wk-namebar')?.append(a);
  });
 }
}
function refresh(){
 const page=host.querySelector('.vz-wiki .wk-page');
 const scope=page?.querySelector('[data-vzw-scope]')||host.querySelector('[data-vzw-scope="dashboard"]');
 const r=url();
 if(scope||r==='build'||r===guidePath)renderInto();
}
function isRelevant(){
 const r=url();
 return r==='build'||r===guidePath||r==='wiki/bosses/boss_dungeon'||r.startsWith('wiki/dungeons/')||r.startsWith('wiki/mob/');
}
let isRendering=false;
function mount(){
 if(isRendering||!isRelevant())return;
 isRendering=true;
 try{
  const r=url();
  if(r==='build'){if(!host.querySelector('[data-vzw-scope="dashboard"]'))renderInto();return}
  const page=host.querySelector('.vz-wiki .wk-page');
  if(!page)return;
  if(r==='wiki/bosses/boss_dungeon'||!page.querySelector('[data-vzw-scope]'))renderInto();
 }finally{isRendering=false}
}
function actionChange(el){
 const k=el.dataset;
 if(k.vzwField){
  if(k.vzwField==='class')profile.class=classes[el.value]?el.value:'Guerriero';
  else if(k.vzwField==='name')profile.name=str(el.value,60);
  else profile[k.vzwField]=core.safe(el.value,k.vzwField==='level'?1:0,k.vzwField==='level'?120:1e10)||0;
 }
 if(k.vzwSupport)profile.supports[k.vzwSupport]=el.checked;
 if(k.vzwNote)profile.supportNotes[k.vzwNote]=str(el.value,160);
 if(k.vzwBonus)profile.bonuses[k.vzwBonus]=core.safe(el.value,0)||0;
 if(k.vzwOwned)profile.owned[k.vzwOwned]={...(profile.owned[k.vzwOwned]||{}),checked:el.checked};
 if(k.vzwOwnedSkill)profile.owned[k.vzwOwnedSkill]={...(profile.owned[k.vzwOwnedSkill]||{}),checked:el.checked};
 if(k.vzwGearLevel)profile.owned[k.vzwGearLevel]={...(profile.owned[k.vzwGearLevel]||{}),level:Number(el.value)||0};
 if(k.vzwDamage)profile.damage[k.vzwDamage]=core.safe(el.value,0)||0;
 if(k.vzwScenario)profile.scenarios[k.vzwScenario]=core.safe(el.value,0)||0;
 if(k.vzwFarming){
  const previous=profile.farming.dungeon;
  if(k.vzwFarming==='dungeon'&&dungeonPaths.includes(el.value)){
   profile.farmingByDungeon[previous]={...profile.farming};
   const stored=profile.farmingByDungeon[el.value];
   profile.farming={...defaults().farming,...(stored||{}),dungeon:el.value};
  }else if(k.vzwFarming!=='dungeon')profile.farming[k.vzwFarming]=core.safe(el.value,0)||0;
  profile.farmingByDungeon[profile.farming.dungeon]={...profile.farming};
 }
 if(k.vzwTask!==undefined)profile.tasks[k.vzwTask]=el.checked;
 persist();
 if(k.vzwFarming==='dungeon')ensureDungeon(el.value);
 refresh();
}
function addToPlanner(action,page,step){
 if(typeof state==='undefined'||!Array.isArray(state.planner))return;
 const r=url();
 let name='',notes='',source='Wiki VERZUM 2.0',materials={},yang=0;
 if(action==='boss'){
  const info=dungeonInfo(page,r),reference=templateFor(r)||page,goal=bonusGoals(reference);
  const missing=core.goals(goal,profile.bonuses).rows.filter(x=>!x.met).map(x=>x.name+': '+fmt(x.actual)+'/'+fmt(x.target)+x.unit);
  const recommendedGear=recommended(reference,'gear').filter(x=>!profile.owned[x.id]?.checked).map(x=>x.name);
  name='Preparazione '+info.title;notes=[...missing,...recommendedGear.map(x=>'Equip: '+x)].join('; ');
  source+=' · Boss · '+profile.class+' Lv. '+profile.level;
 }else if(action==='guide'){
  const row=guideRows(page).find(x=>x.id===step);if(!row)return;
  name='Guida Lv. '+row.range;notes=row.description;
 }else if(action==='farming'){
  const f=profile.farming;
  name='Farming '+(dungeonNames[f.dungeon]||f.dungeon);
  const profit=core.farming(f);
  notes='Run: '+f.runs+' · durata/run: '+f.minutesPerRun+' min · ricavo stimato: '+fmt(profit?.profit||0)+' Yang (dati inseriti dal giocatore)';
  yang=0; // Cost fields are estimates, not costs to be spent now: avoid double counting.
 }else return;
 state.planner.push({name,source,materials,yang,notes:notes.slice(0,3000),created:new Date().toLocaleDateString('it-IT')});
 if(typeof save==='function')save();
 state.route='planner';location.hash='#planner';if(typeof render==='function')render();
}
host.addEventListener('change',e=>{
 const el=e.target;if(!el.closest('[data-vzw-scope]'))return;
 if(el.matches('[data-vzw-file]')){
  const file=el.files?.[0];if(!file||file.size>1024*1024)return;
  file.text().then(str=>{try{
   const parsed=JSON.parse(str);if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))return;
   if(!classes[parsed.class]||typeof parsed.name!=='string')return;
   profile={...defaults(),...parsed};
   for(const k of ['bonuses','supports','supportNotes','owned','tasks','damage','scenarios','farmingByDungeon','farming'])
    if(!profile[k]||typeof profile[k]!=='object'||Array.isArray(profile[k]))profile[k]=defaults()[k];
   persist();refresh();
  }catch(_){}});
  return;
 }
 actionChange(el);
});
host.addEventListener('click',e=>{
 const cls=e.target.closest('[data-vzw-class]');
 if(cls&&cls.closest('[data-vzw-scope="boss"]')&&Object.prototype.hasOwnProperty.call(classes,cls.dataset.vzwClass)){
  e.preventDefault();profile.class=cls.dataset.vzwClass;persist();refresh();return;
 }
 const button=e.target.closest('[data-vzw-plan],[data-vzw-export],[data-vzw-import]');
 if(!button)return;
 if(button.hasAttribute('data-vzw-export')){
  const data=new Blob([JSON.stringify({schema:'verzum-pvm-v2',...profile},null,2)],{type:'application/json'});
  const addr=URL.createObjectURL(data),a=document.createElement('a');a.href=addr;a.download='verzum-profilo-pvm.json';a.click();setTimeout(()=>URL.revokeObjectURL(addr),1500);
  return;
 }
 if(button.hasAttribute('data-vzw-import')){host.querySelector('[data-vzw-file]')?.click();return}
 const page=button.closest('.wk-page')||host;
 addToPlanner(button.dataset.vzwPlan,page,button.dataset.vzwStep);
});
/* Integra la decima sezione senza modificare gli originali nove calcolatori. */
if(typeof sections!=='undefined'&&typeof TITLES!=='undefined'){
 TITLES.build=['PROFILO PvM','Profilo e simulatore boss','Un profilo condiviso fra Wiki, guida, potenziamenti e dungeon.'];
 sections.build=()=>[{key:'vzw-build-lab',title:'Laboratorio PvM 2.0',span:12,tag:'2.0',content:dashboardUI()}];
 if(url()==='build'&&typeof state!=='undefined'){state.route='build';if(typeof render==='function')render()}
}
const nav=document.querySelector('#navigation');
if(nav&&!nav.querySelector('[data-nav="build"]')){
 const btn=document.createElement('button');btn.type='button';btn.dataset.nav='build';
 btn.innerHTML='<span class="nav-ico">⚔</span> Profilo PvM 2.0';
 const planner=nav.querySelector('[data-nav="planner"]');(planner||nav.lastElementChild)?.before(btn);
}
let queue=false;
const observer=new MutationObserver(()=>{
 if(queue)return;queue=true;queueMicrotask(()=>{queue=false;mount()});
});
observer.observe(host,{childList:true,subtree:true});
window.addEventListener('hashchange',()=>queueMicrotask(mount));
mount();
window.VERZUM_BUILD_TOOLS={getProfile:()=>JSON.parse(JSON.stringify(profile)),getRoute:url,refresh,source:'Wiki/observed data only'};
})();