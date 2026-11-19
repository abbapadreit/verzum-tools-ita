/* VERZUM Tools ITA — selettore lingua IT/EN/RO/HU, localizzazione progressiva dei testi dell'app. */
(function installI18n(){
 "use strict";
 const langs=[
  {id:"it",code:"IT",label:"Italiano",flag:"🇮🇹"},
  {id:"en",code:"EN",label:"English",flag:"🇬🇧"},
  {id:"ro",code:"RO",label:"Română",flag:"🇷🇴"},
  {id:"hu",code:"HU",label:"Magyar",flag:"🇭🇺"},
  ...(window.VERZUM_WORLD_L10N?.languages||[])
 ];
 const translations={
 "STRUMENTI DELLA GILDA":["GUILD TOOLS","UNELTELE BRESLEI","CÉHES ESZKÖZÖK"],
 "Potenziamenti":["Upgrades","Îmbunătățiri","Fejlesztés"],
 "Guida 1–75":["Guide 1–75","Ghid 1–75","Útmutató 1–75"],
 "Guida ai livelli 1–75":["Leveling guide 1–75","Ghid de niveluri 1–75","Szintlépési útmutató 1–75"],
 "Gaya":["Gaya","Gaya","Gaya"],
 "Pet":["Pet","Animal de companie","Kisállat"],
 "Cavalcature":["Mounts","Mounturi","Hátasok"],
 "Costumi pet":["Pet costumes","Costume pet","Kisállat jelmezek"],
 "Abilità":["Skills","Abilități","Képességek"],
 "Abilità passive":["Passive skills","Abilități pasive","Passzív képességek"],
 "Pianificatore":["Planner","Planificator","Tervező"],
 "Prezzi materiali":["Material prices","Prețuri materiale","Anyagárak"],
 "Dati di calcolo":["Calculator data","Date de calcul","Számítási adatok"],
 "Personalizza":["Customize","Personalizează","Testreszabás"],
 "✓ Fine personalizzazione":["✓ Finish customizing","✓ Terminat","✓ Testreszabás kész"],
 "Esporta configurazione":["Export settings","Exportă configurația","Beállítások exportálása"],
 "STRUMENTI PER I MEMBRI DELLA GILDA":["TOOLS FOR GUILD MEMBERS","UNELTE PENTRU MEMBRII BRESLEI","ESZKÖZÖK A CÉHTAGOKNAK"],
 "Calcolatore potenziamenti":["Upgrade calculator","Calculator îmbunătățiri","Fejlesztési kalkulátor"],
 "Mercato e creazione Gaya":["Gaya market and crafting","Piață și creare Gaya","Gaya piac és készítés"],
 "Calcolatore pet":["Pet calculator","Calculator pet","Kisállat kalkulátor"],
 "Calcolatore cavalcature":["Mount calculator","Calculator mounturi","Hátas kalkulátor"],
 "Collezione costumi pet":["Pet costume collection","Colecția costumelor pet","Kisállat jelmezgyűjtemény"],
 "Pianificatore abilità":["Skill planner","Planificator abilități","Képességtervező"],
 "Calcolatore passive":["Passive skill calculator","Calculator abilități pasive","Passzív képesség kalkulátor"],
 "Pianificatore della gilda":["Guild planner","Planificatorul breslei","Céhtervező"],
 "Listino dei materiali":["Materials price list","Lista prețurilor materialelor","Anyagárlista"],
 "Gestione dei dati VERZUM":["Manage VERZUM data","Gestionare date VERZUM","VERZUM adatok kezelése"],
 "POTENZIAMENTI":["UPGRADES","ÎMBUNĂTĂȚIRI","FEJLESZTÉS"],
 "CAVALCATURE":["MOUNTS","MOUNTURI","HÁTASOK"],
 "COSTUMI PET":["PET COSTUMES","COSTUME PET","KISÁLLAT JELMEZEK"],
 "ABILITÀ":["SKILLS","ABILITĂȚI","KÉPESSÉGEK"],
 "ABILITÀ PASSIVE":["PASSIVE SKILLS","ABILITĂȚI PASIVE","PASSZÍV KÉPESSÉGEK"],
 "PIANIFICATORE":["PLANNER","PLANIFICATOR","TERVEZŐ"],
 "PREZZI MATERIALI":["MATERIAL PRICES","PREȚURI MATERIALE","ANYAGÁRAK"],
 "DATI DI CALCOLO":["CALCULATOR DATA","DATE DE CALCUL","SZÁMÍTÁSI ADATOK"],
 "Seleziona oggetto":["Select item","Selectează obiect","Tárgy kiválasztása"],
 "Oggetti disponibili":["Available items","Obiecte disponibile","Elérhető tárgyak"],
 "Potenziamento e costi":["Upgrade and costs","Îmbunătățire și costuri","Fejlesztés és költségek"],
 "Materiali necessari":["Required materials","Materiale necesare","Szükséges anyagok"],
 "RIEPILOGO":["SUMMARY","REZUMAT","ÖSSZESÍTÉS"],
 "CATALOGO":["CATALOG","CATALOG","KATALÓGUS"],
 "CLASSE":["CLASS","CLASĂ","KASZT"],
 "EQUIPAGGIAMENTO":["EQUIPMENT","ECHIPAMENT","FELSZERELÉS"],
 "Tutte":["All","Toate","Összes"],
 "Tutti":["All","Toate","Összes"],
 "Guerriero":["Warrior","Războinic","Harcos"],
 "Ninja":["Ninja","Ninja","Nindzsa"],
 "Sura":["Sura","Sura","Sura"],
 "Sciamano":["Shaman","Șaman","Sámán"],
 "Arma":["Weapon","Armă","Fegyver"],
 "Armatura":["Armor","Armură","Páncél"],
 "Elmo":["Helmet","Coif","Sisak"],
 "Scudo":["Shield","Scut","Pajzs"],
 "Orecchini":["Earrings","Cercei","Fülbevaló"],
 "Bracciale":["Bracelet","Brățară","Karkötő"],
 "Collana":["Necklace","Colier","Nyaklánc"],
 "Scarpe":["Shoes","Încălțăminte","Cipők"],
 "Cintura":["Belt","Curea","Öv"],
 "Talismano":["Talisman","Talisman","Talizmán"],
 "Da +":["From +","De la +","Ettől +"],
 "A +":["To +","Până la +","Eddig +"],
 "Fallimenti predefiniti per passo":["Default failures per step","Eșecuri implicite per pas","Alapértelmezett hibák lépésenként"],
 "Yang per tentativi":["Yang for attempts","Yang pentru încercări","Próbálkozások yang költsége"],
 "Materiali stimati":["Estimated materials","Materiale estimate","Becsült anyagköltség"],
 "Costo complessivo":["Total cost","Cost total","Összköltség"],
 "Successo al primo tentativo":["First-try success","Șansă din prima încercare","Siker első próbára"],
 "Prodotto delle probabilità configurate":["Product of configured chances","Produsul probabilităților configurate","Beállított esélyek szorzata"],
 "Scenario rapido (passi non sicuri):":["Quick scenario (uncertain steps):","Scenariu rapid (pași nesiguri):","Gyors forgatókönyv (bizonytalan lépések):"],
 "Nessun fallimento":["No failures","Fără eșec","Nincs sikertelenség"],
 "fallimenti":["failures","eșecuri","sikertelen próbák"],
 "Fallimenti":["Failures","Eșecuri","Sikertelen próbák"],
 "Passo":["Step","Pas","Lépés"],
 "Successo":["Success","Succes","Siker"],
 "Yang":["Yang","Yang","Yang"],
 "Materiali":["Materials","Materiale","Anyagok"],
 "Totale":["Total","Total","Összesen"],
 "Materiale":["Material","Material","Anyag"],
 "Quantità":["Quantity","Cantitate","Mennyiség"],
 "Prezzo unitario":["Unit price","Preț unitar","Egységár"],
 "Prezzo":["Price","Preț","Ár"],
 "Nessun oggetto in questa categoria.":["No items in this category.","Niciun obiect în această categorie.","Nincs tárgy ebben a kategóriában."],
 "Creazione Gaya":["Craft Gaya","Creare Gaya","Gaya készítés"],
 "Confronto mercato":["Market comparison","Comparație piață","Piaci összehasonlítás"],
 "Quantità di Gaya":["Gaya quantity","Cantitate Gaya","Gaya mennyiség"],
 "Materiale A":["Material A","Material A","A anyag"],
 "Materiale B":["Material B","Material B","B anyag"],
 "Quantità materiale A":["Material A amount","Cantitate material A","A anyag mennyisége"],
 "Quantità materiale B":["Material B amount","Cantitate material B","B anyag mennyisége"],
 "Tariffa NPC per Gaya":["NPC fee per Gaya","Taxă NPC per Gaya","NPC díj Gayánként"],
 "Costo 1 Gaya":["Cost of 1 Gaya","Cost 1 Gaya","1 Gaya költsége"],
 "Costo totale":["Total cost","Cost total","Összköltség"],
 "Offerta":["Offer","Ofertă","Ajánlat"],
 "Gaya richiesti":["Gaya required","Gaya necesar","Szükséges Gaya"],
 "Prezzo di mercato":["Market price","Preț de piață","Piaci ár"],
 "Differenza stimata":["Estimated difference","Diferență estimată","Becsült különbség"],
 "Nome nuova offerta":["New offer name","Nume ofertă nouă","Új ajánlat neve"],
 "Costo in Gaya":["Cost in Gaya","Cost în Gaya","Költség Gayában"],
 "Prezzo mercato Yang":["Market price in Yang","Preț de piață în Yang","Piaci ár yangban"],
 "Aggiungi offerta":["Add offer","Adaugă ofertă","Ajánlat hozzáadása"],
 "Livelli ed esperienza":["Levels and experience","Niveluri și experiență","Szintek és tapasztalat"],
 "Evoluzione e abilità":["Evolution and skills","Evoluție și abilități","Fejlődés és képességek"],
 "Da livello":["From level","De la nivel","Szinttől"],
 "A livello":["To level","Până la nivel","Szintig"],
 "Dal livello":["From level","De la nivelul","Szinttől"],
 "Al livello":["To level","Până la nivelul","Szintig"],
 "EXP richiesta per livello (media)":["EXP required per level (average)","EXP necesar per nivel (medie)","EXP szintenként (átlag)"],
 "EXP per Metin":["EXP per Metin","EXP per Metin","EXP Metinenként"],
 "Livelli":["Levels","Niveluri","Szintek"],
 "EXP stimate":["Estimated EXP","EXP estimat","Becsült EXP"],
 "Metin stimati":["Estimated Metins","Metine estimate","Becsült metinek"],
 "Dal tipo pet":["From pet type","De la tip pet","Kisállattípustól"],
 "Al tipo pet":["To pet type","Până la tip pet","Kisállattípusig"],
 "Tentativi prima della garanzia (pity)":["Attempts until guaranteed success (pity)","Încercări până la garanție (pity)","Próbák a garantált sikerig (pity)"],
 "Fallimenti previsti per passaggio":["Expected failures per step","Eșecuri prevăzute pe pas","Várható hibák lépésenként"],
 "Oggetto per tentativo":["Item per attempt","Obiect per încercare","Tárgy próbálkozásonként"],
 "Abilità da apprendere":["Skills to learn","Abilități de învățat","Tanulandó képességek"],
 "Yang per abilità":["Yang per skill","Yang per abilitate","Yang képességenként"],
 "Sfere stimate":["Estimated orbs","Sfere estimate","Becsült gömbök"],
 "Costo stimato":["Estimated cost","Cost estimat","Becsült költség"],
 "Livelli della cavalcatura":["Mount levels","Niveluri mount","Hátas szintek"],
 "Abilità e costo":["Skills and cost","Abilități și cost","Képességek és költség"],
 "Medaglie per livello":["Medals per level","Medalii per nivel","Érmek szintenként"],
 "Tipo medaglia":["Medal type","Tip medalie","Érem típusa"],
 "Evoluzione ogni N livelli":["Evolution every N levels","Evoluție la fiecare N niveluri","Fejlődés N szintenként"],
 "Yang per evoluzione":["Yang per evolution","Yang per evoluție","Yang fejlődésenként"],
 "Medaglie":["Medals","Medalii","Érmek"],
 "Evoluzioni":["Evolutions","Evoluții","Fejlődések"],
 "Abilità":["Skills","Abilități","Képességek"],
 "Libri per abilità":["Books per skill","Cărți per abilitate","Könyvek képességenként"],
 "Libro":["Book","Carte","Könyv"],
 "Yang NPC":["NPC Yang","Yang NPC","NPC Yang"],
 "Seleziona costumi":["Select costumes","Selectează costume","Jelmezek kiválasztása"],
 "Totale costumi":["Costume total","Total costume","Jelmezek összesen"],
 "Seleziona tutti":["Select all","Selectează toate","Összes kijelölése"],
 "Deseleziona":["Clear selection","Deselectează","Kijelölés törlése"],
 "Selezionati":["Selected","Selectate","Kiválasztva"],
 "Costo materiali":["Materials cost","Cost materiale","Anyagköltség"],
 "Impostazioni abilità":["Skill settings","Setări abilități","Képesség beállításai"],
 "Libri e letture":["Books and readings","Cărți și citiri","Könyvek és olvasások"],
 "Livello iniziale (indice)":["Starting level (index)","Nivel inițial (indice)","Kezdő szint (index)"],
 "Livello finale (indice)":["Final level (index)","Nivel final (indice)","Végső szint (index)"],
 "Letture riuscite per livello":["Successful readings per level","Citiri reușite per nivel","Sikeres olvasások szintenként"],
 "Fallimenti previsti":["Expected failures","Eșecuri estimate","Várható hibák"],
 "Attesa tra letture (ore)":["Wait between readings (hours)","Pauză între citiri (ore)","Várakozás olvasások között (óra)"],
 "Libro abilità":["Skill book","Carte abilitate","Képességkönyv"],
 "Pietra spirituale":["Soul stone","Piatra sufletului","Lélekkő"],
 "Letture totali":["Total readings","Total citiri","Összes olvasás"],
 "Pietre previste":["Soul stones needed","Pietre necesare","Szükséges lélekkövek"],
 "Attesa":["Wait time","Așteptare","Várakozás"],
 "Configurazione passiva":["Passive configuration","Configurare pasivă","Passzív beállítások"],
 "Materiali e tempo":["Materials and time","Materiale și timp","Anyagok és idő"],
 "Passiva":["Passive","Pasivă","Passzív"],
 "Indice iniziale":["Starting index","Indice inițial","Kezdő index"],
 "Indice finale":["Ending index","Indice final","Végső index"],
 "Pagine per libro":["Pages per book","Pagini per carte","Oldalak könyvenként"],
 "Attesa fra letture (ore)":["Wait between readings (hours)","Așteptare între citiri (ore)","Várakozás olvasások között (óra)"],
 "Libro passiva":["Passive book","Carte pasivă","Passzív könyv"],
 "Pagine":["Pages","Pagini","Oldalak"],
 "Letture":["Readings","Citiri","Olvasások"],
 "Tempo attesa":["Waiting time","Timp de așteptare","Várakozási idő"],
 "COSTUMI":["COSTUMES","COSTUME","JELMEZEK"],
 "Rimuovi":["Remove","Elimină","Eltávolítás"],
 "Svuota":["Clear","Golește","Ürítés"],
 "Copia":["Copy","Copiază","Másolás"],
 "Esporta":["Export","Exportă","Export"],
 "Importa":["Import","Importă","Importálás"],
 "Prezzo materiale":["Material price","Preț material","Anyag ára"],
 "Esporta configurazione":["Export settings","Exportă configurația","Beállítások exportálása"],
 "Ripristina disposizione":["Reset layout","Resetează aspectul","Elrendezés visszaállítása"],
 "Fine":["Done","Gata","Kész"],
 "Fine personalizzazione":["Finish customizing","Terminare personalizare","Testreszabás vége"],
 "Personalizzazione attiva":["Customization active","Personalizare activă","Testreszabás aktív"],
 "Nessun oggetto":["No item","Niciun obiect","Nincs tárgy"],
 "Materiali necessari":["Required materials","Materiale necesare","Szükséges anyagok"],
 "Cerca un oggetto":["Search an item","Caută un obiect","Tárgy keresése"],
 "Aggiungi offerta":["Add offer","Adaugă ofertă","Ajánlat hozzáadása"],
 "ore":["hours","ore","óra"],
 "oggetti":["items","obiecte","tárgy"],
 "icone importate":["imported icons","pictograme importate","importált ikonok"]
 };
 const table=Object.create(null);
 for(const [it,all] of Object.entries(translations))table[it]={en:all[0],ro:all[1],hu:all[2]};
 // Dizionario ro/en → italiano condiviso anche con il calcolatore originale incorporato.
 // Le categorie plurali della schermata Potenziamenti sono gestite separatamente.
 window.VERZUM_RO_TO_IT=Object.fromEntries(Object.entries(translations).map(([it,values])=>[values[1],it]));
 window.VERZUM_EN_TO_IT=Object.fromEntries(Object.entries(translations).map(([it,values])=>[values[0],it]));
 function syncNativeLocale(){
   const frame=document.querySelector('iframe.native-calculator-frame');
   if(frame?.contentWindow)frame.contentWindow.postMessage({type:'verzum-parent-language',language:['it','en','ro','hu'].includes(current)?current:'en'},location.origin);
 }

 let current=localStorage.getItem('verzum_lang')||'it';
 const queryLang=new URLSearchParams(location.search).get('lang');
 if(queryLang&&langs.some(l=>l.id===queryLang))current=queryLang;
 if(!langs.some(l=>l.id===current))current='it';
 const originals=new WeakMap();
 const origAttr=new WeakMap();
 let scheduled=false,observer;
 function label(text){
   const s=String(text).trim();if(!s)return null;
   if(table[s]?.[current])return table[s][current];
   if(window.VERZUM_WORLD_L10N?.translations?.[s]?.[current])return window.VERZUM_WORLD_L10N.translations[s][current];
   const itemId=window.VERZUM_RELEASE?.catalog?.find?.(x=>x.name===s)?.id;
   const i18n=window.VERZUM_ITEM_L10N?.[current];
   if(itemId&&i18n?.[itemId])return i18n[itemId];
   const ids=window.VERZUM_RELEASE?.materialIds||{};
   const mid=ids[s];
   const mats=window.VERZUM_MATERIAL_L10N?.[current];
   if(mid&&mats?.[mid])return mats[mid];
   let m=s.match(/^Cerca tra (\d+) oggetti\.\.\.$/);
   if(m)return ({en:`Search ${m[1]} items...`,ro:`Caută în ${m[1]} obiecte...`,hu:`Keresés ${m[1]} tárgy között...`})[current];
   m=s.match(/^(\d+) oggetti · (\d+) icone importate$/);
   if(m)return ({en:`${m[1]} items · ${m[2]} imported icons`,ro:`${m[1]} obiecte · ${m[2]} pictograme importate`,hu:`${m[1]} tárgy · ${m[2]} importált ikon`})[current];
   m=s.match(/^(\d+) fallimenti$/);
   if(m)return m[1]+' '+(table.fallimenti?.[current]||'fallimenti');
   m=s.match(/^([^·]+) · Lv\. (\d+) · (\+0 \/ \+\d+)$/);
   if(m){const kind=table[m[1].trim()]?.[current]||m[1].trim();return `${kind} · Lv. ${m[2]} · ${m[3]}`}
   return null;
 }
 function translateText(node){
   const p=node.parentElement;
   if(!p||p.closest('script,style,svg,textarea,code,.lang-switch'))return;
   let orig=originals.get(node);if(orig===undefined){orig=node.nodeValue;originals.set(node,orig)}
   const trim=orig.trim();
   if(!trim)return;
   const converted=current==='it'?null:label(trim);
   const target=converted===null?orig:orig.replace(trim,converted);
   if(node.nodeValue!==target)node.nodeValue=target;
 }
 function renderLanguages(){
   const element=document.querySelector('.sidebar-languages');
   if(!element)return;
   const complete=new Set(['it','en','ro','hu']);
   const groups=[
    ['Lingue attuali',langs.filter(l=>complete.has(l.id))],
    ['Europa',langs.filter(l=>!complete.has(l.id)&&!['ar','zh','ja','ko','hi','id'].includes(l.id))],
    ['Mondo',langs.filter(l=>['ar','zh','ja','ko','hi','id'].includes(l.id))]
   ];
   const options=groups.map(([title,items])=>'<optgroup label="'+title+'">'+items.map(l=>
    '<option value="'+l.id+'"'+(l.id===current?' selected':'')+'>'+l.flag+' '+l.label+(l.partial?' · beta':'')+'</option>').join('')+'</optgroup>').join('');
   const partial=!complete.has(current);
   const guidance={
    it:['Interfaccia disponibile. Le pagine originali della Wiki sono ancora in italiano.','Traduzione parziale: menu e Planner. Gli articoli Wiki non sono ancora tradotti integralmente.'],
    en:['Interface available. Original Wiki articles remain in Italian.','Partial translation: navigation and Planner. Wiki articles are not yet fully translated.'],
    ro:['Interfață disponibilă. Articolele originale Wiki rămân în italiană.','Traducere parțială: meniu și planificator. Articolele Wiki nu sunt încă traduse integral.'],
    hu:['A felület elérhető. Az eredeti Wiki-cikkek továbbra is olaszul vannak.','Részleges fordítás: menü és tervező. A Wiki-cikkek még nincsenek teljesen lefordítva.'],
    de:['Die Oberfläche ist verfügbar. Originale Wiki-Artikel bleiben auf Italienisch.','Teilweise übersetzt: Navigation und Planer. Wiki-Artikel sind noch nicht vollständig übersetzt.'],
    fr:['Interface disponible. Les articles originaux du Wiki restent en italien.','Traduction partielle : navigation et planificateur. Les articles du Wiki ne sont pas entièrement traduits.'],
    es:['Interfaz disponible. Los artículos originales de la Wiki siguen en italiano.','Traducción parcial: navegación y planificador. Los artículos de la Wiki aún no están completamente traducidos.'],
    pt:['Interface disponível. Os artigos originais da Wiki continuam em italiano.','Tradução parcial: navegação e planeador. Os artigos da Wiki ainda não estão totalmente traduzidos.'],
    'pt-br':['Interface disponível. Os artigos originais da Wiki permanecem em italiano.','Tradução parcial: navegação e planejador. Os artigos da Wiki ainda não estão totalmente traduzidos.'],
    tr:['Arayüz kullanılabilir. Orijinal Wiki makaleleri hâlâ İtalyancadır.','Kısmi çeviri: gezinme ve planlayıcı. Wiki makaleleri henüz tamamen çevrilmedi.'],
    nl:['Interface beschikbaar. Originele Wiki-artikelen blijven Italiaans.','Gedeeltelijke vertaling: navigatie en planner. Wiki-artikelen zijn nog niet volledig vertaald.']
   };
   const status=(guidance[current]||guidance[current.split('-')[0]]||guidance.en)[partial?1:0];
   element.innerHTML='<div class="lang-switch lang-dropdown"><label for="vz-language-select"><span class="vz-lang-icon" aria-hidden="true">🌐</span> Lingua / Language</label>'+
    '<select id="vz-language-select" aria-label="Lingua del sito e del Planner">'+options+'</select>'+
    '<small class="vz-language-status" aria-live="polite">'+status+'</small></div>';
 }
 function translate(){
   observer?.disconnect();
   document.documentElement.lang=current;
   const root=document.querySelector('.app')||document.body;
   const walk=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
   let node;while((node=walk.nextNode()))translateText(node);
   root.querySelectorAll('input[placeholder],textarea[placeholder],button[aria-label],input[aria-label]').forEach(el=>{
      let old=origAttr.get(el);
      if(!old){old={placeholder:el.getAttribute('placeholder'),aria:el.getAttribute('aria-label')};origAttr.set(el,old)}
      for(const [attr,value] of [['placeholder',old.placeholder],['aria-label',old.aria]]){
       if(value===null)continue;
       const next=current==='it'?value:(label(value)||value);
       if(el.getAttribute(attr)!==next)el.setAttribute(attr,next);
      }
   });
   document.querySelectorAll('.lang-btn').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.setLang===current)));
   observer?.observe(root,{childList:true,characterData:true,subtree:true});
 }
 function schedule(){
  if(scheduled)return;scheduled=true;
  requestAnimationFrame(()=>{scheduled=false;translate()});
 }
 renderLanguages();
 const root=document.querySelector('.app')||document.body;
 observer=new MutationObserver(schedule);
 observer.observe(root,{childList:true,characterData:true,subtree:true});
 document.addEventListener('click',e=>{


 });
 function setLanguage(id){
   if(!langs.some(l=>l.id===id))return;
   current=id;
   try{localStorage.setItem('verzum_lang',id)}catch(_){}
   renderLanguages();schedule();syncNativeLocale();
   window.dispatchEvent(new CustomEvent('verzum:language-change',{detail:{lang:id,partial:!['it','en','ro','hu'].includes(id)}}));
 }
 document.addEventListener('change',e=>{
   if(e.target?.id==='vz-language-select')setLanguage(e.target.value);
 });

 window.VERZUM_LOCALE={get lang(){return current},change:setLanguage,t(s){return current==='it'?s:(label(s)||s)},get available(){return langs.map(l=>({...l}))},get partial(){return !['it','en','ro','hu'].includes(current)}};
 schedule();
})();
