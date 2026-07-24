# Admin-overblik (/admin)

Founder-dashboard: hvem har oprettet sig + nøgletal på tværs af hele platformen.

- Rute: `/admin` (server component, force-dynamic). Adgang: logget ind OG e-mail i
  `ADMIN_EMAILS` (kommasepareret env) — ellers `notFound()` (siden afsløres ikke).
- Hero-kort: brugere i alt, kunder (privat) i alt, forretninger i alt, boner i alt;
  sekundært: nye brugere 7 dage, boner 7 dage, aktive forretninger 7 dage,
  bridges online (lastSeenAt < 3 min).
- Signups-graf: 14 dage, søjler pr. dag (merchant-brugere + kunder), samme
  mønster som rapport-siden.
- "Seneste signups": tabel med de 20 nyeste (navn, e-mail, type Privat/Forretning
  m/ forretningsnavn, dato). Data fra users+merchants+customers — ingen ny tabel.
- Queries i `lib/db/admin-queries.ts`; i18n-ns `admin` (da/en). Link tilbage til
  /dashboard; ingen nav-integration (siden er kun til grundlæggeren).
