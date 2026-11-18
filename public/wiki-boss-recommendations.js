/* VERZUM — render original dungeon Wiki recommendations in every linked boss page.
   No hardcoded equipment, skills, buffs or invented stats. */
(function(){
'use strict';
const CLASSES={Guerriero:'warrior',Ninja:'ninja',Sura:'sura',Sciamano:'shaman'};
const esc=x=>String(x??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const norm=value=>String(value||'').trim().replace(/’/g,"'").toLowerCase();
function section(source,label){
 return [...(source?.querySelectorAll('section')||[])].find(s=>[...s.querySelectorAll(':scope > h2,:scope > h3')].some(el=>norm(el.textContent)===norm(label)))||null;
}
function mainGear(source,cls){
 const gear=source?.querySelector('.wk-vz--gear'),index=Object.keys(CLASSES).indexOf(cls);
 if(!gear)return '';
 const panel=gear.querySelector('[data-panel="'+Math.max(0,index)+'"]');
 const blocks=panel?.querySelector('.wk-panels');
 if(!blocks)return '<p class="vzw-small">Tavole equipaggiamento non presenti in questa scheda.</p>';
 return '<div class="vzw-gear-boards">'+blocks.outerHTML+'</div>';
}
function alchemy(source){
 const sectionEl=source?.querySelector('.wk-alch');
 if(!sectionEl)return '<p class="vzw-small">La scheda di questo dungeon non prevede un set di alchimia specificato.</p>';
 const row=sectionEl.querySelector('.wk-alch__row');
 return row?'<div class="vzw-alchemy-row">'+row.outerHTML+'</div>':'<p class="vzw-small">Alchimia non disponibile.</p>';
}
function skills(source,cls){
 const area=section(source,'Abilità consigliate');
 if(!area)return '';
 const tables=[...area.querySelectorAll('table')],clsLabel=cls+' · Abilità del personaggio';
 const get=key=>tables.find(table=>
  [...table.querySelectorAll('thead th')].some(th=>norm(th.textContent).includes(norm(key))));
 const primary=get(clsLabel),mainWarrior=get('Guerriero · Abilità del personaggio');
 const buffs=get('Abilità di Buffi'),passives=get('Abilità passive');
 const pet=get("Abilità dell'animale"),mount=get('Abilità della cavalcatura');
 const tile=(title,t,help='')=>'<div class="vzw-skill-card"><h4>'+esc(title)+'</h4>'+
  (t?'<div class="vzw-source-table">'+t.outerHTML+'</div>':'<p class="vzw-small">'+esc(help||'Valori non presenti in questa scheda Wiki.')+'</p>')+'</div>';
 return '<div class="vzw-skill-grid">'+
  tile('Abilità principali · '+cls,primary,
    cls==='Guerriero'?'La Wiki non indica abilità principali per questo boss.':
    'Questa scheda dungeon riporta abilità principali soltanto per Guerriero. Non sono stati inventati livelli per '+cls+'.')+
  tile('Buffi',buffs)+tile('Abilità passive',passives)+tile('Pet · abilità',pet)+tile('Cavalcatura · abilità',mount)+
  '</div>'+(cls!=='Guerriero'&&mainWarrior?'<p class="vzw-small">I livelli delle abilità principali di Guerriero sono documentati nella Wiki originale, ma non vengono applicati a '+esc(cls)+'.</p>':'');
}
function consumables(source){
 const area=section(source,'Consumabili e potenziamenti consigliati');
 const table=area?.querySelector('table');
 return table?'<div class="vzw-consumable-table">'+table.outerHTML+'</div>':
  '<p class="vzw-small">La pagina dungeon non riporta un elenco di consumabili verificato.</p>';
}
function bonuses(source){
 const area=section(source,'Bonus totali consigliati');
 const table=area?.querySelector('table');
 return table?'<div class="vzw-bonus-source">'+table.outerHTML+'</div>':
  '<p class="vzw-small">Questa scheda non riporta obiettivi numerici.</p>';
}
function render(source,cls,name,href){
 if(!source)return '';
 const current=CLASSES[cls]?cls:'Guerriero';
 return '<section class="vzw-boss-advice" aria-label="Preparazione ufficiale Wiki per questo boss">'+
  '<div class="vzw-advice-heading"><span class="vzw-overline">DALLA WIKI VERZUM · PREPARAZIONE BOSS</span>'+
   '<h3>Equipaggiamento, alchimia e abilità per '+esc(name)+'</h3>'+
   '<p>Questa scheda riproduce le raccomandazioni specifiche del dungeon; non un equipaggiamento generico.</p></div>'+
  '<div class="vzw-class-tabs" role="group" aria-label="Seleziona la classe">'+
   Object.keys(CLASSES).map(key=>'<button type="button" data-vzw-class="'+esc(key)+'" aria-pressed="'+String(current===key)+'"'+(current===key?' class="is-selected"':'')+'>'+esc(key)+'</button>').join('')+'</div>'+
  '<div class="vzw-advice-grid"><div class="vzw-advice-part vzw-advice-part--gear"><h4>Equipaggiamento consigliato · '+esc(current)+'</h4>'+
   mainGear(source,current)+'</div><div class="vzw-advice-part vzw-advice-part--alchemy"><h4>Alchimia</h4>'+alchemy(source)+'</div></div>'+
  '<div class="vzw-advice-part"><h4>Bonus complessivi consigliati</h4>'+bonuses(source)+'</div>'+
  '<div class="vzw-advice-part"><h4>Skill primarie, passive, Buffi, Pet e cavalcatura</h4>'+skills(source,current)+'</div>'+
  '<div class="vzw-advice-part"><h4>Booster, consumabili e potenziamenti</h4>'+consumables(source)+'</div>'+
  '<p class="vzw-advice-source"><a href="#'+esc(href)+'">Apri la scheda dungeon con i dati originali</a> · I valori consigliati della Wiki non garantiscono il successo contro il boss.</p>'+
 '</section>';
}
window.VERZUM_BOSS_RECOMMENDATIONS=Object.freeze({render,classes:CLASSES});
})();