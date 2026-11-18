/* VERZUM — normalizzazione conservativa dei testi nel calcolatore originale.
   Le lingue sono gestite dalla pagina madre; la versione HU usa il modello IT.
   Non alterare calcoli, oggetti, placeholder editabili o tooltip ufficiali. */
(function(){
'use strict';
if(window.__verzumLocaleCleanup)return;
window.__verzumLocaleCleanup=true;
const languages=new Set(['it','en','ro','hu']);
let lang='it',scheduled=false,processing=false;
try{const choice=parent?.VERZUM_LOCALE?.lang;if(languages.has(choice))lang=choice}catch(_){}
const textCache=new WeakMap(),attrCache=new WeakMap();
const patterns=[
 [/^(\d+)\s+eșec(?:uri)?$/i,{'it':'$1 fallimenti','en':'$1 failures','ro':'$1 eșecuri','hu':'$1 sikertelen próba'}],
 [/^Materiale pentru (\d+) Gaya$/i,{'it':'Materiali per $1 Gaya','en':'Materials for $1 Gaya','ro':'Materiale pentru $1 Gaya','hu':'Anyagok $1 Gayához'}],
 [/^(\d+) din (\d+) selectate$/i,{'it':'$1 di $2 selezionati','en':'$1 of $2 selected','ro':'$1 din $2 selectate','hu':'$1 / $2 kiválasztva'}],
 [/^Nivel (\d+)$/i,{'it':'Livello $1','en':'Level $1','ro':'Nivel $1','hu':'$1. szint'}],
 [/^(\d+) materiale fără preț$/i,{'it':'$1 materiali senza prezzo','en':'$1 materials without price','ro':'$1 materiale fără preț','hu':'$1 árazatlan anyag'}],
 [/^(\d+) fără preț$/i,{'it':'$1 senza prezzo','en':'$1 without price','ro':'$1 fără preț','hu':'$1 ár nélkül'}],
 [/^Tip (\d+) → (\d+)$/i,{'it':'Tipo $1 → $2','en':'Type $1 → $2','ro':'Tip $1 → $2','hu':'Típus $1 → $2'}]
];
const reverse=()=>({en:parent.VERZUM_EN_TO_IT||{},ro:parent.VERZUM_RO_TO_IT||{},hu:parent.VERZUM_HU_TO_IT||{}});
const dictionary=()=>parent.VERZUM_TRANSLATIONS||{};
const official=()=>parent.VERZUM_RELEASE?.catalog||[];
function itemTranslation(source,destination){
 const names=parent.VERZUM_ITEM_L10N||{},catalog=official();
 if(!Array.isArray(catalog))return null;
 for(const item of catalog){
  const id=String(item.id||''),italian=item.name||'';
  const options=[italian,...['en','ro','hu'].map(code=>names[code]?.[id]).filter(Boolean)];
  if(!options.includes(source))continue;
  return destination==='it'?italian:(names[destination]?.[id]||italian);
 }
 return null;
}
function italian(source){
 const table=dictionary();
 if(table[source])return source; // Per es. "Materiale" in italiano NON diventa "Materiali".
 const dict=reverse();
 for(const code of ['ro','en','hu']){const value=dict[code][source];if(value&&table[value])return value}
 const native=window.VERZUM_NATIVE_IT_DICTIONARY||{};
 if(typeof native[source]==='string')return native[source];
 return itemTranslation(source,'it')||source;
}
function translate(source){
 const s=String(source||'').trim();if(!s)return s;
 const it=italian(s);
 // Omografi: «Materiale» è anche il plurale rumeno. Evita false correzioni
 // quando il testo è già esattamente nella lingua richiesta.
 if(lang!=='it'&&dictionary()[s]&&reverse()[lang]?.[s])return s;
 if(lang==='it')return it;
 const translated=dictionary()[it]?.[lang];
 if(translated)return translated;
 const name=itemTranslation(s,lang)||itemTranslation(it,lang);
 if(name)return name;
 for(const [regex,mapping] of patterns)if(regex.test(s))return s.replace(regex,mapping[lang]);
 return it; // Ultimo ripiego: italiano verificato, mai testo rumeno spurio per HU/EN.
}
function updateText(node){
 const container=node.parentElement;
 if(!container||container.closest('script,style,svg,code,textarea,.lang,[contenteditable],.vz-upgrade-wiki-tip,[data-no-translate]'))return;
 let source=textCache.get(node);
 if(!source||node.nodeValue!==source.output){source={original:node.nodeValue,output:node.nodeValue};textCache.set(node,source)}
 const key=source.original.trim();if(!key)return;
 const value=translate(key);
 const result=value===key?source.original:source.original.replace(key,value);
 if(node.nodeValue!==result)node.nodeValue=result;
 source.output=result;
}
function updateAttributes(root){
 for(const el of root.querySelectorAll('input[placeholder],textarea[placeholder],[title],[aria-label]')){
  if(el.closest('.lang,.vz-upgrade-wiki-tip,[data-no-translate]'))continue;
  let source=attrCache.get(el);
  if(!source){source={};for(const key of ['placeholder','title','aria-label'])source[key]=el.getAttribute(key);attrCache.set(el,source)}
  for(const [key,value] of Object.entries(source)){
   if(value===null)continue;
   const next=translate(value);
   if(el.getAttribute(key)!==next)el.setAttribute(key,next);
  }
 }
}
function run(){
 if(processing)return;processing=true;
 try{
  const page=location.hash.replace(/^#/,'');
  const roots=[document.querySelector('#v-'+page),document.querySelector('header'),document.querySelector('nav')].filter(Boolean);
  if(!roots.length)roots.push(document.body);
  for(const root of roots){
   const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
   let node;while((node=walker.nextNode()))updateText(node);
   updateAttributes(root);
  }
  document.documentElement.lang=lang;
 }finally{processing=false}
}
function schedule(){
 if(scheduled)return;scheduled=true;
 requestAnimationFrame(()=>{scheduled=false;run()});
}
function change(value){
 if(!languages.has(value))return;
 lang=value;
 schedule();
}
addEventListener('message',e=>{
 if(e.origin!==location.origin||e.source!==parent)return;
 if(e.data?.type==='verzum-parent-language')change(e.data.language);
});
const observer=new MutationObserver(schedule);
observer.observe(document.body,{subtree:true,childList:true,characterData:true});
addEventListener('hashchange',schedule);
change(lang);
window.VERZUM_NATIVE_LOCALE_CLEANUP={get lang(){return lang},refresh:schedule,translate};
})();