# Verifica funzionale VERZUM Tools ITA — 17 novembre 2026

## Ambito
Analisi comparativa del codice di Dumanu.Tools consultabile pubblicamente e della nostra applicazione autonoma. Non rappresenta un'attestazione di identità totale: i risultati sono separati per livello di completamento.

| Area | Stato | Esito e differenze |
| --- | --- | --- |
| Catalogo | Implementato | 147 equipaggiamenti, ID, nomi localizzati e immagini PNG collegate agli item; resta da verificare ogni identificatore del server |
| Potenziamenti | Base equivalente | Intervallo +0/+9, probabilità per passo, fallimenti indipendenti, materiali e Yang ripetuti per tentativo |
| Evoluzioni oggetti | Implementato | 44 evoluzioni selezionabili a +9, con materiali, Yang e percentuale; controllo con toggle e riga dedicata |
| Gaya | Base equivalente | Ricetta NPC, 18 offerte (permanenti/giornaliere), confronto fra prezzo di mercato unitario × quantità e costo in Gaya; prezzi da impostare |
| Pet livello | Parziale | Fasce EXP, snack dal livello previsto, evoluzioni; equivalenza di tutte le esperienze e bonus non verificata |
| Tipo pet (pity) | Implementato | Fallimenti per ogni singolo passaggio, limitati alla soglia garantita del riferimento |
| Abilità pet | Parziale | Tabelle per livelli/materiali/bonus presenti, con selezione e pianificazione; alcuni casi speciali non confrontati |
| Cavalcature | Parziale | Medaglie, evoluzioni, abilità e bonus collezione presenti; tutte le interazioni avanzate da confrontare |
| Costumi pet | Implementato in base | 12 aspetti, bonus, uccisioni richieste, materiali e Yang, selezione multipla |
| Abilità classi | Parziale | Scelta di classe/abilità, progressione M1→P, libri, Pietre delle Anime, opzioni di lettura; verifica delle singole meccaniche speciale ancora necessaria |
| Abilità passive | **Non equivalente** | Calcolo parametrico semplificato; non replica ancora tutti i livelli/libri/bonus del riferimento |
| Pianificatore | Parziale | Aggiunta risultati, somma materiali e Yang; interfaccia originale non replicata in tutte le opzioni |
| Personalizza | Parziale | Ordinamento, larghezza e visibilità pannelli; non equivalente al trascinamento libero e ridimensionamento puntuale dell'originale |
| Prezzi materiali | Gestione presente | Listino editabile, zero = prezzo ancora non impostato; nessuna quotazione di mercato ufficiale integrata |
| Lingue | Interfaccia multilingua | IT/EN/RO/HU con bandiere SVG in header e sidebar, localizzazione dei principali testi; **alcuni testi tecnici non ancora tradotti** |
| Mobile | Collaudo preliminare superato | Browser a 375 e 390 px: larghezza documento uguale alla viewport, menu apribile e 10 sezioni accessibili |
| Palette | Applicata | Nero #0A0303/#060202, bordeaux #2A0C0C, rosso #8E3437, oro #C5996C/#F2DCA4, testo #e6dccb |
| Logo | Provvisorio | Logo tipografico SVG presente; serve il file raster originale dell'immagine inviata per la sostituzione fedele |

## Regressioni numeriche di riferimento
* Spada di Tritone +0→+9, zero fallimenti: **140.000.000 Yang**, esclusi materiali senza prezzo.
* Spada da Battaglia +0→+9, zero fallimenti: **12.250.000 Yang**.
* Spada da Battaglia + evoluzione, zero fallimenti: **62.250.000 Yang**, esclusi materiali senza prezzo.
* Gaya: costo NPC base di **200.000 Yang** più materiali.
* Catalogo: **147** ID unici; **44** evoluzioni; **18** offerte Gaya; **12** costumi pet.

## Verifiche automatiche
Il comando `node scripts/verifica.mjs` controlla sintassi JavaScript, risorse obbligatorie, menu, presenza del catalogo, invarianti matematiche, evoluzioni e palette. È configurato come comando di build in Cloudflare Pages per impedire una distribuzione con controlli statici falliti.

I test statici non sostituiscono la verifica interattiva di ogni formula, opzione e dipendenza. Prima di dichiarare la replica completa occorre completare le voci indicate come *Parziale* o *Non equivalente*.

## Autorizzazioni
Le immagini caricate derivano dal pacchetto PNG fornito per questo progetto. Conservare e verificare le autorizzazioni alla ridistribuzione del pacchetto prima della promozione pubblica alla gilda.
