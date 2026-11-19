/* VERZUM Passive Skills: source-grounded visual tree on top of the unchanged native calculator.
   Only official Wiki data and local images; the native reading/cost engine stays authoritative. */
(function(){
'use strict';
if(window.VERZUM_PASSIVE_WIKI_TREE)return;
const VIEW=document.getElementById('v-passive');
if(!VIEW)return;
const WIKI='wiki-pages/systems/passive_skills.html',SAVE='verzum_passive_wiki_tree_v1';
const esc=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const tidy=s=>String(s||'').replace(/\s+/g,' ').trim();
const skillNames=['Guida','Guerriero coraggioso','Guerriero del Dio Drago','Campione dei sotterranei'];
const officialSkillIcons={
 'Guida':'wiki-original/img/ui/skill/common/support/tongsol.png',
 'Guerriero coraggioso':'wiki-original/img/ui/skill/common/support/chultong.png',
 'Guerriero del Dio Drago':'wiki-original/img/ui/skill/common/support/jeunghyul.png',
 'Campione dei sotterranei':'wiki-original/img/ui/skill/common/guild/him.png'
};
const tabs={skills:'Abilità e libri',recipe:'Creazione e aiuti',sets:'Bonus set',consumables:'Pozioni e pesci'};
const store=()=>{try{const x=JSON.parse(localStorage.getItem(SAVE)||'{}');return x&&typeof x==='object'&&!Array.isArray(x)?x:{}}catch(_){return{}}};
let owned=store(),activeTab='skills',selectedSkill=0,model=null,pending=null,loadError=false;
function persist(){try{localStorage.setItem(SAVE,JSON.stringify(owned))}catch(_){}}
function nextUntil(heading){
 const nodes=[];for(let n=heading?.nextElementSibling;n&&!/^H[23]$/.test(n.tagName);n=n.nextElementSibling)nodes.push(n);
 return nodes;
}
function findHeading(doc,starts){
 return [...doc.querySelectorAll('h2,h3')].find(h=>tidy(h.textContent).startsWith(starts));
}
function collectItem(link){
 const id=link?.getAttribute('href')?.match(/^#wiki\/item\/(\d+)$/)?.[1];
 if(!id)return null;
 const img=link.querySelector('img');
 return {id,src:img?.getAttribute('src')||'',name:tidy(img?.getAttribute('alt')||link.textContent||'Oggetto '+id)};
}
function itemsFrom(nodes){
 const seen=new Set(),result=[];
 for(const node of nodes)for(const link of node.querySelectorAll('a[href^="#wiki/item/"]')){
  const item=collectItem(link);
  if(!item||seen.has(item.id))continue;
  seen.add(item.id);result.push(item);
 }
 return result;
}
function parse(source){
 const doc=new DOMParser().parseFromString(source,'text/html');
 const header=findHeading(doc,'2.1'),creation=findHeading(doc,'2.2'),bonuses=findHeading(doc,'3.'),setHeading=findHeading(doc,'4.');
 if(!header||!creation||!bonuses||!setHeading)throw Error('La guida Wiki non contiene le sezioni attese');
 const bookSection=nextUntil(header),tables=bookSection.flatMap(node=>[...node.querySelectorAll('table')]);
 const bookRows=[...(tables[0]?.querySelectorAll('tbody tr')||[])];
 const skillIcons=new Map();
 const chapter=nextUntil(bonuses).find(node=>node.classList?.contains('wk-dyn'));
 for(const p of chapter?.querySelectorAll('p')||[]){
  const image=p.querySelector('img[src*="/skill/"]'),label=p.querySelector('.wk-z-lb');
  if(image&&label)skillIcons.set(tidy(label.textContent),image.getAttribute('src'));
 }
 const books=bookRows.map((tr,index)=>{
  const cells=[...tr.querySelectorAll('td')];
  return {index,name:tidy(cells[0]?.textContent),icon:skillIcons.get(tidy(cells[0]?.textContent))||officialSkillIcons[tidy(cells[0]?.textContent)]||'',
    grades:cells.slice(1,4).map((cell,i)=>{
     const item=collectItem(cell.querySelector('a[href^="#wiki/item/"]'));
     return item?{...item,grade:['M','G','P'][i]}:null;
    }).filter(Boolean)};
 }).sort((a,b)=>skillNames.indexOf(a.name)-skillNames.indexOf(b.name));
 const sourceRecipe=nextUntil(creation);
 const allItems=itemsFrom([...bookSection,...sourceRecipe,...nextUntil(setHeading)]);
 const helpItems=allItems.filter(x=>['50350','50351','71094','71001','100010','100006','100007','100008','50513','70102','100042'].includes(x.id));
 const groups=[
  ['4.1','Maestro delle abilità','Abilità di classe','sets'],
  ['4.2','Maestro passivo','Quattro abilità passive','sets'],
  ['4.3','Erborista','Pozioni permanenti','consumables'],
  ['4.4','Benedizione del Mare','Pesci permanenti','consumables']
 ].map(([prefix,title,subtitle,type])=>{
   const head=findHeading(doc,prefix),nodes=nextUntil(head);
   const table=nodes.flatMap(node=>[...node.querySelectorAll('table')])[0];
   const rows=[...(table?.querySelectorAll('tbody tr')||[])].map((tr,index)=>{
    const cell=tr.querySelector('td'),img=cell?.querySelector('img'),a=cell?.querySelector('a[href^="#wiki/item/"]');
    if(!cell)return null;
    const item=collectItem(a),name=tidy(cell.textContent)||item?.name||'Abilità '+index;
    return {key:prefix+':'+(item?.id||img?.getAttribute('src')||String(index)),name,
      id:item?.id||null,src:img?.getAttribute('src')||item?.src||''};
   }).filter(Boolean);
   const spans=nodes.flatMap(node=>[...node.querySelectorAll('.wk-bonus')]);
   const bonus=[...new Set(spans.map(s=>tidy(s.textContent)).filter(Boolean))];
   const intro=nodes.find(n=>n.tagName==='P')?.textContent||'';
   return {id:prefix,title,subtitle,type,rows,bonus,intro:tidy(intro)};
 });
 const bonusChapter=nextUntil(bonuses);
 return {books,groups,helpItems,recipe:sourceRecipe.map(n=>n.outerHTML).join(''),
  bonusTables:bonusChapter.map(n=>n.outerHTML).join(''),objects:itemsFrom([doc.querySelector('article.wk-doc')||doc]),
  cover:doc.querySelector('.wk-hero__pic')?.getAttribute('src')||'',wikiCount:doc.querySelectorAll('img').length};
}
function ensure(){
 if(model||pending||loadError)return;
 pending=fetch(WIKI,{cache:'force-cache'}).then(r=>{if(!r.ok)throw Error('Wiki HTTP '+r.status);return r.text()})
 .then(html=>{model=parse(html);schedule()}).catch(error=>{console.warn('[VERZUM Passive]',error);loadError=true;schedule()})
 .finally(()=>pending=null);
}
function image(src,alt=''){
 return src?'<img class="vz-passive-icon" src="'+esc(src)+'" alt="'+esc(alt)+'" width="36" height="36" loading="lazy" decoding="async">':
 '<span class="vz-passive-icon vz-passive-no-image" aria-label="Nessuna immagine nella Wiki">◈</span>';
}
function wikiItem(item,context=''){
 return '<a class="vz-passive-item" href="#wiki/item/'+esc(item.id)+'" target="_parent" title="Apri scheda oggetto '+esc(item.name)+'">'+
 image(item.src,item.name)+'<span>'+esc(item.name)+(context?'<small>'+esc(context)+'</small>':'')+'</span></a>';
}
function skillCards(){
 return '<div class="vz-passive-skill-grid">'+model.books.map((skill,i)=>
 '<button type="button" class="vz-passive-skill'+(selectedSkill===i?' is-selected':'')+'" data-vz-passive-skill="'+i+'" aria-pressed="'+String(selectedSkill===i)+'">'+
 image(skill.icon,skill.name)+'<span>'+esc(skill.name)+'</span></button>').join('')+'</div>';
}
function skills(){
 const skill=model.books[selectedSkill];if(!skill)return '<p>Abilità non disponibili.</p>';
 return '<div class="vz-passive-tree-intro"><strong>Seleziona una passiva</strong><p>Le quattro abilità sono collegate al calcolatore originale. Cambiando abilità, vengono aggiornati i libri e le quantità calcolate.</p></div>'+
 skillCards()+
 '<div class="vz-passive-branch"><h4>'+image(skill.icon,skill.name)+' '+esc(skill.name)+'</h4><p>Libri specifici per raggiungere i gradi M, G e P</p>'+
 '<div class="vz-passive-book-flow">'+skill.grades.map(book=>'<div class="vz-passive-book">'+
 '<span class="vz-passive-grade">Grado '+esc(book.grade)+'</span>'+wikiItem(book)+'</div>').join('')+'</div>'+
 '<p class="vz-passive-caption">Seleziona i livelli iniziale e finale nel calcolatore sottostante: la quantità di letture e le ricette restano calcolate dal sistema originale.</p></div>';
}
function helpers(){
 const catalog=model.helpItems;
 return '<div class="vz-passive-branch"><h4>Libri generici e oggetti di aiuto</h4><p>Libri, pagine, letture concentrate, papiri, citrini e oggetti necessari alle ricette presenti nella Wiki.</p>'+
 '<div class="vz-passive-item-grid">'+catalog.filter(x=>x.src).map(x=>wikiItem(x)).join('')+'</div>'+
 '<p class="vz-passive-caption">Gli oggetti senza un’immagine nella pagina originale sono elencati nelle ricette; non viene usata un’immagine inventata.</p></div>'+
 '<details class="vz-passive-source-details"><summary>Mostra tutte le ricette e quantità della Wiki</summary>'+
 '<div class="vz-passive-wiki-table">'+model.recipe+'</div></details>';
}
function setCard(group){
 const count=group.rows.filter(row=>owned[row.key]).length,all=count===group.rows.length&&group.id!=='4.1';
 const title=group.id==='4.1'?count+' abilità segnate (esempi Guerriero; servono le 6 della tua specializzazione)':count+' / '+group.rows.length+' ottenuti';
 return '<section class="vz-passive-set"><div class="vz-passive-set-head"><div><h4>'+esc(group.title)+'</h4><p>'+esc(group.intro)+'</p></div>'+
 '<strong>'+esc(title)+'</strong></div>'+
 '<div class="vz-passive-check-grid">'+group.rows.map(row=>
 '<label class="vz-passive-check'+(owned[row.key]?' checked':'')+'">'+
 '<input type="checkbox" data-vz-passive-owned="'+esc(row.key)+'"'+(owned[row.key]?' checked':'')+' aria-label="Possiedo: '+esc(row.name)+'">'+
 image(row.src,row.name)+'<span>'+esc(row.name)+'</span>'+(row.id?'<a href="#wiki/item/'+row.id+'" target="_parent" aria-label="Scheda Wiki '+esc(row.name)+'">Wiki</a>':'')+
 '</label>').join('')+'</div>'+
 '<div class="vz-passive-bonus"><b>Bonus set della Wiki'+(all?' · tutti gli elementi segnati':'')+':</b> '+group.bonus.map(esc).join(' · ')+'</div>'+
 (group.id==='4.1'?'<p class="vz-passive-caption">La Wiki mostra qui le icone Guerriero. Non considerare il set completato finché tutte le sei abilità della tua specializzazione non sono effettivamente a P.</p>':
 '<p class="vz-passive-caption">Il bonus set si attiva nel gioco soltanto quando tutti gli elementi richiesti sono effettivamente completati o attivati.</p>')+
 '</section>';
}
function renderMarkup(){
 return '<div class="vz-passive-root" id="vz-passive-wiki-tree">'+
 '<header class="vz-passive-hero">'+(model.cover?'<img class="vz-passive-cover" src="'+esc(model.cover)+'" alt="" loading="lazy">':'')+
 '<div><span class="vz-passive-eyebrow">VERZUM WIKI · SISTEMA PASSIVE</span><h2>Albero delle abilità passive</h2>'+
 '<p>Abilità, libri, pozioni permanenti e pesci: immagini e bonus letti direttamente dalla Wiki VERZUM.</p>'+
 '<a href="#wiki/systems/passive_skills" target="_parent">Apri la guida completa nella Wiki</a></div></header>'+
 '<div class="vz-passive-tabs" role="group" aria-label="Rami dell’albero passive">'+Object.entries(tabs).map(([id,label])=>
 '<button type="button" data-vz-passive-tab="'+id+'" class="'+(activeTab===id?'is-active':'')+'" aria-pressed="'+String(activeTab===id)+'">'+esc(label)+'</button>').join('')+'</div>'+
 '<div class="vz-passive-content">'+
 (activeTab==='skills'?skills():activeTab==='recipe'?helpers():
 activeTab==='sets'?model.groups.filter(g=>g.type==='sets').map(setCard).join(''):
 model.groups.filter(g=>g.type==='consumables').map(setCard).join(''))+
 '</div>'+
 (activeTab==='skills'?'<details class="vz-passive-source-details"><summary>Bonus per ogni livello, da 1 a P (tabelle originali)</summary>'+
 '<div class="vz-passive-wiki-table">'+model.bonusTables+'</div></details>':'')+
 '<footer class="vz-passive-footer">Fonte: <a href="#wiki/systems/passive_skills" target="_parent">Wiki Abilità passive</a>. Le formule e i costi sotto rimangono quelli del calcolatore originale. Le selezioni dei set sono salvate soltanto in questo browser.</footer>'+
 '</div>';
}
let queued=false;
function schedule(){
 if(queued)return;queued=true;queueMicrotask(()=>{queued=false;mount()});
}
function mount(){
 if(location.hash!=='#passive'||!VIEW.classList.contains('on'))return;
 ensure();
 const existing=VIEW.querySelector('#vz-passive-wiki-tree-anchor');
 if(existing){
  if(model&&!existing.querySelector('#vz-passive-wiki-tree'))existing.innerHTML=renderMarkup();
  else if(loadError&&!existing.querySelector('#vz-passive-wiki-tree'))existing.innerHTML='<div class="vz-passive-root">Impossibile caricare la Wiki. Il calcolatore originale rimane disponibile.</div>';
  return;
 }
 const anchor=VIEW.querySelector('.hero');
 if(!anchor)return;
 const node=document.createElement('div');
 if(loadError)node.innerHTML='<div class="vz-passive-root">Impossibile caricare le informazioni dalla Wiki. Il calcolatore originale rimane disponibile.</div>';
 else if(!model)node.innerHTML='<div class="vz-passive-root">Caricamento delle abilità passive dalla Wiki…</div>';
 else node.innerHTML=renderMarkup();
 node.id='vz-passive-wiki-tree-anchor';
 anchor.insertAdjacentElement('afterend',node);
}
function redraw(){
 const root=VIEW.querySelector('#vz-passive-wiki-tree-anchor');if(root&&model)root.innerHTML=renderMarkup();
}
VIEW.addEventListener('click',e=>{
 const tab=e.target.closest('[data-vz-passive-tab]');
 if(tab){activeTab=tab.dataset.vzPassiveTab;redraw();return}
 const skill=e.target.closest('[data-vz-passive-skill]');
 if(skill){
  selectedSkill=Number(skill.dataset.vzPassiveSkill)||0;
  const original=VIEW.querySelector('[data-pi="'+selectedSkill+'"]');
  if(original)original.click();
  redraw();schedule();
 }
});
VIEW.addEventListener('change',e=>{
 const input=e.target.closest('[data-vz-passive-owned]');
 if(!input)return;
 owned[input.dataset.vzPassiveOwned]=input.checked;
 persist();redraw();
});
new MutationObserver(schedule).observe(VIEW,{childList:true});
window.addEventListener('hashchange',schedule);
window.VERZUM_PASSIVE_WIKI_TREE={refresh:schedule,get source(){return WIKI},get skillCount(){return model?.books.length||0},get setCount(){return model?.groups.length||0},get objectCount(){return model?.objects.length||0}};
schedule();
})();