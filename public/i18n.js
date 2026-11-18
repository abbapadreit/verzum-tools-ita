/* VERZUM Tools ITA — selettore lingua IT/EN/RO/HU, localizzazione progressiva dei testi dell'app. */
(function installI18n(){
 "use strict";
 const langs=[
  {id:"it",code:"IT",label:"Italiano"},
  {id:"en",code:"EN",label:"English"},
  {id:"ro",code:"RO",label:"Română"},
  {id:"hu",code:"HU",label:"Magyar"}
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
 window.VERZUM_HU_TO_IT=Object.fromEntries(Object.entries(translations).map(([it,values])=>[values[2],it]));
 window.VERZUM_TRANSLATIONS=table;
 function syncNativeLocale(){
   const frame=document.querySelector('iframe.native-calculator-frame');
   if(frame?.contentWindow)frame.contentWindow.postMessage({type:'verzum-parent-language',language:current},location.origin);
 }

 let current=localStorage.getItem('verzum_lang')||'it';
 const queryLang=new URLSearchParams(location.search).get('lang');
 if(queryLang&&langs.some(l=>l.id===queryLang))current=queryLang;
 if(!langs.some(l=>l.id===current))current='it';
 const originals=new WeakMap();
 const origAttr=new WeakMap();
 let scheduled=false,observer;
 const reverseLang=()=>({en:window.VERZUM_EN_TO_IT||{},ro:window.VERZUM_RO_TO_IT||{},hu:window.VERZUM_HU_TO_IT||{}});
 function normalized(text){
   const value=String(text||'').trim();
   if(table[value])return value;
   for(const dict of Object.values(reverseLang())){
     const it=dict[value];if(it&&table[it])return it;
   }
   return value;
 }
 let catalogSeen=null,itemIndex=new Map();
 function translatedItemName(raw,lang){
   const catalog=window.VERZUM_RELEASE?.catalog||[];
   if(!Array.isArray(catalog))return null;
   if(catalog!==catalogSeen){
     catalogSeen=catalog;itemIndex=new Map();
     const names=window.VERZUM_ITEM_L10N||{};
     for(const item of catalog){
       const id=String(item.id||''),italian=String(item.name||'');
       if(!italian)continue;
       const entries=[italian,...['en','ro','hu'].map(code=>names[code]?.[id]).filter(Boolean)];
       for(const label of entries)itemIndex.set(label,{italian,id});
     }
   }
   const item=itemIndex.get(raw);if(!item)return null;
   if(lang==='it')return item.italian;
   return window.VERZUM_ITEM_L10N?.[lang]?.[item.id]||item.italian;
 }
 function label(raw){
   const text=String(raw||'').trim();if(!text)return null;
   const it=normalized(text);
   if(current!=='it'&&table[text]&&reverseLang()[current]?.[text])return text;
   if(current==='it')return it!==text?it:(translatedItemName(text,'it')||null);
   if(table[it]?.[current])return table[it][current];
   const name=translatedItemName(text,current);if(name)return name;
   const patterns=[
     [/^Cerca tra (\d+) oggetti\.\.\.$/,{en:'Search $1 items...',ro:'Caută în $1 obiecte...',hu:'Keresés $1 tárgy között...'}],
     [/^(\d+) oggetti · (\d+) icone importate$/,{en:'$1 items · $2 imported icons',ro:'$1 obiecte · $2 pictograme importate',hu:'$1 tárgy · $2 importált ikon'}],
     [/^(\d+) fallimenti$/,{en:'$1 failures',ro:'$1 eșecuri',hu:'$1 sikertelen próba'}]
   ];
   for(const [pattern,options] of patterns){if(pattern.test(it))return it.replace(pattern,options[current])}
   return null;
 }
 function translateText(node){
   const p=node.parentElement;
   if(!p||p.closest('script,style,svg,textarea,code,.lang-switch,[data-no-translate]'))return;
   let state=originals.get(node);
   if(!state||node.nodeValue!==state.last){
     state={base:node.nodeValue,last:node.nodeValue};
     originals.set(node,state);
   }
   const text=state.base.trim();if(!text)return;
   const result=label(text);
   const next=result===null?state.base:state.base.replace(text,result);
   if(node.nodeValue!==next)node.nodeValue=next;
   state.last=next;
 }
 function renderLanguages(){
   for(const selector of ['.sidebar-languages','.header-languages']){
    const element=document.querySelector(selector);if(!element)continue;
    element.innerHTML='<div class="lang-switch" role="group" aria-label="Lingua">'+langs.map(l=>`<button type="button" class="lang-btn" data-set-lang="${l.id}" aria-label="${l.label}" aria-pressed="${l.id===current}"><img src="assets/flags/${l.id}.svg" alt="" width="23" height="15">${l.code}</button>`).join('')+'</div>';
   }
 }
 function translate(){
   observer?.disconnect();
   document.documentElement.lang=current;
   const root=document.querySelector('.app')||document.body;
   const walk=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
   let node;while((node=walk.nextNode()))translateText(node);
   root.querySelectorAll('input[placeholder],textarea[placeholder],[aria-label],[title]').forEach(el=>{
      let original=origAttr.get(el);
      if(!original){original={base:{},last:{}};for(const k of ['placeholder','aria-label','title'])original.base[k]=original.last[k]=el.getAttribute(k);origAttr.set(el,original)}
      for(const [attr,value] of Object.entries(original.base)){
       const observed=el.getAttribute(attr);
       if(observed!==original.last[attr])original.base[attr]=observed;
       if(original.base[attr]===null){original.last[attr]=null;continue}
       const next=label(original.base[attr])||original.base[attr];
       if(observed!==next)el.setAttribute(attr,next);
       original.last[attr]=next;
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
  const button=e.target.closest('button[data-set-lang]');
  if(button){
   e.preventDefault();current=button.dataset.setLang;localStorage.setItem('verzum_lang',current);
   renderLanguages();schedule();syncNativeLocale();
  }
  const toggle=e.target.closest('#menu-toggle');
  if(toggle){
   const side=document.querySelector('.sidebar');const isOpen=side.classList.toggle('menu-open');
   toggle.setAttribute('aria-expanded',String(isOpen));toggle.setAttribute('aria-label',isOpen?'Chiudi menu':'Apri menu');
  }
  if(e.target.closest('#navigation [data-nav]')&&window.matchMedia('(max-width:780px)').matches){
   document.querySelector('.sidebar')?.classList.remove('menu-open');
   const toggleBtn=document.querySelector('#menu-toggle');if(toggleBtn)toggleBtn.setAttribute('aria-expanded','false');
  }
 });
 window.VERZUM_LOCALE={get lang(){return current},change(id){if(langs.some(l=>l.id===id)){current=id;localStorage.setItem('verzum_lang',id);renderLanguages();schedule();syncNativeLocale();}},get translations(){return table},normalized};
 document.addEventListener('load',e=>{if(e.target?.matches?.('iframe.native-calculator-frame'))syncNativeLocale()},true);
 window.addEventListener('hashchange',()=>{schedule();syncNativeLocale()});
 schedule();
})();
