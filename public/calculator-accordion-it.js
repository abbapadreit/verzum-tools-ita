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
// Revisione terminologica delle schermate Gaya, Pet, Cavalcature, Costumi e Abilita'.
Object.assign(IT,{
 'Piața Gaya':'Mercato Gaya','Calculator Gaya':'Calcolatore Gaya',
 'Fabricare Gaya':'Creazione Gaya','Câți Gaya vrei':'Quantità di Gaya',
 'Yang NPC total':'Yang NPC totali','lucioase + bucăți':'pietre + frammenti',
 'completează prețurile':'inserisci i prezzi',
 'Poți face cel mult 999 de bucăți odată în fereastra pieței.':
  'Nella finestra del mercato puoi creare al massimo 999 unità per volta.',
 'Magazin permanent':'Negozio permanente','Magazin zilnic (oferta din wiki)':'Negozio giornaliero (offerte della Wiki)',
 'Obiect':'Oggetto','Cost în yang':'Costo in Yang','Preț piață':'Prezzo di mercato',
 'Sistemul de peți':'Sistema pet','Calculator Pet':'Calcolatore pet',
 'Nivel & evoluție':'Livello ed evoluzione','De la nivelul':'Dal livello',
 'Metine (aprox.)':'Metin (circa)','pentru EXP, cu petul invocat':'per EXP, con il pet evocato',
 'Materiale nivel':'Materiali di livello','Tipul petului':'Tipo di pet',
 'cu pity':'con garanzia','De la tipul':'Dal tipo',
 'Globuri (alegerea ta)':'Sfere (scelta personale)',
 'după eșecurile alese':'con i fallimenti selezionati',
 'Cel mai bun caz':'Scenario migliore','fără niciun eșec':'senza fallimenti',
 'Cel mai rău caz (pity)':'Scenario peggiore (garanzia)',
 'reușită garantată':'successo garantito','Glob':'Sfera',
 'Globuri':'Sfere','garantat':'garantito','Globuri necesare':'Sfere necessarie',
 'Abilități':'Abilità','nivel 0 = blocată':'livello 0 = bloccata',
 'Deblocare':'Sblocco','Sistemul de Mount':'Sistema cavalcature',
 'Calculator Mount':'Calcolatore cavalcature',
 'Medalii și evoluții pentru nivelurile 1–30, plus costul abilităților de mount.':
  'Medaglie ed evoluzioni per i livelli 1–30, con i costi delle abilità delle cavalcature.',
 'Evoluții':'Evoluzioni','Deblochează':'Sblocca',
 'Bonus colecție aspecte':'Bonus della collezione costumi',
 'Colecție':'Collezione','Valoare atac (PvM)':'Valore attacco (PvM)',
 '1 aspect':'1 costume','Aspecte de pet':'Costumi pet',
 'Selectează tot':'Seleziona tutti','Golește':'Svuota',
 'Bonusuri':'Bonus','Total pentru selecție':'Totale selezione',
 'Ce ai adăugat':'Elementi aggiunti','Copiază lista de materiale':'Copia elenco materiali',
 'Toate materialele':'Tutti i materiali',
 'Planificatorul e gol. Apasă „+ Planificator” în oricare calculator.':
  'Il pianificatore è vuoto. Seleziona «+ Pianificatore» da un calcolatore.',
 'Pet nivel':'Livello pet','Pet tip':'Tipo pet',
 'Mount nivel':'Livello cavalcatura','nimic selectat':'nessuna selezione',
 'Upgrade iteme':'Potenziamento oggetti',
 'Pet, mount & costume':'Pet, cavalcature e costumi',
 'Preț salvat':'Prezzo salvato','Preț invalid':'Prezzo non valido',
 'Prețuri șterse':'Prezzi cancellati','Copiat!':'Copiato!',
 'Copiază manual':'Copia manualmente','Text invalid':'Testo non valido',
 'Calculator skill-uri':'Calcolatore abilità',
 'Calculator pasive':'Calcolatore abilità passive',
 'Sistem abilități':'Sistema abilità','Sistem pasive':'Sistema abilità passive',
 'Cărți de abilitate':'Libri abilità','Abilități pasive':'Abilità passive',
 'Pietre spirituale':'Pietre spirituali','Citiri':'Letture',
 'Așteptare':'Attesa','Cost estimat':'Costo stimato',
 'Echipament':'Equipaggiamento','Putere împotriva monștrilor':'Potenza contro mostri',
 'Șansă critică':'Possibilità di colpo critico',
 'Putere împotriva Metinelor':'Potenza contro Metin',
 'Putere împotriva semioamenilor':'Potenza contro mezziuomini',
 'Blocare corp la corp':'Blocco attacchi corpo a corpo',
 'Putere împotriva lui Razador și Nemere':'Potenza contro Razador e Nemere',
 'Putere magică și corp la corp':'Potenza magica e fisica',
 'Șansă de penetrare':'Possibilità di colpo trafiggente',
 'Putere împotriva boșilor':'Potenza contro boss'
});
Object.assign(IT,{
 "Abilitățile clasei": "Abilità della classe",
 "Alege skill-ul": "Scegli l'abilità",
 "Alege abilitatea": "Scegli l'abilità",
 "Calculator skill-uri": "Calcolatore abilità",
 "Alege clasa și skill-ul, apoi intervalul (M1 → P). Vezi câte cărți și Pietre ale Sufletului îți trebuie, plus timpul de așteptare dintre citiri.": "Scegli classe, abilità e intervallo da M1 a P. Il calcolatore mostra libri, Pietre delle Anime e tempi di attesa necessari.",
 "Grupa 1": "Gruppo 1",
 "Grupa 2": "Gruppo 2",
 "Pietre ale Sufletului": "Pietre delle Anime",
 "Piatra Sufletului": "Pietra delle Anime",
 "Pietre spirituale": "Pietre delle Anime",
 "Citit Concentrat": "Lettura Concentrata",
 "Citit Concentrat la fiecare citire": "Lettura Concentrata a ogni lettura",
 "Pergamentul Exorcizării (fără așteptare)": "Papiro dell'esorcismo (senza attesa)",
 "Boabe Zen": "Fagioli Zen",
 "Cărți / Pietre": "Libri / Pietre",
 "citiri în total": "letture totali",
 "Citiri reușite": "Letture riuscite",
 "Eșecuri / Pietre folosite": "Fallimenti / Pietre utilizzate",
 "Consum": "Consumo",
 "Efectele skill-ului": "Effetti dell'abilità",
 "Valori din wiki pentru nivelul 120 cu 200 la statusul principal.": "Valori della Wiki per il livello 120 con 200 punti nella statistica principale.",
 "Cu Pergamentul Exorcizării nu aștepți între citiri.": "Con il Papiro dell'esorcismo non devi attendere tra le letture.",
 "Maestru (M):": "Maestro (M):",
 "Mare maestru (G):": "Gran Maestro (G):",
 "Maestru": "Maestro",
 "Mare maestru": "Gran Maestro",
 "Normal": "Normale",
 "Grad": "Grado",
 "Abilități pasive": "Abilità passive",
 "Calculator pasive": "Calcolatore abilità passive",
 "Conducere": "Guida",
 "Războinic curajos": "Guerriero coraggioso",
 "Războinicul zeului dragon": "Guerriero del Dio Drago",
 "Campionul temnițelor": "Campione dei sotterranei",
 "Conducere, Războinic curajos, Războinicul zeului dragon și Campionul temnițelor: câte cărți și obiecte ajutătoare îți trebuie de la un nivel la altul.": "Guida, Guerriero coraggioso, Guerriero del Dio Drago e Campione dei sotterranei: calcola libri e oggetti di supporto per ogni avanzamento.",
 "Cărțile se fac în Magazinul de abilități (clic dreapta pe Pagina Cărţii Abilităţii) din Carte de Abilitate Pasivă (M/G/P) + pagini.": "I libri passivi si creano nel Negozio delle abilità usando Libri Abilità Passiva (M/G/P) e pagine.",
 "Le cumpăr": "Li acquisto",
 "Le fac": "Li creo",
 "Ajutătoare (Pasiv)": "Oggetti di aiuto (Passivo)",
 "75 pagini": "75 pagine",
 "Normal + 25 pagini": "Normale + 25 pagine",
 "Normal + Citrin": "Normale + citrino",
 "Pergament (fără așteptare)": "Papiro (senza attesa)",
 "Citit Concentrat (Pasiv) obligatoriu": "Lettura Concentrata (Passivo) obbligatoria",
 "Ajutătoare": "Aiuti",
 "Citiri": "Letture",
 "fără așteptare": "senza attesa",
 "Bonusuri": "Bonus",
 "Din wiki:": "Dalla Wiki:"
});
const extraPatterns=[
 [/^Grupa (\\d+)$/,'Gruppo $1'],
 [/^(\\d+) citiri în total$/,'$1 letture totali'],
 [/^(\\d+) fără preț$/,'$1 senza prezzo'],

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
// I 147 nomi italiani e i materiali sono gia' verificati nel catalogo VERZUM.
const parentRelease=window.parent?.VERZUM_RELEASE||{};
const catalogNames=Object.fromEntries((parentRelease.catalog||[])
 .filter(it=>it.id&&it.name).map(it=>[String(it.id),it.name]));
const materialNames=Object.fromEntries(Object.entries(parentRelease.materialIds||{})
 .map(([name,id])=>[String(id),name]));
const matNames=Object.assign({},parentRelease.reference?.names||{},materialNames,
 window.parent?.VERZUM_MATERIAL_L10N?.it||{});
// Official IT names by stable item ID. Source: Italian VERZUM Wiki item pages.
// The pseudo book IDs (sb_class_index) do not have independent Wiki item pages:
// label them descriptively with the *verified* Wiki skill name.
const wikiLexicon=window.parent?.VERZUM_WIKI_ITALIAN_LEXICON||{};
const wikiItems=wikiLexicon.items||{};
const extraNames={};
if(typeof SKD!=='undefined'){
 for(const [cls,officialSkills] of Object.entries(wikiLexicon.skills||{})){
  const native=SKD.SK?.[cls];
  if(!Array.isArray(native)||native.length!==officialSkills.length)continue;
  native.forEach((skill,index)=>{
   const name=officialSkills[index];
   skill.n.it=name;
   extraNames['sk_'+cls+'_'+index]=name;
   extraNames['sb_'+cls+'_'+index]='Libro abilità: '+name;
   const effects=wikiLexicon.effects?.[cls]?.[index];
   if(Array.isArray(effects)&&effects.length===skill.t.length){
    skill.l.it=effects.slice();
   }
  });
 }
 const officialPassive=wikiLexicon.passive||[];
 if(Array.isArray(SKD.PAS)&&SKD.PAS.length===officialPassive.length){
  SKD.PAS.forEach((skill,index)=>{
   skill.n.it=officialPassive[index];
   const expected=wikiLexicon.passiveEffects?.[index];
   if(Array.isArray(expected)&&expected.length===skill.t.length){
    skill.t.forEach((table,tableIndex)=>{
     const labels=expected[tableIndex];
     if(Array.isArray(labels)&&labels.length===table.r.length)table.l.it=labels.slice();
    });
   }
  });
 }
}

const italianNames=Object.assign({},matNames,catalogNames,window.parent?.VERZUM_ITEM_L10N?.it||{},wikiItems,extraNames);
if(typeof NL!=='undefined')NL.it={
 i:italianNames,m:Object.assign({},matNames,wikiItems),
 a:(parentRelease.costumes||[]).map(item=>item.name)
};
window.addEventListener('message',e=>{
 if(e.origin!==location.origin||e.source!==parent)return;
 if(e.data?.type==='verzum-parent-language'&&['it','en','ro','hu'].includes(e.data.language)&&LANG!==e.data.language)
  setLang(e.data.language);
});
rFilters();
const initialParentLanguage=window.parent?.VERZUM_LOCALE?.lang||localStorage.getItem('verzum_lang')||'it';
setLang(['it','en','ro','hu'].includes(initialParentLanguage)?initialParentLanguage:'en');
// L'estensione arriva dopo il caricamento delle fisarmoniche e riutilizza
// i tooltip ufficiali della Wiki già disponibili nel documento principale.
if(!document.getElementById('verzum-upgrade-stats-style')){
 const css=document.createElement('link');css.id='verzum-upgrade-stats-style';
 css.rel='stylesheet';css.href='calculator-upgrade-stats.css';document.head.appendChild(css);
}
if(!document.getElementById('verzum-upgrade-stats-script')){
 const script=document.createElement('script');script.id='verzum-upgrade-stats-script';
 script.src='calculator-upgrade-stats.js';script.defer=true;document.body.appendChild(script);
}
})();