/* VERZUM — native, simple Planner. Preserves existing saved plans and prices. */
(function(){
'use strict';
if(typeof sections==='undefined'||typeof state==='undefined'||typeof panel==='undefined'||typeof render!=='function')return;
const KINDS={upgrade:'Potenziamento',gaya:'Gaya',pet:'Pet',mount:'Cavalcatura',skills:'Abilità',boss:'Boss e dungeon',farming:'Farming',custom:'Personalizzato'};
const esc=value=>String(value??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const money=n=>new Intl.NumberFormat('it-IT',{maximumFractionDigits:0}).format(Number(n)||0)+' Yang';
const MAX=1000000000000000;
const n=value=>Number.isFinite(Number(value))?Math.max(0,Math.min(MAX,Number(value))):0;
const number=value=>Math.floor(n(value));
const list=window.VERZUM_RELEASE?.materialIds||{};
const inverse=Object.fromEntries(Object.entries(list).map(([name,id])=>[String(id),name]));
const nameOf=id=>inverse[id]||window.VERZUM_MATERIAL_L10N?.it?.[id]||window.VERZUM_RELEASE?.reference?.names?.[id]||String(id);
const root=document.getElementById('panels');
let open=false,editing=null,draft=null,filter='all',query='',uidCounter=0;
const id=()=>('vzplan-'+Date.now().toString(36)+'-'+(++uidCounter));
const init=()=>({name:'',kind:'upgrade',yang:0,notes:'',rows:[{name:'',qty:1}]});
function clean(){
 if(!Array.isArray(state.planner))state.planner=[];
 let changed=false;
 for(const p of state.planner){
  if(!p||typeof p!=='object')continue;
  if(!p.uid){p.uid=id();changed=true}
  if(p.done===undefined){p.done=false;changed=true}
  if(!p.materials||typeof p.materials!=='object'||Array.isArray(p.materials)){p.materials={};changed=true}
  if(!p.kind){p.kind='custom';changed=true}
 }
 if(changed)save();
}
function migrate(){
 let old=null;try{old=JSON.parse(localStorage.getItem('dt_plan')||'[]')}catch(_){}
 if(!Array.isArray(old))return 0;
 const existing=new Set(state.planner.map(p=>p.legacyKey).filter(Boolean));
 let added=0;
 for(const [index,p] of old.slice(0,500).entries()){
  if(!p||typeof p!=='object'||Array.isArray(p))continue;
  const title=String(p.t||p.name||'').trim().slice(0,150);
  if(!title)continue;
  const src=p.m||p.materials||{};
  if(!src||typeof src!=='object'||Array.isArray(src))continue;
  const key=index+':'+JSON.stringify([title,p.s,p.y,src]).slice(0,1800);
  if(existing.has(key))continue;
  const materials={},materialIds={};
  for(const [key,raw] of Object.entries(src).slice(0,100)){
   const qty=number(raw);if(qty<=0||qty>1e9)continue;
   const name=nameOf(key).slice(0,100);
   materials[name]=(materials[name]||0)+qty;
   materialIds[key]=qty;
  }
  if(state.planner.length>=1000)break;
  state.planner.push({uid:id(),legacyKey:key,name:title,kind:'upgrade',source:'Calcolatore VERZUM',materials,materialIds,
   yang:n(p.y??p.yang),notes:String(p.s||p.notes||'').slice(0,900),done:false,created:new Date().toLocaleDateString('it-IT')});
  existing.add(key);added++;
 }
 if(added)save();
 return added;
}
function nativePrices(){try{return JSON.parse(localStorage.getItem('dt_prices')||'{}')||{}}catch(_){return{}}}
function cost(p,prices){
 let materialsCost=0,missing=0;
 for(const [name,raw] of Object.entries(p.materials||{})){
  const qty=n(raw);if(!qty)continue;
  const id=Object.keys(p.materialIds||{}).find(key=>nameOf(key)===name)||list[name];
  const value=id!=null?prices[id]:undefined;
  const unit=value===undefined?state.prices?.[name]:value;
  if(unit===undefined||unit===null||!Number.isFinite(Number(unit))||Number(unit)<0){missing++;continue}
  materialsCost+=Number(unit)*qty;
 }
 return{yang:n(p.yang),materialCost:materialsCost,missing,total:n(p.yang)+materialsCost};
}
function gather(){
 const prices=nativePrices(),active=state.planner.filter(p=>!p.done);
 const stats={active:active.length,done:state.planner.length-active.length,yang:0,materials:0,missing:0};
 for(const p of active){const c=cost(p,prices);stats.yang+=c.yang;stats.materials+=c.materialCost;stats.missing+=c.missing}
 return stats;
}
function getDraft(form){
 return{
  name:form.querySelector('[name="vz-name"]').value.trim().slice(0,160),
  kind:form.querySelector('[name="vz-kind"]').value,
  yang:n(form.querySelector('[name="vz-yang"]').value),
  notes:form.querySelector('[name="vz-notes"]').value.trim().slice(0,1200),
  rows:[...form.querySelectorAll('[data-vzp-row]')].map(row=>({name:row.querySelector('[data-vzp-mat-name]').value.trim().slice(0,100),
   qty:number(row.querySelector('[data-vzp-mat-qty]').value)}))
 };
}
function rowHTML(r,i){
 return '<div class="vz-planner-material-row" data-vzp-row><label class="vz-planner-field">Materiale'+
 '<input type="text" list="vz-planner-catalog" data-vzp-mat-name maxlength="100" value="'+esc(r.name)+'" placeholder="Cerca materiale"></label>'+
 '<label class="vz-planner-field">Quantità<input type="number" data-vzp-mat-qty min="1" max="1000000000" step="1" value="'+esc(r.qty||1)+'"></label>'+
 '<button type="button" class="vz-planner-remove" data-vzp-remove="'+i+'" title="Rimuovi materiale" aria-label="Rimuovi materiale">×</button></div>';
}
function formHTML(){
 if(!open)return '';
 const d=draft||init();
 const suggestions=[...new Set([...Object.keys(list),...Object.keys(state.prices||{})])].sort((a,b)=>a.localeCompare(b,'it')).slice(0,1000);
 return '<form data-vzp-form class="vz-planner-editor"><h3>'+(editing?'Modifica obiettivo':'Nuovo obiettivo')+'</h3>'+
 '<div class="vz-planner-grid"><label class="vz-planner-field">Obiettivo *<input name="vz-name" required maxlength="160" value="'+esc(d.name)+'" placeholder="Es. Spada da Battaglia +9"></label>'+
 '<label class="vz-planner-field">Categoria<select name="vz-kind">'+Object.entries(KINDS).map(([k,v])=>'<option value="'+k+'"'+(d.kind===k?' selected':'')+'>'+esc(v)+'</option>').join('')+'</select></label></div>'+
 '<div class="vz-planner-grid"><label class="vz-planner-field">Costo NPC in Yang<input type="number" min="0" max="'+MAX+'" step="1" name="vz-yang" value="'+esc(d.yang)+'"></label>'+
 '<label class="vz-planner-field">Note personali<input name="vz-notes" maxlength="1200" value="'+esc(d.notes)+'" placeholder="Ad es. da +3 a +9"></label></div>'+
 '<p class="vz-planner-hint">Materiali necessari (puoi aggiungerli in seguito)</p>'+
 '<div class="vz-planner-material-editor">'+d.rows.map(rowHTML).join('')+'</div>'+
 '<datalist id="vz-planner-catalog">'+suggestions.map(x=>'<option value="'+esc(x)+'"></option>').join('')+'</datalist>'+
 '<div class="vz-planner-actions"><button type="button" class="btn small outline" data-vzp="add-material">+ Aggiungi materiale</button>'+
 '<button type="submit" class="btn vz-planner-primary">'+(editing?'Salva modifiche':'Salva obiettivo')+'</button>'+
 '<button type="button" class="btn small outline" data-vzp="cancel">Annulla</button></div></form>';
}
function projectCard(p,i,prices){
 const c=cost(p,prices),mat=Object.entries(p.materials||{}).filter(([name,q])=>name&&Number(q)>0);
 return '<article data-vzp-card="'+i+'" data-vzp-terms="'+esc([p.name,p.notes,p.source,KINDS[p.kind]||''].join(' ').toLocaleLowerCase('it'))+'" class="vz-planner-card'+(p.done?' is-done':'')+'">'+
 '<div class="vz-planner-card-header"><input type="checkbox" data-vzp-done="'+i+'" aria-label="Obiettivo completato: '+esc(p.name)+'"'+(p.done?' checked':'')+'>'+
 '<div class="vz-planner-card-main"><h3>'+esc(p.name)+'</h3><span class="vz-planner-source">'+esc(KINDS[p.kind]||KINDS.custom)+' · '+esc(p.source||'Planner')+'</span>'+
 '<div class="vz-planner-card-summary"><span>NPC: '+money(c.yang)+'</span><span>Materiali: '+mat.length+'</span>'+
 '<span>Totale noto: '+money(c.total)+'</span>'+(c.missing?'<span class="vz-planner-unknown">'+c.missing+' prezzi mancanti</span>':'')+'</div>'+
 (p.notes?'<p>'+esc(p.notes)+'</p>':'')+
 (mat.length?'<details><summary class="vz-planner-hint">Mostra materiali</summary><div class="vz-planner-badges">'+mat.map(([name,q])=>
 '<span class="vz-planner-status">'+esc(name)+' × '+esc(q)+'</span>').join('')+'</div></details>':'')+
 '</div><span class="vz-planner-status'+(p.done?' is-done':'')+'">'+(p.done?'Completato':'In corso')+'</span></div>'+
 '<div class="vz-planner-card-controls"><button type="button" data-vzp-edit="'+i+'">Modifica</button>'+
 '<button type="button" data-vzp-copy="'+i+'">Duplica</button><button type="button" data-vzp-delete="'+i+'">Elimina</button></div></article>';
}
function page(){
 clean();migrate();
 const s=gather(),prices=nativePrices();
 return '<div id="vz-planner" class="vz-planner">'+
 '<p class="vz-planner-hint">Crea un obiettivo, indica ciò che ti serve e gestisci tutti i progetti dei calcolatori in un unico posto.</p>'+
 '<div class="vz-planner-toolbar"><button type="button" class="btn vz-planner-primary" data-vzp="new">+ Crea obiettivo</button>'+
 '<input id="vz-planner-search" class="vz-planner-search" type="search" placeholder="Cerca obiettivi..." aria-label="Cerca obiettivi" value="'+esc(query)+'">'+
 '<select class="control" id="vz-planner-filter" aria-label="Filtra obiettivi">'+
 ['all','open','done'].map((id,i)=>'<option value="'+id+'"'+(filter===id?' selected':'')+'>'+['Tutti','Da completare','Completati'][i]+'</option>').join('')+'</select></div>'+
 '<div class="vz-planner-overview">'+[['Da completare',s.active],['Completati',s.done],['Yang NPC',money(s.yang)],['Totale noto',money(s.yang+s.materials)]].map(([k,v])=>
 '<div class="vz-planner-stat"><small>'+esc(k)+'</small><strong>'+esc(v)+'</strong></div>').join('')+'</div>'+
 (s.missing?'<p class="vz-planner-hint vz-planner-note">Attenzione: '+s.missing+' prezzi materiali non impostati. Il totale visualizzato è parziale.</p>':'')+
 formHTML()+
 '<div class="vz-planner-list">'+(state.planner.length?state.planner.map((p,i)=>projectCard(p,i,prices)).join(''):
 '<div class="vz-planner-empty"><strong>Nessun obiettivo</strong>Inizia con «Crea obiettivo» oppure importa dal calcolatore.</div>')+'</div>'+
 '<div class="vz-planner-footer"><button type="button" class="btn small outline" data-vzp="summary">Copia riepilogo</button>'+
 '<button type="button" class="btn small outline" data-vzp="export">Esporta JSON</button>'+
 '<button type="button" class="btn small outline" data-vzp="import">Importa JSON</button></div>'+
 '<input type="file" class="vz-planner-import" id="vz-planner-import" accept=".json,application/json"></div>';
}
function applyFilter(){
 const q=query.toLocaleLowerCase('it').trim();
 for(const el of root.querySelectorAll('[data-vzp-card]')){
  const p=state.planner[Number(el.dataset.vzpCard)];
  el.hidden=!p||!!q&&!el.dataset.vzpTerms.includes(q)||(filter==='open'&&!!p.done)||(filter==='done'&&!p.done);
 }
}
function start(index=null){
 const p=index===null?null:state.planner[index];if(index!==null&&!p)return;
 editing=p?.uid||null;
 draft=p?{name:p.name||'',kind:p.kind||'custom',yang:n(p.yang),notes:p.notes||'',
  rows:Object.entries(p.materials||{}).map(([name,qty])=>({name,qty}))}:init();
 if(!draft.rows.length)draft.rows=[{name:'',qty:1}];
 open=true;render();applyFilter();
 root.querySelector('[name="vz-name"]')?.focus();
}
function saveForm(form){
 const raw=getDraft(form);
 if(!raw.name){form.querySelector('[name="vz-name"]').focus();return}
 const materials={},materialIds={};
 for(const line of raw.rows){
  if(!line.name||!line.qty)continue;
  materials[line.name]=(materials[line.name]||0)+line.qty;
 }
 const old=state.planner.find(p=>p.uid===editing);
 for(const [name,qty] of Object.entries(materials)){
  const ref=list[name]||Object.keys(old?.materialIds||{}).find(key=>nameOf(key)===name);
  if(ref)materialIds[String(ref)]=qty;
 }
 const item={...(old||{}),uid:old?.uid||id(),name:raw.name,kind:Object.hasOwn(KINDS,raw.kind)?raw.kind:'custom',
  source:old?.source||'Planner',yang:raw.yang,notes:raw.notes,materials,materialIds,
  created:old?.created||new Date().toLocaleDateString('it-IT'),done:!!old?.done};
 // Preserve legacyKey when an imported project is edited; otherwise old dt_plan would re-import it.
 if(old)Object.assign(old,item);else state.planner.unshift(item);
 open=false;editing=null;draft=null;render();applyFilter();
}
function safeEntry(row){
 if(!row||typeof row!=='object'||Array.isArray(row)||typeof row.name!=='string'||!row.name.trim())return null;
 const materials={};
 if(row.materials&&typeof row.materials==='object'&&!Array.isArray(row.materials)){
  for(const [name,q] of Object.entries(row.materials).slice(0,100)){
   if(name.length<=100&&name.trim()&&number(q)>0&&number(q)<=1e9)materials[name]=number(q);
  }
 }
 const materialIds={};const available=row.materialIds;
 if(available&&typeof available==='object'&&!Array.isArray(available)){
  for(const [key,value] of Object.entries(available).slice(0,100)){
   if(!/^[a-z0-9_]{1,50}$/i.test(key))continue;
   const qty=number(value);
   if(qty>0&&qty<=1e9&&materials[nameOf(key)]===qty)materialIds[key]=qty;
  }
 }
 return {uid:id(),name:row.name.trim().slice(0,160),kind:Object.hasOwn(KINDS,row.kind)?row.kind:'custom',
 source:String(row.source||'Archivio importato').slice(0,100),yang:n(row.yang),notes:String(row.notes||'').slice(0,1200),
 materials,materialIds,created:String(row.created||new Date().toLocaleDateString('it-IT')).slice(0,40),done:!!row.done};
}
function importJSON(file){
 if(!file||file.size>1024*1024)return;
 file.text().then(raw=>{
  try{
   const parsed=JSON.parse(raw),arr=Array.isArray(parsed)?parsed:parsed?.entries;
   if(!Array.isArray(arr))throw Error('Formato errato');
   const existing=new Set(state.planner.map(p=>JSON.stringify([p.name,p.materials,p.yang,p.notes])));
   let count=0;
   for(const row of arr.slice(0,500)){
    const p=safeEntry(row);if(!p||state.planner.length>=1000)continue;
    const sig=JSON.stringify([p.name,p.materials,p.yang,p.notes]);
    if(existing.has(sig))continue;
    state.planner.push(p);existing.add(sig);count++;
   }
   render();alert('Importati '+count+' progetti senza eliminare quelli esistenti.');
  }catch(_){alert('File non valido: usa il JSON esportato dal Planner VERZUM.')}
 });
}
root.addEventListener('click',e=>{
 const b=e.target.closest('[data-vzp],[data-vzp-edit],[data-vzp-copy],[data-vzp-delete],[data-vzp-remove]');
 if(!b||!b.closest('#vz-planner'))return;
 const form=root.querySelector('[data-vzp-form]');
 if(b.dataset.vzpEdit!==undefined){start(Number(b.dataset.vzpEdit));return}
 if(b.dataset.vzpCopy!==undefined){
  const p=state.planner[Number(b.dataset.vzpCopy)];if(!p)return;
  const c=JSON.parse(JSON.stringify(p));c.uid=id();c.name+=' · copia';c.done=false;delete c.legacyKey;
  state.planner.splice(Number(b.dataset.vzpCopy)+1,0,c);render();return;
 }
 if(b.dataset.vzpDelete!==undefined){
  if(!confirm('Eliminare questo obiettivo?'))return;
  state.planner.splice(Number(b.dataset.vzpDelete),1);render();return;
 }
 if(b.dataset.vzpRemove!==undefined&&form){
  draft=getDraft(form);draft.rows.splice(Number(b.dataset.vzpRemove),1);
  if(!draft.rows.length)draft.rows=[{name:'',qty:1}];
  render();return;
 }
 switch(b.dataset.vzp){
 case 'new':start();break;
 case 'cancel':open=false;editing=null;draft=null;render();break;
 case 'add-material':if(form){draft=getDraft(form);draft.rows.push({name:'',qty:1});render()}break;
 case 'export':downloadJSON('verzum-planner.json',{schema:'verzum-planner-v2',entries:state.planner});break;
 case 'import':root.querySelector('#vz-planner-import')?.click();break;
 case 'summary':{
  const rows=state.planner.map(p=>(p.done?'✓ ':'□ ')+p.name+' | '+money(p.yang)+' | '+Object.entries(p.materials||{}).map(([name,q])=>name+': '+q).join(', '));
  if(typeof copy==='function')copy(rows.join('\n')||'Nessun obiettivo');
  break;
 }
 }
});
root.addEventListener('submit',e=>{if(!e.target.matches('[data-vzp-form]'))return;e.preventDefault();saveForm(e.target)});
root.addEventListener('change',e=>{
 const el=e.target;
 if(el.dataset.vzpDone!==undefined){const p=state.planner[Number(el.dataset.vzpDone)];if(p){p.done=el.checked;render();applyFilter()}return}
 if(el.id==='vz-planner-filter'){filter=el.value;applyFilter();return}
 if(el.id==='vz-planner-import'){importJSON(el.files?.[0]);el.value=''}
});
root.addEventListener('input',e=>{if(e.target.id==='vz-planner-search'){query=e.target.value;applyFilter()}});
clean();migrate();
sections.planner=()=>[panel('vz-planner-panel','I tuoi obiettivi',page(),12,'PLANNER 2.0')];
TITLES.planner=['PIANIFICATORE','I tuoi obiettivi','Crea, modifica e completa progetti con materiali, Yang e riepilogo dei costi.'];
if(state.route==='planner')render();
window.VERZUM_EASY_PLANNER={get count(){return state.planner.length},migrate:()=>{const count=migrate();if(count&&state.route==='planner')render();return count}};
})();