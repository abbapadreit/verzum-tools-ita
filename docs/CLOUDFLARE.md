# Collegamento GitHub → Cloudflare Pages

**Obiettivo:** pubblicare VERZUM Tools automaticamente dal repository GitHub. Evitare nuovi caricamenti ZIP per ogni aggiornamento.

## Repository pronto

Repository: `abbapadreit/verzum-tools-ita`. Codice statico in `public/`; produzione sul ramo `main`.

## Crea un progetto Pages collegato a Git

Cloudflare → **Workers & Pages** → **Create application / Pages** → **Connect to Git** → scegli GitHub, autorizza l'accesso al repository e seleziona `abbapadreit/verzum-tools-ita`.

Configurazione:

- Framework preset: `None`
- Production branch: `main`
- Build command: lascia vuoto
- Build output directory: `public`
- Root directory: `/` (predefinita)

## Progetto Pages precedente

I progetti creati con **Direct Upload** non possono essere convertiti a Git integration sullo stesso progetto. Se `verzumtools` è un progetto Direct Upload, crea temporaneamente un progetto Git-integrato con altro nome. **Non cancellare `verzumtools`** prima del collaudo e della successiva migrazione del dominio.

Se il progetto esistente è già Git-integrato, controlla la connessione in Settings/Builds prima di crearne un altro.

## Aggiornamenti

Ogni commit su `main` nel repository collegato attiva un deployment di produzione. Le altre branch possono produrre anteprime.

## Collaudo

Controlla che CSS, JavaScript, tutte le sezioni, prezzi, personalizzazione e salvataggio locale funzionino. Questa versione v0.2 contiene ancora valori dimostrativi e NON è una replica completa o verificata dei dati di Dumanu.Tools.

Riferimenti:
- https://developers.cloudflare.com/pages/get-started/git-integration/
- https://developers.cloudflare.com/pages/get-started/direct-upload/
