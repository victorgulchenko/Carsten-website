# Das Tandem

Eine kleine deutschsprachige Website aus dem **Reverse Mentoring Victor × Carsten (Jan–Jun 2026)**.
Next.js (App Router) + Tailwind, gebaut für Vercel.

## Was sie kann

1. **KI-News** (`/`, linke Spalte) — die wichtigsten KI-Nachrichten des Tages, je 1–2 sehr
   kurze deutsche Sätze + Quelllink. Frischt sich täglich selbst auf.
2. **Für Carsten** (`/`, rechte Spalte) — filtert aus den Tages-News heraus, was seinem
   **Model Risk Management** wirklich hilft (Modellvalidierung, SAS→Python-Migration,
   Dokumentation, Governance, sicheres Hosting). Jede Notiz knüpft eine Entwicklung an einen
   seiner Prozesse — „Tool X von heute könnte bei Y helfen, weil …". Passt nichts, bleibt die
   Spalte bewusst leer.
3. **Wissen** (`/wissen`) — durchsuchbare Wissensbasis aus `knowledge.md` mit unscharfer
   Volltextsuche (Fuse.js) und Kategorie-Filtern.

Clean, minimal, mobil-freundlich, durchgehend Deutsch.

## Wie der Tagesinhalt entsteht

```
RSS (The Decoder · Heise · t3n)  ─┐
                                  ├─►  Groq (llama-3.3-70b) kuratiert  ─►  Data Cache  ─►  Seite
Carsten-Kontext + knowledge.md   ─┘
```

- **Quellen:** echte Artikel aus den deutschen KI-Feeds (`lib/feeds.ts`). Die RSS-Feeds sind
  schon die tagesaktuelle Nachrichtenlage mit echten Links — eine separate Websuche braucht es
  nicht.
- **Kuratierung:** Groq wählt die wichtigsten Meldungen, schreibt die kurzen deutschen
  Zusammenfassungen und urteilt anhand von Carstens Kontext (`lib/carsten.ts`) + der
  Wissensbasis, was für ihn relevant ist (`lib/generate.ts`). Jede News verweist über eine
  Kandidaten-Nummer auf einen echten RSS-Artikel — so sind halluzinierte Links ausgeschlossen.
- **Modell:** Standard ist `llama-3.3-70b-versatile` (passt ins kostenlose 30k-TPM-Tier).
  `groq/compound` mit integrierter Websuche ist agentisch und überschreitet das Free-Tier-TPM
  schon bei einem Aufruf — sinnvoll erst mit bezahltem Tier (`GROQ_MODEL` setzen).
- **Speicher:** kein externer Store nötig. Der Inhalt liegt im Next.js Data Cache
  (`unstable_cache`, 24 h). Der Cron unter `/api/refresh` verwirft ihn täglich und generiert neu.
- **Degraded-Modus:** ohne `GROQ_API_KEY` rendert die Seite trotzdem voll — echte
  RSS-Schlagzeilen, ruhige Carsten-Spalte. Fällt sogar das aus, greift `data/seed.json`.

## Lokal starten

```bash
npm install
cp .env.example .env.local      # GROQ_API_KEY eintragen (bereits gesetzt, falls vorhanden)
npm run dev                     # http://localhost:3000
```

Tagesinhalt manuell neu ziehen (Dev-Server muss laufen):

```bash
npm run refresh                 # ruft /api/refresh auf
```

## Auf Vercel deployen

1. Repo zu Vercel hinzufügen (Framework wird als Next.js erkannt).
2. **Environment Variables** setzen:
   - `GROQ_API_KEY` — dein Groq-Key (https://console.groq.com/keys)
   - `GROQ_MODEL` — optional, Standard `groq/compound`
   - `CRON_SECRET` — optional; schützt `/api/refresh`. Vercel-Cron sendet ihn automatisch.
3. Deploy. Der tägliche Cron ist in `vercel.json` definiert (`0 5 * * *`, also 05:00 UTC).
   Nach dem ersten Deploy einmal `/api/refresh` aufrufen, damit gleich frischer Inhalt steht.

> **Sicherheit:** `.env.local` ist in `.gitignore` und wird nie eingecheckt. Den Key nur als
> Vercel-Env-Var hinterlegen. Wenn der Key je öffentlich war, im Groq-Console rotieren.

## Wissensbasis pflegen

`/wissen` liest direkt aus `knowledge.md` (Root). Struktur:

```
## Kategorie
### Eintrag
- **Kurz:** …
- **Erklärung:** …
- **Im Mentoring:** …
- **Link:** https://…
- **Tags:** tag1, tag2
```

Einfach Einträge ergänzen — beim nächsten Build/Deploy erscheinen sie automatisch.

## Struktur

```
app/
  page.tsx              KI-News + Für Carsten (zwei Spalten)
  wissen/page.tsx       Wissensbasis (Suche + Filter)
  api/refresh/route.ts  täglicher Refresh (Cron + manuell)
lib/
  feeds.ts              RSS holen + parsen
  groq.ts               Groq-Client (compound)
  generate.ts           RSS + Groq → Tagesinhalt
  content.ts            Data-Cache-Wrapper + Seed-Fallback
  knowledge.ts          knowledge.md parsen
  carsten.ts            Carstens Kontext für die Relevanz
components/             Header, Footer, News-/Carsten-/Wissen-UI
data/seed.json          Notnagel-Inhalt
```
