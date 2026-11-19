/* VERZUM — coloured flag selector. Preserves native select as the locale engine. */
(function(){
'use strict';
const container=document.querySelector('.sidebar-languages');
if(!container||!window.VERZUM_FLAG_SVGS)return;
const labelOf=code=>window.VERZUM_LOCALE?.available?.find(x=>x.id===code);
const svgOf=code=>window.VERZUM_FLAG_SVGS.url(code);
const clean=s=>String(s||'').replace(/^[\s\uD83C\uDDE6-\uD83C\uDDFF]+/u,'').replace(/\s*·\s*beta\s*$/i,'').trim();
let active=null;
function close(){
 if(!active)return;
 const picker=active;
 picker.querySelector('.vz-country-options').hidden=true;
 const trigger=picker.querySelector('.vz-country-trigger');
 trigger.setAttribute('aria-expanded','false');
 picker.classList.remove('is-open');
}
function open(picker){
 if(active&&active!==picker)close();
 active=picker;
 const list=picker.querySelector('.vz-country-options'),trigger=picker.querySelector('.vz-country-trigger');
 list.hidden=false;
 picker.classList.add('is-open');
 trigger.setAttribute('aria-expanded','true');
 const input=picker.querySelector('.vz-country-search');
 input.value='';
 filter(picker,'');
 input.focus();
}
function filter(picker,term){
 const needle=String(term||'').trim().toLocaleLowerCase();
 for(const el of picker.querySelectorAll('.vz-country-option')){
  el.hidden=!!needle&&!el.dataset.search.includes(needle);
 }
 for(const group of picker.querySelectorAll('.vz-country-group')){
  const visible=[...group.querySelectorAll('.vz-country-option')].some(el=>!el.hidden);
  group.hidden=!visible;
 }
}
function selectOption(picker,code){
 const select=picker.parentElement.querySelector('#vz-language-select');
 if(!select||![...select.options].some(x=>x.value===code))return;
 select.value=code;
 close();
 select.dispatchEvent(new Event('change',{bubbles:true}));
}
function makeOption(locale,code,selected){
 const btn=document.createElement('button');
 btn.type='button';btn.className='vz-country-option';btn.dataset.language=code;
 btn.dataset.search=(locale?.label||code).toLocaleLowerCase()+' '+code;
 btn.setAttribute('role','option');btn.setAttribute('aria-selected',String(selected));
 const img=document.createElement('img');
 img.className='vz-country-flag';img.src=svgOf(code);img.alt='';img.width=29;img.height=22;img.loading='lazy';img.decoding='async';
 const name=document.createElement('span');name.className='vz-country-name';name.textContent=locale?.label||code;
 btn.append(img,name);
 if(locale?.partial){
  const beta=document.createElement('small');beta.textContent='beta';beta.className='vz-country-beta';btn.append(beta);
 }
 return btn;
}
function render(){
 const select=container.querySelector('#vz-language-select');
 if(!select||container.querySelector('.vz-country-picker'))return;
 select.classList.add('vz-country-native-select');
 select.tabIndex=-1;select.setAttribute('aria-hidden','true');
 const picker=document.createElement('div');picker.className='vz-country-picker';
 const trigger=document.createElement('button');trigger.type='button';trigger.className='vz-country-trigger';
 trigger.setAttribute('aria-haspopup','listbox');trigger.setAttribute('aria-expanded','false');
 trigger.setAttribute('aria-label','Seleziona la lingua con le bandiere a colori');
 const chosen=labelOf(select.value);
 const icon=document.createElement('img');icon.className='vz-country-flag';icon.src=svgOf(select.value);icon.alt='';
 icon.width=29;icon.height=22;
 const label=document.createElement('span');label.className='vz-country-name';label.textContent=chosen?.label||select.value;
 const chevron=document.createElement('span');chevron.className='vz-country-chevron';chevron.setAttribute('aria-hidden','true');chevron.textContent='⌄';
 trigger.append(icon,label,chevron);
 const menu=document.createElement('div');menu.className='vz-country-options';menu.hidden=true;
 menu.setAttribute('role','listbox');menu.setAttribute('aria-label','Lingue disponibili');
 const search=document.createElement('input');search.type='search';search.className='vz-country-search';
 search.placeholder='Cerca lingua / Search language';search.setAttribute('aria-label','Cerca una lingua');
 menu.append(search);
 for(const group of select.querySelectorAll('optgroup')){
  const block=document.createElement('div');block.className='vz-country-group';
  const heading=document.createElement('div');heading.className='vz-country-group-name';heading.textContent=group.label;
  block.append(heading);
  for(const option of group.querySelectorAll('option'))block.append(makeOption(labelOf(option.value),option.value,option.selected));
  menu.append(block);
 }
 picker.append(trigger,menu);
 select.insertAdjacentElement('afterend',picker);
 trigger.addEventListener('click',()=>picker.classList.contains('is-open')?close():open(picker));
 search.addEventListener('input',()=>filter(picker,search.value));
 picker.addEventListener('click',e=>{
  const btn=e.target.closest('button[data-language]');
  if(btn)selectOption(picker,btn.dataset.language);
 });
 picker.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&picker.classList.contains('is-open')){e.preventDefault();close();trigger.focus();return}
  if(!picker.classList.contains('is-open')&&(e.key==='ArrowDown'||e.key==='Enter'&&e.target===trigger)){
   e.preventDefault();open(picker);return;
  }
  if(!picker.classList.contains('is-open'))return;
  if(!['ArrowDown','ArrowUp','Home','End'].includes(e.key))return;
  e.preventDefault();
  const visible=[...picker.querySelectorAll('.vz-country-option')].filter(el=>!el.hidden);
  if(!visible.length)return;
  const current=visible.indexOf(document.activeElement);
  const idx=e.key==='Home'?0:e.key==='End'?visible.length-1:
   e.key==='ArrowDown'?(current+1)%visible.length:(current<=0?visible.length-1:current-1);
  visible[idx].focus();
 });
 active=picker;
}
document.addEventListener('pointerdown',e=>{
 if(active?.classList.contains('is-open')&&!active.contains(e.target))close();
},true);
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'&&active?.classList.contains('is-open')){close();active.querySelector('.vz-country-trigger')?.focus()}
});
let queued=false;
const observer=new MutationObserver(()=>{
 if(queued)return;queued=true;
 queueMicrotask(()=>{queued=false;render()});
});
observer.observe(container,{childList:true});
render();
window.VERZUM_COUNTRY_PICKER={refresh:render};
})();