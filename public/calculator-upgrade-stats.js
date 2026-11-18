/* VERZUM Tools — dati ufficiali della Wiki nei Potenziamenti.
   Le statistiche provengono da VERZUM_WIKI_API_TIPS, già caricato nel sito.
   Non inventa valori né sovrascrive i prezzi, le formule o i dati di gioco. */
(function(){
'use strict';
if(window.__verzumUpgradeWikiStats)return;
if(typeof rCraft!=='function'||typeof S==='undefined'||typeof DATA==='undefined')return;
window.__verzumUpgradeWikiStats=true;
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const validColor=x=>/^[a-f0-9]{6}$/i.test(String(x||''))?'#'+x:'#a5cb9e';
const byId=Object.fromEntries(DATA.items.map(item=>[String(item.id),item]));
function tipRecord(id){
 try{
  const data=window.parent?.VERZUM_WIKI_API_TIPS?.[String(id)];
  return data&&String(data.vnum)===String(id)&&Array.isArray(data.lines)?data:null;
 }catch(_){return null}
}
function exactTipId(item,level){
 if(!item)return null;
 const lv=Number(level);
 if(!Number.isInteger(lv)||lv<0||lv>item.max)return null;
 const id=String(Number(item.id)+lv);
 const tip=tipRecord(id);
 const zero=tipRecord(item.id);
 if(!tip||!zero)return null;
 // Protegge dalle sovrapposizioni fra famiglie di ID durante un'evoluzione.
 const normName=n=>String(n||'').replace(/\s*\+\d+\s*$/,'').toLocaleLowerCase('it');
 if(normName(tip.name)!==normName(zero.name))return null;
 return id;
}
function statLines(rec){
 if(!rec)return [];
 return rec.lines.filter(line=>line&&['attack','defence','apply'].includes(line.kind)&&typeof line.text==='string'&&line.text.trim());
}
function condensed(text){
 return String(text).replace(/^Valore d.attacco\s*/i,'Attacco ').replace(/^Valore attacco magico\s*/i,'Magico ')
  .replace(/^Velocità d.attacco\s*/i,'Vel. attacco ')
  .replace(/^Velocità movimento\s*/i,'Vel. movimento ')
  .replace(/^Forte contro\s*/i,'Vs. ')
  .replace(/\s+-\s+/g,'–');
}
function statHTML(id,compact){
 const info=tipRecord(id);
 const lines=statLines(info);
 if(!lines.length)return '<span class="vz-stat-missing" title="Statistica non presente nella Wiki">Dati non disponibili</span>';
 const shown=compact?lines.slice(0,3):lines;
 let out=shown.map((line,i)=>'<span class="vz-stat-line" style="color:'+validColor(line.color)+'">'+esc(condensed(line.text))+'</span>').join('');
 if(lines.length>shown.length)out+='<span class="vz-stat-more">+'+(lines.length-shown.length)+' altri bonus</span>';
 return out;
}
let tipNode=null,hovered=null;
function ensureTip(){
 if(tipNode)return tipNode;
 tipNode=document.createElement('div');
 tipNode.className='vz-upgrade-wiki-tip';
 tipNode.id='vz-upgrade-wiki-tip';
 tipNode.hidden=true;tipNode.setAttribute('role','tooltip');
 document.body.appendChild(tipNode);return tipNode;
}
function tooltipHTML(id){
 const rec=tipRecord(id);
 if(!rec)return '';
 const item=Object.values(byId).find(entry=>Number(id)>=Number(entry.id)&&Number(id)<=Number(entry.id)+entry.max);
 const src=typeof ICONS!=='undefined'&&(ICONS[id]||(item&&ICONS[item.id]))||'';
 let html='<div class="vz-upgrade-tip-icon">'+(src?'<img src="'+esc(src)+'" alt="">':'')+'</div>';
 for(const line of rec.lines){
  if(!line||typeof line.text!=='string')continue;
  const kind=String(line.kind||'').replace(/[^a-z_-]/gi,'');
  const color=validColor(line.color);
  const gap=Number.isFinite(Number(line.gap))?Math.min(32,Math.max(0,Number(line.gap))):0;
  const text=Array.isArray(line.runs)?
   line.runs.map(run=>run.img?'':('<span style="color:'+validColor(run.color||line.color)+'">'+esc(run.text||'')+'</span>')).join(''):
   esc(line.text);
  if(kind==='title')html+='<div class="vz-upgrade-tip-title" style="color:'+color+'">'+text+'</div>';
  else html+='<div class="vz-upgrade-tip-line vz-upgrade-tip-'+kind+'" style="color:'+color+';'+(gap?'margin-top:'+gap+'px':'')+'">'+text+'</div>';
 }
 return html;
}
function positionTip(e){
 if(!tipNode||tipNode.hidden||!hovered)return;
 const rect=hovered.getBoundingClientRect();
 const x=e?.clientX??rect.right;
 const y=e?.clientY??rect.top;
 let viewportH=innerHeight,viewportTop=0;
 try{
  const frame=window.parent.document.querySelector('iframe.native-calculator-frame');
  if(frame&&frame.contentWindow===window){
   const fr=frame.getBoundingClientRect(),parentH=window.parent.innerHeight;
   viewportTop=Math.max(0,-fr.top);
   viewportH=Math.min(innerHeight,Math.max(viewportTop+60,parentH-fr.top));
  }
 }catch(_){}
 const w=tipNode.offsetWidth,h=tipNode.offsetHeight;
 const pad=10,offset=16;
 let left=x+offset,top=y+offset;
 if(left+w>innerWidth-pad)left=x-w-offset;
 if(top+h>viewportH-pad)top=y-h-offset;
 const maxTop=Math.max(viewportTop,viewportH-h-pad);
 tipNode.style.left=Math.max(pad,Math.min(left,innerWidth-w-pad))+'px';
 tipNode.style.top=Math.max(viewportTop+pad,Math.min(top,maxTop))+'px';
}
function show(anchor,id,e){
 const html=tooltipHTML(id);
 if(!html){hide();return}
 const tip=ensureTip();
 hovered?.removeAttribute('aria-describedby');
 hovered=anchor;tip.innerHTML=html;tip.hidden=false;
 hovered.setAttribute('aria-describedby',tip.id);positionTip(e);
}
function hide(){
 hovered?.removeAttribute('aria-describedby');
 hovered=null;
 if(tipNode)tipNode.hidden=true;
}
function targetForEvent(e){
 const t=e.target?.closest?.('#v-crafting .it[data-id],#v-crafting .ihead,#v-crafting [data-vz-wiki-tip]');
 if(!t)return null;
 const row=t.closest('[data-vz-wiki-tip]');
 if(row)return {node:row,id:row.dataset.vzWikiTip};
 const entry=t.closest('.it[data-id]');
 if(entry)return {node:entry,id:exactTipId(byId[entry.dataset.id],0)};
 const main=t.closest('.ihead');
 return main?{node:main,id:exactTipId(byId[String(S.sel)],Number(S.from)||0)}:null;
}
document.addEventListener('pointerover',e=>{
 if(e.pointerType==='touch')return;
 const a=targetForEvent(e);
 if(a?.id&&hovered!==a.node)show(a.node,a.id,e);
},true);
document.addEventListener('pointermove',e=>{
 if(hovered&&targetForEvent(e)?.node===hovered)positionTip(e);
},true);
document.addEventListener('pointerout',e=>{
 const a=targetForEvent(e);
 if(a?.node===hovered&&!hovered.contains(e.relatedTarget))hide();
},true);
document.addEventListener('focusin',e=>{
 const a=targetForEvent(e);
 if(a?.id)show(a.node,a.id);
},true);
document.addEventListener('focusout',e=>{
 if(hovered&&hovered.contains(e.target))hide();
},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape')hide()});
document.addEventListener('click',hide,true);
window.addEventListener('hashchange',hide);
window.addEventListener('scroll',hide,true);

const nativeRcraft=rCraft;

/* Tabella orizzontale come nella Wiki: TUTTI i livelli, indipendentemente
   dai menu del calcolatore costi. Non inferire mai valori mancanti. */
function normalizeStatLabel(label){
 return String(label||'').trim()
  .replace(/^[+-]?\d+(?:[.,]\d+)?\s*%?\s+(?:di\s+)?/,'')
  .replace(/\s*[+-]?\d+(?:[.,]\d+)?\s*%?\.?\s*$/,'')
  .replace(/\s+$/,'').replace(/[.:]+$/,'').trim();
}
function parseLineValue(raw,kind){
 const text=String(raw||'');
 if(kind==='physical')return text.replace(/^Valore d.attacco\s*/i,'').replace(/\s+-\s+/g,'–').trim();
 if(kind==='magical')return text.replace(/^Valore attacco magico\s*/i,'').replace(/\s+-\s+/g,'–').trim();
 if(kind==='defence')return text.replace(/^Difesa\s*/i,'').trim();
 const suffix=text.match(/([+-]?\d+(?:[.,]\d+)?\s*%?)\.?\s*$/);
 if(suffix)return suffix[1].replace(/\s+/g,'');
 const prefix=text.match(/^([+-]?\d+(?:[.,]\d+)?\s*%?)/);
 return prefix?prefix[1].replace(/\s+/g,''):text;
}
function sourceAt(item,level){
 const id=exactTipId(item,level);
 return id?tipRecord(id):null;
}
function sourceStat(rec,key){
 if(!rec)return null;
 if(key==='physical')return rec.lines.find(l=>l.kind==='attack'&&/^Valore d.attacco\b/i.test(l.text||''))?.text??null;
 if(key==='magical')return rec.lines.find(l=>l.kind==='attack'&&/^Valore attacco magico\b/i.test(l.text||''))?.text??null;
 if(key==='defence')return rec.lines.find(l=>l.kind==='defence'&&/^Difesa\b/i.test(l.text||''))?.text??null;
 const apply=rec.applies?.find(a=>String(a.apply)===key.slice(6));
 return apply?.text??null;
}
function matrixRows(records){
 const descriptors=[
  ['physical',"Valore d'attacco"],
  ['magical','Attacco magico'],
  ['defence','Difesa']
 ];
 const used=new Set();
 for(const record of records){
  if(!record)continue;
  for(const a of record.applies||[]){
   const k='apply:'+a.apply;
   if(used.has(k))continue;
   used.add(k);
   descriptors.push([k,normalizeStatLabel(a.text)||'Bonus '+a.apply]);
  }
 }
 return descriptors.filter(([key])=>records.some(rec=>sourceStat(rec,key)!=null));
}
function makeMatrix(item){
 const total=item.max;
 const records=Array.from({length:total+1},(_,level)=>sourceAt(item,level));
 const rows=matrixRows(records);
 let html='<section class="vz-upgrade-matrix" aria-label="Valori originali della Wiki da +0 a +'+total+'">';
 html+='<div class="vz-upgrade-matrix-bar"><div><strong>Valori dei potenziamenti</strong><small>Statistiche ufficiali della Wiki · da +0 a +'+total+'</small></div>';
 html+='<div class="vz-upgrade-matrix-actions"><button type="button" data-vz-matrix-move="-1" title="Scorri i livelli a sinistra" aria-label="Scorri i livelli a sinistra">‹</button><button type="button" data-vz-matrix-move="1" title="Scorri i livelli a destra" aria-label="Scorri i livelli a destra">›</button></div></div>';
 html+='<div class="vz-upgrade-matrix-scroll" tabindex="0" role="region" aria-label="Tabella dei valori di potenziamento, scorrimento orizzontale">';
 html+='<table class="vz-upgrade-matrix-table"><thead><tr><th scope="col" class="vz-matrix-sticky">Statistica</th>';
 for(let lv=0;lv<=total;lv++){
  const id=exactTipId(item,lv);
  html+='<th scope="col" class="vz-matrix-level"'+(id?' data-vz-wiki-tip="'+esc(id)+'" tabindex="0" aria-label="'+esc((records[lv]?.name||'')+' - dettagli')+'"':'')+'>+'+lv+'</th>';
 }
 html+='</tr></thead><tbody>';
 if(!rows.length)html+='<tr><th scope="row" class="vz-matrix-sticky">Statistiche Wiki</th><td colspan="'+(total+1)+'">Nessun valore disponibile nell’archivio Wiki</td></tr>';
 for(const [key,label] of rows){
  html+='<tr><th scope="row" class="vz-matrix-sticky" title="'+esc(label)+'">'+esc(label)+'</th>';
  for(let lv=0;lv<=total;lv++){
   const raw=sourceStat(records[lv],key),id=exactTipId(item,lv);
   const v=raw!=null?parseLineValue(raw,key):'—';
   html+='<td class="vz-matrix-value"'+(id?' data-vz-wiki-tip="'+esc(id)+'" tabindex="0" aria-label="'+esc(label+' a +'+lv+': '+(raw??'dato non presente'))+'"':'')+'>';
   html+=esc(v)+'</td>';
  }
  html+='</tr>';
 }
 // Costi e percentuali come nel riferimento della Wiki.
 // Sono letti dai dati reali del calcolatore, non ricalcolati.
 for(const [label,k] of [['Costo Yang','yang'],['Potenz. %','pct']]){
  html+='<tr class="vz-matrix-cost"><th scope="row" class="vz-matrix-sticky">'+label+'</th><td>—</td>';
  for(let lv=1;lv<=total;lv++){
   const step=item.s[lv-1],value=step?.[k];
   html+='<td>'+(typeof value==='number'?(k==='yang'?esc(fmt(value)):esc(value+'%')):'—')+'</td>';
  }
  html+='</tr>';
 }
 html+='</tbody></table></div>';
 html+='<p class="vz-matrix-hint">'+(total>9?'Scorri orizzontalmente o usa le frecce per consultare tutti i 26 livelli.':'Passa il mouse su un livello o un valore per vedere la scheda completa.')+'</p>';
 html+='</section>';
 return html;
}
function enhance(){
 const view=document.querySelector('#v-crafting');
 const item=byId[String(S.sel)];
 const main=view?.querySelector('.panel[data-k="calc"]');
 const header=main?.querySelector('.ihead');
 if(!view||!main||!header||!item||main.querySelector('.vz-upgrade-matrix'))return;
 header.insertAdjacentHTML('afterend',makeMatrix(item));
 // I menu originali Da/Fino restano esclusivamente per calcolare i costi;
 // la tabella di sopra mostra SEMPRE tutti i livelli contemporaneamente.
 const selectors=main.querySelector('.ctl');
 if(selectors&&!selectors.querySelector('.vz-cost-range-label')){
  const title=document.createElement('span');
  title.className='vz-cost-range-label';
  title.textContent='Intervallo per il calcolo dei costi';
  selectors.prepend(title);
 }
 // Allarga il pannello soltanto se l'utente non ha impostato la larghezza.
 try{
  const prefs=typeof LAY!=='undefined'?LAY.crafting?.w:{};
  const side=view.querySelector('.cell[data-k="side"]');
  const calc=view.querySelector('.cell[data-k="calc"]');
  if(side&&calc){
   if(prefs?.side==null)side.dataset.w='3';
   if(prefs?.calc==null)calc.dataset.w='9';
   if(typeof applyLayout==='function')applyLayout('crafting');
  }
 }catch(_){}
}
document.addEventListener('click',e=>{
 const b=e.target.closest?.('#v-crafting [data-vz-matrix-move]');
 if(!b)return;
 e.preventDefault();
 const sc=b.closest('.vz-upgrade-matrix')?.querySelector('.vz-upgrade-matrix-scroll');
 if(sc)sc.scrollBy({left:Number(b.dataset.vzMatrixMove)*Math.max(300,sc.clientWidth*.8),behavior:'smooth'});
},true);
rCraft=function(...args){hide();const out=nativeRcraft.apply(this,args);enhance();return out};
enhance();
// I grossi dizionari della Wiki possono terminare dopo che l'iframe e' montato.
// Il caricamento è una tantum, senza polling né richieste aggiuntive per 147 oggetti.
if(!window.parent?.VERZUM_WIKI_API_TIPS?.[String(DATA.items[0]?.id)]){
 window.parent?.addEventListener('load',()=>{if(document.querySelector('#v-crafting .vz-upgrade-matrix'))rCraft()},{once:true});
}
window.VERZUM_UPGRADE_WIKI_STATS={
 exactTipId,
 get coveredItems(){return DATA.items.filter(item=>Array.from({length:item.max+1},(_,lv)=>exactTipId(item,lv)).every(Boolean)).length},
 get itemCount(){return DATA.items.length},
 get currentMatrixLevels(){return document.querySelectorAll('#v-crafting .vz-matrix-level').length},
 get currentMatrixRows(){return document.querySelectorAll('#v-crafting .vz-upgrade-matrix-table tbody tr').length}
};
})();