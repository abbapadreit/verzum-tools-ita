/* VERZUM Tools — calcolatori di abilità, abilità passive e listino materiali.
 * I valori e le formule provengono dalle schede di riferimento effettive.
 * Nessuna percentuale di riuscita viene ipotizzata. */
(function(){
'use strict';
const H=window.VERZUM_CALCULATOR_PARITY,DATA=window.VERZUM_SKILL_REFERENCE;
if(!H||!DATA||!DATA.SK||!DATA.PAS)return;
const {P,saveP,icon,badge,matsIcons,materialTable,totalMat,added,merge,matName,priceOf,nfmt,cp,cPanel,titleRow,stats,h,addButton}=H;
const skillLevel=['M1','M2','M3','M4','M5','M6','M7','M8','M9','M10','G1','G2','G3','G4','G5','G6','G7','G8','G9','G10','P'];
const classLabels={warrior:'Guerriero',ninja:'Ninja',sura:'Sura',shaman:'Sciamano'};
const passiveLabels=['Comando','Guerriero coraggioso','Guerriero del Dio Drago','Campione dei dungeon'];
const bookRecipe={
 M:[['100006',1],['100010',35]],
 G:[['100007',1],['100010',50],['71001',1],['71094',1]],
 P:[['100008',1],['100010',75],['50513',1],['70102',5]]
};
function selectLevels(path,from,to,values){
 let str='<div class="oc-controlrow"><label>DA<select data-ocx-set="'+path+'.from">';
 str+=values.slice(0,-1).map((text,i)=>'<option value="'+i+'"'+(i===Number(from)?' selected':'')+'>'+h(text)+'</option>').join('');
 str+='</select></label><label>A<select data-ocx-set="'+path+'.to">';
 str+=values.map((text,i)=>i>Number(from)?'<option value="'+i+'"'+(i===Number(to)?' selected':'')+'>'+h(text)+'</option>':'').join('');
 return str+'</select></label></div>';
}
function failsControl(mode,index,value,lo,hi){
 let out='<div class="oc-chips">';
 for(let i=lo;i<=hi;i++)out+='<button type="button" data-ocx-fail="'+mode+':'+index+':'+i+'" class="oc-chip '+(Number(value)===i?'on':'')+'">'+i+'</button>';
 if(value>hi)out+='<span class="oc-num">+'+h(nfmt(value))+'</span>';
 return out+'</div>';
}
function className(sk,loc){
 const orig=sk.n?.ro||sk.n?.en||'';
 return typeof SKILL_TRANSLATIONS!=='undefined'&&SKILL_TRANSLATIONS[orig]?SKILL_TRANSLATIONS[orig]:sk.n?.en||orig;
}
function effectTable(effect,label){
 const rows=(effect?.t||effect?.r||[]);
 const lines=Array.isArray(rows)?rows:[];
 if(!lines.length)return '';
 const heads=effect.h||['1','5','10','15','M1','M6','G1','G6','P'];
 const titles=effect.l?.en||null;
 let out='<div class="oc-scroll"><table class="oc-effect-table"><thead><tr><th>'+h(label||'BONUS')+'</th>'+heads.map(x=>'<th>'+h(x)+'</th>').join('')+'</tr></thead><tbody>';
 for(const [i,line] of lines.entries()){
  const desc=titles?.[i]||line[0];
  out+='<tr><th>'+h(desc)+'</th>'+line.slice(1).map(x=>'<td class="oc-num">'+h(x)+'</td>').join('')+'</tr>';
 }
 return out+'</tbody></table></div>';
}
function skillData(){
 const k=P.skills,cls=DATA.SK[k.class]?k.class:'warrior',list=DATA.SK[cls];
 const index=Math.max(0,Math.min(11,Number(k.skill)||0));
 const a=Math.max(0,Math.min(19,Number(k.from)||0)),b=Math.max(a+1,Math.min(20,Number(k.to)||20));
 const book='sb_'+cls+'_'+index,m={},rows=[];
 let reads=0,hours=0;
 for(let i=a;i<b;i++){
  if(i<10){
   const req=i+1,fail=k.concentrated?0:Math.max(0,Number(k.fails[i])||0),tries=req+fail;
   added(m,book,tries);reads+=tries;hours+=2*tries;
   rows.push({i,req,fail,tries,id:book,master:true});
  }else{
   const tries=Math.max(1,Number(k.stones[i])||1);
   added(m,'50513',tries);reads+=tries;hours+=4*tries;
   rows.push({i,req:1,fail:tries,tries,id:'50513',master:false});
  }
 }
 if(k.concentrated)added(m,'71094',reads);
 if(k.exorcism&&reads>1)added(m,'71001',reads-1);
 if(Number(k.zen)>0)added(m,'70102',Number(k.zen));
 return {cls,list,index,book,from:a,to:b,skill:list[index],m,reads,hours:k.exorcism?0:hours,rows,books:m[book]||0,stones:m['50513']||0};
}
function skillsMain(){
 const d=skillData(),k=P.skills,group=Math.max(0,Math.min(1,Number(k.group)||0));
 const classButtons=Object.entries(classLabels).map(([cls,lab])=>'<button class="oc-select '+(cls===d.cls?'on':'')+'" data-ocx-class="'+cls+'">'+h(lab)+'</button>').join('');
 const groups=[0,1].map(g=>'<button class="oc-select '+(g===group?'on':'')+'" data-ocx-group="'+g+'">Gruppo '+(g+1)+'</button>').join('');
 const chosen=d.list.slice(group*6,group*6+6).map((sk,i)=>{
  const idx=i+group*6;
  return '<button type="button" class="oc-pick '+(d.index===idx?'on':'')+'" data-ocx-skill="'+idx+'">'+icon('sk_'+d.cls+'_'+idx)+'<strong>'+h(className(sk))+'</strong></button>';
 }).join('');
 const pick='<div class="oc-pickbar">'+classButtons+'</div><div class="oc-pickbar">'+groups+'</div><div class="oc-picker">'+chosen+'</div>';
 const controls=selectLevels('skills',d.from,d.to,skillLevel)+
 '<label class="oc-checkbox"><input type="checkbox" data-ocx-check="skills.concentrated" '+(k.concentrated?'checked':'')+'> Lettura concentrata per ogni lettura</label>'+
 '<label class="oc-checkbox"><input type="checkbox" data-ocx-check="skills.exorcism" '+(k.exorcism?'checked':'')+'> Papiro dell’Esorcismo (senza attesa)</label>'+
 '<label class="oc-shortlabel">FOGLI ZEN<input class="oc-shortnum" type="number" data-ocx-set="skills.zen" min="0" value="'+(+k.zen||0)+'"></label>'+addButton('ocx-skill');
 const lines=d.rows.map(x=>'<tr><td class="oc-gold">'+skillLevel[x.i]+' → '+skillLevel[x.i+1]+'</td><td class="oc-num">'+x.req+'</td><td>'+(
 x.master?(k.concentrated?'<span class="oc-green">Concentrata</span>':failsControl('skill',x.i,x.fail,0,4)):failsControl('stone',x.i,x.tries,1,5)
 )+'</td><td class="oc-gold oc-num">'+x.tries+'</td><td>'+badge(x.id,x.tries)+'</td></tr>').join('');
 const status=stats([['YANG',0],['VALORE MATERIALI',cp(totalMat(d.m))],['COSTO TOTALE',cp(totalMat(d.m)),'','oc-green'],['LIBRI / PIETRE',d.books+' / '+d.stones,d.reads+' letture totali']]);
 const main='<div class="oc-skill-title">'+icon('sk_'+d.cls+'_'+d.index)+'<strong>'+h(className(d.skill))+'</strong></div>'+
 '<div class="oc-flexline oc-form">'+controls+'</div>'+status+
 '<p class="oc-note">Tempo di attesa: '+h(k.exorcism?'senza attesa':cp(d.hours)+' ore (teoriche)')+'</p>'+
 '<div class="oc-scroll"><table><thead><tr><th>LIVELLO</th><th>LETTURE RIUSCITE</th><th>FALLIMENTI / PIETRE USATE</th><th>LETTURE</th><th>USATI</th></tr></thead><tbody>'+lines+'</tbody></table></div>'+
 '<p class="oc-note">Maestro: da 1 lettura a M1 a 10 letture a M10. Gran Maestro: ogni livello richiede una promozione con Pietra delle Anime. Le percentuali esatte non sono riportate dalla fonte.</p>';
 const eff=effectTable({t:d.skill.t,l:d.skill.l},'EFFETTO');
 return [cPanel('skill-pick','Scegli abilità',pick,4),cPanel('skill-calc',className(d.skill),main,8),
 cPanel('skill-effects','Effetti abilità',titleRow('Effetti della skill')+eff,7),
 cPanel('skill-materials','Materiali necessari',materialTable(d.m,'Materiali necessari'),5)];
}
const PLV=i=>i<20?String(i):i<30?'M'+(i-19):i<40?'G'+(i-29):'P';
function passiveData(){
 const k=P.passive,index=Math.max(0,Math.min(3,Number(k.skill)||0)),passive=DATA.PAS[index];
 const from=Math.max(0,Math.min(39,Number(k.from)||0)),to=Math.max(from+1,Math.min(40,Number(k.to)||40));
 const groups=[
  {key:'N',label:'Normale',book:passive.b[0],recipe:'M',reads:0,fail:Math.max(0,Number(k.failN)||0),hrs:2},
  {key:'M',label:'Maestro',book:passive.b[1],recipe:'G',reads:0,fail:Math.max(0,Number(k.failM)||0),hrs:2},
  {key:'G',label:'Gran Maestro',book:passive.b[2],recipe:'P',reads:0,fail:0,hrs:4}];
 for(let i=from;i<to;i++){if(i<20)groups[0].reads++;else if(i<30)groups[1].reads+=i-19;else groups[2].reads+=10+(i-29)}
 const m={},records=[];
 let totalReads=0,wait=0;
 for(const g of groups){
  if(!g.reads)continue;
  const fail=k.concentrated?0:g.fail,tries=g.reads+fail;
  totalReads+=tries;wait+=tries*g.hrs;
  if(k.mode==='craft')merge(m,(bookRecipe[g.recipe]||[]),tries);else added(m,g.book,tries);
  records.push({g,fail,tries});
 }
 const nm=(groups[0].reads+(k.concentrated?0:groups[0].fail))+(groups[1].reads+(k.concentrated?0:groups[1].fail));
 const ccN=(k.concentrated?nm:0)+groups[2].reads;
 const exN=k.exorcism&&totalReads>1?totalReads-1:0;
 if(ccN)added(m,passive.cc,ccN);
 if(exN)added(m,passive.ex,exN);
 return {index,passive,from,to,m,records,totalReads,wait:k.exorcism?0:wait,ccN,exN};
}
function passiveMain(){
 const d=passiveData(),k=P.passive;
 const cards=DATA.PAS.map((p,i)=>'<button type="button" data-ocx-passive="'+i+'" class="oc-pick '+(i===d.index?'on':'')+'">'+icon(p.ic)+'<span><strong>'+h(passiveLabels[i]||p.n.en||p.n.ro)+'</strong><small>'+h(matName(p.b[0]))+'</small></span></button>').join('');
 const choose='<div class="oc-picker">'+cards+'</div><p class="oc-note">I libri vengono realizzati nel negozio abilità con libri passivi (M/G/P) e pagine.</p>';
 const lv=Array.from({length:41},(_,i)=>PLV(i));
 const ctr=selectLevels('passive',d.from,d.to,lv)+
 '<label>LIBRI<div class="oc-seg"><button data-ocx-mode="buy" class="'+(k.mode!=='craft'?'on':'')+'">Acquistati</button><button data-ocx-mode="craft" class="'+(k.mode==='craft'?'on':'')+'">Creati</button></div></label>'+
 '<label class="oc-checkbox"><input type="checkbox" data-ocx-check="passive.concentrated" '+(k.concentrated?'checked':'')+'> Lettura concentrata</label>'+
 '<label class="oc-checkbox"><input type="checkbox" data-ocx-check="passive.exorcism" '+(k.exorcism?'checked':'')+'> Papiro (senza attesa)</label>'+addButton('ocx-passive');
 const rows=d.records.map(({g,fail,tries})=>'<tr><td class="oc-gold">'+h(g.label)+'</td><td class="oc-num">'+nfmt(g.reads)+'</td><td><input class="oc-shortnum" type="number" min="0" data-ocx-passive-fail="'+g.key+'" value="'+fail+'"'+(k.concentrated||g.key==='G'?' disabled':'')+'></td><td class="oc-gold oc-num">'+nfmt(tries)+'</td><td>'+matsIcons(k.mode==='craft'?bookRecipe[g.recipe].map(([id,q])=>[id,q*tries]):[[g.book,tries]])+'</td></tr>').join('');
 const extras=(d.ccN||d.exN)?'<tr><td class="oc-gold">Supporti</td><td colspan="3"></td><td>'+matsIcons([[d.passive.cc,d.ccN],[d.passive.ex,d.exN]].filter(x=>x[1]))+'</td></tr>':'';
 const calc='<div class="oc-skill-title">'+icon(d.passive.ic)+'<strong>'+h(passiveLabels[d.index])+'</strong></div>'+
 '<div class="oc-flexline oc-form">'+ctr+'</div>'+stats([['YANG',0],['VALORE MATERIALI',cp(totalMat(d.m))],['COSTO TOTALE',cp(totalMat(d.m)),'','oc-green'],['LETTURE',nfmt(d.totalReads),'attesa: '+(k.exorcism?'0':nfmt(d.wait)+' ore')]])+
 '<div class="oc-scroll"><table><thead><tr><th>GRADO</th><th>LETTURE RIUSCITE</th><th>FALLIMENTI</th><th>LETTURE</th><th>USATI</th></tr></thead><tbody>'+rows+extras+'</tbody></table></div>'+
 '<p class="oc-note">Normale: una lettura riuscita per livello. Maestro: M1=1 fino a M10=10. Gran Maestro: G1=11 fino a G10=20. Attesa indicata nella fonte: 2 ore, al Gran Maestro 4 ore.</p>';
 const effect=(d.passive.t||[]).map(t=>'<div class="oc-eff-group">'+(t.cap?titleRow(t.cap.en||t.cap.ro):'')+effectTable({r:t.r,h:t.h,l:t.l},'BONUS')+'</div>').join('');
 return [cPanel('passive-pick','Scegli abilità',choose,4),cPanel('passive-calc',passiveLabels[d.index],calc,8),
 cPanel('passive-effects','Bonus',effect,7),cPanel('passive-materials','Materiali necessari',materialTable(d.m,'Materiali necessari'),5)];
}
function priceGroups(){
 const all=Object.entries(state.prices);
 const used={pet:new Set(),mount:new Set(),skills:new Set(),costumes:new Set()};
 const collect=(s,parts)=>{for(const [id] of parts||[])s.add(matName(id))};
 for(const e of H.source.pet.evo||[])collect(used.pet,e.m);
 for(const e of H.source.pet.types||[])used.pet.add(matName(e.g));
 for(const e of H.source.pet.skills||[])for(const step of e.c||[])collect(used.pet,step);
 for(const e of H.source.pet.snack||[])used.pet.add(matName(e[2]));
 for(const e of H.source.mount.evo||[])collect(used.mount,e.m);
 for(const e of H.source.mount.med||[])used.mount.add(matName(e[2]));
 for(const e of H.source.mount.skills||[])for(const step of e.c||[])collect(used.mount,step);
 for(const cls of Object.keys(DATA.SK))for(let i=0;i<12;i++)used.skills.add(matName('sb_'+cls+'_'+i));
 for(const e of DATA.PAS)for(const id of [...e.b,e.cc,e.ex])used.skills.add(matName(id));
 for(const e of H.source.pet.asp||[])collect(used.costumes,e.m);
 const groups=[['Potenziamento oggetti',[]],['Pet e cavalcature',[]],['Libri e abilità',[]],['Costumi pet',[]],['Altri materiali',[]]];
 for(const [name,value] of all){
  let g=0;
  if(used.pet.has(name)||used.mount.has(name))g=1;
  else if(used.skills.has(name))g=2;
  else if(used.costumes.has(name))g=3;
  else if(!/gemma|pietra|perla|talismano|oro|papiro|conchiglia|mitril|ossa|zampe|cenere/i.test(name))g=4;
  groups[g][1].push([name,value]);
 }
 for(const group of groups)group[1].sort((a,b)=>a[0].localeCompare(b[0],'it'));
 return groups.filter(x=>x[1].length);
}
function pricesMain(){
 const groups=priceGroups();
 const rows=groups.map(([label,records])=>'<tr class="oc-group"><th colspan="2">'+h(label)+'</th></tr>'+
 records.map(([name,v])=>{
  const id=state.materialIds?.[name]||Object.keys(state.reference.names||{}).find(k=>state.reference.names[k]===name)||name;
  return '<tr><td><div class="oc-material">'+badge(id)+'<span>'+h(name)+'</span></div></td><td><input type="text" class="oc-price" data-oc-price="'+h(name)+'" placeholder="es. 500k" value="'+(v>0?h(cp(v)):'')+'"></td></tr>';
 }).join('')).join('');
 const list='<div class="oc-scroll"><table><thead><tr><th>MATERIALE</th><th>PREZZO / PZ</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
 const shares='<p class="oc-note">I prezzi sono memorizzati localmente nel browser. Esporta o importa un listino JSON.</p>'+
 '<label class="oc-share-label">CONFIGURAZIONE PREZZI<textarea id="ocx-prices-json" rows="8" placeholder="Incolla un JSON con i nomi e i prezzi dei materiali"></textarea></label>'+
 '<div class="oc-actions"><button class="btn small" data-ocx-price-action="copy">COPIA</button><button class="btn small" data-ocx-price-action="import">IMPORTA</button><button class="btn small" data-ocx-price-action="clear">CANCELLA TUTTO</button></div>';
 return [cPanel('price-list','Prezzi materiali',list,7),cPanel('price-share','Salva / condividi',shares,5)];
}
function planExtra(kind){
 let rec;
 if(kind==='ocx-skill'){const d=skillData();rec={name:'Abilità '+className(d.skill),yang:0,m:d.m}}
 else if(kind==='ocx-passive'){const d=passiveData();rec={name:'Passiva '+passiveLabels[d.index],yang:0,m:d.m}}
 if(!rec)return;
 const mats={};for(const [id,q] of Object.entries(rec.m))added(mats,matName(id),q);
 state.planner.push({source:'VERZUM · ABILITÀ',name:rec.name,materials:mats,yang:rec.yang,created:new Date().toLocaleDateString('it-IT')});
 state.route='planner';saveP();render();toast('Aggiunto al pianificatore');
}
function setParam(path,value){
 const [type,key]=path.split('.');
 if(!P[type]||!(key in P[type]))return;
 if(['class','mode'].includes(key))P[type][key]=value;
 else if(['concentrated','exorcism'].includes(key))P[type][key]=!!value;
 else P[type][key]=Math.max(0,Number(value)||0);
 if(P[type].to<=P[type].from)P[type].to=P[type].from+1;
 saveP();render();
}
const host=document.getElementById('panels');
host?.addEventListener('change',e=>{
 const el=e.target;
 if(el.dataset.ocxSet){setParam(el.dataset.ocxSet,el.value);return}
 if(el.dataset.ocxCheck){setParam(el.dataset.ocxCheck,el.checked);return}
 if(el.dataset.ocxPassiveFail){
  if(el.dataset.ocxPassiveFail==='N')P.passive.failN=Math.max(0,Number(el.value)||0);
  else if(el.dataset.ocxPassiveFail==='M')P.passive.failM=Math.max(0,Number(el.value)||0);
  saveP();render();
 }
});
host?.addEventListener('click',e=>{
 const el=e.target.closest('[data-ocx-class],[data-ocx-group],[data-ocx-skill],[data-ocx-passive],[data-ocx-fail],[data-ocx-mode],[data-oc-add],[data-ocx-price-action]');
 if(!el)return;
 if(el.dataset.ocxClass){P.skills.class=el.dataset.ocxClass;P.skills.skill=0;P.skills.group=0;}
 else if(el.dataset.ocxGroup!==undefined){P.skills.group=Number(el.dataset.ocxGroup);P.skills.skill=P.skills.group*6;}
 else if(el.dataset.ocxSkill!==undefined)P.skills.skill=Number(el.dataset.ocxSkill);
 else if(el.dataset.ocxPassive!==undefined)P.passive.skill=Number(el.dataset.ocxPassive);
 else if(el.dataset.ocxMode)P.passive.mode=el.dataset.ocxMode;
 else if(el.dataset.ocxFail){
  const [mode,index,value]=el.dataset.ocxFail.split(':');
  if(mode==='skill')P.skills.fails[index]=Number(value);
  if(mode==='stone')P.skills.stones[index]=Number(value);
 }else if(el.dataset.ocAdd?.startsWith('ocx-')){planExtra(el.dataset.ocAdd);return}
 else if(el.dataset.ocxPriceAction){
  const text=host.querySelector('#ocx-prices-json');
  if(el.dataset.ocxPriceAction==='copy'){const value=JSON.stringify(state.prices,null,2);if(text)text.value=value;copy(value);return}
  if(el.dataset.ocxPriceAction==='clear'){if(!confirm('Azzerare tutti i prezzi dei materiali?'))return;for(const n of Object.keys(state.prices))state.prices[n]=0;}
  if(el.dataset.ocxPriceAction==='import'){try{const j=JSON.parse(text?.value||'{}');if(!j||Array.isArray(j)||typeof j!=='object')throw Error('JSON non valido');for(const [name,price] of Object.entries(j))if(name in state.prices&&Number.isFinite(Number(price))&&Number(price)>=0)state.prices[name]=Number(price);toast('Listino importato')}catch(error){toast('Errore nel listino: '+error.message);return}}
 }else return;
 saveP();render();
});
sections.skills=skillsMain;
sections.passive=passiveMain;
sections.prices=pricesMain;
window.VERZUM_CALCULATOR_EXT={skillData,passiveData,priceGroups,bookRecipe};
})();
