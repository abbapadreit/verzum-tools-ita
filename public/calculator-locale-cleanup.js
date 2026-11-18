/* Localizzazione dei calcolatori incorporati: recupera i testi IT e gestisce EN/RO/HU. */
(function(){
'use strict';
if(window.__verzumLocaleCleanup)return;window.__verzumLocaleCleanup=true;
const langs=['it','en','ro','hu'];
let selected='it';
try{selected=langs.includes(parent?.VERZUM_LOCALE?.lang)?parent.VERZUM_LOCALE.lang:'it'}catch(_){}
const original=new WeakMap();
const attrOriginal=new WeakMap();
let queued=false,busy=false;
const tokens={
 'Planificator':'Pianificatore','Planificatorul':'Il pianificatore','Selectează':'Seleziona','Alege':'Scegli',
 'Caută':'Cerca','Fără':'Senza','Fără preț':'Senza prezzo','Salvează':'Salva','Șterge':'Elimina',
 'Adaugă':'Aggiungi','Materiale':'Materiali','Material':'Materiale','Echipament':'Equipaggiamento',
 'Încercări':'Tentativi','Reușită':'Successo','Costuri':'Costi','Preț':'Prezzo','Pret':'Prezzo',
 'Nivel':'Livello','Niveluri':'Livelli','Caractere':'Personaggi','Toate':'Tutti','Bucăți':'Pezzi',
 'Calculator':'Calcolatore','Calculatoare':'Calcolatori','Cumpără':'Acquista','Vinde':'Vendi',
 'Necesare':'Necessari','Total':'Totale','Timp':'Tempo','Ore':'Ore','Zi':'Giorno','Zile':'Giorni'
};
const escRe=s=>s.replace(/[.*+?^\x24{}()|[\]\\]/g,'\\$&');
function baseItalian(s){
 const direct=window.VERZUM_NATIVE_IT_DICTIONARY||{};
 const ro=parent?.VERZUM_RO_TO_IT||{},en=parent?.VERZUM_EN_TO_IT||{},hu=parent?.VERZUM_HU_TO_IT||{};
 if(direct[s]||ro[s]||en[s]||hu[s])return direct[s]||ro[s]||en[s]||hu[s];
 let out=s;
 for(const [orig,translated] of Object.entries(tokens)){
  const re=new RegExp('(^|[\\s:,;(])'+escRe(orig)+'(?=$|[\\s:.,;!)])','giu');
  out=out.replace(re,(_full,prefix)=>prefix+translated);
 }
 return out;
}
function translated(s){
 const it=baseItalian(s);
 if(selected==='it')return it;
 const map=parent?.VERZUM_TRANSLATIONS||{};
 return map[it]?.[selected]||it;
}
function translateNode(node){
 if(!node?.parentElement||node.parentElement.closest('script,style,svg,code,textarea,.lang,.vzw-upgrade-compare'))return;
 let base=original.get(node);if(base===undefined){base=node.nodeValue;original.set(node,base)}
 const trim=base.trim();if(!trim)return;
 const next=translated(trim);const val=next===trim?base:base.replace(trim,next);
 if(node.nodeValue!==val)node.nodeValue=val;
}
function translateActive(){
 if(busy)return;busy=true;
 try{
  const route=location.hash.slice(1),containers=[document.querySelector('#v-'+route),document.querySelector('header'),document.querySelector('nav')].filter(Boolean);
  if(!containers.length)containers.push(document.body);
  containers.forEach(root=>{
   const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
   let node;while((node=walker.nextNode()))translateNode(node);
   root.querySelectorAll('input[placeholder],textarea[placeholder],button[title]').forEach(el=>{
    let base=attrOriginal.get(el);if(!base){base={placeholder:el.getAttribute('placeholder'),title:el.getAttribute('title')};attrOriginal.set(el,base)}
    for(const [key,value] of Object.entries(base)){if(value===null)continue;const t=translated(value);if(el.getAttribute(key)!==t)el.setAttribute(key,t)}
   });
  });
  document.documentElement.lang=selected;
 }finally{busy=false}
}
function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;translateActive()})}
function apply(lang){
 if(!langs.includes(lang))return;
 selected=lang;
 if(lang==='en')try{setLang('en')}catch(_){}
 if(lang==='hu')try{setLang('it')}catch(_){}
 schedule();
}
addEventListener('message',event=>{
 if(event.origin!==location.origin||event.source!==parent||event.data?.type!=='verzum-parent-language')return;
 // Il listener del calcolatore originale continua a gestire IT/RO.
 apply(event.data.language);
});
const observer=new MutationObserver(schedule);
observer.observe(document.body,{childList:true,subtree:true});
addEventListener('hashchange',schedule);
apply(selected);
window.VERZUM_NATIVE_LOCALE_CLEANUP={get lang(){return selected},refresh:schedule};
})();