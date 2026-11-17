/* Ricerca Wiki locale: indice composto esclusivamente da dati e PNG autentici gia' presenti.
 * Funziona per nome, parte del nome, codice item, categoria, guida e alias attestati.
 * Nessun item o immagine viene inventato, e nessuna query manda fuori dal sito.
 */
(function(){
'use strict';
const release=window.VERZUM_RELEASE||{};
const original=window.VERZUM_WIKI_MARKUP||{};
const verifiedIconIds=new Set(('50187 50188 50203 28550 28555 50189 3219 11279 12249 13049 14149 17109 16029 15049 85003 71143 100138 100142 100131 100130 100129 100132 100133 100134 1179 11479 12389 299 11679 12529 5119 11879 12669 124040 134040 144040 154040 114040 164040 50821').split(' '));
const titleOverrides=Object.freeze({
 '50301':'Arte della Guerra Sun-zi',
 '50302':'Arte della Guerra Wu-zi'
});
const pages=new Map();
const items=new Map();
const normalize=x=>String(x??'').toLocaleLowerCase('it').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’‘]/g,"'").replace(/\s+/g,' ').trim();
const escapeHTML=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const safeId=id=>/^[a-z0-9_-]{1,48}$/i.test(String(id));
const safePath=x=>/^[a-z0-9/_-]{1,220}$/i.test(String(x));
function addItem(id,name,weight=1,category='Oggetti'){
 id=String(id||'').trim();name=String(name||'').trim();
 if(!safeId(id)||!name)return;
 const current=items.get(id);
 if(!current){
  items.set(id,{id,title:name,weight,category,aliases:new Set([name,id]),type:'item',url:'#wiki/item/'+encodeURIComponent(id)});
 }else{
  current.aliases.add(name);
  if(weight>current.weight){current.title=name;current.weight=weight;current.category=category;}
 }
}
function addPage(path,title,category,icon){
 if(!safePath(path)||!title)return;
 const p=pages.get(path);
 if(!p){pages.set(path,{id:path,title:String(title),category:String(category||'Wiki'),icon:String(icon||''),aliases:new Set([title,category]),type:'page',url:'#wiki/'+path});}
 else p.aliases.add(title);
}
for(const [name,id] of Object.entries(release.materialIds||{}))addItem(id,name,1);
for(const [id,name] of Object.entries(release.reference?.names||{}))addItem(id,name,2);
for(const obj of (release.catalog||[]))if(obj&&obj.id&&obj.name)addItem(obj.id,obj.name,4,obj.cat||'Equipaggiamento');
if(typeof ITALIAN_NAMES!=='undefined')for(const [id,name] of Object.entries(ITALIAN_NAMES))addItem(id,name,6);
const guideNames=window.VERZUM_GUIDE_VISUAL?.items||{};
for(const [id,name] of Object.entries(guideNames))addItem(id,name,7);
for(const [id,name] of Object.entries(titleOverrides))addItem(id,name,10);
const l10n=window.VERZUM_ITEM_L10N||{};
for(const source of Object.values(l10n)){
 if(!source||typeof source!=='object')continue;
 for(const [id,name] of Object.entries(source)){
  if(items.has(id)&&name)items.get(id).aliases.add(name);
 }
}
if(original.sidebar){
 const temp=document.createElement('div');
 temp.innerHTML=original.sidebar;
 temp.querySelectorAll('.wk-cat').forEach(cat=>{
  const group=cat.querySelector('.wk-cat__label')?.textContent.trim()||'Wiki';
  const image=cat.querySelector('.wk-cat__icon')?.getAttribute('src')||'';
  cat.querySelectorAll('a.wk-sub[href^="#wiki/"]').forEach(a=>{
   const id=a.getAttribute('href').slice(6),label=a.textContent.trim();
   addPage(id,label,group,image);
  });
 });
}
if(original.home)addPage('','Verzum Wiki','Wiki','');
for(const [path,p] of Object.entries(window.VERZUM_WIKI_DATA||{})){
 if(!p||typeof p!=='object')continue;
 addPage(path,p.title||path,p.group||'Wiki','');
 // L'indice accoglie anche i titoli item autentici nelle future pagine importate.
 // Mai creare una scheda dal solo ID, senza un nome effettivamente presente nell'HTML.
 if(typeof p.html==='string'&&p.html){
  const wrapper=document.createElement('div');wrapper.innerHTML=p.html;
  wrapper.querySelectorAll('a[href^="#wiki/item/"]').forEach(a=>{
   const raw=a.getAttribute('href').slice(11);
   const name=a.textContent.trim();
   if(name&&safeId(raw))addItem(raw,name,9,p.group||'Oggetti');
  });
 }
}
/* Accetta esclusivamente i nomi reali estratti dalle 81+ pagine originali,
 * conservando ID e alias senza creare item immaginari.
 */
