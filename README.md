# Agentur-Starter: Astro + Keystatic

Ein wiederverwendbares Grundgerüst für SEO-Kundenseiten: statisches Astro-
Frontend, Inhalte über einen einfachen Browser-Editor (Keystatic) pflegbar,
ohne Datenbank und ohne separates CMS-Hosting.

## Architektur — kurz erklärt

Es gibt zwei getrennte Jobs mit zwei unterschiedlichen Laufzeiten:

1. **Die öffentliche Seite** wird zu reinem statischem HTML gebaut
   (`npm run build`). Kein Server nötig, hostbar auf Cloudflare Pages,
   Netlify, GitHub Pages — überall.
2. **Der Keystatic-Editor** (`/keystatic`) braucht einen echten Node-Prozess,
   um Dateien zu lesen/schreiben — entweder lokal auf der Festplatte (Dev)
   oder über die GitHub-API (Produktion, "github"-Storage-Modus).

Deshalb ist die Keystatic-Integration in `astro.config.mjs` bewusst nur
außerhalb von Produktions-Builds aktiv (`isDev`-Flag). Das ist kein
Kompromiss, sondern der von der Keystatic-Community empfohlene Weg — siehe
"Live-Editor für Kunden" weiter unten.

> **Wichtiger Hinweis:** Bei der Entwicklung dieses Starters hat sich
> gezeigt, dass Keystatics Datei-Lese-Layer im Cloudflare-Workers-Sandbox
> (`@astrojs/cloudflare`) nicht zuverlässig funktioniert — Inhalte wurden
> beim Build teils gar nicht gefunden. Für den **Live-Editor in Produktion**
> daher **Vercel** verwenden (siehe unten), nicht Cloudflare Workers. Die
> öffentliche, statische Seite lässt sich trotzdem problemlos auf Cloudflare
> Pages hosten — das betrifft nur die `/keystatic`-Route.

## Lokal starten

```bash
npm install
npm run dev
```

- Öffentliche Seite: http://127.0.0.1:4321/
- Editor: http://127.0.0.1:4321/keystatic (Local Mode — schreibt direkt in
  `src/content/`, du committest und pushst die Änderungen selbst)

## Content-Struktur

Definiert in `keystatic.config.ts`:

- **Site settings** (Singleton) — Name, Logo, Kontakt, Social Links, Default-SEO
- **Homepage** (Singleton) — Hero + frei sortierbare Content-Blöcke
  (Text, Feature-Grid, CTA-Banner)
- **Pages** (Collection) — freie Unterseiten wie "Über uns", "Kontakt"
- **Blog posts** (Collection) — optional, falls der Kunde einen Blog will

Jeder Eintrag mit Markdoc-Textfeld liegt als **eine Datei** mit
YAML-Frontmatter, z. B.:

```
---
title: Über uns
seoDescription: ...
---
Der eigentliche Text kommt hier rein.
```

Kein separates `index.yaml` + `content.mdoc` — Keystatic erwartet bei dieser
Konfiguration (`format: { contentField: 'content' }`, Pfad ohne
Trailing-Slash) genau dieses kombinierte Format.

## Neues Kundenprojekt aus diesem Starter

1. Repo klonen / Template verwenden, neues GitHub-Repo für den Kunden anlegen
2. Platzhalter-Inhalte in `src/content/` ersetzen (Site-Settings, Homepage, Beispielseiten/-post löschen oder anpassen)
3. Design/Farben in `src/layouts/BaseLayout.astro` und den Seiten-Styles anpassen
4. Deployment einrichten (siehe unten)

## Deployment — öffentliche Seite (Cloudflare Pages)

1. Repo mit Cloudflare Pages verbinden
2. Build command: `npm run build`
3. Output directory: `dist`
4. Fertig — bei jedem Push auf den Main-Branch wird neu gebaut und deployt

Das ist die gesamte Konfiguration. Kein Adapter, kein Workers-Setup nötig,
da der Produktions-Build rein statisch ist.

## Live-Editor für Kunden (GitHub-Modus, Produktion)

Für einen Browser-Editor ohne lokale Entwicklungsumgebung brauchst du eine
**zweite, kleine SSR-Deployment** desselben Repos auf einem Node-fähigen
Host. Empfehlung: **Vercel**.

### 1. GitHub App anlegen (einmalig pro Kunde, oder eine App mit auf das
   jeweilige Repo begrenztem Zugriff)

- GitHub → Settings → Developer settings → GitHub Apps → New GitHub App
- **Repository permissions**: Contents (Read & write), Metadata (Read-only)
- **Nur auf das Kundenrepo beschränken** — niemals eine App mit
  Organisations-weitem Zugriff für mehrere Kunden wiederverwenden
- Callback URL: `https://<deine-vercel-domain>/api/keystatic/github/oauth/callback`
- Nach dem Anlegen: Client ID, Client Secret notieren, außerdem einen
  eigenen Private Key generieren

### 2. Umgebungsvariablen setzen (in Vercel, nicht im Repo!)

```
KEYSTATIC_GITHUB_CLIENT_ID=...
KEYSTATIC_GITHUB_CLIENT_SECRET=...
KEYSTATIC_SECRET=<mit "openssl rand -base64 32" erzeugen>
```

### 3. `keystatic.config.ts` anpassen

Trage `owner` und `name` des Ziel-Repos ein (siehe Kommentar im Storage-Block
oben in der Datei).

### 4. Für die Vercel-Deployment eine eigene, separate Astro-Config-Variante
   verwenden, die die Keystatic-Integration **immer** lädt (nicht nur im
   Dev-Modus) und einen SSR-Adapter nutzt (`@astrojs/vercel`). Die
   öffentliche Seite bleibt dabei trotzdem größtenteils statisch
   (`export const prerender = true` in jeder Public-Page) — nur `/keystatic`
   läuft serverseitig.

Damit bekommt der Kunde eine Editor-URL auf der Vercel-Deployment, während
die eigentliche, schnelle öffentliche Seite weiter über Cloudflare Pages
ausgeliefert wird.

## Sicherheits-Checkliste pro Kunde

- [ ] GitHub App ist auf **genau ein** Repo beschränkt
- [ ] `KEYSTATIC_SECRET` und Client-Secret sind pro Projekt einzigartig,
      liegen nur in Umgebungsvariablen, nie im Repo
- [ ] Nur die gewünschten GitHub-Accounts haben Zugriff auf das Repo
- [ ] Bei Keystatic Cloud (optional, für Bilder-Upload/Multiplayer):
      geprüft, welche Daten dort durchlaufen (im Wesentlichen Auth-Tokens)
