/* VERZUM Tools — categorie dei potenziamenti a fisarmonica e localizzazione IT.
   Estensione non distruttiva: i dati, le formule e gli altri calcolatori non cambiano. */
(function(){
'use strict';
if(window.__verzumCategoryAccordion)return;
if(typeof DATA==='undefined'||typeof CATS==='undefined'||typeof S==='undefined'
   ||typeof rTiles!=='function'||typeof setLang!=='function')return;
window.__verzumCategoryAccordion=true;

const CATEGORY_IT={
 weapons:'Armi',armor:'Armature',helmet:'Elmi',shield:'Scudi',
 earrings:'Orecchini',bracelet:'Bracciali',necklace:'Collane',
 shoes:'Scarpe',belts:'Cinture',talisman:'Talismani'
};
const CLASS_IT={all:'Tutte le classi',warrior:'Guerriero',ninja:'Ninja',sura:'Sura',shaman:'Sciamano'};
const IT={
 'Arme':'Armi','Armură':'Armature','Coif':'Elmi','Scut':'Scudi',
 'Cercei':'Orecchini','Brățară':'Bracciali','Colier':'Collane',
 'Încălțăminte':'Scarpe','Curele':'Cinture','Talisman':'Talismani',
 'Toate':'Tutte','Toate clasele':'Tutte le classi',
 'Războinic':'Guerriero','Șaman':'Sciamano',
 'Îmbunătățire':'Potenziamenti','Îmbunătățire iteme':'Potenziamento oggetti',
 'Fierar · Arme · Echipament':'Fabbro · Armi · Equipaggiamento',
 'Alege itemul și nivelul. Vezi yang-ul și materialele pentru fiecare pas, apoi alege câte eșecuri vrei să iei în calcul la fiecare +.':
  'Scegli un oggetto e i livelli di potenziamento. Controlla Yang e materiali necessari per ogni passaggio e indica i fallimenti da considerare.',
 'Iteme':'Oggetti','Unelte':'Strumenti','Planificator':'Pianificatore',
 'Prețuri':'Prezzi','Prețuri materiale':'Prezzi materiali','Costume pet':'Costumi pet',
 'Caută item… (ex: Triton, Talisman)':'Cerca oggetto… (es. Tritone, Talismano)',
 'Niciun item găsit.':'Nessun oggetto trovato.','Nv. ':'Liv. ',
 'evoluție':'evoluzione','Evoluție':'Evoluzione','De la':'Da','Până la':'Fino a',
 '+ Planificator':'+ Pianificatore','Șansă':'Probabilità','Materiale necesare':'Materiali necessari',
 'Cant.':'Quantità','Preț/buc':'Prezzo/unità','Preț / buc':'Prezzo/unità',
 'Preț':'Prezzo','Prețul':'Il prezzo','preț':'prezzo','ex: 500k':'es. 500k',
 'Material':'Materiale','Materiale':'Materiali','Total materiale':'Totale materiali',
 'Valoare materiale':'Valore materiali','Cost total':'Costo totale',
 'Eșecuri luate în calcul':'Fallimenti considerati','eșecuri':'fallimenti',
 'Fără eșec':'Nessun fallimento','1 eșec':'1 fallimento','Eșecuri':'Fallimenti',
 'Scenariu rapid (toți pașii nesiguri):':'Scenario rapido (tutti i passaggi non garantiti):',
 'toate au preț':'tutti con prezzo','fără preț':'senza prezzo',
 'yang + materiale':'Yang + materiali','Pas':'Passaggio',
 'Materiale / încercare':'Materiali per tentativo','Cost pas':'Costo passaggio',
 'sigur':'garantito','doar yang':'solo Yang',
 'Cum se calculează:':'Come si calcola:',
 'Nu sunt necesare materiale.':'Non sono necessari materiali.',
 'Copiază':'Copia','Importă':'Importa','Șterge toate':'Elimina tutti',
 'Salvare / partajare':'Salva / condividi',
 'Scrie prețul de pe piață (merge 350k, 1.5kk, 2kkk). Toate calculatoarele folosesc aceste prețuri.':
  'Inserisci i prezzi di mercato (sono accettati 350k, 1.5kk e 2kkk). Tutti i calcolatori utilizzeranno questi valori.',
 'Copiază prețurile ca să le trimiți altcuiva, sau lipește o listă primită și apasă „Importă”.':
  'Copia il tuo listino per condividerlo oppure incolla un elenco ricevuto e seleziona «Importa».',
 'Adună tot ce vrei să faci (iteme, pet, mount, costume) și vezi totalul de yang și materiale.':
  'Riunisci potenziamenti, pet, cavalcature e costumi nel pianificatore per calcolare Yang e materiali totali.',
 'Adăugat în planificator':'Aggiunto al pianificatore',
 'Reușită':'Successo','Încercări':'Tentativi','încercări':'tentativi',
 'Materiale pentru':'Materiali per','Cumpără':'Acquista','Vinde':'Vendi',
 'Piață':'Mercato','Cost':'Costo','Creare':'Creazione','Ofertă':'Offerta',
 'Nivel':'Livello','Niveluri':'Livelli','Tip':'Tipo',
 'Durata':'Durata','Timp de așteptare':'Tempo di attesa',
 'Experiență':'Esperienza','Abilități':'Abilità','Abilitate':'Abilità',
 'Cărți':'Libri','Carte':'Libro','Medalii':'Medaglie','Medalie':'Medaglia',
 'Aspecte':'Aspetti','Costume':'Costumi','Selectate':'Selezionati',
 'Selectează toate':'Seleziona tutti','Deselectează':'Deseleziona',
 'Șterge':'Elimina','Total':'Totale',
 'Timp':'Tempo','Ore':'Ore','Zi':'Giorno','Zile':'Giorni',
 'Alege':'Scegli','Rămas':'Rimanente','Lipsește':'Manca',
 'Caută':'Cerca','Fierar':'Fabbro','Echipament':'Equipaggiamento',
 'Omoară':'Sconfiggi','După':'Dopo','după':'dopo',
 'toate':'tutti','din':'di','pentru':'per','fără':'senza',
 'Raritate':'Rarità','Selecție':'Selezione','Cumpărare':'Acquisto',
 'Pretul de piață':'Prezzo di mercato','Salvează':'Salva'
};
const extraPatterns=[
 [/^(\d+) eșec(?:uri)?$/,'$1 fallimenti'],
 [/^Materiale pentru (\d+) Gaya$/,'Materiali per $1 Gaya'],
 [/^pentru (\d+) Gaya$/,'per $1 Gaya'],
 [/^(\d+) din (\d+) selectate$/,'$1 di $2 selezionati'],
 [/^(\d+) materiale fără preț$/,'$1 materiali senza prezzo'],
 [/^(\d+) fără preț$/,'$1 senza prezzo'],
 [/^Total \((\d+) încercări\)$/,'Totale ($1 tentativi)'],
 [/^Nivel (\d+)$/,'Livello $1'],
 [/^Tip (\d+) → (\d+)$/,'Tipo $1 → $2'],
 [/^după (\d+) eșecuri$/,'dopo $1 fallimenti'],
 [/^Omoară (\d+) ×$/,'Sconfiggi $1 ×'],
 [/^Preț (.+)$/,'Prezzo: $1']
];

const nativeTx=tx;
tx=function(value){
 if(LANG!=='it')return nativeTx(value);
 const s=String(value),k=s.trim();
 if(!k)return s;
 const ro=window.parent?.VERZUM_RO_TO_IT||{};
 const en=window.parent?.VERZUM_EN_TO_IT||{};
 const mapped=IT[k]||ro[k]||(typeof TR!=='undefined'&&TR[k]&&en[TR[k].en])||null;
 if(mapped)return s.replace(k,mapped);
 for(const row of extraPatterns)if(row[0].test(k))return s.replace(k,k.replace(row[0],row[1]));
 return s;
};

const nativeSetLang=setLang;
setLang=function(next){
 if(next!=='it'){nativeSetLang(next);rFilters();rTiles();return}
 LANG='it';LOC='it-IT';
 try{localStorage.setItem('dt_lang','it')}catch(_){}
 document.documentElement.lang='it';
 document.querySelectorAll('.lang button').forEach(b=>b.classList.toggle('on',b.dataset.lang==='it'));
 route();
 trNode(document.body);
 rFilters();
 rTiles();
};

const oldFilters=rFilters;
rFilters=function(){
 oldFilters();
 const tabs=document.getElementById('catTabs');
 if(tabs){tabs.hidden=true;tabs.setAttribute('aria-hidden','true')}
 const classes=document.querySelectorAll('#clsTabs [data-cls]');
 if(LANG==='it')classes.forEach(el=>{
  const label=CLASS_IT[el.dataset.cls];
  if(label){const textNode=[...el.childNodes].find(n=>n.nodeType===3);if(textNode)textNode.nodeValue=label}
 });
};

const opened=new Set();
const escHtml=s=>String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
rTiles=function(){
 const tiles=document.getElementById('tiles');if(!tiles)return;
 S.cat='all'; // La selezione e' ora gestita dalle fisarmoniche, non dalle vecchie linguette.
 const q=norm(S.q||'');
 const matching=DATA.items.filter(i=>
  (S.cls==='all'||i.r.includes('all')||i.r.includes(S.cls))&&
  (!q||norm(i.n).includes(q)||norm(N(i.id)).includes(q))
 );
 let html='';
 CATS.forEach(([category,original])=>{
  const entries=matching.filter(i=>i.c===category).sort((a,b)=>a.lv-b.lv);
  if(!entries.length)return;
  const isOpen=!!q||opened.has(category);
  const label=LANG==='it'?(CATEGORY_IT[category]||original):nativeTx(original);
  html+='<div class="vz-accordion-group">';
  html+='<button type="button" class="vz-accordion-trigger" data-vz-acc="'+category+'" aria-controls="vz-accordion-'+category+'" aria-expanded="'+isOpen+'">';
  html+='<span class="vz-accordion-symbol" aria-hidden="true">'+(isOpen?'−':'+')+'</span>';
  html+='<span class="vz-accordion-label">'+escHtml(label)+'</span>';
  html+='<span class="vz-accordion-count">'+entries.length+'</span></button>';
  html+='<div class="vz-accordion-body" id="vz-accordion-'+category+'"'+(isOpen?'':' hidden')+'>';
  if(isOpen)entries.forEach(i=>{
   const raceNames=i.r.map(r=>LANG==='it'?(CLASS_IT[r]||r):nativeTx(RN[r]||r));
   html+='<div class="it '+(S.sel===i.id?'on':'')+'" data-id="'+escHtml(i.id)+'">';
   html+='<div class="ic '+(category==='weapons'||category==='armor'?'tall':'')+'">'+img(i.id)+'</div>';
   html+='<div><div class="nm" data-nt>'+escHtml(N(i.id))+'</div>';
   html+='<div class="mt">'+(LANG==='it'?'Liv. ':'Nv. ')+i.lv+' · '+escHtml(raceNames.join(', '))+' · +'+i.max+(i.evo?(LANG==='it'?' · evoluzione':' · evoluție'):'')+'</div></div></div>';
  });
  html+='</div></div>';
 });
 tiles.innerHTML=html||'<div class="empty">'+(LANG==='it'?'Nessun oggetto trovato.':'Niciun item găsit.')+'</div>';
};

document.addEventListener('click',e=>{
 const trigger=e.target.closest('[data-vz-acc]');
 if(!trigger)return;
 const category=trigger.dataset.vzAcc;
 if(opened.has(category))opened.delete(category);else opened.add(category);
 // Durante la ricerca le categorie con risultati restano temporaneamente aperte.
 rTiles();
},true);
const itIconNames=window.parent?.VERZUM_ITEM_L10N?.it||{};
const italianNames=Object.assign({},itIconNames);
const matNames=window.parent?.VERZUM_MATERIAL_L10N?.it||{};
Object.assign(italianNames,matNames);
if(typeof NL!=='undefined')NL.it={i:italianNames,m:matNames,a:[]};
window.addEventListener('message',e=>{
 if(e.origin!==location.origin||e.source!==parent)return;
 if(e.data?.type==='verzum-parent-language'&&['it','ro'].includes(e.data.language))
  setLang(e.data.language);
});
rFilters();
setLang(window.parent?.VERZUM_LOCALE?.lang||'it');
})();