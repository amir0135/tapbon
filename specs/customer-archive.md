# Spec: Kunde-arkiv — "Mine kvitteringer" (uden konto)

Kunden får et arkiv **på telefonen** uden konto/e-mail (GDPR: nul PII —
privatlivspolitikkens løfte holder). localStorage-nøgle `tapbon-archive`:
array af {id, merchant, totalGross, currency, kind, issuedAt}, dedup på id,
nyeste først, cap 300.

1. `/r/[id]` gemmer automatisk kvitteringen i arkivet ved visning (client-
   komponent m/ summary-props fra serveren) og viser et kort "Dine kvitteringer
   (N)" → `/mine`.
2. `/mine`: offentlig, mobile-first liste — forretning, dato, beløb (eller
   "Fil-bon"), link til /r/id, fjern-knap pr. række. Tom tilstand forklarer
   "tap en stander". Note om at arkivet ligger lokalt på enheden.
Alle strings da/en. Out of scope: konto/sync på tværs af enheder (kræver
shopper-PII → bevidst fravalgt), søgning, eksport.

**v2 — personligt dashboard (Receiptile-mønster):** /mine udvides med
(a) "Denne måned"-kort (forest-baggrund): sum af structured-boner i
indeværende måned pr. dominerende valuta + antal boner; (b) loyalitets-
sektion: scanner localStorage-nøgler `tapbon-loyalty-*`, henter kort via
GET /api/loyalty (udvidet m/ merchantName) og viser mini-stempelkort.
Stadig nul PII — alt afledt af enhedens egen localStorage.
