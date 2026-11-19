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
NL.it=Object.assign({},NL.it||{},{i:itemNames,m:Object.assign({},NL.it?.m||{},TERMS.wikiItemNames)});
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
refresh();
window.VERZUM_IT_WIKI_SKILL_FIX={summary:fixLog,remaining:audit,refresh};
window.addEventListener('message',e=>{
 if(e.origin!==location.origin||e.source!==parent||e.data?.type!=='verzum-parent-language')return;
 setTimeout(refresh,30);
});
})();
