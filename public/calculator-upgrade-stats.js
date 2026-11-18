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
 const base=byId[String(Number(id)-Math.max(0,Number(id)%10))];
 const src=typeof ICONS!=='undefined'&&(ICONS[id]||ICONS[String(Number(id)-Number(id)%10)])||'';
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
function enhance(){
 const view=document.querySelector('#v-crafting');
 if(!view)return;
 const table=view.querySelector('.panel[data-k="calc"] .tw table');
 const selected=byId[String(S.sel)];
 if(!table||!selected||table.dataset.vzWikiStats==='1')return;
 const ths=[...table.querySelectorAll('tr:first-child th')];
 const pos=ths.findIndex(th=>/Materiale|Materials/i.test(th.textContent));
 if(pos<0)return;
 table.dataset.vzWikiStats='1';
 table.classList.add('vz-upgrade-with-stats');
 const head=document.createElement('th');
 head.className='vz-stat-head';head.textContent='Valori oggetto';
 ths[pos].before(head);
 const rows=[...table.querySelectorAll('tr')].slice(1);
 rows.forEach((row,index)=>{
  const cells=[...row.children];
  if(row.classList.contains('tot')){
   const cell=row.querySelector('td[colspan]');
   if(cell)cell.colSpan=Number(cell.colSpan)+1;
   return;
  }
  if(cells.length<5||index>=selected.s.length+1)return;
  const level=Number(S.from)+index+1;
  const evo=selected.evo&&level>selected.max;
  let id=exactTipId(selected,level);
  if(evo)id=null;
  const td=document.createElement('td');td.className='vz-stat-cell';
  if(id){
   td.dataset.vzWikiTip=id;td.tabIndex=0;
   td.setAttribute('aria-label',(tipRecord(id)?.name||'')+': '+statLines(tipRecord(id)).map(l=>l.text).join('; '));
   td.innerHTML='<span class="vz-stat-level">+'+level+'</span>'+statHTML(id,true);
  }else{
   td.innerHTML='<span class="vz-stat-missing">Non disponibile nella Wiki</span>';
  }
  const originalMaterial=cells[pos];
  if(originalMaterial)originalMaterial.before(td);
 });
 const wrapper=table.closest('.tw');
 if(wrapper){
  const base=exactTipId(selected,S.from);
  if(base){
   const start=document.createElement('div');
   start.className='vz-stat-base';
   start.dataset.vzWikiTip=base;
   start.tabIndex=0;
   start.innerHTML='<strong>Valori di partenza · +'+S.from+'</strong><span>'+statHTML(base,true)+'</span>';
   wrapper.before(start);
  }
 }
 // La colonna aggiunta riceve piu' spazio, senza alterare larghezze
 // personalizzate già memorizzate dall'utente.
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
rCraft=function(...args){hide();const out=nativeRcraft.apply(this,args);enhance();return out};
enhance();
window.VERZUM_UPGRADE_WIKI_STATS={
 exactTipId,
 get coveredItems(){return DATA.items.filter(item=>Array.from({length:item.max+1},(_,lv)=>exactTipId(item,lv)).every(Boolean)).length},
 get itemCount(){return DATA.items.length}
};
})();