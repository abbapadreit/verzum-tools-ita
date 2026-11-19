/* Wiki-grounded Italian skill names, book labels, stat labels and calculator copy.
   This addon runs inside the same-origin reference calculator without changing formulas. */
(function(){
'use strict';
if(window.VERZUM_IT_WIKI_SKILL_FIX)return;
if(typeof SKD==='undefined'||typeof NL==='undefined'||typeof rSkills!=='function')return;
const TERMS=window.parent?.VERZUM_WIKI_IT_TERMS||window.VERZUM_WIKI_IT_TERMS;
if(!TERMS)return;
window.VERZUM_IT_WIKI_SKILL_FIX=true;
const fixLog={skills:0,books:0,stats:0,passives:0,items:0};
const originalHours=hrs;
hrs=function(total){
 if(LANG!=='it')return originalHours(total);
 const h=Math.max(0,Number(total)||0),days=Math.floor(h/24),rest=h%24;
 return [days?days+' '+(days===1?'giorno':'giorni'):'',rest?rest+' '+(rest===1?'ora':'ore'):''].filter(Boolean).join(' ')||'0 ore';
};
const itemNames=Object.assign({},NL.it?.i||{});
for(const [id,name] of Object.entries(TERMS.wikiItemNames)){
 if(!id||!name)continue;
 itemNames[id]=name;
 fixLog.items++;
}
for(const [cls,names] of Object.entries(TERMS.skills)){
 const skills=SKD.SK[cls];
 if(!skills||skills.length!==names.length){console.warn('[VERZUM i18n] Skill count mismatch',cls);continue}
 skills.forEach((skill,index)=>{
  const name=names[index];
  skill.n.it=name;
  itemNames['sb_'+cls+'_'+index]='Libro '+name;
  fixLog.skills++;fixLog.books++;
  if(Array.isArray(skill.t)){
   skill.l.it=skill.t.map(row=>{
    const ro=String(row[0]||'');
    const it=TERMS.statLabels[ro];
    if(it)fixLog.stats++;else console.warn('[VERZUM i18n] Stat label to verify:',ro);
    return it||ro;
   });
  }
 });
}
for(let i=0;i<(SKD.PAS||[]).length;i++){
 const p=SKD.PAS[i],label=TERMS.passives[i];
 if(!p||!label)continue;
 p.n.it=label;fixLog.passives++;
 for(const table of p.t||[]){
  table.l.it=table.r.map(row=>TERMS.statLabels[String(row[0]||'')]||String(row[0]||''));
 }
}
/* Il namespace m indica i MOSTRI, non i materiali. Diversi ID sono condivisi:
   100010 e un boss Gnoll ma anche una pagina dei libri nel catalogo oggetti. */
NL.it=Object.assign({},NL.it||{},{i:itemNames,m:Object.assign({},TERMS.wikiBossNames||{})});
const originals={
 "Libro di Abilità":"Libro abilità",
 "Pergamentul Exorcizării":"Papiro dell'esorcismo",
 "Pietre ale Sufletului":"Pietre delle Anime",
 "Citit Concentrat":"Lettura Concentrata",
 "Cărți de abilitate":"Libri abilità"
};
const oldTx=tx;
tx=function(value){
 if(LANG!=='it')return oldTx(value);
 const str=String(value),trim=str.trim();
 if(!trim)return str;
 const exact=TERMS.uiLabels[trim]||TERMS.statLabels[trim]||originals[trim];
 if(exact)return str.replace(trim,exact);
 const generalized=translatedFragment(str);
 if(generalized!==str)return generalized;
 let corrected=str;
 for(const [original,italian] of Object.entries(TERMS.uiLabels)){
  if(original.length>=23&&original!==italian&&corrected.includes(original))corrected=corrected.split(original).join(italian);
 }
 if(corrected!==str)return corrected;
 let next=oldTx(str);
 const sub=[
  [/^(\d+) citiri în total$/,'$1 letture totali'],
  [/^(\d+) fără preț$/,'$1 senza prezzo'],
  [/^(\d+) materiale fără preț$/,'$1 materiali senza prezzo'],
  [/^Grupa\s+(\d+)$/,'Gruppo $1'],
  [/^Timp de așteptare\s*\(fără Pergament\)\s*:/,'Tempo di attesa (senza Papiro dell’esorcismo):'],
  [/^Alege clasa și skill-ul[\s\S]*$/,"Seleziona la classe e l'abilità, scegli i livelli e calcola libri, pietre delle anime e tempi di attesa."],
  [/^Cărțile se fac în Magazinul de abilități[\s\S]*$/,'I libri si creano nel Negozio delle abilità usando i libri passivi di grado M/G/P e le pagine richieste.'],
  [/^Din wiki:\s*([\s\S]*)$/,'Dalla Wiki: $1']
 ];
 for(const [pattern,to] of sub)if(pattern.test(trim)){next=str.replace(trim,trim.replace(pattern,to));break}
 return next;
};
function refresh(){
 if(LANG!=='it')return;
 if(location.hash==='#skills')rSkills();
 else if(location.hash==='#passive'&&typeof rPas==='function')rPas();
 if(typeof trNode==='function')trNode(document.body);
}
function audit(){
 if(LANG!=='it')return;
 const current=document.querySelector('main .view.on');
 if(!current)return;
 const remaining=[];
 for(const el of current.querySelectorAll('.hero,.panel .ph,.panel .note,.panel .ctl,label,.panel th,.panel .sk .t,.panel .sk .s')){
  if(el.closest('#vz-passive-wiki-tree'))continue;
  const text=(el.textContent||'').trim();
  if(text&&/[\u0103\u00e2\u00ee\u0219\u021b\u015f\u0163]|(?:\b(?:Alege|Cărți|Citiri|Maestru|Războinic|eșecuri|pentru|fără|preț|sunt|timpul|necesare|șanse|așteptare|îți)\b)/i.test(text))remaining.push(text.slice(0,180));
 }
 return [...new Set(remaining)].slice(0,120);
}
/* Rifinitura globale dei testi dei calcolatori: potenziamenti, Gaya, pet,
   cavalcature, costumi, abilità, passive e listino prezzi.
   Non cambia dati, formule, costi o logica dei pulsanti. */
function foldRomanian(text){
 return String(text||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  .replace(/[șş]/g,'s').replace(/[țţ]/g,'t')
  .replace(/\s+/g,' ').trim().toLocaleLowerCase('it');
}
const DOM_IT=new Map();
for(const source of [TERMS.uiLabels||{},TERMS.statLabels||{},originals]){
 for(const [sourceLabel,translated] of Object.entries(source)){
  if(sourceLabel&&translated)DOM_IT.set(foldRomanian(sourceLabel),translated);
 }
}
/* Accetta anche valori dei bonus (+2%, +5%, ecc.) e grafie RO con
   cediglia o virgola diversa, che i confronti letterali non rilevavano. */
function translatedFragment(source){
 const text=String(source||''),trim=text.trim();
 if(!trim)return text;
 const exact=DOM_IT.get(foldRomanian(trim));
 if(exact)return text.replace(trim,exact);
 const bonus=trim.match(/^(.+?)(\s+[+\-]?\d+(?:[.,]\d+)?\s*%.*)$/s);
 if(bonus){
  const name=DOM_IT.get(foldRomanian(bonus[1]));
  if(name)return text.replace(trim,name+bonus[2]);
 }
 /* Le intestazioni spesso aggiungono un conteggio o un separatore. */
 const withCount=trim.match(/^(.+?)(\s*[·:]\s*\d+(?:\s*\/\s*\d+)?\s*)$/);
 if(withCount){
  const name=DOM_IT.get(foldRomanian(withCount[1]));
  if(name)return text.replace(trim,name+withCount[2]);
 }
 return text;
}
const romanianTrace=/[ăâîșşțţ]|\b(?:impotriva|împotriva|sans[aă]|șans[aă]|sansa|sansă|pret|preț|alege|fara|fără|materiale necesare|cumpara|cumpără|omoar[aă])\b/i;
let pending=false;
function fixRenderedLabels(){
 if(LANG!=='it')return;
 const root=document.querySelector('main .view.on')||document.querySelector('.view.on');
 if(!root||typeof document.createTreeWalker!=='function')return;
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
 let node,corrected=0;
 while((node=walker.nextNode())){
  const parent=node.parentElement;
  if(!parent||parent.closest('script,style,textarea,code,pre,select,option'))continue;
  const previous=node.nodeValue,revised=translatedFragment(previous);
  if(previous!==revised){node.nodeValue=revised;corrected++}
 }
 for(const el of root.querySelectorAll('[title],[placeholder],[aria-label]')){
  for(const attr of ['title','placeholder','aria-label']){
   const previous=el.getAttribute(attr);
   if(!previous)continue;
   const revised=translatedFragment(previous);
   if(revised!==previous)el.setAttribute(attr,revised);
  }
 }
 return corrected;
}
function scheduleLabelRepair(){
 if(pending||LANG!=='it')return;
 pending=true;
 requestAnimationFrame(()=>{pending=false;fixRenderedLabels()});
}
const domObserver=new MutationObserver(scheduleLabelRepair);
domObserver.observe(document.body,{childList:true,characterData:true,subtree:true});
function auditAll(){
 const root=document.querySelector('main .view.on')||document.querySelector('.view.on');
 if(!root||LANG!=='it')return [];
 const suspicious=[];
 for(const el of root.querySelectorAll('label,.hero,.panel,.card,.sk,.title,.note,th,td')){
  if(el.children.length>4)continue;
  const str=(el.textContent||'').trim();
  if(str&&str.length<240&&romanianTrace.test(str)&&translatedFragment(str)===str)suspicious.push(str);
 }
 return [...new Set(suspicious)].slice(0,150);
}

refresh();
scheduleLabelRepair();
window.VERZUM_IT_WIKI_SKILL_FIX={summary:fixLog,remaining:audit,auditAll,refresh,repair:fixRenderedLabels};
window.addEventListener('message',e=>{
 if(e.origin!==location.origin||e.source!==parent||e.data?.type!=='verzum-parent-language')return;
 setTimeout(()=>{refresh();scheduleLabelRepair()},30);
});
})();
