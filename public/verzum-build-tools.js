/* VERZUM Tools · Profilo PvM condiviso e verificatore Wiki (nessuna formula danni inventata). */
(function(){
'use strict';
const host=document.getElementById('panels');
if(!host)return;
const KEY='verzum_pvm_build_v1';
const steps=[['1–29','Abilità PvM, pet, cavalcatura e Buffi'],['30–39','Arma +9, pietre e biologo'],['40–54','Dungeon, biologo e alchimia iniziale'],['55–64','Set PvM, pet e alchimia'],['65–74','Zombie, oscurità, stola e talismano'],['75','Preparazione per Azrael']];
const defaults={name:'Personaggio principale',class:'Guerriero',level:55,measuredDps:0,bonuses:{},supports:{pet:false,mount:false,buff:false,alchemy:false,talisman:false,premium:false},tasks:{}};
let profile={...defaults,bonuses:{},supports:{...defaults.supports},tasks:{}};
try{const saved=JSON.parse(localStorage.getItem(KEY)||'null');if(saved&&typeof saved==='object'){profile={...profile,...saved,bonuses:saved.bonuses&&typeof saved.bonuses==='object'?saved.bonuses:{},supports:{...defaults.supports,...(saved.supports||{})},tasks:saved.tasks&&typeof saved.tasks==='object'?saved.tasks:{}}}}catch(_){}
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const integer=x=>Number.isFinite(Number(x))?Math.max(0,Number(x)):0;
const fmt=x=>new Intl.NumberFormat('it-IT',{maximumFractionDigits:1}).format(x);
const saveProfile=()=>{try{localStorage.setItem(KEY,JSON.stringify(profile))}catch(_){}};
const route=()=>{try{return decodeURIComponent(location.hash.slice(1))}catch(_){return ''}};
function bonusTargets(page){
 const section=[...page.querySelectorAll('section')].find(s=>s.querySelector('.wk-vzhead')?.textContent?.trim()==='Bonus totali consigliati');
 if(!section)return [];
 return [...section.querySelectorAll('tbody tr')].map(tr=>{
  const cells=tr.querySelectorAll('td');if(cells.length<2)return null;
  const name=cells[0].textContent.trim(),label=cells[1].textContent.trim();
  const match=label.match(/([+]?[0-9][0-9.,]*)\s*(%)?\.?\s*$/);
  if(!name||!match)return null;
  const number=Number(match[1].replace(/[.](?=\d{3}(?:\D|$))/g,'').replace(',','.'));
  return Number.isFinite(number)?{name,label,target:number,unit:match[2]?'%':''}:null;
 }).filter(Boolean);
}
function headValue(page,label){
 const rows=[...page.querySelectorAll('.wk-dginfo__row')];
 return rows.find(r=>r.querySelector('.wk-dginfo__k')?.textContent.trim().toLowerCase()===label.toLowerCase())?.querySelector('.wk-dginfo__v')?.textContent.trim()||'';
}
function parseGameNumber(value){
 const m=String(value||'').toLowerCase().replace(/\s/g,'').match(/^([\d.,]+)(kkk|kk|k)?$/);
 if(!m)return 0;
 const n=Number(m[1].replace(',','.'));
 return Number.isFinite(n)?n*({k:1e3,kk:1e6,kkk:1e9}[m[2]]||1):0;
}
function pageInfo(page,r){
 const title=page.querySelector('.wk-head__title')?.textContent?.trim()||'Boss';
 if(r.startsWith('wiki/dungeons/'))return {kind:'dungeon',title,dps:parseGameNumber(headValue(page,'DPS consigliato')),hp:parseGameNumber(headValue(page,'PV del boss')),targets:bonusTargets(page),required:headValue(page,"Livello d'accesso")};
 if(r.startsWith('wiki/mob/')){
  const t=page.textContent||'';
  const hp=parseGameNumber(t.match(/HP max:\s*([\d.,]+\s*(?:kkk|kk|k)?)/i)?.[1]||'');
  const race=t.match(/Razza:\s*([^\n\r]+?)(?=Elemento:|Immune a:|Tempo di|$)/i)?.[1]?.trim()||'';
  return {kind:'boss',title,dps:0,hp,targets:[],race};
 }
 return null;
}
function profileFields(){
 return '<div class="vzw-grid"><label>Nome personaggio<input data-vzw-field="name" maxlength="60" value="'+esc(profile.name)+'"></label>'
  +'<label>Classe<select data-vzw-field="class">'+['Guerriero','Ninja','Sura','Sciamano'].map(n=>'<option'+(profile.class===n?' selected':'')+'>'+n+'</option>').join('')+'</select></label>'
  +'<label>Livello<input data-vzw-field="level" type="number" min="1" max="120" value="'+integer(profile.level)+'"></label>'
  +'<label>DPS misurato in gioco<input data-vzw-field="measuredDps" type="number" min="0" step="1" value="'+integer(profile.measuredDps)+'" placeholder="Inserisci un valore verificato"></label></div>';
}
function supports(){
 const names={alchemy:'Alchimia',talisman:'Talismano',pet:'Pet',mount:'Cavalcatura',buff:'Buff attivi',premium:'Equipaggiamento premium'};
 return '<div class="vzw-supports">'+Object.entries(names).map(([key,name])=>'<label><input type="checkbox" data-vzw-support="'+key+'"'+(profile.supports[key]?' checked':'')+'> '+esc(name)+'</label>').join('')+'</div>';
}
function targetsHtml(targets){
 if(!targets.length)return '<p class="vzw-small">La scheda di questo boss non contiene obiettivi numerici di preparazione. Inserisci il DPS misurato per la valutazione indicativa.</p>';
 return '<div class="vzw-targets">'+targets.map(t=>{
  const n=integer(profile.bonuses[t.name]),ratio=t.target>0?Math.min(100,n/t.target*100):0,delta=Math.max(0,t.target-n);
  return '<div class="vzw-target"><div class="vzw-target-top"><b>'+esc(t.name)+'</b><span>Obiettivo '+fmt(t.target)+t.unit+'</span></div>'
   +'<div class="vzw-target-input"><label>Il mio valore <input type="number" min="0" step="any" data-vzw-bonus="'+esc(t.name)+'" value="'+n+'"></label>'
   +'<span class="vzw-gap">'+(delta>0?'Mancano '+fmt(delta)+t.unit:'Obiettivo raggiunto')+'</span></div>'
   +'<div class="vzw-track"><span style="width:'+ratio+'%"></span></div></div>';
 }).join('')+'</div>';
}
function dungeonUI(page,r){
 const info=pageInfo(page,r);if(!info)return '';
 const ready=info.targets.filter(t=>integer(profile.bonuses[t.name])>=t.target).length;
 const dps=integer(profile.measuredDps);
 const seconds=dps>0&&info.hp>0?info.hp/dps:0;
 const levelMatch=String(info.required||'').match(/(\d+)\s*[-–]\s*(\d+)/);
 const eligible=levelMatch?Number(profile.level)>=Number(levelMatch[1])&&Number(profile.level)<=Number(levelMatch[2]):null;
 return '<section class="vzw-panel" data-vzw-scope="boss" data-vzw-route="'+esc(r)+'">'
 +'<div class="vzw-head"><div><span class="vzw-overline">VERZUM · STRUMENTI INTERATTIVI</span><h2>Preparazione: '+esc(info.title)+'</h2></div><span class="vzw-chip">Profilo PvM</span></div>'
 +'<p>Confronta i tuoi valori con la Wiki. Le statistiche sono inserite dal giocatore; nessun bonus o danno viene calcolato con formule non verificate.</p>'
 +profileFields()+supports()
 +'<div class="vzw-metrics"><div><small>Obiettivi verificati</small><strong>'+(info.targets.length?ready+' / '+info.targets.length:'Non disponibili')+'</strong></div><div><small>DPS consigliato dalla Wiki</small><strong>'+(info.dps?fmt(info.dps):'—')+'</strong></div>'
 +'<div><small>Tempo teorico senza rigenerazione</small><strong>'+(seconds>0?fmt(seconds)+' s':'—')+'</strong></div>'
 +(eligible!==null?'<div><small>Fascia di accesso</small><strong>'+esc(info.required)+' · '+(eligible?'Livello compatibile':'Livello non compatibile')+'</strong></div>':'')+'</div>'
 +'<h3>Bonus consigliati dalla Wiki</h3>'+targetsHtml(info.targets)
 +'<div class="vzw-actions"><button type="button" data-vzw-plan>Salva obiettivo nel Planner</button><a href="#upgrade">Apri Potenziamenti</a><a href="#skills">Apri Abilità</a></div>'
 +'<p class="vzw-small">Il tempo teorico usa PV ÷ DPS misurato; esclude rigenerazione del boss, fasi e altre meccaniche. Il confronto dei bonus non equivale a probabilità di vittoria.</p></section>';
}
function guideUI(){
 const checklist=steps.map(([lv,name],i)=>'<label class="vzw-task"><input type="checkbox" data-vzw-task="'+i+'"'+(profile.tasks[i]?' checked':'')+'><span><b>Livelli '+lv+'</b><small>'+esc(name)+'</small></span></label>').join('');
 return '<section class="vzw-panel" data-vzw-scope="guide"><div class="vzw-head"><div><span class="vzw-overline">GUIDA 1–75 · PERCORSO PERSONALE</span><h2>Il mio progresso VERZUM</h2></div><span class="vzw-chip">Salvataggio locale</span></div>'
 +'<p>Seleziona il personaggio e segna gli obiettivi completati. Le attività sono consigli della guida, non requisiti obbligatori.</p>'+profileFields()
 +'<div class="vzw-tasks">'+checklist+'</div><div class="vzw-actions"><a href="#upgrade">Calcola potenziamenti</a><a href="#pet">Calcola pet</a><a href="#mount">Calcola cavalcatura</a><a href="#planner">Apri Planner</a><a href="#wiki/dungeons/azrael">Verifica Azrael</a></div></section>';
}
let busy=false;
function inject(){
 if(busy)return;busy=true;
 try{
  const r=route(),page=host.querySelector('.vz-wiki .wk-page');
  if(!page)return;
  if(r==='wiki/guides/vz_level_1_75'){
   if(!page.querySelector('[data-vzw-scope="guide"]')){
    const marker=page.querySelector('#s2');
    if(marker)marker.insertAdjacentHTML('beforebegin',guideUI());
    else page.insertAdjacentHTML('beforeend',guideUI());
   }
  }else if(r.startsWith('wiki/dungeons/')||r.startsWith('wiki/mob/')){
   if(!page.querySelector('[data-vzw-scope="boss"]'))page.insertAdjacentHTML('beforeend',dungeonUI(page,r));
  }else if(r==='wiki/bosses/boss_dungeon'){
   page.querySelectorAll('article.wk-row').forEach(row=>{
    if(row.querySelector('.vzw-shortcut'))return;
    const link=row.querySelector('.wk-namebar__name[href^="#wiki/mob/"]');
    if(!link)return;
    const a=document.createElement('a');a.className='vzw-shortcut';a.href=link.getAttribute('href');a.textContent='Valuta il boss';a.setAttribute('aria-label','Apri il calcolatore per '+link.textContent.trim());
    row.querySelector('.wk-namebar')?.append(a);
   });
  }
 }finally{busy=false}
}
function update(){
 const page=host.querySelector('.vz-wiki .wk-page'),panel=page?.querySelector('.vzw-panel');
 if(!page||!panel)return;
 const scope=panel.dataset.vzwScope,routeId=route();
 const fresh=scope==='guide'?guideUI():dungeonUI(page,routeId);
 if(fresh)panel.outerHTML=fresh;
}
host.addEventListener('change',e=>{
 const el=e.target;
 if(!el.closest('.vzw-panel'))return;
 if(el.dataset.vzwField){const k=el.dataset.vzwField;profile[k]=['level','measuredDps'].includes(k)?integer(el.value):String(el.value).slice(0,60)}
 if(el.dataset.vzwBonus)profile.bonuses[el.dataset.vzwBonus]=integer(el.value);
 if(el.dataset.vzwSupport)profile.supports[el.dataset.vzwSupport]=el.checked;
 if(el.dataset.vzwTask!==undefined)profile.tasks[el.dataset.vzwTask]=el.checked;
 saveProfile();update();
});
host.addEventListener('click',e=>{
 const btn=e.target.closest('[data-vzw-plan]');if(!btn)return;
 const page=btn.closest('.wk-page'),info=pageInfo(page,route());if(!info)return;
 const gaps=info.targets.filter(t=>integer(profile.bonuses[t.name])<t.target).map(t=>t.name+': '+fmt(integer(profile.bonuses[t.name]))+' / '+fmt(t.target)+(t.unit||''));
 if(typeof state!=='undefined'&&Array.isArray(state.planner)){
  state.planner.push({name:'Preparazione '+info.title,source:'Wiki Boss · '+profile.class+' livello '+profile.level,materials:{},yang:0,notes:gaps.join('; '),created:new Date().toLocaleDateString('it-IT')});
  if(typeof save==='function')save();
  location.hash='#planner';if(typeof render==='function'){state.route='planner';render();}
 }
});
const obs=new MutationObserver(()=>{if(!busy)inject()});
obs.observe(host,{subtree:true,childList:true});
addEventListener('hashchange',()=>queueMicrotask(inject));
inject();
window.VERZUM_BUILD_TOOLS={getProfile:()=>JSON.parse(JSON.stringify(profile)),getRoute:route};
})();