/* Unifica il Planner embedded con quello principale. Conserva valori non verificati vuoti. */
(function(){
'use strict';
if(window.__verzumPlanBridge)return;window.__verzumPlanBridge=true;
const labels={crafting:'Potenziamenti',gaya:'Gaya',pet:'Pet',mount:'Cavalcature',costume:'Costumi pet',skills:'Abilità',passive:'Abilità passive'};
document.addEventListener('click',e=>{
 const button=e.target.closest('button,a,[role="button"]');
 if(!button)return;
 const text=String(button.textContent||'').trim().replace(/\s+/g,' ');
 if(!/^(?:\+\s*(?:Pianificatore|Planificator|Planner)|Add to planner|Adaugă în planificator)\b/i.test(text))return;
 const route=location.hash.replace(/^#/,'');
 if(!labels[route])return;
 // Il Planner dell'iframe non condivideva lo stato con la pagina principale.
 e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
 let itemName='';
 try{
  if(route==='crafting'&&typeof S!=='undefined'&&typeof DATA!=='undefined'){
   const item=DATA.items.find(x=>String(x.id)===String(S.sel));
   itemName=item?.n||'';
  }
 }catch(_){}
 const source=labels[route];
 const title=itemName?source+' · '+itemName:source+' · Configurazione';
 parent.postMessage({type:'verzum-reference-add-plan',plan:{
  name:title,source:'Calcolatore '+source,materials:{},yang:0,
  notes:'Configurazione importata dal calcolatore. Inserire nel Planner i materiali e i costi solo quando verificati.'
 }},location.origin);
},true);
})();