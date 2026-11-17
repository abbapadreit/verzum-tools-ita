/* VERZUM Tools: schermate dei calcolatori ad alta fedeltà.
   Dati di gioco esclusivamente da VERZUM_RELEASE e VERZUM_SKILL_REFERENCE.
   Progettazione dell'interfaccia indipendente, senza introdurre item o bonus fittizi. */
(function(){
'use strict';
if(typeof sections==='undefined'||typeof state==='undefined')return;
const source=state.reference?.sys;
if(!source?.pet||!source?.mount)return;
const skillsData=window.VERZUM_SKILL_REFERENCE||{SK:{},PAS:[]};
const PARITY_KEY='verzum_tools_calculator_parity_v1';
const defaults={pet:{from:1,to:105,typeFrom:1,typeTo:6,fails:{},skill:0,skillFrom:0,skillTo:10},
 mount:{from:1,to:30,skill:0,skillFrom:0,skillTo:10},skills:{class:'warrior',group:0,skill:0,from:0,to:20,fails:{},stones:{},concentrated:false,exorcism:false,zen:0},
 passive:{skill:0,from:0,to:40,failN:0,failM:0,mode:'buy',concentrated:false,exorcism:false},costumes:[]};
let remembered={};
try{remembered=JSON.parse(localStorage.getItem(PARITY_KEY)||'{}')||{}}catch(e){}
const P={};for(const key of Object.keys(defaults))P[key]=Array.isArray(defaults[key])?(Array.isArray(remembered[key])?remembered[key]:[...new Set((state.selectedCostumes||[]).map(x=>Number(String(x).replace(/^skin-/,''))).filter(Number.isInteger))]):{...defaults[key],...(remembered[key]||{})};
const saveP=()=>{try{localStorage.setItem(PARITY_KEY,JSON.stringify(P))}catch(e){}};
const h=x=>esc(x);
const names=state.reference.names||{};
const nameById={};
for(const [name,id] of Object.entries(state.materialIds||{}))if(!nameById[String(id)]||name in state.prices)nameById[String(id)]=name;
const matName=id=>nameById[String(id)]||names[String(id)]||String(id);
const priceName=id=>{const nm=matName(id),n=names[String(id)];return nm in state.prices?nm:n in state.prices?n:nm};
const priceOf=id=>Math.max(0,num(state.prices[priceName(id)]||0));
const added=(out,id,qty)=>{id=String(id);if(!qty)return;out[id]=(out[id]||0)+Number(qty)};
const merge=(out,pairs,mult=1)=>{for(const [id,q] of pairs||[])added(out,id,Number(q)*mult);return out};
const totalMat=m=>Object.entries(m||{}).reduce((s,[id,q])=>s+priceOf(id)*q,0);
const nfmt=x=>count(x);
const cp=x=>cash(x);
const icon=id=>{
 const val=itemIcons[String(id)];
 if(typeof val==='string'&&validIcon(val))return '<img class="oc-img" src="'+val+'" alt="" loading="lazy" decoding="async">';
 if(window.VERZUM_WIKI_API_TIPS?.[String(id)])return '<img class="oc-img" src="wiki-original/items/'+encodeURIComponent(String(id))+'.png" alt="" loading="lazy">';
 return '<span class="oc-icon-missing" aria-hidden="true"></span>';
};
const badge=(id,qty)=>'<span class="oc-mat-chip" title="'+h(matName(id))+'">'+icon(id)+(qty!=null?'<b>'+h(nfmt(qty))+'</b>':'')+'</span>';
const matsIcons=pairs=>(pairs||[]).map(x=>badge(x[0],x[1])).join('');
const mkOpts=(a,b,value,label)=>Array.from({length:b-a+1},(_,i)=>{
 const v=a+i;return '<option value="'+v+'"'+(Number(value)===v?' selected':'')+'>'+(label||'')+v+'</option>';
}).join('');
const range=(which,a,b,max,captionA,captionB)=>'<div class="oc-controlrow"><label>'+h(captionA)+'<select data-oc-field="'+which+'.from">'+mkOpts(1,max-1,a)+'</select></label><label>'+h(captionB)+'<select data-oc-field="'+which+'.to">'+mkOpts(Math.max(2,Number(a)+1),max,b)+'</select></label></div>';
const stats=(columns)=>'<div class="oc-stats">'+columns.map(([name,val,note,tone])=>'<div class="oc-stat"><small>'+h(name)+'</small><strong class="'+(tone||'')+'">'+h(val)+'</strong>'+(note?'<em>'+h(note)+'</em>':'')+'</div>').join('')+'</div>';
const note=s=>'<p class="oc-note">'+h(s)+'</p>';
const addButton=kind=>'<button type="button" class="btn oc-add" data-oc-add="'+kind+'">+ PIANIFICATORE</button>';
const originalTitle=s=>'<div class="oc-inner-heading">'+h(s)+'</div>';
function materialTable(m,title){
 const entries=Object.entries(m||{}).sort((a,b)=>matName(a[0]).localeCompare(matName(b[0]),'it'));
 const rows=entries.map(([id,q])=>{
  const price=priceOf(id),cost=price*q,pn=priceName(id);
  return '<tr><td><div class="oc-material">'+badge(id)+'<span>'+h(matName(id))+'</span></div></td><td class="oc-num">'+h(nfmt(q))+'</td><td><input type="text" class="oc-price" data-oc-price="'+h(pn)+'" value="'+(price>0?h(cp(price)):'')+'" placeholder="prezzo" aria-label="Prezzo per '+h(matName(id))+'"></td><td class="oc-value '+(!price?'oc-missing':'')+'">'+(price?h(cp(cost)):'senza prezzo')+'</td></tr>';
 }).join('');
 return '<div class="oc-materials">'+originalTitle(title)+'<div class="oc-scroll"><table><thead><tr><th>MATERIALE</th><th>QTÀ</th><th>PREZZO/PZ</th><th>TOTALE</th></tr></thead><tbody>'+rows+'<tr class="oc-total"><td colspan="3">Totale materiali</td><td>'+h(cp(totalMat(m)))+'</td></tr></tbody></table></div></div>';
}
const cPanel=(key,title,body,w)=>panel('oc-'+key,title,body,w,'VERZUM');
const titleRow=(s,btn)=>'<div class="oc-titleline">'+originalTitle(s)+(btn||'')+'</div>';
function petData(){
 const sys=source.pet,p=P.pet;
 const from=Math.max(1,Math.min(104,+p.from||1)),to=Math.max(from+1,Math.min(105,+p.to||105));
 const lm={};let yang=0,metins=0;
 const expPct=lv=>{for(const [range,raw] of sys.exp){const ab=String(range).split(/\s*[–-]\s*/).map(Number);if(lv>=ab[0]&&lv<=(ab[1]||ab[0]))return Math.max(.1,parseFloat(String(raw).replace(',','.')))}return 100};
 const levelEvos=[];
 for(let lv=from;lv<to;lv++){
  metins+=100/expPct(lv);
  for(const [a,b,id,q] of sys.snack||[])if(lv>=a&&lv<=b){added(lm,id,q);break}
  for(const e of sys.evo||[])if(e.lv===lv){yang+=e.y;merge(lm,e.m);levelEvos.push(e)}
 }
 const typeM={};let best=0,chosen=0,worst=0;
 const ta=Math.max(1,Math.min(5,+p.typeFrom||1)),tb=Math.max(ta+1,Math.min(6,+p.typeTo||6));
 const typeRows=[];
 for(let i=ta-1;i<tb-1;i++){
  const t=sys.types[i],f=Math.max(0,Math.min(+p.fails[i]||0,t.p));
  added(typeM,t.g,1+f);best++;chosen+=1+f;worst+=1+t.p;
  typeRows.push({i,t,f});
 }
 return {from,to,lm,yang,metins:Math.ceil(metins),levelEvos,typeM,best,chosen,worst,typeRows,ta,tb};
}
function petSkillData(){
 const a=P.pet,sys=source.pet,skill=sys.skills[Math.max(0,Math.min(sys.skills.length-1,Number(a.skill)||0))];
 const from=Math.max(0,Math.min(9,Number(a.skillFrom)||0)),to=Math.max(from+1,Math.min(10,Number(a.skillTo)||10));
 const m={};let yang=0;for(let i=from;i<to;i++){merge(m,skill.c[i]);yang+=skill.y[i]}
 return {skill,from,to,m,yang};
}
function petMain(){
 const d=petData(),sys=source.pet;
 const rangeUI=range('pet',d.from,d.to,105,'DAL LIVELLO','A')+addButton('pet-lv');
 const evoRows=sys.evo.map(e=>'<tr class="'+(d.levelEvos.includes(e)?'':'oc-faint')+'"><td class="oc-gold">Al livello '+e.lv+'</td><td><div class="oc-mats">'+matsIcons(e.m)+'</div></td><td class="oc-num">'+h(cp(e.y))+'</td></tr>').join('');
 const lvl=titleRow('Livello ed evoluzione')+'<div class="oc-flexline">'+rangeUI+'</div>'+stats([['YANG',cp(d.yang)],['VALORE MATERIALI',cp(totalMat(d.lm))],['COSTO TOTALE',cp(d.yang+totalMat(d.lm)),'','oc-green'],['METIN (CIRCA)',nfmt(d.metins)]])+
 '<div class="oc-scroll"><table><thead><tr><th>EVOLUZIONE</th><th>MATERIALI</th><th>YANG</th></tr></thead><tbody>'+evoRows+'</tbody></table></div>'+note('I biscotti iniziano al livello 41. Le quantità seguono le fasce riportate nella Wiki ufficiale.');
 const tp=P.pet;
 const typeControls='<div class="oc-flexline">'+range('petType',d.ta,d.tb,6,'DAL TIPO','A')+addButton('pet-type')+'</div>';
 const trs=d.typeRows.map(({i,t,f})=>{
  const buttons=Array.from({length:t.p+1},(_,v)=>'<button class="oc-chip '+(v===f?'on':'')+'" data-oc-fail="'+i+'" data-oc-val="'+v+'">'+v+'</button>').join('');
  return '<tr><td class="oc-gold">Tipo '+h(t.s)+'</td><td>'+badge(t.g,1)+'</td><td class="oc-num">'+(t.p?'dopo '+t.p+' fallimenti':'—')+'</td><td><div class="oc-chips">'+(t.p?buttons:'<span class="oc-green">garantito</span>')+'</div></td><td class="oc-num oc-gold">'+(1+f)+'</td></tr>';
 }).join('');
 const type=titleRow('Tipo del pet con garanzia')+typeControls+
 stats([['SFERE (A TUA SCELTA)',nfmt(d.chosen),'con i fallimenti selezionati'],['CASO MIGLIORE',nfmt(d.best),'nessun fallimento'],['CASO PEGGIORE',nfmt(d.worst),'successo garantito']])+
 '<div class="oc-scroll"><table><thead><tr><th>PASSAGGIO</th><th>SFERA</th><th>PITY</th><th>FALLIMENTI</th><th>SFERE</th></tr></thead><tbody>'+trs+'</tbody></table></div>'+note('Ogni tentativo consuma una sfera. I fallimenti si sommano fino al tentativo con successo garantito.');
 return [cPanel('pet-lvl','Livello ed evoluzione',lvl,7),cPanel('pet-materials','Materiali per livello',materialTable(d.lm,'Materiali per livello'),5),
 cPanel('pet-type','Tipo del pet · garanzia',type,7),cPanel('pet-spheres','Sfere necessarie',materialTable(d.typeM,'Sfere necessarie'),5)];
}
function skillCards(kind){
 const isPet=kind==='pet',d=isPet?petSkillData():mountSkillData();
 const set=P[kind],sys=source[kind],list=sys.skills;
 const picker='<div class="oc-skill-picker">'+list.map((s,i)=>'<button class="oc-skill '+(Number(set.skill)===i?'on':'')+'" data-oc-skill="'+kind+':'+i+'"><strong>'+h(s.n)+'</strong><small>Dal livello '+s.un+' · massimo '+h(s.v[9])+'</small></button>').join('')+'</div>';
 const selector='<div class="oc-controlrow"><label>DAL LIVELLO<select data-oc-field="'+kind+'Skill.from">'+mkOpts(0,9,d.from,'Lv. ')+'</select></label><label>A<select data-oc-field="'+kind+'Skill.to">'+mkOpts(d.from+1,10,d.to,'Lv. ')+'</select></label>'+addButton(kind+'-skill')+'</div>';
 const rows=d.skill.v.map((v,i)=>'<tr class="'+(i>=d.from&&i<d.to?'':'oc-faint')+'"><td class="oc-gold">'+(i?'Livello '+(i+1):'Sblocco')+'</td><td class="oc-num oc-green">'+h(v)+'</td><td><div class="oc-mats">'+matsIcons(d.skill.c[i])+'</div></td><td class="oc-num">'+h(cp(d.skill.y[i]))+'</td></tr>').join('');
 const body=titleRow('Abilità '+(isPet?'del pet':'della cavalcatura'))+
 '<div class="oc-skill-layout">'+picker+'<div>'+selector+stats([['YANG',cp(d.yang)],['VALORE MATERIALI',cp(totalMat(d.m))],['COSTO TOTALE',cp(d.yang+totalMat(d.m)),'','oc-green']])+
 '<div class="oc-scroll"><table><thead><tr><th>LIVELLO</th><th>BONUS</th><th>MATERIALI</th><th>YANG</th></tr></thead><tbody>'+rows+'</tbody></table></div></div></div>';
 return [cPanel(kind+'-skills',isPet?'Abilità del pet':'Abilità cavalcatura',body,7),cPanel(kind+'-skills-materials','Materiali abilità',materialTable(d.m,'Materiali abilità'),5)];
}
function mountData(){
 const p=P.mount,sys=source.mount;
 const from=Math.max(1,Math.min(29,+p.from||1)),to=Math.max(from+1,Math.min(30,+p.to||30));
 const m={};let yang=0;const ev=[];
 for(let level=from;level<to;level++){
  for(const [lo,hi,id,q] of sys.med||[])if(level>=lo&&level<=hi){added(m,id,q);break}
  for(const e of sys.evo||[])if(e.lv===level){merge(m,e.m);yang+=e.y;ev.push(e)}
 }
 return {from,to,m,yang,ev};
}
function mountSkillData(){
 const p=P.mount,sys=source.mount,skill=sys.skills[Math.max(0,Math.min(sys.skills.length-1,Number(p.skill)||0))];
 const from=Math.max(0,Math.min(9,Number(p.skillFrom)||0)),to=Math.max(from+1,Math.min(10,Number(p.skillTo)||10));
 const m={};let yang=0;for(let i=from;i<to;i++){merge(m,skill.c[i]);yang+=skill.y[i]}
 return {skill,from,to,m,yang};
}
function mountMain(){
 const d=mountData(),sys=source.mount;
 const control='<div class="oc-flexline">'+range('mount',d.from,d.to,30,'DAL LIVELLO','A')+addButton('mount-lv')+'</div>';
 const evos=sys.evo.map(e=>'<tr class="'+(d.ev.includes(e)?'':'oc-faint')+'"><td class="oc-gold">Al livello '+e.lv+'</td><td><div class="oc-mats">'+matsIcons(e.m)+'</div></td><td class="oc-num">'+h(cp(e.y))+'</td><td class="oc-gold">'+h((sys.bon||[])[sys.evo.indexOf(e)]?.[1]||'')+'</td></tr>').join('');
 const lvl=titleRow('Livello ed evoluzione')+control+stats([['YANG',cp(d.yang)],['VALORE MATERIALI',cp(totalMat(d.m))],['COSTO TOTALE',cp(d.yang+totalMat(d.m)),'','oc-green'],['EVOLUZIONI',d.ev.length]])+
 '<div class="oc-scroll"><table><thead><tr><th>EVOLUZIONE</th><th>MATERIALI</th><th>YANG</th><th>SBLOCCHI</th></tr></thead><tbody>'+evos+'</tbody></table></div>'+
 note('Medaglie per intervalli: '+sys.med.map(x=>x[0]+'–'+x[1]+': '+x[3]+' × '+matName(x[2])).join(' · '));
 const bonusRows=(sys.coll||[]).map(row=>'<tr>'+row.map((x,i)=>'<td class="'+(i===0?'oc-gold':'oc-num')+'">'+h(x)+'</td>').join('')+'</tr>').join('');
 const right=materialTable(d.m,'Materiali per livello')+'<div class="oc-materials oc-bonus">'+originalTitle('Bonus collezione aspetti')+
 '<div class="oc-scroll"><table><thead><tr><th>COLLEZIONE</th><th>FORTE CONTRO MOSTRI</th><th>VALORE ATTACCO (PVM)</th><th>CRITICO</th></tr></thead><tbody>'+bonusRows+'</tbody></table></div></div>';
 return [cPanel('mount-lvl','Livello ed evoluzione',lvl,7),cPanel('mount-materials','Materiali per livello',right,5)];
}
function costumeData(){
 const sourceRows=source.pet.asp||[],chosen=new Set(P.costumes),m={};let yang=0;
 for(let i=0;i<sourceRows.length;i++)if(chosen.has(i)){merge(m,sourceRows[i].m);yang+=sourceRows[i].y}
 return {rows:sourceRows,m,yang,chosen};
}
function costumesMain(){
 const data=costumeData();
 const sum=titleRow('Costumi pet',addButton('costumes'))+
 '<div class="oc-actions"><button class="btn small outline" data-oc-all="yes">SELEZIONA TUTTI</button><button class="btn small outline" data-oc-all="no">DESELEZIONA</button><small>'+data.chosen.size+' di '+data.rows.length+' selezionati</small></div>'+
 stats([['YANG',cp(data.yang)],['VALORE MATERIALI',cp(totalMat(data.m))],['COSTO TOTALE',cp(data.yang+totalMat(data.m)),'','oc-green'],['BONUS',data.chosen.size?data.rows.filter((_,i)=>data.chosen.has(i)).map(x=>x.b).join(' · '):'—']]);
 const cards=data.rows.map((x,i)=>{
  const real=state.costumes?.[i],name=real?.name||x.n,bonus=real?.bonus||x.b,enemy=real?.enemy||x.mob;
  return '<button type="button" data-oc-costume="'+i+'" class="oc-costume '+(data.chosen.has(i)?'on':'')+'"><span class="oc-corner">'+(data.chosen.has(i)?'✓':'')+'</span><strong>'+h(name)+'</strong><span class="oc-green">'+h(bonus)+'</span><small>Sconfiggi '+x.k+' × '+h(enemy)+'</small><span class="oc-mats">'+matsIcons(x.m)+'</span><b>'+h(cp(x.y))+' yang</b></button>';
 }).join('');
 return [cPanel('costumes-sum','Riepilogo costumi',sum,12),cPanel('costumes-list','Costumi pet',titleRow('Costumi da sbloccare')+'<div class="oc-costume-grid">'+cards+'</div>',7),cPanel('costumes-mat','Totale selezione',data.chosen.size?materialTable(data.m,'Totale selezione'):'<p class="oc-note">Non servono materiali.</p>',5)];
}
function planEntry(kind){
 if(kind==='pet-lv'){const d=petData();return {name:'Pet · livelli '+d.from+'–'+d.to,materials:d.lm,yang:d.yang}}
 if(kind==='pet-type'){const d=petData();return {name:'Pet · tipi '+d.ta+'–'+d.tb,materials:d.typeM,yang:0}}
 if(kind==='pet-skill'){const d=petSkillData();return {name:'Pet · abilità '+d.skill.n,materials:d.m,yang:d.yang}}
 if(kind==='mount-lv'){const d=mountData();return {name:'Cavalcatura · livelli '+d.from+'–'+d.to,materials:d.m,yang:d.yang}}
 if(kind==='mount-skill'){const d=mountSkillData();return {name:'Cavalcatura · abilità '+d.skill.n,materials:d.m,yang:d.yang}}
 if(kind==='costumes'){const d=costumeData();return {name:'Costumi pet · '+d.chosen.size+' selezionati',materials:d.m,yang:d.yang}}
 return null;
}
function addPlan(kind){
 const rec=planEntry(kind);if(!rec)return;
 const materials={};for(const [id,q] of Object.entries(rec.materials))added(materials,matName(id),q);
 state.planner.push({source:'VERZUM · '+kind.toUpperCase(),name:rec.name,materials,yang:rec.yang,created:new Date().toLocaleDateString('it-IT')});
 state.route='planner';saveP();render();toast('Aggiunto al pianificatore');
}
function changeInput(path,value){
 const parts=path.split('.');
 if(path==='petType.from')P.pet.typeFrom=Math.max(1,Math.min(5,+value||1));
 else if(path==='petType.to')P.pet.typeTo=Math.max(P.pet.typeFrom+1,Math.min(6,+value||6));
 else if(path==='petSkill.from')P.pet.skillFrom=+value;
 else if(path==='petSkill.to')P.pet.skillTo=+value;
 else if(path==='mountSkill.from')P.mount.skillFrom=+value;
 else if(path==='mountSkill.to')P.mount.skillTo=+value;
 else if(parts.length===2&&P[parts[0]])P[parts[0]][parts[1]]=+value;
 const a=P.pet;a.to=Math.max(+a.from+1,+a.to);a.typeTo=Math.max(+a.typeFrom+1,+a.typeTo);a.skillTo=Math.max(+a.skillFrom+1,+a.skillTo);
 P.mount.to=Math.max(+P.mount.from+1,+P.mount.to);P.mount.skillTo=Math.max(+P.mount.skillFrom+1,+P.mount.skillTo);
 saveP();render();
}
const host=document.getElementById('panels');
host?.addEventListener('change',e=>{
 const t=e.target;
 if(t.dataset.ocField){changeInput(t.dataset.ocField,t.value);return}
 if(t.dataset.ocPrice!==undefined){
  const value=parseYang(t.value,0),pn=t.dataset.ocPrice;
  if(!(pn in state.prices))state.prices[pn]=0;
  state.prices[pn]=Math.max(0,value);saveP();render();
 }
});
host?.addEventListener('click',e=>{
 const btn=e.target.closest('[data-oc-add],[data-oc-fail],[data-oc-skill],[data-oc-costume],[data-oc-all]');
 if(!btn)return;
 if(btn.dataset.ocAdd){addPlan(btn.dataset.ocAdd);return}
 if(btn.dataset.ocFail!==undefined){P.pet.fails[btn.dataset.ocFail]=+btn.dataset.ocVal;saveP();render();return}
 if(btn.dataset.ocSkill){const [key,i]=btn.dataset.ocSkill.split(':');if(P[key])P[key].skill=Number(i);saveP();render();return}
 if(btn.dataset.ocCostume!==undefined){const id=Number(btn.dataset.ocCostume),set=new Set(P.costumes);if(set.has(id))set.delete(id);else set.add(id);P.costumes=[...set];saveP();render();return}
 if(btn.dataset.ocAll){P.costumes=btn.dataset.ocAll==='yes'?source.pet.asp.map((_,i)=>i):[];saveP();render();}
});
sections.pet=()=>[...petMain(),...skillCards('pet')];
sections.mount=()=>[...mountMain(),...skillCards('mount')];
sections.costume=costumesMain;
window.VERZUM_CALCULATOR_PARITY={P,petData,mountData,costumeData,planEntry,nameById,matName,materialTable,source,skillsData,saveP,stats,badge,matsIcons,range,mkOpts,added,merge,totalMat,priceOf,icon,cPanel,titleRow,originalTitle,h,nfmt,cp,addButton,srcReady:true};
})();
