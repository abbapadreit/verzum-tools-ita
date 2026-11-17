# VERZUM Tools ITA – strumenti della gilda

Sito web indipendente, in italiano, distribuibile con **Cloudflare Pages + GitHub**.

> **Stato:** sviluppo v0.4, non ancora replica completa di Dumanu.Tools. Catalogo con 147 equipaggiamenti e immagini PNG del pacchetto fornito, ma prezzi, materiali e percentuali da verificare sul server.

## Struttura del repository

- `public/` – sito HTML, CSS e JavaScript pubblicabile. Il file di ingresso è `public/index.html`.
- `docs/CLOUDFLARE.md` – istruzioni per collegare il repository a Cloudflare Pages.
- `scripts/verifica.mjs` – test statico senza dipendenze esterne.

## Hosting automatico

- **Cloudflare Pages (Git):** https://verzum-tools-ita.pages.dev/
- **Progetto:** `verzum-tools-ita`
- **Sorgente:** `abbapadreit/verzum-tools-ita`, ramo `main`
- **Build:** sito statico, nessun comando; directory di output `public`
- Ogni aggiornamento a `main` attiva un nuovo deployment. Il vecchio sito `verzumtools.pages.dev` resta separato.

## Catalogo e immagini — versione 0.3

Il sito include **147 equipaggiamenti**, con nomi italiani e passaggi numerici estratti come dati di gioco da fonti pubbliche di riferimento. **Non sono stati convalidati per la versione corrente di VERZUM**: prezzi, materiali e probabilità possono differire.

Le icone ora sono le **PNG estratte dall'archivio `VERZUM_TUTTE_LE_IMMAGINI_PNG.zip` fornito dall'utente**: 266 PNG distinti per oggetti/materiali, più nove icone di menu. Le risorse provengono dal sito Dumanu.Tools/Metin2 e i diritti sui singoli file restano ai rispettivi titolari. Il progetto utilizza una matrice che associa 322 ID agli sprite estratti; i duplicati sono condivisi senza copiarne più volte i dati. Le immagini di fantasia precedenti sono state eliminate. Verificare i diritti di redistribuzione prima di condividere pubblicamente il sito.

## Avvio locale

Apri `public/index.html` nel browser, oppure avvia dalla cartella del repository un server HTTP locale: `python -m http.server 8080 --directory public`, poi visita `http://localhost:8080`.

## Verifica

Con Node.js 18 o superiore, esegui `node scripts/verifica.mjs`. Il test controlla la sintassi degli script e i riferimenti principali dell'HTML.

## Aggiornamenti

Il ramo di produzione è `main`. **Dopo aver attivato l'integrazione Git su Cloudflare, ogni push su `main` pubblica automaticamente la nuova versione**. Le modifiche ai file potranno essere eseguite anche dalla chat mediante il collegamento GitHub autorizzato.

## Avvertenze

- Il sito non è ufficiale, non contiene dati di gioco verificati e non deve essere presentato come un calcolatore definitivo.
- I dati degli utenti vengono salvati nel loro browser: la sincronizzazione fra persone richiede un'infrastruttura aggiuntiva.
- Non aggiungere immagini o codice di terze parti senza verificarne i diritti.
