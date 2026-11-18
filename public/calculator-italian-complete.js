/* Completa la lingua italiana del calcolatore originale:
   mapping esplicito, basato sulle stringhe RO effettivamente presenti nel sorgente.
   Niente traduzioni approssimate su nomi degli oggetti, quantità o formule. */
(function(){
'use strict';
const exact=[
["Mount","Cavalcatura"],
["Dumanu.Tools · date preluate din Verzum Wiki · prețurile tale se salvează în browser","VERZUM Tools · dati della Wiki VERZUM · i prezzi vengono salvati nel tuo browser"],
["/buc","/pz"],
["la fiecare eșec plătești din nou yang-ul și materialele pasului, iar itemul rămâne la nivelul la care era.","Ogni fallimento richiede di nuovo gli Yang e i materiali del passaggio; l'oggetto resta al livello precedente."],
["wiki-ul Verzum nu dă un pity (reușită garantată) pentru fierar, de aceea alegi tu câte eșecuri să iei în calcul. Pity există doar la tipul petului (vezi calculatorul Pet).","La Wiki VERZUM non indica tentativi garantiti per il fabbro: scegli tu quanti fallimenti considerare. La garanzia dopo un numero di tentativi è prevista soltanto per il tipo di pet."],
["Cost / 1 Gaya","Costo per 1 Gaya"],
["Profit = preț piață − Gaya × cost/Gaya. Oferta zilnică se schimbă în fiecare zi; tabelul arată oferta salvată în wiki.","Profitto = prezzo di mercato − (Gaya richiesti × costo per Gaya). L'offerta giornaliera cambia; la tabella mostra l'offerta registrata nella Wiki."],
["Nivel (1–105), tipul petului cu pity din wiki și abilitățile. Fiecare bloc se poate trimite separat în planificator.","Livello del pet (1–105), tipo con garanzia della Wiki e abilità. Ogni sezione può essere aggiunta separatamente al pianificatore."],
["Fiecare încercare consumă un glob. Eșecurile se adună, iar când ajungi la numărul din coloana „Pity”, următoarea încercare reușește sigur.","Ogni tentativo consuma una sfera. I fallimenti si accumulano e, raggiunto il numero indicato nella colonna «Garanzia», il tentativo successivo riesce."],
["Bonus","Bonus"],
["Bifează costumele pe care vrei să le deblochezi. Bonusul fiecăruia e pasiv și rămâne pe personaj pentru totdeauna, chiar dacă nu îl porți.","Seleziona i costumi da sbloccare. Il bonus di ciascuno è passivo e rimane sul personaggio anche quando il costume non è indossato."],
["Ce","Cosa"],
["Apărare împotriva semi-oamenilor","Difesa contro mezziuomini"],
["Putere elementală","Potenza elementale"],
["Daune critice","Danni critici"],
["Pasive","Passive"],
["Mod editare","Modalità modifica"],
["Trage de bara aurie ca să muți o fereastră, de marginea din dreapta ca s-o lățești. Ferestrele nu se suprapun niciodată.","Trascina la barra dorata per spostare una finestra e il bordo destro per allargarla. Le finestre non si sovrappongono."],
["Ferestre ascunse:","Finestre nascoste:"],
["Resetează pagina","Ripristina pagina"],
["Fereastră","Finestra"],
["Calculator","Calcolatore"],
["Rezumat","Riepilogo"],
["Abilitățile clasei","Abilità della classe"],
["Alege clasa și skill-ul, apoi intervalul (M1 → P). Vezi câte cărți și Pietre ale Sufletului îți trebuie, plus timpul de așteptare dintre citiri.","Seleziona la classe, l'abilità e l'intervallo (M1 → P). Scopri quanti libri e Pietre delle Anime servono e l'attesa tra le letture."],
["Alege skill-ul","Seleziona l'abilità"],
["Citit Concentrat la fiecare citire","Lettura Concentrata a ogni lettura"],
["Pergamentul Exorcizării (fără așteptare)","Papiro dell'Esorcismo (senza attesa)"],
["Boabe Zen","Fagioli Zen"],
["Cărți / Pietre","Libri / Pietre"],
["Cu Pergamentul Exorcizării nu aștepți între citiri.","Con il Papiro dell'Esorcismo non è necessario attendere tra le letture."],
["Timp de așteptare (fără Pergament):","Tempo di attesa (senza papiro):"],
["Citiri reușite","Letture riuscite"],
["Eșecuri / Pietre folosite","Fallimenti / Pietre utilizzate"],
["Consum","Consumo"],
["Citit Concentrat","Lettura Concentrata"],
["Maestru (M):","Maestro (M):"],
["la M1 trebuie 1 citire reușită, la M2 două … la M10 zece (din wiki). Alegi câte citiri ratate iei în calcul; cu Citit Concentrat fiecare citire contează sigur.","Per M1 serve una lettura riuscita, per M2 due e così via fino a M10, che ne richiede dieci (dati Wiki). Puoi indicare i fallimenti; con la Lettura Concentrata ogni lettura riesce."],
["Mare maestru (G):","Gran Maestro (G):"],
["fiecare nivel cere o avansare reușită cu Piatra Sufletului; alegi câte pietre ai folosit sau estimezi. Wiki-ul nu dă șansele exacte.","Ogni livello richiede un avanzamento riuscito con la Pietra delle Anime. Puoi indicare quante pietre hai utilizzato o prevedi di usare; la Wiki non specifica probabilità esatte."],
["Efectele skill-ului","Effetti dell'abilità"],
["Valori din wiki pentru nivelul 120 cu 200 la statusul principal.","Valori della Wiki per il livello 120 con 200 punti nella statistica principale."],
["Conducere, Războinic curajos, Războinicul zeului dragon și Campionul temnițelor: câte cărți și obiecte ajutătoare îți trebuie de la un nivel la altul.","Guida, Guerriero Coraggioso, Guerriero del Dio Drago e Campione dei Sotterranei: calcola i libri e gli oggetti di supporto necessari per passare da un livello al successivo."],
["Alege abilitatea","Seleziona l'abilità"],
["Cărțile se fac în Magazinul de abilități (clic dreapta pe Pagina Cărţii Abilităţii) din Carte de Abilitate Pasivă (M/G/P) + pagini.","I libri si creano nel Negozio delle Abilità (clic destro sulla Pagina del Libro delle Abilità) usando un Libro Abilità Passiva (M/G/P) e le pagine richieste."],
["Le cumpăr","Li acquisto"],
["Le fac","Li creo"],
["Pergament (fără așteptare)","Papiro (senza attesa)"],
["Grad","Grado"],
["Normal","Normale"],
["Maestru","Maestro"],
["Mare maestru","Gran Maestro"],
["Citit Concentrat (Pasiv) obligatoriu","Lettura Concentrata (Passiva) obbligatoria"],
["Din wiki:","Dalla Wiki:"],
["la gradul normal o citire reușită = un nivel; de la Maestru, citirile necesare cresc cu unu pe nivel (M1 = 1 … M10 = 10). Am continuat la fel și la G (G1 = 11 … G10 = 20), iar de la G în sus fiecare citire cere Citit Concentrat (Pasiv). Așteptare: 2 ore, la Mare maestru 4 ore.","Al grado normale una lettura riuscita equivale a un livello. Dal grado Maestro il numero di letture aumenta di una per livello (M1 = 1 … M10 = 10). La simulazione estende lo stesso criterio al grado G (G1 = 11 … G10 = 20); dal grado G ogni lettura richiede Lettura Concentrata (Passiva). Attesa: 2 ore, oppure 4 ore per il Gran Maestro."],
["fără așteptare","senza attesa"],
["Ajutătoare","Oggetti di supporto"],
["Ajutătoare (Pasiv)","Supporti (Passiva)"],
["75 pagini","75 pagine"],
["Normal + 25 pagini","Normale + 25 pagine"],
["Normal + Citrin","Normale + Citrino"],
["Ajutătoare:","Supporti:"],
["Conducere folosește Citit Concentrat / Pergamentul Exorcizării normale; celelalte trei folosesc variantele (Pasiv), care se fac din 75 de pagini, din varianta normală + 25 de pagini sau din varianta normală + Piatră Prețioasă de Citrin.","Guida utilizza Lettura Concentrata e Papiro dell'Esorcismo normali. Le altre tre abilità utilizzano le varianti (Passiva), che si creano con 75 pagine, oppure con la versione normale e 25 pagine, oppure con la versione normale e una Pietra Preziosa di Citrino."],
["Maimuță","Scimmia"],
["Orc","Orco"],
["Mistic","Mistico"],
["Păianjen","Ragno"],
["Ingerul cu Coasa","Mietitore"],
["Dragon","Drago"],
["Mini călău","Mini Carnefice"]
];
const map=window.VERZUM_NATIVE_IT_DICTIONARY;
if(!map)return;
for(const [source,translation] of exact)map[source]=translation;
const additionalPatterns=[
 [/^șansă din prima: (.+)$/i,'probabilità al primo tentativo: $1'],
 [/^La nivelul (\d+)$/i,'Al livello $1'],
 [/^de la nivelul (\d+) · max (.+)$/i,'dal livello $1 · max $2'],
 [/^(\d+) prețuri importate$/i,'$1 prezzi importati'],
 [/^Evoluție → (.+)$/i,'Evoluzione → $1'],
 [/^Biscuiții încep de la nivelul 41: (.+)$/i,'I biscotti iniziano dal livello 41: $1'],
 [/^Medalii pe nivel: (.+)$/i,'Medaglie per livello: $1'],
 [/^(\d+) aspecte$/i,'$1 costumi'],
 [/^Grupa (\d+)$/i,'Gruppo $1'],
 [/^(\d+) citiri în total$/i,'$1 letture totali'],
 [/^așteptare: (.+)$/i,'attesa: $1']
];
if(typeof extraPatterns!=='undefined')extraPatterns.push(...additionalPatterns);
if(typeof TRL!=='undefined'){
 const en=parent.VERZUM_EN_TO_IT||{},ro=parent.VERZUM_RO_TO_IT||{};
 for(const [source,english] of TRL){
  if(map[source])continue;
  if(ro[source])map[source]=ro[source];
  else if(en[english])map[source]=en[english];
 }
 const uncovered=TRL.filter(([source])=>!map[source]);
 window.VERZUM_IT_TRANSLATION_AUDIT={total:TRL.length,covered:TRL.length-uncovered.length,missing:uncovered.map(([text])=>text)};
}
/* Prefissi dinamici originali con numeri: bonus, classi e messaggi.
   Sono sostituzioni circoscritte, non un traduttore parola per parola. */
const nativeFragments=[
 ['Tare împotriva Pietrelor metin','Forte contro pietre Metin'],
 ['Tare împotriva monştrilor','Forte contro mostri'],
 ['Puterea împotriva șefilor','Forza contro boss'],
 ['Șansă de drop extra de lingou','Probabilità di drop lingotto extra'],
 ['Atac cu arma/magic','Attacco fisico/magico'],
 ['Putere în temnițe','Forza nei dungeon'],
 ['Tare împotriva semi-oamenilor','Forte contro mezziuomini'],
 ['Bonus pentru atac critic','Bonus danno critico'],
 ['Tare împotriva tuturor elementelor','Forte contro tutti gli elementi'],
 ['Şansă la lovituri pătrunzătoare','Probabilità di colpo trafiggente'],
 ['Șanse de lovitură critică','Probabilità di colpo critico'],
 ['Șansa de a bloca un atac corporal','Possibilità di bloccare un attacco corpo a corpo'],
 ['Apărare împotriva semi-oamenilor','Difesa contro mezziuomini'],
 ['Toate clasele','Tutte le classi'],
 ['Războinic','Guerriero'],['Șaman','Sciamano'],
 ['Nv. ','Liv. '],['evoluție','evoluzione'],['Evoluție','Evoluzione'],
 ['eșecuri','fallimenti'],['Mount: ','Cavalcatura: ']
].sort((a,b)=>b[0].length-a[0].length);
window.VERZUM_NATIVE_IT_DYNAMIC=function(source){
 const s=String(source||''),trimmed=s.trim();
 for(const [ro,it] of nativeFragments){
  if(!trimmed.startsWith(ro))continue;
  if(trimmed.length>ro.length&&!/\s|[+%:,.()]/.test(trimmed[ro.length]))continue;
  return s.replace(trimmed,it+trimmed.slice(ro.length));
 }
 return s;
};
if(typeof extraPatterns!=='undefined'){
 extraPatterns.push(
 [/^1 Gaya = (.+?) \+ (.+?) \+ (.+?) yang\. Completează .*$/i,'1 Gaya = $1 + $2 + $3 Yang. Inserisci i prezzi dei materiali per conoscere il costo effettivo e confrontare le offerte.'],
 [/^din (\d+) \(nv\. (.+)\)$/i,'di $1 (livello $2)']
 );
}
if(parent?.VERZUM_LOCALE?.lang==='it'&&typeof setLang==='function')setLang('it');
})();