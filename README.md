# VERZUM Tools ITA – strumenti della gilda

Sito web indipendente, in italiano, distribuibile con **Cloudflare Pages + GitHub**.

> **Stato:** prototipo v0.2, non la replica completa di Dumanu.Tools. Alcuni dati sono di esempio e non sono validati per il gioco. Le immagini del progetto di riferimento non vengono ridistribuite senza autorizzazione.

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

Le icone mostrate automaticamente sono **illustrazioni SVG originali e provvisorie**, generate dal progetto; **non sono gli sprite ufficiali** e non contengono immagini copiate da Dumanu.Tools o dal client di Metin2. È possibile caricare un set PNG/WebP autorizzato nella sezione «Dati di calcolo», usando gli ID degli item: queste icone prevalgono sui disegni provvisori. La pubblicazione di un pacchetto di immagini autentiche richiede una verifica dei diritti.

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
