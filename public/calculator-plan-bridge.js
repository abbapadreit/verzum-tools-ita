/* VERZUM 2.0 — send the ORIGINAL calculator's exact NPC Yang and material quantities to the shared Planner.
   No estimates are fabricated: reads the native CUR snapshot used by Dumanu/VERZUM's own addPlan(). */
(function(){
'use strict';
if(window.__verzumPlanBridge)return;window.__verzumPlanBridge=true;
const labels={crafting:'Potenziamenti',gaya:'Gaya',pet:'Pet',mount:'Cavalcature',costume:'Costumi pet',skills:'Abilità',passive:'Abilità passive'};
const release=parent.VERZUM_RELEASE||{},idToName=Object.create(null);
for(const [name,id] of Object.entries(release.materialIds||{}))idToName[String(id)]=name;
function italianName(id){
 const key=String(id);
 return parent.VERZUM_MATERIAL_L10N?.it?.[key]||
  parent.VERZUM_ITEM_L10N?.it?.[key]||
  release.reference?.names?.[key]||
  idToName[key]||
  (typeof N==='function'?N(key):key);
}
function convert(calc,route){
 if(!calc||typeof calc!=='object'||typeof calc.t!=='string')return null;
 const materials={},ids={};
 for(const [id,qty] of Object.entries(calc.m||{})){
  const n=Number(qty);
  if(!Number.isFinite(n)||n<=0||n>1000000000)continue;
  const name=String(italianName(id)).slice(0,100);
  if(!name)continue;
  materials[name]=(materials[name]||0)+n;
  ids[id]=n;
 }
 const title=[calc.t,calc.s].filter(Boolean).join(' · ').slice(0,160);
 const yang=Number(calc.y);
 return {name:title,source:'Calcolatore '+(labels[route]||route),materials,materialIds:ids,
  yang:Number.isFinite(yang)?Math.max(0,yang):0,
  notes:'Valori Yang e quantità materiali calcolati dal calcolatore originale; prezzi materiali da impostare nel listino.'};
}
function current(){
 const route=location.hash.replace(/^#/,'');
 if(!labels[route])return null;
 let snapshot=null;
 try{
  if(typeof CUR!=='undefined'&&CUR){const chosen=window.__vzwSourceKey; // populated on button click
   snapshot=chosen?(CUR[chosen]||(CUR.t?CUR:null)):(CUR.t?CUR:null);}
 }catch(_){}
 return snapshot?convert(snapshot,route):null;
}
document.addEventListener('click',event=>{
 const button=event.target.closest('[data-add]');
 if(!button)return;
 const route=location.hash.replace(/^#/,'');
 if(!labels[route])return;
 const key=button.dataset.add;
 window.__vzwSourceKey=key;
 const snapshot=current();
 delete window.__vzwSourceKey;
 // Only intercept verified native calculator projects. No phantom zero-cost entries.
 if(!snapshot)return;
 event.preventDefault();event.stopImmediatePropagation();event.stopPropagation();
 parent.postMessage({type:'verzum-reference-add-plan',plan:snapshot},location.origin);
},true);
/* Preserve existing plans created before the unified Planner was introduced. */
try{
 const marker='verzum_native_planner_migrated_v2';
 if(localStorage.getItem(marker)!=='1'){
  const old=JSON.parse(localStorage.getItem('dt_plan')||'[]');
  if(Array.isArray(old)&&old.length){
   const converted=old.slice(0,200).map(c=>convert(c,'planner')).filter(Boolean);
   if(converted.length)parent.postMessage({type:'verzum-reference-import-legacy-plan',plans:converted},location.origin);
  }
 }
}catch(_){}
window.VERZUM_NATIVE_PLAN_BRIDGE={convert,current};
})();