const mirrorIndex=window.VERZUM_WIKI_CRAWLED_INDEX||{};
for(const record of mirrorIndex.items||[]){
 if(!record||!record.id||!record.name)continue;
 addItem(record.id,record.name,12,'Oggetti Wiki');
 const entry=items.get(String(record.id));
 if(entry)for(const alias of record.aliases||[])if(alias)entry.aliases.add(String(alias));
}
for(const record of mirrorIndex.pages||[]){
 if(!record||!record.path||!record.title)continue;
 addPage(record.path,record.title,record.group||'Wiki','');
}
const records=[...items.values(),...pages.values()];
const collator=new Intl.Collator('it',{sensitivity:'base',numeric:true});
function score(rec,query,exact){
 const q=normalize(query);
 if(!q)return 0;
 const tokens=q.split(' ').filter(Boolean);
 let best=0;
 for(const alias of rec.aliases){
  const a=normalize(alias);
  if(!a)continue;
  // I nomi in rumeno presenti nei dati del vecchio calcolatore non devono
  // creare falsi positivi italiani (es. "Carte" non e' un risultato per "arte").
  if(/^carte(?:a|:)/.test(a)&&!a.startsWith(q)&&!exact)continue;
  if(exact){
   if(a===q)best=Math.max(best,200);
   continue;
  }
  if(a===q)best=Math.max(best,180);
  else if(a.startsWith(q))best=Math.max(best,135);
  else if(a.split(/[\s\/\-()]+/).some(part=>part.startsWith(q)))best=Math.max(best,105);
  else if(a.includes(q))best=Math.max(best,90);
  else if(tokens.length>1&&tokens.every(t=>a.includes(t)))best=Math.max(best,60);
 }
 // I titoli visibili sono preferiti agli alias di una lingua differente.
 if(best>0&&normalize(rec.title).includes(q))best+=15;
 return best;
}
function search(q,exact=false,limit=Infinity){
 const value=normalize(q);
 if(!value)return [];
 return records.map(rec=>({rec,rank:score(rec,value,exact)}))
  .filter(x=>x.rank>0)
  .sort((a,b)=>b.rank-a.rank||(a.rec.type===b.rec.type?0:a.rec.type==='item'?-1:1)||collator.compare(a.rec.title,b.rec.title))
  .slice(0,limit).map(x=>x.rec);
}
function imageFor(rec){
 if(rec.type==='page')return rec.icon||'';
 const id=rec.id;
 if(verifiedIconIds.has(id))return 'wiki-original/items/'+id+'.png';
 if(/^\d+$/.test(id)&&mirrorIndex.items?.some(x=>x.id===id))return 'wiki-original/items/'+id+'.png';
 const icon=window.VERZUM_PNG_ICONS?.[id];
 if(typeof icon==='string'&&icon.startsWith('data:image/'))return icon;
 return '';
}
function thumb(rec){
 const src=imageFor(rec);
 // Assenza di PNG autentico: lascia lo spazio vuoto; nessuna icona sostitutiva.
 return src?'<img class="vz-search-icon" src="'+escapeHTML(src)+'" alt="" width="24" height="24" loading="lazy" decoding="async">':'<span class="vz-search-icon-empty" aria-hidden="true"></span>';
}
function resultLink(rec,kind='option',position=-1){
 const a=kind==='option';
 return '<a class="'+(a?'wk-drop__item':'vz-search-result')+'" role="'+(a?'option':'link')+'"'+(a?' id="vz-search-opt-'+position+'" aria-selected="false"':'')+
 ' href="'+escapeHTML(rec.url)+'" data-vz-result="'+escapeHTML(rec.url)+'">'+thumb(rec)+
 '<span class="vz-search-result-name">'+escapeHTML(rec.title)+'</span>'+(a?'':'<small>'+escapeHTML(rec.type==='item'?'Item '+rec.id:rec.category)+'</small>')+'</a>';
}
function groupsHtml(results,option=true){
 let result='';
 let serial=0;
 for(const [kind,head] of [['item','OGGETTI'],['page','PAGINE DELLA WIKI']]){
  const group=results.filter(x=>x.type===kind);
  if(!group.length)continue;
  result+='<div class="wk-drop__group">'+head+'</div>';
  for(const rec of group)result+=resultLink(rec,option?'option':'row',serial++);
 }
 return result;
}
let box=null,active=-1,open=false,owner=null;
function initBox(){
 if(box)return box;
 box=document.createElement('div');
 box.id='wk-q-list';
 box.className='wk-drop vz-search-dropdown';
 box.setAttribute('role','listbox');
 box.setAttribute('aria-label','Risultati di ricerca VERZUM');
 box.hidden=true;
 document.body.appendChild(box);
 box.addEventListener('pointerdown',e=>{
  if(e.target.closest('a[data-vz-result]'))e.preventDefault();
 });
 box.addEventListener('click',e=>{
  const a=e.target.closest('a[data-vz-result]');
  if(!a)return;
  e.preventDefault();
  go(a.getAttribute('href'));
 });
 return box;
}
function locate(input){
 if(!box||box.hidden)return;
 const r=input.getBoundingClientRect();
 const maxW=Math.max(240,window.innerWidth-16);
 const width=Math.max(r.width,Math.min(340,maxW));
 const left=Math.max(8,Math.min(r.left,window.innerWidth-width-8));
 const below=window.innerHeight-r.bottom;
 const height=Math.min(390,Math.max(180,(below>=200?below-12:r.top-12)));
 box.style.width=width+'px';
 box.style.left=left+'px';
 box.style.maxHeight=height+'px';
 box.style.top=(below>=200?r.bottom+4:Math.max(8,r.top-height-4))+'px';
}
function stateInput(input){
 const scope=input.closest('.vz-wiki');
 const form=input.closest('.wk-search');
 return {scope,form,exact:!!form?.querySelector('.wk-exact input')?.checked};
}
function viewSearch(input){
 if(!input)return;
 const q=input.value.trim(),ctx=stateInput(input);
 if(!ctx.scope)return;
 const clear=ctx.form?.querySelector('[data-vz-search-clear]');
 if(clear)clear.hidden=!q;
 owner=input;
 const drop=initBox();
 active=-1;
 if(!q){hideSearch();return}
 const all=search(q,ctx.exact);
 const subset=all.slice(0,8);
 drop.innerHTML=all.length?
  groupsHtml(subset,true)+'<a class="vz-search-all" href="#wiki/search/'+encodeURIComponent(q)+'">TUTTI I RISULTATI <span>'+all.length+'</span></a>':
  '<div class="vz-search-empty">Nessun risultato nell’archivio locale.</div>';
 drop.hidden=false;
 open=true;
 input.setAttribute('aria-expanded','true');
 input.setAttribute('aria-controls','wk-q-list');
 locate(input);
}
function hideSearch(){
 open=false;active=-1;
 if(box)box.hidden=true;
 if(owner){owner.setAttribute('aria-expanded','false');owner.removeAttribute('aria-activedescendant');}
}
function go(link){
 hideSearch();
 if(!link||!link.startsWith('#wiki'))return;
 if(location.hash===link){
  if(state.route==='wiki'||state.route==='guide')render();
 }else location.hash=link;
}
function selectRow(offset){
 if(!box||box.hidden)return;
 const rows=[...box.querySelectorAll('a[data-vz-result]')];
 if(!rows.length)return;
 active=(active+offset+rows.length)%rows.length;
 rows.forEach((row,i)=>row.setAttribute('aria-selected',String(i===active)));
 owner?.setAttribute('aria-activedescendant',rows[active].id);
 rows[active]?.scrollIntoView({block:'nearest'});
}
function searchRoute(q){return '#wiki/search/'+encodeURIComponent(q.trim())}
function queryFromRoute(path){
 if(path==='search')return '';
 if(!path.startsWith('search/'))return '';
 try{return decodeURIComponent(path.slice(7))}catch(_){return path.slice(7)}
}
function renderPage(path){
 const query=queryFromRoute(path);
 const found=search(query,false);
 const page=found.length?groupsHtml(found,false):'<p class="wk-p">Nessun risultato nell’archivio locale.</p>';
 return '<div class="wiki-main" id="wiki-main"><header class="wk-head"><nav class="wk-crumbs"><ol><li><a href="#wiki">Verzum Wiki</a></li><li>Ricerca</li></ol></nav><div class="wk-head__row"><h1 class="wk-head__title">Risultati per: '+escapeHTML(query)+'</h1></div></header>'+
  '<article class="wk-doc wk-searchpage"><p class="wk-searchpage__q">'+found.length+' risultati nell’archivio attualmente importato.</p><div class="vz-search-full">'+page+'</div></article></div>';
}
function renderItemPage(id){
 id=String(id||'');
 const rec=items.get(id);
 if(!rec)return null;
 const src=imageFor(rec);
 const img=src?'<img class="vz-item-original" src="'+escapeHTML(src)+'" alt="'+escapeHTML(rec.title)+'" loading="lazy" decoding="async">':'';
 return '<div class="wiki-main" id="wiki-main"><header class="wk-head"><nav class="wk-crumbs"><ol><li><a href="#wiki">Verzum Wiki</a></li><li>Oggetti</li></ol></nav><div class="wk-head__row"><h1 class="wk-head__title">'+escapeHTML(rec.title)+'</h1></div></header><article class="wk-doc wk-page"><div class="vz-item-detail">'+img+'<div><h2>'+escapeHTML(rec.title)+'</h2><p>Codice item: '+escapeHTML(id)+'</p></div></div><p class="wk-p">Scheda dell’oggetto presente nell’indice locale. I dettagli completi non sono ancora stati importati dalla Wiki originale.</p><a class="wk-link" href="#wiki">Torna alla Wiki</a></article></div>';
}
const panels=document.getElementById('panels');
panels?.addEventListener('input',e=>{
 if(e.target.matches('.vz-wiki .wk-search__input'))viewSearch(e.target);
});
panels?.addEventListener('change',e=>{
 if(e.target.matches('.vz-wiki .wk-exact input')){
  const input=e.target.closest('.wk-search')?.querySelector('.wk-search__input');
  if(input)viewSearch(input);
 }
});
panels?.addEventListener('keydown',e=>{
 const input=e.target.closest('.vz-wiki .wk-search__input');
 if(!input)return;
 if(e.key==='ArrowDown'||e.key==='ArrowUp'){
  e.preventDefault();
  if(!open)viewSearch(input);
  selectRow(e.key==='ArrowDown'?1:-1);
 }else if(e.key==='Escape'){if(open){e.preventDefault();hideSearch();}}
 else if(e.key==='Enter'){
  e.preventDefault();
  const rows=box?[...box.querySelectorAll('a[data-vz-result]')]:[];
  if(open&&active>=0&&rows[active])go(rows[active].getAttribute('href'));
  else if(input.value.trim())go(searchRoute(input.value));
 }
});
panels?.addEventListener('click',e=>{
 const scope=e.target.closest('.vz-wiki');
 if(!scope)return;
 const searchBtn=e.target.closest('.wk-search button[type="submit"]');
 const allBtn=e.target.closest('.vz-search-all');
 const clearBtn=e.target.closest('[data-vz-search-clear]');
 if(searchBtn){
  e.preventDefault();
  const input=searchBtn.closest('.wk-search')?.querySelector('.wk-search__input');
  if(input?.value.trim())go(searchRoute(input.value));
  else input?.focus();
 }
 if(clearBtn){
  e.preventDefault();
  const input=clearBtn.closest('.wk-search')?.querySelector('.wk-search__input');
  if(input){input.value='';viewSearch(input);input.focus();}
 }
 if(allBtn){e.preventDefault();go(allBtn.getAttribute('href'));}
});
panels?.addEventListener('submit',e=>{
 if(!e.target.matches('.vz-wiki .wk-search'))return;
 e.preventDefault();
 const input=e.target.querySelector('.wk-search__input');
 if(input?.value.trim())go(searchRoute(input.value));
});
document.addEventListener('pointerdown',e=>{
 if(box?.contains(e.target))return;
 if(e.target.closest('.vz-wiki .wk-search'))return;
 hideSearch();
},true);
document.addEventListener('click',e=>{
 if(!box)return;
 const a=e.target.closest('.vz-search-all');
 if(a&&box.contains(a)){e.preventDefault();go(a.getAttribute('href'));}
});
window.addEventListener('scroll',()=>{if(open&&owner)locate(owner);},true);
window.addEventListener('resize',()=>{if(open&&owner)locate(owner)});
window.addEventListener('hashchange',hideSearch);
document.addEventListener('error',e=>{
 const img=e.target;
 if(img?.matches?.('.vz-search-icon,.vz-item-original')&&img.getAttribute('src')?.startsWith('wiki-original/items/'))img.hidden=true;
},true);
window.VERZUM_WIKI_SEARCH={search,records,items,pages,renderPage,renderItemPage,imageFor,searchRoute,viewSearch,hideSearch,exactCount:items.size,pageCount:pages.size};
if((location.hash.startsWith('#wiki/search/')||location.hash.startsWith('#wiki/item/'))&&(state.route==='wiki'||state.route==='guide'))render();
})();