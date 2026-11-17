/* VERZUM 1–75: interazioni sui dati originali della guida.
 * Quattro classi, due pannelli per classe; tooltip da data-tip-full.
 */
(function(){
'use strict';
const host=document.getElementById('panels');
if(!host)return;
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const color=x=>/^[a-f0-9]{6}$/i.test(String(x||''))?'#'+x:'#c2c2c2';
let tip=null,activeAnchor=null,pinned=false;
const tooltipData=new Map(),ambiguous=new Set();
function selectClass(tab){
 const group=tab?.closest?.('[data-wk-class-tabs]');
 if(!group||!tab.matches('[role="tab"][data-tab]'))return false;
 const buttons=[...group.querySelectorAll(':scope > .wk-tabs__bar [role="tab"][data-tab]')];
 const panels=[...group.querySelectorAll(':scope > .wk-tabpanel[role="tabpanel"][data-panel]')];
 if(!buttons.includes(tab)||buttons.length!==4||panels.length!==4)return false;
 buttons.forEach(b=>{
  const chosen=b===tab;
  b.classList.toggle('is-on',chosen);
  b.setAttribute('aria-selected',String(chosen));
  b.tabIndex=chosen?0:-1;
 });
 panels.forEach(p=>{
  const chosen=p.dataset.panel===tab.dataset.tab;
  p.classList.toggle('is-on',chosen);
  p.hidden=!chosen;
  p.setAttribute('aria-hidden',String(!chosen));
 });
 hideTip();return true;
}
host.addEventListener('click',e=>{
 const tab=e.target.closest('.vz-wiki .wk-vz--gear [role="tab"][data-tab]');
 if(tab){e.preventDefault();selectClass(tab);}
});
host.addEventListener('keydown',e=>{
 const tab=e.target.closest?.('.vz-wiki .wk-vz--gear [role="tab"][data-tab]');
 if(!tab||!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
 const group=tab.closest('[data-wk-class-tabs]');
 const buttons=[...group.querySelectorAll(':scope > .wk-tabs__bar [role="tab"][data-tab]')];
 const idx=buttons.indexOf(tab);
 if(idx<0)return;
 const to=e.key==='Home'?0:e.key==='End'?buttons.length-1:(idx+(e.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;
 e.preventDefault();selectClass(buttons[to]);buttons[to].focus();
});
function seed(){
 for(const a of host.querySelectorAll('.vz-wiki [data-tip][data-tip-full]')){
  const id=a.getAttribute('data-tip'),raw=a.getAttribute('data-tip-full');
  if(!id||!raw||ambiguous.has(id))continue;
  if(!tooltipData.has(id))tooltipData.set(id,raw);
  else if(tooltipData.get(id)!==raw){tooltipData.delete(id);ambiguous.add(id);}
 }
}
function getOriginalBonusLines(a){
 let raw=a?.getAttribute?.('data-tip-full')||'';
 if(!raw)raw=tooltipData.get(a?.getAttribute?.('data-tip'))||'';
 if(!raw)return null;
 try{
  const list=JSON.parse(raw);
  return Array.isArray(list)&&list.every(x=>x&&typeof x.text==='string')?list:null;
 }catch(e){return null}
}
function getIcon(a){
 const src=a.querySelector('img')?.getAttribute('src')||'';
 if(!/^(wiki-original\/|https:\/\/images\.verzum\.to\/item\/\d+\.png$|data:image\/png;base64,)/.test(src))return '';
 return '<div class="wk-tip__icon"><img src="'+esc(src)+'" alt=""></div>';
}
function buildTip(a){
 const lines=getOriginalBonusLines(a);
 let out=getIcon(a);
 if(lines?.length){
  for(const line of lines){
   const kind=String(line.kind||'').replace(/[^a-z_-]/gi,'');
   const gap=Number.isFinite(Number(line.gap))?Math.max(0,Math.min(32,Number(line.gap))):0;
   const body=Array.isArray(line.runs)?line.runs.map(run=>'<span style="color:'+color(run.color)+'">'+esc(run.text||'')+'</span>').join(''):esc(line.text);
   const attrs='style="color:'+color(line.color)+';'+(gap?'margin-top:'+gap+'px;':'')+'"';
   out+=kind==='title'?'<div class="wk-tip__name" '+attrs+'>'+body+'</div>':'<div class="wk-tip__line wk-tip__line--'+kind+'" '+attrs+'>'+body+'</div>';
  }
 }else{
  // Non inventare attributi quando il sorgente non fornisce i bonus completi.
  const name=a.querySelector('img')?.getAttribute('alt')?.trim()||a.textContent.trim()||
   window.VERZUM_WIKI_SEARCH?.items?.get(a.getAttribute('data-tip'))?.title||'';
  if(!name)return '';
  out+='<div class="wk-tip__name">'+esc(name)+'</div>';
 }
 return out;
}
function ensureTip(){
 if(tip)return tip;
 tip=document.createElement('div');tip.className='vz-wiki-original-tip';
 tip.id='vz-wiki-original-tooltip';tip.setAttribute('role','tooltip');tip.hidden=true;
 document.body.appendChild(tip);return tip;
}
function relocate(e){
 if(!tip||tip.hidden||!activeAnchor)return;
 const r=activeAnchor.getBoundingClientRect();
 const x=e?.clientX??(r.left+r.width/2),y=e?.clientY??r.bottom;
 const w=tip.offsetWidth,h=tip.offsetHeight,pad=10,offset=18;
 let left=x+offset,top=y+offset;
 if(left+w>window.innerWidth-pad)left=x-w-offset;
 if(top+h>window.innerHeight-pad)top=y-h-offset;
 tip.style.left=Math.max(pad,Math.min(left,window.innerWidth-w-pad))+'px';
 tip.style.top=Math.max(pad,Math.min(top,window.innerHeight-h-pad))+'px';
}
function showTip(a,e){
 if(!a||!a.closest('.vz-wiki .wk-page'))return;
 seed();
 const html=buildTip(a);if(!html){hideTip();return}
 const node=ensureTip();
 if(activeAnchor!==a)activeAnchor?.removeAttribute('aria-describedby');
 activeAnchor=a;node.innerHTML=html;node.hidden=false;
 a.setAttribute('aria-describedby',node.id);relocate(e);
}
function hideTip(){
 if(tip)tip.hidden=true;
 activeAnchor?.removeAttribute('aria-describedby');
 activeAnchor=null;pinned=false;
}
const find=e=>e.target?.closest?.('.vz-wiki .wk-page [data-tip]')||null;
host.addEventListener('pointerover',e=>{
 if(e.pointerType==='touch'||pinned)return;
 const a=find(e);
 if(a&&a!==activeAnchor)showTip(a,e);
});
host.addEventListener('pointermove',e=>{if(activeAnchor&&!pinned&&find(e)===activeAnchor)relocate(e)});
host.addEventListener('pointerout',e=>{
 if(pinned)return;
 const a=find(e);if(a===activeAnchor&&!a.contains(e.relatedTarget))hideTip();
});
host.addEventListener('focusin',e=>{const a=find(e);if(a)showTip(a)});
host.addEventListener('focusout',e=>{
 const a=find(e);if(a===activeAnchor&&!a.contains(e.relatedTarget))hideTip();
});
host.addEventListener('click',e=>{
 const a=find(e);
 if(!a||e.detail===0||!window.matchMedia?.('(hover: none)').matches)return;
 if(pinned&&activeAnchor===a){hideTip();return}
 e.preventDefault();e.stopPropagation();showTip(a);pinned=true;
},true);
document.addEventListener('pointerdown',e=>{
 if(pinned&&!e.target.closest?.('.vz-wiki [data-tip]'))hideTip();
},true);
window.addEventListener('scroll',hideTip,true);
window.addEventListener('hashchange',hideTip);
window.addEventListener('resize',hideTip);
document.addEventListener('keydown',e=>{if(e.key==='Escape')hideTip()});
window.VERZUM_WIKI_GUIDE_INTERACTIONS={selectClass,getOriginalBonusLines,get tooltipShown(){return !!tip&&!tip.hidden}};
})();